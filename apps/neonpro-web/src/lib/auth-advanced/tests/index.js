// Test Suite Index
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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: () => m[k],
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : (o, m, k, k2) => {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __exportStar =
  (this && this.__exportStar) ||
  ((m, exports) => {
    for (var p in m)
      if (p !== "default" && !Object.hasOwn(exports, p)) __createBinding(exports, m, p);
  });
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
exports.runTestSuite =
  exports.IntegrationTestUtils =
  exports.PerformanceTestUtils =
  exports.setupTestEnvironment =
  exports.TEST_CONFIG =
  exports.TestUtils =
    void 0;
// Export all test modules
__exportStar(require("./session-manager.test"), exports);
__exportStar(require("./security-monitor.test"), exports);
__exportStar(require("./device-manager.test"), exports);
// Test utilities and helpers
exports.TestUtils = {
  /**
   * Create mock session data
   */
  createMockSessionData: (overrides) => {
    if (overrides === void 0) {
      overrides = {};
    }
    return __assign(
      {
        userId: "test-user-123",
        userRole: "user",
        deviceId: "test-device-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
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
      },
      overrides,
    );
  },
  /**
   * Create mock device registration
   */
  createMockDeviceRegistration: (overrides) => {
    if (overrides === void 0) {
      overrides = {};
    }
    return __assign(
      {
        userId: "test-user-123",
        name: "Test Device",
        type: "desktop",
        platform: "Windows",
        fingerprint: "test-fingerprint-123",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
        location: {
          country: "US",
          region: "CA",
          city: "San Francisco",
          latitude: 37.7749,
          longitude: -122.4194,
        },
        registeredAt: new Date(),
      },
      overrides,
    );
  },
  /**
   * Create mock security event
   */
  createMockSecurityEvent: (overrides) => {
    if (overrides === void 0) {
      overrides = {};
    }
    return __assign(
      {
        type: "login_attempt",
        userId: "test-user-123",
        severity: "info",
        details: {
          success: true,
        },
        timestamp: new Date(),
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Test Browser)",
      },
      overrides,
    );
  },
  /**
   * Create mock security config
   */
  createMockSecurityConfig: (overrides) => {
    if (overrides === void 0) {
      overrides = {};
    }
    return __assign(
      {
        enableRealTimeMonitoring: true,
        threatDetectionLevel: "medium",
        maxFailedAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
        suspiciousActivityThreshold: 10,
        enableGeolocationTracking: true,
        enableDeviceFingerprinting: true,
        alertThresholds: {
          low: 1,
          medium: 3,
          high: 5,
          critical: 1,
        },
        autoBlockThreshold: 10,
        rateLimitConfig: {
          windowMs: 15 * 60 * 1000,
          maxRequests: 100,
          blockDuration: 60 * 60 * 1000,
        },
      },
      overrides,
    );
  },
  /**
   * Create mock session config
   */
  createMockSessionConfig: (overrides) => {
    if (overrides === void 0) {
      overrides = {};
    }
    return __assign(
      {
        maxSessions: 5,
        sessionTimeout: 30 * 60 * 1000,
        extendThreshold: 5 * 60 * 1000,
        heartbeatInterval: 60 * 1000,
        requireMFA: false,
        requireTrustedDevice: false,
        allowConcurrentSessions: true,
        trackLocation: true,
        logSecurityEvents: true,
        enableRateLimiting: true,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
      },
      overrides,
    );
  },
  /**
   * Wait for async operations
   */
  wait: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  /**
   * Generate random test data
   */
  generateRandomId: () => Math.random().toString(36).substring(2, 15),
  generateRandomIP: () => {
    var octets = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
    return octets.join(".");
  },
  generateRandomUserAgent: () => {
    var browsers = [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
      "Mozilla/5.0 (Android 11; Mobile; rv:68.0)",
    ];
    return browsers[Math.floor(Math.random() * browsers.length)];
  },
  /**
   * Mock time functions
   */
  mockTime: {
    now: () => Date.now(),
    advanceBy: (ms) => {
      var originalNow = Date.now;
      var startTime = originalNow();
      Date.now = () => startTime + ms;
      return () => {
        Date.now = originalNow;
      };
    },
  },
  /**
   * Assertion helpers
   */
  assertions: {
    isValidSessionId: (sessionId) => typeof sessionId === "string" && sessionId.length > 0,
    isValidDeviceId: (deviceId) => typeof deviceId === "string" && deviceId.length > 0,
    isValidTimestamp: (timestamp) => timestamp instanceof Date && !isNaN(timestamp.getTime()),
    isValidRiskScore: (score) => typeof score === "number" && score >= 0 && score <= 1,
    isValidTrustScore: (score) => typeof score === "number" && score >= 0 && score <= 1,
  },
};
// Test configuration
exports.TEST_CONFIG = {
  // Test timeouts
  TIMEOUT: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000,
  },
  // Test data limits
  LIMITS: {
    MAX_SESSIONS: 10,
    MAX_DEVICES: 20,
    MAX_EVENTS: 100,
  },
  // Mock data
  MOCK_DATA: {
    USER_IDS: ["user-1", "user-2", "user-3", "admin-1"],
    DEVICE_TYPES: ["desktop", "mobile", "tablet"],
    PLATFORMS: ["Windows", "macOS", "iOS", "Android", "Linux"],
    COUNTRIES: ["US", "CA", "GB", "DE", "FR", "JP"],
    CITIES: ["New York", "London", "Tokyo", "Berlin", "Paris", "Toronto"],
  },
};
// Test environment setup
var setupTestEnvironment = () => {
  // Mock console methods to reduce noise in tests
  var originalConsole = __assign({}, console);
  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
  });
  afterEach(() => {
    Object.assign(console, originalConsole);
    vi.clearAllMocks();
  });
};
exports.setupTestEnvironment = setupTestEnvironment;
// Performance testing utilities
exports.PerformanceTestUtils = {
  /**
   * Measure execution time
   */
  measureTime: (fn) =>
    __awaiter(void 0, void 0, void 0, function () {
      var start, end;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            start = performance.now();
            return [4 /*yield*/, fn()];
          case 1:
            _a.sent();
            end = performance.now();
            return [2 /*return*/, end - start];
        }
      });
    }),
  /**
   * Run load test
   */
  loadTest: (fn, iterations) =>
    __awaiter(void 0, void 0, void 0, function () {
      var times, i, time;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            times = [];
            i = 0;
            _a.label = 1;
          case 1:
            if (!(i < iterations)) return [3 /*break*/, 4];
            return [4 /*yield*/, exports.PerformanceTestUtils.measureTime(fn)];
          case 2:
            time = _a.sent();
            times.push(time);
            _a.label = 3;
          case 3:
            i++;
            return [3 /*break*/, 1];
          case 4:
            return [
              2 /*return*/,
              {
                iterations: iterations,
                totalTime: times.reduce((sum, time) => sum + time, 0),
                averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
                minTime: Math.min.apply(Math, times),
                maxTime: Math.max.apply(Math, times),
                times: times,
              },
            ];
        }
      });
    }),
  /**
   * Memory usage tracking
   */
  trackMemory: () => {
    if (typeof process !== "undefined" && process.memoryUsage) {
      return process.memoryUsage();
    }
    return null;
  },
};
// Integration test helpers
exports.IntegrationTestUtils = {
  /**
   * Setup complete auth system for integration tests
   */
  setupAuthSystem: () =>
    __awaiter(void 0, void 0, void 0, function () {
      var SessionManager,
        SecurityMonitor,
        DeviceManager,
        securityConfig,
        sessionConfig,
        securityMonitor,
        sessionManager,
        deviceManager;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, Promise.resolve().then(() => require("../session-manager"))];
          case 1:
            SessionManager = _a.sent().SessionManager;
            return [4 /*yield*/, Promise.resolve().then(() => require("../security-monitor"))];
          case 2:
            SecurityMonitor = _a.sent().SecurityMonitor;
            return [4 /*yield*/, Promise.resolve().then(() => require("../device-manager"))];
          case 3:
            DeviceManager = _a.sent().DeviceManager;
            securityConfig = exports.TestUtils.createMockSecurityConfig();
            sessionConfig = exports.TestUtils.createMockSessionConfig();
            securityMonitor = new SecurityMonitor(securityConfig);
            sessionManager = new SessionManager(sessionConfig, securityMonitor);
            deviceManager = new DeviceManager();
            return [
              2 /*return*/,
              {
                sessionManager: sessionManager,
                securityMonitor: securityMonitor,
                deviceManager: deviceManager,
                configs: {
                  security: securityConfig,
                  session: sessionConfig,
                },
              },
            ];
        }
      });
    }),
  /**
   * Simulate user workflow
   */
  simulateUserWorkflow: (authSystem, userId) =>
    __awaiter(void 0, void 0, void 0, function () {
      var sessionManager, deviceManager, deviceRegistration, deviceId, sessionData, sessionId;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            (sessionManager = authSystem.sessionManager),
              (deviceManager = authSystem.deviceManager);
            deviceRegistration = exports.TestUtils.createMockDeviceRegistration({ userId: userId });
            return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
          case 1:
            deviceId = _a.sent();
            sessionData = exports.TestUtils.createMockSessionData({
              userId: userId,
              deviceId: deviceId,
            });
            return [4 /*yield*/, sessionManager.createSession(sessionData)];
          case 2:
            sessionId = _a.sent();
            // Simulate activity
            return [4 /*yield*/, sessionManager.updateActivity(sessionId)];
          case 3:
            // Simulate activity
            _a.sent();
            return [
              2 /*return*/,
              {
                userId: userId,
                deviceId: deviceId,
                sessionId: sessionId,
                deviceRegistration: deviceRegistration,
                sessionData: sessionData,
              },
            ];
        }
      });
    }),
};
// Export test suite runner
var runTestSuite = () =>
  __awaiter(void 0, void 0, void 0, function () {
    var testResults, error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          console.log("🧪 Running Auth System Test Suite...");
          _a.label = 1;
        case 1:
          _a.trys.push([1, 3, , 4]);
          return [
            4 /*yield*/,
            Promise.all([
              Promise.resolve().then(() => require("./session-manager.test")),
              Promise.resolve().then(() => require("./security-monitor.test")),
              Promise.resolve().then(() => require("./device-manager.test")),
            ]),
          ];
        case 2:
          testResults = _a.sent();
          console.log("✅ All tests completed successfully!");
          return [2 /*return*/, testResults];
        case 3:
          error_1 = _a.sent();
          console.error("❌ Test suite failed:", error_1);
          throw error_1;
        case 4:
          return [2 /*return*/];
      }
    });
  });
exports.runTestSuite = runTestSuite;
