/**
 * NeonPro Performance Dashboard Component
 * Real-time performance metrics display with Core Web Vitals tracking
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PerformanceDashboard;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
/**
 * Performance Dashboard with real-time metrics
 */
function PerformanceDashboard() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(null),
    systemMetrics = _b[0],
    setSystemMetrics = _b[1];
  var _c = (0, react_1.useState)([]),
    history = _c[0],
    setHistory = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    autoRefresh = _e[0],
    setAutoRefresh = _e[1];
  /**
   * Fetch current performance metrics
   */
  var fetchMetrics = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, systemData, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setIsLoading(true);
            return [4 /*yield*/, fetch("/api/analytics/performance")];
          case 1:
            response = _a.sent();
            if (!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setMetrics(data.current);
            setHistory(data.history || []);
            _a.label = 3;
          case 3:
            systemData = getSystemMetrics();
            setSystemMetrics(systemData);
            return [3 /*break*/, 6];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to fetch performance metrics:", error_1);
            return [3 /*break*/, 6];
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get system-level performance metrics
   */
  var getSystemMetrics = function () {
    var _a, _b;
    var performance = window.performance;
    var memory = performance.memory;
    return {
      memoryUsage: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      jsHeapSize: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
      loadTime:
        Math.round(
          ((_a = performance.timing) === null || _a === void 0 ? void 0 : _a.loadEventEnd) -
            ((_b = performance.timing) === null || _b === void 0 ? void 0 : _b.navigationStart),
        ) || 0,
      domNodes: document.querySelectorAll("*").length,
      resources: performance.getEntriesByType("resource").length,
    };
  };
  /**
   * Get performance score color based on value
   */
  var getScoreColor = function (score) {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };
  /**
   * Get performance badge variant
   */
  var getBadgeVariant = function (score) {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };
  /**
   * Format metric value with units
   */
  var formatMetric = function (value, unit) {
    return "".concat(value.toFixed(2)).concat(unit);
  };
  /**
   * Calculate trend from history
   */
  var calculateTrend = function (current, history) {
    if (history.length < 2) return "stable";
    var previous = history[history.length - 2];
    var change = Math.abs(current - previous[Object.keys(previous)[0]]);
    if (change < 0.1) return "stable";
    return current > previous[Object.keys(previous)[0]] ? "up" : "down";
  };
  // Auto-refresh effect
  (0, react_1.useEffect)(
    function () {
      fetchMetrics();
      var interval;
      if (autoRefresh) {
        interval = setInterval(fetchMetrics, 10000); // 10 seconds
      }
      return function () {
        if (interval) clearInterval(interval);
      };
    },
    [autoRefresh],
  );
  if (isLoading && !metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading performance metrics...</span>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Dashboard</h2>
          <p className="text-muted-foreground">Real-time Core Web Vitals and system metrics</p>
        </div>

        <div className="flex items-center space-x-2">
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={function () {
              return setAutoRefresh(!autoRefresh);
            }}
          >
            <lucide_react_1.Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? "Stop Auto-refresh" : "Auto-refresh"}
          </button_1.Button>

          <button_1.Button variant="outline" size="sm" onClick={fetchMetrics} disabled={isLoading}>
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(isLoading ? "animate-spin" : "")}
            />
            Refresh
          </button_1.Button>
        </div>
      </div>

      <tabs_1.Tabs defaultValue="vitals" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="vitals">Core Web Vitals</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="system">System Metrics</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="history">Performance History</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        {/* Core Web Vitals Tab */}
        <tabs_1.TabsContent value="vitals">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Overall Performance Score */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Performance Score
                </card_1.CardTitle>
                <lucide_react_1.Gauge className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  <span
                    className={getScoreColor(
                      (metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0,
                    )}
                  >
                    {(metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0}/100
                  </span>
                </div>
                <div className="mt-2">
                  <progress_1.Progress
                    value={(metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0}
                    className="h-2"
                  />
                </div>
                <badge_1.Badge
                  variant={getBadgeVariant(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0,
                  )}
                  className="mt-2"
                >
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0) >= 90
                    ? "Excellent"
                    : ((metrics === null || metrics === void 0 ? void 0 : metrics.score) || 0) >= 70
                      ? "Good"
                      : "Needs Improvement"}
                </badge_1.Badge>
              </card_1.CardContent>
            </card_1.Card>

            {/* Largest Contentful Paint */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Largest Contentful Paint
                </card_1.CardTitle>
                <lucide_react_1.Timer className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.lcp) || 0,
                    "s",
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;2.5s • Needs Improvement: &lt;4s
                </p>
                <div className="flex items-center mt-2">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.lcp) || 0) <= 2.5
                    ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />}
                  <span className="text-sm">
                    {((metrics === null || metrics === void 0 ? void 0 : metrics.lcp) || 0) <= 2.5
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* First Input Delay */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  First Input Delay
                </card_1.CardTitle>
                <lucide_react_1.Zap className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.fid) || 0,
                    "ms",
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;100ms • Needs Improvement: &lt;300ms
                </p>
                <div className="flex items-center mt-2">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.fid) || 0) <= 100
                    ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />}
                  <span className="text-sm">
                    {((metrics === null || metrics === void 0 ? void 0 : metrics.fid) || 0) <= 100
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Cumulative Layout Shift */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Cumulative Layout Shift
                </card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.cls) || 0).toFixed(
                    3,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;0.1 • Needs Improvement: &lt;0.25
                </p>
                <div className="flex items-center mt-2">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.cls) || 0) <= 0.1
                    ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />}
                  <span className="text-sm">
                    {((metrics === null || metrics === void 0 ? void 0 : metrics.cls) || 0) <= 0.1
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* First Contentful Paint */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  First Contentful Paint
                </card_1.CardTitle>
                <lucide_react_1.Timer className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.fcp) || 0,
                    "s",
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;1.8s • Needs Improvement: &lt;3s
                </p>
                <div className="flex items-center mt-2">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.fcp) || 0) <= 1.8
                    ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />}
                  <span className="text-sm">
                    {((metrics === null || metrics === void 0 ? void 0 : metrics.fcp) || 0) <= 1.8
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>

            {/* Time to First Byte */}
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">
                  Time to First Byte
                </card_1.CardTitle>
                <lucide_react_1.Zap className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {formatMetric(
                    (metrics === null || metrics === void 0 ? void 0 : metrics.ttfb) || 0,
                    "ms",
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Good: &lt;800ms • Needs Improvement: &lt;1800ms
                </p>
                <div className="flex items-center mt-2">
                  {((metrics === null || metrics === void 0 ? void 0 : metrics.ttfb) || 0) <= 800
                    ? <lucide_react_1.CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                    : <lucide_react_1.AlertTriangle className="h-4 w-4 text-yellow-600 mr-1" />}
                  <span className="text-sm">
                    {((metrics === null || metrics === void 0 ? void 0 : metrics.ttfb) || 0) <= 800
                      ? "Good"
                      : "Needs Improvement"}
                  </span>
                </div>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* System Metrics Tab */}
        <tabs_1.TabsContent value="system">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Memory Usage</card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(systemMetrics === null || systemMetrics === void 0
                    ? void 0
                    : systemMetrics.memoryUsage) || 0}{" "}
                  MB
                </div>
                <p className="text-xs text-muted-foreground">
                  of{" "}
                  {(systemMetrics === null || systemMetrics === void 0
                    ? void 0
                    : systemMetrics.jsHeapSize) || 0}{" "}
                  MB total
                </p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Load Time</card_1.CardTitle>
                <lucide_react_1.Timer className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(systemMetrics === null || systemMetrics === void 0
                    ? void 0
                    : systemMetrics.loadTime) || 0}{" "}
                  ms
                </div>
                <p className="text-xs text-muted-foreground">Initial page load</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">DOM Nodes</card_1.CardTitle>
                <lucide_react_1.Activity className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(systemMetrics === null || systemMetrics === void 0
                    ? void 0
                    : systemMetrics.domNodes) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Elements in DOM</p>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <card_1.CardTitle className="text-sm font-medium">Resources</card_1.CardTitle>
                <lucide_react_1.Zap className="h-4 w-4 text-muted-foreground" />
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="text-2xl font-bold">
                  {(systemMetrics === null || systemMetrics === void 0
                    ? void 0
                    : systemMetrics.resources) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Loaded resources</p>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>

        {/* Performance History Tab */}
        <tabs_1.TabsContent value="history">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Performance Trends</card_1.CardTitle>
              <card_1.CardDescription>Historical performance data over time</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {history.length === 0
                ? <div className="text-center py-8 text-muted-foreground">
                    No historical data available yet.
                    <br />
                    Performance metrics will appear here as they are collected.
                  </div>
                : <div className="space-y-4">
                    {history
                      .slice(-10)
                      .reverse()
                      .map(function (metric, index) {
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="text-sm font-medium">
                                {new Date(metric.timestamp).toLocaleString()}
                              </div>
                              <badge_1.Badge variant="outline">{metric.page}</badge_1.Badge>
                            </div>

                            <div className="flex items-center space-x-4">
                              <div className="text-sm">
                                Score:{" "}
                                <span className={getScoreColor(metric.score)}>{metric.score}</span>
                              </div>
                              <div className="text-sm">LCP: {formatMetric(metric.lcp, "s")}</div>
                              <div className="text-sm">FID: {formatMetric(metric.fid, "ms")}</div>
                              <div className="text-sm">CLS: {metric.cls.toFixed(3)}</div>
                            </div>
                          </div>
                        );
                      })}
                  </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
