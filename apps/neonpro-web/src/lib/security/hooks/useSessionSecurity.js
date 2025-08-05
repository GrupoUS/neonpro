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
exports.useSessionSecurity = useSessionSecurity;
exports.useCSRFToken = useCSRFToken;
exports.useSessionTimeout = useSessionTimeout;
var react_1 = require("react");
var auth_helpers_react_1 = require("@supabase/auth-helpers-react");
var DEFAULT_TIMEOUT_CONFIG = {
  timeoutMinutes: 30,
  warningMinutes: [5, 2, 1],
  extendOnActivity: true,
  showWarnings: true,
};
/**
 * Main session security hook
 */
function useSessionSecurity(options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  var _a = options.enableCSRF,
    enableCSRF = _a === void 0 ? true : _a,
    _b = options.enableTimeout,
    enableTimeout = _b === void 0 ? true : _b,
    _c = options.enableActivityTracking,
    enableActivityTracking = _c === void 0 ? true : _c,
    _d = options.timeoutConfig,
    timeoutConfig = _d === void 0 ? {} : _d,
    onSecurityWarning = options.onSecurityWarning,
    onSessionTimeout = options.onSessionTimeout,
    onCSRFError = options.onCSRFError;
  var supabase = (0, auth_helpers_react_1.useSupabaseClient)();
  var user = (0, auth_helpers_react_1.useUser)();
  var _e = (0, react_1.useState)({
      isSecure: true,
      riskScore: 0,
      warnings: [],
      lastActivity: new Date(),
    }),
    securityState = _e[0],
    setSecurityState = _e[1];
  var timeoutRef = (0, react_1.useRef)();
  var warningTimeoutsRef = (0, react_1.useRef)([]);
  var activityListenerRef = (0, react_1.useRef)(null);
  var config = __assign(__assign({}, DEFAULT_TIMEOUT_CONFIG), timeoutConfig);
  /**
   * Initialize session security
   */
  var initializeSecurity = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var sessionId_1, csrfToken_1, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!user) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 6, , 7]);
              sessionId_1 = sessionStorage.getItem("session-id");
              if (!sessionId_1) {
                sessionId_1 = "session_"
                  .concat(Date.now(), "_")
                  .concat(Math.random().toString(36).substr(2, 9));
                sessionStorage.setItem("session-id", sessionId_1);
              }
              if (!enableCSRF) return [3 /*break*/, 3];
              return [4 /*yield*/, fetchCSRFToken(sessionId_1)];
            case 2:
              csrfToken_1 = _a.sent();
              _a.label = 3;
            case 3:
              if (!enableTimeout) return [3 /*break*/, 5];
              return [4 /*yield*/, initializeSessionTimeout(sessionId_1)];
            case 4:
              _a.sent();
              _a.label = 5;
            case 5:
              // Setup activity tracking if enabled
              if (enableActivityTracking) {
                setupActivityTracking(sessionId_1);
              }
              setSecurityState(function (prev) {
                return __assign(__assign({}, prev), {
                  sessionId: sessionId_1,
                  csrfToken: csrfToken_1,
                  lastActivity: new Date(),
                });
              });
              return [3 /*break*/, 7];
            case 6:
              error_1 = _a.sent();
              console.error("Failed to initialize session security:", error_1);
              setSecurityState(function (prev) {
                return __assign(__assign({}, prev), {
                  isSecure: false,
                  warnings: __spreadArray(
                    __spreadArray([], prev.warnings, true),
                    ["Failed to initialize security"],
                    false,
                  ),
                });
              });
              return [3 /*break*/, 7];
            case 7:
              return [2 /*return*/];
          }
        });
      });
    },
    [user, enableCSRF, enableTimeout, enableActivityTracking],
  );
  /**
   * Fetch CSRF token from server
   */
  var fetchCSRFToken = function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch("/api/security/csrf-token", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Session-ID": sessionId,
                },
                body: JSON.stringify({ sessionId: sessionId }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch CSRF token");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            return [2 /*return*/, data.token];
          case 3:
            error_2 = _a.sent();
            console.error("CSRF token fetch error:", error_2);
            onCSRFError === null || onCSRFError === void 0 ? void 0 : onCSRFError();
            throw error_2;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Initialize session timeout
   */
  var initializeSessionTimeout = function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("/api/security/session-timeout", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Session-ID": sessionId,
                },
                body: JSON.stringify({
                  sessionId: sessionId,
                  config: {
                    timeoutMinutes: config.timeoutMinutes,
                    warningMinutes: config.warningMinutes,
                    extendOnActivity: config.extendOnActivity,
                  },
                }),
              }),
            ];
          case 1:
            _a.sent();
            // Setup timeout monitoring
            setupTimeoutMonitoring(sessionId);
            return [3 /*break*/, 3];
          case 2:
            error_3 = _a.sent();
            console.error("Failed to initialize session timeout:", error_3);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Setup timeout monitoring
   */
  var setupTimeoutMonitoring = function (sessionId) {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    warningTimeoutsRef.current.forEach(function (timeout) {
      return clearTimeout(timeout);
    });
    warningTimeoutsRef.current = [];
    var timeoutMs = config.timeoutMinutes * 60 * 1000;
    var now = Date.now();
    // Setup warning timeouts
    config.warningMinutes.forEach(function (warningMinutes) {
      var warningMs = (config.timeoutMinutes - warningMinutes) * 60 * 1000;
      var warningTimeout = setTimeout(function () {
        var warning = "Session will expire in "
          .concat(warningMinutes, " minute")
          .concat(warningMinutes !== 1 ? "s" : "");
        setSecurityState(function (prev) {
          return __assign(__assign({}, prev), {
            timeoutWarning: warning,
            warnings: __spreadArray(__spreadArray([], prev.warnings, true), [warning], false),
          });
        });
        if (config.showWarnings) {
          onSecurityWarning === null || onSecurityWarning === void 0
            ? void 0
            : onSecurityWarning(warning);
        }
      }, warningMs);
      warningTimeoutsRef.current.push(warningTimeout);
    });
    // Setup final timeout
    timeoutRef.current = setTimeout(function () {
      handleSessionTimeout(sessionId);
    }, timeoutMs);
  };
  /**
   * Handle session timeout
   */
  var handleSessionTimeout = function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // Force timeout on server
            return [
              4 /*yield*/,
              fetch("/api/security/session-timeout/force", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Session-ID": sessionId,
                },
                body: JSON.stringify({ sessionId: sessionId }),
              }),
            ];
          case 1:
            // Force timeout on server
            _a.sent();
            // Clear local session data
            sessionStorage.removeItem("session-id");
            localStorage.clear();
            setSecurityState(function (prev) {
              return __assign(__assign({}, prev), {
                isSecure: false,
                warnings: __spreadArray(
                  __spreadArray([], prev.warnings, true),
                  ["Session has expired"],
                  false,
                ),
              });
            });
            onSessionTimeout === null || onSessionTimeout === void 0 ? void 0 : onSessionTimeout();
            return [3 /*break*/, 3];
          case 2:
            error_4 = _a.sent();
            console.error("Failed to handle session timeout:", error_4);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Setup activity tracking
   */
  var setupActivityTracking = function (sessionId) {
    // Remove existing listener
    if (activityListenerRef.current) {
      activityListenerRef.current();
    }
    var activities = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    var lastActivityTime = Date.now();
    var throttleMs = 30000; // 30 seconds throttle
    var handleActivity = function () {
      return __awaiter(_this, void 0, void 0, function () {
        var now, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              now = Date.now();
              if (now - lastActivityTime < throttleMs) return [2 /*return*/];
              lastActivityTime = now;
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              // Update activity on server
              return [
                4 /*yield*/,
                fetch("/api/security/session-activity", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Session-ID": sessionId,
                  },
                  body: JSON.stringify({
                    sessionId: sessionId,
                    activityType: "user_interaction",
                    timestamp: new Date().toISOString(),
                  }),
                }),
              ];
            case 2:
              // Update activity on server
              _a.sent();
              // Update local state
              setSecurityState(function (prev) {
                return __assign(__assign({}, prev), { lastActivity: new Date() });
              });
              // Extend session if configured
              if (config.extendOnActivity && enableTimeout) {
                setupTimeoutMonitoring(sessionId);
              }
              return [3 /*break*/, 4];
            case 3:
              error_5 = _a.sent();
              console.error("Failed to update activity:", error_5);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    };
    // Add event listeners
    activities.forEach(function (activity) {
      document.addEventListener(activity, handleActivity, { passive: true });
    });
    // Store cleanup function
    activityListenerRef.current = function () {
      activities.forEach(function (activity) {
        document.removeEventListener(activity, handleActivity);
      });
    };
  };
  /**
   * Extend session manually
   */
  var extendSession = (0, react_1.useCallback)(
    function () {
      var args_1 = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
      }
      return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (minutes) {
        var error_6;
        if (minutes === void 0) {
          minutes = config.timeoutMinutes;
        }
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!securityState.sessionId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("/api/security/session-timeout/extend", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Session-ID": securityState.sessionId,
                  },
                  body: JSON.stringify({
                    sessionId: securityState.sessionId,
                    extensionMinutes: minutes,
                  }),
                }),
              ];
            case 2:
              _a.sent();
              // Reset timeout monitoring
              if (enableTimeout) {
                setupTimeoutMonitoring(securityState.sessionId);
              }
              setSecurityState(function (prev) {
                return __assign(__assign({}, prev), {
                  timeoutWarning: undefined,
                  warnings: prev.warnings.filter(function (w) {
                    return !w.includes("expire");
                  }),
                });
              });
              return [3 /*break*/, 4];
            case 3:
              error_6 = _a.sent();
              console.error("Failed to extend session:", error_6);
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [securityState.sessionId, config.timeoutMinutes, enableTimeout],
  );
  /**
   * Refresh CSRF token
   */
  var refreshCSRFToken = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var newToken_1, error_7;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!enableCSRF || !securityState.sessionId) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 3, , 4]);
              return [4 /*yield*/, fetchCSRFToken(securityState.sessionId)];
            case 2:
              newToken_1 = _a.sent();
              setSecurityState(function (prev) {
                return __assign(__assign({}, prev), { csrfToken: newToken_1 });
              });
              return [2 /*return*/, newToken_1];
            case 3:
              error_7 = _a.sent();
              console.error("Failed to refresh CSRF token:", error_7);
              return [2 /*return*/, null];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [enableCSRF, securityState.sessionId],
  );
  /**
   * Get headers for secure requests
   */
  var getSecureHeaders = (0, react_1.useCallback)(
    function () {
      var headers = {};
      if (securityState.sessionId) {
        headers["X-Session-ID"] = securityState.sessionId;
      }
      if (enableCSRF && securityState.csrfToken) {
        headers["X-CSRF-Token"] = securityState.csrfToken;
      }
      return headers;
    },
    [securityState.sessionId, securityState.csrfToken, enableCSRF],
  );
  /**
   * Cleanup on unmount
   */
  (0, react_1.useEffect)(function () {
    return function () {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      warningTimeoutsRef.current.forEach(function (timeout) {
        return clearTimeout(timeout);
      });
      if (activityListenerRef.current) {
        activityListenerRef.current();
      }
    };
  }, []);
  /**
   * Initialize on mount and user change
   */
  (0, react_1.useEffect)(
    function () {
      if (user) {
        initializeSecurity();
      }
    },
    [user, initializeSecurity],
  );
  return {
    securityState: securityState,
    extendSession: extendSession,
    refreshCSRFToken: refreshCSRFToken,
    getSecureHeaders: getSecureHeaders,
    isSecure: securityState.isSecure,
    warnings: securityState.warnings,
    timeoutWarning: securityState.timeoutWarning,
    csrfToken: securityState.csrfToken,
    sessionId: securityState.sessionId,
    lastActivity: securityState.lastActivity,
  };
}
/**
 * Hook for CSRF token management
 */
function useCSRFToken(sessionId) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    token = _a[0],
    setToken = _a[1];
  var _b = (0, react_1.useState)(false),
    loading = _b[0],
    setLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchToken = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, data, err_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!sessionId) return [2 /*return*/];
              setLoading(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch("/api/security/csrf-token", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-Session-ID": sessionId,
                  },
                  body: JSON.stringify({ sessionId: sessionId }),
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to fetch CSRF token");
              }
              return [4 /*yield*/, response.json()];
            case 3:
              data = _a.sent();
              setToken(data.token);
              return [3 /*break*/, 6];
            case 4:
              err_1 = _a.sent();
              setError(err_1 instanceof Error ? err_1.message : "Unknown error");
              return [3 /*break*/, 6];
            case 5:
              setLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [sessionId],
  );
  (0, react_1.useEffect)(
    function () {
      fetchToken();
    },
    [fetchToken],
  );
  return { token: token, loading: loading, error: error, refetch: fetchToken };
}
/**
 * Hook for session timeout warnings
 */
function useSessionTimeout(sessionId, onTimeout) {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    timeRemaining = _a[0],
    setTimeRemaining = _a[1];
  var _b = (0, react_1.useState)(null),
    warning = _b[0],
    setWarning = _b[1];
  (0, react_1.useEffect)(
    function () {
      if (!sessionId) return;
      var checkTimeout = function () {
        return __awaiter(_this, void 0, void 0, function () {
          var response, data, error_8;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 4, , 5]);
                return [
                  4 /*yield*/,
                  fetch("/api/security/session-timeout/status?sessionId=".concat(sessionId)),
                ];
              case 1:
                response = _a.sent();
                if (!response.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, response.json()];
              case 2:
                data = _a.sent();
                setTimeRemaining(data.timeRemaining);
                setWarning(data.warning);
                if (data.shouldTimeout) {
                  onTimeout === null || onTimeout === void 0 ? void 0 : onTimeout();
                }
                _a.label = 3;
              case 3:
                return [3 /*break*/, 5];
              case 4:
                error_8 = _a.sent();
                console.error("Failed to check session timeout:", error_8);
                return [3 /*break*/, 5];
              case 5:
                return [2 /*return*/];
            }
          });
        });
      };
      // Check immediately
      checkTimeout();
      // Check every minute
      var interval = setInterval(checkTimeout, 60000);
      return function () {
        return clearInterval(interval);
      };
    },
    [sessionId, onTimeout],
  );
  return { timeRemaining: timeRemaining, warning: warning };
}
