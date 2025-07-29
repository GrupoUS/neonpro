import { Suspense } from 'react'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { InsightDoDia } from '@/components/dashboard/insight-do-dia'
import { AgendaPreditiva } from '@/components/dashboard/agenda-preditiva'
import { AcoesRapidas } from '@/components/dashboard/acoes-rapidas'
import { KpisEmTempoReal } from '@/components/dashboard/kpis-em-tempo-real'
import { PainelDeOportunidades } from '@/components/dashboard/painel-de-oportunidades'

export default async function DashboardPage() {
  // Session validation following NeonPro pattern
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Insight do Dia - Topo, largura total */}
        <Suspense fallback={<div className="h-20 bg-muted animate-pulse rounded-lg" />}>
          <InsightDoDia />
        </Suspense>

        {/* Layout principal: Grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal (esquerda) - 2/3 do espaço em telas grandes */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
              <AgendaPreditiva />
            </Suspense>
          </div>

          {/* Barra lateral (direita) - 1/3 do espaço em telas grandes */}
          <div className="space-y-6">
            <Suspense fallback={<div className="h-40 bg-muted animate-pulse rounded-lg" />}>
              <AcoesRapidas />
            </Suspense>
            
            <Suspense fallback={<div className="h-48 bg-muted animate-pulse rounded-lg" />}>
              <KpisEmTempoReal />
            </Suspense>
            
            <Suspense fallback={<div className="h-56 bg-muted animate-pulse rounded-lg" />}>
              <PainelDeOportunidades />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}