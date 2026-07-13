import { getPayload } from 'payload'
import configPromise from '@payload-config'
import AnnouncementTickerClient from './AnnouncementTickerClient'

type Props = {
  width?: 'content' | 'full'
}

function getAnnouncementHref(item: any) {
  const linkType = item.linkType || 'custom'

  if (linkType === 'none') return null

  if (linkType === 'page') {
    const page = item.pageLink

    if (page && typeof page === 'object' && page.slug) {
      return page.slug === 'home' ? '/' : `/${page.slug}`
    }

    return null
  }

  if (linkType === 'board') {
    const board = item.boardLink

    if (board && typeof board === 'object' && board.slug) {
      return `/board/${board.slug}`
    }

    return null
  }

  return item.customUrl || item.linkUrl || null
}

export default async function AnnouncementTicker({
  width = 'content',
}: Props) {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()

  const announcements = await payload.find({
    collection: 'announcements',
    where: {
      and: [
        { isActive: { equals: true } },
        {
          or: [
            { startDate: { exists: false } },
            { startDate: { less_than_equal: now } },
          ],
        },
        {
          or: [
            { endDate: { exists: false } },
            { endDate: { greater_than_equal: now } },
          ],
        },
      ],
    },
    sort: 'order',
    limit: 10,
    depth: 1,
  })

  if (announcements.docs.length === 0) {
    return null
  }

  const items = announcements.docs.map((item: any) => ({
    id: item.id,
    title: item.title,
    message: item.message,
    href: getAnnouncementHref(item),
    linkTarget: item.linkTarget || '_self',
    startDate: item.startDate,
  }))

  return (
    <AnnouncementTickerClient
      title="Announcement"
      items={items}
      intervalMs={4000}
      width={width}
    />
  )
}