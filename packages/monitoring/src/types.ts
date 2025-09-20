export interface MetricValue {
  value: number;
  timestamp?: Date;
  labels?: MetricLabels;
}

export interface MetricLabels {
  [key: string]: string | number;
}

export interface TraceAttributes {
  [key: string]: string | number | boolean;
}

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

export interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
}

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  duration: number;
  message?: string;
  data?: unknown;
}

export interface MonitoringConfig {
  serviceName: string;
  serviceVersion: string;
  environment: string;
  metrics: {
    enabled: boolean;
    port?: number;
    endpoint?: string;
  };
  tracing: {
    enabled: boolean;
    jaegerEndpoint?: string;
    sampleRate?: number;
  };
  logging: {
    level: LogLevel;
    format: "json" | "pretty";
    transports: ("console" | "file")[];
  };
  health: {
    enabled: boolean;
    endpoint?: string;
    interval?: number;
  };
}
