'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { requirePostPermission, requireCommentPermission } from '@/lib/community/server'
import { audit } from '@/lib/community/server'
import { validateForbiddenWords } from '@/lib/forbidden-words'
import { processMentions } from '@/lib/community/server'

import type { Comment, Post, User } from '@/types/payload'
import { getRelationId } from '@/lib/relations'
import { sanitizeEditorHtml } from '@/lib/security/sanitize-content-html'

type ExistingAttachment = {
  file?: number | string | { id: number | string } | null
}

type PostUpdateData = {
  title: string
  isSecret: boolean
  tags: { tag: string }[]
  attachments: { file: number }[]
  thumbnail: number | null
  status: 'draft' | 'published'
  contentHtml?: string
  useHtmlContent?: boolean
}

export async function updatePost(
  postId: number,
  boardSlug: string,
  formData: FormData,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const post = (await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    overrideAccess: true,
  })) as Post | null

  if (!post) throw new Error('Post not found.')

  const anonymousPassword = formData.get('anonymousPassword') as string | null

  await requirePostPermission({
    user: currentUser,
    post,
    password: anonymousPassword,
  })

  const title = String(
    formData.get('title') || '',
  )

  const content = String(
    formData.get('content') || '',
  )

  const rawContentHtml = String(
    formData.get('contentHtml') || '',
  )

  const editorContentHtml =
    rawContentHtml || content

  const contentHtml =
    currentUser?.role === 'admin'
      ? editorContentHtml
      : sanitizeEditorHtml(editorContentHtml)

  const isSecret =
    formData.get('isSecret') === 'true'

  const tags = formData.get('tags') as string
  const requestedStatus = String(formData.get('status') || post.status)

  const nextStatus: 'draft' | 'published' =
    post.status === 'published'
      ? 'published'
      : requestedStatus === 'published'
        ? 'published'
        : 'draft'

  await validateForbiddenWords({
    payload,
    text: `${title} ${contentHtml || content} ${tags}`,
    type: 'content',
  })

  const existingAttachments = JSON.parse(
    (formData.get('existingAttachments') as string) || '[]',
  ) as ExistingAttachment[]

  const newAttachmentIds = JSON.parse(
    (formData.get('newAttachmentIds') as string) || '[]',
  ) as number[]

  const removeFeaturedImage = formData.get('removeFeaturedImage') === 'true'
  const existingFeaturedImageId = formData.get('existingFeaturedImageId') as string
  const newFeaturedImageId = formData.get('newFeaturedImageId') as string

  const tagList = tags
    ? tags
        .split(',')
        .map((tag) => ({ tag: tag.trim() }))
        .filter((item) => item.tag)
    : []

  const attachments = [
    ...existingAttachments
      .map((att) => getRelationId(att.file))
      .filter((id): id is number => typeof id === 'number')
      .map((id) => ({
        file: id,
      })),

    ...newAttachmentIds.map((id) => ({
      file: id,
    })),
  ]

  let thumbnail: number | null = null

  if (removeFeaturedImage) {
    thumbnail = null
  } else if (newFeaturedImageId) {
    thumbnail = parseInt(newFeaturedImageId, 10)
  } else if (existingFeaturedImageId) {
    thumbnail = parseInt(existingFeaturedImageId, 10)
  }

  const data: PostUpdateData = {
    title,
    isSecret,
    tags: tagList,
    attachments,
    thumbnail: thumbnail || null,
    status: nextStatus,
  }

  data.contentHtml = contentHtml
  data.useHtmlContent = true

  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data,
    overrideAccess: true,
    req: currentUser ? ({ headers, user: currentUser } as any) : undefined,
  })

  await processMentions({
    payload,
    actorId: currentUser?.id,
    previousText: `${post.title}\n${post.contentHtml || ''}`,
    currentText: `${title}\n${contentHtml}`,
    href: `/board/${boardSlug}/${postId}`,
    message: contentHtml.slice(0, 120),
    metadata: {
      postId,
    },
  })

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'update',
    resource: updatedPost,
    metadata: {
      boardId: getRelationId(post.board),
      isSecret: post.isSecret,
    },
  })

  revalidatePath(`/board/${boardSlug}`)
  revalidatePath(`/board/${boardSlug}/${postId}`)
  revalidatePath('/my-page/posts')

  return {
    status: nextStatus,
    href:
      nextStatus === 'draft'
        ? `/board/${boardSlug}/${postId}/edit?saved=draft`
        : `/board/${boardSlug}/${postId}`,
  }
}

export async function deletePost(
  postId: number,
  boardSlug: string,
  anonymousPassword?: string,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const post = (await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 1,
    overrideAccess: true,
  })) as Post | null

  if (!post) throw new Error('Post not found.')

  await requirePostPermission({
    user: currentUser,
    post,
    password: anonymousPassword,
  })

  const updatedPost = await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: currentUser?.id || null,
      status: 'deleted',
    },
    overrideAccess: true,
    req: currentUser ? ({ headers, user: currentUser } as any) : undefined,
  })

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'delete',
    resource: updatedPost,
  })

  revalidatePath(`/board/${boardSlug}`)
  redirect(`/board/${boardSlug}`)
}

export async function updateComment(
  commentId: number,
  postId: number,
  boardSlug: string,
  content: string,
  anonymousPassword?: string,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  if (!content.trim()) {
    throw new Error('Content is required.')
  }

  const comment = (await payload.findByID({
    collection: 'comments',
    id: commentId,
    depth: 1,
    overrideAccess: true,
  })) as Comment | null

  if (!comment) throw new Error('Comment not found.')

  await requireCommentPermission({
    user: currentUser,
    comment,
    password: anonymousPassword,
  })

  const updatedComment = await payload.update({
    collection: 'comments',
    id: commentId,
    data: {
      content: content.trim(),
    },
    overrideAccess: true,
    req: currentUser ? ({ headers, user: currentUser } as any) : undefined,
  })

  await processMentions({
    payload,
    actorId: currentUser?.id,
    previousText: comment.content,
    currentText: content,
    href: `/board/${boardSlug}/${postId}`,
    message: content.slice(0, 120),
    metadata: {
      postId,
      commentId,
    },
  })

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'update',
    resource: updatedComment,
  })

  revalidatePath(`/board/${boardSlug}/${postId}`)
}

export async function deleteComment(
  commentId: number,
  postId: number,
  boardSlug: string,
  anonymousPassword?: string,
) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const comment = (await payload.findByID({
    collection: 'comments',
    id: commentId,
    depth: 1,
    overrideAccess: true,
  })) as Comment | null

  if (!comment) throw new Error('Comment not found.')

  await requireCommentPermission({
    user: currentUser,
    comment,
    password: anonymousPassword,
  })

  const updatedComment = await payload.update({
    collection: 'comments',
    id: commentId,
    data: {
      isDeleted: true,
    },
    overrideAccess: true,
    req: currentUser ? ({ headers, user: currentUser } as any) : undefined,
  })

  await audit({
    payload,
    headers,
    user: currentUser,
    action: 'delete',
    resource: updatedComment,
  })

  revalidatePath(`/board/${boardSlug}/${postId}`)
}