/**
 * NeonPro - Subscription Billing Service
 * Story 6.1 - Task 2: Recurring Payment System
 *
 * Comprehensive subscription billing engine with flexible cycles,
 * failed payment retry logic, and prorated billing calculations.
 */

import { createClient } from '@supabase/supabase-js';
import { addDays, differenceInDays } from 'date-fns';
import Stripe from 'stripe';

// Types and Interfaces
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'BRL' | 'USD';
  billing_cycle: 'monthly' | 'quarterly' | 'annual';
  trial_days?: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  stripe_subscription_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
};

export type BillingCycle = {
  type: 'monthly' | 'quarterly' | 'annual';
  interval: number;
  interval_count: number;
};

export type PaymentRetryConfig = {
  max_attempts: number;
  retry_intervals: number[]; // in days
  escalation_enabled: boolean;
  notification_schedule: number[]; // in days
};

export type ProratedBilling = {
  original_amount: number;
  prorated_amount: number;
  days_used: number;
  days_total: number;
  proration_factor: number;
  effective_date: string;
};

export type SubscriptionMetrics = {
  total_subscriptions: number;
  active_subscriptions: number;
  churned_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate: number;
  ltv: number; // Lifetime Value
};

// Main Subscription Billing Service
export class SubscriptionBillingService {
  private readonly supabase;
  private readonly stripe: Stripe;
  private readonly retryConfig: PaymentRetryConfig;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    this.retryConfig = {
      max_attempts: 3,
      retry_intervals: [3, 7, 14], // 3 days, 1 week, 2 weeks
      escalation_enabled: true,
      notification_schedule: [1, 3, 7, 14], // notification days
    };
  }

  /**
   * Create a new subscription plan
   */
  async createSubscriptionPlan(
    planData: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>
  ): Promise<SubscriptionPlan> {
    try {
      // Create Stripe product and price
      const stripeProduct = await this.stripe.products.create({
        name: planData.name,
        description: planData.description,
        metadata: {
          features: JSON.stringify(planData.features),
        },
      });

      const stripePrice = await this.stripe.prices.create({
        product: stripeProduct.id,
        unit_amount: planData.price * 100, // Convert to cents
        currency: planData.currency.toLowerCase(),
        recurring: {
          interval: this.getBillingInterval(planData.billing_cycle),
          interval_count: this.getBillingIntervalCount(planData.billing_cycle),
        },
      });

      // Save to database
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .insert({
          ...planData,
          stripe_product_id: stripeProduct.id,
          stripe_price_id: stripePrice.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (_error) {
      throw new Error('Failed to create subscription plan');
    }
  }

  /**
   * Create a new subscription for a customer
   */
  async createSubscription(
    customerId: string,
    planId: string,
    options: {
      trial_days?: number;
      promo_code?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<Subscription> {
    try {
      // Get plan details
      const { data: plan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found');
      }

      // Get customer Stripe ID
      const { data: customer, error: customerError } = await this.supabase
        .from('customers')
        .select('stripe_customer_id')
        .eq('id', customerId)
        .single();

      if (customerError || !customer) {
        throw new Error('Customer not found');
      }

      // Calculate trial end date
      const trialEnd = options.trial_days
        ? addDays(new Date(), options.trial_days)
        : plan.trial_days
          ? addDays(new Date(), plan.trial_days)
          : undefined;

      // Create Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.create({
        customer: customer.stripe_customer_id,
        items: [{ price: plan.stripe_price_id }],
        trial_end: trialEnd ? Math.floor(trialEnd.getTime() / 1000) : undefined,
        metadata: options.metadata || {},
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic',
            },
          },
        },
      });

      // Save subscription to database
      const subscriptionData = {
        customer_id: customerId,
        plan_id: planId,
        status: stripeSubscription.status as any,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000
        ).toISOString(),
        trial_end: trialEnd?.toISOString(),
        cancel_at_period_end: false,
        stripe_subscription_id: stripeSubscription.id,
        metadata: options.metadata,
      };

      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    } catch (_error) {
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Process subscription billing cycle
   */
  async processBillingCycle(subscriptionId: string): Promise<void> {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select(
          `
          *,
          subscription_plans(*),
          customers(*)
        `
        )
        .eq('id', subscriptionId)
        .single();

      if (error || !subscription) {
        throw new Error('Subscription not found');
      }

      // Check if billing is due
      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);

      if (now < periodEnd) {
        return;
      }

      // Process payment through Stripe
      if (subscription.stripe_subscription_id) {
        const stripeSubscription = await this.stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Update local subscription with Stripe data
        await this.syncSubscriptionWithStripe(
          subscriptionId,
          stripeSubscription
        );
      }

      // Log billing event
      await this.logBillingEvent(subscriptionId, 'billing_cycle_processed', {
        period_start: subscription.current_period_start,
        period_end: subscription.current_period_end,
        amount: subscription.subscription_plans.price,
      });
    } catch (error) {
      await this.handleBillingError(subscriptionId, error as Error);
    }
  }

  /**
   * Handle failed payment with retry logic
   */
  async handleFailedPayment(
    subscriptionId: string,
    paymentIntentId: string
  ): Promise<void> {
    try {
      // Get current retry count
      const { data: retryLog, error } = await this.supabase
        .from('payment_retry_log')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('payment_intent_id', paymentIntentId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const currentAttempt = retryLog ? retryLog.attempt_count + 1 : 1;

      if (currentAttempt > this.retryConfig.max_attempts) {
        await this.handleMaxRetriesReached(subscriptionId);
        return;
      }

      // Schedule next retry
      const retryDate = addDays(
        new Date(),
        this.retryConfig.retry_intervals[currentAttempt - 1]
      );

      await this.supabase.from('payment_retry_log').insert({
        subscription_id: subscriptionId,
        payment_intent_id: paymentIntentId,
        attempt_count: currentAttempt,
        retry_date: retryDate.toISOString(),
        status: 'scheduled',
      });

      // Send notification to customer
      await this.sendPaymentFailureNotification(subscriptionId, currentAttempt);

      // Update subscription status
      await this.supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('id', subscriptionId);
    } catch (_error) {}
  }

  /**
   * Calculate prorated billing for plan changes
   */
  async calculateProratedBilling(
    subscriptionId: string,
    newPlanId: string,
    effectiveDate: Date = new Date()
  ): Promise<ProratedBilling> {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select(
          `
          *,
          subscription_plans(*)
        `
        )
        .eq('id', subscriptionId)
        .single();

      if (error || !subscription) {
        throw new Error('Subscription not found');
      }

      const { data: newPlan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .single();

      if (planError || !newPlan) {
        throw new Error('New plan not found');
      }

      const periodStart = new Date(subscription.current_period_start);
      const periodEnd = new Date(subscription.current_period_end);
      const daysTotal = differenceInDays(periodEnd, periodStart);
      const daysUsed = differenceInDays(effectiveDate, periodStart);
      const daysRemaining = daysTotal - daysUsed;

      const currentPlanDailyRate =
        subscription.subscription_plans.price / daysTotal;
      const newPlanDailyRate = newPlan.price / daysTotal;

      const refundAmount = currentPlanDailyRate * daysRemaining;
      const newPlanAmount = newPlanDailyRate * daysRemaining;
      const proratedAmount = newPlanAmount - refundAmount;

      return {
        original_amount: subscription.subscription_plans.price,
        prorated_amount: proratedAmount,
        days_used: daysUsed,
        days_total: daysTotal,
        proration_factor: daysRemaining / daysTotal,
        effective_date: effectiveDate.toISOString(),
      };
    } catch (_error) {
      throw new Error('Failed to calculate prorated billing');
    }
  }

  /**
   * Change subscription plan with proration
   */
  async changeSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string,
    options: {
      prorate?: boolean;
      effective_date?: Date;
    } = {}
  ): Promise<Subscription> {
    try {
      const effectiveDate = options.effective_date || new Date();

      // Calculate proration if enabled
      let proratedBilling: ProratedBilling | null = null;
      if (options.prorate !== false) {
        proratedBilling = await this.calculateProratedBilling(
          subscriptionId,
          newPlanId,
          effectiveDate
        );
      }

      // Get subscription and new plan
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (error || !subscription) {
        throw new Error('Subscription not found');
      }

      const { data: newPlan, error: planError } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .single();

      if (planError || !newPlan) {
        throw new Error('New plan not found');
      }

      // Update Stripe subscription
      if (subscription.stripe_subscription_id) {
        await this.stripe.subscriptions.update(
          subscription.stripe_subscription_id,
          {
            items: [
              {
                id: (
                  await this.stripe.subscriptions.retrieve(
                    subscription.stripe_subscription_id
                  )
                ).items.data[0].id,
                price: newPlan.stripe_price_id,
              },
            ],
            proration_behavior:
              options.prorate !== false ? 'create_prorations' : 'none',
          }
        );
      }

      // Update local subscription
      const { data: updatedSubscription, error: updateError } =
        await this.supabase
          .from('subscriptions')
          .update({
            plan_id: newPlanId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscriptionId)
          .select()
          .single();

      if (updateError) {
        throw updateError;
      }

      // Log plan change
      await this.logBillingEvent(subscriptionId, 'plan_changed', {
        old_plan_id: subscription.plan_id,
        new_plan_id: newPlanId,
        prorated_billing: proratedBilling,
        effective_date: effectiveDate.toISOString(),
      });

      return updatedSubscription;
    } catch (_error) {
      throw new Error('Failed to change subscription plan');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    options: {
      immediate?: boolean;
      reason?: string;
    } = {}
  ): Promise<Subscription> {
    try {
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (error || !subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      if (subscription.stripe_subscription_id) {
        if (options.immediate) {
          await this.stripe.subscriptions.cancel(
            subscription.stripe_subscription_id
          );
        } else {
          await this.stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: true }
          );
        }
      }

      // Update local subscription
      const updateData: any = {
        cancel_at_period_end: !options.immediate,
        updated_at: new Date().toISOString(),
      };

      if (options.immediate) {
        updateData.status = 'canceled';
        updateData.canceled_at = new Date().toISOString();
      }

      const { data: updatedSubscription, error: updateError } =
        await this.supabase
          .from('subscriptions')
          .update(updateData)
          .eq('id', subscriptionId)
          .select()
          .single();

      if (updateError) {
        throw updateError;
      }

      // Log cancellation
      await this.logBillingEvent(subscriptionId, 'subscription_canceled', {
        immediate: options.immediate,
        reason: options.reason,
        canceled_at: options.immediate
          ? new Date().toISOString()
          : subscription.current_period_end,
      });

      return updatedSubscription;
    } catch (_error) {
      throw new Error('Failed to cancel subscription');
    }
  }

  // Helper Methods
  private getBillingInterval(cycle: string): 'month' | 'year' {
    switch (cycle) {
      case 'monthly':
      case 'quarterly':
        return 'month';
      case 'annual':
        return 'year';
      default:
        return 'month';
    }
  }

  private getBillingIntervalCount(cycle: string): number {
    switch (cycle) {
      case 'monthly':
        return 1;
      case 'quarterly':
        return 3;
      case 'annual':
        return 1;
      default:
        return 1;
    }
  }

  private async syncSubscriptionWithStripe(
    subscriptionId: string,
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    await this.supabase
      .from('subscriptions')
      .update({
        status: stripeSubscription.status as any,
        current_period_start: new Date(
          stripeSubscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          stripeSubscription.current_period_end * 1000
        ).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId);
  }

  private async handleMaxRetriesReached(subscriptionId: string): Promise<void> {
    // Update subscription status to unpaid
    await this.supabase
      .from('subscriptions')
      .update({ status: 'unpaid' })
      .eq('id', subscriptionId);

    // Send final notice
    await this.sendFinalPaymentNotice(subscriptionId);

    // Log event
    await this.logBillingEvent(subscriptionId, 'max_retries_reached', {
      max_attempts: this.retryConfig.max_attempts,
    });
  }

  private async handleBillingError(
    subscriptionId: string,
    error: Error
  ): Promise<void> {
    await this.logBillingEvent(subscriptionId, 'billing_error', {
      error_message: error.message,
      error_stack: error.stack,
    });
  }

  private async logBillingEvent(
    subscriptionId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    await this.supabase.from('billing_events').insert({
      subscription_id: subscriptionId,
      event_type: eventType,
      event_data: data,
      created_at: new Date().toISOString(),
    });
  }

  private async sendPaymentFailureNotification(
    _subscriptionId: string,
    _attemptCount: number
  ): Promise<void> {}

  private async sendFinalPaymentNotice(
    _subscriptionId: string
  ): Promise<void> {}
}

export default SubscriptionBillingService;
