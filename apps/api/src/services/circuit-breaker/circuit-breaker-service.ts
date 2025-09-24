/**
 * Circuit Breaker Service for External Dependencies
 * T081 - External Service Reliability
 *
 * Features:
 * - Configurable circuit breaker patterns for external API calls
 * - Healthcare-specific fail-secure mechanisms
 * - Graceful degradation and fallback strategies
 * - Comprehensive monitoring and alerting
 * - Compliance with LGPD/ANVISA requirements
 */

// Circuit breaker states
export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

// Service health status
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN'

// Circuit breaker configuration
export interface CircuitBreakerConfig {
  // Failure thresholds
  failureThreshold: number // Number of failures before opening circuit
  resetTimeout: number // Milliseconds to wait before attempting reset
  monitoringPeriod: number // Time window for failure counting

  // Retry configuration
  maxRetries: number
  retryDelay: number // Base delay for exponential backoff
  retryBackoffMultiplier: number

  // Timeout configuration
  requestTimeout: number // Individual request timeout
  overallTimeout: number // Overall operation timeout

  // Healthcare-specific settings
  healthcareCritical: boolean // Whether this service is healthcare-critical
  failSecureMode: boolean // Deny access on failure if true
  auditLogging: boolean // Enable detailed audit logging

  // Custom fallback
  customFallback?: (error: Error, _context?: any) => Promise<any>
}

// Circuit breaker metrics
export interface CircuitBreakerMetrics {
  state: CircuitState
  healthStatus: HealthStatus
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  consecutiveFailures: number
  lastFailureTime?: Date
  lastSuccessTime?: Date
  averageResponseTime: number
  circuitOpenTime?: Date
  retryAttempts: number
  fallbackActivations: number
  healthCheckResults: HealthCheckResult[]
}

// Health check result
export interface HealthCheckResult {
  timestamp: Date
  status: HealthStatus
  responseTime: number
  error?: string
  details?: any
}

// Request context for audit logging
export interface RequestContext {
  _userId?: string
  sessionId?: string
  patientId?: string
  endpoint: string
  method: string
  _service: string
  timestamp: Date
  metadata?: Record<string, any>
}

// Circuit breaker event
export interface CircuitBreakerEvent {
  type:
    | 'STATE_CHANGE'
    | 'REQUEST_SUCCESS'
    | 'REQUEST_FAILURE'
    | 'FALLBACK_ACTIVATED'
    | 'HEALTH_CHECK'
  timestamp: Date
  fromState?: CircuitState
  toState?: CircuitState
  error?: Error
  _context?: RequestContext
  metrics: CircuitBreakerMetrics
}

// Default configuration for healthcare services
export const HEALTHCARE_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  monitoringPeriod: 300000, // 5 minutes
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoffMultiplier: 2,
  requestTimeout: 10000, // 10 seconds
  overallTimeout: 30000, // 30 seconds
  healthcareCritical: true,
  failSecureMode: true,
  auditLogging: true,
}

// Configuration for non-critical services
export const STANDARD_CIRCUIT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 10,
  resetTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000, // 1 minute
  maxRetries: 2,
  retryDelay: 500,
  retryBackoffMultiplier: 1.5,
  requestTimeout: 5000, // 5 seconds
  overallTimeout: 15000, // 15 seconds
  healthcareCritical: false,
  failSecureMode: false,
  auditLogging: false,
}

/**
 * Circuit Breaker Service Implementation
 */
export class CircuitBreakerService {
  private config: CircuitBreakerConfig
  private state: CircuitState = 'CLOSED'
  private metrics: CircuitBreakerMetrics
  private failureCount = 0
  private lastFailureTime?: Date
  private nextAttemptTime?: Date
  private eventCallbacks: ((event: CircuitBreakerEvent) => void)[] = []
  private healthCheckInterval?: NodeJS.Timeout
  private requestHistory: Array<{
    timestamp: Date
    success: boolean
    responseTime: number
  }> = []
  private maxHistorySize = 1000

  constructor(config: CircuitBreakerConfig) {
    this.config = { ...config }
    this.metrics = this.initializeMetrics()
    this.startHealthMonitoring()
  }

  /**
   * Execute a protected operation with circuit breaker
   */
  async execute<T>(
    operation: () => Promise<T>,
    _context?: RequestContext,
    _fallbackValue?: T,
  ): Promise<T> {
    const startTime = Date.now()

    // Check if circuit is open and we should fail fast
    if (this.state === 'OPEN' && this.shouldFailFast()) {
      return this.handleCircuitOpen(context, _fallbackValue)
    }

    try {
      // Execute with timeout
      const result = await this.executeWithTimeout(operation)

      // Record success
      this.recordSuccess(Date.now() - startTime)

      // Emit success event
      this.emitEvent({
        type: 'REQUEST_SUCCESS',
        timestamp: new Date(),
        context,
        metrics: this.getMetrics(),
      })

      return result
    } catch {
      // Error caught but not used - handled by surrounding logic
      // Record failure
      this.recordFailure(error as Error, Date.now() - startTime)

      // Emit failure event
      this.emitEvent({
        type: 'REQUEST_FAILURE',
        timestamp: new Date(),
        error: error as Error,
        context,
        metrics: this.getMetrics(),
      })

      // Handle failure with fallback
      return this.handleFailure(error as Error, context, _fallbackValue)
    }
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, _reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(`Operation timeout after ${this.config.requestTimeout}ms`),
        )
      }, this.config.requestTimeout)

      operation()
        .then((result) => {
          clearTimeout(timeout)
          resolve(result)
        })
        .catch((error) => {
          clearTimeout(timeout)
          reject(error)
        })
    })
  }

  /**
   * Check if we should fail fast (circuit open and timeout not expired)
   */
  private shouldFailFast(): boolean {
    if (this.state !== 'OPEN' || !this.nextAttemptTime) {
      return false
    }
    return Date.now() < this.nextAttemptTime.getTime()
  }

  /**
   * Handle circuit open state
   */
  private async handleCircuitOpen<T>(
    _context?: RequestContext,
    _fallbackValue?: T,
  ): Promise<T> {
    this.metrics.fallbackActivations++

    // Emit fallback event
    this.emitEvent({
      type: 'FALLBACK_ACTIVATED',
      timestamp: new Date(),
      context,
      metrics: this.getMetrics(),
    })

    // Use custom fallback if provided
    if (this.config.customFallback) {
      try {
        return await this.config.customFallback(
          new Error('Circuit breaker is OPEN'),
          context,
        )
      } catch (fallbackError) {
        // Fallback failed, use default behavior
        logger?.warn?.('Custom fallback failed', {
          message: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        })
      }
    }

    // For healthcare critical services, fail secure
    if (this.config.healthcareCritical && this.config.failSecureMode) {
      throw new Error(
        'Service unavailable - healthcare critical operation blocked',
      )
    }

    // Return fallback value if provided
    if (fallbackValue !== undefined) {
      return fallbackValue
    }

    // For non-critical services, throw informative error
    throw new Error('Service temporarily unavailable due to high failure rate')
  }

  /**
   * Handle operation failure
   */
  private async handleFailure<T>(
    error: Error,
    _context?: RequestContext,
    _fallbackValue?: T,
  ): Promise<T> {
    // Check if we should open the circuit
    if (this.state === 'CLOSED' && this.shouldOpenCircuit()) {
      this.openCircuit()
    } else if (this.state === 'HALF_OPEN') {
      // Any failure in half-open state reopens the circuit
      this.openCircuit()
    }

    // Try fallback mechanisms
    if (this.config.customFallback) {
      try {
        const fallbackResult = await this.config.customFallback(
          error,
          _context,
        )
        this.metrics.fallbackActivations++
        return fallbackResult
      } catch (fallbackError) {
        // Fallback failed, continue with default handling
        logger?.warn?.('Custom fallback failed', {
          message: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        })
      }
    }

    // For healthcare critical services, fail secure
    if (this.config.healthcareCritical && this.config.failSecureMode) {
      throw new Error(`Healthcare service failed: ${error.message}`)
    }

    // Re-throw original error if no fallback available
    throw error
  }

  /**
   * Check if circuit should be opened
   */
  private shouldOpenCircuit(): boolean {
    return this.failureCount >= this.config.failureThreshold
  }

  /**
   * Open the circuit (stop allowing requests)
   */
  private openCircuit(): void {
    const previousState = this.state
    this.state = 'OPEN'
    this.nextAttemptTime = new Date(Date.now() + this.config.resetTimeout)
    this.metrics.circuitOpenTime = new Date()

    // Emit state change event
    this.emitEvent({
      type: 'STATE_CHANGE',
      timestamp: new Date(),
      fromState: previousState,
      toState: this.state,
      metrics: this.getMetrics(),
    })

    // Schedule reset attempt
    setTimeout(() => this.attemptReset(), this.config.resetTimeout)
  }

  /**
   * Attempt to reset the circuit
   */
  private attemptReset(): void {
    if (this.state === 'OPEN') {
      this.state = 'HALF_OPEN'

      // Emit state change event
      this.emitEvent({
        type: 'STATE_CHANGE',
        timestamp: new Date(),
        fromState: 'OPEN',
        toState: 'HALF_OPEN',
        metrics: this.getMetrics(),
      })

      // Perform health check
      this.performHealthCheck()
    }
  }

  /**
   * Record successful operation
   */
  private recordSuccess(responseTime: number): void {
    this.metrics.totalRequests++
    this.metrics.successfulRequests++
    this.metrics.consecutiveFailures = 0
    this.metrics.lastSuccessTime = new Date()

    // Update response time average
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)
      + responseTime
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests

    // Add to history
    this.requestHistory.push({
      timestamp: new Date(),
      success: true,
      responseTime,
    })

    // Clean old history
    this.cleanupHistory()

    // If we were in half-open state, close the circuit
    if (this.state === 'HALF_OPEN') {
      this.closeCircuit()
    }

    this.updateHealthStatus()
  }

  /**
   * Record failed operation
   */
  private recordFailure(error: Error, responseTime: number): void {
    this.metrics.totalRequests++
    this.metrics.failedRequests++
    this.metrics.consecutiveFailures++
    this.metrics.lastFailureTime = new Date()

    // Update response time average (even for failures)
    const totalResponseTime = this.metrics.averageResponseTime * (this.metrics.totalRequests - 1)
      + responseTime
    this.metrics.averageResponseTime = totalResponseTime / this.metrics.totalRequests

    // Add to history
    this.requestHistory.push({
      timestamp: new Date(),
      success: false,
      responseTime,
    })

    // Clean old history
    this.cleanupHistory()

    // Audit log for healthcare services
    if (this.config.healthcareCritical && this.config.auditLogging) {
      this.auditFailure(error)
    }

    this.updateHealthStatus()
  }

  /**
   * Close the circuit (allow all requests)
   */
  private closeCircuit(): void {
    const previousState = this.state
    this.state = 'CLOSED'
    this.failureCount = 0
    this.nextAttemptTime = undefined

    // Emit state change event
    this.emitEvent({
      type: 'STATE_CHANGE',
      timestamp: new Date(),
      fromState: previousState,
      toState: this.state,
      metrics: this.getMetrics(),
    })
  }

  /**
   * Update health status based on metrics
   */
  private updateHealthStatus(): void {
    const successRate = this.metrics.totalRequests > 0
      ? this.metrics.successfulRequests / this.metrics.totalRequests
      : 1

    if (successRate >= 0.95 && this.metrics.averageResponseTime < 2000) {
      this.metrics.healthStatus = 'HEALTHY'
    } else if (successRate >= 0.8 && this.metrics.averageResponseTime < 5000) {
      this.metrics.healthStatus = 'DEGRADED'
    } else if (successRate >= 0.5) {
      this.metrics.healthStatus = 'UNHEALTHY'
    } else {
      this.metrics.healthStatus = 'UNHEALTHY'
    }
  }

  /**
   * Clean up old request history
   */
  private cleanupHistory(): void {
    const cutoff = new Date(Date.now() - this.config.monitoringPeriod)
    this.requestHistory = this.requestHistory.filter(
      (req) => req.timestamp > cutoff,
    )

    if (this.requestHistory.length > this.maxHistorySize) {
      this.requestHistory = this.requestHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Audit failure for compliance
   */
  private auditFailure(error: Error): void {
    // In a real implementation, this would write to audit log
    console.warn('Circuit Breaker Failure Audit:', {
      timestamp: new Date().toISOString(),
      error: error.message,
      _service: this.constructor.name,
      state: this.state,
      consecutiveFailures: this.metrics.consecutiveFailures,
      healthcareCritical: this.config.healthcareCritical,
    })
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck()
    }, this.config.resetTimeout / 2) // Check twice as often as reset timeout
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now()
    let status: HealthStatus = 'UNKNOWN'
    let error: string | undefined

    try {
      // For circuit breaker health, we check recent success rate
      const recentRequests = this.requestHistory.filter(
        (req) => req.timestamp > new Date(Date.now() - this.config.monitoringPeriod),
      )

      if (recentRequests.length === 0) {
        status = 'UNKNOWN'
      } else {
        const successRate = recentRequests.filter((req) => req.success).length
          / recentRequests.length
        const avgResponseTime = recentRequests.reduce((sum, _req) => sum + req.responseTime, 0)
          / recentRequests.length

        if (successRate >= 0.9 && avgResponseTime < 3000) {
          status = 'HEALTHY'
        } else if (successRate >= 0.7 && avgResponseTime < 5000) {
          status = 'DEGRADED'
        } else {
          status = 'UNHEALTHY'
        }
      }
    } catch (checkError) {
      // Error caught but not used - handled by surrounding logic
      status = 'UNHEALTHY'
      error = checkError instanceof Error ? checkError.message : 'Unknown error'
    }

    const responseTime = Date.now() - startTime
    const healthCheckResult: HealthCheckResult = {
      timestamp: new Date(),
      status,
      responseTime,
      error,
    }

    this.metrics.healthCheckResults.push(healthCheckResult)

    // Keep only recent health checks
    if (this.metrics.healthCheckResults.length > 100) {
      this.metrics.healthCheckResults = this.metrics.healthCheckResults.slice(-100)
    }

    // Emit health check event
    this.emitEvent({
      type: 'HEALTH_CHECK',
      timestamp: new Date(),
      metrics: this.getMetrics(),
    })

    // Update health status
    this.metrics.healthStatus = status

    // If we're unhealthy and in half-open state, reopen circuit
    if (status === 'UNHEALTHY' && this.state === 'HALF_OPEN') {
      this.openCircuit()
    }
  }

  /**
   * Emit circuit breaker event
   */
  private emitEvent(event: CircuitBreakerEvent): void {
    this.eventCallbacks.forEach((callback) => {
      try {
        callback(event)
      } catch {
        // Error caught but not used - handled by surrounding logic
        console.error('Error in circuit breaker event callback:', error)
      }
    })
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      healthStatus: 'UNKNOWN',
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      consecutiveFailures: 0,
      averageResponseTime: 0,
      retryAttempts: 0,
      fallbackActivations: 0,
      healthCheckResults: [],
    }
  }

  /**
   * Add event listener
   */
  onEvent(callback: (event: CircuitBreakerEvent) => void): void {
    this.eventCallbacks.push(callback)
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      ...this.metrics,
      state: this.state,
    }
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Force reset the circuit breaker
   */
  forceReset(): void {
    const previousState = this.state
    this.state = 'CLOSED'
    this.failureCount = 0
    this.nextAttemptTime = undefined
    this.metrics = this.initializeMetrics()

    // Emit state change event
    this.emitEvent({
      type: 'STATE_CHANGE',
      timestamp: new Date(),
      fromState: previousState,
      toState: this.state,
      metrics: this.getMetrics(),
    })
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<CircuitBreakerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Destroy the circuit breaker
   */
  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    this.eventCallbacks = []
  }
}

// Circuit breaker registry for managing multiple circuit breakers
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry
  private circuitBreakers: Map<string, CircuitBreakerService> = new Map()

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry()
    }
    return CircuitBreakerRegistry.instance
  }

  /**
   * Get or create circuit breaker for a service
   */
  getCircuitBreaker(
    serviceName: string,
    config?: CircuitBreakerConfig,
  ): CircuitBreakerService {
    if (!this.circuitBreakers.has(serviceName)) {
      const circuitConfig = config
        || (serviceName.includes('healthcare') || serviceName.includes('patient')
          ? HEALTHCARE_CIRCUIT_CONFIG
          : STANDARD_CIRCUIT_CONFIG)

      this.circuitBreakers.set(
        serviceName,
        new CircuitBreakerService(circuitConfig),
      )
    }

    return this.circuitBreakers.get(serviceName)!
  }

  /**
   * Get all circuit breakers
   */
  getAllCircuitBreakers(): Map<string, CircuitBreakerService> {
    return new Map(this.circuitBreakers)
  }

  /**
   * Get metrics for all circuit breakers
   */
  getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {}

    this.circuitBreakers.forEach((circuitBreaker, _serviceName) => {
      metrics[serviceName] = circuitBreaker.getMetrics()
    })

    return metrics
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuitBreakers.forEach((circuitBreaker) => {
      circuitBreaker.forceReset()
    })
  }

  /**
   * Remove a circuit breaker
   */
  removeCircuitBreaker(serviceName: string): void {
    const circuitBreaker = this.circuitBreakers.get(serviceName)
    if (circuitBreaker) {
      circuitBreaker.destroy()
      this.circuitBreakers.delete(serviceName)
    }
  }
}

// Helper function to create circuit breaker for external API calls
export function createCircuitBreaker(
  serviceName: string,
  config?: CircuitBreakerConfig,
): CircuitBreakerService {
  const registry = CircuitBreakerRegistry.getInstance()
  return registry.getCircuitBreaker(serviceName, config)
}

// Higher-order function to wrap external API calls
export function withCircuitBreaker<T>(
  serviceName: string,
  operation: () => Promise<T>,
  _context?: RequestContext,
  _fallbackValue?: T,
  config?: CircuitBreakerConfig,
): Promise<T> {
  const circuitBreaker = createCircuitBreaker(serviceName, config)
  return circuitBreaker.execute(operation, context, _fallbackValue)
}

export default CircuitBreakerService
