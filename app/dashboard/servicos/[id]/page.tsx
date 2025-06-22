import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ServiceDetails } from '@/components/dashboard/services/service-details'
import { ServiceAppointments } from '@/components/dashboard/services/service-appointments'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ServicoPageProps {
  params: {
    id: string
  }
}

export default async function ServicoPage({ params }: ServicoPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do serviço
  const { data: service, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/servicos">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{service.name}</h1>
            <p className="text-muted-foreground">
              Detalhes do serviço e histórico de agendamentos
            </p>
          </div>
        </div>
        <Link href={`/dashboard/servicos/${params.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Detalhes do serviço */}
      <Suspense fallback={<div>Carregando detalhes...</div>}>
        <ServiceDetails service={service} />
      </Suspense>

      {/* Histórico de agendamentos */}
      <Suspense fallback={<div>Carregando agendamentos...</div>}>
        <ServiceAppointments serviceId={params.id} />
      </Suspense>
    </div>
  )
}
