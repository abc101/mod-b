import type { Report, User } from '@/types/payload'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import LocalTime from '@/components/LocalTime'
import {
  deleteReportedTarget,
  updateReportStatus,
} from './actions'

type Props = {
  searchParams: Promise<{
    status?: string
  }>
}

const statuses = [
  'open',
  'reviewing',
  'resolved',
  'dismissed',
] as const

type ReportStatus = (typeof statuses)[number]

export const dynamic = 'force-dynamic'

function isReportStatus(value: string): value is ReportStatus {
  return statuses.some((status) => status === value)
}

function getMetadataObject(
  metadata: Report['metadata'],
): Record<string, unknown> | null {
  if (
    !metadata ||
    typeof metadata !== 'object' ||
    Array.isArray(metadata)
  ) {
    return null
  }

  return metadata
}

function getMetadataString(
  metadata: Record<string, unknown> | null,
  key: string,
): string | null {
  if (!metadata) return null

  const value = metadata[key]
  return typeof value === 'string' ? value : null
}

export default async function ModerationPage({
  searchParams,
}: Props) {
  const { status = 'open' } = await searchParams

  const currentStatus: ReportStatus = isReportStatus(status)
    ? status
    : 'open'

  const headers = await getHeaders()
  const payload = await getPayload({
    config: configPromise,
  })

  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  if (
    !currentUser ||
    !['admin', 'manager'].includes(currentUser.role)
  ) {
    redirect('/login?redirect=/admin/moderation')
  }

  const reports = await payload.find({
    collection: 'reports',
    where: {
      status: {
        equals: currentStatus,
      },
    },
    sort: '-createdAt',
    limit: 50,
    depth: 1,
    overrideAccess: true,
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Moderation
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Review and process user reports.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {statuses.map((item) => (
          <Link
            key={item}
            href={`/admin/moderation?status=${item}`}
            className={`text-xs px-3 py-1.5 rounded-full border ${
              currentStatus === item
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {reports.docs.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">
            No reports.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {reports.docs.map((report) => {
              const metadata = getMetadataObject(report.metadata)

              const targetHref = getMetadataString(
                metadata,
                'href',
              )

              const targetTitle = getMetadataString(
                metadata,
                'title',
              )

              const commentContent = getMetadataString(
                metadata,
                'commentContent',
              )

              return (
                <li
                  key={report.id}
                  className="p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-600">
                          {report.reason}
                        </span>

                        <span className="text-xs text-gray-400">
                          {report.targetType} #{report.targetId}
                        </span>

                        <span className="text-xs text-gray-400">
                          <LocalTime
                            dateString={report.createdAt}
                          />
                        </span>
                      </div>

                      {targetTitle && (
                        <p className="text-sm font-medium text-gray-900 mt-2">
                          {targetTitle}
                        </p>
                      )}

                      {report.targetType === 'comment' &&
                        commentContent && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            Comment: {commentContent}
                          </p>
                        )}

                      {report.details && (
                        <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                          {report.details}
                        </p>
                      )}

                      {targetHref && (
                        <Link
                          href={targetHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block text-xs text-blue-600 hover:underline mt-2"
                        >
                          Open target →
                        </Link>
                      )}

                      <div className="text-xs text-gray-400 mt-2">
                        Reporter IP:{' '}
                        {report.reporterIp || 'unknown'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                      {currentStatus !== 'reviewing' && (
                        <form
                          action={async () => {
                            'use server'

                            await updateReportStatus(
                              report.id,
                              'reviewing',
                            )
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Reviewing
                          </button>
                        </form>
                      )}

                      {currentStatus !== 'resolved' && (
                        <form
                          action={async () => {
                            'use server'

                            await updateReportStatus(
                              report.id,
                              'resolved',
                            )
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded hover:bg-gray-700"
                          >
                            Resolve
                          </button>
                        </form>
                      )}

                      {currentStatus !== 'dismissed' && (
                        <form
                          action={async () => {
                            'use server'

                            await updateReportStatus(
                              report.id,
                              'dismissed',
                            )
                          }}
                        >
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Dismiss
                          </button>
                        </form>
                      )}

                      <form
                        action={async () => {
                          'use server'

                          await deleteReportedTarget(report.id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-xs px-3 py-1.5 border border-red-200 text-red-600 rounded hover:bg-red-50"
                        >
                          Delete target
                        </button>
                      </form>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}