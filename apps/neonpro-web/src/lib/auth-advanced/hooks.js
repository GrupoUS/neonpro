"use strict";
// React Hooks for Session Management
// Story 1.4: Session Management & Security Implementation
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
exports.useSession = useSession;
exports.useSessionSecurity = useSessionSecurity;
exports.useSessionMetrics = useSessionMetrics;
exports.useDeviceManagement = useDeviceManagement;
exports.useSessionContext = useSessionContext;
var react_1 = require("react");
var session_manager_1 = require("./session-manager");
var security_monitor_1 = require("./security-monitor");
var device_manager_1 = require("./device-manager");
var supabase_js_1 = require("@supabase/supabase-js");
// Global instances (would be provided via context in real app)
var sessionManager;
var securityMonitor;
var deviceManager;
// Initialize services
var initializeServices = function () {
  if (!sessionManager) {
    var supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
    sessionManager = new session_manager_1.SessionManager(supabase);
    securityMonitor = new security_monitor_1.SecurityMonitor(supabase);
    deviceManager = new device_manager_1.DeviceManager(supabase);
  }
};
// Main Session Hook
function useSession() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    session = _a[0],
    setSession = _a[1];
  var _b = (0, react_1.useState)(true),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)("idle"),
    sessionState = _d[0],
    setSessionState = _d[1];
  var heartbeatRef = (0, react_1.useRef)(null);
  var activityRef = (0, react_1.useRef)(new Date());
  // Initialize services
  (0, react_1.useEffect)(function () {
    initializeServices();
  }, []);
  // Load session on mount
  (0, react_1.useEffect)(function () {
    loadSession();
  }, []);
  // Activity tracking
  (0, react_1.useEffect)(
    function () {
      var trackActivity = function () {
        activityRef.current = new Date();
        if (session) {
          updateActivity();
        }
      };
      // Track user activity
      var events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      events.forEach(function (event) {
        document.addEventListener(event, trackActivity, true);
      });
      return function () {
        events.forEach(function (event) {
          document.removeEventListener(event, trackActivity, true);
        });
      };
    },
    [session],
  );
  // Session heartbeat
  (0, react_1.useEffect)(
    function () {
      if (session && sessionState === "active") {
        startHeartbeat();
      } else {
        stopHeartbeat();
      }
      return function () {
        return stopHeartbeat();
      };
    },
    [session, sessionState],
  );
  var loadSession = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var currentSession, err_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, 6, 7]);
            setIsLoading(true);
            setError(null);
            return [4 /*yield*/, sessionManager.getCurrentSession()];
          case 1:
            currentSession = _a.sent();
            if (!currentSession) return [3 /*break*/, 3];
            setSession(currentSession);
            setSessionState("active");
            // Start security monitoring
            return [4 /*yield*/, securityMonitor.startMonitoring(currentSession)];
          case 2:
            // Start security monitoring
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            setSessionState("idle");
            _a.label = 4;
          case 4:
            return [3 /*break*/, 7];
          case 5:
            err_1 = _a.sent();
            setError(err_1 instanceof Error ? err_1.message : "Failed to load session");
            setSessionState("error");
            return [3 /*break*/, 7];
          case 6:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  var createSession = function (userId, deviceInfo, location) {
    return __awaiter(_this, void 0, void 0, function () {
      var newSession, err_2, errorMessage;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, 5, 6]);
            setIsLoading(true);
            setError(null);
            setSessionState("creating");
            // Register device first
            return [4 /*yield*/, deviceManager.registerDevice(userId, deviceInfo, location)];
          case 1:
            // Register device first
            _a.sent();
            return [4 /*yield*/, sessionManager.createSession(userId, deviceInfo, location)];
          case 2:
            newSession = _a.sent();
            setSession(newSession);
            setSessionState("active");
            // Start security monitoring
            return [4 /*yield*/, securityMonitor.startMonitoring(newSession)];
          case 3:
            // Start security monitoring
            _a.sent();
            return [2 /*return*/, newSession];
          case 4:
            err_2 = _a.sent();
            errorMessage = err_2 instanceof Error ? err_2.message : "Failed to create session";
            setError(errorMessage);
            setSessionState("error");
            throw new Error(errorMessage);
          case 5:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  var extendSession = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var extendedSession, err_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            setError(null);
            return [4 /*yield*/, sessionManager.extendSession(session.id)];
          case 2:
            extendedSession = _a.sent();
            setSession(extendedSession);
            return [3 /*break*/, 4];
          case 3:
            err_3 = _a.sent();
            setError(err_3 instanceof Error ? err_3.message : "Failed to extend session");
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var terminateSession = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var err_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, 4, 5]);
            setIsLoading(true);
            setError(null);
            setSessionState("terminating");
            return [4 /*yield*/, sessionManager.terminateSession(session.id, "user_logout")];
          case 2:
            _a.sent();
            // Stop security monitoring
            securityMonitor.stopMonitoring(session.id);
            setSession(null);
            setSessionState("idle");
            return [3 /*break*/, 5];
          case 3:
            err_4 = _a.sent();
            setError(err_4 instanceof Error ? err_4.message : "Failed to terminate session");
            setSessionState("error");
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateActivity = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var err_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session) return [2 /*return*/];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, sessionManager.updateActivity(session.id)];
          case 2:
            _a.sent();
            // Update local session object
            setSession(function (prev) {
              return prev ? __assign(__assign({}, prev), { last_activity: new Date() }) : null;
            });
            return [3 /*break*/, 4];
          case 3:
            err_5 = _a.sent();
            console.error("Failed to update activity:", err_5);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var validateSession = function () {
    return __awaiter(_this, void 0, void 0, function () {
      var isValid, err_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!session) return [2 /*return*/, false];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [4 /*yield*/, sessionManager.validateSession(session.id)];
          case 2:
            isValid = _a.sent();
            if (!isValid) {
              setSession(null);
              setSessionState("expired");
              securityMonitor.stopMonitoring(session.id);
            }
            return [2 /*return*/, isValid];
          case 3:
            err_6 = _a.sent();
            setError(err_6 instanceof Error ? err_6.message : "Failed to validate session");
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var startHeartbeat = function () {
    stopHeartbeat(); // Clear any existing heartbeat
    heartbeatRef.current = setInterval(function () {
      return __awaiter(_this, void 0, void 0, function () {
        var isValid, err_7;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              _a.trys.push([0, 2, , 3]);
              return [4 /*yield*/, validateSession()];
            case 1:
              isValid = _a.sent();
              if (!isValid) {
                stopHeartbeat();
              }
              return [3 /*break*/, 3];
            case 2:
              err_7 = _a.sent();
              console.error("Heartbeat error:", err_7);
              return [3 /*break*/, 3];
            case 3:
              return [2 /*return*/];
          }
        });
      });
    }, 30000); // Check every 30 seconds
  };
  var stopHeartbeat = function () {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };
  return {
    session: session,
    isLoading: isLoading,
    error: error,
    sessionState: sessionState,
    createSession: createSession,
    extendSession: extendSession,
    terminateSession: terminateSession,
    updateActivity: updateActivity,
    validateSession: validateSession,
    refresh: loadSession,
  };
}
// Session Security Hook
function useSessionSecurity() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    securityEvents = _a[0],
    setSecurityEvents = _a[1];
  var _b = (0, react_1.useState)(false),
    isMonitoring = _b[0],
    setIsMonitoring = _b[1];
  var _c = (0, react_1.useState)(0),
    riskScore = _c[0],
    setRiskScore = _c[1];
  var _d = (0, react_1.useState)([]),
    alerts = _d[0],
    setAlerts = _d[1];
  var _e = (0, react_1.useState)(false),
    isLoading = _e[0],
    setIsLoading = _e[1];
  var _f = (0, react_1.useState)(null),
    error = _f[0],
    setError = _f[1];
  (0, react_1.useEffect)(function () {
    initializeServices();
    setupSecurityEventListeners();
    return function () {
      cleanupSecurityEventListeners();
    };
  }, []);
  var setupSecurityEventListeners = function () {
    securityMonitor.on("security_event", handleSecurityEvent);
    securityMonitor.on("monitoring_started", function () {
      return setIsMonitoring(true);
    });
    securityMonitor.on("monitoring_stopped", function () {
      return setIsMonitoring(false);
    });
  };
  var cleanupSecurityEventListeners = function () {
    securityMonitor.removeAllListeners();
  };
  var handleSecurityEvent = function (alert) {
    setAlerts(function (prev) {
      return __spreadArray([alert], prev.slice(0, 49), true);
    }); // Keep last 50 alerts
    if (alert.severity === "critical" || alert.severity === "high") {
      // Could trigger notifications here
      console.warn("High severity security event:", alert);
    }
  };
  var getSecurityEvents = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (limit) {
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_a) {
        try {
          setIsLoading(true);
          setError(null);
          // This would fetch from the database
          // For now, we'll use the current alerts
          setSecurityEvents(alerts.slice(0, limit));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch security events");
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var calculateRiskScore = function (sessionId) {
    return __awaiter(_this, void 0, void 0, function () {
      var mockRiskScore;
      return __generator(this, function (_a) {
        try {
          mockRiskScore = Math.floor(Math.random() * 100);
          setRiskScore(mockRiskScore);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to calculate risk score");
        }
        return [2 /*return*/];
      });
    });
  };
  var blockSession = function (sessionId, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var event_1, err_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, 4, 5]);
            setIsLoading(true);
            return [4 /*yield*/, sessionManager.terminateSession(sessionId, reason)];
          case 1:
            _a.sent();
            event_1 = {
              session_id: sessionId,
              event_type: "session_blocked",
              event_category: "security",
              severity: "high",
              description: "Session blocked: ".concat(reason),
              is_blocked: true,
              resolution_status: "resolved",
            };
            return [4 /*yield*/, securityMonitor.handleSecurityEvent(event_1)];
          case 2:
            _a.sent();
            return [3 /*break*/, 5];
          case 3:
            err_8 = _a.sent();
            setError(err_8 instanceof Error ? err_8.message : "Failed to block session");
            return [3 /*break*/, 5];
          case 4:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  var clearAlerts = function () {
    setAlerts([]);
    setSecurityEvents([]);
  };
  return {
    securityEvents: securityEvents,
    isMonitoring: isMonitoring,
    riskScore: riskScore,
    alerts: alerts,
    isLoading: isLoading,
    error: error,
    getSecurityEvents: getSecurityEvents,
    calculateRiskScore: calculateRiskScore,
    blockSession: blockSession,
    clearAlerts: clearAlerts,
  };
}
// Session Metrics Hook
function useSessionMetrics() {
  var _this = this;
  var _a = (0, react_1.useState)(null),
    metrics = _a[0],
    setMetrics = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  var _d = (0, react_1.useState)(false),
    autoRefresh = _d[0],
    setAutoRefresh = _d[1];
  var refreshIntervalRef = (0, react_1.useRef)(null);
  (0, react_1.useEffect)(function () {
    initializeServices();
  }, []);
  (0, react_1.useEffect)(
    function () {
      if (autoRefresh) {
        startAutoRefresh();
      } else {
        stopAutoRefresh();
      }
      return function () {
        return stopAutoRefresh();
      };
    },
    [autoRefresh],
  );
  var fetchMetrics = function (timeRange) {
    return __awaiter(_this, void 0, void 0, function () {
      var mockMetrics;
      return __generator(this, function (_a) {
        try {
          setIsLoading(true);
          setError(null);
          mockMetrics = {
            totalSessions: Math.floor(Math.random() * 1000),
            activeSessions: Math.floor(Math.random() * 100),
            expiredSessions: Math.floor(Math.random() * 50),
            terminatedSessions: Math.floor(Math.random() * 200),
            averageSessionDuration: Math.floor(Math.random() * 3600),
            securityEvents: Math.floor(Math.random() * 20),
            suspiciousActivities: Math.floor(Math.random() * 5),
            deviceRegistrations: Math.floor(Math.random() * 500),
            concurrentSessionViolations: Math.floor(Math.random() * 10),
            sessionsByDevice: {
              desktop: Math.floor(Math.random() * 300),
              mobile: Math.floor(Math.random() * 400),
              tablet: Math.floor(Math.random() * 100),
            },
            sessionsByLocation: {
              "United States": Math.floor(Math.random() * 400),
              Canada: Math.floor(Math.random() * 200),
              "United Kingdom": Math.floor(Math.random() * 150),
            },
            peakHours: Array.from({ length: 24 }, function (_, i) {
              return {
                hour: i,
                count: Math.floor(Math.random() * 50),
              };
            }),
          };
          setMetrics(mockMetrics);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Failed to fetch metrics");
        } finally {
          setIsLoading(false);
        }
        return [2 /*return*/];
      });
    });
  };
  var exportMetrics = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args_1[_i] = arguments[_i];
    }
    return __awaiter(_this, __spreadArray([], args_1, true), void 0, function (format) {
      var csvRows;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, function (_a) {
        if (!metrics) {
          throw new Error("No metrics available to export");
        }
        if (format === "json") {
          return [2 /*return*/, JSON.stringify(metrics, null, 2)];
        } else {
          csvRows = [
            "Metric,Value",
            "Total Sessions,".concat(metrics.totalSessions),
            "Active Sessions,".concat(metrics.activeSessions),
            "Expired Sessions,".concat(metrics.expiredSessions),
            "Terminated Sessions,".concat(metrics.terminatedSessions),
            "Average Session Duration,".concat(metrics.averageSessionDuration),
            "Security Events,".concat(metrics.securityEvents),
            "Suspicious Activities,".concat(metrics.suspiciousActivities),
            "Device Registrations,".concat(metrics.deviceRegistrations),
            "Concurrent Session Violations,".concat(metrics.concurrentSessionViolations),
          ];
          return [2 /*return*/, csvRows.join("\n")];
        }
        return [2 /*return*/];
      });
    });
  };
  var startAutoRefresh = function () {
    stopAutoRefresh();
    refreshIntervalRef.current = setInterval(function () {
      fetchMetrics();
    }, 60000); // Refresh every minute
  };
  var stopAutoRefresh = function () {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };
  var toggleAutoRefresh = function () {
    setAutoRefresh(function (prev) {
      return !prev;
    });
  };
  return {
    metrics: metrics,
    isLoading: isLoading,
    error: error,
    autoRefresh: autoRefresh,
    fetchMetrics: fetchMetrics,
    exportMetrics: exportMetrics,
    toggleAutoRefresh: toggleAutoRefresh,
    refresh: function () {
      return fetchMetrics();
    },
  };
}
// Device Management Hook
function useDeviceManagement() {
  var _this = this;
  var _a = (0, react_1.useState)([]),
    devices = _a[0],
    setDevices = _a[1];
  var _b = (0, react_1.useState)(false),
    isLoading = _b[0],
    setIsLoading = _b[1];
  var _c = (0, react_1.useState)(null),
    error = _c[0],
    setError = _c[1];
  (0, react_1.useEffect)(function () {
    initializeServices();
  }, []);
  var fetchUserDevices = function (userId) {
    return __awaiter(_this, void 0, void 0, function () {
      var userDevices, err_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            setError(null);
            return [4 /*yield*/, deviceManager.getUserDevices(userId)];
          case 1:
            userDevices = _a.sent();
            setDevices(userDevices);
            return [3 /*break*/, 4];
          case 2:
            err_9 = _a.sent();
            setError(err_9 instanceof Error ? err_9.message : "Failed to fetch devices");
            return [3 /*break*/, 4];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var blockDevice = function (deviceId, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            return [4 /*yield*/, deviceManager.blockDevice(deviceId, reason)];
          case 1:
            _a.sent();
            // Update local state
            setDevices(function (prev) {
              return prev.map(function (device) {
                return device.id === deviceId
                  ? __assign(__assign({}, device), { is_blocked: true, is_trusted: false })
                  : device;
              });
            });
            return [3 /*break*/, 4];
          case 2:
            err_10 = _a.sent();
            setError(err_10 instanceof Error ? err_10.message : "Failed to block device");
            return [3 /*break*/, 4];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var unblockDevice = function (deviceId, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            return [4 /*yield*/, deviceManager.unblockDevice(deviceId, reason)];
          case 1:
            _a.sent();
            // Update local state
            setDevices(function (prev) {
              return prev.map(function (device) {
                return device.id === deviceId
                  ? __assign(__assign({}, device), { is_blocked: false })
                  : device;
              });
            });
            return [3 /*break*/, 4];
          case 2:
            err_11 = _a.sent();
            setError(err_11 instanceof Error ? err_11.message : "Failed to unblock device");
            return [3 /*break*/, 4];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  var updateDeviceTrust = function (deviceId, trustScore, reason) {
    return __awaiter(_this, void 0, void 0, function () {
      var err_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, 3, 4]);
            setIsLoading(true);
            return [4 /*yield*/, deviceManager.updateDeviceTrust(deviceId, trustScore, reason)];
          case 1:
            _a.sent();
            // Update local state
            setDevices(function (prev) {
              return prev.map(function (device) {
                return device.id === deviceId
                  ? __assign(__assign({}, device), {
                      trust_score: trustScore,
                      is_trusted: trustScore >= 60, // Assuming 60 is the threshold
                    })
                  : device;
              });
            });
            return [3 /*break*/, 4];
          case 2:
            err_12 = _a.sent();
            setError(err_12 instanceof Error ? err_12.message : "Failed to update device trust");
            return [3 /*break*/, 4];
          case 3:
            setIsLoading(false);
            return [7 /*endfinally*/];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return {
    devices: devices,
    isLoading: isLoading,
    error: error,
    fetchUserDevices: fetchUserDevices,
    blockDevice: blockDevice,
    unblockDevice: unblockDevice,
    updateDeviceTrust: updateDeviceTrust,
    refresh: function (userId) {
      return fetchUserDevices(userId);
    },
  };
}
// Session Context Hook (for providing session data throughout the app)
function useSessionContext() {
  var session = useSession();
  var security = useSessionSecurity();
  var metrics = useSessionMetrics();
  var devices = useDeviceManagement();
  return {
    session: session,
    security: security,
    metrics: metrics,
    devices: devices,
  };
}
