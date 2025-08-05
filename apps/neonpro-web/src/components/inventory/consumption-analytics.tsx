"use client";

/**
 * Story 11.3: Consumption Analytics Component
 * Advanced consumption analytics and cost control interface
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
import type { Input } from "@/components/ui/input";
import type { Label } from "@/components/ui/label";
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
  ConsumptionAnalytics,
  ConsumptionAnalyzer,
  ConsumptionForecast,
  EfficiencyOpportunity,
} from "@/lib/inventory";

interface ConsumptionAnalyticsProps {
  onRefresh: () => void;
  className?: string;
}

interface AnalyticsFilters {
  centroCustoId: string;
  dataInicio: string;
  dataFim: string;
  periodo: "week" | "month" | "quarter" | "year";
}

export function ConsumptionAnalytics({ onRefresh, className }: ConsumptionAnalyticsProps) {
  const [analytics, setAnalytics] = useState<ConsumptionAnalytics | null>(null);
  const [forecasts, setForecasts] = useState<ConsumptionForecast[]>([]);
  const [opportunities, setOpportunities] = useState<EfficiencyOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    centroCustoId: "cc001",
    dataInicio: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    dataFim: new Date().toISOString().split("T")[0],
    periodo: "month",
  });
  const { toast } = useToast();

  const consumptionAnalyzer = new ConsumptionAnalyzer();

  useEffect(() => {
    loadAnalyticsData();
  }, [filters]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);

      const startDate = new Date(filters.dataInicio);
      const endDate = new Date(filters.dataFim);

      // Get consumption analytics
      const { data: analyticsData, error: analyticsError } =
        await consumptionAnalyzer.getConsumptionAnalytics(
          filters.centroCustoId,
          startDate,
          endDate,
        );

      if (analyticsError) {
        throw new Error(analyticsError);
      }

      setAnalytics(analyticsData);

      // Get consumption forecasts
      const { data: forecastData, error: forecastError } =
        await consumptionAnalyzer.getConsumptionForecast(filters.centroCustoId, undefined, 30);

      if (forecastError) {
        console.warn("Forecast error:", forecastError);
      } else {
        setForecasts(forecastData || []);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao carregar dados de analytics";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateOptimizationRecommendations = async () => {
    try {
      setIsGeneratingRecommendations(true);

      const startDate = new Date(filters.dataInicio);
      const endDate = new Date(filters.dataFim);

      const { data: recommendationsData, error } =
        await consumptionAnalyzer.generateCostOptimizationRecommendations(
          filters.centroCustoId,
          startDate,
          endDate,
        );

      if (error) {
        throw new Error(error);
      }

      setOpportunities(recommendationsData || []);

      toast({
        title: "Sucesso",
        description: `${recommendationsData?.length || 0} oportunidades de otimização identificadas`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao gerar recomendações";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingRecommendations(false);
    }
  };

  const handleFilterChange = (field: keyof AnalyticsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const getComplexityColor = (complexity: string) => {
    const colors = {
      baixa: "bg-green-100 text-green-800",
      media: "bg-yellow-100 text-yellow-800",
      alta: "bg-red-100 text-red-800",
    };
    return colors[complexity as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "crescente":
        return <Icons.TrendingUp className="h-4 w-4 text-green-500" />;
      case "decrescente":
        return <Icons.TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Icons.Minus className="h-4 w-4 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics de Consumo</h2>
            <p className="text-muted-foreground">Análise e controle de custos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-48 bg-gray-200 rounded animate-pulse" />
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
          <h2 className="text-2xl font-bold">Analytics de Consumo</h2>
          <p className="text-muted-foreground">Análise avançada de consumo e controle de custos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAnalyticsData}>
            <Icons.RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button
            onClick={generateOptimizationRecommendations}
            disabled={isGeneratingRecommendations}
          >
            {isGeneratingRecommendations ? (
              <>
                <Icons.Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Icons.Lightbulb className="w-4 h-4 mr-2" />
                Gerar Recomendações
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Centro de Custo</Label>
              <Select
                value={filters.centroCustoId}
                onValueChange={(value) => handleFilterChange("centroCustoId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cc001">Consultório 1</SelectItem>
                  <SelectItem value="cc002">Consultório 2</SelectItem>
                  <SelectItem value="cc003">Sala de Cirurgia</SelectItem>
                  <SelectItem value="cc004">Recepção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Início</Label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => handleFilterChange("dataInicio", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => handleFilterChange("dataFim", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Período</Label>
              <Select
                value={filters.periodo}
                onValueChange={(value) => handleFilterChange("periodo", value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Semanal</SelectItem>
                  <SelectItem value="month">Mensal</SelectItem>
                  <SelectItem value="quarter">Trimestral</SelectItem>
                  <SelectItem value="year">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Consumo Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.consumo_total.valor_total)}
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.consumo_total.numero_produtos} produtos
              </p>
              <div className="mt-2">
                <Badge variant="secondary">
                  {analytics.consumo_total.numero_movimentacoes} movimentações
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Média Diária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(analytics.media_diaria.valor)}
              </div>
              <p className="text-sm text-muted-foreground">
                {analytics.media_diaria.movimentacoes.toFixed(1)} movimentações/dia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eficiência de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {analytics.eficiencia_custos.score_eficiencia}%
              </div>
              <p className="text-sm text-muted-foreground">Score de eficiência</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Economia Potencial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.eficiencia_custos.economia_potencial)}
              </div>
              <p className="text-sm text-muted-foreground">Oportunidades identificadas</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Consumed Products */}
      {analytics && analytics.produtos_mais_consumidos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.BarChart3 className="h-5 w-5" />
              Produtos Mais Consumidos
            </CardTitle>
            <CardDescription>
              Análise detalhada dos produtos com maior consumo no período
            </CardDescription>
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
                  <TableHead>Custo Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.produtos_mais_consumidos.slice(0, 10).map((product) => (
                  <TableRow key={product.produto_id}>
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
                        {getTrendIcon(product.tendencia_mensal)}
                        <span className="text-sm">
                          {formatPercentage(product.variacao_percentual)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(product.custo_medio_unitario)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Consumption Trends */}
      {analytics && analytics.tendencias.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.TrendingUp className="h-5 w-5" />
              Tendências de Consumo
            </CardTitle>
            <CardDescription>Evolução do consumo ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.tendencias.map((trend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{trend.periodo}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(trend.valor_consumido)} • {trend.quantidade_consumida}{" "}
                      unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      {trend.variacao_valor >= 0 ? (
                        <Icons.TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <Icons.TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          trend.variacao_valor >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formatPercentage(Math.abs(trend.variacao_valor))}
                      </span>
                    </div>
                    <Badge variant="secondary">Score: {trend.eficiencia_score}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Optimization Opportunities */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Lightbulb className="h-5 w-5" />
              Oportunidades de Otimização
            </CardTitle>
            <CardDescription>
              Recomendações para redução de custos e melhoria de eficiência
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{opportunity.descricao}</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getComplexityColor(opportunity.complexidade)}>
                          {opportunity.complexidade} complexidade
                        </Badge>
                        <Badge variant="outline">{opportunity.prazo_implementacao} dias</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Impacto: {opportunity.impacto_operacional}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(opportunity.economia_estimada)}
                      </div>
                      <p className="text-sm text-muted-foreground">Economia estimada</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      <Icons.ArrowRight className="w-4 h-4 mr-1" />
                      Implementar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consumption Forecasts */}
      {forecasts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.Crystal className="h-5 w-5" />
              Previsão de Consumo
            </CardTitle>
            <CardDescription>Previsões de consumo para os próximos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Previsão Quantidade</TableHead>
                  <TableHead>Previsão Valor</TableHead>
                  <TableHead>Confiança</TableHead>
                  <TableHead>Recomendação Compra</TableHead>
                  <TableHead>Economia Esperada</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.slice(0, 5).map((forecast) => (
                  <TableRow key={forecast.produto_id}>
                    <TableCell className="font-medium">{forecast.nome_produto}</TableCell>
                    <TableCell>{forecast.previsao_quantidade.toFixed(0)}</TableCell>
                    <TableCell>{formatCurrency(forecast.previsao_valor)}</TableCell>
                    <TableCell>
                      <Badge variant={forecast.confianca_previsao >= 75 ? "default" : "secondary"}>
                        {forecast.confianca_previsao}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {forecast.recomendacao_compra.quantidade_recomendada.toFixed(0)} unidades
                      <br />
                      <span className="text-sm text-muted-foreground">
                        em {forecast.recomendacao_compra.prazo_compra_ideal} dias
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(forecast.recomendacao_compra.economia_esperada)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {analytics && analytics.alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.AlertTriangle className="h-5 w-5" />
              Alertas de Consumo
            </CardTitle>
            <CardDescription>Alertas e anomalias detectadas no consumo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.alertas.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icons.AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{alert.descricao}</p>
                      <p className="text-sm text-muted-foreground">{alert.acao_recomendada}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={alert.gravidade === "alta" ? "destructive" : "secondary"}>
                      {alert.gravidade}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatCurrency(alert.valor_impacto)}
                    </p>
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
