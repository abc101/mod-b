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
          <div className="flex items-center px-4 justify-between gap-4" style={{ height: 'var(--header-height)' }}>
            
            <Link 
              href="/" 
              className="text-xl shrink-0 text-[var(--color-fg)]"
              style={{ fontWeight: 'var(--font-weight-heading)' }}
            >
              {siteLogoDoc?.url ? (
                <img src={siteLogoDoc.url } alt="" className="h-8 inline-block mr-2" />
              ) :  <img src="data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB3aWR0aD0iMTAwJSIgdmlld0JveD0iMCAwIDY0IDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA2NCA2NCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGZpbGw9IiNGQkZCRkIiIG9wYWNpdHk9IjEuMDAwMDAwIiBzdHJva2U9Im5vbmUiIAoJZD0iCk00NC4wMDA1NTcsNjUuMDAwMDAwIAoJQzI5LjMzMzczNiw2NS4wMDAwMDAgMTUuMTY3MDg5LDY1LjAwMDAwMCAxLjAwMDMzMSw2NS4wMDAwMDAgCglDMS4wMDAyMjEsNDMuNjY2ODQzIDEuMDAwMjIxLDIyLjMzMzY4MyAxLjAwMDExMCwxLjAwMDM5NCAKCUMyMi4zMzMxMzAsMS4wMDAyNjIgNDMuNjY2MjYwLDEuMDAwMjYyIDY0Ljk5OTU0MiwxLjAwMDEzMSAKCUM2NC45OTk2OTUsMjIuMzMzMTAxIDY0Ljk5OTY5NSw0My42NjYyMDMgNjQuOTk5ODQ3LDY0Ljk5OTY0OSAKCUM1OC4xNjY5MTIsNjUuMDAwMDAwIDUxLjMzMzgyMCw2NS4wMDAwMDAgNDQuMDAwNTU3LDY1LjAwMDAwMCAKTTYyLjkzMzE5Nyw1MS44ODM1MzcgCglDNjEuNTExOTI1LDQ4LjgxNzUyOCA2MC4wOTA2NTIsNDUuNzUxNTIyIDU4LjQzOTE0NCw0Mi4xODg4MzUgCglDNTguMzMxNDEzLDQyLjQxNTU3MyA1OC41Njg2OTEsNDEuOTg0MDI4IDU4Ljc0NzY1NCw0MS41Mjk1MjIgCglDNjIuNDg5MzI2LDMyLjAyNjg0OCA1OS4xNjQ2OTIsMjcuMDA1MzMxIDQ5LjEyMzY1NywyNi45OTMwMzIgCglDNDQuMTY5Mjg5LDI2Ljk4Njk2NSAzOS4yMTQ5MDEsMjYuOTkxOTgwIDMzLjc3NDAzMywyNi45OTE5ODAgCglDMzMuNzc0MDMzLDE5LjM0MTAwMiAzMy43NzQwMzMsMTIuMTA1NTQ2IDMzLjc3NDAzMyw0LjYzMjA0MCAKCUMzMS41MzAxODAsNC42MzIwNDAgMjkuNzgzNTE0LDQuNjMyMDQwIDI3LjQ0MzY0MCw0LjYzMjA0MCAKCUMyNy40NDM2NDAsMTIuNzM4MTkzIDI3LjU0OTg3MywyMC42ODMyMTQgMjcuNDEyNzkyLDI4LjYyNDAzNyAKCUMyNy4yODQwNTQsMzYuMDgxNTY2IDI3LjE3MDMxMSwzNi4xNDExMzIgMTkuNjk5MDU3LDM2LjA2NTIzNSAKCUM5LjE1NDI0MCwzNS45NTgxMTggMTAuMTg4MzI3LDM3LjkzODMxMyAxMC4wNjY2NjYsMjYuMDI0NDAzIAoJQzEwLjAzNjMwMywyMy4wNTA5ODMgMTEuMTMxNzExLDIxLjc2MjQyNiAxNC4xNjkyOTMsMjEuODk3Mzc1IAoJQzE3LjU3NDkxMSwyMi4wNDg2NzIgMjAuOTkyNDI0LDIxLjkzMjEzNyAyNC4zNDg1MzQsMjEuOTMyMTM3IAoJQzI0LjM0ODUzNCwxOS41NTU3NzEgMjQuMzQ4NTM0LDE3Ljk0NzE0NCAyNC4zNDg1MzQsMTYuMDk1NzcyIAoJQzIyLjgzMDEwOSwxNi4wMjA4MjMgMjEuNTM2NTMzLDE1Ljk2MDIwMCAyMC4yNDMzMTksMTUuODkyNjQ3IAoJQzQuMTMzODUxLDE1LjA1MTEzNiAzLjQ3NjAyOSwxOC43NDAzNzQgMy45MjYxODcsMzIuNjMwMDEzIAoJQzQuMTMwNTU1LDM4LjkzNTc4MyA3LjI0NDU5MSw0Mi4wNTE2MTcgMTMuNTI4NDY2LDQyLjEyMjYxNiAKCUMxOC4yNzU1OTEsNDIuMTc2MjU0IDIzLjAyMzgwOCw0Mi4xMzMyMzYgMjcuOTE3NzcwLDQyLjEzMzIzNiAKCUMyNy45MTc3NzAsNDcuNTk2NDM5IDI4LjA1NzM3MSw1Mi40MTg1NDEgMjcuODcyMzE0LDU3LjIyODE1MyAKCUMyNy43MzE2MzAsNjAuODg0NTUyIDI5LjE1MTAzOSw2Mi4zMDk0MTQgMzIuODM3MTA5LDYyLjIxMDk1MyAKCUMzOS42NTUzMzQsNjIuMDI4ODIwIDQ2LjQ4MTk2NCw2Mi4xNzYyMzkgNTMuMzA0OTkzLDYyLjE1NDgyNyAKCUM2MC41OTE2MDIsNjIuMTMxOTU4IDYyLjcwMjU2OCw2MC4wNTMzODcgNjIuOTMzMTk3LDUxLjg4MzUzNyAKeiIvPgo8cGF0aCBmaWxsPSIjMUMyMjJGIiBvcGFjaXR5PSIxLjAwMDAwMCIgc3Ryb2tlPSJub25lIiAKCWQ9IgpNNjIuOTU4MTYwLDUyLjI5MzMyNyAKCUM2Mi43MDI1NjgsNjAuMDUzMzg3IDYwLjU5MTYwMiw2Mi4xMzE5NTggNTMuMzA0OTkzLDYyLjE1NDgyNyAKCUM0Ni40ODE5NjQsNjIuMTc2MjM5IDM5LjY1NTMzNCw2Mi4wMjg4MjAgMzIuODM3MTA5LDYyLjIxMDk1MyAKCUMyOS4xNTEwMzksNjIuMzA5NDE0IDI3LjczMTYzMCw2MC44ODQ1NTIgMjcuODcyMzE0LDU3LjIyODE1MyAKCUMyOC4wNTczNzEsNTIuNDE4NTQxIDI3LjkxNzc3MCw0Ny41OTY0MzkgMjcuOTE3NzcwLDQyLjEzMzIzNiAKCUMyMy4wMjM4MDgsNDIuMTMzMjM2IDE4LjI3NTU5MSw0Mi4xNzYyNTQgMTMuNTI4NDY2LDQyLjEyMjYxNiAKCUM3LjI0NDU5MSw0Mi4wNTE2MTcgNC4xMzA1NTUsMzguOTM1NzgzIDMuOTI2MTg3LDMyLjYzMDAxMyAKCUMzLjQ3NjAyOSwxOC43NDAzNzQgNC4xMzM4NTEsMTUuMDUxMTM2IDIwLjI0MzMxOSwxNS44OTI2NDcgCglDMjEuNTM2NTMzLDE1Ljk2MDIwMCAyMi44MzAxMDksMTYuMDIwODIzIDI0LjM0ODUzNCwxNi4wOTU3NzIgCglDMjQuMzQ4NTM0LDE3Ljk0NzE0NCAyNC4zNDg1MzQsMTkuNTU1NzcxIDI0LjM0ODUzNCwyMS45MzIxMzcgCglDMjAuOTkyNDI0LDIxLjkzMjEzNyAxNy41NzQ5MTEsMjIuMDQ4NjcyIDE0LjE2OTI5MywyMS44OTczNzUgCglDMTEuMTMxNzExLDIxLjc2MjQyNiAxMC4wMzYzMDMsMjMuMDUwOTgzIDEwLjA2NjY2NiwyNi4wMjQ0MDMgCglDMTAuMTg4MzI3LDM3LjkzODMxMyA5LjE1NDI0MCwzNS45NTgxMTggMTkuNjk5MDU3LDM2LjA2NTIzNSAKCUMyNy4xNzAzMTEsMzYuMTQxMTMyIDI3LjI4NDA1NCwzNi4wODE1NjYgMjcuNDEyNzkyLDI4LjYyNDAzNyAKCUMyNy41NDk4NzMsMjAuNjgzMjE0IDI3LjQ0MzY0MCwxMi43MzgxOTMgMjcuNDQzNjQwLDQuNjMyMDQwIAoJQzI5Ljc4MzUxNCw0LjYzMjA0MCAzMS41MzAxODAsNC42MzIwNDAgMzMuNzc0MDMzLDQuNjMyMDQwIAoJQzMzLjc3NDAzMywxMi4xMDU1NDYgMzMuNzc0MDMzLDE5LjM0MTAwMiAzMy43NzQwMzMsMjYuOTkxOTgwIAoJQzM5LjIxNDkwMSwyNi45OTE5ODAgNDQuMTY5Mjg5LDI2Ljk4Njk2NSA0OS4xMjM2NTcsMjYuOTkzMDMyIAoJQzU5LjE2NDY5MiwyNy4wMDUzMzEgNjIuNDg5MzI2LDMyLjAyNjg0OCA1OC43NDc2NTQsNDEuNTI5NTIyIAoJQzU4LjU2ODY5MSw0MS45ODQwMjggNTguMzMxNDEzLDQyLjQxNTU3MyA1OC40MzkxNDQsNDIuMTg4ODM1IAoJQzYwLjA5MDY1Miw0NS43NTE1MjIgNjEuNTExOTI1LDQ4LjgxNzUyOCA2Mi45NTgxNjAsNTIuMjkzMzI3IApNNTIuODU2NDM0LDQ3LjkxMjI2NiAKCUM0Ny42MzAwNzQsNDcuOTEyMjY2IDQyLjQwMzcxMyw0Ny45MTIyNjYgMzcuMjI2OTUyLDQ3LjkxMjI2NiAKCUMzNy4yMjY5NTIsNDUuMjgwNDQ5IDM3LjIyNjk1Miw0My42ODY0MzYgMzcuMjI2OTUyLDQxLjcwNTA1OSAKCUM0MC43Nzc2NDUsNDEuNzA1MDU5IDQ0LjA3NTkyMCw0MS44MDU4OTMgNDcuMzY1NzY1LDQxLjY4MjI3NCAKCUM1Mi43OTA3NzUsNDEuNDc4NDI0IDU0LjM3NTExMSwzOS4zMTE0MzIgNTMuNDI0NzQwLDMzLjM3ODMxNSAKCUM0Ny4wODg0NjcsMzMuMzc4MzE1IDQwLjcxNjQzNCwzMy4zNzgzMTUgMzQuMjk5NTQ1LDMzLjM3ODMxNSAKCUMzNC4yOTk1NDUsNDEuMDkzMTcwIDM0LjI5OTU0NSw0OC40ODA1NDUgMzQuMjk5NTQ1LDU1LjY5OTk2NiAKCUM0Mi4wMTI3NDUsNTUuNjk5OTY2IDQ5LjM4Mzc3NCw1NS42OTk5NjYgNTguNTA5OTQ1LDU1LjY5OTk2NiAKCUM1Ni40NDAzNTcsNTIuNDQxMTU4IDU1LjA3Mzk5Nyw1MC4yODk2NjEgNTIuODU2NDM0LDQ3LjkxMjI2NiAKeiIvPgo8cGF0aCBmaWxsPSIjRjVGNUY1IiBvcGFjaXR5PSIxLjAwMDAwMCIgc3Ryb2tlPSJub25lIiAKCWQ9IgpNNTMuMjgyMDM2LDQ4LjAyNTIxNSAKCUM1NS4wNzM5OTcsNTAuMjg5NjYxIDU2LjQ0MDM1Nyw1Mi40NDExNTggNTguNTA5OTQ1LDU1LjY5OTk2NiAKCUM0OS4zODM3NzQsNTUuNjk5OTY2IDQyLjAxMjc0NSw1NS42OTk5NjYgMzQuMjk5NTQ1LDU1LjY5OTk2NiAKCUMzNC4yOTk1NDUsNDguNDgwNTQ1IDM0LjI5OTU0NSw0MS4wOTMxNzAgMzQuMjk5NTQ1LDMzLjM3ODMxNSAKCUM0MC43MTY0MzQsMzMuMzc4MzE1IDQ3LjA4ODQ2NywzMy4zNzgzMTUgNTMuNDI0NzQwLDMzLjM3ODMxNSAKCUM1NC4zNzUxMTEsMzkuMzExNDMyIDUyLjc5MDc3NSw0MS40Nzg0MjQgNDcuMzY1NzY1LDQxLjY4MjI3NCAKCUM0NC4wNzU5MjAsNDEuODA1ODkzIDQwLjc3NzY0NSw0MS43MDUwNTkgMzcuMjI2OTUyLDQxLjcwNTA1OSAKCUMzNy4yMjY5NTIsNDMuNjg2NDM2IDM3LjIyNjk1Miw0NS4yODA0NDkgMzcuMjI2OTUyLDQ3LjkxMjI2NiAKCUM0Mi40MDM3MTMsNDcuOTEyMjY2IDQ3LjYzMDA3NCw0Ny45MTIyNjYgNTMuMjgyMDM2LDQ4LjAyNTIxNSAKeiIvPgo8L3N2Zz4=
" alt="" className="h-8 inline-block mr-2" />}
              {siteName}
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

            <div className="flex md:hidden items-center gap-1">
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