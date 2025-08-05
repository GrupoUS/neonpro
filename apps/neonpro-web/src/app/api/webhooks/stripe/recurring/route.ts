// NeonPro - Stripe Recurring Payments Webhook
// Story 6.1 - Task 2: Recurring Payment System
// Webhook handler for Stripe recurring payment events

import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { recurringPaymentProcessor } from '@/lib/payments/recurring/recurring-payment-processor';
import { logger } from '@/lib/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_RECURRING!;

// POST /api/webhooks/stripe/recurring - Handle Stripe recurring payment webhooks
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      logger.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      logger.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    logger.info(`Received Stripe webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.created':
        await handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.finalized':
        await handleInvoiceFinalized(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.trial_will_end':
        await handleSubscriptionTrialWillEnd(event.data.object as Stripe.Subscription);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Error processing Stripe webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      logger.warn('Invoice payment succeeded but no subscription found');
      return;
    }

    // Find the billing event
    const { data: billingEvent } = await supabase
      .from('billing_events')
      .select('*')
      .eq('stripe_invoice_id', invoice.id)
      .single();

    if (billingEvent) {
      // Update billing event status
      await supabase
        .from('billing_events')
        .update({
          status: 'paid',
          paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
          stripe_payment_intent_id: invoice.payment_intent as string,
          updated_at: new Date().toISOString()
        })
        .eq('id', billingEvent.id);

      // Update subscription status if needed
      await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date(invoice.period_start * 1000).toISOString(),
          current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', invoice.subscription);

      logger.info(`Invoice payment succeeded: ${invoice.id}`);
    }
  } catch (error) {
    logger.error('Error handling invoice payment succeeded:', error);
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      logger.warn('Invoice payment failed but no subscription found');
      return;
    }

    // Find the billing event
    const { data: billingEvent } = await supabase
      .from('billing_events')
      .select('*')
      .eq('stripe_invoice_id', invoice.id)
      .single();

    if (billingEvent) {
      // Update billing event status
      await supabase
        .from('billing_events')
        .update({
          status: 'payment_failed',
          failure_reason: invoice.last_finalization_error?.message || 'Payment failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', billingEvent.id);

      // Schedule retry if within limits
      await recurringPaymentProcessor.schedulePaymentRetry(billingEvent.id);

      logger.info(`Invoice payment failed: ${invoice.id}`);
    }
  } catch (error) {
    logger.error('Error handling invoice payment failed:', error);
  }
}

// Handle invoice creation
async function handleInvoiceCreated(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      logger.warn('Invoice created but no subscription found');
      return;
    }

    // Find the subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', invoice.subscription)
      .single();

    if (subscription) {
      // Create billing event
      await supabase
        .from('billing_events')
        .insert({
          subscription_id: subscription.id,
          amount: invoice.amount_due / 100, // Convert from cents
          currency: invoice.currency,
          status: 'pending',
          billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
          billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
          stripe_invoice_id: invoice.id,
          metadata: {
            invoice_number: invoice.number,
            hosted_invoice_url: invoice.hosted_invoice_url,
            invoice_pdf: invoice.invoice_pdf
          }
        });

      logger.info(`Invoice created: ${invoice.id}`);
    }
  } catch (error) {
    logger.error('Error handling invoice created:', error);
  }
}

// Handle invoice finalization
async function handleInvoiceFinalized(invoice: Stripe.Invoice) {
  try {
    // Update billing event with finalized invoice details
    await supabase
      .from('billing_events')
      .update({
        status: 'finalized',
        metadata: {
          invoice_number: invoice.number,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf: invoice.invoice_pdf,
          due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null
        },
        updated_at: new Date().toISOString()
      })
      .eq('stripe_invoice_id', invoice.id);

    logger.info(`Invoice finalized: ${invoice.id}`);
  } catch (error) {
    logger.error('Error handling invoice finalized:', error);
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    // Update subscription with Stripe details
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    logger.info(`Subscription created: ${subscription.id}`);
  } catch (error) {
    logger.error('Error handling subscription created:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    // Update subscription with new details
    await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    logger.info(`Subscription updated: ${subscription.id}`);
  } catch (error) {
    logger.error('Error handling subscription updated:', error);
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    // Update subscription status to cancelled
    await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id);

    logger.info(`Subscription deleted: ${subscription.id}`);
  } catch (error) {
    logger.error('Error handling subscription deleted:', error);
  }
}

// Handle subscription trial ending soon
async function handleSubscriptionTrialWillEnd(subscription: Stripe.Subscription) {
  try {
    // Find the subscription
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (subscriptionData) {
      // Send trial ending notification
      // This would integrate with your notification system
      logger.info(`Trial will end for subscription: ${subscription.id}`);
      
      // You can add email notification logic here
      // await sendTrialEndingNotification(subscriptionData);
    }
  } catch (error) {
    logger.error('Error handling subscription trial will end:', error);
  }
}

// Handle successful payment intent
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update any related billing events
    await supabase
      .from('billing_events')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment intent succeeded:', error);
  }
}

// Handle failed payment intent
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Update any related billing events
    await supabase
      .from('billing_events')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    logger.info(`Payment intent failed: ${paymentIntent.id}`);
  } catch (error) {
    logger.error('Error handling payment intent failed:', error);
  }
}

