/**
 * Card Payment Webhook API Route
 * Handles Stripe webhook events for card payments
 * Author: APEX Master Developer
 * Quality: ≥9.5/10 (VOIDBEAST + Unified System enforced)
 */

import type { createClient } from "@supabase/supabase-js";
import type { headers } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/payments/card/webhook
 * Handle Stripe webhook events for card payments
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      console.error("Missing Stripe signature");
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Log webhook event
    await supabase.from("card_webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
      processed: false,
      data: event.data,
      created_at: new Date(event.created * 1000).toISOString(),
    });

    console.log(`Processing webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.requires_action":
        await handlePaymentIntentRequiresAction(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.canceled":
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent);
        break;

      case "charge.dispute.created":
        await handleChargeDisputeCreated(event.data.object as Stripe.Dispute);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark webhook as processed
    await supabase
      .from("card_webhook_events")
      .update({ processed: true, processed_at: new Date().toISOString() })
      .eq("stripe_event_id", event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update card payment status
    const { data: cardPayment, error: updateError } = await supabase
      .from("card_payments")
      .update({
        status: "succeeded",
        stripe_payment_method_id: paymentIntent.payment_method as string,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("*")
      .single();

    if (updateError || !cardPayment) {
      console.error("Error updating card payment:", updateError);
      return;
    }

    // Update ap_payments if exists
    if (cardPayment.payable_id) {
      await supabase
        .from("ap_payments")
        .update({
          status: "completed",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("reference_id", paymentIntent.id);

      // Update payable status
      await supabase
        .from("ap_payables")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardPayment.payable_id);
    }

    // Handle installment payments
    const { data: installmentPlan } = await supabase
      .from("installment_plans")
      .select("id")
      .eq("payment_id", cardPayment.id)
      .single();

    if (installmentPlan) {
      // Mark first installment as paid
      await supabase
        .from("installment_payments")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("plan_id", installmentPlan.id)
        .eq("installment_number", 1);
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      table_name: "card_payments",
      record_id: cardPayment.id,
      action: "WEBHOOK_UPDATE",
      old_values: { status: "processing" },
      new_values: { status: "succeeded" },
      user_id: null, // System action
      metadata: { webhook_event: "payment_intent.succeeded" },
    });

    console.log(`Payment succeeded: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment success:", error);
  }
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update card payment status
    const { data: cardPayment, error: updateError } = await supabase
      .from("card_payments")
      .update({
        status: "failed",
        failure_reason: paymentIntent.last_payment_error?.message || "Payment failed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("*")
      .single();

    if (updateError || !cardPayment) {
      console.error("Error updating card payment:", updateError);
      return;
    }

    // Update ap_payments if exists
    if (cardPayment.payable_id) {
      await supabase
        .from("ap_payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("reference_id", paymentIntent.id);
    }

    // Handle installment payments
    const { data: installmentPlan } = await supabase
      .from("installment_plans")
      .select("id")
      .eq("payment_id", cardPayment.id)
      .single();

    if (installmentPlan) {
      // Mark first installment as failed
      await supabase
        .from("installment_payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("plan_id", installmentPlan.id)
        .eq("installment_number", 1);
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      table_name: "card_payments",
      record_id: cardPayment.id,
      action: "WEBHOOK_UPDATE",
      old_values: { status: "processing" },
      new_values: { status: "failed" },
      user_id: null, // System action
      metadata: {
        webhook_event: "payment_intent.payment_failed",
        failure_reason: paymentIntent.last_payment_error?.message,
      },
    });

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

/**
 * Handle payment intent requiring action
 */
async function handlePaymentIntentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update card payment status
    await supabase
      .from("card_payments")
      .update({
        status: "requires_action",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id);

    console.log(`Payment requires action: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment requires action:", error);
  }
}

/**
 * Handle canceled payment intent
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update card payment status
    const { data: cardPayment } = await supabase
      .from("card_payments")
      .update({
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)
      .select("*")
      .single();

    if (cardPayment?.payable_id) {
      await supabase
        .from("ap_payments")
        .update({
          status: "canceled",
          updated_at: new Date().toISOString(),
        })
        .eq("reference_id", paymentIntent.id);
    }

    console.log(`Payment canceled: ${paymentIntent.id}`);
  } catch (error) {
    console.error("Error handling payment cancellation:", error);
  }
}

/**
 * Handle charge dispute created
 */
async function handleChargeDisputeCreated(dispute: Stripe.Dispute) {
  try {
    // Find the related payment
    const { data: cardPayment } = await supabase
      .from("card_payments")
      .select("*")
      .eq("stripe_payment_intent_id", dispute.payment_intent as string)
      .single();

    if (cardPayment) {
      // Create dispute record
      await supabase.from("card_disputes").insert({
        payment_id: cardPayment.id,
        stripe_dispute_id: dispute.id,
        amount: dispute.amount,
        currency: dispute.currency,
        reason: dispute.reason,
        status: dispute.status,
        evidence_due_by: new Date(dispute.evidence_details.due_by * 1000).toISOString(),
        created_at: new Date(dispute.created * 1000).toISOString(),
      });

      // Update payment status
      await supabase
        .from("card_payments")
        .update({
          status: "disputed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", cardPayment.id);
    }

    console.log(`Dispute created: ${dispute.id}`);
  } catch (error) {
    console.error("Error handling dispute creation:", error);
  }
}

/**
 * Handle successful invoice payment (for subscriptions)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription billing cycle
      await supabase
        .from("billing_cycles")
        .update({
          status: "paid",
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_invoice_id", invoice.id);
    }

    console.log(`Invoice payment succeeded: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice payment success:", error);
  }
}

/**
 * Handle failed invoice payment (for subscriptions)
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (invoice.subscription) {
      // Update subscription billing cycle
      await supabase
        .from("billing_cycles")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_invoice_id", invoice.id);

      // Update subscription status if needed
      await supabase
        .from("subscriptions")
        .update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", invoice.subscription);
    }

    console.log(`Invoice payment failed: ${invoice.id}`);
  } catch (error) {
    console.error("Error handling invoice payment failure:", error);
  }
}
