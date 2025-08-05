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
exports.SessionSecurityMiddleware = void 0;
exports.createSessionSecurityMiddleware = createSessionSecurityMiddleware;
var server_1 = require("next/server");
var integrated_session_security_1 = require("./integrated-session-security");
var supabase_js_1 = require("@supabase/supabase-js");
var DEFAULT_CONFIG = {
  enableCSRF: true,
  enableSessionHijackingProtection: true,
  enableSessionTimeout: true,
  enableConcurrentSessionLimit: true,
  skipPaths: [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/callback",
    "/api/health",
    "/api/public",
  ],
  maxConcurrentSessions: 3,
};
var SessionSecurityMiddleware = /** @class */ (() => {
  function SessionSecurityMiddleware(config) {
    if (config === void 0) {
      config = {};
    }
    this.config = __assign(__assign({}, DEFAULT_CONFIG), config);
    this.security = new integrated_session_security_1.IntegratedSessionSecurity();
    // Initialize Supabase client
    this.supabase = (0, supabase_js_1.createClient)(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
  }
  /**
   * Main middleware function
   */
  SessionSecurityMiddleware.prototype.middleware = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionId, userId, securityResult, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 5]);
            // Skip security checks for certain paths
            if (this.shouldSkipPath(request.nextUrl.pathname)) {
              return [2 /*return*/, server_1.NextResponse.next()];
            }
            sessionId = this.extractSessionId(request);
            return [4 /*yield*/, this.extractUserId(request)];
          case 1:
            userId = _a.sent();
            if (!sessionId) {
              return [2 /*return*/, this.createErrorResponse("Missing session ID", 401)];
            }
            return [4 /*yield*/, this.performSecurityCheck(request, sessionId, userId)];
          case 2:
            securityResult = _a.sent();
            // Handle security check result
            return [2 /*return*/, this.handleSecurityResult(request, securityResult)];
          case 3:
            error_1 = _a.sent();
            console.error("Session security middleware error:", error_1);
            // Log security event
            return [
              4 /*yield*/,
              this.logSecurityEvent({
                eventType: "middleware_error",
                riskScore: 5,
                eventDetails: {
                  error: error_1 instanceof Error ? error_1.message : "Unknown error",
                },
                request: request,
              }),
            ];
          case 4:
            // Log security event
            _a.sent();
            // In case of error, allow request but log the incident
            return [2 /*return*/, server_1.NextResponse.next()];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Perform comprehensive security check
   */
  SessionSecurityMiddleware.prototype.performSecurityCheck = function (request, sessionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var totalRiskScore,
        reasons,
        headers,
        csrfResult,
        hijackResult,
        timeoutResult,
        concurrentResult,
        rateLimitResult,
        action;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            totalRiskScore = 0;
            reasons = [];
            headers = {};
            if (!(this.config.enableCSRF && this.requiresCSRFCheck(request)))
              return [3 /*break*/, 2];
            return [4 /*yield*/, this.checkCSRF(request, sessionId)];
          case 1:
            csrfResult = _a.sent();
            if (!csrfResult.valid) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "block",
                  riskScore: 10,
                  reason: "CSRF token validation failed",
                },
              ];
            }
            _a.label = 2;
          case 2:
            if (!(this.config.enableSessionHijackingProtection && userId)) return [3 /*break*/, 4];
            return [4 /*yield*/, this.checkSessionHijacking(request, sessionId, userId)];
          case 3:
            hijackResult = _a.sent();
            totalRiskScore += hijackResult.riskScore;
            if (hijackResult.action === "block" || hijackResult.action === "terminate") {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: hijackResult.action,
                  riskScore: hijackResult.riskScore,
                  reason: hijackResult.reason,
                },
              ];
            }
            if (hijackResult.reason) {
              reasons.push(hijackResult.reason);
            }
            _a.label = 4;
          case 4:
            if (!(this.config.enableSessionTimeout && userId)) return [3 /*break*/, 6];
            return [4 /*yield*/, this.checkSessionTimeout(sessionId, userId)];
          case 5:
            timeoutResult = _a.sent();
            if (!timeoutResult.valid) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "terminate",
                  riskScore: 8,
                  reason: "Session timeout exceeded",
                },
              ];
            }
            if (timeoutResult.warning) {
              headers["X-Session-Warning"] = timeoutResult.warning;
            }
            _a.label = 6;
          case 6:
            if (!(this.config.enableConcurrentSessionLimit && userId)) return [3 /*break*/, 8];
            return [4 /*yield*/, this.checkConcurrentSessions(userId)];
          case 7:
            concurrentResult = _a.sent();
            if (!concurrentResult.allowed) {
              totalRiskScore += 3;
              reasons.push("Excessive concurrent sessions detected");
            }
            _a.label = 8;
          case 8:
            return [4 /*yield*/, this.checkRateLimit(request, userId)];
          case 9:
            rateLimitResult = _a.sent();
            if (!rateLimitResult.allowed) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "block",
                  riskScore: 6,
                  reason: "Rate limit exceeded",
                },
              ];
            }
            action = "allow";
            if (totalRiskScore >= 8) {
              action = "block";
            } else if (totalRiskScore >= 5) {
              action = "challenge";
            }
            return [
              2 /*return*/,
              {
                allowed: action === "allow" || action === "challenge",
                action: action,
                riskScore: totalRiskScore,
                reason: reasons.length > 0 ? reasons.join("; ") : undefined,
                headers: headers,
              },
            ];
        }
      });
    });
  };
  /**
   * Check CSRF token
   */
  SessionSecurityMiddleware.prototype.checkCSRF = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var token, isValid, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            token = request.headers.get("X-CSRF-Token") || request.headers.get("x-csrf-token");
            if (!token) {
              return [2 /*return*/, { valid: false, reason: "Missing CSRF token" }];
            }
            return [4 /*yield*/, this.security.csrfProtection.validateToken(token, sessionId)];
          case 1:
            isValid = _a.sent();
            return [2 /*return*/, { valid: isValid }];
          case 2:
            error_2 = _a.sent();
            return [2 /*return*/, { valid: false, reason: "CSRF validation error" }];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check for session hijacking
   */
  SessionSecurityMiddleware.prototype.checkSessionHijacking = function (
    request,
    sessionId,
    userId,
  ) {
    return __awaiter(this, void 0, void 0, function () {
      var result, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.security.hijackingProtection.validateSessionFingerprint(
                request,
                sessionId,
                userId,
              ),
            ];
          case 1:
            result = _a.sent();
            return [
              2 /*return*/,
              {
                riskScore: result.riskScore,
                action: result.action,
                reason: result.reason,
              },
            ];
          case 2:
            error_3 = _a.sent();
            return [
              2 /*return*/,
              {
                riskScore: 5,
                action: "allow",
                reason: "Hijacking check error",
              },
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check session timeout
   */
  SessionSecurityMiddleware.prototype.checkSessionTimeout = function (sessionId, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var result, warning, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [
              4 /*yield*/,
              this.security.timeoutManager.checkSessionTimeout(sessionId, userId),
            ];
          case 1:
            result = _a.sent();
            if (result.shouldTimeout) {
              return [2 /*return*/, { valid: false }];
            }
            if (result.requiresReauth) {
              return [
                2 /*return*/,
                {
                  valid: true,
                  warning: "Session requires reauthentication",
                },
              ];
            }
            return [4 /*yield*/, this.security.timeoutManager.getTimeoutWarning(sessionId)];
          case 2:
            warning = _a.sent();
            return [
              2 /*return*/,
              {
                valid: true,
                warning: warning || undefined,
              },
            ];
          case 3:
            error_4 = _a.sent();
            return [2 /*return*/, { valid: true }]; // Allow on error, but log it
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check concurrent sessions
   */
  SessionSecurityMiddleware.prototype.checkConcurrentSessions = function (userId) {
    return __awaiter(this, void 0, void 0, function () {
      var sessions, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              this.security.hijackingProtection.detectConcurrentSessions(
                userId,
                this.config.maxConcurrentSessions || 3,
              ),
            ];
          case 1:
            sessions = _a.sent();
            return [
              2 /*return*/,
              { allowed: sessions.length <= (this.config.maxConcurrentSessions || 3) },
            ];
          case 2:
            error_5 = _a.sent();
            return [2 /*return*/, { allowed: true }]; // Allow on error
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Check rate limiting
   */
  SessionSecurityMiddleware.prototype.checkRateLimit = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        try {
          // This would integrate with your existing rate limiting logic
          // For now, return true as placeholder
          return [2 /*return*/, { allowed: true }];
        } catch (error) {
          return [2 /*return*/, { allowed: true }];
        }
        return [2 /*return*/];
      });
    });
  };
  /**
   * Handle security check result
   */
  SessionSecurityMiddleware.prototype.handleSecurityResult = function (request, result) {
    // Add security headers
    var response = result.allowed
      ? server_1.NextResponse.next()
      : this.createErrorResponse(result.reason || "Security check failed", 403);
    // Add custom headers
    if (result.headers) {
      Object.entries(result.headers).forEach((_a) => {
        var key = _a[0],
          value = _a[1];
        response.headers.set(key, value);
      });
    }
    // Add risk score header for monitoring
    response.headers.set("X-Risk-Score", result.riskScore.toString());
    // Log security event if risk score is high
    if (result.riskScore >= 5) {
      this.logSecurityEvent({
        eventType: result.action === "block" ? "access_blocked" : "suspicious_activity",
        riskScore: result.riskScore,
        eventDetails: { reason: result.reason, action: result.action },
        request: request,
      });
    }
    return response;
  };
  /**
   * Utility methods
   */
  SessionSecurityMiddleware.prototype.shouldSkipPath = function (pathname) {
    var _a;
    return (
      ((_a = this.config.skipPaths) === null || _a === void 0
        ? void 0
        : _a.some((path) => pathname.startsWith(path))) || false
    );
  };
  SessionSecurityMiddleware.prototype.requiresCSRFCheck = (request) => {
    var method = request.method;
    return ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  };
  SessionSecurityMiddleware.prototype.extractSessionId = (request) => {
    // Try to get session ID from various sources
    var authHeader = request.headers.get("authorization");
    if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    // Try cookies
    var sessionCookie = request.cookies.get("session-id");
    if (sessionCookie) {
      return sessionCookie.value;
    }
    // Try custom header
    return request.headers.get("x-session-id");
  };
  SessionSecurityMiddleware.prototype.extractUserId = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader;
      return __generator(this, (_a) => {
        try {
          authHeader = request.headers.get("authorization");
          if (
            !(authHeader === null || authHeader === void 0
              ? void 0
              : authHeader.startsWith("Bearer "))
          ) {
            return [2 /*return*/, undefined];
          }
          // This would integrate with your auth system
          // For now, return undefined as placeholder
          return [2 /*return*/, undefined];
        } catch (error) {
          return [2 /*return*/, undefined];
        }
        return [2 /*return*/];
      });
    });
  };
  SessionSecurityMiddleware.prototype.createErrorResponse = (message, status) =>
    server_1.NextResponse.json(
      { error: message, timestamp: new Date().toISOString() },
      { status: status },
    );
  SessionSecurityMiddleware.prototype.logSecurityEvent = function (params) {
    return __awaiter(this, void 0, void 0, function () {
      var eventType, riskScore, eventDetails, request, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            (eventType = params.eventType),
              (riskScore = params.riskScore),
              (eventDetails = params.eventDetails),
              (request = params.request);
            return [
              4 /*yield*/,
              this.supabase.from("security_events").insert({
                event_type: eventType,
                risk_score: riskScore,
                event_details: eventDetails,
                ip_address: this.getClientIP(request),
                user_agent: request.headers.get("user-agent"),
                timestamp: new Date().toISOString(),
              }),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            error_6 = _a.sent();
            console.error("Failed to log security event:", error_6);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  SessionSecurityMiddleware.prototype.getClientIP = (request) => {
    var _a;
    return (
      ((_a = request.headers.get("x-forwarded-for")) === null || _a === void 0
        ? void 0
        : _a.split(",")[0]) ||
      request.headers.get("x-real-ip") ||
      request.headers.get("cf-connecting-ip") ||
      request.ip ||
      "unknown"
    );
  };
  return SessionSecurityMiddleware;
})();
exports.SessionSecurityMiddleware = SessionSecurityMiddleware;
/**
 * Create session security middleware with default configuration
 */
function createSessionSecurityMiddleware(config) {
  var middleware = new SessionSecurityMiddleware(config);
  return (request) => middleware.middleware(request);
}
