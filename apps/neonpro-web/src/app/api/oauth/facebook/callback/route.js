"use strict";
var __makeTemplateObject =
  (this && this.__makeTemplateObject) ||
  function (cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, "raw", { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
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
var server_1 = require("@/lib/supabase/server");
var facebook_handler_1 = require("@/lib/oauth/platforms/facebook-handler");
var navigation_1 = require("next/navigation");
/**
 * Facebook OAuth Callback Endpoint
 * Handles the OAuth 2.0 authorization code callback from Facebook
 *
 * Features:
 * - State validation for CSRF protection
 * - Token exchange and secure storage
 * - User profile synchronization
 * - Comprehensive error handling
 * - Audit logging
 */
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      searchParams,
      code,
      state,
      error,
      errorDescription,
      redirectUrl,
      facebookHandler,
      tokens,
      profile,
      session,
      userProfile,
      accountId,
      error_1,
      session,
      logError_1,
      errorMessage;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          return [4 /*yield*/, (0, server_1.createClient)()];
        case 1:
          supabase = _a.sent();
          _a.label = 2;
        case 2:
          _a.trys.push([2, 9, , 16]);
          searchParams = request.nextUrl.searchParams;
          code = searchParams.get("code");
          state = searchParams.get("state");
          error = searchParams.get("error");
          errorDescription = searchParams.get("error_description");
          // Handle OAuth errors from Facebook
          if (error) {
            console.error("Facebook OAuth error:", {
              error: error,
              errorDescription: errorDescription,
            });
            redirectUrl = "/dashboard/social-media?error="
              .concat(encodeURIComponent(error), "&message=")
              .concat(encodeURIComponent(errorDescription || "Facebook authorization failed"));
            return [2 /*return*/, (0, navigation_1.redirect)(redirectUrl)];
          }
          // Validate required parameters
          if (!code || !state) {
            console.error("Missing required OAuth parameters:", { code: !!code, state: !!state });
            return [
              2 /*return*/,
              (0, navigation_1.redirect)(
                "/dashboard/social-media?error=invalid_request&message=Missing authorization code or state",
              ),
            ];
          }
          facebookHandler = new facebook_handler_1.FacebookOAuthHandler();
          return [4 /*yield*/, facebookHandler.exchangeCodeForTokens(code, state)];
        case 3:
          tokens = _a.sent();
          return [4 /*yield*/, facebookHandler.getUserProfile(tokens.accessToken)];
        case 4:
          profile = _a.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 5:
          session = _a.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user)) {
            console.error("User session expired during OAuth callback");
            return [
              2 /*return*/,
              (0, navigation_1.redirect)(
                "/login?error=session_expired&message=Please log in again",
              ),
            ];
          }
          return [
            4 /*yield*/,
            supabase.from("profiles").select("clinic_id").eq("id", session.user.id).single(),
          ];
        case 6:
          userProfile = _a.sent().data;
          if (!(userProfile === null || userProfile === void 0 ? void 0 : userProfile.clinic_id)) {
            console.error("User clinic not found during Facebook OAuth callback");
            return [
              2 /*return*/,
              (0, navigation_1.redirect)(
                "/dashboard/social-media?error=clinic_not_found&message=Clinic configuration missing",
              ),
            ];
          }
          return [
            4 /*yield*/,
            facebookHandler.storeTokens(session.user.id, userProfile.clinic_id, tokens, profile),
          ];
        case 7:
          accountId = _a.sent();
          // Log successful connection for audit trail
          console.log(
            "Facebook account connected successfully for user "
              .concat(session.user.id, ", clinic ")
              .concat(userProfile.clinic_id, ", account ")
              .concat(accountId),
          );
          // Update social media platform status
          return [
            4 /*yield*/,
            supabase.from("social_media_platforms").upsert(
              {
                platform: "facebook",
                is_enabled: true,
                last_connected_at: new Date().toISOString(),
                connection_count: supabase.sql(
                  templateObject_1 ||
                    (templateObject_1 = __makeTemplateObject(
                      ["connection_count + 1"],
                      ["connection_count + 1"],
                    )),
                ),
              },
              { onConflict: "platform" },
            ),
          ];
        case 8:
          // Update social media platform status
          _a.sent();
          // Redirect to success page
          return [
            2 /*return*/,
            (0, navigation_1.redirect)(
              "/dashboard/social-media?success=true&platform=facebook&message=Facebook account connected successfully",
            ),
          ];
        case 9:
          error_1 = _a.sent();
          console.error("Facebook OAuth callback error:", error_1);
          _a.label = 10;
        case 10:
          _a.trys.push([10, 14, , 15]);
          return [4 /*yield*/, supabase.auth.getSession()];
        case 11:
          session = _a.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user))
            return [3 /*break*/, 13];
          return [
            4 /*yield*/,
            supabase.from("oauth_errors").insert({
              user_id: session.user.id,
              platform: "facebook",
              error_type: "callback_error",
              error_message: error_1 instanceof Error ? error_1.message : "Unknown error",
              occurred_at: new Date().toISOString(),
            }),
          ];
        case 12:
          _a.sent();
          _a.label = 13;
        case 13:
          return [3 /*break*/, 15];
        case 14:
          logError_1 = _a.sent();
          console.error("Failed to log OAuth error:", logError_1);
          return [3 /*break*/, 15];
        case 15:
          errorMessage = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
          return [
            2 /*return*/,
            (0, navigation_1.redirect)(
              "/dashboard/social-media?error=connection_failed&message=".concat(
                encodeURIComponent(errorMessage),
              ),
            ),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
var templateObject_1;
