/**
 * Performance Monitoring Types
 *
 * TypeScript definitions for performance monitoring
 * and healthcare-specific metrics.
 */

import type { Metric } from 'web-vitals';

/**
 * Web Vitals metric names
 */
export type WebVitalName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB';

/**
 * Healthcare-specific performance metric names
 */
export type HealthcareMetricName =
  | 'patient_search_time'
  | 'form_submission_time'
  | 'data_encryption_time'
  | 'database_query_time'
  | 'image_upload_time'
  | 'report_generation_time'
  | 'auth_verification_time'
  | 'compliance_check_time';

/**
 * Custom metric type
 */
export type CustomMetric = {
  name: HealthcareMetricName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
  id?: string;
  navigationType?: string;
  timestamp?: number;
  context?: {
    userId?: string;
    patientId?: string;
    procedureId?: string;
    feature?: string;
    environment?: string;
  };
};

/**
 * Performance threshold configuration
 */
export type PerformanceThresholds = {
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
};

/**
 * Monitoring configuration
 */
export type MonitoringConfig = {
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
};

/**
 * Performance alert configuration
 */
export type AlertConfig = {
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
};

/**
 * Healthcare-specific monitoring context
 */
export type HealthcareContext = {
  feature:
    | 'patient-management'
    | 'procedures'
    | 'compliance'
    | 'reports'
    | 'auth';
  sensitivity: 'low' | 'medium' | 'high' | 'critical';
  complianceLevel: 'basic' | 'healthcare' | 'anvisa' | 'cfm';
  userRole: 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist';
};

/**
 * Performance report data
 */
export type PerformanceReport = {
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
      trend: 'improving' | 'degrading' | 'stable';
    };
  };
  alerts: Array<{
    type: 'error_rate' | 'performance' | 'availability';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
};

/**
 * Error tracking data
 */
export type ErrorEvent = {
  id: string;
  message: string;
  stack?: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  userId?: string;
  context?: HealthcareContext;
  severity: 'info' | 'warning' | 'error' | 'fatal';
  fingerprint: string;
  tags: Record<string, string>;
};

/**
 * Performance monitoring hooks configuration
 */
export type MonitoringHooks = {
  onMetric?: (metric: Metric | CustomMetric) => void;
  onError?: (error: ErrorEvent) => void;
  onAlert?: (alert: any) => void;
  beforeSend?: (data: any) => any | null;
  afterSend?: (response: any) => void;
};
