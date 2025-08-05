/**
 * LGPD Compliance Framework - Index Exports
 * Centraliza exports de todos os módulos de compliance
 */

// Re-export types from lgpd types
export type {
  AuditEventType,
  ComplianceReportType,
  ConsentRecord,
  ConsentStatus,
  ConsentType,
  DataSubjectRequest,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
  LegalBasis,
  LGPDAuditLog,
} from "../../types/lgpd";
// Export enum values for direct usage
export {
  AuditEventType,
  ComplianceReportType,
  ConsentStatus,
  ConsentType,
  DataSubjectRequestStatus,
  DataSubjectRequestType,
  LegalBasis,
} from "../../types/lgpd";
// Audit Trail Services
export { AuditEventType as LGPDAuditEventType, LGPDAuditTrail } from "./audit-trail";
export { scheduleDataDeletion } from "./data-deletion";

// Data Export/Deletion Services
export { generateDataExport } from "./data-export";
// Automation Services
export {
  type AutoConsentRule,
  type AutomationConfig,
  type ComplianceHealthCheck,
  LGPDAuditTrailService,
  LGPDAutoAnonymizationService,
  LGPDAutoAuditService,
  LGPDAutoConsentService,
  LGPDAutoDataSubjectRightsService,
  LGPDAutomationOrchestrator,
  LGPDAutoReportingService,
} from "./lgpd-automation";
// Core LGPD Services
// Default export with named alias
// Re-export default for backwards compatibility
export {
  default as LGPDComplianceService,
  default as LGPDComplianceServiceDefault,
  LGPDConsentService,
  LGPDCore,
  LGPDDataSubjectService,
  LGPDEncryptionService,
  LGPDEncryptionService as EncryptionService,
} from "./lgpd-core";
// Privacy Protection Services
export {
  type AnonymizationStatus,
  type DataSubjectRightRequest,
  type PatientPrivacyProfile,
  type PrivacyComplianceReport,
  type PrivacyPreferences,
  PrivacyProtectionManager,
  privacyProtectionManager,
} from "./privacy-protection";
