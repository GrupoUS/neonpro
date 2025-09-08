import { AppointmentsList, } from '@/components/dashboard/AppointmentsList'
import { HeroSection, } from '@/components/dashboard/HeroSection'
import { MetricsCards, } from '@/components/dashboard/MetricsCards'
import { PatientsList, } from '@/components/PatientsList'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui'
import { useAppointments, } from '@/hooks/useAppointments'
import { useDashboardMetrics, } from '@/hooks/useDashboardMetrics'
import { usePatients, } from '@/hooks/usePatients'
import { createFileRoute, } from '@tanstack/react-router'
import { Link, } from '@tanstack/react-router'
import { Building2, Calendar, User, } from 'lucide-react'

// Interface definitions (migrated from original page.tsx)
interface Patient {
  id: string
  name?: string
  status?: string
  avatar?: string
}

interface Appointment {
  id: string
  patient?: {
    name?: string
  }
  time?: string
  type?: string
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
  <section className="container mx-auto px-6 pb-20">
    <div className="mb-12 text-center">
      <h2 className="mb-4 font-bold text-3xl text-foreground">
        Performance em Tempo Real
      </h2>
      <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
        Acompanhe o crescimento da sua clínica com métricas atualizadas automaticamente
      </p>
    </div>

    <MetricsCards
      metricsLoading={metricsLoading}
      monthlyRevenue={monthlyRevenue}
      revenueGrowth={revenueGrowth}
      totalPatients={totalPatients}
      upcomingAppointments={upcomingAppointments}
    />
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

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <PatientsList
        patientsLoading={patientsLoading}
        recentPatients={recentPatients.map(p => ({ ...p, status: p.status || 'active', }))}
      />

      <AppointmentsList
        appointmentsLoading={appointmentsLoading}
        todaysAppointments={todaysAppointments}
      />
    </div>

    {/* Quick Access Links */}
    <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <Link to="/pacientes">
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
            <Link to="/agenda">
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
            Gerenciar Clínica
          </CardTitle>
          <CardDescription>
            Configurações, equipe e informações da clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/clinica">
              <Building2 className="h-4 w-4 mr-2" />
              Gerenciar Clínica
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
      <HeroSection />

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

  // Preload data for performance
  loader: async ({ context, },) => {
    const { queryClient, } = context

    // Preload dashboard metrics, patients, and appointments
    await Promise.allSettled([
      // These would be implemented with actual QueryKeys
      // queryClient.ensureQueryData(QueryKeys.analytics.dashboard('user')),
      // queryClient.ensureQueryData(QueryKeys.patients.list()),
      // queryClient.ensureQueryData(QueryKeys.appointments.upcoming('user'))
    ],)

    return {}
  },

  // Error boundary for home page
  errorComponent: ({ error, },) => (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-destructive">
          Erro na Página Inicial
        </h1>
        <p className="mb-4 text-lg text-muted-foreground">
          Não foi possível carregar os dados do dashboard.
        </p>
        <details className="mb-8 text-left">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            Detalhes do erro
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-muted p-4 text-xs">
            {error.message}
          </pre>
        </details>
        <div className="space-x-4">
          <Button onClick={() => window.location.reload()}>
            Tentar Novamente
          </Button>
          <Button asChild variant="outline">
            <Link to="/dashboard">Ir para Dashboard</Link>
          </Button>
          <Button asChild variant="destructive">
            <Link to="/emergency">🚨 Acesso de Emergência</Link>
          </Button>
        </div>
      </div>
    </div>
  ),

  // Loading state for home page
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent">
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando dados do dashboard...
        </p>
      </div>
    </div>
  ),

  // SEO and meta information
  meta: () => [
    {
      title: 'NeonPro - Healthcare Management System',
    },
    {
      name: 'description',
      content: 'Sistema profissional de gestão em saúde para clínicas de estética',
    },
  ],
},)
