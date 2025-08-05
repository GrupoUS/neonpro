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
exports.POST = POST;
exports.GET = GET;
exports.PUT = PUT;
var server_1 = require("next/server");
var session_timeout_manager_1 = require("@/lib/security/session-timeout-manager");
var auth_1 = require("@/lib/auth");
/**
 * Session Activity API Route
 * Handles session activity tracking and timeout management
 */
var timeoutManager = new session_timeout_manager_1.SessionTimeoutManager();
/**
 * POST /api/security/session-activity
 * Update session activity and reset timeout
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, body, sessionId, _a, activityType, _b, metadata, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
                case 1:
                    authResult = _c.sent();
                    if (!authResult.authenticated) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _c.sent();
                    sessionId = body.sessionId, _a = body.activityType, activityType = _a === void 0 ? 'user_interaction' : _a, _b = body.metadata, metadata = _b === void 0 ? {} : _b;
                    if (!sessionId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Session ID is required' }, { status: 400 })];
                    }
                    // Update session activity
                    return [4 /*yield*/, timeoutManager.updateActivity(authResult.user.id, sessionId, activityType, metadata)];
                case 3:
                    // Update session activity
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            message: 'Session activity updated successfully',
                            sessionId: sessionId,
                            activityType: activityType,
                            timestamp: new Date().toISOString()
                        })];
                case 4:
                    error_1 = _c.sent();
                    console.error('Session activity update error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update session activity' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * GET /api/security/session-activity
 * Get session timeout status and warnings
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, searchParams, sessionId, timeoutStatus, warning, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
                case 1:
                    authResult = _a.sent();
                    if (!authResult.authenticated) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    sessionId = searchParams.get('sessionId');
                    if (!sessionId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Session ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, timeoutManager.checkSessionTimeout(authResult.user.id, sessionId)];
                case 2:
                    timeoutStatus = _a.sent();
                    return [4 /*yield*/, timeoutManager.getTimeoutWarning(authResult.user.id, sessionId)];
                case 3:
                    warning = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            sessionId: sessionId,
                            timeoutStatus: timeoutStatus,
                            warning: warning,
                            timestamp: new Date().toISOString()
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('Session timeout check error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to check session timeout' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/security/session-activity
 * Extend session timeout
 */
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, body, sessionId, _a, extensionMinutes, result, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, auth_1.requireAuth)(request)];
                case 1:
                    authResult = _b.sent();
                    if (!authResult.authenticated) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _b.sent();
                    sessionId = body.sessionId, _a = body.extensionMinutes, extensionMinutes = _a === void 0 ? 30 : _a;
                    if (!sessionId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Session ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, timeoutManager.extendSession(authResult.user.id, sessionId, extensionMinutes)];
                case 3:
                    result = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            message: 'Session timeout extended successfully',
                            sessionId: sessionId,
                            extensionMinutes: extensionMinutes,
                            newExpiresAt: result.expiresAt,
                            timestamp: new Date().toISOString()
                        })];
                case 4:
                    error_3 = _b.sent();
                    console.error('Session extension error:', error_3);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to extend session timeout' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
