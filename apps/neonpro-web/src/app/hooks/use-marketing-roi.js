"use strict";
/**
 * Marketing ROI Analysis Hooks
 * React hooks for managing marketing ROI data and operations
 *
 * Features:
 * - Marketing campaign ROI tracking and management
 * - Treatment profitability analysis with optimization insights
 * - CAC & LTV analytics with predictive metrics
 * - Real-time ROI monitoring and alert management
 * - Optimization recommendations with implementation tracking
 * - Executive dashboard metrics and trend analysis
 * - Predictive ROI forecasting and scenario planning
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useMarketingCampaigns = useMarketingCampaigns;
exports.useMarketingCampaign = useMarketingCampaign;
exports.useCreateMarketingCampaign = useCreateMarketingCampaign;
exports.useUpdateCampaignMetrics = useUpdateCampaignMetrics;
exports.useTreatmentProfitabilityAnalysis = useTreatmentProfitabilityAnalysis;
exports.useCalculateTreatmentROI = useCalculateTreatmentROI;
exports.useCACLTVAnalysis = useCACLTVAnalysis;
exports.useCalculateCAC = useCalculateCAC;
exports.useCalculateLTV = useCalculateLTV;
exports.useROIAlerts = useROIAlerts;
exports.useCreateROIAlert = useCreateROIAlert;
exports.useUpdateROIAlert = useUpdateROIAlert;
exports.useOptimizationRecommendations = useOptimizationRecommendations;
exports.useGenerateOptimizationRecommendations = useGenerateOptimizationRecommendations;
exports.useUpdateRecommendationStatus = useUpdateRecommendationStatus;
exports.useROIDashboardMetrics = useROIDashboardMetrics;
exports.useROITrendData = useROITrendData;
exports.useROIComparisons = useROIComparisons;
exports.useGenerateROIForecast = useGenerateROIForecast;
exports.useROIForecasts = useROIForecasts;
exports.useMarketingROIInsights = useMarketingROIInsights;
exports.useROIMetricsSummary = useROIMetricsSummary;
exports.useBulkCampaignOperations = useBulkCampaignOperations;
exports.useRealTimeROIMonitoring = useRealTimeROIMonitoring;
exports.useROICalculationSettings = useROICalculationSettings;
var react_query_1 = require("@tanstack/react-query");
var sonner_1 = require("sonner");
// ===== MARKETING CAMPAIGN HOOKS =====
/**
 * Hook to get marketing campaigns with filtering and pagination
 */
function useMarketingCampaigns(clinicId, filters, page, limit) {
  var _this = this;
  if (page === void 0) {
    page = 1;
  }
  if (limit === void 0) {
    limit = 20;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["marketing-campaigns", clinicId, filters, page, limit],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                page: page.toString(),
                limit: limit.toString(),
              });
              if (filters === null || filters === void 0 ? void 0 : filters.channel)
                params.append("channel", filters.channel);
              if (filters === null || filters === void 0 ? void 0 : filters.campaign_type)
                params.append("campaign_type", filters.campaign_type);
              if (filters === null || filters === void 0 ? void 0 : filters.status)
                params.append("status", filters.status);
              if (filters === null || filters === void 0 ? void 0 : filters.date_range) {
                params.append("start_date", filters.date_range.start.toISOString());
                params.append("end_date", filters.date_range.end.toISOString());
              }
              if (filters === null || filters === void 0 ? void 0 : filters.min_roi)
                params.append("min_roi", filters.min_roi.toString());
              if (filters === null || filters === void 0 ? void 0 : filters.max_budget)
                params.append("max_budget", filters.max_budget.toString());
              return [4 /*yield*/, fetch("/api/marketing-roi/campaigns?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch marketing campaigns");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
  });
}
/**
 * Hook to get a specific marketing campaign
 */
function useMarketingCampaign(campaignId) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["marketing-campaign", campaignId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/marketing-roi/campaigns/".concat(campaignId))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch marketing campaign");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!campaignId,
  });
}
/**
 * Hook to create a new marketing campaign
 */
function useCreateMarketingCampaign() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          campaignData = _b.campaignData;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/campaigns", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(__assign({ clinic_id: clinicId }, campaignData)),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to create marketing campaign");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["marketing-campaigns", variables.clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-dashboard-metrics", variables.clinicId],
      });
      sonner_1.toast.success("Campanha de marketing criada com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao criar campanha: ".concat(error.message));
    },
  });
}
/**
 * Hook to update campaign metrics and recalculate ROI
 */
function useUpdateCampaignMetrics() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var campaignId = _b.campaignId,
          metrics = _b.metrics;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/campaigns/".concat(campaignId, "/metrics"), {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(metrics),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to update campaign metrics");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["marketing-campaign", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["marketing-campaigns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-dashboard-metrics"],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-alerts"],
      });
      sonner_1.toast.success("Métricas da campanha atualizadas com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao atualizar m\u00E9tricas: ".concat(error.message));
    },
  });
}
// ===== TREATMENT PROFITABILITY HOOKS =====
/**
 * Hook to get treatment profitability analysis
 */
function useTreatmentProfitabilityAnalysis(clinicId, filters) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["treatment-profitability", clinicId, filters],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
              });
              if (
                (_a = filters === null || filters === void 0 ? void 0 : filters.treatment_ids) ===
                  null || _a === void 0
                  ? void 0
                  : _a.length
              ) {
                filters.treatment_ids.forEach(function (id) {
                  return params.append("treatment_ids", id);
                });
              }
              if (filters === null || filters === void 0 ? void 0 : filters.min_roi)
                params.append("min_roi", filters.min_roi.toString());
              if (filters === null || filters === void 0 ? void 0 : filters.min_procedures)
                params.append("min_procedures", filters.min_procedures.toString());
              if (filters === null || filters === void 0 ? void 0 : filters.date_range) {
                params.append("start_date", filters.date_range.start.toISOString());
                params.append("end_date", filters.date_range.end.toISOString());
              }
              if (filters === null || filters === void 0 ? void 0 : filters.sort_by)
                params.append("sort_by", filters.sort_by);
              if (filters === null || filters === void 0 ? void 0 : filters.sort_order)
                params.append("sort_order", filters.sort_order);
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/treatment-profitability?".concat(params)),
              ];
            case 1:
              response = _b.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch treatment profitability analysis");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
  });
}
/**
 * Hook to calculate treatment ROI for a specific treatment
 */
function useCalculateTreatmentROI() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          treatmentId = _b.treatmentId,
          periodStart = _b.periodStart,
          periodEnd = _b.periodEnd;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/treatment-profitability/calculate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clinic_id: clinicId,
                    treatment_id: treatmentId,
                    period_start: periodStart.toISOString(),
                    period_end: periodEnd.toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to calculate treatment ROI");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["treatment-profitability", variables.clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-dashboard-metrics", variables.clinicId],
      });
      sonner_1.toast.success("Análise de ROI do tratamento calculada com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao calcular ROI do tratamento: ".concat(error.message));
    },
  });
}
// ===== CAC & LTV ANALYTICS HOOKS =====
/**
 * Hook to get CAC & LTV analysis
 */
function useCACLTVAnalysis(clinicId, periodStart, periodEnd) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["cac-ltv-analysis", clinicId, periodStart, periodEnd],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
              });
              return [4 /*yield*/, fetch("/api/marketing-roi/cac-ltv-analysis?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch CAC & LTV analysis");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId && !!periodStart && !!periodEnd,
  });
}
/**
 * Hook to calculate CAC for a specific channel
 */
function useCalculateCAC() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          channel = _b.channel,
          periodStart = _b.periodStart,
          periodEnd = _b.periodEnd;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/cac/calculate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clinic_id: clinicId,
                    channel: channel,
                    period_start: periodStart.toISOString(),
                    period_end: periodEnd.toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to calculate CAC");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["cac-ltv-analysis", variables.clinicId],
      });
      sonner_1.toast.success("CAC calculado com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao calcular CAC: ".concat(error.message));
    },
  });
}
/**
 * Hook to calculate LTV for customers
 */
function useCalculateLTV() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          patientId = _b.patientId,
          acquisitionChannel = _b.acquisitionChannel;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/ltv/calculate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clinic_id: clinicId,
                    patient_id: patientId,
                    acquisition_channel: acquisitionChannel,
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to calculate LTV");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["cac-ltv-analysis", variables.clinicId],
      });
      sonner_1.toast.success("LTV calculado com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao calcular LTV: ".concat(error.message));
    },
  });
}
// ===== ROI MONITORING & ALERTS HOOKS =====
/**
 * Hook to get active ROI alerts
 */
function useROIAlerts(clinicId) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["roi-alerts", clinicId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, fetch("/api/marketing-roi/alerts?clinic_id=".concat(clinicId))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI alerts");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time alerts
  });
}
/**
 * Hook to create a new ROI alert
 */
function useCreateROIAlert() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          alertData = _b.alertData;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/alerts", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(__assign({ clinic_id: clinicId }, alertData)),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to create ROI alert");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["roi-alerts", variables.clinicId],
      });
      sonner_1.toast.success("Alerta de ROI criado com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao criar alerta: ".concat(error.message));
    },
  });
}
/**
 * Hook to acknowledge/resolve ROI alerts
 */
function useUpdateROIAlert() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var alertId = _b.alertId,
          status = _b.status;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/alerts/".concat(alertId), {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: status }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to update ROI alert");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data) {
      queryClient.invalidateQueries({
        queryKey: ["roi-alerts"],
      });
      var statusMessages = {
        acknowledged: "Alerta reconhecido com sucesso!",
        resolved: "Alerta resolvido com sucesso!",
        dismissed: "Alerta dispensado com sucesso!",
      };
      sonner_1.toast.success(statusMessages[data.status] || "Alerta atualizado com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao atualizar alerta: ".concat(error.message));
    },
  });
}
// ===== OPTIMIZATION RECOMMENDATIONS HOOKS =====
/**
 * Hook to get optimization recommendations
 */
function useOptimizationRecommendations(clinicId) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["optimization-recommendations", clinicId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch(
                  "/api/marketing-roi/optimization-recommendations?clinic_id=".concat(clinicId),
                ),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch optimization recommendations");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
  });
}
/**
 * Hook to generate new optimization recommendations
 */
function useGenerateOptimizationRecommendations() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/optimization-recommendations/generate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ clinic_id: clinicId }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to generate optimization recommendations");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["optimization-recommendations", variables.clinicId],
      });
      sonner_1.toast.success("Recomendações de otimização geradas com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao gerar recomenda\u00E7\u00F5es: ".concat(error.message));
    },
  });
}
/**
 * Hook to update recommendation status
 */
function useUpdateRecommendationStatus() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var recommendationId = _b.recommendationId,
          status = _b.status;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/optimization-recommendations/".concat(recommendationId), {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: status }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to update recommendation status");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data) {
      queryClient.invalidateQueries({
        queryKey: ["optimization-recommendations"],
      });
      var statusMessages = {
        approved: "Recomendação aprovada com sucesso!",
        in_progress: "Recomendação em andamento!",
        completed: "Recomendação concluída com sucesso!",
        rejected: "Recomendação rejeitada!",
      };
      sonner_1.toast.success(statusMessages[data.status] || "Recomendação atualizada com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao atualizar recomenda\u00E7\u00E3o: ".concat(error.message));
    },
  });
}
// ===== DASHBOARD & ANALYTICS HOOKS =====
/**
 * Hook to get comprehensive ROI dashboard metrics
 */
function useROIDashboardMetrics(
  clinicId,
  periodStart,
  periodEnd,
  includeTrends,
  includeComparisons,
  includeForecasts,
) {
  var _this = this;
  if (includeTrends === void 0) {
    includeTrends = false;
  }
  if (includeComparisons === void 0) {
    includeComparisons = false;
  }
  if (includeForecasts === void 0) {
    includeForecasts = false;
  }
  return (0, react_query_1.useQuery)({
    queryKey: [
      "roi-dashboard-metrics",
      clinicId,
      periodStart,
      periodEnd,
      includeTrends,
      includeComparisons,
      includeForecasts,
    ],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
                include_trends: includeTrends.toString(),
                include_comparisons: includeComparisons.toString(),
                include_forecasts: includeForecasts.toString(),
              });
              return [4 /*yield*/, fetch("/api/marketing-roi/dashboard-metrics?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI dashboard metrics");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId && !!periodStart && !!periodEnd,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
/**
 * Hook to get ROI trend data for visualization
 */
function useROITrendData(clinicId, periodStart, periodEnd, granularity) {
  var _this = this;
  if (granularity === void 0) {
    granularity = "daily";
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["roi-trend-data", clinicId, periodStart, periodEnd, granularity],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
                granularity: granularity,
              });
              return [4 /*yield*/, fetch("/api/marketing-roi/trend-data?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI trend data");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId && !!periodStart && !!periodEnd,
  });
}
/**
 * Hook to get ROI comparisons between entities
 */
function useROIComparisons(
  clinicId,
  entityType,
  currentPeriodStart,
  currentPeriodEnd,
  previousPeriodStart,
  previousPeriodEnd,
) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: [
      "roi-comparisons",
      clinicId,
      entityType,
      currentPeriodStart,
      currentPeriodEnd,
      previousPeriodStart,
      previousPeriodEnd,
    ],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                entity_type: entityType,
                current_period_start: currentPeriodStart.toISOString(),
                current_period_end: currentPeriodEnd.toISOString(),
                previous_period_start: previousPeriodStart.toISOString(),
                previous_period_end: previousPeriodEnd.toISOString(),
              });
              return [4 /*yield*/, fetch("/api/marketing-roi/comparisons?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI comparisons");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled:
      !!clinicId &&
      !!currentPeriodStart &&
      !!currentPeriodEnd &&
      !!previousPeriodStart &&
      !!previousPeriodEnd,
  });
}
// ===== PREDICTIVE ROI HOOKS =====
/**
 * Hook to generate ROI forecasts
 */
function useGenerateROIForecast() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var clinicId = _b.clinicId,
          forecastType = _b.forecastType,
          entityId = _b.entityId,
          forecastPeriodStart = _b.forecastPeriodStart,
          forecastPeriodEnd = _b.forecastPeriodEnd;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/forecasts/generate", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    clinic_id: clinicId,
                    forecast_type: forecastType,
                    entity_id: entityId,
                    forecast_period_start: forecastPeriodStart.toISOString(),
                    forecast_period_end: forecastPeriodEnd.toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to generate ROI forecast");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function (data, variables) {
      queryClient.invalidateQueries({
        queryKey: ["roi-forecasts", variables.clinicId],
      });
      sonner_1.toast.success("Previsão de ROI gerada com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao gerar previs\u00E3o: ".concat(error.message));
    },
  });
}
/**
 * Hook to get ROI forecasts
 */
function useROIForecasts(clinicId, forecastType) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["roi-forecasts", clinicId, forecastType],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
              });
              if (forecastType) {
                params.append("forecast_type", forecastType);
              }
              return [4 /*yield*/, fetch("/api/marketing-roi/forecasts?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI forecasts");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
  });
}
// ===== UTILITY HOOKS =====
/**
 * Hook to get marketing ROI insights and recommendations
 */
function useMarketingROIInsights(clinicId) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["marketing-roi-insights", clinicId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/insights?clinic_id=".concat(clinicId)),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch marketing ROI insights");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
/**
 * Hook to get key ROI metrics summary
 */
function useROIMetricsSummary(clinicId, periodStart, periodEnd) {
  var _this = this;
  return (0, react_query_1.useQuery)({
    queryKey: ["roi-metrics-summary", clinicId, periodStart, periodEnd],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              params = new URLSearchParams({
                clinic_id: clinicId,
                period_start: periodStart.toISOString(),
                period_end: periodEnd.toISOString(),
              });
              return [4 /*yield*/, fetch("/api/marketing-roi/metrics-summary?".concat(params))];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch ROI metrics summary");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId && !!periodStart && !!periodEnd,
  });
}
/**
 * Hook for bulk operations on campaigns
 */
function useBulkCampaignOperations() {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  return (0, react_query_1.useMutation)({
    mutationFn: function (_a) {
      return __awaiter(_this, [_a], void 0, function (_b) {
        var response, error;
        var operation = _b.operation,
          campaignIds = _b.campaignIds,
          data = _b.data;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/campaigns/bulk", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    operation: operation,
                    campaign_ids: campaignIds,
                    data: data,
                  }),
                }),
              ];
            case 1:
              response = _c.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _c.sent();
              throw new Error(error.message || "Failed to execute bulk operation");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({
        queryKey: ["marketing-campaigns"],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-dashboard-metrics"],
      });
      sonner_1.toast.success("Operação em lote executada com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro na opera\u00E7\u00E3o em lote: ".concat(error.message));
    },
  });
}
/**
 * Hook for real-time ROI monitoring
 */
function useRealTimeROIMonitoring(clinicId, enabled) {
  var _this = this;
  if (enabled === void 0) {
    enabled = true;
  }
  return (0, react_query_1.useQuery)({
    queryKey: ["real-time-roi-monitoring", clinicId],
    queryFn: function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/real-time-monitoring?clinic_id=".concat(clinicId)),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch real-time ROI monitoring data");
              }
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    enabled: !!clinicId && enabled,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true,
  });
}
/**
 * Custom hook for managing ROI calculation settings
 */
function useROICalculationSettings(clinicId) {
  var _this = this;
  var queryClient = (0, react_query_1.useQueryClient)();
  var _a = (0, react_query_1.useQuery)({
      queryKey: ["roi-calculation-settings", clinicId],
      queryFn: function () {
        return __awaiter(_this, void 0, void 0, function () {
          var response;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [
                  4 /*yield*/,
                  fetch("/api/marketing-roi/calculation-settings?clinic_id=".concat(clinicId)),
                ];
              case 1:
                response = _a.sent();
                if (!response.ok) {
                  throw new Error("Failed to fetch ROI calculation settings");
                }
                return [2 /*return*/, response.json()];
            }
          });
        });
      },
      enabled: !!clinicId,
    }),
    settings = _a.data,
    isLoading = _a.isLoading;
  var updateSettings = (0, react_query_1.useMutation)({
    mutationFn: function (newSettings) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, error;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                fetch("/api/marketing-roi/calculation-settings", {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(__assign({ clinic_id: clinicId }, newSettings)),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              error = _a.sent();
              throw new Error(error.message || "Failed to update ROI calculation settings");
            case 3:
              return [2 /*return*/, response.json()];
          }
        });
      });
    },
    onSuccess: function () {
      queryClient.invalidateQueries({
        queryKey: ["roi-calculation-settings", clinicId],
      });
      // Invalidate all ROI-related data as calculation settings changed
      queryClient.invalidateQueries({
        queryKey: ["marketing-campaigns", clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ["treatment-profitability", clinicId],
      });
      queryClient.invalidateQueries({
        queryKey: ["roi-dashboard-metrics", clinicId],
      });
      sonner_1.toast.success("Configurações de cálculo de ROI atualizadas com sucesso!");
    },
    onError: function (error) {
      sonner_1.toast.error("Erro ao atualizar configura\u00E7\u00F5es: ".concat(error.message));
    },
  });
  return {
    settings: settings,
    isLoading: isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
}
