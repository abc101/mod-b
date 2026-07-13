import type { Payload } from 'payload'
import type { Notification } from '@/types/payload'

export type NotificationType = Notification['type']

type RelationshipId = number | string

type NotifyOptions = {
  payload: Payload
  recipientId?: RelationshipId | null
  actorId?: RelationshipId | null
  type: NotificationType
  title?: string
  message?: string
  href?: string
  metadata?: Record<string, unknown>
}

function toNumericId(
  value: RelationshipId,
  fieldName: string,
): number {
  const numericValue =
    typeof value === 'number'
      ? value
      : Number(value)

  if (
    !Number.isInteger(numericValue) ||
    numericValue <= 0
  ) {
    throw new Error(`Invalid ${fieldName}.`)
  }

  return numericValue
}

export async function notify({
  payload,
  recipientId,
  actorId,
  type,
  title,
  message,
  href,
  metadata,
}: NotifyOptions): Promise<Notification | null> {
  if (
    recipientId === undefined ||
    recipientId === null
  ) {
    return null
  }

  const numericRecipientId = toNumericId(
    recipientId,
    'recipient ID',
  )

  const numericActorId =
    actorId === undefined || actorId === null
      ? undefined
      : toNumericId(actorId, 'actor ID')

  if (
    numericActorId !== undefined &&
    numericActorId === numericRecipientId
  ) {
    return null
  }

  return payload.create({
    collection: 'notifications',
    data: {
      recipient: numericRecipientId,
      type,
      title:
        title ??
        getDefaultNotificationTitle(type),
      message: message ?? undefined,
      href: href ?? undefined,
      isRead: false,
      metadata: {
        ...metadata,
        ...(numericActorId !== undefined
          ? { actorId: numericActorId }
          : {}),
      },
    },
    overrideAccess: true,
  })
}

function getDefaultNotificationTitle(
  type: NotificationType,
): string {
  switch (type) {
    case 'comment':
      return 'New comment on your post'

    case 'reply':
      return 'New reply to your comment'

    case 'qna_answer':
      return 'New answer to your question'

    case 'qna_accepted':
      return 'Your answer was accepted'

    case 'moderation':
      return 'Moderation update'

    case 'mention':
      return 'You were mentioned'

    default:
      return 'Notification'
  }
}
