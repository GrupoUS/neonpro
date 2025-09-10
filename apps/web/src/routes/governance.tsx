import { createFileRoute } from '@tanstack/react-router'
import { GovernanceDashboard } from '@/components/governance/GovernanceDashboard'

export const Route = createFileRoute('/governance')({
  component: () => <GovernanceDashboard />,
  meta: () => [
    {
      title: 'Governance Dashboard - HIPAA/LGPD Compliance Monitoring',
      description: 'Monitor KPIs, compliance status, risk assessments, and AI governance metrics',
    },
  ],
})