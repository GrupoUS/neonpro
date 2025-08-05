"use strict";
/**
 * Stripe Webhooks Handler
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */
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
exports.POST = POST;
var server_1 = require("next/server");
var ssr_1 = require("@supabase/ssr");
var STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, signature, event_1, supabase, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 18, , 19]);
                    return [4 /*yield*/, request.text()];
                case 1:
                    body = _b.sent();
                    signature = request.headers.get('stripe-signature');
                    if (!signature || !STRIPE_WEBHOOK_SECRET) {
                        console.error('Missing Stripe signature or webhook secret');
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })];
                    }
                    event_1 = JSON.parse(body);
                    supabase = (0, ssr_1.createServerClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
                        cookies: {
                            get: function () { return undefined; },
                            set: function () { },
                            remove: function () { }
                        }
                    });
                    _a = event_1.type;
                    switch (_a) {
                        case 'checkout.session.completed': return [3 /*break*/, 2];
                        case 'invoice.payment_succeeded': return [3 /*break*/, 4];
                        case 'invoice.payment_failed': return [3 /*break*/, 6];
                        case 'customer.subscription.created': return [3 /*break*/, 8];
                        case 'customer.subscription.updated': return [3 /*break*/, 10];
                        case 'customer.subscription.deleted': return [3 /*break*/, 12];
                        case 'invoice.created': return [3 /*break*/, 14];
                    }
                    return [3 /*break*/, 16];
                case 2: return [4 /*yield*/, handleCheckoutCompleted(supabase, event_1)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 4: return [4 /*yield*/, handlePaymentSucceeded(supabase, event_1)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 6: return [4 /*yield*/, handlePaymentFailed(supabase, event_1)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 8: return [4 /*yield*/, handleSubscriptionCreated(supabase, event_1)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 10: return [4 /*yield*/, handleSubscriptionUpdated(supabase, event_1)];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 12: return [4 /*yield*/, handleSubscriptionDeleted(supabase, event_1)];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 14: return [4 /*yield*/, handleInvoiceCreated(supabase, event_1)];
                case 15:
                    _b.sent();
                    return [3 /*break*/, 17];
                case 16:
                    console.log("Unhandled Stripe event type: ".concat(event_1.type));
                    _b.label = 17;
                case 17: return [2 /*return*/, server_1.NextResponse.json({ received: true })];
                case 18:
                    error_1 = _b.sent();
                    console.error('Stripe webhook error:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })];
                case 19: return [2 /*return*/];
            }
        });
    });
}
function handleCheckoutCompleted(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var session, metadata, subscriptionData, error, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    session = event.data.object;
                    metadata = session.metadata;
                    if (!(metadata === null || metadata === void 0 ? void 0 : metadata.clinic_id) || !(metadata === null || metadata === void 0 ? void 0 : metadata.plan_id)) {
                        console.error('Missing required metadata in checkout session');
                        return [2 /*return*/];
                    }
                    subscriptionData = {
                        clinic_id: metadata.clinic_id,
                        user_id: metadata.user_id,
                        plan_id: metadata.plan_id,
                        status: 'active',
                        billing_cycle: metadata.billing_cycle,
                        payment_provider: 'stripe',
                        external_subscription_id: session.subscription,
                        external_customer_id: session.customer,
                        current_period_start: new Date().toISOString(),
                        current_period_end: calculatePeriodEnd(metadata.billing_cycle),
                        next_billing_date: calculatePeriodEnd(metadata.billing_cycle),
                        metadata: {
                            stripe_session_id: session.id,
                            stripe_payment_intent: session.payment_intent
                        }
                    };
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .upsert(subscriptionData, {
                            onConflict: 'clinic_id',
                            ignoreDuplicates: false
                        })];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error creating/updating subscription:', error);
                        return [2 /*return*/];
                    }
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            event_type: 'subscription_created',
                            amount: session.amount_total / 100, // Convert from cents
                            currency: session.currency.toUpperCase(),
                            status: 'succeeded',
                            external_event_id: event.id,
                            external_invoice_id: session.invoice,
                            external_payment_intent_id: session.payment_intent,
                            processed_at: new Date().toISOString(),
                            metadata: {
                                stripe_session_id: session.id,
                                checkout_completed_at: new Date(session.created * 1000).toISOString()
                            }
                        })];
                case 2:
                    // Create billing event
                    _a.sent();
                    console.log("Subscription created for clinic ".concat(metadata.clinic_id));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error handling checkout completed:', error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handlePaymentSucceeded(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var invoice, subscription, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    invoice = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('external_subscription_id', invoice.subscription)
                            .single()];
                case 1:
                    subscription = (_a.sent()).data;
                    if (!subscription) {
                        console.error('Subscription not found for invoice:', invoice.subscription);
                        return [2 /*return*/];
                    }
                    // Update subscription status
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: 'active',
                            current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                            current_period_end: new Date(invoice.period_end * 1000).toISOString(),
                            next_billing_date: new Date(invoice.period_end * 1000).toISOString()
                        })
                            .eq('id', subscription.id)];
                case 2:
                    // Update subscription status
                    _a.sent();
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'invoice_payment_succeeded',
                            amount: invoice.amount_paid / 100,
                            currency: invoice.currency.toUpperCase(),
                            status: 'succeeded',
                            external_event_id: event.id,
                            external_invoice_id: invoice.id,
                            external_payment_intent_id: invoice.payment_intent,
                            processed_at: new Date().toISOString(),
                            metadata: {
                                period_start: new Date(invoice.period_start * 1000).toISOString(),
                                period_end: new Date(invoice.period_end * 1000).toISOString()
                            }
                        })];
                case 3:
                    // Create billing event
                    _a.sent();
                    console.log("Payment succeeded for subscription ".concat(subscription.id));
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error handling payment succeeded:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handlePaymentFailed(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var invoice, subscription, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    invoice = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('external_subscription_id', invoice.subscription)
                            .single()];
                case 1:
                    subscription = (_a.sent()).data;
                    if (!subscription) {
                        console.error('Subscription not found for failed payment:', invoice.subscription);
                        return [2 /*return*/];
                    }
                    // Update subscription status to past_due
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: 'past_due'
                        })
                            .eq('id', subscription.id)];
                case 2:
                    // Update subscription status to past_due
                    _a.sent();
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'invoice_payment_failed',
                            amount: invoice.amount_due / 100,
                            currency: invoice.currency.toUpperCase(),
                            status: 'failed',
                            external_event_id: event.id,
                            external_invoice_id: invoice.id,
                            processed_at: new Date().toISOString(),
                            metadata: {
                                attempt_count: invoice.attempt_count,
                                failure_reason: invoice.status
                            }
                        })];
                case 3:
                    // Create billing event
                    _a.sent();
                    console.log("Payment failed for subscription ".concat(subscription.id));
                    return [3 /*break*/, 5];
                case 4:
                    error_4 = _a.sent();
                    console.error('Error handling payment failed:', error_4);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function handleSubscriptionCreated(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription;
        return __generator(this, function (_a) {
            try {
                subscription = event.data.object;
                // Log subscription creation event
                console.log("Stripe subscription created: ".concat(subscription.id));
            }
            catch (error) {
                console.error('Error handling subscription created:', error);
            }
            return [2 /*return*/];
        });
    });
}
function handleSubscriptionUpdated(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription, localSub, status_1, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    subscription = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('external_subscription_id', subscription.id)
                            .single()];
                case 1:
                    localSub = (_a.sent()).data;
                    if (!localSub) {
                        console.error('Local subscription not found:', subscription.id);
                        return [2 /*return*/];
                    }
                    status_1 = localSub.status;
                    switch (subscription.status) {
                        case 'active':
                            status_1 = 'active';
                            break;
                        case 'past_due':
                            status_1 = 'past_due';
                            break;
                        case 'canceled':
                            status_1 = 'canceled';
                            break;
                        case 'unpaid':
                            status_1 = 'unpaid';
                            break;
                    }
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: status_1,
                            cancel_at_period_end: subscription.cancel_at_period_end,
                            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null
                        })
                            .eq('id', localSub.id)];
                case 2:
                    _a.sent();
                    console.log("Subscription updated: ".concat(subscription.id, " -> ").concat(status_1));
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error handling subscription updated:', error_5);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function handleSubscriptionDeleted(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var subscription, error, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    subscription = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .update({
                            status: 'canceled',
                            canceled_at: new Date().toISOString()
                        })
                            .eq('external_subscription_id', subscription.id)];
                case 1:
                    error = (_a.sent()).error;
                    if (error) {
                        console.error('Error canceling subscription:', error);
                        return [2 /*return*/];
                    }
                    console.log("Subscription canceled: ".concat(subscription.id));
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error('Error handling subscription deleted:', error_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function handleInvoiceCreated(supabase, event) {
    return __awaiter(this, void 0, void 0, function () {
        var invoice, subscription, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    invoice = event.data.object;
                    return [4 /*yield*/, supabase
                            .from('user_subscriptions')
                            .select('*')
                            .eq('external_subscription_id', invoice.subscription)
                            .single()];
                case 1:
                    subscription = (_a.sent()).data;
                    if (!subscription) {
                        console.error('Subscription not found for invoice:', invoice.subscription);
                        return [2 /*return*/];
                    }
                    // Create billing event
                    return [4 /*yield*/, supabase
                            .from('billing_events')
                            .insert({
                            subscription_id: subscription.id,
                            event_type: 'invoice_created',
                            amount: invoice.amount_due / 100,
                            currency: invoice.currency.toUpperCase(),
                            status: 'pending',
                            external_event_id: event.id,
                            external_invoice_id: invoice.id,
                            processed_at: new Date().toISOString(),
                            metadata: {
                                due_date: new Date(invoice.due_date * 1000).toISOString(),
                                period_start: new Date(invoice.period_start * 1000).toISOString(),
                                period_end: new Date(invoice.period_end * 1000).toISOString()
                            }
                        })];
                case 2:
                    // Create billing event
                    _a.sent();
                    console.log("Invoice created for subscription ".concat(subscription.id));
                    return [3 /*break*/, 4];
                case 3:
                    error_7 = _a.sent();
                    console.error('Error handling invoice created:', error_7);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function calculatePeriodEnd(billingCycle) {
    var now = new Date();
    switch (billingCycle) {
        case 'monthly':
            return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
        case 'quarterly':
            return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate()).toISOString();
        case 'yearly':
            return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString();
        default:
            return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
    }
}
