/**
 * Healthcare Base Data Models
 * Foundation types for healthcare compliance and data classification
 * LGPD, ANVISA, and CFM compliance requirements
 */

// Re-export LGPD types from existing consent module
export { DataCategory as LGPDDataCategory } from '../types/lgpd-consent';

// Healthcare Data Classification according to Brazilian healthcare regulations
export enum HealthcareDataClassification {
  // Public data - no restrictions
  PUBLIC = 'public',
  
  // Internal data - clinic/hospital internal use
  INTERNAL = 'internal',
  
  // Patient identifying data - requires consent
  PATIENT_IDENTIFYING = 'patient_identifying',
  
  // Patient sensitive data - requires explicit consent and special handling
  PATIENT_SENSITIVE = 'patient_sensitive',
  
  // Medical records - highest protection level
  MEDICAL_RECORDS = 'medical_records',
  
  // Emergency data - special access rules
  EMERGENCY_ACCESS = 'emergency_access'
}

// Data Retention Classes according to LGPD and healthcare regulations
export enum DataRetentionClass {
  // Immediate deletion after use (1-7 days)
  IMMEDIATE = 'immediate',
  
  // Short-term retention (1-30 days)
  SHORT_TERM = 'short_term',
  
  // Medium-term retention (1-12 months)
  MEDIUM_TERM = 'medium_term',
  
  // Long-term retention (1-10 years)
  LONG_TERM = 'long_term',
  
  // Permanent retention (medical records - 20+ years)
  PERMANENT = 'permanent',
  
  // Legal hold - indefinite retention due to legal proceedings
  LEGAL_HOLD = 'legal_hold'
}

// Healthcare Privacy Levels
export enum HealthcarePrivacyLevel {
  // No privacy concerns
  NONE = 'none',
  
  // Basic privacy - standard healthcare protocols
  BASIC = 'basic',
  
  // Enhanced privacy - sensitive conditions
  ENHANCED = 'enhanced',
  
  // Maximum privacy - mental health, reproductive health, etc.
  MAXIMUM = 'maximum'
}

// Healthcare Compliance Standards
export enum ComplianceStandard {
  // LGPD - Brazilian General Data Protection Law
  LGPD = 'lgpd',
  
  // ANVISA - Brazilian Health Surveillance Agency
  ANVISA = 'anvisa',
  
  // CFM - Federal Council of Medicine
  CFM = 'cfm',
  
  // ISO 27001 - Information Security Management
  ISO_27001 = 'iso_27001',
  
  // HIPAA - US Health Insurance Portability and Accountability Act (for reference)
  HIPAA = 'hipaa'
}

// Healthcare Data Processing Purpose
export enum HealthcareProcessingPurpose {
  // Direct patient care
  PATIENT_CARE = 'patient_care',
  
  // Administrative purposes
  ADMINISTRATION = 'administration',
  
  // Quality assurance
  QUALITY_ASSURANCE = 'quality_assurance',
  
  // Medical research (anonymized)
  RESEARCH = 'research',
  
  // Public health reporting
  PUBLIC_HEALTH = 'public_health',
  
  // Legal compliance
  LEGAL_COMPLIANCE = 'legal_compliance',
  
  // Insurance and billing
  BILLING = 'billing',
  
  // Emergency care
  EMERGENCY_CARE = 'emergency_care'
}

// Healthcare Data Access Level
export enum HealthcareAccessLevel {
  // Patient self-access
  PATIENT = 'patient',
  
  // Healthcare professional (treating)
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  
  // Healthcare professional (consulting)
  HEALTHCARE_CONSULTANT = 'healthcare_consultant',
  
  // Administrative staff
  ADMINISTRATIVE = 'administrative',
  
  // Emergency personnel
  EMERGENCY = 'emergency',
  
  // System administrator
  SYSTEM_ADMIN = 'system_admin',
  
  // Audit/compliance officer
  AUDIT = 'audit'
}

// Healthcare Data Subject Type
export enum HealthcareDataSubjectType {
  // Individual patient
  PATIENT = 'patient',
  
  // Healthcare professional
  HEALTHCARE_PROFESSIONAL = 'healthcare_professional',
  
  // Legal guardian/representative
  LEGAL_GUARDIAN = 'legal_guardian',
  
  // Emergency contact
  EMERGENCY_CONTACT = 'emergency_contact',
  
  // Insurance provider
  INSURANCE_PROVIDER = 'insurance_provider'
}

// Utility type for healthcare data classification mapping
export interface HealthcareDataClassificationMapping {
  classification: HealthcareDataClassification;
  privacyLevel: HealthcarePrivacyLevel;
  retentionClass: DataRetentionClass;
  requiredStandards: ComplianceStandard[];
  allowedPurposes: HealthcareProcessingPurpose[];
  accessLevels: HealthcareAccessLevel[];
}

// Default classification mappings
export const DEFAULT_HEALTHCARE_CLASSIFICATIONS: Record<HealthcareDataClassification, HealthcareDataClassificationMapping> = {
  [HealthcareDataClassification.PUBLIC]: {
    classification: HealthcareDataClassification.PUBLIC,
    privacyLevel: HealthcarePrivacyLevel.NONE,
    retentionClass: DataRetentionClass.MEDIUM_TERM,
    requiredStandards: [ComplianceStandard.LGPD],
    allowedPurposes: [HealthcareProcessingPurpose.PUBLIC_HEALTH, HealthcareProcessingPurpose.RESEARCH],
    accessLevels: [HealthcareAccessLevel.PATIENT, HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL, HealthcareAccessLevel.ADMINISTRATIVE]
  },
  
  [HealthcareDataClassification.INTERNAL]: {
    classification: HealthcareDataClassification.INTERNAL,
    privacyLevel: HealthcarePrivacyLevel.BASIC,
    retentionClass: DataRetentionClass.MEDIUM_TERM,
    requiredStandards: [ComplianceStandard.LGPD, ComplianceStandard.ISO_27001],
    allowedPurposes: [HealthcareProcessingPurpose.ADMINISTRATION, HealthcareProcessingPurpose.QUALITY_ASSURANCE],
    accessLevels: [HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL, HealthcareAccessLevel.ADMINISTRATIVE]
  },
  
  [HealthcareDataClassification.PATIENT_IDENTIFYING]: {
    classification: HealthcareDataClassification.PATIENT_IDENTIFYING,
    privacyLevel: HealthcarePrivacyLevel.ENHANCED,
    retentionClass: DataRetentionClass.LONG_TERM,
    requiredStandards: [ComplianceStandard.LGPD, ComplianceStandard.ANVISA, ComplianceStandard.CFM],
    allowedPurposes: [HealthcareProcessingPurpose.PATIENT_CARE, HealthcareProcessingPurpose.BILLING, HealthcareProcessingPurpose.LEGAL_COMPLIANCE],
    accessLevels: [HealthcareAccessLevel.PATIENT, HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL, HealthcareAccessLevel.EMERGENCY]
  },
  
  [HealthcareDataClassification.PATIENT_SENSITIVE]: {
    classification: HealthcareDataClassification.PATIENT_SENSITIVE,
    privacyLevel: HealthcarePrivacyLevel.MAXIMUM,
    retentionClass: DataRetentionClass.LONG_TERM,
    requiredStandards: [ComplianceStandard.LGPD, ComplianceStandard.ANVISA, ComplianceStandard.CFM, ComplianceStandard.ISO_27001],
    allowedPurposes: [HealthcareProcessingPurpose.PATIENT_CARE, HealthcareProcessingPurpose.EMERGENCY_CARE],
    accessLevels: [HealthcareAccessLevel.PATIENT, HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL]
  },
  
  [HealthcareDataClassification.MEDICAL_RECORDS]: {
    classification: HealthcareDataClassification.MEDICAL_RECORDS,
    privacyLevel: HealthcarePrivacyLevel.MAXIMUM,
    retentionClass: DataRetentionClass.PERMANENT,
    requiredStandards: [ComplianceStandard.LGPD, ComplianceStandard.ANVISA, ComplianceStandard.CFM, ComplianceStandard.ISO_27001],
    allowedPurposes: [HealthcareProcessingPurpose.PATIENT_CARE, HealthcareProcessingPurpose.LEGAL_COMPLIANCE, HealthcareProcessingPurpose.EMERGENCY_CARE],
    accessLevels: [HealthcareAccessLevel.PATIENT, HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL, HealthcareAccessLevel.EMERGENCY, HealthcareAccessLevel.AUDIT]
  },
  
  [HealthcareDataClassification.EMERGENCY_ACCESS]: {
    classification: HealthcareDataClassification.EMERGENCY_ACCESS,
    privacyLevel: HealthcarePrivacyLevel.ENHANCED,
    retentionClass: DataRetentionClass.SHORT_TERM,
    requiredStandards: [ComplianceStandard.LGPD, ComplianceStandard.ANVISA, ComplianceStandard.CFM],
    allowedPurposes: [HealthcareProcessingPurpose.EMERGENCY_CARE, HealthcareProcessingPurpose.PATIENT_CARE],
    accessLevels: [HealthcareAccessLevel.EMERGENCY, HealthcareAccessLevel.HEALTHCARE_PROFESSIONAL]
  }
};

// Utility functions for healthcare data classification
export class HealthcareDataClassificationUtils {
  /**
   * Get classification mapping for a specific data type
   */
  static getClassificationMapping(classification: HealthcareDataClassification): HealthcareDataClassificationMapping {
    return DEFAULT_HEALTHCARE_CLASSIFICATIONS[classification];
  }
  
  /**
   * Validate if a processing purpose is allowed for a classification
   */
  static isPurposeAllowed(classification: HealthcareDataClassification, purpose: HealthcareProcessingPurpose): boolean {
    const mapping = this.getClassificationMapping(classification);
    return mapping.allowedPurposes.includes(purpose);
  }
  
  /**
   * Validate if an access level is allowed for a classification
   */
  static isAccessLevelAllowed(classification: HealthcareDataClassification, accessLevel: HealthcareAccessLevel): boolean {
    const mapping = this.getClassificationMapping(classification);
    return mapping.accessLevels.includes(accessLevel);
  }
  
  /**
   * Get required compliance standards for a classification
   */
  static getRequiredStandards(classification: HealthcareDataClassification): ComplianceStandard[] {
    const mapping = this.getClassificationMapping(classification);
    return mapping.requiredStandards;
  }
  
  /**
   * Get retention period in days for a retention class
   */
  static getRetentionPeriodDays(retentionClass: DataRetentionClass): number {
    switch (retentionClass) {
      case DataRetentionClass.IMMEDIATE:
        return 7;
      case DataRetentionClass.SHORT_TERM:
        return 30;
      case DataRetentionClass.MEDIUM_TERM:
        return 365;
      case DataRetentionClass.LONG_TERM:
        return 3650; // 10 years
      case DataRetentionClass.PERMANENT:
        return 7300; // 20 years
      case DataRetentionClass.LEGAL_HOLD:
        return -1; // Indefinite
      default:
        return 365;
    }
  }
  
  /**
   * Determine the most restrictive classification from a list
   */
  static getMostRestrictiveClassification(classifications: HealthcareDataClassification[]): HealthcareDataClassification {
    const hierarchy = {
      [HealthcareDataClassification.PUBLIC]: 1,
      [HealthcareDataClassification.INTERNAL]: 2,
      [HealthcareDataClassification.PATIENT_IDENTIFYING]: 3,
      [HealthcareDataClassification.EMERGENCY_ACCESS]: 4,
      [HealthcareDataClassification.PATIENT_SENSITIVE]: 5,
      [HealthcareDataClassification.MEDICAL_RECORDS]: 6
    };
    
    return classifications.reduce((mostRestrictive, current) => {
      return hierarchy[current] > hierarchy[mostRestrictive] ? current : mostRestrictive;
    }, HealthcareDataClassification.PUBLIC);
  }
  
  /**
   * Validate compliance requirements for data processing
   */
  static validateComplianceRequirements(
    classification: HealthcareDataClassification,
    purpose: HealthcareProcessingPurpose,
    accessLevel: HealthcareAccessLevel,
    requiredStandards: ComplianceStandard[]
  ): {
    valid: boolean;
    violations: string[];
    recommendations: string[];
  } {
    const violations: string[] = [];
    const recommendations: string[] = [];
    const mapping = this.getClassificationMapping(classification);
    
    // Check purpose
    if (!this.isPurposeAllowed(classification, purpose)) {
      violations.push(`Processing purpose '${purpose}' not allowed for classification '${classification}'`);
    }
    
    // Check access level
    if (!this.isAccessLevelAllowed(classification, accessLevel)) {
      violations.push(`Access level '${accessLevel}' not allowed for classification '${classification}'`);
    }
    
    // Check compliance standards
    const missingStandards = mapping.requiredStandards.filter(std => !requiredStandards.includes(std));
    if (missingStandards.length > 0) {
      violations.push(`Missing required compliance standards: ${missingStandards.join(', ')}`);
    }
    
    // Recommendations based on classification
    if (classification === HealthcareDataClassification.PATIENT_SENSITIVE || 
        classification === HealthcareDataClassification.MEDICAL_RECORDS) {
      recommendations.push('Consider implementing additional encryption for sensitive data');
      recommendations.push('Ensure regular audit logs are maintained');
      recommendations.push('Implement data masking for non-production environments');
    }
    
    return {
      valid: violations.length === 0,
      violations,
      recommendations
    };
  }
}