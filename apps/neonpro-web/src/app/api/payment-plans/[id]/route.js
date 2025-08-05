"use strict";
// NeonPro - Individual Payment Plan API Routes
// Story 6.1 - Task 3: Installment Management System
// API endpoints for individual payment plan management
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
exports.PUT = PUT;
exports.DELETE = DELETE;
exports.PATCH = PATCH;
var server_1 = require("next/server");
var auth_helpers_nextjs_1 = require("@supabase/auth-helpers-nextjs");
var headers_1 = require("next/headers");
var zod_1 = require("zod");
var installment_manager_1 = require("@/lib/payments/installments/installment-manager");
// Validation schemas
var updatePaymentPlanSchema = zod_1.z.object({
    totalAmount: zod_1.z.number().positive().optional(),
    installmentCount: zod_1.z.number().int().min(1).max(60).optional(),
    frequency: zod_1.z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
    startDate: zod_1.z.string().refine(function (date) { return !isNaN(Date.parse(date)); }, {
        message: 'Invalid date format'
    }).optional(),
    description: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional()
});
var paramsSchema = zod_1.z.object({
    id: zod_1.z.string().uuid()
});
/**
 * GET /api/payment-plans/[id]
 * Get a specific payment plan with its installments
 */
function GET(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, session, authError, validatedParams, id, installmentManager, paymentPlan, installments, stats, error_1;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 5, , 6]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _c = _d.sent(), session = _c.data.session, authError = _c.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    validatedParams = paramsSchema.parse(params);
                    id = validatedParams.id;
                    installmentManager = (0, installment_manager_1.getInstallmentManager)();
                    return [4 /*yield*/, installmentManager.getPaymentPlan(id)];
                case 2:
                    paymentPlan = _d.sent();
                    if (!paymentPlan) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Payment plan not found' }, { status: 404 })];
                    }
                    return [4 /*yield*/, installmentManager.getInstallments(id)];
                case 3:
                    installments = _d.sent();
                    return [4 /*yield*/, installmentManager.getPaymentPlanStats(id)];
                case 4:
                    stats = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: {
                                paymentPlan: paymentPlan,
                                installments: installments,
                                stats: stats
                            }
                        })];
                case 5:
                    error_1 = _d.sent();
                    console.error('Error fetching payment plan:', error_1);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid payment plan ID',
                                details: error_1.errors
                            }, { status: 400 })];
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 6: return [2 /*return*/];
            }
        });
    });
}
/**
 * PUT /api/payment-plans/[id]
 * Update a specific payment plan
 */
function PUT(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, session, authError, validatedParams, id, body, validatedData, installmentManager, updatedPaymentPlan, error_2;
        var params = _b.params;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _c = _d.sent(), session = _c.data.session, authError = _c.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    validatedParams = paramsSchema.parse(params);
                    id = validatedParams.id;
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _d.sent();
                    validatedData = updatePaymentPlanSchema.parse(body);
                    installmentManager = (0, installment_manager_1.getInstallmentManager)();
                    return [4 /*yield*/, installmentManager.modifyPaymentPlan(id, __assign(__assign({}, validatedData), { startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined }))];
                case 3:
                    updatedPaymentPlan = _d.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            data: updatedPaymentPlan,
                            message: 'Payment plan updated successfully'
                        })];
                case 4:
                    error_2 = _d.sent();
                    console.error('Error updating payment plan:', error_2);
                    if (error_2 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid request data',
                                details: error_2.errors
                            }, { status: 400 })];
                    }
                    if (error_2 instanceof Error) {
                        // Check for specific business logic errors
                        if (error_2.message.includes('Payment plan not found')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Payment plan not found' }, { status: 404 })];
                        }
                        if (error_2.message.includes('Cannot modify completed payment plan')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot modify completed payment plan' }, { status: 400 })];
                        }
                        if (error_2.message.includes('Cannot modify cancelled payment plan')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot modify cancelled payment plan' }, { status: 400 })];
                        }
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * DELETE /api/payment-plans/[id]
 * Cancel a specific payment plan
 */
function DELETE(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, session, authError, validatedParams, id, reason, body, _d, installmentManager, error_3;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 7, , 8]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _c = _e.sent(), session = _c.data.session, authError = _c.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    validatedParams = paramsSchema.parse(params);
                    id = validatedParams.id;
                    reason = 'Cancelled by user';
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, request.json()];
                case 3:
                    body = _e.sent();
                    if (body.reason) {
                        reason = body.reason;
                    }
                    return [3 /*break*/, 5];
                case 4:
                    _d = _e.sent();
                    return [3 /*break*/, 5];
                case 5:
                    installmentManager = (0, installment_manager_1.getInstallmentManager)();
                    // Cancel payment plan
                    return [4 /*yield*/, installmentManager.cancelPaymentPlan(id, reason)];
                case 6:
                    // Cancel payment plan
                    _e.sent();
                    return [2 /*return*/, server_1.NextResponse.json({
                            success: true,
                            message: 'Payment plan cancelled successfully'
                        })];
                case 7:
                    error_3 = _e.sent();
                    console.error('Error cancelling payment plan:', error_3);
                    if (error_3 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid payment plan ID',
                                details: error_3.errors
                            }, { status: 400 })];
                    }
                    if (error_3 instanceof Error) {
                        // Check for specific business logic errors
                        if (error_3.message.includes('Payment plan not found')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Payment plan not found' }, { status: 404 })];
                        }
                        if (error_3.message.includes('Payment plan already cancelled')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Payment plan already cancelled' }, { status: 400 })];
                        }
                        if (error_3.message.includes('Cannot cancel completed payment plan')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot cancel completed payment plan' }, { status: 400 })];
                        }
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * PATCH /api/payment-plans/[id]
 * Perform specific actions on a payment plan
 */
function PATCH(request_1, _a) {
    return __awaiter(this, arguments, void 0, function (request, _b) {
        var supabase, _c, session, authError, validatedParams, id, body, action, data, installmentManager, result, _d, reason, error_4;
        var params = _b.params;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 13, , 14]);
                    supabase = (0, auth_helpers_nextjs_1.createRouteHandlerClient)({ cookies: headers_1.cookies });
                    return [4 /*yield*/, supabase.auth.getSession()];
                case 1:
                    _c = _e.sent(), session = _c.data.session, authError = _c.error;
                    if (authError || !session) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Unauthorized' }, { status: 401 })];
                    }
                    validatedParams = paramsSchema.parse(params);
                    id = validatedParams.id;
                    return [4 /*yield*/, request.json()];
                case 2:
                    body = _e.sent();
                    action = body.action, data = body.data;
                    if (!action) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Action is required' }, { status: 400 })];
                    }
                    installmentManager = (0, installment_manager_1.getInstallmentManager)();
                    result = void 0;
                    _d = action;
                    switch (_d) {
                        case 'regenerate_installments': return [3 /*break*/, 3];
                        case 'recalculate_amounts': return [3 /*break*/, 5];
                        case 'mark_as_defaulted': return [3 /*break*/, 7];
                        case 'reactivate': return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 11];
                case 3: return [4 /*yield*/, installmentManager.regenerateInstallments(id)];
                case 4:
                    // Regenerate installments for the payment plan
                    result = _e.sent();
                    return [3 /*break*/, 12];
                case 5: return [4 /*yield*/, installmentManager.recalculateInstallmentAmounts(id)];
                case 6:
                    // Recalculate installment amounts
                    result = _e.sent();
                    return [3 /*break*/, 12];
                case 7:
                    reason = (data === null || data === void 0 ? void 0 : data.reason) || 'Marked as defaulted';
                    return [4 /*yield*/, installmentManager.markAsDefaulted(id, reason)];
                case 8:
                    result = _e.sent();
                    return [3 /*break*/, 12];
                case 9: return [4 /*yield*/, installmentManager.reactivatePaymentPlan(id)];
                case 10:
                    // Reactivate a cancelled payment plan
                    result = _e.sent();
                    return [3 /*break*/, 12];
                case 11: return [2 /*return*/, server_1.NextResponse.json({
                        error: 'Invalid action',
                        supportedActions: [
                            'regenerate_installments',
                            'recalculate_amounts',
                            'mark_as_defaulted',
                            'reactivate'
                        ]
                    }, { status: 400 })];
                case 12: return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        data: result,
                        message: "Action '".concat(action, "' completed successfully")
                    })];
                case 13:
                    error_4 = _e.sent();
                    console.error('Error performing payment plan action:', error_4);
                    if (error_4 instanceof zod_1.z.ZodError) {
                        return [2 /*return*/, server_1.NextResponse.json({
                                error: 'Invalid payment plan ID',
                                details: error_4.errors
                            }, { status: 400 })];
                    }
                    if (error_4 instanceof Error) {
                        // Check for specific business logic errors
                        if (error_4.message.includes('Payment plan not found')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: 'Payment plan not found' }, { status: 404 })];
                        }
                        if (error_4.message.includes('Invalid action for current status')) {
                            return [2 /*return*/, server_1.NextResponse.json({ error: error_4.message }, { status: 400 })];
                        }
                    }
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Internal server error' }, { status: 500 })];
                case 14: return [2 /*return*/];
            }
        });
    });
}
