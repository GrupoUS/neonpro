"use strict";
/**
 * Session Analytics API Route
 * Provides session metrics and analytics data
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
exports.GET = GET;
exports.POST = POST;
exports.OPTIONS = OPTIONS;
var server_1 = require("next/server");
var SessionManager_1 = require("@/lib/auth/session/SessionManager");
var server_2 = require("@/lib/supabase/server");
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
// Get session analytics
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, userId, timeframe, includeDevices, includeSecurity, manager, now, startDate, metrics, analytics, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    searchParams = new URL(request.url).searchParams;
                    userId = searchParams.get('userId');
                    timeframe = searchParams.get('timeframe') || '7d';
                    includeDevices = searchParams.get('includeDevices') === 'true';
                    includeSecurity = searchParams.get('includeSecurity') === 'true';
                    return [4 /*yield*/, getSessionManager()];
                case 1:
                    manager = _a.sent();
                    now = new Date();
                    startDate = new Date();
                    switch (timeframe) {
                        case '1d':
                            startDate.setDate(now.getDate() - 1);
                            break;
                        case '7d':
                            startDate.setDate(now.getDate() - 7);
                            break;
                        case '30d':
                            startDate.setDate(now.getDate() - 30);
                            break;
                        case '90d':
                            startDate.setDate(now.getDate() - 90);
                            break;
                        default:
                            startDate.setDate(now.getDate() - 7);
                    }
                    return [4 /*yield*/, manager.getSessionMetrics(userId, {
                            startDate: startDate.toISOString(),
                            endDate: now.toISOString(),
                            includeDevices: includeDevices,
                            includeSecurity: includeSecurity
                        })];
                case 2:
                    metrics = _a.sent();
                    analytics = {
                        timeframe: timeframe,
                        period: {
                            start: startDate.toISOString(),
                            end: now.toISOString()
                        },
                        metrics: metrics,
                        summary: {
                            totalSessions: metrics.totalSessions || 0,
                            activeSessions: metrics.activeSessions || 0,
                            averageSessionDuration: metrics.averageSessionDuration || 0,
                            securityEvents: metrics.securityEvents || 0,
                            uniqueDevices: metrics.uniqueDevices || 0,
                            suspiciousActivities: metrics.suspiciousActivities || 0
                        }
                    };
                    // Add device breakdown if requested
                    if (includeDevices && metrics.deviceBreakdown) {
                        analytics.deviceBreakdown = metrics.deviceBreakdown;
                    }
                    // Add security breakdown if requested
                    if (includeSecurity && metrics.securityBreakdown) {
                        analytics.securityBreakdown = metrics.securityBreakdown;
                    }
                    return [2 /*return*/, server_1.NextResponse.json(analytics)];
                case 3:
                    error_1 = _a.sent();
                    console.error('Get session analytics error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error while fetching session analytics' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get real-time session status
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, manager, activeSessions, recentSecurityEvents, healthScore, realTimeData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    userId = (_a.sent()).userId;
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'User ID is required' }, { status: 400 })];
                    }
                    return [4 /*yield*/, getSessionManager()];
                case 2:
                    manager = _a.sent();
                    return [4 /*yield*/, manager.getActiveSessions(userId)];
                case 3:
                    activeSessions = _a.sent();
                    return [4 /*yield*/, manager.getSecurityEvents({ user_id: userId }, 10, // limit
                        0 // offset
                        )];
                case 4:
                    recentSecurityEvents = _a.sent();
                    return [4 /*yield*/, manager.calculateSessionHealthScore(userId)];
                case 5:
                    healthScore = _a.sent();
                    realTimeData = {
                        timestamp: new Date().toISOString(),
                        activeSessions: activeSessions.length,
                        sessions: activeSessions.map(function (session) { return ({
                            id: session.id,
                            device: session.device_info,
                            location: session.ip_address,
                            lastActivity: session.last_activity,
                            securityScore: session.security_score
                        }); }),
                        recentSecurityEvents: recentSecurityEvents.slice(0, 5),
                        healthScore: healthScore,
                        alerts: {
                            suspiciousActivity: recentSecurityEvents.filter(function (event) { return event.severity === 'HIGH'; }).length,
                            newDevices: recentSecurityEvents.filter(function (event) { return event.event_type === 'DEVICE_REGISTERED'; }).length,
                            failedValidations: recentSecurityEvents.filter(function (event) { return event.event_type === 'SESSION_VALIDATION_FAILED'; }).length
                        }
                    };
                    return [2 /*return*/, server_1.NextResponse.json(realTimeData)];
                case 6:
                    error_2 = _a.sent();
                    console.error('Get real-time session status error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error while fetching real-time session status' }, { status: 500 })];
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
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                })];
        });
    });
}
