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
exports.PATCH = PATCH;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/app/utils/supabase/server");
var instagram_handler_1 = require("@/lib/oauth/platforms/instagram-handler");
var token_encryption_1 = require("@/lib/oauth/token-encryption");
/**
 * Instagram Account Management API
 * Handles Instagram account operations, media fetching, and insights
 * Research-backed implementation following Instagram Graph API patterns
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, id, accountId, searchParams, action, _c, account, accountError, encryptedAccessToken, accessToken, instagramHandler, _d, profile, limit, media, period, insights, isValid, error_1;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 15, , 16]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_e.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_e.sent()).id;
                    accountId = id;
                    searchParams = request.nextUrl.searchParams;
                    action = searchParams.get('action') || 'profile';
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .select('*')
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'instagram')
                            .eq('is_active', true)
                            .single()];
                case 4:
                    _c = _e.sent(), account = _c.data, accountError = _c.error;
                    if (accountError || !account) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Instagram account not found or not accessible' }, { status: 404 })];
                    }
                    encryptedAccessToken = JSON.parse(account.encrypted_access_token);
                    accessToken = token_encryption_1.TokenEncryptionService.decryptToken(encryptedAccessToken);
                    instagramHandler = new instagram_handler_1.InstagramOAuthHandler();
                    _d = action;
                    switch (_d) {
                        case 'profile': return [3 /*break*/, 5];
                        case 'media': return [3 /*break*/, 7];
                        case 'insights': return [3 /*break*/, 9];
                        case 'validate': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 5: return [4 /*yield*/, instagramHandler.getUserProfile(accessToken)];
                case 6:
                    profile = _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            profile: profile,
                            account: {
                                id: account.id,
                                username: account.platform_username,
                                isVerified: account.is_verified,
                                followerCount: account.follower_count,
                                lastSync: account.last_sync_at
                            }
                        })];
                case 7:
                    limit = parseInt(searchParams.get('limit') || '25');
                    return [4 /*yield*/, instagramHandler.getUserMedia(accessToken, limit)];
                case 8:
                    media = _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            media: media,
                            count: media.length
                        })];
                case 9:
                    period = searchParams.get('period') || 'day';
                    return [4 /*yield*/, instagramHandler.getAccountInsights(accessToken, period)];
                case 10:
                    insights = _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            insights: insights,
                            period: period
                        })];
                case 11: return [4 /*yield*/, instagramHandler.validateTokens({
                        accessToken: accessToken,
                        tokenType: 'Bearer',
                        expiresIn: Math.floor((new Date(account.token_expires_at).getTime() - Date.now()) / 1000),
                        expiresAt: new Date(account.token_expires_at)
                    })];
                case 12:
                    isValid = _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            isValid: isValid,
                            expiresAt: account.token_expires_at
                        })];
                case 13: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _e.sent();
                    console.error('Instagram account API error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to process Instagram account request',
                            details: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }, { status: 500 })];
                case 16: return [2 /*return*/];
            }
        });
    });
}
/**
 * Update Instagram account settings
 */
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, session, id, accountId, _c, isActive, autoPost, notificationsEnabled, updateData, _d, data, error, error_2;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _e.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 2:
                    session = (_e.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, params];
                case 3:
                    id = (_e.sent()).id;
                    accountId = id;
                    return [4 /*yield*/, request.json()];
                case 4:
                    _c = _e.sent(), isActive = _c.isActive, autoPost = _c.autoPost, notificationsEnabled = _c.notificationsEnabled;
                    updateData = {};
                    if (typeof isActive === 'boolean')
                        updateData.is_active = isActive;
                    if (typeof autoPost === 'boolean')
                        updateData.auto_post = autoPost;
                    if (typeof notificationsEnabled === 'boolean')
                        updateData.notifications_enabled = notificationsEnabled;
                    if (Object.keys(updateData).length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No valid update fields provided' }, { status: 400 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .update(updateData)
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'instagram')
                            .select()
                            .single()];
                case 5:
                    _d = _e.sent(), data = _d.data, error = _d.error;
                    if (error) {
                        throw new Error("Failed to update account: ".concat(error.message));
                    }
                    // Log account update
                    return [4 /*yield*/, supabase
                            .from('activity_logs')
                            .insert({
                            user_id: session.user.id,
                            clinic_id: data.clinic_id,
                            action: 'social_media_account_updated',
                            entity_type: 'social_media_account',
                            entity_id: accountId,
                            details: {
                                platform: 'instagram',
                                changes: updateData
                            }
                        })];
                case 6:
                    // Log account update
                    _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Instagram account updated successfully',
                            account: data
                        })];
                case 7:
                    error_2 = _e.sent();
                    console.error('Instagram account update error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to update Instagram account',
                            details: error_2 instanceof Error ? error_2.message : 'Unknown error'
                        }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Delete/disconnect Instagram account
 */
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var id, accountId, supabase, session, account, error, error_3;
        var params = _b.params;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, params];
                case 1:
                    id = (_c.sent()).id;
                    accountId = id;
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 2:
                    supabase = _c.sent();
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 3:
                    session = (_c.sent()).data.session;
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .select('clinic_id, platform_username')
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'instagram')
                            .single()];
                case 4:
                    account = (_c.sent()).data;
                    return [4 /*yield*/, supabase
                            .from('social_media_accounts')
                            .update({
                            is_active: false,
                            deleted_at: new Date().toISOString()
                        })
                            .eq('id', accountId)
                            .eq('user_id', session.user.id)
                            .eq('platform_id', 'instagram')];
                case 5:
                    error = (_c.sent()).error;
                    if (error) {
                        throw new Error("Failed to delete account: ".concat(error.message));
                    }
                    if (!account) return [3 /*break*/, 7];
                    return [4 /*yield*/, supabase
                            .from('activity_logs')
                            .insert({
                            user_id: session.user.id,
                            clinic_id: account.clinic_id,
                            action: 'social_media_account_deleted',
                            entity_type: 'social_media_account',
                            entity_id: accountId,
                            details: {
                                platform: 'instagram',
                                username: account.platform_username
                            }
                        })];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        message: 'Instagram account disconnected successfully'
                    })];
                case 8:
                    error_3 = _c.sent();
                    console.error('Instagram account deletion error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to disconnect Instagram account',
                            details: error_3 instanceof Error ? error_3.message : 'Unknown error'
                        }, { status: 500 })];
                case 9: return [2 /*return*/];
            }
        });
    });
}
