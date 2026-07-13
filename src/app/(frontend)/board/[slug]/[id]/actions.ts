'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { canWriteComment, isBoardManager } from '@/lib/board-permissions'
import { getPostById } from '@/lib/services/posts'
import {
  createAnonymousName,
  getClientIp,
  getUserAgent,
  hashAnonymousPassword,
  validateAnonymousPassword,
} from '@/lib/community/server'
import { rateLimit } from '@/lib/rate-limit'
import { verifyTurnstileToken } from '@/lib/turnstile'
import { audit } from '@/lib/community/server'
import { validateForbiddenWords } from '@/lib/forbidden-words'
import { notify } from '@/lib/community/server'
import { processMentions } from '@/lib/community/server'
import { getRelation, getRelationId } from '@/lib/relations'

export async function submitComment(formData: FormData) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const content = formData.get('content') as string
  const postId = formData.get('postId') as string
  const parentCommentId = formData.get('parentCommentId') as string | null
  const boardSlug = formData.get('boardSlug') as string
  const anonymousPassword = formData.get('anonymousPassword') as string | null
  
  await validateForbiddenWords({
    payload,
    text: content,
    type: 'content',
  })

  if (!content?.trim()) throw new Error('Content is required.')

  const post = await getPostById({
    payload,
    id: parseInt(postId, 10),
    depth: 2,
    overrideAccess: true,
  }) as any

  if (!post) throw new Error('Post not found.')

  const board = post.board
  if (!board) throw new Error('Board not found.')

  if (board.writeSettings?.allowComment === false) {
    throw new Error('Comments are disabled for this board.')
  }

  const allowAnonymousComment =
    board.writeSettings?.allowAnonymousComment === true

  if (user) {
    rateLimit({
      key: `authenticated-comment:${user.id}`,
      limit: 10,
      windowMs: 60 * 1000,
    })

    if (!canWriteComment(user, board)) {
      throw new Error('You do not have permission to comment on this board.')
    }
  } else {
    if (!allowAnonymousComment) {
      throw new Error('Login required.')
    }
  }

  const data: any = {
    post: parseInt(postId, 10),
    content: content.trim(),
    isDeleted: false,
    ...(parentCommentId
      ? { parentComment: parseInt(parentCommentId, 10) }
      : {}),
  }

  if (user) {
    data.author = user.id
  } else {
    const turnstileToken = String(formData.get('turnstileToken') || '')
    await verifyTurnstileToken(turnstileToken)

    const password = validateAnonymousPassword(anonymousPassword || '')
    const ip = getClientIp(headers)

    rateLimit({
      key: `anonymous-comment:${ip}`,
      limit: 5,
      windowMs: 60 * 1000,
    })

    data.anonymousAuthor = createAnonymousName(ip)
    data.anonymousIp = ip
    data.anonymousUserAgent = getUserAgent(headers)
    data.anonymousPasswordHash = await hashAnonymousPassword(password)
  }

  const comment = await payload.create({
    collection: 'comments',
    data,
    overrideAccess: true,
    req: user ? ({ headers, user } as any) : undefined,
  })

  await audit({
    payload,
    headers,
    user,
    action: 'create',
    resource: comment,
    metadata: {
      postId,
      parentCommentId,
      isAnonymous: !user,
    },
  })

  const commentPost = getRelation(comment.post)

  const postAuthorId =
    getRelationId(commentPost?.author) ??
    getRelationId(post.author)

  if (parentCommentId) {
    const parentComment = await payload.findByID({
      collection: 'comments',
      id: Number(parentCommentId),
      depth: 1,
      overrideAccess: true,
    }) as any

    const parentAuthorId =
      parentComment?.author?.id || parentComment?.author

    if (parentAuthorId && String(parentAuthorId) !== String(user?.id || '')) {
      await notify({
        payload,
        recipientId: parentAuthorId,
        type: 'reply',
        title: 'New reply to your comment',
        message: content.slice(0, 120),
        href: `/board/${boardSlug}/${postId}`,
        metadata: { postId, commentId: comment.id },
      })
    }
  } else if (postAuthorId && String(postAuthorId) !== String(user?.id || '')) {
    await notify({
      payload,
      recipientId: postAuthorId,
      type: 'comment',
      title: 'New comment on your post',
      message: content.slice(0, 120),
      href: `/board/${boardSlug}/${postId}`,
      metadata: { postId, commentId: comment.id },
    })

  }

  await processMentions({
    payload,
    actorId: user?.id,
    currentText: content.trim(),
    href: `/board/${boardSlug}/${postId}`,
    message: content.trim().slice(0, 120),
    metadata: {
      postId,
      commentId: comment.id,
    },
  })
  
  revalidatePath(`/board/${boardSlug}/${postId}`)
}

export async function incrementViewCount(postId: number, currentCount: number) {
  const cookieStore = await cookies()
  const viewedKey = `post_viewed_${postId}`

  if (cookieStore.get(viewedKey)) return

  const payload = await getPayload({ config: configPromise })

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      viewCount: currentCount + 1,
    },
    overrideAccess: true,
  })

  cookieStore.set(viewedKey, '1', {
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

export async function toggleLikePost(postId: number, currentLikes: number) {
  const cookieStore = await cookies()
  const likedKey = `post_liked_${postId}`

  if (cookieStore.get(likedKey)) {
    throw new Error('Already liked this post')
  }

  const payload = await getPayload({ config: configPromise })

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      likeCount: currentLikes + 1,
    },
    overrideAccess: true,
  })

  cookieStore.set(likedKey, '1', {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
  })
}

export async function toggleQnaAnswered(postId: number, slug: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const post = await getPostById({
    payload,
    id: postId,
    depth: 2,
    overrideAccess: true,
  }) as any

  if (!post) throw new Error('Post not found.')

  const board = post.board

  if (!board || board.boardType !== 'qna') {
    throw new Error('This is not a Q&A post.')
  }

  const canManage =
    (user as any).role === 'admin' ||
    isBoardManager(user, board)

  if (!canManage) {
    throw new Error('You do not have permission to manage this Q&A post.')
  }

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      isAnswered: !post.isAnswered,
    },
    overrideAccess: true,
  })

  revalidatePath(`/board/${slug}/${postId}`)
  revalidatePath(`/board/${slug}`)
}