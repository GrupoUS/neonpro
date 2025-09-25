/**
 * Enhanced Types for Winston-based Healthcare Structured Logging
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * Compliance: LGPD, ANVISA SaMD, Healthcare Standards
 */

import { z } from 'zod'

// Enhanced log levels mapping to Winston levels
export const WinstonLogLevelSchema = z.enum([
  'error', // Winston error level
  'warn', // Winston warn level
  'info', // Winston info level
  'http', // Winston http level
  'verbose', // Winston verbose level
  'debug', // Winston debug level
  'silly', // Winston silly level
])

export type WinstonLogLevel = z.infer<typeof WinstonLogLevelSchema>

// Healthcare-specific severity levels mapped to Winston levels
export const HealthcareSeveritySchema = z.enum([
  'debug', // Development debugging (winston: debug)
  'info', // General information (winston: info)
  'notice', // Normal but significant events (winston: verbose)
  'warn', // Warning conditions (winston: warn)
  'error', // Error conditions (winston: error)
  'critical', // Critical conditions requiring immediate attention (winston: error)
  'alert', // Action must be taken immediately (patient safety) (winston: error)
  'emergency', // System is unusable (life-critical scenarios) (winston: error)
])

export type HealthcareSeverity = z.infer<typeof HealthcareSeveritySchema>

// Brazilian PII identifier patterns
export const BrazilianIdentifierSchema = z.object({
  type: z.enum(['cpf', 'cnpj', 'rg', 'sus', 'crm', 'coren', 'cro', 'cfo']),
  value: z.string(),
  masked: z.string(),
  isValid: z.boolean(),
})

export type BrazilianIdentifier = z.infer<typeof BrazilianIdentifierSchema>

// Enhanced healthcare context with Brazilian compliance
export const BrazilianHealthcareContextSchema = z.object({
  // Workflow identification
  workflowType: z
    .enum([
      'patient_registration',
      'appointment_scheduling',
      'medical_consultation',
      'diagnosis_procedure',
      'treatment_administration',
      'medication_management',
      'laboratory_testing',
      'diagnostic_imaging',
      'emergency_response',
      'patient_discharge',
      'administrative_task',
      'system_maintenance',
      'billing_processing',
      'insurance_verification',
      'consent_management',
    ])
    .optional(),

  workflowStage: z.string().optional(),

  // Patient context (LGPD compliant)
  patientContext: z
    .object({
      anonymizedPatientId: z.string().optional(),
      ageGroup: z.enum(['pediatric', 'adult', 'geriatric']).optional(),
      criticalityLevel: z
        .enum(['routine', 'urgent', 'critical', 'emergency'])
        .optional(),
      hasAllergies: z.boolean().optional(),
      isEmergencyCase: z.boolean().optional(),
      requiresConsent: z.boolean().optional(),
      consentStatus: z
        .enum(['granted', 'denied', 'pending', 'revoked'])
        .optional(),
    })
    .optional(),

  // Professional context
  professionalContext: z
    .object({
      anonymizedProfessionalId: z.string().optional(),
      _role: z.string().optional(),
      specialization: z.string().optional(),
      department: z.string().optional(),
      councilNumber: z.string().optional(), // CRM, COREN, etc.
    })
    .optional(),

  // Clinical context
  clinicalContext: z
    .object({
      facilityId: z.string().optional(),
      serviceType: z.string().optional(),
      protocolVersion: z.string().optional(),
      complianceFrameworks: z.array(z.string()).optional(),
      requiresAudit: z.boolean().optional(),
    })
    .optional(),

  // Brazilian-specific compliance
  brazilianCompliance: z
    .object({
      lgpdLegalBasis: z
        .enum([
          'consent',
          'contract',
          'legal_obligation',
          'vital_interests',
          'public_interest',
          'legitimate_interests',
          'healthcare_provision',
          'public_health',
        ])
        .optional(),
      dataRetentionDays: z.number().optional(),
      requiresAnonymization: z.boolean().optional(),
      hasExplicitConsent: z.boolean().optional(),
    })
    .optional(),
})

export type BrazilianHealthcareContext = z.infer<
  typeof BrazilianHealthcareContextSchema
>

// Enhanced LGPD compliance metadata
export const EnhancedLGPDComplianceSchema = z.object({
  dataClassification: z.enum([
    'public',
    'internal',
    'confidential',
    'restricted',
    'critical',
  ]),
  containsPII: z.boolean(),
  containsPHI: z.boolean(),
  legalBasis: z.enum([
    'consent',
    'contract',
    'legal_obligation',
    'vital_interests',
    'public_interest',
    'legitimate_interests',
    'healthcare_provision',
    'public_health',
  ]),
  retentionPeriod: z.number(),
  requiresConsent: z.boolean(),
  anonymized: z.boolean(),
  auditRequired: z.boolean(),
  brazilianIdentifiers: z.array(BrazilianIdentifierSchema).optional(),
  dataMinimizationApplied: z.boolean(),
  purposeLimitation: z.string().optional(),
})

export type EnhancedLGPDCompliance = z.infer<
  typeof EnhancedLGPDComplianceSchema
>

// Winston-compatible log entry
export const WinstonLogEntrySchema = z.object({
  // Winston standard fields
  level: WinstonLogLevelSchema,
  message: z.string(),
  timestamp: z.string().optional(),

  // Healthcare-specific fields
  severity: HealthcareSeveritySchema.optional(),
  healthcareContext: BrazilianHealthcareContextSchema.optional(),

  // Technical context
  _service: z.string(),
  environment: z.string(),
  requestId: z.string().optional(),
  correlationId: z.string().optional(),
  sessionId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),

  // Performance metrics
  duration: z.number().optional(),
  memoryUsage: z.number().optional(),
  cpuUsage: z.number().optional(),

  // User context (anonymized)
  anonymizedUserId: z.string().optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']).optional(),

  // Structured data
  metadata: z.record(z.unknown()).optional(),
  error: z
    .object({
      name: z.string(),
      message: z.string(),
      stack: z.string().optional(),
      code: z.string().optional(),
    })
    .optional(),

  // Compliance
  lgpdCompliance: EnhancedLGPDComplianceSchema,

  // Additional fields
  tags: z.array(z.string()).optional(),
  source: z.string().optional(),
})

export type WinstonLogEntry = z.infer<typeof WinstonLogEntrySchema>

// Winston transport configuration
export const WinstonTransportConfigSchema = z.object({
  console: z
    .object({
      enabled: z.boolean().default(true),
      level: WinstonLogLevelSchema.default('info'),
      format: z.enum(['json', 'simple', 'colorized']).default('json'),
    })
    .optional(),

  file: z
    .object({
      enabled: z.boolean().default(false),
      level: WinstonLogLevelSchema.default('info'),
      filename: z.string(),
      maxSize: z.string().default('20m'),
      maxFiles: z.number().default(5),
      format: z.enum(['json', 'simple']).default('json'),
    })
    .optional(),

  remote: z
    .object({
      enabled: z.boolean().default(false),
      level: WinstonLogLevelSchema.default('info'),
      endpoint: z.string().optional(),
      authToken: z.string().optional(),
      timeout: z.number().default(5000),
    })
    .optional(),

  dailyRotate: z
    .object({
      enabled: z.boolean().default(false),
      level: WinstonLogLevelSchema.default('info'),
      filename: z.string(),
      datePattern: z.string().default('YYYY-MM-DD'),
      zippedArchive: z.boolean().default(true),
      maxSize: z.string().default('20m'),
      maxFiles: z.string().default('14d'),
    })
    .optional(),
})

export type WinstonTransportConfig = z.infer<
  typeof WinstonTransportConfigSchema
>

// Main configuration schema
export const EnhancedStructuredLoggingConfigSchema = z.object({
  _service: z.string(),
  environment: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  version: z.string().optional(),

  // Log levels
  level: WinstonLogLevelSchema.default('info'),
  severityLevel: HealthcareSeveritySchema.default('info'),

  // Transports
  transports: WinstonTransportConfigSchema.default({
    console: { enabled: true },
  }),

  // Performance
  performance: z
    .object({
      silent: z.boolean().default(false),
      exitOnError: z.boolean().default(false),
      handleExceptions: z.boolean().default(true),
      handleRejections: z.boolean().default(true),
    })
    .default({}),

  // Healthcare compliance
  healthcareCompliance: z
    .object({
      enablePIIRedaction: z.boolean().default(true),
      enableAuditLogging: z.boolean().default(true),
      criticalEventAlerts: z.boolean().default(true),
      patientSafetyLogging: z.boolean().default(true),
      enableBrazilianCompliance: z.boolean().default(true),
    })
    .default({}),

  // LGPD settings
  lgpdCompliance: z
    .object({
      dataRetentionDays: z.number().default(365),
      requireExplicitConsent: z.boolean().default(false),
      anonymizeByDefault: z.boolean().default(true),
      enableDataMinimization: z.boolean().default(true),
      enablePurposeLimitation: z.boolean().default(true),
    })
    .default({}),

  // Formatting
  format: z
    .object({
      colorize: z.boolean().default(false),
      prettyPrint: z.boolean().default(false),
      timestamp: z.boolean().default(true),
      showLevel: z.boolean().default(true),
    })
    .default({}),
})

export type EnhancedStructuredLoggingConfig = z.infer<
  typeof EnhancedStructuredLoggingConfigSchema
>
