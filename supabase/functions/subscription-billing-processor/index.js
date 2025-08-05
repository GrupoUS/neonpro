"use strict";
/**
 * Subscription Billing Processor - Supabase Edge Function
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * This Edge Function processes subscription billing cycles, handles renewals,
 * and manages subscription status updates.
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
var server_ts_1 = require("https://deno.land/std@0.208.0/http/server.ts");
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
var corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
(0, server_ts_1.serve)(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var supabaseUrl, supabaseKey, supabase, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: corsHeaders })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                supabaseUrl = Deno.env.get('SUPABASE_URL');
                supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseKey);
                console.log('Starting subscription billing processor...');
                // Process trial expirations
                return [4 /*yield*/, processTrialExpirations(supabase)];
            case 2:
                // Process trial expirations
                _a.sent();
                // Process billing renewals
                return [4 /*yield*/, processBillingRenewals(supabase)];
            case 3:
                // Process billing renewals
                _a.sent();
                // Process subscription cancellations
                return [4 /*yield*/, processSubscriptionCancellations(supabase)];
            case 4:
                // Process subscription cancellations
                _a.sent();
                // Process failed payment retries
                return [4 /*yield*/, processFailedPaymentRetries(supabase)];
            case 5:
                // Process failed payment retries
                _a.sent();
                return [2 /*return*/, new Response(JSON.stringify({
                        success: true,
                        message: 'Subscription billing processing completed',
                        timestamp: new Date().toISOString()
                    }), {
                        headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                    })];
            case 6:
                error_1 = _a.sent();
                console.error('Subscription billing processor error:', error_1);
                return [2 /*return*/, new Response(JSON.stringify({
                        error: 'Billing processing failed',
                        details: error_1.message
                    }), {
                        status: 500,
                        headers: __assign(__assign({}, corsHeaders), { 'Content-Type': 'application/json' })
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); });
function processTrialExpirations(supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var now, _a, expiredTrials, error, _i, _b, subscription, error_2, error_3;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    console.log('Processing trial expirations...');
                    now = new Date().toISOString();
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('status', 'trial')
                            .lt('trial_end', now)];
                case 1:
                    _a = _c.sent(), expiredTrials = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching expired trials:', error);
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat((expiredTrials === null || expiredTrials === void 0 ? void 0 : expiredTrials.length) || 0, " expired trials"));
                    _i = 0, _b = expiredTrials || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    subscription = _b[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    // Update subscription status to unpaid
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: 'unpaid',
                            updated_at: now
                        })
                            .eq('id', subscription.id)];
                case 4:
                    // Update subscription status to unpaid
                    _c.sent();
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'trial_expired',
                            amount: 0,
                            currency: 'BRL',
                            status: 'processed',
                            processed_at: now,
                            metadata: {
                                trial_end: subscription.trial_end,
                                processed_by: 'billing-processor'
                            }
                        })];
                case 5:
                    // Create billing event
                    _c.sent();
                    console.log("Trial expired for subscription ".concat(subscription.id));
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _c.sent();
                    console.error("Error processing trial expiration for ".concat(subscription.id, ":"), error_2);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_3 = _c.sent();
                    console.error('Error in processTrialExpirations:', error_3);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function processBillingRenewals(supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var now, renewalWindow, _a, renewalDue, error, _i, _b, subscription, currentPeriodEnd, nextPeriodStart, nextPeriodEnd, nextBillingDate, plan, amount, error_4, error_5;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    console.log('Processing billing renewals...');
                    now = new Date();
                    renewalWindow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select("\n        *,\n        plan:subscription_plans(*)\n      ")
                            .eq('status', 'active')
                            .lt('next_billing_date', renewalWindow.toISOString())
                            .gt('next_billing_date', now.toISOString())];
                case 1:
                    _a = _c.sent(), renewalDue = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching renewals due:', error);
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat((renewalDue === null || renewalDue === void 0 ? void 0 : renewalDue.length) || 0, " subscriptions due for renewal"));
                    _i = 0, _b = renewalDue || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    subscription = _b[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    currentPeriodEnd = new Date(subscription.current_period_end);
                    nextPeriodStart = currentPeriodEnd;
                    nextPeriodEnd = calculateNextPeriodEnd(nextPeriodStart, subscription.billing_cycle);
                    nextBillingDate = nextPeriodEnd;
                    plan = subscription.plan;
                    amount = 0;
                    switch (subscription.billing_cycle) {
                        case 'monthly':
                            amount = plan.price_monthly;
                            break;
                        case 'quarterly':
                            amount = plan.price_quarterly;
                            break;
                        case 'yearly':
                            amount = plan.price_yearly;
                            break;
                    }
                    // Update subscription for next period
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            current_period_start: nextPeriodStart.toISOString(),
                            current_period_end: nextPeriodEnd.toISOString(),
                            next_billing_date: nextBillingDate.toISOString(),
                            updated_at: now.toISOString()
                        })
                            .eq('id', subscription.id)];
                case 4:
                    // Update subscription for next period
                    _c.sent();
                    // Create billing event for renewal
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'subscription_renewed',
                            amount: amount,
                            currency: 'BRL',
                            status: 'pending',
                            metadata: {
                                billing_cycle: subscription.billing_cycle,
                                period_start: nextPeriodStart.toISOString(),
                                period_end: nextPeriodEnd.toISOString(),
                                processed_by: 'billing-processor'
                            }
                        })];
                case 5:
                    // Create billing event for renewal
                    _c.sent();
                    console.log("Processed renewal for subscription ".concat(subscription.id));
                    return [3 /*break*/, 7];
                case 6:
                    error_4 = _c.sent();
                    console.error("Error processing renewal for ".concat(subscription.id, ":"), error_4);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_5 = _c.sent();
                    console.error('Error in processBillingRenewals:', error_5);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function processSubscriptionCancellations(supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var now, _a, toCancelSubs, error, _i, _b, subscription, error_6, error_7;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    console.log('Processing subscription cancellations...');
                    now = new Date().toISOString();
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('cancel_at_period_end', true)
                            .in('status', ['active', 'trial'])
                            .lt('current_period_end', now)];
                case 1:
                    _a = _c.sent(), toCancelSubs = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching subscriptions to cancel:', error);
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat((toCancelSubs === null || toCancelSubs === void 0 ? void 0 : toCancelSubs.length) || 0, " subscriptions to cancel"));
                    _i = 0, _b = toCancelSubs || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    subscription = _b[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 6, , 7]);
                    // Cancel subscription
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: 'canceled',
                            canceled_at: now,
                            updated_at: now
                        })
                            .eq('id', subscription.id)];
                case 4:
                    // Cancel subscription
                    _c.sent();
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'subscription_canceled',
                            amount: 0,
                            currency: 'BRL',
                            status: 'processed',
                            processed_at: now,
                            metadata: {
                                cancellation_reason: subscription.cancellation_reason,
                                period_end: subscription.current_period_end,
                                processed_by: 'billing-processor'
                            }
                        })];
                case 5:
                    // Create billing event
                    _c.sent();
                    console.log("Canceled subscription ".concat(subscription.id));
                    return [3 /*break*/, 7];
                case 6:
                    error_6 = _c.sent();
                    console.error("Error canceling subscription ".concat(subscription.id, ":"), error_6);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_7 = _c.sent();
                    console.error('Error in processSubscriptionCancellations:', error_7);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function processFailedPaymentRetries(supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var now, retryWindow, _a, failedPayments, error, _i, _b, payment, error_8, error_9;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 9, , 10]);
                    console.log('Processing failed payment retries...');
                    now = new Date();
                    retryWindow = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .select('*')
                            .eq('status', 'failed')
                            .eq('event_type', 'invoice_payment_failed')
                            .lt('processing_attempts', 3)
                            .gt('created_at', retryWindow.toISOString())];
                case 1:
                    _a = _c.sent(), failedPayments = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching failed payments:', error);
                        return [2 /*return*/];
                    }
                    console.log("Found ".concat((failedPayments === null || failedPayments === void 0 ? void 0 : failedPayments.length) || 0, " failed payments to retry"));
                    _i = 0, _b = failedPayments || [];
                    _c.label = 2;
                case 2:
                    if (!(_i < _b.length)) return [3 /*break*/, 8];
                    payment = _b[_i];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 5, , 7]);
                    // Update attempt count
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .update({
                            processing_attempts: payment.processing_attempts + 1,
                            last_processing_error: null,
                            updated_at: now.toISOString()
                        })
                            .eq('id', payment.id)];
                case 4:
                    // Update attempt count
                    _c.sent();
                    console.log("Retry attempt ".concat(payment.processing_attempts + 1, " for payment ").concat(payment.id));
                    return [3 /*break*/, 7];
                case 5:
                    error_8 = _c.sent();
                    console.error("Error retrying payment ".concat(payment.id, ":"), error_8);
                    // Update error information
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .update({
                            last_processing_error: error_8.message,
                            updated_at: now.toISOString()
                        })
                            .eq('id', payment.id)];
                case 6:
                    // Update error information
                    _c.sent();
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 2];
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_9 = _c.sent();
                    console.error('Error in processFailedPaymentRetries:', error_9);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function calculateNextPeriodEnd(periodStart, billingCycle) {
    var nextPeriodEnd = new Date(periodStart);
    switch (billingCycle) {
        case 'monthly':
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
            break;
        case 'quarterly':
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 3);
            break;
        case 'yearly':
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
            break;
    }
    return nextPeriodEnd;
}
