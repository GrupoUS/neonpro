/**
 * Healthcare Circuit Breaker Implementation
 * Provides resilience patterns for external dependencies in healthcare systems
 */

export enum CircuitBreakerState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerConfig {
  serviceName: string;
  failureThreshold: number;
  timeoutDuration: number; // milliseconds
  halfOpenMaxCalls: number;
  healthcareCritical: boolean; // Special handling for critical healthcare services
}

export interface CircuitBreakerMetrics {
  totalCalls: number;
  successCalls: number;
  failureCalls: number;
  timeouts: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  stateChanges: {
    from: CircuitBreakerState;
    to: CircuitBreakerState;
    timestamp: Date;
    reason: string;
  }[];
}

export class CircuitBreakerOpenError extends Error {
  constructor(serviceName: string) {
    super(`Circuit breaker is OPEN for service: ${serviceName}`);
    this.name = "CircuitBreakerOpenError";
  }
}

export class HealthcareCircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: Date | null = null;
  private halfOpenCalls: number = 0;
  private metrics: CircuitBreakerMetrics;

  constructor(private config: CircuitBreakerConfig) {
    this.metrics = {
      totalCalls: 0,
      successCalls: 0,
      failureCalls: 0,
      timeouts: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      stateChanges: [],
    };
  } /**
   * Execute an operation with circuit breaker protection
   */

  async call<T>(operation: () => Promise<T>): Promise<T> {
    this.metrics.totalCalls++;

    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        throw new CircuitBreakerOpenError(this.config.serviceName);
      }
    }

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitBreakerOpenError(this.config.serviceName);
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await Promise.race([operation(), this.timeoutPromise()]);

      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Creates a timeout promise for operation timeout handling
   */
  private timeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        this.metrics.timeouts++;
        reject(
          new Error(`Operation timeout after ${this.config.timeoutDuration}ms`),
        );
      }, this.config.timeoutDuration);
    });
  } /**
   * Handle successful operation
   */

  private onSuccess(): void {
    this.metrics.successCalls++;
    this.metrics.lastSuccessTime = new Date();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Successful call in half-open state - reset to closed
      this.transitionToClosed();
    }

    // Reset failure count on success
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: unknown): void {
    this.metrics.failureCalls++;
    this.failureCount++;
    this.lastFailureTime = new Date();
    this.metrics.lastFailureTime = this.lastFailureTime;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      // Failure in half-open state - immediately go back to open
      this.transitionToOpen("Failure during half-open state");
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.transitionToOpen(`Failure threshold reached: ${this.failureCount}`);
    }

    // Special handling for healthcare-critical services
    if (this.config.healthcareCritical) {
      this.triggerHealthcareCriticalAlert(error);
    }
  }

  /**
   * Check if circuit breaker should attempt to reset from OPEN to HALF_OPEN
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return false;
    }

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime();
    return timeSinceLastFailure >= this.config.timeoutDuration;
  } /**
   * Transition to CLOSED state
   */

  private transitionToClosed(): void {
    const previousState = this.state;
    this.state = CircuitBreakerState.CLOSED;
    this.recordStateChange(previousState, this.state, "Service recovered");

    console.log(
      `[Circuit Breaker] ${this.config.serviceName}: CLOSED - Service recovered`,
    );
  }

  /**
   * Transition to OPEN state
   */
  private transitionToOpen(reason: string): void {
    const previousState = this.state;
    this.state = CircuitBreakerState.OPEN;
    this.halfOpenCalls = 0;
    this.recordStateChange(previousState, this.state, reason);

    console.error(
      `[Circuit Breaker] ${this.config.serviceName}: OPEN - ${reason}`,
    );
  }

  /**
   * Transition to HALF_OPEN state
   */
  private transitionToHalfOpen(): void {
    const previousState = this.state;
    this.state = CircuitBreakerState.HALF_OPEN;
    this.halfOpenCalls = 0;
    this.recordStateChange(previousState, this.state, "Attempting recovery");

    console.log(
      `[Circuit Breaker] ${this.config.serviceName}: HALF_OPEN - Attempting recovery`,
    );
  }

  /**
   * Record state change for metrics
   */
  private recordStateChange(
    from: CircuitBreakerState,
    to: CircuitBreakerState,
    reason: string,
  ): void {
    this.metrics.stateChanges.push({
      from,
      to,
      timestamp: new Date(),
      reason,
    });

    // Keep only last 50 state changes to prevent memory bloat
    if (this.metrics.stateChanges.length > 50) {
      this.metrics.stateChanges = this.metrics.stateChanges.slice(-50);
    }
  } /**
   * Trigger alert for healthcare-critical service failures
   */

  private triggerHealthcareCriticalAlert(error: unknown): void {
    // TODO: Implement actual alerting system integration
    console.error(
      `[HEALTHCARE CRITICAL ALERT] Service ${this.config.serviceName} failure:`,
      {
        error: error instanceof Error ? error.message : String(error),
        failureCount: this.failureCount,
        state: this.state,
        timestamp: new Date(),
        serviceName: this.config.serviceName,
      },
    );
  }

  /**
   * Get current circuit breaker state
   */
  get currentState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get circuit breaker metrics
   */
  get getMetrics(): Readonly<CircuitBreakerMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get service configuration
   */
  get getConfig(): Readonly<CircuitBreakerConfig> {
    return { ...this.config };
  }

  /**
   * Get health status of the circuit breaker
   */
  get isHealthy(): boolean {
    if (this.state === CircuitBreakerState.OPEN) {
      return false;
    }

    const totalCalls = this.metrics.totalCalls;
    if (totalCalls === 0) {
      return true;
    }

    const successRate = this.metrics.successCalls / totalCalls;
    return successRate >= 0.8; // 80% success rate threshold
  }

  /**
   * Reset circuit breaker to initial state (use with caution)
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.halfOpenCalls = 0;

    console.log(
      `[Circuit Breaker] ${this.config.serviceName}: RESET - Manually reset to CLOSED state`,
    );
  }
}
