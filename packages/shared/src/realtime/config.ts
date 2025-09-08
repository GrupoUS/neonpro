/**
 * NeonPro Healthcare Real-time Configuration
 * Configurações centralizadas para o sistema de real-time
 * Otimizado para ambiente healthcare brasileiro com LGPD/ANVISA compliance
 */

export interface HealthcareRealtimeConfig {
  // Connection settings
  connection: {
    maxRetries: number
    retryDelay: number
    heartbeatInterval: number
    healthThreshold: number
    reconnectOnFocus: boolean
  }

  // Healthcare specific settings
  healthcare: {
    emergencyTimeout: number
    criticalEventRetention: number
    auditLogRetention: number
    complianceScoreThreshold: number
  }

  // Notification settings
  notifications: {
    enableAudio: boolean
    enableToast: boolean
    emergencyVolume: number
    standardVolume: number
    toastDuration: number
    emergencyDuration: number
  }

  // Performance settings
  performance: {
    cacheSize: number
    batchSize: number
    throttleMs: number
    maxConcurrentSubscriptions: number
  }

  // Compliance settings
  compliance: {
    enableAuditLog: boolean
    lgpdRetention: number // days
    anvisaRetention: number // days
    criticalAlertThreshold: number
    autoReportGeneration: boolean
  }
}

/**
 * Default configuration for NeonPro Healthcare
 */
export const HEALTHCARE_REALTIME_CONFIG: HealthcareRealtimeConfig = {
  connection: {
    maxRetries: 5,
    retryDelay: 1000,
    heartbeatInterval: 30_000,
    healthThreshold: 80, // Healthcare requires high reliability
    reconnectOnFocus: true,
  },

  healthcare: {
    emergencyTimeout: 5000, // 5 seconds max for emergency events
    criticalEventRetention: 5000, // Keep last 5000 critical events
    auditLogRetention: 10_000, // Keep last 10000 audit entries
    complianceScoreThreshold: 70, // Alert if score drops below 70%
  },

  notifications: {
    enableAudio: true,
    enableToast: true,
    emergencyVolume: 1,
    standardVolume: 0.7,
    toastDuration: 5000,
    emergencyDuration: 0, // Emergency notifications stay until dismissed
  },

  performance: {
    cacheSize: 1000,
    batchSize: 50,
    throttleMs: 100,
    maxConcurrentSubscriptions: 10,
  },

  compliance: {
    enableAuditLog: true,
    lgpdRetention: 1825, // 5 years as per LGPD requirements
    anvisaRetention: 3650, // 10 years as per ANVISA requirements
    criticalAlertThreshold: 3, // Alert after 3 critical events
    autoReportGeneration: true,
  },
}

/**
 * Environment-specific configurations
 */
export const getEnvironmentConfig = (): Partial<HealthcareRealtimeConfig> => {
  const env = process.env.NODE_ENV || 'development'

  const configurations: Record<string, Partial<HealthcareRealtimeConfig>> = {
    development: {
      connection: {
        maxRetries: 3,
        retryDelay: 500,
        heartbeatInterval: 30_000,
        healthThreshold: 60, // More lenient in development
        reconnectOnFocus: true,
      },
      notifications: {
        enableAudio: false, // Disable audio in development
        enableToast: true,
        emergencyVolume: 1,
        standardVolume: 0.7,
        toastDuration: 3000,
        emergencyDuration: 10_000,
      },
      performance: {
        cacheSize: 500,
        batchSize: 10,
        throttleMs: 50,
        maxConcurrentSubscriptions: 5,
      },
    },

    test: {
      connection: {
        maxRetries: 1,
        retryDelay: 100,
        heartbeatInterval: 5000,
        healthThreshold: 50,
        reconnectOnFocus: false,
      },
      notifications: {
        enableAudio: false,
        enableToast: false,
        emergencyVolume: 0,
        standardVolume: 0,
        toastDuration: 1000,
        emergencyDuration: 1000,
      },
      compliance: {
        enableAuditLog: false,
        lgpdRetention: 30,
        anvisaRetention: 365,
        criticalAlertThreshold: 10,
        autoReportGeneration: false,
      },
    },

    production: {
      connection: {
        maxRetries: 10,
        retryDelay: 2000,
        heartbeatInterval: 15_000,
        healthThreshold: 90, // Strict requirements in production
        reconnectOnFocus: true,
      },
      healthcare: {
        emergencyTimeout: 3000, // Even faster in production
        criticalEventRetention: 10_000,
        auditLogRetention: 2555, // 7 years for compliance
        complianceScoreThreshold: 95,
      },
      performance: {
        cacheSize: 2000,
        batchSize: 50,
        throttleMs: 10,
        maxConcurrentSubscriptions: 20,
      },
    },
  }

  return configurations[env] || {}
}

/**
 * Get merged configuration for current environment
 */
export const getRealtimeConfig = (): HealthcareRealtimeConfig => {
  const baseConfig = HEALTHCARE_REALTIME_CONFIG
  const envConfig = getEnvironmentConfig()

  // Deep merge configurations
  return {
    ...baseConfig,
    connection: { ...baseConfig.connection, ...envConfig.connection, },
    healthcare: { ...baseConfig.healthcare, ...envConfig.healthcare, },
    notifications: { ...baseConfig.notifications, ...envConfig.notifications, },
    performance: { ...baseConfig.performance, ...envConfig.performance, },
    compliance: { ...baseConfig.compliance, ...envConfig.compliance, },
  }
}

/**
 * Healthcare event priority mapping
 */
export const HEALTHCARE_PRIORITIES = {
  EMERGENCY: {
    score: 100,
    audioFile: '/sounds/emergency-alert.mp3',
    color: '#dc2626',
    timeout: 0, // Never auto-dismiss
    vibrate: [200, 100, 200, 100, 200,],
  },
  HIGH: {
    score: 75,
    audioFile: '/sounds/urgent-notification.mp3',
    color: '#ea580c',
    timeout: 10_000,
    vibrate: [100, 50, 100,],
  },
  MEDIUM: {
    score: 50,
    audioFile: '/sounds/standard-notification.mp3',
    color: '#2563eb',
    timeout: 5000,
    vibrate: [100,],
  },
  LOW: {
    score: 25,
    audioFile: '/sounds/soft-notification.mp3',
    color: '#059669',
    timeout: 3000,
    vibrate: [50,],
  },
} as const

/**
 * LGPD/ANVISA compliance event mappings
 */
export const COMPLIANCE_EVENT_TYPES = {
  // LGPD Events
  LGPD_CONSENT_GRANTED: { severity: 'LOW', retention: 1825, reportable: false, },
  LGPD_CONSENT_REVOKED: { severity: 'HIGH', retention: 1825, reportable: true, },
  LGPD_DATA_ACCESS: { severity: 'LOW', retention: 1825, reportable: false, },
  LGPD_DATA_DELETION: { severity: 'MEDIUM', retention: 1825, reportable: true, },
  LGPD_DATA_PORTABILITY: {
    severity: 'MEDIUM',
    retention: 1825,
    reportable: true,
  },

  // ANVISA Events
  ANVISA_AUDIT_START: { severity: 'MEDIUM', retention: 3650, reportable: true, },
  ANVISA_COMPLIANCE_CHECK: {
    severity: 'LOW',
    retention: 3650,
    reportable: false,
  },
  ANVISA_VIOLATION: { severity: 'CRITICAL', retention: 3650, reportable: true, },

  // Security Events
  DATA_BREACH_DETECTED: {
    severity: 'CRITICAL',
    retention: 3650,
    reportable: true,
  },
  UNAUTHORIZED_ACCESS: { severity: 'HIGH', retention: 3650, reportable: true, },
  SUSPICIOUS_ACTIVITY: {
    severity: 'MEDIUM',
    retention: 1825,
    reportable: true,
  },
} as const
