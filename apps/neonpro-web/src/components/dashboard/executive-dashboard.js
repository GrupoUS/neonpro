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
exports.ExecutiveDashboard = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var skeleton_1 = require("@/components/ui/skeleton");
var alert_1 = require("@/components/ui/alert");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var use_toast_1 = require("@/hooks/use-toast");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var ExecutiveDashboard = (_a) => {
  var clinicId = _a.clinicId,
    userId = _a.userId;
  var toast = (0, use_toast_1.useToast)().toast;
  // State management
  var _b = (0, react_1.useState)(null),
    dashboardData = _b[0],
    setDashboardData = _b[1];
  var _c = (0, react_1.useState)(true),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var _e = (0, react_1.useState)("monthly"),
    periodType = _e[0],
    setPeriodType = _e[1];
  var _f = (0, react_1.useState)(false),
    refreshing = _f[0],
    setRefreshing = _f[1];
  var _g = (0, react_1.useState)(false),
    alertsExpanded = _g[0],
    setAlertsExpanded = _g[1];
  // Fetch dashboard data
  var fetchDashboardData = (0, react_1.useCallback)(
    () =>
      __awaiter(void 0, void 0, void 0, function () {
        var response, result, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                fetch(
                  "/api/executive-dashboard?clinic_id="
                    .concat(clinicId, "&period_type=")
                    .concat(periodType),
                ),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _a.sent();
              if (!result.success) {
                throw new Error(result.error || "Failed to fetch dashboard data");
              }
              setDashboardData(result.data);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              console.error("Error fetching dashboard data:", err_1);
              setError(err_1 instanceof Error ? err_1.message : "Unknown error");
              toast({
                title: "Erro ao carregar dashboard",
                description: "Não foi possível carregar os dados do dashboard executivo.",
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [clinicId, periodType, toast],
  );
  // Refresh data
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
              toast({
                title: "Dashboard atualizado",
                description: "Os dados do dashboard foram atualizados com sucesso.",
              });
              return [2 /*return*/];
          }
        });
      }),
    [fetchDashboardData, toast],
  );
  // Handle alert actions
  var handleAlertAction = (alertId, action) =>
    __awaiter(void 0, void 0, void 0, function () {
      var response, result_1, updatedAlerts, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/executive-dashboard/alerts/".concat(alertId), {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ action: action }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to update alert");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            result_1 = _a.sent();
            if (!result_1.success) {
              throw new Error(result_1.error || "Failed to update alert");
            }
            // Update local state
            if (dashboardData) {
              updatedAlerts = dashboardData.alerts.map((alert) =>
                alert.id === alertId ? result_1.data : alert,
              );
              setDashboardData(__assign(__assign({}, dashboardData), { alerts: updatedAlerts }));
            }
            toast({
              title: "Alerta ".concat(action === "acknowledge" ? "reconhecido" : "resolvido"),
              description: "O alerta foi ".concat(
                action === "acknowledge" ? "reconhecido" : "resolvido",
                " com sucesso.",
              ),
            });
            return [3 /*break*/, 4];
          case 3:
            err_2 = _a.sent();
            console.error("Error updating alert:", err_2);
            toast({
              title: "Erro ao atualizar alerta",
              description: "Não foi possível atualizar o alerta.",
              variant: "destructive",
            });
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  // Generate report
  var generateReport = (reportName_1, reportType_1) => {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(
      void 0,
      __spreadArray([reportName_1, reportType_1], args_1, true),
      void 0,
      function (reportName, reportType, format) {
        var response, result, err_3;
        if (format === void 0) {
          format = "pdf";
        }
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, , 5]);
              return [
                4 /*yield*/,
                fetch("/api/executive-dashboard/reports", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clinic_id: clinicId,
                    report_name: reportName,
                    report_type: reportType,
                    period_type: periodType,
                    period_start: new Date().toISOString().split("T")[0],
                    period_end: new Date().toISOString().split("T")[0],
                    format: format,
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to request report");
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _a.sent();
              if (!result.success) {
                throw new Error(result.error || "Failed to request report");
              }
              toast({
                title: "Relatório solicitado",
                description:
                  "O relatório está sendo gerado. Você será notificado quando estiver pronto.",
              });
              // Refresh reports list
              return [4 /*yield*/, refreshData()];
            case 3:
              // Refresh reports list
              _a.sent();
              return [3 /*break*/, 5];
            case 4:
              err_3 = _a.sent();
              console.error("Error generating report:", err_3);
              toast({
                title: "Erro ao gerar relatório",
                description: "Não foi possível solicitar a geração do relatório.",
                variant: "destructive",
              });
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  // Format currency
  var formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  // Format percentage
  var formatPercentage = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  // Get trend icon and color
  var getTrendDisplay = (trend, changePercent) => {
    if (trend === "up") {
      return {
        icon: <lucide_react_1.TrendingUp className="h-4 w-4" />,
        color: "text-green-600",
        bgColor: "bg-green-50",
      };
    } else if (trend === "down") {
      return {
        icon: <lucide_react_1.TrendingDown className="h-4 w-4" />,
        color: "text-red-600",
        bgColor: "bg-red-50",
      };
    } else {
      return {
        icon: <lucide_react_1.BarChart3 className="h-4 w-4" />,
        color: "text-gray-500",
        bgColor: "bg-gray-50",
      };
    }
  };
  // Get severity color
  var getSeverityColor = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  // Effect to fetch data on component mount and period change
  (0, react_1.useEffect)(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <skeleton_1.Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <skeleton_1.Skeleton className="h-10 w-32" />
            <skeleton_1.Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {__spreadArray([], Array(4), true).map((_, i) => (
            <card_1.Card key={i}>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <skeleton_1.Skeleton className="h-4 w-24" />
                <skeleton_1.Skeleton className="h-4 w-4" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <skeleton_1.Skeleton className="h-8 w-20 mb-2" />
                <skeleton_1.Skeleton className="h-4 w-16" />
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <alert_1.Alert className="border-red-200 bg-red-50">
        <lucide_react_1.AlertTriangle className="h-4 w-4 text-red-600" />
        <alert_1.AlertDescription className="text-red-800">{error}</alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  if (!dashboardData) {
    return (
      <alert_1.Alert>
        <lucide_react_1.AlertTriangle className="h-4 w-4" />
        <alert_1.AlertDescription>
          Nenhum dado encontrado para o dashboard executivo.
        </alert_1.AlertDescription>
      </alert_1.Alert>
    );
  }
  var kpis = dashboardData.kpis,
    alerts = dashboardData.alerts,
    widgets = dashboardData.widgets,
    reports = dashboardData.reports,
    periodComparisons = dashboardData.periodComparisons; // Get key KPIs for display
  var keyKPIs = [
    {
      name: "total_revenue",
      label: "Receita Total",
      icon: lucide_react_1.DollarSign,
      formatter: formatCurrency,
    },
    {
      name: "total_appointments",
      label: "Consultas Totais",
      icon: lucide_react_1.Calendar,
      formatter: (value) => value.toString(),
    },
    {
      name: "new_patients",
      label: "Novos Pacientes",
      icon: lucide_react_1.Users,
      formatter: (value) => value.toString(),
    },
    {
      name: "patient_satisfaction",
      label: "Satisfação",
      icon: lucide_react_1.BarChart3,
      formatter: formatPercentage,
    },
  ];
  // Active alerts count by severity
  var activeAlerts = alerts.filter((alert) => alert.is_active);
  var criticalAlerts = activeAlerts.filter((alert) => alert.severity === "critical");
  var highAlerts = activeAlerts.filter((alert) => alert.severity === "high");
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground">Visão geral dos principais indicadores da clínica</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Period Type Selector */}
          <select_1.Select value={periodType} onValueChange={setPeriodType}>
            <select_1.SelectTrigger className="w-[180px]">
              <select_1.SelectValue placeholder="Selecionar período" />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              <select_1.SelectItem value="daily">Diário</select_1.SelectItem>
              <select_1.SelectItem value="weekly">Semanal</select_1.SelectItem>
              <select_1.SelectItem value="monthly">Mensal</select_1.SelectItem>
              <select_1.SelectItem value="quarterly">Trimestral</select_1.SelectItem>
              <select_1.SelectItem value="yearly">Anual</select_1.SelectItem>
            </select_1.SelectContent>
          </select_1.Select>

          {/* Refresh Button */}
          <button_1.Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <lucide_react_1.RefreshCw
              className={(0, utils_1.cn)("h-4 w-4", refreshing && "animate-spin")}
            />
            Atualizar
          </button_1.Button>

          {/* Report Generation */}
          <dropdown_menu_1.DropdownMenu>
            <dropdown_menu_1.DropdownMenuTrigger asChild>
              <button_1.Button variant="outline" className="flex items-center gap-2">
                <lucide_react_1.Download className="h-4 w-4" />
                Relatórios
              </button_1.Button>
            </dropdown_menu_1.DropdownMenuTrigger>
            <dropdown_menu_1.DropdownMenuContent>
              <dropdown_menu_1.DropdownMenuItem
                onClick={() => generateReport("Resumo Executivo", "executive_summary", "pdf")}
              >
                <lucide_react_1.Download className="h-4 w-4 mr-2" />
                Resumo Executivo (PDF)
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem
                onClick={() => generateReport("Análise de KPIs", "kpi_analysis", "excel")}
              >
                <lucide_react_1.BarChart3 className="h-4 w-4 mr-2" />
                Análise de KPIs (Excel)
              </dropdown_menu_1.DropdownMenuItem>
              <dropdown_menu_1.DropdownMenuItem
                onClick={() => generateReport("Análise de Tendências", "trend_analysis", "pdf")}
              >
                <lucide_react_1.TrendingUp className="h-4 w-4 mr-2" />
                Análise de Tendências (PDF)
              </dropdown_menu_1.DropdownMenuItem>
            </dropdown_menu_1.DropdownMenuContent>
          </dropdown_menu_1.DropdownMenu>
        </div>
      </div>

      {/* Alerts Summary */}
      {activeAlerts.length > 0 && (
        <alert_1.Alert
          className={(0, utils_1.cn)(
            "border-l-4",
            criticalAlerts.length > 0
              ? "border-l-red-500 bg-red-50"
              : highAlerts.length > 0
                ? "border-l-orange-500 bg-orange-50"
                : "border-l-yellow-500 bg-yellow-50",
          )}
        >
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                {criticalAlerts.length > 0 && (
                  <span className="text-red-700 font-medium">
                    {criticalAlerts.length} alerta(s) crítico(s)
                  </span>
                )}
                {criticalAlerts.length > 0 && highAlerts.length > 0 && " • "}
                {highAlerts.length > 0 && (
                  <span className="text-orange-700 font-medium">
                    {highAlerts.length} alerta(s) importante(s)
                  </span>
                )}
                {activeAlerts.length - criticalAlerts.length - highAlerts.length > 0 && (
                  <span className="text-yellow-700">
                    {" • "}
                    {activeAlerts.length - criticalAlerts.length - highAlerts.length} outro(s)
                  </span>
                )}
              </span>
              <button_1.Button
                variant="ghost"
                size="sm"
                onClick={() => setAlertsExpanded(!alertsExpanded)}
              >
                {alertsExpanded ? "Ocultar" : "Ver todos"}
              </button_1.Button>
            </div>
          </alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyKPIs.map((kpi) => {
          var comparison = periodComparisons[kpi.name];
          var trendDisplay = getTrendDisplay(comparison.trend, comparison.changePercent);
          return (
            <card_1.Card key={kpi.name}>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">{kpi.label}</card_1.CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">{kpi.formatter(comparison.current)}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div
                    className={(0, utils_1.cn)(
                      "flex items-center gap-1 px-2 py-1 rounded-full",
                      trendDisplay.color,
                      trendDisplay.bgColor,
                    )}
                  >
                    {trendDisplay.icon}
                    <span className="font-medium">
                      {comparison.changePercent > 0 ? "+" : ""}
                      {comparison.changePercent.toFixed(1)}%
                    </span>
                  </div>
                  <span>vs período anterior</span>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs defaultValue="overview" className="space-y-6">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="overview">Visão Geral</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">
            Alertas
            {activeAlerts.length > 0 && (
              <badge_1.Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeAlerts.length}
              </badge_1.Badge>
            )}
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports">Relatórios</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings">Configurações</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Tendência de Receita</card_1.CardTitle>
                <card_1.CardDescription>
                  Evolução da receita nos últimos períodos
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <lucide_react_1.BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de tendência será implementado</p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Appointments Overview */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Agendamentos</card_1.CardTitle>
                <card_1.CardDescription>
                  Distribuição de consultas por status
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                  <div className="text-center">
                    <lucide_react_1.Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      Gráfico de agendamentos será implementado
                    </p>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Additional KPIs */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Indicadores Adicionais</card_1.CardTitle>
              <card_1.CardDescription>
                Outros indicadores importantes para acompanhamento
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {kpis
                  .filter((kpi) => !keyKPIs.some((k) => k.name === kpi.kpi_name))
                  .map((kpi) => (
                    <div
                      key={kpi.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {kpi.kpi_name.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <p className="text-2xl font-bold">
                          {kpi.kpi_value}
                          {kpi.unit}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(0, date_fns_1.format)(new Date(kpi.period_start), "dd/MM", {
                          locale: locale_1.ptBR,
                        })}{" "}
                        -{" "}
                        {(0, date_fns_1.format)(new Date(kpi.period_end), "dd/MM", {
                          locale: locale_1.ptBR,
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        {/* Alerts Tab */}
        <tabs_1.TabsContent value="alerts" className="space-y-6">
          <div className="grid gap-4">
            {activeAlerts.length === 0
              ? <card_1.Card>
                  <card_1.CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <lucide_react_1.CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <p className="text-lg font-medium">Nenhum alerta ativo</p>
                      <p className="text-sm text-muted-foreground">
                        Todos os indicadores estão dentro dos parâmetros normais
                      </p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              : activeAlerts.map((alert) => (
                  <card_1.Card
                    key={alert.id}
                    className={(0, utils_1.cn)("border-l-4", {
                      "border-l-red-500": alert.severity === "critical",
                      "border-l-orange-500": alert.severity === "high",
                      "border-l-yellow-500": alert.severity === "medium",
                      "border-l-blue-500": alert.severity === "low",
                    })}
                  >
                    <card_1.CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <card_1.CardTitle className="text-lg">{alert.title}</card_1.CardTitle>
                            <badge_1.Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </badge_1.Badge>
                          </div>
                          <card_1.CardDescription>{alert.message}</card_1.CardDescription>
                        </div>
                        <dropdown_menu_1.DropdownMenu>
                          <dropdown_menu_1.DropdownMenuTrigger asChild>
                            <button_1.Button variant="ghost" size="sm">
                              <lucide_react_1.MoreVertical className="h-4 w-4" />
                            </button_1.Button>
                          </dropdown_menu_1.DropdownMenuTrigger>
                          <dropdown_menu_1.DropdownMenuContent>
                            {!alert.acknowledged_at && (
                              <dropdown_menu_1.DropdownMenuItem
                                onClick={() => handleAlertAction(alert.id, "acknowledge")}
                              >
                                <lucide_react_1.Eye className="h-4 w-4 mr-2" />
                                Reconhecer
                              </dropdown_menu_1.DropdownMenuItem>
                            )}
                            <dropdown_menu_1.DropdownMenuItem
                              onClick={() => handleAlertAction(alert.id, "resolve")}
                            >
                              <lucide_react_1.CheckCircle className="h-4 w-4 mr-2" />
                              Resolver
                            </dropdown_menu_1.DropdownMenuItem>
                          </dropdown_menu_1.DropdownMenuContent>
                        </dropdown_menu_1.DropdownMenu>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          Criado em{" "}
                          {(0, date_fns_1.format)(new Date(alert.created_at), "dd/MM/yyyy HH:mm", {
                            locale: locale_1.ptBR,
                          })}
                        </span>
                        {alert.acknowledged_at && (
                          <span className="text-blue-600">Reconhecido</span>
                        )}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                ))}
          </div>
        </tabs_1.TabsContent>

        {/* Reports Tab */}
        <tabs_1.TabsContent value="reports" className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Relatórios Recentes</h3>
              <button_1.Button
                onClick={() => generateReport("Relatório Personalizado", "custom", "pdf")}
              >
                <lucide_react_1.Plus className="h-4 w-4 mr-2" />
                Gerar Novo Relatório
              </button_1.Button>
            </div>

            {reports.length === 0
              ? <card_1.Card>
                  <card_1.CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <lucide_react_1.Download className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-lg font-medium">Nenhum relatório gerado</p>
                      <p className="text-sm text-muted-foreground">
                        Clique em "Gerar Novo Relatório" para começar
                      </p>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>
              : reports.map((report) => (
                  <card_1.Card key={report.id}>
                    <card_1.CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <card_1.CardTitle className="text-lg">
                            {report.report_name}
                          </card_1.CardTitle>
                          <card_1.CardDescription>
                            {report.report_type} • {report.format.toUpperCase()} •
                            {(0, date_fns_1.format)(
                              new Date(report.created_at),
                              "dd/MM/yyyy HH:mm",
                              { locale: locale_1.ptBR },
                            )}
                          </card_1.CardDescription>
                        </div>
                        <badge_1.Badge
                          variant={
                            report.status === "completed"
                              ? "default"
                              : report.status === "generating"
                                ? "secondary"
                                : report.status === "failed"
                                  ? "destructive"
                                  : "outline"
                          }
                        >
                          {report.status === "completed"
                            ? "Concluído"
                            : report.status === "generating"
                              ? "Gerando..."
                              : report.status === "failed"
                                ? "Falhou"
                                : "Pendente"}
                        </badge_1.Badge>
                      </div>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Período:{" "}
                          {(0, date_fns_1.format)(new Date(report.period_start), "dd/MM/yyyy", {
                            locale: locale_1.ptBR,
                          })}{" "}
                          -{" "}
                          {(0, date_fns_1.format)(new Date(report.period_end), "dd/MM/yyyy", {
                            locale: locale_1.ptBR,
                          })}
                        </span>
                        {report.status === "completed" && report.file_path && (
                          <button_1.Button variant="outline" size="sm">
                            <lucide_react_1.Download className="h-4 w-4 mr-2" />
                            Download
                          </button_1.Button>
                        )}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                ))}
          </div>
        </tabs_1.TabsContent>

        {/* Settings Tab */}
        <tabs_1.TabsContent value="settings" className="space-y-6">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Configurações do Dashboard</card_1.CardTitle>
              <card_1.CardDescription>
                Personalize a exibição e configurações do dashboard executivo
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  As configurações de widgets e layouts personalizados serão implementadas em uma
                  próxima versão.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Layout dos Widgets</h4>
                    <p className="text-sm text-muted-foreground">
                      Arrastar e soltar widgets para reorganizar o dashboard
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Alertas Personalizados</h4>
                    <p className="text-sm text-muted-foreground">
                      Configurar thresholds e condições para alertas automáticos
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Relatórios Agendados</h4>
                    <p className="text-sm text-muted-foreground">
                      Agendar geração automática de relatórios
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Notificações</h4>
                    <p className="text-sm text-muted-foreground">
                      Configurar notificações por email e dentro do sistema
                    </p>
                  </div>
                </div>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
};
exports.ExecutiveDashboard = ExecutiveDashboard;
exports.default = ExecutiveDashboard;
