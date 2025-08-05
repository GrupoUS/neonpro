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
exports.PerformanceMetrics = PerformanceMetrics;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var separator_1 = require("@/components/ui/separator");
var lucide_react_1 = require("lucide-react");
var date_fns_1 = require("date-fns");
var METRIC_CATEGORIES = [
  { value: "all", label: "All Categories", icon: lucide_react_1.BarChart3 },
  { value: "financial", label: "Financial", icon: lucide_react_1.DollarSign },
  { value: "operational", label: "Operational", icon: lucide_react_1.Activity },
  { value: "clinical", label: "Clinical", icon: lucide_react_1.Users },
  { value: "satisfaction", label: "Satisfaction", icon: lucide_react_1.Target },
  { value: "efficiency", label: "Efficiency", icon: lucide_react_1.Clock },
];
var STATUS_CONFIG = {
  excellent: {
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: lucide_react_1.CheckCircle,
    label: "Excellent",
  },
  good: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    icon: lucide_react_1.CheckCircle,
    label: "Good",
  },
  warning: {
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    icon: lucide_react_1.AlertTriangle,
    label: "Warning",
  },
  critical: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    icon: lucide_react_1.XCircle,
    label: "Critical",
  },
};
function PerformanceMetrics(_a) {
  var clinicId = _a.clinicId,
    dateRange = _a.dateRange,
    _b = _a.className,
    className = _b === void 0 ? "" : _b,
    _c = _a.showTargets,
    showTargets = _c === void 0 ? true : _c,
    _d = _a.showBenchmarks,
    showBenchmarks = _d === void 0 ? true : _d,
    _e = _a.showTrends,
    showTrends = _e === void 0 ? true : _e,
    _f = _a.autoRefresh,
    autoRefresh = _f === void 0 ? true : _f,
    _g = _a.refreshInterval, // 5 minutes
    refreshInterval = _g === void 0 ? 300000 : _g; // 5 minutes
  var _h = (0, react_1.useState)([]),
    metrics = _h[0],
    setMetrics = _h[1];
  var _j = (0, react_1.useState)(null),
    summary = _j[0],
    setSummary = _j[1];
  var _k = (0, react_1.useState)("all"),
    selectedCategory = _k[0],
    setSelectedCategory = _k[1];
  var _l = (0, react_1.useState)("grid"),
    selectedView = _l[0],
    setSelectedView = _l[1];
  var _m = (0, react_1.useState)(true),
    isLoading = _m[0],
    setIsLoading = _m[1];
  var _o = (0, react_1.useState)(new Date()),
    lastRefresh = _o[0],
    setLastRefresh = _o[1];
  var _p = (0, react_1.useState)("status"),
    sortBy = _p[0],
    setSortBy = _p[1];
  var _q = (0, react_1.useState)("desc"),
    sortOrder = _q[0],
    setSortOrder = _q[1];
  // Load performance metrics
  (0, react_1.useEffect)(() => {
    var loadMetrics = () =>
      __awaiter(this, void 0, void 0, function () {
        var mockMetrics, mockSummary, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              setIsLoading(true);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              // Simulate API call - replace with actual implementation
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
            case 2:
              // Simulate API call - replace with actual implementation
              _a.sent();
              mockMetrics = generateMockMetrics(clinicId, dateRange);
              mockSummary = calculatePerformanceSummary(mockMetrics);
              setMetrics(mockMetrics);
              setSummary(mockSummary);
              setLastRefresh(new Date());
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              console.error("Failed to load performance metrics:", err_1);
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    loadMetrics();
  }, [clinicId, dateRange]);
  // Auto-refresh
  (0, react_1.useEffect)(() => {
    if (!autoRefresh) return;
    var interval = setInterval(() => {
      // Refresh metrics
      var refreshMetrics = () =>
        __awaiter(this, void 0, void 0, function () {
          var mockMetrics, mockSummary;
          return __generator(this, (_a) => {
            try {
              mockMetrics = generateMockMetrics(clinicId, dateRange);
              mockSummary = calculatePerformanceSummary(mockMetrics);
              setMetrics(mockMetrics);
              setSummary(mockSummary);
              setLastRefresh(new Date());
            } catch (err) {
              console.error("Failed to refresh metrics:", err);
            }
            return [2 /*return*/];
          });
        });
      refreshMetrics();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, clinicId, dateRange]);
  // Filter and sort metrics
  var filteredMetrics = metrics
    .filter((metric) => selectedCategory === "all" || metric.category === selectedCategory)
    .sort((a, b) => {
      var aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "value":
          aValue = a.value;
          bValue = b.value;
          break;
        case "target":
          aValue = a.target;
          bValue = b.target;
          break;
        case "status": {
          var statusOrder = { critical: 0, warning: 1, good: 2, excellent: 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        }
        default:
          return 0;
      }
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  // Format value based on unit
  var formatValue = (value, unit) => {
    switch (unit) {
      case "currency":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percentage":
        return "".concat(value.toFixed(1), "%");
      case "duration": {
        var hours = Math.floor(value / 60);
        var minutes = value % 60;
        return "".concat(hours, "h ").concat(minutes, "m");
      }
      case "ratio":
        return "".concat(value.toFixed(2), ":1");
      default:
        return value.toLocaleString("pt-BR");
    }
  };
  // Calculate progress percentage
  var calculateProgress = (value, target) => Math.min((value / target) * 100, 100);
  // Get trend icon
  var getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <lucide_react_1.Minus className="h-4 w-4 text-gray-600" />;
    }
  };
  // Handle manual refresh
  var handleRefresh = () =>
    __awaiter(this, void 0, void 0, function () {
      var mockMetrics, mockSummary, err_2;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            setIsLoading(true);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 500))];
          case 2:
            _a.sent();
            mockMetrics = generateMockMetrics(clinicId, dateRange);
            mockSummary = calculatePerformanceSummary(mockMetrics);
            setMetrics(mockMetrics);
            setSummary(mockSummary);
            setLastRefresh(new Date());
            return [3 /*break*/, 5];
          case 3:
            err_2 = _a.sent();
            console.error("Failed to refresh metrics:", err_2);
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  // Export metrics
  var handleExport = () => {
    var exportData = {
      summary: summary,
      metrics: filteredMetrics,
      dateRange: dateRange,
      exportedAt: new Date().toISOString(),
    };
    var dataStr = JSON.stringify(exportData, null, 2);
    var dataBlob = new Blob([dataStr], { type: "application/json" });
    var url = URL.createObjectURL(dataBlob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "performance-metrics-".concat(
      (0, date_fns_1.format)(new Date(), "yyyy-MM-dd"),
      ".json",
    );
    link.click();
    URL.revokeObjectURL(url);
  };
  if (isLoading && !metrics.length) {
    return (
      <card_1.Card className={className}>
        <card_1.CardHeader>
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5" />
            Performance Metrics
          </card_1.CardTitle>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <lucide_react_1.RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading performance metrics...</p>
            </div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={className}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="flex items-center gap-2">
            <lucide_react_1.BarChart3 className="h-5 w-5" />
            Performance Metrics
            {isLoading && <lucide_react_1.RefreshCw className="h-4 w-4 animate-spin" />}
          </card_1.CardTitle>

          <div className="flex items-center gap-2">
            <select_1.Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <select_1.SelectTrigger className="w-40">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                {METRIC_CATEGORIES.map((category) => {
                  var Icon = category.icon;
                  return (
                    <select_1.SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </div>
                    </select_1.SelectItem>
                  );
                })}
              </select_1.SelectContent>
            </select_1.Select>

            <button_1.Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <lucide_react_1.RefreshCw
                className={"h-4 w-4 ".concat(isLoading ? "animate-spin" : "")}
              />
            </button_1.Button>

            <button_1.Button size="sm" variant="outline" onClick={handleExport}>
              <lucide_react_1.Download className="h-4 w-4" />
            </button_1.Button>
          </div>
        </div>

        {summary && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Last updated: {(0, date_fns_1.format)(lastRefresh, "HH:mm:ss")}</span>
            <separator_1.Separator orientation="vertical" className="h-4" />
            <span>Overall Score: {summary.overallScore.toFixed(1)}/10</span>
            <separator_1.Separator orientation="vertical" className="h-4" />
            <span>{summary.totalMetrics} metrics tracked</span>
          </div>
        )}
      </card_1.CardHeader>

      <card_1.CardContent>
        <tabs_1.Tabs value={selectedView} onValueChange={(value) => setSelectedView(value)}>
          <div className="flex items-center justify-between mb-4">
            <tabs_1.TabsList>
              <tabs_1.TabsTrigger value="summary">Summary</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="grid">Grid View</tabs_1.TabsTrigger>
              <tabs_1.TabsTrigger value="list">List View</tabs_1.TabsTrigger>
            </tabs_1.TabsList>

            <div className="flex items-center gap-2">
              <select_1.Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <select_1.SelectTrigger className="w-32">
                  <select_1.SelectValue />
                </select_1.SelectTrigger>
                <select_1.SelectContent>
                  <select_1.SelectItem value="status">Status</select_1.SelectItem>
                  <select_1.SelectItem value="name">Name</select_1.SelectItem>
                  <select_1.SelectItem value="value">Value</select_1.SelectItem>
                  <select_1.SelectItem value="target">Target</select_1.SelectItem>
                </select_1.SelectContent>
              </select_1.Select>

              <button_1.Button
                size="sm"
                variant="outline"
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button_1.Button>
            </div>
          </div>

          <tabs_1.TabsContent value="summary">
            {summary && (
              <div className="space-y-6">
                {/* Overall Performance */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <card_1.Card className="border-green-200 bg-green-50">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">Excellent</p>
                          <p className="text-2xl font-bold text-green-900">
                            {summary.excellentCount}
                          </p>
                        </div>
                        <lucide_react_1.CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card className="border-blue-200 bg-blue-50">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-800">Good</p>
                          <p className="text-2xl font-bold text-blue-900">{summary.goodCount}</p>
                        </div>
                        <lucide_react_1.CheckCircle className="h-8 w-8 text-blue-600" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card className="border-yellow-200 bg-yellow-50">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Warning</p>
                          <p className="text-2xl font-bold text-yellow-900">
                            {summary.warningCount}
                          </p>
                        </div>
                        <lucide_react_1.AlertTriangle className="h-8 w-8 text-yellow-600" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card className="border-red-200 bg-red-50">
                    <card_1.CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-red-800">Critical</p>
                          <p className="text-2xl font-bold text-red-900">{summary.criticalCount}</p>
                        </div>
                        <lucide_react_1.XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>

                {/* Overall Score */}
                <card_1.Card>
                  <card_1.CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Overall Performance Score</h3>
                      <div className="text-4xl font-bold mb-4">
                        {summary.overallScore.toFixed(1)}/10
                      </div>
                      <progress_1.Progress
                        value={summary.overallScore * 10}
                        className="w-full max-w-md mx-auto"
                      />
                    </div>
                  </card_1.CardContent>
                </card_1.Card>

                {/* Achievements and Improvement Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-lg flex items-center gap-2">
                        <lucide_react_1.CheckCircle className="h-5 w-5 text-green-600" />
                        Achievements
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-2">
                        {summary.achievements.map((achievement, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-600 rounded-full" />
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>

                  <card_1.Card>
                    <card_1.CardHeader>
                      <card_1.CardTitle className="text-lg flex items-center gap-2">
                        <lucide_react_1.AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Improvement Areas
                      </card_1.CardTitle>
                    </card_1.CardHeader>
                    <card_1.CardContent>
                      <div className="space-y-2">
                        {summary.improvementAreas.map((area, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                            {area}
                          </div>
                        ))}
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                </div>
              </div>
            )}
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="grid">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric) => {
                var statusConfig = STATUS_CONFIG[metric.status];
                var StatusIcon = statusConfig.icon;
                var progress = calculateProgress(metric.value, metric.target);
                return (
                  <card_1.Card
                    key={metric.id}
                    className={""
                      .concat(statusConfig.borderColor, " ")
                      .concat(statusConfig.bgColor)}
                  >
                    <card_1.CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{metric.name}</h4>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {showTrends && getTrendIcon(metric.trend)}
                          <StatusIcon className={"h-4 w-4 ".concat(statusConfig.color)} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold">
                            {formatValue(metric.value, metric.unit)}
                          </span>
                          <badge_1.Badge variant="secondary" className="text-xs">
                            {statusConfig.label}
                          </badge_1.Badge>
                        </div>

                        {showTargets && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span>Target: {formatValue(metric.target, metric.unit)}</span>
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                            <progress_1.Progress value={progress} className="h-2" />
                          </div>
                        )}

                        {showBenchmarks && metric.benchmark && (
                          <div className="text-xs text-muted-foreground">
                            Benchmark: {formatValue(metric.benchmark, metric.unit)}
                          </div>
                        )}

                        <div className="text-xs text-muted-foreground">
                          Updated: {(0, date_fns_1.format)(metric.lastUpdated, "HH:mm")}
                        </div>
                      </div>
                    </card_1.CardContent>
                  </card_1.Card>
                );
              })}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="list">
            <div className="space-y-2">
              {filteredMetrics.map((metric) => {
                var statusConfig = STATUS_CONFIG[metric.status];
                var StatusIcon = statusConfig.icon;
                var progress = calculateProgress(metric.value, metric.target);
                return (
                  <card_1.Card key={metric.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={"h-4 w-4 ".concat(statusConfig.color)} />
                          <badge_1.Badge variant="secondary" className="text-xs">
                            {statusConfig.label}
                          </badge_1.Badge>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{metric.name}</h4>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatValue(metric.value, metric.unit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Target: {formatValue(metric.target, metric.unit)}
                          </div>
                        </div>

                        <div className="w-24">
                          <progress_1.Progress value={progress} className="h-2" />
                          <div className="text-xs text-center mt-1">{progress.toFixed(0)}%</div>
                        </div>

                        <div className="flex items-center gap-1">
                          {showTrends && getTrendIcon(metric.trend)}
                        </div>
                      </div>
                    </div>
                  </card_1.Card>
                );
              })}
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Helper function to generate mock metrics
function generateMockMetrics(clinicId, dateRange) {
  return [
    {
      id: "revenue-growth",
      name: "Revenue Growth",
      category: "financial",
      value: 15.2,
      target: 12.0,
      previousValue: 11.8,
      unit: "percentage",
      trend: "up",
      status: "excellent",
      description: "Monthly revenue growth rate",
      lastUpdated: new Date(),
      benchmark: 10.0,
      goal: 15.0,
    },
    {
      id: "patient-satisfaction",
      name: "Patient Satisfaction",
      category: "satisfaction",
      value: 4.7,
      target: 4.5,
      previousValue: 4.6,
      unit: "number",
      trend: "up",
      status: "excellent",
      description: "Average patient satisfaction score (1-5)",
      lastUpdated: new Date(),
      benchmark: 4.2,
    },
    {
      id: "appointment-utilization",
      name: "Appointment Utilization",
      category: "operational",
      value: 87.3,
      target: 85.0,
      previousValue: 84.1,
      unit: "percentage",
      trend: "up",
      status: "good",
      description: "Percentage of available appointment slots filled",
      lastUpdated: new Date(),
      benchmark: 80.0,
    },
    {
      id: "average-wait-time",
      name: "Average Wait Time",
      category: "efficiency",
      value: 18,
      target: 15,
      previousValue: 22,
      unit: "duration",
      trend: "down",
      status: "warning",
      description: "Average patient wait time in minutes",
      lastUpdated: new Date(),
      benchmark: 12,
    },
    {
      id: "staff-productivity",
      name: "Staff Productivity",
      category: "operational",
      value: 92.1,
      target: 90.0,
      previousValue: 89.5,
      unit: "percentage",
      trend: "up",
      status: "excellent",
      description: "Staff productivity index",
      lastUpdated: new Date(),
      benchmark: 85.0,
    },
    {
      id: "cost-per-patient",
      name: "Cost per Patient",
      category: "financial",
      value: 145.5,
      target: 150.0,
      previousValue: 152.3,
      unit: "currency",
      trend: "down",
      status: "good",
      description: "Average cost per patient visit",
      lastUpdated: new Date(),
      benchmark: 160.0,
    },
    {
      id: "no-show-rate",
      name: "No-Show Rate",
      category: "operational",
      value: 12.3,
      target: 10.0,
      previousValue: 11.8,
      unit: "percentage",
      trend: "up",
      status: "warning",
      description: "Percentage of patients who miss appointments",
      lastUpdated: new Date(),
      benchmark: 8.0,
    },
    {
      id: "treatment-success-rate",
      name: "Treatment Success Rate",
      category: "clinical",
      value: 94.2,
      target: 95.0,
      previousValue: 93.8,
      unit: "percentage",
      trend: "up",
      status: "good",
      description: "Percentage of successful treatment outcomes",
      lastUpdated: new Date(),
      benchmark: 92.0,
    },
  ];
}
// Helper function to calculate performance summary
function calculatePerformanceSummary(metrics) {
  var excellentCount = metrics.filter((m) => m.status === "excellent").length;
  var goodCount = metrics.filter((m) => m.status === "good").length;
  var warningCount = metrics.filter((m) => m.status === "warning").length;
  var criticalCount = metrics.filter((m) => m.status === "critical").length;
  var statusScores = {
    excellent: 10,
    good: 7,
    warning: 4,
    critical: 1,
  };
  var totalScore = metrics.reduce((sum, metric) => sum + statusScores[metric.status], 0);
  var overallScore = totalScore / metrics.length;
  var achievements = [
    "Revenue growth exceeded target by 3.2%",
    "Patient satisfaction above benchmark",
    "Staff productivity at all-time high",
  ];
  var improvementAreas = [
    "Reduce average wait time by 3 minutes",
    "Decrease no-show rate to target level",
    "Optimize appointment scheduling efficiency",
  ];
  return {
    totalMetrics: metrics.length,
    excellentCount: excellentCount,
    goodCount: goodCount,
    warningCount: warningCount,
    criticalCount: criticalCount,
    overallScore: overallScore,
    achievements: achievements,
    improvementAreas: improvementAreas,
  };
}
