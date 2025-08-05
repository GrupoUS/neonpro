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
exports.StripeWebhookHandler = exports.SubscriptionService = void 0;
var server_1 = require("@/lib/supabase/server");
var stripe_1 = require("@/lib/stripe");
var plans_1 = require("@/lib/constants/plans");
// Subscription service class
var SubscriptionService = /** @class */ (function () {
    function SubscriptionService() {
        // Initialize Supabase client when needed
    }
    SubscriptionService.prototype.getSupabaseClient = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.supabase) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, (0, server_1.createClient)()];
                    case 1:
                        _a.supabase = _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/, this.supabase];
                }
            });
        });
    };
    // Create a checkout session for subscription
    SubscriptionService.prototype.createCheckoutSession = function (planId, userId, userEmail, successUrl, cancelUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, session, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        plan = plans_1.NEONPRO_PLANS[planId];
                        if (!plan) {
                            throw new Error("Invalid plan ID: ".concat(planId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, stripe_1.stripe.checkout.sessions.create({
                                customer_email: userEmail,
                                line_items: [
                                    {
                                        price: plan.stripePriceId,
                                        quantity: 1,
                                    },
                                ],
                                mode: 'subscription',
                                success_url: successUrl,
                                cancel_url: cancelUrl,
                                metadata: {
                                    userId: userId,
                                    planId: planId,
                                },
                                subscription_data: {
                                    metadata: {
                                        userId: userId,
                                        planId: planId,
                                    },
                                },
                                locale: 'pt-BR',
                                currency: 'brl',
                                payment_method_types: ['card', 'boleto'],
                                allow_promotion_codes: true,
                                billing_address_collection: 'required',
                                customer_creation: 'always',
                            })];
                    case 2:
                        session = _a.sent();
                        return [2 /*return*/, session];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error creating checkout session:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Create a billing portal session
    SubscriptionService.prototype.createBillingPortalSession = function (customerId, returnUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var session, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stripe_1.stripe.billingPortal.sessions.create({
                                customer: customerId,
                                return_url: returnUrl,
                                locale: 'pt-BR',
                            })];
                    case 1:
                        session = _a.sent();
                        return [2 /*return*/, session];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error creating billing portal session:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get customer's active subscription
    SubscriptionService.prototype.getActiveSubscription = function (customerId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscriptions, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.list({
                                customer: customerId,
                                status: 'active',
                                limit: 1,
                            })];
                    case 1:
                        subscriptions = _a.sent();
                        return [2 /*return*/, subscriptions.data[0] || null];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error getting active subscription:', error_3);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Cancel subscription
    SubscriptionService.prototype.cancelSubscription = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.update(subscriptionId, {
                                cancel_at_period_end: true,
                            })];
                    case 1:
                        subscription = _a.sent();
                        return [2 /*return*/, subscription];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error canceling subscription:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Reactivate subscription
    SubscriptionService.prototype.reactivateSubscription = function (subscriptionId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.update(subscriptionId, {
                                cancel_at_period_end: false,
                            })];
                    case 1:
                        subscription = _a.sent();
                        return [2 /*return*/, subscription];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error reactivating subscription:', error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Update user subscription in database
    SubscriptionService.prototype.updateUserSubscription = function (userId, subscriptionData) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, error, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _c.sent();
                        return [4 /*yield*/, supabase
                                .from('user_subscriptions')
                                .upsert({
                                user_id: userId,
                                stripe_customer_id: subscriptionData.stripeCustomerId,
                                stripe_subscription_id: subscriptionData.stripeSubscriptionId,
                                plan_id: subscriptionData.planId,
                                status: subscriptionData.status,
                                current_period_start: (_a = subscriptionData.currentPeriodStart) === null || _a === void 0 ? void 0 : _a.toISOString(),
                                current_period_end: (_b = subscriptionData.currentPeriodEnd) === null || _b === void 0 ? void 0 : _b.toISOString(),
                                updated_at: new Date().toISOString(),
                            })];
                    case 2:
                        error = (_c.sent()).error;
                        if (error) {
                            throw error;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _c.sent();
                        console.error('Error updating user subscription:', error_6);
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get user subscription from database
    SubscriptionService.prototype.getUserSubscription = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, _a, data, error, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getSupabaseClient()];
                    case 1:
                        supabase = _b.sent();
                        return [4 /*yield*/, supabase
                                .from('user_subscriptions')
                                .select('*')
                                .eq('user_id', userId)
                                .single()];
                    case 2:
                        _a = _b.sent(), data = _a.data, error = _a.error;
                        if (error && error.code !== 'PGRST116') {
                            throw error;
                        }
                        return [2 /*return*/, data];
                    case 3:
                        error_7 = _b.sent();
                        console.error('Error getting user subscription:', error_7);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Check if user has active subscription
    SubscriptionService.prototype.hasActiveSubscription = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var subscription, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUserSubscription(userId)];
                    case 1:
                        subscription = _a.sent();
                        if (!subscription)
                            return [2 /*return*/, false];
                        return [2 /*return*/, (subscription.status === 'active' &&
                                new Date(subscription.current_period_end) > new Date())];
                    case 2:
                        error_8 = _a.sent();
                        console.error('Error checking active subscription:', error_8);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get plan by ID
    SubscriptionService.prototype.getPlan = function (planId) {
        return plans_1.NEONPRO_PLANS[planId];
    };
    // Get all plans
    SubscriptionService.prototype.getAllPlans = function () {
        return Object.values(plans_1.NEONPRO_PLANS);
    };
    // Format price for display
    SubscriptionService.prototype.formatPrice = function (price) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price / 100);
    };
    return SubscriptionService;
}());
exports.SubscriptionService = SubscriptionService;
// Webhook handler for Stripe events
var StripeWebhookHandler = /** @class */ (function () {
    function StripeWebhookHandler() {
        this.subscriptionService = new SubscriptionService();
    }
    StripeWebhookHandler.prototype.handleWebhook = function (body, signature) {
        return __awaiter(this, void 0, void 0, function () {
            var event, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        try {
                            event = stripe_1.stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
                        }
                        catch (err) {
                            console.error('Webhook signature verification failed:', err);
                            throw err;
                        }
                        _a = event.type;
                        switch (_a) {
                            case 'checkout.session.completed': return [3 /*break*/, 1];
                            case 'customer.subscription.created': return [3 /*break*/, 3];
                            case 'customer.subscription.updated': return [3 /*break*/, 3];
                            case 'customer.subscription.deleted': return [3 /*break*/, 5];
                            case 'invoice.payment_succeeded': return [3 /*break*/, 7];
                            case 'invoice.payment_failed': return [3 /*break*/, 9];
                        }
                        return [3 /*break*/, 11];
                    case 1: return [4 /*yield*/, this.handleCheckoutCompleted(event.data.object)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 3: return [4 /*yield*/, this.handleSubscriptionChange(event.data.object)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 5: return [4 /*yield*/, this.handleSubscriptionDeleted(event.data.object)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 7: return [4 /*yield*/, this.handlePaymentSucceeded(event.data.object)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 9: return [4 /*yield*/, this.handlePaymentFailed(event.data.object)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        console.log("Unhandled event type: ".concat(event.type));
                        _b.label = 12;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    StripeWebhookHandler.prototype.handleCheckoutCompleted = function (session) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, subscription, error_9;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        userId = (_a = session.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                        if (!userId) {
                            console.error('No userId in checkout session metadata');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, stripe_1.stripe.subscriptions.retrieve(session.subscription)];
                    case 1:
                        subscription = _c.sent();
                        return [4 /*yield*/, this.subscriptionService.updateUserSubscription(userId, {
                                stripeCustomerId: session.customer,
                                stripeSubscriptionId: subscription.id,
                                planId: (_b = session.metadata) === null || _b === void 0 ? void 0 : _b.planId,
                                status: subscription.status,
                                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            })];
                    case 2:
                        _c.sent();
                        console.log("Subscription created for user ".concat(userId));
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _c.sent();
                        console.error('Error handling checkout completion:', error_9);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StripeWebhookHandler.prototype.handleSubscriptionChange = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, error_10;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                        if (!userId) {
                            console.error('No userId in subscription metadata');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.subscriptionService.updateUserSubscription(userId, {
                                status: subscription.status,
                                currentPeriodStart: new Date(subscription.current_period_start * 1000),
                                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                            })];
                    case 1:
                        _b.sent();
                        console.log("Subscription updated for user ".concat(userId, ": ").concat(subscription.status));
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _b.sent();
                        console.error('Error handling subscription change:', error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StripeWebhookHandler.prototype.handleSubscriptionDeleted = function (subscription) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = subscription.metadata) === null || _a === void 0 ? void 0 : _a.userId;
                        if (!userId) {
                            console.error('No userId in subscription metadata');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.subscriptionService.updateUserSubscription(userId, {
                                status: 'canceled',
                            })];
                    case 1:
                        _b.sent();
                        console.log("Subscription canceled for user ".concat(userId));
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        console.error('Error handling subscription deletion:', error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StripeWebhookHandler.prototype.handlePaymentSucceeded = function (invoice) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Payment succeeded for invoice ".concat(invoice.id));
                return [2 /*return*/];
            });
        });
    };
    StripeWebhookHandler.prototype.handlePaymentFailed = function (invoice) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log("Payment failed for invoice ".concat(invoice.id));
                return [2 /*return*/];
            });
        });
    };
    return StripeWebhookHandler;
}());
exports.StripeWebhookHandler = StripeWebhookHandler;
exports.default = SubscriptionService;
