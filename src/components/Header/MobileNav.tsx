'use client'

import type { ComponentProps } from 'react'
import type { User } from '@/types/payload'
import type {
  HeaderNavChild,
  HeaderNavItem,
} from '@/types/navigation'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import DateTimeTicker from '@/components/DateTimeTicker'
import LogoutButton from './LogoutButton'
import { getRelation } from '@/lib/relations'

type DateTimeTickerSettings =
  ComponentProps<typeof DateTimeTicker>['settings']

type Props = {
  items: HeaderNavItem[]
  user: User | null
  siteName: string
  dateTimeSettings?: DateTimeTickerSettings
}

function getPageHref(
  value: HeaderNavItem['page'] | HeaderNavChild['page'],
): string | null {
  const page = getRelation(value)

  if (!page?.slug) {
    return null
  }

  return page.slug === 'home'
    ? '/'
    : `/${encodeURIComponent(page.slug)}`
}

function getBoardHref(
  value: HeaderNavItem['board'] | HeaderNavChild['board'],
): string | null {
  const board = getRelation(value)

  if (!board?.slug) {
    return null
  }

  return `/board/${encodeURIComponent(board.slug)}`
}

function getItemHref(
  item: HeaderNavItem | HeaderNavChild,
): string {
  if (item.type === 'board') {
    return getBoardHref(item.board) ?? '#'
  }

  if (item.type === 'url') {
    return item.url || '#'
  }

  if (item.type === 'page') {
    return getPageHref(item.page) ?? '#'
  }

  return '#'
}

function getDropdownHref(
  item: HeaderNavItem,
): string | null {
  if (item.dropdownLinkType === 'page') {
    return getPageHref(item.dropdownPage)
  }

  if (
    item.dropdownLinkType === 'url' &&
    item.dropdownUrl
  ) {
    return item.dropdownUrl
  }

  return null
}

function DropdownArrow({
  expanded,
}: {
  expanded: boolean
}) {
  return (
    <svg
      className={`h-3 w-3 transition-transform ${
        expanded ? 'rotate-180' : ''
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  )
}

export default function MobileNav({
  items,
  user,
  siteName,
  dateTimeSettings,
}: Props) {
  const pathname = usePathname() || '/'

  const activeItems = items.filter(
    (item) => item.isActive !== false,
  )

  const [open, setOpen] = useState(false)

  const [expandedItems, setExpandedItems] = useState<number[]>(
    activeItems.map((_, index) => index),
  )

  const isAuthPage =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register')

  const redirectUrl = isAuthPage
    ? '/'
    : pathname

  useEffect(() => {
    if (!open) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      )

      document.body.style.overflow = ''
    }
  }, [open])

  const toggleExpand = (index: number) => {
    setExpandedItems((previous) => {
      return previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index]
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded hover:bg-gray-100 md:hidden"
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span
          className={`block h-0.5 w-5 bg-gray-700 transition-all duration-200 ${
            open
              ? 'translate-y-2 rotate-45'
              : ''
          }`}
        />

        <span
          className={`block h-0.5 w-5 bg-gray-700 transition-all duration-200 ${
            open ? 'opacity-0' : ''
          }`}
        />

        <span
          className={`block h-0.5 w-5 bg-gray-700 transition-all duration-200 ${
            open
              ? '-translate-y-2 -rotate-45'
              : ''
          }`}
        />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed right-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          open
            ? 'translate-x-0'
            : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <span className="font-bold text-gray-900">
            {siteName}
          </span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xl leading-none text-gray-500 hover:text-gray-900"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="border-b border-gray-100 bg-gray-50 px-5 py-2">
          <DateTimeTicker
            settings={dateTimeSettings}
          />
        </div>

        <div className="h-full overflow-y-auto pb-20">
          {user ? (
            <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
              <p className="text-sm font-medium text-gray-900">
                {user.nickname || user.email}
              </p>

              <p className="mt-0.5 text-xs text-gray-400">
                {user.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/my-page"
                  onClick={() => setOpen(false)}
                  className="rounded border border-gray-300 px-3 py-1.5 text-xs hover:bg-gray-100"
                >
                  My Page
                </Link>

                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded bg-gray-900 px-3 py-1.5 text-xs text-white hover:bg-gray-700"
                  >
                    Admin
                  </Link>
                )}

                <LogoutButton className="rounded border border-red-200 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50" />
              </div>
            </div>
          ) : (
            <div className="flex gap-3 border-b border-gray-100 bg-gray-50 px-5 py-4">
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  redirectUrl,
                )}`}
                onClick={() => setOpen(false)}
                className="flex-1 rounded border border-gray-300 px-4 py-2 text-center text-sm hover:bg-gray-100"
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 rounded bg-gray-900 px-4 py-2 text-center text-sm text-white hover:bg-gray-700"
              >
                Register
              </Link>
            </div>
          )}

          <nav className="px-3 py-3">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
            >
              🏠 Home
            </Link>

            {activeItems.map((item, index) => {
              if (item.type === 'dropdown') {
                const isExpanded =
                  expandedItems.includes(index)

                const topHref =
                  getDropdownHref(item)

                const openTopLinkInNewTab =
                  item.dropdownLinkType === 'url' &&
                  item.dropdownOpenInNewTab === true

                const children =
                  item.children ?? []

                return (
                  <div key={item.id ?? index}>
                    <div className="flex items-center gap-1">
                      {topHref ? (
                        <Link
                          href={topHref}
                          target={
                            openTopLinkInNewTab
                              ? '_blank'
                              : undefined
                          }
                          rel={
                            openTopLinkInNewTab
                              ? 'noopener noreferrer'
                              : undefined
                          }
                          onClick={() => setOpen(false)}
                          className="flex-1 rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📂 {item.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpand(index)
                          }
                          className="flex-1 rounded-lg px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          📂 {item.label}
                        </button>
                      )}

                      {children.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleExpand(index)
                          }
                          className="rounded-lg px-3 py-2.5 text-gray-500 hover:bg-gray-100"
                          aria-label={`Toggle ${item.label}`}
                          aria-expanded={isExpanded}
                        >
                          <DropdownArrow
                            expanded={isExpanded}
                          />
                        </button>
                      )}
                    </div>

                    {isExpanded &&
                      children.length > 0 && (
                        <div className="ml-4 border-l border-gray-200 pl-2">
                          {children.map(
                            (child, childIndex) => {
                              const openInNewTab =
                                child.type === 'url' &&
                                child.openInNewTab === true

                              return (
                                <Link
                                  key={
                                    child.id ??
                                    childIndex
                                  }
                                  href={getItemHref(
                                    child,
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
                                  onClick={() =>
                                    setOpen(false)
                                  }
                                  className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                                >
                                  {child.label}
                                </Link>
                              )
                            },
                          )}
                        </div>
                      )}
                  </div>
                )
              }

              const openInNewTab =
                item.type === 'url' &&
                item.openInNewTab === true

              return (
                <Link
                  key={item.id ?? index}
                  href={getItemHref(item)}
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
                  onClick={() => setOpen(false)}
                  className="flex items-center rounded-lg px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                >
                  📋 {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </>
  )
}