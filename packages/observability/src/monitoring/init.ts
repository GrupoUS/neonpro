import { JaegerExporter } from '@opentelemetry/exporter-jaeger'
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { HealthcareSecurityLogger } from '@neonpro/security'
import { initializeHealthChecks } from './health'
import { createLogger } from './logging'
import { initializeMetrics } from './metrics'
import type { MonitoringConfig } from './types'

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

export type { MonitoringConfig }

let sdk: NodeSDK | null = null

export function initializeMonitoring(config: MonitoringConfig): void {
  const securityLogger = getHealthcareLogger()
  securityLogger.info(
    `🔍 Initializing monitoring for ${config.serviceName} v${config.serviceVersion}`,
    {
      serviceName: config.serviceName,
      serviceVersion: config.serviceVersion,
      environment: config.environment
    }
  )

  // Initialize logging first
  const logger = createLogger(config.logging)
  logger.info('Monitoring system starting up', {
    _service: config.serviceName,
    version: config.serviceVersion,
    environment: config.environment,
  })

  // Initialize metrics
  if (config.metrics.enabled) {
    initializeMetrics({
      serviceName: config.serviceName,
      port: config.metrics.port || 9464,
      endpoint: config.metrics.endpoint || '/metrics',
    })
    logger.info('Metrics collection enabled', {
      port: config.metrics.port || 9464,
    })
  }

  // Initialize tracing
  if (config.tracing.enabled) {
    const instrumentations = [
      new HttpInstrumentation(),
      new ExpressInstrumentation(),
    ]

    const traceExporter = config.tracing.jaegerEndpoint
      ? new JaegerExporter({
        endpoint: config.tracing.jaegerEndpoint,
      })
      : undefined

    sdk = new NodeSDK({
      serviceName: config.serviceName,
      instrumentations,
      traceExporter: traceExporter as any,
    })

    // Start the SDK
    sdk.start()
    logger.info('Tracing instrumentation enabled', {
      jaegerEndpoint: config.tracing.jaegerEndpoint || 'default',
      sampleRate: config.tracing.sampleRate || 1.0,
    })
  }

  // Initialize health checks
  if (config.health.enabled) {
    initializeHealthChecks({
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000, // 30 seconds
    })
    logger.info('Health checks enabled', {
      endpoint: config.health.endpoint || '/health',
      interval: config.health.interval || 30000,
    })
  }

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down monitoring gracefully')
    shutdownMonitoring()
  })

  process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down monitoring gracefully')
    shutdownMonitoring()
  })

  logger.info('Monitoring system initialized successfully')
}

export async function shutdownMonitoring(): Promise<void> {
  const logger = getHealthcareLogger()
  if (sdk) {
    try {
      await sdk.shutdown()
      logger.info('📊 Monitoring system shut down successfully', { action: 'shutdown' })
    } catch (error) {
      logger.error('Error shutting down monitoring', { error: (error as Error)?.message, action: 'shutdown' })
    }
  }
}
