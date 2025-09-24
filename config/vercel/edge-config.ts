// Edge configuration for healthcare platform
export const edgeConfig = {
  // Healthcare compliance settings
  healthcare: {
    region: 'BR', // Brazil for LGPD compliance
    dataResidency: 'gru1', // São Paulo region
    encryptionRequired: true,
    auditLogging: true,
    retentionPeriod: 25, // years for medical records
  },

  // Security settings
  security: {
    maxSessionDuration: 3600, // 1 hour
    maxLoginAttempts: 5,
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    },
    mfaRequired: true,
    sessionTimeout: 1800, // 30 minutes
  },

  // Rate limiting
  rateLimits: {
    api: {
      requests: 100,
      window: '15m',
    },
    auth: {
      requests: 5,
      window: '15m',
    },
    sensitive: {
      requests: 10,
      window: '1h',
    },
  },

  // Cache settings
  cache: {
    staticAssets: '31536000s', // 1 year
    apiData: '300s', // 5 minutes
    patientData: '0s', // no cache
    medicalData: '0s', // no cache
  },

  // Monitoring
  monitoring: {
    sampleRate: 1.0, // 100% for healthcare
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  },

  // Compliance features
  compliance: {
    lgpd: {
      consentRequired: true,
      dataPortability: true,
      rightToForget: true,
      breachNotification: true,
    },
    anvisa: {
      medicalDeviceCompliance: true,
      qualityManagement: true,
      riskManagement: true,
    },
    cfm: {
      professionalStandards: true,
      ethicalGuidelines: true,
      continuingEducation: true,
    },
  },

  // Backup and disaster recovery
  backup: {
    frequency: 'daily',
    retention: '90d',
    encryption: true,
    geoRedundancy: true,
  },

  // Performance optimization
  performance: {
    compression: true,
    brotli: true,
    imageOptimization: true,
    fontOptimization: true,
    codeSplitting: true,
    lazyLoading: true,
  },
};

export default edgeConfig;
