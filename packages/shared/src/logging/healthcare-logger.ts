/**
 * Healthcare Logging Configuration
 *
 * Provides structured logging for healthcare applications with LGPD compliance,
 * sensitive data filtering, and proper log levels for production environments.
 */

import * as winston from 'winston'
import { format } from 'winston'

// Healthcare-specific log levels with compliance focus
const healthcareLevels = {
  emergency: 0,
  alert: 1,
  critical: 2,
  error: 3,
  warning: 4,
  audit: 5,
  info: 6,
  debug: 7,
  trace: 8,
}

// Healthcare log colors for different severity levels
const healthcareColors = {
  emergency: 'inverse red',
  alert: 'red',
  critical: 'red bold',
  error: 'red',
  warning: 'yellow',
  audit: 'magenta',
  info: 'green',
  debug: 'blue',
  trace: 'gray',
}

// LGPD compliance - sensitive data patterns to redact
const sensitivePatterns = [
  /cpf:\s*"\d{3}\.\d{3}\.\d{3}-\d{2}"/gi,
  /rg:\s*"\d{2}\.\d{3}\.\d{3}-\d{1}"/gi,
  /phone:\s*"\(\d{2}\)\s*\d{4,5}-\d{4}"/gi,
  /email:\s*"[^"]+@[^"]+\.[^"]+"/gi,
  /password:\s*"[^"]+"/gi,
  /token:\s*"[^"]+"/gi,
  /secret:\s*"[^"]+"/gi,
  /key:\s*"[^"]+"/gi,
]

// Redact sensitive data from log messages
function redactSensitiveData(message: string): string {
  let redactedMessage = message
  sensitivePatterns.forEach(pattern => {
    redactedMessage = redactedMessage.replace(pattern, match => {
      return match.replace(/"[^"]+"/g, '"[REDACTED]"')
    })
  })
  return redactedMessage
}

// Healthcare-specific log format
const healthcareFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS',
  }),
  format.errors({ stack: true }),
  format(info => {
    // Redact sensitive data from the message
    if (info.message && typeof info.message === 'string') {
      info.message = redactSensitiveData(info.message)
    }

    // Redact sensitive data from metadata
    if (info.metadata) {
      info.metadata = JSON.parse(
        redactSensitiveData(JSON.stringify(info.metadata)),
      )
    }

    // Add healthcare-specific metadata
    info.service = info.service || 'unknown'
    info.environment = process.env.NODE_ENV || 'development'
    info.version = process.env.npm_package_version || '1.0.0'

    return info
  })(),
  format.json(),
)

// Console format for development
const consoleFormat = format.combine(
  format.colorize({ colors: healthcareColors }),
  format.timestamp({ format: 'HH:mm:ss.SSS' }),
  format.printf(({ timestamp, level, message, service, ...meta }) => {
    const serviceTag = service ? `[${service}]` : ''
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
    return `${timestamp} ${level}: ${serviceTag} ${
      redactSensitiveData(String(message || ''))
    }${metaStr}`
  }),
)

// Create logger factory for different services
export function createHealthcareLogger(service: string, options: winston.LoggerOptions = {}) {
  const transports: winston.transport[] = []

  // Console transport for development
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        level: 'debug',
        format: consoleFormat,
      }),
    )
  } else {
    // Production console transport (errors only)
    transports.push(
      new winston.transports.Console({
        level: 'error',
        format: consoleFormat,
      }),
    )
  }

  // File transport for persistent logging
  transports.push(
    new winston.transports.File({
      filename: `logs/${service}-error.log`,
      level: 'error',
      format: healthcareFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )

  // Combined logs file
  transports.push(
    new winston.transports.File({
      filename: `logs/${service}-combined.log`,
      level: 'info',
      format: healthcareFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  )

  // Audit log for healthcare compliance
  transports.push(
    new winston.transports.File({
      filename: `logs/${service}-audit.log`,
      level: 'audit',
      format: healthcareFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
  )

  return winston.createLogger({
    levels: healthcareLevels,
    level: process.env.LOG_LEVEL || 'info',
    format: healthcareFormat,
    transports,
    defaultMeta: { service },
    exitOnError: false,
    ...options,
  })
}

// Pre-configured loggers for different services
export const databaseLogger = createHealthcareLogger('database')
export const apiLogger = createHealthcareLogger('api')
export const securityLogger = createHealthcareLogger('security')
export const middlewareLogger = createHealthcareLogger('middleware')
export const realtimeLogger = createHealthcareLogger('realtime')
export const complianceLogger = createHealthcareLogger('compliance')
export const chatLogger = createHealthcareLogger('chat')
export const analyticsLogger = createHealthcareLogger('analytics')
export const governanceLogger = createHealthcareLogger('governance')
export const resilienceLogger = createHealthcareLogger('resilience')
export const cacheLogger = createHealthcareLogger('cache')
export const auditLogger = createHealthcareLogger('audit', {
  level: 'audit',
  transports: [
    new winston.transports.File({
      filename: 'logs/audit-combined.log',
      format: healthcareFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 20,
    }),
  ],
})

// Specialized audit logging for healthcare compliance
export function logAuditEvent(
  action: string,
  resource: string,
  userId?: string,
  metadata?: Record<string, any>,
): void {
  auditLogger.log('audit', 'Healthcare audit event', {
    action,
    resource,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    metadata,
  })
}

// Error logging with enhanced context for healthcare
export function logHealthcareError(
  service: string,
  error: Error,
  context?: Record<string, any>,
): void {
  const logger = createHealthcareLogger(service)
  logger.error('Healthcare service error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context: redactSensitiveData(JSON.stringify(context || {})),
  })
}

// Performance monitoring for healthcare operations
export function logPerformanceMetric(
  service: string,
  operation: string,
  durationMs: number,
  metadata?: Record<string, any>,
): void {
  const logger = createHealthcareLogger(service)
  logger.info('Performance metric', {
    operation,
    durationMs,
    metadata,
  })
}

export default {
  createHealthcareLogger,
  databaseLogger,
  apiLogger,
  securityLogger,
  middlewareLogger,
  realtimeLogger,
  complianceLogger,
  chatLogger,
  analyticsLogger,
  governanceLogger,
  resilienceLogger,
  cacheLogger,
  auditLogger,
  logAuditEvent,
  logHealthcareError,
  logPerformanceMetric,
}
