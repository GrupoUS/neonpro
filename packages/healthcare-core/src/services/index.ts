/**
 * Domain Services
 * @package `@neonpro/healthcare-core`
 */

// Consent service
export {
  ConsentDomainService,
  ConsentDomainServiceConfig,
  consentDomainService,
  type ConsentDomainService as IConsentDomainService,
} from './consent-service';

// Audit service
export {
  AuditDomainService,
  AuditDomainServiceConfig,
  AuditEvent,
  AuditSeverity,
  auditDomainService,
  type AuditDomainService as IAuditDomainService,
} from './audit-service';

// Medical license service
export {
  MedicalLicenseDomainService,
  MedicalLicenseDomainServiceConfig,
  MedicalLicenseVerificationResult,
  TelemedicineAuthorization,
  MedicalLicenseState,
  LicenseVerificationStatus,
  TelemedicineAuthorizationStatus,
  medicalLicenseDomainService,
  type MedicalLicenseDomainService as IMedicalLicenseDomainService,
} from './medical-license-service';

// Base domain service
export {
  BaseDomainService,
  BaseDomainServiceConfig,
  type BaseDomainService as IBaseDomainService,
} from './base-domain-service';