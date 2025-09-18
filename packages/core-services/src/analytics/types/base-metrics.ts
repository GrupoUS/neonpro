/**
 * Base Analytics Metrics - Foundation for Healthcare Analytics AI
 * 
 * Provides core interfaces and validation patterns for clinical and financial KPIs
 * with compliance-aware design (LGPD/ANVISA/CFM) and extensible architecture.
 */

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
  | 'boolean';

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
  | 'yearly';

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
  | 'last_value';

/**
 * Metric status indicating data quality and reliability
 */
export type MetricStatus = 
  | 'active' 
  | 'inactive' 
  | 'deprecated' 
  | 'error' 
  | 'calculating';

/**
 * Risk levels for metric values (healthcare context)
 */
export type RiskLevel = 
  | 'LOW' 
  | 'MEDIUM' 
  | 'HIGH' 
  | 'CRITICAL';

/**
 * Compliance frameworks applicable to healthcare metrics
 */
export type ComplianceFramework = 
  | 'LGPD' 
  | 'ANVISA' 
  | 'CFM' 
  | 'HIPAA' 
  | 'GENERAL';

/**
 * Base metric interface - foundation for all analytics metrics
 * 
 * Provides common structure with type safety, compliance awareness,
 * and extensible metadata patterns.
 */
export interface BaseMetric {
  /** Unique identifier for the metric */
  id: string;
  
  /** Human-readable metric name */
  name: string;
  
  /** Detailed description of what this metric measures */
  description?: string;
  
  /** Data type of the metric value */
  dataType: MetricDataType;
  
  /** Current metric value */
  value: number;
  
  /** Unit of measurement (e.g., '%', 'minutes', 'BRL', 'count') */
  unit: string;
  
  /** Target/goal value for this metric */
  targetValue?: number;
  
  /** Alert threshold value */
  threshold?: number;
  
  /** Collection and reporting frequency */
  frequency: MetricFrequency;
  
  /** Aggregation method for time-series data */
  aggregation: MetricAggregation;
  
  /** Current status of the metric */
  status: MetricStatus;
  
  /** Risk level assessment */
  riskLevel: RiskLevel;
  
  /** Applicable compliance frameworks */
  complianceFrameworks: ComplianceFramework[];
  
  /** Data source identifier */
  source: string;
  
  /** Timestamp of when this value was calculated/measured */
  timestamp: Date;
  
  /** Timestamp of when this metric was last updated */
  lastUpdated: Date;
  
  /** Timestamp of when this metric was created */
  createdAt: Date;
  
  /** Additional metadata (extensible) */
  metadata?: Record<string, unknown>;
}

/**
 * Metric context for healthcare-specific information
 */
export interface HealthcareContext {
  /** Clinic/facility identifier */
  clinicId?: string;
  
  /** Department/unit identifier */
  departmentId?: string;
  
  /** Provider/practitioner identifier */
  providerId?: string;
  
  /** Patient identifier (anonymized for LGPD compliance) */
  patientId?: string;
  
  /** Clinical context/specialty */
  clinicalContext?: string;
  
  /** Regulatory requirements */
  regulatoryContext?: {
    framework: ComplianceFramework;
    requirements: string[];
    auditRequired: boolean;
  };
}

/**
 * Time series data point for trend analysis
 */
export interface MetricDataPoint {
  /** Timestamp of the data point */
  timestamp: Date;
  
  /** Metric value at this point in time */
  value: number;
  
  /** Optional context for this specific data point */
  context?: Record<string, unknown>;
}

/**
 * Metric trend analysis result
 */
export interface MetricTrend {
  /** Direction of the trend */
  direction: 'improving' | 'declining' | 'stable' | 'volatile';
  
  /** Percentage change over the analysis period */
  percentageChange: number;
  
  /** Confidence level in the trend analysis (0-1) */
  confidence: number;
  
  /** Time period analyzed */
  period: {
    start: Date;
    end: Date;
  };
  
  /** Historical data points used for analysis */
  dataPoints: MetricDataPoint[];
}

/**
 * Metric validation result
 */
export interface MetricValidation {
  /** Whether the metric value is valid */
  isValid: boolean;
  
  /** Validation error messages */
  errors: string[];
  
  /** Validation warnings */
  warnings: string[];
  
  /** Data quality score (0-1) */
  qualityScore: number;
  
  /** Timestamp of validation */
  validatedAt: Date;
}

/**
 * Anonymous metric for privacy-compliant analytics
 * 
 * Removes all personally identifiable information while maintaining
 * analytical value for population-level insights.
 */
export interface AnonymousMetric extends Omit<BaseMetric, 'metadata'> {
  /** Anonymized/hashed identifier */
  anonymousId: string;
  
  /** Geographic region (city/state level) */
  region?: string;
  
  /** Demographic cohort (age range, etc.) */
  cohort?: string;
  
  /** Anonymized metadata (no PII) */
  metadata?: {
    aggregationLevel: 'individual' | 'group' | 'population';
    anonymizationMethod: 'hash' | 'generalization' | 'suppression';
    privacyLevel: 'low' | 'medium' | 'high';
  };
}

/**
 * Metric alert configuration
 */
export interface MetricAlert {
  /** Alert identifier */
  id: string;
  
  /** Related metric ID */
  metricId: string;
  
  /** Alert condition */
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'range';
    value: number | [number, number];
  };
  
  /** Alert severity */
  severity: 'info' | 'warning' | 'critical';
  
  /** Alert message template */
  message: string;
  
  /** Notification recipients */
  recipients: string[];
  
  /** Whether alert is currently active */
  isActive: boolean;
  
  /** Timestamp of last trigger */
  lastTriggered?: Date;
}

/**
 * Utility type for creating metric updates
 */
export type MetricUpdate = Partial<Pick<BaseMetric, 
  | 'value' 
  | 'targetValue' 
  | 'threshold' 
  | 'status' 
  | 'riskLevel' 
  | 'lastUpdated' 
  | 'metadata'
>>;

/**
 * Type guard to check if a metric is a healthcare metric
 */
export function isHealthcareMetric(metric: BaseMetric): boolean {
  return metric.complianceFrameworks.some(framework => 
    ['LGPD', 'ANVISA', 'CFM', 'HIPAA'].includes(framework)
  );
}

/**
 * Type guard to check if a metric requires compliance audit
 */
export function requiresComplianceAudit(metric: BaseMetric): boolean {
  return isHealthcareMetric(metric) && 
    ['HIGH', 'CRITICAL'].includes(metric.riskLevel);
}

/**
 * Utility function to anonymize a metric for privacy compliance
 */
export function anonymizeMetric(metric: BaseMetric, options?: {
  includeRegion?: boolean;
  includeCohort?: boolean;
}): AnonymousMetric {
  const { metadata, ...baseMetric } = metric;
  
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
  };
}

/**
 * Generate anonymous identifier from original ID
 */
function generateAnonymousId(id: string): string {
  // Simple hash function - in production, use crypto.createHash
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `anon_${Math.abs(hash).toString(36)}`;
}

/**
 * Extract region information from metadata
 */
function extractRegion(metadata?: Record<string, unknown>): string | undefined {
  if (!metadata) return undefined;
  
  // Extract city/state level information, avoiding specific addresses
  const location = metadata.location as any;
  if (location?.state && location?.city) {
    return `${location.city}, ${location.state}`;
  }
  
  return location?.state || location?.region;
}

/**
 * Extract demographic cohort from metadata
 */
function extractCohort(metadata?: Record<string, unknown>): string | undefined {
  if (!metadata) return undefined;
  
  // Extract generalized demographic information
  const demographics = metadata.demographics as any;
  if (demographics?.ageRange) {
    return `age_${demographics.ageRange}`;
  }
  
  return undefined;
}