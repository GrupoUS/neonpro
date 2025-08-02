import { Suspense } from 'react'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/app/components/dashboard/layout/DashboardLayout'
import { CommunicationDashboard } from '@/app/components/communication/CommunicationDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle } from 'lucide-react'

interface CommunicationPageProps {
  searchParams: { patient?: string; tab?: string }
}

function CommunicationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6">
          <div className="flex space-x-1 border-b mb-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function CommunicationPage({ 
  searchParams 
}: CommunicationPageProps) {
  const supabase = await createClient()

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Extract search params
  const patientId = searchParams.patient
  const defaultTab = searchParams.tab || 'inbox'

  // Breadcrumbs
  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Comunicação', href: '/dashboard/communication' }
  ]

  // Add patient-specific breadcrumb if applicable
  if (patientId) {
    breadcrumbs.push({
      title: 'Paciente Específico',
      href: `/dashboard/communication?patient=${patientId}`
    })
  }

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <MessageCircle className="h-8 w-8" />
              Centro de Comunicação
            </h1>
            <p className="text-muted-foreground">
              {patientId 
                ? 'Gerencie a comunicação com um paciente específico'
                : 'Gerencie toda a comunicação com pacientes'
              }
            </p>
          </div>
        </div>

        {/* Communication Dashboard */}
        <Suspense fallback={<CommunicationSkeleton />}>
          <CommunicationDashboard
            patientId={patientId}
            defaultTab={defaultTab}
            className="w-full"
          />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

export const metadata = {
  title: 'Comunicação | NeonPro',
  description: 'Centro de comunicação para gerenciar mensagens com pacientes'
}
