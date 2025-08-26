/**
 * Performance Monitoring Types
 *
 * TypeScript definitions for performance monitoring
 * and healthcare-specific metrics.
 */

import type { Metric } from "web-vitals";

/**
 * Web Vitals metric names
 */
export type WebVitalName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

/**
 * Healthcare-specific performance metric names
 */
export type HealthcareMetricName =
  | "patient_search_time"
  | "form_submission_time"
  | "data_encryption_time"
  | "database_query_time"
  | "image_upload_time"
  | "report_generation_time"
  | "auth_verification_time"
  | "compliance_check_time";

/**
 * Custom metric type
 */
export interface CustomMetric {
  name: HealthcareMetricName;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta?: number;
  entries?: PerformanceEntry[];
  id?: string;
  navigationType?: string;
  timestamp?: number;
  context?: {
    userId?: string;
    sessionId?: string;
    patientId?: string;
    procedureId?: string;
    feature?: string;
    environment?: string;
    userRole?: "patient" | "doctor" | "nurse" | "admin" | "receptionist";
  };
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  webVitals: {
    [K in WebVitalName]: {
      good: number;
      needsImprovement: number;
    };
  };
  healthcare: {
    [K in HealthcareMetricName]: {
      good: number;
      needsImprovement: number;
    };
  };
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  thresholds: PerformanceThresholds;
  sampling: {
    webVitals: number; // 0-1, percentage of sessions to monitor
    customMetrics: number;
    errors: number;
  };
  endpoints: {
    metrics: string;
    errors: string;
    vitals: string;
  };
  context: {
    includeUserInfo: boolean;
    includePatientInfo: boolean;
    includeEnvironmentInfo: boolean;
  };
  privacy: {
    hashSensitiveData: boolean;
    excludeFields: string[];
    retentionDays: number;
  };
}

/**
 * Performance alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  thresholds: {
    errorRate: number; // Percentage
    responseTime: number; // Milliseconds
    customMetricThreshold: number;
  };
  channels: {
    email?: string[];
    slack?: string;
    webhook?: string;
  };
  conditions: {
    minSampleSize: number;
    timeWindow: number; // Minutes
  };
}

/**
 * Healthcare-specific monitoring context
 */
export interface HealthcareContext {
  feature:
    | "patient-management"
    | "procedures"
    | "compliance"
    | "reports"
    | "auth";
  sensitivity: "low" | "medium" | "high" | "critical";
  complianceLevel: "basic" | "healthcare" | "anvisa" | "cfm";
  userRole: "patient" | "doctor" | "nurse" | "admin" | "receptionist";
}

/**
 * Performance report data
 */
export interface PerformanceReport {
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    totalSessions: number;
    averageLoadTime: number;
    errorRate: number;
    topIssues: string[];
  };
  webVitals: {
    [K in WebVitalName]: {
      p50: number;
      p75: number;
      p90: number;
      p95: number;
      samples: number;
    };
  };
  customMetrics: {
    [K in HealthcareMetricName]?: {
      average: number;
      median: number;
      p95: number;
      samples: number;
      trend: "improving" | "degrading" | "stable";
    };
  };
  alerts: {
    type: "error_rate" | "performance" | "availability";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[];
}

/**
 * Raw error information from browser
 */
export interface ErrorInfo {
  message: string;
  filename: string;
  lineno: number;
  colno: number;
  error?: Error;
}

/**
 * Error tracking data
 */
export interface ErrorEvent {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  context?: HealthcareContext;
  severity: "info" | "warning" | "error" | "fatal";
  fingerprint: string;
  tags: Record<string, string>;
}

/**
 * Resource timing data
 */
export interface ResourceData {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

/**
 * Compliance report structure
 */
export interface ComplianceReport {
  timestamp: string;
  overall_score: number;
  security: {
    mfaAdoption: number;
    passwordCompliance: number;
    dataEncryption: number;
  };
  privacy: {
    lgpdCompliance: number;
    dataMinimization: number;
    consentTracking: number;
  };
  healthcare: {
    anvisaCompliance: number;
    cfmCompliance: number;
    hipaaCompliance: number;
  };
  performance: {
    errorRate: number;
    avgResponseTime: number;
    uptime: number;
  };
  lgpd: {
    consentRate: number;
    dataMinimization: number;
    rightsRequests: number;
  };
  recommendations: string[];
}

/**
 * Dashboard metrics structure
 */
export interface DashboardMetrics {
  timestamp: string;
  healthScore: number;
  complianceScore: number;
  performanceScore: number;
  securityScore: number;
  trends: Record<string, number[]>;
  insights: Record<string, string>;
}

/**
 * Alert data structure
 */
export interface AlertData {
  type: "error_rate" | "performance" | "availability";
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  resolved: boolean;
}

/**
 * Compliance status structure
 */
export interface ComplianceStatus {
  lgpd: { status: string; lastCheck: Date; score: number };
  anvisa: { status: string; lastCheck: Date; score: number };
  cfm: { status: string; lastCheck: Date; score: number };
  security: { status: string; lastCheck: Date; score: number };
}

/**
 * Compliance metrics structure
 */
export interface ComplianceMetrics {
  score: number;
  details: {
    dataProtection: number;
    consentManagement: number;
    dataMinimization: number;
    rightsManagement: number;
  };
  lastUpdated: Date;
}

/**
 * Performance monitoring hooks configuration
 */
export interface MonitoringHooks {
  onMetric?: (metric: Metric | CustomMetric) => void;
  onError?: (error: ErrorEvent) => void;
  onAlert?: (alert: Record<string, unknown>) => void;
  beforeSend?: (
    data: Record<string, unknown>,
  ) => Record<string, unknown> | null;
  afterSend?: (response: Response) => void;
}
