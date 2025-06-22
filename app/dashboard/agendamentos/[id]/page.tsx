import { createClient } from '@/lib/supabase/server'
import { AppointmentDetails } from '@/components/dashboard/appointments/appointment-details'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface AgendamentoPageProps {
  params: {
    id: string
  }
}

export default async function AgendamentoPage({ params }: AgendamentoPageProps) {
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
        full_name,
        email,
        phone
      ),
      services (
        id,
        name,
        duration_minutes,
        price
      ),
      professionals (
        id,
        name,
        email
      )
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !appointment) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/agendamentos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {appointment.services?.name || 'Agendamento'}
            </h1>
            <p className="text-muted-foreground">
              Detalhes do agendamento com {appointment.clients?.full_name}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/agendamentos/${params.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Detalhes do agendamento */}
      <AppointmentDetails appointment={appointment} />
    </div>
  )
}
