'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

type Visibility = {
  showOnHome?: boolean | null
  showOnBoard?: boolean | null
  showOnPost?: boolean | null
  showOnSearch?: boolean | null
  showOnTag?: boolean | null
  showOnUser?: boolean | null
  showOnLogin?: boolean | null
  showOnMyPage?: boolean | null
}

export default function FrontendMainLayoutClient({
  children,
  sidebar,
  hasSidebarContent,
  sidebarPosition = 'right',
  visibility = {},
  mainContainerClass,
}: {
  children: React.ReactNode
  sidebar?: React.ReactNode
  hasSidebarContent: boolean
  sidebarPosition?: 'left' | 'right'
  visibility?: Visibility
  mainContainerClass: string
}) {
  const pathname = usePathname() || '/'

  const isHomePage = pathname === '/'
  const isPostPage = /^\/board\/[^/]+\/[^/]+/.test(pathname)
  const isBoardPage = pathname.startsWith('/board/') && !isPostPage
  const isSearchPage = pathname.startsWith('/search')
  const isTagPage = pathname.startsWith('/tag/')
  const isUserPage = pathname.startsWith('/user/')
  const isLoginPage = pathname.startsWith('/login') || pathname.startsWith('/register')
  const isMyPage = pathname.startsWith('/my-page')

  const showSidebar =
    hasSidebarContent &&
    (
      (isHomePage && visibility.showOnHome !== false) ||
      (isBoardPage && visibility.showOnBoard !== false) ||
      (isPostPage && visibility.showOnPost !== false) ||
      (isSearchPage && visibility.showOnSearch !== false) ||
      (isTagPage && visibility.showOnTag !== false) ||
      (isUserPage && visibility.showOnUser !== false) ||
      (isLoginPage && visibility.showOnLogin !== false) ||
      (isMyPage && visibility.showOnMyPage !== false) ||
      (
        !isHomePage &&
        !isBoardPage &&
        !isPostPage &&
        !isSearchPage &&
        !isTagPage &&
        !isUserPage &&
        !isLoginPage &&
        !isMyPage
      )
    )

  const gridClass = !showSidebar
    ? 'grid-cols-1'
    : sidebarPosition === 'left'
      ? 'grid-cols-1 lg:grid-cols-[minmax(320px,3fr)_minmax(0,7fr)]'
      : 'grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]'

  return (
    <main className="w-full flex-1">
      <div className={`${mainContainerClass} grid ${gridClass} gap-8`}>
        {showSidebar && sidebarPosition === 'left' && sidebar}

        <div className="min-w-0">{children}</div>

        {showSidebar && sidebarPosition === 'right' && sidebar}
      </div>
    </main>
  )
}