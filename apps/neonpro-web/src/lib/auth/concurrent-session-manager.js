/**
 * Concurrent Session Manager
 * Story 1.4 - Task 2: Concurrent session control and management
 *
 * Features:
 * - Session limit enforcement per user role
 * - Active session tracking and monitoring
 * - Session termination and cleanup
 * - Device-based session management
 * - Real-time session synchronization
 * - Security event logging
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
exports.ConcurrentSessionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_SESSION_LIMITS = {
  owner: {
    role: "owner",
    maxSessions: 10,
    maxSessionsPerDevice: 3,
    allowMultipleDevices: true,
    forceLogoutOldest: true,
    notifyOnNewSession: true,
  },
  manager: {
    role: "manager",
    maxSessions: 5,
    maxSessionsPerDevice: 2,
    allowMultipleDevices: true,
    forceLogoutOldest: true,
    notifyOnNewSession: true,
  },
  staff: {
    role: "staff",
    maxSessions: 3,
    maxSessionsPerDevice: 2,
    allowMultipleDevices: true,
    forceLogoutOldest: true,
    notifyOnNewSession: false,
  },
  patient: {
    role: "patient",
    maxSessions: 2,
    maxSessionsPerDevice: 1,
    allowMultipleDevices: false,
    forceLogoutOldest: true,
    notifyOnNewSession: false,
  },
};
var ConcurrentSessionManager = /** @class */ (() => {
  function ConcurrentSessionManager(supabaseUrl, supabaseKey, customLimits) {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.sessionLimits = __assign(__assign({}, DEFAULT_SESSION_LIMITS), customLimits);
    // Start cleanup interval (every 5 minutes)
    this.startCleanupInterval();
  }
  /**
   * Create a new session with concurrent session validation
   */
  ConcurrentSessionManager.prototype.createSession = function (
    userId,
    userRole,
    deviceInfo,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionId, now, activeSessions, limits, terminatedSessions, sessionInfo, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            sessionId = this.generateSessionId();
            now = new Date();
            return [4 /*yield*/, this.getActiveSessions(userId)];
          case 1:
            activeSessions = _a.sent();
            limits = this.sessionLimits[userRole];
            return [
              4 /*yield*/,
              this.enforceSessionLimits(
                userId,
                userRole,
                deviceInfo.deviceId,
                activeSessions,
                limits,
              ),
            ];
          case 2:
            terminatedSessions = _a.sent();
            sessionInfo = {
              userId: userId,
              deviceId: deviceInfo.deviceId,
              deviceName: deviceInfo.deviceName,
              deviceType: deviceInfo.deviceType,
              ipAddress: deviceInfo.ipAddress,
              userAgent: deviceInfo.userAgent,
              location: deviceInfo.location,
              createdAt: now,
              lastActivity: now,
              isActive: true,
              metadata: metadata,
            };
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").insert({
                session_id: sessionId,
                user_id: userId,
                device_id: deviceInfo.deviceId,
                device_name: deviceInfo.deviceName,
                device_type: deviceInfo.deviceType,
                ip_address: deviceInfo.ipAddress,
                user_agent: deviceInfo.userAgent,
                location: deviceInfo.location,
                created_at: now.toISOString(),
                last_activity: now.toISOString(),
                is_active: true,
                metadata: metadata,
              }),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to create session: ".concat(error.message));
            }
            // Log session creation
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_created",
                userId: userId,
                sessionId: sessionId,
                deviceId: deviceInfo.deviceId,
                ipAddress: deviceInfo.ipAddress,
                userAgent: deviceInfo.userAgent,
                metadata: {
                  userRole: userRole,
                  deviceInfo: deviceInfo,
                  terminatedSessionsCount: terminatedSessions.length,
                  activeSessions: activeSessions.length + 1 - terminatedSessions.length,
                },
              }),
            ];
          case 4:
            // Log session creation
            _a.sent();
            if (!(limits.notifyOnNewSession && terminatedSessions.length === 0))
              return [3 /*break*/, 6];
            return [4 /*yield*/, this.notifyNewSession(userId, sessionInfo)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            return [
              2 /*return*/,
              {
                sessionId: sessionId,
                terminatedSessions: terminatedSessions.length > 0 ? terminatedSessions : undefined,
              },
            ];
          case 7:
            error_1 = _a.sent();
            console.error("Failed to create session:", error_1);
            throw error_1;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity timestamp
   */
  ConcurrentSessionManager.prototype.updateSessionActivity = function (sessionId, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      var now, error, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  last_activity: now.toISOString(),
                  metadata: metadata,
                })
                .eq("session_id", sessionId)
                .eq("is_active", true),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update session activity: ".concat(error.message));
            }
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Failed to update session activity:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate a specific session
   */
  ConcurrentSessionManager.prototype.terminateSession = function (sessionId, reason, terminatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var session, error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getSessionInfo(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              throw new Error("Session not found");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  terminated_at: new Date().toISOString(),
                  termination_reason: reason.type,
                  termination_message: reason.message,
                  terminated_by: terminatedBy,
                })
                .eq("session_id", sessionId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to terminate session: ".concat(error.message));
            }
            // Log session termination
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_terminated",
                userId: session.userId,
                sessionId: sessionId,
                deviceId: session.deviceId,
                ipAddress: session.ipAddress,
                metadata: __assign(
                  {
                    reason: reason.type,
                    message: reason.message,
                    terminatedBy: terminatedBy,
                    sessionDuration: Date.now() - session.createdAt.getTime(),
                  },
                  reason.metadata,
                ),
              }),
            ];
          case 3:
            // Log session termination
            _a.sent();
            // Notify user about session termination
            return [4 /*yield*/, this.notifySessionTermination(session, reason)];
          case 4:
            // Notify user about session termination
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_3 = _a.sent();
            console.error("Failed to terminate session:", error_3);
            throw error_3;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate all sessions for a user
   */
  ConcurrentSessionManager.prototype.terminateAllUserSessions = function (
    userId,
    reason,
    excludeSessionId,
    terminatedBy,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions,
        sessionsToTerminate,
        terminatedSessionIds,
        _i,
        sessionsToTerminate_1,
        session,
        error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getActiveSessions(userId)];
          case 1:
            activeSessions = _a.sent();
            sessionsToTerminate = excludeSessionId
              ? activeSessions.filter((s) => s.sessionId !== excludeSessionId)
              : activeSessions;
            terminatedSessionIds = [];
            (_i = 0), (sessionsToTerminate_1 = sessionsToTerminate);
            _a.label = 2;
          case 2:
            if (!(_i < sessionsToTerminate_1.length)) return [3 /*break*/, 5];
            session = sessionsToTerminate_1[_i];
            return [4 /*yield*/, this.terminateSession(session.sessionId, reason, terminatedBy)];
          case 3:
            _a.sent();
            terminatedSessionIds.push(session.sessionId);
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/, terminatedSessionIds];
          case 6:
            error_4 = _a.sent();
            console.error("Failed to terminate all user sessions:", error_4);
            throw error_4;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active sessions for a user
   */
  ConcurrentSessionManager.prototype.getActiveSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("*")
                .eq("user_id", userId)
                .eq("is_active", true)
                .order("last_activity", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get active sessions: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToSessionInfo)];
          case 2:
            error_5 = _b.sent();
            console.error("Failed to get active sessions:", error_5);
            throw error_5;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session information by session ID
   */
  ConcurrentSessionManager.prototype.getSessionInfo = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").select("*").eq("session_id", sessionId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") {
                return [2 /*return*/, null]; // Session not found
              }
              throw new Error("Failed to get session info: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseToSessionInfo(data)];
          case 2:
            error_6 = _b.sent();
            console.error("Failed to get session info:", error_6);
            throw error_6;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session statistics for monitoring
   */
  ConcurrentSessionManager.prototype.getSessionStatistics = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var query,
        _a,
        activeSessions,
        activeError,
        yesterday,
        terminationQuery,
        _b,
        recentTerminations,
        terminationError,
        sessionsByRole,
        sessionsByDevice,
        totalDuration,
        _i,
        _c,
        session,
        deviceType,
        duration,
        averageSessionDuration,
        error_7;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 3, , 4]);
            query = this.supabase.from("user_sessions").select("*").eq("is_active", true);
            if (userId) {
              query = query.eq("user_id", userId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _d.sent()), (activeSessions = _a.data), (activeError = _a.error);
            if (activeError) {
              throw new Error("Failed to get active sessions: ".concat(activeError.message));
            }
            yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            terminationQuery = this.supabase
              .from("user_sessions")
              .select("terminated_at")
              .eq("is_active", false)
              .gte("terminated_at", yesterday.toISOString());
            if (userId) {
              terminationQuery = terminationQuery.eq("user_id", userId);
            }
            return [4 /*yield*/, terminationQuery];
          case 2:
            (_b = _d.sent()), (recentTerminations = _b.data), (terminationError = _b.error);
            if (terminationError) {
              throw new Error(
                "Failed to get recent terminations: ".concat(terminationError.message),
              );
            }
            sessionsByRole = {
              owner: 0,
              manager: 0,
              staff: 0,
              patient: 0,
            };
            sessionsByDevice = {};
            totalDuration = 0;
            for (_i = 0, _c = activeSessions || []; _i < _c.length; _i++) {
              session = _c[_i];
              deviceType = session.device_type || "unknown";
              sessionsByDevice[deviceType] = (sessionsByDevice[deviceType] || 0) + 1;
              duration = Date.now() - new Date(session.created_at).getTime();
              totalDuration += duration;
            }
            averageSessionDuration = (
              activeSessions === null || activeSessions === void 0
                ? void 0
                : activeSessions.length
            )
              ? totalDuration / activeSessions.length
              : 0;
            return [
              2 /*return*/,
              {
                totalActiveSessions:
                  (activeSessions === null || activeSessions === void 0
                    ? void 0
                    : activeSessions.length) || 0,
                sessionsByRole: sessionsByRole,
                sessionsByDevice: sessionsByDevice,
                averageSessionDuration: averageSessionDuration,
                recentTerminations:
                  (recentTerminations === null || recentTerminations === void 0
                    ? void 0
                    : recentTerminations.length) || 0,
              },
            ];
          case 3:
            error_7 = _d.sent();
            console.error("Failed to get session statistics:", error_7);
            throw error_7;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session limits for a role
   */
  ConcurrentSessionManager.prototype.updateSessionLimits = function (role, limits) {
    this.sessionLimits[role] = __assign(__assign(__assign({}, this.sessionLimits[role]), limits), {
      role: role,
    });
  };
  /**
   * Get current session limits for a role
   */
  ConcurrentSessionManager.prototype.getSessionLimits = function (role) {
    return this.sessionLimits[role];
  };
  /**
   * Clean up expired sessions
   */
  ConcurrentSessionManager.prototype.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var expiredThreshold, _a, expiredSessions, selectError, updateError, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            expiredThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("session_id, user_id, device_id")
                .eq("is_active", true)
                .lt("last_activity", expiredThreshold.toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (expiredSessions = _a.data), (selectError = _a.error);
            if (selectError) {
              throw new Error("Failed to find expired sessions: ".concat(selectError.message));
            }
            if (!expiredSessions || expiredSessions.length === 0) {
              return [2 /*return*/, 0];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  terminated_at: new Date().toISOString(),
                  termination_reason: "timeout",
                  termination_message: "Session expired due to inactivity",
                })
                .in(
                  "session_id",
                  expiredSessions.map((s) => s.session_id),
                ),
            ];
          case 2:
            updateError = _b.sent().error;
            if (updateError) {
              throw new Error("Failed to cleanup expired sessions: ".concat(updateError.message));
            }
            // Log cleanup event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_cleanup",
                metadata: {
                  expiredSessionsCount: expiredSessions.length,
                  expiredThreshold: expiredThreshold.toISOString(),
                },
              }),
            ];
          case 3:
            // Log cleanup event
            _b.sent();
            return [2 /*return*/, expiredSessions.length];
          case 4:
            error_8 = _b.sent();
            console.error("Failed to cleanup expired sessions:", error_8);
            throw error_8;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Destroy the session manager and cleanup resources
   */
  ConcurrentSessionManager.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  };
  // Private methods
  ConcurrentSessionManager.prototype.generateSessionId = () =>
    "sess_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  ConcurrentSessionManager.prototype.enforceSessionLimits = function (
    userId,
    userRole,
    deviceId,
    activeSessions,
    limits,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var terminatedSessions,
        otherDeviceSessions,
        _i,
        otherDeviceSessions_1,
        session,
        deviceSessions,
        sessionsToTerminate,
        _a,
        sessionsToTerminate_2,
        session,
        remainingSessions,
        sessionsToTerminate,
        _b,
        sessionsToTerminate_3,
        session;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            terminatedSessions = [];
            if (limits.allowMultipleDevices) return [3 /*break*/, 4];
            otherDeviceSessions = activeSessions.filter((s) => s.deviceId !== deviceId);
            (_i = 0), (otherDeviceSessions_1 = otherDeviceSessions);
            _c.label = 1;
          case 1:
            if (!(_i < otherDeviceSessions_1.length)) return [3 /*break*/, 4];
            session = otherDeviceSessions_1[_i];
            return [
              4 /*yield*/,
              this.terminateSession(session.sessionId, {
                type: "device_change",
                message: "Session terminated due to login from different device",
              }),
            ];
          case 2:
            _c.sent();
            terminatedSessions.push(session.sessionId);
            _c.label = 3;
          case 3:
            _i++;
            return [3 /*break*/, 1];
          case 4:
            deviceSessions = activeSessions.filter((s) => s.deviceId === deviceId);
            if (!(deviceSessions.length >= limits.maxSessionsPerDevice)) return [3 /*break*/, 8];
            sessionsToTerminate = deviceSessions
              .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
              .slice(0, deviceSessions.length - limits.maxSessionsPerDevice + 1);
            (_a = 0), (sessionsToTerminate_2 = sessionsToTerminate);
            _c.label = 5;
          case 5:
            if (!(_a < sessionsToTerminate_2.length)) return [3 /*break*/, 8];
            session = sessionsToTerminate_2[_a];
            return [
              4 /*yield*/,
              this.terminateSession(session.sessionId, {
                type: "limit_exceeded",
                message: "Session terminated due to device session limit exceeded",
              }),
            ];
          case 6:
            _c.sent();
            terminatedSessions.push(session.sessionId);
            _c.label = 7;
          case 7:
            _a++;
            return [3 /*break*/, 5];
          case 8:
            remainingSessions = activeSessions.filter(
              (s) => !terminatedSessions.includes(s.sessionId),
            );
            if (!(remainingSessions.length >= limits.maxSessions)) return [3 /*break*/, 12];
            sessionsToTerminate = limits.forceLogoutOldest
              ? remainingSessions
                  .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
                  .slice(0, remainingSessions.length - limits.maxSessions + 1)
              : remainingSessions.slice(-1);
            (_b = 0), (sessionsToTerminate_3 = sessionsToTerminate);
            _c.label = 9;
          case 9:
            if (!(_b < sessionsToTerminate_3.length)) return [3 /*break*/, 12];
            session = sessionsToTerminate_3[_b];
            return [
              4 /*yield*/,
              this.terminateSession(session.sessionId, {
                type: "limit_exceeded",
                message: "Session terminated due to maximum session limit exceeded",
              }),
            ];
          case 10:
            _c.sent();
            terminatedSessions.push(session.sessionId);
            _c.label = 11;
          case 11:
            _b++;
            return [3 /*break*/, 9];
          case 12:
            return [2 /*return*/, terminatedSessions];
        }
      });
    });
  };
  ConcurrentSessionManager.prototype.mapDatabaseToSessionInfo = (data) => ({
    sessionId: data.session_id,
    userId: data.user_id,
    deviceId: data.device_id,
    deviceName: data.device_name,
    deviceType: data.device_type,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    location: data.location,
    createdAt: new Date(data.created_at),
    lastActivity: new Date(data.last_activity),
    isActive: data.is_active,
    metadata: data.metadata,
  });
  ConcurrentSessionManager.prototype.startCleanupInterval = function () {
    this.cleanupInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var error_9;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.cleanupExpiredSessions()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_9 = _a.sent();
                console.error("Session cleanup failed:", error_9);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        }),
      5 * 60 * 1000,
    ); // Every 5 minutes
  };
  ConcurrentSessionManager.prototype.notifyNewSession = function (userId, session) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // This would integrate with your notification system
            // For now, we'll just log the event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "new_session_notification",
                userId: userId,
                sessionId: session.sessionId,
                deviceId: session.deviceId,
                ipAddress: session.ipAddress,
                metadata: {
                  deviceName: session.deviceName,
                  deviceType: session.deviceType,
                  location: session.location,
                },
              }),
            ];
          case 1:
            // This would integrate with your notification system
            // For now, we'll just log the event
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Failed to notify new session:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  ConcurrentSessionManager.prototype.notifySessionTermination = function (session, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            // This would integrate with your notification system
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "session_termination_notification",
                userId: session.userId,
                sessionId: session.sessionId,
                deviceId: session.deviceId,
                ipAddress: session.ipAddress,
                metadata: {
                  reason: reason.type,
                  message: reason.message,
                  deviceName: session.deviceName,
                  sessionDuration: Date.now() - session.createdAt.getTime(),
                },
              }),
            ];
          case 1:
            // This would integrate with your notification system
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Failed to notify session termination:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return ConcurrentSessionManager;
})();
exports.ConcurrentSessionManager = ConcurrentSessionManager;
