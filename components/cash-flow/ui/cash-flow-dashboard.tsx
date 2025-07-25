// Cash Flow Dashboard - Enhanced main cash flow management interface
// Following financial dashboard patterns from Context7 research

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Calendar,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wallet
} from 'lucide-react';
import { useCashFlow } from '../hooks/use-cash-flow';
import { useCashRegisters } from '../hooks/use-cash-registers';
import { formatCurrency, getDateRange } from '../utils/calculations';
import { TransactionEntryForm } from './transaction-entry-form';
import { TransactionsList } from './transactions-list';
import type { CashFlowFilters } from '../types';

// Helper functions for dashboard calculations and formatting
const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

interface CashFlowDashboardProps {
  clinicId: string;
  userId: string;
}

export function CashFlowDashboard({ clinicId, userId }: CashFlowDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | undefined>();
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { registers, loading: registersLoading, refetch: refetchRegisters } = useCashRegisters(clinicId);
  
  const { start, end } = getDateRange(selectedPeriod);
  const filters: CashFlowFilters = {
    dateFrom: start,
    dateTo: end,
    registerId: selectedRegisterId
  };
  
  const { 
    entries, 
    analytics, 
    loading, 
    loadAnalytics,
    refetch
  } = useCashFlow(clinicId, filters);

  // Load analytics when period or register changes
  useEffect(() => {
    if (clinicId) {
      loadAnalytics(start, end, selectedRegisterId);
    }
  }, [clinicId, start, end, selectedRegisterId, loadAnalytics]);

  const totalBalance = registers.reduce((sum, register) => sum + register.current_balance, 0);
  const activeRegisters = registers.filter(r => r.status === 'active').length;
  const lowBalanceRegisters = registers.filter(r => r.current_balance < 100).length;
  
  // Get recent transactions for overview
  const recentTransactions = transactions.slice(0, 10).map(t => ({
    ...t,
    cashRegisterName: registers.find(r => r.id === t.cash_register_id)?.name || 'Desconhecido'
  }));

  const handleRefresh = async () => {
    await Promise.all([
      refetch(),
      refetchRegisters(),
      loadAnalytics(start, end, selectedRegisterId)
    ]);
  };

  const handleTransactionSuccess = () => {
    setShowNewTransaction(false);
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gestão financeira e controle de caixa diário
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm" onClick={() => setShowNewTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <Select value={selectedPeriod} onValueChange={(value: typeof selectedPeriod) => setSelectedPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <Select value={selectedRegisterId || 'all'} onValueChange={(value) => setSelectedRegisterId(value === 'all' ? undefined : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Todos os caixas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os caixas</SelectItem>
              {registers.map((register) => (
                <SelectItem key={register.id} value={register.id}>
                  {register.name} - {formatCurrency(register.current_balance)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {lowBalanceRegisters > 0 && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {lowBalanceRegisters} caixa(s) com saldo baixo
          </Badge>
        )}
      </div>      {/* Enhanced Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRegisters} de {registers.length} caixas ativos
            </p>
            {lowBalanceRegisters > 0 && (
              <div className="mt-2">
                <Progress value={(activeRegisters - lowBalanceRegisters) / activeRegisters * 100} className="h-1" />
                <p className="text-xs text-yellow-600 mt-1">
                  {lowBalanceRegisters} com saldo baixo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analytics ? formatCurrency(analytics.totalIncome) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics?.transactionCount || 0} transações
            </p>
            {analytics?.averageTransaction && (
              <p className="text-xs text-green-600">
                Média: {formatCurrency(analytics.averageTransaction)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics ? formatCurrency(Math.abs(analytics.totalExpenses)) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Despesas e retiradas
            </p>
            {analytics && analytics.totalIncome > 0 && (
              <p className="text-xs text-red-600">
                {((Math.abs(analytics.totalExpenses) / analytics.totalIncome) * 100).toFixed(1)}% das entradas
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${analytics && analytics.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics ? formatCurrency(analytics.netFlow) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Fluxo do período
            </p>
            <div className="flex items-center mt-2">
              {analytics && analytics.netFlow >= 0 ? (
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${analytics && analytics.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics && analytics.netFlow >= 0 ? 'Positivo' : 'Negativo'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="registers">Caixas</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Transactions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Transações Recentes
                </CardTitle>
                <CardDescription>
                  Últimas movimentações nos caixas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)} • {transaction.cashRegisterName}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </div>
                    </div>
                  ))}
                </div>
                {recentTransactions.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">
                      <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                    </div>
                    <p className="text-sm">Nenhuma transação encontrada</p>
                    <p className="text-xs">Adicione transações para ver o resumo aqui</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Register Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Status dos Caixas
                </CardTitle>
                <CardDescription>
                  Saldo atual de cada caixa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registers.slice(0, 5).map((register) => (
                    <div key={register.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          register.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{register.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {register.status === 'active' ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(register.current_balance)}
                      </div>
                    </div>
                  ))}
                </div>
                {registers.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <div className="mb-2">
                      <Wallet className="h-8 w-8 mx-auto text-muted-foreground/50" />
                    </div>
                    <p className="text-sm">Nenhum caixa configurado</p>
                    <p className="text-xs">Configure caixas para começar</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Histórico de movimentações financeiras
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement TransactionsList component */}
              <div className="text-center py-8 text-muted-foreground">
                Lista de transações será implementada aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Caixas</CardTitle>
              <CardDescription>
                Controle de caixas e seus saldos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement RegistersList component */}
              <div className="text-center py-8 text-muted-foreground">
                Gestão de caixas será implementada aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
              <CardDescription>
                Insights financeiros e tendências
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement AnalyticsCharts component */}
              <div className="text-center py-8 text-muted-foreground">
                Relatórios e gráficos serão implementados aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conciliação de Pagamentos</CardTitle>
              <CardDescription>
                Reconciliação com gateways de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Implement ReconciliationPanel component */}
              <div className="text-center py-8 text-muted-foreground">
                Sistema de conciliação será implementado aqui
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}