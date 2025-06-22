import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ClientsList } from '@/components/dashboard/clients/clients-list'
import { ClientsHeader } from '@/components/dashboard/clients/clients-header'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

// Skeleton para loading
function ClientsListSkeleton() {
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

export default async function ClientesPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie seus clientes e histórico de atendimentos
          </p>
        </div>
        <Link href="/dashboard/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      {/* Header com filtros e busca */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <ClientsHeader />
      </Suspense>

      {/* Lista de clientes */}
      <Suspense fallback={<ClientsListSkeleton />}>
        <ClientsList />
      </Suspense>
    </div>
  )
}
