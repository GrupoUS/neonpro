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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricWidget = MetricWidget;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var tooltip_1 = require("@/components/ui/tooltip");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var lucide_react_1 = require("lucide-react");
var METRIC_ICONS = {
  revenue: "💰",
  patients: "👥",
  appointments: "📅",
  satisfaction: "😊",
  growth: "📈",
  efficiency: "⚡",
  quality: "⭐",
  time: "⏱️",
  percentage: "📊",
  count: "🔢",
  currency: "💵",
  trend: "📈",
};
var STATUS_CONFIG = {
  excellent: {
    icon: lucide_react_1.CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    label: "Excellent",
  },
  good: {
    icon: lucide_react_1.CheckCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    label: "Good",
  },
  warning: {
    icon: lucide_react_1.AlertTriangle,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    label: "Warning",
  },
  critical: {
    icon: lucide_react_1.XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    label: "Critical",
  },
  neutral: {
    icon: lucide_react_1.Minus,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    label: "Neutral",
  },
};
function MetricWidget(_a) {
  var widget = _a.widget,
    isEditing = _a.isEditing,
    onUpdate = _a.onUpdate;
  var _b = (0, react_1.useState)(null),
    data = _b[0],
    setData = _b[1];
  var _c = (0, react_1.useState)(true),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var _e = (0, react_1.useState)(new Date()),
    lastUpdate = _e[0],
    setLastUpdate = _e[1];
  var config = __assign(
    {
      showTrend: true,
      showTarget: true,
      showStatus: true,
      showSparkline: false,
      colorScheme: "default",
      size: "md",
      layout: "vertical",
    },
    widget.config,
  );
  // Fetch metric data
  (0, react_1.useEffect)(() => {
    var fetchData = () =>
      __awaiter(this, void 0, void 0, function () {
        var mockData, err_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              if (!widget.dataSource) {
                setError("No data source configured");
                setIsLoading(false);
                return [2 /*return*/];
              }
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              setIsLoading(true);
              setError(null);
              // Simulate API call - replace with actual implementation
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1000))];
            case 2:
              // Simulate API call - replace with actual implementation
              _a.sent();
              mockData = generateMockData(widget.dataSource);
              setData(mockData);
              setLastUpdate(new Date());
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              setError(err_1 instanceof Error ? err_1.message : "Failed to load data");
              return [3 /*break*/, 5];
            case 4:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    fetchData();
    // Set up auto-refresh
    if (widget.refreshInterval && widget.refreshInterval > 0) {
      var interval_1 = setInterval(fetchData, widget.refreshInterval * 1000);
      return () => clearInterval(interval_1);
    }
  }, [widget.dataSource, widget.refreshInterval]);
  // Calculate metric value and trend
  var metricValue = (0, react_1.useMemo)(() => {
    if (!data) return null;
    return {
      current: data.value,
      previous: data.previousValue,
      target: data.targetValue,
      unit: data.unit || "",
      format: data.format || "number",
    };
  }, [data]);
  var metricTrend = (0, react_1.useMemo)(() => {
    if (!metricValue || metricValue.previous === undefined) return null;
    var change = metricValue.current - metricValue.previous;
    var percentage = metricValue.previous !== 0 ? (change / metricValue.previous) * 100 : 0;
    var direction = "stable";
    if (Math.abs(percentage) > 0.1) {
      direction = change > 0 ? "up" : "down";
    }
    // Determine if trend is good based on metric type
    var isGood = determineTrendGoodness(direction, widget.dataSource);
    return {
      direction: direction,
      percentage: Math.abs(percentage),
      isGood: isGood,
    };
  }, [metricValue, widget.dataSource]);
  var metricStatus = (0, react_1.useMemo)(() => {
    if (!metricValue || !data) return "neutral";
    if (data.status) return data.status;
    // Calculate status based on target and thresholds
    if (metricValue.target) {
      var ratio = metricValue.current / metricValue.target;
      if (ratio >= 1.1) return "excellent";
      if (ratio >= 0.9) return "good";
      if (ratio >= 0.7) return "warning";
      return "critical";
    }
    return "neutral";
  }, [metricValue, data]);
  // Format value based on type
  var formatValue = (value, format) => {
    switch (format) {
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
      default:
        return new Intl.NumberFormat("pt-BR").format(value);
    }
  };
  // Handle refresh
  var handleRefresh = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setIsLoading(true);
        // Trigger data refresh
        setTimeout(() => {
          setLastUpdate(new Date());
          setIsLoading(false);
        }, 1000);
        return [2 /*return*/];
      });
    });
  // Render trend indicator
  var renderTrendIndicator = () => {
    if (!config.showTrend || !metricTrend) return null;
    var TrendIcon =
      metricTrend.direction === "up"
        ? lucide_react_1.TrendingUp
        : metricTrend.direction === "down"
          ? lucide_react_1.TrendingDown
          : lucide_react_1.Minus;
    var trendColor = metricTrend.isGood ? "text-green-600" : "text-red-600";
    return (
      <div className={"flex items-center gap-1 ".concat(trendColor)}>
        <TrendIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{metricTrend.percentage.toFixed(1)}%</span>
      </div>
    );
  };
  // Render status indicator
  var renderStatusIndicator = () => {
    if (!config.showStatus) return null;
    var statusConfig = STATUS_CONFIG[metricStatus];
    var StatusIcon = statusConfig.icon;
    return (
      <tooltip_1.TooltipProvider>
        <tooltip_1.Tooltip>
          <tooltip_1.TooltipTrigger asChild>
            <div className={"flex items-center gap-1 ".concat(statusConfig.color)}>
              <StatusIcon className="h-4 w-4" />
              <span className="text-xs font-medium">{statusConfig.label}</span>
            </div>
          </tooltip_1.TooltipTrigger>
          <tooltip_1.TooltipContent>Status: {statusConfig.label}</tooltip_1.TooltipContent>
        </tooltip_1.Tooltip>
      </tooltip_1.TooltipProvider>
    );
  };
  // Render target indicator
  var renderTargetIndicator = () => {
    if (
      !config.showTarget ||
      !(metricValue === null || metricValue === void 0 ? void 0 : metricValue.target)
    )
      return null;
    var progress = (metricValue.current / metricValue.target) * 100;
    var isOnTarget = progress >= 90;
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <lucide_react_1.Target className="h-3 w-3" />
        <span>Target: {formatValue(metricValue.target, metricValue.format)}</span>
        <badge_1.Badge variant={isOnTarget ? "default" : "secondary"} className="h-4 px-1 text-xs">
          {progress.toFixed(0)}%
        </badge_1.Badge>
      </div>
    );
  };
  if (isLoading) {
    return (
      <card_1.Card className="h-full">
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <skeleton_1.Skeleton className="h-4 w-24" />
            <skeleton_1.Skeleton className="h-4 w-4" />
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-2">
            <skeleton_1.Skeleton className="h-8 w-32" />
            <skeleton_1.Skeleton className="h-4 w-20" />
            <skeleton_1.Skeleton className="h-4 w-16" />
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (error) {
    return (
      <card_1.Card className="h-full border-red-200 bg-red-50">
        <card_1.CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-red-600">
            <lucide_react_1.XCircle className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Error</div>
            <div className="text-sm">{error}</div>
            <button_1.Button size="sm" variant="outline" className="mt-2" onClick={handleRefresh}>
              <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </button_1.Button>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  if (!metricValue) {
    return (
      <card_1.Card className="h-full">
        <card_1.CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <lucide_react_1.BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <div>No data available</div>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  var statusConfig = STATUS_CONFIG[metricStatus];
  return (
    <card_1.Card
      className={"h-full transition-all duration-200 hover:shadow-md "
        .concat(config.colorScheme !== "default" ? statusConfig.bgColor : "", " ")
        .concat(config.colorScheme !== "default" ? statusConfig.borderColor : "")}
    >
      <card_1.CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <card_1.CardTitle className="text-sm font-medium text-muted-foreground">
            {widget.title}
          </card_1.CardTitle>

          <div className="flex items-center gap-1">
            {renderStatusIndicator()}

            {isEditing && (
              <dropdown_menu_1.DropdownMenu>
                <dropdown_menu_1.DropdownMenuTrigger asChild>
                  <button_1.Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <lucide_react_1.MoreVertical className="h-3 w-3" />
                  </button_1.Button>
                </dropdown_menu_1.DropdownMenuTrigger>
                <dropdown_menu_1.DropdownMenuContent align="end">
                  <dropdown_menu_1.DropdownMenuItem onClick={handleRefresh}>
                    <lucide_react_1.RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Configure
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Export
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Share className="h-4 w-4 mr-2" />
                    Share
                  </dropdown_menu_1.DropdownMenuItem>
                </dropdown_menu_1.DropdownMenuContent>
              </dropdown_menu_1.DropdownMenu>
            )}
          </div>
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="pt-0">
        <div
          className={"space-y-2 ".concat(
            config.layout === "horizontal" ? "flex items-center justify-between" : "",
          )}
        >
          {/* Main Value */}
          <div
            className={"".concat(
              config.size === "lg" ? "text-3xl" : config.size === "sm" ? "text-xl" : "text-2xl",
              " font-bold",
            )}
          >
            {formatValue(metricValue.current, metricValue.format)}
            {metricValue.unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metricValue.unit}
              </span>
            )}
          </div>

          {/* Trend and Target */}
          <div className="flex items-center justify-between">
            {renderTrendIndicator()}
            {renderTargetIndicator()}
          </div>

          {/* Previous Value Comparison */}
          {metricValue.previous !== undefined && (
            <div className="text-xs text-muted-foreground">
              Previous: {formatValue(metricValue.previous, metricValue.format)}
            </div>
          )}

          {/* Last Update */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <lucide_react_1.Clock className="h-3 w-3" />
            <span>Updated {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </card_1.CardContent>
    </card_1.Card>
  );
}
// Helper functions
function generateMockData(dataSource) {
  var baseValue = Math.random() * 1000 + 100;
  var previousValue = baseValue * (0.8 + Math.random() * 0.4);
  var targetValue = baseValue * (1.1 + Math.random() * 0.2);
  var formats = ["number", "currency", "percentage", "duration"];
  var format = formats[Math.floor(Math.random() * formats.length)];
  return {
    value: baseValue,
    previousValue: previousValue,
    targetValue: targetValue,
    unit: format === "percentage" ? "%" : format === "currency" ? "R$" : "",
    format: format,
    timestamp: new Date(),
    status: ["excellent", "good", "warning", "critical", "neutral"][Math.floor(Math.random() * 5)],
  };
}
function determineTrendGoodness(direction, dataSource) {
  // Determine if an upward/downward trend is good based on the metric type
  var positiveMetrics = [
    "revenue",
    "patients",
    "satisfaction",
    "efficiency",
    "quality",
    "appointments",
    "growth",
    "productivity",
    "utilization",
  ];
  var negativeMetrics = [
    "costs",
    "wait-time",
    "no-shows",
    "complaints",
    "errors",
    "cancellations",
    "delays",
    "turnover",
  ];
  var isPositiveMetric = positiveMetrics.some((metric) =>
    dataSource.toLowerCase().includes(metric),
  );
  var isNegativeMetric = negativeMetrics.some((metric) =>
    dataSource.toLowerCase().includes(metric),
  );
  if (direction === "up") {
    return isPositiveMetric || !isNegativeMetric;
  } else if (direction === "down") {
    return isNegativeMetric;
  }
  return true; // Stable is generally good
}
