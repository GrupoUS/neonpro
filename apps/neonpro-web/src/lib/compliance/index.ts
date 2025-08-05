/**
 * LGPD Compliance Framework - Index Exports
 * Centraliza exports de todos os módulos de compliance
 */

// Core LGPD Services
export {
  LGPDEncryptionService,
  LGPDConsentService,
  LGPDDataSubjectService,
  LGPDCore
} from './lgpd-core';

// Re-export types from lgpd types
export type {
  ConsentType,
  ConsentStatus,
  LegalBasis,
  DataSubjectRequestType,
  DataSubjectRequestStatus,
  AuditEventType,
  ConsentRecord,
  DataSubjectRequest,
  LGPDAuditLog,
  ComplianceReportType
} from '../../types/lgpd';

// Export enum values for direct usage
export {
  ConsentType,
  ConsentStatus,
  LegalBasis,
  DataSubjectRequestType,
  DataSubjectRequestStatus,
  AuditEventType,
  ComplianceReportType
} from '../../types/lgpd';

// Audit Trail Services
export { LGPDAuditTrail, AuditEventType as LGPDAuditEventType } from './audit-trail';

// Data Export/Deletion Services
export { generateDataExport } from './data-export';
export { scheduleDataDeletion } from './data-deletion';
export { LGPDEncryptionService as EncryptionService } from './lgpd-core';

// Default export with named alias
export { default as LGPDComplianceService } from './lgpd-core';

// Privacy Protection Services
export {
  PrivacyProtectionManager,
  type PatientPrivacyProfile,
  type PrivacyPreferences,
  type DataSubjectRightRequest,
  type AnonymizationStatus,
  type PrivacyComplianceReport,
  privacyProtectionManager
} from './privacy-protection';

// Automation Services
export {
  LGPDAutomationOrchestrator,
  LGPDAutoConsentService,
  LGPDAutoDataSubjectRightsService,
  LGPDAutoAuditService,
  LGPDAutoReportingService,
  LGPDAutoAnonymizationService,
  LGPDAuditTrailService,
  type AutomationConfig,
  type AutoConsentRule,
  type ComplianceHealthCheck
} from './lgpd-automation';

// Re-export default for backwards compatibility
export { default as LGPDComplianceServiceDefault } from './lgpd-core';
