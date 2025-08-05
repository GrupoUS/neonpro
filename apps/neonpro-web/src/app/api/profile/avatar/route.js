"use strict";
// app/api/profile/avatar/route.ts
// VIBECODE V1.0 - Avatar/Photo Synchronization API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23
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
      body,
      google_picture_url,
      _b,
      sync_to_local_storage,
      _c,
      force_update,
      custom_avatar_url,
      _d,
      currentProfile,
      profileError,
      finalAvatarUrl,
      syncMethod,
      response,
      imageBuffer,
      fileName,
      _e,
      uploadData,
      uploadError,
      publicUrlData,
      error_1,
      needsUpdate,
      updateData,
      _f,
      updatedProfile,
      updateError,
      error_2;
    return __generator(this, function (_g) {
      switch (_g.label) {
        case 0:
          _g.trys.push([0, 18, , 19]);
          return [
            4 /*yield*/,
            (0, server_1.createClient)(),
            // Get the current user
          ];
        case 1:
          supabase = _g.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _g.sent()), (user = _a.data.user), (userError = _a.error);
          if (userError || !user) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Unauthorized", message: "User not authenticated" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          body = _g.sent();
          (google_picture_url = body.google_picture_url),
            (_b = body.sync_to_local_storage),
            (sync_to_local_storage = _b === void 0 ? false : _b),
            (_c = body.force_update),
            (force_update = _c === void 0 ? false : _c),
            (custom_avatar_url = body.custom_avatar_url);
          return [4 /*yield*/, supabase.from("profiles").select("*").eq("id", user.id).single()];
        case 4:
          (_d = _g.sent()), (currentProfile = _d.data), (profileError = _d.error);
          if (profileError) {
            console.error("Profile lookup error:", profileError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Profile not found", message: profileError.message },
                { status: 404 },
              ),
            ];
          }
          finalAvatarUrl = "";
          syncMethod = "";
          if (!custom_avatar_url) return [3 /*break*/, 5];
          finalAvatarUrl = custom_avatar_url;
          syncMethod = "custom_upload";
          return [3 /*break*/, 15];
        case 5:
          if (!google_picture_url) return [3 /*break*/, 14];
          if (!sync_to_local_storage) return [3 /*break*/, 12];
          _g.label = 6;
        case 6:
          _g.trys.push([6, 10, , 11]);
          return [4 /*yield*/, fetch(google_picture_url)];
        case 7:
          response = _g.sent();
          if (!response.ok) {
            throw new Error("Failed to fetch Google avatar: ".concat(response.statusText));
          }
          return [4 /*yield*/, response.arrayBuffer()];
        case 8:
          imageBuffer = _g.sent();
          fileName = "avatars/".concat(user.id, "/google-avatar-").concat(Date.now(), ".jpg");
          return [
            4 /*yield*/,
            supabase.storage.from("avatars").upload(fileName, imageBuffer, {
              contentType: "image/jpeg",
              upsert: true,
            }),
          ];
        case 9:
          (_e = _g.sent()), (uploadData = _e.data), (uploadError = _e.error);
          if (uploadError) {
            console.error("Avatar upload error:", uploadError);
            // Fallback to direct Google URL
            finalAvatarUrl = google_picture_url;
            syncMethod = "google_direct_fallback";
          } else {
            publicUrlData = supabase.storage.from("avatars").getPublicUrl(fileName).data;
            finalAvatarUrl = publicUrlData.publicUrl;
            syncMethod = "local_storage";
          }
          return [3 /*break*/, 11];
        case 10:
          error_1 = _g.sent();
          console.error("Local storage sync error:", error_1);
          // Fallback to direct Google URL
          finalAvatarUrl = google_picture_url;
          syncMethod = "google_direct_fallback";
          return [3 /*break*/, 11];
        case 11:
          return [3 /*break*/, 13];
        case 12:
          // Use Google URL directly
          finalAvatarUrl = google_picture_url;
          syncMethod = "google_direct";
          _g.label = 13;
        case 13:
          return [3 /*break*/, 15];
        case 14:
          // No new avatar provided, keep existing
          finalAvatarUrl = currentProfile.avatar_url || "";
          syncMethod = "no_change";
          _g.label = 15;
        case 15:
          needsUpdate =
            force_update ||
            finalAvatarUrl !== currentProfile.avatar_url ||
            (google_picture_url && google_picture_url !== currentProfile.google_picture);
          if (!needsUpdate && syncMethod === "no_change") {
            return [
              2 /*return*/,
              server_2.NextResponse.json({
                success: true,
                message: "Avatar already up to date",
                avatar_url: currentProfile.avatar_url,
                sync_method: "no_change_needed",
              }),
            ];
          }
          updateData = {
            avatar_url: finalAvatarUrl,
            google_picture: google_picture_url || currentProfile.google_picture,
            profile_sync_status: "synced",
            last_google_sync: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          return [
            4 /*yield*/,
            supabase.from("profiles").update(updateData).eq("id", user.id).select().single(),
          ];
        case 16:
          (_f = _g.sent()), (updatedProfile = _f.data), (updateError = _f.error);
          if (updateError) {
            console.error("Profile avatar update error:", updateError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Update failed", message: updateError.message },
                { status: 500 },
              ),
            ];
          }
          // Log avatar sync event
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              user_id: user.id,
              event_type: "avatar_sync",
              event_data: {
                sync_method: syncMethod,
                previous_avatar: currentProfile.avatar_url,
                new_avatar: finalAvatarUrl,
                google_picture_url: google_picture_url,
                sync_to_local_storage: sync_to_local_storage,
                force_update: force_update,
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 17:
          // Log avatar sync event
          _g.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Avatar synchronized successfully",
              profile: updatedProfile,
              sync_details: {
                method: syncMethod,
                avatar_url: finalAvatarUrl,
                local_storage_used: sync_to_local_storage && syncMethod === "local_storage",
                previous_avatar: currentProfile.avatar_url,
              },
            }),
          ];
        case 18:
          error_2 = _g.sent();
          console.error("Avatar sync API error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Avatar synchronization failed" },
              { status: 500 },
            ),
          ];
        case 19:
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
      syncLogs,
      logsError,
      _d,
      bucketInfo,
      bucketError,
      error_3;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 6, , 7]);
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
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .select("avatar_url, google_picture, google_sync_enabled, last_google_sync")
              .eq("id", user.id)
              .single(),
          ];
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
            supabase
              .from("audit_logs")
              .select("*")
              .eq("user_id", user.id)
              .eq("event_type", "avatar_sync")
              .order("created_at", { ascending: false })
              .limit(5),
            // Check storage bucket info
          ];
        case 4:
          (_c = _e.sent()), (syncLogs = _c.data), (logsError = _c.error);
          return [
            4 /*yield*/,
            supabase.storage.from("avatars").list("avatars/".concat(user.id), {
              limit: 10,
              sortBy: { column: "created_at", order: "desc" },
            }),
          ];
        case 5:
          (_d = _e.sent()), (bucketInfo = _d.data), (bucketError = _d.error);
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              current_avatar: profile.avatar_url,
              google_picture: profile.google_picture,
              google_sync_enabled: profile.google_sync_enabled,
              last_sync: profile.last_google_sync,
              recent_syncs: syncLogs || [],
              local_storage: {
                has_local_avatars: bucketInfo && bucketInfo.length > 0,
                avatar_count:
                  (bucketInfo === null || bucketInfo === void 0 ? void 0 : bucketInfo.length) || 0,
                recent_uploads: bucketInfo || [],
              },
              sync_options: {
                can_sync_from_google: !!profile.google_picture,
                can_upload_custom: true,
                can_sync_to_local_storage: true,
              },
            }),
          ];
        case 6:
          error_3 = _e.sent();
          console.error("Avatar info GET error:", error_3);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Could not fetch avatar information" },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
