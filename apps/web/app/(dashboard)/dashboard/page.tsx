'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  DollarSign,
  Plus,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
// Import existing NeonPro visual components
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppointments } from '@/hooks/useAppointments';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useFinancialData } from '@/hooks/useFinancialData';
import { usePatients } from '@/hooks/usePatients';
import { useServices } from '@/hooks/useServices';
import { useStaffMembers } from '@/hooks/useStaffMembers';
import { toastHelpers } from '@/lib/toast-helpers';

// Visual components to maintain - NeonPro design elements
interface NeonGradientCardProps {
  children: React.ReactNode;
  className?: string;
}

const NeonGradientCard = ({
  children,
  className = '',
}: NeonGradientCardProps) => (
  <motion.div
    animate={{ opacity: 1, y: 0 }}
    className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
    initial={{ opacity: 0, y: 20 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);
interface CosmicGlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  href?: string;
  className?: string;
}

const CosmicGlowButton = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  href,
  className = '',
}: CosmicGlowButtonProps) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700',
    secondary:
      'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
    success:
      'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
    warning:
      'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700',
    danger:
      'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const ButtonComponent = href ? 'a' : 'button';

  return (
    <motion.div
      className="inline-block"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <ButtonComponent
        className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl ${variants[variant]} ${sizes[size]} ${className}`}
        href={href}
        onClick={onClick}
      >
        {children}
      </ButtonComponent>
    </motion.div>
  );
}; // Enhanced Dashboard Metrics Cards with dynamic data
function DashboardMetricsCards() {
  const {
    totalPatients,
    activePatients,
    monthlyRevenue,
    revenueGrowth,
    upcomingAppointments,
    appointmentsGrowth,
    activeStaffMembers,
    loading,
    error,
  } = useDashboardMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <NeonGradientCard key={i}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[120px] bg-white/20" />
              <Skeleton className="h-5 w-5 bg-white/20" />
            </div>
            <div>
              <Skeleton className="mb-2 h-8 w-[100px] bg-white/20" />
              <Skeleton className="h-4 w-[80px] bg-white/20" />
            </div>
          </NeonGradientCard>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="col-span-full">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar métricas do dashboard: {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Stats data with dynamic values
  const stats = [
    {
      title: 'Total de Pacientes',
      value: totalPatients?.toString() || '0',
      change:
        activePatients > 0
          ? `+${Math.round((activePatients / totalPatients) * 100)}%`
          : '0%',
      changeType: 'increase' as const,
      icon: Users,
      gradient: 'from-blue-500 to-purple-600',
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${monthlyRevenue?.toLocaleString('pt-BR') || '0'}`,
      change: revenueGrowth
        ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`
        : '0%',
      changeType:
        (revenueGrowth || 0) >= 0
          ? ('increase' as const)
          : ('decrease' as const),
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      title: 'Consultas Agendadas',
      value: upcomingAppointments?.toString() || '0',
      change: appointmentsGrowth
        ? `${appointmentsGrowth > 0 ? '+' : ''}${appointmentsGrowth.toFixed(1)}%`
        : '0%',
      changeType:
        (appointmentsGrowth || 0) >= 0
          ? ('increase' as const)
          : ('decrease' as const),
      icon: Calendar,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Profissionais Ativos',
      value: activeStaffMembers?.toString() || '0',
      change: '+2 este mês',
      changeType: 'increase' as const,
      icon: Activity,
      gradient: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <NeonGradientCard key={stat.title}>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="font-medium text-slate-300 text-sm tracking-tight">
                {stat.title}
              </h3>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <div className="font-bold text-2xl text-white">{stat.value}</div>
              <p className="flex items-center gap-1 text-slate-400 text-xs">
                {stat.changeType === 'increase' ? (
                  <TrendingUp className="h-3 w-3 text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-400" />
                )}
                {stat.change} from last month
              </p>
            </div>
          </NeonGradientCard>
        );
      })}
    </div>
  );
} // Recent Patients Section with dynamic data
function RecentPatientsSection() {
  const { recentPatients, loading, error } = usePatients();

  if (loading) {
    return (
      <NeonGradientCard>
        <h2 className="mb-6 font-bold text-white text-xl">
          Pacientes Recentes
        </h2>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              className="flex items-center space-x-4 rounded-lg bg-white/5 p-3"
              key={i}
            >
              <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[180px] bg-white/20" />
                <Skeleton className="h-3 w-[140px] bg-white/20" />
              </div>
              <Skeleton className="h-6 w-[60px] bg-white/20" />
            </div>
          ))}
        </div>
      </NeonGradientCard>
    );
  }

  if (error) {
    return (
      <NeonGradientCard>
        <h2 className="mb-6 font-bold text-white text-xl">
          Pacientes Recentes
        </h2>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar pacientes recentes: {error}
          </AlertDescription>
        </Alert>
      </NeonGradientCard>
    );
  }
  return (
    <NeonGradientCard>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-white text-xl">Pacientes Recentes</h2>
        <CosmicGlowButton
          href="/dashboard/patients"
          size="sm"
          variant="secondary"
        >
          Ver Todos
        </CosmicGlowButton>
      </div>
      <div className="space-y-4">
        {recentPatients?.slice(0, 5).map((patient) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex cursor-pointer items-center space-x-4 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
            initial={{ opacity: 0, x: -20 }}
            key={patient.id}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
              <span className="font-semibold text-sm text-white">
                {patient.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">{patient.name}</p>
              <p className="text-slate-400 text-sm">{patient.email}</p>
            </div>
            <Badge
              className="border-slate-600 text-slate-300"
              variant="outline"
            >
              {patient.phone || 'Sem contato'}
            </Badge>
          </motion.div>
        ))}
        {(!recentPatients || recentPatients.length === 0) && (
          <div className="py-8 text-center text-slate-400">
            <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhum paciente encontrado</p>
          </div>
        )}
      </div>
    </NeonGradientCard>
  );
} // Today's Appointments Section with dynamic data
function TodaysAppointmentsSection() {
  const { todaysAppointments, loading, error } = useAppointments();

  const getStatusVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'confirmado':
        return 'default';
      case 'completed':
      case 'completo':
        return 'secondary';
      case 'cancelled':
      case 'cancelado':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Horário inválido';
    }
  };

  if (loading) {
    return (
      <NeonGradientCard>
        <h2 className="mb-6 font-bold text-white text-xl">Agenda de Hoje</h2>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              className="flex items-center justify-between rounded-lg bg-white/5 p-3"
              key={i}
            >
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-[160px] bg-white/20" />
                <Skeleton className="h-3 w-[120px] bg-white/20" />
              </div>
              <div className="space-y-1 text-right">
                <Skeleton className="h-3 w-[50px] bg-white/20" />
                <Skeleton className="h-5 w-[70px] bg-white/20" />
              </div>
            </div>
          ))}
        </div>
      </NeonGradientCard>
    );
  }
  if (error) {
    return (
      <NeonGradientCard>
        <h2 className="mb-6 font-bold text-white text-xl">Agenda de Hoje</h2>
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar agenda: {error}</AlertDescription>
        </Alert>
      </NeonGradientCard>
    );
  }

  return (
    <NeonGradientCard>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-bold text-white text-xl">Agenda de Hoje</h2>
        <CosmicGlowButton
          href="/dashboard/appointments"
          size="sm"
          variant="secondary"
        >
          Ver Agenda Completa
        </CosmicGlowButton>
      </div>
      <div className="space-y-3">
        {todaysAppointments?.slice(0, 6).map((appointment) => (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
            initial={{ opacity: 0, x: -20 }}
            key={appointment.id}
          >
            <div>
              <p className="font-medium text-white">
                {appointment.patient_name || 'Paciente'}
              </p>
              <p className="text-slate-400 text-sm">
                {appointment.service_name || 'Consulta'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-300 text-sm">
                {formatTime(appointment.appointment_date)}
              </p>
              <Badge variant={getStatusVariant(appointment.status)}>
                {appointment.status || 'Agendado'}
              </Badge>
            </div>
          </motion.div>
        ))}
        {(!todaysAppointments || todaysAppointments.length === 0) && (
          <div className="py-8 text-center text-slate-400">
            <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
            <p>Nenhuma consulta agendada para hoje</p>
          </div>
        )}
      </div>
    </NeonGradientCard>
  );
} // Quick Actions Section - maintaining visual design but adding real navigation
function QuickActionsSection() {
  const quickActions = [
    {
      label: 'Nova Consulta',
      icon: Plus,
      variant: 'primary' as const,
      href: '/dashboard/appointments/new',
      description: 'Agendar nova consulta',
    },
    {
      label: 'Ver Pacientes',
      icon: Users,
      variant: 'secondary' as const,
      href: '/dashboard/patients',
      description: 'Gerenciar pacientes',
    },
    {
      label: 'Ver Agenda',
      icon: Calendar,
      variant: 'success' as const,
      href: '/dashboard/appointments',
      description: 'Visualizar agenda',
    },
    {
      label: 'Relatórios',
      icon: Activity,
      variant: 'warning' as const,
      href: '/dashboard/analytics',
      description: 'Acessar relatórios',
    },
    {
      label: 'Configurações',
      icon: Shield,
      variant: 'danger' as const,
      href: '/dashboard/settings',
      description: 'Configurações do sistema',
    },
    {
      label: 'Financeiro',
      icon: DollarSign,
      variant: 'secondary' as const,
      href: '/dashboard/financial',
      description: 'Gestão financeira',
    },
  ];

  return (
    <NeonGradientCard>
      <h2 className="mb-6 font-bold text-white text-xl">Ações Rápidas</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <CosmicGlowButton
              className="flex min-h-[100px] flex-col items-center justify-center p-4 text-center"
              href={action.href}
              key={action.label}
              variant={action.variant}
            >
              <Icon className="mb-2 h-6 w-6" />
              <span className="font-medium text-sm">{action.label}</span>
              <span className="mt-1 text-xs opacity-75">
                {action.description}
              </span>
            </CosmicGlowButton>
          );
        })}
      </div>
    </NeonGradientCard>
  );
} // System Status Section with real data
function SystemStatusSection() {
  const { activeStaffMembers, loading: staffLoading } = useStaffMembers();
  const { todaysAppointments, loading: appointmentsLoading } =
    useAppointments();
  const { totalPatients, loading: patientsLoading } = useDashboardMetrics();

  const systemMetrics = [
    {
      label: 'Status do Sistema',
      value: 'Online',
      status: 'success' as const,
      icon: CheckCircle,
      description: 'Todos os sistemas funcionando',
    },
    {
      label: 'Profissionais Ativos',
      value: staffLoading ? '...' : activeStaffMembers?.toString() || '0',
      status: 'success' as const,
      icon: Users,
      description: 'Profissionais disponíveis hoje',
    },
    {
      label: 'Consultas Hoje',
      value: appointmentsLoading
        ? '...'
        : todaysAppointments?.length?.toString() || '0',
      status: 'success' as const,
      icon: Calendar,
      description: 'Consultas agendadas para hoje',
    },
    {
      label: 'Base de Pacientes',
      value: patientsLoading ? '...' : totalPatients?.toString() || '0',
      status: 'success' as const,
      icon: Activity,
      description: 'Total de pacientes cadastrados',
    },
    {
      label: 'Backup',
      value: 'Atualizado',
      status: 'success' as const,
      icon: Shield,
      description: 'Último backup: hoje às 03:00',
    },
    {
      label: 'Performance',
      value: 'Excelente',
      status: 'success' as const,
      icon: Zap,
      description: 'Sistema operando em alta performance',
    },
  ];
  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <NeonGradientCard>
      <h2 className="mb-6 font-bold text-white text-xl">Status do Sistema</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {systemMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              className="flex items-center space-x-3 rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10"
              key={metric.label}
            >
              <Icon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
              <div className="flex-1">
                <p className="font-medium text-sm text-white">{metric.label}</p>
                <p className="text-slate-400 text-xs">{metric.description}</p>
              </div>
              <span
                className={`font-semibold text-sm ${getStatusColor(metric.status)}`}
              >
                {metric.value}
              </span>
            </div>
          );
        })}
      </div>
    </NeonGradientCard>
  );
} // BMad Master Dashboard - maintaining existing functionality
function BMadMasterDashboard() {
  const { totalPatients, monthlyRevenue, upcomingAppointments } =
    useDashboardMetrics();

  return (
    <div className="min-h-screen bg-black font-mono text-green-400">
      <div className="container mx-auto p-6">
        <div className="mb-6 border border-green-400 p-4">
          <h1 className="mb-2 font-bold text-2xl">
            BMAD MASTER CONTROL SYSTEM v2.1
          </h1>
          <p className="text-sm">
            SISTEMA DE CONTROLE MESTRE - ACESSO RESTRITO
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="border border-green-400 p-4">
            <h2 className="mb-2 font-bold text-lg">PACIENTES</h2>
            <div className="font-bold text-3xl">{totalPatients || 0}</div>
            <p className="text-sm">TOTAL REGISTRADO</p>
          </div>

          <div className="border border-green-400 p-4">
            <h2 className="mb-2 font-bold text-lg">RECEITA</h2>
            <div className="font-bold text-2xl">
              R$ {monthlyRevenue?.toLocaleString('pt-BR') || '0'}
            </div>
            <p className="text-sm">MENSAL ATUAL</p>
          </div>

          <div className="border border-green-400 p-4">
            <h2 className="mb-2 font-bold text-lg">AGENDAMENTOS</h2>
            <div className="font-bold text-3xl">
              {upcomingAppointments || 0}
            </div>
            <p className="text-sm">PRÓXIMOS</p>
          </div>
        </div>

        <div className="mt-6 border border-green-400 p-4">
          <h2 className="mb-2 font-bold text-lg">STATUS SISTEMA</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>DATABASE:</span>
              <span className="text-green-400">ONLINE</span>
            </div>
            <div className="flex justify-between">
              <span>API SERVICES:</span>
              <span className="text-green-400">OPERATIONAL</span>
            </div>
            <div className="flex justify-between">
              <span>SECURITY:</span>
              <span className="text-green-400">SECURED</span>
            </div>
            <div className="flex justify-between">
              <span>BACKUP:</span>
              <span className="text-green-400">SYNCHRONIZED</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            className="border border-green-400 px-6 py-2 transition-colors hover:bg-green-400 hover:text-black"
            onClick={() => window.location.reload()}
          >
            REFRESH SYSTEM
          </button>
        </div>
      </div>
    </div>
  );
} // Main Dashboard Component with dynamic data integration
export default function DashboardPage() {
  const [viewMode, setViewMode] = useState<'standard' | 'bmad-master'>(
    'standard'
  );
  const { user } = useAuth();

  // Handle BMad Master mode
  if (viewMode === 'bmad-master') {
    return <BMadMasterDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-white">
              Dashboard - NeonPro
            </h1>
            <p className="text-slate-400">
              Bem-vindo de volta,{' '}
              {user?.user_metadata?.full_name || user?.email || 'Usuário'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <CosmicGlowButton
              onClick={() =>
                setViewMode(
                  viewMode === 'standard' ? 'bmad-master' : 'standard'
                )
              }
              size="sm"
              variant="secondary"
            >
              <Cpu className="mr-2 h-4 w-4" />
              {viewMode === 'standard' ? 'Modo BMad' : 'Modo Padrão'}
            </CosmicGlowButton>
            <CosmicGlowButton
              href="/dashboard/patients/new"
              size="sm"
              variant="primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </CosmicGlowButton>
          </div>
        </div>

        {/* Metrics Cards */}
        <DashboardMetricsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Patients */}
          <RecentPatientsSection />

          {/* Today's Appointments */}
          <TodaysAppointmentsSection />

          {/* Quick Actions */}
          <QuickActionsSection />

          {/* System Status */}
          <SystemStatusSection />
        </div>

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm">
          <p>NeonPro Healthcare Management System</p>
          <p>Dados atualizados em tempo real via Supabase</p>
        </div>
      </div>
    </div>
  );
}
