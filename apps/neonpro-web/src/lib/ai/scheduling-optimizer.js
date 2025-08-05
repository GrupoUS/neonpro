"use strict";
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
exports.AISchedulingOptimizer = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || "";
var supabaseKey = process.env.SUPABASE_ANON_KEY || "";
var AISchedulingOptimizer = /** @class */ (function () {
  function AISchedulingOptimizer() {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
  }
  AISchedulingOptimizer.prototype.suggestOptimalSlots = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var patientPrefs, availableSlots, scoredSlots, optimizedSlots, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getPatientPreferences(request.patient_id)];
          case 1:
            patientPrefs = _a.sent();
            return [
              4 /*yield*/,
              this.getAvailableSlots(request.preferred_date_range, request.duration_minutes),
            ];
          case 2:
            availableSlots = _a.sent();
            return [4 /*yield*/, this.scoreSlots(availableSlots, request, patientPrefs)];
          case 3:
            scoredSlots = _a.sent();
            return [4 /*yield*/, this.optimizeSlotSelection(scoredSlots, request)];
          case 4:
            optimizedSlots = _a.sent();
            // Log the AI decision for learning
            return [4 /*yield*/, this.logSchedulingDecision(request, optimizedSlots)];
          case 5:
            // Log the AI decision for learning
            _a.sent();
            return [2 /*return*/, optimizedSlots.slice(0, 5)]; // Return top 5 suggestions
          case 6:
            error_1 = _a.sent();
            console.error("AI scheduling optimization error:", error_1);
            throw new Error("Failed to generate optimal slot suggestions");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.getPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_preferences")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, this.getDefaultPreferences()];
            }
            return [
              2 /*return*/,
              {
                time_preferences: data.time_preferences || {
                  preferred_days: [],
                  preferred_hours: [],
                },
                staff_preferences: data.staff_preferences || {
                  preferred_staff_ids: [],
                  avoid_staff_ids: [],
                },
                treatment_preferences: data.treatment_preferences || {},
              },
            ];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.getDefaultPreferences = function () {
    return {
      time_preferences: {
        preferred_days: [1, 2, 3, 4, 5], // Monday to Friday
        preferred_hours: [9, 10, 11, 14, 15, 16],
        avoid_early_morning: true,
        avoid_late_evening: true,
      },
      staff_preferences: {
        preferred_staff_ids: [],
        avoid_staff_ids: [],
      },
      treatment_preferences: {},
    };
  };
  AISchedulingOptimizer.prototype.getAvailableSlots = function (dateRange, durationMinutes) {
    return __awaiter(this, void 0, void 0, function () {
      var slots, startDate, endDate, d, hour, slotTime;
      return __generator(this, function (_a) {
        slots = [];
        startDate = new Date(dateRange.start);
        endDate = new Date(dateRange.end);
        for (d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          for (hour = 9; hour <= 17; hour++) {
            slotTime = new Date(d);
            slotTime.setHours(hour, 0, 0, 0);
            slots.push({
              slot_time: slotTime.toISOString(),
              staff_id: "staff-1", // Simplified - would query actual staff
              duration_minutes: durationMinutes,
              is_available: true,
            });
          }
        }
        return [2 /*return*/, slots];
      });
    });
  };
  AISchedulingOptimizer.prototype.scoreSlots = function (slots, request, patientPrefs) {
    return __awaiter(this, void 0, void 0, function () {
      var scoredSlots,
        _i,
        slots_1,
        slot,
        slotDate,
        patientScore,
        staffScore,
        revenueScore,
        utilizationScore,
        confidenceScore;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            scoredSlots = [];
            (_i = 0), (slots_1 = slots);
            _a.label = 1;
          case 1:
            if (!(_i < slots_1.length)) return [3 /*break*/, 5];
            slot = slots_1[_i];
            slotDate = new Date(slot.slot_time);
            patientScore = this.calculatePatientPreferenceScore(slotDate, patientPrefs);
            return [
              4 /*yield*/,
              this.getStaffEfficiencyScore(slot.staff_id, slotDate.getDay(), slotDate.getHours()),
            ];
          case 2:
            staffScore = _a.sent();
            revenueScore = this.calculateRevenueScore(slotDate, request.treatment_type);
            return [4 /*yield*/, this.calculateUtilizationScore(slotDate)];
          case 3:
            utilizationScore = _a.sent();
            confidenceScore =
              patientScore * 0.3 + staffScore * 0.25 + revenueScore * 0.25 + utilizationScore * 0.2;
            scoredSlots.push(
              __assign(__assign({}, slot), {
                confidence_score: confidenceScore,
                optimization_factors: {
                  patient_preference_score: patientScore,
                  staff_efficiency_score: staffScore,
                  revenue_optimization_score: revenueScore,
                  utilization_score: utilizationScore,
                },
              }),
            );
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [
              2 /*return*/,
              scoredSlots.sort(function (a, b) {
                return b.confidence_score - a.confidence_score;
              }),
            ];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.calculatePatientPreferenceScore = function (slotDate, prefs) {
    var score = 0.5; // Base score
    var dayOfWeek = slotDate.getDay();
    var hourOfDay = slotDate.getHours();
    // Day preference
    if (prefs.time_preferences.preferred_days.includes(dayOfWeek)) {
      score += 0.3;
    }
    // Hour preference
    if (prefs.time_preferences.preferred_hours.includes(hourOfDay)) {
      score += 0.3;
    }
    // Avoid early morning
    if (prefs.time_preferences.avoid_early_morning && hourOfDay < 9) {
      score -= 0.2;
    }
    // Avoid late evening
    if (prefs.time_preferences.avoid_late_evening && hourOfDay > 17) {
      score -= 0.2;
    }
    return Math.max(0, Math.min(1, score));
  };
  AISchedulingOptimizer.prototype.getStaffEfficiencyScore = function (
    staffId,
    dayOfWeek,
    hourOfDay,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("staff_efficiency_patterns")
                .select("efficiency_score")
                .eq("staff_id", staffId)
                .eq("day_of_week", dayOfWeek)
                .eq("hour_of_day", hourOfDay)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, 0.7]; // Default efficiency score
            }
            return [2 /*return*/, data.efficiency_score];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.calculateRevenueScore = function (slotDate, treatmentType) {
    // Simplified revenue scoring - would use complex pricing models
    var hourOfDay = slotDate.getHours();
    // Premium hours (mid-morning, early afternoon)
    if (hourOfDay >= 10 && hourOfDay <= 14) {
      return 0.9;
    }
    // Standard hours
    if (hourOfDay >= 9 && hourOfDay <= 17) {
      return 0.7;
    }
    // Off-peak hours
    return 0.5;
  };
  AISchedulingOptimizer.prototype.calculateUtilizationScore = function (slotDate) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified utilization calculation
        // In practice would check actual appointment density
        return [2 /*return*/, 0.75];
      });
    });
  };
  AISchedulingOptimizer.prototype.optimizeSlotSelection = function (scoredSlots, request) {
    return __awaiter(this, void 0, void 0, function () {
      var optimizedSlots, _loop_1, _i, _a, slot;
      return __generator(this, function (_b) {
        optimizedSlots = [];
        _loop_1 = function (slot) {
          var optimizedSlot = {
            slot_time: slot.slot_time,
            staff_id: slot.staff_id,
            confidence_score: slot.confidence_score,
            optimization_factors: slot.optimization_factors,
            alternative_slots: [],
          };
          // Generate alternatives for each slot
          var alternatives = scoredSlots
            .filter(function (s) {
              return s.slot_time !== slot.slot_time;
            })
            .slice(0, 3)
            .map(function (alt) {
              return {
                slot_time: alt.slot_time,
                staff_id: alt.staff_id,
                confidence_score: alt.confidence_score,
              };
            });
          optimizedSlot.alternative_slots = alternatives;
          optimizedSlots.push(optimizedSlot);
        };
        for (_i = 0, _a = scoredSlots.slice(0, 10); _i < _a.length; _i++) {
          slot = _a[_i];
          _loop_1(slot);
        }
        return [2 /*return*/, optimizedSlots];
      });
    });
  };
  AISchedulingOptimizer.prototype.logSchedulingDecision = function (request, suggestions) {
    return __awaiter(this, void 0, void 0, function () {
      var decisionId, logData, error_2;
      var _a, _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            decisionId = "decision_".concat(Date.now(), "_").concat(request.patient_id);
            logData = {
              decision_id: decisionId,
              patient_id: request.patient_id,
              suggested_slot:
                (_a = suggestions[0]) === null || _a === void 0 ? void 0 : _a.slot_time,
              alternative_slots: suggestions.slice(1).map(function (s) {
                return {
                  slot_time: s.slot_time,
                  confidence_score: s.confidence_score,
                };
              }),
              optimization_factors:
                ((_b = suggestions[0]) === null || _b === void 0
                  ? void 0
                  : _b.optimization_factors) || {},
              confidence_score:
                ((_c = suggestions[0]) === null || _c === void 0 ? void 0 : _c.confidence_score) ||
                0,
            };
            return [4 /*yield*/, this.supabase.from("ai_scheduling_decisions").insert(logData)];
          case 1:
            _d.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _d.sent();
            console.error("Failed to log scheduling decision:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.updatePatientPreferences = function (
    patientId,
    appointmentOutcome,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var appointmentDate, dayOfWeek, hourOfDay, currentPrefs, updatedPrefs, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            appointmentDate = new Date(appointmentOutcome.appointment_time);
            dayOfWeek = appointmentDate.getDay();
            hourOfDay = appointmentDate.getHours();
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_preferences")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 1:
            currentPrefs = _a.sent().data;
            updatedPrefs = void 0;
            if (currentPrefs) {
              // Update existing preferences based on satisfaction
              updatedPrefs = this.mergePreferenceData(currentPrefs, appointmentOutcome);
            } else {
              // Create new preferences
              updatedPrefs = this.createNewPreferences(patientId, appointmentOutcome);
            }
            return [4 /*yield*/, this.supabase.from("patient_preferences").upsert(updatedPrefs)];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            console.error("Failed to update patient preferences:", error_3);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.mergePreferenceData = function (currentPrefs, outcome) {
    // Simplified preference learning - would use more sophisticated ML
    var satisfaction = outcome.satisfaction_score || 3;
    if (satisfaction >= 4) {
      // Positive outcome - reinforce this time/staff combination
      return __assign(__assign({}, currentPrefs), {
        confidence_score: Math.min(1.0, currentPrefs.confidence_score + 0.1),
        data_points_count: currentPrefs.data_points_count + 1,
        last_updated: new Date().toISOString(),
      });
    } else {
      // Negative outcome - reduce confidence slightly
      return __assign(__assign({}, currentPrefs), {
        confidence_score: Math.max(0.1, currentPrefs.confidence_score - 0.05),
        data_points_count: currentPrefs.data_points_count + 1,
        last_updated: new Date().toISOString(),
      });
    }
  };
  AISchedulingOptimizer.prototype.createNewPreferences = function (patientId, outcome) {
    var appointmentDate = new Date(outcome.appointment_time);
    return {
      patient_id: patientId,
      time_preferences: {
        preferred_days: [appointmentDate.getDay()],
        preferred_hours: [appointmentDate.getHours()],
      },
      staff_preferences: {
        preferred_staff_ids: outcome.staff_id ? [outcome.staff_id] : [],
      },
      treatment_preferences: {},
      confidence_score: 0.6,
      data_points_count: 1,
    };
  };
  AISchedulingOptimizer.prototype.getSchedulingAnalytics = function (dateRange) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_4;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduling_analytics")
                .select("*")
                .gte("date", dateRange.start)
                .lte("date", dateRange.end)
                .order("date", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              {
                performance_metrics: this.aggregateAnalytics(data),
                ai_impact: this.calculateAIImpact(data),
                recommendations: this.generateRecommendations(data),
              },
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Failed to get scheduling analytics:", error_4);
            throw new Error("Failed to retrieve scheduling analytics");
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.aggregateAnalytics = function (data) {
    var metrics = {
      total_appointments_optimized: data.length,
      average_ai_influence: 0,
      utilization_improvement: 0,
      revenue_improvement: 0,
      patient_satisfaction_improvement: 0,
    };
    if (data.length > 0) {
      metrics.average_ai_influence =
        data.reduce(function (sum, item) {
          return sum + (item.ai_influence_score || 0);
        }, 0) / data.length;
      var utilizationData = data.filter(function (item) {
        return item.metric_type === "utilization";
      });
      if (utilizationData.length > 0) {
        metrics.utilization_improvement =
          utilizationData.reduce(function (sum, item) {
            return sum + item.value;
          }, 0) / utilizationData.length;
      }
    }
    return metrics;
  };
  AISchedulingOptimizer.prototype.calculateAIImpact = function (data) {
    return {
      efficiency_gain: "15%", // Would calculate from actual data
      revenue_increase: "12%",
      patient_satisfaction_increase: "8%",
      staff_workload_optimization: "20%",
    };
  };
  AISchedulingOptimizer.prototype.getPatientPreferenceData = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_preferences")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || {}];
          case 2:
            error_5 = _b.sent();
            console.error("Error fetching patient preference data:", error_5);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.processFeedback = function (feedbackData) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("scheduling_feedback")
                .insert({
                  patient_id: feedbackData.patientId,
                  appointment_id: feedbackData.appointmentId,
                  satisfaction_score: feedbackData.satisfactionScore,
                  feedback_text: feedbackData.feedback,
                  created_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, { success: true, data: data }];
          case 2:
            error_6 = _b.sent();
            console.error("Error processing feedback:", error_6);
            return [2 /*return*/, { success: false, error: error_6.message }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.getFeedbackHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("scheduling_feedback")
              .select("*")
              .order("created_at", { ascending: false });
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            return [4 /*yield*/, query.limit(100)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_7 = _b.sent();
            console.error("Error fetching feedback history:", error_7);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  AISchedulingOptimizer.prototype.generateRecommendations = function (data) {
    return [
      "Consider increasing AI influence during peak hours",
      "Staff efficiency patterns suggest morning slots are optimal",
      "Patient preference learning is improving - continue current approach",
      "Revenue optimization can be enhanced with dynamic pricing",
    ];
  };
  return AISchedulingOptimizer;
})();
exports.AISchedulingOptimizer = AISchedulingOptimizer;
