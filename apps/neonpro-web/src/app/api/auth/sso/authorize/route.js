"use strict";
// SSO Authorization Route
// Story 1.3: SSO Integration - Authorization URL Generation
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
var authorizeSchema = zod_1.z.object({
  provider: zod_1.z.string().min(1, "Provider is required"),
  redirect_to: zod_1.z.string().url().optional(),
  login_hint: zod_1.z.string().email().optional(),
  domain_hint: zod_1.z.string().optional(),
  prompt: zod_1.z.enum(["none", "consent", "select_account", "login"]).optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams,
      validationResult,
      _a,
      providerId_1,
      redirect_to,
      login_hint,
      domain_hint,
      prompt_1,
      availableProviders,
      provider,
      authUrl,
      error_1;
    var _b;
    return __generator(this, function (_c) {
      switch (_c.label) {
        case 0:
          _c.trys.push([0, 2, , 3]);
          searchParams = new URL(request.url).searchParams;
          validationResult = authorizeSchema.safeParse({
            provider: searchParams.get("provider"),
            redirect_to: searchParams.get("redirect_to"),
            login_hint: searchParams.get("login_hint"),
            domain_hint: searchParams.get("domain_hint"),
            prompt: searchParams.get("prompt"),
          });
          if (!validationResult.success) {
            logger_1.logger.warn("SSO authorize: Invalid parameters", {
              errors: validationResult.error.errors,
              params: Object.fromEntries(searchParams.entries()),
            });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "INVALID_PARAMETERS",
                  message: "Invalid request parameters",
                  details: validationResult.error.errors,
                },
                { status: 400 },
              ),
            ];
          }
          (_a = validationResult.data),
            (providerId_1 = _a.provider),
            (redirect_to = _a.redirect_to),
            (login_hint = _a.login_hint),
            (domain_hint = _a.domain_hint),
            (prompt_1 = _a.prompt);
          availableProviders = sso_manager_1.ssoManager.getAvailableProviders();
          provider = availableProviders.find(function (p) {
            return p.id === providerId_1;
          });
          if (!provider) {
            logger_1.logger.warn("SSO authorize: Provider not found", { providerId: providerId_1 });
            return [
              2 /*return*/,
              server_1.NextResponse.json(
                {
                  error: "PROVIDER_NOT_FOUND",
                  message: "SSO provider '".concat(providerId_1, "' not found or disabled"),
                },
                { status: 404 },
              ),
            ];
          }
          return [
            4 /*yield*/,
            sso_manager_1.ssoManager.generateAuthUrl(providerId_1, {
              redirectUri: provider.config.redirectUri,
              scopes: provider.config.scopes,
              loginHint: login_hint,
              domainHint: domain_hint,
              prompt: prompt_1,
              // Store redirect destination in state for later use
              state: redirect_to
                ? "redirect_to=".concat(encodeURIComponent(redirect_to))
                : undefined,
            }),
          ];
        case 1:
          authUrl = _c.sent();
          logger_1.logger.info("SSO authorize: Generated auth URL", {
            providerId: providerId_1,
            hasRedirectTo: !!redirect_to,
            hasLoginHint: !!login_hint,
            hasDomainHint: !!domain_hint,
            prompt: prompt_1,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json({
              authUrl: authUrl,
              provider: {
                id: provider.id,
                name: provider.name,
                displayName:
                  ((_b = provider.metadata) === null || _b === void 0 ? void 0 : _b.displayName) ||
                  provider.name,
              },
            }),
          ];
        case 2:
          error_1 = _c.sent();
          logger_1.logger.error("SSO authorize: Failed to generate auth URL", {
            error: error_1.message,
            stack: error_1.stack,
          });
          return [
            2 /*return*/,
            server_1.NextResponse.json(
              {
                error: "AUTHORIZATION_FAILED",
                message: "Failed to generate authorization URL",
                details: process.env.NODE_ENV === "development" ? error_1.message : undefined,
              },
              { status: 500 },
            ),
          ];
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
