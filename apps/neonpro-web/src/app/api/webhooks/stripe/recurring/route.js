"use strict";
// NeonPro - Stripe Recurring Payments Webhook
// Story 6.1 - Task 2: Recurring Payment System
// Webhook handler for Stripe recurring payment events
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return (
      (g.next = verb(0)),
      (g["throw"] = verb(1)),
      (g["return"] = verb(2)),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                    ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.POST = POST;
var server_1 = require("next/server");
var headers_1 = require("next/headers");
var stripe_1 = require("stripe");
var supabase_js_1 = require("@supabase/supabase-js");
var recurring_payment_processor_1 = require("@/lib/payments/recurring/recurring-payment-processor");
var logger_1 = require("@/lib/utils/logger");
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
var endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_RECURRING;
// POST /api/webhooks/stripe/recurring - Handle Stripe recurring payment webhooks
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, headersList, signature, event_1, _a, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 24, , 25]);
          return [4 /*yield*/, request.text()];
        case 1:
          body = _b.sent();
          headersList = (0, headers_1.headers)();
          signature = headersList.get("stripe-signature");
          if (!signature) {
            logger_1.logger.error("Missing Stripe signature");
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Missing signature" }, { status: 400 }),
            ];
          }
          try {
            event_1 = stripe.webhooks.constructEvent(body, signature, endpointSecret);
          } catch (err) {
            logger_1.logger.error("Webhook signature verification failed:", err);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid signature" }, { status: 400 }),
            ];
          }
          logger_1.logger.info("Received Stripe webhook event: ".concat(event_1.type));
          _a = event_1.type;
          switch (_a) {
            case "invoice.payment_succeeded":
              return [3 /*break*/, 2];
            case "invoice.payment_failed":
              return [3 /*break*/, 4];
            case "invoice.created":
              return [3 /*break*/, 6];
            case "invoice.finalized":
              return [3 /*break*/, 8];
            case "customer.subscription.created":
              return [3 /*break*/, 10];
            case "customer.subscription.updated":
              return [3 /*break*/, 12];
            case "customer.subscription.deleted":
              return [3 /*break*/, 14];
            case "customer.subscription.trial_will_end":
              return [3 /*break*/, 16];
            case "payment_intent.succeeded":
              return [3 /*break*/, 18];
            case "payment_intent.payment_failed":
              return [3 /*break*/, 20];
          }
          return [3 /*break*/, 22];
        case 2:
          return [4 /*yield*/, handleInvoicePaymentSucceeded(event_1.data.object)];
        case 3:
          _b.sent();
          return [3 /*break*/, 23];
        case 4:
          return [4 /*yield*/, handleInvoicePaymentFailed(event_1.data.object)];
        case 5:
          _b.sent();
          return [3 /*break*/, 23];
        case 6:
          return [4 /*yield*/, handleInvoiceCreated(event_1.data.object)];
        case 7:
          _b.sent();
          return [3 /*break*/, 23];
        case 8:
          return [4 /*yield*/, handleInvoiceFinalized(event_1.data.object)];
        case 9:
          _b.sent();
          return [3 /*break*/, 23];
        case 10:
          return [4 /*yield*/, handleSubscriptionCreated(event_1.data.object)];
        case 11:
          _b.sent();
          return [3 /*break*/, 23];
        case 12:
          return [4 /*yield*/, handleSubscriptionUpdated(event_1.data.object)];
        case 13:
          _b.sent();
          return [3 /*break*/, 23];
        case 14:
          return [4 /*yield*/, handleSubscriptionDeleted(event_1.data.object)];
        case 15:
          _b.sent();
          return [3 /*break*/, 23];
        case 16:
          return [4 /*yield*/, handleSubscriptionTrialWillEnd(event_1.data.object)];
        case 17:
          _b.sent();
          return [3 /*break*/, 23];
        case 18:
          return [4 /*yield*/, handlePaymentIntentSucceeded(event_1.data.object)];
        case 19:
          _b.sent();
          return [3 /*break*/, 23];
        case 20:
          return [4 /*yield*/, handlePaymentIntentFailed(event_1.data.object)];
        case 21:
          _b.sent();
          return [3 /*break*/, 23];
        case 22:
          logger_1.logger.info("Unhandled event type: ".concat(event_1.type));
          _b.label = 23;
        case 23:
          return [2 /*return*/, server_1.NextResponse.json({ received: true })];
        case 24:
          error_1 = _b.sent();
          logger_1.logger.error("Error processing Stripe webhook:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }),
          ];
        case 25:
          return [2 /*return*/];
      }
    });
  });
}
// Handle successful invoice payment
function handleInvoicePaymentSucceeded(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var billingEvent, error_2;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          if (!invoice.subscription) {
            logger_1.logger.warn("Invoice payment succeeded but no subscription found");
            return [2 /*return*/];
          }
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select("*")
              .eq("stripe_invoice_id", invoice.id)
              .single(),
          ];
        case 1:
          billingEvent = _a.sent().data;
          if (!billingEvent) return [3 /*break*/, 4];
          // Update billing event status
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .update({
                status: "paid",
                paid_at: new Date(invoice.status_transitions.paid_at * 1000).toISOString(),
                stripe_payment_intent_id: invoice.payment_intent,
                updated_at: new Date().toISOString(),
              })
              .eq("id", billingEvent.id),
          ];
        case 2:
          // Update billing event status
          _a.sent();
          // Update subscription status if needed
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .update({
                status: "active",
                current_period_start: new Date(invoice.period_start * 1000).toISOString(),
                current_period_end: new Date(invoice.period_end * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", invoice.subscription),
          ];
        case 3:
          // Update subscription status if needed
          _a.sent();
          logger_1.logger.info("Invoice payment succeeded: ".concat(invoice.id));
          _a.label = 4;
        case 4:
          return [3 /*break*/, 6];
        case 5:
          error_2 = _a.sent();
          logger_1.logger.error("Error handling invoice payment succeeded:", error_2);
          return [3 /*break*/, 6];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Handle failed invoice payment
function handleInvoicePaymentFailed(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var billingEvent, error_3;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 5, , 6]);
          if (!invoice.subscription) {
            logger_1.logger.warn("Invoice payment failed but no subscription found");
            return [2 /*return*/];
          }
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .select("*")
              .eq("stripe_invoice_id", invoice.id)
              .single(),
          ];
        case 1:
          billingEvent = _b.sent().data;
          if (!billingEvent) return [3 /*break*/, 4];
          // Update billing event status
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .update({
                status: "payment_failed",
                failure_reason:
                  ((_a = invoice.last_finalization_error) === null || _a === void 0
                    ? void 0
                    : _a.message) || "Payment failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", billingEvent.id),
          ];
        case 2:
          // Update billing event status
          _b.sent();
          // Schedule retry if within limits
          return [
            4 /*yield*/,
            recurring_payment_processor_1.recurringPaymentProcessor.schedulePaymentRetry(
              billingEvent.id,
            ),
          ];
        case 3:
          // Schedule retry if within limits
          _b.sent();
          logger_1.logger.info("Invoice payment failed: ".concat(invoice.id));
          _b.label = 4;
        case 4:
          return [3 /*break*/, 6];
        case 5:
          error_3 = _b.sent();
          logger_1.logger.error("Error handling invoice payment failed:", error_3);
          return [3 /*break*/, 6];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
// Handle invoice creation
function handleInvoiceCreated(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var subscription, error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          if (!invoice.subscription) {
            logger_1.logger.warn("Invoice created but no subscription found");
            return [2 /*return*/];
          }
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("*")
              .eq("stripe_subscription_id", invoice.subscription)
              .single(),
          ];
        case 1:
          subscription = _a.sent().data;
          if (!subscription) return [3 /*break*/, 3];
          // Create billing event
          return [
            4 /*yield*/,
            supabase.from("billing_events").insert({
              subscription_id: subscription.id,
              amount: invoice.amount_due / 100, // Convert from cents
              currency: invoice.currency,
              status: "pending",
              billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
              billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
              stripe_invoice_id: invoice.id,
              metadata: {
                invoice_number: invoice.number,
                hosted_invoice_url: invoice.hosted_invoice_url,
                invoice_pdf: invoice.invoice_pdf,
              },
            }),
          ];
        case 2:
          // Create billing event
          _a.sent();
          logger_1.logger.info("Invoice created: ".concat(invoice.id));
          _a.label = 3;
        case 3:
          return [3 /*break*/, 5];
        case 4:
          error_4 = _a.sent();
          logger_1.logger.error("Error handling invoice created:", error_4);
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
// Handle invoice finalization
function handleInvoiceFinalized(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update billing event with finalized invoice details
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .update({
                status: "finalized",
                metadata: {
                  invoice_number: invoice.number,
                  hosted_invoice_url: invoice.hosted_invoice_url,
                  invoice_pdf: invoice.invoice_pdf,
                  due_date: invoice.due_date
                    ? new Date(invoice.due_date * 1000).toISOString()
                    : null,
                },
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_invoice_id", invoice.id),
          ];
        case 1:
          // Update billing event with finalized invoice details
          _a.sent();
          logger_1.logger.info("Invoice finalized: ".concat(invoice.id));
          return [3 /*break*/, 3];
        case 2:
          error_5 = _a.sent();
          logger_1.logger.error("Error handling invoice finalized:", error_5);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle subscription creation
function handleSubscriptionCreated(subscription) {
  return __awaiter(this, void 0, void 0, function () {
    var error_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update subscription with Stripe details
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .update({
                status: subscription.status,
                current_period_start: new Date(
                  subscription.current_period_start * 1000,
                ).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                trial_start: subscription.trial_start
                  ? new Date(subscription.trial_start * 1000).toISOString()
                  : null,
                trial_end: subscription.trial_end
                  ? new Date(subscription.trial_end * 1000).toISOString()
                  : null,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", subscription.id),
          ];
        case 1:
          // Update subscription with Stripe details
          _a.sent();
          logger_1.logger.info("Subscription created: ".concat(subscription.id));
          return [3 /*break*/, 3];
        case 2:
          error_6 = _a.sent();
          logger_1.logger.error("Error handling subscription created:", error_6);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle subscription updates
function handleSubscriptionUpdated(subscription) {
  return __awaiter(this, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update subscription with new details
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .update({
                status: subscription.status,
                current_period_start: new Date(
                  subscription.current_period_start * 1000,
                ).toISOString(),
                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                trial_start: subscription.trial_start
                  ? new Date(subscription.trial_start * 1000).toISOString()
                  : null,
                trial_end: subscription.trial_end
                  ? new Date(subscription.trial_end * 1000).toISOString()
                  : null,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", subscription.id),
          ];
        case 1:
          // Update subscription with new details
          _a.sent();
          logger_1.logger.info("Subscription updated: ".concat(subscription.id));
          return [3 /*break*/, 3];
        case 2:
          error_7 = _a.sent();
          logger_1.logger.error("Error handling subscription updated:", error_7);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle subscription deletion
function handleSubscriptionDeleted(subscription) {
  return __awaiter(this, void 0, void 0, function () {
    var error_8;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update subscription status to cancelled
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .update({
                status: "cancelled",
                cancelled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", subscription.id),
          ];
        case 1:
          // Update subscription status to cancelled
          _a.sent();
          logger_1.logger.info("Subscription deleted: ".concat(subscription.id));
          return [3 /*break*/, 3];
        case 2:
          error_8 = _a.sent();
          logger_1.logger.error("Error handling subscription deleted:", error_8);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle subscription trial ending soon
function handleSubscriptionTrialWillEnd(subscription) {
  return __awaiter(this, void 0, void 0, function () {
    var subscriptionData, error_9;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .select("\n        *,\n        customer:customers(*)\n      ")
              .eq("stripe_subscription_id", subscription.id)
              .single(),
          ];
        case 1:
          subscriptionData = _a.sent().data;
          if (subscriptionData) {
            // Send trial ending notification
            // This would integrate with your notification system
            logger_1.logger.info("Trial will end for subscription: ".concat(subscription.id));
            // You can add email notification logic here
            // await sendTrialEndingNotification(subscriptionData);
          }
          return [3 /*break*/, 3];
        case 2:
          error_9 = _a.sent();
          logger_1.logger.error("Error handling subscription trial will end:", error_9);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle successful payment intent
function handlePaymentIntentSucceeded(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update any related billing events
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .update({
                stripe_payment_intent_id: paymentIntent.id,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id),
          ];
        case 1:
          // Update any related billing events
          _a.sent();
          logger_1.logger.info("Payment intent succeeded: ".concat(paymentIntent.id));
          return [3 /*break*/, 3];
        case 2:
          error_10 = _a.sent();
          logger_1.logger.error("Error handling payment intent succeeded:", error_10);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
// Handle failed payment intent
function handlePaymentIntentFailed(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var error_11;
    var _a;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 2, , 3]);
          // Update any related billing events
          return [
            4 /*yield*/,
            supabase
              .from("billing_events")
              .update({
                stripe_payment_intent_id: paymentIntent.id,
                failure_reason:
                  ((_a = paymentIntent.last_payment_error) === null || _a === void 0
                    ? void 0
                    : _a.message) || "Payment failed",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id),
          ];
        case 1:
          // Update any related billing events
          _b.sent();
          logger_1.logger.info("Payment intent failed: ".concat(paymentIntent.id));
          return [3 /*break*/, 3];
        case 2:
          error_11 = _b.sent();
          logger_1.logger.error("Error handling payment intent failed:", error_11);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
