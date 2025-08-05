"use strict";
/**
 * NeonPro - Subscription Billing Service
 * Story 6.1 - Task 2: Recurring Payment System
 *
 * Comprehensive subscription billing engine with flexible cycles,
 * failed payment retry logic, and prorated billing calculations.
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
exports.SubscriptionBillingService = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
var date_fns_1 = require("date-fns");
// Main Subscription Billing Service
var SubscriptionBillingService = /** @class */ (function () {
    function SubscriptionBillingService() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        this.retryConfig = {
            max_attempts: 3,
            retry_intervals: [3, 7, 14], // 3 days, 1 week, 2 weeks
            escalation_enabled: true,
            notification_schedule: [1, 3, 7, 14] // notification days
        };
    }
    /**
     * Create a new subscription plan
     */
    SubscriptionBillingService.prototype.createSubscriptionPlan = function (planData) {
        return __awaiter(this, void 0, void 0, function () {
            var stripeProduct, stripePrice, _a, data, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.stripe.products.create({
                                name: planData.name,
                                description: planData.description,
                                metadata: {
                                    features: JSON.stringify(planData.features)
                                }
                            })];
                    case 1:
                        stripeProduct = _b.sent();
                        return [4 /*yield*/, this.stripe.prices.create({
                                product: stripeProduct.id,
                                unit_amount: planData.price * 100, // Convert to cents
                                currency: planData.currency.toLowerCase(),
                                recurring: {
                                    interval: this.getBillingInterval(planData.billing_cycle),
                                    interval_count: this.getBillingIntervalCount(planData.billing_cycle)
                                }
                            })];
                    case 2:
                        stripePrice = _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .insert(__assign(__assign({}, planData), { stripe_product_id: stripeProduct.id, stripe_price_id: stripePrice.id }))
                                .select()
                                .single()];
                    case 3:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 4:
                        error_1 = _b.sent();
                        console.error('Error creating subscription plan:', error_1);
                        throw new Error('Failed to create subscription plan');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new subscription for a customer
     */
    SubscriptionBillingService.prototype.createSubscription = function (customerId_1, planId_1) {
        return __awaiter(this, arguments, void 0, function (customerId, planId, options) {
            var _a, plan, planError, _b, customer, customerError, trialEnd, stripeSubscription, subscriptionData, _c, data, error, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', planId)
                                .single()];
                    case 1:
                        _a = _d.sent(), plan = _a.data, planError = _a.error;
                        if (planError || !plan)
                            throw new Error('Plan not found');
                        return [4 /*yield*/, this.supabase
                                .from('customers')
                                .select('stripe_customer_id')
                                .eq('id', customerId)
                                .single()];
                    case 2:
                        _b = _d.sent(), customer = _b.data, customerError = _b.error;
                        if (customerError || !customer)
                            throw new Error('Customer not found');
                        trialEnd = options.trial_days
                            ? (0, date_fns_1.addDays)(new Date(), options.trial_days)
                            : plan.trial_days
                                ? (0, date_fns_1.addDays)(new Date(), plan.trial_days)
                                : undefined;
                        return [4 /*yield*/, this.stripe.subscriptions.create({
                                customer: customer.stripe_customer_id,
                                items: [{ price: plan.stripe_price_id }],
                                trial_end: trialEnd ? Math.floor(trialEnd.getTime() / 1000) : undefined,
                                metadata: options.metadata || {},
                                payment_behavior: 'default_incomplete',
                                payment_settings: {
                                    save_default_payment_method: 'on_subscription',
                                    payment_method_options: {
                                        card: {
                                            request_three_d_secure: 'automatic'
                                        }
                                    }
                                }
                            })];
                    case 3:
                        stripeSubscription = _d.sent();
                        subscriptionData = {
                            customer_id: customerId,
                            plan_id: planId,
                            status: stripeSubscription.status,
                            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                            trial_end: trialEnd === null || trialEnd === void 0 ? void 0 : trialEnd.toISOString(),
                            cancel_at_period_end: false,
                            stripe_subscription_id: stripeSubscription.id,
                            metadata: options.metadata
                        };
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .insert(subscriptionData)
                                .select()
                                .single()];
                    case 4:
                        _c = _d.sent(), data = _c.data, error = _c.error;
                        if (error)
                            throw error;
                        return [2 /*return*/, data];
                    case 5:
                        error_2 = _d.sent();
                        console.error('Error creating subscription:', error_2);
                        throw new Error('Failed to create subscription');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process subscription billing cycle
     */
    SubscriptionBillingService.prototype.processBillingCycle = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, subscription, error, now, periodEnd, stripeSubscription, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select("\n          *,\n          subscription_plans(*),\n          customers(*)\n        ")
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        _a = _b.sent(), subscription = _a.data, error = _a.error;
                        if (error || !subscription)
                            throw new Error('Subscription not found');
                        now = new Date();
                        periodEnd = new Date(subscription.current_period_end);
                        if (now < periodEnd) {
                            console.log('Billing not due yet for subscription:', subscriptionId);
                            return [2 /*return*/];
                        }
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.stripe.subscriptions.retrieve(subscription.stripe_subscription_id)];
                    case 2:
                        stripeSubscription = _b.sent();
                        // Update local subscription with Stripe data
                        return [4 /*yield*/, this.syncSubscriptionWithStripe(subscriptionId, stripeSubscription)];
                    case 3:
                        // Update local subscription with Stripe data
                        _b.sent();
                        _b.label = 4;
                    case 4: 
                    // Log billing event
                    return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'billing_cycle_processed', {
                            period_start: subscription.current_period_start,
                            period_end: subscription.current_period_end,
                            amount: subscription.subscription_plans.price
                        })];
                    case 5:
                        // Log billing event
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_3 = _b.sent();
                        console.error('Error processing billing cycle:', error_3);
                        return [4 /*yield*/, this.handleBillingError(subscriptionId, error_3)];
                    case 7:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle failed payment with retry logic
     */
    SubscriptionBillingService.prototype.handleFailedPayment = function (subscriptionId, paymentIntentId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, retryLog, error, currentAttempt, retryDate, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('payment_retry_log')
                                .select('*')
                                .eq('subscription_id', subscriptionId)
                                .eq('payment_intent_id', paymentIntentId)
                                .order('created_at', { ascending: false })
                                .limit(1)
                                .maybeSingle()];
                    case 1:
                        _a = _b.sent(), retryLog = _a.data, error = _a.error;
                        currentAttempt = retryLog ? retryLog.attempt_count + 1 : 1;
                        if (!(currentAttempt > this.retryConfig.max_attempts)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleMaxRetriesReached(subscriptionId)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/];
                    case 3:
                        retryDate = (0, date_fns_1.addDays)(new Date(), this.retryConfig.retry_intervals[currentAttempt - 1]);
                        return [4 /*yield*/, this.supabase
                                .from('payment_retry_log')
                                .insert({
                                subscription_id: subscriptionId,
                                payment_intent_id: paymentIntentId,
                                attempt_count: currentAttempt,
                                retry_date: retryDate.toISOString(),
                                status: 'scheduled'
                            })];
                    case 4:
                        _b.sent();
                        // Send notification to customer
                        return [4 /*yield*/, this.sendPaymentFailureNotification(subscriptionId, currentAttempt)];
                    case 5:
                        // Send notification to customer
                        _b.sent();
                        // Update subscription status
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .update({ status: 'past_due' })
                                .eq('id', subscriptionId)];
                    case 6:
                        // Update subscription status
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_4 = _b.sent();
                        console.error('Error handling failed payment:', error_4);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calculate prorated billing for plan changes
     */
    SubscriptionBillingService.prototype.calculateProratedBilling = function (subscriptionId_1, newPlanId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, newPlanId, effectiveDate) {
            var _a, subscription, error, _b, newPlan, planError, periodStart, periodEnd, daysTotal, daysUsed, daysRemaining, currentPlanDailyRate, newPlanDailyRate, refundAmount, newPlanAmount, proratedAmount, error_5;
            if (effectiveDate === void 0) { effectiveDate = new Date(); }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select("\n          *,\n          subscription_plans(*)\n        ")
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        _a = _c.sent(), subscription = _a.data, error = _a.error;
                        if (error || !subscription)
                            throw new Error('Subscription not found');
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', newPlanId)
                                .single()];
                    case 2:
                        _b = _c.sent(), newPlan = _b.data, planError = _b.error;
                        if (planError || !newPlan)
                            throw new Error('New plan not found');
                        periodStart = new Date(subscription.current_period_start);
                        periodEnd = new Date(subscription.current_period_end);
                        daysTotal = (0, date_fns_1.differenceInDays)(periodEnd, periodStart);
                        daysUsed = (0, date_fns_1.differenceInDays)(effectiveDate, periodStart);
                        daysRemaining = daysTotal - daysUsed;
                        currentPlanDailyRate = subscription.subscription_plans.price / daysTotal;
                        newPlanDailyRate = newPlan.price / daysTotal;
                        refundAmount = currentPlanDailyRate * daysRemaining;
                        newPlanAmount = newPlanDailyRate * daysRemaining;
                        proratedAmount = newPlanAmount - refundAmount;
                        return [2 /*return*/, {
                                original_amount: subscription.subscription_plans.price,
                                prorated_amount: proratedAmount,
                                days_used: daysUsed,
                                days_total: daysTotal,
                                proration_factor: daysRemaining / daysTotal,
                                effective_date: effectiveDate.toISOString()
                            }];
                    case 3:
                        error_5 = _c.sent();
                        console.error('Error calculating prorated billing:', error_5);
                        throw new Error('Failed to calculate prorated billing');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Change subscription plan with proration
     */
    SubscriptionBillingService.prototype.changeSubscriptionPlan = function (subscriptionId_1, newPlanId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, newPlanId, options) {
            var effectiveDate, proratedBilling, _a, subscription, error, _b, newPlan, planError, _c, _d, _e, _f, updatedSubscription, updateError, error_6;
            var _g, _h;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 10, , 11]);
                        effectiveDate = options.effective_date || new Date();
                        proratedBilling = null;
                        if (!(options.prorate !== false)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.calculateProratedBilling(subscriptionId, newPlanId, effectiveDate)];
                    case 1:
                        proratedBilling = _j.sent();
                        _j.label = 2;
                    case 2: return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .select('*')
                            .eq('id', subscriptionId)
                            .single()];
                    case 3:
                        _a = _j.sent(), subscription = _a.data, error = _a.error;
                        if (error || !subscription)
                            throw new Error('Subscription not found');
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', newPlanId)
                                .single()];
                    case 4:
                        _b = _j.sent(), newPlan = _b.data, planError = _b.error;
                        if (planError || !newPlan)
                            throw new Error('New plan not found');
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 7];
                        _d = (_c = this.stripe.subscriptions).update;
                        _e = [subscription.stripe_subscription_id];
                        _g = {};
                        _h = {};
                        return [4 /*yield*/, this.stripe.subscriptions.retrieve(subscription.stripe_subscription_id)];
                    case 5: return [4 /*yield*/, _d.apply(_c, _e.concat([(_g.items = [(_h.id = (_j.sent()).items.data[0].id,
                                    _h.price = newPlan.stripe_price_id,
                                    _h)],
                                _g.proration_behavior = options.prorate !== false ? 'create_prorations' : 'none',
                                _g)]))];
                    case 6:
                        _j.sent();
                        _j.label = 7;
                    case 7: return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .update({
                            plan_id: newPlanId,
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', subscriptionId)
                            .select()
                            .single()];
                    case 8:
                        _f = _j.sent(), updatedSubscription = _f.data, updateError = _f.error;
                        if (updateError)
                            throw updateError;
                        // Log plan change
                        return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'plan_changed', {
                                old_plan_id: subscription.plan_id,
                                new_plan_id: newPlanId,
                                prorated_billing: proratedBilling,
                                effective_date: effectiveDate.toISOString()
                            })];
                    case 9:
                        // Log plan change
                        _j.sent();
                        return [2 /*return*/, updatedSubscription];
                    case 10:
                        error_6 = _j.sent();
                        console.error('Error changing subscription plan:', error_6);
                        throw new Error('Failed to change subscription plan');
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel subscription
     */
    SubscriptionBillingService.prototype.cancelSubscription = function (subscriptionId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, options) {
            var _a, subscription, error, updateData, _b, updatedSubscription, updateError, error_7;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select('*')
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        _a = _c.sent(), subscription = _a.data, error = _a.error;
                        if (error || !subscription)
                            throw new Error('Subscription not found');
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 5];
                        if (!options.immediate) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.stripe.subscriptions.cancel(subscription.stripe_subscription_id)];
                    case 2:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true })];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        updateData = {
                            cancel_at_period_end: !options.immediate,
                            updated_at: new Date().toISOString()
                        };
                        if (options.immediate) {
                            updateData.status = 'canceled';
                            updateData.canceled_at = new Date().toISOString();
                        }
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .update(updateData)
                                .eq('id', subscriptionId)
                                .select()
                                .single()];
                    case 6:
                        _b = _c.sent(), updatedSubscription = _b.data, updateError = _b.error;
                        if (updateError)
                            throw updateError;
                        // Log cancellation
                        return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'subscription_canceled', {
                                immediate: options.immediate,
                                reason: options.reason,
                                canceled_at: options.immediate ? new Date().toISOString() : subscription.current_period_end
                            })];
                    case 7:
                        // Log cancellation
                        _c.sent();
                        return [2 /*return*/, updatedSubscription];
                    case 8:
                        error_7 = _c.sent();
                        console.error('Error canceling subscription:', error_7);
                        throw new Error('Failed to cancel subscription');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    // Helper Methods
    SubscriptionBillingService.prototype.getBillingInterval = function (cycle) {
        switch (cycle) {
            case 'monthly':
            case 'quarterly':
                return 'month';
            case 'annual':
                return 'year';
            default:
                return 'month';
        }
    };
    SubscriptionBillingService.prototype.getBillingIntervalCount = function (cycle) {
        switch (cycle) {
            case 'monthly':
                return 1;
            case 'quarterly':
                return 3;
            case 'annual':
                return 1;
            default:
                return 1;
        }
    };
    SubscriptionBillingService.prototype.syncSubscriptionWithStripe = function (subscriptionId, stripeSubscription) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .update({
                            status: stripeSubscription.status,
                            current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', subscriptionId)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionBillingService.prototype.handleMaxRetriesReached = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Update subscription status to unpaid
                    return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .update({ status: 'unpaid' })
                            .eq('id', subscriptionId)];
                    case 1:
                        // Update subscription status to unpaid
                        _a.sent();
                        // Send final notice
                        return [4 /*yield*/, this.sendFinalPaymentNotice(subscriptionId)];
                    case 2:
                        // Send final notice
                        _a.sent();
                        // Log event
                        return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'max_retries_reached', {
                                max_attempts: this.retryConfig.max_attempts
                            })];
                    case 3:
                        // Log event
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionBillingService.prototype.handleBillingError = function (subscriptionId, error) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'billing_error', {
                            error_message: error.message,
                            error_stack: error.stack
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionBillingService.prototype.logBillingEvent = function (subscriptionId, eventType, data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscriptionId,
                            event_type: eventType,
                            event_data: data,
                            created_at: new Date().toISOString()
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionBillingService.prototype.sendPaymentFailureNotification = function (subscriptionId, attemptCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for sending payment failure notifications
                // This would integrate with your notification system
                console.log("Sending payment failure notification for subscription ".concat(subscriptionId, ", attempt ").concat(attemptCount));
                return [2 /*return*/];
            });
        });
    };
    SubscriptionBillingService.prototype.sendFinalPaymentNotice = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Implementation for sending final payment notice
                console.log("Sending final payment notice for subscription ".concat(subscriptionId));
                return [2 /*return*/];
            });
        });
    };
    return SubscriptionBillingService;
}());
exports.SubscriptionBillingService = SubscriptionBillingService;
exports.default = SubscriptionBillingService;
