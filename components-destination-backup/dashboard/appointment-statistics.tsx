'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { pt } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/hooks/use-appointments-manager'

interface AppointmentStatisticsProps {
  appointments: Appointment[]
  previousPeriodAppointments?: Appointment[]
  className?: string
}

interface StatCard {
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: number
    isPositive: boolean
    label: string
  }
  color: string
  description?: string
}

export function AppointmentStatistics({
  appointments,
  previousPeriodAppointments = [],
  className
}: AppointmentStatisticsProps) {
  const statistics = useMemo(() => {
    // Current period stats
    const total = appointments.length
    const completed = appointments.filter(apt => apt.status === 'completed').length
    const cancelled = appointments.filter(apt => apt.status === 'cancelled').length
    const noShow = appointments.filter(apt => apt.status === 'no_show').length
    const pending = appointments.filter(apt => apt.status === 'pending').length
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length

    // Revenue calculation
    const revenue = appointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.service.price || 0), 0)

    // Success rate
    const totalFinished = completed + cancelled + noShow
    const successRate = totalFinished > 0 ? (completed / totalFinished) * 100 : 0

    // No-show rate
    const noShowRate = totalFinished > 0 ? (noShow / totalFinished) * 100 : 0

    // Previous period comparison
    const prevTotal = previousPeriodAppointments.length
    const prevCompleted = previousPeriodAppointments.filter(apt => apt.status === 'completed').length
    const prevRevenue = previousPeriodAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.service.price || 0), 0)

    // Calculate trends
    const totalTrend = prevTotal > 0 ? ((total - prevTotal) / prevTotal) * 100 : 0
    const completedTrend = prevCompleted > 0 ? ((completed - prevCompleted) / prevCompleted) * 100 : 0
    const revenueTrend = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0

    return {
      total,
      completed,
      cancelled,
      noShow,
      pending,
      confirmed,
      revenue,
      successRate,
      noShowRate,
      trends: {
        total: totalTrend,
        completed: completedTrend,
        revenue: revenueTrend
      }
    }
  }, [appointments, previousPeriodAppointments])

  const statCards: StatCard[] = [
    {
      title: 'Total de Agendamentos',
      value: statistics.total,
      icon: Calendar,
      color: 'text-blue-600',
      trend: {
        value: Math.abs(statistics.trends.total),
        isPositive: statistics.trends.total >= 0,
        label: 'vs período anterior'
      },
      description: 'Agendamentos no período'
    },
    {
      title: 'Agendamentos Concluídos',
      value: statistics.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      trend: {
        value: Math.abs(statistics.trends.completed),
        isPositive: statistics.trends.completed >= 0,
        label: 'vs período anterior'
      },
      description: 'Atendimentos realizados'
    },
    {
      title: 'Receita Gerada',
      value: `R$ ${statistics.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-green-600',
      trend: {
        value: Math.abs(statistics.trends.revenue),
        isPositive: statistics.trends.revenue >= 0,
        label: 'vs período anterior'
      },
      description: 'Receita dos atendimentos'
    },
    {
      title: 'Taxa de Sucesso',
      value: `${statistics.successRate.toFixed(1)}%`,
      icon: Target,
      color: statistics.successRate >= 80 ? 'text-green-600' : statistics.successRate >= 60 ? 'text-yellow-600' : 'text-red-600',
      description: 'Atendimentos realizados com sucesso'
    },
    {
      title: 'Taxa de Não Comparecimento',
      value: `${statistics.noShowRate.toFixed(1)}%`,
      icon: AlertTriangle,
      color: statistics.noShowRate <= 10 ? 'text-green-600' : statistics.noShowRate <= 20 ? 'text-yellow-600' : 'text-red-600',
      description: 'Pacientes que não compareceram'
    },
    {
      title: 'Pendentes de Confirmação',
      value: statistics.pending,
      icon: Clock,
      color: 'text-yellow-600',
      description: 'Aguardando confirmação'
    }
  ]

  const statusDistribution = [
    { status: 'completed', label: 'Concluídos', value: statistics.completed, color: 'bg-green-500' },
    { status: 'confirmed', label: 'Confirmados', value: statistics.confirmed, color: 'bg-blue-500' },
    { status: 'pending', label: 'Pendentes', value: statistics.pending, color: 'bg-yellow-500' },
    { status: 'cancelled', label: 'Cancelados', value: statistics.cancelled, color: 'bg-red-500' },
    { status: 'no_show', label: 'Não Compareceram', value: statistics.noShow, color: 'bg-red-400' }
  ].filter(item => item.value > 0)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className={cn('text-2xl font-bold', stat.color)}>
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    )}
                  </div>
                  <Icon className={cn('h-8 w-8', stat.color)} />
                </div>
                
                {stat.trend && (
                  <div className="mt-4 flex items-center space-x-1">
                    {stat.trend.isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={cn(
                      'text-sm font-medium',
                      stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                    )}>
                      {stat.trend.isPositive ? '+' : '-'}{stat.trend.value.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {stat.trend.label}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Status Distribution and Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribuição por Status
            </CardTitle>
            <CardDescription>
              Breakdown dos agendamentos por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statusDistribution.map((item) => (
                <div key={item.status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={cn('w-3 h-3 rounded-full', item.color)} />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{item.value}</span>
                      <Badge variant="outline">
                        {statistics.total > 0 ? ((item.value / statistics.total) * 100).toFixed(1) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={statistics.total > 0 ? (item.value / statistics.total) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Performance
            </CardTitle>
            <CardDescription>
              Indicadores de qualidade do atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Success Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Sucesso</span>
                  <span className="text-sm font-bold text-green-600">
                    {statistics.successRate.toFixed(1)}%
                  </span>
                </div>
                <Progress value={statistics.successRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Meta: ≥ 80% (
                  {statistics.successRate >= 80 ? (
                    <span className="text-green-600">Atingida ✓</span>
                  ) : (
                    <span className="text-red-600">
                      Faltam {(80 - statistics.successRate).toFixed(1)}%
                    </span>
                  )}
                  )
                </p>
              </div>

              {/* No-Show Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Faltas</span>
                  <span className={cn(
                    'text-sm font-bold',
                    statistics.noShowRate <= 10 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {statistics.noShowRate.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={statistics.noShowRate} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  Meta: ≤ 10% (
                  {statistics.noShowRate <= 10 ? (
                    <span className="text-green-600">Atingida ✓</span>
                  ) : (
                    <span className="text-red-600">
                      Acima em {(statistics.noShowRate - 10).toFixed(1)}%
                    </span>
                  )}
                  )
                </p>
              </div>

              {/* Confirmation Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Taxa de Confirmação</span>
                  <span className="text-sm font-bold text-blue-600">
                    {statistics.total > 0 ? (((statistics.confirmed + statistics.completed) / statistics.total) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress 
                  value={statistics.total > 0 ? ((statistics.confirmed + statistics.completed) / statistics.total) * 100 : 0} 
                  className="h-2" 
                />
                <p className="text-xs text-muted-foreground">
                  {statistics.pending > 0 ? (
                    <>
                      {statistics.pending} agendamento{statistics.pending !== 1 ? 's' : ''} pendente{statistics.pending !== 1 ? 's' : ''}
                    </>
                  ) : (
                    'Todos os agendamentos confirmados'
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}