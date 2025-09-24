/**
 * Comprehensive Error Handling Patterns for NeonPro Quality Control System
 *
 * Implements standardized error handling, logging, and recovery mechanisms
 * across the healthcare platform with LGPD compliance.
 */

import { EventEmitter } from 'events';

// Error Types and Classifications
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  SECURITY = 'security',
  HEALTHCARE_COMPLIANCE = 'healthcare_compliance',
  PERFORMANCE = 'performance',
  NETWORK = 'network',
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  patientId?: string;
  facilityId?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  feature: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export interface StandardError {
  id: string;
  code: string;
  message: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: ErrorContext;
  stack?: string;
  cause?: Error;
  recoverable: boolean;
  retryable: boolean;
  healthcareRelated: boolean;
  lgpdRelevant: boolean;
}

// Error Handler Configuration
export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableNotifications: boolean;
  enableRecovery: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  healthcareMode: boolean;
  lgpdCompliance: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Healthcare-specific Error Patterns
export class HealthcareErrorHandler extends EventEmitter {
  private config: ErrorHandlerConfig;
  private recoveryStrategies: Map<string, (error: StandardError) => Promise<void>>;
  private errorCounts: Map<string, number>;
  private lastErrorTimes: Map<string, Date>;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    super();

    this.config = {
      enableLogging: true,
      enableNotifications: true,
      enableRecovery: true,
      maxRetryAttempts: 3,
      retryDelayMs: 1000,
      healthcareMode: true,
      lgpdCompliance: true,
      logLevel: 'error',
      ...config,
    };

    this.recoveryStrategies = new Map();
    this.errorCounts = new Map();
    this.lastErrorTimes = new Map();

    this.setupDefaultRecoveryStrategies();
  }

  /**
   * Handle error with comprehensive logging, recovery, and compliance
   */
  async handleError(error: Error | StandardError, context: Partial<ErrorContext>): Promise<void> {
    const standardError = this.normalizeError(error, context);

    try {
      // Log error with appropriate detail level
      await this.logError(standardError);

      // Healthcare compliance checks
      if (this.config.healthcareMode && standardError.healthcareRelated) {
        await this.handleHealthcareError(standardError);
      }

      // LGPD compliance for data-related errors
      if (this.config.lgpdCompliance && standardError.lgpdRelevant) {
        await this.handleLGPDError(standardError);
      }

      // Attempt error recovery
      if (this.config.enableRecovery && standardError.recoverable) {
        await this.attemptRecovery(standardError);
      }

      // Emit error event for external handlers
      this.emit('error', standardError);

      // Critical error notifications
      if (standardError.severity === ErrorSeverity.CRITICAL) {
        await this.sendCriticalAlert(standardError);
      }
    } catch (handlingError) {
      // Fallback error handling to prevent cascading failures
      console.error('Error in error handler:', handlingError);
      console.error('Original error:', standardError);
    }
  }

  /**
   * Normalize various error types to StandardError format
   */
  private normalizeError(
    error: Error | StandardError,
    context: Partial<ErrorContext>,
  ): StandardError {
    if (this.isStandardError(error)) {
      return error;
    }

    const errorId = this.generateErrorId();
    const errorCode = this.generateErrorCode(error, context);

    return {
      id: errorId,
      code: errorCode,
      message: error.message || 'Unknown error occurred',
      severity: this.determineSeverity(error, context),
      category: this.categorizeError(error, context),
      context: this.enrichContext(context),
      stack: error.stack,
      cause: error,
      recoverable: this.isRecoverable(error, context),
      retryable: this.isRetryable(error, context),
      healthcareRelated: this.isHealthcareRelated(error, context),
      lgpdRelevant: this.isLGPDRelevant(error, context),
    };
  }

  /**
   * Healthcare-specific error handling
   */
  private async handleHealthcareError(error: StandardError): Promise<void> {
    // Patient data access errors
    if (error.context.patientId) {
      await this.auditPatientDataAccess(error);
    }

    // Medical device integration errors
    if (error.category === ErrorCategory.HEALTHCARE_COMPLIANCE) {
      await this.notifyHealthcareCompliance(error);
    }

    // Clinical workflow interruptions
    if (error.severity === ErrorSeverity.CRITICAL && error.healthcareRelated) {
      await this.triggerClinicalWorkflowAlert(error);
    }
  }

  /**
   * LGPD compliance error handling
   */
  private async handleLGPDError(error: StandardError): Promise<void> {
    // Data processing consent violations
    if (error.message.includes('consent') || error.message.includes('lgpd')) {
      await this.handleConsentViolation(error);
    }

    // Data anonymization failures
    if (error.category === ErrorCategory.SECURITY && error.lgpdRelevant) {
      await this.handleAnonymizationFailure(error);
    }

    // Cross-border data transfer issues
    if (error.message.includes('transfer') || error.message.includes('export')) {
      await this.handleDataTransferViolation(error);
    }
  }

  /**
   * Attempt automated error recovery
   */
  private async attemptRecovery(error: StandardError): Promise<void> {
    const recoveryStrategy = this.recoveryStrategies.get(error.code)
      || this.recoveryStrategies.get(error.category)
      || this.recoveryStrategies.get('default');

    if (recoveryStrategy) {
      const attemptKey = `${error.code}_${error.context.sessionId}`;
      const attempts = this.errorCounts.get(attemptKey) || 0;

      if (attempts < this.config.maxRetryAttempts) {
        this.errorCounts.set(attemptKey, attempts + 1);

        try {
          await this.delay(this.config.retryDelayMs * Math.pow(2, attempts));
          await recoveryStrategy(error);

          // Reset counter on successful recovery
          this.errorCounts.delete(attemptKey);
        } catch (recoveryError) {
          console.error(`Recovery attempt ${attempts + 1} failed:`, recoveryError);

          if (attempts + 1 >= this.config.maxRetryAttempts) {
            await this.escalateError(error);
          }
        }
      } else {
        await this.escalateError(error);
      }
    }
  }

  /**
   * Setup default recovery strategies
   */
  private setupDefaultRecoveryStrategies(): void {
    // Network retry strategy
    this.recoveryStrategies.set(ErrorCategory.NETWORK, async (error: StandardError) => {
      console.log(`Attempting network recovery for error: ${error.id}`);
      // Implement network retry logic
    });

    // Database connection recovery
    this.recoveryStrategies.set(ErrorCategory.DATABASE, async (error: StandardError) => {
      console.log(`Attempting database recovery for error: ${error.id}`);
      // Implement database reconnection logic
    });

    // Authentication token refresh
    this.recoveryStrategies.set(ErrorCategory.AUTHENTICATION, async (error: StandardError) => {
      console.log(`Attempting authentication recovery for error: ${error.id}`);
      // Implement token refresh logic
    });

    // Default recovery strategy
    this.recoveryStrategies.set('default', async (error: StandardError) => {
      console.log(`Attempting default recovery for error: ${error.id}`);
      // Implement generic recovery logic
    });
  }

  /**
   * Comprehensive error logging with healthcare compliance
   */
  private async logError(error: StandardError): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      errorId: error.id,
      code: error.code,
      message: error.message,
      severity: error.severity,
      category: error.category,
      userId: error.context.userId,
      sessionId: error.context.sessionId,
      feature: error.context.feature,
      action: error.context.action,
      healthcareRelated: error.healthcareRelated,
      lgpdRelevant: error.lgpdRelevant,
      // Sanitize sensitive data for logging
      metadata: this.sanitizeMetadata(error.context.metadata),
    };

    // Different log levels based on severity
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('CRITICAL ERROR:', logEntry);
        break;
      case ErrorSeverity.HIGH:
        console.error('HIGH SEVERITY ERROR:', logEntry);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('MEDIUM SEVERITY ERROR:', logEntry);
        break;
      case ErrorSeverity.LOW:
        console.info('LOW SEVERITY ERROR:', logEntry);
        break;
    }

    // Store in healthcare audit log if relevant
    if (error.healthcareRelated || error.lgpdRelevant) {
      await this.storeHealthcareAuditLog(logEntry);
    }
  }

  /**
   * Utility methods
   */
  private isStandardError(error: any): error is StandardError {
    return error && typeof error === 'object' && 'id' in error && 'code' in error;
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateErrorCode(error: Error, context: Partial<ErrorContext>): string {
    const category = this.categorizeError(error, context);
    const timestamp = Date.now().toString().slice(-6);
    return `${category.toUpperCase()}_${timestamp}`;
  }

  private determineSeverity(error: Error, context: Partial<ErrorContext>): ErrorSeverity {
    // Healthcare-related errors are automatically high severity
    if (this.isHealthcareRelated(error, context)) {
      return ErrorSeverity.HIGH;
    }

    // Security and LGPD errors are critical
    if (this.isLGPDRelevant(error, context) || error.message.includes('security')) {
      return ErrorSeverity.CRITICAL;
    }

    // Network and validation errors are medium
    if (error.message.includes('network') || error.message.includes('validation')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  private categorizeError(error: Error, context: Partial<ErrorContext>): ErrorCategory {
    const message = error.message.toLowerCase();

    if (
      message.includes('patient') || message.includes('medical') || message.includes('clinical')
    ) {
      return ErrorCategory.HEALTHCARE_COMPLIANCE;
    }
    if (message.includes('lgpd') || message.includes('consent') || message.includes('privacy')) {
      return ErrorCategory.SECURITY;
    }
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('permission') || message.includes('unauthorized')) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (
      message.includes('network') || message.includes('connection') || message.includes('timeout')
    ) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('database') || message.includes('sql') || message.includes('query')) {
      return ErrorCategory.DATABASE;
    }
    if (
      message.includes('validation') || message.includes('invalid') || message.includes('format')
    ) {
      return ErrorCategory.VALIDATION;
    }
    if (message.includes('performance') || message.includes('slow') || message.includes('memory')) {
      return ErrorCategory.PERFORMANCE;
    }

    return ErrorCategory.BUSINESS_LOGIC;
  }

  private enrichContext(context: Partial<ErrorContext>): ErrorContext {
    return {
      userId: context.userId,
      sessionId: context.sessionId || `session_${Date.now()}`,
      requestId: context.requestId || `req_${Date.now()}`,
      patientId: context.patientId,
      facilityId: context.facilityId,
      timestamp: new Date(),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      feature: context.feature || 'unknown',
      action: context.action || 'unknown',
      metadata: context.metadata || {},
    };
  }

  private isRecoverable(error: Error, context: Partial<ErrorContext>): boolean {
    const message = error.message.toLowerCase();
    return message.includes('network')
      || message.includes('timeout')
      || message.includes('connection')
      || message.includes('retry');
  }

  private isRetryable(error: Error, context: Partial<ErrorContext>): boolean {
    const message = error.message.toLowerCase();
    return message.includes('network')
      || message.includes('timeout')
      || message.includes('temporary')
      || message.includes('busy');
  }

  private isHealthcareRelated(error: Error, context: Partial<ErrorContext>): boolean {
    const message = error.message.toLowerCase();
    return message.includes('patient')
      || message.includes('medical')
      || message.includes('clinical')
      || message.includes('healthcare')
      || !!context.patientId
      || !!context.facilityId;
  }

  private isLGPDRelevant(error: Error, context: Partial<ErrorContext>): boolean {
    const message = error.message.toLowerCase();
    return message.includes('lgpd')
      || message.includes('consent')
      || message.includes('privacy')
      || message.includes('personal')
      || message.includes('data protection');
  }

  private sanitizeMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
    if (!metadata) return {};

    const sanitized = { ...metadata };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'cpf', 'cnpj', 'email'];
    sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private async auditPatientDataAccess(error: StandardError): Promise<void> {
    console.log(`Auditing patient data access error: ${error.id}`);
    // Implement patient data access audit
  }

  private async notifyHealthcareCompliance(error: StandardError): Promise<void> {
    console.log(`Notifying healthcare compliance team: ${error.id}`);
    // Implement healthcare compliance notification
  }

  private async triggerClinicalWorkflowAlert(error: StandardError): Promise<void> {
    console.log(`Triggering clinical workflow alert: ${error.id}`);
    // Implement clinical workflow alert
  }

  private async handleConsentViolation(error: StandardError): Promise<void> {
    console.log(`Handling LGPD consent violation: ${error.id}`);
    // Implement consent violation handling
  }

  private async handleAnonymizationFailure(error: StandardError): Promise<void> {
    console.log(`Handling data anonymization failure: ${error.id}`);
    // Implement anonymization failure handling
  }

  private async handleDataTransferViolation(error: StandardError): Promise<void> {
    console.log(`Handling data transfer violation: ${error.id}`);
    // Implement data transfer violation handling
  }

  private async escalateError(error: StandardError): Promise<void> {
    console.error(`Escalating error after max retry attempts: ${error.id}`);
    // Implement error escalation
  }

  private async sendCriticalAlert(error: StandardError): Promise<void> {
    console.error(`CRITICAL ALERT: ${error.id} - ${error.message}`);
    // Implement critical alert system
  }

  private async storeHealthcareAuditLog(logEntry: any): Promise<void> {
    console.log(`Storing healthcare audit log: ${logEntry.errorId}`);
    // Implement healthcare audit log storage
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Add custom recovery strategy
   */
  addRecoveryStrategy(errorCode: string, strategy: (error: StandardError) => Promise<void>): void {
    this.recoveryStrategies.set(errorCode, strategy);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): { errorCounts: Map<string, number>; lastErrorTimes: Map<string, Date> } {
    return {
      errorCounts: new Map(this.errorCounts),
      lastErrorTimes: new Map(this.lastErrorTimes),
    };
  }
}

// Export default instance for healthcare mode
export const healthcareErrorHandler = new HealthcareErrorHandler({
  healthcareMode: true,
  lgpdCompliance: true,
  enableRecovery: true,
  maxRetryAttempts: 3,
});

// Error boundary for React components
export class ErrorBoundary extends Error {
  constructor(message: string, public context: Partial<ErrorContext> = {}) {
    super(message);
    this.name = 'ErrorBoundary';
  }
}

// Async error wrapper
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    await healthcareErrorHandler.handleError(error as Error, context);
    throw error;
  }
}

export default HealthcareErrorHandler;
