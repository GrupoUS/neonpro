import { createFileRoute, Link, } from '@tanstack/react-router'
import { useAppointments, } from '../../../hooks/useAppointments'
import { useDashboardMetrics, } from '../../../hooks/useDashboardMetrics'
import { usePatients, } from '../../../hooks/usePatients'

// Import dashboard components (to be migrated)
// import { AppointmentsList, } from '@/components/dashboard/AppointmentsList'
// import { MetricsCards, } from '@/components/dashboard/MetricsCards'
import { PatientsList, } from '../../../components/PatientsList'

// Dashboard Home Component
function DashboardHome() {
  const metricsData = useDashboardMetrics()
  const patientsData = usePatients()
  const appointmentsData = useAppointments()

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do sistema de gestão em saúde
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Atualizado: {new Date().toLocaleString('pt-BR',)}
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Métricas em Tempo Real</h2>
        {
          /* <MetricsCards
          metricsLoading={metricsData.loading}
          monthlyRevenue={metricsData.monthlyRevenue}
          revenueGrowth={metricsData.revenueGrowth}
          totalPatients={metricsData.totalPatients}
          upcomingAppointments={metricsData.upcomingAppointments}
        /> */
        }
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Patients */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pacientes Recentes</h3>
          <PatientsList
            patientsLoading={patientsData.loading}
            recentPatients={patientsData.recentPatients?.slice(0, 5,) || []}
          />
        </div>

        {/* Today's Appointments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Consultas de Hoje</h3>
          {
            /* <AppointmentsList
            appointmentsLoading={appointmentsData.loading}
            todaysAppointments={appointmentsData.todaysAppointments?.slice(0, 5,) || []}
          /> */
          }
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid gap-4 md:grid-cols-4">
          <Link
            to="/dashboard/patients"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <span className="text-sm font-medium">Gerenciar Pacientes</span>
          </Link>
          <Link
            to="/dashboard/appointments"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl mb-2">📅</div>
            <span className="text-sm font-medium">Nova Consulta</span>
          </Link>
          <Link
            to="/dashboard/treatments"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl mb-2">💊</div>
            <span className="text-sm font-medium">Tratamentos</span>
          </Link>
          <Link
            to="/dashboard/reports"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center hover:bg-muted/50 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <span className="text-sm font-medium">Relatórios</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Create and export the dashboard home route
export const Route = createFileRoute('/dashboard/',)({
  component: DashboardHome,

  // Data loading for dashboard
  loader: async ({ context, },) => {
    const { queryClient, } = context

    // Preload dashboard data
    await Promise.allSettled([
      // Metrics data
      // queryClient.ensureQueryData(QueryKeys.analytics.dashboard('user')),
      // Recent patients
      // queryClient.ensureQueryData(QueryKeys.patients.list({ limit: 5, recent: true })),
      // Today's appointments
      // queryClient.ensureQueryData(QueryKeys.appointments.calendar(new Date().toISOString().split('T')[0]))
    ],)

    return {}
  },

  // Error handling
  errorComponent: ({ error, },) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center">
        <h2 className="mb-4 text-2xl font-bold text-destructive">
          Erro no Dashboard
        </h2>
        <p className="mb-4 text-muted-foreground">
          Não foi possível carregar os dados do dashboard.
        </p>
        <details className="mb-4 text-left">
          <summary className="cursor-pointer text-sm font-medium hover:text-foreground">
            Ver detalhes
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
            {error.message}
          </pre>
        </details>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  ),

  // Loading state
  pendingComponent: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent">
        </div>
        <p className="text-sm text-muted-foreground">
          Carregando dashboard...
        </p>
      </div>
    </div>
  ),

  // Meta information
  meta: () => [
    {
      title: 'Dashboard - Visão Geral | NeonPro',
    },
  ],
},)
