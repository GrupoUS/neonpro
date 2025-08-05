"use strict";
/**
 * Session Validation API Route
 * Validates current session and returns security information
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
                        sessionCleanupInterval: 300000, // 5 minutes
                        securityEventRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
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
        var sessionToken, manager, clientIP, userAgent, validation, session, warnings, sessionAge, hoursOld, activeSessions, securityScore, result, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 13, , 14]);
                    sessionToken = (_a = cookieStore.get('session-token')) === null || _a === void 0 ? void 0 : _a.value;
                    if (!sessionToken) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                valid: false,
                                errors: ['No session token found'],
                                security_score: 0
                            }, { status: 401 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 1:
                    manager = _c.sent();
                    clientIP = request.headers.get('x-forwarded-for') ||
                        request.headers.get('x-real-ip') ||
                        '127.0.0.1';
                    userAgent = request.headers.get('user-agent') || 'Unknown';
                    return [4 /*yield*/, manager.validateSession(sessionToken, {
                            ip_address: clientIP,
                            user_agent: userAgent
                        })];
                case 2:
                    validation = _c.sent();
                    if (!!validation.valid) return [3 /*break*/, 4];
                    // Log failed validation attempt
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: sessionToken,
                            event_type: session_1.SecurityEventType.SESSION_VALIDATION_FAILED,
                            severity: session_1.SecuritySeverity.MEDIUM,
                            description: "Session validation failed: ".concat((_b = validation.errors) === null || _b === void 0 ? void 0 : _b.join(', ')),
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                validation_errors: validation.errors,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 3:
                    // Log failed validation attempt
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json(validation, { status: 401 })];
                case 4: return [4 /*yield*/, manager.getSession(sessionToken)];
                case 5:
                    session = _c.sent();
                    if (!session) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                valid: false,
                                errors: ['Session not found'],
                                security_score: 0
                            }, { status: 404 })];
                    }
                    // Update last activity
                    return [4 /*yield*/, manager.updateLastActivity(sessionToken)];
                case 6:
                    // Update last activity
                    _c.sent();
                    warnings = [];
                    if (!(session.ip_address !== clientIP)) return [3 /*break*/, 8];
                    warnings.push('IP address has changed since session creation');
                    // Log IP change event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: sessionToken,
                            event_type: session_1.SecurityEventType.IP_ADDRESS_CHANGE,
                            severity: session_1.SecuritySeverity.MEDIUM,
                            description: "IP address changed from ".concat(session.ip_address, " to ").concat(clientIP),
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                old_ip: session.ip_address,
                                new_ip: clientIP,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 7:
                    // Log IP change event
                    _c.sent();
                    _c.label = 8;
                case 8:
                    if (!(session.user_agent !== userAgent)) return [3 /*break*/, 10];
                    warnings.push('Browser or device information has changed');
                    // Log user agent change event
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: sessionToken,
                            event_type: session_1.SecurityEventType.USER_AGENT_CHANGE,
                            severity: session_1.SecuritySeverity.LOW,
                            description: 'User agent changed during session',
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                old_user_agent: session.user_agent,
                                new_user_agent: userAgent,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 9:
                    // Log user agent change event
                    _c.sent();
                    _c.label = 10;
                case 10:
                    sessionAge = Date.now() - new Date(session.created_at).getTime();
                    hoursOld = sessionAge / (1000 * 60 * 60);
                    if (hoursOld > 24) {
                        warnings.push('Session is older than 24 hours');
                    }
                    return [4 /*yield*/, manager.getActiveSessionsForUser(session.user_id)];
                case 11:
                    activeSessions = _c.sent();
                    if (activeSessions.length > 3) {
                        warnings.push("Multiple active sessions detected (".concat(activeSessions.length, ")"));
                    }
                    securityScore = 100;
                    securityScore -= warnings.length * 10;
                    securityScore -= Math.min(30, Math.floor(hoursOld / 24) * 10); // Deduct for age
                    securityScore = Math.max(0, securityScore);
                    // Log successful validation
                    return [4 /*yield*/, manager.logSecurityEvent({
                            session_id: sessionToken,
                            event_type: session_1.SecurityEventType.SESSION_VALIDATED,
                            severity: session_1.SecuritySeverity.LOW,
                            description: 'Session validated successfully',
                            ip_address: clientIP,
                            user_agent: userAgent,
                            metadata: {
                                security_score: securityScore,
                                warnings_count: warnings.length,
                                timestamp: new Date().toISOString()
                            }
                        })];
                case 12:
                    // Log successful validation
                    _c.sent();
                    result = {
                        valid: true,
                        session: session,
                        warnings: warnings.length > 0 ? warnings : undefined,
                        security_score: securityScore
                    };
                    return [2 /*return*/, server_1.NextResponse.json(result)];
                case 13:
                    error_1 = _c.sent();
                    console.error('Session validation error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            valid: false,
                            errors: ['Internal server error during session validation'],
                            security_score: 0
                        }, { status: 500 })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// Handle preflight requests
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
