// Healthcare compliance configuration for production deployment
export const healthcareComplianceConfig = {
  // LGPD (Lei Geral de Proteção de Dados) - Brazil
  lgpd: {
    enabled: true,
    region: "BR",
    dataResidency: {
      enabled: true,
      region: "gru1", // São Paulo
      backupRegion: "iad1", // Virginia (backup)
    },
    consentManagement: {
      required: true,
      cookiePolicy: true,
      privacyPolicy: true,
      termsOfService: true,
      dataProcessingAgreement: true,
    },
    dataSubjectRights: {
      access: true,
      rectification: true,
      deletion: true,
      portability: true,
      objection: true,
      automatedDecisionMaking: true,
    },
    dataProtectionOfficer: {
      enabled: true,
      contactRequired: true,
      reportingEnabled: true,
    },
    breachNotification: {
      enabled: true,
      timeframe: "24h", // 24 hours for healthcare data
      authorityNotification: true,
      subjectNotification: true,
    },
    dataRetention: {
      medicalRecords: 9125, // 25 years
      financialRecords: 3650, // 10 years
      communicationRecords: 1095, // 3 years
      auditLogs: 3650, // 10 years
    },
    internationalTransfers: {
      enabled: false, // Keep data in Brazil for compliance
      mechanisms: ["standard_contractual_clauses"],
    },
  },

  // ANVISA (Agência Nacional de Vigilância Sanitária)
  anvisa: {
    enabled: true,
    medicalDevice: {
      classification: "Class IIa", // Software as medical device
      registration: {
        required: true,
        number: "ANVISA_REG_NUMBER",
        validityPeriod: "10y",
      },
      riskManagement: {
        enabled: true,
        iso14971: true,
        regularReviews: true,
        incidentReporting: true,
      },
    },
    qualityManagement: {
      iso13485: true,
      goodPractices: true,
      documentControl: true,
      training: true,
      validation: true,
    },
    vigilance: {
      postMarket: true,
      adverseEvents: true,
      fieldSafetyCorrectiveActions: true,
      customerComplaints: true,
    },
    labeling: {
      instructionsForUse: true,
      warnings: true,
      contraindications: true,
      specifications: true,
    },
  },

  // CFM (Conselho Federal de Medicina)
  cfm: {
    enabled: true,
    telemedicine: {
      enabled: true,
      resolution2266: true, // Telemedicine guidelines
      patientConsent: true,
      documentation: true,
      security: true,
      confidentiality: true,
    },
    professionalStandards: {
      ethics: true,
      confidentiality: true,
      documentation: true,
      continuingEducation: true,
    },
    patientRights: {
      informedConsent: true,
      privacy: true,
      accessToRecords: true,
      secondOpinion: true,
    },
    prescription: {
      electronicPrescribing: true,
      digitalSignature: true,
      authentication: true,
      auditTrail: true,
    },
  },

  // Data Security
  security: {
    encryption: {
      atRest: {
        enabled: true,
        algorithm: "AES-256",
        keyManagement: "hsm",
        rotation: "90d",
      },
      inTransit: {
        enabled: true,
        tlsVersion: "1.3",
        certificateValidation: true,
        hsts: true,
      },
      endToEnd: {
        enabled: true,
        algorithm: "AES-256-GCM",
        keyExchange: "ECDH",
      },
    },
    accessControl: {
      roleBasedAccess: true,
      principleOfLeastPrivilege: true,
      multiFactorAuthentication: true,
      sessionManagement: true,
      passwordPolicy: {
        minLength: 12,
        complexity: true,
        rotation: "90d",
        history: 12,
      },
    },
    audit: {
      enabled: true,
      comprehensive: true,
      immutable: true,
      retention: "10y",
      realTimeMonitoring: true,
      alerting: true,
    },
    backup: {
      enabled: true,
      frequency: "daily",
      encryption: true,
      geoRedundancy: true,
      retention: "90d",
      testing: "monthly",
    },
  },

  // Privacy by Design
  privacyByDesign: {
    dataMinimization: true,
    purposeLimitation: true,
    accuracy: true,
    storageLimitation: true,
    integrity: true,
    confidentiality: true,
    accountability: true,
    transparency: true,
  },

  // Risk Assessment
  riskAssessment: {
    methodology: "iso27005",
    frequency: "quarterly",
    documentation: true,
    treatmentPlan: true,
    residualRisk: true,
    continuousMonitoring: true,
  },

  // Business Continuity
  businessContinuity: {
    disasterRecovery: {
      rto: "1h", // Recovery Time Objective
      rpo: "15m", // Recovery Point Objective
      testing: "quarterly",
    },
    incidentResponse: {
      plan: true,
      team: true,
      training: true,
      simulation: "semiannually",
    },
    backup: {
      onsite: true,
      offsite: true,
      cloud: true,
      encryption: true,
    },
  },

  // Documentation and Records
  documentation: {
    sops: true,
    policies: true,
    procedures: true,
    training: true,
    versionControl: true,
    retention: "10y",
  },

  // Training and Awareness
  training: {
    mandatory: true,
    frequency: "annually",
    privacy: true,
    security: true,
    compliance: true,
    documentation: true,
    assessment: true,
  },

  // Vendor Management
  vendorManagement: {
    dueDiligence: true,
    contracts: true,
    audits: true,
    monitoring: true,
    compliance: true,
  },

  // Monitoring and Compliance
  monitoring: {
    automated: true,
    continuous: true,
    alerting: true,
    reporting: true,
    dashboards: true,
  },
};

export default healthcareComplianceConfig;
