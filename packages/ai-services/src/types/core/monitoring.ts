/**
 * Monitoring and health check types for unified AI provider system
 */

import { z } from 'zod';

/**
 * Provider health status
 */
export interface ProviderHealth {
  isHealthy: boolean;
  responseTime: number;
  lastCheck: Date;
  error?: string;
  details?: HealthDetails;
}

/**
 * Detailed health information
 */
export interface HealthDetails {
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  activeConnections: number;
  queueLength: number;
  errorRate: number;
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
  enabled: boolean;
  intervalMs: number;
  timeoutMs: number;
  retryAttempts: number;
  alerts: HealthAlertConfig;
}

/**
 * Health alert configuration
 */
export interface HealthAlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  thresholds: AlertThresholds;
}

/**
 * Alert channel configuration
 */
export interface AlertChannel {
  type: 'email' | 'webhook' | 'slack' | 'console';
  destination: string;
  enabled: boolean;
  severity: AlertSeverity[];
}

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';

/**
 * Alert thresholds
 */
export interface AlertThresholds {
  responseTime: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  consecutiveFailures: number;
}

/**
 * Alert notification
 */
export interface AlertNotification {
  id: string;
  timestamp: Date;
  provider: string;
  severity: AlertSeverity;
  type: AlertType;
  message: string;
  details: Record<string, any>;
  acknowledged: boolean;
  resolvedAt?: Date;
}

/**
 * Alert types
 */
export type AlertType = 
  | 'provider_down'
  | 'slow_response'
  | 'high_error_rate'
  | 'memory_usage'
  | 'cpu_usage'
  | 'quota_exceeded'
  | 'rate_limit'
  | 'compliance_violation';

/**
 * Provider metrics
 */
export interface ProviderMetrics {
  provider: string;
  timestamp: Date;
  requests: {
    total: number;
    successful: number;
    failed: number;
  };
  responseTime: {
    min: number;
    max: number;
    average: number;
    p95: number;
    p99: number;
  };
  tokens: {
    prompt: number;
    completion: number;
    total: number;
    cost: number;
  };
  errors: {
    count: number;
    rate: number;
    topErrors: ErrorMetric[];
  };
}

/**
 * Error metric details
 */
export interface ErrorMetric {
  error: string;
  count: number;
  lastSeen: Date;
}

/**
 * Statistics snapshot
 */
export interface StatisticsSnapshot {
  period: {
    start: Date;
    end: Date;
  };
  providers: ProviderMetrics[];
  summary: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

/**
 * Zod schemas for validation
 */
export const ProviderHealthSchema = z.object({
  isHealthy: z.boolean(),
  responseTime: z.number(),
  lastCheck: z.date(),
  error: z.string().optional(),
  details: z.object({
    uptime: z.number(),
    memoryUsage: z.object({
      rss: z.number(),
      heapTotal: z.number(),
      heapUsed: z.number(),
      external: z.number(),
      arrayBuffers: z.number(),
    }),
    cpuUsage: z.object({
      user: z.number(),
      system: z.number(),
    }),
    activeConnections: z.number(),
    queueLength: z.number(),
    errorRate: z.number(),
  }).optional(),
});

export const HealthCheckConfigSchema = z.object({
  enabled: z.boolean().default(true),
  intervalMs: z.number().int().min(1000).max(300000).default(30000),
  timeoutMs: z.number().int().min(1000).max(60000).default(5000),
  retryAttempts: z.number().int().min(0).max(5).default(3),
  alerts: z.object({
    enabled: z.boolean().default(true),
    channels: z.array(z.object({
      type: z.enum(['email', 'webhook', 'slack', 'console']),
      destination: z.string(),
      enabled: z.boolean(),
      severity: z.array(z.enum(['info', 'warning', 'error', 'critical'])),
    })),
    thresholds: z.object({
      responseTime: z.number().min(100),
      errorRate: z.number().min(0).max(1),
      memoryUsage: z.number().min(0).max(1),
      cpuUsage: z.number().min(0).max(1),
      consecutiveFailures: z.number().int().min(1),
    }),
  }),
});

export const AlertNotificationSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  provider: z.string(),
  severity: z.enum(['info', 'warning', 'error', 'critical']),
  type: z.enum([
    'provider_down',
    'slow_response',
    'high_error_rate',
    'memory_usage',
    'cpu_usage',
    'quota_exceeded',
    'rate_limit',
    'compliance_violation',
  ]),
  message: z.string(),
  details: z.record(z.any()),
  acknowledged: z.boolean(),
  resolvedAt: z.date().optional(),
});

export const ProviderMetricsSchema = z.object({
  provider: z.string(),
  timestamp: z.date(),
  requests: z.object({
    total: z.number().int().min(0),
    successful: z.number().int().min(0),
    failed: z.number().int().min(0),
  }),
  responseTime: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    average: z.number().min(0),
    p95: z.number().min(0),
    p99: z.number().min(0),
  }),
  tokens: z.object({
    prompt: z.number().int().min(0),
    completion: z.number().int().min(0),
    total: z.number().int().min(0),
    cost: z.number().min(0),
  }),
  errors: z.object({
    count: z.number().int().min(0),
    rate: z.number().min(0).max(1),
    topErrors: z.array(z.object({
      error: z.string(),
      count: z.number().int().min(0),
      lastSeen: z.date(),
    })),
  }),
});

export type ProviderHealthType = z.infer<typeof ProviderHealthSchema>;
export type HealthCheckConfigType = z.infer<typeof HealthCheckConfigSchema>;
export type AlertNotificationType = z.infer<typeof AlertNotificationSchema>;
export type ProviderMetricsType = z.infer<typeof ProviderMetricsSchema>;