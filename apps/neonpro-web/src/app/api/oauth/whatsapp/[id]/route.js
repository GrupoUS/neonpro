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
exports.DELETE = DELETE;
exports.POST = POST;
exports.PUT = PUT;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var whatsapp_handler_1 = require("@/lib/oauth/platforms/whatsapp-handler");
var logger_1 = require("@/lib/logger");
var crypto_1 = require("crypto");
function GET(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var requestId,
      id,
      connectionId,
      supabase,
      _c,
      session,
      sessionError,
      _d,
      connection,
      connectionError,
      tokenExpiresAt,
      now,
      isTokenExpired,
      hoursUntilExpiry,
      error_1;
    var params = _b.params;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          requestId = (0, crypto_1.randomBytes)(16).toString("hex");
          return [4 /*yield*/, params];
        case 1:
          id = _e.sent().id;
          connectionId = id;
          _e.label = 2;
        case 2:
          _e.trys.push([2, 6, , 7]);
          logger_1.Logger.info("WhatsApp connection details request initiated", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          });
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 3:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 4:
          (_c = _e.sent()), (session = _c.data.session), (sessionError = _c.error);
          if (sessionError || !(session === null || session === void 0 ? void 0 : session.user)) {
            logger_1.Logger.warn("WhatsApp connection details request without valid session", {
              requestId: requestId,
              provider: "whatsapp",
              connectionId: connectionId,
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
              .select(
                "id, platform_type, platform_user_id, platform_username, status, connected_at, token_expires_at, scopes, platform_data",
              )
              .eq("id", connectionId)
              .eq("profile_id", session.user.id)
              .eq("platform_type", "whatsapp")
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (connection = _d.data), (connectionError = _d.error);
          if (connectionError || !connection) {
            logger_1.Logger.error("WhatsApp connection not found", {
              requestId: requestId,
              provider: "whatsapp",
              connectionId: connectionId,
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
          tokenExpiresAt = new Date(connection.token_expires_at);
          now = new Date();
          isTokenExpired = tokenExpiresAt < now;
          hoursUntilExpiry = Math.round(
            (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60),
          );
          logger_1.Logger.info("WhatsApp connection details retrieved successfully", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            userId: session.user.id,
            status: connection.status,
            isTokenExpired: isTokenExpired,
            hoursUntilExpiry: hoursUntilExpiry,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              id: connection.id,
              provider: "whatsapp",
              platformUserId: connection.platform_user_id,
              platformUsername: connection.platform_username,
              status: connection.status,
              connectedAt: connection.connected_at,
              tokenExpiresAt: connection.token_expires_at,
              isTokenExpired: isTokenExpired,
              hoursUntilExpiry: isTokenExpired ? 0 : Math.max(0, hoursUntilExpiry),
              scopes: connection.scopes,
              platformData: connection.platform_data,
            }),
          ];
        case 6:
          error_1 = _e.sent();
          logger_1.Logger.error("WhatsApp connection details error", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            error: error_1 instanceof Error ? error_1.message : "Unknown error",
            stack: error_1 instanceof Error ? error_1.stack : undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to retrieve WhatsApp connection details",
                requestId: requestId,
              },
              { status: 500 },
            ),
          ];
        case 7:
          return [2 /*return*/];
      }
    });
  });
}
function DELETE(request_1, _a) {
  return __awaiter(this, arguments, void 0, function (request, _b) {
    var requestId,
      id,
      connectionId,
      supabase,
      _c,
      session,
      sessionError,
      _d,
      connection,
      connectionError,
      oauthHandler,
      revokeError_1,
      updateError,
      error_2;
    var params = _b.params;
    return __generator(this, (_e) => {
      switch (_e.label) {
        case 0:
          requestId = (0, crypto_1.randomBytes)(16).toString("hex");
          return [4 /*yield*/, params];
        case 1:
          id = _e.sent().id;
          connectionId = id;
          _e.label = 2;
        case 2:
          _e.trys.push([2, 12, , 13]);
          logger_1.Logger.info("WhatsApp connection disconnection request initiated", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            userAgent: request.headers.get("user-agent"),
            ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          });
          return [4 /*yield*/, (0, server_2.createClient)()];
        case 3:
          supabase = _e.sent();
          return [4 /*yield*/, supabase.auth.getSession()];
        case 4:
          (_c = _e.sent()), (session = _c.data.session), (sessionError = _c.error);
          if (sessionError || !(session === null || session === void 0 ? void 0 : session.user)) {
            logger_1.Logger.warn("WhatsApp disconnection request without valid session", {
              requestId: requestId,
              provider: "whatsapp",
              connectionId: connectionId,
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
              .select("id, encrypted_token, status")
              .eq("id", connectionId)
              .eq("profile_id", session.user.id)
              .eq("platform_type", "whatsapp")
              .single(),
          ];
        case 5:
          (_d = _e.sent()), (connection = _d.data), (connectionError = _d.error);
          if (connectionError || !connection) {
            logger_1.Logger.error("WhatsApp connection not found for disconnection", {
              requestId: requestId,
              provider: "whatsapp",
              connectionId: connectionId,
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
          _e.label = 6;
        case 6:
          _e.trys.push([6, 8, , 9]);
          oauthHandler = new whatsapp_handler_1.WhatsAppOAuthHandler();
          return [4 /*yield*/, oauthHandler.revokeToken(connection.encrypted_token)];
        case 7:
          _e.sent();
          return [3 /*break*/, 9];
        case 8:
          revokeError_1 = _e.sent();
          logger_1.Logger.warn("Failed to revoke WhatsApp token, continuing with disconnection", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            error: revokeError_1 instanceof Error ? revokeError_1.message : "Unknown error",
          });
          return [3 /*break*/, 9];
        case 9:
          return [
            4 /*yield*/,
            supabase
              .from("marketing_platform_connections")
              .update({
                status: "disconnected",
                disconnected_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", connectionId),
          ];
        case 10:
          updateError = _e.sent().error;
          if (updateError) {
            logger_1.Logger.error("Failed to update WhatsApp connection status", {
              requestId: requestId,
              provider: "whatsapp",
              connectionId: connectionId,
              error: updateError.message,
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                { error: "Failed to disconnect WhatsApp account" },
                { status: 500 },
              ),
            ];
          }
          // Log disconnection
          return [
            4 /*yield*/,
            supabase.from("oauth_audit_log").insert({
              profile_id: session.user.id,
              provider: "whatsapp",
              action: "connection_disconnected",
              request_id: requestId,
              ip_address:
                request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
              user_agent: request.headers.get("user-agent"),
              details: {
                connectionId: connectionId,
              },
            }),
          ];
        case 11:
          // Log disconnection
          _e.sent();
          logger_1.Logger.info("WhatsApp disconnection successful", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            userId: session.user.id,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              message: "WhatsApp account disconnected successfully",
              connectionId: connectionId,
            }),
          ];
        case 12:
          error_2 = _e.sent();
          logger_1.Logger.error("WhatsApp disconnection error", {
            requestId: requestId,
            provider: "whatsapp",
            connectionId: connectionId,
            error: error_2 instanceof Error ? error_2.message : "Unknown error",
            stack: error_2 instanceof Error ? error_2.stack : undefined,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "Failed to disconnect WhatsApp account",
                requestId: requestId,
              },
              { status: 500 },
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
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json({ error: "Method not allowed" }, { status: 405 }),
    ]);
  });
}
function PUT(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, (_a) => [
      2 /*return*/,
      server_1.NextResponse.json({ error: "Method not allowed" }, { status: 405 }),
    ]);
  });
}
