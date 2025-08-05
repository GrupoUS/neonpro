"use strict";
// Custom Hook for Intelligent Threshold Management
// Story 6.2: Automated Reorder Alerts + Threshold Management
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
exports.useIntelligentThresholds = useIntelligentThresholds;
var react_1 = require("react");
function useIntelligentThresholds(_a) {
  var _this = this;
  var clinicId = _a.clinicId,
    filters = _a.filters,
    _b = _a.autoRefresh,
    autoRefresh = _b === void 0 ? false : _b,
    _c = _a.refreshInterval,
    refreshInterval = _c === void 0 ? 30000 : _c;
  var _d = (0, react_1.useState)([]),
    thresholds = _d[0],
    setThresholds = _d[1];
  var _e = (0, react_1.useState)([]),
    optimizations = _e[0],
    setOptimizations = _e[1];
  var _f = (0, react_1.useState)([]),
    alerts = _f[0],
    setAlerts = _f[1];
  var _g = (0, react_1.useState)(null),
    alertStats = _g[0],
    setAlertStats = _g[1];
  var _h = (0, react_1.useState)(true),
    loading = _h[0],
    setLoading = _h[1];
  var _j = (0, react_1.useState)(null),
    error = _j[0],
    setError = _j[1];
  // Fetch thresholds with filters
  var fetchThresholds = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var params, response, data, err_1;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 3, , 4]);
              params = new URLSearchParams({ clinic_id: clinicId });
              if (
                (_a = filters === null || filters === void 0 ? void 0 : filters.item_category) ===
                  null || _a === void 0
                  ? void 0
                  : _a.length
              ) {
                params.append("item_category", filters.item_category[0]); // API expects single category for now
              }
              if (
                (filters === null || filters === void 0 ? void 0 : filters.auto_reorder_enabled) !==
                undefined
              ) {
                params.append("auto_reorder_enabled", filters.auto_reorder_enabled.toString());
              }
              if (
                (filters === null || filters === void 0 ? void 0 : filters.needs_optimization) !==
                undefined
              ) {
                params.append("needs_optimization", filters.needs_optimization.toString());
              }
              return [4 /*yield*/, fetch("/api/inventory/thresholds?".concat(params))];
            case 1:
              response = _b.sent();
              if (!response.ok) throw new Error("Failed to fetch thresholds");
              return [4 /*yield*/, response.json()];
            case 2:
              data = _b.sent();
              setThresholds(data.data);
              return [3 /*break*/, 4];
            case 3:
              err_1 = _b.sent();
              setError(err_1.message);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId, filters],
  );
  // Fetch optimization analysis
  var fetchOptimizations = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/thresholds/optimize?clinic_id=".concat(clinicId)),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Failed to fetch optimizations");
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setOptimizations(data.data);
              return [3 /*break*/, 4];
            case 3:
              err_2 = _a.sent();
              setError(err_2.message);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId],
  );
  // Fetch alert statistics
  var fetchAlertStats = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/alerts/stats?clinic_id=".concat(clinicId)),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) throw new Error("Failed to fetch alert stats");
              return [4 /*yield*/, response.json()];
            case 2:
              data = _a.sent();
              setAlertStats(data.data);
              return [3 /*break*/, 4];
            case 3:
              err_3 = _a.sent();
              setError(err_3.message);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId],
  );
  // Load all data
  var loadData = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var err_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, 4, 5]);
              return [
                4 /*yield*/,
                Promise.all([fetchThresholds(), fetchOptimizations(), fetchAlertStats()]),
              ];
            case 2:
              _a.sent();
              return [3 /*break*/, 5];
            case 3:
              err_4 = _a.sent();
              setError(err_4.message);
              return [3 /*break*/, 5];
            case 4:
              setLoading(false);
              return [7 /*endfinally*/];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchThresholds, fetchOptimizations, fetchAlertStats],
  );
  // Create new threshold
  var createThreshold = (0, react_1.useCallback)(
    function (thresholdData) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, err_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 6, , 7]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/thresholds", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(thresholdData),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to create threshold");
            case 3:
              return [4 /*yield*/, response.json()];
            case 4:
              data = _a.sent();
              return [4 /*yield*/, fetchThresholds()];
            case 5:
              _a.sent(); // Refresh list
              return [2 /*return*/, data.data];
            case 6:
              err_5 = _a.sent();
              setError(err_5.message);
              throw err_5;
            case 7:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchThresholds],
  );
  // Update threshold
  var updateThreshold = (0, react_1.useCallback)(
    function (id, updates) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, err_6;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 6, , 7]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/thresholds/".concat(id), {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(updates),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to update threshold");
            case 3:
              return [4 /*yield*/, response.json()];
            case 4:
              data = _a.sent();
              return [4 /*yield*/, fetchThresholds()];
            case 5:
              _a.sent(); // Refresh list
              return [2 /*return*/, data.data];
            case 6:
              err_6 = _a.sent();
              setError(err_6.message);
              throw err_6;
            case 7:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchThresholds],
  );
  // Delete threshold (soft delete)
  var deleteThreshold = (0, react_1.useCallback)(
    function (id) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_7;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/thresholds/".concat(id), {
                  method: "DELETE",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to delete threshold");
            case 3:
              return [4 /*yield*/, fetchThresholds()];
            case 4:
              _a.sent(); // Refresh list
              return [3 /*break*/, 6];
            case 5:
              err_7 = _a.sent();
              setError(err_7.message);
              throw err_7;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchThresholds],
  );
  // Generate demand forecast
  var generateForecast = (0, react_1.useCallback)(
    function (itemId, forecastPeriod, forecastDate) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, err_8;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/forecasting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    item_id: itemId,
                    clinic_id: clinicId,
                    forecast_period: forecastPeriod,
                    forecast_date:
                      (forecastDate === null || forecastDate === void 0
                        ? void 0
                        : forecastDate.toISOString()) || new Date().toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to generate forecast");
            case 3:
              return [4 /*yield*/, response.json()];
            case 4:
              data = _a.sent();
              return [2 /*return*/, data.data];
            case 5:
              err_8 = _a.sent();
              setError(err_8.message);
              throw err_8;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId],
  );
  // Bulk forecast generation
  var generateBulkForecast = (0, react_1.useCallback)(
    function (items, forecastDate) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, data, err_9;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/forecasting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    items: items,
                    clinic_id: clinicId,
                    forecast_date:
                      (forecastDate === null || forecastDate === void 0
                        ? void 0
                        : forecastDate.toISOString()) || new Date().toISOString(),
                  }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to generate bulk forecast");
            case 3:
              return [4 /*yield*/, response.json()];
            case 4:
              data = _a.sent();
              return [2 /*return*/, data];
            case 5:
              err_9 = _a.sent();
              setError(err_9.message);
              throw err_9;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId],
  );
  // Alert actions
  var acknowledgeAlert = (0, react_1.useCallback)(
    function (alertId, userId, notes) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_10;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/alerts/".concat(alertId, "/acknowledge"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: userId, notes: notes }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to acknowledge alert");
            case 3:
              return [4 /*yield*/, fetchAlertStats()];
            case 4:
              _a.sent(); // Refresh stats
              return [2 /*return*/, response.json()];
            case 5:
              err_10 = _a.sent();
              setError(err_10.message);
              throw err_10;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchAlertStats],
  );
  var resolveAlert = (0, react_1.useCallback)(
    function (alertId, userId, notes) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_11;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/alerts/".concat(alertId, "/resolve"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user_id: userId, notes: notes }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to resolve alert");
            case 3:
              return [4 /*yield*/, fetchAlertStats()];
            case 4:
              _a.sent(); // Refresh stats
              return [2 /*return*/, response.json()];
            case 5:
              err_11 = _a.sent();
              setError(err_11.message);
              throw err_11;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchAlertStats],
  );
  var escalateAlert = (0, react_1.useCallback)(
    function (alertId, escalateTo, level) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, errorData, err_12;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 5, , 6]);
              return [
                4 /*yield*/,
                fetch("/api/inventory/alerts/".concat(alertId, "/escalate"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ escalate_to: escalateTo, level: level }),
                }),
              ];
            case 1:
              response = _a.sent();
              if (!!response.ok) return [3 /*break*/, 3];
              return [4 /*yield*/, response.json()];
            case 2:
              errorData = _a.sent();
              throw new Error(errorData.error || "Failed to escalate alert");
            case 3:
              return [4 /*yield*/, fetchAlertStats()];
            case 4:
              _a.sent(); // Refresh stats
              return [2 /*return*/, response.json()];
            case 5:
              err_12 = _a.sent();
              setError(err_12.message);
              throw err_12;
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchAlertStats],
  );
  // Initial load
  (0, react_1.useEffect)(
    function () {
      loadData();
    },
    [loadData],
  );
  // Auto-refresh
  (0, react_1.useEffect)(
    function () {
      if (!autoRefresh) return;
      var interval = setInterval(loadData, refreshInterval);
      return function () {
        return clearInterval(interval);
      };
    },
    [autoRefresh, refreshInterval, loadData],
  );
  return {
    // Data
    thresholds: thresholds,
    optimizations: optimizations,
    alerts: alerts,
    alertStats: alertStats,
    // State
    loading: loading,
    error: error,
    // Actions
    refresh: loadData,
    createThreshold: createThreshold,
    updateThreshold: updateThreshold,
    deleteThreshold: deleteThreshold,
    generateForecast: generateForecast,
    generateBulkForecast: generateBulkForecast,
    acknowledgeAlert: acknowledgeAlert,
    resolveAlert: resolveAlert,
    escalateAlert: escalateAlert,
    // Computed values
    totalThresholds: thresholds.length,
    activeThresholds: thresholds.filter(function (t) {
      return t.is_active;
    }).length,
    autoReorderEnabled: thresholds.filter(function (t) {
      return t.auto_reorder_enabled;
    }).length,
    optimizationOpportunities: optimizations.length,
    totalPotentialSavings: optimizations.reduce(function (sum, opt) {
      return sum + opt.potential_savings;
    }, 0),
  };
}
