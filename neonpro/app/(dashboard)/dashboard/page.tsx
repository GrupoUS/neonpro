/**
 * NEONPROV1 - Dashboard Principal
 * Página principal com KPIs e visão geral do sistema
 */
import React from 'react';
import { Metadata } from 'next';
import { 
  AppLayout, 
  MetricCard, 
  NeonCard, 
  StatusBadge, 
  ActionButton 
} from '@/components/neonpro';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Eye
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Dashboard - NEONPROV1',
  description: 'Visão geral do sistema de gestão healthcare',
};

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Visão geral das atividades do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ActionButton
              variant="outline"
              icon={Eye}
            >
              Relatórios
            </ActionButton>
            <ActionButton
              variant="primary"
              icon={Plus}
            >
              Nova Consulta
            </ActionButton>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="healthcare-grid">
          <MetricCard
            title="Total de Pacientes"
            value="1,247"
            subtitle="pacientes ativos"
            trend="up"
            trendValue="+12%"
            trendLabel="vs. mês anterior"
            icon={Users}
            variant="default"
          />
          
          <MetricCard
            title="Consultas Hoje"
            value="24"
            subtitle="agendamentos"
            trend="up"
            trendValue="+3"
            trendLabel="vs. ontem"
            icon={Calendar}
            variant="success"
          />
          
          <MetricCard
            title="Receita Mensal"
            value="R$ 45.2k"
            subtitle="faturamento"
            trend="up"
            trendValue="+8%"
            trendLabel="vs. mês anterior"
            icon={DollarSign}
            variant="default"
          />
          
          <MetricCard
            title="Taxa de Ocupação"
            value="87%"
            subtitle="utilização"
            trend="neutral"
            trendValue="0%"
            trendLabel="estável"
            icon={Activity}
            variant="warning"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Próximas Consultas */}
          <NeonCard
            title="Próximas Consultas"
            description="Agendamentos para hoje"
            variant="default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-neon-primary rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Maria Silva
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      09:00 - Consulta Rotina
                    </p>
                  </div>
                </div>
                <StatusBadge status="scheduled" size="sm" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-healthcare-urgent rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      João Santos
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      10:30 - Retorno
                    </p>
                  </div>
                </div>
                <StatusBadge status="urgent" size="sm" />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-healthcare-critical rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Ana Costa
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      14:00 - Emergência
                    </p>
                  </div>
                </div>
                <StatusBadge status="critical" size="sm" pulse />
              </div>
            </div>
          </NeonCard>

          {/* Status do Sistema */}
          <NeonCard
            title="Status do Sistema"
            description="Indicadores de performance"
            variant="default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-healthcare-completed" />
                  <span className="text-sm font-medium">Sistema Online</span>
                </div>
                <StatusBadge status="normal" size="sm" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-healthcare-pending" />
                  <span className="text-sm font-medium">Backup Programado</span>
                </div>
                <StatusBadge status="pending" size="sm" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-healthcare-urgent" />
                  <span className="text-sm font-medium">Atualizações Disponíveis</span>
                </div>
                <StatusBadge status="urgent" size="sm" />
              </div>
              
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="font-medium text-healthcare-completed">99.9%</span>
                </div>
              </div>
            </div>
          </NeonCard>
        </div>

        {/* Quick Actions */}
        <NeonCard
          title="Ações Rápidas"
          description="Acesso rápido às funcionalidades principais"
        >
          <div className="flex flex-wrap gap-3">
            <ActionButton variant="primary" icon={Plus}>
              Nova Consulta
            </ActionButton>
            <ActionButton variant="secondary" icon={Users}>
              Cadastrar Paciente
            </ActionButton>
            <ActionButton variant="outline" icon={Calendar}>
              Ver Agenda
            </ActionButton>
            <ActionButton variant="outline" icon={DollarSign}>
              Relatório Financeiro
            </ActionButton>
          </div>
        </NeonCard>
      </div>
    </AppLayout>
  );
}