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
exports.WhatsAppOAuthHandler = void 0;
var base_oauth_handler_1 = require("../base-oauth-handler");
var logger_1 = require("@/lib/logger");
var WhatsAppOAuthHandler = /** @class */ (function (_super) {
    __extends(WhatsAppOAuthHandler, _super);
    function WhatsAppOAuthHandler() {
        var _this = _super.call(this) || this;
        _this.config = {
            provider: 'whatsapp',
            clientId: process.env.WHATSAPP_CLIENT_ID || '',
            clientSecret: process.env.WHATSAPP_CLIENT_SECRET || '',
            redirectUri: process.env.WHATSAPP_REDIRECT_URI || '',
            scopes: ['whatsapp_business_messaging', 'whatsapp_business_management'],
            authorizationUrl: 'https://developers.facebook.com/oauth/authorization',
            tokenUrl: 'https://graph.facebook.com/oauth/access_token',
            userInfoUrl: 'https://graph.facebook.com/me',
            revokeUrl: 'https://graph.facebook.com/oauth/revoke'
        };
        _this.validateConfig();
        return _this;
    }
    WhatsAppOAuthHandler.prototype.validateConfig = function () {
        var _this = this;
        var requiredFields = ['clientId', 'clientSecret', 'redirectUri'];
        var missing = requiredFields.filter(function (field) { return !_this.config[field]; });
        if (missing.length > 0) {
            throw new Error("Missing required WhatsApp OAuth configuration: ".concat(missing.join(', ')));
        }
    };
    WhatsAppOAuthHandler.prototype.getAuthorizationUrl = function (state) {
        return __awaiter(this, void 0, void 0, function () {
            var params, authUrl;
            return __generator(this, function (_a) {
                try {
                    params = new URLSearchParams({
                        client_id: this.config.clientId,
                        redirect_uri: this.config.redirectUri,
                        scope: this.config.scopes.join(','),
                        response_type: 'code',
                        state: state,
                        access_type: 'offline',
                        approval_prompt: 'force'
                    });
                    authUrl = "".concat(this.config.authorizationUrl, "?").concat(params.toString());
                    logger_1.logger.info('Generated WhatsApp authorization URL', {
                        provider: 'whatsapp',
                        state: state,
                        scopes: this.config.scopes
                    });
                    return [2 /*return*/, authUrl];
                }
                catch (error) {
                    logger_1.logger.error('Failed to generate WhatsApp authorization URL', { error: error });
                    throw new Error('Unable to generate authorization URL');
                }
                return [2 /*return*/];
            });
        });
    };
    WhatsAppOAuthHandler.prototype.exchangeCodeForTokens = function (code, state) {
        return __awaiter(this, void 0, void 0, function () {
            var response, errorData, tokenData, expiresAt, encryptedToken, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, fetch(this.config.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                },
                                body: new URLSearchParams({
                                    client_id: this.config.clientId,
                                    client_secret: this.config.clientSecret,
                                    code: code,
                                    redirect_uri: this.config.redirectUri,
                                    grant_type: 'authorization_code'
                                })
                            })];
                    case 1:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        return [4 /*yield*/, response.text()];
                    case 2:
                        errorData = _a.sent();
                        logger_1.logger.error('WhatsApp token exchange failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorData
                        });
                        throw new Error("Token exchange failed: ".concat(response.status, " ").concat(response.statusText));
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        tokenData = _a.sent();
                        expiresAt = tokenData.expires_in
                            ? new Date(Date.now() + tokenData.expires_in * 1000)
                            : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.encryptToken({
                                accessToken: tokenData.access_token,
                                refreshToken: tokenData.refresh_token || null,
                                expiresAt: expiresAt,
                                scopes: this.config.scopes,
                                tokenType: tokenData.token_type || 'Bearer'
                            })];
                    case 5:
                        encryptedToken = _a.sent();
                        logger_1.logger.info('WhatsApp token exchange successful', {
                            provider: 'whatsapp',
                            hasRefreshToken: !!tokenData.refresh_token,
                            expiresAt: expiresAt
                        });
                        return [2 /*return*/, encryptedToken];
                    case 6:
                        error_1 = _a.sent();
                        logger_1.logger.error('WhatsApp token exchange error', { error: error_1 });
                        throw error_1 instanceof Error ? error_1 : new Error('Token exchange failed');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.refreshToken = function (encryptedRefreshToken) {
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
                            throw new Error('No refresh token available');
                        }
                        return [4 /*yield*/, fetch(this.config.tokenUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                },
                                body: new URLSearchParams({
                                    client_id: this.config.clientId,
                                    client_secret: this.config.clientSecret,
                                    refresh_token: refreshToken.refreshToken,
                                    grant_type: 'refresh_token'
                                })
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _a.sent();
                        logger_1.logger.error('WhatsApp token refresh failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorData
                        });
                        throw new Error("Token refresh failed: ".concat(response.status, " ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        tokenData = _a.sent();
                        expiresAt = tokenData.expires_in
                            ? new Date(Date.now() + tokenData.expires_in * 1000)
                            : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, this.encryptToken({
                                accessToken: tokenData.access_token,
                                refreshToken: tokenData.refresh_token || refreshToken.refreshToken,
                                expiresAt: expiresAt,
                                scopes: this.config.scopes,
                                tokenType: tokenData.token_type || 'Bearer'
                            })];
                    case 6:
                        encryptedToken = _a.sent();
                        logger_1.logger.info('WhatsApp token refresh successful', {
                            provider: 'whatsapp',
                            expiresAt: expiresAt
                        });
                        return [2 /*return*/, encryptedToken];
                    case 7:
                        error_2 = _a.sent();
                        logger_1.logger.error('WhatsApp token refresh error', { error: error_2 });
                        throw error_2 instanceof Error ? error_2 : new Error('Token refresh failed');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.revokeToken = function (encryptedToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.decryptToken(encryptedToken)];
                    case 1:
                        token = _a.sent();
                        // Revoke access token
                        return [4 /*yield*/, fetch(this.config.revokeUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                },
                                body: new URLSearchParams({
                                    token: token.accessToken
                                })
                            })];
                    case 2:
                        // Revoke access token
                        _a.sent();
                        if (!token.refreshToken) return [3 /*break*/, 4];
                        return [4 /*yield*/, fetch(this.config.revokeUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                },
                                body: new URLSearchParams({
                                    token: token.refreshToken
                                })
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        logger_1.logger.info('WhatsApp token revocation successful', {
                            provider: 'whatsapp'
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        logger_1.logger.error('WhatsApp token revocation error', { error: error_3 });
                        throw error_3 instanceof Error ? error_3 : new Error('Token revocation failed');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.getUserInfo = function (encryptedToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, errorData, userInfo, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.decryptToken(encryptedToken)];
                    case 1:
                        token = _a.sent();
                        return [4 /*yield*/, fetch("".concat(this.config.userInfoUrl, "?fields=id,name,email&access_token=").concat(token.accessToken), {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _a.sent();
                        logger_1.logger.error('WhatsApp user info fetch failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorData
                        });
                        throw new Error("User info fetch failed: ".concat(response.status, " ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        userInfo = _a.sent();
                        logger_1.logger.info('WhatsApp user info fetch successful', {
                            provider: 'whatsapp',
                            userId: userInfo.id
                        });
                        return [2 /*return*/, userInfo];
                    case 6:
                        error_4 = _a.sent();
                        logger_1.logger.error('WhatsApp user info fetch error', { error: error_4 });
                        throw error_4 instanceof Error ? error_4 : new Error('User info fetch failed');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.validateToken = function (encryptedToken) {
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
                            logger_1.logger.warn('WhatsApp token is expired', {
                                provider: 'whatsapp',
                                expiresAt: token.expiresAt
                            });
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, fetch("".concat(this.config.userInfoUrl, "?access_token=").concat(token.accessToken), {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                }
                            })];
                    case 2:
                        response = _a.sent();
                        isValid = response.ok;
                        logger_1.logger.info('WhatsApp token validation completed', {
                            provider: 'whatsapp',
                            isValid: isValid,
                            status: response.status
                        });
                        return [2 /*return*/, isValid];
                    case 3:
                        error_5 = _a.sent();
                        logger_1.logger.error('WhatsApp token validation error', { error: error_5 });
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.getBusinessAccounts = function (encryptedToken) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, errorData, data, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.decryptToken(encryptedToken)];
                    case 1:
                        token = _b.sent();
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/me/businesses?access_token=".concat(token.accessToken), {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _b.sent();
                        logger_1.logger.error('WhatsApp business accounts fetch failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorData
                        });
                        throw new Error("Business accounts fetch failed: ".concat(response.status, " ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _b.sent();
                        logger_1.logger.info('WhatsApp business accounts fetch successful', {
                            provider: 'whatsapp',
                            accountCount: ((_a = data.data) === null || _a === void 0 ? void 0 : _a.length) || 0
                        });
                        return [2 /*return*/, data.data || []];
                    case 6:
                        error_6 = _b.sent();
                        logger_1.logger.error('WhatsApp business accounts fetch error', { error: error_6 });
                        throw error_6 instanceof Error ? error_6 : new Error('Business accounts fetch failed');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppOAuthHandler.prototype.getPhoneNumbers = function (encryptedToken, businessId) {
        return __awaiter(this, void 0, void 0, function () {
            var token, response, errorData, data, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.decryptToken(encryptedToken)];
                    case 1:
                        token = _b.sent();
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(businessId, "/phone_numbers?access_token=").concat(token.accessToken), {
                                method: 'GET',
                                headers: {
                                    'Accept': 'application/json',
                                    'User-Agent': 'NeonPro/1.0'
                                }
                            })];
                    case 2:
                        response = _b.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        errorData = _b.sent();
                        logger_1.logger.error('WhatsApp phone numbers fetch failed', {
                            status: response.status,
                            statusText: response.statusText,
                            error: errorData,
                            businessId: businessId
                        });
                        throw new Error("Phone numbers fetch failed: ".concat(response.status, " ").concat(response.statusText));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _b.sent();
                        logger_1.logger.info('WhatsApp phone numbers fetch successful', {
                            provider: 'whatsapp',
                            businessId: businessId,
                            phoneNumberCount: ((_a = data.data) === null || _a === void 0 ? void 0 : _a.length) || 0
                        });
                        return [2 /*return*/, data.data || []];
                    case 6:
                        error_7 = _b.sent();
                        logger_1.logger.error('WhatsApp phone numbers fetch error', { error: error_7, businessId: businessId });
                        throw error_7 instanceof Error ? error_7 : new Error('Phone numbers fetch failed');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return WhatsAppOAuthHandler;
}(base_oauth_handler_1.BaseOAuthHandler));
exports.WhatsAppOAuthHandler = WhatsAppOAuthHandler;
