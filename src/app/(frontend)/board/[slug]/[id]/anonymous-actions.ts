'use server'

import type { Comment, Post } from '@/types/payload'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  cookies,
  headers as getHeaders,
} from 'next/headers'

import {
  ANONYMOUS_ACCESS_COOKIE,
  ANONYMOUS_ACCESS_MAX_AGE,
  audit,
  setAnonymousAccessEntry,
  verifyAnonymousPassword,
} from '@/lib/community/server'

export async function verifyAnonymousPostPassword(
  postId: number,
  password: string,
) {
  const payload = await getPayload({
    config: configPromise,
  })

  const headers = await getHeaders()

  const post = (await payload.findByID({
    collection: 'posts',
    id: postId,
    depth: 0,
    overrideAccess: true,
  })) as Post | null

  if (!post) {
    throw new Error('Post not found.')
  }

  if (!post.anonymousPasswordHash) {
    throw new Error(
      'This is not an anonymous post.',
    )
  }

  const passwordHash =
    post.anonymousPasswordHash

  const verified =
    await verifyAnonymousPassword({
      password,
      passwordHash,
    })

  if (!verified) {
    throw new Error('Incorrect password.')
  }

  const cookieStore = await cookies()

  const currentValue =
    cookieStore.get(
      ANONYMOUS_ACCESS_COOKIE,
    )?.value

  const nextValue =
    setAnonymousAccessEntry({
      currentValue,
      type: 'post',
      id: post.id,
      passwordHash,
    })

  cookieStore.set(
    ANONYMOUS_ACCESS_COOKIE,
    nextValue,
    {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        process.env.NODE_ENV ===
        'production',
      path: '/',
      maxAge:
        ANONYMOUS_ACCESS_MAX_AGE,
    },
  )

  await audit({
    payload,
    headers,
    action: 'verify',
    resourceType: 'post',
    resource: post,
    message:
      'Anonymous post password verified.',
  })

  return {
    success: true,
  }
}

export async function verifyAnonymousCommentPassword(
  commentId: number,
  password: string,
) {
  const payload = await getPayload({
    config: configPromise,
  })

  const headers = await getHeaders()

  const comment = (await payload.findByID({
    collection: 'comments',
    id: commentId,
    depth: 0,
    overrideAccess: true,
  })) as Comment | null

  if (!comment) {
    throw new Error('Comment not found.')
  }

  if (!comment.anonymousPasswordHash) {
    throw new Error(
      'This is not an anonymous comment.',
    )
  }

  const passwordHash =
    comment.anonymousPasswordHash

  const verified =
    await verifyAnonymousPassword({
      password,
      passwordHash,
    })

  if (!verified) {
    throw new Error('Incorrect password.')
  }

  const cookieStore = await cookies()

  const currentValue =
    cookieStore.get(
      ANONYMOUS_ACCESS_COOKIE,
    )?.value

  const nextValue =
    setAnonymousAccessEntry({
      currentValue,
      type: 'comment',
      id: comment.id,
      passwordHash,
    })

  cookieStore.set(
    ANONYMOUS_ACCESS_COOKIE,
    nextValue,
    {
      httpOnly: true,
      sameSite: 'lax',
      secure:
        process.env.NODE_ENV ===
        'production',
      path: '/',
      maxAge:
        ANONYMOUS_ACCESS_MAX_AGE,
    },
  )

  await audit({
    payload,
    headers,
    action: 'verify',
    resourceType: 'comment',
    resource: comment,
    message:
      'Anonymous comment password verified.',
  })

  return {
    success: true,
  }
}