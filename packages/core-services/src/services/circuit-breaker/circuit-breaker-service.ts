/**
 * Circuit Breaker Service for AI Providers
 * 
 * Implements the circuit breaker pattern to prevent cascading failures
 * and provide graceful degradation when AI providers are unavailable.
 */

export interface CircuitBreakerConfig {
  failureThreshold: number // Number of failures before opening circuit
  resetTimeout: number // Milliseconds to wait before attempting reset
  monitoringPeriod: number // Milliseconds to consider for failure rate
  requestVolumeThreshold: number // Minimum requests before calculating failure rate
}

export interface CircuitBreakerState {
  isOpen: boolean
  failureCount: number
  lastFailureTime: number | null
  nextAttemptTime: number | null
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

export class CircuitBreaker {
  private state: CircuitBreakerState = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    nextAttemptTime: null,
    state: 'CLOSED',
  }

  private failures: Array<{ timestamp: number; error: Error }> = []

  constructor(private readonly config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      resetTimeout: config.resetTimeout || 60000, // 1 minute
      monitoringPeriod: config.monitoringPeriod || 300000, // 5 minutes
      requestVolumeThreshold: config.requestVolumeThreshold || 10,
    }
  }

  async execute<T>(operation: () => Promise<T>, context: string): Promise<T> {
    this.cleanupOldFailures()

    if (this.shouldSkipExecution()) {
      throw new Error(`Circuit breaker is OPEN for ${context}. Skipping execution.`)
    }

    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure(error as Error)
      throw error
    }
  }

  private shouldSkipExecution(): boolean {
    if (this.state.state === 'CLOSED') {
      return false
    }

    if (this.state.state === 'OPEN') {
      const now = Date.now()
      if (this.state.nextAttemptTime && now >= this.state.nextAttemptTime) {
        // Move to HALF_OPEN state to test the connection
        this.state.state = 'HALF_OPEN'
        this.state.nextAttemptTime = null
        return false
      }
      return true
    }

    // HALF_OPEN state - allow one request to test
    return false
  }

  private onSuccess(): void {
    if (this.state.state === 'HALF_OPEN') {
      // Circuit is working again, close it
      this.reset()
    } else {
      // Clear recent failures on success
      this.failures = this.failures.filter(f => 
        Date.now() - f.timestamp > this.config.monitoringPeriod
      )
    }
  }

  private onFailure(error: Error): void {
    const now = Date.now()
    this.failures.push({ timestamp: now, error })
    this.state.failureCount++
    this.state.lastFailureTime = now

    // Check if we should open the circuit
    if (this.shouldOpenCircuit()) {
      this.openCircuit()
    }
  }

  private shouldOpenCircuit(): boolean {
    // Open if failure threshold is exceeded
    if (this.state.failureCount >= this.config.failureThreshold) {
      return true
    }

    // Open if failure rate is too high within monitoring period
    const recentFailures = this.failures.filter(
      f => Date.now() - f.timestamp <= this.config.monitoringPeriod
    )

    if (recentFailures.length >= this.config.requestVolumeThreshold) {
      const failureRate = recentFailures.length / this.config.requestVolumeThreshold
      return failureRate > 0.5 // 50% failure rate threshold
    }

    return false
  }

  private openCircuit(): void {
    this.state.state = 'OPEN'
    this.state.isOpen = true
    this.state.nextAttemptTime = Date.now() + this.config.resetTimeout
    
    console.warn(`Circuit breaker OPENED. Will attempt reset after ${this.config.resetTimeout}ms`, {
      failureCount: this.state.failureCount,
      lastFailureTime: this.state.lastFailureTime,
      nextAttemptTime: this.state.nextAttemptTime,
    })
  }

  private reset(): void {
    this.state = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: null,
      nextAttemptTime: null,
      state: 'CLOSED',
    }
    this.failures = []
  }

  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.config.monitoringPeriod
    this.failures = this.failures.filter(f => f.timestamp > cutoff)
  }

  // Public methods for monitoring
  getState(): CircuitBreakerState {
    return { ...this.state }
  }

  getFailureRate(): number {
    this.cleanupOldFailures()
    const totalRequests = this.failures.length
    return totalRequests > 0 ? this.failures.length / totalRequests : 0
  }

  forceOpen(): void {
    this.openCircuit()
  }

  forceClose(): void {
    this.reset()
  }

  // Get detailed metrics
  getMetrics() {
    this.cleanupOldFailures()
    return {
      state: this.state.state,
      isOpen: this.state.isOpen,
      failureCount: this.state.failureCount,
      recentFailures: this.failures.length,
      failureRate: this.getFailureRate(),
      lastFailureTime: this.state.lastFailureTime,
      nextAttemptTime: this.state.nextAttemptTime,
    }
  }
}

// Factory function to create circuit breakers for different providers
export function createCircuitBreaker(providerName: string, customConfig?: Partial<CircuitBreakerConfig>): CircuitBreaker {
  const defaultConfigs: Record<string, CircuitBreakerConfig> = {
    openai: {
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 120000, // 2 minutes
      requestVolumeThreshold: 5,
    },
    anthropic: {
      failureThreshold: 3,
      resetTimeout: 30000, // 30 seconds
      monitoringPeriod: 120000, // 2 minutes
      requestVolumeThreshold: 5,
    },
    google: {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      requestVolumeThreshold: 10,
    },
    default: {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      requestVolumeThreshold: 10,
    },
  }

  const config = {
    ...defaultConfigs[providerName] || defaultConfigs.default,
    ...customConfig,
  }

  return new CircuitBreaker(config)
}

// Registry to manage circuit breakers for all providers
export class CircuitBreakerRegistry {
  private static circuitBreakers: Map<string, CircuitBreaker> = new Map()

  static getCircuitBreaker(providerName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.circuitBreakers.has(providerName)) {
      const circuitBreaker = createCircuitBreaker(providerName, config)
      this.circuitBreakers.set(providerName, circuitBreaker)
    }
    return this.circuitBreakers.get(providerName)!
  }

  static getAllStates(): Record<string, CircuitBreakerState> {
    const states: Record<string, CircuitBreakerState> = {}
    for (const [provider, circuitBreaker] of this.circuitBreakers) {
      states[provider] = circuitBreaker.getState()
    }
    return states
  }

  static getAllMetrics(): Record<string, any> {
    const metrics: Record<string, any> = {}
    for (const [provider, circuitBreaker] of this.circuitBreakers) {
      metrics[provider] = circuitBreaker.getMetrics()
    }
    return metrics
  }

  static resetAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.forceClose()
    }
  }

  static forceOpenAll(): void {
    for (const circuitBreaker of this.circuitBreakers.values()) {
      circuitBreaker.forceOpen()
    }
  }
}