import type { PaginatedDocs } from 'payload'
import type { LoginLog } from '@/types/payload'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LocalTime from '@/components/LocalTime'
import Pagination from '@/components/Pagination'

type Props = {
  searchParams: Promise<{ page?: string }>
}

export const dynamic = 'force-dynamic'

export default async function MyLoginLogsPage({ searchParams }: Props) {
  const { page = '1' } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/login?redirect=/my-page/login-logs')

  const loginLogs: PaginatedDocs<LoginLog>  = await payload.find({
    collection: 'login-logs',
    where: {
      user: { equals: user.id },
    },
    sort: '-createdAt',
    page: currentPage,
    limit: 20,
    depth: 0,
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/my-page" className="hover:text-gray-900">
          My Page
        </Link>
        <span className="mx-2">›</span>
        <span className="text-gray-900">Login History</span>
      </nav>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h1 className="font-semibold text-gray-900">Login History</h1>
          <span className="text-xs text-gray-400">
            {loginLogs.totalDocs} total
          </span>
        </div>

        <ul className="divide-y divide-gray-100">
          {loginLogs.docs.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-gray-400">
              No login history yet.
            </li>
          ) : (
            loginLogs.docs.map((log) => (
              <li key={log.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-700">
                    <LocalTime dateString={log.createdAt} />
                  </span>

                  <span className="text-xs text-gray-400 shrink-0">
                    {log.ipAddress || 'unknown'}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                  {log.eventType && <span>Event: {log.eventType}</span>}
                  {log.loginMethod && <span>Method: {log.loginMethod}</span>}
                  {typeof log.success === 'boolean' && (
                    <span>{log.success ? 'Success' : 'Failed'}</span>
                  )}
                </div>

                {log.userAgent && (
                  <div className="mt-1 text-xs text-gray-400">
                    {log.userAgent}
                  </div>
                )}

                {log.userAgent && (
                  <div className="mt-1 text-xs text-gray-400 truncate">
                    {log.userAgent}
                  </div>
                )}
              </li>
            ))
          )}
        </ul>
      </div>

      <Pagination
        basePath="/my-page/login-logs"
        currentPage={loginLogs.page || currentPage}
        totalPages={loginLogs.totalPages || 1}
      />
    </div>
  )
}
