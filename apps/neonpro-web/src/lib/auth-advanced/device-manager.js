// Device Manager Service
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
exports.DeviceManager = void 0;
var config_1 = require("./config");
var DeviceManager = /** @class */ (() => {
  function DeviceManager(supabase) {
    this.fingerprintCache = new Map();
    this.trustScoreCache = new Map();
    this.supabase = supabase;
  }
  // Device Registration
  DeviceManager.prototype.registerDevice = function (userId, deviceInfo, location) {
    return __awaiter(this, void 0, void 0, function () {
      var fingerprint,
        trustScore,
        riskAssessment,
        deviceRegistration,
        existingDevice,
        _a,
        data,
        error,
        _b,
        data,
        error,
        error_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 9, , 10]);
            return [4 /*yield*/, this.generateDeviceFingerprint(deviceInfo)];
          case 1:
            fingerprint = _c.sent();
            return [4 /*yield*/, this.calculateDeviceTrustScore(fingerprint, location)];
          case 2:
            trustScore = _c.sent();
            return [4 /*yield*/, this.assessDeviceRisk(fingerprint, location)];
          case 3:
            riskAssessment = _c.sent();
            deviceRegistration = {
              user_id: userId,
              device_fingerprint: fingerprint.userAgent + fingerprint.platform,
              device_name: this.generateDeviceName(deviceInfo),
              device_type: this.detectDeviceType(deviceInfo),
              browser_name: deviceInfo.browser || "Unknown",
              browser_version: deviceInfo.browserVersion || "Unknown",
              os_name: deviceInfo.os || "Unknown",
              os_version: deviceInfo.osVersion || "Unknown",
              is_mobile: this.isMobileDevice(deviceInfo),
              is_trusted: trustScore >= config_1.DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
              trust_score: trustScore,
              risk_indicators: riskAssessment.riskFactors,
              last_seen: new Date(),
              location: location,
              fingerprint_data: fingerprint,
              verification_status: riskAssessment.requiresVerification ? "pending" : "verified",
              is_blocked: riskAssessment.isBlocked,
            };
            return [
              4 /*yield*/,
              this.findExistingDevice(userId, deviceRegistration.device_fingerprint),
            ];
          case 4:
            existingDevice = _c.sent();
            if (!existingDevice) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update(__assign(__assign({}, deviceRegistration), { updated_at: new Date() }))
                .eq("id", existingDevice.id)
                .select()
                .single(),
            ];
          case 5:
            (_a = _c.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 6:
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .insert(
                  __assign(__assign({}, deviceRegistration), {
                    id: "device-"
                      .concat(Date.now(), "-")
                      .concat(Math.random().toString(36).substring(2)),
                    created_at: new Date(),
                    updated_at: new Date(),
                  }),
                )
                .select()
                .single(),
            ];
          case 7:
            (_b = _c.sent()), (data = _b.data), (error = _b.error);
            if (error) throw error;
            return [2 /*return*/, data];
          case 8:
            return [3 /*break*/, 10];
          case 9:
            error_1 = _c.sent();
            console.error("Error registering device:", error_1);
            throw error_1;
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  // Device Validation
  DeviceManager.prototype.validateDevice = function (userId, deviceFingerprint, currentLocation) {
    return __awaiter(this, void 0, void 0, function () {
      var device, riskAssessment, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.getDeviceByFingerprint(userId, deviceFingerprint)];
          case 1:
            device = _a.sent();
            if (!device) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  riskAssessment: {
                    trustScore: 0,
                    riskFactors: ["unknown_device"],
                    recommendations: ["Register device", "Complete verification"],
                    isBlocked: true,
                    requiresVerification: true,
                  },
                },
              ];
            }
            // Check if device is blocked
            if (device.is_blocked) {
              return [
                2 /*return*/,
                {
                  isValid: false,
                  device: device,
                  riskAssessment: {
                    trustScore: 0,
                    riskFactors: ["device_blocked"],
                    recommendations: ["Contact administrator"],
                    isBlocked: true,
                    requiresVerification: false,
                  },
                },
              ];
            }
            return [4 /*yield*/, this.assessDeviceRisk(device.fingerprint_data, currentLocation)];
          case 2:
            riskAssessment = _a.sent();
            // Update device last seen
            return [4 /*yield*/, this.updateDeviceLastSeen(device.id, currentLocation)];
          case 3:
            // Update device last seen
            _a.sent();
            return [
              2 /*return*/,
              {
                isValid: !riskAssessment.isBlocked && device.verification_status === "verified",
                device: device,
                riskAssessment: riskAssessment,
              },
            ];
          case 4:
            error_2 = _a.sent();
            console.error("Error validating device:", error_2);
            return [
              2 /*return*/,
              {
                isValid: false,
                riskAssessment: {
                  trustScore: 0,
                  riskFactors: ["validation_error"],
                  recommendations: ["Try again later"],
                  isBlocked: true,
                  requiresVerification: true,
                },
              },
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  // Device Trust Management
  DeviceManager.prototype.updateDeviceTrust = function (deviceId, trustScore, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  trust_score: Math.max(0, Math.min(100, trustScore)),
                  is_trusted: trustScore >= config_1.DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
                  updated_at: new Date(),
                })
                .eq("id", deviceId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            // Log trust score change
            return [
              4 /*yield*/,
              this.logDeviceEvent(deviceId, "trust_score_updated", {
                new_score: trustScore,
                reason: reason,
              }),
            ];
          case 2:
            // Log trust score change
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            console.error("Error updating device trust:", error_3);
            throw error_3;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.blockDevice = function (deviceId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_blocked: true,
                  is_trusted: false,
                  trust_score: 0,
                  updated_at: new Date(),
                })
                .eq("id", deviceId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              this.logDeviceEvent(deviceId, "device_blocked", { reason: reason }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Error blocking device:", error_4);
            throw error_4;
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.unblockDevice = function (deviceId, reason) {
    return __awaiter(this, void 0, void 0, function () {
      var device, trustScore, error, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.getDeviceById(deviceId)];
          case 1:
            device = _a.sent();
            if (!device) throw new Error("Device not found");
            return [
              4 /*yield*/,
              this.calculateDeviceTrustScore(device.fingerprint_data, device.location),
            ];
          case 2:
            trustScore = _a.sent();
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .update({
                  is_blocked: false,
                  trust_score: trustScore,
                  is_trusted: trustScore >= config_1.DEVICE_TRUST_FACTORS.MINIMUM_TRUST_SCORE,
                  updated_at: new Date(),
                })
                .eq("id", deviceId),
            ];
          case 3:
            error = _a.sent().error;
            if (error) throw error;
            return [
              4 /*yield*/,
              this.logDeviceEvent(deviceId, "device_unblocked", { reason: reason }),
            ];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_5 = _a.sent();
            console.error("Error unblocking device:", error_5);
            throw error_5;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  // Device Analytics
  DeviceManager.prototype.getDeviceAnalytics = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var query, _a, devices, error, error_6;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            query = this.supabase.from("device_registrations").select("*");
            if (userId) {
              query = query.eq("user_id", userId);
            }
            return [4 /*yield*/, query];
          case 1:
            (_a = _b.sent()), (devices = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, this.calculateDeviceAnalytics(devices || [])];
          case 2:
            error_6 = _b.sent();
            console.error("Error getting device analytics:", error_6);
            return [2 /*return*/, this.getEmptyAnalytics()];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.getUserDevices = function (userId) {
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
                .order("last_seen", { ascending: false }),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            return [2 /*return*/, data || []];
          case 2:
            error_7 = _b.sent();
            console.error("Error getting user devices:", error_7);
            return [2 /*return*/, []];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  // Device Fingerprinting
  DeviceManager.prototype.generateDeviceFingerprint = function (deviceInfo) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, fingerprint;
      var _a, _b;
      return __generator(this, function (_c) {
        cacheKey = JSON.stringify(deviceInfo);
        if (this.fingerprintCache.has(cacheKey)) {
          return [2 /*return*/, this.fingerprintCache.get(cacheKey)];
        }
        fingerprint = {
          userAgent: deviceInfo.userAgent || "Unknown",
          screen: {
            width: deviceInfo.screenWidth || 0,
            height: deviceInfo.screenHeight || 0,
            colorDepth: deviceInfo.colorDepth || 24,
          },
          timezone: deviceInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          language: deviceInfo.language || navigator.language,
          platform: deviceInfo.platform || "Unknown",
          cookieEnabled: (_a = deviceInfo.cookieEnabled) !== null && _a !== void 0 ? _a : true,
          doNotTrack: (_b = deviceInfo.doNotTrack) !== null && _b !== void 0 ? _b : false,
          plugins: deviceInfo.plugins || [],
          canvas: deviceInfo.canvasFingerprint,
          webgl: deviceInfo.webglFingerprint,
          fonts: deviceInfo.fonts,
          audio: deviceInfo.audioFingerprint,
        };
        this.fingerprintCache.set(cacheKey, fingerprint);
        return [2 /*return*/, fingerprint];
      });
    });
  };
  // Private Methods
  DeviceManager.prototype.findExistingDevice = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_8;
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
                .eq("device_fingerprint", deviceFingerprint)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows returned
            return [2 /*return*/, data || null];
          case 2:
            error_8 = _b.sent();
            console.error("Error finding existing device:", error_8);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.getDeviceByFingerprint = function (userId, deviceFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_9;
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
                .eq("device_fingerprint", deviceFingerprint)
                .single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") throw error;
            return [2 /*return*/, data || null];
          case 2:
            error_9 = _b.sent();
            console.error("Error getting device by fingerprint:", error_9);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.getDeviceById = function (deviceId) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, data, error, error_10;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").select("*").eq("id", deviceId).single(),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error && error.code !== "PGRST116") throw error;
            return [2 /*return*/, data || null];
          case 2:
            error_10 = _b.sent();
            console.error("Error getting device by ID:", error_10);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.calculateDeviceTrustScore = function (fingerprint, location) {
    return __awaiter(this, void 0, void 0, function () {
      var cacheKey, cached, score, finalScore;
      return __generator(this, function (_a) {
        cacheKey = JSON.stringify({ fingerprint: fingerprint, location: location });
        cached = this.trustScoreCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp.getTime() < 300000) {
          // 5 minute cache
          return [2 /*return*/, cached.score];
        }
        score = config_1.DEVICE_TRUST_FACTORS.BASE_TRUST_SCORE;
        // Browser consistency
        if (fingerprint.userAgent && fingerprint.userAgent !== "Unknown") {
          score += config_1.DEVICE_TRUST_FACTORS.KNOWN_BROWSER_BONUS;
        }
        // Screen resolution consistency
        if (fingerprint.screen.width > 0 && fingerprint.screen.height > 0) {
          score += config_1.DEVICE_TRUST_FACTORS.CONSISTENT_SCREEN_BONUS;
        }
        // Plugin consistency
        if (fingerprint.plugins && fingerprint.plugins.length > 0) {
          score += config_1.DEVICE_TRUST_FACTORS.PLUGIN_CONSISTENCY_BONUS;
        }
        // Canvas fingerprint (more unique = more trustworthy)
        if (fingerprint.canvas) {
          score += config_1.DEVICE_TRUST_FACTORS.CANVAS_FINGERPRINT_BONUS;
        }
        // WebGL fingerprint
        if (fingerprint.webgl) {
          score += config_1.DEVICE_TRUST_FACTORS.WEBGL_FINGERPRINT_BONUS;
        }
        // Location factors
        if (location) {
          if (config_1.LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
            score -= 20;
          }
          if (location.isVPN || location.isProxy) {
            score -= 15;
          }
        }
        finalScore = Math.max(0, Math.min(100, score));
        // Cache the result
        this.trustScoreCache.set(cacheKey, {
          score: finalScore,
          timestamp: new Date(),
        });
        return [2 /*return*/, finalScore];
      });
    });
  };
  DeviceManager.prototype.assessDeviceRisk = function (fingerprint, location) {
    return __awaiter(this, void 0, void 0, function () {
      var riskFactors, recommendations, trustScore, isBlocked, requiresVerification;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            riskFactors = [];
            recommendations = [];
            return [4 /*yield*/, this.calculateDeviceTrustScore(fingerprint, location)];
          case 1:
            trustScore = _a.sent();
            // Check for suspicious characteristics
            if (!fingerprint.userAgent || fingerprint.userAgent === "Unknown") {
              riskFactors.push("missing_user_agent");
              recommendations.push("Update browser");
            }
            if (fingerprint.screen.width === 0 || fingerprint.screen.height === 0) {
              riskFactors.push("invalid_screen_resolution");
              recommendations.push("Check display settings");
            }
            if (fingerprint.doNotTrack) {
              riskFactors.push("do_not_track_enabled");
            }
            if (!fingerprint.cookieEnabled) {
              riskFactors.push("cookies_disabled");
              recommendations.push("Enable cookies");
            }
            // Location-based risks
            if (location) {
              if (config_1.LOCATION_RISK_FACTORS.HIGH_RISK_COUNTRIES.includes(location.country)) {
                riskFactors.push("high_risk_location");
                recommendations.push("Verify identity");
              }
              if (location.isVPN) {
                riskFactors.push("vpn_usage");
                recommendations.push("Disable VPN for verification");
              }
              if (location.isProxy) {
                riskFactors.push("proxy_usage");
                recommendations.push("Disable proxy for verification");
              }
            }
            isBlocked = trustScore < 30 || riskFactors.includes("high_risk_location");
            requiresVerification = trustScore < 60 || riskFactors.length > 2;
            return [
              2 /*return*/,
              {
                trustScore: trustScore,
                riskFactors: riskFactors,
                recommendations: recommendations,
                isBlocked: isBlocked,
                requiresVerification: requiresVerification,
              },
            ];
        }
      });
    });
  };
  DeviceManager.prototype.generateDeviceName = function (deviceInfo) {
    var browser = deviceInfo.browser || "Unknown Browser";
    var os = deviceInfo.os || "Unknown OS";
    var deviceType = this.detectDeviceType(deviceInfo);
    return "".concat(browser, " on ").concat(os, " (").concat(deviceType, ")");
  };
  DeviceManager.prototype.detectDeviceType = (deviceInfo) => {
    var _a;
    var userAgent =
      ((_a = deviceInfo.userAgent) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "";
    if (
      userAgent.includes("mobile") ||
      userAgent.includes("android") ||
      userAgent.includes("iphone")
    ) {
      return "Mobile";
    }
    if (userAgent.includes("tablet") || userAgent.includes("ipad")) {
      return "Tablet";
    }
    return "Desktop";
  };
  DeviceManager.prototype.isMobileDevice = function (deviceInfo) {
    return this.detectDeviceType(deviceInfo) === "Mobile";
  };
  DeviceManager.prototype.updateDeviceLastSeen = function (deviceId, location) {
    return __awaiter(this, void 0, void 0, function () {
      var updateData, error, error_11;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            updateData = {
              last_seen: new Date(),
              updated_at: new Date(),
            };
            if (location) {
              updateData.location = location;
            }
            return [
              4 /*yield*/,
              this.supabase.from("device_registrations").update(updateData).eq("id", deviceId),
            ];
          case 1:
            error = _a.sent().error;
            if (error) throw error;
            return [3 /*break*/, 3];
          case 2:
            error_11 = _a.sent();
            console.error("Error updating device last seen:", error_11);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.logDeviceEvent = function (deviceId, eventType, metadata) {
    return __awaiter(this, void 0, void 0, function () {
      var error, error_12;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.supabase.from("device_events").insert({
                id: "event-"
                  .concat(Date.now(), "-")
                  .concat(Math.random().toString(36).substring(2)),
                device_id: deviceId,
                event_type: eventType,
                metadata: metadata,
                created_at: new Date(),
              }),
            ];
          case 1:
            error = _a.sent().error;
            if (error) {
              console.error("Error logging device event:", error);
            }
            return [3 /*break*/, 3];
          case 2:
            error_12 = _a.sent();
            console.error("Error logging device event:", error_12);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.calculateDeviceAnalytics = (devices) => {
    var analytics = {
      totalDevices: devices.length,
      trustedDevices: devices.filter((d) => d.is_trusted).length,
      suspiciousDevices: devices.filter((d) => d.risk_indicators && d.risk_indicators.length > 0)
        .length,
      blockedDevices: devices.filter((d) => d.is_blocked).length,
      devicesByType: {},
      devicesByLocation: {},
      averageTrustScore: 0,
      riskDistribution: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
    };
    if (devices.length === 0) {
      return analytics;
    }
    // Calculate averages and distributions
    var totalTrustScore = 0;
    devices.forEach((device) => {
      var _a;
      // Trust score
      totalTrustScore += device.trust_score;
      // Device type distribution
      var deviceType = device.device_type || "Unknown";
      analytics.devicesByType[deviceType] = (analytics.devicesByType[deviceType] || 0) + 1;
      // Location distribution
      if ((_a = device.location) === null || _a === void 0 ? void 0 : _a.country) {
        var country = device.location.country;
        analytics.devicesByLocation[country] = (analytics.devicesByLocation[country] || 0) + 1;
      }
      // Risk distribution
      if (device.trust_score >= 80) {
        analytics.riskDistribution.low++;
      } else if (device.trust_score >= 60) {
        analytics.riskDistribution.medium++;
      } else if (device.trust_score >= 30) {
        analytics.riskDistribution.high++;
      } else {
        analytics.riskDistribution.critical++;
      }
    });
    analytics.averageTrustScore = totalTrustScore / devices.length;
    return analytics;
  };
  DeviceManager.prototype.getEmptyAnalytics = () => ({
    totalDevices: 0,
    trustedDevices: 0,
    suspiciousDevices: 0,
    blockedDevices: 0,
    devicesByType: {},
    devicesByLocation: {},
    averageTrustScore: 0,
    riskDistribution: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
  });
  // Cleanup Methods
  DeviceManager.prototype.cleanupOldDevices = function () {
    return __awaiter(this, arguments, void 0, function (daysOld) {
      var cutoffDate, _a, data, error, deletedCount, error_13;
      if (daysOld === void 0) {
        daysOld = 90;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .delete()
                .lt("last_seen", cutoffDate.toISOString())
                .eq("is_trusted", false)
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            deletedCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
            console.log("Cleaned up ".concat(deletedCount, " old devices"));
            return [2 /*return*/, deletedCount];
          case 2:
            error_13 = _b.sent();
            console.error("Error cleaning up old devices:", error_13);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  DeviceManager.prototype.cleanupBlockedDevices = function () {
    return __awaiter(this, arguments, void 0, function (daysOld) {
      var cutoffDate, _a, data, error, deletedCount, error_14;
      if (daysOld === void 0) {
        daysOld = 30;
      }
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
            return [
              4 /*yield*/,
              this.supabase
                .from("device_registrations")
                .delete()
                .lt("updated_at", cutoffDate.toISOString())
                .eq("is_blocked", true)
                .select("id"),
            ];
          case 1:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error) throw error;
            deletedCount = (data === null || data === void 0 ? void 0 : data.length) || 0;
            console.log("Cleaned up ".concat(deletedCount, " blocked devices"));
            return [2 /*return*/, deletedCount];
          case 2:
            error_14 = _b.sent();
            console.error("Error cleaning up blocked devices:", error_14);
            return [2 /*return*/, 0];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return DeviceManager;
})();
exports.DeviceManager = DeviceManager;
