// ================================================
// FINANCIAL SERVICE
// Centralized financial management microservice
// ================================================

import { createClient } from '@supabase/supabase-js';
import { config } from './configuration';
import { monitoring } from './monitoring';

// ================================================
// TYPES AND INTERFACES
// ================================================

interface FinancialTransaction {
  id: string;
  tenantId: string;
  patientId?: string;
  appointmentId?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  dueDate?: Date;
  paidDate?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

interface PaymentPlan {
  id: string;
  tenantId: string;
  patientId: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  installments: PaymentInstallment[];
  status: PaymentPlanStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface PaymentInstallment {
  id: string;
  paymentPlanId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: InstallmentStatus;
  paymentMethod?: PaymentMethod;
  transactionId?: string;
  lateFee?: number;
  discount?: number;
}

interface Invoice {
  id: string;
  tenantId: string;
  patientId: string;
  invoiceNumber: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;
  paymentMethod?: PaymentMethod;
  notes?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceItem {
  id: string;
  serviceId: string;
  serviceName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

interface FinancialReport {
  id: string;
  tenantId: string;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  data: ReportData;
  generatedAt: Date;
  generatedBy: string;
}

interface ReportData {
  revenue: RevenueData;
  expenses: ExpenseData;
  profitLoss: ProfitLossData;
  cashFlow: CashFlowData;
  receivables: ReceivablesData;
  taxes: TaxData;
}

interface RevenueData {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  revenueByService: Record<string, number>;
  revenueByMonth: Record<string, number>;
  averageTransactionValue: number;
}

interface ExpenseData {
  totalExpenses: number;
  expensesByCategory: Record<string, number>;
  expensesByMonth: Record<string, number>;
}

interface ProfitLossData {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  operatingExpenses: number;
  ebitda: number;
}

interface CashFlowData {
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  cashFlowByMonth: Record<string, number>;
}

interface ReceivablesData {
  totalReceivables: number;
  currentReceivables: number;
  overdueReceivables: number;
  averageCollectionPeriod: number;
}

interface TaxData {
  totalTaxes: number;
  taxesByType: Record<string, number>;
  taxLiabilities: number;
}

// ================================================
// ENUMS
// ================================================

enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  REFUND = 'refund',
}

enum TransactionCategory {
  SERVICE_PAYMENT = 'service_payment',
  PRODUCT_SALE = 'product_sale',
  CONSULTATION_FEE = 'consultation_fee',
  TREATMENT_PAYMENT = 'treatment_payment',
  OFFICE_SUPPLIES = 'office_supplies',
  EQUIPMENT = 'equipment',
  RENT = 'rent',
  UTILITIES = 'utilities',
  SALARIES = 'salaries',
  MARKETING = 'marketing',
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  OTHER = 'other',
}

enum TransactionStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  CHECK = 'check',
  PAYMENT_PLAN = 'payment_plan',
  INSURANCE = 'insurance',
}

enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

enum InstallmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

enum ReportType {
  REVENUE = 'revenue',
  EXPENSES = 'expenses',
  PROFIT_LOSS = 'profit_loss',
  CASH_FLOW = 'cash_flow',
  RECEIVABLES = 'receivables',
  TAX = 'tax',
  COMPREHENSIVE = 'comprehensive',
}

// ================================================
// REQUEST/RESPONSE TYPES
// ================================================

interface CreateTransactionRequest {
  tenantId: string;
  patientId?: string;
  appointmentId?: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  currency?: string;
  description: string;
  paymentMethod?: PaymentMethod;
  dueDate?: Date;
  metadata?: Record<string, any>;
}

interface CreatePaymentPlanRequest {
  tenantId: string;
  patientId: string;
  totalAmount: number;
  currency?: string;
  numberOfInstallments: number;
  firstInstallmentDate: Date;
  installmentInterval: 'monthly' | 'weekly' | 'biweekly';
}

interface CreateInvoiceRequest {
  tenantId: string;
  patientId: string;
  items: Omit<InvoiceItem, 'id' | 'taxAmount' | 'totalPrice'>[];
  dueDate: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

interface FinancialFilters {
  tenantId?: string;
  patientId?: string;
  type?: TransactionType;
  category?: TransactionCategory;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  dateFrom?: Date;
  dateTo?: Date;
  amountMin?: number;
  amountMax?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ================================================
// FINANCIAL SERVICE
// ================================================

export class FinancialService {
  private static instance: FinancialService;
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  private defaultCurrency = 'BRL';
  private taxRate = 0.1; // 10% default tax rate

  private constructor() {
    this.initializeConfiguration();
  }

  public static getInstance(): FinancialService {
    if (!FinancialService.instance) {
      FinancialService.instance = new FinancialService();
    }
    return FinancialService.instance;
  }

  // ================================================
  // TRANSACTION MANAGEMENT
  // ================================================

  async createTransaction(
    request: CreateTransactionRequest,
    userId: string,
  ): Promise<FinancialTransaction> {
    try {
      monitoring.info('Creating financial transaction', 'financial-service', {
        tenantId: request.tenantId,
        type: request.type,
        amount: request.amount,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      const transactionData = {
        tenant_id: request.tenantId,
        patient_id: request.patientId,
        appointment_id: request.appointmentId,
        type: request.type,
        category: request.category,
        amount: request.amount,
        currency: request.currency || this.defaultCurrency,
        description: request.description,
        status: TransactionStatus.PENDING,
        payment_method: request.paymentMethod,
        due_date: request.dueDate?.toISOString(),
        metadata: request.metadata || {},
        created_by: userId,
        updated_by: userId,
      };

      const { data, error } = await this.supabase
        .from('financial_transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        monitoring.error(
          'Transaction creation failed',
          'financial-service',
          new Error(error.message),
          {
            tenantId: request.tenantId,
          },
        );
        throw new Error(error.message);
      }

      const transaction = this.mapTransactionFromDb(data);

      monitoring.info('Transaction created successfully', 'financial-service', {
        transactionId: transaction.id,
        tenantId: transaction.tenantId,
      });

      return transaction;
    } catch (error) {
      monitoring.error(
        'Transaction creation error',
        'financial-service',
        error as Error,
        {
          tenantId: request.tenantId,
        },
      );
      throw error;
    }
  }

  async getTransaction(
    transactionId: string,
    userId: string,
  ): Promise<FinancialTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('financial_transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapTransactionFromDb(data);
    } catch (error) {
      monitoring.error(
        'Get transaction error',
        'financial-service',
        error as Error,
        {
          transactionId,
        },
      );
      return;
    }
  }

  async updateTransactionStatus(
    transactionId: string,
    status: TransactionStatus,
    userId: string,
    paymentMethod?: PaymentMethod,
    paidDate?: Date,
  ): Promise<FinancialTransaction | null> {
    try {
      monitoring.info('Updating transaction status', 'financial-service', {
        transactionId,
        status,
      });

      const updateData: any = {
        status,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (paymentMethod) {
        updateData.payment_method = paymentMethod;
      }

      if (paidDate) {
        updateData.paid_date = paidDate.toISOString();
      } else if (status === TransactionStatus.PAID) {
        updateData.paid_date = new Date().toISOString();
      }

      const { data, error } = await this.supabase
        .from('financial_transactions')
        .update(updateData)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      const transaction = this.mapTransactionFromDb(data);

      monitoring.info('Transaction status updated', 'financial-service', {
        transactionId,
        status,
      });

      return transaction;
    } catch (error) {
      monitoring.error(
        'Update transaction status error',
        'financial-service',
        error as Error,
        {
          transactionId,
          status,
        },
      );
      throw error;
    }
  }

  async searchTransactions(
    filters: FinancialFilters,
    userId: string,
  ): Promise<{ transactions: FinancialTransaction[]; total: number; }> {
    try {
      monitoring.debug('Searching transactions', 'financial-service', {
        filters,
      });

      // Validate tenant access if specified
      if (filters.tenantId) {
        await this.validateTenantAccess(userId, filters.tenantId);
      }

      let query = this.supabase
        .from('financial_transactions')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.tenantId) {
        query = query.eq('tenant_id', filters.tenantId);
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.paymentMethod) {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      if (filters.amountMin) {
        query = query.gte('amount', filters.amountMin);
      }

      if (filters.amountMax) {
        query = query.lte('amount', filters.amountMax);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const transactions = data.map(this.mapTransactionFromDb);

      return { transactions, total: count || 0 };
    } catch (error) {
      monitoring.error(
        'Search transactions error',
        'financial-service',
        error as Error,
        {
          filters,
        },
      );
      throw error;
    }
  }

  // ================================================
  // PAYMENT PLAN MANAGEMENT
  // ================================================

  async createPaymentPlan(
    request: CreatePaymentPlanRequest,
    userId: string,
  ): Promise<PaymentPlan> {
    try {
      monitoring.info('Creating payment plan', 'financial-service', {
        tenantId: request.tenantId,
        patientId: request.patientId,
        totalAmount: request.totalAmount,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Calculate installment amount
      const installmentAmount = request.totalAmount / request.numberOfInstallments;

      // Create payment plan
      const paymentPlanData = {
        tenant_id: request.tenantId,
        patient_id: request.patientId,
        total_amount: request.totalAmount,
        paid_amount: 0,
        remaining_amount: request.totalAmount,
        currency: request.currency || this.defaultCurrency,
        status: PaymentPlanStatus.ACTIVE,
        created_by: userId,
      };

      const { data: planData, error: planError } = await this.supabase
        .from('payment_plans')
        .insert(paymentPlanData)
        .select()
        .single();

      if (planError) {
        throw new Error(planError.message);
      }

      // Create installments
      const installments: Omit<PaymentInstallment, 'id'>[] = [];
      const currentDate = new Date(request.firstInstallmentDate);

      for (let i = 1; i <= request.numberOfInstallments; i++) {
        installments.push({
          paymentPlanId: planData.id,
          installmentNumber: i,
          amount: installmentAmount,
          dueDate: new Date(currentDate),
          status: InstallmentStatus.PENDING,
        });

        // Calculate next installment date
        switch (request.installmentInterval) {
          case 'weekly': {
            currentDate.setDate(currentDate.getDate() + 7);
            break;
          }
          case 'biweekly': {
            currentDate.setDate(currentDate.getDate() + 14);
            break;
          }
          default: {
            currentDate.setMonth(currentDate.getMonth() + 1);
            break;
          }
        }
      }

      // Insert installments
      const installmentData = installments.map((installment) => ({
        payment_plan_id: installment.paymentPlanId,
        installment_number: installment.installmentNumber,
        amount: installment.amount,
        due_date: installment.dueDate.toISOString(),
        status: installment.status,
      }));

      const { data: installmentRows, error: installmentError } = await this.supabase
        .from('payment_installments')
        .insert(installmentData)
        .select();

      if (installmentError) {
        throw new Error(installmentError.message);
      }

      const paymentPlan = this.mapPaymentPlanFromDb(planData, installmentRows);

      monitoring.info(
        'Payment plan created successfully',
        'financial-service',
        {
          paymentPlanId: paymentPlan.id,
          numberOfInstallments: request.numberOfInstallments,
        },
      );

      return paymentPlan;
    } catch (error) {
      monitoring.error(
        'Payment plan creation error',
        'financial-service',
        error as Error,
        {
          tenantId: request.tenantId,
          patientId: request.patientId,
        },
      );
      throw error;
    }
  }

  async getPaymentPlan(
    paymentPlanId: string,
    userId: string,
  ): Promise<PaymentPlan | null> {
    try {
      const { data: planData, error: planError } = await this.supabase
        .from('payment_plans')
        .select('*')
        .eq('id', paymentPlanId)
        .single();

      if (planError || !planData) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, planData.tenant_id);

      const { data: installmentData, error: installmentError } = await this.supabase
        .from('payment_installments')
        .select('*')
        .eq('payment_plan_id', paymentPlanId)
        .order('installment_number');

      if (installmentError) {
        throw new Error(installmentError.message);
      }

      return this.mapPaymentPlanFromDb(planData, installmentData);
    } catch (error) {
      monitoring.error(
        'Get payment plan error',
        'financial-service',
        error as Error,
        {
          paymentPlanId,
        },
      );
      return;
    }
  }

  async payInstallment(
    installmentId: string,
    paymentMethod: PaymentMethod,
    userId: string,
    paidDate?: Date,
  ): Promise<PaymentInstallment | null> {
    try {
      monitoring.info('Processing installment payment', 'financial-service', {
        installmentId,
        paymentMethod,
      });

      // Get installment
      const { data: installmentData, error: installmentError } = await this.supabase
        .from('payment_installments')
        .select(`
          *,
          payment_plans!inner(tenant_id, paid_amount, total_amount)
        `)
        .eq('id', installmentId)
        .single();

      if (installmentError || !installmentData) {
        throw new Error('Installment not found');
      }

      // Validate tenant access
      await this.validateTenantAccess(
        userId,
        installmentData.payment_plans.tenant_id,
      );

      // Update installment
      const paymentDate = paidDate || new Date();
      const { data: updatedInstallment, error: updateError } = await this.supabase
        .from('payment_installments')
        .update({
          status: InstallmentStatus.PAID,
          paid_date: paymentDate.toISOString(),
          payment_method: paymentMethod,
        })
        .eq('id', installmentId)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Update payment plan totals
      const newPaidAmount = installmentData.payment_plans.paid_amount + installmentData.amount;
      const newRemainingAmount = installmentData.payment_plans.total_amount - newPaidAmount;

      const planStatus = newRemainingAmount <= 0
        ? PaymentPlanStatus.COMPLETED
        : PaymentPlanStatus.ACTIVE;

      await this.supabase
        .from('payment_plans')
        .update({
          paid_amount: newPaidAmount,
          remaining_amount: newRemainingAmount,
          status: planStatus,
        })
        .eq('id', installmentData.payment_plan_id);

      // Create transaction record
      await this.createTransaction(
        {
          tenantId: installmentData.payment_plans.tenant_id,
          type: TransactionType.INCOME,
          category: TransactionCategory.TREATMENT_PAYMENT,
          amount: installmentData.amount,
          description: `Payment plan installment #${installmentData.installment_number}`,
          paymentMethod,
          metadata: {
            paymentPlanId: installmentData.payment_plan_id,
            installmentId,
          },
        },
        userId,
      );

      const installment = this.mapInstallmentFromDb(updatedInstallment);

      monitoring.info('Installment payment processed', 'financial-service', {
        installmentId,
        amount: installment.amount,
      });

      return installment;
    } catch (error) {
      monitoring.error(
        'Pay installment error',
        'financial-service',
        error as Error,
        {
          installmentId,
          paymentMethod,
        },
      );
      throw error;
    }
  }

  // ================================================
  // INVOICE MANAGEMENT
  // ================================================

  async createInvoice(
    request: CreateInvoiceRequest,
    userId: string,
  ): Promise<Invoice> {
    try {
      monitoring.info('Creating invoice', 'financial-service', {
        tenantId: request.tenantId,
        patientId: request.patientId,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Calculate invoice totals
      let subtotal = 0;
      let taxAmount = 0;

      const processedItems: InvoiceItem[] = request.items.map((item, index) => {
        const totalPrice = item.quantity * item.unitPrice;
        const itemTaxAmount = totalPrice * this.taxRate;

        subtotal += totalPrice;
        taxAmount += itemTaxAmount;

        return {
          id: `item_${index + 1}`,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice,
          taxRate: this.taxRate,
          taxAmount: itemTaxAmount,
        };
      });

      const totalAmount = subtotal + taxAmount;

      // Generate invoice number
      const invoiceNumber = await this.generateInvoiceNumber(request.tenantId);

      const invoiceData = {
        tenant_id: request.tenantId,
        patient_id: request.patientId,
        invoice_number: invoiceNumber,
        items: processedItems,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: 0,
        total_amount: totalAmount,
        currency: this.defaultCurrency,
        status: InvoiceStatus.DRAFT,
        issue_date: new Date().toISOString(),
        due_date: request.dueDate.toISOString(),
        notes: request.notes,
        metadata: request.metadata || {},
      };

      const { data, error } = await this.supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const invoice = this.mapInvoiceFromDb(data);

      monitoring.info('Invoice created successfully', 'financial-service', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
      });

      return invoice;
    } catch (error) {
      monitoring.error(
        'Invoice creation error',
        'financial-service',
        error as Error,
        {
          tenantId: request.tenantId,
          patientId: request.patientId,
        },
      );
      throw error;
    }
  }

  async getInvoice(invoiceId: string, userId: string): Promise<Invoice | null> {
    try {
      const { data, error } = await this.supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapInvoiceFromDb(data);
    } catch (error) {
      monitoring.error(
        'Get invoice error',
        'financial-service',
        error as Error,
        { invoiceId },
      );
      return;
    }
  }

  async payInvoice(
    invoiceId: string,
    paymentMethod: PaymentMethod,
    userId: string,
    paidDate?: Date,
  ): Promise<Invoice | null> {
    try {
      monitoring.info('Processing invoice payment', 'financial-service', {
        invoiceId,
        paymentMethod,
      });

      const paymentDate = paidDate || new Date();
      const { data, error } = await this.supabase
        .from('invoices')
        .update({
          status: InvoiceStatus.PAID,
          paid_date: paymentDate.toISOString(),
          payment_method: paymentMethod,
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      // Create transaction record
      await this.createTransaction(
        {
          tenantId: data.tenant_id,
          patientId: data.patient_id,
          type: TransactionType.INCOME,
          category: TransactionCategory.SERVICE_PAYMENT,
          amount: data.total_amount,
          description: `Invoice payment #${data.invoice_number}`,
          paymentMethod,
          metadata: {
            invoiceId,
          },
        },
        userId,
      );

      const invoice = this.mapInvoiceFromDb(data);

      monitoring.info('Invoice payment processed', 'financial-service', {
        invoiceId,
        amount: invoice.totalAmount,
      });

      return invoice;
    } catch (error) {
      monitoring.error(
        'Pay invoice error',
        'financial-service',
        error as Error,
        {
          invoiceId,
          paymentMethod,
        },
      );
      throw error;
    }
  }

  // ================================================
  // FINANCIAL REPORTING
  // ================================================

  async generateFinancialReport(
    tenantId: string,
    reportType: ReportType,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<FinancialReport> {
    try {
      monitoring.info('Generating financial report', 'financial-service', {
        tenantId,
        reportType,
        periodStart,
        periodEnd,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, tenantId);

      // Generate report data based on type
      let reportData: ReportData;

      switch (reportType) {
        case ReportType.REVENUE: {
          reportData = await this.generateRevenueReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        case ReportType.EXPENSES: {
          reportData = await this.generateExpenseReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        case ReportType.PROFIT_LOSS: {
          reportData = await this.generateProfitLossReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        case ReportType.CASH_FLOW: {
          reportData = await this.generateCashFlowReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        case ReportType.RECEIVABLES: {
          reportData = await this.generateReceivablesReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        case ReportType.TAX: {
          reportData = await this.generateTaxReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
        default: {
          reportData = await this.generateComprehensiveReport(
            tenantId,
            periodStart,
            periodEnd,
          );
          break;
        }
      }

      // Save report
      const reportRecord = {
        tenant_id: tenantId,
        report_type: reportType,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        data: reportData,
        generated_by: userId,
      };

      const { data, error } = await this.supabase
        .from('financial_reports')
        .insert(reportRecord)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const report = this.mapReportFromDb(data);

      monitoring.info('Financial report generated', 'financial-service', {
        reportId: report.id,
        reportType,
      });

      return report;
    } catch (error) {
      monitoring.error(
        'Generate financial report error',
        'financial-service',
        error as Error,
        {
          tenantId,
          reportType,
        },
      );
      throw error;
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private async initializeConfiguration(): Promise<void> {
    this.defaultCurrency = await config.getConfiguration(
      'financial.default_currency',
      { environment: process.env.NODE_ENV || 'development' },
      'BRL',
    );

    this.taxRate = await config.getConfiguration(
      'financial.default_tax_rate',
      { environment: process.env.NODE_ENV || 'development' },
      0.1,
    );
  }

  private async validateTenantAccess(
    _userId: string,
    _tenantId: string,
  ): Promise<void> {
    // Implementation would validate user has access to tenant
    // For now, we'll assume the auth service handles this
  }

  private async generateInvoiceNumber(tenantId: string): Promise<string> {
    const { count } = await this.supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId);

    const nextNumber = (count || 0) + 1;
    const year = new Date().getFullYear();

    return `INV-${year}-${nextNumber.toString().padStart(6, '0')}`;
  }

  private async generateRevenueReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for revenue report generation
    return {} as ReportData;
  }

  private async generateExpenseReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for expense report generation
    return {} as ReportData;
  }

  private async generateProfitLossReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for profit & loss report generation
    return {} as ReportData;
  }

  private async generateCashFlowReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for cash flow report generation
    return {} as ReportData;
  }

  private async generateReceivablesReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for receivables report generation
    return {} as ReportData;
  }

  private async generateTaxReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for tax report generation
    return {} as ReportData;
  }

  private async generateComprehensiveReport(
    _tenantId: string,
    _periodStart: Date,
    _periodEnd: Date,
  ): Promise<ReportData> {
    // Implementation for comprehensive report generation
    return {} as ReportData;
  }

  private mapTransactionFromDb(data: any): FinancialTransaction {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      patientId: data.patient_id,
      appointmentId: data.appointment_id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      currency: data.currency,
      description: data.description,
      status: data.status,
      paymentMethod: data.payment_method,
      dueDate: data.due_date ? new Date(data.due_date) : undefined,
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
      updatedBy: data.updated_by,
    };
  }

  private mapPaymentPlanFromDb(
    planData: any,
    installmentData: any[],
  ): PaymentPlan {
    return {
      id: planData.id,
      tenantId: planData.tenant_id,
      patientId: planData.patient_id,
      totalAmount: planData.total_amount,
      paidAmount: planData.paid_amount,
      remainingAmount: planData.remaining_amount,
      currency: planData.currency,
      installments: installmentData.map(this.mapInstallmentFromDb),
      status: planData.status,
      createdAt: new Date(planData.created_at),
      updatedAt: new Date(planData.updated_at),
      createdBy: planData.created_by,
    };
  }

  private mapInstallmentFromDb(data: any): PaymentInstallment {
    return {
      id: data.id,
      paymentPlanId: data.payment_plan_id,
      installmentNumber: data.installment_number,
      amount: data.amount,
      dueDate: new Date(data.due_date),
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      status: data.status,
      paymentMethod: data.payment_method,
      transactionId: data.transaction_id,
      lateFee: data.late_fee,
      discount: data.discount,
    };
  }

  private mapInvoiceFromDb(data: any): Invoice {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      patientId: data.patient_id,
      invoiceNumber: data.invoice_number,
      items: data.items || [],
      subtotal: data.subtotal,
      taxAmount: data.tax_amount,
      discountAmount: data.discount_amount,
      totalAmount: data.total_amount,
      currency: data.currency,
      status: data.status,
      issueDate: new Date(data.issue_date),
      dueDate: new Date(data.due_date),
      paidDate: data.paid_date ? new Date(data.paid_date) : undefined,
      paymentMethod: data.payment_method,
      notes: data.notes,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapReportFromDb(data: any): FinancialReport {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      reportType: data.report_type,
      periodStart: new Date(data.period_start),
      periodEnd: new Date(data.period_end),
      data: data.data,
      generatedAt: new Date(data.generated_at),
      generatedBy: data.generated_by,
    };
  }
}

// ================================================
// FINANCIAL SERVICE INSTANCE
// ================================================

export const financialService = FinancialService.getInstance();
