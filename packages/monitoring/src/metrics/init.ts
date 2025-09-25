import { initializeCounters } from './counters'
import { initializeGauges } from './gauges'
import { initializeHistograms } from './histograms'
import { createPrometheusRegistry } from './prometheus'
import { HealthcareSecurityLogger } from '@neonpro/security'

// Global healthcare security logger instance
let healthcareLogger: HealthcareSecurityLogger | null = null

function getHealthcareLogger(): HealthcareSecurityLogger {
  if (!healthcareLogger) {
    healthcareLogger = new HealthcareSecurityLogger({
      enableConsoleLogging: true,
      enableDatabaseLogging: false,
      enableFileLogging: false,
      enableAuditLogging: true,
      logLevel: 'info',
      sanitizeSensitiveData: true,
      complianceLevel: 'standard',
    })
  }
  return healthcareLogger
}

interface MetricsConfig {
  serviceName: string
  port: number
  endpoint: string
}

export function initializeMetrics(config: MetricsConfig): void {
  const logger = getHealthcareLogger()
  logger.info(`📊 Initializing metrics for ${config.serviceName}`, {
    serviceName: config.serviceName,
    port: config.port,
    endpoint: config.endpoint
  })

  // Create Prometheus registry
  const registry = createPrometheusRegistry(config.serviceName)

  // Initialize metric types
  initializeCounters(registry)
  initializeHistograms(registry)
  initializeGauges(registry)

  logger.info(
    `📊 Metrics server ready on port ${config.port}${config.endpoint}`,
    {
      action: 'metrics_server_ready',
      port: config.port,
      endpoint: config.endpoint
    }
  )
}
