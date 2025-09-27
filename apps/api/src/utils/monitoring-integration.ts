/**
 * 🔄 Monitoring Integration Utility
 *
 * Integrates SecureLogger with ObservabilityManager for comprehensive monitoring
 * and standardized logging patterns across all utilities.
 */

import { type ErrorContext, ErrorHandler } from './error-handler'
import {
  type HealthCheck,
  type MetricDefinition,
  ObservabilityManager,
} from './observability-manager'
import { type LogContext, SecureLogger } from './secure-logger'

export interface MonitoringConfig {
  enableStructuredLogging: boolean
  enableMetricsCollection: boolean
  enableHealthChecks: boolean
  enablePerformanceTracking: boolean
  enableDistributedTracing: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'silent'
  serviceVersion: string
  environment: 'development' | 'staging' | 'production'
}

export interface MonitoringContext extends LogContext {
  traceId?: string
  spanId?: string
  component?: string
  version?: string
  tags?: Record<string, string>
}

/**
 * Integrated monitoring system that combines logging, metrics, and tracing
 */
export class MonitoringIntegration {
  private logger: SecureLogger
  private observability: ObservabilityManager
  private errorHandler: ErrorHandler
  private config: Required<MonitoringConfig>
  private activeOperations: Map<string, { startTime: number; context: MonitoringContext }> =
    new Map()

  constructor(config: MonitoringConfig) {
    this.config = {
      enableStructuredLogging: true,
      enableMetricsCollection: true,
      enableHealthChecks: true,
      enablePerformanceTracking: true,
      enableDistributedTracing: true,
      logLevel: 'info',
      serviceVersion: '1.0.0',
      environment: 'development',
      ...config,
    }

    // Initialize components
    this.logger = new SecureLogger({
      level: this.config.logLevel,
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      enableMetrics: this.config.enableMetricsCollection,
      enableStructuredOutput: this.config.enableStructuredLogging,
      enableCorrelationIds: true,
      enablePerformanceTracking: this.config.enablePerformanceTracking,
      _service: 'monitoring-integration',
      environment: this.config.environment,
      version: this.config.serviceVersion,
    })

    this.observability = new ObservabilityManager({
      serviceName: 'monitoring-integration',
      version: this.config.serviceVersion,
      environment: this.config.environment,
      enableMetrics: this.config.enableMetricsCollection,
      enableTracing: this.config.enableDistributedTracing,
      enableHealthChecks: this.config.enableHealthChecks,
    })

    this.errorHandler = new ErrorHandler({
      service: 'monitoring-integration',
      environment: this.config.environment,
      enableRecovery: true,
      enableLogging: true,
      enableMetrics: this.config.enableMetricsCollection,
      logger: this.logger,
    })

    this.setupIntegration()
  }

  /**
   * Setup integration between components
   */
  private setupIntegration(): void {
    // Register health checks
    if (this.config.enableHealthChecks) {
      this.registerHealthChecks()
    }

    // Register custom metrics
    if (this.config.enableMetricsCollection) {
      this.registerCustomMetrics()
    }

    this.logger.info('Monitoring integration initialized', {
      config: {
        structuredLogging: this.config.enableStructuredLogging,
        metricsCollection: this.config.enableMetricsCollection,
        healthChecks: this.config.enableHealthChecks,
        performanceTracking: this.config.enablePerformanceTracking,
        distributedTracing: this.config.enableDistributedTracing,
      },
    })
  }

  /**
   * Register health checks for the monitoring system
   */
  private registerHealthChecks(): void {
    const healthChecks: HealthCheck[] = [
      {
        id: 'logging-system',
        name: 'Logging System Health',
        category: 'logging',
        check: async () => {
          try {
            // Test logging functionality
            this.logger.debug('Health check test', { healthCheck: true })
            return { status: 'healthy', details: { message: 'Logging system operational' } }
          } catch (error) {
            return {
              status: 'unhealthy',
              details: {
                message: 'Logging system failure',
                error: error instanceof Error ? error.message : String(error),
              },
            }
          }
        },
      },
      {
        id: 'metrics-collection',
        name: 'Metrics Collection Health',
        category: 'monitoring',
        check: async () => {
          try {
            const metrics = this.observability.getMetrics()
            return {
              status: 'healthy',
              details: {
                message: 'Metrics collection operational',
                metricsCount: Object.keys(metrics).length,
              },
            }
          } catch (error) {
            return {
              status: 'unhealthy',
              details: {
                message: 'Metrics collection failure',
                error: error instanceof Error ? error.message : String(error),
              },
            }
          }
        },
      },
      {
        id: 'error-handling',
        name: 'Error Handling Health',
        category: 'error_handling',
        check: async () => {
          try {
            // Test error handling
            const testError = new Error('Health check test error')
            this.handleError(testError, { context: 'health-check' })
            return { status: 'healthy', details: { message: 'Error handling operational' } }
          } catch (error) {
            return {
              status: 'unhealthy',
              details: {
                message: 'Error handling failure',
                error: error instanceof Error ? error.message : String(error),
              },
            }
          }
        },
      },
    ]

    healthChecks.forEach(check => {
      this.observability.registerHealthCheck(check)
    })
  }

  /**
   * Register custom metrics for monitoring
   */
  private registerCustomMetrics(): void {
    const metrics: MetricDefinition[] = [
      {
        name: 'monitoring_operations_total',
        type: 'counter',
        description: 'Total number of monitoring operations',
        labels: ['operation_type', 'component'],
        collect: () => {
          // This would be implemented with actual metric collection
          return 0
        },
      },
      {
        name: 'monitoring_operation_duration_seconds',
        type: 'histogram',
        description: 'Duration of monitoring operations',
        labels: ['operation_type', 'component'],
        buckets: [0.1, 0.5, 1.0, 2.0, 5.0, 10.0],
        collect: () => {
          // This would be implemented with actual metric collection
          return 0
        },
      },
      {
        name: 'monitoring_errors_total',
        type: 'counter',
        description: 'Total number of monitoring errors',
        labels: ['error_type', 'component'],
        collect: () => {
          // This would be implemented with actual metric collection
          return 0
        },
      },
    ]

    metrics.forEach(metric => {
      this.observability.registerMetric(metric)
    })
  }

  /**
   * Start a monitored operation with tracing
   */
  startOperation(
    operationName: string,
    context: Partial<MonitoringContext> = {},
  ): string {
    const traceId = this.generateTraceId()
    const spanId = this.generateSpanId()
    const operationId = `${operationName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const monitoringContext: MonitoringContext = {
      traceId,
      spanId,
      component: context.component || 'unknown',
      version: this.config.serviceVersion,
      tags: context.tags || {},
      ...context,
    }

    this.activeOperations.set(operationId, {
      startTime: Date.now(),
      context: monitoringContext,
    })

    // Log operation start
    this.logger.info(`Operation started: ${operationName}`, {
      ...monitoringContext,
      operation: operationName,
      operationId,
      phase: 'start',
    })

    // Record metric
    if (this.config.enableMetricsCollection) {
      this.observability.recordMetric('monitoring_operations_total', 1, {
        operation_type: operationName,
        component: monitoringContext.component || 'unknown',
      })
    }

    return operationId
  }

  /**
   * End a monitored operation and record metrics
   */
  endOperation(
    operationId: string,
    result: 'success' | 'failure' | 'error',
    details: any = {},
  ): void {
    const operation = this.activeOperations.get(operationId)
    if (!operation) {
      this.logger.warn('Attempted to end non-existent operation', { operationId })
      return
    }

    const duration = Date.now() - operation.startTime
    const { context } = operation

    // Log operation end
    this.logger.info(`Operation completed: ${result}`, {
      ...context,
      operationId,
      result,
      duration,
      phase: 'end',
      details,
    })

    // Record duration metric
    if (this.config.enableMetricsCollection) {
      this.observability.recordMetric('monitoring_operation_duration_seconds', duration / 1000, {
        operation_type: context.operation || 'unknown',
        component: context.component || 'unknown',
      })
    }

    // Record error metric if failed
    if (result === 'error' && this.config.enableMetricsCollection) {
      this.observability.recordMetric('monitoring_errors_total', 1, {
        error_type: details.errorType || 'unknown',
        component: context.component || 'unknown',
      })
    }

    // Clean up
    this.activeOperations.delete(operationId)
  }

  /**
   * Log with monitoring context
   */
  logWithMonitoring(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    context: Partial<MonitoringContext> = {},
  ): void {
    const monitoringContext: MonitoringContext = {
      version: this.config.serviceVersion,
      ...context,
    }

    this.logger[level](message, monitoringContext)
  }

  /**
   * Log HTTP request with monitoring
   */
  logHttpRequest(context: {
    method: string
    path: string
    statusCode: number
    duration: number
    _userId?: string
    userAgent?: string
    ip?: string
    responseSize?: number
  }): void {
    this.logger.logHttpRequest({
      ...context,
      component: 'http-server',
      version: this.config.serviceVersion,
    })

    // Record HTTP metrics
    if (this.config.enableMetricsCollection) {
      this.observability.recordMetric('http_requests_total', 1, {
        method: context.method,
        path: context.path,
        status: context.statusCode.toString(),
      })

      this.observability.recordMetric('http_request_duration_seconds', context.duration / 1000, {
        method: context.method,
        path: context.path,
      })
    }
  }

  /**
   * Log database operation with monitoring
   */
  logDatabaseOperation(
    operation: string,
    query: string,
    duration: number,
    context: Partial<MonitoringContext> = {},
  ): void {
    this.logger.logDatabaseOperation(operation, query, duration, {
      component: 'database',
      version: this.config.serviceVersion,
      ...context,
    })

    // Record database metrics
    if (this.config.enableMetricsCollection) {
      this.observability.recordMetric('database_operations_total', 1, {
        operation,
        component: context.component || 'database',
      })

      this.observability.recordMetric('database_operation_duration_seconds', duration / 1000, {
        operation,
        component: context.component || 'database',
      })
    }
  }

  /**
   * Handle error with monitoring context
   */
  handleError(error: Error, context: ErrorContext & Partial<MonitoringContext> = {}): void {
    const monitoringContext: MonitoringContext = {
      component: context.component || 'unknown',
      version: this.config.serviceVersion,
      ...context,
    }

    this.errorHandler.handleError(error, {
      ...context,
      monitoringContext,
    } as any)

    // Record error metrics
    if (this.config.enableMetricsCollection) {
      this.observability.recordMetric('monitoring_errors_total', 1, {
        error_type: error.name,
        component: monitoringContext.component || 'unknown',
      })
    }
  }

  /**
   * Get comprehensive monitoring status
   */
  getStatus(): {
    health: any
    metrics: any
    loggerMetrics: any
    activeOperations: number
    uptime: number
  } {
    return {
      health: this.observability.getHealthStatus(),
      metrics: this.observability.getMetrics(),
      loggerMetrics: this.logger.getMetrics(),
      activeOperations: this.activeOperations.size,
      uptime: process.uptime(),
    }
  }

  /**
   * Generate trace ID for distributed tracing
   */
  private generateTraceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate span ID for distributed tracing
   */
  private generateSpanId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

/**
 * Factory function for creating monitoring integration instances
 */
export function createMonitoringIntegration(config: MonitoringConfig): MonitoringIntegration {
  return new MonitoringIntegration(config)
}

// Default configuration for different environments
export const DEFAULT_MONITORING_CONFIGS = {
  development: {
    enableStructuredLogging: true,
    enableMetricsCollection: true,
    enableHealthChecks: true,
    enablePerformanceTracking: true,
    enableDistributedTracing: false,
    logLevel: 'debug' as const,
    serviceVersion: '1.0.0',
    environment: 'development' as const,
  },
  staging: {
    enableStructuredLogging: true,
    enableMetricsCollection: true,
    enableHealthChecks: true,
    enablePerformanceTracking: true,
    enableDistributedTracing: true,
    logLevel: 'info' as const,
    serviceVersion: '1.0.0',
    environment: 'staging' as const,
  },
  production: {
    enableStructuredLogging: true,
    enableMetricsCollection: true,
    enableHealthChecks: true,
    enablePerformanceTracking: true,
    enableDistributedTracing: true,
    logLevel: 'warn' as const,
    serviceVersion: '1.0.0',
    environment: 'production' as const,
  },
}

// Export types
export type { MonitoringConfig, MonitoringContext }
