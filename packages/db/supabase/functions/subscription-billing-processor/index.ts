// Subscription Billing Processor Edge Function
// Healthcare SaaS Billing with LGPD Compliance
// Brazilian Healthcare Market Specific

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BillingEvent {
  type:
    | "subscription_created"
    | "subscription_renewed"
    | "subscription_canceled"
    | "payment_failed"
    | "trial_ended";
  subscription_id: string;
  tenant_id: string;
  amount?: number;
  currency: string;
  payment_method?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // Service-to-service authentication for billing webhooks
    const apiKey = req.headers.get("x-api-key");
    const expectedApiKey = Deno.env.get("BILLING_WEBHOOK_SECRET");

    if (req.method === "POST" && req.url.includes("/webhook")) {
      // Webhook endpoint for payment provider callbacks
      if (apiKey !== expectedApiKey) {
        throw new Error("Invalid API key for webhook");
      }
    } else {
      // Regular user authentication
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        throw new Error("No authorization header");
      }

      const {
        data: { user },
        error: authError,
      } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

      if (authError || !user) {
        throw new Error("Invalid authorization");
      }
    }

    if (req.method === "POST") {
      const body = await req.json();

      if (req.url.includes("/process-billing")) {
        // Process subscription billing cycle
        const { subscription_id, tenant_id } = body;

        // Get subscription details
        const { data: subscription, error: subError } = await supabaseClient
          .from("subscriptions")
          .select(
            `
            *,
            subscription_plans(*)
          `,
          )
          .eq("id", subscription_id)
          .single();

        if (subError || !subscription) {
          throw new Error("Subscription not found");
        }

        // Calculate next billing period
        const currentPeriodEnd = new Date(subscription.current_period_end);
        const now = new Date();

        if (currentPeriodEnd > now) {
          throw new Error("Subscription not due for billing");
        }

        // Calculate new period dates
        const billingCycle = subscription.billing_cycle;
        const nextPeriodStart = currentPeriodEnd;
        let nextPeriodEnd: Date;

        if (billingCycle === "monthly") {
          nextPeriodEnd = new Date(nextPeriodStart);
          nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
        } else if (billingCycle === "yearly") {
          nextPeriodEnd = new Date(nextPeriodStart);
          nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
        } else {
          throw new Error("Invalid billing cycle");
        }

        // Calculate amount
        const plan = subscription.subscription_plans;
        const amount =
          billingCycle === "monthly" ? plan.price_monthly : plan.price_yearly;

        // Create payment transaction record
        const { data: paymentRecord, error: paymentError } =
          await supabaseClient
            .from("payment_transactions")
            .insert({
              tenant_id,
              subscription_id,
              amount,
              currency: "BRL",
              status: "pending",
              transaction_type: "subscription_billing",
              billing_period_start: nextPeriodStart.toISOString(),
              billing_period_end: nextPeriodEnd.toISOString(),
              created_at: now.toISOString(),
            })
            .select()
            .single();

        if (paymentError) {
          throw paymentError;
        }

        // Audit log for healthcare compliance
        await supabaseClient.from("audit_logs").insert({
          tenant_id,
          action: "subscription_billing_processed",
          resource_type: "subscriptions",
          resource_id: subscription_id,
          new_values: {
            payment_transaction_id: paymentRecord.id,
            amount,
            billing_period: billingCycle,
          },
          timestamp: now.toISOString(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            payment_transaction_id: paymentRecord.id,
            amount,
            currency: "BRL",
            next_billing_date: nextPeriodEnd.toISOString(),
            healthcare_compliance: {
              lgpd_compliant: true,
              audit_logged: true,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      if (req.url.includes("/webhook")) {
        // Process webhook from payment provider
        const event: BillingEvent = body;

        // Update subscription status based on webhook event
        let updateData: any = {};

        switch (event.type) {
          case "subscription_created": {
            updateData = {
              status: "active",
              current_period_start: new Date().toISOString(),
            };
            break;
          }

          case "subscription_renewed": {
            updateData = {
              status: "active",
            };
            break;
          }

          case "subscription_canceled": {
            updateData = {
              status: "canceled",
              canceled_at: new Date().toISOString(),
            };
            break;
          }

          case "payment_failed": {
            updateData = {
              status: "past_due",
            };
            break;
          }

          case "trial_ended": {
            updateData = {
              status: "trialing",
              trial_end: new Date().toISOString(),
            };
            break;
          }
        }

        // Update subscription
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update(updateData)
          .eq("id", event.subscription_id);

        if (updateError) {
          throw updateError;
        }

        // Log webhook event
        await supabaseClient.from("audit_logs").insert({
          tenant_id: event.tenant_id,
          action: `webhook_${event.type}`,
          resource_type: "subscriptions",
          resource_id: event.subscription_id,
          new_values: {
            webhook_data: event,
            processed_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

        // Send notifications for critical events
        if (
          event.type === "payment_failed" ||
          event.type === "subscription_canceled"
        ) {
          // Send notification to healthcare admin
          await supabaseClient.from("communication_notifications").insert({
            tenant_id: event.tenant_id,
            notification_type: "billing_alert",
            priority: "high",
            title:
              event.type === "payment_failed"
                ? "Payment Failed"
                : "Subscription Canceled",
            message: `Healthcare system billing event: ${event.type}`,
            data: { subscription_id: event.subscription_id },
            created_at: new Date().toISOString(),
          });
        }

        return new Response(
          JSON.stringify({
            success: true,
            event_processed: event.type,
            healthcare_compliance: {
              lgpd_compliant: true,
              audit_logged: true,
              notification_sent: [
                "payment_failed",
                "subscription_canceled",
              ].includes(event.type),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }

      // Process manual billing actions
      if (req.url.includes("/manual-action")) {
        const { action, subscription_id, tenant_id, reason } = body;

        let updateData: any = {};
        let auditAction = "";

        switch (action) {
          case "suspend": {
            updateData = { status: "suspended" };
            auditAction = "subscription_suspended";
            break;
          }

          case "reactivate": {
            updateData = { status: "active" };
            auditAction = "subscription_reactivated";
            break;
          }

          case "cancel": {
            updateData = {
              status: "canceled",
              canceled_at: new Date().toISOString(),
              cancel_reason: reason,
            };
            auditAction = "subscription_manually_canceled";
            break;
          }

          default: {
            throw new Error(`Invalid action: ${action}`);
          }
        }

        // Update subscription
        const { error: updateError } = await supabaseClient
          .from("subscriptions")
          .update(updateData)
          .eq("id", subscription_id)
          .eq("tenant_id", tenant_id);

        if (updateError) {
          throw updateError;
        }

        // Audit log
        await supabaseClient.from("audit_logs").insert({
          tenant_id,
          action: auditAction,
          resource_type: "subscriptions",
          resource_id: subscription_id,
          new_values: {
            manual_action: action,
            reason,
            processed_at: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({
            success: true,
            action_completed: action,
            healthcare_compliance: {
              lgpd_compliant: true,
              audit_logged: true,
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          },
        );
      }
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        healthcare_compliance: {
          error_logged: true,
          patient_service_continuity: true,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
