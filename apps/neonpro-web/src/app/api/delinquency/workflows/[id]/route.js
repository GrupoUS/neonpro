"use strict";
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
var server_1 = require("next/server");
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
// Validation schemas
var GetActivitiesQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    activityType: zod_1.z.enum(['call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation']).optional(),
    dateFrom: zod_1.z.string().datetime().optional(),
    dateTo: zod_1.z.string().datetime().optional(),
    performedBy: zod_1.z.string().uuid().optional(),
    sortBy: zod_1.z.enum(['created_at', 'activity_type', 'amount_collected']).optional().default('created_at'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
var AddActivitySchema = zod_1.z.object({
    activityType: zod_1.z.enum(['call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation']),
    description: zod_1.z.string().min(1),
    outcome: zod_1.z.string().optional(),
    nextAction: zod_1.z.string().optional(),
    nextActionDate: zod_1.z.string().datetime().optional(),
    amountCollected: zod_1.z.number().min(0).optional().default(0),
    contactMethod: zod_1.z.string().optional(),
    contactDuration: zod_1.z.number().optional(),
    promiseDate: zod_1.z.string().datetime().optional(),
    promiseAmount: zod_1.z.number().min(0).optional(),
});
var UpdateWorkflowSchema = zod_1.z.object({
    currentStage: zod_1.z.string().optional(),
    nextActionType: zod_1.z.string().optional(),
    nextActionDate: zod_1.z.string().datetime().optional(),
    status: zod_1.z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
    priority: zod_1.z.number().int().min(1).max(5).optional(),
    notes: zod_1.z.string().optional(),
});
var ScheduleActionSchema = zod_1.z.object({
    actionType: zod_1.z.string(),
    scheduledDate: zod_1.z.string().datetime(),
    description: zod_1.z.string(),
    assignedTo: zod_1.z.string().uuid().optional(),
    reminderMinutes: zod_1.z.number().int().min(0).optional().default(15),
});
/**
 * GET /api/delinquency/workflows/[id]
 * Get workflow details, activities, or statistics
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var searchParams, action, workflowId, supabase, authHeader, _c, user, authError, _d, _e, workflow, error, recentActivities, stats, totalCollected, query, page, limit, offset, activitiesQuery, sortColumn, _f, activities, error, count, _g, activities, error, workflow, timeline_1, activities, stats_1, typeGroups_1, totalCollected_1, maxEffectiveness_1, error_1;
        var params = _b.params;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 15, , 16]);
                    searchParams = new URL(request.url).searchParams;
                    action = searchParams.get('action') || 'details';
                    workflowId = params.id;
                    if (!workflowId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })];
                    }
                    supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _c = _h.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    _d = action;
                    switch (_d) {
                        case 'details': return [3 /*break*/, 2];
                        case 'activities': return [3 /*break*/, 6];
                        case 'timeline': return [3 /*break*/, 8];
                        case 'statistics': return [3 /*break*/, 11];
                    }
                    return [3 /*break*/, 13];
                case 2: return [4 /*yield*/, supabase
                        .from('collection_workflow_status')
                        .select('*')
                        .eq('id', workflowId)
                        .single()];
                case 3:
                    _e = _h.sent(), workflow = _e.data, error = _e.error;
                    if (error) {
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow not found' }, { status: 404 })];
                        }
                        throw error;
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .select('*')
                            .eq('workflow_id', workflowId)
                            .order('created_at', { ascending: false })
                            .limit(5)];
                case 4:
                    recentActivities = (_h.sent()).data;
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .select('amount_collected')
                            .eq('workflow_id', workflowId)];
                case 5:
                    stats = (_h.sent()).data;
                    totalCollected = (stats === null || stats === void 0 ? void 0 : stats.reduce(function (sum, activity) {
                        return sum + (activity.amount_collected || 0);
                    }, 0)) || 0;
                    return [2 /*return*/, server_1.NextResponse.json({
                            data: __assign(__assign({}, workflow), { recentActivities: recentActivities || [], statistics: {
                                    totalActivities: (stats === null || stats === void 0 ? void 0 : stats.length) || 0,
                                    totalCollected: totalCollected,
                                    averageActivityValue: (stats === null || stats === void 0 ? void 0 : stats.length) ? totalCollected / stats.length : 0,
                                } }),
                        })];
                case 6:
                    query = GetActivitiesQuerySchema.parse(Object.fromEntries(searchParams));
                    page = parseInt(query.page);
                    limit = parseInt(query.limit);
                    offset = (page - 1) * limit;
                    activitiesQuery = supabase
                        .from('collection_activities')
                        .select('*', { count: 'exact' })
                        .eq('workflow_id', workflowId)
                        .range(offset, offset + limit - 1);
                    // Apply filters
                    if (query.activityType) {
                        activitiesQuery = activitiesQuery.eq('activity_type', query.activityType);
                    }
                    if (query.dateFrom) {
                        activitiesQuery = activitiesQuery.gte('created_at', query.dateFrom);
                    }
                    if (query.dateTo) {
                        activitiesQuery = activitiesQuery.lte('created_at', query.dateTo);
                    }
                    if (query.performedBy) {
                        activitiesQuery = activitiesQuery.eq('performed_by', query.performedBy);
                    }
                    sortColumn = {
                        created_at: 'created_at',
                        activity_type: 'activity_type',
                        amount_collected: 'amount_collected',
                    }[query.sortBy];
                    activitiesQuery = activitiesQuery.order(sortColumn, { ascending: query.sortOrder === 'asc' });
                    return [4 /*yield*/, activitiesQuery];
                case 7:
                    _f = _h.sent(), activities = _f.data, error = _f.error, count = _f.count;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            data: activities || [],
                            pagination: {
                                page: page,
                                limit: limit,
                                total: count || 0,
                                totalPages: Math.ceil((count || 0) / limit),
                            },
                        })];
                case 8: return [4 /*yield*/, supabase
                        .from('collection_activities')
                        .select('*')
                        .eq('workflow_id', workflowId)
                        .order('created_at', { ascending: true })];
                case 9:
                    _g = _h.sent(), activities = _g.data, error = _g.error;
                    if (error) {
                        throw error;
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .select('created_at, updated_at, action_history')
                            .eq('id', workflowId)
                            .single()];
                case 10:
                    workflow = (_h.sent()).data;
                    timeline_1 = [];
                    // Add workflow creation
                    if (workflow) {
                        timeline_1.push({
                            type: 'workflow_created',
                            date: workflow.created_at,
                            description: 'Collection workflow created',
                        });
                        // Add action history
                        if (workflow.action_history) {
                            workflow.action_history.forEach(function (action) {
                                timeline_1.push({
                                    type: 'workflow_action',
                                    date: action.date,
                                    description: "Action: ".concat(action.action),
                                    result: action.result,
                                    performedBy: action.performedBy,
                                });
                            });
                        }
                    }
                    // Add activities
                    activities === null || activities === void 0 ? void 0 : activities.forEach(function (activity) {
                        timeline_1.push({
                            type: 'activity',
                            date: activity.created_at,
                            description: activity.description,
                            activityType: activity.activity_type,
                            outcome: activity.outcome,
                            amountCollected: activity.amount_collected,
                            performedBy: activity.performed_by,
                        });
                    });
                    // Sort timeline by date
                    timeline_1.sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); });
                    return [2 /*return*/, server_1.NextResponse.json({ data: timeline_1 })];
                case 11: return [4 /*yield*/, supabase
                        .from('collection_activities')
                        .select('*')
                        .eq('workflow_id', workflowId)];
                case 12:
                    activities = (_h.sent()).data;
                    stats_1 = {
                        totalActivities: (activities === null || activities === void 0 ? void 0 : activities.length) || 0,
                        activitiesByType: {},
                        totalCollected: 0,
                        averageCollectionPerActivity: 0,
                        lastActivityDate: null,
                        mostEffectiveActivityType: null,
                    };
                    if (activities && activities.length > 0) {
                        typeGroups_1 = {};
                        totalCollected_1 = 0;
                        activities.forEach(function (activity) {
                            var type = activity.activity_type;
                            if (!typeGroups_1[type]) {
                                typeGroups_1[type] = [];
                            }
                            typeGroups_1[type].push(activity);
                            totalCollected_1 += activity.amount_collected || 0;
                        });
                        // Calculate statistics by type
                        Object.keys(typeGroups_1).forEach(function (type) {
                            var typeActivities = typeGroups_1[type];
                            var typeCollected = typeActivities.reduce(function (sum, a) { return sum + (a.amount_collected || 0); }, 0);
                            stats_1.activitiesByType[type] = {
                                count: typeActivities.length,
                                totalCollected: typeCollected,
                                averageCollected: typeCollected / typeActivities.length,
                            };
                        });
                        stats_1.totalCollected = totalCollected_1;
                        stats_1.averageCollectionPerActivity = totalCollected_1 / activities.length;
                        stats_1.lastActivityDate = activities[activities.length - 1].created_at;
                        maxEffectiveness_1 = 0;
                        Object.keys(stats_1.activitiesByType).forEach(function (type) {
                            var typeStats = stats_1.activitiesByType[type];
                            if (typeStats.averageCollected > maxEffectiveness_1) {
                                maxEffectiveness_1 = typeStats.averageCollected;
                                stats_1.mostEffectiveActivityType = type;
                            }
                        });
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ data: stats_1 })];
                case 13: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 14: return [3 /*break*/, 16];
                case 15:
                    error_1 = _h.sent();
                    console.error('Error fetching workflow data:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch workflow data' }, { status: 500 })];
                case 16: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/delinquency/workflows/[id]
 * Add activity, schedule action, or perform workflow operations
 */
function POST(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var body, action, data, workflowId, supabase, authHeader, _c, user, authError, _d, workflow, workflowError, _e, validatedData, _f, newActivity, error, validatedData, _g, scheduledAction, error, _h, amount, paymentMethod, reference, notes, _j, paymentActivity, error, totalCollected, total, _k, notificationType, message, channel, _l, notification, error, error_2;
        var params = _b.params;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    _m.trys.push([0, 20, , 21]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _m.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    workflowId = params.id;
                    if (!workflowId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })];
                    }
                    supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _c = _m.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .select('customer_id, status')
                            .eq('id', workflowId)
                            .single()];
                case 3:
                    _d = _m.sent(), workflow = _d.data, workflowError = _d.error;
                    if (workflowError || !workflow) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow not found' }, { status: 404 })];
                    }
                    _e = action;
                    switch (_e) {
                        case 'add_activity': return [3 /*break*/, 4];
                        case 'schedule_action': return [3 /*break*/, 7];
                        case 'record_payment': return [3 /*break*/, 10];
                        case 'send_notification': return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 18];
                case 4:
                    validatedData = AddActivitySchema.parse(data);
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: workflow.customer_id,
                            activity_type: validatedData.activityType,
                            description: validatedData.description,
                            outcome: validatedData.outcome,
                            next_action: validatedData.nextAction,
                            next_action_date: validatedData.nextActionDate,
                            amount_collected: validatedData.amountCollected,
                            contact_method: validatedData.contactMethod,
                            contact_duration: validatedData.contactDuration,
                            promise_date: validatedData.promiseDate,
                            promise_amount: validatedData.promiseAmount,
                            performed_by: user.id,
                        })
                            .select()
                            .single()];
                case 5:
                    _f = _m.sent(), newActivity = _f.data, error = _f.error;
                    if (error) {
                        throw error;
                    }
                    // Update workflow with latest activity info
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            next_action_type: validatedData.nextAction,
                            next_action_date: validatedData.nextActionDate,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)];
                case 6:
                    // Update workflow with latest activity info
                    _m.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: newActivity })];
                case 7:
                    validatedData = ScheduleActionSchema.parse(data);
                    return [4 /*yield*/, supabase
                            .from('scheduled_notifications')
                            .insert({
                            customer_id: workflow.customer_id,
                            workflow_id: workflowId,
                            notification_type: 'workflow_reminder',
                            scheduled_date: validatedData.scheduledDate,
                            message: validatedData.description,
                            assigned_to: validatedData.assignedTo || user.id,
                            reminder_minutes: validatedData.reminderMinutes,
                            status: 'scheduled',
                            metadata: {
                                actionType: validatedData.actionType,
                                scheduledBy: user.id,
                            },
                        })
                            .select()
                            .single()];
                case 8:
                    _g = _m.sent(), scheduledAction = _g.data, error = _g.error;
                    if (error) {
                        throw error;
                    }
                    // Update workflow next action
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            next_action_type: validatedData.actionType,
                            next_action_date: validatedData.scheduledDate,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)];
                case 9:
                    // Update workflow next action
                    _m.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: scheduledAction })];
                case 10:
                    _h = zod_1.z.object({
                        amount: zod_1.z.number().min(0.01),
                        paymentMethod: zod_1.z.string(),
                        reference: zod_1.z.string().optional(),
                        notes: zod_1.z.string().optional(),
                    }).parse(data), amount = _h.amount, paymentMethod = _h.paymentMethod, reference = _h.reference, notes = _h.notes;
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: workflow.customer_id,
                            activity_type: 'payment',
                            description: "Payment received: ".concat(paymentMethod),
                            outcome: 'Payment confirmed',
                            amount_collected: amount,
                            performed_by: user.id,
                            metadata: {
                                paymentMethod: paymentMethod,
                                reference: reference,
                                notes: notes,
                            },
                        })
                            .select()
                            .single()];
                case 11:
                    _j = _m.sent(), paymentActivity = _j.data, error = _j.error;
                    if (error) {
                        throw error;
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .select('amount_collected')
                            .eq('workflow_id', workflowId)];
                case 12:
                    totalCollected = (_m.sent()).data;
                    total = (totalCollected === null || totalCollected === void 0 ? void 0 : totalCollected.reduce(function (sum, activity) {
                        return sum + (activity.amount_collected || 0);
                    }, 0)) || 0;
                    if (!(total >= amount)) return [3 /*break*/, 14];
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: 'completed',
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)];
                case 13:
                    _m.sent();
                    _m.label = 14;
                case 14: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: paymentActivity,
                        totalCollected: total,
                    })];
                case 15:
                    _k = zod_1.z.object({
                        notificationType: zod_1.z.string(),
                        message: zod_1.z.string(),
                        channel: zod_1.z.enum(['email', 'sms', 'whatsapp']),
                    }).parse(data), notificationType = _k.notificationType, message = _k.message, channel = _k.channel;
                    return [4 /*yield*/, supabase
                            .from('delinquency_notifications')
                            .insert({
                            customer_id: workflow.customer_id,
                            workflow_id: workflowId,
                            notification_type: notificationType,
                            channel: channel,
                            message: message,
                            status: 'sent',
                            sent_at: new Date().toISOString(),
                        })
                            .select()
                            .single()];
                case 16:
                    _l = _m.sent(), notification = _l.data, error = _l.error;
                    if (error) {
                        throw error;
                    }
                    // Add notification activity
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: workflow.customer_id,
                            activity_type: channel,
                            description: "".concat(notificationType, " sent via ").concat(channel),
                            outcome: 'Notification sent',
                            performed_by: user.id,
                        })];
                case 17:
                    // Add notification activity
                    _m.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: notification })];
                case 18: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 19: return [3 /*break*/, 21];
                case 20:
                    error_2 = _m.sent();
                    console.error('Error processing workflow action:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to process workflow action' }, { status: 500 })];
                case 21: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/delinquency/workflows/[id]
 * Update workflow details
 */
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var body, workflowId, validatedData, supabase, authHeader, _c, user, authError, updateData, _d, updatedWorkflow, error, error_3;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _e.sent();
                    workflowId = params.id;
                    if (!workflowId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })];
                    }
                    validatedData = UpdateWorkflowSchema.parse(body);
                    supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    updateData = {
                        updated_at: new Date().toISOString(),
                    };
                    if (validatedData.currentStage)
                        updateData.current_stage = validatedData.currentStage;
                    if (validatedData.nextActionType)
                        updateData.next_action_type = validatedData.nextActionType;
                    if (validatedData.nextActionDate)
                        updateData.next_action_date = validatedData.nextActionDate;
                    if (validatedData.status)
                        updateData.status = validatedData.status;
                    if (validatedData.assignedTo)
                        updateData.assigned_to = validatedData.assignedTo;
                    if (validatedData.priority)
                        updateData.priority = validatedData.priority;
                    if (validatedData.notes)
                        updateData.notes = validatedData.notes;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update(updateData)
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 3:
                    _d = _e.sent(), updatedWorkflow = _d.data, error = _d.error;
                    if (error) {
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow not found' }, { status: 404 })];
                        }
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 4:
                    error_3 = _e.sent();
                    console.error('Error updating workflow:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_3.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * DELETE /api/delinquency/workflows/[id]
 * Complete or cancel workflow
 */
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var searchParams, action, reason, workflowId, supabase, authHeader, _c, user, authError, newStatus, _d, updatedWorkflow, error, error_4;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    action = searchParams.get('action') || 'complete';
                    reason = searchParams.get('reason');
                    workflowId = params.id;
                    if (!workflowId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })];
                    }
                    supabase = (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _c = _e.sent(), user = _c.data.user, authError = _c.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    newStatus = action === 'complete' ? 'completed' : 'cancelled';
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: newStatus,
                            notes: reason,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 2:
                    _d = _e.sent(), updatedWorkflow = _d.data, error = _d.error;
                    if (error) {
                        if (error.code === 'PGRST116') {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow not found' }, { status: 404 })];
                        }
                        throw error;
                    }
                    // Add completion activity
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: updatedWorkflow.customer_id,
                            activity_type: action === 'complete' ? 'payment' : 'escalation',
                            description: "Workflow ".concat(newStatus).concat(reason ? ": ".concat(reason) : ''),
                            performed_by: user.id,
                        })];
                case 3:
                    // Add completion activity
                    _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "Workflow ".concat(newStatus, " successfully"),
                            data: updatedWorkflow,
                        })];
                case 4:
                    error_4 = _e.sent();
                    console.error('Error completing workflow:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to complete workflow' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
