// NeonPro - Installment Management Service
// Story 6.1 - Task 3: Installment Management System
// Comprehensive payment plan and installment processing

import { createClient } from '@supabase/supabase-js';
import { addDays, addMonths, parseISO } from 'date-fns';
import Stripe from 'stripe';
import { logger } from '@/lib/utils/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Types
type PaymentPlan = {
  id?: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  installment_count: number;
  installment_amount: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  start_date: string;
  status: 'active' | 'completed' | 'cancelled' | 'defaulted';
  description?: string;
  metadata?: Record<string, any>;
};

type Installment = {
  id?: string;
  payment_plan_id: string;
  installment_number: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paid_date?: string;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  late_fee?: number;
  metadata?: Record<string, any>;
};

type CreatePaymentPlanRequest = {
  customer_id: string;
  total_amount: number;
  currency?: string;
  installment_count: number;
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  start_date: string;
  description?: string;
  auto_charge?: boolean;
  late_fee_percentage?: number;
  grace_period_days?: number;
  metadata?: Record<string, any>;
};

type ModifyPaymentPlanRequest = {
  installment_count?: number;
  frequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  late_fee_percentage?: number;
  grace_period_days?: number;
  metadata?: Record<string, any>;
};

class InstallmentManager {
  // Create new payment plan
  async createPaymentPlan(
    request: CreatePaymentPlanRequest
  ): Promise<PaymentPlan> {
    try {
      // Validate customer exists
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('id', request.customer_id)
        .single();

      if (customerError || !customer) {
        throw new Error('Customer not found');
      }

      // Calculate installment amount
      const installmentAmount =
        Math.round((request.total_amount / request.installment_count) * 100) /
        100;
      const adjustedTotal = installmentAmount * request.installment_count;

      // Create payment plan
      const paymentPlan: PaymentPlan = {
        customer_id: request.customer_id,
        total_amount: adjustedTotal,
        currency: request.currency || 'BRL',
        installment_count: request.installment_count,
        installment_amount: installmentAmount,
        frequency: request.frequency,
        start_date: request.start_date,
        status: 'active',
        description: request.description,
        metadata: {
          ...request.metadata,
          auto_charge: request.auto_charge,
          late_fee_percentage: request.late_fee_percentage || 0,
          grace_period_days: request.grace_period_days || 0,
          created_by: 'system',
        },
      };

      const { data: createdPlan, error: planError } = await supabase
        .from('payment_plans')
        .insert(paymentPlan)
        .select()
        .single();

      if (planError) {
        throw new Error(`Failed to create payment plan: ${planError.message}`);
      }

      // Generate installments
      await this.generateInstallments(createdPlan.id, request);

      logger.info(
        `Payment plan created: ${createdPlan.id} for customer: ${request.customer_id}`
      );
      return createdPlan;
    } catch (error) {
      logger.error('Error creating payment plan:', error);
      throw error;
    }
  }

  // Generate installments for payment plan
  private async generateInstallments(
    paymentPlanId: string,
    request: CreatePaymentPlanRequest
  ): Promise<void> {
    try {
      const installments: Omit<Installment, 'id'>[] = [];
      let currentDate = parseISO(request.start_date);

      for (let i = 1; i <= request.installment_count; i++) {
        const installment: Omit<Installment, 'id'> = {
          payment_plan_id: paymentPlanId,
          installment_number: i,
          amount:
            Math.round(
              (request.total_amount / request.installment_count) * 100
            ) / 100,
          due_date: currentDate.toISOString(),
          status: 'pending',
          metadata: {
            auto_charge: request.auto_charge,
            grace_period_days: request.grace_period_days || 0,
          },
        };

        installments.push(installment);

        // Calculate next due date based on frequency
        switch (request.frequency) {
          case 'weekly':
            currentDate = addDays(currentDate, 7);
            break;
          case 'biweekly':
            currentDate = addDays(currentDate, 14);
            break;
          case 'monthly':
            currentDate = addMonths(currentDate, 1);
            break;
          case 'quarterly':
            currentDate = addMonths(currentDate, 3);
            break;
        }
      }

      const { error } = await supabase
        .from('installments')
        .insert(installments);

      if (error) {
        throw new Error(`Failed to create installments: ${error.message}`);
      }

      logger.info(
        `Generated ${installments.length} installments for payment plan: ${paymentPlanId}`
      );
    } catch (error) {
      logger.error('Error generating installments:', error);
      throw error;
    }
  }

  // Process installment payment
  async processInstallmentPayment(
    installmentId: string,
    paymentMethodId?: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    try {
      // Get installment details
      const { data: installment, error: installmentError } = await supabase
        .from('installments')
        .select(
          `
          *,
          payment_plan:payment_plans(
            *,
            customer:customers(*)
          )
        `
        )
        .eq('id', installmentId)
        .single();

      if (installmentError || !installment) {
        throw new Error('Installment not found');
      }

      if (
        installment.status !== 'pending' &&
        installment.status !== 'overdue'
      ) {
        throw new Error('Installment is not payable');
      }

      const customer = installment.payment_plan.customer;
      let totalAmount = installment.amount;

      // Calculate late fee if overdue
      if (installment.status === 'overdue') {
        const lateFeePercentage =
          installment.payment_plan.metadata?.late_fee_percentage || 0;
        if (lateFeePercentage > 0) {
          const lateFee =
            Math.round(((installment.amount * lateFeePercentage) / 100) * 100) /
            100;
          totalAmount += lateFee;

          // Update installment with late fee
          await supabase
            .from('installments')
            .update({ late_fee: lateFee })
            .eq('id', installmentId);
        }
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100), // Convert to cents
        currency: installment.payment_plan.currency.toLowerCase(),
        customer: customer.stripe_customer_id,
        payment_method: paymentMethodId,
        confirmation_method: paymentMethodId ? 'automatic' : 'manual',
        confirm: Boolean(paymentMethodId),
        metadata: {
          installment_id: installmentId,
          payment_plan_id: installment.payment_plan_id,
          installment_number: installment.installment_number.toString(),
          ...metadata,
        },
        description: `Installment ${installment.installment_number}/${installment.payment_plan.installment_count} - ${installment.payment_plan.description || 'Payment Plan'}`,
      });

      // Update installment with payment intent
      await supabase
        .from('installments')
        .update({
          stripe_payment_intent_id: paymentIntent.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      // If payment is confirmed, update status
      if (paymentIntent.status === 'succeeded') {
        await this.markInstallmentAsPaid(installmentId, paymentIntent.id);
      }

      logger.info(`Installment payment processed: ${installmentId}`);
      return {
        payment_intent: paymentIntent,
        installment,
        total_amount: totalAmount,
      };
    } catch (error) {
      logger.error('Error processing installment payment:', error);
      throw error;
    }
  }

  // Mark installment as paid
  async markInstallmentAsPaid(
    installmentId: string,
    paymentIntentId: string,
    paymentMethod?: string
  ): Promise<void> {
    try {
      // Update installment status
      await supabase
        .from('installments')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          stripe_payment_intent_id: paymentIntentId,
          payment_method: paymentMethod,
          updated_at: new Date().toISOString(),
        })
        .eq('id', installmentId);

      // Check if all installments are paid
      const { data: installment } = await supabase
        .from('installments')
        .select('payment_plan_id')
        .eq('id', installmentId)
        .single();

      if (installment) {
        await this.checkPaymentPlanCompletion(installment.payment_plan_id);
      }

      logger.info(`Installment marked as paid: ${installmentId}`);
    } catch (error) {
      logger.error('Error marking installment as paid:', error);
      throw error;
    }
  }

  // Check if payment plan is completed
  private async checkPaymentPlanCompletion(
    paymentPlanId: string
  ): Promise<void> {
    try {
      const { data: installments } = await supabase
        .from('installments')
        .select('status')
        .eq('payment_plan_id', paymentPlanId);

      if (installments?.every((inst) => inst.status === 'paid')) {
        await supabase
          .from('payment_plans')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentPlanId);

        logger.info(`Payment plan completed: ${paymentPlanId}`);
      }
    } catch (error) {
      logger.error('Error checking payment plan completion:', error);
    }
  }

  // Get overdue installments
  async getOverdueInstallments(gracePeriodDays = 0): Promise<Installment[]> {
    try {
      const cutoffDate = addDays(new Date(), -gracePeriodDays).toISOString();

      const { data: overdueInstallments, error } = await supabase
        .from('installments')
        .select(
          `
          *,
          payment_plan:payment_plans(
            *,
            customer:customers(*)
          )
        `
        )
        .eq('status', 'pending')
        .lt('due_date', cutoffDate)
        .order('due_date', { ascending: true });

      if (error) {
        throw new Error(`Failed to get overdue installments: ${error.message}`);
      }

      return overdueInstallments || [];
    } catch (error) {
      logger.error('Error getting overdue installments:', error);
      throw error;
    }
  }

  // Mark installments as overdue
  async markInstallmentsAsOverdue(): Promise<number> {
    try {
      const overdueInstallments = await this.getOverdueInstallments();

      if (overdueInstallments.length === 0) {
        return 0;
      }

      const installmentIds = overdueInstallments.map((inst) => inst.id);

      const { error } = await supabase
        .from('installments')
        .update({
          status: 'overdue',
          updated_at: new Date().toISOString(),
        })
        .in('id', installmentIds);

      if (error) {
        throw new Error(
          `Failed to mark installments as overdue: ${error.message}`
        );
      }

      logger.info(
        `Marked ${overdueInstallments.length} installments as overdue`
      );
      return overdueInstallments.length;
    } catch (error) {
      logger.error('Error marking installments as overdue:', error);
      throw error;
    }
  }

  // Modify payment plan
  async modifyPaymentPlan(
    paymentPlanId: string,
    modifications: ModifyPaymentPlanRequest
  ): Promise<PaymentPlan> {
    try {
      // Get current payment plan
      const { data: currentPlan, error: planError } = await supabase
        .from('payment_plans')
        .select('*')
        .eq('id', paymentPlanId)
        .single();

      if (planError || !currentPlan) {
        throw new Error('Payment plan not found');
      }

      if (currentPlan.status !== 'active') {
        throw new Error('Can only modify active payment plans');
      }

      // Check if there are paid installments
      const { data: paidInstallments } = await supabase
        .from('installments')
        .select('id')
        .eq('payment_plan_id', paymentPlanId)
        .eq('status', 'paid');

      const paidCount = paidInstallments?.length || 0;

      // If changing installment count, recalculate remaining installments
      if (
        modifications.installment_count &&
        modifications.installment_count !== currentPlan.installment_count
      ) {
        if (paidCount >= modifications.installment_count) {
          throw new Error(
            'Cannot reduce installment count below paid installments'
          );
        }

        // Cancel pending installments
        await supabase
          .from('installments')
          .update({ status: 'cancelled' })
          .eq('payment_plan_id', paymentPlanId)
          .eq('status', 'pending');

        // Calculate remaining amount
        const paidAmount = paidCount * currentPlan.installment_amount;
        const remainingAmount = currentPlan.total_amount - paidAmount;
        const remainingInstallments =
          modifications.installment_count - paidCount;
        const newInstallmentAmount =
          Math.round((remainingAmount / remainingInstallments) * 100) / 100;

        // Generate new installments
        const { data: lastPaidInstallment } = await supabase
          .from('installments')
          .select('due_date')
          .eq('payment_plan_id', paymentPlanId)
          .eq('status', 'paid')
          .order('installment_number', { ascending: false })
          .limit(1)
          .single();

        let nextDueDate = lastPaidInstallment
          ? parseISO(lastPaidInstallment.due_date)
          : parseISO(currentPlan.start_date);

        // Add frequency interval to get next due date
        switch (modifications.frequency || currentPlan.frequency) {
          case 'weekly':
            nextDueDate = addDays(nextDueDate, 7);
            break;
          case 'biweekly':
            nextDueDate = addDays(nextDueDate, 14);
            break;
          case 'monthly':
            nextDueDate = addMonths(nextDueDate, 1);
            break;
          case 'quarterly':
            nextDueDate = addMonths(nextDueDate, 3);
            break;
        }

        // Create new installments
        const newInstallments: Omit<Installment, 'id'>[] = [];
        for (let i = paidCount + 1; i <= modifications.installment_count; i++) {
          newInstallments.push({
            payment_plan_id: paymentPlanId,
            installment_number: i,
            amount: newInstallmentAmount,
            due_date: nextDueDate.toISOString(),
            status: 'pending',
            metadata: currentPlan.metadata,
          });

          // Calculate next due date
          switch (modifications.frequency || currentPlan.frequency) {
            case 'weekly':
              nextDueDate = addDays(nextDueDate, 7);
              break;
            case 'biweekly':
              nextDueDate = addDays(nextDueDate, 14);
              break;
            case 'monthly':
              nextDueDate = addMonths(nextDueDate, 1);
              break;
            case 'quarterly':
              nextDueDate = addMonths(nextDueDate, 3);
              break;
          }
        }

        await supabase.from('installments').insert(newInstallments);
      }

      // Update payment plan
      const updatedPlan = {
        ...currentPlan,
        ...modifications,
        metadata: {
          ...currentPlan.metadata,
          ...modifications.metadata,
          modified_at: new Date().toISOString(),
        },
        updated_at: new Date().toISOString(),
      };

      const { data: result, error: updateError } = await supabase
        .from('payment_plans')
        .update(updatedPlan)
        .eq('id', paymentPlanId)
        .select()
        .single();

      if (updateError) {
        throw new Error(
          `Failed to update payment plan: ${updateError.message}`
        );
      }

      logger.info(`Payment plan modified: ${paymentPlanId}`);
      return result;
    } catch (error) {
      logger.error('Error modifying payment plan:', error);
      throw error;
    }
  }

  // Cancel payment plan
  async cancelPaymentPlan(
    paymentPlanId: string,
    reason?: string
  ): Promise<void> {
    try {
      // Update payment plan status
      await supabase
        .from('payment_plans')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          metadata: {
            cancellation_reason: reason || 'Manual cancellation',
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentPlanId);

      // Cancel pending installments
      await supabase
        .from('installments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('payment_plan_id', paymentPlanId)
        .in('status', ['pending', 'overdue']);

      logger.info(`Payment plan cancelled: ${paymentPlanId}`);
    } catch (error) {
      logger.error('Error cancelling payment plan:', error);
      throw error;
    }
  }

  // Get payment plan with installments
  async getPaymentPlanDetails(paymentPlanId: string): Promise<any> {
    try {
      const { data: paymentPlan, error } = await supabase
        .from('payment_plans')
        .select(
          `
          *,
          customer:customers(*),
          installments(*)
        `
        )
        .eq('id', paymentPlanId)
        .single();

      if (error) {
        throw new Error(`Failed to get payment plan: ${error.message}`);
      }

      return paymentPlan;
    } catch (error) {
      logger.error('Error getting payment plan details:', error);
      throw error;
    }
  }

  // Get customer payment history
  async getCustomerPaymentHistory(customerId: string): Promise<any> {
    try {
      const { data: paymentPlans, error } = await supabase
        .from('payment_plans')
        .select(
          `
          *,
          installments(*)
        `
        )
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get payment history: ${error.message}`);
      }

      return paymentPlans;
    } catch (error) {
      logger.error('Error getting customer payment history:', error);
      throw error;
    }
  }
}

export const installmentManager = new InstallmentManager();
