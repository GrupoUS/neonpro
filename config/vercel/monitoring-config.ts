// Monitoring and observability configuration for healthcare platform
export const monitoringConfig = {
  // Sentry Error Tracking Configuration
  sentry: {
    dsn: process.env.SENTRY_DSN || '',
    environment: process.env.NODE_ENV || 'production',
    release: `neonpro@${process.env.npm_package_version || '1.0.0'}`,

    // Sample rates
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
    ),
    replaysSessionSampleRate: parseFloat(
      process.env.SENTRY_REPLAYS_SESSION_SAMPLE_RATE || '0.1',
    ),
    replaysOnErrorSampleRate: parseFloat(
      process.env.SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || '1.0',
    ),

    // Performance monitoring
    profilesSampleRate: parseFloat(
      process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1',
    ),

    // Healthcare specific monitoring
    healthcare: {
      // Monitor sensitive operations
      sensitiveOperations: {
        patientDataAccess: true,
        medicalRecordUpdates: true,
        prescriptionChanges: true,
        appointmentScheduling: true,
        billingOperations: true,
      },

      // Compliance monitoring
      compliance: {
        lgpdViolations: true,
        dataBreaches: true,
        unauthorizedAccess: true,
        consentViolations: true,
      },
    },

    // Custom integrations
    integrations: [
      new Sentry.Integrations.Breadcrumbs({
        console: false,
        dom: true,
        fetch: true,
        history: true,
        sentry: true,
        xhr: true,
      }),
      new Sentry.Integrations.GlobalHandlers({
        onunhandledrejection: true,
        onerror: true,
      }),
      new Sentry.Integrations.HttpContext(),
      new Sentry.Integrations.LinkedErrors(),
      new Sentry.Integrations.RequestData(),
      new Sentry.Integrations.TryCatch(),
    ],

    // Before send callback for sensitive data filtering
    beforeSend: (event) => {
      if (event.request && event.request.headers) {
        // Filter sensitive headers
        const sensitiveHeaders = [
          'authorization',
          'cookie',
          'set-cookie',
          'proxy-authorization',
        ]
        event.request.headers = Object.keys(event.request.headers)
          .filter((key) => !sensitiveHeaders.includes(key.toLowerCase()))
          .reduce((obj, key) => {
            obj[key] = event.request.headers[key]
            return obj
          }, {})
      }

      // Filter sensitive data in request body
      if (event.request && event.request.data) {
        try {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data

          // Mask sensitive fields
          const sensitiveFields = [
            'password',
            'credit_card',
            'cpf',
            'rg',
            'medical_record',
            'patient_id',
          ]
          const maskData = (obj: any) => {
            Object.keys(obj).forEach((key) => {
              if (
                sensitiveFields.some((field) => key.toLowerCase().includes(field))
              ) {
                obj[key] = '***MASKED***'
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                maskData(obj[key])
              }
            })
          }

          maskData(data)
          event.request.data = JSON.stringify(data)
        } catch (_e) {
          void _e
          // If parsing fails, leave as is
        }
      }

      return event
    },
  },

  // Application Performance Monitoring
  apm: {
    enabled: process.env.APM_ENABLED === 'true',
    serviceName: 'neonpro-healthcare',
    serviceVersion: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'production',

    // Transaction sampling
    transactionSampleRate: parseFloat(process.env.APM_SAMPLE_RATE || '1.0'),

    // Custom metrics
    customMetrics: {
      // Healthcare specific metrics
      healthcare: {
        patientRegistrations: 'counter',
        appointmentBookings: 'counter',
        prescriptionRequests: 'counter',
        medicalRecordAccesses: 'counter',
        billingTransactions: 'counter',

        // Performance metrics
        apiResponseTimes: 'histogram',
        databaseQueryTimes: 'histogram',
        authenticationLatency: 'histogram',

        // Error metrics
        validationErrors: 'counter',
        authenticationFailures: 'counter',
        authorizationFailures: 'counter',
        systemErrors: 'counter',
      },
    },

    // Distributed tracing
    distributedTracing: {
      enabled: true,
      includePayloads: false, // Don't include payloads for PHI data
    },
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',

    // Structured logging
    structured: true,

    // Log outputs
    outputs: [
      {
        type: 'console',
        level: 'debug',
      },
      {
        type: 'file',
        level: 'info',
        filename: process.env.LOG_FILE_PATH || '/var/log/neonpro/app.log',
        maxSize: '20MB',
        maxFiles: 10,
      },
    ],

    // Healthcare specific logging
    healthcare: {
      // Audit logging for compliance
      audit: {
        enabled: true,
        level: 'info',
        separateFile: true,
        filename: '/var/log/neonpro/audit.log',
        format: 'json',
        fields: {
          timestamp: true,
          userId: true,
          action: true,
          resource: true,
          result: true,
          ipAddress: true,
          userAgent: true,
          sessionId: true,
        },
      },

      // Security event logging
      security: {
        enabled: true,
        level: 'warn',
        separateFile: true,
        filename: '/var/log/neonpro/security.log',
        events: [
          'authentication_failure',
          'authorization_failure',
          'suspicious_activity',
          'data_access_violation',
          'brute_force_attempt',
          'rate_limit_exceeded',
        ],
      },

      // System event logging
      system: {
        enabled: true,
        level: 'info',
        separateFile: true,
        filename: '/var/log/neonpro/system.log',
        events: [
          'system_startup',
          'system_shutdown',
          'deployment',
          'configuration_change',
          'backup_operation',
          'maintenance_event',
        ],
      },
    },

    // Log filtering for sensitive data
    filters: {
      // Fields to mask in logs
      maskFields: [
        'password',
        'credit_card',
        'cvv',
        'expiry',
        'ssn',
        'cpf',
        'rg',
        'medical_record',
        'patient_id',
        'diagnosis',
        'treatment',
        'medication',
        'insurance_number',
      ],

      // Request bodies to filter
      filterRequestBodies: true,

      // Response bodies to filter
      filterResponseBodies: true,
    },
  },

  // Real User Monitoring (RUM)
  rum: {
    enabled: true,
    sampleRate: 1.0, // 100% for healthcare compliance

    // Core Web Vitals
    webVitals: {
      enabled: true,
      metrics: [
        'CLS', // Cumulative Layout Shift
        'FID', // First Input Delay
        'FCP', // First Contentful Paint
        'LCP', // Largest Contentful Paint
        'TTFB', // Time to First Byte
        'INP', // Interaction to Next Paint
      ],
    },

    // Custom metrics
    customMetrics: {
      // Healthcare specific metrics
      healthcare: {
        pageLoadTime: true,
        apiResponseTime: true,
        formSubmissionTime: true,
        authenticationTime: true,
        searchResponseTime: true,

        // User experience metrics
        formErrors: true,
        navigationErrors: true,
        resourceLoadErrors: true,
        javascriptErrors: true,
      },
    },

    // Session tracking
    sessions: {
      enabled: true,
      trackPageViews: true,
      trackEvents: true,
      trackUserInteractions: true,

      // Healthcare specific events
      healthcareEvents: [
        'patient_registration',
        'appointment_booking',
        'prescription_request',
        'medical_record_access',
        'billing_payment',
        'telemedicine_session',
        'lab_result_view',
        'medication_reminder',
      ],
    },
  },

  // Synthetic Monitoring
  synthetic: {
    enabled: true,

    // Healthcare critical flows
    criticalFlows: [
      {
        name: 'patient_registration',
        frequency: '5m',
        locations: ['sa-east-1', 'us-east-1'],
        steps: [
          { action: 'navigate', url: '/register' },
          { action: 'fill_form', fields: ['name', 'email', 'phone'] },
          { action: 'submit_form' },
          { action: 'verify_success' },
        ],
      },
      {
        name: 'appointment_booking',
        frequency: '5m',
        locations: ['sa-east-1', 'us-east-1'],
        steps: [
          { action: 'navigate', url: '/appointments' },
          { action: 'select_service' },
          { action: 'select_datetime' },
          { action: 'confirm_booking' },
          { action: 'verify_success' },
        ],
      },
      {
        name: 'patient_portal_access',
        frequency: '10m',
        locations: ['sa-east-1', 'us-east-1'],
        steps: [
          { action: 'navigate', url: '/login' },
          { action: 'login', credentials: 'test_patient' },
          { action: 'verify_dashboard' },
          { action: 'view_medical_records' },
          { action: 'logout' },
        ],
      },
    ],

    // Performance thresholds
    thresholds: {
      responseTime: {
        warning: 2000, // 2 seconds
        critical: 5000, // 5 seconds
      },
      availability: {
        warning: 99.9, // 99.9%
        critical: 99.0, // 99.0%
      },
      errorRate: {
        warning: 1.0, // 1%
        critical: 5.0, // 5%
      },
    },
  },

  // Alerting Configuration
  alerting: {
    enabled: true,

    // Alert channels
    channels: [
      {
        type: 'email',
        recipients: [
          'devops@neonpro.healthcare',
          'security@neonpro.healthcare',
        ],
        severity: ['critical', 'warning'],
      },
      {
        type: 'slack',
        webhook: process.env.SLACK_WEBHOOK_URL,
        channel: '#alerts',
        severity: ['critical'],
      },
      {
        type: 'pagerduty',
        serviceKey: process.env.PAGERDUTY_SERVICE_KEY,
        severity: ['critical'],
      },
    ],

    // Alert rules
    rules: [
      {
        name: 'High Error Rate',
        condition: 'error_rate > 5%',
        duration: '5m',
        severity: 'critical',
        channels: ['email', 'slack', 'pagerduty'],
      },
      {
        name: 'Slow Response Time',
        condition: 'response_time_p95 > 3s',
        duration: '10m',
        severity: 'warning',
        channels: ['email', 'slack'],
      },
      {
        name: 'High Memory Usage',
        condition: 'memory_usage > 80%',
        duration: '5m',
        severity: 'warning',
        channels: ['email'],
      },
      {
        name: 'Database Connection Issues',
        condition: 'db_connection_errors > 10',
        duration: '1m',
        severity: 'critical',
        channels: ['email', 'slack', 'pagerduty'],
      },
      {
        name: 'Security Event',
        condition: 'security_events > 0',
        duration: '0m',
        severity: 'critical',
        channels: ['email', 'slack', 'pagerduty'],
      },
    ],
  },

  // Compliance Monitoring
  compliance: {
    enabled: true,

    // LGPD compliance monitoring
    lgpd: {
      dataAccessLogging: true,
      consentTracking: true,
      dataRetentionMonitoring: true,
      breachDetection: true,
      dataPortabilityTracking: true,
    },

    // ANVISA compliance monitoring
    anvisa: {
      medicalDeviceLogging: true,
      qualityManagement: true,
      riskManagement: true,
      vigilanceMonitoring: true,
    },

    // CFM compliance monitoring
    cfm: {
      telemedicineCompliance: true,
      prescriptionMonitoring: true,
      professionalStandards: true,
      documentationTracking: true,
    },
  },
}

export default monitoringConfig
