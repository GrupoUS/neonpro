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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var zod_1 = require("zod");
/**
 * Social Media Platforms API Route
 *
 * GET: Retrieve all available social media platforms with their configurations
 * POST: Add a new social media platform (admin only)
 *
 * Research-backed implementation following:
 * - WhatsApp Business API best practices
 * - Instagram Graph API guidelines
 * - Facebook Graph API patterns
 * - Next.js 15 App Router conventions
 */
// Validation schemas
var createPlatformSchema = zod_1.z.object({
  platform_name: zod_1.z.string().min(1).max(50),
  platform_display_name: zod_1.z.string().min(1).max(100),
  platform_icon_url: zod_1.z.string().url().optional(),
  api_base_url: zod_1.z.string().url().optional(),
  oauth_config: zod_1.z.record(zod_1.z.any()).default({}),
  api_rate_limits: zod_1.z.record(zod_1.z.any()).default({}),
  supported_features: zod_1.z.record(zod_1.z.boolean()).default({}),
  webhook_capabilities: zod_1.z.record(zod_1.z.any()).default({}),
});
/**
 * GET /api/social-media/platforms
 *
 * Retrieves all available social media platforms with their configurations
 * Includes OAuth settings, supported features, and API configurations
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      _a,
      platforms,
      error,
      connectedAccounts_1,
      platformsWithStatus,
      error_1;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 6, , 7]);
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
          return [
            4 /*yield*/,
            supabase
              .from("social_media_platforms")
              .select(
                "\n        id,\n        platform_name,\n        platform_display_name,\n        platform_icon_url,\n        api_base_url,\n        oauth_config,\n        api_rate_limits,\n        supported_features,\n        webhook_capabilities,\n        created_at,\n        updated_at\n      ",
              )
              .order("platform_display_name"),
          ];
        case 4:
          (_a = _b.sent()), (platforms = _a.data), (error = _a.error);
          if (error) {
            console.error("Error fetching social media platforms:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to fetch platforms" }, { status: 500 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("platform_name, status, sync_status")
              .eq("clinic_id", profile.clinic_id)
              .eq("status", "active"),
          ];
        case 5:
          connectedAccounts_1 = _b.sent().data;
          platformsWithStatus =
            platforms === null || platforms === void 0
              ? void 0
              : platforms.map((platform) =>
                  __assign(__assign({}, platform), {
                    connection_status:
                      (connectedAccounts_1 === null || connectedAccounts_1 === void 0
                        ? void 0
                        : connectedAccounts_1.find(
                            (account) => account.platform_name === platform.platform_name,
                          )) || null,
                    is_connected:
                      (connectedAccounts_1 === null || connectedAccounts_1 === void 0
                        ? void 0
                        : connectedAccounts_1.some(
                            (account) =>
                              account.platform_name === platform.platform_name &&
                              account.status === "active",
                          )) || false,
                  }),
                );
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              data: platformsWithStatus,
              total: (platforms === null || platforms === void 0 ? void 0 : platforms.length) || 0,
            }),
          ];
        case 6:
          error_1 = _b.sent();
          console.error("Social media platforms API error:", error_1);
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
 * POST /api/social-media/platforms
 *
 * Creates a new social media platform (admin only)
 * Used for adding new platforms or custom integrations
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      profile,
      body,
      validatedData,
      existingPlatform,
      _a,
      newPlatform,
      error,
      error_2;
    return __generator(this, (_b) => {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 7, , 8]);
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
            supabase.from("profiles").select("role").eq("id", session.user.id).single(),
          ];
        case 3:
          profile = _b.sent().data;
          if (
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "admin" &&
            (profile === null || profile === void 0 ? void 0 : profile.role) !== "owner"
          ) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Admin privileges required" }, { status: 403 }),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 4:
          body = _b.sent();
          validatedData = createPlatformSchema.parse(body);
          return [
            4 /*yield*/,
            supabase
              .from("social_media_platforms")
              .select("id")
              .eq("platform_name", validatedData.platform_name)
              .single(),
          ];
        case 5:
          existingPlatform = _b.sent().data;
          if (existingPlatform) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Platform already exists" }, { status: 409 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("social_media_platforms").insert([validatedData]).select().single(),
          ];
        case 6:
          (_a = _b.sent()), (newPlatform = _a.data), (error = _a.error);
          if (error) {
            console.error("Error creating social media platform:", error);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Failed to create platform" }, { status: 500 }),
            ];
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                success: true,
                data: newPlatform,
                message: "Social media platform created successfully",
              },
              { status: 201 },
            ),
          ];
        case 7:
          error_2 = _b.sent();
          console.error("Social media platforms POST error:", error_2);
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
        case 8:
          return [2 /*return*/];
      }
    });
  });
}
