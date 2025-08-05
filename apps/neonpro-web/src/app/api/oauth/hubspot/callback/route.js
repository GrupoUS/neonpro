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
var hubspot_handler_1 = require("@/lib/oauth/platforms/hubspot-handler");
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
      portalInfo,
      accountInfo,
      connectionData,
      _c,
      connection,
      connectionError,
      error_1;
    var _d, _e;
    return __generator(this, function (_f) {
      switch (_f.label) {
        case 0:
          requestId = (0, crypto_1.randomBytes)(16).toString("hex");
          searchParams = request.nextUrl.searchParams;
          code = searchParams.get("code");
          state = searchParams.get("state");
          error = searchParams.get("error");
          errorDescription = searchParams.get("error_description");
          _f.label = 1;
        case 1:
          _f.trys.push([1, 12, , 13]);
          logger_1.Logger.info("HubSpot OAuth callback received", {
            requestId: requestId,
            provider: "hubspot",
            hasCode: !!code,
            hasState: !!state,
            hasError: !!error,
            errorDescription: errorDescription,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          });
          // Handle OAuth errors
          if (error) {
            logger_1.Logger.warn("HubSpot OAuth error received", {
              requestId: requestId,
              provider: "hubspot",
              error: error,
              errorDescription: errorDescription,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=oauth_error&provider=hubspot&message=".concat(
                    encodeURIComponent(errorDescription || error),
                  ),
                  request.url,
                ),
              ),
            ];
          }
          // Validate required parameters
          if (!code || !state) {
            logger_1.Logger.error("HubSpot OAuth callback missing required parameters", {
              requestId: requestId,
              provider: "hubspot",
              hasCode: !!code,
              hasState: !!state,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=invalid_callback&provider=hubspot",
                  request.url,
                ),
              ),
            ];
          }
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _f.sent();
          return [
            4 /*yield*/,
            supabase.from("oauth_states").select("data, expires_at").eq("state", state).single(),
          ];
        case 3:
          (_a = _f.sent()), (stateRecord = _a.data), (stateError = _a.error);
          if (stateError || !stateRecord) {
            logger_1.Logger.error("HubSpot OAuth invalid or expired state", {
              requestId: requestId,
              provider: "hubspot",
              state: state,
              error: stateError === null || stateError === void 0 ? void 0 : stateError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=invalid_state&provider=hubspot",
                  request.url,
                ),
              ),
            ];
          }
          // Check state expiration
          if (new Date(stateRecord.expires_at) < new Date()) {
            logger_1.Logger.error("HubSpot OAuth state expired", {
              requestId: requestId,
              provider: "hubspot",
              state: state,
              expiresAt: stateRecord.expires_at,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=state_expired&provider=hubspot",
                  request.url,
                ),
              ),
            ];
          }
          stateData = stateRecord.data;
          userId = stateData.userId;
          return [4 /*yield*/, supabase.auth.getSession()];
        case 4:
          (_b = _f.sent()), (session = _b.data.session), (sessionError = _b.error);
          if (
            sessionError ||
            !(session === null || session === void 0 ? void 0 : session.user) ||
            session.user.id !== userId
          ) {
            logger_1.Logger.error("HubSpot OAuth session mismatch", {
              requestId: requestId,
              provider: "hubspot",
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
                  "/dashboard/settings/integrations?error=session_mismatch&provider=hubspot",
                  request.url,
                ),
              ),
            ];
          }
          oauthHandler = new hubspot_handler_1.HubSpotOAuthHandler();
          return [4 /*yield*/, oauthHandler.exchangeCodeForTokens(code, state)];
        case 5:
          encryptedToken = _f.sent();
          return [4 /*yield*/, oauthHandler.getUserInfo(encryptedToken.encryptedData)];
        case 6:
          userInfo = _f.sent();
          return [4 /*yield*/, oauthHandler.getPortalInfo(encryptedToken.encryptedData)];
        case 7:
          portalInfo = _f.sent();
          return [4 /*yield*/, oauthHandler.getAccountInfo(encryptedToken.encryptedData)];
        case 8:
          accountInfo = _f.sent();
          connectionData = {
            profile_id: userId,
            platform_type: "hubspot",
            platform_user_id:
              ((_e = userInfo.user_id) === null || _e === void 0 ? void 0 : _e.toString()) ||
              userInfo.user,
            platform_username: portalInfo.domain || accountInfo.domain,
            encrypted_token: encryptedToken.encryptedData,
            token_expires_at: encryptedToken.expiresAt,
            scopes: [
              "crm.objects.contacts.read",
              "crm.objects.contacts.write",
              "crm.objects.companies.read",
              "crm.objects.companies.write",
              "marketing-events.read",
              "marketing-events.write",
              "automation.read",
              "forms.read",
              "oauth.read",
            ],
            status: "connected",
            connected_at: new Date().toISOString(),
            platform_data: {
              userInfo: userInfo,
              portalInfo: portalInfo,
              accountInfo: {
                portalId: accountInfo.portalId,
                domain: accountInfo.domain,
                currencyCode: accountInfo.currencyCode,
                timeZone: accountInfo.timeZone,
              },
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
        case 9:
          (_c = _f.sent()), (connection = _c.data), (connectionError = _c.error);
          if (connectionError) {
            logger_1.Logger.error("Failed to save HubSpot connection", {
              requestId: requestId,
              provider: "hubspot",
              userId: userId,
              error: connectionError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.redirect(
                new URL(
                  "/dashboard/settings/integrations?error=save_failed&provider=hubspot",
                  request.url,
                ),
              ),
            ];
          }
          // Clean up OAuth state
          return [4 /*yield*/, supabase.from("oauth_states").delete().eq("state", state)];
        case 10:
          // Clean up OAuth state
          _f.sent();
          // Log successful connection
          return [
            4 /*yield*/,
            supabase.from("oauth_audit_log").insert({
              profile_id: userId,
              provider: "hubspot",
              action: "connection_completed",
              request_id: requestId,
              ip_address:
                request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
              user_agent: request.headers.get("user-agent"),
              details: {
                connectionId: connection.id,
                platformUserId: userInfo.user_id || userInfo.user,
                portalId: portalInfo.portalId,
                domain: portalInfo.domain,
              },
            }),
          ];
        case 11:
          // Log successful connection
          _f.sent();
          logger_1.Logger.info("HubSpot OAuth connection successful", {
            requestId: requestId,
            provider: "hubspot",
            userId: userId,
            connectionId: connection.id,
            platformUserId: userInfo.user_id || userInfo.user,
            portalId: portalInfo.portalId,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.redirect(
              new URL("/dashboard/settings/integrations?success=hubspot_connected", request.url),
            ),
          ];
        case 12:
          error_1 = _f.sent();
          logger_1.Logger.error("HubSpot OAuth callback error", {
            requestId: requestId,
            provider: "hubspot",
            error: error_1 instanceof Error ? error_1.message : "Unknown error",
            stack: error_1 instanceof Error ? error_1.stack : undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.redirect(
              new URL(
                "/dashboard/settings/integrations?error=callback_failed&provider=hubspot&requestId=".concat(
                  requestId,
                ),
                request.url,
              ),
            ),
          ];
        case 13:
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
