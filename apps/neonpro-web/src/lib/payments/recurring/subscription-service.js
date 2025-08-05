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
exports.createsubscriptionService = exports.SubscriptionService = void 0;
var server_1 = require("@/lib/supabase/server");
var stripe_1 = require("@/lib/stripe");
/**
 * Subscription Service for managing recurring payments
 */
var SubscriptionService = /** @class */ (function () {
    function SubscriptionService() {
        this.supabase = (0, server_1.createClient)();
    }
    /**
     * Create a new subscription
     */
    SubscriptionService.prototype.createSubscription = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, patient, stripeCustomerId, stripeSubscription, _a, subscription, error, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', data.planId)
                                .eq('is_active', true)
                                .single()];
                    case 1:
                        plan = (_b.sent()).data;
                        if (!plan) {
                            throw new Error('Subscription plan not found or inactive');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('patients')
                                .select('id, email, name')
                                .eq('id', data.patientId)
                                .single()];
                    case 2:
                        patient = (_b.sent()).data;
                        if (!patient) {
                            throw new Error('Patient not found');
                        }
                        return [4 /*yield*/, this.getOrCreateStripeCustomer(patient)
                            // Attach payment method to customer
                        ];
                    case 3:
                        stripeCustomerId = _b.sent();
                        // Attach payment method to customer
                        return [4 /*yield*/, stripe_1.stripe.paymentMethods.attach(data.paymentMethodId, {
                                customer: stripeCustomerId
                            })
                            // Set as default payment method
                        ];
                    case 4:
                        // Attach payment method to customer
                        _b.sent();
                        // Set as default payment method
                        return [4 /*yield*/, stripe_1.stripe.customers.update(stripeCustomerId, {
                                invoice_settings: {
                                    default_payment_method: data.paymentMethodId
                                }
                            })
                            // Create Stripe subscription
                        ];
                    case 5:
                        // Set as default payment method
                        _b.sent();
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.create({
                                customer: stripeCustomerId,
                                items: [{
                                        price_data: {
                                            currency: plan.currency,
                                            product_data: {
                                                name: plan.name,
                                                description: plan.description
                                            },
                                            unit_amount: plan.amount,
                                            recurring: {
                                                interval: plan.interval,
                                                interval_count: plan.interval_count
                                            }
                                        }
                                    }],
                                trial_period_days: plan.trial_days || undefined,
                                default_payment_method: data.paymentMethodId,
                                metadata: __assign({ patientId: data.patientId, planId: data.planId }, data.metadata)
                            })
                            // Save subscription to database
                        ];
                    case 6:
                        stripeSubscription = _b.sent();
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .insert({
                                id: stripeSubscription.id,
                                patient_id: data.patientId,
                                plan_id: data.planId,
                                stripe_customer_id: stripeCustomerId,
                                stripe_subscription_id: stripeSubscription.id,
                                status: stripeSubscription.status,
                                current_period_start: new Date(stripeSubscription.current_period_start * 1000),
                                current_period_end: new Date(stripeSubscription.current_period_end * 1000),
                                trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
                                amount: plan.amount,
                                currency: plan.currency,
                                payment_method_id: data.paymentMethodId,
                                metadata: data.metadata
                            })
                                .select()
                                .single()];
                    case 7:
                        _a = _b.sent(), subscription = _a.data, error = _a.error;
                        if (error) {
                            throw new Error("Failed to save subscription: ".concat(error.message));
                        }
                        return [2 /*return*/, this.formatSubscriptionStatus(subscription, stripeSubscription)];
                    case 8:
                        error_1 = _b.sent();
                        console.error('Subscription creation error:', error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get subscription status
     */
    SubscriptionService.prototype.getSubscriptionStatus = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, stripeSubscription, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select("\n          *,\n          subscription_plans(*),\n          patients(id, name, email)\n        ")
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        subscription = (_a.sent()).data;
                        if (!subscription) {
                            return [2 /*return*/, null];
                        }
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.retrieve(subscription.stripe_subscription_id)];
                    case 2:
                        stripeSubscription = _a.sent();
                        return [2 /*return*/, this.formatSubscriptionStatus(subscription, stripeSubscription)];
                    case 3:
                        error_2 = _a.sent();
                        console.error('Get subscription status error:', error_2);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Cancel subscription
     */
    SubscriptionService.prototype.cancelSubscription = function (subscriptionId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, cancelAtPeriodEnd) {
            var subscription, error_3;
            if (cancelAtPeriodEnd === void 0) { cancelAtPeriodEnd = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select('stripe_subscription_id')
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        subscription = (_a.sent()).data;
                        if (!subscription) {
                            throw new Error('Subscription not found');
                        }
                        if (!cancelAtPeriodEnd) return [3 /*break*/, 3];
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.update(subscription.stripe_subscription_id, {
                                cancel_at_period_end: true
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, stripe_1.stripe.subscriptions.cancel(subscription.stripe_subscription_id)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // Update database
                    return [4 /*yield*/, this.supabase
                            .from('subscriptions')
                            .update({
                            status: cancelAtPeriodEnd ? 'active' : 'canceled',
                            cancel_at_period_end: cancelAtPeriodEnd,
                            canceled_at: cancelAtPeriodEnd ? null : new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', subscriptionId)];
                    case 6:
                        // Update database
                        _a.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_3 = _a.sent();
                        console.error('Cancel subscription error:', error_3);
                        return [2 /*return*/, false];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update subscription plan
     */
    SubscriptionService.prototype.updateSubscriptionPlan = function (subscriptionId_1, newPlanId_1) {
        return __awaiter(this, arguments, void 0, function (subscriptionId, newPlanId, prorationBehavior) {
            var subscription, newPlan, stripeSubscription, updatedStripeSubscription, updatedSubscription, error_4;
            if (prorationBehavior === void 0) { prorationBehavior = 'create_prorations'; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select('*')
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        subscription = (_a.sent()).data;
                        if (!subscription) {
                            throw new Error('Subscription not found');
                        }
                        return [4 /*yield*/, this.supabase
                                .from('subscription_plans')
                                .select('*')
                                .eq('id', newPlanId)
                                .eq('is_active', true)
                                .single()];
                    case 2:
                        newPlan = (_a.sent()).data;
                        if (!newPlan) {
                            throw new Error('New subscription plan not found or inactive');
                        }
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.retrieve(subscription.stripe_subscription_id)
                            // Update Stripe subscription
                        ];
                    case 3:
                        stripeSubscription = _a.sent();
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.update(subscription.stripe_subscription_id, {
                                items: [{
                                        id: stripeSubscription.items.data[0].id,
                                        price_data: {
                                            currency: newPlan.currency,
                                            product_data: {
                                                name: newPlan.name,
                                                description: newPlan.description
                                            },
                                            unit_amount: newPlan.amount,
                                            recurring: {
                                                interval: newPlan.interval,
                                                interval_count: newPlan.interval_count
                                            }
                                        }
                                    }],
                                proration_behavior: prorationBehavior
                            })
                            // Update database
                        ];
                    case 4:
                        updatedStripeSubscription = _a.sent();
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .update({
                                plan_id: newPlanId,
                                amount: newPlan.amount,
                                currency: newPlan.currency,
                                updated_at: new Date().toISOString()
                            })
                                .eq('id', subscriptionId)
                                .select()
                                .single()];
                    case 5:
                        updatedSubscription = (_a.sent()).data;
                        return [2 /*return*/, this.formatSubscriptionStatus(updatedSubscription, updatedStripeSubscription)];
                    case 6:
                        error_4 = _a.sent();
                        console.error('Update subscription plan error:', error_4);
                        return [2 /*return*/, null];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Process failed payment retry
     */
    SubscriptionService.prototype.processFailedPaymentRetry = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, invoices, invoice, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.supabase
                                .from('subscriptions')
                                .select('*')
                                .eq('id', subscriptionId)
                                .single()];
                    case 1:
                        subscription = (_a.sent()).data;
                        if (!subscription) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, stripe_1.stripe.invoices.list({
                                subscription: subscription.stripe_subscription_id,
                                limit: 1
                            })];
                    case 2:
                        invoices = _a.sent();
                        if (invoices.data.length === 0) {
                            return [2 /*return*/, false];
                        }
                        invoice = invoices.data[0];
                        if (!(invoice.status === 'open')) return [3 /*break*/, 4];
                        // Attempt to pay the invoice
                        return [4 /*yield*/, stripe_1.stripe.invoices.pay(invoice.id)];
                    case 3:
                        // Attempt to pay the invoice
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4: return [2 /*return*/, false];
                    case 5:
                        error_5 = _a.sent();
                        console.error('Failed payment retry error:', error_5);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get or create Stripe customer
     */
    SubscriptionService.prototype.getOrCreateStripeCustomer = function (patient) {
        return __awaiter(this, void 0, void 0, function () {
            var existingCustomer, stripeCustomer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.supabase
                            .from('stripe_customers')
                            .select('stripe_customer_id')
                            .eq('patient_id', patient.id)
                            .single()];
                    case 1:
                        existingCustomer = (_a.sent()).data;
                        if (existingCustomer) {
                            return [2 /*return*/, existingCustomer.stripe_customer_id];
                        }
                        return [4 /*yield*/, stripe_1.stripe.customers.create({
                                email: patient.email,
                                name: patient.name,
                                metadata: {
                                    patientId: patient.id
                                }
                            })
                            // Save to database
                        ];
                    case 2:
                        stripeCustomer = _a.sent();
                        // Save to database
                        return [4 /*yield*/, this.supabase
                                .from('stripe_customers')
                                .insert({
                                patient_id: patient.id,
                                stripe_customer_id: stripeCustomer.id,
                                email: patient.email,
                                name: patient.name
                            })];
                    case 3:
                        // Save to database
                        _a.sent();
                        return [2 /*return*/, stripeCustomer.id];
                }
            });
        });
    };
    /**
     * Format subscription status for API response
     */
    SubscriptionService.prototype.formatSubscriptionStatus = function (subscription, stripeSubscription) {
        return {
            id: subscription.id,
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
            amount: subscription.amount,
            currency: subscription.currency,
            paymentMethod: {
                type: 'card', // This would need to be determined from the actual payment method
                last4: '****', // This would come from the payment method details
                brand: 'visa' // This would come from the payment method details
            }
        };
    };
    return SubscriptionService;
}());
exports.SubscriptionService = SubscriptionService;
// Export singleton instance
var createsubscriptionService = function () { return new SubscriptionService(); };
exports.createsubscriptionService = createsubscriptionService;
