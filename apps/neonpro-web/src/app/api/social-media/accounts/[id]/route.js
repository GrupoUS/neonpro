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
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var zod_1 = require("zod");
/**
 * Individual Social Media Account API Route
 *
 * Handles operations for specific social media accounts:
 * - GET: Retrieve account details
 * - PUT: Update account settings
 * - DELETE: Disconnect account
 * - POST: Refresh/sync account data
 */
var updateAccountSchema = zod_1.z.object({
  account_name: zod_1.z.string().min(1).max(255).optional(),
  account_handle: zod_1.z.string().max(255).optional(),
  sync_settings: zod_1.z.record(zod_1.z.any()).optional(),
  sync_status: zod_1.z.enum(["active", "error", "paused", "disconnected"]).optional(),
  status: zod_1.z.enum(["active", "inactive", "suspended", "deleted"]).optional(),
});
/**
 * GET /api/social-media/accounts/[id]
 *
 * Retrieves specific social media account details
 */
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, supabase, session, profile, _c, account, error, accountWithTokenStatus, error_1;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 6, , 7]);
          return [4 /*yield*/, params];
        case 1:
          id = _d.sent().id;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select(
                "\n        id,\n        platform_name,\n        account_name,\n        account_handle,\n        account_id,\n        account_metadata,\n        sync_settings,\n        last_sync_at,\n        sync_status,\n        sync_error_message,\n        status,\n        token_expires_at,\n        created_at,\n        updated_at,\n        social_media_platforms!inner(\n          platform_display_name,\n          platform_icon_url,\n          supported_features,\n          oauth_config\n        )\n      ",
              )
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 5:
          (_c = _d.sent()), (account = _c.data), (error = _c.error);
          if (error || !account) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account not found" }, { status: 404 }),
            ];
          }
          accountWithTokenStatus = __assign(__assign({}, account), {
            has_access_token: !!account.access_token,
            has_refresh_token: !!account.refresh_token,
            token_valid: account.token_expires_at
              ? new Date(account.token_expires_at) > new Date()
              : null,
            access_token: undefined,
            refresh_token: undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: accountWithTokenStatus,
            }),
          ];
        case 6:
          error_1 = _d.sent();
          console.error("Social media account GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
} /**
 * PUT /api/social-media/accounts/[id]
 *
 * Updates social media account settings
 */
function PUT(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id,
      supabase,
      session,
      profile,
      existingAccount,
      body,
      validatedData,
      _c,
      updatedAccount,
      error,
      error_2;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 8, , 9]);
          return [4 /*yield*/, params];
        case 1:
          id = _d.sent().id;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("id")
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 5:
          existingAccount = _d.sent().data;
          if (!existingAccount) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account not found" }, { status: 404 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 6:
          body = _d.sent();
          validatedData = updateAccountSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .update(
                __assign(__assign({}, validatedData), { updated_at: new Date().toISOString() }),
              )
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id)
              .select(
                "\n        id,\n        platform_name,\n        account_name,\n        account_handle,\n        account_id,\n        account_metadata,\n        sync_settings,\n        sync_status,\n        status,\n        updated_at\n      ",
              )
              .single(),
          ];
        case 7:
          (_c = _d.sent()), (updatedAccount = _c.data), (error = _c.error);
          if (error) {
            console.error("Error updating social media account:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to update account" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: updatedAccount,
              message: "Account updated successfully",
            }),
          ];
        case 8:
          error_2 = _d.sent();
          console.error("Social media account PUT error:", error_2);
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
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * DELETE /api/social-media/accounts/[id]
 *
 * Disconnects/deletes social media account
 */
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, supabase, session, profile, existingAccount, dependentPosts, error, error, error_3;
    var params = _b.params;
    return __generator(this, (_c) => {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 11, , 12]);
          return [4 /*yield*/, params];
        case 1:
          id = _c.sent().id;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _c.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _c.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          // Check if user has permission to delete (admin/owner/manager)
          if (!["admin", "owner", "manager"].includes(profile.role)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Insufficient permissions" }, { status: 403 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("id, platform_name, account_name")
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 5:
          existingAccount = _c.sent().data;
          if (!existingAccount) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account not found" }, { status: 404 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("social_media_posts").select("id").eq("account_id", id).limit(1),
          ];
        case 6:
          dependentPosts = _c.sent().data;
          if (!(dependentPosts && dependentPosts.length > 0)) return [3 /*break*/, 8];
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .update({
                status: "deleted",
                sync_status: "disconnected",
                updated_at: new Date().toISOString(),
              })
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id),
          ];
        case 7:
          error = _c.sent().error;
          if (error) {
            console.error("Error soft deleting social media account:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to disconnect account" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Account disconnected successfully (data preserved)",
            }),
          ];
        case 8:
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .delete()
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id),
          ];
        case 9:
          error = _c.sent().error;
          if (error) {
            console.error("Error deleting social media account:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to delete account" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Account deleted successfully",
            }),
          ];
        case 10:
          return [3 /*break*/, 12];
        case 11:
          error_3 = _c.sent();
          console.error("Social media account DELETE error:", error_3);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
} /**
 * POST /api/social-media/accounts/[id]
 *
 * Triggers account sync/refresh operations
 */
function POST(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var id, supabase, session, profile, body, action, account, _c, syncError, error_4;
    var params = _b.params;
    return __generator(this, (_d) => {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 12, , 13]);
          return [4 /*yield*/, params];
        case 1:
          id = _d.sent().id;
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          session = _d.sent().data.session;
          if (!session) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id, role").eq("id", session.user.id).single(),
          ];
        case 4:
          profile = _d.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 5:
          body = _d.sent();
          action = body.action;
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("*")
              .eq("id", id)
              .eq("clinic_id", profile.clinic_id)
              .single(),
          ];
        case 6:
          account = _d.sent().data;
          if (!account) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account not found" }, { status: 404 }),
            ];
          }
          _c = action;
          switch (_c) {
            case "sync":
              return [3 /*break*/, 7];
            case "test_connection":
              return [3 /*break*/, 9];
          }
          return [3 /*break*/, 10];
        case 7:
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .update({
                last_sync_at: new Date().toISOString(),
                sync_status: "active",
                sync_error_message: null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", id),
          ];
        case 8:
          syncError = _d.sent().error;
          if (syncError) {
            throw syncError;
          }
          // TODO: Implement actual platform sync logic
          // This would integrate with platform APIs to fetch latest data
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Account sync initiated successfully",
            }),
          ];
        case 9:
          // TODO: Implement connection test logic
          // This would verify tokens and API connectivity
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Connection test completed",
              data: {
                connection_status: "active",
                last_tested: new Date().toISOString(),
              },
            }),
          ];
        case 10:
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Invalid action" }, { status: 400 }),
          ];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          error_4 = _d.sent();
          console.error("Social media account POST error:", error_4);
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
