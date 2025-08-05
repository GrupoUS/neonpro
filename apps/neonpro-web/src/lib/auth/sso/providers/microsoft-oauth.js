"use strict";
// Microsoft OAuth Provider Implementation
// Story 1.3: SSO Integration - Microsoft OAuth 2.0 & Azure AD
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
exports.MICROSOFT_GRAPH_SCOPES = exports.AZURE_AD_SCOPES = exports.DEFAULT_MICROSOFT_SCOPES = exports.MicrosoftOAuthProvider = void 0;
exports.createMicrosoftOAuthProvider = createMicrosoftOAuthProvider;
var logger_1 = require("@/lib/logger");
var MicrosoftOAuthProvider = /** @class */ (function () {
    function MicrosoftOAuthProvider(config) {
        this.baseUrl = 'https://login.microsoftonline.com';
        this.graphUrl = 'https://graph.microsoft.com/v1.0';
        this.config = __assign({ scopes: ['openid', 'profile', 'email', 'User.Read'], tenant: 'common', responseMode: 'query' }, config);
        this.validateConfig();
    }
    /**
     * Validate Microsoft OAuth configuration
     */
    MicrosoftOAuthProvider.prototype.validateConfig = function () {
        if (!this.config.clientId) {
            throw new Error('Microsoft OAuth: Client ID is required');
        }
        if (!this.config.clientSecret) {
            throw new Error('Microsoft OAuth: Client Secret is required');
        }
        if (!this.config.redirectUri) {
            throw new Error('Microsoft OAuth: Redirect URI is required');
        }
    };
    /**
     * Get tenant-specific URLs
     */
    MicrosoftOAuthProvider.prototype.getTenantUrls = function () {
        var tenant = this.config.tenant || 'common';
        return {
            authUrl: "".concat(this.baseUrl, "/").concat(tenant, "/oauth2/v2.0/authorize"),
            tokenUrl: "".concat(this.baseUrl, "/").concat(tenant, "/oauth2/v2.0/token"),
            logoutUrl: "".concat(this.baseUrl, "/").concat(tenant, "/oauth2/v2.0/logout"),
        };
    };
    /**
     * Generate Microsoft OAuth authorization URL
     */
    MicrosoftOAuthProvider.prototype.generateAuthUrl = function (options) {
        var authUrl = this.getTenantUrls().authUrl;
        var params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: 'code',
            redirect_uri: this.config.redirectUri,
            response_mode: this.config.responseMode,
            scope: this.config.scopes.join(' '),
            state: options.state,
        });
        // Optional parameters
        if (options.nonce) {
            params.append('nonce', options.nonce);
        }
        if (options.loginHint) {
            params.append('login_hint', options.loginHint);
        }
        if (options.prompt || this.config.prompt) {
            params.append('prompt', options.prompt || this.config.prompt);
        }
        if (options.domainHint || this.config.domainHint) {
            params.append('domain_hint', options.domainHint || this.config.domainHint);
        }
        var fullAuthUrl = "".concat(authUrl, "?").concat(params.toString());
        logger_1.logger.info('Microsoft OAuth: Generated auth URL', {
            clientId: this.config.clientId,
            tenant: this.config.tenant,
            scopes: this.config.scopes,
            domainHint: options.domainHint || this.config.domainHint,
        });
        return fullAuthUrl;
    };
    /**
     * Exchange authorization code for access token
     */
    MicrosoftOAuthProvider.prototype.exchangeCodeForTokens = function (code) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenUrl, params, response, errorData, tokenData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenUrl = this.getTenantUrls().tokenUrl;
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
                        return [4 /*yield*/, fetch(tokenUrl, {
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
                        logger_1.logger.error('Microsoft OAuth: Token exchange failed', {
                            status: response.status,
                            error: errorData,
                            tenant: this.config.tenant,
                        });
                        throw new Error("Microsoft OAuth token exchange failed: ".concat(errorData));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        tokenData = _a.sent();
                        logger_1.logger.info('Microsoft OAuth: Token exchange successful', {
                            hasRefreshToken: !!tokenData.refresh_token,
                            expiresIn: tokenData.expires_in,
                            scope: tokenData.scope,
                            tenant: this.config.tenant,
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
                        logger_1.logger.error('Microsoft OAuth: Token exchange error', {
                            error: error_1.message,
                            tenant: this.config.tenant,
                        });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh access token using refresh token
     */
    MicrosoftOAuthProvider.prototype.refreshAccessToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenUrl, params, response, errorData, tokenData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenUrl = this.getTenantUrls().tokenUrl;
                        params = new URLSearchParams({
                            client_id: this.config.clientId,
                            client_secret: this.config.clientSecret,
                            refresh_token: refreshToken,
                            grant_type: 'refresh_token',
                            scope: this.config.scopes.join(' '),
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, fetch(tokenUrl, {
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
                        logger_1.logger.error('Microsoft OAuth: Token refresh failed', {
                            status: response.status,
                            error: errorData,
                            tenant: this.config.tenant,
                        });
                        throw new Error("Microsoft OAuth token refresh failed: ".concat(errorData));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        tokenData = _a.sent();
                        logger_1.logger.info('Microsoft OAuth: Token refresh successful', {
                            expiresIn: tokenData.expires_in,
                            scope: tokenData.scope,
                            tenant: this.config.tenant,
                        });
                        return [2 /*return*/, {
                                accessToken: tokenData.access_token,
                                tokenType: tokenData.token_type,
                                expiresIn: tokenData.expires_in,
                                refreshToken: tokenData.refresh_token || refreshToken,
                                scope: tokenData.scope,
                            }];
                    case 6:
                        error_2 = _a.sent();
                        logger_1.logger.error('Microsoft OAuth: Token refresh error', {
                            error: error_2.message,
                            tenant: this.config.tenant,
                        });
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user information from Microsoft Graph
     */
    MicrosoftOAuthProvider.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, userData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("".concat(this.graphUrl, "/me"), {
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
                        logger_1.logger.error('Microsoft OAuth: User info fetch failed', {
                            status: response.status,
                            error: errorData,
                            tenant: this.config.tenant,
                        });
                        throw new Error("Microsoft OAuth user info fetch failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        userData = _a.sent();
                        logger_1.logger.info('Microsoft OAuth: User info retrieved', {
                            userPrincipalName: userData.userPrincipalName,
                            mail: userData.mail,
                            tenant: this.config.tenant,
                        });
                        return [2 /*return*/, {
                                id: userData.id,
                                email: userData.mail || userData.userPrincipalName,
                                emailVerified: true, // Microsoft accounts are considered verified
                                name: userData.displayName,
                                firstName: userData.givenName,
                                lastName: userData.surname,
                                locale: userData.preferredLanguage,
                                organizationId: this.extractTenantId(userData),
                            }];
                    case 5:
                        error_3 = _a.sent();
                        logger_1.logger.error('Microsoft OAuth: User info error', {
                            error: error_3.message,
                            tenant: this.config.tenant,
                        });
                        throw error_3;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get extended user information (Azure AD)
     */
    MicrosoftOAuthProvider.prototype.getExtendedUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, userData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("".concat(this.graphUrl, "/me?$select=id,displayName,givenName,surname,userPrincipalName,mail,mobilePhone,officeLocation,preferredLanguage,jobTitle,businessPhones,onPremisesSamAccountName,onPremisesUserPrincipalName,employeeId,department,companyName,usageLocation"), {
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
                        logger_1.logger.error('Microsoft OAuth: Extended user info fetch failed', {
                            status: response.status,
                            error: errorData,
                            tenant: this.config.tenant,
                        });
                        throw new Error("Microsoft OAuth extended user info fetch failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        userData = _a.sent();
                        logger_1.logger.info('Microsoft OAuth: Extended user info retrieved', {
                            userPrincipalName: userData.userPrincipalName,
                            department: userData.department,
                            jobTitle: userData.jobTitle,
                            tenant: this.config.tenant,
                        });
                        return [2 /*return*/, userData];
                    case 5:
                        error_4 = _a.sent();
                        logger_1.logger.error('Microsoft OAuth: Extended user info error', {
                            error: error_4.message,
                            tenant: this.config.tenant,
                        });
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get user's organization information
     */
    MicrosoftOAuthProvider.prototype.getOrganizationInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, orgData, error_5;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("".concat(this.graphUrl, "/organization"), {
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken),
                                    'Accept': 'application/json',
                                },
                            })];
                    case 1:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _c.sent();
                        logger_1.logger.error('Microsoft OAuth: Organization info fetch failed', {
                            status: response.status,
                            error: errorData,
                            tenant: this.config.tenant,
                        });
                        throw new Error("Microsoft OAuth organization info fetch failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        orgData = _c.sent();
                        logger_1.logger.info('Microsoft OAuth: Organization info retrieved', {
                            organizationCount: ((_a = orgData.value) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            tenant: this.config.tenant,
                        });
                        return [2 /*return*/, ((_b = orgData.value) === null || _b === void 0 ? void 0 : _b[0]) || null];
                    case 5:
                        error_5 = _c.sent();
                        logger_1.logger.error('Microsoft OAuth: Organization info error', {
                            error: error_5.message,
                            tenant: this.config.tenant,
                        });
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Extract tenant ID from user data
     */
    MicrosoftOAuthProvider.prototype.extractTenantId = function (userData) {
        // Try to extract tenant ID from @odata.context
        if (userData['@odata.context']) {
            var match = userData['@odata.context'].match(/\/([a-f0-9-]{36})\//i);
            if (match) {
                return match[1];
            }
        }
        // Fallback to configured tenant if it's a GUID
        if (this.config.tenant && this.config.tenant.match(/^[a-f0-9-]{36}$/i)) {
            return this.config.tenant;
        }
        return undefined;
    };
    /**
     * Revoke Microsoft OAuth token
     */
    MicrosoftOAuthProvider.prototype.revokeToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Microsoft doesn't have a standard revoke endpoint
                // Tokens expire automatically, but we can log the revocation attempt
                logger_1.logger.info('Microsoft OAuth: Token revocation requested', {
                    tenant: this.config.tenant,
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generate logout URL
     */
    MicrosoftOAuthProvider.prototype.generateLogoutUrl = function (postLogoutRedirectUri) {
        var logoutUrl = this.getTenantUrls().logoutUrl;
        var params = new URLSearchParams();
        if (postLogoutRedirectUri) {
            params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        var fullLogoutUrl = params.toString() ? "".concat(logoutUrl, "?").concat(params.toString()) : logoutUrl;
        logger_1.logger.info('Microsoft OAuth: Generated logout URL', {
            tenant: this.config.tenant,
            hasRedirect: !!postLogoutRedirectUri,
        });
        return fullLogoutUrl;
    };
    /**
     * Get provider configuration as SSOProvider
     */
    MicrosoftOAuthProvider.prototype.getProviderConfig = function () {
        var _a = this.getTenantUrls(), authUrl = _a.authUrl, tokenUrl = _a.tokenUrl;
        return {
            id: 'microsoft',
            name: 'Microsoft',
            type: 'oauth2',
            enabled: true,
            config: {
                clientId: this.config.clientId,
                clientSecret: this.config.clientSecret,
                authUrl: authUrl,
                tokenUrl: tokenUrl,
                userInfoUrl: "".concat(this.graphUrl, "/me"),
                redirectUri: this.config.redirectUri,
                scopes: this.config.scopes,
            },
            metadata: {
                displayName: 'Microsoft',
                description: 'Sign in with your Microsoft account',
                iconUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.png',
                buttonColor: '#0078d4',
                textColor: '#ffffff',
                supportedFeatures: [
                    'oauth2',
                    'openid_connect',
                    'refresh_tokens',
                    'azure_ad',
                    'graph_api',
                    'organization_info',
                ],
                documentation: 'https://docs.microsoft.com/en-us/azure/active-directory/develop/',
            },
        };
    };
    /**
     * Update configuration
     */
    MicrosoftOAuthProvider.prototype.updateConfig = function (config) {
        this.config = __assign(__assign({}, this.config), config);
        this.validateConfig();
        logger_1.logger.info('Microsoft OAuth: Configuration updated', {
            tenant: this.config.tenant,
        });
    };
    /**
     * Get current configuration
     */
    MicrosoftOAuthProvider.prototype.getConfig = function () {
        return __assign({}, this.config);
    };
    /**
     * Check if tenant is Azure AD (not personal accounts)
     */
    MicrosoftOAuthProvider.prototype.isAzureAD = function () {
        return this.config.tenant !== 'consumers' && this.config.tenant !== 'common';
    };
    /**
     * Check if tenant allows personal accounts
     */
    MicrosoftOAuthProvider.prototype.allowsPersonalAccounts = function () {
        return this.config.tenant === 'consumers' || this.config.tenant === 'common';
    };
    return MicrosoftOAuthProvider;
}());
exports.MicrosoftOAuthProvider = MicrosoftOAuthProvider;
// Export factory function
function createMicrosoftOAuthProvider(config) {
    return new MicrosoftOAuthProvider(config);
}
// Export default configuration
exports.DEFAULT_MICROSOFT_SCOPES = [
    'openid',
    'profile',
    'email',
    'User.Read',
];
exports.AZURE_AD_SCOPES = __spreadArray(__spreadArray([], exports.DEFAULT_MICROSOFT_SCOPES, true), [
    'Directory.Read.All',
    'Group.Read.All',
    'Organization.Read.All',
], false);
exports.MICROSOFT_GRAPH_SCOPES = __spreadArray(__spreadArray([], exports.DEFAULT_MICROSOFT_SCOPES, true), [
    'Calendars.Read',
    'Files.Read',
    'Mail.Read',
    'People.Read',
], false);
