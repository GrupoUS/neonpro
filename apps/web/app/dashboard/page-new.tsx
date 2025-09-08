'use client'

import {
  EmptyState,
  // ErrorBoundary, // Unused import
  LoadingCard,
  StateManager,
} from '@/components/forms/loading-error-states'
import { Alert, AlertDescription, } from '@/components/ui/alert'
import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Skeleton, } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from '@/components/ui/tabs'
import { useAuth, } from '@/contexts/auth-context-new'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CalendarCheck,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useState, } from 'react'

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Types
interface DashboardStats {
  patients: {
    total: number
    active: number
    new_this_month: number
    lgpd_compliant: number
  }
  appointments: {
    total_today: number
    completed_today: number
    scheduled_this_week: number
    no_show_rate: number
  }
  compliance: {
    lgpd_score: number
    anvisa_compliance: boolean
    cfm_compliance: boolean
    last_audit: string
  }
  system: {
    uptime: number
    active_sessions: number
    last_backup: string
    security_alerts: number
  }
}

// Custom hook for dashboard data
function useDashboardData() {
  const [stats, setStats,] = useState<DashboardStats | null>(null,)
  const [loading, setLoading,] = useState(true,)
  const [error, setError,] = useState<string | null>(null,)
  const { user, } = useAuth()

  const fetchDashboardData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true,)
      setError(null,)

      const token = localStorage.getItem('auth_token',)
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      }

      // Mock clinic_id - in real implementation, this would come from user context
      const clinicId = 'mock-clinic-id'

      // Fetch data from our APIs
      const [patientsRes, appointmentsRes,] = await Promise.all([
        fetch(`${API_BASE_URL}/patients?clinic_id=${clinicId}&limit=1000`, { headers, },),
        fetch(`${API_BASE_URL}/appointments?clinic_id=${clinicId}&limit=1000`, { headers, },),
      ],)

      const [patientsData, appointmentsData,] = await Promise.all([
        patientsRes.json(),
        appointmentsRes.json(),
      ],)

      // Process and aggregate data
      const patients = patientsData.patients || []
      const appointments = appointmentsData.appointments || []

      // Calculate stats
      const today = new Date()
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(),)
      const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000,)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1,)
      const startOfWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000,)

      const todayAppointments = appointments.filter((apt: unknown,) => {
        const aptDate = new Date(apt.start_time,)
        return aptDate >= startOfToday && aptDate < endOfToday
      },)

      const weekAppointments = appointments.filter((apt: unknown,) => {
        const aptDate = new Date(apt.start_time,)
        return aptDate >= startOfWeek
      },)

      const completedToday = todayAppointments.filter((apt: unknown,) =>
        apt.status === 'completed'
      ).length
      const noShowAppointments = appointments.filter((apt: unknown,) =>
        apt.status === 'no_show'
      ).length
      const noShowRate = appointments.length > 0
        ? (noShowAppointments / appointments.length) * 100
        : 0

      const newPatientsThisMonth = patients.filter((patient: unknown,) => {
        const createdDate = new Date(patient.created_at,)
        return createdDate >= startOfMonth
      },).length

      const lgpdCompliantPatients = patients.filter((patient: unknown,) =>
        patient.lgpd_consent_given === true
      ).length

      const dashboardStats: DashboardStats = {
        patients: {
          total: patients.length,
          active: patients.filter((p: unknown,) => p.is_active).length,
          new_this_month: newPatientsThisMonth,
          lgpd_compliant: lgpdCompliantPatients,
        },
        appointments: {
          total_today: todayAppointments.length,
          completed_today: completedToday,
          scheduled_this_week: weekAppointments.length,
          no_show_rate: noShowRate,
        },
        compliance: {
          lgpd_score: Math.min(
            100,
            Math.round((lgpdCompliantPatients / Math.max(patients.length, 1,)) * 100,),
          ),
          anvisa_compliance: true,
          cfm_compliance: true,
          last_audit: '2024-01-15T10:00:00Z',
        },
        system: {
          uptime: 99.9,
          active_sessions: 1,
          last_backup: new Date().toISOString(),
          security_alerts: 0,
        },
      }

      setStats(dashboardStats,)
    } catch (err) {
      console.error('Dashboard data fetch error:', err,)
      setError('Falha ao carregar dados do dashboard',)
    } finally {
      setLoading(false,)
    }
  }, [user,],)

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData,],)

  return { stats, loading, error, refetch: fetchDashboardData, }
}

// Stats Card Component
type IconComponent = (props: { className?: string },) => JSX.Element

function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  color = 'default',
}: {
  title: string
  value: string | number
  description?: string
  icon: IconComponent
  trend?: { value: number; label: string }
  color?: 'default' | 'green' | 'red' | 'blue' | 'yellow'
},) {
  const colorClasses = {
    default: 'text-foreground',
    green: 'text-green-600 bg-green-50 border-green-200',
    red: 'text-red-600 bg-red-50 border-red-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  }

  return (
    <Card className={color !== 'default' ? colorClasses[color] : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <p className={`text-xs ${trend.value > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend.value > 0 ? '+' : ''}
            {trend.value}% {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4, },).map((_, i,) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading: authLoading, } = useAuth()
  const { stats, loading, error, refetch, } = useDashboardData()

  // Show auth loading
  if (authLoading) {
    return (
      <StateManager
        loading
        loadingComponent={
          <LoadingCard
            title="Carregando autenticação..."
            description="Verificando suas credenciais"
          />
        }
      >
        <div />
      </StateManager>
    )
  }

  // Show unauthorized state
  if (!user) {
    return (
      <StateManager
        isEmpty
        emptyComponent={
          <EmptyState
            title="Acesso Negado"
            description="Você precisa estar logado para acessar o dashboard."
            action={{
              label: 'Fazer Login',
              onClick: () => window.location.href = '/login',
            }}
          />
        }
      >
        <div />
      </StateManager>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo de volta, {user.full_name}. Aqui está o resumo da sua clínica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading ? <DashboardSkeleton /> : stats
        ? (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total de Pacientes"
                value={stats.patients.total}
                description={`${stats.patients.active} ativos`}
                icon={Users}
                color="blue"
              />

              <StatsCard
                title="Consultas Hoje"
                value={stats.appointments.total_today}
                description={`${stats.appointments.completed_today} concluídas`}
                icon={Calendar}
                color="green"
              />

              <StatsCard
                title="Taxa No-Show"
                value={`${stats.appointments.no_show_rate.toFixed(1,)}%`}
                description="Últimos 30 dias"
                icon={Activity}
                color={stats.appointments.no_show_rate > 10 ? 'red' : 'green'}
              />

              <StatsCard
                title="Compliance LGPD"
                value={`${stats.compliance.lgpd_score}%`}
                description="Conformidade de dados"
                icon={Shield}
                color={stats.compliance.lgpd_score > 90 ? 'green' : 'yellow'}
              />
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="patients">Pacientes</TabsTrigger>
                <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {/* Recent Activity */}
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Atividade Recente</CardTitle>
                      <CardDescription>
                        Últimas ações na plataforma
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <UserCheck className="h-4 w-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Novo paciente cadastrado</p>
                            <p className="text-xs text-muted-foreground">2 minutos atrás</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <CalendarCheck className="h-4 w-4 text-blue-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Consulta concluída</p>
                            <p className="text-xs text-muted-foreground">15 minutos atrás</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Agendamento confirmado</p>
                            <p className="text-xs text-muted-foreground">1 hora atrás</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Ações Rápidas</CardTitle>
                      <CardDescription>
                        Atalhos para tarefas comuns
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button className="w-full justify-start" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Paciente
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agendar Consulta
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Ver Relatórios
                        </Button>
                        <Button className="w-full justify-start" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Agenda Hoje
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="patients" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatsCard
                    title="Novos Este Mês"
                    value={stats.patients.new_this_month}
                    description="Crescimento mensal"
                    icon={TrendingUp}
                    color="green"
                  />

                  <StatsCard
                    title="LGPD Conformes"
                    value={`${stats.patients.lgpd_compliant}/${stats.patients.total}`}
                    description={`${stats.compliance.lgpd_score}% de conformidade`}
                    icon={Shield}
                    color="blue"
                  />

                  <StatsCard
                    title="Pacientes Ativos"
                    value={stats.patients.active}
                    description="Com consultas agendadas"
                    icon={Users}
                    color="default"
                  />
                </div>
              </TabsContent>

              <TabsContent value="appointments" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <StatsCard
                    title="Esta Semana"
                    value={stats.appointments.scheduled_this_week}
                    description="Agendamentos totais"
                    icon={Calendar}
                    color="blue"
                  />

                  <StatsCard
                    title="Concluídas Hoje"
                    value={stats.appointments.completed_today}
                    description={`De ${stats.appointments.total_today} agendadas`}
                    icon={CalendarCheck}
                    color="green"
                  />

                  <StatsCard
                    title="Taxa de No-Show"
                    value={`${stats.appointments.no_show_rate.toFixed(1,)}%`}
                    description="Meta: < 5%"
                    icon={Activity}
                    color={stats.appointments.no_show_rate > 10 ? 'red' : 'green'}
                  />
                </div>
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">LGPD</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          {stats.compliance.lgpd_score}%
                        </span>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Conforme
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">ANVISA</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Ativo
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">CFM</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <UserCheck className="h-8 w-8 text-blue-600" />
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Conforme
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {stats.system.security_alerts}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Alertas pendentes
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )
        : null}
    </div>
  )
}
