import configPromise from '@payload-config'
import { getPayload } from 'payload'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GOOGLE_CERTIFICATION_AUTHORITY_ID = 'f08c47fec0942fa0'

function normalizePublisherId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const normalized = value
    .trim()
    .replace(/^ca-pub-/i, 'pub-')

  if (!/^pub-\d+$/.test(normalized)) {
    return null
  }

  return normalized
}

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({
      config: configPromise,
    })

    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 0,
    })

    const googleAdsEnabled =
      siteSettings.googleAds?.enabled === true

    const publisherId = normalizePublisherId(
      siteSettings.googleAds?.publisherId,
    )

    if (!googleAdsEnabled || !publisherId) {
      return new Response(
        'Google AdSense is not configured.\n',
        {
          status: 404,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        },
      )
    }

    const adsTxt = [
      'google.com',
      publisherId,
      'DIRECT',
      GOOGLE_CERTIFICATION_AUTHORITY_ID,
    ].join(', ')

    return new Response(`${adsTxt}\n`, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',

        /*
         * Browser: 5 minutes
         * Shared proxy/CDN: 1 hour
         */
        'Cache-Control':
          'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate ads.txt:', error)

    return new Response(
      'Unable to generate ads.txt.\n',
      {
        status: 500,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    )
  }
}