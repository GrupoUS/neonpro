/**
 * Subscription Circuit Breaker System
 *
 * Advanced circuit breaker implementation for subscription services:
 * - Multiple circuit breaker states (Closed, Open, Half-Open)
 * - Configurable failure thresholds and recovery timeouts
 * - Health monitoring and automatic recovery
 * - Integration with performance monitoring
 * - Graceful degradation strategies
 *
 * @author NeonPro Development Team
 * @version 2.0.0 - Error Handling Enhanced
 */

import type {
  ErrorContext,
  SubscriptionError,
} from '../types/subscription-errors';
import { SubscriptionErrorFactory } from '../types/subscription-errors';

// Circuit breaker states
export enum CircuitBreakerState {
  CLOSED = 'closed', // Normal operation
  OPEN = 'open', // Circuit is open, requests are blocked
  HALF_OPEN = 'half_open', // Testing if service has recovered
}

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  // Failure threshold to open circuit
  failureThreshold: number;
  // Success threshold to close circuit from half-open
  successThreshold: number;
  // Time to wait before trying half-open (milliseconds)
  timeout: number;
  // Time window for failure tracking (milliseconds)
  timeWindow: number;
  // Maximum concurrent requests in half-open state
  halfOpenMaxConcurrentRequests: number;
  // Health check configuration
  healthCheck: {
    enabled: boolean;
    interval: number; // milliseconds
    timeout: number; // milliseconds
  };
  // Monitoring configuration
  monitoring: {
    enabled: boolean;
    logStateChanges: boolean;
    logFailures: boolean;
    alertOnOpen: boolean;
  };
}

const defaultConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 60_000, // 1 minute
  timeWindow: 60_000, // 1 minute
  halfOpenMaxConcurrentRequests: 3,
  healthCheck: {
    enabled: true,
    interval: 30_000, // 30 seconds
    timeout: 5000, // 5 seconds
  },
  monitoring: {
    enabled: true,
    logStateChanges: true,
    logFailures: true,
    alertOnOpen: true,
  },
};

// Circuit breaker statistics
interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  stateChangedAt: Date;
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  rejectedRequests: number;
  averageResponseTime: number;
  uptime: number; // percentage
}

// Result types for circuit breaker operations
interface CircuitBreakerResult<T> {
  success: boolean;
  data?: T;
  error?: SubscriptionError;
  fromCircuitBreaker: boolean;
  state: CircuitBreakerState;
  executionTime: number;
}

export class SubscriptionCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private stateChangedAt = new Date();
  private totalRequests = 0;
  private failedRequests = 0;
  private successfulRequests = 0;
  private rejectedRequests = 0;
  private responseTimeSum = 0;
  private halfOpenRequestsInProgress = 0;
  private healthCheckTimer?: NodeJS.Timeout;
  protected config: CircuitBreakerConfig;

  // Service name for monitoring and logging
  private serviceName: string;

  constructor(serviceName: string, config?: Partial<CircuitBreakerConfig>) {
    this.serviceName = serviceName;
    this.config = { ...defaultConfig, ...config };

    // Start health check if enabled
    if (this.config.healthCheck.enabled) {
      this.startHealthCheck();
    }

    // Log initial state
    if (this.config.monitoring.enabled) {
      this.logStateChange(
        CircuitBreakerState.CLOSED,
        'Circuit breaker initialized'
      );
    }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(
    operation: () => Promise<T>,
    context?: ErrorContext
  ): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.stateChangedAt = new Date();
        this.logStateChange(CircuitBreakerState.HALF_OPEN, 'Attempting reset');
      } else {
        // Circuit is open, reject request immediately
        this.rejectedRequests++;
        const error = SubscriptionErrorFactory.createError(
          'external_service',
          `Circuit breaker is OPEN for ${this.serviceName}`,
          context
        );

        return {
          success: false,
          error,
          fromCircuitBreaker: true,
          state: this.state,
          executionTime: Date.now() - startTime,
        };
      }
    }

    // Check half-open concurrent request limit
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (
        this.halfOpenRequestsInProgress >=
        this.config.halfOpenMaxConcurrentRequests
      ) {
        this.rejectedRequests++;
        const error = SubscriptionErrorFactory.createError(
          'rate_limit',
          `Circuit breaker is HALF_OPEN with maximum concurrent requests for ${this.serviceName}`,
          context
        );

        return {
          success: false,
          error,
          fromCircuitBreaker: true,
          state: this.state,
          executionTime: Date.now() - startTime,
        };
      }
      this.halfOpenRequestsInProgress++;
    }

    try {
      // Execute the operation
      const result = await operation();
      const executionTime = Date.now() - startTime;

      // Record success
      this.onSuccess(executionTime);

      return {
        success: true,
        data: result,
        fromCircuitBreaker: false,
        state: this.state,
        executionTime,
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Convert to SubscriptionError if needed
      const subscriptionError =
        error instanceof Error && 'code' in error
          ? (error as SubscriptionError)
          : SubscriptionErrorFactory.createError(
              'external_service',
              error instanceof Error ? error.message : 'Unknown error',
              context
            );

      // Record failure
      this.onFailure(subscriptionError);

      return {
        success: false,
        error: subscriptionError,
        fromCircuitBreaker: false,
        state: this.state,
        executionTime,
      };
    } finally {
      if (this.state === CircuitBreakerState.HALF_OPEN) {
        this.halfOpenRequestsInProgress--;
      }
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(responseTime: number): void {
    this.successfulRequests++;
    this.successCount++;
    this.lastSuccessTime = new Date();
    this.responseTimeSum += responseTime;

    // Log success in monitoring
    if (this.config.monitoring.enabled) {
      console.log(
        `Circuit breaker success: ${this.serviceName} - ${responseTime}ms`
      );
    }

    // Reset failure count on success in half-open state
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.failureCount = 0;

      // Check if we should close the circuit
      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
        this.stateChangedAt = new Date();
        this.logStateChange(CircuitBreakerState.CLOSED, 'Circuit recovered');
      }
    } else if (this.state === CircuitBreakerState.CLOSED) {
      // Reset failure count on successful closed state operation
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: SubscriptionError): void {
    this.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = new Date();

    // Log failure in monitoring
    if (this.config.monitoring.enabled) {
      console.error(`Circuit breaker failure: ${this.serviceName}`, error);
      if (this.config.monitoring.logFailures) {
        console.error(
          `Circuit breaker failure for ${this.serviceName}:`,
          error
        );
      }
    }

    // Check if we should open the circuit
    if (
      this.state === CircuitBreakerState.CLOSED &&
      this.failureCount >= this.config.failureThreshold
    ) {
      this.state = CircuitBreakerState.OPEN;
      this.stateChangedAt = new Date();
      this.logStateChange(
        CircuitBreakerState.OPEN,
        'Circuit opened due to failures'
      );

      // Alert if configured
      if (this.config.monitoring.alertOnOpen) {
        this.sendAlert(
          `Circuit breaker opened for ${this.serviceName} after ${this.failureCount} failures`
        );
      }
    } else if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Return to open state on any failure in half-open
      this.state = CircuitBreakerState.OPEN;
      this.successCount = 0;
      this.stateChangedAt = new Date();
      this.logStateChange(
        CircuitBreakerState.OPEN,
        'Circuit opened from half-open due to failure'
      );
    }
  }

  /**
   * Check if we should attempt to reset from open to half-open
   */
  private shouldAttemptReset(): boolean {
    if (this.state !== CircuitBreakerState.OPEN) return false;

    const timeSinceOpened = Date.now() - this.stateChangedAt.getTime();
    return timeSinceOpened >= this.config.timeout;
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    const averageResponseTime =
      this.successfulRequests > 0
        ? this.responseTimeSum / this.successfulRequests
        : 0;

    const uptime =
      this.totalRequests > 0
        ? (this.successfulRequests / this.totalRequests) * 100
        : 100;

    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      stateChangedAt: this.stateChangedAt,
      totalRequests: this.totalRequests,
      failedRequests: this.failedRequests,
      successfulRequests: this.successfulRequests,
      rejectedRequests: this.rejectedRequests,
      averageResponseTime,
      uptime,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.stateChangedAt = new Date();
    this.halfOpenRequestsInProgress = 0;
    this.logStateChange(CircuitBreakerState.CLOSED, 'Circuit manually reset');
  }

  /**
   * Force open the circuit breaker
   */
  forceOpen(): void {
    this.state = CircuitBreakerState.OPEN;
    this.stateChangedAt = new Date();
    this.logStateChange(CircuitBreakerState.OPEN, 'Circuit manually opened');
  }

  /**
   * Start health check timer
   */
  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      if (this.state === CircuitBreakerState.OPEN) {
        try {
          // Perform a lightweight health check
          await this.performHealthCheck();

          // If health check passes and timeout has elapsed, try half-open
          if (this.shouldAttemptReset()) {
            this.state = CircuitBreakerState.HALF_OPEN;
            this.stateChangedAt = new Date();
            this.logStateChange(
              CircuitBreakerState.HALF_OPEN,
              'Health check passed, attempting reset'
            );
          }
        } catch (error) {
          // Health check failed, stay in open state
          if (this.config.monitoring.logFailures) {
            console.warn(`Health check failed for ${this.serviceName}:`, error);
          }
        }
      }
    }, this.config.healthCheck.interval);
  }

  /**
   * Perform health check (override this method for custom health checks)
   */
  protected async performHealthCheck(): Promise<void> {
    // Default implementation - just a promise that resolves
    // Override this method in subclasses for specific health checks
    return Promise.resolve();
  }

  /**
   * Log state changes
   */
  private logStateChange(newState: CircuitBreakerState, reason: string): void {
    if (
      this.config.monitoring.enabled &&
      this.config.monitoring.logStateChanges
    ) {
      console.log(
        `Circuit breaker ${this.serviceName} changed to ${newState}: ${reason}`
      );
    }
  }

  /**
   * Send alert (override this method for custom alerting)
   */
  protected sendAlert(message: string): void {
    // Default implementation - just log
    console.error(`ALERT: ${message}`);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }
}

// Specialized circuit breakers for different services
export class SubscriptionDatabaseCircuitBreaker extends SubscriptionCircuitBreaker {
  constructor(config?: Partial<CircuitBreakerConfig>) {
    super('subscription_database', {
      failureThreshold: 3,
      timeout: 30_000, // 30 seconds
      ...config,
    });
  }

  protected async performHealthCheck(): Promise<void> {
    // Perform a simple database ping or lightweight query
    // This is a placeholder - implement actual database health check
    const _startTime = Date.now();
    const timeout = this.config.healthCheck.timeout;

    return Promise.race([
      // Simulate database health check
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 100);
      }),
      new Promise<void>((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), timeout);
      }),
    ]);
  }
}

export class SubscriptionCacheCircuitBreaker extends SubscriptionCircuitBreaker {
  constructor(config?: Partial<CircuitBreakerConfig>) {
    super('subscription_cache', {
      failureThreshold: 5,
      timeout: 10_000, // 10 seconds
      ...config,
    });
  }

  protected async performHealthCheck(): Promise<void> {
    // Perform cache connectivity check
    const _startTime = Date.now();
    const timeout = this.config.healthCheck.timeout;

    return Promise.race([
      // Simulate cache health check
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 50);
      }),
      new Promise<void>((_, reject) => {
        setTimeout(
          () => reject(new Error('Cache health check timeout')),
          timeout
        );
      }),
    ]);
  }
}

export class SubscriptionExternalAPICircuitBreaker extends SubscriptionCircuitBreaker {
  constructor(apiName: string, config?: Partial<CircuitBreakerConfig>) {
    super(`subscription_external_api_${apiName}`, {
      failureThreshold: 3,
      timeout: 60_000, // 1 minute
      ...config,
    });
  }

  protected async performHealthCheck(): Promise<void> {
    // Perform external API health check
    const _startTime = Date.now();
    const timeout = this.config.healthCheck.timeout;

    return Promise.race([
      // Simulate API health check
      new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 200);
      }),
      new Promise<void>((_, reject) => {
        setTimeout(
          () => reject(new Error('API health check timeout')),
          timeout
        );
      }),
    ]);
  }
}

// Global circuit breaker registry
class CircuitBreakerRegistry {
  private breakers = new Map<string, SubscriptionCircuitBreaker>();

  register(name: string, breaker: SubscriptionCircuitBreaker): void {
    this.breakers.set(name, breaker);
  }

  get(name: string): SubscriptionCircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getAll(): Map<string, SubscriptionCircuitBreaker> {
    return new Map(this.breakers);
  }

  getStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  destroy(): void {
    for (const breaker of this.breakers.values()) {
      breaker.destroy();
    }
    this.breakers.clear();
  }
}

// Global registry instance with default circuit breakers
export const circuitBreakerRegistry = new CircuitBreakerRegistry();

// Initialize default circuit breakers
const databaseBreaker = new SubscriptionDatabaseCircuitBreaker();
const cacheBreaker = new SubscriptionCacheCircuitBreaker();

circuitBreakerRegistry.register('database', databaseBreaker);
circuitBreakerRegistry.register('cache', cacheBreaker);
