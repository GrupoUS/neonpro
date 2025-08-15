'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { formatCurrency } from '@/lib/utils';

// Dados mock para o dashboard
const dashboardData = {
  metrics: {
    totalPatients: 1247,
    todayAppointments: 23,
    monthRevenue: 127_500,
    completedAppointments: 18,
  },
  recentAppointments: [
    { id: 1, patient: 'Maria Silva', time: '09:00', type: 'Consulta' },
    { id: 2, patient: 'João Santos', time: '10:30', type: 'Retorno' },
    { id: 3, patient: 'Ana Costa', time: '14:00', type: 'Exame' },
  ],
  alerts: [
    { id: 1, message: '3 consultas pendentes de confirmação', type: 'warning' },
    { id: 2, message: '2 pacientes em atraso', type: 'danger' },
  ],
};

const MetricCard = ({ icon: Icon, title, value, change, gradient }) => (
  <NeonGradientCard className="group" gradient={gradient}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="font-medium text-gray-400 text-sm">{title}</p>{' '}
        <motion.p
          animate={{ scale: 1 }}
          className="font-bold text-3xl text-white"
          initial={{ scale: 0.8 }}
          transition={{ delay: 0.2 }}
        >
          {typeof value === 'number' && value > 1000
            ? formatCurrency(value)
            : value}
        </motion.p>
        {change && (
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="font-medium text-sm text-success">+{change}%</span>
            <span className="text-gray-400 text-xs">este mês</span>
          </div>
        )}
      </div>
      <div className="rounded-lg bg-white/10 p-3 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    </div>
  </NeonGradientCard>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen animate-background-position-spin bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
        >
          <h1 className="mb-2 font-bold text-4xl text-white">
            Dashboard NEONPROV1
          </h1>
          <p className="text-gray-400">Visão geral do seu sistema de saúde</p>
        </motion.div>

        {/* Métricas principais */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            change={12}
            gradient="primary"
            icon={Users}
            title="Total de Pacientes"
            value={dashboardData.metrics.totalPatients}
          />
          <MetricCard
            change={8}
            gradient="secondary"
            icon={Calendar}
            title="Consultas Hoje"
            value={dashboardData.metrics.todayAppointments}
          />
          <MetricCard
            change={15}
            gradient="success"
            icon={DollarSign}
            title="Receita Mensal"
            value={dashboardData.metrics.monthRevenue}
          />
          <MetricCard
            change={22}
            gradient="accent"
            icon={UserCheck}
            title="Consultas Concluídas"
            value={dashboardData.metrics.completedAppointments}
          />
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Próximas consultas */}
          <div className="lg:col-span-2">
            <NeonGradientCard className="h-full" gradient="primary">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="flex items-center font-semibold text-white text-xl">
                  <Clock className="mr-2 h-5 w-5 text-accent" />
                  Próximas Consultas
                </h2>
                <CosmicGlowButton size="sm" variant="accent">
                  Ver Todas
                </CosmicGlowButton>
              </div>
              <div className="space-y-4">
                {dashboardData.recentAppointments.map((appointment, index) => (
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:bg-white/10"
                    initial={{ opacity: 0, x: -20 }}
                    key={appointment.id}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {appointment.patient}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {appointment.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">
                        {appointment.time}
                      </p>
                      <p className="text-gray-400 text-sm">Hoje</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeonGradientCard>
          </div>

          {/* Alertas e notificações */}
          <div className="space-y-6">
            <NeonGradientCard gradient="warning">
              <h3 className="mb-4 flex items-center font-semibold text-lg text-white">
                <AlertCircle className="mr-2 h-5 w-5 text-warning" />
                Alertas Importantes
              </h3>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-lg border p-3 ${
                      alert.type === 'warning'
                        ? 'border-warning/30 bg-warning/10 text-warning'
                        : 'border-danger/30 bg-danger/10 text-danger'
                    }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    key={alert.id}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="font-medium text-sm">{alert.message}</p>
                  </motion.div>
                ))}
              </div>
            </NeonGradientCard>

            <NeonGradientCard gradient="accent">
              <h3 className="mb-4 flex items-center font-semibold text-lg text-white">
                <Activity className="mr-2 h-5 w-5 text-accent" />
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <CosmicGlowButton className="w-full" variant="primary">
                  Nova Consulta
                </CosmicGlowButton>
                <CosmicGlowButton className="w-full" variant="secondary">
                  Cadastrar Paciente
                </CosmicGlowButton>
                <CosmicGlowButton className="w-full" variant="success">
                  Relatório Financeiro
                </CosmicGlowButton>
              </div>
            </NeonGradientCard>
          </div>
        </div>
      </div>
    </div>
  );
}
