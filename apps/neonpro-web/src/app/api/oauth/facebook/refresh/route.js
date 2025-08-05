"use strict";
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
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var facebook_handler_1 = require("@/lib/oauth/platforms/facebook-handler");
var token_encryption_1 = require("@/lib/oauth/token-encryption");
/**
 * Facebook OAuth Token Refresh Endpoint
 * Refreshes Facebook access tokens using fb_exchange_token
 *
 * Features:
 * - Long-lived token exchange (60-day tokens)
 * - Automatic token encryption and storage
 * - Error handling and fallback mechanisms
 * - Audit logging for security compliance
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var supabase,
      session,
      accountId,
      _a,
      account,
      accountError,
      encryptedAccessToken,
      currentAccessToken,
      facebookHandler,
      newTokens,
      newEncryptedAccessToken,
      updateError,
      error_1,
      supabase,
      session,
      logError_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 8, , 16]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 1:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 2:
          session = _b.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user)) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Unauthorized - Please log in to refresh tokens" },
                { status: 401 },
              ),
            ];
          }
          return [4 /*yield*/, request.json()];
        case 3:
          accountId = _b.sent().accountId;
          if (!accountId) {
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Account ID is required" }, { status: 400 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .select("*")
              .eq("id", accountId)
              .eq("user_id", session.user.id)
              .eq("platform_id", "facebook")
              .eq("is_active", true)
              .single(),
          ];
        case 4:
          (_a = _b.sent()), (account = _a.data), (accountError = _a.error);
          if (accountError || !account) {
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Facebook account not found or access denied" },
                { status: 404 },
              ),
            ];
          }
          encryptedAccessToken = JSON.parse(account.encrypted_access_token);
          currentAccessToken =
            token_encryption_1.TokenEncryptionService.decryptToken(encryptedAccessToken);
          facebookHandler = new facebook_handler_1.FacebookOAuthHandler();
          return [4 /*yield*/, facebookHandler.refreshTokens(currentAccessToken)];
        case 5:
          newTokens = _b.sent();
          newEncryptedAccessToken = token_encryption_1.TokenEncryptionService.encryptToken(
            newTokens.accessToken,
          );
          return [
            4 /*yield*/,
            supabase
              .from("social_media_accounts")
              .update({
                encrypted_access_token: JSON.stringify(newEncryptedAccessToken),
                token_expires_at: newTokens.expiresAt.toISOString(),
                token_scopes: newTokens.scope ? newTokens.scope.split(" ") : account.token_scopes,
                last_sync_at: new Date().toISOString(),
              })
              .eq("id", accountId),
          ];
        case 6:
          updateError = _b.sent().error;
          if (updateError) {
            throw new Error("Failed to update tokens: ".concat(updateError.message));
          }
          // Log successful token refresh
          console.log(
            "Facebook tokens refreshed successfully for account "
              .concat(accountId, ", user ")
              .concat(session.user.id),
          );
          // Update platform last activity
          return [
            4 /*yield*/,
            supabase.from("social_media_platforms").upsert(
              {
                platform: "facebook",
                last_token_refresh: new Date().toISOString(),
              },
              { onConflict: "platform" },
            ),
          ];
        case 7:
          // Update platform last activity
          _b.sent();
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Facebook tokens refreshed successfully",
              expiresAt: newTokens.expiresAt.toISOString(),
              expiresIn: newTokens.expiresIn,
            }),
          ];
        case 8:
          error_1 = _b.sent();
          console.error("Facebook token refresh error:", error_1);
          _b.label = 9;
        case 9:
          _b.trys.push([9, 14, , 15]);
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 10:
          supabase = _b.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 11:
          session = _b.sent().data.session;
          if (!(session === null || session === void 0 ? void 0 : session.user))
            return [3 /*break*/, 13];
          return [
            4 /*yield*/,
            supabase.from("oauth_errors").insert({
              user_id: session.user.id,
              platform: "facebook",
              error_type: "token_refresh_error",
              error_message: error_1 instanceof Error ? error_1.message : "Unknown error",
              occurred_at: new Date().toISOString(),
            }),
          ];
        case 12:
          _b.sent();
          _b.label = 13;
        case 13:
          return [3 /*break*/, 15];
        case 14:
          logError_1 = _b.sent();
          console.error("Failed to log token refresh error:", logError_1);
          return [3 /*break*/, 15];
        case 15:
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to refresh Facebook tokens",
                details: error_1 instanceof Error ? error_1.message : "Unknown error",
              },
              { status: 500 },
            ),
          ];
        case 16:
          return [2 /*return*/];
      }
    });
  });
}
