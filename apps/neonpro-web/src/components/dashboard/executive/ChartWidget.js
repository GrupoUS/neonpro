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
exports.ChartWidget = ChartWidget;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var select_1 = require("@/components/ui/select");
var tooltip_1 = require("@/components/ui/tooltip");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var CHART_TYPES = {
  line: {
    icon: lucide_react_1.LineChart,
    label: "Line Chart",
    component: recharts_1.LineChart,
  },
  area: {
    icon: lucide_react_1.Activity,
    label: "Area Chart",
    component: recharts_1.AreaChart,
  },
  bar: {
    icon: lucide_react_1.BarChart3,
    label: "Bar Chart",
    component: recharts_1.BarChart,
  },
  pie: {
    icon: lucide_react_1.PieChart,
    label: "Pie Chart",
    component: recharts_1.PieChart,
  },
};
var DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#ec4899", // pink
  "#6b7280", // gray
];
var TIME_RANGES = {
  "7d": { label: "7 Days", days: 7 },
  "30d": { label: "30 Days", days: 30 },
  "90d": { label: "90 Days", days: 90 },
  "1y": { label: "1 Year", days: 365 },
  all: { label: "All Time", days: null },
};
var AGGREGATIONS = {
  hour: { label: "Hourly", format: "HH:mm" },
  day: { label: "Daily", format: "MMM dd" },
  week: { label: "Weekly", format: "MMM dd" },
  month: { label: "Monthly", format: "MMM yyyy" },
};
function ChartWidget(_a) {
  var widget = _a.widget,
    isEditing = _a.isEditing,
    onUpdate = _a.onUpdate;
  var _b = (0, react_1.useState)([]),
    data = _b[0],
    setData = _b[1];
  var _c = (0, react_1.useState)(true),
    isLoading = _c[0],
    setIsLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var _e = (0, react_1.useState)(false),
    isExpanded = _e[0],
    setIsExpanded = _e[1];
  var _f = (0, react_1.useState)("30d"),
    selectedTimeRange = _f[0],
    setSelectedTimeRange = _f[1];
  var _g = (0, react_1.useState)("day"),
    selectedAggregation = _g[0],
    setSelectedAggregation = _g[1];
  var config = __assign(
    {
      type: "line",
      showGrid: true,
      showLegend: true,
      showTooltip: true,
      showBrush: false,
      showReferenceLine: false,
      colors: DEFAULT_COLORS,
      height: 300,
      animation: true,
      responsive: true,
      timeRange: "30d",
      aggregation: "day",
    },
    widget.config,
  );
  // Fetch chart data
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
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 1500))];
            case 2:
              // Simulate API call - replace with actual implementation
              _a.sent();
              mockData = generateMockChartData(selectedTimeRange, selectedAggregation, config.type);
              setData(mockData);
              return [3 /*break*/, 5];
            case 3:
              err_1 = _a.sent();
              setError(err_1 instanceof Error ? err_1.message : "Failed to load chart data");
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
  }, [
    widget.dataSource,
    widget.refreshInterval,
    selectedTimeRange,
    selectedAggregation,
    config.type,
  ]);
  // Process data for different chart types
  var processedData = (0, react_1.useMemo)(() => {
    if (!data.length) return [];
    switch (config.type) {
      case "pie": {
        // Aggregate data for pie chart
        var pieData = data.reduce((acc, item) => {
          var category = item.category || "Other";
          var existing = acc.find((d) => d.name === category);
          if (existing) {
            existing.value += item.value;
          } else {
            acc.push({ name: category, value: item.value });
          }
          return acc;
        }, []);
        return pieData;
      }
      default:
        return data.map((item) =>
          __assign(__assign({}, item), {
            timestamp: formatTimestamp(item.timestamp, selectedAggregation),
          }),
        );
    }
  }, [data, config.type, selectedAggregation]);
  // Calculate summary statistics
  var stats = (0, react_1.useMemo)(() => {
    if (!data.length) return null;
    var values = data.map((d) => d.value);
    var total = values.reduce((sum, val) => sum + val, 0);
    var average = total / values.length;
    var min = Math.min.apply(Math, values);
    var max = Math.max.apply(Math, values);
    // Calculate trend
    var firstHalf = values.slice(0, Math.floor(values.length / 2));
    var secondHalf = values.slice(Math.floor(values.length / 2));
    var firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    var secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    var trend = secondAvg > firstAvg ? "up" : secondAvg < firstAvg ? "down" : "stable";
    var trendPercentage = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    return {
      total: total,
      average: average,
      min: min,
      max: max,
      trend: trend,
      trendPercentage: Math.abs(trendPercentage),
      count: values.length,
    };
  }, [data]);
  // Handle refresh
  var handleRefresh = () =>
    __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        setIsLoading(true);
        // Trigger data refresh
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
        return [2 /*return*/];
      });
    });
  // Handle export
  var handleExport = () => {
    var csvContent = data.map((row) => Object.values(row).join(",")).join("\n");
    var blob = new Blob([csvContent], { type: "text/csv" });
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = ""
      .concat(widget.title, "-")
      .concat(new Date().toISOString().split("T")[0], ".csv");
    a.click();
    window.URL.revokeObjectURL(url);
  };
  // Render chart based on type
  var renderChart = () => {
    if (!processedData.length) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <lucide_react_1.BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <div>No data available</div>
          </div>
        </div>
      );
    }
    var chartHeight = isExpanded ? 500 : config.height;
    switch (config.type) {
      case "line":
        return (
          <recharts_1.ResponsiveContainer width="100%" height={chartHeight}>
            <recharts_1.LineChart data={processedData}>
              {config.showGrid && <recharts_1.CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <recharts_1.XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <recharts_1.YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <tooltip_1.Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <recharts_1.Legend />}
              <recharts_1.Line
                type="monotone"
                dataKey="value"
                stroke={config.colors[0]}
                strokeWidth={2}
                dot={{ fill: config.colors[0], strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, stroke: config.colors[0], strokeWidth: 2 }}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <recharts_1.ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
              {config.showBrush && <recharts_1.Brush dataKey="timestamp" height={30} />}
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        );
      case "area":
        return (
          <recharts_1.ResponsiveContainer width="100%" height={chartHeight}>
            <recharts_1.AreaChart data={processedData}>
              {config.showGrid && <recharts_1.CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <recharts_1.XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <recharts_1.YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <tooltip_1.Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <recharts_1.Legend />}
              <recharts_1.Area
                type="monotone"
                dataKey="value"
                stroke={config.colors[0]}
                fill={config.colors[0]}
                fillOpacity={0.3}
                strokeWidth={2}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <recharts_1.ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </recharts_1.AreaChart>
          </recharts_1.ResponsiveContainer>
        );
      case "bar":
        return (
          <recharts_1.ResponsiveContainer width="100%" height={chartHeight}>
            <recharts_1.BarChart data={processedData}>
              {config.showGrid && <recharts_1.CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <recharts_1.XAxis dataKey="timestamp" tick={{ fontSize: 12 }} tickLine={false} />
              <recharts_1.YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              {config.showTooltip && (
                <tooltip_1.Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <recharts_1.Legend />}
              <recharts_1.Bar
                dataKey="value"
                fill={config.colors[0]}
                radius={[2, 2, 0, 0]}
                animationDuration={config.animation ? 1000 : 0}
              />
              {config.showReferenceLine && config.referenceValue && (
                <recharts_1.ReferenceLine
                  y={config.referenceValue}
                  stroke="#ef4444"
                  strokeDasharray="5 5"
                  label="Target"
                />
              )}
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        );
      case "pie":
        return (
          <recharts_1.ResponsiveContainer width="100%" height={chartHeight}>
            <recharts_1.PieChart>
              <recharts_1.Pie
                data={processedData}
                cx="50%"
                cy="50%"
                outerRadius={Math.min(chartHeight * 0.35, 120)}
                fill="#8884d8"
                dataKey="value"
                label={(_a) => {
                  var name = _a.name,
                    percent = _a.percent;
                  return "".concat(name, " ").concat((percent * 100).toFixed(0), "%");
                }}
                animationDuration={config.animation ? 1000 : 0}
              >
                {processedData.map((entry, index) => (
                  <recharts_1.Cell
                    key={"cell-".concat(index)}
                    fill={config.colors[index % config.colors.length]}
                  />
                ))}
              </recharts_1.Pie>
              {config.showTooltip && (
                <tooltip_1.Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                />
              )}
              {config.showLegend && <recharts_1.Legend />}
            </recharts_1.PieChart>
          </recharts_1.ResponsiveContainer>
        );
      default:
        return null;
    }
  };
  if (isLoading) {
    return (
      <card_1.Card className="h-full">
        <card_1.CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <skeleton_1.Skeleton className="h-4 w-32" />
            <skeleton_1.Skeleton className="h-4 w-4" />
          </div>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <skeleton_1.Skeleton className="h-6 w-20" />
              <skeleton_1.Skeleton className="h-6 w-20" />
            </div>
            <skeleton_1.Skeleton className="h-64 w-full" />
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
            <lucide_react_1.BarChart3 className="h-8 w-8 mx-auto mb-2" />
            <div className="font-medium">Error loading chart</div>
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
  return (
    <card_1.Card
      className={"h-full transition-all duration-200 hover:shadow-md ".concat(
        isExpanded ? "fixed inset-4 z-50 bg-white" : "",
      )}
    >
      <card_1.CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <card_1.CardTitle className="text-sm font-medium">{widget.title}</card_1.CardTitle>

            {stats && (
              <div className="flex items-center gap-1">
                {stats.trend === "up"
                  ? <lucide_react_1.TrendingUp className="h-4 w-4 text-green-600" />
                  : stats.trend === "down"
                    ? <lucide_react_1.TrendingDown className="h-4 w-4 text-red-600" />
                    : null}

                {stats.trend !== "stable" && (
                  <badge_1.Badge variant="secondary" className="text-xs">
                    {stats.trendPercentage.toFixed(1)}%
                  </badge_1.Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button_1.Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? <lucide_react_1.Minimize2 className="h-3 w-3" />
                : <lucide_react_1.Maximize2 className="h-3 w-3" />}
            </button_1.Button>

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
                  <dropdown_menu_1.DropdownMenuItem onClick={handleExport}>
                    <lucide_react_1.Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </dropdown_menu_1.DropdownMenuItem>
                  <dropdown_menu_1.DropdownMenuItem>
                    <lucide_react_1.Settings className="h-4 w-4 mr-2" />
                    Configure
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

        {/* Filters */}
        <div className="flex items-center gap-2 mt-2">
          <select_1.Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <select_1.SelectTrigger className="w-32 h-7 text-xs">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {Object.entries(TIME_RANGES).map((_a) => {
                var key = _a[0],
                  range = _a[1];
                return (
                  <select_1.SelectItem key={key} value={key} className="text-xs">
                    {range.label}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>

          <select_1.Select value={selectedAggregation} onValueChange={setSelectedAggregation}>
            <select_1.SelectTrigger className="w-24 h-7 text-xs">
              <select_1.SelectValue />
            </select_1.SelectTrigger>
            <select_1.SelectContent>
              {Object.entries(AGGREGATIONS).map((_a) => {
                var key = _a[0],
                  agg = _a[1];
                return (
                  <select_1.SelectItem key={key} value={key} className="text-xs">
                    {agg.label}
                  </select_1.SelectItem>
                );
              })}
            </select_1.SelectContent>
          </select_1.Select>

          {stats && (
            <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
              <span>Avg: {stats.average.toFixed(1)}</span>
              <span>•</span>
              <span>Max: {stats.max.toFixed(1)}</span>
            </div>
          )}
        </div>
      </card_1.CardHeader>

      <card_1.CardContent className="pt-0">{renderChart()}</card_1.CardContent>
    </card_1.Card>
  );
}
// Helper functions
function generateMockChartData(timeRange, aggregation, chartType) {
  var now = new Date();
  var days = TIME_RANGES[timeRange].days || 365;
  var points = [];
  var interval;
  switch (aggregation) {
    case "hour":
      interval = 60 * 60 * 1000; // 1 hour
      break;
    case "day":
      interval = 24 * 60 * 60 * 1000; // 1 day
      break;
    case "week":
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week
      break;
    case "month":
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month
      break;
    default:
      interval = 24 * 60 * 60 * 1000;
  }
  var totalPoints = Math.min(Math.floor((days * 24 * 60 * 60 * 1000) / interval), 100);
  for (var i = 0; i < totalPoints; i++) {
    var timestamp = new Date(now.getTime() - (totalPoints - i) * interval);
    var baseValue = 100 + Math.sin(i * 0.1) * 50;
    var noise = (Math.random() - 0.5) * 20;
    var trend = i * 0.5;
    points.push({
      timestamp: timestamp.toISOString(),
      value: Math.max(0, baseValue + noise + trend),
      category:
        chartType === "pie"
          ? ["Category A", "Category B", "Category C", "Category D"][i % 4]
          : undefined,
    });
  }
  return points;
}
function formatTimestamp(timestamp, aggregation) {
  var date = new Date(timestamp);
  switch (aggregation) {
    case "hour":
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    case "day":
      return date.toLocaleDateString("pt-BR", { month: "short", day: "numeric" });
    case "week":
    case "month":
      return date.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    default:
      return date.toLocaleDateString("pt-BR");
  }
}
