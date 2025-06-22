import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { ReportsOverview } from '@/components/dashboard/reports/reports-overview'
import { ReportsCharts } from '@/components/dashboard/reports/reports-charts'
import { ReportsHeader } from '@/components/dashboard/reports/reports-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react'

// Skeleton para loading
function ReportsSkeleton() {
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

export default async function RelatoriosPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e métricas da sua clínica
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Header com filtros */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <ReportsHeader />
      </Suspense>

      {/* Tabs para diferentes tipos de relatórios */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsCharts type="financial" />
          </Suspense>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsCharts type="clients" />
          </Suspense>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Suspense fallback={<ReportsSkeleton />}>
            <ReportsCharts type="performance" />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
