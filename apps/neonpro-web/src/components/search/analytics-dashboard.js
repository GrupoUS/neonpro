/**
 * Search Analytics Dashboard
 * Story 3.4: Smart Search + NLP Integration - Task 6
 * Comprehensive analytics and performance monitoring dashboard
 */
"use client";
"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
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
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
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
      return function (v) {
        return step([n, v]);
      };
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
  };
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsDashboard = AnalyticsDashboard;
exports.AnalyticsWidget = AnalyticsWidget;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var scroll_area_1 = require("@/components/ui/scroll-area");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var date_range_picker_1 = require("@/components/ui/date-range-picker");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var search_analytics_1 = require("@/lib/search/search-analytics");
var CHART_COLORS = {
  primary: "#3b82f6",
  secondary: "#10b981",
  accent: "#f59e0b",
  danger: "#ef4444",
  warning: "#f97316",
  muted: "#6b7280",
};
var PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
function AnalyticsDashboard(_a) {
  var _this = this;
  var userId = _a.userId,
    className = _a.className,
    _b = _a.autoRefresh,
    autoRefresh = _b === void 0 ? true : _b,
    _c = _a.refreshInterval, // 30 seconds
    refreshInterval = _c === void 0 ? 30000 : _c; // 30 seconds
  // State
  var _d = (0, react_1.useState)(null),
    metrics = _d[0],
    setMetrics = _d[1];
  var _e = (0, react_1.useState)([]),
    alerts = _e[0],
    setAlerts = _e[1];
  var _f = (0, react_1.useState)([]),
    optimizations = _f[0],
    setOptimizations = _f[1];
  var _g = (0, react_1.useState)([]),
    trends = _g[0],
    setTrends = _g[1];
  var _h = (0, react_1.useState)(true),
    loading = _h[0],
    setLoading = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  var _k = (0, react_1.useState)({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date(),
    }),
    selectedTimeRange = _k[0],
    setSelectedTimeRange = _k[1];
  var _l = (0, react_1.useState)("all"),
    selectedSearchType = _l[0],
    setSelectedSearchType = _l[1];
  var _m = (0, react_1.useState)("overview"),
    activeTab = _m[0],
    setActiveTab = _m[1];
  var _o = (0, react_1.useState)({}),
    realTimeMetrics = _o[0],
    setRealTimeMetrics = _o[1];
  // Load analytics data
  var loadAnalytics = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var options, _a, metricsData, alertsData, optimizationsData, reportData, err_1;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              options = {
                timeRange: selectedTimeRange
                  ? {
                      start: selectedTimeRange.from,
                      end: selectedTimeRange.to,
                    }
                  : undefined,
                userId: userId,
                searchType: selectedSearchType === "all" ? undefined : selectedSearchType,
                includeAnonymous: true,
              };
              return [
                4 /*yield*/,
                Promise.all([
                  search_analytics_1.searchAnalytics.getSearchMetrics(options),
                  search_analytics_1.searchAnalytics.getPerformanceAlerts(false),
                  search_analytics_1.searchAnalytics.getOptimizationSuggestions(),
                  search_analytics_1.searchAnalytics.generatePerformanceReport(options),
                ]),
              ];
            case 1:
              (_a = _b.sent()),
                (metricsData = _a[0]),
                (alertsData = _a[1]),
                (optimizationsData = _a[2]),
                (reportData = _a[3]);
              setMetrics(metricsData);
              setAlerts(alertsData);
              setOptimizations(optimizationsData);
              setTrends(reportData.trends);
              return [3 /*break*/, 4];
            case 2:
              err_1 = _b.sent();
              setError(err_1 instanceof Error ? err_1.message : "Erro ao carregar analytics");
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [selectedTimeRange, selectedSearchType, userId],
  );
  // Initial load and auto-refresh
  (0, react_1.useEffect)(
    function () {
      loadAnalytics();
      var interval;
      if (autoRefresh) {
        interval = setInterval(loadAnalytics, refreshInterval);
      }
      return function () {
        if (interval) {
          clearInterval(interval);
        }
      };
    },
    [loadAnalytics, autoRefresh, refreshInterval],
  );
  // Subscribe to real-time alerts
  (0, react_1.useEffect)(function () {
    var unsubscribe = search_analytics_1.searchAnalytics.onPerformanceAlert(function (alert) {
      setAlerts(function (prev) {
        return __spreadArray([alert], prev, true);
      });
      // Show notification (could integrate with toast system)
      console.log("New performance alert:", alert);
    });
    return unsubscribe;
  }, []);
  // Format numbers
  var formatNumber = function (num, decimals) {
    if (decimals === void 0) {
      decimals = 0;
    }
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };
  // Format duration
  var formatDuration = function (ms) {
    if (ms < 1000) return "".concat(Math.round(ms), "ms");
    return "".concat((ms / 1000).toFixed(1), "s");
  };
  // Format percentage
  var formatPercentage = function (value) {
    return "".concat(Math.round(value * 100), "%");
  };
  // Get trend indicator
  var getTrendIndicator = function (current, previous) {
    if (current > previous) {
      return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };
  // Get alert severity color
  var getAlertSeverityColor = function (severity) {
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
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <lucide_react_1.Loader2 className="h-6 w-6 animate-spin" />
            <span>Carregando analytics...</span>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="py-6">
          <alert_1.Alert variant="destructive">
            <lucide_react_1.AlertTriangle className="h-4 w-4" />
            <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
          </alert_1.Alert>
          <button_1.Button onClick={loadAnalytics} className="mt-4">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </button_1.Button>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics de Busca</h2>
          <p className="text-muted-foreground">Monitoramento de performance e métricas de uso</p>
        </div>

        <div className="flex items-center gap-2">
          <date_range_picker_1.DatePickerWithRange
            date={selectedTimeRange}
            onDateChange={setSelectedTimeRange}
          />

          <select_1.Select value={selectedSearchType} onValueChange={setSelectedSearchType}>
            <select_1.SelectTrigger className="w-48">
              <select_1.SelectValue placeholder="Tipo de busca" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="all">Todos os tipos</select_1.SelectItem>
              <select_1.SelectItem value="comprehensive">Busca Abrangente</select_1.SelectItem>
              <select_1.SelectItem value="voice">Busca por Voz</select_1.SelectItem>
              <select_1.SelectItem value="autocomplete">Autocompletar</select_1.SelectItem>
              <select_1.SelectItem value="segmentation">Segmentação</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loading}>
            {loading
              ? <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" />
              : <lucide_react_1.RefreshCw className="h-4 w-4" />}
          </button_1.Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {alerts.filter(function (a) {
        return a.severity === "critical";
      }).length > 0 && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <strong>
              {
                alerts.filter(function (a) {
                  return a.severity === "critical";
                }).length
              }{" "}
              alertas críticos
            </strong>{" "}
            detectados. Ação imediata necessária.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Total de Buscas</card_1.CardTitle>
            <lucide_react_1.Search className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(
                (metrics === null || metrics === void 0 ? void 0 : metrics.totalSearches) || 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos{" "}
              {selectedTimeRange
                ? Math.ceil(
                    (selectedTimeRange.to.getTime() - selectedTimeRange.from.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                : 30}{" "}
              dias
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Tempo de Resposta</card_1.CardTitle>
            <lucide_react_1.Clock className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(
                (metrics === null || metrics === void 0 ? void 0 : metrics.averageResponseTime) ||
                  0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Sucesso</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                (metrics === null || metrics === void 0 ? void 0 : metrics.successRate) || 0,
              )}
            </div>
            <progress_1.Progress
              value={
                ((metrics === null || metrics === void 0 ? void 0 : metrics.successRate) || 0) * 100
              }
              className="mt-2"
            />
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Taxa de Cliques</card_1.CardTitle>
            <lucide_react_1.MousePointer className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {formatPercentage(
                (metrics === null || metrics === void 0
                  ? void 0
                  : metrics.userEngagement.clickThroughRate) || 0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Engajamento do usuário</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="performance">Performance</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="usage">Uso</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alertas</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimizations">Otimizações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Response Time Trend */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Activity className="h-5 w-5" />
                  Tendência de Performance
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.AreaChart data={trends}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="date" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip
                      formatter={function (value) {
                        return [formatDuration(value), "Tempo de Resposta"];
                      }}
                    />
                    <recharts_1.Area
                      type="monotone"
                      dataKey="metrics.averageResponseTime"
                      stroke={CHART_COLORS.primary}
                      fill={CHART_COLORS.primary}
                      fillOpacity={0.3}
                    />
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            {/* Search Types Distribution */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5" />
                  Distribuição por Tipo
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={
                        (metrics === null || metrics === void 0 ? void 0 : metrics.searchTypes) ||
                        []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={function (_a) {
                        var type = _a.type,
                          count = _a.count;
                        return "".concat(type, ": ").concat(count);
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(
                        (metrics === null || metrics === void 0 ? void 0 : metrics.searchTypes) ||
                        []
                      ).map(function (entry, index) {
                        return (
                          <recharts_1.Cell
                            key={"cell-".concat(index)}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        );
                      })}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Popular Queries */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Target className="h-5 w-5" />
                Consultas Mais Populares
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-3">
                {((metrics === null || metrics === void 0 ? void 0 : metrics.popularQueries) || [])
                  .slice(0, 10)
                  .map(function (query, index) {
                    return (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium truncate">{query.query}</div>
                          <div className="text-sm text-muted-foreground">
                            {query.count} buscas • {formatDuration(query.avgResponseTime)} médio
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <badge_1.Badge variant="outline">
                            {formatPercentage(query.successRate)}
                          </badge_1.Badge>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Performance Tab */}
        <tabs_1.TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Performance Breakdown */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.Zap className="h-5 w-5" />
                  Breakdown de Performance
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Processamento NLP</span>
                      <span>
                        {formatDuration(
                          (metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.nlpProcessing) || 0,
                        )}
                      </span>
                    </div>
                    <progress_1.Progress
                      value={
                        (((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.performanceBreakdown.nlpProcessing) || 0) /
                          ((metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.total) || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Consulta ao Banco</span>
                      <span>
                        {formatDuration(
                          (metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.databaseQuery) || 0,
                        )}
                      </span>
                    </div>
                    <progress_1.Progress
                      value={
                        (((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.performanceBreakdown.databaseQuery) || 0) /
                          ((metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.total) || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Processamento de Resultados</span>
                      <span>
                        {formatDuration(
                          (metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.resultProcessing) || 0,
                        )}
                      </span>
                    </div>
                    <progress_1.Progress
                      value={
                        (((metrics === null || metrics === void 0
                          ? void 0
                          : metrics.performanceBreakdown.resultProcessing) || 0) /
                          ((metrics === null || metrics === void 0
                            ? void 0
                            : metrics.performanceBreakdown.total) || 1)) *
                        100
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Success Rate Trend */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.CheckCircle className="h-5 w-5" />
                  Taxa de Sucesso
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={trends}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="date" />
                    <recharts_1.YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <recharts_1.Tooltip
                      formatter={function (value) {
                        return [formatPercentage(value), "Taxa de Sucesso"];
                      }}
                    />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="metrics.successRate"
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Usage Tab */}
        <tabs_1.TabsContent value="usage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-base">Engajamento</card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Cliques</span>
                  <span className="font-medium">
                    {formatPercentage(
                      (metrics === null || metrics === void 0
                        ? void 0
                        : metrics.userEngagement.clickThroughRate) || 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Resultados Visualizados</span>
                  <span className="font-medium">
                    {formatNumber(
                      (metrics === null || metrics === void 0
                        ? void 0
                        : metrics.userEngagement.averageResultsViewed) || 0,
                      1,
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Taxa de Refinamento</span>
                  <span className="font-medium">
                    {formatPercentage(
                      (metrics === null || metrics === void 0
                        ? void 0
                        : metrics.userEngagement.refinementRate) || 0,
                    )}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card className="lg:col-span-2">
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.BarChart3 className="h-5 w-5" />
                  Volume de Buscas por Tipo
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={200}>
                  <recharts_1.BarChart
                    data={
                      (metrics === null || metrics === void 0 ? void 0 : metrics.searchTypes) || []
                    }
                  >
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="type" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip />
                    <recharts_1.Bar dataKey="count" fill={CHART_COLORS.primary} />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Alerts Tab */}
        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Bell className="h-5 w-5" />
                Alertas de Performance
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <scroll_area_1.ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.length === 0
                    ? <div className="text-center py-8 text-muted-foreground">
                        <lucide_react_1.CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p>Nenhum alerta ativo</p>
                      </div>
                    : alerts.map(function (alert) {
                        return (
                          <div
                            key={alert.id}
                            className={(0, utils_1.cn)(
                              "p-3 rounded-lg border",
                              getAlertSeverityColor(alert.severity),
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <badge_1.Badge variant="outline" className="text-xs">
                                    {alert.severity.toUpperCase()}
                                  </badge_1.Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(alert.timestamp).toLocaleString("pt-BR")}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">{alert.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Limite: {alert.threshold} | Atual: {alert.currentValue}
                                </p>
                              </div>
                              <lucide_react_1.AlertTriangle className="h-4 w-4 flex-shrink-0" />
                            </div>
                          </div>
                        );
                      })}
                </div>
              </scroll_area_1.ScrollArea>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Optimizations Tab */}
        <tabs_1.TabsContent value="optimizations" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center gap-2">
                <lucide_react_1.Lightbulb className="h-5 w-5" />
                Sugestões de Otimização
              </card_1.CardTitle>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {optimizations.length === 0
                  ? <div className="text-center py-8 text-muted-foreground">
                      <lucide_react_1.Lightbulb className="h-12 w-12 mx-auto mb-2" />
                      <p>Nenhuma otimização sugerida no momento</p>
                    </div>
                  : optimizations.map(function (optimization, index) {
                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">
                                {optimization.optimization.description}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Padrão: {optimization.queryPattern}
                              </p>
                            </div>
                            <badge_1.Badge variant="outline">
                              {formatPercentage(optimization.impact.potentialSpeedup)} melhoria
                            </badge_1.Badge>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Consultas Afetadas:</span>
                              <div className="font-medium">
                                {optimization.impact.affectedQueries}
                              </div>
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
                      );
                    })}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
// Compact analytics widget for integration
function AnalyticsWidget(_a) {
  var _this = this;
  var className = _a.className;
  var _b = (0, react_1.useState)(null),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  (0, react_1.useEffect)(function () {
    var loadMetrics = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var data, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, 3, 4]);
              return [
                4 /*yield*/,
                search_analytics_1.searchAnalytics.getSearchMetrics({
                  timeRange: {
                    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    end: new Date(),
                  },
                }),
              ];
            case 1:
              data = _a.sent();
              setMetrics(data);
              return [3 /*break*/, 4];
            case 2:
              error_1 = _a.sent();
              console.error("Error loading analytics widget:", error_1);
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };
    loadMetrics();
  }, []);
  if (loading) {
    return (
      <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
        <card_1.CardContent className="flex items-center justify-center py-6">
          <lucide_react_1.Loader2 className="h-4 w-4 animate-spin" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={(0, utils_1.cn)("w-full", className)}>
      <card_1.CardHeader className="pb-3">
        <card_1.CardTitle className="text-base">Analytics (24h)</card_1.CardTitle>
      </card_1.CardHeader>
      <card_1.CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Buscas</div>
            <div className="font-medium">
              {(metrics === null || metrics === void 0 ? void 0 : metrics.totalSearches) || 0}
            </div>
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
      </card_1.CardContent>
    </card_1.Card>
  );
}
