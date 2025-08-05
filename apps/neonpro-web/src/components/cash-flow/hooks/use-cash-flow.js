"use client";
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
exports.useCashFlow = useCashFlow;
// Cash Flow Hook - React hook for cash flow operations
// Following financial dashboard patterns from Context7 research
var react_1 = require("react");
var sonner_1 = require("sonner");
var cash_flow_service_1 = require("../services/cash-flow-service");
function useCashFlow(clinicId, initialFilters) {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    entries = _a[0],
    setEntries = _a[1];
  var _b = (0, react_1.useState)(null),
    analytics = _b[0],
    setAnalytics = _b[1];
  var _c = (0, react_1.useState)(false),
    loading = _c[0],
    setLoading = _c[1];
  var _d = (0, react_1.useState)(null),
    error = _d[0],
    setError = _d[1];
  var _e = (0, react_1.useState)(0),
    totalPages = _e[0],
    setTotalPages = _e[1];
  var _f = (0, react_1.useState)(1),
    currentPage = _f[0],
    setCurrentPage = _f[1];
  var _g = (0, react_1.useState)(initialFilters),
    filters = _g[0],
    setFilters = _g[1];
  var loadEntries = (0, react_1.useCallback)(
    function (newFilters_1) {
      var args_1 = [];
      for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
      }
      return __awaiter(
        _this,
        __spreadArray([newFilters_1], args_1, true),
        void 0,
        function (newFilters, page) {
          var filtersToUse, result, err_1, errorMessage;
          if (page === void 0) {
            page = 1;
          }
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, 3, 4]);
                setLoading(true);
                setError(null);
                filtersToUse = newFilters || filters;
                setFilters(filtersToUse);
                setCurrentPage(page);
                return [
                  4 /*yield*/,
                  cash_flow_service_1.cashFlowService.getCashFlowEntries(
                    clinicId,
                    filtersToUse,
                    page,
                  ),
                ];
              case 1:
                result = _a.sent();
                setEntries(result.data);
                setTotalPages(result.totalPages);
                return [3 /*break*/, 4];
              case 2:
                err_1 = _a.sent();
                errorMessage =
                  err_1 instanceof Error ? err_1.message : "Failed to load cash flow entries";
                setError(errorMessage);
                sonner_1.toast.error(errorMessage);
                return [3 /*break*/, 4];
              case 3:
                setLoading(false);
                return [7 /*endfinally*/];
              case 4:
                return [2 /*return*/];
            }
          });
        },
      );
    },
    [clinicId, filters],
  );
  var loadAnalytics = (0, react_1.useCallback)(
    function (periodStart, periodEnd, registerId) {
      return __awaiter(_this, void 0, void 0, function () {
        var analyticsData, err_2, errorMessage;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, 3, 4]);
              setLoading(true);
              setError(null);
              return [
                4 /*yield*/,
                cash_flow_service_1.cashFlowService.getCashFlowAnalytics(
                  clinicId,
                  periodStart,
                  periodEnd,
                  registerId,
                ),
              ];
            case 1:
              analyticsData = _a.sent();
              setAnalytics(analyticsData);
              return [3 /*break*/, 4];
            case 2:
              err_2 = _a.sent();
              errorMessage = err_2 instanceof Error ? err_2.message : "Failed to load analytics";
              setError(errorMessage);
              sonner_1.toast.error(errorMessage);
              return [3 /*break*/, 4];
            case 3:
              setLoading(false);
              return [7 /*endfinally*/];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [clinicId],
  );
  var createEntry = (0, react_1.useCallback)(function (entry) {
    return __awaiter(_this, void 0, void 0, function () {
      var newEntry_1, err_3, errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            setError(null);
            return [4 /*yield*/, cash_flow_service_1.cashFlowService.createCashFlowEntry(entry)];
          case 1:
            newEntry_1 = _a.sent();
            // Add the new entry to the current list (optimistic update)
            setEntries(function (prev) {
              return __spreadArray([newEntry_1], prev, true);
            });
            sonner_1.toast.success("Transaction created successfully");
            return [3 /*break*/, 4];
          case 2:
            err_3 = _a.sent();
            errorMessage = err_3 instanceof Error ? err_3.message : "Failed to create transaction";
            setError(errorMessage);
            sonner_1.toast.error(errorMessage);
            throw err_3;
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var updateEntry = (0, react_1.useCallback)(function (id, updates) {
    return __awaiter(_this, void 0, void 0, function () {
      var updatedEntry_1, err_4, errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            setError(null);
            return [
              4 /*yield*/,
              cash_flow_service_1.cashFlowService.updateCashFlowEntry(id, updates),
            ];
          case 1:
            updatedEntry_1 = _a.sent();
            // Update the entry in the current list (optimistic update)
            setEntries(function (prev) {
              return prev.map(function (entry) {
                return entry.id === id ? updatedEntry_1 : entry;
              });
            });
            sonner_1.toast.success("Transaction updated successfully");
            return [3 /*break*/, 4];
          case 2:
            err_4 = _a.sent();
            errorMessage = err_4 instanceof Error ? err_4.message : "Failed to update transaction";
            setError(errorMessage);
            sonner_1.toast.error(errorMessage);
            throw err_4;
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var deleteEntry = (0, react_1.useCallback)(function (id) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_5, errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setLoading(true);
            setError(null);
            return [4 /*yield*/, cash_flow_service_1.cashFlowService.deleteCashFlowEntry(id)];
          case 1:
            _a.sent();
            // Remove the entry from the current list (optimistic update)
            setEntries(function (prev) {
              return prev.filter(function (entry) {
                return entry.id !== id;
              });
            });
            sonner_1.toast.success("Transaction deleted successfully");
            return [3 /*break*/, 4];
          case 2:
            err_5 = _a.sent();
            errorMessage = err_5 instanceof Error ? err_5.message : "Failed to delete transaction";
            setError(errorMessage);
            sonner_1.toast.error(errorMessage);
            throw err_5;
          case 3:
            setLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var refetch = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadEntries(filters, currentPage)];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadEntries, filters, currentPage],
  );
  // Load initial data
  (0, react_1.useEffect)(
    function () {
      if (clinicId) {
        loadEntries(initialFilters);
      }
    },
    [clinicId, loadEntries, initialFilters],
  );
  return {
    entries: entries,
    analytics: analytics,
    loading: loading,
    error: error,
    totalPages: totalPages,
    currentPage: currentPage,
    createEntry: createEntry,
    updateEntry: updateEntry,
    deleteEntry: deleteEntry,
    loadEntries: loadEntries,
    loadAnalytics: loadAnalytics,
    refetch: refetch,
  };
}
