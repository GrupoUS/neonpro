/**
 * NEONPROV1 - Módulo Financeiro
 * Gestão financeira completa para clínica estética
 */
import React from 'react';
import { Metadata } from 'next';
import { 
  AppLayout, 
  NeonGradientCard, 
  CosmicGlowButton,
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
  AlertCircle,
  BarChart3,
  Users,
  Clock,
  Target,
  Search,
  Eye,
  Edit,
  CheckCircle,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Financeiro - NEONPROV1',
  description: 'Gestão financeira completa para clínica estética',
};

// Mock data para clínica estética brasileira
const procedures = [
  {
    id: 1,
    name: 'Harmonização Facial',
    price: 2500.00,
    count: 45,
    revenue: 112500.00,
    profitMargin: 68,
    trend: 'up',
    trendValue: '+15%'
  },
  {
    id: 2,
    name: 'Botox',
    price: 800.00,
    count: 120,
    revenue: 96000.00,
    profitMargin: 75,
    trend: 'up',
    trendValue: '+8%'
  },
  {
    id: 3,
    name: 'Preenchimento Labial',
    price: 1200.00,
    count: 80,
    revenue: 96000.00,
    profitMargin: 65,
    trend: 'up',
    trendValue: '+22%'
  },
  {
    id: 4,
    name: 'Limpeza de Pele',
    price: 150.00,
    count: 200,
    revenue: 30000.00,
    profitMargin: 45,
    trend: 'down',
    trendValue: '-5%'
  },
  {
    id: 5,
    name: 'Microagulhamento',
    price: 300.00,
    count: 90,
    revenue: 27000.00,
    profitMargin: 60,
    trend: 'up',
    trendValue: '+12%'
  }
];

const transactions = [
  {
    id: 1,
    patient: 'Maria Silva',
    procedure: 'Harmonização Facial',
    amount: 2500.00,
    date: '2024-01-15',
    status: 'completed' as const,
    method: 'Cartão de Crédito',
    installments: '3x'
  },
  {
    id: 2,
    patient: 'Ana Costa',
    procedure: 'Botox + Preenchimento',
    amount: 2000.00,
    date: '2024-01-14',
    status: 'pending' as const,
    method: 'PIX',
    installments: 'À vista'
  },
  {
    id: 3,
    patient: 'Carla Santos',
    procedure: 'Limpeza de Pele',
    amount: 150.00,
    date: '2024-01-13',
    status: 'urgent' as const,
    method: 'Dinheiro',
    installments: 'À vista'
  },
  {
    id: 4,
    patient: 'Juliana Lima',
    procedure: 'Microagulhamento',
    amount: 300.00,
    date: '2024-01-12',
    status: 'completed' as const,
    method: 'Cartão de Débito',
    installments: 'À vista'
  },
  {
    id: 5,
    patient: 'Patricia Oliveira',
    procedure: 'Harmonização Facial',
    amount: 2500.00,
    date: '2024-01-11',
    status: 'scheduled' as const,
    method: 'Cartão de Crédito',
    installments: '5x'
  }
];

const monthlyData = [
  { month: 'Jan', revenue: 45000, procedures: 85, avgTicket: 529 },
  { month: 'Fev', revenue: 52000, procedures: 92, avgTicket: 565 },
  { month: 'Mar', revenue: 48000, procedures: 88, avgTicket: 545 },
  { month: 'Abr', revenue: 58000, procedures: 105, avgTicket: 552 },
  { month: 'Mai', revenue: 65000, procedures: 118, avgTicket: 551 },
  { month: 'Jun', revenue: 72000, procedures: 135, avgTicket: 533 }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`;
};

export default function FinanceiroPage() {
  const totalRevenue = procedures.reduce((sum, p) => sum + p.revenue, 0);
  const totalProcedures = procedures.reduce((sum, p) => sum + p.count, 0);
  const avgTicket = totalRevenue / totalProcedures;
  const avgProfitMargin = procedures.reduce((sum, p) => sum + p.profitMargin, 0) / procedures.length;
  
  const pendingAmount = transactions
    .filter(t => t.status === 'pending' || t.status === 'urgent')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Financeiro
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Gestão financeira completa da clínica estética
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <CosmicGlowButton
              variant="outline"
              icon={Download}
              glowEffect={false}
            >
              Relatório
            </CosmicGlowButton>
            <CosmicGlowButton
              variant="secondary"
              icon={Filter}
            >
              Filtros
            </CosmicGlowButton>
            <CosmicGlowButton
              variant="primary"
              icon={Plus}
              cosmicAnimation={true}
            >
              Nova Transação
            </CosmicGlowButton>
          </div>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NeonGradientCard
            variant="primary"
            glowEffect={true}
            backgroundAnimation={false}
            className="hover:scale-105 transition-transform duration-300 motion-reduce:hover:scale-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Receita Total
                </p>
                <p className="text-3xl font-bold text-neon-primary mb-2">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-neon-success" />
                  <span className="text-neon-success font-medium">+18%</span>
                  <span className="text-slate-500">vs. mês anterior</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-neon-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-neon-primary" />
              </div>
            </div>
          </NeonGradientCard>

          <NeonGradientCard
            variant="success"
            glowEffect={true}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Procedimentos
                </p>
                <p className="text-3xl font-bold text-neon-success mb-2">
                  {totalProcedures.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-neon-success" />
                  <span className="text-neon-success font-medium">+12%</span>
                  <span className="text-slate-500">este mês</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-neon-success/10 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-neon-success" />
              </div>
            </div>
          </NeonGradientCard>

          <NeonGradientCard
            variant="cosmic"
            glowEffect={true}
            backgroundAnimation={true}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Ticket Médio
                </p>
                <p className="text-3xl font-bold text-neon-primary mb-2">
                  {formatCurrency(avgTicket)}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-neon-success" />
                  <span className="text-neon-success font-medium">+5%</span>
                  <span className="text-slate-500">vs. média</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-neon-primary/20 to-neon-accent/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-neon-primary" />
              </div>
            </div>
          </NeonGradientCard>

          <NeonGradientCard
            variant="warning"
            glowEffect={true}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Contas Pendentes
                </p>
                <p className="text-3xl font-bold text-neon-warning mb-2">
                  {formatCurrency(pendingAmount)}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-neon-warning" />
                  <span className="text-neon-warning font-medium">
                    {transactions.filter(t => t.status === 'pending' || t.status === 'urgent').length} pendentes
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-neon-warning/10 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-neon-warning" />
              </div>
            </div>
          </NeonGradientCard>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="procedures" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Procedimentos
            </TabsTrigger>
            <TabsTrigger value="cashflow" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Fluxo de Caixa
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent Transactions */}
              <div className="xl:col-span-2">
                <NeonGradientCard
                  variant="default"
                  title="Transações Recentes"
                  description="Últimas movimentações financeiras"
                  className="h-fit"
                >
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-neon-primary to-neon-secondary rounded-full flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {transaction.patient}
                              </h3>
                              <StatusBadge 
                                status={transaction.status} 
                                size="sm"
                                pulse={transaction.status === 'urgent'}
                              />
                            </div>
                            
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                              {transaction.procedure}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                <span>{transaction.method}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {transaction.installments}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-xl font-bold text-neon-primary mb-2">
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div className="flex items-center gap-2">
                            <CosmicGlowButton 
                              variant="ghost" 
                              size="sm"
                              icon={Eye}
                              glowEffect={false}
                              cosmicAnimation={false}
                            >
                              Ver
                            </CosmicGlowButton>
                            {(transaction.status === 'pending' || transaction.status === 'urgent') && (
                              <CosmicGlowButton 
                                variant="success" 
                                size="sm"
                                icon={CheckCircle}
                                glowEffect={true}
                              >
                                Confirmar
                              </CosmicGlowButton>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </NeonGradientCard>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-6">
                {/* Monthly Performance */}
                <NeonGradientCard
                  variant="primary"
                  title="Performance Mensal"
                  glowEffect={true}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Meta de Receita
                      </span>
                      <span className="text-sm font-bold text-neon-primary">
                        78% atingida
                      </span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Procedimentos Realizados
                      </span>
                      <span className="text-sm font-bold text-neon-success">
                        92% da meta
                      </span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        Margem de Lucro
                      </span>
                      <span className="text-sm font-bold text-neon-primary">
                        {formatPercentage(avgProfitMargin)}
                      </span>
                    </div>
                  </div>
                </NeonGradientCard>

                {/* Payment Methods */}
                <NeonGradientCard
                  variant="cosmic"
                  title="Métodos de Pagamento"
                  backgroundAnimation={true}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-primary to-neon-secondary rounded-full flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Cartão</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">65%</span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                          <div className="w-3/5 h-full bg-gradient-to-r from-neon-primary to-neon-secondary rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-success to-emerald-400 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-neon-success rounded-full" />
                          </div>
                        </div>
                        <span className="text-sm font-medium">PIX</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">25%</span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                          <div className="w-1/4 h-full bg-gradient-to-r from-neon-success to-emerald-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">Dinheiro</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">10%</span>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-1">
                          <div className="w-1/12 h-full bg-slate-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </NeonGradientCard>

                {/* Quick Actions */}
                <NeonGradientCard 
                  title="Ações Rápidas"
                  variant="default"
                >
                  <div className="space-y-3">
                    <CosmicGlowButton 
                      variant="primary" 
                      fullWidth 
                      icon={Plus}
                      cosmicAnimation={true}
                    >
                      Nova Transação
                    </CosmicGlowButton>
                    <CosmicGlowButton 
                      variant="outline" 
                      fullWidth 
                      icon={Receipt}
                      glowEffect={false}
                    >
                      Gerar Relatório
                    </CosmicGlowButton>
                    <CosmicGlowButton 
                      variant="ghost" 
                      fullWidth 
                      icon={Download}
                      glowEffect={false}
                      cosmicAnimation={false}
                    >
                      Exportar Dados
                    </CosmicGlowButton>
                  </div>
                </NeonGradientCard>
              </div>
            </div>
          </TabsContent>

          {/* Procedures Tab */}
          <TabsContent value="procedures" className="space-y-6">
            <NeonGradientCard
              variant="cosmic"
              title="Análise de Rentabilidade por Procedimento"
              description="Performance financeira detalhada de cada procedimento"
              backgroundAnimation={true}
            >
              <div className="space-y-6">
                {procedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-700 dark:hover:to-slate-600 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {procedure.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {procedure.count} procedimentos realizados
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-neon-primary mb-1">
                          {formatCurrency(procedure.revenue)}
                        </div>
                        <div className="flex items-center gap-2">
                          {procedure.trend === 'up' ? (
                            <ArrowUpRight className="w-4 h-4 text-neon-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-neon-danger" />
                          )}
                          <span className={`text-sm font-medium ${
                            procedure.trend === 'up' ? 'text-neon-success' : 'text-neon-danger'
                          }`}>
                            {procedure.trendValue}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Preço Médio
                        </div>
                        <div className="text-lg font-bold text-neon-primary">
                          {formatCurrency(procedure.price)}
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Margem de Lucro
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-neon-success">
                            {formatPercentage(procedure.profitMargin)}
                          </div>
                          <Progress value={procedure.profitMargin} className="flex-1 h-2" />
                        </div>
                      </div>
                      
                      <div className="bg-white dark:bg-slate-900 rounded-lg p-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                          Ticket Médio
                        </div>
                        <div className="text-lg font-bold text-neon-primary">
                          {formatCurrency(procedure.revenue / procedure.count)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </NeonGradientCard>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <NeonGradientCard
                variant="primary"
                title="Evolução Mensal"
                description="Acompanhe o crescimento da receita"
                glowEffect={true}
              >
                <div className="space-y-4">
                  {monthlyData.map((month, index) => (
                    <div key={month.month} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-neon-primary to-neon-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {month.month}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(month.revenue)}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {month.procedures} procedimentos
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-neon-primary">
                          {formatCurrency(month.avgTicket)}
                        </div>
                        <div className="text-sm text-slate-500">
                          ticket médio
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </NeonGradientCard>

              <NeonGradientCard
                variant="success"
                title="Projeções"
                description="Estimativas para os próximos meses"
                glowEffect={true}
              >
                <div className="space-y-6">
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Meta Julho 2024
                    </div>
                    <div className="text-2xl font-bold text-neon-success mb-2">
                      {formatCurrency(85000)}
                    </div>
                    <Progress value={65} className="h-3" />
                    <div className="text-sm text-slate-500 mt-2">
                      65% da meta projetada
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Crescimento Esperado
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowUpRight className="w-5 h-5 text-neon-success" />
                      <span className="text-2xl font-bold text-neon-success">+25%</span>
                    </div>
                    <div className="text-sm text-slate-500">
                      Baseado na tendência atual
                    </div>
                  </div>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NeonGradientCard
                variant="primary"
                title="Relatório Mensal"
                description="Análise completa do mês"
                glowEffect={true}
                onClick={() => console.log('Generate monthly report')}
                className="cursor-pointer hover:scale-105 transition-transform duration-300 motion-reduce:hover:scale-100"
              >
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Último: Janeiro 2024
                  </div>
                  <CosmicGlowButton variant="primary" size="sm" icon={Download}>
                    Baixar
                  </CosmicGlowButton>
                </div>
              </NeonGradientCard>

              <NeonGradientCard
                variant="success"
                title="Relatório de Procedimentos"
                description="Performance por tratamento"
                glowEffect={true}
                onClick={() => console.log('Generate procedures report')}
                className="cursor-pointer hover:scale-105 transition-transform duration-300 motion-reduce:hover:scale-100"
              >
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Sempre atualizado
                  </div>
                  <CosmicGlowButton variant="success" size="sm" icon={BarChart3}>
                    Gerar
                  </CosmicGlowButton>
                </div>
              </NeonGradientCard>

              <NeonGradientCard
                variant="cosmic"
                title="Relatório Fiscal"
                description="Documentos para contabilidade"
                glowEffect={true}
                backgroundAnimation={true}
                onClick={() => console.log('Generate fiscal report')}
                className="cursor-pointer hover:scale-105 transition-transform duration-300 motion-reduce:hover:scale-100"
              >
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Trimestral
                  </div>
                  <CosmicGlowButton variant="primary" size="sm" icon={Receipt}>
                    Exportar
                  </CosmicGlowButton>
                </div>
              </NeonGradientCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}