import type { DashboardAnalytics } from '@/types/dashboard'
import DashboardSection from './DashboardSection'
import TopList from './TopList'
import TagList from './TagList'

export default function AnalyticsOverview({
  analytics,
}: {
  analytics: DashboardAnalytics
}) {
  return (
    <>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DashboardSection title="Top Boards">
          <TopList items={analytics.topBoards} />
        </DashboardSection>

        <DashboardSection title="Most Active Users">
          <TopList items={analytics.activeUsers} />
        </DashboardSection>

        <DashboardSection title="Trending Tags">
          <TagList items={analytics.trendingTags} />
        </DashboardSection>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Notification Stats">
          <TopList items={analytics.notificationStats} />
        </DashboardSection>

        <DashboardSection title="Report Stats">
          <TopList items={analytics.reportStats} />
        </DashboardSection>
      </div>
    </>
  )
}