import { Suspense } from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppointmentManagementDashboard } from '@/components/dashboard'
import { DashboardLayout } from '@/components/navigation/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}

export default async function AppointmentManagePage() {
  const supabase = createServerComponentClient({ cookies })

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check user profile and permissions
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, professional_id')
    .eq('id', user.id)
    .single()

  // Only allow admin, professional, and receptionist roles to access appointment management
  if (!profile || !['admin', 'professional', 'receptionist'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const userRole = profile.role as 'admin' | 'professional' | 'receptionist'
  const professionalId = profile.professional_id

  const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Agendamentos', href: '/dashboard/appointments' },
    { title: 'Gerenciar' }
  ]

  return (
    <DashboardLayout user={user} breadcrumbs={breadcrumbs}>
      <Suspense fallback={<DashboardSkeleton />}>
        <AppointmentManagementDashboard
          userId={user.id}
          userRole={userRole}
          professionalId={professionalId}
          className="space-y-6"
        />
      </Suspense>
    </DashboardLayout>
  )
}

export const metadata = {
  title: 'Gerenciar Agendamentos - NeonPro',
  description: 'Dashboard completo para gerenciamento de agendamentos da clínica com visualizações em tempo real'
}