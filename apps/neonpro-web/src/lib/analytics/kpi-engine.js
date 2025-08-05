"use strict";
// KPI Calculation and Monitoring Engine
// Description: High-performance KPI calculation engine with real-time monitoring
// Author: Dev Agent
// Date: 2025-01-26
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
exports.kpiEngine = exports.KPIEngine = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var KPIEngine = /** @class */ (function () {
  function KPIEngine() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    this.cache = new Map();
  }
  // Core KPI Calculation Methods
  KPIEngine.prototype.calculateKPIs = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, kpisToCalculate, _a, results, calculations, calculationResults, error_1;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 11, , 12]);
            if (!request.kpi_ids) return [3 /*break*/, 3];
            return [4 /*yield*/, this.getKPIsByIds(request.kpi_ids)];
          case 2:
            _a = _b.sent();
            return [3 /*break*/, 5];
          case 3:
            return [4 /*yield*/, this.getAllKPIs()];
          case 4:
            _a = _b.sent();
            _b.label = 5;
          case 5:
            kpisToCalculate = _a;
            results = [];
            calculations = kpisToCalculate.map(function (kpi) {
              return _this.calculateSingleKPI(kpi, request);
            });
            return [4 /*yield*/, Promise.all(calculations)];
          case 6:
            calculationResults = _b.sent();
            results.push.apply(results, calculationResults);
            if (!!request.force_recalculation) return [3 /*break*/, 9];
            return [4 /*yield*/, this.updateKPIValues(results)];
          case 7:
            _b.sent();
            return [4 /*yield*/, this.recordKPIHistory(results)];
          case 8:
            _b.sent();
            _b.label = 9;
          case 9:
            // Check thresholds and generate alerts
            return [4 /*yield*/, this.checkThresholds(results)];
          case 10:
            // Check thresholds and generate alerts
            _b.sent();
            console.log("KPI calculation completed in ".concat(Date.now() - startTime, "ms"));
            return [2 /*return*/, results];
          case 11:
            error_1 = _b.sent();
            console.error("KPI calculation error:", error_1);
            throw error_1;
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  KPIEngine.prototype.calculateSingleKPI = function (kpi, request) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        start_date,
        end_date,
        calculatedValue,
        dataPointsUsed,
        breakdown,
        _b,
        previousValue,
        _c,
        variancePercent,
        trendDirection,
        error_2;
      var _d, _e, _f, _g;
      return __generator(this, function (_h) {
        switch (_h.label) {
          case 0:
            (_a = request.time_period), (start_date = _a.start_date), (end_date = _a.end_date);
            calculatedValue = 0;
            dataPointsUsed = 0;
            breakdown = [];
            _h.label = 1;
          case 1:
            _h.trys.push([1, 14, , 15]);
            _b = kpi.kpi_category;
            switch (_b) {
              case "revenue":
                return [3 /*break*/, 2];
              case "profitability":
                return [3 /*break*/, 4];
              case "operational":
                return [3 /*break*/, 6];
              case "financial_health":
                return [3 /*break*/, 8];
            }
            return [3 /*break*/, 10];
          case 2:
            return [
              4 /*yield*/,
              this.calculateRevenueKPI(kpi, start_date, end_date, request.filters),
            ];
          case 3:
            (_d = _h.sent()),
              (calculatedValue = _d.value),
              (dataPointsUsed = _d.dataPoints),
              (breakdown = _d.breakdown);
            return [3 /*break*/, 10];
          case 4:
            return [
              4 /*yield*/,
              this.calculateProfitabilityKPI(kpi, start_date, end_date, request.filters),
            ];
          case 5:
            (_e = _h.sent()),
              (calculatedValue = _e.value),
              (dataPointsUsed = _e.dataPoints),
              (breakdown = _e.breakdown);
            return [3 /*break*/, 10];
          case 6:
            return [
              4 /*yield*/,
              this.calculateOperationalKPI(kpi, start_date, end_date, request.filters),
            ];
          case 7:
            (_f = _h.sent()),
              (calculatedValue = _f.value),
              (dataPointsUsed = _f.dataPoints),
              (breakdown = _f.breakdown);
            return [3 /*break*/, 10];
          case 8:
            return [
              4 /*yield*/,
              this.calculateFinancialHealthKPI(kpi, start_date, end_date, request.filters),
            ];
          case 9:
            (_g = _h.sent()),
              (calculatedValue = _g.value),
              (dataPointsUsed = _g.dataPoints),
              (breakdown = _g.breakdown);
            return [3 /*break*/, 10];
          case 10:
            if (!request.include_variance) return [3 /*break*/, 12];
            return [4 /*yield*/, this.getPreviousPeriodValue(kpi, start_date, end_date)];
          case 11:
            _c = _h.sent();
            return [3 /*break*/, 13];
          case 12:
            _c = undefined;
            _h.label = 13;
          case 13:
            previousValue = _c;
            variancePercent = previousValue
              ? ((calculatedValue - previousValue) / previousValue) * 100
              : undefined;
            trendDirection = this.determineTrendDirection(calculatedValue, previousValue);
            return [
              2 /*return*/,
              {
                kpi_id: kpi.id,
                kpi_name: kpi.kpi_name,
                calculated_value: calculatedValue,
                previous_value: previousValue,
                variance_percent: variancePercent,
                trend_direction: trendDirection,
                calculation_timestamp: new Date().toISOString(),
                data_points_used: dataPointsUsed,
                confidence_score: this.calculateConfidenceScore(dataPointsUsed, kpi.kpi_category),
                breakdown: breakdown,
              },
            ];
          case 14:
            error_2 = _h.sent();
            console.error("Error calculating KPI ".concat(kpi.kpi_name, ":"), error_2);
            return [
              2 /*return*/,
              {
                kpi_id: kpi.id,
                kpi_name: kpi.kpi_name,
                calculated_value: 0,
                trend_direction: "stable",
                calculation_timestamp: new Date().toISOString(),
                data_points_used: 0,
                confidence_score: 0,
              },
            ];
          case 15:
            return [2 /*return*/];
        }
      });
    });
  };
  // Revenue KPI Calculations
  KPIEngine.prototype.calculateRevenueKPI = function (kpi, startDate, endDate, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        query,
        _a,
        invoices,
        error,
        value,
        breakdown,
        serviceBreakdown,
        patients,
        totalRevenue,
        result;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            cacheKey = "revenue_".concat(kpi.kpi_name, "_").concat(startDate, "_").concat(endDate);
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            query = this.supabase
              .from("invoices")
              .select("amount, created_at, service_type")
              .eq("status", "paid")
              .gte("created_at", startDate)
              .lte("created_at", endDate);
            if (
              (_b = filters === null || filters === void 0 ? void 0 : filters.service_types) ===
                null || _b === void 0
                ? void 0
                : _b.length
            ) {
              query = query.in("service_type", filters.service_types);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (invoices = _a.data), (error = _a.error);
            if (error) throw error;
            value = 0;
            breakdown = [];
            if (!(kpi.kpi_name === "Total Revenue")) return [3 /*break*/, 2];
            value = invoices.reduce(function (sum, inv) {
              return sum + inv.amount;
            }, 0);
            serviceBreakdown = invoices.reduce(function (acc, inv) {
              acc[inv.service_type] = (acc[inv.service_type] || 0) + inv.amount;
              return acc;
            }, {});
            Object.entries(serviceBreakdown).forEach(function (_a) {
              var service = _a[0],
                amount = _a[1];
              breakdown.push({
                dimension: service,
                value: amount,
                percentage: (amount / value) * 100,
              });
            });
            return [3 /*break*/, 4];
          case 2:
            if (!(kpi.kpi_name === "Revenue Per Patient")) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("id")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 3:
            patients = _c.sent().data;
            totalRevenue = invoices.reduce(function (sum, inv) {
              return sum + inv.amount;
            }, 0);
            value = (patients === null || patients === void 0 ? void 0 : patients.length)
              ? totalRevenue / patients.length
              : 0;
            _c.label = 4;
          case 4:
            result = { value: value, dataPoints: invoices.length, breakdown: breakdown };
            this.setCache(cacheKey, result);
            return [2 /*return*/, result];
        }
      });
    });
  };
  // Profitability KPI Calculations
  KPIEngine.prototype.calculateProfitabilityKPI = function (kpi, startDate, endDate, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        invoices,
        expenses,
        totalRevenue,
        totalDirectCosts,
        totalExpenses,
        value,
        breakdown,
        netProfit,
        expenseBreakdown,
        result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cacheKey = "profitability_"
              .concat(kpi.kpi_name, "_")
              .concat(startDate, "_")
              .concat(endDate);
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .select("amount, direct_costs, created_at")
                .eq("status", "paid")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 1:
            invoices = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("expenses")
                .select("amount, category, created_at")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 2:
            expenses = _a.sent().data;
            totalRevenue =
              (invoices === null || invoices === void 0
                ? void 0
                : invoices.reduce(function (sum, inv) {
                    return sum + inv.amount;
                  }, 0)) || 0;
            totalDirectCosts =
              (invoices === null || invoices === void 0
                ? void 0
                : invoices.reduce(function (sum, inv) {
                    return sum + (inv.direct_costs || 0);
                  }, 0)) || 0;
            totalExpenses =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce(function (sum, exp) {
                    return sum + exp.amount;
                  }, 0)) || 0;
            value = 0;
            breakdown = [];
            if (kpi.kpi_name === "Gross Profit Margin") {
              value = totalRevenue ? ((totalRevenue - totalDirectCosts) / totalRevenue) * 100 : 0;
            } else if (kpi.kpi_name === "EBITDA") {
              value = totalRevenue - totalDirectCosts - totalExpenses;
            } else if (kpi.kpi_name === "Net Profit Margin") {
              netProfit = totalRevenue - totalDirectCosts - totalExpenses;
              value = totalRevenue ? (netProfit / totalRevenue) * 100 : 0;
            }
            expenseBreakdown =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce(function (acc, exp) {
                    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
                    return acc;
                  }, {})) || {};
            Object.entries(expenseBreakdown).forEach(function (_a) {
              var category = _a[0],
                amount = _a[1];
              breakdown.push({
                dimension: category,
                value: amount,
                percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0,
              });
            });
            result = {
              value: value,
              dataPoints:
                ((invoices === null || invoices === void 0 ? void 0 : invoices.length) || 0) +
                ((expenses === null || expenses === void 0 ? void 0 : expenses.length) || 0),
              breakdown: breakdown,
            };
            this.setCache(cacheKey, result);
            return [2 /*return*/, result];
        }
      });
    });
  };
  // Operational KPI Calculations
  KPIEngine.prototype.calculateOperationalKPI = function (kpi, startDate, endDate, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        value,
        dataPoints,
        breakdown,
        patients,
        appointments,
        returningPatients,
        totalPatients,
        appointments,
        totalSlots,
        bookedSlots,
        expenses,
        newPatients,
        marketingCosts,
        newPatientCount,
        result;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "operational_"
              .concat(kpi.kpi_name, "_")
              .concat(startDate, "_")
              .concat(endDate);
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            value = 0;
            dataPoints = 0;
            breakdown = [];
            if (!(kpi.kpi_name === "Patient Retention Rate")) return [3 /*break*/, 3];
            return [4 /*yield*/, this.supabase.from("patients").select("id, created_at")];
          case 1:
            patients = _b.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("patient_id, created_at")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 2:
            appointments = _b.sent().data;
            returningPatients = new Set(
              (appointments === null || appointments === void 0
                ? void 0
                : appointments.map(function (a) {
                    return a.patient_id;
                  })) || [],
            );
            totalPatients =
              (patients === null || patients === void 0 ? void 0 : patients.length) || 0;
            value = totalPatients ? (returningPatients.size / totalPatients) * 100 : 0;
            dataPoints = totalPatients;
            return [3 /*break*/, 8];
          case 3:
            if (!(kpi.kpi_name === "Appointment Utilization")) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.supabase
                .from("appointments")
                .select("id, status")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 4:
            appointments = _b.sent().data;
            totalSlots =
              (appointments === null || appointments === void 0 ? void 0 : appointments.length) ||
              0;
            bookedSlots =
              ((_a =
                appointments === null || appointments === void 0
                  ? void 0
                  : appointments.filter(function (a) {
                      return a.status !== "cancelled";
                    })) === null || _a === void 0
                ? void 0
                : _a.length) || 0;
            value = totalSlots ? (bookedSlots / totalSlots) * 100 : 0;
            dataPoints = totalSlots;
            return [3 /*break*/, 8];
          case 5:
            if (!(kpi.kpi_name === "Cost Per Patient Acquisition")) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.supabase
                .from("expenses")
                .select("amount")
                .eq("category", "marketing")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 6:
            expenses = _b.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("patients")
                .select("id")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 7:
            newPatients = _b.sent().data;
            marketingCosts =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce(function (sum, exp) {
                    return sum + exp.amount;
                  }, 0)) || 0;
            newPatientCount =
              (newPatients === null || newPatients === void 0 ? void 0 : newPatients.length) || 0;
            value = newPatientCount ? marketingCosts / newPatientCount : 0;
            dataPoints = newPatientCount;
            _b.label = 8;
          case 8:
            result = { value: value, dataPoints: dataPoints, breakdown: breakdown };
            this.setCache(cacheKey, result);
            return [2 /*return*/, result];
        }
      });
    });
  };
  // Financial Health KPI Calculations
  KPIEngine.prototype.calculateFinancialHealthKPI = function (kpi, startDate, endDate, filters) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey,
        cached,
        value,
        dataPoints,
        breakdown,
        revenue,
        expenses,
        operatingCashFlow,
        monthlyExpenses,
        currentLiabilities,
        invoices,
        totalRevenue,
        pendingReceivables,
        result;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "financial_health_"
              .concat(kpi.kpi_name, "_")
              .concat(startDate, "_")
              .concat(endDate);
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            value = 0;
            dataPoints = 0;
            breakdown = [];
            if (!(kpi.kpi_name === "Cash Flow Ratio")) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .select("amount")
                .eq("status", "paid")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 1:
            revenue = _b.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("expenses")
                .select("amount")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 2:
            expenses = _b.sent().data;
            operatingCashFlow =
              ((revenue === null || revenue === void 0
                ? void 0
                : revenue.reduce(function (sum, r) {
                    return sum + r.amount;
                  }, 0)) || 0) -
              ((expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce(function (sum, e) {
                    return sum + e.amount;
                  }, 0)) || 0);
            monthlyExpenses =
              (expenses === null || expenses === void 0
                ? void 0
                : expenses.reduce(function (sum, e) {
                    return sum + e.amount;
                  }, 0)) || 0;
            currentLiabilities = monthlyExpenses * 0.3;
            value = currentLiabilities ? operatingCashFlow / currentLiabilities : 0;
            dataPoints =
              ((revenue === null || revenue === void 0 ? void 0 : revenue.length) || 0) +
              ((expenses === null || expenses === void 0 ? void 0 : expenses.length) || 0);
            return [3 /*break*/, 5];
          case 3:
            if (!(kpi.kpi_name === "Accounts Receivable Turnover")) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.supabase
                .from("invoices")
                .select("amount, status")
                .gte("created_at", startDate)
                .lte("created_at", endDate),
            ];
          case 4:
            invoices = _b.sent().data;
            totalRevenue =
              (invoices === null || invoices === void 0
                ? void 0
                : invoices.reduce(function (sum, inv) {
                    return sum + inv.amount;
                  }, 0)) || 0;
            pendingReceivables =
              ((_a =
                invoices === null || invoices === void 0
                  ? void 0
                  : invoices.filter(function (inv) {
                      return inv.status === "pending";
                    })) === null || _a === void 0
                ? void 0
                : _a.reduce(function (sum, inv) {
                    return sum + inv.amount;
                  }, 0)) || 0;
            value = pendingReceivables ? totalRevenue / pendingReceivables : 0;
            dataPoints = (invoices === null || invoices === void 0 ? void 0 : invoices.length) || 0;
            _b.label = 5;
          case 5:
            result = { value: value, dataPoints: dataPoints, breakdown: breakdown };
            this.setCache(cacheKey, result);
            return [2 /*return*/, result];
        }
      });
    });
  };
  // Drill-down Analysis
  KPIEngine.prototype.performDrillDown = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, kpi, results, _a, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 13, , 14]);
            return [4 /*yield*/, this.getKPIById(request.kpi_id)];
          case 2:
            kpi = _b.sent();
            if (!kpi) throw new Error("KPI not found");
            results = [];
            _a = request.dimension;
            switch (_a) {
              case "time":
                return [3 /*break*/, 3];
              case "service_type":
                return [3 /*break*/, 5];
              case "provider":
                return [3 /*break*/, 7];
              case "patient_segment":
                return [3 /*break*/, 9];
            }
            return [3 /*break*/, 11];
          case 3:
            return [4 /*yield*/, this.drillDownByTime(kpi, request)];
          case 4:
            results = _b.sent();
            return [3 /*break*/, 12];
          case 5:
            return [4 /*yield*/, this.drillDownByServiceType(kpi, request)];
          case 6:
            results = _b.sent();
            return [3 /*break*/, 12];
          case 7:
            return [4 /*yield*/, this.drillDownByProvider(kpi, request)];
          case 8:
            results = _b.sent();
            return [3 /*break*/, 12];
          case 9:
            return [4 /*yield*/, this.drillDownByPatientSegment(kpi, request)];
          case 10:
            results = _b.sent();
            return [3 /*break*/, 12];
          case 11:
            throw new Error("Unsupported drill-down dimension: ".concat(request.dimension));
          case 12:
            console.log("Drill-down analysis completed in ".concat(Date.now() - startTime, "ms"));
            return [2 /*return*/, results.slice(0, request.limit || 50)];
          case 13:
            error_3 = _b.sent();
            console.error("Drill-down analysis error:", error_3);
            throw error_3;
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper Methods
  KPIEngine.prototype.determineTrendDirection = function (current, previous) {
    if (!previous) return "stable";
    var threshold = 0.05; // 5% threshold for stability
    var change = Math.abs((current - previous) / previous);
    if (change < threshold) return "stable";
    return current > previous ? "increasing" : "decreasing";
  };
  KPIEngine.prototype.calculateConfidenceScore = function (dataPoints, category) {
    // Simple confidence scoring based on data points and category
    var baseScore = Math.min(dataPoints / 100, 1); // More data points = higher confidence
    var categoryMultiplier = category === "revenue" ? 1.2 : 1.0; // Revenue data typically more reliable
    return Math.min(baseScore * categoryMultiplier, 1) * 100;
  };
  // Cache Management
  KPIEngine.prototype.getFromCache = function (key) {
    var cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  };
  KPIEngine.prototype.setCache = function (key, data, ttlMinutes) {
    if (ttlMinutes === void 0) {
      ttlMinutes = 5;
    }
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  };
  // Database Helper Methods
  KPIEngine.prototype.getKPIsByIds = function (ids) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, this.supabase.from("financial_kpis").select("*").in("id", ids)];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  KPIEngine.prototype.getAllKPIs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("financial_kpis")
                .select("*")
                .order("kpi_category", { ascending: true }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
        }
      });
    });
  };
  KPIEngine.prototype.getKPIById = function (id) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("financial_kpis").select("*").eq("id", id).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) return [2 /*return*/, null];
            return [2 /*return*/, data];
        }
      });
    });
  };
  KPIEngine.prototype.updateKPIValues = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var updates, _i, updates_1, update;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            updates = results.map(function (result) {
              return {
                id: result.kpi_id,
                current_value: result.calculated_value,
                previous_value: result.previous_value || null,
                variance_percent: result.variance_percent || null,
                trend_direction: result.trend_direction,
                last_updated: result.calculation_timestamp,
              };
            });
            (_i = 0), (updates_1 = updates);
            _a.label = 1;
          case 1:
            if (!(_i < updates_1.length)) return [3 /*break*/, 4];
            update = updates_1[_i];
            return [
              4 /*yield*/,
              this.supabase.from("financial_kpis").update(update).eq("id", update.id),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  KPIEngine.prototype.recordKPIHistory = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var historyRecords;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            historyRecords = results.map(function (result) {
              return {
                kpi_id: result.kpi_id,
                value: result.calculated_value,
                recorded_at: result.calculation_timestamp,
                calculation_metadata: {
                  data_points_used: result.data_points_used,
                  confidence_score: result.confidence_score,
                  breakdown: result.breakdown,
                },
              };
            });
            return [4 /*yield*/, this.supabase.from("kpi_history").insert(historyRecords)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  KPIEngine.prototype.checkThresholds = function (results) {
    return __awaiter(this, void 0, void 0, function () {
      var _i, results_1, result, thresholds, _a, thresholds_1, threshold, breached;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_i = 0), (results_1 = results);
            _b.label = 1;
          case 1:
            if (!(_i < results_1.length)) return [3 /*break*/, 7];
            result = results_1[_i];
            return [
              4 /*yield*/,
              this.supabase
                .from("kpi_thresholds")
                .select("*")
                .eq("kpi_id", result.kpi_id)
                .eq("notification_enabled", true),
            ];
          case 2:
            thresholds = _b.sent().data;
            if (!(thresholds === null || thresholds === void 0 ? void 0 : thresholds.length))
              return [3 /*break*/, 6];
            (_a = 0), (thresholds_1 = thresholds);
            _b.label = 3;
          case 3:
            if (!(_a < thresholds_1.length)) return [3 /*break*/, 6];
            threshold = thresholds_1[_a];
            breached = this.checkThresholdBreach(result.calculated_value, threshold);
            if (!breached) return [3 /*break*/, 5];
            return [4 /*yield*/, this.createAlert(result, threshold)];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            _a++;
            return [3 /*break*/, 3];
          case 6:
            _i++;
            return [3 /*break*/, 1];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  KPIEngine.prototype.checkThresholdBreach = function (value, threshold) {
    var threshold_value = threshold.threshold_value,
      comparison_operator = threshold.comparison_operator;
    switch (comparison_operator) {
      case "gt":
        return value > threshold_value;
      case "lt":
        return value < threshold_value;
      case "eq":
        return value === threshold_value;
      case "gte":
        return value >= threshold_value;
      case "lte":
        return value <= threshold_value;
      default:
        return false;
    }
  };
  KPIEngine.prototype.createAlert = function (result, threshold) {
    return __awaiter(this, void 0, void 0, function () {
      var alert;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            alert = {
              kpi_id: result.kpi_id,
              threshold_id: threshold.id,
              alert_type: threshold.threshold_type,
              alert_message: "KPI "
                .concat(result.kpi_name, " ")
                .concat(threshold.threshold_type, " threshold breached"),
              alert_value: result.calculated_value,
              threshold_value: threshold.threshold_value,
              is_acknowledged: false,
            };
            return [4 /*yield*/, this.supabase.from("kpi_alerts").insert(alert)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  KPIEngine.prototype.getPreviousPeriodValue = function (kpi, startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
      var start, end, periodLength, previousStart, previousEnd, data;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            start = new Date(startDate);
            end = new Date(endDate);
            periodLength = end.getTime() - start.getTime();
            previousStart = new Date(start.getTime() - periodLength);
            previousEnd = new Date(start.getTime());
            return [
              4 /*yield*/,
              this.supabase
                .from("kpi_history")
                .select("value")
                .eq("kpi_id", kpi.id)
                .gte("recorded_at", previousStart.toISOString())
                .lte("recorded_at", previousEnd.toISOString())
                .order("recorded_at", { ascending: false })
                .limit(1),
            ];
          case 1:
            data = _b.sent().data;
            return [
              2 /*return*/,
              (_a = data === null || data === void 0 ? void 0 : data[0]) === null || _a === void 0
                ? void 0
                : _a.value,
            ];
        }
      });
    });
  };
  // Drill-down implementations (simplified)
  KPIEngine.prototype.drillDownByTime = function (kpi, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation would vary based on aggregation level (day, week, month, etc.)
        return [2 /*return*/, []];
      });
    });
  };
  KPIEngine.prototype.drillDownByServiceType = function (kpi, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for service type breakdown
        return [2 /*return*/, []];
      });
    });
  };
  KPIEngine.prototype.drillDownByProvider = function (kpi, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for provider breakdown
        return [2 /*return*/, []];
      });
    });
  };
  KPIEngine.prototype.drillDownByPatientSegment = function (kpi, request) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Implementation for patient segment breakdown
        return [2 /*return*/, []];
      });
    });
  };
  return KPIEngine;
})();
exports.KPIEngine = KPIEngine;
// Export singleton instance
exports.kpiEngine = new KPIEngine();
