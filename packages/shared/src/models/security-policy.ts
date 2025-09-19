/**
 * SecurityPolicy Data Model
 * T029 - Security & Compliance data models for healthcare platform
 *
 * Comprehensive security policy definitions with LGPD and ANVISA compliance
 * Based on 002-platform-architecture-improvements data-model.md specification
 */

import { z } from 'zod';

// ============================================================================
// Core Security Policy Types
// ============================================================================

/**
 * Main security policy interface combining all security aspects
 */
export interface SecurityPolicy {
  id: string;
  name: string;
  version: string;
  description: string;

  // Policy scope and application
  scope: {
    applicationScope: 'global' | 'clinic' | 'department' | 'role_specific';
    targetUsers: ('healthcare_professional' | 'patient' | 'admin' | 'support')[];
    targetSystems: ('web_app' | 'mobile_app' | 'api' | 'database' | 'ai_service')[];
    enforcementLevel: 'advisory' | 'warning' | 'blocking' | 'critical';
  };

  // Healthcare compliance requirements
  healthcareCompliance: HealthcareCompliancePolicy;

  // LGPD data protection policies
  lgpdCompliance: LGPDCompliancePolicy;

  // ANVISA medical device security
  anvisaCompliance: ANVISACompliancePolicy;

  // Authentication and access control
  authenticationPolicy: AuthenticationPolicy;

  // Data security and encryption
  dataSecurityPolicy: DataSecurityPolicy;

  // Audit and monitoring requirements
  auditPolicy: AuditPolicy;

  // Incident response procedures
  incidentResponse: IncidentResponsePolicy;

  // Policy management metadata
  metadata: PolicyMetadata;
}

// ============================================================================
// Healthcare Compliance Policy
// ============================================================================

export interface HealthcareCompliancePolicy {
  // Brazilian healthcare regulations
  regulations: {
    cfmCompliance: {
      enabled: boolean;
      digitalCertificateRequired: boolean;
      professionalRegistrationValidation: boolean;
      medicalActsLogging: boolean;
      patientConsentManagement: boolean;
    };

    anvisaCompliance: {
      enabled: boolean;
      medicalDeviceClassification: 'class-i' | 'class-ii' | 'class-iii' | 'class-iv';
      postMarketSurveillance: boolean;
      adverseEventReporting: boolean;
      cybersecurityRequirements: boolean;
    };

    lgpdCompliance: {
      enabled: boolean;
      dataProcessingLegalBasis: string[];
      consentManagement: boolean;
      dataSubjectRights: boolean;
      dataProtectionOfficerRequired: boolean;
    };
  };

  // Clinical data protection
  clinicalDataProtection: {
    patientDataEncryption: boolean;
    medicalRecordIntegrity: boolean;
    hipaaLevelSecurity: boolean;
    anonymizationRequirements: boolean;
    dataMinimizationPrinciple: boolean;
  };

  // Emergency access provisions
  emergencyAccess: {
    breakGlassAccess: boolean;
    emergencyOverride: boolean;
    emergencyContactProtocols: boolean;
    criticalPatientDataAccess: boolean;
    auditEmergencyAccess: boolean;
  };

  // Quality and safety standards
  qualityStandards: {
    iso27001Compliance: boolean;
    iso13485Compliance: boolean;
    hl7FhirStandards: boolean;
    ihe4Compliance: boolean;
    clinicalDataInteroperability: boolean;
  };
}

// ============================================================================
// LGPD Compliance Policy
// ============================================================================

export interface LGPDCompliancePolicy {
  // Legal basis for data processing (LGPD Article 7)
  legalBasis: {
    primary: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_interest' | 'legitimate_interests';
    secondary?: string[];
    justification: string;
    documentation: string;
  };

  // Data subject rights implementation (LGPD Article 18)
  dataSubjectRights: {
    rightToAccess: {
      enabled: boolean;
      responseTimeLimit: number; // Days (max 15)
      automatedResponse: boolean;
      formatOptions: ('json' | 'pdf' | 'csv')[];
    };

    rightToCorrection: {
      enabled: boolean;
      verificationRequired: boolean;
      responseTimeLimit: number;
      auditTrail: boolean;
    };

    rightToAnonymization: {
      enabled: boolean;
      automaticAnonymization: boolean;
      retentionAfterAnonymization: number; // Days
    };

    rightToBlocking: {
      enabled: boolean;
      immediateBlocking: boolean;
      blockingScope: 'full' | 'partial' | 'conditional';
    };

    rightToDeletion: {
      enabled: boolean;
      automaticDeletion: boolean;
      hardDelete: boolean;
      cascadeDeletion: boolean;
    };

    rightToPortability: {
      enabled: boolean;
      structuredFormat: boolean;
      machineReadable: boolean;
      standardFormats: string[];
    };

    rightToInformation: {
      enabled: boolean;
      sharingDisclosure: boolean;
      purposeDisclosure: boolean;
      retentionDisclosure: boolean;
    };

    rightToConsentWithdrawal: {
      enabled: boolean;
      immediateWithdrawal: boolean;
      granularWithdrawal: boolean;
      impactAssessment: boolean;
    };
  };

  // Data categorization and handling
  dataHandling: {
    personalDataCategories: {
      identificationData: boolean; // CPF, RG, nome
      contactData: boolean; // Email, telefone, endereço
      biometricData: boolean; // Impressões digitais, reconhecimento facial
      healthData: boolean; // Dados de saúde, prontuários
      financialData: boolean; // Dados de pagamento, planos
      behavioralData: boolean; // Padrões de uso, preferências
    };

    sensitiveDataHandling: {
      healthDataProtection: boolean;
      biometricDataProtection: boolean;
      specialCategoryProtection: boolean;
      additionalSafeguards: string[];
    };

    dataMinimization: {
      purposeLimitation: boolean;
      collectionMinimization: boolean;
      processingMinimization: boolean;
      storageLimitation: boolean;
    };
  };

  // Consent management
  consentManagement: {
    consentRequirements: {
      freeAndInformed: boolean;
      specific: boolean;
      unambiguous: boolean;
      granular: boolean;
      withdrawable: boolean;
    };

    consentCapture: {
      explicitConsent: boolean;
      consentVersioning: boolean;
      consentProof: boolean;
      technicalSafeguards: boolean;
    };

    consentTypes: {
      dataProcessingConsent: boolean;
      marketingConsent: boolean;
      profilingConsent: boolean;
      thirdPartyConsent: boolean;
      researchConsent: boolean;
    };
  };

  // Data transfers and sharing
  dataTransfers: {
    domesticTransfers: {
      controllerToController: boolean;
      controllerToProcessor: boolean;
      adequateSafeguards: boolean;
      contractualProtection: boolean;
    };

    internationalTransfers: {
      adequacyDecision: boolean;
      adequateCountries: string[];
      safeguards: string[];
      specialAuthorization: boolean;
    };

    thirdPartySharing: {
      sharingAgreements: boolean;
      purposeLimitation: boolean;
      securityRequirements: boolean;
      auditRequirements: boolean;
    };
  };

  // Data protection impact assessment (DPIA)
  dataProtectionImpactAssessment: {
    dpiaRequired: boolean;
    riskAssessment: boolean;
    mitigationMeasures: string[];
    stakeholderConsultation: boolean;
    regularReview: boolean;
  };

  // Data breach response
  dataBreachResponse: {
    breachDetection: boolean;
    anpdNotification: {
      required: boolean;
      timeLimit: number; // Hours (max 72)
      notificationChannels: string[];
    };
    dataSubjectNotification: {
      required: boolean;
      riskThreshold: 'low' | 'medium' | 'high';
      notificationChannels: string[];
    };
    breachDocumentation: boolean;
    remedialActions: string[];
  };
}

// ============================================================================
// ANVISA Compliance Policy
// ============================================================================

export interface ANVISACompliancePolicy {
  // Software as Medical Device (SaMD) classification
  samdClassification: {
    productClassification: {
      riskClass: 'class-i' | 'class-ii' | 'class-iii' | 'class-iv';
      riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
      medicalPurpose: string;
      targetUser: 'healthcare_professional' | 'patient' | 'lay_user';
      clinicalDecisionLevel: 'inform' | 'drive' | 'diagnose' | 'treat';
    };

    regulatoryStatus: {
      registrationRequired: boolean;
      registrationNumber?: string;
      registrationDate?: string;
      expirationDate?: string;
      renewalRequired: boolean;
    };
  };

  // Cybersecurity requirements (RDC 657/2022)
  cybersecurityRequirements: {
    securityByDesign: boolean;
    threatModeling: boolean;
    vulnerabilityManagement: boolean;
    incidentResponse: boolean;
    securityTesting: boolean;
    postMarketMonitoring: boolean;
  };

  // Quality management system
  qualityManagement: {
    iso13485Compliance: boolean;
    designControls: boolean;
    riskManagement: boolean;
    softwareLifecycle: boolean;
    changeControl: boolean;
    documentationControl: boolean;
  };

  // Clinical evidence requirements
  clinicalEvidence: {
    clinicalEvaluationRequired: boolean;
    clinicalData: {
      clinicalTrials: boolean;
      realWorldEvidence: boolean;
      literatureReview: boolean;
      expertOpinion: boolean;
    };
    postMarketClinicalFollowUp: boolean;
    adverseEventReporting: boolean;
  };

  // Technical documentation
  technicalDocumentation: {
    softwareRequirements: boolean;
    architectureDocumentation: boolean;
    securityDocumentation: boolean;
    interoperabilityStandards: string[];
    validationDocumentation: boolean;
    userManuals: boolean;
  };
}

// ============================================================================
// Authentication Policy
// ============================================================================

export interface AuthenticationPolicy {
  // Password requirements
  passwordPolicy: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    specialCharsAllowed: string;
    preventCommonPasswords: boolean;
    preventUserInfoInPassword: boolean;
    maxAge: number; // Days
    preventReuse: number; // Number of previous passwords
    strengthRequirement: 'weak' | 'fair' | 'good' | 'strong' | 'very_strong';
  };

  // Multi-factor authentication
  multiFactor: {
    required: boolean;
    requiredRoles: string[];
    methods: {
      totp: boolean;
      sms: boolean;
      email: boolean;
      hardwareToken: boolean;
      biometric: boolean;
      pushNotification: boolean;
    };
    backupCodes: {
      enabled: boolean;
      codeLength: number;
      codeCount: number;
      oneTimeUse: boolean;
    };
    gracePeriod: number; // Days for MFA setup
  };

  // Session management
  sessionManagement: {
    sessionTimeout: number; // Minutes of inactivity
    absoluteTimeout: number; // Minutes regardless of activity
    concurrentSessions: number; // Max concurrent sessions per user
    sessionInvalidation: {
      onPasswordChange: boolean;
      onRoleChange: boolean;
      onSuspension: boolean;
    };
    secureSessionHandling: boolean;
    sessionEncryption: boolean;
  };

  // Account lockout
  accountLockout: {
    enabled: boolean;
    maxFailedAttempts: number;
    lockoutDuration: number; // Minutes
    progressiveLockout: boolean;
    adminUnlockRequired: boolean;
    lockoutNotification: boolean;
  };

  // Single Sign-On (SSO)
  singleSignOn: {
    enabled: boolean;
    providers: ('saml' | 'oauth2' | 'openid_connect')[];
    autoProvisioning: boolean;
    roleMapping: Record<string, string[]>;
    sessionSynchronization: boolean;
  };

  // Biometric authentication
  biometricAuthentication: {
    enabled: boolean;
    methods: ('fingerprint' | 'face_recognition' | 'voice_recognition')[];
    fallbackMethods: string[];
    privacyProtection: boolean;
    localProcessing: boolean;
    qualityRequirements: Record<string, number>;
  };
}

// ============================================================================
// Data Security Policy
// ============================================================================

export interface DataSecurityPolicy {
  // Encryption requirements
  encryption: {
    encryptionAtRest: {
      enabled: boolean;
      algorithm: 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';
      keyManagement: 'hsm' | 'kms' | 'vault' | 'manual';
      keyRotation: {
        enabled: boolean;
        frequency: number; // Days
        automatic: boolean;
      };
    };

    encryptionInTransit: {
      enabled: boolean;
      minTlsVersion: '1.2' | '1.3';
      cipherSuites: string[];
      certificateValidation: boolean;
      pinning: boolean;
    };

    applicationLevelEncryption: {
      sensitiveFields: boolean;
      searchableEncryption: boolean;
      formatPreservingEncryption: boolean;
      tokenization: boolean;
    };
  };

  // Access control
  accessControl: {
    roleBasedAccess: {
      enabled: boolean;
      roles: Record<string, string[]>; // role -> permissions
      hierarchicalRoles: boolean;
      dynamicRoles: boolean;
    };

    attributeBasedAccess: {
      enabled: boolean;
      attributes: string[];
      policies: string[];
      contextualAccess: boolean;
    };

    principleOfLeastPrivilege: boolean;
    segregationOfDuties: boolean;
    privilegedAccessManagement: {
      enabled: boolean;
      justInTimeAccess: boolean;
      approvalWorkflow: boolean;
      sessionRecording: boolean;
    };
  };

  // Data classification
  dataClassification: {
    classificationScheme: {
      'public': {
        description: string;
        handling: string[];
        retention: number; // Days
      };
      'internal': {
        description: string;
        handling: string[];
        retention: number;
      };
      'confidential': {
        description: string;
        handling: string[];
        retention: number;
      };
      'restricted': {
        description: string;
        handling: string[];
        retention: number;
      };
    };

    automaticClassification: boolean;
    classificationLabeling: boolean;
    handlingInstructions: boolean;
  };

  // Data loss prevention
  dataLossPrevention: {
    enabled: boolean;
    contentInspection: boolean;
    exfiltrationPrevention: boolean;
    emailProtection: boolean;
    webProtection: boolean;
    endpointProtection: boolean;
    cloudProtection: boolean;
  };

  // Backup and recovery
  backupRecovery: {
    backupEncryption: boolean;
    backupFrequency: string;
    retentionPeriod: number; // Days
    offSiteBackup: boolean;
    backupTesting: boolean;
    recoveryTimeObjective: number; // Hours
    recoveryPointObjective: number; // Hours
    disasterRecovery: boolean;
  };
}

// ============================================================================
// Audit Policy
// ============================================================================

export interface AuditPolicy {
  // Audit logging requirements
  auditLogging: {
    enabled: boolean;
    logLevel: 'minimal' | 'standard' | 'comprehensive' | 'detailed';
    realTimeLogging: boolean;
    structuredLogging: boolean;

    // Events to audit
    auditEvents: {
      authentication: boolean;
      authorization: boolean;
      dataAccess: boolean;
      dataModification: boolean;
      systemChanges: boolean;
      securityEvents: boolean;
      emergencyAccess: boolean;
      adminActions: boolean;
    };

    // Log data requirements
    logData: {
      timestamp: boolean;
      userId: boolean;
      sessionId: boolean;
      ipAddress: boolean;
      userAgent: boolean;
      action: boolean;
      resource: boolean;
      outcome: boolean;
      dataChanged: boolean;
    };
  };

  // Log protection and integrity
  logProtection: {
    logEncryption: boolean;
    logSigning: boolean;
    tamperProtection: boolean;
    logForwarding: boolean;
    centralizedLogging: boolean;
    logRetention: number; // Days
    logArchival: boolean;
  };

  // Monitoring and alerting
  monitoring: {
    realTimeMonitoring: boolean;
    anomalyDetection: boolean;
    behavioralAnalysis: boolean;
    threatIntelligence: boolean;

    // Alert triggers
    alertTriggers: {
      failedLogins: number;
      privilegeEscalation: boolean;
      dataExfiltration: boolean;
      suspiciousActivity: boolean;
      policyViolations: boolean;
      systemFailures: boolean;
    };

    // Alert actions
    alertActions: {
      emailNotification: boolean;
      smsNotification: boolean;
      ticketCreation: boolean;
      automaticResponse: boolean;
      escalationProcedure: boolean;
    };
  };

  // Compliance reporting
  complianceReporting: {
    automaticReporting: boolean;
    reportingFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    reportTemplates: string[];
    regulatoryReporting: {
      lgpdReporting: boolean;
      anvisaReporting: boolean;
      cfmReporting: boolean;
    };
    auditTrails: boolean;
    evidenceCollection: boolean;
  };
}

// ============================================================================
// Incident Response Policy
// ============================================================================

export interface IncidentResponsePolicy {
  // Incident classification
  incidentClassification: {
    severityLevels: {
      'low': {
        description: string;
        responseTime: number; // Hours
        escalationLevel: string;
      };
      'medium': {
        description: string;
        responseTime: number;
        escalationLevel: string;
      };
      'high': {
        description: string;
        responseTime: number;
        escalationLevel: string;
      };
      'critical': {
        description: string;
        responseTime: number;
        escalationLevel: string;
      };
    };

    incidentTypes: {
      'security_breach': string;
      'data_breach': string;
      'system_compromise': string;
      'malware_infection': string;
      'unauthorized_access': string;
      'service_disruption': string;
      'compliance_violation': string;
    };
  };

  // Response procedures
  responseProcedures: {
    incidentDetection: {
      automaticDetection: boolean;
      userReporting: boolean;
      externalReporting: boolean;
      detectionSources: string[];
    };

    initialResponse: {
      incidentConfirmation: boolean;
      initialContainment: boolean;
      stakeholderNotification: boolean;
      evidencePreservation: boolean;
      documentationStart: boolean;
    };

    investigation: {
      forensicAnalysis: boolean;
      rootCauseAnalysis: boolean;
      impactAssessment: boolean;
      timelineReconstruction: boolean;
      expertConsultation: boolean;
    };

    containmentEradication: {
      threatContainment: boolean;
      systemIsolation: boolean;
      malwareRemoval: boolean;
      vulnerabilityPatching: boolean;
      systemHardening: boolean;
    };

    recovery: {
      systemRestoration: boolean;
      dataRecovery: boolean;
      serviceResumption: boolean;
      monitoringEnhancement: boolean;
      validationTesting: boolean;
    };
  };

  // Communication plan
  communicationPlan: {
    internalCommunication: {
      incidentTeam: string[];
      managementEscalation: string[];
      legalTeam: string[];
      complianceTeam: string[];
      communicationChannels: string[];
    };

    externalCommunication: {
      customerNotification: boolean;
      regulatoryNotification: {
        anpd: boolean; // LGPD authority
        anvisa: boolean;
        cfm: boolean;
        otherAuthorities: string[];
      };
      mediaRelations: boolean;
      partnerNotification: boolean;
    };

    publicDisclosure: {
      disclosureRequired: boolean;
      timeframe: number; // Hours
      disclosureChannels: string[];
      messagingGuidelines: string;
    };
  };

  // Post-incident activities
  postIncident: {
    lessonsLearned: boolean;
    processImprovement: boolean;
    policyUpdates: boolean;
    trainingUpdates: boolean;
    documentationUpdate: boolean;
    followUpActions: boolean;
  };

  // Team and responsibilities
  incidentTeam: {
    incidentCommander: string;
    securityTeam: string[];
    technicalTeam: string[];
    legalTeam: string[];
    communicationsTeam: string[];
    managementTeam: string[];
    externalConsultants: string[];
  };
}

// ============================================================================
// Policy Metadata
// ============================================================================

export interface PolicyMetadata {
  // Version control
  version: {
    major: number;
    minor: number;
    patch: number;
    preRelease?: string;
  };

  // Lifecycle management
  lifecycle: {
    status: 'draft' | 'review' | 'approved' | 'active' | 'deprecated' | 'archived';
    createdAt: string;
    createdBy: string;
    reviewedAt?: string;
    reviewedBy?: string;
    approvedAt?: string;
    approvedBy?: string;
    effectiveDate?: string;
    expirationDate?: string;
  };

  // Change management
  changeHistory: {
    version: string;
    changeDate: string;
    changedBy: string;
    changeDescription: string;
    changeReason: string;
    approvalRequired: boolean;
    impactAssessment: boolean;
  }[];

  // Compliance tracking
  complianceTracking: {
    lastComplianceReview: string;
    nextComplianceReview: string;
    complianceStatus: 'compliant' | 'non_compliant' | 'partial' | 'pending_review';
    complianceGaps: string[];
    remediationPlan: string[];
  };

  // Risk assessment
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    mitigationMeasures: string[];
    residualRisk: 'low' | 'medium' | 'high' | 'critical';
    lastRiskReview: string;
  };

  // Training and awareness
  trainingRequirements: {
    trainingRequired: boolean;
    targetAudience: string[];
    trainingFrequency: number; // Months
    competencyValidation: boolean;
    certificationRequired: boolean;
  };
}

// ============================================================================
// Zod Validation Schemas
// ============================================================================

// Healthcare Compliance Schema
export const HealthcareCompliancePolicySchema = z.object({
  regulations: z.object({
    cfmCompliance: z.object({
      enabled: z.boolean(),
      digitalCertificateRequired: z.boolean(),
      professionalRegistrationValidation: z.boolean(),
      medicalActsLogging: z.boolean(),
      patientConsentManagement: z.boolean(),
    }),
    anvisaCompliance: z.object({
      enabled: z.boolean(),
      medicalDeviceClassification: z.enum(['class-i', 'class-ii', 'class-iii', 'class-iv']),
      postMarketSurveillance: z.boolean(),
      adverseEventReporting: z.boolean(),
      cybersecurityRequirements: z.boolean(),
    }),
    lgpdCompliance: z.object({
      enabled: z.boolean(),
      dataProcessingLegalBasis: z.array(z.string()),
      consentManagement: z.boolean(),
      dataSubjectRights: z.boolean(),
      dataProtectionOfficerRequired: z.boolean(),
    }),
  }),
  clinicalDataProtection: z.object({
    patientDataEncryption: z.boolean(),
    medicalRecordIntegrity: z.boolean(),
    hipaaLevelSecurity: z.boolean(),
    anonymizationRequirements: z.boolean(),
    dataMinimizationPrinciple: z.boolean(),
  }),
  emergencyAccess: z.object({
    breakGlassAccess: z.boolean(),
    emergencyOverride: z.boolean(),
    emergencyContactProtocols: z.boolean(),
    criticalPatientDataAccess: z.boolean(),
    auditEmergencyAccess: z.boolean(),
  }),
  qualityStandards: z.object({
    iso27001Compliance: z.boolean(),
    iso13485Compliance: z.boolean(),
    hl7FhirStandards: z.boolean(),
    ihe4Compliance: z.boolean(),
    clinicalDataInteroperability: z.boolean(),
  }),
});

// Password Policy Schema
export const PasswordPolicySchema = z.object({
  minLength: z.number().min(8).max(128),
  maxLength: z.number().min(8).max(256),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  specialCharsAllowed: z.string(),
  preventCommonPasswords: z.boolean(),
  preventUserInfoInPassword: z.boolean(),
  maxAge: z.number().positive(),
  preventReuse: z.number().min(0).max(24),
  strengthRequirement: z.enum(['weak', 'fair', 'good', 'strong', 'very_strong']),
});

// Main Security Policy Schema
export const SecurityPolicySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  description: z.string().min(1).max(1000),

  scope: z.object({
    applicationScope: z.enum(['global', 'clinic', 'department', 'role_specific']),
    targetUsers: z.array(z.enum(['healthcare_professional', 'patient', 'admin', 'support'])),
    targetSystems: z.array(z.enum(['web_app', 'mobile_app', 'api', 'database', 'ai_service'])),
    enforcementLevel: z.enum(['advisory', 'warning', 'blocking', 'critical']),
  }),

  healthcareCompliance: HealthcareCompliancePolicySchema,

  // Additional schema definitions would continue here...
  // For brevity, showing key schemas only
});

// ============================================================================
// Security Policy Utilities
// ============================================================================

/**
 * Security policy validation utility
 */
export class SecurityPolicyValidator {
  /**
   * Validate a security policy against the schema
   */
  static validate(policy: unknown): SecurityPolicy {
    // Temporary cast until full schema parity with SecurityPolicy interface is implemented
    return SecurityPolicySchema.parse(policy) as unknown as SecurityPolicy;
  }

  /**
   * Validate password strength against policy
   */
  static validatePasswordStrength(password: string, policy: AuthenticationPolicy['passwordPolicy']): {
    isValid: boolean;
    violations: string[];
    strength: string;
  } {
    const violations: string[] = [];

    if (password.length < policy.minLength) {
      violations.push(`Password must be at least ${policy.minLength} characters long`);
    }

    if (password.length > policy.maxLength) {
      violations.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
      violations.push('Password must contain at least one uppercase letter');
    }

    if (policy.requireLowercase && !/[a-z]/.test(password)) {
      violations.push('Password must contain at least one lowercase letter');
    }

    if (policy.requireNumbers && !/\d/.test(password)) {
      violations.push('Password must contain at least one number');
    }

    if (policy.requireSpecialChars) {
      const specialCharsPattern = new RegExp(`[${policy.specialCharsAllowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
      if (!specialCharsPattern.test(password)) {
        violations.push('Password must contain at least one special character');
      }
    }

    // Calculate password strength
    let strengthScore = 0;
    if (password.length >= 12) strengthScore += 2;
    else if (password.length >= 8) strengthScore += 1;

    if (/[a-z]/.test(password)) strengthScore += 1;
    if (/[A-Z]/.test(password)) strengthScore += 1;
    if (/\d/.test(password)) strengthScore += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore += 1;

    const strengthLevels = ['very_weak', 'weak', 'fair', 'good', 'strong', 'very_strong'];
    const strength = strengthLevels[Math.min(strengthScore, strengthLevels.length - 1)];

    return {
      isValid: violations.length === 0,
      violations,
      strength,
    };
  }

  /**
   * Check if MFA is required for a user role
   */
  static isMfaRequired(userRole: string, policy: AuthenticationPolicy['multiFactor']): boolean {
    if (!policy.required) return false;
    return policy.requiredRoles.length === 0 || policy.requiredRoles.includes(userRole);
  }

  /**
   * Get data retention period based on classification
   */
  static getRetentionPeriod(dataClassification: string, policy: DataSecurityPolicy): number {
    const classification = policy.dataClassification.classificationScheme[dataClassification as keyof typeof policy.dataClassification.classificationScheme];
    return classification?.retention || 365; // Default to 1 year
  }
}

// ============================================================================
// Export Types
// ============================================================================



export default SecurityPolicy;
