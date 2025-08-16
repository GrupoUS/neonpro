/**
 * Centralized Subscription Error Handler
 *
 * Advanced error management system for subscription operations:
 * - Intelligent error classification and routing
 * - Automatic recovery strategies
 * - Comprehensive logging and monitoring
 * - User-friendly error messaging
 * - Integration with circuit breakers and performance monitoring
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */

import {
  ErrorCategory,
  type ErrorContext,
  ErrorSeverity,
  RecoveryStrategy,
  type SubscriptionError,
  SubscriptionErrorFactory,
} from '../types/subscription-errors';
import { enhancedSubscriptionCache } from './subscription-cache-enhanced';
import { circuitBreakerRegistry } from './subscription-circuit-breaker';
import type { SubscriptionValidationResult } from './subscription-status';

// Error handler configuration
type ErrorHandlerConfig = {
  enableAutoRecovery: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
  exponentialBackoff: boolean;
  enableCircuitBreaker: boolean;
  enableFallbackCache: boolean;
  logErrors: boolean;
  alertOnCritical: boolean;
  userNotificationThreshold: ErrorSeverity;
  gracefulDegradationEnabled: boolean;
};

const defaultConfig: ErrorHandlerConfig = {
  enableAutoRecovery: true,
  maxRetryAttempts: 3,
  retryDelayMs: 1000,
  exponentialBackoff: true,
  enableCircuitBreaker: true,
  enableFallbackCache: true,
  logErrors: true,
  alertOnCritical: true,
  userNotificationThreshold: ErrorSeverity.MEDIUM,
  gracefulDegradationEnabled: true,
};

// Error handling result
type ErrorHandlingResult<T> = {
  success: boolean;
  data?: T;
  error?: SubscriptionError;
  recoveryAttempted: boolean;
  recoveryStrategy?: RecoveryStrategy;
  fallbackUsed: boolean;
  retryAttempts: number;
  totalExecutionTime: number;
  userMessage?: string;
};

// Recovery strategy implementations
type RecoveryStrategyImplementation = {
  canHandle: (error: SubscriptionError) => boolean;
  execute: <T>(
    operation: () => Promise<T>,
    error: SubscriptionError,
    context: ErrorContext,
    attempt: number,
  ) => Promise<T>;
  maxAttempts: number;
  delayMs: number;
};

export class SubscriptionErrorHandler {
  private config: ErrorHandlerConfig;
  private errorHistory: SubscriptionError[] = [];
  private readonly maxHistorySize = 100;
  private readonly recoveryStrategies: Map<
    RecoveryStrategy,
    RecoveryStrategyImplementation
  >;

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = { ...defaultConfig, ...config };
    this.recoveryStrategies = this.initializeRecoveryStrategies();
  }

  /**
   * Main error handling entry point
   */
  async handleError<T>(
    error: Error | SubscriptionError,
    operation: () => Promise<T>,
    context?: ErrorContext,
  ): Promise<ErrorHandlingResult<T>> {
    const startTime = Date.now();
    let subscriptionError: SubscriptionError;

    // Convert to SubscriptionError if needed
    if (error instanceof Error && !('code' in error)) {
      subscriptionError = this.classifyError(error, context);
    } else {
      subscriptionError = error as SubscriptionError;
    }

    // Enrich error with context
    if (context) {
      subscriptionError = SubscriptionErrorFactory.enrichError(
        subscriptionError,
        context,
      );
    }

    // Log error if enabled
    if (this.config.logErrors) {
      this.logError(subscriptionError, context);
    }

    // Add to error history
    this.addToHistory(subscriptionError);

    // Check for circuit breaker
    if (
      this.config.enableCircuitBreaker &&
      this.shouldUseCircuitBreaker(subscriptionError)
    ) {
      return this.handleWithCircuitBreaker(
        operation,
        subscriptionError,
        context,
        startTime,
      );
    }

    // Attempt recovery if enabled
    if (this.config.enableAutoRecovery && subscriptionError.retryable) {
      return this.attemptRecovery(
        operation,
        subscriptionError,
        context,
        startTime,
      );
    }

    // Fallback strategies
    const fallbackResult = await this.applyFallbackStrategies(
      subscriptionError,
      context,
    );

    return {
      success: false,
      error: subscriptionError,
      recoveryAttempted: false,
      fallbackUsed: fallbackResult.fallbackUsed,
      retryAttempts: 0,
      totalExecutionTime: Date.now() - startTime,
      userMessage: this.getUserFriendlyMessage(subscriptionError),
      data: fallbackResult.data,
    };
  }

  /**
   * Classify generic errors into subscription-specific errors
   */
  private classifyError(
    error: Error,
    context?: ErrorContext,
  ): SubscriptionError {
    const message = error.message.toLowerCase();

    // Authentication errors
    if (
      message.includes('auth') ||
      message.includes('unauthorized') ||
      message.includes('token')
    ) {
      return SubscriptionErrorFactory.createError(
        'auth',
        error.message,
        context,
      );
    }

    // Network errors
    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('connection')
    ) {
      return SubscriptionErrorFactory.createError(
        'network',
        error.message,
        context,
      );
    }

    // Timeout errors
    if (message.includes('timeout') || message.includes('aborted')) {
      return SubscriptionErrorFactory.createError(
        'timeout',
        error.message,
        context,
      );
    }

    // Database errors
    if (
      message.includes('database') ||
      message.includes('sql') ||
      message.includes('query')
    ) {
      return SubscriptionErrorFactory.createError(
        'database',
        error.message,
        context,
      );
    }

    // Rate limit errors
    if (
      message.includes('rate') ||
      message.includes('limit') ||
      message.includes('throttle')
    ) {
      return SubscriptionErrorFactory.createError(
        'rate_limit',
        error.message,
        context,
      );
    }

    // Default to validation error
    return SubscriptionErrorFactory.createError(
      'validation',
      error.message,
      context,
    );
  }

  /**
   * Initialize recovery strategy implementations
   */
  private initializeRecoveryStrategies(): Map<
    RecoveryStrategy,
    RecoveryStrategyImplementation
  > {
    const strategies = new Map<
      RecoveryStrategy,
      RecoveryStrategyImplementation
    >();

    // Retry strategy
    strategies.set(RecoveryStrategy.RETRY, {
      canHandle: (error) =>
        error.retryable && error.category !== ErrorCategory.AUTHENTICATION,
      execute: async (operation, _error, _context, attempt) => {
        const delay = this.calculateRetryDelay(attempt);
        await this.sleep(delay);
        return operation();
      },
      maxAttempts: this.config.maxRetryAttempts,
      delayMs: this.config.retryDelayMs,
    });

    // Fallback strategy
    strategies.set(RecoveryStrategy.FALLBACK, {
      canHandle: (error) =>
        error.category === ErrorCategory.CACHE ||
        error.category === ErrorCategory.EXTERNAL_SERVICE,
      execute: async (_operation, error, context, _attempt) => {
        // Try to get cached data or use default values
        if (this.config.enableFallbackCache && context?.userId) {
          const cachedResult = await this.tryFallbackCache(context.userId);
          if (cachedResult) {
            return cachedResult as any;
          }
        }
        throw error; // Re-throw if no fallback available
      },
      maxAttempts: 1,
      delayMs: 0,
    });

    // Graceful degradation strategy
    strategies.set(RecoveryStrategy.GRACEFUL_DEGRADE, {
      canHandle: (_error) => this.config.gracefulDegradationEnabled,
      execute: async (_operation, _error, context, _attempt) => {
        // Return a degraded version of the service
        return this.getDegradedService(context) as any;
      },
      maxAttempts: 1,
      delayMs: 0,
    });

    return strategies;
  }

  /**
   * Attempt recovery using configured strategies
   */
  private async attemptRecovery<T>(
    operation: () => Promise<T>,
    error: SubscriptionError,
    context: ErrorContext | undefined,
    startTime: number,
  ): Promise<ErrorHandlingResult<T>> {
    const strategy = this.recoveryStrategies.get(error.recoveryStrategy);

    if (!strategy?.canHandle(error)) {
      return {
        success: false,
        error,
        recoveryAttempted: false,
        fallbackUsed: false,
        retryAttempts: 0,
        totalExecutionTime: Date.now() - startTime,
        userMessage: this.getUserFriendlyMessage(error),
      };
    }

    let lastError = error;
    let attempts = 0;
    const maxAttempts = Math.min(
      strategy.maxAttempts,
      this.config.maxRetryAttempts,
    );

    while (attempts < maxAttempts) {
      attempts++;

      try {
        const result = await strategy.execute(
          operation,
          lastError,
          context || {},
          attempts,
        );

        return {
          success: true,
          data: result,
          recoveryAttempted: true,
          recoveryStrategy: error.recoveryStrategy,
          fallbackUsed: false,
          retryAttempts: attempts,
          totalExecutionTime: Date.now() - startTime,
        };
      } catch (retryError) {
        lastError =
          retryError instanceof Error && 'code' in retryError
            ? (retryError as SubscriptionError)
            : this.classifyError(retryError as Error, context);

        // Log retry attempt
        if (this.config.logErrors) {
        }

        // Check if we should stop retrying
        if (
          !lastError.retryable ||
          lastError.severity === ErrorSeverity.CRITICAL
        ) {
          break;
        }
      }
    }

    // Recovery failed, try fallback strategies
    const fallbackResult = await this.applyFallbackStrategies(
      lastError,
      context,
    );

    return {
      success: false,
      error: lastError,
      recoveryAttempted: true,
      recoveryStrategy: error.recoveryStrategy,
      fallbackUsed: fallbackResult.fallbackUsed,
      retryAttempts: attempts,
      totalExecutionTime: Date.now() - startTime,
      userMessage: this.getUserFriendlyMessage(lastError),
      data: fallbackResult.data,
    };
  }

  /**
   * Handle errors with circuit breaker
   */
  private async handleWithCircuitBreaker<T>(
    operation: () => Promise<T>,
    error: SubscriptionError,
    context: ErrorContext | undefined,
    startTime: number,
  ): Promise<ErrorHandlingResult<T>> {
    const breakerName = this.getCircuitBreakerName(error);
    const breaker = circuitBreakerRegistry.get(breakerName);

    if (!breaker) {
      // No circuit breaker available, handle normally
      return this.attemptRecovery(operation, error, context, startTime);
    }

    const result = await breaker.execute(operation, context);

    return {
      success: result.success,
      data: result.data,
      error: result.error,
      recoveryAttempted: !result.fromCircuitBreaker,
      fallbackUsed: result.fromCircuitBreaker,
      retryAttempts: 0,
      totalExecutionTime: Date.now() - startTime,
      userMessage: result.error
        ? this.getUserFriendlyMessage(result.error)
        : undefined,
    };
  }

  /**
   * Apply fallback strategies
   */
  private async applyFallbackStrategies<T>(
    _error: SubscriptionError,
    context?: ErrorContext,
  ): Promise<{ fallbackUsed: boolean; data?: T }> {
    // Try cached fallback data
    if (this.config.enableFallbackCache && context?.userId) {
      const cachedData = await this.tryFallbackCache(context.userId);
      if (cachedData) {
        return { fallbackUsed: true, data: cachedData as T };
      }
    }

    // Try graceful degradation
    if (this.config.gracefulDegradationEnabled) {
      const degradedData = await this.getDegradedService(context);
      if (degradedData) {
        return { fallbackUsed: true, data: degradedData as T };
      }
    }

    return { fallbackUsed: false };
  }

  /**
   * Try to get fallback data from cache
   */
  private async tryFallbackCache(
    userId: string,
  ): Promise<SubscriptionValidationResult | null> {
    try {
      const cacheKey = `subscription:fallback:${userId}`;
      const cachedData = await enhancedSubscriptionCache.get(cacheKey);

      if (
        cachedData &&
        typeof cachedData === 'object' &&
        'hasAccess' in cachedData
      ) {
        return cachedData as SubscriptionValidationResult;
      }
    } catch (_cacheError) {}

    return null;
  }

  /**
   * Get degraded service response
   */
  private async getDegradedService(
    _context?: ErrorContext,
  ): Promise<SubscriptionValidationResult | null> {
    // Return a basic valid response with limited features
    return {
      hasAccess: false,
      status: null,
      subscription: null,
      message:
        'Service is temporarily limited. Some features may not be available.',
      redirectTo: undefined,
      gracePeriod: false,
      performance: {
        validationTime: 0,
        cacheHit: false,
        source: 'error',
      },
    };
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number): number {
    if (!this.config.exponentialBackoff) {
      return this.config.retryDelayMs;
    }

    // Exponential backoff with jitter
    const baseDelay = this.config.retryDelayMs * 2 ** (attempt - 1);
    const jitter = Math.random() * 0.1 * baseDelay;
    return Math.min(baseDelay + jitter, 30_000); // Max 30 seconds
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Determine which circuit breaker to use
   */
  private getCircuitBreakerName(error: SubscriptionError): string {
    switch (error.category) {
      case ErrorCategory.DATABASE:
        return 'database';
      case ErrorCategory.CACHE:
        return 'cache';
      case ErrorCategory.EXTERNAL_SERVICE:
        return 'external_api';
      default:
        return 'database'; // Default fallback
    }
  }

  /**
   * Check if circuit breaker should be used
   */
  private shouldUseCircuitBreaker(error: SubscriptionError): boolean {
    return (
      error.severity === ErrorSeverity.HIGH ||
      error.severity === ErrorSeverity.CRITICAL ||
      error.category === ErrorCategory.DATABASE ||
      error.category === ErrorCategory.EXTERNAL_SERVICE
    );
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: SubscriptionError): string {
    if (error.severity <= this.config.userNotificationThreshold) {
      return error.userMessage;
    }

    // Don't show technical errors to users for low-severity issues
    return 'A temporary issue occurred. Please try again.';
  }

  /**
   * Log error with appropriate level
   */
  private logError(error: SubscriptionError, context?: ErrorContext): void {
    const _logData = {
      error: {
        code: error.code,
        message: error.message,
        severity: error.severity,
        category: error.category,
        timestamp: error.timestamp,
      },
      context,
      retryable: error.retryable,
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        if (this.config.alertOnCritical) {
          this.sendAlert(`Critical subscription error: ${error.message}`);
        }
        break;
      case ErrorSeverity.HIGH:
        break;
      case ErrorSeverity.MEDIUM:
        break;
      default:
        break;
    }
  }

  /**
   * Send alert for critical errors
   */
  private sendAlert(_message: string): void {
    // Could integrate with external alerting services
  }

  /**
   * Add error to history for analysis
   */
  private addToHistory(error: SubscriptionError): void {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    recentErrors: SubscriptionError[];
  } {
    const stats = {
      totalErrors: this.errorHistory.length,
      bySeverity: {} as Record<ErrorSeverity, number>,
      byCategory: {} as Record<ErrorCategory, number>,
      recentErrors: this.errorHistory.slice(-10),
    };

    // Initialize counters
    Object.values(ErrorSeverity).forEach((severity) => {
      stats.bySeverity[severity] = 0;
    });
    Object.values(ErrorCategory).forEach((category) => {
      stats.byCategory[category] = 0;
    });

    // Count errors
    this.errorHistory.forEach((error) => {
      stats.bySeverity[error.severity]++;
      stats.byCategory[error.category]++;
    });

    return stats;
  }

  /**
   * Reset error history
   */
  resetStats(): void {
    this.errorHistory = [];
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global error handler instance
export const subscriptionErrorHandler = new SubscriptionErrorHandler();

// Utility function for easy error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context?: ErrorContext,
): Promise<ErrorHandlingResult<T>> {
  try {
    const result = await operation();
    return {
      success: true,
      data: result,
      recoveryAttempted: false,
      fallbackUsed: false,
      retryAttempts: 0,
      totalExecutionTime: 0,
    };
  } catch (error) {
    return subscriptionErrorHandler.handleError(
      error as Error,
      operation,
      context,
    );
  }
}
