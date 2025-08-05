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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var analytics_notification_service_1 = require("@/lib/services/analytics-notification-service");
var zod_1 = require("zod");
// Validation schemas
var NotificationQuerySchema = zod_1.z.object({
  limit: zod_1.z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 20)),
  offset: zod_1.z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val) : 0)),
  unreadOnly: zod_1.z
    .string()
    .optional()
    .transform((val) => val === "true"),
  types: zod_1.z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  clinicId: zod_1.z.string().optional(),
});
var MarkAsReadSchema = zod_1.z.object({
  notificationId: zod_1.z.string().uuid(),
  userId: zod_1.z.string().uuid(),
});
var CustomNotificationSchema = zod_1.z.object({
  type: zod_1.z.enum([
    "trial_started",
    "trial_ending",
    "trial_expired",
    "trial_converted",
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "payment_successful",
    "payment_failed",
    "analytics_milestone",
    "system_alert",
    "campaign_update",
    "revenue_milestone",
    "user_milestone",
    "conversion_alert",
    "churn_alert",
  ]),
  userId: zod_1.z.string().uuid(),
  variables: zod_1.z.record(zod_1.z.any()).optional(),
  priority: zod_1.z.enum(["low", "medium", "high", "urgent"]).optional(),
  channels: zod_1.z.array(zod_1.z.enum(["database", "websocket", "email", "push"])).optional(),
  scheduledFor: zod_1.z.string().datetime().optional(),
  expiresAt: zod_1.z.string().datetime().optional(),
  clinicId: zod_1.z.string().uuid().optional(),
  metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * GET /api/notifications
 * Retrieve user notifications with filtering options
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      url,
      queryParams,
      validatedQuery_1,
      _b,
      userClinics,
      clinicsError,
      hasAccess,
      notifications,
      unreadCount,
      error_1;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 6, , 7]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Get current user
          ];
        case 1:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _c.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          url = new URL(request.url);
          queryParams = Object.fromEntries(url.searchParams.entries());
          validatedQuery_1 = NotificationQuerySchema.parse(queryParams);
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id, role")
              .eq("user_id", user.id)
              .eq("status", "active"),
          ];
        case 3:
          (_b = _c.sent()), (userClinics = _b.data), (clinicsError = _b.error);
          if (clinicsError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch user clinics" },
                { status: 500 },
              ),
            ];
          }
          // If clinicId is specified, verify user has access
          if (validatedQuery_1.clinicId) {
            hasAccess =
              userClinics === null || userClinics === void 0
                ? void 0
                : userClinics.some((uc) => uc.clinic_id === validatedQuery_1.clinicId);
            if (!hasAccess) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Access denied to specified clinic" },
                  { status: 403 },
                ),
              ];
            }
          }
          return [
            4 /*yield*/,
            analytics_notification_service_1.AnalyticsNotificationService.getUserNotifications(
              user.id,
              {
                limit: validatedQuery_1.limit,
                offset: validatedQuery_1.offset,
                unreadOnly: validatedQuery_1.unreadOnly,
                types: validatedQuery_1.types,
                clinicId: validatedQuery_1.clinicId,
              },
            ),
          ];
        case 4:
          notifications = _c.sent();
          if (!notifications) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to fetch notifications" },
                { status: 500 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            analytics_notification_service_1.AnalyticsNotificationService.getUnreadCount(
              user.id,
              validatedQuery_1.clinicId,
            ),
          ];
        case 5:
          unreadCount = _c.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              notifications: notifications,
              unreadCount: unreadCount,
              pagination: {
                limit: validatedQuery_1.limit,
                offset: validatedQuery_1.offset,
                hasMore: notifications.length === validatedQuery_1.limit,
              },
            }),
          ];
        case 6:
          error_1 = _c.sent();
          console.error("GET /api/notifications error:", error_1);
          if (error_1 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid query parameters", details: error_1.errors },
                { status: 400 },
              ),
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
/**
 * POST /api/notifications
 * Send a custom notification or mark notifications as read
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      _b,
      validatedData,
      success,
      _c,
      userClinics,
      clinicsError,
      isAdmin,
      validatedData_1,
      hasAccess,
      notificationId,
      error_2;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 11, , 12]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Get current user
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          action = body.action;
          _b = action;
          switch (_b) {
            case "markAsRead":
              return [3 /*break*/, 4];
            case "sendCustom":
              return [3 /*break*/, 6];
          }
          return [3 /*break*/, 9];
        case 4:
          validatedData = MarkAsReadSchema.parse(body);
          // Verify user can mark this notification as read
          if (validatedData.userId !== user.id) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Can only mark your own notifications as read" },
                { status: 403 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            analytics_notification_service_1.AnalyticsNotificationService.markAsRead(
              validatedData.notificationId,
              validatedData.userId,
            ),
          ];
        case 5:
          success = _d.sent();
          if (!success) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to mark notification as read" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 6:
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id, role")
              .eq("user_id", user.id)
              .eq("status", "active"),
          ];
        case 7:
          (_c = _d.sent()), (userClinics = _c.data), (clinicsError = _c.error);
          if (clinicsError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to verify permissions" },
                { status: 500 },
              ),
            ];
          }
          isAdmin =
            userClinics === null || userClinics === void 0
              ? void 0
              : userClinics.some((uc) => ["admin", "owner", "manager"].includes(uc.role));
          if (!isAdmin) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Insufficient permissions to send custom notifications" },
                { status: 403 },
              ),
            ];
          }
          validatedData_1 = CustomNotificationSchema.parse(body);
          // If clinicId is specified, verify admin has access
          if (validatedData_1.clinicId) {
            hasAccess =
              userClinics === null || userClinics === void 0
                ? void 0
                : userClinics.some(
                    (uc) =>
                      uc.clinic_id === validatedData_1.clinicId &&
                      ["admin", "owner", "manager"].includes(uc.role),
                  );
            if (!hasAccess) {
              return [
                2 /*return*/,
                server_1.NextResponse.json(
                  { error: "Access denied to specified clinic" },
                  { status: 403 },
                ),
              ];
            }
          }
          return [
            4 /*yield*/,
            analytics_notification_service_1.AnalyticsNotificationService.sendNotification(
              validatedData_1.type,
              validatedData_1.userId,
              validatedData_1.variables || {},
              {
                priority: validatedData_1.priority,
                channels: validatedData_1.channels,
                scheduledFor: validatedData_1.scheduledFor
                  ? new Date(validatedData_1.scheduledFor)
                  : undefined,
                expiresAt: validatedData_1.expiresAt
                  ? new Date(validatedData_1.expiresAt)
                  : undefined,
                clinicId: validatedData_1.clinicId,
                metadata: validatedData_1.metadata,
              },
            ),
          ];
        case 8:
          notificationId = _d.sent();
          if (!notificationId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to send notification" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              notificationId: notificationId,
            }),
          ];
        case 9:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_2 = _d.sent();
          console.error("POST /api/notifications error:", error_2);
          if (error_2 instanceof zod_1.z.ZodError) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Invalid request data", details: error_2.errors },
                { status: 400 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * PUT /api/notifications
 * Bulk operations on notifications
 */
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      authError,
      body,
      action,
      notificationIds,
      clinicId,
      _b,
      userClinics,
      clinicsError,
      _c,
      query,
      error,
      error,
      error_3;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 12, , 13]);
          return [
            4 /*yield*/,
            (0, server_2.createClient)(),
            // Get current user
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (authError = _a.error);
          if (authError || !user) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _d.sent();
          (action = body.action),
            (notificationIds = body.notificationIds),
            (clinicId = body.clinicId);
          // Validate input
          if (!action || !Array.isArray(notificationIds)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid request format" }, { status: 400 }),
            ];
          }
          if (!clinicId) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("user_clinics")
              .select("clinic_id, role")
              .eq("user_id", user.id)
              .eq("status", "active")
              .eq("clinic_id", clinicId),
          ];
        case 4:
          (_b = _d.sent()), (userClinics = _b.data), (clinicsError = _b.error);
          if (clinicsError || !userClinics || userClinics.length === 0) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Access denied to specified clinic" },
                { status: 403 },
              ),
            ];
          }
          _d.label = 5;
        case 5:
          _c = action;
          switch (_c) {
            case "markAllAsRead":
              return [3 /*break*/, 6];
            case "delete":
              return [3 /*break*/, 8];
          }
          return [3 /*break*/, 10];
        case 6:
          query = supabase
            .from("analytics_notifications")
            .update({
              read_at: new Date().toISOString(),
              status: "read",
            })
            .eq("user_id", user.id)
            .is("read_at", null);
          if (clinicId) {
            query = query.eq("clinic_id", clinicId);
          }
          if (notificationIds.length > 0) {
            query = query.in("id", notificationIds);
          }
          return [4 /*yield*/, query];
        case 7:
          error = _d.sent().error;
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to mark notifications as read" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 8:
          return [
            4 /*yield*/,
            supabase
              .from("analytics_notifications")
              .delete()
              .eq("user_id", user.id)
              .in("id", notificationIds),
          ];
        case 9:
          error = _d.sent().error;
          if (error) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to delete notifications" },
                { status: 500 },
              ),
            ];
          }
          return [2 /*return*/, server_1.NextResponse.json({ success: true })];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          error_3 = _d.sent();
          console.error("PUT /api/notifications error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 13:
          return [2 /*return*/];
      }
    });
  });
}
