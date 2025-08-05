"use client";

/**
 * Story 11.3: Inventory Metrics Component
 * Real-time inventory metrics and KPI dashboard
 */

import React, { useEffect, useState } from "react";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Icons } from "@/components/ui/icons";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { useToast } from "@/hooks/use-toast";
import type {
  ConsumptionAnalyzer,
  FIFOManager,
  InventoryMetrics,
  StockAlert,
  StockOutputManager,
} from "@/lib/inventory";

interface InventoryMetricsProps {
  onRefresh: () => void;
  className?: string;
}

interface MetricsFilters {
  centro_custo: string;
  periodo: "today" | "week" | "month" | "quarter";
}

export function InventoryMetrics({ onRefresh, className }: InventoryMetricsProps) {
  const [metrics, setMetrics] = useState<InventoryMetrics | null>(null);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<MetricsFilters>({
    centro_custo: "all",
    periodo: "month",
  });
  const { toast } = useToast();

  const stockOutputManager = new StockOutputManager();
  const consumptionAnalyzer = new ConsumptionAnalyzer();
  const fifoManager = new FIFOManager();

  useEffect(() => {
    loadMetrics();
  }, [filters]);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);

      // Calculate date range based on period
      const endDate = new Date();
      const startDate = new Date();

      switch (filters.periodo) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(endDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
      }

      // Get consumption analytics for metrics calculation
      const { data: analyticsData, error: analyticsError } =
        await consumptionAnalyzer.getConsumptionAnalytics(
          filters.centro_custo === "all" ? undefined : filters.centro_custo,
          startDate,
          endDate,
        );

      if (analyticsError) {
        console.warn("Analytics error:", analyticsError);
      }

      // Get FIFO status for aging metrics
      const { data: fifoStatus } = await fifoManager.getFIFOStatusByCostCenter(
        filters.centro_custo === "all" ? undefined : filters.centro_custo,
      );

      // Calculate derived metrics
      const calculatedMetrics: InventoryMetrics = {
        total_items: analyticsData?.produtos_mais_consumidos?.length || 0,
        total_value: analyticsData?.consumo_total?.valor_total || 0,
        consumption_rate: analyticsData?.media_diaria?.valor || 0,
        efficiency_score: analyticsData?.eficiencia_custos?.score_eficiencia || 0,
        cost_savings: analyticsData?.eficiencia_custos?.economia_potencial || 0,
        expiry_alerts:
          fifoStatus?.filter(
            (item) =>
              item.status_validade === "proximoVencimento" || item.status_validade === "vencido",
          )?.length || 0,
        low_stock_alerts:
          fifoStatus?.filter((item) => item.quantidade_atual <= (item.estoque_minimo || 0))
            ?.length || 0,
        transfer_requests: 0, // Will be calculated separately
        aging_analysis: {
          items_30_days:
            fifoStatus?.filter((item) => {
              const daysToExpiry = Math.ceil(
                (new Date(item.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return daysToExpiry <= 30 && daysToExpiry > 0;
            })?.length || 0,
          items_60_days:
            fifoStatus?.filter((item) => {
              const daysToExpiry = Math.ceil(
                (new Date(item.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return daysToExpiry <= 60 && daysToExpiry > 30;
            })?.length || 0,
          items_90_days:
            fifoStatus?.filter((item) => {
              const daysToExpiry = Math.ceil(
                (new Date(item.data_validade).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
              );
              return daysToExpiry <= 90 && daysToExpiry > 60;
            })?.length || 0,
          expired_items:
            fifoStatus?.filter((item) => new Date(item.data_validade) < new Date())?.length || 0,
        },
        top_consumers: analyticsData?.produtos_mais_consumidos?.slice(0, 5) || [],
        trends: analyticsData?.tendencias || [],
      };

      setMetrics(calculatedMetrics);

      // Generate alerts based on metrics
      const generatedAlerts: StockAlert[] = [];

      // Low stock alerts
      if (calculatedMetrics.low_stock_alerts > 0) {
        generatedAlerts.push({
          id: "low-stock-alert",
          type: "stock_baixo",
          severity: "alta",
          title: "Estoque Baixo",
          message: `${calculatedMetrics.low_stock_alerts} produto(s) com estoque abaixo do mínimo`,
          product_id: "multiple",
          threshold_value: 0,
          current_value: calculatedMetrics.low_stock_alerts,
          created_at: new Date().toISOString(),
        });
      }

      // Expiry alerts
      if (calculatedMetrics.expiry_alerts > 0) {
        generatedAlerts.push({
          id: "expiry-alert",
          type: "vencimento_proximo",
          severity: "media",
          title: "Vencimento Próximo",
          message: `${calculatedMetrics.expiry_alerts} produto(s) próximo(s) ao vencimento`,
          product_id: "multiple",
          threshold_value: 30,
          current_value: calculatedMetrics.expiry_alerts,
          created_at: new Date().toISOString(),
        });
      }

      // Efficiency alerts
      if (calculatedMetrics.efficiency_score < 70) {
        generatedAlerts.push({
          id: "efficiency-alert",
          type: "eficiencia_baixa",
          severity: "media",
          title: "Eficiência Baixa",
          message: `Score de eficiência atual: ${calculatedMetrics.efficiency_score}%`,
          product_id: "general",
          threshold_value: 70,
          current_value: calculatedMetrics.efficiency_score,
          created_at: new Date().toISOString(),
        });
      }

      setAlerts(generatedAlerts);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar métricas";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      baixa: "bg-blue-100 text-blue-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: any) => {
    if (!trend?.variacao_valor) return <Icons.Minus className="h-4 w-4 text-gray-500" />;

    return trend.variacao_valor >= 0 ? (
      <Icons.TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <Icons.TrendingDown className="h-4 w-4 text-red-500" />
    );
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Métricas de Inventário</h2>
            <p className="text-muted-foreground">Dashboard de indicadores</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Métricas de Inventário</h2>
          <p className="text-muted-foreground">Dashboard de indicadores e KPIs em tempo real</p>
        </div>
        <Button variant="outline" onClick={loadMetrics}>
          <Icons.RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Centro de Custo</label>
              <Select
                value={filters.centro_custo}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, centro_custo: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Centros</SelectItem>
                  <SelectItem value="cc001">Consultório 1</SelectItem>
                  <SelectItem value="cc002">Consultório 2</SelectItem>
                  <SelectItem value="cc003">Sala de Cirurgia</SelectItem>
                  <SelectItem value="cc004">Recepção</SelectItem>
                  <SelectItem value="cc005">Estoque Central</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select
                value={filters.periodo}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, periodo: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Itens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_items}</div>
              <p className="text-sm text-muted-foreground">produtos únicos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Valor Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.total_value)}</div>
              <p className="text-sm text-muted-foreground">valor consumido</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Taxa de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.consumption_rate)}</div>
              <p className="text-sm text-muted-foreground">por dia (média)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score de Eficiência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getEfficiencyColor(metrics.efficiency_score)}`}>
                {formatPercentage(metrics.efficiency_score)}
              </div>
              <p className="text-sm text-muted-foreground">eficiência de custos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Secondary Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Economia Potencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(metrics.cost_savings)}
              </div>
              <p className="text-sm text-muted-foreground">oportunidades identificadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Alertas de Vencimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{metrics.expiry_alerts}</div>
              <p className="text-sm text-muted-foreground">produtos próximos ao vencimento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estoque Baixo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.low_stock_alerts}</div>
              <p className="text-sm text-muted-foreground">abaixo do estoque mínimo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Aging Analysis */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Clock className="h-5 w-5" />
              Análise de Aging (Vencimento)
            </CardTitle>
            <CardDescription>Distribuição de produtos por prazo de vencimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {metrics.aging_analysis.expired_items}
                </div>
                <p className="text-sm text-muted-foreground">Vencidos</p>
                <Progress value={100} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.aging_analysis.items_30_days}
                </div>
                <p className="text-sm text-muted-foreground">Até 30 dias</p>
                <Progress value={75} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {metrics.aging_analysis.items_60_days}
                </div>
                <p className="text-sm text-muted-foreground">30-60 dias</p>
                <Progress value={50} className="mt-2 h-2" />
              </div>

              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.aging_analysis.items_90_days}
                </div>
                <p className="text-sm text-muted-foreground">60-90 dias</p>
                <Progress value={25} className="mt-2 h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Consumers */}
      {metrics && metrics.top_consumers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.BarChart3 className="h-5 w-5" />
              Top Produtos Consumidos
            </CardTitle>
            <CardDescription>Produtos com maior consumo no período selecionado</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>% Total</TableHead>
                  <TableHead>Tendência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.top_consumers.map((product, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{product.nome_produto}</TableCell>
                    <TableCell>{product.categoria}</TableCell>
                    <TableCell>{product.quantidade_consumida}</TableCell>
                    <TableCell>{formatCurrency(product.valor_consumido)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatPercentage(product.percentual_consumo_total)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(product)}
                        <span className="text-sm">
                          {formatPercentage(Math.abs(product.variacao_percentual || 0))}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.AlertTriangle className="h-5 w-5" />
              Alertas Ativos
            </CardTitle>
            <CardDescription>Alertas e notificações que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icons.AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                    {alert.threshold_value && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Limite: {alert.threshold_value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
