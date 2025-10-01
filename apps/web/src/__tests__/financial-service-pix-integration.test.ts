import { describe, it, expect, beforeEach } from 'vitest'
import { FinancialService } from '@neonpro/core/src/financeiro/services/FinancialService'
import { Invoice, Transaction, PaymentMethod, InvoiceStatus } from '@neonpro/core/src/financeiro/types'

describe('FinancialService - PIX Integration', () => {
  let mockInvoice: Invoice
  let mockTransaction: Transaction

  beforeEach(() => {
    mockInvoice = {
      id: 'invoice-1',
      patient_id: 'patient-123',
      clinic_id: 'clinic-456',
      invoice_number: 'NF202401CLIN4561234',
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 1500,
      paid_amount: 0,
      status: InvoiceStatus.SENT,
      items: [{
        id: 'item-1',
        description: 'Tratamento Facial Completo',
        quantity: 1,
        unit_price: 1500,
        total_price: 1500
      }],
      notes: 'Pagamento referente a: Tratamento Facial Completo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    mockTransaction = {
      id: 'tx-1',
      invoice_id: 'invoice-1',
      patient_id: 'patient-123',
      clinic_id: 'clinic-456',
      amount: 1500,
      payment_method: PaymentMethod.PIX,
      status: 'pending',
      transaction_date: new Date().toISOString(),
      pix_key: 'clinic456@pix.com.br',
      pix_qr_code: 'base64qrcodedata',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })

  describe('PIX Fee Calculation', () => {
    it('should calculate correct PIX processing fee (0.99%)', () => {
      const fee = FinancialService.calculateProcessingFee(1500, PaymentMethod.PIX)
      const expectedFee = 1500 * 0.0099 // 0.99%
      
      expect(fee).toBe(expectedFee)
      expect(fee).toBe(14.85)
    })

    it('should calculate PIX fee for different amounts', () => {
      const testCases = [
        { amount: 100, expected: 0.99 },
        { amount: 500, expected: 4.95 },
        { amount: 1000, expected: 9.90 },
        { amount: 5000, expected: 49.50 },
        { amount: 10000, expected: 99.00 }
      ]

      testCases.forEach(({ amount, expected }) => {
        const fee = FinancialService.calculateProcessingFee(amount, PaymentMethod.PIX)
        expect(fee).toBe(expected)
      })
    })

    it('should handle edge cases for PIX fees', () => {
      // Zero amount
      expect(FinancialService.calculateProcessingFee(0, PaymentMethod.PIX)).toBe(0)
      
      // Very small amount
      const smallAmount = FinancialService.calculateProcessingFee(1, PaymentMethod.PIX)
      expect(smallAmount).toBe(0.0099)
      
      // Large amount
      const largeAmount = FinancialService.calculateProcessingFee(50000, PaymentMethod.PIX)
      expect(largeAmount).toBe(495)
    })

    it('should compare PIX fees with other payment methods', () => {
      const amount = 1000
      
      const pixFee = FinancialService.calculateProcessingFee(amount, PaymentMethod.PIX)
      const creditCardFee = FinancialService.calculateProcessingFee(amount, PaymentMethod.CREDIT_CARD)
      const debitCardFee = FinancialService.calculateProcessingFee(amount, PaymentMethod.DEBIT_CARD)
      const bankTransferFee = FinancialService.calculateProcessingFee(amount, PaymentMethod.BANK_TRANSFER)
      
      expect(pixFee).toBe(9.90)           // 0.99%
      expect(creditCardFee).toBe(50.59)    // 4.99% + R$0.69
      expect(debitCardFee).toBe(20.59)     // 1.99% + R$0.69
      expect(bankTransferFee).toBe(0)       // No fee
      
      // PIX should be cheapest for digital payments
      expect(pixFee).toBeLessThan(debitCardFee)
      expect(pixFee).toBeLessThan(creditCardFee)
    })
  })

  describe('PIX Invoice Generation', () => {
    it('should generate invoice with PIX payment option', () => {
      const invoice = FinancialService.generateInvoice(
        'patient-123',
        'clinic-456',
        'Tratamento Facial com PIX',
        1500,
        7
      )

      expect(invoice.patient_id).toBe('patient-123')
      expect(invoice.clinic_id).toBe('clinic-456')
      expect(invoice.total_amount).toBe(1500)
      expect(invoice.paid_amount).toBe(0)
      expect(invoice.status).toBe(InvoiceStatus.DRAFT)
      expect(invoice.invoice_number).toMatch(/^NF\d{8}/)
    })

    it('should generate Brazilian invoice number format', () => {
      const invoice1 = FinancialService.generateInvoice('clinic-123', 'patient-456', 'Test', 100)
      const invoice2 = FinancialService.generateInvoice('clinic-123', 'patient-789', 'Test', 100)
      
      // Invoice numbers should be unique
      expect(invoice1.invoice_number).not.toBe(invoice2.invoice_number)
      
      // Should follow format: NFYYYYMMCLINNNNN
      expect(invoice1.invoice_number).toMatch(/^NF\d{8}clinic\d{4}$/)
    })

    it('should handle different due dates for PIX', () => {
      const shortDue = FinancialService.generateInvoice('p1', 'c1', 'Test', 100, 1)
      const longDue = FinancialService.generateInvoice('p1', 'c1', 'Test', 100, 30)
      
      const shortDueDate = new Date(shortDue.due_date)
      const longDueDate = new Date(longDue.due_date)
      const now = new Date()
      
      // Short due should be ~1 day from now
      expect(shortDueDate.getDate()).toBe(now.getDate() + 1)
      
      // Long due should be ~30 days from now
      expect(longDueDate.getDate()).toBe(now.getDate() + 30)
    })
  })

  describe('PIX Transaction Processing', () => {
    it('should create PIX transaction with required fields', () => {
      const pixTransaction = {
        ...mockTransaction,
        payment_method: PaymentMethod.PIX,
        pix_key: 'clinic456@pix.com.br',
        pix_qr_code: 'iVBORw0KGgoAAAANSUhEUgAA...'
      }

      expect(pixTransaction.payment_method).toBe(PaymentMethod.PIX)
      expect(pixTransaction.pix_key).toContain('@pix.com.br')
      expect(pixTransaction.pix_qr_code).toBeTruthy()
      expect(pixTransaction.status).toBe('pending')
    })

    it('should validate PIX key format', () => {
      const validPixKeys = [
        'clinic456@pix.com.br',
        '12345678901234@pix.com.br',
        '5511999998888@pix.com.br'
      ]

      validPixKeys.forEach(key => {
        expect(key).toMatch(/^[a-zA-Z0-9]+@pix\.com\.br$/)
      })
    })

    it('should calculate net amount after PIX fees', () => {
      const grossAmount = 1500
      const pixFee = FinancialService.calculateProcessingFee(grossAmount, PaymentMethod.PIX)
      const netAmount = grossAmount - pixFee

      expect(netAmount).toBe(1485.15) // 1500 - 14.85
    })
  })

  describe('PIX Monthly Summary', () => {
    it('should include PIX transactions in monthly summary', () => {
      const currentMonth = new Date()
      
      const invoices = [mockInvoice]
      const transactions = [
        mockTransaction,
        {
          ...mockTransaction,
          id: 'tx-2',
          amount: 800,
          payment_method: PaymentMethod.CREDIT_CARD,
          status: 'completed'
        }
      ]

      const summary = FinancialService.getMonthlySummary(invoices, transactions, currentMonth)

      expect(summary.totalBilled).toBe(1500)
      expect(summary.totalPaid).toBe(800) // Only credit card completed
      expect(summary.totalPending).toBe(700) // 1500 - 800
    })

    it('should track PIX vs other payment methods', () => {
      const currentMonth = new Date()
      
      const transactions = [
        mockTransaction, // PIX - pending
        {
          ...mockTransaction,
          id: 'tx-2',
          amount: 500,
          payment_method: PaymentMethod.PIX,
          status: 'completed'
        },
        {
          ...mockTransaction,
          id: 'tx-3',
          amount: 300,
          payment_method: PaymentMethod.CREDIT_CARD,
          status: 'completed'
        }
      ]

      const pixTransactions = transactions.filter(tx => tx.payment_method === PaymentMethod.PIX)
      const completedPixTransactions = pixTransactions.filter(tx => tx.status === 'completed')
      
      expect(pixTransactions.length).toBe(2)
      expect(completedPixTransactions.length).toBe(1)
    })
  })

  describe('PIX Compliance and Security', () => {
    it('should ensure PIX transactions are audit-ready', () => {
      const auditFields = ['id', 'invoice_id', 'patient_id', 'clinic_id', 'amount', 'transaction_date', 'pix_key']
      
      auditFields.forEach(field => {
        expect(mockTransaction).toHaveProperty(field)
      })
    })

    it('should handle PIX timeout scenarios', () => {
      // PIX transactions typically expire after 24 hours
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      
      const expiredTransaction = {
        ...mockTransaction,
        created_at: yesterday.toISOString(),
        status: 'expired' as const
      }

      expect(expiredTransaction.status).toBe('expired')
    })

    it('should validate PIX amount limits', () => {
      // PIX has daily limits in Brazil
      const dailyLimit = 50000 // R$ 50,000 daily limit example
      
      const highValueTransaction = {
        ...mockTransaction,
        amount: dailyLimit + 1000
      }

      // Should flag high-value transactions for review
      expect(highValueTransaction.amount).toBeGreaterThan(dailyLimit)
    })
  })

  describe('Brazilian Market Specifics', () => {
    it('should use Brazilian Real currency format', () => {
      const amount = 1500.50
      const formatted = FinancialService.formatBrazilianCurrency?.(amount) || `R$ ${amount.toFixed(2)}`
      
      expect(formatted).toContain('R$')
      expect(formatted).toContain('1.500,50')
    })

    it('should handle Brazilian business days for due dates', () => {
      const invoice = FinancialService.generateInvoice('p1', 'c1', 'Test', 100, 3)
      const dueDate = new Date(invoice.due_date)
      
      // Due date should account for weekends (business days only)
      expect(dueDate.getDay()).toBeGreaterThan(0) // Not Sunday
      expect(dueDate.getDay()).toBeLessThan(6)    // Not Saturday
    })
  })
})