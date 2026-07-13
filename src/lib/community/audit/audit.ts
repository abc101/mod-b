import type { Payload } from 'payload'
import type {
  Comment,
  Post,
  User,
} from '@/types/payload'

import { logAudit } from '@/lib/community/server'

type LogAuditOptions = Parameters<typeof logAudit>[0]
type AuditAction = LogAuditOptions['action']
type AuditResourceType = LogAuditOptions['resourceType']

type AuditResource =
  | Post
  | Comment
  | {
      id?: string | number
      collection?: string
      title?: string | null
      content?: unknown
      post?: unknown
      board?: unknown
      anonymousAuthor?: string | null
    }

type AuditOptions = {
  payload: Payload
  headers: Headers
  user?: User | null
  action: AuditAction
  resourceType?: AuditResourceType
  resource?: AuditResource
  resourceId?: string | number
  anonymousAuthor?: string | null
  message?: string
  metadata?: Record<string, unknown>
}

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  )
}

function getResourceValue(
  resource: AuditResource | undefined,
  key: string,
): unknown {
  if (!isRecord(resource)) {
    return undefined
  }

  const record = resource as Record<string, unknown>

  return record[key]
}

function getResourceId(
  resource: AuditResource | undefined,
): string | number | undefined {
  const id = getResourceValue(resource, 'id')

  return typeof id === 'string' ||
    typeof id === 'number'
    ? id
    : undefined
}

function getResourceString(
  resource: AuditResource | undefined,
  key: string,
): string | undefined {
  const value = getResourceValue(resource, key)

  return typeof value === 'string'
    ? value
    : undefined
}

function inferResourceType(
  resource?: AuditResource,
): AuditResourceType {
  const collection = getResourceString(
    resource,
    'collection',
  )

  if (collection === 'comments') {
    return 'comment'
  }

  if (collection === 'posts') {
    return 'post'
  }

  const post = getResourceValue(resource, 'post')
  const content = getResourceValue(resource, 'content')
  const title = getResourceValue(resource, 'title')
  const board = getResourceValue(resource, 'board')

  if (
    post !== undefined &&
    content !== undefined
  ) {
    return 'comment'
  }

  if (
    title !== undefined &&
    board !== undefined
  ) {
    return 'post'
  }

  return 'post'
}

function getDefaultMessage({
  action,
  resourceType,
  resource,
}: {
  action: AuditAction
  resourceType: AuditResourceType
  resource?: AuditResource
}): string {
  const resourceId = getResourceId(resource)

  if (resourceType === 'post') {
    const title = getResourceString(
      resource,
      'title',
    )

    return `Post ${action}: ${
      title || resourceId || ''
    }`
  }

  if (resourceType === 'comment') {
    return `Comment ${action}: ${
      resourceId || ''
    }`
  }

  return `${resourceType} ${action}`
}

export async function audit({
  payload,
  headers,
  user,
  action,
  resourceType,
  resource,
  resourceId,
  anonymousAuthor,
  message,
  metadata,
}: AuditOptions) {
  const finalResourceType =
    resourceType ??
    inferResourceType(resource)

  const finalResourceId =
    resourceId ??
    getResourceId(resource)

  if (
    finalResourceId === undefined ||
    finalResourceId === null
  ) {
    console.warn('[audit] Missing resource ID')
    return
  }

  const resourceAnonymousAuthor =
    getResourceString(
      resource,
      'anonymousAuthor',
    )

  await logAudit({
    payload,
    headers,
    user,
    action,
    resourceType: finalResourceType,
    resourceId: finalResourceId,
    anonymousAuthor:
      anonymousAuthor ??
      resourceAnonymousAuthor,
    message:
      message ??
      getDefaultMessage({
        action,
        resourceType: finalResourceType,
        resource,
      }),
    metadata,
  })
}

export async function auditPost({
  payload,
  headers,
  user,
  action,
  post,
  message,
  metadata,
}: Omit<
  AuditOptions,
  'resourceType' | 'resource'
> & {
  post: Post
}) {
  return audit({
    payload,
    headers,
    user,
    action,
    resourceType: 'post',
    resource: post,
    message,
    metadata,
  })
}

export async function auditComment({
  payload,
  headers,
  user,
  action,
  comment,
  message,
  metadata,
}: Omit<
  AuditOptions,
  'resourceType' | 'resource'
> & {
  comment: Comment
}) {
  return audit({
    payload,
    headers,
    user,
    action,
    resourceType: 'comment',
    resource: comment,
    message,
    metadata,
  })
}