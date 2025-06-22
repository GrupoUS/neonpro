import { createClient } from '@/lib/supabase/server'
import { AppointmentForm } from '@/components/dashboard/appointments/appointment-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface EditarAgendamentoPageProps {
  params: {
    id: string
  }
}

export default async function EditarAgendamentoPage({ params }: EditarAgendamentoPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do agendamento
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients (
        id,
        full_name
      ),
      services (
        id,
        name
      ),
      professionals (
        id,
        name
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !appointment) {
    notFound()
  }

  // Buscar dados necessários para o formulário
  const [clientsResult, servicesResult, professionalsResult] = await Promise.all([
    supabase
      .from('clients')
      .select('id, full_name, email, phone')
      .eq('user_id', user.id)
      .order('full_name'),
    
    supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .eq('user_id', user.id)
      .order('name'),
    
    supabase
      .from('professionals')
      .select('id, name, email')
      .eq('user_id', user.id)
      .order('name')
  ])

  const clients = clientsResult.data || []
  const services = servicesResult.data || []
  const professionals = professionalsResult.data || []

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/agendamentos">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Agendamento</h1>
          <p className="text-muted-foreground">
            Atualize as informações do agendamento de {appointment.clients?.full_name}
          </p>
        </div>
      </div>

      {/* Formulário de agendamento */}
      <div className="max-w-2xl">
        <AppointmentForm 
          mode="edit"
          clients={clients}
          services={services}
          professionals={professionals}
          appointment={appointment}
        />
      </div>
    </div>
  )
}
