"use strict";
// SSO Providers Route
// Story 1.3: SSO Integration - Available Providers API
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
var providersQuerySchema = zod_1.z.object({
  domain: zod_1.z.string().optional(),
  enabled_only: zod_1.z
    .string()
    .transform(function (val) {
      return val === "true";
    })
    .optional(),
});
function GET(request) {
  return __awaiter(this, void 0, void 0, function () {
    var searchParams, validationResult, _a, domain, enabled_only, providers, publicProviders;
    return __generator(this, function (_b) {
      try {
        searchParams = new URL(request.url).searchParams;
        validationResult = providersQuerySchema.safeParse({
          domain: searchParams.get("domain"),
          enabled_only: searchParams.get("enabled_only"),
        });
        if (!validationResult.success) {
          logger_1.logger.warn("SSO providers: Invalid parameters", {
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
        (_a = validationResult.data), (domain = _a.domain), (enabled_only = _a.enabled_only);
        providers = void 0;
        if (domain) {
          // Get providers for specific domain
          providers = sso_manager_1.ssoManager.getProvidersByDomain(domain);
          logger_1.logger.info("SSO providers: Retrieved providers for domain", {
            domain: domain,
            providerCount: providers.length,
          });
        } else {
          // Get all available providers
          providers = sso_manager_1.ssoManager.getAvailableProviders();
          logger_1.logger.info("SSO providers: Retrieved all providers", {
            providerCount: providers.length,
          });
        }
        // Filter by enabled status if requested
        if (enabled_only) {
          providers = providers.filter(function (provider) {
            return provider.config.enabled;
          });
        }
        publicProviders = providers.map(function (provider) {
          var _a, _b, _c, _d, _e, _f, _g;
          return {
            id: provider.id,
            name: provider.name,
            type: provider.type,
            enabled: provider.config.enabled,
            displayName:
              ((_a = provider.metadata) === null || _a === void 0 ? void 0 : _a.displayName) ||
              provider.name,
            description:
              (_b = provider.metadata) === null || _b === void 0 ? void 0 : _b.description,
            iconUrl: (_c = provider.metadata) === null || _c === void 0 ? void 0 : _c.iconUrl,
            buttonColor:
              (_d = provider.metadata) === null || _d === void 0 ? void 0 : _d.buttonColor,
            textColor: (_e = provider.metadata) === null || _e === void 0 ? void 0 : _e.textColor,
            supportedDomains:
              (_f = provider.metadata) === null || _f === void 0 ? void 0 : _f.supportedDomains,
            features: {
              supportsRefreshToken: provider.config.supportsRefreshToken,
              supportsIdToken: provider.config.supportsIdToken,
              supportsPKCE: provider.config.supportsPKCE,
            },
            // Only include scopes that are safe to expose
            scopes:
              (_g = provider.config.scopes) === null || _g === void 0
                ? void 0
                : _g.filter(function (scope) {
                    return (
                      !scope.includes("admin") &&
                      !scope.includes("write") &&
                      !scope.includes("delete")
                    );
                  }),
          };
        });
        return [
          2 /*return*/,
          server_1.NextResponse.json({
            providers: publicProviders,
            total: publicProviders.length,
            domain: domain || null,
            enabledOnly: enabled_only || false,
          }),
        ];
      } catch (error) {
        logger_1.logger.error("SSO providers: Failed to retrieve providers", {
          error: error.message,
          stack: error.stack,
        });
        return [
          2 /*return*/,
          server_1.NextResponse.json(
            {
              error: "PROVIDERS_FETCH_FAILED",
              message: "Failed to retrieve SSO providers",
              details: process.env.NODE_ENV === "development" ? error.message : undefined,
            },
            { status: 500 },
          ),
        ];
      }
      return [2 /*return*/];
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
