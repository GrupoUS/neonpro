/**
 * Consolidated Types for NeonPro Healthcare Performance Monitoring
 * =================================================================
 *
 * Type definitions for all monitoring functionality including:
 * - Web Vitals with healthcare optimization
 * - Real-time metrics streaming
 * - AI/Cache/System metrics collection
 * - Healthcare compliance and audit trails
 */

// ============================================================================
// BASE TYPES
// ============================================================================

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  unit?: string;
  category: "web-vitals" | "ai-metrics" | "cache-metrics" | "system-metrics" | "database-metrics";
  metadata?: Record<string, unknown>;
}

export interface HealthcareContext {
  clinicId?: string;
  userId?: string;
  patientId?: string;
  workflowType?:
    | "patient-registration"
    | "medical-form"
    | "procedure-scheduling"
    | "medical-history"
    | "real-time-update";
  deviceType?: "desktop" | "tablet" | "mobile";
  networkConnection?: "fast" | "slow" | "offline";
}

// ============================================================================
// WEB VITALS TYPES
// ============================================================================

export interface WebVitalsMetric extends PerformanceMetric {
  category: "web-vitals";
  name: "CLS" | "FCP" | "FID" | "LCP" | "TTFB" | "INP";
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  id: string;
}

export interface HealthcareVitalsMetric extends WebVitalsMetric, HealthcareContext {
  criticalPath: boolean;
  complianceCategory?: "lgpd-sensitive" | "anvisa-regulated" | "cfm-controlled";
}

export interface PerformanceThresholds {
  CLS: { good: number; poor: number; };
  FCP: { good: number; poor: number; };
  FID: { good: number; poor: number; };
  LCP: { good: number; poor: number; };
  TTFB: { good: number; poor: number; };
  INP: { good: number; poor: number; };

  // Healthcare-specific thresholds
  patientLookup: { good: number; poor: number; };
  medicalFormLoad: { good: number; poor: number; };
  procedureScheduling: { good: number; poor: number; };
  realTimeUpdate: { good: number; poor: number; };
}

export type PerformanceEventHandler = (metric: HealthcareVitalsMetric) => void;

// ============================================================================
// AI METRICS TYPES
// ============================================================================

export interface AIMetric extends PerformanceMetric {
  category: "ai-metrics";
  name:
    | "inference-time"
    | "model-accuracy"
    | "training-loss"
    | "prediction-confidence"
    | "data-drift";
  modelId?: string;
  modelVersion?: string;
  inputSize?: number;
  outputSize?: number;
}

export interface AIPerformanceConfig {
  modelMonitoring: boolean;
  driftDetection: boolean;
  accuracyThreshold: number;
  inferenceTimeThreshold: number;
  confidenceThreshold: number;
}

// ============================================================================
// CACHE METRICS TYPES
// ============================================================================

export interface CacheMetric extends PerformanceMetric {
  category: "cache-metrics";
  name: "hit-rate" | "miss-rate" | "eviction-rate" | "memory-usage" | "response-time";
  cacheLayer: "browser" | "edge" | "supabase" | "ai-context";
  hitCount?: number;
  missCount?: number;
  totalRequests?: number;
}

export interface CachePerformanceConfig {
  hitRateThreshold: number;
  responseTimeThreshold: number;
  memoryUsageThreshold: number;
  evictionRateThreshold: number;
}

// ============================================================================
// SYSTEM METRICS TYPES
// ============================================================================

export interface SystemMetric extends PerformanceMetric {
  category: "system-metrics";
  name: "cpu-usage" | "memory-usage" | "disk-usage" | "network-latency" | "error-rate";
  resourceType: "cpu" | "memory" | "disk" | "network" | "application";
  usage?: number;
  capacity?: number;
  utilizationPercentage?: number;
}

export interface SystemPerformanceConfig {
  cpuThreshold: number;
  memoryThreshold: number;
  diskThreshold: number;
  networkLatencyThreshold: number;
  errorRateThreshold: number;
}

// ============================================================================
// DATABASE METRICS TYPES
// ============================================================================

export interface DatabaseMetric extends PerformanceMetric {
  category: "database-metrics";
  name: "query-time" | "connection-count" | "transaction-rate" | "cache-hit-rate" | "row-count";
  queryType?: "select" | "insert" | "update" | "delete";
  tableId?: string;
  indexUsed?: boolean;
  executionPlan?: string;
}

export interface DatabasePerformanceConfig {
  queryTimeThreshold: number;
  connectionCountThreshold: number;
  cacheHitRateThreshold: number;
  slowQueryLogging: boolean;
}

// ============================================================================
// REAL-TIME STREAMING TYPES
// ============================================================================

export interface RealtimeMetricEvent {
  type: "metric-update" | "alert" | "threshold-exceeded" | "system-health";
  metric: PerformanceMetric;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
  clinicId?: string;
  userId?: string;
}

export interface SupabaseStreamingConfig {
  projectId: string;
  clinicId?: string;
  tableName?: string;
  enableCompression?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

// ============================================================================
// MONITORING CONFIGURATION
// ============================================================================

export interface ConsolidatedMonitoringConfig extends HealthcareContext {
  // Core settings
  enabled: boolean;
  realtimeEnabled: boolean;
  healthcareCompliance: boolean;
  auditTrailEnabled: boolean;

  // Feature flags
  webVitalsEnabled: boolean;
  aiMetricsEnabled: boolean;
  cacheMetricsEnabled: boolean;
  systemMetricsEnabled: boolean;
  databaseMetricsEnabled?: boolean;

  // Configuration
  supabaseProjectId: string;
  collectInterval: number;
  batchSize?: number;

  // Thresholds
  webVitalsThresholds?: Partial<PerformanceThresholds>;
  aiConfig?: Partial<AIPerformanceConfig>;
  cacheConfig?: Partial<CachePerformanceConfig>;
  systemConfig?: Partial<SystemPerformanceConfig>;
  databaseConfig?: Partial<DatabasePerformanceConfig>;
}

// ============================================================================
// ALERT AND NOTIFICATION TYPES
// ============================================================================

export interface PerformanceAlert {
  id: string;
  type:
    | "threshold-exceeded"
    | "system-down"
    | "performance-degradation"
    | "healthcare-compliance-violation";
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  metric: PerformanceMetric;
  threshold?: number;
  timestamp: string;
  acknowledged: boolean;
  clinicId?: string;
  userId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  metricName: string;
  operator: "gt" | "lt" | "eq" | "gte" | "lte";
  threshold: number;
  severity: PerformanceAlert["severity"];
  enabled: boolean;
  cooldownPeriod?: number; // minutes
  healthcareCategory?: "patient-safety" | "data-privacy" | "system-availability" | "compliance";
}

// ============================================================================
// DASHBOARD AND REPORTING TYPES
// ============================================================================

export interface PerformanceDashboardData {
  webVitals: {
    current: WebVitalsMetric[];
    trends: { timestamp: string; value: number; }[];
    alerts: PerformanceAlert[];
  };
  aiMetrics: {
    current: AIMetric[];
    modelPerformance: { modelId: string; accuracy: number; responseTime: number; }[];
    driftDetection: { timestamp: string; driftScore: number; }[];
  };
  cacheMetrics: {
    current: CacheMetric[];
    hitRates: { layer: string; hitRate: number; }[];
    performance: { timestamp: string; responseTime: number; }[];
  };
  systemMetrics: {
    current: SystemMetric[];
    resourceUsage: { resource: string; usage: number; capacity: number; }[];
    healthStatus: "healthy" | "warning" | "critical";
  };
  lastUpdated: string;
  clinicId?: string;
}

export interface PerformanceReport {
  id: string;
  title: string;
  generatedAt: string;
  period: { start: string; end: string; };
  summary: {
    totalMetrics: number;
    alertsGenerated: number;
    averagePerformance: number;
    complianceScore: number;
  };
  sections: {
    webVitals: any;
    aiPerformance: any;
    cacheEfficiency: any;
    systemHealth: any;
  };
  recommendations: string[];
  clinicId?: string;
}

// ============================================================================
// COLLECTOR INTERFACE
// ============================================================================

export interface MetricCollector {
  name: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  getLatestMetrics(): Promise<PerformanceMetric[]>;
  onMetric?(handler: (metric: PerformanceMetric) => void): void;
  setHealthcareContext?(context: HealthcareContext): void;
}

// ============================================================================
// HEALTHCARE COMPLIANCE TYPES
// ============================================================================

export interface HealthcareComplianceMetric extends PerformanceMetric {
  complianceCategory: "lgpd-data-access" | "anvisa-audit-trail" | "cfm-patient-privacy";
  sensitivityLevel: "public" | "internal" | "confidential" | "restricted";
  accessPattern: "read" | "write" | "update" | "delete";
  dataSubject?: "patient" | "healthcare-professional" | "clinic" | "system";
  retentionPeriod?: number; // days
}

export interface LGPDComplianceConfig {
  enabled: boolean;
  auditTrailRetention: number; // days
  dataSubjectRights: boolean;
  consentManagement: boolean;
  dataMinimization: boolean;
}

export interface ANVISAComplianceConfig {
  enabled: boolean;
  adverseEventReporting: boolean;
  productTraceability: boolean;
  qualitySystemCompliance: boolean;
  regulatoryReporting: boolean;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type HealthCheckResult = {
  status: "healthy" | "degraded" | "unhealthy";
  checks: {
    name: string;
    status: "pass" | "fail" | "warn";
    responseTime?: number;
    error?: string;
  }[];
  timestamp: string;
};

export type PerformanceInsight = {
  type: "optimization" | "alert" | "trend" | "anomaly";
  title: string;
  description: string;
  impact: "low" | "medium" | "high" | "critical";
  recommendation: string;
  metrics: PerformanceMetric[];
  timestamp: string;
};
