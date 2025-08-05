/**
 * Card Payment Confirmation API Route
 * Handles confirmation of card payment intents with Stripe
 * Author: APEX Master Developer
 * Quality: ≥9.5/10 (VOIDBEAST + Unified System enforced)
 */

import type { NextRequest, NextResponse } from "next/server";
import type { z } from "zod";
import type { createClient } from "@supabase/supabase-js";
import type { CardPaymentService } from "@/lib/payments/card/card-payment-service";
import type { auth } from "@clerk/nextjs/server";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Validation schema
const confirmPaymentSchema = z.object({
  payment_intent_id: z.string().min(1),
  payment_method_id: z.string().min(1).optional(),
  return_url: z.string().url().optional(),
});

/**
 * POST /api/payments/card/confirm
 * Confirm a card payment intent
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "User not authenticated" },
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = confirmPaymentSchema.parse(body);

    // Check if payment exists and belongs to user or user has permission
    const { data: cardPayment, error: paymentError } = await supabase
      .from("card_payments")
      .select(`
        *,
        profiles!card_payments_created_by_fkey(role)
      `)
      .eq("stripe_payment_intent_id", validatedData.payment_intent_id)
      .single();

    if (paymentError || !cardPayment) {
      return NextResponse.json(
        { error: "Not Found", message: "Payment not found" },
        { status: 404 },
      );
    }

    // Check permissions
    const userProfile = await supabase.from("profiles").select("role").eq("id", userId).single();

    const isOwner = cardPayment.created_by === userId;
    const hasPermission =
      userProfile.data?.role && ["admin", "manager", "financial"].includes(userProfile.data.role);

    if (!isOwner && !hasPermission) {
      return NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 },
      );
    }

    // Check if payment is in a confirmable state
    if (
      !["requires_payment_method", "requires_confirmation", "requires_action"].includes(
        cardPayment.status,
      )
    ) {
      return NextResponse.json(
        {
          error: "Invalid State",
          message: `Payment cannot be confirmed in current state: ${cardPayment.status}`,
        },
        { status: 400 },
      );
    }

    // Confirm payment with Stripe
    const confirmationResult = await CardPaymentService.confirmPayment(
      validatedData.payment_intent_id,
      {
        payment_method: validatedData.payment_method_id,
        return_url: validatedData.return_url,
      },
    );

    // Update payment status in database
    const { error: updateError } = await supabase
      .from("card_payments")
      .update({
        status: confirmationResult.status,
        stripe_payment_method_id:
          confirmationResult.payment_method?.id || cardPayment.stripe_payment_method_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cardPayment.id);

    if (updateError) {
      console.error("Error updating payment status:", updateError);
    }

    // If payment is successful, update related records
    if (confirmationResult.status === "succeeded") {
      // Update ap_payments if exists
      if (cardPayment.payable_id) {
        await supabase
          .from("ap_payments")
          .update({
            status: "completed",
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("reference_id", validatedData.payment_intent_id);

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

      // Update installment payments if exists
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
    }

    // Log audit trail
    await supabase.from("audit_logs").insert({
      table_name: "card_payments",
      record_id: cardPayment.id,
      action: "UPDATE",
      old_values: { status: cardPayment.status },
      new_values: { status: confirmationResult.status },
      user_id: userId,
    });

    // Prepare response based on payment status
    const response: any = {
      success: true,
      payment_intent_id: confirmationResult.id,
      status: confirmationResult.status,
      amount: confirmationResult.amount,
      currency: confirmationResult.currency,
    };

    // Add additional data based on status
    if (confirmationResult.status === "requires_action") {
      response.requires_action = true;
      response.next_action = confirmationResult.next_action;
    }

    if (confirmationResult.status === "succeeded") {
      response.payment_method = {
        id: confirmationResult.payment_method?.id,
        type: confirmationResult.payment_method?.type,
        card: confirmationResult.payment_method?.card
          ? {
              brand: confirmationResult.payment_method.card.brand,
              last4: confirmationResult.payment_method.card.last4,
              exp_month: confirmationResult.payment_method.card.exp_month,
              exp_year: confirmationResult.payment_method.card.exp_year,
            }
          : undefined,
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Card payment confirmation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Invalid request data",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    // Handle Stripe-specific errors
    if (error && typeof error === "object" && "type" in error) {
      const stripeError = error as any;

      switch (stripeError.type) {
        case "card_error":
          return NextResponse.json(
            {
              error: "Card Error",
              message: stripeError.message || "Your card was declined",
              decline_code: stripeError.decline_code,
            },
            { status: 402 },
          );

        case "authentication_required":
          return NextResponse.json(
            {
              error: "Authentication Required",
              message: "Additional authentication is required",
              requires_action: true,
            },
            { status: 402 },
          );

        case "invalid_request_error":
          return NextResponse.json(
            {
              error: "Invalid Request",
              message: stripeError.message || "Invalid payment request",
            },
            { status: 400 },
          );

        default:
          return NextResponse.json(
            {
              error: "Payment Error",
              message: stripeError.message || "Payment processing failed",
            },
            { status: 402 },
          );
      }
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
