/**
 * Recovery Orchestrator for NeonPro Audit System
 *
 * Manages comprehensive error recovery strategies including retry mechanisms,
 * fallback strategies, resource cleanup, and intelligent recovery coordination.
 */

import { EventEmitter, } from 'events'
import { setTimeout, } from 'timers/promises'
import {
  AuditError,
  ErrorCategory,
  ErrorClassification,
  ErrorContext,
  ErrorHandler,
  ErrorSeverity,
  RecoveryResult,
  RecoveryStrategy,
  StateSnapshot,
} from './error-types.js'

/**
 * Recovery configuration options
 */
export interface RecoveryConfig {
  /** Maximum number of retry attempts */
  maxRetryAttempts: number
  /** Base delay for exponential backoff (ms) */
  baseRetryDelay: number
  /** Maximum retry delay (ms) */
  maxRetryDelay: number
  /** Backoff multiplier for exponential backoff */
  backoffMultiplier: number
  /** Jitter factor for retry delays (0-1) */
  jitterFactor: number
  /** Timeout for individual recovery attempts (ms) */
  recoveryTimeout: number
  /** Enable resource cleanup after failed recovery */
  enableResourceCleanup: boolean
  /** Enable state snapshots for rollback */
  enableStateSnapshots: boolean
  /** Maximum number of concurrent recovery operations */
  maxConcurrentRecoveries: number
  /** Enable recovery metrics collection */
  enableMetrics: boolean
}

/**
 * Recovery context for tracking recovery state
 */
export interface RecoveryContext extends ErrorContext {
  /** Recovery attempt number */
  attemptNumber: number
  /** Previous recovery attempts */
  previousAttempts: RecoveryResult[]
  /** Recovery start time */
  recoveryStartTime: Date
  /** Available fallback strategies */
  fallbackStrategies: RecoveryStrategy[]
  /** Resources to cleanup on failure */
  resourcesForCleanup: string[]
  /** State snapshot for rollback */
  stateSnapshot?: StateSnapshot
}

/**
 * Recovery metrics for performance tracking
 */
interface RecoveryMetrics {
  totalRecoveries: number
  successfulRecoveries: number
  failedRecoveries: number
  averageRecoveryTime: number
  strategySuccessRates: Record<RecoveryStrategy, { attempts: number; successes: number }>
  categoryRecoveryRates: Record<ErrorCategory, { attempts: number; successes: number }>
  recoveryTimeByStrategy: Record<RecoveryStrategy, number[]>
}

/**
 * Recovery operation wrapper
 */
type RecoveryOperation<T = any,> = (context: RecoveryContext,) => Promise<T>

/**
 * Fallback strategy handler
 */
interface FallbackHandler<T = any,> {
  canHandle(error: AuditError, context: RecoveryContext,): boolean
  execute(
    error: AuditError,
    context: RecoveryContext,
    originalOperation: RecoveryOperation<T>,
  ): Promise<T>
  priority: number // Lower numbers = higher priority
}

/**
 * Resource cleanup handler
 */
interface ResourceCleanupHandler {
  resourceType: string
  cleanup(resourceId: string, context: RecoveryContext,): Promise<void>
  canCleanup(resourceId: string,): boolean
}

/**
 * Comprehensive recovery orchestrator with intelligent recovery strategies
 */
export class RecoveryOrchestrator extends EventEmitter {
  private config: RecoveryConfig
  private errorHandlers: Map<string, ErrorHandler>
  private fallbackHandlers: FallbackHandler[]
  private resourceCleanupHandlers: Map<string, ResourceCleanupHandler>
  private activeRecoveries: Map<string, RecoveryContext>
  private metrics: RecoveryMetrics
  private stateSnapshots: Map<string, StateSnapshot>

  constructor(config: Partial<RecoveryConfig> = {},) {
    super()

    this.config = {
      maxRetryAttempts: 3,
      baseRetryDelay: 1000,
      maxRetryDelay: 30000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      recoveryTimeout: 60000,
      enableResourceCleanup: true,
      enableStateSnapshots: true,
      maxConcurrentRecoveries: 5,
      enableMetrics: true,
      ...config,
    }

    this.errorHandlers = new Map()
    this.fallbackHandlers = []
    this.resourceCleanupHandlers = new Map()
    this.activeRecoveries = new Map()
    this.stateSnapshots = new Map()
    this.metrics = this.initializeMetrics()

    this.initializeDefaultHandlers()
  }

  /**
   * Attempt recovery for an error with intelligent strategy selection
   */
  async recover<T,>(
    error: AuditError,
    classification: ErrorClassification,
    operation: RecoveryOperation<T>,
    context?: Partial<ErrorContext>,
  ): Promise<T> {
    // Check concurrency limits
    if (this.activeRecoveries.size >= this.config.maxConcurrentRecoveries) {
      throw new AuditError(
        'Recovery concurrency limit exceeded',
        ErrorCategory.PERFORMANCE,
        ErrorSeverity.HIGH,
        false,
        { operation: 'recovery_orchestration', },
      )
    }

    const recoveryContext = this.createRecoveryContext(error, context,)
    const recoveryId = `recovery_${error.errorId}_${Date.now()}`

    try {
      this.activeRecoveries.set(recoveryId, recoveryContext,)

      // Create state snapshot if enabled
      if (this.config.enableStateSnapshots) {
        recoveryContext.stateSnapshot = await this.createStateSnapshot(recoveryContext,)
      }

      this.emit('recovery_started', { error, classification, context: recoveryContext, },)

      // Execute recovery based on classification strategy
      const result = await this.executeRecoveryStrategy(
        error,
        classification,
        operation,
        recoveryContext,
      )

      // Update metrics
      if (this.config.enableMetrics) {
        this.updateSuccessMetrics(classification, recoveryContext,)
      }

      this.emit('recovery_success', { error, result, context: recoveryContext, },)
      return result
    } catch (recoveryError) {
      // Update failure metrics
      if (this.config.enableMetrics) {
        this.updateFailureMetrics(classification, recoveryContext,)
      }

      // Attempt rollback if state snapshot exists
      if (recoveryContext.stateSnapshot) {
        await this.attemptRollback(recoveryContext.stateSnapshot, recoveryContext,)
      }

      // Perform resource cleanup
      if (this.config.enableResourceCleanup) {
        await this.performResourceCleanup(recoveryContext,)
      }

      this.emit('recovery_failed', { error, recoveryError, context: recoveryContext, },)
      throw recoveryError
    } finally {
      this.activeRecoveries.delete(recoveryId,)
    }
  }

  /**
   * Execute recovery strategy based on error classification
   */
  private async executeRecoveryStrategy<T,>(
    error: AuditError,
    classification: ErrorClassification,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    switch (classification.recoveryStrategy) {
      case RecoveryStrategy.RETRY:
        return await this.executeRetryStrategy(error, operation, context,)

      case RecoveryStrategy.FALLBACK:
        return await this.executeFallbackStrategy(error, operation, context,)

      case RecoveryStrategy.GRACEFUL_DEGRADE:
        return await this.executeGracefulDegradationStrategy(error, operation, context,)

      case RecoveryStrategy.ROLLBACK:
        return await this.executeRollbackStrategy(error, operation, context,)

      case RecoveryStrategy.RESOURCE_CLEANUP:
        return await this.executeResourceCleanupStrategy(error, operation, context,)

      case RecoveryStrategy.CIRCUIT_BREAK:
        throw new AuditError(
          'Circuit breaker activated - operation temporarily unavailable',
          ErrorCategory.PERFORMANCE,
          ErrorSeverity.HIGH,
          false,
          context,
        )

      case RecoveryStrategy.NONE:
      default:
        throw error // No recovery strategy available
    }
  }

  /**
   * Execute retry strategy with exponential backoff and jitter
   */
  private async executeRetryStrategy<T,>(
    error: AuditError,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    let lastError = error

    for (let attempt = 1; attempt <= this.config.maxRetryAttempts; attempt++) {
      try {
        context.attemptNumber = attempt

        // Add delay between attempts (except first attempt)
        if (attempt > 1) {
          const delay = this.calculateRetryDelay(attempt - 1,)
          this.emit('retry_delay', { attempt, delay, context, },)
          await setTimeout(delay,)
        }

        this.emit('retry_attempt', {
          attempt,
          maxAttempts: this.config.maxRetryAttempts,
          context,
        },)

        // Execute operation with timeout
        const result = await Promise.race([
          operation(context,),
          this.createTimeoutPromise(this.config.recoveryTimeout,),
        ],)

        // Record successful recovery
        const recoveryResult: RecoveryResult = {
          success: true,
          strategy: RecoveryStrategy.RETRY,
          recoveryTime: Date.now() - context.recoveryStartTime.getTime(),
          attemptCount: attempt,
          metadata: { finalAttempt: attempt, },
        }

        context.previousAttempts.push(recoveryResult,)
        return result
      } catch (attemptError) {
        lastError = attemptError instanceof AuditError
          ? attemptError
          : new AuditError(
            `Retry attempt ${attempt} failed: ${attemptError.message}`,
            error.category,
            error.severity,
            true,
            context,
            attemptError,
          )

        // Record failed attempt
        const recoveryResult: RecoveryResult = {
          success: false,
          strategy: RecoveryStrategy.RETRY,
          recoveryTime: Date.now() - context.recoveryStartTime.getTime(),
          attemptCount: attempt,
          finalError: lastError,
          metadata: {
            attemptNumber: attempt,
            isLastAttempt: attempt === this.config.maxRetryAttempts,
          },
        }

        context.previousAttempts.push(recoveryResult,)

        // Don't retry for certain types of errors
        if (this.shouldStopRetrying(lastError, context,)) {
          this.emit('retry_aborted', { reason: 'non_retryable_error', error: lastError, context, },)
          break
        }

        this.emit('retry_failed', { attempt, error: lastError, context, },)
      }
    }

    throw lastError
  }

  /**
   * Execute fallback strategy with prioritized fallback handlers
   */
  private async executeFallbackStrategy<T,>(
    error: AuditError,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    // Sort fallback handlers by priority
    const availableHandlers = this.fallbackHandlers
      .filter(handler => handler.canHandle(error, context,))
      .sort((a, b,) => a.priority - b.priority)

    if (availableHandlers.length === 0) {
      throw new AuditError(
        'No fallback handlers available for error',
        error.category,
        ErrorSeverity.HIGH,
        false,
        context,
        error,
      )
    }

    let lastError = error

    for (const handler of availableHandlers) {
      try {
        this.emit('fallback_attempt', { handlerType: handler.constructor.name, context, },)

        const result = await Promise.race([
          handler.execute(error, context, operation,),
          this.createTimeoutPromise(this.config.recoveryTimeout,),
        ],)

        this.emit('fallback_success', { handlerType: handler.constructor.name, context, },)
        return result
      } catch (fallbackError) {
        lastError = fallbackError instanceof AuditError
          ? fallbackError
          : new AuditError(
            `Fallback strategy failed: ${fallbackError.message}`,
            error.category,
            error.severity,
            true,
            context,
            fallbackError,
          )

        this.emit('fallback_failed', {
          handlerType: handler.constructor.name,
          error: lastError,
          context,
        },)
      }
    }

    throw lastError
  }

  /**
   * Execute graceful degradation strategy
   */
  private async executeGracefulDegradationStrategy<T,>(
    error: AuditError,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    this.emit('graceful_degradation_activated', { error, context, },)

    try {
      // Attempt to execute with reduced functionality
      const degradedContext = {
        ...context,
        systemState: {
          ...context.systemState,
          degradedMode: true,
          maxMemoryUsage: Math.floor(context.systemState.maxMemoryUsage * 0.7,),
          maxConcurrency: Math.floor(context.systemState.maxConcurrency * 0.5,),
        },
      }

      return await Promise.race([
        operation(degradedContext,),
        this.createTimeoutPromise(this.config.recoveryTimeout,),
      ],)
    } catch (degradationError) {
      throw new AuditError(
        'Graceful degradation strategy failed',
        error.category,
        error.severity,
        false,
        context,
        degradationError,
      )
    }
  }

  /**
   * Execute rollback strategy
   */
  private async executeRollbackStrategy<T,>(
    error: AuditError,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    if (!context.stateSnapshot) {
      throw new AuditError(
        'No state snapshot available for rollback',
        ErrorCategory.CONFIGURATION,
        ErrorSeverity.HIGH,
        false,
        context,
        error,
      )
    }

    try {
      // Perform rollback
      await this.performRollback(context.stateSnapshot, context,)

      // Retry operation after rollback
      return await Promise.race([
        operation(context,),
        this.createTimeoutPromise(this.config.recoveryTimeout,),
      ],)
    } catch (rollbackError) {
      throw new AuditError(
        'Rollback recovery strategy failed',
        error.category,
        error.severity,
        false,
        context,
        rollbackError,
      )
    }
  }

  /**
   * Execute resource cleanup strategy
   */
  private async executeResourceCleanupStrategy<T,>(
    error: AuditError,
    operation: RecoveryOperation<T>,
    context: RecoveryContext,
  ): Promise<T> {
    try {
      // Perform resource cleanup
      await this.performResourceCleanup(context,)

      // Retry operation after cleanup
      return await Promise.race([
        operation(context,),
        this.createTimeoutPromise(this.config.recoveryTimeout,),
      ],)
    } catch (cleanupError) {
      throw new AuditError(
        'Resource cleanup recovery strategy failed',
        error.category,
        error.severity,
        false,
        context,
        cleanupError,
      )
    }
  }

  /**
   * Calculate retry delay with exponential backoff and jitter
   */
  private calculateRetryDelay(attemptNumber: number,): number {
    const exponentialDelay = Math.min(
      this.config.baseRetryDelay * Math.pow(this.config.backoffMultiplier, attemptNumber,),
      this.config.maxRetryDelay,
    )

    // Add jitter to prevent thundering herd
    const jitter = exponentialDelay * this.config.jitterFactor * Math.random()
    return Math.floor(exponentialDelay + jitter,)
  }

  /**
   * Determine if retrying should be stopped
   */
  private shouldStopRetrying(error: AuditError, context: RecoveryContext,): boolean {
    // Don't retry configuration errors
    if (error.category === ErrorCategory.CONFIGURATION) {
      return true
    }

    // Don't retry security errors
    if (error.category === ErrorCategory.SECURITY) {
      return true
    }

    // Don't retry constitutional violations
    if (error.category === ErrorCategory.CONSTITUTIONAL) {
      return true
    }

    // Don't retry non-recoverable errors
    if (!error.recoverable) {
      return true
    }

    return false
  }

  /**
   * Create recovery context
   */
  private createRecoveryContext(
    error: AuditError,
    context?: Partial<ErrorContext>,
  ): RecoveryContext {
    return {
      errorId: error.errorId,
      timestamp: new Date(),
      component: context?.component || error.context.component,
      operation: context?.operation || error.context.operation,
      trigger: context?.trigger,
      systemState: { ...error.context.systemState, ...context?.systemState, },
      stackTrace: error.stack || '',
      metadata: { ...error.context.metadata, ...context?.metadata, },
      attemptNumber: 0,
      previousAttempts: [],
      recoveryStartTime: new Date(),
      fallbackStrategies: [],
      resourcesForCleanup: [],
    }
  }

  /**
   * Create state snapshot for rollback capability
   */
  private async createStateSnapshot(context: RecoveryContext,): Promise<StateSnapshot> {
    const snapshotId = `snapshot_${context.errorId}_${Date.now()}`

    const snapshot: StateSnapshot = {
      snapshotId,
      timestamp: new Date(),
      component: context.component,
      operation: context.operation,
      state: { ...context.systemState, },
      checksum: this.calculateChecksum(context.systemState,),
      dependencies: [],
    }

    this.stateSnapshots.set(snapshotId, snapshot,)
    return snapshot
  }

  /**
   * Perform rollback to previous state
   */
  private async performRollback(snapshot: StateSnapshot, context: RecoveryContext,): Promise<void> {
    this.emit('rollback_started', { snapshot, context, },)

    try {
      // Restore system state (simplified implementation)
      Object.assign(context.systemState, snapshot.state,)

      // Verify rollback integrity
      const currentChecksum = this.calculateChecksum(context.systemState,)
      if (currentChecksum !== snapshot.checksum) {
        throw new Error('Rollback integrity check failed',)
      }

      this.emit('rollback_completed', { snapshot, context, },)
    } catch (rollbackError) {
      this.emit('rollback_failed', { snapshot, error: rollbackError, context, },)
      throw rollbackError
    }
  }

  /**
   * Attempt rollback with error handling
   */
  private async attemptRollback(snapshot: StateSnapshot, context: RecoveryContext,): Promise<void> {
    try {
      await this.performRollback(snapshot, context,)
    } catch (rollbackError) {
      // Log rollback failure but don't throw - original error takes precedence
      this.emit('rollback_error', { snapshot, error: rollbackError, context, },)
    }
  }

  /**
   * Perform resource cleanup
   */
  private async performResourceCleanup(context: RecoveryContext,): Promise<void> {
    this.emit('resource_cleanup_started', { context, },)

    const cleanupPromises = context.resourcesForCleanup.map(async (resourceId,) => {
      for (const [type, handler,] of this.resourceCleanupHandlers) {
        if (handler.canCleanup(resourceId,)) {
          try {
            await handler.cleanup(resourceId, context,)
            this.emit('resource_cleaned', { resourceId, type, context, },)
          } catch (cleanupError) {
            this.emit('resource_cleanup_failed', {
              resourceId,
              type,
              error: cleanupError,
              context,
            },)
          }
        }
      }
    },)

    await Promise.allSettled(cleanupPromises,)
    this.emit('resource_cleanup_completed', { context, },)
  }

  /**
   * Calculate checksum for state integrity verification
   */
  private calculateChecksum(state: Record<string, any>,): string {
    const stateString = JSON.stringify(state, Object.keys(state,).sort(),)
    let hash = 0

    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i,)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }

    return hash.toString(36,)
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise<T,>(timeoutMs: number,): Promise<T> {
    return new Promise<T>((_, reject,) => {
      setTimeout(() => {
        reject(
          new AuditError(
            `Recovery operation timed out after ${timeoutMs}ms`,
            ErrorCategory.PERFORMANCE,
            ErrorSeverity.HIGH,
            true,
          ),
        )
      }, timeoutMs,)
    },)
  }

  /**
   * Register error handler
   */
  public registerErrorHandler(errorType: string, handler: ErrorHandler,): void {
    this.errorHandlers.set(errorType, handler,)
  }

  /**
   * Register fallback handler
   */
  public registerFallbackHandler(handler: FallbackHandler,): void {
    this.fallbackHandlers.push(handler,)
  }

  /**
   * Register resource cleanup handler
   */
  public registerResourceCleanupHandler(
    resourceType: string,
    handler: ResourceCleanupHandler,
  ): void {
    this.resourceCleanupHandlers.set(resourceType, handler,)
  }

  /**
   * Get recovery metrics
   */
  public getMetrics(): RecoveryMetrics {
    return { ...this.metrics, }
  }

  /**
   * Reset recovery metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics()
  }

  /**
   * Get active recovery count
   */
  public getActiveRecoveryCount(): number {
    return this.activeRecoveries.size
  }

  /**
   * Initialize recovery metrics
   */
  private initializeMetrics(): RecoveryMetrics {
    return {
      totalRecoveries: 0,
      successfulRecoveries: 0,
      failedRecoveries: 0,
      averageRecoveryTime: 0,
      strategySuccessRates: {} as Record<RecoveryStrategy, { attempts: number; successes: number }>,
      categoryRecoveryRates: {} as Record<ErrorCategory, { attempts: number; successes: number }>,
      recoveryTimeByStrategy: {} as Record<RecoveryStrategy, number[]>,
    }
  }

  /**
   * Update success metrics
   */
  private updateSuccessMetrics(
    classification: ErrorClassification,
    context: RecoveryContext,
  ): void {
    this.metrics.totalRecoveries++
    this.metrics.successfulRecoveries++

    const recoveryTime = Date.now() - context.recoveryStartTime.getTime()
    this.updateAverageRecoveryTime(recoveryTime,)

    this.updateStrategyMetrics(classification.recoveryStrategy, true, recoveryTime,)
    this.updateCategoryMetrics(classification.category, true,)
  }

  /**
   * Update failure metrics
   */
  private updateFailureMetrics(
    classification: ErrorClassification,
    context: RecoveryContext,
  ): void {
    this.metrics.totalRecoveries++
    this.metrics.failedRecoveries++

    const recoveryTime = Date.now() - context.recoveryStartTime.getTime()
    this.updateAverageRecoveryTime(recoveryTime,)

    this.updateStrategyMetrics(classification.recoveryStrategy, false, recoveryTime,)
    this.updateCategoryMetrics(classification.category, false,)
  }

  /**
   * Update average recovery time
   */
  private updateAverageRecoveryTime(recoveryTime: number,): void {
    this.metrics.averageRecoveryTime =
      (this.metrics.averageRecoveryTime * (this.metrics.totalRecoveries - 1) + recoveryTime)
      / this.metrics.totalRecoveries
  }

  /**
   * Update strategy-specific metrics
   */
  private updateStrategyMetrics(
    strategy: RecoveryStrategy,
    success: boolean,
    recoveryTime: number,
  ): void {
    if (!this.metrics.strategySuccessRates[strategy]) {
      this.metrics.strategySuccessRates[strategy] = { attempts: 0, successes: 0, }
    }

    this.metrics.strategySuccessRates[strategy].attempts++
    if (success) {
      this.metrics.strategySuccessRates[strategy].successes++
    }

    if (!this.metrics.recoveryTimeByStrategy[strategy]) {
      this.metrics.recoveryTimeByStrategy[strategy] = []
    }
    this.metrics.recoveryTimeByStrategy[strategy].push(recoveryTime,)
  }

  /**
   * Update category-specific metrics
   */
  private updateCategoryMetrics(category: ErrorCategory, success: boolean,): void {
    if (!this.metrics.categoryRecoveryRates[category]) {
      this.metrics.categoryRecoveryRates[category] = { attempts: 0, successes: 0, }
    }

    this.metrics.categoryRecoveryRates[category].attempts++
    if (success) {
      this.metrics.categoryRecoveryRates[category].successes++
    }
  }

  /**
   * Initialize default handlers
   */
  private initializeDefaultHandlers(): void {
    // Register default resource cleanup handlers
    this.registerResourceCleanupHandler('memory', {
      resourceType: 'memory',
      canCleanup: () => true,
      cleanup: async (resourceId: string, context: RecoveryContext,) => {
        // Force garbage collection if available
        if (global.gc) {
          global.gc()
        }
      },
    },)

    this.registerResourceCleanupHandler('file_handles', {
      resourceType: 'file_handles',
      canCleanup: () => true,
      cleanup: async (resourceId: string, context: RecoveryContext,) => {
        // Close any open file handles (simplified implementation)
        this.emit('file_handles_cleaned', { resourceId, context, },)
      },
    },)

    // Register default fallback handlers
    this.registerFallbackHandler({
      priority: 1,
      canHandle: (error: AuditError,) => error.category === ErrorCategory.FILESYSTEM,
      execute: async (
        error: AuditError,
        context: RecoveryContext,
        operation: RecoveryOperation,
      ) => {
        // Attempt operation with alternative file paths or reduced permissions
        const fallbackContext = {
          ...context,
          systemState: {
            ...context.systemState,
            useAlternatePaths: true,
          },
        }
        return await operation(fallbackContext,)
      },
    },)
  }
}
