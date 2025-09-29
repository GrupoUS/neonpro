/**
 * Base Analytics Metrics - Foundation for Healthcare Analytics AI
 *
 * Provides core interfaces and validation patterns for clinical and financial KPIs
 * with compliance-aware design (LGPD/ANVISA/CFM) and extensible architecture.
 */

import type { RiskLevel as AuditRiskLevel, ComplianceFramework as AuditComplianceFramework } from "../audit/types"

// Local type definitions to avoid circular dependencies
type RiskLevel = AuditRiskLevel
type ComplianceFramework = AuditComplianceFramework

/**
 * Analytics event interface for tracking user interactions and system events
 */
export interface AnalyticsEvent {
  /** Unique event identifier */
  id: string

  /** Event type/category */
  type: string

  /** Event timestamp */
  timestamp: Date

  /** User identifier (anonymized) */
  _userId?: string

  /** Session identifier */
  sessionId?: string

  /** Event properties */
  properties: Record<string, unknown>

  /** Event context */
  _context?: Record<string, unknown>
}

/**
 * Metric data types supported by the analytics system
 */
export type MetricDataType =
  | 'number'
  | 'percentage'
  | 'currency'
  | 'duration'
  | 'count'
  | 'ratio'
  | 'boolean'

// Export aliases for backward compatibility
export type MetricType = MetricDataType

/**
 * Currency types supported by the system
 */
export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP'

/**
 * Metric frequency for collection and reporting
 */
export type MetricFrequency =
  | 'real-time'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'

// Export alias for backward compatibility
export type Frequency = MetricFrequency

/**
 * Metric aggregation methods
 */
export type MetricAggregation =
  | 'sum'
  | 'average'
  | 'count'
  | 'min'
  | 'max'
  | 'median'
  | 'percentile'
  | 'last_value'

// Export alias for backward compatibility
export type AggregationType = MetricAggregation

/**
 * Metric status indicating data quality and reliability
 */
export type MetricStatus =
  | 'active'
  | 'inactive'
  | 'deprecated'
  | 'error'
  | 'calculating'

// Re-export types from audit module to avoid conflicts
export type { ComplianceFramework as AuditComplianceFramework, RiskLevel as AuditRiskLevel } from '../audit/types'

// Export local type aliases for compatibility
export type { RiskLevel, ComplianceFramework }

/**
 * Base metric interface - foundation for all analytics metrics
 *
 * Provides common structure with type safety, compliance awareness,
 * and extensible metadata patterns.
 */
export interface BaseMetric {
  /** Unique identifier for the metric */
  id: string

  /** Human-readable metric name */
  name: string

  /** Detailed description of what this metric measures */
  description?: string

  /** Data type of the metric value */
  dataType: MetricDataType

  /** Current metric value */
  value: number

  /** Unit of measurement (e.g., '%', 'minutes', 'BRL', 'count') */
  unit: string

  /** Target/goal value for this metric */
  targetValue?: number

  /** Alert threshold value */
  threshold?: number

  /** Collection and reporting frequency */
  frequency: MetricFrequency

  /** Aggregation method for time-series data */
  aggregation: MetricAggregation

  /** Current status of the metric */
  status: MetricStatus

  /** Risk level assessment */
  riskLevel: RiskLevel

  /** Applicable compliance frameworks */
  complianceFrameworks: ComplianceFramework[]

  /** Data source identifier */
  source: string

  /** Timestamp of when this value was calculated/measured */
  timestamp: Date

  /** Timestamp of when this metric was last updated */
  lastUpdated: Date

  /** Timestamp of when this metric was created */
  createdAt: Date

  /** Additional metadata (extensible) */
  metadata?: Record<string, unknown>
}

/**
 * Metric context for healthcare-specific information
 */
export interface HealthcareContext {
  /** Clinic/facility identifier */
  clinicId?: string

  /** Department/unit identifier */
  departmentId?: string

  /** Provider/practitioner identifier */
  providerId?: string

  /** Patient identifier (anonymized for LGPD compliance) */
  patientId?: string

  /** Clinical context/specialty */
  clinicalContext?: string

  /** Regulatory requirements */
  regulatoryContext?: {
    framework: ComplianceFramework
    requirements: string[]
    auditRequired: boolean
  }
}

/**
 * Time series data point for trend analysis
 */
export interface MetricDataPoint {
  /** Timestamp of the data point */
  timestamp: Date

  /** Metric value at this point in time */
  value: number

  /** Optional context for this specific data point */
  _context?: Record<string, unknown>
}

/**
 * Metric trend analysis result
 */
export interface MetricTrend {
  /** Direction of the trend */
  direction: 'improving' | 'declining' | 'stable' | 'volatile'

  /** Percentage change over the analysis period */
  percentageChange: number

  /** Confidence level in the trend analysis (0-1) */
  confidence: number

  /** Time period analyzed */
  period: {
    start: Date
    end: Date
  }

  /** Historical data points used for analysis */
  dataPoints: MetricDataPoint[]
}

/**
 * Metric validation result
 */
export interface MetricValidation {
  /** Whether the metric value is valid */
  isValid: boolean

  /** Validation error messages */
  errors: string[]

  /** Validation warnings */
  warnings: string[]

  /** Data quality score (0-1) */
  qualityScore: number

  /** Timestamp of validation */
  validatedAt: Date
}

/**
 * Anonymous metric for privacy-compliant analytics
 *
 * Removes all personally identifiable information while maintaining
 * analytical value for population-level insights.
 */
export interface AnonymousMetric extends Omit<BaseMetric, 'metadata'> {
  /** Anonymized/hashed identifier */
  anonymousId: string

  /** Geographic region (city/state level) */
  region?: string

  /** Demographic cohort (age range, etc.) */
  cohort?: string

  /** Anonymized metadata (no PII) */
  metadata?: {
    aggregationLevel: 'individual' | 'group' | 'population'
    anonymizationMethod: 'hash' | 'generalization' | 'suppression'
    privacyLevel: 'low' | 'medium' | 'high'
  }
}

/**
 * Metric alert configuration
 */
export interface MetricAlert {
  /** Alert identifier */
  id: string

  /** Related metric ID */
  metricId: string

  /** Alert condition */
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'range'
    value: number | [number, number]
  }

  /** Alert severity */
  severity: 'info' | 'warning' | 'critical'

  /** Alert message template */
  message: string

  /** Notification recipients */
  recipients: string[]

  /** Whether alert is currently active */
  isActive: boolean

  /** Timestamp of last trigger */
  lastTriggered?: Date
}

/**
 * Utility type for creating metric updates
 */
export type MetricUpdate = Partial<
  Pick<
    BaseMetric,
    | 'value'
    | 'targetValue'
    | 'threshold'
    | 'status'
    | 'riskLevel'
    | 'lastUpdated'
    | 'metadata'
  >
>

/**
 * Type guard to check if a metric is a healthcare metric
 */
export function isHealthcareMetric(metric: BaseMetric): boolean {
  return metric.complianceFrameworks.some(framework =>
    ['LGPD', 'ANVISA', 'CFM', 'HIPAA'].includes(framework)
  )
}

/**
 * Type guard to check if a metric requires compliance audit
 */
export function requiresComplianceAudit(metric: BaseMetric): boolean {
  return (
    isHealthcareMetric(metric) &&
    ['HIGH', 'CRITICAL'].includes(metric.riskLevel)
  )
}

/**
 * Utility function to anonymize a metric for privacy compliance
 */
export function anonymizeMetric(
  metric: BaseMetric,
  options?: {
    includeRegion?: boolean
    includeCohort?: boolean
  },
): AnonymousMetric {
  const { metadata, ...baseMetric } = metric

  return {
    ...baseMetric,
    anonymousId: generateAnonymousId(metric.id),
    region: options?.includeRegion ? extractRegion(metadata) : undefined,
    cohort: options?.includeCohort ? extractCohort(metadata) : undefined,
    metadata: {
      aggregationLevel: 'individual',
      anonymizationMethod: 'hash',
      privacyLevel: 'high',
    },
  }
}

/**
 * Generate anonymous identifier from original ID
 */
function generateAnonymousId(id: string): string {
  // Simple hash function - in production, use crypto.createHash
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return `anon_${Math.abs(hash).toString(36)}`
}

/**
 * Extract region information from metadata
 */
function extractRegion(metadata?: Record<string, unknown>): string | undefined {
  if (!metadata) return undefined

  // Extract city/state level information, avoiding specific addresses
  const location = metadata.location as Record<string, unknown> | undefined
  if (location && typeof location.state === 'string' && typeof location.city === 'string') {
    return `${location.city}, ${location.state}`
  }

  return (location?.state as string) || (location?.region as string)
}

/**
 * Extract demographic cohort from metadata
 */
function extractCohort(metadata?: Record<string, unknown>): string | undefined {
  if (!metadata) return undefined

  // Extract generalized demographic information
  const demographics = metadata.demographics as Record<string, unknown> | undefined
  if (demographics && typeof demographics.ageRange === 'string') {
    return `age_${demographics.ageRange}`
  }

  return undefined
}

/**
 * Create a mock metric for testing purposes
 */
export function createMockMetric(overrides?: Partial<BaseMetric>): BaseMetric {
  const now = new Date()

  return {
    id: 'mock_metric_' + Math.random().toString(36).substr(2, 9),
    name: 'Mock Metric',
    description: 'A mock metric for testing',
    dataType: 'number',
    value: Math.random() * 100,
    unit: 'count',
    targetValue: 100,
    threshold: 80,
    frequency: 'daily',
    aggregation: 'average',
    status: 'active',
    riskLevel: 'LOW',
    complianceFrameworks: ['LGPD'],
    source: 'mock_system',
    timestamp: now,
    lastUpdated: now,
    createdAt: now,
    metadata: {},
    ...overrides,
  }
}

/**
 * Create a mock analytics event for testing purposes
 */
export function createMockAnalyticsEvent(
  overrides?: Partial<AnalyticsEvent>,
): AnalyticsEvent {
  return {
    id: 'mock_event_' + Math.random().toString(36).substr(2, 9),
    type: 'page_view',
    timestamp: new Date(),
    _userId: 'mock_user_' + Math.random().toString(36).substr(2, 6),
    sessionId: 'mock_session_' + Math.random().toString(36).substr(2, 6),
    properties: {
      page: '/dashboard',
      action: 'view',
    },
    _context: {
      userAgent: 'Mock Browser',
      ip: '127.0.0.1',
    },
    ...overrides,
  }
}

/**
 * Validate metric compliance based on healthcare frameworks
 */
export function validateMetricCompliance(metric: BaseMetric): MetricValidation {
  const errors: string[] = []
  const warnings: string[] = []
  let qualityScore = 1.0

  // Validate required fields
  if (!metric.id) {
    errors.push('Metric ID is required')
    qualityScore -= 0.2
  }

  if (!metric.name) {
    errors.push('Metric name is required')
    qualityScore -= 0.2
  }

  if (metric.value === undefined || metric.value === null) {
    errors.push('Metric value is required')
    qualityScore -= 0.3
  }

  // Validate healthcare compliance
  if (isHealthcareMetric(metric)) {
    if (!metric.source.includes('healthcare')) {
      warnings.push('Healthcare metrics should specify healthcare data source')
      qualityScore -= 0.1
    }

    if (metric.complianceFrameworks.length === 0) {
      errors.push('Healthcare metrics must specify compliance frameworks')
      qualityScore -= 0.2
    }
  }

  // Validate risk level alignment
  if (metric.riskLevel === 'CRITICAL' && metric.status !== 'active') {
    warnings.push('Critical risk metrics should typically be active')
    qualityScore -= 0.1
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    qualityScore: Math.max(0, qualityScore),
    validatedAt: new Date(),
  }
}

/**
 * Aggregate multiple metrics using specified aggregation method
 */
export function aggregateMetrics(
  metrics: BaseMetric[],
  aggregation: MetricAggregation = 'average',
): number {
  if (metrics.length === 0) return 0

  const values = metrics.map(m => m.value)

  switch (aggregation) {
    case 'sum':
      return values.reduce((sum, _val) => sum + _val, 0)

    case 'average':
      return values.reduce((sum, _val) => sum + _val, 0) / values.length

    case 'count':
      return values.length

    case 'min':
      return Math.min(...values)

    case 'max':
      return Math.max(...values)

    case 'median':
      const sorted = values.filter(v => v !== undefined).sort((a, b) => (a || 0) - (b || 0))
      const mid = Math.floor(sorted.length / 2)
      const midValue = sorted.length % 2 === 0
        ? ((sorted[mid - 1] || 0) + (sorted[mid] || 0)) / 2
        : (sorted[mid] || 0)
      return midValue

    case 'percentile':
      // Default to 95th percentile
      const sortedValues = values.filter(v => v !== undefined).sort((a, b) => (a || 0) - (b || 0))
      const index = Math.ceil(0.95 * sortedValues.length) - 1
      return sortedValues[index] || 0

    case 'last_value':
      return values[values.length - 1] || 0

    default:
      return values.reduce((sum, _val) => sum + _val, 0) / values.length
  }
}
