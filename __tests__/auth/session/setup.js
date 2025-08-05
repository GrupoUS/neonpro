"use strict";
/**
 * Session Management System - Test Setup
 *
 * This file configures the testing environment for the session management system,
 * providing mocks, utilities, and test data for comprehensive testing.
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
exports.testConfig =
  exports.cleanup =
  exports.measurePerformance =
  exports.createTestDatabase =
  exports.mockTimers =
  exports.mockConsole =
  exports.waitFor =
  exports.createMockUser =
  exports.createMockNotification =
  exports.createMockSecurityEvent =
  exports.createMockDevice =
  exports.createMockSession =
    void 0;
var globals_1 = require("@jest/globals");
var util_1 = require("util");
require("whatwg-fetch");
// Global test setup
global.TextEncoder = util_1.TextEncoder;
global.TextDecoder = util_1.TextDecoder;
// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
// Mock crypto for Node.js environment
if (typeof globalThis.crypto === "undefined") {
  var webcrypto = require("crypto").webcrypto;
  globalThis.crypto = webcrypto;
}
// Mock localStorage
var localStorageMock = {
  getItem: globals_1.jest.fn(),
  setItem: globals_1.jest.fn(),
  removeItem: globals_1.jest.fn(),
  clear: globals_1.jest.fn(),
  length: 0,
  key: globals_1.jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});
// Mock sessionStorage
var sessionStorageMock = {
  getItem: globals_1.jest.fn(),
  setItem: globals_1.jest.fn(),
  removeItem: globals_1.jest.fn(),
  clear: globals_1.jest.fn(),
  length: 0,
  key: globals_1.jest.fn(),
};
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});
// Mock navigator
Object.defineProperty(window, "navigator", {
  value: {
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    language: "en-US",
    languages: ["en-US", "en"],
    platform: "Win32",
    cookieEnabled: true,
    onLine: true,
  },
});
// Mock location
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
  },
});
// Mock fetch
global.fetch = globals_1.jest.fn();
// Test data factories
var createMockSession = function (overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  return __assign(
    {
      id: "session-123",
      userId: "user-123",
      deviceId: "device-123",
      tokenHash: "hashed-token",
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      lastActivity: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
      metadata: {},
    },
    overrides,
  );
};
exports.createMockSession = createMockSession;
var createMockDevice = function (overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  return __assign(
    {
      id: "device-123",
      userId: "user-123",
      fingerprint: "device-fingerprint-123",
      name: "Test Device",
      type: "desktop",
      trusted: false,
      blocked: false,
      firstSeen: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      trustExpiresAt: null,
      userAgent: "Mozilla/5.0...",
      metadata: {},
    },
    overrides,
  );
};
exports.createMockDevice = createMockDevice;
var createMockSecurityEvent = function (overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  return __assign(
    {
      id: "event-123",
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
      resolved: false,
      resolvedAt: null,
      resolvedBy: null,
      createdAt: new Date().toISOString(),
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0...",
    },
    overrides,
  );
};
exports.createMockSecurityEvent = createMockSecurityEvent;
var createMockNotification = function (overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  return __assign(
    {
      id: "notification-123",
      userId: "user-123",
      type: "security_alert",
      title: "Security Alert",
      message: "New device detected",
      data: {
        deviceId: "device-123",
        deviceName: "Unknown Device",
      },
      read: false,
      readAt: null,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    overrides,
  );
};
exports.createMockNotification = createMockNotification;
var createMockUser = function (overrides) {
  if (overrides === void 0) {
    overrides = {};
  }
  return __assign(
    {
      id: "user-123",
      email: "test@example.com",
      emailConfirmed: true,
      phone: null,
      phoneConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignInAt: new Date().toISOString(),
      role: "authenticated",
    },
    overrides,
  );
};
exports.createMockUser = createMockUser;
// Test utilities
var waitFor = function (ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
};
exports.waitFor = waitFor;
var mockConsole = function () {
  var originalConsole = __assign({}, console);
  beforeEach(function () {
    globals_1.jest.spyOn(console, "log").mockImplementation(function () {});
    globals_1.jest.spyOn(console, "warn").mockImplementation(function () {});
    globals_1.jest.spyOn(console, "error").mockImplementation(function () {});
  });
  afterEach(function () {
    Object.assign(console, originalConsole);
  });
};
exports.mockConsole = mockConsole;
// Mock timers utility
var mockTimers = function () {
  beforeEach(function () {
    globals_1.jest.useFakeTimers();
  });
  afterEach(function () {
    globals_1.jest.useRealTimers();
  });
};
exports.mockTimers = mockTimers;
// Database test utilities
var createTestDatabase = function () {
  var mockDb = {
    sessions: new Map(),
    devices: new Map(),
    securityEvents: new Map(),
    notifications: new Map(),
    users: new Map(),
  };
  var generateId = function () {
    return "test-".concat(Math.random().toString(36).substr(2, 9));
  };
  return {
    // Session operations
    createSession: function (data) {
      var session = __assign({ id: generateId() }, data);
      mockDb.sessions.set(session.id, session);
      return session;
    },
    getSession: function (id) {
      return mockDb.sessions.get(id);
    },
    updateSession: function (id, updates) {
      var session = mockDb.sessions.get(id);
      if (session) {
        var updated = __assign(__assign({}, session), updates);
        mockDb.sessions.set(id, updated);
        return updated;
      }
      return null;
    },
    deleteSession: function (id) {
      return mockDb.sessions.delete(id);
    },
    // Device operations
    createDevice: function (data) {
      var device = __assign({ id: generateId() }, data);
      mockDb.devices.set(device.id, device);
      return device;
    },
    getDevice: function (id) {
      return mockDb.devices.get(id);
    },
    getUserDevices: function (userId) {
      return Array.from(mockDb.devices.values()).filter(function (device) {
        return device.userId === userId;
      });
    },
    // Security event operations
    createSecurityEvent: function (data) {
      var event = __assign({ id: generateId() }, data);
      mockDb.securityEvents.set(event.id, event);
      return event;
    },
    getSecurityEvents: function (userId) {
      return Array.from(mockDb.securityEvents.values()).filter(function (event) {
        return event.userId === userId;
      });
    },
    // Notification operations
    createNotification: function (data) {
      var notification = __assign({ id: generateId() }, data);
      mockDb.notifications.set(notification.id, notification);
      return notification;
    },
    getUserNotifications: function (userId) {
      return Array.from(mockDb.notifications.values()).filter(function (notification) {
        return notification.userId === userId;
      });
    },
    // Utility methods
    clear: function () {
      mockDb.sessions.clear();
      mockDb.devices.clear();
      mockDb.securityEvents.clear();
      mockDb.notifications.clear();
      mockDb.users.clear();
    },
    seed: function () {
      // Create test user
      var user = (0, exports.createMockUser)();
      mockDb.users.set(user.id, user);
      // Create test session
      var session = (0, exports.createMockSession)({ userId: user.id });
      mockDb.sessions.set(session.id, session);
      // Create test device
      var device = (0, exports.createMockDevice)({ userId: user.id });
      mockDb.devices.set(device.id, device);
      // Create test security event
      var securityEvent = (0, exports.createMockSecurityEvent)({
        userId: user.id,
        sessionId: session.id,
        deviceId: device.id,
      });
      mockDb.securityEvents.set(securityEvent.id, securityEvent);
      // Create test notification
      var notification = (0, exports.createMockNotification)({ userId: user.id });
      mockDb.notifications.set(notification.id, notification);
      return {
        user: user,
        session: session,
        device: device,
        securityEvent: securityEvent,
        notification: notification,
      };
    },
  };
};
exports.createTestDatabase = createTestDatabase;
// Performance testing utilities
var measurePerformance = function (fn, name) {
  return __awaiter(void 0, void 0, void 0, function () {
    var start, result, end, duration;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          start = performance.now();
          return [4 /*yield*/, fn()];
        case 1:
          result = _a.sent();
          end = performance.now();
          duration = end - start;
          console.log("Performance [".concat(name, "]: ").concat(duration.toFixed(2), "ms"));
          return [2 /*return*/, { result: result, duration: duration }];
      }
    });
  });
};
exports.measurePerformance = measurePerformance;
// Cleanup function for tests
var cleanup = function () {
  // Clear all mocks
  globals_1.jest.clearAllMocks();
  // Clear localStorage
  localStorageMock.clear();
  // Clear sessionStorage
  sessionStorageMock.clear();
  // Reset fetch mock
  global.fetch.mockReset();
};
exports.cleanup = cleanup;
// Global test cleanup
afterEach(function () {
  (0, exports.cleanup)();
});
// Export test configuration
exports.testConfig = {
  timeout: 10000, // 10 seconds
  retries: 2,
  verbose: process.env.NODE_ENV === "test",
  coverage: {
    threshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
};
exports.default = {
  createMockSession: exports.createMockSession,
  createMockDevice: exports.createMockDevice,
  createMockSecurityEvent: exports.createMockSecurityEvent,
  createMockNotification: exports.createMockNotification,
  createMockUser: exports.createMockUser,
  createTestDatabase: exports.createTestDatabase,
  waitFor: exports.waitFor,
  mockConsole: exports.mockConsole,
  mockTimers: exports.mockTimers,
  measurePerformance: exports.measurePerformance,
  cleanup: exports.cleanup,
  testConfig: exports.testConfig,
};
