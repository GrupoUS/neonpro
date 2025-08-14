// Billing and Financial Types
export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED'
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER' | 'INSURANCE' | 'CASH' | 'INSTALLMENT'
export type TransactionType = 'PAYMENT' | 'REFUND' | 'ADJUSTMENT' | 'INSURANCE_PAYMENT'

export interface Billing {
  id: string
  patientId: string
  appointmentId?: string
  providerId: string
  invoiceNumber: string
  description: string
  amount: number
  discount?: number
  finalAmount: number
  paymentStatus: PaymentStatus
  paymentMethod?: PaymentMethod
  paymentDate?: string
  paymentReference?: string
  taxAmount?: number
  taxPercentage?: number
  cfmProcedure?: string
  dueDate: string
  overdueDays: number
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  billingId: string
  transactionType: TransactionType
  amount: number
  description?: string
  paymentMethod?: PaymentMethod
  transactionId?: string
  authorizationCode?: string
  pixKey?: string
  pixQrCode?: string
  pixTxid?: string
  status: PaymentStatus
  processedAt?: string
  createdAt: string
}

export interface PaymentPlan {
  id: string
  billingId: string
  totalAmount: number
  installments: number
  installmentValue: number
  firstDueDate: string
  status: 'active' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Invoice {
  id: string
  billingId: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  totalAmount: number
  taxAmount: number
  discountAmount: number
  finalAmount: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  pdfUrl?: string
}