"use strict";
/**
 * Session Management System - Main Entry Point
 *
 * Unified session management system for NeonPro with intelligent timeout,
 * security monitoring, device management, and LGPD compliance.
 */
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.defaultSessionConfig = exports.SessionError = exports.SessionSystem = void 0;
var events_1 = require("events");
var session_manager_1 = require("./session-manager");
var security_monitor_1 = require("./security-monitor");
var device_manager_1 = require("./device-manager");
var audit_logger_1 = require("./audit-logger");
var types_1 = require("./types");
Object.defineProperty(exports, "SessionError", {
  enumerable: true,
  get: function () {
    return types_1.SessionError;
  },
});
var SessionSystem = /** @class */ (function (_super) {
  __extends(SessionSystem, _super);
  function SessionSystem(supabase, config) {
    var _this = _super.call(this) || this;
    _this.isInitialized = false;
    _this.startTime = new Date();
    _this.performanceMetrics = {
      requestCount: 0,
      errorCount: 0,
      totalResponseTime: 0,
    };
    _this.supabase = supabase;
    _this.config = config;
    // Initialize components
    _this.sessionManager = new session_manager_1.SessionManager(supabase, config);
    _this.securityMonitor = new security_monitor_1.SecurityMonitor(
      supabase,
      config.securityMonitoring,
    );
    _this.deviceManager = new device_manager_1.DeviceManager(supabase);
    _this.auditLogger = new audit_logger_1.AuditLogger(supabase, {
      bufferSize: config.auditLogging.bufferSize,
      flushInterval: config.auditLogging.flushInterval,
    });
    _this.setupEventHandlers();
    return _this;
  }
  // ============================================================================
  // SYSTEM INITIALIZATION
  // ============================================================================
  /**
   * Initialize the session system
   */
  SessionSystem.prototype.initialize = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            if (this.isInitialized) {
              return [2 /*return*/];
            }
            // Validate configuration
            this.validateConfig();
            // Initialize database schema if needed
            return [4 /*yield*/, this.initializeDatabase()];
          case 1:
            // Initialize database schema if needed
            _a.sent();
            // Start background tasks
            this.startBackgroundTasks();
            this.isInitialized = true;
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: "system",
                clinicId: "system",
                action: "system_initialized",
                severity: "medium",
                details: {
                  config: this.sanitizeConfig(this.config),
                  timestamp: new Date(),
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
              }),
            ];
          case 2:
            _a.sent();
            this.emit("system_initialized", { config: this.config });
            return [3 /*break*/, 4];
          case 3:
            error_1 = _a.sent();
            throw new types_1.SessionError("Failed to initialize session system", "SYSTEM_ERROR", {
              error: error_1,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if system is ready
   */
  SessionSystem.prototype.isReady = function () {
    return this.isInitialized;
  };
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  /**
   * Create a new session with full security validation
   */
  SessionSystem.prototype.createSession = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        securityValidation,
        device,
        deviceValidation,
        requiresDeviceTrust,
        session,
        error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 13, 14, 15]);
            this.ensureInitialized();
            this.performanceMetrics.requestCount++;
            return [
              4 /*yield*/,
              this.securityMonitor.validateSessionCreation({
                userId: params.userId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
              }),
            ];
          case 2:
            securityValidation = _a.sent();
            if (!!securityValidation.isAllowed) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: params.userId,
                clinicId: params.clinicId,
                action: "session_creation_blocked",
                threatLevel: "high",
                details: {
                  reason: securityValidation.reason,
                  riskScore: securityValidation.riskScore,
                },
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
              }),
            ];
          case 3:
            _a.sent();
            throw new types_1.SessionError(
              "Session creation blocked: ".concat(securityValidation.reason),
              "SECURITY_VIOLATION",
              { riskScore: securityValidation.riskScore },
            );
          case 4:
            return [
              4 /*yield*/,
              this.deviceManager.registerOrValidateDevice({
                userId: params.userId,
                clinicId: params.clinicId,
                fingerprint: params.deviceFingerprint,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
                deviceName: params.deviceName,
              }),
            ];
          case 5:
            device = _a.sent();
            return [
              4 /*yield*/,
              this.deviceManager.validateDevice(device.deviceFingerprint, params.userId),
            ];
          case 6:
            deviceValidation = _a.sent();
            if (!!deviceValidation.isValid) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: params.userId,
                clinicId: params.clinicId,
                action: "device_validation_failed",
                threatLevel: "medium",
                details: {
                  reasons: deviceValidation.reasons,
                  riskScore: deviceValidation.riskScore,
                },
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                deviceFingerprint: device.deviceFingerprint,
              }),
            ];
          case 7:
            _a.sent();
            throw new types_1.SessionError("Device validation failed", "DEVICE_NOT_TRUSTED", {
              reasons: deviceValidation.reasons,
            });
          case 8:
            requiresDeviceTrust =
              this.config.deviceManagement.requireTrustedDevices && !deviceValidation.isTrusted;
            if (requiresDeviceTrust && !params.trustDevice) {
              return [
                2 /*return*/,
                {
                  session: null,
                  device: device,
                  requiresDeviceTrust: true,
                },
              ];
            }
            return [
              4 /*yield*/,
              this.sessionManager.createSession({
                userId: params.userId,
                clinicId: params.clinicId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                deviceFingerprint: device.deviceFingerprint,
                location: params.location,
              }),
            ];
          case 9:
            session = _a.sent();
            if (!(params.trustDevice && !deviceValidation.isTrusted)) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.deviceManager.trustDevice({
                deviceId: device.id,
                userId: params.userId,
                verificationMethod: "admin", // Simplified for demo
              }),
            ];
          case 10:
            _a.sent();
            _a.label = 11;
          case 11:
            // 7. Log session creation
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                sessionId: session.id,
                userId: params.userId,
                clinicId: params.clinicId,
                action: "session_created",
                severity: "low",
                details: {
                  deviceTrusted: deviceValidation.isTrusted,
                  securityScore: securityValidation.riskScore,
                  sessionDuration: session.expiresAt.getTime() - session.createdAt.getTime(),
                },
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                deviceFingerprint: device.deviceFingerprint,
                location: params.location,
              }),
            ];
          case 12:
            // 7. Log session creation
            _a.sent();
            this.emit("session_created", { session: session, device: device });
            return [2 /*return*/, { session: session, device: device, requiresDeviceTrust: false }];
          case 13:
            error_2 = _a.sent();
            this.performanceMetrics.errorCount++;
            if (error_2 instanceof types_1.SessionError) {
              throw error_2;
            }
            throw new types_1.SessionError("Failed to create session", "SYSTEM_ERROR", {
              error: error_2,
            });
          case 14:
            this.performanceMetrics.totalResponseTime += Date.now() - startTime;
            return [7 /*endfinally*/];
          case 15:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate an existing session
   */
  SessionSystem.prototype.validateSession = function (sessionToken, params) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime, session, securityValidation, device, deviceValidation, updatedSession, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            startTime = Date.now();
            _a.label = 1;
          case 1:
            _a.trys.push([1, 12, 13, 14]);
            this.ensureInitialized();
            this.performanceMetrics.requestCount++;
            return [4 /*yield*/, this.sessionManager.validateSession(sessionToken)];
          case 2:
            session = _a.sent();
            if (!session) {
              return [2 /*return*/, { isValid: false }];
            }
            return [
              4 /*yield*/,
              this.securityMonitor.validateSessionActivity({
                sessionId: session.id,
                userId: session.userId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
              }),
            ];
          case 3:
            securityValidation = _a.sent();
            if (!!securityValidation.isAllowed) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: session.userId,
                clinicId: session.clinicId,
                action: "suspicious_activity",
                threatLevel: securityValidation.threatLevel,
                details: {
                  reason: securityValidation.reason,
                  riskScore: securityValidation.riskScore,
                  sessionId: session.id,
                },
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
              }),
            ];
          case 4:
            _a.sent();
            // Terminate suspicious session
            return [
              4 /*yield*/,
              this.sessionManager.terminateSession(session.id, "security_violation"),
            ];
          case 5:
            // Terminate suspicious session
            _a.sent();
            return [
              2 /*return*/,
              {
                isValid: false,
                securityEvents: securityValidation.events,
                requiresAction: {
                  type: "security_verification",
                  message: "Suspicious activity detected. Please verify your identity.",
                  data: { reason: securityValidation.reason },
                },
              },
            ];
          case 6:
            device = void 0;
            if (!params.deviceFingerprint) return [3 /*break*/, 10];
            return [
              4 /*yield*/,
              this.deviceManager.validateDevice(params.deviceFingerprint, session.userId),
            ];
          case 7:
            deviceValidation = _a.sent();
            if (!!deviceValidation.isValid) return [3 /*break*/, 9];
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: session.userId,
                clinicId: session.clinicId,
                action: "device_fingerprint_changed",
                threatLevel: "medium",
                details: {
                  sessionId: session.id,
                  originalFingerprint: session.deviceFingerprint,
                  newFingerprint: params.deviceFingerprint,
                },
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
              }),
            ];
          case 8:
            _a.sent();
            return [
              2 /*return*/,
              {
                isValid: false,
                requiresAction: {
                  type: "device_trust",
                  message: "Device fingerprint has changed. Please verify this device.",
                  data: { deviceValidation: deviceValidation },
                },
              },
            ];
          case 9:
            device = deviceValidation.device;
            _a.label = 10;
          case 10:
            return [
              4 /*yield*/,
              this.sessionManager.updateSessionActivity(session.id, {
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                location: params.location,
              }),
            ];
          case 11:
            updatedSession = _a.sent();
            return [
              2 /*return*/,
              {
                isValid: true,
                session: updatedSession,
                device: device,
                securityEvents: securityValidation.events,
              },
            ];
          case 12:
            error_3 = _a.sent();
            this.performanceMetrics.errorCount++;
            return [
              2 /*return*/,
              {
                isValid: false,
                requiresAction: {
                  type: "security_verification",
                  message: "Session validation error. Please log in again.",
                  data: { error: error_3 instanceof Error ? error_3.message : "Unknown error" },
                },
              },
            ];
          case 13:
            this.performanceMetrics.totalResponseTime += Date.now() - startTime;
            return [7 /*endfinally*/];
          case 14:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate a session
   */
  SessionSystem.prototype.terminateSession = function (sessionToken_1) {
    return __awaiter(this, arguments, void 0, function (sessionToken, reason) {
      var session, error_4;
      if (reason === void 0) {
        reason = "user_logout";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            this.ensureInitialized();
            return [4 /*yield*/, this.sessionManager.getSessionByToken(sessionToken)];
          case 1:
            session = _a.sent();
            if (!session) return [3 /*break*/, 4];
            return [4 /*yield*/, this.sessionManager.terminateSession(session.id, reason)];
          case 2:
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                sessionId: session.id,
                userId: session.userId,
                clinicId: session.clinicId,
                action: "session_terminated",
                severity: "low",
                details: {
                  reason: reason,
                  sessionDuration: Date.now() - session.createdAt.getTime(),
                },
                ipAddress: session.ipAddress,
                userAgent: session.userAgent,
                deviceFingerprint: session.deviceFingerprint,
              }),
            ];
          case 3:
            _a.sent();
            this.emit("session_terminated", { session: session, reason: reason });
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_4 = _a.sent();
            throw new types_1.SessionError("Failed to terminate session", "SYSTEM_ERROR", {
              error: error_4,
            });
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate all sessions for a user
   */
  SessionSystem.prototype.terminateAllUserSessions = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, reason) {
      var terminatedCount, error_5;
      if (reason === void 0) {
        reason = "admin_action";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            this.ensureInitialized();
            return [4 /*yield*/, this.sessionManager.terminateAllUserSessions(userId, reason)];
          case 1:
            terminatedCount = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: userId,
                clinicId: "system",
                action: "session_terminated",
                severity: "medium",
                details: {
                  reason: reason,
                  terminatedCount: terminatedCount,
                  bulkTermination: true,
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
              }),
            ];
          case 2:
            _a.sent();
            this.emit("user_sessions_terminated", {
              userId: userId,
              count: terminatedCount,
              reason: reason,
            });
            return [2 /*return*/, terminatedCount];
          case 3:
            error_5 = _a.sent();
            throw new types_1.SessionError("Failed to terminate user sessions", "SYSTEM_ERROR", {
              error: error_5,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DEVICE MANAGEMENT
  // ============================================================================
  /**
   * Get user devices
   */
  SessionSystem.prototype.getUserDevices = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.deviceManager.getUserDevices(userId)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_6 = _a.sent();
            throw new types_1.SessionError("Failed to get user devices", "SYSTEM_ERROR", {
              error: error_6,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Trust a device
   */
  SessionSystem.prototype.trustDevice = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            this.ensureInitialized();
            return [4 /*yield*/, this.deviceManager.trustDevice(params)];
          case 1:
            device = _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: params.userId,
                clinicId: device.clinicId,
                action: "device_trusted",
                severity: "medium",
                details: {
                  deviceId: params.deviceId,
                  verificationMethod: params.verificationMethod,
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
                deviceFingerprint: device.deviceFingerprint,
              }),
            ];
          case 2:
            _a.sent();
            this.emit("device_trusted", { device: device, method: params.verificationMethod });
            return [2 /*return*/, device];
          case 3:
            error_7 = _a.sent();
            if (error_7 instanceof types_1.SessionError) {
              throw error_7;
            }
            throw new types_1.SessionError("Failed to trust device", "SYSTEM_ERROR", {
              error: error_7,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block a device
   */
  SessionSystem.prototype.blockDevice = function (deviceId, userId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.deviceManager.blockDevice(deviceId, userId, reason)];
          case 1:
            _a.sent();
            this.emit("device_blocked", { deviceId: deviceId, userId: userId, reason: reason });
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            if (error_8 instanceof types_1.SessionError) {
              throw error_8;
            }
            throw new types_1.SessionError("Failed to block device", "SYSTEM_ERROR", {
              error: error_8,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // SECURITY & MONITORING
  // ============================================================================
  /**
   * Get security events
   */
  SessionSystem.prototype.getSecurityEvents = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.auditLogger.getSecurityEvents(options)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_9 = _a.sent();
            throw new types_1.SessionError("Failed to get security events", "SYSTEM_ERROR", {
              error: error_9,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block an IP address
   */
  SessionSystem.prototype.blockIP = function (ipAddress, reason, duration) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            this.ensureInitialized();
            return [4 /*yield*/, this.securityMonitor.blockIP(ipAddress, reason, duration)];
          case 1:
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: "system",
                clinicId: "system",
                action: "ip_blocked",
                threatLevel: "high",
                details: {
                  ipAddress: ipAddress,
                  reason: reason,
                  duration: duration,
                },
                ipAddress: ipAddress,
                userAgent: "session_system",
              }),
            ];
          case 2:
            _a.sent();
            this.emit("ip_blocked", { ipAddress: ipAddress, reason: reason, duration: duration });
            return [3 /*break*/, 4];
          case 3:
            error_10 = _a.sent();
            throw new types_1.SessionError("Failed to block IP", "SYSTEM_ERROR", {
              error: error_10,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Unblock an IP address
   */
  SessionSystem.prototype.unblockIP = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            this.ensureInitialized();
            return [4 /*yield*/, this.securityMonitor.unblockIP(ipAddress)];
          case 1:
            _a.sent();
            return [
              4 /*yield*/,
              this.auditLogger.logSecurityEvent({
                userId: "system",
                clinicId: "system",
                action: "ip_unblocked",
                threatLevel: "low",
                details: { ipAddress: ipAddress },
                ipAddress: ipAddress,
                userAgent: "session_system",
              }),
            ];
          case 2:
            _a.sent();
            this.emit("ip_unblocked", { ipAddress: ipAddress });
            return [3 /*break*/, 4];
          case 3:
            error_11 = _a.sent();
            throw new types_1.SessionError("Failed to unblock IP", "SYSTEM_ERROR", {
              error: error_11,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // AUDIT & COMPLIANCE
  // ============================================================================
  /**
   * Search audit logs
   */
  SessionSystem.prototype.searchAuditLogs = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.auditLogger.searchAuditLogs(filters)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_12 = _a.sent();
            throw new types_1.SessionError("Failed to search audit logs", "SYSTEM_ERROR", {
              error: error_12,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Generate LGPD compliance report
   */
  SessionSystem.prototype.generateLGPDReport = function (options) {
    return __awaiter(this, void 0, void 0, function () {
      var error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.auditLogger.generateLGPDReport(options)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_13 = _a.sent();
            throw new types_1.SessionError("Failed to generate LGPD report", "SYSTEM_ERROR", {
              error: error_13,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Export audit logs
   */
  SessionSystem.prototype.exportAuditLogs = function (filters_1) {
    return __awaiter(this, arguments, void 0, function (filters, format) {
      var error_14;
      if (format === void 0) {
        format = "json";
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [4 /*yield*/, this.auditLogger.exportAuditLogs(filters, format)];
          case 1:
            return [2 /*return*/, _a.sent()];
          case 2:
            error_14 = _a.sent();
            throw new types_1.SessionError("Failed to export audit logs", "SYSTEM_ERROR", {
              error: error_14,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // SYSTEM MANAGEMENT
  // ============================================================================
  /**
   * Get system statistics
   */
  SessionSystem.prototype.getSystemStats = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, sessionStats, deviceStats, auditStats, uptime, avgResponseTime, errorRate, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            return [
              4 /*yield*/,
              Promise.all([
                this.sessionManager.getSessionStatistics(),
                this.deviceManager.getDeviceStatistics(),
                this.auditLogger.generateAuditStatistics(),
              ]),
            ];
          case 1:
            (_a = _b.sent()), (sessionStats = _a[0]), (deviceStats = _a[1]), (auditStats = _a[2]);
            uptime = Date.now() - this.startTime.getTime();
            avgResponseTime =
              this.performanceMetrics.requestCount > 0
                ? this.performanceMetrics.totalResponseTime / this.performanceMetrics.requestCount
                : 0;
            errorRate =
              this.performanceMetrics.requestCount > 0
                ? (this.performanceMetrics.errorCount / this.performanceMetrics.requestCount) * 100
                : 0;
            return [
              2 /*return*/,
              {
                activeSessions: sessionStats.activeSessions,
                totalUsers: sessionStats.totalUsers,
                trustedDevices: deviceStats.trustedDevices,
                securityEvents: auditStats.securityEvents,
                auditEvents: auditStats.totalEvents,
                systemHealth: {
                  status: this.determineSystemHealth(errorRate, avgResponseTime),
                  uptime: uptime,
                  performance: {
                    avgResponseTime: avgResponseTime,
                    errorRate: errorRate,
                    throughput: this.performanceMetrics.requestCount / (uptime / 1000 / 60), // requests per minute
                  },
                },
              },
            ];
          case 2:
            error_15 = _b.sent();
            throw new types_1.SessionError("Failed to get system stats", "SYSTEM_ERROR", {
              error: error_15,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform system maintenance
   */
  SessionSystem.prototype.performMaintenance = function () {
    return __awaiter(this, void 0, void 0, function () {
      var _a, sessionsCleanedUp, devicesCleanedUp, logsResult, error_16;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            this.ensureInitialized();
            return [
              4 /*yield*/,
              Promise.all([
                this.sessionManager.cleanupExpiredSessions(),
                this.deviceManager.cleanupOldDevices(this.config.auditLogging.retentionDays),
                this.auditLogger.archiveOldLogs(this.config.auditLogging.retentionDays),
              ]),
            ];
          case 1:
            (_a = _b.sent()),
              (sessionsCleanedUp = _a[0]),
              (devicesCleanedUp = _a[1]),
              (logsResult = _a[2]);
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: "system",
                clinicId: "system",
                action: "maintenance_completed",
                severity: "low",
                details: {
                  sessionsCleanedUp: sessionsCleanedUp,
                  devicesCleanedUp: devicesCleanedUp,
                  logsArchived: logsResult.archivedCount,
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
              }),
            ];
          case 2:
            _b.sent();
            this.emit("maintenance_completed", {
              sessionsCleanedUp: sessionsCleanedUp,
              devicesCleanedUp: devicesCleanedUp,
              logsArchived: logsResult.archivedCount,
            });
            return [
              2 /*return*/,
              {
                sessionsCleanedUp: sessionsCleanedUp,
                devicesCleanedUp: devicesCleanedUp,
                logsArchived: logsResult.archivedCount,
              },
            ];
          case 3:
            error_16 = _b.sent();
            throw new types_1.SessionError("Failed to perform maintenance", "SYSTEM_ERROR", {
              error: error_16,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update system configuration
   */
  SessionSystem.prototype.updateConfig = function (newConfig) {
    return __awaiter(this, void 0, void 0, function () {
      var oldConfig, error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            this.ensureInitialized();
            oldConfig = __assign({}, this.config);
            this.config = __assign(__assign({}, this.config), newConfig);
            // Validate new configuration
            this.validateConfig();
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: "system",
                clinicId: "system",
                action: "configuration_changed",
                severity: "medium",
                details: {
                  oldConfig: this.sanitizeConfig(oldConfig),
                  newConfig: this.sanitizeConfig(this.config),
                  changes: this.getConfigChanges(oldConfig, this.config),
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
              }),
            ];
          case 1:
            _a.sent();
            this.emit("config_updated", { oldConfig: oldConfig, newConfig: this.config });
            return [3 /*break*/, 3];
          case 2:
            error_17 = _a.sent();
            throw new types_1.SessionError("Failed to update configuration", "SYSTEM_ERROR", {
              error: error_17,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  SessionSystem.prototype.setupEventHandlers = function () {
    var _this = this;
    // Session Manager events
    this.sessionManager.on("session_expired", function (data) {
      _this.emit("session_expired", data);
    });
    this.sessionManager.on("concurrent_session_detected", function (data) {
      _this.emit("concurrent_session_detected", data);
    });
    // Security Monitor events
    this.securityMonitor.on("threat_detected", function (data) {
      _this.emit("threat_detected", data);
    });
    this.securityMonitor.on("ip_blocked", function (data) {
      _this.emit("security_ip_blocked", data);
    });
    // Device Manager events
    this.deviceManager.on("device_registered", function (data) {
      _this.emit("device_registered", data);
    });
    this.deviceManager.on("device_blocked", function (data) {
      _this.emit("device_blocked", data);
    });
    // Audit Logger events
    this.auditLogger.on("critical_event", function (data) {
      _this.emit("critical_audit_event", data);
    });
  };
  SessionSystem.prototype.validateConfig = function () {
    if (!this.config.sessionTimeout || this.config.sessionTimeout < 300000) {
      throw new types_1.SessionError(
        "Session timeout must be at least 5 minutes",
        "INVALID_CONFIG",
      );
    }
    if (
      !this.config.renewalThreshold ||
      this.config.renewalThreshold < 0.1 ||
      this.config.renewalThreshold > 0.9
    ) {
      throw new types_1.SessionError(
        "Renewal threshold must be between 0.1 and 0.9",
        "INVALID_CONFIG",
      );
    }
    if (this.config.securityMonitoring.maxFailedAttempts < 1) {
      throw new types_1.SessionError("Max failed attempts must be at least 1", "INVALID_CONFIG");
    }
  };
  SessionSystem.prototype.initializeDatabase = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/];
      });
    });
  };
  SessionSystem.prototype.startBackgroundTasks = function () {
    var _this = this;
    // Start session cleanup task
    setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_18;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.sessionManager.cleanupExpiredSessions()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_18 = _a.sent();
                console.error("Session cleanup failed:", error_18);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      5 * 60 * 1000,
    ); // Every 5 minutes
    // Start maintenance task
    setInterval(
      function () {
        return __awaiter(_this, void 0, void 0, function () {
          var error_19;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.performMaintenance()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_19 = _a.sent();
                console.error("Maintenance failed:", error_19);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        });
      },
      24 * 60 * 60 * 1000,
    ); // Daily
  };
  SessionSystem.prototype.ensureInitialized = function () {
    if (!this.isInitialized) {
      throw new types_1.SessionError("Session system not initialized", "SYSTEM_ERROR");
    }
  };
  SessionSystem.prototype.sanitizeConfig = function (config) {
    // Remove sensitive information from config for logging
    var sanitized = __assign({}, config);
    // Remove any sensitive fields here
    return sanitized;
  };
  SessionSystem.prototype.getConfigChanges = function (oldConfig, newConfig) {
    var changes = [];
    // Compare configurations and identify changes
    if (oldConfig.sessionTimeout !== newConfig.sessionTimeout) {
      changes.push("sessionTimeout");
    }
    if (oldConfig.renewalThreshold !== newConfig.renewalThreshold) {
      changes.push("renewalThreshold");
    }
    // Add more comparisons as needed
    return changes;
  };
  SessionSystem.prototype.determineSystemHealth = function (errorRate, avgResponseTime) {
    if (errorRate > 10 || avgResponseTime > 5000) {
      return "critical";
    }
    if (errorRate > 5 || avgResponseTime > 2000) {
      return "warning";
    }
    return "healthy";
  };
  /**
   * Cleanup resources and shutdown system
   */
  SessionSystem.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      var error_20;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.auditLogger.logSessionEvent({
                userId: "system",
                clinicId: "system",
                action: "system_shutdown",
                severity: "medium",
                details: {
                  uptime: Date.now() - this.startTime.getTime(),
                  performanceMetrics: this.performanceMetrics,
                },
                ipAddress: "127.0.0.1",
                userAgent: "session_system",
              }),
            ];
          case 1:
            _a.sent();
            return [
              4 /*yield*/,
              Promise.all([
                this.sessionManager.destroy(),
                this.securityMonitor.destroy(),
                this.deviceManager.destroy(),
                this.auditLogger.destroy(),
              ]),
            ];
          case 2:
            _a.sent();
            this.removeAllListeners();
            this.isInitialized = false;
            return [3 /*break*/, 4];
          case 3:
            error_20 = _a.sent();
            console.error("Failed to cleanup session system:", error_20);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  return SessionSystem;
})(events_1.EventEmitter);
exports.SessionSystem = SessionSystem;
// Export default configuration
exports.defaultSessionConfig = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  renewalThreshold: 0.25, // Renew when 25% of time remaining
  maxConcurrentSessions: 3,
  enableLocationTracking: true,
  enableDeviceFingerprinting: true,
  securityMonitoring: {
    enabled: true,
    threatDetection: true,
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  deviceManagement: {
    enabled: true,
    requireTrustedDevices: false,
    maxDevicesPerUser: 10,
    deviceTrustExpiry: 90 * 24 * 60 * 60 * 1000, // 90 days
  },
  auditLogging: {
    enabled: true,
    bufferSize: 100,
    flushInterval: 5000,
    retentionDays: 365,
  },
  lgpdCompliance: {
    enabled: true,
    dataMinimization: true,
    consentTracking: true,
    automaticDeletion: true,
  },
};
