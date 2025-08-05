"use strict";
/**
 * Advanced Cohort Analysis React Hook for NeonPro
 *
 * Custom hook providing comprehensive cohort analysis capabilities including:
 * - Cohort generation and definition
 * - Retention rate calculations with heatmap data
 * - Revenue cohort analysis and lifetime value tracking
 * - Statistical insights and trend analysis
 * - Real-time data updates with optimized caching
 *
 * Integrates with CohortAnalyzer service and provides UI-ready data formats.
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
exports.useCohortAnalysis = useCohortAnalysis;
exports.useCohortComparison = useCohortComparison;
exports.useRealTimeCohortMetrics = useRealTimeCohortMetrics;
exports.useCohortInsights = useCohortInsights;
exports.useCohortDataFormatters = useCohortDataFormatters;
var react_1 = require("react");
var react_query_1 = require("@tanstack/react-query");
var client_1 = require("@/lib/supabase/client");
var cohort_analyzer_1 = require("@/lib/analytics/advanced/cohort-analyzer");
/**
 * Main cohort analysis hook
 */
function useCohortAnalysis(initialConfig) {
  var _this = this;
  var _a;
  var queryClient = (0, react_query_1.useQueryClient)();
  var supabase = yield (0, client_1.createClient)();
  var _b = (0, react_1.useState)(initialConfig),
    config = _b[0],
    setConfig = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  // Initialize cohort analyzer
  var cohortAnalyzer = (0, react_1.useMemo)(function () {
    return (0, cohort_analyzer_1.createCohortAnalyzer)();
  }, []);
  // Query key for caching
  var queryKey = (0, react_1.useMemo)(
    function () {
      return [
        "cohort-analysis",
        config.cohortType,
        config.granularity,
        config.startDate,
        config.endDate,
        config.periods,
      ];
    },
    [config],
  );
  // Main data fetching query
  var _d = (0, react_query_1.useQuery)({
      queryKey: queryKey,
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var analysisConfig,
            cohorts,
            metrics,
            revenueCohorts,
            statistics,
            heatmapData,
            comparisonData,
            cohortSizes,
            err_1;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 5, , 6]);
                analysisConfig = {
                  cohortType: config.cohortType,
                  granularity: config.granularity,
                  periods: config.periods,
                  startDate: config.startDate,
                  endDate: config.endDate,
                  includeRevenue: true,
                  includeChurn: true,
                };
                return [4 /*yield*/, cohortAnalyzer.generateCohorts(analysisConfig)];
              case 1:
                cohorts = _a.sent();
                if (cohorts.length === 0) {
                  throw new Error("No cohorts found for the specified date range");
                }
                return [
                  4 /*yield*/,
                  cohortAnalyzer.calculateCohortRetention(cohorts, analysisConfig),
                  // Calculate revenue cohorts
                ];
              case 2:
                metrics = _a.sent();
                return [
                  4 /*yield*/,
                  cohortAnalyzer.calculateRevenueCohorts(cohorts, analysisConfig),
                  // Generate statistical analysis
                ];
              case 3:
                revenueCohorts = _a.sent();
                return [
                  4 /*yield*/,
                  cohortAnalyzer.analyzeCohortStatistics(metrics),
                  // Format data for visualization
                ];
              case 4:
                statistics = _a.sent();
                heatmapData = cohort_analyzer_1.cohortUtils.formatForHeatmap(metrics);
                comparisonData = cohort_analyzer_1.cohortUtils.generateComparisonData(metrics);
                cohortSizes = cohort_analyzer_1.cohortUtils.calculateCohortSizes(cohorts);
                return [
                  2 /*return*/,
                  {
                    cohorts: cohorts,
                    metrics: metrics,
                    revenueCohorts: revenueCohorts,
                    statistics: statistics,
                    heatmapData: heatmapData,
                    comparisonData: comparisonData,
                    cohortSizes: cohortSizes,
                    insights: statistics.predictiveInsights || [],
                  },
                ];
              case 5:
                err_1 = _a.sent();
                console.error("Cohort analysis error:", err_1);
                throw err_1;
              case 6:
                return [2 /*return*/];
            }
          });
        });
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      enabled: !!config.startDate && !!config.endDate,
    }),
    analysisData = _d.data,
    isLoading = _d.isLoading,
    refreshData = _d.refetch;
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
  // Generate analysis mutation
  var generateAnalysisMutation = (0, react_query_1.useMutation)({
    mutationFn: function (newConfig) {
      return __awaiter(_this, void 0, void 0, function () {
        var cohorts, metrics, statistics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, cohortAnalyzer.generateCohorts(newConfig)];
            case 1:
              cohorts = _a.sent();
              return [4 /*yield*/, cohortAnalyzer.calculateCohortRetention(cohorts, newConfig)];
            case 2:
              metrics = _a.sent();
              return [4 /*yield*/, cohortAnalyzer.analyzeCohortStatistics(metrics)];
            case 3:
              statistics = _a.sent();
              return [2 /*return*/, { cohorts: cohorts, metrics: metrics, statistics: statistics }];
          }
        });
      });
    },
    onSuccess: function (data) {
      queryClient.setQueryData(queryKey, data);
      setError(null);
    },
    onError: function (err) {
      setError(err instanceof Error ? err.message : "Analysis generation failed");
    },
  });
  // Export data mutation
  var exportDataMutation = (0, react_query_1.useMutation)({
    mutationFn: function (format) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, blob, url, a;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!analysisData) throw new Error("No data to export");
              return [
                4 /*yield*/,
                fetch("/api/analytics/export", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "cohort-analysis",
                    format: format,
                    data: {
                      cohorts: analysisData.cohorts,
                      metrics: analysisData.metrics,
                      statistics: analysisData.statistics,
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
              a.download = "cohort-analysis-"
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
  var generateAnalysis = (0, react_1.useCallback)(
    function (newConfig) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, generateAnalysisMutation.mutateAsync(newConfig)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [generateAnalysisMutation],
  );
  var exportData = (0, react_1.useCallback)(
    function (format) {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, exportDataMutation.mutateAsync(format)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [exportDataMutation],
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
    cohorts:
      (analysisData === null || analysisData === void 0 ? void 0 : analysisData.cohorts) || [],
    metrics:
      (analysisData === null || analysisData === void 0 ? void 0 : analysisData.metrics) || [],
    heatmapData:
      (analysisData === null || analysisData === void 0 ? void 0 : analysisData.heatmapData) || [],
    statistics:
      (analysisData === null || analysisData === void 0 ? void 0 : analysisData.statistics) || null,
    insights:
      (analysisData === null || analysisData === void 0 ? void 0 : analysisData.insights) || [],
    isLoading: isLoading || generateAnalysisMutation.isPending,
    error:
      error ||
      ((_a = generateAnalysisMutation.error) === null || _a === void 0 ? void 0 : _a.message) ||
      null,
    lastUpdated: analysisData ? new Date() : null,
    // Actions
    generateAnalysis: generateAnalysis,
    refreshData: refreshData,
    exportData: exportData,
    updateConfig: updateConfig,
  };
}
/**
 * Hook for cohort comparison analysis
 */
function useCohortComparison(cohortIds) {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useQuery)({
    queryKey: ["cohort-comparison", cohortIds],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/analytics/advanced?type=cohort-analysis", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "compare",
                    cohortIds: cohortIds,
                    includeStatistics: true,
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Cohort comparison failed");
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: cohortIds.length > 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
/**
 * Hook for real-time cohort metrics
 */
function useRealTimeCohortMetrics(cohortId, enabled) {
  if (enabled === void 0) {
    enabled = true;
  }
  var _a = (0, react_1.useState)([]),
    metrics = _a[0],
    setMetrics = _a[1];
  var supabase = yield (0, client_1.createClient)();
  (0, react_1.useEffect)(
    function () {
      if (!enabled || !cohortId) return;
      // Subscribe to real-time updates
      var subscription = supabase
        .channel("cohort-metrics-".concat(cohortId))
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscription_cohorts",
            filter: "cohort_month=eq.".concat(cohortId),
          },
          function (payload) {
            // Update metrics when data changes
            setMetrics(function (prev) {
              var updated = __spreadArray([], prev, true);
              var index = updated.findIndex(function (m) {
                return m.cohortId === cohortId;
              });
              if (index >= 0) {
                // Update existing metric
                updated[index] = __assign(__assign({}, updated[index]), payload.new);
              } else {
                // Add new metric
                updated.push(payload.new);
              }
              return updated;
            });
          },
        )
        .subscribe();
      return function () {
        subscription.unsubscribe();
      };
    },
    [cohortId, enabled, supabase],
  );
  return metrics;
}
/**
 * Hook for cohort performance insights
 */
function useCohortInsights(config) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["cohort-insights", config],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/analytics/insights", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    type: "cohort",
                    config: config,
                    analysisDepth: "comprehensive",
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Failed to generate insights");
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!config.startDate && !!config.endDate,
  });
}
/**
 * Utility hook for cohort data formatting
 */
function useCohortDataFormatters() {
  return (0, react_1.useMemo)(function () {
    return {
      formatRetentionRate: function (rate) {
        return "".concat(Math.round(rate * 100) / 100, "%");
      },
      formatRevenue: function (amount) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      },
      formatCohortName: function (date, granularity) {
        var d = new Date(date);
        if (granularity === "daily") {
          return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        } else if (granularity === "weekly") {
          return "Week of ".concat(
            d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          );
        } else {
          return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        }
      },
      formatPeriodLabel: function (period, granularity) {
        if (period === 0) return "Initial";
        var unit = granularity === "daily" ? "day" : granularity === "weekly" ? "week" : "month";
        return ""
          .concat(period, " ")
          .concat(unit)
          .concat(period > 1 ? "s" : "");
      },
      getRetentionColor: function (rate) {
        if (rate >= 80) return "text-green-600";
        if (rate >= 60) return "text-yellow-600";
        return "text-red-600";
      },
      getRetentionBadgeVariant: function (rate) {
        if (rate >= 80) return "default";
        if (rate >= 60) return "secondary";
        return "destructive";
      },
    };
  }, []);
}
