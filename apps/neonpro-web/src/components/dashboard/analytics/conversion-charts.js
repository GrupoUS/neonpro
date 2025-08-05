// Conversion Charts Component - STORY-SUB-002 Task 4
// Advanced charts for trial conversion analysis using Recharts + shadcn/ui
// Based on research: Recharts patterns + SaaS conversion best practices
// Created: 2025-01-22
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
exports.ConversionCharts = ConversionCharts;
var react_1 = require("react");
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
// Chart color palette following shadcn/ui theme
var CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--secondary))",
  success: "hsl(142, 76%, 36%)",
  warning: "hsl(38, 92%, 50%)",
  error: "hsl(0, 84%, 60%)",
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
};
// Custom tooltip component following shadcn/ui patterns
var CustomTooltip = (_a) => {
  var active = _a.active,
    payload = _a.payload,
    label = _a.label;
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-3 shadow-md">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.dataKey}:</span>
            <span className="font-medium">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
function ConversionCharts(_a) {
  var className = _a.className,
    _b = _a.timeRange,
    timeRange = _b === void 0 ? "30d" : _b;
  var _c = (0, react_1.useState)(null),
    data = _c[0],
    setData = _c[1];
  var _d = (0, react_1.useState)(true),
    loading = _d[0],
    setLoading = _d[1];
  var _e = (0, react_1.useState)(timeRange),
    selectedTimeRange = _e[0],
    setSelectedTimeRange = _e[1]; // Fetch chart data
  (0, react_1.useEffect)(() => {
    var fetchChartData = () =>
      __awaiter(this, void 0, void 0, function () {
        var response, chartData, error_1;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, 4, 5]);
              setLoading(true);
              return [
                4 /*yield*/,
                fetch("/api/analytics/charts?timeRange=".concat(selectedTimeRange)),
              ];
            case 1:
              response = _a.sent();
              return [4 /*yield*/, response.json()];
            case 2:
              chartData = _a.sent();
              setData(chartData);
              return [3 /*break*/, 5];
            case 3:
              error_1 = _a.sent();
              console.error("Failed to fetch chart data:", error_1);
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    fetchChartData();
  }, [selectedTimeRange]);
  // Mock data for demonstration (will be replaced by API)
  var mockConversionTrend = [
    { period: "Week 1", trials: 125, conversions: 31, conversionRate: 24.8, revenue: 15500 },
    { period: "Week 2", trials: 142, conversions: 38, conversionRate: 26.8, revenue: 19000 },
    { period: "Week 3", trials: 158, conversions: 45, conversionRate: 28.5, revenue: 22500 },
    { period: "Week 4", trials: 134, conversions: 35, conversionRate: 26.1, revenue: 17500 },
  ];
  var mockFunnelData = [
    { stage: "Visitors", users: 1000, percentage: 100, dropOff: 0 },
    { stage: "Sign Ups", users: 150, percentage: 15, dropOff: 85 },
    { stage: "Trial Started", users: 120, percentage: 12, dropOff: 3 },
    { stage: "Engaged", users: 85, percentage: 8.5, dropOff: 3.5 },
    { stage: "Converted", users: 32, percentage: 3.2, dropOff: 5.3 },
  ];
  var mockSourceData = [
    {
      source: "Organic",
      trials: 45,
      conversions: 18,
      conversionRate: 40,
      fill: CHART_COLORS.chart1,
    },
    {
      source: "Google Ads",
      trials: 32,
      conversions: 8,
      conversionRate: 25,
      fill: CHART_COLORS.chart2,
    },
    {
      source: "Social Media",
      trials: 28,
      conversions: 6,
      conversionRate: 21,
      fill: CHART_COLORS.chart3,
    },
    {
      source: "Referral",
      trials: 22,
      conversions: 9,
      conversionRate: 41,
      fill: CHART_COLORS.chart4,
    },
    { source: "Direct", trials: 18, conversions: 7, conversionRate: 39, fill: CHART_COLORS.chart5 },
  ];
  if (loading) {
    return (
      <div className={(0, utils_1.cn)("space-y-6", className)}>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <card_1.Card key={i} className="animate-pulse">
              <card_1.CardHeader>
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-3 w-48 bg-muted rounded"></div>
              </card_1.CardHeader>
              <card_1.CardContent>
                <div className="h-64 bg-muted rounded"></div>
              </card_1.CardContent>
            </card_1.Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className={(0, utils_1.cn)("space-y-6", className)}>
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold tracking-tight">Conversion Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Detailed insights into trial conversion performance
          </p>
        </div>
        <select_1.Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
          <select_1.SelectTrigger className="w-32">
            <lucide_react_1.Calendar className="mr-2 h-4 w-4" />
            <select_1.SelectValue />
          </select_1.SelectTrigger>
          <select_1.SelectContent>
            <select_1.SelectItem value="7d">7 days</select_1.SelectItem>
            <select_1.SelectItem value="30d">30 days</select_1.SelectItem>
            <select_1.SelectItem value="90d">90 days</select_1.SelectItem>
            <select_1.SelectItem value="1y">1 year</select_1.SelectItem>
          </select_1.SelectContent>
        </select_1.Select>
      </div>

      <tabs_1.Tabs defaultValue="trend" className="space-y-4">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="trend">Conversion Trend</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="funnel">Conversion Funnel</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="sources">Traffic Sources</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        {/* Conversion Trend Chart */}
        <tabs_1.TabsContent value="trend" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-base">Conversion Rate Trend</card_1.CardTitle>
                <card_1.CardDescription>Weekly conversion rate performance</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.LineChart data={mockConversionTrend}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <recharts_1.XAxis
                      dataKey="period"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <recharts_1.YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <recharts_1.Tooltip content={<CustomTooltip />} />
                    <recharts_1.Line
                      type="monotone"
                      dataKey="conversionRate"
                      stroke={CHART_COLORS.chart1}
                      strokeWidth={2}
                      dot={{ fill: CHART_COLORS.chart1, r: 4 }}
                    />
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>{" "}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-base">Revenue Trend</card_1.CardTitle>
                <card_1.CardDescription>
                  Weekly revenue from trial conversions
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.AreaChart data={mockConversionTrend}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <recharts_1.XAxis
                      dataKey="period"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <recharts_1.YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <recharts_1.Tooltip content={<CustomTooltip />} />
                    <recharts_1.Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.success}
                      fill={CHART_COLORS.success}
                      fillOpacity={0.1}
                    />
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
        {/* Conversion Funnel */}
        <tabs_1.TabsContent value="funnel" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle className="text-base">Conversion Funnel</card_1.CardTitle>
              <card_1.CardDescription>
                User journey from visitor to paying customer
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                {mockFunnelData.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <badge_1.Badge variant="outline" className="text-xs">
                          {index + 1}
                        </badge_1.Badge>
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{stage.users.toLocaleString()} users</span>
                        <span className="text-muted-foreground">{stage.percentage}%</span>
                        {index > 0 && (
                          <div className="flex items-center text-red-600">
                            <lucide_react_1.TrendingDown className="mr-1 h-3 w-3" />
                            <span>{stage.dropOff}% drop-off</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-chart-1 to-chart-2 h-3 rounded-full transition-all duration-500"
                        style={{
                          width: "".concat(stage.percentage, "%"),
                          background: "linear-gradient(to right, "
                            .concat(CHART_COLORS.chart1, ", ")
                            .concat(CHART_COLORS.chart2, ")"),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>{" "}
        {/* Traffic Sources */}
        <tabs_1.TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-base">Conversion by Source</card_1.CardTitle>
                <card_1.CardDescription>
                  Performance breakdown by traffic source
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.PieChart>
                    <recharts_1.Pie
                      data={mockSourceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="conversions"
                      label={(_a) => {
                        var name = _a.name,
                          value = _a.value,
                          percent = _a.percent;
                        return ""
                          .concat(name, ": ")
                          .concat(value, " (")
                          .concat((percent * 100).toFixed(1), "%)");
                      }}
                    >
                      {mockSourceData.map((entry, index) => (
                        <recharts_1.Cell key={"cell-".concat(index)} fill={entry.fill} />
                      ))}
                    </recharts_1.Pie>
                    <recharts_1.Tooltip content={<CustomTooltip />} />
                  </recharts_1.PieChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>

            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle className="text-base">Source Performance</card_1.CardTitle>
                <card_1.CardDescription>Conversion rates by traffic source</card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                <recharts_1.ResponsiveContainer width="100%" height={300}>
                  <recharts_1.BarChart data={mockSourceData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <recharts_1.XAxis
                      dataKey="source"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <recharts_1.YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <recharts_1.Tooltip content={<CustomTooltip />} />
                    <recharts_1.Bar
                      dataKey="conversionRate"
                      fill={CHART_COLORS.chart3}
                      radius={[4, 4, 0, 0]}
                    />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </card_1.CardContent>
            </card_1.Card>
          </div>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
