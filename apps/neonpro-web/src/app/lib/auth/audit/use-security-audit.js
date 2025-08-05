"use strict";
/**
 * React Hook for Security Audit Monitoring
 *
 * Provides real-time security metrics, alerts, and audit trail monitoring
 * for the NeonPro application security dashboard.
 */
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
exports.useSecurityAudit = useSecurityAudit;
exports.useAuthAudit = useAuthAudit;
var react_1 = require("react");
var security_audit_logger_1 = require("./security-audit-logger");
function useSecurityAudit(options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  var _a = options.refreshInterval,
    refreshInterval = _a === void 0 ? 30000 : _a, // 30 seconds
    _b = options.hoursBack, // 30 seconds
    hoursBack = _b === void 0 ? 24 : _b,
    _c = options.autoRefresh,
    autoRefresh = _c === void 0 ? true : _c,
    _d = options.enableRealTimeAlerts,
    enableRealTimeAlerts = _d === void 0 ? true : _d;
  var _e = (0, react_1.useState)({
      metrics: {
        totalEvents: 0,
        successfulLogins: 0,
        failedLogins: 0,
        suspiciousActivities: 0,
        accountLockouts: 0,
        uniqueUsers: 0,
        uniqueIPs: 0,
        riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
        timeRangeHours: hoursBack,
      },
      suspiciousPatterns: [],
      recentEvents: [],
      recommendations: [],
      isLoading: true,
    }),
    data = _e[0],
    setData = _e[1];
  var _f = (0, react_1.useState)([]),
    alerts = _f[0],
    setAlerts = _f[1];
  // Fetch security data
  var fetchSecurityData = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var report, recentEvents, newAlerts_1, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              setData(function (prev) {
                return __assign(__assign({}, prev), { isLoading: true, error: undefined });
              });
              return [
                4 /*yield*/,
                security_audit_logger_1.securityAuditLogger.getSecurityReport(hoursBack),
              ];
            case 1:
              report = _a.sent();
              return [4 /*yield*/, getRecentAuditEvents(50)]; // Last 50 events
            case 2:
              recentEvents = _a.sent(); // Last 50 events
              setData({
                metrics: report.metrics,
                suspiciousPatterns: report.suspiciousPatterns,
                recentEvents: recentEvents,
                recommendations: report.recommendations,
                isLoading: false,
              });
              // Check for new alerts
              if (enableRealTimeAlerts) {
                newAlerts_1 = report.suspiciousPatterns.filter(function (pattern) {
                  return pattern.riskLevel === "high" || pattern.riskLevel === "critical";
                });
                if (newAlerts_1.length > 0) {
                  setAlerts(function (prev) {
                    return __spreadArray(__spreadArray([], prev, true), newAlerts_1, true);
                  });
                }
              }
              return [3 /*break*/, 4];
            case 3:
              error_1 = _a.sent();
              console.error("Error fetching security data:", error_1);
              setData(function (prev) {
                return __assign(__assign({}, prev), {
                  isLoading: false,
                  error:
                    error_1 instanceof Error
                      ? error_1.message
                      : "Erro ao carregar dados de segurança",
                });
              });
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [hoursBack, enableRealTimeAlerts],
  );
  // Auto-refresh effect
  (0, react_1.useEffect)(
    function () {
      fetchSecurityData();
      if (autoRefresh) {
        var interval_1 = setInterval(fetchSecurityData, refreshInterval);
        return function () {
          return clearInterval(interval_1);
        };
      }
    },
    [fetchSecurityData, autoRefresh, refreshInterval],
  );
  // Clear alerts
  var clearAlerts = (0, react_1.useCallback)(function () {
    setAlerts([]);
  }, []);
  // Clear specific alert
  var clearAlert = (0, react_1.useCallback)(function (index) {
    setAlerts(function (prev) {
      return prev.filter(function (_, i) {
        return i !== index;
      });
    });
  }, []);
  // Manual refresh
  var refresh = (0, react_1.useCallback)(
    function () {
      fetchSecurityData();
    },
    [fetchSecurityData],
  );
  return __assign(__assign({}, data), {
    alerts: alerts,
    clearAlerts: clearAlerts,
    clearAlert: clearAlert,
    refresh: refresh,
  });
}
// Helper function to get recent audit events
function getRecentAuditEvents() {
  return __awaiter(this, arguments, void 0, function (limit) {
    var stored, events;
    if (limit === void 0) {
      limit = 50;
    }
    return __generator(this, function (_a) {
      try {
        stored = localStorage.getItem("security_audit_events");
        if (!stored) return [2 /*return*/, []];
        events = JSON.parse(stored);
        return [
          2 /*return*/,
          events
            .sort(function (a, b) {
              return b.timestamp - a.timestamp;
            })
            .slice(0, limit),
        ];
      } catch (_b) {
        return [2 /*return*/, []];
      }
      return [2 /*return*/];
    });
  });
}
// Hook for logging authentication events from components
function useAuthAudit() {
  var _this = this;
  var logLoginAttempt = (0, react_1.useCallback)(function (email_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(
      _this,
      __spreadArray([email_1], args_1, true),
      void 0,
      function (email, method) {
        if (method === void 0) {
          method = "oauth";
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                security_audit_logger_1.securityAuditLogger.logEvent(
                  security_audit_logger_1.AuditEventType.LOGIN_ATTEMPT,
                  {
                    email: email,
                    method: method,
                    timestamp: Date.now(),
                  },
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      },
    );
  }, []);
  var logLoginSuccess = (0, react_1.useCallback)(function (userId_1, sessionId_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(
      _this,
      __spreadArray([userId_1, sessionId_1], args_1, true),
      void 0,
      function (userId, sessionId, method) {
        if (method === void 0) {
          method = "oauth";
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                security_audit_logger_1.securityAuditLogger.logLoginSuccess(
                  userId,
                  sessionId,
                  method,
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      },
    );
  }, []);
  var logLoginFailure = (0, react_1.useCallback)(function (email_1, reason_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(
      _this,
      __spreadArray([email_1, reason_1], args_1, true),
      void 0,
      function (email, reason, method) {
        if (method === void 0) {
          method = "oauth";
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                security_audit_logger_1.securityAuditLogger.logLoginFailure(email, reason, method),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      },
    );
  }, []);
  var logOAuthFlow = (0, react_1.useCallback)(function (stage, details) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logOAuthFlow(stage, details),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var logSessionEvent = (0, react_1.useCallback)(function (type, userId, sessionId, details) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(type === "created")) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSessionCreated(userId, sessionId),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 4];
          case 2:
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logSessionTerminated(
                userId,
                sessionId,
                (details === null || details === void 0 ? void 0 : details.reason) || "user_logout",
              ),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var logPermissionDenied = (0, react_1.useCallback)(function (userId, resource, action) {
    return __awaiter(_this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              security_audit_logger_1.securityAuditLogger.logPermissionDenied(
                userId,
                resource,
                action,
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  }, []);
  return {
    logLoginAttempt: logLoginAttempt,
    logLoginSuccess: logLoginSuccess,
    logLoginFailure: logLoginFailure,
    logOAuthFlow: logOAuthFlow,
    logSessionEvent: logSessionEvent,
    logPermissionDenied: logPermissionDenied,
  };
}
