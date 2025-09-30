// Financial domain types for aesthetic clinic billing and payments
import { z } from 'zod'
import { BaseEntity } from '../../common/types'

export interface Invoice extends BaseEntity {
  patient_id: string
  clinic_id: string
  appointment_id?: string
  invoice_number: string
  due_date: Date
  total_amount: number
  paid_amount: number
  status: InvoiceStatus
  payment_method?: PaymentMethod
  items: InvoiceItem[]
  notes?: string
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  OVERDUE = 'overdue',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  PIX = 'pix',
  CARNET = 'carnet'
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  treatment_id?: string
}

export interface Transaction extends BaseEntity {
  invoice_id: string
  amount: number
  payment_method: PaymentMethod
  transaction_date: Date
  gateway_transaction_id?: string
  status: TransactionStatus
  metadata?: Record<string, any>
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CHARGED_BACK = 'charged_back'
}

// Validation schemas
export const invoiceSchema = z.object({
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  due_date: z.date(),
  total_amount: z.number().min(0),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number().positive(),
    unit_price: z.number().min(0)
  }))
})