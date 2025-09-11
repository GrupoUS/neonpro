import { createFileRoute } from '@tanstack/react-router'
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard'

export const Route = createFileRoute('/governance')({
  component: () => <GovernanceDashboard />,
})