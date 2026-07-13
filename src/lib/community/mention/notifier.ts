import type { Payload } from 'payload'
import { notify } from '@/lib/community/server'
import { extractMentions } from './parser'
import { resolveMentionUsers } from './resolver'

function difference(next: string[], prev: string[]) {
  const prevSet = new Set(prev)
  return next.filter((item) => !prevSet.has(item))
}

export async function processMentions({
  payload,
  actorId,
  previousText = '',
  currentText,
  href,
  message,
  metadata,
}: {
  payload: Payload
  actorId?: number | string | null
  previousText?: string
  currentText: string
  href: string
  message?: string
  metadata?: Record<string, any>
}) {
  const previousHandles = extractMentions(previousText)
  const currentHandles = extractMentions(currentText)

  const newHandles = difference(currentHandles, previousHandles)

  if (newHandles.length === 0) return

  const users = await resolveMentionUsers({
    payload,
    handles: newHandles,
  })

  for (const user of users as any[]) {
    await notify({
      payload,
      recipientId: user.id,
      actorId,
      type: 'mention',
      message: message || currentText.slice(0, 120),
      href,
      metadata: {
        ...metadata,
        mentionedHandle: user.nickname
      },
    })
  }
}