'use client';

/**
 * Story 11.3: Stock Output and Consumption Control System
 * Main inventory management dashboard with comprehensive analytics and controls
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  InventoryOverview,
  StockOutputManagement,
  FIFOManagement,
  ConsumptionAnalytics,
  StockTransfers,
  InventoryMetrics,
  InventoryConfiguration
} from '@/components/inventory';
import { 
  inventoryDashboardProvider,
  type InventoryDashboardSummary 
} from '@/lib/inventory';
import { useToast } from '@/hooks/use-toast';

interface InventoryDashboardProps {
  className?: string;
}

export default function InventoryDashboard({ className }: InventoryDashboardProps) {
  const [dashboardData, setDashboardData] = useState<InventoryDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: dashboardError } = await inventoryDashboardProvider.getDashboardSummary();

      if (dashboardError) {
        throw new Error(dashboardError);
      }

      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard';
      setError(errorMessage);
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">Sistema de saída e controle de consumo</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Controle de Estoque</h1>
            <p className="text-muted-foreground">Sistema de saída e controle de consumo</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>

        <Alert variant="destructive">
          <Icons.AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Controle de Estoque</h1>
          <p className="text-muted-foreground">
            Sistema de saída e controle de consumo - Story 11.3
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Badge variant="secondary">Em Tempo Real</Badge>
        </div>
      </div>

      {/* Quick Stats */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Stock Levels */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Produtos em Estoque
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.stock_levels.total_products.toLocaleString()}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={dashboardData.stock_levels.low_stock_products > 0 ? 'destructive' : 'secondary'}>
                  {dashboardData.stock_levels.low_stock_products} baixo estoque
                </Badge>
                {dashboardData.stock_levels.out_of_stock_products > 0 && (
                  <Badge variant="destructive">
                    {dashboardData.stock_levels.out_of_stock_products} em falta
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Atividade Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.recent_activity.outputs_today}
              </div>
              <div className="text-sm text-muted-foreground">
                R$ {dashboardData.recent_activity.value_consumed_today.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2
                })} consumidos
              </div>
              <div className="flex items-center gap-2 mt-2">
                {dashboardData.recent_activity.pending_requests > 0 && (
                  <Badge variant="outline">
                    {dashboardData.recent_activity.pending_requests} pendentes
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* FIFO Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status FIFO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.fifo_status.fifo_compliance_score}%
              </div>
              <div className="text-sm text-muted-foreground">
                Conformidade FIFO
              </div>
              <div className="flex items-center gap-2 mt-2">
                {dashboardData.fifo_status.batches_expiring_7_days > 0 && (
                  <Badge variant="destructive">
                    {dashboardData.fifo_status.batches_expiring_7_days} vencendo
                  </Badge>
                )}
                <Badge variant="secondary">
                  R$ {dashboardData.fifo_status.waste_prevented_value.toLocaleString('pt-BR')} economizados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Cost Efficiency */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eficiência de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.cost_efficiency.efficiency_score}%
              </div>
              <div className="text-sm text-muted-foreground">
                Score de eficiência
              </div>
              <div className="mt-2">
                <Badge variant="secondary">
                  R$ {dashboardData.cost_efficiency.potential_savings.toLocaleString('pt-BR')} potencial
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Active Alerts */}
      {dashboardData && dashboardData.recent_activity.alerts_active > 0 && (
        <Alert className="mb-6">
          <Icons.AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Existem {dashboardData.recent_activity.alerts_active} alertas ativos que requerem atenção.
            <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setActiveTab('overview')}>
              Ver detalhes
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="outputs">Saídas</TabsTrigger>
          <TabsTrigger value="fifo">FIFO</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transfers">Transferências</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InventoryOverview 
            dashboardData={dashboardData}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="outputs" className="space-y-6">
          <StockOutputManagement 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="fifo" className="space-y-6">
          <FIFOManagement 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ConsumptionAnalytics 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <StockTransfers 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <InventoryMetrics 
            onRefresh={handleRefresh}
          />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <InventoryConfiguration 
            onRefresh={handleRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}