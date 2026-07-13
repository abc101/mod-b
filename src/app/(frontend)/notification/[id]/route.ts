import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

function getBaseUrl(headers: Headers) {
  const proto = headers.get('x-forwarded-proto') || 'https'
  const host =
    headers.get('x-forwarded-host') ||
    headers.get('host') ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'localhost:3000'

  if (host.startsWith('http')) return host

  return `${proto}://${host}`
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const headers = await getHeaders()
  const baseUrl = getBaseUrl(headers)

  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({ headers })

  if (!user) {
    return NextResponse.redirect(
      new URL('/login', baseUrl),
      303,
    )
  }

  const notification = await payload.findByID({
    collection: 'notifications',
    id: Number(id),
    overrideAccess: true,
  }) as any

  if (
    !notification ||
    String(notification.recipient?.id || notification.recipient) !==
      String(user.id)
  ) {
    return NextResponse.redirect(
      new URL('/my-page/notifications', baseUrl),
      303,
    )
  }

  if (!notification.isRead) {
    await payload.update({
      collection: 'notifications',
      id: notification.id,
      data: {
        isRead: true,
      },
      overrideAccess: true,
      req: { headers, user } as any,
    })
  }

  const href =
    notification.href || '/my-page/notifications'

  return NextResponse.redirect(
    new URL(href, baseUrl),
    303,
  )
}