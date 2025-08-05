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
exports.createkpiCalculationService =
  exports.KPICalculationResultSchema =
  exports.KPIValueSchema =
  exports.KPIDefinitionSchema =
    void 0;
var zod_1 = require("zod");
var client_1 = require("@/lib/supabase/client");
var logger_1 = require("@/lib/logger");
// Types and Schemas
exports.KPIDefinitionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  name: zod_1.z.string().min(1).max(255),
  category: zod_1.z.enum(["financial", "operational", "patient", "staff"]),
  calculationMethod: zod_1.z.string().min(1),
  targetValue: zod_1.z.number().optional(),
  warningThreshold: zod_1.z.number().optional(),
  criticalThreshold: zod_1.z.number().optional(),
  unit: zod_1.z.string().max(50).optional(),
  isActive: zod_1.z.boolean().default(true),
  createdAt: zod_1.z.string().datetime(),
  updatedAt: zod_1.z.string().datetime(),
});
exports.KPIValueSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  kpiId: zod_1.z.string().uuid(),
  clinicId: zod_1.z.string().uuid(),
  periodStart: zod_1.z.string().datetime(),
  periodEnd: zod_1.z.string().datetime(),
  value: zod_1.z.number(),
  previousValue: zod_1.z.number().optional(),
  targetValue: zod_1.z.number().optional(),
  status: zod_1.z.enum(["normal", "warning", "critical"]).default("normal"),
  calculatedAt: zod_1.z.string().datetime(),
});
exports.KPICalculationResultSchema = zod_1.z.object({
  kpi: exports.KPIDefinitionSchema,
  currentValue: zod_1.z.number(),
  previousValue: zod_1.z.number().optional(),
  targetValue: zod_1.z.number().optional(),
  variance: zod_1.z.number().optional(),
  variancePercent: zod_1.z.number().optional(),
  status: zod_1.z.enum(["normal", "warning", "critical"]),
  trend: zod_1.z.enum(["up", "down", "stable"]).optional(),
  formattedValue: zod_1.z.string(),
  formattedPreviousValue: zod_1.z.string().optional(),
  calculatedAt: zod_1.z.string().datetime(),
});
// KPI Calculation Service
var createkpiCalculationService = /** @class */ (() => {
  function createkpiCalculationService() {
    this.supabase = (0, client_1.createClient)();
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }
  /**
   * Calculate all KPIs for a clinic
   */
  createkpiCalculationService.prototype.calculateClinicKPIs = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var period,
        cacheKey,
        cached,
        _a,
        kpiDefinitions,
        error,
        results,
        _i,
        kpiDefinitions_1,
        kpiDef,
        result,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            period = this.normalizePeriod(periodStart, periodEnd);
            cacheKey = "clinic_"
              .concat(clinicId, "_")
              .concat(period.start.toISOString(), "_")
              .concat(period.end.toISOString());
            cached = this.getCachedResult(cacheKey);
            if (cached) {
              return [2 /*return*/, [cached]];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("kpi_definitions")
                .select("*")
                .eq("clinic_id", clinicId)
                .eq("is_active", true)
                .order("category", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (kpiDefinitions = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error fetching KPI definitions:", error);
              return [2 /*return*/, []];
            }
            results = [];
            (_i = 0), (kpiDefinitions_1 = kpiDefinitions);
            _b.label = 2;
          case 2:
            if (!(_i < kpiDefinitions_1.length)) return [3 /*break*/, 5];
            kpiDef = kpiDefinitions_1[_i];
            return [4 /*yield*/, this.calculateSingleKPI(kpiDef, period.start, period.end)];
          case 3:
            result = _b.sent();
            if (result) {
              results.push(result);
              this.setCachedResult(
                "kpi_".concat(kpiDef.id, "_").concat(period.start.toISOString()),
                result,
              );
            }
            _b.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, results];
          case 6:
            error_1 = _b.sent();
            logger_1.logger.error("Error calculating clinic KPIs:", error_1);
            return [2 /*return*/, []];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate single KPI
   */
  createkpiCalculationService.prototype.calculateSingleKPI = function (
    kpiDefinition,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        currentValue,
        previousPeriod,
        previousValue,
        variance,
        variancePercent,
        trend,
        status_1,
        formattedValue,
        formattedPreviousValue,
        result,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            cacheKey = "kpi_".concat(kpiDefinition.id, "_").concat(periodStart.toISOString());
            cached = this.getCachedResult(cacheKey);
            if (cached) {
              return [2 /*return*/, cached];
            }
            return [4 /*yield*/, this.executeKPICalculation(kpiDefinition, periodStart, periodEnd)];
          case 1:
            currentValue = _a.sent();
            if (currentValue === null) {
              return [2 /*return*/, null];
            }
            previousPeriod = this.getPreviousPeriod(periodStart, periodEnd);
            return [
              4 /*yield*/,
              this.executeKPICalculation(kpiDefinition, previousPeriod.start, previousPeriod.end),
            ];
          case 2:
            previousValue = _a.sent();
            variance = previousValue !== null ? currentValue - previousValue : undefined;
            variancePercent =
              previousValue !== null && previousValue !== 0
                ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
                : undefined;
            trend = this.calculateTrend(currentValue, previousValue);
            status_1 = this.calculateStatus(currentValue, kpiDefinition);
            formattedValue = this.formatKPIValue(currentValue, kpiDefinition.unit);
            formattedPreviousValue =
              previousValue !== null
                ? this.formatKPIValue(previousValue, kpiDefinition.unit)
                : undefined;
            result = {
              kpi: {
                id: kpiDefinition.id,
                clinicId: kpiDefinition.clinic_id,
                name: kpiDefinition.name,
                category: kpiDefinition.category,
                calculationMethod: kpiDefinition.calculation_method,
                targetValue: kpiDefinition.target_value,
                warningThreshold: kpiDefinition.warning_threshold,
                criticalThreshold: kpiDefinition.critical_threshold,
                unit: kpiDefinition.unit,
                isActive: kpiDefinition.is_active,
                createdAt: kpiDefinition.created_at,
                updatedAt: kpiDefinition.updated_at,
              },
              currentValue: currentValue,
              previousValue: previousValue,
              targetValue: kpiDefinition.target_value,
              variance: variance,
              variancePercent: variancePercent,
              status: status_1,
              trend: trend,
              formattedValue: formattedValue,
              formattedPreviousValue: formattedPreviousValue,
              calculatedAt: new Date().toISOString(),
            };
            // Store in database
            return [4 /*yield*/, this.storeKPIValue(result)];
          case 3:
            // Store in database
            _a.sent();
            // Cache result
            this.setCachedResult(cacheKey, result);
            return [2 /*return*/, result];
          case 4:
            error_2 = _a.sent();
            logger_1.logger.error("Error calculating single KPI:", error_2);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Execute KPI calculation based on method
   */
  createkpiCalculationService.prototype.executeKPICalculation = function (
    kpiDefinition,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var method, clinicId, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 25, , 26]);
            method = kpiDefinition.calculation_method;
            clinicId = kpiDefinition.clinic_id;
            _a = method;
            switch (_a) {
              case "financial.monthly_revenue":
                return [3 /*break*/, 1];
              case "financial.average_ticket":
                return [3 /*break*/, 3];
              case "financial.profit_margin":
                return [3 /*break*/, 5];
              case "patients.new_patients":
                return [3 /*break*/, 7];
              case "patients.retention_rate":
                return [3 /*break*/, 9];
              case "patients.satisfaction_score":
                return [3 /*break*/, 11];
              case "operations.occupancy_rate":
                return [3 /*break*/, 13];
              case "operations.no_show_rate":
                return [3 /*break*/, 15];
              case "operations.average_wait_time":
                return [3 /*break*/, 17];
              case "staff.utilization_rate":
                return [3 /*break*/, 19];
              case "staff.productivity_score":
                return [3 /*break*/, 21];
            }
            return [3 /*break*/, 23];
          case 1:
            return [4 /*yield*/, this.calculateMonthlyRevenue(clinicId, periodStart, periodEnd)];
          case 2:
            return [2 /*return*/, _b.sent()];
          case 3:
            return [4 /*yield*/, this.calculateAverageTicket(clinicId, periodStart, periodEnd)];
          case 4:
            return [2 /*return*/, _b.sent()];
          case 5:
            return [4 /*yield*/, this.calculateProfitMargin(clinicId, periodStart, periodEnd)];
          case 6:
            return [2 /*return*/, _b.sent()];
          case 7:
            return [4 /*yield*/, this.calculateNewPatients(clinicId, periodStart, periodEnd)];
          case 8:
            return [2 /*return*/, _b.sent()];
          case 9:
            return [4 /*yield*/, this.calculateRetentionRate(clinicId, periodStart, periodEnd)];
          case 10:
            return [2 /*return*/, _b.sent()];
          case 11:
            return [4 /*yield*/, this.calculateSatisfactionScore(clinicId, periodStart, periodEnd)];
          case 12:
            return [2 /*return*/, _b.sent()];
          case 13:
            return [4 /*yield*/, this.calculateOccupancyRate(clinicId, periodStart, periodEnd)];
          case 14:
            return [2 /*return*/, _b.sent()];
          case 15:
            return [4 /*yield*/, this.calculateNoShowRate(clinicId, periodStart, periodEnd)];
          case 16:
            return [2 /*return*/, _b.sent()];
          case 17:
            return [4 /*yield*/, this.calculateAverageWaitTime(clinicId, periodStart, periodEnd)];
          case 18:
            return [2 /*return*/, _b.sent()];
          case 19:
            return [4 /*yield*/, this.calculateStaffUtilization(clinicId, periodStart, periodEnd)];
          case 20:
            return [2 /*return*/, _b.sent()];
          case 21:
            return [4 /*yield*/, this.calculateStaffProductivity(clinicId, periodStart, periodEnd)];
          case 22:
            return [2 /*return*/, _b.sent()];
          case 23:
            logger_1.logger.warn("Unknown KPI calculation method: ".concat(method));
            return [2 /*return*/, null];
          case 24:
            return [3 /*break*/, 26];
          case 25:
            error_3 = _b.sent();
            logger_1.logger.error("Error executing KPI calculation:", error_3);
            return [2 /*return*/, null];
          case 26:
            return [2 /*return*/];
        }
      });
    });
  };
  // Financial KPI Calculations
  createkpiCalculationService.prototype.calculateMonthlyRevenue = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payments")
                .select("amount")
                .eq("clinic_id", clinicId)
                .eq("status", "completed")
                .gte("created_at", periodStart.toISOString())
                .lte("created_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error calculating monthly revenue:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, data.reduce((sum, payment) => sum + (payment.amount || 0), 0)];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateAverageTicket = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, total;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("payments")
                .select("amount")
                .eq("clinic_id", clinicId)
                .eq("status", "completed")
                .gte("created_at", periodStart.toISOString())
                .lte("created_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data.length) {
              return [2 /*return*/, 0];
            }
            total = data.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            return [2 /*return*/, total / data.length];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateProfitMargin = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var revenue, estimatedCosts, profit;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.calculateMonthlyRevenue(clinicId, periodStart, periodEnd)];
          case 1:
            revenue = _a.sent();
            estimatedCosts = revenue * 0.3;
            profit = revenue - estimatedCosts;
            return [2 /*return*/, revenue > 0 ? (profit / revenue) * 100 : 0];
        }
      });
    });
  };
  // Patient KPI Calculations
  createkpiCalculationService.prototype.calculateNewPatients = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("id")
                .eq("clinic_id", clinicId)
                .gte("created_at", periodStart.toISOString())
                .lte("created_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              logger_1.logger.error("Error calculating new patients:", error);
              return [2 /*return*/, 0];
            }
            return [2 /*return*/, data.length];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateRetentionRate = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var previousPeriod,
        _a,
        currentPatients,
        currentError,
        _b,
        previousPatients,
        previousError,
        currentPatientIds,
        previousPatientIds,
        retainedPatients;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            previousPeriod = this.getPreviousPeriod(periodStart, periodEnd);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("patient_id")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _c.sent()), (currentPatients = _a.data), (currentError = _a.error);
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("patient_id")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", previousPeriod.start.toISOString())
                .lte("scheduled_at", previousPeriod.end.toISOString()),
            ];
          case 2:
            (_b = _c.sent()), (previousPatients = _b.data), (previousError = _b.error);
            if (currentError || previousError || !previousPatients.length) {
              return [2 /*return*/, 0];
            }
            currentPatientIds = new Set(currentPatients.map((p) => p.patient_id));
            previousPatientIds = new Set(previousPatients.map((p) => p.patient_id));
            retainedPatients = Array.from(previousPatientIds).filter((id) =>
              currentPatientIds.has(id),
            ).length;
            return [2 /*return*/, (retainedPatients / previousPatientIds.size) * 100];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateSatisfactionScore = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, appointments, error, completedAppointments, completionRate;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("status")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error || !appointments.length) {
              return [2 /*return*/, 0];
            }
            completedAppointments = appointments.filter((a) => a.status === "completed").length;
            completionRate = (completedAppointments / appointments.length) * 100;
            // Convert completion rate to satisfaction score (simplified)
            return [2 /*return*/, Math.min(completionRate * 0.05, 5)]; // Scale to 0-5
        }
      });
    });
  };
  // Operational KPI Calculations
  createkpiCalculationService.prototype.calculateOccupancyRate = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, appointments, error, totalSlots, bookedSlots;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("status, duration")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error) {
              return [2 /*return*/, 0];
            }
            totalSlots = appointments.length;
            bookedSlots = appointments.filter((a) =>
              ["scheduled", "confirmed", "completed"].includes(a.status),
            ).length;
            return [2 /*return*/, totalSlots > 0 ? (bookedSlots / totalSlots) * 100 : 0];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateNoShowRate = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, appointments, error, noShows;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("status")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error || !appointments.length) {
              return [2 /*return*/, 0];
            }
            noShows = appointments.filter((a) => a.status === "no_show").length;
            return [2 /*return*/, (noShows / appointments.length) * 100];
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateAverageWaitTime = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, appointments, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("scheduled_at, duration")
                .eq("clinic_id", clinicId)
                .eq("status", "completed")
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString())
                .order("scheduled_at"),
            ];
          case 1:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error || !appointments.length) {
              return [2 /*return*/, 0];
            }
            // Simplified calculation - average 5 minutes wait time
            return [2 /*return*/, 5];
        }
      });
    });
  };
  // Staff KPI Calculations
  createkpiCalculationService.prototype.calculateStaffUtilization = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var occupancyRate;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.calculateOccupancyRate(clinicId, periodStart, periodEnd)];
          case 1:
            occupancyRate = _a.sent();
            return [2 /*return*/, occupancyRate * 0.9]; // Assuming 90% correlation
        }
      });
    });
  };
  createkpiCalculationService.prototype.calculateStaffProductivity = function (
    clinicId,
    periodStart,
    periodEnd,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, appointments, error, completedAppointments;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("status, staff_id")
                .eq("clinic_id", clinicId)
                .gte("scheduled_at", periodStart.toISOString())
                .lte("scheduled_at", periodEnd.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (appointments = _a.data), (error = _a.error);
            if (error || !appointments.length) {
              return [2 /*return*/, 0];
            }
            completedAppointments = appointments.filter((a) => a.status === "completed").length;
            return [2 /*return*/, (completedAppointments / appointments.length) * 100];
        }
      });
    });
  };
  // Helper methods
  createkpiCalculationService.prototype.normalizePeriod = (start, end) => {
    var now = new Date();
    var defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return {
      start: start || defaultStart,
      end: end || defaultEnd,
    };
  };
  createkpiCalculationService.prototype.getPreviousPeriod = (start, end) => {
    var duration = end.getTime() - start.getTime();
    return {
      start: new Date(start.getTime() - duration),
      end: new Date(start.getTime() - 1),
    };
  };
  createkpiCalculationService.prototype.calculateTrend = (current, previous) => {
    if (previous === null) return "stable";
    if (current > previous) return "up";
    if (current < previous) return "down";
    return "stable";
  };
  createkpiCalculationService.prototype.calculateStatus = (value, kpiDefinition) => {
    if (kpiDefinition.critical_threshold !== null) {
      if (value <= kpiDefinition.critical_threshold) return "critical";
    }
    if (kpiDefinition.warning_threshold !== null) {
      if (value <= kpiDefinition.warning_threshold) return "warning";
    }
    return "normal";
  };
  createkpiCalculationService.prototype.formatKPIValue = (value, unit) => {
    switch (unit) {
      case "currency":
      case "R$":
        return new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(value);
      case "percent":
      case "%":
        return "".concat(value.toFixed(1), "%");
      case "decimal":
        return value.toFixed(2);
      case "count":
      case "number":
        return Math.round(value).toString();
      default:
        return value.toString();
    }
  };
  createkpiCalculationService.prototype.storeKPIValue = function (result) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("kpi_values").upsert(
                {
                  id: crypto.randomUUID(),
                  kpi_id: result.kpi.id,
                  clinic_id: result.kpi.clinicId,
                  period_start: new Date().toISOString(), // This should be the actual period
                  period_end: new Date().toISOString(),
                  value: result.currentValue,
                  previous_value: result.previousValue,
                  target_value: result.targetValue,
                  status: result.status,
                  calculated_at: result.calculatedAt,
                },
                {
                  onConflict: "kpi_id,period_start,period_end",
                },
              ),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            logger_1.logger.error("Error storing KPI value:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Cache management
  createkpiCalculationService.prototype.getCachedResult = function (key) {
    var expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  };
  createkpiCalculationService.prototype.setCachedResult = function (key, result) {
    this.cache.set(key, result);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  };
  /**
   * Clear all cached results
   */
  createkpiCalculationService.prototype.clearCache = function () {
    this.cache.clear();
    this.cacheExpiry.clear();
  };
  /**
   * Get real-time KPI updates for dashboard
   */
  createkpiCalculationService.prototype.getRealTimeKPIs = function (clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.calculateClinicKPIs(clinicId)];
          case 1:
            return [2 /*return*/, _a.sent()];
        }
      });
    });
  };
  return createkpiCalculationService;
})();
exports.createkpiCalculationService = createkpiCalculationService;
// Export singleton instance
