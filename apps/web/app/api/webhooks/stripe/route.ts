/**
 * Stripe Webhooks Handler
 * Epic: EPIC-001 - Advanced Subscription Management
 * Story: EPIC-001.1 - Subscription Middleware & Management System
 *
 * POST /api/webhooks/stripe - Handle Stripe webhook events
 */

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!(signature && STRIPE_WEBHOOK_SECRET)) {
      console.error('Missing Stripe signature or webhook secret');
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    // TODO: Verify Stripe webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);

    // Placeholder event structure for development
    const event = JSON.parse(body);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() {
            return;
          },
          set() {},
          remove() {},
        },
      }
    );

    // Handle different Stripe events
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(supabase, event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(supabase, event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event);
        break;

      case 'invoice.created':
        await handleInvoiceCreated(supabase, event);
        break;

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(supabase: any, event: any) {
  try {
    const session = event.data.object;
    const metadata = session.metadata;

    if (!(metadata?.clinic_id && metadata?.plan_id)) {
      console.error('Missing required metadata in checkout session');
      return;
    }

    // Create or update subscription
    const subscriptionData = {
      clinic_id: metadata.clinic_id,
      user_id: metadata.user_id,
      plan_id: metadata.plan_id,
      status: 'active' as const,
      billing_cycle: metadata.billing_cycle as
        | 'monthly'
        | 'quarterly'
        | 'yearly',
      payment_provider: 'stripe',
      external_subscription_id: session.subscription,
      external_customer_id: session.customer,
      current_period_start: new Date().toISOString(),
      current_period_end: calculatePeriodEnd(metadata.billing_cycle),
      next_billing_date: calculatePeriodEnd(metadata.billing_cycle),
      metadata: {
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent,
      },
    };

    const { error } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'clinic_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error creating/updating subscription:', error);
      return;
    }

    // Create billing event
    await supabase.from('billing_events').insert({
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
        checkout_completed_at: new Date(session.created * 1000).toISOString(),
      },
    });

    console.log(`Subscription created for clinic ${metadata.clinic_id}`);
  } catch (error) {
    console.error('Error handling checkout completed:', error);
  }
}

async function handlePaymentSucceeded(supabase: any, event: any) {
  try {
    const invoice = event.data.object;

    // Find subscription by external ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('external_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      console.error(
        'Subscription not found for invoice:',
        invoice.subscription
      );
      return;
    }

    // Update subscription status
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'active',
        current_period_start: new Date(
          invoice.period_start * 1000
        ).toISOString(),
        current_period_end: new Date(invoice.period_end * 1000).toISOString(),
        next_billing_date: new Date(invoice.period_end * 1000).toISOString(),
      })
      .eq('id', subscription.id);

    // Create billing event
    await supabase.from('billing_events').insert({
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
        period_end: new Date(invoice.period_end * 1000).toISOString(),
      },
    });

    console.log(`Payment succeeded for subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(supabase: any, event: any) {
  try {
    const invoice = event.data.object;

    // Find subscription by external ID
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('external_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      console.error(
        'Subscription not found for failed payment:',
        invoice.subscription
      );
      return;
    }

    // Update subscription status to past_due
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('id', subscription.id);

    // Create billing event
    await supabase.from('billing_events').insert({
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
        failure_reason: invoice.status,
      },
    });

    console.log(`Payment failed for subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleSubscriptionCreated(_supabase: any, event: any) {
  try {
    const subscription = event.data.object;

    // Log subscription creation event
    console.log(`Stripe subscription created: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(supabase: any, event: any) {
  try {
    const subscription = event.data.object;

    // Find local subscription
    const { data: localSub } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('external_subscription_id', subscription.id)
      .single();

    if (!localSub) {
      console.error('Local subscription not found:', subscription.id);
      return;
    }

    // Update subscription status based on Stripe status
    let status = localSub.status;
    switch (subscription.status) {
      case 'active':
        status = 'active';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      case 'canceled':
        status = 'canceled';
        break;
      case 'unpaid':
        status = 'unpaid';
        break;
    }

    await supabase
      .from('user_subscriptions')
      .update({
        status,
        cancel_at_period_end: subscription.cancel_at_period_end,
        canceled_at: subscription.canceled_at
          ? new Date(subscription.canceled_at * 1000).toISOString()
          : null,
      })
      .eq('id', localSub.id);

    console.log(`Subscription updated: ${subscription.id} -> ${status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(supabase: any, event: any) {
  try {
    const subscription = event.data.object;

    // Find and cancel local subscription
    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq('external_subscription_id', subscription.id);

    if (error) {
      console.error('Error canceling subscription:', error);
      return;
    }

    console.log(`Subscription canceled: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoiceCreated(supabase: any, event: any) {
  try {
    const invoice = event.data.object;

    // Find subscription
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('external_subscription_id', invoice.subscription)
      .single();

    if (!subscription) {
      console.error(
        'Subscription not found for invoice:',
        invoice.subscription
      );
      return;
    }

    // Create billing event
    await supabase.from('billing_events').insert({
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
        period_end: new Date(invoice.period_end * 1000).toISOString(),
      },
    });

    console.log(`Invoice created for subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error handling invoice created:', error);
  }
}

function calculatePeriodEnd(billingCycle: string): string {
  const now = new Date();

  switch (billingCycle) {
    case 'monthly':
      return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      ).toISOString();
    case 'quarterly':
      return new Date(
        now.getFullYear(),
        now.getMonth() + 3,
        now.getDate()
      ).toISOString();
    case 'yearly':
      return new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      ).toISOString();
    default:
      return new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      ).toISOString();
  }
}
