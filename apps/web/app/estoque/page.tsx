'use client';

import {
  AlertTriangle,
  BarChart3,
  Download,
  Filter,
  Package,
  Plus,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * 📦 NEONPRO INVENTORY OVERVIEW DASHBOARD
 * Comprehensive inventory management with alerts and analytics
 * WCAG 2.1 AA+ compliant interface for clinic staff
 */

interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'expiring' | 'expired' | 'critical';
  product_name: string;
  current_stock: number;
  minimum_threshold: number;
  expiry_date?: string;
  location: string;
  priority: 'high' | 'medium' | 'low';
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  minimum_threshold: number;
  unit: string;
  value_per_unit: number;
  total_value: number;
  location: string;
  supplier: string;
  expiry_date?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired';
}

interface InventoryMetrics {
  total_items: number;
  total_value: number;
  items_below_threshold: number;
  expired_items: number;
  expiring_soon: number;
  average_stock_level: number;
  stock_turnover_rate: number;
}

export default function InventoryOverview() {
  const [metrics, setMetrics] = useState<InventoryMetrics>({
    total_items: 247,
    total_value: 45780.9,
    items_below_threshold: 12,
    expired_items: 3,
    expiring_soon: 8,
    average_stock_level: 78.5,
    stock_turnover_rate: 4.2,
  });

  const [alerts, setAlerts] = useState<InventoryAlert[]>([
    {
      id: '1',
      type: 'low_stock',
      product_name: 'Ácido Hialurônico 1ml',
      current_stock: 5,
      minimum_threshold: 20,
      location: 'Sala 1 - Armário A',
      priority: 'high',
    },
    {
      id: '2',
      type: 'expiring',
      product_name: 'Toxina Botulínica',
      current_stock: 15,
      minimum_threshold: 10,
      expiry_date: '2025-02-15',
      location: 'Refrigerador Principal',
      priority: 'medium',
    },
    {
      id: '3',
      type: 'critical',
      product_name: 'Anestésico Tópico',
      current_stock: 0,
      minimum_threshold: 5,
      location: 'Sala 2 - Gaveta B',
      priority: 'high',
    },
  ]);

  const [recentItems, setRecentItems] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Ácido Hialurônico 1ml',
      category: 'Preenchedores',
      current_stock: 5,
      minimum_threshold: 20,
      unit: 'ml',
      value_per_unit: 280.0,
      total_value: 1400.0,
      location: 'Sala 1',
      supplier: 'Allergan',
      expiry_date: '2026-03-15',
      status: 'low_stock',
    },
    {
      id: '2',
      name: 'Toxina Botulínica 100UI',
      category: 'Neurotoxinas',
      current_stock: 15,
      minimum_threshold: 10,
      unit: 'frasco',
      value_per_unit: 450.0,
      total_value: 6750.0,
      location: 'Refrigerador',
      supplier: 'Allergan',
      expiry_date: '2025-02-15',
      status: 'in_stock',
    },
  ]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'low_stock':
        return <Package className="h-5 w-5 text-amber-500" />;
      case 'expiring':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 border-red-500/20 text-red-700';
      case 'medium':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-700';
      case 'low':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-700';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'low_stock':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'out_of_stock':
        return 'bg-red-500/10 text-red-700 border-red-500/20';
      case 'expired':
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      role="main"
      aria-label="Visão Geral do Estoque"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Gestão de Estoque
          </h1>
          <p className="text-muted-foreground">
            Monitoramento completo do inventário da clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" aria-label="Filtrar itens">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm" aria-label="Exportar relatório">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm" aria-label="Registrar nova entrada de estoque">
            <Plus className="h-4 w-4 mr-2" />
            Nova Entrada
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Itens
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total_items}</div>
            <p className="text-xs text-muted-foreground">
              produtos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.total_value.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">valor do inventário</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baixo Estoque</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {metrics.items_below_threshold}
            </div>
            <p className="text-xs text-muted-foreground">
              itens abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencendo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.expiring_soon}
            </div>
            <p className="text-xs text-muted-foreground">próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.average_stock_level}%
            </div>
            <p className="text-xs text-muted-foreground">
              capacidade utilizada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Alertas do Estoque
            </CardTitle>
            <CardDescription>
              Itens que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <Alert key={alert.id} className={getAlertColor(alert.priority)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <AlertTitle className="text-sm font-medium">
                          {alert.product_name}
                        </AlertTitle>
                        <AlertDescription className="text-sm">
                          {alert.type === 'low_stock' && (
                            <>
                              Estoque baixo: {alert.current_stock} unidades
                              (mínimo: {alert.minimum_threshold})
                            </>
                          )}
                          {alert.type === 'expiring' && (
                            <>Vencimento em: {alert.expiry_date}</>
                          )}
                          {alert.type === 'critical' && (
                            <>Produto em falta - reposição urgente necessária</>
                          )}
                          <br />
                          <span className="text-xs">
                            Localização: {alert.location}
                          </span>
                        </AlertDescription>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={getAlertColor(alert.priority)}
                    >
                      {alert.priority === 'high'
                        ? 'Alta'
                        : alert.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </Badge>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="items">Itens</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Itens Recentes</CardTitle>
                <CardDescription>
                  Últimos produtos cadastrados ou atualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <Badge
                            variant="outline"
                            className={getStatusColor(item.status)}
                          >
                            {item.status === 'in_stock'
                              ? 'Em Estoque'
                              : item.status === 'low_stock'
                                ? 'Baixo'
                                : item.status === 'out_of_stock'
                                  ? 'Em Falta'
                                  : 'Vencido'}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Categoria: {item.category} | Local: {item.location}
                          </p>
                          <p>
                            Estoque: {item.current_stock} {item.unit} | Valor:
                            R$ {item.total_value.toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Estoque</CardTitle>
                <CardDescription>
                  Distribuição por categoria e status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Preenchedores</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Neurotoxinas</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Materiais de Consumo</span>
                    <span>68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Medicamentos</span>
                    <span>73%</span>
                  </div>
                  <Progress value={73} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="items">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Produtos</CardTitle>
              <CardDescription>
                Todos os itens do inventário com status e detalhes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label="Buscar produtos no estoque"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>

              <div className="space-y-2">
                {recentItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <Badge
                            variant="outline"
                            className={getStatusColor(item.status)}
                          >
                            {item.status === 'in_stock'
                              ? 'Em Estoque'
                              : item.status === 'low_stock'
                                ? 'Baixo'
                                : item.status === 'out_of_stock'
                                  ? 'Em Falta'
                                  : 'Vencido'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Categoria:</span>{' '}
                            {item.category}
                          </div>
                          <div>
                            <span className="font-medium">Estoque:</span>{' '}
                            {item.current_stock} {item.unit}
                          </div>
                          <div>
                            <span className="font-medium">Localização:</span>{' '}
                            {item.location}
                          </div>
                          <div>
                            <span className="font-medium">Valor Total:</span> R${' '}
                            {item.total_value.toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                        <Button variant="outline" size="sm">
                          Histórico
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Consumo</CardTitle>
                <CardDescription>
                  Produtos com maior rotatividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gráficos de análise de consumo serão implementados aqui.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Previsão de Reposição</CardTitle>
                <CardDescription>
                  Quando cada produto precisará ser reposto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sistema de previsão inteligente será implementado aqui.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Todas as entradas e saídas do estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Histórico detalhado de movimentações será implementado aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
