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
exports.useFinancialKPIs = useFinancialKPIs;
var react_1 = require("react");
var supabase_1 = require("@/lib/supabase");
var date_fns_1 = require("date-fns");
// Default filters
var getDefaultFilters = () => ({
  dateRange: {
    start: (0, date_fns_1.startOfMonth)(new Date()),
    end: (0, date_fns_1.endOfMonth)(new Date()),
    preset: "current-month",
  },
  services: [],
  providers: [],
  locations: [],
  patientSegments: [],
});
// KPI calculation functions
var calculateTrend = (current, previous) => {
  var threshold = 0.01; // 1% threshold for stability
  var change = (current - previous) / previous;
  if (Math.abs(change) < threshold) return "stable";
  return change > 0 ? "up" : "down";
};
var calculateChangePercentage = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};
// Generate alerts based on KPI values
var generateKPIAlerts = (kpi) => {
  var alerts = [];
  // Target-based alerts
  if (kpi.target) {
    var targetAchievement = (kpi.value / kpi.target) * 100;
    if (targetAchievement < 70) {
      alerts.push({
        id: "".concat(kpi.id, "-target-critical"),
        type: "critical",
        message: ""
          .concat(kpi.name, " est\u00E1 ")
          .concat((100 - targetAchievement).toFixed(1), "% abaixo da meta"),
        threshold: kpi.target,
        currentValue: kpi.value,
        createdAt: new Date(),
        acknowledged: false,
        severity: "high",
        actionRequired: "Revisar estratégia e implementar ações corretivas",
        autoResolve: false,
      });
    } else if (targetAchievement < 90) {
      alerts.push({
        id: "".concat(kpi.id, "-target-warning"),
        type: "warning",
        message: ""
          .concat(kpi.name, " est\u00E1 ")
          .concat((100 - targetAchievement).toFixed(1), "% abaixo da meta"),
        threshold: kpi.target,
        currentValue: kpi.value,
        createdAt: new Date(),
        acknowledged: false,
        severity: "medium",
        actionRequired: "Monitorar de perto e considerar ajustes",
        autoResolve: false,
      });
    }
  }
  // Trend-based alerts
  if (kpi.trend === "down" && Math.abs(kpi.changePercentage) > 10) {
    alerts.push({
      id: "".concat(kpi.id, "-trend-warning"),
      type: "warning",
      message: ""
        .concat(kpi.name, " apresenta queda de ")
        .concat(Math.abs(kpi.changePercentage).toFixed(1), "%"),
      threshold: kpi.previousValue,
      currentValue: kpi.value,
      createdAt: new Date(),
      acknowledged: false,
      severity: "medium",
      actionRequired: "Investigar causas da queda",
      autoResolve: true,
    });
  }
  return alerts;
};
// Main hook
function useFinancialKPIs(_a) {
  var clinicId = _a.clinicId,
    _b = _a.autoRefresh,
    autoRefresh = _b === void 0 ? true : _b,
    _c = _a.refreshInterval,
    refreshInterval = _c === void 0 ? 30 : _c,
    _d = _a.enableRealTime,
    enableRealTime = _d === void 0 ? false : _d,
    _e = _a.enableBenchmarks,
    enableBenchmarks = _e === void 0 ? true : _e,
    _f = _a.enableForecasting,
    enableForecasting = _f === void 0 ? true : _f,
    _g = _a.cacheTimeout,
    cacheTimeout = _g === void 0 ? 5 : _g;
  // State
  var _h = (0, react_1.useState)([]),
    kpis = _h[0],
    setKpis = _h[1];
  var _j = (0, react_1.useState)(null),
    metrics = _j[0],
    setMetrics = _j[1];
  var _k = (0, react_1.useState)(true),
    isLoading = _k[0],
    setIsLoading = _k[1];
  var _l = (0, react_1.useState)(null),
    error = _l[0],
    setError = _l[1];
  var _m = (0, react_1.useState)(null),
    lastUpdated = _m[0],
    setLastUpdated = _m[1];
  var _o = (0, react_1.useState)(getDefaultFilters()),
    filters = _o[0],
    setFilters = _o[1];
  var _p = (0, react_1.useState)(new Map()),
    cache = _p[0],
    setCache = _p[1];
  // Fetch financial data from Supabase
  var fetchFinancialData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a,
          start,
          end,
          cacheKey,
          cached,
          _b,
          appointments,
          appointmentsError,
          _c,
          expenses,
          expensesError,
          totalRevenue,
          totalExpenses,
          netProfit,
          grossMargin,
          uniquePatients,
          averageTicket,
          calculatedMetrics,
          err_1;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              (_a = filters.dateRange), (start = _a.start), (end = _a.end);
              cacheKey = "financial-data-"
                .concat(clinicId, "-")
                .concat((0, date_fns_1.format)(start, "yyyy-MM-dd"), "-")
                .concat((0, date_fns_1.format)(end, "yyyy-MM-dd"));
              cached = cache.get(cacheKey);
              if (
                cached &&
                new Date().getTime() - cached.timestamp.getTime() < cacheTimeout * 60 * 1000
              ) {
                return [2 /*return*/, cached.data];
              }
              _d.label = 1;
            case 1:
              _d.trys.push([1, 4, , 5]);
              return [
                4 /*yield*/,
                supabase_1.supabase
                  .from("appointments")
                  .select(
                    "\n          id,\n          total_amount,\n          status,\n          created_at,\n          service:services(name, category),\n          provider:providers(name),\n          patient:patients(id, name)\n        ",
                  )
                  .eq("clinic_id", clinicId)
                  .gte("created_at", start.toISOString())
                  .lte("created_at", end.toISOString())
                  .eq("status", "completed"),
              ];
            case 2:
              (_b = _d.sent()), (appointments = _b.data), (appointmentsError = _b.error);
              if (appointmentsError) throw appointmentsError;
              return [
                4 /*yield*/,
                supabase_1.supabase
                  .from("expenses")
                  .select("*")
                  .eq("clinic_id", clinicId)
                  .gte("date", start.toISOString())
                  .lte("date", end.toISOString()),
              ];
            case 3:
              (_c = _d.sent()), (expenses = _c.data), (expensesError = _c.error);
              if (expensesError) throw expensesError;
              totalRevenue =
                (appointments === null || appointments === void 0
                  ? void 0
                  : appointments.reduce((sum, apt) => sum + (apt.total_amount || 0), 0)) || 0;
              totalExpenses =
                (expenses === null || expenses === void 0
                  ? void 0
                  : expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)) || 0;
              netProfit = totalRevenue - totalExpenses;
              grossMargin =
                totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
              uniquePatients =
                new Set(
                  appointments === null || appointments === void 0
                    ? void 0
                    : appointments.map((apt) => {
                        var _a;
                        return (_a = apt.patient) === null || _a === void 0 ? void 0 : _a.id;
                      }),
                ).size || 0;
              averageTicket = uniquePatients > 0 ? totalRevenue / uniquePatients : 0;
              calculatedMetrics = {
                totalRevenue: totalRevenue,
                totalExpenses: totalExpenses,
                netProfit: netProfit,
                grossMargin: grossMargin,
                operatingMargin: grossMargin * 0.8, // Simplified calculation
                ebitda: netProfit * 1.2, // Simplified calculation
                cashFlow: netProfit * 0.9, // Simplified calculation
                roi: totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0,
                patientLTV: averageTicket * 3.5, // Simplified LTV calculation
                averageTicket: averageTicket,
                conversionRate: 85.5, // Mock data - would come from lead tracking
                retentionRate: 78.2, // Mock data - would come from patient analysis
              };
              // Cache the result
              cache.set(cacheKey, { data: calculatedMetrics, timestamp: new Date() });
              setCache(new Map(cache));
              return [2 /*return*/, calculatedMetrics];
            case 4:
              err_1 = _d.sent();
              console.error("Error fetching financial data:", err_1);
              throw err_1;
            case 5:
              return [2 /*return*/];
          }
        });
      }),
    [clinicId, filters.dateRange, cache, cacheTimeout],
  );
  // Fetch comparison data for previous period
  var fetchComparisonData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a,
          start,
          end,
          periodLength,
          comparisonStart,
          comparisonEnd,
          tempFilters,
          originalFilters,
          comparisonMetrics,
          err_2;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              (_a = filters.dateRange), (start = _a.start), (end = _a.end);
              periodLength = end.getTime() - start.getTime();
              comparisonStart = new Date(start.getTime() - periodLength);
              comparisonEnd = new Date(end.getTime() - periodLength);
              tempFilters = __assign(__assign({}, filters), {
                dateRange: __assign(__assign({}, filters.dateRange), {
                  start: comparisonStart,
                  end: comparisonEnd,
                }),
              });
              originalFilters = filters;
              setFilters(tempFilters);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 3, , 4]);
              return [4 /*yield*/, fetchFinancialData()];
            case 2:
              comparisonMetrics = _b.sent();
              setFilters(originalFilters);
              return [2 /*return*/, comparisonMetrics];
            case 3:
              err_2 = _b.sent();
              setFilters(originalFilters);
              throw err_2;
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    [filters, fetchFinancialData],
  );
  // Generate KPIs from metrics
  var generateKPIs = (0, react_1.useCallback)(
    (currentMetrics, previousMetrics) =>
      __awaiter(this, void 0, void 0, function () {
        var kpiList;
        return __generator(this, (_a) => {
          kpiList = [
            {
              id: "revenue-total",
              name: "Receita Total",
              value: currentMetrics.totalRevenue,
              previousValue: previousMetrics.totalRevenue,
              target: currentMetrics.totalRevenue * 1.1, // 10% growth target
              unit: "currency",
              trend: calculateTrend(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
              changePercentage: calculateChangePercentage(
                currentMetrics.totalRevenue,
                previousMetrics.totalRevenue,
              ),
              category: "revenue",
              description: "Receita total do período selecionado",
              lastUpdated: new Date(),
              confidence: 95,
            },
            {
              id: "profit-margin",
              name: "Margem de Lucro",
              value: currentMetrics.grossMargin,
              previousValue: previousMetrics.grossMargin,
              target: 35,
              unit: "percentage",
              trend: calculateTrend(currentMetrics.grossMargin, previousMetrics.grossMargin),
              changePercentage: calculateChangePercentage(
                currentMetrics.grossMargin,
                previousMetrics.grossMargin,
              ),
              category: "profitability",
              description: "Margem de lucro bruto sobre receita",
              lastUpdated: new Date(),
              confidence: 92,
            },
            {
              id: "ebitda",
              name: "EBITDA",
              value: currentMetrics.ebitda,
              previousValue: previousMetrics.ebitda,
              target: currentMetrics.ebitda * 1.15,
              unit: "currency",
              trend: calculateTrend(currentMetrics.ebitda, previousMetrics.ebitda),
              changePercentage: calculateChangePercentage(
                currentMetrics.ebitda,
                previousMetrics.ebitda,
              ),
              category: "profitability",
              description: "Lucro antes de juros, impostos, depreciação e amortização",
              lastUpdated: new Date(),
              confidence: 88,
            },
            {
              id: "cash-flow",
              name: "Fluxo de Caixa",
              value: currentMetrics.cashFlow,
              previousValue: previousMetrics.cashFlow,
              target: currentMetrics.cashFlow * 1.2,
              unit: "currency",
              trend: calculateTrend(currentMetrics.cashFlow, previousMetrics.cashFlow),
              changePercentage: calculateChangePercentage(
                currentMetrics.cashFlow,
                previousMetrics.cashFlow,
              ),
              category: "liquidity",
              description: "Fluxo de caixa operacional do período",
              lastUpdated: new Date(),
              confidence: 90,
            },
            {
              id: "roi",
              name: "ROI",
              value: currentMetrics.roi,
              previousValue: previousMetrics.roi,
              target: 20,
              unit: "percentage",
              trend: calculateTrend(currentMetrics.roi, previousMetrics.roi),
              changePercentage: calculateChangePercentage(currentMetrics.roi, previousMetrics.roi),
              category: "efficiency",
              description: "Retorno sobre investimento",
              lastUpdated: new Date(),
              confidence: 85,
            },
            {
              id: "patient-ltv",
              name: "LTV do Paciente",
              value: currentMetrics.patientLTV,
              previousValue: previousMetrics.patientLTV,
              target: 3000,
              unit: "currency",
              trend: calculateTrend(currentMetrics.patientLTV, previousMetrics.patientLTV),
              changePercentage: calculateChangePercentage(
                currentMetrics.patientLTV,
                previousMetrics.patientLTV,
              ),
              category: "efficiency",
              description: "Valor vitalício médio do paciente",
              lastUpdated: new Date(),
              confidence: 82,
            },
          ];
          // Add alerts to each KPI
          return [
            2 /*return*/,
            kpiList.map((kpi) => __assign(__assign({}, kpi), { alerts: generateKPIAlerts(kpi) })),
          ];
        });
      }),
    [],
  );
  // Main data loading function
  var loadKPIData = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        var _a, currentMetrics, previousMetrics, generatedKPIs, err_3;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              setIsLoading(true);
              setError(null);
              _b.label = 1;
            case 1:
              _b.trys.push([1, 4, 5, 6]);
              return [4 /*yield*/, Promise.all([fetchFinancialData(), fetchComparisonData()])];
            case 2:
              (_a = _b.sent()), (currentMetrics = _a[0]), (previousMetrics = _a[1]);
              return [4 /*yield*/, generateKPIs(currentMetrics, previousMetrics)];
            case 3:
              generatedKPIs = _b.sent();
              setMetrics(currentMetrics);
              setKpis(generatedKPIs);
              setLastUpdated(new Date());
              return [3 /*break*/, 6];
            case 4:
              err_3 = _b.sent();
              setError(
                err_3 instanceof Error ? err_3.message : "Erro ao carregar dados financeiros",
              );
              console.error("Error loading KPI data:", err_3);
              return [3 /*break*/, 6];
            case 5:
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      }),
    [fetchFinancialData, fetchComparisonData, generateKPIs],
  );
  // Refresh function
  var refreshKPIs = (0, react_1.useCallback)(
    () =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              // Clear cache for fresh data
              setCache(new Map());
              return [4 /*yield*/, loadKPIData()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    [loadKPIData],
  );
  // Update filters
  var updateFilters = (0, react_1.useCallback)((newFilters) => {
    setFilters((prev) => __assign(__assign({}, prev), newFilters));
  }, []);
  // Acknowledge alert
  var acknowledgeAlert = (0, react_1.useCallback)(
    (alertId) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          setKpis((prev) =>
            prev.map((kpi) => {
              var _a;
              return __assign(__assign({}, kpi), {
                alerts:
                  (_a = kpi.alerts) === null || _a === void 0
                    ? void 0
                    : _a.map((alert) =>
                        alert.id === alertId
                          ? __assign(__assign({}, alert), { acknowledged: true })
                          : alert,
                      ),
              });
            }),
          );
          return [2 /*return*/];
        });
      }),
    [],
  );
  // Export data
  var exportData = (0, react_1.useCallback)(
    (format) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          // Implementation would depend on export library
          console.log("Exporting data in ".concat(format, " format"));
          return [2 /*return*/];
        });
      }),
    [],
  );
  // Get KPI history
  var getKPIHistory = (0, react_1.useCallback)(
    (kpiId, days) =>
      __awaiter(this, void 0, void 0, function () {
        return __generator(this, (_a) => {
          // Implementation would fetch historical data
          return [2 /*return*/, []];
        });
      }),
    [],
  );
  // Computed values
  var getKPIsByCategory = (0, react_1.useCallback)(
    (category) => kpis.filter((kpi) => kpi.category === category),
    [kpis],
  );
  var getTrendAnalysis = (0, react_1.useCallback)(() => {
    var trends = {
      improving: kpis.filter((kpi) => kpi.trend === "up").length,
      declining: kpis.filter((kpi) => kpi.trend === "down").length,
      stable: kpis.filter((kpi) => kpi.trend === "stable").length,
    };
    return __assign(__assign({}, trends), {
      total: kpis.length,
      overallTrend:
        trends.improving > trends.declining
          ? "positive"
          : trends.declining > trends.improving
            ? "negative"
            : "neutral",
    });
  }, [kpis]);
  var getPerformanceScore = (0, react_1.useCallback)(() => {
    if (kpis.length === 0) return 0;
    var scores = kpis.map((kpi) => {
      if (!kpi.target) return 50; // Neutral score if no target
      var achievement = (kpi.value / kpi.target) * 100;
      return Math.min(100, Math.max(0, achievement));
    });
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }, [kpis]);
  var getBenchmarkComparison = (0, react_1.useCallback)(() => {
    var benchmarkedKPIs = kpis.filter((kpi) => kpi.benchmarkData);
    if (benchmarkedKPIs.length === 0) return null;
    var avgPercentile =
      benchmarkedKPIs.reduce((sum, kpi) => {
        var _a;
        return (
          sum +
          (((_a = kpi.benchmarkData) === null || _a === void 0 ? void 0 : _a.percentile) || 50)
        );
      }, 0) / benchmarkedKPIs.length;
    return {
      averagePercentile: avgPercentile,
      aboveIndustryAverage: benchmarkedKPIs.filter((kpi) => {
        var _a;
        return (
          kpi.value >
          (((_a = kpi.benchmarkData) === null || _a === void 0 ? void 0 : _a.industryAverage) || 0)
        );
      }).length,
      totalBenchmarked: benchmarkedKPIs.length,
    };
  }, [kpis]);
  // Active alerts
  var activeAlerts = (0, react_1.useMemo)(
    () => kpis.flatMap((kpi) => kpi.alerts || []).filter((alert) => !alert.acknowledged),
    [kpis],
  );
  // Auto-refresh effect
  (0, react_1.useEffect)(() => {
    loadKPIData();
    if (autoRefresh) {
      var interval_1 = setInterval(loadKPIData, refreshInterval * 1000);
      return () => clearInterval(interval_1);
    }
  }, [loadKPIData, autoRefresh, refreshInterval, filters]);
  return {
    kpis: kpis,
    metrics: metrics,
    isLoading: isLoading,
    error: error,
    lastUpdated: lastUpdated,
    filters: filters,
    activeAlerts: activeAlerts,
    // Actions
    refreshKPIs: refreshKPIs,
    updateFilters: updateFilters,
    acknowledgeAlert: acknowledgeAlert,
    exportData: exportData,
    getKPIHistory: getKPIHistory,
    // Computed values
    getKPIsByCategory: getKPIsByCategory,
    getTrendAnalysis: getTrendAnalysis,
    getPerformanceScore: getPerformanceScore,
    getBenchmarkComparison: getBenchmarkComparison,
  };
}
