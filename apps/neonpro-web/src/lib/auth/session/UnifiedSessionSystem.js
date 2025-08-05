/**
 * Unified Session Management System - Core Implementation
 *
 * This is the main orchestrator for the complete session management system,
 * coordinating all session-related operations including timeout management,
 * device tracking, security monitoring, and LGPD compliance.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
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
exports.unifiedSessionSystem = exports.UnifiedSessionSystem = void 0;
exports.createUnifiedSessionSystem = createUnifiedSessionSystem;
var supabase_js_1 = require("@supabase/supabase-js");
var SessionManager_1 = require("./SessionManager");
var DeviceManager_1 = require("./DeviceManager");
var SecurityEventLogger_1 = require("./SecurityEventLogger");
var NotificationService_1 = require("./NotificationService");
var DataCleanupService_1 = require("./DataCleanupService");
var config_1 = require("./config");
var utils_1 = require("./utils");
/**
 * Unified Session Management System
 *
 * Central orchestrator for all session management operations including:
 * - Intelligent session timeout with role-based configuration
 * - Device-based session tracking and trust management
 * - Real-time security monitoring and threat detection
 * - Cross-device session synchronization
 * - LGPD-compliant audit logging
 * - Automatic cleanup and data management
 */
var UnifiedSessionSystem = /** @class */ (() => {
  function UnifiedSessionSystem(config) {
    // Activity tracking for intelligent timeout
    this.activityTrackers = new Map();
    this.sessionWarnings = new Map();
    // Real-time monitoring
    this.securityMonitor = null;
    this.cleanupScheduler = null;
    this.updateActivityTracking = (0, utils_1.debounce)(
      (sessionId) =>
        __awaiter(this, void 0, void 0, function () {
          var existingTimer, inactivityTimer;
          var _this = this;
          return __generator(this, function (_a) {
            existingTimer = this.activityTrackers.get(sessionId);
            if (existingTimer) {
              clearTimeout(existingTimer);
            }
            inactivityTimer = setTimeout(
              () =>
                __awaiter(_this, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    switch (_a.label) {
                      case 0:
                        return [4 /*yield*/, this.handleSessionInactivity(sessionId)];
                      case 1:
                        _a.sent();
                        return [2 /*return*/];
                    }
                  });
                }),
              this.config.session.inactivityTimeout,
            );
            this.activityTrackers.set(sessionId, inactivityTimer);
            return [2 /*return*/];
          });
        }),
      1000,
    ); // Debounce activity updates
    this.config = {
      session: __assign(
        __assign({}, config_1.sessionConfig.session),
        config === null || config === void 0 ? void 0 : config.session,
      ),
      device: __assign(
        __assign({}, config_1.sessionConfig.device),
        config === null || config === void 0 ? void 0 : config.device,
      ),
      security: __assign(
        __assign({}, config_1.sessionConfig.security),
        config === null || config === void 0 ? void 0 : config.security,
      ),
    };
    // Initialize Supabase client
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    // Initialize core components
    this.sessionManager = new SessionManager_1.SessionManager(this.config.session);
    this.deviceManager = new DeviceManager_1.DeviceManager(this.config.device);
    this.securityLogger = new SecurityEventLogger_1.SecurityEventLogger(this.config.security);
    this.notificationService = new NotificationService_1.NotificationService(
      this.config.security.notifications,
    );
    this.cleanupService = new DataCleanupService_1.DataCleanupService(
      this.config.security.retentionDays,
    );
    // Start background services
    this.startSecurityMonitoring();
    this.startCleanupScheduler();
  }
  /**
   * Task 1: Intelligent Session Timeout System
   * Authenticate user with intelligent timeout and activity tracking
   */
  UnifiedSessionSystem.prototype.authenticateUser = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        deviceResult,
        device,
        riskScore,
        _a,
        _b,
        sessionTimeout,
        sessionResult,
        session,
        error_1;
      var _c, _d;
      var _e, _f, _g, _h, _j;
      return __generator(this, function (_k) {
        switch (_k.label) {
          case 0:
            _k.trys.push([0, 16, , 18]);
            startTime = Date.now();
            return [
              4 /*yield*/,
              this.deviceManager.registerDevice({
                userId: request.userId,
                fingerprint:
                  request.deviceFingerprint ||
                  (0, utils_1.generateDeviceFingerprint)(request.deviceInfo),
                name:
                  ((_e = request.deviceInfo) === null || _e === void 0 ? void 0 : _e.name) ||
                  "Unknown Device",
                type:
                  ((_f = request.deviceInfo) === null || _f === void 0 ? void 0 : _f.type) ||
                  "unknown",
                userAgent: request.userAgent,
                ipAddress: request.ipAddress,
                location: request.location,
                screen: (_g = request.deviceInfo) === null || _g === void 0 ? void 0 : _g.screen,
                timezone:
                  (_h = request.deviceInfo) === null || _h === void 0 ? void 0 : _h.timezone,
                language:
                  (_j = request.deviceInfo) === null || _j === void 0 ? void 0 : _j.language,
              }),
            ];
          case 1:
            deviceResult = _k.sent();
            if (deviceResult.success) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: request.userId,
                type: "device_registration_failed",
                severity: "high",
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                details: { error: deviceResult.error },
              }),
            ];
          case 2:
            _k.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: deviceResult.error,
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            device = deviceResult.data;
            return [4 /*yield*/, this.calculateAuthenticationRisk(request, device)];
          case 4:
            riskScore = _k.sent();
            if (!(riskScore > 0.8)) return [3 /*break*/, 7];
            _b = (_a = this.securityLogger).logEvent;
            _c = {
              userId: request.userId,
              deviceId: device.id,
              type: "high_risk_authentication",
              severity: "critical",
              ipAddress: request.ipAddress,
              userAgent: request.userAgent,
            };
            _d = { riskScore: riskScore };
            return [4 /*yield*/, this.getRiskFactors(request, device)];
          case 5:
            return [
              4 /*yield*/,
              _b.apply(_a, [((_c.details = ((_d.factors = _k.sent()), _d)), _c)]),
            ];
          case 6:
            _k.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "HIGH_RISK_AUTHENTICATION",
                  message: "Authentication blocked due to high risk score",
                  details: { riskScore: riskScore },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 7:
            return [4 /*yield*/, this.calculateSessionTimeout(request.userId)];
          case 8:
            sessionTimeout = _k.sent();
            return [
              4 /*yield*/,
              this.sessionManager.createSession({
                userId: request.userId,
                deviceId: device.id,
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                location: request.location,
                expiresAt: new Date(Date.now() + sessionTimeout).toISOString(),
                metadata: __assign(
                  {
                    riskScore: riskScore,
                    authenticationTime: Date.now() - startTime,
                    deviceTrusted: device.trusted,
                  },
                  request.metadata,
                ),
              }),
            ];
          case 9:
            sessionResult = _k.sent();
            if (sessionResult.success) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: request.userId,
                deviceId: device.id,
                type: "session_creation_failed",
                severity: "high",
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                details: { error: sessionResult.error },
              }),
            ];
          case 10:
            _k.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: sessionResult.error,
                timestamp: new Date().toISOString(),
              },
            ];
          case 11:
            session = sessionResult.data;
            // Step 4: Setup intelligent timeout tracking
            return [4 /*yield*/, this.setupSessionTimeoutTracking(session)];
          case 12:
            // Step 4: Setup intelligent timeout tracking
            _k.sent();
            // Step 5: Log successful authentication
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: request.userId,
                sessionId: session.id,
                deviceId: device.id,
                type: "authentication_success",
                severity: "low",
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                details: {
                  sessionTimeout: (0, utils_1.formatDuration)(sessionTimeout),
                  riskScore: riskScore,
                  deviceTrusted: device.trusted,
                },
              }),
            ];
          case 13:
            // Step 5: Log successful authentication
            _k.sent();
            if (!(!device.trusted || riskScore > 0.5)) return [3 /*break*/, 15];
            return [
              4 /*yield*/,
              this.notificationService.sendNotification({
                userId: request.userId,
                type: "new_device_login",
                severity: device.trusted ? "low" : "medium",
                title: "New Device Login",
                message: "Login from ".concat(device.name, " (").concat(request.ipAddress, ")"),
                data: {
                  sessionId: session.id,
                  deviceId: device.id,
                  location: request.location,
                  riskScore: riskScore,
                },
              }),
            ];
          case 14:
            _k.sent();
            _k.label = 15;
          case 15:
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  session: session,
                  device: device,
                  token: session.token,
                  expiresAt: session.expiresAt,
                  requiresVerification: !device.trusted && riskScore > 0.3,
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 16:
            error_1 = _k.sent();
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: request.userId,
                type: "authentication_error",
                severity: "critical",
                ipAddress: request.ipAddress,
                userAgent: request.userAgent,
                details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
              }),
            ];
          case 17:
            _k.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "AUTHENTICATION_ERROR",
                  message: "Internal authentication error",
                  details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 18:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate session with activity tracking
   */
  UnifiedSessionSystem.prototype.validateSession = function (token) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionResult, session, timeToExpiry, extendThreshold, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.sessionManager.validateSession(token)];
          case 1:
            sessionResult = _a.sent();
            if (!sessionResult.success) {
              return [2 /*return*/, sessionResult];
            }
            session = sessionResult.data;
            timeToExpiry = new Date(session.expiresAt).getTime() - Date.now();
            extendThreshold = this.config.session.inactivityTimeout / 2;
            if (!(timeToExpiry < extendThreshold && this.config.session.extendOnActivity))
              return [3 /*break*/, 3];
            return [4 /*yield*/, this.extendSessionTimeout(session.id)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            // Update activity tracking
            return [4 /*yield*/, this.updateActivityTracking(session.id)];
          case 4:
            // Update activity tracking
            _a.sent();
            return [2 /*return*/, sessionResult];
          case 5:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SESSION_VALIDATION_ERROR",
                  message: "Error validating session",
                  details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity with intelligent timeout extension
   */
  UnifiedSessionSystem.prototype.updateSessionActivity = function (sessionId, activity) {
    return __awaiter(this, void 0, void 0, function () {
      var updateResult, session, _a, error_3;
      var _b, _c;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 8, , 9]);
            return [4 /*yield*/, this.sessionManager.updateActivity(sessionId, activity)];
          case 1:
            updateResult = _d.sent();
            if (!updateResult.success) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: updateResult.error,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = updateResult.data;
            // Update activity tracking
            return [4 /*yield*/, this.updateActivityTracking(sessionId)];
          case 2:
            // Update activity tracking
            _d.sent();
            if (!(activity === null || activity === void 0 ? void 0 : activity.significantActivity))
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: session.userId,
                sessionId: session.id,
                type: "session_activity",
                severity: "low",
                details: {
                  activityType: activity.activityType,
                  location: activity.location,
                  timestamp: activity.timestamp,
                },
              }),
            ];
          case 3:
            _d.sent();
            _d.label = 4;
          case 4:
            _b = {
              success: true,
            };
            _c = {
              session: session,
            };
            if (!(activity === null || activity === void 0 ? void 0 : activity.significantActivity))
              return [3 /*break*/, 6];
            return [4 /*yield*/, this.securityLogger.getLatestEvent(session.userId)];
          case 5:
            _a = _d.sent();
            return [3 /*break*/, 7];
          case 6:
            _a = undefined;
            _d.label = 7;
          case 7:
            return [
              2 /*return*/,
              ((_b.data = ((_c.securityEvent = _a), _c)),
              (_b.timestamp = new Date().toISOString()),
              _b),
            ];
          case 8:
            error_3 = _d.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "ACTIVITY_UPDATE_ERROR",
                  message: "Error updating session activity",
                  details: { error: error_3 instanceof Error ? error_3.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate session with cleanup
   */
  UnifiedSessionSystem.prototype.terminateSession = function (sessionId_1) {
    return __awaiter(this, arguments, void 0, function (sessionId, reason) {
      var terminateResult, session, error_4;
      var _a, _b;
      if (reason === void 0) {
        reason = "user_logout";
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 4, , 5]);
            // Clear activity tracking
            this.clearActivityTracking(sessionId);
            return [4 /*yield*/, this.sessionManager.terminateSession(sessionId, reason)];
          case 1:
            terminateResult = _c.sent();
            if (!terminateResult.success) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: terminateResult.error,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            session = terminateResult.data;
            // Log termination
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: session.userId,
                sessionId: session.id,
                type: reason === "user_logout" ? "logout" : "session_terminated",
                severity: "low",
                details: { reason: reason, terminatedAt: session.terminatedAt },
              }),
            ];
          case 2:
            // Log termination
            _c.sent();
            _a = {
              success: true,
            };
            _b = {
              session: session,
            };
            return [4 /*yield*/, this.securityLogger.getLatestEvent(session.userId)];
          case 3:
            return [
              2 /*return*/,
              ((_a.data = ((_b.securityEvent = _c.sent()), _b)),
              (_a.timestamp = new Date().toISOString()),
              _a),
            ];
          case 4:
            error_4 = _c.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SESSION_TERMINATION_ERROR",
                  message: "Error terminating session",
                  details: { error: error_4 instanceof Error ? error_4.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user sessions with activity status
   */
  UnifiedSessionSystem.prototype.getUserSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionsResult, sessions, enrichedSessions, error_5;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.sessionManager.getUserSessions(userId)];
          case 1:
            sessionsResult = _a.sent();
            if (!sessionsResult.success) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: sessionsResult.error,
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            sessions = sessionsResult.data;
            return [
              4 /*yield*/,
              Promise.all(
                sessions.map((session) =>
                  __awaiter(_this, void 0, void 0, function () {
                    var deviceResult, device;
                    return __generator(this, function (_a) {
                      switch (_a.label) {
                        case 0:
                          return [4 /*yield*/, this.deviceManager.getDevice(session.deviceId)];
                        case 1:
                          deviceResult = _a.sent();
                          device = deviceResult.success ? deviceResult.data : null;
                          return [
                            2 /*return*/,
                            __assign(__assign({}, session), {
                              device: device,
                              isActive: this.activityTrackers.has(session.id),
                              timeToExpiry: new Date(session.expiresAt).getTime() - Date.now(),
                            }),
                          ];
                      }
                    });
                  }),
                ),
              ),
            ];
          case 2:
            enrichedSessions = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: { sessions: enrichedSessions },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            error_5 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_SESSIONS_ERROR",
                  message: "Error retrieving user sessions",
                  details: { error: error_5 instanceof Error ? error_5.message : "Unknown error" },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private Methods - Session Timeout Management
   */
  UnifiedSessionSystem.prototype.calculateSessionTimeout = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var user, role, timeouts, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("users").select("role").eq("id", userId).single(),
            ];
          case 1:
            user = _a.sent().data;
            role = (user === null || user === void 0 ? void 0 : user.role) || "patient";
            timeouts = {
              owner: 8 * 60 * 60 * 1000, // 8 hours
              manager: 4 * 60 * 60 * 1000, // 4 hours
              staff: 2 * 60 * 60 * 1000, // 2 hours
              patient: 30 * 60 * 1000, // 30 minutes
            };
            return [2 /*return*/, timeouts[role] || this.config.session.sessionTimeout];
          case 2:
            error_6 = _a.sent();
            // Fallback to default timeout
            return [2 /*return*/, this.config.session.sessionTimeout];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.setupSessionTimeoutTracking = function (session) {
    return __awaiter(this, void 0, void 0, function () {
      var timeToExpiry, warningTime, finalWarningTime, warningTimer, finalWarningTimer, expiryTimer;
      var _this = this;
      return __generator(this, function (_a) {
        timeToExpiry = new Date(session.expiresAt).getTime() - Date.now();
        warningTime = timeToExpiry - 5 * 60 * 1000;
        finalWarningTime = timeToExpiry - 1 * 60 * 1000;
        // Setup warning timers
        if (warningTime > 0) {
          warningTimer = setTimeout(
            () =>
              __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      return [4 /*yield*/, this.sendSessionWarning(session.id, "5 minutes")];
                    case 1:
                      _a.sent();
                      return [2 /*return*/];
                  }
                });
              }),
            warningTime,
          );
          this.sessionWarnings.set("".concat(session.id, "-5min"), warningTimer);
        }
        if (finalWarningTime > 0) {
          finalWarningTimer = setTimeout(
            () =>
              __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  switch (_a.label) {
                    case 0:
                      return [4 /*yield*/, this.sendSessionWarning(session.id, "1 minute")];
                    case 1:
                      _a.sent();
                      return [2 /*return*/];
                  }
                });
              }),
            finalWarningTime,
          );
          this.sessionWarnings.set("".concat(session.id, "-1min"), finalWarningTimer);
        }
        expiryTimer = setTimeout(
          () =>
            __awaiter(_this, void 0, void 0, function () {
              return __generator(this, function (_a) {
                switch (_a.label) {
                  case 0:
                    return [4 /*yield*/, this.handleSessionExpiry(session.id)];
                  case 1:
                    _a.sent();
                    return [2 /*return*/];
                }
              });
            }),
          timeToExpiry,
        );
        this.activityTrackers.set(session.id, expiryTimer);
        return [2 /*return*/];
      });
    });
  };
  UnifiedSessionSystem.prototype.sendSessionWarning = function (sessionId, timeRemaining) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionResult, session, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            sessionResult = _a.sent();
            if (!(sessionResult.success && sessionResult.data)) return [3 /*break*/, 3];
            session = sessionResult.data;
            return [
              4 /*yield*/,
              this.notificationService.sendNotification({
                userId: session.userId,
                type: "session_warning",
                severity: "medium",
                title: "Session Expiring Soon",
                message: "Your session will expire in ".concat(
                  timeRemaining,
                  ". Please save your work.",
                ),
                data: {
                  sessionId: sessionId,
                  timeRemaining: timeRemaining,
                  expiresAt: session.expiresAt,
                },
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_7 = _a.sent();
            console.error("Error sending session warning:", error_7);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.handleSessionExpiry = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.terminateSession(sessionId, "timeout")];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_8 = _a.sent();
            console.error("Error handling session expiry:", error_8);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.extendSessionTimeout = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var newExpiryTime, sessionResult, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            newExpiryTime = Date.now() + this.config.session.sessionTimeout;
            return [
              4 /*yield*/,
              this.sessionManager.extendSession(sessionId, new Date(newExpiryTime).toISOString()),
            ];
          case 1:
            _a.sent();
            // Clear old timers and setup new ones
            this.clearActivityTracking(sessionId);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 2:
            sessionResult = _a.sent();
            if (!(sessionResult.success && sessionResult.data)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.setupSessionTimeoutTracking(sessionResult.data)];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            return [3 /*break*/, 6];
          case 5:
            error_9 = _a.sent();
            console.error("Error extending session timeout:", error_9);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.handleSessionInactivity = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.terminateSession(sessionId, "inactivity")];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_10 = _a.sent();
            console.error("Error handling session inactivity:", error_10);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.clearActivityTracking = function (sessionId) {
    // Clear activity timer
    var activityTimer = this.activityTrackers.get(sessionId);
    if (activityTimer) {
      clearTimeout(activityTimer);
      this.activityTrackers.delete(sessionId);
    }
    // Clear warning timers
    var warning5min = this.sessionWarnings.get("".concat(sessionId, "-5min"));
    if (warning5min) {
      clearTimeout(warning5min);
      this.sessionWarnings.delete("".concat(sessionId, "-5min"));
    }
    var warning1min = this.sessionWarnings.get("".concat(sessionId, "-1min"));
    if (warning1min) {
      clearTimeout(warning1min);
      this.sessionWarnings.delete("".concat(sessionId, "-1min"));
    }
  };
  /**
   * Risk Assessment Methods
   */
  UnifiedSessionSystem.prototype.calculateAuthenticationRisk = function (request, device) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore, distance, hour, recentFailures;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            riskScore = 0;
            // Device trust factor
            if (!device.trusted) {
              riskScore += 0.3;
            }
            // IP address change
            if (device.lastIpAddress && device.lastIpAddress !== request.ipAddress) {
              riskScore += 0.2;
            }
            // Geographic location change (if available)
            if (request.location && device.lastLocation) {
              distance = this.calculateDistance(request.location, device.lastLocation);
              if (distance > 1000) {
                // More than 1000km
                riskScore += 0.3;
              }
            }
            hour = new Date().getHours();
            if (hour < 6 || hour > 22) {
              // Outside normal hours
              riskScore += 0.1;
            }
            return [
              4 /*yield*/,
              this.securityLogger.getRecentFailedAttempts(request.userId, 60 * 60 * 1000),
            ];
          case 1:
            recentFailures = _a.sent();
            if (recentFailures > 3) {
              riskScore += 0.4;
            }
            return [2 /*return*/, Math.min(riskScore, 1.0)]; // Cap at 1.0
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.getRiskFactors = function (request, device) {
    return __awaiter(this, void 0, void 0, function () {
      var factors, distance, hour, recentFailures;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            factors = [];
            if (!device.trusted) factors.push("untrusted_device");
            if (device.lastIpAddress && device.lastIpAddress !== request.ipAddress)
              factors.push("ip_change");
            if (request.location && device.lastLocation) {
              distance = this.calculateDistance(request.location, device.lastLocation);
              if (distance > 1000) factors.push("location_change");
            }
            hour = new Date().getHours();
            if (hour < 6 || hour > 22) factors.push("unusual_time");
            return [
              4 /*yield*/,
              this.securityLogger.getRecentFailedAttempts(request.userId, 60 * 60 * 1000),
            ];
          case 1:
            recentFailures = _a.sent();
            if (recentFailures > 3) factors.push("recent_failures");
            return [2 /*return*/, factors];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.calculateDistance = (loc1, loc2) => {
    var R = 6371; // Earth's radius in kilometers
    var dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    var dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.latitude * Math.PI) / 180) *
        Math.cos((loc2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
  /**
   * Background Services
   */
  UnifiedSessionSystem.prototype.startSecurityMonitoring = function () {
    // Monitor security events every 30 seconds
    this.securityMonitor = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var error_11;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.performSecurityCheck()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_11 = _a.sent();
                console.error("Security monitoring error:", error_11);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        }),
      30 * 1000,
    );
  };
  UnifiedSessionSystem.prototype.startCleanupScheduler = function () {
    // Run cleanup every hour
    this.cleanupScheduler = setInterval(
      () =>
        __awaiter(this, void 0, void 0, function () {
          var error_12;
          return __generator(this, function (_a) {
            switch (_a.label) {
              case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, this.performScheduledCleanup()];
              case 1:
                _a.sent();
                return [3 /*break*/, 3];
              case 2:
                error_12 = _a.sent();
                console.error("Cleanup scheduler error:", error_12);
                return [3 /*break*/, 3];
              case 3:
                return [2 /*return*/];
            }
          });
        }),
      60 * 60 * 1000,
    );
  };
  UnifiedSessionSystem.prototype.performSecurityCheck = function () {
    return __awaiter(this, void 0, void 0, function () {
      var suspiciousEvents, _i, suspiciousEvents_1, event_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, this.securityLogger.detectSuspiciousPatterns()];
          case 1:
            suspiciousEvents = _a.sent();
            (_i = 0), (suspiciousEvents_1 = suspiciousEvents);
            _a.label = 2;
          case 2:
            if (!(_i < suspiciousEvents_1.length)) return [3 /*break*/, 5];
            event_1 = suspiciousEvents_1[_i];
            if (!(event_1.severity === "critical")) return [3 /*break*/, 4];
            // Auto-block user if critical threat detected
            return [
              4 /*yield*/,
              this.handleSecurityThreat({
                userId: event_1.userId,
                threatType: event_1.type,
                severity: event_1.severity,
                details: event_1.details,
              }),
            ];
          case 3:
            // Auto-block user if critical threat detected
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
  UnifiedSessionSystem.prototype.performScheduledCleanup = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              this.cleanupService.performCleanup({
                expiredSessions: true,
                inactiveDevices: true,
                oldSecurityEvents: true,
                retentionDays: this.config.security.retentionDays,
              }),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Public API Methods for Advanced Features
   */
  UnifiedSessionSystem.prototype.authenticateWithTrustedDevice = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceResult;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.deviceManager.getDeviceByFingerprint(request.deviceFingerprint),
            ];
          case 1:
            deviceResult = _b.sent();
            if (
              !deviceResult.success ||
              !((_a = deviceResult.data) === null || _a === void 0 ? void 0 : _a.trusted)
            ) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_NOT_TRUSTED",
                    message: "Device is not trusted for quick authentication",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              this.authenticateUser(
                __assign(__assign({}, request), {
                  deviceInfo: {
                    name: deviceResult.data.name,
                    type: deviceResult.data.type,
                  },
                }),
              ),
            ];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.initiateDeviceTrust = function (deviceId, verificationMethod) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.deviceManager.initiateDeviceTrust(deviceId, verificationMethod)];
      });
    });
  };
  UnifiedSessionSystem.prototype.verifyDeviceTrust = function (deviceId, verificationCode) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.deviceManager.verifyDeviceTrust(deviceId, verificationCode)];
      });
    });
  };
  UnifiedSessionSystem.prototype.revokeExpiredTrust = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        return [2 /*return*/, this.deviceManager.revokeExpiredTrust()];
      });
    });
  };
  UnifiedSessionSystem.prototype.handleSecurityThreat = function (threatData) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionsResult, error_13;
      var _this = this;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            // Log the threat
            return [
              4 /*yield*/,
              this.securityLogger.logEvent({
                userId: threatData.userId,
                type: "security_threat_detected",
                severity: "critical",
                details: threatData,
              }),
            ];
          case 1:
            // Log the threat
            _b.sent();
            if (!(threatData.severity === "critical")) return [3 /*break*/, 4];
            return [4 /*yield*/, this.getUserSessions(threatData.userId)];
          case 2:
            sessionsResult = _b.sent();
            if (
              !(
                sessionsResult.success &&
                ((_a = sessionsResult.data) === null || _a === void 0 ? void 0 : _a.sessions)
              )
            )
              return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              Promise.all(
                sessionsResult.data.sessions.map((session) =>
                  _this.terminateSession(session.id, "security_threat"),
                ),
              ),
            ];
          case 3:
            _b.sent();
            _b.label = 4;
          case 4:
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  action: "user_blocked",
                  severity: threatData.severity,
                  timestamp: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 5:
            error_13 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "THREAT_HANDLING_ERROR",
                  message: "Error handling security threat",
                  details: {
                    error: error_13 instanceof Error ? error_13.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.generateSecurityReport = function (period) {
    return __awaiter(this, void 0, void 0, function () {
      var events, statistics, report, error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.securityLogger.getEventsByDateRange(
                period.startDate.toISOString(),
                period.endDate.toISOString(),
              ),
            ];
          case 1:
            events = _a.sent();
            return [4 /*yield*/, this.securityLogger.getSecurityStatistics(period)];
          case 2:
            statistics = _a.sent();
            report = {
              period: period,
              summary: {
                totalEvents: events.length,
                criticalEvents: events.filter((e) => e.severity === "critical").length,
                highEvents: events.filter((e) => e.severity === "high").length,
                mediumEvents: events.filter((e) => e.severity === "medium").length,
                lowEvents: events.filter((e) => e.severity === "low").length,
              },
              events: events.slice(0, 100), // Limit to 100 most recent
              statistics: statistics,
              generatedAt: new Date().toISOString(),
            };
            return [
              2 /*return*/,
              {
                success: true,
                data: report,
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            error_14 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "REPORT_GENERATION_ERROR",
                  message: "Error generating security report",
                  details: {
                    error: error_14 instanceof Error ? error_14.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.performCleanup = function (config) {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_15;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.cleanupService.performCleanup(config)];
          case 1:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_15 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "CLEANUP_ERROR",
                  message: "Error performing cleanup",
                  details: {
                    error: error_15 instanceof Error ? error_15.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.getSessionMetrics = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var metrics, error_16;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.sessionManager.getSessionMetrics(userId)];
          case 1:
            metrics = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: metrics,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_16 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "METRICS_ERROR",
                  message: "Error retrieving session metrics",
                  details: {
                    error: error_16 instanceof Error ? error_16.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.getDeviceStats = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var stats, error_17;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.deviceManager.getDeviceStats(userId)];
          case 1:
            stats = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: stats,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_17 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_STATS_ERROR",
                  message: "Error retrieving device statistics",
                  details: {
                    error: error_17 instanceof Error ? error_17.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  UnifiedSessionSystem.prototype.getSecurityEvents = function (userId_1) {
    return __awaiter(this, arguments, void 0, function (userId, limit) {
      var events, error_18;
      if (limit === void 0) {
        limit = 50;
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.securityLogger.getUserEvents(userId, limit)];
          case 1:
            events = _a.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: { events: events },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_18 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "SECURITY_EVENTS_ERROR",
                  message: "Error retrieving security events",
                  details: {
                    error: error_18 instanceof Error ? error_18.message : "Unknown error",
                  },
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup and shutdown
   */
  UnifiedSessionSystem.prototype.shutdown = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // Clear all timers
        this.activityTrackers.forEach((timer) => clearTimeout(timer));
        this.sessionWarnings.forEach((timer) => clearTimeout(timer));
        if (this.securityMonitor) {
          clearInterval(this.securityMonitor);
        }
        if (this.cleanupScheduler) {
          clearInterval(this.cleanupScheduler);
        }
        // Clear maps
        this.activityTrackers.clear();
        this.sessionWarnings.clear();
        return [2 /*return*/];
      });
    });
  };
  return UnifiedSessionSystem;
})();
exports.UnifiedSessionSystem = UnifiedSessionSystem;
// Export singleton instance
exports.unifiedSessionSystem = new UnifiedSessionSystem();
// Export factory function for custom configurations
function createUnifiedSessionSystem(config) {
  return new UnifiedSessionSystem(config);
}
