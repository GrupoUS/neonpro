import { Suspense } from 'react'
import { Metadata } from 'next'
import { PatientDashboard } from '@/components/patient-portal/patient-dashboard'
import { PortalLayout } from '@/components/patient-portal/portal-layout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata: Metadata = {
  title: 'Portal do Paciente | NeonPro',
  description: 'Acesse seu histórico médico, agende consultas e gerencie seus dados de forma segura.',
  keywords: [
    'portal paciente',
    'agendamento online',
    'histórico médico',
    'clínica estética',
    'LGPD',
    'telemedicina'
  ],
  openGraph: {
    title: 'Portal do Paciente - NeonPro',
    description: 'Gerencie sua saúde e beleza de forma digital e segura',
    type: 'website',
  },
  robots: {
    index: false, // Portal do paciente não deve ser indexado
    follow: false,
  },
}

export default function PatientPortalPage() {
  return (
    <PortalLayout>
      <Suspense 
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-muted-foreground">
              Carregando portal do paciente...
            </span>
          </div>
        }
      >
        <PatientDashboard />
      </Suspense>
    </PortalLayout>
  )
}