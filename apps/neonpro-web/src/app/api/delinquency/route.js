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
var delinquency_manager_1 = require("@/lib/payments/delinquency/delinquency-manager");
// Validation schemas
var GetDelinquencyQuerySchema = zod_1.z.object({
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('20'),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    daysOverdue: zod_1.z.string().optional(),
    customerId: zod_1.z.string().uuid().optional(),
    sortBy: zod_1.z.enum(['daysOverdue', 'amount', 'riskLevel', 'customerName']).optional().default('daysOverdue'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).optional().default('desc'),
});
var ProcessWorkflowsSchema = zod_1.z.object({
    customerIds: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    riskLevels: zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'critical'])).optional(),
    dryRun: zod_1.z.boolean().optional().default(false),
});
var CreatePaymentPlanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    originalAmount: zod_1.z.number().positive(),
    negotiatedAmount: zod_1.z.number().positive(),
    installments: zod_1.z.number().int().positive(),
    startDate: zod_1.z.string().datetime(),
    interestRate: zod_1.z.number().min(0).optional().default(0),
    discountAmount: zod_1.z.number().min(0).optional().default(0),
    terms: zod_1.z.string(),
});
var SendNotificationSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['reminder', 'warning', 'final_notice', 'collection', 'legal']),
    channel: zod_1.z.enum(['email', 'sms', 'call', 'letter']),
    templateId: zod_1.z.string().uuid(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
var UpdateRiskProfileSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    riskScore: zod_1.z.number().min(0).max(1000).optional(),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
    creditLimit: zod_1.z.number().optional(),
    notes: zod_1.z.string().optional(),
});
/**
 * GET /api/delinquency
 * Get overdue payments and delinquency data
 */
function GET(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, query, supabase, authHeader, _a, user, authError, delinquencyManager, page, limit, offset, supabaseQuery, daysOverdue, sortColumn, _b, overduePayments, queryError, count, stats, error_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    searchParams = new URL(request.url).searchParams;
                    query = GetDelinquencyQuerySchema.parse(Object.fromEntries(searchParams));
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
                    delinquencyManager = new delinquency_manager_1.DelinquencyManager(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    page = parseInt(query.page);
                    limit = parseInt(query.limit);
                    offset = (page - 1) * limit;
                    supabaseQuery = supabase
                        .from('overdue_payments_summary')
                        .select('*', { count: 'exact' })
                        .range(offset, offset + limit - 1);
                    // Apply filters
                    if (query.riskLevel) {
                        supabaseQuery = supabaseQuery.eq('risk_level', query.riskLevel);
                    }
                    if (query.daysOverdue) {
                        daysOverdue = parseInt(query.daysOverdue);
                        supabaseQuery = supabaseQuery.gte('max_days_overdue', daysOverdue);
                    }
                    if (query.customerId) {
                        supabaseQuery = supabaseQuery.eq('customer_id', query.customerId);
                    }
                    sortColumn = {
                        daysOverdue: 'max_days_overdue',
                        amount: 'total_overdue_amount',
                        riskLevel: 'risk_level',
                        customerName: 'customer_name',
                    }[query.sortBy];
                    supabaseQuery = supabaseQuery.order(sortColumn, { ascending: query.sortOrder === 'asc' });
                    return [4 /*yield*/, supabaseQuery];
                case 2:
                    _b = _c.sent(), overduePayments = _b.data, queryError = _b.error, count = _b.count;
                    if (queryError) {
                        throw queryError;
                    }
                    return [4 /*yield*/, delinquencyManager.getDelinquencyStats()];
                case 3:
                    stats = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            data: overduePayments || [],
                            pagination: {
                                page: page,
                                limit: limit,
                                total: count || 0,
                                totalPages: Math.ceil((count || 0) / limit),
                            },
                            stats: stats,
                        })];
                case 4:
                    error_1 = _c.sent();
                    console.error('Error fetching delinquency data:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to fetch delinquency data' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * POST /api/delinquency
 * Process collection workflows, create payment plans, or send notifications
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, action, data, supabase, authHeader, _a, user, authError, delinquencyManager, _b, overduePayments, validatedData_1, overduePayments, filteredPayments, validatedData, installmentAmount, endDate, paymentPlan, validatedData, success, customerId, riskProfile, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 17, , 18]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _c.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _a = _c.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    delinquencyManager = new delinquency_manager_1.DelinquencyManager(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                        smtp: {
                            host: process.env.SMTP_HOST,
                            port: parseInt(process.env.SMTP_PORT),
                            secure: process.env.SMTP_SECURE === 'true',
                            auth: {
                                user: process.env.SMTP_USER,
                                pass: process.env.SMTP_PASS,
                            },
                        },
                        from: process.env.SMTP_FROM,
                    });
                    _b = action;
                    switch (_b) {
                        case 'detect_overdue': return [3 /*break*/, 3];
                        case 'process_workflows': return [3 /*break*/, 5];
                        case 'create_payment_plan': return [3 /*break*/, 9];
                        case 'send_notification': return [3 /*break*/, 11];
                        case 'calculate_risk_score': return [3 /*break*/, 13];
                    }
                    return [3 /*break*/, 15];
                case 3: return [4 /*yield*/, delinquencyManager.detectOverduePayments()];
                case 4:
                    overduePayments = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: overduePayments,
                            count: overduePayments.length
                        })];
                case 5:
                    validatedData_1 = ProcessWorkflowsSchema.parse(data);
                    if (!validatedData_1.dryRun) return [3 /*break*/, 7];
                    return [4 /*yield*/, delinquencyManager.detectOverduePayments()];
                case 6:
                    overduePayments = _c.sent();
                    filteredPayments = overduePayments;
                    if (validatedData_1.customerIds) {
                        filteredPayments = filteredPayments.filter(function (p) {
                            return validatedData_1.customerIds.includes(p.customerId);
                        });
                    }
                    if (validatedData_1.riskLevels) {
                        filteredPayments = filteredPayments.filter(function (p) {
                            return validatedData_1.riskLevels.includes(p.riskLevel);
                        });
                    }
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            dryRun: true,
                            affectedCustomers: filteredPayments.length,
                            preview: filteredPayments.slice(0, 10),
                        })];
                case 7: return [4 /*yield*/, delinquencyManager.processCollectionWorkflows()];
                case 8:
                    _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, message: 'Workflows processed successfully' })];
                case 9:
                    validatedData = CreatePaymentPlanSchema.parse(data);
                    installmentAmount = validatedData.negotiatedAmount / validatedData.installments;
                    endDate = new Date(validatedData.startDate);
                    endDate.setMonth(endDate.getMonth() + validatedData.installments);
                    return [4 /*yield*/, delinquencyManager.createPaymentPlan({
                            customerId: validatedData.customerId,
                            originalAmount: validatedData.originalAmount,
                            negotiatedAmount: validatedData.negotiatedAmount,
                            installments: validatedData.installments,
                            installmentAmount: installmentAmount,
                            startDate: new Date(validatedData.startDate),
                            endDate: endDate,
                            interestRate: validatedData.interestRate,
                            discountAmount: validatedData.discountAmount,
                            terms: validatedData.terms,
                        })];
                case 10:
                    paymentPlan = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: paymentPlan })];
                case 11:
                    validatedData = SendNotificationSchema.parse(data);
                    return [4 /*yield*/, delinquencyManager.sendNotification(validatedData.customerId, validatedData.type, validatedData.channel, validatedData.templateId, validatedData.metadata)];
                case 12:
                    success = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: success,
                            message: success ? 'Notification sent successfully' : 'Failed to send notification'
                        })];
                case 13:
                    customerId = zod_1.z.object({ customerId: zod_1.z.string().uuid() }).parse(data).customerId;
                    return [4 /*yield*/, delinquencyManager.calculateRiskScore(customerId)];
                case 14:
                    riskProfile = _c.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: riskProfile })];
                case 15: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 16: return [3 /*break*/, 18];
                case 17:
                    error_2 = _c.sent();
                    console.error('Error processing delinquency action:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_2.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to process delinquency action' }, { status: 500 })];
                case 18: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/delinquency
 * Update risk profiles or delinquency rules
 */
function PUT(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, action, data, supabase, authHeader, _a, user, authError, _b, validatedData, updateData, _c, updatedProfile, error, _d, planId, status_1, _e, updatedPlan, error, _f, workflowId, currentStage, nextActionType, nextActionDate, notes, updateData, _g, updatedWorkflow, error, error_3;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    _h.trys.push([0, 11, , 12]);
                    return [4 /*yield*/, request.json()];
                case 1:
                    body = _h.sent();
                    action = body.action, data = __rest(body, ["action"]);
                    supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
                    authHeader = request.headers.get('authorization');
                    if (!authHeader) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    return [4 /*yield*/, supabase.auth.getUser(authHeader.replace('Bearer ', ''))];
                case 2:
                    _a = _h.sent(), user = _a.data.user, authError = _a.error;
                    if (authError || !user) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    _b = action;
                    switch (_b) {
                        case 'update_risk_profile': return [3 /*break*/, 3];
                        case 'update_payment_plan_status': return [3 /*break*/, 5];
                        case 'update_collection_workflow': return [3 /*break*/, 7];
                    }
                    return [3 /*break*/, 9];
                case 3:
                    validatedData = UpdateRiskProfileSchema.parse(data);
                    updateData = {
                        updated_at: new Date().toISOString(),
                    };
                    if (validatedData.riskScore !== undefined) {
                        updateData.risk_score = validatedData.riskScore;
                    }
                    if (validatedData.riskLevel !== undefined) {
                        updateData.risk_level = validatedData.riskLevel;
                    }
                    if (validatedData.creditLimit !== undefined) {
                        updateData.credit_limit = validatedData.creditLimit;
                    }
                    return [4 /*yield*/, supabase
                            .from('customer_risk_profiles')
                            .update(updateData)
                            .eq('customer_id', validatedData.customerId)
                            .select()
                            .single()];
                case 4:
                    _c = _h.sent(), updatedProfile = _c.data, error = _c.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedProfile })];
                case 5:
                    _d = zod_1.z.object({
                        planId: zod_1.z.string().uuid(),
                        status: zod_1.z.enum(['pending', 'active', 'completed', 'defaulted']),
                    }).parse(data), planId = _d.planId, status_1 = _d.status;
                    return [4 /*yield*/, supabase
                            .from('delinquency_payment_plans')
                            .update(__assign({ status: status_1, updated_at: new Date().toISOString() }, (status_1 === 'active' ? { approved_by: user.id, approved_at: new Date().toISOString() } : {})))
                            .eq('id', planId)
                            .select()
                            .single()];
                case 6:
                    _e = _h.sent(), updatedPlan = _e.data, error = _e.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedPlan })];
                case 7:
                    _f = zod_1.z.object({
                        workflowId: zod_1.z.string().uuid(),
                        currentStage: zod_1.z.string().optional(),
                        nextActionType: zod_1.z.string().optional(),
                        nextActionDate: zod_1.z.string().datetime().optional(),
                        notes: zod_1.z.string().optional(),
                    }).parse(data), workflowId = _f.workflowId, currentStage = _f.currentStage, nextActionType = _f.nextActionType, nextActionDate = _f.nextActionDate, notes = _f.notes;
                    updateData = {
                        updated_at: new Date().toISOString(),
                    };
                    if (currentStage)
                        updateData.current_stage = currentStage;
                    if (nextActionType)
                        updateData.next_action_type = nextActionType;
                    if (nextActionDate)
                        updateData.next_action_date = nextActionDate;
                    if (notes)
                        updateData.notes = notes;
                    return [4 /*yield*/, supabase
                            .from('collection_workflows')
                            .update(updateData)
                            .eq('id', workflowId)
                            .select()
                            .single()];
                case 8:
                    _g = _h.sent(), updatedWorkflow = _g.data, error = _g.error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, data: updatedWorkflow })];
                case 9: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_3 = _h.sent();
                    console.error('Error updating delinquency data:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Validation error', details: error_3.errors }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to update delinquency data' }, { status: 500 })];
                case 12: return [2 /*return*/];
            }
        });
    });
}
/**
 * DELETE /api/delinquency
 * Delete payment plans, workflows, or notifications
 */
function DELETE(request) {
    return __awaiter(this, void 0, void 0, function () {
        var searchParams, action, id, supabase, authHeader, _a, user, authError, _b, error, error, error, error_4;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    searchParams = new URL(request.url).searchParams;
                    action = searchParams.get('action');
                    id = searchParams.get('id');
                    if (!action || !id) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Action and ID are required' }, { status: 400 })];
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
                    _b = action;
                    switch (_b) {
                        case 'payment_plan': return [3 /*break*/, 2];
                        case 'collection_workflow': return [3 /*break*/, 4];
                        case 'scheduled_notification': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 8];
                case 2: return [4 /*yield*/, supabase
                        .from('delinquency_payment_plans')
                        .delete()
                        .eq('id', id)
                        .eq('status', 'pending')];
                case 3:
                    error = (_c.sent()).error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, message: 'Payment plan deleted successfully' })];
                case 4: return [4 /*yield*/, supabase
                        .from('collection_workflows')
                        .update({ status: 'completed', updated_at: new Date().toISOString() })
                        .eq('id', id)];
                case 5:
                    error = (_c.sent()).error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, message: 'Collection workflow completed' })];
                case 6: return [4 /*yield*/, supabase
                        .from('scheduled_notifications')
                        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
                        .eq('id', id)
                        .eq('status', 'scheduled')];
                case 7:
                    error = (_c.sent()).error;
                    if (error) {
                        throw error;
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ success: true, message: 'Scheduled notification cancelled' })];
                case 8: return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid action' }, { status: 400 })];
                case 9: return [3 /*break*/, 11];
                case 10:
                    error_4 = _c.sent();
                    console.error('Error deleting delinquency data:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Failed to delete delinquency data' }, { status: 500 })];
                case 11: return [2 /*return*/];
            }
        });
    });
}
