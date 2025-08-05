"use strict";
// Device Manager Tests
// Story 1.4: Session Management & Security Implementation
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
var vitest_1 = require("vitest");
var device_manager_1 = require("../device-manager");
(0, vitest_1.describe)("DeviceManager", function () {
  var deviceManager;
  (0, vitest_1.beforeEach)(function () {
    deviceManager = new device_manager_1.DeviceManager();
  });
  (0, vitest_1.afterEach)(function () {
    vitest_1.vi.clearAllMocks();
  });
  (0, vitest_1.describe)("registerDevice", function () {
    (0, vitest_1.it)("should register a new device successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "iPhone 13",
                type: "mobile",
                platform: "iOS",
                fingerprint: "abc123def456",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              (0, vitest_1.expect)(deviceId).toBeDefined();
              (0, vitest_1.expect)(typeof deviceId).toBe("string");
              (0, vitest_1.expect)(deviceId.length).toBeGreaterThan(0);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should reject duplicate device fingerprints for same user", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "iPhone 13",
                type: "mobile",
                platform: "iOS",
                fingerprint: "duplicate123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              // Register first device
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              // Register first device
              _a.sent();
              // Try to register duplicate
              return [
                4 /*yield*/,
                (0, vitest_1.expect)(
                  deviceManager.registerDevice(deviceRegistration),
                ).rejects.toThrow("Device already registered"),
              ];
            case 2:
              // Try to register duplicate
              _a.sent();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should allow same fingerprint for different users", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration1, deviceRegistration2, deviceId1, deviceId2;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration1 = {
                userId: "user123",
                name: "iPhone 13",
                type: "mobile",
                platform: "iOS",
                fingerprint: "shared123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              deviceRegistration2 = __assign(__assign({}, deviceRegistration1), {
                userId: "user456",
              });
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration1)];
            case 1:
              deviceId1 = _a.sent();
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration2)];
            case 2:
              deviceId2 = _a.sent();
              (0, vitest_1.expect)(deviceId1).toBeDefined();
              (0, vitest_1.expect)(deviceId2).toBeDefined();
              (0, vitest_1.expect)(deviceId1).not.toBe(deviceId2);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("getDevice", function () {
    (0, vitest_1.it)("should retrieve an existing device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, device;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "MacBook Pro",
                type: "desktop",
                platform: "macOS",
                fingerprint: "mac123def456",
                ipAddress: "192.168.1.2",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 2:
              device = _a.sent();
              (0, vitest_1.expect)(device).toBeDefined();
              (0, vitest_1.expect)(device === null || device === void 0 ? void 0 : device.id).toBe(
                deviceId,
              );
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.userId,
              ).toBe("user123");
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.name,
              ).toBe("MacBook Pro");
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.trusted,
              ).toBe(false); // Default value
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.blocked,
              ).toBe(false); // Default value
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should return null for non-existent device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var device;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.getDevice("non-existent")];
            case 1:
              device = _a.sent();
              (0, vitest_1.expect)(device).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("getUserDevices", function () {
    (0, vitest_1.it)("should return all devices for a user", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var userId, device1, device2, devices;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              userId = "user123";
              device1 = {
                userId: userId,
                name: "iPhone 13",
                type: "mobile",
                platform: "iOS",
                fingerprint: "iphone123",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              device2 = {
                userId: userId,
                name: "MacBook Pro",
                type: "desktop",
                platform: "macOS",
                fingerprint: "macbook123",
                ipAddress: "192.168.1.2",
                userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(device1)];
            case 1:
              _a.sent();
              return [4 /*yield*/, deviceManager.registerDevice(device2)];
            case 2:
              _a.sent();
              return [4 /*yield*/, deviceManager.getUserDevices(userId)];
            case 3:
              devices = _a.sent();
              (0, vitest_1.expect)(devices).toHaveLength(2);
              (0, vitest_1.expect)(
                devices.every(function (d) {
                  return d.userId === userId;
                }),
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should return empty array for user with no devices", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var devices;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.getUserDevices("user-no-devices")];
            case 1:
              devices = _a.sent();
              (0, vitest_1.expect)(devices).toHaveLength(0);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("validateDevice", function () {
    (0, vitest_1.it)("should validate device with correct fingerprint", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, isValid;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "test123fingerprint",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.validateDevice(deviceId, "test123fingerprint")];
            case 2:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should reject device with incorrect fingerprint", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, isValid;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "correct123fingerprint",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.validateDevice(deviceId, "wrong123fingerprint")];
            case 2:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should reject validation for non-existent device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var isValid;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.validateDevice("non-existent", "any-fingerprint")];
            case 1:
              isValid = _a.sent();
              (0, vitest_1.expect)(isValid).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("updateDeviceTrust", function () {
    (0, vitest_1.it)("should update device trust status", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, device, success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "trust123test",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 2:
              device = _a.sent();
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.trusted,
              ).toBe(false);
              return [
                4 /*yield*/,
                deviceManager.updateDeviceTrust(deviceId, true, "User verified"),
              ];
            case 3:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 4:
              // Verify trust status updated
              device = _a.sent();
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.trusted,
              ).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should return false for non-existent device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.updateDeviceTrust("non-existent", true, "Test")];
            case 1:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("blockDevice", function () {
    (0, vitest_1.it)("should block and unblock device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, device, success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "block123test",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 2:
              device = _a.sent();
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.blocked,
              ).toBe(false);
              return [
                4 /*yield*/,
                deviceManager.blockDevice(deviceId, true, "Suspicious activity"),
              ];
            case 3:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 4:
              // Verify blocked status
              device = _a.sent();
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.blocked,
              ).toBe(true);
              return [4 /*yield*/, deviceManager.blockDevice(deviceId, false, "False positive")];
            case 5:
              // Unblock device
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 6:
              // Verify unblocked status
              device = _a.sent();
              (0, vitest_1.expect)(
                device === null || device === void 0 ? void 0 : device.blocked,
              ).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should return false for non-existent device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.blockDevice("non-existent", true, "Test")];
            case 1:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("removeDevice", function () {
    (0, vitest_1.it)("should remove device successfully", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var deviceRegistration, deviceId, device, success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              deviceRegistration = {
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "remove123test",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(deviceRegistration)];
            case 1:
              deviceId = _a.sent();
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 2:
              device = _a.sent();
              (0, vitest_1.expect)(device).toBeDefined();
              return [4 /*yield*/, deviceManager.removeDevice(deviceId)];
            case 3:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(true);
              return [4 /*yield*/, deviceManager.getDevice(deviceId)];
            case 4:
              // Verify device no longer exists
              device = _a.sent();
              (0, vitest_1.expect)(device).toBeNull();
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should return false for non-existent device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var success;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [4 /*yield*/, deviceManager.removeDevice("non-existent")];
            case 1:
              success = _a.sent();
              (0, vitest_1.expect)(success).toBe(false);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("calculateTrustScore", function () {
    (0, vitest_1.it)("should calculate trust score for new device", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var device, trustScore;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              device = {
                id: "device123",
                userId: "user123",
                name: "Test Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "trust123score",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                trusted: false,
                blocked: false,
                registeredAt: new Date(),
                lastSeen: new Date(),
                sessionCount: 0,
                metadata: {},
              };
              return [4 /*yield*/, deviceManager.calculateTrustScore(device)];
            case 1:
              trustScore = _a.sent();
              (0, vitest_1.expect)(trustScore).toBeGreaterThanOrEqual(0);
              (0, vitest_1.expect)(trustScore).toBeLessThanOrEqual(1);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should give higher trust score to established devices", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var newDevice, establishedDevice, newScore, establishedScore;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              newDevice = {
                id: "device123",
                userId: "user123",
                name: "New Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "new123device",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                trusted: false,
                blocked: false,
                registeredAt: new Date(),
                lastSeen: new Date(),
                sessionCount: 1,
                metadata: {},
              };
              establishedDevice = __assign(__assign({}, newDevice), {
                id: "device456",
                name: "Established Device",
                fingerprint: "established123device",
                registeredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                sessionCount: 50,
                trusted: true,
              });
              return [4 /*yield*/, deviceManager.calculateTrustScore(newDevice)];
            case 1:
              newScore = _a.sent();
              return [4 /*yield*/, deviceManager.calculateTrustScore(establishedDevice)];
            case 2:
              establishedScore = _a.sent();
              (0, vitest_1.expect)(establishedScore).toBeGreaterThan(newScore);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should give lower trust score to blocked devices", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var normalDevice, blockedDevice, normalScore, blockedScore;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              normalDevice = {
                id: "device123",
                userId: "user123",
                name: "Normal Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "normal123device",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                trusted: false,
                blocked: false,
                registeredAt: new Date(),
                lastSeen: new Date(),
                sessionCount: 10,
                metadata: {},
              };
              blockedDevice = __assign(__assign({}, normalDevice), {
                id: "device456",
                name: "Blocked Device",
                fingerprint: "blocked123device",
                blocked: true,
              });
              return [4 /*yield*/, deviceManager.calculateTrustScore(normalDevice)];
            case 1:
              normalScore = _a.sent();
              return [4 /*yield*/, deviceManager.calculateTrustScore(blockedDevice)];
            case 2:
              blockedScore = _a.sent();
              (0, vitest_1.expect)(blockedScore).toBeLessThan(normalScore);
              return [2 /*return*/];
          }
        });
      });
    });
  });
  (0, vitest_1.describe)("generateFingerprint", function () {
    (0, vitest_1.it)("should generate consistent fingerprints for same input", function () {
      var deviceInfo = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        screen: { width: 1920, height: 1080 },
        timezone: "America/New_York",
        language: "en-US",
        platform: "Win32",
        plugins: ["Chrome PDF Plugin", "Chrome PDF Viewer"],
      };
      var fingerprint1 = deviceManager.generateFingerprint(deviceInfo);
      var fingerprint2 = deviceManager.generateFingerprint(deviceInfo);
      (0, vitest_1.expect)(fingerprint1).toBe(fingerprint2);
      (0, vitest_1.expect)(fingerprint1).toBeDefined();
      (0, vitest_1.expect)(typeof fingerprint1).toBe("string");
      (0, vitest_1.expect)(fingerprint1.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)("should generate different fingerprints for different inputs", function () {
      var deviceInfo1 = {
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        screen: { width: 1920, height: 1080 },
        timezone: "America/New_York",
        language: "en-US",
        platform: "Win32",
        plugins: ["Chrome PDF Plugin"],
      };
      var deviceInfo2 = {
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        screen: { width: 1440, height: 900 },
        timezone: "America/Los_Angeles",
        language: "en-US",
        platform: "MacIntel",
        plugins: ["Safari PDF Plugin"],
      };
      var fingerprint1 = deviceManager.generateFingerprint(deviceInfo1);
      var fingerprint2 = deviceManager.generateFingerprint(deviceInfo2);
      (0, vitest_1.expect)(fingerprint1).not.toBe(fingerprint2);
    });
  });
  (0, vitest_1.describe)("getDeviceAnalytics", function () {
    (0, vitest_1.it)("should return device analytics", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var analytics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              return [
                4 /*yield*/,
                deviceManager.getDeviceAnalytics({
                  period: "30d",
                  userId: "user123",
                }),
              ];
            case 1:
              analytics = _a.sent();
              (0, vitest_1.expect)(analytics).toBeDefined();
              (0, vitest_1.expect)(typeof analytics.totalDevices).toBe("number");
              (0, vitest_1.expect)(typeof analytics.trustedDevices).toBe("number");
              (0, vitest_1.expect)(typeof analytics.blockedDevices).toBe("number");
              (0, vitest_1.expect)(typeof analytics.averageTrustScore).toBe("number");
              (0, vitest_1.expect)(Array.isArray(analytics.devicesByType)).toBe(true);
              (0, vitest_1.expect)(Array.isArray(analytics.devicesByPlatform)).toBe(true);
              (0, vitest_1.expect)(Array.isArray(analytics.registrationTrend)).toBe(true);
              (0, vitest_1.expect)(Array.isArray(analytics.locationDistribution)).toBe(true);
              return [2 /*return*/];
          }
        });
      });
    });
    (0, vitest_1.it)("should filter analytics by user when specified", function () {
      return __awaiter(void 0, void 0, void 0, function () {
        var device1, device2, user1Analytics, allAnalytics;
        return __generator(this, function (_a) {
          switch (_a.label) {
            case 0:
              device1 = {
                userId: "user123",
                name: "User 1 Device",
                type: "mobile",
                platform: "iOS",
                fingerprint: "user1device",
                ipAddress: "192.168.1.1",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              device2 = {
                userId: "user456",
                name: "User 2 Device",
                type: "desktop",
                platform: "Windows",
                fingerprint: "user2device",
                ipAddress: "192.168.1.2",
                userAgent: "Mozilla/5.0",
                location: {
                  country: "US",
                  region: "CA",
                  city: "San Francisco",
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                registeredAt: new Date(),
              };
              return [4 /*yield*/, deviceManager.registerDevice(device1)];
            case 1:
              _a.sent();
              return [4 /*yield*/, deviceManager.registerDevice(device2)];
            case 2:
              _a.sent();
              return [
                4 /*yield*/,
                deviceManager.getDeviceAnalytics({
                  period: "30d",
                  userId: "user123",
                }),
              ];
            case 3:
              user1Analytics = _a.sent();
              return [
                4 /*yield*/,
                deviceManager.getDeviceAnalytics({
                  period: "30d",
                }),
              ];
            case 4:
              allAnalytics = _a.sent();
              (0, vitest_1.expect)(user1Analytics.totalDevices).toBeLessThanOrEqual(
                allAnalytics.totalDevices,
              );
              return [2 /*return*/];
          }
        });
      });
    });
  });
});
