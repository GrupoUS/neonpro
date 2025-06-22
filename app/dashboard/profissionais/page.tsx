import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ProfessionalsList } from '@/components/dashboard/professionals/professionals-list'
import { ProfessionalsHeader } from '@/components/dashboard/professionals/professionals-header'
import { Button } from '@/components/ui/button'
import { Plus, UserCheck } from 'lucide-react'
import Link from 'next/link'

// Skeleton para loading
function ProfessionalsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

export default async function ProfissionaisPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie a equipe de profissionais da sua clínica
          </p>
        </div>
        <Link href="/dashboard/profissionais/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Profissional
          </Button>
        </Link>
      </div>

      {/* Header com filtros e busca */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <ProfessionalsHeader />
      </Suspense>

      {/* Lista de profissionais */}
      <Suspense fallback={<ProfessionalsSkeleton />}>
        <ProfessionalsList />
      </Suspense>
    </div>
  )
}
