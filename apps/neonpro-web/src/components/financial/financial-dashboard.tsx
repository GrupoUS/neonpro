/**
 * Financial Dashboard Component - Real-time Analytics Interface
 * Story 4.2: Financial Analytics & Business Intelligence
 * Phase 1: Real-time Cash Flow Dashboard
 * 
 * This component provides a comprehensive financial dashboard with:
 * - Real-time financial metrics and KPIs
 * - Interactive charts and visualizations
 * - Automated alerts and notifications
 * - Predictive analytics and forecasting
 * - Performance indicators and benchmarks
 * - Actionable recommendations
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Target, 
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  RefreshCw,
  Download,
  Settings,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { 
  FinancialDashboardEngine, 
  type FinancialDashboardData,
  type FinancialMetrics,
  type DashboardForecast,
  type PerformanceIndicators,
  type Recommendation,
  type FinancialAlert
} from '@/lib/financial/financial-dashboard-engine'
import { formatCurrency, formatPercentage, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

// Chart components (simplified for now)
const LineChartComponent = ({ data, className }: { data: any[], className?: string }) => (
  <div className={cn('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <LineChart className="h-8 w-8 text-muted-foreground" />
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} data points</span>
  </div>
)

const BarChartComponent = ({ data, className }: { data: any[], className?: string }) => (
  <div className={cn('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <BarChart3 className="h-8 w-8 text-muted-foreground" />
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} data points</span>
  </div>
)

const PieChartComponent = ({ data, className }: { data: any[], className?: string }) => (
  <div className={cn('h-64 bg-muted/20 rounded-lg flex items-center justify-center', className)}>
    <PieChart className="h-8 w-8 text-muted-foreground" />
    <span className="ml-2 text-sm text-muted-foreground">Chart: {data.length} segments</span>
  </div>
)

interface FinancialDashboardProps {
  clinicId: string
  refreshInterval?: number // seconds
  className?: string
}

export function FinancialDashboard({ 
  clinicId, 
  refreshInterval = 300, // 5 minutes default
  className 
}: FinancialDashboardProps) {
  const [dashboardData, setDashboardData] = useState<FinancialDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  const dashboardEngine = new FinancialDashboardEngine()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await dashboardEngine.getDashboardData(clinicId, {
        refresh_interval: refreshInterval,
        cache_duration: refreshInterval,
        alert_thresholds: {},
        display_preferences: {
          currency: 'BRL',
          date_format: 'DD/MM/YYYY',
          number_format: 'pt-BR',
          timezone: 'America/Sao_Paulo'
        },
        widgets_enabled: ['cash_flow', 'metrics', 'alerts', 'forecasts', 'recommendations'],
        custom_metrics: []
      })
      
      setDashboardData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [clinicId, refreshInterval])

  // Initial load
  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(fetchDashboardData, refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchDashboardData])

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />
      case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />
    }
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />
      default: return <Bell className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive'
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (loading && !dashboardData) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard Financeiro</h2>
            <p className="text-sm text-muted-foreground">Carregando dados financeiros...</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-32 mb-2"></div>
                <div className="h-3 bg-muted rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn('space-y-6', className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard Financeiro</h2>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdated?.toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', autoRefresh && 'animate-spin')} />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {dashboardData.alerts.filter(alert => alert.severity === 'critical').length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alertas Críticos</AlertTitle>
          <AlertDescription>
            {dashboardData.alerts.filter(alert => alert.severity === 'critical').length} alertas críticos requerem atenção imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.metrics.total_revenue)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.metrics.revenue_growth.monthly > 0 ? 'up' : 'down')}
              <span className="ml-1">
                {formatPercentage(Math.abs(dashboardData.metrics.revenue_growth.monthly))} vs mês anterior
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.metrics.net_profit)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Margem: {formatPercentage(dashboardData.metrics.net_margin)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo de Caixa</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData.cash_flow.current_balance)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {getTrendIcon(dashboardData.cash_flow.net_cash_flow > 0 ? 'up' : 'down')}
              <span className="ml-1">
                {formatCurrency(Math.abs(dashboardData.cash_flow.net_cash_flow))} hoje
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Geral</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData.performance_indicators.overall_score)}/100
            </div>
            <Progress 
              value={dashboardData.performance_indicators.overall_score} 
              className="mt-2" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="cash-flow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="forecasts">Previsões</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Performance Indicators */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Indicadores de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Saúde Financeira</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.financial_health_score)}/100
                    </span>
                  </div>
                  <Progress value={dashboardData.performance_indicators.financial_health_score} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Crescimento</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.growth_score)}/100
                    </span>
                  </div>
                  <Progress value={dashboardData.performance_indicators.growth_score} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Eficiência</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.efficiency_score)}/100
                    </span>
                  </div>
                  <Progress value={dashboardData.performance_indicators.efficiency_score} />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risco</span>
                    <span className="text-sm font-medium">
                      {Math.round(dashboardData.performance_indicators.risk_score)}/100
                    </span>
                  </div>
                  <Progress 
                    value={dashboardData.performance_indicators.risk_score} 
                    className="[&>div]:bg-red-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Receita por Serviço</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={dashboardData.metrics.revenue_by_service} />
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <PieChartComponent data={dashboardData.metrics.expense_by_category} />
              </CardContent>
            </Card>
          </div>

          {/* Trends Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Tendências Financeiras</CardTitle>
              <CardDescription>
                Análise de tendências de receita, despesas e lucro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChartComponent data={[]} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cash-flow" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Caixa Diário</CardTitle>
              </CardHeader>
              <CardContent>
                <BarChartComponent data={[]} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Fluxo de Caixa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Saldo Inicial</span>
                  <span className="font-medium">
                    {formatCurrency(dashboardData.cash_flow.opening_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-600">Total de Entradas</span>
                  <span className="font-medium text-green-600">
                    +{formatCurrency(dashboardData.cash_flow.total_inflows)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-red-600">Total de Saídas</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(dashboardData.cash_flow.total_outflows)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Saldo Atual</span>
                  <span className="font-bold text-lg">
                    {formatCurrency(dashboardData.cash_flow.current_balance)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Fluxo Líquido</span>
                  <span className={cn(
                    'font-medium',
                    dashboardData.cash_flow.net_cash_flow > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {dashboardData.cash_flow.net_cash_flow > 0 ? '+' : ''}
                    {formatCurrency(dashboardData.cash_flow.net_cash_flow)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {dashboardData.forecasts.map((forecast, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="capitalize">
                    Previsão de {forecast.type.replace('_', ' ')}
                  </CardTitle>
                  <CardDescription>
                    Próximos {forecast.period} - Confiança: {formatPercentage(forecast.confidence)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valor Atual</span>
                    <span className="font-medium">
                      {formatCurrency(forecast.current_value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Valor Previsto</span>
                    <span className="font-medium">
                      {formatCurrency(forecast.predicted_value)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Variação</span>
                    <div className="flex items-center">
                      {getTrendIcon(forecast.trend)}
                      <span className={cn(
                        'ml-1 font-medium',
                        forecast.change_percentage > 0 ? 'text-green-600' : 'text-red-600'
                      )}>
                        {forecast.change_percentage > 0 ? '+' : ''}
                        {formatPercentage(forecast.change_percentage / 100)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {dashboardData.alerts.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium">Nenhum alerta ativo</h3>
                      <p className="text-sm text-muted-foreground">
                        Todos os indicadores financeiros estão dentro dos parâmetros normais.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                dashboardData.alerts.map((alert, index) => (
                  <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                    {getAlertIcon(alert.severity)}
                    <AlertTitle className="flex items-center justify-between">
                      <span>{alert.title}</span>
                      <Badge variant={getPriorityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">{alert.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {new Date(alert.created_at).toLocaleString('pt-BR')}
                      </div>
                    </AlertDescription>
                  </Alert>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {dashboardData.recommendations.map((recommendation, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{recommendation.title}</CardTitle>
                      <Badge variant={getPriorityColor(recommendation.priority)}>
                        {recommendation.priority}
                      </Badge>
                    </div>
                    <CardDescription>{recommendation.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Impacto Financeiro</span>
                        <p className="font-medium">
                          {formatCurrency(recommendation.expected_impact.financial_impact)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Prazo</span>
                        <p className="font-medium">{recommendation.expected_impact.timeframe}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Confiança</span>
                        <p className="font-medium">
                          {formatPercentage(recommendation.expected_impact.confidence)}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs text-muted-foreground">Próximos Passos</span>
                      <ul className="mt-1 text-sm space-y-1">
                        {recommendation.action_steps.slice(0, 3).map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Prazo: {new Date(recommendation.deadline).toLocaleDateString('pt-BR')}
                      </span>
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default FinancialDashboard