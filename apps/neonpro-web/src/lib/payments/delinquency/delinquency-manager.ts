import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { addDays, differenceInDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import nodemailer from 'nodemailer';

// Validation Schemas
const CustomerRiskProfileSchema = z.object({
  customerId: z.string().uuid(),
  riskScore: z.number().min(0).max(1000),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  paymentHistory: z.object({
    totalPayments: z.number(),
    onTimePayments: z.number(),
    latePayments: z.number(),
    averageDelayDays: z.number(),
    lastPaymentDate: z.date().optional(),
  }),
  creditLimit: z.number().optional(),
  lastUpdated: z.date(),
});

const DelinquencyRuleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  triggerConditions: z.object({
    daysOverdue: z.number(),
    amountThreshold: z.number().optional(),
    riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    customerSegment: z.string().optional(),
  }),
  actions: z.array(z.object({
    type: z.enum(['email', 'sms', 'call', 'letter', 'collection_agency', 'legal_action']),
    delay: z.number(), // Days after trigger
    template: z.string(),
    escalation: z.boolean().default(false),
  })),
  isActive: z.boolean().default(true),
});

const PaymentPlanSchema = z.object({
  customerId: z.string().uuid(),
  originalAmount: z.number().positive(),
  negotiatedAmount: z.number().positive(),
  installments: z.number().positive(),
  installmentAmount: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  interestRate: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  terms: z.string(),
  status: z.enum(['pending', 'active', 'completed', 'defaulted']).default('pending'),
});

const NotificationSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['reminder', 'warning', 'final_notice', 'collection', 'legal']),
  channel: z.enum(['email', 'sms', 'call', 'letter']),
  template: z.string(),
  scheduledFor: z.date(),
  sentAt: z.date().optional(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced']),
  metadata: z.record(z.any()).optional(),
});

// Types
type CustomerRiskProfile = z.infer<typeof CustomerRiskProfileSchema>;
type DelinquencyRule = z.infer<typeof DelinquencyRuleSchema>;
type PaymentPlan = z.infer<typeof PaymentPlanSchema>;
type NotificationRecord = z.infer<typeof NotificationSchema>;

interface OverduePayment {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: Date;
  daysOverdue: number;
  type: 'invoice' | 'installment';
  status: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface DelinquencyStats {
  totalOverdue: number;
  totalAmount: number;
  averageDaysOverdue: number;
  riskDistribution: Record<string, number>;
  recoveryRate: number;
  collectionEfficiency: number;
}

interface CollectionWorkflow {
  customerId: string;
  currentStage: string;
  nextAction: {
    type: string;
    scheduledFor: Date;
    template: string;
  };
  history: Array<{
    action: string;
    date: Date;
    result: string;
  }>;
}

/**
 * Delinquency Management System
 * Handles overdue payment detection, escalating notifications, and collection workflows
 */
export class DelinquencyManager {
  private supabase: ReturnType<typeof createClient>;
  private emailTransporter?: nodemailer.Transporter;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    emailConfig?: {
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: { user: string; pass: string };
      };
      from: string;
    }
  ) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    if (emailConfig) {
      this.emailTransporter = nodemailer.createTransporter(emailConfig.smtp);
    }
  }

  /**
   * Detect and process overdue payments
   */
  async detectOverduePayments(): Promise<OverduePayment[]> {
    try {
      // Get overdue invoices
      const { data: overdueInvoices, error: invoiceError } = await this.supabase
        .from('receipts_invoices')
        .select(`
          id,
          number,
          data,
          customer_id,
          customers!inner(name, email, risk_profile)
        `)
        .eq('type', 'invoice')
        .in('status', ['sent', 'overdue'])
        .lt('data->>dueDate', new Date().toISOString());
      
      if (invoiceError) throw invoiceError;
      
      // Get overdue installments
      const { data: overdueInstallments, error: installmentError } = await this.supabase
        .from('payment_installments')
        .select(`
          id,
          amount,
          due_date,
          payment_plan_id,
          payment_plans!inner(
            customer_id,
            customers!inner(name, email, risk_profile)
          )
        `)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());
      
      if (installmentError) throw installmentError;
      
      const overduePayments: OverduePayment[] = [];
      
      // Process overdue invoices
      overdueInvoices?.forEach((invoice: any) => {
        const dueDate = new Date(invoice.data.dueDate);
        const daysOverdue = differenceInDays(new Date(), dueDate);
        
        overduePayments.push({
          id: invoice.id,
          customerId: invoice.customer_id,
          customerName: invoice.customers.name,
          customerEmail: invoice.customers.email,
          amount: parseFloat(invoice.data.total),
          dueDate,
          daysOverdue,
          type: 'invoice',
          status: 'overdue',
          riskLevel: this.calculateRiskLevel(invoice.customers.risk_profile, daysOverdue),
        });
      });
      
      // Process overdue installments
      overdueInstallments?.forEach((installment: any) => {
        const dueDate = new Date(installment.due_date);
        const daysOverdue = differenceInDays(new Date(), dueDate);
        
        overduePayments.push({
          id: installment.id,
          customerId: installment.payment_plans.customer_id,
          customerName: installment.payment_plans.customers.name,
          customerEmail: installment.payment_plans.customers.email,
          amount: installment.amount,
          dueDate,
          daysOverdue,
          type: 'installment',
          status: 'overdue',
          riskLevel: this.calculateRiskLevel(
            installment.payment_plans.customers.risk_profile,
            daysOverdue
          ),
        });
      });
      
      // Update overdue status in database
      await this.updateOverdueStatus(overduePayments);
      
      return overduePayments;
    } catch (error) {
      console.error('Error detecting overdue payments:', error);
      throw error;
    }
  }

  /**
   * Process collection workflows for overdue payments
   */
  async processCollectionWorkflows(): Promise<void> {
    try {
      const overduePayments = await this.detectOverduePayments();
      const rules = await this.getActiveDelinquencyRules();
      
      for (const payment of overduePayments) {
        const applicableRules = rules.filter(rule => 
          this.isRuleApplicable(rule, payment)
        );
        
        for (const rule of applicableRules) {
          await this.executeRule(rule, payment);
        }
      }
    } catch (error) {
      console.error('Error processing collection workflows:', error);
      throw error;
    }
  }

  /**
   * Calculate customer risk score
   */
  async calculateRiskScore(customerId: string): Promise<CustomerRiskProfile> {
    try {
      // Get payment history
      const { data: paymentHistory, error } = await this.supabase.rpc(
        'get_customer_payment_history',
        { customer_id: customerId }
      );
      
      if (error) throw error;
      
      const totalPayments = paymentHistory?.total_payments || 0;
      const onTimePayments = paymentHistory?.on_time_payments || 0;
      const latePayments = paymentHistory?.late_payments || 0;
      const averageDelayDays = paymentHistory?.average_delay_days || 0;
      
      // Calculate risk score (0-1000)
      let riskScore = 0;
      
      // Payment punctuality (40% weight)
      const punctualityScore = totalPayments > 0 ? (onTimePayments / totalPayments) * 400 : 200;
      riskScore += 400 - punctualityScore;
      
      // Average delay (30% weight)
      const delayScore = Math.min(averageDelayDays * 10, 300);
      riskScore += delayScore;
      
      // Payment frequency (20% weight)
      const frequencyScore = totalPayments < 5 ? 200 : Math.max(0, 200 - (totalPayments * 5));
      riskScore += frequencyScore;
      
      // Recent activity (10% weight)
      const lastPaymentDate = paymentHistory?.last_payment_date
        ? new Date(paymentHistory.last_payment_date)
        : null;
      
      const daysSinceLastPayment = lastPaymentDate
        ? differenceInDays(new Date(), lastPaymentDate)
        : 365;
      
      const activityScore = Math.min(daysSinceLastPayment * 0.3, 100);
      riskScore += activityScore;
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskScore <= 250) riskLevel = 'low';
      else if (riskScore <= 500) riskLevel = 'medium';
      else if (riskScore <= 750) riskLevel = 'high';
      else riskLevel = 'critical';
      
      const riskProfile: CustomerRiskProfile = {
        customerId,
        riskScore: Math.round(riskScore),
        riskLevel,
        paymentHistory: {
          totalPayments,
          onTimePayments,
          latePayments,
          averageDelayDays,
          lastPaymentDate,
        },
        lastUpdated: new Date(),
      };
      
      // Save risk profile
      await this.supabase
        .from('customer_risk_profiles')
        .upsert({
          customer_id: customerId,
          risk_score: riskProfile.riskScore,
          risk_level: riskProfile.riskLevel,
          payment_history: riskProfile.paymentHistory,
          last_updated: riskProfile.lastUpdated.toISOString(),
        });
      
      return riskProfile;
    } catch (error) {
      console.error('Error calculating risk score:', error);
      throw error;
    }
  }

  /**
   * Create payment plan for delinquent customer
   */
  async createPaymentPlan(planData: Omit<PaymentPlan, 'status'>): Promise<PaymentPlan> {
    try {
      const validatedData = PaymentPlanSchema.omit({ status: true }).parse(planData);
      
      const paymentPlan: PaymentPlan = {
        ...validatedData,
        status: 'pending',
      };
      
      const { data, error } = await this.supabase
        .from('delinquency_payment_plans')
        .insert({
          customer_id: paymentPlan.customerId,
          original_amount: paymentPlan.originalAmount,
          negotiated_amount: paymentPlan.negotiatedAmount,
          installments: paymentPlan.installments,
          installment_amount: paymentPlan.installmentAmount,
          start_date: paymentPlan.startDate.toISOString(),
          end_date: paymentPlan.endDate.toISOString(),
          interest_rate: paymentPlan.interestRate,
          discount_amount: paymentPlan.discountAmount,
          terms: paymentPlan.terms,
          status: paymentPlan.status,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return paymentPlan;
    } catch (error) {
      console.error('Error creating payment plan:', error);
      throw error;
    }
  }

  /**
   * Send notification to customer
   */
  async sendNotification(
    customerId: string,
    type: 'reminder' | 'warning' | 'final_notice' | 'collection' | 'legal',
    channel: 'email' | 'sms' | 'call' | 'letter',
    templateId: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Get customer info
      const { data: customer, error: customerError } = await this.supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (customerError || !customer) {
        throw new Error('Customer not found');
      }
      
      // Get template
      const { data: template, error: templateError } = await this.supabase
        .from('notification_templates')
        .select('*')
        .eq('id', templateId)
        .single();
      
      if (templateError || !template) {
        throw new Error('Template not found');
      }
      
      let success = false;
      
      if (channel === 'email' && this.emailTransporter) {
        success = await this.sendEmailNotification(customer, template, metadata);
      } else if (channel === 'sms') {
        success = await this.sendSMSNotification(customer, template, metadata);
      }
      
      // Log notification
      await this.supabase
        .from('delinquency_notifications')
        .insert({
          customer_id: customerId,
          type,
          channel,
          template_id: templateId,
          sent_at: success ? new Date().toISOString() : null,
          status: success ? 'sent' : 'failed',
          metadata,
        });
      
      return success;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Get delinquency statistics
   */
  async getDelinquencyStats(dateRange?: { from: Date; to: Date }): Promise<DelinquencyStats> {
    try {
      const { data, error } = await this.supabase.rpc(
        'get_delinquency_statistics',
        {
          start_date: dateRange?.from?.toISOString(),
          end_date: dateRange?.to?.toISOString(),
        }
      );
      
      if (error) throw error;
      
      return {
        totalOverdue: data?.total_overdue || 0,
        totalAmount: data?.total_amount || 0,
        averageDaysOverdue: data?.average_days_overdue || 0,
        riskDistribution: data?.risk_distribution || {},
        recoveryRate: data?.recovery_rate || 0,
        collectionEfficiency: data?.collection_efficiency || 0,
      };
    } catch (error) {
      console.error('Error getting delinquency stats:', error);
      throw error;
    }
  }

  /**
   * Get collection workflow for customer
   */
  async getCollectionWorkflow(customerId: string): Promise<CollectionWorkflow | null> {
    try {
      const { data, error } = await this.supabase
        .from('collection_workflows')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;
      
      return {
        customerId: data.customer_id,
        currentStage: data.current_stage,
        nextAction: {
          type: data.next_action_type,
          scheduledFor: new Date(data.next_action_date),
          template: data.next_action_template,
        },
        history: data.action_history || [],
      };
    } catch (error) {
      console.error('Error getting collection workflow:', error);
      return null;
    }
  }

  // Private methods
  private calculateRiskLevel(
    riskProfile: any,
    daysOverdue: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (daysOverdue > 90) return 'critical';
    if (daysOverdue > 60) return 'high';
    if (daysOverdue > 30) return 'medium';
    return riskProfile?.risk_level || 'low';
  }

  private async updateOverdueStatus(overduePayments: OverduePayment[]): Promise<void> {
    for (const payment of overduePayments) {
      if (payment.type === 'invoice') {
        await this.supabase
          .from('receipts_invoices')
          .update({ status: 'overdue' })
          .eq('id', payment.id);
      } else if (payment.type === 'installment') {
        await this.supabase
          .from('payment_installments')
          .update({ status: 'overdue' })
          .eq('id', payment.id);
      }
    }
  }

  private async getActiveDelinquencyRules(): Promise<DelinquencyRule[]> {
    const { data, error } = await this.supabase
      .from('delinquency_rules')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    
    return data?.map(rule => ({
      id: rule.id,
      name: rule.name,
      description: rule.description,
      triggerConditions: rule.trigger_conditions,
      actions: rule.actions,
      isActive: rule.is_active,
    })) || [];
  }

  private isRuleApplicable(rule: DelinquencyRule, payment: OverduePayment): boolean {
    const conditions = rule.triggerConditions;
    
    if (conditions.daysOverdue && payment.daysOverdue < conditions.daysOverdue) {
      return false;
    }
    
    if (conditions.amountThreshold && payment.amount < conditions.amountThreshold) {
      return false;
    }
    
    if (conditions.riskLevel && payment.riskLevel !== conditions.riskLevel) {
      return false;
    }
    
    return true;
  }

  private async executeRule(rule: DelinquencyRule, payment: OverduePayment): Promise<void> {
    for (const action of rule.actions) {
      const scheduledFor = addDays(new Date(), action.delay);
      
      // Check if this action was already scheduled
      const { data: existing } = await this.supabase
        .from('delinquency_notifications')
        .select('id')
        .eq('customer_id', payment.customerId)
        .eq('type', action.type)
        .eq('template_id', action.template)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (existing && existing.length > 0) {
        continue; // Skip if already scheduled
      }
      
      if (action.delay === 0) {
        // Execute immediately
        await this.sendNotification(
          payment.customerId,
          action.type as any,
          'email', // Default to email
          action.template
        );
      } else {
        // Schedule for later
        await this.supabase
          .from('scheduled_notifications')
          .insert({
            customer_id: payment.customerId,
            type: action.type,
            channel: 'email',
            template_id: action.template,
            scheduled_for: scheduledFor.toISOString(),
            rule_id: rule.id,
            payment_id: payment.id,
          });
      }
    }
  }

  private async sendEmailNotification(
    customer: any,
    template: any,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    if (!this.emailTransporter) return false;
    
    try {
      const subject = this.processTemplate(template.subject, customer, metadata);
      const html = this.processTemplate(template.content, customer, metadata);
      
      await this.emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@neonpro.com',
        to: customer.email,
        subject,
        html,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  private async sendSMSNotification(
    customer: any,
    template: any,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    // Placeholder for SMS integration
    // Would integrate with services like Twilio, AWS SNS, etc.
    console.log('SMS notification would be sent to:', customer.phone);
    return true;
  }

  private processTemplate(
    template: string,
    customer: any,
    metadata?: Record<string, any>
  ): string {
    let processed = template
      .replace(/{{customerName}}/g, customer.name)
      .replace(/{{customerEmail}}/g, customer.email)
      .replace(/{{currentDate}}/g, format(new Date(), 'dd/MM/yyyy', { locale: ptBR }));
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        processed = processed.replace(
          new RegExp(`{{${key}}}`, 'g'),
          String(value)
        );
      });
    }
    
    return processed;
  }
}

// Export types for external use
export type {
  CustomerRiskProfile,
  DelinquencyRule,
  PaymentPlan,
  NotificationRecord,
  OverduePayment,
  DelinquencyStats,
  CollectionWorkflow,
};
