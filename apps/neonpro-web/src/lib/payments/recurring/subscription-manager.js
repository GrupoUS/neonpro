"use strict";
// NeonPro - Subscription Manager Service
// Story 6.1 - Task 2: Recurring Payment System
// Comprehensive subscription lifecycle management
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
exports.subscriptionManager = exports.SubscriptionManager = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
var date_fns_1 = require("date-fns");
var logger_1 = require("@/lib/utils/logger");
var notification_service_1 = require("@/lib/notifications/notification-service");
var payment_processor_1 = require("../payment-processor");
// Main Subscription Manager Class
var SubscriptionManager = /** @class */ (function () {
    function SubscriptionManager() {
        this.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2023-10-16',
        });
        this.paymentProcessor = new payment_processor_1.PaymentProcessor();
        this.retryConfig = {
            max_attempts: 4,
            retry_intervals: [24, 72, 168], // 1 day, 3 days, 7 days
            notification_triggers: [1, 2, 4] // Send notifications on attempts 1, 2, and 4
        };
    }
    // Subscription Plans Management
    SubscriptionManager.prototype.getSubscriptionPlans = function () {
        return __awaiter(this, arguments, void 0, function (activeOnly) {
            var query, _a, data, error, error_1;
            if (activeOnly === void 0) { activeOnly = true; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('subscription_plans')
                            .select('*')
                            .order('price', { ascending: true });
                        if (activeOnly) {
                            query = query.eq('is_active', true);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching subscription plans:', error);
                            throw new Error("Failed to fetch subscription plans: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_1 = _b.sent();
                        logger_1.logger.error('Error in getSubscriptionPlans:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.getSubscriptionPlan = function (planId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', planId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            logger_1.logger.error('Error fetching subscription plan:', error);
                            throw new Error("Failed to fetch subscription plan: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_2 = _b.sent();
                        logger_1.logger.error('Error in getSubscriptionPlan:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Subscription Lifecycle Management
    SubscriptionManager.prototype.createSubscription = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, now, trialDays, trialStart, trialEnd, periodStart, periodEnd, stripeSubscriptionId, stripeSubscription, subscriptionData, _a, data, error, error_3;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getSubscriptionPlan(params.plan_id)];
                    case 1:
                        plan = _c.sent();
                        if (!plan) {
                            throw new Error('Subscription plan not found');
                        }
                        now = new Date();
                        trialDays = (_b = params.trial_days) !== null && _b !== void 0 ? _b : plan.trial_days;
                        trialStart = trialDays > 0 ? now : undefined;
                        trialEnd = trialDays > 0 ? (0, date_fns_1.addDays)(now, trialDays) : undefined;
                        periodStart = trialEnd || now;
                        periodEnd = this.calculateNextBillingDate(periodStart, plan.billing_cycle);
                        stripeSubscriptionId = void 0;
                        if (!(params.payment_method_id && plan.stripe_price_id)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.createStripeSubscription({
                                customer_id: params.customer_id,
                                price_id: plan.stripe_price_id,
                                payment_method_id: params.payment_method_id,
                                trial_end: trialEnd,
                                metadata: params.metadata
                            })];
                    case 2:
                        stripeSubscription = _c.sent();
                        stripeSubscriptionId = stripeSubscription.id;
                        _c.label = 3;
                    case 3:
                        subscriptionData = {
                            customer_id: params.customer_id,
                            plan_id: params.plan_id,
                            status: trialDays > 0 ? 'trialing' : 'active',
                            current_period_start: periodStart.toISOString(),
                            current_period_end: periodEnd.toISOString(),
                            trial_start: trialStart === null || trialStart === void 0 ? void 0 : trialStart.toISOString(),
                            trial_end: trialEnd === null || trialEnd === void 0 ? void 0 : trialEnd.toISOString(),
                            cancel_at_period_end: false,
                            stripe_subscription_id: stripeSubscriptionId,
                            metadata: params.metadata || {}
                        };
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .insert(subscriptionData)
                                .select()
                                .single()];
                    case 4:
                        _a = _c.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error creating subscription:', error);
                            throw new Error("Failed to create subscription: ".concat(error.message));
                        }
                        // Initialize usage tracking
                        return [4 /*yield*/, this.initializeUsageTracking(data.id, plan)];
                    case 5:
                        // Initialize usage tracking
                        _c.sent();
                        // Log billing event
                        return [4 /*yield*/, this.logBillingEvent(data.id, 'subscription_created', {
                                plan_id: params.plan_id,
                                trial_days: trialDays,
                                stripe_subscription_id: stripeSubscriptionId
                            })];
                    case 6:
                        // Log billing event
                        _c.sent();
                        // Send welcome notification
                        return [4 /*yield*/, this.sendSubscriptionNotification(data.id, 'subscription_created')];
                    case 7:
                        // Send welcome notification
                        _c.sent();
                        logger_1.logger.info("Subscription created successfully: ".concat(data.id));
                        return [2 /*return*/, data];
                    case 8:
                        error_3 = _c.sent();
                        logger_1.logger.error('Error in createSubscription:', error_3);
                        throw error_3;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.updateSubscription = function (subscriptionId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, updateData, newPlan, proration, _a, data, error, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 17, , 18]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _b.sent();
                        if (!subscription) {
                            throw new Error('Subscription not found');
                        }
                        updateData = {
                            updated_at: new Date().toISOString()
                        };
                        if (!(params.plan_id && params.plan_id !== subscription.plan_id)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.getSubscriptionPlan(params.plan_id)];
                    case 2:
                        newPlan = _b.sent();
                        if (!newPlan) {
                            throw new Error('New subscription plan not found');
                        }
                        if (!(params.proration_behavior === 'create_prorations')) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.calculateProration(subscriptionId, subscription.plan_id, params.plan_id)];
                    case 3:
                        proration = _b.sent();
                        if (!proration) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.saveProrationCalculation(proration)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        updateData.plan_id = params.plan_id;
                        if (!(subscription.stripe_subscription_id && newPlan.stripe_price_id)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.updateStripeSubscription(subscription.stripe_subscription_id, {
                                price_id: newPlan.stripe_price_id,
                                proration_behavior: params.proration_behavior
                            })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!(params.cancel_at_period_end !== undefined)) return [3 /*break*/, 15];
                        updateData.cancel_at_period_end = params.cancel_at_period_end;
                        if (!params.cancel_at_period_end) return [3 /*break*/, 11];
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'cancellation_scheduled', {
                            cancel_at: subscription.current_period_end
                        })];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 11:
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 13];
                        return [4 /*yield*/, this.stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: false })];
                    case 12:
                        _b.sent();
                        _b.label = 13;
                    case 13: return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'cancellation_removed', {})];
                    case 14:
                        _b.sent();
                        _b.label = 15;
                    case 15:
                        // Update metadata
                        if (params.metadata) {
                            updateData.metadata = __assign(__assign({}, subscription.metadata), params.metadata);
                        }
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .update(updateData)
                                .eq('id', subscriptionId)
                                .select()
                                .single()];
                    case 16:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error updating subscription:', error);
                            throw new Error("Failed to update subscription: ".concat(error.message));
                        }
                        logger_1.logger.info("Subscription updated successfully: ".concat(subscriptionId));
                        return [2 /*return*/, data];
                    case 17:
                        error_4 = _b.sent();
                        logger_1.logger.error('Error in updateSubscription:', error_4);
                        throw error_4;
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.cancelSubscription = function (subscriptionId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, immediate) {
            var subscription, updateData, _a, data, error, error_5;
            if (immediate === void 0) { immediate = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 12, , 13]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _b.sent();
                        if (!subscription) {
                            throw new Error('Subscription not found');
                        }
                        updateData = {
                            updated_at: new Date().toISOString()
                        };
                        if (!immediate) return [3 /*break*/, 5];
                        updateData.status = 'canceled';
                        updateData.canceled_at = new Date().toISOString();
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.stripe.subscriptions.cancel(subscription.stripe_subscription_id)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'subscription_canceled_immediate', {})];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 9];
                    case 5:
                        updateData.cancel_at_period_end = true;
                        if (!subscription.stripe_subscription_id) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.stripe.subscriptions.update(subscription.stripe_subscription_id, { cancel_at_period_end: true })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, this.logBillingEvent(subscriptionId, 'subscription_canceled_scheduled', {
                            cancel_at: subscription.current_period_end
                        })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9: return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .update(updateData)
                            .eq('id', subscriptionId)
                            .select()
                            .single()];
                    case 10:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error canceling subscription:', error);
                            throw new Error("Failed to cancel subscription: ".concat(error.message));
                        }
                        // Send cancellation notification
                        return [4 /*yield*/, this.sendSubscriptionNotification(subscriptionId, immediate ? 'subscription_canceled' : 'subscription_cancel_scheduled')];
                    case 11:
                        // Send cancellation notification
                        _b.sent();
                        logger_1.logger.info("Subscription canceled successfully: ".concat(subscriptionId));
                        return [2 /*return*/, data];
                    case 12:
                        error_5 = _b.sent();
                        logger_1.logger.error('Error in cancelSubscription:', error_5);
                        throw error_5;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.getSubscription = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select("\n          *,\n          plan:subscription_plans(*),\n          customer:customers(*)\n        ")
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            logger_1.logger.error('Error fetching subscription:', error);
                            throw new Error("Failed to fetch subscription: ".concat(error.message));
                        }
                        return [2 /*return*/, data];
                    case 2:
                        error_6 = _b.sent();
                        logger_1.logger.error('Error in getSubscription:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.getCustomerSubscriptions = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select("\n          *,\n          plan:subscription_plans(*)\n        ")
                                .eq('customer_id', customerId)
                                .order('created_at', { ascending: false })];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching customer subscriptions:', error);
                            throw new Error("Failed to fetch customer subscriptions: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_7 = _b.sent();
                        logger_1.logger.error('Error in getCustomerSubscriptions:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Usage Tracking
    SubscriptionManager.prototype.trackUsage = function (subscriptionId_1, usageType_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, usageType, count) {
            var subscription, _a, currentUsage, fetchError, updateError, insertError, error_8;
            if (count === void 0) { count = 1; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _b.sent();
                        if (!subscription) {
                            throw new Error('Subscription not found');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('subscription_usage')
                                .select('*')
                                .eq('subscription_id', subscriptionId)
                                .eq('usage_type', usageType)
                                .eq('period_start', subscription.current_period_start)
                                .eq('period_end', subscription.current_period_end)
                                .single()];
                    case 2:
                        _a = _b.sent(), currentUsage = _a.data, fetchError = _a.error;
                        if (fetchError && fetchError.code !== 'PGRST116') {
                            logger_1.logger.error('Error fetching usage:', fetchError);
                            throw new Error("Failed to fetch usage: ".concat(fetchError.message));
                        }
                        if (!currentUsage) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.supabase
                                .from('subscription_usage')
                                .update({
                                usage_count: currentUsage.usage_count + count,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', currentUsage.id)];
                    case 3:
                        updateError = (_b.sent()).error;
                        if (updateError) {
                            logger_1.logger.error('Error updating usage:', updateError);
                            throw new Error("Failed to update usage: ".concat(updateError.message));
                        }
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, this.supabase
                            .from('subscription_usage')
                            .insert({
                            subscription_id: subscriptionId,
                            usage_type: usageType,
                            usage_count: count,
                            period_start: subscription.current_period_start,
                            period_end: subscription.current_period_end
                        })];
                    case 5:
                        insertError = (_b.sent()).error;
                        if (insertError) {
                            logger_1.logger.error('Error creating usage:', insertError);
                            throw new Error("Failed to create usage: ".concat(insertError.message));
                        }
                        _b.label = 6;
                    case 6:
                        logger_1.logger.info("Usage tracked: ".concat(usageType, " +").concat(count, " for subscription ").concat(subscriptionId));
                        return [3 /*break*/, 8];
                    case 7:
                        error_8 = _b.sent();
                        logger_1.logger.error('Error in trackUsage:', error_8);
                        throw error_8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.getUsage = function (subscriptionId, usageType) {
        return __awaiter(this, void 0, void 0, function () {
            var query, _a, data, error, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        query = this.supabase
                            .from('subscription_usage')
                            .select('*')
                            .eq('subscription_id', subscriptionId)
                            .order('created_at', { ascending: false });
                        if (usageType) {
                            query = query.eq('usage_type', usageType);
                        }
                        return [4 /*yield*/, query];
                    case 1:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error) {
                            logger_1.logger.error('Error fetching usage:', error);
                            throw new Error("Failed to fetch usage: ".concat(error.message));
                        }
                        return [2 /*return*/, data || []];
                    case 2:
                        error_9 = _b.sent();
                        logger_1.logger.error('Error in getUsage:', error_9);
                        throw error_9;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Helper Methods
    SubscriptionManager.prototype.calculateNextBillingDate = function (startDate, billingCycle) {
        switch (billingCycle) {
            case 'monthly':
                return (0, date_fns_1.addMonths)(startDate, 1);
            case 'quarterly':
                return (0, date_fns_1.addMonths)(startDate, 3);
            case 'annual':
                return (0, date_fns_1.addYears)(startDate, 1);
            default:
                throw new Error("Invalid billing cycle: ".concat(billingCycle));
        }
    };
    SubscriptionManager.prototype.createStripeSubscription = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var customer, subscriptionParams, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('customers')
                                .select('stripe_customer_id')
                                .eq('id', params.customer_id)
                                .single()];
                    case 1:
                        customer = (_a.sent()).data;
                        if (!(customer === null || customer === void 0 ? void 0 : customer.stripe_customer_id)) {
                            throw new Error('Customer does not have a Stripe customer ID');
                        }
                        subscriptionParams = {
                            customer: customer.stripe_customer_id,
                            items: [{ price: params.price_id }],
                            default_payment_method: params.payment_method_id,
                            expand: ['latest_invoice.payment_intent'],
                            metadata: params.metadata || {}
                        };
                        if (params.trial_end) {
                            subscriptionParams.trial_end = Math.floor(params.trial_end.getTime() / 1000);
                        }
                        return [4 /*yield*/, this.stripe.subscriptions.create(subscriptionParams)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_10 = _a.sent();
                        logger_1.logger.error('Error creating Stripe subscription:', error_10);
                        throw error_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.updateStripeSubscription = function (subscriptionId, params) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, updateParams, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.stripe.subscriptions.retrieve(subscriptionId)];
                    case 1:
                        subscription = _a.sent();
                        updateParams = {
                            proration_behavior: params.proration_behavior || 'create_prorations'
                        };
                        if (params.price_id) {
                            updateParams.items = [{
                                    id: subscription.items.data[0].id,
                                    price: params.price_id
                                }];
                        }
                        return [4 /*yield*/, this.stripe.subscriptions.update(subscriptionId, updateParams)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        error_11 = _a.sent();
                        logger_1.logger.error('Error updating Stripe subscription:', error_11);
                        throw error_11;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.calculateProration = function (subscriptionId, oldPlanId, newPlanId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, oldPlan, newPlan, now, periodStart, periodEnd, totalDays, usedDays, remainingDays, prorationFactor, originalAmount, prorationCredit, newPlanProration, prorationAmount, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _a.sent();
                        return [4 /*yield*/, this.getSubscriptionPlan(oldPlanId)];
                    case 2:
                        oldPlan = _a.sent();
                        return [4 /*yield*/, this.getSubscriptionPlan(newPlanId)];
                    case 3:
                        newPlan = _a.sent();
                        if (!subscription || !oldPlan || !newPlan) {
                            return [2 /*return*/, null];
                        }
                        now = new Date();
                        periodStart = new Date(subscription.current_period_start);
                        periodEnd = new Date(subscription.current_period_end);
                        totalDays = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
                        usedDays = Math.ceil((now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));
                        remainingDays = totalDays - usedDays;
                        prorationFactor = remainingDays / totalDays;
                        originalAmount = oldPlan.price;
                        prorationCredit = originalAmount * prorationFactor;
                        newPlanProration = newPlan.price * prorationFactor;
                        prorationAmount = newPlanProration - prorationCredit;
                        return [2 /*return*/, {
                                id: '', // Will be generated by database
                                subscription_id: subscriptionId,
                                old_plan_id: oldPlanId,
                                new_plan_id: newPlanId,
                                original_amount: originalAmount,
                                prorated_amount: prorationAmount,
                                days_used: usedDays,
                                days_total: totalDays,
                                proration_factor: prorationFactor,
                                effective_date: now
                            }];
                    case 4:
                        error_12 = _a.sent();
                        logger_1.logger.error('Error calculating proration:', error_12);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.saveProrationCalculation = function (proration) {
        return __awaiter(this, void 0, void 0, function () {
            var error, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('proration_calculations')
                                .insert({
                                subscription_id: proration.subscription_id,
                                old_plan_id: proration.old_plan_id,
                                new_plan_id: proration.new_plan_id,
                                original_amount: proration.original_amount,
                                prorated_amount: proration.prorated_amount,
                                days_used: proration.days_used,
                                days_total: proration.days_total,
                                proration_factor: proration.proration_factor,
                                effective_date: proration.effective_date.toISOString()
                            })];
                    case 1:
                        error = (_a.sent()).error;
                        if (error) {
                            logger_1.logger.error('Error saving proration calculation:', error);
                            throw new Error("Failed to save proration calculation: ".concat(error.message));
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        logger_1.logger.error('Error in saveProrationCalculation:', error_13);
                        throw error_13;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.initializeUsageTracking = function (subscriptionId, plan) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, usageTypes, _i, usageTypes_1, usage, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _a.sent();
                        if (!subscription)
                            return [2 /*return*/];
                        usageTypes = [
                            { type: 'appointments', limit: this.extractUsageLimit(plan.features, 'appointments') },
                            { type: 'patients', limit: this.extractUsageLimit(plan.features, 'patients') },
                            { type: 'storage_gb', limit: this.extractUsageLimit(plan.features, 'storage') },
                            { type: 'api_calls', limit: this.extractUsageLimit(plan.features, 'api') }
                        ];
                        _i = 0, usageTypes_1 = usageTypes;
                        _a.label = 2;
                    case 2:
                        if (!(_i < usageTypes_1.length)) return [3 /*break*/, 5];
                        usage = usageTypes_1[_i];
                        return [4 /*yield*/, this.supabase
                                .from('subscription_usage')
                                .insert({
                                subscription_id: subscriptionId,
                                usage_type: usage.type,
                                usage_count: 0,
                                usage_limit: usage.limit,
                                period_start: subscription.current_period_start,
                                period_end: subscription.current_period_end
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_14 = _a.sent();
                        logger_1.logger.error('Error initializing usage tracking:', error_14);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.extractUsageLimit = function (features, usageType) {
        var feature = features.find(function (f) { return f.toLowerCase().includes(usageType); });
        if (!feature)
            return null;
        var match = feature.match(/(\d+)/);
        return match ? parseInt(match[1]) : null;
    };
    SubscriptionManager.prototype.logBillingEvent = function (subscriptionId, eventType, eventData) {
        return __awaiter(this, void 0, void 0, function () {
            var error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.supabase
                                .from('billing_events')
                                .insert({
                                subscription_id: subscriptionId,
                                event_type: eventType,
                                event_data: eventData
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _a.sent();
                        logger_1.logger.error('Error logging billing event:', error_15);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SubscriptionManager.prototype.sendSubscriptionNotification = function (subscriptionId, notificationType) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, error_16;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSubscription(subscriptionId)];
                    case 1:
                        subscription = _b.sent();
                        if (!subscription)
                            return [2 /*return*/];
                        return [4 /*yield*/, (0, notification_service_1.sendNotification)({
                                type: notificationType,
                                recipient_id: subscription.customer_id,
                                data: {
                                    subscription_id: subscriptionId,
                                    plan_name: (_a = subscription.plan) === null || _a === void 0 ? void 0 : _a.name
                                }
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_16 = _b.sent();
                        logger_1.logger.error('Error sending subscription notification:', error_16);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return SubscriptionManager;
}());
exports.SubscriptionManager = SubscriptionManager;
// Export singleton instance
exports.subscriptionManager = new SubscriptionManager();
