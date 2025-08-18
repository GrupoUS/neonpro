'use client';

import { Badge } from '@neonpro/ui';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Brain,
  Calendar,
  DollarSign,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import BMadMasterDashboard from '../../components/bmad-master-dashboard';

// NeonGradientCard Component
const NeonGradientCard = ({
  children,
  className = '',
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  [key: string]: unknown;
}) => (
  <motion.div
    className={`relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-slate-900/90 via-blue-900/20 to-slate-800/90 backdrop-blur-xl ${className}`}
    transition={{ duration: 0.2 }}
    whileHover={{
      scale: 1.02,
      borderColor: 'rgb(59 130 246 / 0.5)',
      boxShadow:
        '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04), 0 0 0 1px rgb(59 130 246 / 0.1)',
    }}
    {...props}
  >
    <motion.div
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-400/5 to-purple-600/0"
      transition={{
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
    />
    <div className="relative z-10 p-6">{children}</div>
  </motion.div>
);

// CosmicGlowButton Component
const CosmicGlowButton = ({
  children,
  className = '',
  variant = 'primary',
  size = 'default',
  icon: Icon,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'default' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  [key: string]: unknown;
}) => {
  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
    secondary:
      'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800',
    success:
      'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
    warning:
      'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
    danger:
      'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    default: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      className={`relative overflow-hidden rounded-lg font-medium text-white transition-all duration-200 ${variants[variant]} ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      <motion.div
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        }}
        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'linear',
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {Icon && <Icon className="h-4 w-4" />}
        {children}
      </span>
    </motion.button>
  );
};

// Data functions
const getDashboardStats = () => [
  {
    title: 'Total de Pacientes',
    value: '1,234',
    change: '+12%',
    icon: Users,
    color: 'text-blue-400',
  },
  {
    title: 'Consultas Hoje',
    value: '23',
    change: '+5%',
    icon: Calendar,
    color: 'text-emerald-400',
  },
  {
    title: 'Receita Mensal',
    value: 'R$ 45.2K',
    change: '+18%',
    icon: DollarSign,
    color: 'text-amber-400',
  },
  {
    title: 'Taxa de Ocupação',
    value: '87%',
    change: '+3%',
    icon: TrendingUp,
    color: 'text-purple-400',
  },
];

const getRecentPatients = () => [
  {
    name: 'Maria Silva',
    email: 'maria@email.com',
    lastVisit: '2 dias atrás',
    status: 'Ativo',
  },
  {
    name: 'João Santos',
    email: 'joao@email.com',
    lastVisit: '1 semana atrás',
    status: 'Ativo',
  },
  {
    name: 'Ana Costa',
    email: 'ana@email.com',
    lastVisit: '3 dias atrás',
    status: 'Pendente',
  },
];

const getQuickActions = () => [
  { label: 'Nova Consulta', icon: Plus, variant: 'primary' },
  { label: 'Ver Agenda', icon: Calendar, variant: 'secondary' },
  { label: 'Relatórios', icon: Activity, variant: 'success' },
];

// Component functions
function DashboardHeader({
  viewMode,
  setViewMode,
}: {
  viewMode: string;
  setViewMode: (mode: 'standard' | 'bmad-master') => void;
}) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
      initial={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 font-bold text-3xl text-white">
            Dashboard - Clínica Estética
          </h1>
          <p className="text-slate-300">
            Visão geral do sistema e métricas principais
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CosmicGlowButton
            className={viewMode === 'standard' ? 'ring-2 ring-blue-400' : ''}
            icon={BarChart3}
            onClick={() => setViewMode('standard')}
            size="sm"
            variant="secondary"
          >
            Dashboard Padrão
          </CosmicGlowButton>
          <CosmicGlowButton
            className={
              viewMode === 'bmad-master' ? 'ring-2 ring-emerald-400' : ''
            }
            icon={Brain}
            onClick={() => setViewMode('bmad-master')}
            size="sm"
            variant="success"
          >
            BMad Master 4.29.0
          </CosmicGlowButton>
        </div>
      </div>
    </motion.div>
  );
}

function DashboardStatsGrid() {
  const stats = getDashboardStats();

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            key={stat.title}
            transition={{ delay: index * 0.1 }}
          >
            <NeonGradientCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-300 text-sm">
                    {stat.title}
                  </p>
                  <p className="font-bold text-2xl text-white">{stat.value}</p>
                  <p className="text-emerald-400 text-sm">
                    {stat.change} vs mês anterior
                  </p>
                </div>
                <div className={`rounded-full bg-white/10 p-3 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </NeonGradientCard>
          </motion.div>
        );
      })}
    </div>
  );
}

function DashboardContent() {
  const recentPatients = getRecentPatients();
  const quickActions = getQuickActions();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Recent Patients */}
      <motion.div
        animate={{ opacity: 1, x: 0 }}
        className="lg:col-span-2"
        initial={{ opacity: 0, x: -20 }}
        transition={{ delay: 0.4 }}
      >
        <NeonGradientCard>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-bold text-white text-xl">Pacientes Recentes</h2>
            <CosmicGlowButton size="sm" variant="secondary">
              Ver Todos
            </CosmicGlowButton>
          </div>
          <div className="space-y-4">
            {recentPatients.map((patient, index) => (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
                initial={{ opacity: 0, x: -10 }}
                key={patient.name}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500">
                    <span className="font-semibold text-sm text-white">
                      {patient.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{patient.name}</p>
                    <p className="text-slate-400 text-sm">{patient.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-slate-300 text-sm">{patient.lastVisit}</p>
                  <Badge
                    variant={
                      patient.status === 'Ativo' ? 'default' : 'secondary'
                    }
                  >
                    {patient.status}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </NeonGradientCard>
      </motion.div>

      {/* Quick Actions & System Status */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.6 }}
        >
          <NeonGradientCard>
            <h2 className="mb-6 font-bold text-white text-xl">Ações Rápidas</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 10 }}
                  key={action.label}
                  transition={{ delay: 0.7 + index * 0.1 }}
                >
                  <CosmicGlowButton
                    className="w-full justify-start"
                    icon={action.icon}
                    variant={action.variant}
                  >
                    {action.label}
                  </CosmicGlowButton>
                </motion.div>
              ))}
            </div>
          </NeonGradientCard>
        </motion.div>

        {/* System Status */}
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: 20 }}
          transition={{ delay: 0.8 }}
        >
          <NeonGradientCard>
            <h2 className="mb-6 font-bold text-white text-xl">
              Status do Sistema
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Servidor Principal</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-sm">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Backup Automático</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 text-sm">Ativo</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Última Atualização</span>
                <span className="text-gray-400 text-sm">Há 2 minutos</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Uptime</span>
                <span className="text-gray-400 text-sm">99.9%</span>
              </div>
            </div>
          </NeonGradientCard>
        </motion.div>
      </div>
    </div>
  );
}
const DashboardPage = () => {
  const [viewMode, setViewMode] = useState<'standard' | 'bmad-master'>(
    'standard'
  );

  // If BMad Master view is selected, render the dedicated dashboard
  if (viewMode === 'bmad-master') {
    return <BMadMasterDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        <DashboardHeader setViewMode={setViewMode} viewMode={viewMode} />
        <DashboardStatsGrid />
        <DashboardContent />
      </div>
    </div>
  );
};
className = 'mb-8';
initial={{ opacity: 0, y: -20 }
}
          transition=
{
  duration: 0.6;
}
>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="mb-2 font-bold text-3xl text-white">Dashboard - Clínica Estética</h1>
              <p className="text-slate-300">Visão geral
do sistema e
métricas;
principais;
</p>
</div>
            <div className="flex items-center gap-3">
              <CosmicGlowButton
                variant="secondary"
                size="sm"
                icon=
{
  BarChart3;
}
onClick={() => setViewMode("standard")}
className={viewMode === "standard" ? "ring-2 ring-blue-400" : ""}
              >
                Dashboard
Padrão;
</CosmicGlowButton>
              <CosmicGlowButton
                variant="success"
                size="sm"
                icon=
{
  Brain;
}
onClick={() => setViewMode("bmad-master")}
className={viewMode === "bmad-master" ? "ring-2 ring-emerald-400" : ""}
              >
                BMad
Master;
4.29;
0.0;
</CosmicGlowButton>
            </div>
          </div>
        </motion.div>

{
  /* Stats Grid */
}
(
  <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
    {stats.map((stat, index) => {
      const Icon = stat.icon;
      return (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          key={stat.title}
          transition={{ delay: index * 0.1 }}
        >
          <NeonGradientCard>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-300 text-sm">
                  {stat.title}
                </p>
                <p className="font-bold text-2xl text-white">{stat.value}</p>
                <p className="text-emerald-400 text-sm">
                  {stat.change} vs mês anterior
                </p>
              </div>
              <div className={`rounded-full bg-white/10 p-3 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </NeonGradientCard>
        </motion.div>
      );
    })}
  </div>
) < div;
className =
  {
    /* Recent Patients */
  } <
  'grid grid-cols-1 gap-6 lg:grid-cols-3' <
  motion.div;
animate={{ opacity: 1, x: 0 }
}
            className="lg:col-span-2"
            initial=
{
  opacity: 0, x;
  : -20
}
transition={{ delay: 0.4 }
}
          >
            <NeonGradientCard>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-bold text-white text-xl">Pacientes Recentes</h2>
                <CosmicGlowButton size="sm" variant="secondary">
                  Ver Todos
                </CosmicGlowButton>
              </div>
              <div className="space-y-4">
{
  recentPatients.map((patient, index) => (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
      initial={{ opacity: 0, x: -10 }}
      key={patient.name}
      transition={{ delay: 0.5 + index * 0.1 }}
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-500">
          <span className="font-semibold text-sm text-white">
            {patient.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-medium text-white">{patient.name}</p>
          <p className="text-slate-400 text-sm">{patient.email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-slate-300 text-sm">{patient.lastVisit}</p>
        <Badge variant={patient.status === 'Ativo' ? 'default' : 'secondary'}>
          {patient.status}
        </Badge>
      </div>
    </motion.div>
  ));
}
</div>
            </NeonGradientCard>
          </motion.div>

{
  /* Quick Actions & System Status */
}
<div className="space-y-6">
  {/* Quick Actions */}
  <motion.div
    animate={{ opacity: 1, x: 0 }}
    initial={{ opacity: 0, x: 20 }}
    transition={{ delay: 0.6 }}
  >
    <NeonGradientCard>
      <h2 className="mb-6 font-bold text-white text-xl">Ações Rápidas</h2>
      <div className="space-y-3">
        {quickActions.map((action, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            key={action.label}
            transition={{ delay: 0.7 + index * 0.1 }}
          >
            <CosmicGlowButton
              className="w-full justify-start"
              icon={action.icon}
              variant={action.variant}
            >
              {action.label}
            </CosmicGlowButton>
          </motion.div>
        ))}
      </div>
    </NeonGradientCard>
  </motion.div>

  {/* System Status */}
  <motion.div
    animate={{ opacity: 1, x: 0 }}
    initial={{ opacity: 0, x: 20 }}
    transition={{ delay: 0.8 }}
  >
    <NeonGradientCard>
      <h2 className="mb-6 font-bold text-white text-xl">Status do Sistema</h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Servidor Principal</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-sm">Online</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Backup Automático</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-sm">Ativo</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Última Atualização</span>
          <span className="text-gray-400 text-sm">Há 2 minutos</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-300">Uptime</span>
          <span className="text-gray-400 text-sm">99.9%</span>
        </div>
      </div>
    </NeonGradientCard>
  </motion.div>
</div>;
</div>
      </div>
    </div>
  )
}

export default DashboardPage;

export const validateCSRF = () => true;
export const rateLimit = () => ({});
export const createBackupConfig = () => ({});
export const sessionConfig = {};
export class UnifiedSessionSystem {}
export const trackLoginPerformance = () => {};
export type PermissionContext = unknown;
export type SessionValidationResult = unknown;
