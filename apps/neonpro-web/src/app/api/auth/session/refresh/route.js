"use strict";
/**
 * Session Refresh API Route
 * Refreshes an existing session and extends its expiry time
 */
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
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var server_2 = require("@/lib/supabase/server");
var session_1 = require("@/types/session");
// Initialize session manager
var sessionManager = null;
function getSessionManager() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!sessionManager) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    sessionManager = new SessionManager_1.SessionManager(supabase, {
                        defaultTimeout: 30,
                        maxConcurrentSessions: 5,
                        enableDeviceTracking: true,
                        enableSecurityMonitoring: true,
                        enableSuspiciousActivityDetection: true,
                        sessionCleanupInterval: 300000,
                        securityEventRetention: 30 * 24 * 60 * 60 * 1000,
                        encryptionKey: process.env.SESSION_ENCRYPTION_KEY || 'default-key-change-in-production'
                    });
                    _a.label = 2;
                case 2: return [2 /*return*/, sessionManager];
            }
        });
    });
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var sessionToken, manager, clientIP, userAgent, validation, currentSession, refreshedSession, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    sessionToken = (_a = cookieStore.get('session-token')) === null || _a === void 0 ? void 0 : _a.value;
                    if (!sessionToken) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No session token found' }, { status: 401 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 1:
                    manager = _b.sent();
                    clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        '127.0.0.1';
                    userAgent = request.headers.get('user-agent') || 'Unknown';
                    return [4 /*yield*/, manager.validateSession(sessionToken, {
                            ip_address: clientIP,
                            user_agent: userAgent
                        })];
                case 2:
                    validation = _b.sent();
                    if (!validation.valid) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid session' }, { status: 401 })];
                    }
                    return [4 /*yield*/, manager.getSession(sessionToken)];
                case 3:
                    currentSession = _b.sent();
                    if (!currentSession) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Session not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, manager.refreshSession(sessionToken)];
                case 4:
                    refreshedSession = _b.sent();
                    if (!refreshedSession) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to refresh session' }, { status: 500 })];
                    }
                    // Log session refresh event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: sessionToken,
                            event_type: session_1.SecurityEventType.SESSION_REFRESHED,
                            severity: session_1.SecuritySeverity.LOW,
                            description: 'Session refreshed successfully',
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                old_expires_at: currentSession.expires_at,
                                new_expires_at: refreshedSession.expires_at,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 5:
                    // Log session refresh event
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json(refreshedSession)];
                case 6:
                    error_1 = _b.sent();
                    console.error('Session refresh error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error during session refresh' }, { status: 500 })];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function OPTIONS(request) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new server_1.NextResponse(null, {
                    status: 200,
                    headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                })];
        });
    });
}
