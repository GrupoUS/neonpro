"use strict";
/**
 * Integrated Session Security Manager for NeonPro
 * Combines all session security features into a unified system
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
exports.IntegratedSessionSecurity = void 0;
var server_1 = require("next/server");
var csrf_protection_1 = require("./csrf-protection");
var session_hijacking_protection_1 = require("./session-hijacking-protection");
var session_timeout_manager_1 = require("./session-timeout-manager");
var client_1 = require("@/lib/supabase/client");
/**
 * Integrated Session Security Manager
 */
var IntegratedSessionSecurity = /** @class */ (function () {
  function IntegratedSessionSecurity() {}
  /**
   * Initialize session security for a new session
   */
  IntegratedSessionSecurity.initializeSessionSecurity = function (
    sessionId_1,
    userId_1,
    request_1,
  ) {
    return __awaiter(this, arguments, void 0, function (sessionId, userId, request, config) {
      var fullConfig, fingerprint, concurrentCheck, error_1;
      if (config === void 0) {
        config = {};
      }
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            fullConfig = __assign(__assign({}, this.DEFAULT_CONFIG), config);
            fingerprint =
              session_hijacking_protection_1.SessionHijackingProtection.generateFingerprint(
                request,
              );
            if (!fullConfig.hijackingProtection.enabled) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              session_hijacking_protection_1.SessionHijackingProtection.storeSessionFingerprint(
                sessionId,
                userId,
                fingerprint,
              ),
            ];
          case 1:
            _a.sent();
            _a.label = 2;
          case 2:
            if (!fullConfig.timeout.enabled) return [3 /*break*/, 4];
            return [
              4 /*yield*/,
              session_timeout_manager_1.SessionTimeoutManager.initializeSessionTimeout(
                sessionId,
                userId,
                {
                  maxInactivityMinutes: fullConfig.timeout.maxInactivityMinutes,
                  warningIntervals: fullConfig.timeout.warningIntervals,
                  extendOnActivity: fullConfig.timeout.extendOnActivity,
                  requireReauthForSensitive: true,
                  gracePeriodMinutes: 2,
                },
              ),
            ];
          case 3:
            _a.sent();
            _a.label = 4;
          case 4:
            if (!fullConfig.concurrentSessions.enabled) return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              session_hijacking_protection_1.SessionHijackingProtection.detectConcurrentSessions(
                userId,
                sessionId,
                fullConfig.concurrentSessions.maxSessions,
              ),
            ];
          case 5:
            concurrentCheck = _a.sent();
            if (!(concurrentCheck.hasExcess && fullConfig.concurrentSessions.terminateOldest))
              return [3 /*break*/, 7];
            return [
              4 /*yield*/,
              session_hijacking_protection_1.SessionHijackingProtection.terminateSessions(
                concurrentCheck.sessionsToTerminate,
              ),
            ];
          case 6:
            _a.sent();
            _a.label = 7;
          case 7:
            // Store security configuration
            return [4 /*yield*/, this.storeSecurityConfig(sessionId, fullConfig)];
          case 8:
            // Store security configuration
            _a.sent();
            return [2 /*return*/, true];
          case 9:
            error_1 = _a.sent();
            console.error("Failed to initialize session security:", error_1);
            return [2 /*return*/, false];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Comprehensive security check for requests
   */
  IntegratedSessionSecurity.performSecurityCheck = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var riskScore,
        warnings,
        requiresReauth,
        csrfToken,
        config,
        _a,
        csrfResult,
        tokenResult,
        fingerprint,
        hijackingCheck,
        timeoutCheck,
        action,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 12, , 13]);
            riskScore = 0;
            warnings = [];
            requiresReauth = false;
            csrfToken = void 0;
            if (!sessionId) return [3 /*break*/, 2];
            return [4 /*yield*/, this.getSecurityConfig(sessionId)];
          case 1:
            _a = _b.sent();
            return [3 /*break*/, 3];
          case 2:
            _a = this.DEFAULT_CONFIG;
            _b.label = 3;
          case 3:
            config = _a;
            if (!(config.csrf.enabled && !["GET", "HEAD", "OPTIONS"].includes(request.method)))
              return [3 /*break*/, 6];
            return [4 /*yield*/, csrf_protection_1.CSRFProtection.validateCSRFMiddleware(request)];
          case 4:
            csrfResult = _b.sent();
            if (csrfResult) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "block",
                  reason: "CSRF token validation failed",
                  riskScore: 10,
                },
              ];
            }
            return [4 /*yield*/, csrf_protection_1.CSRFProtection.generateTokenForClient(request)];
          case 5:
            tokenResult = _b.sent();
            if (tokenResult) {
              csrfToken = tokenResult.token;
            }
            _b.label = 6;
          case 6:
            if (!(sessionId && config.hijackingProtection.enabled)) return [3 /*break*/, 8];
            fingerprint =
              session_hijacking_protection_1.SessionHijackingProtection.generateFingerprint(
                request,
              );
            return [
              4 /*yield*/,
              session_hijacking_protection_1.SessionHijackingProtection.validateSessionFingerprint(
                sessionId,
                fingerprint,
              ),
            ];
          case 7:
            hijackingCheck = _b.sent();
            riskScore += hijackingCheck.riskScore;
            if (!hijackingCheck.valid) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "terminate",
                  reason: hijackingCheck.reason,
                  riskScore: hijackingCheck.riskScore,
                  requiresReauth: true,
                },
              ];
            }
            if (hijackingCheck.riskScore >= config.hijackingProtection.requireReauthThreshold) {
              requiresReauth = true;
              warnings.push("Session security risk detected - reauthentication required");
            } else if (hijackingCheck.riskScore >= config.hijackingProtection.riskThreshold) {
              warnings.push("Suspicious session activity detected");
            }
            _b.label = 8;
          case 8:
            if (!(sessionId && config.timeout.enabled)) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              session_timeout_manager_1.SessionTimeoutManager.checkSessionTimeout(sessionId),
            ];
          case 9:
            timeoutCheck = _b.sent();
            if (timeoutCheck.shouldTimeout) {
              return [
                2 /*return*/,
                {
                  allowed: false,
                  action: "terminate",
                  reason: "Session has timed out",
                  riskScore: 10,
                  requiresReauth: true,
                },
              ];
            }
            if (timeoutCheck.requiresReauth) {
              requiresReauth = true;
              warnings.push("Session approaching timeout - reauthentication recommended");
            }
            if (!config.timeout.extendOnActivity) return [3 /*break*/, 11];
            return [
              4 /*yield*/,
              session_timeout_manager_1.SessionTimeoutManager.updateActivity(sessionId, {
                userId: "", // Will be filled from session context
                lastActivity: Date.now(),
                activityType: "api_call",
                path: request.nextUrl.pathname,
              }),
            ];
          case 10:
            _b.sent();
            _b.label = 11;
          case 11:
            action = "allow";
            if (riskScore >= 8) {
              action = "terminate";
              requiresReauth = true;
            } else if (riskScore >= 6 || requiresReauth) {
              action = "challenge";
              requiresReauth = true;
            } else if (riskScore >= 3) {
              action = "allow";
              warnings.push("Elevated security risk detected");
            }
            return [
              2 /*return*/,
              {
                allowed: action !== "terminate" && action !== "block",
                action: action,
                riskScore: riskScore,
                requiresReauth: requiresReauth,
                csrfToken: csrfToken,
                warnings: warnings.length > 0 ? warnings : undefined,
              },
            ];
          case 12:
            error_2 = _b.sent();
            console.error("Security check failed:", error_2);
            return [
              2 /*return*/,
              {
                allowed: false,
                action: "block",
                reason: "Security check error",
                riskScore: 10,
              },
            ];
          case 13:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Create security middleware
   */
  IntegratedSessionSecurity.createSecurityMiddleware = function () {
    var _this = this;
    return function (request) {
      return __awaiter(_this, void 0, void 0, function () {
        var sessionId, securityResult, response_1, response;
        var _a;
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              sessionId =
                ((_a = request.cookies.get("session-id")) === null || _a === void 0
                  ? void 0
                  : _a.value) || request.headers.get("X-Session-ID");
              return [4 /*yield*/, this.performSecurityCheck(request, sessionId)];
            case 1:
              securityResult = _b.sent();
              // Handle security decision
              if (!securityResult.allowed) {
                response_1 = new server_1.NextResponse(
                  JSON.stringify({
                    error: securityResult.reason || "Security check failed",
                    action: securityResult.action,
                    requiresReauth: securityResult.requiresReauth,
                    riskScore: securityResult.riskScore,
                  }),
                  {
                    status: securityResult.action === "terminate" ? 401 : 403,
                    headers: { "Content-Type": "application/json" },
                  },
                );
                return [2 /*return*/, response_1];
              }
              response = server_1.NextResponse.next();
              // Add CSRF token if available
              if (securityResult.csrfToken) {
                response.headers.set("X-CSRF-Token", securityResult.csrfToken);
              }
              // Add security warnings
              if (securityResult.warnings) {
                response.headers.set("X-Security-Warnings", securityResult.warnings.join("; "));
              }
              // Add risk score for debugging
              if (process.env.NODE_ENV === "development") {
                response.headers.set("X-Security-Risk-Score", securityResult.riskScore.toString());
              }
              return [2 /*return*/, response];
          }
        });
      });
    };
  };
  /**
   * Get session security context
   */
  IntegratedSessionSecurity.getSessionSecurityContext = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        sessionData,
        timeoutData,
        lastActivity,
        isActive,
        timeoutAt,
        requiresReauth,
        error_3;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_fingerprints")
                .select("user_id, fingerprint_data, last_seen")
                .eq("session_id", sessionId)
                .single(),
            ];
          case 2:
            sessionData = _b.sent().data;
            if (!sessionData) {
              return [2 /*return*/, null];
            }
            return [
              4 /*yield*/,
              supabase
                .from("session_timeouts")
                .select("last_activity, timeout_at, is_active")
                .eq("session_id", sessionId)
                .single(),
            ];
          case 3:
            timeoutData = _b.sent().data;
            lastActivity = timeoutData
              ? new Date(timeoutData.last_activity).getTime()
              : new Date(sessionData.last_seen).getTime();
            isActive =
              (_a =
                timeoutData === null || timeoutData === void 0 ? void 0 : timeoutData.is_active) !==
                null && _a !== void 0
                ? _a
                : true;
            timeoutAt = timeoutData ? new Date(timeoutData.timeout_at).getTime() : 0;
            requiresReauth = !isActive || (timeoutAt > 0 && Date.now() > timeoutAt);
            return [
              2 /*return*/,
              {
                sessionId: sessionId,
                userId: sessionData.user_id,
                fingerprint: sessionData.fingerprint_data,
                isAuthenticated: isActive && !requiresReauth,
                lastActivity: lastActivity,
                riskScore: requiresReauth ? 10 : 0,
                requiresReauth: requiresReauth,
              },
            ];
          case 4:
            error_3 = _b.sent();
            console.error("Failed to get session security context:", error_3);
            return [2 /*return*/, null];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Store security configuration
   */
  IntegratedSessionSecurity.storeSecurityConfig = function (sessionId, config) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("session_security_configs").upsert({
                session_id: sessionId,
                config: config,
                created_at: new Date().toISOString(),
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_4 = _a.sent();
            console.error("Failed to store security config:", error_4);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get security configuration
   */
  IntegratedSessionSecurity.getSecurityConfig = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, data, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_security_configs")
                .select("config")
                .eq("session_id", sessionId)
                .single(),
            ];
          case 2:
            data = _a.sent().data;
            return [
              2 /*return*/,
              (data === null || data === void 0 ? void 0 : data.config) || this.DEFAULT_CONFIG,
            ];
          case 3:
            error_5 = _a.sent();
            console.error("Failed to get security config:", error_5);
            return [2 /*return*/, this.DEFAULT_CONFIG];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup expired security data
   */
  IntegratedSessionSecurity.cleanupSecurityData = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, ninetyDaysAgo, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 5, , 6]);
            return [
              4 /*yield*/,
              session_timeout_manager_1.SessionTimeoutManager.cleanupExpiredSessions(),
            ];
          case 1:
            _a.sent();
            return [4 /*yield*/, csrf_protection_1.CSRFProtection.cleanupExpiredTokens()];
          case 2:
            _a.sent();
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 3:
            supabase = _a.sent();
            ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
            return [
              4 /*yield*/,
              supabase.from("security_events").delete().lt("timestamp", ninetyDaysAgo),
            ];
          case 4:
            _a.sent();
            return [3 /*break*/, 6];
          case 5:
            error_6 = _a.sent();
            console.error("Failed to cleanup security data:", error_6);
            return [3 /*break*/, 6];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  IntegratedSessionSecurity.DEFAULT_CONFIG = {
    csrf: {
      enabled: true,
      strictMode: false,
    },
    hijackingProtection: {
      enabled: true,
      riskThreshold: 6,
      requireReauthThreshold: 8,
    },
    timeout: {
      enabled: true,
      maxInactivityMinutes: 30,
      warningIntervals: [10, 5, 2, 1],
      extendOnActivity: true,
    },
    concurrentSessions: {
      enabled: true,
      maxSessions: 3,
      terminateOldest: true,
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      burstLimit: 10,
    },
  };
  return IntegratedSessionSecurity;
})();
exports.IntegratedSessionSecurity = IntegratedSessionSecurity;
exports.default = IntegratedSessionSecurity;
