/**
 * Data Cleanup API Route
 *
 * HTTP endpoint for triggering and managing data cleanup operations
 * in the NeonPro session management system.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
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
exports.cleanupService = void 0;
exports.POST = POST;
exports.GET = GET;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var DataCleanupService_1 = require("@/lib/auth/session/DataCleanupService");
var supabase_js_1 = require("@supabase/supabase-js");
var config_1 = require("@/lib/auth/session/config");
// Initialize cleanup service
var cleanupService = new DataCleanupService_1.DataCleanupService({
  enableScheduledCleanup: true,
  sessionRetentionDays: config_1.sessionConfig.cleanup.sessionRetentionDays,
  deviceRetentionDays: config_1.sessionConfig.cleanup.deviceRetentionDays,
  securityEventRetentionDays: config_1.sessionConfig.cleanup.securityEventRetentionDays,
  notificationRetentionDays: config_1.sessionConfig.cleanup.notificationRetentionDays,
  auditLogRetentionDays: config_1.sessionConfig.cleanup.auditLogRetentionDays,
  archiveCriticalEvents: true,
});
exports.cleanupService = cleanupService;
/**
 * POST /api/auth/cleanup
 * Trigger manual cleanup operations
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, body, tasks, _a, force, statusResult, result, error_1;
    var _b;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, undefined, 7]);
          return [4 /*yield*/, verifyCleanupPermissions(request)];
        case 1:
          authResult = _c.sent();
          if (!authResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: authResult.error,
                },
                { status: authResult.status },
              ),
            ];
          }
          return [4 /*yield*/, request.json().catch(() => ({}))];
        case 2:
          body = _c.sent();
          (tasks = body.tasks), (_a = body.force), (force = _a === void 0 ? false : _a);
          // Validate tasks if provided
          if (tasks && !Array.isArray(tasks)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: {
                    code: "INVALID_TASKS",
                    message: "Tasks must be an array",
                  },
                },
                { status: 400 },
              ),
            ];
          }
          if (force) return [3 /*break*/, 4];
          return [4 /*yield*/, cleanupService.getCleanupStatus()];
        case 3:
          statusResult = _c.sent();
          if (
            statusResult.success &&
            ((_b = statusResult.data) === null || _b === void 0 ? void 0 : _b.isRunning)
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: {
                    code: "CLEANUP_IN_PROGRESS",
                    message: "Cleanup is already in progress. Use force=true to override.",
                  },
                },
                { status: 409 },
              ),
            ];
          }
          _c.label = 4;
        case 4:
          return [4 /*yield*/, cleanupService.runCleanup(tasks)];
        case 5:
          result = _c.sent();
          if (result.success) {
            return [2 /*return*/, server_1.NextResponse.json(result, { status: 200 })];
          } else {
            return [2 /*return*/, server_1.NextResponse.json(result, { status: 500 })];
          }
          return [3 /*break*/, 7];
        case 6:
          error_1 = _c.sent();
          console.error("Cleanup API error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Internal server error during cleanup",
                },
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * GET /api/auth/cleanup
 * Get cleanup status and statistics
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, result, error_2;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, undefined, 4]);
          return [4 /*yield*/, verifyCleanupPermissions(request)];
        case 1:
          authResult = _a.sent();
          if (!authResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: authResult.error,
                },
                { status: authResult.status },
              ),
            ];
          }
          return [4 /*yield*/, cleanupService.getCleanupStatus()];
        case 2:
          result = _a.sent();
          if (result.success) {
            return [2 /*return*/, server_1.NextResponse.json(result, { status: 200 })];
          } else {
            return [2 /*return*/, server_1.NextResponse.json(result, { status: 500 })];
          }
          return [3 /*break*/, 4];
        case 3:
          error_2 = _a.sent();
          console.error("Cleanup status API error:", error_2);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Internal server error getting cleanup status",
                },
              },
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
 * DELETE /api/auth/cleanup
 * Stop all scheduled cleanup tasks
 */
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var authResult, error_3;
    return __generator(this, (_a) => {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, undefined, 3]);
          return [4 /*yield*/, verifyCleanupPermissions(request, true)];
        case 1:
          authResult = _a.sent();
          if (!authResult.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  success: false,
                  error: authResult.error,
                },
                { status: authResult.status },
              ),
            ];
          }
          cleanupService.stopScheduledTasks();
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                message: "All scheduled cleanup tasks stopped",
                timestamp: new Date().toISOString(),
              },
              { status: 200 },
            ),
          ];
        case 2:
          error_3 = _a.sent();
          console.error("Stop cleanup API error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: false,
                error: {
                  code: "INTERNAL_ERROR",
                  message: "Internal server error stopping cleanup tasks",
                },
              },
              { status: 500 },
            ),
          ];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Helper function to verify cleanup permissions
 */
function verifyCleanupPermissions(_request_1) {
  return __awaiter(this, arguments, void 0, function (request, requireAdmin) {
    var authorization, token, supabase, _a, user, error, _b, userProfile, profileError, error_4;
    if (requireAdmin === void 0) {
      requireAdmin = false;
    }
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 4, undefined, 5]);
          authorization = request.headers.get("authorization");
          if (!authorization || !authorization.startsWith("Bearer ")) {
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "UNAUTHORIZED",
                  message: "Missing or invalid authorization header",
                },
                status: 401,
              },
            ];
          }
          token = authorization.substring(7);
          supabase = (0, supabase_js_1.createClient)(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
          );
          return [4 /*yield*/, supabase.auth.getUser(token)];
        case 1:
          (_a = _c.sent()), (user = _a.data.user), (error = _a.error);
          if (error || !user) {
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "INVALID_TOKEN",
                  message: "Invalid or expired token",
                },
                status: 401,
              },
            ];
          }
          if (!requireAdmin) return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            supabase.from("user_profiles").select("role").eq("user_id", user.id).single(),
          ];
        case 2:
          (_b = _c.sent()), (userProfile = _b.data), (profileError = _b.error);
          if (profileError || !userProfile) {
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "USER_PROFILE_ERROR",
                  message: "Unable to verify user permissions",
                },
                status: 403,
              },
            ];
          }
          if (userProfile.role !== "admin" && userProfile.role !== "super_admin") {
            return [
              2 /*return*/,
              {
                success: false,
                error: {
                  code: "INSUFFICIENT_PERMISSIONS",
                  message: "Admin permissions required for this operation",
                },
                status: 403,
              },
            ];
          }
          _c.label = 3;
        case 3:
          return [
            2 /*return*/,
            {
              success: true,
              userId: user.id,
            },
          ];
        case 4:
          error_4 = _c.sent();
          console.error("Permission verification error:", error_4);
          return [
            2 /*return*/,
            {
              success: false,
              error: {
                code: "PERMISSION_CHECK_ERROR",
                message: "Error verifying permissions",
              },
              status: 500,
            },
          ];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Helper function to validate cleanup tasks
 */
function _validateCleanupTasks(tasks) {
  var validTasks = [
    "expired_sessions",
    "inactive_devices",
    "old_security_events",
    "old_notifications",
    "expired_device_verifications",
    "old_audit_logs",
  ];
  var invalidTasks = tasks.filter((task) => !validTasks.includes(task));
  return {
    valid: invalidTasks.length === 0,
    invalidTasks: invalidTasks.length > 0 ? invalidTasks : undefined,
  };
}
/**
 * Rate limiting helper
 */
var rateLimitMap = new Map();
function _checkRateLimit(identifier, maxRequests, windowMs) {
  if (maxRequests === void 0) {
    maxRequests = 10;
  }
  if (windowMs === void 0) {
    windowMs = 60000;
  }
  var now = Date.now();
  var userLimit = rateLimitMap.get(identifier);
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }
  if (userLimit.count >= maxRequests) {
    return false;
  }
  userLimit.count++;
  return true;
}
