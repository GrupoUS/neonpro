// ============================================================================
// NeonPro Shared Package Exports
// ============================================================================

// Core library
export const shared = { version: "1.0.0" };

// Healthcare logging
export { default as healthcareLogger, createHealthcareLogger, databaseLogger, apiLogger, securityLogger, middlewareLogger, auditLogger, realtimeLogger, complianceLogger, chatLogger, analyticsLogger, governanceLogger, resilienceLogger, cacheLogger } from './logging/healthcare-logger';
export { logHealthcareError, logAuditEvent, logPerformanceMetric } from './logging/healthcare-logger';

// Telemetry and observability models
// Export only types to avoid function name collisions; alias helper if needed
export type {
  TelemetryEventType,
  TelemetrySeverity,
  HealthcareDataSensitivity,
  TelemetryEvent,
  WebVitalsEvent,
  HealthcareAccessEvent,
  AICostEvent,
  ComplianceEvent,
} from "./models/telemetry-event";
// export { createDefaultLGPDMetadata, PerformanceMetricsSchema, sanitizeTelemetryEvent } from './models/telemetry-event';
// Alias function to avoid conflicts with notifications.validateHealthcareCompliance
// export { validateHealthcareCompliance as validateTelemetryCompliance } from './models/telemetry-event';

// Existing exports
// Temporarily commented out due to build issues
// export * from "./types/ai-insights";
// Export API types (names do not collide with validators)
export * from "./types/api";
export * from "./types/appointment";
// Export only enums and interfaces from contact to avoid helper duplicate names
export {
  ContactType,
  RelationshipType,
  CommunicationMethod,
  type ContactPreferences,
  type Contact,
} from "./types/contact";
// LGPD Consent types (canonical LegalBasis here)
export {
  LegalBasis as LGPDLegalBasis,
  DataCategory,
  ProcessingPurpose,
  DataSubjectRight,
  type DataRetentionSettings,
  type ConsentHistory,
  type DataSubjectRequest,
  type LGPDConsent as LGPDConsentModel,
  withdrawConsent,
  validateConsentCompleteness,
  generateConsentSummary,
  isConsentExpired,
  renewConsent,
  createDataSubjectRequest,
  auditLGPDCompliance,
} from "./types/lgpd-consent";
export * from "./types/medical-history";
export {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
  type ChannelConfig,
  type NotificationPreferences,
  type NotificationTemplate,
  type DeliveryStatus,
  type Notification,
  // Avoid re-exporting helper functions with generic names to prevent collisions
} from "./types/notifications";
// Export only enums and interfaces from patient to avoid helper duplicate names
export {
  Gender,
  PatientStatus,
  LegalBasis,
  type Address,
  type EmergencyContact,
  type HealthcareInfo,
  type LGPDConsent as PatientLGPDConsent,
  type AuditLogEntry as PatientAuditLogEntry,
  type AuditTrail,
  type Patient,
} from "./types/patient";

// Validators
// Choose validators as canonical source for validation helpers
export {
  cleanDocument,
  validateCPF,
  formatCPF,
  validateCNPJ,
  formatCNPJ,
  validateBrazilianPhone,
  formatBrazilianPhone,
  validateCEP,
  formatCEP,
  validateCRM,
  validateANVISACode,
  validateSUSCard,
  validateBrazilianState,
  validateEmail,
  getValidationMessage,
  validatePatientData,
  validateBrazilianAddress,
  createValidationSchema,
  BRAZILIAN_STATES,
  HEALTHCARE_SPECIALTIES,
  type ValidationError,
  type ValidationResult,
} from "./validators/brazilian";

// Environment configuration
export * from "./env/ai";

// Authentication
// NOTE: Avoid duplicate type re-exports (e.g., AuthUser) already provided by ./types/api
// export * from './auth/auth-provider';

// export * from './auth/protected-route';

// Models
export * from "./models/healthcare-base";
export * from "./models/ai-optimization";

// Components
// export * from './components/healthcare-base';

// API client
export * from "./api-client";

// Hooks
export * from "./hooks/useRealtimeQuery";

// Realtime
export * from "./realtime/realtime-manager";

// Internationalization
export * from "./i18n/ai-chat";

// WebRTC infrastructure
export * from "./webrtc";

// Telemetry and observability
export * from "./telemetry";
export * from "./services/cache-management";
