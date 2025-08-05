/**
 * SessionManager Unit Tests
 *
 * Comprehensive test suite for the SessionManager class,
 * covering session creation, validation, cleanup, and security features.
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
var SessionManager_1 = require("../../../lib/auth/session/SessionManager");
var setup_1 = require("./setup");
// Mock Supabase
var mockSupabase = {
  from: globals_1.jest.fn(() => ({
    select: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(() => ({
        single: globals_1.jest.fn(),
        maybeSingle: globals_1.jest.fn(),
      })),
      in: globals_1.jest.fn(() => ({
        order: globals_1.jest.fn(() => ({
          limit: globals_1.jest.fn(),
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
    })),
    delete: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(),
    })),
  })),
  rpc: globals_1.jest.fn(),
};
globals_1.jest.mock("@supabase/supabase-js", () => ({
  createClient: globals_1.jest.fn(() => mockSupabase),
}));
(0, globals_1.describe)("SessionManager", () => {
  var sessionManager;
  var _testDb;
  var mockConfig;
  (0, globals_1.beforeEach)(() => {
    _testDb = (0, setup_1.createTestDatabase)();
    mockConfig = {
      maxSessions: 5,
      sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      extendOnActivity: true,
      requireDeviceVerification: false,
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
    sessionManager = new SessionManager_1.SessionManager(mockConfig);
  });
  (0, globals_1.afterEach)(() => {
    (0, setup_1.cleanup)();
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Session Creation", () => {
    (0, globals_1.it)("should create a new session successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, mockSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user-123",
                deviceId: "device-123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              mockSession = (0, setup_1.createMockSession)(sessionData);
              // Mock Supabase response
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject({
                userId: sessionData.userId,
                deviceId: sessionData.deviceId,
                status: "active",
              });
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("sessions");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should generate unique session tokens", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, tokens, i, mockSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              sessionData = {
                userId: "user-123",
                deviceId: "device-123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              tokens = new Set();
              i = 0;
              _a.label = 1;
            case 1:
              if (!(i < 10)) return [3 /*break*/, 4];
              mockSession = (0, setup_1.createMockSession)(
                __assign(__assign({}, sessionData), { id: "session-".concat(i) }),
              );
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 2:
              result = _a.sent();
              if (result.success && result.token) {
                tokens.add(result.token);
              }
              _a.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              (0, globals_1.expect)(tokens.size).toBe(10); // All tokens should be unique
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should enforce maximum session limit", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, existingSessions, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              sessionData = {
                userId: "user-123",
                deviceId: "device-123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              existingSessions = Array.from({ length: 5 }, (_, i) =>
                (0, setup_1.createMockSession)(
                  __assign(__assign({}, sessionData), { id: "session-".concat(i) }),
                ),
              );
              mockSupabase.from().select().eq().mockResolvedValue({
                data: existingSessions,
                error: null,
              });
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("SESSION_LIMIT_EXCEEDED");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Validation", () => {
    (0, globals_1.it)("should validate active session successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSession = (0, setup_1.createMockSession)({
                status: "active",
                expiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
              });
              mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.validateSession("valid-token")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.valid).toBe(true);
              (0, globals_1.expect)(result.session).toMatchObject(mockSession);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should reject expired session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSession = (0, setup_1.createMockSession)({
                status: "active",
                expiresAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
              });
              mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.validateSession("expired-token")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.valid).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("expired");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should reject inactive session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSession = (0, setup_1.createMockSession)({
                status: "inactive",
                expiresAt: new Date(Date.now() + 60000).toISOString(),
              });
              mockSupabase.from().select().eq().single.mockResolvedValue({
                data: mockSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.validateSession("inactive-token")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.valid).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("inactive");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle non-existent session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase
                .from()
                .select()
                .eq()
                .single.mockResolvedValue({
                  data: null,
                  error: { code: "PGRST116" }, // Not found
                });
              return [4 /*yield*/, sessionManager.validateSession("non-existent-token")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.valid).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("not_found");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Updates", () => {
    (0, globals_1.it)("should update session activity", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSession, updatedSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSession = (0, setup_1.createMockSession)();
              updatedSession = __assign(__assign({}, mockSession), {
                lastActivity: new Date().toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: updatedSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.updateActivity("session-123")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  lastActivity: globals_1.expect.any(String),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should extend session expiration on activity", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSession, futureExpiration, updatedSession, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSession = (0, setup_1.createMockSession)();
              futureExpiration = new Date(Date.now() + mockConfig.sessionTimeout).toISOString();
              updatedSession = __assign(__assign({}, mockSession), {
                expiresAt: futureExpiration,
                lastActivity: new Date().toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: updatedSession,
                error: null,
              });
              return [4 /*yield*/, sessionManager.updateActivity("session-123")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  expiresAt: globals_1.expect.any(String),
                  lastActivity: globals_1.expect.any(String),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Termination", () => {
    (0, globals_1.it)("should terminate single session", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockSupabase
                .from()
                .update()
                .eq()
                .select()
                .single.mockResolvedValue({
                  data: __assign(__assign({}, (0, setup_1.createMockSession)()), {
                    status: "terminated",
                  }),
                  error: null,
                });
              return [4 /*yield*/, sessionManager.terminateSession("session-123")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(mockSupabase.from().update).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  status: "terminated",
                  terminatedAt: globals_1.expect.any(String),
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should terminate all user sessions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockSessions, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockSessions = [
                (0, setup_1.createMockSession)({ id: "session-1" }),
                (0, setup_1.createMockSession)({ id: "session-2" }),
                (0, setup_1.createMockSession)({ id: "session-3" }),
              ];
              mockSupabase.from().select().eq().mockResolvedValue({
                data: mockSessions,
                error: null,
              });
              mockSupabase
                .from()
                .update()
                .in()
                .mockResolvedValue({
                  data: mockSessions.map((s) =>
                    __assign(__assign({}, s), { status: "terminated" }),
                  ),
                  error: null,
                });
              return [4 /*yield*/, sessionManager.terminateAllSessions("user-123")];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.terminatedCount,
              ).toBe(3);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Cleanup", () => {
    (0, globals_1.it)("should clean up expired sessions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var expiredSessions, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              expiredSessions = [
                (0, setup_1.createMockSession)({
                  id: "expired-1",
                  expiresAt: new Date(Date.now() - 60000).toISOString(),
                }),
                (0, setup_1.createMockSession)({
                  id: "expired-2",
                  expiresAt: new Date(Date.now() - 120000).toISOString(),
                }),
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: expiredSessions,
                error: null,
              });
              mockSupabase.from().delete().eq().mockResolvedValue({
                data: null,
                error: null,
              });
              return [4 /*yield*/, sessionManager.cleanupExpiredSessions()];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.cleanedCount,
              ).toBe(2);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should clean up inactive sessions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var inactiveSessions, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              inactiveSessions = [
                (0, setup_1.createMockSession)({
                  id: "inactive-1",
                  lastActivity: new Date(
                    Date.now() - mockConfig.inactivityTimeout - 60000,
                  ).toISOString(),
                }),
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: inactiveSessions,
                error: null,
              });
              mockSupabase
                .from()
                .update()
                .in()
                .mockResolvedValue({
                  data: inactiveSessions.map((s) =>
                    __assign(__assign({}, s), { status: "inactive" }),
                  ),
                  error: null,
                });
              return [4 /*yield*/, sessionManager.cleanupInactiveSessions()];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.inactiveCount,
              ).toBe(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Session Queries", () => {
    (0, globals_1.it)("should get user sessions", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var userSessions, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              userSessions = [
                (0, setup_1.createMockSession)({ id: "session-1", userId: "user-123" }),
                (0, setup_1.createMockSession)({ id: "session-2", userId: "user-123" }),
              ];
              mockSupabase.from().select().eq().order().limit.mockResolvedValue({
                data: userSessions,
                error: null,
              });
              return [4 /*yield*/, sessionManager.getUserSessions("user-123")];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toHaveLength(2);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a[0].userId,
              ).toBe("user-123");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should get session statistics", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockStats, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              mockStats = {
                total: 100,
                active: 85,
                inactive: 10,
                expired: 5,
              };
              mockSupabase.rpc.mockResolvedValue({
                data: mockStats,
                error: null,
              });
              return [4 /*yield*/, sessionManager.getSessionStats()];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject(mockStats);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Error Handling", () => {
    (0, globals_1.it)("should handle database errors gracefully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              mockSupabase
                .from()
                .insert()
                .select()
                .single.mockResolvedValue({
                  data: null,
                  error: { message: "Database connection failed" },
                });
              return [
                4 /*yield*/,
                sessionManager.createSession({
                  userId: "user-123",
                  deviceId: "device-123",
                  ipAddress: "192.168.1.1",
                  userAgent: "Mozilla/5.0...",
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.message,
              ).toContain("Database connection failed");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should handle invalid input data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              return [
                4 /*yield*/,
                sessionManager.createSession({
                  userId: "", // Invalid empty userId
                  deviceId: "device-123",
                  ipAddress: "192.168.1.1",
                  userAgent: "Mozilla/5.0...",
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("VALIDATION_ERROR");
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Security Features", () => {
    (0, globals_1.it)("should detect suspicious activity patterns", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var sessionData, i, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              sessionData = {
                userId: "user-123",
                deviceId: "device-123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              i = 0;
              _b.label = 1;
            case 1:
              if (!(i < 10)) return [3 /*break*/, 4];
              mockSupabase
                .from()
                .insert()
                .select()
                .single.mockResolvedValue({
                  data: null,
                  error: { code: "RATE_LIMIT_EXCEEDED" },
                });
              return [4 /*yield*/, sessionManager.createSession(sessionData)];
            case 2:
              result = _b.sent();
              if (i > 5) {
                // After 5 attempts, should be rate limited
                (0, globals_1.expect)(result.success).toBe(false);
                (0, globals_1.expect)(
                  (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
                ).toBe("RATE_LIMIT_EXCEEDED");
              }
              _b.label = 3;
            case 3:
              i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should validate session token format", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidTokens, _i, invalidTokens_1, token, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              invalidTokens = [
                "", // Empty
                "short", // Too short
                "invalid-format-token", // Invalid format
                null, // Null
                undefined, // Undefined
              ];
              (_i = 0), (invalidTokens_1 = invalidTokens);
              _a.label = 1;
            case 1:
              if (!(_i < invalidTokens_1.length)) return [3 /*break*/, 4];
              token = invalidTokens_1[_i];
              return [4 /*yield*/, sessionManager.validateSession(token)];
            case 2:
              result = _a.sent();
              (0, globals_1.expect)(result.valid).toBe(false);
              (0, globals_1.expect)(result.reason).toBe("invalid_token");
              _a.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
