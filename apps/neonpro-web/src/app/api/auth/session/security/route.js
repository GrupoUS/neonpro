/**
 * Security Events API Route
 * Manages security events and monitoring
 */
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
          step(generator.throw(value));
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
      (g.throw = verb(1)),
      (g.return = verb(2)),
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
                  ? y.return
                  : op[0]
                    ? y.throw || ((t = y.return) && t.call(y), 0)
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var server_2 = require("@/lib/supabase/server");
// Initialize session manager
var sessionManager = null;
function getSessionManager() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          if (sessionManager) return [3 /*break*/, 2];
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
// Get security events
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      userId,
      sessionId,
      eventType,
      severity,
      limit,
      offset,
      startDate,
      endDate,
      manager,
      filters,
      events,
      totalCount,
      error_1;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, undefined, 5]);
          searchParams = new URL(request.url).searchParams;
          userId = searchParams.get("userId");
          sessionId = searchParams.get("sessionId");
          eventType = searchParams.get("eventType");
          severity = searchParams.get("severity");
          limit = parseInt(searchParams.get("limit") || "50");
          offset = parseInt(searchParams.get("offset") || "0");
          startDate = searchParams.get("startDate");
          endDate = searchParams.get("endDate");
          return [4 /*yield*/, getSessionManager()];
        case 1:
          manager = _a.sent();
          filters = {};
          if (userId) filters.user_id = userId;
          if (sessionId) filters.session_id = sessionId;
          if (eventType) filters.event_type = eventType;
          if (severity) filters.severity = severity;
          if (startDate) filters.start_date = startDate;
          if (endDate) filters.end_date = endDate;
          return [4 /*yield*/, manager.getSecurityEvents(filters, limit, offset)];
        case 2:
          events = _a.sent();
          return [4 /*yield*/, manager.getSecurityEventsCount(filters)];
        case 3:
          totalCount = _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              events: events,
              pagination: {
                total: totalCount,
                limit: limit,
                offset: offset,
                hasMore: offset + limit < totalCount,
              },
            }),
          ];
        case 4:
          error_1 = _a.sent();
          console.error("Get security events error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error while fetching security events" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// Create security event
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var _a,
      sessionId,
      eventType,
      severity,
      description,
      metadata,
      manager,
      clientIP,
      userAgent,
      event_1,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 4, undefined, 5]);
          return [4 /*yield*/, request.json()];
        case 1:
          (_a = _b.sent()),
            (sessionId = _a.sessionId),
            (eventType = _a.eventType),
            (severity = _a.severity),
            (description = _a.description),
            (metadata = _a.metadata);
          if (!sessionId || !eventType || !severity || !description) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Session ID, event type, severity, and description are required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, getSessionManager()];
        case 2:
          manager = _b.sent();
          clientIP =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "127.0.0.1";
          userAgent = request.headers.get("user-agent") || "Unknown";
          return [
            4 /*yield*/,
            manager.logSecurityEvent({
              session_id: sessionId,
              event_type: eventType,
              severity: severity,
              description: description,
              ip_address: clientIP,
              user_agent: userAgent,
              metadata: metadata || {},
            }),
          ];
        case 3:
          event_1 = _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ event: event_1 })];
        case 4:
          error_2 = _b.sent();
          console.error("Create security event error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              { error: "Internal server error during security event creation" },
              { status: 500 },
            ),
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
function OPTIONS(_request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      new server_1.NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }),
    ]);
  });
}
