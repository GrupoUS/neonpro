import { createFileRoute } from '@tanstack/react-router'
import ComplianceDashboard from '@/components/compliance/ComplianceDashboard'

export const Route = createFileRoute('/compliance/lgpd/')({
  component: LGPDCompliancePage,
})

function LGPDCompliancePage() {
  // For demo purposes, using a hardcoded clinic ID
  // In production, this would come from authentication context
  const clinicId = 'demo-clinic-id'

  return (
    <div className="min-h-screen bg-gray-50">
      <ComplianceDashboard clinicId={clinicId} />
    </div>
  )
}