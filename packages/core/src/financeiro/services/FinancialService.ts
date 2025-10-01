// Financial service for aesthetic clinic billing and payments
import { Invoice, Transaction, PaymentMethod, InvoiceStatus } from '../types'

export class FinancialService {
  // Generate invoice for aesthetic treatment
  static generateInvoice(
    patientId: string,
    clinicId: string,
    treatmentDescription: string,
    amount: number,
    dueDays: number = 7
  ): Omit<Invoice, 'id' | 'created_at' | 'updated_at'> {
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueDays)
    
    const invoiceNumber = this.generateInvoiceNumber(clinicId)
    
    return {
      patient_id: patientId,
      clinic_id: clinicId,
      invoice_number: invoiceNumber,
      due_date: dueDate,
      total_amount: amount,
      paid_amount: 0,
      status: InvoiceStatus.DRAFT,
      items: [{
        id: crypto.randomUUID(),
        description: treatmentDescription,
        quantity: 1,
        unit_price: amount,
        total_price: amount
      }],
      notes: `Pagamento referente a: ${treatmentDescription}`
    }
  }
  
  // Generate Brazilian invoice number format
  private static generateInvoiceNumber(clinicId: string): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    
    return `NF${year}${month}${clinicId.slice(0, 4)}${random}`
  }
  
  // Calculate payment processing fees for Brazilian methods
  static calculateProcessingFee(
    amount: number,
    paymentMethod: PaymentMethod
  ): number {
    const feeRates = {
      [PaymentMethod.CREDIT_CARD]: 0.0499 + 0.69, // 4.99% + R$0.69
      [PaymentMethod.DEBIT_CARD]: 0.0199 + 0.69,  // 1.99% + R$0.69
      [PaymentMethod.PIX]: 0.0099,                 // 0.99%
      [PaymentMethod.BANK_TRANSFER]: 0,           // No fee for TED/DOC
      [PaymentMethod.CASH]: 0,                    // No fee for cash
      [PaymentMethod.CARNET]: 0.0299 + 2.49      // 2.99% + R$2.49
    }
    
    const rate = feeRates[paymentMethod] || 0
    return Math.max(rate, 0) // Ensure minimum fee is 0
  }
  
  // Get monthly financial summary
  static getMonthlySummary(
    invoices: Invoice[],
    transactions: Transaction[],
    month: Date
  ) {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
    
    const monthlyInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at)
      return invDate >= monthStart && invDate <= monthEnd
    })
    
    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.transaction_date)
      return txDate >= monthStart && txDate <= monthEnd
    })
    
    const totalBilled = monthlyInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const totalPaid = monthlyTransactions
      .filter(tx => tx.status === 'completed')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const paidInvoices = monthlyInvoices.filter(inv => inv.status === InvoiceStatus.PAID)
    const overdueInvoices = monthlyInvoices.filter(inv => 
      inv.status === InvoiceStatus.SENT && new Date(inv.due_date) < new Date()
    )
    
    return {
      period: `${month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      totalBilled,
      totalPaid,
      totalPending: totalBilled - totalPaid,
      invoicesCount: monthlyInvoices.length,
      paidInvoicesCount: paidInvoices.length,
      overdueInvoicesCount: overdueInvoices.length,
      averageInvoiceValue: monthlyInvoices.length > 0 ? totalBilled / monthlyInvoices.length : 0,
      paymentMethodBreakdown: this.getPaymentMethodBreakdown(monthlyTransactions)
    }
  }
  
  // Break down revenue by payment method
  private static getPaymentMethodBreakdown(transactions: Transaction[]) {
    const breakdown: Record<PaymentMethod, { count: number; total: number }> = {} as any
    
    Object.values(PaymentMethod).forEach(method => {
      breakdown[method] = { count: 0, total: 0 }
    })
    
    transactions
      .filter(tx => tx.status === 'completed')
      .forEach(tx => {
        if (breakdown[tx.payment_method]) {
          breakdown[tx.payment_method].count++
          breakdown[tx.payment_method].total += tx.amount
        }
      })
    
    return breakdown
  }
  
  // Calculate commission for professionals
  static calculateProfessionalCommission(
    invoiceAmount: number,
    commissionRate: number,
    paymentMethod: PaymentMethod
  ): { commissionAmount: number; clinicAmount: number } {
    const processingFee = this.calculateProcessingFee(invoiceAmount, paymentMethod)
    const netAmount = invoiceAmount - processingFee
    const commissionAmount = netAmount * commissionRate
    const clinicAmount = netAmount - commissionAmount
    
    return {
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      clinicAmount: Math.round(clinicAmount * 100) / 100
    }
  }
  
  // Generate financial report for tax purposes
  static generateTaxReport(
    invoices: Invoice[],
    transactions: Transaction[],
    period: { start: Date; end: Date }
  ) {
    const periodInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.created_at)
      return invDate >= period.start && invDate <= period.end
    })
    
    const grossRevenue = periodInvoices.reduce((sum, inv) => sum + inv.total_amount, 0)
    const totalFees = transactions.reduce((sum, tx) => {
      const fee = this.calculateProcessingFee(tx.amount, tx.payment_method)
      return sum + fee
    }, 0)
    
    const netRevenue = grossRevenue - totalFees
    
    return {
      period: `${period.start.toLocaleDateString('pt-BR')} a ${period.end.toLocaleDateString('pt-BR')}`,
      grossRevenue,
      totalFees,
      netRevenue,
      invoiceCount: periodInvoices.length,
      averageTicket: periodInvoices.length > 0 ? grossRevenue / periodInvoices.length : 0,
      taxableRevenue: netRevenue
    }
  }
}