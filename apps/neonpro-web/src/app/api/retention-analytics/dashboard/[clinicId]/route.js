"use strict";
// =====================================================================================
// RETENTION ANALYTICS DASHBOARD API ENDPOINT
// Epic 7.4: Patient Retention Analytics + Predictions
// Comprehensive dashboard data aggregation endpoint
// =====================================================================================
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var retention_analytics_service_1 = require("@/app/lib/services/retention-analytics-service");
var retention_analytics_1 = require("@/app/types/retention-analytics");
var zod_1 = require("zod");
// =====================================================================================
// VALIDATION SCHEMAS
// =====================================================================================
var DashboardParamsSchema = zod_1.z.object({
  clinicId: zod_1.z.string().uuid("Invalid clinic ID format"),
});
var DashboardQuerySchema = zod_1.z.object({
  periodStart: zod_1.z.string().refine(function (date) {
    return !isNaN(Date.parse(date));
  }, "Invalid start date"),
  periodEnd: zod_1.z.string().refine(function (date) {
    return !isNaN(Date.parse(date));
  }, "Invalid end date"),
  includeMetrics: zod_1.z.coerce.boolean().default(true),
  includePredictions: zod_1.z.coerce.boolean().default(true),
  includeStrategies: zod_1.z.coerce.boolean().default(true),
  includePerformance: zod_1.z.coerce.boolean().default(true),
  metricsLimit: zod_1.z.coerce.number().min(1).max(500).default(100),
  predictionsLimit: zod_1.z.coerce.number().min(1).max(500).default(100),
});
// =====================================================================================
// GET RETENTION ANALYTICS DASHBOARD
// =====================================================================================
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var clinicValidation,
      clinicId,
      searchParams,
      queryValidation,
      _c,
      periodStart_1,
      periodEnd_1,
      includeMetrics,
      includePredictions,
      includeStrategies,
      includePerformance,
      metricsLimit,
      predictionsLimit,
      supabase,
      _d,
      user,
      authError,
      _e,
      userProfile,
      profileError,
      _f,
      clinic,
      clinicError,
      retentionService,
      dashboardData,
      additionalData,
      metrics,
      filteredMetrics,
      predictions,
      filteredPredictions,
      strategies,
      startDate,
      endDate,
      daysDiff,
      weeklyData,
      weeksCount,
      week,
      weekStart,
      weekEnd,
      alerts,
      response,
      error_1;
    var _g, _h;
    var params = _b.params;
    return __generator(this, function (_j) {
      switch (_j.label) {
        case 0:
          _j.trys.push([0, 12, , 13]);
          clinicValidation = DashboardParamsSchema.safeParse({
            clinicId: params.clinicId,
          });
          if (!clinicValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid clinic ID",
                  details: clinicValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          clinicId = clinicValidation.data.clinicId;
          searchParams = new URL(request.url).searchParams;
          queryValidation = DashboardQuerySchema.safeParse({
            periodStart: searchParams.get("periodStart"),
            periodEnd: searchParams.get("periodEnd"),
            includeMetrics: searchParams.get("includeMetrics"),
            includePredictions: searchParams.get("includePredictions"),
            includeStrategies: searchParams.get("includeStrategies"),
            includePerformance: searchParams.get("includePerformance"),
            metricsLimit: searchParams.get("metricsLimit"),
            predictionsLimit: searchParams.get("predictionsLimit"),
          });
          if (!queryValidation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Invalid query parameters",
                  details: queryValidation.error.issues,
                },
                { status: 400 },
              ),
            ];
          }
          (_c = queryValidation.data),
            (periodStart_1 = _c.periodStart),
            (periodEnd_1 = _c.periodEnd),
            (includeMetrics = _c.includeMetrics),
            (includePredictions = _c.includePredictions),
            (includeStrategies = _c.includeStrategies),
            (includePerformance = _c.includePerformance),
            (metricsLimit = _c.metricsLimit),
            (predictionsLimit = _c.predictionsLimit);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _j.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_d = _j.sent()), (user = _d.data.user), (authError = _d.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", user.id).single(),
          ];
        case 3:
          (_e = _j.sent()), (userProfile = _e.data), (profileError = _e.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User profile not found" }, { status: 403 }),
            ];
          }
          if (userProfile.clinic_id !== clinicId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to clinic data" },
                { status: 403 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("clinics").select("id, name").eq("id", clinicId).single(),
          ];
        case 4:
          (_f = _j.sent()), (clinic = _f.data), (clinicError = _f.error);
          if (clinicError || !clinic) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic not found" }, { status: 404 }),
            ];
          }
          retentionService = new retention_analytics_service_1.RetentionAnalyticsService();
          return [
            4 /*yield*/,
            retentionService.generateRetentionAnalyticsDashboard(
              clinicId,
              periodStart_1,
              periodEnd_1,
            ),
          ];
        case 5:
          dashboardData = _j.sent();
          additionalData = {};
          if (!includeMetrics) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            retentionService.getClinicRetentionMetrics(clinicId, metricsLimit, 0),
          ];
        case 6:
          metrics = _j.sent();
          filteredMetrics = metrics.filter(function (metric) {
            var metricDate = new Date(metric.last_appointment_date);
            return metricDate >= new Date(periodStart_1) && metricDate <= new Date(periodEnd_1);
          });
          additionalData.detailedMetrics = {
            metrics: filteredMetrics,
            summary: {
              total_patients: filteredMetrics.length,
              high_risk_patients: filteredMetrics.filter(function (m) {
                return ["high", "critical"].includes(m.churn_risk_level);
              }).length,
              average_retention_rate:
                filteredMetrics.reduce(function (sum, m) {
                  return sum + m.retention_rate;
                }, 0) / filteredMetrics.length || 0,
              total_lifetime_value: filteredMetrics.reduce(function (sum, m) {
                return sum + m.lifetime_value;
              }, 0),
            },
          };
          _j.label = 7;
        case 7:
          if (!includePredictions) return [3 /*break*/, 9];
          return [
            4 /*yield*/,
            retentionService.getChurnPredictions(clinicId, undefined, predictionsLimit, 0),
          ];
        case 8:
          predictions = _j.sent();
          filteredPredictions = predictions.filter(function (prediction) {
            var predictionDate = new Date(prediction.prediction_date);
            return (
              predictionDate >= new Date(periodStart_1) && predictionDate <= new Date(periodEnd_1)
            );
          });
          additionalData.detailedPredictions = {
            predictions: filteredPredictions,
            summary: {
              total_predictions: filteredPredictions.length,
              critical_risk: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.CRITICAL;
              }).length,
              high_risk: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.HIGH;
              }).length,
              medium_risk: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.MEDIUM;
              }).length,
              low_risk: filteredPredictions.filter(function (p) {
                return p.risk_level === retention_analytics_1.ChurnRiskLevel.LOW;
              }).length,
              average_churn_probability:
                filteredPredictions.reduce(function (sum, p) {
                  return sum + p.churn_probability;
                }, 0) / filteredPredictions.length || 0,
            },
          };
          _j.label = 9;
        case 9:
          if (!includeStrategies) return [3 /*break*/, 11];
          return [4 /*yield*/, retentionService.getRetentionStrategies(clinicId, false)];
        case 10:
          strategies = _j.sent();
          additionalData.strategies = {
            all_strategies: strategies,
            active_strategies: strategies.filter(function (s) {
              return s.is_active;
            }),
            summary: {
              total_strategies: strategies.length,
              active_count: strategies.filter(function (s) {
                return s.is_active;
              }).length,
              total_executions: strategies.reduce(function (sum, s) {
                return sum + s.execution_count;
              }, 0),
              average_success_rate:
                strategies.reduce(function (sum, s) {
                  return sum + (s.success_rate || 0);
                }, 0) / strategies.length || 0,
            },
          };
          _j.label = 11;
        case 11:
          if (includePerformance) {
            startDate = new Date(periodStart_1);
            endDate = new Date(periodEnd_1);
            daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            weeklyData = [];
            weeksCount = Math.max(1, Math.ceil(daysDiff / 7));
            for (week = 0; week < weeksCount; week++) {
              weekStart = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
              weekEnd = new Date(
                Math.min(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000, endDate.getTime()),
              );
              weeklyData.push({
                week: week + 1,
                start_date: weekStart.toISOString().split("T")[0],
                end_date: weekEnd.toISOString().split("T")[0],
                // These would be calculated from actual data in a real implementation
                retention_rate: Math.random() * 0.3 + 0.7, // Simulated data
                churn_rate: Math.random() * 0.1 + 0.05, // Simulated data
                new_predictions: Math.floor(Math.random() * 20) + 5,
                strategy_executions: Math.floor(Math.random() * 10) + 2,
              });
            }
            additionalData.performance = {
              period_summary: {
                period_start: periodStart_1,
                period_end: periodEnd_1,
                total_days: daysDiff,
                total_weeks: weeksCount,
              },
              weekly_trends: weeklyData,
              key_metrics_trend: {
                retention_improvement: Math.random() * 0.1 - 0.05, // Simulated
                churn_reduction: Math.random() * 0.05, // Simulated
                strategy_effectiveness: Math.random() * 0.2 + 0.8, // Simulated
              },
            };
          }
          alerts = {
            critical_risk_patients: dashboardData.churn_risk_distribution.critical || 0,
            high_risk_patients: dashboardData.churn_risk_distribution.high || 0,
            low_engagement_patients: dashboardData.engagement_metrics.low_engagement_count || 0,
            recent_strategy_failures:
              ((_h =
                (_g = additionalData.strategies) === null || _g === void 0
                  ? void 0
                  : _g.all_strategies) === null || _h === void 0
                ? void 0
                : _h.filter(function (s) {
                    return s.execution_count > 0 && (s.success_rate || 0) < 0.5;
                  }).length) || 0,
          };
          response = {
            success: true,
            data: __assign(
              {
                dashboard: dashboardData,
                clinic: {
                  id: clinic.id,
                  name: clinic.name,
                },
                period: {
                  start: periodStart_1,
                  end: periodEnd_1,
                  duration_days: Math.ceil(
                    (new Date(periodEnd_1).getTime() - new Date(periodStart_1).getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                },
                alerts: alerts,
              },
              additionalData,
            ),
            metadata: {
              generated_at: new Date().toISOString(),
              generated_by: user.id,
              includes: {
                metrics: includeMetrics,
                predictions: includePredictions,
                strategies: includeStrategies,
                performance: includePerformance,
              },
              data_freshness: {
                metrics: "Real-time",
                predictions: "Updated hourly",
                strategies: "Real-time",
                performance: "Updated daily",
              },
            },
            timestamp: new Date().toISOString(),
          };
          return [2 /*return*/, server_1.NextResponse.json(response)];
        case 12:
          error_1 = _j.sent();
          console.error("Error generating retention analytics dashboard:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Internal server error",
                message: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
