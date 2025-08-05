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
exports.GET = GET;
exports.POST = POST;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var whatsapp_handler_1 = require("@/lib/oauth/platforms/whatsapp-handler");
var logger_1 = require("@/lib/logger");
var crypto_1 = require("crypto");
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var requestId,
      searchParams,
      code,
      state,
      error,
      errorDescription,
      supabase,
      _a,
      stateRecord,
      stateError,
      stateData,
      userId,
      _b,
      session,
      sessionError,
      oauthHandler,
      encryptedToken,
      userInfo,
      businessAccounts,
      connectionData,
      _c,
      connection,
      connectionError,
      error_1;
    var _d;
    return __generator(this, function (_e) {
      switch (_e.label) {
        case 0:
          requestId = (0, crypto_1.randomBytes)(16).toString("hex");
          searchParams = request.nextUrl.searchParams;
          code = searchParams.get("code");
          state = searchParams.get("state");
          error = searchParams.get("error");
          errorDescription = searchParams.get("error_description");
          _e.label = 1;
        case 1:
          _e.trys.push([1, 11, , 12]);
          logger_1.Logger.info("WhatsApp OAuth callback received", {
            requestId: requestId,
            provider: "whatsapp",
            hasCode: !!code,
            hasState: !!state,
            hasError: !!error,
            errorDescription: errorDescription,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          });
          // Handle OAuth errors
          if (error) {
            logger_1.Logger.warn("WhatsApp OAuth error received", {
              requestId: requestId,
              provider: "whatsapp",
              error: error,
              errorDescription: errorDescription,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=oauth_error&provider=whatsapp&message=".concat(
                    encodeURIComponent(errorDescription || error),
                  ),
                  request.url,
                ),
              ),
            ];
          }
          // Validate required parameters
          if (!code || !state) {
            logger_1.Logger.error("WhatsApp OAuth callback missing required parameters", {
              requestId: requestId,
              provider: "whatsapp",
              hasCode: !!code,
              hasState: !!state,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=invalid_callback&provider=whatsapp",
                  request.url,
                ),
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _e.sent();
          return [
            4 /*yield*/,
            supabase.from("oauth_states").select("data, expires_at").eq("state", state).single(),
          ];
        case 3:
          (_a = _e.sent()), (stateRecord = _a.data), (stateError = _a.error);
          if (stateError || !stateRecord) {
            logger_1.Logger.error("WhatsApp OAuth invalid or expired state", {
              requestId: requestId,
              provider: "whatsapp",
              state: state,
              error: stateError === null || stateError === void 0 ? void 0 : stateError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=invalid_state&provider=whatsapp",
                  request.url,
                ),
              ),
            ];
          }
          // Check state expiration
          if (new Date(stateRecord.expires_at) < new Date()) {
            logger_1.Logger.error("WhatsApp OAuth state expired", {
              requestId: requestId,
              provider: "whatsapp",
              state: state,
              expiresAt: stateRecord.expires_at,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=state_expired&provider=whatsapp",
                  request.url,
                ),
              ),
            ];
          }
          stateData = stateRecord.data;
          userId = stateData.userId;
          return [4 /*yield*/, supabase.auth.getSession()];
        case 4:
          (_b = _e.sent()), (session = _b.data.session), (sessionError = _b.error);
          if (
            sessionError ||
            !(session === null || session === void 0 ? void 0 : session.user) ||
            session.user.id !== userId
          ) {
            logger_1.Logger.error("WhatsApp OAuth session mismatch", {
              requestId: requestId,
              provider: "whatsapp",
              expectedUserId: userId,
              actualUserId:
                (_d = session === null || session === void 0 ? void 0 : session.user) === null ||
                _d === void 0
                  ? void 0
                  : _d.id,
              error:
                sessionError === null || sessionError === void 0 ? void 0 : sessionError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=session_mismatch&provider=whatsapp",
                  request.url,
                ),
              ),
            ];
          }
          oauthHandler = new whatsapp_handler_1.WhatsAppOAuthHandler();
          return [4 /*yield*/, oauthHandler.exchangeCodeForTokens(code, state)];
        case 5:
          encryptedToken = _e.sent();
          return [4 /*yield*/, oauthHandler.getUserInfo(encryptedToken.encryptedData)];
        case 6:
          userInfo = _e.sent();
          return [4 /*yield*/, oauthHandler.getBusinessAccounts(encryptedToken.encryptedData)];
        case 7:
          businessAccounts = _e.sent();
          connectionData = {
            profile_id: userId,
            platform_type: "whatsapp",
            platform_user_id: userInfo.id,
            platform_username: userInfo.name || userInfo.email,
            encrypted_token: encryptedToken.encryptedData,
            token_expires_at: encryptedToken.expiresAt,
            scopes: ["whatsapp_business_messaging", "whatsapp_business_management"],
            status: "connected",
            connected_at: new Date().toISOString(),
            platform_data: {
              userInfo: userInfo,
              businessAccounts: businessAccounts.map(function (account) {
                return {
                  id: account.id,
                  name: account.name,
                  verification_status: account.verification_status,
                };
              }),
            },
          };
          return [
            4 /*yield*/,
            supabase
              .from("marketing_platform_connections")
              .upsert(connectionData, {
                onConflict: "profile_id,platform_type",
              })
              .select()
              .single(),
          ];
        case 8:
          (_c = _e.sent()), (connection = _c.data), (connectionError = _c.error);
          if (connectionError) {
            logger_1.Logger.error("Failed to save WhatsApp connection", {
              requestId: requestId,
              provider: "whatsapp",
              userId: userId,
              error: connectionError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=save_failed&provider=whatsapp",
                  request.url,
                ),
              ),
            ];
          }
          // Clean up OAuth state
          return [4 /*yield*/, supabase.from("oauth_states").delete().eq("state", state)];
        case 9:
          // Clean up OAuth state
          _e.sent();
          // Log successful connection
          return [
            4 /*yield*/,
            supabase.from("oauth_audit_log").insert({
              profile_id: userId,
              provider: "whatsapp",
              action: "connection_completed",
              request_id: requestId,
              ip_address:
                request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
              user_agent: request.headers.get("user-agent"),
              details: {
                connectionId: connection.id,
                platformUserId: userInfo.id,
                businessAccountCount: businessAccounts.length,
              },
            }),
          ];
        case 10:
          // Log successful connection
          _e.sent();
          logger_1.Logger.info("WhatsApp OAuth connection successful", {
            requestId: requestId,
            provider: "whatsapp",
            userId: userId,
            connectionId: connection.id,
            platformUserId: userInfo.id,
            businessAccountCount: businessAccounts.length,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.redirect(
              new URL("/dashboard/settings/integrations?success=whatsapp_connected", request.url),
            ),
          ];
        case 11:
          error_1 = _e.sent();
          logger_1.Logger.error("WhatsApp OAuth callback error", {
            requestId: requestId,
            provider: "whatsapp",
            error: error_1 instanceof Error ? error_1.message : "Unknown error",
            stack: error_1 instanceof Error ? error_1.stack : undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.redirect(
              new URL(
                "/dashboard/settings/integrations?error=callback_failed&provider=whatsapp&requestId=".concat(
                  requestId,
                ),
                request.url,
              ),
            ),
          ];
        case 12:
          return [2 /*return*/];
      }
    });
  });
}
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        server_1.NextResponse.json({ error: "Method not allowed" }, { status: 405 }),
      ];
    });
  });
}
