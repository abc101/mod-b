'use client'

import Link from 'next/link'
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from 'react'

import { markAllNotificationsRead } from '@/app/(frontend)/api/notifications/actions'
import LocalTime from '@/components/LocalTime'
import { useNotifications } from '@/components/NotificationProvider'

type NotificationItem = {
  id: number | string
  title: string
  message?: string
  href?: string
  isRead?: boolean
  createdAt?: string
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const rootRef = useRef<HTMLDivElement>(null)

  const {
    unreadCount,
    items,
    refresh,
  } = useNotifications()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener(
      'mousedown',
      handleClickOutside,
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside,
      )
    }
  }, [])

  function handleToggle() {
    // Opening or closing the dropdown must not
    // change the notification read status.
    setOpen((previous) => !previous)
    setError(null)
  }

  function handleClose() {
    setOpen(false)
    setError(null)
  }

  function handleMarkAllRead() {
    if (isPending || unreadCount === 0) {
      return
    }

    setError(null)

    startTransition(async () => {
      try {
        // This action runs only when the user explicitly
        // clicks the "Mark all as read" button.
        await markAllNotificationsRead()

        // Refresh the provider data so the unread badge
        // and dropdown items reflect the updated state.
        await refresh()
      } catch (caughtError) {
        console.error(
          'Failed to mark notifications as read:',
          caughtError,
        )

        setError(
          'Could not update notifications. Please try again.',
        )
      }
    })
  }

  return (
    <div
      ref={rootRef}
      className="relative"
    >
      <button
        type="button"
        onClick={handleToggle}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span
          className="text-base"
          aria-hidden="true"
        >
          🔔
        </span>

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 text-white">
            {unreadCount > 9
              ? '9+'
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Notifications
              </div>

              <div className="text-xs text-gray-400">
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : 'All caught up'}
              </div>
            </div>

            <Link
              href="/my-page/notifications"
              onClick={handleClose}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              View all
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No notifications.
            </div>
          ) : (
            <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto">
              {items.map(
                (item: NotificationItem) => (
                  <li key={item.id}>
                    <Link
                      href={`/notification/${item.id}`}
                      prefetch={false}
                      onClick={handleClose}
                      className={`block px-4 py-3 transition hover:bg-gray-50 ${
                        item.isRead
                          ? 'bg-white'
                          : 'bg-blue-50/70'
                      }`}
                      role="menuitem"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!item.isRead && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
                                aria-label="Unread"
                              />
                            )}

                            <p
                              className={`truncate text-sm text-gray-900 ${
                                item.isRead
                                  ? 'font-medium'
                                  : 'font-semibold'
                              }`}
                            >
                              {item.title}
                            </p>
                          </div>

                          {item.message && (
                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                              {item.message}
                            </p>
                          )}
                        </div>

                        {item.createdAt && (
                          <span className="shrink-0 text-[11px] text-gray-400">
                            <LocalTime
                              dateString={
                                item.createdAt
                              }
                            />
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ),
              )}
            </ul>
          )}

          {error && (
            <div
              className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          {unreadCount > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={
                  isPending ||
                  unreadCount === 0
                }
                className="w-full rounded-md px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending
                  ? 'Updating...'
                  : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}