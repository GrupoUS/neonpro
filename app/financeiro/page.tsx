/**
 * NEONPROV1 - Módulo Financeiro
 * Gestão financeira e faturamento
 */
import React from 'react';
import { Metadata } from 'next';
import { 
  AppLayout, 
  NeonCard, 
  MetricCard,
  StatusBadge, 
  ActionButton 
} from '@/components/neonpro';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Download,
  Filter,
  CreditCard,
  Receipt,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Financeiro - NEONPROV1',
  description: 'Gestão financeira e faturamento',
};

// Mock data para demonstração
const transactions = [
  {
    id: 1,
    patient: 'Maria Silva',
    description: 'Consulta Cardiológica',
    amount: 250.00,
    date: '2024-01-15',
    status: 'completed' as const,
    method: 'Cartão de Crédito'
  },
  {
    id: 2,
    patient: 'João Santos',
    description: 'Exame de Sangue',
    amount: 120.00,
    date: '2024-01-14',
    status: 'pending' as const,
    method: 'PIX'
  },
  {
    id: 3,
    patient: 'Ana Costa',
    description: 'Consulta de Emergência',
    amount: 380.00,
    date: '2024-01-13',
    status: 'urgent' as const,
    method: 'Dinheiro'
  },
  {
    id: 4,
    patient: 'Pedro Lima',
    description: 'Retorno Consulta',
    amount: 150.00,
    date: '2024-01-12',
    status: 'completed' as const,
    method: 'Cartão de Débito'
  }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export default function FinanceiroPage() {
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);
  const pendingRevenue = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              Financeiro
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Gestão financeira e faturamento
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <ActionButton
              variant="outline"
              icon={Download}
            >
              Exportar
            </ActionButton>
            <ActionButton
              variant="outline"
              icon={Filter}
            >
              Filtros
            </ActionButton>
            <ActionButton
              variant="primary"
              icon={Plus}
            >
              Nova Transação
            </ActionButton>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="healthcare-grid">
          <MetricCard
            title="Receita Total"
            value={formatCurrency(totalRevenue)}
            subtitle="este mês"
            trend="up"
            trendValue="+15%"
            trendLabel="vs. mês anterior"
            icon={DollarSign}
            variant="success"
          />
          
          <MetricCard
            title="Receita Confirmada"
            value={formatCurrency(completedRevenue)}
            subtitle="recebido"
            trend="up"
            trendValue="+8%"
            trendLabel="vs. mês anterior"
            icon={TrendingUp}
            variant="default"
          />
          
          <MetricCard
            title="Pendente"
            value={formatCurrency(pendingRevenue)}
            subtitle="a receber"
            trend="down"
            trendValue="-5%"
            trendLabel="vs. mês anterior"
            icon={TrendingDown}
            variant="warning"
          />
          
          <MetricCard
            title="Taxa de Conversão"
            value="94%"
            subtitle="recebimentos"
            trend="up"
            trendValue="+2%"
            trendLabel="vs. mês anterior"
            icon={Receipt}
            variant="success"
          />
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Transactions List */}
          <div className="xl:col-span-2">
            <NeonCard
              title="Transações Recentes"
              description="Últimas movimentações financeiras"
            >
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-neon-primary rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      
                      {/* Transaction Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">
                            {transaction.patient}
                          </h3>
                          <StatusBadge 
                            status={transaction.status} 
                            size="sm"
                          />
                        </div>
                        
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {transaction.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{transaction.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            <span>{transaction.method}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Amount and Actions */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-neon-primary mb-2">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="flex items-center gap-2">
                        <ActionButton variant="ghost" size="sm">
                          Ver
                        </ActionButton>
                        {transaction.status === 'pending' && (
                          <ActionButton variant="outline" size="sm">
                            Confirmar
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {transactions.length === 0 && (
                <div className="text-center py-12">
                  <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    Nenhuma transação encontrada
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    As transações aparecerão aqui quando houver movimentação
                  </p>
                </div>
              )}
            </NeonCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <NeonCard
              title="Métodos de Pagamento"
              variant="default"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-neon-primary" />
                    <span className="text-sm font-medium">Cartão</span>
                  </div>
                  <span className="text-sm font-bold">65%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-healthcare-success rounded-full" />
                    <span className="text-sm font-medium">PIX</span>
                  </div>
                  <span className="text-sm font-bold">25%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-400 rounded-full" />
                    <span className="text-sm font-medium">Dinheiro</span>
                  </div>
                  <span className="text-sm font-bold">10%</span>
                </div>
              </div>
            </NeonCard>

            {/* Alerts */}
            <NeonCard
              title="Alertas Financeiros"
              variant="status"
              priority="urgent"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-healthcare-urgent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Pagamentos Atrasados
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      3 transações pendentes há mais de 30 dias
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-healthcare-pending mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      Reconciliação Bancária
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Pendente para esta semana
                    </p>
                  </div>
                </div>
              </div>
            </NeonCard>

            {/* Quick Actions */}
            <NeonCard title="Ações Rápidas">
              <div className="space-y-3">
                <ActionButton 
                  variant="primary" 
                  fullWidth 
                  icon={Plus}
                >
                  Nova Transação
                </ActionButton>
                <ActionButton 
                  variant="outline" 
                  fullWidth 
                  icon={Receipt}
                >
                  Gerar Relatório
                </ActionButton>
                <ActionButton 
                  variant="ghost" 
                  fullWidth 
                  icon={Download}
                >
                  Exportar Dados
                </ActionButton>
              </div>
            </NeonCard>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}