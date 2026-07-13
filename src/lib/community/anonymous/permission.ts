import { cookies } from 'next/headers'
import {
  ANONYMOUS_ACCESS_COOKIE,
  verifyAnonymousAccessEntry,
  verifyAnonymousPassword,
} from '@/lib/community/server'

export type AnonymousResourceType = 'post' | 'comment'

type UserLike =
  | {
      id?: number | string
      role?: string | null
    }
  | null

function getAuthorId(resource: any) {
  return resource?.author?.id || resource?.author
}

function isAnonymousResource(resource: any) {
  return !resource?.author && !!resource?.anonymousPasswordHash
}

async function hasVerifiedAnonymousCookie({
  type,
  resource,
}: {
  type: AnonymousResourceType
  resource: any
}) {
  if (!resource?.id || !resource?.anonymousPasswordHash) return false

  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(ANONYMOUS_ACCESS_COOKIE)?.value

  return verifyAnonymousAccessEntry({
    cookieValue,
    type,
    id: resource.id,
    passwordHash: resource.anonymousPasswordHash,
  })
}

export async function canManageResource({
  type,
  user,
  resource,
  password,
}: {
  type: AnonymousResourceType
  user: UserLike
  resource: any
  password?: string | null
}) {
  const isAdmin = user?.role === 'admin'

  const isAuthor =
    !!user &&
    !!getAuthorId(resource) &&
    String(getAuthorId(resource)) === String(user.id)

  if (isAdmin || isAuthor) return true

  if (!user && isAnonymousResource(resource)) {
    const cookieOk = await hasVerifiedAnonymousCookie({
      type,
      resource,
    })

    if (cookieOk) return true

    return verifyAnonymousPassword({
      password,
      passwordHash: resource.anonymousPasswordHash,
    })
  }

  return false
}

export async function requireResourcePermission({
  type,
  user,
  resource,
  password,
}: {
  type: AnonymousResourceType
  user: UserLike
  resource: any
  password?: string | null
}) {
  const allowed = await canManageResource({
    type,
    user,
    resource,
    password,
  })

  if (!allowed) {
    throw new Error('No permission or incorrect password.')
  }

  return true
}

// Compatibility wrappers
export async function canManagePost({
  user,
  post,
  password,
}: {
  user: UserLike
  post: any
  password?: string | null
}) {
  return canManageResource({
    type: 'post',
    user,
    resource: post,
    password,
  })
}

export async function requirePostPermission({
  user,
  post,
  password,
}: {
  user: UserLike
  post: any
  password?: string | null
}) {
  return requireResourcePermission({
    type: 'post',
    user,
    resource: post,
    password,
  })
}

export async function canManageComment({
  user,
  comment,
  password,
}: {
  user: UserLike
  comment: any
  password?: string | null
}) {
  return canManageResource({
    type: 'comment',
    user,
    resource: comment,
    password,
  })
}

export async function requireCommentPermission({
  user,
  comment,
  password,
}: {
  user: UserLike
  comment: any
  password?: string | null
}) {
  return requireResourcePermission({
    type: 'comment',
    user,
    resource: comment,
    password,
  })
}