// NeonPro - Installment Processor
// Story 6.1 - Task 3: Installment Management System
// Service for processing installment payments and automation

import { createClient } from '@supabase/supabase-js';
import { addDays, format, isBefore } from 'date-fns';
import Stripe from 'stripe';

// Types
type InstallmentProcessorConfig = {
  supabaseUrl: string;
  supabaseKey: string;
  stripeSecretKey: string;
  webhookSecret?: string;
  retryAttempts?: number;
  lateFeePercentage?: number;
  gracePeriodDays?: number;
};

type ProcessingResult = {
  success: boolean;
  installmentId: string;
  paymentIntentId?: string;
  error?: string;
  amount?: number;
  lateFee?: number;
};

type BulkProcessingResult = {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: ProcessingResult[];
  summary: {
    totalAmount: number;
    totalLateFees: number;
    errors: string[];
  };
};

type OverdueInstallment = {
  id: string;
  payment_plan_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  installment_number: number;
  amount: number;
  due_date: string;
  days_overdue: number;
  late_fee: number;
  escalation_level?: number;
};

type PaymentMethodInfo = {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
};

export class InstallmentProcessor {
  private readonly supabase;
  private readonly stripe: Stripe;
  private readonly config: InstallmentProcessorConfig;

  constructor(config: InstallmentProcessorConfig) {
    this.config = {
      retryAttempts: 3,
      lateFeePercentage: 2.0, // 2% late fee
      gracePeriodDays: 3,
      ...config,
    };

    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.stripe = new Stripe(config.stripeSecretKey, {
      apiVersion: '2023-10-16',
    });
  }

  /**
   * Process a single installment payment
   */
  async processInstallmentPayment(
    installmentId: string,
    paymentMethodId?: string,
    customerId?: string
  ): Promise<ProcessingResult> {
    try {
      // Get installment details
      const { data: installment, error: installmentError } = await this.supabase
        .from('installments')
        .select(
          `
          *,
          payment_plans!inner(
            id,
            customer_id,
            total_amount,
            currency,
            customers!inner(
              id,
              name,
              email,
              stripe_customer_id
            )
          )
        `
        )
        .eq('id', installmentId)
        .single();

      if (installmentError || !installment) {
        throw new Error(`Installment not found: ${installmentError?.message}`);
      }

      if (installment.status === 'paid') {
        return {
          success: false,
          installmentId,
          error: 'Installment already paid',
        };
      }

      if (installment.status === 'cancelled') {
        return {
          success: false,
          installmentId,
          error: 'Installment is cancelled',
        };
      }

      const customer = installment.payment_plans.customers;
      const stripeCustomerId = customerId || customer.stripe_customer_id;

      if (!stripeCustomerId) {
        throw new Error('No Stripe customer ID found');
      }

      // Calculate late fee if overdue
      const lateFee = await this.calculateLateFee(installment);
      const totalAmount = installment.amount + lateFee;

      // Get or use payment method
      let finalPaymentMethodId = paymentMethodId;
      if (!finalPaymentMethodId) {
        const defaultPaymentMethod =
          await this.getDefaultPaymentMethod(stripeCustomerId);
        finalPaymentMethodId = defaultPaymentMethod?.id;
      }

      if (!finalPaymentMethodId) {
        throw new Error('No payment method available');
      }

      // Create payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: installment.payment_plans.currency.toLowerCase(),
        customer: stripeCustomerId,
        payment_method: finalPaymentMethodId,
        confirmation_method: 'automatic',
        confirm: true,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/installments/${installmentId}/success`,
        metadata: {
          installment_id: installmentId,
          payment_plan_id: installment.payment_plan_id,
          customer_id: customer.id,
          installment_number: installment.installment_number.toString(),
          late_fee: lateFee.toString(),
        },
      });

      // Update installment with payment intent
      const { error: updateError } = await this.supabase
        .from('installments')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          late_fee: lateFee,
          updated_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      if (updateError) {
        throw new Error(`Failed to update installment: ${updateError.message}`);
      }

      // Check payment status
      if (paymentIntent.status === 'succeeded') {
        await this.markInstallmentAsPaid(installmentId, paymentIntent.id);

        return {
          success: true,
          installmentId,
          paymentIntentId: paymentIntent.id,
          amount: installment.amount,
          lateFee,
        };
      }
      if (paymentIntent.status === 'requires_action') {
        return {
          success: false,
          installmentId,
          paymentIntentId: paymentIntent.id,
          error: 'Payment requires additional action',
          amount: installment.amount,
          lateFee,
        };
      }
      throw new Error(`Payment failed with status: ${paymentIntent.status}`);
    } catch (error) {
      return {
        success: false,
        installmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process multiple installments in bulk
   */
  async processBulkInstallments(
    installmentIds: string[],
    options: {
      paymentMethodId?: string;
      customerId?: string;
      maxConcurrent?: number;
    } = {}
  ): Promise<BulkProcessingResult> {
    const { maxConcurrent = 5 } = options;
    const results: ProcessingResult[] = [];
    const errors: string[] = [];
    let totalAmount = 0;
    let totalLateFees = 0;
    let successful = 0;
    let failed = 0;

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < installmentIds.length; i += maxConcurrent) {
      const batch = installmentIds.slice(i, i + maxConcurrent);

      const batchPromises = batch.map(async (installmentId) => {
        const result = await this.processInstallmentPayment(
          installmentId,
          options.paymentMethodId,
          options.customerId
        );

        if (result.success) {
          successful++;
          if (result.amount) {
            totalAmount += result.amount;
          }
          if (result.lateFee) {
            totalLateFees += result.lateFee;
          }
        } else {
          failed++;
          if (result.error) {
            errors.push(`${installmentId}: ${result.error}`);
          }
        }

        return result;
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return {
      totalProcessed: installmentIds.length,
      successful,
      failed,
      results,
      summary: {
        totalAmount,
        totalLateFees,
        errors,
      },
    };
  }

  /**
   * Process overdue installments automatically
   */
  async processOverdueInstallments(
    options: {
      maxDaysOverdue?: number;
      maxInstallments?: number;
      dryRun?: boolean;
    } = {}
  ): Promise<BulkProcessingResult> {
    const {
      maxDaysOverdue = 30,
      maxInstallments = 100,
      dryRun = false,
    } = options;

    try {
      // Get overdue installments
      const { data: overdueInstallments, error } = await this.supabase
        .from('overdue_installments_view')
        .select('*')
        .lte('days_overdue', maxDaysOverdue)
        .limit(maxInstallments);

      if (error) {
        throw new Error(
          `Failed to fetch overdue installments: ${error.message}`
        );
      }

      if (!overdueInstallments || overdueInstallments.length === 0) {
        return {
          totalProcessed: 0,
          successful: 0,
          failed: 0,
          results: [],
          summary: {
            totalAmount: 0,
            totalLateFees: 0,
            errors: [],
          },
        };
      }

      if (dryRun) {
        // Return simulation results
        const simulatedResults: ProcessingResult[] = overdueInstallments.map(
          (installment) => ({
            success: true,
            installmentId: installment.id,
            amount: installment.amount,
            lateFee: installment.late_fee || 0,
          })
        );

        return {
          totalProcessed: overdueInstallments.length,
          successful: overdueInstallments.length,
          failed: 0,
          results: simulatedResults,
          summary: {
            totalAmount: overdueInstallments.reduce(
              (sum, i) => sum + i.amount,
              0
            ),
            totalLateFees: overdueInstallments.reduce(
              (sum, i) => sum + (i.late_fee || 0),
              0
            ),
            errors: [],
          },
        };
      }

      // Process the overdue installments
      const installmentIds = overdueInstallments.map((i) => i.id);
      return await this.processBulkInstallments(installmentIds);
    } catch (error) {
      return {
        totalProcessed: 0,
        successful: 0,
        failed: 1,
        results: [],
        summary: {
          totalAmount: 0,
          totalLateFees: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  /**
   * Mark installment as paid
   */
  async markInstallmentAsPaid(
    installmentId: string,
    paymentIntentId: string,
    paymentMethod?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('installments')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        payment_method: paymentMethod || 'stripe',
        stripe_payment_intent_id: paymentIntentId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', installmentId);

    if (error) {
      throw new Error(`Failed to mark installment as paid: ${error.message}`);
    }
  }

  /**
   * Calculate late fee for overdue installment
   */
  private async calculateLateFee(installment: any): Promise<number> {
    const dueDate = new Date(installment.due_date);
    const today = new Date();
    const gracePeriod = addDays(dueDate, this.config.gracePeriodDays!);

    // No late fee if within grace period
    if (isBefore(today, gracePeriod)) {
      return 0;
    }

    // Calculate late fee as percentage of installment amount
    const lateFeeAmount =
      installment.amount * (this.config.lateFeePercentage! / 100);

    // Round to 2 decimal places
    return Math.round(lateFeeAmount * 100) / 100;
  }

  /**
   * Get default payment method for customer
   */
  private async getDefaultPaymentMethod(
    customerId: string
  ): Promise<PaymentMethodInfo | null> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);

      if (customer.deleted) {
        return null;
      }

      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      if (paymentMethods.data.length === 0) {
        return null;
      }

      // Return the first payment method (could be enhanced to find the default)
      const pm = paymentMethods.data[0];
      return {
        id: pm.id,
        type: pm.type,
        card: pm.card
          ? {
              brand: pm.card.brand,
              last4: pm.card.last4,
              exp_month: pm.card.exp_month,
              exp_year: pm.card.exp_year,
            }
          : undefined,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Update overdue installments status
   */
  async updateOverdueStatus(): Promise<{ updated: number; errors: string[] }> {
    try {
      const { data, error } = await this.supabase.rpc(
        'mark_overdue_installments'
      );

      if (error) {
        throw new Error(`Failed to update overdue status: ${error.message}`);
      }

      return {
        updated: data || 0,
        errors: [],
      };
    } catch (error) {
      return {
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get processing statistics
   */
  async getProcessingStats(dateRange?: { from: Date; to: Date }) {
    let query = this.supabase
      .from('payment_performance_metrics')
      .select('*')
      .order('month', { ascending: false });

    if (dateRange) {
      query = query
        .gte('month', format(dateRange.from, 'yyyy-MM-dd'))
        .lte('month', format(dateRange.to, 'yyyy-MM-dd'));
    }

    const { data, error } = await query.limit(12);

    if (error) {
      throw new Error(`Failed to get processing stats: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Retry failed payment
   */
  async retryFailedPayment(
    installmentId: string,
    paymentMethodId?: string
  ): Promise<ProcessingResult> {
    try {
      // Get installment details
      const { data: installment, error } = await this.supabase
        .from('installments')
        .select('*, payment_plans!inner(customers!inner(stripe_customer_id))')
        .eq('id', installmentId)
        .single();

      if (error || !installment) {
        throw new Error(`Installment not found: ${error?.message}`);
      }

      if (installment.status === 'paid') {
        return {
          success: false,
          installmentId,
          error: 'Installment already paid',
        };
      }

      // Cancel previous payment intent if exists
      if (installment.stripe_payment_intent_id) {
        try {
          await this.stripe.paymentIntents.cancel(
            installment.stripe_payment_intent_id
          );
        } catch (_cancelError) {}
      }

      // Process the payment again
      return await this.processInstallmentPayment(
        installmentId,
        paymentMethodId,
        installment.payment_plans.customers.stripe_customer_id
      );
    } catch (error) {
      return {
        success: false,
        installmentId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.canceled':
        await this.handlePaymentIntentCanceled(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      default:
    }
  }

  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const installmentId = paymentIntent.metadata.installment_id;

    if (installmentId) {
      await this.markInstallmentAsPaid(
        installmentId,
        paymentIntent.id,
        'stripe'
      );
    }
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const installmentId = paymentIntent.metadata.installment_id;

    if (installmentId) {
      // Update installment with failure information
      const { error } = await this.supabase
        .from('installments')
        .update({
          metadata: {
            ...paymentIntent.metadata,
            last_payment_error:
              paymentIntent.last_payment_error?.message || 'Payment failed',
            failed_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      if (error) {
      }
    }
  }

  private async handlePaymentIntentCanceled(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<void> {
    const installmentId = paymentIntent.metadata.installment_id;

    if (installmentId) {
      // Clear the payment intent ID from installment
      const { error } = await this.supabase
        .from('installments')
        .update({
          stripe_payment_intent_id: null,
          metadata: {
            ...paymentIntent.metadata,
            canceled_at: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      if (error) {
      }
    }
  }
}

// Export singleton instance
let installmentProcessorInstance: InstallmentProcessor | null = null;

export function getInstallmentProcessor(): InstallmentProcessor {
  if (!installmentProcessorInstance) {
    installmentProcessorInstance = new InstallmentProcessor({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    });
  }

  return installmentProcessorInstance;
}

export default InstallmentProcessor;
