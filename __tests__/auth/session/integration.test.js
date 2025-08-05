/**
 * Session Management System - Integration Tests
 *
 * Comprehensive integration test suite for the complete session management system,
 * testing interactions between SessionManager, DeviceManager, and SecurityEventLogger.
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
var globals_1 = require("@jest/globals");
var UnifiedSessionSystem_1 = require("../../../lib/auth/session/UnifiedSessionSystem");
var SessionManager_1 = require("../../../lib/auth/session/SessionManager");
var DeviceManager_1 = require("../../../lib/auth/session/DeviceManager");
var SecurityEventLogger_1 = require("../../../lib/auth/session/SecurityEventLogger");
var setup_1 = require("./setup");
// Mock Supabase with comprehensive responses
var mockSupabase = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
        maybeSingle: globals_1.jest.fn(),
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(),
        })),
      })),
      in: globals_1.jest.fn(() => ({
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(),
        })),
      })),
      gte: globals_1.jest.fn(() => ({
        lte: globals_1.jest.fn(() => ({
          order: globals_1.jest.fn(() => ({
            limit: globals_1.jest.fn(),
          })),
        })),
      })),
    })),
    insert: globals_1.jest.fn(() => ({
      select: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
      })),
    })),
    update: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        select: globals_1.jest.fn(() => ({
          single: globals_1.jest.fn(),
        })),
      })),
      in: globals_1.jest.fn(() => ({
        select: globals_1.jest.fn(),
      })),
    })),
    delete: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(),
      in: globals_1.jest.fn(),
      lt: globals_1.jest.fn(),
    })),
  })),
  rpc: globals_1.jest.fn(),
  auth: {
    getUser: globals_1.jest.fn(),
    signOut: globals_1.jest.fn(),
  },
};
globals_1.jest.mock("@supabase/supabase-js", () => ({
  createClient: globals_1.jest.fn(() => mockSupabase),
}));
(0, globals_1.describe)("Session Management System - Integration Tests", () => {
  var unifiedSystem;
  var _sessionManager;
  var _deviceManager;
  var _securityLogger;
  var testDb;
  var testUser;
  (0, globals_1.beforeEach)(() => {
    testDb = (0, setup_1.createTestDatabase)();
    var seedData = testDb.seed();
    testUser = seedData.user;
    var sessionConfig = {
      maxSessions: 5,
      sessionTimeout: 24 * 60 * 60 * 1000,
      inactivityTimeout: 30 * 60 * 1000,
      extendOnActivity: true,
      requireDeviceVerification: true,
      allowConcurrentSessions: true,
      secureMode: false,
      cookieSettings: {
        name: "session_token",
        secure: false,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    };
    var deviceConfig = {
      maxDevicesPerUser: 10,
      trustDuration: 30 * 24 * 60 * 60 * 1000,
      requireVerification: true,
      autoTrustSameNetwork: true,
      blockSuspiciousDevices: true,
      fingerprintAlgorithm: "sha256",
      trackingEnabled: true,
    };
    var securityConfig = {
      enableLogging: true,
      logLevel: "info",
      retentionDays: 90,
      alertThresholds: {
        failedLogins: 5,
        suspiciousActivity: 3,
        rateLimit: 10,
      },
      autoBlock: {
        enabled: true,
        threshold: 10,
        duration: 24 * 60 * 60 * 1000,
      },
      notifications: {
        enabled: true,
        channels: ["email", "push"],
        severity: "medium",
      },
    };
    _sessionManager = new SessionManager_1.SessionManager(sessionConfig);
    _deviceManager = new DeviceManager_1.DeviceManager(deviceConfig);
    _securityLogger = new SecurityEventLogger_1.SecurityEventLogger(securityConfig);
    unifiedSystem = new UnifiedSessionSystem_1.UnifiedSessionSystem({
      session: sessionConfig,
      device: deviceConfig,
      security: securityConfig,
    });
  });
  (0, globals_1.afterEach)(() => {
    (0, setup_1.cleanup)();
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Complete Authentication Flow", () => {
    (0, globals_1.it)("should handle complete login flow with device registration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var loginData, mockDevice, mockSession, mockSecurityEvent, result;
        var _a, _b, _c;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              loginData = {
                userId: testUser.id,
                ipAddress: "192.168.1.100",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                deviceInfo: {
                  name: "Windows Desktop",
                  type: "desktop",
                  screen: { width: 1920, height: 1080 },
                  timezone: "America/New_York",
                  language: "en-US",
                },
              };
              mockDevice = (0, setup_1.createMockDevice)({
                userId: loginData.userId,
                name: loginData.deviceInfo.name,
                type: loginData.deviceInfo.type,
                userAgent: loginData.userAgent,
              });
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockResolvedValueOnce({
                  data: null,
                  error: { code: "PGRST116" }, // Device not found
                });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockDevice,
                error: null,
              });
              mockSession = (0, setup_1.createMockSession)({
                userId: loginData.userId,
                deviceId: mockDevice.id,
                ipAddress: loginData.ipAddress,
                userAgent: loginData.userAgent,
              });
              mockSupabase.from().select().eq().mockResolvedValueOnce({
                data: [], // No existing sessions
                error: null,
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockSession,
                error: null,
              });
              mockSecurityEvent = (0, setup_1.createMockSecurityEvent)({
                userId: loginData.userId,
                sessionId: mockSession.id,
                deviceId: mockDevice.id,
                type: "login_attempt",
                details: { success: true },
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockSecurityEvent,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.authenticateUser(loginData)];
            case 1:
              result = _d.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.session,
              ).toBeDefined();
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.device,
              ).toBeDefined();
              (0, globals_1.expect)(
                (_c = result.data) === null || _c === void 0 ? void 0 : _c.token,
              ).toBeDefined();
              // Verify all components were called
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("devices");
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("sessions");
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("security_events");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle trusted device login", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var trustedDevice, loginData, mockSession, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              trustedDevice = (0, setup_1.createMockDevice)({
                userId: testUser.id,
                trusted: true,
                trustExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              });
              loginData = {
                userId: testUser.id,
                deviceFingerprint: trustedDevice.fingerprint,
                ipAddress: "192.168.1.100",
                userAgent: trustedDevice.userAgent,
              };
              // Mock trusted device lookup
              mockSupabase.from().select().eq().single.mockResolvedValueOnce({
                data: trustedDevice,
                error: null,
              });
              mockSession = (0, setup_1.createMockSession)({
                userId: loginData.userId,
                deviceId: trustedDevice.id,
                ipAddress: loginData.ipAddress,
                userAgent: loginData.userAgent,
              });
              mockSupabase.from().select().eq().mockResolvedValueOnce({
                data: [],
                error: null,
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.authenticateWithTrustedDevice(loginData)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.requiresVerification,
              ).toBe(false);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.session,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle suspicious login attempt", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var suspiciousLoginData, suspiciousDevice, securityEvent, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              suspiciousLoginData = {
                userId: testUser.id,
                ipAddress: "1.2.3.4", // Different country IP
                userAgent: "Suspicious Bot/1.0",
                deviceInfo: {
                  name: "Unknown Device",
                  type: "unknown",
                },
              };
              suspiciousDevice = (0, setup_1.createMockDevice)({
                userId: suspiciousLoginData.userId,
                name: suspiciousLoginData.deviceInfo.name,
                type: suspiciousLoginData.deviceInfo.type,
                userAgent: suspiciousLoginData.userAgent,
                blocked: true,
                blockedReason: "Suspicious activity detected",
              });
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockResolvedValueOnce({
                  data: null,
                  error: { code: "PGRST116" },
                });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: suspiciousDevice,
                error: null,
              });
              securityEvent = (0, setup_1.createMockSecurityEvent)({
                userId: suspiciousLoginData.userId,
                type: "suspicious_activity",
                severity: "high",
                details: {
                  reason: "Unusual location and user agent",
                  ipAddress: suspiciousLoginData.ipAddress,
                  userAgent: suspiciousLoginData.userAgent,
                },
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: securityEvent,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.authenticateUser(suspiciousLoginData)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("DEVICE_BLOCKED");
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.securityEvent,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Lifecycle Management", () => {
    (0, globals_1.it)("should handle session activity updates", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var activeSession, updatedSession, activityEvent, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              activeSession = (0, setup_1.createMockSession)({
                userId: testUser.id,
                status: "active",
              });
              // Mock session validation
              mockSupabase.from().select().eq().single.mockResolvedValueOnce({
                data: activeSession,
                error: null,
              });
              updatedSession = __assign(__assign({}, activeSession), {
                lastActivity: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
                data: updatedSession,
                error: null,
              });
              activityEvent = (0, setup_1.createMockSecurityEvent)({
                userId: testUser.id,
                sessionId: activeSession.id,
                type: "session_activity",
                severity: "low",
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: activityEvent,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.updateSessionActivity(activeSession.id)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.session.lastActivity,
              ).toBeDefined();
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.securityEvent,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle session termination with cleanup", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var activeSession, terminatedSession, logoutEvent, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              activeSession = (0, setup_1.createMockSession)({
                userId: testUser.id,
                status: "active",
              });
              terminatedSession = __assign(__assign({}, activeSession), {
                status: "terminated",
                terminatedAt: new Date().toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
                data: terminatedSession,
                error: null,
              });
              logoutEvent = (0, setup_1.createMockSecurityEvent)({
                userId: testUser.id,
                sessionId: activeSession.id,
                type: "logout",
                severity: "low",
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: logoutEvent,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.terminateSession(activeSession.id, "user_logout")];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.session.status,
              ).toBe("terminated");
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.securityEvent.type,
              ).toBe("logout");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle bulk session cleanup", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var expiredSessions, cleanupEvent, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              expiredSessions = [
                (0, setup_1.createMockSession)({
                  id: "expired-1",
                  userId: testUser.id,
                  expiresAt: new Date(Date.now() - 60000).toISOString(),
                }),
                (0, setup_1.createMockSession)({
                  id: "expired-2",
                  userId: testUser.id,
                  expiresAt: new Date(Date.now() - 120000).toISOString(),
                }),
              ];
              // Mock expired session query
              mockSupabase.from().select().mockResolvedValueOnce({
                data: expiredSessions,
                error: null,
              });
              // Mock bulk session deletion
              mockSupabase.from().delete().in().mockResolvedValueOnce({
                data: null,
                error: null,
              });
              cleanupEvent = (0, setup_1.createMockSecurityEvent)({
                userId: "system",
                type: "session_cleanup",
                severity: "low",
                details: { cleanedCount: 2 },
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: cleanupEvent,
                error: null,
              });
              return [
                4 /*yield*/,
                unifiedSystem.performCleanup({
                  expiredSessions: true,
                  inactiveDevices: false,
                  oldSecurityEvents: false,
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.sessionsCleanedCount,
              ).toBe(2);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Device Trust Workflow", () => {
    (0, globals_1.it)("should handle device trust verification process", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var untrustedDevice,
          verificationCode,
          verificationResult,
          trustedDevice,
          trustEvent,
          trustResult;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              untrustedDevice = (0, setup_1.createMockDevice)({
                userId: testUser.id,
                trusted: false,
              });
              verificationCode = "123456";
              // Mock device trust initiation
              mockSupabase.from().select().eq().single.mockResolvedValueOnce({
                data: untrustedDevice,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.initiateDeviceTrust(untrustedDevice.id, "email")];
            case 1:
              verificationResult = _c.sent();
              (0, globals_1.expect)(verificationResult.success).toBe(true);
              (0, globals_1.expect)(
                (_a = verificationResult.data) === null || _a === void 0
                  ? void 0
                  : _a.verificationMethod,
              ).toBe("email");
              trustedDevice = __assign(__assign({}, untrustedDevice), {
                trusted: true,
                trustExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValueOnce({
                data: trustedDevice,
                error: null,
              });
              trustEvent = (0, setup_1.createMockSecurityEvent)({
                userId: testUser.id,
                deviceId: untrustedDevice.id,
                type: "device_trusted",
                severity: "medium",
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: trustEvent,
                error: null,
              });
              return [
                4 /*yield*/,
                unifiedSystem.verifyDeviceTrust(untrustedDevice.id, verificationCode),
              ];
            case 2:
              trustResult = _c.sent();
              (0, globals_1.expect)(trustResult.success).toBe(true);
              (0, globals_1.expect)(
                (_b = trustResult.data) === null || _b === void 0 ? void 0 : _b.device.trusted,
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle automatic trust revocation", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var expiredTrustDevice, revokedDevice, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              expiredTrustDevice = (0, setup_1.createMockDevice)({
                userId: testUser.id,
                trusted: true,
                trustExpiresAt: new Date(Date.now() - 60000).toISOString(), // Expired
              });
              // Mock expired trust detection
              mockSupabase
                .from()
                .select()
                .mockResolvedValueOnce({
                  data: [expiredTrustDevice],
                  error: null,
                });
              revokedDevice = __assign(__assign({}, expiredTrustDevice), {
                trusted: false,
                trustExpiresAt: null,
              });
              mockSupabase
                .from()
                .update()
                .in()
                .mockResolvedValueOnce({
                  data: [revokedDevice],
                  error: null,
                });
              return [4 /*yield*/, unifiedSystem.revokeExpiredTrust()];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.revokedCount,
              ).toBe(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Security Monitoring Integration", () => {
    (0, globals_1.it)("should detect and respond to security threats", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var threatData, threatEvents, blockEvent, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              threatData = {
                userId: testUser.id,
                ipAddress: "1.2.3.4",
                userAgent: "Malicious Bot/1.0",
                attempts: 10,
              };
              threatEvents = Array.from({ length: 10 }, (_, _i) =>
                (0, setup_1.createMockSecurityEvent)({
                  userId: threatData.userId,
                  type: "unauthorized_access",
                  severity: "high",
                  ipAddress: threatData.ipAddress,
                }),
              );
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValueOnce({
                data: threatEvents,
                error: null,
              });
              blockEvent = (0, setup_1.createMockSecurityEvent)({
                userId: threatData.userId,
                type: "user_blocked",
                severity: "critical",
                details: { reason: "Automated threat response" },
              });
              mockSupabase.from().insert().select().single.mockResolvedValueOnce({
                data: blockEvent,
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.handleSecurityThreat(threatData)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.action,
              ).toBe("user_blocked");
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.severity,
              ).toBe("critical");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate security reports", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var reportPeriod, securityEvents, result;
        var _a, _b, _c;
        return __generator(this, (_d) => {
          switch (_d.label) {
            case 0:
              reportPeriod = {
                startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                endDate: new Date(),
              };
              securityEvents = [
                (0, setup_1.createMockSecurityEvent)({ type: "login_attempt", severity: "low" }),
                (0, setup_1.createMockSecurityEvent)({
                  type: "suspicious_activity",
                  severity: "high",
                }),
                (0, setup_1.createMockSecurityEvent)({
                  type: "device_registered",
                  severity: "medium",
                }),
              ];
              mockSupabase.from().select().gte().lte().order().limit.mockResolvedValueOnce({
                data: securityEvents,
                error: null,
              });
              // Mock statistics
              mockSupabase.rpc.mockResolvedValueOnce({
                data: {
                  totalEvents: 150,
                  highSeverityEvents: 25,
                  blockedAttempts: 10,
                  newDevices: 5,
                },
                error: null,
              });
              return [4 /*yield*/, unifiedSystem.generateSecurityReport(reportPeriod)];
            case 1:
              result = _d.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.summary,
              ).toBeDefined();
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.events,
              ).toHaveLength(3);
              (0, globals_1.expect)(
                (_c = result.data) === null || _c === void 0 ? void 0 : _c.statistics,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Performance and Scalability", () => {
    (0, globals_1.it)("should handle concurrent session operations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var concurrentOperations, i, results;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              concurrentOperations = Array.from({ length: 10 }, (_, i) =>
                unifiedSystem.authenticateUser({
                  userId: "user-".concat(i),
                  ipAddress: "192.168.1.".concat(i + 100),
                  userAgent: "Test Browser",
                  deviceInfo: {
                    name: "Device ".concat(i),
                    type: "desktop",
                  },
                }),
              );
              // Mock concurrent responses
              for (i = 0; i < 10; i++) {
                mockSupabase
                  .from()
                  .select()
                  .eq()
                  .single.mockResolvedValueOnce({
                    data: null,
                    error: { code: "PGRST116" },
                  });
                mockSupabase
                  .from()
                  .insert()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: (0, setup_1.createMockDevice)({ userId: "user-".concat(i) }),
                    error: null,
                  });
                mockSupabase.from().select().eq().mockResolvedValueOnce({
                  data: [],
                  error: null,
                });
                mockSupabase
                  .from()
                  .insert()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: (0, setup_1.createMockSession)({ userId: "user-".concat(i) }),
                    error: null,
                  });
                mockSupabase
                  .from()
                  .insert()
                  .select()
                  .single.mockResolvedValueOnce({
                    data: (0, setup_1.createMockSecurityEvent)({ userId: "user-".concat(i) }),
                    error: null,
                  });
              }
              return [4 /*yield*/, Promise.all(concurrentOperations)];
            case 1:
              results = _a.sent();
              (0, globals_1.expect)(results).toHaveLength(10);
              (0, globals_1.expect)(results.every((result) => result.success)).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should maintain performance under load", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startTime, operations, endTime, duration;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startTime = Date.now();
              operations = [
                unifiedSystem.validateSession("test-token"),
                unifiedSystem.updateSessionActivity("session-123"),
                unifiedSystem.getUserSessions(testUser.id),
                unifiedSystem.getDeviceStats(testUser.id),
                unifiedSystem.getSecurityEvents(testUser.id),
              ];
              // Mock all responses
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockResolvedValue({
                  data: (0, setup_1.createMockSession)(),
                  error: null,
                });
              mockSupabase
                .from()
                .update()
                .eq()
                .select()
                .single.mockResolvedValue({
                  data: (0, setup_1.createMockSession)(),
                  error: null,
                });
              mockSupabase
                .from()
                .select()
                .eq()
                .order()
                .limit.mockResolvedValue({
                  data: [(0, setup_1.createMockSession)()],
                  error: null,
                });
              mockSupabase.rpc.mockResolvedValue({
                data: { total: 5, trusted: 3, blocked: 0 },
                error: null,
              });
              mockSupabase
                .from()
                .select()
                .eq()
                .order()
                .limit.mockResolvedValue({
                  data: [(0, setup_1.createMockSecurityEvent)()],
                  error: null,
                });
              return [4 /*yield*/, Promise.all(operations)];
            case 1:
              _a.sent();
              endTime = Date.now();
              duration = endTime - startTime;
              (0, globals_1.expect)(duration).toBeLessThan(2000); // Should complete within 2 seconds
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
