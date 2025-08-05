"use strict";
// =====================================================================================
// RETENTION ANALYTICS HOOKS
// Epic 7.4: Patient Retention Analytics + Predictions
// React hooks for retention analytics, churn prediction, and retention strategies
// =====================================================================================
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
exports.usePatientRetentionMetrics = usePatientRetentionMetrics;
exports.useClinicRetentionMetrics = useClinicRetentionMetrics;
exports.useCalculatePatientRetentionMetrics = useCalculatePatientRetentionMetrics;
exports.useChurnPredictions = useChurnPredictions;
exports.useGenerateChurnPrediction = useGenerateChurnPrediction;
exports.useRetentionStrategies = useRetentionStrategies;
exports.useCreateRetentionStrategy = useCreateRetentionStrategy;
exports.useExecuteRetentionStrategy = useExecuteRetentionStrategy;
exports.useRetentionAnalyticsDashboard = useRetentionAnalyticsDashboard;
exports.useChurnRiskMonitoring = useChurnRiskMonitoring;
exports.useRetentionStrategyAnalytics = useRetentionStrategyAnalytics;
exports.usePatientRiskInsights = usePatientRiskInsights;
exports.useBulkChurnPrediction = useBulkChurnPrediction;
exports.useBulkRetentionMetrics = useBulkRetentionMetrics;
exports.useRetentionAnalyticsFormatters = useRetentionAnalyticsFormatters;
exports.useRetentionAnalyticsExport = useRetentionAnalyticsExport;
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var retention_analytics_1 = require("@/app/types/retention-analytics");
// =====================================================================================
// SERVICE INSTANCE
// =====================================================================================
var retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
// =====================================================================================
// PATIENT RETENTION METRICS HOOKS
// =====================================================================================
/**
 * Hook to get patient retention metrics
 */
function usePatientRetentionMetrics(patientId, clinicId, options) {
  return (0, react_query_1.useQuery)({
    queryKey: ["patient-retention-metrics", patientId, clinicId],
    queryFn: function () {
      return retentionService.getPatientRetentionMetrics(patientId, clinicId);
    },
    enabled:
      (options === null || options === void 0 ? void 0 : options.enabled) !== false &&
      !!patientId &&
      !!clinicId,
    refetchInterval:
      (options === null || options === void 0 ? void 0 : options.refetchInterval) || 5 * 60 * 1000, // 5 minutes
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
/**
 * Hook to get clinic-wide retention metrics
 */
function useClinicRetentionMetrics(clinicId, options) {
  var _a = options || {},
    _b = _a.limit,
    limit = _b === void 0 ? 100 : _b,
    _c = _a.offset,
    offset = _c === void 0 ? 0 : _c,
    _d = _a.enabled,
    enabled = _d === void 0 ? true : _d;
  return (0, react_query_1.useQuery)({
    queryKey: ["clinic-retention-metrics", clinicId, limit, offset],
    queryFn: function () {
      return retentionService.getClinicRetentionMetrics(clinicId, limit, offset);
    },
    enabled: enabled && !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
/**
 * Hook to calculate patient retention metrics
 */
function useCalculatePatientRetentionMetrics() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var patientId = _a.patientId,
        clinicId = _a.clinicId;
      return retentionService.calculatePatientRetentionMetrics(patientId, clinicId);
    },
    onSuccess: function (data) {
      // Invalidate and update related queries
      queryClient.invalidateQueries({
        queryKey: ["patient-retention-metrics", data.patient_id, data.clinic_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["clinic-retention-metrics", data.clinic_id],
      });
    },
  });
}
// =====================================================================================
// CHURN PREDICTION HOOKS
// =====================================================================================
/**
 * Hook to get churn predictions for clinic
 */
function useChurnPredictions(clinicId, options) {
  var _a = options || {},
    riskLevel = _a.riskLevel,
    _b = _a.limit,
    limit = _b === void 0 ? 100 : _b,
    _c = _a.offset,
    offset = _c === void 0 ? 0 : _c,
    _d = _a.enabled,
    enabled = _d === void 0 ? true : _d;
  return (0, react_query_1.useQuery)({
    queryKey: ["churn-predictions", clinicId, riskLevel, limit, offset],
    queryFn: function () {
      return retentionService.getChurnPredictions(clinicId, riskLevel, limit, offset);
    },
    enabled: enabled && !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
/**
 * Hook to generate churn prediction for a patient
 */
function useGenerateChurnPrediction() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var patientId = _a.patientId,
        clinicId = _a.clinicId,
        _b = _a.modelType,
        modelType = _b === void 0 ? retention_analytics_1.ChurnModelType.ENSEMBLE : _b;
      return retentionService.generateChurnPrediction(patientId, clinicId, modelType);
    },
    onSuccess: function (data) {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ["churn-predictions", data.clinic_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["retention-dashboard", data.clinic_id],
      });
    },
  });
}
// =====================================================================================
// RETENTION STRATEGIES HOOKS
// =====================================================================================
/**
 * Hook to get retention strategies for clinic
 */
function useRetentionStrategies(clinicId, options) {
  var _a = options || {},
    _b = _a.activeOnly,
    activeOnly = _b === void 0 ? false : _b,
    _c = _a.enabled,
    enabled = _c === void 0 ? true : _c;
  return (0, react_query_1.useQuery)({
    queryKey: ["retention-strategies", clinicId, activeOnly],
    queryFn: function () {
      return retentionService.getRetentionStrategies(clinicId, activeOnly);
    },
    enabled: enabled && !!clinicId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
/**
 * Hook to create retention strategy
 */
function useCreateRetentionStrategy() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (strategy) {
      return retentionService.createRetentionStrategy(strategy);
    },
    onSuccess: function (data) {
      // Invalidate strategies list
      queryClient.invalidateQueries({
        queryKey: ["retention-strategies", data.clinic_id],
      });
    },
  });
}
/**
 * Hook to execute retention strategy
 */
function useExecuteRetentionStrategy() {
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      var strategyId = _a.strategyId,
        patientIds = _a.patientIds;
      return retentionService.executeRetentionStrategy(strategyId, patientIds);
    },
    onSuccess: function (data, variables) {
      // Invalidate performance data
      queryClient.invalidateQueries({
        queryKey: ["retention-performance"],
      });
      queryClient.invalidateQueries({
        queryKey: ["retention-strategies"],
      });
    },
  });
}
// =====================================================================================
// RETENTION ANALYTICS DASHBOARD HOOKS
// =====================================================================================
/**
 * Hook to get comprehensive retention analytics dashboard
 */
function useRetentionAnalyticsDashboard(clinicId, periodStart, periodEnd, options) {
  return (0, react_query_1.useQuery)({
    queryKey: ["retention-dashboard", clinicId, periodStart, periodEnd],
    queryFn: function () {
      return retentionService.generateRetentionAnalyticsDashboard(clinicId, periodStart, periodEnd);
    },
    enabled:
      (options === null || options === void 0 ? void 0 : options.enabled) !== false &&
      !!clinicId &&
      !!periodStart &&
      !!periodEnd,
    refetchInterval:
      (options === null || options === void 0 ? void 0 : options.refetchInterval) || 15 * 60 * 1000, // 15 minutes
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
// =====================================================================================
// ADVANCED ANALYTICS HOOKS
// =====================================================================================
/**
 * Hook for real-time churn risk monitoring
 */
function useChurnRiskMonitoring(clinicId, options) {
  var _a = (0, react_1.useState)({
      criticalRisk: 0,
      highRisk: 0,
      mediumRisk: 0,
      newPredictions: 0,
    }),
    alerts = _a[0],
    setAlerts = _a[1];
  var predictions = useChurnPredictions(clinicId, {
    enabled: options === null || options === void 0 ? void 0 : options.enabled,
  }).data;
  // Calculate real-time alerts
  react_2.default.useEffect(
    function () {
      if (predictions) {
        var critical = predictions.filter(function (p) {
          return p.risk_level === retention_analytics_1.ChurnRiskLevel.CRITICAL;
        }).length;
        var high = predictions.filter(function (p) {
          return p.risk_level === retention_analytics_1.ChurnRiskLevel.HIGH;
        }).length;
        var medium = predictions.filter(function (p) {
          return p.risk_level === retention_analytics_1.ChurnRiskLevel.MEDIUM;
        }).length;
        // Count predictions from last 24 hours
        var yesterday_1 = new Date(Date.now() - 24 * 60 * 60 * 1000);
        var newPredictions = predictions.filter(function (p) {
          return new Date(p.prediction_date) > yesterday_1;
        }).length;
        setAlerts({
          criticalRisk: critical,
          highRisk: high,
          mediumRisk: medium,
          newPredictions: newPredictions,
        });
      }
    },
    [predictions],
  );
  return {
    alerts: alerts,
    predictions: predictions,
    isLoading: !predictions,
  };
}
/**
 * Hook for retention strategy performance analytics
 */
function useRetentionStrategyAnalytics(clinicId, strategyId, options) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["retention-strategy-analytics", clinicId, strategyId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var strategies, strategy;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, retentionService.getRetentionStrategies(clinicId)];
            case 1:
              strategies = _a.sent();
              if (strategyId) {
                strategy = strategies.find(function (s) {
                  return s.id === strategyId;
                });
                return [2 /*return*/, strategy ? [strategy] : []];
              }
              return [2 /*return*/, strategies];
          }
        });
      });
    },
    enabled:
      (options === null || options === void 0 ? void 0 : options.enabled) !== false && !!clinicId,
    staleTime: 10 * 60 * 1000,
  });
}
/**
 * Hook for patient risk scoring and insights
 */
function usePatientRiskInsights(patientId, clinicId, options) {
  var _this = this;
  var metrics = usePatientRetentionMetrics(patientId, clinicId, {
    enabled: options === null || options === void 0 ? void 0 : options.enabled,
  }).data;
  var predictions = (0, react_query_1.useQuery)({
    queryKey: ["patient-churn-predictions", patientId, clinicId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var allPredictions;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, retentionService.getChurnPredictions(clinicId)];
            case 1:
              allPredictions = _a.sent();
              return [
                2 /*return*/,
                allPredictions.filter(function (p) {
                  return p.patient_id === patientId;
                }),
              ];
          }
        });
      });
    },
    enabled:
      (options === null || options === void 0 ? void 0 : options.enabled) !== false &&
      !!patientId &&
      !!clinicId,
  }).data;
  // Generate insights based on metrics and predictions
  var insights = react_2.default.useMemo(
    function () {
      if (!metrics) return null;
      var riskFactors = [];
      var recommendations = [];
      // Analyze risk factors
      if (metrics.days_since_last_appointment > 60) {
        riskFactors.push({
          factor: "Long time since last appointment",
          severity: "high",
          value: "".concat(metrics.days_since_last_appointment, " days"),
        });
        recommendations.push("Schedule follow-up call to re-engage patient");
      }
      if (metrics.response_rate < 0.5) {
        riskFactors.push({
          factor: "Low follow-up response rate",
          severity: "medium",
          value: "".concat(Math.round(metrics.response_rate * 100), "%"),
        });
        recommendations.push("Review communication strategy and channels");
      }
      if (metrics.satisfaction_score < 7) {
        riskFactors.push({
          factor: "Low satisfaction score",
          severity: "high",
          value: "".concat(metrics.satisfaction_score, "/10"),
        });
        recommendations.push("Address satisfaction concerns immediately");
      }
      if (metrics.cancellation_rate > 0.3) {
        riskFactors.push({
          factor: "High cancellation rate",
          severity: "medium",
          value: "".concat(Math.round(metrics.cancellation_rate * 100), "%"),
        });
        recommendations.push("Investigate scheduling or service issues");
      }
      return {
        riskLevel: metrics.churn_risk_level,
        riskScore: metrics.churn_risk_score,
        riskFactors: riskFactors,
        recommendations: recommendations,
        daysToChurn: metrics.days_to_predicted_churn,
        lifetimeValue: metrics.lifetime_value,
        trend:
          predictions && predictions.length > 1
            ? predictions[0].churn_probability - predictions[1].churn_probability
            : 0,
      };
    },
    [metrics, predictions],
  );
  return {
    metrics: metrics,
    predictions: predictions,
    insights: insights,
    isLoading: !metrics,
  };
}
// =====================================================================================
// BULK OPERATIONS HOOKS
// =====================================================================================
/**
 * Hook for bulk churn prediction generation
 */
function useBulkChurnPrediction() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var predictions, batchSize, i, batch, batchPromises, batchResults, successful;
        var clinicId = _b.clinicId,
          patientIds = _b.patientIds,
          _c = _b.modelType,
          modelType = _c === void 0 ? retention_analytics_1.ChurnModelType.ENSEMBLE : _c;
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              predictions = [];
              batchSize = 10;
              i = 0;
              _d.label = 1;
            case 1:
              if (!(i < patientIds.length)) return [3 /*break*/, 4];
              batch = patientIds.slice(i, i + batchSize);
              batchPromises = batch.map(function (patientId) {
                return retentionService.generateChurnPrediction(patientId, clinicId, modelType);
              });
              return [4 /*yield*/, Promise.allSettled(batchPromises)];
            case 2:
              batchResults = _d.sent();
              successful = batchResults
                .filter(function (result) {
                  return result.status === "fulfilled";
                })
                .map(function (result) {
                  return result.value;
                });
              predictions.push.apply(predictions, successful);
              _d.label = 3;
            case 3:
              i += batchSize;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/, predictions];
          }
        });
      });
    },
    onSuccess: function (data) {
      if (data.length > 0) {
        var clinicId = data[0].clinic_id;
        queryClient.invalidateQueries({
          queryKey: ["churn-predictions", clinicId],
        });
        queryClient.invalidateQueries({
          queryKey: ["retention-dashboard", clinicId],
        });
      }
    },
  });
}
/**
 * Hook for bulk retention metrics calculation
 */
function useBulkRetentionMetrics() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var metrics, batchSize, i, batch, batchPromises, batchResults, successful;
        var clinicId = _b.clinicId,
          patientIds = _b.patientIds;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              metrics = [];
              batchSize = 5;
              i = 0;
              _c.label = 1;
            case 1:
              if (!(i < patientIds.length)) return [3 /*break*/, 4];
              batch = patientIds.slice(i, i + batchSize);
              batchPromises = batch.map(function (patientId) {
                return retentionService.calculatePatientRetentionMetrics(patientId, clinicId);
              });
              return [4 /*yield*/, Promise.allSettled(batchPromises)];
            case 2:
              batchResults = _c.sent();
              successful = batchResults
                .filter(function (result) {
                  return result.status === "fulfilled";
                })
                .map(function (result) {
                  return result.value;
                });
              metrics.push.apply(metrics, successful);
              _c.label = 3;
            case 3:
              i += batchSize;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/, metrics];
          }
        });
      });
    },
    onSuccess: function (data) {
      if (data.length > 0) {
        var clinicId = data[0].clinic_id;
        queryClient.invalidateQueries({
          queryKey: ["clinic-retention-metrics", clinicId],
        });
      }
    },
  });
}
// =====================================================================================
// UTILITY HOOKS
// =====================================================================================
/**
 * Hook for formatting retention analytics data
 */
function useRetentionAnalyticsFormatters() {
  var formatRiskLevel = function (level) {
    switch (level) {
      case retention_analytics_1.ChurnRiskLevel.CRITICAL:
        return { color: "red", label: "Critical Risk" };
      case retention_analytics_1.ChurnRiskLevel.HIGH:
        return { color: "orange", label: "High Risk" };
      case retention_analytics_1.ChurnRiskLevel.MEDIUM:
        return { color: "yellow", label: "Medium Risk" };
      case retention_analytics_1.ChurnRiskLevel.LOW:
        return { color: "green", label: "Low Risk" };
      default:
        return { color: "gray", label: "Unknown" };
    }
  };
  var formatChurnProbability = function (probability) {
    return "".concat(Math.round(probability * 100), "%");
  };
  var formatCurrency = function (amount) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };
  var formatDaysToChurn = function (days) {
    if (!days) return "N/A";
    if (days < 30) return "".concat(days, " dias");
    if (days < 365) return "".concat(Math.round(days / 30), " meses");
    return "".concat(Math.round(days / 365), " anos");
  };
  var formatRetentionRate = function (rate) {
    return "".concat(Math.round(rate * 100), "%");
  };
  return {
    formatRiskLevel: formatRiskLevel,
    formatChurnProbability: formatChurnProbability,
    formatCurrency: formatCurrency,
    formatDaysToChurn: formatDaysToChurn,
    formatRetentionRate: formatRetentionRate,
  };
}
/**
 * Hook for retention analytics export functionality
 */
function useRetentionAnalyticsExport() {
  var exportToCsv = function (data, filename) {
    // Implementation would generate CSV from data
    console.log("Exporting to CSV:", filename, data);
  };
  var exportToPdf = function (data, filename) {
    // Implementation would generate PDF report
    console.log("Exporting to PDF:", filename, data);
  };
  var exportToExcel = function (data, filename) {
    // Implementation would generate Excel file
    console.log("Exporting to Excel:", filename, data);
  };
  return {
    exportToCsv: exportToCsv,
    exportToPdf: exportToPdf,
    exportToExcel: exportToExcel,
  };
}
// Re-export React for useMemo and useEffect
var react_2 = require("react");
exports.default = {
  usePatientRetentionMetrics: usePatientRetentionMetrics,
  useClinicRetentionMetrics: useClinicRetentionMetrics,
  useCalculatePatientRetentionMetrics: useCalculatePatientRetentionMetrics,
  useChurnPredictions: useChurnPredictions,
  useGenerateChurnPrediction: useGenerateChurnPrediction,
  useRetentionStrategies: useRetentionStrategies,
  useCreateRetentionStrategy: useCreateRetentionStrategy,
  useExecuteRetentionStrategy: useExecuteRetentionStrategy,
  useRetentionAnalyticsDashboard: useRetentionAnalyticsDashboard,
  useChurnRiskMonitoring: useChurnRiskMonitoring,
  useRetentionStrategyAnalytics: useRetentionStrategyAnalytics,
  usePatientRiskInsights: usePatientRiskInsights,
  useBulkChurnPrediction: useBulkChurnPrediction,
  useBulkRetentionMetrics: useBulkRetentionMetrics,
  useRetentionAnalyticsFormatters: useRetentionAnalyticsFormatters,
  useRetentionAnalyticsExport: useRetentionAnalyticsExport,
};
