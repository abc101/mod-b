import type { Notification } from '@/types/payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import {
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
} from '@/app/(frontend)/api/notifications/actions'
import EmptyState from '@/components/EmptyState'
import LocalTime from '@/components/LocalTime'

type NotificationPageItem = Notification

type NotificationFilter = 'all' | 'unread' | 'read'

type Props = {
  searchParams: Promise<{
    page?: string
    filter?: string
  }>
}

export const dynamic = 'force-dynamic'

function normalizeFilter(
  value: string | undefined,
): NotificationFilter {
  if (value === 'read' || value === 'unread') {
    return value
  }

  return 'all'
}

function buildNotificationsUrl({
  page,
  filter,
}: {
  page?: number
  filter: NotificationFilter
}) {
  const params = new URLSearchParams()

  if (filter !== 'all') {
    params.set('filter', filter)
  }

  if (page && page > 1) {
    params.set('page', String(page))
  }

  const query = params.toString()

  return query
    ? `/my-page/notifications?${query}`
    : '/my-page/notifications'
}

function tabClass(active: boolean) {
  return active
    ? 'border-blue-600 bg-blue-50 text-blue-700'
    : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
}

export default async function NotificationsPage({
  searchParams,
}: Props) {
  const params = await searchParams

  const currentPage = Math.max(
    1,
    Number(params.page) || 1,
  )
  const filter = normalizeFilter(params.filter)

  const headers = await getHeaders()
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({ headers })

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        buildNotificationsUrl({
          page: currentPage,
          filter,
        }),
      )}`,
    )
  }

  const filterCondition =
    filter === 'all'
      ? []
      : [
          {
            isRead: {
              equals: filter === 'read',
            },
          },
        ]

  const [
    notifications,
    allCountResult,
    unreadCountResult,
    readCountResult,
  ] = await Promise.all([
    payload.find({
      collection: 'notifications',
      where: {
        and: [
          {
            recipient: {
              equals: user.id,
            },
          },
          ...filterCondition,
        ],
      },
      sort: '-createdAt',
      page: currentPage,
      limit: 20,
      depth: 0,
      overrideAccess: true,
    }),

    payload.count({
      collection: 'notifications',
      where: {
        recipient: {
          equals: user.id,
        },
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'notifications',
      where: {
        and: [
          {
            recipient: {
              equals: user.id,
            },
          },
          {
            isRead: {
              equals: false,
            },
          },
        ],
      },
      overrideAccess: true,
    }),

    payload.count({
      collection: 'notifications',
      where: {
        and: [
          {
            recipient: {
              equals: user.id,
            },
          },
          {
            isRead: {
              equals: true,
            },
          },
        ],
      },
      overrideAccess: true,
    }),
  ])

  const allCount = allCountResult.totalDocs
  const unreadCount = unreadCountResult.totalDocs
  const readCount = readCountResult.totalDocs

  const emptyMessage =
    filter === 'unread'
      ? 'No unread notifications.'
      : filter === 'read'
        ? 'No read notifications.'
        : 'No notifications.'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500">
        <Link
          href="/my-page"
          className="hover:text-gray-900"
        >
          My Page
        </Link>

        <span className="mx-2">›</span>

        <span className="text-gray-900">
          Notifications
        </span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <header className="border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-semibold text-gray-900">
                Notifications
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                {allCount} total · {unreadCount} unread
              </p>
            </div>

            {unreadCount > 0 && (
              <form action={markAllNotificationsRead}>
                <button
                  type="submit"
                  className="rounded-md border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-50"
                >
                  Mark all as read
                </button>
              </form>
            )}
          </div>

          <div className="flex overflow-x-auto border-t border-gray-200 px-2">
            <Link
              href={buildNotificationsUrl({
                filter: 'all',
              })}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tabClass(
                filter === 'all',
              )}`}
            >
              All
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {allCount}
              </span>
            </Link>

            <Link
              href={buildNotificationsUrl({
                filter: 'unread',
              })}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tabClass(
                filter === 'unread',
              )}`}
            >
              Unread
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                {unreadCount}
              </span>
            </Link>

            <Link
              href={buildNotificationsUrl({
                filter: 'read',
              })}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tabClass(
                filter === 'read',
              )}`}
            >
              Read
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                {readCount}
              </span>
            </Link>
          </div>
        </header>

        {notifications.docs.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.docs.map(
              (item: NotificationPageItem) => (
                <li
                  key={item.id}
                  className={
                    item.isRead
                      ? 'bg-white'
                      : 'bg-blue-50/70'
                  }
                >
                  <div className="flex items-start gap-3 px-4 py-3">
                    <Link
                      href={`/notification/${item.id}`}
                      prefetch={false}
                      className="min-w-0 flex-1 rounded-md p-1 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            {!item.isRead && (
                              <span
                                className="h-2 w-2 shrink-0 rounded-full bg-blue-600"
                                aria-label="Unread"
                              />
                            )}

                            <h2
                              className={`truncate text-sm text-gray-900 ${
                                item.isRead
                                  ? 'font-medium'
                                  : 'font-semibold'
                              }`}
                            >
                              {item.title}
                            </h2>
                          </div>

                          {item.message && (
                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                              {item.message}
                            </p>
                          )}
                        </div>

                        <time className="shrink-0 whitespace-nowrap text-xs text-gray-400">
                          <LocalTime
                            dateString={item.createdAt}
                          />
                        </time>
                      </div>
                    </Link>

                    <div className="shrink-0">
                      {item.isRead ? (
                        <form action={markNotificationUnread}>
                          <input
                            type="hidden"
                            name="notificationId"
                            value={String(item.id)}
                          />

                          <button
                            type="submit"
                            className="rounded-md px-2 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                            title="Mark as unread"
                          >
                            Mark unread
                          </button>
                        </form>
                      ) : (
                        <form action={markNotificationRead}>
                          <input
                            type="hidden"
                            name="notificationId"
                            value={String(item.id)}
                          />

                          <button
                            type="submit"
                            className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 hover:text-blue-800"
                            title="Mark as read"
                          >
                            Mark read
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>

      {notifications.totalPages > 1 && (
        <nav
          className="mt-6 flex items-center justify-center gap-2"
          aria-label="Notifications pagination"
        >
          {notifications.hasPrevPage && (
            <Link
              href={buildNotificationsUrl({
                page: currentPage - 1,
                filter,
              })}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Previous
            </Link>
          )}

          <span className="px-3 py-2 text-sm text-gray-500">
            Page {notifications.page ?? currentPage} of{' '}
            {notifications.totalPages}
          </span>

          {notifications.hasNextPage && (
            <Link
              href={buildNotificationsUrl({
                page: currentPage + 1,
                filter,
              })}
              className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </nav>
      )}
    </div>
  )
}
