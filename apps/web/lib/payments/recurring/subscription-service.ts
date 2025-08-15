import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

// Types for subscription management
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval: 'month' | 'quarter' | 'year';
  intervalCount: number;
  trialDays?: number;
  features: string[];
  isActive: boolean;
}

export interface SubscriptionData {
  patientId: string;
  planId: string;
  startDate: Date;
  trialEndDate?: Date;
  paymentMethodId: string;
  metadata?: Record<string, any>;
}

export interface SubscriptionStatus {
  id: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  nextBillingDate: Date;
  amount: number;
  currency: string;
  paymentMethod: {
    type: string;
    last4?: string;
    brand?: string;
  };
}

export interface BillingCycle {
  subscriptionId: string;
  periodStart: Date;
  periodEnd: Date;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'retrying';
  attemptCount: number;
  nextRetryDate?: Date;
  invoiceId?: string;
}

/**
 * Subscription Service for managing recurring payments
 */
export class SubscriptionService {
  private supabase = createClient();

  /**
   * Create a new subscription
   */
  async createSubscription(
    data: SubscriptionData
  ): Promise<SubscriptionStatus> {
    try {
      // Get subscription plan details
      const { data: plan } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', data.planId)
        .eq('is_active', true)
        .single();

      if (!plan) {
        throw new Error('Subscription plan not found or inactive');
      }

      // Get patient details
      const { data: patient } = await this.supabase
        .from('patients')
        .select('id, email, name')
        .eq('id', data.patientId)
        .single();

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Create Stripe customer if not exists
      const stripeCustomerId = await this.getOrCreateStripeCustomer(patient);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(data.paymentMethodId, {
        customer: stripeCustomerId,
      });

      // Set as default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: data.paymentMethodId,
        },
      });

      // Create Stripe subscription
      const stripeSubscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price_data: {
              currency: plan.currency,
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: plan.amount,
              recurring: {
                interval: plan.interval,
                interval_count: plan.interval_count,
              },
            },
          },
        ],
        trial_period_days: plan.trial_days || undefined,
        default_payment_method: data.paymentMethodId,
        metadata: {
          patientId: data.patientId,
          planId: data.planId,
          ...data.metadata,
        },
      });

      // Save subscription to database
      const { data: subscription, error } = await this.supabase
        .from('subscriptions')
        .insert({
          id: stripeSubscription.id,
          patient_id: data.patientId,
          plan_id: data.planId,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: stripeSubscription.id,
          status: stripeSubscription.status,
          current_period_start: new Date(
            stripeSubscription.current_period_start * 1000
          ),
          current_period_end: new Date(
            stripeSubscription.current_period_end * 1000
          ),
          trial_end: stripeSubscription.trial_end
            ? new Date(stripeSubscription.trial_end * 1000)
            : null,
          amount: plan.amount,
          currency: plan.currency,
          payment_method_id: data.paymentMethodId,
          metadata: data.metadata,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to save subscription: ${error.message}`);
      }

      return this.formatSubscriptionStatus(subscription, stripeSubscription);
    } catch (error) {
      console.error('Subscription creation error:', error);
      throw error;
    }
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(
    subscriptionId: string
  ): Promise<SubscriptionStatus | null> {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select(`
          *,
          subscription_plans(*),
          patients(id, name, email)
        `)
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        return null;
      }

      // Get latest Stripe subscription data
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      return this.formatSubscriptionStatus(subscription, stripeSubscription);
    } catch (error) {
      console.error('Get subscription status error:', error);
      return null;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd = true
  ): Promise<boolean> {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } else {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
      }

      // Update database
      await this.supabase
        .from('subscriptions')
        .update({
          status: cancelAtPeriodEnd ? 'active' : 'canceled',
          cancel_at_period_end: cancelAtPeriodEnd,
          canceled_at: cancelAtPeriodEnd ? null : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      return true;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return false;
    }
  }

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(
    subscriptionId: string,
    newPlanId: string,
    prorationBehavior: 'create_prorations' | 'none' = 'create_prorations'
  ): Promise<SubscriptionStatus | null> {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const { data: newPlan } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .eq('is_active', true)
        .single();

      if (!newPlan) {
        throw new Error('New subscription plan not found or inactive');
      }

      // Get current Stripe subscription
      const stripeSubscription = await stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id
      );

      // Update Stripe subscription
      const updatedStripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price_data: {
                currency: newPlan.currency,
                product_data: {
                  name: newPlan.name,
                  description: newPlan.description,
                },
                unit_amount: newPlan.amount,
                recurring: {
                  interval: newPlan.interval,
                  interval_count: newPlan.interval_count,
                },
              },
            },
          ],
          proration_behavior: prorationBehavior,
        }
      );

      // Update database
      const { data: updatedSubscription } = await this.supabase
        .from('subscriptions')
        .update({
          plan_id: newPlanId,
          amount: newPlan.amount,
          currency: newPlan.currency,
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      return this.formatSubscriptionStatus(
        updatedSubscription,
        updatedStripeSubscription
      );
    } catch (error) {
      console.error('Update subscription plan error:', error);
      return null;
    }
  }

  /**
   * Process failed payment retry
   */
  async processFailedPaymentRetry(subscriptionId: string): Promise<boolean> {
    try {
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!subscription) {
        return false;
      }

      // Get latest invoice
      const invoices = await stripe.invoices.list({
        subscription: subscription.stripe_subscription_id,
        limit: 1,
      });

      if (invoices.data.length === 0) {
        return false;
      }

      const invoice = invoices.data[0];

      if (invoice.status === 'open') {
        // Attempt to pay the invoice
        await stripe.invoices.pay(invoice.id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed payment retry error:', error);
      return false;
    }
  }

  /**
   * Get or create Stripe customer
   */
  private async getOrCreateStripeCustomer(patient: any): Promise<string> {
    // Check if customer already exists
    const { data: existingCustomer } = await this.supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('patient_id', patient.id)
      .single();

    if (existingCustomer) {
      return existingCustomer.stripe_customer_id;
    }

    // Create new Stripe customer
    const stripeCustomer = await stripe.customers.create({
      email: patient.email,
      name: patient.name,
      metadata: {
        patientId: patient.id,
      },
    });

    // Save to database
    await this.supabase.from('stripe_customers').insert({
      patient_id: patient.id,
      stripe_customer_id: stripeCustomer.id,
      email: patient.email,
      name: patient.name,
    });

    return stripeCustomer.id;
  }

  /**
   * Format subscription status for API response
   */
  private formatSubscriptionStatus(
    subscription: any,
    stripeSubscription: Stripe.Subscription
  ): SubscriptionStatus {
    return {
      id: subscription.id,
      status: stripeSubscription.status as any,
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
      amount: subscription.amount,
      currency: subscription.currency,
      paymentMethod: {
        type: 'card', // This would need to be determined from the actual payment method
        last4: '****', // This would come from the payment method details
        brand: 'visa', // This would come from the payment method details
      },
    };
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
