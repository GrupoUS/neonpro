'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Activity, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Target,
  Filter,
  Download,
  Share,
  RefreshCw,
  BarChart3,
  LineChart,
  PieChart,
  Calendar as CalendarIcon,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Info,
  Zap,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  Eye,
  MapPin,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  TabletSmartphone
} from 'lucide-react'
import { format, subDays, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// Type Definitions
interface MetricsData {
  totalPatients: number
  totalTouchpoints: number
  averageSatisfaction: number
  conversionRate: number
  churnRate: number
  averageJourneyTime: number
  npsScore: number
  optimizationOpportunities: number
  trends: {
    patients: number
    satisfaction: number
    conversion: number
    churn: number
  }
}

interface JourneyStage {
  id: string
  name: string
  order: number
  totalPatients: number
  conversionRate: number
  averageTime: number
  satisfactionScore: number
  dropOffRate: number
  touchpoints: TouchpointData[]
}

interface TouchpointData {
  id: string
  name: string
  type: string
  channel: string
  interactions: number
  satisfaction: number
  conversionRate: number
  issues: number
  optimization: number
  trends: {
    interactions: number
    satisfaction: number
    conversion: number
  }
}

interface PatientFlow {
  stage: string
  patients: number
  percentage: number
  trend: number
  color: string
}

interface ChurnRisk {
  patientId: string
  patientName: string
  riskScore: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: string[]
  lastActivity: Date
  predictedChurnDate: Date
  recommendedActions: string[]
}

interface ExperienceRecommendation {
  id: string
  type: 'IMPROVEMENT' | 'OPTIMIZATION' | 'PREVENTION'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  description: string
  impact: string
  effort: string
  roi: number
  touchpoints: string[]
  implementation: string[]
  metrics: string[]
}

interface SatisfactionMetric {
  category: string
  score: number
  trend: number
  target: number
  responses: number
  breakdown: {
    excellent: number
    good: number
    average: number
    poor: number
    terrible: number
  }
}

interface ChannelPerformance {
  channel: string
  icon: React.ReactNode
  interactions: number
  satisfaction: number
  conversion: number
  trend: number
  color: string
}

interface RealTimeEvent {
  id: string
  type: string
  patientName: string
  touchpoint: string
  timestamp: Date
  severity: 'INFO' | 'WARNING' | 'ERROR'
  message: string
}

const JourneyAnalyticsDashboard: React.FC = () => {
  // State Management
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [journeyStages, setJourneyStages] = useState<JourneyStage[]>([])
  const [patientFlow, setPatientFlow] = useState<PatientFlow[]>([])
  const [churnRisks, setChurnRisks] = useState<ChurnRisk[]>([])
  const [recommendations, setRecommendations] = useState<ExperienceRecommendation[]>([])
  const [satisfactionMetrics, setSatisfactionMetrics] = useState<SatisfactionMetric[]>([])
  const [channelPerformance, setChannelPerformance] = useState<ChannelPerformance[]>([])
  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([])
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [selectedChannel, setSelectedChannel] = useState<string>('all')
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    riskLevel: 'all',
    priority: 'all',
    satisfaction: 'all'
  })

  // Refs for real-time updates
  const eventSourceRef = useRef<EventSource | null>(null)
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Memoized filtered data
  const filteredChurnRisks = useMemo(() => {
    return churnRisks.filter(risk => {
      const matchesSearch = risk.patientName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRisk = filters.riskLevel === 'all' || risk.riskLevel === filters.riskLevel
      return matchesSearch && matchesRisk
    })
  }, [churnRisks, searchTerm, filters.riskLevel])

  const filteredRecommendations = useMemo(() => {
    return recommendations.filter(rec => {
      const matchesSearch = rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           rec.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = filters.priority === 'all' || rec.priority === filters.priority
      return matchesSearch && matchesPriority
    })
  }, [recommendations, searchTerm, filters.priority])

  // Channel performance icons mapping
  const channelIcons = {
    'whatsapp': <MessageSquare className="h-4 w-4" />,
    'phone': <Phone className="h-4 w-4" />,
    'email': <Mail className="h-4 w-4" />,
    'website': <Globe className="h-4 w-4" />,
    'mobile': <Smartphone className="h-4 w-4" />,
    'desktop': <Monitor className="h-4 w-4" />,
    'tablet': <TabletSmartphone className="h-4 w-4" />,
    'in-person': <MapPin className="h-4 w-4" />
  }

  // Risk level colors and icons
  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Baixo</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Médio</Badge>
      case 'HIGH':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Alto</Badge>
      case 'CRITICAL':
        return <Badge variant="destructive">Crítico</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return <Badge variant="secondary">Baixa</Badge>
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Média</Badge>
      case 'HIGH':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Alta</Badge>
      case 'CRITICAL':
        return <Badge variant="destructive">Crítica</Badge>
      default:
        return <Badge variant="outline">Normal</Badge>
    }
  }

  // Data fetching functions
  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null)
      const params = new URLSearchParams({
        timeRange: selectedTimeRange,
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
        stage: selectedStage,
        channel: selectedChannel
      })

      const [
        metricsRes,
        stagesRes,
        flowRes,
        churnRes,
        recommendationsRes,
        satisfactionRes,
        channelsRes
      ] = await Promise.all([
        fetch(`/api/analytics/journey/metrics?${params}`),
        fetch(`/api/analytics/journey/stages?${params}`),
        fetch(`/api/analytics/journey/flow?${params}`),
        fetch(`/api/analytics/journey/churn-risks?${params}`),
        fetch(`/api/analytics/journey/recommendations?${params}`),
        fetch(`/api/analytics/journey/satisfaction?${params}`),
        fetch(`/api/analytics/journey/channels?${params}`)
      ])

      if (!metricsRes.ok) throw new Error('Failed to fetch metrics')
      
      const [
        metricsData,
        stagesData,
        flowData,
        churnData,
        recommendationsData,
        satisfactionData,
        channelsData
      ] = await Promise.all([
        metricsRes.json(),
        stagesRes.json(),
        flowRes.json(),
        churnRes.json(),
        recommendationsRes.json(),
        satisfactionRes.json(),
        channelsRes.json()
      ])

      setMetrics(metricsData)
      setJourneyStages(stagesData)
      setPatientFlow(flowData)
      setChurnRisks(churnData)
      setRecommendations(recommendationsData)
      setSatisfactionMetrics(satisfactionData)
      setChannelPerformance(channelsData.map((channel: any) => ({
        ...channel,
        icon: channelIcons[channel.channel as keyof typeof channelIcons] || <Globe className="h-4 w-4" />
      })))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    }
  }, [selectedTimeRange, dateRange, selectedStage, selectedChannel])

  const refreshData = useCallback(async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
  }, [fetchDashboardData])

  // Real-time events setup
  const setupRealTimeUpdates = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    eventSourceRef.current = new EventSource('/api/analytics/journey/events/stream')
    
    eventSourceRef.current.onmessage = (event) => {
      const newEvent: RealTimeEvent = JSON.parse(event.data)
      setRealTimeEvents(prev => [newEvent, ...prev.slice(0, 49)])
    }

    eventSourceRef.current.onerror = () => {
      console.warn('Real-time connection lost, attempting to reconnect...')
      setTimeout(setupRealTimeUpdates, 5000)
    }
  }, [])

  // Effects
  useEffect(() => {
    setLoading(true)
    fetchDashboardData().finally(() => setLoading(false))
  }, [fetchDashboardData])

  useEffect(() => {
    setupRealTimeUpdates()
    
    // Auto-refresh every 5 minutes
    refreshIntervalRef.current = setInterval(refreshData, 5 * 60 * 1000)

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
    }
  }, [setupRealTimeUpdates, refreshData])

  // Event handlers
  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
    const now = new Date()
    let from: Date

    switch (range) {
      case '7d':
        from = subDays(now, 7)
        break
      case '30d':
        from = subDays(now, 30)
        break
      case '90d':
        from = subDays(now, 90)
        break
      case '6m':
        from = subMonths(now, 6)
        break
      case '1y':
        from = subMonths(now, 12)
        break
      default:
        from = subDays(now, 30)
    }

    setDateRange({ from, to: now })
  }

  const handleExport = async (format: 'pdf' | 'excel' | 'png') => {
    try {
      const response = await fetch('/api/analytics/journey/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          timeRange: selectedTimeRange,
          dateRange,
          filters: { stage: selectedStage, channel: selectedChannel }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `journey-analytics-${format}.${format === 'excel' ? 'xlsx' : format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Erro ao exportar dados')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando analytics da jornada...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={refreshData} variant="outline" size="sm" className="mt-2">
          Tentar novamente
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics da Jornada</h1>
          <p className="text-muted-foreground">
            Análise completa da experiência e jornada dos pacientes
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="1y">1 ano</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={refreshData}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="space-y-2">
                <p className="font-medium">Exportar Relatório</p>
                <div className="flex flex-col space-y-1">
                  <Button onClick={() => handleExport('pdf')} variant="ghost" size="sm">
                    Exportar PDF
                  </Button>
                  <Button onClick={() => handleExport('excel')} variant="ghost" size="sm">
                    Exportar Excel
                  </Button>
                  <Button onClick={() => handleExport('png')} variant="ghost" size="sm">
                    Exportar Imagem
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className={cn(
                  "inline-flex items-center",
                  metrics.trends.patients >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.trends.patients >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metrics.trends.patients)}%
                </span>
                {' '}vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.averageSatisfaction.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                <span className={cn(
                  "inline-flex items-center",
                  metrics.trends.satisfaction >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.trends.satisfaction >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metrics.trends.satisfaction).toFixed(1)}%
                </span>
                {' '}vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className={cn(
                  "inline-flex items-center",
                  metrics.trends.conversion >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.trends.conversion >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metrics.trends.conversion).toFixed(1)}%
                </span>
                {' '}vs período anterior
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Churn</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span className={cn(
                  "inline-flex items-center",
                  metrics.trends.churn <= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {metrics.trends.churn <= 0 ? (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(metrics.trends.churn).toFixed(1)}%
                </span>
                {' '}vs período anterior
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="journey">Jornada</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfação</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="optimization">Otimização</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Flow Visualization */}
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Pacientes</CardTitle>
                <CardDescription>Distribuição de pacientes por estágio da jornada</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patientFlow.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-muted-foreground">
                            {stage.patients} ({stage.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={stage.percentage} className="h-2" />
                      </div>
                      <div className={cn(
                        "text-xs",
                        stage.trend >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {stage.trend >= 0 ? "+" : ""}{stage.trend.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Channel Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
                <CardDescription>Análise de performance por canal de comunicação</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {channelPerformance.map((channel, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center space-x-2 flex-1">
                        {channel.icon}
                        <span className="font-medium capitalize">{channel.channel}</span>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.interactions.toLocaleString()}</div>
                        <div className="text-muted-foreground">interações</div>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.satisfaction.toFixed(1)}</div>
                        <div className="text-muted-foreground">satisfação</div>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.conversion.toFixed(1)}%</div>
                        <div className="text-muted-foreground">conversão</div>
                      </div>
                      <div className={cn(
                        "text-xs",
                        channel.trend >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {channel.trend >= 0 ? "+" : ""}{channel.trend.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-time Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Eventos em Tempo Real</span>
                <Badge variant="secondary" className="ml-auto">
                  {realTimeEvents.length} eventos
                </Badge>
              </CardTitle>
              <CardDescription>Últimas atividades da jornada dos pacientes</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {realTimeEvents.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2",
                        event.severity === 'ERROR' && "bg-red-500",
                        event.severity === 'WARNING' && "bg-yellow-500",
                        event.severity === 'INFO' && "bg-blue-500"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{event.patientName}</span>
                          <Badge variant="outline" className="text-xs">{event.touchpoint}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(event.timestamp, "HH:mm:ss", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Journey Tab */}
        <TabsContent value="journey" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa da Jornada do Paciente</CardTitle>
              <CardDescription>Análise detalhada de cada estágio da jornada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {journeyStages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {index < journeyStages.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-12 bg-border" />
                    )}
                    
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                        {stage.order}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{stage.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{stage.totalPatients} pacientes</span>
                            <span>{stage.conversionRate.toFixed(1)}% conversão</span>
                            <span>{stage.satisfactionScore.toFixed(1)} satisfação</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Tempo Médio</div>
                            <div className="font-medium">{Math.round(stage.averageTime / 60)} min</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Taxa de Abandono</div>
                            <div className="font-medium text-red-600">{stage.dropOffRate.toFixed(1)}%</div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Touchpoints</div>
                            <div className="font-medium">{stage.touchpoints.length}</div>
                          </div>
                        </div>

                        {/* Touchpoints */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {stage.touchpoints.map((touchpoint) => (
                            <div key={touchpoint.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{touchpoint.name}</span>
                                <Badge variant="outline" className="text-xs">{touchpoint.channel}</Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Interações:</span>
                                  <span className="font-medium">{touchpoint.interactions}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Satisfação:</span>
                                  <span className="font-medium">{touchpoint.satisfaction.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Conversão:</span>
                                  <span className="font-medium">{touchpoint.conversionRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Satisfaction Tab */}
        <TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {satisfactionMetrics.map((metric, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{metric.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{metric.score.toFixed(1)}</span>
                      <Badge variant={metric.score >= metric.target ? "default" : "destructive"}>
                        Meta: {metric.target.toFixed(1)}
                      </Badge>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {metric.responses} respostas coletadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={(metric.score / 5) * 100} className="h-2" />
                    
                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Péssimo</div>
                        <div className="font-medium">{metric.breakdown.terrible}</div>
                        <div className="w-full h-2 bg-red-500 rounded" style={{
                          height: `${Math.max(4, (metric.breakdown.terrible / metric.responses) * 40)}px`
                        }} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Ruim</div>
                        <div className="font-medium">{metric.breakdown.poor}</div>
                        <div className="w-full h-2 bg-orange-500 rounded" style={{
                          height: `${Math.max(4, (metric.breakdown.poor / metric.responses) * 40)}px`
                        }} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Regular</div>
                        <div className="font-medium">{metric.breakdown.average}</div>
                        <div className="w-full h-2 bg-yellow-500 rounded" style={{
                          height: `${Math.max(4, (metric.breakdown.average / metric.responses) * 40)}px`
                        }} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Bom</div>
                        <div className="font-medium">{metric.breakdown.good}</div>
                        <div className="w-full h-2 bg-blue-500 rounded" style={{
                          height: `${Math.max(4, (metric.breakdown.good / metric.responses) * 40)}px`
                        }} />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Excelente</div>
                        <div className="font-medium">{metric.breakdown.excellent}</div>
                        <div className="w-full h-2 bg-green-500 rounded" style={{
                          height: `${Math.max(4, (metric.breakdown.excellent / metric.responses) * 40)}px`
                        }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Churn Tab */}
        <TabsContent value="churn" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Riscos de Churn</h3>
              <p className="text-muted-foreground">Pacientes com risco de abandono</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Risco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="CRITICAL">Crítico</SelectItem>
                  <SelectItem value="HIGH">Alto</SelectItem>
                  <SelectItem value="MEDIUM">Médio</SelectItem>
                  <SelectItem value="LOW">Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChurnRisks.map((risk) => (
              <Card key={risk.patientId} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{risk.patientName}</CardTitle>
                    {getRiskBadge(risk.riskLevel)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Score de Risco:</span>
                    <span className="font-bold text-red-600">{(risk.riskScore * 100).toFixed(0)}%</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Fatores de Risco:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.factors.map((factor, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Última Atividade:</div>
                    <div className="text-sm font-medium">
                      {format(risk.lastActivity, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Previsão de Churn:</div>
                    <div className="text-sm font-medium text-red-600">
                      {format(risk.predictedChurnDate, "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Ações Recomendadas:</div>
                    <div className="space-y-1 mt-1">
                      {risk.recommendedActions.slice(0, 2).map((action, index) => (
                        <div key={index} className="text-xs p-2 bg-muted rounded text-muted-foreground">
                          • {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recomendações de Otimização</h3>
              <p className="text-muted-foreground">Oportunidades de melhoria da experiência</p>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Buscar recomendação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="CRITICAL">Crítica</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="MEDIUM">Média</SelectItem>
                  <SelectItem value="LOW">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <Card key={rec.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-base">{rec.title}</CardTitle>
                        {getPriorityBadge(rec.priority)}
                        <Badge variant="outline">{rec.type}</Badge>
                      </div>
                      <CardDescription>{rec.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">ROI Estimado</div>
                      <div className="text-lg font-bold text-green-600">{rec.roi.toFixed(1)}x</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Impacto Esperado:</div>
                      <div className="text-sm text-muted-foreground">{rec.impact}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Esforço Necessário:</div>
                      <div className="text-sm text-muted-foreground">{rec.effort}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Touchpoints Afetados:</div>
                    <div className="flex flex-wrap gap-1">
                      {rec.touchpoints.map((touchpoint, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {touchpoint}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Passos de Implementação:</div>
                    <div className="space-y-1">
                      {rec.implementation.map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <div className="text-sm text-muted-foreground">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-2">Métricas de Sucesso:</div>
                    <div className="flex flex-wrap gap-1">
                      {rec.metrics.map((metric, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default JourneyAnalyticsDashboard
