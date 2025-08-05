/**
 * Demand Forecasting Dashboard - Story 11.1
 *
 * Comprehensive dashboard for demand forecasting with ≥80% accuracy
 * Includes real-time monitoring, resource allocation, and performance tracking
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
exports.default = ForecastingDashboard;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var alert_1 = require("@/components/ui/alert");
var skeleton_1 = require("@/components/ui/skeleton");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
var date_fns_1 = require("date-fns");
var sonner_1 = require("sonner");
var demand_forecasting_1 = require("@/types/demand-forecasting");
function ForecastingDashboard(_a) {
  var _this = this;
  var _b, _c, _d, _e;
  var className = _a.className;
  var _f = (0, react_1.useState)("overview"),
    selectedTab = _f[0],
    setSelectedTab = _f[1];
  var _g = (0, react_1.useState)({
      forecastPeriod: "weekly",
      lookAheadDays: 30,
      includeSeasonality: true,
      includeExternalFactors: true,
      confidenceLevel: 0.95,
    }),
    forecastParams = _g[0],
    setForecastParams = _g[1];
  var queryClient = (0, react_query_1.useQueryClient)();
  // Query for current forecasts
  var _h = (0, react_query_1.useQuery)({
      queryKey: ["demand-forecasts", forecastParams],
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var params, response, result;
          var _a;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                params = new URLSearchParams({
                  forecastPeriod: forecastParams.forecastPeriod,
                  lookAheadDays: forecastParams.lookAheadDays.toString(),
                  includeSeasonality: forecastParams.includeSeasonality.toString(),
                  includeExternalFactors: forecastParams.includeExternalFactors.toString(),
                  confidenceLevel: forecastParams.confidenceLevel.toString(),
                });
                return [4 /*yield*/, fetch("/api/forecasting?".concat(params))];
              case 1:
                response = _b.sent();
                if (!response.ok) {
                  throw new Error("HTTP error! status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
              case 2:
                result = _b.sent();
                if (!result.success) {
                  throw new Error(
                    ((_a = result.error) === null || _a === void 0 ? void 0 : _a.message) ||
                      "Failed to fetch forecasts",
                  );
                }
                return [2 /*return*/, result.data];
            }
          });
        });
      },
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    }),
    forecasts = _h.data,
    forecastsLoading = _h.isLoading,
    forecastsError = _h.error;
  // Query for active alerts
  var _j = (0, react_query_1.useQuery)({
      queryKey: ["demand-alerts"],
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var response, result;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, fetch("/api/forecasting/alerts")];
              case 1:
                response = _a.sent();
                if (!response.ok) {
                  throw new Error("HTTP error! status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
              case 2:
                result = _a.sent();
                return [2 /*return*/, result.success ? result.data : []];
            }
          });
        });
      },
      refetchInterval: 30 * 1000, // Refresh every 30 seconds for alerts
    }),
    alerts = _j.data,
    alertsLoading = _j.isLoading;
  // Query for resource allocation recommendations
  var _k = (0, react_query_1.useQuery)({
      queryKey: [
        "resource-allocations",
        forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts,
      ],
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var forecastIds, response, result;
          var _a;
          return __generator(this, function (_b) {
            switch (_b.label) {
              case 0:
                if (
                  !((_a =
                    forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts) ===
                    null || _a === void 0
                    ? void 0
                    : _a.length)
                )
                  return [2 /*return*/, []];
                forecastIds = forecasts.forecasts.map(function (f) {
                  return f.id;
                });
                return [
                  4 /*yield*/,
                  fetch("/api/forecasting/resource-allocation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      forecastIds: forecastIds,
                      optimizationType: "balanced",
                    }),
                  }),
                ];
              case 1:
                response = _b.sent();
                if (!response.ok) {
                  throw new Error("HTTP error! status: ".concat(response.status));
                }
                return [4 /*yield*/, response.json()];
              case 2:
                result = _b.sent();
                return [2 /*return*/, result.success ? result.data : null];
            }
          });
        });
      },
      enabled: !!((_b =
        forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts) === null ||
      _b === void 0
        ? void 0
        : _b.length),
    }),
    resourceAllocations = _k.data,
    resourceLoading = _k.isLoading;
  // Mutation for generating new forecasts
  var generateForecastMutation = (0, react_query_1.useMutation)({
    mutationFn: function (params) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/forecasting", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }),
              ];
            case 1:
              response = _b.sent();
              if (!response.ok) {
                throw new Error("HTTP error! status: ".concat(response.status));
              }
              return [4 /*yield*/, response.json()];
            case 2:
              result = _b.sent();
              if (!result.success) {
                throw new Error(
                  ((_a = result.error) === null || _a === void 0 ? void 0 : _a.message) ||
                    "Failed to generate forecast",
                );
              }
              return [2 /*return*/, result.data];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: ["demand-forecasts"] });
      sonner_1.toast.success("Demand forecast generated successfully");
    },
    onError: function (error) {
      sonner_1.toast.error("Failed to generate forecast: ".concat(error.message));
    },
  });
  // Calculate metrics
  var metrics = react_1.default.useMemo(
    function () {
      var _a, _b;
      if (!forecasts) {
        return {
          overall_accuracy: 0,
          total_forecasts: 0,
          active_alerts: 0,
          confidence_average: 0,
          trend_direction: "stable",
        };
      }
      var activeAlerts =
        (alerts === null || alerts === void 0
          ? void 0
          : alerts.filter(function (alert) {
              return alert.status === "active";
            }).length) || 0;
      var confidenceAvg =
        ((_a = forecasts.forecasts) === null || _a === void 0 ? void 0 : _a.length) > 0
          ? forecasts.forecasts.reduce(function (sum, f) {
              return sum + f.confidence_level;
            }, 0) / forecasts.forecasts.length
          : 0;
      return {
        overall_accuracy: forecasts.accuracy || 0,
        total_forecasts:
          ((_b = forecasts.forecasts) === null || _b === void 0 ? void 0 : _b.length) || 0,
        active_alerts: activeAlerts,
        confidence_average: confidenceAvg,
        trend_direction:
          forecasts.accuracy >= demand_forecasting_1.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD
            ? "up"
            : "down",
      };
    },
    [forecasts, alerts],
  );
  // Transform data for charts
  var chartData = react_1.default.useMemo(
    function () {
      if (!(forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts)) return [];
      return forecasts.forecasts.map(function (forecast) {
        return {
          date: (0, date_fns_1.format)((0, date_fns_1.parseISO)(forecast.period_start), "MMM dd"),
          predicted_demand: forecast.predicted_demand,
          confidence: Math.round(forecast.confidence_level * 100),
          period: forecast.period_start,
        };
      });
    },
    [forecasts],
  );
  var handleRegenerateForecast = function () {
    generateForecastMutation.mutate(forecastParams);
  };
  var handleExportData = function () {
    if (!(forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts)) {
      sonner_1.toast.error("No forecast data to export");
      return;
    }
    var csvData = forecasts.forecasts.map(function (f) {
      return {
        ID: f.id,
        Type: f.forecast_type,
        "Service ID": f.service_id || "All Services",
        "Period Start": f.period_start,
        "Period End": f.period_end,
        "Predicted Demand": f.predicted_demand,
        "Confidence Level": Math.round(f.confidence_level * 100) + "%",
        "Created At": f.created_at,
      };
    });
    var csv = __spreadArray(
      [Object.keys(csvData[0]).join(",")],
      csvData.map(function (row) {
        return Object.values(row).join(",");
      }),
      true,
    ).join("\n");
    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "demand-forecasts-".concat(
      (0, date_fns_1.format)(new Date(), "yyyy-MM-dd"),
      ".csv",
    );
    link.click();
    URL.revokeObjectURL(url);
    sonner_1.toast.success("Forecast data exported successfully");
  };
  if (forecastsError) {
    return (
      <div className={className}>
        <alert_1.Alert variant="destructive">
          <lucide_react_1.AlertTriangle className="h-4 w-4" />
          <alert_1.AlertTitle>Error Loading Forecasts</alert_1.AlertTitle>
          <alert_1.AlertDescription>
            {forecastsError.message}. Please try refreshing the page.
          </alert_1.AlertDescription>
        </alert_1.Alert>
      </div>
    );
  }
  return (
    <div className={"space-y-6 ".concat(className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demand Forecasting</h1>
          <p className="text-muted-foreground">AI-powered demand prediction with ≥80% accuracy</p>
        </div>
        <div className="flex gap-2">
          <button_1.Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            disabled={
              !((_c = forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts) ===
                null || _c === void 0
                ? void 0
                : _c.length)
            }
          >
            <lucide_react_1.Download className="h-4 w-4 mr-2" />
            Export
          </button_1.Button>
          <button_1.Button
            size="sm"
            onClick={handleRegenerateForecast}
            disabled={generateForecastMutation.isPending}
          >
            <lucide_react_1.RefreshCw
              className={"h-4 w-4 mr-2 ".concat(
                generateForecastMutation.isPending ? "animate-spin" : "",
              )}
            />
            Regenerate
          </button_1.Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Overall Accuracy</card_1.CardTitle>
            <lucide_react_1.Target className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading
                ? <skeleton_1.Skeleton className="h-8 w-16" />
                : "".concat(Math.round(metrics.overall_accuracy * 100), "%")}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.overall_accuracy >=
              demand_forecasting_1.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD
                ? <span className="text-green-600">Above 80% threshold</span>
                : <span className="text-red-600">Below 80% threshold</span>}
            </p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Forecasts</card_1.CardTitle>
            <lucide_react_1.BarChart3 className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading
                ? <skeleton_1.Skeleton className="h-8 w-16" />
                : metrics.total_forecasts}
            </div>
            <p className="text-xs text-muted-foreground">Demand predictions</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Active Alerts</card_1.CardTitle>
            <lucide_react_1.AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {alertsLoading ? <skeleton_1.Skeleton className="h-8 w-16" /> : metrics.active_alerts}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </card_1.CardContent>
        </card_1.Card>

        <card_1.Card>
          <card_1.CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <card_1.CardTitle className="text-sm font-medium">Avg Confidence</card_1.CardTitle>
            <lucide_react_1.CheckCircle className="h-4 w-4 text-muted-foreground" />
          </card_1.CardHeader>
          <card_1.CardContent>
            <div className="text-2xl font-bold">
              {forecastsLoading
                ? <skeleton_1.Skeleton className="h-8 w-16" />
                : "".concat(Math.round(metrics.confidence_average * 100), "%")}
            </div>
            <p className="text-xs text-muted-foreground">Prediction confidence</p>
          </card_1.CardContent>
        </card_1.Card>
      </div>

      {/* Main Content Tabs */}
      <tabs_1.Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <tabs_1.TabsList className="grid w-full grid-cols-4">
          <tabs_1.TabsTrigger value="overview">Overview</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="forecasts">Forecasts</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="resources">Resources</tabs_1.TabsTrigger>
          <tabs_1.TabsTrigger value="alerts">Alerts</tabs_1.TabsTrigger>
        </tabs_1.TabsList>

        <tabs_1.TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Demand Forecast Chart */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Demand Forecast Trend</card_1.CardTitle>
                <card_1.CardDescription>
                  Predicted demand over the next {forecastParams.lookAheadDays} days
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {forecastsLoading
                  ? <skeleton_1.Skeleton className="h-[200px] w-full" />
                  : <recharts_1.ResponsiveContainer width="100%" height={200}>
                      <recharts_1.LineChart data={chartData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3" />
                        <recharts_1.XAxis dataKey="date" />
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Line
                          type="monotone"
                          dataKey="predicted_demand"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </recharts_1.LineChart>
                    </recharts_1.ResponsiveContainer>}
              </card_1.CardContent>
            </card_1.Card>

            {/* Confidence Distribution */}
            <card_1.Card>
              <card_1.CardHeader>
                <card_1.CardTitle>Confidence Distribution</card_1.CardTitle>
                <card_1.CardDescription>
                  Forecast confidence levels across predictions
                </card_1.CardDescription>
              </card_1.CardHeader>
              <card_1.CardContent>
                {forecastsLoading
                  ? <skeleton_1.Skeleton className="h-[200px] w-full" />
                  : <recharts_1.ResponsiveContainer width="100%" height={200}>
                      <recharts_1.BarChart data={chartData}>
                        <recharts_1.CartesianGrid strokeDasharray="3 3" />
                        <recharts_1.XAxis dataKey="date" />
                        <recharts_1.YAxis />
                        <recharts_1.Tooltip />
                        <recharts_1.Bar dataKey="confidence" fill="#82ca9d" />
                      </recharts_1.BarChart>
                    </recharts_1.ResponsiveContainer>}
              </card_1.CardContent>
            </card_1.Card>
          </div>

          {/* Accuracy Status */}
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Accuracy Status</card_1.CardTitle>
              <card_1.CardDescription>Current forecasting model performance</card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Accuracy</span>
                  <span className="text-sm">
                    {Math.round(metrics.overall_accuracy * 100)}% / 80% required
                  </span>
                </div>
                <progress_1.Progress value={metrics.overall_accuracy * 100} className="w-full" />
                {metrics.overall_accuracy >=
                demand_forecasting_1.FORECASTING_CONSTANTS.MIN_ACCURACY_THRESHOLD
                  ? <badge_1.Badge variant="default" className="bg-green-500">
                      <lucide_react_1.CheckCircle className="h-3 w-3 mr-1" />
                      Meeting accuracy requirements
                    </badge_1.Badge>
                  : <badge_1.Badge variant="destructive">
                      <lucide_react_1.AlertTriangle className="h-3 w-3 mr-1" />
                      Below accuracy threshold
                    </badge_1.Badge>}
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="forecasts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Forecast Details</card_1.CardTitle>
              <card_1.CardDescription>
                Detailed view of all active demand forecasts
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {forecastsLoading
                ? <div className="space-y-2">
                    {__spreadArray([], Array(5), true).map(function (_, i) {
                      return <skeleton_1.Skeleton key={i} className="h-12 w-full" />;
                    })}
                  </div>
                : ((_d =
                      forecasts === null || forecasts === void 0 ? void 0 : forecasts.forecasts) ===
                      null || _d === void 0
                      ? void 0
                      : _d.length) > 0
                  ? <div className="space-y-2">
                      {forecasts.forecasts.map(function (forecast) {
                        return (
                          <div
                            key={forecast.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                {forecast.forecast_type.replace("_", " ").toUpperCase()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {(0, date_fns_1.format)(
                                  (0, date_fns_1.parseISO)(forecast.period_start),
                                  "MMM dd, yyyy",
                                )}{" "}
                                -
                                {(0, date_fns_1.format)(
                                  (0, date_fns_1.parseISO)(forecast.period_end),
                                  "MMM dd, yyyy",
                                )}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-sm font-bold">
                                {forecast.predicted_demand} appointments
                              </p>
                              <badge_1.Badge variant="outline">
                                {Math.round(forecast.confidence_level * 100)}% confidence
                              </badge_1.Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  : <div className="text-center py-6">
                      <p className="text-muted-foreground">No forecasts available</p>
                      <button_1.Button
                        className="mt-2"
                        onClick={handleRegenerateForecast}
                        disabled={generateForecastMutation.isPending}
                      >
                        Generate Forecasts
                      </button_1.Button>
                    </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="resources" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Resource Allocation</card_1.CardTitle>
              <card_1.CardDescription>
                AI-recommended resource allocation based on demand forecasts
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {resourceLoading
                ? <div className="space-y-2">
                    {__spreadArray([], Array(3), true).map(function (_, i) {
                      return <skeleton_1.Skeleton key={i} className="h-16 w-full" />;
                    })}
                  </div>
                : ((_e =
                      resourceAllocations === null || resourceAllocations === void 0
                        ? void 0
                        : resourceAllocations.recommendations) === null || _e === void 0
                      ? void 0
                      : _e.length) > 0
                  ? <div className="space-y-3">
                      {resourceAllocations.recommendations.map(function (allocation) {
                        var _a;
                        return (
                          <div
                            key={allocation.forecast_id}
                            className="p-4 border rounded-lg space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">
                                {((_a = allocation.staffing) === null || _a === void 0
                                  ? void 0
                                  : _a.required_staff_count) || 0}{" "}
                                Staff Members
                              </h4>
                              <badge_1.Badge
                                variant={
                                  allocation.priority_level === "critical"
                                    ? "destructive"
                                    : allocation.priority_level === "high"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {allocation.priority_level}
                              </badge_1.Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Cost Impact: $
                              {allocation.cost_optimization.total_cost_impact.toLocaleString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Efficiency Gain:{" "}
                              {allocation.cost_optimization.efficiency_gains.toFixed(1)}%
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  : <div className="text-center py-6">
                      <p className="text-muted-foreground">
                        No resource allocations available. Generate forecasts first.
                      </p>
                    </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>

        <tabs_1.TabsContent value="alerts" className="space-y-4">
          <card_1.Card>
            <card_1.CardHeader>
              <card_1.CardTitle>Active Alerts</card_1.CardTitle>
              <card_1.CardDescription>
                Real-time monitoring alerts for demand and capacity
              </card_1.CardDescription>
            </card_1.CardHeader>
            <card_1.CardContent>
              {alertsLoading
                ? <div className="space-y-2">
                    {__spreadArray([], Array(3), true).map(function (_, i) {
                      return <skeleton_1.Skeleton key={i} className="h-12 w-full" />;
                    })}
                  </div>
                : (alerts === null || alerts === void 0 ? void 0 : alerts.length) > 0
                  ? <div className="space-y-2">
                      {alerts.map(function (alert) {
                        return (
                          <alert_1.Alert
                            key={alert.id}
                            variant={alert.severity === "critical" ? "destructive" : "default"}
                          >
                            <lucide_react_1.AlertTriangle className="h-4 w-4" />
                            <alert_1.AlertTitle className="capitalize">
                              {alert.alert_type.replace("_", " ")} - {alert.severity}
                            </alert_1.AlertTitle>
                            <alert_1.AlertDescription>{alert.message}</alert_1.AlertDescription>
                          </alert_1.Alert>
                        );
                      })}
                    </div>
                  : <div className="text-center py-6">
                      <lucide_react_1.CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No active alerts</p>
                    </div>}
            </card_1.CardContent>
          </card_1.Card>
        </tabs_1.TabsContent>
      </tabs_1.Tabs>
    </div>
  );
}
