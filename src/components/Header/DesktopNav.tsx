'use client'

import Link from 'next/link'

import { getRelation } from '@/lib/relations'

import type {
  HeaderNavChild,
  HeaderNavItem,
} from '@/types/navigation'

type Props = {
  items: HeaderNavItem[]
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

function DropdownIcon() {
  return (
    <svg
      className="h-3 w-3 transition-transform group-hover:rotate-180"
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

function DropdownMenu({
  item,
}: {
  item: HeaderNavItem
}) {
  const topHref = getDropdownHref(item)
  const children = item.children ?? []

  const openTopLinkInNewTab =
    item.dropdownLinkType === 'url' &&
    item.dropdownOpenInNewTab === true

  const triggerClass =
    'flex items-center gap-1 whitespace-nowrap rounded px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900'

  return (
    <div className="group relative">
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
          className={triggerClass}
        >
          {item.label}
          <DropdownIcon />
        </Link>
      ) : (
        <button
          type="button"
          className={triggerClass}
          aria-haspopup="menu"
        >
          {item.label}
          <DropdownIcon />
        </button>
      )}

      {children.length > 0 && (
        <div
          className="invisible absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100"
          role="menu"
        >
          {children.map((child, index) => {
            const href = getItemHref(child)
            const openInNewTab =
              child.type === 'url' &&
              child.openInNewTab === true

            return (
              <Link
                key={child.id ?? index}
                href={href}
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
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                role="menuitem"
              >
                {child.label}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DesktopNav({
  items,
}: Props) {
  const activeItems = items.filter(
    (item) => item.isActive !== false,
  )

  return (
    <nav className="hidden items-center gap-1 overflow-visible px-4 py-2 md:flex">
      <Link
        href="/"
        className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        Home
      </Link>

      {activeItems.map((item, index) => {
        if (item.type === 'dropdown') {
          return (
            <DropdownMenu
              key={item.id ?? index}
              item={item}
            />
          )
        }

        const href = getItemHref(item)

        const openInNewTab =
          item.type === 'url' &&
          item.openInNewTab === true

        return (
          <Link
            key={item.id ?? index}
            href={href}
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
            className="whitespace-nowrap rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}