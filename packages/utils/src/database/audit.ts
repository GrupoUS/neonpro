/**
 * @file Comprehensive audit logging system for NeonPro Healthcare Compliance
 * @description Main entry point implementing LGPD, ANVISA, and CFM compliance audit trails
 */

// Main audit system class imports
import { ANVISALogger } from "./audit-anvisa";
import { AuditReporter } from "./audit-reporter";
import { MedicalLogger } from "./audit-medical";
import { PatientDataLogger } from "./audit-patient";
import { SecurityLogger } from "./audit-security";

/**
 * Comprehensive audit system combining all specialized loggers
 */
class ComprehensiveAuditSystem extends AuditReporter {
  private readonly anvisaLogger: ANVISALogger;
  private readonly medicalLogger: MedicalLogger;
  private readonly patientLogger: PatientDataLogger;
  private readonly securityLogger: SecurityLogger;

  constructor() {
    super();
    this.anvisaLogger = new ANVISALogger();
    this.medicalLogger = new MedicalLogger();
    this.patientLogger = new PatientDataLogger();
    this.securityLogger = new SecurityLogger();
  }

  // Delegate to specialized loggers for better organization
  get anvisa() {
    return this.anvisaLogger;
  }

  get medical() {
    return this.medicalLogger;
  }

  get patient() {
    return this.patientLogger;
  }

  get security() {
    return this.securityLogger;
  }
}

// Group all exports at the end
export {
  type AccessType,
  type AuditLogEntry,
  type AuditLogFilters,
  type AuditReport,
  type AuditStatistics,
  type ComplianceEvent,
  type ComplianceMetrics,
  type DataSubjectRequestType,
  type ProcessingStatus,
  type RiskLevel,
} from "./audit-types";

export { AuditLogger } from "./audit-core";
export { ANVISALogger } from "./audit-anvisa";
export { MedicalLogger } from "./audit-medical";
export { PatientDataLogger } from "./audit-patient";
export { SecurityLogger } from "./audit-security";
export { AuditReporter } from "./audit-reporter";
export { ComprehensiveAuditSystem };
