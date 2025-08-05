// Session Manager Service
// Story 1.4: Session Management & Security Implementation
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.SessionManagerService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var uuid_1 = require("uuid");
var config_1 = require("./config");
var security_monitor_1 = require("./security-monitor");
var device_fingerprint_1 = require("./device-fingerprint");
var location_service_1 = require("./location-service");
var SessionManagerService = /** @class */ (() => {
  function SessionManagerService(hooks) {
    if (hooks === void 0) {
      hooks = {};
    }
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    this.config = (0, config_1.getSessionConfig)();
    this.securityMonitor = new security_monitor_1.SecurityMonitor();
    this.deviceFingerprint = new device_fingerprint_1.DeviceFingerprint();
    this.locationService = new location_service_1.LocationService();
    this.hooks = hooks;
    // Start cleanup interval
    this.startCleanupInterval();
  }
  // Core Session Management
  SessionManagerService.prototype.createSession = function (userId, deviceInfo, loginMethod) {
    return __awaiter(this, void 0, void 0, function () {
      var device,
        location_1,
        securityLevel,
        sessionToken,
        refreshToken,
        accessToken,
        session,
        _a,
        sessionData,
        error,
        createdSession,
        error_1;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 8, , 9]);
            // Check concurrent session limits
            return [4 /*yield*/, this.enforceSessionLimits(userId)];
          case 1:
            // Check concurrent session limits
            _d.sent();
            return [4 /*yield*/, this.registerDevice(userId, deviceInfo)];
          case 2:
            device = _d.sent();
            return [4 /*yield*/, this.locationService.getLocationInfo(deviceInfo.userAgent)];
          case 3:
            location_1 = _d.sent();
            return [4 /*yield*/, this.calculateSecurityLevel(userId, device, location_1)];
          case 4:
            securityLevel = _d.sent();
            sessionToken = this.generateSecureToken();
            refreshToken = this.generateSecureToken();
            accessToken = this.generateSecureToken();
            session = {
              id: (0, uuid_1.v4)(),
              user_id: userId,
              device_id: device.id,
              device_fingerprint: deviceInfo.fingerprint,
              device_name: deviceInfo.name,
              device_type: deviceInfo.type,
              browser_name: deviceInfo.browser.name,
              browser_version: deviceInfo.browser.version,
              os_name: deviceInfo.os.name,
              os_version: deviceInfo.os.version,
              ip_address: location_1.ip,
              location: {
                country: location_1.country,
                region: location_1.region,
                city: location_1.city,
                timezone: location_1.timezone,
              },
              session_token: sessionToken,
              refresh_token: refreshToken,
              access_token: accessToken,
              expires_at: new Date(Date.now() + this.config.defaultSessionDuration * 60 * 1000),
              last_activity: new Date(),
              created_at: new Date(),
              updated_at: new Date(),
              is_active: true,
              is_trusted: device.is_trusted,
              login_method: login_method,
              security_level: securityLevel,
              session_data: {},
            };
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").insert(session).select().single(),
            ];
          case 5:
            (_a = _d.sent()), (sessionData = _a.data), (error = _a.error);
            if (error) {
              throw new SessionError(
                "Failed to create session",
                "SYSTEM_ERROR",
                session.id,
                userId,
              );
            }
            createdSession = sessionData;
            // Log session creation
            return [
              4 /*yield*/,
              this.logSessionActivity(createdSession.id, userId, "session_created", {
                device_info: deviceInfo,
                location_info: location_1,
                security_level: securityLevel,
              }),
            ];
          case 6:
            // Log session creation
            _d.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.handleSecurityEvent({
                session_id: createdSession.id,
                user_id: userId,
                event_type: "login_success",
                event_category: "authentication",
                severity: "low",
                description: "Successful login from ".concat(deviceInfo.name),
                metadata: { device_info: deviceInfo, location_info: location_1 },
                ip_address: location_1.ip,
                user_agent: deviceInfo.userAgent,
                device_fingerprint: deviceInfo.fingerprint,
                location: {
                  country: location_1.country,
                  region: location_1.region,
                  city: location_1.city,
                },
                risk_score: 0,
                is_blocked: false,
                resolution_status: "resolved",
              }),
            ];
          case 7:
            // Log security event
            _d.sent();
            // Call hook
            (_c = (_b = this.hooks).onSessionCreated) === null || _c === void 0
              ? void 0
              : _c.call(_b, createdSession);
            return [2 /*return*/, createdSession];
          case 8:
            error_1 = _d.sent();
            console.error("Error creating session:", error_1);
            throw error_1;
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.refreshSession = function (sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var session,
        newAccessToken,
        newRefreshToken,
        _a,
        updatedSession,
        error,
        refreshedSession,
        error_2;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.validateSession(sessionToken)];
          case 1:
            session = _d.sent();
            if (!session) {
              throw new SessionError("Session not found", "SESSION_NOT_FOUND");
            }
            if (!(new Date() > session.expires_at)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateSession(session.id, "expired")];
          case 2:
            _d.sent();
            throw new SessionError(
              "Session expired",
              "SESSION_EXPIRED",
              session.id,
              session.user_id,
            );
          case 3:
            newAccessToken = this.generateSecureToken();
            newRefreshToken = this.generateSecureToken();
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  access_token: newAccessToken,
                  refresh_token: newRefreshToken,
                  last_activity: new Date(),
                  updated_at: new Date(),
                })
                .eq("id", session.id)
                .select()
                .single(),
            ];
          case 4:
            (_a = _d.sent()), (updatedSession = _a.data), (error = _a.error);
            if (error) {
              throw new SessionError(
                "Failed to refresh session",
                "SYSTEM_ERROR",
                session.id,
                session.user_id,
              );
            }
            refreshedSession = updatedSession;
            // Log activity
            return [
              4 /*yield*/,
              this.logSessionActivity(session.id, session.user_id, "session_refreshed", {
                new_access_token: newAccessToken.substring(0, 10) + "...",
              }),
            ];
          case 5:
            // Log activity
            _d.sent();
            // Call hook
            (_c = (_b = this.hooks).onSessionRefreshed) === null || _c === void 0
              ? void 0
              : _c.call(_b, refreshedSession);
            return [2 /*return*/, refreshedSession];
          case 6:
            error_2 = _d.sent();
            console.error("Error refreshing session:", error_2);
            throw error_2;
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.extendSession = function (sessionId, duration) {
    return __awaiter(this, void 0, void 0, function () {
      var session,
        userRole,
        policy,
        extensionDuration,
        maxDuration,
        newExpiryTime,
        _a,
        extendedSession,
        error,
        error_3;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getSessionById(sessionId)];
          case 1:
            session = _d.sent();
            if (!session) {
              throw new SessionError("Session not found", "SESSION_NOT_FOUND", sessionId);
            }
            return [4 /*yield*/, this.getUserRole(session.user_id)];
          case 2:
            userRole = _d.sent();
            policy = (0, config_1.getSessionPolicyForRole)(userRole);
            // Check if extension is allowed
            if (
              !((_b = policy.settings) === null || _b === void 0
                ? void 0
                : _b.session_extension_allowed)
            ) {
              throw new SessionError(
                "Session extension not allowed",
                "INSUFFICIENT_PERMISSIONS",
                sessionId,
                session.user_id,
              );
            }
            extensionDuration = duration || this.config.defaultSessionDuration;
            maxDuration =
              ((_c = policy.settings) === null || _c === void 0
                ? void 0
                : _c.max_session_duration) || this.config.maxSessionDuration;
            newExpiryTime = new Date(
              Date.now() + Math.min(extensionDuration, maxDuration) * 60 * 1000,
            );
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  expires_at: newExpiryTime,
                  updated_at: new Date(),
                })
                .eq("id", sessionId)
                .select()
                .single(),
            ];
          case 3:
            (_a = _d.sent()), (extendedSession = _a.data), (error = _a.error);
            if (error) {
              throw new SessionError(
                "Failed to extend session",
                "SYSTEM_ERROR",
                sessionId,
                session.user_id,
              );
            }
            // Log activity
            return [
              4 /*yield*/,
              this.logSessionActivity(sessionId, session.user_id, "session_extended", {
                extension_duration: extensionDuration,
                new_expiry: newExpiryTime,
              }),
            ];
          case 4:
            // Log activity
            _d.sent();
            return [2 /*return*/, extendedSession];
          case 5:
            error_3 = _d.sent();
            console.error("Error extending session:", error_3);
            throw error_3;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.terminateSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var session, error, error_4;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getSessionById(sessionId)];
          case 1:
            session = _c.sent();
            if (!session) {
              return [2 /*return*/]; // Session already terminated or doesn't exist
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  updated_at: new Date(),
                })
                .eq("id", sessionId),
            ];
          case 2:
            error = _c.sent().error;
            if (error) {
              throw new SessionError(
                "Failed to terminate session",
                "SYSTEM_ERROR",
                sessionId,
                session.user_id,
              );
            }
            // Log activity
            return [
              4 /*yield*/,
              this.logSessionActivity(sessionId, session.user_id, "session_terminated", {
                reason: reason || "manual",
                terminated_at: new Date(),
              }),
            ];
          case 3:
            // Log activity
            _c.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.handleSecurityEvent({
                session_id: sessionId,
                user_id: session.user_id,
                event_type: "session_terminated",
                event_category: "session",
                severity: "low",
                description: "Session terminated: ".concat(reason || "manual"),
                metadata: { reason: reason, terminated_at: new Date() },
                ip_address: session.ip_address,
                user_agent: "".concat(session.browser_name, " ").concat(session.browser_version),
                device_fingerprint: session.device_fingerprint,
                risk_score: 0,
                is_blocked: false,
                resolution_status: "resolved",
              }),
            ];
          case 4:
            // Log security event
            _c.sent();
            // Call hook
            (_b = (_a = this.hooks).onSessionTerminated) === null || _b === void 0
              ? void 0
              : _b.call(_a, session, reason);
            return [3 /*break*/, 6];
          case 5:
            error_4 = _c.sent();
            console.error("Error terminating session:", error_4);
            throw error_4;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.terminateAllSessions = function (userId, exceptSessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            query = this.supabase
              .from("user_sessions")
              .update({ is_active: false, updated_at: new Date() })
              .eq("user_id", userId)
              .eq("is_active", true);
            if (exceptSessionId) {
              query = query.neq("id", exceptSessionId);
            }
            return [4 /*yield*/, query];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new SessionError(
                "Failed to terminate sessions",
                "SYSTEM_ERROR",
                undefined,
                userId,
              );
            }
            // Log activity
            return [
              4 /*yield*/,
              this.logSessionActivity("bulk", userId, "session_terminated", {
                reason: "terminate_all",
                except_session: exceptSessionId,
                terminated_at: new Date(),
              }),
            ];
          case 2:
            // Log activity
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            console.error("Error terminating all sessions:", error_5);
            throw error_5;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Session Validation
  SessionManagerService.prototype.validateSession = function (sessionToken) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, session, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("*")
                .eq("session_token", sessionToken)
                .eq("is_active", true)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (session = _a.data), (error = _a.error);
            if (error || !session) {
              return [2 /*return*/, null];
            }
            if (!(new Date() > new Date(session.expires_at))) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateSession(session.id, "expired")];
          case 2:
            _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/, session];
          case 4:
            error_6 = _b.sent();
            console.error("Error validating session:", error_6);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.checkSessionActivity = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, idleTime, idleTimeoutMs, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getSessionById(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || !session.is_active) {
              return [2 /*return*/, false];
            }
            idleTime = Date.now() - new Date(session.last_activity).getTime();
            idleTimeoutMs = this.config.idleTimeout * 60 * 1000;
            if (!(idleTime > idleTimeoutMs)) return [3 /*break*/, 3];
            return [4 /*yield*/, this.terminateSession(sessionId, "idle_timeout")];
          case 2:
            _a.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/, true];
          case 4:
            error_7 = _a.sent();
            console.error("Error checking session activity:", error_7);
            return [2 /*return*/, false];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.updateLastActivity = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  last_activity: new Date(),
                  updated_at: new Date(),
                })
                .eq("id", sessionId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error updating last activity:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error updating last activity:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  SessionManagerService.prototype.getSessionById = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase.from("user_sessions").select("*").eq("id", sessionId).single(),
            ];
          case 1:
            session = _a.sent().data;
            return [2 /*return*/, session];
        }
      });
    });
  };
  SessionManagerService.prototype.getUserRole = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This would typically fetch from user_roles table
        // For now, return default role
        return [2 /*return*/, "staff"];
      });
    });
  };
  SessionManagerService.prototype.generateSecureToken = () =>
    (0, uuid_1.v4)() +
    "-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).substring(2);
  SessionManagerService.prototype.enforceSessionLimits = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var activeSessions, oldestSession;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("id")
                .eq("user_id", userId)
                .eq("is_active", true),
            ];
          case 1:
            activeSessions = _a.sent().data;
            if (!(activeSessions && activeSessions.length >= this.config.maxConcurrentSessions))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("id")
                .eq("user_id", userId)
                .eq("is_active", true)
                .order("created_at", { ascending: true })
                .limit(1)
                .single(),
            ];
          case 2:
            oldestSession = _a.sent().data;
            if (!oldestSession) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.terminateSession(oldestSession.id, "concurrent_limit_exceeded"),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerService.prototype.calculateSecurityLevel = function (userId, device, location) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore;
      return __generator(this, (_a) => {
        riskScore = 0;
        // Device trust factor
        if (!device.is_trusted) riskScore += 30;
        if (device.risk_indicators.length > 0) riskScore += 20;
        // Location risk factor
        if ((0, config_1.isHighRiskLocation)(location.country)) riskScore += 40;
        if (location.isVPN || location.isProxy) riskScore += 20;
        // Determine security level based on risk score
        if (riskScore >= 70) return [2 /*return*/, "critical"];
        if (riskScore >= 50) return [2 /*return*/, "high"];
        if (riskScore >= 30) return [2 /*return*/, "medium"];
        return [2 /*return*/, "low"];
      });
    });
  };
  SessionManagerService.prototype.startCleanupInterval = function () {
    this.cleanupInterval = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var error_9;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, this.cleanupExpiredSessions()];
              case 1:
                _a.sent();
                return [4 /*yield*/, this.cleanupOldAuditLogs()];
              case 2:
                _a.sent();
                return [3 /*break*/, 4];
              case 3:
                error_9 = _a.sent();
                console.error("Error in cleanup interval:", error_9);
                return [3 /*break*/, 4];
              case 4:
                return [2 /*return*/];
            }
          });
        }),
      this.config.cleanupInterval * 60 * 1000,
    );
  };
  // Cleanup methods will be implemented in the next chunk
  SessionManagerService.prototype.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, 0];
      });
    });
  };
  SessionManagerService.prototype.cleanupOldAuditLogs = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, 0];
      });
    });
  };
  // Security methods will be implemented in the next chunk
  SessionManagerService.prototype.detectSuspiciousActivity = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, []];
      });
    });
  };
  SessionManagerService.prototype.calculateRiskScore = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, 0];
      });
    });
  };
  SessionManagerService.prototype.handleSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SessionManagerService.prototype.registerDevice = function (userId, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, {}];
      });
    });
  };
  SessionManagerService.prototype.verifyDevice = function (deviceFingerprint, userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation will be added
        return [2 /*return*/, true];
      });
    });
  };
  SessionManagerService.prototype.trustDevice = function (deviceId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  SessionManagerService.prototype.logSessionActivity = function (
    sessionId,
    userId,
    action,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => [2 /*return*/]);
    });
  };
  return SessionManagerService;
})();
exports.SessionManagerService = SessionManagerService;
// Custom error class
var SessionError = /** @class */ ((_super) => {
  __extends(SessionError, _super);
  function SessionError(message, code, sessionId, userId, details) {
    var _this = _super.call(this, message) || this;
    _this.code = code;
    _this.sessionId = sessionId;
    _this.userId = userId;
    _this.details = details;
    _this.name = "SessionError";
    return _this;
  }
  return SessionError;
})(Error);
