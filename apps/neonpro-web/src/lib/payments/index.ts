/**
 * NeonPro Payment System - Index Exports
 * Centraliza exports de todos os módulos de pagamento
 */

// Core Payment Services
export { PaymentProcessor } from './payment-processor';
export { StripeProvider } from './stripe';

// Gateway Services
export { PaymentGatewayManager } from './gateways';
export { StripeGateway } from './gateways/stripe-gateway';
export { PagarMeGateway } from './gateways/pagarme-gateway';

// Recurring Payments
export { RecurringPaymentManager } from './recurring';

// Installments
export { InstallmentManager } from './installments';

// Receipts
export { ReceiptManager } from './receipts';

// Delinquency
export { DelinquencyManager } from './delinquency';

// Email
export { PaymentEmailService } from './email';

// Card Management
export { CardManager } from './card';

// Reconciliation
export { ReconciliationManager } from './reconciliation';

// PDF Generation
export { PDFGenerator } from './pdf';

// Types (assumed to exist)
export type {
  PaymentMethod,
  PaymentStatus,
  TransactionResult,
  PaymentConfig,
  GatewayProvider,
  RecurringPaymentConfig,
  InstallmentPlan,
  ReceiptData,
  DelinquencyPolicy
} from '../types/payments';
