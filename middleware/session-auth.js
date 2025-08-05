"use strict";
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
exports.config = exports.sessionAuthMiddleware = exports.SessionAuthMiddleware = void 0;
exports.middleware = middleware;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var session_manager_1 = require("@/lib/auth/session-manager");
var session_1 = require("@/types/session");
/**
 * Session Authentication Middleware
 * Validates and manages user sessions across the application
 */
var SessionAuthMiddleware = /** @class */ (function () {
  function SessionAuthMiddleware() {
    this.sessionManager = new session_manager_1.SessionManager();
  }
  /**
   * Main middleware function for session validation
   */
  SessionAuthMiddleware.prototype.handle = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var response, pathname, supabase, sessionToken, sessionValidation, refreshResult, error_1;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            response = server_1.NextResponse.next();
            pathname = request.nextUrl.pathname;
            // Skip middleware for public routes
            if (this.isPublicRoute(pathname)) {
              return [2 /*return*/, response];
            }
            // Skip middleware for API routes that don't require auth
            if (this.isPublicApiRoute(pathname)) {
              return [2 /*return*/, response];
            }
            _b.label = 1;
          case 1:
            _b.trys.push([1, 8, , 10]);
            supabase = (0, ssr_1.createServerClient)(
              process.env.NEXT_PUBLIC_SUPABASE_URL,
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
              {
                cookies: {
                  get: function (name) {
                    var _a;
                    return (_a = request.cookies.get(name)) === null || _a === void 0
                      ? void 0
                      : _a.value;
                  },
                  set: function (name, value, options) {
                    response.cookies.set(name, value, options);
                  },
                  remove: function (name, options) {
                    response.cookies.delete(name);
                  },
                },
              },
            );
            sessionToken =
              (_a = request.cookies.get("session-token")) === null || _a === void 0
                ? void 0
                : _a.value;
            if (!sessionToken) {
              return [2 /*return*/, this.redirectToLogin(request)];
            }
            return [
              4 /*yield*/,
              this.sessionManager.validateSession(sessionToken, {
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "Unknown",
                requestPath: pathname,
              }),
            ];
          case 2:
            sessionValidation = _b.sent();
            if (!!sessionValidation.isValid) return [3 /*break*/, 4];
            // Log security event
            return [
              4 /*yield*/,
              this.logSecurityEvent(
                sessionValidation.userId || "unknown",
                session_1.SecurityEventType.SESSION_VALIDATION_FAILED,
                {
                  reason: sessionValidation.reason,
                  ipAddress: this.getClientIP(request),
                  userAgent: request.headers.get("user-agent") || "Unknown",
                  requestPath: pathname,
                },
              ),
            ];
          case 3:
            // Log security event
            _b.sent();
            // Clear invalid session cookie
            response.cookies.delete("session-token");
            return [2 /*return*/, this.redirectToLogin(request)];
          case 4:
            if (!sessionValidation.needsRefresh) return [3 /*break*/, 6];
            return [
              4 /*yield*/,
              this.sessionManager.refreshSession(sessionToken, {
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "Unknown",
              }),
            ];
          case 5:
            refreshResult = _b.sent();
            if (refreshResult.success && refreshResult.newToken) {
              // Set new session token
              response.cookies.set("session-token", refreshResult.newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
              });
            }
            _b.label = 6;
          case 6:
            // Add user info to request headers for downstream use
            if (sessionValidation.userId) {
              response.headers.set("x-user-id", sessionValidation.userId);
              response.headers.set("x-session-id", sessionValidation.sessionId || "");
            }
            // Check for suspicious activity
            return [4 /*yield*/, this.checkSuspiciousActivity(request, sessionValidation.userId)];
          case 7:
            // Check for suspicious activity
            _b.sent();
            return [2 /*return*/, response];
          case 8:
            error_1 = _b.sent();
            console.error("Session middleware error:", error_1);
            // Log error as security event
            return [
              4 /*yield*/,
              this.logSecurityEvent("unknown", session_1.SecurityEventType.SYSTEM_ERROR, {
                error: error_1 instanceof Error ? error_1.message : "Unknown error",
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "Unknown",
                requestPath: pathname,
              }),
            ];
          case 9:
            // Log error as security event
            _b.sent();
            return [2 /*return*/, this.redirectToLogin(request)];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check if the route is public and doesn't require authentication
   */
  SessionAuthMiddleware.prototype.isPublicRoute = function (pathname) {
    var publicRoutes = [
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
      "/verify-email",
      "/privacy",
      "/terms",
      "/about",
      "/contact",
      "/",
      "/public",
    ];
    return publicRoutes.some(function (route) {
      return pathname === route || pathname.startsWith("".concat(route, "/"));
    });
  };
  /**
   * Check if the API route is public
   */
  SessionAuthMiddleware.prototype.isPublicApiRoute = function (pathname) {
    var publicApiRoutes = [
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/verify-email",
      "/api/health",
      "/api/public",
    ];
    return publicApiRoutes.some(function (route) {
      return pathname === route || pathname.startsWith("".concat(route, "/"));
    });
  };
  /**
   * Get client IP address from request
   */
  SessionAuthMiddleware.prototype.getClientIP = function (request) {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    var remoteAddr = request.headers.get("x-remote-addr");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return realIP || remoteAddr || "0.0.0.0";
  };
  /**
   * Redirect to login page
   */
  SessionAuthMiddleware.prototype.redirectToLogin = function (request) {
    var loginUrl = new URL("/login", request.url);
    // Add return URL for redirect after login
    if (request.nextUrl.pathname !== "/login") {
      loginUrl.searchParams.set("returnUrl", request.nextUrl.pathname);
    }
    return server_1.NextResponse.redirect(loginUrl);
  };
  /**
   * Log security event
   */
  SessionAuthMiddleware.prototype.logSecurityEvent = function (userId, eventType, details) {
    return __awaiter(this, void 0, void 0, function () {
      var error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.sessionManager.logSecurityEvent({
                userId: userId,
                eventType: eventType,
                severity: this.getEventSeverity(eventType),
                details: details,
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_2 = _a.sent();
            console.error("Failed to log security event:", error_2);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get event severity based on type
   */
  SessionAuthMiddleware.prototype.getEventSeverity = function (eventType) {
    switch (eventType) {
      case session_1.SecurityEventType.FAILED_LOGIN:
      case session_1.SecurityEventType.SESSION_VALIDATION_FAILED:
        return "MEDIUM";
      case session_1.SecurityEventType.SUSPICIOUS_ACTIVITY:
      case session_1.SecurityEventType.MULTIPLE_FAILED_ATTEMPTS:
        return "HIGH";
      case session_1.SecurityEventType.ACCOUNT_LOCKED:
      case session_1.SecurityEventType.SECURITY_BREACH:
        return "CRITICAL";
      default:
        return "LOW";
    }
  };
  /**
   * Check for suspicious activity patterns
   */
  SessionAuthMiddleware.prototype.checkSuspiciousActivity = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var ipAddress, userAgent, recentRequests, isUnusualLocation, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            ipAddress = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "Unknown";
            return [4 /*yield*/, this.getRecentRequests(ipAddress)];
          case 1:
            recentRequests = _a.sent();
            if (!(recentRequests > 100)) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.logSecurityEvent(userId, session_1.SecurityEventType.SUSPICIOUS_ACTIVITY, {
                reason: "Rapid requests detected",
                requestCount: recentRequests,
                ipAddress: ipAddress,
                userAgent: userAgent,
                timeWindow: "1 minute",
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            if (!this.isUnusualUserAgent(userAgent)) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.logSecurityEvent(userId, session_1.SecurityEventType.SUSPICIOUS_ACTIVITY, {
                reason: "Unusual user agent detected",
                userAgent: userAgent,
                ipAddress: ipAddress,
              }),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            return [4 /*yield*/, this.checkUnusualLocation(userId, ipAddress)];
          case 6:
            isUnusualLocation = _a.sent();
            if (!isUnusualLocation) return [3 /*break*/, 8];
            return [
              4 /*yield*/,
              this.logSecurityEvent(userId, session_1.SecurityEventType.SUSPICIOUS_ACTIVITY, {
                reason: "Unusual geographic location",
                ipAddress: ipAddress,
                userAgent: userAgent,
              }),
            ];
          case 7:
            _a.sent();
            _a.label = 8;
          case 8:
            return [3 /*break*/, 10];
          case 9:
            error_3 = _a.sent();
            console.error("Error checking suspicious activity:", error_3);
            return [3 /*break*/, 10];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get recent request count for IP (simplified implementation)
   */
  SessionAuthMiddleware.prototype.getRecentRequests = function (ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would check a cache/database
        // For now, return 0 to avoid false positives
        return [2 /*return*/, 0];
      });
    });
  };
  /**
   * Check if user agent is unusual
   */
  SessionAuthMiddleware.prototype.isUnusualUserAgent = function (userAgent) {
    var suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /java/i,
    ];
    return suspiciousPatterns.some(function (pattern) {
      return pattern.test(userAgent);
    });
  };
  /**
   * Check for unusual geographic location (simplified)
   */
  SessionAuthMiddleware.prototype.checkUnusualLocation = function (userId, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // In a real implementation, this would:
        // 1. Get IP geolocation
        // 2. Compare with user's typical locations
        // 3. Flag if significantly different
        // For now, return false to avoid false positives
        return [2 /*return*/, false];
      });
    });
  };
  return SessionAuthMiddleware;
})();
exports.SessionAuthMiddleware = SessionAuthMiddleware;
// Export singleton instance
exports.sessionAuthMiddleware = new SessionAuthMiddleware();
/**
 * Middleware configuration for Next.js
 */
exports.config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
/**
 * Main middleware function for Next.js
 */
function middleware(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, exports.sessionAuthMiddleware.handle(request)];
    });
  });
}
