"use strict";
/**
 * DeviceManager Unit Tests
 *
 * Comprehensive test suite for the DeviceManager class,
 * covering device registration, trust management, and security features.
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
var globals_1 = require("@jest/globals");
var DeviceManager_1 = require("../../../lib/auth/session/DeviceManager");
var setup_1 = require("./setup");
// Mock Supabase
var mockSupabase = {
  from: globals_1.jest.fn(function () {
    return {
      select: globals_1.jest.fn(function () {
        return {
          eq: globals_1.jest.fn(function () {
            return {
              single: globals_1.jest.fn(),
              maybeSingle: globals_1.jest.fn(),
            };
          }),
          in: globals_1.jest.fn(function () {
            return {
              order: globals_1.jest.fn(function () {
                return {
                  limit: globals_1.jest.fn(),
                };
              }),
            };
          }),
        };
      }),
      insert: globals_1.jest.fn(function () {
        return {
          select: globals_1.jest.fn(function () {
            return {
              single: globals_1.jest.fn(),
            };
          }),
        };
      }),
      update: globals_1.jest.fn(function () {
        return {
          eq: globals_1.jest.fn(function () {
            return {
              select: globals_1.jest.fn(function () {
                return {
                  single: globals_1.jest.fn(),
                };
              }),
            };
          }),
        };
      }),
      delete: globals_1.jest.fn(function () {
        return {
          eq: globals_1.jest.fn(),
        };
      }),
    };
  }),
  rpc: globals_1.jest.fn(),
};
globals_1.jest.mock("@supabase/supabase-js", function () {
  return {
    createClient: globals_1.jest.fn(function () {
      return mockSupabase;
    }),
  };
});
(0, globals_1.describe)("DeviceManager", function () {
  var deviceManager;
  var testDb;
  var mockConfig;
  (0, globals_1.beforeEach)(function () {
    testDb = (0, setup_1.createTestDatabase)();
    mockConfig = {
      maxDevicesPerUser: 10,
      trustDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
      requireVerification: false,
      autoTrustSameNetwork: false,
      blockSuspiciousDevices: true,
      fingerprintAlgorithm: "sha256",
      trackingEnabled: true,
    };
    deviceManager = new DeviceManager_1.DeviceManager(mockConfig);
  });
  (0, globals_1.afterEach)(function () {
    (0, setup_1.cleanup)();
    globals_1.jest.clearAllMocks();
  });
  (0, globals_1.describe)("Device Registration", function () {
    (0, globals_1.it)("should register a new device successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceData, mockDevice, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceData = {
                userId: "user-123",
                fingerprint: "device-fingerprint-123",
                name: "Test Device",
                type: "desktop",
                userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
              };
              mockDevice = (0, setup_1.createMockDevice)(deviceData);
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: mockDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.registerDevice(deviceData)];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject({
                userId: deviceData.userId,
                fingerprint: deviceData.fingerprint,
                name: deviceData.name,
                type: deviceData.type,
              });
              (0, globals_1.expect)(mockSupabase.from).toHaveBeenCalledWith("devices");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should detect existing device by fingerprint", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var existingDevice, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              existingDevice = (0, setup_1.createMockDevice)({
                fingerprint: "existing-fingerprint",
                userId: "user-123",
              });
              mockSupabase.from().select().eq().single.mockResolvedValue({
                data: existingDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.getDeviceByFingerprint("existing-fingerprint")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject(existingDevice);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should enforce device limit per user", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var existingDevices, deviceData, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              existingDevices = Array.from({ length: 10 }, function (_, i) {
                return (0, setup_1.createMockDevice)({
                  id: "device-".concat(i),
                  userId: "user-123",
                  fingerprint: "fingerprint-".concat(i),
                });
              });
              mockSupabase.from().select().eq().mockResolvedValue({
                data: existingDevices,
                error: null,
              });
              deviceData = {
                userId: "user-123",
                fingerprint: "new-device-fingerprint",
                name: "New Device",
                type: "mobile",
                userAgent: "Mobile Browser",
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceData)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("DEVICE_LIMIT_EXCEEDED");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should generate unique device fingerprints", function () {
      var userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
      ];
      var fingerprints = userAgents.map(function (ua) {
        return deviceManager.generateFingerprint({
          userAgent: ua,
          screen: { width: 1920, height: 1080 },
          timezone: "America/New_York",
          language: "en-US",
        });
      });
      // All fingerprints should be unique
      var uniqueFingerprints = new Set(fingerprints);
      (0, globals_1.expect)(uniqueFingerprints.size).toBe(fingerprints.length);
    });
  });
  (0, globals_1.describe)("Device Trust Management", function () {
    (0, globals_1.it)("should trust a device successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockDevice, trustedDevice, result;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              mockDevice = (0, setup_1.createMockDevice)({ trusted: false });
              trustedDevice = __assign(__assign({}, mockDevice), {
                trusted: true,
                trustExpiresAt: new Date(Date.now() + mockConfig.trustDuration).toISOString(),
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: trustedDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.trustDevice("device-123")];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.trusted,
              ).toBe(true);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.trustExpiresAt,
              ).toBeDefined();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should revoke device trust", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockDevice, untrustedDevice, result;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              mockDevice = (0, setup_1.createMockDevice)({ trusted: true });
              untrustedDevice = __assign(__assign({}, mockDevice), {
                trusted: false,
                trustExpiresAt: null,
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: untrustedDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.revokeTrust("device-123")];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.trusted,
              ).toBe(false);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.trustExpiresAt,
              ).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should check if device trust is expired", function () {
      var expiredDevice = (0, setup_1.createMockDevice)({
        trusted: true,
        trustExpiresAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
      });
      var validDevice = (0, setup_1.createMockDevice)({
        trusted: true,
        trustExpiresAt: new Date(Date.now() + 60000).toISOString(), // 1 minute from now
      });
      (0, globals_1.expect)(deviceManager.isTrustExpired(expiredDevice)).toBe(true);
      (0, globals_1.expect)(deviceManager.isTrustExpired(validDevice)).toBe(false);
    });
    (0, globals_1.it)("should auto-trust devices on same network", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var configWithAutoTrust, existingDevice, newDeviceData, autoTrustedDevice, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              configWithAutoTrust = __assign(__assign({}, mockConfig), {
                autoTrustSameNetwork: true,
              });
              deviceManager = new DeviceManager_1.DeviceManager(configWithAutoTrust);
              existingDevice = (0, setup_1.createMockDevice)({
                userId: "user-123",
                trusted: true,
                metadata: { lastIpAddress: "192.168.1.100" },
              });
              newDeviceData = {
                userId: "user-123",
                fingerprint: "new-device-fingerprint",
                name: "New Device",
                type: "mobile",
                userAgent: "Mobile Browser",
                ipAddress: "192.168.1.101", // Same network
              };
              mockSupabase
                .from()
                .select()
                .eq()
                .mockResolvedValue({
                  data: [existingDevice],
                  error: null,
                });
              autoTrustedDevice = (0, setup_1.createMockDevice)(
                __assign(__assign({}, newDeviceData), { trusted: true }),
              );
              mockSupabase.from().insert().select().single.mockResolvedValue({
                data: autoTrustedDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.registerDevice(newDeviceData)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.trusted,
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Device Blocking", function () {
    (0, globals_1.it)("should block a suspicious device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockDevice, blockedDevice, result;
        var _a, _b;
        return __generator(this, function (_c) {
          switch (_c.label) {
            case 0:
              mockDevice = (0, setup_1.createMockDevice)({ blocked: false });
              blockedDevice = __assign(__assign({}, mockDevice), {
                blocked: true,
                blockedAt: new Date().toISOString(),
                blockedReason: "Suspicious activity detected",
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: blockedDevice,
                error: null,
              });
              return [
                4 /*yield*/,
                deviceManager.blockDevice("device-123", "Suspicious activity detected"),
              ];
            case 1:
              result = _c.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.blocked,
              ).toBe(true);
              (0, globals_1.expect)(
                (_b = result.data) === null || _b === void 0 ? void 0 : _b.blockedReason,
              ).toBe("Suspicious activity detected");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should unblock a device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockDevice, unblockedDevice, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              mockDevice = (0, setup_1.createMockDevice)({ blocked: true });
              unblockedDevice = __assign(__assign({}, mockDevice), {
                blocked: false,
                blockedAt: null,
                blockedReason: null,
              });
              mockSupabase.from().update().eq().select().single.mockResolvedValue({
                data: unblockedDevice,
                error: null,
              });
              return [4 /*yield*/, deviceManager.unblockDevice("device-123")];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.blocked,
              ).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should detect suspicious device patterns", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var suspiciousDevices, _i, suspiciousDevices_1, device, riskScore;
        return __generator(this, function (_a) {
          suspiciousDevices = [
            (0, setup_1.createMockDevice)({
              userAgent: "Bot/1.0",
              type: "unknown",
              name: "Unknown Device",
            }),
            (0, setup_1.createMockDevice)({
              userAgent: "Suspicious Browser",
              metadata: {
                rapidRequests: true,
                unusualBehavior: true,
              },
            }),
          ];
          for (
            _i = 0, suspiciousDevices_1 = suspiciousDevices;
            _i < suspiciousDevices_1.length;
            _i++
          ) {
            device = suspiciousDevices_1[_i];
            riskScore = deviceManager.calculateRiskScore(device);
            (0, globals_1.expect)(riskScore).toBeGreaterThan(0.7); // High risk
          }
          return [2 /*return*/];
        });
      });
    });
  });
  (0, globals_1.describe)("Device Information", function () {
    (0, globals_1.it)("should get user devices", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userDevices, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              userDevices = [
                (0, setup_1.createMockDevice)({ id: "device-1", userId: "user-123" }),
                (0, setup_1.createMockDevice)({ id: "device-2", userId: "user-123" }),
              ];
              mockSupabase.from().select().eq().order().limit.mockResolvedValue({
                data: userDevices,
                error: null,
              });
              return [4 /*yield*/, deviceManager.getUserDevices("user-123")];
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
      });
    });
    (0, globals_1.it)("should get device statistics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var mockStats, result;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              mockStats = {
                total: 50,
                trusted: 35,
                blocked: 5,
                active: 40,
              };
              mockSupabase.rpc.mockResolvedValue({
                data: mockStats,
                error: null,
              });
              return [4 /*yield*/, deviceManager.getDeviceStats("user-123")];
            case 1:
              result = _a.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(result.data).toMatchObject(mockStats);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should parse user agent information", function () {
      var userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      ];
      var expectedResults = [
        { browser: "Chrome", os: "Windows", device: "desktop" },
        { browser: "Safari", os: "iOS", device: "mobile" },
        { browser: "Chrome", os: "macOS", device: "desktop" },
      ];
      userAgents.forEach(function (ua, index) {
        var parsed = deviceManager.parseUserAgent(ua);
        (0, globals_1.expect)(parsed.browser).toContain(expectedResults[index].browser);
        (0, globals_1.expect)(parsed.os).toContain(expectedResults[index].os);
        (0, globals_1.expect)(parsed.device).toBe(expectedResults[index].device);
      });
    });
  });
  (0, globals_1.describe)("Device Cleanup", function () {
    (0, globals_1.it)("should clean up inactive devices", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var inactiveDevices, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              inactiveDevices = [
                (0, setup_1.createMockDevice)({
                  id: "inactive-1",
                  lastSeen: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
                }),
                (0, setup_1.createMockDevice)({
                  id: "inactive-2",
                  lastSeen: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days ago
                }),
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: inactiveDevices,
                error: null,
              });
              mockSupabase.from().delete().in().mockResolvedValue({
                data: null,
                error: null,
              });
              return [4 /*yield*/, deviceManager.cleanupInactiveDevices(60)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.cleanedCount,
              ).toBe(2);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should revoke expired trust", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var expiredTrustDevices, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              expiredTrustDevices = [
                (0, setup_1.createMockDevice)({
                  id: "expired-1",
                  trusted: true,
                  trustExpiresAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
                }),
              ];
              mockSupabase.from().select().mockResolvedValue({
                data: expiredTrustDevices,
                error: null,
              });
              mockSupabase
                .from()
                .update()
                .in()
                .mockResolvedValue({
                  data: expiredTrustDevices.map(function (d) {
                    return __assign(__assign({}, d), { trusted: false, trustExpiresAt: null });
                  }),
                  error: null,
                });
              return [4 /*yield*/, deviceManager.revokeExpiredTrust()];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(true);
              (0, globals_1.expect)(
                (_a = result.data) === null || _a === void 0 ? void 0 : _a.revokedCount,
              ).toBe(1);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Error Handling", function () {
    (0, globals_1.it)("should handle database errors gracefully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
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
                deviceManager.registerDevice({
                  userId: "user-123",
                  fingerprint: "device-fingerprint",
                  name: "Test Device",
                  type: "desktop",
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
      });
    });
    (0, globals_1.it)("should handle invalid device data", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var invalidDeviceData, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              invalidDeviceData = {
                userId: "", // Invalid empty userId
                fingerprint: "device-fingerprint",
                name: "Test Device",
                type: "invalid_type", // Invalid device type
                userAgent: "Mozilla/5.0...",
              };
              return [4 /*yield*/, deviceManager.registerDevice(invalidDeviceData)];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("VALIDATION_ERROR");
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, globals_1.describe)("Security Features", function () {
    (0, globals_1.it)("should detect device fingerprint collisions", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var existingDevice, result;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              existingDevice = (0, setup_1.createMockDevice)({
                fingerprint: "collision-fingerprint",
                userId: "user-123",
              });
              mockSupabase.from().select().eq().single.mockResolvedValue({
                data: existingDevice,
                error: null,
              });
              return [
                4 /*yield*/,
                deviceManager.registerDevice({
                  userId: "user-456", // Different user, same fingerprint
                  fingerprint: "collision-fingerprint",
                  name: "Suspicious Device",
                  type: "desktop",
                  userAgent: "Mozilla/5.0...",
                }),
              ];
            case 1:
              result = _b.sent();
              (0, globals_1.expect)(result.success).toBe(false);
              (0, globals_1.expect)(
                (_a = result.error) === null || _a === void 0 ? void 0 : _a.code,
              ).toBe("FINGERPRINT_COLLISION");
              return [2 /*return*/];
          }
        });
      });
    });
    (0, globals_1.it)("should validate device fingerprint format", function () {
      var invalidFingerprints = [
        "", // Empty
        "short", // Too short
        "invalid-characters-!@#$%", // Invalid characters
        null, // Null
        undefined, // Undefined
      ];
      for (
        var _i = 0, invalidFingerprints_1 = invalidFingerprints;
        _i < invalidFingerprints_1.length;
        _i++
      ) {
        var fingerprint = invalidFingerprints_1[_i];
        var isValid = deviceManager.validateFingerprint(fingerprint);
        (0, globals_1.expect)(isValid).toBe(false);
      }
      // Valid fingerprint
      var validFingerprint = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";
      (0, globals_1.expect)(deviceManager.validateFingerprint(validFingerprint)).toBe(true);
    });
  });
});
