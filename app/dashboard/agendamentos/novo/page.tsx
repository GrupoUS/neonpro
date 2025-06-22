import { createClient } from '@/lib/supabase/server'
import { AppointmentForm } from '@/components/dashboard/appointments/appointment-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface NovoAgendamentoPageProps {
  searchParams: {
    cliente?: string
  }
}

export default async function NovoAgendamentoPage({ 
  searchParams 
}: NovoAgendamentoPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
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

  // Cliente pré-selecionado se vier da URL
  const preselectedClient = searchParams.cliente 
    ? clients.find(c => c.id === searchParams.cliente)
    : null

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
          <h1 className="text-3xl font-bold tracking-tight">Novo Agendamento</h1>
          <p className="text-muted-foreground">
            Agende um novo atendimento para um cliente
          </p>
        </div>
      </div>

      {/* Formulário de agendamento */}
      <div className="max-w-2xl">
        <AppointmentForm 
          mode="create"
          clients={clients}
          services={services}
          professionals={professionals}
          preselectedClient={preselectedClient}
        />
      </div>
    </div>
  )
}
