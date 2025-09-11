/**
 * NeonPro Audit System - Error Tracker
 *
 * Constitutional-grade error tracking and classification system.
 * Tracks errors with context, classification, and recovery suggestions.
 */

import { EventEmitter } from 'events';
import { Logger } from './logger';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory =
  | 'validation'
  | 'performance'
  | 'integration'
  | 'constitutional'
  | 'system'
  | 'user';

export interface ErrorContext {
  timestamp: number;
  component: string;
  operation: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

export interface ClassifiedError {
  id: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  originalError: Error;
  context: ErrorContext;
  stackTrace?: string;
  constitutional?: {
    violation: boolean;
    requirement?: string;
    impact?: string;
  };
  recovery?: {
    attempted: boolean;
    successful?: boolean;
    suggestion?: string;
  };
  tags: string[];
}

export interface ErrorStats {
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
  byCategory: Record<ErrorCategory, number>;
  recentErrors: ClassifiedError[];
  errorRate: number;
  recoveryRate: number;
}

export class ErrorTracker extends EventEmitter {
  private errors: ClassifiedError[] = [];
  private logger: Logger;
  private maxStoredErrors: number;
  private errorPatterns: Map<string, ErrorPattern> = new Map();

  constructor(config: {
    maxStoredErrors?: number;
    logger?: Logger;
  } = {}) {
    super();

    this.maxStoredErrors = config.maxStoredErrors || 1000;
    this.logger = config.logger || Logger.getInstance();

    this.initializeErrorPatterns();
  }

  /**
   * Track and classify an error
   */
  trackError(
    error: Error,
    context: Partial<ErrorContext> = {},
  ): ClassifiedError {
    const fullContext: ErrorContext = {
      timestamp: Date.now(),
      component: 'unknown',
      operation: 'unknown',
      ...context,
    };

    const classifiedError = this.classifyError(error, fullContext);

    // Store error
    this.errors.push(classifiedError);
    if (this.errors.length > this.maxStoredErrors) {
      this.errors.shift();
    }

    // Log error
    this.logError(classifiedError);

    // Emit event
    this.emit('error:tracked', classifiedError);

    // Attempt recovery if pattern exists
    this.attemptRecovery(classifiedError);

    return classifiedError;
  }

  /**
   * Classify error based on patterns and context
   */
  private classifyError(error: Error, context: ErrorContext): ClassifiedError {
    const id = this.generateErrorId();
    const message = error.message || 'Unknown error';

    // Determine severity
    const severity = this.determineSeverity(error, context);

    // Determine category
    const category = this.determineCategory(error, context);

    // Check constitutional violations
    const constitutional = this.checkConstitutionalViolation(error, context);

    // Generate tags
    const tags = this.generateTags(error, context, severity, category);

    return {
      id,
      severity,
      category,
      message,
      originalError: error,
      context,
      stackTrace: error.stack,
      constitutional,
      recovery: {
        attempted: false,
      },
      tags,
    };
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, context: ErrorContext): ErrorSeverity {
    const message = error.message.toLowerCase();
    const component = context.component.toLowerCase();

    // Constitutional violations are always critical
    if (this.isConstitutionalViolation(error, context)) {
      return 'critical';
    }

    // System-level errors
    if (
      message.includes('out of memory') || message.includes('heap')
      || message.includes('cannot allocate')
    ) {
      return 'critical';
    }

    // Performance-related critical errors
    if (
      component.includes('performance')
      && (message.includes('timeout') || message.includes('exceeded'))
    ) {
      return 'high';
    }

    // Validation errors are usually medium severity
    if (component.includes('validator') || message.includes('validation')) {
      return 'medium';
    }

    // Default classification based on error type
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return 'high';
    }

    return 'low';
  }

  /**
   * Determine error category
   */
  private determineCategory(error: Error, context: ErrorContext): ErrorCategory {
    const message = error.message.toLowerCase();
    const component = context.component.toLowerCase();
    const operation = context.operation.toLowerCase();

    if (this.isConstitutionalViolation(error, context)) {
      return 'constitutional';
    }

    if (component.includes('validator') || operation.includes('validate')) {
      return 'validation';
    }

    if (component.includes('performance') || operation.includes('benchmark')) {
      return 'performance';
    }

    if (component.includes('integration') || operation.includes('integration')) {
      return 'integration';
    }

    if (
      message.includes('enoent') || message.includes('permission')
      || message.includes('system')
    ) {
      return 'system';
    }

    return 'user';
  }

  /**
   * Check for constitutional violations
   */
  private checkConstitutionalViolation(
    error: Error,
    context: ErrorContext,
  ): ClassifiedError['constitutional'] {
    const isViolation = this.isConstitutionalViolation(error, context);

    if (!isViolation) {
      return { violation: false };
    }

    const message = error.message.toLowerCase();

    if (message.includes('memory') || message.includes('heap')) {
      return {
        violation: true,
        requirement: 'Memory limit (<2GB)',
        impact: 'System may fail constitutional compliance',
      };
    }

    if (message.includes('time') || message.includes('timeout')) {
      return {
        violation: true,
        requirement: 'Time limit (<4 hours)',
        impact: 'Processing may exceed constitutional time limit',
      };
    }

    if (message.includes('file') && message.includes('count')) {
      return {
        violation: true,
        requirement: 'Minimum file count (10,000+)',
        impact: 'May not meet constitutional file processing requirements',
      };
    }

    return {
      violation: true,
      requirement: 'Constitutional compliance',
      impact: 'Unknown constitutional impact',
    };
  }

  /**
   * Check if error represents constitutional violation
   */
  private isConstitutionalViolation(error: Error, context: ErrorContext): boolean {
    const message = error.message.toLowerCase();
    const component = context.component.toLowerCase();

    return component.includes('constitutional')
      || message.includes('constitutional')
      || message.includes('memory limit')
      || message.includes('time limit')
      || (message.includes('file') && message.includes('minimum'));
  }

  /**
   * Generate tags for error classification
   */
  private generateTags(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity,
    category: ErrorCategory,
  ): string[] {
    const tags: Set<string> = new Set();

    // Add basic tags
    tags.add(severity);
    tags.add(category);
    tags.add(context.component);

    // Add error type tags
    tags.add(error.constructor.name.toLowerCase());

    // Add contextual tags
    if (context.operation !== 'unknown') {
      tags.add(context.operation);
    }

    // Add message-based tags
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) tags.add('timeout');
    if (message.includes('memory')) tags.add('memory');
    if (message.includes('file')) tags.add('file');
    if (message.includes('network')) tags.add('network');
    if (message.includes('validation')) tags.add('validation');

    return Array.from(tags);
  }

  /**
   * Attempt error recovery based on patterns
   */
  private attemptRecovery(error: ClassifiedError): void {
    const pattern = this.findRecoveryPattern(error);

    if (pattern) {
      error.recovery = {
        attempted: true,
        suggestion: pattern.recovery,
      };

      // Execute recovery if possible
      if (pattern.autoRecover) {
        this.executeRecovery(error, pattern);
      }
    }
  }

  /**
   * Find recovery pattern for error
   */
  private findRecoveryPattern(error: ClassifiedError): ErrorPattern | undefined {
    // Try exact message match first
    const exactPattern = this.errorPatterns.get(error.message);
    if (exactPattern) return exactPattern;

    // Try pattern matching
    for (const [pattern, errorPattern] of this.errorPatterns) {
      if (
        error.message.includes(pattern)
        || error.tags.some(tag => pattern.includes(tag))
      ) {
        return errorPattern;
      }
    }

    return undefined;
  }

  /**
   * Execute automated recovery
   */
  private executeRecovery(error: ClassifiedError, pattern: ErrorPattern): void {
    try {
      if (pattern.recoveryFunction) {
        pattern.recoveryFunction(error);
        error.recovery!.successful = true;
        this.emit('error:recovered', error);
      }
    } catch (recoveryError) {
      error.recovery!.successful = false;
      this.logger.error(
        `Recovery failed for error ${error.id}`,
        'ErrorTracker',
        { originalError: error.message, recoveryError: recoveryError.message },
      );
    }
  }

  /**
   * Log classified error
   */
  private logError(error: ClassifiedError): void {
    const level = error.severity === 'critical' ? 'critical' : 'error';

    this.logger.constitutional(
      level,
      `${error.category.toUpperCase()}: ${error.message}`,
      error.context.component,
      !error.constitutional?.violation,
      error.constitutional?.requirement,
      error.constitutional?.impact,
      {
        errorId: error.id,
        severity: error.severity,
        tags: error.tags,
        context: error.context,
      },
    );
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeWindow?: number): ErrorStats {
    const cutoff = timeWindow ? Date.now() - timeWindow : 0;
    const relevantErrors = this.errors.filter(e => e.context.timestamp >= cutoff);

    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    const byCategory: Record<ErrorCategory, number> = {
      validation: 0,
      performance: 0,
      integration: 0,
      constitutional: 0,
      system: 0,
      user: 0,
    };

    let recoveryCount = 0;

    relevantErrors.forEach(error => {
      bySeverity[error.severity]++;
      byCategory[error.category]++;
      if (error.recovery?.successful) recoveryCount++;
    });

    return {
      total: relevantErrors.length,
      bySeverity,
      byCategory,
      recentErrors: relevantErrors.slice(-10),
      errorRate: relevantErrors.length / Math.max(1, timeWindow ? timeWindow / 1000 : 3600),
      recoveryRate: relevantErrors.length > 0 ? recoveryCount / relevantErrors.length : 0,
    };
  }

  /**
   * Initialize error patterns for recovery
   */
  private initializeErrorPatterns(): void {
    this.errorPatterns.set('ENOENT', {
      category: 'system',
      severity: 'medium',
      recovery: 'Check file path and permissions',
      autoRecover: false,
    });

    this.errorPatterns.set('timeout', {
      category: 'performance',
      severity: 'high',
      recovery: 'Retry with exponential backoff',
      autoRecover: true,
      recoveryFunction: error => {
        // Implement retry logic
        this.emit('error:retry-requested', error);
      },
    });

    this.errorPatterns.set('memory', {
      category: 'constitutional',
      severity: 'critical',
      recovery: 'Reduce memory usage or increase limits',
      autoRecover: false,
    });
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear old errors beyond retention limit
   */
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.errors = this.errors.filter(e => e.context.timestamp >= cutoff);
    this.emit('errors:cleared', { cutoff, remaining: this.errors.length });
  }
}

interface ErrorPattern {
  category: ErrorCategory;
  severity: ErrorSeverity;
  recovery: string;
  autoRecover: boolean;
  recoveryFunction?: (error: ClassifiedError) => void;
}

export default ErrorTracker;
