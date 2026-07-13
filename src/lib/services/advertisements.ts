import type { Payload, Where } from 'payload'

function activeAdvertisementWhere(extraAnd: any[] = []) {
  const now = new Date().toISOString()

  return {
    and: [
      { isActive: { equals: true } },
      {
        or: [
          { startDate: { less_than_equal: now } },
          { startDate: { exists: false } },
        ],
      },
      {
        or: [
          { endDate: { greater_than_equal: now } },
          { endDate: { exists: false } },
        ],
      },
      ...extraAnd,
    ],
  }
}

export async function getActiveBoardAdvertisements({
  payload,
  position,
  boardId,
  depth = 2,
}: {
  payload: Payload
  position: string
  boardId?: number | string
  depth?: number
}) {
  const boardConditions: Where[] = [
    { specificBoardOnly: { not_equals: true } },
  ]

  if (boardId) {
    boardConditions.push({
      specificBoards: {
        contains: boardId,
      },
    })
  }

  return payload.find({
    collection: 'advertisements',
    where: activeAdvertisementWhere([
      { adType: { equals: 'single' } },
      { exposurePosition: { equals: position } },
      {
        or: boardConditions,
      },
    ]),
    sort: 'order',
    depth,
  })
}

export async function getActiveSlideAds({
  payload,
  slideGroup,
  depth = 2,
}: {
  payload: Payload
  slideGroup: string
  depth?: number
}) {
  return payload.find({
    collection: 'advertisements',
    where: activeAdvertisementWhere([
      { adType: { equals: 'slide' } },
      { slideGroup: { equals: slideGroup } },
    ]),
    sort: 'slideOrder',
    depth,
  })
}

export async function getActiveGridAds({
  payload,
  gridGroup,
  depth = 2,
}: {
  payload: Payload
  gridGroup: string
  depth?: number
}) {
  return payload.find({
    collection: 'advertisements',
    where: activeAdvertisementWhere([
      { adType: { equals: 'grid' } },
      { gridGroup: { equals: gridGroup } },
    ]),
    sort: 'gridOrder',
    depth,
  })
}

export async function getActiveSingleAd({
  payload,
  id,
  depth = 2,
}: {
  payload: Payload
  id: number | string
  depth?: number
}) {
  try {
    const ad = await payload.findByID({
      collection: 'advertisements',
      id,
      depth,
    }) as any

    if (!ad?.isActive) return null

    const now = new Date().toISOString()
    const startsOk = !ad.startDate || ad.startDate <= now
    const endsOk = !ad.endDate || ad.endDate >= now

    if (!startsOk || !endsOk) return null

    return ad
  } catch {
    return null
  }
}

export async function getAdsensePublisherId({
  payload,
}: {
  payload: Payload
}) {
  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  return (siteSettings as any)?.googleAds?.publisherId || null
}