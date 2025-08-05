// =====================================================
// Resource Optimization Dashboard Component
// Story 2.4: Smart Resource Management - Frontend
// =====================================================
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
exports.default = ResourceOptimization;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var progress_1 = require("@/components/ui/progress");
var recharts_1 = require("recharts");
var outline_1 = require("@heroicons/react/24/outline");
var sonner_1 = require("sonner");
function ResourceOptimization(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    userRole = _a.userRole;
  var _b = (0, react_1.useState)(null),
    metrics = _b[0],
    setMetrics = _b[1];
  var _c = (0, react_1.useState)([]),
    utilization = _c[0],
    setUtilization = _c[1];
  var _d = (0, react_1.useState)([]),
    suggestions = _d[0],
    setSuggestions = _d[1];
  var _e = (0, react_1.useState)([]),
    timeSeriesData = _e[0],
    setTimeSeriesData = _e[1];
  var _f = (0, react_1.useState)(true),
    loading = _f[0],
    setLoading = _f[1];
  var _g = (0, react_1.useState)(false),
    optimizing = _g[0],
    setOptimizing = _g[1];
  var _h = (0, react_1.useState)("7d"),
    selectedPeriod = _h[0],
    setSelectedPeriod = _h[1];
  // =====================================================
  // Data Fetching
  // =====================================================
  (0, react_1.useEffect)(
    function () {
      fetchOptimizationData();
    },
    [clinicId, selectedPeriod],
  );
  var fetchOptimizationData = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var _a,
        metricsRes,
        utilizationRes,
        suggestionsRes,
        _b,
        metricsData,
        utilizationData,
        suggestionsData,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, 4, 5]);
            setLoading(true);
            return [
              4 /*yield*/,
              Promise.all([
                fetch(
                  "/api/resources/optimize/metrics?clinic_id="
                    .concat(clinicId, "&period=")
                    .concat(selectedPeriod),
                ),
                fetch(
                  "/api/resources/optimize/utilization?clinic_id="
                    .concat(clinicId, "&period=")
                    .concat(selectedPeriod),
                ),
                fetch("/api/resources/optimize/suggestions?clinic_id=".concat(clinicId)),
              ]),
            ];
          case 1:
            (_a = _c.sent()),
              (metricsRes = _a[0]),
              (utilizationRes = _a[1]),
              (suggestionsRes = _a[2]);
            return [
              4 /*yield*/,
              Promise.all([metricsRes.json(), utilizationRes.json(), suggestionsRes.json()]),
            ];
          case 2:
            (_b = _c.sent()),
              (metricsData = _b[0]),
              (utilizationData = _b[1]),
              (suggestionsData = _b[2]);
            if (metricsData.success) setMetrics(metricsData.data);
            if (utilizationData.success) setUtilization(utilizationData.data);
            if (suggestionsData.success) setSuggestions(suggestionsData.data);
            // Generate mock time series data for charts
            generateTimeSeriesData();
            return [3 /*break*/, 5];
          case 3:
            error_1 = _c.sent();
            console.error("Error fetching optimization data:", error_1);
            sonner_1.toast.error("Error loading optimization data");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var generateTimeSeriesData = function () {
    var days = parseInt(selectedPeriod);
    var data = [];
    var today = new Date();
    for (var i = days - 1; i >= 0; i--) {
      var date = new Date(today);
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString(),
        utilization: Math.random() * 40 + 60, // 60-100%
        efficiency: Math.random() * 30 + 70, // 70-100%
        revenue: Math.random() * 2000 + 1000, // $1000-3000
      });
    }
    setTimeSeriesData(data);
  };
  // =====================================================
  // Optimization Actions
  // =====================================================
  var runOptimization = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setOptimizing(true);
            return [
              4 /*yield*/,
              fetch("/api/resources/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  clinic_id: clinicId,
                  optimization_type: "full",
                  period: selectedPeriod,
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            if (data.success) {
              sonner_1.toast.success("Optimization completed successfully");
              fetchOptimizationData();
            } else {
              sonner_1.toast.error("Optimization failed");
            }
            return [3 /*break*/, 5];
          case 3:
            error_2 = _a.sent();
            console.error("Error running optimization:", error_2);
            sonner_1.toast.error("Error running optimization");
            return [3 /*break*/, 5];
          case 4:
            setOptimizing(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // =====================================================
  // UI Helpers
  // =====================================================
  var getTrendIcon = function (trend) {
    switch (trend) {
      case "up":
        return <outline_1.TrendingUpIcon className="h-4 w-4 text-green-500" />;
      case "down":
        return <outline_1.TrendingDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };
  var getPriorityColor = function (priority) {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getEffortColor = function (effort) {
    switch (effort) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  var getSuggestionIcon = function (type) {
    switch (type) {
      case "schedule_optimization":
        return <outline_1.CalendarIcon className="h-5 w-5" />;
      case "capacity_adjustment":
        return <outline_1.ChartBarIcon className="h-5 w-5" />;
      case "maintenance_planning":
        return <outline_1.WrenchIcon className="h-5 w-5" />;
      case "cost_reduction":
        return <outline_1.CurrencyDollarIcon className="h-5 w-5" />;
      default:
        return <outline_1.LightBulbIcon className="h-5 w-5" />;
    }
  };
  // =====================================================
  // Chart Colors
  // =====================================================
  var COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
  // =====================================================
  // Render Components
  // =====================================================
  var MetricsOverview = function () {
    var _a, _b, _c;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization Rate</p>
                <p className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.utilization_rate)
                    ? "".concat(Math.round(metrics.utilization_rate), "%")
                    : "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                {((_a =
                  metrics === null || metrics === void 0 ? void 0 : metrics.trend_analysis) ===
                  null || _a === void 0
                  ? void 0
                  : _a.utilization_trend) && getTrendIcon(metrics.trend_analysis.utilization_trend)}
              </div>
            </div>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.utilization_rate) && (
              <progress_1.Progress value={metrics.utilization_rate} className="mt-2" />
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency Score</p>
                <p className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.efficiency_score)
                    ? "".concat(Math.round(metrics.efficiency_score), "%")
                    : "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                {((_b =
                  metrics === null || metrics === void 0 ? void 0 : metrics.trend_analysis) ===
                  null || _b === void 0
                  ? void 0
                  : _b.efficiency_trend) && getTrendIcon(metrics.trend_analysis.efficiency_trend)}
              </div>
            </div>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.efficiency_score) && (
              <progress_1.Progress value={metrics.efficiency_score} className="mt-2" />
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cost Effectiveness</p>
                <p className="text-2xl font-bold">
                  {(metrics === null || metrics === void 0 ? void 0 : metrics.cost_effectiveness)
                    ? "".concat(Math.round(metrics.cost_effectiveness), "%")
                    : "N/A"}
                </p>
              </div>
              <div className="flex items-center">
                {((_c =
                  metrics === null || metrics === void 0 ? void 0 : metrics.trend_analysis) ===
                  null || _c === void 0
                  ? void 0
                  : _c.cost_trend) && getTrendIcon(metrics.trend_analysis.cost_trend)}
              </div>
            </div>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.cost_effectiveness) && (
              <progress_1.Progress value={metrics.cost_effectiveness} className="mt-2" />
            )}
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance Compliance</p>
                <p className="text-2xl font-bold">
                  {(
                    metrics === null || metrics === void 0
                      ? void 0
                      : metrics.maintenance_compliance
                  )
                    ? "".concat(Math.round(metrics.maintenance_compliance), "%")
                    : "N/A"}
                </p>
              </div>
              <outline_1.WrenchIcon className="h-6 w-6 text-gray-400" />
            </div>
            {(metrics === null || metrics === void 0 ? void 0 : metrics.maintenance_compliance) && (
              <progress_1.Progress value={metrics.maintenance_compliance} className="mt-2" />
            )}
          </card_1.CardContent>
        </card_1.Card>
      </div>
    );
  };
  var UtilizationChart = function () {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Resource Utilization</card_1.CardTitle>
          <card_1.CardDescription>
            Utilization percentage by resource over the selected period
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.BarChart data={utilization}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" />
              <recharts_1.XAxis dataKey="resource_name" angle={-45} textAnchor="end" height={100} />
              <recharts_1.YAxis />
              <recharts_1.Tooltip
                formatter={function (value, name) {
                  return ["".concat(value, "%"), "Utilization"];
                }}
                labelFormatter={function (label) {
                  return "Resource: ".concat(label);
                }}
              />
              <recharts_1.Bar dataKey="utilization_percentage" fill="#8884d8" />
            </recharts_1.BarChart>
          </recharts_1.ResponsiveContainer>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var TimeSeriesChart = function () {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Trends Over Time</card_1.CardTitle>
          <card_1.CardDescription>
            Key metrics trends over the selected period
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <recharts_1.ResponsiveContainer width="100%" height={300}>
            <recharts_1.LineChart data={timeSeriesData}>
              <recharts_1.CartesianGrid strokeDasharray="3 3" />
              <recharts_1.XAxis dataKey="date" />
              <recharts_1.YAxis />
              <recharts_1.Tooltip />
              <recharts_1.Line
                type="monotone"
                dataKey="utilization"
                stroke="#8884d8"
                name="Utilization %"
              />
              <recharts_1.Line
                type="monotone"
                dataKey="efficiency"
                stroke="#82ca9d"
                name="Efficiency %"
              />
            </recharts_1.LineChart>
          </recharts_1.ResponsiveContainer>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  var SuggestionsList = function () {
    return (
      <card_1.Card>
        <card_1.CardHeader>
          <card_1.CardTitle>Optimization Suggestions</card_1.CardTitle>
          <card_1.CardDescription>
            AI-powered recommendations to improve resource efficiency
          </card_1.CardDescription>
        </card_1.CardHeader>
        <card_1.CardContent>
          <div className="space-y-4">
            {suggestions.length === 0
              ? <p className="text-gray-500 text-center py-4">No suggestions available</p>
              : suggestions.map(function (suggestion) {
                  return (
                    <div key={suggestion.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="mt-1">
                            {getSuggestionIcon(suggestion.suggestion_type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{suggestion.resource_name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              {suggestion.description}
                            </div>
                            <div className="text-sm text-blue-600 mt-1">
                              <strong>Potential Impact:</strong> {suggestion.potential_impact}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <badge_1.Badge className={getPriorityColor(suggestion.priority)}>
                            {suggestion.priority}
                          </badge_1.Badge>
                          <badge_1.Badge
                            className={getEffortColor(suggestion.implementation_effort)}
                          >
                            {suggestion.implementation_effort} effort
                          </badge_1.Badge>
                          <badge_1.Badge variant="outline">
                            {Math.round(suggestion.confidence_score * 100)}% confidence
                          </badge_1.Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </card_1.CardContent>
      </card_1.Card>
    );
  };
  // =====================================================
  // Main Render
  // =====================================================
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-lg">Loading optimization data...</div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Resource Optimization</h1>
          <p className="text-gray-600 mt-2">
            AI-powered insights and recommendations for optimal resource utilization
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={function (e) {
              return setSelectedPeriod(e.target.value);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          {userRole !== "patient" && (
            <button_1.Button onClick={runOptimization} disabled={optimizing}>
              {optimizing ? "Optimizing..." : "Run Optimization"}
            </button_1.Button>
          )}
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview />

      {/* Charts and Analysis */}
      <tabs_1.Tabs defaultValue="utilization" className="w-full">
        <tabs_1.TabsList>
          <tabs_1.TabsTrigger value="utilization">Utilization Analysis</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="trends">Trends</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="suggestions">Suggestions</tabs_1.TabsTrigger>
        </tabs_1.TabsList>
        <tabs_1.TabsContent value="utilization" className="mt-6">
          <UtilizationChart />
        </tabs_1.TabsContent>
        <tabs_1.TabsContent value="trends" className="mt-6">
          <TimeSeriesChart />
        </tabs_1.TabsContent>
        <tabs_1.TabsContent value="suggestions" className="mt-6">
          <SuggestionsList />
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
