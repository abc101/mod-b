import type {
  DashboardStats,
  DashboardHealth,
} from '@/types/dashboard'
import Link from 'next/link'
import DashboardSection from './DashboardSection'

export default function CommunityHealthCard({
  stats,
  health,
}: {
  stats: DashboardStats
  health: DashboardHealth
}) {
  return (
    <DashboardSection title="Community Health">
      <div className="space-y-3 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Turnstile</span>
          <span
            className={health.turnstileEnabled ? 'text-green-600' : 'text-gray-400'}
          >
            {health.turnstileEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Notifications Today</span>
          <span className="font-medium text-gray-900">
            {stats.notificationsToday}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Anonymous Posts Today</span>
          <span className="font-medium text-gray-900">
            {stats.anonymousPostsToday}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Rate Limit</span>
          <span className="text-green-600">Active</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Forbidden Words</span>
          <Link
            href="/admin/globals/site-settings"
            className="text-blue-600 hover:underline"
          >
            Manage
          </Link>
        </div>
      </div>
    </DashboardSection>
  )
}