// Interactive Drill-down Analysis System
// Description: Multi-level drill-down navigation and contextual filtering system
// Author: Dev Agent
// Date: 2025-01-26
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
exports.drillDownSystem = exports.DrillDownSystem = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var DrillDownSystem = /** @class */ (() => {
  function DrillDownSystem() {
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    this.cache = new Map();
  }
  // Main drill-down execution
  DrillDownSystem.prototype.executeDrillDown = function (kpiId_1, dimension_1) {
    return __awaiter(this, arguments, void 0, function (kpiId, dimension, filters, options) {
      var startTime,
        kpi,
        strategy,
        results,
        context,
        path,
        _i,
        results_1,
        result,
        _a,
        executionTime,
        error_1;
      if (filters === void 0) {
        filters = {};
      }
      if (options === void 0) {
        options = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            startTime = Date.now();
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 9]);
            return [4 /*yield*/, this.getKPIDetails(kpiId)];
          case 2:
            kpi = _b.sent();
            if (!kpi) throw new Error("KPI not found");
            strategy = this.getDrillDownStrategy(kpi, dimension);
            return [4 /*yield*/, this.performDrillDown(kpi, dimension, filters, options)];
          case 3:
            results = _b.sent();
            context = this.buildDrillDownContext(dimension, filters, options);
            path = this.buildDrillDownPath(kpi, dimension, context.breadcrumbs.length);
            if (!options.includeSubDimensions) return [3 /*break*/, 7];
            (_i = 0), (results_1 = results);
            _b.label = 4;
          case 4:
            if (!(_i < results_1.length)) return [3 /*break*/, 7];
            result = results_1[_i];
            _a = result;
            return [4 /*yield*/, this.getSubDimensions(kpi, dimension, result, filters)];
          case 5:
            _a.sub_dimensions = _b.sent();
            _b.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            executionTime = Date.now() - startTime;
            return [
              2 /*return*/,
              {
                results: results.slice(0, options.limit || 50),
                context: context,
                path: path,
                totalCount: results.length,
                executionTime: executionTime,
              },
            ];
          case 8:
            error_1 = _b.sent();
            console.error("Drill-down execution error:", error_1);
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  // Time-based drill-down
  DrillDownSystem.prototype.drillDownByTime = function (kpi_1, aggregationLevel_1) {
    return __awaiter(this, arguments, void 0, function (kpi, aggregationLevel, filters) {
      var cacheKey, cached, dateFormat, groupBy, results, query, _a, data, error, totalValue_1;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "time_drill_"
              .concat(kpi.id, "_")
              .concat(aggregationLevel, "_")
              .concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            switch (aggregationLevel) {
              case "hour":
                dateFormat = "YYYY-MM-DD HH24:00:00";
                groupBy = "DATE_TRUNC('hour', created_at)";
                break;
              case "day":
                dateFormat = "YYYY-MM-DD";
                groupBy = "DATE_TRUNC('day', created_at)";
                break;
              case "week":
                dateFormat = 'YYYY-"W"WW';
                groupBy = "DATE_TRUNC('week', created_at)";
                break;
              case "month":
                dateFormat = "YYYY-MM";
                groupBy = "DATE_TRUNC('month', created_at)";
                break;
              case "quarter":
                dateFormat = 'YYYY-"Q"Q';
                groupBy = "DATE_TRUNC('quarter', created_at)";
                break;
              case "year":
                dateFormat = "YYYY";
                groupBy = "DATE_TRUNC('year', created_at)";
                break;
            }
            results = [];
            if (!(kpi.kpi_category === "revenue")) return [3 /*break*/, 2];
            query = "\n        SELECT \n          TO_CHAR("
              .concat(groupBy, ", '")
              .concat(
                dateFormat,
                "') as period,\n          SUM(amount) as value,\n          COUNT(*) as transaction_count\n        FROM invoices \n        WHERE status = 'paid'\n        ",
              )
              .concat(
                filters.start_date ? "AND created_at >= '".concat(filters.start_date, "'") : "",
                "\n        ",
              )
              .concat(
                filters.end_date ? "AND created_at <= '".concat(filters.end_date, "'") : "",
                "\n        ",
              )
              .concat(
                filters.service_types
                  ? "AND service_type = ANY(ARRAY[".concat(
                      filters.service_types.map((s) => "'".concat(s, "'")).join(","),
                      "])",
                    )
                  : "",
                "\n        GROUP BY ",
              )
              .concat(groupBy, "\n        ORDER BY ")
              .concat(groupBy, " DESC\n      ");
            return [4 /*yield*/, this.supabase.rpc("execute_sql", { query: query })];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            totalValue_1 = data.reduce((sum, row) => sum + parseFloat(row.value), 0);
            results.push.apply(
              results,
              data.map((row) => ({
                dimension_value: row.period,
                value: parseFloat(row.value),
                percentage_of_total: totalValue_1
                  ? (parseFloat(row.value) / totalValue_1) * 100
                  : 0,
                transaction_count: parseInt(row.transaction_count),
                metadata: {
                  aggregation_level: aggregationLevel,
                  period_start: row.period,
                },
              })),
            );
            _b.label = 2;
          case 2:
            this.setCache(cacheKey, results);
            return [2 /*return*/, results];
        }
      });
    });
  };
  // Service type drill-down
  DrillDownSystem.prototype.drillDownByServiceType = function (kpi_1) {
    return __awaiter(this, arguments, void 0, function (kpi, filters) {
      var cacheKey, cached, results, query, _a, data, error, serviceGroups, totalRevenue_1;
      var _b;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            cacheKey = "service_drill_".concat(kpi.id, "_").concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            results = [];
            if (!(kpi.kpi_category === "revenue" || kpi.kpi_category === "profitability"))
              return [3 /*break*/, 2];
            query = this.supabase
              .from("invoices")
              .select("service_type, amount, direct_costs")
              .eq("status", "paid");
            if (filters.start_date) query = query.gte("created_at", filters.start_date);
            if (filters.end_date) query = query.lte("created_at", filters.end_date);
            if ((_b = filters.providers) === null || _b === void 0 ? void 0 : _b.length)
              query = query.in("provider_id", filters.providers);
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            serviceGroups = data.reduce((acc, invoice) => {
              var service = invoice.service_type || "Unknown";
              if (!acc[service]) {
                acc[service] = {
                  revenue: 0,
                  costs: 0,
                  count: 0,
                };
              }
              acc[service].revenue += invoice.amount;
              acc[service].costs += invoice.direct_costs || 0;
              acc[service].count += 1;
              return acc;
            }, {});
            totalRevenue_1 = Object.values(serviceGroups).reduce(
              (sum, group) => sum + group.revenue,
              0,
            );
            results.push.apply(
              results,
              Object.entries(serviceGroups).map((_a) => {
                var service = _a[0],
                  data = _a[1];
                return {
                  dimension_value: service,
                  value:
                    kpi.kpi_name === "Gross Profit Margin"
                      ? data.revenue
                        ? ((data.revenue - data.costs) / data.revenue) * 100
                        : 0
                      : data.revenue,
                  percentage_of_total: totalRevenue_1 ? (data.revenue / totalRevenue_1) * 100 : 0,
                  transaction_count: data.count,
                  metadata: {
                    revenue: data.revenue,
                    costs: data.costs,
                    profit_margin: data.revenue
                      ? ((data.revenue - data.costs) / data.revenue) * 100
                      : 0,
                  },
                };
              }),
            );
            _c.label = 2;
          case 2:
            this.setCache(cacheKey, results);
            return [2 /*return*/, results];
        }
      });
    });
  };
  // Provider drill-down
  DrillDownSystem.prototype.drillDownByProvider = function (kpi_1) {
    return __awaiter(this, arguments, void 0, function (kpi, filters) {
      var cacheKey, cached, results, query, _a, data, error, providerGroups, totalRevenue;
      var _b;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            cacheKey = "provider_drill_".concat(kpi.id, "_").concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            results = [];
            query = this.supabase
              .from("appointments")
              .select(
                "\n        provider_id,\n        providers(name),\n        invoices(amount, direct_costs),\n        status\n      ",
              );
            if (filters.start_date) query = query.gte("created_at", filters.start_date);
            if (filters.end_date) query = query.lte("created_at", filters.end_date);
            if ((_b = filters.service_types) === null || _b === void 0 ? void 0 : _b.length)
              query = query.in("service_type", filters.service_types);
            return [4 /*yield*/, query];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            providerGroups = data.reduce((acc, appointment) => {
              var _a;
              var providerId = appointment.provider_id;
              var providerName =
                ((_a = appointment.providers) === null || _a === void 0 ? void 0 : _a.name) ||
                "Unknown Provider";
              if (!acc[providerId]) {
                acc[providerId] = {
                  name: providerName,
                  revenue: 0,
                  costs: 0,
                  appointments: 0,
                  completed: 0,
                };
              }
              acc[providerId].appointments += 1;
              if (appointment.status === "completed") {
                acc[providerId].completed += 1;
                if (appointment.invoices) {
                  acc[providerId].revenue += appointment.invoices.amount || 0;
                  acc[providerId].costs += appointment.invoices.direct_costs || 0;
                }
              }
              return acc;
            }, {});
            totalRevenue = Object.values(providerGroups).reduce(
              (sum, group) => sum + group.revenue,
              0,
            );
            results.push.apply(
              results,
              Object.entries(providerGroups).map((_a) => {
                var providerId = _a[0],
                  data = _a[1];
                return {
                  dimension_value: data.name,
                  value:
                    kpi.kpi_category === "revenue"
                      ? data.revenue
                      : kpi.kpi_name === "Appointment Utilization"
                        ? data.appointments
                          ? (data.completed / data.appointments) * 100
                          : 0
                        : data.revenue,
                  percentage_of_total: totalRevenue ? (data.revenue / totalRevenue) * 100 : 0,
                  transaction_count: data.appointments,
                  metadata: {
                    provider_id: providerId,
                    revenue: data.revenue,
                    costs: data.costs,
                    appointments: data.appointments,
                    completion_rate: data.appointments
                      ? (data.completed / data.appointments) * 100
                      : 0,
                  },
                };
              }),
            );
            this.setCache(cacheKey, results);
            return [2 /*return*/, results];
        }
      });
    });
  };
  // Patient segment drill-down
  DrillDownSystem.prototype.drillDownByPatientSegment = function (kpi_1) {
    return __awaiter(this, arguments, void 0, function (kpi, filters) {
      var cacheKey, cached, results, query, _a, data, error, ageSegments, totalPatients;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            cacheKey = "patient_drill_".concat(kpi.id, "_").concat(JSON.stringify(filters));
            cached = this.getFromCache(cacheKey);
            if (cached) return [2 /*return*/, cached];
            results = [];
            query = this.supabase
              .from("patients")
              .select(
                "\n        id,\n        age,\n        gender,\n        insurance_type,\n        created_at,\n        appointments(count),\n        invoices(amount)\n      ",
              );
            if (filters.start_date) query = query.gte("created_at", filters.start_date);
            if (filters.end_date) query = query.lte("created_at", filters.end_date);
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            ageSegments = data.reduce((acc, patient) => {
              var _a, _b;
              var ageGroup;
              var age = patient.age || 0;
              if (age < 18) ageGroup = "Under 18";
              else if (age < 30) ageGroup = "18-29";
              else if (age < 45) ageGroup = "30-44";
              else if (age < 60) ageGroup = "45-59";
              else ageGroup = "60+";
              if (!acc[ageGroup]) {
                acc[ageGroup] = {
                  count: 0,
                  revenue: 0,
                  appointments: 0,
                };
              }
              acc[ageGroup].count += 1;
              acc[ageGroup].revenue +=
                ((_a = patient.invoices) === null || _a === void 0
                  ? void 0
                  : _a.reduce((sum, inv) => sum + (inv.amount || 0), 0)) || 0;
              acc[ageGroup].appointments +=
                ((_b = patient.appointments) === null || _b === void 0 ? void 0 : _b.length) || 0;
              return acc;
            }, {});
            totalPatients = Object.values(ageSegments).reduce(
              (sum, segment) => sum + segment.count,
              0,
            );
            results.push.apply(
              results,
              Object.entries(ageSegments).map((_a) => {
                var segment = _a[0],
                  data = _a[1];
                return {
                  dimension_value: segment,
                  value:
                    kpi.kpi_name === "Revenue Per Patient"
                      ? data.count
                        ? data.revenue / data.count
                        : 0
                      : data.count,
                  percentage_of_total: totalPatients ? (data.count / totalPatients) * 100 : 0,
                  transaction_count: data.appointments,
                  metadata: {
                    patient_count: data.count,
                    total_revenue: data.revenue,
                    total_appointments: data.appointments,
                    avg_revenue_per_patient: data.count ? data.revenue / data.count : 0,
                  },
                };
              }),
            );
            this.setCache(cacheKey, results);
            return [2 /*return*/, results];
        }
      });
    });
  };
  // Navigation and context management
  DrillDownSystem.prototype.buildDrillDownContext = function (dimension, filters, options) {
    var breadcrumbs = [
      {
        level: 0,
        dimension: "overview",
        label: "KPI Overview",
      },
      {
        level: 1,
        dimension: dimension,
        label: this.getDimensionLabel(dimension),
      },
    ];
    return {
      breadcrumbs: breadcrumbs,
      filters: filters,
      aggregationLevel: options.aggregationLevel || "month",
      sortBy: options.sortBy || "value",
      sortOrder: options.sortOrder || "desc",
    };
  };
  DrillDownSystem.prototype.buildDrillDownPath = function (kpi, currentDimension, currentLevel) {
    var availableDimensions = this.getAvailableDimensions(kpi);
    var maxLevels = this.getMaxDrillLevels(kpi);
    var nextLevelOptions = this.getNextLevelOptions(currentDimension, currentLevel);
    return {
      currentLevel: currentLevel,
      maxLevels: maxLevels,
      availableDimensions: availableDimensions,
      nextLevelOptions: nextLevelOptions,
    };
  };
  // Helper methods
  DrillDownSystem.prototype.getDrillDownStrategy = (kpi, dimension) => {
    // Return optimal strategy based on KPI type and dimension
    return "".concat(kpi.kpi_category, "_").concat(dimension);
  };
  DrillDownSystem.prototype.performDrillDown = function (kpi, dimension, filters, options) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (dimension) {
          case "time":
            return [
              2 /*return*/,
              this.drillDownByTime(kpi, options.aggregationLevel || "month", filters),
            ];
          case "service_type":
            return [2 /*return*/, this.drillDownByServiceType(kpi, filters)];
          case "provider":
            return [2 /*return*/, this.drillDownByProvider(kpi, filters)];
          case "patient_segment":
            return [2 /*return*/, this.drillDownByPatientSegment(kpi, filters)];
          default:
            throw new Error("Unsupported drill-down dimension: ".concat(dimension));
        }
        return [2 /*return*/];
      });
    });
  };
  DrillDownSystem.prototype.getSubDimensions = function (
    kpi,
    parentDimension,
    parentResult,
    filters,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var subFilters, nextDimension;
      var _a;
      return __generator(this, function (_b) {
        subFilters = __assign(
          __assign({}, filters),
          ((_a = {}), (_a[parentDimension] = parentResult.dimension_value), _a),
        );
        nextDimension = this.getNextDimension(parentDimension);
        if (!nextDimension) return [2 /*return*/, []];
        return [2 /*return*/, this.performDrillDown(kpi, nextDimension, subFilters, { limit: 5 })];
      });
    });
  };
  DrillDownSystem.prototype.getAvailableDimensions = (kpi) => {
    var baseDimensions = ["time", "service_type"];
    if (kpi.kpi_category === "operational") {
      baseDimensions.push("provider", "patient_segment");
    }
    if (kpi.kpi_category === "revenue" || kpi.kpi_category === "profitability") {
      baseDimensions.push("provider", "patient_segment");
    }
    return baseDimensions;
  };
  DrillDownSystem.prototype.getMaxDrillLevels = (kpi) => {
    // Most KPIs support 3-4 drill levels
    return 4;
  };
  DrillDownSystem.prototype.getNextLevelOptions = (dimension, level) => {
    var dimensionHierarchy = {
      time: ["service_type", "provider"],
      service_type: ["provider", "patient_segment"],
      provider: ["patient_segment", "time"],
      patient_segment: ["service_type", "time"],
    };
    return dimensionHierarchy[dimension];
  };
  DrillDownSystem.prototype.getNextDimension = (currentDimension) => {
    var nextDimensions = {
      time: "service_type",
      service_type: "provider",
      provider: "patient_segment",
    };
    return nextDimensions[currentDimension] || null;
  };
  DrillDownSystem.prototype.getDimensionLabel = (dimension) => {
    var labels = {
      time: "Time Period",
      service_type: "Service Type",
      provider: "Provider",
      patient_segment: "Patient Segment",
      location: "Location",
    };
    return labels[dimension] || dimension;
  };
  // Cache and database helpers
  DrillDownSystem.prototype.getFromCache = function (key) {
    var cached = this.cache.get(key);
    if (!cached) return null;
    if (Date.now() - cached.timestamp > 300000) {
      // 5 minutes
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  };
  DrillDownSystem.prototype.setCache = function (key, data) {
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  };
  DrillDownSystem.prototype.getKPIDetails = function (id) {
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
  return DrillDownSystem;
})();
exports.DrillDownSystem = DrillDownSystem;
// Export singleton instance
exports.drillDownSystem = new DrillDownSystem();
