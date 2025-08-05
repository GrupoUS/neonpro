"use client";
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return (v) => step([n, v]);
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommunicationAnalyticsDashboard = CommunicationAnalyticsDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var date_picker_with_range_1 = require("@/components/ui/date-picker-with-range");
var icons_1 = require("@/components/ui/icons");
var separator_1 = require("@/components/ui/separator");
var recharts_1 = require("recharts");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var lucide_react_1 = require("lucide-react");
var analytics_engine_1 = require("@/lib/communication-analytics/analytics-engine");
var CHANNEL_COLORS = {
  email: "#3B82F6", // blue-500
  sms: "#10B981", // emerald-500
  whatsapp: "#059669", // emerald-600
  push: "#8B5CF6", // violet-500
  voice: "#F59E0B", // amber-500
};
var CHART_COLORS = [
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
function CommunicationAnalyticsDashboard(_a) {
  var clinicId = _a.clinicId,
    userRole = _a.userRole;
  // Estado do dashboard
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)(null),
    dashboardData = _d[0],
    setDashboardData = _d[1];
  var _e = (0, react_1.useState)("30d"),
    selectedTimeframe = _e[0],
    setSelectedTimeframe = _e[1];
  var _f = (0, react_1.useState)({
      from: (0, date_fns_1.subDays)(new Date(), 30),
      to: new Date(),
    }),
    dateRange = _f[0],
    setDateRange = _f[1];
  var _g = (0, react_1.useState)(["all"]),
    selectedChannels = _g[0],
    setSelectedChannels = _g[1];
  var _h = (0, react_1.useState)("overview"),
    viewMode = _h[0],
    setViewMode = _h[1];
  // Função para carregar dados do dashboard
  var loadDashboardData = () =>
    __awaiter(this, void 0, void 0, function () {
      var filter, data, err_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            setError(null);
            filter = {
              clinicId: clinicId,
              dateRange: {
                start: dateRange.from,
                end: dateRange.to,
              },
              channels: selectedChannels.includes("all") ? undefined : selectedChannels,
            };
            return [
              4 /*yield*/,
              analytics_engine_1.communicationAnalytics.getDashboardData(filter),
            ];
          case 1:
            data = _a.sent();
            setDashboardData(data);
            return [3 /*break*/, 4];
          case 2:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "Erro ao carregar dados");
            return [3 /*break*/, 4];
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Carregar dados quando filtros mudarem
  (0, react_1.useEffect)(() => {
    loadDashboardData();
  }, [clinicId, dateRange, selectedChannels]);
  // Função para atualizar timeframe predefinido
  var handleTimeframeChange = (timeframe) => {
    setSelectedTimeframe(timeframe);
    var now = new Date();
    var from;
    switch (timeframe) {
      case "7d":
        from = (0, date_fns_1.subDays)(now, 7);
        break;
      case "30d":
        from = (0, date_fns_1.subDays)(now, 30);
        break;
      case "90d":
        from = (0, date_fns_1.subDays)(now, 90);
        break;
      case "1y":
        from = (0, date_fns_1.subDays)(now, 365);
        break;
      default:
        from = (0, date_fns_1.subDays)(now, 30);
    }
    setDateRange({ from: from, to: now });
  };
  // Métricas calculadas
  var calculatedMetrics = (0, react_1.useMemo)(() => {
    if (!dashboardData) return null;
    var overview = dashboardData.overview,
      channelPerformance = dashboardData.channelPerformance,
      roiMetrics = dashboardData.roiMetrics,
      trends = dashboardData.trends;
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
          <icons_1.Icons.spinner className="w-4 h-4 animate-spin" />
          <span>Carregando analytics...</span>
        </div>
      </div>
    );
  }
  // Componente de erro
  if (error) {
    return (
      <card_1.Card className="border-red-200 bg-red-50">
        <card_1.CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <lucide_react_1.AlertTriangle className="w-4 h-4" />
            <span>Erro ao carregar analytics: {error}</span>
          </div>
          <button_1.Button onClick={loadDashboardData} variant="outline" size="sm" className="mt-4">
            Tentar novamente
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!dashboardData || !calculatedMetrics) {
    return (
      <card_1.Card>
        <card_1.CardContent className="pt-6">
          <p className="text-muted-foreground">
            Nenhum dado disponível para o período selecionado.
          </p>
        </card_1.CardContent>
      </card_1.Card>
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
          <select_1.Select value={selectedTimeframe} onValueChange={handleTimeframeChange}>
            <select_1.SelectTrigger className="w-[140px]">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="7d">Últimos 7 dias</select_1.SelectItem>
              <select_1.SelectItem value="30d">Últimos 30 dias</select_1.SelectItem>
              <select_1.SelectItem value="90d">Últimos 90 dias</select_1.SelectItem>
              <select_1.SelectItem value="1y">Último ano</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          {/* Date range picker */}
          <date_picker_with_range_1.DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />

          {/* Botão de atualização */}
          <button_1.Button onClick={loadDashboardData} variant="outline" size="sm">
            <icons_1.Icons.refresh className="w-4 h-4 mr-2" />
            Atualizar
          </button_1.Button>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Total"
          value={calculatedMetrics.totalRevenue}
          format="currency"
          trend={dashboardData.trends.revenueGrowth}
          icon={<lucide_react_1.DollarSign className="w-4 h-4" />}
          color="text-green-600"
        />

        <MetricCard
          title="Custo Total"
          value={calculatedMetrics.totalCost}
          format="currency"
          trend={dashboardData.trends.costGrowth}
          icon={<lucide_react_1.Target className="w-4 h-4" />}
          color="text-red-600"
        />

        <MetricCard
          title="ROI Médio"
          value={calculatedMetrics.avgROI}
          format="percentage"
          trend={dashboardData.trends.roiGrowth}
          icon={<lucide_react_1.TrendingUp className="w-4 h-4" />}
          color="text-blue-600"
        />

        <MetricCard
          title="Mensagens Enviadas"
          value={calculatedMetrics.totalMessages}
          format="number"
          trend={dashboardData.trends.volumeGrowth}
          icon={<lucide_react_1.MessageCircle className="w-4 h-4" />}
          color="text-purple-600"
        />
      </div>

      {/* Tabs para diferentes visualizações */}
      <tabs_1.Tabs value={viewMode} onValueChange={(value) => setViewMode(value)}>
        <tabs_1.TabsList className="grid w-full grid-cols-3">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="detailed">Detalhado</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="comparison">Comparação</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Gráfico de tendência de receita */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="w-4 h-4" />
                  Tendência de Receita
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={dashboardData.timeSeriesData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        (0, date_fns_1.format)(new Date(date), "dd/MM", {
                          locale: locale_1.ptBR,
                        })
                      }
                    />
                    <recharts_1.YAxis
                      tickFormatter={(value) => "R$ ".concat(value.toLocaleString())}
                    />
                    <recharts_1.Tooltip
                      labelFormatter={(date) =>
                        (0, date_fns_1.format)(new Date(date), "dd/MM/yyyy", {
                          locale: locale_1.ptBR,
                        })
                      }
                      formatter={(value) => ["R$ ".concat(value.toLocaleString()), "Receita"]}
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      dot={{ fill: "#3B82F6" }}
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Distribuição por canal */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.PieChart className="w-4 h-4" />
                  Distribuição por Canal
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={dashboardData.channelPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(_a) => {
                        var channel = _a.channel,
                          percentage = _a.percentage;
                        return "".concat(channel, ": ").concat(percentage.toFixed(1), "%");
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalMessages"
                    >
                      {dashboardData.channelPerformance.map((entry, index) => (
                        <recharts_1.Cell
                          key={"cell-".concat(index)}
                          fill={
                            CHANNEL_COLORS[entry.channel] ||
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip
                      formatter={(value) => [value.toLocaleString(), "Mensagens"]}
                    />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Performance por canal */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance por Canal</card_1.CardTitle>
              <card_1.CardDescription>
                Métricas detalhadas de engajamento e conversão
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {dashboardData.channelPerformance.map((channel) => (
                  <ChannelPerformanceCard key={channel.channel} performance={channel} />
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Detailed Tab */}
        <tabs_1.TabsContent value="detailed" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* ROI Metrics */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Métricas de ROI</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <ROIMetricsDisplay metrics={dashboardData.roiMetrics} />
              </card_1.CardContent>
            </card_1.Card>

            {/* Engagement Deep Dive */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Análise de Engajamento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={dashboardData.channelPerformance}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="channel" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="openRate" fill="#3B82F6" name="Taxa de Abertura %" />
                    <recharts_1.Bar
                      dataKey="clickThroughRate"
                      fill="#10B981"
                      name="Taxa de Clique %"
                    />
                    <recharts_1.Bar
                      dataKey="responseRate"
                      fill="#F59E0B"
                      name="Taxa de Resposta %"
                    />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Trends Analysis */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Análise de Tendências</card_1.CardTitle>
              <card_1.CardDescription>
                Insights sobre crescimento e padrões comportamentais
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <TrendsAnalysisDisplay trends={dashboardData.trends} />
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Comparison Tab */}
        <tabs_1.TabsContent value="comparison" className="space-y-4">
          {dashboardData.benchmarkComparison && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Comparação com Benchmarks</card_1.CardTitle>
                <card_1.CardDescription>
                  Performance versus médias da indústria
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <BenchmarkComparisonDisplay comparison={dashboardData.benchmarkComparison} />
              </card_1.CardContent>
            </card_1.Card>
          )}

          {/* Forecasting */}
          {dashboardData.forecasting && (
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Projeções</card_1.CardTitle>
                <card_1.CardDescription>
                  Previsões baseadas em tendências históricas
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={dashboardData.forecasting.nextMonth}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        (0, date_fns_1.format)(new Date(date), "dd/MM", {
                          locale: locale_1.ptBR,
                        })
                      }
                    />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip
                      labelFormatter={(date) =>
                        (0, date_fns_1.format)(new Date(date), "dd/MM/yyyy", {
                          locale: locale_1.ptBR,
                        })
                      }
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="predictedRevenue"
                      stroke="#8B5CF6"
                      strokeDasharray="5 5"
                      name="Receita Projetada"
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="predictedMessages"
                      stroke="#10B981"
                      strokeDasharray="5 5"
                      name="Mensagens Projetadas"
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>

      {/* Quality Score */}
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.Star className="w-4 h-4" />
            Score de Qualidade dos Dados
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <progress_1.Progress
                value={dashboardData.overview.dataQualityScore}
                className="h-2"
              />
            </div>
            <badge_1.Badge
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
            </badge_1.Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Confiança: {dashboardData.overview.confidence.toFixed(1)}%
          </p>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
function MetricCard(_a) {
  var title = _a.title,
    value = _a.value,
    format = _a.format,
    trend = _a.trend,
    icon = _a.icon,
    color = _a.color;
  var formatValue = (val, fmt) => {
    switch (fmt) {
      case "currency":
        return "R$ ".concat(val.toLocaleString("pt-BR", { minimumFractionDigits: 2 }));
      case "percentage":
        return "".concat(val.toFixed(1), "%");
      case "number":
        return val.toLocaleString("pt-BR");
      default:
        return val.toString();
    }
  };
  var getTrendIcon = (trendValue) => {
    if (!trendValue) return <lucide_react_1.Minus className="w-3 h-3" />;
    if (trendValue > 0) return <lucide_react_1.ArrowUpRight className="w-3 h-3 text-green-600" />;
    if (trendValue < 0) return <lucide_react_1.ArrowDownRight className="w-3 h-3 text-red-600" />;
    return <lucide_react_1.Minus className="w-3 h-3" />;
  };
  return (
    <card_1.Card>
      <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <card_1.CardTitle className="text-sm font-medium">{title}</card_1.CardTitle>
        <div className={color}>{icon}</div>
      </card_1.CardHeader>
      <card_1.CardContent>
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
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Componente para performance de canal
function ChannelPerformanceCard(_a) {
  var performance = _a.performance;
  var getChannelIcon = (channel) => {
    switch (channel) {
      case "email":
        return <lucide_react_1.Mail className="w-4 h-4" />;
      case "sms":
        return <lucide_react_1.MessageSquare className="w-4 h-4" />;
      case "whatsapp":
        return <lucide_react_1.MessageCircle className="w-4 h-4" />;
      case "push":
        return <lucide_react_1.Send className="w-4 h-4" />;
      case "voice":
        return <lucide_react_1.Phone className="w-4 h-4" />;
      default:
        return <lucide_react_1.MessageCircle className="w-4 h-4" />;
    }
  };
  var channelColor = CHANNEL_COLORS[performance.channel] || "#6B7280";
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className="p-2 rounded-lg"
          style={{ backgroundColor: "".concat(channelColor, "20"), color: channelColor }}
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
function ROIMetricsDisplay(_a) {
  var metrics = _a.metrics;
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

      <separator_1.Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>ROI Geral</span>
          <badge_1.Badge variant={metrics.roi > 0 ? "default" : "destructive"}>
            {metrics.roi.toFixed(1)}%
          </badge_1.Badge>
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
function TrendsAnalysisDisplay(_a) {
  var trends = _a.trends;
  var getTrendBadge = (value, label) => {
    var variant = value > 5 ? "default" : value < -5 ? "destructive" : "secondary";
    var icon =
      value > 0
        ? <lucide_react_1.TrendingUp className="w-3 h-3" />
        : value < 0
          ? <lucide_react_1.TrendingDown className="w-3 h-3" />
          : <lucide_react_1.Minus className="w-3 h-3" />;
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <span className="text-sm">{label}</span>
        <badge_1.Badge variant={variant} className="flex items-center gap-1">
          {icon}
          {value > 0 ? "+" : ""}
          {value.toFixed(1)}%
        </badge_1.Badge>
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
function BenchmarkComparisonDisplay(_a) {
  var comparison = _a.comparison;
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{comparison.overallScore.toFixed(1)}</div>
        <div className="text-sm text-blue-600">Score vs Benchmarks</div>
        <badge_1.Badge
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
        </badge_1.Badge>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Recomendações</h4>
        <ul className="space-y-1">
          {comparison.recommendations.map((rec, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <lucide_react_1.CheckCircle className="w-3 h-3 mt-1 text-green-600 flex-shrink-0" />
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
