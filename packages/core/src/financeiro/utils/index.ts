// Financial utilities
import { PaymentMethod, InvoiceStatus } from '../types'

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'Dinheiro',
  [PaymentMethod.CREDIT_CARD]: 'Cartão de Crédito',
  [PaymentMethod.DEBIT_CARD]: 'Cartão de Débito',
  [PaymentMethod.BANK_TRANSFER]: 'Transferência Bancária',
  [PaymentMethod.PIX]: 'PIX',
  [PaymentMethod.CARNET]: 'Carnê'
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: 'Rascunho',
  [InvoiceStatus.SENT]: 'Enviado',
  [InvoiceStatus.OVERDUE]: 'Vencido',
  [InvoiceStatus.PAID]: 'Pago',
  [InvoiceStatus.PARTIALLY_PAID]: 'Parcialmente Pago',
  [InvoiceStatus.CANCELLED]: 'Cancelado'
}

export const getPaymentMethodIcon = (method: PaymentMethod): string => {
  const icons = {
    [PaymentMethod.CASH]: '💵',
    [PaymentMethod.CREDIT_CARD]: '💳',
    [PaymentMethod.DEBIT_CARD]: '💳',
    [PaymentMethod.BANK_TRANSFER]: '🏦',
    [PaymentMethod.PIX]: '📱',
    [PaymentMethod.CARNET]: '📋'
  }
  
  return icons[method] || '💰'
}