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
exports.useInventoryReports = useInventoryReports;
exports.useStockMovementReport = useStockMovementReport;
exports.useStockValuationReport = useStockValuationReport;
exports.useLowStockReport = useLowStockReport;
exports.useExpiringItemsReport = useExpiringItemsReport;
exports.useTransferReport = useTransferReport;
exports.useLocationPerformanceReport = useLocationPerformanceReport;
exports.useReportDefinitions = useReportDefinitions;
exports.useReportsDashboard = useReportsDashboard;
exports.useReportFilters = useReportFilters;
exports.useReportExport = useReportExport;
exports.useInventoryAnalytics = useInventoryAnalytics;
var react_query_1 = require("@tanstack/react-query");
var react_1 = require("react");
// =============================================================================
// QUERY KEYS
// =============================================================================
var QUERY_KEYS = {
  reports: ["inventory-reports"],
  report: function (params) {
    return __spreadArray(__spreadArray([], QUERY_KEYS.reports, true), ["generate", params], false);
  },
  definitions: ["inventory-reports", "definitions"],
  definitionsWithFilter: function (filters) {
    return __spreadArray(__spreadArray([], QUERY_KEYS.definitions, true), [filters], false);
  },
  dashboard: ["inventory-reports", "dashboard"],
};
// =============================================================================
// API FUNCTIONS
// =============================================================================
function generateReport(parameters) {
  return __awaiter(this, void 0, void 0, function () {
    var response, error, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            fetch("/api/inventory/reports/generate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(parameters),
            }),
          ];
        case 1:
          response = _a.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          error = _a.sent();
          throw new Error(error.message || "Failed to generate report");
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          result = _a.sent();
          return [2 /*return*/, result.report];
      }
    });
  });
}
function generateReportFromURL(type, filters) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, response, error, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          searchParams = new URLSearchParams();
          searchParams.set("type", type);
          Object.entries(filters).forEach(function (_a) {
            var key = _a[0],
              value = _a[1];
            if (value !== undefined && value !== null) {
              searchParams.set(key, value.toString());
            }
          });
          return [
            4 /*yield*/,
            fetch("/api/inventory/reports/generate?".concat(searchParams.toString())),
          ];
        case 1:
          response = _a.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          error = _a.sent();
          throw new Error(error.message || "Failed to generate report");
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          result = _a.sent();
          return [2 /*return*/, result.report];
      }
    });
  });
}
function fetchReportDefinitions(filters) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, response, error, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          searchParams = new URLSearchParams();
          if (filters === null || filters === void 0 ? void 0 : filters.created_by)
            searchParams.set("created_by", filters.created_by);
          if ((filters === null || filters === void 0 ? void 0 : filters.is_active) !== undefined)
            searchParams.set("is_active", filters.is_active.toString());
          return [
            4 /*yield*/,
            fetch("/api/inventory/reports/definitions?".concat(searchParams.toString())),
          ];
        case 1:
          response = _a.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          error = _a.sent();
          throw new Error(error.message || "Failed to fetch report definitions");
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          result = _a.sent();
          return [2 /*return*/, result.definitions];
      }
    });
  });
}
function createReportDefinition(definition) {
  return __awaiter(this, void 0, void 0, function () {
    var response, error, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [
            4 /*yield*/,
            fetch("/api/inventory/reports/definitions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(definition),
            }),
          ];
        case 1:
          response = _a.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          error = _a.sent();
          throw new Error(error.message || "Failed to create report definition");
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          result = _a.sent();
          return [2 /*return*/, result.definition];
      }
    });
  });
}
function fetchDashboardStats() {
  return __awaiter(this, void 0, void 0, function () {
    var response, error, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, fetch("/api/inventory/reports/dashboard")];
        case 1:
          response = _a.sent();
          if (!!response.ok) return [3 /*break*/, 3];
          return [4 /*yield*/, response.json()];
        case 2:
          error = _a.sent();
          throw new Error(error.message || "Failed to fetch dashboard stats");
        case 3:
          return [4 /*yield*/, response.json()];
        case 4:
          result = _a.sent();
          return [2 /*return*/, result.stats];
      }
    });
  });
}
// =============================================================================
// MAIN REPORTS HOOK
// =============================================================================
function useInventoryReports() {
  var queryClient = (0, react_query_1.useQueryClient)();
  var generateReportMutation = (0, react_query_1.useMutation)({
    mutationFn: generateReport,
    onSuccess: function () {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reports });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard });
    },
  });
  var createDefinitionMutation = (0, react_query_1.useMutation)({
    mutationFn: createReportDefinition,
    onSuccess: function () {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.definitions });
    },
  });
  return {
    generateReport: generateReportMutation.mutateAsync,
    isGenerating: generateReportMutation.isPending,
    generationError: generateReportMutation.error,
    createDefinition: createDefinitionMutation.mutateAsync,
    isCreatingDefinition: createDefinitionMutation.isPending,
    definitionError: createDefinitionMutation.error,
  };
}
// =============================================================================
// SPECIFIC REPORT TYPE HOOKS
// =============================================================================
function useStockMovementReport(filters, options) {
  var parameters = {
    type: "stock_movement",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
function useStockValuationReport(filters, options) {
  var parameters = {
    type: "stock_valuation",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 10, // 10 minutes (valuation changes less frequently)
    refetchOnWindowFocus: false,
  });
}
function useLowStockReport(filters, options) {
  var parameters = {
    type: "low_stock",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 2, // 2 minutes (low stock is critical)
    refetchOnWindowFocus: true,
  });
}
function useExpiringItemsReport(filters, options) {
  var parameters = {
    type: "expiring_items",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 60, // 1 hour (expiration dates don't change frequently)
    refetchOnWindowFocus: false,
  });
}
function useTransferReport(filters, options) {
  var parameters = {
    type: "transfers",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
function useLocationPerformanceReport(filters, options) {
  var parameters = {
    type: "location_performance",
    filters: filters,
    format: "json",
  };
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.report(parameters),
    queryFn: function () {
      return generateReport(parameters);
    },
    enabled: (options === null || options === void 0 ? void 0 : options.enabled) !== false,
    staleTime: 1000 * 60 * 15, // 15 minutes (performance metrics change slowly)
    refetchOnWindowFocus: false,
  });
}
// =============================================================================
// REPORT DEFINITIONS HOOK
// =============================================================================
function useReportDefinitions(filters) {
  return (0, react_query_1.useQuery)({
    queryKey: filters ? QUERY_KEYS.definitionsWithFilter(filters) : QUERY_KEYS.definitions,
    queryFn: function () {
      return fetchReportDefinitions(filters);
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
}
// =============================================================================
// DASHBOARD STATS HOOK
// =============================================================================
function useReportsDashboard() {
  return (0, react_query_1.useQuery)({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // Auto-refresh every 5 minutes
  });
}
// =============================================================================
// UTILITY HOOKS
// =============================================================================
function useReportFilters() {
  var buildDateRangeFilter = (0, react_1.useCallback)(function (days) {
    var endDate = new Date();
    var startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  }, []);
  var buildMonthFilter = (0, react_1.useCallback)(function (monthsBack) {
    if (monthsBack === void 0) {
      monthsBack = 0;
    }
    var endDate = new Date();
    var startDate = new Date(endDate.getFullYear(), endDate.getMonth() - monthsBack, 1);
    var endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() - monthsBack + 1, 0);
    return {
      start_date: startDate.toISOString(),
      end_date: endOfMonth.toISOString(),
    };
  }, []);
  var buildYearFilter = (0, react_1.useCallback)(function (yearsBack) {
    if (yearsBack === void 0) {
      yearsBack = 0;
    }
    var year = new Date().getFullYear() - yearsBack;
    var startDate = new Date(year, 0, 1);
    var endDate = new Date(year, 11, 31);
    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  }, []);
  return {
    buildDateRangeFilter: buildDateRangeFilter,
    buildMonthFilter: buildMonthFilter,
    buildYearFilter: buildYearFilter,
  };
}
function useReportExport() {
  var _this = this;
  var exportToCSV = (0, react_1.useCallback)(function (type, filters, filename) {
    return __awaiter(_this, void 0, void 0, function () {
      var searchParams, response, blob, url, a;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            searchParams = new URLSearchParams();
            searchParams.set("type", type);
            searchParams.set("format", "csv");
            Object.entries(filters).forEach(function (_a) {
              var key = _a[0],
                value = _a[1];
              if (value !== undefined && value !== null) {
                searchParams.set(key, value.toString());
              }
            });
            return [
              4 /*yield*/,
              fetch("/api/inventory/reports/generate?".concat(searchParams.toString())),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to export report");
            }
            return [4 /*yield*/, response.blob()];
          case 2:
            blob = _a.sent();
            url = window.URL.createObjectURL(blob);
            a = document.createElement("a");
            a.href = url;
            a.download = filename || "".concat(type, "_report_").concat(Date.now(), ".csv");
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            return [2 /*return*/];
        }
      });
    });
  }, []);
  return { exportToCSV: exportToCSV };
}
// =============================================================================
// COMBINED ANALYTICS HOOK
// =============================================================================
function useInventoryAnalytics(filters) {
  var stockValuation = useStockValuationReport(filters);
  var stockMovement = useStockMovementReport(filters);
  var lowStock = useLowStockReport(filters);
  var expiringItems = useExpiringItemsReport(filters);
  var transfers = useTransferReport(filters);
  var locationPerformance = useLocationPerformanceReport(filters);
  var analytics = (0, react_1.useMemo)(
    function () {
      var _a, _b, _c, _d, _e, _f;
      if (!stockValuation.data || !stockMovement.data) {
        return null;
      }
      return {
        overview: {
          totalValue: stockValuation.data.summary.total_value,
          totalItems: stockValuation.data.summary.total_items,
          totalMovements: stockMovement.data.summary.total_movements,
          lowStockItems:
            ((_a = lowStock.data) === null || _a === void 0
              ? void 0
              : _a.summary.total_low_stock_items) || 0,
          expiringItems:
            ((_b = expiringItems.data) === null || _b === void 0
              ? void 0
              : _b.summary.total_expiring_items) || 0,
          activeTransfers:
            ((_c = transfers.data) === null || _c === void 0
              ? void 0
              : _c.summary.pending_transfers) || 0,
        },
        performance: {
          averageTurnover:
            ((_d = locationPerformance.data) === null || _d === void 0
              ? void 0
              : _d.summary.average_turnover_rate) || 0,
          bestLocation:
            ((_e = locationPerformance.data) === null || _e === void 0
              ? void 0
              : _e.summary.best_performing_location) || "",
          systemEfficiency:
            ((_f = locationPerformance.data) === null || _f === void 0
              ? void 0
              : _f.summary.average_performance_score) || 0,
        },
        trends: {
          valueIn: stockMovement.data.summary.total_value_in,
          valueOut: stockMovement.data.summary.total_value_out,
          netValue: stockMovement.data.summary.net_value,
          movementsByType: stockMovement.data.summary.by_type,
        },
      };
    },
    [
      stockValuation.data,
      stockMovement.data,
      lowStock.data,
      expiringItems.data,
      transfers.data,
      locationPerformance.data,
    ],
  );
  var isLoading =
    stockValuation.isLoading ||
    stockMovement.isLoading ||
    lowStock.isLoading ||
    expiringItems.isLoading ||
    transfers.isLoading ||
    locationPerformance.isLoading;
  var error =
    stockValuation.error ||
    stockMovement.error ||
    lowStock.error ||
    expiringItems.error ||
    transfers.error ||
    locationPerformance.error;
  var refetchAll = (0, react_1.useCallback)(
    function () {
      stockValuation.refetch();
      stockMovement.refetch();
      lowStock.refetch();
      expiringItems.refetch();
      transfers.refetch();
      locationPerformance.refetch();
    },
    [
      stockValuation.refetch,
      stockMovement.refetch,
      lowStock.refetch,
      expiringItems.refetch,
      transfers.refetch,
      locationPerformance.refetch,
    ],
  );
  return {
    analytics: analytics,
    isLoading: isLoading,
    error: error,
    refetchAll: refetchAll,
    reports: {
      stockValuation: stockValuation.data,
      stockMovement: stockMovement.data,
      lowStock: lowStock.data,
      expiringItems: expiringItems.data,
      transfers: transfers.data,
      locationPerformance: locationPerformance.data,
    },
  };
}
