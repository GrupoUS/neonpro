// Performance Monitoring Types

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold?: number;
  status: "normal" | "warning" | "critical";
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface PerformanceKPI {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: "up" | "down" | "stable";
  change: number;
  description?: string;
}

export interface PerformanceReport {
  id: string;
  title: string;
  summary: string;
  metrics: PerformanceMetric[];
  kpis: PerformanceKPI[];
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PerformanceDashboardData {
  metrics: PerformanceMetric[];
  kpis: PerformanceKPI[];
  reports: PerformanceReport[];
  alerts: PerformanceAlert[];
  trends: PerformanceTrend[];
}
export interface PerformanceAlert {
  id: string;
  type: "warning" | "critical" | "info";
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  source: string;
}

export interface PerformanceTrend {
  metric: string;
  period: string;
  data: {
    timestamp: Date;
    value: number;
  }[];
  trend: "improving" | "stable" | "degrading";
}

export interface PerformanceThreshold {
  metricId: string;
  warning: number;
  critical: number;
  unit: string;
}

export interface PerformanceConfiguration {
  refreshInterval: number; // milliseconds
  retentionDays: number;
  thresholds: PerformanceThreshold[];
  enabledMetrics: string[];
  alertChannels: string[];
}

// Export all types
export type {
  PerformanceAlert,
  PerformanceConfiguration,
  PerformanceDashboardData,
  PerformanceKPI,
  PerformanceMetric,
  PerformanceReport,
  PerformanceThreshold,
  PerformanceTrend,
} from "./performance-monitoring";
