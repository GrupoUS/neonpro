/**
 * Device Manager - Device Registration & Validation
 *
 * Manages device registration, fingerprinting, trust levels, and device-based security
 * for the NeonPro session management system with LGPD compliance.
 */
var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.DeviceManager = void 0;
var events_1 = require("events");
var crypto_1 = require("crypto");
var types_1 = require("./types");
var DeviceManager = /** @class */ ((_super) => {
  __extends(DeviceManager, _super);
  function DeviceManager(supabase) {
    var _this = _super.call(this) || this;
    _this.deviceCache = new Map();
    _this.fingerprintCache = new Map();
    _this.blockedDevices = new Set();
    _this.supabase = supabase;
    _this.initializeDeviceData();
    return _this;
  }
  // ============================================================================
  // DEVICE REGISTRATION & VALIDATION
  // ============================================================================
  /**
   * Register or validate a device for a user
   */
  DeviceManager.prototype.registerOrValidateDevice = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var fingerprintHash, existingDevice, updatedDevice, newDevice, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            fingerprintHash = this.generateFingerprintHash(params.fingerprint);
            return [4 /*yield*/, this.getDeviceByFingerprint(fingerprintHash, params.userId)];
          case 1:
            existingDevice = _a.sent();
            if (!existingDevice) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.updateDeviceUsage(existingDevice.id, {
                lastUsed: new Date(),
                ipAddress: params.ipAddress,
                location: params.location,
              }),
            ];
          case 2:
            updatedDevice = _a.sent();
            this.emit("device_validated", { device: updatedDevice, isNew: false });
            return [2 /*return*/, updatedDevice];
          case 3:
            return [4 /*yield*/, this.registerNewDevice(params, fingerprintHash)];
          case 4:
            newDevice = _a.sent();
            this.emit("device_registered", { device: newDevice, isNew: true });
            return [2 /*return*/, newDevice];
          case 5:
            error_1 = _a.sent();
            throw new types_1.SessionError(
              "Failed to register or validate device",
              "SYSTEM_ERROR",
              { error: error_1 },
            );
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate device for session creation
   */
  DeviceManager.prototype.validateDevice = function (fingerprintHash, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var device, riskAssessment, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getDeviceByFingerprint(fingerprintHash, userId)];
          case 1:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  isTrusted: false,
                  isBlocked: false,
                  riskScore: 50,
                  reasons: ["Unknown device"],
                },
              ];
            }
            // Check if device is blocked
            if (device.isBlocked || this.blockedDevices.has(device.id)) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  isTrusted: false,
                  isBlocked: true,
                  riskScore: 100,
                  reasons: ["Device is blocked"],
                  device: device,
                },
              ];
            }
            return [4 /*yield*/, this.assessDeviceRisk(device)];
          case 2:
            riskAssessment = _a.sent();
            return [
              2 /*return*/,
              {
                isValid: true,
                isTrusted: device.isTrusted,
                isBlocked: false,
                riskScore: riskAssessment.riskScore,
                reasons: riskAssessment.reasons,
                device: device,
              },
            ];
          case 3:
            error_2 = _a.sent();
            return [
              2 /*return*/,
              {
                isValid: false,
                isTrusted: false,
                isBlocked: false,
                riskScore: 100,
                reasons: ["Device validation error"],
              },
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Trust a device after verification
   */
  DeviceManager.prototype.trustDevice = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var isVerified, _a, data, error, trustedDevice, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.verifyDeviceTrust(params)];
          case 1:
            isVerified = _b.sent();
            if (!isVerified) {
              throw new types_1.SessionError(
                "Device trust verification failed",
                "AUTHENTICATION_REQUIRED",
              );
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_trusted: true,
                  trusted_at: new Date().toISOString(),
                  trust_method: params.verificationMethod,
                })
                .eq("id", params.deviceId)
                .eq("user_id", params.userId)
                .select()
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              throw new types_1.SessionError(
                "Failed to update device trust status",
                "SYSTEM_ERROR",
                { error: error },
              );
            }
            trustedDevice = this.mapDatabaseToDevice(data);
            // Update cache
            this.deviceCache.set(trustedDevice.id, trustedDevice);
            // Log trust event
            return [
              4 /*yield*/,
              this.logDeviceEvent({
                deviceId: trustedDevice.id,
                userId: params.userId,
                action: "device_trusted",
                details: {
                  verificationMethod: params.verificationMethod,
                  trustedAt: new Date(),
                },
              }),
            ];
          case 3:
            // Log trust event
            _b.sent();
            this.emit("device_trusted", {
              device: trustedDevice,
              method: params.verificationMethod,
            });
            return [2 /*return*/, trustedDevice];
          case 4:
            error_3 = _b.sent();
            if (error_3 instanceof types_1.SessionError) {
              throw error_3;
            }
            throw new types_1.SessionError("Failed to trust device", "SYSTEM_ERROR", {
              error: error_3,
            });
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block a device
   */
  DeviceManager.prototype.blockDevice = function (deviceId, userId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_blocked: true,
                  blocked_at: new Date().toISOString(),
                  block_reason: reason,
                })
                .eq("id", deviceId)
                .eq("user_id", userId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new types_1.SessionError("Failed to block device", "SYSTEM_ERROR", {
                error: error,
              });
            }
            // Add to blocked devices cache
            this.blockedDevices.add(deviceId);
            // Remove from device cache
            this.deviceCache.delete(deviceId);
            // Terminate all sessions for this device
            return [4 /*yield*/, this.terminateDeviceSessions(deviceId)];
          case 2:
            // Terminate all sessions for this device
            _a.sent();
            // Log block event
            return [
              4 /*yield*/,
              this.logDeviceEvent({
                deviceId: deviceId,
                userId: userId,
                action: "device_blocked",
                details: {
                  reason: reason,
                  blockedAt: new Date(),
                },
              }),
            ];
          case 3:
            // Log block event
            _a.sent();
            this.emit("device_blocked", { deviceId: deviceId, userId: userId, reason: reason });
            return [3 /*break*/, 5];
          case 4:
            error_4 = _a.sent();
            if (error_4 instanceof types_1.SessionError) {
              throw error_4;
            }
            throw new types_1.SessionError("Failed to block device", "SYSTEM_ERROR", {
              error: error_4,
            });
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Unblock a device
   */
  DeviceManager.prototype.unblockDevice = function (deviceId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_blocked: false,
                  blocked_at: null,
                  block_reason: null,
                })
                .eq("id", deviceId)
                .eq("user_id", userId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new types_1.SessionError("Failed to unblock device", "SYSTEM_ERROR", {
                error: error,
              });
            }
            // Remove from blocked devices cache
            this.blockedDevices.delete(deviceId);
            // Log unblock event
            return [
              4 /*yield*/,
              this.logDeviceEvent({
                deviceId: deviceId,
                userId: userId,
                action: "device_unblocked",
                details: {
                  unblockedAt: new Date(),
                },
              }),
            ];
          case 2:
            // Log unblock event
            _a.sent();
            this.emit("device_unblocked", { deviceId: deviceId, userId: userId });
            return [3 /*break*/, 4];
          case 3:
            error_5 = _a.sent();
            if (error_5 instanceof types_1.SessionError) {
              throw error_5;
            }
            throw new types_1.SessionError("Failed to unblock device", "SYSTEM_ERROR", {
              error: error_5,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DEVICE QUERIES
  // ============================================================================
  /**
   * Get all devices for a user
   */
  DeviceManager.prototype.getUserDevices = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .order("last_used", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError("Failed to fetch user devices", "SYSTEM_ERROR", {
                error: error,
              });
            }
            return [2 /*return*/, data.map(this.mapDatabaseToDevice)];
          case 2:
            error_6 = _b.sent();
            if (error_6 instanceof types_1.SessionError) {
              throw error_6;
            }
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
   * Get trusted devices for a user
   */
  DeviceManager.prototype.getTrustedDevices = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("user_id", userId)
                .eq("is_trusted", true)
                .eq("is_blocked", false)
                .order("last_used", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError("Failed to fetch trusted devices", "SYSTEM_ERROR", {
                error: error,
              });
            }
            return [2 /*return*/, data.map(this.mapDatabaseToDevice)];
          case 2:
            error_7 = _b.sent();
            if (error_7 instanceof types_1.SessionError) {
              throw error_7;
            }
            throw new types_1.SessionError("Failed to get trusted devices", "SYSTEM_ERROR", {
              error: error_7,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get device by ID
   */
  DeviceManager.prototype.getDeviceById = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var cached, _a, data, error, device, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cached = this.deviceCache.get(deviceId);
            if (cached) {
              return [2 /*return*/, cached];
            }
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").select("*").eq("id", deviceId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            device = this.mapDatabaseToDevice(data);
            // Cache the device
            this.deviceCache.set(deviceId, device);
            return [2 /*return*/, device];
          case 2:
            error_8 = _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Search devices with filters
   */
  DeviceManager.prototype.searchDevices = function (filters) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, error_9;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("device_registrations").select("*");
            if (filters.userId) {
              query = query.eq("user_id", filters.userId);
            }
            if (filters.clinicId) {
              query = query.eq("clinic_id", filters.clinicId);
            }
            if (filters.deviceType) {
              query = query.eq("device_type", filters.deviceType);
            }
            if (filters.isTrusted !== undefined) {
              query = query.eq("is_trusted", filters.isTrusted);
            }
            if (filters.isBlocked !== undefined) {
              query = query.eq("is_blocked", filters.isBlocked);
            }
            if (filters.registeredAfter) {
              query = query.gte("registered_at", filters.registeredAfter.toISOString());
            }
            if (filters.lastUsedAfter) {
              query = query.gte("last_used", filters.lastUsedAfter.toISOString());
            }
            query = query.order("last_used", { ascending: false });
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError("Failed to search devices", "SYSTEM_ERROR", {
                error: error,
              });
            }
            return [2 /*return*/, data.map(this.mapDatabaseToDevice)];
          case 2:
            error_9 = _b.sent();
            if (error_9 instanceof types_1.SessionError) {
              throw error_9;
            }
            throw new types_1.SessionError("Failed to search devices", "SYSTEM_ERROR", {
              error: error_9,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // DEVICE FINGERPRINTING
  // ============================================================================
  /**
   * Generate device fingerprint from browser data
   */
  DeviceManager.prototype.generateDeviceFingerprint = function (browserData) {
    var fingerprint = {
      userAgent: browserData.userAgent,
      screenResolution: browserData.screenResolution,
      colorDepth: browserData.colorDepth,
      timezone: browserData.timezone,
      language: browserData.language,
      platform: browserData.platform,
      cookieEnabled: browserData.cookieEnabled,
      doNotTrack: browserData.doNotTrack,
      hardwareConcurrency: browserData.hardwareConcurrency,
      maxTouchPoints: browserData.maxTouchPoints,
      pixelRatio: browserData.pixelRatio,
    };
    // Add WebGL fingerprint if available
    if (browserData.webglVendor && browserData.webglRenderer) {
      fingerprint.webglVendor = browserData.webglVendor;
      fingerprint.webglRenderer = browserData.webglRenderer;
    }
    // Add audio fingerprint if available
    if (browserData.audioContext) {
      fingerprint.audioFingerprint = this.generateAudioFingerprint(browserData.audioContext);
    }
    // Add canvas fingerprint if available
    if (browserData.canvas) {
      fingerprint.canvasFingerprint = this.generateCanvasFingerprint(browserData.canvas);
    }
    return fingerprint;
  };
  /**
   * Generate a hash from device fingerprint
   */
  DeviceManager.prototype.generateFingerprintHash = (fingerprint) => {
    var fingerprintString = JSON.stringify(fingerprint, Object.keys(fingerprint).sort());
    return crypto_1.default.createHash("sha256").update(fingerprintString).digest("hex");
  };
  /**
   * Compare two device fingerprints for similarity
   */
  DeviceManager.prototype.compareFingerprintSimilarity = (fp1, fp2) => {
    var fields = [
      "userAgent",
      "screenResolution",
      "timezone",
      "language",
      "platform",
      "hardwareConcurrency",
      "maxTouchPoints",
      "pixelRatio",
      "colorDepth",
    ];
    var matches = 0;
    var total = 0;
    for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
      var field = fields_1[_i];
      total++;
      if (fp1[field] === fp2[field]) {
        matches++;
      }
    }
    return matches / total;
  };
  // ============================================================================
  // DEVICE ANALYTICS
  // ============================================================================
  /**
   * Get device usage statistics
   */
  DeviceManager.prototype.getDeviceStatistics = function (userId, clinicId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, data, error, stats_1, sevenDaysAgo_1, totalUsage, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase
              .from("device_registrations")
              .select("device_type, is_trusted, is_blocked, usage_count, registered_at");
            if (userId) {
              query = query.eq("user_id", userId);
            }
            if (clinicId) {
              query = query.eq("clinic_id", clinicId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              throw new types_1.SessionError("Failed to get device statistics", "SYSTEM_ERROR", {
                error: error,
              });
            }
            stats_1 = {
              totalDevices: data.length,
              trustedDevices: data.filter((d) => d.is_trusted).length,
              blockedDevices: data.filter((d) => d.is_blocked).length,
              deviceTypes: {
                desktop: 0,
                laptop: 0,
                tablet: 0,
                mobile: 0,
                unknown: 0,
              },
              recentRegistrations: 0,
              averageUsageCount: 0,
            };
            // Count device types
            data.forEach((device) => {
              stats_1.deviceTypes[device.device_type]++;
            });
            sevenDaysAgo_1 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            stats_1.recentRegistrations = data.filter(
              (d) => new Date(d.registered_at) > sevenDaysAgo_1,
            ).length;
            totalUsage = data.reduce((sum, d) => sum + (d.usage_count || 0), 0);
            stats_1.averageUsageCount = data.length > 0 ? totalUsage / data.length : 0;
            return [2 /*return*/, stats_1];
          case 2:
            error_10 = _b.sent();
            if (error_10 instanceof types_1.SessionError) {
              throw error_10;
            }
            throw new types_1.SessionError("Failed to get device statistics", "SYSTEM_ERROR", {
              error: error_10,
            });
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up old devices
   */
  DeviceManager.prototype.cleanupOldDevices = function () {
    return __awaiter(this, arguments, void 0, function (retentionDays) {
      var cutoffDate, _a, oldDevices, fetchError, deleteError, error_11;
      var _this = this;
      if (retentionDays === void 0) {
        retentionDays = 90;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("id")
                .lt("last_used", cutoffDate.toISOString())
                .eq("is_trusted", false)
                .eq("is_blocked", false)
                .limit(100),
            ];
          case 1:
            (_a = _b.sent()), (oldDevices = _a.data), (fetchError = _a.error);
            if (fetchError) {
              throw new types_1.SessionError("Failed to fetch old devices", "SYSTEM_ERROR", {
                error: fetchError,
              });
            }
            if (!oldDevices || oldDevices.length === 0) {
              return [2 /*return*/, 0];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .delete()
                .in(
                  "id",
                  oldDevices.map((d) => d.id),
                ),
            ];
          case 2:
            deleteError = _b.sent().error;
            if (deleteError) {
              throw new types_1.SessionError("Failed to delete old devices", "SYSTEM_ERROR", {
                error: deleteError,
              });
            }
            // Clear from cache
            oldDevices.forEach((device) => {
              _this.deviceCache.delete(device.id);
            });
            return [2 /*return*/, oldDevices.length];
          case 3:
            error_11 = _b.sent();
            if (error_11 instanceof types_1.SessionError) {
              throw error_11;
            }
            throw new types_1.SessionError("Failed to cleanup old devices", "SYSTEM_ERROR", {
              error: error_11,
            });
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  DeviceManager.prototype.registerNewDevice = function (params, fingerprintHash) {
    return __awaiter(this, void 0, void 0, function () {
      var deviceId, now, deviceType, deviceMetadata, deviceName, device, error;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            deviceId = this.generateDeviceId();
            now = new Date();
            deviceType = this.detectDeviceType(params.fingerprint);
            deviceMetadata = this.extractDeviceMetadata(params.fingerprint);
            deviceName = params.deviceName || this.generateDeviceName(params.fingerprint);
            device = {
              id: deviceId,
              userId: params.userId,
              clinicId: params.clinicId,
              deviceFingerprint: fingerprintHash,
              deviceName: deviceName,
              deviceType: deviceType,
              platform: params.fingerprint.platform,
              browser: this.extractBrowser(params.fingerprint.userAgent),
              screenResolution: params.fingerprint.screenResolution,
              timezone: params.fingerprint.timezone,
              isTrusted: false,
              isBlocked: false,
              registeredAt: now,
              lastUsed: now,
              usageCount: 1,
              securityEvents: 0,
              metadata: deviceMetadata,
            };
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").insert({
                id: device.id,
                user_id: device.userId,
                clinic_id: device.clinicId,
                device_fingerprint: device.deviceFingerprint,
                device_name: device.deviceName,
                device_type: device.deviceType,
                platform: device.platform,
                browser: device.browser,
                screen_resolution: device.screenResolution,
                timezone: device.timezone,
                is_trusted: device.isTrusted,
                is_blocked: device.isBlocked,
                registered_at: device.registeredAt.toISOString(),
                last_used: device.lastUsed.toISOString(),
                usage_count: device.usageCount,
                security_events: device.securityEvents,
                metadata: device.metadata,
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              throw new types_1.SessionError(
                "Failed to register device in database",
                "SYSTEM_ERROR",
                { error: error },
              );
            }
            // Cache the device
            this.deviceCache.set(device.id, device);
            this.fingerprintCache.set(fingerprintHash, device.id);
            // Log registration event
            return [
              4 /*yield*/,
              this.logDeviceEvent({
                deviceId: device.id,
                userId: params.userId,
                action: "device_registered",
                details: {
                  deviceType: deviceType,
                  platform: device.platform,
                  browser: device.browser,
                  ipAddress: params.ipAddress,
                  location: params.location,
                },
              }),
            ];
          case 2:
            // Log registration event
            _a.sent();
            return [2 /*return*/, device];
        }
      });
    });
  };
  DeviceManager.prototype.getDeviceByFingerprint = function (fingerprintHash, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var cachedDeviceId, cachedDevice, _a, data, error, device, error_12;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cachedDeviceId = this.fingerprintCache.get(fingerprintHash);
            if (cachedDeviceId) {
              cachedDevice = this.deviceCache.get(cachedDeviceId);
              if (cachedDevice && cachedDevice.userId === userId) {
                return [2 /*return*/, cachedDevice];
              }
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .select("*")
                .eq("device_fingerprint", fingerprintHash)
                .eq("user_id", userId)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, null];
            }
            device = this.mapDatabaseToDevice(data);
            // Cache the device
            this.deviceCache.set(device.id, device);
            this.fingerprintCache.set(fingerprintHash, device.id);
            return [2 /*return*/, device];
          case 2:
            error_12 = _b.sent();
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.updateDeviceUsage = function (deviceId, updates) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, updatedDevice;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  last_used: updates.lastUsed.toISOString(),
                  usage_count: this.supabase.rpc("increment_usage_count", { device_id: deviceId }),
                })
                .eq("id", deviceId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              throw new types_1.SessionError("Failed to update device usage", "SYSTEM_ERROR", {
                error: error,
              });
            }
            updatedDevice = this.mapDatabaseToDevice(data);
            // Update cache
            this.deviceCache.set(deviceId, updatedDevice);
            return [2 /*return*/, updatedDevice];
        }
      });
    });
  };
  DeviceManager.prototype.assessDeviceRisk = function (device) {
    return __awaiter(this, void 0, void 0, function () {
      var reasons, riskScore, daysSinceRegistration, daysSinceLastUse;
      return __generator(this, (_a) => {
        reasons = [];
        riskScore = 0;
        daysSinceRegistration =
          (Date.now() - device.registeredAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceRegistration < 1) {
          reasons.push("New device (less than 1 day old)");
          riskScore += 20;
        }
        // Check usage patterns
        if (device.usageCount < 3) {
          reasons.push("Low usage count");
          riskScore += 10;
        }
        // Check security events
        if (device.securityEvents > 0) {
          reasons.push("".concat(device.securityEvents, " security events"));
          riskScore += device.securityEvents * 5;
        }
        // Check if device is trusted
        if (!device.isTrusted) {
          reasons.push("Device not trusted");
          riskScore += 15;
        }
        daysSinceLastUse = (Date.now() - device.lastUsed.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastUse > 30) {
          reasons.push("Device not used for over 30 days");
          riskScore += 10;
        }
        return [
          2 /*return*/,
          {
            riskScore: Math.min(100, riskScore),
            reasons: reasons,
          },
        ];
      });
    });
  };
  DeviceManager.prototype.verifyDeviceTrust = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Simplified verification - in a real implementation, this would:
        // - Send verification codes via email/SMS
        // - Validate biometric data
        // - Check admin approval
        // - Validate time-based tokens
        switch (params.verificationMethod) {
          case "admin":
            // Admin approval - always allow for demo
            return [2 /*return*/, true];
          case "email":
          case "sms":
            // Code verification - simplified for demo
            return [2 /*return*/, params.verificationCode === "123456"];
          case "biometric":
            // Biometric verification - simplified for demo
            return [2 /*return*/, true];
          default:
            return [2 /*return*/, false];
        }
        return [2 /*return*/];
      });
    });
  };
  DeviceManager.prototype.terminateDeviceSessions = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var device, error_13;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.getDeviceById(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) return [2 /*return*/];
            // Terminate all active sessions for this device
            return [
              4 /*yield*/,
              this.supabase
                .from("user_sessions")
                .update({
                  is_active: false,
                  terminated_at: new Date().toISOString(),
                  termination_reason: "device_blocked",
                })
                .eq("device_fingerprint", device.deviceFingerprint)
                .eq("is_active", true),
            ];
          case 2:
            // Terminate all active sessions for this device
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_13 = _a.sent();
            console.error("Failed to terminate device sessions:", error_13);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.detectDeviceType = (fingerprint) => {
    var userAgent = fingerprint.userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
      return "mobile";
    }
    if (/tablet|ipad/i.test(userAgent)) {
      return "tablet";
    }
    if (/windows|macintosh|linux/i.test(userAgent)) {
      // Distinguish between desktop and laptop based on screen resolution
      var _a = fingerprint.screenResolution.split("x").map(Number),
        width = _a[0],
        height = _a[1];
      if (width >= 1920 && height >= 1080) {
        return "desktop";
      }
      return "laptop";
    }
    return "unknown";
  };
  DeviceManager.prototype.extractDeviceMetadata = function (fingerprint) {
    var userAgent = fingerprint.userAgent;
    return {
      os: this.extractOS(userAgent),
      osVersion: this.extractOSVersion(userAgent),
      browserVersion: this.extractBrowserVersion(userAgent),
      hardwareConcurrency: fingerprint.hardwareConcurrency,
      maxTouchPoints: fingerprint.maxTouchPoints,
      colorDepth: fingerprint.colorDepth,
      pixelRatio: fingerprint.pixelRatio,
    };
  };
  DeviceManager.prototype.generateDeviceName = function (fingerprint) {
    var os = this.extractOS(fingerprint.userAgent);
    var browser = this.extractBrowser(fingerprint.userAgent);
    var deviceType = this.detectDeviceType(fingerprint);
    return "".concat(os, " ").concat(deviceType, " (").concat(browser, ")");
  };
  DeviceManager.prototype.extractBrowser = (userAgent) => {
    if (/chrome/i.test(userAgent)) return "Chrome";
    if (/firefox/i.test(userAgent)) return "Firefox";
    if (/safari/i.test(userAgent)) return "Safari";
    if (/edge/i.test(userAgent)) return "Edge";
    if (/opera/i.test(userAgent)) return "Opera";
    return "Unknown";
  };
  DeviceManager.prototype.extractOS = (userAgent) => {
    if (/windows/i.test(userAgent)) return "Windows";
    if (/macintosh|mac os/i.test(userAgent)) return "macOS";
    if (/linux/i.test(userAgent)) return "Linux";
    if (/android/i.test(userAgent)) return "Android";
    if (/iphone|ipad|ipod/i.test(userAgent)) return "iOS";
    return "Unknown";
  };
  DeviceManager.prototype.extractOSVersion = (userAgent) => {
    // Simplified OS version extraction
    var windowsMatch = userAgent.match(/Windows NT ([\d.]+)/);
    if (windowsMatch) return windowsMatch[1];
    var macMatch = userAgent.match(/Mac OS X ([\d_]+)/);
    if (macMatch) return macMatch[1].replace(/_/g, ".");
    var androidMatch = userAgent.match(/Android ([\d.]+)/);
    if (androidMatch) return androidMatch[1];
    var iosMatch = userAgent.match(/OS ([\d_]+)/);
    if (iosMatch) return iosMatch[1].replace(/_/g, ".");
    return "Unknown";
  };
  DeviceManager.prototype.extractBrowserVersion = (userAgent) => {
    // Simplified browser version extraction
    var chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
    if (chromeMatch) return chromeMatch[1];
    var firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
    if (firefoxMatch) return firefoxMatch[1];
    var safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/);
    if (safariMatch) return safariMatch[1];
    var edgeMatch = userAgent.match(/Edge\/([\d.]+)/);
    if (edgeMatch) return edgeMatch[1];
    return "Unknown";
  };
  DeviceManager.prototype.generateAudioFingerprint = (audioContext) => {
    // Simplified audio fingerprinting
    try {
      var oscillator = audioContext.createOscillator();
      var analyser = audioContext.createAnalyser();
      var gainNode = audioContext.createGain();
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 1000;
      gainNode.gain.value = 0;
      var dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      return crypto_1.default.createHash("md5").update(dataArray.toString()).digest("hex");
    } catch (error) {
      return "audio_error";
    }
  };
  DeviceManager.prototype.generateCanvasFingerprint = (canvas) => {
    try {
      var ctx = canvas.getContext("2d");
      if (!ctx) return "canvas_error";
      // Draw some shapes and text
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprinting", 2, 2);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillRect(100, 5, 80, 20);
      return crypto_1.default.createHash("md5").update(canvas.toDataURL()).digest("hex");
    } catch (error) {
      return "canvas_error";
    }
  };
  DeviceManager.prototype.generateDeviceId = () =>
    "dev_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
  DeviceManager.prototype.mapDatabaseToDevice = (data) => ({
    id: data.id,
    userId: data.user_id,
    clinicId: data.clinic_id,
    deviceFingerprint: data.device_fingerprint,
    deviceName: data.device_name,
    deviceType: data.device_type,
    platform: data.platform,
    browser: data.browser,
    screenResolution: data.screen_resolution,
    timezone: data.timezone,
    isTrusted: data.is_trusted,
    isBlocked: data.is_blocked,
    registeredAt: new Date(data.registered_at),
    lastUsed: new Date(data.last_used),
    usageCount: data.usage_count,
    securityEvents: data.security_events,
    metadata: data.metadata,
  });
  DeviceManager.prototype.logDeviceEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var error_14;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_audit_logs").insert({
                device_id: params.deviceId,
                user_id: params.userId,
                action: params.action,
                details: params.details,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_14 = _a.sent();
            console.error("Failed to log device event:", error_14);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.initializeDeviceData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var blockedDevices, error_15;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").select("id").eq("is_blocked", true),
            ];
          case 1:
            blockedDevices = _a.sent().data;
            if (blockedDevices) {
              blockedDevices.forEach((device) => _this.blockedDevices.add(device.id));
            }
            return [3 /*break*/, 3];
          case 2:
            error_15 = _a.sent();
            console.error("Failed to initialize device data:", error_15);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup resources
   */
  DeviceManager.prototype.destroy = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        this.deviceCache.clear();
        this.fingerprintCache.clear();
        this.blockedDevices.clear();
        this.removeAllListeners();
        return [2 /*return*/];
      });
    });
  };
  return DeviceManager;
})(events_1.EventEmitter);
exports.DeviceManager = DeviceManager;
