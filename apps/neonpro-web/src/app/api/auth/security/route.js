"use strict";
// =====================================================
// Security Events API Routes
// Story 1.4: Session Management & Security
// =====================================================
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
exports.GET = GET;
exports.POST = POST;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var server_2 = require("@/lib/supabase/server");
var session_1 = require("@/lib/auth/session");
var zod_1 = require("zod");
// =====================================================
// VALIDATION SCHEMAS
// =====================================================
var securityEventSchema = zod_1.z.object({
    type: zod_1.z.enum([
        'login_attempt',
        'login_success',
        'login_failure',
        'logout',
        'session_expired',
        'session_extended',
        'device_registered',
        'device_trusted',
        'device_untrusted',
        'device_removed',
        'device_reported_suspicious',
        'suspicious_activity',
        'security_violation',
        'password_changed',
        'email_changed',
        'profile_updated',
        'permission_changed',
        'data_export',
        'data_deletion',
        'api_abuse',
        'rate_limit_exceeded',
        'unauthorized_access',
        'malicious_request'
    ]),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    description: zod_1.z.string().min(1).max(1000),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var queryEventsSchema = zod_1.z.object({
    limit: zod_1.z.number().min(1).max(100).optional().default(50),
    offset: zod_1.z.number().min(0).optional().default(0),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    type: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    resolved: zod_1.z.boolean().optional()
});
var resolveEventSchema = zod_1.z.object({
    eventId: zod_1.z.string().uuid(),
    resolution: zod_1.z.string().min(1).max(500),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
// =====================================================
// UTILITY FUNCTIONS
// =====================================================
function getClientIP(request) {
    var forwarded = request.headers.get('x-forwarded-for');
    var realIP = request.headers.get('x-real-ip');
    var cfConnectingIP = request.headers.get('cf-connecting-ip');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }
    return '127.0.0.1';
}
function getUserAgent(request) {
    return request.headers.get('user-agent') || 'Unknown';
}
function initializeSessionSystem() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _a.sent();
                    return [2 /*return*/, new session_1.UnifiedSessionSystem(supabase)];
            }
        });
    });
}
function getCurrentUser() {
    return __awaiter(this, void 0, void 0, function () {
        var supabase, _a, user, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, server_2.createClient)()];
                case 1:
                    supabase = _b.sent();
                    return [4 /*yield*/, supabase.auth.getUser()];
                case 2:
                    _a = _b.sent(), user = _a.data.user, error = _a.error;
                    if (error || !user) {
                        throw new Error('Unauthorized');
                    }
                    return [2 /*return*/, user];
            }
        });
    });
}
function parseDate(dateString) {
    if (!dateString)
        return undefined;
    var date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
}
// =====================================================
// GET - Query Security Events
// =====================================================
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, searchParams, queryData, validation, _a, limit, offset, severity, type, startDate, endDate, resolved, filters, events, stats, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _b.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _b.sent();
                    searchParams = new URL(request.url).searchParams;
                    queryData = {
                        limit: parseInt(searchParams.get('limit') || '50'),
                        offset: parseInt(searchParams.get('offset') || '0'),
                        severity: searchParams.get('severity'),
                        type: searchParams.get('type') || undefined,
                        startDate: searchParams.get('startDate') || undefined,
                        endDate: searchParams.get('endDate') || undefined,
                        resolved: searchParams.get('resolved') ? searchParams.get('resolved') === 'true' : undefined
                    };
                    validation = queryEventsSchema.safeParse(queryData);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid query parameters', details: validation.error.errors }, { status: 400 })];
                    }
                    _a = validation.data, limit = _a.limit, offset = _a.offset, severity = _a.severity, type = _a.type, startDate = _a.startDate, endDate = _a.endDate, resolved = _a.resolved;
                    filters = {
                        userId: user.id
                    };
                    if (severity)
                        filters.severity = severity;
                    if (type)
                        filters.type = type;
                    if (resolved !== undefined)
                        filters.resolved = resolved;
                    return [4 /*yield*/, sessionSystem.securityEventLogger.getEvents(filters, {
                            limit: limit,
                            offset: offset,
                            startDate: parseDate(startDate),
                            endDate: parseDate(endDate)
                        })
                        // Get statistics
                    ];
                case 3:
                    events = _b.sent();
                    return [4 /*yield*/, sessionSystem.securityEventLogger.getEventStatistics(user.id)];
                case 4:
                    stats = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            events: events,
                            pagination: {
                                limit: limit,
                                offset: offset,
                                total: events.length
                            },
                            statistics: stats,
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    error_1 = _b.sent();
                    console.error('Security events GET error:', error_1);
                    if (error_1 instanceof Error && error_1.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// POST - Log Security Event or Resolve Event
// =====================================================
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, body, action, clientIP, userAgent, _a, validation, _b, type, severity, description, metadata, event_1, validation, _c, eventId, resolution, metadata, event_2, success, error_2;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 12, , 13]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _d.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _d.sent();
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _d.sent();
                    action = body.action;
                    clientIP = getClientIP(request);
                    userAgent = getUserAgent(request);
                    _a = action;
                    switch (_a) {
                        case 'log': return [3 /*break*/, 4];
                        case 'resolve': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 10];
                case 4:
                    validation = securityEventSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid event data', details: validation.error.errors }, { status: 400 })];
                    }
                    _b = validation.data, type = _b.type, severity = _b.severity, description = _b.description, metadata = _b.metadata;
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: type,
                            severity: severity,
                            description: description,
                            userId: user.id,
                            ipAddress: clientIP,
                            userAgent: userAgent,
                            metadata: __assign(__assign({}, metadata), { loggedViaAPI: true, timestamp: new Date().toISOString() })
                        })];
                case 5:
                    event_1 = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            event: event_1,
                            message: 'Security event logged successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 6:
                    validation = resolveEventSchema.safeParse(body);
                    if (!validation.success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid resolution data', details: validation.error.errors }, { status: 400 })];
                    }
                    _c = validation.data, eventId = _c.eventId, resolution = _c.resolution, metadata = _c.metadata;
                    return [4 /*yield*/, sessionSystem.securityEventLogger.getEvent(eventId)];
                case 7:
                    event_2 = _d.sent();
                    if (!event_2 || event_2.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })];
                    }
                    return [4 /*yield*/, sessionSystem.securityEventLogger.resolveEvent(eventId, resolution, __assign(__assign({}, metadata), { resolvedBy: user.id, resolvedAt: new Date().toISOString(), resolvedViaAPI: true }))];
                case 8:
                    success = _d.sent();
                    if (!success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to resolve event' }, { status: 400 })];
                    }
                    // Log resolution as new event
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'security_event_resolved',
                            severity: 'low',
                            description: "Security event resolved: ".concat(event_2.type),
                            userId: user.id,
                            ipAddress: clientIP,
                            userAgent: userAgent,
                            metadata: __assign({ originalEventId: eventId, resolution: resolution }, metadata)
                        })];
                case 9:
                    // Log resolution as new event
                    _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Event resolved successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 10: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_2 = _d.sent();
                    console.error('Security events POST error:', error_2);
                    if (error_2 instanceof Error && error_2.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 13: return [2 /*return*/];
            }
        });
    });
}
// =====================================================
// DELETE - Clear Security Events
// =====================================================
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var user, sessionSystem, searchParams, eventId, clearAll, olderThan, event_3, success, deletedCount, cutoffDate, deletedCount, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, getCurrentUser()];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, initializeSessionSystem()];
                case 2:
                    sessionSystem = _a.sent();
                    searchParams = new URL(request.url).searchParams;
                    eventId = searchParams.get('eventId');
                    clearAll = searchParams.get('clearAll') === 'true';
                    olderThan = searchParams.get('olderThan');
                    if (!eventId) return [3 /*break*/, 5];
                    return [4 /*yield*/, sessionSystem.securityEventLogger.getEvent(eventId)];
                case 3:
                    event_3 = _a.sent();
                    if (!event_3 || event_3.userId !== user.id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Event not found or access denied' }, { status: 404 })];
                    }
                    return [4 /*yield*/, sessionSystem.securityEventLogger.deleteEvent(eventId)];
                case 4:
                    success = _a.sent();
                    if (!success) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to delete event' }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Event deleted successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 5:
                    if (!clearAll) return [3 /*break*/, 8];
                    return [4 /*yield*/, sessionSystem.securityEventLogger.clearUserEvents(user.id)
                        // Log the cleanup
                    ];
                case 6:
                    deletedCount = _a.sent();
                    // Log the cleanup
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'data_deletion',
                            severity: 'medium',
                            description: "Security events cleared: ".concat(deletedCount, " events deleted"),
                            userId: user.id,
                            ipAddress: getClientIP(request),
                            userAgent: getUserAgent(request),
                            metadata: { deletedCount: deletedCount, clearAll: true }
                        })];
                case 7:
                    // Log the cleanup
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            deletedCount: deletedCount,
                            message: 'All events cleared successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 8:
                    if (!olderThan) return [3 /*break*/, 11];
                    cutoffDate = parseDate(olderThan);
                    if (!cutoffDate) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid date format' }, { status: 400 })];
                    }
                    return [4 /*yield*/, sessionSystem.securityEventLogger.clearOldEvents(user.id, cutoffDate)
                        // Log the cleanup
                    ];
                case 9:
                    deletedCount = _a.sent();
                    // Log the cleanup
                    return [4 /*yield*/, sessionSystem.securityEventLogger.logEvent({
                            type: 'data_deletion',
                            severity: 'low',
                            description: "Old security events cleared: ".concat(deletedCount, " events deleted"),
                            userId: user.id,
                            ipAddress: getClientIP(request),
                            userAgent: getUserAgent(request),
                            metadata: { deletedCount: deletedCount, cutoffDate: cutoffDate.toISOString() }
                        })];
                case 10:
                    // Log the cleanup
                    _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            deletedCount: deletedCount,
                            cutoffDate: cutoffDate.toISOString(),
                            message: 'Old events cleared successfully',
                            timestamp: new Date().toISOString()
                        })];
                case 11: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid delete operation' }, { status: 400 })];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_3 = _a.sent();
                    console.error('Security events DELETE error:', error_3);
                    if (error_3 instanceof Error && error_3.message === 'Unauthorized') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
