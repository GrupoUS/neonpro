'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Skeleton, } from '@/components/ui/skeleton'
import { Activity, BarChart3, Calendar, TrendingUp, Users, } from 'lucide-react'
import { DASHBOARD_CONSTANTS, } from './constants'

interface MetricsCardsProps {
  metricsLoading: boolean
  monthlyRevenue: number
  revenueGrowth: number
  totalPatients: number
  upcomingAppointments: number
}

export const MetricsCards = ({
  metricsLoading,
  monthlyRevenue,
  revenueGrowth,
  totalPatients,
  upcomingAppointments,
}: MetricsCardsProps,) => {
  const renderRevenueDescription = () => {
    if (metricsLoading) {
      return <Skeleton className="h-4 w-20 bg-muted" />
    }

    const sign = revenueGrowth >= DASHBOARD_CONSTANTS.GROWTH_THRESHOLD ? '+' : ''
    const formattedGrowth = revenueGrowth.toFixed(
      DASHBOARD_CONSTANTS.PERCENTAGE_DECIMAL_PLACES,
    )
    return `${sign}${formattedGrowth}% este mês`
  }

  const renderRevenueContent = () => {
    if (metricsLoading) {
      return <Skeleton className="h-8 w-32 bg-muted" />
    }

    return (
      <div className="flex items-center">
        <p className="font-bold text-3xl text-foreground">
          R$ {monthlyRevenue.toLocaleString('pt-BR',)}
        </p>
        {revenueGrowth >= DASHBOARD_CONSTANTS.GROWTH_THRESHOLD && (
          <TrendingUp className="ml-2 h-5 w-5 text-primary" />
        )}
      </div>
    )
  }

  const renderPatientsContent = () => {
    if (metricsLoading) {
      return <Skeleton className="h-8 w-16 bg-muted" />
    }

    return (
      <p className="font-bold text-3xl text-foreground">
        {totalPatients.toLocaleString('pt-BR',)}
      </p>
    )
  }

  const renderAppointmentsContent = () => {
    if (metricsLoading) {
      return <Skeleton className="h-8 w-12 bg-muted" />
    }

    return (
      <p className="font-bold text-3xl text-foreground">
        {upcomingAppointments}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card className="neonpro-card group">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-foreground">
            <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            Receita Mensal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {renderRevenueDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderRevenueContent()}</CardContent>
      </Card>

      {/* Patients Card */}
      <Card className="neonpro-card group">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-foreground">
            <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-5/10 transition-all">
              <Users className="h-4 w-4 text-chart-5" />
            </div>
            Total Pacientes
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Cadastros ativos
          </CardDescription>
        </CardHeader>
        <CardContent>{renderPatientsContent()}</CardContent>
      </Card>

      {/* Upcoming Appointments Card */}
      <Card className="neonpro-card group">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-foreground">
            <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 transition-all">
              <Calendar className="h-4 w-4 text-chart-2" />
            </div>
            Próximas Consultas
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Agendamentos confirmados
          </CardDescription>
        </CardHeader>
        <CardContent>{renderAppointmentsContent()}</CardContent>
      </Card>

      {/* Activity Card */}
      <Card className="neonpro-card group">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-foreground">
            <div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 transition-all">
              <Activity className="h-4 w-4 text-chart-3" />
            </div>
            Atividade
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sistema online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-bold text-3xl text-foreground">100%</p>
        </CardContent>
      </Card>
    </div>
  )
}
