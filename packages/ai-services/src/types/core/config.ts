/**
 * Configuration types for unified AI provider system
 */

import { z } from 'zod';

/**
 * Main configuration for AI provider system
 */
export interface AIProviderConfig {
  providers: ProviderConfig[];
  factory: FactoryConfig;
  monitoring: MonitoringConfig;
  compliance: ComplianceConfig;
  logging: LoggingConfig;
  caching: CachingConfig;
}

/**
 * Individual provider configuration
 */
export interface ProviderConfig {
  name: string;
  type: 'openai' | 'anthropic' | 'google' | 'custom';
  enabled: boolean;
  priority: number;
  apiKey: string;
  baseUrl?: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retries: number;
  retryDelay: number;
  capabilities: ProviderCapabilities;
  cost: ProviderCost;
  healthCheck: HealthCheckConfig;
  compliance: ProviderComplianceConfig;
  customSettings?: Record<string, any>;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
  textGeneration: boolean;
  streaming: boolean;
  functionCalling: boolean;
  vision: boolean;
  jsonMode: boolean;
  maxContextLength: number;
  supportedLanguages: string[];
  specialties: string[];
}

/**
 * Provider cost configuration
 */
export interface ProviderCost {
  inputTokenCost: number; // per 1K tokens
  outputTokenCost: number; // per 1K tokens
  currency: string;
  tier?: 'free' | 'basic' | 'pro' | 'enterprise';
  monthlyLimit?: number;
  dailyLimit?: number;
}

/**
 * Factory configuration
 */
export interface FactoryConfig {
  defaultProvider: string;
  fallbackEnabled: boolean;
  loadBalancing: LoadBalancingConfig;
  selectionStrategy: 'round-robin' | 'least-used' | 'fastest' | 'cost-optimized' | 'priority';
  failover: FailoverConfig;
}

/**
 * Load balancing configuration
 */
export interface LoadBalancingConfig {
  enabled: boolean;
  strategy: 'round-robin' | 'weighted' | 'least-connections' | 'fastest-response';
  weights?: Record<string, number>;
  healthCheckInterval: number;
  stickySessions: boolean;
}

/**
 * Failover configuration
 */
export interface FailoverConfig {
  enabled: boolean;
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
  circuitBreaker: CircuitBreakerConfig;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  resetTimeout: number;
  monitoringPeriod: number;
  expectedExceptionPredicate?: string[];
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  metrics: MetricsConfig;
  healthChecks: HealthCheckConfig;
  alerts: AlertConfig;
  dashboard: DashboardConfig;
}

/**
 * Metrics configuration
 */
export interface MetricsConfig {
  enabled: boolean;
  collectionInterval: number;
  retentionDays: number;
  exportTo: string[];
  customMetrics?: CustomMetric[];
}

/**
 * Custom metric definition
 */
export interface CustomMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  description: string;
  labels: string[];
  buckets?: number[];
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  enabled: boolean;
  channels: AlertChannel[];
  rules: AlertRule[];
}

/**
 * Alert rule definition
 */
export interface AlertRule {
  name: string;
  condition: string;
  threshold: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
  duration: number;
  message: string;
  enabled: boolean;
}

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  enabled: boolean;
  refreshInterval: number;
  charts: ChartConfig[];
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  title: string;
  type: 'line' | 'bar' | 'pie' | 'gauge' | 'heatmap';
  metrics: string[];
  timeframe: string;
  groupBy?: string;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error';
  format: 'json' | 'text' | 'pretty';
  outputs: LogOutput[];
  sensitiveDataMasking: boolean;
  requestLogging: boolean;
  responseLogging: boolean;
}

/**
 * Log output configuration
 */
export interface LogOutput {
  type: 'console' | 'file' | 'remote';
  destination: string;
  format?: string;
  level?: string;
}

/**
 * Caching configuration
 */
export interface CachingConfig {
  enabled: boolean;
  type: 'memory' | 'redis' | 'file';
  ttl: number;
  maxSize: number;
  compression: boolean;
  redis?: RedisConfig;
}

/**
 * Redis configuration
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  tls?: boolean;
}

/**
 * Provider-specific compliance configuration
 */
export interface ProviderComplianceConfig {
  enabled: boolean;
  piiRedaction: boolean;
  contentFiltering: boolean;
  auditLogging: boolean;
  dataAnonymization: boolean;
  customRules?: Record<string, any>;
}

/**
 * Zod schemas for validation
 */
export const AIProviderConfigSchema = z.object({
  providers: z.array(z.object({
    name: z.string().min(1),
    type: z.enum(['openai', 'anthropic', 'google', 'custom']),
    enabled: z.boolean().default(true),
    priority: z.number().int().min(1).max(100).default(10),
    apiKey: z.string().min(1),
    baseUrl: z.string().url().optional(),
    model: z.string().min(1),
    maxTokens: z.number().int().min(1).max(128000).default(4000),
    temperature: z.number().min(0).max(2).default(0.7),
    timeout: z.number().int().min(1000).max(60000).default(30000),
    retries: z.number().int().min(0).max(5).default(3),
    retryDelay: z.number().int().min(100).max(5000).default(1000),
    capabilities: z.object({
      textGeneration: z.boolean().default(true),
      streaming: z.boolean().default(false),
      functionCalling: z.boolean().default(false),
      vision: z.boolean().default(false),
      jsonMode: z.boolean().default(false),
      maxContextLength: z.number().int().min(1),
      supportedLanguages: z.array(z.string()).default(['en', 'pt-BR']),
      specialties: z.array(z.string()).default([]),
    }),
    cost: z.object({
      inputTokenCost: z.number().min(0),
      outputTokenCost: z.number().min(0),
      currency: z.string().default('USD'),
      tier: z.enum(['free', 'basic', 'pro', 'enterprise']).optional(),
      monthlyLimit: z.number().int().min(0).optional(),
      dailyLimit: z.number().int().min(0).optional(),
    }),
    healthCheck: z.object({
      enabled: z.boolean().default(true),
      intervalMs: z.number().int().min(1000).max(300000).default(30000),
      timeoutMs: z.number().int().min(1000).max(60000).default(5000),
      retryAttempts: z.number().int().min(0).max(5).default(3),
    }),
    compliance: z.object({
      enabled: z.boolean().default(true),
      piiRedaction: z.boolean().default(true),
      contentFiltering: z.boolean().default(true),
      auditLogging: z.boolean().default(true),
      dataAnonymization: z.boolean().default(false),
      customRules: z.record(z.any()).optional(),
    }),
    customSettings: z.record(z.any()).optional(),
  })),
  factory: z.object({
    defaultProvider: z.string().min(1),
    fallbackEnabled: z.boolean().default(true),
    loadBalancing: z.object({
      enabled: z.boolean().default(true),
      strategy: z.enum(['round-robin', 'weighted', 'least-connections', 'fastest-response']),
      weights: z.record(z.number()).optional(),
      healthCheckInterval: z.number().int().min(1000).max(300000).default(30000),
      stickySessions: z.boolean().default(false),
    }).optional(),
    selectionStrategy: z.enum(['round-robin', 'least-used', 'fastest', 'cost-optimized', 'priority']).default('priority'),
    failover: z.object({
      enabled: z.boolean().default(true),
      maxRetries: z.number().int().min(1).max(10).default(3),
      retryDelay: z.number().int().min(100).max(10000).default(1000),
      backoffMultiplier: z.number().min(1).max(5).default(2),
      circuitBreaker: z.object({
        enabled: z.boolean().default(true),
        failureThreshold: z.number().int().min(1).max(10).default(5),
        resetTimeout: z.number().int().min(1000).max(300000).default(60000),
        monitoringPeriod: z.number().int().min(1000).max(300000).default(300000),
        expectedExceptionPredicate: z.array(z.string()).optional(),
      }),
    }).optional(),
  }),
  monitoring: z.object({
    enabled: z.boolean().default(true),
    metrics: z.object({
      enabled: z.boolean().default(true),
      collectionInterval: z.number().int().min(1000).max(300000).default(10000),
      retentionDays: z.number().int().min(1).max(365).default(30),
      exportTo: z.array(z.string()).default([]),
      customMetrics: z.array(z.object({
        name: z.string(),
        type: z.enum(['counter', 'gauge', 'histogram', 'summary']),
        description: z.string(),
        labels: z.array(z.string()),
        buckets: z.array(z.number()).optional(),
      })).optional(),
    }),
    healthChecks: z.object({
      enabled: z.boolean().default(true),
      intervalMs: z.number().int().min(1000).max(300000).default(30000),
      timeoutMs: z.number().int().min(1000).max(60000).default(5000),
      retryAttempts: z.number().int().min(0).max(5).default(3),
    }),
    alerts: z.object({
      enabled: z.boolean().default(true),
      channels: z.array(z.object({
        type: z.enum(['email', 'webhook', 'slack', 'console']),
        destination: z.string(),
        enabled: z.boolean(),
        severity: z.array(z.enum(['info', 'warning', 'error', 'critical'])),
      })),
      rules: z.array(z.object({
        name: z.string(),
        condition: z.string(),
        threshold: z.number(),
        severity: z.enum(['info', 'warning', 'error', 'critical']),
        duration: z.number().int().min(0),
        message: z.string(),
        enabled: z.boolean(),
      })),
    }),
    dashboard: z.object({
      enabled: z.boolean().default(true),
      refreshInterval: z.number().int().min(1000).max(300000).default(5000),
      charts: z.array(z.object({
        title: z.string(),
        type: z.enum(['line', 'bar', 'pie', 'gauge', 'heatmap']),
        metrics: z.array(z.string()),
        timeframe: z.string(),
        groupBy: z.string().optional(),
      })),
    }),
  }),
  compliance: z.object({
    enabled: z.boolean().default(true),
    piiRedaction: z.boolean().default(true),
    auditLogging: z.boolean().default(true),
    dataRetentionDays: z.number().int().min(1).max(3650).default(365),
    frameworks: z.array(z.object({
      name: z.enum(['HIPAA', 'LGPD', 'ANVISA', 'CFM', 'CFF', 'CNEP', 'COREN']),
      enabled: z.boolean().default(true),
      region: z.string().optional(),
      additionalRules: z.record(z.any()).optional(),
    })).default([
      { name: 'LGPD', enabled: true, region: 'BR' },
      { name: 'ANVISA', enabled: true, region: 'BR' },
      { name: 'CFM', enabled: true, region: 'BR' },
    ]),
  }),
  logging: z.object({
    level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    format: z.enum(['json', 'text', 'pretty']).default('json'),
    outputs: z.array(z.object({
      type: z.enum(['console', 'file', 'remote']),
      destination: z.string(),
      format: z.string().optional(),
      level: z.string().optional(),
    })),
    sensitiveDataMasking: z.boolean().default(true),
    requestLogging: z.boolean().default(true),
    responseLogging: z.boolean().default(true),
  }),
  caching: z.object({
    enabled: z.boolean().default(true),
    type: z.enum(['memory', 'redis', 'file']).default('memory'),
    ttl: z.number().int().min(1000).max(86400000).default(3600000),
    maxSize: z.number().int().min(1).max(10000).default(1000),
    compression: z.boolean().default(true),
    redis: z.object({
      host: z.string(),
      port: z.number().int().min(1).max(65535),
      password: z.string().optional(),
      db: z.number().int().min(0).max(15).default(0),
      keyPrefix: z.string().default('ai-provider:'),
      tls: z.boolean().default(false),
    }).optional(),
  }),
});

export type AIProviderConfigType = z.infer<typeof AIProviderConfigSchema>;
export type ProviderConfigType = z.infer<typeof AIProviderConfigSchema.shape.providers.element>;
export type FactoryConfigType = z.infer<typeof AIProviderConfigSchema.shape.factory>;
export type MonitoringConfigType = z.infer<typeof AIProviderConfigSchema.shape.monitoring>;
export type ComplianceConfigType = z.infer<typeof AIProviderConfigSchema.shape.compliance>;
export type LoggingConfigType = z.infer<typeof AIProviderConfigSchema.shape.logging>;
export type CachingConfigType = z.infer<typeof AIProviderConfigSchema.shape.caching>;