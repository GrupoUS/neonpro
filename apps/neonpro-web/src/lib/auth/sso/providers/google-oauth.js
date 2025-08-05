"use strict";
// Google OAuth Provider Implementation
// Story 1.3: SSO Integration - Google OAuth 2.0
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GOOGLE_WORKSPACE_SCOPES = exports.DEFAULT_GOOGLE_SCOPES = exports.GoogleOAuthProvider = void 0;
exports.createGoogleOAuthProvider = createGoogleOAuthProvider;
var logger_1 = require("@/lib/logger");
var GoogleOAuthProvider = /** @class */ (function () {
    function GoogleOAuthProvider(config) {
        this.authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        this.tokenUrl = 'https://oauth2.googleapis.com/token';
        this.userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
        this.revokeUrl = 'https://oauth2.googleapis.com/revoke';
        this.config = __assign({ scopes: ['openid', 'email', 'profile'], accessType: 'offline', approvalPrompt: 'auto', includeGrantedScopes: true }, config);
        this.validateConfig();
    }
    /**
     * Validate Google OAuth configuration
     */
    GoogleOAuthProvider.prototype.validateConfig = function () {
        if (!this.config.clientId) {
            throw new Error('Google OAuth: Client ID is required');
        }
        if (!this.config.clientSecret) {
            throw new Error('Google OAuth: Client Secret is required');
        }
        if (!this.config.redirectUri) {
            throw new Error('Google OAuth: Redirect URI is required');
        }
    };
    /**
     * Generate Google OAuth authorization URL
     */
    GoogleOAuthProvider.prototype.generateAuthUrl = function (options) {
        var params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            scope: this.config.scopes.join(' '),
            redirect_uri: this.config.redirectUri,
            state: options.state,
            access_type: this.config.accessType,
            include_granted_scopes: this.config.includeGrantedScopes.toString(),
        });
        // Optional parameters
        if (options.nonce) {
            params.append('nonce', options.nonce);
        }
        if (options.loginHint) {
            params.append('login_hint', options.loginHint);
        }
        if (options.prompt) {
            params.append('prompt', options.prompt);
        }
        if (this.config.hostedDomain) {
            params.append('hd', this.config.hostedDomain);
        }
        if (this.config.approvalPrompt === 'force') {
            params.append('approval_prompt', 'force');
        }
        var authUrl = "".concat(this.authUrl, "?").concat(params.toString());
        logger_1.logger.info('Google OAuth: Generated auth URL', {
            clientId: this.config.clientId,
            scopes: this.config.scopes,
            hostedDomain: this.config.hostedDomain
        });
        return authUrl;
    };
    /**
     * Exchange authorization code for access token
     */
    GoogleOAuthProvider.prototype.exchangeCodeForTokens = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, errorData, tokenData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            client_id: this.config.clientId,
                            client_secret: this.config.clientSecret,
                            code: code,
                            grant_type: 'authorization_code',
                            redirect_uri: this.config.redirectUri,
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(this.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                },
                                body: params.toString(),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _a.sent();
                        logger_1.logger.error('Google OAuth: Token exchange failed', {
                            status: response.status,
                            error: errorData
                        });
                        throw new Error("Google OAuth token exchange failed: ".concat(errorData));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        tokenData = _a.sent();
                        logger_1.logger.info('Google OAuth: Token exchange successful', {
                            hasRefreshToken: !!tokenData.refresh_token,
                            expiresIn: tokenData.expires_in,
                            scope: tokenData.scope,
                        });
                        return [2 /*return*/, {
                                accessToken: tokenData.access_token,
                                tokenType: tokenData.token_type,
                                expiresIn: tokenData.expires_in,
                                refreshToken: tokenData.refresh_token,
                                idToken: tokenData.id_token,
                                scope: tokenData.scope,
                            }];
                    case 6:
                        error_1 = _a.sent();
                        logger_1.logger.error('Google OAuth: Token exchange error', { error: error_1.message });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh access token using refresh token
     */
    GoogleOAuthProvider.prototype.refreshAccessToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, errorData, tokenData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            client_id: this.config.clientId,
                            client_secret: this.config.clientSecret,
                            refresh_token: refreshToken,
                            grant_type: 'refresh_token',
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(this.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                },
                                body: params.toString(),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _a.sent();
                        logger_1.logger.error('Google OAuth: Token refresh failed', {
                            status: response.status,
                            error: errorData
                        });
                        throw new Error("Google OAuth token refresh failed: ".concat(errorData));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        tokenData = _a.sent();
                        logger_1.logger.info('Google OAuth: Token refresh successful', {
                            expiresIn: tokenData.expires_in,
                            scope: tokenData.scope,
                        });
                        return [2 /*return*/, {
                                accessToken: tokenData.access_token,
                                tokenType: tokenData.token_type,
                                expiresIn: tokenData.expires_in,
                                refreshToken: tokenData.refresh_token || refreshToken, // Google may not return new refresh token
                                scope: tokenData.scope,
                            }];
                    case 6:
                        error_2 = _a.sent();
                        logger_1.logger.error('Google OAuth: Token refresh error', { error: error_2.message });
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user information from Google
     */
    GoogleOAuthProvider.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, userData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch(this.userInfoUrl, {
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken),
                                    'Accept': 'application/json',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _a.sent();
                        logger_1.logger.error('Google OAuth: User info fetch failed', {
                            status: response.status,
                            error: errorData
                        });
                        throw new Error("Google OAuth user info fetch failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        userData = _a.sent();
                        // Validate hosted domain if configured
                        if (this.config.hostedDomain && userData.hd !== this.config.hostedDomain) {
                            logger_1.logger.warn('Google OAuth: User not from expected hosted domain', {
                                expected: this.config.hostedDomain,
                                actual: userData.hd,
                                email: userData.email,
                            });
                            throw new Error("User must be from ".concat(this.config.hostedDomain, " domain"));
                        }
                        logger_1.logger.info('Google OAuth: User info retrieved', {
                            email: userData.email,
                            verified: userData.verified_email,
                            hostedDomain: userData.hd,
                        });
                        return [2 /*return*/, {
                                id: userData.id,
                                email: userData.email,
                                emailVerified: userData.verified_email,
                                name: userData.name,
                                firstName: userData.given_name,
                                lastName: userData.family_name,
                                picture: userData.picture,
                                locale: userData.locale,
                                organizationId: userData.hd, // Hosted domain as organization ID
                            }];
                    case 5:
                        error_3 = _a.sent();
                        logger_1.logger.error('Google OAuth: User info error', { error: error_3.message });
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Revoke Google OAuth token
     */
    GoogleOAuthProvider.prototype.revokeToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.revokeUrl, "?token=").concat(encodeURIComponent(token)), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _a.sent();
                        logger_1.logger.error('Google OAuth: Token revocation failed', {
                            status: response.status,
                            error: errorData
                        });
                        throw new Error("Google OAuth token revocation failed: ".concat(errorData));
                    case 3:
                        logger_1.logger.info('Google OAuth: Token revoked successfully');
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        logger_1.logger.error('Google OAuth: Token revocation error', { error: error_4.message });
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate ID token (JWT)
     */
    GoogleOAuthProvider.prototype.validateIdToken = function (idToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, tokenInfo, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("https://oauth2.googleapis.com/tokeninfo?id_token=".concat(idToken))];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error('Invalid ID token');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        tokenInfo = _a.sent();
                        // Validate audience (client ID)
                        if (tokenInfo.aud !== this.config.clientId) {
                            throw new Error('ID token audience mismatch');
                        }
                        // Validate issuer
                        if (!['accounts.google.com', 'https://accounts.google.com'].includes(tokenInfo.iss)) {
                            throw new Error('ID token issuer mismatch');
                        }
                        // Validate expiration
                        if (Date.now() >= tokenInfo.exp * 1000) {
                            throw new Error('ID token expired');
                        }
                        logger_1.logger.info('Google OAuth: ID token validated', {
                            subject: tokenInfo.sub,
                            email: tokenInfo.email,
                            emailVerified: tokenInfo.email_verified,
                        });
                        return [2 /*return*/, tokenInfo];
                    case 3:
                        error_5 = _a.sent();
                        logger_1.logger.error('Google OAuth: ID token validation error', { error: error_5.message });
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get provider configuration as SSOProvider
     */
    GoogleOAuthProvider.prototype.getProviderConfig = function () {
        return {
            id: 'google',
            name: 'Google',
            type: 'oauth2',
            enabled: true,
            config: {
                clientId: this.config.clientId,
                clientSecret: this.config.clientSecret,
                authUrl: this.authUrl,
                tokenUrl: this.tokenUrl,
                userInfoUrl: this.userInfoUrl,
                redirectUri: this.config.redirectUri,
                scopes: this.config.scopes,
            },
            metadata: {
                displayName: 'Google',
                description: 'Sign in with your Google account',
                iconUrl: 'https://developers.google.com/identity/images/g-logo.png',
                buttonColor: '#4285f4',
                textColor: '#ffffff',
                supportedFeatures: [
                    'oauth2',
                    'openid_connect',
                    'refresh_tokens',
                    'hosted_domains',
                    'id_tokens',
                ],
                documentation: 'https://developers.google.com/identity/protocols/oauth2',
            },
        };
    };
    /**
     * Update configuration
     */
    GoogleOAuthProvider.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        this.validateConfig();
        logger_1.logger.info('Google OAuth: Configuration updated');
    };
    /**
     * Get current configuration
     */
    GoogleOAuthProvider.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    return GoogleOAuthProvider;
}());
exports.GoogleOAuthProvider = GoogleOAuthProvider;
// Export factory function
function createGoogleOAuthProvider(config) {
    return new GoogleOAuthProvider(config);
}
// Export default configuration
exports.DEFAULT_GOOGLE_SCOPES = [
    'openid',
    'email',
    'profile',
];
exports.GOOGLE_WORKSPACE_SCOPES = __spreadArray(__spreadArray([], exports.DEFAULT_GOOGLE_SCOPES, true), [
    'https://www.googleapis.com/auth/admin.directory.user.readonly',
    'https://www.googleapis.com/auth/admin.directory.group.readonly',
], false);
