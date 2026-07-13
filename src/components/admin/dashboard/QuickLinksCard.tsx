import type { DashboardQuickLink } from '@/types/dashboard'
import DashboardSection from './DashboardSection'
import QuickLinks from './QuickLinks'

export default function QuickLinksCard({
  quickLinks,
}: {
  quickLinks: DashboardQuickLink[]
}) {
  return (
    <DashboardSection title="Quick Links">
      <QuickLinks items={quickLinks} />
    </DashboardSection>
  )
}