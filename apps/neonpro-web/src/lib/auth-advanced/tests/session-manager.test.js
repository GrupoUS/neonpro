// Session Manager Tests
// Story 1.4: Session Management & Security Implementation
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
var vitest_1 = require("vitest");
var session_manager_1 = require("../session-manager");
var security_monitor_1 = require("../security-monitor");
// Mock dependencies
vitest_1.vi.mock("../security-monitor");
(0, vitest_1.describe)("SessionManager", () => {
  var sessionManager;
  var mockSecurityMonitor;
  var mockConfig;
  (0, vitest_1.beforeEach)(() => {
    mockSecurityMonitor = new security_monitor_1.SecurityMonitor({});
    mockConfig = {
      maxSessions: 5,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      extendThreshold: 5 * 60 * 1000, // 5 minutes
      heartbeatInterval: 60 * 1000, // 1 minute
      requireMFA: false,
      requireTrustedDevice: false,
      allowConcurrentSessions: true,
      trackLocation: true,
      logSecurityEvents: true,
      enableRateLimiting: true,
      maxLoginAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };
    sessionManager = new session_manager_1.SessionManager(mockConfig, mockSecurityMonitor);
  });
  (0, vitest_1.afterEach)(() => {
    vitest_1.vi.clearAllMocks();
  });
  (0, vitest_1.describe)("createSession", () => {
    (0, vitest_1.it)("should create a new session successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              (0, vitest_1.expect)(sessionId).toBeDefined();
              (0, vitest_1.expect)(typeof sessionId).toBe("string");
              (0, vitest_1.expect)(sessionId.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should reject session creation when max sessions exceeded", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, i;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < mockConfig.maxSessions)) return [3 /*break*/, 4];
              return [
                4 /*yield*/,
                sessionManager.createSession(
                  __assign(__assign({}, sessionData), { deviceId: "device".concat(i) }),
                ),
              ];
            case 2:
              _a.sent();
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              // Try to create one more
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(
                  sessionManager.createSession(
                    __assign(__assign({}, sessionData), { deviceId: "deviceExtra" }),
                  ),
                ).rejects.toThrow("Maximum number of sessions exceeded"),
              ];
            case 5:
              // Try to create one more
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should require MFA when configured", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionManager = new session_manager_1.SessionManager(
                __assign(__assign({}, mockConfig), { requireMFA: true }),
                mockSecurityMonitor,
              );
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(sessionManager.createSession(sessionData)).rejects.toThrow(
                  "MFA verification required",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should require trusted device when configured", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionManager = new session_manager_1.SessionManager(
                __assign(__assign({}, mockConfig), { requireTrustedDevice: true }),
                mockSecurityMonitor,
              );
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: false,
                riskScore: 0.2,
                metadata: {},
              };
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(sessionManager.createSession(sessionData)).rejects.toThrow(
                  "Trusted device required",
                ),
              ];
            case 1:
              _a.sent();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("getSession", () => {
    (0, vitest_1.it)("should retrieve an existing session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, retrievedSession;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 2:
              retrievedSession = _a.sent();
              (0, vitest_1.expect)(retrievedSession).toBeDefined();
              (0, vitest_1.expect)(
                retrievedSession === null || retrievedSession === void 0
                  ? void 0
                  : retrievedSession.id,
              ).toBe(sessionId);
              (0, vitest_1.expect)(
                retrievedSession === null || retrievedSession === void 0
                  ? void 0
                  : retrievedSession.userId,
              ).toBe("user123");
              (0, vitest_1.expect)(
                retrievedSession === null || retrievedSession === void 0
                  ? void 0
                  : retrievedSession.isActive,
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should return null for non-existent session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var session;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.getSession("non-existent")];
            case 1:
              session = _a.sent();
              (0, vitest_1.expect)(session).toBeNull();
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should return null for expired session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, session;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              // Mock expired session
              vitest_1.vi
                .spyOn(Date, "now")
                .mockReturnValue(Date.now() + mockConfig.sessionTimeout + 1000);
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 2:
              session = _a.sent();
              (0, vitest_1.expect)(session).toBeNull();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("updateActivity", () => {
    (0, vitest_1.it)("should update session activity", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, originalSession, success, updatedSession;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 2:
              originalSession = _a.sent();
              // Wait a bit
              return [4 /*yield*/, new Promise((resolve) => setTimeout(resolve, 100))];
            case 3:
              // Wait a bit
              _a.sent();
              return [4 /*yield*/, sessionManager.updateActivity(sessionId)];
            case 4:
              success = _a.sent();
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 5:
              updatedSession = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              (0, vitest_1.expect)(
                updatedSession === null || updatedSession === void 0
                  ? void 0
                  : updatedSession.lastActivity.getTime(),
              ).toBeGreaterThan(originalSession.lastActivity.getTime());
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should return false for non-existent session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.updateActivity("non-existent")];
            case 1:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("extendSession", () => {
    (0, vitest_1.it)("should extend session when near expiration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, success;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              // Mock time near expiration
              vitest_1.vi
                .spyOn(Date, "now")
                .mockReturnValue(
                  Date.now() + mockConfig.sessionTimeout - mockConfig.extendThreshold + 1000,
                );
              return [4 /*yield*/, sessionManager.extendSession(sessionId, 30 * 60 * 1000)];
            case 2:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should not extend session when not near expiration", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, success;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [4 /*yield*/, sessionManager.extendSession(sessionId, 30 * 60 * 1000)];
            case 2:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("terminateSession", () => {
    (0, vitest_1.it)("should terminate an active session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, success, session;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [4 /*yield*/, sessionManager.terminateSession(sessionId, "user_logout")];
            case 2:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 3:
              session = _a.sent();
              (0, vitest_1.expect)(
                session === null || session === void 0 ? void 0 : session.isActive,
              ).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should return false for non-existent session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.terminateSession("non-existent", "user_logout")];
            case 1:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("validateSession", () => {
    (0, vitest_1.it)("should validate an active session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, isValid;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [
                4 /*yield*/,
                sessionManager.validateSession(sessionId, "192.168.1.1", "Mozilla/5.0"),
              ];
            case 2:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should invalidate session with mismatched IP", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, isValid;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [
                4 /*yield*/,
                sessionManager.validateSession(
                  sessionId,
                  "192.168.1.2", // Different IP
                  "Mozilla/5.0",
                ),
              ];
            case 2:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, vitest_1.it)("should invalidate session with mismatched user agent", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, isValid;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              return [
                4 /*yield*/,
                sessionManager.validateSession(
                  sessionId,
                  "192.168.1.1",
                  "Chrome/91.0", // Different user agent
                ),
              ];
            case 2:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(false);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("getSessionMetrics", () => {
    (0, vitest_1.it)("should return session metrics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var metrics;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, sessionManager.getSessionMetrics("user123", "7d")];
            case 1:
              metrics = _a.sent();
              (0, vitest_1.expect)(metrics).toBeDefined();
              (0, vitest_1.expect)(typeof metrics.totalSessions).toBe("number");
              (0, vitest_1.expect)(typeof metrics.activeSessions).toBe("number");
              (0, vitest_1.expect)(typeof metrics.averageDuration).toBe("number");
              (0, vitest_1.expect)(Array.isArray(metrics.securityEvents)).toBe(true);
              (0, vitest_1.expect)(Array.isArray(metrics.deviceCount)).toBe(true);
              (0, vitest_1.expect)(Array.isArray(metrics.locationData)).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, vitest_1.describe)("cleanupExpiredSessions", () => {
    (0, vitest_1.it)("should cleanup expired sessions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, sessionId, cleanedCount, session;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user123",
                userRole: "user",
                deviceId: "device123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                mfaVerified: false,
                deviceTrusted: true,
                riskScore: 0.2,
                metadata: {},
              };
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              sessionId = _a.sent();
              // Mock expired time
              vitest_1.vi
                .spyOn(Date, "now")
                .mockReturnValue(Date.now() + mockConfig.sessionTimeout + 1000);
              return [4 /*yield*/, sessionManager.cleanupExpiredSessions()];
            case 2:
              cleanedCount = _a.sent();
              (0, vitest_1.expect)(cleanedCount).toBeGreaterThan(0);
              return [4 /*yield*/, sessionManager.getSession(sessionId)];
            case 3:
              session = _a.sent();
              (0, vitest_1.expect)(session).toBeNull();
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
