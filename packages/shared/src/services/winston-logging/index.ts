/**
 * Enhanced Winston-based Structured Logging System
 *
 * Export all logging components and create default logger instance
 *
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Brazilian Healthcare Standards
 */

import { brazilianPIIRedactionService } from './brazilian-pii-redaction'
import { EnhancedStructuredLogger } from './enhanced-structured-logger'

// Import types from types file
import {
  BrazilianHealthcareContext,
  EnhancedLGPDCompliance,
  EnhancedStructuredLoggingConfig,
  HealthcareSeverity,
  WinstonLogEntry,
} from './types'

// Re-export types and services
export { brazilianPIIRedactionService, EnhancedStructuredLogger }

export type {
  BrazilianHealthcareContext,
  EnhancedLGPDCompliance,
  EnhancedStructuredLoggingConfig,
  HealthcareSeverity,
  WinstonLogEntry,
}

// Default configuration for healthcare applications
const defaultConfig: EnhancedStructuredLoggingConfig = {
  _service: 'neonpro-healthcare',
  environment: (process.env.NODE_ENV as any) || 'development',
  version: process.env.npm_package_version || '2.0.0',

  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  severityLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

  transports: {
    console: {
      enabled: true,
      level: 'debug',
      format: 'json',
    },
    file: {
      enabled: process.env.NODE_ENV === 'production',
      level: 'info',
      filename: 'logs/neonpro-healthcare.log',
      maxSize: '20m',
      maxFiles: 5,
      format: 'json',
    },
    dailyRotate: {
      enabled: process.env.NODE_ENV === 'production',
      level: 'info',
      filename: 'logs/neonpro-healthcare-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    },
  },

  performance: {
    silent: false,
    exitOnError: false,
    handleExceptions: true,
    handleRejections: true,
  },

  healthcareCompliance: {
    enablePIIRedaction: true,
    enableAuditLogging: true,
    criticalEventAlerts: true,
    patientSafetyLogging: true,
    enableBrazilianCompliance: true,
  },

  lgpdCompliance: {
    dataRetentionDays: 365, // 1 year for healthcare compliance
    requireExplicitConsent: false, // Legitimate interest for healthcare logging
    anonymizeByDefault: true,
    enableDataMinimization: true,
    enablePurposeLimitation: true,
  },

  format: {
    colorize: process.env.NODE_ENV !== 'production',
    prettyPrint: process.env.NODE_ENV === 'development',
    timestamp: true,
    showLevel: true,
  },
}

// Create default logger instance
export const enhancedLogger = new EnhancedStructuredLogger(defaultConfig)

// Export convenience functions for direct usage
export const logger = {
  debug: (message: string, data?: any, _context?: any) =>
    enhancedLogger.debug(message, data, _context),

  info: (message: string, data?: any, _context?: any) =>
    enhancedLogger.info(message, data, _context),

  notice: (message: string, data?: any, _context?: any) =>
    enhancedLogger.notice(message, data, _context),

  warn: (message: string, data?: any, _context?: any) =>
    enhancedLogger.warn(message, data, _context),

  error: (message: string, error?: Error, data?: any, _context?: any) =>
    enhancedLogger.error(message, error, data, _context),

  critical: (message: string, data?: any, _context?: any) =>
    enhancedLogger.critical(message, data, _context),

  alert: (message: string, data?: any, _context?: any) =>
    enhancedLogger.alert(message, data, _context),

  emergency: (message: string, data?: any, _context?: any) =>
    enhancedLogger.emergency(message, data, _context),

  // Healthcare-specific methods
  logPatientSafetyEvent: (
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    healthcareContext: BrazilianHealthcareContext,
    data?: any,
  ) =>
    enhancedLogger.logPatientSafetyEvent(
      message,
      severity,
      healthcareContext,
      data,
    ),

  logClinicalWorkflow: (
    workflowType: BrazilianHealthcareContext['workflowType'],
    stage: string,
    message: string,
    data?: any,
    _context?: any,
  ) =>
    enhancedLogger.logClinicalWorkflow(
      workflowType,
      stage,
      message,
      data,
      _context,
    ),

  logMedicationEvent: (
    action: 'prescribed' | 'administered' | 'verified' | 'adverse_reaction',
    message: string,
    severity: HealthcareSeverity,
    healthcareContext: BrazilianHealthcareContext,
    data?: any,
  ) => enhancedLogger.logMedicationEvent(action, message, severity, healthcareContext, data),

  logEmergencyResponse: (
    action: string,
    responseTime: number,
    message: string,
    healthcareContext: BrazilianHealthcareContext,
    data?: any,
  ) =>
    enhancedLogger.logEmergencyResponse(
      action,
      responseTime,
      message,
      healthcareContext,
      data,
    ),

  // Utility methods
  child: (context: any) => enhancedLogger.child(context),
  getCorrelationId: () => enhancedLogger.getCorrelationId(),
  generateCorrelationId: () => enhancedLogger.generateCorrelationId(),
  setCorrelationId: (id: string) => enhancedLogger.setCorrelationId(id),
  clearCorrelationId: () => enhancedLogger.clearCorrelationId(),
  setRequestContext: (context: any) => enhancedLogger.setRequestContext(context),
  getRequestContext: () => enhancedLogger.getRequestContext(),
  clearRequestContext: () => enhancedLogger.clearRequestContext(),
  getStatistics: () => enhancedLogger.getStatistics(),
  shutdown: () => enhancedLogger.shutdown(),
}

// Export factory function for creating custom loggers
export function createHealthcareLogger(
  config: Partial<EnhancedStructuredLoggingConfig> & { _service: string },
): EnhancedStructuredLogger {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    _service: config._service || defaultConfig._service, // Ensure service is overridden
  }

  return new EnhancedStructuredLogger(mergedConfig)
}

// Export middleware for request correlation ID management
export function createCorrelationMiddleware(
  loggerInstance: EnhancedStructuredLogger = enhancedLogger,
) {
  return (req: any, res: any, next: any) => {
    // Generate or extract correlation ID
    const correlationId = req.headers['x-correlation-id']
      || req.headers['x-request-id']
      || loggerInstance.generateCorrelationId()

    // Set correlation ID in logger
    loggerInstance.setCorrelationId(correlationId)

    // Set request context
    loggerInstance.setRequestContext({
      requestId: correlationId,
      sessionId: req.session?.id,
      traceId: req.headers['x-trace-id'],
      spanId: req.headers['x-span-id'],
      anonymizedUserId: req.user?.id
        ? `user_${req.user.id.slice(-8)}`
        : undefined,
      deviceType: req.headers['user-agent']?.includes('Mobile')
        ? 'mobile'
        : 'desktop',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.url,
    })

    // Add correlation ID to response headers
    res.setHeader('x-correlation-id', correlationId)

    // Clear context when response finishes
    res.on('finish', () => {
      loggerInstance.clearCorrelationId()
      loggerInstance.clearRequestContext()
    })

    next()
  }
}

// Global error handling hook
export function setupGlobalErrorHandling(
  loggerInstance: EnhancedStructuredLogger = enhancedLogger,
) {
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      loggerInstance.emergency('Uncaught Exception', {
        error: error.message,
        stack: error.stack,
      })
      process.exit(1)
    })

    process.on('unhandledRejection', (reason, promise) => {
      const errorData = {
        reason: reason instanceof Error ? reason.message : reason,
        promise: promise.toString(),
      }
      // Pass error as error parameter and additional data as data parameter
      const error = reason instanceof Error ? reason : new Error(String(reason))
      loggerInstance.error('Unhandled Rejection', error, errorData)
    })
  }
}

// Initialize global error handling
setupGlobalErrorHandling(enhancedLogger)

// Export for testing and debugging
export { defaultConfig, EnhancedStructuredLogger as LoggerClass }
