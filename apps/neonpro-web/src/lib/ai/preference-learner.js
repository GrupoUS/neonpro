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
exports.PatientPreferenceLearner = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var supabaseUrl = process.env.SUPABASE_URL || "";
var supabaseKey = process.env.SUPABASE_ANON_KEY || "";
var PatientPreferenceLearner = /** @class */ (function () {
  function PatientPreferenceLearner() {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
  }
  PatientPreferenceLearner.prototype.learnFromAppointmentHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var appointmentHistory,
        timePatterns,
        staffPatterns,
        treatmentPatterns,
        satisfactionPatterns,
        updatedPreferences,
        confidenceImprovement,
        newPatterns,
        recommendations,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getAppointmentHistory(patientId)];
          case 1:
            appointmentHistory = _a.sent();
            if (appointmentHistory.length < 3) {
              throw new Error("Insufficient appointment history for learning");
            }
            timePatterns = this.analyzeTimePatterns(appointmentHistory);
            staffPatterns = this.analyzeStaffPatterns(appointmentHistory);
            treatmentPatterns = this.analyzeTreatmentPatterns(appointmentHistory);
            satisfactionPatterns = this.analyzeSatisfactionPatterns(appointmentHistory);
            updatedPreferences = this.generateUpdatedPreferences(
              patientId,
              timePatterns,
              staffPatterns,
              treatmentPatterns,
              satisfactionPatterns,
            );
            confidenceImprovement = this.calculateConfidenceImprovement(appointmentHistory);
            newPatterns = this.detectNewPatterns(appointmentHistory);
            recommendations = this.generateRecommendations(
              timePatterns,
              staffPatterns,
              satisfactionPatterns,
            );
            // Save updated preferences
            return [4 /*yield*/, this.saveUpdatedPreferences(updatedPreferences)];
          case 2:
            // Save updated preferences
            _a.sent();
            return [
              2 /*return*/,
              {
                updated_preferences: updatedPreferences,
                confidence_improvement: confidenceImprovement,
                new_patterns_discovered: newPatterns,
                recommendations: recommendations,
              },
            ];
          case 3:
            error_1 = _a.sent();
            console.error("Preference learning error:", error_1);
            throw new Error("Failed to learn from appointment history");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.getAppointmentHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n        id,\n        patient_id,\n        staff_id,\n        appointment_time,\n        treatment_type,\n        duration_minutes,\n        satisfaction_score,\n        no_show,\n        rescheduled_count,\n        wait_time_minutes\n      ",
                )
                .eq("patient_id", patientId)
                .order("appointment_time", { ascending: false })
                .limit(50),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.analyzeTimePatterns = function (appointments) {
    var dayOfWeekCounts = new Array(7).fill(0);
    var hourOfDayCounts = new Array(24).fill(0);
    var satisfactionByDay = new Array(7).fill(0);
    var satisfactionByHour = new Array(24).fill(0);
    var dayCounters = new Array(7).fill(0);
    var hourCounters = new Array(24).fill(0);
    appointments.forEach(function (apt) {
      var date = new Date(apt.appointment_time);
      var dayOfWeek = date.getDay();
      var hourOfDay = date.getHours();
      dayOfWeekCounts[dayOfWeek]++;
      hourOfDayCounts[hourOfDay]++;
      if (apt.satisfaction_score) {
        satisfactionByDay[dayOfWeek] += apt.satisfaction_score;
        satisfactionByHour[hourOfDay] += apt.satisfaction_score;
        dayCounters[dayOfWeek]++;
        hourCounters[hourOfDay]++;
      }
    });
    // Calculate average satisfaction by time periods
    var avgSatisfactionByDay = satisfactionByDay.map(function (sum, i) {
      return dayCounters[i] > 0 ? sum / dayCounters[i] : 0;
    });
    var avgSatisfactionByHour = satisfactionByHour.map(function (sum, i) {
      return hourCounters[i] > 0 ? sum / hourCounters[i] : 0;
    });
    // Identify preferred time patterns
    var preferredDays = dayOfWeekCounts
      .map(function (count, index) {
        return { day: index, count: count, satisfaction: avgSatisfactionByDay[index] };
      })
      .filter(function (item) {
        return item.count > 0;
      })
      .sort(function (a, b) {
        return b.count * b.satisfaction - a.count * a.satisfaction;
      })
      .slice(0, 3)
      .map(function (item) {
        return item.day;
      });
    var preferredHours = hourOfDayCounts
      .map(function (count, index) {
        return { hour: index, count: count, satisfaction: avgSatisfactionByHour[index] };
      })
      .filter(function (item) {
        return item.count > 0;
      })
      .sort(function (a, b) {
        return b.count * b.satisfaction - a.count * a.satisfaction;
      })
      .slice(0, 4)
      .map(function (item) {
        return item.hour;
      });
    return {
      preferred_days: preferredDays,
      preferred_hours: preferredHours,
      avoid_early_morning: avgSatisfactionByHour.slice(6, 9).every(function (score) {
        return score < 3.5;
      }),
      avoid_late_evening: avgSatisfactionByHour.slice(18, 21).every(function (score) {
        return score < 3.5;
      }),
      weekend_preference: preferredDays.includes(0) || preferredDays.includes(6),
      confidence: Math.min(1.0, appointments.length / 10), // Higher confidence with more data
    };
  };
  PatientPreferenceLearner.prototype.analyzeStaffPatterns = function (appointments) {
    var staffPerformance = new Map();
    appointments.forEach(function (apt) {
      if (!staffPerformance.has(apt.staff_id)) {
        staffPerformance.set(apt.staff_id, {
          appointment_count: 0,
          total_satisfaction: 0,
          no_show_count: 0,
          reschedule_count: 0,
          total_wait_time: 0,
          wait_time_count: 0,
        });
      }
      var staff = staffPerformance.get(apt.staff_id);
      staff.appointment_count++;
      if (apt.satisfaction_score) {
        staff.total_satisfaction += apt.satisfaction_score;
      }
      if (apt.no_show) {
        staff.no_show_count++;
      }
      staff.reschedule_count += apt.rescheduled_count || 0;
      if (apt.wait_time_minutes) {
        staff.total_wait_time += apt.wait_time_minutes;
        staff.wait_time_count++;
      }
    });
    // Calculate staff scores
    var staffScores = Array.from(staffPerformance.entries()).map(function (_a) {
      var staffId = _a[0],
        data = _a[1];
      var avgSatisfaction = data.total_satisfaction / data.appointment_count || 0;
      var noShowRate = data.no_show_count / data.appointment_count;
      var avgWaitTime = data.wait_time_count > 0 ? data.total_wait_time / data.wait_time_count : 0;
      // Composite score (higher is better)
      var score = avgSatisfaction - noShowRate * 2 - avgWaitTime / 30;
      return {
        staff_id: staffId,
        score: score,
        appointment_count: data.appointment_count,
        avg_satisfaction: avgSatisfaction,
      };
    });
    var preferredStaff = staffScores
      .filter(function (item) {
        return item.appointment_count >= 2;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 3)
      .map(function (item) {
        return item.staff_id;
      });
    var avoidStaff = staffScores
      .filter(function (item) {
        return item.appointment_count >= 2 && item.avg_satisfaction < 3.0;
      })
      .map(function (item) {
        return item.staff_id;
      });
    return {
      preferred_staff_ids: preferredStaff,
      avoid_staff_ids: avoidStaff,
      staff_loyalty_score: preferredStaff.length > 0 ? 0.8 : 0.3,
      confidence: Math.min(
        1.0,
        staffScores.reduce(function (sum, item) {
          return sum + item.appointment_count;
        }, 0) / 15,
      ),
    };
  };
  PatientPreferenceLearner.prototype.analyzeTreatmentPatterns = function (appointments) {
    var treatmentData = new Map();
    appointments.forEach(function (apt) {
      if (!treatmentData.has(apt.treatment_type)) {
        treatmentData.set(apt.treatment_type, {
          count: 0,
          total_satisfaction: 0,
          total_duration: 0,
          no_show_count: 0,
        });
      }
      var treatment = treatmentData.get(apt.treatment_type);
      treatment.count++;
      treatment.total_duration += apt.duration_minutes;
      if (apt.satisfaction_score) {
        treatment.total_satisfaction += apt.satisfaction_score;
      }
      if (apt.no_show) {
        treatment.no_show_count++;
      }
    });
    // Analyze patterns
    var treatmentAnalysis = Array.from(treatmentData.entries()).map(function (_a) {
      var type = _a[0],
        data = _a[1];
      return {
        treatment_type: type,
        frequency: data.count,
        avg_satisfaction: data.total_satisfaction / data.count || 0,
        avg_duration: data.total_duration / data.count,
        no_show_rate: data.no_show_count / data.count,
      };
    });
    var preferredTreatments = treatmentAnalysis
      .filter(function (item) {
        return item.avg_satisfaction >= 4.0;
      })
      .sort(function (a, b) {
        return b.frequency - a.frequency;
      })
      .map(function (item) {
        return item.treatment_type;
      });
    var optimalDurations = treatmentAnalysis.reduce(function (acc, item) {
      acc[item.treatment_type] = Math.round(item.avg_duration);
      return acc;
    }, {});
    return {
      preferred_treatments: preferredTreatments,
      optimal_durations: optimalDurations,
      treatment_variety_score: treatmentData.size,
      confidence: Math.min(1.0, appointments.length / 20),
    };
  };
  PatientPreferenceLearner.prototype.analyzeSatisfactionPatterns = function (appointments) {
    var satisfactionData = appointments
      .filter(function (apt) {
        return apt.satisfaction_score;
      })
      .map(function (apt) {
        return {
          satisfaction: apt.satisfaction_score,
          day_of_week: new Date(apt.appointment_time).getDay(),
          hour_of_day: new Date(apt.appointment_time).getHours(),
          wait_time: apt.wait_time_minutes || 0,
          staff_id: apt.staff_id,
          treatment_type: apt.treatment_type,
        };
      });
    if (satisfactionData.length === 0) {
      return { overall_satisfaction: 0, patterns: [], confidence: 0 };
    }
    var overallSatisfaction =
      satisfactionData.reduce(function (sum, item) {
        return sum + item.satisfaction;
      }, 0) / satisfactionData.length;
    // Identify satisfaction patterns
    var patterns = [];
    // Time-based satisfaction patterns
    var morningApts = satisfactionData.filter(function (item) {
      return item.hour_of_day < 12;
    });
    var afternoonApts = satisfactionData.filter(function (item) {
      return item.hour_of_day >= 12;
    });
    if (morningApts.length > 0 && afternoonApts.length > 0) {
      var morningAvg =
        morningApts.reduce(function (sum, item) {
          return sum + item.satisfaction;
        }, 0) / morningApts.length;
      var afternoonAvg =
        afternoonApts.reduce(function (sum, item) {
          return sum + item.satisfaction;
        }, 0) / afternoonApts.length;
      if (Math.abs(morningAvg - afternoonAvg) > 0.5) {
        patterns.push({
          type: "time_preference",
          description:
            morningAvg > afternoonAvg
              ? "Prefers morning appointments"
              : "Prefers afternoon appointments",
          confidence: Math.min(1.0, Math.abs(morningAvg - afternoonAvg)),
        });
      }
    }
    // Wait time sensitivity
    var lowWaitApts = satisfactionData.filter(function (item) {
      return item.wait_time < 15;
    });
    var highWaitApts = satisfactionData.filter(function (item) {
      return item.wait_time >= 15;
    });
    if (lowWaitApts.length > 0 && highWaitApts.length > 0) {
      var lowWaitAvg =
        lowWaitApts.reduce(function (sum, item) {
          return sum + item.satisfaction;
        }, 0) / lowWaitApts.length;
      var highWaitAvg =
        highWaitApts.reduce(function (sum, item) {
          return sum + item.satisfaction;
        }, 0) / highWaitApts.length;
      if (lowWaitAvg - highWaitAvg > 0.5) {
        patterns.push({
          type: "wait_sensitivity",
          description: "Highly sensitive to wait times",
          confidence: Math.min(1.0, lowWaitAvg - highWaitAvg),
        });
      }
    }
    return {
      overall_satisfaction: overallSatisfaction,
      patterns: patterns,
      confidence: Math.min(1.0, satisfactionData.length / 10),
    };
  };
  PatientPreferenceLearner.prototype.generateUpdatedPreferences = function (
    patientId,
    timePatterns,
    staffPatterns,
    treatmentPatterns,
    satisfactionPatterns,
  ) {
    var combinedConfidence =
      timePatterns.confidence * 0.3 +
      staffPatterns.confidence * 0.3 +
      treatmentPatterns.confidence * 0.2 +
      satisfactionPatterns.confidence * 0.2;
    return {
      patient_id: patientId,
      time_preferences: {
        preferred_days: timePatterns.preferred_days,
        preferred_hours: timePatterns.preferred_hours,
        avoid_early_morning: timePatterns.avoid_early_morning,
        avoid_late_evening: timePatterns.avoid_late_evening,
        weekend_preference: timePatterns.weekend_preference,
      },
      staff_preferences: {
        preferred_staff_ids: staffPatterns.preferred_staff_ids,
        avoid_staff_ids: staffPatterns.avoid_staff_ids,
        staff_loyalty_score: staffPatterns.staff_loyalty_score,
      },
      treatment_preferences: {
        preferred_treatments: treatmentPatterns.preferred_treatments,
        optimal_durations: treatmentPatterns.optimal_durations,
        treatment_variety_score: treatmentPatterns.treatment_variety_score,
      },
      communication_preferences: {
        wait_sensitivity: satisfactionPatterns.patterns.some(function (p) {
          return p.type === "wait_sensitivity";
        }),
        satisfaction_threshold: satisfactionPatterns.overall_satisfaction,
      },
      confidence_score: combinedConfidence,
      data_points_count: timePatterns.confidence * 50, // Estimate data points used
      last_updated: new Date().toISOString(),
    };
  };
  PatientPreferenceLearner.prototype.calculateConfidenceImprovement = function (appointments) {
    // Base improvement on data quantity and quality
    var dataQuality =
      appointments.filter(function (apt) {
        return apt.satisfaction_score;
      }).length / appointments.length;
    var dataQuantity = Math.min(1.0, appointments.length / 20);
    return (dataQuality * 0.6 + dataQuantity * 0.4) * 0.3; // Max 30% improvement
  };
  PatientPreferenceLearner.prototype.detectNewPatterns = function (appointments) {
    var patterns = [];
    // Check for consistency patterns
    var recentAppointments = appointments.slice(0, 10);
    if (recentAppointments.length >= 5) {
      var dayConsistency = this.checkDayConsistency(recentAppointments);
      if (dayConsistency.confidence > 0.7) {
        patterns.push({
          pattern_type: "day_consistency",
          confidence: dayConsistency.confidence,
          data_points: recentAppointments.length,
          last_updated: new Date().toISOString(),
        });
      }
      var timeConsistency = this.checkTimeConsistency(recentAppointments);
      if (timeConsistency.confidence > 0.7) {
        patterns.push({
          pattern_type: "time_consistency",
          confidence: timeConsistency.confidence,
          data_points: recentAppointments.length,
          last_updated: new Date().toISOString(),
        });
      }
    }
    return patterns;
  };
  PatientPreferenceLearner.prototype.checkDayConsistency = function (appointments) {
    var days = appointments.map(function (apt) {
      return new Date(apt.appointment_time).getDay();
    });
    var uniqueDays = new Set(days);
    // High consistency if patient books same days repeatedly
    var consistency = 1 - uniqueDays.size / 7;
    return { confidence: Math.max(0, consistency) };
  };
  PatientPreferenceLearner.prototype.checkTimeConsistency = function (appointments) {
    var hours = appointments.map(function (apt) {
      return new Date(apt.appointment_time).getHours();
    });
    var hourRange = Math.max.apply(Math, hours) - Math.min.apply(Math, hours);
    // High consistency if appointments are in similar time ranges
    var consistency = Math.max(0, 1 - hourRange / 12);
    return { confidence: consistency };
  };
  PatientPreferenceLearner.prototype.generateRecommendations = function (
    timePatterns,
    staffPatterns,
    satisfactionPatterns,
  ) {
    var recommendations = [];
    if (timePatterns.confidence > 0.7) {
      if (timePatterns.preferred_hours.length > 0) {
        var hourRanges = this.formatHourRanges(timePatterns.preferred_hours);
        recommendations.push(
          "Schedule appointments between ".concat(hourRanges, " for optimal satisfaction"),
        );
      }
      if (timePatterns.weekend_preference) {
        recommendations.push("Consider offering weekend appointments for this patient");
      }
    }
    if (staffPatterns.confidence > 0.6 && staffPatterns.preferred_staff_ids.length > 0) {
      recommendations.push("Prioritize booking with preferred staff members when possible");
    }
    if (
      satisfactionPatterns.patterns.some(function (p) {
        return p.type === "wait_sensitivity";
      })
    ) {
      recommendations.push("Minimize wait times - patient is highly sensitive to delays");
    }
    if (satisfactionPatterns.overall_satisfaction < 3.5) {
      recommendations.push("Review appointment experience - satisfaction scores indicate issues");
    }
    return recommendations;
  };
  PatientPreferenceLearner.prototype.formatHourRanges = function (hours) {
    if (hours.length === 0) return "";
    var sortedHours = __spreadArray([], hours, true).sort(function (a, b) {
      return a - b;
    });
    var ranges = [];
    var start = sortedHours[0];
    var end = sortedHours[0];
    for (var i = 1; i < sortedHours.length; i++) {
      if (sortedHours[i] === end + 1) {
        end = sortedHours[i];
      } else {
        ranges.push(
          start === end ? "".concat(start, ":00") : "".concat(start, ":00-").concat(end, ":00"),
        );
        start = end = sortedHours[i];
      }
    }
    ranges.push(
      start === end ? "".concat(start, ":00") : "".concat(start, ":00-").concat(end, ":00"),
    );
    return ranges.join(", ");
  };
  PatientPreferenceLearner.prototype.saveUpdatedPreferences = function (preferences) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("patient_preferences").upsert(preferences)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Failed to save updated preferences:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.analyzeAllPatients = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, patients, error, results, _i, _b, patient, error_3, error_4;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 9, , 10]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("patient_id")
                .group("patient_id")
                .having("count(*) >= 3"),
            ];
          case 1:
            (_a = _c.sent()), (patients = _a.data), (error = _a.error);
            if (error) throw error;
            results = {
              total_patients_analyzed: 0,
              successful_learning: 0,
              failed_learning: 0,
              average_confidence_improvement: 0,
            };
            (_i = 0), (_b = patients || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 8];
            patient = _b[_i];
            _c.label = 3;
          case 3:
            _c.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.learnFromAppointmentHistory(patient.patient_id)];
          case 4:
            _c.sent();
            results.successful_learning++;
            return [3 /*break*/, 6];
          case 5:
            error_3 = _c.sent();
            results.failed_learning++;
            return [3 /*break*/, 6];
          case 6:
            results.total_patients_analyzed++;
            _c.label = 7;
          case 7:
            _i++;
            return [3 /*break*/, 2];
          case 8:
            return [2 /*return*/, results];
          case 9:
            error_4 = _c.sent();
            console.error("Batch preference learning error:", error_4);
            throw new Error("Failed to analyze all patients");
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.updatePreferences = function (patientId, preferences) {
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
                .upsert({
                  patient_id: patientId,
                  preferences: preferences,
                  updated_at: new Date().toISOString(),
                })
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, { success: true, data: data }];
          case 2:
            error_5 = _b.sent();
            console.error("Error updating preferences:", error_5);
            return [2 /*return*/, { success: false, error: error_5.message }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.getPatientPreferences = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
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
            error_6 = _b.sent();
            console.error("Error fetching patient preferences:", error_6);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.analyzeSchedulingPatterns = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, patterns, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("appointments")
              .select("*")
              .order("appointment_time", { ascending: false });
            if (patientId) {
              query = query.eq("patient_id", patientId);
            }
            return [4 /*yield*/, query.limit(100)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            patterns = {
              preferred_times: this.analyzeTimePreferences(data || []),
              booking_frequency: this.analyzeBookingFrequency(data || []),
              cancellation_patterns: this.analyzeCancellationPatterns(data || []),
            };
            return [2 /*return*/, patterns];
          case 2:
            error_7 = _b.sent();
            console.error("Error analyzing scheduling patterns:", error_7);
            return [2 /*return*/, {}];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  PatientPreferenceLearner.prototype.analyzeTimePreferences = function (appointments) {
    var timeSlots = {};
    appointments.forEach(function (apt) {
      var hour = new Date(apt.appointment_time).getHours();
      timeSlots[hour] = (timeSlots[hour] || 0) + 1;
    });
    return timeSlots;
  };
  PatientPreferenceLearner.prototype.analyzeBookingFrequency = function (appointments) {
    return {
      total_appointments: appointments.length,
      average_per_month: appointments.length / 12, // Simplified calculation
    };
  };
  PatientPreferenceLearner.prototype.analyzeCancellationPatterns = function (appointments) {
    var cancelled = appointments.filter(function (apt) {
      return apt.status === "cancelled";
    });
    return {
      cancellation_rate: cancelled.length / appointments.length,
      common_reasons: ["scheduling conflict", "illness", "other"],
    };
  };
  return PatientPreferenceLearner;
})();
exports.PatientPreferenceLearner = PatientPreferenceLearner;
