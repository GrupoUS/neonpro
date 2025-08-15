/**
 * NEONPROV1 - Dashboard Principal
 * Página principal com KPIs e visão geral do sistema
 */

import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import {
  ActionButton,
  AppLayout,
  MetricCard,
  NeonCard,
  StatusBadge,
} from '@/components/neonpro';

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
            <h1 className="font-bold text-3xl text-slate-900 dark:text-slate-100">
              Dashboard
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Visão geral das atividades do sistema
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ActionButton icon={Eye} variant="outline">
              Relatórios
            </ActionButton>
            <ActionButton icon={Plus} variant="primary">
              Nova Consulta
            </ActionButton>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="healthcare-grid">
          <MetricCard
            icon={Users}
            subtitle="pacientes ativos"
            title="Total de Pacientes"
            trend="up"
            trendLabel="vs. mês anterior"
            trendValue="+12%"
            value="1,247"
            variant="default"
          />

          <MetricCard
            icon={Calendar}
            subtitle="agendamentos"
            title="Consultas Hoje"
            trend="up"
            trendLabel="vs. ontem"
            trendValue="+3"
            value="24"
            variant="success"
          />

          <MetricCard
            icon={DollarSign}
            subtitle="faturamento"
            title="Receita Mensal"
            trend="up"
            trendLabel="vs. mês anterior"
            trendValue="+8%"
            value="R$ 45.2k"
            variant="default"
          />

          <MetricCard
            icon={Activity}
            subtitle="utilização"
            title="Taxa de Ocupação"
            trend="neutral"
            trendLabel="estável"
            trendValue="0%"
            value="87%"
            variant="warning"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Próximas Consultas */}
          <NeonCard
            description="Agendamentos para hoje"
            title="Próximas Consultas"
            variant="default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-primary">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Maria Silva
                    </p>
                    <p className="text-slate-600 text-sm dark:text-slate-400">
                      09:00 - Consulta Rotina
                    </p>
                  </div>
                </div>
                <StatusBadge size="sm" status="scheduled" />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-healthcare-urgent">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      João Santos
                    </p>
                    <p className="text-slate-600 text-sm dark:text-slate-400">
                      10:30 - Retorno
                    </p>
                  </div>
                </div>
                <StatusBadge size="sm" status="urgent" />
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-healthcare-critical">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Ana Costa
                    </p>
                    <p className="text-slate-600 text-sm dark:text-slate-400">
                      14:00 - Emergência
                    </p>
                  </div>
                </div>
                <StatusBadge pulse size="sm" status="critical" />
              </div>
            </div>
          </NeonCard>

          {/* Status do Sistema */}
          <NeonCard
            description="Indicadores de performance"
            title="Status do Sistema"
            variant="default"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-healthcare-completed" />
                  <span className="font-medium text-sm">Sistema Online</span>
                </div>
                <StatusBadge size="sm" status="normal" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-healthcare-pending" />
                  <span className="font-medium text-sm">Backup Programado</span>
                </div>
                <StatusBadge size="sm" status="pending" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-healthcare-urgent" />
                  <span className="font-medium text-sm">
                    Atualizações Disponíveis
                  </span>
                </div>
                <StatusBadge size="sm" status="urgent" />
              </div>

              <div className="border-slate-200 border-t pt-4 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Uptime
                  </span>
                  <span className="font-medium text-healthcare-completed">
                    99.9%
                  </span>
                </div>
              </div>
            </div>
          </NeonCard>
        </div>

        {/* Quick Actions */}
        <NeonCard
          description="Acesso rápido às funcionalidades principais"
          title="Ações Rápidas"
        >
          <div className="flex flex-wrap gap-3">
            <ActionButton icon={Plus} variant="primary">
              Nova Consulta
            </ActionButton>
            <ActionButton icon={Users} variant="secondary">
              Cadastrar Paciente
            </ActionButton>
            <ActionButton icon={Calendar} variant="outline">
              Ver Agenda
            </ActionButton>
            <ActionButton icon={DollarSign} variant="outline">
              Relatório Financeiro
            </ActionButton>
          </div>
        </NeonCard>
      </div>
    </AppLayout>
  );
}
