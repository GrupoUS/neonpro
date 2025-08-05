"use strict";
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
/**
 * Social Media Accounts API Route
 *
 * Handles CRUD operations for social media account connections
 * Manages OAuth tokens, sync status, and account metadata
 *
 * Research-backed implementation following:
 * - Instagram Basic Display API authentication
 * - Facebook Pages API connection patterns
 * - WhatsApp Business API account management
 * - Secure token storage best practices
 */
// Validation schemas
var createAccountSchema = zod_1.z.object({
  platform_name: zod_1.z.string().min(1),
  account_name: zod_1.z.string().min(1).max(255),
  account_handle: zod_1.z.string().max(255).optional(),
  account_id: zod_1.z.string().max(255).optional(),
  access_token: zod_1.z.string().optional(), // Will be encrypted
  refresh_token: zod_1.z.string().optional(), // Will be encrypted
  token_expires_at: zod_1.z.string().datetime().optional(),
  account_metadata: zod_1.z.record(zod_1.z.any()).default({}),
  sync_settings: zod_1.z.record(zod_1.z.any()).default({}),
});
var updateAccountSchema = zod_1.z.object({
  account_name: zod_1.z.string().min(1).max(255).optional(),
  account_handle: zod_1.z.string().max(255).optional(),
  sync_settings: zod_1.z.record(zod_1.z.any()).optional(),
  sync_status: zod_1.z.enum(["active", "error", "paused", "disconnected"]).optional(),
  status: zod_1.z.enum(["active", "inactive", "suspended", "deleted"]).optional(),
});
/**
 * GET /api/social-media/accounts
 *
 * Retrieves all social media accounts for the user's clinic
 * Supports filtering by platform and status
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      searchParams,
      platform,
      status_1,
      syncStatus,
      query,
      _a,
      accounts,
      error,
      sanitizedAccounts,
      error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
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
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          searchParams = new URL(request.url).searchParams;
          platform = searchParams.get("platform");
          status_1 = searchParams.get("status");
          syncStatus = searchParams.get("sync_status");
          query = supabase
            .from("social_media_accounts")
            .select(
              "\n        id,\n        platform_name,\n        account_name,\n        account_handle,\n        account_id,\n        account_metadata,\n        sync_settings,\n        last_sync_at,\n        sync_status,\n        sync_error_message,\n        status,\n        created_at,\n        updated_at,\n        created_by,\n        social_media_platforms!inner(\n          platform_display_name,\n          platform_icon_url,\n          supported_features\n        )\n      ",
            )
            .eq("clinic_id", profile.clinic_id);
          // Apply filters
          if (platform) {
            query = query.eq("platform_name", platform);
          }
          if (status_1) {
            query = query.eq("status", status_1);
          }
          if (syncStatus) {
            query = query.eq("sync_status", syncStatus);
          }
          return [4 /*yield*/, query.order("created_at", { ascending: false })];
        case 4:
          (_a = _b.sent()), (accounts = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching social media accounts:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 }),
            ];
          }
          sanitizedAccounts =
            accounts === null || accounts === void 0
              ? void 0
              : accounts.map(function (account) {
                  return __assign(__assign({}, account), {
                    has_access_token: !!account.access_token,
                    has_refresh_token: !!account.refresh_token,
                    access_token: undefined,
                    refresh_token: undefined,
                  });
                });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: sanitizedAccounts,
              total: (accounts === null || accounts === void 0 ? void 0 : accounts.length) || 0,
            }),
          ];
        case 5:
          error_1 = _b.sent();
          console.error("Social media accounts GET error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Internal server error" }, { status: 500 }),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * POST /api/social-media/accounts
 *
 * Creates a new social media account connection
 * Typically called after OAuth flow completion
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      body,
      validatedData,
      platform,
      existingAccount,
      accountData,
      _a,
      newAccount,
      error,
      error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 9, , 10]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
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
        case 3:
          profile = _b.sent().data;
          if (!(profile === null || profile === void 0 ? void 0 : profile.clinic_id)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Clinic access required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = createAccountSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("social_media_platforms")
              .select("id")
              .eq("platform_name", validatedData.platform_name)
              .single(),
          ];
        case 5:
          platform = _b.sent().data;
          if (!platform) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid platform" }, { status: 400 }),
            ];
          }
          if (!validatedData.account_id) return [3 /*break*/, 7];
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("id")
              .eq("clinic_id", profile.clinic_id)
              .eq("platform_name", validatedData.platform_name)
              .eq("account_id", validatedData.account_id)
              .single(),
          ];
        case 6:
          existingAccount = _b.sent().data;
          if (existingAccount) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account already connected" }, { status: 409 }),
            ];
          }
          _b.label = 7;
        case 7:
          accountData = __assign(__assign({}, validatedData), {
            clinic_id: profile.clinic_id,
            created_by: session.user.id,
          });
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .insert([accountData])
              .select(
                "\n        id,\n        platform_name,\n        account_name,\n        account_handle,\n        account_id,\n        account_metadata,\n        sync_settings,\n        sync_status,\n        status,\n        created_at,\n        social_media_platforms!inner(\n          platform_display_name,\n          platform_icon_url\n        )\n      ",
              )
              .single(),
          ];
        case 8:
          (_a = _b.sent()), (newAccount = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating social media account:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to create account connection" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: newAccount,
                message: "Social media account connected successfully",
              },
              { status: 201 },
            ),
          ];
        case 9:
          error_2 = _b.sent();
          console.error("Social media accounts POST error:", error_2);
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
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
