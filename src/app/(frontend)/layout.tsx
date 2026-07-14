import React from 'react'
import './styles.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Metadata, Viewport } from 'next'
import { headers as getHeaders } from 'next/headers'
import GlobalBoardSections from '@/components/GlobalBoardSections/GlobalBoardSections'
import AnnouncementTicker from '@/components/Announcements/AnnouncementTicker'
import GlobalHeroSlider from '@/components/GlobalHeroSlider/GlobalHeroSlider'
import GlobalSidebarAdvertisements from '@/components/Advertisements/GlobalSidebarAdvertisements'
import { getMetadataBase } from '@/lib/siteUrl'
import LocalTime from '@/components/LocalTime'
import FrontendMainLayoutClient from '@/components/Layout/FrontendMainLayoutClient'
import { AnonymousAccessProvider } from '@/components/AnonymousAccessProvider'
import { NotificationProvider } from '@/components/NotificationProvider'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  }) as any

  const faviconUrl =
    typeof settings?.favicon === 'object' && settings.favicon?.url
      ? settings.favicon.url
      : '/favicon.ico'

  const icons = {
    icon: faviconUrl,
    shortcut: faviconUrl,
    apple: faviconUrl,
  }

  if (settings?.maintenance?.enabled) {
    return {
      title: settings.maintenance.title || 'Under Construction',
      description: settings.maintenance.message || '',
      icons,
    }
  }

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: settings?.seo?.defaultTitle || settings?.siteName || 'Mod-B',
      template: `%s | ${settings?.siteName || 'Mod-B'}`,
    },
    description: settings?.seo?.defaultDescription || '',
    icons,
    openGraph: {
      siteName: settings?.siteName || 'Mod-B',
      images: settings?.seo?.ogImage?.url
        ? [{ url: settings.seo.ogImage.url }]
        : [],
    },
    verification: {
      google: settings?.seo?.googleVerification || undefined,
      other: settings?.seo?.naverVerification
        ? { 'naver-site-verification': [settings.seo.naverVerification] }
        : undefined,
    },
  }
}

export default async function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 2,
  })) as any

  const design = settings?.design || {}
  const { colors, typography, layout: layoutSettings } = design

  const themeVariables = {
    '--color-primary': colors?.primary || '#111827',
    '--color-primary-fg': colors?.primaryForeground || '#ffffff',
    '--color-secondary': colors?.secondary || '#f3f4f6',
    '--color-secondary-fg': colors?.secondaryForeground || '#111827',
    '--color-bg': colors?.background || '#f9fafb',
    '--color-fg': colors?.foreground || '#111827',
    '--color-header-bg': colors?.headerBg || '#ffffff',
    '--color-footer-bg': colors?.footerBg || '#111827',
    '--color-footer-fg': colors?.footerFg || '#9ca3af',
    '--color-link': colors?.link || '#2563eb',
    '--color-nav-bg': colors?.navBg || '#f3f4f6',
    '--font-size-base': typography?.baseFontSize || '16px',
    '--font-weight-heading': typography?.headingWeight || '700',
    '--max-width': layoutSettings?.maxWidth || '1280px',
    '--border-radius': layoutSettings?.borderRadius || '8px',
    '--header-height': layoutSettings?.headerHeight || '64px',
  } as React.CSSProperties

  const globalBoardSettings =
    settings?.homeSettings?.globalBoardSettings || {}

  const enableGlobalBoardSections =
    globalBoardSettings.enabled !== false

  const hasGlobalBoardSections =
    enableGlobalBoardSections &&
    globalBoardSettings.boardSections?.length > 0

  const globalBoardPosition =
    globalBoardSettings.position || 'right'

  const enableSidebarAds =
    globalBoardSettings.enableSidebarAds !== false

  let fontClass = 'font-sans'
  if (typography?.fontFamily) {
    if (typography.fontFamily === 'system') fontClass = 'font-sans'
    else if (typography.fontFamily === 'inter') fontClass = 'font-inter'
    else if (typography.fontFamily === 'noto-sans-kr') fontClass = 'font-noto'
    else if (typography.fontFamily === 'pretendard') fontClass = 'font-pretendard'
    else if (typography.fontFamily === 'roboto') fontClass = 'font-roboto'
    else if (typography.fontFamily === 'open-sans') fontClass = 'font-open'
  }

  const gaId = settings?.seo?.googleAnalyticsId
  const adsenseId = settings?.seo?.googleAdsenseId
  const bodyScript = settings?.seo?.bodyScript

  const maintenance = settings?.maintenance
  let showMaintenancePage = false

  const mainContainerClass =
    layoutSettings?.mainWidth === 'full'
      ? 'w-full px-4 py-6 sm:px-6 sm:py-8'
      : 'mx-auto w-full max-w-[var(--max-width)] px-4 py-6 sm:px-6 sm:py-8'

  if (maintenance?.enabled) {
    const headers = await getHeaders()
    const { user } = await payload.auth({ headers })
    const isAdmin = user && (user as any).role === 'admin'

    if (!isAdmin) {
      showMaintenancePage = true
    }
  }

  return (
    <html lang="ko">
      <head>
        {gaId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}

        {adsenseId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        )}
      </head>

      {showMaintenancePage ? (
        <body
          className="min-h-screen flex items-center justify-center bg-gray-50 bg-cover bg-center bg-no-repeat p-4"
          style={{
            backgroundImage: maintenance.backgroundImage?.url
              ? `url(${maintenance.backgroundImage.url})`
              : 'none',
          }}
        >
          <div className="max-w-md w-full bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl text-center border border-gray-100">
            <span className="text-5xl block mb-4">🚧</span>

            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {maintenance.title || 'Under Construction'}
            </h1>

            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap mb-6">
              {maintenance.message ||
                'We are currently working on something awesome. Please check back soon.'}
            </p>

            {maintenance.estimatedDate && (
              <div className="space-y-1">
                <div className="inline-block bg-blue-50 text-blue-600 font-medium text-xs px-4 py-2 rounded-full border border-blue-100">
                  Estimated Time:{' '}
                  <LocalTime dateString={maintenance.estimatedDate} />
                </div>

                <div className="text-xs text-gray-400">
                  UTC:{' '}
                  {new Date(maintenance.estimatedDate).toLocaleString(
                    'en-US',
                    {
                      timeZone: 'UTC',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    },
                  )}
                </div>
              </div>
            )}
          </div>
        </body>
      ) : (
        <body
          className={`min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-fg)] text-[length:var(--font-size-base)] ${fontClass}`}
          style={themeVariables}
        >
          <AnonymousAccessProvider>
            <NotificationProvider>
              <Header />

              <AnnouncementTicker
                width={layoutSettings?.announcementWidth || 'content'}
              />

              <GlobalHeroSlider settings={settings} />

              <FrontendMainLayoutClient
                hasSidebarContent={hasGlobalBoardSections}
                sidebarPosition={globalBoardPosition}
                visibility={globalBoardSettings.visibility || {}}
                mainContainerClass={mainContainerClass}
                sidebar={
                  <aside className="w-full min-w-0 max-w-full space-y-4 lg:max-w-none">
                    <GlobalBoardSections />

                    {enableSidebarAds && (
                      <div className="mt-6">
                        <GlobalSidebarAdvertisements />
                      </div>
                    )}
                  </aside>
                }
              >
                {children}
              </FrontendMainLayoutClient>

              <Footer />

              {bodyScript && (
                <script dangerouslySetInnerHTML={{ __html: bodyScript }} />
              )}
            </NotificationProvider>
          </AnonymousAccessProvider>
        </body>
      )}
    </html>
  )
}