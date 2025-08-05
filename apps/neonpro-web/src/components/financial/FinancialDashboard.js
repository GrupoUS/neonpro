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
exports.FinancialDashboard = FinancialDashboard;
var react_1 = require("react");
var card_1 = require("@neonpro/ui/card");
var button_1 = require("@neonpro/ui/button");
var badge_1 = require("@neonpro/ui/badge");
var tabs_1 = require("@neonpro/ui/tabs");
var select_1 = require("@neonpro/ui/select");
var alert_1 = require("@neonpro/ui/alert");
var skeleton_1 = require("@neonpro/ui/skeleton");
var progress_1 = require("@neonpro/ui/progress");
var lucide_react_1 = require("lucide-react");
var financial_1 = require("@/lib/financial");
var FinancialKPICards_1 = require("./FinancialKPICards");
var FinancialCharts_1 = require("./FinancialCharts");
var FinancialReports_1 = require("./FinancialReports");
var FinancialInsights_1 = require("./FinancialInsights");
var FinancialSettings_1 = require("./FinancialSettings");
function FinancialDashboard(_a) {
  var clinicId = _a.clinicId,
    supabaseUrl = _a.supabaseUrl,
    supabaseKey = _a.supabaseKey,
    _b = _a.className,
    className = _b === void 0 ? "" : _b;
  // State Management
  var _c = (0, react_1.useState)(null),
    financialSystem = _c[0],
    setFinancialSystem = _c[1];
  var _d = (0, react_1.useState)(null),
    dashboardData = _d[0],
    setDashboardData = _d[1];
  var _e = (0, react_1.useState)(null),
    systemHealth = _e[0],
    setSystemHealth = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(null),
    error = _g[0],
    setError = _g[1];
  var _h = (0, react_1.useState)(false),
    refreshing = _h[0],
    setRefreshing = _h[1];
  var _j = (0, react_1.useState)("overview"),
    activeTab = _j[0],
    setActiveTab = _j[1];
  var _k = (0, react_1.useState)("month"),
    timeframe = _k[0],
    setTimeframe = _k[1];
  var _l = (0, react_1.useState)(true),
    autoRefresh = _l[0],
    setAutoRefresh = _l[1];
  var _m = (0, react_1.useState)(300000),
    refreshInterval = _m[0],
    setRefreshInterval = _m[1]; // 5 minutes
  // Initialize Financial System
  var initializeSystem = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var config, system, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 4, 5, 6]);
              setLoading(true);
              setError(null);
              config = (0, financial_1.getDefaultFinancialConfig)(
                clinicId,
                supabaseUrl,
                supabaseKey,
              );
              system = new financial_1.FinancialSystem(config);
              return [4 /*yield*/, system.initialize()];
            case 1:
              _a.sent();
              setFinancialSystem(system);
              // Load initial data
              return [4 /*yield*/, loadDashboardData(system)];
            case 2:
              // Load initial data
              _a.sent();
              return [4 /*yield*/, checkSystemHealth(system)];
            case 3:
              _a.sent();
              return [3 /*break*/, 6];
            case 4:
              err_1 = _a.sent();
              console.error("Failed to initialize financial system:", err_1);
              setError("Failed to initialize financial system. Please check your configuration.");
              return [3 /*break*/, 6];
            case 5:
              setLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [clinicId, supabaseUrl, supabaseKey],
  );
  // Load Dashboard Data
  var loadDashboardData = (0, react_1.useCallback)(
    (system) =>
      __awaiter(this, void 0, void 0, function () {
        var activeSystem, overview, err_2;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              activeSystem = system || financialSystem;
              if (!activeSystem) return [2 /*return*/];
              return [4 /*yield*/, activeSystem.getFinancialOverview(timeframe)];
            case 1:
              overview = _a.sent();
              setDashboardData(__assign(__assign({}, overview), { lastUpdated: new Date() }));
              return [3 /*break*/, 3];
            case 2:
              err_2 = _a.sent();
              console.error("Failed to load dashboard data:", err_2);
              setError("Failed to load dashboard data.");
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [financialSystem, timeframe],
  );
  // Check System Health
  var checkSystemHealth = (0, react_1.useCallback)(
    (system) =>
      __awaiter(this, void 0, void 0, function () {
        var activeSystem, health, err_3;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              activeSystem = system || financialSystem;
              if (!activeSystem) return [2 /*return*/];
              return [4 /*yield*/, activeSystem.healthCheck()];
            case 1:
              health = _a.sent();
              setSystemHealth(health);
              return [3 /*break*/, 3];
            case 2:
              err_3 = _a.sent();
              console.error("Failed to check system health:", err_3);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      }),
    [financialSystem],
  );
  // Refresh Data
  var refreshData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var err_4;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!financialSystem || refreshing) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setRefreshing(true);
              return [4 /*yield*/, Promise.all([loadDashboardData(), checkSystemHealth()])];
            case 2:
              _a.sent();
              return [3 /*break*/, 5];
            case 3:
              err_4 = _a.sent();
              console.error("Failed to refresh data:", err_4);
              return [3 /*break*/, 5];
            case 4:
              setRefreshing(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [financialSystem, refreshing, loadDashboardData, checkSystemHealth],
  );
  // Auto Refresh Effect
  (0, react_1.useEffect)(() => {
    if (!autoRefresh || !financialSystem) return;
    var interval = setInterval(refreshData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData, financialSystem]);
  // Initialize on mount
  (0, react_1.useEffect)(() => {
    initializeSystem();
    // Cleanup on unmount
    return () => {
      if (financialSystem) {
        financialSystem.shutdown();
      }
    };
  }, [initializeSystem]);
  // Timeframe change effect
  (0, react_1.useEffect)(() => {
    if (financialSystem && !loading) {
      loadDashboardData();
    }
  }, [timeframe, financialSystem, loading, loadDashboardData]);
  // Render Loading State
  if (loading) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <div className="flex items-center justify-between">
          <div>
            <skeleton_1.Skeleton className="h-8 w-64 mb-2" />
            <skeleton_1.Skeleton className="h-4 w-96" />
          </div>
          <skeleton_1.Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {__spreadArray([], Array(4), true).map((_, i) => (
            <card_1.Card key={i}>
              <card_1.CardHeader className="pb-2">
                <skeleton_1.Skeleton className="h-4 w-24" />
                <skeleton_1.Skeleton className="h-8 w-16" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <skeleton_1.Skeleton className="h-4 w-20" />
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <card_1.Card>
            <card_1.CardHeader>
              <skeleton_1.Skeleton className="h-6 w-32" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <skeleton_1.Skeleton className="h-64 w-full" />
            </card_1.CardContent>
          </card_1.Card>
          <card_1.Card>
            <card_1.CardHeader>
              <skeleton_1.Skeleton className="h-6 w-32" />
            </card_1.CardHeader>
            <card_1.CardContent>
              <skeleton_1.Skeleton className="h-64 w-full" />
            </card_1.CardContent>
          </card_1.Card>
        </div>
      </div>
    );
  }
  // Render Error State
  if (error) {
    return (
      <div className={"space-y-6 ".concat(className)}>
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertTitle>Error</alert_1.AlertTitle>
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>

        <div className="flex justify-center">
          <button_1.Button onClick={initializeSystem} variant="outline">
            <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button_1.Button>
        </div>
      </div>
    );
  }
  // Get status color for system health
  var getHealthColor = (status) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };
  // Get status icon for system health
  var getHealthIcon = (status) => {
    switch (status) {
      case "healthy":
        return <lucide_react_1.CheckCircle className="h-4 w-4" />;
      case "degraded":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      case "unhealthy":
        return <lucide_react_1.AlertTriangle className="h-4 w-4" />;
      default:
        return <lucide_react_1.Activity className="h-4 w-4" />;
    }
  };
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive financial analytics and business intelligence
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* System Health Indicator */}
          {systemHealth && (
            <badge_1.Badge
              variant={systemHealth.status === "healthy" ? "default" : "destructive"}
              className={"".concat(getHealthColor(systemHealth.status), " flex items-center gap-1")}
            >
              {getHealthIcon(systemHealth.status)}
              {systemHealth.status} ({systemHealth.overall_score.toFixed(0)}%)
            </badge_1.Badge>
          )}

          {/* Last Updated */}
          {dashboardData && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <lucide_react_1.Clock className="h-3 w-3" />
              {dashboardData.lastUpdated.toLocaleTimeString()}
            </div>
          )}

          {/* Refresh Button */}
          <button_1.Button onClick={refreshData} disabled={refreshing} variant="outline" size="sm">
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(refreshing ? "animate-spin" : "")}
            />
            Refresh
          </button_1.Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Timeframe:</label>
            <select_1.Select value={timeframe} onValueChange={(value) => setTimeframe(value)}>
              <select_1.SelectTrigger className="w-32">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="day">Today</select_1.SelectItem>
                <select_1.SelectItem value="week">This Week</select_1.SelectItem>
                <select_1.SelectItem value="month">This Month</select_1.SelectItem>
                <select_1.SelectItem value="quarter">This Quarter</select_1.SelectItem>
                <select_1.SelectItem value="year">This Year</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2">
            <button_1.Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
            >
              <lucide_react_1.Zap className="h-4 w-4 mr-2" />
              Auto Refresh
            </button_1.Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Export
          </button_1.Button>
          <button_1.Button variant="outline" size="sm">
            <lucide_react_1.Settings className="h-4 w-4 mr-2" />
            Settings
          </button_1.Button>
        </div>
      </div>

      {/* Main Content */}
      <tabs_1.Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <tabs_1.TabsList className="grid w-full grid-cols-5">
          <tabs_1.TabsTrigger value="overview" className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-4 w-4" />
            Overview
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="analytics" className="flex items-center gap-2">
            <lucide_react_1.LineChart className="h-4 w-4" />
            Analytics
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="reports" className="flex items-center gap-2">
            <lucide_react_1.PieChart className="h-4 w-4" />
            Reports
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="insights" className="flex items-center gap-2">
            <lucide_react_1.Target className="h-4 w-4" />
            Insights
          </tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="settings" className="flex items-center gap-2">
            <lucide_react_1.Settings className="h-4 w-4" />
            Settings
          </tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Overview Tab */}
        <tabs_1.TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          {(dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.kpis) && (
            <FinancialKPICards_1.FinancialKPICards
              kpis={dashboardData.kpis}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}

          {/* Charts Grid */}
          {(dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.charts) && (
            <FinancialCharts_1.FinancialCharts
              charts={dashboardData.charts}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}

          {/* Quick Insights */}
          {(dashboardData === null || dashboardData === void 0
            ? void 0
            : dashboardData.insights) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Target className="h-5 w-5" />
                    Key Insights
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Automated financial insights and recommendations
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  <div className="space-y-3">
                    {dashboardData.insights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                        <div
                          className={"p-1 rounded-full ".concat(
                            insight.type === "positive"
                              ? "bg-green-100 text-green-600"
                              : insight.type === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-red-100 text-red-600",
                          )}
                        >
                          {insight.type === "positive"
                            ? <lucide_react_1.TrendingUp className="h-4 w-4" />
                            : insight.type === "warning"
                              ? <lucide_react_1.AlertTriangle className="h-4 w-4" />
                              : <lucide_react_1.TrendingDown className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          {insight.recommendation && (
                            <p className="text-xs text-blue-600 mt-1">{insight.recommendation}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </card_1.CardContent>
              </card_1.Card>

              {/* System Status */}
              <card_1.Card>
                <card_1.CardHeader>
                  <card_1.CardTitle className="flex items-center gap-2">
                    <lucide_react_1.Activity className="h-5 w-5" />
                    System Status
                  </card_1.CardTitle>
                  <card_1.CardDescription>
                    Financial system health and performance
                  </card_1.CardDescription>
                </card_1.CardHeader>
                <card_1.CardContent>
                  {systemHealth && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Health</span>
                        <badge_1.Badge
                          variant={systemHealth.status === "healthy" ? "default" : "destructive"}
                        >
                          {systemHealth.status}
                        </badge_1.Badge>
                      </div>

                      <progress_1.Progress value={systemHealth.overall_score} className="h-2" />

                      <div className="space-y-2">
                        {Object.entries(systemHealth.modules).map((_a) => {
                          var module = _a[0],
                            status = _a[1];
                          return (
                            <div key={module} className="flex items-center justify-between text-sm">
                              <span className="capitalize">{module.replace("_", " ")}</span>
                              <div
                                className={"flex items-center gap-1 ".concat(
                                  getHealthColor(status.status),
                                )}
                              >
                                {getHealthIcon(status.status)}
                                <span className="capitalize">{status.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </card_1.CardContent>
              </card_1.Card>
            </div>
          )}
        </tabs_1.TabsContent>

        {/* Analytics Tab */}
        <tabs_1.TabsContent value="analytics" className="space-y-6">
          {(dashboardData === null || dashboardData === void 0
            ? void 0
            : dashboardData.analytics) && (
            <FinancialCharts_1.FinancialCharts
              charts={dashboardData.charts}
              analytics={dashboardData.analytics}
              timeframe={timeframe}
              loading={refreshing}
              detailed={true}
            />
          )}
        </tabs_1.TabsContent>

        {/* Reports Tab */}
        <tabs_1.TabsContent value="reports" className="space-y-6">
          {(dashboardData === null || dashboardData === void 0 ? void 0 : dashboardData.reports) &&
            financialSystem && (
              <FinancialReports_1.FinancialReports
                reports={dashboardData.reports}
                financialSystem={financialSystem}
                timeframe={timeframe}
                loading={refreshing}
              />
            )}
        </tabs_1.TabsContent>

        {/* Insights Tab */}
        <tabs_1.TabsContent value="insights" className="space-y-6">
          {(dashboardData === null || dashboardData === void 0
            ? void 0
            : dashboardData.insights) && (
            <FinancialInsights_1.FinancialInsights
              insights={dashboardData.insights}
              analytics={dashboardData.analytics}
              kpis={dashboardData.kpis}
              timeframe={timeframe}
              loading={refreshing}
            />
          )}
        </tabs_1.TabsContent>

        {/* Settings Tab */}
        <tabs_1.TabsContent value="settings" className="space-y-6">
          {financialSystem && (
            <FinancialSettings_1.FinancialSettings
              financialSystem={financialSystem}
              autoRefresh={autoRefresh}
              refreshInterval={refreshInterval}
              onAutoRefreshChange={setAutoRefresh}
              onRefreshIntervalChange={setRefreshInterval}
              onSystemReset={initializeSystem}
            />
          )}
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
exports.default = FinancialDashboard;
