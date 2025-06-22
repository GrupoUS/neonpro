'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  DollarSign,
  Calendar
} from 'lucide-react'

interface ChartData {
  labels: string[]
  values: number[]
  colors?: string[]
}

interface ReportsChartsProps {
  type: 'financial' | 'clients' | 'performance'
}

export function ReportsCharts({ type }: ReportsChartsProps) {
  const [chartData, setChartData] = useState<{
    monthly: ChartData
    services: ChartData
    status: ChartData
  }>({
    monthly: { labels: [], values: [] },
    services: { labels: [], values: [] },
    status: { labels: [], values: [] }
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadChartData()
  }, [type])

  const loadChartData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Buscar dados dos últimos 6 meses
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const [appointmentsResult, servicesResult] = await Promise.all([
        supabase
          .from('appointments')
          .select(`
            id,
            status,
            price_at_booking,
            start_time,
            services (name)
          `)
          .eq('user_id', user.id)
          .gte('start_time', sixMonthsAgo.toISOString()),
        
        supabase
          .from('services')
          .select('id, name')
          .eq('user_id', user.id)
      ])

      if (appointmentsResult.data && servicesResult.data) {
        const appointments = appointmentsResult.data
        const services = servicesResult.data

        // Dados mensais
        const monthlyData = generateMonthlyData(appointments)
        
        // Dados por serviço
        const servicesData = generateServicesData(appointments, services)
        
        // Dados por status
        const statusData = generateStatusData(appointments)

        setChartData({
          monthly: monthlyData,
          services: servicesData,
          status: statusData
        })
      }
    } catch (error) {
      console.error('Erro ao carregar dados dos gráficos:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (appointments: any[]): ChartData => {
    const monthlyStats: { [key: string]: number } = {}
    
    appointments.forEach(appointment => {
      const date = new Date(appointment.start_time)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (appointment.status === 'completed') {
        monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + (appointment.price_at_booking || 0)
      }
    })

    const labels = Object.keys(monthlyStats).sort().map(key => {
      const [year, month] = key.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { 
        month: 'short', 
        year: '2-digit' 
      })
    })
    
    const values = Object.keys(monthlyStats).sort().map(key => monthlyStats[key])

    return { labels, values }
  }

  const generateServicesData = (appointments: any[], services: any[]): ChartData => {
    const serviceStats: { [key: string]: number } = {}
    
    appointments.forEach(appointment => {
      if (appointment.services?.name && appointment.status === 'completed') {
        const serviceName = appointment.services.name
        serviceStats[serviceName] = (serviceStats[serviceName] || 0) + 1
      }
    })

    const labels = Object.keys(serviceStats)
    const values = Object.values(serviceStats)
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ]

    return { labels, values, colors }
  }

  const generateStatusData = (appointments: any[]): ChartData => {
    const statusStats: { [key: string]: number } = {}
    
    appointments.forEach(appointment => {
      const status = appointment.status
      statusStats[status] = (statusStats[status] || 0) + 1
    })

    const statusLabels: { [key: string]: string } = {
      'completed': 'Concluídos',
      'confirmed': 'Confirmados',
      'scheduled': 'Agendados',
      'cancelled': 'Cancelados',
      'no_show': 'Faltaram'
    }

    const labels = Object.keys(statusStats).map(key => statusLabels[key] || key)
    const values = Object.values(statusStats)
    const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']

    return { labels, values, colors }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const renderSimpleChart = (data: ChartData, title: string, icon: any) => {
    const IconComponent = icon
    const maxValue = Math.max(...data.values)

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <IconComponent className="mr-2 h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.labels.map((label, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-medium">
                    {type === 'financial' ? formatCurrency(data.values[index]) : data.values[index]}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${maxValue > 0 ? (data.values[index] / maxValue) * 100 : 0}%`,
                      backgroundColor: data.colors?.[index] || '#3B82F6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const getChartsForType = () => {
    switch (type) {
      case 'financial':
        return [
          { data: chartData.monthly, title: 'Receita Mensal', icon: TrendingUp },
          { data: chartData.services, title: 'Receita por Serviço', icon: DollarSign },
          { data: chartData.status, title: 'Status dos Agendamentos', icon: BarChart3 }
        ]
      case 'clients':
        return [
          { data: chartData.services, title: 'Clientes por Serviço', icon: Users },
          { data: chartData.status, title: 'Status dos Agendamentos', icon: Calendar },
          { data: chartData.monthly, title: 'Agendamentos Mensais', icon: TrendingUp }
        ]
      case 'performance':
        return [
          { data: chartData.status, title: 'Performance por Status', icon: BarChart3 },
          { data: chartData.services, title: 'Serviços Mais Procurados', icon: PieChart },
          { data: chartData.monthly, title: 'Tendência Mensal', icon: TrendingUp }
        ]
      default:
        return []
    }
  }

  const charts = getChartsForType()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {charts.map((chart, index) => (
        <div key={index}>
          {renderSimpleChart(chart.data, chart.title, chart.icon)}
        </div>
      ))}
    </div>
  )
}
