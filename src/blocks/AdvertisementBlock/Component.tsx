import { getPayload } from 'payload'
import configPromise from '@payload-config'
import Image from 'next/image'
import SlideAdClient from './SlideAdClient'
import {
  getActiveGridAds,
  getActiveSingleAd,
  getActiveSlideAds,
  getAdsensePublisherId,
} from '@/lib/services/advertisements'

type Props = {
  adType: 'single' | 'slide' | 'grid' | 'adsense'
  slideGroup?: string
  gridGroup?: string
  gridColumns?: '2' | '3' | '4'
  singleAd?: { id: number } | number
  adsenseSlot?: string
  widthType?: 'full' | 'content'
}

const gridColsMap: Record<string, string> = {
  '2': 'grid-cols-2',
  '3': 'grid-cols-2 md:grid-cols-3',
  '4': 'grid-cols-2 md:grid-cols-4',
}

export default async function AdvertisementBlockComponent({
  adType,
  slideGroup,
  gridGroup,
  gridColumns = '3',
  singleAd,
  adsenseSlot,
  widthType = 'content',
}: Props) {
  const payload = await getPayload({ config: configPromise })
  const wrapClass =
    widthType === 'full' ? 'w-full' : 'max-w-7xl mx-auto px-4'

  if (adType === 'adsense') {
    const publisherId = await getAdsensePublisherId({ payload })

    if (!publisherId || !adsenseSlot) return null

    return (
      <div className={`${wrapClass} py-4`}>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={publisherId}
          data-ad-slot={adsenseSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  if (adType === 'slide' && slideGroup) {
    const ads = await getActiveSlideAds({
      payload,
      slideGroup,
      depth: 2,
    })

    const slideAds = ads.docs
      .filter(
        (ad: any) =>
          ad?.image &&
          typeof ad.image === 'object' &&
          ad.image.url,
      )
      .map((ad: any) => ({
        ...ad,
        image: {
          url: ad.image.url,
        },
      }))

    if (!slideAds.length) return null

    return (
      <div className={wrapClass}>
        <SlideAdClient ads={slideAds} />
      </div>
    )
  }

  if (adType === 'grid' && gridGroup) {
    const ads = await getActiveGridAds({
      payload,
      gridGroup,
      depth: 2,
    })

    if (!ads.docs.length) return null

    return (
      <div className={`${wrapClass} py-4`}>
        <div className={`grid ${gridColsMap[gridColumns]} gap-3`}>
          {ads.docs.map((ad: any) => (
            <a
              key={ad.id}
              href={ad.linkUrl || '#'}
              target={ad.linkTarget || '_blank'}
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              {ad.image?.url && (
                <Image
                  src={ad.image.url}
                  alt={ad.altText || ad.title}
                  width={400}
                  height={200}
                  className="w-full h-auto object-cover hover:opacity-90 transition-opacity"
                />
              )}
            </a>
          ))}
        </div>
      </div>
    )
  }

  if (adType === 'single' && singleAd) {
    const adId = typeof singleAd === 'object' ? singleAd.id : singleAd

    const ad = await getActiveSingleAd({
      payload,
      id: adId,
      depth: 2,
    }) as any

    if (!ad?.image?.url) return null

    return (
      <div className={`${wrapClass} py-4`}>
        <a
          href={ad.linkUrl || '#'}
          target={ad.linkTarget || '_blank'}
          rel="noopener noreferrer"
          className="block"
        >
          <Image
            src={ad.image.url}
            alt={ad.altText || ad.title}
            width={1200}
            height={200}
            className="w-full h-auto object-cover rounded-lg hover:opacity-90 transition-opacity"
          />
        </a>
      </div>
    )
  }

  return null
}