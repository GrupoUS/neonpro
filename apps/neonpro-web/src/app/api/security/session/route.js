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
exports.POST = POST;
exports.PUT = PUT;
exports.GET = GET;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var integrated_session_security_1 = require("@/lib/security/integrated-session-security");
var auth_1 = require("@/lib/auth");
/**
 * Session Security API Route
 * Handles session management, validation, and security operations
 */
var sessionSecurity = new integrated_session_security_1.IntegratedSessionSecurity();
/**
 * POST /api/security/session
 * Initialize session security for a user
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, body, sessionId, _a, maxConcurrentSessions, result, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
        case 1:
          authResult = _b.sent();
          if (!authResult.authenticated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 2:
          body = _b.sent();
          (sessionId = body.sessionId),
            (_a = body.maxConcurrentSessions),
            (maxConcurrentSessions = _a === void 0 ? 3 : _a);
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            sessionSecurity.initializeSessionSecurity(authResult.user.id, sessionId, request, {
              maxConcurrentSessions: maxConcurrentSessions,
            }),
          ];
        case 3:
          result = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Session security initialized successfully",
              sessionId: sessionId,
              csrfToken: result.csrfToken,
              fingerprint: result.fingerprint,
              timeoutConfig: result.timeoutConfig,
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Session initialization error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to initialize session security" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/security/session
 * Validate session security and update activity
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, sessionId, userId, _a, activityType, securityCheck, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 1:
          body = _b.sent();
          (sessionId = body.sessionId),
            (userId = body.userId),
            (_a = body.activityType),
            (activityType = _a === void 0 ? "api_call" : _a);
          if (!sessionId || !userId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Session ID and User ID are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, sessionSecurity.performSecurityCheck(userId, sessionId, request)];
        case 2:
          securityCheck = _b.sent();
          if (!securityCheck.allowed) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "Session security validation failed",
                  reason: securityCheck.reason,
                  action: securityCheck.action,
                },
                { status: 403 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              valid: true,
              message: "Session security validated successfully",
              securityStatus: securityCheck,
            }),
          ];
        case 3:
          error_2 = _b.sent();
          console.error("Session validation error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to validate session security" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET /api/security/session
 * Get session security status and information
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, searchParams, sessionId, status_1, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.authenticated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          sessionId = searchParams.get("sessionId");
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            sessionSecurity.getSessionSecurityStatus(authResult.user.id, sessionId),
          ];
        case 2:
          status_1 = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              sessionId: sessionId,
              userId: authResult.user.id,
              securityStatus: status_1,
            }),
          ];
        case 3:
          error_3 = _a.sent();
          console.error("Session status error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Failed to get session security status" },
              { status: 500 },
            ),
          ];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/security/session
 * Terminate session and cleanup security data
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, searchParams, sessionId, terminateAll, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.authenticated) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          sessionId = searchParams.get("sessionId");
          terminateAll = searchParams.get("terminateAll") === "true";
          if (!sessionId && !terminateAll) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Session ID is required or set terminateAll=true" },
                { status: 400 },
              ),
            ];
          }
          if (!terminateAll) return [3 /*break*/, 3];
          // Terminate all sessions for the user
          return [4 /*yield*/, sessionSecurity.terminateAllUserSessions(authResult.user.id)];
        case 2:
          // Terminate all sessions for the user
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "All user sessions terminated successfully",
            }),
          ];
        case 3:
          // Terminate specific session
          return [4 /*yield*/, sessionSecurity.terminateSession(authResult.user.id, sessionId)];
        case 4:
          // Terminate specific session
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Session terminated successfully",
              sessionId: sessionId,
            }),
          ];
        case 5:
          return [3 /*break*/, 7];
        case 6:
          error_4 = _a.sent();
          console.error("Session termination error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Failed to terminate session" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
