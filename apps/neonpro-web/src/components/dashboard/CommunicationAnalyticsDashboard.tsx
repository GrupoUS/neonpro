"use client";

import type { format, subDays } from "date-fns";
import type { ptBR } from "date-fns/locale";
import type {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Mail,
  MessageCircle,
  MessageSquare,
  Minus,
  MousePointer,
  Phone,
  PieChart as PieChartIcon,
  Reply,
  Send,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import type {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Badge } from "@/components/ui/badge";
import type { Button } from "@/components/ui/button";
import type {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import type { Icons } from "@/components/ui/icons";
import type { Progress } from "@/components/ui/progress";
import type {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Separator } from "@/components/ui/separator";
import type { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { communicationAnalytics } from "@/lib/communication-analytics/analytics-engine";
import type {
  AnalyticsDashboard,
  AnalyticsFilter,
  BenchmarkComparison,
  ChannelPerformance,
  ROIMetrics,
  TrendAnalysis,
} from "@/lib/communication-analytics/types/analytics";

interface CommunicationAnalyticsDashboardProps {
  clinicId: string;
  userRole: "admin" | "manager" | "staff";
}

const CHANNEL_COLORS = {
  email: "#3B82F6", // blue-500
  sms: "#10B981", // emerald-500
  whatsapp: "#059669", // emerald-600
  push: "#8B5CF6", // violet-500
  voice: "#F59E0B", // amber-500
};

const CHART_COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#EC4899",
  "#6366F1",
];

export function CommunicationAnalyticsDashboard({
  clinicId,
  userRole,
}: CommunicationAnalyticsDashboardProps) {
  // Estado do dashboard
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboard | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["all"]);
  const [viewMode, setViewMode] = useState<"overview" | "detailed" | "comparison">("overview");

  // Função para carregar dados do dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filter: AnalyticsFilter = {
        clinicId,
        dateRange: {
          start: dateRange.from,
          end: dateRange.to,
        },
        channels: selectedChannels.includes("all") ? undefined : selectedChannels,
      };

      const data = await communicationAnalytics.getDashboardData(filter);
      setDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando filtros mudarem
  useEffect(() => {
    loadDashboardData();
  }, [clinicId, dateRange, selectedChannels]);

  // Função para atualizar timeframe predefinido
  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);

    const now = new Date();
    let from: Date;

    switch (timeframe) {
      case "7d":
        from = subDays(now, 7);
        break;
      case "30d":
        from = subDays(now, 30);
        break;
      case "90d":
        from = subDays(now, 90);
        break;
      case "1y":
        from = subDays(now, 365);
        break;
      default:
        from = subDays(now, 30);
    }

    setDateRange({ from, to: now });
  };

  // Métricas calculadas
  const calculatedMetrics = useMemo(() => {
    if (!dashboardData) return null;

    const { overview, channelPerformance, roiMetrics, trends } = dashboardData;

    return {
      totalRevenue: roiMetrics.totalRevenue,
      totalCost: roiMetrics.totalCost,
      profit: roiMetrics.totalRevenue - roiMetrics.totalCost,
      avgROI: roiMetrics.roi,
      bestChannel: channelPerformance.reduce((best, current) =>
        current.roi > best.roi ? current : best,
      ),
      worstChannel: channelPerformance.reduce((worst, current) =>
        current.roi < worst.roi ? current : worst,
      ),
      totalMessages: overview.totalMessages,
      avgEngagement: overview.engagementScore,
    };
  }, [dashboardData]);

  // Componente de loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Icons.spinner className="w-4 h-4 animate-spin" />
          <span>Carregando analytics...</span>
        </div>
      </div>
    );
  }

  // Componente de erro
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span>Erro ao carregar analytics: {error}</span>
          </div>
          <Button onClick={loadDashboardData} variant="outline" size="sm" className="mt-4">
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData || !calculatedMetrics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics de Comunicação</h1>
          <p className="text-muted-foreground">
            Insights executivos sobre performance de comunicação
          </p>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          {/* Seletor de timeframe */}
          <Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>

          {/* Date range picker */}
          <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />

          {/* Botão de atualização */}
          <Button onClick={loadDashboardData} variant="outline" size="sm">
            <Icons.refresh className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={calculatedMetrics.totalRevenue}
          format="currency"
          trend={dashboardData.trends.revenueGrowth}
          icon={<DollarSign className="w-4 h-4" />}
          color="text-green-600"
        />

        <MetricCard
          title="Custo Total"
          value={calculatedMetrics.totalCost}
          format="currency"
          trend={dashboardData.trends.costGrowth}
          icon={<Target className="w-4 h-4" />}
          color="text-red-600"
        />

        <MetricCard
          title="ROI Médio"
          value={calculatedMetrics.avgROI}
          format="percentage"
          trend={dashboardData.trends.roiGrowth}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-blue-600"
        />

        <MetricCard
          title="Mensagens Enviadas"
          value={calculatedMetrics.totalMessages}
          format="number"
          trend={dashboardData.trends.volumeGrowth}
          icon={<MessageCircle className="w-4 h-4" />}
          color="text-purple-600"
        />
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Detalhado</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de tendência de receita */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Tendência de Receita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: ptBR })}
                    />
                    <YAxis tickFormatter={(value) => `R$ ${value.toLocaleString()}`} />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
                      }
                      formatter={(value: any) => [`R$ ${value.toLocaleString()}`, "Receita"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por canal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4" />
                  Distribuição por Canal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashboardData.channelPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ channel, percentage }) => `${channel}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalMessages"
                    >
                      {dashboardData.channelPerformance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            CHANNEL_COLORS[entry.channel as keyof typeof CHANNEL_COLORS] ||
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value.toLocaleString(), "Mensagens"]} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance por canal */}
          <Card>
            <CardHeader>
              <CardTitle>Performance por Canal</CardTitle>
              <CardDescription>Métricas detalhadas de engajamento e conversão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.channelPerformance.map((channel) => (
                  <ChannelPerformanceCard key={channel.channel} performance={channel} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Tab */}
        <TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* ROI Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <ROIMetricsDisplay metrics={dashboardData.roiMetrics} />
              </CardContent>
            </Card>

            {/* Engagement Deep Dive */}
            <Card>
              <CardHeader>
                <CardTitle>Análise de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashboardData.channelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="openRate" fill="#3B82F6" name="Taxa de Abertura %" />
                    <Bar dataKey="clickThroughRate" fill="#10B981" name="Taxa de Clique %" />
                    <Bar dataKey="responseRate" fill="#F59E0B" name="Taxa de Resposta %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Trends Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Tendências</CardTitle>
              <CardDescription>
                Insights sobre crescimento e padrões comportamentais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrendsAnalysisDisplay trends={dashboardData.trends} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-4">
          {dashboardData.benchmarkComparison && (
            <Card>
              <CardHeader>
                <CardTitle>Comparação com Benchmarks</CardTitle>
                <CardDescription>Performance versus médias da indústria</CardDescription>
              </CardHeader>
              <CardContent>
                <BenchmarkComparisonDisplay comparison={dashboardData.benchmarkComparison} />
              </CardContent>
            </Card>
          )}

          {/* Forecasting */}
          {dashboardData.forecasting && (
            <Card>
              <CardHeader>
                <CardTitle>Projeções</CardTitle>
                <CardDescription>Previsões baseadas em tendências históricas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.forecasting.nextMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "dd/MM", { locale: ptBR })}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "dd/MM/yyyy", { locale: ptBR })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedRevenue"
                      stroke="#8B5CF6"
                      strokeDasharray="5 5"
                      name="Receita Projetada"
                    />
                    <Line
                      type="monotone"
                      dataKey="predictedMessages"
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      name="Mensagens Projetadas"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Quality Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Score de Qualidade dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Progress value={dashboardData.overview.dataQualityScore} className="h-2" />
            </div>
            <Badge
              variant={
                dashboardData.overview.dataQualityScore >= 90
                  ? "default"
                  : dashboardData.overview.dataQualityScore >= 70
                    ? "secondary"
                    : "destructive"
              }
              className="ml-4"
            >
              {dashboardData.overview.dataQualityScore.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Confiança: {dashboardData.overview.confidence.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente para exibir métricas principais
interface MetricCardProps {
  title: string;
  value: number;
  format: "currency" | "percentage" | "number";
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, format, trend, icon, color }: MetricCardProps) {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case "currency":
        return `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
        return val.toLocaleString("pt-BR");
      default:
        return val.toString();
    }
  };

  const getTrendIcon = (trendValue?: number) => {
    if (!trendValue) return <Minus className="w-3 h-3" />;
    if (trendValue > 0) return <ArrowUpRight className="w-3 h-3 text-green-600" />;
    if (trendValue < 0) return <ArrowDownRight className="w-3 h-3 text-red-600" />;
    return <Minus className="w-3 h-3" />;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={color}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value, format)}</div>
        {trend !== undefined && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            {getTrendIcon(trend)}
            <span className="ml-1">
              {trend > 0 ? "+" : ""}
              {trend.toFixed(1)}% vs período anterior
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para performance de canal
function ChannelPerformanceCard({ performance }: { performance: ChannelPerformance }) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "sms":
        return <MessageSquare className="w-4 h-4" />;
      case "whatsapp":
        return <MessageCircle className="w-4 h-4" />;
      case "push":
        return <Send className="w-4 h-4" />;
      case "voice":
        return <Phone className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const channelColor =
    CHANNEL_COLORS[performance.channel as keyof typeof CHANNEL_COLORS] || "#6B7280";

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${channelColor}20`, color: channelColor }}
        >
          {getChannelIcon(performance.channel)}
        </div>
        <div>
          <h4 className="font-semibold capitalize">{performance.channel}</h4>
          <p className="text-sm text-muted-foreground">
            {performance.totalMessages.toLocaleString()} mensagens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <div className="text-sm font-medium">{performance.deliveryRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Entrega</div>
        </div>
        <div>
          <div className="text-sm font-medium">{performance.openRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Abertura</div>
        </div>
        <div>
          <div className="text-sm font-medium">{performance.responseRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Resposta</div>
        </div>
        <div>
          <div className="text-sm font-medium">{performance.roi.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">ROI</div>
        </div>
      </div>
    </div>
  );
}

// Componente para exibir métricas de ROI
function ROIMetricsDisplay({ metrics }: { metrics: ROIMetrics }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            R$ {metrics.totalRevenue.toLocaleString("pt-BR")}
          </div>
          <div className="text-sm text-green-600">Receita Total</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            R$ {metrics.totalCost.toLocaleString("pt-BR")}
          </div>
          <div className="text-sm text-red-600">Custo Total</div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>ROI Geral</span>
          <Badge variant={metrics.roi > 0 ? "default" : "destructive"}>
            {metrics.roi.toFixed(1)}%
          </Badge>
        </div>
        <div className="flex justify-between">
          <span>Break-even Point</span>
          <span>{metrics.breakEvenPoint.toLocaleString()} mensagens</span>
        </div>
        <div className="flex justify-between">
          <span>Payback Period</span>
          <span>{metrics.paybackPeriod} dias</span>
        </div>
        <div className="flex justify-between">
          <span>Valor por Conversão</span>
          <span>R$ {metrics.conversionValue.toLocaleString("pt-BR")}</span>
        </div>
      </div>
    </div>
  );
}

// Componente para análise de tendências
function TrendsAnalysisDisplay({ trends }: { trends: TrendAnalysis }) {
  const getTrendBadge = (value: number, label: string) => {
    const variant = value > 5 ? "default" : value < -5 ? "destructive" : "secondary";
    const icon =
      value > 0 ? (
        <TrendingUp className="w-3 h-3" />
      ) : value < 0 ? (
        <TrendingDown className="w-3 h-3" />
      ) : (
        <Minus className="w-3 h-3" />
      );

    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="text-sm">{label}</span>
        <Badge variant={variant} className="flex items-center gap-1">
          {icon}
          {value > 0 ? "+" : ""}
          {value.toFixed(1)}%
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {getTrendBadge(trends.volumeGrowth, "Crescimento de Volume")}
      {getTrendBadge(trends.engagementGrowth, "Crescimento de Engajement")}
      {getTrendBadge(trends.revenueGrowth, "Crescimento de Receita")}
      {getTrendBadge(trends.costGrowth, "Crescimento de Custo")}
      {getTrendBadge(trends.roiGrowth, "Crescimento de ROI")}
    </div>
  );
}

// Componente para comparação com benchmarks
function BenchmarkComparisonDisplay({ comparison }: { comparison: BenchmarkComparison }) {
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{comparison.overallScore.toFixed(1)}</div>
        <div className="text-sm text-blue-600">Score vs Benchmarks</div>
        <Badge
          variant={
            comparison.industryRanking === "excellent"
              ? "default"
              : comparison.industryRanking === "good"
                ? "secondary"
                : "destructive"
          }
          className="mt-2"
        >
          {comparison.industryRanking === "excellent"
            ? "Excelente"
            : comparison.industryRanking === "good"
              ? "Bom"
              : comparison.industryRanking === "average"
                ? "Médio"
                : comparison.industryRanking === "below_average"
                  ? "Abaixo da Média"
                  : "Ruim"}
        </Badge>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Recomendações</h4>
        <ul className="space-y-1">
          {comparison.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <CheckCircle className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
