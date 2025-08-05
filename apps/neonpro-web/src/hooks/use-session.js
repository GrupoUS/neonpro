"use strict";
/**
 * useSession Hook - React Hook for Session Management
 * Provides comprehensive session management with real-time updates and security monitoring
 */
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
exports.useSession = useSession;
exports.useSessionSecurity = useSessionSecurity;
exports.useDeviceManagement = useDeviceManagement;
exports.useSessionAnalytics = useSessionAnalytics;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var session_1 = require("@/types/session");
var sonner_1 = require("sonner");
// Session API endpoints
var SESSION_API = {
  validate: "/api/auth/session/validate",
  refresh: "/api/auth/session/refresh",
  terminate: "/api/auth/session/terminate",
  extend: "/api/auth/session/extend",
  security: "/api/auth/session/security",
  devices: "/api/auth/session/devices",
  active: "/api/auth/session/active",
};
function useSession(options) {
  var _this = this;
  if (options === void 0) {
    options = {};
  }
  var _a = options.autoRefresh,
    autoRefresh = _a === void 0 ? true : _a,
    _b = options.refreshInterval,
    refreshInterval = _b === void 0 ? 60000 : _b, // 1 minute
    onExpiry = options.onExpiry,
    onSecurityAlert = options.onSecurityAlert,
    onDeviceChange = options.onDeviceChange;
  var _c = (0, react_1.useState)(null),
    session = _c[0],
    setSession = _c[1];
  var _d = (0, react_1.useState)(true),
    isLoading = _d[0],
    setIsLoading = _d[1];
  var _e = (0, react_1.useState)(false),
    isValidating = _e[0],
    setIsValidating = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  var _g = (0, react_1.useState)([]),
    securityAlerts = _g[0],
    setSecurityAlerts = _g[1];
  var _h = (0, react_1.useState)(new Date()),
    lastActivity = _h[0],
    setLastActivity = _h[1];
  var router = (0, navigation_1.useRouter)();
  var refreshIntervalRef = (0, react_1.useRef)(null);
  var activityTimeoutRef = (0, react_1.useRef)(null);
  var warningTimeoutRef = (0, react_1.useRef)(null);
  var sessionManagerRef = (0, react_1.useRef)(null);
  // Initialize session validation
  var validateSession = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, result, alerts_1, errorMessage, err_1, error_1;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              setIsValidating(true);
              setError(null);
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, 5, 6]);
              return [
                4 /*yield*/,
                fetch(SESSION_API.validate, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Session validation failed: ".concat(response.statusText));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              result = _a.sent();
              if (result.valid && result.session) {
                setSession(result.session);
                setLastActivity(new Date());
                // Setup session expiry warnings
                setupExpiryWarnings(result.session);
                // Handle security alerts
                if (result.warnings && result.warnings.length > 0) {
                  alerts_1 = result.warnings.map(function (warning, index) {
                    return {
                      id: "warning-".concat(Date.now(), "-").concat(index),
                      type: session_1.SecurityEventType.SUSPICIOUS_ACTIVITY,
                      severity: session_1.SecuritySeverity.MEDIUM,
                      message: warning,
                      timestamp: new Date(),
                      requires_action: false,
                    };
                  });
                  setSecurityAlerts(function (prev) {
                    return __spreadArray(__spreadArray([], prev, true), alerts_1, true);
                  });
                  alerts_1.forEach(function (alert) {
                    return onSecurityAlert === null || onSecurityAlert === void 0
                      ? void 0
                      : onSecurityAlert(alert);
                  });
                }
              } else {
                setSession(null);
                if (result.errors && result.errors.length > 0) {
                  errorMessage = result.errors.join(", ");
                  setError(new Error(errorMessage));
                  // Handle session expiry
                  if (errorMessage.includes("expired")) {
                    onExpiry === null || onExpiry === void 0 ? void 0 : onExpiry();
                    sonner_1.toast.error("Your session has expired. Please log in again.");
                    router.push("/login");
                  }
                }
              }
              return [2 /*return*/, result];
            case 4:
              err_1 = _a.sent();
              error_1 = err_1 instanceof Error ? err_1 : new Error("Session validation failed");
              setError(error_1);
              setSession(null);
              return [
                2 /*return*/,
                {
                  valid: false,
                  errors: [error_1.message],
                  security_score: 0,
                },
              ];
            case 5:
              setIsValidating(false);
              setIsLoading(false);
              return [7 /*endfinally*/];
            case 6:
              return [2 /*return*/];
          }
        });
      });
    },
    [onExpiry, onSecurityAlert, router],
  );
  // Refresh session
  var refresh = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var response, refreshedSession, err_2, error_2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              return [
                4 /*yield*/,
                fetch(SESSION_API.refresh, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Session refresh failed: ".concat(response.statusText));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              refreshedSession = _a.sent();
              setSession(refreshedSession);
              setLastActivity(new Date());
              setupExpiryWarnings(refreshedSession);
              sonner_1.toast.success("Session refreshed successfully");
              return [3 /*break*/, 5];
            case 4:
              err_2 = _a.sent();
              error_2 = err_2 instanceof Error ? err_2 : new Error("Session refresh failed");
              setError(error_2);
              sonner_1.toast.error("Failed to refresh session");
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [session],
  );
  // Terminate session
  var terminate = (0, react_1.useCallback)(
    function () {
      return __awaiter(_this, void 0, void 0, function () {
        var err_3, error_3;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [
                4 /*yield*/,
                fetch(SESSION_API.terminate, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: "include",
                }),
              ];
            case 1:
              _a.sent();
              setSession(null);
              setSecurityAlerts([]);
              clearAllTimeouts();
              sonner_1.toast.success("Session terminated successfully");
              router.push("/login");
              return [3 /*break*/, 3];
            case 2:
              err_3 = _a.sent();
              error_3 = err_3 instanceof Error ? err_3 : new Error("Session termination failed");
              setError(error_3);
              sonner_1.toast.error("Failed to terminate session");
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    },
    [router],
  );
  // Extend session
  var extend = (0, react_1.useCallback)(
    function (minutes) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, extendedSession, err_4, error_4;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              if (!session) return [2 /*return*/];
              _a.label = 1;
            case 1:
              _a.trys.push([1, 4, , 5]);
              return [
                4 /*yield*/,
                fetch(SESSION_API.extend, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ minutes: minutes }),
                  credentials: "include",
                }),
              ];
            case 2:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Session extension failed: ".concat(response.statusText));
              }
              return [4 /*yield*/, response.json()];
            case 3:
              extendedSession = _a.sent();
              setSession(extendedSession);
              setLastActivity(new Date());
              setupExpiryWarnings(extendedSession);
              sonner_1.toast.success("Session extended by ".concat(minutes || 30, " minutes"));
              return [3 /*break*/, 5];
            case 4:
              err_4 = _a.sent();
              error_4 = err_4 instanceof Error ? err_4 : new Error("Session extension failed");
              setError(error_4);
              sonner_1.toast.error("Failed to extend session");
              return [3 /*break*/, 5];
            case 5:
              return [2 /*return*/];
          }
        });
      });
    },
    [session],
  );
  // Register device
  var registerDevice = (0, react_1.useCallback)(
    function (deviceName) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, device, err_5, error_5;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch(SESSION_API.devices, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ deviceName: deviceName }),
                  credentials: "include",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Device registration failed: ".concat(response.statusText));
              }
              return [4 /*yield*/, response.json()];
            case 2:
              device = _a.sent();
              onDeviceChange === null || onDeviceChange === void 0
                ? void 0
                : onDeviceChange(device);
              sonner_1.toast.success("Device registered successfully");
              return [2 /*return*/, device];
            case 3:
              err_5 = _a.sent();
              error_5 = err_5 instanceof Error ? err_5 : new Error("Device registration failed");
              setError(error_5);
              sonner_1.toast.error("Failed to register device");
              throw error_5;
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [onDeviceChange],
  );
  // Get active sessions
  var getActiveSessions = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_6, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch(SESSION_API.active, {
                method: "GET",
                credentials: "include",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to get active sessions: ".concat(response.statusText));
            }
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            err_6 = _a.sent();
            error_6 = err_6 instanceof Error ? err_6 : new Error("Failed to get active sessions");
            setError(error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Terminate specific session
  var terminateSession = (0, react_1.useCallback)(function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_7, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fetch("".concat(SESSION_API.terminate, "/").concat(sessionId), {
                method: "POST",
                credentials: "include",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to terminate session: ".concat(response.statusText));
            }
            sonner_1.toast.success("Session terminated successfully");
            return [3 /*break*/, 3];
          case 2:
            err_7 = _a.sent();
            error_7 = err_7 instanceof Error ? err_7 : new Error("Failed to terminate session");
            setError(error_7);
            sonner_1.toast.error("Failed to terminate session");
            throw error_7;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Get security events
  var getSecurityEvents = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, err_8, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              fetch(SESSION_API.security, {
                method: "GET",
                credentials: "include",
              }),
            ];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to get security events: ".concat(response.statusText));
            }
            return [4 /*yield*/, response.json()];
          case 2:
            return [2 /*return*/, _a.sent()];
          case 3:
            err_8 = _a.sent();
            error_8 = err_8 instanceof Error ? err_8 : new Error("Failed to get security events");
            setError(error_8);
            throw error_8;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  // Setup expiry warnings
  var setupExpiryWarnings = (0, react_1.useCallback)(
    function (currentSession) {
      clearTimeout(warningTimeoutRef.current);
      var now = new Date().getTime();
      var expiresAt = new Date(currentSession.expires_at).getTime();
      var timeUntilExpiry = expiresAt - now;
      // 5-minute warning
      var fiveMinuteWarning = timeUntilExpiry - 5 * 60 * 1000;
      if (fiveMinuteWarning > 0) {
        setTimeout(function () {
          sonner_1.toast.warning("Your session will expire in 5 minutes", {
            action: {
              label: "Extend",
              onClick: function () {
                return extend(30);
              },
            },
          });
        }, fiveMinuteWarning);
      }
      // 1-minute warning
      var oneMinuteWarning = timeUntilExpiry - 1 * 60 * 1000;
      if (oneMinuteWarning > 0) {
        warningTimeoutRef.current = setTimeout(function () {
          sonner_1.toast.error("Your session will expire in 1 minute!", {
            action: {
              label: "Extend Now",
              onClick: function () {
                return extend(30);
              },
            },
          });
        }, oneMinuteWarning);
      }
    },
    [extend],
  );
  // Track user activity
  var trackActivity = (0, react_1.useCallback)(
    function () {
      setLastActivity(new Date());
      // Reset activity timeout
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = setTimeout(function () {
        // Auto-refresh session on activity
        if (session && autoRefresh) {
          validateSession();
        }
      }, 30000); // 30 seconds after activity
    },
    [session, autoRefresh, validateSession],
  );
  // Clear all timeouts
  var clearAllTimeouts = (0, react_1.useCallback)(function () {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
      activityTimeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);
  // Setup activity listeners
  (0, react_1.useEffect)(
    function () {
      var events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
      var handleActivity = function () {
        return trackActivity();
      };
      events.forEach(function (event) {
        document.addEventListener(event, handleActivity, { passive: true });
      });
      return function () {
        events.forEach(function (event) {
          document.removeEventListener(event, handleActivity);
        });
      };
    },
    [trackActivity],
  );
  // Setup auto-refresh interval
  (0, react_1.useEffect)(
    function () {
      if (autoRefresh && session) {
        refreshIntervalRef.current = setInterval(function () {
          validateSession();
        }, refreshInterval);
      }
      return function () {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    },
    [autoRefresh, session, refreshInterval, validateSession],
  );
  // Initial session validation
  (0, react_1.useEffect)(function () {
    validateSession();
  }, []);
  // Cleanup on unmount
  (0, react_1.useEffect)(
    function () {
      return function () {
        clearAllTimeouts();
      };
    },
    [clearAllTimeouts],
  );
  // Handle visibility change (tab focus/blur)
  (0, react_1.useEffect)(
    function () {
      var handleVisibilityChange = function () {
        if (!document.hidden && session) {
          // Validate session when tab becomes visible
          validateSession();
        }
      };
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return function () {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    },
    [session, validateSession],
  );
  // Handle online/offline events
  (0, react_1.useEffect)(
    function () {
      var handleOnline = function () {
        if (session) {
          validateSession();
        }
      };
      var handleOffline = function () {
        sonner_1.toast.warning("You are offline. Session validation paused.");
      };
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return function () {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    },
    [session, validateSession],
  );
  return {
    session: session,
    isLoading: isLoading,
    isValidating: isValidating,
    error: error,
    refresh: refresh,
    terminate: terminate,
    extend: extend,
    validateSecurity: validateSession,
    registerDevice: registerDevice,
    getActiveSessions: getActiveSessions,
    terminateSession: terminateSession,
    getSecurityEvents: getSecurityEvents,
  };
}
// Additional hooks for specific session management features
/**
 * Hook for monitoring session security events
 */
function useSessionSecurity() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    securityEvents = _a[0],
    setSecurityEvents = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchSecurityEvents = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, events, err_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, fetch(SESSION_API.security)];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch security events");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            events = _a.sent();
            setSecurityEvents(events);
            return [3 /*break*/, 5];
          case 3:
            err_9 = _a.sent();
            setError(err_9 instanceof Error ? err_9 : new Error("Unknown error"));
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  (0, react_1.useEffect)(
    function () {
      fetchSecurityEvents();
    },
    [fetchSecurityEvents],
  );
  return {
    securityEvents: securityEvents,
    isLoading: isLoading,
    error: error,
    refresh: fetchSecurityEvents,
  };
}
/**
 * Hook for managing user devices
 */
function useDeviceManagement() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    devices = _a[0],
    setDevices = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchDevices = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, deviceList, err_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, fetch(SESSION_API.devices)];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch devices");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            deviceList = _a.sent();
            setDevices(deviceList);
            return [3 /*break*/, 5];
          case 3:
            err_10 = _a.sent();
            setError(err_10 instanceof Error ? err_10 : new Error("Unknown error"));
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  var trustDevice = (0, react_1.useCallback)(
    function (deviceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, err_11;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("".concat(SESSION_API.devices, "/").concat(deviceId, "/trust"), {
                  method: "POST",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to trust device");
              }
              return [4 /*yield*/, fetchDevices()];
            case 2:
              _a.sent();
              sonner_1.toast.success("Device trusted successfully");
              return [3 /*break*/, 4];
            case 3:
              err_11 = _a.sent();
              setError(err_11 instanceof Error ? err_11 : new Error("Unknown error"));
              sonner_1.toast.error("Failed to trust device");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchDevices],
  );
  var revokeDevice = (0, react_1.useCallback)(
    function (deviceId) {
      return __awaiter(_this, void 0, void 0, function () {
        var response, err_12;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 3, , 4]);
              return [
                4 /*yield*/,
                fetch("".concat(SESSION_API.devices, "/").concat(deviceId), {
                  method: "DELETE",
                }),
              ];
            case 1:
              response = _a.sent();
              if (!response.ok) {
                throw new Error("Failed to revoke device");
              }
              return [4 /*yield*/, fetchDevices()];
            case 2:
              _a.sent();
              sonner_1.toast.success("Device revoked successfully");
              return [3 /*break*/, 4];
            case 3:
              err_12 = _a.sent();
              setError(err_12 instanceof Error ? err_12 : new Error("Unknown error"));
              sonner_1.toast.error("Failed to revoke device");
              return [3 /*break*/, 4];
            case 4:
              return [2 /*return*/];
          }
        });
      });
    },
    [fetchDevices],
  );
  (0, react_1.useEffect)(
    function () {
      fetchDevices();
    },
    [fetchDevices],
  );
  return {
    devices: devices,
    isLoading: isLoading,
    error: error,
    refresh: fetchDevices,
    trustDevice: trustDevice,
    revokeDevice: revokeDevice,
  };
}
/**
 * Hook for session analytics and metrics
 */
function useSessionAnalytics() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var fetchMetrics = (0, react_1.useCallback)(function () {
    return __awaiter(_this, void 0, void 0, function () {
      var response, data, err_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, fetch("/api/auth/session/analytics")];
          case 1:
            response = _a.sent();
            if (!response.ok) {
              throw new Error("Failed to fetch session metrics");
            }
            return [4 /*yield*/, response.json()];
          case 2:
            data = _a.sent();
            setMetrics(data);
            return [3 /*break*/, 5];
          case 3:
            err_13 = _a.sent();
            setError(err_13 instanceof Error ? err_13 : new Error("Unknown error"));
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  }, []);
  (0, react_1.useEffect)(
    function () {
      fetchMetrics();
      // Refresh metrics every 5 minutes
      var interval = setInterval(fetchMetrics, 5 * 60 * 1000);
      return function () {
        return clearInterval(interval);
      };
    },
    [fetchMetrics],
  );
  return {
    metrics: metrics,
    isLoading: isLoading,
    error: error,
    refresh: fetchMetrics,
  };
}
