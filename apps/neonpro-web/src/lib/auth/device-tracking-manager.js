"use strict";
/**
 * Device Tracking Manager
 * Story 1.4 - Task 3: Device-based session tracking and management
 *
 * Features:
 * - Device fingerprinting and identification
 * - Device registration and verification
 * - Trusted device management
 * - Device-based security policies
 * - Device activity monitoring
 * - Suspicious device detection
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
exports.DeviceTrackingManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var security_audit_logger_1 = require("./security-audit-logger");
var DEFAULT_DEVICE_POLICIES = {
  owner: {
    role: "owner",
    requireVerification: true,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: true,
    riskThreshold: 0.7,
    notifyOnNewDevice: true,
    deviceRetentionDays: 365,
  },
  manager: {
    role: "manager",
    requireVerification: true,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: true,
    riskThreshold: 0.6,
    notifyOnNewDevice: true,
    deviceRetentionDays: 180,
  },
  staff: {
    role: "staff",
    requireVerification: false,
    autoTrustAfterVerification: true,
    maxUnverifiedSessions: 2,
    blockSuspiciousDevices: true,
    riskThreshold: 0.5,
    notifyOnNewDevice: false,
    deviceRetentionDays: 90,
  },
  patient: {
    role: "patient",
    requireVerification: false,
    autoTrustAfterVerification: false,
    maxUnverifiedSessions: 1,
    blockSuspiciousDevices: false,
    riskThreshold: 0.8,
    notifyOnNewDevice: false,
    deviceRetentionDays: 30,
  },
};
var DeviceTrackingManager = /** @class */ (function () {
  function DeviceTrackingManager(supabaseUrl, supabaseKey, customPolicies) {
    this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    this.auditLogger = new security_audit_logger_1.SecurityAuditLogger(supabaseUrl, supabaseKey);
    this.devicePolicies = __assign(__assign({}, DEFAULT_DEVICE_POLICIES), customPolicies);
    // Start cleanup interval (daily)
    this.startCleanupInterval();
  }
  /**
   * Generate device fingerprint from browser/client information
   */
  DeviceTrackingManager.prototype.generateDeviceFingerprint = function (clientInfo) {
    return {
      userAgent: clientInfo.userAgent,
      screenResolution: "".concat(clientInfo.screenWidth, "x").concat(clientInfo.screenHeight),
      timezone: clientInfo.timezone,
      language: clientInfo.language,
      platform: clientInfo.platform,
      cookieEnabled: clientInfo.cookieEnabled,
      doNotTrack: clientInfo.doNotTrack,
      plugins: clientInfo.plugins || [],
      canvas: clientInfo.canvas,
      webgl: clientInfo.webgl,
      fonts: clientInfo.fonts,
      audioContext: clientInfo.audioContext,
    };
  };
  /**
   * Generate unique device ID from fingerprint
   */
  DeviceTrackingManager.prototype.generateDeviceId = function (fingerprint) {
    var fingerprintString = JSON.stringify({
      userAgent: fingerprint.userAgent,
      screenResolution: fingerprint.screenResolution,
      timezone: fingerprint.timezone,
      platform: fingerprint.platform,
      canvas: fingerprint.canvas,
      webgl: fingerprint.webgl,
    });
    // Simple hash function (in production, use a proper crypto hash)
    var hash = 0;
    for (var i = 0; i < fingerprintString.length; i++) {
      var char = fingerprintString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return "dev_".concat(Math.abs(hash).toString(36), "_").concat(Date.now().toString(36));
  };
  /**
   * Register or update device information
   */
  DeviceTrackingManager.prototype.registerDevice = function (
    userId,
    userRole,
    fingerprint,
    deviceInfo,
    metadata,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceId,
        now,
        existingDevice,
        isNewDevice,
        deviceType,
        riskFactors,
        riskScore,
        policy,
        requiresVerification,
        isBlocked,
        error,
        error,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 10, , 11]);
            deviceId = this.generateDeviceId(fingerprint);
            now = new Date();
            return [4 /*yield*/, this.getDeviceInfo(deviceId)];
          case 1:
            existingDevice = _a.sent();
            isNewDevice = !existingDevice;
            deviceType = this.detectDeviceType(fingerprint.userAgent);
            return [
              4 /*yield*/,
              this.assessDeviceRisk(
                userId,
                deviceId,
                fingerprint,
                deviceInfo.ipAddress,
                deviceInfo.location,
                isNewDevice,
              ),
            ];
          case 2:
            riskFactors = _a.sent();
            riskScore = this.calculateRiskScore(riskFactors);
            policy = this.devicePolicies[userRole];
            requiresVerification =
              isNewDevice &&
              (policy.requireVerification ||
                riskScore >= policy.riskThreshold ||
                (policy.blockSuspiciousDevices && riskScore > 0.8));
            isBlocked = policy.blockSuspiciousDevices && riskScore >= 0.9;
            if (!isNewDevice) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").insert({
                device_id: deviceId,
                user_id: userId,
                device_name: deviceInfo.deviceName || this.generateDeviceName(fingerprint),
                device_type: deviceType,
                fingerprint: fingerprint,
                ip_address: deviceInfo.ipAddress,
                location: deviceInfo.location,
                is_trusted: !requiresVerification && policy.autoTrustAfterVerification,
                is_blocked: isBlocked,
                first_seen: now.toISOString(),
                last_seen: now.toISOString(),
                session_count: 1,
                risk_score: riskScore,
                metadata: __assign(__assign({}, metadata), {
                  riskFactors: riskFactors,
                  userRole: userRole,
                  registrationPolicy: policy,
                }),
              }),
            ];
          case 3:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to register device: ".concat(error.message));
            }
            // Log device registration
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_registered",
                userId: userId,
                deviceId: deviceId,
                ipAddress: deviceInfo.ipAddress,
                userAgent: fingerprint.userAgent,
                metadata: {
                  deviceType: deviceType,
                  riskScore: riskScore,
                  riskFactors: riskFactors,
                  requiresVerification: requiresVerification,
                  isBlocked: isBlocked,
                  location: deviceInfo.location,
                },
              }),
            ];
          case 4:
            // Log device registration
            _a.sent();
            if (!(policy.notifyOnNewDevice && !isBlocked)) return [3 /*break*/, 6];
            return [4 /*yield*/, this.notifyNewDevice(userId, deviceId, deviceInfo)];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            return [3 /*break*/, 9];
          case 7:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  last_seen: now.toISOString(),
                  session_count:
                    ((existingDevice === null || existingDevice === void 0
                      ? void 0
                      : existingDevice.sessionCount) || 0) + 1,
                  risk_score: riskScore,
                  ip_address: deviceInfo.ipAddress,
                  location: deviceInfo.location,
                  metadata: __assign(
                    __assign(
                      __assign(
                        {},
                        existingDevice === null || existingDevice === void 0
                          ? void 0
                          : existingDevice.metadata,
                      ),
                      metadata,
                    ),
                    { lastRiskFactors: riskFactors, lastUpdate: now.toISOString() },
                  ),
                })
                .eq("device_id", deviceId),
            ];
          case 8:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to update device: ".concat(error.message));
            }
            _a.label = 9;
          case 9:
            return [
              2 /*return*/,
              {
                deviceId: deviceId,
                isNewDevice: isNewDevice,
                requiresVerification: requiresVerification && !isBlocked,
              },
            ];
          case 10:
            error_1 = _a.sent();
            console.error("Failed to register device:", error_1);
            throw error_1;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get device information
   */
  DeviceTrackingManager.prototype.getDeviceInfo = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("device_id", deviceId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              if (error.code === "PGRST116") {
                return [2 /*return*/, null]; // Device not found
              }
              throw new Error("Failed to get device info: ".concat(error.message));
            }
            return [2 /*return*/, this.mapDatabaseToDeviceInfo(data)];
          case 2:
            error_2 = _b.sent();
            console.error("Failed to get device info:", error_2);
            throw error_2;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get all devices for a user
   */
  DeviceTrackingManager.prototype.getUserDevices = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .order("last_seen", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to get user devices: ".concat(error.message));
            }
            return [2 /*return*/, (data || []).map(this.mapDatabaseToDeviceInfo)];
          case 2:
            error_3 = _b.sent();
            console.error("Failed to get user devices:", error_3);
            throw error_3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Trust a device
   */
  DeviceTrackingManager.prototype.trustDevice = function (deviceId, trustedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getDeviceInfo(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) {
              throw new Error("Device not found");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_trusted: true,
                  trusted_at: new Date().toISOString(),
                  trusted_by: trustedBy,
                })
                .eq("device_id", deviceId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to trust device: ".concat(error.message));
            }
            // Log device trust event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_trusted",
                userId: device.userId,
                deviceId: deviceId,
                ipAddress: device.ipAddress,
                metadata: {
                  trustedBy: trustedBy,
                  deviceName: device.deviceName,
                  previousRiskScore: device.riskScore,
                },
              }),
            ];
          case 3:
            // Log device trust event
            _a.sent();
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            console.error("Failed to trust device:", error_4);
            throw error_4;
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block a device
   */
  DeviceTrackingManager.prototype.blockDevice = function (deviceId, reason, blockedBy) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getDeviceInfo(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) {
              throw new Error("Device not found");
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_blocked: true,
                  blocked_at: new Date().toISOString(),
                  blocked_by: blockedBy,
                  block_reason: reason,
                })
                .eq("device_id", deviceId),
            ];
          case 2:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to block device: ".concat(error.message));
            }
            // Log device block event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_blocked",
                userId: device.userId,
                deviceId: deviceId,
                ipAddress: device.ipAddress,
                metadata: {
                  reason: reason,
                  blockedBy: blockedBy,
                  deviceName: device.deviceName,
                  riskScore: device.riskScore,
                },
              }),
            ];
          case 3:
            // Log device block event
            _a.sent();
            // Terminate all active sessions for this device
            return [
              4 /*yield*/,
              this.terminateDeviceSessions(deviceId, {
                type: "security_violation",
                message: "Device blocked: ".concat(reason),
              }),
            ];
          case 4:
            // Terminate all active sessions for this device
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_5 = _a.sent();
            console.error("Failed to block device:", error_5);
            throw error_5;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create device verification challenge
   */
  DeviceTrackingManager.prototype.createVerificationChallenge = function (
    deviceId,
    userId,
    challengeType,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var challengeId, code, expiresAt, error, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            challengeId = "challenge_"
              .concat(Date.now(), "_")
              .concat(Math.random().toString(36).substr(2, 9));
            code = this.generateVerificationCode(challengeType);
            expiresAt = new Date(Date.now() + 15 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase.from("device_verification_challenges").insert({
                challenge_id: challengeId,
                device_id: deviceId,
                user_id: userId,
                challenge_type: challengeType,
                code: code,
                expires_at: expiresAt.toISOString(),
                attempts: 0,
                max_attempts: 3,
                is_completed: false,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new Error("Failed to create verification challenge: ".concat(error.message));
            }
            // Send verification code (implementation depends on challenge type)
            return [4 /*yield*/, this.sendVerificationCode(userId, challengeType, code)];
          case 2:
            // Send verification code (implementation depends on challenge type)
            _a.sent();
            return [2 /*return*/, challengeId];
          case 3:
            error_6 = _a.sent();
            console.error("Failed to create verification challenge:", error_6);
            throw error_6;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Verify device challenge
   */
  DeviceTrackingManager.prototype.verifyDeviceChallenge = function (challengeId, code) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, challenge, selectError, isValidCode, newAttempts, device, userRole, policy, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 12, , 13]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verification_challenges")
                .select("*")
                .eq("challenge_id", challengeId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (challenge = _a.data), (selectError = _a.error);
            if (selectError || !challenge) {
              return [2 /*return*/, { success: false }];
            }
            // Check if challenge is expired or completed
            if (new Date() > new Date(challenge.expires_at) || challenge.is_completed) {
              return [2 /*return*/, { success: false }];
            }
            // Check if max attempts exceeded
            if (challenge.attempts >= challenge.max_attempts) {
              return [2 /*return*/, { success: false, attemptsRemaining: 0 }];
            }
            isValidCode = challenge.code === code;
            newAttempts = challenge.attempts + 1;
            if (!isValidCode) return [3 /*break*/, 8];
            // Mark challenge as completed
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verification_challenges")
                .update({
                  is_completed: true,
                  completed_at: new Date().toISOString(),
                  attempts: newAttempts,
                })
                .eq("challenge_id", challengeId),
            ];
          case 2:
            // Mark challenge as completed
            _b.sent();
            return [4 /*yield*/, this.getDeviceInfo(challenge.device_id)];
          case 3:
            device = _b.sent();
            if (!device) return [3 /*break*/, 6];
            return [4 /*yield*/, this.getUserRole(device.userId)];
          case 4:
            userRole = _b.sent();
            policy = this.devicePolicies[userRole];
            if (!policy.autoTrustAfterVerification) return [3 /*break*/, 6];
            return [4 /*yield*/, this.trustDevice(challenge.device_id, "system_verification")];
          case 5:
            _b.sent();
            _b.label = 6;
          case 6:
            // Log successful verification
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_verification_success",
                userId: challenge.user_id,
                deviceId: challenge.device_id,
                metadata: {
                  challengeType: challenge.challenge_type,
                  attempts: newAttempts,
                },
              }),
            ];
          case 7:
            // Log successful verification
            _b.sent();
            return [2 /*return*/, { success: true, deviceId: challenge.device_id }];
          case 8:
            // Update attempt count
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verification_challenges")
                .update({ attempts: newAttempts })
                .eq("challenge_id", challengeId),
            ];
          case 9:
            // Update attempt count
            _b.sent();
            // Log failed verification
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_verification_failed",
                userId: challenge.user_id,
                deviceId: challenge.device_id,
                metadata: {
                  challengeType: challenge.challenge_type,
                  attempts: newAttempts,
                  maxAttempts: challenge.max_attempts,
                },
              }),
            ];
          case 10:
            // Log failed verification
            _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                attemptsRemaining: challenge.max_attempts - newAttempts,
              },
            ];
          case 11:
            return [3 /*break*/, 13];
          case 12:
            error_7 = _b.sent();
            console.error("Failed to verify device challenge:", error_7);
            throw error_7;
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up old devices and challenges
   */
  DeviceTrackingManager.prototype.cleanupOldDevices = function () {
    return __awaiter(this, void 0, void 0, function () {
      var devicesRemoved,
        challengesRemoved,
        _i,
        _a,
        _b,
        role,
        policy,
        retentionDate,
        _c,
        oldDevices,
        selectError,
        deleteError,
        _d,
        expiredChallenges,
        challengeSelectError,
        challengeDeleteError,
        error_8;
      return __generator(this, function (_e) {
        switch (_e.label) {
          case 0:
            _e.trys.push([0, 10, , 11]);
            devicesRemoved = 0;
            challengesRemoved = 0;
            (_i = 0), (_a = Object.entries(this.devicePolicies));
            _e.label = 1;
          case 1:
            if (!(_i < _a.length)) return [3 /*break*/, 5];
            (_b = _a[_i]), (role = _b[0]), (policy = _b[1]);
            retentionDate = new Date(Date.now() - policy.deviceRetentionDays * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("device_id")
                .lt("last_seen", retentionDate.toISOString()),
            ];
          case 2:
            (_c = _e.sent()), (oldDevices = _c.data), (selectError = _c.error);
            if (selectError) {
              console.error("Failed to find old devices for role ".concat(role, ":"), selectError);
              return [3 /*break*/, 4];
            }
            if (!(oldDevices && oldDevices.length > 0)) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .delete()
                .in(
                  "device_id",
                  oldDevices.map(function (d) {
                    return d.device_id;
                  }),
                ),
            ];
          case 3:
            deleteError = _e.sent().error;
            if (!deleteError) {
              devicesRemoved += oldDevices.length;
            }
            _e.label = 4;
          case 4:
            _i++;
            return [3 /*break*/, 1];
          case 5:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verification_challenges")
                .select("challenge_id")
                .lt("expires_at", new Date().toISOString()),
            ];
          case 6:
            (_d = _e.sent()), (expiredChallenges = _d.data), (challengeSelectError = _d.error);
            if (!(!challengeSelectError && expiredChallenges && expiredChallenges.length > 0))
              return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verification_challenges")
                .delete()
                .in(
                  "challenge_id",
                  expiredChallenges.map(function (c) {
                    return c.challenge_id;
                  }),
                ),
            ];
          case 7:
            challengeDeleteError = _e.sent().error;
            if (!challengeDeleteError) {
              challengesRemoved = expiredChallenges.length;
            }
            _e.label = 8;
          case 8:
            // Log cleanup event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_cleanup",
                metadata: {
                  devicesRemoved: devicesRemoved,
                  challengesRemoved: challengesRemoved,
                },
              }),
            ];
          case 9:
            // Log cleanup event
            _e.sent();
            return [
              2 /*return*/,
              { devicesRemoved: devicesRemoved, challengesRemoved: challengesRemoved },
            ];
          case 10:
            error_8 = _e.sent();
            console.error("Failed to cleanup old devices:", error_8);
            throw error_8;
          case 11:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update device policies
   */
  DeviceTrackingManager.prototype.updateDevicePolicy = function (role, policy) {
    this.devicePolicies[role] = __assign(
      __assign(__assign({}, this.devicePolicies[role]), policy),
      { role: role },
    );
  };
  /**
   * Get device policy for role
   */
  DeviceTrackingManager.prototype.getDevicePolicy = function (role) {
    return this.devicePolicies[role];
  };
  /**
   * Destroy the device tracking manager
   */
  DeviceTrackingManager.prototype.destroy = function () {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = undefined;
    }
  };
  // Private methods
  DeviceTrackingManager.prototype.detectDeviceType = function (userAgent) {
    var ua = userAgent.toLowerCase();
    if (ua.includes("mobile") || ua.includes("android") || ua.includes("iphone")) {
      return "mobile";
    }
    if (ua.includes("tablet") || ua.includes("ipad")) {
      return "tablet";
    }
    if (ua.includes("windows") || ua.includes("mac") || ua.includes("linux")) {
      return "desktop";
    }
    return "unknown";
  };
  DeviceTrackingManager.prototype.generateDeviceName = function (fingerprint) {
    var platform = fingerprint.platform || "Unknown";
    var deviceType = this.detectDeviceType(fingerprint.userAgent);
    var timestamp = new Date().toLocaleDateString();
    return "".concat(platform, " ").concat(deviceType, " (").concat(timestamp, ")");
  };
  DeviceTrackingManager.prototype.assessDeviceRisk = function (
    userId_1,
    deviceId_1,
    fingerprint_1,
    ipAddress_1,
    location_1,
  ) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (userId, deviceId, fingerprint, ipAddress, location, isNewDevice) {
        var userDevices, riskFactors, lastDevice, distance, similarDevices, _a, _b, _c;
        if (isNewDevice === void 0) {
          isNewDevice = false;
        }
        return __generator(this, function (_d) {
          switch (_d.label) {
            case 0:
              return [4 /*yield*/, this.getUserDevices(userId)];
            case 1:
              userDevices = _d.sent();
              riskFactors = {
                isNewDevice: isNewDevice,
                locationChange: false,
                fingerprintMismatch: false,
                suspiciousUserAgent: false,
                vpnDetected: false,
                torDetected: false,
                knownMaliciousIP: false,
                rapidLocationChanges: false,
                unusualAccessPatterns: false,
              };
              if (userDevices.length > 0) {
                lastDevice = userDevices[0];
                if (lastDevice.location && location) {
                  distance = this.calculateDistance(
                    lastDevice.location.coordinates,
                    location.coordinates,
                  );
                  riskFactors.locationChange = distance > 1000; // More than 1000km
                }
                similarDevices = userDevices.filter(function (d) {
                  return (
                    d.fingerprint.platform === fingerprint.platform &&
                    d.fingerprint.userAgent.includes(fingerprint.userAgent.split("/")[0])
                  );
                });
                riskFactors.fingerprintMismatch = similarDevices.length === 0;
              }
              // Check for suspicious user agent
              riskFactors.suspiciousUserAgent = this.isSuspiciousUserAgent(fingerprint.userAgent);
              // Check for VPN/Tor (simplified - in production, use proper IP intelligence)
              _a = riskFactors;
              return [4 /*yield*/, this.checkVPN(ipAddress)];
            case 2:
              // Check for VPN/Tor (simplified - in production, use proper IP intelligence)
              _a.vpnDetected = _d.sent();
              _b = riskFactors;
              return [4 /*yield*/, this.checkTor(ipAddress)];
            case 3:
              _b.torDetected = _d.sent();
              _c = riskFactors;
              return [4 /*yield*/, this.checkMaliciousIP(ipAddress)];
            case 4:
              _c.knownMaliciousIP = _d.sent();
              return [2 /*return*/, riskFactors];
          }
        });
      },
    );
  };
  DeviceTrackingManager.prototype.calculateRiskScore = function (riskFactors) {
    var score = 0;
    if (riskFactors.isNewDevice) score += 0.2;
    if (riskFactors.locationChange) score += 0.3;
    if (riskFactors.fingerprintMismatch) score += 0.2;
    if (riskFactors.suspiciousUserAgent) score += 0.4;
    if (riskFactors.vpnDetected) score += 0.3;
    if (riskFactors.torDetected) score += 0.6;
    if (riskFactors.knownMaliciousIP) score += 0.8;
    if (riskFactors.rapidLocationChanges) score += 0.5;
    if (riskFactors.unusualAccessPatterns) score += 0.4;
    return Math.min(score, 1.0); // Cap at 1.0
  };
  DeviceTrackingManager.prototype.calculateDistance = function (coord1, coord2) {
    if (!coord1 || !coord2) return 0;
    var R = 6371; // Earth's radius in km
    var dLat = this.toRadians(coord2.latitude - coord1.latitude);
    var dLon = this.toRadians(coord2.longitude - coord1.longitude);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) *
        Math.cos(this.toRadians(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  DeviceTrackingManager.prototype.toRadians = function (degrees) {
    return degrees * (Math.PI / 180);
  };
  DeviceTrackingManager.prototype.isSuspiciousUserAgent = function (userAgent) {
    var suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];
    return suspiciousPatterns.some(function (pattern) {
      return pattern.test(userAgent);
    });
  };
  DeviceTrackingManager.prototype.checkVPN = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified VPN detection - in production, use proper IP intelligence service
        try {
          // This would call an IP intelligence API
          return [2 /*return*/, false];
        } catch (_b) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  DeviceTrackingManager.prototype.checkTor = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified Tor detection - in production, use Tor exit node lists
        try {
          // This would check against Tor exit node lists
          return [2 /*return*/, false];
        } catch (_b) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  DeviceTrackingManager.prototype.checkMaliciousIP = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Simplified malicious IP detection - in production, use threat intelligence
        try {
          // This would check against threat intelligence feeds
          return [2 /*return*/, false];
        } catch (_b) {
          return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  DeviceTrackingManager.prototype.generateVerificationCode = function (challengeType) {
    switch (challengeType) {
      case "totp":
        return Math.floor(100000 + Math.random() * 900000).toString();
      case "email":
      case "sms":
      case "push":
      default:
        return Math.floor(1000 + Math.random() * 9000).toString();
    }
  };
  DeviceTrackingManager.prototype.sendVerificationCode = function (userId, challengeType, code) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // This would integrate with your notification system
            // For now, we'll just log the event
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "verification_code_sent",
                userId: userId,
                metadata: {
                  challengeType: challengeType,
                  codeLength: code.length,
                },
              }),
            ];
          case 1:
            // This would integrate with your notification system
            // For now, we'll just log the event
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceTrackingManager.prototype.getUserRole = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This would fetch the user's role from your user management system
        // For now, return a default role
        return [2 /*return*/, "staff"];
      });
    });
  };
  DeviceTrackingManager.prototype.terminateDeviceSessions = function (deviceId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // This would integrate with your session management system
            // to terminate all active sessions for the blocked device
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "device_sessions_terminated",
                deviceId: deviceId,
                metadata: reason,
              }),
            ];
          case 1:
            // This would integrate with your session management system
            // to terminate all active sessions for the blocked device
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceTrackingManager.prototype.notifyNewDevice = function (userId, deviceId, deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // This would integrate with your notification system
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                eventType: "new_device_notification",
                userId: userId,
                deviceId: deviceId,
                ipAddress: deviceInfo.ipAddress,
                metadata: {
                  location: deviceInfo.location,
                },
              }),
            ];
          case 1:
            // This would integrate with your notification system
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceTrackingManager.prototype.mapDatabaseToDeviceInfo = function (data) {
    return {
      deviceId: data.device_id,
      userId: data.user_id,
      deviceName: data.device_name,
      deviceType: data.device_type,
      fingerprint: data.fingerprint,
      ipAddress: data.ip_address,
      location: data.location,
      isTrusted: data.is_trusted,
      isBlocked: data.is_blocked,
      firstSeen: new Date(data.first_seen),
      lastSeen: new Date(data.last_seen),
      sessionCount: data.session_count,
      riskScore: data.risk_score,
      metadata: data.metadata,
    };
  };
  DeviceTrackingManager.prototype.startCleanupInterval = function () {
    var _this = this;
    this.cleanupInterval = setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_9;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.cleanupOldDevices()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_9 = _a.sent();
                console.error("Device cleanup failed:", error_9);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      24 * 60 * 60 * 1000,
    ); // Daily cleanup
  };
  return DeviceTrackingManager;
})();
exports.DeviceTrackingManager = DeviceTrackingManager;
