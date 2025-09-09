import { EventEmitter, } from 'events'
import { LogContext, logger, } from './Logger.js'
import { performanceMonitor, } from './PerformanceMonitor.js'

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  NETWORK = 'network',
  FILE_SYSTEM = 'file_system',
  PARSING = 'parsing',
  VALIDATION = 'validation',
  TIMEOUT = 'timeout',
  MEMORY = 'memory',
  PERMISSION = 'permission',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  USER_INPUT = 'user_input',
  UNKNOWN = 'unknown',
}

export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  SKIP = 'skip',
  ABORT = 'abort',
  DEGRADE = 'degrade',
}

export interface ErrorContext {
  operation: string
  component: string
  input?: any
  metadata?: Record<string, any>
  userContext?: LogContext
  timestamp: number
  stackTrace?: string
}

export interface ClassifiedError {
  originalError: Error
  category: ErrorCategory
  severity: ErrorSeverity
  recoveryStrategy: RecoveryStrategy
  context: ErrorContext
  isRecoverable: boolean
  retryable: boolean
  userFriendlyMessage: string
}

export interface RetryConfig {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  backoffMultiplier: number
  jitterFactor: number
  retryableErrors: ErrorCategory[]
}

export interface CircuitBreakerConfig {
  failureThreshold: number
  timeoutMs: number
  resetTimeoutMs: number
  monitoringPeriodMs: number
}

export interface FallbackConfig<T,> {
  fallbackValue?: T
  fallbackFunction?: () => T | Promise<T>
  enableGracefulDegradation: boolean
}

export interface ErrorHandlerConfig {
  enableRetry: boolean
  enableCircuitBreaker: boolean
  enableFallback: boolean
  enableGracefulDegradation: boolean
  defaultRetry: RetryConfig
  defaultCircuitBreaker: CircuitBreakerConfig
  logErrors: boolean
  reportMetrics: boolean
}

export class ErrorClassifier {
  private static readonly ERROR_PATTERNS = new Map<
    RegExp,
    { category: ErrorCategory; severity: ErrorSeverity }
  >([
    // Network errors
    [/ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENETUNREACH/i, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
    },],
    [/fetch.*failed|network.*error|connection.*error/i, {
      category: ErrorCategory.NETWORK,
      severity: ErrorSeverity.MEDIUM,
    },],

    // File system errors
    [/ENOENT|EACCES|EPERM|EEXIST|EMFILE|ENFILE/i, {
      category: ErrorCategory.FILE_SYSTEM,
      severity: ErrorSeverity.MEDIUM,
    },],
    [/no such file|permission denied|access denied|file not found/i, {
      category: ErrorCategory.FILE_SYSTEM,
      severity: ErrorSeverity.MEDIUM,
    },],

    // Memory errors
    [/out of memory|maximum call stack|heap.*exceeded/i, {
      category: ErrorCategory.MEMORY,
      severity: ErrorSeverity.CRITICAL,
    },],

    // Parsing errors
    [/syntax.*error|parse.*error|invalid.*json|malformed/i, {
      category: ErrorCategory.PARSING,
      severity: ErrorSeverity.LOW,
    },],

    // Timeout errors
    [/timeout|timed out|deadline exceeded/i, {
      category: ErrorCategory.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
    },],

    // Validation errors
    [/validation.*error|invalid.*input|schema.*error/i, {
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.LOW,
    },],

    // Configuration errors
    [/config.*error|setting.*error|invalid.*configuration/i, {
      category: ErrorCategory.CONFIGURATION,
      severity: ErrorSeverity.HIGH,
    },],
  ],)

  static classify(error: Error, context: ErrorContext,): ClassifiedError {
    let category = ErrorCategory.UNKNOWN
    let severity = ErrorSeverity.MEDIUM

    // Check error message against patterns
    const errorMessage = error.message.toLowerCase()
    for (const [pattern, classification,] of this.ERROR_PATTERNS) {
      if (pattern.test(errorMessage,) || pattern.test(error.name.toLowerCase(),)) {
        category = classification.category
        severity = classification.severity
        break
      }
    }

    // Additional classification based on error type
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      category = ErrorCategory.USER_INPUT
      severity = ErrorSeverity.LOW
    } else if (error.name === 'RangeError') {
      category = ErrorCategory.VALIDATION
      severity = ErrorSeverity.MEDIUM
    }

    const isRecoverable = this.isRecoverable(category, severity,)
    const retryable = this.isRetryable(category,)
    const recoveryStrategy = this.getRecoveryStrategy(category, severity, isRecoverable,)
    const userFriendlyMessage = this.getUserFriendlyMessage(category, error.message,)

    return {
      originalError: error,
      category,
      severity,
      recoveryStrategy,
      context,
      isRecoverable,
      retryable,
      userFriendlyMessage,
    }
  }

  private static isRecoverable(category: ErrorCategory, severity: ErrorSeverity,): boolean {
    if (severity === ErrorSeverity.CRITICAL) return false

    const recoverableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.FILE_SYSTEM,
      ErrorCategory.PARSING,
      ErrorCategory.VALIDATION,
    ]

    return recoverableCategories.includes(category,)
  }

  private static isRetryable(category: ErrorCategory,): boolean {
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.TIMEOUT,
      ErrorCategory.FILE_SYSTEM,
    ]

    return retryableCategories.includes(category,)
  }

  private static getRecoveryStrategy(
    category: ErrorCategory,
    severity: ErrorSeverity,
    isRecoverable: boolean,
  ): RecoveryStrategy {
    if (!isRecoverable) return RecoveryStrategy.ABORT
    if (severity === ErrorSeverity.CRITICAL) return RecoveryStrategy.ABORT

    switch (category) {
      case ErrorCategory.NETWORK:
      case ErrorCategory.TIMEOUT:
        return RecoveryStrategy.RETRY

      case ErrorCategory.FILE_SYSTEM:
        return RecoveryStrategy.FALLBACK

      case ErrorCategory.PARSING:
      case ErrorCategory.VALIDATION:
        return RecoveryStrategy.SKIP

      case ErrorCategory.CONFIGURATION:
        return RecoveryStrategy.DEGRADE

      default:
        return RecoveryStrategy.RETRY
    }
  }

  private static getUserFriendlyMessage(category: ErrorCategory, originalMessage: string,): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Network connection failed. Please check your internet connection and try again.'

      case ErrorCategory.FILE_SYSTEM:
        return 'File system operation failed. Please check file permissions and availability.'

      case ErrorCategory.PARSING:
        return 'Failed to parse file content. The file may be corrupted or in an unsupported format.'

      case ErrorCategory.VALIDATION:
        return 'Input validation failed. Please check the provided data and try again.'

      case ErrorCategory.TIMEOUT:
        return 'Operation timed out. This may be due to high system load or network latency.'

      case ErrorCategory.MEMORY:
        return 'Insufficient memory to complete operation. Try closing other applications or processing smaller datasets.'

      case ErrorCategory.PERMISSION:
        return 'Permission denied. Please check file and directory permissions.'

      case ErrorCategory.CONFIGURATION:
        return 'Configuration error detected. Please check your settings and try again.'

      default:
        return originalMessage
    }
  }
}
export class RetryMechanism {
  private static async delay(ms: number,): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms,))
  }

  private static calculateDelay(attempt: number, config: RetryConfig,): number {
    const exponentialDelay = config.initialDelayMs
      * Math.pow(config.backoffMultiplier, attempt - 1,)
    const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs,)

    // Add jitter to prevent thundering herd
    const jitter = cappedDelay * config.jitterFactor * Math.random()
    return Math.round(cappedDelay + jitter,)
  }

  static async execute<T,>(
    operation: () => Promise<T>,
    config: RetryConfig,
    context: ErrorContext,
  ): Promise<T> {
    let lastError: ClassifiedError

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const operationId = performanceMonitor.startOperation(
          `retry_${context.operation}`,
          context.userContext,
          [`attempt_${attempt}`,],
        )
        const result = await operation()
        performanceMonitor.endOperation(operationId,)

        if (attempt > 1) {
          logger.info(`Operation succeeded after ${attempt} attempts`, {
            component: 'RetryMechanism',
            operation: context.operation,
            metadata: { attempts: attempt, totalAttempts: config.maxAttempts, },
            ...context.userContext,
          },)
        }

        return result
      } catch (error) {
        const classifiedError = ErrorClassifier.classify(error as Error, {
          ...context,
          timestamp: Date.now(),
        },)

        lastError = classifiedError

        // Check if error is retryable
        if (
          !classifiedError.retryable || !config.retryableErrors.includes(classifiedError.category,)
        ) {
          logger.debug(`Error not retryable: ${classifiedError.category}`, {
            component: 'RetryMechanism',
            operation: context.operation,
            ...context.userContext,
          },)
          throw classifiedError
        }

        // Don't retry on last attempt
        if (attempt === config.maxAttempts) {
          logger.error(`Operation failed after ${attempt} attempts`, {
            component: 'RetryMechanism',
            operation: context.operation,
            metadata: {
              attempts: attempt,
              errorCategory: classifiedError.category,
              errorSeverity: classifiedError.severity,
            },
            ...context.userContext,
          }, error as Error,)
          throw classifiedError
        }

        const delay = this.calculateDelay(attempt, config,)

        logger.warn(
          `Operation failed, retrying in ${delay}ms (attempt ${attempt}/${config.maxAttempts})`,
          {
            component: 'RetryMechanism',
            operation: context.operation,
            metadata: {
              attempt,
              maxAttempts: config.maxAttempts,
              delay,
              errorCategory: classifiedError.category,
            },
            ...context.userContext,
          },
        )

        await this.delay(delay,)
      }
    }

    throw lastError!
  }
}

export enum CircuitBreakerState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

export class CircuitBreaker extends EventEmitter {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED
  private failures = 0
  private lastFailureTime = 0
  private successCount = 0
  private requestCount = 0

  constructor(
    private name: string,
    private config: CircuitBreakerConfig,
  ) {
    super()
    this.startMonitoring()
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.resetMetrics()
    }, this.config.monitoringPeriodMs,)
  }

  private resetMetrics(): void {
    if (this.state === CircuitBreakerState.CLOSED) {
      this.requestCount = 0
      this.successCount = 0
    }
  }

  private shouldAttemptReset(): boolean {
    return this.state === CircuitBreakerState.OPEN
      && Date.now() - this.lastFailureTime >= this.config.resetTimeoutMs
  }

  private onSuccess(): void {
    this.failures = 0
    this.successCount++

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED
      logger.info(`Circuit breaker closed: ${this.name}`, {
        component: 'CircuitBreaker',
        metadata: { circuitName: this.name, state: this.state, },
      },)
      this.emit('stateChange', this.state,)
    }
  }

  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()

    if (
      this.state === CircuitBreakerState.HALF_OPEN
      || (this.state === CircuitBreakerState.CLOSED
        && this.failures >= this.config.failureThreshold)
    ) {
      this.state = CircuitBreakerState.OPEN
      logger.warn(`Circuit breaker opened: ${this.name}`, {
        component: 'CircuitBreaker',
        metadata: {
          circuitName: this.name,
          state: this.state,
          failures: this.failures,
          threshold: this.config.failureThreshold,
        },
      },)
      this.emit('stateChange', this.state,)
    }
  }

  async execute<T,>(operation: () => Promise<T>, context: ErrorContext,): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN
        logger.info(`Circuit breaker half-open: ${this.name}`, {
          component: 'CircuitBreaker',
          metadata: { circuitName: this.name, state: this.state, },
        },)
        this.emit('stateChange', this.state,)
      } else {
        const error = new Error(`Circuit breaker is open for ${this.name}`,)
        const classifiedError = ErrorClassifier.classify(error, context,)
        classifiedError.category = ErrorCategory.DEPENDENCY
        classifiedError.recoveryStrategy = RecoveryStrategy.FALLBACK
        throw classifiedError
      }
    }

    this.requestCount++

    try {
      const operationId = performanceMonitor.startOperation(
        `circuit_breaker_${context.operation}`,
        context.userContext,
      )

      const timeoutPromise = new Promise<never>((_, reject,) => {
        setTimeout(() => {
          reject(new Error(`Circuit breaker timeout: ${this.name}`,),)
        }, this.config.timeoutMs,)
      },)

      const result = await Promise.race([operation(), timeoutPromise,],)

      performanceMonitor.endOperation(operationId,)
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  getState(): CircuitBreakerState {
    return this.state
  }

  getMetrics(): {
    state: CircuitBreakerState
    failures: number
    requestCount: number
    successCount: number
    successRate: number
  } {
    return {
      state: this.state,
      failures: this.failures,
      requestCount: this.requestCount,
      successCount: this.successCount,
      successRate: this.requestCount > 0 ? this.successCount / this.requestCount : 0,
    }
  }

  reset(): void {
    this.state = CircuitBreakerState.CLOSED
    this.failures = 0
    this.lastFailureTime = 0
    this.successCount = 0
    this.requestCount = 0

    logger.info(`Circuit breaker reset: ${this.name}`, {
      component: 'CircuitBreaker',
      metadata: { circuitName: this.name, state: this.state, },
    },)

    this.emit('stateChange', this.state,)
  }
}
export class ErrorHandler extends EventEmitter {
  private circuitBreakers = new Map<string, CircuitBreaker>()
  private errorMetrics = new Map<string, { count: number; lastOccurrence: number }>()

  constructor(private config: ErrorHandlerConfig,) {
    super()
  }

  private getOrCreateCircuitBreaker(name: string,): CircuitBreaker {
    if (!this.circuitBreakers.has(name,)) {
      const circuitBreaker = new CircuitBreaker(name, this.config.defaultCircuitBreaker,)

      circuitBreaker.on('stateChange', (state,) => {
        this.emit('circuitBreakerStateChange', { name, state, },)
      },)

      this.circuitBreakers.set(name, circuitBreaker,)
    }

    return this.circuitBreakers.get(name,)!
  }

  private recordError(error: ClassifiedError,): void {
    if (!this.config.reportMetrics) return

    const key = `${error.category}_${error.severity}`
    const current = this.errorMetrics.get(key,) || { count: 0, lastOccurrence: 0, }

    this.errorMetrics.set(key, {
      count: current.count + 1,
      lastOccurrence: Date.now(),
    },)

    this.emit('errorRecorded', error,)
  }

  private logError(error: ClassifiedError,): void {
    if (!this.config.logErrors) return

    const context = {
      component: 'ErrorHandler',
      operation: error.context.operation,
      metadata: {
        category: error.category,
        severity: error.severity,
        recoveryStrategy: error.recoveryStrategy,
        isRecoverable: error.isRecoverable,
        retryable: error.retryable,
      },
      ...error.context.userContext,
    }

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        logger.error(`Critical error in ${error.context.operation}`, context, error.originalError,)
        break
      case ErrorSeverity.HIGH:
        logger.error(
          `High severity error in ${error.context.operation}`,
          context,
          error.originalError,
        )
        break
      case ErrorSeverity.MEDIUM:
        logger.warn(`Medium severity error in ${error.context.operation}`, context,)
        break
      case ErrorSeverity.LOW:
        logger.info(`Low severity error in ${error.context.operation}`, context,)
        break
    }
  }

  async handleWithRetry<T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    retryConfig?: Partial<RetryConfig>,
  ): Promise<T> {
    const config = { ...this.config.defaultRetry, ...retryConfig, }

    try {
      return await RetryMechanism.execute(operation, config, context,)
    } catch (error) {
      const classifiedError = error as ClassifiedError
      this.recordError(classifiedError,)
      this.logError(classifiedError,)
      throw classifiedError
    }
  }

  async handleWithCircuitBreaker<T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    circuitBreakerName: string = context.operation,
  ): Promise<T> {
    const circuitBreaker = this.getOrCreateCircuitBreaker(circuitBreakerName,)

    try {
      return await circuitBreaker.execute(operation, context,)
    } catch (error) {
      let classifiedError: ClassifiedError

      if (error instanceof Error && !(error as any).category) {
        classifiedError = ErrorClassifier.classify(error, context,)
      } else {
        classifiedError = error as ClassifiedError
      }

      this.recordError(classifiedError,)
      this.logError(classifiedError,)
      throw classifiedError
    }
  }

  async handleWithFallback<T,>(
    operation: () => Promise<T>,
    fallbackConfig: FallbackConfig<T>,
    context: ErrorContext,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const classifiedError = ErrorClassifier.classify(error as Error, context,)
      this.recordError(classifiedError,)
      this.logError(classifiedError,)

      if (!this.config.enableFallback) {
        throw classifiedError
      }

      logger.warn(`Using fallback for failed operation: ${context.operation}`, {
        component: 'ErrorHandler',
        operation: context.operation,
        metadata: { errorCategory: classifiedError.category, },
        ...context.userContext,
      },)

      if (fallbackConfig.fallbackFunction) {
        try {
          const result = await fallbackConfig.fallbackFunction()
          this.emit('fallbackUsed', { context, result, },)
          return result
        } catch (fallbackError) {
          logger.error(`Fallback function failed for ${context.operation}`, {
            component: 'ErrorHandler',
            operation: context.operation,
            ...context.userContext,
          }, fallbackError as Error,)

          if (fallbackConfig.fallbackValue !== undefined) {
            this.emit('fallbackUsed', { context, result: fallbackConfig.fallbackValue, },)
            return fallbackConfig.fallbackValue
          }
        }
      } else if (fallbackConfig.fallbackValue !== undefined) {
        this.emit('fallbackUsed', { context, result: fallbackConfig.fallbackValue, },)
        return fallbackConfig.fallbackValue
      }

      throw classifiedError
    }
  }

  async handleWithFullRecovery<T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options: {
      retryConfig?: Partial<RetryConfig>
      fallbackConfig?: FallbackConfig<T>
      useCircuitBreaker?: boolean
      circuitBreakerName?: string
    } = {},
  ): Promise<T> {
    const {
      retryConfig,
      fallbackConfig,
      useCircuitBreaker = this.config.enableCircuitBreaker,
      circuitBreakerName = context.operation,
    } = options

    const wrappedOperation = async (): Promise<T> => {
      if (useCircuitBreaker) {
        return this.handleWithCircuitBreaker(operation, context, circuitBreakerName,)
      } else {
        return operation()
      }
    }

    try {
      if (this.config.enableRetry && retryConfig) {
        return await this.handleWithRetry(wrappedOperation, context, retryConfig,)
      } else {
        return await wrappedOperation()
      }
    } catch (error) {
      if (fallbackConfig && this.config.enableFallback) {
        return this.handleWithFallback(operation, fallbackConfig, context,)
      }
      throw error
    }
  }

  async safeExecute<T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    defaultValue?: T,
  ): Promise<T | undefined> {
    try {
      return await operation()
    } catch (error) {
      const classifiedError = ErrorClassifier.classify(error as Error, context,)
      this.recordError(classifiedError,)
      this.logError(classifiedError,)

      logger.debug(`Safe execution failed, returning default value: ${context.operation}`, {
        component: 'ErrorHandler',
        operation: context.operation,
        metadata: {
          errorCategory: classifiedError.category,
          hasDefaultValue: defaultValue !== undefined,
        },
        ...context.userContext,
      },)

      this.emit('safeExecutionFailed', { context, error: classifiedError, defaultValue, },)
      return defaultValue
    }
  }

  // Error reporting and metrics
  getErrorMetrics(): Map<string, { count: number; lastOccurrence: number }> {
    return new Map(this.errorMetrics,)
  }

  getCircuitBreakerMetrics(): Map<string, ReturnType<CircuitBreaker['getMetrics']>> {
    const metrics = new Map()
    for (const [name, breaker,] of this.circuitBreakers) {
      metrics.set(name, breaker.getMetrics(),)
    }
    return metrics
  }

  resetMetrics(): void {
    this.errorMetrics.clear()
    for (const breaker of this.circuitBreakers.values()) {
      breaker.reset()
    }

    logger.info('Error handler metrics reset', {
      component: 'ErrorHandler',
    },)
  }

  // Graceful degradation helpers
  async withGracefulDegradation<T,>(
    primaryOperation: () => Promise<T>,
    degradedOperation: () => Promise<T>,
    context: ErrorContext,
  ): Promise<T> {
    if (!this.config.enableGracefulDegradation) {
      return primaryOperation()
    }

    try {
      return await primaryOperation()
    } catch (error) {
      const classifiedError = ErrorClassifier.classify(error as Error, context,)

      if (classifiedError.recoveryStrategy === RecoveryStrategy.DEGRADE) {
        logger.info(`Degrading operation: ${context.operation}`, {
          component: 'ErrorHandler',
          operation: context.operation,
          metadata: { errorCategory: classifiedError.category, },
          ...context.userContext,
        },)

        this.emit('gracefulDegradation', { context, error: classifiedError, },)
        return degradedOperation()
      }

      throw classifiedError
    }
  }

  // Configuration management
  updateConfig(newConfig: Partial<ErrorHandlerConfig>,): void {
    this.config = { ...this.config, ...newConfig, }

    logger.info('Error handler configuration updated', {
      component: 'ErrorHandler',
      metadata: Object.keys(newConfig,),
    },)
  }

  // Cleanup
  destroy(): void {
    for (const breaker of this.circuitBreakers.values()) {
      breaker.removeAllListeners()
    }
    this.circuitBreakers.clear()
    this.errorMetrics.clear()
    this.removeAllListeners()

    logger.info('Error handler destroyed', {
      component: 'ErrorHandler',
    },)
  }
}

// Default configuration
const defaultErrorHandlerConfig: ErrorHandlerConfig = {
  enableRetry: true,
  enableCircuitBreaker: true,
  enableFallback: true,
  enableGracefulDegradation: true,
  defaultRetry: {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableErrors: [ErrorCategory.NETWORK, ErrorCategory.TIMEOUT, ErrorCategory.FILE_SYSTEM,],
  },
  defaultCircuitBreaker: {
    failureThreshold: 5,
    timeoutMs: 30000,
    resetTimeoutMs: 60000,
    monitoringPeriodMs: 60000,
  },
  logErrors: true,
  reportMetrics: true,
}

// Default error handler instance
export const defaultErrorHandler = new ErrorHandler(defaultErrorHandlerConfig,)

// Convenience functions
export const errorHandler = {
  handleWithRetry: <T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    retryConfig?: Partial<RetryConfig>,
  ) => defaultErrorHandler.handleWithRetry(operation, context, retryConfig,),

  handleWithCircuitBreaker: <T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    circuitBreakerName?: string,
  ) => defaultErrorHandler.handleWithCircuitBreaker(operation, context, circuitBreakerName,),

  handleWithFallback: <T,>(
    operation: () => Promise<T>,
    fallbackConfig: FallbackConfig<T>,
    context: ErrorContext,
  ) => defaultErrorHandler.handleWithFallback(operation, fallbackConfig, context,),

  handleWithFullRecovery: <T,>(
    operation: () => Promise<T>,
    context: ErrorContext,
    options?: any,
  ) => defaultErrorHandler.handleWithFullRecovery(operation, context, options,),

  safeExecute: <T,>(operation: () => Promise<T>, context: ErrorContext, defaultValue?: T,) =>
    defaultErrorHandler.safeExecute(operation, context, defaultValue,),

  withGracefulDegradation: <T,>(
    primaryOperation: () => Promise<T>,
    degradedOperation: () => Promise<T>,
    context: ErrorContext,
  ) => defaultErrorHandler.withGracefulDegradation(primaryOperation, degradedOperation, context,),

  getMetrics: () => ({
    errors: defaultErrorHandler.getErrorMetrics(),
    circuitBreakers: defaultErrorHandler.getCircuitBreakerMetrics(),
  }),

  resetMetrics: () => defaultErrorHandler.resetMetrics(),
}
