/**
 * Subscription Billing Processor - Supabase Edge Function
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * This Edge Function processes subscription billing cycles, handles renewals,
 * and manages subscription status updates.
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Database {
  public: {
    Tables: {
      user_subscriptions: {
        Row: {
          id: string;
          clinic_id: string;
          user_id: string;
          plan_id: string;
          status:
            | "trial"
            | "active"
            | "past_due"
            | "canceled"
            | "unpaid"
            | "paused";
          current_period_start: string;
          current_period_end: string;
          trial_end: string;
          billing_cycle: "monthly" | "quarterly" | "yearly";
          next_billing_date: string;
          payment_provider: string;
          external_subscription_id: string;
          cancel_at_period_end: boolean;
          canceled_at: string;
          metadata: unknown;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          price_monthly: number;
          price_quarterly: number;
          price_yearly: number;
        };
      };
      billing_events: {
        Row: {
          id: string;
          subscription_id: string;
          event_type: string;
          amount: number;
          currency: string;
          status: string;
          metadata: unknown;
        };
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient<Database>(supabaseUrl, supabaseKey); // Process trial expirations
    await processTrialExpirations(supabase);

    // Process billing renewals
    await processBillingRenewals(supabase);

    // Process subscription cancellations
    await processSubscriptionCancellations(supabase);

    // Process failed payment retries
    await processFailedPaymentRetries(supabase);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription billing processing completed",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Billing processing failed",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function processTrialExpirations(supabase: unknown) {
  try {
    const now = new Date().toISOString();

    // Find expired trials
    const { data: expiredTrials, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("status", "trial")
      .lt("trial_end", now);
    if (error) {
      return;
    }

    for (const subscription of expiredTrials || []) {
      try {
        // Update subscription status to unpaid
        await supabase
          .from("user_subscriptions")
          .update({
            status: "unpaid",
            updated_at: now,
          })
          .eq("id", subscription.id);

        // Create billing event
        await supabase.from("billing_events").insert({
          subscription_id: subscription.id,
          event_type: "trial_expired",
          amount: 0,
          currency: "BRL",
          status: "processed",
          processed_at: now,
          metadata: {
            trial_end: subscription.trial_end,
            processed_by: "billing-processor",
          },
        });
      } catch {}
    }
  } catch {}
}
async function processBillingRenewals(supabase: unknown) {
  try {
    const now = new Date();
    const renewalWindow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours ahead

    // Find subscriptions due for renewal
    const { data: renewalDue, error } = await supabase
      .from("user_subscriptions")
      .select(
        `
        *,
        plan:subscription_plans(*)
      `,
      )
      .eq("status", "active")
      .lt("next_billing_date", renewalWindow.toISOString())
      .gt("next_billing_date", now.toISOString());

    if (error) {
      return;
    }

    for (const subscription of renewalDue || []) {
      try {
        // Calculate next billing period
        const currentPeriodEnd = new Date(subscription.current_period_end);
        const nextPeriodStart = currentPeriodEnd;
        const nextPeriodEnd = calculateNextPeriodEnd(
          nextPeriodStart,
          subscription.billing_cycle,
        );
        const nextBillingDate = nextPeriodEnd; // Get plan price for current billing cycle
        const { plan: plan } = subscription;
        let amount = 0;

        switch (subscription.billing_cycle) {
          case "monthly": {
            amount = plan.price_monthly;
            break;
          }
          case "quarterly": {
            amount = plan.price_quarterly;
            break;
          }
          case "yearly": {
            amount = plan.price_yearly;
            break;
          }
        }

        // Update subscription for next period
        await supabase
          .from("user_subscriptions")
          .update({
            current_period_start: nextPeriodStart.toISOString(),
            current_period_end: nextPeriodEnd.toISOString(),
            next_billing_date: nextBillingDate.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("id", subscription.id);

        // Create billing event for renewal
        await supabase.from("billing_events").insert({
          subscription_id: subscription.id,
          event_type: "subscription_renewed",
          amount,
          currency: "BRL",
          status: "pending",
          metadata: {
            billing_cycle: subscription.billing_cycle,
            period_start: nextPeriodStart.toISOString(),
            period_end: nextPeriodEnd.toISOString(),
            processed_by: "billing-processor",
          },
        });
      } catch {}
    }
  } catch {}
}
async function processSubscriptionCancellations(supabase: unknown) {
  try {
    const now = new Date().toISOString();

    // Find subscriptions to cancel at period end
    const { data: toCancelSubs, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("cancel_at_period_end", true)
      .in("status", ["active", "trial"])
      .lt("current_period_end", now);

    if (error) {
      return;
    }

    for (const subscription of toCancelSubs || []) {
      try {
        // Cancel subscription
        await supabase
          .from("user_subscriptions")
          .update({
            status: "canceled",
            canceled_at: now,
            updated_at: now,
          })
          .eq("id", subscription.id);

        // Create billing event
        await supabase.from("billing_events").insert({
          subscription_id: subscription.id,
          event_type: "subscription_canceled",
          amount: 0,
          currency: "BRL",
          status: "processed",
          processed_at: now,
          metadata: {
            cancellation_reason: subscription.cancellation_reason,
            period_end: subscription.current_period_end,
            processed_by: "billing-processor",
          },
        });
      } catch {}
    }
  } catch {}
}
async function processFailedPaymentRetries(supabase: unknown) {
  try {
    const now = new Date();
    const retryWindow = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    // Find failed payments to retry
    const { data: failedPayments, error } = await supabase
      .from("billing_events")
      .select("*")
      .eq("status", "failed")
      .eq("event_type", "invoice_payment_failed")
      .lt("processing_attempts", 3)
      .gt("created_at", retryWindow.toISOString());

    if (error) {
      return;
    }

    for (const payment of failedPayments || []) {
      try {
        // Update attempt count
        await supabase
          .from("billing_events")
          .update({
            processing_attempts: payment.processing_attempts + 1,
            last_processing_error: undefined,
            updated_at: now.toISOString(),
          })
          .eq("id", payment.id);
      } catch (error) {
        // Update error information
        await supabase
          .from("billing_events")
          .update({
            last_processing_error: error.message,
            updated_at: now.toISOString(),
          })
          .eq("id", payment.id);
      }
    }
  } catch {}
}

function calculateNextPeriodEnd(periodStart: Date, billingCycle: string): Date {
  const nextPeriodEnd = new Date(periodStart);

  switch (billingCycle) {
    case "monthly": {
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
      break;
    }
    case "quarterly": {
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 3);
      break;
    }
    case "yearly": {
      nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
      break;
    }
  }

  return nextPeriodEnd;
}
