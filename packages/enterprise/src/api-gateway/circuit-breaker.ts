// NeonPro Enterprise Circuit Breaker - Healthcare Resilience
// Constitutional Healthcare Compliance | LGPD + ANVISA + CFM
// Enterprise Scalability - Fault Tolerance for Medical Systems

/**
 * Healthcare Circuit Breaker Pattern
 * Provides fault tolerance for critical healthcare microservices
 * Ensures system resilience during service failures
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private nextAttemptTime?: Date;

  private readonly config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      successThreshold: config.successThreshold || 3,
      resetTimeout: config.resetTimeout || 60_000, // 1 minute default
      healthcareContext: config.healthcareContext || "general",
      emergencyBypass: config.emergencyBypass,
      ...config,
    };
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if emergency bypass is enabled for critical healthcare operations
    if (this.config.emergencyBypass && this.isEmergencyContext()) {
      try {
        const result = await this.executeWithTimeout(operation);
        this.onSuccess();
        return result;
      } catch (error) {
        // Log emergency bypass usage for audit
        this.logEmergencyBypass(error);
        throw error;
      }
    }

    // Standard circuit breaker logic
    if (this.state === CircuitBreakerState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.logStateChange("OPEN", "HALF_OPEN", "Reset timeout reached");
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker is OPEN for ${this.config.healthcareContext}. ` +
            `Next attempt at: ${this.nextAttemptTime?.toISOString()}`,
        );
      }
    }

    try {
      const result = await this.executeWithTimeout(operation);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Execute operation with healthcare-appropriate timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    const timeout = this.getTimeoutForContext();

    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(
            new CircuitBreakerTimeoutError(
              `Healthcare operation timed out after ${timeout}ms for ${this.config.healthcareContext}`,
            ),
          );
        }, timeout);
      }),
    ]);
  }

  /**
   * Get timeout based on healthcare context
   */
  private getTimeoutForContext(): number {
    const timeouts: Record<string, number> = {
      emergency: 2000, // 2s for emergency operations
      patient_data: 5000, // 5s for patient data operations
      medical_records: 8000, // 8s for medical records
      scheduling: 10_000, // 10s for appointment scheduling
      billing: 15_000, // 15s for billing operations
      reporting: 30_000, // 30s for reports
      general: 10_000, // 10s default
    };

    return timeouts[this.config.healthcareContext] || timeouts.general;
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.lastSuccessTime = new Date();
    this.failureCount = 0;

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.config.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
        this.successCount = 0;
        this.logStateChange("HALF_OPEN", "CLOSED", "Success threshold reached");
      }
    }
  }

  /**
   * Handle failed operation
   */
  private onFailure(error: unknown): void {
    this.lastFailureTime = new Date();
    this.failureCount++;
    this.successCount = 0;

    // Log healthcare error for audit
    this.logHealthcareFailure(error);

    if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout);

      this.logStateChange(
        this.state === CircuitBreakerState.HALF_OPEN ? "HALF_OPEN" : "CLOSED",
        "OPEN",
        `Failure threshold reached (${this.failureCount}/${this.config.failureThreshold})`,
      );
    }
  }

  /**
   * Check if circuit breaker should attempt reset
   */
  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime ? new Date() >= this.nextAttemptTime : false;
  }

  /**
   * Check if current context is emergency
   */
  private isEmergencyContext(): boolean {
    return (
      this.config.healthcareContext === "emergency" ||
      this.config.healthcareContext === "patient_data"
    );
  }

  /**
   * Get current circuit breaker status
   */
  getStatus(): CircuitBreakerStatus {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      nextAttemptTime: this.nextAttemptTime,
      healthcareContext: this.config.healthcareContext,
      config: this.config,
    };
  }

  /**
   * Reset circuit breaker manually (for maintenance)
   */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;

    this.logStateChange("MANUAL", "CLOSED", "Manual reset performed");
  }

  /**
   * Log state changes for healthcare audit
   */
  private logStateChange(from: string, to: string, reason: string): void {}

  /**
   * Log healthcare failures for regulatory compliance
   */
  private logHealthcareFailure(error: unknown): void {}

  /**
   * Log emergency bypass usage
   */
  private logEmergencyBypass(error: unknown): void {}
}

// Healthcare Circuit Breaker States
export enum CircuitBreakerState {
  CLOSED = "CLOSED", // Normal operation
  OPEN = "OPEN", // Blocking requests
  HALF_OPEN = "HALF_OPEN", // Testing if service recovered
}

// Configuration interface
export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  resetTimeout: number; // Time before attempting reset (ms)
  healthcareContext: string; // Healthcare operation context
  emergencyBypass: boolean; // Allow bypass for emergency operations
}

// Status interface
export interface CircuitBreakerStatus {
  state: CircuitBreakerState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  nextAttemptTime?: Date;
  healthcareContext: string;
  config: CircuitBreakerConfig;
}

// Custom error classes
export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerOpenError";
  }
}

export class CircuitBreakerTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CircuitBreakerTimeoutError";
  }
}

// Healthcare Circuit Breaker Manager
export class HealthcareCircuitBreakerManager {
  private readonly circuitBreakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create circuit breaker for healthcare service
   */
  getCircuitBreaker(
    serviceKey: string,
    config?: Partial<CircuitBreakerConfig>,
  ): CircuitBreaker {
    if (!this.circuitBreakers.has(serviceKey)) {
      this.circuitBreakers.set(serviceKey, new CircuitBreaker(config));
    }
    return this.circuitBreakers.get(serviceKey)!;
  }

  /**
   * Get status of all circuit breakers
   */
  getAllStatuses(): Record<string, CircuitBreakerStatus> {
    const statuses: Record<string, CircuitBreakerStatus> = {};

    for (const [key, circuitBreaker] of this.circuitBreakers) {
      statuses[key] = circuitBreaker.getStatus();
    }

    return statuses;
  }

  /**
   * Reset all circuit breakers (maintenance operation)
   */
  resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.reset();
    }
  }

  /**
   * Get health summary for monitoring
   */
  getHealthSummary(): HealthcareCircuitBreakerHealth {
    const statuses = this.getAllStatuses();
    const total = Object.keys(statuses).length;

    const healthy = Object.values(statuses).filter(
      (s) => s.state === CircuitBreakerState.CLOSED,
    ).length;
    const degraded = Object.values(statuses).filter(
      (s) => s.state === CircuitBreakerState.HALF_OPEN,
    ).length;
    const unhealthy = Object.values(statuses).filter(
      (s) => s.state === CircuitBreakerState.OPEN,
    ).length;

    return {
      total,
      healthy,
      degraded,
      unhealthy,
      healthPercentage: total > 0 ? (healthy / total) * 100 : 100,
      details: statuses,
    };
  }
}

export interface HealthcareCircuitBreakerHealth {
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  healthPercentage: number;
  details: Record<string, CircuitBreakerStatus>;
}
