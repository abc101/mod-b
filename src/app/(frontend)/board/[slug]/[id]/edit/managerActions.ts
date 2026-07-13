'use server'

import type { Payload } from 'payload'
import type { Post, User } from '@/types/payload'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'

import { isBoardManager } from '@/lib/board-manager'
import { audit } from '@/lib/community/server'
import { getRelation } from '@/lib/relations'

async function getCurrentUser() {
  const headers = await getHeaders()
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({ headers })

  if (!user) {
    throw new Error('Login required.')
  }

  return {
    payload,
    user: user as User,
    headers,
  }
}

async function assertCanManagePost(
  payload: Payload,
  user: User,
  postId: number | string,
): Promise<Post> {
  const post = await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 2,
    overrideAccess: true,
  })

  if (!post) {
    throw new Error('Post not found.')
  }

  const board = getRelation(post.board)

  if (!board) {
    throw new Error('Board not found.')
  }

  const canManage =
    user.role === 'admin' ||
    isBoardManager(user, board)

  if (!canManage) {
    throw new Error('Not authorized.')
  }

  const author = getRelation(post.author)

  if (
    user.role === 'manager' &&
    author?.role === 'admin'
  ) {
    throw new Error('Managers cannot manage admin posts.')
  }

  return post
}

export async function managerSoftDeletePost(
  postId: number | string,
) {
  const {
    payload,
    user,
    headers,
  } = await getCurrentUser()

  const post = await assertCanManagePost(
    payload,
    user,
    postId,
  )

  const board = getRelation(post.board)

  const updatedPost = await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      isDeleted: true,
      status: 'deleted',
      deletedAt: new Date().toISOString(),
      deletedBy: user.id,
    },
    overrideAccess: true,
  })

  await audit({
    payload,
    headers,
    user,
    action: 'moderate',
    resource: updatedPost,
    message: 'Manager soft deleted the post.',
  })

  if (board?.slug) {
    const encodedSlug = encodeURIComponent(board.slug)

    revalidatePath(`/board/${encodedSlug}`)
    revalidatePath(`/board/${encodedSlug}/${post.id}`)
  }
}

export async function managerToggleNoticePost(
  postId: number | string,
  nextValue: boolean,
) {
  const {
    payload,
    user,
    headers,
  } = await getCurrentUser()

  const post = await assertCanManagePost(
    payload,
    user,
    postId,
  )

  const board = getRelation(post.board)

  const updatedPost = await payload.update({
    collection: 'posts',
    id: post.id,
    data: {
      isNotice: nextValue,
    },
    overrideAccess: true,
  })

  await audit({
    payload,
    headers,
    user,
    action: 'moderate',
    resource: updatedPost,
    message: nextValue
      ? 'Notice enabled.'
      : 'Notice disabled.',
  })

  if (board?.slug) {
    const encodedSlug = encodeURIComponent(board.slug)

    revalidatePath(`/board/${encodedSlug}`)
    revalidatePath(`/board/${encodedSlug}/${post.id}`)
  }
}