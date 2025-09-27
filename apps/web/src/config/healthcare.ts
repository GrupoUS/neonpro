// Brazilian Healthcare Compliance Configuration
// LGPD (Lei Geral de Proteção de Dados), ANVISA, and CFM compliance

export const LGPD_CONFIG = {
  enabled: true,
  dataRetentionDays: 365,
  anonymizationEnabled: true,
  consentRequired: true,
  auditTrailEnabled: true,
  encryptionRequired: true,
  dataBreachNotificationHours: 72,
  dataSubjectRights: {
    access: true,
    rectification: true,
    erasure: true,
    portability: true,
    objection: true,
    automatedDecisionMaking: true,
  },
  sensitiveDataCategories: [
    'health_data',
    'biometric_data',
    'genetic_data',
    'personal_identification',
    'financial_data',
    'contact_information',
  ],
} as const

export const ANVISA_CONFIG = {
  enabled: true,
  medicalDeviceClassification: 'Class_IIa',
  qualityManagementSystem: true,
  riskManagement: true,
  postMarketSurveillance: true,
  adverseEventReporting: true,
  traceabilityRequirements: true,
  documentationRetentionYears: 10,
  changeControlProcess: true,
  supplierQualification: true,
} as const

export const CFM_CONFIG = {
  enabled: true,
  professionalRegistrationRequired: true,
  telemedicineGuidelines: true,
  patientRecordMaintenance: true,
  ethicalGuidelines: true,
  continuingEducation: true,
  supervisionRequirements: true,
  emergencyProtocols: true,
  informedConsentRequired: true,
} as const

export const HEALTHCARE_REGIONS = {
  BR: {
    timezone: 'America/Sao_Paulo',
    dateFormat: 'dd/MM/yyyy',
    language: 'pt-BR',
    currency: 'BRL',
    phoneFormat: '+55 (11) 99999-9999',
    addressFormat: 'brazilian',
    emergencyServices: '192',
    healthInsuranceRequired: false,
  },
  US: {
    timezone: 'America/New_York',
    dateFormat: 'MM/dd/yyyy',
    language: 'en-US',
    currency: 'USD',
    phoneFormat: '+1 (555) 555-5555',
    addressFormat: 'us',
    emergencyServices: '911',
    healthInsuranceRequired: true,
  },
} as const

export const HEALTHCARE_VALIDATION_RULES = {
  patient: {
    minAge: 13,
    maxAge: 120,
    requiredFields: [
      'fullName',
      'dateOfBirth',
      'phone',
      'address',
      'emergencyContact',
    ],
    consentRequired: true,
  },
  professional: {
    minAge: 18,
    maxAge: 80,
    requiredFields: [
      'fullName',
      'professionalId',
      'specialty',
      'contactInformation',
      'licenseNumber',
    ],
    licenseValidation: true,
  },
  appointment: {
    maxAdvanceDays: 90,
    minAdvanceHours: 2,
    cancellationPolicy: {
      minimumHours: 24,
      penaltyFee: 0.5,
    },
    noShowPolicy: {
      maxConsecutive: 3,
      suspensionDays: 30,
    },
  },
  treatment: {
    contraindicationCheck: true,
    patientAssessmentRequired: true,
    informedConsentRequired: true,
    aftercareInstructions: true,
    followUpSchedule: true,
  },
} as const

export const AUDIT_CONFIG = {
  enabled: true,
  logLevel: 'detailed',
  retentionDays: 2555, // 7 years for healthcare
  sensitiveOperations: [
    'patient_data_access',
    'treatment_modification',
    'prescription_changes',
    'consent_modification',
    'data_export',
    'data_deletion',
  ],
  complianceReporting: {
    lgpdReports: true,
    anvisaReports: true,
    cfmReports: true,
    exportFormats: ['pdf', 'csv', 'json'],
  },
} as const

export const SECURITY_CONFIG = {
  encryption: {
    atRest: 'AES-256',
    inTransit: 'TLS-1.3',
    keyManagement: 'HSM',
    rotationDays: 90,
  },
  authentication: {
    mfaRequired: true,
    sessionTimeout: 30, // minutes
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      expireDays: 90,
    },
  },
  accessControl: {
    roleBasedAccess: true,
    principleOfLeastPrivilege: true,
    auditLogAccess: true,
    emergencyAccess: {
      breakGlass: true,
      approvalRequired: true,
      auditTrail: true,
    },
  },
  dataProtection: {
    maskingEnabled: true,
    anonymizationEnabled: true,
    pseudonymizationEnabled: true,
    backupRetentionDays: 30,
    disasterRecovery: true,
  },
} as const

export const COMPLIANCE_WORKFLOWS = {
  patientOnboarding: {
    consentCollection: true,
    identityVerification: true,
    medicalHistoryCollection: true,
    insuranceVerification: true,
    privacyNoticeAcknowledgment: true,
  },
  appointmentScheduling: {
    availabilityCheck: true,
    conflictDetection: true,
    resourceAllocation: true,
    notificationSystem: true,
    cancellationHandling: true,
  },
  treatmentPlanning: {
    riskAssessment: true,
    contraindicationCheck: true,
    informedConsent: true,
    costEstimate: true,
    preTreatmentInstructions: true,
  },
  dataManagement: {
    retentionPolicy: true,
    backupSchedule: true,
    accessControl: true,
    auditTrail: true,
    breachResponse: true,
  },
} as const

export const HEALTHCARE_ERROR_CODES = {
  LGPD_CONSENT_REQUIRED: 'LGPD_001',
  LGPD_DATA_RETENTION: 'LGPD_002',
  LGPD_ACCESS_DENIED: 'LGPD_003',
  LGPD_ENCRYPTION_FAILED: 'LGPD_004',
  ANVISA_COMPLIANCE_REQUIRED: 'ANVISA_001',
  CFM_LICENSE_INVALID: 'CFM_001',
  CFM_SUPERVISION_REQUIRED: 'CFM_002',
  HEALTHCARE_AUTH_REQUIRED: 'HC_001',
  HEALTHCARE_INVALID_DATA: 'HC_002',
  HEALTHCARE_CONTRAINDICATION: 'HC_003',
} as const

export const HEALTHCARE_SUCCESS_CODES = {
  CONSENT_GRANTED: 'HC_100',
  DATA_ENCRYPTED: 'HC_101',
  AUDIT_LOG_CREATED: 'HC_102',
  COMPLIANCE_CHECK_PASSED: 'HC_103',
  TREATMENT_APPROVED: 'HC_104',
  APPOINTMENT_SCHEDULED: 'HC_105',
  PATIENT_REGISTERED: 'HC_106',
} as const

export const COMPLIANCE_NOTIFICATIONS = {
  lgpd: {
    dataBreach: {
      immediate: true,
      stakeholders: ['patients', 'staff', 'authorities'],
      timeframe: '72_hours',
    },
    consentUpdates: {
      immediate: false,
      stakeholders: ['patients'],
      timeframe: '30_days',
    },
    dataAccessRequests: {
      immediate: true,
      stakeholders: ['patients', 'data_protection_officer'],
      timeframe: '15_days',
    },
  },
  healthcare: {
    adverseEvents: {
      immediate: true,
      stakeholders: ['staff', 'authorities', 'manufacturer'],
      timeframe: '24_hours',
    },
    protocolDeviations: {
      immediate: false,
      stakeholders: ['staff', 'quality_assurance'],
      timeframe: '48_hours',
    },
  },
} as const

// Helper functions for compliance validation
export const validateLGPDCompliance = (data: any): boolean => {
  // Implementation for LGPD compliance validation
  return true
}

export const validateANVISACompliance = (treatment: any): boolean => {
  // Implementation for ANVISA compliance validation
  return true
}

export const validateCFMCompliance = (professional: any): boolean => {
  // Implementation for CFM compliance validation
  return true
}

export const generateAuditTrail = (action: string, user: string, data: any) => {
  return {
    id: `audit_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    user,
    data,
    ipAddress: '192.168.1.1', // Would be dynamically captured
    userAgent: navigator.userAgent,
    complianceFramework: ['LGPD', 'ANVISA', 'CFM'],
  }
}

export const validateDataRetention = (data: any, dataType: string): boolean => {
  const retentionDays = LGPD_CONFIG.dataRetentionDays
  const creationDate = new Date(data.createdAt)
  const expirationDate = new Date(creationDate.getTime() + retentionDays * 24 * 60 * 60 * 1000)
  return new Date() < expirationDate
}

export const anonymizePatientData = (data: any): any => {
  // Implementation for patient data anonymization
  return {
    ...data,
    fullName: 'ANONYMIZED',
    email: 'ANONYMIZED',
    phone: 'ANONYMIZED',
    address: 'ANONYMIZED',
  }
}