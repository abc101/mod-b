import type { Advertisement } from '@/payload-types'
import type { SeedContext } from './utils'
import type { SeedBoards } from './boards'
import type { SeedMedia } from './media'
import { daysFrom, logStep, upsertByUnique } from './utils'

export async function seedAdvertisements(
  ctx: SeedContext,
  boards: SeedBoards,
  media: SeedMedia,
): Promise<Advertisement[]> {
  const { payload, now } = ctx
  logStep('Seeding advertisements')

  const ads: Advertisement[] = []
  const specs = [
    {
      title: 'Mod-B Global Sidebar Banner',
      adType: 'banner',
      image: media.ads[0].id,
      linkUrl: '/board/free',
      positions: ['sidebar'],
      targetBoards: [],
      order: 1,
    },
    {
      title: 'Mod-B Home Banner',
      adType: 'banner',
      image: media.ads[1].id,
      linkUrl: '/board/gallery',
      positions: ['home'],
      targetBoards: [],
      order: 2,
    },
    {
      title: 'Mod-B Board Top Banner',
      adType: 'banner',
      image: media.ads[0].id,
      linkUrl: '/board/free',
      positions: ['board-top'],
      targetBoards: [
        boards.free.id,
        boards.qna.id,
        boards.gallery.id,
        boards.market.id,
      ],
      order: 10,
    },
    {
      title: 'Mod-B Board Middle Banner',
      adType: 'banner',
      image: media.ads[1].id,
      linkUrl: '/board/marketplace',
      positions: ['board-middle'],
      targetBoards: [
        boards.free.id,
        boards.gallery.id,
        boards.market.id,
      ],
      middlePosition: 4,
      order: 20,
    },
    {
      title: 'Mod-B Board Bottom Banner',
      adType: 'banner',
      image: media.ads[2].id,
      linkUrl: '/board/qna',
      positions: ['board-bottom'],
      targetBoards: [
        boards.free.id,
        boards.qna.id,
        boards.gallery.id,
      ],
      order: 30,
    },
    {
      title: 'Mod-B Post Bottom Banner',
      adType: 'banner',
      image: media.ads[0].id,
      linkUrl: '/board/gallery',
      positions: ['post-bottom'],
      targetBoards: [],
      order: 40,
    },
    {
      title: 'Mod-B Home Hero Slide',
      adType: 'slide',
      image: media.ads[2].id,
      linkUrl: '/board/gallery',
      positions: ['home'],
      targetBoards: [],
      slideGroup: 'mod-b-home-hero',
      slideOrder: 1,
      order: 50,
    },
    {
      title: 'Mod-B Sidebar Grid Advertisement',
      adType: 'grid',
      image: media.ads[1].id,
      linkUrl: '/board/marketplace',
      positions: ['sidebar'],
      targetBoards: [],
      gridGroup: 'mod-b-sidebar-grid',
      gridColumns: '2',
      gridOrder: 1,
      order: 60,
    },
    {
      title: 'Mod-B AdSense Placeholder',
      adType: 'adsense',
      adsenseCode:
        '<ins class="adsbygoogle" data-ad-client="ca-pub-0000000000000000" data-ad-slot="0000000000"></ins>',
      positions: ['board-bottom', 'post-bottom'],
      targetBoards: [],
      order: 70,
    },
    {
      title: 'Mod-B Expired Advertisement',
      adType: 'banner',
      image: media.ads[0].id,
      positions: ['home'],
      startDate: daysFrom(now, -20),
      endDate: daysFrom(now, -5),
      isActive: true,
      order: 90,
    },
    {
      title: 'Mod-B Future Advertisement',
      adType: 'banner',
      image: media.ads[1].id,
      positions: ['home'],
      startDate: daysFrom(now, 5),
      endDate: daysFrom(now, 20),
      isActive: true,
      order: 95,
    },
  ]

  for (const spec of specs) {
    ads.push(
      await upsertByUnique<Advertisement>({
        payload,
        collection: 'advertisements',
        uniqueField: 'title',
        uniqueValue: spec.title,
        data: {
          linkTarget: '_self',
          altText: spec.title,
          widthType: 'content',
          objectFit: 'cover',
          startDate: spec.startDate ?? daysFrom(now, -10),
          endDate: spec.endDate ?? daysFrom(now, 30),
          isActive: spec.isActive ?? true,
          ...spec,
        },
        depth: 1,
      }),
    )
  }

  return ads
}
