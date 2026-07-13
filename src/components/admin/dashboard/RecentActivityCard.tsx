import type { PaginatedDocs } from 'payload'
import type { AuditLog } from '@/types/payload'
import LocalTime from '@/components/LocalTime'
import DashboardSection from './DashboardSection'

export default function RecentActivityCard({
  auditLogs,
}: {
  auditLogs: PaginatedDocs<AuditLog>
}) {
  return (
    <DashboardSection title="Recent Activity">
      {auditLogs.docs.length === 0 ? (
        <div className="p-6 text-sm text-gray-400">No audit logs.</div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {auditLogs.docs.map((log: AuditLog) => (
            <li key={log.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {log.message || `${log.resourceType} ${log.action}`}
                  </div>
                  <div className="mt-1 text-xs text-gray-400">
                    {log.action} · {log.resourceType} #{log.resourceId}
                  </div>
                </div>

                {log.createdAt && (
                  <div className="shrink-0 text-xs text-gray-400">
                    <LocalTime dateString={log.createdAt} />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardSection>
  )
}