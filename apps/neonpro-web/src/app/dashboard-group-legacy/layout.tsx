// ===============================================
// Dashboard Layout (Route Group)
// For ROI Reports and other dashboard pages
// ===============================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - NeonPro',
    default: 'Dashboard - NeonPro',
  },
  description: 'Dashboard para gestão e análise de dados médicos',
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  )
}