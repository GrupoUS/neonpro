// ===============================================
// Patient Portal Layout
// Story 4.3: Patient Portal & Self-Service
// ===============================================

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Portal do Paciente - NeonPro',
    default: 'Portal do Paciente - NeonPro',
  },
  description: 'Portal seguro para pacientes acessarem informações médicas e agendamentos',
  robots: 'noindex, nofollow', // Portal pages should not be indexed for privacy
}

interface PortalLayoutProps {
  children: React.ReactNode
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="portal-layout">
      {children}
    </div>
  )
}