"use strict";
/**
 * CSRF Protection Implementation for NeonPro
 * Provides Cross-Site Request Forgery protection for forms and API endpoints
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
exports.validateCSRF = exports.CSRFProtection = void 0;
var server_1 = require("next/server");
var crypto_1 = require("crypto");
var client_1 = require("@/lib/supabase/client");
/**
 * CSRF Protection Manager
 */
var CSRFProtection = /** @class */ (function () {
  function CSRFProtection() {}
  /**
   * Generate a new CSRF token
   */
  CSRFProtection.generateToken = function (sessionId, userAgent, ipAddress) {
    var token = (0, crypto_1.randomBytes)(this.TOKEN_LENGTH).toString("hex");
    var now = Date.now();
    return {
      token: token,
      sessionId: sessionId,
      createdAt: now,
      expiresAt: now + this.TOKEN_EXPIRY,
      userAgent: userAgent,
      ipAddress: ipAddress,
    };
  };
  /**
   * Create token hash for storage
   */
  CSRFProtection.createTokenHash = function (tokenData) {
    return (0, crypto_1.createHash)("sha256")
      .update(
        ""
          .concat(tokenData.token, ":")
          .concat(tokenData.sessionId, ":")
          .concat(tokenData.userAgent),
      )
      .digest("hex");
  };
  /**
   * Store CSRF token in database
   */
  CSRFProtection.storeToken = function (tokenData) {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, tokenHash, error, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            tokenHash = this.createTokenHash(tokenData);
            return [
              4 /*yield*/,
              supabase.from("csrf_tokens").insert({
                token_hash: tokenHash,
                session_id: tokenData.sessionId,
                expires_at: new Date(tokenData.expiresAt).toISOString(),
                user_agent: tokenData.userAgent,
                ip_address: tokenData.ipAddress,
                created_at: new Date(tokenData.createdAt).toISOString(),
              }),
            ];
          case 2:
            error = _a.sent().error;
            return [2 /*return*/, !error];
          case 3:
            error_1 = _a.sent();
            console.error("Failed to store CSRF token:", error_1);
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate CSRF token
   */
  CSRFProtection.validateToken = function (token, sessionId, userAgent, ipAddress) {
    return __awaiter(this, void 0, void 0, function () {
      var tokenData, tokenHash, supabase, _a, data, error, expiresAt, error_2;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            if (!token || !sessionId) {
              return [2 /*return*/, { valid: false, error: "Missing CSRF token or session ID" }];
            }
            tokenData = {
              token: token,
              sessionId: sessionId,
              createdAt: 0,
              expiresAt: 0,
              userAgent: userAgent,
              ipAddress: ipAddress,
            };
            tokenHash = this.createTokenHash(tokenData);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _b.sent();
            return [
              4 /*yield*/,
              supabase
                .from("csrf_tokens")
                .select("*")
                .eq("token_hash", tokenHash)
                .eq("session_id", sessionId)
                .single(),
            ];
          case 2:
            (_a = _b.sent()), (data = _a.data), (error = _a.error);
            if (error || !data) {
              return [2 /*return*/, { valid: false, error: "Invalid CSRF token" }];
            }
            expiresAt = new Date(data.expires_at).getTime();
            if (!(Date.now() > expiresAt)) return [3 /*break*/, 4];
            // Clean up expired token
            return [4 /*yield*/, this.cleanupExpiredTokens()];
          case 3:
            // Clean up expired token
            _b.sent();
            return [2 /*return*/, { valid: false, error: "CSRF token expired" }];
          case 4:
            // Validate user agent (optional strict check)
            if (process.env.CSRF_STRICT_UA === "true" && data.user_agent !== userAgent) {
              return [2 /*return*/, { valid: false, error: "User agent mismatch" }];
            }
            // Validate IP address (optional strict check)
            if (process.env.CSRF_STRICT_IP === "true" && data.ip_address !== ipAddress) {
              return [2 /*return*/, { valid: false, error: "IP address mismatch" }];
            }
            return [
              2 /*return*/,
              {
                valid: true,
                tokenData: {
                  token: token,
                  sessionId: sessionId,
                  createdAt: new Date(data.created_at).getTime(),
                  expiresAt: expiresAt,
                  userAgent: data.user_agent,
                  ipAddress: data.ip_address,
                },
              },
            ];
          case 5:
            error_2 = _b.sent();
            console.error("CSRF token validation error:", error_2);
            return [2 /*return*/, { valid: false, error: "Token validation failed" }];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Clean up expired tokens
   */
  CSRFProtection.cleanupExpiredTokens = function () {
    return __awaiter(this, void 0, void 0, function () {
      var supabase, now, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, (0, client_1.createClient)()];
          case 1:
            supabase = _a.sent();
            now = new Date().toISOString();
            return [4 /*yield*/, supabase.from("csrf_tokens").delete().lt("expires_at", now)];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            error_3 = _a.sent();
            console.error("Failed to cleanup expired CSRF tokens:", error_3);
            return [3 /*break*/, 4];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Middleware to validate CSRF tokens
   */
  CSRFProtection.validateCSRFMiddleware = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var pathname, csrfToken, sessionId, userAgent, ipAddress, validation;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            // Skip CSRF validation for safe methods
            if (["GET", "HEAD", "OPTIONS"].includes(request.method)) {
              return [2 /*return*/, null];
            }
            pathname = request.nextUrl.pathname;
            if (pathname.includes("/health") || pathname.includes("/monitoring")) {
              return [2 /*return*/, null];
            }
            csrfToken =
              request.headers.get(this.HEADER_NAME) ||
              ((_a = request.cookies.get(this.COOKIE_NAME)) === null || _a === void 0
                ? void 0
                : _a.value);
            if (!csrfToken) {
              return [
                2 /*return*/,
                new server_1.NextResponse(JSON.stringify({ error: "CSRF token required" }), {
                  status: 403,
                  headers: { "Content-Type": "application/json" },
                }),
              ];
            }
            sessionId =
              ((_b = request.cookies.get("session-id")) === null || _b === void 0
                ? void 0
                : _b.value) || request.headers.get("X-Session-ID");
            if (!sessionId) {
              return [
                2 /*return*/,
                new server_1.NextResponse(JSON.stringify({ error: "Session ID required" }), {
                  status: 403,
                  headers: { "Content-Type": "application/json" },
                }),
              ];
            }
            userAgent = request.headers.get("user-agent") || "";
            ipAddress = this.getClientIP(request);
            return [4 /*yield*/, this.validateToken(csrfToken, sessionId, userAgent, ipAddress)];
          case 1:
            validation = _c.sent();
            if (!validation.valid) {
              return [
                2 /*return*/,
                new server_1.NextResponse(
                  JSON.stringify({ error: validation.error || "Invalid CSRF token" }),
                  { status: 403, headers: { "Content-Type": "application/json" } },
                ),
              ];
            }
            return [2 /*return*/, null]; // Validation passed
        }
      });
    });
  };
  /**
   * Generate CSRF token for client
   */
  CSRFProtection.generateTokenForClient = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var sessionId, userAgent, ipAddress, tokenData, stored, error_4;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 2, , 3]);
            sessionId =
              ((_a = request.cookies.get("session-id")) === null || _a === void 0
                ? void 0
                : _a.value) || request.headers.get("X-Session-ID");
            if (!sessionId) {
              return [2 /*return*/, null];
            }
            userAgent = request.headers.get("user-agent") || "";
            ipAddress = this.getClientIP(request);
            tokenData = this.generateToken(sessionId, userAgent, ipAddress);
            return [4 /*yield*/, this.storeToken(tokenData)];
          case 1:
            stored = _b.sent();
            if (!stored) {
              return [2 /*return*/, null];
            }
            return [
              2 /*return*/,
              {
                token: tokenData.token,
                expires: tokenData.expiresAt,
              },
            ];
          case 2:
            error_4 = _b.sent();
            console.error("Failed to generate CSRF token for client:", error_4);
            return [2 /*return*/, null];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get client IP address
   */
  CSRFProtection.getClientIP = function (request) {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    var cfConnectingIP = request.headers.get("cf-connecting-ip");
    if (cfConnectingIP) return cfConnectingIP;
    if (realIP) return realIP;
    if (forwarded) return forwarded.split(",")[0].trim();
    return request.ip || "unknown";
  };
  CSRFProtection.TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour
  CSRFProtection.TOKEN_LENGTH = 32;
  CSRFProtection.HEADER_NAME = "X-CSRF-Token";
  CSRFProtection.COOKIE_NAME = "csrf-token";
  return CSRFProtection;
})();
exports.CSRFProtection = CSRFProtection;
// Export for use in other modules
exports.default = CSRFProtection;
// Export with expected function name
exports.validateCSRF = CSRFProtection.validateCSRFMiddleware;
