// app/api/profile/sync/route.ts
// VIBECODE V1.0 - Google Profile Synchronization API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("@/lib/supabase/server");
var server_2 = require("next/server");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      userError,
      googleData,
      appData,
      hasGoogleProvider,
      profileData,
      _b,
      profile,
      updateError,
      _c,
      newProfile,
      insertError,
      error_1;
    var _d;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 8, , 9]);
          return [
            4 /*yield*/,
            (0, server_1.createClient)(),
            // Get the current user
          ];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Unauthorized", message: "User not authenticated" },
                { status: 401 },
              ),
            ];
          }
          googleData = user.user_metadata || {};
          appData = user.app_metadata || {};
          hasGoogleProvider =
            (_d = user.identities) === null || _d === void 0
              ? void 0
              : _d.some((identity) => identity.provider === "google");
          if (!hasGoogleProvider) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "No Google provider", message: "User is not authenticated with Google" },
                { status: 400 },
              ),
            ];
          }
          profileData = {
            email: user.email,
            full_name: googleData.full_name || googleData.name,
            first_name: googleData.given_name,
            last_name: googleData.family_name,
            avatar_url: googleData.avatar_url || googleData.picture,
            google_provider_id: googleData.provider_id || googleData.sub,
            google_picture: googleData.picture,
            google_verified_email: user.email_confirmed_at ? true : false,
            profile_sync_status: "synced",
            google_sync_enabled: true,
            last_google_sync: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return [
            4 /*yield*/,
            supabase.from("profiles").update(profileData).eq("id", user.id).select().single(),
          ];
        case 3:
          (_b = _e.sent()), (profile = _b.data), (updateError = _b.error);
          if (!updateError) return [3 /*break*/, 6];
          console.error("Profile sync error:", updateError);
          if (!(updateError.code === "PGRST116")) return [3 /*break*/, 5];
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .insert(
                __assign(__assign({ id: user.id }, profileData), {
                  role: "professional",
                  data_consent_given: false,
                  created_at: new Date().toISOString(),
                }),
              )
              .select()
              .single(),
          ];
        case 4:
          (_c = _e.sent()), (newProfile = _c.data), (insertError = _c.error);
          if (insertError) {
            console.error("Profile creation error:", insertError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Sync failed", message: "Could not create or update profile" },
                { status: 500 },
              ),
            ];
          }
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Profile created and synced with Google",
              profile: newProfile,
            }),
          ];
        case 5:
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Sync failed", message: updateError.message },
              { status: 500 },
            ),
          ];
        case 6:
          // Update profile sync status
          return [
            4 /*yield*/,
            supabase.from("profile_sync_status").upsert({
              user_id: user.id,
              sync_status: "synced",
              google_sync_enabled: true,
              last_sync: new Date().toISOString(),
              google_verified: profileData.google_verified_email,
              has_conflicts: false,
              updated_at: new Date().toISOString(),
            }),
          ];
        case 7:
          // Update profile sync status
          _e.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Profile successfully synced with Google",
              profile: profile,
              sync_timestamp: new Date().toISOString(),
            }),
          ];
        case 8:
          error_1 = _e.sent();
          console.error("Profile sync API error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Profile sync failed" },
              { status: 500 },
            ),
          ];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      _a,
      user,
      userError,
      _b,
      profile,
      profileError,
      _c,
      syncStatus,
      syncError,
      error_2;
    var _d;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, server_1.createClient)(),
            // Get the current user
          ];
        case 1:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _e.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Unauthorized", message: "User not authenticated" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("*").eq("id", user.id).single()];
        case 3:
          (_b = _e.sent()), (profile = _b.data), (profileError = _b.error);
          if (profileError) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Profile not found", message: profileError.message },
                { status: 404 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profile_sync_status").select("*").eq("user_id", user.id).single(),
          ];
        case 4:
          (_c = _e.sent()), (syncStatus = _c.data), (syncError = _c.error);
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              profile: profile,
              sync_status: syncStatus,
              google_connected:
                ((_d = user.identities) === null || _d === void 0
                  ? void 0
                  : _d.some((identity) => identity.provider === "google")) || false,
            }),
          ];
        case 5:
          error_2 = _e.sent();
          console.error("Profile sync GET error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Could not fetch profile sync data" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
