"use strict";
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : ((__.prototype = b.prototype), new __());
    };
  })();
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
exports.HubSpotOAuthHandler = void 0;
var base_oauth_handler_1 = require("../base-oauth-handler");
var HubSpotOAuthHandler = /** @class */ (function (_super) {
  __extends(HubSpotOAuthHandler, _super);
  function HubSpotOAuthHandler() {
    var _this = _super.call(this) || this;
    _this.config = {
      provider: "hubspot",
      clientId: process.env.HUBSPOT_CLIENT_ID || "",
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || "",
      redirectUri: process.env.HUBSPOT_REDIRECT_URI || "",
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
      authorizationUrl: "https://app.hubspot.com/oauth/authorize",
      tokenUrl: "https://api.hubapi.com/oauth/v1/token",
      userInfoUrl: "https://api.hubapi.com/oauth/v1/access-tokens",
      revokeUrl: "https://api.hubapi.com/oauth/v1/refresh-tokens",
    };
    _this.validateConfig();
    return _this;
  }
  HubSpotOAuthHandler.prototype.validateConfig = function () {
    var _this = this;
    var requiredFields = ["clientId", "clientSecret", "redirectUri"];
    var missing = requiredFields.filter(function (field) {
      return !_this.config[field];
    });
    if (missing.length > 0) {
      throw new Error("Missing required HubSpot OAuth configuration: ".concat(missing.join(", ")));
    }
  };
  HubSpotOAuthHandler.prototype.getAuthorizationUrl = function (state) {
    return __awaiter(this, void 0, void 0, function () {
      var params, authUrl;
      return __generator(this, function (_a) {
        try {
          params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(" "),
            response_type: "code",
            state: state,
            access_type: "offline",
          });
          authUrl = "".concat(this.config.authorizationUrl, "?").concat(params.toString());
          Logger.info("Generated HubSpot authorization URL", {
            provider: "hubspot",
            state: state,
            scopes: this.config.scopes,
          });
          return [2 /*return*/, authUrl];
        } catch (error) {
          Logger.error("Failed to generate HubSpot authorization URL", { error: error });
          throw new Error("Unable to generate authorization URL");
        }
        return [2 /*return*/];
      });
    });
  };
  HubSpotOAuthHandler.prototype.exchangeCodeForTokens = function (code, state) {
    return __awaiter(this, void 0, void 0, function () {
      var response, errorData, tokenData, expiresAt, encryptedToken, error_1;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [
              4 /*yield*/,
              fetch(this.config.tokenUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
                body: new URLSearchParams({
                  client_id: this.config.clientId,
                  client_secret: this.config.clientSecret,
                  code: code,
                  redirect_uri: this.config.redirectUri,
                  grant_type: "authorization_code",
                }),
              }),
            ];
          case 1:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 3];
            return [4 /*yield*/, response.text()];
          case 2:
            errorData = _a.sent();
            Logger.error("HubSpot token exchange failed", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(
              "Token exchange failed: ".concat(response.status, " ").concat(response.statusText),
            );
          case 3:
            return [4 /*yield*/, response.json()];
          case 4:
            tokenData = _a.sent();
            expiresAt = tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000)
              : new Date(Date.now() + 30 * 60 * 1000);
            return [
              4 /*yield*/,
              this.encryptToken({
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || null,
                expiresAt: expiresAt,
                scopes: this.config.scopes,
                tokenType: tokenData.token_type || "Bearer",
              }),
            ];
          case 5:
            encryptedToken = _a.sent();
            Logger.info("HubSpot token exchange successful", {
              provider: "hubspot",
              hasRefreshToken: !!tokenData.refresh_token,
              expiresAt: expiresAt,
            });
            return [2 /*return*/, encryptedToken];
          case 6:
            error_1 = _a.sent();
            Logger.error("HubSpot token exchange error", { error: error_1 });
            throw error_1 instanceof Error ? error_1 : new Error("Token exchange failed");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.refreshToken = function (encryptedRefreshToken) {
    return __awaiter(this, void 0, void 0, function () {
      var refreshToken, response, errorData, tokenData, expiresAt, encryptedToken, error_2;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 7, , 8]);
            return [4 /*yield*/, this.decryptToken(encryptedRefreshToken)];
          case 1:
            refreshToken = _a.sent();
            if (!refreshToken.refreshToken) {
              throw new Error("No refresh token available");
            }
            return [
              4 /*yield*/,
              fetch(this.config.tokenUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
                body: new URLSearchParams({
                  client_id: this.config.clientId,
                  client_secret: this.config.clientSecret,
                  refresh_token: refreshToken.refreshToken,
                  grant_type: "refresh_token",
                }),
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.text()];
          case 3:
            errorData = _a.sent();
            Logger.error("HubSpot token refresh failed", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(
              "Token refresh failed: ".concat(response.status, " ").concat(response.statusText),
            );
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            tokenData = _a.sent();
            expiresAt = tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000)
              : new Date(Date.now() + 30 * 60 * 1000);
            return [
              4 /*yield*/,
              this.encryptToken({
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token || refreshToken.refreshToken,
                expiresAt: expiresAt,
                scopes: this.config.scopes,
                tokenType: tokenData.token_type || "Bearer",
              }),
            ];
          case 6:
            encryptedToken = _a.sent();
            Logger.info("HubSpot token refresh successful", {
              provider: "hubspot",
              expiresAt: expiresAt,
            });
            return [2 /*return*/, encryptedToken];
          case 7:
            error_2 = _a.sent();
            Logger.error("HubSpot token refresh error", { error: error_2 });
            throw error_2 instanceof Error ? error_2 : new Error("Token refresh failed");
          case 8:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.revokeToken = function (encryptedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var token, error_3;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.decryptToken(encryptedToken)];
          case 1:
            token = _a.sent();
            if (!token.refreshToken) return [3 /*break*/, 3];
            return [
              4 /*yield*/,
              fetch("".concat(this.config.revokeUrl, "/").concat(token.refreshToken), {
                method: "DELETE",
                headers: {
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
              }),
            ];
          case 2:
            _a.sent();
            _a.label = 3;
          case 3:
            Logger.info("HubSpot token revocation successful", {
              provider: "hubspot",
            });
            return [3 /*break*/, 5];
          case 4:
            error_3 = _a.sent();
            Logger.error("HubSpot token revocation error", { error: error_3 });
            throw error_3 instanceof Error ? error_3 : new Error("Token revocation failed");
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.getUserInfo = function (encryptedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var token, response, errorData, userInfo, error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.decryptToken(encryptedToken)];
          case 1:
            token = _a.sent();
            return [
              4 /*yield*/,
              fetch("".concat(this.config.userInfoUrl, "/").concat(token.accessToken), {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.text()];
          case 3:
            errorData = _a.sent();
            Logger.error("HubSpot user info fetch failed", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(
              "User info fetch failed: ".concat(response.status, " ").concat(response.statusText),
            );
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            userInfo = _a.sent();
            Logger.info("HubSpot user info fetch successful", {
              provider: "hubspot",
              userId: userInfo.user_id,
              hubId: userInfo.hub_id,
            });
            return [2 /*return*/, userInfo];
          case 6:
            error_4 = _a.sent();
            Logger.error("HubSpot user info fetch error", { error: error_4 });
            throw error_4 instanceof Error ? error_4 : new Error("User info fetch failed");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.validateToken = function (encryptedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var token, response, isValid, error_5;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 3, , 4]);
            return [4 /*yield*/, this.decryptToken(encryptedToken)];
          case 1:
            token = _a.sent();
            // Check if token is expired
            if (token.expiresAt && new Date() > token.expiresAt) {
              Logger.warn("HubSpot token is expired", {
                provider: "hubspot",
                expiresAt: token.expiresAt,
              });
              return [2 /*return*/, false];
            }
            return [
              4 /*yield*/,
              fetch("".concat(this.config.userInfoUrl, "/").concat(token.accessToken), {
                method: "GET",
                headers: {
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
              }),
            ];
          case 2:
            response = _a.sent();
            isValid = response.ok;
            Logger.info("HubSpot token validation completed", {
              provider: "hubspot",
              isValid: isValid,
              status: response.status,
            });
            return [2 /*return*/, isValid];
          case 3:
            error_5 = _a.sent();
            Logger.error("HubSpot token validation error", { error: error_5 });
            return [2 /*return*/, false];
          case 4:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.getPortalInfo = function (encryptedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var token, response, errorData, portalInfo, error_6;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.decryptToken(encryptedToken)];
          case 1:
            token = _a.sent();
            return [
              4 /*yield*/,
              fetch("https://api.hubapi.com/integrations/v1/me", {
                method: "GET",
                headers: {
                  Authorization: "Bearer ".concat(token.accessToken),
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.text()];
          case 3:
            errorData = _a.sent();
            Logger.error("HubSpot portal info fetch failed", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(
              "Portal info fetch failed: ".concat(response.status, " ").concat(response.statusText),
            );
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            portalInfo = _a.sent();
            Logger.info("HubSpot portal info fetch successful", {
              provider: "hubspot",
              portalId: portalInfo.portalId,
              domain: portalInfo.domain,
            });
            return [2 /*return*/, portalInfo];
          case 6:
            error_6 = _a.sent();
            Logger.error("HubSpot portal info fetch error", { error: error_6 });
            throw error_6 instanceof Error ? error_6 : new Error("Portal info fetch failed");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  HubSpotOAuthHandler.prototype.getAccountInfo = function (encryptedToken) {
    return __awaiter(this, void 0, void 0, function () {
      var token, response, errorData, accountInfo, error_7;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 6, , 7]);
            return [4 /*yield*/, this.decryptToken(encryptedToken)];
          case 1:
            token = _a.sent();
            return [
              4 /*yield*/,
              fetch("https://api.hubapi.com/account-info/v3/details", {
                method: "GET",
                headers: {
                  Authorization: "Bearer ".concat(token.accessToken),
                  Accept: "application/json",
                  "User-Agent": "NeonPro/1.0",
                },
              }),
            ];
          case 2:
            response = _a.sent();
            if (!!response.ok) return [3 /*break*/, 4];
            return [4 /*yield*/, response.text()];
          case 3:
            errorData = _a.sent();
            Logger.error("HubSpot account info fetch failed", {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
            throw new Error(
              "Account info fetch failed: "
                .concat(response.status, " ")
                .concat(response.statusText),
            );
          case 4:
            return [4 /*yield*/, response.json()];
          case 5:
            accountInfo = _a.sent();
            Logger.info("HubSpot account info fetch successful", {
              provider: "hubspot",
              accountId: accountInfo.portalId,
              currency: accountInfo.currencyCode,
            });
            return [2 /*return*/, accountInfo];
          case 6:
            error_7 = _a.sent();
            Logger.error("HubSpot account info fetch error", { error: error_7 });
            throw error_7 instanceof Error ? error_7 : new Error("Account info fetch failed");
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  return HubSpotOAuthHandler;
})(base_oauth_handler_1.BaseOAuthHandler);
exports.HubSpotOAuthHandler = HubSpotOAuthHandler;
