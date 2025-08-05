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
exports.GET = GET;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var whatsapp_handler_1 = require("@/lib/oauth/platforms/whatsapp-handler");
var logger_1 = require("@/lib/logger");
var crypto_1 = require("crypto");
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var requestId,
      supabase,
      _a,
      session,
      sessionError,
      _b,
      connection,
      connectionError,
      tokenExpiresAt,
      now,
      timeUntilExpiry,
      hoursUntilExpiry,
      oauthHandler,
      newEncryptedToken,
      updateError,
      error_1;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          requestId = (0, crypto_1.randomBytes)(16).toString("hex");
          _c.label = 1;
        case 1:
          _c.trys.push([1, 8, , 9]);
          logger_1.Logger.info("WhatsApp OAuth token refresh request initiated", {
            requestId: requestId,
            provider: "whatsapp",
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          });
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 2:
          supabase = _c.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 3:
          (_a = _c.sent()), (session = _a.data.session), (sessionError = _a.error);
          if (sessionError || !(session === null || session === void 0 ? void 0 : session.user)) {
            logger_1.Logger.warn("WhatsApp OAuth token refresh attempted without valid session", {
              requestId: requestId,
              provider: "whatsapp",
              error:
                sessionError === null || sessionError === void 0 ? void 0 : sessionError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Authentication required" }, { status: 401 }),
            ];
          }
          return [
            4 /*yield*/,
            supabase
              .from("marketing_platform_connections")
              .select("id, encrypted_token, token_expires_at, status")
              .eq("profile_id", session.user.id)
              .eq("platform_type", "whatsapp")
              .single(),
          ];
        case 4:
          (_b = _c.sent()), (connection = _b.data), (connectionError = _b.error);
          if (connectionError || !connection) {
            logger_1.Logger.error("WhatsApp connection not found for token refresh", {
              requestId: requestId,
              provider: "whatsapp",
              userId: session.user.id,
              error:
                connectionError === null || connectionError === void 0
                  ? void 0
                  : connectionError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "WhatsApp connection not found" },
                { status: 404 },
              ),
            ];
          }
          if (connection.status !== "connected") {
            logger_1.Logger.warn("Attempted to refresh token for disconnected WhatsApp account", {
              requestId: requestId,
              provider: "whatsapp",
              userId: session.user.id,
              connectionId: connection.id,
              status: connection.status,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "WhatsApp account not connected" },
                { status: 400 },
              ),
            ];
          }
          tokenExpiresAt = new Date(connection.token_expires_at);
          now = new Date();
          timeUntilExpiry = tokenExpiresAt.getTime() - now.getTime();
          hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
          if (hoursUntilExpiry > 24) {
            logger_1.Logger.info("WhatsApp token still valid, refresh not needed", {
              requestId: requestId,
              provider: "whatsapp",
              userId: session.user.id,
              connectionId: connection.id,
              expiresAt: tokenExpiresAt,
              hoursUntilExpiry: Math.round(hoursUntilExpiry),
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json({
                message: "Token still valid",
                expiresAt: tokenExpiresAt,
                hoursUntilExpiry: Math.round(hoursUntilExpiry),
              }),
            ];
          }
          oauthHandler = new whatsapp_handler_1.WhatsAppOAuthHandler();
          return [4 /*yield*/, oauthHandler.refreshToken(connection.encrypted_token)];
        case 5:
          newEncryptedToken = _c.sent();
          return [
            4 /*yield*/,
            supabase
              .from("marketing_platform_connections")
              .update({
                encrypted_token: newEncryptedToken.encryptedData,
                token_expires_at: newEncryptedToken.expiresAt,
                updated_at: new Date().toISOString(),
              })
              .eq("id", connection.id),
          ];
        case 6:
          updateError = _c.sent().error;
          if (updateError) {
            logger_1.Logger.error("Failed to update WhatsApp connection with refreshed token", {
              requestId: requestId,
              provider: "whatsapp",
              userId: session.user.id,
              connectionId: connection.id,
              error: updateError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to save refreshed token" },
                { status: 500 },
              ),
            ];
          }
          // Log token refresh
          return [
            4 /*yield*/,
            supabase.from("oauth_audit_log").insert({
              profile_id: session.user.id,
              provider: "whatsapp",
              action: "token_refreshed",
              request_id: requestId,
              ip_address:
                request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
              user_agent: request.headers.get("user-agent"),
              details: {
                connectionId: connection.id,
                oldExpiresAt: connection.token_expires_at,
                newExpiresAt: newEncryptedToken.expiresAt,
              },
            }),
          ];
        case 7:
          // Log token refresh
          _c.sent();
          logger_1.Logger.info("WhatsApp OAuth token refresh successful", {
            requestId: requestId,
            provider: "whatsapp",
            userId: session.user.id,
            connectionId: connection.id,
            newExpiresAt: newEncryptedToken.expiresAt,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "Token refreshed successfully",
              expiresAt: newEncryptedToken.expiresAt,
              connectionId: connection.id,
            }),
          ];
        case 8:
          error_1 = _c.sent();
          logger_1.Logger.error("WhatsApp OAuth token refresh error", {
            requestId: requestId,
            provider: "whatsapp",
            error: error_1 instanceof Error ? error_1.message : "Unknown error",
            stack: error_1 instanceof Error ? error_1.stack : undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to refresh WhatsApp token",
                requestId: requestId,
              },
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
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        server_1.NextResponse.json({ error: "Method not allowed" }, { status: 405 }),
      ];
    });
  });
}
