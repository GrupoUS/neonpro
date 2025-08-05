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
exports.SessionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var crypto_1 = require("crypto");
var SessionManager = /** @class */ (() => {
  function SessionManager(supabaseUrl, supabaseKey, auditLogger, encryption, lgpdManager, config) {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = auditLogger;
    this.encryption = encryption;
    this.lgpdManager = lgpdManager;
    // Default configuration
    this.config = __assign(
      {
        sessionTimeout: 120,
        maxConcurrentSessions: 3,
        sessionCleanupInterval: 15,
        inactivityTimeout: 30,
        secureSessionCookies: true,
        sessionTokenLength: 64,
        enableDeviceFingerprinting: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15,
        enableTwoFactor: false,
      },
      config,
    );
    this.startCleanupInterval();
  }
  /**
   * Create a new session for a patient
   */
  SessionManager.prototype.createSession = function (
    patientId,
    ipAddress,
    userAgent,
    deviceFingerprint,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionToken, expiresAt, sessionData, _a, data, error, session, error_1;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 6, , 8]);
            // Check for existing sessions and enforce limits
            return [4 /*yield*/, this.enforceSessionLimits(patientId)];
          case 1:
            // Check for existing sessions and enforce limits
            _c.sent();
            sessionToken = this.generateSessionToken();
            expiresAt = new Date(Date.now() + this.config.sessionTimeout * 60 * 1000);
            _b = {
              patientId: patientId,
            };
            return [4 /*yield*/, this.encryption.encrypt(sessionToken)];
          case 2:
            sessionData =
              ((_b.sessionToken = _c.sent()),
              (_b.expiresAt = expiresAt),
              (_b.lastActivity = new Date()),
              (_b.ipAddress = ipAddress),
              (_b.userAgent = userAgent),
              (_b.deviceFingerprint = deviceFingerprint ? deviceFingerprint.hash : undefined),
              (_b.isActive = true),
              (_b.createdAt = new Date()),
              _b);
            return [
              4 /*yield*/,
              this.supabase.from("patient_portal_sessions").insert(sessionData).select().single(),
            ];
          case 3:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to create session: ".concat(error.message));
            }
            session = __assign(__assign({}, data), {
              sessionToken: sessionToken, // Return unencrypted token for client use
            });
            // Log session creation
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "session_created",
                userId: patientId,
                userType: "patient",
                resource: "patient_portal_session",
                resourceId: session.id,
                details: {
                  ipAddress: ipAddress,
                  userAgent: userAgent.substring(0, 100),
                  expiresAt: expiresAt.toISOString(),
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
              }),
            ];
          case 4:
            // Log session creation
            _c.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.logSecurityEvent({
                eventType: "login",
                patientId: patientId,
                sessionId: session.id,
                ipAddress: ipAddress,
                userAgent: userAgent,
                details: {
                  deviceFingerprint:
                    deviceFingerprint === null || deviceFingerprint === void 0
                      ? void 0
                      : deviceFingerprint.hash,
                  sessionDuration: this.config.sessionTimeout,
                },
                severity: "low",
              }),
            ];
          case 5:
            // Log security event
            _c.sent();
            return [2 /*return*/, session];
          case 6:
            error_1 = _c.sent();
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "session_creation_failed",
                userId: patientId,
                userType: "patient",
                resource: "patient_portal_session",
                details: {
                  error: error_1 instanceof Error ? error_1.message : "Unknown error",
                  ipAddress: ipAddress,
                  userAgent: userAgent.substring(0, 100),
                },
                ipAddress: ipAddress,
                userAgent: userAgent,
              }),
            ];
          case 7:
            _c.sent();
            throw error_1;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate a session token
   */
  SessionManager.prototype.validateSession = function (sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        sessions,
        error,
        _i,
        _b,
        sessionRecord,
        decryptedToken,
        session,
        inactivityLimit,
        requiresRefresh,
        decryptError_1,
        error_2;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 10, , 11]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .select("*")
                .eq("is_active", true)
                .gt("expires_at", new Date().toISOString()),
            ];
          case 1:
            (_a = _c.sent()), (sessions = _a.data), (error = _a.error);
            if (error) {
              return [2 /*return*/, { isValid: false, reason: "Database error" }];
            }
            (_i = 0), (_b = sessions || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 9];
            sessionRecord = _b[_i];
            _c.label = 3;
          case 3:
            _c.trys.push([3, 7, , 8]);
            return [4 /*yield*/, this.encryption.decrypt(sessionRecord.session_token)];
          case 4:
            decryptedToken = _c.sent();
            if (!(decryptedToken === sessionToken)) return [3 /*break*/, 6];
            session = {
              id: sessionRecord.id,
              patientId: sessionRecord.patient_id,
              sessionToken: sessionToken,
              expiresAt: new Date(sessionRecord.expires_at),
              lastActivity: new Date(sessionRecord.last_activity),
              ipAddress: sessionRecord.ip_address,
              userAgent: sessionRecord.user_agent,
              deviceFingerprint: sessionRecord.device_fingerprint,
              isActive: sessionRecord.is_active,
              createdAt: new Date(sessionRecord.created_at),
            };
            inactivityLimit = new Date(Date.now() - this.config.inactivityTimeout * 60 * 1000);
            requiresRefresh = session.lastActivity < inactivityLimit;
            if (requiresRefresh) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  reason: "Session expired due to inactivity",
                  requiresRefresh: true,
                },
              ];
            }
            // Update last activity
            return [4 /*yield*/, this.updateSessionActivity(session.id)];
          case 5:
            // Update last activity
            _c.sent();
            return [2 /*return*/, { isValid: true, session: session }];
          case 6:
            return [3 /*break*/, 8];
          case 7:
            decryptError_1 = _c.sent();
            // Continue to next session if decryption fails
            return [3 /*break*/, 8];
          case 8:
            _i++;
            return [3 /*break*/, 2];
          case 9:
            return [2 /*return*/, { isValid: false, reason: "Invalid session token" }];
          case 10:
            error_2 = _c.sent();
            return [
              2 /*return*/,
              {
                isValid: false,
                reason: error_2 instanceof Error ? error_2.message : "Unknown error",
              },
            ];
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Refresh a session (extend expiration and update activity)
   */
  SessionManager.prototype.refreshSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var newExpiresAt, _a, data, error, decryptedToken, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            newExpiresAt = new Date(Date.now() + this.config.sessionTimeout * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .update({
                  expires_at: newExpiresAt.toISOString(),
                  last_activity: new Date().toISOString(),
                })
                .eq("id", sessionId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            return [4 /*yield*/, this.encryption.decrypt(data.session_token)];
          case 2:
            decryptedToken = _b.sent();
            return [
              2 /*return*/,
              {
                id: data.id,
                patientId: data.patient_id,
                sessionToken: decryptedToken,
                expiresAt: new Date(data.expires_at),
                lastActivity: new Date(data.last_activity),
                ipAddress: data.ip_address,
                userAgent: data.user_agent,
                deviceFingerprint: data.device_fingerprint,
                isActive: data.is_active,
                createdAt: new Date(data.created_at),
              },
            ];
          case 3:
            error_3 = _b.sent();
            console.error("Error refreshing session:", error_3);
            return [2 /*return*/, null];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate a specific session
   */
  SessionManager.prototype.terminateSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionData, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .select("patient_id, ip_address, user_agent")
                .eq("id", sessionId)
                .single(),
            ];
          case 1:
            sessionData = _a.sent().data;
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .update({ is_active: false })
                .eq("id", sessionId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              return [2 /*return*/, false];
            }
            if (!sessionData) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "session_terminated",
                userId: sessionData.patient_id,
                userType: "patient",
                resource: "patient_portal_session",
                resourceId: sessionId,
                details: {
                  reason: reason || "Manual termination",
                  ipAddress: sessionData.ip_address,
                },
                ipAddress: sessionData.ip_address,
                userAgent: sessionData.user_agent,
              }),
            ];
          case 3:
            _a.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.logSecurityEvent({
                eventType: "logout",
                patientId: sessionData.patient_id,
                sessionId: sessionId,
                ipAddress: sessionData.ip_address,
                userAgent: sessionData.user_agent,
                details: { reason: reason || "Manual termination" },
                severity: "low",
              }),
            ];
          case 4:
            // Log security event
            _a.sent();
            _a.label = 5;
          case 5:
            return [2 /*return*/, true];
          case 6:
            error_4 = _a.sent();
            console.error("Error terminating session:", error_4);
            return [2 /*return*/, false];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate all sessions for a patient
   */
  SessionManager.prototype.terminateAllSessions = function (patientId, excludeSessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, error, count, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            query = this.supabase
              .from("patient_portal_sessions")
              .update({ is_active: false })
              .eq("patient_id", patientId)
              .eq("is_active", true);
            if (excludeSessionId) {
              query = query.neq("id", excludeSessionId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (error = _a.error), (count = _a.count);
            if (error) {
              throw new Error("Failed to terminate sessions: ".concat(error.message));
            }
            // Log bulk session termination
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "bulk_session_termination",
                userId: patientId,
                userType: "patient",
                resource: "patient_portal_session",
                details: {
                  terminatedCount: count || 0,
                  excludedSession: excludeSessionId,
                },
              }),
            ];
          case 2:
            // Log bulk session termination
            _b.sent();
            return [2 /*return*/, count || 0];
          case 3:
            error_5 = _b.sent();
            console.error("Error terminating all sessions:", error_5);
            return [2 /*return*/, 0];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active sessions for a patient
   */
  SessionManager.prototype.getActiveSessions = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, sessions, _i, _b, sessionRecord, decryptedToken, decryptError_2, error_6;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 8, , 9]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .select("*")
                .eq("patient_id", patientId)
                .eq("is_active", true)
                .gt("expires_at", new Date().toISOString())
                .order("last_activity", { ascending: false }),
            ];
          case 1:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get active sessions: ".concat(error.message));
            }
            sessions = [];
            (_i = 0), (_b = data || []);
            _c.label = 2;
          case 2:
            if (!(_i < _b.length)) return [3 /*break*/, 7];
            sessionRecord = _b[_i];
            _c.label = 3;
          case 3:
            _c.trys.push([3, 5, , 6]);
            return [4 /*yield*/, this.encryption.decrypt(sessionRecord.session_token)];
          case 4:
            decryptedToken = _c.sent();
            sessions.push({
              id: sessionRecord.id,
              patientId: sessionRecord.patient_id,
              sessionToken: decryptedToken,
              expiresAt: new Date(sessionRecord.expires_at),
              lastActivity: new Date(sessionRecord.last_activity),
              ipAddress: sessionRecord.ip_address,
              userAgent: sessionRecord.user_agent,
              deviceFingerprint: sessionRecord.device_fingerprint,
              isActive: sessionRecord.is_active,
              createdAt: new Date(sessionRecord.created_at),
            });
            return [3 /*break*/, 6];
          case 5:
            decryptError_2 = _c.sent();
            // Skip sessions that can't be decrypted
            return [3 /*break*/, 6];
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [2 /*return*/, sessions];
          case 8:
            error_6 = _c.sent();
            console.error("Error getting active sessions:", error_6);
            return [2 /*return*/, []];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate device fingerprint hash
   */
  SessionManager.prototype.generateDeviceFingerprint = (fingerprintData) => {
    var dataString = JSON.stringify(fingerprintData);
    var hash = crypto_1.default.createHash("sha256").update(dataString).digest("hex");
    return __assign(__assign({}, fingerprintData), { hash: hash });
  };
  /**
   * Log session activity
   */
  SessionManager.prototype.logActivity = function (activity) {
    return __awaiter(this, void 0, void 0, function () {
      var error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("patient_portal_activity").insert({
                patient_id: activity.sessionId, // This should be mapped to patient_id
                session_id: activity.sessionId,
                activity_type: activity.activityType,
                description: "Session activity: ".concat(activity.activityType),
                metadata: activity.details || {},
                ip_address: activity.ipAddress,
                user_agent: activity.userAgent,
                timestamp: activity.timestamp.toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_7 = _a.sent();
            console.error("Error logging session activity:", error_7);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up expired sessions
   */
  SessionManager.prototype.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, error, count, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .delete()
                .or(
                  "expires_at.lt."
                    .concat(new Date().toISOString(), ",last_activity.lt.")
                    .concat(
                      new Date(
                        Date.now() - this.config.inactivityTimeout * 60 * 1000,
                      ).toISOString(),
                    ),
                ),
            ];
          case 1:
            (_a = _b.sent()), (error = _a.error), (count = _a.count);
            if (error) {
              console.error("Error cleaning up expired sessions:", error);
              return [2 /*return*/, 0];
            }
            if (!(count && count > 0)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.auditLogger.log({
                action: "session_cleanup",
                userId: "system",
                userType: "system",
                resource: "patient_portal_session",
                details: {
                  cleanedUpCount: count,
                  cleanupReason: "Expired or inactive sessions",
                },
              }),
            ];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, count || 0];
          case 4:
            error_8 = _b.sent();
            console.error("Error during session cleanup:", error_8);
            return [2 /*return*/, 0];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session statistics
   */
  SessionManager.prototype.getSessionStatistics = function () {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions,
        sessionsByPatient,
        totalDuration,
        recentLogins,
        oneHourAgo,
        _i,
        _a,
        session,
        duration,
        averageSessionDuration,
        error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .select("patient_id, created_at, last_activity")
                .eq("is_active", true)
                .gt("expires_at", new Date().toISOString()),
            ];
          case 1:
            activeSessions = _b.sent().data;
            sessionsByPatient = {};
            totalDuration = 0;
            recentLogins = 0;
            oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            for (_i = 0, _a = activeSessions || []; _i < _a.length; _i++) {
              session = _a[_i];
              // Count sessions by patient
              sessionsByPatient[session.patient_id] =
                (sessionsByPatient[session.patient_id] || 0) + 1;
              duration =
                new Date(session.last_activity).getTime() - new Date(session.created_at).getTime();
              totalDuration += duration;
              // Count recent logins
              if (new Date(session.created_at) > oneHourAgo) {
                recentLogins++;
              }
            }
            averageSessionDuration = (
              activeSessions === null || activeSessions === void 0
                ? void 0
                : activeSessions.length
            )
              ? totalDuration / activeSessions.length / (1000 * 60)
              : 0;
            return [
              2 /*return*/,
              {
                totalActiveSessions:
                  (activeSessions === null || activeSessions === void 0
                    ? void 0
                    : activeSessions.length) || 0,
                sessionsByPatient: sessionsByPatient,
                averageSessionDuration: Math.round(averageSessionDuration),
                recentLogins: recentLogins,
              },
            ];
          case 2:
            error_9 = _b.sent();
            console.error("Error getting session statistics:", error_9);
            return [
              2 /*return*/,
              {
                totalActiveSessions: 0,
                sessionsByPatient: {},
                averageSessionDuration: 0,
                recentLogins: 0,
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Destroy the session manager and cleanup resources
   */
  SessionManager.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  };
  // Private helper methods
  SessionManager.prototype.generateSessionToken = function () {
    return crypto_1.default.randomBytes(this.config.sessionTokenLength).toString("hex");
  };
  SessionManager.prototype.enforceSessionLimits = function (patientId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions, sessionsToTerminate, _i, sessionsToTerminate_1, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getActiveSessions(patientId)];
          case 1:
            activeSessions = _a.sent();
            if (!(activeSessions.length >= this.config.maxConcurrentSessions))
              return [3 /*break*/, 5];
            sessionsToTerminate = activeSessions
              .sort((a, b) => a.lastActivity.getTime() - b.lastActivity.getTime())
              .slice(0, activeSessions.length - this.config.maxConcurrentSessions + 1);
            (_i = 0), (sessionsToTerminate_1 = sessionsToTerminate);
            _a.label = 2;
          case 2:
            if (!(_i < sessionsToTerminate_1.length)) return [3 /*break*/, 5];
            session = sessionsToTerminate_1[_i];
            return [4 /*yield*/, this.terminateSession(session.id, "Session limit exceeded")];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManager.prototype.updateSessionActivity = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("patient_portal_sessions")
                .update({ last_activity: new Date().toISOString() })
                .eq("id", sessionId),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error updating session activity:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManager.prototype.startCleanupInterval = function () {
    this.cleanupInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                return [4 /*yield*/, this.cleanupExpiredSessions()];
              case 1:
                _a.sent();
                return [2 /*return*/];
            }
          });
        }),
      this.config.sessionCleanupInterval * 60 * 1000,
    );
  };
  SessionManager.prototype.logSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("patient_security_events").insert({
                event_type: event.eventType,
                patient_id: event.patientId,
                session_id: event.sessionId,
                ip_address: event.ipAddress,
                user_agent: event.userAgent,
                details: event.details || {},
                severity: event.severity,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error logging security event:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return SessionManager;
})();
exports.SessionManager = SessionManager;
