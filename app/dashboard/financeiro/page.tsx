import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { FinancialDashboard } from '@/components/dashboard/financial/financial-dashboard'
import { FinancialTransactions } from '@/components/dashboard/financial/financial-transactions'
import { FinancialHeader } from '@/components/dashboard/financial/financial-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'
import Link from 'next/link'

// Skeleton para loading
function FinancialSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-200 animate-pulse p-4 rounded-lg">
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
}

export default async function FinanceiroPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle financeiro e fluxo de caixa da clínica
          </p>
        </div>
        <Link href="/dashboard/financeiro/nova-transacao">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </Link>
      </div>

      {/* Header com filtros e busca */}
      <Suspense fallback={<div>Carregando filtros...</div>}>
        <FinancialHeader />
      </Suspense>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center">
            <DollarSign className="mr-2 h-4 w-4" />
            Transações
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <Suspense fallback={<FinancialSkeleton />}>
            <FinancialDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Suspense fallback={<FinancialSkeleton />}>
            <FinancialTransactions />
          </Suspense>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              Relatórios Financeiros
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Funcionalidade em desenvolvimento.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
