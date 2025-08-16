// NeonPro - Recurring Payment Processor
// Story 6.1 - Task 2: Recurring Payment System
// Automated billing and payment retry logic

import { createClient } from '@supabase/supabase-js';
import { addHours, format } from 'date-fns';
import Stripe from 'stripe';
import { sendNotification } from '@/lib/notifications/notification-service';
import { logger } from '@/lib/utils/logger';
import { PaymentProcessor } from '../payment-processor';
import { subscriptionManager } from './subscription-manager';

// Types and Interfaces
export type PaymentRetryAttempt = {
  id: string;
  subscription_id: string;
  payment_intent_id: string;
  attempt_count: number;
  retry_date: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed' | 'canceled';
  error_message?: string;
  processed_at?: Date;
};

export type RecurringPaymentConfig = {
  max_retry_attempts: number;
  retry_intervals_hours: number[]; // [24, 72, 168] = 1 day, 3 days, 7 days
  dunning_management: {
    grace_period_days: number;
    suspension_after_days: number;
    cancellation_after_days: number;
  };
  notification_settings: {
    payment_failed: boolean;
    payment_retry: boolean;
    payment_success: boolean;
    subscription_suspended: boolean;
    subscription_canceled: boolean;
  };
};

export type BillingCycleResult = {
  processed_subscriptions: number;
  successful_payments: number;
  failed_payments: number;
  retry_scheduled: number;
  errors: string[];
};

export type PaymentAttemptResult = {
  success: boolean;
  payment_intent_id?: string;
  error_message?: string;
  requires_retry: boolean;
  next_retry_date?: Date;
};

// Main Recurring Payment Processor Class
export class RecurringPaymentProcessor {
  private readonly supabase: any;
  private readonly stripe: Stripe;
  private readonly paymentProcessor: PaymentProcessor;
  private readonly config: RecurringPaymentConfig;

  constructor(config?: Partial<RecurringPaymentConfig>) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    this.paymentProcessor = new PaymentProcessor();

    this.config = {
      max_retry_attempts: 4,
      retry_intervals_hours: [24, 72, 168, 336], // 1 day, 3 days, 7 days, 14 days
      dunning_management: {
        grace_period_days: 3,
        suspension_after_days: 7,
        cancellation_after_days: 30,
      },
      notification_settings: {
        payment_failed: true,
        payment_retry: true,
        payment_success: true,
        subscription_suspended: true,
        subscription_canceled: true,
      },
      ...config,
    };
  }

  // Main Billing Cycle Processing
  async processBillingCycle(): Promise<BillingCycleResult> {
    logger.info('Starting billing cycle processing...');

    const result: BillingCycleResult = {
      processed_subscriptions: 0,
      successful_payments: 0,
      failed_payments: 0,
      retry_scheduled: 0,
      errors: [],
    };

    try {
      // Get subscriptions due for billing
      const dueSubscriptions = await this.getSubscriptionsDueForBilling();
      result.processed_subscriptions = dueSubscriptions.length;

      logger.info(
        `Found ${dueSubscriptions.length} subscriptions due for billing`,
      );

      // Process each subscription
      for (const subscription of dueSubscriptions) {
        try {
          const paymentResult = await this.processSubscriptionPayment(
            subscription.id,
          );

          if (paymentResult.success) {
            result.successful_payments++;
            await this.handleSuccessfulPayment(subscription.id, paymentResult);
          } else {
            result.failed_payments++;

            if (paymentResult.requires_retry) {
              result.retry_scheduled++;
              await this.schedulePaymentRetry(subscription.id, paymentResult);
            } else {
              await this.handleFinalPaymentFailure(
                subscription.id,
                paymentResult,
              );
            }
          }
        } catch (error) {
          const errorMessage = `Error processing subscription ${subscription.id}: ${error}`;
          logger.error(errorMessage);
          result.errors.push(errorMessage);
        }
      }

      // Process scheduled retries
      await this.processScheduledRetries(result);

      // Update subscription statuses based on payment failures
      await this.updateSubscriptionStatuses();

      logger.info('Billing cycle processing completed', result);
      return result;
    } catch (error) {
      logger.error('Error in billing cycle processing:', error);
      result.errors.push(`Billing cycle error: ${error}`);
      return result;
    }
  }

  // Process individual subscription payment
  async processSubscriptionPayment(
    subscriptionId: string,
  ): Promise<PaymentAttemptResult> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = await subscriptionManager.getSubscriptionPlan(
        subscription.plan_id,
      );
      if (!plan) {
        throw new Error('Subscription plan not found');
      }

      // Check if subscription has Stripe integration
      if (!subscription.stripe_subscription_id) {
        return await this.processManualPayment(subscription, plan);
      }

      // Process Stripe payment
      return await this.processStripePayment(subscription, plan);
    } catch (error) {
      logger.error(
        `Error processing payment for subscription ${subscriptionId}:`,
        error,
      );
      return {
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        requires_retry: true,
      };
    }
  }

  // Process Stripe-based payment
  private async processStripePayment(
    subscription: any,
    _plan: any,
  ): Promise<PaymentAttemptResult> {
    try {
      // Retrieve Stripe subscription
      const stripeSubscription = await this.stripe.subscriptions.retrieve(
        subscription.stripe_subscription_id,
        { expand: ['latest_invoice', 'latest_invoice.payment_intent'] },
      );

      const latestInvoice = stripeSubscription.latest_invoice as Stripe.Invoice;

      if (!latestInvoice) {
        throw new Error('No invoice found for subscription');
      }

      // Check if payment is already successful
      if (latestInvoice.status === 'paid') {
        return {
          success: true,
          payment_intent_id: latestInvoice.payment_intent as string,
        };
      }

      // Attempt to pay the invoice
      if (latestInvoice.status === 'open') {
        const paymentIntent =
          latestInvoice.payment_intent as Stripe.PaymentIntent;

        if (
          paymentIntent &&
          paymentIntent.status === 'requires_payment_method'
        ) {
          // Try to confirm payment with default payment method
          const customer = (await this.stripe.customers.retrieve(
            stripeSubscription.customer as string,
          )) as Stripe.Customer;

          if (customer.invoice_settings?.default_payment_method) {
            await this.stripe.paymentIntents.confirm(paymentIntent.id, {
              payment_method: customer.invoice_settings
                .default_payment_method as string,
            });
          }
        }

        // Refresh payment intent status
        const updatedPaymentIntent = await this.stripe.paymentIntents.retrieve(
          paymentIntent.id,
        );

        if (updatedPaymentIntent.status === 'succeeded') {
          return {
            success: true,
            payment_intent_id: updatedPaymentIntent.id,
          };
        }
        return {
          success: false,
          payment_intent_id: updatedPaymentIntent.id,
          error_message:
            updatedPaymentIntent.last_payment_error?.message ||
            'Payment failed',
          requires_retry: this.shouldRetryPayment(
            updatedPaymentIntent.last_payment_error,
          ),
        };
      }

      return {
        success: false,
        error_message: `Invoice status: ${latestInvoice.status}`,
        requires_retry: true,
      };
    } catch (error) {
      logger.error('Error processing Stripe payment:', error);
      return {
        success: false,
        error_message:
          error instanceof Error ? error.message : 'Stripe payment error',
        requires_retry: true,
      };
    }
  }

  // Process manual payment (non-Stripe)
  private async processManualPayment(
    subscription: any,
    plan: any,
  ): Promise<PaymentAttemptResult> {
    try {
      // Get customer's default payment method
      const { data: customer } = await this.supabase
        .from('customers')
        .select(
          `
          *,
          payment_methods(*)
        `,
        )
        .eq('id', subscription.customer_id)
        .single();

      if (!customer?.payment_methods?.length) {
        return {
          success: false,
          error_message: 'No payment method available',
          requires_retry: false,
        };
      }

      const defaultPaymentMethod =
        customer.payment_methods.find((pm: any) => pm.is_default) ||
        customer.payment_methods[0];

      // Process payment using our payment processor
      const paymentResult = await this.paymentProcessor.processPayment({
        amount: plan.price * 100, // Convert to cents
        currency: plan.currency,
        customer_id: subscription.customer_id,
        payment_method_id: defaultPaymentMethod.id,
        description: `Subscription payment for ${plan.name}`,
        metadata: {
          subscription_id: subscription.id,
          plan_id: plan.id,
          billing_cycle: plan.billing_cycle,
        },
      });

      if (paymentResult.success) {
        return {
          success: true,
          payment_intent_id: paymentResult.transaction_id,
        };
      }
      return {
        success: false,
        error_message: paymentResult.error_message,
        requires_retry: this.shouldRetryPaymentError(paymentResult.error_code),
      };
    } catch (error) {
      logger.error('Error processing manual payment:', error);
      return {
        success: false,
        error_message:
          error instanceof Error ? error.message : 'Manual payment error',
        requires_retry: true,
      };
    }
  }

  // Payment Retry Management
  async schedulePaymentRetry(
    subscriptionId: string,
    paymentResult: PaymentAttemptResult,
  ): Promise<void> {
    try {
      // Get current retry count
      const { data: existingRetries } = await this.supabase
        .from('payment_retry_log')
        .select('*')
        .eq('subscription_id', subscriptionId)
        .eq('payment_intent_id', paymentResult.payment_intent_id || 'manual')
        .order('attempt_count', { ascending: false })
        .limit(1);

      const currentAttempt = existingRetries?.[0]?.attempt_count || 0;
      const nextAttempt = currentAttempt + 1;

      // Check if we've exceeded max attempts
      if (nextAttempt > this.config.max_retry_attempts) {
        await this.handleFinalPaymentFailure(subscriptionId, paymentResult);
        return;
      }

      // Calculate next retry date
      const retryHours =
        this.config.retry_intervals_hours[nextAttempt - 1] ||
        this.config.retry_intervals_hours.at(-1);
      const nextRetryDate = addHours(new Date(), retryHours);

      // Schedule retry
      await this.supabase.from('payment_retry_log').insert({
        subscription_id: subscriptionId,
        payment_intent_id: paymentResult.payment_intent_id || 'manual',
        attempt_count: nextAttempt,
        retry_date: nextRetryDate.toISOString(),
        status: 'scheduled',
        error_message: paymentResult.error_message,
      });

      // Send retry notification
      if (this.config.notification_settings.payment_retry) {
        await this.sendPaymentRetryNotification(
          subscriptionId,
          nextAttempt,
          nextRetryDate,
        );
      }

      logger.info(
        `Payment retry scheduled for subscription ${subscriptionId}, attempt ${nextAttempt}`,
      );
    } catch (error) {
      logger.error('Error scheduling payment retry:', error);
    }
  }

  async processScheduledRetries(result: BillingCycleResult): Promise<void> {
    try {
      // Get retries due for processing
      const { data: dueRetries } = await this.supabase
        .from('payment_retry_log')
        .select('*')
        .eq('status', 'scheduled')
        .lte('retry_date', new Date().toISOString());

      if (!dueRetries?.length) {
        return;
      }

      logger.info(`Processing ${dueRetries.length} scheduled payment retries`);

      for (const retry of dueRetries) {
        try {
          // Mark as processing
          await this.supabase
            .from('payment_retry_log')
            .update({ status: 'processing' })
            .eq('id', retry.id);

          // Attempt payment
          const paymentResult = await this.processSubscriptionPayment(
            retry.subscription_id,
          );

          if (paymentResult.success) {
            // Mark retry as completed
            await this.supabase
              .from('payment_retry_log')
              .update({
                status: 'completed',
                processed_at: new Date().toISOString(),
              })
              .eq('id', retry.id);

            result.successful_payments++;
            await this.handleSuccessfulPayment(
              retry.subscription_id,
              paymentResult,
            );
          } else {
            // Mark retry as failed
            await this.supabase
              .from('payment_retry_log')
              .update({
                status: 'failed',
                error_message: paymentResult.error_message,
                processed_at: new Date().toISOString(),
              })
              .eq('id', retry.id);

            result.failed_payments++;

            if (paymentResult.requires_retry) {
              await this.schedulePaymentRetry(
                retry.subscription_id,
                paymentResult,
              );
              result.retry_scheduled++;
            } else {
              await this.handleFinalPaymentFailure(
                retry.subscription_id,
                paymentResult,
              );
            }
          }
        } catch (error) {
          const errorMessage = `Error processing retry ${retry.id}: ${error}`;
          logger.error(errorMessage);
          result.errors.push(errorMessage);

          // Mark retry as failed
          await this.supabase
            .from('payment_retry_log')
            .update({
              status: 'failed',
              error_message:
                error instanceof Error ? error.message : 'Unknown error',
              processed_at: new Date().toISOString(),
            })
            .eq('id', retry.id);
        }
      }
    } catch (error) {
      logger.error('Error processing scheduled retries:', error);
    }
  }

  // Success and Failure Handlers
  private async handleSuccessfulPayment(
    subscriptionId: string,
    paymentResult: PaymentAttemptResult,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      const plan = await subscriptionManager.getSubscriptionPlan(
        subscription.plan_id,
      );
      if (!plan) {
        return;
      }

      // Update subscription for next billing cycle
      const nextPeriodStart = new Date(subscription.current_period_end);
      const nextPeriodEnd = this.calculateNextBillingDate(
        nextPeriodStart,
        plan.billing_cycle,
      );

      await this.supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: nextPeriodStart.toISOString(),
          current_period_end: nextPeriodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      // Create payment record
      await this.createPaymentRecord(
        subscriptionId,
        paymentResult,
        'completed',
      );

      // Reset usage tracking for new period
      await this.resetUsageTracking(
        subscriptionId,
        nextPeriodStart,
        nextPeriodEnd,
      );

      // Send success notification
      if (this.config.notification_settings.payment_success) {
        await this.sendPaymentSuccessNotification(subscriptionId, plan.price);
      }

      logger.info(
        `Successful payment processed for subscription ${subscriptionId}`,
      );
    } catch (error) {
      logger.error('Error handling successful payment:', error);
    }
  }

  private async handleFinalPaymentFailure(
    subscriptionId: string,
    paymentResult: PaymentAttemptResult,
  ): Promise<void> {
    try {
      // Update subscription status to past_due
      await this.supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId);

      // Create failed payment record
      await this.createPaymentRecord(subscriptionId, paymentResult, 'failed');

      // Send failure notification
      if (this.config.notification_settings.payment_failed) {
        await this.sendPaymentFailureNotification(
          subscriptionId,
          paymentResult.error_message,
        );
      }

      logger.info(
        `Final payment failure handled for subscription ${subscriptionId}`,
      );
    } catch (error) {
      logger.error('Error handling final payment failure:', error);
    }
  }

  // Subscription Status Management
  private async updateSubscriptionStatuses(): Promise<void> {
    try {
      const now = new Date();
      const _gracePeriodDate = new Date(
        now.getTime() -
          this.config.dunning_management.grace_period_days *
            24 *
            60 *
            60 *
            1000,
      );
      const suspensionDate = new Date(
        now.getTime() -
          this.config.dunning_management.suspension_after_days *
            24 *
            60 *
            60 *
            1000,
      );
      const cancellationDate = new Date(
        now.getTime() -
          this.config.dunning_management.cancellation_after_days *
            24 *
            60 *
            60 *
            1000,
      );

      // Cancel subscriptions that have been past due for too long
      const { data: subscriptionsToCancel } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'past_due')
        .lt('current_period_end', cancellationDate.toISOString());

      for (const subscription of subscriptionsToCancel || []) {
        await subscriptionManager.cancelSubscription(subscription.id, true);

        if (this.config.notification_settings.subscription_canceled) {
          await this.sendSubscriptionCanceledNotification(subscription.id);
        }
      }

      // Suspend subscriptions that have been past due for suspension period
      const { data: subscriptionsToSuspend } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'past_due')
        .lt('current_period_end', suspensionDate.toISOString())
        .gte('current_period_end', cancellationDate.toISOString());

      for (const subscription of subscriptionsToSuspend || []) {
        await this.supabase
          .from('subscriptions')
          .update({
            status: 'unpaid',
            updated_at: new Date().toISOString(),
          })
          .eq('id', subscription.id);

        if (this.config.notification_settings.subscription_suspended) {
          await this.sendSubscriptionSuspendedNotification(subscription.id);
        }
      }

      logger.info(
        'Subscription statuses updated based on dunning management rules',
      );
    } catch (error) {
      logger.error('Error updating subscription statuses:', error);
    }
  }

  // Helper Methods
  private async getSubscriptionsDueForBilling(): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select(
          `
          *,
          plan:subscription_plans(*),
          customer:customers(*)
        `,
        )
        .in('status', ['active', 'trialing'])
        .lte('current_period_end', new Date().toISOString());

      if (error) {
        logger.error('Error fetching subscriptions due for billing:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      logger.error('Error in getSubscriptionsDueForBilling:', error);
      return [];
    }
  }

  private calculateNextBillingDate(
    startDate: Date,
    billingCycle: string,
  ): Date {
    switch (billingCycle) {
      case 'monthly':
        return new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
        );
      case 'quarterly':
        return new Date(
          startDate.getFullYear(),
          startDate.getMonth() + 3,
          startDate.getDate(),
        );
      case 'annual':
        return new Date(
          startDate.getFullYear() + 1,
          startDate.getMonth(),
          startDate.getDate(),
        );
      default:
        throw new Error(`Invalid billing cycle: ${billingCycle}`);
    }
  }

  private shouldRetryPayment(
    error: Stripe.PaymentIntent.LastPaymentError | null,
  ): boolean {
    if (!error) {
      return true;
    }

    const nonRetryableCodes = [
      'card_declined',
      'expired_card',
      'incorrect_cvc',
      'processing_error',
      'card_not_supported',
    ];

    return !nonRetryableCodes.includes(error.code || '');
  }

  private shouldRetryPaymentError(errorCode?: string): boolean {
    if (!errorCode) {
      return true;
    }

    const nonRetryableCodes = [
      'insufficient_funds',
      'card_declined',
      'expired_card',
      'invalid_card',
    ];

    return !nonRetryableCodes.includes(errorCode);
  }

  private async createPaymentRecord(
    subscriptionId: string,
    paymentResult: PaymentAttemptResult,
    status: string,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      const plan = await subscriptionManager.getSubscriptionPlan(
        subscription?.plan_id,
      );

      if (!(subscription && plan)) {
        return;
      }

      await this.supabase.from('payments').insert({
        customer_id: subscription.customer_id,
        amount: plan.price * 100, // Convert to cents
        currency: plan.currency,
        status,
        payment_method: 'subscription',
        transaction_id: paymentResult.payment_intent_id,
        metadata: {
          subscription_id: subscriptionId,
          plan_id: plan.id,
          billing_cycle: plan.billing_cycle,
        },
      });
    } catch (error) {
      logger.error('Error creating payment record:', error);
    }
  }

  private async resetUsageTracking(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<void> {
    try {
      // Get current usage records
      const { data: currentUsage } = await this.supabase
        .from('subscription_usage')
        .select('*')
        .eq('subscription_id', subscriptionId);

      // Create new usage records for the new period
      for (const usage of currentUsage || []) {
        await this.supabase.from('subscription_usage').insert({
          subscription_id: subscriptionId,
          usage_type: usage.usage_type,
          usage_count: 0,
          usage_limit: usage.usage_limit,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
        });
      }
    } catch (error) {
      logger.error('Error resetting usage tracking:', error);
    }
  }

  // Notification Methods
  private async sendPaymentRetryNotification(
    subscriptionId: string,
    attemptNumber: number,
    nextRetryDate: Date,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: 'payment_retry_scheduled',
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          attempt_number: attemptNumber,
          next_retry_date: format(nextRetryDate, 'PPP'),
          plan_name: subscription.plan?.name,
        },
      });
    } catch (error) {
      logger.error('Error sending payment retry notification:', error);
    }
  }

  private async sendPaymentSuccessNotification(
    subscriptionId: string,
    amount: number,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: 'payment_success',
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          amount,
          plan_name: subscription.plan?.name,
          next_billing_date: format(
            new Date(subscription.current_period_end),
            'PPP',
          ),
        },
      });
    } catch (error) {
      logger.error('Error sending payment success notification:', error);
    }
  }

  private async sendPaymentFailureNotification(
    subscriptionId: string,
    errorMessage?: string,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: 'payment_failed',
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          error_message: errorMessage,
          plan_name: subscription.plan?.name,
        },
      });
    } catch (error) {
      logger.error('Error sending payment failure notification:', error);
    }
  }

  private async sendSubscriptionSuspendedNotification(
    subscriptionId: string,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: 'subscription_suspended',
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          plan_name: subscription.plan?.name,
        },
      });
    } catch (error) {
      logger.error('Error sending subscription suspended notification:', error);
    }
  }

  private async sendSubscriptionCanceledNotification(
    subscriptionId: string,
  ): Promise<void> {
    try {
      const subscription =
        await subscriptionManager.getSubscription(subscriptionId);
      if (!subscription) {
        return;
      }

      await sendNotification({
        type: 'subscription_canceled',
        recipient_id: subscription.customer_id,
        data: {
          subscription_id: subscriptionId,
          plan_name: subscription.plan?.name,
        },
      });
    } catch (error) {
      logger.error('Error sending subscription canceled notification:', error);
    }
  }
}

// Export singleton instance
export const recurringPaymentProcessor = new RecurringPaymentProcessor();
