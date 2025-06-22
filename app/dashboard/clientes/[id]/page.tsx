import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClientDetails } from '@/components/dashboard/clients/client-details'
import { ClientAppointments } from '@/components/dashboard/clients/client-appointments'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface ClientPageProps {
  params: {
    id: string
  }
}

// Skeleton para loading
function ClientDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gray-200 animate-pulse p-6 rounded-lg">
        <div className="h-6 bg-gray-300 rounded mb-4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  )
}

export default async function ClientePage({ params }: ClientPageProps) {
  const supabase = createClient()
  
  // Verificar autenticação
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Acesso negado</div>
  }

  // Buscar dados do cliente
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !client) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header da página */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/clientes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{client.full_name}</h1>
            <p className="text-muted-foreground">
              Detalhes do cliente e histórico de atendimentos
            </p>
          </div>
        </div>
        <Link href={`/dashboard/clientes/${params.id}/editar`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </Link>
      </div>

      {/* Detalhes do cliente */}
      <Suspense fallback={<ClientDetailsSkeleton />}>
        <ClientDetails client={client} />
      </Suspense>

      {/* Histórico de agendamentos */}
      <Suspense fallback={<ClientDetailsSkeleton />}>
        <ClientAppointments clientId={params.id} />
      </Suspense>
    </div>
  )
}
