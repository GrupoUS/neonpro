import type { CircuitBreakerConfig } from "./healthcare-circuit-breaker";
import { HealthcareCircuitBreaker } from "./healthcare-circuit-breaker";
// import { CircuitBreakerState } from "./healthcare-circuit-breaker"; // TODO: Use for state management
import type { ServiceDegradationConfig } from "./service-degradation";
import { healthcareServiceDegradations } from "./service-degradation";

/**
 * Circuit Breaker Manager for Healthcare Services
 * Manages multiple circuit breakers and service degradation strategies
 */
export class CircuitBreakerManager {
  private circuitBreakers = new Map<string, HealthcareCircuitBreaker>();
  private degradationStrategies = new Map<string, ServiceDegradationConfig>();

  constructor() {
    // Initialize with healthcare service configurations
    this.initializeHealthcareServices();
  }

  /**
   * Initialize circuit breakers for common healthcare services
   */
  private initializeHealthcareServices(): void {
    // Payment service circuit breaker
    this.createCircuitBreaker("payment-api", {
      serviceName: "payment-api",
      failureThreshold: 3,
      timeoutDuration: 30_000, // 30 seconds
      halfOpenMaxCalls: 2,
      healthcareCritical: false,
    });

    // SMS service circuit breaker
    this.createCircuitBreaker("sms-service", {
      serviceName: "sms-service",
      failureThreshold: 5,
      timeoutDuration: 60_000, // 1 minute
      halfOpenMaxCalls: 3,
      healthcareCritical: false,
    });

    // Email service circuit breaker
    this.createCircuitBreaker("email-service", {
      serviceName: "email-service",
      failureThreshold: 5,
      timeoutDuration: 60_000,
      halfOpenMaxCalls: 3,
      healthcareCritical: false,
    });

    // Patient data service (critical)
    this.createCircuitBreaker("patient-data-api", {
      serviceName: "patient-data-api",
      failureThreshold: 2, // Lower threshold for critical service
      timeoutDuration: 15_000, // Shorter timeout
      halfOpenMaxCalls: 1,
      healthcareCritical: true,
    });

    // Load degradation strategies
    Object.values(healthcareServiceDegradations).forEach(config => {
      this.degradationStrategies.set(config.serviceName, config);
    });
  }

  /**
   * Create a new circuit breaker for a service
   */
  createCircuitBreaker(
    serviceName: string,
    config: CircuitBreakerConfig,
  ): HealthcareCircuitBreaker {
    const circuitBreaker = new HealthcareCircuitBreaker(config);
    this.circuitBreakers.set(serviceName, circuitBreaker);
    return circuitBreaker;
  }

  /**
   * Get circuit breaker for a service
   */
  getCircuitBreaker(serviceName: string): HealthcareCircuitBreaker | undefined {
    return this.circuitBreakers.get(serviceName);
  }

  /**
   * Execute operation with circuit breaker protection
   */
  async execute<T>(serviceName: string, operation: () => Promise<T>): Promise<T> {
    const circuitBreaker = this.getCircuitBreaker(serviceName);

    if (!circuitBreaker) {
      throw new Error(`No circuit breaker configured for service: ${serviceName}`);
    }

    return circuitBreaker.call(operation);
  }

  /**
   * Execute with fallback strategy
   */
  async executeWithFallback<T>(
    serviceName: string,
    operation: () => Promise<T>,
    fallback: () => Promise<T>,
  ): Promise<T> {
    try {
      return await this.execute(serviceName, operation);
    } catch (error) {
      console.warn(`Service ${serviceName} failed, executing fallback:`, error);
      return fallback();
    }
  }

  /**
   * Get all circuit breaker statuses
   */
  getSystemHealth(): Record<string, unknown> {
    const health: Record<string, unknown> = {};

    for (const [serviceName, circuitBreaker] of this.circuitBreakers) {
      health[serviceName] = {
        state: circuitBreaker.currentState,
        healthy: circuitBreaker.isHealthy,
        metrics: circuitBreaker.getMetrics,
        config: circuitBreaker.getConfig,
      };
    }

    return health;
  }
}
