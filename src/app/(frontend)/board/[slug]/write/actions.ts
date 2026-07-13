'use server'

import type { Board, Post, User } from '@/types/payload'
import type { PostCreateData } from '@/types/community'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { isBoardManager } from '@/lib/board-manager'
import {
  createAnonymousName,
  getClientIp,
  getUserAgent,
  hashAnonymousPassword,
  validateAnonymousPassword,
  ANONYMOUS_ACCESS_COOKIE,
  ANONYMOUS_ACCESS_MAX_AGE,
  setAnonymousAccessEntry,
} from '@/lib/community/server'
import { rateLimit } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { audit } from '@/lib/community/server'
import { validateForbiddenWords } from '@/lib/forbidden-words'
import { processMentions } from '@/lib/community/server'
import { sanitizeEditorHtml } from '@/lib/security/sanitize-content-html'

export async function createPost(
  boardSlug: string,
  boardId: number,
  formData: FormData,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const board = (await payload.findByID({
    collection: 'boards',
    id: boardId,
    depth: 2,
    overrideAccess: true,
  })) as Board | null

  if (!board) throw new Error('Board not found.')

  const isAdmin = currentUser?.role === 'admin'
  const isManager = !!currentUser && isBoardManager(currentUser, board)
  const isLoggedIn = !!currentUser

  const allowWrite = board.writeSettings?.allowWrite || 'member'
  const allowAnonymous = board.writeSettings?.allowAnonymous === true

  const canWrite =
    (allowWrite === 'member' && isLoggedIn) ||
    (allowWrite === 'admin' && isAdmin) ||
    (allowWrite === 'manager' && (isAdmin || isManager)) ||
    (!isLoggedIn && allowAnonymous)

  if (!canWrite) {
    throw new Error('No permission to write on this board.')
  }

  const title = String(
    formData.get('title') || '',
  ).trim()

  const rawContentHtml = String(
    formData.get('contentHtml') || '',
  ).trim()

  const contentHtml =
    currentUser?.role === 'admin'
      ? rawContentHtml
      : sanitizeEditorHtml(rawContentHtml)

  const isSecret =
    formData.get('isSecret') === 'true'

  const tags = String(formData.get('tags') || '')
  const thumbnailId = String(formData.get('thumbnailId') || '')

  const attachmentIds = JSON.parse(
    String(formData.get('attachmentIds') || '[]'),
  ) as number[]

  const anonymousNickname = String(
    formData.get('anonymousNickname') || '',
  ).trim()

  if (!title) throw new Error('Title is required.')
  if (!contentHtml) throw new Error('Content is required.')

  await validateForbiddenWords({
    payload,
    text: `${title} ${contentHtml} ${tags}`,
    type: 'content',
  })

  if (anonymousNickname) {
    await validateForbiddenWords({
      payload,
      text: anonymousNickname,
      type: 'name',
    })
  }

  const tagList = tags
    ? tags
        .split(',')
        .map((tag) => ({ tag: tag.trim() }))
        .filter((item) => item.tag)
    : []

  const requestedStatus = String(formData.get('status') || 'published')
  const status = requestedStatus === 'draft' ? 'draft' : 'published'

  const data: PostCreateData = {
    title,
    board: boardId,
    status,
    isDeleted: false,
    isSecret,
    contentHtml,
    useHtmlContent: true,
    tags: tagList,
    attachments: attachmentIds.map((id) => ({ file: id })),
    ...(thumbnailId ? { thumbnail: parseInt(thumbnailId, 10) } : {}),
  }

  if (currentUser) {
    rateLimit({
      key: `post:${currentUser.id}`,
      limit: 5,
      windowMs: 60 * 1000,
    })

    data.author = currentUser.id
  } else {
    const turnstileToken = String(formData.get('turnstileToken') || '')
    await verifyTurnstileToken(turnstileToken)

    const anonymousPassword = validateAnonymousPassword(
      String(formData.get('anonymousPassword') || ''),
    )

    const ip = getClientIp(headers)
    const userAgent = getUserAgent(headers)

    rateLimit({
      key: `anonymous-post:${ip}`,
      limit: 2,
      windowMs: 60 * 1000,
    })

    data.anonymousAuthor = anonymousNickname || createAnonymousName(ip)
    data.anonymousIp = ip
    data.anonymousUserAgent = userAgent
    data.anonymousPasswordHash = await hashAnonymousPassword(anonymousPassword)
  }

  const post = (await payload.create({
    collection: 'posts',
    data,
    overrideAccess: true,
    req: currentUser ? ({ headers, user: currentUser } as any) : undefined,
  })) as Post

  await processMentions({
    payload,
    actorId: currentUser?.id,
    currentText: `${title}\n${contentHtml}`,
    href: `/board/${boardSlug}/${post.id}`,
    message: title,
    metadata: {
      postId: post.id,
    },
  })

  if (!currentUser && post.anonymousPasswordHash) {
    const cookieStore = await cookies()
    const currentValue = cookieStore.get(ANONYMOUS_ACCESS_COOKIE)?.value

    const nextValue = setAnonymousAccessEntry({
      currentValue,
      type: 'post',
      id: post.id,
      passwordHash: post.anonymousPasswordHash,
    })

    cookieStore.set(ANONYMOUS_ACCESS_COOKIE, nextValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ANONYMOUS_ACCESS_MAX_AGE,
    })
  }

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'create',
    resource: post,
  })

  if (status === 'draft') {
    revalidatePath(`/board/${boardSlug}`)
    redirect('/my-page/posts/?status=draft')
  }

  revalidatePath(`/board/${boardSlug}`)
  redirect(`/board/${boardSlug}/${post.id}`)
}