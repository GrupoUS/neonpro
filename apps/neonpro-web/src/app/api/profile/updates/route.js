"use strict";
// app/api/profile/updates/route.ts
// VIBECODE V1.0 - Google Profile Updates Handler API
// Story 1.4 - OAuth Google Integration Enhancement
// Created: 2025-07-23
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
      google_profile_data,
      _b,
      force_update,
      _c,
      currentProfile,
      profileError,
      googleUpdate,
      changes,
      conflicts,
      updateData,
      _d,
      updatedProfile,
      updateError,
      error_1;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          _e.trys.push([0, 11, , 12]);
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
          return [4 /*yield*/, request.json()];
        case 3:
          body = _e.sent();
          (google_profile_data = body.google_profile_data),
            (_b = body.force_update),
            (force_update = _b === void 0 ? false : _b);
          if (!google_profile_data) {
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Missing data", message: "google_profile_data is required" },
                { status: 400 },
              ),
            ];
          }
          return [4 /*yield*/, supabase.from("profiles").select("*").eq("id", user.id).single()];
        case 4:
          (_c = _e.sent()), (currentProfile = _c.data), (profileError = _c.error);
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
          googleUpdate = google_profile_data;
          changes = {};
          conflicts = {};
          // Check for changes and conflicts
          if (googleUpdate.email && googleUpdate.email !== currentProfile.email) {
            if (currentProfile.email && !force_update) {
              conflicts.email = {
                current: currentProfile.email,
                google: googleUpdate.email,
              };
            } else {
              changes.email = googleUpdate.email;
            }
          }
          if (googleUpdate.name && googleUpdate.name !== currentProfile.full_name) {
            if (currentProfile.full_name && !force_update) {
              conflicts.full_name = {
                current: currentProfile.full_name,
                google: googleUpdate.name,
              };
            } else {
              changes.full_name = googleUpdate.name;
            }
          }
          if (googleUpdate.given_name && googleUpdate.given_name !== currentProfile.first_name) {
            if (currentProfile.first_name && !force_update) {
              conflicts.first_name = {
                current: currentProfile.first_name,
                google: googleUpdate.given_name,
              };
            } else {
              changes.first_name = googleUpdate.given_name;
            }
          }
          if (googleUpdate.family_name && googleUpdate.family_name !== currentProfile.last_name) {
            if (currentProfile.last_name && !force_update) {
              conflicts.last_name = {
                current: currentProfile.last_name,
                google: googleUpdate.family_name,
              };
            } else {
              changes.last_name = googleUpdate.family_name;
            }
          }
          if (googleUpdate.picture && googleUpdate.picture !== currentProfile.google_picture) {
            changes.google_picture = googleUpdate.picture;
            changes.avatar_url = googleUpdate.picture;
          }
          if (googleUpdate.email_verified !== undefined) {
            changes.google_verified_email = googleUpdate.email_verified;
          }
          if (!(Object.keys(conflicts).length > 0 && !force_update)) return [3 /*break*/, 6];
          return [
            4 /*yield*/,
            supabase
              .from("profiles")
              .update({
                profile_sync_status: "conflict",
                updated_at: new Date().toISOString(),
              })
              .eq("id", user.id),
          ];
        case 5:
          _e.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: false,
              message: "Profile conflicts detected",
              conflicts: conflicts,
              suggested_changes: changes,
              requires_resolution: true,
            }),
          ];
        case 6:
          if (!(Object.keys(changes).length > 0)) return [3 /*break*/, 10];
          updateData = __assign(__assign({}, changes), {
            profile_sync_status: "synced",
            last_google_sync: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return [
            4 /*yield*/,
            supabase.from("profiles").update(updateData).eq("id", user.id).select().single(),
          ];
        case 7:
          (_d = _e.sent()), (updatedProfile = _d.data), (updateError = _d.error);
          if (updateError) {
            console.error("Profile update error:", updateError);
            return [
              2 /*return*/,
              server_2.NextResponse.json(
                { error: "Update failed", message: updateError.message },
                { status: 500 },
              ),
            ];
          }
          // Update sync status
          return [
            4 /*yield*/,
            supabase
              .from("profile_sync_status")
              .upsert({
                user_id: user.id,
                sync_status: "synced",
                google_sync_enabled: true,
                last_sync: new Date().toISOString(),
                google_verified:
                  googleUpdate.email_verified || currentProfile.google_verified_email,
                has_conflicts: false,
                updated_at: new Date().toISOString(),
              }),
            // Log the update for audit
          ];
        case 8:
          // Update sync status
          _e.sent();
          // Log the update for audit
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              user_id: user.id,
              event_type: "profile_update_from_google",
              event_data: {
                changes: changes,
                conflicts: Object.keys(conflicts),
                force_update: force_update,
                google_data: googleUpdate,
              },
              created_at: new Date().toISOString(),
            }),
          ];
        case 9:
          // Log the update for audit
          _e.sent();
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Profile updated successfully from Google",
              profile: updatedProfile,
              changes_applied: changes,
              conflicts_resolved: Object.keys(conflicts).length,
            }),
          ];
        case 10:
          // No changes needed
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              success: true,
              message: "Profile already up to date",
              profile: currentProfile,
              no_changes_needed: true,
            }),
          ];
        case 11:
          error_1 = _e.sent();
          console.error("Profile update API error:", error_1);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Profile update failed" },
              { status: 500 },
            ),
          ];
        case 12:
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
      updateLogs,
      logsError,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            (0, server_1.createClient)(),
            // Get the current user
          ];
        case 1:
          supabase = _d.sent();
          return [4 /*yield*/, supabase.auth.getUser()];
        case 2:
          (_a = _d.sent()), (user = _a.data.user), (userError = _a.error);
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
          (_b = _d.sent()), (profile = _b.data), (profileError = _b.error);
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
              .eq("event_type", "profile_update_from_google")
              .order("created_at", { ascending: false })
              .limit(10),
          ];
        case 4:
          (_c = _d.sent()), (updateLogs = _c.data), (logsError = _c.error);
          return [
            2 /*return*/,
            server_2.NextResponse.json({
              profile: profile,
              sync_status: profile.profile_sync_status,
              last_google_sync: profile.last_google_sync,
              google_sync_enabled: profile.google_sync_enabled,
              recent_updates: updateLogs || [],
              can_force_update: true,
            }),
          ];
        case 5:
          error_2 = _d.sent();
          console.error("Profile updates GET error:", error_2);
          return [
            2 /*return*/,
            server_2.NextResponse.json(
              { error: "Internal server error", message: "Could not fetch update information" },
              { status: 500 },
            ),
          ];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
