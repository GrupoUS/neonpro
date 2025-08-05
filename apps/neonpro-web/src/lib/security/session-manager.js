"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthcareSessionManager =
  exports.sessionSchema =
  exports.MFAMethod =
  exports.SessionStatus =
  exports.UserRole =
    void 0;
var zod_1 = require("zod");
/**
 * Healthcare Session Management
 * Implements secure session handling with healthcare-specific requirements
 * - Short session timeouts for sensitive data
 * - Role-based session permissions
 * - Audit trail for all session activities
 * - Multi-factor authentication support
 */
// User roles in healthcare system
var UserRole;
(function (UserRole) {
  UserRole["ADMIN"] = "admin";
  UserRole["DOCTOR"] = "doctor";
  UserRole["NURSE"] = "nurse";
  UserRole["RECEPTIONIST"] = "receptionist";
  UserRole["PATIENT"] = "patient";
  UserRole["SYSTEM"] = "system";
})(UserRole || (exports.UserRole = UserRole = {}));
// Session status
var SessionStatus;
(function (SessionStatus) {
  SessionStatus["ACTIVE"] = "active";
  SessionStatus["EXPIRED"] = "expired";
  SessionStatus["TERMINATED"] = "terminated";
  SessionStatus["SUSPENDED"] = "suspended";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
// MFA methods
var MFAMethod;
(function (MFAMethod) {
  MFAMethod["SMS"] = "sms";
  MFAMethod["EMAIL"] = "email";
  MFAMethod["TOTP"] = "totp";
  MFAMethod["BIOMETRIC"] = "biometric";
  MFAMethod["HARDWARE_TOKEN"] = "hardware_token";
})(MFAMethod || (exports.MFAMethod = MFAMethod = {}));
// Session schema
exports.sessionSchema = zod_1.z.object({
  id: zod_1.z.string().uuid(),
  userId: zod_1.z.string().uuid(),
  userRole: zod_1.z.nativeEnum(UserRole),
  status: zod_1.z.nativeEnum(SessionStatus),
  // Security metadata
  ipAddress: zod_1.z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "IP inválido"),
  userAgent: zod_1.z.string(),
  deviceFingerprint: zod_1.z.string().optional(),
  // Session timing
  createdAt: zod_1.z.date(),
  lastAccessAt: zod_1.z.date(),
  expiresAt: zod_1.z.date(),
  timeoutWarningAt: zod_1.z.date().optional(),
  // MFA information
  mfaVerified: zod_1.z.boolean().default(false),
  mfaMethod: zod_1.z.nativeEnum(MFAMethod).optional(),
  mfaVerifiedAt: zod_1.z.date().optional(),
  // Permissions and access control
  permissions: zod_1.z.array(zod_1.z.string()),
  allowedPatients: zod_1.z.array(zod_1.z.string().uuid()).optional(), // For restricted access
  // Session metadata
  loginMethod: zod_1.z.enum(["password", "sso", "certificate", "biometric"]),
  riskScore: zod_1.z.number().min(0).max(100).default(0),
  // Tracking
  requestCount: zod_1.z.number().default(0),
  lastEndpoint: zod_1.z.string().optional(),
  createdBy: zod_1.z.string().optional(),
  terminatedBy: zod_1.z.string().optional(),
  terminationReason: zod_1.z.string().optional(),
});
var HealthcareSessionManager = /** @class */ (function () {
  function HealthcareSessionManager() {}
  /**
   * Create a new session with healthcare security requirements
   */
  HealthcareSessionManager.createSession = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var now, timeoutMinutes, expiresAt, timeoutWarningAt, riskScore, session, _a, validated;
      var _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            now = new Date();
            timeoutMinutes = this.SESSION_TIMEOUTS[params.userRole];
            expiresAt = new Date(now.getTime() + timeoutMinutes * 60 * 1000);
            timeoutWarningAt = new Date(expiresAt.getTime() - 5 * 60 * 1000); // 5 minutes before
            return [
              4 /*yield*/,
              this.calculateRiskScore({
                userRole: params.userRole,
                ipAddress: params.ipAddress,
                loginMethod: params.loginMethod,
                deviceFingerprint: params.deviceFingerprint,
              }),
            ];
          case 1:
            riskScore = _c.sent();
            _b = {
              id: crypto.randomUUID(),
              userId: params.userId,
              userRole: params.userRole,
              status: SessionStatus.ACTIVE,
              ipAddress: params.ipAddress,
              userAgent: params.userAgent,
              deviceFingerprint: params.deviceFingerprint,
              createdAt: now,
              lastAccessAt: now,
              expiresAt: expiresAt,
              timeoutWarningAt: timeoutWarningAt,
              mfaVerified: false,
            };
            _a = params.permissions;
            if (_a) return [3 /*break*/, 3];
            return [4 /*yield*/, this.getDefaultPermissions(params.userRole)];
          case 2:
            _a = _c.sent();
            _c.label = 3;
          case 3:
            session =
              ((_b.permissions = _a),
              (_b.allowedPatients = params.allowedPatients),
              (_b.loginMethod = params.loginMethod),
              (_b.riskScore = riskScore),
              (_b.requestCount = 0),
              _b);
            validated = exports.sessionSchema.parse(session);
            // Store session securely (Redis recommended for healthcare)
            return [
              4 /*yield*/,
              this.storeSession(validated),
              // Log session creation
            ];
          case 4:
            // Store session securely (Redis recommended for healthcare)
            _c.sent();
            // Log session creation
            return [
              4 /*yield*/,
              this.logSessionEvent(validated.id, "session_created", {
                userRole: params.userRole,
                riskScore: riskScore,
                loginMethod: params.loginMethod,
              }),
              // Check if MFA is required
            ];
          case 5:
            // Log session creation
            _c.sent();
            if (
              !(riskScore >= this.RISK_THRESHOLDS.MFA_REQUIRED || this.requiresMFA(params.userRole))
            )
              return [3 /*break*/, 7];
            return [4 /*yield*/, this.initiateMFA(validated.id)];
          case 6:
            _c.sent();
            _c.label = 7;
          case 7:
            return [2 /*return*/, validated];
        }
      });
    });
  };
  /**
   * Validate and refresh session
   */
  HealthcareSessionManager.validateSession = function (sessionId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var session, timeUntilTimeout, shouldWarn, extension, requiresMFA, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, { valid: false, reason: "Session not found" }];
            }
            // Check session status
            if (session.status !== SessionStatus.ACTIVE) {
              return [2 /*return*/, { valid: false, reason: "Session is ".concat(session.status) }];
            }
            if (!(new Date() > session.expiresAt)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateSession(sessionId, "expired")];
          case 2:
            _a.sent();
            return [2 /*return*/, { valid: false, reason: "Session expired" }];
          case 3:
            if (!(session.ipAddress !== ipAddress)) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.flagSuspiciousActivity(sessionId, "ip_mismatch", {
                originalIp: session.ipAddress,
                currentIp: ipAddress,
              }),
              // Don't automatically terminate - could be legitimate network change
              // But increase risk score
            ];
          case 4:
            _a.sent();
            // Don't automatically terminate - could be legitimate network change
            // But increase risk score
            session.riskScore = Math.min(100, session.riskScore + 20);
            _a.label = 5;
          case 5:
            // Update last access
            session.lastAccessAt = new Date();
            session.requestCount += 1;
            timeUntilTimeout = session.expiresAt.getTime() - Date.now();
            shouldWarn = timeUntilTimeout <= 5 * 60 * 1000; // 5 minutes
            // Extend session if user is active (healthcare workflow consideration)
            if (timeUntilTimeout <= 10 * 60 * 1000) {
              // Extend when 10 minutes left
              extension = this.SESSION_TIMEOUTS[session.userRole] * 60 * 1000;
              session.expiresAt = new Date(Date.now() + extension);
              session.timeoutWarningAt = new Date(session.expiresAt.getTime() - 5 * 60 * 1000);
            }
            return [
              4 /*yield*/,
              this.updateSession(session),
              // Check if additional security measures are needed
            ];
          case 6:
            _a.sent();
            requiresMFA =
              !session.mfaVerified &&
              (session.riskScore >= this.RISK_THRESHOLDS.MFA_REQUIRED ||
                this.requiresMFA(session.userRole));
            return [
              2 /*return*/,
              {
                valid: true,
                session: session,
                requiresMFA: requiresMFA,
              },
            ];
          case 7:
            error_1 = _a.sent();
            console.error("Session validation error:", error_1);
            return [2 /*return*/, { valid: false, reason: "Session validation failed" }];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verify MFA for session
   */
  HealthcareSessionManager.verifyMFA = function (sessionId, method, code) {
    return __awaiter(this, void 0, void 0, function () {
      var session, isValid;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, { success: false }];
            }
            return [4 /*yield*/, this.verifyMFACode(session.userId, method, code)];
          case 2:
            isValid = _a.sent();
            if (!isValid) return [3 /*break*/, 5];
            session.mfaVerified = true;
            session.mfaMethod = method;
            session.mfaVerifiedAt = new Date();
            session.riskScore = Math.max(0, session.riskScore - 30); // Reduce risk after MFA
            return [4 /*yield*/, this.updateSession(session)];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "mfa_verified", { method: method }),
            ];
          case 4:
            _a.sent();
            return [2 /*return*/, { success: true, session: session }];
          case 5:
            // Log failed MFA attempt
            return [4 /*yield*/, this.logSessionEvent(sessionId, "mfa_failed", { method: method })];
          case 6:
            // Log failed MFA attempt
            _a.sent();
            return [
              4 /*yield*/,
              this.flagSuspiciousActivity(sessionId, "mfa_failure", { method: method }),
            ];
          case 7:
            _a.sent();
            return [2 /*return*/, { success: false }];
        }
      });
    });
  };
  /**
   * Terminate session
   */
  HealthcareSessionManager.terminateSession = function (sessionId, reason, terminatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) return [2 /*return*/];
            session.status = SessionStatus.TERMINATED;
            session.terminationReason = reason;
            session.terminatedBy = terminatedBy;
            return [4 /*yield*/, this.updateSession(session)];
          case 2:
            _a.sent();
            return [4 /*yield*/, this.removeSessionFromCache(sessionId)];
          case 3:
            _a.sent();
            return [
              4 /*yield*/,
              this.logSessionEvent(sessionId, "session_terminated", {
                reason: reason,
                terminatedBy: terminatedBy,
                duration: Date.now() - session.createdAt.getTime(),
              }),
            ];
          case 4:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all active sessions for a user (for concurrent session management)
   */
  HealthcareSessionManager.getUserSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Query all active sessions for user
        return [2 /*return*/, []];
      });
    });
  };
  /**
   * Terminate all sessions for a user (security response)
   */
  HealthcareSessionManager.terminateAllUserSessions = function (userId, reason, terminatedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var sessions, _i, sessions_1, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.getUserSessions(userId)];
          case 1:
            sessions = _a.sent();
            (_i = 0), (sessions_1 = sessions);
            _a.label = 2;
          case 2:
            if (!(_i < sessions_1.length)) return [3 /*break*/, 5];
            session = sessions_1[_i];
            return [4 /*yield*/, this.terminateSession(session.id, reason, terminatedBy)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 2];
          case 5:
            return [
              4 /*yield*/,
              this.logSessionEvent("system", "all_sessions_terminated", {
                userId: userId,
                reason: reason,
                terminatedBy: terminatedBy,
                count: sessions.length,
              }),
            ];
          case 6:
            _a.sent();
            return [2 /*return*/, sessions.length];
        }
      });
    });
  };
  /**
   * Monitor for suspicious activity across all sessions
   */
  HealthcareSessionManager.monitorSuspiciousActivity = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Implement comprehensive monitoring
        return [2 /*return*/, []];
      });
    });
  };
  // Private helper methods
  HealthcareSessionManager.storeSession = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Store in Redis or secure session store
        console.log("Session stored:", session.id);
        return [2 /*return*/];
      });
    });
  };
  HealthcareSessionManager.getSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Retrieve from session store
        return [2 /*return*/, null];
      });
    });
  };
  HealthcareSessionManager.updateSession = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Update session in store
        console.log("Session updated:", session.id);
        return [2 /*return*/];
      });
    });
  };
  HealthcareSessionManager.removeSessionFromCache = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Remove from session store
        console.log("Session removed:", sessionId);
        return [2 /*return*/];
      });
    });
  };
  HealthcareSessionManager.calculateRiskScore = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore, roleRisk, methodRisk;
      var _a;
      return __generator(this, function (_b) {
        riskScore = 0;
        roleRisk =
          ((_a = {}),
          (_a[UserRole.ADMIN] = 40),
          (_a[UserRole.DOCTOR] = 20),
          (_a[UserRole.NURSE] = 15),
          (_a[UserRole.RECEPTIONIST] = 10),
          (_a[UserRole.PATIENT] = 5),
          (_a[UserRole.SYSTEM] = 0),
          _a);
        riskScore += roleRisk[params.userRole];
        methodRisk = {
          password: 20,
          sso: 10,
          certificate: 5,
          biometric: 0,
        };
        riskScore += methodRisk[params.loginMethod] || 30;
        // TODO: Add more risk factors
        // - Unusual IP address
        // - New device
        // - Time of access
        // - Location anomalies
        return [2 /*return*/, Math.min(100, riskScore)];
      });
    });
  };
  HealthcareSessionManager.getDefaultPermissions = function (role) {
    return __awaiter(this, void 0, void 0, function () {
      var permissions;
      var _a;
      return __generator(this, function (_b) {
        permissions =
          ((_a = {}),
          (_a[UserRole.ADMIN] = ["all"]),
          (_a[UserRole.DOCTOR] = [
            "read_patients",
            "write_patients",
            "read_medical_records",
            "write_medical_records",
            "prescribe",
          ]),
          (_a[UserRole.NURSE] = ["read_patients", "update_patient_vitals", "read_medical_records"]),
          (_a[UserRole.RECEPTIONIST] = [
            "read_patients",
            "create_appointments",
            "update_appointments",
            "billing",
          ]),
          (_a[UserRole.PATIENT] = ["read_own_data", "book_appointments"]),
          (_a[UserRole.SYSTEM] = ["system_operations"]),
          _a);
        return [2 /*return*/, permissions[role] || []];
      });
    });
  };
  HealthcareSessionManager.requiresMFA = function (role) {
    // Require MFA for high-privilege roles
    return [UserRole.ADMIN, UserRole.DOCTOR].includes(role);
  };
  HealthcareSessionManager.initiateMFA = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Initiate MFA process
        console.log("MFA initiated for session:", sessionId);
        return [2 /*return*/];
      });
    });
  };
  HealthcareSessionManager.verifyMFACode = function (userId, method, code) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Implement MFA verification
        return [2 /*return*/, true]; // Placeholder
      });
    });
  };
  HealthcareSessionManager.logSessionEvent = function (sessionId, event, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Log to audit system
        console.log("Session event:", { sessionId: sessionId, event: event, metadata: metadata });
        return [2 /*return*/];
      });
    });
  };
  HealthcareSessionManager.flagSuspiciousActivity = function (sessionId, type, details) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // TODO: Flag for security review
        console.log("Suspicious activity flagged:", {
          sessionId: sessionId,
          type: type,
          details: details,
        });
        return [2 /*return*/];
      });
    });
  };
  // Session timeout configurations (in minutes)
  HealthcareSessionManager.SESSION_TIMEOUTS =
    ((_a = {}),
    (_a[UserRole.ADMIN] = 30),
    (_a[UserRole.DOCTOR] = 60),
    (_a[UserRole.NURSE] = 45),
    (_a[UserRole.RECEPTIONIST] = 120),
    (_a[UserRole.PATIENT] = 30),
    (_a[UserRole.SYSTEM] =
      1440), // 24 hours for system
    _a);
  // Risk thresholds for additional security measures
  HealthcareSessionManager.RISK_THRESHOLDS = {
    MFA_REQUIRED: 30,
    SESSION_REVIEW: 50,
    AUTOMATIC_TERMINATION: 80,
  };
  return HealthcareSessionManager;
})();
exports.HealthcareSessionManager = HealthcareSessionManager;
