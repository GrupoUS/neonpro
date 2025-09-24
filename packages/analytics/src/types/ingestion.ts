import { AnalyticsEvent, BaseMetric } from './base-metrics'
import { ClinicalKPI } from './clinical-kpis'
import { FinancialKPI } from './financial-kpis'

/**
 * Ingestion Pipeline Configuration
 */
export interface IngestionConfig {
  /** Ingestion source identifier */
  sourceId: string

  /** Source type and connection details */
  sourceType: 'database' | 'api' | 'file' | 'stream' | 'webhook'

  /** Data processing options */
  processing: {
    batchSize: number
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly'
    validation: boolean
    transformation: boolean
    deduplication: boolean
  }

  /** Security and compliance */
  security: {
    encryption: boolean
    anonymization: boolean
    auditTrail: boolean
    complianceFrameworks: string[]
  }

  /** Error handling */
  errorHandling: {
    retryAttempts: number
    failureNotification: boolean
    deadLetterQueue: boolean
  }
}

/**
 * Data Validation Rules
 */
export interface ValidationRule {
  /** Rule identifier */
  ruleId: string

  /** Rule description */
  description: string

  /** Field to validate */
  field: string

  /** Validation type */
  type: 'required' | 'format' | 'range' | 'custom' | 'compliance'

  /** Validation parameters */
  parameters: Record<string, any>

  /** Error handling */
  onError: 'reject' | 'warn' | 'transform' | 'skip'

  /** Compliance framework */
  complianceFramework?: string
}

/**
 * Data Transformation Rules
 */
export interface TransformationRule {
  /** Transformation identifier */
  transformId: string

  /** Transformation description */
  description: string

  /** Source field path */
  sourceField: string

  /** Target field path */
  targetField: string

  /** Transformation type */
  type: 'map' | 'aggregate' | 'filter' | 'anonymize' | 'calculate'

  /** Transformation logic */
  logic: Record<string, any>

  /** Conditional application */
  condition?: string
}

/**
 * Ingestion Event Types
 */
export type IngestionEventType =
  | 'data_received'
  | 'validation_started'
  | 'validation_completed'
  | 'validation_failed'
  | 'transformation_started'
  | 'transformation_completed'
  | 'transformation_failed'
  | 'storage_started'
  | 'storage_completed'
  | 'storage_failed'
  | 'processing_completed'
  | 'error_occurred'

/**
 * Ingestion Event
 */
export interface IngestionEvent extends AnalyticsEvent {
  eventType: IngestionEventType

  /** Source information */
  source: {
    sourceId: string
    sourceType: string
    recordCount: number
    dataSize: number
  }

  /** Processing details */
  processing: {
    startTime: Date
    endTime?: Date
    duration?: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    errors?: string[]
  }

  /** Data quality metrics */
  quality: {
    validRecords: number
    invalidRecords: number
    duplicateRecords: number
    transformedRecords: number
  }
}

/**
 * Ingestion Pipeline Result
 */
export interface IngestionResult {
  /** Operation identifier */
  operationId: string

  /** Pipeline status */
  status: 'success' | 'partial_success' | 'failure'

  /** Processing summary */
  summary: {
    totalRecords: number
    processedRecords: number
    validRecords: number
    invalidRecords: number
    errors: string[]
    warnings: string[]
  }

  /** Generated metrics */
  metrics: Array<BaseMetric | ClinicalKPI | FinancialKPI>

  /** Processing events */
  events: IngestionEvent[]

  /** Timing information */
  timing: {
    startTime: Date
    endTime: Date
    duration: number
    stages: Record<string, number>
  }
}

/**
 * Real-time Data Stream Configuration
 */
export interface StreamConfig {
  /** Stream identifier */
  streamId: string

  /** Stream source */
  source: {
    type: 'kafka' | 'rabbitmq' | 'websocket' | 'webhook'
    endpoint: string
    authentication?: Record<string, any>
  }

  /** Message processing */
  processing: {
    messageFormat: 'json' | 'xml' | 'csv' | 'binary'
    batchProcessing: boolean
    batchSize?: number
    bufferTime?: number
  }

  /** Error handling and recovery */
  reliability: {
    acknowledgments: boolean
    retryPolicy: {
      maxRetries: number
      backoffStrategy: 'linear' | 'exponential'
      baseDelay: number
    }
    deadLetterHandling: boolean
  }
}

/**
 * Webhook Configuration for External Systems
 */
export interface WebhookConfig {
  /** Webhook identifier */
  webhookId: string

  /** Webhook URL and security */
  endpoint: {
    url: string
    method: 'POST' | 'PUT' | 'PATCH'
    headers: Record<string, string>
    authentication?: {
      type: 'bearer' | 'basic' | 'api_key' | 'hmac'
      credentials: Record<string, string>
    }
  }

  /** Event filtering */
  triggers: {
    eventTypes: IngestionEventType[]
    conditions: Record<string, any>
  }

  /** Retry and reliability */
  delivery: {
    retryAttempts: number
    timeout: number
    retryDelay: number
  }
}

/**
 * Data Quality Assessment
 */
export interface DataQualityAssessment {
  /** Assessment identifier */
  assessmentId: string

  /** Assessment timestamp */
  timestamp: Date

  /** Source being assessed */
  sourceId: string

  /** Quality dimensions */
  dimensions: {
    completeness: number // 0-100 percentage
    accuracy: number // 0-100 percentage
    consistency: number // 0-100 percentage
    validity: number // 0-100 percentage
    timeliness: number // 0-100 percentage
  }

  /** Overall quality score */
  overallScore: number

  /** Quality issues found */
  issues: Array<{
    type: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    field?: string
    count: number
  }>

  /** Recommendations */
  recommendations: string[]
}

/**
 * Compliance Validation Result
 */
export interface ComplianceValidationResult {
  /** Validation identifier */
  validationId: string

  /** Compliance framework */
  framework: string

  /** Validation status */
  status: 'compliant' | 'non_compliant' | 'warning'

  /** Validation details */
  details: {
    rulesChecked: number
    rulesPassed: number
    rulesFailed: number
    warnings: number
  }

  /** Violations found */
  violations: Array<{
    rule: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    field?: string
    remediation: string
  }>

  /** Compliance score */
  complianceScore: number
}

/**
 * Error Types for Ingestion Pipeline
 */
export type IngestionErrorType =
  | 'connection_error'
  | 'authentication_error'
  | 'validation_error'
  | 'transformation_error'
  | 'storage_error'
  | 'compliance_error'
  | 'timeout_error'
  | 'resource_error'
  | 'unknown_error'

/**
 * Ingestion Error
 */
export interface IngestionError {
  /** Error identifier */
  errorId: string

  /** Error type */
  type: IngestionErrorType

  /** Error message */
  message: string

  /** Detailed error information */
  details?: Record<string, any>

  /** Source information */
  source: {
    sourceId: string
    recordId?: string
    field?: string
  }

  /** Error context */
  _context: {
    operation: string
    timestamp: Date
    retryCount: number
    stackTrace?: string
  }

  /** Recovery suggestions */
  recovery?: {
    recoverable: boolean
    suggestions: string[]
    retryAfter?: number
  }
}

/**
 * Ingestion Monitoring Metrics
 */
export interface IngestionMonitoringMetrics {
  /** Monitoring period */
  period: {
    start: Date
    end: Date
  }

  /** Throughput metrics */
  throughput: {
    recordsPerSecond: number
    bytesPerSecond: number
    peakThroughput: number
    averageThroughput: number
  }

  /** Performance metrics */
  performance: {
    averageLatency: number
    p95Latency: number
    p99Latency: number
    errorRate: number
    uptime: number
  }

  /** Resource utilization */
  resources: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    networkIO: number
  }

  /** Quality metrics */
  quality: {
    dataQualityScore: number
    complianceScore: number
    validationSuccessRate: number
    transformationSuccessRate: number
  }
}

/**
 * Type Guards for Ingestion Types
 */

/**
 * Check if an object is a valid IngestionEvent
 */
export function isIngestionEvent(obj: any): obj is IngestionEvent {
  return (
    obj
    && typeof obj === 'object'
    && typeof obj.eventType === 'string'
    && obj.source
    && typeof obj.source.sourceId === 'string'
    && obj.processing
    && typeof obj.processing.status === 'string'
    && obj.quality
    && typeof obj.quality.validRecords === 'number'
  )
}

/**
 * Check if an object is a valid IngestionConfig
 */
export function isIngestionConfig(obj: any): obj is IngestionConfig {
  return (
    obj
    && typeof obj === 'object'
    && typeof obj.sourceId === 'string'
    && typeof obj.sourceType === 'string'
    && obj.processing
    && typeof obj.processing.batchSize === 'number'
    && obj.security
    && typeof obj.security.encryption === 'boolean'
  )
}

/**
 * Check if an object is a valid ValidationRule
 */
export function isValidationRule(obj: any): obj is ValidationRule {
  return (
    obj
    && typeof obj === 'object'
    && typeof obj.ruleId === 'string'
    && typeof obj.field === 'string'
    && typeof obj.type === 'string'
    && typeof obj.onError === 'string'
  )
}
