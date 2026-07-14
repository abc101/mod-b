import Link from 'next/link'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { getRelation } from '@/lib/relations'

import type {
  Navigation,
  SiteSetting,
} from '@/types/payload'
import type {
  FooterBottomLink,
  FooterColumn,
  FooterColumnLink,
} from '@/types/navigation'

const colsMap: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 lg:grid-cols-3',
  '4': 'grid-cols-1 lg:grid-cols-4',
}

function getFooterColumnLinkHref(
  link: FooterColumnLink,
): string {
  if (link.type === 'url') {
    return link.url || '#'
  }

  if (link.type === 'page') {
    const page = getRelation(link.page)

    if (!page?.slug) {
      return '#'
    }

    return page.slug === 'home'
      ? '/'
      : `/${encodeURIComponent(page.slug)}`
  }

  if (link.type === 'board') {
    const board = getRelation(link.board)

    if (!board?.slug) {
      return '#'
    }

    return `/board/${encodeURIComponent(board.slug)}`
  }

  return '#'
}

function getFooterBottomLinkHref(
  link: FooterBottomLink,
): string {
  if (link.type === 'email') {
    return link.email
      ? `mailto:${link.email}`
      : '#'
  }

  if (link.type === 'url') {
    return link.url || '#'
  }

  if (link.type === 'page') {
    const page = getRelation(link.page)

    if (!page?.slug) {
      return '#'
    }

    return page.slug === 'home'
      ? '/'
      : `/${encodeURIComponent(page.slug)}`
  }

  if (link.type === 'board') {
    const board = getRelation(link.board)

    if (!board?.slug) {
      return '#'
    }

    return `/board/${encodeURIComponent(board.slug)}`
  }

  return '#'
}

export default async function Footer() {
  const payload = await getPayload({
    config: configPromise,
  })

  const siteSettings = (await payload.findGlobal({
    slug: 'site-settings',
  })) as SiteSetting

  const navigation = (await payload.findGlobal({
    slug: 'navigation',
    depth: 2,
  })) as Navigation

  const siteName = siteSettings.siteName || 'Mod-B'

  const footer = navigation.footer
  const columns = footer?.columns ?? '3'
  const columnItems = footer?.columnItems ?? []
  const bottomBar = footer?.bottomBar ?? null
  const bottomLinks = bottomBar?.bottomLinks ?? []

  const footerWidth =
    siteSettings.design?.layout?.footerWidth ?? 'content'

  const footerInnerClass =
    footerWidth === 'full'
      ? 'w-full px-4 py-12'
      : 'w-full mx-auto px-4 py-12'

  const currentYear = new Date().getFullYear()

  const copyrightName =
    bottomBar?.copyrightName || siteName

  const showYear =
    bottomBar?.showYear !== false

  const copyrightText = showYear
    ? `© ${currentYear} ${copyrightName}`
    : `© ${copyrightName}`

  return (
    <footer className="mt-16 bg-[var(--color-footer-bg)] text-[var(--color-footer-fg)]">
      <div
        className={footerInnerClass}
        style={
          footerWidth === 'content'
            ? {
                maxWidth: 'var(--max-width)',
              }
            : undefined
        }
      >
        {/* Column grid */}
        {columnItems.length > 0 ? (
          <div
            className={`grid gap-8 text-center lg:text-left ${
              colsMap[columns] ?? colsMap['3']
            }`}
          >
            {columnItems.map(
              (column: FooterColumn, columnIndex) => {
                const links = column.links ?? []

                return (
                  <div key={column.id ?? columnIndex}>
                    {column.title && (
                      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider opacity-90 text-[var(--color-footer-fg)]">
                        {column.title}
                      </h4>
                    )}

                    {links.length > 0 && (
                      <ul className="space-y-2">
                        {links.map(
                          (
                            link: FooterColumnLink,
                            linkIndex,
                          ) => (
                            <li key={link.id ?? linkIndex}>
                              <Link
                                href={getFooterColumnLinkHref(
                                  link,
                                )}
                                target={
                                  link.openInNewTab
                                    ? '_blank'
                                    : undefined
                                }
                                rel={
                                  link.openInNewTab
                                    ? 'noopener noreferrer'
                                    : undefined
                                }
                                className="text-sm transition-opacity hover:opacity-70"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ),
                        )}
                      </ul>
                    )}
                  </div>
                )
              },
            )}
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-lg font-bold opacity-90 text-[var(--color-footer-fg)]">
              {siteName}
            </h3>

            {siteSettings.siteDescription && (
              <p className="mt-2 text-sm leading-relaxed opacity-80">
                {siteSettings.siteDescription}
              </p>
            )}
          </div>
        )}

        {/* Bottom bar */}
        <div
          className={`border-t border-gray-500/30 pt-6 ${
            columnItems.length > 0
              ? 'mt-10'
              : 'mt-4'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center text-xs">
            {bottomLinks.length > 0 && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-center sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-4 sm:gap-y-2">
                {bottomLinks.map(
                  (
                    link: FooterBottomLink,
                    linkIndex,
                  ) => {
                    const openInNewTab =
                      link.type !== 'email' &&
                      link.openInNewTab === true

                    return (
                      <Link
                        key={link.id ?? linkIndex}
                        href={getFooterBottomLinkHref(
                          link,
                        )}
                        target={
                          openInNewTab
                            ? '_blank'
                            : undefined
                        }
                        rel={
                          openInNewTab
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        className="transition-opacity hover:opacity-70"
                      >
                        {link.label}
                      </Link>
                    )
                  },
                )}
              </div>
            )}

            <span>
              {copyrightText}. All rights reserved.
            </span>

            {bottomBar?.rightText && (
              <span className="opacity-60">
                {bottomBar.rightText}
              </span>
            )}
            <div className="w-full mt-4 text-center">
              <a
                href="https://abc101.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                Powered by Mod-B
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}