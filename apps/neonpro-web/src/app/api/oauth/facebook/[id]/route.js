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
exports.GET = GET;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var facebook_handler_1 = require("@/lib/oauth/platforms/facebook-handler");
var token_encryption_1 = require("@/lib/oauth/token-encryption");
/**
 * Facebook OAuth Account Management Endpoint
 * Handles individual Facebook account operations
 *
 * Features:
 * - Account status retrieval
 * - Token validation and refresh
 * - Account disconnection
 * - Comprehensive error handling
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, id, accountId, _c, account, accountError, tokenExpiresAt, now, hoursUntilExpiry, isExpiringSoon, isExpired, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_d.sent()).data.session;
                    if (!(session === null || session === void 0 ? void 0 : session.user)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized - Please log in to access account information' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_d.sent()).id;
                    accountId = id;
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .select("\n        id,\n        platform_user_id,\n        platform_username,\n        platform_name,\n        profile_picture_url,\n        follower_count,\n        is_verified,\n        token_expires_at,\n        token_scopes,\n        is_active,\n        last_sync_at,\n        created_at\n      ")
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'facebook')
                            .single()];
                case 4:
                    _c = _d.sent(), account = _c.data, accountError = _c.error;
                    if (accountError || !account) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Facebook account not found or access denied' }, { status: 404 })];
                    }
                    tokenExpiresAt = new Date(account.token_expires_at);
                    now = new Date();
                    hoursUntilExpiry = (tokenExpiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
                    isExpiringSoon = hoursUntilExpiry < 24;
                    isExpired = hoursUntilExpiry < 0;
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            account: {
                                id: account.id,
                                platformUserId: account.platform_user_id,
                                username: account.platform_username,
                                name: account.platform_name,
                                profilePicture: account.profile_picture_url,
                                followerCount: account.follower_count,
                                isVerified: account.is_verified,
                                scopes: account.token_scopes,
                                isActive: account.is_active,
                                lastSync: account.last_sync_at,
                                connectedAt: account.created_at,
                                tokenStatus: {
                                    expiresAt: account.token_expires_at,
                                    hoursUntilExpiry: Math.max(0, hoursUntilExpiry),
                                    isExpired: isExpired,
                                    isExpiringSoon: isExpiringSoon,
                                    needsRefresh: isExpiringSoon
                                }
                            }
                        })];
                case 5:
                    error_1 = _d.sent();
                    console.error('Facebook account retrieval error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to retrieve Facebook account information',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, id, accountId, _c, account, accountError, accessToken, encryptedAccessToken, facebookHandler, revokeError_1, deactivateError, error_2;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _d.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_d.sent()).data.session;
                    if (!(session === null || session === void 0 ? void 0 : session.user)) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized - Please log in to disconnect account' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_d.sent()).id;
                    accountId = id;
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .select('encrypted_access_token, platform_username')
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'facebook')
                            .single()];
                case 4:
                    _c = _d.sent(), account = _c.data, accountError = _c.error;
                    if (accountError || !account) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Facebook account not found or access denied' }, { status: 404 })];
                    }
                    accessToken = void 0;
                    try {
                        encryptedAccessToken = JSON.parse(account.encrypted_access_token);
                        accessToken = token_encryption_1.TokenEncryptionService.decryptToken(encryptedAccessToken);
                    }
                    catch (decryptError) {
                        console.warn('Could not decrypt access token for revocation:', decryptError);
                        // Continue with disconnection even if token decryption fails
                    }
                    if (!accessToken) return [3 /*break*/, 8];
                    _d.label = 5;
                case 5:
                    _d.trys.push([5, 7, , 8]);
                    facebookHandler = new facebook_handler_1.FacebookOAuthHandler();
                    return [4 /*yield*/, facebookHandler.revokeTokens(accessToken)];
                case 6:
                    _d.sent();
                    console.log("Facebook tokens revoked for account ".concat(accountId));
                    return [3 /*break*/, 8];
                case 7:
                    revokeError_1 = _d.sent();
                    console.warn('Failed to revoke Facebook tokens:', revokeError_1);
                    return [3 /*break*/, 8];
                case 8: return [4 /*yield*/, supabase
                        .from('social_media_accounts')
                        .update({
                        is_active: false,
                        disconnected_at: new Date().toISOString()
                    })
                        .eq('id', accountId)];
                case 9:
                    deactivateError = (_d.sent()).error;
                    if (deactivateError) {
                        throw new Error("Failed to disconnect account: ".concat(deactivateError.message));
                    }
                    // Log successful disconnection
                    console.log("Facebook account disconnected: ".concat(accountId, " (").concat(account.platform_username, ")"));
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Facebook account disconnected successfully'
                        })];
                case 10:
                    error_2 = _d.sent();
                    console.error('Facebook account disconnection error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to disconnect Facebook account',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
