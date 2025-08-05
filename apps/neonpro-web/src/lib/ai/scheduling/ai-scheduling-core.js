"use strict";
/**
 * AI-Powered Automatic Scheduling Core
 * Story 2.3: AI-Powered Automatic Scheduling Implementation
 *
 * This module implements the core AI scheduling algorithm that optimizes
 * appointment scheduling based on multiple criteria including staff efficiency,
 * patient preferences, revenue optimization, and treatment sequencing.
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
exports.AISchedulingCore = void 0;
var client_1 = require("@/lib/supabase/client");
var AISchedulingCore = /** @class */ (function () {
  function AISchedulingCore(config) {
    if (config === void 0) {
      config = {};
    }
    this.supabase = (0, client_1.createClient)();
    this.staffEfficiencyCache = new Map();
    this.patientPreferenceCache = new Map();
    this.config = __assign(
      {
        maxLookAheadDays: 30,
        staffEfficiencyWeight: 0.25,
        patientPreferenceWeight: 0.2,
        revenueOptimizationWeight: 0.2,
        treatmentSequencingWeight: 0.15,
        workloadBalanceWeight: 0.2,
      },
      config,
    );
  }
  /**
   * Main AI scheduling algorithm
   * Analyzes multiple factors to recommend optimal appointment slots
   */
  AISchedulingCore.prototype.generateSchedulingRecommendations = function (criteria) {
    return __awaiter(this, void 0, void 0, function () {
      var patientPreferences_1,
        availableSlots,
        staffEfficiencyData_1,
        scoredSlots,
        recommendations,
        error_1;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.loadPatientPreferences(criteria.patientId),
              // 2. Get available time slots
            ];
          case 1:
            patientPreferences_1 = _a.sent();
            return [
              4 /*yield*/,
              this.getAvailableTimeSlots(criteria.treatmentId, criteria.maxWaitDays),
              // 3. Load staff efficiency patterns
            ];
          case 2:
            availableSlots = _a.sent();
            return [
              4 /*yield*/,
              this.loadStaffEfficiencyPatterns(),
              // 4. Calculate optimization scores for each slot
            ];
          case 3:
            staffEfficiencyData_1 = _a.sent();
            return [
              4 /*yield*/,
              Promise.all(
                availableSlots.map(function (slot) {
                  return _this.calculateOptimizationScore(
                    slot,
                    criteria,
                    patientPreferences_1,
                    staffEfficiencyData_1,
                  );
                }),
              ),
              // 5. Sort by optimization score and return top recommendations
            ];
          case 4:
            scoredSlots = _a.sent();
            recommendations = scoredSlots
              .sort(function (a, b) {
                return b.optimizationScore - a.optimizationScore;
              })
              .slice(0, 5); // Top 5 recommendations
            // 6. Log recommendation for learning
            return [4 /*yield*/, this.logRecommendation(criteria, recommendations)];
          case 5:
            // 6. Log recommendation for learning
            _a.sent();
            return [2 /*return*/, recommendations];
          case 6:
            error_1 = _a.sent();
            console.error("Error generating scheduling recommendations:", error_1);
            throw new Error("Failed to generate AI scheduling recommendations");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate comprehensive optimization score for a time slot
   */
  AISchedulingCore.prototype.calculateOptimizationScore = function (
    slot,
    criteria,
    patientPreferences,
    staffEfficiency,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var scores,
        reasoning,
        staffId,
        staffPattern,
        _a,
        _b,
        _c,
        optimizationScore,
        confidence,
        estimatedRevenue,
        patientSatisfactionPrediction;
      var _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            scores = {
              staffEfficiency: 0,
              patientPreference: 0,
              revenueOptimization: 0,
              treatmentSequencing: 0,
              workloadBalance: 0,
            };
            reasoning = [];
            return [4 /*yield*/, this.findOptimalStaff(slot, criteria.treatmentId)];
          case 1:
            staffId = _e.sent();
            staffPattern =
              (_d = staffEfficiency.get(staffId)) === null || _d === void 0 ? void 0 : _d[0];
            if (staffPattern) {
              scores.staffEfficiency = this.calculateStaffEfficiencyScore(slot, staffPattern);
              reasoning.push(
                "Staff efficiency: ".concat((scores.staffEfficiency * 100).toFixed(1), "%"),
              );
            }
            // 2. Patient Preference Score
            scores.patientPreference = this.calculatePatientPreferenceScore(
              slot,
              patientPreferences,
            );
            reasoning.push(
              "Patient preference match: ".concat((scores.patientPreference * 100).toFixed(1), "%"),
            );
            // 3. Revenue Optimization Score
            _a = scores;
            return [4 /*yield*/, this.calculateRevenueScore(slot, criteria)];
          case 2:
            // 3. Revenue Optimization Score
            _a.revenueOptimization = _e.sent();
            reasoning.push(
              "Revenue optimization: ".concat((scores.revenueOptimization * 100).toFixed(1), "%"),
            );
            if (!(criteria.isFollowUp || criteria.packageId)) return [3 /*break*/, 4];
            _b = scores;
            return [4 /*yield*/, this.calculateSequencingScore(slot, criteria)];
          case 3:
            _b.treatmentSequencing = _e.sent();
            reasoning.push(
              "Treatment sequencing: ".concat((scores.treatmentSequencing * 100).toFixed(1), "%"),
            );
            _e.label = 4;
          case 4:
            // 5. Workload Balance Score
            _c = scores;
            return [4 /*yield*/, this.calculateWorkloadBalanceScore(slot, staffId)];
          case 5:
            // 5. Workload Balance Score
            _c.workloadBalance = _e.sent();
            reasoning.push(
              "Workload balance: ".concat((scores.workloadBalance * 100).toFixed(1), "%"),
            );
            optimizationScore =
              scores.staffEfficiency * this.config.staffEfficiencyWeight +
              scores.patientPreference * this.config.patientPreferenceWeight +
              scores.revenueOptimization * this.config.revenueOptimizationWeight +
              scores.treatmentSequencing * this.config.treatmentSequencingWeight +
              scores.workloadBalance * this.config.workloadBalanceWeight;
            confidence = this.calculateConfidence(scores, patientPreferences, staffPattern);
            return [4 /*yield*/, this.estimateSlotRevenue(slot, criteria)];
          case 6:
            estimatedRevenue = _e.sent();
            patientSatisfactionPrediction = this.predictPatientSatisfaction(
              slot,
              patientPreferences,
              scores,
            );
            return [
              2 /*return*/,
              {
                timeSlot: slot,
                staffId: staffId,
                optimizationScore: optimizationScore,
                confidence: confidence,
                reasoning: reasoning,
                alternativeSlots: [], // Will be populated separately
                estimatedRevenue: estimatedRevenue,
                patientSatisfactionPrediction: patientSatisfactionPrediction,
              },
            ];
        }
      });
    });
  };
  /**
   * Load patient preferences from historical data and learning algorithms
   */
  AISchedulingCore.prototype.loadPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var preferences, learnedPreferences, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Check cache first
            if (this.patientPreferenceCache.has(patientId)) {
              return [2 /*return*/, this.patientPreferenceCache.get(patientId)];
            }
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_preferences")
                .select("*")
                .eq("patient_id", patientId)
                .single(),
            ];
          case 2:
            preferences = _a.sent().data;
            if (preferences) {
              this.patientPreferenceCache.set(patientId, preferences);
              return [2 /*return*/, preferences];
            }
            return [4 /*yield*/, this.learnPatientPreferences(patientId)];
          case 3:
            learnedPreferences = _a.sent();
            this.patientPreferenceCache.set(patientId, learnedPreferences);
            return [2 /*return*/, learnedPreferences];
          case 4:
            error_2 = _a.sent();
            console.error("Error loading patient preferences:", error_2);
            // Return default preferences
            return [2 /*return*/, this.getDefaultPatientPreferences(patientId)];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Learn patient preferences from historical appointment data
   */
  AISchedulingCore.prototype.learnPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var appointments,
        dayPreferences,
        timePreferences,
        leadTimePattern,
        cancellationPattern,
        satisfactionScore,
        preferences,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("\n          *,\n          appointment_feedback(*)\n        ")
                .eq("patient_id", patientId)
                .order("created_at", { ascending: false })
                .limit(50),
            ];
          case 1:
            appointments = _a.sent().data;
            if (!appointments || appointments.length === 0) {
              return [2 /*return*/, this.getDefaultPatientPreferences(patientId)];
            }
            dayPreferences = this.analyzeDayPreferences(appointments);
            timePreferences = this.analyzeTimePreferences(appointments);
            leadTimePattern = this.analyzeBookingLeadTime(appointments);
            cancellationPattern = this.analyzeCancellationPattern(appointments);
            satisfactionScore = this.calculateAverageSatisfaction(appointments);
            preferences = {
              patientId: patientId,
              preferredDaysOfWeek: dayPreferences,
              preferredTimeRanges: timePreferences,
              bookingLeadTime: leadTimePattern,
              cancellationPattern: cancellationPattern,
              satisfactionScore: satisfactionScore,
              lastLearningUpdate: new Date(),
            };
            // Save learned preferences
            return [4 /*yield*/, this.supabase.from("patient_preferences").upsert(preferences)];
          case 2:
            // Save learned preferences
            _a.sent();
            return [2 /*return*/, preferences];
          case 3:
            error_3 = _a.sent();
            console.error("Error learning patient preferences:", error_3);
            return [2 /*return*/, this.getDefaultPatientPreferences(patientId)];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get available time slots for a treatment within the specified timeframe
   */
  AISchedulingCore.prototype.getAvailableTimeSlots = function (treatmentId, maxWaitDays) {
    return __awaiter(this, void 0, void 0, function () {
      var endDate,
        treatment,
        clinicHours,
        existingAppointments,
        availableSlots,
        currentDate,
        _loop_1,
        this_1,
        day,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            endDate = new Date();
            endDate.setDate(endDate.getDate() + maxWaitDays);
            return [
              4 /*yield*/,
              this.supabase.from("treatments").select("*").eq("id", treatmentId).single(),
            ];
          case 1:
            treatment = _a.sent().data;
            if (!treatment) {
              throw new Error("Treatment not found");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("clinic_operating_hours")
                .select("*"),
              // Get existing appointments to find conflicts
            ];
          case 2:
            clinicHours = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("start_time, end_time, staff_id")
                .gte("start_time", new Date().toISOString())
                .lte("start_time", endDate.toISOString())
                .neq("status", "cancelled"),
              // Generate available slots
            ];
          case 3:
            existingAppointments = _a.sent().data;
            availableSlots = [];
            currentDate = new Date();
            _loop_1 = function (day) {
              var checkDate = new Date(currentDate);
              checkDate.setDate(currentDate.getDate() + day);
              var dayOfWeek = checkDate.getDay();
              var dayHours =
                clinicHours === null || clinicHours === void 0
                  ? void 0
                  : clinicHours.find(function (h) {
                      return h.day_of_week === dayOfWeek;
                    });
              if (dayHours && dayHours.is_open) {
                var slots = this_1.generateDaySlots(
                  checkDate,
                  dayHours,
                  treatment.duration_minutes,
                  existingAppointments || [],
                );
                availableSlots.push.apply(availableSlots, slots);
              }
            };
            this_1 = this;
            for (day = 0; day < maxWaitDays; day++) {
              _loop_1(day);
            }
            return [2 /*return*/, availableSlots];
          case 4:
            error_4 = _a.sent();
            console.error("Error getting available time slots:", error_4);
            return [2 /*return*/, []];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate time slots for a specific day
   */
  AISchedulingCore.prototype.generateDaySlots = function (
    date,
    dayHours,
    durationMinutes,
    existingAppointments,
  ) {
    var slots = [];
    var slotInterval = 30; // 30-minute intervals
    var startTime = new Date(date);
    var _a = dayHours.start_time.split(":").map(Number),
      startHour = _a[0],
      startMinute = _a[1];
    startTime.setHours(startHour, startMinute, 0, 0);
    var endTime = new Date(date);
    var _b = dayHours.end_time.split(":").map(Number),
      endHour = _b[0],
      endMinute = _b[1];
    endTime.setHours(endHour, endMinute, 0, 0);
    var currentSlot = new Date(startTime);
    var _loop_2 = function () {
      var slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(currentSlot.getMinutes() + durationMinutes);
      // Check if slot conflicts with existing appointments
      var hasConflict = existingAppointments.some(function (apt) {
        var aptStart = new Date(apt.start_time);
        var aptEnd = new Date(apt.end_time);
        return (
          (currentSlot >= aptStart && currentSlot < aptEnd) ||
          (slotEnd > aptStart && slotEnd <= aptEnd) ||
          (currentSlot <= aptStart && slotEnd >= aptEnd)
        );
      });
      if (!hasConflict && slotEnd <= endTime) {
        slots.push({
          startTime: new Date(currentSlot),
          endTime: slotEnd,
          dayOfWeek: date.getDay(),
          isPreferred: false, // Will be calculated later
          availabilityScore: 1.0, // Base availability score
        });
      }
      currentSlot.setMinutes(currentSlot.getMinutes() + slotInterval);
    };
    while (currentSlot < endTime) {
      _loop_2();
    }
    return slots;
  };
  // Helper methods for scoring calculations
  AISchedulingCore.prototype.calculateStaffEfficiencyScore = function (slot, pattern) {
    // Implementation for staff efficiency scoring
    var hourScore = pattern.efficiencyScore;
    var fatigueAdjustment = 1 - pattern.fatigueLevel * 0.2;
    return Math.max(0, Math.min(1, hourScore * fatigueAdjustment));
  };
  AISchedulingCore.prototype.calculatePatientPreferenceScore = function (slot, preferences) {
    var score = 0;
    // Day preference score
    if (preferences.preferredDaysOfWeek.includes(slot.dayOfWeek)) {
      score += 0.5;
    }
    // Time preference score
    var slotHour = slot.startTime.getHours();
    var slotMinute = slot.startTime.getMinutes();
    var slotTime = ""
      .concat(slotHour.toString().padStart(2, "0"), ":")
      .concat(slotMinute.toString().padStart(2, "0"));
    for (var _i = 0, _a = preferences.preferredTimeRanges; _i < _a.length; _i++) {
      var range = _a[_i];
      if (slotTime >= range.start && slotTime <= range.end) {
        score += 0.5;
        break;
      }
    }
    return Math.min(1, score);
  };
  AISchedulingCore.prototype.calculateRevenueScore = function (slot, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for revenue optimization scoring
        // Consider peak hours, treatment pricing, package deals, etc.
        return [2 /*return*/, 0.7]; // Placeholder
      });
    });
  };
  AISchedulingCore.prototype.calculateSequencingScore = function (slot, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for treatment sequencing optimization
        return [2 /*return*/, 0.8]; // Placeholder
      });
    });
  };
  AISchedulingCore.prototype.calculateWorkloadBalanceScore = function (slot, staffId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for workload balance scoring
        return [2 /*return*/, 0.6]; // Placeholder
      });
    });
  };
  AISchedulingCore.prototype.calculateConfidence = function (
    scores,
    patientPreferences,
    staffPattern,
  ) {
    // Calculate confidence based on data quality and score consistency
    var confidence = 0.5; // Base confidence
    // Increase confidence if we have good patient data
    if (patientPreferences.lastLearningUpdate) {
      var daysSinceUpdate =
        (Date.now() - patientPreferences.lastLearningUpdate.getTime()) / (1000 * 60 * 60 * 24);
      confidence += Math.max(0, 0.3 * (1 - daysSinceUpdate / 30));
    }
    // Increase confidence if we have staff efficiency data
    if (staffPattern) {
      confidence += 0.2;
    }
    return Math.min(1, confidence);
  };
  AISchedulingCore.prototype.estimateSlotRevenue = function (slot, criteria) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for revenue estimation
        return [2 /*return*/, 150]; // Placeholder
      });
    });
  };
  AISchedulingCore.prototype.predictPatientSatisfaction = function (slot, preferences, scores) {
    // Implementation for satisfaction prediction
    return scores.patientPreference * 0.6 + scores.staffEfficiency * 0.4;
  };
  // Additional helper methods
  AISchedulingCore.prototype.findOptimalStaff = function (slot, treatmentId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation to find the best staff member for the slot
        return [2 /*return*/, "staff-id-placeholder"];
      });
    });
  };
  AISchedulingCore.prototype.analyzeDayPreferences = function (appointments) {
    // Analyze which days of the week the patient prefers
    var dayCount = new Array(7).fill(0);
    appointments.forEach(function (apt) {
      var day = new Date(apt.start_time).getDay();
      dayCount[day]++;
    });
    var maxCount = Math.max.apply(Math, dayCount);
    return dayCount
      .map(function (count, day) {
        return { day: day, count: count };
      })
      .filter(function (item) {
        return item.count >= maxCount * 0.3;
      })
      .map(function (item) {
        return item.day;
      });
  };
  AISchedulingCore.prototype.analyzeTimePreferences = function (appointments) {
    // Analyze preferred time ranges
    var hours = appointments.map(function (apt) {
      return new Date(apt.start_time).getHours();
    });
    var avgHour =
      hours.reduce(function (sum, hour) {
        return sum + hour;
      }, 0) / hours.length;
    return [
      {
        start: "".concat(
          Math.max(8, Math.floor(avgHour - 1))
            .toString()
            .padStart(2, "0"),
          ":00",
        ),
        end: "".concat(
          Math.min(18, Math.ceil(avgHour + 1))
            .toString()
            .padStart(2, "0"),
          ":00",
        ),
      },
    ];
  };
  AISchedulingCore.prototype.analyzeBookingLeadTime = function (appointments) {
    // Analyze how far in advance the patient typically books
    var leadTimes = appointments
      .filter(function (apt) {
        return apt.created_at && apt.start_time;
      })
      .map(function (apt) {
        var created = new Date(apt.created_at);
        var scheduled = new Date(apt.start_time);
        return (scheduled.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      });
    return leadTimes.length > 0
      ? leadTimes.reduce(function (sum, days) {
          return sum + days;
        }, 0) / leadTimes.length
      : 7; // Default to 7 days
  };
  AISchedulingCore.prototype.analyzeCancellationPattern = function (appointments) {
    // Analyze cancellation rate
    var cancelled = appointments.filter(function (apt) {
      return apt.status === "cancelled";
    }).length;
    return appointments.length > 0 ? cancelled / appointments.length : 0;
  };
  AISchedulingCore.prototype.calculateAverageSatisfaction = function (appointments) {
    // Calculate average satisfaction from feedback
    var feedbackScores = appointments
      .filter(function (apt) {
        var _a;
        return ((_a = apt.appointment_feedback) === null || _a === void 0 ? void 0 : _a.length) > 0;
      })
      .map(function (apt) {
        return apt.appointment_feedback[0].satisfaction_score;
      })
      .filter(function (score) {
        return score !== null;
      });
    return feedbackScores.length > 0
      ? feedbackScores.reduce(function (sum, score) {
          return sum + score;
        }, 0) / feedbackScores.length
      : 4.0; // Default satisfaction
  };
  AISchedulingCore.prototype.getDefaultPatientPreferences = function (patientId) {
    return {
      patientId: patientId,
      preferredDaysOfWeek: [1, 2, 3, 4, 5], // Weekdays
      preferredTimeRanges: [{ start: "09:00", end: "17:00" }],
      bookingLeadTime: 7,
      cancellationPattern: 0.1,
      satisfactionScore: 4.0,
      lastLearningUpdate: new Date(),
    };
  };
  AISchedulingCore.prototype.loadStaffEfficiencyPatterns = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation to load staff efficiency patterns
        return [2 /*return*/, new Map()];
      });
    });
  };
  AISchedulingCore.prototype.logRecommendation = function (criteria, recommendations) {
    return __awaiter(this, void 0, void 0, function () {
      var error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("ai_scheduling_logs").insert({
                patient_id: criteria.patientId,
                treatment_id: criteria.treatmentId,
                recommendations: JSON.stringify(recommendations),
                criteria: JSON.stringify(criteria),
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_5 = _a.sent();
            console.error("Error logging recommendation:", error_5);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return AISchedulingCore;
})();
exports.AISchedulingCore = AISchedulingCore;
