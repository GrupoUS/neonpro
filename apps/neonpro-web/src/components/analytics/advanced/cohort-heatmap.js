"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CohortHeatmap = CohortHeatmap;
/**
 * Advanced Cohort Heatmap Component for NeonPro
 *
 * Interactive cohort analysis visualization using Recharts.
 * Displays retention rates across cohorts and time periods
 * with advanced features like tooltips, animations, and filtering.
 */
var react_1 = require("react");
var recharts_1 = require("recharts");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
// Color scales for heatmap
var getRetentionColor = function (rate) {
  if (rate >= 80) return "#10b981"; // Green
  if (rate >= 60) return "#f59e0b"; // Yellow
  if (rate >= 40) return "#f97316"; // Orange
  if (rate >= 20) return "#ef4444"; // Red
  return "#6b7280"; // Gray
};
var getIntensity = function (rate) {
  return Math.min(Math.max(rate / 100, 0.1), 1);
};
function CohortHeatmap(_a) {
  var cohorts = _a.cohorts,
    _b = _a.loading,
    loading = _b === void 0 ? false : _b,
    _c = _a.className,
    className = _c === void 0 ? "" : _c,
    onCohortSelect = _a.onCohortSelect,
    onPeriodSelect = _a.onPeriodSelect;
  var _d = (0, react_1.useState)("retention"),
    selectedMetric = _d[0],
    setSelectedMetric = _d[1];
  var _e = (0, react_1.useState)("heatmap"),
    selectedView = _e[0],
    setSelectedView = _e[1];
  var _f = (0, react_1.useState)(null),
    hoveredCell = _f[0],
    setHoveredCell = _f[1];
  // Transform data for heatmap visualization
  var heatmapData = (0, react_1.useMemo)(
    function () {
      if (!cohorts.length) return [];
      var maxPeriods = Math.max.apply(
        Math,
        cohorts.map(function (c) {
          return c.periods.length;
        }),
      );
      var data = [];
      var _loop_1 = function (period) {
        var periodData = { period: "Period ".concat(period) };
        cohorts.forEach(function (cohort) {
          var periodMetric = cohort.periods[period];
          if (periodMetric) {
            var value = 0;
            if (selectedMetric === "retention") {
              value = periodMetric.retentionRate;
            } else if (selectedMetric === "revenue") {
              value = periodMetric.averageRevenuePerUser;
            } else {
              value = periodMetric.churnRate;
            }
            periodData[cohort.cohortName] = value;
          }
        });
        data.push(periodData);
      };
      for (var period = 0; period < maxPeriods; period++) {
        _loop_1(period);
      }
      return data;
    },
    [cohorts, selectedMetric],
  );
  // Calculate cohort performance trends
  var trendData = (0, react_1.useMemo)(
    function () {
      return cohorts.map(function (cohort) {
        var _a;
        var periods = cohort.periods.map(function (period, index) {
          return {
            period: index,
            retention: period.retentionRate,
            revenue: period.averageRevenuePerUser,
            churn: period.churnRate,
            users: period.activeUsers,
          };
        });
        return {
          cohortId: cohort.cohortId,
          cohortName: cohort.cohortName,
          startDate: cohort.startDate,
          userCount: cohort.userCount,
          periods: periods,
          avgRetention:
            periods.reduce(function (sum, p) {
              return sum + p.retention;
            }, 0) / periods.length,
          totalRevenue: periods.reduce(function (sum, p) {
            return sum + p.revenue;
          }, 0),
          finalRetention:
            ((_a = periods[periods.length - 1]) === null || _a === void 0
              ? void 0
              : _a.retention) || 0,
        };
      });
    },
    [cohorts],
  );
  // Calculate cohort comparison metrics
  var comparisonData = (0, react_1.useMemo)(
    function () {
      return cohorts
        .map(function (cohort) {
          var periods = cohort.periods;
          var initialUsers = cohort.userCount;
          var finalPeriod = periods[periods.length - 1];
          return {
            cohortName: cohort.cohortName,
            initialUsers: initialUsers,
            finalRetention:
              (finalPeriod === null || finalPeriod === void 0
                ? void 0
                : finalPeriod.retentionRate) || 0,
            totalRevenue: periods.reduce(function (sum, p) {
              return sum + p.revenue;
            }, 0),
            avgRevenuePerUser:
              periods.reduce(function (sum, p) {
                return sum + p.averageRevenuePerUser;
              }, 0) / periods.length,
            performanceScore:
              ((finalPeriod === null || finalPeriod === void 0
                ? void 0
                : finalPeriod.retentionRate) || 0) *
                0.6 +
              (periods.reduce(function (sum, p) {
                return sum + p.averageRevenuePerUser;
              }, 0) /
                periods.length) *
                0.4,
          };
        })
        .sort(function (a, b) {
          return b.performanceScore - a.performanceScore;
        });
    },
    [cohorts],
  );
  // Custom tooltip for heatmap
  var HeatmapTooltip = function (_a) {
    var active = _a.active,
      payload = _a.payload,
      label = _a.label;
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map(function (entry, index) {
          return (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">{entry.dataKey}:</span>
              <span className="text-sm font-medium">
                {selectedMetric === "retention" || selectedMetric === "churn"
                  ? "".concat(entry.value.toFixed(1), "%")
                  : "$".concat(entry.value.toFixed(2))}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  // Trend tooltip
  var TrendTooltip = function (_a) {
    var active = _a.active,
      payload = _a.payload,
      label = _a.label;
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="bg-white p-4 border rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">Period {label}</p>
        {payload.map(function (entry, index) {
          return (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600">{entry.name}:</span>
              <span className="text-sm font-medium">
                {entry.dataKey === "retention" || entry.dataKey === "churn"
                  ? "".concat(entry.value.toFixed(1), "%")
                  : entry.dataKey === "revenue"
                    ? "$".concat(entry.value.toFixed(2))
                    : entry.value.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    );
  };
  if (loading) {
    return (
      <card_1.Card className={"w-full ".concat(className)}>
        <card_1.CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-100 rounded animate-pulse" />
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="h-96 bg-gray-50 rounded animate-pulse" />
        </card_1.CardContent>
      </card_1.Card>
    );
  }
  return (
    <card_1.Card className={"w-full ".concat(className)}>
      <card_1.CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <card_1.CardTitle className="flex items-center gap-2">
              <lucide_react_1.Users className="h-5 w-5 text-blue-600" />
              Cohort Analysis
            </card_1.CardTitle>
            <card_1.CardDescription>
              Track user retention and revenue across cohorts over time
            </card_1.CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select_1.Select
              value={selectedMetric}
              onValueChange={function (value) {
                return setSelectedMetric(value);
              }}
            >
              <select_1.SelectTrigger className="w-32">
                <select_1.SelectValue />
              </select_1.SelectTrigger>
              <select_1.SelectContent>
                <select_1.SelectItem value="retention">Retention</select_1.SelectItem>
                <select_1.SelectItem value="revenue">Revenue</select_1.SelectItem>
                <select_1.SelectItem value="churn">Churn</select_1.SelectItem>
              </select_1.SelectContent>
            </select_1.Select>
          </div>
        </div>
      </card_1.CardHeader>
      <card_1.CardContent>
        <tabs_1.Tabs
          value={selectedView}
          onValueChange={function (value) {
            return setSelectedView(value);
          }}
        >
          <tabs_1.TabsList className="grid w-full grid-cols-3">
            <tabs_1.TabsTrigger value="heatmap">Heatmap</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="trends">Trends</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="comparison">Comparison</tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="heatmap" className="mt-6">
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Total Cohorts</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{cohorts.length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Avg Retention</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {cohorts.length > 0
                      ? "".concat(
                          (
                            trendData.reduce(function (sum, c) {
                              return sum + c.avgRetention;
                            }, 0) / trendData.length
                          ).toFixed(1),
                          "%",
                        )
                      : "0%"}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.DollarSign className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    $
                    {trendData
                      .reduce(function (sum, c) {
                        return sum + c.totalRevenue;
                      }, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <lucide_react_1.Calendar className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-700">Avg Periods</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">
                    {cohorts.length > 0
                      ? Math.round(
                          cohorts.reduce(function (sum, c) {
                            return sum + c.periods.length;
                          }, 0) / cohorts.length,
                        )
                      : 0}
                  </p>
                </div>
              </div>

              {/* Area Chart for Heatmap Data */}
              <div className="h-96">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.AreaChart data={heatmapData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="period" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip content={<HeatmapTooltip />} />
                    <recharts_1.Legend />
                    {cohorts.map(function (cohort, index) {
                      return (
                        <recharts_1.Area
                          key={cohort.cohortId}
                          type="monotone"
                          dataKey={cohort.cohortName}
                          stackId="1"
                          stroke={"hsl(".concat((index * 360) / cohorts.length, ", 70%, 50%)")}
                          fill={"hsl(".concat((index * 360) / cohorts.length, ", 70%, 50%)")}
                          fillOpacity={0.6}
                        />
                      );
                    })}
                  </recharts_1.AreaChart>
                </recharts_1.ResponsiveContainer>
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="trends" className="mt-6">
            <div className="space-y-6">
              {/* Trend Chart */}
              <div className="h-96">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.LineChart>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis dataKey="period" />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip content={<TrendTooltip />} />
                    <recharts_1.Legend />
                    {trendData.map(function (cohort, index) {
                      return (
                        <recharts_1.Line
                          key={cohort.cohortId}
                          type="monotone"
                          dataKey={selectedMetric}
                          data={cohort.periods}
                          stroke={"hsl(".concat((index * 360) / trendData.length, ", 70%, 50%)")}
                          strokeWidth={2}
                          name={cohort.cohortName}
                        />
                      );
                    })}
                  </recharts_1.LineChart>
                </recharts_1.ResponsiveContainer>
              </div>

              {/* Cohort Performance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendData.map(function (cohort) {
                  var _a;
                  return (
                    <card_1.Card key={cohort.cohortId} className="border-l-4 border-l-blue-500">
                      <card_1.CardHeader className="pb-2">
                        <card_1.CardTitle className="text-sm font-medium">
                          {cohort.cohortName}
                        </card_1.CardTitle>
                        <card_1.CardDescription className="text-xs">
                          Started {new Date(cohort.startDate).toLocaleDateString()}
                        </card_1.CardDescription>
                      </card_1.CardHeader>
                      <card_1.CardContent className="pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Initial Users</span>
                            <span className="text-sm font-medium">
                              {cohort.userCount.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Avg Retention</span>
                            <badge_1.Badge
                              variant={cohort.avgRetention >= 50 ? "default" : "secondary"}
                            >
                              {cohort.avgRetention.toFixed(1)}%
                            </badge_1.Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Final Retention</span>
                            <div className="flex items-center gap-1">
                              {cohort.finalRetention >
                              ((_a = cohort.periods[0]) === null || _a === void 0
                                ? void 0
                                : _a.retention)
                                ? <lucide_react_1.TrendingUp className="h-3 w-3 text-green-500" />
                                : <lucide_react_1.TrendingDown className="h-3 w-3 text-red-500" />}
                              <span className="text-sm font-medium">
                                {cohort.finalRetention.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Total Revenue</span>
                            <span className="text-sm font-medium">
                              ${cohort.totalRevenue.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </card_1.CardContent>
                    </card_1.Card>
                  );
                })}
              </div>
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="comparison" className="mt-6">
            <div className="space-y-6">
              {/* Comparison Bar Chart */}
              <div className="h-96">
                <recharts_1.ResponsiveContainer width="100%" height="100%">
                  <recharts_1.BarChart data={comparisonData}>
                    <recharts_1.CartesianGrid strokeDasharray="3 3" />
                    <recharts_1.XAxis
                      dataKey="cohortName"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <recharts_1.YAxis />
                    <recharts_1.Tooltip
                      formatter={function (value, name) {
                        return [
                          name === "finalRetention"
                            ? "".concat(value.toFixed(1), "%")
                            : name.includes("Revenue")
                              ? "$".concat(value.toFixed(2))
                              : value.toLocaleString(),
                          name,
                        ];
                      }}
                    />
                    <recharts_1.Legend />
                    <recharts_1.Bar
                      dataKey="finalRetention"
                      fill="#3b82f6"
                      name="Final Retention %"
                    />
                    <recharts_1.Bar
                      dataKey="avgRevenuePerUser"
                      fill="#10b981"
                      name="Avg Revenue Per User"
                    />
                  </recharts_1.BarChart>
                </recharts_1.ResponsiveContainer>
              </div>

              {/* Performance Ranking */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Cohort Performance Ranking</h3>
                <div className="space-y-2">
                  {comparisonData.map(function (cohort, index) {
                    return (
                      <div
                        key={cohort.cohortName}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <badge_1.Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </badge_1.Badge>
                          <div>
                            <p className="font-medium">{cohort.cohortName}</p>
                            <p className="text-sm text-gray-600">
                              {cohort.initialUsers.toLocaleString()} initial users
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Score: {cohort.performanceScore.toFixed(1)}</p>
                          <p className="text-sm text-gray-600">
                            {cohort.finalRetention.toFixed(1)}% retention
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </card_1.CardContent>
    </card_1.Card>
  );
}
