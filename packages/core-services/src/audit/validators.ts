// Compliance Policy Validators (Phase 4)
// Centralized validation logic for healthcare compliance frameworks

import type { 
  GenericAuditEvent, 
  ConsentReference, 
  ComplianceFramework, 
  ComplianceStatus,
  ComplianceViolation,
  RiskLevel,
  AuditAction,
  ActorType
} from './types';

/**
 * LGPD Compliance Validator
 * Validates Brazilian data protection law compliance
 */
export class LGPDValidator {
  /**
   * Check if action requires consent under LGPD
   */
  static requiresConsent(action: AuditAction): boolean {
    const consentRequiredActions: AuditAction[] = [
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'PRESCRIBE', 'DIAGNOSE', 'ACCESS'
    ];
    return consentRequiredActions.includes(action);
  }

  /**
   * Validate consent reference for LGPD compliance
   */
  static validateConsent(consentRef?: ConsentReference): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (!consentRef) {
      violations.push({
        id: `lgpd-no-consent-${Date.now()}`,
        framework: 'LGPD',
        severity: 'HIGH',
        description: 'LGPD violation: No consent reference provided for data processing',
        remediation: 'Obtain and record explicit consent before processing personal data'
      } as ComplianceViolation);
      return violations;
    }

    // Check consent status
    if (consentRef.status !== 'ACTIVE') {
      violations.push({
        id: `lgpd-invalid-consent-${Date.now()}`,
        framework: 'LGPD',
        severity: 'CRITICAL',
        description: `LGPD violation: Consent status is ${consentRef.status}, not ACTIVE`,
        remediation: 'Ensure valid, active consent before processing personal data'
      } as ComplianceViolation);
    }

    // Check expiration
    if (consentRef.expiresAt && new Date(consentRef.expiresAt) < new Date()) {
      violations.push({
        id: `lgpd-expired-consent-${Date.now()}`,
        framework: 'LGPD',
        severity: 'HIGH',
        description: 'LGPD violation: Consent has expired',
        remediation: 'Renew consent before continuing data processing'
      } as ComplianceViolation);
    }

    return violations;
  }

  /**
   * Assess risk level for LGPD compliance
   */
  static assessRisk(auditEvent: GenericAuditEvent): RiskLevel {
    const { action, actor, resource } = auditEvent;

    // Critical actions
    if (['DELETE', 'MODIFY'].includes(action)) return 'CRITICAL';
    
    // High-risk medical data
    if (['PRESCRIBE', 'DIAGNOSE'].includes(action)) return 'HIGH';
    
    // System/external actors are higher risk
    if (['SYSTEM', 'EXTERNAL_API', 'ANONYMOUS'].includes(actor.type)) return 'HIGH';
    
    // Administrative access
    if (actor.type === 'ADMIN') return 'MEDIUM';
    
    return 'LOW';
  }
}

/**
 * ANVISA Compliance Validator
 * Validates Brazilian health surveillance agency compliance
 */
export class ANVISAValidator {
  /**
   * Check if action requires ANVISA compliance tracking
   */
  static requiresTracking(action: AuditAction): boolean {
    const trackedActions: AuditAction[] = [
      'PRESCRIBE', 'DIAGNOSE', 'MODIFY', 'DELETE'
    ];
    return trackedActions.includes(action);
  }

  /**
   * Validate medical action compliance
   */
  static validateMedicalAction(auditEvent: GenericAuditEvent): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const { action, actor } = auditEvent;

    // Check if medical actions are performed by authorized actors
    if (['PRESCRIBE', 'DIAGNOSE'].includes(action)) {
      if (!['DOCTOR', 'NURSE'].includes(actor.type)) {
        violations.push({
          id: `anvisa-unauthorized-medical-${Date.now()}`,
          framework: 'ANVISA',
          severity: 'CRITICAL',
          description: `ANVISA violation: Medical action ${action} performed by unauthorized actor ${actor.type}`,
          remediation: 'Ensure only licensed medical professionals perform medical actions'
        } as ComplianceViolation);
      }

      // Check for required actor identification
      if (!actor.email || !actor.name) {
        violations.push({
          id: `anvisa-incomplete-identification-${Date.now()}`,
          framework: 'ANVISA',
          severity: 'HIGH',
          description: 'ANVISA violation: Incomplete medical professional identification',
          remediation: 'Ensure complete identification (name, email, license) for medical actions'
        } as ComplianceViolation);
      }
    }

    return violations;
  }
}

/**
 * CFM Compliance Validator
 * Validates Brazilian Federal Council of Medicine compliance
 */
export class CFMValidator {
  /**
   * Validate telemedicine compliance
   */
  static validateTelemedicine(auditEvent: GenericAuditEvent): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const { action, actor, metadata, consentRef } = auditEvent;

    // Check doctor authorization for telemedicine
    if (action === 'DIAGNOSE' && actor.type === 'DOCTOR') {
      if (!metadata?.telemedicineAuthorized) {
        violations.push({
          id: `cfm-telemedicine-unauthorized-${Date.now()}`,
          framework: 'CFM',
          severity: 'HIGH',
          description: 'CFM violation: Telemedicine diagnosis without proper authorization',
          remediation: 'Ensure doctor has valid telemedicine authorization'
        } as ComplianceViolation);
      }

      // Require explicit consent for telemedicine
      if (!consentRef || consentRef.type !== 'telemedicine') {
        violations.push({
          id: `cfm-telemedicine-consent-${Date.now()}`,
          framework: 'CFM',
          severity: 'HIGH',
          description: 'CFM violation: Telemedicine without explicit patient consent',
          remediation: 'Obtain explicit patient consent for telemedicine consultation'
        } as ComplianceViolation);
      }
    }

    return violations;
  }

  /**
   * Validate prescription compliance
   */
  static validatePrescription(auditEvent: GenericAuditEvent): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];
    const { action, actor, metadata } = auditEvent;

    if (action === 'PRESCRIBE') {
      // Check doctor authorization
      if (actor.type !== 'DOCTOR') {
        violations.push({
          id: `cfm-prescription-unauthorized-${Date.now()}`,
          framework: 'CFM',
          severity: 'CRITICAL',
          description: 'CFM violation: Prescription by non-doctor',
          remediation: 'Only licensed doctors can prescribe medications'
        } as ComplianceViolation);
      }

      // Check for required prescription metadata
      if (!metadata?.prescriptionId || !metadata?.patientId) {
        violations.push({
          id: `cfm-prescription-incomplete-${Date.now()}`,
          framework: 'CFM',
          severity: 'HIGH',
          description: 'CFM violation: Incomplete prescription documentation',
          remediation: 'Include prescription ID and patient ID in prescription records'
        } as ComplianceViolation);
      }
    }

    return violations;
  }
}

/**
 * Main Compliance Validation Engine
 */
export class ComplianceValidator {
  /**
   * Validate audit event against all applicable frameworks
   */
  static validateEvent(auditEvent: GenericAuditEvent): {
    complianceStatus: ComplianceStatus;
    violations: ComplianceViolation[];
    riskLevel: RiskLevel;
  } {
    const violations: ComplianceViolation[] = [];
    let maxRiskLevel: RiskLevel = 'LOW';

    // Validate against each framework
    for (const framework of auditEvent.frameworks) {
      switch (framework) {
        case 'LGPD':
          if (LGPDValidator.requiresConsent(auditEvent.action)) {
            violations.push(...LGPDValidator.validateConsent(auditEvent.consentRef));
          }
          const lgpdRisk = LGPDValidator.assessRisk(auditEvent);
          if (this.isHigherRisk(lgpdRisk, maxRiskLevel)) {
            maxRiskLevel = lgpdRisk;
          }
          break;

        case 'ANVISA':
          if (ANVISAValidator.requiresTracking(auditEvent.action)) {
            violations.push(...ANVISAValidator.validateMedicalAction(auditEvent));
          }
          break;

        case 'CFM':
          violations.push(...CFMValidator.validateTelemedicine(auditEvent));
          violations.push(...CFMValidator.validatePrescription(auditEvent));
          break;
      }
    }

    // Add audit event ID to all violations
    violations.forEach(violation => {
      violation.auditEventId = auditEvent.id;
    });

    // Determine compliance status
    let complianceStatus: ComplianceStatus;
    if (violations.length === 0) {
      complianceStatus = 'COMPLIANT';
    } else {
      // Any violation makes it non-compliant
      complianceStatus = 'NON_COMPLIANT';
    }

    // Risk level is the maximum of assessed risk and violation-based risk
    const violationRisk = this.getViolationRiskLevel(violations);
    if (this.isHigherRisk(violationRisk, maxRiskLevel)) {
      maxRiskLevel = violationRisk;
    }

    return {
      complianceStatus,
      violations,
      riskLevel: maxRiskLevel
    };
  }

  /**
   * Get risk level based on violations
   */
  private static getViolationRiskLevel(violations: ComplianceViolation[]): RiskLevel {
    if (violations.some(v => v.severity === 'CRITICAL')) return 'CRITICAL';
    if (violations.some(v => v.severity === 'HIGH')) return 'HIGH';
    if (violations.some(v => v.severity === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Compare risk levels
   */
  private static isHigherRisk(risk1: RiskLevel, risk2: RiskLevel): boolean {
    const riskOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2, 'CRITICAL': 3 };
    return riskOrder[risk1] > riskOrder[risk2];
  }

  /**
   * Check if frameworks require consent
   */
  static requiresConsent(action: AuditAction, frameworks: ComplianceFramework[]): boolean {
    return frameworks.some(framework => {
      switch (framework) {
        case 'LGPD':
        case 'GDPR':
          return LGPDValidator.requiresConsent(action);
        default:
          return false;
      }
    });
  }
}