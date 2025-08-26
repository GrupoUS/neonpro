/**
 * Performance Monitoring Types
 * TypeScript definitions for performance monitoring and healthcare-specific metrics.
 */

import type { Metric } from "web-vitals";

// Core types
type WebVitalName = "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";

type HealthcareMetricName =
  | "auth_verification_time"
  | "compliance_check_time"
  | "data_encryption_time"
  | "database_query_time"
  | "form_submission_time"
  | "image_upload_time"
  | "patient_search_time"
  | "report_generation_time";

interface CustomMetric {
  context?: {
    environment?: string;
    feature?: string;
    patientId?: string;
    procedureId?: string;
    sessionId?: string;
    userId?: string;
    userRole?: "patient" | "doctor" | "nurse" | "admin" | "receptionist";
  };
  delta?: number;
  entries?: PerformanceEntry[];
  id?: string;
  name: HealthcareMetricName;
  navigationType?: string;
  rating: "good" | "needs-improvement" | "poor";
  timestamp?: number;
  value: number;
}

interface PerformanceThresholds {
  healthcare: {
    [K in HealthcareMetricName]: {
      good: number;
      needsImprovement: number;
    };
  };
  webVitals: {
    [K in WebVitalName]: {
      good: number;
      needsImprovement: number;
    };
  };
}

interface MonitoringConfig {
  context: {
    includeEnvironmentInfo: boolean;
    includePatientInfo: boolean;
    includeUserInfo: boolean;
  };
  enabled: boolean;
  endpoints: {
    errors: string;
    metrics: string;
    vitals: string;
  };
  privacy: {
    excludeFields: string[];
    hashSensitiveData: boolean;
    retentionDays: number;
  };
  sampling: {
    customMetrics: number;
    errors: number;
    webVitals: number;
  };
  thresholds: PerformanceThresholds;
}

interface AlertConfig {
  channels: {
    email?: string[];
    slack?: string;
    webhook?: string;
  };
  conditions: {
    minSampleSize: number;
    timeWindow: number;
  };
  enabled: boolean;
  thresholds: {
    customMetricThreshold: number;
    errorRate: number;
    responseTime: number;
  };
}

interface HealthcareContext {
  complianceLevel: "basic" | "healthcare" | "anvisa" | "cfm";
  feature: "patient-management" | "procedures" | "compliance" | "reports" | "auth";
  sensitivity: "low" | "medium" | "high" | "critical";
  userRole: "patient" | "doctor" | "nurse" | "admin" | "receptionist";
}

interface PerformanceReport {
  alerts: {
    message: string;
    resolved: boolean;
    severity: "low" | "medium" | "high" | "critical";
    timestamp: Date;
    type: "error_rate" | "performance" | "availability";
  }[];
  customMetrics: {
    [K in HealthcareMetricName]?: {
      average: number;
      median: number;
      p95: number;
      samples: number;
      trend: "improving" | "degrading" | "stable";
    };
  };
  period: {
    end: Date;
    start: Date;
  };
  summary: {
    averageLoadTime: number;
    errorRate: number;
    topIssues: string[];
    totalSessions: number;
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
}

interface ErrorInfo {
  colno: number;
  error?: Error;
  filename: string;
  lineno: number;
  message: string;
}

interface ErrorEvent {
  context?: HealthcareContext;
  fingerprint: string;
  id: string;
  message: string;
  severity: "info" | "warning" | "error" | "fatal";
  stack?: string;
  tags: Record<string, string>;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
}

interface ResourceData {
  duration: number;
  name: string;
  size: number;
  startTime: number;
  type: string;
}

interface ComplianceReport {
  healthcare: {
    anvisaCompliance: number;
    cfmCompliance: number;
    hipaaCompliance: number;
  };
  lgpd: {
    consentRate: number;
    dataMinimization: number;
    rightsRequests: number;
  };
  overall_score: number;
  performance: {
    avgResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  privacy: {
    consentTracking: number;
    dataMinimization: number;
    lgpdCompliance: number;
  };
  recommendations: string[];
  security: {
    dataEncryption: number;
    mfaAdoption: number;
    passwordCompliance: number;
  };
  timestamp: string;
}

interface DashboardMetrics {
  complianceScore: number;
  healthScore: number;
  insights: Record<string, string>;
  performanceScore: number;
  securityScore: number;
  timestamp: string;
  trends: Record<string, number[]>;
}

interface AlertData {
  message: string;
  resolved: boolean;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  type: "error_rate" | "performance" | "availability";
}

interface ComplianceStatus {
  anvisa: { lastCheck: Date; score: number; status: string };
  cfm: { lastCheck: Date; score: number; status: string };
  lgpd: { lastCheck: Date; score: number; status: string };
  security: { lastCheck: Date; score: number; status: string };
}

interface ComplianceMetrics {
  details: {
    consentManagement: number;
    dataMinimization: number;
    dataProtection: number;
    rightsManagement: number;
  };
  lastUpdated: Date;
  score: number;
}

interface MonitoringHooks {
  afterSend?: (response: Response) => void;
  beforeSend?: (data: Record<string, unknown>) => Record<string, unknown> | null;
  onAlert?: (alert: Record<string, unknown>) => void;
  onError?: (error: ErrorEvent) => void;
  onMetric?: (metric: Metric | CustomMetric) => void;
}

// Export all types together
export type {
  AlertConfig,
  AlertData,
  ComplianceMetrics,
  ComplianceReport,
  ComplianceStatus,
  CustomMetric,
  DashboardMetrics,
  ErrorEvent,
  ErrorInfo,
  HealthcareContext,
  HealthcareMetricName,
  MonitoringConfig,
  MonitoringHooks,
  PerformanceReport,
  PerformanceThresholds,
  ResourceData,
  WebVitalName,
};