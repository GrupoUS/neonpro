'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  AlertCircle
} from 'lucide-react'

interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  pendingPayments: number
  monthlyGrowth: number
}

export function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadFinancialSummary()
  }, [])

  const loadFinancialSummary = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Calcular resumo financeiro baseado nos agendamentos
      const currentMonth = new Date()
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const { data: appointments } = await supabase
        .from('appointments')
        .select('price_at_booking, status, start_time')
        .eq('user_id', user.id)
        .gte('start_time', firstDay.toISOString())
        .lte('start_time', lastDay.toISOString())

      if (appointments) {
        const completed = appointments.filter(a => a.status === 'completed')
        const pending = appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status))

        const totalIncome = completed.reduce((sum, a) => sum + (a.price_at_booking || 0), 0)
        const pendingPayments = pending.reduce((sum, a) => sum + (a.price_at_booking || 0), 0)

        setSummary({
          totalIncome,
          totalExpenses: 0, // Implementar quando houver tabela de despesas
          netProfit: totalIncome,
          pendingPayments,
          monthlyGrowth: 0 // Calcular comparando com mês anterior
        })
      }
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Cards de resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas do mês atual
            </p>
          </CardContent>
        </Card>

        {/* Despesas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Despesas do mês atual
            </p>
          </CardContent>
        </Card>

        {/* Lucro Líquido */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lucro Líquido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>

        {/* Pagamentos Pendentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pendentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.pendingPayments)}
            </div>
            <p className="text-xs text-muted-foreground">
              Agendamentos não pagos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e informações adicionais */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fluxo de Caixa Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Fluxo de Caixa Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Receitas</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Despesas</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Saldo</span>
                  <span className={`font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.netProfit)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métodos de Pagamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Dinheiro</span>
                <span className="font-semibold">40%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cartão</span>
                <span className="font-semibold">35%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">PIX</span>
                <span className="font-semibold">25%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Distribuição baseada nos últimos 30 dias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
