/**
 * SecurityEventLogger Unit Tests
 *
 * Comprehensive test suite for the SecurityEventLogger class,
 * covering event logging, analysis, and security monitoring features.
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
var SecurityEventLogger_1 = require("../../../lib/auth/session/SecurityEventLogger");
var setup_1 = require("./setup");
// Mock Supabase
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
    })),
    delete: globals_1.jest.fn(() => ({
      eq: globals_1.jest.fn(),
      lt: globals_1.jest.fn(),
    })),
  })),
  rpc: globals_1.jest.fn(),
};
globals_1.jest.mock("@supabase/supabase-js", () => ({
  createClient: globals_1.jest.fn(() => mockSupabase),
}));
(0, globals_1.describe)("SecurityEventLogger", () => {
  var securityLogger;
  var _testDb;
  var mockConfig;
  (0, globals_1.beforeEach)(() => {
    _testDb = (0, setup_1.createTestDatabase)();
    mockConfig = {
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
        duration: 24 * 60 * 60 * 1000, // 24 hours
      },
      notifications: {
        enabled: true,
        channels: ["email", "push"],
        severity: "medium",
      },
    };
    securityLogger = new SecurityEventLogger_1.SecurityEventLogger(mockConfig);
  });
  (0, globals_1.afterEach)(() => {
    (0, setup_1.cleanup)();
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Event Logging", () => {
    (0, globals_1.it)("should log security event successfully", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var eventData, mockEvent, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              eventData = {
                userId: "user-123",
                sessionId: "session-123",
                deviceId: "device-123",
                type: "login_attempt",
                severity: "medium",
                description: "User login attempt",
                details: {
                  ipAddress: "192.168.1.1",
                  userAgent: "Mozilla/5.0...",
                  success: true,
                },
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              mockEvent = (0, setup_1.createMockSecurityEvent)(eventData);
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockEvent,
                error: null,
              });
              return [4 /*yield*/, securityLogger.logEvent(eventData)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject({
                userId: eventData.userId,
                type: eventData.type,
                severity: eventData.severity,
              });
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("security_events");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should log different event types", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var eventTypes, _i, eventTypes_1, type, eventData, mockEvent, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              eventTypes = [
                "login_attempt",
                "logout",
                "password_change",
                "device_registered",
                "suspicious_activity",
                "rate_limit_exceeded",
                "session_expired",
                "unauthorized_access",
              ];
              (_i = 0), (eventTypes_1 = eventTypes);
              _b.label = 1;
            case 1:
              if (!(_i < eventTypes_1.length)) return [3 /*break*/, 4];
              type = eventTypes_1[_i];
              eventData = {
                userId: "user-123",
                type: type,
                severity: "medium",
                description: "Test ".concat(type, " event"),
                details: {},
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              };
              mockEvent = (0, setup_1.createMockSecurityEvent)(
                __assign(__assign({}, eventData), { type: type }),
              );
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockEvent,
                error: null,
              });
              return [4 /*yield*/, securityLogger.logEvent(eventData)];
            case 2:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.type,
              ).toBe(type);
              _b.label = 3;
            case 3:
              _i++;
              return [3 /*break*/, 1];
            case 4:
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should assign correlation IDs to related events", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var correlationId, events, _i, events_1, eventData, mockEvent, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              correlationId = "correlation-123";
              events = [
                {
                  userId: "user-123",
                  type: "login_attempt",
                  severity: "low",
                  description: "Login started",
                  correlationId: correlationId,
                },
                {
                  userId: "user-123",
                  type: "device_registered",
                  severity: "medium",
                  description: "Device registered during login",
                  correlationId: correlationId,
                },
              ];
              (_i = 0), (events_1 = events);
              _b.label = 1;
            case 1:
              if (!(_i < events_1.length)) return [3 /*break*/, 4];
              eventData = events_1[_i];
              mockEvent = (0, setup_1.createMockSecurityEvent)(eventData);
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockEvent,
                error: null,
              });
              return [4 /*yield*/, securityLogger.logEvent(eventData)];
            case 2:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.correlationId,
              ).toBe(correlationId);
              _b.label = 3;
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
  (0, globals_1.describe)("Event Analysis", () => {
    (0, globals_1.it)("should detect failed login patterns", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var failedLoginEvents, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              failedLoginEvents = Array.from({ length: 6 }, (_, i) =>
                (0, setup_1.createMockSecurityEvent)({
                  id: "event-".concat(i),
                  userId: "user-123",
                  type: "login_attempt",
                  details: { success: false },
                  createdAt: new Date(Date.now() - i * 60000).toISOString(), // 1 minute apart
                }),
              );
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                data: failedLoginEvents,
                error: null,
              });
              return [4 /*yield*/, securityLogger.analyzeFailedLogins("user-123", 60)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.count,
              ).toBe(6);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.exceedsThreshold,
              ).toBe(true); // Exceeds threshold of 5
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should detect suspicious activity patterns", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var suspiciousEvents, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              suspiciousEvents = [
                (0, setup_1.createMockSecurityEvent)({
                  type: "unauthorized_access",
                  severity: "high",
                  userId: "user-123",
                }),
                (0, setup_1.createMockSecurityEvent)({
                  type: "suspicious_activity",
                  severity: "high",
                  userId: "user-123",
                }),
                (0, setup_1.createMockSecurityEvent)({
                  type: "rate_limit_exceeded",
                  severity: "medium",
                  userId: "user-123",
                }),
              ];
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                data: suspiciousEvents,
                error: null,
              });
              return [4 /*yield*/, securityLogger.analyzeSuspiciousActivity("user-123", 24)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.riskScore,
              ).toBeGreaterThan(0.5);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.events,
              ).toHaveLength(3);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should calculate risk scores accurately", () => {
      var events = [
        (0, setup_1.createMockSecurityEvent)({ type: "login_attempt", severity: "low" }),
        (0, setup_1.createMockSecurityEvent)({ type: "unauthorized_access", severity: "high" }),
        (0, setup_1.createMockSecurityEvent)({ type: "suspicious_activity", severity: "high" }),
        (0, setup_1.createMockSecurityEvent)({ type: "rate_limit_exceeded", severity: "medium" }),
      ];
      var riskScore = securityLogger.calculateRiskScore(events);
      (0, globals_1.expect)(riskScore).toBeGreaterThan(0);
      (0, globals_1.expect)(riskScore).toBeLessThanOrEqual(1);
      (0, globals_1.expect)(riskScore).toBeGreaterThan(0.6); // Should be high due to high severity events
    });
    (0, globals_1.it)("should identify anomalous patterns", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var anomalousEvents, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              anomalousEvents = [
                (0, setup_1.createMockSecurityEvent)({
                  type: "login_attempt",
                  ipAddress: "192.168.1.1",
                  createdAt: new Date().toISOString(),
                }),
                (0, setup_1.createMockSecurityEvent)({
                  type: "login_attempt",
                  ipAddress: "10.0.0.1", // Different IP
                  createdAt: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
                }),
              ];
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                data: anomalousEvents,
                error: null,
              });
              return [4 /*yield*/, securityLogger.detectAnomalies("user-123", 60)];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.anomalies,
              ).toBeDefined();
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.anomalies.length,
              ).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Event Queries", () => {
    (0, globals_1.it)("should get user security events", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var userEvents, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              userEvents = [
                (0, setup_1.createMockSecurityEvent)({ id: "event-1", userId: "user-123" }),
                (0, setup_1.createMockSecurityEvent)({ id: "event-2", userId: "user-123" }),
              ];
              mockSupabase.from().select().eq().order().limit.mockResolvedValue({
                data: userEvents,
                error: null,
              });
              return [4 /*yield*/, securityLogger.getUserEvents("user-123", { limit: 10 })];
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
    (0, globals_1.it)("should filter events by type", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var loginEvents, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              loginEvents = [
                (0, setup_1.createMockSecurityEvent)({ type: "login_attempt", userId: "user-123" }),
                (0, setup_1.createMockSecurityEvent)({ type: "login_attempt", userId: "user-123" }),
              ];
              mockSupabase.from().select().eq().eq().order().limit.mockResolvedValue({
                data: loginEvents,
                error: null,
              });
              return [
                4 /*yield*/,
                securityLogger.getUserEvents("user-123", {
                  type: "login_attempt",
                  limit: 10,
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0
                  ? void 0
                  : _a.every((event) => event.type === "login_attempt"),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should filter events by severity", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var highSeverityEvents, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              highSeverityEvents = [
                (0, setup_1.createMockSecurityEvent)({ severity: "high", userId: "user-123" }),
                (0, setup_1.createMockSecurityEvent)({ severity: "high", userId: "user-123" }),
              ];
              mockSupabase.from().select().eq().eq().order().limit.mockResolvedValue({
                data: highSeverityEvents,
                error: null,
              });
              return [
                4 /*yield*/,
                securityLogger.getUserEvents("user-123", {
                  severity: "high",
                  limit: 10,
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0
                  ? void 0
                  : _a.every((event) => event.severity === "high"),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should filter events by date range", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var startDate, endDate, recentEvents, result;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
              endDate = new Date();
              recentEvents = [
                (0, setup_1.createMockSecurityEvent)({
                  userId: "user-123",
                  createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
                }),
              ];
              mockSupabase.from().select().eq().gte().lte().order().limit.mockResolvedValue({
                data: recentEvents,
                error: null,
              });
              return [
                4 /*yield*/,
                securityLogger.getUserEvents("user-123", {
                  startDate: startDate,
                  endDate: endDate,
                  limit: 10,
                }),
              ];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toHaveLength(1);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Event Resolution", () => {
    (0, globals_1.it)("should resolve security event", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var mockEvent, resolvedEvent, result;
        var _a, _b;
        return __generator(this, (_c) => {
          switch (_c.label) {
            case 0:
              mockEvent = (0, setup_1.createMockSecurityEvent)({ resolved: false });
              resolvedEvent = __assign(__assign({}, mockEvent), {
                resolved: true,
                resolvedAt: new Date().toISOString(),
                resolvedBy: "admin-123",
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: resolvedEvent,
                error: null,
              });
              return [
                4 /*yield*/,
                securityLogger.resolveEvent("event-123", "admin-123", "Issue resolved"),
              ];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.resolved,
              ).toBe(true);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.resolvedBy,
              ).toBe("admin-123");
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should get unresolved events", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var unresolvedEvents, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              unresolvedEvents = [
                (0, setup_1.createMockSecurityEvent)({ id: "event-1", resolved: false }),
                (0, setup_1.createMockSecurityEvent)({ id: "event-2", resolved: false }),
              ];
              mockSupabase.from().select().eq().order().limit.mockResolvedValue({
                data: unresolvedEvents,
                error: null,
              });
              return [4 /*yield*/, securityLogger.getUnresolvedEvents({ limit: 10 })];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0
                  ? void 0
                  : _a.every((event) => !event.resolved),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      }),
    );
  });
  (0, globals_1.describe)("Event Cleanup", () => {
    (0, globals_1.it)("should clean up old events", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var oldEvents, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              oldEvents = [
                (0, setup_1.createMockSecurityEvent)({
                  id: "old-1",
                  createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days ago
                }),
                (0, setup_1.createMockSecurityEvent)({
                  id: "old-2",
                  createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
                }),
              ];
              mockSupabase.from().select().lt().mockResolvedValue({
                data: oldEvents,
                error: null,
              });
              mockSupabase.from().delete().lt().mockResolvedValue({
                data: null,
                error: null,
              });
              return [4 /*yield*/, securityLogger.cleanupOldEvents(90)];
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
  });
  (0, globals_1.describe)("Alert System", () => {
    (0, globals_1.it)("should trigger alerts for threshold violations", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var failedLoginEvents, alertSpy;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              failedLoginEvents = Array.from({ length: 6 }, (_, _i) =>
                (0, setup_1.createMockSecurityEvent)({
                  type: "login_attempt",
                  details: { success: false },
                  userId: "user-123",
                }),
              );
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                data: failedLoginEvents,
                error: null,
              });
              alertSpy = globals_1.jest.spyOn(securityLogger, "triggerAlert").mockResolvedValue({
                success: true,
                data: { alertId: "alert-123" },
              });
              return [4 /*yield*/, securityLogger.checkAlertThresholds("user-123")];
            case 1:
              _a.sent();
              (0, globals_1.expect)(alertSpy).toHaveBeenCalledWith(
                globals_1.expect.objectContaining({
                  type: "failed_login_threshold",
                  severity: "high",
                }),
              );
              return [2 /*return*/];
          }
        });
      }),
    );
    (0, globals_1.it)("should auto-block users exceeding thresholds", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var suspiciousEvents, blockSpy;
        return __generator(this, (_a) => {
          switch (_a.label) {
            case 0:
              suspiciousEvents = Array.from({ length: 11 }, (_, _i) =>
                (0, setup_1.createMockSecurityEvent)({
                  type: "suspicious_activity",
                  severity: "high",
                  userId: "user-123",
                }),
              );
              mockSupabase.from().select().eq().gte().order().limit.mockResolvedValue({
                data: suspiciousEvents,
                error: null,
              });
              blockSpy = globals_1.jest.spyOn(securityLogger, "autoBlockUser").mockResolvedValue({
                success: true,
                data: { blocked: true },
              });
              return [4 /*yield*/, securityLogger.checkAutoBlock("user-123")];
            case 1:
              _a.sent();
              (0, globals_1.expect)(blockSpy).toHaveBeenCalledWith(
                "user-123",
                globals_1.expect.any(String),
              );
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
                securityLogger.logEvent({
                  userId: "user-123",
                  type: "login_attempt",
                  severity: "medium",
                  description: "Test event",
                  details: {},
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
    (0, globals_1.it)("should handle invalid event data", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var invalidEventData, result;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              invalidEventData = {
                userId: "", // Invalid empty userId
                type: "invalid_type", // Invalid event type
                severity: "invalid_severity", // Invalid severity
                description: "Test event",
              };
              return [4 /*yield*/, securityLogger.logEvent(invalidEventData)];
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
  (0, globals_1.describe)("Performance", () => {
    (0, globals_1.it)("should handle bulk event logging efficiently", () =>
      __awaiter(void 0, void 0, void 0, function () {
        var events, mockEvents, startTime, result, endTime;
        var _a;
        return __generator(this, (_b) => {
          switch (_b.label) {
            case 0:
              events = Array.from({ length: 100 }, (_, i) => ({
                userId: "user-123",
                type: "login_attempt",
                severity: "low",
                description: "Bulk event ".concat(i),
                details: {},
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0...",
              }));
              mockEvents = events.map((event, i) =>
                (0, setup_1.createMockSecurityEvent)(
                  __assign(__assign({}, event), { id: "bulk-".concat(i) }),
                ),
              );
              mockSupabase.from().insert().select().mockResolvedValue({
                data: mockEvents,
                error: null,
              });
              startTime = Date.now();
              return [4 /*yield*/, securityLogger.logBulkEvents(events)];
            case 1:
              result = _b.sent();
              endTime = Date.now();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.loggedCount,
              ).toBe(100);
              (0, globals_1.expect)(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
              return [2 /*return*/];
          }
        });
      }),
    );
  });
});
