// ============================================================================
// NeonPro Shared Package Exports
// ============================================================================

// Core library
export const shared = { version: '1.0.0' }

// Healthcare logging
export {
  analyticsLogger,
  apiLogger,
  auditLogger,
  cacheLogger,
  chatLogger,
  complianceLogger,
  createHealthcareLogger,
  databaseLogger,
  default as healthcareLogger,
  governanceLogger,
  middlewareLogger,
  realtimeLogger,
  resilienceLogger,
  securityLogger,
} from './logging/healthcare-logger'
export {
  logAuditEvent,
  logHealthcareError,
  logPerformanceMetric,
} from './logging/healthcare-logger'

// TElemetry and observability models
// Export only types to avoid function name collisions; alias helper if needed
export type {
  AICostEvent,
  ComplianceEvent,
  HealthcareAccessEvent,
  HealthcareDataSensitivity,
  // ...
} from './models/telemetry-event'
// export { createDefaultLGPDMetadata, PerformanceMetricsSchema, sanitizeTelemetryEvent } from './models/telemetry-event';
// Alias function to avoid conflicts with notifications.validateHealthcareCompliance
// export { validateHealthcareCompliance as validateTelemetryCompliance } from './models/telemetry-event';

// Export API types (names do not collide with validators)
export * from './types/api'
export * from './types/appointment'
// Export only enums and interfaces from contact to avoid helper duplicate names
export {
  CommunicationMethod,
  type Contact,
  type ContactPreferences,
  ContactType,
  RelationshipType,
} from './types/contact'
// LGPD Consent types (canonical LegalBasis here)
export {
  auditLGPDCompliance,
  type ConsentHistory,
  createDataSubjectRequest,
  DataCategory,
  type DataRetentionSettings,
  type DataSubjectRequest,
  DataSubjectRight,
  generateConsentSummary,
  isConsentExpired,
  LegalBasis as LGPDLegalBasis,
  type LGPDConsent as LGPDConsentModel,
  ProcessingPurpose,
  renewConsent,
  validateConsentCompleteness,
  withdrawConsent,
} from './types/lgpd-consent'
export * from './types/medical-history'
export {
  type ChannelConfig,
  type DeliveryStatus,
  type Notification,
  NotificationChannel,
  type NotificationPreferences,
  NotificationPriority,
  NotificationStatus,
  type NotificationTemplate,
  NotificationType,
  // Avoid re-exporting helper functions with generic names to prevent collisions
} from './types/notifications'
// Export only enums and interfaces from patient to avoid helper duplicate names
export {
  type Address,
  type AuditLogEntry as PatientAuditLogEntry,
  type AuditTrail,
  type EmergencyContact,
  Gender,
  type HealthcareInfo,
  LegalBasis,
  type LGPDConsent as PatientLGPDConsent,
  type Patient,
  PatientStatus,
} from './types/patient'

// Validators
// Choose validators as canonical source for validation helpers
export {
  BRAZILIAN_STATES,
  cleanDocument,
  createValidationSchema,
  formatBrazilianPhone,
  formatCEP,
  formatCNPJ,
  formatCPF,
  getValidationMessage,
  HEALTHCARE_SPECIALTIES,
  validateANVISACode,
  validateBrazilianAddress,
  validateBrazilianPhone,
  validateBrazilianState,
  validateCEP,
  validateCNPJ,
  validateCPF,
  validateCRM,
  validateEmail,
  validatePatientData,
  validateSUSCard,
  type ValidationError,
  type ValidationResult,
} from './validators/brazilian'

// Environment configuration
export * from './env/ai'

// Authentication
// NOTE: Avoid duplicate type re-exports (e.g., AuthUser) already provided by ./types/api
// export * from './auth/auth-provider';

// export * from './auth/protected-route';

// Models
export * from './models/ai-optimization'
export * from './models/healthcare-base'

// Components
// export * from './components/healthcare-base';

// API client
export * from './api-client'

// Hooks
export * from './hooks/useRealtimeQuery'

// Realtime
export * from './realtime/realtime-manager'

// Internationalization
export * from './i18n/ai-chat'

// WebRTC infrastructure
export * from './webrtc'

// Telemetry and observability
export type { CFMComplianceLevel as ComplianceLevel } from '@neonpro/types'
export * from './services/cache-management'
export * from './telemetry'
