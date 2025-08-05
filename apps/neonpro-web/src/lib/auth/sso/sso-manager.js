"use strict";
// SSO Manager - Core SSO Implementation
// Story 1.3: SSO Integration Implementation
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssoManager = exports.SSOManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var sso_1 = require("@/types/sso");
var logger_1 = require("@/lib/logger");
var crypto_1 = require("crypto");
var SSOManager = /** @class */ (function () {
    function SSOManager(supabaseUrl, supabaseKey, config) {
        this.providers = new Map();
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        this.config = config || this.getDefaultConfig();
        this.initializeProviders();
    }
    /**
     * Initialize SSO providers from configuration
     */
    SSOManager.prototype.initializeProviders = function () {
        var _this = this;
        this.config.providers.forEach(function (provider) {
            if (provider.enabled) {
                _this.providers.set(provider.id, provider);
            }
        });
    };
    /**
     * Get default SSO configuration
     */
    SSOManager.prototype.getDefaultConfig = function () {
        return {
            providers: sso_1.DEFAULT_SSO_PROVIDERS,
            domainMappings: [],
            globalSettings: {
                enabled: true,
                allowLocalFallback: true,
                sessionTimeout: 3600000, // 1 hour
                tokenRefreshThreshold: 300000, // 5 minutes
                maxConcurrentSessions: 3,
                auditRetentionDays: 90,
                lgpdCompliance: {
                    consentRequired: true,
                    dataRetentionDays: 365,
                    allowDataExport: true,
                    allowDataDeletion: true,
                },
            },
        };
    };
    /**
     * Generate SSO authorization URL
     */
    SSOManager.prototype.generateAuthUrl = function (providerId_1) {
        return __awaiter(this, arguments, void 0, function (providerId, options) {
            var provider, state, nonce, authRequest, params;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.providers.get(providerId);
                        if (!provider) {
                            throw this.createError('PROVIDER_NOT_FOUND', "Provider ".concat(providerId, " not found"));
                        }
                        if (!provider.enabled) {
                            throw this.createError('PROVIDER_DISABLED', "Provider ".concat(providerId, " is disabled"));
                        }
                        state = options.state || this.generateSecureToken();
                        nonce = options.nonce || this.generateSecureToken();
                        authRequest = __assign({ providerId: providerId, state: state, nonce: nonce, redirectUri: options.redirectUri || provider.config.redirectUri, scopes: options.scopes || provider.config.scopes }, options);
                        // Store auth request for validation
                        return [4 /*yield*/, this.storeAuthRequest(authRequest)];
                    case 1:
                        // Store auth request for validation
                        _a.sent();
                        params = new URLSearchParams(__assign(__assign(__assign(__assign(__assign({ client_id: provider.config.clientId, response_type: 'code', redirect_uri: authRequest.redirectUri, scope: authRequest.scopes.join(' '), state: authRequest.state }, (authRequest.nonce && { nonce: authRequest.nonce })), (authRequest.domainHint && { domain_hint: authRequest.domainHint })), (authRequest.loginHint && { login_hint: authRequest.loginHint })), (authRequest.prompt && { prompt: authRequest.prompt })), (authRequest.maxAge && { max_age: authRequest.maxAge.toString() })));
                        return [2 /*return*/, "".concat(provider.config.authUrl, "?").concat(params.toString())];
                }
            });
        });
    };
    /**
     * Handle SSO callback and exchange code for tokens
     */
    SSOManager.prototype.handleCallback = function (providerId, response) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, authRequest, tokenResponse, userInfo, userId, session, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        provider = this.providers.get(providerId);
                        if (!provider) {
                            throw this.createError('PROVIDER_NOT_FOUND', "Provider ".concat(providerId, " not found"));
                        }
                        return [4 /*yield*/, this.getAuthRequest(response.state)];
                    case 1:
                        authRequest = _b.sent();
                        if (!authRequest || authRequest.providerId !== providerId) {
                            throw this.createError('INVALID_STATE', 'Invalid state parameter');
                        }
                        if (!response.error) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.logAudit({
                                providerId: providerId,
                                action: 'sso_login_failure',
                                details: { error: response.error, description: response.errorDescription },
                                success: false,
                                errorMessage: response.errorDescription,
                            })];
                    case 2:
                        _b.sent();
                        throw this.createError('PROVIDER_ERROR', response.errorDescription || response.error);
                    case 3:
                        if (!response.code) {
                            throw this.createError('PROVIDER_ERROR', 'No authorization code received');
                        }
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 10, , 12]);
                        return [4 /*yield*/, this.exchangeCodeForTokens(provider, response.code, authRequest.redirectUri)];
                    case 5:
                        tokenResponse = _b.sent();
                        return [4 /*yield*/, this.getUserInfo(provider, tokenResponse.accessToken)];
                    case 6:
                        userInfo = _b.sent();
                        return [4 /*yield*/, this.createOrLinkAccount(provider, userInfo)];
                    case 7:
                        userId = _b.sent();
                        return [4 /*yield*/, this.createSSOSession({
                                userId: userId,
                                providerId: providerId,
                                providerUserId: userInfo.id,
                                accessToken: tokenResponse.accessToken,
                                refreshToken: tokenResponse.refreshToken,
                                idToken: tokenResponse.idToken,
                                tokenType: tokenResponse.tokenType,
                                expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000),
                                scope: ((_a = tokenResponse.scope) === null || _a === void 0 ? void 0 : _a.split(' ')) || authRequest.scopes,
                                userInfo: userInfo,
                            })];
                    case 8:
                        session = _b.sent();
                        return [4 /*yield*/, this.logAudit({
                                userId: userId,
                                providerId: providerId,
                                action: 'sso_login_success',
                                details: { userInfo: { email: userInfo.email, name: userInfo.name } },
                                success: true,
                            })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, session];
                    case 10:
                        error_1 = _b.sent();
                        return [4 /*yield*/, this.logAudit({
                                providerId: providerId,
                                action: 'sso_login_failure',
                                details: { error: error_1.message },
                                success: false,
                                errorMessage: error_1.message,
                            })];
                    case 11:
                        _b.sent();
                        throw error_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Exchange authorization code for access tokens
     */
    SSOManager.prototype.exchangeCodeForTokens = function (provider, code, redirectUri) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, errorData, tokenData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            grant_type: 'authorization_code',
                            client_id: provider.config.clientId,
                            client_secret: provider.config.clientSecret || '',
                            code: code,
                            redirect_uri: redirectUri,
                        });
                        return [4 /*yield*/, fetch(provider.config.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                },
                                body: params.toString(),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _a.sent();
                        throw this.createError('PROVIDER_ERROR', "Token exchange failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        tokenData = _a.sent();
                        return [2 /*return*/, {
                                accessToken: tokenData.access_token,
                                tokenType: tokenData.token_type || 'Bearer',
                                expiresIn: tokenData.expires_in || 3600,
                                refreshToken: tokenData.refresh_token,
                                idToken: tokenData.id_token,
                                scope: tokenData.scope,
                            }];
                }
            });
        });
    };
    /**
     * Get user information from SSO provider
     */
    SSOManager.prototype.getUserInfo = function (provider, accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, userData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!provider.config.userInfoUrl) {
                            // Try to decode user info from ID token if available
                            throw this.createError('CONFIGURATION_ERROR', 'No user info URL configured');
                        }
                        return [4 /*yield*/, fetch(provider.config.userInfoUrl, {
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken),
                                    'Accept': 'application/json',
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw this.createError('PROVIDER_ERROR', 'Failed to fetch user info');
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        userData = _a.sent();
                        return [2 /*return*/, this.normalizeUserInfo(provider.id, userData)];
                }
            });
        });
    };
    /**
     * Normalize user info from different providers
     */
    SSOManager.prototype.normalizeUserInfo = function (providerId, userData) {
        var _a, _b, _c, _d;
        var baseInfo = {
            id: userData.id || userData.sub || userData.oid,
            email: userData.email,
            emailVerified: userData.email_verified || userData.verified_email || false,
        };
        switch (providerId) {
            case 'google':
                return __assign(__assign({}, baseInfo), { name: userData.name, firstName: userData.given_name, lastName: userData.family_name, picture: userData.picture, locale: userData.locale });
            case 'microsoft':
            case 'azure-ad':
                return __assign(__assign({}, baseInfo), { name: userData.displayName || userData.name, firstName: userData.givenName, lastName: userData.surname, picture: userData.photo, organizationId: userData.tid });
            case 'facebook':
                return __assign(__assign({}, baseInfo), { name: userData.name, firstName: userData.first_name, lastName: userData.last_name, picture: (_b = (_a = userData.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url });
            case 'apple':
                return __assign(__assign({}, baseInfo), { name: userData.name ? "".concat(userData.name.firstName, " ").concat(userData.name.lastName) : undefined, firstName: (_c = userData.name) === null || _c === void 0 ? void 0 : _c.firstName, lastName: (_d = userData.name) === null || _d === void 0 ? void 0 : _d.lastName });
            default:
                return baseInfo;
        }
    };
    /**
     * Create or link user account
     */
    SSOManager.prototype.createOrLinkAccount = function (provider, userInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var existingUser, _a, newUser, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('users')
                            .select('id')
                            .eq('email', userInfo.email)
                            .single()];
                    case 1:
                        existingUser = (_b.sent()).data;
                        if (!existingUser) return [3 /*break*/, 3];
                        // Link SSO account to existing user
                        return [4 /*yield*/, this.linkSSOAccount(existingUser.id, provider.id, userInfo)];
                    case 2:
                        // Link SSO account to existing user
                        _b.sent();
                        return [2 /*return*/, existingUser.id];
                    case 3: return [4 /*yield*/, this.supabase
                            .from('users')
                            .insert({
                            email: userInfo.email,
                            email_verified: userInfo.emailVerified,
                            name: userInfo.name,
                            first_name: userInfo.firstName,
                            last_name: userInfo.lastName,
                            avatar_url: userInfo.picture,
                            locale: userInfo.locale,
                            created_via_sso: true,
                            sso_provider: provider.id,
                        })
                            .select('id')
                            .single()];
                    case 4:
                        _a = _b.sent(), newUser = _a.data, error = _a.error;
                        if (error) {
                            throw this.createError('ACCOUNT_LINKING_FAILED', "Failed to create user: ".concat(error.message));
                        }
                        // Link SSO account
                        return [4 /*yield*/, this.linkSSOAccount(newUser.id, provider.id, userInfo)];
                    case 5:
                        // Link SSO account
                        _b.sent();
                        return [2 /*return*/, newUser.id];
                }
            });
        });
    };
    /**
     * Link SSO account to user
     */
    SSOManager.prototype.linkSSOAccount = function (userId, providerId, userInfo) {
        return __awaiter(this, void 0, void 0, function () {
            var linking, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        linking = {
                            userId: userId,
                            providerId: providerId,
                            providerUserId: userInfo.id,
                            email: userInfo.email,
                            linkedAt: new Date(),
                            linkingMethod: 'automatic',
                            verified: userInfo.emailVerified,
                            primary: true,
                        };
                        return [4 /*yield*/, this.supabase
                                .from('sso_account_links')
                                .upsert(linking, {
                                onConflict: 'user_id,provider_id',
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            throw this.createError('ACCOUNT_LINKING_FAILED', "Failed to link account: ".concat(error.message));
                        }
                        return [4 /*yield*/, this.logAudit({
                                userId: userId,
                                providerId: providerId,
                                action: 'sso_account_link',
                                details: { email: userInfo.email, method: 'automatic' },
                                success: true,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create SSO session
     */
    SSOManager.prototype.createSSOSession = function (sessionData) {
        return __awaiter(this, void 0, void 0, function () {
            var session, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = __assign(__assign({}, sessionData), { createdAt: new Date(), lastUsedAt: new Date() });
                        return [4 /*yield*/, this.supabase
                                .from('sso_sessions')
                                .insert(session)
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw this.createError('PROVIDER_ERROR', "Failed to create session: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                }
            });
        });
    };
    /**
     * Refresh SSO token
     */
    SSOManager.prototype.refreshToken = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, session, error, provider, tokenResponse, updatedSession, _b, data, updateError, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('sso_sessions')
                            .select('*')
                            .eq('id', sessionId)
                            .single()];
                    case 1:
                        _a = _c.sent(), session = _a.data, error = _a.error;
                        if (error || !session) {
                            throw this.createError('TOKEN_INVALID', 'Session not found');
                        }
                        if (!session.refreshToken) {
                            throw this.createError('TOKEN_INVALID', 'No refresh token available');
                        }
                        provider = this.providers.get(session.providerId);
                        if (!provider) {
                            throw this.createError('PROVIDER_NOT_FOUND', "Provider ".concat(session.providerId, " not found"));
                        }
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.refreshAccessToken(provider, session.refreshToken)];
                    case 3:
                        tokenResponse = _c.sent();
                        updatedSession = __assign(__assign({}, session), { accessToken: tokenResponse.accessToken, refreshToken: tokenResponse.refreshToken || session.refreshToken, expiresAt: new Date(Date.now() + tokenResponse.expiresIn * 1000), lastUsedAt: new Date() });
                        return [4 /*yield*/, this.supabase
                                .from('sso_sessions')
                                .update(updatedSession)
                                .eq('id', sessionId)
                                .select()
                                .single()];
                    case 4:
                        _b = _c.sent(), data = _b.data, updateError = _b.error;
                        if (updateError) {
                            throw this.createError('PROVIDER_ERROR', "Failed to update session: ".concat(updateError.message));
                        }
                        return [4 /*yield*/, this.logAudit({
                                userId: session.userId,
                                providerId: session.providerId,
                                action: 'sso_token_refresh',
                                details: { sessionId: sessionId },
                                success: true,
                            })];
                    case 5:
                        _c.sent();
                        return [2 /*return*/, data];
                    case 6:
                        error_2 = _c.sent();
                        return [4 /*yield*/, this.logAudit({
                                userId: session.userId,
                                providerId: session.providerId,
                                action: 'sso_token_refresh',
                                details: { sessionId: sessionId, error: error_2.message },
                                success: false,
                                errorMessage: error_2.message,
                            })];
                    case 7:
                        _c.sent();
                        throw error_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Refresh access token using refresh token
     */
    SSOManager.prototype.refreshAccessToken = function (provider, refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var params, response, errorData, tokenData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        params = new URLSearchParams({
                            grant_type: 'refresh_token',
                            client_id: provider.config.clientId,
                            client_secret: provider.config.clientSecret || '',
                            refresh_token: refreshToken,
                        });
                        return [4 /*yield*/, fetch(provider.config.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                },
                                body: params.toString(),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _a.sent();
                        throw this.createError('TOKEN_EXPIRED', "Token refresh failed: ".concat(errorData));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        tokenData = _a.sent();
                        return [2 /*return*/, {
                                accessToken: tokenData.access_token,
                                tokenType: tokenData.token_type || 'Bearer',
                                expiresIn: tokenData.expires_in || 3600,
                                refreshToken: tokenData.refresh_token,
                                scope: tokenData.scope,
                            }];
                }
            });
        });
    };
    /**
     * Logout from SSO session
     */
    SSOManager.prototype.logout = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, session, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('sso_sessions')
                            .select('*')
                            .eq('id', sessionId)
                            .single()];
                    case 1:
                        _a = _b.sent(), session = _a.data, error = _a.error;
                        if (error || !session) {
                            return [2 /*return*/]; // Session already doesn't exist
                        }
                        // Delete session
                        return [4 /*yield*/, this.supabase
                                .from('sso_sessions')
                                .delete()
                                .eq('id', sessionId)];
                    case 2:
                        // Delete session
                        _b.sent();
                        return [4 /*yield*/, this.logAudit({
                                userId: session.userId,
                                providerId: session.providerId,
                                action: 'sso_logout',
                                details: { sessionId: sessionId },
                                success: true,
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get domain-based SSO provider
     */
    SSOManager.prototype.getDomainProvider = function (email) {
        var domain = email.split('@')[1];
        if (!domain)
            return null;
        var domainMapping = this.config.domainMappings.find(function (mapping) {
            return mapping.domain === domain && mapping.autoRedirect;
        });
        if (!domainMapping)
            return null;
        return this.providers.get(domainMapping.providerId) || null;
    };
    /**
     * Validate SSO session
     */
    SSOManager.prototype.validateSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, session, error, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('sso_sessions')
                            .select('*')
                            .eq('id', sessionId)
                            .single()];
                    case 1:
                        _a = _c.sent(), session = _a.data, error = _a.error;
                        if (error || !session) {
                            return [2 /*return*/, null];
                        }
                        if (!(new Date() > new Date(session.expiresAt))) return [3 /*break*/, 6];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 6]);
                        return [4 /*yield*/, this.refreshToken(sessionId)];
                    case 3: return [2 /*return*/, _c.sent()];
                    case 4:
                        _b = _c.sent();
                        // Delete expired session
                        return [4 /*yield*/, this.supabase
                                .from('sso_sessions')
                                .delete()
                                .eq('id', sessionId)];
                    case 5:
                        // Delete expired session
                        _c.sent();
                        return [2 /*return*/, null];
                    case 6: 
                    // Update last used timestamp
                    return [4 /*yield*/, this.supabase
                            .from('sso_sessions')
                            .update({ lastUsedAt: new Date() })
                            .eq('id', sessionId)];
                    case 7:
                        // Update last used timestamp
                        _c.sent();
                        return [2 /*return*/, session];
                }
            });
        });
    };
    /**
     * Store auth request for validation
     */
    SSOManager.prototype.storeAuthRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Store in cache/database with expiration
                // Implementation depends on your caching strategy
                logger_1.logger.info('Auth request stored', { state: request.state, providerId: request.providerId });
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get stored auth request
     */
    SSOManager.prototype.getAuthRequest = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Retrieve from cache/database
                // Implementation depends on your caching strategy
                logger_1.logger.info('Auth request retrieved', { state: state });
                return [2 /*return*/, null]; // Placeholder
            });
        });
    };
    /**
     * Generate secure random token
     */
    SSOManager.prototype.generateSecureToken = function () {
        return crypto_1.default.randomBytes(32).toString('base64url');
    };
    /**
     * Log audit event
     */
    SSOManager.prototype.logAudit = function (auditData) {
        return __awaiter(this, void 0, void 0, function () {
            var audit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        audit = __assign(__assign({}, auditData), { timestamp: new Date(), ipAddress: '0.0.0.0', userAgent: 'Unknown' });
                        return [4 /*yield*/, this.supabase
                                .from('sso_audit_logs')
                                .insert(audit)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create SSO error
     */
    SSOManager.prototype.createError = function (code, message, details) {
        return {
            code: code,
            message: message,
            details: details,
            timestamp: new Date(),
        };
    };
    /**
     * Get available SSO providers
     */
    SSOManager.prototype.getAvailableProviders = function () {
        return Array.from(this.providers.values()).filter(function (provider) { return provider.enabled; });
    };
    /**
     * Get SSO configuration
     */
    SSOManager.prototype.getConfiguration = function () {
        return this.config;
    };
    /**
     * Update SSO configuration
     */
    SSOManager.prototype.updateConfiguration = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.config = __assign(__assign({}, this.config), config);
                        this.providers.clear();
                        this.initializeProviders();
                        return [4 /*yield*/, this.logAudit({
                                providerId: 'system',
                                action: 'sso_provider_config_change',
                                details: { changes: config },
                                success: true,
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return SSOManager;
}());
exports.SSOManager = SSOManager;
// Export singleton instance
exports.ssoManager = new SSOManager(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
