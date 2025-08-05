"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutiveDashboard = ExecutiveDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
// Import dashboard components
var ExecutiveSummary_1 = require("./ExecutiveSummary");
var PerformanceMetrics_1 = require("./PerformanceMetrics");
var DashboardGrid_1 = require("./DashboardGrid");
var ChartWidget_1 = require("./ChartWidget");
var AlertPanel_1 = require("./AlertPanel");
var FilterPanel_1 = require("./FilterPanel");
var ExecutiveReportGenerator_1 = require("./ExecutiveReportGenerator");
var KPICard_1 = require("./KPICard");
// Import dashboard engine
var executive_dashboard_engine_1 = require("@/lib/dashboard/executive-dashboard-engine");
var DATE_PRESETS = [
  {
    label: "Today",
    value: "today",
    getRange: function () {
      return { from: new Date(), to: new Date() };
    },
  },
  {
    label: "Yesterday",
    value: "yesterday",
    getRange: function () {
      var yesterday = (0, date_fns_1.subDays)(new Date(), 1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    label: "This Week",
    value: "thisWeek",
    getRange: function () {
      return {
        from: (0, date_fns_1.startOfWeek)(new Date()),
        to: (0, date_fns_1.endOfWeek)(new Date()),
      };
    },
  },
  {
    label: "This Month",
    value: "thisMonth",
    getRange: function () {
      return {
        from: (0, date_fns_1.startOfMonth)(new Date()),
        to: (0, date_fns_1.endOfMonth)(new Date()),
      };
    },
  },
  {
    label: "Last 7 Days",
    value: "last7Days",
    getRange: function () {
      return { from: (0, date_fns_1.subDays)(new Date(), 7), to: new Date() };
    },
  },
  {
    label: "Last 30 Days",
    value: "last30Days",
    getRange: function () {
      return { from: (0, date_fns_1.subDays)(new Date(), 30), to: new Date() };
    },
  },
  {
    label: "Last 90 Days",
    value: "last90Days",
    getRange: function () {
      return { from: (0, date_fns_1.subDays)(new Date(), 90), to: new Date() };
    },
  },
];
var DASHBOARD_TABS = [
  { id: "overview", label: "Overview", icon: lucide_react_1.LayoutDashboard },
  { id: "metrics", label: "Metrics", icon: lucide_react_1.BarChart3 },
  { id: "analytics", label: "Analytics", icon: lucide_react_1.TrendingUp },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "alerts", label: "Alerts", icon: lucide_react_1.AlertTriangle },
];
function ExecutiveDashboard(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    userId = _a.userId,
    _b = _a.className,
    className = _b === void 0 ? "" : _b,
    _c = _a.defaultTab,
    defaultTab = _c === void 0 ? "overview" : _c,
    _d = _a.showHeader,
    showHeader = _d === void 0 ? true : _d,
    _e = _a.showFilters,
    showFilters = _e === void 0 ? true : _e,
    _f = _a.autoRefresh,
    autoRefresh = _f === void 0 ? true : _f,
    _g = _a.refreshInterval, // 5 minutes
    refreshInterval = _g === void 0 ? 300000 : _g; // 5 minutes
  // Dashboard state
  var _h = (0, react_1.useState)({
      data: null,
      widgets: [],
      kpis: [],
      alerts: [],
      isLoading: true,
      error: null,
      lastUpdated: null,
    }),
    state = _h[0],
    setState = _h[1];
  // Dashboard filters
  var _j = (0, react_1.useState)({
      dateRange: {
        from: (0, date_fns_1.subDays)(new Date(), 30),
        to: new Date(),
      },
      categories: [],
      departments: [],
      providers: [],
      patientTypes: [],
      compareWithPrevious: false,
    }),
    filters = _j[0],
    setFilters = _j[1];
  // Dashboard UI state
  var _k = (0, react_1.useState)({
      activeTab: defaultTab,
      isFullscreen: false,
      showFilters: showFilters,
      showAlerts: true,
      viewMode: "grid",
      gridLayout: "comfortable",
      autoRefresh: autoRefresh,
      refreshInterval: refreshInterval,
    }),
    ui = _k[0],
    setUI = _k[1];
  // Dashboard engine instance
  var dashboardEngine = (0, react_1.useState)(function () {
    return new executive_dashboard_engine_1.ExecutiveDashboardEngine();
  })[0];
  // Real-time subscription
  var _l = (0, react_1.useState)(null),
    realtimeSubscription = _l[0],
    setRealtimeSubscription = _l[1];
  // Load dashboard data
  var loadDashboardData = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var dashboardData, kpis, alerts, widgets, subscription, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setState(function (prev) {
                return __assign(__assign({}, prev), { isLoading: true, error: null });
              });
              _a.label = 1;
            case 1:
              _a.trys.push([1, 8, , 9]);
              // Initialize dashboard engine
              return [
                4 /*yield*/,
                dashboardEngine.initialize({
                  clinicId: clinicId,
                  userId: userId,
                  dateRange: filters.dateRange,
                  filters: {
                    categories: filters.categories,
                    departments: filters.departments,
                    providers: filters.providers,
                    patientTypes: filters.patientTypes,
                  },
                  realTimeEnabled: ui.autoRefresh,
                  refreshInterval: ui.refreshInterval,
                }),
              ];
            case 2:
              // Initialize dashboard engine
              _a.sent();
              return [4 /*yield*/, dashboardEngine.getDashboardData()];
            case 3:
              dashboardData = _a.sent();
              return [4 /*yield*/, dashboardEngine.calculateKPIs()];
            case 4:
              kpis = _a.sent();
              return [4 /*yield*/, dashboardEngine.getAlerts()];
            case 5:
              alerts = _a.sent();
              widgets = generateDefaultWidgets();
              setState({
                data: dashboardData,
                widgets: widgets,
                kpis: kpis,
                alerts: alerts,
                isLoading: false,
                error: null,
                lastUpdated: new Date(),
              });
              if (!ui.autoRefresh) return [3 /*break*/, 7];
              return [
                4 /*yield*/,
                dashboardEngine.setupRealTimeUpdates({
                  onUpdate: function (updatedData) {
                    setState(function (prev) {
                      return __assign(__assign({}, prev), {
                        data: __assign(__assign({}, prev.data), updatedData),
                        lastUpdated: new Date(),
                      });
                    });
                  },
                  onError: function (error) {
                    console.error("Real-time update error:", error);
                  },
                }),
              ];
            case 6:
              subscription = _a.sent();
              setRealtimeSubscription(subscription);
              _a.label = 7;
            case 7:
              return [3 /*break*/, 9];
            case 8:
              error_1 = _a.sent();
              console.error("Failed to load dashboard data:", error_1);
              setState(function (prev) {
                return __assign(__assign({}, prev), {
                  isLoading: false,
                  error:
                    error_1 instanceof Error ? error_1.message : "Failed to load dashboard data",
                });
              });
              return [3 /*break*/, 9];
            case 9:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId, userId, filters, ui.autoRefresh, ui.refreshInterval, dashboardEngine],
  );
  // Load data on mount and when dependencies change
  (0, react_1.useEffect)(
    function () {
      loadDashboardData();
      // Cleanup real-time subscription on unmount
      return function () {
        var _a;
        if (realtimeSubscription) {
          (_a = realtimeSubscription.unsubscribe) === null || _a === void 0
            ? void 0
            : _a.call(realtimeSubscription);
        }
      };
    },
    [loadDashboardData],
  );
  // Auto-refresh interval
  (0, react_1.useEffect)(
    function () {
      if (!ui.autoRefresh) return;
      var interval = setInterval(function () {
        loadDashboardData();
      }, ui.refreshInterval);
      return function () {
        return clearInterval(interval);
      };
    },
    [ui.autoRefresh, ui.refreshInterval, loadDashboardData],
  );
  // Handle filter changes
  var handleFilterChange = (0, react_1.useCallback)(function (newFilters) {
    setFilters(function (prev) {
      return __assign(__assign({}, prev), newFilters);
    });
  }, []);
  // Handle UI changes
  var handleUIChange = (0, react_1.useCallback)(function (newUI) {
    setUI(function (prev) {
      return __assign(__assign({}, prev), newUI);
    });
  }, []);
  // Handle manual refresh
  var handleRefresh = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadDashboardData()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadDashboardData],
  );
  // Handle date preset selection
  var handleDatePresetChange = (0, react_1.useCallback)(
    function (presetValue) {
      var preset = DATE_PRESETS.find(function (p) {
        return p.value === presetValue;
      });
      if (preset) {
        var range = preset.getRange();
        handleFilterChange({ dateRange: range });
      }
    },
    [handleFilterChange],
  );
  // Handle export
  var handleExport = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var exportData, dataStr, dataBlob, url, link;
        return __generator(this, function (_a) {
          try {
            exportData = {
              dashboard: state.data,
              kpis: state.kpis,
              alerts: state.alerts,
              filters: filters,
              period: filters.dateRange,
              exportedAt: new Date().toISOString(),
              clinicId: clinicId,
              userId: userId,
            };
            dataStr = JSON.stringify(exportData, null, 2);
            dataBlob = new Blob([dataStr], { type: "application/json" });
            url = URL.createObjectURL(dataBlob);
            link = document.createElement("a");
            link.href = url;
            link.download = "executive-dashboard-".concat(
              (0, date_fns_1.format)(new Date(), "yyyy-MM-dd-HHmm"),
              ".json",
            );
            link.click();
            URL.revokeObjectURL(url);
          } catch (error) {
            console.error("Failed to export dashboard:", error);
          }
          return [2 /*return*/];
        });
      });
    },
    [state, filters, clinicId, userId],
  );
  // Toggle fullscreen
  var toggleFullscreen = (0, react_1.useCallback)(
    function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        handleUIChange({ isFullscreen: true });
      } else {
        document.exitFullscreen();
        handleUIChange({ isFullscreen: false });
      }
    },
    [handleUIChange],
  );
  // Get active alerts count
  var activeAlertsCount = state.alerts.filter(function (alert) {
    return !alert.acknowledged;
  }).length;
  // Get critical alerts count
  var criticalAlertsCount = state.alerts.filter(function (alert) {
    return alert.severity === "critical" && !alert.acknowledged;
  }).length;
  if (state.isLoading && !state.data) {
    return (
      <div className={"min-h-screen bg-gray-50 ".concat(className)}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading executive dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  if (state.error) {
    return (
      <div className={"min-h-screen bg-gray-50 ".concat(className)}>
        <card_1.Card className="m-6">
          <card_1.CardContent className="p-6">
            <div className="text-center">
              <lucide_react_1.AlertTriangle className="h-8 w-8 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-semibold mb-2">Dashboard Error</h3>
              <p className="text-muted-foreground mb-4">{state.error}</p>
              <button_1.Button onClick={handleRefresh}>
                <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </button_1.Button>
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  return (
    <div className={"min-h-screen bg-gray-50 ".concat(className)}>
      {/* Header */}
      {showHeader && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <lucide_react_1.Brain className="h-6 w-6" />
                  Executive Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                  Last updated:{" "}
                  {state.lastUpdated ? (0, date_fns_1.format)(state.lastUpdated, "PPp") : "Never"}
                  {state.isLoading && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <lucide_react_1.RefreshCw className="h-3 w-3 animate-spin" />
                      Updating...
                    </span>
                  )}
                </p>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-2">
                <lucide_react_1.Calendar className="h-4 w-4 text-muted-foreground" />
                <select_1.Select onValueChange={handleDatePresetChange}>
                  <select_1.SelectTrigger className="w-40">
                    <select_1.SelectValue placeholder="Select period" />
                  </select_1.SelectTrigger>
                  <select_1.SelectContent>
                    {DATE_PRESETS.map(function (preset) {
                      return (
                        <select_1.SelectItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </select_1.SelectItem>
                      );
                    })}
                  </select_1.SelectContent>
                </select_1.Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Alerts Badge */}
              {activeAlertsCount > 0 && (
                <button_1.Button
                  variant="outline"
                  size="sm"
                  onClick={function () {
                    return handleUIChange({ activeTab: "alerts" });
                  }}
                  className={
                    criticalAlertsCount > 0
                      ? "border-red-200 text-red-600"
                      : "border-yellow-200 text-yellow-600"
                  }
                >
                  <lucide_react_1.Bell className="h-4 w-4 mr-1" />
                  {activeAlertsCount}
                  {criticalAlertsCount > 0 && (
                    <badge_1.Badge variant="destructive" className="ml-1 text-xs">
                      {criticalAlertsCount}
                    </badge_1.Badge>
                  )}
                </button_1.Button>
              )}

              {/* Auto-refresh toggle */}
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return handleUIChange({ autoRefresh: !ui.autoRefresh });
                }}
                className={ui.autoRefresh ? "bg-green-50 border-green-200 text-green-700" : ""}
              >
                <lucide_react_1.RefreshCw
                  className={"h-4 w-4 ".concat(ui.autoRefresh ? "animate-spin" : "")}
                />
              </button_1.Button>

              {/* Filters toggle */}
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return handleUIChange({ showFilters: !ui.showFilters });
                }}
                className={ui.showFilters ? "bg-blue-50 border-blue-200 text-blue-700" : ""}
              >
                <lucide_react_1.Filter className="h-4 w-4" />
              </button_1.Button>

              {/* Export */}
              <button_1.Button variant="outline" size="sm" onClick={handleExport}>
                <lucide_react_1.Download className="h-4 w-4" />
              </button_1.Button>

              {/* Fullscreen toggle */}
              <button_1.Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {ui.isFullscreen
                  ? <lucide_react_1.Minimize2 className="h-4 w-4" />
                  : <lucide_react_1.Maximize2 className="h-4 w-4" />}
              </button_1.Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {ui.showFilters && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <FilterPanel_1.FilterPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            className=""
          />
        </div>
      )}

      {/* Main Content */}
      <div className="p-6">
        <tabs_1.Tabs
          value={ui.activeTab}
          onValueChange={function (tab) {
            return handleUIChange({ activeTab: tab });
          }}
        >
          <tabs_1.TabsList className="grid w-full grid-cols-5">
            {DASHBOARD_TABS.map(function (tab) {
              var Icon = tab.icon;
              return (
                <tabs_1.TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === "alerts" && activeAlertsCount > 0 && (
                    <badge_1.Badge variant="destructive" className="ml-1 text-xs">
                      {activeAlertsCount}
                    </badge_1.Badge>
                  )}
                </tabs_1.TabsTrigger>
              );
            })}
          </tabs_1.TabsList>

          {/* Overview Tab */}
          <tabs_1.TabsContent value="overview" className="space-y-6">
            {/* Executive Summary */}
            <ExecutiveSummary_1.ExecutiveSummary
              clinicId={clinicId}
              dateRange={filters.dateRange}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
            />

            {/* Key KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {state.kpis.slice(0, 4).map(function (kpi) {
                return (
                  <KPICard_1.KPICard
                    key={kpi.id}
                    metric={kpi}
                    showTrend={true}
                    showTarget={true}
                    className=""
                  />
                );
              })}
            </div>

            {/* Dashboard Grid */}
            <DashboardGrid_1.DashboardGrid
              widgets={state.widgets}
              onWidgetsChange={function (widgets) {
                return setState(function (prev) {
                  return __assign(__assign({}, prev), { widgets: widgets });
                });
              }}
              layout={ui.gridLayout}
              editable={true}
              className=""
            />
          </tabs_1.TabsContent>

          {/* Metrics Tab */}
          <tabs_1.TabsContent value="metrics" className="space-y-6">
            <PerformanceMetrics_1.PerformanceMetrics
              clinicId={clinicId}
              dateRange={filters.dateRange}
              showTargets={true}
              showBenchmarks={true}
              showTrends={true}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
            />
          </tabs_1.TabsContent>

          {/* Analytics Tab */}
          <tabs_1.TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChartWidget_1.ChartWidget
                id="revenue-trend"
                title="Revenue Trend"
                type="line"
                dataSource="revenue"
                config={{
                  showGrid: true,
                  showLegend: true,
                  showTooltip: true,
                  colors: ["#3b82f6", "#10b981"],
                  height: 300,
                  animated: true,
                  responsive: true,
                }}
                refreshInterval={ui.refreshInterval}
              />

              <ChartWidget_1.ChartWidget
                id="patient-distribution"
                title="Patient Distribution"
                type="pie"
                dataSource="patients"
                config={{
                  showLegend: true,
                  showTooltip: true,
                  colors: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
                  height: 300,
                  animated: true,
                  responsive: true,
                }}
                refreshInterval={ui.refreshInterval}
              />
            </div>
          </tabs_1.TabsContent>

          {/* Reports Tab */}
          <tabs_1.TabsContent value="reports" className="space-y-6">
            <ExecutiveReportGenerator_1.ExecutiveReportGenerator
              clinicId={clinicId}
              dateRange={filters.dateRange}
              className=""
            />
          </tabs_1.TabsContent>

          {/* Alerts Tab */}
          <tabs_1.TabsContent value="alerts" className="space-y-6">
            <AlertPanel_1.AlertPanel
              alerts={state.alerts}
              onAlertsChange={function (alerts) {
                return setState(function (prev) {
                  return __assign(__assign({}, prev), { alerts: alerts });
                });
              }}
              autoRefresh={ui.autoRefresh}
              refreshInterval={ui.refreshInterval}
              className=""
            />
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </div>
  );
}
// Helper function to generate default widgets
function generateDefaultWidgets() {
  return [
    {
      id: "revenue-metric",
      type: "metric",
      title: "Monthly Revenue",
      position: { x: 0, y: 0, w: 3, h: 2 },
      config: {
        metric: "revenue",
        format: "currency",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "patient-satisfaction",
      type: "metric",
      title: "Patient Satisfaction",
      position: { x: 3, y: 0, w: 3, h: 2 },
      config: {
        metric: "satisfaction",
        format: "number",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "appointments-chart",
      type: "chart",
      title: "Appointments Trend",
      position: { x: 6, y: 0, w: 6, h: 4 },
      config: {
        type: "line",
        dataSource: "appointments",
        timeRange: "30d",
      },
      visible: true,
      locked: false,
    },
    {
      id: "efficiency-metric",
      type: "metric",
      title: "Operational Efficiency",
      position: { x: 0, y: 2, w: 3, h: 2 },
      config: {
        metric: "efficiency",
        format: "percentage",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
    {
      id: "wait-time-metric",
      type: "metric",
      title: "Average Wait Time",
      position: { x: 3, y: 2, w: 3, h: 2 },
      config: {
        metric: "waitTime",
        format: "duration",
        showTrend: true,
        showTarget: true,
      },
      visible: true,
      locked: false,
    },
  ];
}
