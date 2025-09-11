/**
 * Web Vitals Types for NeonPro Healthcare Analytics
 */

export interface WebVitalMetric {
  name: string;
  value: number;
  delta?: number;
  id: string;
  url?: string;
  pathname?: string;
  userAgent?: string;
  connectionType?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  isPatientView?: boolean;
  isAppointmentView?: boolean;
  isMedicalRecordView?: boolean;
}

export interface MetricEntry extends WebVitalMetric {
  id: string;
  metric: string;
  originId?: string;
  sessionId: string;
  userId: string | null;
  timestamp: string;
  clinicId: string | null;
  requestId: string;
}

export interface SessionInfo {
  sessionId: string;
  userId: string | null;
  startTime: string;
  lastActivity: string;
  metricsCount: number;
  urls: Set<string>;
}

export interface PerformanceThresholds {
  LCP: { good: number; poor: number };
  FID: { good: number; poor: number };
  CLS: { good: number; poor: number };
  FCP: { good: number; poor: number };
  TTFB: { good: number; poor: number };
}

export interface MetricAnalysis {
  metric: string;
  count: number;
  avg: number;
  p50: number;
  p90: number;
  p95: number;
}

export interface SessionMetrics {
  sessionId: string;
  userId: string | null;
  startTime: string;
  lastActivity: string;
  metricsCount: number;
  urls: string[];
  metrics: MetricEntry[];
}