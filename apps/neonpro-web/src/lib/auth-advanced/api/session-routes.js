// Session API Routes
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
exports.SessionRoutes = void 0;
exports.createSessionRoutes = createSessionRoutes;
var server_1 = require("next/server");
var utils_1 = require("../utils");
/**
 * Session API route handlers
 */
var SessionRoutes = /** @class */ (() => {
  function SessionRoutes(sessionManager, securityMonitor, deviceManager) {
    this.sessionManager = sessionManager;
    this.securityMonitor = securityMonitor;
    this.deviceManager = deviceManager;
  }
  /**
   * Create new session
   * POST /api/auth/session
   */
  SessionRoutes.prototype.createSession = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body,
        userId,
        userRole,
        deviceInfo,
        location_1,
        clientIP,
        userAgent,
        deviceId,
        sessionData,
        error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            (userId = body.userId),
              (userRole = body.userRole),
              (deviceInfo = body.deviceInfo),
              (location_1 = body.location);
            // Validate required fields
            if (!userId || !userRole) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Missing required fields: userId, userRole" },
                  { status: 400 },
                ),
              ];
            }
            // Validate user role
            if (!utils_1.ValidationUtils.isValidRole(userRole)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid user role" }, { status: 400 }),
              ];
            }
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            deviceId = void 0;
            if (!deviceInfo) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              this.deviceManager.registerDevice(
                __assign(__assign({}, deviceInfo), {
                  userId: userId,
                  ipAddress: clientIP,
                  userAgent: userAgent,
                }),
              ),
            ];
          case 2:
            deviceId = _a.sent();
            _a.label = 3;
          case 3:
            return [
              4 /*yield*/,
              this.sessionManager.createSession({
                userId: userId,
                userRole: userRole,
                deviceId: deviceId,
                ipAddress: clientIP,
                userAgent: userAgent,
                location: location_1,
              }),
            ];
          case 4:
            sessionData = _a.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "session_created",
                userId: userId,
                sessionId: sessionData.sessionId,
                severity: "info",
                details: {
                  deviceId: deviceId,
                  ipAddress: clientIP,
                  userAgent: userAgent,
                  location: location_1,
                },
                timestamp: new Date(),
                ipAddress: clientIP,
                userAgent: userAgent,
              }),
            ];
          case 5:
            // Log security event
            _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                session: sessionData,
                deviceId: deviceId,
              }),
            ];
          case 6:
            error_1 = _a.sent();
            console.error("Create session error:", error_1);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create session" }, { status: 500 }),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session info
   * GET /api/auth/session/:sessionId
   */
  SessionRoutes.prototype.getSession = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var session, authHeader, token, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Session not found" }, { status: 404 }),
              ];
            }
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            token = authHeader.substring(7);
            if (token !== sessionId) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 }),
              ];
            }
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                session: session,
              }),
            ];
          case 2:
            error_2 = _a.sent();
            console.error("Get session error:", error_2);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to get session" }, { status: 500 }),
            ];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Update session activity
   * PUT /api/auth/session/:sessionId/activity
   */
  SessionRoutes.prototype.updateActivity = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, activity, clientIP, userAgent, success, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            activity = body.activity;
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            return [
              4 /*yield*/,
              this.sessionManager.updateActivity(sessionId, activity, {
                ipAddress: clientIP,
                userAgent: userAgent,
                timestamp: new Date(),
              }),
            ];
          case 2:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Failed to update activity" }, { status: 400 }),
              ];
            }
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Activity updated successfully",
              }),
            ];
          case 3:
            error_3 = _a.sent();
            console.error("Update activity error:", error_3);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update activity" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Extend session
   * PUT /api/auth/session/:sessionId/extend
   */
  SessionRoutes.prototype.extendSession = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, duration, success, session, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            duration = body.duration;
            return [4 /*yield*/, this.sessionManager.extendSession(sessionId, duration)];
          case 2:
            success = _a.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Failed to extend session" }, { status: 400 }),
              ];
            }
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 3:
            session = _a.sent();
            if (!session) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "session_extended",
                userId: session.userId,
                sessionId: sessionId,
                severity: "info",
                details: { duration: duration },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 4:
            _a.sent();
            _a.label = 5;
          case 5:
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Session extended successfully",
              }),
            ];
          case 6:
            error_4 = _a.sent();
            console.error("Extend session error:", error_4);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to extend session" }, { status: 500 }),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate session
   * DELETE /api/auth/session/:sessionId
   */
  SessionRoutes.prototype.terminateSession = function (request, sessionId) {
    return __awaiter(this, void 0, void 0, function () {
      var body, _a, reason, session, success, error_5;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 6, , 7]);
            return [4 /*yield*/, request.json().catch(() => ({}))];
          case 1:
            body = _b.sent();
            (_a = body.reason), (reason = _a === void 0 ? "user_logout" : _a);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 2:
            session = _b.sent();
            return [4 /*yield*/, this.sessionManager.terminateSession(sessionId, reason)];
          case 3:
            success = _b.sent();
            if (!success) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Failed to terminate session" },
                  { status: 400 },
                ),
              ];
            }
            if (!session) return [3 /*break*/, 5];
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "session_terminated",
                userId: session.userId,
                sessionId: sessionId,
                severity: "info",
                details: { reason: reason },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 4:
            _b.sent();
            _b.label = 5;
          case 5:
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "Session terminated successfully",
              }),
            ];
          case 6:
            error_5 = _b.sent();
            console.error("Terminate session error:", error_5);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to terminate session" }, { status: 500 }),
            ];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get user sessions
   * GET /api/auth/sessions/user/:userId
   */
  SessionRoutes.prototype.getUserSessions = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, sessions, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAuthorization(request, userId)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.sessionManager.getUserSessions(userId)];
          case 2:
            sessions = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                sessions: sessions,
                count: sessions.length,
              }),
            ];
          case 3:
            error_6 = _a.sent();
            console.error("Get user sessions error:", error_6);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to get user sessions" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Terminate all user sessions
   * DELETE /api/auth/sessions/user/:userId
   */
  SessionRoutes.prototype.terminateUserSessions = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, body, _a, reason, excludeSessionId, terminatedCount, error_7;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 5, , 6]);
            return [4 /*yield*/, this.verifyAuthorization(request, userId)];
          case 1:
            authResult = _b.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, request.json().catch(() => ({}))];
          case 2:
            body = _b.sent();
            (_a = body.reason),
              (reason = _a === void 0 ? "admin_action" : _a),
              (excludeSessionId = body.excludeSessionId);
            return [
              4 /*yield*/,
              this.sessionManager.terminateUserSessions(userId, reason, excludeSessionId),
            ];
          case 3:
            terminatedCount = _b.sent();
            // Log security event
            return [
              4 /*yield*/,
              this.securityMonitor.logSecurityEvent({
                type: "user_sessions_terminated",
                userId: userId,
                severity: "warning",
                details: {
                  reason: reason,
                  terminatedCount: terminatedCount,
                  excludeSessionId: excludeSessionId,
                },
                timestamp: new Date(),
                ipAddress: this.getClientIP(request),
                userAgent: request.headers.get("user-agent") || "unknown",
              }),
            ];
          case 4:
            // Log security event
            _b.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "".concat(terminatedCount, " sessions terminated"),
                terminatedCount: terminatedCount,
              }),
            ];
          case 5:
            error_7 = _b.sent();
            console.error("Terminate user sessions error:", error_7);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to terminate user sessions" },
                { status: 500 },
              ),
            ];
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate session
   * POST /api/auth/session/validate
   */
  SessionRoutes.prototype.validateSession = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var body, sessionId, clientIP, userAgent, isValid, session, error_8;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, request.json()];
          case 1:
            body = _a.sent();
            sessionId = body.sessionId;
            if (!sessionId) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Session ID required" }, { status: 400 }),
              ];
            }
            clientIP = this.getClientIP(request);
            userAgent = request.headers.get("user-agent") || "unknown";
            return [
              4 /*yield*/,
              this.sessionManager.validateSession(sessionId, {
                ipAddress: clientIP,
                userAgent: userAgent,
              }),
            ];
          case 2:
            isValid = _a.sent();
            if (!isValid) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Invalid session" }, { status: 401 }),
              ];
            }
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 3:
            session = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                valid: true,
                session: session,
              }),
            ];
          case 4:
            error_8 = _a.sent();
            console.error("Validate session error:", error_8);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to validate session" }, { status: 500 }),
            ];
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get session metrics
   * GET /api/auth/sessions/metrics
   */
  SessionRoutes.prototype.getSessionMetrics = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, url, startDate, endDate, userId, metrics, error_9;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            url = new URL(request.url);
            startDate = url.searchParams.get("startDate");
            endDate = url.searchParams.get("endDate");
            userId = url.searchParams.get("userId");
            return [
              4 /*yield*/,
              this.sessionManager.getSessionMetrics({
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                userId: userId || undefined,
              }),
            ];
          case 2:
            metrics = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                metrics: metrics,
              }),
            ];
          case 3:
            error_9 = _a.sent();
            console.error("Get session metrics error:", error_9);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to get session metrics" },
                { status: 500 },
              ),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Cleanup expired sessions
   * POST /api/auth/sessions/cleanup
   */
  SessionRoutes.prototype.cleanupSessions = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authResult, cleanedCount, error_10;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.verifyAdminAuthorization(request)];
          case 1:
            authResult = _a.sent();
            if (authResult) return [2 /*return*/, authResult];
            return [4 /*yield*/, this.sessionManager.cleanupExpiredSessions()];
          case 2:
            cleanedCount = _a.sent();
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                success: true,
                message: "".concat(cleanedCount, " expired sessions cleaned up"),
                cleanedCount: cleanedCount,
              }),
            ];
          case 3:
            error_10 = _a.sent();
            console.error("Cleanup sessions error:", error_10);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to cleanup sessions" }, { status: 500 }),
            ];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  // Helper methods
  SessionRoutes.prototype.getClientIP = (request) => {
    var forwarded = request.headers.get("x-forwarded-for");
    var realIP = request.headers.get("x-real-ip");
    if (forwarded) {
      return forwarded.split(",")[0].trim();
    }
    return realIP || "unknown";
  };
  SessionRoutes.prototype.verifyAuthorization = function (request, userId) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || session.userId !== userId) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Forbidden" }, { status: 403 }),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  SessionRoutes.prototype.verifyAdminAuthorization = function (request) {
    return __awaiter(this, void 0, void 0, function () {
      var authHeader, sessionId, session;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            authHeader = request.headers.get("authorization");
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
              return [
                2 /*return*/,
                server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
              ];
            }
            sessionId = authHeader.substring(7);
            return [4 /*yield*/, this.sessionManager.getSession(sessionId)];
          case 1:
            session = _a.sent();
            if (!session || !["owner", "manager"].includes(session.userRole)) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Forbidden - Admin access required" },
                  { status: 403 },
                ),
              ];
            }
            return [2 /*return*/, null];
        }
      });
    });
  };
  return SessionRoutes;
})();
exports.SessionRoutes = SessionRoutes;
/**
 * Create session routes handler
 */
function createSessionRoutes(sessionManager, securityMonitor, deviceManager) {
  return new SessionRoutes(sessionManager, securityMonitor, deviceManager);
}
