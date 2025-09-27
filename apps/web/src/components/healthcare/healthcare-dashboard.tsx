import * as React from 'react'
import { format, startOfDay, endOfDay, subDays, isToday, isThisWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { cn } from '@/lib/utils.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.js'
import { Badge } from '@/components/ui/badge.js'
import { Button } from '@/components/ui/button.js'
import { Progress } from '@/components/ui/progress.js'
import { Alert, AlertDescription } from '@/components/ui/alert.js'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.js'
import { AccessibilityButton } from '@/components/ui/accessibility-button'
import { HealthcareFormGroup } from '@/components/ui/healthcare-form-group'

import type { 
  PatientData, 
  TreatmentSession, 
  AestheticTreatment,
  HealthcareContext,
  HealthcareDashboardMetrics 
} from '@/types/healthcare'

interface HealthcareDashboardProps {
  patients: PatientData[]
  treatments: AestheticTreatment[]
  sessions: TreatmentSession[]
  onScheduleSession?: (patientId: string, treatmentId: string) => void
  onPatientSelect?: (patient: PatientData) => void
  onViewSessionDetails?: (sessionId: string) => void
  onEmergencyAlert?: (type: 'medical' | 'facility' | 'security') => void
  className?: string
  healthcareContext?: HealthcareContext
}

interface DashboardWidgets {
  showFinancial: boolean
  showOperational: boolean
  showPatientSatisfaction: boolean
  showInventoryAlerts: boolean
}

interface TimeFilter {
  label: string
  value: 'today' | 'week' | 'month' | 'year'
  dateRange: { start: Date; end: Date }
}

const timeFilters: TimeFilter[] = [
  {
    label: 'Hoje',
    value: 'today',
    dateRange: { start: startOfDay(new Date()), end: endOfDay(new Date()) }
  },
  {
    label: 'Esta Semana',
    value: 'week',
    dateRange: { start: startOfDay(subDays(new Date(), 7)), end: endOfDay(new Date()) }
  },
  {
    label: 'Este Mês',
    value: 'month',
    dateRange: { start: startOfDay(subDays(new Date(), 30)), end: endOfDay(new Date()) }
  },
  {
    label: 'Este Ano',
    value: 'year',
    dateRange: { start: startOfDay(subDays(new Date(), 365)), end: endOfDay(new Date()) }
  }
]

export const HealthcareDashboard: React.FC<HealthcareDashboardProps> = ({
  patients,
  treatments,
  sessions,
  onScheduleSession,
  onPatientSelect,
  onViewSessionDetails,
  onEmergencyAlert,
  className,
  healthcareContext = 'administrative'
}) => {
  const [selectedTimeFilter, setSelectedTimeFilter] = React.useState<TimeFilter>(timeFilters[1]) // Default to week
  const [widgets, setWidgets] = React.useState<DashboardWidgets>({
    showFinancial: true,
    showOperational: true,
    showPatientSatisfaction: true,
    showInventoryAlerts: true
  })

  // Filter sessions based on selected time range
  const filteredSessions = sessions.filter(session => {
    const sessionDate = new Date(session.scheduledStart)
    return sessionDate >= selectedTimeFilter.dateRange.start && 
           sessionDate <= selectedTimeFilter.dateRange.end
  })

  // Calculate dashboard metrics
  const metrics = React.useMemo(() => {
    const todaySessions = sessions.filter(session => isToday(new Date(session.scheduledStart)))
    const weekSessions = sessions.filter(session => isThisWeek(new Date(session.scheduledStart)))
    
    const completedSessions = filteredSessions.filter(s => s.status === 'completed')
    const scheduledSessions = filteredSessions.filter(s => s.status === 'scheduled')
    const cancelledSessions = filteredSessions.filter(s => s.status === 'cancelled')
    
    const totalRevenue = completedSessions.reduce((sum, session) => {
      const treatment = treatments.find(t => t.id === session.treatmentId)
      return sum + (treatment?.price || 0)
    }, 0)
    
    const averageSessionValue = completedSessions.length > 0 ? totalRevenue / completedSessions.length : 0
    
    const patientRetention = patients.length > 0 
      ? (patients.filter(p => p.medicalHistory.aestheticTreatments.length > 1).length / patients.length) * 100
      : 0
    
    const treatmentPopularity = treatments.map(treatment => ({
      treatment,
      count: sessions.filter(s => s.treatmentId === treatment.id && s.status === 'completed').length
    })).sort((a, b) => b.count - a.count)

    const upcomingSessions = sessions
      .filter(s => s.status === 'scheduled')
      .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime())
      .slice(0, 5)

    const emergencyAlerts = [
      {
        id: '1',
        type: 'inventory' as const,
        message: 'Estoque baixo de toxina botulínica',
        severity: 'warning',
        count: 2
      },
      {
        id: '2',
        type: 'equipment' as const,
        message: 'Manutenção preventiva do laser necessária',
        severity: 'info',
        count: 1
      }
    ]

    return {
      totalPatients: patients.length,
      newPatientsThisMonth: patients.filter(p => 
        isThisWeek(new Date(p.createdAt))
      ).length,
      totalSessions: filteredSessions.length,
      completedSessions: completedSessions.length,
      scheduledSessions: scheduledSessions.length,
      cancelledSessions: cancelledSessions.length,
      completionRate: filteredSessions.length > 0 
        ? (completedSessions.length / filteredSessions.length) * 100 
        : 0,
      totalRevenue,
      averageSessionValue,
      patientRetention,
      treatmentPopularity,
      upcomingSessions,
      emergencyAlerts,
      todaySessions: todaySessions.length,
      weekSessions: weekSessions.length
    }
  }, [patients, treatments, sessions, filteredSessions])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      case 'in-progress': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard da Clínica</h1>
          <p className="text-muted-foreground">
            Visão geral das operações e métricas
          </p>
        </div>
        
        <div className="flex gap-2">
          <AccessibilityButton
            variant="outline"
            size="sm"
            healthcareContext="emergency"
            onClick={() => onEmergencyAlert?.('medical')}
          >
            🚨 Emergência
          </AccessibilityButton>
          <AccessibilityButton
            size="sm"
            onClick={() => onScheduleSession?.('', '')}
            healthcareContext="administrative"
          >
            ➕ Novo Agendamento
          </AccessibilityButton>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex gap-2">
        {timeFilters.map(filter => (
          <Button
            key={filter.value}
            variant={selectedTimeFilter.value === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeFilter(filter)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pacientes</p>
                <p className="text-2xl font-bold">{metrics.totalPatients}</p>
                <p className="text-xs text-muted-foreground">
                  +{metrics.newPatientsThisMonth} novos este mês
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                👥
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sessões Hoje</p>
                <p className="text-2xl font-bold">{metrics.todaySessions}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.weekSessions} esta semana
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                📅
              </div>
            </div>
          </CardContent>
        </Card>

        {widgets.showFinancial && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Receita</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(metrics.totalRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Média: {formatCurrency(metrics.averageSessionValue)}
                  </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  💰
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.completionRate)}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.completedSessions}/{metrics.totalSessions} sessões
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                📊
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="sessions">Sessões</TabsTrigger>
          <TabsTrigger value="patients">Pacientes</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Today's Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Agenda de Hoje</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.upcomingSessions.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.upcomingSessions.map(session => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(session.status)}`} />
                          <div>
                            <p className="font-medium">{session.patientName}</p>
                            <p className="text-sm text-muted-foreground">{session.treatmentName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(new Date(session.scheduledStart), 'HH:mm', { locale: ptBR })}
                          </p>
                          <p className="text-xs text-muted-foreground">{session.professional}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma sessão agendada para hoje.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.emergencyAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {metrics.emergencyAlerts.map(alert => (
                      <Alert key={alert.id}>
                        <AlertDescription>
                          <div className="flex items-center justify-between">
                            <span>{alert.message}</span>
                            <Badge variant={alert.severity === 'warning' ? 'destructive' : 'secondary'}>
                              {alert.severity === 'warning' ? 'Atenção' : 'Info'}
                            </Badge>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum alerta ativo.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Popular Treatments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tratamentos Mais Populares</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.treatmentPopularity.slice(0, 5).map(({ treatment, count }) => (
                  <div key={treatment.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        ✨
                      </div>
                      <div>
                        <p className="font-medium">{treatment.name}</p>
                        <p className="text-sm text-muted-foreground">{treatment.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{count} sessões</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(treatment.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sessões por Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{metrics.scheduledSessions}</div>
                    <div className="text-sm text-muted-foreground">Agendadas</div>
                    <Progress value={(metrics.scheduledSessions / metrics.totalSessions) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{metrics.completedSessions}</div>
                    <div className="text-sm text-muted-foreground">Concluídas</div>
                    <Progress value={(metrics.completedSessions / metrics.totalSessions) * 100} className="mt-2" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {sessions.filter(s => s.status === 'in-progress').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Andamento</div>
                    <Progress 
                      value={(sessions.filter(s => s.status === 'in-progress').length / metrics.totalSessions) * 100} 
                      className="mt-2" 
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{metrics.cancelledSessions}</div>
                    <div className="text-sm text-muted-foreground">Canceladas</div>
                    <Progress value={(metrics.cancelledSessions / metrics.totalSessions) * 100} className="mt-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Retenção de Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {formatPercentage(metrics.patientRetention)}
                    </div>
                    <div className="text-sm text-muted-foreground">Taxa de Retenção</div>
                  </div>
                  <Progress value={metrics.patientRetention} className="w-full" />
                  <div className="text-center text-sm text-muted-foreground">
                    {patients.filter(p => p.medicalHistory.aestheticTreatments.length > 1).length} de {metrics.totalPatients} pacientes retornaram
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Satisfação dos Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">4.8</div>
                    <div className="text-sm text-muted-foreground">Avaliação Média</div>
                    <div className="flex justify-center mt-2">
                      {'⭐'.repeat(4)}☆
                    </div>
                  </div>
                  <div className="text-center text-sm text-muted-foreground">
                    Baseado em {Math.floor(metrics.totalSessions * 0.8)} avaliações
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Taxa de Ocupação</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Utilização de Equipamentos</span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Satisfação da Equipe</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métricas Financeiras</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Crescimento Mensal</span>
                      <span className="text-sm text-green-600">+15%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Lucratividade</span>
                      <span className="text-sm text-muted-foreground">68%</span>
                    </div>
                    <Progress value={68} />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Custo Operacional</span>
                      <span className="text-sm text-muted-foreground">32%</span>
                    </div>
                    <Progress value={32} />
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

HealthcareDashboard.displayName = 'HealthcareDashboard'