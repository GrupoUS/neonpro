"use client";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
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
var __spreadArray =
  (this && this.__spreadArray) ||
  ((to, from, pack) => {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  });
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var popover_1 = require("@/components/ui/popover");
var input_1 = require("@/components/ui/input");
var scroll_area_1 = require("@/components/ui/scroll-area");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var utils_1 = require("@/lib/utils");
var JourneyAnalyticsDashboard = () => {
  // State Management
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)([]),
    journeyStages = _b[0],
    setJourneyStages = _b[1];
  var _c = (0, react_1.useState)([]),
    patientFlow = _c[0],
    setPatientFlow = _c[1];
  var _d = (0, react_1.useState)([]),
    churnRisks = _d[0],
    setChurnRisks = _d[1];
  var _e = (0, react_1.useState)([]),
    recommendations = _e[0],
    setRecommendations = _e[1];
  var _f = (0, react_1.useState)([]),
    satisfactionMetrics = _f[0],
    setSatisfactionMetrics = _f[1];
  var _g = (0, react_1.useState)([]),
    channelPerformance = _g[0],
    setChannelPerformance = _g[1];
  var _h = (0, react_1.useState)([]),
    realTimeEvents = _h[0],
    setRealTimeEvents = _h[1];
  var _j = (0, react_1.useState)(true),
    loading = _j[0],
    setLoading = _j[1];
  var _k = (0, react_1.useState)(false),
    refreshing = _k[0],
    setRefreshing = _k[1];
  var _l = (0, react_1.useState)(null),
    error = _l[0],
    setError = _l[1];
  var _m = (0, react_1.useState)("30d"),
    selectedTimeRange = _m[0],
    setSelectedTimeRange = _m[1];
  var _o = (0, react_1.useState)("all"),
    selectedStage = _o[0],
    setSelectedStage = _o[1];
  var _p = (0, react_1.useState)("all"),
    selectedChannel = _p[0],
    setSelectedChannel = _p[1];
  var _q = (0, react_1.useState)({
      from: (0, date_fns_1.subDays)(new Date(), 30),
      to: new Date(),
    }),
    dateRange = _q[0],
    setDateRange = _q[1];
  var _r = (0, react_1.useState)("overview"),
    activeTab = _r[0],
    setActiveTab = _r[1];
  var _s = (0, react_1.useState)(""),
    searchTerm = _s[0],
    setSearchTerm = _s[1];
  var _t = (0, react_1.useState)({
      riskLevel: "all",
      priority: "all",
      satisfaction: "all",
    }),
    filters = _t[0],
    setFilters = _t[1];
  // Refs for real-time updates
  var eventSourceRef = (0, react_1.useRef)(null);
  var refreshIntervalRef = (0, react_1.useRef)(null);
  // Memoized filtered data
  var filteredChurnRisks = (0, react_1.useMemo)(
    () =>
      churnRisks.filter((risk) => {
        var matchesSearch = risk.patientName.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesRisk = filters.riskLevel === "all" || risk.riskLevel === filters.riskLevel;
        return matchesSearch && matchesRisk;
      }),
    [churnRisks, searchTerm, filters.riskLevel],
  );
  var filteredRecommendations = (0, react_1.useMemo)(
    () =>
      recommendations.filter((rec) => {
        var matchesSearch =
          rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rec.description.toLowerCase().includes(searchTerm.toLowerCase());
        var matchesPriority = filters.priority === "all" || rec.priority === filters.priority;
        return matchesSearch && matchesPriority;
      }),
    [recommendations, searchTerm, filters.priority],
  );
  // Channel performance icons mapping
  var channelIcons = {
    whatsapp: <lucide_react_1.MessageSquare className="h-4 w-4" />,
    phone: <lucide_react_1.Phone className="h-4 w-4" />,
    email: <lucide_react_1.Mail className="h-4 w-4" />,
    website: <lucide_react_1.Globe className="h-4 w-4" />,
    mobile: <lucide_react_1.Smartphone className="h-4 w-4" />,
    desktop: <lucide_react_1.Monitor className="h-4 w-4" />,
    tablet: <lucide_react_1.TabletSmartphone className="h-4 w-4" />,
    "in-person": <lucide_react_1.MapPin className="h-4 w-4" />,
  };
  // Risk level colors and icons
  var getRiskBadge = (level) => {
    switch (level) {
      case "LOW":
        return (
          <badge_1.Badge variant="secondary" className="bg-green-100 text-green-800">
            Baixo
          </badge_1.Badge>
        );
      case "MEDIUM":
        return (
          <badge_1.Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Médio
          </badge_1.Badge>
        );
      case "HIGH":
        return (
          <badge_1.Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Alto
          </badge_1.Badge>
        );
      case "CRITICAL":
        return <badge_1.Badge variant="destructive">Crítico</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">Desconhecido</badge_1.Badge>;
    }
  };
  var getPriorityBadge = (priority) => {
    switch (priority) {
      case "LOW":
        return <badge_1.Badge variant="secondary">Baixa</badge_1.Badge>;
      case "MEDIUM":
        return (
          <badge_1.Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Média
          </badge_1.Badge>
        );
      case "HIGH":
        return (
          <badge_1.Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Alta
          </badge_1.Badge>
        );
      case "CRITICAL":
        return <badge_1.Badge variant="destructive">Crítica</badge_1.Badge>;
      default:
        return <badge_1.Badge variant="outline">Normal</badge_1.Badge>;
    }
  };
  // Data fetching functions
  var fetchDashboardData = (0, react_1.useCallback)(
    () =>
      __awaiter(void 0, void 0, void 0, function () {
        var params,
          _a,
          metricsRes,
          stagesRes,
          flowRes,
          churnRes,
          recommendationsRes,
          satisfactionRes,
          channelsRes,
          _b,
          metricsData,
          stagesData,
          flowData,
          churnData,
          recommendationsData,
          satisfactionData,
          channelsData,
          err_1;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              _c.trys.push([0, 3, , 4]);
              setError(null);
              params = new URLSearchParams({
                timeRange: selectedTimeRange,
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString(),
                stage: selectedStage,
                channel: selectedChannel,
              });
              return [
                4 /*yield*/,
                Promise.all([
                  fetch("/api/analytics/journey/metrics?".concat(params)),
                  fetch("/api/analytics/journey/stages?".concat(params)),
                  fetch("/api/analytics/journey/flow?".concat(params)),
                  fetch("/api/analytics/journey/churn-risks?".concat(params)),
                  fetch("/api/analytics/journey/recommendations?".concat(params)),
                  fetch("/api/analytics/journey/satisfaction?".concat(params)),
                  fetch("/api/analytics/journey/channels?".concat(params)),
                ]),
              ];
            case 1:
              (_a = _c.sent()),
                (metricsRes = _a[0]),
                (stagesRes = _a[1]),
                (flowRes = _a[2]),
                (churnRes = _a[3]),
                (recommendationsRes = _a[4]),
                (satisfactionRes = _a[5]),
                (channelsRes = _a[6]);
              if (!metricsRes.ok) throw new Error("Failed to fetch metrics");
              return [
                4 /*yield*/,
                Promise.all([
                  metricsRes.json(),
                  stagesRes.json(),
                  flowRes.json(),
                  churnRes.json(),
                  recommendationsRes.json(),
                  satisfactionRes.json(),
                  channelsRes.json(),
                ]),
              ];
            case 2:
              (_b = _c.sent()),
                (metricsData = _b[0]),
                (stagesData = _b[1]),
                (flowData = _b[2]),
                (churnData = _b[3]),
                (recommendationsData = _b[4]),
                (satisfactionData = _b[5]),
                (channelsData = _b[6]);
              setMetrics(metricsData);
              setJourneyStages(stagesData);
              setPatientFlow(flowData);
              setChurnRisks(churnData);
              setRecommendations(recommendationsData);
              setSatisfactionMetrics(satisfactionData);
              setChannelPerformance(
                channelsData.map((channel) =>
                  __assign(__assign({}, channel), {
                    icon: channelIcons[channel.channel] || (
                      <lucide_react_1.Globe className="h-4 w-4" />
                    ),
                  }),
                ),
              );
              return [3 /*break*/, 4];
            case 3:
              err_1 = _c.sent();
              setError(err_1 instanceof Error ? err_1.message : "Erro ao carregar dados");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [selectedTimeRange, dateRange, selectedStage, selectedChannel],
  );
  var refreshData = (0, react_1.useCallback)(
    () =>
      __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setRefreshing(true);
              return [4 /*yield*/, fetchDashboardData()];
            case 1:
              _a.sent();
              setRefreshing(false);
              return [2 /*return*/];
          }
        });
      }),
    [fetchDashboardData],
  );
  // Real-time events setup
  var setupRealTimeUpdates = (0, react_1.useCallback)(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    eventSourceRef.current = new EventSource("/api/analytics/journey/events/stream");
    eventSourceRef.current.onmessage = (event) => {
      var newEvent = JSON.parse(event.data);
      setRealTimeEvents((prev) => __spreadArray([newEvent], prev.slice(0, 49), true));
    };
    eventSourceRef.current.onerror = () => {
      console.warn("Real-time connection lost, attempting to reconnect...");
      setTimeout(setupRealTimeUpdates, 5000);
    };
  }, []);
  // Effects
  (0, react_1.useEffect)(() => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, [fetchDashboardData]);
  (0, react_1.useEffect)(() => {
    setupRealTimeUpdates();
    // Auto-refresh every 5 minutes
    refreshIntervalRef.current = setInterval(refreshData, 5 * 60 * 1000);
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [setupRealTimeUpdates, refreshData]);
  // Event handlers
  var handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    var now = new Date();
    var from;
    switch (range) {
      case "7d":
        from = (0, date_fns_1.subDays)(now, 7);
        break;
      case "30d":
        from = (0, date_fns_1.subDays)(now, 30);
        break;
      case "90d":
        from = (0, date_fns_1.subDays)(now, 90);
        break;
      case "6m":
        from = (0, date_fns_1.subMonths)(now, 6);
        break;
      case "1y":
        from = (0, date_fns_1.subMonths)(now, 12);
        break;
      default:
        from = (0, date_fns_1.subDays)(now, 30);
    }
    setDateRange({ from: from, to: now });
  };
  var handleExport = (format) =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, blob, url, a, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/analytics/journey/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  format: format,
                  timeRange: selectedTimeRange,
                  dateRange: dateRange,
                  filters: { stage: selectedStage, channel: selectedChannel },
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) throw new Error("Export failed");
            return [4 /*yield*/, response.blob()];
          case 2:
            blob = _a.sent();
            url = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = "journey-analytics-"
              .concat(format, ".")
              .concat(format === "excel" ? "xlsx" : format);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            return [3 /*break*/, 4];
          case 3:
            err_2 = _a.sent();
            setError("Erro ao exportar dados");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando analytics da jornada...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert variant="destructive" className="m-6">
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        <button_1.Button onClick={refreshData} variant="outline" size="sm" className="mt-2">
          Tentar novamente
        </button_1.Button>
      </alert_1.Alert>
    );
  }
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics da Jornada</h1>
          <p className="text-muted-foreground">
            Análise completa da experiência e jornada dos pacientes
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select_1.Select value={selectedTimeRange} onValueChange={handleTimeRangeChange}>
            <select_1.SelectTrigger className="w-32">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="7d">7 dias</select_1.SelectItem>
              <select_1.SelectItem value="30d">30 dias</select_1.SelectItem>
              <select_1.SelectItem value="90d">90 dias</select_1.SelectItem>
              <select_1.SelectItem value="6m">6 meses</select_1.SelectItem>
              <select_1.SelectItem value="1y">1 ano</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          <button_1.Button onClick={refreshData} disabled={refreshing} variant="outline" size="sm">
            <lucide_react_1.RefreshCw
              className={(0, utils_1.cn)("h-4 w-4", refreshing && "animate-spin")}
            />
          </button_1.Button>

          <popover_1.Popover>
            <popover_1.PopoverTrigger asChild>
              <button_1.Button variant="outline" size="sm">
                <lucide_react_1.Download className="h-4 w-4" />
              </button_1.Button>
            </popover_1.PopoverTrigger>
            <popover_1.PopoverContent>
              <div className="space-y-2">
                <p className="font-medium">Exportar Relatório</p>
                <div className="flex flex-col space-y-1">
                  <button_1.Button onClick={() => handleExport("pdf")} variant="ghost" size="sm">
                    Exportar PDF
                  </button_1.Button>
                  <button_1.Button onClick={() => handleExport("excel")} variant="ghost" size="sm">
                    Exportar Excel
                  </button_1.Button>
                  <button_1.Button onClick={() => handleExport("png")} variant="ghost" size="sm">
                    Exportar Imagem
                  </button_1.Button>
                </div>
              </div>
            </popover_1.PopoverContent>
          </popover_1.Popover>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">
                Total de Pacientes
              </card_1.CardTitle>
              <lucide_react_1.Users className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.totalPatients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={(0, utils_1.cn)(
                    "inline-flex items-center",
                    metrics.trends.patients >= 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {metrics.trends.patients >= 0
                    ? <lucide_react_1.ArrowUpRight className="h-3 w-3 mr-1" />
                    : <lucide_react_1.ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.trends.patients)}%
                </span>{" "}
                vs período anterior
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Satisfação Média</card_1.CardTitle>
              <lucide_react_1.Heart className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.averageSatisfaction.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={(0, utils_1.cn)(
                    "inline-flex items-center",
                    metrics.trends.satisfaction >= 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {metrics.trends.satisfaction >= 0
                    ? <lucide_react_1.ArrowUpRight className="h-3 w-3 mr-1" />
                    : <lucide_react_1.ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.trends.satisfaction).toFixed(1)}%
                </span>{" "}
                vs período anterior
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Conversão</card_1.CardTitle>
              <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={(0, utils_1.cn)(
                    "inline-flex items-center",
                    metrics.trends.conversion >= 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {metrics.trends.conversion >= 0
                    ? <lucide_react_1.ArrowUpRight className="h-3 w-3 mr-1" />
                    : <lucide_react_1.ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.trends.conversion).toFixed(1)}%
                </span>{" "}
                vs período anterior
              </p>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <card_1.CardTitle className="text-sm font-medium">Taxa de Churn</card_1.CardTitle>
              <lucide_react_1.TrendingDown className="h-4 w-4 text-muted-foreground" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="text-2xl font-bold">{metrics.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={(0, utils_1.cn)(
                    "inline-flex items-center",
                    metrics.trends.churn <= 0 ? "text-green-600" : "text-red-600",
                  )}
                >
                  {metrics.trends.churn <= 0
                    ? <lucide_react_1.ArrowDownRight className="h-3 w-3 mr-1" />
                    : <lucide_react_1.ArrowUpRight className="h-3 w-3 mr-1" />}
                  {Math.abs(metrics.trends.churn).toFixed(1)}%
                </span>{" "}
                vs período anterior
              </p>
            </card_1.CardContent>
          </card_1.Card>
        </div>
      )}

      {/* Main Dashboard Tabs */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="journey">Jornada</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="satisfaction">Satisfação</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="churn">Churn</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="optimization">Otimização</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Flow Visualization */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Fluxo de Pacientes</card_1.CardTitle>
                <card_1.CardDescription>
                  Distribuição de pacientes por estágio da jornada
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {patientFlow.map((stage, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{stage.stage}</span>
                          <span className="text-sm text-muted-foreground">
                            {stage.patients} ({stage.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <progress_1.Progress value={stage.percentage} className="h-2" />
                      </div>
                      <div
                        className={(0, utils_1.cn)(
                          "text-xs",
                          stage.trend >= 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {stage.trend >= 0 ? "+" : ""}
                        {stage.trend.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Channel Performance */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Performance por Canal</card_1.CardTitle>
                <card_1.CardDescription>
                  Análise de performance por canal de comunicação
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  {channelPerformance.map((channel, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        {channel.icon}
                        <span className="font-medium capitalize">{channel.channel}</span>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.interactions.toLocaleString()}</div>
                        <div className="text-muted-foreground">interações</div>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.satisfaction.toFixed(1)}</div>
                        <div className="text-muted-foreground">satisfação</div>
                      </div>
                      <div className="text-sm text-center">
                        <div className="font-medium">{channel.conversion.toFixed(1)}%</div>
                        <div className="text-muted-foreground">conversão</div>
                      </div>
                      <div
                        className={(0, utils_1.cn)(
                          "text-xs",
                          channel.trend >= 0 ? "text-green-600" : "text-red-600",
                        )}
                      >
                        {channel.trend >= 0 ? "+" : ""}
                        {channel.trend.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Real-time Events */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="flex items-center space-x-2">
                <lucide_react_1.Activity className="h-5 w-5" />
                <span>Eventos em Tempo Real</span>
                <badge_1.Badge variant="secondary" className="ml-auto">
                  {realTimeEvents.length} eventos
                </badge_1.Badge>
              </card_1.CardTitle>
              <card_1.CardDescription>
                Últimas atividades da jornada dos pacientes
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <scroll_area_1.ScrollArea className="h-64">
                <div className="space-y-2">
                  {realTimeEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50"
                    >
                      <div
                        className={(0, utils_1.cn)(
                          "w-2 h-2 rounded-full mt-2",
                          event.severity === "ERROR" && "bg-red-500",
                          event.severity === "WARNING" && "bg-yellow-500",
                          event.severity === "INFO" && "bg-blue-500",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{event.patientName}</span>
                          <badge_1.Badge variant="outline" className="text-xs">
                            {event.touchpoint}
                          </badge_1.Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{event.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {(0, date_fns_1.format)(event.timestamp, "HH:mm:ss", {
                            locale: locale_1.ptBR,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </scroll_area_1.ScrollArea>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Journey Tab */}
        <tabs_1.TabsContent value="journey" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Mapa da Jornada do Paciente</card_1.CardTitle>
              <card_1.CardDescription>
                Análise detalhada de cada estágio da jornada
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-6">
                {journeyStages.map((stage, index) => (
                  <div key={stage.id} className="relative">
                    {index < journeyStages.length - 1 && (
                      <div className="absolute left-6 top-12 w-px h-12 bg-border" />
                    )}

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold">
                        {stage.order}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{stage.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{stage.totalPatients} pacientes</span>
                            <span>{stage.conversionRate.toFixed(1)}% conversão</span>
                            <span>{stage.satisfactionScore.toFixed(1)} satisfação</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Tempo Médio</div>
                            <div className="font-medium">
                              {Math.round(stage.averageTime / 60)} min
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Taxa de Abandono</div>
                            <div className="font-medium text-red-600">
                              {stage.dropOffRate.toFixed(1)}%
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/50">
                            <div className="text-sm text-muted-foreground">Touchpoints</div>
                            <div className="font-medium">{stage.touchpoints.length}</div>
                          </div>
                        </div>

                        {/* Touchpoints */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {stage.touchpoints.map((touchpoint) => (
                            <div key={touchpoint.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm">{touchpoint.name}</span>
                                <badge_1.Badge variant="outline" className="text-xs">
                                  {touchpoint.channel}
                                </badge_1.Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span>Interações:</span>
                                  <span className="font-medium">{touchpoint.interactions}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Satisfação:</span>
                                  <span className="font-medium">
                                    {touchpoint.satisfaction.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span>Conversão:</span>
                                  <span className="font-medium">
                                    {touchpoint.conversionRate.toFixed(1)}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Satisfaction Tab */}
        <tabs_1.TabsContent value="satisfaction" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {satisfactionMetrics.map((metric, index) => (
              <card_1.Card key={index}>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center justify-between">
                    <span>{metric.category}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold">{metric.score.toFixed(1)}</span>
                      <badge_1.Badge
                        variant={metric.score >= metric.target ? "default" : "destructive"}
                      >
                        Meta: {metric.target.toFixed(1)}
                      </badge_1.Badge>
                    </div>
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    {metric.responses} respostas coletadas
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-4">
                    <progress_1.Progress value={(metric.score / 5) * 100} className="h-2" />

                    <div className="grid grid-cols-5 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Péssimo</div>
                        <div className="font-medium">{metric.breakdown.terrible}</div>
                        <div
                          className="w-full h-2 bg-red-500 rounded"
                          style={{
                            height: "".concat(
                              Math.max(4, (metric.breakdown.terrible / metric.responses) * 40),
                              "px",
                            ),
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Ruim</div>
                        <div className="font-medium">{metric.breakdown.poor}</div>
                        <div
                          className="w-full h-2 bg-orange-500 rounded"
                          style={{
                            height: "".concat(
                              Math.max(4, (metric.breakdown.poor / metric.responses) * 40),
                              "px",
                            ),
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Regular</div>
                        <div className="font-medium">{metric.breakdown.average}</div>
                        <div
                          className="w-full h-2 bg-yellow-500 rounded"
                          style={{
                            height: "".concat(
                              Math.max(4, (metric.breakdown.average / metric.responses) * 40),
                              "px",
                            ),
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Bom</div>
                        <div className="font-medium">{metric.breakdown.good}</div>
                        <div
                          className="w-full h-2 bg-blue-500 rounded"
                          style={{
                            height: "".concat(
                              Math.max(4, (metric.breakdown.good / metric.responses) * 40),
                              "px",
                            ),
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Excelente</div>
                        <div className="font-medium">{metric.breakdown.excellent}</div>
                        <div
                          className="w-full h-2 bg-green-500 rounded"
                          style={{
                            height: "".concat(
                              Math.max(4, (metric.breakdown.excellent / metric.responses) * 40),
                              "px",
                            ),
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Churn Tab */}
        <tabs_1.TabsContent value="churn" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Riscos de Churn</h3>
              <p className="text-muted-foreground">Pacientes com risco de abandono</p>
            </div>
            <div className="flex items-center space-x-2">
              <input_1.Input
                placeholder="Buscar paciente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select_1.Select
                value={filters.riskLevel}
                onValueChange={(value) =>
                  setFilters((prev) => __assign(__assign({}, prev), { riskLevel: value }))
                }
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue placeholder="Risco" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todos</select_1.SelectItem>
                  <select_1.SelectItem value="CRITICAL">Crítico</select_1.SelectItem>
                  <select_1.SelectItem value="HIGH">Alto</select_1.SelectItem>
                  <select_1.SelectItem value="MEDIUM">Médio</select_1.SelectItem>
                  <select_1.SelectItem value="LOW">Baixo</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChurnRisks.map((risk) => (
              <card_1.Card key={risk.patientId} className="relative">
                <card_1.CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <card_1.CardTitle className="text-base">{risk.patientName}</card_1.CardTitle>
                    {getRiskBadge(risk.riskLevel)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Score de Risco:</span>
                    <span className="font-bold text-red-600">
                      {(risk.riskScore * 100).toFixed(0)}%
                    </span>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Fatores de Risco:</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {risk.factors.map((factor, index) => (
                        <badge_1.Badge key={index} variant="outline" className="text-xs">
                          {factor}
                        </badge_1.Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Última Atividade:</div>
                    <div className="text-sm font-medium">
                      {(0, date_fns_1.format)(risk.lastActivity, "dd/MM/yyyy HH:mm", {
                        locale: locale_1.ptBR,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Previsão de Churn:</div>
                    <div className="text-sm font-medium text-red-600">
                      {(0, date_fns_1.format)(risk.predictedChurnDate, "dd/MM/yyyy", {
                        locale: locale_1.ptBR,
                      })}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Ações Recomendadas:</div>
                    <div className="space-y-1 mt-1">
                      {risk.recommendedActions.slice(0, 2).map((action, index) => (
                        <div
                          key={index}
                          className="text-xs p-2 bg-muted rounded text-muted-foreground"
                        >
                          • {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>

        {/* Optimization Tab */}
        <tabs_1.TabsContent value="optimization" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Recomendações de Otimização</h3>
              <p className="text-muted-foreground">Oportunidades de melhoria da experiência</p>
            </div>
            <div className="flex items-center space-x-2">
              <input_1.Input
                placeholder="Buscar recomendação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
              <select_1.Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters((prev) => __assign(__assign({}, prev), { priority: value }))
                }
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue placeholder="Prioridade" />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="all">Todas</select_1.SelectItem>
                  <select_1.SelectItem value="CRITICAL">Crítica</select_1.SelectItem>
                  <select_1.SelectItem value="HIGH">Alta</select_1.SelectItem>
                  <select_1.SelectItem value="MEDIUM">Média</select_1.SelectItem>
                  <select_1.SelectItem value="LOW">Baixa</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <card_1.Card key={rec.id}>
                <card_1.CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <card_1.CardTitle className="text-base">{rec.title}</card_1.CardTitle>
                        {getPriorityBadge(rec.priority)}
                        <badge_1.Badge variant="outline">{rec.type}</badge_1.Badge>
                      </div>
                      <card_1.CardDescription>{rec.description}</card_1.CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">ROI Estimado</div>
                      <div className="text-lg font-bold text-green-600">{rec.roi.toFixed(1)}x</div>
                    </div>
                  </div>
                </card_1.CardHeader>
                <card_1.CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium mb-2">Impacto Esperado:</div>
                      <div className="text-sm text-muted-foreground">{rec.impact}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Esforço Necessário:</div>
                      <div className="text-sm text-muted-foreground">{rec.effort}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Touchpoints Afetados:</div>
                    <div className="flex flex-wrap gap-1">
                      {rec.touchpoints.map((touchpoint, index) => (
                        <badge_1.Badge key={index} variant="secondary" className="text-xs">
                          {touchpoint}
                        </badge_1.Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Passos de Implementação:</div>
                    <div className="space-y-1">
                      {rec.implementation.map((step, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
                            {index + 1}
                          </div>
                          <div className="text-sm text-muted-foreground">{step}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-2">Métricas de Sucesso:</div>
                    <div className="flex flex-wrap gap-1">
                      {rec.metrics.map((metric, index) => (
                        <badge_1.Badge key={index} variant="outline" className="text-xs">
                          {metric}
                        </badge_1.Badge>
                      ))}
                    </div>
                  </div>
                </card_1.CardContent>
              </card_1.Card>
            ))}
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
};
exports.default = JourneyAnalyticsDashboard;
