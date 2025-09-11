/**
 * NeonPro Audit System - Monitoring Module
 *
 * Constitutional-grade monitoring, logging, and error tracking.
 * Comprehensive system observability with healthcare compliance.
 */

import ErrorTracker, {
  ClassifiedError,
  ErrorCategory,
  ErrorContext,
  ErrorSeverity,
  ErrorStats,
} from './error-tracker';
import HealthMonitor, { HealthAlert, HealthMetrics, HealthStatus } from './health-monitor';
import Logger, { createLogger, LogEntry, LoggerConfig, LogLevel } from './logger';

/**
 * Integrated monitoring system
 */
export class MonitoringSystem {
  private healthMonitor: HealthMonitor;
  private logger: Logger;
  private errorTracker: ErrorTracker;

  constructor(config: {
    logging?: LoggerConfig;
    health?: {
      interval?: number;
      retentionCount?: number;
      memoryThreshold?: number;
      cpuThreshold?: number;
    };
    errorTracking?: {
      maxStoredErrors?: number;
    };
  } = {}) {
    // Initialize logger first
    this.logger = createLogger(
      config.logging || {
        level: 'info',
        format: 'json',
        outputs: ['console'],
      },
    );

    // Initialize health monitor
    this.healthMonitor = new HealthMonitor(config.health || {});

    // Initialize error tracker
    this.errorTracker = new ErrorTracker({
      maxStoredErrors: config.errorTracking?.maxStoredErrors,
      logger: this.logger,
    });

    this.setupEventHandlers();
  }

  /**
   * Start all monitoring services
   */
  start(): void {
    this.healthMonitor.start();
    this.logger.info('Monitoring system started', 'MonitoringSystem');
  }

  /**
   * Stop all monitoring services
   */
  stop(): void {
    this.healthMonitor.stop();
    this.logger.info('Monitoring system stopped', 'MonitoringSystem');
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus(): {
    health: HealthStatus;
    errors: ErrorStats;
    uptime: number;
  } {
    return {
      health: this.healthMonitor.getHealthStatus(),
      errors: this.errorTracker.getErrorStats(60 * 60 * 1000), // Last hour
      uptime: process.uptime() * 1000,
    };
  }

  /**
   * Track error with full monitoring integration
   */
  trackError(error: Error, context: Partial<ErrorContext> = {}): ClassifiedError {
    return this.errorTracker.trackError(error, context);
  }

  /**
   * Log constitutional compliance event
   */
  logConstitutional(
    level: LogLevel,
    message: string,
    component: string,
    compliance: boolean,
    requirement?: string,
    impact?: string,
  ): void {
    this.logger.constitutional(level, message, component, compliance, requirement, impact);
  }

  /**
   * Update file count for constitutional monitoring
   */
  updateFileCount(count: number): void {
    this.healthMonitor.updateFileCount(count);
    this.logger.info(`File count updated: ${count}`, 'MonitoringSystem', { fileCount: count });
  }

  /**
   * Setup event handlers for integration
   */
  private setupEventHandlers(): void {
    // Health monitor events
    this.healthMonitor.on('alert:created', (alert: HealthAlert) => {
      this.logger.warn(`Health alert: ${alert.message}`, alert.component, {
        alertId: alert.id,
        severity: alert.severity,
        metric: alert.metric,
        value: alert.value,
        threshold: alert.threshold,
      });
    });

    // Error tracker events
    this.errorTracker.on('error:tracked', (error: ClassifiedError) => {
      if (error.severity === 'critical') {
        this.logger.critical(
          `Critical error tracked: ${error.message}`,
          'ErrorTracker',
          {
            errorId: error.id,
            category: error.category,
            tags: error.tags,
          },
        );
      }
    });

    this.errorTracker.on('error:recovered', (error: ClassifiedError) => {
      this.logger.info(
        `Error recovered: ${error.message}`,
        'ErrorTracker',
        {
          errorId: error.id,
          recovery: error.recovery,
        },
      );
    });
  }

  /**
   * Get logger instance
   */
  getLogger(): Logger {
    return this.logger;
  }

  /**
   * Get health monitor instance
   */
  getHealthMonitor(): HealthMonitor {
    return this.healthMonitor;
  }

  /**
   * Get error tracker instance
   */
  getErrorTracker(): ErrorTracker {
    return this.errorTracker;
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    this.stop();
    await this.logger.close();
    this.removeAllListeners();
  }
}

// Export individual components
export { createLogger, ErrorTracker, HealthMonitor, Logger };

// Export types
export type {
  ClassifiedError,
  ErrorCategory,
  ErrorContext,
  ErrorSeverity,
  ErrorStats,
  HealthAlert,
  HealthMetrics,
  HealthStatus,
  LogEntry,
  LoggerConfig,
  LogLevel,
};

// Export default monitoring system
export default MonitoringSystem;
