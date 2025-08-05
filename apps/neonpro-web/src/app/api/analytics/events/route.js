"use strict";
/**
 * Analytics Events API Route
 * POST /api/analytics/events - Track analytics events
 * GET /api/analytics/events - Retrieve analytics events
 */
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
exports.POST = POST;
exports.GET = GET;
var server_1 = require("next/server");
var auth_1 = require("@/lib/middleware/auth");
var analytics_1 = require("@/lib/analytics");
var zod_1 = require("zod");
// Validation schema for event tracking
var EventSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(100),
    properties: zod_1.z.record(zod_1.z.any()).optional(),
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
    clinicId: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime().optional(),
});
var BatchEventsSchema = zod_1.z.object({
    events: zod_1.z.array(EventSchema).min(1).max(100),
});
/**
 * Track analytics events
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, events, validation, validation, user_1, authResult, _a, trackedEvents, error_1;
        var _this = this;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    events = void 0;
                    if (Array.isArray(body.events)) {
                        validation = BatchEventsSchema.safeParse(body);
                        if (!validation.success) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid batch events format', details: validation.error.issues }, { status: 400 })];
                        }
                        events = validation.data.events;
                    }
                    else {
                        validation = EventSchema.safeParse(body);
                        if (!validation.success) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid event format', details: validation.error.issues }, { status: 400 })];
                        }
                        events = [validation.data];
                    }
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, (0, auth_1.requireAuth)()(request)];
                case 3:
                    authResult = _b.sent();
                    if (authResult.authenticated) {
                        user_1 = authResult.user;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _a = _b.sent();
                    return [3 /*break*/, 5];
                case 5: return [4 /*yield*/, Promise.all(events.map(function (event) { return __awaiter(_this, void 0, void 0, function () {
                        var eventData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    eventData = __assign(__assign({}, event), { userId: (user_1 === null || user_1 === void 0 ? void 0 : user_1.id) || event.userId, clinicId: (user_1 === null || user_1 === void 0 ? void 0 : user_1.clinicId) || event.clinicId, timestamp: event.timestamp || new Date().toISOString() });
                                    return [4 /*yield*/, analytics_1.analyticsService.trackEvent(eventData)];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        });
                    }); }))];
                case 6:
                    trackedEvents = _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            tracked: trackedEvents.length,
                            events: trackedEvents,
                        })];
                case 7:
                    error_1 = _b.sent();
                    console.error('Event tracking error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to track events',
                            message: error_1 instanceof Error ? error_1.message : 'Unknown error',
                        }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Retrieve analytics events
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var authResult, user, searchParams, limit, offset, eventName, userId, clinicId, startDate, endDate, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, auth_1.requireAuth)(['admin', 'clinic_owner', 'manager'])(request)];
                case 1:
                    authResult = _a.sent();
                    if (!authResult.authenticated) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: authResult.error }, { status: authResult.status })];
                    }
                    user = authResult.user;
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    limit = parseInt(searchParams.get('limit') || '100');
                    offset = parseInt(searchParams.get('offset') || '0');
                    eventName = searchParams.get('event');
                    userId = searchParams.get('userId');
                    clinicId = searchParams.get('clinicId') || user.clinicId;
                    startDate = searchParams.get('startDate');
                    endDate = searchParams.get('endDate');
                    // Validate clinic access
                    if (clinicId && user.role !== 'admin' && user.clinicId !== clinicId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Access denied to clinic data' }, { status: 403 })];
                    }
                    return [4 /*yield*/, analytics_1.analyticsService.getEvents({
                            limit: Math.min(limit, 1000), // Max 1000 events per request
                            offset: offset,
                            eventName: eventName,
                            userId: userId,
                            clinicId: clinicId || undefined,
                            startDate: startDate,
                            endDate: endDate,
                        })];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: result.events,
                            pagination: {
                                limit: limit,
                                offset: offset,
                                total: result.total,
                                hasMore: result.hasMore,
                            },
                            metadata: {
                                clinicId: clinicId,
                                generatedAt: new Date().toISOString(),
                            },
                        })];
                case 4:
                    error_2 = _a.sent();
                    console.error('Event retrieval error:', error_2);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: 'Failed to retrieve events',
                            message: error_2 instanceof Error ? error_2.message : 'Unknown error',
                        }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
