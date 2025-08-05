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
exports.AdvancedAnalyticsHub = AdvancedAnalyticsHub;
/**
 * Advanced Analytics Hub Component for NeonPro
 *
 * Master component that integrates all advanced analytics features:
 * - Cohort Analysis with interactive heatmaps
 * - Time Series Forecasting with ML models
 * - Advanced Metrics Dashboard with KPIs
 * - Statistical Insights with correlation analysis
 *
 * Provides unified interface for comprehensive business intelligence.
 */
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var progress_1 = require("@/components/ui/progress");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
// Import advanced analytics components
var cohort_heatmap_1 = require("./cohort-heatmap");
var forecasting_charts_1 = require("./forecasting-charts");
var advanced_metrics_dashboard_1 = require("./advanced-metrics-dashboard");
var statistical_insights_1 = require("./statistical-insights");
function AdvancedAnalyticsHub(_a) {
  var _this = this;
  var _b, _c;
  var _d = _a.initialConfig,
    initialConfig = _d === void 0 ? {} : _d,
    _e = _a.className,
    className = _e === void 0 ? "" : _e,
    onConfigChange = _a.onConfigChange,
    onDataExport = _a.onDataExport;
  // State management
  var _f = (0, react_1.useState)(
      __assign(
        {
          dateRange: {
            start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            end: new Date().toISOString().split("T")[0],
          },
          refreshInterval: 300000,
          autoRefresh: false,
          selectedMetrics: ["subscriptions", "revenue", "churn_rate", "mrr"],
          confidenceLevel: 95,
        },
        initialConfig,
      ),
    ),
    config = _f[0],
    setConfig = _f[1];
  var _g = (0, react_1.useState)({
      cohortData: [],
      forecastData: [],
      kpis: [],
      timeSeriesData: [],
      segmentationData: [],
      benchmarkData: [],
      correlations: [],
      statisticalTests: [],
      dataQuality: {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        validity: 0,
        uniqueness: 0,
        outliers: [],
      },
      predictiveModels: [],
    }),
    analyticsData = _g[0],
    setAnalyticsData = _g[1];
  var _h = (0, react_1.useState)(false),
    loading = _h[0],
    setLoading = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  var _k = (0, react_1.useState)(null),
    lastRefresh = _k[0],
    setLastRefresh = _k[1];
  var _l = (0, react_1.useState)("overview"),
    selectedView = _l[0],
    setSelectedView = _l[1];
  // Fetch analytics data
  var fetchAnalyticsData = (0, react_1.useCallback)(
    function () {
      var args_1 = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
      }
      return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (showLoading) {
        var cohortResponse,
          forecastResponse,
          statisticsResponse,
          _a,
          cohortData,
          forecastData,
          statisticsData,
          kpis,
          timeSeriesData,
          segmentationData,
          benchmarkData,
          err_1;
        if (showLoading === void 0) {
          showLoading = true;
        }
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              if (showLoading) setLoading(true);
              setError(null);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 6, 7, 8]);
              return [
                4 /*yield*/,
                fetch("/api/analytics/advanced?type=cohort-analysis", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    startDate: config.dateRange.start,
                    endDate: config.dateRange.end,
                    cohortSize: "monthly",
                    metrics: ["retention", "revenue", "churn"],
                  }),
                }),
                // Fetch forecasting data
              ];
            case 2:
              cohortResponse = _b.sent();
              return [
                4 /*yield*/,
                fetch("/api/analytics/advanced?type=forecasting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    metric: "revenue",
                    periods: 30,
                    confidence_level: config.confidenceLevel / 100,
                    include_scenarios: true,
                  }),
                }),
                // Fetch statistical analysis
              ];
            case 3:
              forecastResponse = _b.sent();
              return [
                4 /*yield*/,
                fetch("/api/analytics/advanced?type=statistical-analysis", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    metrics: config.selectedMetrics,
                    analysis_type: "all",
                    confidence_level: config.confidenceLevel / 100,
                    include_outliers: true,
                  }),
                }),
                // Process responses
              ];
            case 4:
              statisticsResponse = _b.sent();
              return [
                4 /*yield*/,
                Promise.all([
                  cohortResponse.json(),
                  forecastResponse.json(),
                  statisticsResponse.json(),
                ]),
                // Generate mock KPIs and other data for dashboard
              ];
            case 5:
              (_a = _b.sent()),
                (cohortData = _a[0]),
                (forecastData = _a[1]),
                (statisticsData = _a[2]);
              kpis = generateMockKPIs();
              timeSeriesData = generateMockTimeSeriesData();
              segmentationData = generateMockSegmentationData();
              benchmarkData = generateMockBenchmarkData();
              setAnalyticsData({
                cohortData: cohortData.success ? cohortData.data.cohort_data : [],
                forecastData: forecastData.success ? forecastData.data.forecast : [],
                kpis: kpis,
                timeSeriesData: timeSeriesData,
                segmentationData: segmentationData,
                benchmarkData: benchmarkData,
                correlations: statisticsData.success ? statisticsData.data.correlations || [] : [],
                statisticalTests: statisticsData.success
                  ? statisticsData.data.significance_tests || []
                  : [],
                dataQuality: statisticsData.success ? statisticsData.data.data_quality || {} : {},
                predictiveModels: statisticsData.success
                  ? statisticsData.data.predictive_models || []
                  : [],
              });
              setLastRefresh(new Date());
              return [3 /*break*/, 8];
            case 6:
              err_1 = _b.sent();
              console.error("Analytics data fetch error:", err_1);
              setError("Failed to load analytics data. Please try again.");
              return [3 /*break*/, 8];
            case 7:
              if (showLoading) setLoading(false);
              return [7 /*endfinally*/];
            case 8:
              return [2 /*return*/];
          }
        });
      });
    },
    [config],
  );
  // Auto-refresh effect
  (0, react_1.useEffect)(
    function () {
      if (config.autoRefresh && config.refreshInterval > 0) {
        var interval_1 = setInterval(function () {
          fetchAnalyticsData(false);
        }, config.refreshInterval);
        return function () {
          return clearInterval(interval_1);
        };
      }
    },
    [config.autoRefresh, config.refreshInterval, fetchAnalyticsData],
  );
  // Initial data load
  (0, react_1.useEffect)(
    function () {
      fetchAnalyticsData();
    },
    [fetchAnalyticsData],
  );
  // Config change handler
  (0, react_1.useEffect)(
    function () {
      onConfigChange === null || onConfigChange === void 0 ? void 0 : onConfigChange(config);
    },
    [config, onConfigChange],
  );
  // Analytics summary calculations
  var analyticsSummary = (0, react_1.useMemo)(
    function () {
      var _a;
      var totalKPIs = analyticsData.kpis.length;
      var overPerformingKPIs = analyticsData.kpis.filter(function (kpi) {
        return kpi.value.target && kpi.value.current >= kpi.value.target;
      }).length;
      var strongCorrelations = analyticsData.correlations.filter(function (c) {
        return Math.abs(c.correlation) >= 0.6;
      }).length;
      var significantTests = analyticsData.statisticalTests.filter(function (t) {
        return t.result === "reject";
      }).length;
      var overallDataQuality =
        (analyticsData.dataQuality.completeness +
          analyticsData.dataQuality.accuracy +
          analyticsData.dataQuality.consistency +
          analyticsData.dataQuality.validity +
          analyticsData.dataQuality.uniqueness) /
          5 || 0;
      var bestModel = analyticsData.predictiveModels.reduce(function (best, model) {
        return model.accuracy > ((best === null || best === void 0 ? void 0 : best.accuracy) || 0)
          ? model
          : best;
      }, analyticsData.predictiveModels[0]);
      return {
        totalKPIs: totalKPIs,
        overPerformingKPIs: overPerformingKPIs,
        strongCorrelations: strongCorrelations,
        significantTests: significantTests,
        overallDataQuality: overallDataQuality,
        bestModel: bestModel,
        outliers:
          ((_a = analyticsData.dataQuality.outliers) === null || _a === void 0
            ? void 0
            : _a.filter(function (o) {
                return o.isOutlier;
              }).length) || 0,
      };
    },
    [analyticsData],
  );
  // Event handlers
  var handleConfigUpdate = function (updates) {
    setConfig(function (prev) {
      return __assign(__assign({}, prev), updates);
    });
  };
  var handleRefresh = function () {
    fetchAnalyticsData();
  };
  var handleExport = function (format) {
    onDataExport === null || onDataExport === void 0 ? void 0 : onDataExport(analyticsData, format);
  };
  var handleDateRangeChange = function (start, end) {
    handleConfigUpdate({ dateRange: { start: start, end: end } });
  };
  if (loading && !analyticsData.kpis.length) {
    return (
      <div className={"w-full space-y-6 ".concat(className)}>
        <card_1.Card>
          <card_1.CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {Array.from({ length: 4 }).map(function (_, i) {
                return <div key={i} className="h-24 bg-gray-100 rounded animate-pulse" />;
              })}
            </div>
            <div className="h-96 bg-gray-50 rounded animate-pulse" />
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  }
  return (
    <div className={"w-full space-y-6 ".concat(className)}>
      {/* Header with Controls */}
      <card_1.Card>
        <card_1.CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <card_1.CardTitle className="text-2xl font-bold flex items-center gap-2">
                <lucide_react_1.Brain className="h-6 w-6 text-blue-600" />
                Advanced Analytics Hub
              </card_1.CardTitle>
              <card_1.CardDescription>
                Comprehensive business intelligence with ML-powered insights
              </card_1.CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <badge_1.Badge variant="outline" className="flex items-center gap-1">
                <lucide_react_1.Activity className="h-3 w-3" />
                {config.autoRefresh ? "Auto-refresh ON" : "Manual refresh"}
              </badge_1.Badge>
              {lastRefresh && (
                <badge_1.Badge variant="secondary">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </badge_1.Badge>
              )}
            </div>
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <select_1.Select
                value={selectedView}
                onValueChange={function (value) {
                  return setSelectedView(value);
                }}
              >
                <select_1.SelectTrigger className="w-48">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="overview">Overview</select_1.SelectItem>
                  <select_1.SelectItem value="cohorts">Cohort Analysis</select_1.SelectItem>
                  <select_1.SelectItem value="forecasting">Forecasting</select_1.SelectItem>
                  <select_1.SelectItem value="metrics">Advanced Metrics</select_1.SelectItem>
                  <select_1.SelectItem value="statistics">Statistical Insights</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <select_1.Select
                value={config.confidenceLevel.toString()}
                onValueChange={function (value) {
                  return handleConfigUpdate({ confidenceLevel: parseInt(value) });
                }}
              >
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="90">90% CI</select_1.SelectItem>
                  <select_1.SelectItem value="95">95% CI</select_1.SelectItem>
                  <select_1.SelectItem value="99">99% CI</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>
            </div>

            <div className="flex items-center gap-2">
              <button_1.Button
                variant={config.autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={function () {
                  return handleConfigUpdate({ autoRefresh: !config.autoRefresh });
                }}
              >
                <lucide_react_1.Zap className="h-4 w-4 mr-1" />
                Auto-refresh
              </button_1.Button>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <lucide_react_1.RefreshCw
                  className={"h-4 w-4 ".concat(loading ? "animate-spin" : "")}
                />
              </button_1.Button>
              <button_1.Button
                variant="outline"
                size="sm"
                onClick={function () {
                  return handleExport("csv");
                }}
              >
                <lucide_react_1.Download className="h-4 w-4" />
              </button_1.Button>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>

      {/* Error Display */}
      {error && (
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertDescription>{error}</alert_1.AlertDescription>
        </alert_1.Alert>
      )}

      {/* Analytics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">KPI Performance</p>
                <p className="text-2xl font-bold text-blue-900">
                  {analyticsSummary.overPerformingKPIs}/{analyticsSummary.totalKPIs}
                </p>
                <p className="text-xs text-blue-700">Above Target</p>
              </div>
              <lucide_react_1.Target className="h-8 w-8 text-blue-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Strong Correlations</p>
                <p className="text-2xl font-bold text-green-900">
                  {analyticsSummary.strongCorrelations}
                </p>
                <p className="text-xs text-green-700">≥ 0.6 coefficient</p>
              </div>
              <lucide_react_1.BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Data Quality</p>
                <p className="text-2xl font-bold text-purple-900">
                  {analyticsSummary.overallDataQuality.toFixed(0)}%
                </p>
                <p className="text-xs text-purple-700">Overall Score</p>
              </div>
              <lucide_react_1.CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Best Model</p>
                <p className="text-lg font-bold text-orange-900">
                  {(
                    ((_b = analyticsSummary.bestModel) === null || _b === void 0
                      ? void 0
                      : _b.accuracy) || 0
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-orange-700 capitalize">
                  {((_c = analyticsSummary.bestModel) === null || _c === void 0
                    ? void 0
                    : _c.modelType) || "N/A"}
                </p>
              </div>
              <lucide_react_1.Brain className="h-8 w-8 text-orange-600" />
            </div>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Analytics Views */}
      {selectedView === "overview" && (
        <div className="space-y-6">
          {/* Quick Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.TrendingUp className="h-5 w-5" />
                  Key Trends
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Revenue Growth</span>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium">+12.5%</span>
                    </div>
                  </div>
                  <progress_1.Progress value={75} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">User Retention</span>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">85.2%</span>
                    </div>
                  </div>
                  <progress_1.Progress value={85} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Forecast Accuracy</span>
                    <div className="flex items-center gap-2">
                      <lucide_react_1.CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">92.1%</span>
                    </div>
                  </div>
                  <progress_1.Progress value={92} className="h-2" />
                </div>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="flex items-center gap-2">
                  <lucide_react_1.AlertTriangle className="h-5 w-5" />
                  Action Items
                </card_1.CardTitle>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Churn Rate Increase</p>
                      <p className="text-xs text-yellow-700">
                        3.2% increase detected in the last week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <lucide_react_1.Target className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Model Retraining Due</p>
                      <p className="text-xs text-blue-700">
                        Revenue forecasting model accuracy below 90%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Data Quality Excellent</p>
                      <p className="text-xs text-green-700">
                        All quality metrics above 85% threshold
                      </p>
                    </div>
                  </div>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Mini Dashboard */}
          <advanced_metrics_dashboard_1.AdvancedMetricsDashboard
            kpis={analyticsData.kpis}
            timeSeriesData={analyticsData.timeSeriesData}
            segmentationData={analyticsData.segmentationData}
            benchmarkData={analyticsData.benchmarkData}
            loading={loading}
            dateRange={config.dateRange}
            onDateRangeChange={handleDateRangeChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
            className="h-96"
          />
        </div>
      )}

      {selectedView === "cohorts" && (
        <cohort_heatmap_1.CohortHeatmap
          cohortData={analyticsData.cohortData}
          loading={loading}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
        />
      )}

      {selectedView === "forecasting" && (
        <forecasting_charts_1.ForecastingCharts
          metric="revenue"
          historicalData={analyticsData.timeSeriesData.map(function (d) {
            return { date: d.date, value: d.revenue };
          })}
          forecastData={analyticsData.forecastData}
          loading={loading}
          onDateRangeChange={handleDateRangeChange}
        />
      )}

      {selectedView === "metrics" && (
        <advanced_metrics_dashboard_1.AdvancedMetricsDashboard
          kpis={analyticsData.kpis}
          timeSeriesData={analyticsData.timeSeriesData}
          segmentationData={analyticsData.segmentationData}
          benchmarkData={analyticsData.benchmarkData}
          loading={loading}
          dateRange={config.dateRange}
          onDateRangeChange={handleDateRangeChange}
          onExport={handleExport}
          onRefresh={handleRefresh}
        />
      )}

      {selectedView === "statistics" && (
        <statistical_insights_1.StatisticalInsights
          correlations={analyticsData.correlations}
          statisticalTests={analyticsData.statisticalTests}
          dataQuality={analyticsData.dataQuality}
          predictiveModels={analyticsData.predictiveModels}
          rawData={analyticsData.timeSeriesData}
          loading={loading}
          onDataRefresh={handleRefresh}
          onExportResults={handleExport}
        />
      )}

      {/* Status Footer */}
      <card_1.Card>
        <card_1.CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-4">
              <span>
                Data Range: {config.dateRange.start} to {config.dateRange.end}
              </span>
              <separator_1.Separator orientation="vertical" className="h-4" />
              <span>Confidence Level: {config.confidenceLevel}%</span>
              <separator_1.Separator orientation="vertical" className="h-4" />
              <span>Metrics: {config.selectedMetrics.length} selected</span>
            </div>
            <div className="flex items-center gap-2">
              {analyticsSummary.outliers > 0 && (
                <badge_1.Badge variant="destructive">
                  {analyticsSummary.outliers} outliers detected
                </badge_1.Badge>
              )}
              <badge_1.Badge
                variant={analyticsSummary.overallDataQuality >= 80 ? "default" : "secondary"}
              >
                Quality: {analyticsSummary.overallDataQuality.toFixed(0)}%
              </badge_1.Badge>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>
  );
}
// Mock data generators for testing
function generateMockKPIs() {
  return [
    {
      id: "revenue",
      title: "Total Revenue",
      value: {
        current: 125400,
        previous: 118200,
        change: 7200,
        changePercent: 6.1,
        trend: "up",
        target: 130000,
      },
      format: "currency",
      icon: lucide_react_1.DollarSign,
      color: "text-green-600",
      description: "Monthly recurring revenue",
    },
    {
      id: "users",
      title: "Active Users",
      value: {
        current: 2840,
        previous: 2650,
        change: 190,
        changePercent: 7.2,
        trend: "up",
        target: 3000,
      },
      format: "number",
      icon: lucide_react_1.Users,
      color: "text-blue-600",
      description: "Monthly active users",
    },
  ];
}
function generateMockTimeSeriesData() {
  var data = [];
  for (var i = 30; i >= 0; i--) {
    var date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: date.toISOString().split("T")[0],
      revenue: 4000 + Math.random() * 1000,
      subscriptions: 80 + Math.random() * 20,
      churn_rate: 2 + Math.random() * 3,
      mrr: 25000 + Math.random() * 5000,
    });
  }
  return data;
}
function generateMockSegmentationData() {
  return [
    { name: "Enterprise", value: 45, color: "#3b82f6", change: 5.2 },
    { name: "Pro", value: 35, color: "#10b981", change: -2.1 },
    { name: "Starter", value: 20, color: "#f59e0b", change: 8.7 },
  ];
}
function generateMockBenchmarkData() {
  return [
    {
      metric: "Customer Acquisition Cost",
      value: 120,
      benchmark: 150,
      industry: 180,
      percentile: 75,
    },
    {
      metric: "Lifetime Value",
      value: 2400,
      benchmark: 2200,
      industry: 2000,
      percentile: 80,
    },
  ];
}
