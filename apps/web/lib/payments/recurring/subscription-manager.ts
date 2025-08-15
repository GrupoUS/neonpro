// NeonPro - Subscription Manager Service
// Story 6.1 - Task 2: Recurring Payment System
// Comprehensive subscription lifecycle management

import { createClient } from '@supabase/supabase-js';
import { addDays, addMonths, addYears } from 'date-fns';
import Stripe from 'stripe';
import { sendNotification } from '@/lib/notifications/notification-service';
import { logger } from '@/lib/utils/logger';
import { PaymentProcessor } from '../payment-processor';

// Types and Interfaces
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billing_cycle: 'monthly' | 'quarterly' | 'annual';
  trial_days: number;
  features: string[];
  is_active: boolean;
  stripe_product_id?: string;
  stripe_price_id?: string;
  metadata?: Record<string, any>;
}

export interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status:
    | 'active'
    | 'past_due'
    | 'canceled'
    | 'unpaid'
    | 'trialing'
    | 'incomplete';
  current_period_start: Date;
  current_period_end: Date;
  trial_start?: Date;
  trial_end?: Date;
  cancel_at_period_end: boolean;
  canceled_at?: Date;
  stripe_subscription_id?: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionUsage {
  id: string;
  subscription_id: string;
  usage_type: string;
  usage_count: number;
  usage_limit?: number;
  period_start: Date;
  period_end: Date;
}

export interface BillingEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  event_data: Record<string, any>;
  created_at: Date;
}

export interface ProrationCalculation {
  id: string;
  subscription_id: string;
  old_plan_id?: string;
  new_plan_id?: string;
  original_amount: number;
  prorated_amount: number;
  days_used: number;
  days_total: number;
  proration_factor: number;
  effective_date: Date;
}

export interface SubscriptionMetrics {
  total_subscriptions: number;
  active_subscriptions: number;
  churned_subscriptions: number;
  trial_subscriptions: number;
  past_due_subscriptions: number;
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  churn_rate_30d: number;
}

export interface CreateSubscriptionParams {
  customer_id: string;
  plan_id: string;
  payment_method_id?: string;
  trial_days?: number;
  metadata?: Record<string, any>;
  proration_behavior?: 'create_prorations' | 'none';
}

export interface UpdateSubscriptionParams {
  plan_id?: string;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, any>;
  proration_behavior?: 'create_prorations' | 'none' | 'always_invoice';
}

export interface PaymentRetryConfig {
  max_attempts: number;
  retry_intervals: number[]; // in hours
  notification_triggers: number[]; // attempt numbers to send notifications
}

// Main Subscription Manager Class
export class SubscriptionManager {
  private readonly supabase: any;
  private readonly stripe: Stripe;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    this.paymentProcessor = new PaymentProcessor();

    this.retryConfig = {
      max_attempts: 4,
      retry_intervals: [24, 72, 168], // 1 day, 3 days, 7 days
      notification_triggers: [1, 2, 4], // Send notifications on attempts 1, 2, and 4
    };
  }

  // Subscription Plans Management
  async getSubscriptionPlans(activeOnly = true): Promise<SubscriptionPlan[]> {
    try {
      let query = this.supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching subscription plans:', error);
        throw new Error(`Failed to fetch subscription plans: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSubscriptionPlans:', error);
      throw error;
    }
  }

  async getSubscriptionPlan(planId: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching subscription plan:', error);
        throw new Error(`Failed to fetch subscription plan: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error in getSubscriptionPlan:', error);
      throw error;
    }
  }

  // Subscription Lifecycle Management
  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<Subscription> {
    try {
      const plan = await this.getSubscriptionPlan(params.plan_id);
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Calculate trial and billing periods
      const now = new Date();
      const trialDays = params.trial_days ?? plan.trial_days;
      const trialStart = trialDays > 0 ? now : undefined;
      const trialEnd = trialDays > 0 ? addDays(now, trialDays) : undefined;

      const periodStart = trialEnd || now;
      const periodEnd = this.calculateNextBillingDate(
        periodStart,
        plan.billing_cycle
      );

      // Create Stripe subscription if payment method provided
      let stripeSubscriptionId: string | undefined;
      if (params.payment_method_id && plan.stripe_price_id) {
        const stripeSubscription = await this.createStripeSubscription({
          customer_id: params.customer_id,
          price_id: plan.stripe_price_id,
          payment_method_id: params.payment_method_id,
          trial_end: trialEnd,
          metadata: params.metadata,
        });
        stripeSubscriptionId = stripeSubscription.id;
      }

      // Create subscription in database
      const subscriptionData = {
        customer_id: params.customer_id,
        plan_id: params.plan_id,
        status: trialDays > 0 ? 'trialing' : 'active',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        trial_start: trialStart?.toISOString(),
        trial_end: trialEnd?.toISOString(),
        cancel_at_period_end: false,
        stripe_subscription_id: stripeSubscriptionId,
        metadata: params.metadata || {},
      };

      const { data, error } = await this.supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        logger.error('Error creating subscription:', error);
        throw new Error(`Failed to create subscription: ${error.message}`);
      }

      // Initialize usage tracking
      await this.initializeUsageTracking(data.id, plan);

      // Log billing event
      await this.logBillingEvent(data.id, 'subscription_created', {
        plan_id: params.plan_id,
        trial_days: trialDays,
        stripe_subscription_id: stripeSubscriptionId,
      });

      // Send welcome notification
      await this.sendSubscriptionNotification(data.id, 'subscription_created');

      logger.info(`Subscription created successfully: ${data.id}`);
      return data;
    } catch (error) {
      logger.error('Error in createSubscription:', error);
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    params: UpdateSubscriptionParams
  ): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Handle plan change
      if (params.plan_id && params.plan_id !== subscription.plan_id) {
        const newPlan = await this.getSubscriptionPlan(params.plan_id);
        if (!newPlan) {
          throw new Error('New subscription plan not found');
        }

        // Calculate proration if needed
        if (params.proration_behavior === 'create_prorations') {
          const proration = await this.calculateProration(
            subscriptionId,
            subscription.plan_id,
            params.plan_id
          );

          if (proration) {
            await this.saveProrationCalculation(proration);
          }
        }

        updateData.plan_id = params.plan_id;

        // Update Stripe subscription if exists
        if (subscription.stripe_subscription_id && newPlan.stripe_price_id) {
          await this.updateStripeSubscription(
            subscription.stripe_subscription_id,
            {
              price_id: newPlan.stripe_price_id,
              proration_behavior: params.proration_behavior,
            }
          );
        }
      }

      // Handle cancellation
      if (params.cancel_at_period_end !== undefined) {
        updateData.cancel_at_period_end = params.cancel_at_period_end;

        if (params.cancel_at_period_end) {
          // Schedule cancellation
          if (subscription.stripe_subscription_id) {
            await this.stripe.subscriptions.update(
              subscription.stripe_subscription_id,
              { cancel_at_period_end: true }
            );
          }

          await this.logBillingEvent(subscriptionId, 'cancellation_scheduled', {
            cancel_at: subscription.current_period_end,
          });
        } else {
          // Reactivate subscription
          if (subscription.stripe_subscription_id) {
            await this.stripe.subscriptions.update(
              subscription.stripe_subscription_id,
              { cancel_at_period_end: false }
            );
          }

          await this.logBillingEvent(
            subscriptionId,
            'cancellation_removed',
            {}
          );
        }
      }

      // Update metadata
      if (params.metadata) {
        updateData.metadata = {
          ...subscription.metadata,
          ...params.metadata,
        };
      }

      // Update subscription in database
      const { data, error } = await this.supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating subscription:', error);
        throw new Error(`Failed to update subscription: ${error.message}`);
      }

      logger.info(`Subscription updated successfully: ${subscriptionId}`);
      return data;
    } catch (error) {
      logger.error('Error in updateSubscription:', error);
      throw error;
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    immediate = false
  ): Promise<Subscription> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (immediate) {
        updateData.status = 'canceled';
        updateData.canceled_at = new Date().toISOString();

        // Cancel immediately in Stripe
        if (subscription.stripe_subscription_id) {
          await this.stripe.subscriptions.cancel(
            subscription.stripe_subscription_id
          );
        }

        await this.logBillingEvent(
          subscriptionId,
          'subscription_canceled_immediate',
          {}
        );
      } else {
        updateData.cancel_at_period_end = true;

        // Schedule cancellation in Stripe
        if (subscription.stripe_subscription_id) {
          await this.stripe.subscriptions.update(
            subscription.stripe_subscription_id,
            { cancel_at_period_end: true }
          );
        }

        await this.logBillingEvent(
          subscriptionId,
          'subscription_canceled_scheduled',
          {
            cancel_at: subscription.current_period_end,
          }
        );
      }

      // Update subscription in database
      const { data, error } = await this.supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) {
        logger.error('Error canceling subscription:', error);
        throw new Error(`Failed to cancel subscription: ${error.message}`);
      }

      // Send cancellation notification
      await this.sendSubscriptionNotification(
        subscriptionId,
        immediate ? 'subscription_canceled' : 'subscription_cancel_scheduled'
      );

      logger.info(`Subscription canceled successfully: ${subscriptionId}`);
      return data;
    } catch (error) {
      logger.error('Error in cancelSubscription:', error);
      throw error;
    }
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(
          `
          *,
          plan:subscription_plans(*),
          customer:customers(*)
        `
        )
        .eq('id', subscriptionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Error fetching subscription:', error);
        throw new Error(`Failed to fetch subscription: ${error.message}`);
      }

      return data;
    } catch (error) {
      logger.error('Error in getSubscription:', error);
      throw error;
    }
  }

  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(
          `
          *,
          plan:subscription_plans(*)
        `
        )
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching customer subscriptions:', error);
        throw new Error(
          `Failed to fetch customer subscriptions: ${error.message}`
        );
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getCustomerSubscriptions:', error);
      throw error;
    }
  }

  // Usage Tracking
  async trackUsage(
    subscriptionId: string,
    usageType: string,
    count = 1
  ): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Get current usage record for this period
      const { data: currentUsage, error: fetchError } = await this.supabase
        .from('subscription_usage')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('usage_type', usageType)
        .eq('period_start', subscription.current_period_start)
        .eq('period_end', subscription.current_period_end)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        logger.error('Error fetching usage:', fetchError);
        throw new Error(`Failed to fetch usage: ${fetchError.message}`);
      }

      if (currentUsage) {
        // Update existing usage
        const { error: updateError } = await this.supabase
          .from('subscription_usage')
          .update({
            usage_count: currentUsage.usage_count + count,
            updated_at: new Date().toISOString(),
          })
          .eq('id', currentUsage.id);

        if (updateError) {
          logger.error('Error updating usage:', updateError);
          throw new Error(`Failed to update usage: ${updateError.message}`);
        }
      } else {
        // Create new usage record
        const { error: insertError } = await this.supabase
          .from('subscription_usage')
          .insert({
            subscription_id: subscriptionId,
            usage_type: usageType,
            usage_count: count,
            period_start: subscription.current_period_start,
            period_end: subscription.current_period_end,
          });

        if (insertError) {
          logger.error('Error creating usage:', insertError);
          throw new Error(`Failed to create usage: ${insertError.message}`);
        }
      }

      logger.info(
        `Usage tracked: ${usageType} +${count} for subscription ${subscriptionId}`
      );
    } catch (error) {
      logger.error('Error in trackUsage:', error);
      throw error;
    }
  }

  async getUsage(
    subscriptionId: string,
    usageType?: string
  ): Promise<SubscriptionUsage[]> {
    try {
      let query = this.supabase
        .from('subscription_usage')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .order('created_at', { ascending: false });

      if (usageType) {
        query = query.eq('usage_type', usageType);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching usage:', error);
        throw new Error(`Failed to fetch usage: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getUsage:', error);
      throw error;
    }
  }

  // Helper Methods
  private calculateNextBillingDate(
    startDate: Date,
    billingCycle: string
  ): Date {
    switch (billingCycle) {
      case 'monthly':
        return addMonths(startDate, 1);
      case 'quarterly':
        return addMonths(startDate, 3);
      case 'annual':
        return addYears(startDate, 1);
      default:
        throw new Error(`Invalid billing cycle: ${billingCycle}`);
    }
  }

  private async createStripeSubscription(params: {
    customer_id: string;
    price_id: string;
    payment_method_id: string;
    trial_end?: Date;
    metadata?: Record<string, any>;
  }): Promise<Stripe.Subscription> {
    try {
      // Get or create Stripe customer
      const { data: customer } = await this.supabase
        .from('customers')
        .select('stripe_customer_id')
        .eq('id', params.customer_id)
        .single();

      if (!customer?.stripe_customer_id) {
        throw new Error('Customer does not have a Stripe customer ID');
      }

      const subscriptionParams: Stripe.SubscriptionCreateParams = {
        customer: customer.stripe_customer_id,
        items: [{ price: params.price_id }],
        default_payment_method: params.payment_method_id,
        expand: ['latest_invoice.payment_intent'],
        metadata: params.metadata || {},
      };

      if (params.trial_end) {
        subscriptionParams.trial_end = Math.floor(
          params.trial_end.getTime() / 1000
        );
      }

      return await this.stripe.subscriptions.create(subscriptionParams);
    } catch (error) {
      logger.error('Error creating Stripe subscription:', error);
      throw error;
    }
  }

  private async updateStripeSubscription(
    subscriptionId: string,
    params: {
      price_id?: string;
      proration_behavior?: string;
    }
  ): Promise<Stripe.Subscription> {
    try {
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);

      const updateParams: Stripe.SubscriptionUpdateParams = {
        proration_behavior:
          (params.proration_behavior as any) || 'create_prorations',
      };

      if (params.price_id) {
        updateParams.items = [
          {
            id: subscription.items.data[0].id,
            price: params.price_id,
          },
        ];
      }

      return await this.stripe.subscriptions.update(
        subscriptionId,
        updateParams
      );
    } catch (error) {
      logger.error('Error updating Stripe subscription:', error);
      throw error;
    }
  }

  private async calculateProration(
    subscriptionId: string,
    oldPlanId: string,
    newPlanId: string
  ): Promise<ProrationCalculation | null> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      const oldPlan = await this.getSubscriptionPlan(oldPlanId);
      const newPlan = await this.getSubscriptionPlan(newPlanId);

      if (!(subscription && oldPlan && newPlan)) {
        return null;
      }

      const now = new Date();
      const periodStart = new Date(subscription.current_period_start);
      const periodEnd = new Date(subscription.current_period_end);

      const totalDays = Math.ceil(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const usedDays = Math.ceil(
        (now.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const remainingDays = totalDays - usedDays;

      const prorationFactor = remainingDays / totalDays;
      const originalAmount = oldPlan.price;
      const prorationCredit = originalAmount * prorationFactor;
      const newPlanProration = newPlan.price * prorationFactor;
      const prorationAmount = newPlanProration - prorationCredit;

      return {
        id: '', // Will be generated by database
        subscription_id: subscriptionId,
        old_plan_id: oldPlanId,
        new_plan_id: newPlanId,
        original_amount: originalAmount,
        prorated_amount: prorationAmount,
        days_used: usedDays,
        days_total: totalDays,
        proration_factor: prorationFactor,
        effective_date: now,
      };
    } catch (error) {
      logger.error('Error calculating proration:', error);
      return null;
    }
  }

  private async saveProrationCalculation(
    proration: ProrationCalculation
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('proration_calculations')
        .insert({
          subscription_id: proration.subscription_id,
          old_plan_id: proration.old_plan_id,
          new_plan_id: proration.new_plan_id,
          original_amount: proration.original_amount,
          prorated_amount: proration.prorated_amount,
          days_used: proration.days_used,
          days_total: proration.days_total,
          proration_factor: proration.proration_factor,
          effective_date: proration.effective_date.toISOString(),
        });

      if (error) {
        logger.error('Error saving proration calculation:', error);
        throw new Error(
          `Failed to save proration calculation: ${error.message}`
        );
      }
    } catch (error) {
      logger.error('Error in saveProrationCalculation:', error);
      throw error;
    }
  }

  private async initializeUsageTracking(
    subscriptionId: string,
    plan: SubscriptionPlan
  ): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      // Initialize common usage types based on plan features
      const usageTypes = [
        {
          type: 'appointments',
          limit: this.extractUsageLimit(plan.features, 'appointments'),
        },
        {
          type: 'patients',
          limit: this.extractUsageLimit(plan.features, 'patients'),
        },
        {
          type: 'storage_gb',
          limit: this.extractUsageLimit(plan.features, 'storage'),
        },
        {
          type: 'api_calls',
          limit: this.extractUsageLimit(plan.features, 'api'),
        },
      ];

      for (const usage of usageTypes) {
        await this.supabase.from('subscription_usage').insert({
          subscription_id: subscriptionId,
          usage_type: usage.type,
          usage_count: 0,
          usage_limit: usage.limit,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
        });
      }
    } catch (error) {
      logger.error('Error initializing usage tracking:', error);
      // Don't throw error as this is not critical
    }
  }

  private extractUsageLimit(
    features: string[],
    usageType: string
  ): number | null {
    const feature = features.find((f) => f.toLowerCase().includes(usageType));
    if (!feature) {
      return null;
    }

    const match = feature.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : null;
  }

  private async logBillingEvent(
    subscriptionId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase.from('billing_events').insert({
        subscription_id: subscriptionId,
        event_type: eventType,
        event_data: eventData,
      });
    } catch (error) {
      logger.error('Error logging billing event:', error);
      // Don't throw error as this is not critical
    }
  }

  private async sendSubscriptionNotification(
    subscriptionId: string,
    notificationType: string
  ): Promise<void> {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: notificationType,
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          plan_name: subscription.plan?.name,
        },
      });
    } catch (error) {
      logger.error('Error sending subscription notification:', error);
      // Don't throw error as this is not critical
    }
  }
}

// Export singleton instance
export const subscriptionManager = new SubscriptionManager();
