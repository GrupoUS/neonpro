/**
 * 🔒 SECURE LOGGER - LGPD Compliant Logging System
 *
 * Features:
 * - Automatic sensitive data masking
 * - LGPD compliance built-in
 * - Structured logging with winston
 * - Environment-based log levels
 * - Audit trail support
 */

import winston from 'winston';
import { format } from 'winston';

// LGPD Sensitive Data Patterns
const SENSITIVE_PATTERNS = {
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+55\s?)?(?:\(\d{2}\)\s?)?\d{4,5}-?\d{4}\b/g,
  creditCard: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
  password: /("password"|"senha"|"token"|"secret"|"key"):\s*"[^"]+"/gi,
  authorization: /("authorization"|"bearer"):\s*"[^"]+"/gi,
};

const SENSITIVE_KEYS = [
  'password',
  'senha',
  'token',
  'secret',
  'key',
  'authorization',
  'bearer',
  'cpf',
  'cnpj',
  'rg',
  'passport',
  'credit_card',
  'card_number',
  'cvv',
  'pin',
  'otp',
  'medical_record',
];

interface LoggerConfig {
  level?: string;
  maskSensitiveData?: boolean;
  lgpdCompliant?: boolean;
  auditTrail?: boolean;
  service?: string;
}

interface LogContext {
  userId?: string;
  patientId?: string;
  operation?: string;
  endpoint?: string;
  ip?: string;
  userAgent?: string;
  timestamp?: string;
  correlationId?: string;
}

class SecureLogger {
  private logger: winston.Logger;
  private config: Required<LoggerConfig>;

  constructor(config: LoggerConfig = {}) {
    this.config = {
      level: config.level || (process.env.NODE_ENV === 'production' ? 'warn' : 'debug'),
      maskSensitiveData: config.maskSensitiveData ?? true,
      lgpdCompliant: config.lgpdCompliant ?? true,
      auditTrail: config.auditTrail ?? true,
      service: config.service || 'neonpro-api',
    };

    this.logger = winston.createLogger({
      level: this.config.level,
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json(),
        format.printf(this.formatLog.bind(this)),
      ),
      defaultMeta: {
        service: this.config.service,
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        new winston.transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple(),
          ),
        }),
        ...(process.env.NODE_ENV === 'production'
          ? [
            new winston.transports.File({
              filename: 'logs/error.log',
              level: 'error',
            }),
            new winston.transports.File({
              filename: 'logs/combined.log',
            }),
          ]
          : []),
      ],
    });
  }

  private formatLog(info: any): string {
    const { timestamp, level, message, service, environment, ...meta } = info;

    const logEntry = {
      timestamp,
      level,
      service,
      environment,
      message: this.config.maskSensitiveData ? this.maskSensitiveData(message) : message,
      ...this.maskObjectData(meta),
    };

    return JSON.stringify(logEntry);
  }

  private maskSensitiveData(text: string): string {
    if (!this.config.maskSensitiveData || typeof text !== 'string') {
      return text;
    }

    let maskedText = text;

    // Apply pattern-based masking
    Object.entries(SENSITIVE_PATTERNS).forEach(([, pattern]) => {
      maskedText = maskedText.replace(pattern, match => {
        const visibleChars = Math.min(3, Math.floor(match.length * 0.3));
        return match.substring(0, visibleChars) + '*'.repeat(match.length - visibleChars);
      });
    });

    return maskedText;
  }

  private maskObjectData(obj: any): any {
    if (!this.config.maskSensitiveData || !obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.maskObjectData(item));
    }

    const masked: any = {};

    Object.entries(obj).forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();

      if (SENSITIVE_KEYS.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
        masked[key] = this.maskValue(value);
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = this.maskObjectData(value);
      } else if (typeof value === 'string') {
        masked[key] = this.maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    });

    return masked;
  }

  private maskValue(value: any): string {
    if (typeof value !== 'string') {
      return '[MASKED]';
    }

    if (value.length <= 3) {
      return '*'.repeat(value.length);
    }

    const visibleChars = Math.min(3, Math.floor(value.length * 0.3));
    return value.substring(0, visibleChars) + '*'.repeat(value.length - visibleChars);
  }

  // Public logging methods
  debug(message: string, context?: LogContext): void {
    this.logger.debug(message, this.enrichContext(context));
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(message, this.enrichContext(context));
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(message, this.enrichContext(context));
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const enrichedContext = this.enrichContext(context);

    if (error) {
      (enrichedContext as any).error = {
        name: error.name,
        message: this.config.maskSensitiveData
          ? this.maskSensitiveData(error.message)
          : error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      };
    }

    this.logger.error(message, enrichedContext);
  }

  // LGPD Compliance Methods
  auditDataAccess(context: {
    userId: string;
    patientId?: string;
    operation: string;
    dataType: string;
    endpoint: string;
    ip: string;
    userAgent: string;
  }): void {
    if (!this.config.auditTrail) return;

    this.logger.info('LGPD_DATA_ACCESS_AUDIT', {
      ...context,
      auditType: 'data_access',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    });
  }

  auditDataModification(context: {
    userId: string;
    patientId?: string;
    operation: 'CREATE' | 'UPDATE' | 'DELETE';
    dataType: string;
    recordId?: string;
    changes?: string[];
  }): void {
    if (!this.config.auditTrail) return;

    this.logger.info('LGPD_DATA_MODIFICATION_AUDIT', {
      ...context,
      auditType: 'data_modification',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    });
  }

  auditConsentChange(context: {
    patientId: string;
    consentType: string;
    previousValue: boolean;
    newValue: boolean;
    changedBy: string;
  }): void {
    if (!this.config.auditTrail) return;

    this.logger.info('LGPD_CONSENT_CHANGE_AUDIT', {
      ...context,
      auditType: 'consent_change',
      timestamp: new Date().toISOString(),
      compliance: 'LGPD',
    });
  }

  private enrichContext(context?: LogContext): LogContext {
    return {
      ...context,
      timestamp: new Date().toISOString(),
      correlationId: context?.correlationId || this.generateCorrelationId(),
    };
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Factory function for creating logger instances
export function createLogger(config?: LoggerConfig): SecureLogger {
  return new SecureLogger(config);
}

// Default logger instance
export const logger = createLogger({
  service: 'neonpro-api',
  maskSensitiveData: true,
  lgpdCompliant: true,
  auditTrail: true,
});

// Export types for TypeScript support
export type { LogContext, LoggerConfig };
export { SecureLogger };
