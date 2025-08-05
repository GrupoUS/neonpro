"use strict";
// Backend service for Patient Retention Analytics + Predictions
// Story 7.4: Advanced patient retention analytics with predictive modeling
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
exports.RetentionService = void 0;
var client_1 = require("@/lib/supabase/client");
var RetentionService = /** @class */ (function () {
  function RetentionService() {}
  RetentionService.getClient = function () {
    return (0, client_1.createClient)();
  };
  // Patient Retention Analytics Operations
  /**
   * Get patient retention analytics with filtering and pagination
   */
  RetentionService.getPatientRetentionAnalytics = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        page,
        _b,
        limit,
        patient_id,
        risk_level,
        segment,
        date_range,
        search,
        _c,
        sort_by,
        _d,
        sort_order,
        query,
        start,
        end,
        _e,
        data,
        error;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _f.sent();
            (_a = params.page),
              (page = _a === void 0 ? 1 : _a),
              (_b = params.limit),
              (limit = _b === void 0 ? 20 : _b),
              (patient_id = params.patient_id),
              (risk_level = params.risk_level),
              (segment = params.segment),
              (date_range = params.date_range),
              (search = params.search),
              (_c = params.sort_by),
              (sort_by = _c === void 0 ? "created_at" : _c),
              (_d = params.sort_order),
              (sort_order = _d === void 0 ? "desc" : _d);
            query = supabase
              .from("patient_retention_analytics")
              .select(
                "\n        *,\n        patients!inner(\n          first_name,\n          last_name,\n          email,\n          phone\n        )\n      ",
              );
            // Apply filters
            if (patient_id) {
              query = query.eq("patient_id", patient_id);
            }
            if (risk_level) {
              query = query.eq("churn_risk_level", risk_level);
            }
            if (segment) {
              query = query.eq("retention_segment", segment);
            }
            if (date_range) {
              query = query
                .gte("calculation_date", date_range.start_date)
                .lte("calculation_date", date_range.end_date);
            }
            // Search functionality
            if (search) {
              query = query.or(
                "\n        patients.first_name.ilike.%"
                  .concat(search, "%,\n        patients.last_name.ilike.%")
                  .concat(search, "%,\n        patients.email.ilike.%")
                  .concat(search, "%,\n        retention_segment.ilike.%")
                  .concat(search, "%\n      "),
              );
            }
            // Apply sorting
            query = query.order(sort_by, { ascending: sort_order === "asc" });
            start = (page - 1) * limit;
            end = start + limit - 1;
            query = query.range(start, end);
            return [4 /*yield*/, query];
          case 2:
            (_e = _f.sent()), (data = _e.data), (error = _e.error);
            if (error) {
              console.error("Error fetching patient retention analytics:", error);
              throw new Error("Failed to fetch patient retention analytics");
            }
            return [
              2 /*return*/,
              {
                data: data || [],
                pagination: {
                  page: page,
                  limit: limit,
                  total: (data === null || data === void 0 ? void 0 : data.length) || 0,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Create patient retention analytics record
   */
  RetentionService.createPatientRetentionAnalytics = function (analyticsData) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .insert([analyticsData])
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating patient retention analytics:", error);
              throw new Error("Failed to create patient retention analytics");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Update patient retention analytics record
   */
  RetentionService.updatePatientRetentionAnalytics = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .update(updates)
                .eq("id", id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating patient retention analytics:", error);
              throw new Error("Failed to update patient retention analytics");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Churn Prediction Operations
  /**
   * Get churn predictions with filtering and pagination
   */
  RetentionService.getChurnPredictions = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        page,
        _b,
        limit,
        patient_id,
        risk_level,
        date_range,
        model_version,
        validation_status,
        _c,
        sort_by,
        _d,
        sort_order,
        query,
        _e,
        data,
        error;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _f.sent();
            (_a = params.page),
              (page = _a === void 0 ? 1 : _a),
              (_b = params.limit),
              (limit = _b === void 0 ? 20 : _b),
              (patient_id = params.patient_id),
              (risk_level = params.risk_level),
              (date_range = params.date_range),
              (model_version = params.model_version),
              (validation_status = params.validation_status),
              (_c = params.sort_by),
              (sort_by = _c === void 0 ? "prediction_date" : _c),
              (_d = params.sort_order),
              (sort_order = _d === void 0 ? "desc" : _d);
            query = supabase
              .from("patient_churn_predictions")
              .select(
                "\n        *,\n        patients!inner(\n          first_name,\n          last_name,\n          email\n        )\n      ",
              );
            // Apply filters
            if (patient_id) {
              query = query.eq("patient_id", patient_id);
            }
            if (risk_level) {
              query = query.eq("risk_level", risk_level);
            }
            if (date_range) {
              query = query
                .gte("prediction_date", date_range.start_date)
                .lte("prediction_date", date_range.end_date);
            }
            if (model_version) {
              query = query.eq("model_version", model_version);
            }
            if (validation_status) {
              query = query.eq("validation_status", validation_status);
            }
            // Only active predictions
            query = query.eq("is_active", true);
            // Apply sorting and pagination
            query = query
              .order(sort_by, { ascending: sort_order === "asc" })
              .range((page - 1) * limit, page * limit - 1);
            return [4 /*yield*/, query];
          case 2:
            (_e = _f.sent()), (data = _e.data), (error = _e.error);
            if (error) {
              console.error("Error fetching churn predictions:", error);
              throw new Error("Failed to fetch churn predictions");
            }
            return [
              2 /*return*/,
              {
                data: data || [],
                pagination: {
                  page: page,
                  limit: limit,
                  total: (data === null || data === void 0 ? void 0 : data.length) || 0,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Create churn prediction
   */
  RetentionService.createChurnPrediction = function (predictionData) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            // Deactivate previous predictions for the same patient
            return [
              4 /*yield*/,
              supabase
                .from("patient_churn_predictions")
                .update({ is_active: false })
                .eq("patient_id", predictionData.patient_id),
            ];
          case 2:
            // Deactivate previous predictions for the same patient
            _b.sent();
            return [
              4 /*yield*/,
              supabase.from("patient_churn_predictions").insert([predictionData]).select().single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating churn prediction:", error);
              throw new Error("Failed to create churn prediction");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Update churn prediction validation
   */
  RetentionService.updateChurnPredictionValidation = function (
    id,
    validation_status,
    actual_outcome,
    outcome_date,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, updates, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            updates = { validation_status: validation_status };
            if (actual_outcome) {
              updates.actual_outcome = actual_outcome;
            }
            if (outcome_date) {
              updates.outcome_date = outcome_date;
            }
            return [
              4 /*yield*/,
              supabase
                .from("patient_churn_predictions")
                .update(updates)
                .eq("id", id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating churn prediction validation:", error);
              throw new Error("Failed to update churn prediction validation");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Retention Intervention Operations
  /**
   * Get retention interventions with filtering and pagination
   */
  RetentionService.getRetentionInterventions = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        page,
        _b,
        limit,
        patient_id,
        channel,
        status,
        campaign_id,
        date_range,
        _c,
        sort_by,
        _d,
        sort_order,
        query,
        _e,
        data,
        error;
      return __generator(this, function (_f) {
        switch (_f.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _f.sent();
            (_a = params.page),
              (page = _a === void 0 ? 1 : _a),
              (_b = params.limit),
              (limit = _b === void 0 ? 20 : _b),
              (patient_id = params.patient_id),
              (channel = params.channel),
              (status = params.status),
              (campaign_id = params.campaign_id),
              (date_range = params.date_range),
              (_c = params.sort_by),
              (sort_by = _c === void 0 ? "created_at" : _c),
              (_d = params.sort_order),
              (sort_order = _d === void 0 ? "desc" : _d);
            query = supabase
              .from("retention_interventions")
              .select(
                "\n        *,\n        patients!inner(\n          first_name,\n          last_name,\n          email\n        )\n      ",
              );
            // Apply filters
            if (patient_id) {
              query = query.eq("patient_id", patient_id);
            }
            if (channel) {
              query = query.eq("channel", channel);
            }
            if (status) {
              query = query.eq("status", status);
            }
            if (campaign_id) {
              query = query.eq("campaign_id", campaign_id);
            }
            if (date_range) {
              query = query
                .gte("created_at", date_range.start_date)
                .lte("created_at", date_range.end_date);
            }
            // Apply sorting and pagination
            query = query
              .order(sort_by, { ascending: sort_order === "asc" })
              .range((page - 1) * limit, page * limit - 1);
            return [4 /*yield*/, query];
          case 2:
            (_e = _f.sent()), (data = _e.data), (error = _e.error);
            if (error) {
              console.error("Error fetching retention interventions:", error);
              throw new Error("Failed to fetch retention interventions");
            }
            return [
              2 /*return*/,
              {
                data: data || [],
                pagination: {
                  page: page,
                  limit: limit,
                  total: (data === null || data === void 0 ? void 0 : data.length) || 0,
                },
              },
            ];
        }
      });
    });
  };
  /**
   * Create retention intervention
   */
  RetentionService.createRetentionIntervention = function (interventionData) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("retention_interventions").insert([interventionData]).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error creating retention intervention:", error);
              throw new Error("Failed to create retention intervention");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  /**
   * Update retention intervention status
   */
  RetentionService.updateRetentionInterventionStatus = function (
    id,
    status,
    response_data,
    effectiveness_score,
    roi,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, updates, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            updates = { status: status };
            if (response_data) {
              updates.response_data = response_data;
            }
            if (effectiveness_score !== undefined) {
              updates.effectiveness_score = effectiveness_score;
            }
            if (roi !== undefined) {
              updates.roi = roi;
            }
            if (
              status === "delivered" ||
              status === "opened" ||
              status === "clicked" ||
              status === "responded"
            ) {
              updates.executed_date = new Date().toISOString();
            }
            return [
              4 /*yield*/,
              supabase
                .from("retention_interventions")
                .update(updates)
                .eq("id", id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error updating retention intervention status:", error);
              throw new Error("Failed to update retention intervention status");
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Analytics and Metrics Operations
  /**
   * Get retention metrics summary
   */
  RetentionService.getRetentionMetrics = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var highRiskPatients,
        criticalRiskPatients,
        churnSummary,
        totalPatients,
        avgChurnProbability,
        avgLifetimeValue,
        avgPredictedLTV,
        avgRetentionScore,
        error_1;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .select("*", { count: "exact" })
                .eq("churn_risk_level", "high"),
            ];
          case 1:
            highRiskPatients = _c.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .select("*", { count: "exact" })
                .eq("churn_risk_level", "critical"),
            ];
          case 2:
            criticalRiskPatients = _c.sent().count;
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .select(
                  "\n          churn_probability,\n          lifetime_value,\n          predicted_ltv,\n          retention_score,\n          visit_frequency_score,\n          engagement_score,\n          satisfaction_score,\n          financial_score\n        ",
                ),
            ];
          case 3:
            churnSummary = _c.sent().data;
            totalPatients =
              (churnSummary === null || churnSummary === void 0 ? void 0 : churnSummary.length) ||
              0;
            avgChurnProbability =
              (churnSummary === null || churnSummary === void 0
                ? void 0
                : churnSummary.reduce(function (sum, item) {
                    return sum + (item.churn_probability || 0);
                  }, 0)) / totalPatients || 0;
            avgLifetimeValue =
              (churnSummary === null || churnSummary === void 0
                ? void 0
                : churnSummary.reduce(function (sum, item) {
                    return sum + (item.lifetime_value || 0);
                  }, 0)) / totalPatients || 0;
            avgPredictedLTV =
              (churnSummary === null || churnSummary === void 0
                ? void 0
                : churnSummary.reduce(function (sum, item) {
                    return sum + (item.predicted_ltv || 0);
                  }, 0)) / totalPatients || 0;
            avgRetentionScore =
              (churnSummary === null || churnSummary === void 0
                ? void 0
                : churnSummary.reduce(function (sum, item) {
                    return sum + (item.retention_score || 0);
                  }, 0)) / totalPatients || 0;
            return [
              2 /*return*/,
              {
                total_patients: totalPatients,
                high_risk_patients: highRiskPatients || 0,
                critical_risk_patients: criticalRiskPatients || 0,
                churn_rate: avgChurnProbability * 100,
                retention_rate: (1 - avgChurnProbability) * 100,
                average_ltv: avgLifetimeValue,
                predicted_ltv: avgPredictedLTV,
                average_retention_score: avgRetentionScore,
                period_start:
                  ((_a = params.date_range) === null || _a === void 0 ? void 0 : _a.start_date) ||
                  new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                period_end:
                  ((_b = params.date_range) === null || _b === void 0 ? void 0 : _b.end_date) ||
                  new Date().toISOString(),
              },
            ];
          case 4:
            error_1 = _c.sent();
            console.error("Error calculating retention metrics:", error_1);
            throw new Error("Failed to calculate retention metrics");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get dashboard summary data
   */
  RetentionService.getDashboardSummary = function (date_range) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, summary;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("patient_retention_analytics")
                .select(
                  "\n        churn_risk_level,\n        retention_segment,\n        churn_probability,\n        lifetime_value,\n        retention_score\n      ",
                ),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              console.error("Error fetching dashboard summary:", error);
              throw new Error("Failed to fetch dashboard summary");
            }
            summary = data || [];
            return [
              2 /*return*/,
              {
                total_patients: summary.length,
                risk_distribution: {
                  low: summary.filter(function (p) {
                    return p.churn_risk_level === "low";
                  }).length,
                  medium: summary.filter(function (p) {
                    return p.churn_risk_level === "medium";
                  }).length,
                  high: summary.filter(function (p) {
                    return p.churn_risk_level === "high";
                  }).length,
                  critical: summary.filter(function (p) {
                    return p.churn_risk_level === "critical";
                  }).length,
                },
                average_retention_score:
                  summary.reduce(function (sum, p) {
                    return sum + (p.retention_score || 0);
                  }, 0) / summary.length || 0,
                average_churn_probability:
                  summary.reduce(function (sum, p) {
                    return sum + (p.churn_probability || 0);
                  }, 0) / summary.length || 0,
                average_lifetime_value:
                  summary.reduce(function (sum, p) {
                    return sum + (p.lifetime_value || 0);
                  }, 0) / summary.length || 0,
                segments: __spreadArray(
                  [],
                  new Set(
                    summary.map(function (p) {
                      return p.retention_segment;
                    }),
                  ),
                  true,
                ).map(function (segment) {
                  return {
                    name: segment,
                    count: summary.filter(function (p) {
                      return p.retention_segment === segment;
                    }).length,
                  };
                }),
              },
            ];
        }
      });
    });
  };
  return RetentionService;
})();
exports.RetentionService = RetentionService;
