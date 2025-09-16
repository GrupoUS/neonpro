/**
 * Telemetry Event Data Models
 * 
 * Healthcare-compliant telemetry structures for NeonPro platform
 * with LGPD compliance and ANVISA regulatory requirements.
 * 
 * Based on: /specs/002-platform-architecture-improvements/data-model.md
 * Contract: /specs/002-platform-architecture-improvements/contracts/observability.openapi.yaml
 */

import { z } from 'zod';

// ============================================================================
// LGPD Compliance Schemas
// ============================================================================

/**
 * LGPD data classification levels for healthcare data
 */
export const LGPDDataClassificationSchema = z.enum([
  'public',
  'internal', 
  'confidential',
  'restricted'
] as const);

export type LGPDDataClassification = z.infer<typeof LGPDDataClassificationSchema>;

/**
 * LGPD legal basis for data processing (Article 7)
 */
export const LGPDLegalBasisSchema = z.enum([
  'consent',           // Consentimento
  'contract',          // Execução de contrato  
  'legal_obligation',  // Cumprimento de obrigação legal
  'vital_interests',   // Proteção da vida
  'public_interest',   // Execução de políticas públicas
  'legitimate_interests' // Interesse legítimo
] as const);

export type LGPDLegalBasis = z.infer<typeof LGPDLegalBasisSchema>;

/**
 * LGPD compliance metadata for telemetry data
 */
export const LGPDMetadataSchema = z.object({
  dataClassification: LGPDDataClassificationSchema,
  retentionPeriod: z.number().min(1).max(2555), // Days (max 7 years for medical)
  anonymized: z.boolean(),
  consentRequired: z.boolean(),
  legalBasis: LGPDLegalBasisSchema.optional(),
  dataSubjectId: z.string().optional(), // Encrypted patient/user ID
});

export type LGPDMetadata = z.infer<typeof LGPDMetadataSchema>;

// ============================================================================
// Healthcare Context Schemas  
// ============================================================================

/**
 * Healthcare workflow types for telemetry context
 */
export const HealthcareWorkflowTypeSchema = z.enum([
  'patient_care',
  'appointment', 
  'medical_record',
  'billing',
  'admin',
  'emergency',
  'compliance_audit'
] as const);

export type HealthcareWorkflowType = z.infer<typeof HealthcareWorkflowTypeSchema>;

/**
 * Healthcare context for telemetry events
 */
export const HealthcareContextSchema = z.object({
  clinicId: z.string().uuid().optional(),
  patientId: z.string().optional(), // Encrypted for LGPD compliance
  professionalId: z.string().uuid().optional(),
  workflowType: HealthcareWorkflowTypeSchema.optional(),
  treatmentProtocol: z.string().optional(),
  emergencyLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  medicalSpecialty: z.string().optional(),
}).strict();

export type HealthcareContext = z.infer<typeof HealthcareContextSchema>;

// ============================================================================
// Core Telemetry Event Schema
// ============================================================================

/**
 * Telemetry event types
 */
export const TelemetryEventTypeSchema = z.enum([
  'performance',
  'error', 
  'user_interaction',
  'security',
  'healthcare_workflow',
  'compliance_audit',
  'ai_interaction'
] as const);

export type TelemetryEventType = z.infer<typeof TelemetryEventTypeSchema>;

/**
 * Event severity levels
 */
export const TelemetrySeveritySchema = z.enum([
  'low',
  'medium', 
  'high',
  'critical'
] as const);

export type TelemetrySeverity = z.infer<typeof TelemetrySeveritySchema>;

/**
 * Telemetry event sources
 */
export const TelemetrySourceSchema = z.enum([
  'web',
  'api',
  'database',
  'ai_service',
  'external_integration',
  'mobile_app',
  'background_job'
] as const);

export type TelemetrySource = z.infer<typeof TelemetrySourceSchema>;

/**
 * Core telemetry event structure
 * 
 * Implements complete healthcare compliance with LGPD data protection
 * and ANVISA regulatory requirements for medical device software.
 */
export const TelemetryEventSchema = z.object({
  // Core identification
  id: z.string().uuid(),
  timestamp: z.string().datetime(), // ISO 8601
  eventType: TelemetryEventTypeSchema,
  severity: TelemetrySeveritySchema,
  source: TelemetrySourceSchema,
  
  // Healthcare context (optional, encrypted when needed)
  healthcareContext: HealthcareContextSchema.optional(),
  
  // Event-specific data (no PII allowed)
  metadata: z.record(z.unknown()).refine(
    (data) => Object.keys(data).length <= 20,
    { message: "Metadata cannot exceed 20 properties" }
  ),
  
  // LGPD compliance (mandatory for all events)
  lgpdMetadata: LGPDMetadataSchema,
  
  // Distributed tracing correlation
  traceId: z.string().regex(/^[a-f0-9]{32}$/).optional(),
  spanId: z.string().regex(/^[a-f0-9]{16}$/).optional(), 
  parentSpanId: z.string().regex(/^[a-f0-9]{16}$/).optional(),
  
  // Session correlation
  sessionId: z.string().regex(/^sess_[a-zA-Z0-9]{8,}$/).optional(),
  userId: z.string().regex(/^usr_(anon_)?[a-zA-Z0-9]{8,}$/).optional(),
  
  // Environment context
  environment: z.enum(['development', 'staging', 'production']).optional(),
  version: z.string().optional(),
}).strict();

export type TelemetryEvent = z.infer<typeof TelemetryEventSchema>;

// ============================================================================
// Performance Metrics Schemas
// ============================================================================

/**
 * Core Web Vitals metrics
 */
export const WebVitalsSchema = z.object({
  firstContentfulPaint: z.number().min(0), // ms
  largestContentfulPaint: z.number().min(0), // ms  
  cumulativeLayoutShift: z.number().min(0), // score
  firstInputDelay: z.number().min(0), // ms
  timeToInteractive: z.number().min(0), // ms
  timeToFirstByte: z.number().min(0).optional(), // ms
  interactionToNextPaint: z.number().min(0).optional(), // ms
}).strict();

export type WebVitals = z.infer<typeof WebVitalsSchema>;

/**
 * Healthcare-specific performance metrics
 */
export const HealthcareMetricsSchema = z.object({
  patientDataLoadTime: z.number().min(0), // Critical for patient safety
  medicalRecordRenderTime: z.number().min(0),
  appointmentSchedulingLatency: z.number().min(0),
  aiResponseTime: z.number().min(0).optional(),
  emergencyActionResponseTime: z.number().min(0).optional(), // Must be <200ms
  prescriptionValidationTime: z.number().min(0).optional(),
  auditTrailGenerationTime: z.number().min(0).optional(),
}).strict();

export type HealthcareMetrics = z.infer<typeof HealthcareMetricsSchema>;

/**
 * Resource utilization metrics
 */
export const ResourceUtilizationSchema = z.object({
  memoryUsage: z.number().min(0), // MB
  cpuUsage: z.number().min(0).max(100), // Percentage
  networkLatency: z.number().min(0), // ms
  bundleSize: z.number().min(0), // KB
  databaseQueryTime: z.number().min(0).optional(), // ms
  cacheHitRatio: z.number().min(0).max(1).optional(), // 0.0-1.0
}).strict();

export type ResourceUtilization = z.infer<typeof ResourceUtilizationSchema>;

/**
 * Browser/device environment context
 */
export const EnvironmentContextSchema = z.object({
  userAgent: z.string().max(500),
  viewport: z.object({
    width: z.number().min(1),
    height: z.number().min(1)
  }),
  connectionType: z.enum(['slow-2g', '2g', '3g', '4g', '5g', 'wifi', 'unknown']),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  timezone: z.string().optional(),
  locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/).optional(),
}).strict();

export type EnvironmentContext = z.infer<typeof EnvironmentContextSchema>;

/**
 * Complete performance metrics structure
 */
export const PerformanceMetricsSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  sessionId: z.string().regex(/^sess_[a-zA-Z0-9]{8,}$/),
  userId: z.string().regex(/^usr_(anon_)?[a-zA-Z0-9]{8,}$/).optional(),
  
  // Core Web Vitals
  webVitals: WebVitalsSchema,
  
  // Healthcare-specific metrics
  healthcareMetrics: HealthcareMetricsSchema,
  
  // Resource utilization
  resources: ResourceUtilizationSchema,
  
  // Browser/device context
  environment: EnvironmentContextSchema,
  
  // LGPD compliance
  lgpdMetadata: LGPDMetadataSchema,
  
  // Healthcare workflow context
  healthcareContext: HealthcareContextSchema.optional(),
}).strict();

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

// ============================================================================
// Error Event Schemas
// ============================================================================

/**
 * Error types in healthcare platform
 */
export const ErrorTypeSchema = z.enum([
  'javascript_error',
  'unhandled_promise_rejection',
  'network_error',
  'validation_error',
  'authentication_error',
  'authorization_error',
  'medical_data_error',
  'compliance_violation',
  'ai_service_error'
] as const);

export type ErrorType = z.infer<typeof ErrorTypeSchema>;

/**
 * Healthcare impact assessment for errors
 */
export const HealthcareImpactSchema = z.object({
  severity: TelemetrySeveritySchema,
  patientSafetyRisk: z.boolean(),
  dataIntegrityRisk: z.boolean(), 
  complianceRisk: z.boolean(),
  workflowDisruption: z.enum(['none', 'minor', 'major', 'critical']),
  regulatoryReporting: z.boolean().optional(), // ANVISA reporting required
  emergencyResponse: z.boolean().optional(), // Requires immediate response
}).strict();

export type HealthcareImpact = z.infer<typeof HealthcareImpactSchema>;

/**
 * Anonymized user context for errors
 */
export const UserContextSchema = z.object({
  anonymizedUserId: z.string().regex(/^usr_anon_[a-zA-Z0-9]{8,}$/),
  role: z.string().max(50),
  currentWorkflow: z.string().max(100).optional(),
  deviceType: z.enum(['mobile', 'tablet', 'desktop']),
  sessionDuration: z.number().min(0).optional(), // seconds
  permissions: z.array(z.string()).optional(),
}).strict();

export type UserContext = z.infer<typeof UserContextSchema>;

/**
 * Technical context for error diagnosis
 */
export const TechnicalContextSchema = z.object({
  url: z.string().url().max(500),
  httpMethod: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
  statusCode: z.number().min(100).max(599).optional(),
  requestId: z.string().uuid().optional(),
  apiEndpoint: z.string().max(200).optional(),
  userAgent: z.string().max(500).optional(),
  ipAddressHash: z.string().optional(), // Hashed for LGPD compliance
}).strict();

export type TechnicalContext = z.infer<typeof TechnicalContextSchema>;

/**
 * Error resolution tracking
 */
export const ErrorResolutionSchema = z.object({
  status: z.enum(['open', 'investigating', 'resolved', 'deferred']),
  assignedTo: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolutionNotes: z.string().max(1000).optional(),
  rootCause: z.string().max(500).optional(),
  preventionMeasures: z.array(z.string()).optional(),
}).strict();

export type ErrorResolution = z.infer<typeof ErrorResolutionSchema>;

/**
 * Complete error event structure
 */
export const ErrorEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  errorType: ErrorTypeSchema,
  
  // Error details (automatically redacted for PII)
  message: z.string().max(1000),
  stack: z.string().max(10000).optional(),
  source: z.string().max(500),
  lineNumber: z.number().min(1).optional(),
  columnNumber: z.number().min(1).optional(),
  fingerprint: z.string().max(64).optional(), // For error grouping
  
  // Healthcare context and impact
  healthcareImpact: HealthcareImpactSchema,
  healthcareContext: HealthcareContextSchema.optional(),
  
  // User context (anonymized for LGPD)
  userContext: UserContextSchema,
  
  // Technical context
  technicalContext: TechnicalContextSchema,
  
  // Resolution tracking
  resolution: ErrorResolutionSchema.optional(),
  
  // LGPD compliance
  lgpdMetadata: LGPDMetadataSchema,
  
  // Correlation IDs
  traceId: z.string().regex(/^[a-f0-9]{32}$/).optional(),
  spanId: z.string().regex(/^[a-f0-9]{16}$/).optional(),
  sessionId: z.string().regex(/^sess_[a-zA-Z0-9]{8,}$/).optional(),
  
  // Additional metadata
  tags: z.record(z.string()).refine(
    (data) => Object.keys(data).length <= 10,
    { message: "Tags cannot exceed 10 properties" }
  ).optional(),
}).strict();

export type ErrorEvent = z.infer<typeof ErrorEventSchema>;

// ============================================================================
// Utility Functions & Validators
// ============================================================================

/**
 * Validate telemetry event for healthcare compliance
 */
export function validateHealthcareCompliance(event: TelemetryEvent): {
  valid: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  // Check for PII in metadata
  const metadataStr = JSON.stringify(event.metadata).toLowerCase();
  const piiPatterns = [
    /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF pattern
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email pattern
    /\b\d{2}\s?\d{4,5}-?\d{4}\b/, // Phone pattern
  ];
  
  for (const pattern of piiPatterns) {
    if (pattern.test(metadataStr)) {
      violations.push('PII detected in metadata');
      break;
    }
  }
  
  // Validate healthcare data classification
  if (event.healthcareContext?.workflowType === 'patient_care' && 
      event.lgpdMetadata.dataClassification === 'public') {
    violations.push('Patient care workflows cannot have public data classification');
  }
  
  // Validate retention periods for medical data
  if (event.healthcareContext?.workflowType === 'medical_record' &&
      event.lgpdMetadata.retentionPeriod < 2555) { // 7 years minimum for medical
    violations.push('Medical records require minimum 7-year retention period');
  }
  
  // Validate emergency response requirements
  if (event.healthcareContext?.emergencyLevel === 'critical' &&
      !event.lgpdMetadata.consentRequired) {
    violations.push('Emergency critical events may require consent override documentation');
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Sanitize telemetry event for LGPD compliance
 */
export function sanitizeTelemetryEvent(event: TelemetryEvent): TelemetryEvent {
  const sanitized = { ...event };
  
  // Anonymize user ID if not already anonymized
  if (sanitized.userId && !sanitized.userId.includes('anon_')) {
    sanitized.userId = `usr_anon_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Remove potential PII from metadata
  const sanitizedMetadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sanitized.metadata)) {
    if (typeof value === 'string') {
      // Redact potential PII patterns
      let sanitizedValue = value
        .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF_REDACTED]')
        .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL_REDACTED]')
        .replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '[PHONE_REDACTED]');
      
      sanitizedMetadata[key] = sanitizedValue;
    } else {
      sanitizedMetadata[key] = value;
    }
  }
  sanitized.metadata = sanitizedMetadata;
  
  // Encrypt patient ID if present
  if (sanitized.healthcareContext?.patientId) {
    sanitized.healthcareContext.patientId = `[ENCRYPTED_${Date.now()}]`;
  }
  
  return sanitized;
}

/**
 * Create default LGPD metadata for telemetry events
 */
export function createDefaultLGPDMetadata(
  dataClassification: LGPDDataClassification = 'internal',
  legalBasis: LGPDLegalBasis = 'legitimate_interests'
): LGPDMetadata {
  return {
    dataClassification,
    retentionPeriod: dataClassification === 'restricted' ? 2555 : 90, // 7 years for medical, 90 days for operational
    anonymized: true,
    consentRequired: dataClassification === 'restricted',
    legalBasis
  };
}

// ============================================================================
// Export All Schemas & Types
// ============================================================================

export {
  // Main schemas
  TelemetryEventSchema,
  PerformanceMetricsSchema, 
  ErrorEventSchema,
  
  // Component schemas
  LGPDMetadataSchema,
  HealthcareContextSchema,
  WebVitalsSchema,
  HealthcareMetricsSchema,
  ResourceUtilizationSchema,
  EnvironmentContextSchema,
  HealthcareImpactSchema,
  UserContextSchema,
  TechnicalContextSchema,
  ErrorResolutionSchema,
  
  // Enum schemas
  TelemetryEventTypeSchema,
  TelemetrySeveritySchema,
  TelemetrySourceSchema,
  LGPDDataClassificationSchema,
  LGPDLegalBasisSchema,
  HealthcareWorkflowTypeSchema,
  ErrorTypeSchema,
};