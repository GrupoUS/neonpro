/**
 * NeonPro Structured Logging System
 * Healthcare-compliant structured logging with LGPD data protection
 */

import { serverEnv } from './env';

// Log levels following RFC 5424
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,  
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Healthcare-specific log categories
export enum LogCategory {
  // System logs
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  
  // Healthcare-specific
  PATIENT_ACCESS = 'patient_access',
  MEDICAL_DATA = 'medical_data',
  COMPLIANCE = 'compliance',
  AUDIT = 'audit',
  
  // Technical
  DATABASE = 'database',
  API = 'api',
  AUTHENTICATION = 'auth',
  INTEGRATION = 'integration',
}

// Structured log entry interface
export interface LogEntry {
  timestamp: string;
  level: keyof typeof LogLevel;
  category: LogCategory;
  message: string;
  correlationId?: string;
  userId?: string;
  clinicId?: string;
  patientId?: string; // Will be redacted based on compliance settings
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string | number;
  };
  compliance?: {
    lgpdCategory?: 'processing' | 'access' | 'modification' | 'deletion';
    dataSubject?: 'patient' | 'staff' | 'clinic' | 'system';
    lawfulBasis?: string;
    retentionPeriod?: number;
  };
  performance?: {
    duration?: number;
    memory?: number;
    cpu?: number;
    queries?: number;
  };
}

// LGPD data redaction for healthcare compliance
function redactSensitiveData(entry: LogEntry): LogEntry {
  const redacted = { ...entry };
  
  // Always redact in strict compliance mode
  if (serverEnv.compliance.lgpdMode === 'strict') {
    // Redact patient ID unless it's a compliance audit log
    if (entry.category !== LogCategory.AUDIT && entry.patientId) {
      redacted.patientId = `***-${entry.patientId.slice(-4)}`;
    }
    
    // Redact sensitive metadata
    if (redacted.metadata) {
      const sensitiveKeys = ['cpf', 'phone', 'email', 'address', 'birthdate'];
      sensitiveKeys.forEach(key => {
        if (redacted.metadata?.[key]) {
          redacted.metadata[key] = '[REDACTED]';
        }
      });
    }
    
    // Redact error stack traces that might contain sensitive data
    if (redacted.error?.stack) {
      redacted.error.stack = redacted.error.stack.replace(
        /(\b(?:cpf|email|phone|cns)\s*[:=]\s*)([^\s,}]+)/gi,
        '$1[REDACTED]'
      );
    }
  }
  
  return redacted;
}

// Logger class for structured healthcare logging
class HealthcareLogger {
  private minLevel: LogLevel;
  
  constructor() {
    this.minLevel = serverEnv.app?.environment === 'production' 
      ? LogLevel.INFO 
      : LogLevel.DEBUG;
  }
  
  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }
  
  private formatEntry(entry: LogEntry): string {
    const redactedEntry = redactSensitiveData(entry);
    
    // JSON format for production, pretty format for development
    if (serverEnv.app?.environment === 'production') {
      return JSON.stringify(redactedEntry);
    } else {
      return JSON.stringify(redactedEntry, null, 2);
    }
  }
  
  private writeLog(entry: LogEntry): void {
    if (!this.shouldLog(LogLevel[entry.level])) return;
    
    const formattedEntry = this.formatEntry(entry);
    
    // In production, this would integrate with external logging service
    // For now, using console with proper formatting
    switch (entry.level) {
      case 'DEBUG':
        console.debug(formattedEntry);
        break;
      case 'INFO':
        console.info(formattedEntry);
        break;
      case 'WARN':
        console.warn(formattedEntry);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(formattedEntry);
        break;
    }
  }
  
  private createEntry(
    level: keyof typeof LogLevel,
    category: LogCategory,
    message: string,
    options?: Partial<LogEntry>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      correlationId: options?.correlationId || generateCorrelationId(),
      ...options,
    };
  }
  
  debug(category: LogCategory, message: string, options?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('DEBUG', category, message, options));
  }
  
  info(category: LogCategory, message: string, options?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('INFO', category, message, options));
  }
  
  warn(category: LogCategory, message: string, options?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('WARN', category, message, options));
  }
  
  error(category: LogCategory, message: string, options?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('ERROR', category, message, options));
  }
  
  fatal(category: LogCategory, message: string, options?: Partial<LogEntry>): void {
    this.writeLog(this.createEntry('FATAL', category, message, options));
  }
  
  // Healthcare-specific logging methods
  patientAccess(action: string, patientId: string, userId: string, clinicId: string, metadata?: Record<string, any>): void {
    this.info(LogCategory.PATIENT_ACCESS, `Patient ${action}`, {
      patientId,
      userId,
      clinicId,
      metadata,
      compliance: {
        lgpdCategory: 'access',
        dataSubject: 'patient',
        lawfulBasis: 'healthcare_treatment',
      },
    });
  }
  
  auditLog(action: string, entityType: string, entityId: string, userId: string, metadata?: Record<string, any>): void {
    this.info(LogCategory.AUDIT, `${entityType} ${action}`, {
      userId,
      metadata: {
        ...metadata,
        entityType,
        entityId,
        action,
      },
      compliance: {
        lgpdCategory: action.includes('delete') ? 'deletion' : 
                     action.includes('update') ? 'modification' : 
                     action.includes('create') ? 'processing' : 'access',
        retentionPeriod: 2555, // 7 years in days (healthcare requirement)
      },
    });
  }
  
  performanceLog(operation: string, duration: number, metadata?: Record<string, any>): void {
    this.info(LogCategory.PERFORMANCE, `Operation completed: ${operation}`, {
      performance: {
        duration,
        ...metadata,
      },
      metadata,
    });
  }
  
  securityEvent(event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>): void {
    const level = severity === 'critical' ? 'FATAL' : 
                 severity === 'high' ? 'ERROR' :
                 severity === 'medium' ? 'WARN' : 'INFO';
                 
    this.writeLog(this.createEntry(level, LogCategory.SECURITY, `Security event: ${event}`, {
      metadata: {
        ...metadata,
        severity,
        securityEvent: event,
      },
    }));
  }
}

// Generate correlation ID for request tracing
function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Singleton logger instance
export const logger = new HealthcareLogger();

// Request correlation middleware context
export interface RequestContext {
  correlationId: string;
  userId?: string;
  clinicId?: string;
  sessionId?: string;
  requestId?: string;
}

let requestContext: RequestContext | null = null;

export function setRequestContext(context: RequestContext): void {
  requestContext = context;
}

export function getRequestContext(): RequestContext | null {
  return requestContext;
}

export function clearRequestContext(): void {
  requestContext = null;
}

// Enhanced logger with automatic request context
export const contextLogger = {
  debug: (category: LogCategory, message: string, options?: Partial<LogEntry>) =>
    logger.debug(category, message, { ...requestContext, ...options }),
    
  info: (category: LogCategory, message: string, options?: Partial<LogEntry>) =>
    logger.info(category, message, { ...requestContext, ...options }),
    
  warn: (category: LogCategory, message: string, options?: Partial<LogEntry>) =>
    logger.warn(category, message, { ...requestContext, ...options }),
    
  error: (category: LogCategory, message: string, options?: Partial<LogEntry>) =>
    logger.error(category, message, { ...requestContext, ...options }),
    
  fatal: (category: LogCategory, message: string, options?: Partial<LogEntry>) =>
    logger.fatal(category, message, { ...requestContext, ...options }),
    
  patientAccess: (action: string, patientId: string, metadata?: Record<string, any>) =>
    logger.patientAccess(action, patientId, requestContext?.userId || 'unknown', requestContext?.clinicId || 'unknown', metadata),
    
  auditLog: (action: string, entityType: string, entityId: string, metadata?: Record<string, any>) =>
    logger.auditLog(action, entityType, entityId, requestContext?.userId || 'system', metadata),
    
  performanceLog: (operation: string, duration: number, metadata?: Record<string, any>) =>
    logger.performanceLog(operation, duration, metadata),
    
  securityEvent: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', metadata?: Record<string, any>) =>
    logger.securityEvent(event, severity, metadata),
};

// Export types for external use
export type { LogEntry, RequestContext };
// LogLevel and LogCategory already exported above