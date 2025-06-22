'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ReportsData {
  totalClients: number
  newClientsThisMonth: number
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  totalRevenue: number
  averageTicket: number
  monthlyGrowth: number
}

export function ReportsOverview() {
  const [data, setData] = useState<ReportsData>({
    totalClients: 0,
    newClientsThisMonth: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    totalRevenue: 0,
    averageTicket: 0,
    monthlyGrowth: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadReportsData()
  }, [])

  const loadReportsData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date()
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      // Buscar dados de clientes
      const [clientsResult, appointmentsResult] = await Promise.all([
        supabase
          .from('clients')
          .select('id, created_at')
          .eq('user_id', user.id),
        
        supabase
          .from('appointments')
          .select('id, status, price_at_booking, start_time, created_at')
          .eq('user_id', user.id)
      ])

      if (clientsResult.data && appointmentsResult.data) {
        const clients = clientsResult.data
        const appointments = appointmentsResult.data

        // Calcular métricas de clientes
        const totalClients = clients.length
        const newClientsThisMonth = clients.filter(c => 
          new Date(c.created_at) >= firstDay && new Date(c.created_at) <= lastDay
        ).length

        // Calcular métricas de agendamentos
        const totalAppointments = appointments.length
        const completedAppointments = appointments.filter(a => a.status === 'completed').length
        const cancelledAppointments = appointments.filter(a => 
          ['cancelled', 'no_show'].includes(a.status)
        ).length

        // Calcular métricas financeiras
        const completedThisMonth = appointments.filter(a => 
          a.status === 'completed' &&
          new Date(a.start_time) >= firstDay && 
          new Date(a.start_time) <= lastDay
        )
        
        const totalRevenue = completedThisMonth.reduce((sum, a) => sum + (a.price_at_booking || 0), 0)
        const averageTicket = completedThisMonth.length > 0 ? totalRevenue / completedThisMonth.length : 0

        // Calcular crescimento mensal (simplificado)
        const monthlyGrowth = newClientsThisMonth > 0 ? 
          ((newClientsThisMonth / Math.max(totalClients - newClientsThisMonth, 1)) * 100) : 0

        setData({
          totalClients,
          newClientsThisMonth,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          totalRevenue,
          averageTicket,
          monthlyGrowth
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error)
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
        {[...Array(8)].map((_, i) => (
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
      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Clientes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              +{data.newClientsThisMonth} este mês
            </p>
          </CardContent>
        </Card>

        {/* Total de Agendamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Total de agendamentos
            </p>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receita do Mês
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Agendamentos concluídos
            </p>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.averageTicket)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por agendamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Agendamentos Concluídos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Concluídos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {data.completedAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalAppointments > 0 ? 
                `${((data.completedAppointments / data.totalAppointments) * 100).toFixed(1)}% do total` :
                'Nenhum agendamento'
              }
            </p>
          </CardContent>
        </Card>

        {/* Agendamentos Cancelados */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancelados
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.cancelledAppointments}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.totalAppointments > 0 ? 
                `${((data.cancelledAppointments / data.totalAppointments) * 100).toFixed(1)}% do total` :
                'Nenhum cancelamento'
              }
            </p>
          </CardContent>
        </Card>

        {/* Crescimento Mensal */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Crescimento
            </CardTitle>
            {data.monthlyGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              data.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(data.monthlyGrowth)}
            </div>
            <p className="text-xs text-muted-foreground">
              Novos clientes este mês
            </p>
          </CardContent>
        </Card>

        {/* Taxa de Conversão */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Taxa de Conversão
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalAppointments > 0 ? 
                `${((data.completedAppointments / data.totalAppointments) * 100).toFixed(1)}%` :
                '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Agendamentos → Concluídos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
