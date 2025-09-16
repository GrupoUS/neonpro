/**
 * Stripe Webhooks API Route for NeonPro
 * Handles Stripe subscription lifecycle events
 */

import { supabase } from '@neonpro/database';
import { Hono } from 'hono';

const app = new Hono();

// Stripe webhook endpoint
app.post('/stripe/webhook', async c => {
  try {
    const body = await c.req.text();
    const signature = c.req.header('stripe-signature');

    if (!signature) {
      return c.json({ error: 'Missing Stripe signature' }, 400);
    }

    // Parse the webhook event
    let event;
    try {
      event = JSON.parse(body);
    } catch (err) {
      console.error('Invalid JSON in webhook body:', err);
      return c.json({ error: 'Invalid JSON' }, 400);
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the webhook event
    const result = await handleStripeWebhook(event);

    if (result.success) {
      return c.json({ received: true, message: result.message });
    } else {
      console.error('Webhook processing failed:', result.message);
      return c.json({ error: result.message }, 500);
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * Handle Stripe webhook events
 */
async function handleStripeWebhook(event: any): Promise<{ success: boolean; message: string }> {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        return await handleSubscriptionCreated(event.data.object);

      case 'customer.subscription.updated':
        return await handleSubscriptionUpdated(event.data.object);

      case 'customer.subscription.deleted':
        return await handleSubscriptionDeleted(event.data.object);

      case 'invoice.payment_succeeded':
        return await handlePaymentSucceeded(event.data.object);

      case 'invoice.payment_failed':
        return await handlePaymentFailed(event.data.object);

      case 'customer.subscription.trial_will_end':
        return await handleTrialWillEnd(event.data.object);

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        return { success: true, message: `Ignored event type: ${event.type}` };
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return { success: false, message: `Error processing webhook: ${error}` };
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(
  subscription: any,
): Promise<{ success: boolean; message: string }> {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const planId = subscription.items.data[0]?.price?.id || 'unknown';

  // Find user by Stripe customer ID
  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Create subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      customer_id: user.id,
      subscription_code: subscriptionId,
      plan_id: planId,
      status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      clinic_id: user.id, // Assuming user ID is clinic ID
      amount: 9900, // R$ 99.00 in cents
      currency: 'BRL',
    }, {
      onConflict: 'subscription_code',
    });

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_status: status === 'active' ? 'pro' : status === 'trialing' ? 'trial' : 'free',
    })
    .eq('id', user.id);

  if (!subError && !profileError) {
    console.log(`Subscription created for user ${user.id}: ${subscriptionId}`);
    return { success: true, message: `Subscription created successfully` };
  } else {
    console.error('Database errors:', { subError, profileError });
    return { success: false, message: `Failed to update subscription records` };
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(
  subscription: any,
): Promise<{ success: boolean; message: string }> {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
  const planId = subscription.items.data[0]?.price?.id || 'unknown';

  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
      plan_id: planId,
    })
    .eq('subscription_code', subscriptionId);

  // Determine user subscription status
  let userStatus = 'free';
  if (status === 'active') {
    userStatus = 'pro';
  } else if (status === 'trialing') {
    userStatus = 'trial';
  } else if (status === 'canceled' || status === 'cancelled') {
    userStatus = 'cancelled';
  } else if (status === 'past_due' || status === 'unpaid') {
    userStatus = 'expired';
  }

  // Update user profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_plan: planId,
      subscription_status: userStatus,
    })
    .eq('id', user.id);

  if (!subError && !profileError) {
    console.log(`Subscription updated for user ${user.id}: ${subscriptionId} -> ${status}`);
    return { success: true, message: `Subscription updated successfully` };
  } else {
    console.error('Database errors:', { subError, profileError });
    return { success: false, message: `Failed to update subscription records` };
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(
  subscription: any,
): Promise<{ success: boolean; message: string }> {
  const customerId = subscription.customer;
  const subscriptionId = subscription.id;

  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('subscription_code', subscriptionId);

  // Update user profile to free tier
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      subscription_plan: null,
      subscription_status: 'cancelled',
    })
    .eq('id', user.id);

  if (!subError && !profileError) {
    console.log(`Subscription cancelled for user ${user.id}: ${subscriptionId}`);
    return { success: true, message: `Subscription cancelled successfully` };
  } else {
    console.error('Database errors:', { subError, profileError });
    return { success: false, message: `Failed to cancel subscription` };
  }
}

/**
 * Handle payment succeeded event
 */
async function handlePaymentSucceeded(
  invoice: any,
): Promise<{ success: boolean; message: string }> {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    return { success: true, message: 'No subscription associated with invoice' };
  }

  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Ensure user is marked as active pro user
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'pro' })
    .eq('id', user.id);

  if (!error) {
    console.log(`Payment succeeded for user ${user.id}, subscription: ${subscriptionId}`);
    return { success: true, message: `Payment processed successfully` };
  } else {
    console.error('Database error:', error);
    return { success: false, message: `Failed to update user after payment` };
  }
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(invoice: any): Promise<{ success: boolean; message: string }> {
  const customerId = invoice.customer;
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) {
    return { success: true, message: 'No subscription associated with invoice' };
  }

  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Mark subscription as expired due to payment failure
  const { error } = await supabase
    .from('profiles')
    .update({ subscription_status: 'expired' })
    .eq('id', user.id);

  if (!error) {
    console.log(`Payment failed for user ${user.id}, subscription: ${subscriptionId}`);
    return { success: true, message: `Payment failure processed` };
  } else {
    console.error('Database error:', error);
    return { success: false, message: `Failed to update user after payment failure` };
  }
}

/**
 * Handle trial will end event
 */
async function handleTrialWillEnd(
  subscription: any,
): Promise<{ success: boolean; message: string }> {
  const customerId = subscription.customer;
  const trialEnd = new Date(subscription.trial_end * 1000);

  const user = await findUserByStripeCustomer(customerId);
  if (!user) {
    return { success: false, message: `User not found for customer: ${customerId}` };
  }

  // Update trial end date
  const { error } = await supabase
    .from('profiles')
    .update({ trial_ends_at: trialEnd.toISOString() })
    .eq('id', user.id);

  if (!error) {
    console.log(`Trial ending soon for user ${user.id}, ends: ${trialEnd}`);
    return { success: true, message: `Trial end notification processed` };
  } else {
    console.error('Database error:', error);
    return { success: false, message: `Failed to update trial end date` };
  }
}

/**
 * Find user by Stripe customer ID
 */
async function findUserByStripeCustomer(
  customerId: string,
): Promise<{ id: string; email: string } | null> {
  try {
    // Try to find by customer ID in subscriptions table
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('customer_id')
      .eq('customer_id', customerId)
      .single();

    if (subscription) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', subscription.customer_id)
        .single();

      if (profile) {
        return { id: profile.id, email: profile.email };
      }
    }

    // If not found in subscriptions, try to find by email match
    // This would require additional logic to match Stripe customer email with user email

    return null;
  } catch (error) {
    console.error('Error finding user by Stripe customer:', error);
    return null;
  }
}

export default app;
