'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, DatePickerWithRange } from '@/components/ui/calendar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Package,
  BarChart3,
  Target,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Calendar as CalendarIcon,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import { DateRange } from 'react-day-picker'

interface StockKPI {
  key: string
  label: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  trendValue: number
  status: 'good' | 'warning' | 'critical'
  target?: number
  description: string
}

interface TopProduct {
  id: string
  name: string
  consumption: number
  value: number
  trend: 'up' | 'down' | 'stable'
  impact: 'high' | 'medium' | 'low'
}

interface AlertSummary {
  type: 'low_stock' | 'expiring' | 'expired' | 'overstock'
  count: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  trend: 'up' | 'down' | 'stable'
}

interface PerformanceMetric {
  date: string
  turnoverRate: number
  accuracy: number
  wastePercentage: number
  totalValue: number
  daysCoverage: number
}

interface StockPerformanceDashboardProps {
  clinicId: string
  refreshInterval?: number
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#6366f1',
  neutral: '#6b7280'
}

const ALERT_COLORS = {
  low_stock: '#ef4444',
  expiring: '#f59e0b',
  expired: '#dc2626',
  overstock: '#6366f1'
}

export function StockPerformanceDashboard({ 
  clinicId, 
  refreshInterval = 30000 
}: StockPerformanceDashboardProps) {
  const [kpis, setKpis] = useState<StockKPI[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [alertsSummary, setAlertsSummary] = useState<AlertSummary[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        clinicId,
        period: selectedPeriod,
        ...(selectedDateRange?.from && { startDate: selectedDateRange.from.toISOString() }),
        ...(selectedDateRange?.to && { endDate: selectedDateRange.to.toISOString() })
      })

      const [kpisRes, productsRes, alertsRes, metricsRes] = await Promise.all([
        fetch(`/api/stock/dashboard/kpis?${params}`),
        fetch(`/api/stock/dashboard/top-products?${params}`),
        fetch(`/api/stock/dashboard/alerts-summary?${params}`),
        fetch(`/api/stock/dashboard/performance-metrics?${params}`)
      ])

      if (!kpisRes.ok || !productsRes.ok || !alertsRes.ok || !metricsRes.ok) {
        throw new Error('Erro ao carregar dados do dashboard')
      }

      const [kpisData, productsData, alertsData, metricsData] = await Promise.all([
        kpisRes.json(),
        productsRes.json(),
        alertsRes.json(),
        metricsRes.json()
      ])

      setKpis(kpisData.data)
      setTopProducts(productsData.data)
      setAlertsSummary(alertsData.data)
      setPerformanceData(metricsData.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Auto refresh effect
  useEffect(() => {
    fetchDashboardData()

    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchDashboardData, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [clinicId, selectedPeriod, selectedDateRange, autoRefresh, refreshInterval])

  // Render KPI card
  const renderKPICard = (kpi: StockKPI) => {
    const TrendIcon = kpi.trend === 'up' ? ArrowUp : kpi.trend === 'down' ? ArrowDown : Minus
    const trendColor = kpi.trend === 'up' ? COLORS.success : kpi.trend === 'down' ? COLORS.danger : COLORS.neutral
    const statusColor = kpi.status === 'good' ? COLORS.success : kpi.status === 'warning' ? COLORS.warning : COLORS.danger

    return (
      <Card key={kpi.key} className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-600">{kpi.label}</CardTitle>
            <Badge 
              variant={kpi.status === 'good' ? 'default' : kpi.status === 'warning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {kpi.status === 'good' ? 'Bom' : kpi.status === 'warning' ? 'Atenção' : 'Crítico'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-2xl font-bold">
              {kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: kpi.unit === '%' ? 1 : 0 })}
              <span className="text-sm font-normal ml-1">{kpi.unit}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendIcon size={16} style={{ color: trendColor }} />
              <span className="text-sm" style={{ color: trendColor }}>
                {Math.abs(kpi.trendValue)}%
              </span>
            </div>
          </div>
          
          {kpi.target && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Meta: {kpi.target}{kpi.unit}</span>
                <span>{((kpi.value / kpi.target) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(kpi.value / kpi.target) * 100} 
                className="h-2"
                style={{ backgroundColor: statusColor }}
              />
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">{kpi.description}</p>
        </CardContent>
      </Card>
    )
  }

  // Render top products chart
  const renderTopProductsChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topProducts.slice(0, 10)}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
          fontSize={12}
        />
        <YAxis />
        <Tooltip 
          labelFormatter={(label) => `Produto: ${label}`}
          formatter={(value, name) => [
            name === 'consumption' ? `${value} un.` : `R$ ${value.toLocaleString('pt-BR')}`,
            name === 'consumption' ? 'Consumo' : 'Valor'
          ]}
        />
        <Legend />
        <Bar dataKey="consumption" fill={COLORS.primary} name="Consumo" />
        <Bar dataKey="value" fill={COLORS.success} name="Valor (R$)" />
      </BarChart>
    </ResponsiveContainer>
  )

  // Render alerts summary chart
  const renderAlertsSummaryChart = () => {
    const alertsData = alertsSummary.map(alert => ({
      name: alert.type.replace('_', ' ').toUpperCase(),
      value: alert.count,
      color: ALERT_COLORS[alert.type]
    }))

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={alertsData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {alertsData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} alertas`, 'Quantidade']} />
        </PieChart>
      </ResponsiveContainer>
    )
  }

  // Render performance trends chart
  const renderPerformanceTrendsChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={performanceData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip 
          labelFormatter={(label) => `Data: ${label}`}
          formatter={(value, name) => {
            switch (name) {
              case 'turnoverRate': return [`${value}x`, 'Giro de Estoque']
              case 'accuracy': return [`${value}%`, 'Acuracidade']
              case 'wastePercentage': return [`${value}%`, 'Desperdício']
              case 'daysCoverage': return [`${value} dias`, 'Cobertura']
              default: return [value, name]
            }
          }}
        />
        <Legend />
        <Line yAxisId="left" type="monotone" dataKey="turnoverRate" stroke={COLORS.primary} name="Giro" />
        <Line yAxisId="left" type="monotone" dataKey="accuracy" stroke={COLORS.success} name="Acuracidade" />
        <Area yAxisId="right" type="monotone" dataKey="wastePercentage" fill={COLORS.danger} fillOpacity={0.3} stroke={COLORS.danger} name="Desperdício" />
        <Bar yAxisId="right" dataKey="daysCoverage" fill={COLORS.warning} fillOpacity={0.7} name="Cobertura" />
      </ComposedChart>
    </ResponsiveContainer>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="animate-spin" size={32} />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard de Performance</h2>
          <p className="text-muted-foreground">
            Métricas e indicadores de performance do estoque em tempo real
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'text-green-600' : 'text-gray-600'}
          >
            <Activity size={16} className="mr-1" />
            {autoRefresh ? 'Auto' : 'Manual'}
          </Button>
          
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw size={16} className="mr-1" />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(renderKPICard)}
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="products">Top Produtos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendências de Performance</CardTitle>
              <CardDescription>
                Evolução das principais métricas de estoque ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderPerformanceTrendsChart()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Produtos por Consumo</CardTitle>
              <CardDescription>
                Produtos com maior impacto no consumo e valor financeiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTopProductsChart()}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada de Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.consumption} un. • R$ {product.value.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={product.impact === 'high' ? 'destructive' : product.impact === 'medium' ? 'secondary' : 'outline'}>
                        {product.impact === 'high' ? 'Alto Impacto' : product.impact === 'medium' ? 'Médio Impacto' : 'Baixo Impacto'}
                      </Badge>
                      {product.trend === 'up' ? (
                        <TrendingUp size={16} className="text-green-600" />
                      ) : product.trend === 'down' ? (
                        <TrendingDown size={16} className="text-red-600" />
                      ) : (
                        <Minus size={16} className="text-gray-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Alertas</CardTitle>
                <CardDescription>
                  Breakdown de alertas ativos por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderAlertsSummaryChart()}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status dos Alertas</CardTitle>
                <CardDescription>
                  Resumo detalhado dos alertas por tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertsSummary.map((alert) => (
                    <div key={alert.type} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: ALERT_COLORS[alert.type] }}
                        />
                        <span className="font-medium capitalize">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={alert.severity === 'critical' ? 'destructive' : alert.severity === 'high' ? 'secondary' : 'outline'}>
                          {alert.count} alertas
                        </Badge>
                        {alert.trend === 'up' ? (
                          <TrendingUp size={16} className="text-red-600" />
                        ) : alert.trend === 'down' ? (
                          <TrendingDown size={16} className="text-green-600" />
                        ) : (
                          <Minus size={16} className="text-gray-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2" size={20} />
                  Metas vs Realizado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Giro de Estoque</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Acuracidade</span>
                      <span>92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Redução Desperdício</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="mr-2" size={20} />
                  Impacto Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Valor Total Estoque:</span>
                    <span className="font-medium">R$ 125.430</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Economia Perdas:</span>
                    <span className="font-medium text-green-600">R$ 3.245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Custo Oportunidade:</span>
                    <span className="font-medium text-orange-600">R$ 1.890</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>ROI Mensal:</span>
                    <span className="text-green-600">+12.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2" size={20} />
                  Previsões
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Próxima Reposição:</span>
                    <span className="font-medium">3 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risco de Falta:</span>
                    <span className="font-medium text-orange-600">Médio</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Produtos Críticos:</span>
                    <span className="font-medium text-red-600">12 itens</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Confiabilidade:</span>
                    <span className="text-blue-600">87%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default StockPerformanceDashboard