'use server'

import configPromise from '@payload-config'
import { revalidatePath } from 'next/cache'
import { headers as getHeaders } from 'next/headers.js'
import { getPayload } from 'payload'

async function getAuthenticatedContext() {
  const headers = await getHeaders()

  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({
    headers,
  })

  if (!user) {
    throw new Error('Login required.')
  }

  return {
    headers,
    payload,
    user,
  }
}

function getRecipientId(recipient: unknown) {
  if (
    typeof recipient === 'object' &&
    recipient !== null &&
    'id' in recipient
  ) {
    return String(recipient.id)
  }

  return String(recipient)
}

async function getOwnedNotification(
  notificationId: string,
) {
  const {
    headers,
    payload,
    user,
  } = await getAuthenticatedContext()

  const notification = await payload.findByID({
    collection: 'notifications',
    id: notificationId,
    depth: 0,
    overrideAccess: true,
  })

  const recipientId = getRecipientId(
    notification.recipient,
  )

  if (recipientId !== String(user.id)) {
    throw new Error(
      'You do not have permission to update this notification.',
    )
  }

  return {
    headers,
    payload,
    user,
    notification,
  }
}

function revalidateNotificationPages() {
  revalidatePath('/my-page')
  revalidatePath('/my-page/notifications')
}

export async function markAllNotificationsRead(): Promise<void> {
  const {
    headers,
    payload,
    user,
  } = await getAuthenticatedContext()

  const unread = await payload.find({
    collection: 'notifications',
    where: {
      and: [
        {
          recipient: {
            equals: user.id,
          },
        },
        {
          isRead: {
            equals: false,
          },
        },
      ],
    },
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  for (const notification of unread.docs) {
    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        isRead: true,
      },
      overrideAccess: true,
      req: {
        headers,
        user,
      } as never,
    })
  }

  revalidateNotificationPages()
}

export async function markNotificationRead(
  formData: FormData,
): Promise<void> {
  const notificationId = String(
    formData.get('notificationId') || '',
  )

  if (!notificationId) {
    throw new Error(
      'Notification ID is required.',
    )
  }

  const {
    headers,
    payload,
    user,
    notification,
  } = await getOwnedNotification(notificationId)

  if (!notification.isRead) {
    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        isRead: true,
      },
      overrideAccess: true,
      req: {
        headers,
        user,
      } as never,
    })
  }

  revalidateNotificationPages()
}

export async function markNotificationUnread(
  formData: FormData,
): Promise<void> {
  const notificationId = String(
    formData.get('notificationId') || '',
  )

  if (!notificationId) {
    throw new Error(
      'Notification ID is required.',
    )
  }

  const {
    headers,
    payload,
    user,
    notification,
  } = await getOwnedNotification(notificationId)

  if (notification.isRead) {
    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        isRead: false,
      },
      overrideAccess: true,
      req: {
        headers,
        user,
      } as never,
    })
  }

  revalidateNotificationPages()
}