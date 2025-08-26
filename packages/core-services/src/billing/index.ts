// Billing module exports

export type { BillingRepository } from "./service";
export * from "./service";
export { BillingService } from "./service";
// Re-export commonly used types
export type {
  BillingStats,
  CreateDiscountData,
  CreateInvoiceData,
  CreatePaymentData,
  CreatePaymentPlanData,
  CreateTreatmentPackageData,
  Discount,
  Installment,
  Invoice,
  InvoiceItem,
  Payment,
  PaymentPlan,
  Refund,
  TreatmentPackage,
} from "./types";
export * from "./types";
export {
  DiscountType,
  InstallmentFrequency,
  InstallmentStatus,
  PaymentMethod,
  PaymentPlanStatus,
  PaymentStatus,
  RefundStatus,
} from "./types";
