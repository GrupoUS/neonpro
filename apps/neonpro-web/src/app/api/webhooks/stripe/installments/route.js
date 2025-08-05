"use strict";
// NeonPro - Stripe Installments Webhook
// Story 6.1 - Task 3: Installment Management System
// Webhook handler for Stripe installment payment events
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
exports.handlePaymentIntentSucceeded = handlePaymentIntentSucceeded;
exports.handlePaymentIntentFailed = handlePaymentIntentFailed;
exports.handlePaymentIntentCanceled = handlePaymentIntentCanceled;
exports.handlePaymentIntentRequiresAction = handlePaymentIntentRequiresAction;
exports.handlePaymentIntentProcessing = handlePaymentIntentProcessing;
exports.handlePaymentMethodAttached = handlePaymentMethodAttached;
exports.handleCustomerUpdated = handleCustomerUpdated;
exports.handleInvoicePaymentSucceeded = handleInvoicePaymentSucceeded;
exports.handleInvoicePaymentFailed = handleInvoicePaymentFailed;
var server_1 = require("next/server");
var headers_1 = require("next/headers");
var stripe_1 = require("stripe");
var installment_processor_1 = require("@/lib/payments/installments/installment-processor");
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
});
var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
/**
 * POST /api/webhooks/stripe/installments
 * Handle Stripe webhook events for installment payments
 */
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var body, headersList, signature, event_1, installmentProcessor, _a, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 23, , 24]);
                    return [4 /*yield*/, request.text()];
                case 1:
                    body = _b.sent();
                    headersList = (0, headers_1.headers)();
                    signature = headersList.get('stripe-signature');
                    if (!signature) {
                        console.error('Missing Stripe signature');
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Missing signature' }, { status: 400 })];
                    }
                    try {
                        event_1 = stripe.webhooks.constructEvent(body, signature, webhookSecret);
                    }
                    catch (err) {
                        console.error('Webhook signature verification failed:', err);
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid signature' }, { status: 400 })];
                    }
                    console.log("Received Stripe webhook event: ".concat(event_1.type));
                    installmentProcessor = (0, installment_processor_1.getInstallmentProcessor)();
                    _a = event_1.type;
                    switch (_a) {
                        case 'payment_intent.succeeded': return [3 /*break*/, 2];
                        case 'payment_intent.payment_failed': return [3 /*break*/, 4];
                        case 'payment_intent.canceled': return [3 /*break*/, 6];
                        case 'payment_intent.requires_action': return [3 /*break*/, 8];
                        case 'payment_intent.processing': return [3 /*break*/, 10];
                        case 'payment_method.attached': return [3 /*break*/, 12];
                        case 'customer.updated': return [3 /*break*/, 14];
                        case 'invoice.payment_succeeded': return [3 /*break*/, 16];
                        case 'invoice.payment_failed': return [3 /*break*/, 18];
                    }
                    return [3 /*break*/, 20];
                case 2: return [4 /*yield*/, handlePaymentIntentSucceeded(event_1.data.object)];
                case 3:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 4: return [4 /*yield*/, handlePaymentIntentFailed(event_1.data.object)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 6: return [4 /*yield*/, handlePaymentIntentCanceled(event_1.data.object)];
                case 7:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 8: return [4 /*yield*/, handlePaymentIntentRequiresAction(event_1.data.object)];
                case 9:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 10: return [4 /*yield*/, handlePaymentIntentProcessing(event_1.data.object)];
                case 11:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 12: return [4 /*yield*/, handlePaymentMethodAttached(event_1.data.object)];
                case 13:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 14: return [4 /*yield*/, handleCustomerUpdated(event_1.data.object)];
                case 15:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 16: return [4 /*yield*/, handleInvoicePaymentSucceeded(event_1.data.object)];
                case 17:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 18: return [4 /*yield*/, handleInvoicePaymentFailed(event_1.data.object)];
                case 19:
                    _b.sent();
                    return [3 /*break*/, 21];
                case 20:
                    console.log("Unhandled event type: ".concat(event_1.type));
                    _b.label = 21;
                case 21: 
                // Use the installment processor's webhook handler
                return [4 /*yield*/, installmentProcessor.handleWebhookEvent(event_1)];
                case 22:
                    // Use the installment processor's webhook handler
                    _b.sent();
                    return [2 /*return*/, server_1.NextResponse.json({ received: true })];
                case 23:
                    error_1 = _b.sent();
                    console.error('Error processing webhook:', error_1);
                    return [2 /*return*/, server_1.NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })];
                case 24: return [2 /*return*/];
            }
        });
    });
}
/**
 * Handle successful payment intent
 */
function handlePaymentIntentSucceeded(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId, customerId, lateFee;
        return __generator(this, function (_a) {
            try {
                installmentId = paymentIntent.metadata.installment_id;
                paymentPlanId = paymentIntent.metadata.payment_plan_id;
                customerId = paymentIntent.metadata.customer_id;
                lateFee = parseFloat(paymentIntent.metadata.late_fee || '0');
                if (!installmentId) {
                    console.warn('Payment intent succeeded but no installment_id in metadata');
                    return [2 /*return*/];
                }
                console.log("Payment succeeded for installment ".concat(installmentId));
                // The installment processor will handle marking as paid
                // Additional business logic can be added here
                // Log the successful payment
                console.log({
                    event: 'installment_payment_succeeded',
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: customerId,
                    amount: paymentIntent.amount / 100, // Convert from cents
                    lateFee: lateFee,
                    paymentIntentId: paymentIntent.id,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling payment intent succeeded:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle failed payment intent
 */
function handlePaymentIntentFailed(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId, customerId, errorMessage;
        var _a, _b;
        return __generator(this, function (_c) {
            try {
                installmentId = paymentIntent.metadata.installment_id;
                paymentPlanId = paymentIntent.metadata.payment_plan_id;
                customerId = paymentIntent.metadata.customer_id;
                errorMessage = ((_a = paymentIntent.last_payment_error) === null || _a === void 0 ? void 0 : _a.message) || 'Payment failed';
                if (!installmentId) {
                    console.warn('Payment intent failed but no installment_id in metadata');
                    return [2 /*return*/];
                }
                console.log("Payment failed for installment ".concat(installmentId, ": ").concat(errorMessage));
                // Log the failed payment
                console.log({
                    event: 'installment_payment_failed',
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: customerId,
                    amount: paymentIntent.amount / 100,
                    error: errorMessage,
                    errorCode: (_b = paymentIntent.last_payment_error) === null || _b === void 0 ? void 0 : _b.code,
                    paymentIntentId: paymentIntent.id,
                    timestamp: new Date().toISOString()
                });
                // TODO: Implement retry logic or notification system
                // This could trigger:
                // - Automatic retry after a delay
                // - Customer notification
                // - Escalation to collections
            }
            catch (error) {
                console.error('Error handling payment intent failed:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle canceled payment intent
 */
function handlePaymentIntentCanceled(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId, customerId;
        return __generator(this, function (_a) {
            try {
                installmentId = paymentIntent.metadata.installment_id;
                paymentPlanId = paymentIntent.metadata.payment_plan_id;
                customerId = paymentIntent.metadata.customer_id;
                if (!installmentId) {
                    console.warn('Payment intent canceled but no installment_id in metadata');
                    return [2 /*return*/];
                }
                console.log("Payment canceled for installment ".concat(installmentId));
                // Log the canceled payment
                console.log({
                    event: 'installment_payment_canceled',
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: customerId,
                    amount: paymentIntent.amount / 100,
                    paymentIntentId: paymentIntent.id,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling payment intent canceled:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle payment intent that requires action
 */
function handlePaymentIntentRequiresAction(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId, customerId;
        var _a;
        return __generator(this, function (_b) {
            try {
                installmentId = paymentIntent.metadata.installment_id;
                paymentPlanId = paymentIntent.metadata.payment_plan_id;
                customerId = paymentIntent.metadata.customer_id;
                if (!installmentId) {
                    console.warn('Payment intent requires action but no installment_id in metadata');
                    return [2 /*return*/];
                }
                console.log("Payment requires action for installment ".concat(installmentId));
                // Log the action required
                console.log({
                    event: 'installment_payment_requires_action',
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: customerId,
                    amount: paymentIntent.amount / 100,
                    paymentIntentId: paymentIntent.id,
                    nextAction: (_a = paymentIntent.next_action) === null || _a === void 0 ? void 0 : _a.type,
                    timestamp: new Date().toISOString()
                });
                // TODO: Implement customer notification for required action
                // This could trigger:
                // - Email with payment link
                // - SMS notification
                // - In-app notification
            }
            catch (error) {
                console.error('Error handling payment intent requires action:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle payment intent processing
 */
function handlePaymentIntentProcessing(paymentIntent) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId, customerId;
        return __generator(this, function (_a) {
            try {
                installmentId = paymentIntent.metadata.installment_id;
                paymentPlanId = paymentIntent.metadata.payment_plan_id;
                customerId = paymentIntent.metadata.customer_id;
                if (!installmentId) {
                    console.warn('Payment intent processing but no installment_id in metadata');
                    return [2 /*return*/];
                }
                console.log("Payment processing for installment ".concat(installmentId));
                // Log the processing status
                console.log({
                    event: 'installment_payment_processing',
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: customerId,
                    amount: paymentIntent.amount / 100,
                    paymentIntentId: paymentIntent.id,
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error('Error handling payment intent processing:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle payment method attached to customer
 */
function handlePaymentMethodAttached(paymentMethod) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                console.log("Payment method ".concat(paymentMethod.id, " attached to customer ").concat(paymentMethod.customer));
                // Log the payment method attachment
                console.log({
                    event: 'payment_method_attached',
                    paymentMethodId: paymentMethod.id,
                    customerId: paymentMethod.customer,
                    type: paymentMethod.type,
                    card: paymentMethod.card ? {
                        brand: paymentMethod.card.brand,
                        last4: paymentMethod.card.last4,
                        expMonth: paymentMethod.card.exp_month,
                        expYear: paymentMethod.card.exp_year
                    } : null,
                    timestamp: new Date().toISOString()
                });
                // TODO: Update customer payment methods in database if needed
            }
            catch (error) {
                console.error('Error handling payment method attached:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle customer updated
 */
function handleCustomerUpdated(customer) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                if (customer.deleted) {
                    console.log("Customer ".concat(customer.id, " was deleted"));
                    return [2 /*return*/];
                }
                console.log("Customer ".concat(customer.id, " was updated"));
                // Log the customer update
                console.log({
                    event: 'customer_updated',
                    customerId: customer.id,
                    email: customer.email,
                    name: customer.name,
                    timestamp: new Date().toISOString()
                });
                // TODO: Sync customer data with local database if needed
            }
            catch (error) {
                console.error('Error handling customer updated:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle successful invoice payment
 */
function handleInvoicePaymentSucceeded(invoice) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId;
        var _a, _b;
        return __generator(this, function (_c) {
            try {
                installmentId = (_a = invoice.metadata) === null || _a === void 0 ? void 0 : _a.installment_id;
                paymentPlanId = (_b = invoice.metadata) === null || _b === void 0 ? void 0 : _b.payment_plan_id;
                console.log("Invoice payment succeeded: ".concat(invoice.id));
                // Log the invoice payment
                console.log({
                    event: 'invoice_payment_succeeded',
                    invoiceId: invoice.id,
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: invoice.customer,
                    amount: invoice.amount_paid / 100,
                    timestamp: new Date().toISOString()
                });
                // If this invoice is related to an installment, handle accordingly
                if (installmentId) {
                    // The payment intent handler will take care of marking as paid
                    console.log("Invoice payment for installment ".concat(installmentId));
                }
            }
            catch (error) {
                console.error('Error handling invoice payment succeeded:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Handle failed invoice payment
 */
function handleInvoicePaymentFailed(invoice) {
    return __awaiter(this, void 0, void 0, function () {
        var installmentId, paymentPlanId;
        var _a, _b;
        return __generator(this, function (_c) {
            try {
                installmentId = (_a = invoice.metadata) === null || _a === void 0 ? void 0 : _a.installment_id;
                paymentPlanId = (_b = invoice.metadata) === null || _b === void 0 ? void 0 : _b.payment_plan_id;
                console.log("Invoice payment failed: ".concat(invoice.id));
                // Log the invoice payment failure
                console.log({
                    event: 'invoice_payment_failed',
                    invoiceId: invoice.id,
                    installmentId: installmentId,
                    paymentPlanId: paymentPlanId,
                    customerId: invoice.customer,
                    amount: invoice.amount_due / 100,
                    timestamp: new Date().toISOString()
                });
                // If this invoice is related to an installment, handle accordingly
                if (installmentId) {
                    console.log("Invoice payment failed for installment ".concat(installmentId));
                    // TODO: Implement retry logic or escalation
                }
            }
            catch (error) {
                console.error('Error handling invoice payment failed:', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
