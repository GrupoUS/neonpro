"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Calendar, Users, CreditCard } from 'lucide-react'

// Interfaces para tipagem
interface CashFlowData {
  id: string
  date: string
  clinic_id: string
  inflow: number
  outflow: number
  net_cash_flow: number
  running_balance: number
  prediction_accuracy?: number
  created_at: string
  updated_at: string
}

interface FinancialMetrics {
  daily_revenue: number
  monthly_revenue: number
  annual_revenue: number
  average_treatment_value: number
  patient_acquisition_cost: number
  lifetime_value: number
  cash_conversion_cycle: number
  profit_margin: number
  break_even_point: number
  growth_rate: number
}

interface Alert {
  id: string
  type: 'warning' | 'critical' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

interface FinancialAnalyticsDashboardProps {
  clinicId: string
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function FinancialAnalyticsDashboard({ clinicId, className }: FinancialAnalyticsDashboardProps) {
  // State Management
  const [cashFlowData, setCashFlowData] = useState<CashFlowData[]>([])
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [refreshing, setRefreshing] = useState(false)

  // Fetch Financial Data
  const fetchFinancialData = async () => {
    try {
      setLoading(true)
      
      // Fetch cash flow data
      const cashFlowResponse = await fetch(`/api/financial/cash-flow?clinic_id=${clinicId}&time_range=${timeRange}`)
      if (!cashFlowResponse.ok) throw new Error('Failed to fetch cash flow data')
      const cashFlow = await cashFlowResponse.json()
      
      // Fetch financial metrics
      const metricsResponse = await fetch(`/api/financial/metrics?clinic_id=${clinicId}&time_range=${timeRange}`)
      if (!metricsResponse.ok) throw new Error('Failed to fetch metrics')
      const metricsData = await metricsResponse.json()
      
      // Fetch alerts
      const alertsResponse = await fetch(`/api/financial/alerts?clinic_id=${clinicId}`)
      if (!alertsResponse.ok) throw new Error('Failed to fetch alerts')
      const alertsData = await alertsResponse.json()
      
      setCashFlowData(cashFlow.data || [])
      setMetrics(metricsData.data || null)
      setAlerts(alertsData.data || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load financial data')
      console.error('Financial data fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh Data
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchFinancialData()
  }

  // Initial data load and periodic refresh
  useEffect(() => {
    fetchFinancialData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchFinancialData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clinicId, timeRange])

  // Format currency for Brazilian Real
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Prepare chart data
  const chartData = cashFlowData.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
    entrada: item.inflow,
    saida: Math.abs(item.outflow),
    liquido: item.net_cash_flow,
    saldo: item.running_balance
  }))

  // Revenue distribution data
  const revenueDistribution = [
    { name: 'Procedimentos Estéticos', value: 60 },
    { name: 'Consultas', value: 25 },
    { name: 'Produtos', value: 10 },
    { name: 'Outros', value: 5 }
  ]

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className={`${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button onClick={handleRefresh} variant="outline" size="sm" className="ml-2">
            Tentar Novamente
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Financeiros</h2>
          <p className="text-muted-foreground">Visão completa da saúde financeira da clínica</p>
        </div>
        <div className="flex gap-2">
          <Tabs value={timeRange} onValueChange={(value: any) => setTimeRange(value)} className="w-auto">
            <TabsList>
              <TabsTrigger value="7d">7d</TabsTrigger>
              <TabsTrigger value="30d">30d</TabsTrigger>
              <TabsTrigger value="90d">90d</TabsTrigger>
              <TabsTrigger value="1y">1a</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            {refreshing ? "Atualizando..." : "Atualizar"}
          </Button>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.filter(alert => !alert.resolved).length > 0 && (
        <div className="space-y-2">
          {alerts.filter(alert => !alert.resolved).map(alert => (
            <Alert key={alert.id} className={alert.type === 'critical' ? 'border-red-500 bg-red-50' : ''}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.monthly_revenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {formatPercentage(metrics?.growth_rate || 0)} vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Médio Tratamento</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics?.average_treatment_value || 0)}</div>
            <p className="text-xs text-muted-foreground">Por procedimento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.profit_margin || 0)}</div>
            <Progress value={metrics?.profit_margin || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ponto de Equilíbrio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.break_even_point || 0} dias</div>
            <p className="text-xs text-muted-foreground">Para recuperar investimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="cash-flow" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="cash-flow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa - {timeRange}</CardTitle>
              <CardDescription>
                Acompanhe entradas, saídas e saldo acumulado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="entrada" stroke="#00C49F" name="Entradas" />
                  <Line type="monotone" dataKey="saida" stroke="#FF8042" name="Saídas" />
                  <Line type="monotone" dataKey="liquido" stroke="#8884d8" name="Fluxo Líquido" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolução da Receita</CardTitle>
              <CardDescription>
                Comparativo de performance ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={formatCurrency} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="entrada" fill="#00C49F" name="Receita Diária" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição da Receita</CardTitle>
              <CardDescription>
                Origem da receita por categoria de serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={revenueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Métricas de Pacientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Custo de Aquisição (CAC)</span>
              <span className="text-sm">{formatCurrency(metrics?.patient_acquisition_cost || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Valor Vitalício (LTV)</span>
              <span className="text-sm">{formatCurrency(metrics?.lifetime_value || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Ratio LTV/CAC</span>
              <Badge variant={
                (metrics?.lifetime_value || 0) / (metrics?.patient_acquisition_cost || 1) > 3 
                  ? "default" 
                  : "destructive"
              }>
                {((metrics?.lifetime_value || 0) / (metrics?.patient_acquisition_cost || 1)).toFixed(1)}x
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficiência Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Ciclo de Conversão de Caixa</span>
              <span className="text-sm">{metrics?.cash_conversion_cycle || 0} dias</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Taxa de Crescimento</span>
              <span className="text-sm text-green-600">
                {formatPercentage(metrics?.growth_rate || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default FinancialAnalyticsDashboard