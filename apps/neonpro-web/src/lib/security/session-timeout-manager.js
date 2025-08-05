/**
 * Session Timeout Manager for NeonPro
 * Handles automatic session timeouts with progressive warnings
 */
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
exports.SessionTimeoutManager = void 0;
var client_1 = require("@/lib/supabase/client");
/**
 * Session Timeout Manager
 */
var SessionTimeoutManager = /** @class */ (() => {
  function SessionTimeoutManager() {}
  /**
   * Initialize session timeout for a user
   */
  SessionTimeoutManager.initializeSessionTimeout = function (sessionId_1, userId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, userId, config) {
      var fullConfig, supabase, error_1;
      if (config === void 0) {
        config = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            fullConfig = __assign(__assign({}, this.DEFAULT_CONFIG), config);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 2:
            supabase = _a.sent();
            // Store session timeout configuration
            return [
              4 /*yield*/,
              supabase.from("session_timeouts").upsert({
                session_id: sessionId,
                user_id: userId,
                config: fullConfig,
                last_activity: new Date().toISOString(),
                timeout_at: new Date(
                  Date.now() + fullConfig.maxInactivityMinutes * 60 * 1000,
                ).toISOString(),
                warnings_sent: [],
                is_active: true,
              }),
            ];
          case 3:
            // Store session timeout configuration
            _a.sent();
            // Set up warning timers
            this.setupWarningTimers(sessionId, fullConfig);
            // Set up activity monitoring
            this.setupActivityMonitoring(sessionId, userId, fullConfig);
            return [3 /*break*/, 5];
          case 4:
            error_1 = _a.sent();
            console.error("Failed to initialize session timeout:", error_1);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity
   */
  SessionTimeoutManager.updateActivity = function (sessionId, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, now, sessionTimeout, config, newTimeoutAt, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            now = new Date();
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .select("config, warnings_sent")
                .eq("session_id", sessionId)
                .eq("is_active", true)
                .single(),
            ];
          case 2:
            sessionTimeout = _a.sent().data;
            if (!sessionTimeout) {
              return [2 /*return*/];
            }
            config = sessionTimeout.config;
            newTimeoutAt = new Date(Date.now() + config.maxInactivityMinutes * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .update({
                  last_activity: now.toISOString(),
                  timeout_at: newTimeoutAt.toISOString(),
                  warnings_sent: [], // Reset warnings
                })
                .eq("session_id", sessionId),
            ];
          case 3:
            _a.sent();
            // Log activity
            return [
              4 /*yield*/,
              supabase.from("session_activities").insert({
                session_id: sessionId,
                user_id: activity.userId,
                activity_type: activity.activityType,
                path: activity.path,
                is_sensitive: activity.sensitive || false,
                timestamp: now.toISOString(),
              }),
            ];
          case 4:
            // Log activity
            _a.sent();
            // Reset warning timers if activity extends session
            if (config.extendOnActivity) {
              this.clearWarningTimers(sessionId);
              this.setupWarningTimers(sessionId, config);
            }
            return [3 /*break*/, 6];
          case 5:
            error_2 = _a.sent();
            console.error("Failed to update session activity:", error_2);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if session should timeout
   */
  SessionTimeoutManager.checkSessionTimeout = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        sessionTimeout,
        timeoutAt,
        now,
        timeRemaining,
        config,
        gracePeriod,
        shouldTimeout,
        requiresReauth,
        error_3;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .select("*")
                .eq("session_id", sessionId)
                .eq("is_active", true)
                .single(),
            ];
          case 2:
            sessionTimeout = _a.sent().data;
            if (!sessionTimeout) {
              return [
                2 /*return*/,
                { shouldTimeout: true, timeRemaining: 0, requiresReauth: true },
              ];
            }
            timeoutAt = new Date(sessionTimeout.timeout_at).getTime();
            now = Date.now();
            timeRemaining = Math.max(0, timeoutAt - now);
            config = sessionTimeout.config;
            gracePeriod = config.gracePeriodMinutes * 60 * 1000;
            shouldTimeout = timeRemaining <= 0;
            requiresReauth =
              shouldTimeout || (timeRemaining <= gracePeriod && config.requireReauthForSensitive);
            return [
              2 /*return*/,
              {
                shouldTimeout: shouldTimeout,
                timeRemaining: timeRemaining,
                requiresReauth: requiresReauth,
              },
            ];
          case 3:
            error_3 = _a.sent();
            console.error("Failed to check session timeout:", error_3);
            return [2 /*return*/, { shouldTimeout: true, timeRemaining: 0, requiresReauth: true }];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extend session timeout
   */
  SessionTimeoutManager.extendSession = function (sessionId, additionalMinutes) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, sessionTimeout, config, extensionMinutes, newTimeoutAt, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .select("config")
                .eq("session_id", sessionId)
                .eq("is_active", true)
                .single(),
            ];
          case 2:
            sessionTimeout = _a.sent().data;
            if (!sessionTimeout) {
              return [2 /*return*/, false];
            }
            config = sessionTimeout.config;
            extensionMinutes = additionalMinutes || config.maxInactivityMinutes;
            newTimeoutAt = new Date(Date.now() + extensionMinutes * 60 * 1000);
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .update({
                  timeout_at: newTimeoutAt.toISOString(),
                  warnings_sent: [], // Reset warnings
                  last_activity: new Date().toISOString(),
                })
                .eq("session_id", sessionId),
            ];
          case 3:
            error = _a.sent().error;
            if (!error) {
              // Reset warning timers
              this.clearWarningTimers(sessionId);
              this.setupWarningTimers(sessionId, config);
            }
            return [2 /*return*/, !error];
          case 4:
            error_4 = _a.sent();
            console.error("Failed to extend session:", error_4);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Force session timeout
   */
  SessionTimeoutManager.forceTimeout = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .update({
                  is_active: false,
                  timeout_at: new Date().toISOString(),
                })
                .eq("session_id", sessionId),
            ];
          case 2:
            error = _a.sent().error;
            // Clear timers
            this.clearWarningTimers(sessionId);
            this.clearActivityListener(sessionId);
            return [2 /*return*/, !error];
          case 3:
            error_5 = _a.sent();
            console.error("Failed to force session timeout:", error_5);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get timeout warning for display
   */
  SessionTimeoutManager.getTimeoutWarning = (minutesRemaining) => {
    if (minutesRemaining <= 1) {
      return {
        level: "critical",
        minutesRemaining: minutesRemaining,
        message: "Your session will expire in ".concat(
          minutesRemaining,
          " minute(s). Please save your work.",
        ),
        actions: ["extend", "logout"],
      };
    } else if (minutesRemaining <= 5) {
      return {
        level: "warning",
        minutesRemaining: minutesRemaining,
        message: "Your session will expire in ".concat(
          minutesRemaining,
          " minutes due to inactivity.",
        ),
        actions: ["extend", "continue"],
      };
    } else {
      return {
        level: "info",
        minutesRemaining: minutesRemaining,
        message: "Your session will expire in ".concat(
          minutesRemaining,
          " minutes. Click to extend.",
        ),
        actions: ["extend"],
      };
    }
  };
  /**
   * Setup warning timers
   */
  SessionTimeoutManager.setupWarningTimers = function (sessionId, config) {
    var timers = [];
    config.warningIntervals.forEach((warningMinutes) => {
      var warningTime = (config.maxInactivityMinutes - warningMinutes) * 60 * 1000;
      if (warningTime > 0) {
        var timer = setTimeout(() => {
          this.sendTimeoutWarning(sessionId, warningMinutes);
        }, warningTime);
        timers.push(timer);
      }
    });
    // Set final timeout
    var timeoutTimer = setTimeout(
      () => {
        this.forceTimeout(sessionId);
      },
      config.maxInactivityMinutes * 60 * 1000,
    );
    timers.push(timeoutTimer);
    this.warningTimers.set(sessionId, timers);
  };
  /**
   * Clear warning timers
   */
  SessionTimeoutManager.clearWarningTimers = function (sessionId) {
    var timers = this.warningTimers.get(sessionId);
    if (timers) {
      timers.forEach((timer) => clearTimeout(timer));
      this.warningTimers.delete(sessionId);
    }
  };
  /**
   * Setup activity monitoring
   */
  SessionTimeoutManager.setupActivityMonitoring = (sessionId, userId, config) => {
    // This would typically be handled client-side
    // Server-side we just track API calls and page views
  };
  /**
   * Clear activity listener
   */
  SessionTimeoutManager.clearActivityListener = function (sessionId) {
    var listener = this.activityListeners.get(sessionId);
    if (listener) {
      clearTimeout(listener);
      this.activityListeners.delete(sessionId);
    }
  };
  /**
   * Send timeout warning
   */
  SessionTimeoutManager.sendTimeoutWarning = function (sessionId, minutesRemaining) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, sessionTimeout, warningsSent, error_6;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .select("warnings_sent")
                .eq("session_id", sessionId)
                .single(),
            ];
          case 2:
            sessionTimeout = _a.sent().data;
            if (!sessionTimeout) return [3 /*break*/, 4];
            warningsSent = sessionTimeout.warnings_sent || [];
            warningsSent.push(minutesRemaining);
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .update({ warnings_sent: warningsSent })
                .eq("session_id", sessionId),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            // This would trigger client-side warning display
            // In a real implementation, you might use WebSockets or Server-Sent Events
            console.log(
              "Session ".concat(sessionId, ": ").concat(minutesRemaining, " minutes remaining"),
            );
            return [3 /*break*/, 6];
          case 5:
            error_6 = _a.sent();
            console.error("Failed to send timeout warning:", error_6);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup expired sessions
   */
  SessionTimeoutManager.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, now, thirtyDaysAgo, error_7;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            now = new Date().toISOString();
            // Mark expired sessions as inactive
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .update({ is_active: false })
                .lt("timeout_at", now)
                .eq("is_active", true),
            ];
          case 2:
            // Mark expired sessions as inactive
            _a.sent();
            thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
            return [
              4 /*yield*/,
              supabase.from("session_activities").delete().lt("timestamp", thirtyDaysAgo),
            ];
          case 3:
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Failed to cleanup expired sessions:", error_7);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionTimeoutManager.DEFAULT_CONFIG = {
    maxInactivityMinutes: 30,
    warningIntervals: [10, 5, 2, 1], // Show warnings at these minutes before timeout
    extendOnActivity: true,
    requireReauthForSensitive: true,
    gracePeriodMinutes: 2,
  };
  SessionTimeoutManager.activityListeners = new Map();
  SessionTimeoutManager.warningTimers = new Map();
  return SessionTimeoutManager;
})();
exports.SessionTimeoutManager = SessionTimeoutManager;
exports.default = SessionTimeoutManager;
