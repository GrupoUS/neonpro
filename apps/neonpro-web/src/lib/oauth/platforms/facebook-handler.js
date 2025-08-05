"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacebookOAuthHandler = void 0;
var axios_1 = require("axios");
var base_oauth_handler_1 = require("../base-oauth-handler");
/**
 * Facebook Graph API OAuth Handler for NeonPro
 * Implementa o fluxo OAuth 2.0 do Facebook com melhores práticas
 * Baseado na documentação oficial do Meta Developer e research-backed patterns
 *
 * Features:
 * - OAuth 2.0 authorization code flow
 * - Long-lived token management (60-day tokens)
 * - Facebook Pages access for business accounts
 * - Comprehensive error handling
 * - CSRF protection with state parameter
 * - Token encryption and secure storage
 */
var FacebookOAuthHandler = /** @class */ (function (_super) {
    __extends(FacebookOAuthHandler, _super);
    function FacebookOAuthHandler() {
        var _this = this;
        var config = {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            redirectUri: process.env.FACEBOOK_REDIRECT_URI || "".concat(process.env.NEXT_PUBLIC_APP_URL, "/api/oauth/facebook/callback"),
            scopes: [
                'public_profile',
                'email',
                'pages_show_list',
                'pages_read_engagement',
                'pages_manage_posts',
                'business_management',
                'read_insights'
            ],
            authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
            tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
            apiBaseUrl: 'https://graph.facebook.com/v19.0'
        };
        _this = _super.call(this, config, 'facebook') || this;
        _this.validateFacebookConfig();
        return _this;
    }
    FacebookOAuthHandler.prototype.validateFacebookConfig = function () {
        if (!process.env.FACEBOOK_CLIENT_ID) {
            throw new Error('FACEBOOK_CLIENT_ID environment variable is required');
        }
        if (!process.env.FACEBOOK_CLIENT_SECRET) {
            throw new Error('FACEBOOK_CLIENT_SECRET environment variable is required');
        }
        if (!process.env.FACEBOOK_REDIRECT_URI && !process.env.NEXT_PUBLIC_APP_URL) {
            throw new Error('FACEBOOK_REDIRECT_URI or NEXT_PUBLIC_APP_URL environment variable is required');
        }
    };
    /**
     * Generate Facebook OAuth authorization URL with state for CSRF protection
     * @param state OAuth state object containing user and clinic information
     * @returns Complete authorization URL for redirect
     */
    FacebookOAuthHandler.prototype.getAuthorizationUrl = function (state) {
        this.storeOAuthState(state);
        var params = new URLSearchParams({
            client_id: this.config.clientId,
            redirect_uri: this.config.redirectUri,
            scope: this.config.scopes.join(','),
            response_type: 'code',
            state: state.nonce,
            auth_type: 'rerequest' // Force permission re-request for updated scopes
        });
        return "".concat(this.config.authUrl, "?").concat(params.toString());
    };
    /**
     * Exchange authorization code for Facebook access tokens
     * Facebook provides long-lived tokens by default for server-side flows
     * @param code Authorization code from Facebook callback
     * @param stateParam State parameter for CSRF validation
     * @returns OAuth tokens including long-lived access token
     */
    FacebookOAuthHandler.prototype.exchangeCodeForTokens = function (code, stateParam) {
        return __awaiter(this, void 0, void 0, function () {
            var state, params, response, expiresIn, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.validateOAuthState(stateParam)];
                    case 1:
                        state = _a.sent();
                        if (!state) {
                            throw new Error('Invalid or expired OAuth state');
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        params = new URLSearchParams({
                            client_id: this.config.clientId,
                            client_secret: this.config.clientSecret,
                            redirect_uri: this.config.redirectUri,
                            code: code
                        });
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.tokenUrl, "?").concat(params.toString()))];
                    case 3:
                        response = _a.sent();
                        if (!response.data.access_token) {
                            throw new Error('No access token received from Facebook');
                        }
                        expiresIn = response.data.expires_in || 5184000;
                        return [2 /*return*/, {
                                accessToken: response.data.access_token,
                                tokenType: response.data.token_type || 'Bearer',
                                expiresIn: expiresIn,
                                expiresAt: new Date(Date.now() + expiresIn * 1000),
                                scope: this.config.scopes.join(' ')
                            }];
                    case 4:
                        error_1 = _a.sent();
                        throw new Error("Failed to exchange code for tokens: ".concat(error_1 instanceof Error ? error_1.message : 'Unknown error'));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh Facebook access tokens using token exchange
     * Facebook uses fb_exchange_token instead of traditional refresh tokens
     * @param refreshToken Current access token to exchange for new long-lived token
     * @returns New OAuth tokens with extended expiration
     */
    FacebookOAuthHandler.prototype.refreshTokens = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, expiresIn, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = new URLSearchParams({
                            grant_type: 'fb_exchange_token',
                            client_id: this.config.clientId,
                            client_secret: this.config.clientSecret,
                            fb_exchange_token: refreshToken
                        });
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.tokenUrl, "?").concat(params.toString()))];
                    case 1:
                        response = _a.sent();
                        if (!response.data.access_token) {
                            throw new Error('No refreshed token received from Facebook');
                        }
                        expiresIn = response.data.expires_in || 5184000;
                        return [2 /*return*/, {
                                accessToken: response.data.access_token,
                                tokenType: response.data.token_type || 'Bearer',
                                expiresIn: expiresIn,
                                expiresAt: new Date(Date.now() + expiresIn * 1000),
                                scope: this.config.scopes.join(' ')
                            }];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Failed to refresh Facebook tokens: ".concat(error_2 instanceof Error ? error_2.message : 'Unknown error'));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get Facebook user profile information including pages access
     * @param accessToken Valid Facebook access token
     * @returns User profile with Facebook-specific data
     */
    FacebookOAuthHandler.prototype.getUserProfile = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var userResponse, userData, pageCount, pagesResponse, error_3, error_4;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.apiBaseUrl, "/me"), {
                                params: {
                                    fields: 'id,name,email,picture.type(large)',
                                    access_token: accessToken
                                }
                            })];
                    case 1:
                        userResponse = _d.sent();
                        userData = userResponse.data;
                        pageCount = 0;
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.apiBaseUrl, "/me/accounts"), {
                                params: {
                                    access_token: accessToken
                                }
                            })];
                    case 3:
                        pagesResponse = _d.sent();
                        pageCount = ((_a = pagesResponse.data.data) === null || _a === void 0 ? void 0 : _a.length) || 0;
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _d.sent();
                        // Pages access is optional, continue without it
                        console.warn('Could not fetch Facebook pages:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            profilePicture: (_c = (_b = userData.picture) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.url,
                            isVerified: false, // Facebook Graph API doesn't provide verification status for regular users
                            followerCount: pageCount // Use page count as a proxy for business capabilities
                        }];
                    case 6:
                        error_4 = _d.sent();
                        throw new Error("Failed to get Facebook user profile: ".concat(error_4 instanceof Error ? error_4.message : 'Unknown error'));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate if Facebook tokens are still active
     * @param tokens OAuth tokens to validate
     * @returns True if tokens are valid and active
     */
    FacebookOAuthHandler.prototype.validateTokens = function (tokens) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.apiBaseUrl, "/me"), {
                                params: {
                                    access_token: tokens.accessToken
                                }
                            })];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, response.status === 200 && response.data.id];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke Facebook access tokens
     * @param accessToken Access token to revoke
     * @returns True if revocation was successful
     */
    FacebookOAuthHandler.prototype.revokeTokens = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var userResponse, revokeResponse, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("".concat(this.config.apiBaseUrl, "/me"), {
                                params: {
                                    access_token: accessToken
                                }
                            })];
                    case 1:
                        userResponse = _a.sent();
                        if (!userResponse.data.id) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, axios_1.default.delete("".concat(this.config.apiBaseUrl, "/").concat(userResponse.data.id, "/permissions"), {
                                params: {
                                    access_token: accessToken
                                }
                            })];
                    case 2:
                        revokeResponse = _a.sent();
                        return [2 /*return*/, revokeResponse.status === 200];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Failed to revoke Facebook tokens:', error_5);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return FacebookOAuthHandler;
}(base_oauth_handler_1.BaseOAuthHandler));
exports.FacebookOAuthHandler = FacebookOAuthHandler;
