// =====================================================================================
// NeonPro Inventory Alerts Hook
// Epic 6: Real-time Stock Tracking System
// Created: 2025-01-26
// =====================================================================================
"use client";
"use strict";
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
exports.alertUtils = exports.AlertType = exports.AlertSeverity = void 0;
exports.useInventoryAlerts = useInventoryAlerts;
var react_1 = require("react");
var sonner_1 = require("sonner");
// =====================================================================================
// CUSTOM HOOK
// =====================================================================================
function useInventoryAlerts() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    alerts = _a[0],
    setAlerts = _a[1];
  var _b = (0, react_1.useState)(true),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)(true),
    mounted = _d[0],
    setMounted = _d[1];
  // =====================================================================================
  // COMPUTED VALUES
  // =====================================================================================
  var unreadCount = alerts.filter(function (alert) {
    return !alert.is_read;
  }).length;
  var criticalCount = alerts.filter(function (alert) {
    return alert.severity === "critical" || alert.severity === "high";
  }).length;
  // =====================================================================================
  // LOAD ALERTS
  // =====================================================================================
  var loadAlerts = (0, react_1.useCallback)(function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (filters) {
      var searchParams, response, data, err_1;
      if (filters === void 0) {
        filters = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setLoading(true);
            setError(null);
            searchParams = new URLSearchParams();
            if (filters.type) searchParams.set("type", filters.type);
            if (filters.severity) searchParams.set("severity", filters.severity);
            if (filters.is_read !== undefined)
              searchParams.set("is_read", filters.is_read.toString());
            if (filters.location_id) searchParams.set("location_id", filters.location_id);
            if (filters.limit) searchParams.set("limit", filters.limit.toString());
            if (filters.offset) searchParams.set("offset", filters.offset.toString());
            return [4 /*yield*/, fetch("/api/inventory/alerts?".concat(searchParams.toString()))];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to load alerts");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setAlerts(data);
            return [3 /*break*/, 5];
          case 3:
            err_1 = _a.sent();
            console.error("Error loading alerts:", err_1);
            setError(err_1 instanceof Error ? err_1.message : "Failed to load alerts");
            sonner_1.toast.error("Failed to load inventory alerts");
            return [3 /*break*/, 5];
          case 4:
            setLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // =====================================================================================
  // MARK ALERT AS READ
  // =====================================================================================
  var markAsRead = (0, react_1.useCallback)(function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/".concat(alertId), {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to mark alert as read");
            }
            setAlerts(function (prev) {
              return prev.map(function (alert) {
                return alert.id === alertId
                  ? __assign(__assign({}, alert), { is_read: true })
                  : alert;
              });
            });
            sonner_1.toast.success("Alert marked as read");
            return [3 /*break*/, 3];
          case 2:
            err_2 = _a.sent();
            console.error("Error marking alert as read:", err_2);
            sonner_1.toast.error("Failed to mark alert as read");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // =====================================================================================
  // DISMISS ALERT
  // =====================================================================================
  var dismissAlert = (0, react_1.useCallback)(function (alertId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/".concat(alertId), {
                method: "DELETE",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to dismiss alert");
            }
            setAlerts(function (prev) {
              return prev.filter(function (alert) {
                return alert.id !== alertId;
              });
            });
            sonner_1.toast.success("Alert dismissed");
            return [3 /*break*/, 3];
          case 2:
            err_3 = _a.sent();
            console.error("Error dismissing alert:", err_3);
            sonner_1.toast.error("Failed to dismiss alert");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // =====================================================================================
  // MARK ALL AS READ
  // =====================================================================================
  var markAllAsRead = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts/mark-all-read", {
                method: "PATCH",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to mark all alerts as read");
            }
            setAlerts(function (prev) {
              return prev.map(function (alert) {
                return __assign(__assign({}, alert), { is_read: true });
              });
            });
            sonner_1.toast.success("All alerts marked as read");
            return [3 /*break*/, 3];
          case 2:
            err_4 = _a.sent();
            console.error("Error marking all alerts as read:", err_4);
            sonner_1.toast.error("Failed to mark all alerts as read");
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // =====================================================================================
  // CREATE ALERT
  // =====================================================================================
  var createAlert = (0, react_1.useCallback)(function (alertData) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, newAlert_1, err_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/inventory/alerts", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(alertData),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to create alert");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            newAlert_1 = _a.sent();
            setAlerts(function (prev) {
              return __spreadArray([newAlert_1], prev, true);
            });
            // Show notification based on severity
            if (newAlert_1.severity === "critical" || newAlert_1.severity === "high") {
              sonner_1.toast.error("Critical Alert: ".concat(newAlert_1.title));
            } else {
              sonner_1.toast.warning("New Alert: ".concat(newAlert_1.title));
            }
            return [3 /*break*/, 4];
          case 3:
            err_5 = _a.sent();
            console.error("Error creating alert:", err_5);
            sonner_1.toast.error("Failed to create alert");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // =====================================================================================
  // REFRESH ALERTS
  // =====================================================================================
  var refreshAlerts = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, loadAlerts()];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    },
    [loadAlerts],
  );
  // =====================================================================================
  // INITIAL LOAD
  // =====================================================================================
  (0, react_1.useEffect)(
    function () {
      loadAlerts();
    },
    [loadAlerts],
  );
  // =====================================================================================
  // AUTO REFRESH (EVERY 30 SECONDS)
  // =====================================================================================
  (0, react_1.useEffect)(
    function () {
      var interval = setInterval(function () {
        loadAlerts();
      }, 30000); // Refresh every 30 seconds
      return function () {
        return clearInterval(interval);
      };
    },
    [loadAlerts],
  );
  // =====================================================================================
  // RETURN HOOK INTERFACE
  // =====================================================================================
  // =====================================================================================
  // CLEANUP EFFECT
  // =====================================================================================
  (0, react_1.useEffect)(function () {
    return function () {
      setMounted(false);
    };
  }, []);
  return {
    alerts: alerts,
    loading: loading,
    error: error,
    unreadCount: unreadCount,
    criticalCount: criticalCount,
    loadAlerts: loadAlerts,
    markAsRead: markAsRead,
    dismissAlert: dismissAlert,
    markAllAsRead: markAllAsRead,
    createAlert: createAlert,
    refreshAlerts: refreshAlerts,
  };
}
// =====================================================================================
// ALERT SEVERITY HELPERS
// =====================================================================================
exports.AlertSeverity = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
};
exports.AlertType = {
  LOW_STOCK: "low_stock",
  OUT_OF_STOCK: "out_of_stock",
  EXPIRED: "expired",
  EXPIRING_SOON: "expiring_soon",
  OVERSTOCK: "overstock",
};
// =====================================================================================
// ALERT UTILITIES
// =====================================================================================
exports.alertUtils = {
  getSeverityColor: function (severity) {
    switch (severity) {
      case "critical":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  },
  getSeverityBadgeColor: function (severity) {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },
  getTypeLabel: function (type) {
    switch (type) {
      case "low_stock":
        return "Low Stock";
      case "out_of_stock":
        return "Out of Stock";
      case "expired":
        return "Expired";
      case "expiring_soon":
        return "Expiring Soon";
      case "overstock":
        return "Overstock";
      default:
        return "Unknown";
    }
  },
  shouldShowNotification: function (alert) {
    return alert.severity === "critical" || alert.severity === "high";
  },
};
