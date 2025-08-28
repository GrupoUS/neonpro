/**
 * Healthcare Performance Monitoring & Metrics
 * Comprehensive monitoring for healthcare applications with LGPD compliance
 */

export interface HealthcareMetrics {
  // Patient Care Metrics
  patientDataAccessTime: number;
  appointmentBookingSuccessRate: number;
  emergencyAccessResponseTime: number;

  // Compliance Metrics
  auditLogCompleteness: number;
  dataRetentionCompliance: boolean;
  consentValidationRate: number;

  // System Performance
  apiResponseTimes: ResponseTimeMetrics;
  databaseQueryPerformance: DatabaseMetrics;
  realTimeEventLatency: number;

  // Business Metrics
  systemAvailabilityUptime: number;
  userSessionDuration: number;
  featureUsageStatistics: UsageMetrics;
}

export interface ResponseTimeMetrics {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  avg: number;
  max: number;
}

export interface DatabaseMetrics {
  connectionPoolSize: number;
  activeConnections: number;
  queryExecutionTime: ResponseTimeMetrics;
  deadlockCount: number;
  cacheHitRatio: number;
}

export interface UsageMetrics {
  activeUsers: number;
  sessionsCreated: number;
  featuresUsed: Record<string, number>;
  errorRates: Record<string, number>;
}

export interface HealthCheckResult {
  name: string;
  passed: boolean;
  responseTime: number;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
