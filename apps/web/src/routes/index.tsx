import { Button, } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { createFileRoute, Link, } from '@tanstack/react-router'
import { Building2, Calendar, Clock, TrendingDown, TrendingUp, User, Users, } from 'lucide-react'
import { useEffect, useState, } from 'react'

// Types
interface Patient {
  id: string
  name: string
  email: string
  phone: string | null
  status: 'active' | 'inactive' | 'archived'
  created_at: string
}

interface Appointment {
  id: string
  patient: { name: string } | null
  type: string
  time: string
  date: string
}

interface DashboardMetrics {
  monthlyRevenue: number
  revenueGrowth: number
  totalPatients: number
  upcomingAppointments: number
}

// Custom Hooks
function useDashboardMetrics() {
  const [metrics, setMetrics,] = useState<DashboardMetrics>({
    monthlyRevenue: 25_000,
    revenueGrowth: 12.5,
    totalPatients: 150,
    upcomingAppointments: 8,
  },)
  const [loading, setLoading,] = useState(false,)

  return {
    loading,
    ...metrics,
  }
}

function usePatients() {
  const [patients, setPatients,] = useState<Patient[]>([],)
  const [loading, setLoading,] = useState(false,)

  const recentPatients = patients.slice(0, 5,)

  return {
    loading,
    recentPatients,
  }
}

function useAppointments() {
  const [appointments, setAppointments,] = useState<Appointment[]>([],)
  const [loading, setLoading,] = useState(false,)

  const todaysAppointments = appointments.filter(apt =>
    apt.date === new Date().toISOString().split('T',)[0]
  )

  return {
    loading,
    todaysAppointments,
  }
}

// Metrics Section Component
const MetricsSection = ({
  metricsLoading,
  monthlyRevenue,
  revenueGrowth,
  totalPatients,
  upcomingAppointments,
}: {
  metricsLoading: boolean
  monthlyRevenue: number
  revenueGrowth: number
  totalPatients: number
  upcomingAppointments: number
},) => (
  <section className="container mx-auto px-6 py-20">
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-bold text-3xl text-foreground">Dashboard</h2>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Visão geral do desempenho da clínica
      </p>
    </div>

    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Building2 className="h-4 w-4 mr-2" />
            Receita Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metricsLoading ? '...' : `R$ ${monthlyRevenue.toLocaleString('pt-BR',)}`}
          </div>
          <p className="flex items-center text-xs text-muted-foreground">
            {revenueGrowth >= 0
              ? <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              : <TrendingDown className="h-3 w-3 mr-1 text-red-600" />}
            {Math.abs(revenueGrowth,)}% em relação ao mês anterior
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Users className="h-4 w-4 mr-2" />
            Total de Pacientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metricsLoading ? '...' : totalPatients}
          </div>
          <p className="text-xs text-muted-foreground">
            Pacientes cadastrados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            Consultas Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metricsLoading ? '...' : upcomingAppointments}
          </div>
          <p className="text-xs text-muted-foreground">
            Próximas consultas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-sm font-medium">
            <Calendar className="h-4 w-4 mr-2" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            Operacional
          </div>
          <p className="text-xs text-muted-foreground">
            Todos os serviços funcionando
          </p>
        </CardContent>
      </Card>
    </div>
  </section>
)

// Quick Access Section Component
const QuickAccessSection = ({
  patientsLoading,
  recentPatients,
  appointmentsLoading,
  todaysAppointments,
}: {
  patientsLoading: boolean
  recentPatients: Patient[]
  appointmentsLoading: boolean
  todaysAppointments: Appointment[]
},) => (
  <section className="container mx-auto px-6 pb-20">
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-bold text-3xl text-foreground">Acesso Rápido</h2>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Informações importantes sempre à mão
      </p>
    </div>

    {/* Quick Access Links */}
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Gerenciar Pacientes
          </CardTitle>
          <CardDescription>
            Sistema completo de cadastro e gerenciamento de pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/patients">
              <User className="h-4 w-4 mr-2" />
              Ver Todos os Pacientes
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Agenda de Consultas
          </CardTitle>
          <CardDescription>
            Visualização e gerenciamento de agendamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              Abrir Agenda
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Dashboard
          </CardTitle>
          <CardDescription>
            Acesso completo ao painel administrativo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/dashboard">
              <Building2 className="h-4 w-4 mr-2" />
              Acessar Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Login
          </CardTitle>
          <CardDescription>
            Acesso ao sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/login">
              <User className="h-4 w-4 mr-2" />
              Fazer Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>
)

// Main Home Page Component
function HomePage() {
  const metricsData = useDashboardMetrics()
  const patientsData = usePatients()
  const appointmentsData = useAppointments()

  return (
    <div className="min-h-screen bg-background">
      <MetricsSection
        metricsLoading={metricsData.loading}
        monthlyRevenue={metricsData.monthlyRevenue}
        revenueGrowth={metricsData.revenueGrowth}
        totalPatients={metricsData.totalPatients}
        upcomingAppointments={metricsData.upcomingAppointments}
      />

      <QuickAccessSection
        patientsLoading={patientsData.loading}
        recentPatients={patientsData.recentPatients}
        appointmentsLoading={appointmentsData.loading}
        todaysAppointments={appointmentsData.todaysAppointments}
      />
    </div>
  )
}

// Create and export the home page route
export const Route = createFileRoute('/',)({
  component: HomePage,
},)
