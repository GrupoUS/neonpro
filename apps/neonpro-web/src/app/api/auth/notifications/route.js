"use strict";
// =====================================================
// Notifications API Routes
// Story 1.4: Session Management & Security
// =====================================================
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
var sendNotificationSchema = zod_1.z.object({
  type: zod_1.z.enum([
    "session_warning",
    "session_expired",
    "login_alert",
    "security_alert",
    "device_alert",
    "password_alert",
    "account_alert",
    "system_alert",
  ]),
  priority: zod_1.z.enum(["low", "medium", "high", "urgent"]),
  title: zod_1.z.string().min(1).max(200),
  message: zod_1.z.string().min(1).max(1000),
  channels: zod_1.z.array(zod_1.z.enum(["email", "sms", "push", "in_app"])).optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
  scheduledFor: zod_1.z.string().optional(),
});
var updatePreferencesSchema = zod_1.z.object({
  emailNotifications: zod_1.z.boolean().optional(),
  smsNotifications: zod_1.z.boolean().optional(),
  pushNotifications: zod_1.z.boolean().optional(),
  inAppNotifications: zod_1.z.boolean().optional(),
  quietHours: zod_1.z
    .object({
      enabled: zod_1.z.boolean(),
      start: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      end: zod_1.z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
      timezone: zod_1.z.string(),
    })
    .optional(),
  notificationTypes: zod_1.z.record(zod_1.z.boolean()).optional(),
});
var queryNotificationsSchema = zod_1.z.object({
  limit: zod_1.z.number().min(1).max(100).optional().default(50),
  offset: zod_1.z.number().min(0).optional().default(0),
  type: zod_1.z.string().optional(),
  priority: zod_1.z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: zod_1.z.enum(["pending", "sent", "delivered", "failed", "read"]).optional(),
  startDate: zod_1.z.string().optional(),
  endDate: zod_1.z.string().optional(),
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
    return __generator(this, function (_a) {
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
function getCurrentUser() {
  return __awaiter(this, void 0, void 0, function () {
    var supabase, _a, user, error;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _b.sent()), (user = _a.data.user), (error = _a.error);
          if (error || !user) {
            throw new Error("Unauthorized");
          }
          return [2 /*return*/, user];
      }
    });
  });
}
function parseDate(dateString) {
  if (!dateString) return undefined;
  var date = new Date(dateString);
  return isNaN(date.getTime()) ? undefined : date;
}
// =====================================================
// GET - Query Notifications
// =====================================================
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var user,
      sessionSystem,
      searchParams,
      action,
      preferences,
      stats,
      queryData,
      validation,
      _a,
      limit,
      offset,
      type,
      priority,
      status_1,
      startDate,
      endDate,
      filters,
      notifications,
      unreadCount,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 9, , 10]);
          return [4 /*yield*/, getCurrentUser()];
        case 1:
          user = _b.sent();
          return [4 /*yield*/, initializeSessionSystem()];
        case 2:
          sessionSystem = _b.sent();
          searchParams = new URL(request.url).searchParams;
          action = searchParams.get("action");
          if (!(action === "preferences")) return [3 /*break*/, 4];
          return [4 /*yield*/, sessionSystem.notificationService.getUserPreferences(user.id)];
        case 3:
          preferences = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              preferences: preferences,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          if (!(action === "statistics")) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            sessionSystem.notificationService.getNotificationStatistics(user.id),
          ];
        case 5:
          stats = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              statistics: stats,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          queryData = {
            limit: parseInt(searchParams.get("limit") || "50"),
            offset: parseInt(searchParams.get("offset") || "0"),
            type: searchParams.get("type") || undefined,
            priority: searchParams.get("priority"),
            status: searchParams.get("status"),
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
          };
          validation = queryNotificationsSchema.safeParse(queryData);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_a = validation.data),
            (limit = _a.limit),
            (offset = _a.offset),
            (type = _a.type),
            (priority = _a.priority),
            (status_1 = _a.status),
            (startDate = _a.startDate),
            (endDate = _a.endDate);
          filters = {
            userId: user.id,
          };
          if (type) filters.type = type;
          if (priority) filters.priority = priority;
          if (status_1) filters.status = status_1;
          return [
            4 /*yield*/,
            sessionSystem.notificationService.getUserNotifications(user.id, {
              limit: limit,
              offset: offset,
              filters: filters,
              startDate: parseDate(startDate),
              endDate: parseDate(endDate),
            }),
            // Get unread count
          ];
        case 7:
          notifications = _b.sent();
          return [4 /*yield*/, sessionSystem.notificationService.getUnreadCount(user.id)];
        case 8:
          unreadCount = _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              notifications: notifications,
              pagination: {
                limit: limit,
                offset: offset,
                total: notifications.length,
              },
              unreadCount: unreadCount,
              timestamp: new Date().toISOString(),
            }),
          ];
        case 9:
          error_1 = _b.sent();
          console.error("Notifications GET error:", error_1);
          if (error_1 instanceof Error && error_1.message === "Unauthorized") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// POST - Send Notification or Update Preferences
// =====================================================
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var user_1,
      sessionSystem_1,
      body,
      action,
      clientIP,
      userAgent,
      _a,
      validation,
      _b,
      type,
      priority,
      title,
      message,
      channels,
      metadata,
      scheduledFor,
      notification,
      notificationIds,
      results,
      successCount,
      markedCount,
      error_2;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 13, , 14]);
          return [4 /*yield*/, getCurrentUser()];
        case 1:
          user_1 = _c.sent();
          return [4 /*yield*/, initializeSessionSystem()];
        case 2:
          sessionSystem_1 = _c.sent();
          return [4 /*yield*/, request.json()];
        case 3:
          body = _c.sent();
          action = body.action;
          clientIP = getClientIP(request);
          userAgent = getUserAgent(request);
          _a = action;
          switch (_a) {
            case "send":
              return [3 /*break*/, 4];
            case "mark_read":
              return [3 /*break*/, 7];
            case "mark_all_read":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 11];
        case 4:
          validation = sendNotificationSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid notification data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          (_b = validation.data),
            (type = _b.type),
            (priority = _b.priority),
            (title = _b.title),
            (message = _b.message),
            (channels = _b.channels),
            (metadata = _b.metadata),
            (scheduledFor = _b.scheduledFor);
          return [
            4 /*yield*/,
            sessionSystem_1.notificationService.sendNotification({
              userId: user_1.id,
              type: type,
              priority: priority,
              title: title,
              message: message,
              channels: channels || ["in_app"],
              metadata: __assign(__assign({}, metadata), {
                sentViaAPI: true,
                senderIP: clientIP,
                senderUserAgent: userAgent,
              }),
              scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
            }),
            // Log security event
          ];
        case 5:
          notification = _c.sent();
          // Log security event
          return [
            4 /*yield*/,
            sessionSystem_1.securityEventLogger.logEvent({
              type: "notification_sent",
              severity: "low",
              description: "Notification sent: ".concat(title),
              userId: user_1.id,
              ipAddress: clientIP,
              userAgent: userAgent,
              metadata: {
                notificationId: notification.id,
                notificationType: type,
                priority: priority,
                channels: channels,
              },
            }),
          ];
        case 6:
          // Log security event
          _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              notification: notification,
              message: "Notification sent successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 7:
          notificationIds = body.notificationIds;
          if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid notification IDs" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            Promise.all(
              notificationIds.map(function (id) {
                return sessionSystem_1.notificationService.markAsRead(id, user_1.id);
              }),
            ),
          ];
        case 8:
          results = _c.sent();
          successCount = results.filter(Boolean).length;
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              markedCount: successCount,
              total: notificationIds.length,
              message: "".concat(successCount, " notifications marked as read"),
              timestamp: new Date().toISOString(),
            }),
          ];
        case 9:
          return [4 /*yield*/, sessionSystem_1.notificationService.markAllAsRead(user_1.id)];
        case 10:
          markedCount = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              markedCount: markedCount,
              message: "".concat(markedCount, " notifications marked as read"),
              timestamp: new Date().toISOString(),
            }),
          ];
        case 11:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 12:
          return [3 /*break*/, 14];
        case 13:
          error_2 = _c.sent();
          console.error("Notifications POST error:", error_2);
          if (error_2 instanceof Error && error_2.message === "Unauthorized") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 14:
          return [2 /*return*/];
      }
    });
  });
}
// =====================================================
// PUT - Update Notification Preferences
// =====================================================
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var user, sessionSystem, body, validation, preferences, success, error_3;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 6, , 7]);
          return [4 /*yield*/, getCurrentUser()];
        case 1:
          user = _a.sent();
          return [4 /*yield*/, initializeSessionSystem()];
        case 2:
          sessionSystem = _a.sent();
          return [4 /*yield*/, request.json()];
        case 3:
          body = _a.sent();
          validation = updatePreferencesSchema.safeParse(body);
          if (!validation.success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid preferences data", details: validation.error.errors },
                { status: 400 },
              ),
            ];
          }
          preferences = validation.data;
          return [
            4 /*yield*/,
            sessionSystem.notificationService.updateUserPreferences(user.id, preferences),
          ];
        case 4:
          success = _a.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to update preferences" },
                { status: 400 },
              ),
            ];
          }
          // Log security event
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "profile_updated",
              severity: "low",
              description: "Notification preferences updated",
              userId: user.id,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
              metadata: { updatedPreferences: preferences },
            }),
          ];
        case 5:
          // Log security event
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Preferences updated successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 6:
          error_3 = _a.sent();
          console.error("Notifications PUT error:", error_3);
          if (error_3 instanceof Error && error_3.message === "Unauthorized") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
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
// DELETE - Delete Notifications
// =====================================================
function DELETE(request) {
  return __awaiter(this, void 0, void 0, function () {
    var user,
      sessionSystem,
      searchParams,
      notificationId,
      clearAll,
      clearRead,
      olderThan,
      success,
      deletedCount,
      deletedCount,
      cutoffDate,
      deletedCount,
      error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 15, , 16]);
          return [4 /*yield*/, getCurrentUser()];
        case 1:
          user = _a.sent();
          return [4 /*yield*/, initializeSessionSystem()];
        case 2:
          sessionSystem = _a.sent();
          searchParams = new URL(request.url).searchParams;
          notificationId = searchParams.get("notificationId");
          clearAll = searchParams.get("clearAll") === "true";
          clearRead = searchParams.get("clearRead") === "true";
          olderThan = searchParams.get("olderThan");
          if (!notificationId) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            sessionSystem.notificationService.deleteNotification(notificationId, user.id),
          ];
        case 3:
          success = _a.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to delete notification or notification not found" },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Notification deleted successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 4:
          if (!clearAll) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            sessionSystem.notificationService.clearUserNotifications(user.id),
            // Log the cleanup
          ];
        case 5:
          deletedCount = _a.sent();
          // Log the cleanup
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "data_deletion",
              severity: "medium",
              description: "All notifications cleared: ".concat(
                deletedCount,
                " notifications deleted",
              ),
              userId: user.id,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
              metadata: { deletedCount: deletedCount, clearAll: true },
            }),
          ];
        case 6:
          // Log the cleanup
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              deletedCount: deletedCount,
              message: "All notifications cleared successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 7:
          if (!clearRead) return [3 /*break*/, 10];
          return [
            4 /*yield*/,
            sessionSystem.notificationService.clearReadNotifications(user.id),
            // Log the cleanup
          ];
        case 8:
          deletedCount = _a.sent();
          // Log the cleanup
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "data_deletion",
              severity: "low",
              description: "Read notifications cleared: ".concat(
                deletedCount,
                " notifications deleted",
              ),
              userId: user.id,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
              metadata: { deletedCount: deletedCount, clearRead: true },
            }),
          ];
        case 9:
          // Log the cleanup
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              deletedCount: deletedCount,
              message: "Read notifications cleared successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 10:
          if (!olderThan) return [3 /*break*/, 13];
          cutoffDate = parseDate(olderThan);
          if (!cutoffDate) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid date format" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            sessionSystem.notificationService.clearOldNotifications(user.id, cutoffDate),
            // Log the cleanup
          ];
        case 11:
          deletedCount = _a.sent();
          // Log the cleanup
          return [
            4 /*yield*/,
            sessionSystem.securityEventLogger.logEvent({
              type: "data_deletion",
              severity: "low",
              description: "Old notifications cleared: ".concat(
                deletedCount,
                " notifications deleted",
              ),
              userId: user.id,
              ipAddress: getClientIP(request),
              userAgent: getUserAgent(request),
              metadata: { deletedCount: deletedCount, cutoffDate: cutoffDate.toISOString() },
            }),
          ];
        case 12:
          // Log the cleanup
          _a.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              deletedCount: deletedCount,
              cutoffDate: cutoffDate.toISOString(),
              message: "Old notifications cleared successfully",
              timestamp: new Date().toISOString(),
            }),
          ];
        case 13:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid delete operation" }, { status: 400 }),
          ];
        case 14:
          return [3 /*break*/, 16];
        case 15:
          error_4 = _a.sent();
          console.error("Notifications DELETE error:", error_4);
          if (error_4 instanceof Error && error_4.message === "Unauthorized") {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
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
