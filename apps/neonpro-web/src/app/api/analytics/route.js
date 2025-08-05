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
exports.POST = POST;
var server_1 = require("next/server");
var supabase_js_1 = require("@supabase/supabase-js");
var zod_1 = require("zod");
// Initialize Supabase client with service role key for server-side operations
var supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
// Validation schemas
var analyticsQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    metric: zod_1.z.enum(['revenue', 'subscriptions', 'trials', 'conversions', 'churn']).optional(),
    granularity: zod_1.z.enum(['day', 'week', 'month', 'quarter']).optional().default('day'),
    userId: zod_1.z.string().optional(),
    subscriptionTier: zod_1.z.enum(['free', 'pro', 'enterprise']).optional()
});
var eventTrackingSchema = zod_1.z.object({
    event_type: zod_1.z.string(),
    user_id: zod_1.z.string(),
    properties: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().optional()
});
/**
 * GET /api/analytics - Retrieve analytics data
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, userRole, subscriptionStatus, searchParams, queryParams, validatedParams, endDate, startDate, analyticsData, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 14, , 15]);
                    userId = request.headers.get('x-user-id');
                    userRole = request.headers.get('x-user-role');
                    subscriptionStatus = request.headers.get('x-user-subscription');
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    searchParams = new URL(request.url).searchParams;
                    queryParams = {
                        startDate: searchParams.get('startDate'),
                        endDate: searchParams.get('endDate'),
                        metric: searchParams.get('metric'),
                        granularity: searchParams.get('granularity') || 'day',
                        userId: searchParams.get('userId'),
                        subscriptionTier: searchParams.get('subscriptionTier')
                    };
                    validatedParams = analyticsQuerySchema.parse(queryParams);
                    // Check permissions - only admins can view other users' data
                    if (validatedParams.userId && validatedParams.userId !== userId && userRole !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })];
                    }
                    endDate = validatedParams.endDate || new Date().toISOString().split('T')[0];
                    startDate = validatedParams.startDate ||
                        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                    analyticsData = {};
                    _a = validatedParams.metric;
                    switch (_a) {
                        case 'revenue': return [3 /*break*/, 1];
                        case 'subscriptions': return [3 /*break*/, 3];
                        case 'trials': return [3 /*break*/, 5];
                        case 'conversions': return [3 /*break*/, 7];
                        case 'churn': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 11];
                case 1: return [4 /*yield*/, getRevenueAnalytics(startDate, endDate, validatedParams.granularity, validatedParams.userId || userId)];
                case 2:
                    analyticsData = _b.sent();
                    return [3 /*break*/, 13];
                case 3: return [4 /*yield*/, getSubscriptionAnalytics(startDate, endDate, validatedParams.granularity, validatedParams.userId || userId)];
                case 4:
                    analyticsData = _b.sent();
                    return [3 /*break*/, 13];
                case 5: return [4 /*yield*/, getTrialAnalytics(startDate, endDate, validatedParams.granularity, validatedParams.userId || userId)];
                case 6:
                    analyticsData = _b.sent();
                    return [3 /*break*/, 13];
                case 7: return [4 /*yield*/, getConversionAnalytics(startDate, endDate, validatedParams.granularity, validatedParams.userId || userId)];
                case 8:
                    analyticsData = _b.sent();
                    return [3 /*break*/, 13];
                case 9: return [4 /*yield*/, getChurnAnalytics(startDate, endDate, validatedParams.granularity, validatedParams.userId || userId)];
                case 10:
                    analyticsData = _b.sent();
                    return [3 /*break*/, 13];
                case 11: return [4 /*yield*/, getDashboardAnalytics(startDate, endDate, validatedParams.userId || userId, userRole)];
                case 12:
                    // Return comprehensive dashboard data
                    analyticsData = _b.sent();
                    _b.label = 13;
                case 13: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: analyticsData,
                        metadata: {
                            startDate: startDate,
                            endDate: endDate,
                            granularity: validatedParams.granularity,
                            generatedAt: new Date().toISOString()
                        }
                    })];
                case 14:
                    error_1 = _b.sent();
                    console.error('Analytics API error:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid query parameters',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 15: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/analytics - Track analytics events
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var userId, body, validatedEvent, userRole, _a, data, error, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    userId = request.headers.get('x-user-id');
                    if (!userId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Authentication required' }, { status: 401 })];
                    }
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _b.sent();
                    validatedEvent = eventTrackingSchema.parse(body);
                    userRole = request.headers.get('x-user-role');
                    if (validatedEvent.user_id !== userId && userRole !== 'admin') {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot track events for other users' }, { status: 403 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('analytics_events')
                            .insert({
                            event_type: validatedEvent.event_type,
                            user_id: validatedEvent.user_id,
                            properties: validatedEvent.properties || {},
                            timestamp: validatedEvent.timestamp || new Date().toISOString()
                        })
                            .select()
                            .single()];
                case 2:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Event tracking error:', error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to track event' }, { status: 500 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            eventId: data.id,
                            message: 'Event tracked successfully'
                        })];
                case 3:
                    error_2 = _b.sent();
                    console.error('Event tracking API error:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid event data',
                                details: error_2.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Helper functions for different analytics queries
function getRevenueAnalytics(startDate, endDate, granularity, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .rpc('get_revenue_analytics', {
                        start_date: startDate,
                        end_date: endDate,
                        granularity: granularity,
                        user_id: userId
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function getSubscriptionAnalytics(startDate, endDate, granularity, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .rpc('get_subscription_analytics', {
                        start_date: startDate,
                        end_date: endDate,
                        granularity: granularity,
                        user_id: userId
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function getTrialAnalytics(startDate, endDate, granularity, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .rpc('get_trial_analytics', {
                        start_date: startDate,
                        end_date: endDate,
                        granularity: granularity,
                        user_id: userId
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function getConversionAnalytics(startDate, endDate, granularity, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .rpc('get_conversion_analytics', {
                        start_date: startDate,
                        end_date: endDate,
                        granularity: granularity,
                        user_id: userId
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function getChurnAnalytics(startDate, endDate, granularity, userId) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, data, error;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, supabase
                        .rpc('get_churn_analytics', {
                        start_date: startDate,
                        end_date: endDate,
                        granularity: granularity,
                        user_id: userId
                    })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    return [2 /*return*/, data];
            }
        });
    });
}
function getDashboardAnalytics(startDate, endDate, userId, userRole) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, revenue, subscriptions, trials, conversions;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([
                        getRevenueAnalytics(startDate, endDate, 'day', userId),
                        getSubscriptionAnalytics(startDate, endDate, 'day', userId),
                        getTrialAnalytics(startDate, endDate, 'day', userId),
                        getConversionAnalytics(startDate, endDate, 'day', userId)
                    ])];
                case 1:
                    _a = _b.sent(), revenue = _a[0], subscriptions = _a[1], trials = _a[2], conversions = _a[3];
                    return [2 /*return*/, {
                            revenue: revenue,
                            subscriptions: subscriptions,
                            trials: trials,
                            conversions: conversions,
                            summary: {
                                totalRevenue: (revenue === null || revenue === void 0 ? void 0 : revenue.reduce(function (sum, item) { return sum + (item.revenue || 0); }, 0)) || 0,
                                totalSubscriptions: (subscriptions === null || subscriptions === void 0 ? void 0 : subscriptions.length) || 0,
                                totalTrials: (trials === null || trials === void 0 ? void 0 : trials.length) || 0,
                                conversionRate: (conversions === null || conversions === void 0 ? void 0 : conversions.conversion_rate) || 0
                            }
                        }];
            }
        });
    });
}
