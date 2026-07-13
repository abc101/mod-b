import type { PaginatedDocs } from 'payload'
import type { Report } from '@/types/payload'

import Link from 'next/link'

import LocalTime from '@/components/LocalTime'
import DashboardSection from './DashboardSection'

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

  return typeof value === 'string'
    ? value
    : null
}

export default function ModerationQueueCard({
  reports,
}: {
  reports: PaginatedDocs<Report>
}) {
  return (
    <DashboardSection
      title="Moderation Queue"
      href="/admin/moderation"
    >
      {reports.docs.length === 0 ? (
        <div className="p-6 text-sm text-gray-400">
          No active reports.
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {reports.docs.map((report) => {
            const metadata = getMetadataObject(
              report.metadata,
            )

            const title =
              getMetadataString(metadata, 'title') ||
              getMetadataString(metadata, 'postTitle') ||
              getMetadataString(
                metadata,
                'commentContent',
              ) ||
              report.details ||
              'Reported item'

            const href = getMetadataString(
              metadata,
              'href',
            )

            return (
              <li
                key={report.id}
                className="px-4 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        {report.reason}
                      </span>

                      <span className="text-xs text-gray-400">
                        {report.status}
                      </span>

                      <span className="text-xs text-gray-400">
                        {report.targetType} #{report.targetId}
                      </span>
                    </div>

                    <div className="mt-1 truncate text-sm font-medium text-gray-900">
                      {title}
                    </div>

                    {report.createdAt && (
                      <div className="mt-1 text-xs text-gray-400">
                        <LocalTime
                          dateString={report.createdAt}
                        />
                      </div>
                    )}
                  </div>

                  {href && (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-blue-600 hover:underline"
                    >
                      Open
                    </Link>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardSection>
  )
}