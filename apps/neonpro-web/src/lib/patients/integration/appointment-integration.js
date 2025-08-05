/**
 * Patient-Appointment Integration System
 * Integrates patient profiles with appointment scheduling
 * Part of Story 3.1 - Task 6: System Integration & Search
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      ((t) => {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.hasOwn(s, p)) t[p] = s[p];
        }
        return t;
      });
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  ((thisArg, _arguments, P, generator) => {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P((resolve) => {
            resolve(value);
          });
    }
    return new (P || (P = Promise))((resolve, reject) => {
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
  });
var __generator =
  (this && this.__generator) ||
  ((thisArg, body) => {
    var _ = {
        label: 0,
        sent: () => {
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
      return (v) => step([n, v]);
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
  });
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientAppointmentIntegration = void 0;
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
var PatientAppointmentIntegration = /** @class */ (() => {
  function PatientAppointmentIntegration() {}
  /**
   * Get comprehensive appointment history for a patient
   */
  PatientAppointmentIntegration.getPatientAppointmentHistory = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        appointments,
        error,
        completed,
        cancelled,
        noShows,
        timePreferences,
        servicePreferences,
        ratingsSum,
        averageRating,
        nextAppointment,
        error_1;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("appointments")
                .select("\n          *,\n          services(*),\n          staff(*)\n        ")
                .eq("patient_id", patientId)
                .order("appointment_date", { ascending: false }),
            ];
          case 1:
            (_a = _c.sent()), (appointments = _a.data), (error = _a.error);
            if (error) throw error;
            completed =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((apt) => apt.status === "completed")) || [];
            cancelled =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((apt) => apt.status === "cancelled")) || [];
            noShows =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((apt) => apt.status === "no_show")) || [];
            timePreferences = this.calculateTimePreferences(completed);
            servicePreferences = this.calculateServicePreferences(completed);
            ratingsSum = completed
              .filter((apt) => apt.rating)
              .reduce((sum, apt) => sum + (apt.rating || 0), 0);
            averageRating = completed.length > 0 ? ratingsSum / completed.length : 0;
            return [
              4 /*yield*/,
              client_1.supabase
                .from("appointments")
                .select("appointment_date")
                .eq("patient_id", patientId)
                .eq("status", "scheduled")
                .gte("appointment_date", new Date().toISOString())
                .order("appointment_date", { ascending: true })
                .limit(1)
                .single(),
            ];
          case 2:
            nextAppointment = _c.sent().data;
            return [
              2 /*return*/,
              {
                patient_id: patientId,
                appointments: appointments || [],
                total_appointments:
                  (appointments === null || appointments === void 0
                    ? void 0
                    : appointments.length) || 0,
                completed_appointments: completed.length,
                cancelled_appointments: cancelled.length,
                no_show_count: noShows.length,
                average_rating: averageRating,
                last_appointment_date:
                  ((_b = completed[0]) === null || _b === void 0 ? void 0 : _b.appointment_date) ||
                  null,
                next_appointment_date:
                  (nextAppointment === null || nextAppointment === void 0
                    ? void 0
                    : nextAppointment.appointment_date) || null,
                preferred_times: timePreferences,
                preferred_services: servicePreferences,
              },
            ];
          case 3:
            error_1 = _c.sent();
            logger_1.logger.error("Error fetching patient appointment history:", error_1);
            throw new Error("Failed to fetch appointment history");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate appointment insights for a patient
   */
  PatientAppointmentIntegration.generateAppointmentInsights = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var history_1,
        attendanceRate,
        punctualityScore,
        satisfactionScore,
        loyaltyIndex,
        riskFactors,
        recommendations,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getPatientAppointmentHistory(patientId)];
          case 1:
            history_1 = _a.sent();
            attendanceRate =
              history_1.total_appointments > 0
                ? (history_1.completed_appointments / history_1.total_appointments) * 100
                : 0;
            return [4 /*yield*/, this.calculatePunctualityScore(patientId)];
          case 2:
            punctualityScore = _a.sent();
            satisfactionScore = history_1.average_rating * 20;
            loyaltyIndex = this.calculateLoyaltyIndex(history_1);
            riskFactors = this.identifyRiskFactors(history_1, attendanceRate);
            recommendations = this.generateRecommendations(
              history_1,
              attendanceRate,
              satisfactionScore,
            );
            return [
              2 /*return*/,
              {
                attendance_rate: attendanceRate,
                punctuality_score: punctualityScore,
                satisfaction_score: satisfactionScore,
                loyalty_index: loyaltyIndex,
                risk_factors: riskFactors,
                recommendations: recommendations,
              },
            ];
          case 3:
            error_2 = _a.sent();
            logger_1.logger.error("Error generating appointment insights:", error_2);
            throw new Error("Failed to generate appointment insights");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Link patient profile with appointment booking
   */
  PatientAppointmentIntegration.linkPatientToAppointment = function (patientId, appointmentData) {
    return __awaiter(this, void 0, void 0, function () {
      var history_2, optimizedAppointment, _a, appointment, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getPatientAppointmentHistory(patientId)];
          case 1:
            history_2 = _b.sent();
            optimizedAppointment = __assign(__assign({}, appointmentData), {
              patient_id: patientId,
              preferred_time: appointmentData.appointment_time || history_2.preferred_times[0],
              notes: ""
                .concat(appointmentData.notes || "", " | Patient preferences: ")
                .concat(history_2.preferred_services.join(", ")),
            });
            return [
              4 /*yield*/,
              client_1.supabase.from("appointments").insert(optimizedAppointment).select().single(),
            ];
          case 2:
            (_a = _b.sent()), (appointment = _a.data), (error = _a.error);
            if (error) throw error;
            // Update patient's last interaction
            return [
              4 /*yield*/,
              client_1.supabase
                .from("patients")
                .update({
                  last_appointment_date: appointment.appointment_date,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", patientId),
            ];
          case 3:
            // Update patient's last interaction
            _b.sent();
            logger_1.logger.info(
              "Patient ".concat(patientId, " linked to appointment ").concat(appointment.id),
            );
            return [2 /*return*/, appointment];
          case 4:
            error_3 = _b.sent();
            logger_1.logger.error("Error linking patient to appointment:", error_3);
            throw new Error("Failed to link patient to appointment");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate time preferences based on appointment history
   */
  PatientAppointmentIntegration.calculateTimePreferences = function (appointments) {
    var timeSlots = {};
    appointments.forEach((apt) => {
      var hour = new Date(apt.appointment_date).getHours();
      var timeSlot = this.getTimeSlot(hour);
      timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
    });
    return Object.entries(timeSlots)
      .sort((_a, _b) => {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 3)
      .map((_a) => {
        var slot = _a[0];
        return slot;
      });
  };
  /**
   * Calculate service preferences based on appointment history
   */
  PatientAppointmentIntegration.calculateServicePreferences = (appointments) => {
    var services = {};
    appointments.forEach((apt) => {
      if (apt.service_type) {
        services[apt.service_type] = (services[apt.service_type] || 0) + 1;
      }
    });
    return Object.entries(services)
      .sort((_a, _b) => {
        var a = _a[1];
        var b = _b[1];
        return b - a;
      })
      .slice(0, 5)
      .map((_a) => {
        var service = _a[0];
        return service;
      });
  };
  /**
   * Calculate punctuality score based on check-in times
   */
  PatientAppointmentIntegration.calculatePunctualityScore = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, checkIns, error, punctualAppointments, error_4;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              client_1.supabase
                .from("appointment_check_ins")
                .select("check_in_time, scheduled_time")
                .eq("patient_id", patientId)
                .limit(20),
            ];
          case 1:
            (_a = _b.sent()), (checkIns = _a.data), (error = _a.error);
            if (error || !(checkIns === null || checkIns === void 0 ? void 0 : checkIns.length))
              return [2 /*return*/, 75]; // Default score
            punctualAppointments = checkIns.filter((checkIn) => {
              var scheduledTime = new Date(checkIn.scheduled_time);
              var checkInTime = new Date(checkIn.check_in_time);
              var diffMinutes = (checkInTime.getTime() - scheduledTime.getTime()) / (1000 * 60);
              return diffMinutes <= 15; // On time or up to 15 minutes late
            });
            return [2 /*return*/, (punctualAppointments.length / checkIns.length) * 100];
          case 2:
            error_4 = _b.sent();
            logger_1.logger.error("Error calculating punctuality score:", error_4);
            return [2 /*return*/, 75]; // Default score
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate loyalty index based on appointment patterns
   */
  PatientAppointmentIntegration.calculateLoyaltyIndex = function (history) {
    var factors = {
      totalAppointments: Math.min(history.total_appointments / 10, 1) * 30,
      attendanceRate:
        (history.completed_appointments / Math.max(history.total_appointments, 1)) * 40,
      averageRating: (history.average_rating / 5) * 20,
      consistency: this.calculateConsistency(history) * 10,
    };
    return Math.round(Object.values(factors).reduce((sum, factor) => sum + factor, 0));
  };
  /**
   * Calculate appointment consistency
   */
  PatientAppointmentIntegration.calculateConsistency = (history) => {
    if (history.appointments.length < 2) return 0;
    // Calculate average time between appointments
    var intervals = [];
    for (var i = 1; i < history.appointments.length; i++) {
      var current = new Date(history.appointments[i - 1].appointment_date);
      var previous = new Date(history.appointments[i].appointment_date);
      var daysDiff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      intervals.push(daysDiff);
    }
    // Calculate consistency (lower variance = higher consistency)
    var avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    var variance =
      intervals.reduce((sum, interval) => sum + (interval - avgInterval) ** 2, 0) /
      intervals.length;
    return Math.max(0, 1 - variance / (avgInterval * avgInterval));
  };
  /**
   * Identify risk factors based on appointment history
   */
  PatientAppointmentIntegration.identifyRiskFactors = (history, attendanceRate) => {
    var risks = [];
    if (attendanceRate < 70) {
      risks.push("Low attendance rate");
    }
    if (history.no_show_count > 2) {
      risks.push("Multiple no-shows");
    }
    if (history.average_rating < 3) {
      risks.push("Low satisfaction scores");
    }
    if (history.cancelled_appointments > history.completed_appointments) {
      risks.push("High cancellation rate");
    }
    var daysSinceLastAppointment = history.last_appointment_date
      ? (Date.now() - new Date(history.last_appointment_date).getTime()) / (1000 * 60 * 60 * 24)
      : 0;
    if (daysSinceLastAppointment > 180) {
      risks.push("Long absence from clinic");
    }
    return risks;
  };
  /**
   * Generate recommendations based on patient data
   */
  PatientAppointmentIntegration.generateRecommendations = (
    history,
    attendanceRate,
    satisfactionScore,
  ) => {
    var recommendations = [];
    if (attendanceRate < 80) {
      recommendations.push("Send appointment reminders 24h and 2h before");
    }
    if (history.preferred_times.length > 0) {
      recommendations.push(
        "Schedule during preferred times: ".concat(history.preferred_times.join(", ")),
      );
    }
    if (satisfactionScore < 70) {
      recommendations.push("Follow up after appointments to improve satisfaction");
    }
    if (history.no_show_count > 1) {
      recommendations.push("Require confirmation calls for future appointments");
    }
    if (history.preferred_services.length > 0) {
      recommendations.push(
        "Focus on preferred services: ".concat(history.preferred_services.slice(0, 2).join(", ")),
      );
    }
    return recommendations;
  };
  /**
   * Get time slot category from hour
   */
  PatientAppointmentIntegration.getTimeSlot = (hour) => {
    if (hour >= 8 && hour < 12) return "Morning (8-12)";
    if (hour >= 12 && hour < 17) return "Afternoon (12-17)";
    if (hour >= 17 && hour < 20) return "Evening (17-20)";
    return "Other";
  };
  return PatientAppointmentIntegration;
})();
exports.PatientAppointmentIntegration = PatientAppointmentIntegration;
exports.default = PatientAppointmentIntegration;
