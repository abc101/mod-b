import type { User } from '@/payload-types'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { getDashboardData } from '@/lib/admin/dashboard'
import DashboardStats from '@/components/admin/dashboard/DashboardStats'
import AnalyticsOverview from '@/components/admin/dashboard/AnalyticsOverview'
import ModerationQueueCard from '@/components/admin/dashboard/ModerationQueueCard'
import CommunityHealthCard from '@/components/admin/dashboard/CommunityHealthCard'
import RecentActivityCard from '@/components/admin/dashboard/RecentActivityCard'
import LatestPostsCard from '@/components/admin/dashboard/LatestPostsCard'
import RecentCommentsCard from '@/components/admin/dashboard/RecentCommentsCard'
import QuickLinksCard from '@/components/admin/dashboard/QuickLinksCard'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })
  const currentUser = user as User | null

  if (!currentUser || !['admin', 'manager'].includes(currentUser.role ?? '')) {
    redirect('/login?redirect=/admin/dashboard')
  }

  const dashboard = await getDashboardData(payload)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Community overview, moderation, analytics, and recent activity.
          </p>
        </div>

        <Link
          href="/admin/moderation"
          className="rounded bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-700"
        >
          Open Moderation
        </Link>
      </div>

      <DashboardStats stats={dashboard.stats} />

      <AnalyticsOverview analytics={dashboard.analytics} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ModerationQueueCard reports={dashboard.moderation.recentReports} />

        <CommunityHealthCard
          stats={dashboard.stats}
          health={dashboard.health}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RecentActivityCard auditLogs={dashboard.activity.recentAuditLogs} />

        <QuickLinksCard quickLinks={dashboard.quickLinks} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LatestPostsCard posts={dashboard.content.latestPosts} />

        <RecentCommentsCard comments={dashboard.content.recentComments} />
      </div>
    </div>
  )
}