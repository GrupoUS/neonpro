// Healthcare-specific TelemetryEvent data model with LGPD compliance

export enum TelemetryEventType {
  // System events
  SYSTEM_STARTUP = 'system.startup',
  SYSTEM_SHUTDOWN = 'system.shutdown',
  SYSTEM_HEALTH_CHECK = 'system.health_check',

  // Performance events
  PERFORMANCE_METRIC = 'performance.metric',
  WEB_VITAL = 'performance.web_vital',
  API_PERFORMANCE = 'performance.api',
  DATABASE_QUERY = 'performance.database',

  // Healthcare-specific events
  PATIENT_ACCESS = 'healthcare.patient_access',
  MEDICAL_RECORD_ACCESS = 'healthcare.medical_record_access',
  APPOINTMENT_SCHEDULING = 'healthcare.appointment_scheduling',
  PRESCRIPTION_ACCESS = 'healthcare.prescription_access',
  EMERGENCY_ACCESS = 'healthcare.emergency_access',

  // Security events
  AUTHENTICATION_SUCCESS = 'security.auth_success',
  AUTHENTICATION_FAILURE = 'security.auth_failure',
  AUTHORIZATION_CHECK = 'security.authorization',
  RATE_LIMIT_VIOLATION = 'security.rate_limit',
  SRI_VIOLATION = 'security.sri_violation',

  // Error events
  APPLICATION_ERROR = 'error.application',
  API_ERROR = 'error.api',
  DATABASE_ERROR = 'error.database',
  NETWORK_ERROR = 'error.network',

  // User events (anonymized per LGPD)
  USER_ACTION = 'user.action',
  USER_NAVIGATION = 'user.navigation',
  USER_INTERACTION = 'user.interaction',

  // AI/ML events
  AI_REQUEST = 'ai.request',
  AI_RESPONSE = 'ai.response',
  AI_CACHE_HIT = 'ai.cache_hit',
  AI_CACHE_MISS = 'ai.cache_miss',
  AI_COST_TRACKING = 'ai.cost_tracking',

  // Compliance events
  LGPD_CONSENT_UPDATE = 'compliance.lgpd.consent_update',
  LGPD_DATA_EXPORT = 'compliance.lgpd.data_export',
  LGPD_DATA_DELETION = 'compliance.lgpd.data_deletion',
  AUDIT_TRAIL_ENTRY = 'compliance.audit_entry',
}

export enum TelemetrySeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export enum HealthcareDataSensitivity {
  NONE = 'none',
  LOW = 'low', // Non-sensitive operational data
  MEDIUM = 'medium', // Healthcare professional data
  HIGH = 'high', // Patient-identifiable data
  CRITICAL = 'critical', // Emergency/sensitive patient data
}

// Healthcare-specific telemetry event interface
export interface TelemetryEvent {
  // Core event identification
  id: string
  eventType: TelemetryEventType
  timestamp: Date
  severity: TelemetrySeverity

  // Source information
  _service: string
  version: string
  environment: 'development' | 'staging' | 'production'
  hostname?: string

  // User context (LGPD-compliant)
  _userId?: string // Hashed/anonymized ID
  sessionId?: string
  userRole?: 'patient' | 'professional' | 'admin' | 'system'
  department?: string

  // Healthcare context
  healthcareContext?: {
    patientIdHash?: string // Hashed patient ID
    appointmentId?: string // Non-identifiable appointment reference
    medicalRecordType?: string // Type of record accessed (not content)
    isEmergencyAccess?: boolean
    consentStatus?: 'granted' | 'denied' | 'revoked'
    dataSensitivity: HealthcareDataSensitivity
    complianceFlags: string[]
  }

  // Event data
  data: Record<string, unknown>

  // Performance metrics
  performance?: {
    duration?: number // milliseconds
    memoryUsage?: number // bytes
    cpuUsage?: number // percentage
    networkLatency?: number // milliseconds
    databaseTime?: number // milliseconds
  }

  // Error context
  error?: {
    type: string
    message: string
    stack?: string
    code?: string
    // No PII in error data per LGPD
  }

  // Network context
  network?: {
    method?: string
    path?: string
    statusCode?: number
    userAgent?: string // Truncated for privacy
    ipAddress?: string // Hashed for privacy
  }

  // AI context
  aiContext?: {
    provider: string
    model: string
    promptTokens?: number
    completionTokens?: number
    cost?: number
    cacheHit?: boolean
    processingTime?: number
  }

  // Security context
  security?: {
    authenticationMethod?: string
    authorizationResult?: 'success' | 'failure'
    securityFlags: string[]
    complianceChecks: string[]
  }

  // Compliance metadata
  compliance?: {
    lgpdCompliant: boolean
    dataRetentionDays?: number
    encryptionStatus: 'encrypted' | 'hashed' | 'plaintext'
    auditRequired: boolean
    piiPresent: boolean
    anonymizationApplied: boolean
  }

  // Custom dimensions
  tags?: string[]
  customAttributes?: Record<string, unknown>
}

// Web Vitals specific telemetry event
export interface WebVitalsEvent extends Omit<TelemetryEvent, 'eventType'> {
  eventType: TelemetryEventType.WEB_VITAL
  data: {
    vitalType: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
    value: number
    id: string
    name: string
    navigationType?: string
  }
}

// Healthcare-specific access event
export interface HealthcareAccessEvent extends Omit<TelemetryEvent, 'eventType'> {
  eventType:
    | TelemetryEventType.PATIENT_ACCESS
    | TelemetryEventType.MEDICAL_RECORD_ACCESS
    | TelemetryEventType.PRESCRIPTION_ACCESS
    | TelemetryEventType.EMERGENCY_ACCESS

  healthcareContext: {
    patientIdHash: string
    accessType: 'read' | 'write' | 'delete' | 'export'
    resourceType: string
    consentVerified: boolean
    isEmergencyAccess: boolean
    dataSensitivity:
      | HealthcareDataSensitivity.MEDIUM
      | HealthcareDataSensitivity.HIGH
      | HealthcareDataSensitivity.CRITICAL
    complianceFlags: ['HIPAA', 'LGPD', 'ANVISA']
  }
}

// AI cost tracking event
export interface AICostEvent extends Omit<TelemetryEvent, 'eventType'> {
  eventType: TelemetryEventType.AI_COST_TRACKING
  aiContext: {
    provider: string
    model: string
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
    currency: 'USD' | 'BRL'
    cacheHit: boolean
    processingTime: number
    success: boolean
  }
}

// Compliance event
export interface ComplianceEvent extends Omit<TelemetryEvent, 'eventType'> {
  eventType:
    | TelemetryEventType.LGPD_CONSENT_UPDATE
    | TelemetryEventType.LGPD_DATA_EXPORT
    | TelemetryEventType.LGPD_DATA_DELETION
    | TelemetryEventType.AUDIT_TRAIL_ENTRY

  compliance: {
    lgpdCompliant: true
    dataRetentionDays: number
    encryptionStatus: 'encrypted' | 'hashed'
    auditRequired: true
    piiPresent: boolean
    anonymizationApplied: boolean
  }

  data: {
    action: string
    resourceType: string
    affectedRecords: number
    legalBasis?: string
    justification?: string
  }
}

// Event validation and utilities
export class TelemetryEventValidator {
  static validate(event: Partial<TelemetryEvent>): boolean {
    const required = ['id', 'eventType', 'timestamp', 'severity', '_service']
    return required.every(
      (field) => event[field as keyof TelemetryEvent] !== undefined,
    )
  }

  static sanitizeForLGPD(
    event: Partial<TelemetryEvent>,
  ): Partial<TelemetryEvent> {
    const sanitized = { ...event }

    // Remove or hash potentially sensitive data
    if (sanitized.network?.ipAddress) {
      sanitized.network.ipAddress = this.hashPII(sanitized.network.ipAddress)
    }

    if (sanitized._userId) {
      sanitized._userId = this.hashPII(sanitized._userId)
    }

    if (sanitized.healthcareContext?.patientIdHash) {
      sanitized.healthcareContext.patientIdHash = this.hashPII(
        sanitized.healthcareContext.patientIdHash,
      )
    }

    return sanitized
  }

  static hashPII(data: string): string {
    // Simple hash for PII data - in production, use a secure hashing function
    return `hashed_${Buffer.from(data).toString('base64').substring(0, 16)}`
  }
}

// Event builder for fluent API
export class TelemetryEventBuilder {
  private event: Partial<TelemetryEvent> = {}

  constructor(eventType: TelemetryEventType, _service: string) {
    this.event = {
      id: crypto.randomUUID(),
      eventType,
      timestamp: new Date(),
      severity: TelemetrySeverity.INFO,
      _service,
      version: '1.0.0',
      environment: (process.env.NODE_ENV as any) || 'development',
      healthcareContext: {
        dataSensitivity: HealthcareDataSensitivity.NONE,
        complianceFlags: [],
      },
      compliance: {
        lgpdCompliant: true,
        encryptionStatus: 'plaintext',
        auditRequired: false,
        piiPresent: false,
        anonymizationApplied: false,
      },
    }
  }

  withSeverity(severity: TelemetrySeverity): this {
    this.event.severity = severity
    return this
  }

  withUser(
    userId: string,
    role?: 'patient' | 'professional' | 'admin' | 'system',
  ): this {
    this.event._userId = TelemetryEventValidator.hashPII(userId)
    if (role) this.event.userRole = role
    return this
  }

  withHealthcareContext(
    context: Partial<TelemetryEvent['healthcareContext']>,
  ): this {
    this.event.healthcareContext = {
      ...this.event.healthcareContext,
      ...context,
      // Ensure required fields have defaults
      dataSensitivity: context?.dataSensitivity
        ?? this.event.healthcareContext?.dataSensitivity
        ?? HealthcareDataSensitivity.NONE,
      complianceFlags: context?.complianceFlags
        ?? this.event.healthcareContext?.complianceFlags
        ?? [],
    }

    // Safely access compliance property
    if (this.event.compliance) {
      this.event.compliance.piiPresent = this.event.healthcareContext.dataSensitivity
        !== HealthcareDataSensitivity.NONE
    }
    return this
  }

  withData(data: Record<string, unknown>): this {
    this.event.data = data
    return this
  }

  withPerformance(metrics: TelemetryEvent['performance']): this {
    this.event.performance = metrics
    return this
  }

  withError(error: TelemetryEvent['error']): this {
    this.event.severity = TelemetrySeverity.ERROR
    this.event.error = error
    return this
  }

  withTags(tags: string[]): this {
    this.event.tags = tags
    return this
  }

  build(): TelemetryEvent {
    const event = this.event as TelemetryEvent
    if (!TelemetryEventValidator.validate(event)) {
      throw new Error('Invalid telemetry event: missing required fields')
    }
    // Ensure required fields exist before casting
    if (
      !event.id
      || !event.eventType
      || !event.timestamp
      || !event.severity
      || !event._service
    ) {
      throw new Error('TelemetryEvent missing required fields after build')
    }

    return TelemetryEventValidator.sanitizeForLGPD(event) as TelemetryEvent
  }
}

// Export types and utilities
// Named exports are already declared above; do not re-export types separately to avoid conflicts
// (removed redundant re-export to avoid duplicate declarations)
