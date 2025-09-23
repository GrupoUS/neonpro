/**
 * Comprehensive Resilience Framework for Healthcare Systems
 *
 * Implements standardized resilience patterns including circuit breakers, retry policies,
 * timeout management, and graceful degradation for healthcare compliance.
 *
 * Features:
 * - Configurable circuit breaker patterns
 * - Exponential backoff retry policies
 * - Healthcare-specific timeout configurations
 * - Graceful degradation for offline scenarios
 * - Health check monitoring
 * - LGPD-compliant error handling
 */

// ============================================================================
// Types and Interfaces
// ============================================================================

export enum CircuitState {
  CLOSED = "closed",
  OPEN = "open",
  HALF_OPEN = "half-open",
}

export enum RetryStrategy {
  EXPONENTIAL_BACKOFF = "exponential_backoff",
  LINEAR_BACKOFF = "linear_backoff",
  FIXED_DELAY = "fixed_delay",
  IMMEDIATE = "immediate",
}

export interface ResilienceConfig {
  // Circuit breaker configuration
  circuitBreaker: {
    failureThreshold: number;
    timeoutMs: number;
    halfOpenMaxAttempts: number;
  };

  // Retry configuration
  retry: {
    maxRetries: number;
    strategy: RetryStrategy;
    baseDelayMs: number;
    maxDelayMs: number;
    jitter: boolean;
  };

  // Timeout configuration
  timeout: {
    connectMs: number;
    readMs: number;
    overallMs: number;
  };

  // Health check configuration
  healthCheck: {
    intervalMs: number;
    timeoutMs: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
  };

  // Graceful degradation
  degradation: {
    enabled: boolean;
    fallbackMode: "cache" | "offline" | "reduced";
    cacheTtlMs: number;
  };
}

export interface ServiceHealth {
  serviceName: string;
  isHealthy: boolean;
  latency: number;
  successRate: number;
  lastCheck: Date;
  errorMessage?: string;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
}

export interface ResilienceMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  circuitBreakerTrips: number;
  retryAttempts: number;
  averageLatency: number;
  timeoutCount: number;
  fallbackUsage: number;
}

export interface ExecutionContext {
  operation: string;
  serviceName: string;
  _userId?: string;
  patientId?: string;
  isEmergency: boolean;
  requiresAudit: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// Enhanced Circuit Breaker Implementation
// ============================================================================

export class EnhancedCircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime = 0;
  private consecutiveSuccesses = 0;
  private totalRequests = 0;
  private successfulRequests = 0;
  private trips = 0;

  constructor(
    private readonly serviceName: string,
    private readonly config: ResilienceConfig["circuitBreaker"],
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    _context: ExecutionContext,
  ): Promise<T> {
    this.totalRequests++;

    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        this.consecutiveSuccesses = 0;
      } else {
        throw new ResilienceError(
          `Circuit breaker OPEN for _service: ${this.serviceName}`,
          "CIRCUIT_BREAKER_OPEN",
          context,
        );
      }
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.config.timeoutMs;
  }

  private recordSuccess(): void {
    this.successfulRequests++;
    this.consecutiveSuccesses++;
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.halfOpenMaxAttempts) {
        this.state = CircuitState.CLOSED;
      }
    }
  }

  private recordFailure(): void {
    this.failures++;
    this.consecutiveSuccesses = 0;
    this.lastFailureTime = Date.now();

    if (
      this.state === CircuitState.HALF_OPEN ||
      (this.state === CircuitState.CLOSED &&
        this.failures >= this.config.failureThreshold)
    ) {
      this.state = CircuitState.OPEN;
      this.trips++;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics() {
    return {
      state: this.state,
      failures: this.failures,
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      trips: this.trips,
      successRate:
        this.totalRequests > 0
          ? this.successfulRequests / this.totalRequests
          : 0,
    };
  }

  forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
  }

  forceClose(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.consecutiveSuccesses = 0;
  }
}

// ============================================================================
// Retry Policy Implementation
// ============================================================================

export class RetryPolicy {
  private attempts = 0;

  constructor(private readonly config: ResilienceConfig["retry"]) {}

  async shouldRetry(
    error: Error,
    _context: ExecutionContext,
  ): Promise<boolean> {
    this.attempts++;

    // Don't retry on certain errors
    if (this.isNonRetryableError(error)) {
      return false;
    }

    // For emergencies, retry more aggressively
    if (context.isEmergency && this.attempts <= this.config.maxRetries + 2) {
      return true;
    }

    // Don't retry if max attempts exceeded
    if (this.attempts > this.config.maxRetries) {
      return false;
    }

    return true;
  }

  async getDelay(): Promise<number> {
    let delay = this.config.baseDelayMs;

    switch (this.config.strategy) {
      case RetryStrategy.EXPONENTIAL_BACKOFF:
        delay = Math.min(
          this.config.baseDelayMs * Math.pow(2, this.attempts - 1),
          this.config.maxDelayMs,
        );
        break;

      case RetryStrategy.LINEAR_BACKOFF:
        delay = Math.min(
          this.config.baseDelayMs * this.attempts,
          this.config.maxDelayMs,
        );
        break;

      case RetryStrategy.FIXED_DELAY:
        delay = this.config.baseDelayMs;
        break;

      case RetryStrategy.IMMEDIATE:
        delay = 0;
        break;
    }

    // Add jitter to prevent thundering herd
    if (this.config.jitter && delay > 0) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }

    return delay;
  }

  private isNonRetryableError(error: Error): boolean {
    // Don't retry on authentication errors, validation errors, etc.
    const nonRetryableMessages = [
      "unauthorized",
      "invalid",
      "not found",
      "permission denied",
      "authentication failed",
    ];

    return nonRetryableMessages.some((msg) =>
      error.message.toLowerCase().includes(msg),
    );
  }

  getAttempts(): number {
    return this.attempts;
  }

  reset(): void {
    this.attempts = 0;
  }
}

// ============================================================================
// Timeout Manager
// ============================================================================

export class TimeoutManager {
  constructor(private readonly config: ResilienceConfig["timeout"]) {}

  async executeWithTimeout<T>(
    operation: () => Promise<T>,
    _context: ExecutionContext,
  ): Promise<T> {
    return new Promise((resolve, _reject) => {
      const timeoutId = setTimeout(() => {
        reject(
          new ResilienceError(
            `Operation timeout for ${context.operation}`,
            "TIMEOUT",
            context,
          ),
        );
      }, this.config.overallMs);

      operation()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }
}

// ============================================================================
// Health Monitor
// ============================================================================

export class HealthMonitor {
  private healthChecks: Map<
    string,
    {
      check: () => Promise<boolean>;
      interval: NodeJS.Timeout;
      health: ServiceHealth;
    }
  > = new Map();

  constructor(private readonly config: ResilienceConfig["healthCheck"]) {}

  registerService(
    serviceName: string,
    healthCheck: () => Promise<boolean>,
  ): void {
    const health: ServiceHealth = {
      serviceName,
      isHealthy: false,
      latency: 0,
      successRate: 0,
      lastCheck: new Date(),
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    };

    const interval = setInterval(async () => {
      await this.performHealthCheck(serviceName, healthCheck, health);
    }, this.config.intervalMs);

    this.healthChecks.set(serviceName, {
      check: healthCheck,
      interval,
      health,
    });
  }

  private async performHealthCheck(
    _serviceName: string,
    healthCheck: () => Promise<boolean>,
    health: ServiceHealth,
  ): Promise<void> {
    try {
      const startTime = Date.now();
      const isHealthy = await Promise.race([
        healthCheck(),
        new Promise<boolean>((_resolve, reject) =>
          setTimeout(
            () => reject(new Error("Health check timeout")),
            this.config.timeoutMs,
          ),
        ),
      ]);

      const latency = Date.now() - startTime;

      health.isHealthy = isHealthy;
      health.latency = latency;
      health.lastCheck = new Date();
      health.errorMessage = undefined;

      if (isHealthy) {
        health.consecutiveSuccesses++;
        health.consecutiveFailures = 0;
      } else {
        health.consecutiveFailures++;
        health.consecutiveSuccesses = 0;
      }

      // Calculate success rate (simple moving average)
      health.successRate =
        health.consecutiveSuccesses /
        (health.consecutiveSuccesses + health.consecutiveFailures);
    } catch (error) {
      health.isHealthy = false;
      health.errorMessage = (error as Error).message;
      health.lastCheck = new Date();
      health.consecutiveFailures++;
      health.consecutiveSuccesses = 0;
    }
  }

  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthChecks.get(serviceName)?.health;
  }

  getAllHealthStatus(): ServiceHealth[] {
    return Array.from(this.healthChecks.values()).map((h) => h.health);
  }

  unregisterService(serviceName: string): void {
    const service = this.healthChecks.get(serviceName);
    if (service) {
      clearInterval(service.interval);
      this.healthChecks.delete(serviceName);
    }
  }
}

// ============================================================================
// Main Resilience Framework
// ============================================================================

export class ResilienceFramework {
  private circuitBreakers: Map<string, EnhancedCircuitBreaker> = new Map();
  private healthMonitor: HealthMonitor;
  private timeoutManager: TimeoutManager;
  private metrics: ResilienceMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    circuitBreakerTrips: 0,
    retryAttempts: 0,
    averageLatency: 0,
    timeoutCount: 0,
    fallbackUsage: 0,
  };

  constructor(private readonly config: ResilienceConfig) {
    this.healthMonitor = new HealthMonitor(config.healthCheck);
    this.timeoutManager = new TimeoutManager(config.timeout);
  }

  async execute<T>(
    serviceName: string,
    operation: () => Promise<T>,
    _context: ExecutionContext,
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;

    try {
      // Get or create circuit breaker for service
      let circuitBreaker = this.circuitBreakers.get(serviceName);
      if (!circuitBreaker) {
        circuitBreaker = new EnhancedCircuitBreaker(
          serviceName,
          this.config.circuitBreaker,
        );
        this.circuitBreakers.set(serviceName, circuitBreaker);
      }

      // Execute with circuit breaker protection
      const result = await circuitBreaker.execute(async () => {
        const retryPolicy = new RetryPolicy(this.config.retry);

        while (true) {
          try {
            // Execute with timeout protection
            const timeoutResult = await this.timeoutManager.executeWithTimeout(
              operation,
              context,
            );

            this.metrics.successfulRequests++;
            return timeoutResult;
          } catch (error) {
            const shouldRetry = await retryPolicy.shouldRetry(
              error as Error,
              context,
            );

            if (!shouldRetry) {
              throw error;
            }

            this.metrics.retryAttempts++;
            const delay = await retryPolicy.getDelay();

            if (delay > 0) {
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }
      }, context);

      // Update metrics
      const latency = Date.now() - startTime;
      this.updateAverageLatency(latency);

      return result;
    } catch (error) {
      this.metrics.failedRequests++;

      if (error instanceof ResilienceError) {
        if (error.type === "TIMEOUT") {
          this.metrics.timeoutCount++;
        } else if (error.type === "CIRCUIT_BREAKER_OPEN") {
          this.metrics.circuitBreakerTrips++;
        }
      }

      throw error;
    }
  }

  private updateAverageLatency(newLatency: number): void {
    if (this.metrics.averageLatency === 0) {
      this.metrics.averageLatency = newLatency;
    } else {
      this.metrics.averageLatency =
        this.metrics.averageLatency * 0.9 + newLatency * 0.1;
    }
  }

  registerService(
    serviceName: string,
    healthCheck: () => Promise<boolean>,
  ): void {
    this.healthMonitor.registerService(serviceName, healthCheck);
  }

  getServiceHealth(serviceName: string): ServiceHealth | undefined {
    return this.healthMonitor.getServiceHealth(serviceName);
  }

  getCircuitBreakerState(serviceName: string): CircuitState | undefined {
    return this.circuitBreakers.get(serviceName)?.getState();
  }

  getMetrics(): ResilienceMetrics {
    return { ...this.metrics };
  }

  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      circuitBreakerTrips: 0,
      retryAttempts: 0,
      averageLatency: 0,
      timeoutCount: 0,
      fallbackUsage: 0,
    };
  }

  forceCircuitBreakerOpen(serviceName: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.forceOpen();
    }
  }

  forceCircuitBreakerClose(serviceName: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceName);
    if (circuitBreaker) {
      circuitBreaker.forceClose();
    }
  }
}

// ============================================================================
// Error Types
// ============================================================================

export class ResilienceError extends Error {
  constructor(
    message: string,
    public readonly type: string,
    public readonly _context: ExecutionContext,
  ) {
    super(message);
    this.name = "ResilienceError";
  }
}

// ============================================================================
// Default Configurations
// ============================================================================

export const DEFAULT_HEALTHCARE_RESILIENCE_CONFIG: ResilienceConfig = {
  circuitBreaker: {
    failureThreshold: 5,
    timeoutMs: 60000, // 1 minute
    halfOpenMaxAttempts: 3,
  },
  retry: {
    maxRetries: 3,
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    baseDelayMs: 1000,
    maxDelayMs: 30000, // 30 seconds
    jitter: true,
  },
  timeout: {
    connectMs: 5000,
    readMs: 30000,
    overallMs: 45000,
  },
  healthCheck: {
    intervalMs: 30000, // 30 seconds
    timeoutMs: 5000,
    healthyThreshold: 2,
    unhealthyThreshold: 3,
  },
  degradation: {
    enabled: true,
    fallbackMode: "cache",
    cacheTtlMs: 300000, // 5 minutes
  },
};

export const EMERGENCY_RESILIENCE_CONFIG: ResilienceConfig = {
  ...DEFAULT_HEALTHCARE_RESILIENCE_CONFIG,
  circuitBreaker: {
    failureThreshold: 10, // More lenient for emergencies
    timeoutMs: 30000, // Faster recovery
    halfOpenMaxAttempts: 5,
  },
  retry: {
    maxRetries: 5, // More retries for emergencies
    strategy: RetryStrategy.EXPONENTIAL_BACKOFF,
    baseDelayMs: 500, // Faster retries
    maxDelayMs: 15000,
    jitter: true,
  },
  timeout: {
    connectMs: 3000,
    readMs: 45000,
    overallMs: 60000, // Longer timeout for critical operations
  },
};

// ============================================================================
// Validation Schemas
// ============================================================================

export const ResilienceConfigSchema = z.object({
  circuitBreaker: z.object({
    failureThreshold: z.number().min(1).max(20),
    timeoutMs: z.number().min(1000).max(300000),
    halfOpenMaxAttempts: z.number().min(1).max(10),
  }),
  retry: z.object({
    maxRetries: z.number().min(0).max(10),
    strategy: z.nativeEnum(RetryStrategy),
    baseDelayMs: z.number().min(0).max(60000),
    maxDelayMs: z.number().min(0).max(300000),
    jitter: z.boolean(),
  }),
  timeout: z.object({
    connectMs: z.number().min(1000).max(30000),
    readMs: z.number().min(1000).max(120000),
    overallMs: z.number().min(1000).max(300000),
  }),
  healthCheck: z.object({
    intervalMs: z.number().min(5000).max(300000),
    timeoutMs: z.number().min(1000).max(30000),
    healthyThreshold: z.number().min(1).max(10),
    unhealthyThreshold: z.number().min(1).max(10),
  }),
  degradation: z.object({
    enabled: z.boolean(),
    fallbackMode: z.enum(["cache", "offline", "reduced"]),
    cacheTtlMs: z.number().min(0).max(86400000),
  }),
});
