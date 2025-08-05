"use strict";
/**
 * Session Hijacking Protection for NeonPro
 * Detects and prevents session hijacking attempts
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
exports.SessionHijackingProtection = void 0;
var client_1 = require("@/lib/supabase/client");
var crypto_1 = require("crypto");
/**
 * Session Hijacking Protection Manager
 */
var SessionHijackingProtection = /** @class */ (function () {
  function SessionHijackingProtection() {}
  /**
   * Generate session fingerprint from request
   */
  SessionHijackingProtection.generateFingerprint = function (request) {
    return {
      userAgent: request.headers.get("user-agent") || "",
      ipAddress: this.getClientIP(request),
      acceptLanguage: request.headers.get("accept-language") || "",
      acceptEncoding: request.headers.get("accept-encoding") || "",
      // Additional fingerprint data can be added via client-side JS
    };
  };
  /**
   * Create fingerprint hash for comparison
   */
  SessionHijackingProtection.createFingerprintHash = function (fingerprint) {
    var data = ""
      .concat(fingerprint.userAgent, ":")
      .concat(fingerprint.acceptLanguage, ":")
      .concat(fingerprint.acceptEncoding);
    return (0, crypto_1.createHash)("sha256").update(data).digest("hex");
  };
  /**
   * Store session fingerprint
   */
  SessionHijackingProtection.storeSessionFingerprint = function (sessionId, userId, fingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, fingerprintHash, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            fingerprintHash = this.createFingerprintHash(fingerprint);
            return [
              4 /*yield*/,
              supabase.from("session_fingerprints").upsert({
                session_id: sessionId,
                user_id: userId,
                fingerprint_hash: fingerprintHash,
                fingerprint_data: fingerprint,
                ip_address: fingerprint.ipAddress,
                user_agent: fingerprint.userAgent,
                created_at: new Date().toISOString(),
                last_seen: new Date().toISOString(),
              }),
            ];
          case 2:
            error = _a.sent().error;
            return [2 /*return*/, !error];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to store session fingerprint:", error_1);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate session against stored fingerprint
   */
  SessionHijackingProtection.validateSessionFingerprint = function (sessionId, currentFingerprint) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase,
        _a,
        storedSession,
        error,
        storedFingerprint,
        riskScore,
        reasons,
        action,
        requiresReauth,
        error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("session_fingerprints")
                .select("*")
                .eq("session_id", sessionId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (storedSession = _a.data), (error = _a.error);
            if (error || !storedSession) {
              return [
                2 /*return*/,
                {
                  valid: false,
                  riskScore: 10,
                  action: "block",
                  reason: "No stored session fingerprint found",
                },
              ];
            }
            storedFingerprint = storedSession.fingerprint_data;
            riskScore = 0;
            reasons = [];
            // Check IP address change
            if (storedFingerprint.ipAddress !== currentFingerprint.ipAddress) {
              riskScore += 3;
              reasons.push("IP address changed");
            }
            // Check User-Agent change
            if (storedFingerprint.userAgent !== currentFingerprint.userAgent) {
              riskScore += 4;
              reasons.push("User agent changed");
            }
            // Check Accept-Language change
            if (storedFingerprint.acceptLanguage !== currentFingerprint.acceptLanguage) {
              riskScore += 2;
              reasons.push("Accept language changed");
            }
            // Check Accept-Encoding change
            if (storedFingerprint.acceptEncoding !== currentFingerprint.acceptEncoding) {
              riskScore += 1;
              reasons.push("Accept encoding changed");
            }
            // Update last seen
            return [
              4 /*yield*/,
              supabase
                .from("session_fingerprints")
                .update({ last_seen: new Date().toISOString() })
                .eq("session_id", sessionId),
            ];
          case 3:
            // Update last seen
            _b.sent();
            action = "allow";
            requiresReauth = false;
            if (riskScore >= this.BLOCK_THRESHOLD) {
              action = "terminate";
              requiresReauth = true;
            } else if (riskScore >= this.CHALLENGE_THRESHOLD) {
              action = "challenge";
              requiresReauth = true;
            }
            if (!(riskScore > 0)) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.logSecurityEvent({
                sessionId: sessionId,
                userId: storedSession.user_id,
                eventType:
                  riskScore >= this.CHALLENGE_THRESHOLD ? "hijack_attempt" : "suspicious_activity",
                riskScore: riskScore,
                fingerprint: currentFingerprint,
                timestamp: Date.now(),
                details: {
                  reasons: reasons,
                  storedFingerprint: storedFingerprint,
                  currentFingerprint: currentFingerprint,
                },
              }),
            ];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            return [
              2 /*return*/,
              {
                valid: action !== "terminate",
                riskScore: riskScore,
                action: action,
                reason: reasons.join(", "),
                requiresReauth: requiresReauth,
              },
            ];
          case 6:
            error_2 = _b.sent();
            console.error("Session fingerprint validation error:", error_2);
            return [
              2 /*return*/,
              {
                valid: false,
                riskScore: 10,
                action: "block",
                reason: "Validation error",
              },
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Detect concurrent sessions for a user
   */
  SessionHijackingProtection.detectConcurrentSessions = function (userId_1, currentSessionId_1) {
    return __awaiter(
      this,
      arguments,
      void 0,
      function (userId, currentSessionId, maxConcurrentSessions) {
        var supabase,
          _a,
          sessions,
          error,
          activeSessions,
          hasExcess,
          sessionsToTerminate,
          sessionsToKeep_1,
          error_3;
        if (maxConcurrentSessions === void 0) {
          maxConcurrentSessions = 3;
        }
        return __generator(this, function (_b) {
          switch (_b.label) {
            case 0:
              _b.trys.push([0, 5, , 6]);
              return [4 /*yield*/, (0, client_1.createClient)()];
            case 1:
              supabase = _b.sent();
              return [
                4 /*yield*/,
                supabase
                  .from("session_fingerprints")
                  .select("session_id, last_seen, created_at")
                  .eq("user_id", userId)
                  .gte("last_seen", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
                  .order("last_seen", { ascending: false }),
              ];
            case 2:
              (_a = _b.sent()), (sessions = _a.data), (error = _a.error);
              if (error || !sessions) {
                return [
                  2 /*return*/,
                  { hasExcess: false, activeSessions: 0, sessionsToTerminate: [] },
                ];
              }
              activeSessions = sessions.length;
              hasExcess = activeSessions > maxConcurrentSessions;
              sessionsToTerminate = [];
              if (!hasExcess) return [3 /*break*/, 4];
              sessionsToKeep_1 = sessions
                .filter(function (s) {
                  return s.session_id === currentSessionId;
                })
                .concat(
                  sessions
                    .filter(function (s) {
                      return s.session_id !== currentSessionId;
                    })
                    .slice(0, maxConcurrentSessions - 1),
                );
              sessionsToTerminate = sessions
                .filter(function (s) {
                  return !sessionsToKeep_1.some(function (keep) {
                    return keep.session_id === s.session_id;
                  });
                })
                .map(function (s) {
                  return s.session_id;
                });
              // Log concurrent session event
              return [
                4 /*yield*/,
                this.logSecurityEvent({
                  sessionId: currentSessionId,
                  userId: userId,
                  eventType: "concurrent_session",
                  riskScore: Math.min(activeSessions - maxConcurrentSessions, 5),
                  fingerprint: {}, // Will be filled by caller
                  timestamp: Date.now(),
                  details: {
                    activeSessions: activeSessions,
                    maxAllowed: maxConcurrentSessions,
                    sessionsToTerminate: sessionsToTerminate,
                  },
                }),
              ];
            case 3:
              // Log concurrent session event
              _b.sent();
              _b.label = 4;
            case 4:
              return [
                2 /*return*/,
                {
                  hasExcess: hasExcess,
                  activeSessions: activeSessions,
                  sessionsToTerminate: sessionsToTerminate,
                },
              ];
            case 5:
              error_3 = _b.sent();
              console.error("Concurrent session detection error:", error_3);
              return [
                2 /*return*/,
                { hasExcess: false, activeSessions: 0, sessionsToTerminate: [] },
              ];
            case 6:
              return [2 /*return*/];
          }
        });
      },
    );
  };
  /**
   * Terminate suspicious sessions
   */
  SessionHijackingProtection.terminateSessions = function (sessionIds) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, fingerprintError, _i, sessionIds_1, sessionId, error_4, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 9, , 10]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("session_fingerprints").delete().in("session_id", sessionIds),
            ];
          case 2:
            fingerprintError = _a.sent().error;
            (_i = 0), (sessionIds_1 = sessionIds);
            _a.label = 3;
          case 3:
            if (!(_i < sessionIds_1.length)) return [3 /*break*/, 8];
            sessionId = sessionIds_1[_i];
            _a.label = 4;
          case 4:
            _a.trys.push([4, 6, , 7]);
            // This would integrate with your session management system
            // For Supabase, you might need to call their admin API
            return [4 /*yield*/, this.invalidateSession(sessionId)];
          case 5:
            // This would integrate with your session management system
            // For Supabase, you might need to call their admin API
            _a.sent();
            return [3 /*break*/, 7];
          case 6:
            error_4 = _a.sent();
            console.error("Failed to invalidate session ".concat(sessionId, ":"), error_4);
            return [3 /*break*/, 7];
          case 7:
            _i++;
            return [3 /*break*/, 3];
          case 8:
            return [2 /*return*/, !fingerprintError];
          case 9:
            error_5 = _a.sent();
            console.error("Failed to terminate sessions:", error_5);
            return [2 /*return*/, false];
          case 10:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Log security event
   */
  SessionHijackingProtection.logSecurityEvent = function (event) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            return [
              4 /*yield*/,
              supabase.from("security_events").insert({
                session_id: event.sessionId,
                user_id: event.userId,
                event_type: event.eventType,
                risk_score: event.riskScore,
                fingerprint_data: event.fingerprint,
                event_details: event.details,
                timestamp: new Date(event.timestamp).toISOString(),
              }),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_6 = _a.sent();
            console.error("Failed to log security event:", error_6);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get client IP address
   */
  SessionHijackingProtection.getClientIP = function (request) {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    var cfConnectingIP = request.headers.get("cf-connecting-ip");
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.ip || "unknown";
  };
  /**
   * Invalidate session (integrate with your auth system)
   */
  SessionHijackingProtection.invalidateSession = function (sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        // This should integrate with your session management system
        // For Supabase, you might use the admin API or custom function
        console.log("Invalidating session: ".concat(sessionId));
        return [2 /*return*/];
      });
    });
  };
  SessionHijackingProtection.MAX_RISK_SCORE = 10;
  SessionHijackingProtection.CHALLENGE_THRESHOLD = 6;
  SessionHijackingProtection.BLOCK_THRESHOLD = 8;
  return SessionHijackingProtection;
})();
exports.SessionHijackingProtection = SessionHijackingProtection;
exports.default = SessionHijackingProtection;
