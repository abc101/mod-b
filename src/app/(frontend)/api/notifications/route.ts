import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

export async function GET() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return NextResponse.json({
      unreadCount: 0,
      notifications: [],
    })
  }

  const unread = await payload.count({
    collection: 'notifications',
    where: {
      and: [
        { recipient: { equals: user.id } },
        { isRead: { equals: false } },
      ],
    },
    overrideAccess: true,
  })

  const latest = await payload.find({
    collection: 'notifications',
    where: {
      recipient: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit: 5,
    depth: 0,
    overrideAccess: true,
  })

  return NextResponse.json({
    unreadCount: unread.totalDocs,
    notifications: latest.docs,
  })
}