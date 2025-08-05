var __extends =
  (this && this.__extends) ||
  (() => {
    var extendStatics = (d, b) => {
      extendStatics =
        Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array &&
          ((d, b) => {
            d.__proto__ = b;
          })) ||
        ((d, b) => {
          for (var p in b) if (Object.hasOwn(b, p)) d[p] = b[p];
        });
      return extendStatics(d, b);
    };
    return (d, b) => {
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
exports.InstagramOAuthHandler = void 0;
var axios_1 = require("axios");
var base_oauth_handler_1 = require("../base-oauth-handler");
/**
 * Instagram Graph API OAuth Handler for NeonPro
 * Implements Instagram-specific OAuth 2.0 flow with best practices
 * Based on official Meta Developer documentation and security standards
 */
var InstagramOAuthHandler = /** @class */ ((_super) => {
  __extends(InstagramOAuthHandler, _super);
  function InstagramOAuthHandler() {
    var _this = this;
    var config = {
      clientId: process.env.INSTAGRAM_CLIENT_ID,
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET,
      redirectUri: process.env.INSTAGRAM_REDIRECT_URI,
      scopes: ["user_profile", "user_media"],
      authUrl: "https://api.instagram.com/oauth/authorize",
      tokenUrl: "https://api.instagram.com/oauth/access_token",
      refreshUrl: "https://graph.instagram.com/refresh_access_token",
      apiBaseUrl: "https://graph.instagram.com",
    };
    _this = _super.call(this, config, "instagram") || this;
    _this.validateInstagramConfig();
    return _this;
  }
  InstagramOAuthHandler.prototype.validateInstagramConfig = () => {
    if (!process.env.INSTAGRAM_CLIENT_ID) {
      throw new Error("INSTAGRAM_CLIENT_ID environment variable is required");
    }
    if (!process.env.INSTAGRAM_CLIENT_SECRET) {
      throw new Error("INSTAGRAM_CLIENT_SECRET environment variable is required");
    }
    if (!process.env.INSTAGRAM_REDIRECT_URI) {
      throw new Error("INSTAGRAM_REDIRECT_URI environment variable is required");
    }
  };
  /**
   * Generate Instagram authorization URL with state for CSRF protection
   */
  InstagramOAuthHandler.prototype.getAuthorizationUrl = function (state) {
    // Store state for validation
    this.storeOAuthState(state);
    var params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scopes.join(","),
      response_type: "code",
      state: state.nonce,
    });
    return "".concat(this.config.authUrl, "?").concat(params.toString());
  };
  /**
   * Exchange authorization code for Instagram access tokens
   * Implements short-lived to long-lived token exchange
   */
  InstagramOAuthHandler.prototype.exchangeCodeForTokens = function (code, stateParam) {
    return __awaiter(this, void 0, void 0, function () {
      var state, shortLivedResponse, longLivedResponse, tokens, error_1, errorData;
      var _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            _b.trys.push([0, 4, , 5]);
            return [4 /*yield*/, this.validateOAuthState(stateParam)];
          case 1:
            state = _b.sent();
            if (!state) {
              throw new Error("Invalid or expired OAuth state");
            }
            return [
              4 /*yield*/,
              axios_1.default.post(
                this.config.tokenUrl,
                {
                  client_id: this.config.clientId,
                  client_secret: this.config.clientSecret,
                  grant_type: "authorization_code",
                  redirect_uri: this.config.redirectUri,
                  code: code,
                },
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                },
              ),
            ];
          case 2:
            shortLivedResponse = _b.sent();
            if (!shortLivedResponse.data.access_token) {
              throw new Error("Failed to receive access token from Instagram");
            }
            return [
              4 /*yield*/,
              axios_1.default.get("https://graph.instagram.com/access_token", {
                params: {
                  grant_type: "ig_exchange_token",
                  client_secret: this.config.clientSecret,
                  access_token: shortLivedResponse.data.access_token,
                },
              }),
            ];
          case 3:
            longLivedResponse = _b.sent();
            tokens = {
              accessToken: longLivedResponse.data.access_token,
              tokenType: longLivedResponse.data.token_type || "Bearer",
              expiresIn: longLivedResponse.data.expires_in || 5184000, // 60 days default
              expiresAt: new Date(
                Date.now() + (longLivedResponse.data.expires_in || 5184000) * 1000,
              ),
              scope: this.config.scopes.join(" "),
            };
            return [2 /*return*/, tokens];
          case 4:
            error_1 = _b.sent();
            if (axios_1.default.isAxiosError(error_1)) {
              errorData = (_a = error_1.response) === null || _a === void 0 ? void 0 : _a.data;
              throw new Error(
                "Instagram token exchange failed: ".concat(
                  (errorData === null || errorData === void 0
                    ? void 0
                    : errorData.error_description) || error_1.message,
                ),
              );
            }
            throw new Error(
              "Token exchange failed: ".concat(
                error_1 instanceof Error ? error_1.message : "Unknown error",
              ),
            );
          case 5:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Refresh Instagram long-lived access token
   */
  InstagramOAuthHandler.prototype.refreshTokens = function (accessToken) {
    return __awaiter(this, void 0, void 0, function () {
      var response, tokens, error_2, errorData;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              axios_1.default.get("https://graph.instagram.com/refresh_access_token", {
                params: {
                  grant_type: "ig_refresh_token",
                  access_token: accessToken,
                },
              }),
            ];
          case 1:
            response = _c.sent();
            tokens = {
              accessToken: response.data.access_token,
              tokenType: response.data.token_type || "Bearer",
              expiresIn: response.data.expires_in || 5184000, // 60 days default
              expiresAt: new Date(Date.now() + (response.data.expires_in || 5184000) * 1000),
              scope: this.config.scopes.join(" "),
            };
            return [2 /*return*/, tokens];
          case 2:
            error_2 = _c.sent();
            if (axios_1.default.isAxiosError(error_2)) {
              errorData = (_a = error_2.response) === null || _a === void 0 ? void 0 : _a.data;
              throw new Error(
                "Instagram token refresh failed: ".concat(
                  ((_b = errorData === null || errorData === void 0 ? void 0 : errorData.error) ===
                    null || _b === void 0
                    ? void 0
                    : _b.message) || error_2.message,
                ),
              );
            }
            throw new Error(
              "Token refresh failed: ".concat(
                error_2 instanceof Error ? error_2.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get Instagram user profile information
   */
  InstagramOAuthHandler.prototype.getUserProfile = function (accessToken) {
    return __awaiter(this, void 0, void 0, function () {
      var response, profile, error_3, errorData;
      var _a, _b;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              axios_1.default.get("".concat(this.config.apiBaseUrl, "/me"), {
                params: {
                  fields: "id,username,account_type,media_count",
                  access_token: accessToken,
                },
              }),
            ];
          case 1:
            response = _c.sent();
            profile = {
              id: response.data.id,
              name: response.data.username,
              username: response.data.username,
              mediaCount: response.data.media_count,
              isVerified:
                response.data.account_type === "BUSINESS" ||
                response.data.account_type === "CREATOR",
            };
            return [2 /*return*/, profile];
          case 2:
            error_3 = _c.sent();
            if (axios_1.default.isAxiosError(error_3)) {
              errorData = (_a = error_3.response) === null || _a === void 0 ? void 0 : _a.data;
              throw new Error(
                "Instagram profile fetch failed: ".concat(
                  ((_b = errorData === null || errorData === void 0 ? void 0 : errorData.error) ===
                    null || _b === void 0
                    ? void 0
                    : _b.message) || error_3.message,
                ),
              );
            }
            throw new Error(
              "Profile fetch failed: ".concat(
                error_3 instanceof Error ? error_3.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Validate Instagram access token
   */
  InstagramOAuthHandler.prototype.validateTokens = function (tokens) {
    return __awaiter(this, void 0, void 0, function () {
      var error_4;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, this.getUserProfile(tokens.accessToken)];
          case 1:
            _a.sent();
            return [2 /*return*/, true];
          case 2:
            error_4 = _a.sent();
            return [2 /*return*/, false];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Revoke Instagram access token
   * Note: Instagram doesn't provide a direct revoke endpoint
   * Users must revoke access through Instagram settings
   */
  InstagramOAuthHandler.prototype.revokeTokens = function (accessToken) {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, (_a) => {
        // Instagram doesn't provide a programmatic way to revoke tokens
        // The token will expire naturally after 60 days
        // Users can revoke access through Instagram settings manually
        return [2 /*return*/, true];
      });
    });
  };
  /**
   * Get Instagram media for the authenticated user
   */
  InstagramOAuthHandler.prototype.getUserMedia = function (accessToken_1) {
    return __awaiter(this, arguments, void 0, function (accessToken, limit) {
      var response, error_5, errorData;
      var _a, _b;
      if (limit === void 0) {
        limit = 25;
      }
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            _c.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              axios_1.default.get("".concat(this.config.apiBaseUrl, "/me/media"), {
                params: {
                  fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
                  limit: limit,
                  access_token: accessToken,
                },
              }),
            ];
          case 1:
            response = _c.sent();
            return [2 /*return*/, response.data.data || []];
          case 2:
            error_5 = _c.sent();
            if (axios_1.default.isAxiosError(error_5)) {
              errorData = (_a = error_5.response) === null || _a === void 0 ? void 0 : _a.data;
              throw new Error(
                "Instagram media fetch failed: ".concat(
                  ((_b = errorData === null || errorData === void 0 ? void 0 : errorData.error) ===
                    null || _b === void 0
                    ? void 0
                    : _b.message) || error_5.message,
                ),
              );
            }
            throw new Error(
              "Media fetch failed: ".concat(
                error_5 instanceof Error ? error_5.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * Get Instagram account insights (Business/Creator accounts only)
   */
  InstagramOAuthHandler.prototype.getAccountInsights = function (accessToken_1) {
    return __awaiter(this, arguments, void 0, function (accessToken, period) {
      var response, error_6, errorData;
      var _a, _b, _c;
      if (period === void 0) {
        period = "day";
      }
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            _d.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              axios_1.default.get("".concat(this.config.apiBaseUrl, "/me/insights"), {
                params: {
                  metric: "impressions,reach,profile_views",
                  period: period,
                  access_token: accessToken,
                },
              }),
            ];
          case 1:
            response = _d.sent();
            return [2 /*return*/, response.data.data || []];
          case 2:
            error_6 = _d.sent();
            if (axios_1.default.isAxiosError(error_6)) {
              errorData = (_a = error_6.response) === null || _a === void 0 ? void 0 : _a.data;
              // Insights are only available for Business/Creator accounts
              if (
                ((_b = errorData === null || errorData === void 0 ? void 0 : errorData.error) ===
                  null || _b === void 0
                  ? void 0
                  : _b.code) === 100
              ) {
                return [2 /*return*/, []];
              }
              throw new Error(
                "Instagram insights fetch failed: ".concat(
                  ((_c = errorData === null || errorData === void 0 ? void 0 : errorData.error) ===
                    null || _c === void 0
                    ? void 0
                    : _c.message) || error_6.message,
                ),
              );
            }
            throw new Error(
              "Insights fetch failed: ".concat(
                error_6 instanceof Error ? error_6.message : "Unknown error",
              ),
            );
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  return InstagramOAuthHandler;
})(base_oauth_handler_1.BaseOAuthHandler);
exports.InstagramOAuthHandler = InstagramOAuthHandler;
