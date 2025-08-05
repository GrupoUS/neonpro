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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DelinquencyManager = void 0;
var zod_1 = require("zod");
var supabase_js_1 = require("@supabase/supabase-js");
var date_fns_1 = require("date-fns");
var locale_1 = require("date-fns/locale");
var nodemailer_1 = require("nodemailer");
// Validation Schemas
var CustomerRiskProfileSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    riskScore: zod_1.z.number().min(0).max(1000),
    riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']),
    paymentHistory: zod_1.z.object({
        totalPayments: zod_1.z.number(),
        onTimePayments: zod_1.z.number(),
        latePayments: zod_1.z.number(),
        averageDelayDays: zod_1.z.number(),
        lastPaymentDate: zod_1.z.date().optional(),
    }),
    creditLimit: zod_1.z.number().optional(),
    lastUpdated: zod_1.z.date(),
});
var DelinquencyRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    triggerConditions: zod_1.z.object({
        daysOverdue: zod_1.z.number(),
        amountThreshold: zod_1.z.number().optional(),
        riskLevel: zod_1.z.enum(['low', 'medium', 'high', 'critical']).optional(),
        customerSegment: zod_1.z.string().optional(),
    }),
    actions: zod_1.z.array(zod_1.z.object({
        type: zod_1.z.enum(['email', 'sms', 'call', 'letter', 'collection_agency', 'legal_action']),
        delay: zod_1.z.number(), // Days after trigger
        template: zod_1.z.string(),
        escalation: zod_1.z.boolean().default(false),
    })),
    isActive: zod_1.z.boolean().default(true),
});
var PaymentPlanSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    originalAmount: zod_1.z.number().positive(),
    negotiatedAmount: zod_1.z.number().positive(),
    installments: zod_1.z.number().positive(),
    installmentAmount: zod_1.z.number().positive(),
    startDate: zod_1.z.date(),
    endDate: zod_1.z.date(),
    interestRate: zod_1.z.number().min(0).default(0),
    discountAmount: zod_1.z.number().min(0).default(0),
    terms: zod_1.z.string(),
    status: zod_1.z.enum(['pending', 'active', 'completed', 'defaulted']).default('pending'),
});
var NotificationSchema = zod_1.z.object({
    customerId: zod_1.z.string().uuid(),
    type: zod_1.z.enum(['reminder', 'warning', 'final_notice', 'collection', 'legal']),
    channel: zod_1.z.enum(['email', 'sms', 'call', 'letter']),
    template: zod_1.z.string(),
    scheduledFor: zod_1.z.date(),
    sentAt: zod_1.z.date().optional(),
    status: zod_1.z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
/**
 * Delinquency Management System
 * Handles overdue payment detection, escalating notifications, and collection workflows
 */
var DelinquencyManager = /** @class */ (function () {
    function DelinquencyManager(supabaseUrl, supabaseKey, emailConfig) {
        this.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        if (emailConfig) {
            this.emailTransporter = nodemailer_1.default.createTransporter(emailConfig.smtp);
        }
    }
    /**
     * Detect and process overdue payments
     */
    DelinquencyManager.prototype.detectOverduePayments = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, overdueInvoices, invoiceError, _b, overdueInstallments, installmentError, overduePayments_1, error_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.supabase
                                .from('receipts_invoices')
                                .select("\n          id,\n          number,\n          data,\n          customer_id,\n          customers!inner(name, email, risk_profile)\n        ")
                                .eq('type', 'invoice')
                                .in('status', ['sent', 'overdue'])
                                .lt('data->>dueDate', new Date().toISOString())];
                    case 1:
                        _a = _c.sent(), overdueInvoices = _a.data, invoiceError = _a.error;
                        if (invoiceError)
                            throw invoiceError;
                        return [4 /*yield*/, this.supabase
                                .from('payment_installments')
                                .select("\n          id,\n          amount,\n          due_date,\n          payment_plan_id,\n          payment_plans!inner(\n            customer_id,\n            customers!inner(name, email, risk_profile)\n          )\n        ")
                                .eq('status', 'pending')
                                .lt('due_date', new Date().toISOString())];
                    case 2:
                        _b = _c.sent(), overdueInstallments = _b.data, installmentError = _b.error;
                        if (installmentError)
                            throw installmentError;
                        overduePayments_1 = [];
                        // Process overdue invoices
                        overdueInvoices === null || overdueInvoices === void 0 ? void 0 : overdueInvoices.forEach(function (invoice) {
                            var dueDate = new Date(invoice.data.dueDate);
                            var daysOverdue = (0, date_fns_1.differenceInDays)(new Date(), dueDate);
                            overduePayments_1.push({
                                id: invoice.id,
                                customerId: invoice.customer_id,
                                customerName: invoice.customers.name,
                                customerEmail: invoice.customers.email,
                                amount: parseFloat(invoice.data.total),
                                dueDate: dueDate,
                                daysOverdue: daysOverdue,
                                type: 'invoice',
                                status: 'overdue',
                                riskLevel: _this.calculateRiskLevel(invoice.customers.risk_profile, daysOverdue),
                            });
                        });
                        // Process overdue installments
                        overdueInstallments === null || overdueInstallments === void 0 ? void 0 : overdueInstallments.forEach(function (installment) {
                            var dueDate = new Date(installment.due_date);
                            var daysOverdue = (0, date_fns_1.differenceInDays)(new Date(), dueDate);
                            overduePayments_1.push({
                                id: installment.id,
                                customerId: installment.payment_plans.customer_id,
                                customerName: installment.payment_plans.customers.name,
                                customerEmail: installment.payment_plans.customers.email,
                                amount: installment.amount,
                                dueDate: dueDate,
                                daysOverdue: daysOverdue,
                                type: 'installment',
                                status: 'overdue',
                                riskLevel: _this.calculateRiskLevel(installment.payment_plans.customers.risk_profile, daysOverdue),
                            });
                        });
                        // Update overdue status in database
                        return [4 /*yield*/, this.updateOverdueStatus(overduePayments_1)];
                    case 3:
                        // Update overdue status in database
                        _c.sent();
                        return [2 /*return*/, overduePayments_1];
                    case 4:
                        error_1 = _c.sent();
                        console.error('Error detecting overdue payments:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process collection workflows for overdue payments
     */
    DelinquencyManager.prototype.processCollectionWorkflows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var overduePayments, rules, _loop_1, this_1, _i, overduePayments_2, payment, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.detectOverduePayments()];
                    case 1:
                        overduePayments = _a.sent();
                        return [4 /*yield*/, this.getActiveDelinquencyRules()];
                    case 2:
                        rules = _a.sent();
                        _loop_1 = function (payment) {
                            var applicableRules, _b, applicableRules_1, rule;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        applicableRules = rules.filter(function (rule) {
                                            return _this.isRuleApplicable(rule, payment);
                                        });
                                        _b = 0, applicableRules_1 = applicableRules;
                                        _c.label = 1;
                                    case 1:
                                        if (!(_b < applicableRules_1.length)) return [3 /*break*/, 4];
                                        rule = applicableRules_1[_b];
                                        return [4 /*yield*/, this_1.executeRule(rule, payment)];
                                    case 2:
                                        _c.sent();
                                        _c.label = 3;
                                    case 3:
                                        _b++;
                                        return [3 /*break*/, 1];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, overduePayments_2 = overduePayments;
                        _a.label = 3;
                    case 3:
                        if (!(_i < overduePayments_2.length)) return [3 /*break*/, 6];
                        payment = overduePayments_2[_i];
                        return [5 /*yield**/, _loop_1(payment)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        console.error('Error processing collection workflows:', error_2);
                        throw error_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate customer risk score
     */
    DelinquencyManager.prototype.calculateRiskScore = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, paymentHistory, error, totalPayments, onTimePayments, latePayments, averageDelayDays, riskScore, punctualityScore, delayScore, frequencyScore, lastPaymentDate, daysSinceLastPayment, activityScore, riskLevel, riskProfile, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase.rpc('get_customer_payment_history', { customer_id: customerId })];
                    case 1:
                        _a = _b.sent(), paymentHistory = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        totalPayments = (paymentHistory === null || paymentHistory === void 0 ? void 0 : paymentHistory.total_payments) || 0;
                        onTimePayments = (paymentHistory === null || paymentHistory === void 0 ? void 0 : paymentHistory.on_time_payments) || 0;
                        latePayments = (paymentHistory === null || paymentHistory === void 0 ? void 0 : paymentHistory.late_payments) || 0;
                        averageDelayDays = (paymentHistory === null || paymentHistory === void 0 ? void 0 : paymentHistory.average_delay_days) || 0;
                        riskScore = 0;
                        punctualityScore = totalPayments > 0 ? (onTimePayments / totalPayments) * 400 : 200;
                        riskScore += 400 - punctualityScore;
                        delayScore = Math.min(averageDelayDays * 10, 300);
                        riskScore += delayScore;
                        frequencyScore = totalPayments < 5 ? 200 : Math.max(0, 200 - (totalPayments * 5));
                        riskScore += frequencyScore;
                        lastPaymentDate = (paymentHistory === null || paymentHistory === void 0 ? void 0 : paymentHistory.last_payment_date)
                            ? new Date(paymentHistory.last_payment_date)
                            : null;
                        daysSinceLastPayment = lastPaymentDate
                            ? (0, date_fns_1.differenceInDays)(new Date(), lastPaymentDate)
                            : 365;
                        activityScore = Math.min(daysSinceLastPayment * 0.3, 100);
                        riskScore += activityScore;
                        riskLevel = void 0;
                        if (riskScore <= 250)
                            riskLevel = 'low';
                        else if (riskScore <= 500)
                            riskLevel = 'medium';
                        else if (riskScore <= 750)
                            riskLevel = 'high';
                        else
                            riskLevel = 'critical';
                        riskProfile = {
                            customerId: customerId,
                            riskScore: Math.round(riskScore),
                            riskLevel: riskLevel,
                            paymentHistory: {
                                totalPayments: totalPayments,
                                onTimePayments: onTimePayments,
                                latePayments: latePayments,
                                averageDelayDays: averageDelayDays,
                                lastPaymentDate: lastPaymentDate,
                            },
                            lastUpdated: new Date(),
                        };
                        // Save risk profile
                        return [4 /*yield*/, this.supabase
                                .from('customer_risk_profiles')
                                .upsert({
                                customer_id: customerId,
                                risk_score: riskProfile.riskScore,
                                risk_level: riskProfile.riskLevel,
                                payment_history: riskProfile.paymentHistory,
                                last_updated: riskProfile.lastUpdated.toISOString(),
                            })];
                    case 2:
                        // Save risk profile
                        _b.sent();
                        return [2 /*return*/, riskProfile];
                    case 3:
                        error_3 = _b.sent();
                        console.error('Error calculating risk score:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create payment plan for delinquent customer
     */
    DelinquencyManager.prototype.createPaymentPlan = function (planData) {
        return __awaiter(this, void 0, void 0, function () {
            var validatedData, paymentPlan, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        validatedData = PaymentPlanSchema.omit({ status: true }).parse(planData);
                        paymentPlan = __assign(__assign({}, validatedData), { status: 'pending' });
                        return [4 /*yield*/, this.supabase
                                .from('delinquency_payment_plans')
                                .insert({
                                customer_id: paymentPlan.customerId,
                                original_amount: paymentPlan.originalAmount,
                                negotiated_amount: paymentPlan.negotiatedAmount,
                                installments: paymentPlan.installments,
                                installment_amount: paymentPlan.installmentAmount,
                                start_date: paymentPlan.startDate.toISOString(),
                                end_date: paymentPlan.endDate.toISOString(),
                                interest_rate: paymentPlan.interestRate,
                                discount_amount: paymentPlan.discountAmount,
                                terms: paymentPlan.terms,
                                status: paymentPlan.status,
                            })
                                .select()
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, paymentPlan];
                    case 2:
                        error_4 = _b.sent();
                        console.error('Error creating payment plan:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send notification to customer
     */
    DelinquencyManager.prototype.sendNotification = function (customerId, type, channel, templateId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, customer, customerError, _b, template, templateError, success, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('customers')
                                .select('*')
                                .eq('id', customerId)
                                .single()];
                    case 1:
                        _a = _c.sent(), customer = _a.data, customerError = _a.error;
                        if (customerError || !customer) {
                            throw new Error('Customer not found');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('notification_templates')
                                .select('*')
                                .eq('id', templateId)
                                .single()];
                    case 2:
                        _b = _c.sent(), template = _b.data, templateError = _b.error;
                        if (templateError || !template) {
                            throw new Error('Template not found');
                        }
                        success = false;
                        if (!(channel === 'email' && this.emailTransporter)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendEmailNotification(customer, template, metadata)];
                    case 3:
                        success = _c.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        if (!(channel === 'sms')) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendSMSNotification(customer, template, metadata)];
                    case 5:
                        success = _c.sent();
                        _c.label = 6;
                    case 6: 
                    // Log notification
                    return [4 /*yield*/, this.supabase
                            .from('delinquency_notifications')
                            .insert({
                            customer_id: customerId,
                            type: type,
                            channel: channel,
                            template_id: templateId,
                            sent_at: success ? new Date().toISOString() : null,
                            status: success ? 'sent' : 'failed',
                            metadata: metadata,
                        })];
                    case 7:
                        // Log notification
                        _c.sent();
                        return [2 /*return*/, success];
                    case 8:
                        error_5 = _c.sent();
                        console.error('Error sending notification:', error_5);
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get delinquency statistics
     */
    DelinquencyManager.prototype.getDelinquencyStats = function (dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase.rpc('get_delinquency_statistics', {
                                start_date: (_b = dateRange === null || dateRange === void 0 ? void 0 : dateRange.from) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                end_date: (_c = dateRange === null || dateRange === void 0 ? void 0 : dateRange.to) === null || _c === void 0 ? void 0 : _c.toISOString(),
                            })];
                    case 1:
                        _a = _d.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, {
                                totalOverdue: (data === null || data === void 0 ? void 0 : data.total_overdue) || 0,
                                totalAmount: (data === null || data === void 0 ? void 0 : data.total_amount) || 0,
                                averageDaysOverdue: (data === null || data === void 0 ? void 0 : data.average_days_overdue) || 0,
                                riskDistribution: (data === null || data === void 0 ? void 0 : data.risk_distribution) || {},
                                recoveryRate: (data === null || data === void 0 ? void 0 : data.recovery_rate) || 0,
                                collectionEfficiency: (data === null || data === void 0 ? void 0 : data.collection_efficiency) || 0,
                            }];
                    case 2:
                        error_6 = _d.sent();
                        console.error('Error getting delinquency stats:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get collection workflow for customer
     */
    DelinquencyManager.prototype.getCollectionWorkflow = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('collection_workflows')
                                .select('*')
                                .eq('customer_id', customerId)
                                .eq('status', 'active')
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116')
                            throw error;
                        if (!data)
                            return [2 /*return*/, null];
                        return [2 /*return*/, {
                                customerId: data.customer_id,
                                currentStage: data.current_stage,
                                nextAction: {
                                    type: data.next_action_type,
                                    scheduledFor: new Date(data.next_action_date),
                                    template: data.next_action_template,
                                },
                                history: data.action_history || [],
                            }];
                    case 2:
                        error_7 = _b.sent();
                        console.error('Error getting collection workflow:', error_7);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Private methods
    DelinquencyManager.prototype.calculateRiskLevel = function (riskProfile, daysOverdue) {
        if (daysOverdue > 90)
            return 'critical';
        if (daysOverdue > 60)
            return 'high';
        if (daysOverdue > 30)
            return 'medium';
        return (riskProfile === null || riskProfile === void 0 ? void 0 : riskProfile.risk_level) || 'low';
    };
    DelinquencyManager.prototype.updateOverdueStatus = function (overduePayments) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, overduePayments_3, payment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, overduePayments_3 = overduePayments;
                        _a.label = 1;
                    case 1:
                        if (!(_i < overduePayments_3.length)) return [3 /*break*/, 6];
                        payment = overduePayments_3[_i];
                        if (!(payment.type === 'invoice')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.supabase
                                .from('receipts_invoices')
                                .update({ status: 'overdue' })
                                .eq('id', payment.id)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(payment.type === 'installment')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.supabase
                                .from('payment_installments')
                                .update({ status: 'overdue' })
                                .eq('id', payment.id)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    DelinquencyManager.prototype.getActiveDelinquencyRules = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('delinquency_rules')
                            .select('*')
                            .eq('is_active', true)];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.map(function (rule) { return ({
                                id: rule.id,
                                name: rule.name,
                                description: rule.description,
                                triggerConditions: rule.trigger_conditions,
                                actions: rule.actions,
                                isActive: rule.is_active,
                            }); })) || []];
                }
            });
        });
    };
    DelinquencyManager.prototype.isRuleApplicable = function (rule, payment) {
        var conditions = rule.triggerConditions;
        if (conditions.daysOverdue && payment.daysOverdue < conditions.daysOverdue) {
            return false;
        }
        if (conditions.amountThreshold && payment.amount < conditions.amountThreshold) {
            return false;
        }
        if (conditions.riskLevel && payment.riskLevel !== conditions.riskLevel) {
            return false;
        }
        return true;
    };
    DelinquencyManager.prototype.executeRule = function (rule, payment) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, action, scheduledFor, existing;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _i = 0, _a = rule.actions;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        action = _a[_i];
                        scheduledFor = (0, date_fns_1.addDays)(new Date(), action.delay);
                        return [4 /*yield*/, this.supabase
                                .from('delinquency_notifications')
                                .select('id')
                                .eq('customer_id', payment.customerId)
                                .eq('type', action.type)
                                .eq('template_id', action.template)
                                .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())];
                    case 2:
                        existing = (_b.sent()).data;
                        if (existing && existing.length > 0) {
                            return [3 /*break*/, 6]; // Skip if already scheduled
                        }
                        if (!(action.delay === 0)) return [3 /*break*/, 4];
                        // Execute immediately
                        return [4 /*yield*/, this.sendNotification(payment.customerId, action.type, 'email', // Default to email
                            action.template)];
                    case 3:
                        // Execute immediately
                        _b.sent();
                        return [3 /*break*/, 6];
                    case 4: 
                    // Schedule for later
                    return [4 /*yield*/, this.supabase
                            .from('scheduled_notifications')
                            .insert({
                            customer_id: payment.customerId,
                            type: action.type,
                            channel: 'email',
                            template_id: action.template,
                            scheduled_for: scheduledFor.toISOString(),
                            rule_id: rule.id,
                            payment_id: payment.id,
                        })];
                    case 5:
                        // Schedule for later
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DelinquencyManager.prototype.sendEmailNotification = function (customer, template, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var subject, html, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.emailTransporter)
                            return [2 /*return*/, false];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        subject = this.processTemplate(template.subject, customer, metadata);
                        html = this.processTemplate(template.content, customer, metadata);
                        return [4 /*yield*/, this.emailTransporter.sendMail({
                                from: process.env.SMTP_FROM || 'noreply@neonpro.com',
                                to: customer.email,
                                subject: subject,
                                html: html,
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _a.sent();
                        console.error('Error sending email notification:', error_8);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DelinquencyManager.prototype.sendSMSNotification = function (customer, template, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Placeholder for SMS integration
                // Would integrate with services like Twilio, AWS SNS, etc.
                console.log('SMS notification would be sent to:', customer.phone);
                return [2 /*return*/, true];
            });
        });
    };
    DelinquencyManager.prototype.processTemplate = function (template, customer, metadata) {
        var processed = template
            .replace(/{{customerName}}/g, customer.name)
            .replace(/{{customerEmail}}/g, customer.email)
            .replace(/{{currentDate}}/g, (0, date_fns_1.format)(new Date(), 'dd/MM/yyyy', { locale: locale_1.ptBR }));
        if (metadata) {
            Object.entries(metadata).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                processed = processed.replace(new RegExp("{{".concat(key, "}}"), 'g'), String(value));
            });
        }
        return processed;
    };
    return DelinquencyManager;
}());
exports.DelinquencyManager = DelinquencyManager;
