// Core Services for NeonPro Aesthetic Clinic SaaS
// Main exports for all business services

// Enhanced Service Layer Pattern (Enterprise Foundation)
export { EnhancedServiceBase } from "./base";
export type {
	CreateInvoiceData,
	CreatePaymentData,
	CreatePaymentPlanData,
	Discount,
	Invoice,
	Payment,
	PaymentPlan,
	Refund,
	TreatmentPackage,
} from "./billing";
// Billing Services
export { BillingService } from "./billing";
export * from "./constants";
export type {
	CreateProductData,
	CreateStockItemData,
	CreateSupplierData,
	InventoryAlert,
	Product,
	PurchaseOrder,
	StockItem,
	StockMovement,
	Supplier,
} from "./inventory";
// Inventory Services
export { InventoryService } from "./inventory";
export type {
	CreateNotificationCampaignData,
	CreateNotificationTemplateData,
	NotificationCampaign,
	NotificationChannel,
	NotificationPreference,
	NotificationTemplate,
} from "./notification";
// Notification Services
export { NotificationService } from "./notification";
export type {
	AestheticHistory,
	ConsentForm,
	CreatePatientData,
	MedicalHistory,
	Patient,
	PatientFilters,
	PatientStats,
	SkinAssessment,
	UpdatePatientData,
} from "./patient";
// Patient Services
export { PatientService } from "./patient";
export { EnhancedPatientService } from "./patient/enhanced-service";
export type {
	AISchedulingConfig,
	AppointmentSlot,
	Conflict,
	DynamicSchedulingEvent,
	OptimizationRecommendation,
	SchedulingAction,
	SchedulingAnalytics,
	SchedulingRequest,
	SchedulingResult,
} from "./scheduling";
// Scheduling Services
export { AISchedulingService } from "./scheduling";
export type {
	CreateTreatmentPlanData,
	CreateTreatmentSessionData,
	TreatmentPhoto,
	TreatmentPlan,
	TreatmentSession,
} from "./treatment";
// Treatment Services
export { TreatmentService } from "./treatment";
export type {
	AuditEvent,
	BaseEntity,
	HealthcareOperation,
	PerformanceMetrics,
	SecurityConfig,
	ServiceContext,
	ServiceError,
	ServiceHealth,
} from "./types";
// Common types and utilities
export {
	AppointmentStatus,
	BillingStatus,
	InventoryStatus,
	NotificationType,
	PatientStatus,
	TreatmentType,
} from "./types";
