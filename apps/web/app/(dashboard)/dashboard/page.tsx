'use client'

/**
 * Main Dashboard Page with Sidebar Layout
 * Implementa o design do tema tweakcn com sidebar e layout moderno
 */

import { Badge, } from '@/components/ui/badge'
import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Progress, } from '@/components/ui/progress'
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  MoreHorizontal,
  TrendingUp,
  Users,
} from 'lucide-react'

// Dados mockados para o dashboard
const dashboardData = {
  metrics: [
    {
      title: 'Total de Pacientes',
      value: '2,345',
      change: '+2.1%',
      trend: 'up',
      icon: Users,
      description: '+2% em relação ao mês passado',
    },
    {
      title: 'Consultas Hoje',
      value: '24',
      change: '+1 agendada para amanhã',
      trend: 'neutral',
      icon: Calendar,
      description: '11 agendadas para amanhã',
    },
    {
      title: 'Prontuários Ativos',
      value: '1,234',
      change: '+15% este mês',
      trend: 'up',
      icon: Heart,
      description: '+15% este mês',
    },
    {
      title: 'Taxa de Ocupação',
      value: '87%',
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      description: 'Acima da meta de 85%',
    },
  ],
  recentActivities: [
    {
      id: 1,
      type: 'patient',
      title: 'Novo paciente cadastrado: Maria Silva',
      time: 'há 2 minutos',
      status: 'success',
    },
    {
      id: 2,
      type: 'appointment',
      title: 'Consulta agendada: Dr. João Santos',
      time: 'há 15 minutos',
      status: 'info',
    },
    {
      id: 3,
      type: 'treatment',
      title: 'Prontuário atualizado: Pedro Costa',
      time: 'há 1 hora',
      status: 'warning',
    },
  ],
  upcomingAppointments: [
    {
      id: 1,
      time: '09:00',
      patient: 'Ana Paula - Cardiologia',
      doctor: 'Dr. Carlos Mendoza',
      status: 'confirmed',
    },
    {
      id: 2,
      time: '10:30',
      patient: 'Carlos Mendoza - Neurologia',
      doctor: 'Dr. Sofia Rodrigues',
      status: 'pending',
    },
    {
      id: 3,
      time: '14:00',
      patient: 'Sofia Rodrigues - Pediatria',
      doctor: 'Dr. João Santos',
      status: 'confirmed',
    },
  ],
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Healthcare</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão médica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            Sistema Online
          </Badge>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardData.metrics.map((metric, index,) => {
          const Icon = metric.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {metric.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                  {metric.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                  <span>{metric.description}</span>
                </div>
              </CardContent>
            </Card>
          )
        },)}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Atividades Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Você tem {dashboardData.recentActivities.length} atividades recentes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentActivities.map((activity,) => (
              <div key={activity.id} className="flex items-center space-x-4 rounded-lg border p-3">
                <div className="flex-shrink-0">
                  {activity.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  )}
                  {activity.status === 'info' && <Clock className="h-5 w-5 text-blue-500" />}
                  {activity.status === 'warning' && (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Próximas Consultas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
            <CardDescription>
              Você tem {dashboardData.upcomingAppointments.length} consultas hoje
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.upcomingAppointments.map((appointment,) => (
              <div key={appointment.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <span className="text-xs font-medium text-blue-600">
                      {appointment.time}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {appointment.patient}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {appointment.doctor}
                  </p>
                </div>
                <Badge
                  variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Total Visitors Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Total de Visitantes</CardTitle>
            <CardDescription>Total dos últimos 3 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center space-y-2">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Gráfico de visitantes será implementado aqui
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Monitoramento em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">CPU</span>
                <span className="text-sm text-muted-foreground">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Memória</span>
                <span className="text-sm text-muted-foreground">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Armazenamento</span>
                <span className="text-sm text-muted-foreground">23%</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
