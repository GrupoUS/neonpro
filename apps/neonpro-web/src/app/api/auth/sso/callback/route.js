"use strict";
// SSO Callback Route
// Story 1.3: SSO Integration - OAuth Callback Processing
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
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var sso_manager_1 = require("@/lib/auth/sso/sso-manager");
var logger_1 = require("@/lib/logger");
var zod_1 = require("zod");
var callbackSchema = zod_1.z.object({
  code: zod_1.z.string().min(1, "Authorization code is required"),
  state: zod_1.z.string().optional(),
  provider: zod_1.z.string().min(1, "Provider is required"),
  error: zod_1.z.string().optional(),
  error_description: zod_1.z.string().optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      error,
      errorDescription,
      loginUrl,
      validationResult,
      loginUrl,
      _a,
      code,
      state,
      providerId,
      result,
      loginUrl,
      redirectUrl,
      stateParams,
      redirectTo,
      redirectUrlObj,
      finalUrl,
      error_1,
      loginUrl;
    var _b, _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
      switch (_h.label) {
        case 0:
          _h.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          error = searchParams.get("error");
          if (error) {
            errorDescription = searchParams.get("error_description");
            logger_1.logger.warn("SSO callback: OAuth error received", {
              error: error,
              errorDescription: errorDescription,
              provider: searchParams.get("provider"),
            });
            loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("error", "sso_failed");
            loginUrl.searchParams.set("message", errorDescription || "SSO authentication failed");
            return [2 /*return*/, server_1.NextResponse.redirect(loginUrl)];
          }
          validationResult = callbackSchema.safeParse({
            code: searchParams.get("code"),
            state: searchParams.get("state"),
            provider: searchParams.get("provider"),
            error: searchParams.get("error"),
            error_description: searchParams.get("error_description"),
          });
          if (!validationResult.success) {
            logger_1.logger.warn("SSO callback: Invalid parameters", {
              errors: validationResult.error.errors,
              params: Object.fromEntries(searchParams.entries()),
            });
            loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("error", "invalid_callback");
            loginUrl.searchParams.set("message", "Invalid callback parameters");
            return [2 /*return*/, server_1.NextResponse.redirect(loginUrl)];
          }
          (_a = validationResult.data),
            (code = _a.code),
            (state = _a.state),
            (providerId = _a.provider);
          return [
            4 /*yield*/,
            sso_manager_1.ssoManager.handleCallback(providerId, {
              code: code,
              state: state,
            }),
          ];
        case 1:
          result = _h.sent();
          if (!result.success) {
            logger_1.logger.error("SSO callback: Authentication failed", {
              providerId: providerId,
              error: result.error,
            });
            loginUrl = new URL("/auth/login", request.url);
            loginUrl.searchParams.set("error", "auth_failed");
            loginUrl.searchParams.set(
              "message",
              ((_b = result.error) === null || _b === void 0 ? void 0 : _b.message) ||
                "Authentication failed",
            );
            return [2 /*return*/, server_1.NextResponse.redirect(loginUrl)];
          }
          // Set session cookies
          // Cookie instantiation moved inside request handlers;
          if (result.session) {
            // Set session cookie
            cookieStore.set("sso_session", result.session.id, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: result.session.expiresAt
                ? Math.floor((new Date(result.session.expiresAt).getTime() - Date.now()) / 1000)
                : 60 * 60 * 24 * 7, // 7 days default
              path: "/",
            });
            // Set user info cookie (non-sensitive data only)
            cookieStore.set(
              "sso_user",
              JSON.stringify({
                id: (_c = result.user) === null || _c === void 0 ? void 0 : _c.id,
                email: (_d = result.user) === null || _d === void 0 ? void 0 : _d.email,
                name: (_e = result.user) === null || _e === void 0 ? void 0 : _e.name,
                provider: providerId,
              }),
              {
                httpOnly: false, // Accessible to client-side
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: "/",
              },
            );
          }
          logger_1.logger.info("SSO callback: Authentication successful", {
            providerId: providerId,
            userId: (_f = result.user) === null || _f === void 0 ? void 0 : _f.id,
            email: (_g = result.user) === null || _g === void 0 ? void 0 : _g.email,
            isNewUser: result.isNewUser,
          });
          redirectUrl = "/dashboard";
          if (state) {
            try {
              stateParams = new URLSearchParams(state);
              redirectTo = stateParams.get("redirect_to");
              if (redirectTo) {
                redirectUrlObj = new URL(redirectTo, request.url);
                if (redirectUrlObj.origin === new URL(request.url).origin) {
                  redirectUrl = redirectTo;
                }
              }
            } catch (error) {
              logger_1.logger.warn("SSO callback: Invalid state parameter", {
                state: state,
                error: error.message,
              });
            }
          }
          finalUrl = new URL(redirectUrl, request.url);
          if (result.isNewUser) {
            finalUrl.searchParams.set("welcome", "true");
          }
          finalUrl.searchParams.set("sso_success", "true");
          return [2 /*return*/, server_1.NextResponse.redirect(finalUrl)];
        case 2:
          error_1 = _h.sent();
          logger_1.logger.error("SSO callback: Unexpected error", {
            error: error_1.message,
            stack: error_1.stack,
          });
          loginUrl = new URL("/auth/login", request.url);
          loginUrl.searchParams.set("error", "server_error");
          loginUrl.searchParams.set("message", "An unexpected error occurred");
          return [2 /*return*/, server_1.NextResponse.redirect(loginUrl)];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle unsupported methods
function POST() {
  return __awaiter(this, void 0, void 0, function () {
    return __generator(this, function (_a) {
      return [
        2 /*return*/,
        server_1.NextResponse.json(
          { error: "METHOD_NOT_ALLOWED", message: "POST method not allowed" },
          { status: 405 },
        ),
      ];
    });
  });
}
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
