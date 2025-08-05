"use strict";
/**
 * Session Terminate API Route
 * Terminates an existing session and logs security event
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
exports.POST = POST;
exports.DELETE = DELETE;
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var server_2 = require("@/lib/supabase/server");
var session_1 = require("@/types/session");
// Initialize session manager
var sessionManager = null;
function getSessionManager() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          if (!!sessionManager) return [3 /*break*/, 2];
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          sessionManager = new SessionManager_1.SessionManager(supabase, {
            defaultTimeout: 30,
            maxConcurrentSessions: 5,
            enableDeviceTracking: true,
            enableSecurityMonitoring: true,
            enableSuspiciousActivityDetection: true,
            sessionCleanupInterval: 300000,
            securityEventRetention: 30 * 24 * 60 * 60 * 1000,
            encryptionKey: process.env.SESSION_ENCRYPTION_KEY || "default-key-change-in-production",
          });
          _a.label = 2;
        case 2:
          return [2 /*return*/, sessionManager];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      sessionId,
      reason,
      sessionToken,
      manager,
      clientIP,
      userAgent,
      session,
      terminated,
      response,
      error_1;
    var _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [4 /*yield*/, request.json()];
        case 1:
          (_a = _c.sent()), (sessionId = _a.sessionId), (reason = _a.reason);
          sessionToken =
            sessionId ||
            ((_b = cookieStore.get("session-token")) === null || _b === void 0 ? void 0 : _b.value);
          if (!sessionToken) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "No session token provided" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, getSessionManager()];
        case 2:
          manager = _c.sent();
          clientIP =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";
          userAgent = request.headers.get("user-agent") || "Unknown";
          return [4 /*yield*/, manager.getSession(sessionToken)];
        case 3:
          session = _c.sent();
          return [4 /*yield*/, manager.terminateSession(sessionToken)];
        case 4:
          terminated = _c.sent();
          if (!terminated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to terminate session or session not found" },
                { status: 404 },
              ),
            ];
          }
          // Log session termination event
          return [
            4 /*yield*/,
            manager.logSecurityEvent({
              session_id: sessionToken,
              event_type: session_1.SecurityEventType.SESSION_TERMINATED,
              severity: session_1.SecuritySeverity.MEDIUM,
              description: "Session terminated: ".concat(reason || "User logout"),
              ip_address: clientIP,
              user_agent: userAgent,
              metadata: {
                reason: reason || "User logout",
                terminated_at: new Date().toISOString(),
                session_duration: session
                  ? new Date().getTime() - new Date(session.created_at).getTime()
                  : null,
              },
            }),
          ];
        case 5:
          // Log session termination event
          _c.sent();
          response = server_1.NextResponse.json({
            success: true,
            message: "Session terminated successfully",
          });
          response.cookies.set("session-token", "", {
            expires: new Date(0),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
          });
          return [2 /*return*/, response];
        case 6:
          error_1 = _c.sent();
          console.error("Session termination error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error during session termination" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// Terminate all sessions for a user
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var userId, manager, clientIP, userAgent, activeSessions, terminatedCount, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, request.json()];
        case 1:
          userId = _a.sent().userId;
          if (!userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "User ID is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, getSessionManager()];
        case 2:
          manager = _a.sent();
          clientIP =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";
          userAgent = request.headers.get("user-agent") || "Unknown";
          return [4 /*yield*/, manager.getActiveSessions(userId)];
        case 3:
          activeSessions = _a.sent();
          return [4 /*yield*/, manager.terminateAllSessions(userId)];
        case 4:
          terminatedCount = _a.sent();
          // Log bulk termination event
          return [
            4 /*yield*/,
            manager.logSecurityEvent({
              session_id: "bulk-termination",
              event_type: session_1.SecurityEventType.BULK_SESSION_TERMINATION,
              severity: session_1.SecuritySeverity.HIGH,
              description: "All sessions terminated for user: ".concat(userId),
              ip_address: clientIP,
              user_agent: userAgent,
              metadata: {
                user_id: userId,
                terminated_count: terminatedCount,
                terminated_sessions: activeSessions.map(function (s) {
                  return s.id;
                }),
                timestamp: new Date().toISOString(),
              },
            }),
          ];
        case 5:
          // Log bulk termination event
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "".concat(terminatedCount, " sessions terminated successfully"),
              terminatedCount: terminatedCount,
            }),
          ];
        case 6:
          error_2 = _a.sent();
          console.error("Bulk session termination error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error during bulk session termination" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function OPTIONS(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        new server_1.NextResponse(null, {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }),
      ];
    });
  });
}
