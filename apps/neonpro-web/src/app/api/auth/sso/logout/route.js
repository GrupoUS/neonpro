"use strict";
// SSO Logout Route
// Story 1.3: SSO Integration - Session Termination & Token Revocation
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var sso_manager_1 = require("@/lib/auth/sso/sso-manager");
var logger_1 = require("@/lib/logger");
var zod_1 = require("zod");
var logoutSchema = zod_1.z.object({
  redirect_to: zod_1.z.string().url().optional(),
  revoke_tokens: zod_1.z
    .string()
    .transform(function (val) {
      return val === "true";
    })
    .optional(),
  global_logout: zod_1.z
    .string()
    .transform(function (val) {
      return val === "true";
    })
    .optional(),
});
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var sessionCookie,
      userCookie,
      logoutOptions,
      body,
      validationResult,
      _a,
      searchParams,
      queryValidation,
      redirect_to,
      _b,
      revoke_tokens,
      _c,
      global_logout,
      sessionId,
      provider,
      userId,
      userData,
      error_1,
      cookieOptions,
      redirectUrl,
      redirectUrlObj,
      finalUrl,
      error_2;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 9, , 10]);
          sessionCookie = cookieStore.get("sso_session");
          userCookie = cookieStore.get("sso_user");
          logoutOptions = {};
          _d.label = 1;
        case 1:
          _d.trys.push([1, 3, , 4]);
          return [4 /*yield*/, request.json()];
        case 2:
          body = _d.sent();
          validationResult = logoutSchema.safeParse(body);
          if (validationResult.success) {
            logoutOptions = validationResult.data;
          }
          return [3 /*break*/, 4];
        case 3:
          _a = _d.sent();
          return [3 /*break*/, 4];
        case 4:
          searchParams = new URL(request.url).searchParams;
          queryValidation = logoutSchema.safeParse({
            redirect_to: searchParams.get("redirect_to"),
            revoke_tokens: searchParams.get("revoke_tokens"),
            global_logout: searchParams.get("global_logout"),
          });
          if (queryValidation.success) {
            logoutOptions = __assign(__assign({}, logoutOptions), queryValidation.data);
          }
          (redirect_to = logoutOptions.redirect_to),
            (_b = logoutOptions.revoke_tokens),
            (revoke_tokens = _b === void 0 ? true : _b),
            (_c = logoutOptions.global_logout),
            (global_logout = _c === void 0 ? false : _c);
          sessionId = null;
          provider = null;
          userId = null;
          // Extract session information
          if (sessionCookie) {
            sessionId = sessionCookie.value;
          }
          if (userCookie) {
            try {
              userData = JSON.parse(userCookie.value);
              provider = userData.provider;
              userId = userData.id;
            } catch (error) {
              logger_1.logger.warn("SSO logout: Failed to parse user cookie", {
                error: error.message,
              });
            }
          }
          if (!sessionId) return [3 /*break*/, 8];
          _d.label = 5;
        case 5:
          _d.trys.push([5, 7, , 8]);
          return [
            4 /*yield*/,
            sso_manager_1.ssoManager.logout(sessionId, {
              revokeTokens: revoke_tokens,
              globalLogout: global_logout,
            }),
          ];
        case 6:
          _d.sent();
          logger_1.logger.info("SSO logout: Session terminated successfully", {
            sessionId: sessionId,
            provider: provider,
            userId: userId,
            revokeTokens: revoke_tokens,
            globalLogout: global_logout,
          });
          return [3 /*break*/, 8];
        case 7:
          error_1 = _d.sent();
          logger_1.logger.error("SSO logout: Failed to terminate session", {
            sessionId: sessionId,
            provider: provider,
            error: error_1.message,
          });
          return [3 /*break*/, 8];
        case 8:
          cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0, // Expire immediately
          };
          cookieStore.set("sso_session", "", cookieOptions);
          cookieStore.set(
            "sso_user",
            "",
            __assign(__assign({}, cookieOptions), { httpOnly: false }),
          );
          // Also clear any other auth-related cookies
          cookieStore.set("auth_token", "", cookieOptions);
          cookieStore.set("refresh_token", "", cookieOptions);
          cookieStore.set("user_session", "", cookieOptions);
          logger_1.logger.info("SSO logout: Cookies cleared successfully", {
            provider: provider,
            userId: userId,
          });
          redirectUrl = "/auth/login";
          if (redirect_to) {
            try {
              redirectUrlObj = new URL(redirect_to, request.url);
              if (redirectUrlObj.origin === new URL(request.url).origin) {
                redirectUrl = redirect_to;
              }
            } catch (error) {
              logger_1.logger.warn("SSO logout: Invalid redirect URL", {
                redirect_to: redirect_to,
                error: error.message,
              });
            }
          }
          finalUrl = new URL(redirectUrl, request.url);
          finalUrl.searchParams.set("logout", "success");
          if (provider) {
            finalUrl.searchParams.set("provider", provider);
          }
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              success: true,
              message: "Logout successful",
              redirectUrl: finalUrl.toString(),
              provider: provider,
            }),
          ];
        case 9:
          error_2 = _d.sent();
          logger_1.logger.error("SSO logout: Unexpected error", {
            error: error_2.message,
            stack: error_2.stack,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "LOGOUT_FAILED",
                message: "Failed to complete logout",
                details: process.env.NODE_ENV === "development" ? error_2.message : undefined,
              },
              { status: 500 },
            ),
          ];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
// Support GET for simple logout links
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [2 /*return*/, POST(request)];
    });
  });
}
// Handle unsupported methods
function PUT() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        server_1.NextResponse.json(
          { error: "METHOD_NOT_ALLOWED", message: "PUT method not allowed" },
          { status: 405 },
        ),
      ];
    });
  });
}
function DELETE() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        server_1.NextResponse.json(
          { error: "METHOD_NOT_ALLOWED", message: "DELETE method not allowed" },
          { status: 405 },
        ),
      ];
    });
  });
}
