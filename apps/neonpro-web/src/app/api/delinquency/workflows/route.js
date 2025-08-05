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
var GetWorkflowsQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    status: zod_1.z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
    assignedTo: zod_1.z.string().uuid().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    priority: zod_1.z.string().optional(),
    sortBy: zod_1.z.enum(['created_at', 'next_action_date', 'priority', 'customer_name']).optional().default('next_action_date'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('asc'),
});
var CreateWorkflowSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    currentStage: zod_1.z.string(),
    nextActionType: zod_1.z.string().optional(),
    nextActionDate: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.number().int().min(1).max(5).optional().default(1),
    assignedTo: zod_1.z.string().uuid().optional(),
    notes: zod_1.z.string().optional(),
});
var AddActivitySchema = zod_1.z.object({
    workflowId: zod_1.z.string().uuid(),
    activityType: zod_1.z.enum(['call', 'email', 'sms', 'meeting', 'payment', 'promise', 'escalation']),
    description: zod_1.z.string(),
    outcome: zod_1.z.string().optional(),
    nextAction: zod_1.z.string().optional(),
    nextActionDate: zod_1.z.string().datetime().optional(),
    amountCollected: zod_1.z.number().min(0).optional().default(0),
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
var BulkUpdateSchema = zod_1.z.object({
    workflowIds: zod_1.z.array(zod_1.z.string().uuid()),
    updates: zod_1.z.object({
        status: zod_1.z.enum(['active', 'paused', 'completed', 'escalated']).optional(),
        assignedTo: zod_1.z.string().uuid().optional(),
        priority: zod_1.z.number().int().min(1).max(5).optional(),
    }),
});
/**
 * GET /api/delinquency/workflows
 * Get collection workflows with filtering and pagination
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, query, supabase, authHeader, _a, user, authError, page, limit, offset, supabaseQuery, sortColumn, _b, workflows, queryError, count, _c, stats, statsError, error_1;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    query = GetWorkflowsQuerySchema.parse(Object.fromEntries(searchParams));
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _d.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    page = parseInt(query.page);
                    limit = parseInt(query.limit);
                    offset = (page - 1) * limit;
                    supabaseQuery = supabase
                        .from('collection_workflow_status')
                        .select('*', { count: 'exact' })
                        .range(offset, offset + limit - 1);
                    // Apply filters
                    if (query.status) {
                        supabaseQuery = supabaseQuery.eq('status', query.status);
                    }
                    if (query.assignedTo) {
                        supabaseQuery = supabaseQuery.eq('assigned_to', query.assignedTo);
                    }
                    if (query.customerId) {
                        supabaseQuery = supabaseQuery.eq('customer_id', query.customerId);
                    }
                    if (query.priority) {
                        supabaseQuery = supabaseQuery.eq('priority', parseInt(query.priority));
                    }
                    sortColumn = {
                        created_at: 'created_at',
                        next_action_date: 'next_action_date',
                        priority: 'priority',
                        customer_name: 'customer_name',
                    }[query.sortBy];
                    supabaseQuery = supabaseQuery.order(sortColumn, { ascending: query.sortOrder === 'asc' });
                    return [4 /*yield*/, supabaseQuery];
                case 2:
                    _b = _d.sent(), workflows = _b.data, queryError = _b.error, count = _b.count;
                    if (queryError) {
                        throw queryError;
                    }
                    return [4 /*yield*/, supabase.rpc('get_workflow_statistics')];
                case 3:
                    _c = _d.sent(), stats = _c.data, statsError = _c.error;
                    if (statsError) {
                        console.warn('Failed to get workflow statistics:', statsError);
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            data: workflows || [],
                            pagination: {
                                page: page,
                                limit: limit,
                                total: count || 0,
                                totalPages: Math.ceil((count || 0) / limit),
                            },
                            stats: stats || {
                                active: 0,
                                paused: 0,
                                completed: 0,
                                escalated: 0,
                                totalCollected: 0,
                            },
                        })];
                case 4:
                    error_1 = _d.sent();
                    console.error('Error fetching collection workflows:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch collection workflows' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/delinquency/workflows
 * Create new collection workflow or add activity to existing workflow
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, action, data, supabase, authHeader, _a, user, authError, _b, validatedData, existingWorkflow, _c, newWorkflow, error, validatedData, _d, workflow, workflowError, _e, newActivity, error, currentWorkflow, actionHistory, _f, workflowIds, assignedTo, _g, updatedWorkflows, error, _h, workflowId, escalationReason, escalateTo, _j, updatedWorkflow, error, error_2;
        return __generator(this, function (_k) {
            switch (_k.label) {
                case 0:
                    _k.trys.push([0, 18, , 19]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _k.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _a = _k.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    _b = action;
                    switch (_b) {
                        case 'create_workflow': return [3 /*break*/, 3];
                        case 'add_activity': return [3 /*break*/, 6];
                        case 'bulk_assign': return [3 /*break*/, 11];
                        case 'escalate_workflow': return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 16];
                case 3:
                    validatedData = CreateWorkflowSchema.parse(data);
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .select('id')
                            .eq('customer_id', validatedData.customerId)
                            .eq('status', 'active')
                            .single()];
                case 4:
                    existingWorkflow = (_k.sent()).data;
                    if (existingWorkflow) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Customer already has an active collection workflow' }, { status: 409 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .insert({
                            customer_id: validatedData.customerId,
                            current_stage: validatedData.currentStage,
                            next_action_type: validatedData.nextActionType,
                            next_action_date: validatedData.nextActionDate,
                            priority: validatedData.priority,
                            assigned_to: validatedData.assignedTo,
                            notes: validatedData.notes,
                            status: 'active',
                        })
                            .select()
                            .single()];
                case 5:
                    _c = _k.sent(), newWorkflow = _c.data, error = _c.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: newWorkflow })];
                case 6:
                    validatedData = AddActivitySchema.parse(data);
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .select('customer_id')
                            .eq('id', validatedData.workflowId)
                            .single()];
                case 7:
                    _d = _k.sent(), workflow = _d.data, workflowError = _d.error;
                    if (workflowError || !workflow) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: validatedData.workflowId,
                            customer_id: workflow.customer_id,
                            activity_type: validatedData.activityType,
                            description: validatedData.description,
                            outcome: validatedData.outcome,
                            next_action: validatedData.nextAction,
                            next_action_date: validatedData.nextActionDate,
                            amount_collected: validatedData.amountCollected,
                            performed_by: user.id,
                        })
                            .select()
                            .single()];
                case 8:
                    _e = _k.sent(), newActivity = _e.data, error = _e.error;
                    if (error) {
                        throw error;
                    }
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .select('action_history')
                            .eq('id', validatedData.workflowId)
                            .single()];
                case 9:
                    currentWorkflow = (_k.sent()).data;
                    actionHistory = (currentWorkflow === null || currentWorkflow === void 0 ? void 0 : currentWorkflow.action_history) || [];
                    actionHistory.push({
                        action: validatedData.activityType,
                        date: new Date().toISOString(),
                        result: validatedData.outcome || 'Pending',
                        performedBy: user.id,
                    });
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            action_history: actionHistory,
                            next_action_type: validatedData.nextAction,
                            next_action_date: validatedData.nextActionDate,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', validatedData.workflowId)];
                case 10:
                    _k.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: newActivity })];
                case 11:
                    _f = zod_1.z.object({
                        workflowIds: zod_1.z.array(zod_1.z.string().uuid()),
                        assignedTo: zod_1.z.string().uuid(),
                    }).parse(data), workflowIds = _f.workflowIds, assignedTo = _f.assignedTo;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            assigned_to: assignedTo,
                            updated_at: new Date().toISOString(),
                        })
                            .in('id', workflowIds)
                            .select()];
                case 12:
                    _g = _k.sent(), updatedWorkflows = _g.data, error = _g.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "".concat((updatedWorkflows === null || updatedWorkflows === void 0 ? void 0 : updatedWorkflows.length) || 0, " workflows assigned successfully"),
                            data: updatedWorkflows,
                        })];
                case 13:
                    _h = zod_1.z.object({
                        workflowId: zod_1.z.string().uuid(),
                        escalationReason: zod_1.z.string(),
                        escalateTo: zod_1.z.string().uuid().optional(),
                    }).parse(data), workflowId = _h.workflowId, escalationReason = _h.escalationReason, escalateTo = _h.escalateTo;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: 'escalated',
                            assigned_to: escalateTo,
                            notes: escalationReason,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 14:
                    _j = _k.sent(), updatedWorkflow = _j.data, error = _j.error;
                    if (error) {
                        throw error;
                    }
                    // Add escalation activity
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: updatedWorkflow.customer_id,
                            activity_type: 'escalation',
                            description: "Workflow escalated: ".concat(escalationReason),
                            performed_by: user.id,
                        })];
                case 15:
                    // Add escalation activity
                    _k.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 16: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 17: return [3 /*break*/, 19];
                case 18:
                    error_2 = _k.sent();
                    console.error('Error processing workflow action:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to process workflow action' }, { status: 500 })];
                case 19: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/delinquency/workflows
 * Update collection workflows
 */
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, action, data, supabase, authHeader, _a, user, authError, _b, _c, workflowId, updates, updateData, _d, updatedWorkflow, error, validatedData, updateData, _e, updatedWorkflows, error, _f, workflowId, reason, _g, updatedWorkflow, error, workflowId, _h, updatedWorkflow, error, error_3;
        return __generator(this, function (_j) {
            switch (_j.label) {
                case 0:
                    _j.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _j.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _a = _j.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    _b = action;
                    switch (_b) {
                        case 'update_workflow': return [3 /*break*/, 3];
                        case 'bulk_update': return [3 /*break*/, 5];
                        case 'pause_workflow': return [3 /*break*/, 7];
                        case 'resume_workflow': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 11];
                case 3:
                    _c = zod_1.z.object({
                        workflowId: zod_1.z.string().uuid(),
                    }).merge(UpdateWorkflowSchema).parse(data), workflowId = _c.workflowId, updates = __rest(_c, ["workflowId"]);
                    updateData = {
                        updated_at: new Date().toISOString(),
                    };
                    if (updates.currentStage)
                        updateData.current_stage = updates.currentStage;
                    if (updates.nextActionType)
                        updateData.next_action_type = updates.nextActionType;
                    if (updates.nextActionDate)
                        updateData.next_action_date = updates.nextActionDate;
                    if (updates.status)
                        updateData.status = updates.status;
                    if (updates.assignedTo)
                        updateData.assigned_to = updates.assignedTo;
                    if (updates.priority)
                        updateData.priority = updates.priority;
                    if (updates.notes)
                        updateData.notes = updates.notes;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update(updateData)
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 4:
                    _d = _j.sent(), updatedWorkflow = _d.data, error = _d.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 5:
                    validatedData = BulkUpdateSchema.parse(data);
                    updateData = {
                        updated_at: new Date().toISOString(),
                    };
                    if (validatedData.updates.status)
                        updateData.status = validatedData.updates.status;
                    if (validatedData.updates.assignedTo)
                        updateData.assigned_to = validatedData.updates.assignedTo;
                    if (validatedData.updates.priority)
                        updateData.priority = validatedData.updates.priority;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update(updateData)
                            .in('id', validatedData.workflowIds)
                            .select()];
                case 6:
                    _e = _j.sent(), updatedWorkflows = _e.data, error = _e.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "".concat((updatedWorkflows === null || updatedWorkflows === void 0 ? void 0 : updatedWorkflows.length) || 0, " workflows updated successfully"),
                            data: updatedWorkflows,
                        })];
                case 7:
                    _f = zod_1.z.object({
                        workflowId: zod_1.z.string().uuid(),
                        reason: zod_1.z.string().optional(),
                    }).parse(data), workflowId = _f.workflowId, reason = _f.reason;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: 'paused',
                            notes: reason,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 8:
                    _g = _j.sent(), updatedWorkflow = _g.data, error = _g.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 9:
                    workflowId = zod_1.z.object({
                        workflowId: zod_1.z.string().uuid(),
                    }).parse(data).workflowId;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: 'active',
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)
                            .eq('status', 'paused')
                            .select()
                            .single()];
                case 10:
                    _h = _j.sent(), updatedWorkflow = _h.data, error = _h.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 11: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 12: return [3 /*break*/, 14];
                case 13:
                    error_3 = _j.sent();
                    console.error('Error updating workflow:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_3.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update workflow' }, { status: 500 })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * DELETE /api/delinquency/workflows
 * Complete or cancel collection workflows
 */
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, workflowId, action, supabase, authHeader, _a, user, authError, newStatus, _b, updatedWorkflow, error, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    workflowId = searchParams.get('workflowId');
                    action = searchParams.get('action') || 'complete';
                    if (!workflowId) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Workflow ID is required' }, { status: 400 })];
                    }
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 1:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    newStatus = action === 'complete' ? 'completed' : 'cancelled';
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update({
                            status: newStatus,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 2:
                    _b = _c.sent(), updatedWorkflow = _b.data, error = _b.error;
                    if (error) {
                        throw error;
                    }
                    // Add completion activity
                    return [4 /*yield*/, supabase
                            .from('collection_activities')
                            .insert({
                            workflow_id: workflowId,
                            customer_id: updatedWorkflow.customer_id,
                            activity_type: action === 'complete' ? 'payment' : 'escalation',
                            description: "Workflow ".concat(newStatus),
                            performed_by: user.id,
                        })];
                case 3:
                    // Add completion activity
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: "Workflow ".concat(newStatus, " successfully"),
                            data: updatedWorkflow,
                        })];
                case 4:
                    error_4 = _c.sent();
                    console.error('Error completing workflow:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to complete workflow' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
