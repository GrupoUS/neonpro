"use strict";
// Intelligent Threshold Management Service
// Story 6.2: Automated Reorder Alerts + Threshold Management
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
exports.IntelligentThresholdService = void 0;
var server_1 = require("@/lib/supabase/server");
var IntelligentThresholdService = /** @class */ (function () {
  function IntelligentThresholdService() {}
  IntelligentThresholdService.prototype.getSupabaseClient = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 2:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  // Core threshold management
  IntelligentThresholdService.prototype.createThreshold = function (threshold) {
    return __awaiter(this, void 0, void 0, function () {
      var calculatedThreshold, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.calculateIntelligentThresholds(threshold.item_id, threshold.clinic_id, {
                reorder_point: threshold.reorder_point,
                safety_stock: threshold.safety_stock,
                demand_forecast_weekly: threshold.demand_forecast_weekly || 0,
                lead_time_days: threshold.lead_time_days || 7,
              }),
            ];
          case 1:
            calculatedThreshold = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("reorder_thresholds")
                .insert(
                  __assign(__assign(__assign({}, threshold), calculatedThreshold), {
                    last_calculation_date: new Date().toISOString(),
                  }),
                )
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.updateThreshold = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var calculatedUpdates, existing, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            calculatedUpdates = {};
            if (
              !(
                updates.reorder_point ||
                updates.safety_stock ||
                updates.demand_forecast_weekly ||
                updates.lead_time_days
              )
            )
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.getThreshold(id)];
          case 1:
            existing = _b.sent();
            if (!existing) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.calculateIntelligentThresholds(existing.item_id, existing.clinic_id, {
                reorder_point: updates.reorder_point || existing.reorder_point,
                safety_stock: updates.safety_stock || existing.safety_stock,
                demand_forecast_weekly:
                  updates.demand_forecast_weekly || existing.demand_forecast_weekly || 0,
                lead_time_days: updates.lead_time_days || existing.lead_time_days || 7,
              }),
            ];
          case 2:
            calculatedUpdates = _b.sent();
            _b.label = 3;
          case 3:
            return [
              4 /*yield*/,
              supabase
                .from("reorder_thresholds")
                .update(
                  __assign(__assign(__assign({}, updates), calculatedUpdates), {
                    last_calculation_date: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }),
                )
                .eq("id", id)
                .select()
                .single(),
            ];
          case 4:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.getThreshold = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("reorder_thresholds").select("*").eq("id", id).single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") return [2 /*return*/, null]; // Not found
              throw error;
            }
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.getThresholdsByClinic = function (clinicId, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            query = supabase
              .from("reorder_thresholds")
              .select(
                "\n        *,\n        inventory_items!inner(\n          id,\n          name,\n          sku,\n          category,\n          unit,\n          current_stock\n        )\n      ",
              )
              .eq("clinic_id", clinicId)
              .eq("is_active", true);
            if (
              (_b = filters === null || filters === void 0 ? void 0 : filters.item_category) ===
                null || _b === void 0
                ? void 0
                : _b.length
            ) {
              query = query.in("inventory_items.category", filters.item_category);
            }
            if (
              (filters === null || filters === void 0 ? void 0 : filters.auto_reorder_enabled) !==
              undefined
            ) {
              query = query.eq("auto_reorder_enabled", filters.auto_reorder_enabled);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Intelligent threshold calculation
  IntelligentThresholdService.prototype.calculateIntelligentThresholds = function (
    itemId,
    clinicId,
    baseParams,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var demandHistory,
        demandStats,
        seasonalFactor,
        leadTimeVariability,
        avgDailyDemand,
        demandDuringLeadTime,
        variabilityFactor,
        serviceLevel,
        calculatedSafetyStock,
        calculatedReorderPoint;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getHistoricalDemand(itemId, clinicId, 90)];
          case 1:
            demandHistory = _a.sent();
            demandStats = this.calculateDemandStatistics(demandHistory);
            return [4 /*yield*/, this.calculateSeasonalAdjustment(itemId, clinicId)];
          case 2:
            seasonalFactor = _a.sent();
            return [4 /*yield*/, this.getLeadTimeVariability(itemId)];
          case 3:
            leadTimeVariability = _a.sent();
            avgDailyDemand = baseParams.demand_forecast_weekly / 7;
            demandDuringLeadTime = avgDailyDemand * baseParams.lead_time_days;
            variabilityFactor = Math.sqrt(
              demandStats.variance * baseParams.lead_time_days +
                Math.pow(avgDailyDemand, 2) * leadTimeVariability,
            );
            serviceLevel = 1.645;
            calculatedSafetyStock = Math.ceil(serviceLevel * variabilityFactor * seasonalFactor);
            calculatedReorderPoint = Math.ceil(
              demandDuringLeadTime * seasonalFactor + calculatedSafetyStock,
            );
            return [
              2 /*return*/,
              {
                calculated_reorder_point: Math.max(
                  calculatedReorderPoint,
                  baseParams.reorder_point,
                ),
                calculated_safety_stock: Math.max(calculatedSafetyStock, baseParams.safety_stock),
                seasonal_adjustment_factor: seasonalFactor,
              },
            ];
        }
      });
    });
  };
  // Predictive analytics and forecasting
  IntelligentThresholdService.prototype.generateDemandForecast = function (
    itemId,
    clinicId,
    forecastPeriod,
    forecastDate,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var historicalData,
        forecast,
        seasonalFactor,
        adjustedDemand,
        appointmentDemand,
        demandForecast,
        _a,
        data,
        error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.getHistoricalDemand(itemId, clinicId, 365)];
          case 1:
            historicalData = _b.sent();
            return [
              4 /*yield*/,
              this.calculatePredictiveForecast(historicalData, forecastPeriod, forecastDate),
            ];
          case 2:
            forecast = _b.sent();
            return [4 /*yield*/, this.calculateSeasonalAdjustment(itemId, clinicId, forecastDate)];
          case 3:
            seasonalFactor = _b.sent();
            adjustedDemand = forecast.predicted_demand * seasonalFactor;
            return [4 /*yield*/, this.getAppointmentBasedDemand(itemId, clinicId, forecastDate)];
          case 4:
            appointmentDemand = _b.sent();
            demandForecast = {
              item_id: itemId,
              clinic_id: clinicId,
              forecast_date: forecastDate.toISOString().split("T")[0],
              forecast_period: forecastPeriod,
              predicted_demand: adjustedDemand + appointmentDemand,
              confidence_interval: forecast.confidence_interval,
              seasonal_factor: seasonalFactor,
              trend_factor: forecast.trend_factor,
              historical_average: forecast.historical_average,
              variance: forecast.variance,
              standard_deviation: forecast.standard_deviation,
              appointment_based_demand: appointmentDemand,
              calculated_at: new Date().toISOString(),
            };
            return [
              4 /*yield*/,
              supabase
                .from("demand_forecasts")
                .upsert(demandForecast, {
                  onConflict: "item_id,clinic_id,forecast_date,forecast_period",
                })
                .select()
                .single(),
            ];
          case 5:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  // Alert management
  IntelligentThresholdService.prototype.createAlert = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var deliveryTime, supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            deliveryTime = this.estimateNotificationDeliveryTime(
              alert.notification_channels || ["dashboard"],
            );
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("reorder_alerts")
                .insert(
                  __assign(__assign({}, alert), {
                    delivery_time_ms: deliveryTime,
                    notification_sent: false,
                    status: "pending",
                  }),
                )
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            // Trigger notification delivery
            return [4 /*yield*/, this.deliverNotification(data)];
          case 3:
            // Trigger notification delivery
            _b.sent();
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.updateAlert = function (id, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("reorder_alerts")
                .update(__assign(__assign({}, updates), { updated_at: new Date().toISOString() }))
                .eq("id", id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.acknowledgeAlert = function (id, userId, notes) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.updateAlert(id, {
            status: "acknowledged",
            acknowledged_by: userId,
            acknowledged_at: new Date().toISOString(),
            resolution_notes: notes,
          }),
        ];
      });
    });
  };
  IntelligentThresholdService.prototype.resolveAlert = function (id, userId, notes) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.updateAlert(id, {
            status: "resolved",
            resolved_by: userId,
            resolved_at: new Date().toISOString(),
            resolution_notes: notes,
          }),
        ];
      });
    });
  };
  IntelligentThresholdService.prototype.escalateAlert = function (id, escalateTo, level) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [
          2 /*return*/,
          this.updateAlert(id, {
            status: "escalated",
            escalated_to: escalateTo,
            escalated_at: new Date().toISOString(),
            escalation_level: level,
          }),
        ];
      });
    });
  };
  // Analytics and optimization
  IntelligentThresholdService.prototype.analyzeThresholdOptimization = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var thresholds, optimizations, _i, thresholds_1, threshold, optimal;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getThresholdsByClinic(clinicId)];
          case 1:
            thresholds = _a.sent();
            optimizations = [];
            (_i = 0), (thresholds_1 = thresholds);
            _a.label = 2;
          case 2:
            if (!(_i < thresholds_1.length)) return [3 /*break*/, 5];
            threshold = thresholds_1[_i];
            return [4 /*yield*/, this.calculateOptimalThresholds(threshold)];
          case 3:
            optimal = _a.sent();
            if (optimal.needs_optimization) {
              optimizations.push({
                item_id: threshold.item_id,
                item_name: threshold.inventory_items.name,
                current_reorder_point: threshold.reorder_point,
                recommended_reorder_point: optimal.optimal_reorder_point,
                current_safety_stock: threshold.safety_stock,
                recommended_safety_stock: optimal.optimal_safety_stock,
                optimization_reason: optimal.reason,
                potential_savings: optimal.savings,
                confidence_score: optimal.confidence,
                implementation_priority: optimal.priority,
              });
            }
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [
              2 /*return*/,
              optimizations.sort(function (a, b) {
                return b.potential_savings - a.potential_savings;
              }),
            ];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.getAlertStats = function (clinicId, dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, query, _a, alerts, error, stats;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            query = supabase.from("reorder_alerts").select("*").eq("clinic_id", clinicId);
            if (dateRange) {
              query = query
                .gte("created_at", dateRange.start.toISOString())
                .lte("created_at", dateRange.end.toISOString());
            }
            return [4 /*yield*/, query];
          case 2:
            (_a = _b.sent()), (alerts = _a.data), (error = _a.error);
            if (error) throw error;
            stats = {
              total_alerts: alerts.length,
              pending_alerts: alerts.filter(function (a) {
                return a.status === "pending";
              }).length,
              critical_alerts: alerts.filter(function (a) {
                return a.priority === "critical" || a.priority === "emergency";
              }).length,
              emergency_alerts: alerts.filter(function (a) {
                return a.priority === "emergency";
              }).length,
              resolved_today: alerts.filter(function (a) {
                return (
                  a.status === "resolved" &&
                  new Date(a.resolved_at).toDateString() === new Date().toDateString()
                );
              }).length,
              average_resolution_time_hours: this.calculateAverageResolutionTime(alerts),
              alerts_by_type: this.groupBy(alerts, "alert_type"),
              alerts_by_priority: this.groupBy(alerts, "priority"),
            };
            return [2 /*return*/, stats];
        }
      });
    });
  };
  // Private helper methods
  IntelligentThresholdService.prototype.getHistoricalDemand = function (itemId, clinicId, days) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, startDate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            // This would typically come from inventory movements/usage history
            // For now, return sample data structure
            return [2 /*return*/, []];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.calculateDemandStatistics = function (demandHistory) {
    if (demandHistory.length === 0) {
      return { average: 0, variance: 0, standardDeviation: 0 };
    }
    var values = demandHistory.map(function (d) {
      return d.quantity;
    });
    var average =
      values.reduce(function (sum, val) {
        return sum + val;
      }, 0) / values.length;
    var variance =
      values.reduce(function (sum, val) {
        return sum + Math.pow(val - average, 2);
      }, 0) / values.length;
    var standardDeviation = Math.sqrt(variance);
    return { average: average, variance: variance, standardDeviation: standardDeviation };
  };
  IntelligentThresholdService.prototype.calculateSeasonalAdjustment = function (
    itemId,
    clinicId,
    date,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var currentDate, month, seasonalFactors;
      return __generator(this, function (_a) {
        currentDate = date || new Date();
        month = currentDate.getMonth();
        seasonalFactors = [
          1.0,
          1.0,
          1.1,
          1.1,
          1.0,
          0.9, // Jan-Jun
          0.8,
          0.8,
          0.9,
          1.0,
          1.1,
          1.2, // Jul-Dec
        ];
        return [2 /*return*/, seasonalFactors[month] || 1.0];
      });
    });
  };
  IntelligentThresholdService.prototype.getLeadTimeVariability = function (itemId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, _a, data, error, leadTimes, avg, variance;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase.from("supplier_lead_times").select("*").eq("item_id", itemId),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data.length) return [2 /*return*/, 0.5]; // Default variability
            leadTimes = data.map(function (d) {
              return d.average_lead_time_days;
            });
            avg =
              leadTimes.reduce(function (sum, val) {
                return sum + val;
              }, 0) / leadTimes.length;
            variance =
              leadTimes.reduce(function (sum, val) {
                return sum + Math.pow(val - avg, 2);
              }, 0) / leadTimes.length;
            return [2 /*return*/, variance / Math.pow(avg, 2)]; // Coefficient of variation
        }
      });
    });
  };
  IntelligentThresholdService.prototype.calculatePredictiveForecast = function (
    historicalData,
    period,
    date,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, recentData, average;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            recentData = historicalData.slice(-30);
            average =
              recentData.length > 0
                ? recentData.reduce(function (sum, d) {
                    return sum + d.quantity;
                  }, 0) / recentData.length
                : 0;
            return [
              2 /*return*/,
              {
                predicted_demand: average,
                confidence_interval: 0.85,
                trend_factor: 1.0,
                historical_average: average,
                variance: 0,
                standard_deviation: 0,
              },
            ];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.getAppointmentBasedDemand = function (
    itemId,
    clinicId,
    date,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Calculate demand based on scheduled appointments
        // This would integrate with appointment system
        return [2 /*return*/, 0];
      });
    });
  };
  IntelligentThresholdService.prototype.estimateNotificationDeliveryTime = function (channels) {
    // Estimate delivery time based on channels
    if (channels.includes("sms") || channels.includes("push")) return 5000; // 5 seconds
    if (channels.includes("email")) return 30000; // 30 seconds
    return 1000; // Dashboard only - 1 second
  };
  IntelligentThresholdService.prototype.deliverNotification = function (alert) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, deliveryTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            // Simulate notification delivery
            return [
              4 /*yield*/,
              new Promise(function (resolve) {
                return setTimeout(resolve, 100);
              }),
            ];
          case 1:
            // Simulate notification delivery
            _a.sent();
            deliveryTime = Date.now() - startTime;
            // Update delivery status
            return [
              4 /*yield*/,
              this.updateAlert(alert.id, {
                notification_sent: true,
                delivery_time_ms: deliveryTime,
              }),
            ];
          case 2:
            // Update delivery status
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.calculateOptimalThresholds = function (threshold) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, (0, server_1.createClient)()];
          case 1:
            supabase = _a.sent();
            // Analyze threshold performance and calculate optimal values
            // This would use historical alert frequency, stockout incidents, etc.
            return [
              2 /*return*/,
              {
                needs_optimization: false,
                optimal_reorder_point: threshold.reorder_point,
                optimal_safety_stock: threshold.safety_stock,
                reason: "Current thresholds are optimal",
                savings: 0,
                confidence: 0.95,
                priority: "low",
              },
            ];
        }
      });
    });
  };
  IntelligentThresholdService.prototype.calculateAverageResolutionTime = function (alerts) {
    var resolvedAlerts = alerts.filter(function (a) {
      return a.status === "resolved" && a.resolved_at;
    });
    if (resolvedAlerts.length === 0) return 0;
    var totalTime = resolvedAlerts.reduce(function (sum, alert) {
      var created = new Date(alert.created_at).getTime();
      var resolved = new Date(alert.resolved_at).getTime();
      return sum + (resolved - created);
    }, 0);
    return totalTime / resolvedAlerts.length / (1000 * 60 * 60); // Convert to hours
  };
  IntelligentThresholdService.prototype.groupBy = function (array, key) {
    return array.reduce(function (groups, item) {
      var value = String(item[key]);
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  };
  return IntelligentThresholdService;
})();
exports.IntelligentThresholdService = IntelligentThresholdService;
