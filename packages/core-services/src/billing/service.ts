import { addDays, addMonths, isAfter, isBefore, } from 'date-fns'
import { BillingStatus, } from '../types'
import type {
  CreateDiscountData,
  CreateInvoiceData,
  CreatePaymentData,
  CreatePaymentPlanData,
  CreateTreatmentPackageData,
  Discount,
  Installment,
  Invoice,
  Payment,
  PaymentPlan,
  Refund,
  TreatmentPackage,
} from './types'
import {
  DiscountType,
  InstallmentFrequency,
  InstallmentStatus,
  PaymentMethod,
  PaymentPlanStatus,
  PaymentStatus,
  RefundStatus,
} from './types'

export interface BillingRepository {
  // Invoice operations
  createInvoice(data: CreateInvoiceData,): Promise<Invoice>
  updateInvoice(id: string, data: Partial<Invoice>,): Promise<Invoice>
  getInvoice(id: string,): Promise<Invoice | null>
  getInvoicesByPatient(patientId: string,): Promise<Invoice[]>
  getInvoicesByStatus(status: BillingStatus,): Promise<Invoice[]>
  getInvoicesByDateRange(startDate: Date, endDate: Date,): Promise<Invoice[]>

  // Payment operations
  createPayment(data: CreatePaymentData,): Promise<Payment>
  updatePayment(id: string, data: Partial<Payment>,): Promise<Payment>
  getPayment(id: string,): Promise<Payment | null>
  getPaymentsByInvoice(invoiceId: string,): Promise<Payment[]>
  getPaymentsByPatient(patientId: string,): Promise<Payment[]>

  // Payment plan operations
  createPaymentPlan(data: CreatePaymentPlanData,): Promise<PaymentPlan>
  updatePaymentPlan(
    id: string,
    data: Partial<PaymentPlan>,
  ): Promise<PaymentPlan>
  getPaymentPlan(id: string,): Promise<PaymentPlan | null>
  getPaymentPlansByPatient(patientId: string,): Promise<PaymentPlan[]>

  // Treatment package operations
  createTreatmentPackage(
    data: CreateTreatmentPackageData,
  ): Promise<TreatmentPackage>
  updateTreatmentPackage(
    id: string,
    data: Partial<TreatmentPackage>,
  ): Promise<TreatmentPackage>
  getTreatmentPackage(id: string,): Promise<TreatmentPackage | null>
  getTreatmentPackages(isActive?: boolean,): Promise<TreatmentPackage[]>

  // Discount operations
  createDiscount(data: CreateDiscountData,): Promise<Discount>
  updateDiscount(id: string, data: Partial<Discount>,): Promise<Discount>
  getDiscount(id: string,): Promise<Discount | null>
  getDiscountByCode(code: string,): Promise<Discount | null>
  getDiscounts(isActive?: boolean,): Promise<Discount[]>

  // Refund operations
  createRefund(
    data: Omit<Refund, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Refund>
  updateRefund(id: string, data: Partial<Refund>,): Promise<Refund>
  getRefund(id: string,): Promise<Refund | null>
  getRefundsByPatient(patientId: string,): Promise<Refund[]>
}
export interface BillingStats {
  totalRevenue: number
  monthlyRevenue: number
  outstandingAmount: number
  overdueAmount: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  averageInvoiceAmount: number
  paymentMethodDistribution: {
    method: PaymentMethod
    count: number
    amount: number
  }[]
  treatmentRevenue: { treatmentType: string; count: number; revenue: number }[]
}

export class BillingService {
  constructor(private readonly repository: BillingRepository,) {}

  // Invoice management
  async createInvoice(data: CreateInvoiceData,): Promise<Invoice> {
    try {
      // Calculate invoice totals
      const subtotal = data.items.reduce(
        (sum, item,) => sum + (item.quantity * item.unitPrice - item.discountAmount),
        0,
      )

      const discountAmount = data.discountAmount || (subtotal * data.discountPercentage) / 100
      const taxAmount = (subtotal - discountAmount) * 0.1 // 10% tax (adjust as needed)
      const totalAmount = subtotal - discountAmount + taxAmount

      const invoiceData = {
        ...data,
        invoiceNumber: await this.generateInvoiceNumber(),
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: BillingStatus.PENDING,
      }

      const invoice = await this.repository.createInvoice(invoiceData,)
      return invoice
    } catch {
      throw new Error('Failed to create invoice',)
    }
  }
  async processPayment(
    data: CreatePaymentData,
  ): Promise<{ payment: Payment; invoice: Invoice }> {
    const invoice = await this.repository.getInvoice(data.invoiceId,)
    if (!invoice) {
      throw new Error('Invoice not found',)
    }

    if (invoice.status === BillingStatus.PAID) {
      throw new Error('Invoice is already paid',)
    }

    if (invoice.status === BillingStatus.CANCELLED) {
      throw new Error('Cannot process payment for cancelled invoice',)
    }

    // Validate payment amount
    if (data.amount <= 0) {
      throw new Error('Payment amount must be greater than zero',)
    }

    if (data.amount > invoice.balanceAmount) {
      throw new Error('Payment amount exceeds invoice balance',)
    }

    // Create payment record
    const paymentData = {
      ...data,
      paymentNumber: await this.generatePaymentNumber(),
      patientId: invoice.patientId,
      paymentStatus: PaymentStatus.COMPLETED, // In real implementation, this might be PROCESSING first
    }

    const payment = await this.repository.createPayment(paymentData,)

    // Update invoice
    const newPaidAmount = invoice.paidAmount + data.amount
    const newBalanceAmount = invoice.totalAmount - newPaidAmount
    const newStatus = newBalanceAmount <= 0 ? BillingStatus.PAID : BillingStatus.PENDING

    const updatedInvoice = await this.repository.updateInvoice(data.invoiceId, {
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      status: newStatus,
      paidDate: newStatus === BillingStatus.PAID ? new Date() : undefined,
    },)

    return { payment, invoice: updatedInvoice, }
  }

  async applyDiscount(
    invoiceId: string,
    discountCode: string,
  ): Promise<{
    invoice: Invoice
    discount: Discount
    discountAmount: number
  }> {
    const invoice = await this.repository.getInvoice(invoiceId,)
    if (!invoice) {
      throw new Error('Invoice not found',)
    }

    if (invoice.status !== BillingStatus.PENDING) {
      throw new Error('Can only apply discount to pending invoices',)
    }

    const discount = await this.repository.getDiscountByCode(discountCode,)
    if (!discount) {
      throw new Error('Discount code not found',)
    }

    // Validate discount
    const validationResult = await this.validateDiscount(discount, invoice,)
    if (!validationResult.isValid) {
      throw new Error(validationResult.reason,)
    }

    // Calculate discount amount
    let discountAmount = 0
    if (discount.type === DiscountType.PERCENTAGE) {
      discountAmount = (invoice.subtotal * discount.value) / 100
    } else if (discount.type === DiscountType.FIXED_AMOUNT) {
      discountAmount = discount.value
    }

    // Apply maximum discount limit
    if (discount.maximumDiscount && discountAmount > discount.maximumDiscount) {
      discountAmount = discount.maximumDiscount
    }

    // Recalculate invoice totals
    const { subtotal: newSubtotal, } = invoice
    const newDiscountAmount = invoice.discountAmount + discountAmount
    const newTaxAmount = (newSubtotal - newDiscountAmount) * 0.1
    const newTotalAmount = newSubtotal - newDiscountAmount + newTaxAmount

    const updatedInvoice = await this.repository.updateInvoice(invoiceId, {
      discountAmount: newDiscountAmount,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount,
      balanceAmount: newTotalAmount - invoice.paidAmount,
    },)

    // Update discount usage
    await this.repository.updateDiscount(discount.id, {
      usedCount: discount.usedCount + 1,
    },)

    return { invoice: updatedInvoice, discount, discountAmount, }
  } // Payment plan management
  async createPaymentPlan(data: CreatePaymentPlanData,): Promise<PaymentPlan> {
    const invoice = await this.repository.getInvoice(data.invoiceId,)
    if (!invoice) {
      throw new Error('Invoice not found',)
    }

    if (invoice.status !== BillingStatus.PENDING) {
      throw new Error('Can only create payment plan for pending invoices',)
    }

    const remainingAmount = invoice.totalAmount - data.downPayment
    if (remainingAmount <= 0) {
      throw new Error(
        'Down payment cannot be equal to or greater than invoice total',
      )
    }

    const installmentAmount = remainingAmount / data.numberOfInstallments

    // Calculate end date based on frequency
    let endDate: Date
    switch (data.frequency) {
      case InstallmentFrequency.WEEKLY: {
        endDate = addDays(data.startDate, data.numberOfInstallments * 7,)
        break
      }
      case InstallmentFrequency.BIWEEKLY: {
        endDate = addDays(data.startDate, data.numberOfInstallments * 14,)
        break
      }
      case InstallmentFrequency.MONTHLY: {
        endDate = addMonths(data.startDate, data.numberOfInstallments,)
        break
      }
      case InstallmentFrequency.QUARTERLY: {
        endDate = addMonths(data.startDate, data.numberOfInstallments * 3,)
        break
      }
    }

    const paymentPlanData = {
      ...data,
      totalAmount: invoice.totalAmount,
      remainingAmount,
      installmentAmount,
      endDate,
      status: PaymentPlanStatus.ACTIVE,
      installments: [], // Will be generated after payment plan creation
    }

    const paymentPlan = await this.repository.createPaymentPlan(paymentPlanData,)

    // Process down payment if unknown
    if (data.downPayment > 0) {
      await this.processPayment({
        invoiceId: data.invoiceId,
        amount: data.downPayment,
        paymentDate: new Date(),
        paymentMethod: PaymentMethod.CASH, // This should come from the request
        processedBy: 'system', // This should be the actual user ID
        reference: `Down payment for payment plan ${paymentPlan.id}`,
      },)
    }

    // Generate installments
    await this.generateInstallments(paymentPlan.id,)

    return paymentPlan
  }

  private async generateInstallments(paymentPlanId: string,): Promise<void> {
    const paymentPlan = await this.repository.getPaymentPlan(paymentPlanId,)
    if (!paymentPlan) {
      throw new Error('Payment plan not found',)
    }

    const installments: Installment[] = []
    let currentDate = paymentPlan.startDate

    for (let i = 1; i <= paymentPlan.numberOfInstallments; i++) {
      const installment: Installment = {
        id: `installment-${paymentPlanId}-${i}`, // This would be generated properly
        paymentPlanId,
        installmentNumber: i,
        amount: paymentPlan.installmentAmount,
        dueDate: new Date(currentDate,),
        status: InstallmentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      installments.push(installment,)

      // Calculate next due date
      switch (paymentPlan.frequency) {
        case InstallmentFrequency.WEEKLY: {
          currentDate = addDays(currentDate, 7,)
          break
        }
        case InstallmentFrequency.BIWEEKLY: {
          currentDate = addDays(currentDate, 14,)
          break
        }
        case InstallmentFrequency.MONTHLY: {
          currentDate = addMonths(currentDate, 1,)
          break
        }
        case InstallmentFrequency.QUARTERLY: {
          currentDate = addMonths(currentDate, 3,)
          break
        }
      }
    }

    await this.repository.updatePaymentPlan(paymentPlanId, { installments, },)
  } // Discount validation
  private async validateDiscount(
    discount: Discount,
    invoice: Invoice,
  ): Promise<{
    isValid: boolean
    reason?: string
  }> {
    const now = new Date()

    // Check if discount is active
    if (!discount.isActive) {
      return { isValid: false, reason: 'Discount is not active', }
    }

    // Check validity dates
    if (isBefore(now, discount.validFrom,) || isAfter(now, discount.validTo,)) {
      return {
        isValid: false,
        reason: 'Discount is not valid for current date',
      }
    }

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      return { isValid: false, reason: 'Discount usage limit exceeded', }
    }

    // Check minimum amount
    if (discount.minimumAmount && invoice.subtotal < discount.minimumAmount) {
      return {
        isValid: false,
        reason: `Minimum amount of ${discount.minimumAmount} required`,
      }
    }

    // Check applicable treatments
    if (discount.applicableTreatments.length > 0) {
      const invoiceHasApplicableTreatment = invoice.items.some(
        (item,) =>
          item.treatmentType
          && discount.applicableTreatments.includes(item.treatmentType,),
      )

      if (!invoiceHasApplicableTreatment) {
        return {
          isValid: false,
          reason: 'Discount not applicable to treatments in this invoice',
        }
      }
    }

    return { isValid: true, }
  }

  // Treatment package management
  async createTreatmentPackage(
    data: CreateTreatmentPackageData,
  ): Promise<TreatmentPackage> {
    const savings = data.originalPrice - data.packagePrice

    const packageData = {
      ...data,
      savings,
      usedCount: 0,
    }

    return this.repository.createTreatmentPackage(packageData,)
  }

  async getTreatmentPackages(isActive = true,): Promise<TreatmentPackage[]> {
    return this.repository.getTreatmentPackages(isActive,)
  }

  // Refund management
  async processRefund(
    paymentId: string,
    amount: number,
    reason: string,
    processedBy: string,
  ): Promise<Refund> {
    const payment = await this.repository.getPayment(paymentId,)
    if (!payment) {
      throw new Error('Payment not found',)
    }

    if (payment.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new Error('Can only refund completed payments',)
    }

    if (amount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount',)
    }

    const refund = await this.repository.createRefund({
      paymentId,
      invoiceId: payment.invoiceId,
      patientId: payment.patientId,
      amount,
      reason,
      refundDate: new Date(),
      refundMethod: payment.paymentMethod,
      status: RefundStatus.PENDING,
      processedBy,
    },)

    // Update payment status
    const isFullRefund = amount === payment.amount
    await this.repository.updatePayment(paymentId, {
      paymentStatus: isFullRefund
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIALLY_REFUNDED,
      refundAmount: (payment.refundAmount || 0) + amount,
      refundDate: new Date(),
      refundReason: reason,
    },)

    // Update invoice if needed
    const invoice = await this.repository.getInvoice(payment.invoiceId,)
    if (invoice) {
      const newPaidAmount = invoice.paidAmount - amount
      const newBalanceAmount = invoice.totalAmount - newPaidAmount

      await this.repository.updateInvoice(payment.invoiceId, {
        paidAmount: newPaidAmount,
        balanceAmount: newBalanceAmount,
        status: newPaidAmount === 0
          ? BillingStatus.PENDING
          : newBalanceAmount <= 0
          ? BillingStatus.PAID
          : BillingStatus.PENDING,
      },)
    }

    return refund
  } // Analytics and reporting
  async getBillingStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<BillingStats> {
    const allInvoices = await this.repository.getInvoicesByDateRange(
      startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000,), // 1 year ago
      endDate || new Date(),
    )

    const paidInvoices = allInvoices.filter(
      (inv,) => inv.status === BillingStatus.PAID,
    )
    const unpaidInvoices = allInvoices.filter(
      (inv,) =>
        inv.status === BillingStatus.PENDING
        || inv.status === BillingStatus.OVERDUE,
    )

    const totalRevenue = paidInvoices.reduce(
      (sum, inv,) => sum + inv.totalAmount,
      0,
    )

    // Calculate monthly revenue (current month)
    const currentMonth = new Date()
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    )
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    )

    const monthlyInvoices = paidInvoices.filter(
      (inv,) => inv.paidDate && inv.paidDate >= monthStart && inv.paidDate <= monthEnd,
    )
    const monthlyRevenue = monthlyInvoices.reduce(
      (sum, inv,) => sum + inv.totalAmount,
      0,
    )

    const outstandingAmount = unpaidInvoices.reduce(
      (sum, inv,) => sum + inv.balanceAmount,
      0,
    )
    const overdueAmount = unpaidInvoices
      .filter((inv,) => isBefore(inv.dueDate, new Date(),))
      .reduce((sum, inv,) => sum + inv.balanceAmount, 0,)

    const averageInvoiceAmount = allInvoices.length > 0
      ? allInvoices.reduce((sum, inv,) => sum + inv.totalAmount, 0,)
        / allInvoices.length
      : 0

    // Payment method distribution
    const paymentMethodMap = new Map<
      PaymentMethod,
      { count: number; amount: number }
    >()

    for (const invoice of paidInvoices) {
      const payments = await this.repository.getPaymentsByInvoice(invoice.id,)
      for (const payment of payments) {
        const existing = paymentMethodMap.get(payment.paymentMethod,) || {
          count: 0,
          amount: 0,
        }
        existing.count++
        existing.amount += payment.amount
        paymentMethodMap.set(payment.paymentMethod, existing,)
      }
    }

    const paymentMethodDistribution = [...paymentMethodMap.entries(),].map(
      ([method, data,],) => ({
        method,
        count: data.count,
        amount: data.amount,
      }),
    )

    // Treatment revenue
    const treatmentRevenueMap = new Map<
      string,
      { count: number; revenue: number }
    >()

    for (const invoice of paidInvoices) {
      for (const item of invoice.items) {
        if (item.treatmentType) {
          const existing = treatmentRevenueMap.get(item.treatmentType,) || {
            count: 0,
            revenue: 0,
          }
          existing.count += item.quantity
          existing.revenue += item.totalPrice
          treatmentRevenueMap.set(item.treatmentType, existing,)
        }
      }
    }

    const treatmentRevenue = [...treatmentRevenueMap.entries(),]
      .map(([treatmentType, data,],) => ({
        treatmentType,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b,) => b.revenue - a.revenue)

    return {
      totalRevenue,
      monthlyRevenue,
      outstandingAmount,
      overdueAmount,
      totalInvoices: allInvoices.length,
      paidInvoices: paidInvoices.length,
      unpaidInvoices: unpaidInvoices.length,
      averageInvoiceAmount,
      paymentMethodDistribution,
      treatmentRevenue,
    }
  }

  // Utility methods
  private async generateInvoiceNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1,).padStart(2, '0',)
    const timestamp = now.getTime().toString().slice(-6,)
    return `INV-${year}${month}-${timestamp}`
  }

  private async generatePaymentNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1,).padStart(2, '0',)
    const timestamp = now.getTime().toString().slice(-6,)
    return `PAY-${year}${month}-${timestamp}`
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    const allInvoices = await this.repository.getInvoicesByStatus(
      BillingStatus.PENDING,
    )
    const now = new Date()

    const overdueInvoices = allInvoices.filter(
      (invoice,) => isBefore(invoice.dueDate, now,) && invoice.balanceAmount > 0,
    )

    // Update status to overdue
    for (const invoice of overdueInvoices) {
      await this.repository.updateInvoice(invoice.id, {
        status: BillingStatus.OVERDUE,
      },)
    }

    return overdueInvoices
  }

  async getUpcomingPayments(days = 7,): Promise<Installment[]> {
    const paymentPlans = await this.repository.getPaymentPlansByPatient('',) // This would need proper filtering
    const upcomingPayments: Installment[] = []
    const targetDate = addDays(new Date(), days,)

    for (const plan of paymentPlans) {
      if (plan.status === PaymentPlanStatus.ACTIVE) {
        const pendingInstallments = plan.installments.filter(
          (inst,) =>
            inst.status === InstallmentStatus.PENDING
            && isBefore(inst.dueDate, targetDate,),
        )
        upcomingPayments.push(...pendingInstallments,)
      }
    }

    return upcomingPayments.sort(
      (a, b,) => a.dueDate.getTime() - b.dueDate.getTime(),
    )
  }
}
