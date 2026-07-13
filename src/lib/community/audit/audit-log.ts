import type { Payload } from 'payload'
import type { User } from '@/types/payload'
import { getClientIp, getUserAgent } from '@/lib/community/server'

type LogAuditOptions = {
  payload: Payload
  headers?: Headers
  user?: User | null
  action: 'create' | 'update' | 'delete' | 'restore' | 'verify' | 'report' | 'moderate'
  resourceType: 'post' | 'comment' | 'user' | 'board' | 'report'
  resourceId: number | string
  anonymousAuthor?: string
  message?: string
  metadata?: Record<string, unknown>
}

export async function logAudit({
  payload,
  headers,
  user,
  action,
  resourceType,
  resourceId,
  anonymousAuthor,
  message,
  metadata,
}: LogAuditOptions) {
  try {
    const ip = headers ? getClientIp(headers) : undefined
    const userAgent = headers ? getUserAgent(headers) : undefined

    await payload.create({
      collection: 'audit-logs',
      data: {
        action,
        resourceType,
        resourceId: String(resourceId),
        actorType: user ? 'user' : anonymousAuthor ? 'anonymous' : 'system',
        actor: user?.id,
        anonymousAuthor,
        ip,
        userAgent,
        message,
        metadata,
      },
      overrideAccess: true,
    })
  } catch (err) {
    console.error('[audit-log]', err)
  }
}