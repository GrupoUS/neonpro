// Core Services for NeonPro Aesthetic Clinic SaaS
// Main exports for all business services

// Scheduling Services
export { AISchedulingService } from './scheduling';
export type {
  AppointmentSlot,
  SchedulingRequest,
  SchedulingResult,
  SchedulingAnalytics,
  DynamicSchedulingEvent,
  SchedulingAction,
  AISchedulingConfig,
  Conflict,
  OptimizationRecommendation
} from './scheduling';

// Treatment Services  
export { TreatmentService } from './treatment';
export type { 
  TreatmentSession,
  TreatmentPlan,
  TreatmentPhoto,
  CreateTreatmentSessionData,
  CreateTreatmentPlanData
} from './treatment';

// Patient Services
export { PatientService } from './patient';
export type {
  Patient,
  CreatePatientData,
  UpdatePatientData,
  MedicalHistory,
  AestheticHistory,
  SkinAssessment,
  ConsentForm,
  PatientFilters,
  PatientStats
} from './patient';

// Inventory Services
export { InventoryService } from './inventory';
export type {
  Product,
  StockItem,
  StockMovement,
  Supplier,
  PurchaseOrder,
  InventoryAlert,
  CreateProductData,
  CreateStockItemData,
  CreateSupplierData
} from './inventory';

// Billing Services
export { BillingService } from './billing';
export type {
  Invoice,
  Payment,
  PaymentPlan,
  TreatmentPackage,
  Discount,
  Refund,
  CreateInvoiceData,
  CreatePaymentData,
  CreatePaymentPlanData
} from './billing';

// Notification Services
export { NotificationService } from './notification';
export type {
  NotificationTemplate,
  NotificationChannel,
  NotificationPreference,
  NotificationCampaign,
  CreateNotificationTemplateData,
  CreateNotificationCampaignData
} from './notification';

// Common types and utilities
export {
  AppointmentStatus,
  TreatmentType,
  PatientStatus,
  BillingStatus,
  NotificationType,
  InventoryStatus
} from './types';
export type { BaseEntity } from './types';
export * from './constants';