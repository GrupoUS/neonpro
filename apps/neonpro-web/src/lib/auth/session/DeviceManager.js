"use strict";
/**
 * Device Manager - Device Registration and Trust Management
 *
 * Handles device registration, fingerprinting, trust management,
 * and suspicious activity detection for enhanced security.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */
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
exports.DeviceManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var utils_1 = require("./utils");
/**
 * Device Manager Class
 *
 * Core device management operations:
 * - Device registration and fingerprinting
 * - Trust management and verification
 * - Suspicious activity detection
 * - Device limits and security controls
 * - Cross-device synchronization support
 */
var DeviceManager = /** @class */ (function () {
  function DeviceManager(config) {
    this.config = config;
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
    );
  }
  /**
   * Register or update a device
   */
  DeviceManager.prototype.registerDevice = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var fingerprint,
        existingDevice,
        deviceLimitCheck,
        userAgentInfo,
        deviceId,
        deviceData,
        _a,
        data,
        error,
        device,
        error_1;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            // Validate input
            if (!(0, utils_1.validateUUID)(request.userId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_USER_ID",
                    message: "Invalid user ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            fingerprint =
              request.fingerprint ||
              (0, utils_1.generateDeviceFingerprint)({
                userAgent: request.userAgent,
                screen: request.screen,
                timezone: request.timezone,
                language: request.language,
              });
            return [4 /*yield*/, this.getDeviceByFingerprint(fingerprint)];
          case 1:
            existingDevice = _b.sent();
            if (existingDevice.success && existingDevice.data) {
              // Update existing device
              return [2 /*return*/, this.updateExistingDevice(existingDevice.data, request)];
            }
            return [4 /*yield*/, this.checkDeviceLimit(request.userId)];
          case 2:
            deviceLimitCheck = _b.sent();
            if (!deviceLimitCheck.success) {
              return [2 /*return*/, deviceLimitCheck];
            }
            userAgentInfo = (0, utils_1.parseUserAgent)(request.userAgent);
            deviceId = crypto.randomUUID();
            deviceData = (0, utils_1.removeUndefined)({
              id: deviceId,
              user_id: request.userId,
              fingerprint: fingerprint,
              name: request.name,
              type: request.type,
              user_agent: request.userAgent,
              ip_address: request.ipAddress,
              location: request.location ? JSON.stringify(request.location) : null,
              screen_info: request.screen ? JSON.stringify(request.screen) : null,
              timezone: request.timezone,
              language: request.language,
              browser: userAgentInfo.browser,
              os: userAgentInfo.os,
              trusted: false, // New devices start as untrusted
              trust_expires_at: null,
              blocked: false,
              last_seen: new Date().toISOString(),
              last_ip_address: request.ipAddress,
              last_location: request.location ? JSON.stringify(request.location) : null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              this.supabase.from("devices").insert(deviceData).select().single(),
            ];
          case 3:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_REGISTRATION_FAILED",
                    message: "Failed to register device",
                    details: { error: error.message },
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            // Check for auto-trust conditions
            return [4 /*yield*/, this.checkAutoTrustConditions(device)];
          case 4:
            // Check for auto-trust conditions
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 5:
            error_1 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_REGISTRATION_ERROR",
                  message: "Internal error registering device",
                  details: { error: error_1 instanceof Error ? error_1.message : "Unknown error" },
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
   * Get device by fingerprint
   */
  DeviceManager.prototype.getDeviceByFingerprint = function (fingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, device, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("devices").select("*").eq("fingerprint", fingerprint).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_NOT_FOUND",
                    message: "Device not found",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_2 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_DEVICE_ERROR",
                  message: "Error retrieving device",
                  details: { error: error_2 instanceof Error ? error_2.message : "Unknown error" },
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
   * Get device by ID
   */
  DeviceManager.prototype.getDevice = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, device, error_3;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase.from("devices").select("*").eq("id", deviceId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_NOT_FOUND",
                    message: "Device not found",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_3 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_DEVICE_ERROR",
                  message: "Error retrieving device",
                  details: { error: error_3 instanceof Error ? error_3.message : "Unknown error" },
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
   * Get all devices for a user
   */
  DeviceManager.prototype.getUserDevices = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, devices, error_4;
      var _this = this;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(userId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_USER_ID",
                    message: "Invalid user ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .select("*")
                .eq("user_id", userId)
                .order("last_seen", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "GET_DEVICES_FAILED",
                    message: "Failed to retrieve user devices",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            devices = data.map(function (row) {
              return _this.convertToDeviceData(row);
            });
            return [
              2 /*return*/,
              {
                success: true,
                data: devices,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_4 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "GET_DEVICES_ERROR",
                  message: "Error retrieving user devices",
                  details: { error: error_4 instanceof Error ? error_4.message : "Unknown error" },
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
   * Trust a device
   */
  DeviceManager.prototype.trustDevice = function (deviceId, trustDuration) {
    return __awaiter(this, void 0, void 0, function () {
      var duration, trustExpiresAt, _a, data, error, device, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            duration = trustDuration || this.config.trustDuration;
            trustExpiresAt = new Date(Date.now() + duration).toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update({
                  trusted: true,
                  trust_expires_at: trustExpiresAt,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deviceId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_TRUST_FAILED",
                    message: "Failed to trust device",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_5 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_TRUST_ERROR",
                  message: "Error trusting device",
                  details: { error: error_5 instanceof Error ? error_5.message : "Unknown error" },
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
   * Revoke device trust
   */
  DeviceManager.prototype.revokeDeviceTrust = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, device, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update({
                  trusted: false,
                  trust_expires_at: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deviceId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_TRUST_REVOKE_FAILED",
                    message: "Failed to revoke device trust",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_6 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_TRUST_REVOKE_ERROR",
                  message: "Error revoking device trust",
                  details: { error: error_6 instanceof Error ? error_6.message : "Unknown error" },
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
   * Block a device
   */
  DeviceManager.prototype.blockDevice = function (deviceId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, device, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update({
                  blocked: true,
                  trusted: false,
                  trust_expires_at: null,
                  block_reason: reason,
                  blocked_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deviceId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_BLOCK_FAILED",
                    message: "Failed to block device",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_7 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_BLOCK_ERROR",
                  message: "Error blocking device",
                  details: { error: error_7 instanceof Error ? error_7.message : "Unknown error" },
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
   * Unblock a device
   */
  DeviceManager.prototype.unblockDevice = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, device, error_8;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            if (!(0, utils_1.validateUUID)(deviceId)) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_DEVICE_ID",
                    message: "Invalid device ID format",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update({
                  blocked: false,
                  block_reason: null,
                  blocked_at: null,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", deviceId)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_UNBLOCK_FAILED",
                    message: "Failed to unblock device",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_8 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_UNBLOCK_ERROR",
                  message: "Error unblocking device",
                  details: { error: error_8 instanceof Error ? error_8.message : "Unknown error" },
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
   * Initiate device trust verification
   */
  DeviceManager.prototype.initiateDeviceTrust = function (deviceId, verificationMethod) {
    return __awaiter(this, void 0, void 0, function () {
      var verificationCode, expiresAt, error, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
            return [
              4 /*yield*/,
              this.supabase.from("device_verifications").insert({
                device_id: deviceId,
                verification_code: verificationCode,
                method: verificationMethod,
                expires_at: expiresAt,
                created_at: new Date().toISOString(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "VERIFICATION_INIT_FAILED",
                    message: "Failed to initiate device verification",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            // TODO: Send verification code via email/SMS
            // This would integrate with your notification service
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  verificationMethod: verificationMethod,
                  expiresAt: expiresAt,
                  message: "Verification code sent via ".concat(verificationMethod),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_9 = _a.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "VERIFICATION_INIT_ERROR",
                  message: "Error initiating device verification",
                  details: { error: error_9 instanceof Error ? error_9.message : "Unknown error" },
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
   * Verify device trust with code
   */
  DeviceManager.prototype.verifyDeviceTrust = function (deviceId, verificationCode) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, verification, verifyError, trustResult, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_verifications")
                .select("*")
                .eq("device_id", deviceId)
                .eq("verification_code", verificationCode)
                .gt("expires_at", new Date().toISOString())
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (verification = _a.data), (verifyError = _a.error);
            if (verifyError || !verification) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "INVALID_VERIFICATION_CODE",
                    message: "Invalid or expired verification code",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [4 /*yield*/, this.trustDevice(deviceId)];
          case 2:
            trustResult = _b.sent();
            if (!trustResult.success) {
              return [2 /*return*/, trustResult];
            }
            // Clean up verification record
            return [
              4 /*yield*/,
              this.supabase.from("device_verifications").delete().eq("id", verification.id),
            ];
          case 3:
            // Clean up verification record
            _b.sent();
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  device: trustResult.data,
                  verified: true,
                  verifiedAt: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 4:
            error_10 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "VERIFICATION_ERROR",
                  message: "Error verifying device trust",
                  details: {
                    error: error_10 instanceof Error ? error_10.message : "Unknown error",
                  },
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
   * Revoke expired trust for all devices
   */
  DeviceManager.prototype.revokeExpiredTrust = function () {
    return __awaiter(this, void 0, void 0, function () {
      var now, _a, data, error, error_11;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            now = new Date().toISOString();
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update({
                  trusted: false,
                  trust_expires_at: null,
                  updated_at: now,
                })
                .eq("trusted", true)
                .lt("trust_expires_at", now)
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "TRUST_REVOKE_FAILED",
                    message: "Failed to revoke expired trust",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  revokedCount: (data === null || data === void 0 ? void 0 : data.length) || 0,
                  revokedAt: now,
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_11 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "TRUST_REVOKE_ERROR",
                  message: "Error revoking expired trust",
                  details: {
                    error: error_11 instanceof Error ? error_11.message : "Unknown error",
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
   * Clean up inactive devices
   */
  DeviceManager.prototype.cleanupInactiveDevices = function () {
    return __awaiter(this, arguments, void 0, function (inactiveDays) {
      var cutoffDate, _a, data, error, error_12;
      if (inactiveDays === void 0) {
        inactiveDays = 90;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .delete()
                .lt("last_seen", cutoffDate.toISOString())
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_CLEANUP_FAILED",
                    message: "Failed to cleanup inactive devices",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: {
                  deletedCount: (data === null || data === void 0 ? void 0 : data.length) || 0,
                  cutoffDate: cutoffDate.toISOString(),
                  cleanupDate: new Date().toISOString(),
                },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_12 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_CLEANUP_ERROR",
                  message: "Error cleaning up inactive devices",
                  details: {
                    error: error_12 instanceof Error ? error_12.message : "Unknown error",
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
   * Get device statistics
   */
  DeviceManager.prototype.getDeviceStats = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a,
        devices,
        error,
        now_1,
        trustedDevices,
        blockedDevices,
        recentDevices,
        deviceTypes,
        operatingSystems,
        error_13;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("devices").select("*").eq("user_id", userId)];
          case 1:
            (_a = _b.sent()), (devices = _a.data), (error = _a.error);
            if (error) {
              throw new Error("Failed to fetch devices: ".concat(error.message));
            }
            now_1 = new Date();
            trustedDevices = devices.filter(function (d) {
              return d.trusted && (!d.trust_expires_at || new Date(d.trust_expires_at) > now_1);
            });
            blockedDevices = devices.filter(function (d) {
              return d.blocked;
            });
            recentDevices = devices.filter(function (d) {
              var lastSeen = new Date(d.last_seen);
              var daysDiff = (now_1.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff <= 30;
            });
            deviceTypes = devices.reduce(function (acc, device) {
              var type = device.type || "unknown";
              acc[type] = (acc[type] || 0) + 1;
              return acc;
            }, {});
            operatingSystems = devices.reduce(function (acc, device) {
              var os = device.os || "unknown";
              acc[os] = (acc[os] || 0) + 1;
              return acc;
            }, {});
            return [
              2 /*return*/,
              {
                total: devices.length,
                trusted: trustedDevices.length,
                blocked: blockedDevices.length,
                recent: recentDevices.length,
                deviceTypes: deviceTypes,
                operatingSystems: operatingSystems,
                generatedAt: now_1.toISOString(),
              },
            ];
          case 2:
            error_13 = _b.sent();
            throw new Error(
              "Error generating device statistics: ".concat(
                error_13 instanceof Error ? error_13.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Private helper methods
   */
  DeviceManager.prototype.updateExistingDevice = function (existingDevice, request) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, _a, data, error, device, error_14;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            updateData = (0, utils_1.removeUndefined)({
              name: request.name || existingDevice.name,
              ip_address: request.ipAddress,
              location: request.location ? JSON.stringify(request.location) : undefined,
              last_seen: new Date().toISOString(),
              last_ip_address: request.ipAddress,
              last_location: request.location ? JSON.stringify(request.location) : undefined,
              updated_at: new Date().toISOString(),
            });
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .update(updateData)
                .eq("id", existingDevice.id)
                .select()
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_UPDATE_FAILED",
                    message: "Failed to update existing device",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            device = this.convertToDeviceData(data);
            return [
              2 /*return*/,
              {
                success: true,
                data: device,
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_14 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_UPDATE_ERROR",
                  message: "Error updating existing device",
                  details: {
                    error: error_14 instanceof Error ? error_14.message : "Unknown error",
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
  DeviceManager.prototype.checkDeviceLimit = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, devices, error, deviceCount, error_15;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.supabase.from("devices").select("id").eq("user_id", userId)];
          case 1:
            (_a = _b.sent()), (devices = _a.data), (error = _a.error);
            if (error) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "DEVICE_LIMIT_CHECK_FAILED",
                    message: "Failed to check device limit",
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            deviceCount = (devices === null || devices === void 0 ? void 0 : devices.length) || 0;
            if (deviceCount >= this.config.maxDevicesPerUser) {
              return [
                2 /*return*/,
                {
                  success: false,
                  error: {
                    code: "MAX_DEVICES_EXCEEDED",
                    message: "Maximum devices per user (".concat(
                      this.config.maxDevicesPerUser,
                      ") exceeded",
                    ),
                    details: {
                      currentDevices: deviceCount,
                      maxAllowed: this.config.maxDevicesPerUser,
                    },
                  },
                  timestamp: new Date().toISOString(),
                },
              ];
            }
            return [
              2 /*return*/,
              {
                success: true,
                data: { currentDevices: deviceCount, maxAllowed: this.config.maxDevicesPerUser },
                timestamp: new Date().toISOString(),
              },
            ];
          case 2:
            error_15 = _b.sent();
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "DEVICE_LIMIT_CHECK_ERROR",
                  message: "Error checking device limit",
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
  DeviceManager.prototype.checkAutoTrustConditions = function (device) {
    return __awaiter(this, void 0, void 0, function () {
      var trustedDevices, sameNetworkTrusted, error_16;
      var _this = this;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            if (!(this.config.autoTrustSameNetwork && device.ipAddress)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.supabase
                .from("devices")
                .select("ip_address")
                .eq("user_id", device.userId)
                .eq("trusted", true),
            ];
          case 1:
            trustedDevices = _a.sent().data;
            sameNetworkTrusted =
              trustedDevices === null || trustedDevices === void 0
                ? void 0
                : trustedDevices.some(function (td) {
                    return _this.isSameNetwork(device.ipAddress, td.ip_address);
                  });
            if (!sameNetworkTrusted) return [3 /*break*/, 3];
            return [4 /*yield*/, this.trustDevice(device.id, this.config.trustDuration)];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            return [3 /*break*/, 5];
          case 4:
            error_16 = _a.sent();
            console.error("Error checking auto-trust conditions:", error_16);
            return [3 /*break*/, 5];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.isSameNetwork = function (ip1, ip2) {
    // Simple same network check (same /24 subnet)
    var parts1 = ip1.split(".");
    var parts2 = ip2.split(".");
    return (
      parts1.length === 4 &&
      parts2.length === 4 &&
      parts1[0] === parts2[0] &&
      parts1[1] === parts2[1] &&
      parts1[2] === parts2[2]
    );
  };
  DeviceManager.prototype.convertToDeviceData = function (row) {
    return {
      id: row.id,
      userId: row.user_id,
      fingerprint: row.fingerprint,
      name: row.name,
      type: row.type,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      location: row.location ? JSON.parse(row.location) : undefined,
      screen: row.screen_info ? JSON.parse(row.screen_info) : undefined,
      timezone: row.timezone,
      language: row.language,
      browser: row.browser,
      os: row.os,
      trusted: row.trusted,
      trustExpiresAt: row.trust_expires_at,
      blocked: row.blocked,
      blockReason: row.block_reason,
      blockedAt: row.blocked_at,
      lastSeen: row.last_seen,
      lastIpAddress: row.last_ip_address,
      lastLocation: row.last_location ? JSON.parse(row.last_location) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  };
  return DeviceManager;
})();
exports.DeviceManager = DeviceManager;
exports.default = DeviceManager;
