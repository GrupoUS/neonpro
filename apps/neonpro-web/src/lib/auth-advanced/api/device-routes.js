"use strict";
// Device API Routes
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
exports.DeviceRoutes = void 0;
exports.createDeviceRoutes = createDeviceRoutes;
var server_1 = require("next/server");
/**
 * Device API route handlers
 */
var DeviceRoutes = /** @class */ (function () {
  function DeviceRoutes(deviceManager, sessionManager, securityMonitor) {
    this.deviceManager = deviceManager;
    this.sessionManager = sessionManager;
    this.securityMonitor = securityMonitor;
  }
  /**
   * Register new device
   * POST /api/auth/devices/register
   */
  DeviceRoutes.prototype.registerDevice = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body, userId, deviceInfo, clientIP, userAgent, deviceRegistration, deviceId, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (userId = body.userId), (deviceInfo = body.deviceInfo);
            if (!userId || !deviceInfo) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required fields: userId, deviceInfo" },
                  { status: 400 },
                ),
              ];
            }
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            // Validate device info
            if (!this.validateDeviceInfo(deviceInfo)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Invalid device information" },
                  { status: 400 },
                ),
              ];
            }
            deviceRegistration = __assign(__assign({}, deviceInfo), {
              userId: userId,
              ipAddress: clientIP,
              userAgent: userAgent,
              registeredAt: new Date(),
            });
            return [4 /*yield*/, this.deviceManager.registerDevice(deviceRegistration)];
          case 2:
            deviceId = _a.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "device_registered",
                userId: userId,
                severity: "info",
                details: {
                  deviceId: deviceId,
                  deviceType: deviceInfo.type,
                  platform: deviceInfo.platform,
                  ipAddress: clientIP,
                },
                timestamp: new Date(),
                ipAddress: clientIP,
                userAgent: userAgent,
              }),
            ];
          case 3:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                deviceId: deviceId,
                message: "Device registered successfully",
              }),
            ];
          case 4:
            error_1 = _a.sent();
            console.error("Register device error:", error_1);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to register device" }, { status: 500 }),
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user devices
   * GET /api/auth/devices/user/:userId
   */
  DeviceRoutes.prototype.getUserDevices = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, devices, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAuthorization(request, userId)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.deviceManager.getUserDevices(userId)];
          case 2:
            devices = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                devices: devices,
                count: devices.length,
              }),
            ];
          case 3:
            error_2 = _a.sent();
            console.error("Get user devices error:", error_2);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to get user devices" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get device info
   * GET /api/auth/devices/:deviceId
   */
  DeviceRoutes.prototype.getDevice = function (request, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var device, authResult, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Device not found" }, { status: 404 }),
              ];
            }
            return [4 /*yield*/, this.verifyAuthorization(request, device.userId)];
          case 2:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                device: device,
              }),
            ];
          case 3:
            error_3 = _a.sent();
            console.error("Get device error:", error_3);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to get device" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update device trust level
   * PUT /api/auth/devices/:deviceId/trust
   */
  DeviceRoutes.prototype.updateDeviceTrust = function (request, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, trusted, reason, device, authResult, success, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (trusted = body.trusted), (reason = body.reason);
            if (typeof trusted !== "boolean") {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid trust value" }, { status: 400 }),
              ];
            }
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 2:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Device not found" }, { status: 404 }),
              ];
            }
            return [4 /*yield*/, this.verifyAuthorization(request, device.userId)];
          case 3:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.deviceManager.updateDeviceTrust(deviceId, trusted, reason)];
          case 4:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Failed to update device trust" },
                  { status: 400 },
                ),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: trusted ? "device_trusted" : "device_untrusted",
                userId: device.userId,
                severity: "info",
                details: {
                  deviceId: deviceId,
                  trusted: trusted,
                  reason: reason,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 5:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Device ".concat(trusted ? "trusted" : "untrusted", " successfully"),
              }),
            ];
          case 6:
            error_4 = _a.sent();
            console.error("Update device trust error:", error_4);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update device trust" },
                { status: 500 },
              ),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Block/unblock device
   * PUT /api/auth/devices/:deviceId/block
   */
  DeviceRoutes.prototype.blockDevice = function (request, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, blocked, reason, device, authResult, success, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 8, , 9]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (blocked = body.blocked), (reason = body.reason);
            if (typeof blocked !== "boolean") {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid block value" }, { status: 400 }),
              ];
            }
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 2:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Device not found" }, { status: 404 }),
              ];
            }
            return [4 /*yield*/, this.verifyDeviceAuthorization(request, device.userId)];
          case 3:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.deviceManager.blockDevice(deviceId, blocked, reason)];
          case 4:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Failed to update device block status" },
                  { status: 400 },
                ),
              ];
            }
            if (!blocked) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.sessionManager.terminateDeviceSessions(deviceId, "device_blocked"),
            ];
          case 5:
            _a.sent();
            _a.label = 6;
          case 6:
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: blocked ? "device_blocked" : "device_unblocked",
                userId: device.userId,
                severity: blocked ? "warning" : "info",
                details: {
                  deviceId: deviceId,
                  blocked: blocked,
                  reason: reason,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 7:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Device ".concat(blocked ? "blocked" : "unblocked", " successfully"),
              }),
            ];
          case 8:
            error_5 = _a.sent();
            console.error("Block device error:", error_5);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update device block status" },
                { status: 500 },
              ),
            ];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Remove device
   * DELETE /api/auth/devices/:deviceId
   */
  DeviceRoutes.prototype.removeDevice = function (request, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var device, authResult, success, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Device not found" }, { status: 404 }),
              ];
            }
            return [4 /*yield*/, this.verifyAuthorization(request, device.userId)];
          case 2:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            // Terminate all sessions for this device
            return [
              4 /*yield*/,
              this.sessionManager.terminateDeviceSessions(deviceId, "device_removed"),
            ];
          case 3:
            // Terminate all sessions for this device
            _a.sent();
            return [4 /*yield*/, this.deviceManager.removeDevice(deviceId)];
          case 4:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Failed to remove device" }, { status: 400 }),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "device_removed",
                userId: device.userId,
                severity: "info",
                details: {
                  deviceId: deviceId,
                  deviceType: device.type,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 5:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Device removed successfully",
              }),
            ];
          case 6:
            error_6 = _a.sent();
            console.error("Remove device error:", error_6);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to remove device" }, { status: 500 }),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate device fingerprint
   * POST /api/auth/devices/validate
   */
  DeviceRoutes.prototype.validateDevice = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body, deviceId, fingerprint, isValid, device, trustScore, _a, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 7, , 8]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _b.sent();
            (deviceId = body.deviceId), (fingerprint = body.fingerprint);
            if (!deviceId || !fingerprint) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required fields: deviceId, fingerprint" },
                  { status: 400 },
                ),
              ];
            }
            return [4 /*yield*/, this.deviceManager.validateDevice(deviceId, fingerprint)];
          case 2:
            isValid = _b.sent();
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 3:
            device = _b.sent();
            if (!device) return [3 /*break*/, 5];
            return [4 /*yield*/, this.deviceManager.calculateTrustScore(device)];
          case 4:
            _a = _b.sent();
            return [3 /*break*/, 6];
          case 5:
            _a = 0;
            _b.label = 6;
          case 6:
            trustScore = _a;
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                valid: isValid,
                trustScore: trustScore,
                device: device
                  ? {
                      id: device.id,
                      name: device.name,
                      type: device.type,
                      trusted: device.trusted,
                      blocked: device.blocked,
                    }
                  : null,
              }),
            ];
          case 7:
            error_7 = _b.sent();
            console.error("Validate device error:", error_7);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to validate device" }, { status: 500 }),
            ];
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get device analytics
   * GET /api/auth/devices/analytics
   */
  DeviceRoutes.prototype.getDeviceAnalytics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, url, period, userId, analytics, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            period = url.searchParams.get("period") || "30d";
            userId = url.searchParams.get("userId");
            return [
              4 /*yield*/,
              this.deviceManager.getDeviceAnalytics({
                period: period,
                userId: userId || undefined,
              }),
            ];
          case 2:
            analytics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                analytics: analytics,
                period: period,
              }),
            ];
          case 3:
            error_8 = _a.sent();
            console.error("Get device analytics error:", error_8);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get device analytics" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update device info
   * PUT /api/auth/devices/:deviceId
   */
  DeviceRoutes.prototype.updateDevice = function (request, deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, name_1, location_1, device, authResult, updateData, success, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (name_1 = body.name), (location_1 = body.location);
            return [4 /*yield*/, this.deviceManager.getDevice(deviceId)];
          case 2:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Device not found" }, { status: 404 }),
              ];
            }
            return [4 /*yield*/, this.verifyAuthorization(request, device.userId)];
          case 3:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            updateData = {};
            if (name_1) updateData.name = name_1;
            if (location_1) updateData.location = location_1;
            return [4 /*yield*/, this.deviceManager.updateDevice(deviceId, updateData)];
          case 4:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Failed to update device" }, { status: 400 }),
              ];
            }
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "device_updated",
                userId: device.userId,
                severity: "info",
                details: {
                  deviceId: deviceId,
                  updates: updateData,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 5:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Device updated successfully",
              }),
            ];
          case 6:
            error_9 = _a.sent();
            console.error("Update device error:", error_9);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update device" }, { status: 500 }),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  DeviceRoutes.prototype.getClientIP = function (request) {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return realIP || "unknown";
  };
  DeviceRoutes.prototype.validateDeviceInfo = function (deviceInfo) {
    var required = ["name", "type", "platform", "fingerprint"];
    return required.every(function (field) {
      return deviceInfo[field];
    });
  };
  DeviceRoutes.prototype.verifyAuthorization = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || session.userId !== userId) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 }),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  DeviceRoutes.prototype.verifyDeviceAuthorization = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid session" }, { status: 401 }),
              ];
            }
            // Allow device owner or admin
            if (session.userId !== userId && !["owner", "manager"].includes(session.userRole)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 }),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  DeviceRoutes.prototype.verifyAdminAuthorization = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || !["owner", "manager"].includes(session.userRole)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Forbidden - Admin access required" },
                  { status: 403 },
                ),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  return DeviceRoutes;
})();
exports.DeviceRoutes = DeviceRoutes;
/**
 * Create device routes handler
 */
function createDeviceRoutes(deviceManager, sessionManager, securityMonitor) {
  return new DeviceRoutes(deviceManager, sessionManager, securityMonitor);
}
