/**
 * Session Management Service
 * Story 1.4: Session Management & Security
 *
 * Comprehensive session management with security monitoring,
 * device tracking, and LGPD compliance.
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
exports.UnifiedSessionSystem =
  exports.createsessionManager =
  exports.SessionManager =
  exports.SecurityLevel =
  exports.DeviceType =
  exports.SessionAction =
    void 0;
var client_1 = require("@/lib/supabase/client");
var session_1 = require("@/types/session");
// Re-export types that are needed elsewhere
var session_2 = require("@/types/session");
Object.defineProperty(exports, "SessionAction", {
  enumerable: true,
  get: () => session_2.SessionAction,
});
Object.defineProperty(exports, "DeviceType", {
  enumerable: true,
  get: () => session_2.DeviceType,
});
Object.defineProperty(exports, "SecurityLevel", {
  enumerable: true,
  get: () => session_2.SecurityLevel,
});
var logger_1 = require("@/lib/logger");
// ============================================================================
// SESSION MANAGEMENT CLASS
// ============================================================================
var SessionManager = /** @class */ (() => {
  function SessionManager() {
    this.supabase = (0, client_1.createClient)();
    this.config = {
      default_timeout_minutes: 30,
      max_concurrent_sessions: 5,
      security_monitoring_enabled: true,
      device_fingerprinting_enabled: true,
      geo_location_tracking: true,
      audit_logging_enabled: true,
      cleanup_interval_hours: 24,
      threat_intelligence_enabled: true,
    };
    this.securityThresholds = {
      suspicious_login_attempts: 5,
      rapid_request_limit: 100,
      unusual_location_score: 70,
      device_change_score: 60,
      concurrent_session_penalty: 20,
      ip_change_score: 50,
    };
  }
  // ============================================================================
  // CORE SESSION OPERATIONS
  // ============================================================================
  /**
   * Create a new user session with security validation
   */
  SessionManager.prototype.createSession = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceInfo, securityScore, sessionData, _a, session, error, error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 8, , 9]);
            return [4 /*yield*/, this.validateDevice(request.user_id, request.device_fingerprint)];
          case 1:
            deviceInfo = _b.sent();
            return [4 /*yield*/, this.calculateSecurityScore(request)];
          case 2:
            securityScore = _b.sent();
            // Check concurrent session limits
            return [4 /*yield*/, this.enforceConcurrentSessionLimits(request.user_id)];
          case 3:
            // Check concurrent session limits
            _b.sent();
            sessionData = {
              user_id: request.user_id,
              device_fingerprint: request.device_fingerprint,
              device_name: request.device_name,
              ip_address: request.ip_address,
              user_agent: request.user_agent,
              location: request.location,
              created_at: new Date().toISOString(),
              last_activity: new Date().toISOString(),
              expires_at: this.calculateExpiryTime(request.user_id),
              is_active: true,
              security_score: securityScore,
            };
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").insert(sessionData).select().single(),
            ];
          case 4:
            (_a = _b.sent()), (session = _a.data), (error = _a.error);
            if (error) throw error;
            // Log session creation
            return [
              4 /*yield*/,
              this.logSessionAction(session.id, request.user_id, SessionAction.LOGIN, {
                device_fingerprint: request.device_fingerprint,
                ip_address: request.ip_address,
                security_score: securityScore,
              }),
            ];
          case 5:
            // Log session creation
            _b.sent();
            if (!this.config.security_monitoring_enabled) return [3 /*break*/, 7];
            return [4 /*yield*/, this.monitorSessionSecurity(session)];
          case 6:
            _b.sent();
            _b.label = 7;
          case 7:
            logger_1.logger.info("Session created successfully", {
              session_id: session.id,
              user_id: request.user_id,
              security_score: securityScore,
            });
            return [2 /*return*/, session];
          case 8:
            error_1 = _b.sent();
            logger_1.logger.error("Failed to create session", { error: error_1, request: request });
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity and security score
   */
  SessionManager.prototype.updateSession = function (sessionId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, session, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            updateData = __assign(__assign({}, updates), {
              last_activity: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update(updateData)
                .eq("id", sessionId)
                .eq("is_active", true)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (session = _a.data), (error = _a.error);
            if (error) throw error;
            if (!updates.last_activity) return [3 /*break*/, 3];
            return [4 /*yield*/, this.extendSessionIfNeeded(sessionId)];
          case 2:
            _b.sent();
            _b.label = 3;
          case 3:
            return [2 /*return*/, session];
          case 4:
            error_2 = _b.sent();
            logger_1.logger.error("Failed to update session", {
              error: error_2,
              sessionId: sessionId,
              updates: updates,
            });
            throw error_2;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate a session
   */
  SessionManager.prototype.terminateSession = function (sessionId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, reason) {
      var session, error, error_3;
      if (reason === void 0) {
        reason = "user_logout";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").select("user_id").eq("id", sessionId).single(),
            ];
          case 1:
            session = _a.sent().data;
            if (!session) throw new Error("Session not found");
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  expires_at: new Date().toISOString(),
                })
                .eq("id", sessionId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) throw error;
            // Log session termination
            return [
              4 /*yield*/,
              this.logSessionAction(sessionId, session.user_id, SessionAction.LOGOUT, {
                reason: reason,
                terminated_at: new Date().toISOString(),
              }),
            ];
          case 3:
            // Log session termination
            _a.sent();
            logger_1.logger.info("Session terminated", { session_id: sessionId, reason: reason });
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            logger_1.logger.error("Failed to terminate session", {
              error: error_3,
              sessionId: sessionId,
              reason: reason,
            });
            throw error_3;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // SECURITY MONITORING
  // ============================================================================
  /**
   * Monitor session for suspicious activity
   */
  SessionManager.prototype.monitorSessionSecurity = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var suspiciousEvents, _i, suspiciousEvents_1, eventType, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 11, , 12]);
            suspiciousEvents = [];
            return [4 /*yield*/, this.isUnusualLocation(session.user_id, session.ip_address)];
          case 1:
            // Check for unusual location
            if (_a.sent()) {
              suspiciousEvents.push(session_1.SecurityEventType.UNUSUAL_LOCATION);
            }
            return [4 /*yield*/, this.isNewDevice(session.user_id, session.device_fingerprint)];
          case 2:
            // Check for device changes
            if (_a.sent()) {
              suspiciousEvents.push(session_1.SecurityEventType.DEVICE_CHANGE);
            }
            return [4 /*yield*/, this.hasRapidLoginAttempts(session.user_id)];
          case 3:
            // Check for rapid login attempts
            if (_a.sent()) {
              suspiciousEvents.push(session_1.SecurityEventType.RAPID_REQUESTS);
            }
            (_i = 0), (suspiciousEvents_1 = suspiciousEvents);
            _a.label = 4;
          case 4:
            if (!(_i < suspiciousEvents_1.length)) return [3 /*break*/, 7];
            eventType = suspiciousEvents_1[_i];
            return [4 /*yield*/, this.createSecurityEvent(session, eventType)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 4];
          case 7:
            if (!(session.security_score < 30)) return [3 /*break*/, 10];
            return [4 /*yield*/, this.terminateSession(session.id, "security_risk")];
          case 8:
            _a.sent();
            return [
              4 /*yield*/,
              this.createSecurityEvent(
                session,
                session_1.SecurityEventType.SESSION_HIJACK_ATTEMPT,
                session_1.SecuritySeverity.CRITICAL,
              ),
            ];
          case 9:
            _a.sent();
            _a.label = 10;
          case 10:
            return [3 /*break*/, 12];
          case 11:
            error_4 = _a.sent();
            logger_1.logger.error("Security monitoring failed", {
              error: error_4,
              session_id: session.id,
            });
            return [3 /*break*/, 12];
          case 12:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate security score for session
   */
  SessionManager.prototype.calculateSecurityScore = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var score, device, activeSessions, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            score = 100;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            return [
              4 /*yield*/,
              this.getDeviceRegistration(request.user_id, request.device_fingerprint),
            ];
          case 2:
            device = _a.sent();
            if (!(device === null || device === void 0 ? void 0 : device.trusted)) score -= 20;
            return [4 /*yield*/, this.isUnusualLocation(request.user_id, request.ip_address)];
          case 3:
            // Check location consistency
            if (_a.sent()) {
              score -= this.securityThresholds.unusual_location_score;
            }
            return [4 /*yield*/, this.getActiveSessionCount(request.user_id)];
          case 4:
            activeSessions = _a.sent();
            if (activeSessions > 2) {
              score -= activeSessions * this.securityThresholds.concurrent_session_penalty;
            }
            // Ensure score is within bounds
            return [2 /*return*/, Math.max(0, Math.min(100, score))];
          case 5:
            error_5 = _a.sent();
            logger_1.logger.error("Security score calculation failed", {
              error: error_5,
              request: request,
            });
            return [2 /*return*/, 50]; // Default moderate security score
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create security event record
   */
  SessionManager.prototype.createSecurityEvent = function (session_3, eventType_1) {
    return __awaiter(this, arguments, void 0, function (session, eventType, severity) {
      var eventData, error, error_6;
      if (severity === void 0) {
        severity = session_1.SecuritySeverity.MEDIUM;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            eventData = {
              session_id: session.id,
              user_id: session.user_id,
              event_type: eventType,
              severity: severity,
              details: {
                ip_address: session.ip_address,
                device_fingerprint: session.device_fingerprint,
                security_score: session.security_score,
                timestamp: new Date().toISOString(),
              },
              ip_address: session.ip_address,
              user_agent: session.user_agent,
              timestamp: new Date().toISOString(),
              resolved: false,
            };
            return [4 /*yield*/, this.supabase.from("session_security_events").insert(eventData)];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            logger_1.logger.warn("Security event created", {
              event_type: eventType,
              severity: severity,
              session_id: session.id,
            });
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            logger_1.logger.error("Failed to create security event", {
              error: error_6,
              eventType: eventType,
              session: session,
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================
  /**
   * Validate and register device
   */
  SessionManager.prototype.validateDevice = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.getDeviceRegistration(userId, deviceFingerprint)];
          case 1:
            device = _a.sent();
            if (device) return [3 /*break*/, 3];
            return [4 /*yield*/, this.registerDevice(userId, deviceFingerprint)];
          case 2:
            // Register new device
            device = _a.sent();
            return [3 /*break*/, 5];
          case 3:
            // Update last seen
            return [4 /*yield*/, this.updateDeviceLastSeen(device.id)];
          case 4:
            // Update last seen
            _a.sent();
            _a.label = 5;
          case 5:
            return [2 /*return*/, device];
          case 6:
            error_7 = _a.sent();
            logger_1.logger.error("Device validation failed", {
              error: error_7,
              userId: userId,
              deviceFingerprint: deviceFingerprint,
            });
            return [2 /*return*/, null];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Register a new device
   */
  SessionManager.prototype.registerDevice = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceData, _a, device, error, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            deviceData = {
              user_id: userId,
              device_fingerprint: deviceFingerprint,
              device_name: "Unknown Device",
              device_type: DeviceType.UNKNOWN,
              browser_info: {
                name: "Unknown",
                version: "Unknown",
                platform: "Unknown",
              },
              trusted: false,
              registered_at: new Date().toISOString(),
              last_seen: new Date().toISOString(),
              blocked: false,
            };
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").insert(deviceData).select().single(),
            ];
          case 1:
            (_a = _b.sent()), (device = _a.data), (error = _a.error);
            if (error) throw error;
            logger_1.logger.info("New device registered", {
              device_id: device.id,
              user_id: userId,
            });
            return [2 /*return*/, device];
          case 2:
            error_8 = _b.sent();
            logger_1.logger.error("Device registration failed", {
              error: error_8,
              userId: userId,
              deviceFingerprint: deviceFingerprint,
            });
            throw error_8;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get device registration
   */
  SessionManager.prototype.getDeviceRegistration = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .eq("device_fingerprint", deviceFingerprint)
                .eq("blocked", false)
                .single(),
            ];
          case 1:
            device = _a.sent().data;
            return [2 /*return*/, device];
          case 2:
            error_9 = _a.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update device last seen timestamp
   */
  SessionManager.prototype.updateDeviceLastSeen = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({ last_seen: new Date().toISOString() })
                .eq("id", deviceId),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            logger_1.logger.error("Failed to update device last seen", {
              error: error_10,
              deviceId: deviceId,
            });
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // SESSION POLICY ENFORCEMENT
  // ============================================================================
  /**
   * Enforce concurrent session limits
   */
  SessionManager.prototype.enforceConcurrentSessionLimits = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var policy, activeSessions, oldestSession, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getSessionPolicy(userId)];
          case 1:
            policy = _a.sent();
            return [4 /*yield*/, this.getActiveSessions(userId)];
          case 2:
            activeSessions = _a.sent();
            if (!(activeSessions.length >= policy.max_concurrent_sessions)) return [3 /*break*/, 4];
            oldestSession = activeSessions.sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            )[0];
            return [
              4 /*yield*/,
              this.terminateSession(oldestSession.id, "concurrent_limit_exceeded"),
            ];
          case 3:
            _a.sent();
            logger_1.logger.info("Terminated oldest session due to concurrent limit", {
              user_id: userId,
              terminated_session: oldestSession.id,
              limit: policy.max_concurrent_sessions,
            });
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_11 = _a.sent();
            logger_1.logger.error("Failed to enforce concurrent session limits", {
              error: error_11,
              userId: userId,
            });
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session policy for user
   */
  SessionManager.prototype.getSessionPolicy = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, policy, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase.from("users").select("role_id").eq("id", userId).single(),
            ];
          case 1:
            user = _a.sent().data;
            if (!(user === null || user === void 0 ? void 0 : user.role_id)) {
              throw new Error("User role not found");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("session_policies")
                .select("*")
                .eq("role_id", user.role_id)
                .single(),
            ];
          case 2:
            policy = _a.sent().data;
            if (!policy) {
              // Return default policy
              return [
                2 /*return*/,
                {
                  id: "default",
                  role_id: user.role_id,
                  role_name: "default",
                  max_concurrent_sessions: this.config.max_concurrent_sessions,
                  timeout_minutes: this.config.default_timeout_minutes,
                  security_level: SecurityLevel.STANDARD,
                  require_mfa: false,
                  allow_concurrent_devices: true,
                  suspicious_activity_threshold: 50,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ];
            }
            return [2 /*return*/, policy];
          case 3:
            error_12 = _a.sent();
            logger_1.logger.error("Failed to get session policy", {
              error: error_12,
              userId: userId,
            });
            throw error_12;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Calculate session expiry time based on user policy
   */
  SessionManager.prototype.calculateExpiryTime = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var policy, expiryTime, error_13, expiryTime;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getSessionPolicy(userId)];
          case 1:
            policy = _a.sent();
            expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + policy.timeout_minutes);
            return [2 /*return*/, expiryTime.toISOString()];
          case 2:
            error_13 = _a.sent();
            logger_1.logger.error("Failed to calculate expiry time", {
              error: error_13,
              userId: userId,
            });
            expiryTime = new Date();
            expiryTime.setMinutes(expiryTime.getMinutes() + 30);
            return [2 /*return*/, expiryTime.toISOString()];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // UTILITY METHODS
  // ============================================================================
  /**
   * Get active sessions for user
   */
  SessionManager.prototype.getActiveSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, sessions, error, error_14;
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
                .gt("expires_at", new Date().toISOString()),
            ];
          case 1:
            (_a = _b.sent()), (sessions = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, sessions || []];
          case 2:
            error_14 = _b.sent();
            logger_1.logger.error("Failed to get active sessions", {
              error: error_14,
              userId: userId,
            });
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get active session count
   */
  SessionManager.prototype.getActiveSessionCount = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessions;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getActiveSessions(userId)];
          case 1:
            sessions = _a.sent();
            return [2 /*return*/, sessions.length];
        }
      });
    });
  };
  /**
   * Check if location is unusual for user
   */
  SessionManager.prototype.isUnusualLocation = function (userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var recentSessions, recentIPs, error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("ip_address, location")
                .eq("user_id", userId)
                .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
                .limit(10),
            ];
          case 1:
            recentSessions = _a.sent().data;
            if (!recentSessions || recentSessions.length === 0) {
              return [2 /*return*/, false]; // No history to compare
            }
            recentIPs = recentSessions.map((s) => s.ip_address);
            return [2 /*return*/, !recentIPs.includes(ipAddress)];
          case 2:
            error_15 = _a.sent();
            logger_1.logger.error("Failed to check unusual location", {
              error: error_15,
              userId: userId,
              ipAddress: ipAddress,
            });
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if device is new for user
   */
  SessionManager.prototype.isNewDevice = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getDeviceRegistration(userId, deviceFingerprint)];
          case 1:
            device = _a.sent();
            return [2 /*return*/, !device];
          case 2:
            error_16 = _a.sent();
            logger_1.logger.error("Failed to check new device", {
              error: error_16,
              userId: userId,
              deviceFingerprint: deviceFingerprint,
            });
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for rapid login attempts
   */
  SessionManager.prototype.hasRapidLoginAttempts = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var fiveMinutesAgo, _a, recentLogins, error, error_17;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .eq("user_id", userId)
                .eq("action", SessionAction.LOGIN)
                .gte("timestamp", fiveMinutesAgo),
            ];
          case 1:
            (_a = _b.sent()), (recentLogins = _a.data), (error = _a.error);
            if (error) throw error;
            return [
              2 /*return*/,
              ((recentLogins === null || recentLogins === void 0 ? void 0 : recentLogins.length) ||
                0) > this.securityThresholds.suspicious_login_attempts,
            ];
          case 2:
            error_17 = _b.sent();
            logger_1.logger.error("Failed to check rapid login attempts", {
              error: error_17,
              userId: userId,
            });
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extend session if needed
   */
  SessionManager.prototype.extendSessionIfNeeded = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, now, expiresAt, timeUntilExpiry, fiveMinutes, newExpiryTime, error_18;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("user_id, expires_at")
                .eq("id", sessionId)
                .single(),
            ];
          case 1:
            session = _a.sent().data;
            if (!session) return [2 /*return*/];
            now = new Date();
            expiresAt = new Date(session.expires_at);
            timeUntilExpiry = expiresAt.getTime() - now.getTime();
            fiveMinutes = 5 * 60 * 1000;
            if (!(timeUntilExpiry < fiveMinutes)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.calculateExpiryTime(session.user_id)];
          case 2:
            newExpiryTime = _a.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({ expires_at: newExpiryTime })
                .eq("id", sessionId),
            ];
          case 3:
            _a.sent();
            logger_1.logger.info("Session extended", {
              session_id: sessionId,
              new_expiry: newExpiryTime,
            });
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_18 = _a.sent();
            logger_1.logger.error("Failed to extend session", {
              error: error_18,
              sessionId: sessionId,
            });
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log session action for audit trail
   */
  SessionManager.prototype.logSessionAction = function (sessionId, userId, action, details) {
    return __awaiter(this, void 0, void 0, function () {
      var auditData, error_19;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            auditData = {
              session_id: sessionId,
              user_id: userId,
              action: action,
              details: details,
              ip_address: details.ip_address || "unknown",
              user_agent: details.user_agent || "unknown",
              timestamp: new Date().toISOString(),
              success: true,
            };
            return [4 /*yield*/, this.supabase.from("session_audit_logs").insert(auditData)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_19 = _a.sent();
            logger_1.logger.error("Failed to log session action", {
              error: error_19,
              sessionId: sessionId,
              action: action,
            });
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
// ============================================================================
// SINGLETON INSTANCE
// ============================================================================
var createsessionManager = () => new SessionManager();
exports.createsessionManager = createsessionManager;
// ============================================================================
// UNIFIED SESSION SYSTEM (LEGACY COMPATIBILITY)
// ============================================================================
var UnifiedSessionSystem = /** @class */ (() => {
  function UnifiedSessionSystem() {
    this.sessionManager = sessionManager;
  }
  UnifiedSessionSystem.prototype.createSession = function (userId, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.sessionManager.createSession(userId, deviceInfo)];
      });
    });
  };
  UnifiedSessionSystem.prototype.validateSession = function (sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.sessionManager.validateSession(sessionToken)];
      });
    });
  };
  UnifiedSessionSystem.prototype.terminateSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.sessionManager.terminateSession(sessionId)];
      });
    });
  };
  return UnifiedSessionSystem;
})();
exports.UnifiedSessionSystem = UnifiedSessionSystem;
