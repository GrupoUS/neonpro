export interface PerformanceMetric {
  id: string;
  timestamp: number;
  type: MetricType;
  value: number;
  unit: MetricUnit;
  tags: Record<string, string>;
  source: string;
  context?: Record<string, any>;
}

export enum MetricType {
  CACHE_HIT_RATE = 'cache_hit_rate',
  CACHE_MISS_RATE = 'cache_miss_rate',
  RESPONSE_TIME = 'response_time',
  ERROR_RATE = 'error_rate',
  THROUGHPUT = 'throughput',
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage',
  DATABASE_QUERIES = 'database_queries',
  AI_API_CALLS = 'ai_api_calls',
  AI_COST = 'ai_cost',
  LGPD_VIOLATIONS = 'lgpd_violations',
  ANVISA_COMPLIANCE = 'anvisa_compliance',
  BUSINESS_ROI = 'business_roi',
}

export enum MetricUnit {
  PERCENTAGE = 'percentage',
  MILLISECONDS = 'ms',
  COUNT = 'count',
  BYTES = 'bytes',
  REQUESTS_PER_SECOND = 'rps',
  COST_USD = 'usd',
  SCORE = 'score',
}

export interface MetricCollector {
  collect(): Promise<PerformanceMetric[]>;
  getMetricType(): MetricType;
  isEnabled(): boolean;
  getCollectionInterval(): number; // milliseconds
}

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metricType: MetricType;
  condition: AlertCondition;
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldownPeriod: number; // seconds
}

export enum AlertCondition {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Alert {
  id: string;
  ruleId: string;
  timestamp: number;
  severity: AlertSeverity;
  message: string;
  metric: PerformanceMetric;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
}

export interface HealthCheckResult {
  component: string;
  status: HealthStatus;
  message: string;
  responseTime: number;
  details?: Record<string, any>;
  timestamp: number;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  CRITICAL = 'critical',
}

export interface PerformanceInsight {
  id: string;
  timestamp: number;
  type: InsightType;
  severity: AlertSeverity;
  title: string;
  description: string;
  recommendation: string;
  metrics: PerformanceMetric[];
  potentialImpact: string;
  estimatedROI?: number;
}

export enum InsightType {
  OPTIMIZATION_OPPORTUNITY = 'optimization',
  PERFORMANCE_DEGRADATION = 'degradation',
  COST_OPTIMIZATION = 'cost',
  SECURITY_CONCERN = 'security',
  COMPLIANCE_ISSUE = 'compliance',
}
