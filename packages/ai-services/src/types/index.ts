/**
 * Main types export for unified AI provider system
 */

// Core types
export * from './core/provider';
export * from './core/compliance';
export * from './core/monitoring';
export * from './core/errors';
export * from './core/config';

// Legacy types for backward compatibility
export * from './legacy';

// Type utilities and helpers
export * from './utils';

// Version information
export const TYPES_VERSION = '2.3.0';

// Type guards
export type ProviderType = 'openai' | 'anthropic' | 'google' | 'custom';
export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';
export type ComplianceFramework = 'HIPAA' | 'LGPD' | 'ANVISA' | 'CFM' | 'CFF' | 'CNEP' | 'COREN';

// Common interfaces that span multiple domains
export interface SystemInfo {
  version: string;
  uptime: number;
  providers: string[];
  activeProviders: string[];
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  lastUpdated: Date;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  providers: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  services: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
  issues: HealthIssue[];
  lastCheck: Date;
}

export interface HealthIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  component: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface UsageStatistics {
  period: {
    start: Date;
    end: Date;
  };
  requests: {
    total: number;
    successful: number;
    failed: number;
    byProvider: Record<string, { total: number; successful: number; failed: number }>;
  };
  tokens: {
    total: number;
    byProvider: Record<string, { prompt: number; completion: number; total: number }>;
  };
  cost: {
    total: number;
    byProvider: Record<string, number>;
    currency: string;
  };
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    byProvider: Record<string, { average: number; p95: number; p99: number }>;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
  };
}