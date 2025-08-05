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
exports.SchedulingAnalytics = void 0;
var client_1 = require("@/lib/supabase/client");
/**
 * Advanced Scheduling Analytics System
 * Provides comprehensive analytics, insights, and predictive capabilities
 * for clinic scheduling optimization and business intelligence
 */
var SchedulingAnalytics = /** @class */ (() => {
  function SchedulingAnalytics() {
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.supabase = (0, client_1.createClient)();
    this.cache = new Map();
  }
  /**
   * Get comprehensive scheduling metrics for dashboard
   */
  SchedulingAnalytics.prototype.getSchedulingMetrics = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        _a,
        appointments,
        error,
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        avgDuration,
        totalScheduledHours,
        totalUsedHours,
        utilizationRate,
        revenueGenerated,
        patientSatisfactionScore,
        staffEfficiencyScore,
        peakHours,
        bottleneckIdentified,
        metrics,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "metrics_".concat(JSON.stringify(filter));
            cached = this.getCachedData(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          *,\n          patients(id, name),\n          staff(id, name),\n          services(id, name, duration, price)\n        ",
                )
                .gte("scheduled_at", filter.startDate.toISOString())
                .lte("scheduled_at", filter.endDate.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error) throw error;
            totalAppointments =
              (appointments === null || appointments === void 0 ? void 0 : appointments.length) ||
              0;
            completedAppointments =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((a) => a.status === "completed").length) || 0;
            cancelledAppointments =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((a) => a.status === "cancelled").length) || 0;
            noShowAppointments =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.filter((a) => a.status === "no_show").length) || 0;
            avgDuration =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.reduce(
                    (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0),
                    0,
                  )) / totalAppointments || 0;
            totalScheduledHours = this.calculateTotalScheduledHours(filter);
            totalUsedHours =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.reduce(
                    (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0) / 60,
                    0,
                  )) || 0;
            utilizationRate =
              totalScheduledHours > 0 ? (totalUsedHours / totalScheduledHours) * 100 : 0;
            revenueGenerated =
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.reduce((sum, a) => {
                    var _a;
                    return (
                      sum + (((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) || 0)
                    );
                  }, 0)) || 0;
            return [4 /*yield*/, this.calculatePatientSatisfaction(filter)];
          case 3:
            patientSatisfactionScore = _b.sent();
            return [
              4 /*yield*/,
              this.calculateStaffEfficiency(filter),
              // Identify peak hours and bottlenecks
            ];
          case 4:
            staffEfficiencyScore = _b.sent();
            return [4 /*yield*/, this.identifyPeakHours(filter)];
          case 5:
            peakHours = _b.sent();
            return [4 /*yield*/, this.identifyBottlenecks(filter)];
          case 6:
            bottleneckIdentified = _b.sent();
            metrics = {
              totalAppointments: totalAppointments,
              completedAppointments: completedAppointments,
              cancelledAppointments: cancelledAppointments,
              noShowAppointments: noShowAppointments,
              averageAppointmentDuration: avgDuration,
              utilizationRate: utilizationRate,
              revenueGenerated: revenueGenerated,
              patientSatisfactionScore: patientSatisfactionScore,
              staffEfficiencyScore: staffEfficiencyScore,
              peakHours: peakHours,
              bottleneckIdentified: bottleneckIdentified,
            };
            this.setCachedData(cacheKey, metrics);
            return [2 /*return*/, metrics];
          case 7:
            error_1 = _b.sent();
            console.error("Error getting scheduling metrics:", error_1);
            throw new Error("Failed to retrieve scheduling metrics");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Analyze appointment patterns and trends
   */
  SchedulingAnalytics.prototype.getAppointmentPatterns = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, _a, appointments, error, patterns_1, result, error_2;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "patterns_".concat(JSON.stringify(filter));
            cached = this.getCachedData(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          scheduled_at,\n          actual_duration,\n          scheduled_duration,\n          status,\n          services(price)\n        ",
                )
                .gte("scheduled_at", filter.startDate.toISOString())
                .lte("scheduled_at", filter.endDate.toISOString()),
            ];
          case 2:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error) throw error;
            patterns_1 = new Map();
            appointments === null || appointments === void 0
              ? void 0
              : appointments.forEach((appointment) => {
                  var _a;
                  var date = new Date(appointment.scheduled_at);
                  var dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
                  var hour = date.getHours();
                  var key = "".concat(dayOfWeek, "_").concat(hour);
                  if (!patterns_1.has(key)) {
                    patterns_1.set(key, {
                      appointments: [],
                      totalDuration: 0,
                      cancelled: 0,
                      noShows: 0,
                      revenue: 0,
                    });
                  }
                  var pattern = patterns_1.get(key);
                  pattern.appointments.push(appointment);
                  pattern.totalDuration +=
                    appointment.actual_duration || appointment.scheduled_duration || 0;
                  if (appointment.status === "cancelled") pattern.cancelled++;
                  if (appointment.status === "no_show") pattern.noShows++;
                  pattern.revenue +=
                    ((_a = appointment.services) === null || _a === void 0 ? void 0 : _a.price) ||
                    0;
                });
            result = Array.from(patterns_1.entries()).map((_a) => {
              var _b;
              var key = _a[0],
                data = _a[1];
              var _c = key.split("_"),
                dayOfWeek = _c[0],
                hourStr = _c[1];
              var hour = parseInt(hourStr);
              var appointmentCount = data.appointments.length;
              return (
                (_b = {
                  dayOfWeek: dayOfWeek,
                  hour: hour,
                  appointmentCount: appointmentCount,
                  averageDuration: appointmentCount > 0 ? data.totalDuration / appointmentCount : 0,
                  cancellationRate:
                    appointmentCount > 0 ? (data.cancelled / appointmentCount) * 100 : 0,
                  noShowRate: appointmentCount > 0 ? (data.noShows / appointmentCount) * 100 : 0,
                  revenuePerHour: data.revenue,
                }),
                (_b.staffUtilization =
                  yield _this.calculateHourlyStaffUtilization(dayOfWeek, hour, filter)),
                _b
              );
            });
            this.setCachedData(cacheKey, result);
            return [2 /*return*/, result];
          case 3:
            error_2 = _b.sent();
            console.error("Error analyzing appointment patterns:", error_2);
            throw new Error("Failed to analyze appointment patterns");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate seasonal trends analysis
   */
  SchedulingAnalytics.prototype.getSeasonalTrends = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, _a, appointments, error, trends_1, result, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "trends_".concat(JSON.stringify(filter));
            cached = this.getCachedData(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          scheduled_at,\n          status,\n          services(price)\n        ",
                )
                .gte("scheduled_at", filter.startDate.toISOString())
                .lte("scheduled_at", filter.endDate.toISOString())
                .order("scheduled_at"),
            ];
          case 2:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error) throw error;
            trends_1 = this.groupByPeriod(appointments || [], filter.granularity);
            result = trends_1.map((trend, index) => {
              var previousTrend = index > 0 ? trends_1[index - 1] : null;
              var growthRate = previousTrend
                ? ((trend.appointmentVolume - previousTrend.appointmentVolume) /
                    previousTrend.appointmentVolume) *
                  100
                : 0;
              // Calculate seasonal index (current period vs average)
              var averageVolume =
                trends_1.reduce((sum, t) => sum + t.appointmentVolume, 0) / trends_1.length;
              var seasonalIndex = averageVolume > 0 ? trend.appointmentVolume / averageVolume : 1;
              return __assign(__assign({}, trend), {
                growthRate: growthRate,
                seasonalIndex: seasonalIndex,
              });
            });
            this.setCachedData(cacheKey, result);
            return [2 /*return*/, result];
          case 3:
            error_3 = _b.sent();
            console.error("Error analyzing seasonal trends:", error_3);
            throw new Error("Failed to analyze seasonal trends");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get staff performance analytics
   */
  SchedulingAnalytics.prototype.getStaffPerformance = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, _a, staffData, error, result, error_4;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "staff_performance_".concat(JSON.stringify(filter));
            cached = this.getCachedData(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("staff")
                .select(
                  "\n          id,\n          name,\n          appointments(\n            id,\n            scheduled_at,\n            actual_duration,\n            scheduled_duration,\n            status,\n            services(price),\n            patient_feedback(rating)\n          )\n        ",
                ),
            ];
          case 2:
            (_a = _b.sent()), (staffData = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              4 /*yield*/,
              Promise.all(
                (staffData || []).map((staff) =>
                  __awaiter(_this, void 0, void 0, function () {
                    var appointments,
                      completedAppointments,
                      totalDuration,
                      avgDuration,
                      utilizationRate,
                      ratings,
                      avgRating,
                      revenueGenerated,
                      efficiencyScore,
                      skillUtilizationRate,
                      workloadBalance;
                    var _a;
                    return __generator(this, function (_b) {
                      switch (_b.label) {
                        case 0:
                          appointments =
                            ((_a = staff.appointments) === null || _a === void 0
                              ? void 0
                              : _a.filter((a) => {
                                  var appointmentDate = new Date(a.scheduled_at);
                                  return (
                                    appointmentDate >= filter.startDate &&
                                    appointmentDate <= filter.endDate
                                  );
                                })) || [];
                          completedAppointments = appointments.filter(
                            (a) => a.status === "completed",
                          );
                          totalDuration = appointments.reduce(
                            (sum, a) => sum + (a.actual_duration || a.scheduled_duration || 0),
                            0,
                          );
                          avgDuration =
                            appointments.length > 0 ? totalDuration / appointments.length : 0;
                          return [
                            4 /*yield*/,
                            this.calculateStaffUtilization(staff.id, filter),
                            // Calculate patient satisfaction
                          ];
                        case 1:
                          utilizationRate = _b.sent();
                          ratings = appointments.flatMap((a) => {
                            var _a;
                            return (
                              ((_a = a.patient_feedback) === null || _a === void 0
                                ? void 0
                                : _a.map((f) => f.rating)) || []
                            );
                          });
                          avgRating =
                            ratings.length > 0
                              ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
                              : 0;
                          revenueGenerated = appointments.reduce((sum, a) => {
                            var _a;
                            return (
                              sum +
                              (((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) ||
                                0)
                            );
                          }, 0);
                          efficiencyScore =
                            appointments.length > 0
                              ? (completedAppointments.length / appointments.length) * 100
                              : 0;
                          return [4 /*yield*/, this.calculateSkillUtilization(staff.id, filter)];
                        case 2:
                          skillUtilizationRate = _b.sent();
                          return [4 /*yield*/, this.calculateWorkloadBalance(staff.id, filter)];
                        case 3:
                          workloadBalance = _b.sent();
                          return [
                            2 /*return*/,
                            {
                              staffId: staff.id,
                              staffName: staff.name,
                              appointmentsCompleted: completedAppointments.length,
                              averageAppointmentDuration: avgDuration,
                              utilizationRate: utilizationRate,
                              patientSatisfactionScore: avgRating,
                              revenueGenerated: revenueGenerated,
                              efficiencyScore: efficiencyScore,
                              skillUtilizationRate: skillUtilizationRate,
                              workloadBalance: workloadBalance,
                            },
                          ];
                      }
                    });
                  }),
                ),
              ),
            ];
          case 3:
            result = _b.sent();
            this.setCachedData(cacheKey, result);
            return [2 /*return*/, result];
          case 4:
            error_4 = _b.sent();
            console.error("Error getting staff performance:", error_4);
            throw new Error("Failed to retrieve staff performance data");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate revenue analytics and optimization insights
   */
  SchedulingAnalytics.prototype.getRevenueAnalytics = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        _a,
        appointments_1,
        error,
        totalRevenue,
        totalCost,
        appointmentCount,
        revenuePerAppointment,
        totalHours,
        revenuePerHour,
        uniqueStaff,
        revenuePerStaff,
        profitMargin,
        valueRanges,
        appointmentValueDistribution,
        treatmentRevenue_1,
        treatmentTypeRevenue,
        patientLifetimeValue,
        forecastedRevenue,
        result,
        error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "revenue_".concat(JSON.stringify(filter));
            cached = this.getCachedData(cacheKey);
            if (cached) return [2 /*return*/, cached];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select(
                  "\n          *,\n          services(id, name, price, cost),\n          patients(id, created_at)\n        ",
                )
                .gte("scheduled_at", filter.startDate.toISOString())
                .lte("scheduled_at", filter.endDate.toISOString())
                .eq("status", "completed"),
            ];
          case 2:
            (_a = _b.sent()), (appointments_1 = _a.data), (error = _a.error);
            if (error) throw error;
            totalRevenue =
              (appointments_1 === null || appointments_1 === void 0
                ? void 0
                : appointments_1.reduce((sum, a) => {
                    var _a;
                    return (
                      sum + (((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) || 0)
                    );
                  }, 0)) || 0;
            totalCost =
              (appointments_1 === null || appointments_1 === void 0
                ? void 0
                : appointments_1.reduce((sum, a) => {
                    var _a;
                    return (
                      sum + (((_a = a.services) === null || _a === void 0 ? void 0 : _a.cost) || 0)
                    );
                  }, 0)) || 0;
            appointmentCount =
              (appointments_1 === null || appointments_1 === void 0
                ? void 0
                : appointments_1.length) || 0;
            revenuePerAppointment = appointmentCount > 0 ? totalRevenue / appointmentCount : 0;
            totalHours = this.calculateTotalHours(filter);
            revenuePerHour = totalHours > 0 ? totalRevenue / totalHours : 0;
            uniqueStaff = new Set(
              appointments_1 === null || appointments_1 === void 0
                ? void 0
                : appointments_1.map((a) => a.staff_id),
            ).size;
            revenuePerStaff = uniqueStaff > 0 ? totalRevenue / uniqueStaff : 0;
            profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
            valueRanges = [
              { range: "$0-$100", min: 0, max: 100 },
              { range: "$100-$300", min: 100, max: 300 },
              { range: "$300-$500", min: 300, max: 500 },
              { range: "$500-$1000", min: 500, max: 1000 },
              { range: "$1000+", min: 1000, max: Infinity },
            ];
            appointmentValueDistribution = valueRanges.map((range) => {
              var appointmentsInRange =
                (appointments_1 === null || appointments_1 === void 0
                  ? void 0
                  : appointments_1.filter((a) => {
                      var _a;
                      var price =
                        ((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) || 0;
                      return price >= range.min && price < range.max;
                    })) || [];
              return {
                range: range.range,
                count: appointmentsInRange.length,
                revenue: appointmentsInRange.reduce((sum, a) => {
                  var _a;
                  return (
                    sum + (((_a = a.services) === null || _a === void 0 ? void 0 : _a.price) || 0)
                  );
                }, 0),
              };
            });
            treatmentRevenue_1 = new Map();
            appointments_1 === null || appointments_1 === void 0
              ? void 0
              : appointments_1.forEach((appointment) => {
                  var _a, _b;
                  var serviceName =
                    ((_a = appointment.services) === null || _a === void 0 ? void 0 : _a.name) ||
                    "Unknown";
                  var price =
                    ((_b = appointment.services) === null || _b === void 0 ? void 0 : _b.price) ||
                    0;
                  if (!treatmentRevenue_1.has(serviceName)) {
                    treatmentRevenue_1.set(serviceName, { revenue: 0, count: 0 });
                  }
                  var current = treatmentRevenue_1.get(serviceName);
                  current.revenue += price;
                  current.count += 1;
                });
            treatmentTypeRevenue = Array.from(treatmentRevenue_1.entries()).map((_a) => {
              var type = _a[0],
                data = _a[1];
              return {
                type: type,
                revenue: data.revenue,
                count: data.count,
              };
            });
            return [
              4 /*yield*/,
              this.calculatePatientLifetimeValue(filter),
              // Generate revenue forecast
            ];
          case 3:
            patientLifetimeValue = _b.sent();
            return [4 /*yield*/, this.forecastRevenue(filter)];
          case 4:
            forecastedRevenue = _b.sent();
            result = {
              totalRevenue: totalRevenue,
              revenuePerAppointment: revenuePerAppointment,
              revenuePerHour: revenuePerHour,
              revenuePerStaff: revenuePerStaff,
              profitMargin: profitMargin,
              appointmentValueDistribution: appointmentValueDistribution,
              treatmentTypeRevenue: treatmentTypeRevenue,
              patientLifetimeValue: patientLifetimeValue,
              forecastedRevenue: forecastedRevenue,
            };
            this.setCachedData(cacheKey, result);
            return [2 /*return*/, result];
          case 5:
            error_5 = _b.sent();
            console.error("Error generating revenue analytics:", error_5);
            throw new Error("Failed to generate revenue analytics");
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  SchedulingAnalytics.prototype.getCachedData = function (key) {
    var cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  };
  SchedulingAnalytics.prototype.setCachedData = function (key, data) {
    this.cache.set(key, { data: data, timestamp: Date.now() });
  };
  SchedulingAnalytics.prototype.calculateTotalScheduledHours = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating total scheduled hours
        // This would involve getting staff schedules and calculating available hours
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculatePatientSatisfaction = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating patient satisfaction score
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculateStaffEfficiency = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating staff efficiency score
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.identifyPeakHours = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for identifying peak hours
        return [2 /*return*/, []]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.identifyBottlenecks = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for identifying bottlenecks
        return [2 /*return*/, []]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculateHourlyStaffUtilization = function (
    dayOfWeek,
    hour,
    filter,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating hourly staff utilization
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.groupByPeriod = (appointments, granularity) => {
    // Implementation for grouping appointments by period
    return []; // Placeholder
  };
  SchedulingAnalytics.prototype.calculateStaffUtilization = function (staffId, filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating staff utilization
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculateSkillUtilization = function (staffId, filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating skill utilization
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculateWorkloadBalance = function (staffId, filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating workload balance
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.calculateTotalHours = (filter) => {
    // Implementation for calculating total hours in period
    var diffTime = Math.abs(filter.endDate.getTime() - filter.startDate.getTime());
    var diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  };
  SchedulingAnalytics.prototype.calculatePatientLifetimeValue = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for calculating patient lifetime value
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  SchedulingAnalytics.prototype.forecastRevenue = function (filter) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation for revenue forecasting
        return [2 /*return*/, 0]; // Placeholder
      });
    });
  };
  return SchedulingAnalytics;
})();
exports.SchedulingAnalytics = SchedulingAnalytics;
exports.default = SchedulingAnalytics;
