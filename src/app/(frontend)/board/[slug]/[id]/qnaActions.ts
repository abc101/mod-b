'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { revalidatePath } from 'next/cache'
import { notify } from '@/lib/community/server'

export async function acceptAnswer(commentId: number, postId: number, boardSlug: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 1 }) as any
  if (!post) throw new Error('Post not found.')

  const comment = await payload.findByID({
    collection: 'comments',
    id: commentId,
    depth: 1,
    overrideAccess: true,
  }) as any

  if (!comment) {
    throw new Error('Comment not found.')
  }

  // Only post author or admin can accept answer
  const postAuthorId =
    post.author?.id || post.author

  const canAccept =
    (user as any).role === 'admin' ||
    String(postAuthorId) === String(user.id)

  if (!canAccept) throw new Error('No permission.')

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      isAnswered: true,
      acceptedCommentId: commentId,
    },
    req: { headers } as any,
  })

  const answerAuthorId =
    comment.author?.id || comment.author

  if (
    answerAuthorId &&
    String(answerAuthorId) !== String(user.id)
  ) {
    await notify({
      payload,
      recipientId: answerAuthorId,
      type: 'qna_accepted',
      title: 'Your answer was accepted',
      message: post.title,
      href: `/board/${boardSlug}/${postId}`,
      metadata: {
        postId,
        commentId,
      },
    })
  }

  revalidatePath(`/board/${boardSlug}/${postId}`)
}

export async function unacceptAnswer(postId: number, boardSlug: string) {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) throw new Error('Login required.')

  const post = await payload.findByID({ collection: 'posts', id: postId, depth: 1 }) as any
  if (!post) throw new Error('Post not found.')

  const canUnaccept = (user as any).role === 'admin' || post.author?.id === user.id
  if (!canUnaccept) throw new Error('No permission.')

  await payload.update({
    collection: 'posts',
    id: postId,
    data: {
      isAnswered: false,
      acceptedCommentId: null,
    },
    req: { headers } as any,
  })

  revalidatePath(`/board/${boardSlug}/${postId}`)
}
