"use strict";
/**
 * Intelligent Session Timeout System
 * Story 1.4 - Task 1: Implements configurable session timeout per user role
 * with activity-based session extension logic and graceful session expiry
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.intelligentSessionTimeout = void 0;
var client_1 = require("@/lib/supabase/client");
// Default timeout configurations per role
var DEFAULT_TIMEOUT_CONFIGS = {
  owner: {
    role: "owner",
    defaultTimeoutMinutes: 60, // 1 hour
    maxTimeoutMinutes: 480, // 8 hours
    warningThresholds: [15, 5, 1], // 15min, 5min, 1min warnings
    activityExtensionMinutes: 30,
    gracePeriodMinutes: 5,
  },
  manager: {
    role: "manager",
    defaultTimeoutMinutes: 45, // 45 minutes
    maxTimeoutMinutes: 240, // 4 hours
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 20,
    gracePeriodMinutes: 3,
  },
  staff: {
    role: "staff",
    defaultTimeoutMinutes: 30, // 30 minutes
    maxTimeoutMinutes: 120, // 2 hours
    warningThresholds: [10, 5, 1],
    activityExtensionMinutes: 15,
    gracePeriodMinutes: 2,
  },
  patient: {
    role: "patient",
    defaultTimeoutMinutes: 20, // 20 minutes
    maxTimeoutMinutes: 60, // 1 hour
    warningThresholds: [5, 2, 1],
    activityExtensionMinutes: 10,
    gracePeriodMinutes: 1,
  },
};
var IntelligentSessionTimeout = /** @class */ (function () {
  function IntelligentSessionTimeout() {
    this.supabase = (0, client_1.createClient)();
    this.timeoutConfigs = new Map();
    this.activeTimers = new Map();
    this.warningTimers = new Map();
    this.activityListeners = new Map();
    this.preservationData = new Map();
    this.initializeDefaultConfigs();
    this.setupGlobalActivityListeners();
  }
  IntelligentSessionTimeout.getInstance = function () {
    if (!IntelligentSessionTimeout.instance) {
      IntelligentSessionTimeout.instance = new IntelligentSessionTimeout();
    }
    return IntelligentSessionTimeout.instance;
  };
  /**
   * Initialize session timeout for a user
   */
  IntelligentSessionTimeout.prototype.initializeSessionTimeout = function (
    sessionId,
    userId,
    userRole,
    customConfig,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var config, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            config = this.getTimeoutConfig(userRole, customConfig);
            // Store session timeout configuration
            return [4 /*yield*/, this.storeSessionConfig(sessionId, userId, config)];
          case 1:
            // Store session timeout configuration
            _a.sent();
            // Start timeout timer
            this.startTimeoutTimer(sessionId, config.defaultTimeoutMinutes);
            // Setup warning timers
            this.setupWarningTimers(sessionId, config);
            // Setup activity tracking
            this.setupActivityTracking(sessionId, userId);
            // Log session timeout initialization
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "timeout_initialized", {
                config: config,
                expiresAt: new Date(Date.now() + config.defaultTimeoutMinutes * 60 * 1000),
              }),
            ];
          case 2:
            // Log session timeout initialization
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to initialize session timeout:", error_1);
            throw new Error("Session timeout initialization failed");
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Record user activity and extend session if needed
   */
  IntelligentSessionTimeout.prototype.recordActivity = function (
    sessionId,
    activityType,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var session, now, config, shouldExtend, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getSessionData(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, false];
            }
            now = new Date();
            config = this.timeoutConfigs.get(session.user_role);
            if (!config) {
              return [2 /*return*/, false];
            }
            // Record activity
            return [
              4 /*yield*/,
              this.storeActivity(sessionId, session.user_id, activityType, metadata),
            ];
          case 2:
            // Record activity
            _a.sent();
            shouldExtend = this.shouldExtendSession(session, now, config);
            if (!shouldExtend) return [3 /*break*/, 4];
            return [4 /*yield*/, this.extendSession(sessionId, config.activityExtensionMinutes)];
          case 3:
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            // Update last activity timestamp
            return [4 /*yield*/, this.updateLastActivity(sessionId, now)];
          case 5:
            // Update last activity timestamp
            _a.sent();
            return [2 /*return*/, false];
          case 6:
            error_2 = _a.sent();
            console.error("Failed to record activity:", error_2);
            return [2 /*return*/, false];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Manually extend session (user-initiated)
   */
  IntelligentSessionTimeout.prototype.extendSession = function (sessionId, extensionMinutes) {
    return __awaiter(this, void 0, void 0, function () {
      var session,
        config,
        currentDuration,
        newDuration,
        maxDuration,
        remainingMinutes,
        newExpiresAt,
        error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getSessionData(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, false];
            }
            config = this.timeoutConfigs.get(session.user_role);
            if (!config) {
              return [2 /*return*/, false];
            }
            currentDuration = Date.now() - new Date(session.created_at).getTime();
            newDuration = currentDuration + extensionMinutes * 60 * 1000;
            maxDuration = config.maxTimeoutMinutes * 60 * 1000;
            if (newDuration > maxDuration) {
              remainingMinutes = Math.max(0, (maxDuration - currentDuration) / (60 * 1000));
              extensionMinutes = Math.floor(remainingMinutes);
            }
            if (extensionMinutes <= 0) {
              return [2 /*return*/, false];
            }
            // Clear existing timers
            this.clearSessionTimers(sessionId);
            newExpiresAt = new Date(Date.now() + extensionMinutes * 60 * 1000);
            return [4 /*yield*/, this.updateSessionExpiry(sessionId, newExpiresAt)];
          case 2:
            _a.sent();
            // Restart timers
            this.startTimeoutTimer(sessionId, extensionMinutes);
            this.setupWarningTimers(sessionId, config, extensionMinutes);
            // Log extension
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "session_extended", {
                extensionMinutes: extensionMinutes,
                newExpiresAt: newExpiresAt,
                remainingMaxTime: (maxDuration - newDuration) / (60 * 1000),
              }),
            ];
          case 3:
            // Log extension
            _a.sent();
            return [2 /*return*/, true];
          case 4:
            error_3 = _a.sent();
            console.error("Failed to extend session:", error_3);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Show timeout warning to user
   */
  IntelligentSessionTimeout.prototype.showTimeoutWarning = function (sessionId, warningType) {
    return __awaiter(this, void 0, void 0, function () {
      var session, config, warning, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getSessionData(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/];
            }
            config = this.timeoutConfigs.get(session.user_role);
            if (!config) {
              return [2 /*return*/];
            }
            warning = {
              sessionId: sessionId,
              warningType: warningType,
              expiresAt: new Date(session.expires_at),
              canExtend: this.canExtendSession(session, config),
              extensionMinutes: config.activityExtensionMinutes,
            };
            // Emit warning event (to be caught by UI components)
            this.emitWarningEvent(warning);
            // Log warning
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "timeout_warning", {
                warningType: warningType,
                expiresAt: warning.expiresAt,
                canExtend: warning.canExtend,
              }),
            ];
          case 2:
            // Log warning
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to show timeout warning:", error_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Gracefully expire session with data preservation
   */
  IntelligentSessionTimeout.prototype.expireSession = function (sessionId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, preserveData) {
      var session, error_5;
      if (preserveData === void 0) {
        preserveData = true;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getSessionData(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/];
            }
            if (!preserveData) return [3 /*break*/, 3];
            return [4 /*yield*/, this.preserveSessionData(sessionId)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Clear all timers
            this.clearSessionTimers(sessionId);
            // Remove activity listeners
            this.removeActivityListeners(sessionId);
            // Mark session as expired
            return [4 /*yield*/, this.markSessionExpired(sessionId)];
          case 4:
            // Mark session as expired
            _a.sent();
            // Log session expiry
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "session_expired", {
                preservedData: preserveData,
                gracefulExpiry: true,
              }),
            ];
          case 5:
            // Log session expiry
            _a.sent();
            // Emit session expired event
            this.emitSessionExpiredEvent(sessionId, preserveData);
            return [3 /*break*/, 7];
          case 6:
            error_5 = _a.sent();
            console.error("Failed to expire session gracefully:", error_5);
            return [3 /*break*/, 7];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session analytics and activity data
   */
  IntelligentSessionTimeout.prototype.getSessionAnalytics = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var activities,
        events,
        session,
        totalDuration,
        extensionCount,
        warningCount,
        activityPattern,
        lastActivity,
        error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_activities")
                .select("*")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: true }),
            ];
          case 1:
            activities = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("session_events")
                .select("*")
                .eq("session_id", sessionId)
                .order("created_at", { ascending: true }),
            ];
          case 2:
            events = _a.sent().data;
            if (!activities || !events) {
              return [2 /*return*/, null];
            }
            return [4 /*yield*/, this.getSessionData(sessionId)];
          case 3:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, null];
            }
            totalDuration = Date.now() - new Date(session.created_at).getTime();
            extensionCount = events.filter(function (e) {
              return e.event_type === "session_extended";
            }).length;
            warningCount = events.filter(function (e) {
              return e.event_type === "timeout_warning";
            }).length;
            activityPattern = activities.reduce(function (acc, activity) {
              acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
              return acc;
            }, {});
            lastActivity =
              activities.length > 0
                ? new Date(activities[activities.length - 1].created_at)
                : new Date(session.created_at);
            return [
              2 /*return*/,
              {
                totalDuration: totalDuration,
                activityCount: activities.length,
                extensionCount: extensionCount,
                warningCount: warningCount,
                lastActivity: lastActivity,
                activityPattern: activityPattern,
              },
            ];
          case 4:
            error_6 = _a.sent();
            console.error("Failed to get session analytics:", error_6);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Private helper methods
  IntelligentSessionTimeout.prototype.initializeDefaultConfigs = function () {
    var _this = this;
    Object.entries(DEFAULT_TIMEOUT_CONFIGS).forEach(function (_a) {
      var role = _a[0],
        config = _a[1];
      _this.timeoutConfigs.set(role, config);
    });
  };
  IntelligentSessionTimeout.prototype.getTimeoutConfig = function (userRole, customConfig) {
    var defaultConfig = this.timeoutConfigs.get(userRole) || DEFAULT_TIMEOUT_CONFIGS.staff;
    return __assign(__assign({}, defaultConfig), customConfig);
  };
  IntelligentSessionTimeout.prototype.startTimeoutTimer = function (sessionId, timeoutMinutes) {
    var _this = this;
    var timer = setTimeout(
      function () {
        _this.expireSession(sessionId, true);
      },
      timeoutMinutes * 60 * 1000,
    );
    this.activeTimers.set(sessionId, timer);
  };
  IntelligentSessionTimeout.prototype.setupWarningTimers = function (
    sessionId,
    config,
    customTimeoutMinutes,
  ) {
    var _this = this;
    var timeoutMinutes = customTimeoutMinutes || config.defaultTimeoutMinutes;
    var timers = [];
    config.warningThresholds.forEach(function (warningMinutes) {
      if (warningMinutes < timeoutMinutes) {
        var delay = (timeoutMinutes - warningMinutes) * 60 * 1000;
        var timer = setTimeout(function () {
          var warningType = warningMinutes === 1 ? "final" : warningMinutes <= 5 ? "1min" : "5min";
          _this.showTimeoutWarning(sessionId, warningType);
        }, delay);
        timers.push(timer);
      }
    });
    this.warningTimers.set(sessionId, timers);
  };
  IntelligentSessionTimeout.prototype.setupActivityTracking = function (sessionId, userId) {
    var _this = this;
    var activityHandler = function () {
      _this.recordActivity(sessionId, "mouse");
    };
    // Store reference for cleanup
    this.activityListeners.set(sessionId, activityHandler);
    // Add event listeners (if in browser environment)
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", activityHandler);
      window.addEventListener("keypress", activityHandler);
      window.addEventListener("scroll", activityHandler);
      window.addEventListener("click", activityHandler);
    }
  };
  IntelligentSessionTimeout.prototype.setupGlobalActivityListeners = function () {
    var _this = this;
    // Global activity tracking setup
    if (typeof window !== "undefined") {
      // Page visibility change
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
          // User returned to page - record activity for all active sessions
          _this.recordGlobalActivity("page_focus");
        }
      });
      // Before unload - preserve data
      window.addEventListener("beforeunload", function () {
        _this.preserveAllSessionData();
      });
    }
  };
  IntelligentSessionTimeout.prototype.clearSessionTimers = function (sessionId) {
    // Clear main timeout timer
    var mainTimer = this.activeTimers.get(sessionId);
    if (mainTimer) {
      clearTimeout(mainTimer);
      this.activeTimers.delete(sessionId);
    }
    // Clear warning timers
    var warningTimers = this.warningTimers.get(sessionId);
    if (warningTimers) {
      warningTimers.forEach(function (timer) {
        return clearTimeout(timer);
      });
      this.warningTimers.delete(sessionId);
    }
  };
  IntelligentSessionTimeout.prototype.removeActivityListeners = function (sessionId) {
    var handler = this.activityListeners.get(sessionId);
    if (handler && typeof window !== "undefined") {
      window.removeEventListener("mousemove", handler);
      window.removeEventListener("keypress", handler);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("click", handler);
      this.activityListeners.delete(sessionId);
    }
  };
  IntelligentSessionTimeout.prototype.shouldExtendSession = function (session, now, config) {
    var lastActivity = new Date(session.last_activity);
    var timeSinceActivity = now.getTime() - lastActivity.getTime();
    var activityThreshold = 5 * 60 * 1000; // 5 minutes
    return timeSinceActivity > activityThreshold;
  };
  IntelligentSessionTimeout.prototype.canExtendSession = function (session, config) {
    var sessionDuration = Date.now() - new Date(session.created_at).getTime();
    var maxDuration = config.maxTimeoutMinutes * 60 * 1000;
    return sessionDuration < maxDuration;
  };
  IntelligentSessionTimeout.prototype.preserveSessionData = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var preservationData;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            preservationData = this.preservationData.get(sessionId);
            if (!preservationData) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              this.supabase.from("session_preservation").upsert({
                session_id: sessionId,
                preservation_data: preservationData,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.preserveAllSessionData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var promises;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            promises = Array.from(this.preservationData.keys()).map(function (sessionId) {
              return _this.preserveSessionData(sessionId);
            });
            return [4 /*yield*/, Promise.all(promises)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.recordGlobalActivity = function (activityType) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions, promises;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            activeSessions = Array.from(this.activeTimers.keys());
            promises = activeSessions.map(function (sessionId) {
              return _this.recordActivity(sessionId, "page_navigation", {
                global: true,
                type: activityType,
              });
            });
            return [4 /*yield*/, Promise.all(promises)];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Database operations
  IntelligentSessionTimeout.prototype.storeSessionConfig = function (sessionId, userId, config) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("session_timeout_configs").upsert({
                session_id: sessionId,
                user_id: userId,
                config: config,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.storeActivity = function (
    sessionId,
    userId,
    activityType,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("session_activities").insert({
                session_id: sessionId,
                user_id: userId,
                activity_type: activityType,
                metadata: metadata || {},
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.updateLastActivity = function (sessionId, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({ last_activity: timestamp.toISOString() })
                .eq("id", sessionId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.updateSessionExpiry = function (sessionId, expiresAt) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({ expires_at: expiresAt.toISOString() })
                .eq("id", sessionId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.markSessionExpired = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  status: "expired",
                  expired_at: new Date().toISOString(),
                })
                .eq("id", sessionId),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.getSessionData = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").select("*").eq("id", sessionId).single(),
            ];
          case 1:
            data = _a.sent().data;
            return [2 /*return*/, data];
        }
      });
    });
  };
  IntelligentSessionTimeout.prototype.logSessionEvent = function (sessionId, eventType, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("session_events").insert({
                session_id: sessionId,
                event_type: eventType,
                metadata: metadata,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  // Event emission methods (for UI integration)
  IntelligentSessionTimeout.prototype.emitWarningEvent = function (warning) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("session-timeout-warning", {
          detail: warning,
        }),
      );
    }
  };
  IntelligentSessionTimeout.prototype.emitSessionExpiredEvent = function (
    sessionId,
    dataPreserved,
  ) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("session-expired", {
          detail: { sessionId: sessionId, dataPreserved: dataPreserved },
        }),
      );
    }
  };
  /**
   * Update timeout configuration for a specific role
   */
  IntelligentSessionTimeout.prototype.updateTimeoutConfig = function (role, config) {
    var currentConfig = this.timeoutConfigs.get(role) || DEFAULT_TIMEOUT_CONFIGS[role];
    this.timeoutConfigs.set(role, __assign(__assign({}, currentConfig), config));
  };
  /**
   * Get current timeout configuration for a role
   */
  IntelligentSessionTimeout.prototype.getTimeoutConfigForRole = function (role) {
    return this.timeoutConfigs.get(role) || DEFAULT_TIMEOUT_CONFIGS[role];
  };
  /**
   * Cleanup all session data and timers
   */
  IntelligentSessionTimeout.prototype.cleanup = function () {
    var _this = this;
    // Clear all timers
    this.activeTimers.forEach(function (timer) {
      return clearTimeout(timer);
    });
    this.warningTimers.forEach(function (timers) {
      return timers.forEach(function (timer) {
        return clearTimeout(timer);
      });
    });
    // Remove all activity listeners
    this.activityListeners.forEach(function (handler, sessionId) {
      _this.removeActivityListeners(sessionId);
    });
    // Clear maps
    this.activeTimers.clear();
    this.warningTimers.clear();
    this.activityListeners.clear();
    this.preservationData.clear();
  };
  return IntelligentSessionTimeout;
})();
exports.intelligentSessionTimeout = IntelligentSessionTimeout.getInstance();
exports.default = IntelligentSessionTimeout;
