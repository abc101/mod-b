import type { DashboardStats as DashboardStatsType } from '@/types/dashboard'
import StatCard from './StatCard'

export default function DashboardStats({
  stats,
}: {
  stats: DashboardStatsType
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Today Posts" value={stats.todayPosts} />
      <StatCard label="Today Comments" value={stats.todayComments} />
      <StatCard
        label="Open Reports"
        value={stats.openReports}
        href="/admin/moderation?status=open"
      />
      <StatCard
        label="Reviewing Reports"
        value={stats.reviewingReports}
        href="/admin/moderation?status=reviewing"
      />
      <StatCard label="New Users Today" value={stats.newUsers} />
      <StatCard label="Total Bookmarks" value={stats.totalBookmarks} />
      <StatCard label="Draft Posts" value={stats.draftPosts} />
      <StatCard label="Deleted Posts" value={stats.deletedPosts} />
    </div>
  )
}