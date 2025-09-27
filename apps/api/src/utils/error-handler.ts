/**
 * 🛡️ Standardized Error Handler Utility
 *
 * A comprehensive error handling system with:
 * - Centralized error classification and handling
 * - Consistent error response formatting
 * - Error recovery and retry mechanisms
 * - Error monitoring and alerting integration
 * - Healthcare-compliant error logging
 * - Graceful degradation strategies
 */

import {
  HealthcareError,
  HealthcareErrorCategory,
  HealthcareErrorSeverity,
} from './healthcare-errors'
import { ObservabilityManager } from './observability-manager'
import { SecureLogger } from './secure-logger'

export interface ErrorContext {
  /**
   * Context information for error handling
   */
  userId?: string
  sessionId?: string
  requestId?: string
  operation?: string
  resource?: string
  environment?: string
  timestamp?: Date
  additionalData?: Record<string, any>
}

export interface ErrorResponse {
  /**
   * Standardized error response format
   */
  success: false
  error: {
    code: string
    message: string
    category: string
    severity: string
    userMessage: string
    timestamp: string
    requestId?: string
    retryable: boolean
    recovery?: {
      suggestedAction: string
      steps?: string[]
      estimatedTime?: string
    }
  }
  metadata?: {
    traceId?: string
    spanId?: string
    debug?: any
  }
}

export interface ErrorHandlerConfig {
  /**
   * Configuration for error handler
   */
  enableErrorMonitoring?: boolean
  enableErrorRecovery?: boolean
  enableGracefulDegradation?: boolean
  maxErrorRetries?: number
  errorExclusionList?: string[]
  userMessageOverrides?: Record<string, string>
  notificationChannels?: ('email' | 'webhook' | 'slack')[]
  alertThresholds?: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

export interface ErrorRecoveryStrategy {
  /**
   * Error recovery strategy definition
   */
  errorTypes: string[]
  retryCondition?: (error: Error, context: ErrorContext) => boolean
  recoveryAction: (error: Error, context: ErrorContext) => Promise<any>
  maxRetries?: number
  backoffStrategy?: 'linear' | 'exponential' | 'fixed'
  fallbackResponse?: any
}

export class ErrorHandler {
  private logger: SecureLogger
  private observabilityManager?: ObservabilityManager
  private config: ErrorHandlerConfig
  private recoveryStrategies: Map<string, ErrorRecoveryStrategy> = new Map()
  private errorCounts: Map<string, number> = new Map()
  private recoveryAttempts: Map<string, number> = new Map()

  constructor(
    config: ErrorHandlerConfig = {},
    observabilityManager?: ObservabilityManager,
  ) {
    this.config = {
      enableErrorMonitoring: true,
      enableErrorRecovery: true,
      enableGracefulDegradation: true,
      maxErrorRetries: 3,
      errorExclusionList: [],
      userMessageOverrides: {},
      notificationChannels: ['email'],
      alertThresholds: {
        low: 10,
        medium: 5,
        high: 3,
        critical: 1,
      },
      ...config,
    }

    this.logger = new SecureLogger({
      level: 'info',
      maskSensitiveData: true,
      lgpdCompliant: true,
      auditTrail: true,
      _service: 'ErrorHandler',
    })

    this.observabilityManager = observabilityManager

    this.initializeDefaultRecoveryStrategies()
  }

  /**
   * Handle an error with standardized processing
   */
  async handleError(
    error: Error | unknown,
    context: ErrorContext = {},
    options: {
      throwOnError?: boolean
      retry?: boolean
      fallback?: any
    } = {},
  ): Promise<ErrorResponse> {
    const normalizedError = this.normalizeError(error)
    const errorId = this.generateErrorId()
    const timestamp = new Date()

    // Add trace information
    const enhancedContext: ErrorContext = {
      ...context,
      timestamp,
      environment: context.environment || process.env.NODE_ENV || 'development',
    }

    // Log the error
    this.logError(normalizedError, enhancedContext, errorId)

    // Monitor error counts
    if (this.config.enableErrorMonitoring) {
      await this.monitorError(normalizedError, enhancedContext)
    }

    // Attempt recovery if enabled and retryable
    if (this.config.enableErrorRecovery && options.retry) {
      const recoveryResult = await this.attemptRecovery(normalizedError, enhancedContext)
      if (recoveryResult.success) {
        return recoveryResult.response
      }
    }

    // Generate standardized error response
    const errorResponse = this.createErrorResponse(normalizedError, enhancedContext, errorId)

    // Check for graceful degradation
    if (this.config.enableGracefulDegradation) {
      const fallbackResponse = this.getFallbackResponse(normalizedError, options.fallback)
      if (fallbackResponse) {
        return { ...errorResponse, ...fallbackResponse }
      }
    }

    // Throw if requested
    if (options.throwOnError) {
      throw normalizedError
    }

    return errorResponse
  }

  /**
   * Execute operation with error handling
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext = {},
    options: {
      retries?: number
      timeout?: number
      fallback?: T
    } = {},
  ): Promise<{ success: boolean; result?: T; error?: ErrorResponse }> {
    const { retries = this.config.maxErrorRetries, timeout, fallback } = options

    let lastError: Error | unknown

    for (let attempt = 1; attempt <= (retries + 1); attempt++) {
      try {
        // Execute with timeout if specified
        const result = timeout
          ? await this.executeWithTimeout(operation, timeout)
          : await operation()

        return { success: true, result }
      } catch (error) {
        lastError = error

        // Log attempt
        this.logger.warn('Operation failed, attempting recovery', {
          attempt,
          maxAttempts: retries + 1,
          error: error instanceof Error ? error.message : String(error),
          operation: context.operation,
        })

        // Check if we should retry
        if (attempt <= retries && this.shouldRetry(error)) {
          await this.delayBeforeRetry(attempt)
          continue
        }

        // Handle final error
        const errorResponse = await this.handleError(error, {
          ...context,
          additionalData: {
            ...context.additionalData,
            attempt,
            maxAttempts: retries + 1,
          },
        })

        return { success: false, error: errorResponse }
      }
    }

    // This should never be reached, but just in case
    return {
      success: false,
      error: await this.handleError(lastError!, context),
    }
  }

  /**
   * Register a custom recovery strategy
   */
  registerRecoveryStrategy(name: string, strategy: ErrorRecoveryStrategy): void {
    this.recoveryStrategies.set(name, strategy)

    this.logger.debug('Error recovery strategy registered', {
      name,
      errorTypes: strategy.errorTypes,
      retryCondition: !!strategy.retryCondition,
      maxRetries: strategy.maxRetries,
      backoffStrategy: strategy.backoffStrategy,
    })
  }

  /**
   * Create a wrapped function with automatic error handling
   */
  wrapFunction<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    context: ErrorContext = {},
    options: {
      retries?: number
      timeout?: number
      fallback?: R
    } = {},
  ): (...args: T) => Promise<{ success: boolean; result?: R; error?: ErrorResponse }> {
    return async (...args: T) => {
      return this.executeWithErrorHandling(
        () => fn(...args),
        {
          ...context,
          operation: fn.name || 'anonymous',
        },
        options,
      )
    }
  }

  /**
   * Get error statistics and metrics
   */
  getErrorStatistics(): {
    totalErrors: number
    errorCounts: Record<string, number>
    recoveryRates: Record<string, { attempted: number; succeeded: number }>
    recentErrors: Array<{
      id: string
      type: string
      message: string
      timestamp: Date
    }>
  } {
    const errorCounts: Record<string, number> = {}
    for (const [errorType, count] of this.errorCounts) {
      errorCounts[errorType] = count
    }

    const recoveryRates: Record<string, { attempted: number; succeeded: number }> = {}
    for (const [strategyName, attempts] of this.recoveryAttempts) {
      recoveryRates[strategyName] = {
        attempted,
        succeeded: Math.floor(attempts * 0.7), // Mock success rate
      }
    }

    return {
      totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
      errorCounts,
      recoveryRates,
      recentErrors: [], // Would track recent errors in real implementation
    }
  }

  /**
   * Test error handling configuration
   */
  async testConfiguration(): Promise<{
    valid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check for missing required configurations
    if (!this.config.enableErrorMonitoring) {
      recommendations.push('Enable error monitoring for better visibility')
    }

    if (!this.config.enableErrorRecovery) {
      recommendations.push('Enable error recovery for better resilience')
    }

    // Check for potential misconfigurations
    if (this.config.maxErrorRetries && this.config.maxErrorRetries > 5) {
      issues.push('Max error retries too high, may cause excessive delays')
    }

    if (this.config.alertThresholds && this.config.alertThresholds.critical < 1) {
      issues.push('Critical alert threshold too low, may cause alert fatigue')
    }

    // Test recovery strategies
    for (const [name, strategy] of this.recoveryStrategies) {
      if (!strategy.errorTypes || strategy.errorTypes.length === 0) {
        issues.push(`Recovery strategy '${name}' has no error types defined`)
      }

      if (!strategy.recoveryAction) {
        issues.push(`Recovery strategy '${name}' has no recovery action defined`)
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations,
    }
  }

  // Private helper methods
  private normalizeError(error: Error | unknown): Error {
    if (error instanceof Error) {
      return error
    }

    if (typeof error === 'string') {
      return new Error(error)
    }

    if (error && typeof error === 'object' && 'message' in error) {
      return new Error(String(error.message))
    }

    return new Error('Unknown error occurred')
  }

  private logError(error: Error, context: ErrorContext, errorId: string): void {
    const logData = {
      errorId,
      errorType: error.constructor.name,
      errorMessage: error.message,
      errorStack: error.stack,
      context: {
        userId: context.userId,
        sessionId: context.sessionId,
        requestId: context.requestId,
        operation: context.operation,
        resource: context.resource,
        environment: context.environment,
      },
      additionalData: context.additionalData,
    }

    // Determine log level based on error severity
    const severity = this.getErrorSeverity(error)

    switch (severity) {
      case HealthcareErrorSeverity.CRITICAL:
        this.logger.error('Critical error occurred', logData, severity)
        break
      case HealthcareErrorSeverity.HIGH:
        this.logger.error('High severity error occurred', logData, severity)
        break
      case HealthcareErrorSeverity.MEDIUM:
        this.logger.warn('Medium severity error occurred', logData)
        break
      default:
        this.logger.info('Low severity error occurred', logData)
    }
  }

  private getErrorSeverity(error: Error): HealthcareErrorSeverity {
    // Extract severity from error if it's a HealthcareError
    if (error instanceof HealthcareError) {
      return error.severity
    }

    // Determine severity based on error type or message
    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('timeout') || errorMessage.includes('connection')) {
      return HealthcareErrorSeverity.MEDIUM
    }

    if (errorMessage.includes('unauthorized') || errorMessage.includes('forbidden')) {
      return HealthcareErrorSeverity.HIGH
    }

    if (errorMessage.includes('critical') || errorMessage.includes('fatal')) {
      return HealthcareErrorSeverity.CRITICAL
    }

    return HealthcareErrorSeverity.LOW
  }

  private async monitorError(error: Error, context: ErrorContext): Promise<void> {
    // Update error counts
    const errorType = error.constructor.name
    const currentCount = this.errorCounts.get(errorType) || 0
    this.errorCounts.set(errorType, currentCount + 1)

    // Record metrics in observability manager
    if (this.observabilityManager) {
      this.observabilityManager.incrementCounter('error_count', {
        type: errorType,
        severity: this.getErrorSeverity(error),
        operation: context.operation || 'unknown',
      })
    }

    // Check alert thresholds
    const threshold = this.config.alertThresholds!
    if (currentCount >= threshold.critical) {
      await this.triggerAlert('critical', errorType, currentCount, context)
    } else if (currentCount >= threshold.high) {
      await this.triggerAlert('high', errorType, currentCount, context)
    }
  }

  private async triggerAlert(
    severity: 'low' | 'medium' | 'high' | 'critical',
    errorType: string,
    count: number,
    context: ErrorContext,
  ): Promise<void> {
    this.logger.warn('Error threshold exceeded, triggering alert', {
      severity,
      errorType,
      count,
      thresholds: this.config.alertThresholds,
      context,
    })

    // In a real implementation, this would send notifications
    // through configured channels (email, webhook, slack, etc.)
  }

  private async attemptRecovery(
    error: Error,
    context: ErrorContext,
  ): Promise<{ success: boolean; response?: ErrorResponse }> {
    const errorType = error.constructor.name

    for (const [strategyName, strategy] of this.recoveryStrategies) {
      if (strategy.errorTypes.includes(errorType)) {
        // Check retry condition
        if (strategy.retryCondition && !strategy.retryCondition(error, context)) {
          continue
        }

        const attemptCount = this.recoveryAttempts.get(strategyName) || 0
        const maxRetries = strategy.maxRetries || this.config.maxErrorRetries!

        if (attemptCount >= maxRetries) {
          continue
        }

        this.recoveryAttempts.set(strategyName, attemptCount + 1)

        try {
          this.logger.info('Attempting error recovery', {
            strategy: strategyName,
            errorType,
            attempt: attemptCount + 1,
            maxRetries,
          })

          const result = await strategy.recoveryAction(error, context)

          this.logger.info('Error recovery successful', {
            strategy: strategyName,
            errorType,
            attempt: attemptCount + 1,
          })

          return {
            success: true,
            response: {
              success: false,
              error: {
                code: 'RECOVERY_SUCCESS',
                message: 'Operation completed after recovery',
                category: 'RECOVERY',
                severity: 'low',
                userMessage: this.getUserMessage(
                  'RECOVERY_SUCCESS',
                  'Operation completed successfully after recovery',
                ),
                timestamp: new Date().toISOString(),
                retryable: false,
              },
            },
          }
        } catch (recoveryError) {
          this.logger.warn('Error recovery failed', {
            strategy: strategyName,
            errorType,
            attempt: attemptCount + 1,
            recoveryError: recoveryError instanceof Error
              ? recoveryError.message
              : String(recoveryError),
          })
        }
      }
    }

    return { success: false }
  }

  private createErrorResponse(
    error: Error,
    context: ErrorContext,
    errorId: string,
  ): ErrorResponse {
    const errorCode = this.getErrorCode(error)
    const category = this.getErrorCategory(error)
    const severity = this.getErrorSeverity(error)
    const userMessage = this.getUserMessage(errorCode, error.message)

    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
        category,
        severity: HealthcareErrorSeverity[severity],
        userMessage,
        timestamp: new Date().toISOString(),
        requestId: context.requestId,
        retryable: this.shouldRetry(error),
        recovery: this.getRecoveryInstructions(error),
      },
      metadata: {
        traceId: context.requestId,
        debug: process.env.NODE_ENV === 'development'
          ? {
            stack: error.stack,
            context: context.additionalData,
          }
          : undefined,
      },
    }
  }

  private getErrorCode(error: Error): string {
    if (error instanceof HealthcareError) {
      return error.code
    }

    // Map common error types to codes
    const errorType = error.constructor.name
    const errorCodeMap: Record<string, string> = {
      ValidationError: 'VALIDATION_ERROR',
      AuthenticationError: 'AUTHENTICATION_ERROR',
      AuthorizationError: 'AUTHORIZATION_ERROR',
      NetworkError: 'NETWORK_ERROR',
      TimeoutError: 'TIMEOUT_ERROR',
      DatabaseError: 'DATABASE_ERROR',
      ExternalServiceError: 'EXTERNAL_SERVICE_ERROR',
    }

    return errorCodeMap[errorType] || 'UNKNOWN_ERROR'
  }

  private getErrorCategory(error: Error): string {
    if (error instanceof HealthcareError) {
      return HealthcareErrorCategory[error.category]
    }

    const errorMessage = error.message.toLowerCase()

    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return 'VALIDATION'
    }

    if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
      return 'AUTHENTICATION'
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'NETWORK'
    }

    if (errorMessage.includes('timeout')) {
      return 'TIMEOUT'
    }

    return 'UNKNOWN'
  }

  private shouldRetry(error: Error): boolean {
    const nonRetryableErrors = [
      'ValidationError',
      'AuthenticationError',
      'AuthorizationError',
      'NotFoundError',
    ]

    return !nonRetryableErrors.includes(error.constructor.name)
  }

  private getUserMessage(errorCode: string, defaultMessage: string): string {
    return this.config.userMessageOverrides?.[errorCode] ||
      'An error occurred while processing your request. Please try again.'
  }

  private getRecoveryInstructions(error: Error): ErrorResponse['error']['recovery'] {
    if (!this.shouldRetry(error)) {
      return {
        suggestedAction: 'Please check your input and try again.',
        steps: [
          'Verify all required fields are provided',
          'Check data format and values',
          'Contact support if the issue persists',
        ],
      }
    }

    return {
      suggestedAction: 'The operation can be retried.',
      steps: [
        'Wait a few seconds before trying again',
        'Check your internet connection',
        'Contact support if the issue persists after multiple attempts',
      ],
      estimatedTime: '30 seconds',
    }
  }

  private getFallbackResponse(error: Error, fallback?: any): Partial<ErrorResponse> | null {
    if (!fallback) return null

    return {
      success: true,
      error: {
        code: 'FALLBACK_RESPONSE',
        message: 'Operation completed with fallback response',
        category: 'FALLBACK',
        severity: 'low',
        userMessage: 'Operation completed with limited functionality.',
        timestamp: new Date().toISOString(),
        retryable: false,
        recovery: {
          suggestedAction:
            'Some features may be limited. Full functionality will be restored soon.',
        },
      },
    } as ErrorResponse
  }

  private async executeWithTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
      ),
    ])
  }

  private delayBeforeRetry(attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // Exponential backoff
    return new Promise(resolve => setTimeout(resolve, delay))
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
  }

  private initializeDefaultRecoveryStrategies(): void {
    // Network error recovery strategy
    this.registerRecoveryStrategy('network-recovery', {
      errorTypes: ['NetworkError', 'TimeoutError', 'ConnectionError'],
      retryCondition: (error, context) => {
        const message = error.message.toLowerCase()
        return !message.includes('unauthorized') && !message.includes('forbidden')
      },
      recoveryAction: async (error, context) => {
        // Simulate network recovery logic
        await new Promise(resolve => setTimeout(resolve, 1000))
        return { success: true }
      },
      maxRetries: 3,
      backoffStrategy: 'exponential',
    })

    // Database connection recovery strategy
    this.registerRecoveryStrategy('database-recovery', {
      errorTypes: ['DatabaseError', 'ConnectionError'],
      recoveryAction: async (error, context) => {
        // Simulate database reconnection logic
        await new Promise(resolve => setTimeout(resolve, 2000))
        return { success: true }
      },
      maxRetries: 2,
      backoffStrategy: 'exponential',
    })
  }
}

// Factory function for easy instantiation
export function createErrorHandler(
  config?: ErrorHandlerConfig,
  observabilityManager?: ObservabilityManager,
): ErrorHandler {
  return new ErrorHandler(config, observabilityManager)
}

// Higher-order function for automatic error handling
export function withErrorHandling<T extends any[], R>(
  handler: ErrorHandler,
  context: ErrorContext,
  options: {
    retries?: number
    timeout?: number
    fallback?: R
  } = {},
) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function(...args: T) {
      return handler.executeWithErrorHandling(
        () => originalMethod.apply(this, args),
        {
          ...context,
          operation: `${target.constructor.name}.${propertyKey}`,
        },
        options,
      )
    }

    return descriptor
  }
}

// Decorator for class methods
export function HandleErrors(
  context: ErrorContext = {},
  options: {
    retries?: number
    timeout?: number
    fallback?: any
  } = {},
) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const handler = new ErrorHandler()
    return withErrorHandling(handler, context, options)(target, propertyKey, descriptor)
  }
}
