/**
 * Search Analytics Dashboard
 * Story 3.4: Smart Search + NLP Integration - Task 6
 * Comprehensive analytics and performance monitoring dashboard
 */

"use client";

import type {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Filter,
  Lightbulb,
  Loader2,
  MousePointer,
  RefreshCw,
  Search,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import type {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Alert, AlertDescription } from "@/components/ui/alert";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DatePickerWithRange } from "@/components/ui/date-range-picker";
import type { Progress } from "@/components/ui/progress";
import type { ScrollArea } from "@/components/ui/scroll-area";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  AnalyticsOptions,
  PerformanceAlert,
  SearchMetrics,
  SearchOptimization,
  searchAnalytics,
} from "@/lib/search/search-analytics";
import type { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  userId?: string;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  warning: "#f97316",
  muted: "#6b7280",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function AnalyticsDashboard({
  userId,
  className,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: AnalyticsDashboardProps) {
  // State
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [optimizations, setOptimizations] = useState<SearchOptimization[]>([]);
  const [trends, setTrends] = useState<Array<{ date: string; metrics: Partial<SearchMetrics> }>>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [selectedSearchType, setSelectedSearchType] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [realTimeMetrics, setRealTimeMetrics] = useState<Partial<SearchMetrics>>({});

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const options: AnalyticsOptions = {
        timeRange: selectedTimeRange
          ? {
              start: selectedTimeRange.from!,
              end: selectedTimeRange.to!,
            }
          : undefined,
        userId,
        searchType: selectedSearchType === "all" ? undefined : selectedSearchType,
        includeAnonymous: true,
      };

      const [metricsData, alertsData, optimizationsData, reportData] = await Promise.all([
        searchAnalytics.getSearchMetrics(options),
        searchAnalytics.getPerformanceAlerts(false),
        searchAnalytics.getOptimizationSuggestions(),
        searchAnalytics.generatePerformanceReport(options),
      ]);

      setMetrics(metricsData);
      setAlerts(alertsData);
      setOptimizations(optimizationsData);
      setTrends(reportData.trends);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar analytics");
    } finally {
      setLoading(false);
    }
  }, [selectedTimeRange, selectedSearchType, userId]);

  // Initial load and auto-refresh
  useEffect(() => {
    loadAnalytics();

    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAnalytics, refreshInterval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadAnalytics, autoRefresh, refreshInterval]);

  // Subscribe to real-time alerts
  useEffect(() => {
    const unsubscribe = searchAnalytics.onPerformanceAlert((alert) => {
      setAlerts((prev) => [alert, ...prev]);

      // Show notification (could integrate with toast system)
      console.log("New performance alert:", alert);
    });

    return unsubscribe;
  }, []);

  // Format numbers
  const formatNumber = (num: number, decimals: number = 0): string => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  // Format percentage
  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Get trend indicator
  const getTrendIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 bg-red-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading && !metrics) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={loadAnalytics} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics de Busca</h2>
          <p className="text-muted-foreground">Monitoramento de performance e métricas de uso</p>
        </div>

        <div className="flex items-center gap-2">
          <DatePickerWithRange date={selectedTimeRange} onDateChange={setSelectedTimeRange} />

          <Select value={selectedSearchType} onValueChange={setSelectedSearchType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tipo de busca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="comprehensive">Busca Abrangente</SelectItem>
              <SelectItem value="voice">Busca por Voz</SelectItem>
              <SelectItem value="autocomplete">Autocompletar</SelectItem>
              <SelectItem value="segmentation">Segmentação</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter((a) => a.severity === "critical").length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>
              {alerts.filter((a) => a.severity === "critical").length} alertas críticos
            </strong>{" "}
            detectados. Ação imediata necessária.
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Buscas</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalSearches || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Últimos{" "}
              {selectedTimeRange
                ? Math.ceil(
                    (selectedTimeRange.to!.getTime() - selectedTimeRange.from!.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : 30}{" "}
              dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics?.averageResponseTime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(metrics?.successRate || 0)}</div>
            <Progress value={(metrics?.successRate || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(metrics?.userEngagement.clickThroughRate || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Engajamento do usuário</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="usage">Uso</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="optimizations">Otimizações</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Response Time Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Tendência de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: number) => [formatDuration(value), "Tempo de Resposta"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="metrics.averageResponseTime"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Search Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribuição por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.searchTypes || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metrics?.searchTypes || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Popular Queries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Consultas Mais Populares
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(metrics?.popularQueries || []).slice(0, 10).map((query, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium truncate">{query.query}</div>
                      <div className="text-sm text-muted-foreground">
                        {query.count} buscas • {formatDuration(query.avgResponseTime)} médio
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{formatPercentage(query.successRate)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Breakdown de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Processamento NLP</span>
                      <span>
                        {formatDuration(metrics?.performanceBreakdown.nlpProcessing || 0)}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((metrics?.performanceBreakdown.nlpProcessing || 0) /
                          (metrics?.performanceBreakdown.total || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Consulta ao Banco</span>
                      <span>
                        {formatDuration(metrics?.performanceBreakdown.databaseQuery || 0)}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((metrics?.performanceBreakdown.databaseQuery || 0) /
                          (metrics?.performanceBreakdown.total || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Processamento de Resultados</span>
                      <span>
                        {formatDuration(metrics?.performanceBreakdown.resultProcessing || 0)}
                      </span>
                    </div>
                    <Progress
                      value={
                        ((metrics?.performanceBreakdown.resultProcessing || 0) /
                          (metrics?.performanceBreakdown.total || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Taxa de Sucesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <Tooltip
                      formatter={(value: number) => [formatPercentage(value), "Taxa de Sucesso"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="metrics.successRate"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engajamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Cliques</span>
                  <span className="font-medium">
                    {formatPercentage(metrics?.userEngagement.clickThroughRate || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resultados Visualizados</span>
                  <span className="font-medium">
                    {formatNumber(metrics?.userEngagement.averageResultsViewed || 0, 1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Refinamento</span>
                  <span className="font-medium">
                    {formatPercentage(metrics?.userEngagement.refinementRate || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Volume de Buscas por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={metrics?.searchTypes || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Alertas de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>Nenhum alerta ativo</p>
                    </div>
                  ) : (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          getAlertSeverityColor(alert.severity),
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString("pt-BR")}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{alert.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Limite: {alert.threshold} | Atual: {alert.currentValue}
                            </p>
                          </div>
                          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Optimizations Tab */}
        <TabsContent value="optimizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Sugestões de Otimização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-2" />
                    <p>Nenhuma otimização sugerida no momento</p>
                  </div>
                ) : (
                  optimizations.map((optimization, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{optimization.optimization.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Padrão: {optimization.queryPattern}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {formatPercentage(optimization.impact.potentialSpeedup)} melhoria
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Consultas Afetadas:</span>
                          <div className="font-medium">{optimization.impact.affectedQueries}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Confiança:</span>
                          <div className="font-medium">
                            {formatPercentage(optimization.impact.confidenceScore)}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <div className="font-medium capitalize">
                            {optimization.optimization.type.replace("_", " ")}
                          </div>
                        </div>
                      </div>

                      {optimization.optimization.implementation && (
                        <div className="mt-3 p-2 bg-muted rounded text-xs font-mono">
                          {optimization.optimization.implementation}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compact analytics widget for integration
export function AnalyticsWidget({ className }: { className?: string }) {
  const [metrics, setMetrics] = useState<SearchMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await searchAnalytics.getSearchMetrics({
          timeRange: {
            start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
            end: new Date(),
          },
        });
        setMetrics(data);
      } catch (error) {
        console.error("Error loading analytics widget:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Analytics (24h)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Buscas</div>
            <div className="font-medium">{metrics?.totalSearches || 0}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Sucesso</div>
            <div className="font-medium">
              {metrics ? Math.round(metrics.successRate * 100) : 0}%
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Tempo Médio</div>
            <div className="font-medium">
              {metrics ? Math.round(metrics.averageResponseTime) : 0}ms
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">CTR</div>
            <div className="font-medium">
              {metrics ? Math.round(metrics.userEngagement.clickThroughRate * 100) : 0}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
