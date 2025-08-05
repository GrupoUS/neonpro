// Session Manager Extended Methods
// Story 1.4: Session Management & Security Implementation
// This file contains the remaining methods for SessionManagerService
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
exports.SessionManagerExtended = void 0;
var uuid_1 = require("uuid");
// Extended methods for SessionManagerService class
var SessionManagerExtended = /** @class */ (() => {
  function SessionManagerExtended(dependencies) {
    Object.assign(this, dependencies);
  }
  // Cleanup Methods
  SessionManagerExtended.prototype.cleanupExpiredSessions = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now,
        _a,
        expiredSessions,
        selectError,
        updateError,
        _i,
        expiredSessions_1,
        session,
        sessionData,
        error_1;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 8, , 9]);
            now = new Date();
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .select("id, user_id")
                .eq("is_active", true)
                .lt("expires_at", now.toISOString()),
            ];
          case 1:
            (_a = _d.sent()), (expiredSessions = _a.data), (selectError = _a.error);
            if (selectError) {
              console.error("Error selecting expired sessions:", selectError);
              return [2 /*return*/, 0];
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
                  updated_at: now.toISOString(),
                })
                .eq("is_active", true)
                .lt("expires_at", now.toISOString()),
            ];
          case 2:
            updateError = _d.sent().error;
            if (updateError) {
              console.error("Error updating expired sessions:", updateError);
              return [2 /*return*/, 0];
            }
            (_i = 0), (expiredSessions_1 = expiredSessions);
            _d.label = 3;
          case 3:
            if (!(_i < expiredSessions_1.length)) return [3 /*break*/, 7];
            session = expiredSessions_1[_i];
            return [
              4 /*yield*/,
              this.logSessionActivity(session.id, session.user_id, "session_expired", {
                cleanup_time: now,
                reason: "automatic_cleanup",
              }),
            ];
          case 4:
            _d.sent();
            return [4 /*yield*/, this.getSessionById(session.id)];
          case 5:
            sessionData = _d.sent();
            if (sessionData) {
              (_c = (_b = this.hooks).onSessionExpired) === null || _c === void 0
                ? void 0
                : _c.call(_b, sessionData);
            }
            _d.label = 6;
          case 6:
            _i++;
            return [3 /*break*/, 3];
          case 7:
            console.log("Cleaned up ".concat(expiredSessions.length, " expired sessions"));
            return [2 /*return*/, expiredSessions.length];
          case 8:
            error_1 = _d.sent();
            console.error("Error in cleanupExpiredSessions:", error_1);
            return [2 /*return*/, 0];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.cleanupOldAuditLogs = function () {
    return __awaiter(this, void 0, void 0, function () {
      var cutoffDate, _a, deletedLogs, error, deletedCount, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - this.config.retainAuditLogs);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .delete()
                .lt("timestamp", cutoffDate.toISOString())
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (deletedLogs = _a.data), (error = _a.error);
            if (error) {
              console.error("Error cleaning up audit logs:", error);
              return [2 /*return*/, 0];
            }
            deletedCount =
              (deletedLogs === null || deletedLogs === void 0 ? void 0 : deletedLogs.length) || 0;
            console.log("Cleaned up ".concat(deletedCount, " old audit logs"));
            return [2 /*return*/, deletedCount];
          case 2:
            error_2 = _b.sent();
            console.error("Error in cleanupOldAuditLogs:", error_2);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Security Methods
  SessionManagerExtended.prototype.detectSuspiciousActivity = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var suspiciousEvents, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            suspiciousEvents = [];
            _a.label = 1;
          case 1:
            _a.trys.push([1, 5, , 6]);
            // Check for unusual hours
            if (this.isUnusualHour(activity.timestamp)) {
              suspiciousEvents.push("unusual_activity");
            }
            return [4 /*yield*/, this.hasRapidRequests(session.user_id, activity.timestamp)];
          case 2:
            // Check for rapid requests
            if (_a.sent()) {
              suspiciousEvents.push("brute_force_attempt");
            }
            return [4 /*yield*/, this.hasImpossibleTravel(session, activity)];
          case 3:
            // Check for location changes
            if (_a.sent()) {
              suspiciousEvents.push("suspicious_location");
            }
            return [4 /*yield*/, this.hasDeviceAnomaly(session, activity)];
          case 4:
            // Check for device changes
            if (_a.sent()) {
              suspiciousEvents.push("suspicious_device");
            }
            // Check for privilege escalation attempts
            if (this.isPrivilegeEscalationAttempt(activity)) {
              suspiciousEvents.push("privilege_escalation_attempt");
            }
            return [2 /*return*/, suspiciousEvents];
          case 5:
            error_3 = _a.sent();
            console.error("Error detecting suspicious activity:", error_3);
            return [2 /*return*/, []];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.calculateRiskScore = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore, locationRisk, deviceRisk, activityRisk, timeRisk, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            riskScore = 0;
            _a.label = 1;
          case 1:
            _a.trys.push([1, 6, , 7]);
            // Base risk from session
            if (!session.is_trusted) riskScore += 20;
            if (session.security_level === "high") riskScore += 15;
            if (session.security_level === "critical") riskScore += 30;
            if (!session.location) return [3 /*break*/, 3];
            return [4 /*yield*/, this.calculateLocationRisk(session.location)];
          case 2:
            locationRisk = _a.sent();
            riskScore += locationRisk;
            _a.label = 3;
          case 3:
            return [4 /*yield*/, this.calculateDeviceRisk(session.device_fingerprint)];
          case 4:
            deviceRisk = _a.sent();
            riskScore += deviceRisk;
            return [4 /*yield*/, this.calculateActivityRisk(session.user_id, activity)];
          case 5:
            activityRisk = _a.sent();
            riskScore += activityRisk;
            timeRisk = this.calculateTimeRisk(activity.timestamp);
            riskScore += timeRisk;
            // Cap at 100
            return [2 /*return*/, Math.min(riskScore, 100)];
          case 6:
            error_4 = _a.sent();
            console.error("Error calculating risk score:", error_4);
            return [2 /*return*/, 50]; // Default medium risk
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.handleSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var securityEvent, error, error_5;
      var _a, _b, _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 4, , 5]);
            securityEvent = __assign({ id: (0, uuid_1.v4)(), created_at: new Date() }, event);
            return [
              4 /*yield*/,
              this.supabase.from("session_security_events").insert(securityEvent),
            ];
          case 1:
            error = _e.sent().error;
            if (error) {
              console.error("Error inserting security event:", error);
              return [2 /*return*/];
            }
            if (!(securityEvent.severity === "high" || securityEvent.severity === "critical"))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.handleHighRiskEvent(securityEvent)];
          case 2:
            _e.sent();
            _e.label = 3;
          case 3:
            // Call security hook
            if (securityEvent.severity === "high" || securityEvent.severity === "critical") {
              (_b = (_a = this.hooks).onSecurityThreat) === null || _b === void 0
                ? void 0
                : _b.call(_a, securityEvent);
            } else {
              (_d = (_c = this.hooks).onSuspiciousActivity) === null || _d === void 0
                ? void 0
                : _d.call(_c, securityEvent);
            }
            return [3 /*break*/, 5];
          case 4:
            error_5 = _e.sent();
            console.error("Error handling security event:", error_5);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Device Management Methods
  SessionManagerExtended.prototype.registerDevice = function (userId, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var existingDevice,
        _a,
        updatedDevice,
        error_7,
        trustScore,
        riskIndicators,
        deviceRegistration,
        _b,
        newDevice,
        error,
        error_6;
      var _c, _d;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 7, , 8]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .eq("device_fingerprint", deviceInfo.fingerprint)
                .single(),
            ];
          case 1:
            existingDevice = _e.sent().data;
            if (!existingDevice) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  last_seen: new Date(),
                  total_sessions: existingDevice.total_sessions + 1,
                  updated_at: new Date(),
                })
                .eq("id", existingDevice.id)
                .select()
                .single(),
            ];
          case 2:
            (_a = _e.sent()), (updatedDevice = _a.data), (error_7 = _a.error);
            if (error_7) {
              throw new Error("Failed to update device registration");
            }
            return [2 /*return*/, updatedDevice];
          case 3:
            return [4 /*yield*/, this.calculateDeviceTrustScore(deviceInfo)];
          case 4:
            trustScore = _e.sent();
            return [4 /*yield*/, this.identifyDeviceRisks(deviceInfo)];
          case 5:
            riskIndicators = _e.sent();
            deviceRegistration = {
              id: (0, uuid_1.v4)(),
              user_id: userId,
              device_fingerprint: deviceInfo.fingerprint,
              device_name: deviceInfo.name,
              device_type: deviceInfo.type,
              browser_info: deviceInfo.browser,
              os_info: deviceInfo.os,
              screen_info: deviceInfo.screen,
              timezone: deviceInfo.timezone,
              language: deviceInfo.language,
              is_trusted: trustScore > 70,
              trust_score: trustScore,
              first_seen: new Date(),
              last_seen: new Date(),
              total_sessions: 1,
              risk_indicators: riskIndicators,
              created_at: new Date(),
              updated_at: new Date(),
            };
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .insert(deviceRegistration)
                .select()
                .single(),
            ];
          case 6:
            (_b = _e.sent()), (newDevice = _b.data), (error = _b.error);
            if (error) {
              throw new Error("Failed to register device");
            }
            // Call hook
            (_d = (_c = this.hooks).onDeviceRegistered) === null || _d === void 0
              ? void 0
              : _d.call(_c, newDevice);
            return [2 /*return*/, newDevice];
          case 7:
            error_6 = _e.sent();
            console.error("Error registering device:", error_6);
            throw error_6;
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.verifyDevice = function (deviceFingerprint, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_8;
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
                .single(),
            ];
          case 1:
            device = _a.sent().data;
            if (!device) {
              return [2 /*return*/, false];
            }
            // Check if device is trusted
            return [2 /*return*/, device.is_trusted && device.trust_score > 50];
          case 2:
            error_8 = _a.sent();
            console.error("Error verifying device:", error_8);
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.trustDevice = function (deviceId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_trusted: true,
                  trust_score: Math.max(80, 0), // Set minimum trust score
                  updated_at: new Date(),
                })
                .eq("id", deviceId)
                .eq("user_id", userId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to trust device");
            }
            return [3 /*break*/, 3];
          case 2:
            error_9 = _a.sent();
            console.error("Error trusting device:", error_9);
            throw error_9;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Audit Logging
  SessionManagerExtended.prototype.logSessionActivity = function (
    sessionId,
    userId,
    action,
    details,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var auditLog, error, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            auditLog = {
              id: (0, uuid_1.v4)(),
              session_id: sessionId,
              user_id: userId,
              action: action,
              details: details,
              ip_address: details.ip_address || "unknown",
              user_agent: details.user_agent || "unknown",
              timestamp: new Date(),
              success: true,
            };
            return [4 /*yield*/, this.supabase.from("session_audit_logs").insert(auditLog)];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error logging session activity:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error in logSessionActivity:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper Methods
  SessionManagerExtended.prototype.getSessionById = function (sessionId) {
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
  SessionManagerExtended.prototype.isUnusualHour = (timestamp) => {
    var hour = timestamp.getHours();
    var businessHours = { start: 6, end: 22 };
    return hour < businessHours.start || hour > businessHours.end;
  };
  SessionManagerExtended.prototype.hasRapidRequests = function (userId, timestamp) {
    return __awaiter(this, void 0, void 0, function () {
      var oneMinuteAgo, recentLogs;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            oneMinuteAgo = new Date(timestamp.getTime() - 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("session_audit_logs")
                .select("id")
                .eq("user_id", userId)
                .gte("timestamp", oneMinuteAgo.toISOString())
                .lte("timestamp", timestamp.toISOString()),
            ];
          case 1:
            recentLogs = _a.sent().data;
            return [
              2 /*return*/,
              ((recentLogs === null || recentLogs === void 0 ? void 0 : recentLogs.length) || 0) >
                60,
            ]; // More than 60 requests per minute
        }
      });
    });
  };
  SessionManagerExtended.prototype.hasImpossibleTravel = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Check if user has traveled impossibly fast between locations
        // This would require comparing current location with previous session location
        // For now, return false (implementation would need geolocation calculation)
        return [2 /*return*/, false];
      });
    });
  };
  SessionManagerExtended.prototype.hasDeviceAnomaly = function (session, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Check for device fingerprint changes or suspicious device characteristics
        // For now, return false (implementation would need device analysis)
        return [2 /*return*/, false];
      });
    });
  };
  SessionManagerExtended.prototype.isPrivilegeEscalationAttempt = (activity) => {
    // Check if user is trying to access resources above their permission level
    return (
      activity.attempted_permissions &&
      activity.attempted_permissions.some(
        (perm) => perm.includes("admin") || perm.includes("owner"),
      )
    );
  };
  SessionManagerExtended.prototype.calculateLocationRisk = function (location) {
    return __awaiter(this, void 0, void 0, function () {
      var risk, highRiskCountries;
      return __generator(this, (_a) => {
        risk = 0;
        highRiskCountries = ["CN", "RU", "KP", "IR"];
        if (highRiskCountries.includes(location.country)) {
          risk += 30;
        }
        return [2 /*return*/, risk];
      });
    });
  };
  SessionManagerExtended.prototype.calculateDeviceRisk = function (deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var device;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("trust_score, risk_indicators")
                .eq("device_fingerprint", deviceFingerprint)
                .single(),
            ];
          case 1:
            device = _a.sent().data;
            if (!device) {
              return [2 /*return*/, 40]; // Unknown device = medium risk
            }
            return [2 /*return*/, Math.max(0, 100 - device.trust_score)];
        }
      });
    });
  };
  SessionManagerExtended.prototype.calculateActivityRisk = function (userId, activity) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Calculate risk based on user's activity patterns
        // For now, return low risk
        return [2 /*return*/, 5];
      });
    });
  };
  SessionManagerExtended.prototype.calculateTimeRisk = (timestamp) => {
    var hour = timestamp.getHours();
    // Higher risk during unusual hours
    if (hour >= 0 && hour <= 5) return 15; // Late night
    if (hour >= 22 && hour <= 23) return 10; // Late evening
    return 0; // Normal hours
  };
  SessionManagerExtended.prototype.calculateDeviceTrustScore = function (deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var score, trustedBrowsers, trustedOS;
      return __generator(this, (_a) => {
        score = 50;
        trustedBrowsers = ["Chrome", "Firefox", "Safari", "Edge"];
        if (trustedBrowsers.includes(deviceInfo.browser.name)) {
          score += 20;
        }
        trustedOS = ["Windows", "macOS", "iOS", "Android"];
        if (trustedOS.includes(deviceInfo.os.name)) {
          score += 15;
        }
        return [2 /*return*/, Math.min(score, 100)];
      });
    });
  };
  SessionManagerExtended.prototype.identifyDeviceRisks = function (deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var risks;
      return __generator(this, (_a) => {
        risks = [];
        // Check for suspicious characteristics
        if (deviceInfo.browser.name === "Unknown") {
          risks.push("unknown_browser");
        }
        if (deviceInfo.os.name === "Unknown") {
          risks.push("unknown_os");
        }
        if (deviceInfo.screen.width < 800 || deviceInfo.screen.height < 600) {
          risks.push("unusual_screen_size");
        }
        return [2 /*return*/, risks];
      });
    });
  };
  SessionManagerExtended.prototype.handleHighRiskEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!(event.severity === "critical")) return [3 /*break*/, 4];
            if (!event.session_id) return [3 /*break*/, 2];
            return [4 /*yield*/, this.terminateSession(event.session_id, "security_violation")];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            // Block user temporarily
            return [4 /*yield*/, this.temporarilyBlockUser(event.user_id, 30)];
          case 3:
            // Block user temporarily
            _a.sent(); // 30 minutes
            _a.label = 4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionManagerExtended.prototype.temporarilyBlockUser = function (userId, minutes) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Implementation would add user to temporary block list
        console.log(
          "User ".concat(userId, " temporarily blocked for ").concat(minutes, " minutes"),
        );
        return [2 /*return*/];
      });
    });
  };
  SessionManagerExtended.prototype.terminateSession = function (sessionId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // This method should be available from the main class
        // Implementation would terminate the session
        console.log("Session ".concat(sessionId, " terminated: ").concat(reason));
        return [2 /*return*/];
      });
    });
  };
  return SessionManagerExtended;
})();
exports.SessionManagerExtended = SessionManagerExtended;
