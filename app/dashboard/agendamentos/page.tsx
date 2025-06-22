import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { AppointmentsCalendar } from '@/components/dashboard/appointments/appointments-calendar'
import { AppointmentsList } from '@/components/dashboard/appointments/appointments-list'
import { AppointmentsHeader } from '@/components/dashboard/appointments/appointments-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Calendar, List } from 'lucide-react'
import Link from 'next/link'

// Skeleton para loading
function AppointmentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

export default async function AgendamentosPage() {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie sua agenda e agendamentos de clientes
          </p>
        </div>
        <Link href="/dashboard/agendamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Button>
        </Link>
      </div>

      {/* Header com filtros e busca */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <AppointmentsHeader />
      </Suspense>

      {/* Tabs para visualização */}
      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="flex items-center">
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center">
            <List className="mr-2 h-4 w-4" />
            Lista
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Suspense fallback={<AppointmentsSkeleton />}>
            <AppointmentsCalendar />
          </Suspense>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Suspense fallback={<AppointmentsSkeleton />}>
            <AppointmentsList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
