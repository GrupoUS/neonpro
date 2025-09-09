/**
 * Comprehensive Error Types and Interfaces for NeonPro Audit System
 *
 * This module defines the foundational error taxonomy, interfaces, and types
 * used throughout the audit system for consistent error handling and recovery.
 */

import { EventEmitter, } from 'events'

/**
 * Error severity levels for prioritizing response and recovery efforts
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Error categories for systematic classification
 */
export enum ErrorCategory {
  FILESYSTEM = 'filesystem',
  MEMORY = 'memory',
  PERFORMANCE = 'performance',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  NETWORK = 'network',
  VALIDATION = 'validation',
  CONSTITUTIONAL = 'constitutional',
  EXTERNAL_SERVICE = 'external_service',
  PARSING = 'parsing',
  SECURITY = 'security',
}

/**
 * Error recovery strategies
 */
export enum RecoveryStrategy {
  NONE = 'none',
  RETRY = 'retry',
  FALLBACK = 'fallback',
  GRACEFUL_DEGRADE = 'graceful_degrade',
  ROLLBACK = 'rollback',
  CIRCUIT_BREAK = 'circuit_break',
  RESOURCE_CLEANUP = 'resource_cleanup',
}

/**
 * Error context preservation interface
 */
export interface ErrorContext {
  /** Unique error identifier */
  errorId: string
  /** Timestamp when error occurred */
  timestamp: Date
  /** Component or module where error originated */
  component: string
  /** Operation or method being performed */
  operation: string
  /** User or system action that triggered the error */
  trigger?: string
  /** Current system state when error occurred */
  systemState: Record<string, any>
  /** Call stack trace */
  stackTrace: string
  /** Additional metadata */
  metadata: Record<string, any>
}

/**
 * Error classification result
 */
export interface ErrorClassification {
  /** Error category */
  category: ErrorCategory
  /** Severity level */
  severity: ErrorSeverity
  /** Whether error is recoverable */
  recoverable: boolean
  /** Recommended recovery strategy */
  recoveryStrategy: RecoveryStrategy
  /** Estimated impact score (0-1) */
  impactScore: number
  /** Confidence in classification (0-1) */
  confidence: number
}

/**
 * Recovery attempt result
 */
export interface RecoveryResult {
  /** Whether recovery succeeded */
  success: boolean
  /** Strategy used for recovery */
  strategy: RecoveryStrategy
  /** Time taken for recovery attempt */
  recoveryTime: number
  /** Number of attempts made */
  attemptCount: number
  /** Final error if recovery failed */
  finalError?: AuditError
  /** Recovery metadata */
  metadata: Record<string, any>
}

/**
 * Error report interface for comprehensive error documentation
 */
export interface ErrorReport {
  /** Error context information */
  context: ErrorContext
  /** Error classification */
  classification: ErrorClassification
  /** Original error details */
  originalError: Error
  /** Recovery attempts made */
  recoveryAttempts: RecoveryResult[]
  /** User-friendly error message */
  userMessage: string
  /** Technical error details */
  technicalDetails: string
  /** Recommended actions */
  recommendations: string[]
  /** Related errors or warnings */
  relatedErrors: AuditError[]
}

/**
 * Circuit breaker state
 */
export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerConfig {
  /** Failure threshold before opening circuit */
  failureThreshold: number
  /** Time to wait before attempting recovery */
  resetTimeout: number
  /** Number of successful calls needed to close circuit */
  successThreshold: number
  /** Timeout for individual operations */
  operationTimeout: number
  /** Maximum number of calls in half-open state */
  halfOpenMaxCalls: number
}

/**
 * Base audit error class with enhanced error handling capabilities
 */
export abstract class AuditError extends Error {
  public readonly errorId: string
  public readonly timestamp: Date
  public readonly category: ErrorCategory
  public readonly severity: ErrorSeverity
  public readonly recoverable: boolean
  public readonly context: ErrorContext
  public readonly innerError?: Error

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    recoverable: boolean = true,
    context?: Partial<ErrorContext>,
    innerError?: Error,
  ) {
    super(message,)
    this.name = this.constructor.name

    this.errorId = this.generateErrorId()
    this.timestamp = new Date()
    this.category = category
    this.severity = severity
    this.recoverable = recoverable
    this.innerError = innerError

    this.context = {
      errorId: this.errorId,
      timestamp: this.timestamp,
      component: context?.component || 'unknown',
      operation: context?.operation || 'unknown',
      trigger: context?.trigger,
      systemState: context?.systemState || {},
      stackTrace: this.stack || '',
      metadata: context?.metadata || {},
    }

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor,)
    }
  }

  private generateErrorId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36,).substr(2, 9,)}`
  }

  /**
   * Get user-friendly error message
   */
  public getUserMessage(): string {
    return `An error occurred: ${this.message}`
  }

  /**
   * Get technical details for debugging
   */
  public getTechnicalDetails(): string {
    return JSON.stringify(
      {
        errorId: this.errorId,
        category: this.category,
        severity: this.severity,
        context: this.context,
        innerError: this.innerError?.message,
      },
      null,
      2,
    )
  }

  /**
   * Convert to JSON for serialization
   */
  public toJSON(): Record<string, any> {
    return {
      errorId: this.errorId,
      name: this.name,
      message: this.message,
      category: this.category,
      severity: this.severity,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      innerError: this.innerError
        ? {
          name: this.innerError.name,
          message: this.innerError.message,
          stack: this.innerError.stack,
        }
        : undefined,
    }
  }
}

/**
 * File system related errors
 */
export class FileSystemError extends AuditError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly operation: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.FILESYSTEM,
      severity,
      true,
      {
        component: 'FileSystem',
        operation,
        metadata: { filePath, },
      },
      innerError,
    )
  }
}

/**
 * Memory and performance related errors
 */
export class PerformanceError extends AuditError {
  constructor(
    message: string,
    public readonly metric: string,
    public readonly actual: number,
    public readonly expected: number,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.PERFORMANCE,
      severity,
      true,
      {
        component: 'PerformanceMonitor',
        operation: 'metric_validation',
        metadata: { metric, actual, expected, ratio: actual / expected, },
      },
      innerError,
    )
  }
}

/**
 * Memory specific errors
 */
export class MemoryError extends AuditError {
  constructor(
    message: string,
    public readonly currentUsage: number,
    public readonly maxUsage: number,
    severity: ErrorSeverity = ErrorSeverity.CRITICAL,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.MEMORY,
      severity,
      true,
      {
        component: 'MemoryManager',
        operation: 'memory_validation',
        metadata: {
          currentUsage,
          maxUsage,
          usagePercentage: (currentUsage / maxUsage) * 100,
        },
      },
      innerError,
    )
  }
}

/**
 * Dependency analysis errors
 */
export class DependencyError extends AuditError {
  constructor(
    message: string,
    public readonly dependencyPath: string[],
    public readonly dependencyType: 'circular' | 'missing' | 'unused' | 'version_conflict',
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.DEPENDENCY,
      severity,
      true,
      {
        component: 'DependencyAnalyzer',
        operation: 'dependency_analysis',
        metadata: { dependencyPath, dependencyType, },
      },
      innerError,
    )
  }
}

/**
 * Configuration related errors
 */
export class ConfigurationError extends AuditError {
  constructor(
    message: string,
    public readonly configKey: string,
    public readonly configValue: any,
    public readonly expectedType: string,
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.CONFIGURATION,
      severity,
      false, // Configuration errors usually require manual intervention
      {
        component: 'ConfigurationManager',
        operation: 'config_validation',
        metadata: { configKey, configValue, expectedType, },
      },
      innerError,
    )
  }
}

/**
 * Network and external service errors
 */
export class NetworkError extends AuditError {
  constructor(
    message: string,
    public readonly endpoint: string,
    public readonly statusCode?: number,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.NETWORK,
      severity,
      true,
      {
        component: 'NetworkClient',
        operation: 'network_request',
        metadata: { endpoint, statusCode, },
      },
      innerError,
    )
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AuditError {
  constructor(
    message: string,
    public readonly validationType: string,
    public readonly invalidValue: any,
    public readonly validationRules: string[],
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.VALIDATION,
      severity,
      false, // Validation errors usually require input correction
      {
        component: 'Validator',
        operation: 'validation',
        metadata: { validationType, invalidValue, validationRules, },
      },
      innerError,
    )
  }
}

/**
 * Constitutional requirement violation errors
 */
export class ConstitutionalViolationError extends AuditError {
  constructor(
    message: string,
    public readonly requirement: string,
    public readonly actual: number,
    public readonly limit: number,
    public readonly metric: string,
    severity: ErrorSeverity = ErrorSeverity.CRITICAL,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.CONSTITUTIONAL,
      severity,
      false, // Constitutional violations are serious and may require architectural changes
      {
        component: 'ConstitutionalValidator',
        operation: 'constitutional_validation',
        metadata: {
          requirement,
          actual,
          limit,
          metric,
          violationPercentage: ((actual - limit) / limit) * 100,
        },
      },
      innerError,
    )
  }
}

/**
 * External service integration errors
 */
export class ExternalServiceError extends AuditError {
  constructor(
    message: string,
    public readonly serviceName: string,
    public readonly operation: string,
    public readonly serviceResponse?: any,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.EXTERNAL_SERVICE,
      severity,
      true,
      {
        component: 'ExternalServiceClient',
        operation,
        metadata: { serviceName, serviceResponse, },
      },
      innerError,
    )
  }
}

/**
 * Code parsing and analysis errors
 */
export class ParsingError extends AuditError {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly lineNumber?: number,
    public readonly columnNumber?: number,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.PARSING,
      severity,
      true,
      {
        component: 'Parser',
        operation: 'code_parsing',
        metadata: { filePath, lineNumber, columnNumber, },
      },
      innerError,
    )
  }
}

/**
 * Security related errors
 */
export class SecurityError extends AuditError {
  constructor(
    message: string,
    public readonly securityType: 'vulnerability' | 'compliance' | 'access' | 'data_protection',
    public readonly riskLevel: 'low' | 'medium' | 'high' | 'critical',
    severity: ErrorSeverity = ErrorSeverity.HIGH,
    innerError?: Error,
  ) {
    super(
      message,
      ErrorCategory.SECURITY,
      severity,
      false, // Security errors usually require careful manual review
      {
        component: 'SecurityAnalyzer',
        operation: 'security_analysis',
        metadata: { securityType, riskLevel, },
      },
      innerError,
    )
  }
}

/**
 * Interface for error handlers
 */
export interface ErrorHandler<T = any,> {
  canHandle(error: Error,): boolean
  handle(error: Error, context: ErrorContext,): Promise<T>
  getRecoveryStrategy(error: Error,): RecoveryStrategy
}

/**
 * Interface for error listeners
 */
export interface ErrorListener {
  onError(error: AuditError, context: ErrorContext,): Promise<void>
  onRecovery(error: AuditError, result: RecoveryResult,): Promise<void>
  onRecoveryFailure(error: AuditError, attempts: RecoveryResult[],): Promise<void>
}

/**
 * Error aggregation for batch processing
 */
export interface ErrorBatch {
  batchId: string
  errors: AuditError[]
  totalCount: number
  severityDistribution: Record<ErrorSeverity, number>
  categoryDistribution: Record<ErrorCategory, number>
  recoverableCount: number
  timestamp: Date
}

/**
 * Error metrics for monitoring and analysis
 */
export interface ErrorMetrics {
  totalErrors: number
  errorsByCategory: Record<ErrorCategory, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  recoverySuccessRate: number
  averageRecoveryTime: number
  mostCommonErrors: { error: string; count: number }[]
  errorTrends: { timestamp: Date; count: number }[]
}

/**
 * State snapshot for rollback capabilities
 */
export interface StateSnapshot {
  snapshotId: string
  timestamp: Date
  component: string
  operation: string
  state: Record<string, any>
  checksum: string
  dependencies: string[]
}

/**
 * Rollback operation result
 */
export interface RollbackResult {
  success: boolean
  snapshotId: string
  rollbackTime: number
  restoredState: Record<string, any>
  affectedComponents: string[]
  warnings: string[]
}

/**
 * Utility functions for error handling
 */
export class ErrorUtils {
  /**
   * Check if error is recoverable based on its type and context
   */
  static isRecoverable(error: Error,): boolean {
    if (error instanceof AuditError) {
      return error.recoverable
    }

    // Assess recoverability for native errors
    if (error instanceof TypeError || error instanceof ReferenceError) {
      return false // Usually programming errors
    }

    if (error instanceof RangeError && error.message.includes('Maximum call stack',)) {
      return false // Stack overflow
    }

    return true // Assume other errors are potentially recoverable
  }

  /**
   * Extract error severity from error type and context
   */
  static getSeverity(error: Error,): ErrorSeverity {
    if (error instanceof AuditError) {
      return error.severity
    }

    // Assess severity for native errors
    if (error.message.includes('out of memory',) || error.message.includes('heap',)) {
      return ErrorSeverity.CRITICAL
    }

    if (error instanceof TypeError || error instanceof ReferenceError) {
      return ErrorSeverity.HIGH
    }

    return ErrorSeverity.MEDIUM
  }

  /**
   * Calculate error impact score based on severity, category, and context
   */
  static calculateImpactScore(error: AuditError, context: ErrorContext,): number {
    let baseScore = 0

    // Severity contribution (40%)
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        baseScore += 0.4
        break
      case ErrorSeverity.HIGH:
        baseScore += 0.3
        break
      case ErrorSeverity.MEDIUM:
        baseScore += 0.2
        break
      case ErrorSeverity.LOW:
        baseScore += 0.1
        break
    }

    // Category contribution (30%)
    switch (error.category) {
      case ErrorCategory.CONSTITUTIONAL:
      case ErrorCategory.SECURITY:
      case ErrorCategory.MEMORY:
        baseScore += 0.3
        break
      case ErrorCategory.PERFORMANCE:
      case ErrorCategory.FILESYSTEM:
        baseScore += 0.2
        break
      default:
        baseScore += 0.1
        break
    }

    // Context contribution (30%)
    const contextScore = context.systemState.criticalOperation ? 0.3 : 0.15
    baseScore += contextScore

    return Math.min(baseScore, 1.0,)
  }

  /**
   * Create standardized error message for users
   */
  static formatUserMessage(error: AuditError,): string {
    const severityEmoji = {
      [ErrorSeverity.CRITICAL]: '🔴',
      [ErrorSeverity.HIGH]: '🟠',
      [ErrorSeverity.MEDIUM]: '🟡',
      [ErrorSeverity.LOW]: '⚪',
    }

    return `${severityEmoji[error.severity]} ${
      error.category.replace('_', ' ',).toUpperCase()
    }: ${error.message}`
  }

  /**
   * Generate error correlation ID for tracking related errors
   */
  static generateCorrelationId(context: ErrorContext,): string {
    const components = [
      context.component,
      context.operation,
      context.timestamp.getTime().toString(),
    ]

    return components.join('_',).toLowerCase()
  }
}

/**
 * Error event types for the error handling system
 */
export enum ErrorEventType {
  ERROR_OCCURRED = 'error_occurred',
  RECOVERY_STARTED = 'recovery_started',
  RECOVERY_SUCCESS = 'recovery_success',
  RECOVERY_FAILED = 'recovery_failed',
  CIRCUIT_OPENED = 'circuit_opened',
  CIRCUIT_CLOSED = 'circuit_closed',
  DEGRADATION_ACTIVATED = 'degradation_activated',
  STATE_ROLLBACK = 'state_rollback',
}

/**
 * Error event data structure
 */
export interface ErrorEvent {
  type: ErrorEventType
  timestamp: Date
  error: AuditError
  context: ErrorContext
  data?: Record<string, any>
}
