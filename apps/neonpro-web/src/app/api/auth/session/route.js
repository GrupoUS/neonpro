// =====================================================
// Session Management API Routes
// Story 1.4: Session Management & Security
// =====================================================
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
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var session_1 = require("@/lib/auth/session");
var zod_1 = require("zod");
// =====================================================
// VALIDATION SCHEMAS
// =====================================================
var extendSessionSchema = zod_1.z.object({
  sessionId: zod_1.z.string().uuid(),
  extendBy: zod_1.z.number().min(1).max(120).optional(), // minutes
});
var validateSessionSchema = zod_1.z.object({
  sessionId: zod_1.z.string().uuid(),
});
var updateActivitySchema = zod_1.z.object({
  sessionId: zod_1.z.string().uuid(),
  activityType: zod_1.z.string(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function getClientIP(request) {
  var forwarded = request.headers.get("x-forwarded-for");
  var realIP = request.headers.get("x-real-ip");
  var cfConnectingIP = request.headers.get("cf-connecting-ip");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  return "127.0.0.1";
}
function getUserAgent(request) {
  return request.headers.get("user-agent") || "Unknown";
}
function initializeSessionSystem() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _a.sent();
          return [2 /*return*/, new session_1.UnifiedSessionSystem(supabase)];
      }
    });
  });
}
// =====================================================
// GET - Get Session Information
// =====================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionSystem,
      searchParams,
      sessionId,
      validation,
      session,
      _a,
      activities,
      securityScore,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, , 5]);
          return [4 /*yield*/, initializeSessionSystem()];
        case 1:
          sessionSystem = _b.sent();
          searchParams = new URL(request.url).searchParams;
          sessionId = searchParams.get("sessionId");
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          validation = validateSessionSchema.safeParse({ sessionId: sessionId });
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid session ID format" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, sessionSystem.sessionManager.getSession(sessionId)];
        case 2:
          session = _b.sent();
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all([
              sessionSystem.sessionManager.getSessionActivities(sessionId),
              sessionSystem.sessionManager.calculateSecurityScore(sessionId),
            ]),
          ];
        case 3:
          (_a = _b.sent()), (activities = _a[0]), (securityScore = _a[1]);
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              session: session,
              activities: activities.slice(0, 10), // Last 10 activities
              securityScore: securityScore,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          error_1 = _b.sent();
          console.error("Session GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// POST - Create or Extend Session
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionSystem,
      body,
      action,
      clientIP,
      userAgent,
      _a,
      validation,
      _b,
      sessionId,
      _c,
      extendBy,
      success,
      validation,
      sessionId,
      isValid,
      session,
      _d,
      validation,
      _e,
      sessionId,
      activityType,
      metadata,
      error_2;
    return __generator(this, (_f) => {
      switch (_f.label) {
        case 0:
          _f.trys.push([0, 15, , 16]);
          return [4 /*yield*/, initializeSessionSystem()];
        case 1:
          sessionSystem = _f.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _f.sent();
          action = body.action;
          clientIP = getClientIP(request);
          userAgent = getUserAgent(request);
          _a = action;
          switch (_a) {
            case "extend":
              return [3 /*break*/, 3];
            case "validate":
              return [3 /*break*/, 6];
            case "activity":
              return [3 /*break*/, 11];
          }
          return [3 /*break*/, 13];
        case 3:
          validation = extendSessionSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_b = validation.data),
            (sessionId = _b.sessionId),
            (_c = _b.extendBy),
            (extendBy = _c === void 0 ? 30 : _c);
          return [4 /*yield*/, sessionSystem.sessionManager.extendSession(sessionId, extendBy)];
        case 4:
          success = _f.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to extend session" }, { status: 400 }),
            ];
          }
          // Log security event
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "session_extended",
              severity: "low",
              description: "Session extended by ".concat(extendBy, " minutes"),
              sessionId: sessionId,
              ipAddress: clientIP,
              userAgent: userAgent,
              metadata: { extendBy: extendBy },
            }),
          ];
        case 5:
          // Log security event
          _f.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Session extended by ".concat(extendBy, " minutes"),
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          validation = validateSessionSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          sessionId = validation.data.sessionId;
          return [4 /*yield*/, sessionSystem.sessionManager.validateSession(sessionId)];
        case 7:
          isValid = _f.sent();
          if (!isValid) return [3 /*break*/, 9];
          return [4 /*yield*/, sessionSystem.sessionManager.getSession(sessionId)];
        case 8:
          _d = _f.sent();
          return [3 /*break*/, 10];
        case 9:
          _d = null;
          _f.label = 10;
        case 10:
          session = _d;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              valid: isValid,
              session: session,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 11:
          validation = updateActivitySchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_e = validation.data),
            (sessionId = _e.sessionId),
            (activityType = _e.activityType),
            (metadata = _e.metadata);
          // Record activity
          return [
            4 /*yield*/,
            sessionSystem.sessionManager.recordActivity(
              sessionId,
              activityType,
              __assign(__assign({}, metadata), { ipAddress: clientIP, userAgent: userAgent }),
            ),
          ];
        case 12:
          // Record activity
          _f.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Activity recorded",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 14:
          return [3 /*break*/, 16];
        case 15:
          error_2 = _f.sent();
          console.error("Session POST error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// PUT - Update Session
// =====================================================
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionSystem, body, sessionId, updates, session, success, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, initializeSessionSystem()];
        case 1:
          sessionSystem = _a.sent();
          return [4 /*yield*/, request.json()];
        case 2:
          body = _a.sent();
          (sessionId = body.sessionId), (updates = body.updates);
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, sessionSystem.sessionManager.getSession(sessionId)];
        case 3:
          session = _a.sent();
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, sessionSystem.sessionManager.updateSession(sessionId, updates)];
        case 4:
          success = _a.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update session" }, { status: 400 }),
            ];
          }
          // Log security event
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "session_updated",
              severity: "low",
              description: "Session information updated",
              sessionId: sessionId,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
              metadata: { updates: updates },
            }),
          ];
        case 5:
          // Log security event
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Session updated successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          error_3 = _a.sent();
          console.error("Session PUT error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// DELETE - Terminate Session
// =====================================================
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionSystem, searchParams, sessionId, validation, success, error_4;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [4 /*yield*/, initializeSessionSystem()];
        case 1:
          sessionSystem = _a.sent();
          searchParams = new URL(request.url).searchParams;
          sessionId = searchParams.get("sessionId");
          if (!sessionId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Session ID is required" }, { status: 400 }),
            ];
          }
          validation = validateSessionSchema.safeParse({ sessionId: sessionId });
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid session ID format" }, { status: 400 }),
            ];
          }
          return [4 /*yield*/, sessionSystem.sessionManager.terminateSession(sessionId)];
        case 2:
          success = _a.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to terminate session" }, { status: 400 }),
            ];
          }
          // Log security event
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "session_terminated",
              severity: "medium",
              description: "Session manually terminated",
              sessionId: sessionId,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
            }),
          ];
        case 3:
          // Log security event
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Session terminated successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          error_4 = _a.sent();
          console.error("Session DELETE error:", error_4);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
