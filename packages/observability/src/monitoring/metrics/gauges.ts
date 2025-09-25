import { Gauge, Registry } from 'prom-client'
import type { MetricLabels } from '../types'

// Chat-specific gauges
let activeChatSessions: Gauge<string> | null = null
let rateLimitUsage: Gauge<string> | null = null
let aiProviderHealth: Gauge<string> | null = null
let databaseConnections: Gauge<string> | null = null
let systemHealth: Gauge<string> | null = null

export function initializeGauges(registry: Registry): void {
  // Active chat sessions gauge
  activeChatSessions = new Gauge({
    name: 'chat_active_sessions',
    help: 'Number of currently active chat sessions',
    labelNames: ['user_type'],
    registers: [registry],
  })

  // Rate limit usage gauge
  rateLimitUsage = new Gauge({
    name: 'rate_limit_usage_ratio',
    help: 'Current rate limit usage ratio (0-1)',
    labelNames: ['user_id', 'limit_type'],
    registers: [registry],
  })

  // AI provider health gauge
  aiProviderHealth = new Gauge({
    name: 'ai_provider_health_status',
    help: 'AI provider health status (1=healthy, 0=unhealthy)',
    labelNames: ['provider', 'endpoint'],
    registers: [registry],
  })

  // Database connections gauge
  databaseConnections = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
    labelNames: ['pool', 'database'],
    registers: [registry],
  })

  // System health gauge
  systemHealth = new Gauge({
    name: 'system_health_status',
    help: 'Overall system health status (1=healthy, 0.5=degraded, 0=unhealthy)',
    labelNames: ['component'],
    registers: [registry],
  })
}

export function setActiveChatSessions(
  value: number,
  labels: MetricLabels = {},
): void {
  activeChatSessions?.set(labels, value)
}

export function setRateLimitUsage(
  value: number,
  labels: MetricLabels = {},
): void {
  rateLimitUsage?.set(labels, value)
}

export function setAIProviderHealth(
  value: number,
  labels: MetricLabels = {},
): void {
  aiProviderHealth?.set(labels, value)
}

export function setDatabaseConnections(
  value: number,
  labels: MetricLabels = {},
): void {
  databaseConnections?.set(labels, value)
}

export function setSystemHealth(
  value: number,
  labels: MetricLabels = {},
): void {
  systemHealth?.set(labels, value)
}
