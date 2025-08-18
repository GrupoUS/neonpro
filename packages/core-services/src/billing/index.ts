// Billing module exports
export * from './types';
export * from './service';

// Re-export commonly used types
export type {
  Invoice,
  Payment,
  PaymentPlan,
  TreatmentPackage,
  Discount,
  Refund,
  Installment,
  InvoiceItem,
  CreateInvoiceData,
  CreatePaymentData,
  CreatePaymentPlanData,
  CreateTreatmentPackageData,
  CreateDiscountData,
  BillingStats
} from './types';

export { BillingService } from './service';
export { 
  PaymentMethod,
  PaymentStatus,
  PaymentPlanStatus,
  InstallmentStatus,
  InstallmentFrequency,
  DiscountType,
  RefundStatus
} from './types';

export type { BillingRepository } from './service';