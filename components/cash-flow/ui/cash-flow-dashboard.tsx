// Cash Flow Dashboard - Main cash flow management interface
// Following financial dashboard patterns from Context7 research

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, DollarSign, BarChart3, Settings } from 'lucide-react';
import { useCashFlow } from '../hooks/use-cash-flow';
import { useCashRegisters } from '../hooks/use-cash-registers';
import { formatCurrency, getDateRange } from '../utils/calculations';
import type { CashFlowFilters } from '../types';

interface CashFlowDashboardProps {
  clinicId: string;
  userId: string;
}

export function CashFlowDashboard({ clinicId, userId }: CashFlowDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [selectedRegisterId, setSelectedRegisterId] = useState<string | undefined>();
  
  const { registers, loading: registersLoading } = useCashRegisters(clinicId);
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fluxo de Caixa</h1>
          <p className="text-muted-foreground">
            Gestão financeira e controle de caixa diário
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>      {/* Summary Cards */}
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
              {registers.length} caixas ativos
            </p>
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
              Período: {selectedPeriod === 'today' ? 'Hoje' : 
                       selectedPeriod === 'week' ? 'Esta semana' :
                       selectedPeriod === 'month' ? 'Este mês' : 'Este ano'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analytics ? formatCurrency(analytics.totalExpenses) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              Período: {selectedPeriod === 'today' ? 'Hoje' : 
                       selectedPeriod === 'week' ? 'Esta semana' :
                       selectedPeriod === 'month' ? 'Este mês' : 'Este ano'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fluxo Líquido</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              analytics && analytics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {analytics ? formatCurrency(analytics.netCashFlow) : '—'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics && analytics.netCashFlow >= 0 ? 'Positivo' : 'Negativo'}
            </p>
          </CardContent>
        </Card>
      </div>      {/* Main Content */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="registers">Caixas</TabsTrigger>
          <TabsTrigger value="analytics">Relatórios</TabsTrigger>
          <TabsTrigger value="reconciliation">Conciliação</TabsTrigger>
        </TabsList>

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