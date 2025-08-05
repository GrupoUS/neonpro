'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { NeonGradientCard } from '@/components/ui/NeonGradientCard';
import { CosmicGlowButton } from '@/components/ui/CosmicGlowButton';
import { formatCurrency } from '@/lib/utils';

// Dados mock para o dashboard
const dashboardData = {
  metrics: {
    totalPatients: 1247,
    todayAppointments: 23,
    monthRevenue: 127500,
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
  <NeonGradientCard gradient={gradient} className="group">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-gray-400 text-sm font-medium">{title}</p>        <motion.p 
          className="text-3xl font-bold text-white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {typeof value === 'number' && value > 1000 ? formatCurrency(value) : value}
        </motion.p>
        {change && (
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-success text-sm font-medium">+{change}%</span>
            <span className="text-gray-400 text-xs">este mês</span>
          </div>
        )}
      </div>
      <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm">
        <Icon className="h-8 w-8 text-accent" />
      </div>
    </div>
  </NeonGradientCard>
);

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 animate-background-position-spin">
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard NEONPROV1
          </h1>
          <p className="text-gray-400">
            Visão geral do seu sistema de saúde
          </p>
        </motion.div>

        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={Users}
            title="Total de Pacientes"
            value={dashboardData.metrics.totalPatients}
            change={12}
            gradient="primary"
          />
          <MetricCard
            icon={Calendar}
            title="Consultas Hoje"
            value={dashboardData.metrics.todayAppointments}
            change={8}
            gradient="secondary"
          />
          <MetricCard
            icon={DollarSign}
            title="Receita Mensal"
            value={dashboardData.metrics.monthRevenue}
            change={15}
            gradient="success"
          />
          <MetricCard
            icon={UserCheck}
            title="Consultas Concluídas"
            value={dashboardData.metrics.completedAppointments}
            change={22}
            gradient="accent"
          />
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Próximas consultas */}
          <div className="lg:col-span-2">
            <NeonGradientCard gradient="primary" className="h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-accent" />
                  Próximas Consultas
                </h2>
                <CosmicGlowButton variant="accent" size="sm">
                  Ver Todas
                </CosmicGlowButton>
              </div>
              <div className="space-y-4">
                {dashboardData.recentAppointments.map((appointment, index) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{appointment.patient}</p>
                        <p className="text-gray-400 text-sm">{appointment.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-accent font-semibold">{appointment.time}</p>
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
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-warning" />
                Alertas Importantes
              </h3>
              <div className="space-y-3">
                {dashboardData.alerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      alert.type === 'warning' 
                        ? 'bg-warning/10 border-warning/30 text-warning' 
                        : 'bg-danger/10 border-danger/30 text-danger'
                    }`}
                  >
                    <p className="text-sm font-medium">{alert.message}</p>
                  </motion.div>
                ))}
              </div>
            </NeonGradientCard>

            <NeonGradientCard gradient="accent">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-accent" />
                Ações Rápidas
              </h3>
              <div className="space-y-3">
                <CosmicGlowButton variant="primary" className="w-full">
                  Nova Consulta
                </CosmicGlowButton>
                <CosmicGlowButton variant="secondary" className="w-full">
                  Cadastrar Paciente
                </CosmicGlowButton>
                <CosmicGlowButton variant="success" className="w-full">
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
