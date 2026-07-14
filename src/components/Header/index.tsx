import Link from 'next/link'
import { headers as getHeaders } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import LogoutButton from './LogoutButton'
import MobileNav from './MobileNav'
import SearchBox from './SearchBox'
import DesktopNav from './DesktopNav'
import LoginLink from './LoginLink'
import SessionExpiryWatcher from '@/components/SessionExpiryWatcher'
import DateTimeTicker from '@/components/DateTimeTicker'
import NotificationBell from '@/components/NotificationBell'
import type {
  Navigation,
  SiteSetting,
  DateTimeSetting,
  User,
} from '@/types/payload'
import { getRelation } from '@/lib/relations'

export default async function Header() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  const siteSettings = await payload.findGlobal({ slug: 'site-settings' }) as SiteSetting
  const navigation = await payload.findGlobal({ slug: 'navigation' }) as Navigation

  const siteName = siteSettings?.siteName || 'Mod-B'
  const siteLogo = siteSettings?.siteLogo || null
  const siteLogoDoc = getRelation(siteLogo)
  const navItems = navigation?.items || []

  const headerWidth = siteSettings?.design?.layout?.headerWidth || 'full'
  const navWidth = siteSettings?.design?.layout?.navWidth || 'full'

  const dateTimeSettings = await payload.findGlobal({
    slug: 'date-time-settings',
  }) as any

  return (
    <>
    <header className="sticky top-0 z-[99999] w-full flex flex-col">
      <div className="w-full bg-[var(--color-header-bg)] border-b border-gray-200">
        <div 
          className="mx-auto w-full"
          style={{ maxWidth: headerWidth === 'content' ? 'var(--max-width)' : '100%' }}
        >
          <div
            className="flex min-w-0 items-center justify-between gap-2 overflow-hidden px-4 sm:gap-4"
            style={{ height: 'var(--header-height)' }}
          >
            
            <Link
              href="/"
              className="flex min-w-0 flex-1 items-center text-[var(--color-fg)] md:flex-none"
              style={{ fontWeight: 'var(--font-weight-heading)' }}
            >
              {siteLogoDoc?.url ? (
                <img
                  src={siteLogoDoc.url}
                  alt=""
                  className="mr-2 h-8 w-auto shrink-0"
                />
              ) : (
                <img
                  src="..."
                  alt=""
                  className="mr-2 h-8 w-auto shrink-0"
                />
              )}

              <span className="min-w-0 truncate text-sm sm:text-base md:text-xl">
                {siteName}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4 flex-1 justify-end">
              <SearchBox />
              {user ? (
                <>
                  <Link
                    href="/my-page/bookmarks"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Bookmarks"
                    title="Bookmarks"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.74.439L8 13.069l-5.26 2.87A.5.5 0 0 1 2 15.5V2z"/>
                    </svg>

                  </Link>
                  <NotificationBell />

                  <Link href="/my-page" className="text-sm text-[var(--color-fg)] opacity-80 hover:opacity-100">
                    {currentUser?.nickname || user.email}
                  </Link>
                  <LogoutButton className="text-sm text-[var(--color-fg)] opacity-80 hover:opacity-100" />
                  {currentUser?.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="bg-[var(--color-primary)] text-[var(--color-primary-fg)] px-3 py-1 text-xs hover:opacity-90"
                      style={{ borderRadius: 'var(--border-radius)' }}
                    >
                      Admin
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <LoginLink />
                  <Link 
                    href="/register" 
                    className="bg-[var(--color-primary)] text-[var(--color-primary-fg)] px-3 py-1 text-sm hover:opacity-90"
                    style={{ borderRadius: 'var(--border-radius)' }}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1 md:hidden">
              <SearchBox />
              <MobileNav
                items={navItems}
                user={currentUser}
                siteName={siteName}
                dateTimeSettings={dateTimeSettings}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full bg-[var(--color-nav-bg)] border-b border-gray-200">
        <div 
          className="mx-auto w-full"
          style={{ maxWidth: navWidth === 'content' ? 'var(--max-width)' : '100%' }}
        >
           <div className="hidden md:flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DesktopNav items={navItems} />
            </div>

            <div className="shrink-0 pr-4">
              <DateTimeTicker settings={dateTimeSettings} />
            </div>
          </div>
                    
        </div>
      </div>
    </header>
    <SessionExpiryWatcher />
    </>
  )
}