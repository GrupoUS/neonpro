'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfDay, endOfDay, subDays, subWeeks, subMonths, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, RefreshCw, Settings, Plus,
  Calendar, Filter, Wallet, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Hooks para dados
import { useCashFlowEntries, useCashRegisters, useCashFlowAnalytics } from '../hooks/useCashFlow';

// Utilitários
import { formatCurrency, getCashFlowSummary } from '../utils/calculations';

// Tipos
import { CashFlowEntry, CashRegister, CashFlowAnalytics, CashFlowFilters } from '../types';

// Componentes
import { TransactionEntryForm } from './transaction-entry-form';
import { TransactionsList } from './transactions-list';

// Helper functions for dashboard calculations and formatting
const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const getDateRange = (period: 'today' | 'week' | 'month' | 'year') => {
  const now = new Date();
  let start: Date;
  
  switch (period) {
    case 'today':
      start = startOfDay(now);
      break;
    case 'week':
      start = subWeeks(startOfDay(now), 1);
      break;
    case 'month':
      start = subMonths(startOfDay(now), 1);
      break;
    case 'year':
      start = subYears(startOfDay(now), 1);
      break;
    default:
      start = startOfDay(now);
  }
  
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(endOfDay(now), 'yyyy-MM-dd')
  };
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
  
  // Get date range for current period
  const { start, end } = getDateRange(selectedPeriod);
  
  // Create filters for current selection
  const filters: CashFlowFilters = useMemo(() => ({
    dateFrom: start,
    dateTo: end,
    registerId: selectedRegisterId
  }), [start, end, selectedRegisterId]);
  
  // Fetch data using hooks
  const { registers, loading: registersLoading, refetch: refetchRegisters } = useCashRegisters(clinicId);
  const { entries, loading: entriesLoading, refetch: refetchEntries } = useCashFlowEntries(clinicId, filters);
  const { analytics, loading: analyticsLoading, refetch: refetchAnalytics } = useCashFlowAnalytics(clinicId, filters);

  const loading = registersLoading || entriesLoading || analyticsLoading;

  // Handle refresh of all data
  const handleRefresh = async () => {
    await Promise.all([
      refetchRegisters(),
      refetchEntries(),
      refetchAnalytics()
    ]);
  };

  // Calculate derived data
  const totalBalance = registers.reduce((sum, register) => sum + register.current_balance, 0);
  const activeRegisters = registers.filter(r => r.is_active).length;
  const lowBalanceRegisters = registers.filter(r => r.is_active && r.current_balance < 500).length;

  // Recent transactions for overview
  const recentTransactions = entries.slice(0, 10).map(t => ({
    ...t,
    registerName: registers.find(r => r.id === t.register_id)?.register_name || 'Desconhecido'
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gerencie entradas, saídas e conciliação de pagamentos
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
                  {register.register_name} - {formatCurrency(register.current_balance)}
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
      </div>

      {/* Summary Cards */}
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
              Em {activeRegisters} caixa(s) ativo(s)
            </p>
            {lowBalanceRegisters > 0 && (
              <div className="mt-2">
                <Progress value={(activeRegisters - lowBalanceRegisters) / activeRegisters * 100} className="h-1" />
                <p className="text-xs text-yellow-600 mt-1">
                  {lowBalanceRegisters} caixa(s) com saldo baixo
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
              {entries.filter(e => e.transaction_type === 'receipt').length} transações
            </p>
            {analytics && analytics.totalIncome > 0 && (
              <p className="text-xs text-green-600">
                Média: {formatCurrency(analytics.totalIncome / Math.max(1, entries.filter(e => e.transaction_type === 'receipt').length))}
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
              {analytics ? formatCurrency(analytics.totalExpenses) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {entries.filter(e => e.transaction_type === 'payment').length} transações
            </p>
            {analytics && analytics.totalExpenses > 0 && (
              <p className="text-xs text-red-600">
                Média: {formatCurrency(analytics.totalExpenses / Math.max(1, entries.filter(e => e.transaction_type === 'payment').length))}
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
            <div className={`text-2xl font-bold ${analytics && analytics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {analytics ? formatCurrency(analytics.netCashFlow) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              No período selecionado
            </p>
            <div className="flex items-center mt-2">
              {analytics && analytics.netCashFlow >= 0 ? (
                <CheckCircle className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span className={`text-xs ${analytics && analytics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {analytics && analytics.netCashFlow >= 0 ? 'Positivo' : 'Negativo'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
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
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Transações Recentes
                </CardTitle>
                <CardDescription>
                  Últimas 10 transações registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          transaction.transaction_type === 'receipt' ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.registerName} • {formatDate(transaction.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.transaction_type === 'receipt' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.transaction_type === 'receipt' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                  {recentTransactions.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mb-2">
                        <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      </div>
                      <p className="text-sm">Nenhuma transação encontrada</p>
                      <p className="text-xs">Adicione transações para ver o resumo aqui</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Cash Registers Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Status dos Caixas
                </CardTitle>
                <CardDescription>
                  Saldos atuais de todos os caixas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {registers.map((register) => (
                    <div key={register.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-2 w-2 rounded-full ${
                          register.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{register.register_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {register.is_active ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {formatCurrency(register.current_balance)}
                      </div>
                    </div>
                  ))}
                  {registers.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <div className="mb-2">
                        <Wallet className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      </div>
                      <p className="text-sm">Nenhum caixa configurado</p>
                      <p className="text-xs">Configure caixas para começar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>
                Gerencie todas as transações de entrada e saída
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TransactionsList component will be implemented next */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Lista de transações será implementada</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Caixas</CardTitle>
              <CardDescription>
                Configure e monitore os caixas da clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Cash register management will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Gestão de caixas será implementada</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises e Relatórios</CardTitle>
              <CardDescription>
                Análises detalhadas do fluxo de caixa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Analytics charts will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Relatórios serão implementados</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conciliação de Pagamentos</CardTitle>
              <CardDescription>
                Reconcilie pagamentos com gateways externos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Reconciliation tools will be implemented */}
              <div className="text-center py-8 text-muted-foreground">
                <p>Ferramentas de conciliação serão implementadas</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Entry Form Modal */}
      {showNewTransaction && (
        <TransactionEntryForm
          clinicId={clinicId}
          userId={userId}
          registers={registers}
          onClose={() => setShowNewTransaction(false)}
          onSuccess={() => {
            setShowNewTransaction(false);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
