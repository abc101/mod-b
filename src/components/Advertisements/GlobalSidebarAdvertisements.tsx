import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import SlideAdClient from '@/blocks/AdvertisementBlock/SlideAdClient'

type Props = {
  boardId?: number | string
}

function isActiveByDate(ad: any, now: string) {
  const startsOk = !ad.startDate || ad.startDate <= now
  const endsOk = !ad.endDate || ad.endDate >= now
  return startsOk && endsOk
}

function isVisibleForBoard(ad: any, boardId?: number | string) {
  if (!boardId) return true

  const targetBoards = ad.targetBoards || []
  if (!Array.isArray(targetBoards) || targetBoards.length === 0) return true

  return targetBoards.some((board: any) => {
    const targetId = typeof board === 'object' ? board.id : board
    return String(targetId) === String(boardId)
  })
}

function getObjectFitClass(objectFit?: string) {
  if (objectFit === 'contain') return 'object-contain'
  if (objectFit === 'fill') return 'object-fill'
  return 'object-cover'
}

function AdImage({
  ad,
  width = 600,
  height = 300,
}: {
  ad: any
  width?: number
  height?: number
}) {
  if (!ad.image?.url) return null

  const objectFitClass = getObjectFitClass(ad.objectFit)

  const aspectRatio = ad.customHeight
    ? `${width} / ${parseInt(ad.customHeight, 10) || height}`
    : `${width} / ${height}`

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-gray-100"
      style={{
        aspectRatio,
        maxHeight: ad.customHeight || undefined,
      }}
    >
      <Image
        src={ad.image.url}
        alt={ad.altText || ad.title}
        fill
        sizes="100vw"
        className={`${objectFitClass} hover:opacity-90 transition-opacity`}
      />
    </div>
  )
}

export default async function GlobalSidebarAdvertisements({ boardId }: Props) {
  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()

  const ads = await payload.find({
    collection: 'advertisements',
    where: {
      and: [
        { positions: { contains: 'sidebar' } },
        { isActive: { equals: true } },
      ],
    },
    sort: 'order',
    depth: 2,
    limit: 20,
  })

  const activeAds = ads.docs.filter(
    (ad: any) => isActiveByDate(ad, now) && isVisibleForBoard(ad, boardId),
  )

  if (activeAds.length === 0) return null

  const slideAds = activeAds
    .filter(
      (ad: any) =>
        ad.adType === 'slide' &&
        ad.image &&
        typeof ad.image === 'object' &&
        ad.image.url,
    )
    .sort((a: any, b: any) => (a.slideOrder || 0) - (b.slideOrder || 0))
    .map((ad: any) => ({
      ...ad,
      image: {
        url: ad.image.url,
      },
    }))

  const bannerAds = activeAds.filter((ad: any) => ad.adType === 'banner')

  const gridAds = activeAds
    .filter((ad: any) => ad.adType === 'grid')
    .sort((a: any, b: any) => (a.gridOrder || 0) - (b.gridOrder || 0))

  const adsenseAds = activeAds.filter((ad: any) => ad.adType === 'adsense')

  return (
    <div className="space-y-4">
      {slideAds.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden p-3">
          <SlideAdClient ads={slideAds} />
        </section>
      )}

      {bannerAds.map((ad: any) => (
        <section
          key={ad.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden p-3"
        >
          <a
            href={ad.linkUrl || '#'}
            target={ad.linkTarget || '_blank'}
            rel="noopener noreferrer"
            className="block"
          >
            <AdImage ad={ad} width={600} height={300} />
          </a>
        </section>
      ))}

      {gridAds.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden p-3">
          <div className="grid grid-cols-2 gap-2">
            {gridAds.map((ad: any) => (
              <a
                key={ad.id}
                href={ad.linkUrl || '#'}
                target={ad.linkTarget || '_blank'}
                rel="noopener noreferrer"
                className="block overflow-hidden rounded-lg bg-gray-100"
              >
                <AdImage ad={ad} width={300} height={200} />
              </a>
            ))}
          </div>
        </section>
      )}

      {adsenseAds.map((ad: any) => (
        <section
          key={ad.id}
          className="bg-white border border-gray-200 rounded-lg overflow-hidden p-3"
        >
          <div dangerouslySetInnerHTML={{ __html: ad.adsenseCode || '' }} />
        </section>
      ))}
    </div>
  )
}