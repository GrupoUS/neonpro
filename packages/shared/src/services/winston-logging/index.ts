/**
 * Enhanced Winston-based Structured Logging System
 * 
 * Export all logging components and create default logger instance
 * 
 * @version 2.0.0
 * @author NeonPro Development Team
 * @compliance LGPD, ANVISA, Brazilian Healthcare Standards
 */

import { EnhancedStructuredLogger } from './enhanced-structured-logger';
import { brazilianPIIRedactionService } from './brazilian-pii-redaction';

// Import types from types file
import {
  EnhancedStructuredLoggingConfig,
  BrazilianHealthcareContext,
  WinstonLogEntry,
  EnhancedLGPDCompliance,
  HealthcareSeverity,
} from './types';

// Re-export types and services
export {
  EnhancedStructuredLogger,
  brazilianPIIRedactionService,
  // Types
  EnhancedStructuredLoggingConfig,
  BrazilianHealthcareContext,
  WinstonLogEntry,
  EnhancedLGPDCompliance,
  HealthcareSeverity,
};

// Default configuration for healthcare applications
const defaultConfig: EnhancedStructuredLoggingConfig = {
  service: 'neonpro-healthcare',
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
};

// Create default logger instance
export const enhancedLogger = new EnhancedStructuredLogger(defaultConfig);

// Export convenience functions for direct usage
export const logger = {
  debug: (message: string, data?: any, context?: any) => 
    enhancedLogger.debug(message, data, context),
    
  info: (message: string, data?: any, context?: any) => 
    enhancedLogger.info(message, data, context),
    
  notice: (message: string, data?: any, context?: any) => 
    enhancedLogger.notice(message, data, context),
    
  warn: (message: string, data?: any, context?: any) => 
    enhancedLogger.warn(message, data, context),
    
  error: (message: string, error?: Error, data?: any, context?: any) => 
    enhancedLogger.error(message, error, data, context),
    
  critical: (message: string, data?: any, context?: any) => 
    enhancedLogger.critical(message, data, context),
    
  alert: (message: string, data?: any, context?: any) => 
    enhancedLogger.alert(message, data, context),
    
  emergency: (message: string, data?: any, context?: any) => 
    enhancedLogger.emergency(message, data, context),
    
  // Healthcare-specific methods
  logPatientSafetyEvent: (
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ) => enhancedLogger.logPatientSafetyEvent(message, severity, healthcareContext, data),
  
  logClinicalWorkflow: (
    workflowType: BrazilianHealthcareContext['workflowType'],
    stage: string,
    message: string,
    data?: any,
    context?: any
  ) => enhancedLogger.logClinicalWorkflow(workflowType, stage, message, data, context),
  
  logMedicationEvent: (
    action: 'prescribed' | 'administered' | 'verified' | 'adverse_reaction',
    message: string,
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ) => enhancedLogger.logMedicationEvent(action, message, healthcareContext, data),
  
  logEmergencyResponse: (
    action: string,
    responseTime: number,
    message: string,
    healthcareContext: BrazilianHealthcareContext,
    data?: any
  ) => enhancedLogger.logEmergencyResponse(action, responseTime, message, healthcareContext, data),
  
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
};

// Export factory function for creating custom loggers
export function createHealthcareLogger(config: Partial<EnhancedStructuredLoggingConfig> & { service: string }): EnhancedStructuredLogger {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    service: config.service, // Ensure service is overridden
  };
  
  return new EnhancedStructuredLogger(mergedConfig);
}

// Export middleware for request correlation ID management
export function createCorrelationMiddleware(loggerInstance: EnhancedStructuredLogger = enhancedLogger) {
  return (req: any, res: any, next: any) => {
    // Generate or extract correlation ID
    const correlationId = req.headers['x-correlation-id'] || 
                          req.headers['x-request-id'] || 
                          loggerInstance.generateCorrelationId();
    
    // Set correlation ID in logger
    loggerInstance.setCorrelationId(correlationId);
    
    // Set request context
    loggerInstance.setRequestContext({
      requestId: correlationId,
      sessionId: req.session?.id,
      traceId: req.headers['x-trace-id'],
      spanId: req.headers['x-span-id'],
      anonymizedUserId: req.user?.id ? `user_${req.user.id.slice(-8)}` : undefined,
      deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      method: req.method,
      url: req.url,
    });
    
    // Add correlation ID to response headers
    res.setHeader('x-correlation-id', correlationId);
    
    // Clear context when response finishes
    res.on('finish', () => {
      loggerInstance.clearCorrelationId();
      loggerInstance.clearRequestContext();
    });
    
    next();
  };
}

// Global error handling hook
export function setupGlobalErrorHandling(loggerInstance: EnhancedStructuredLogger = enhancedLogger) {
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      loggerInstance.emergency('Uncaught Exception', { error: error.message, stack: error.stack });
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      loggerInstance.error('Unhandled Rejection', { 
        reason: reason instanceof Error ? reason.message : reason,
        promise: promise.toString() 
      });
    });
  }
}

// Initialize global error handling
setupGlobalErrorHandling(enhancedLogger);

// Export for testing and debugging
export { defaultConfig, EnhancedStructuredLogger as LoggerClass };