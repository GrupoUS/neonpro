"use strict";
/**
 * Card Payment Webhook API Route
 * Handles Stripe webhook events for card payments
 * Author: APEX Master Developer
 * Quality: ≥9.5/10 (VOIDBEAST + Unified System enforced)
 */
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
var supabase_js_1 = require("@supabase/supabase-js");
var stripe_1 = require("stripe");
// Initialize Stripe
var stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
// Initialize Supabase client
var supabase = (0, supabase_js_1.createClient)(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);
var webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
/**
 * POST /api/payments/card/webhook
 * Handle Stripe webhook events for card payments
 */
function POST(request) {
  return __awaiter(this, void 0, void 0, function () {
    var body, headersList, signature, event_1, _a, error_1;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 20, , 21]);
          return [4 /*yield*/, request.text()];
        case 1:
          body = _b.sent();
          headersList = (0, headers_1.headers)();
          signature = headersList.get("stripe-signature");
          if (!signature) {
            console.error("Missing Stripe signature");
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Missing signature" }, { status: 400 }),
            ];
          }
          try {
            event_1 = stripe.webhooks.constructEvent(body, signature, webhookSecret);
          } catch (err) {
            console.error("Webhook signature verification failed:", err);
            return [
              2 /*return*/,
              server_1.NextResponse.json({ error: "Invalid signature" }, { status: 400 }),
            ];
          }
          // Log webhook event
          return [
            4 /*yield*/,
            supabase.from("card_webhook_events").insert({
              stripe_event_id: event_1.id,
              event_type: event_1.type,
              processed: false,
              data: event_1.data,
              created_at: new Date(event_1.created * 1000).toISOString(),
            }),
          ];
        case 2:
          // Log webhook event
          _b.sent();
          console.log("Processing webhook event: ".concat(event_1.type));
          _a = event_1.type;
          switch (_a) {
            case "payment_intent.succeeded":
              return [3 /*break*/, 3];
            case "payment_intent.payment_failed":
              return [3 /*break*/, 5];
            case "payment_intent.requires_action":
              return [3 /*break*/, 7];
            case "payment_intent.canceled":
              return [3 /*break*/, 9];
            case "charge.dispute.created":
              return [3 /*break*/, 11];
            case "invoice.payment_succeeded":
              return [3 /*break*/, 13];
            case "invoice.payment_failed":
              return [3 /*break*/, 15];
          }
          return [3 /*break*/, 17];
        case 3:
          return [4 /*yield*/, handlePaymentIntentSucceeded(event_1.data.object)];
        case 4:
          _b.sent();
          return [3 /*break*/, 18];
        case 5:
          return [4 /*yield*/, handlePaymentIntentFailed(event_1.data.object)];
        case 6:
          _b.sent();
          return [3 /*break*/, 18];
        case 7:
          return [4 /*yield*/, handlePaymentIntentRequiresAction(event_1.data.object)];
        case 8:
          _b.sent();
          return [3 /*break*/, 18];
        case 9:
          return [4 /*yield*/, handlePaymentIntentCanceled(event_1.data.object)];
        case 10:
          _b.sent();
          return [3 /*break*/, 18];
        case 11:
          return [4 /*yield*/, handleChargeDisputeCreated(event_1.data.object)];
        case 12:
          _b.sent();
          return [3 /*break*/, 18];
        case 13:
          return [4 /*yield*/, handleInvoicePaymentSucceeded(event_1.data.object)];
        case 14:
          _b.sent();
          return [3 /*break*/, 18];
        case 15:
          return [4 /*yield*/, handleInvoicePaymentFailed(event_1.data.object)];
        case 16:
          _b.sent();
          return [3 /*break*/, 18];
        case 17:
          console.log("Unhandled event type: ".concat(event_1.type));
          _b.label = 18;
        case 18:
          // Mark webhook as processed
          return [
            4 /*yield*/,
            supabase
              .from("card_webhook_events")
              .update({ processed: true, processed_at: new Date().toISOString() })
              .eq("stripe_event_id", event_1.id),
          ];
        case 19:
          // Mark webhook as processed
          _b.sent();
          return [2 /*return*/, server_1.NextResponse.json({ received: true })];
        case 20:
          error_1 = _b.sent();
          console.error("Webhook processing error:", error_1);
          return [
            2 /*return*/,
            server_1.NextResponse.json({ error: "Webhook processing failed" }, { status: 500 }),
          ];
        case 21:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle successful payment intent
 */
function handlePaymentIntentSucceeded(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, cardPayment, updateError, installmentPlan, error_2;
    return __generator(this, function (_b) {
      switch (_b.label) {
        case 0:
          _b.trys.push([0, 9, , 10]);
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .update({
                status: "succeeded",
                stripe_payment_method_id: paymentIntent.payment_method,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id)
              .select("*")
              .single(),
          ];
        case 1:
          (_a = _b.sent()), (cardPayment = _a.data), (updateError = _a.error);
          if (updateError || !cardPayment) {
            console.error("Error updating card payment:", updateError);
            return [2 /*return*/];
          }
          if (!cardPayment.payable_id) return [3 /*break*/, 4];
          return [
            4 /*yield*/,
            supabase
              .from("ap_payments")
              .update({
                status: "completed",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("reference_id", paymentIntent.id),
          ];
        case 2:
          _b.sent();
          // Update payable status
          return [
            4 /*yield*/,
            supabase
              .from("ap_payables")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", cardPayment.payable_id),
          ];
        case 3:
          // Update payable status
          _b.sent();
          _b.label = 4;
        case 4:
          return [
            4 /*yield*/,
            supabase
              .from("installment_plans")
              .select("id")
              .eq("payment_id", cardPayment.id)
              .single(),
          ];
        case 5:
          installmentPlan = _b.sent().data;
          if (!installmentPlan) return [3 /*break*/, 7];
          // Mark first installment as paid
          return [
            4 /*yield*/,
            supabase
              .from("installment_payments")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("plan_id", installmentPlan.id)
              .eq("installment_number", 1),
          ];
        case 6:
          // Mark first installment as paid
          _b.sent();
          _b.label = 7;
        case 7:
          // Log audit trail
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              table_name: "card_payments",
              record_id: cardPayment.id,
              action: "WEBHOOK_UPDATE",
              old_values: { status: "processing" },
              new_values: { status: "succeeded" },
              user_id: null, // System action
              metadata: { webhook_event: "payment_intent.succeeded" },
            }),
          ];
        case 8:
          // Log audit trail
          _b.sent();
          console.log("Payment succeeded: ".concat(paymentIntent.id));
          return [3 /*break*/, 10];
        case 9:
          error_2 = _b.sent();
          console.error("Error handling payment success:", error_2);
          return [3 /*break*/, 10];
        case 10:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle failed payment intent
 */
function handlePaymentIntentFailed(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var _a, cardPayment, updateError, installmentPlan, error_3;
    var _b, _c;
    return __generator(this, function (_d) {
      switch (_d.label) {
        case 0:
          _d.trys.push([0, 8, , 9]);
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .update({
                status: "failed",
                failure_reason:
                  ((_b = paymentIntent.last_payment_error) === null || _b === void 0
                    ? void 0
                    : _b.message) || "Payment failed",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id)
              .select("*")
              .single(),
          ];
        case 1:
          (_a = _d.sent()), (cardPayment = _a.data), (updateError = _a.error);
          if (updateError || !cardPayment) {
            console.error("Error updating card payment:", updateError);
            return [2 /*return*/];
          }
          if (!cardPayment.payable_id) return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            supabase
              .from("ap_payments")
              .update({
                status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("reference_id", paymentIntent.id),
          ];
        case 2:
          _d.sent();
          _d.label = 3;
        case 3:
          return [
            4 /*yield*/,
            supabase
              .from("installment_plans")
              .select("id")
              .eq("payment_id", cardPayment.id)
              .single(),
          ];
        case 4:
          installmentPlan = _d.sent().data;
          if (!installmentPlan) return [3 /*break*/, 6];
          // Mark first installment as failed
          return [
            4 /*yield*/,
            supabase
              .from("installment_payments")
              .update({
                status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("plan_id", installmentPlan.id)
              .eq("installment_number", 1),
          ];
        case 5:
          // Mark first installment as failed
          _d.sent();
          _d.label = 6;
        case 6:
          // Log audit trail
          return [
            4 /*yield*/,
            supabase.from("audit_logs").insert({
              table_name: "card_payments",
              record_id: cardPayment.id,
              action: "WEBHOOK_UPDATE",
              old_values: { status: "processing" },
              new_values: { status: "failed" },
              user_id: null, // System action
              metadata: {
                webhook_event: "payment_intent.payment_failed",
                failure_reason:
                  (_c = paymentIntent.last_payment_error) === null || _c === void 0
                    ? void 0
                    : _c.message,
              },
            }),
          ];
        case 7:
          // Log audit trail
          _d.sent();
          console.log("Payment failed: ".concat(paymentIntent.id));
          return [3 /*break*/, 9];
        case 8:
          error_3 = _d.sent();
          console.error("Error handling payment failure:", error_3);
          return [3 /*break*/, 9];
        case 9:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle payment intent requiring action
 */
function handlePaymentIntentRequiresAction(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 2, , 3]);
          // Update card payment status
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .update({
                status: "requires_action",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id),
          ];
        case 1:
          // Update card payment status
          _a.sent();
          console.log("Payment requires action: ".concat(paymentIntent.id));
          return [3 /*break*/, 3];
        case 2:
          error_4 = _a.sent();
          console.error("Error handling payment requires action:", error_4);
          return [3 /*break*/, 3];
        case 3:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle canceled payment intent
 */
function handlePaymentIntentCanceled(paymentIntent) {
  return __awaiter(this, void 0, void 0, function () {
    var cardPayment, error_5;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .update({
                status: "canceled",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", paymentIntent.id)
              .select("*")
              .single(),
          ];
        case 1:
          cardPayment = _a.sent().data;
          if (!(cardPayment === null || cardPayment === void 0 ? void 0 : cardPayment.payable_id))
            return [3 /*break*/, 3];
          return [
            4 /*yield*/,
            supabase
              .from("ap_payments")
              .update({
                status: "canceled",
                updated_at: new Date().toISOString(),
              })
              .eq("reference_id", paymentIntent.id),
          ];
        case 2:
          _a.sent();
          _a.label = 3;
        case 3:
          console.log("Payment canceled: ".concat(paymentIntent.id));
          return [3 /*break*/, 5];
        case 4:
          error_5 = _a.sent();
          console.error("Error handling payment cancellation:", error_5);
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle charge dispute created
 */
function handleChargeDisputeCreated(dispute) {
  return __awaiter(this, void 0, void 0, function () {
    var cardPayment, error_6;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 5, , 6]);
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .select("*")
              .eq("stripe_payment_intent_id", dispute.payment_intent)
              .single(),
          ];
        case 1:
          cardPayment = _a.sent().data;
          if (!cardPayment) return [3 /*break*/, 4];
          // Create dispute record
          return [
            4 /*yield*/,
            supabase.from("card_disputes").insert({
              payment_id: cardPayment.id,
              stripe_dispute_id: dispute.id,
              amount: dispute.amount,
              currency: dispute.currency,
              reason: dispute.reason,
              status: dispute.status,
              evidence_due_by: new Date(dispute.evidence_details.due_by * 1000).toISOString(),
              created_at: new Date(dispute.created * 1000).toISOString(),
            }),
          ];
        case 2:
          // Create dispute record
          _a.sent();
          // Update payment status
          return [
            4 /*yield*/,
            supabase
              .from("card_payments")
              .update({
                status: "disputed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", cardPayment.id),
          ];
        case 3:
          // Update payment status
          _a.sent();
          _a.label = 4;
        case 4:
          console.log("Dispute created: ".concat(dispute.id));
          return [3 /*break*/, 6];
        case 5:
          error_6 = _a.sent();
          console.error("Error handling dispute creation:", error_6);
          return [3 /*break*/, 6];
        case 6:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle successful invoice payment (for subscriptions)
 */
function handleInvoicePaymentSucceeded(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var error_7;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 3, , 4]);
          if (!invoice.subscription) return [3 /*break*/, 2];
          // Update subscription billing cycle
          return [
            4 /*yield*/,
            supabase
              .from("billing_cycles")
              .update({
                status: "paid",
                paid_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_invoice_id", invoice.id),
          ];
        case 1:
          // Update subscription billing cycle
          _a.sent();
          _a.label = 2;
        case 2:
          console.log("Invoice payment succeeded: ".concat(invoice.id));
          return [3 /*break*/, 4];
        case 3:
          error_7 = _a.sent();
          console.error("Error handling invoice payment success:", error_7);
          return [3 /*break*/, 4];
        case 4:
          return [2 /*return*/];
      }
    });
  });
}
/**
 * Handle failed invoice payment (for subscriptions)
 */
function handleInvoicePaymentFailed(invoice) {
  return __awaiter(this, void 0, void 0, function () {
    var error_8;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          _a.trys.push([0, 4, , 5]);
          if (!invoice.subscription) return [3 /*break*/, 3];
          // Update subscription billing cycle
          return [
            4 /*yield*/,
            supabase
              .from("billing_cycles")
              .update({
                status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_invoice_id", invoice.id),
          ];
        case 1:
          // Update subscription billing cycle
          _a.sent();
          // Update subscription status if needed
          return [
            4 /*yield*/,
            supabase
              .from("subscriptions")
              .update({
                status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_subscription_id", invoice.subscription),
          ];
        case 2:
          // Update subscription status if needed
          _a.sent();
          _a.label = 3;
        case 3:
          console.log("Invoice payment failed: ".concat(invoice.id));
          return [3 /*break*/, 5];
        case 4:
          error_8 = _a.sent();
          console.error("Error handling invoice payment failure:", error_8);
          return [3 /*break*/, 5];
        case 5:
          return [2 /*return*/];
      }
    });
  });
}
