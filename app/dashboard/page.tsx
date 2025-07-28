import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardOverview />
    </DashboardLayout>
  )
}