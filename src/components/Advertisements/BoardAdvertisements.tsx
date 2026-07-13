import type { ComponentProps } from 'react'
import type { Advertisement, Board } from '@/types/payload'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'

import SlideAdClient from '@/blocks/AdvertisementBlock/SlideAdClient'
import { getRelation, getRelationId } from '@/lib/relations'

type AdvertisementWithRelations = Advertisement & {
  targetBoards?: Array<Board | number | string> | null
}

type SlideAd = ComponentProps<typeof SlideAdClient>['ads'][number]

type Props = {
  position:
    | 'board-top'
    | 'board-middle'
    | 'board-bottom'
    | 'post-top'
    | 'post-bottom'
  boardId?: number | string
  className?: string
}

function isActiveByDate(
  advertisement: Advertisement,
  now: string,
): boolean {
  const startsBeforeNow =
    !advertisement.startDate ||
    advertisement.startDate <= now

  const endsAfterNow =
    !advertisement.endDate ||
    advertisement.endDate >= now

  return startsBeforeNow && endsAfterNow
}

function isVisibleForBoard(
  advertisement: AdvertisementWithRelations,
  boardId?: number | string,
): boolean {
  const targetBoards = advertisement.targetBoards ?? []

  if (targetBoards.length === 0) {
    return true
  }

  if (boardId === undefined || boardId === null) {
    return false
  }

  return targetBoards.some((board) => {
    const targetBoardId = getRelationId(board)

    return (
      targetBoardId !== undefined &&
      String(targetBoardId) === String(boardId)
    )
  })
}

function getObjectFitClass(
  objectFit?: string | null,
): string {
  switch (objectFit) {
    case 'contain':
      return 'object-contain'

    case 'fill':
      return 'object-fill'

    default:
      return 'object-cover'
  }
}

function normalizeSlideAd(
  advertisement: Advertisement,
): SlideAd | null {
  const image = getRelation(advertisement.image)

  if (!image?.url) {
    return null
  }

  /*
   * Payload에서는 선택 필드가 null일 수 있지만,
   * SlideAdClient에서는 undefined를 기대할 수 있으므로 정규화한다.
   */
  return {
    ...advertisement,
    image: {
      url: image.url,
    },
    altText: advertisement.altText ?? undefined,
    linkUrl: advertisement.linkUrl ?? undefined,
    linkTarget: advertisement.linkTarget ?? undefined,
    slideOrder: advertisement.slideOrder ?? undefined,
    customHeight: advertisement.customHeight ?? undefined,
    objectFit: advertisement.objectFit ?? undefined,
  } as SlideAd
}

function AdImage({
  ad,
  width = 600,
  height = 300,
}: {
  ad: Advertisement
  width?: number
  height?: number
}) {
  const image = getRelation(ad.image)

  if (!image?.url) {
    return null
  }

  const objectFitClass = getObjectFitClass(ad.objectFit)

  const parsedCustomHeight = ad.customHeight
    ? Number.parseInt(ad.customHeight, 10)
    : null

  const displayHeight =
    parsedCustomHeight &&
    Number.isFinite(parsedCustomHeight) &&
    parsedCustomHeight > 0
      ? parsedCustomHeight
      : height

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg bg-gray-100"
      style={{
        aspectRatio: `${width} / ${displayHeight}`,
        maxHeight: ad.customHeight ?? undefined,
      }}
    >
      <Image
        src={image.url}
        alt={ad.altText ?? ad.title}
        fill
        sizes="100vw"
        className={`${objectFitClass} transition-opacity hover:opacity-90`}
      />
    </div>
  )
}

export default async function BoardAdvertisements({
  position,
  boardId,
  className = '',
}: Props) {
  const payload = await getPayload({
    config: configPromise,
  })

  const now = new Date().toISOString()

  const advertisements = await payload.find({
    collection: 'advertisements',
    where: {
      and: [
        {
          positions: {
            contains: position,
          },
        },
        {
          isActive: {
            equals: true,
          },
        },
      ],
    },
    sort: 'order',
    depth: 2,
    limit: 20,
    overrideAccess: true,
  })

  const activeAds = advertisements.docs.filter((advertisement) => {
    return (
      isActiveByDate(advertisement, now) &&
      isVisibleForBoard(advertisement, boardId)
    )
  })

  if (activeAds.length === 0) {
    return null
  }

  const slideAds = activeAds
    .filter((advertisement) => {
      return advertisement.adType === 'slide'
    })
    .sort((first, second) => {
      return (
        (first.slideOrder ?? 0) -
        (second.slideOrder ?? 0)
      )
    })
    .map(normalizeSlideAd)
    .filter((advertisement): advertisement is SlideAd => {
      return advertisement !== null
    })

  const bannerAds = activeAds.filter((advertisement) => {
    return advertisement.adType === 'banner'
  })

  const gridAds = activeAds
    .filter((advertisement) => {
      return advertisement.adType === 'grid'
    })
    .sort((first, second) => {
      return (
        (first.gridOrder ?? 0) -
        (second.gridOrder ?? 0)
      )
    })

  const adsenseAds = activeAds.filter((advertisement) => {
    return advertisement.adType === 'adsense'
  })

  return (
    <div className={`space-y-4 ${className}`}>
      {slideAds.length > 0 && (
        <section className="overflow-hidden rounded-lg">
          <SlideAdClient ads={slideAds} />
        </section>
      )}

      {bannerAds.map((advertisement) => {
        const content = (
          <AdImage
            ad={advertisement}
            width={1200}
            height={240}
          />
        )

        return (
          <section
            key={advertisement.id}
            className="overflow-hidden rounded-lg"
          >
            {advertisement.linkUrl ? (
              <a
                href={advertisement.linkUrl}
                target={advertisement.linkTarget ?? '_blank'}
                rel={
                  advertisement.linkTarget === '_self'
                    ? undefined
                    : 'noopener noreferrer'
                }
                className="block"
              >
                {content}
              </a>
            ) : (
              content
            )}
          </section>
        )
      })}

      {gridAds.length > 0 && (
        <section>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {gridAds.map((advertisement) => {
              const content = (
                <AdImage
                  ad={advertisement}
                  width={400}
                  height={200}
                />
              )

              return advertisement.linkUrl ? (
                <a
                  key={advertisement.id}
                  href={advertisement.linkUrl}
                  target={advertisement.linkTarget ?? '_blank'}
                  rel={
                    advertisement.linkTarget === '_self'
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  className="block overflow-hidden rounded-lg bg-gray-100"
                >
                  {content}
                </a>
              ) : (
                <div
                  key={advertisement.id}
                  className="overflow-hidden rounded-lg bg-gray-100"
                >
                  {content}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {adsenseAds.map((advertisement) => (
        <section
          key={advertisement.id}
          className="overflow-hidden rounded-lg"
          dangerouslySetInnerHTML={{
            __html: advertisement.adsenseCode ?? '',
          }}
        />
      ))}
    </div>
  )
}