// Authentication Middleware
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
exports.createAuthMiddleware = createAuthMiddleware;
exports.recordSuspiciousActivity = recordSuspiciousActivity;
exports.clearSuspiciousActivity = clearSuspiciousActivity;
var server_1 = require("next/server");
var utils_1 = require("../utils");
// Default middleware configuration
var DEFAULT_CONFIG = {
  requireAuth: true,
  allowedRoles: ["owner", "manager", "staff", "patient"],
  requireMFA: false,
  checkDeviceTrust: true,
  logSecurityEvents: true,
  rateLimitRequests: true,
  blockSuspiciousActivity: true,
};
// Rate limiting store (in production, use Redis)
var rateLimitStore = new Map();
// Suspicious activity tracking
var suspiciousActivityStore = new Map() < string,
  number = (void 0).attempts;
lastAttempt: number;
blocked: boolean;
>> ()
/**
 * Authentication Middleware Factory
 */
function createAuthMiddleware(config) {
  if (config === void 0) {
    config = {};
  }
  var finalConfig = __assign(__assign({}, DEFAULT_CONFIG), config);
  return function authMiddleware(request, sessionManager, securityMonitor, deviceManager) {
    return __awaiter(this, void 0, void 0, function () {
      var startTime,
        clientIP,
        userAgent,
        deviceInfo,
        locationInfo,
        rateLimitResult,
        suspiciousCheck,
        sessionToken,
        session,
        deviceCheck,
        locationCheck,
        requestHeaders,
        error_1;
      return __generator(this, (_a) => {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 24, , 26]);
            startTime = Date.now();
            clientIP = getClientIP(request);
            userAgent = request.headers.get("user-agent") || "";
            deviceInfo = extractDeviceInfo(request);
            return [4 /*yield*/, extractLocationInfo(request)];
          case 1:
            locationInfo = _a.sent();
            if (!finalConfig.rateLimitRequests) return [3 /*break*/, 3];
            rateLimitResult = checkRateLimit(clientIP);
            if (rateLimitResult.allowed) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "rate_limit_exceeded",
                  severity: "medium",
                  clientIP: clientIP,
                  userAgent: userAgent,
                  details: {
                    requestCount: rateLimitResult.count,
                    timeWindow: "1m",
                  },
                },
                securityMonitor,
              ),
            ];
          case 2:
            _a.sent();
            return [
              2 /*return*/,
              new server_1.NextResponse("Rate limit exceeded", { status: 429 }),
            ];
          case 3:
            if (!finalConfig.blockSuspiciousActivity) return [3 /*break*/, 5];
            suspiciousCheck = checkSuspiciousActivity(clientIP);
            if (!suspiciousCheck.blocked) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "suspicious_activity_blocked",
                  severity: "high",
                  clientIP: clientIP,
                  userAgent: userAgent,
                  details: {
                    attempts: suspiciousCheck.attempts,
                    reason: "Multiple failed authentication attempts",
                  },
                },
                securityMonitor,
              ),
            ];
          case 4:
            _a.sent();
            return [
              2 /*return*/,
              new server_1.NextResponse("Access blocked due to suspicious activity", {
                status: 403,
              }),
            ];
          case 5:
            sessionToken = extractSessionToken(request);
            if (!sessionToken && finalConfig.requireAuth) {
              return [
                2 /*return*/,
                new server_1.NextResponse("Authentication required", { status: 401 }),
              ];
            }
            if (!sessionToken) return [3 /*break*/, 23];
            return [4 /*yield*/, sessionManager.getSession(sessionToken)];
          case 6:
            session = _a.sent();
            if (session) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "invalid_session_token",
                  severity: "medium",
                  clientIP: clientIP,
                  userAgent: userAgent,
                  sessionToken: sessionToken,
                },
                securityMonitor,
              ),
            ];
          case 7:
            _a.sent();
            return [2 /*return*/, new server_1.NextResponse("Invalid session", { status: 401 })];
          case 8:
            if (!(session.expires_at < new Date())) return [3 /*break*/, 11];
            return [4 /*yield*/, sessionManager.terminateSession(sessionToken, "expired")];
          case 9:
            _a.sent();
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "session_expired",
                  severity: "low",
                  userId: session.user_id,
                  sessionId: session.id,
                  clientIP: clientIP,
                  userAgent: userAgent,
                },
                securityMonitor,
              ),
            ];
          case 10:
            _a.sent();
            return [2 /*return*/, new server_1.NextResponse("Session expired", { status: 401 })];
          case 11:
            if (
              !(finalConfig.allowedRoles && !finalConfig.allowedRoles.includes(session.user_role))
            )
              return [3 /*break*/, 13];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "unauthorized_access_attempt",
                  severity: "high",
                  userId: session.user_id,
                  sessionId: session.id,
                  clientIP: clientIP,
                  userAgent: userAgent,
                  details: {
                    userRole: session.user_role,
                    requiredRoles: finalConfig.allowedRoles,
                    path: request.nextUrl.pathname,
                  },
                },
                securityMonitor,
              ),
            ];
          case 12:
            _a.sent();
            return [
              2 /*return*/,
              new server_1.NextResponse("Insufficient permissions", { status: 403 }),
            ];
          case 13:
            // MFA requirement check
            if (finalConfig.requireMFA && !session.mfa_verified) {
              return [
                2 /*return*/,
                new server_1.NextResponse("MFA verification required", { status: 403 }),
              ];
            }
            if (!finalConfig.checkDeviceTrust) return [3 /*break*/, 16];
            return [4 /*yield*/, checkDeviceTrust(session, deviceInfo, deviceManager)];
          case 14:
            deviceCheck = _a.sent();
            if (deviceCheck.trusted) return [3 /*break*/, 16];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "untrusted_device_access",
                  severity: "medium",
                  userId: session.user_id,
                  sessionId: session.id,
                  clientIP: clientIP,
                  userAgent: userAgent,
                  details: {
                    deviceFingerprint: deviceCheck.fingerprint,
                    trustScore: deviceCheck.trustScore,
                    reason: deviceCheck.reason,
                  },
                },
                securityMonitor,
              ),
            ];
          case 15:
            _a.sent();
            _a.label = 16;
          case 16:
            return [4 /*yield*/, checkLocationAnomaly(session, locationInfo, securityMonitor)];
          case 17:
            locationCheck = _a.sent();
            if (!locationCheck.suspicious) return [3 /*break*/, 19];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "unusual_location",
                  severity: "medium",
                  userId: session.user_id,
                  sessionId: session.id,
                  clientIP: clientIP,
                  userAgent: userAgent,
                  location: locationInfo,
                  details: {
                    distance: locationCheck.distance,
                    previousLocation: locationCheck.previousLocation,
                    timeElapsed: locationCheck.timeElapsed,
                  },
                },
                securityMonitor,
              ),
            ];
          case 18:
            _a.sent();
            _a.label = 19;
          case 19:
            // Update session activity
            return [
              4 /*yield*/,
              sessionManager.updateSessionActivity(sessionToken, {
                ip_address: clientIP,
                user_agent: userAgent,
                location: locationInfo,
              }),
            ];
          case 20:
            // Update session activity
            _a.sent();
            requestHeaders = new Headers(request.headers);
            requestHeaders.set("x-session-id", session.id);
            requestHeaders.set("x-user-id", session.user_id);
            requestHeaders.set("x-user-role", session.user_role);
            requestHeaders.set("x-session-verified", session.mfa_verified.toString());
            if (!finalConfig.logSecurityEvents) return [3 /*break*/, 22];
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "successful_authentication",
                  severity: "low",
                  userId: session.user_id,
                  sessionId: session.id,
                  clientIP: clientIP,
                  userAgent: userAgent,
                  location: locationInfo,
                  details: {
                    path: request.nextUrl.pathname,
                    method: request.method,
                    processingTime: Date.now() - startTime,
                  },
                },
                securityMonitor,
              ),
            ];
          case 21:
            _a.sent();
            _a.label = 22;
          case 22:
            // Continue with modified request
            return [
              2 /*return*/,
              server_1.NextResponse.next({
                request: {
                  headers: requestHeaders,
                },
              }),
            ];
          case 23:
            // No authentication required, continue
            return [2 /*return*/, null];
          case 24:
            error_1 = _a.sent();
            console.error("Auth middleware error:", error_1);
            // Log security event for middleware errors
            return [
              4 /*yield*/,
              logSecurityEvent(
                {
                  type: "middleware_error",
                  severity: "high",
                  clientIP: getClientIP(request),
                  userAgent: request.headers.get("user-agent") || "",
                  details: {
                    error: error_1 instanceof Error ? error_1.message : "Unknown error",
                    path: request.nextUrl.pathname,
                  },
                },
                securityMonitor,
              ).catch(() => {}),
            ];
          case 25:
            // Log security event for middleware errors
            _a.sent();
            return [
              2 /*return*/,
              new server_1.NextResponse("Internal server error", { status: 500 }),
            ];
          case 26:
            return [2 /*return*/];
        }
      });
    });
  };
}
/**
 * Extract client IP address
 */
function getClientIP(request) {
  var forwarded = request.headers.get("x-forwarded-for");
  var realIP = request.headers.get("x-real-ip");
  var remoteAddr = request.headers.get("x-remote-addr");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return realIP || remoteAddr || "unknown";
}
/**
 * Extract session token from request
 */
function extractSessionToken(request) {
  // Try Authorization header first
  var authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  // Try cookies
  var sessionCookie = request.cookies.get("session_token");
  if (sessionCookie) {
    return sessionCookie.value;
  }
  return null;
}
/**
 * Extract device information from request
 */
function extractDeviceInfo(request) {
  var userAgent = request.headers.get("user-agent") || "";
  var acceptLanguage = request.headers.get("accept-language") || "";
  return {
    userAgent: userAgent,
    platform: utils_1.AuthUtils.Device.detectPlatform(userAgent),
    screenWidth: 0, // Would be sent by client
    screenHeight: 0, // Would be sent by client
    timezone: "", // Would be sent by client
    language: acceptLanguage.split(",")[0] || "en",
  };
}
/**
 * Extract location information from request
 */
function extractLocationInfo(request) {
  return __awaiter(this, void 0, void 0, function () {
    var clientIP;
    return __generator(this, (_a) => {
      clientIP = getClientIP(request);
      if (clientIP === "unknown" || clientIP.startsWith("192.168.") || clientIP.startsWith("10.")) {
        return [2 /*return*/, null];
      }
      try {
        // In production, use a proper IP geolocation service
        // This is a mock implementation
        return [
          2 /*return*/,
          {
            ip_address: clientIP,
            country: "Brazil",
            city: "São Paulo",
            latitude: -23.5505,
            longitude: -46.6333,
            isVPN: false,
            isTor: false,
          },
        ];
      } catch (error) {
        console.error("Failed to get location info:", error);
        return [2 /*return*/, null];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Check rate limiting
 */
function checkRateLimit(clientIP) {
  var now = Date.now();
  var windowMs = 60 * 1000; // 1 minute
  var maxRequests = 100;
  var key = "rate_limit:".concat(clientIP);
  var current = rateLimitStore.get(key);
  if (!current || current.resetTime < now) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, count: 1 };
  }
  current.count++;
  rateLimitStore.set(key, current);
  return {
    allowed: current.count <= maxRequests,
    count: current.count,
  };
}
/**
 * Check for suspicious activity
 */
function checkSuspiciousActivity(clientIP) {
  var now = Date.now();
  var windowMs = 15 * 60 * 1000; // 15 minutes
  var maxAttempts = 10;
  var key = "suspicious:".concat(clientIP);
  var current = suspiciousActivityStore.get(key);
  if (!current) {
    return { blocked: false, attempts: 0 };
  }
  // Reset if window expired
  if (current.lastAttempt + windowMs < now) {
    suspiciousActivityStore.delete(key);
    return { blocked: false, attempts: 0 };
  }
  return {
    blocked: current.blocked || current.attempts >= maxAttempts,
    attempts: current.attempts,
  };
}
/**
 * Check device trust
 */
function checkDeviceTrust(session, deviceInfo, deviceManager) {
  return __awaiter(this, void 0, void 0, function () {
    var fingerprint, device, trustScore, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          fingerprint = utils_1.AuthUtils.Device.generateFingerprint(deviceInfo);
          _a.label = 1;
        case 1:
          _a.trys.push([1, 4, , 5]);
          return [4 /*yield*/, deviceManager.getDeviceByFingerprint(session.user_id, fingerprint)];
        case 2:
          device = _a.sent();
          if (!device) {
            return [
              2 /*return*/,
              {
                trusted: false,
                fingerprint: fingerprint,
                trustScore: 0,
                reason: "Unknown device",
              },
            ];
          }
          return [4 /*yield*/, deviceManager.calculateTrustScore(device.id)];
        case 3:
          trustScore = _a.sent();
          return [
            2 /*return*/,
            {
              trusted: device.is_trusted && !device.is_blocked,
              fingerprint: fingerprint,
              trustScore: trustScore,
              reason: device.is_blocked ? "Device blocked" : undefined,
            },
          ];
        case 4:
          error_2 = _a.sent();
          console.error("Device trust check failed:", error_2);
          return [
            2 /*return*/,
            {
              trusted: false,
              fingerprint: fingerprint,
              trustScore: 0,
              reason: "Trust check failed",
            },
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Check for location anomalies
 */
function checkLocationAnomaly(session, currentLocation, securityMonitor) {
  return __awaiter(this, void 0, void 0, function () {
    var distance, timeElapsed, maxSpeed, possibleDistance;
    return __generator(this, (_a) => {
      if (!currentLocation || !session.last_location) {
        return [2 /*return*/, { suspicious: false }];
      }
      try {
        distance = utils_1.AuthUtils.Location.calculateDistance(
          session.last_location.latitude,
          session.last_location.longitude,
          currentLocation.latitude,
          currentLocation.longitude,
        );
        timeElapsed = Date.now() - new Date(session.last_activity).getTime();
        maxSpeed = 1000;
        possibleDistance = (timeElapsed / (1000 * 60 * 60)) * maxSpeed;
        return [
          2 /*return*/,
          {
            suspicious: distance > possibleDistance,
            distance: distance,
            previousLocation: session.last_location,
            timeElapsed: timeElapsed,
          },
        ];
      } catch (error) {
        console.error("Location anomaly check failed:", error);
        return [2 /*return*/, { suspicious: false }];
      }
      return [2 /*return*/];
    });
  });
}
/**
 * Log security event
 */
function logSecurityEvent(event, securityMonitor) {
  return __awaiter(this, void 0, void 0, function () {
    var error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            securityMonitor.logSecurityEvent(
              __assign(
                { id: utils_1.AuthUtils.Crypto.generateSecureId(), timestamp: new Date() },
                event,
              ),
            ),
          ];
        case 1:
          _a.sent();
          return [3 /*break*/, 3];
        case 2:
          error_3 = _a.sent();
          console.error("Failed to log security event:", error_3);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Record suspicious activity
 */
function recordSuspiciousActivity(clientIP) {
  var now = Date.now();
  var key = "suspicious:".concat(clientIP);
  var current = suspiciousActivityStore.get(key);
  if (!current) {
    suspiciousActivityStore.set(key, {
      attempts: 1,
      lastAttempt: now,
      blocked: false,
    });
  } else {
    current.attempts++;
    current.lastAttempt = now;
    current.blocked = current.attempts >= 10;
    suspiciousActivityStore.set(key, current);
  }
}
/**
 * Clear suspicious activity record
 */
function clearSuspiciousActivity(clientIP) {
  var key = "suspicious:".concat(clientIP);
  suspiciousActivityStore.delete(key);
}
