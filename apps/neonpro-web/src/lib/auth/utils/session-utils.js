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
exports.SessionStorage = exports.SessionUtils = void 0;
/**
 * Session utility functions
 */
var SessionUtils = /** @class */ (() => {
  function SessionUtils() {}
  /**
   * Generate a secure session token
   */
  SessionUtils.generateSessionToken = () => {
    var array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };
  /**
   * Generate device fingerprint
   */
  SessionUtils.generateDeviceFingerprint = function () {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
    }
    var fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|");
    return this.hashString(fingerprint);
  };
  /**
   * Hash a string using Web Crypto API
   */
  SessionUtils.hashString = function (str) {
    return __awaiter(this, void 0, void 0, function () {
      var encoder, data, hashBuffer, hashArray;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            encoder = new TextEncoder();
            data = encoder.encode(str);
            return [4 /*yield*/, crypto.subtle.digest("SHA-256", data)];
          case 1:
            hashBuffer = _a.sent();
            hashArray = Array.from(new Uint8Array(hashBuffer));
            return [2 /*return*/, hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")];
        }
      });
    });
  };
  /**
   * Synchronous hash for immediate use
   */
  SessionUtils.hashString = (str) => {
    var hash = 0;
    if (str.length === 0) return hash.toString();
    for (var i = 0; i < str.length; i++) {
      var char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };
  /**
   * Detect device type from user agent
   */
  SessionUtils.detectDeviceType = (userAgent) => {
    var ua = userAgent.toLowerCase();
    if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(ua)) {
      return "MOBILE";
    }
    if (/tablet|ipad|kindle|silk/.test(ua)) {
      return "TABLET";
    }
    return "DESKTOP";
  };
  /**
   * Get device name from user agent
   */
  SessionUtils.getDeviceName = (userAgent) => {
    var ua = userAgent.toLowerCase();
    // Mobile devices
    if (ua.includes("iphone")) return "iPhone";
    if (ua.includes("ipad")) return "iPad";
    if (ua.includes("android")) {
      if (ua.includes("mobile")) return "Android Phone";
      return "Android Tablet";
    }
    // Desktop browsers
    if (ua.includes("chrome")) return "Chrome Browser";
    if (ua.includes("firefox")) return "Firefox Browser";
    if (ua.includes("safari") && !ua.includes("chrome")) return "Safari Browser";
    if (ua.includes("edge")) return "Edge Browser";
    // Operating systems
    if (ua.includes("windows")) return "Windows Computer";
    if (ua.includes("mac")) return "Mac Computer";
    if (ua.includes("linux")) return "Linux Computer";
    return "Unknown Device";
  };
  /**
   * Validate session token format
   */
  SessionUtils.isValidSessionToken = (token) => /^[a-f0-9]{64}$/.test(token);
  /**
   * Check if session is expired
   */
  SessionUtils.isSessionExpired = (expiresAt) => new Date(expiresAt) <= new Date();
  /**
   * Calculate session duration in minutes
   */
  SessionUtils.calculateSessionDuration = (startTime, endTime) => {
    var start = new Date(startTime);
    var end = endTime ? new Date(endTime) : new Date();
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  };
  /**
   * Format session duration for display
   */
  SessionUtils.formatDuration = (minutes) => {
    if (minutes < 60) {
      return "".concat(minutes, "m");
    }
    var hours = Math.floor(minutes / 60);
    var remainingMinutes = minutes % 60;
    if (hours < 24) {
      return remainingMinutes > 0
        ? "".concat(hours, "h ").concat(remainingMinutes, "m")
        : "".concat(hours, "h");
    }
    var days = Math.floor(hours / 24);
    var remainingHours = hours % 24;
    return remainingHours > 0
      ? "".concat(days, "d ").concat(remainingHours, "h")
      : "".concat(days, "d");
  };
  /**
   * Get client IP address (client-side approximation)
   */
  SessionUtils.getClientIP = function () {
    return __awaiter(this, void 0, void 0, function () {
      var response, data, _a;
      return __generator(this, (_b) => {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 3, , 4]);
            return [4 /*yield*/, fetch("/api/client-ip")];
          case 1:
            response = _b.sent();
            return [4 /*yield*/, response.json()];
          case 2:
            data = _b.sent();
            return [2 /*return*/, data.ip || "0.0.0.0"];
          case 3:
            _a = _b.sent();
            return [2 /*return*/, "0.0.0.0"];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if two IP addresses are from the same network
   */
  SessionUtils.isSameNetwork = (ip1, ip2) => {
    // Simple check for same /24 subnet
    var parts1 = ip1.split(".");
    var parts2 = ip2.split(".");
    if (parts1.length !== 4 || parts2.length !== 4) {
      return false;
    }
    return parts1.slice(0, 3).join(".") === parts2.slice(0, 3).join(".");
  };
  /**
   * Generate security score based on session factors
   */
  SessionUtils.calculateSecurityScore = function (session, events) {
    var score = 100;
    // Deduct points for security events
    var recentEvents = events.filter((event) => {
      var eventTime = new Date(event.timestamp);
      var oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return eventTime > oneDayAgo;
    });
    recentEvents.forEach((event) => {
      switch (event.severity) {
        case "CRITICAL":
          score -= 30;
          break;
        case "HIGH":
          score -= 20;
          break;
        case "MEDIUM":
          score -= 10;
          break;
        case "LOW":
          score -= 5;
          break;
      }
    });
    // Deduct points for session age
    var sessionAge = this.calculateSessionDuration(session.created_at);
    if (sessionAge > 24 * 60) {
      // More than 24 hours
      score -= 10;
    }
    // Deduct points if not from trusted device
    if (!session.device_trusted) {
      score -= 15;
    }
    return Math.max(0, Math.min(100, score));
  };
  /**
   * Sanitize user input for security events
   */
  SessionUtils.sanitizeInput = (input) => {
    return input.replace(/[<>"'&]/g, "").substring(0, 1000); // Limit length
  };
  /**
   * Check if user agent indicates a bot
   */
  SessionUtils.isBotUserAgent = (userAgent) => {
    var botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /java/i,
      /go-http-client/i,
    ];
    return botPatterns.some((pattern) => pattern.test(userAgent));
  };
  /**
   * Generate session policy based on user role and security level
   */
  SessionUtils.generateSessionPolicy = (userRole, securityLevel) => {
    if (securityLevel === void 0) {
      securityLevel = "MEDIUM";
    }
    var basePolicy = {
      max_session_duration: 8 * 60, // 8 hours
      idle_timeout: 30, // 30 minutes
      max_concurrent_sessions: 3,
      require_device_trust: false,
      allow_concurrent_ips: true,
      session_refresh_threshold: 60, // 1 hour
      security_check_interval: 15, // 15 minutes
    };
    switch (securityLevel) {
      case "HIGH":
        return __assign(__assign({}, basePolicy), {
          max_session_duration: 4 * 60,
          idle_timeout: 15,
          max_concurrent_sessions: 1,
          require_device_trust: true,
          allow_concurrent_ips: false,
          session_refresh_threshold: 30,
          security_check_interval: 5, // 5 minutes
        });
      case "LOW":
        return __assign(__assign({}, basePolicy), {
          max_session_duration: 24 * 60,
          idle_timeout: 60,
          max_concurrent_sessions: 5,
          security_check_interval: 30, // 30 minutes
        });
      default:
        return basePolicy;
    }
  };
  /**
   * Encrypt sensitive data for storage
   */
  SessionUtils.encryptData = function (data, key) {
    return __awaiter(this, void 0, void 0, function () {
      var encoder, keyData, iv, encrypted, combined;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            encoder = new TextEncoder();
            return [
              4 /*yield*/,
              crypto.subtle.importKey(
                "raw",
                encoder.encode(key.padEnd(32, "0").substring(0, 32)),
                { name: "AES-GCM" },
                false,
                ["encrypt"],
              ),
            ];
          case 1:
            keyData = _a.sent();
            iv = crypto.getRandomValues(new Uint8Array(12));
            return [
              4 /*yield*/,
              crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, keyData, encoder.encode(data)),
            ];
          case 2:
            encrypted = _a.sent();
            combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);
            return [2 /*return*/, btoa(String.fromCharCode.apply(String, combined))];
        }
      });
    });
  };
  /**
   * Decrypt sensitive data
   */
  SessionUtils.decryptData = function (encryptedData, key) {
    return __awaiter(this, void 0, void 0, function () {
      var decoder, encoder, combined, iv, encrypted, keyData, decrypted;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            decoder = new TextDecoder();
            encoder = new TextEncoder();
            combined = new Uint8Array(
              atob(encryptedData)
                .split("")
                .map((char) => char.charCodeAt(0)),
            );
            iv = combined.slice(0, 12);
            encrypted = combined.slice(12);
            return [
              4 /*yield*/,
              crypto.subtle.importKey(
                "raw",
                encoder.encode(key.padEnd(32, "0").substring(0, 32)),
                { name: "AES-GCM" },
                false,
                ["decrypt"],
              ),
            ];
          case 1:
            keyData = _a.sent();
            return [
              4 /*yield*/,
              crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, keyData, encrypted),
            ];
          case 2:
            decrypted = _a.sent();
            return [2 /*return*/, decoder.decode(decrypted)];
        }
      });
    });
  };
  /**
   * Validate session configuration
   */
  SessionUtils.validateSessionConfig = (config) => {
    if (config.max_session_duration && config.max_session_duration < 5) {
      return false; // Minimum 5 minutes
    }
    if (config.idle_timeout && config.idle_timeout < 1) {
      return false; // Minimum 1 minute
    }
    if (config.max_concurrent_sessions && config.max_concurrent_sessions < 1) {
      return false; // At least 1 session
    }
    return true;
  };
  SessionUtils.supabase = createClient(ComponentClient());
  return SessionUtils;
})();
exports.SessionUtils = SessionUtils;
/**
 * Session storage utilities for client-side
 */
var SessionStorage = /** @class */ (() => {
  function SessionStorage() {}
  /**
   * Store session data in localStorage
   */
  SessionStorage.setSession = function (session) {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn("Failed to store session data:", error);
    }
  };
  /**
   * Get session data from localStorage
   */
  SessionStorage.getSession = function () {
    try {
      var data = localStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn("Failed to retrieve session data:", error);
      return null;
    }
  };
  /**
   * Clear session data
   */
  SessionStorage.clearSession = function () {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.DEVICE_KEY);
    } catch (error) {
      console.warn("Failed to clear session data:", error);
    }
  };
  /**
   * Store device data
   */
  SessionStorage.setDevice = function (device) {
    try {
      localStorage.setItem(this.DEVICE_KEY, JSON.stringify(device));
    } catch (error) {
      console.warn("Failed to store device data:", error);
    }
  };
  /**
   * Get device data
   */
  SessionStorage.getDevice = function () {
    try {
      var data = localStorage.getItem(this.DEVICE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.warn("Failed to retrieve device data:", error);
      return null;
    }
  };
  SessionStorage.SESSION_KEY = "neonpro_session";
  SessionStorage.DEVICE_KEY = "neonpro_device";
  return SessionStorage;
})();
exports.SessionStorage = SessionStorage;
