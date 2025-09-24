/**
 * Financial Management Service for Aesthetic Clinics
 * Comprehensive billing, payment processing, and financial analytics
 * Brazilian tax compliance and multi-currency support
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Input schemas
const FinancialAccountInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  accountType: z.enum(['checking', 'savings', 'investment', 'credit', 'loan']),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  bankBranch: z.string().optional(),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  openingBalance: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  metadata: z.record(z.any()).default({}),
})

const ServicePriceInputSchema = z.object({
  clinicId: z.string().uuid(),
  serviceId: z.string().uuid(),
  professionalCouncilType: z.enum(['CFM', 'COREN', 'CFF', 'CNEP']),
  basePrice: z.number().min(0),
  durationMinutes: z.number().min(1),
  costOfMaterials: z.number().min(0).default(0),
  professionalCommissionRate: z.number().min(0).max(100).default(0),
  clinicRevenueRate: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  notes: z.string().optional(),
})

const TreatmentPackageInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  packageType: z.enum(['session_bundle', 'treatment_combo', 'membership', 'loyalty_reward']),
  totalSessions: z.number().min(1),
  validityDays: z.number().min(1),
  originalPrice: z.number().min(0),
  packagePrice: z.number().min(0),
  discountPercentage: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
  maxPackagesPerPatient: z.number().min(1).default(1),
  requirements: z.array(z.any()).default([]),
  benefits: z.array(z.any()).default([]),
  termsConditions: z.string().optional(),
})

const InvoiceInputSchema = z.object({
  clinicId: z.string().uuid(),
  patientId: z.string().uuid(),
  invoiceType: z.enum(['service', 'package', 'product', 'adjustment', 'refund']),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    itemType: z.enum(['service', 'product', 'package', 'adjustment', 'tax', 'discount']),
    description: z.string().min(1),
    quantity: z.number().min(1),
    unitPrice: z.number().min(0),
    taxRate: z.number().min(0).max(100).default(0),
    discountPercentage: z.number().min(0).max(100).default(0),
    referenceId: z.string().uuid().optional(),
    metadata: z.record(z.any()).default({}),
  })),
})

const PaymentTransactionInputSchema = z.object({
  clinicId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  transactionId: z.string().min(1),
  paymentMethod: z.enum([
    'credit_card',
    'debit_card',
    'bank_transfer',
    'pix',
    'boleto',
    'cash',
    'check',
    'installment',
  ]),
  paymentProvider: z.enum(['stripe', 'mercadopago', 'pagseguro', 'manual']),
  amount: z.number().min(0),
  currency: z.enum(['BRL', 'USD', 'EUR']).default('BRL'),
  installments: z.number().min(1).default(1),
  installmentNumber: z.number().min(1).default(1),
  totalInstallments: z.number().min(1).default(1),
  feeAmount: z.number().min(0).default(0),
  settlementDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.any()).default({}),
})

const ProfessionalCommissionInputSchema = z.object({
  clinicId: z.string().uuid(),
  professionalId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  appointmentId: z.string().uuid().optional(),
  commissionType: z.enum(['service', 'product', 'package', 'bonus', 'adjustment']),
  baseAmount: z.number().min(0),
  commissionRate: z.number().min(0).max(100),
  notes: z.string().optional(),
  metadata: z.record(z.any()).default({}),
})

const FinancialGoalInputSchema = z.object({
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(100),
  goalType: z.enum(['revenue', 'profit', 'new_patients', 'retention_rate', 'average_ticket']),
  targetValue: z.number().min(0),
  period: z.enum(['monthly', 'quarterly', 'yearly']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  notes: z.string().optional(),
})

// Type definitions
export type FinancialAccountInput = z.infer<typeof FinancialAccountInputSchema>
export type ServicePriceInput = z.infer<typeof ServicePriceInputSchema>
export type TreatmentPackageInput = z.infer<typeof TreatmentPackageInputSchema>
export type InvoiceInput = z.infer<typeof InvoiceInputSchema>
export type PaymentTransactionInput = z.infer<typeof PaymentTransactionInputSchema>
export type ProfessionalCommissionInput = z.infer<typeof ProfessionalCommissionInputSchema>
export type FinancialGoalInput = z.infer<typeof FinancialGoalInputSchema>

export interface FinancialAccount {
  id: string
  clinic_id: string
  name: string
  account_type: string
  account_number?: string
  bank_name?: string
  bank_branch?: string
  currency: string
  opening_balance: number
  current_balance: number
  is_active: boolean
  is_default: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ServicePrice {
  id: string
  clinic_id: string
  service_id: string
  professional_council_type: string
  base_price: number
  duration_minutes: number
  cost_of_materials: number
  professional_commission_rate: number
  clinic_revenue_rate: number
  is_active: boolean
  effective_date: string
  end_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface TreatmentPackage {
  id: string
  clinic_id: string
  name: string
  description?: string
  package_type: string
  total_sessions: number
  validity_days: number
  original_price: number
  package_price: number
  discount_percentage: number
  is_active: boolean
  max_packages_per_patient: number
  requirements: any[]
  benefits: any[]
  terms_conditions?: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  clinic_id: string
  patient_id: string
  invoice_number: string
  invoice_type: string
  status: string
  issue_date: string
  due_date: string
  payment_date?: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  balance_due: number
  payment_terms?: string
  notes?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  items: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  item_type: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  tax_rate: number
  tax_amount: number
  discount_amount: number
  discount_percentage: number
  net_amount: number
  reference_id?: string
  metadata: Record<string, any>
  created_at: string
}

export interface PaymentTransaction {
  id: string
  clinic_id: string
  invoice_id?: string
  patient_id: string
  transaction_id: string
  payment_method: string
  payment_provider: string
  status: string
  amount: number
  currency: string
  installments: number
  installment_number: number
  total_installments: number
  fee_amount: number
  net_amount: number
  transaction_date: string
  settlement_date?: string
  failure_reason?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ProfessionalCommission {
  id: string
  clinic_id: string
  professional_id: string
  invoice_id?: string
  appointment_id?: string
  commission_type: string
  base_amount: number
  commission_rate: number
  commission_amount: number
  status: string
  payment_date?: string
  notes?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: string
  clinic_id: string
  name: string
  goal_type: string
  target_value: number
  current_value: number
  period: string
  start_date: string
  end_date: string
  status: string
  progress_percentage: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface FinancialReport {
  period: {
    start_date: string
    end_date: string
    month: number
    year: number
  }
  revenue: number
  expenses: number
  appointments: number
  new_patients: number
  average_ticket: number
  payment_methods: Record<string, number>
}

export class FinancialManagementService {
  private supabase: SupabaseClient

  constructor(config: { supabaseUrl: string; supabaseKey: string }) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey)
  }

  // Financial Account Management
  async createFinancialAccount(account: FinancialAccountInput): Promise<FinancialAccount> {
    const validatedAccount = FinancialAccountInputSchema.parse(account)

    const { data, error } = await this.supabase
      .from('financial_accounts')
      .insert({
        clinic_id: validatedAccount.clinicId,
        name: validatedAccount.name,
        account_type: validatedAccount.accountType,
        account_number: validatedAccount.accountNumber,
        bank_name: validatedAccount.bankName,
        bank_branch: validatedAccount.bankBranch,
        currency: validatedAccount.currency,
        opening_balance: validatedAccount.openingBalance,
        current_balance: validatedAccount.openingBalance,
        is_active: validatedAccount.isActive,
        is_default: validatedAccount.isDefault,
        metadata: validatedAccount.metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create financial account: ${error.message}`)
    }

    return data
  }

  async updateFinancialAccount(
    id: string,
    updates: Partial<FinancialAccountInput>,
  ): Promise<FinancialAccount> {
    const { data, error } = await this.supabase
      .from('financial_accounts')
      .update({
        name: updates.name,
        account_type: updates.accountType,
        account_number: updates.accountNumber,
        bank_name: updates.bankName,
        bank_branch: updates.bankBranch,
        is_active: updates.isActive,
        is_default: updates.isDefault,
        metadata: updates.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update financial account: ${error.message}`)
    }

    return data
  }

  async getFinancialAccounts(clinicId: string): Promise<FinancialAccount[]> {
    const { data, error } = await this.supabase
      .from('financial_accounts')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch financial accounts: ${error.message}`)
    }

    return data || []
  }

  // Service Pricing Management
  async createServicePrice(price: ServicePriceInput): Promise<ServicePrice> {
    const validatedPrice = ServicePriceInputSchema.parse(price)

    const { data, error } = await this.supabase
      .from('service_prices')
      .insert({
        clinic_id: validatedPrice.clinicId,
        service_id: validatedPrice.serviceId,
        professional_council_type: validatedPrice.professionalCouncilType,
        base_price: validatedPrice.basePrice,
        duration_minutes: validatedPrice.durationMinutes,
        cost_of_materials: validatedPrice.costOfMaterials,
        professional_commission_rate: validatedPrice.professionalCommissionRate,
        clinic_revenue_rate: validatedPrice.clinicRevenueRate,
        is_active: validatedPrice.isActive,
        effective_date: validatedPrice.effectiveDate,
        end_date: validatedPrice.endDate,
        notes: validatedPrice.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create service price: ${error.message}`)
    }

    return data
  }

  async getServicePrices(clinicId: string, serviceId?: string): Promise<ServicePrice[]> {
    let query = this.supabase
      .from('service_prices')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)

    if (serviceId) {
      query = query.eq('service_id', serviceId)
    }

    const { data, error } = await query.order('effective_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch service prices: ${error.message}`)
    }

    return data || []
  }

  // Treatment Package Management
  async createTreatmentPackage(pkg: TreatmentPackageInput): Promise<TreatmentPackage> {
    const validatedPackage = TreatmentPackageInputSchema.parse(pkg)

    const { data, error } = await this.supabase
      .from('treatment_packages')
      .insert({
        clinic_id: validatedPackage.clinicId,
        name: validatedPackage.name,
        description: validatedPackage.description,
        package_type: validatedPackage.packageType,
        total_sessions: validatedPackage.totalSessions,
        validity_days: validatedPackage.validityDays,
        original_price: validatedPackage.originalPrice,
        package_price: validatedPackage.packagePrice,
        discount_percentage: validatedPackage.discountPercentage,
        is_active: validatedPackage.isActive,
        max_packages_per_patient: validatedPackage.maxPackagesPerPatient,
        requirements: validatedPackage.requirements,
        benefits: validatedPackage.benefits,
        terms_conditions: validatedPackage.termsConditions,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create treatment package: ${error.message}`)
    }

    return data
  }

  async getTreatmentPackages(clinicId: string): Promise<TreatmentPackage[]> {
    const { data, error } = await this.supabase
      .from('treatment_packages')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch treatment packages: ${error.message}`)
    }

    return data || []
  }

  // Invoice Management
  async createInvoice(invoice: InvoiceInput): Promise<Invoice> {
    const validatedInvoice = InvoiceInputSchema.parse(invoice)

    // Generate invoice number
    const { data: invoiceNumber, error: invoiceNumberError } = await this.supabase
      .rpc('generate_invoice_number', { p_clinic_id: validatedInvoice.clinicId })

    if (invoiceNumberError) {
      throw new Error(`Failed to generate invoice number: ${invoiceNumberError.message}`)
    }

    // Calculate totals
    let subtotal = 0
    let taxAmount = 0
    let discountAmount = 0

    const invoiceItems = validatedInvoice.items.map((item) => {
      const totalPrice = item.quantity * item.unitPrice
      const taxAmountItem = totalPrice * item.taxRate / 100
      const discountAmountItem = totalPrice * item.discountPercentage / 100
      const netAmount = totalPrice + taxAmountItem - discountAmountItem

      subtotal += totalPrice
      taxAmount += taxAmountItem
      discountAmount += discountAmountItem

      return {
        item_type: item.itemType,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: totalPrice,
        tax_rate: item.taxRate,
        tax_amount: taxAmountItem,
        discount_amount: discountAmountItem,
        discount_percentage: item.discountPercentage,
        net_amount: netAmount,
        reference_id: item.referenceId,
        metadata: item.metadata,
      }
    })

    const totalAmount = subtotal + taxAmount - discountAmount

    // Create invoice
    const { data: invoiceData, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert({
        clinic_id: validatedInvoice.clinicId,
        patient_id: validatedInvoice.patientId,
        invoice_number: invoiceNumber,
        invoice_type: validatedInvoice.invoiceType,
        status: 'draft',
        issue_date: validatedInvoice.issueDate,
        due_date: validatedInvoice.dueDate,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        paid_amount: 0,
        payment_terms: validatedInvoice.paymentTerms,
        notes: validatedInvoice.notes,
      })
      .select()
      .single()

    if (invoiceError) {
      throw new Error(`Failed to create invoice: ${invoiceError.message}`)
    }

    // Create invoice items
    const itemsWithInvoiceId = invoiceItems.map((item) => ({
      ...item,
      invoice_id: invoiceData.id,
    }))

    const { error: itemsError } = await this.supabase
      .from('invoice_items')
      .insert(itemsWithInvoiceId)

    if (itemsError) {
      throw new Error(`Failed to create invoice items: ${itemsError.message}`)
    }

    // Get complete invoice with items
    return await this.getInvoice(invoiceData.id)
  }

  async getInvoice(id: string): Promise<Invoice> {
    const { data: invoice, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Failed to fetch invoice: ${error.message}`)
    }

    return {
      ...invoice,
      items: invoice.invoice_items,
    }
  }

  async getInvoices(clinicId: string, filters?: {
    status?: string
    patientId?: string
    startDate?: string
    endDate?: string
  }): Promise<Invoice[]> {
    let query = this.supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('clinic_id', clinicId)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId)
    }
    if (filters?.startDate) {
      query = query.gte('issue_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('issue_date', filters.endDate)
    }

    const { data, error } = await query.order('issue_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch invoices: ${error.message}`)
    }

    return data.map((invoice) => ({
      ...invoice,
      items: invoice.invoice_items,
    })) || []
  }

  // Payment Management
  async createPaymentTransaction(payment: PaymentTransactionInput): Promise<PaymentTransaction> {
    const validatedPayment = PaymentTransactionInputSchema.parse(payment)

    const { data, error } = await this.supabase
      .from('payment_transactions')
      .insert({
        clinic_id: validatedPayment.clinicId,
        invoice_id: validatedPayment.invoiceId,
        patient_id: validatedPayment.patientId,
        transaction_id: validatedPayment.transactionId,
        payment_method: validatedPayment.paymentMethod,
        payment_provider: validatedPayment.paymentProvider,
        status: validatedPayment.paymentProvider === 'manual' ? 'succeeded' : 'pending',
        amount: validatedPayment.amount,
        currency: validatedPayment.currency,
        installments: validatedPayment.installments,
        installment_number: validatedPayment.installmentNumber,
        total_installments: validatedPayment.totalInstallments,
        fee_amount: validatedPayment.feeAmount,
        settlement_date: validatedPayment.settlementDate,
        failure_reason: validatedPayment.failureReason,
        metadata: validatedPayment.metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create payment transaction: ${error.message}`)
    }

    // Update invoice paid amount if payment is successful
    if (data.status === 'succeeded' && data.invoice_id) {
      await this.updateInvoicePaidAmount(data.invoice_id, data.amount)
    }

    return data
  }

  async updateInvoicePaidAmount(invoiceId: string, amount: number): Promise<void> {
    const { data: invoice, error: fetchError } = await this.supabase
      .from('invoices')
      .select('paid_amount, total_amount, status')
      .eq('id', invoiceId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch invoice: ${fetchError.message}`)
    }

    const newPaidAmount = invoice.paid_amount + amount
    const newStatus = newPaidAmount >= invoice.total_amount
      ? 'paid'
      : newPaidAmount > 0
      ? 'partial'
      : invoice.status

    const { error: updateError } = await this.supabase
      .from('invoices')
      .update({
        paid_amount: newPaidAmount,
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', invoiceId)

    if (updateError) {
      throw new Error(`Failed to update invoice: ${updateError.message}`)
    }
  }

  async getPaymentTransactions(clinicId: string, filters?: {
    status?: string
    patientId?: string
    startDate?: string
    endDate?: string
  }): Promise<PaymentTransaction[]> {
    let query = this.supabase
      .from('payment_transactions')
      .select('*')
      .eq('clinic_id', clinicId)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId)
    }
    if (filters?.startDate) {
      query = query.gte('transaction_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('transaction_date', filters.endDate)
    }

    const { data, error } = await query.order('transaction_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch payment transactions: ${error.message}`)
    }

    return data || []
  }

  // Professional Commission Management
  async createProfessionalCommission(
    commission: ProfessionalCommissionInput,
  ): Promise<ProfessionalCommission> {
    const validatedCommission = ProfessionalCommissionInputSchema.parse(commission)

    const commissionAmount = validatedCommission.baseAmount
      * validatedCommission.commissionRate
      / 100

    const { data, error } = await this.supabase
      .from('professional_commissions')
      .insert({
        clinic_id: validatedCommission.clinicId,
        professional_id: validatedCommission.professionalId,
        invoice_id: validatedCommission.invoiceId,
        appointment_id: validatedCommission.appointmentId,
        commission_type: validatedCommission.commissionType,
        base_amount: validatedCommission.baseAmount,
        commission_rate: validatedCommission.commissionRate,
        commission_amount: commissionAmount,
        status: 'pending',
        notes: validatedCommission.notes,
        metadata: validatedCommission.metadata,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create professional commission: ${error.message}`)
    }

    return data
  }

  async getProfessionalCommissions(
    clinicId: string,
    professionalId?: string,
  ): Promise<ProfessionalCommission[]> {
    let query = this.supabase
      .from('professional_commissions')
      .select('*')
      .eq('clinic_id', clinicId)

    if (professionalId) {
      query = query.eq('professional_id', professionalId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch professional commissions: ${error.message}`)
    }

    return data || []
  }

  // Financial Goals Management
  async createFinancialGoal(goal: FinancialGoalInput): Promise<FinancialGoal> {
    const validatedGoal = FinancialGoalInputSchema.parse(goal)

    const { data, error } = await this.supabase
      .from('financial_goals')
      .insert({
        clinic_id: validatedGoal.clinicId,
        name: validatedGoal.name,
        goal_type: validatedGoal.goalType,
        target_value: validatedGoal.targetValue,
        current_value: 0,
        period: validatedGoal.period,
        start_date: validatedGoal.startDate,
        end_date: validatedGoal.endDate,
        status: 'active',
        notes: validatedGoal.notes,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create financial goal: ${error.message}`)
    }

    return data
  }

  async updateFinancialGoalProgress(goalId: string, currentValue: number): Promise<FinancialGoal> {
    const { data: goal, error: fetchError } = await this.supabase
      .from('financial_goals')
      .select('target_value, current_value, status')
      .eq('id', goalId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch financial goal: ${fetchError.message}`)
    }

    const newStatus = currentValue >= goal.target_value ? 'completed' : goal.status

    const { data, error } = await this.supabase
      .from('financial_goals')
      .update({
        current_value: currentValue,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update financial goal: ${error.message}`)
    }

    return data
  }

  async getFinancialGoals(clinicId: string): Promise<FinancialGoal[]> {
    const { data, error } = await this.supabase
      .from('financial_goals')
      .select('*')
      .eq('clinic_id', clinicId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch financial goals: ${error.message}`)
    }

    return data || []
  }

  // Financial Analytics and Reports
  async generateFinancialReport(clinicId: string, reportDate: string): Promise<FinancialReport> {
    const { data, error } = await this.supabase
      .rpc('generate_monthly_financial_report', {
        p_clinic_id: clinicId,
        p_report_date: reportDate,
      })

    if (error) {
      throw new Error(`Failed to generate financial report: ${error.message}`)
    }

    return data
  }

  async getFinancialDashboard(clinicId: string): Promise<{
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    pendingInvoices: number
    overdueInvoices: number
    upcomingAppointments: number
    monthlyGrowth: number
    averageTicket: number
    topServices: Array<{ service_name: string; revenue: number; count: number }>
  }> {
    // Get current month data
    const currentDate = new Date()
    const currentMonthStart =
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0]
    const currentMonthEnd =
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split(
        'T',
      )[0]

    // Get previous month data for growth calculation
    const previousMonthStart =
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().split(
        'T',
      )[0]
    const previousMonthEnd =
      new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString().split('T')[0]

    // Current month revenue
    const { data: currentRevenue } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .in('status', ['paid', 'partial'])
      .gte('issue_date', currentMonthStart)
      .lte('issue_date', currentMonthEnd)

    const totalRevenue = currentRevenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0

    // Previous month revenue
    const { data: previousRevenue } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .in('status', ['paid', 'partial'])
      .gte('issue_date', previousMonthStart)
      .lte('issue_date', previousMonthEnd)

    const previousMonthRevenue = previousRevenue?.reduce((sum, inv) => sum + inv.total_amount, 0)
      || 0

    // Calculate monthly growth
    const monthlyGrowth = previousMonthRevenue > 0
      ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0

    // Current month expenses (payments made)
    const { data: currentExpenses } = await this.supabase
      .from('payment_transactions')
      .select('net_amount')
      .eq('clinic_id', clinicId)
      .eq('status', 'succeeded')
      .gte('transaction_date', currentMonthStart)
      .lte('transaction_date', currentMonthEnd)

    const totalExpenses = currentExpenses?.reduce((sum, payment) => sum + payment.net_amount, 0)
      || 0

    // Net profit
    const netProfit = totalRevenue - totalExpenses

    // Pending and overdue invoices
    const { data: pendingInvoices } = await this.supabase
      .from('invoices')
      .select('id, due_date')
      .eq('clinic_id', clinicId)
      .in('status', ['draft', 'pending'])

    const now: string = new Date().toISOString().split('T')[0] || ''
    const pendingCount = pendingInvoices?.filter((inv) => (inv.due_date || '') >= now).length || 0
    const overdueCount = pendingInvoices?.filter((inv) => (inv.due_date || '') < now).length || 0

    // Upcoming appointments
    const { data: upcomingAppointments } = await this.supabase
      .from('appointments')
      .select('id')
      .eq('clinic_id', clinicId)
      .gte('appointment_date', now)
      .lte('appointment_date', currentMonthEnd)

    // Average ticket
    const { data: paidInvoices } = await this.supabase
      .from('invoices')
      .select('total_amount')
      .eq('clinic_id', clinicId)
      .in('status', ['paid', 'partial'])
      .gte('issue_date', currentMonthStart)
      .lte('issue_date', currentMonthEnd)

    const averageTicket = paidInvoices && paidInvoices.length > 0
      ? paidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0) / paidInvoices.length
      : 0

    // Top services by revenue
    const { data: topServicesData } = await this.supabase
      .from('invoice_items')
      .select(`
        item_type,
        description,
        total_price,
        quantity
      `)
      .eq('clinic_id', clinicId)
      .eq('item_type', 'service')
      .gte('created_at', currentMonthStart)
      .lte('created_at', currentMonthEnd)

    const serviceRevenue = new Map<string, { revenue: number; count: number }>()
    topServicesData?.forEach((item) => {
      const current = serviceRevenue.get(item.description) || { revenue: 0, count: 0 }
      serviceRevenue.set(item.description, {
        revenue: current.revenue + item.total_price,
        count: current.count + item.quantity,
      })
    })

    const topServices = Array.from(serviceRevenue.entries())
      .map(([service_name, data]) => ({ service_name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      pendingInvoices: pendingCount,
      overdueInvoices: overdueCount,
      upcomingAppointments: upcomingAppointments?.length || 0,
      monthlyGrowth,
      averageTicket,
      topServices,
    }
  }

  // Tax Configuration Management
  async getTaxConfigurations(clinicId: string): Promise<
    Array<{
      id: string
      tax_type: string
      tax_rate: number
      is_active: boolean
      effective_date: string
      end_date?: string
      description?: string
    }>
  > {
    const { data, error } = await this.supabase
      .from('tax_configurations')
      .select('*')
      .eq('clinic_id', clinicId)
      .eq('is_active', true)
      .order('effective_date', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch tax configurations: ${error.message}`)
    }

    return data || []
  }

  // Brazilian financial operations
  async generateNFSe(_invoiceId: string): Promise<{
    nfse_number: string
    verification_code: string
    issuance_date: string
    pdf_url?: string
  }> {
    // This would integrate with Brazilian NFSe emission service
    // For now, returning mock data
    return {
      nfse_number: `NFSE-${Date.now()}`,
      verification_code: Math.random().toString(36).substring(2, 15),
      issuance_date: new Date().toISOString().split('T')[0] || '',
    }
  }

  async processPixPayment(paymentData: {
    amount: number
    patientId: string
    invoiceId?: string
    clinicId: string
  }): Promise<PaymentTransaction> {
    const pixId = `pix_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    return this.createPaymentTransaction({
      clinicId: paymentData.clinicId,
      invoiceId: paymentData.invoiceId,
      patientId: paymentData.patientId,
      transactionId: pixId,
      paymentMethod: 'pix',
      paymentProvider: 'manual',
      amount: paymentData.amount,
      currency: 'BRL',
      installments: 1,
      installmentNumber: 1,
      totalInstallments: 1,
      feeAmount: 0,
      metadata: {
        pix_id: pixId,
        created_at: new Date().toISOString(),
      },
    })
  }

  async calculateBoleto(invoiceId: string, dueDays: number = 5): Promise<{
    barcode: string
    digitable_line: string
    due_date: string
    amount: number
    pdf_url?: string
  }> {
    const invoice = await this.getInvoice(invoiceId)

    // Generate barcode and digitable line
    const barcode = this.generateBoletoBarcode((invoice as any).total_amount, dueDays)
    const digitable_line = this.generateDigitableLine(barcode)
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    return {
      barcode,
      digitable_line,
      due_date: dueDate.toISOString().split('T')[0] || '',
      amount: invoice.total_amount,
    }
  }

  private generateBoletoBarcode(amount: number, dueDays: number): string {
    // Simplified barcode generation for Brazilian boleto
    const bankCode = '001' // Banco do Brasil
    const currencyCode = '9' // Real
    const amountField = amount.toString().padStart(10, '0')
    const dueDateField = this.getBoletoDueDateFactor(dueDays)

    return `${bankCode}${currencyCode}${dueDateField}${amountField}${
      Math.random().toString(36).substring(2, 10)
    }`
  }

  private generateDigitableLine(barcode: string): string {
    // Convert barcode to digitable line
    return barcode.match(/.{1,5}/g)?.join(' ') || barcode
  }

  private getBoletoDueDateFactor(dueDays: number): string {
    const baseDate = new Date('1997-10-07')
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)

    const daysDiff = Math.floor((dueDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysDiff.toString().padStart(4, '0')
  }
}
