"use strict";
/**
 * Advanced Forecasting React Hook for NeonPro
 *
 * Custom hook providing comprehensive forecasting capabilities including:
 * - ML-inspired time series forecasting
 * - Scenario analysis and sensitivity testing
 * - Statistical model evaluation and confidence intervals
 * - Real-time prediction updates with data validation
 * - Export capabilities for forecasting reports
 *
 * Integrates with ForecastingEngine service and provides UI-ready prediction data.
 */
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
exports.useForecasting = useForecasting;
exports.useForecastComparison = useForecastComparison;
exports.useRealTimeForecastUpdates = useRealTimeForecastUpdates;
exports.useForecastAccuracy = useForecastAccuracy;
exports.useForecastFormatters = useForecastFormatters;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@/lib/supabase/client");
var forecasting_engine_1 = require("@/lib/analytics/advanced/forecasting-engine");
/**
 * Main forecasting hook
 */
function useForecasting(initialConfig) {
  var _this = this;
  var _a, _b;
  var queryClient = (0, react_query_1.useQueryClient)();
  var supabase = yield (0, client_1.createClient)();
  var _c = (0, react_1.useState)(initialConfig),
    config = _c[0],
    setConfig = _c[1];
  var _d = (0, react_1.useState)({}),
    scenarios = _d[0],
    setScenarios = _d[1];
  var _e = (0, react_1.useState)(null),
    error = _e[0],
    setError = _e[1];
  // Initialize forecasting engine
  var forecastingEngine = (0, react_1.useMemo)(function () {
    return (0, forecasting_engine_1.createForecastingEngine)();
  }, []);
  // Query key for caching
  var queryKey = (0, react_1.useMemo)(
    function () {
      return [
        "forecasting",
        config.metric,
        config.timeHorizon,
        config.model,
        config.granularity,
        config.confidenceLevel,
      ];
    },
    [config],
  );
  // Main forecasting query
  var _f = (0, react_query_1.useQuery)({
      queryKey: queryKey,
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var forecastConfig,
            forecast,
            evaluation,
            sensitivityAnalysis,
            chartData,
            confidenceIntervals,
            err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 4, , 5]);
                forecastConfig = {
                  metric: config.metric,
                  timeHorizon: config.timeHorizon,
                  model: config.model === "auto" ? "seasonal" : config.model,
                  granularity: config.granularity,
                  confidenceLevel: config.confidenceLevel,
                  includeSeasonality: config.includeSeasonality,
                  includeTrends: config.includeTrends,
                  startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // Last year
                  endDate: new Date().toISOString(),
                };
                return [4 /*yield*/, forecastingEngine.generateForecast(forecastConfig)];
              case 1:
                forecast = _a.sent();
                if (!forecast || !forecast.predictions || forecast.predictions.length === 0) {
                  throw new Error("No forecast data generated");
                }
                return [
                  4 /*yield*/,
                  forecastingEngine.evaluateModel(forecast, forecastConfig),
                  // Generate sensitivity analysis
                ];
              case 2:
                evaluation = _a.sent();
                return [
                  4 /*yield*/,
                  forecastingEngine.performSensitivityAnalysis(forecastConfig, [
                    "growth_rate",
                    "seasonal_factor",
                    "trend_strength",
                  ]),
                  // Format data for visualization
                ];
              case 3:
                sensitivityAnalysis = _a.sent();
                chartData = forecasting_engine_1.forecastingUtils.formatForChart(
                  forecast,
                  config.granularity,
                );
                confidenceIntervals =
                  forecasting_engine_1.forecastingUtils.calculateConfidenceIntervals(
                    forecast.predictions,
                    config.confidenceLevel,
                  );
                return [
                  2 /*return*/,
                  {
                    forecast: forecast,
                    evaluation: evaluation,
                    sensitivityAnalysis: sensitivityAnalysis,
                    chartData: chartData,
                    confidenceIntervals: confidenceIntervals,
                    predictions: forecast.predictions,
                    accuracy: {
                      mape: evaluation.metrics.mape,
                      rmse: evaluation.metrics.rmse,
                      r2: evaluation.metrics.r2,
                    },
                  },
                ];
              case 4:
                err_1 = _a.sent();
                console.error("Forecasting error:", err_1);
                throw err_1;
              case 5:
                return [2 /*return*/];
            }
          });
        });
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 60 * 60 * 1000, // 1 hour
      retry: 2,
      refetchOnWindowFocus: false,
      enabled: !!config.metric && config.timeHorizon > 0,
    }),
    forecastData = _f.data,
    isLoading = _f.isLoading,
    refreshData = _f.refetch;
  // Auto-refresh effect
  (0, react_1.useEffect)(
    function () {
      if (!config.autoRefresh || !config.refreshInterval) return;
      var interval = setInterval(function () {
        refreshData();
      }, config.refreshInterval * 1000);
      return function () {
        return clearInterval(interval);
      };
    },
    [config.autoRefresh, config.refreshInterval, refreshData],
  );
  // Generate forecast mutation
  var generateForecastMutation = (0, react_query_1.useMutation)({
    mutationFn: function (newConfig) {
      return __awaiter(_this, void 0, void 0, function () {
        var forecast, evaluation;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, forecastingEngine.generateForecast(newConfig)];
            case 1:
              forecast = _a.sent();
              return [4 /*yield*/, forecastingEngine.evaluateModel(forecast, newConfig)];
            case 2:
              evaluation = _a.sent();
              return [2 /*return*/, { forecast: forecast, evaluation: evaluation }];
          }
        });
      });
    },
    onSuccess: function (data) {
      queryClient.setQueryData(queryKey, data);
      setError(null);
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Forecast generation failed");
    },
  });
  // Run scenario mutation
  var runScenarioMutation = (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var scenarioResult;
        var name = _b.name,
          scenarioConfig = _b.scenarioConfig;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              if (
                !(forecastData === null || forecastData === void 0 ? void 0 : forecastData.forecast)
              ) {
                throw new Error("Base forecast required for scenario analysis");
              }
              return [
                4 /*yield*/,
                forecastingEngine.runScenarioAnalysis(forecastData.forecast, scenarioConfig),
              ];
            case 1:
              scenarioResult = _c.sent();
              return [2 /*return*/, { name: name, result: scenarioResult }];
          }
        });
      });
    },
    onSuccess: function (_a) {
      var name = _a.name,
        result = _a.result;
      setScenarios(function (prev) {
        var _a;
        return __assign(__assign({}, prev), ((_a = {}), (_a[name] = result), _a));
      });
      setError(null);
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Scenario analysis failed");
    },
  });
  // Export forecast mutation
  var exportForecastMutation = (0, react_query_1.useMutation)({
    mutationFn: function (format) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, blob, url, a;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!forecastData) throw new Error("No forecast data to export");
              return [
                4 /*yield*/,
                fetch("/api/analytics/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "forecasting",
                    format: format,
                    data: {
                      forecast: forecastData.forecast,
                      evaluation: forecastData.evaluation,
                      scenarios: scenarios,
                      config: config,
                    },
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Export failed");
              return [4 /*yield*/, response.blob()];
            case 2:
              blob = _a.sent();
              url = window.URL.createObjectURL(blob);
              a = document.createElement("a");
              a.href = url;
              a.download = "forecast-"
                .concat(config.metric, "-")
                .concat(new Date().toISOString().split("T")[0], ".")
                .concat(format);
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
              return [2 /*return*/];
          }
        });
      });
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    },
  });
  // Actions
  var generateForecast = (0, react_1.useCallback)(
    function (newConfig) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, generateForecastMutation.mutateAsync(newConfig)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [generateForecastMutation],
  );
  var runScenario = (0, react_1.useCallback)(
    function (name, scenarioConfig) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                runScenarioMutation.mutateAsync({ name: name, scenarioConfig: scenarioConfig }),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [runScenarioMutation],
  );
  var updateModel = (0, react_1.useCallback)(
    function (modelType) {
      return __awaiter(_this, void 0, void 0, function () {
        var newConfig;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              newConfig = __assign(__assign({}, config), { model: modelType });
              setConfig(newConfig);
              return [4 /*yield*/, refreshData()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [config, refreshData],
  );
  var exportForecast = (0, react_1.useCallback)(
    function (format) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, exportForecastMutation.mutateAsync(format)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [exportForecastMutation],
  );
  var updateConfig = (0, react_1.useCallback)(function (newConfig) {
    setConfig(function (prev) {
      return __assign(__assign({}, prev), newConfig);
    });
    setError(null);
  }, []);
  // Return hook interface
  return {
    // State
    forecast:
      (forecastData === null || forecastData === void 0 ? void 0 : forecastData.forecast) || null,
    scenarios: scenarios,
    evaluation:
      (forecastData === null || forecastData === void 0 ? void 0 : forecastData.evaluation) || null,
    predictions:
      (forecastData === null || forecastData === void 0 ? void 0 : forecastData.predictions) || [],
    chartData:
      (forecastData === null || forecastData === void 0 ? void 0 : forecastData.chartData) || [],
    confidence: (forecastData === null || forecastData === void 0
      ? void 0
      : forecastData.confidenceIntervals) || { upper: [], lower: [], mean: [] },
    accuracy: (forecastData === null || forecastData === void 0
      ? void 0
      : forecastData.accuracy) || { mape: 0, rmse: 0, r2: 0 },
    isLoading: isLoading || generateForecastMutation.isPending || runScenarioMutation.isPending,
    error:
      error ||
      ((_a = generateForecastMutation.error) === null || _a === void 0 ? void 0 : _a.message) ||
      ((_b = runScenarioMutation.error) === null || _b === void 0 ? void 0 : _b.message) ||
      null,
    lastUpdated: forecastData ? new Date() : null,
    // Actions
    generateForecast: generateForecast,
    runScenario: runScenario,
    updateModel: updateModel,
    refreshData: refreshData,
    exportForecast: exportForecast,
    updateConfig: updateConfig,
  };
}
/**
 * Hook for forecast comparison analysis
 */
function useForecastComparison(forecasts) {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useQuery)({
    queryKey: [
      "forecast-comparison",
      forecasts.map(function (f) {
        return f.config.metric;
      }),
    ],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/analytics/advanced?type=forecasting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "compare",
                    forecasts: forecasts,
                    includeCorrelations: true,
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Forecast comparison failed");
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: forecasts.length > 1,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
/**
 * Hook for real-time forecast updates
 */
function useRealTimeForecastUpdates(metric, enabled) {
  if (enabled === void 0) {
    enabled = true;
  }
  var _a = (0, react_1.useState)([]),
    updates = _a[0],
    setUpdates = _a[1];
  var supabase = yield (0, client_1.createClient)();
  (0, react_1.useEffect)(
    function () {
      if (!enabled || !metric) return;
      // Subscribe to real-time data changes that might affect forecasts
      var subscription = supabase
        .channel("forecast-updates-".concat(metric))
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: metric === "revenue" ? "subscription_revenue" : "subscriptions",
          },
          function (payload) {
            // Add update to queue for forecast recalculation
            setUpdates(function (prev) {
              return __spreadArray(
                __spreadArray([], prev, true),
                [
                  {
                    timestamp: new Date(),
                    type: payload.eventType,
                    data: payload.new || payload.old,
                    table: payload.table,
                  },
                ],
                false,
              );
            });
          },
        )
        .subscribe();
      return function () {
        subscription.unsubscribe();
      };
    },
    [metric, enabled, supabase],
  );
  return updates;
}
/**
 * Hook for forecast accuracy tracking
 */
function useForecastAccuracy(metric, timeWindow) {
  var _this = this;
  if (timeWindow === void 0) {
    timeWindow = 30;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["forecast-accuracy", metric, timeWindow],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/analytics/accuracy", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    metric: metric,
                    timeWindow: timeWindow,
                    includeBreakdown: true,
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Failed to fetch accuracy data");
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!metric,
  });
}
/**
 * Utility hook for forecast data formatting
 */
function useForecastFormatters() {
  return (0, react_1.useMemo)(function () {
    return {
      formatPrediction: function (value, metric) {
        if (metric === "revenue") {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(value);
        } else if (metric === "churn") {
          return "".concat(Math.round(value * 100) / 100, "%");
        } else {
          return Math.round(value).toLocaleString();
        }
      },
      formatAccuracy: function (value) {
        return "".concat(Math.round(value * 100) / 100, "%");
      },
      formatConfidenceInterval: function (lower, upper, metric) {
        var formatValue = function (v) {
          if (metric === "revenue") {
            return new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 0,
            }).format(v);
          } else if (metric === "churn") {
            return "".concat(Math.round(v * 100) / 100, "%");
          } else {
            return Math.round(v).toLocaleString();
          }
        };
        return "".concat(formatValue(lower), " - ").concat(formatValue(upper));
      },
      getAccuracyColor: function (accuracy) {
        if (accuracy >= 90) return "text-green-600";
        if (accuracy >= 75) return "text-yellow-600";
        return "text-red-600";
      },
      getAccuracyBadgeVariant: function (accuracy) {
        if (accuracy >= 90) return "default";
        if (accuracy >= 75) return "secondary";
        return "destructive";
      },
      formatTimeHorizon: function (days) {
        if (days < 7) return "".concat(days, " day").concat(days > 1 ? "s" : "");
        if (days < 30)
          return ""
            .concat(Math.round(days / 7), " week")
            .concat(Math.round(days / 7) > 1 ? "s" : "");
        if (days < 365)
          return ""
            .concat(Math.round(days / 30), " month")
            .concat(Math.round(days / 30) > 1 ? "s" : "");
        return ""
          .concat(Math.round(days / 365), " year")
          .concat(Math.round(days / 365) > 1 ? "s" : "");
      },
    };
  }, []);
}
