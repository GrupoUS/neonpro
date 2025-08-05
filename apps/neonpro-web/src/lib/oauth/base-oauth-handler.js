"use strict";
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
exports.BaseOAuthHandler = void 0;
var server_1 = require("@/lib/supabase/server");
var token_encryption_1 = require("./token-encryption");
/**
 * Base OAuth Handler for NeonPro Social Media Integration
 * Implements common OAuth 2.0 patterns with security best practices
 * Research-backed implementation from Meta Graph API documentation
 */
var BaseOAuthHandler = /** @class */ (function () {
    function BaseOAuthHandler(config, platform) {
        this.config = config;
        this.platform = platform;
        this.validateConfig();
    }
    BaseOAuthHandler.prototype.validateConfig = function () {
        var required = ['clientId', 'clientSecret', 'redirectUri', 'authUrl', 'tokenUrl'];
        for (var _i = 0, required_1 = required; _i < required_1.length; _i++) {
            var field = required_1[_i];
            if (!this.config[field]) {
                throw new Error("OAuth configuration missing required field: ".concat(field));
            }
        }
    };
    /**
     * Store OAuth state in database for CSRF protection
     */
    BaseOAuthHandler.prototype.storeOAuthState = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('oauth_states')
                                .insert({
                                state_id: state.nonce,
                                user_id: state.userId,
                                clinic_id: state.clinicId,
                                platform: state.platform,
                                created_at: state.createdAt.toISOString(),
                                redirect_to: state.redirectTo,
                                expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
                            })];
                    case 2:
                        error = (_a.sent()).error;
                        if (error) {
                            throw new Error("Failed to store OAuth state: ".concat(error.message));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Validate and retrieve OAuth state from database
     */
    BaseOAuthHandler.prototype.validateOAuthState = function (stateId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('oauth_states')
                                .select('*')
                                .eq('state_id', stateId)
                                .eq('platform', this.platform)
                                .gt('expires_at', new Date().toISOString())
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, null];
                        }
                        // Delete the used state to prevent replay attacks
                        return [4 /*yield*/, supabase
                                .from('oauth_states')
                                .delete()
                                .eq('state_id', stateId)];
                    case 3:
                        // Delete the used state to prevent replay attacks
                        _b.sent();
                        return [2 /*return*/, {
                                userId: data.user_id,
                                clinicId: data.clinic_id,
                                platform: data.platform,
                                nonce: data.state_id,
                                createdAt: new Date(data.created_at),
                                redirectTo: data.redirect_to
                            }];
                }
            });
        });
    };
    /**
     * Store encrypted tokens in database
     */
    BaseOAuthHandler.prototype.storeTokens = function (userId, clinicId, tokens, profile) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, encryptedAccessToken, encryptedRefreshToken, accountData, _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _b.sent();
                        encryptedAccessToken = token_encryption_1.TokenEncryptionService.encryptToken(tokens.accessToken);
                        encryptedRefreshToken = tokens.refreshToken
                            ? token_encryption_1.TokenEncryptionService.encryptToken(tokens.refreshToken)
                            : null;
                        accountData = {
                            user_id: userId,
                            clinic_id: clinicId,
                            platform_id: this.platform,
                            platform_user_id: profile.id,
                            platform_username: profile.username || profile.name,
                            platform_name: profile.name,
                            profile_picture_url: profile.profilePicture,
                            follower_count: profile.followerCount || 0,
                            is_verified: profile.isVerified || false,
                            encrypted_access_token: JSON.stringify(encryptedAccessToken),
                            encrypted_refresh_token: encryptedRefreshToken ? JSON.stringify(encryptedRefreshToken) : null,
                            token_expires_at: tokens.expiresAt.toISOString(),
                            token_scopes: tokens.scope ? tokens.scope.split(' ') : this.config.scopes,
                            is_active: true,
                            last_sync_at: new Date().toISOString()
                        };
                        return [4 /*yield*/, supabase
                                .from('social_media_accounts')
                                .upsert(accountData, {
                                onConflict: 'user_id,platform_id,platform_user_id'
                            })
                                .select('id')
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to store social media account: ".concat(error.message));
                        }
                        return [2 /*return*/, data.id];
                }
            });
        });
    };
    /**
     * Retrieve and decrypt tokens from database
     */
    BaseOAuthHandler.prototype.getStoredTokens = function (accountId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, accessTokenData, accessToken, refreshToken, refreshTokenData;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('social_media_accounts')
                                .select('encrypted_access_token, encrypted_refresh_token, token_expires_at, token_scopes')
                                .eq('id', accountId)
                                .eq('is_active', true)
                                .single()];
                    case 2:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error || !data) {
                            return [2 /*return*/, null];
                        }
                        try {
                            accessTokenData = JSON.parse(data.encrypted_access_token);
                            accessToken = token_encryption_1.TokenEncryptionService.decryptToken(accessTokenData);
                            refreshToken = void 0;
                            if (data.encrypted_refresh_token) {
                                refreshTokenData = JSON.parse(data.encrypted_refresh_token);
                                refreshToken = token_encryption_1.TokenEncryptionService.decryptToken(refreshTokenData);
                            }
                            return [2 /*return*/, {
                                    accessToken: accessToken,
                                    refreshToken: refreshToken,
                                    expiresAt: new Date(data.token_expires_at),
                                    expiresIn: Math.floor((new Date(data.token_expires_at).getTime() - Date.now()) / 1000),
                                    tokenType: 'Bearer',
                                    scope: (_b = data.token_scopes) === null || _b === void 0 ? void 0 : _b.join(' ')
                                }];
                        }
                        catch (error) {
                            throw new Error("Failed to decrypt tokens: ".concat(error instanceof Error ? error.message : 'Unknown error'));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if tokens need refresh (within 24 hours of expiry)
     */
    BaseOAuthHandler.prototype.shouldRefreshTokens = function (tokens) {
        var twentyFourHours = 24 * 60 * 60 * 1000;
        return (tokens.expiresAt.getTime() - Date.now()) < twentyFourHours;
    };
    /**
     * Clean up expired OAuth states
     */
    BaseOAuthHandler.prototype.cleanupExpiredStates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var supabase;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        supabase = _a.sent();
                        return [4 /*yield*/, supabase
                                .from('oauth_states')
                                .delete()
                                .lt('expires_at', new Date().toISOString())];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return BaseOAuthHandler;
}());
exports.BaseOAuthHandler = BaseOAuthHandler;
