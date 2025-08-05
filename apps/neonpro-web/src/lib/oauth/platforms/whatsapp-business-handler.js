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
exports.WhatsAppBusinessOAuthHandler = void 0;
var base_oauth_handler_1 = require("../base-oauth-handler");
var WhatsAppBusinessOAuthHandler = /** @class */ (function (_super) {
    __extends(WhatsAppBusinessOAuthHandler, _super);
    function WhatsAppBusinessOAuthHandler() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.platform = 'whatsapp_business';
        return _this;
    }
    WhatsAppBusinessOAuthHandler.prototype.getAuthConfig = function () {
        return {
            authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
            tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
            scope: [
                'whatsapp_business_management',
                'whatsapp_business_messaging',
                'business_management',
                'pages_manage_metadata',
                'pages_read_engagement'
            ].join(','),
            clientId: process.env.WHATSAPP_CLIENT_ID,
            clientSecret: process.env.WHATSAPP_CLIENT_SECRET,
            redirectUri: "".concat(process.env.NEXT_PUBLIC_APP_URL, "/api/oauth/whatsapp-business/callback"),
            extraParams: {
                config_id: process.env.WHATSAPP_CONFIG_ID, // Required for WhatsApp Business
                response_type: 'code'
            }
        };
    };
    WhatsAppBusinessOAuthHandler.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var userResponse, _a, _b, userData, wabaResponse, whatsappAccounts, wabaData, phoneNumbers, error_1;
            var _c, _d;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 10, , 11]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=".concat(accessToken))];
                    case 1:
                        userResponse = _f.sent();
                        if (!!userResponse.ok) return [3 /*break*/, 3];
                        _a = types_1.OAuthError.bind;
                        _b = [void 0, 'Failed to fetch user info',
                            userResponse.status];
                        return [4 /*yield*/, userResponse.text()];
                    case 2: throw new (_a.apply(types_1.OAuthError, _b.concat([_f.sent()])))();
                    case 3: return [4 /*yield*/, userResponse.json()];
                    case 4:
                        userData = _f.sent();
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/me/businesses?fields=whatsapp_business_accounts{id,name,currency,timezone_id,message_template_namespace}&access_token=".concat(accessToken))];
                    case 5:
                        wabaResponse = _f.sent();
                        whatsappAccounts = [];
                        if (!wabaResponse.ok) return [3 /*break*/, 7];
                        return [4 /*yield*/, wabaResponse.json()];
                    case 6:
                        wabaData = _f.sent();
                        // Extract WhatsApp Business Accounts from business accounts
                        whatsappAccounts = ((_e = wabaData.data) === null || _e === void 0 ? void 0 : _e.flatMap(function (business) { var _a; return ((_a = business.whatsapp_business_accounts) === null || _a === void 0 ? void 0 : _a.data) || []; })) || [];
                        _f.label = 7;
                    case 7: return [4 /*yield*/, this.getPhoneNumbers(accessToken, whatsappAccounts)];
                    case 8:
                        phoneNumbers = _f.sent();
                        _c = {
                            id: userData.id,
                            name: userData.name,
                            email: userData.email,
                            profilePicture: "https://graph.facebook.com/v18.0/".concat(userData.id, "/picture?type=large")
                        };
                        _d = {
                            whatsappBusinessAccounts: whatsappAccounts,
                            phoneNumbers: phoneNumbers
                        };
                        return [4 /*yield*/, this.getUserPermissions(accessToken, userData.id)];
                    case 9: return [2 /*return*/, (_c.platformData = (_d.permissions = _f.sent(),
                            _d),
                            _c)];
                    case 10:
                        error_1 = _f.sent();
                        if (error_1 instanceof types_1.OAuthError) {
                            throw error_1;
                        }
                        throw new types_1.OAuthError('Failed to get WhatsApp Business user info', 500, error_1 instanceof Error ? error_1.message : 'Unknown error');
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.refreshAccessToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var config, response, _a, _b, data, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        config = this.getAuthConfig();
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/oauth/access_token?" +
                                "grant_type=fb_exchange_token&" +
                                "client_id=".concat(config.clientId, "&") +
                                "client_secret=".concat(config.clientSecret, "&") +
                                "fb_exchange_token=".concat(refreshToken))];
                    case 1:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        _a = types_1.OAuthError.bind;
                        _b = [void 0, 'Failed to refresh WhatsApp Business access token',
                            response.status];
                        return [4 /*yield*/, response.text()];
                    case 2: throw new (_a.apply(types_1.OAuthError, _b.concat([_c.sent()])))();
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _c.sent();
                        return [2 /*return*/, {
                                accessToken: data.access_token,
                                refreshToken: data.access_token, // Facebook doesn't provide separate refresh tokens
                                expiresIn: data.expires_in || 5183944, // Facebook long-lived tokens (~60 days)
                                scope: config.scope,
                                tokenType: 'Bearer'
                            }];
                    case 5:
                        error_2 = _c.sent();
                        if (error_2 instanceof types_1.OAuthError) {
                            throw error_2;
                        }
                        throw new types_1.OAuthError('Failed to refresh WhatsApp Business token', 500, error_2 instanceof Error ? error_2.message : 'Unknown error');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.validateToken = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/me/businesses?fields=whatsapp_business_accounts&access_token=".concat(accessToken))];
                    case 1:
                        response = _b.sent();
                        return [2 /*return*/, response.ok];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.revokeToken = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var userResponse, userData, response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/me?access_token=".concat(accessToken))];
                    case 1:
                        userResponse = _b.sent();
                        if (!userResponse.ok) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, userResponse.json()];
                    case 2:
                        userData = _b.sent();
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(userData.id, "/permissions"), {
                                method: 'DELETE',
                                headers: {
                                    'Authorization': "Bearer ".concat(accessToken)
                                }
                            })];
                    case 3:
                        response = _b.sent();
                        return [2 /*return*/, response.ok];
                    case 4:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.getPhoneNumbers = function (accessToken, whatsappAccounts) {
        return __awaiter(this, void 0, void 0, function () {
            var phoneNumbers, _loop_1, _i, whatsappAccounts_1, account;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        phoneNumbers = [];
                        _loop_1 = function (account) {
                            var response, data, error_3;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 4, , 5]);
                                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(account.id, "/phone_numbers?access_token=").concat(accessToken))];
                                    case 1:
                                        response = _b.sent();
                                        if (!response.ok) return [3 /*break*/, 3];
                                        return [4 /*yield*/, response.json()];
                                    case 2:
                                        data = _b.sent();
                                        phoneNumbers.push.apply(phoneNumbers, (data.data || []).map(function (phone) { return (__assign(__assign({}, phone), { waba_id: account.id, waba_name: account.name })); }));
                                        _b.label = 3;
                                    case 3: return [3 /*break*/, 5];
                                    case 4:
                                        error_3 = _b.sent();
                                        console.warn("Failed to get phone numbers for WABA ".concat(account.id, ":"), error_3);
                                        return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, whatsappAccounts_1 = whatsappAccounts;
                        _a.label = 1;
                    case 1:
                        if (!(_i < whatsappAccounts_1.length)) return [3 /*break*/, 4];
                        account = whatsappAccounts_1[_i];
                        return [5 /*yield**/, _loop_1(account)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, phoneNumbers];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.getUserPermissions = function (accessToken, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, data, _a;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(userId, "/permissions?access_token=").concat(accessToken))];
                    case 1:
                        response = _d.sent();
                        if (!response.ok) {
                            return [2 /*return*/, []];
                        }
                        return [4 /*yield*/, response.json()];
                    case 2:
                        data = _d.sent();
                        return [2 /*return*/, ((_c = (_b = data.data) === null || _b === void 0 ? void 0 : _b.filter(function (perm) { return perm.status === 'granted'; })) === null || _c === void 0 ? void 0 : _c.map(function (perm) { return perm.permission; })) || []];
                    case 3:
                        _a = _d.sent();
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.getErrorMessage = function (error) {
        var _a;
        if ((_a = error === null || error === void 0 ? void 0 : error.error) === null || _a === void 0 ? void 0 : _a.message) {
            return error.error.message;
        }
        if (error === null || error === void 0 ? void 0 : error.error_description) {
            return error.error_description;
        }
        return 'WhatsApp Business OAuth error occurred';
    };
    // WhatsApp Business specific methods
    WhatsAppBusinessOAuthHandler.prototype.sendMessage = function (accessToken, phoneNumberId, to, message) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, _b, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(phoneNumberId, "/messages"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': "Bearer ".concat(accessToken)
                                },
                                body: JSON.stringify({
                                    messaging_product: 'whatsapp',
                                    to: to,
                                    text: { body: message }
                                })
                            })];
                    case 1:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        _a = types_1.OAuthError.bind;
                        _b = [void 0, 'Failed to send WhatsApp message',
                            response.status];
                        return [4 /*yield*/, response.text()];
                    case 2: throw new (_a.apply(types_1.OAuthError, _b.concat([_c.sent()])))();
                    case 3: return [4 /*yield*/, response.json()];
                    case 4: return [2 /*return*/, _c.sent()];
                    case 5:
                        error_4 = _c.sent();
                        if (error_4 instanceof types_1.OAuthError) {
                            throw error_4;
                        }
                        throw new types_1.OAuthError('Failed to send WhatsApp message', 500, error_4 instanceof Error ? error_4.message : 'Unknown error');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    WhatsAppBusinessOAuthHandler.prototype.getMessageTemplates = function (accessToken, wabaId) {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a, _b, data, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, fetch("https://graph.facebook.com/v18.0/".concat(wabaId, "/message_templates?access_token=").concat(accessToken))];
                    case 1:
                        response = _c.sent();
                        if (!!response.ok) return [3 /*break*/, 3];
                        _a = types_1.OAuthError.bind;
                        _b = [void 0, 'Failed to get WhatsApp message templates',
                            response.status];
                        return [4 /*yield*/, response.text()];
                    case 2: throw new (_a.apply(types_1.OAuthError, _b.concat([_c.sent()])))();
                    case 3: return [4 /*yield*/, response.json()];
                    case 4:
                        data = _c.sent();
                        return [2 /*return*/, data.data || []];
                    case 5:
                        error_5 = _c.sent();
                        if (error_5 instanceof types_1.OAuthError) {
                            throw error_5;
                        }
                        throw new types_1.OAuthError('Failed to get WhatsApp message templates', 500, error_5 instanceof Error ? error_5.message : 'Unknown error');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return WhatsAppBusinessOAuthHandler;
}(base_oauth_handler_1.BaseOAuthHandler));
exports.WhatsAppBusinessOAuthHandler = WhatsAppBusinessOAuthHandler;
