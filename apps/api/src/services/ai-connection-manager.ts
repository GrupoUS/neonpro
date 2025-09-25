/**
 * AI Agent Connection Manager with Dynamic Pooling and Circuit Breakers
 * 
 * Provides intelligent connection management for AI agent operations with
 * healthcare compliance, dynamic scaling, and comprehensive monitoring
 * 
 * @features Dynamic connection pooling
 * @features Circuit breaker patterns
 * Compliance: LGPD, ANVISA, CFM
 * @performance Auto-scaling and optimization
 */

import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { Redis } from 'ioredis'
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker-service'
import { logger } from '../lib/logger'
import { EventEmitter } from 'events'

// ============================================================================
// CONNECTION POOL CONFIGURATION
// ============================================================================

export interface AIConnectionPoolConfig {
  // Base configuration
  minConnections: number
  maxConnections: number
  acquireTimeoutMs: number
  idleTimeoutMs: number
  reapIntervalMs: number
  
  // Dynamic scaling
  enableScaling: boolean
  scaleUpThreshold: number // Utilization percentage
  scaleDownThreshold: number // Utilization percentage
  scaleCooldownMs: number
  
  // Health monitoring
  healthCheckIntervalMs: number
  maxConnectionAgeMs: number
  connectionRetryAttempts: number
  
  // Circuit breaker
  circuitBreaker: {
    failureThreshold: number
    resetTimeoutMs: number
    requestTimeoutMs: number
    healthcareCritical: boolean
    failSecureMode: boolean
  }
}

// ============================================================================
// CONNECTION METRICS
// ============================================================================

export interface AIConnectionMetrics {
  // Pool metrics
  totalConnections: number
  activeConnections: number
  idleConnections: number
  waitingRequests: number
  
  // Performance metrics
  averageResponseTime: number
  averageWaitTime: number
  connectionUtilization: number
  
  // Error metrics
  connectionErrors: number
  timeoutErrors: number
  healthCheckFailures: number
  
  // Circuit breaker metrics
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
  failureRate: number
  lastFailureTime?: Date
  
  // Timestamps
  lastHealthCheck: Date
  lastScalingEvent?: Date
}

// ============================================================================
// AI CONNECTION MANAGER
// ============================================================================

export class AIConnectionManager extends EventEmitter {
  private supabaseClients: Map<string, SupabaseClient> = new Map()
  private redisClients: Map<string, Redis> = new Map()
  private circuitBreakers: Map<string, CircuitBreakerService> = new Map()
  
  private config: AIConnectionPoolConfig
  private metrics: AIConnectionMetrics
  private lastScalingTime = 0
  private healthCheckTimer?: NodeJS.Timeout
  
  // Connection state tracking
  private connectionStates = new Map<string, {
    createdAt: Date
    lastUsed: Date
    healthStatus: 'healthy' | 'degraded' | 'unhealthy'
    errorCount: number
  }>()

  constructor(config: Partial<AIConnectionPoolConfig> = {}) {
    super()
    
    // Default configuration
    this.config = {
      minConnections: 2,
      maxConnections: 20,
      acquireTimeoutMs: 5000,
      idleTimeoutMs: 30000,
      reapIntervalMs: 60000,
      enableScaling: true,
      scaleUpThreshold: 0.8, // 80% utilization
      scaleDownThreshold: 0.3, // 30% utilization
      scaleCooldownMs: 30000, // 30 seconds
      healthCheckIntervalMs: 30000,
      maxConnectionAgeMs: 3600000, // 1 hour
      connectionRetryAttempts: 3,
      circuitBreaker: {
        failureThreshold: 5,
        resetTimeoutMs: 60000,
        requestTimeoutMs: 10000,
        healthcareCritical: true,
        failSecureMode: true
      },
      ...config
    }
    
    // Initialize metrics
    this.metrics = {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingRequests: 0,
      averageResponseTime: 0,
      averageWaitTime: 0,
      connectionUtilization: 0,
      connectionErrors: 0,
      timeoutErrors: 0,
      healthCheckFailures: 0,
      circuitState: 'CLOSED',
      failureRate: 0,
      lastHealthCheck: new Date()
    }
    
    this.initializeConnectionPool()
    this.startHealthMonitoring()
  }

  /**
   * Initialize connection pool with minimum connections
   */
  private async initializeConnectionPool(): Promise<void> {
    try {
      // Initialize minimum Supabase connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createSupabaseConnection()
      }
      
      // Initialize Redis connection for cache coordination
      await this.createRedisConnection()
      
      // Initialize circuit breakers
      this.initializeCircuitBreakers()
      
      logger.info('AI Connection Manager initialized', {
        minConnections: this.config.minConnections,
        maxConnections: this.config.maxConnections,
        currentConnections: this.supabaseClients.size
      })
      
    } catch (error) {
      logger.error('Failed to initialize AI Connection Manager', { error })
      throw error
    }
  }

  /**
   * Create new Supabase connection
   */
  private async createSupabaseConnection(): Promise<SupabaseClient> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const client = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: { persistSession: false },
          // Connection pool settings
          db: {
            schema: 'public'
          }
        }
      )
      
      // Test connection
      const { error } = await client.from('users').select('count').limit(1)
      if (error) throw error
      
      this.supabaseClients.set(connectionId, client)
      this.connectionStates.set(connectionId, {
        createdAt: new Date(),
        lastUsed: new Date(),
        healthStatus: 'healthy',
        errorCount: 0
      })
      
      this.updateMetrics()
      
      logger.debug('Created new Supabase connection', { connectionId })
      return client
      
    } catch (error) {
      logger.error('Failed to create Supabase connection', { error, connectionId })
      throw error
    }
  }

  /**
   * Create Redis connection
   */
  private async createRedisConnection(): Promise<Redis> {
    try {
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        connectTimeout: 5000,
        commandTimeout: 5000,
        lazyConnect: true
      })
      
      await redis.connect()
      
      const connectionId = `redis_${Date.now()}`
      this.redisClients.set(connectionId, redis)
      
      logger.debug('Created Redis connection', { connectionId })
      return redis
      
    } catch (error) {
      logger.error('Failed to create Redis connection', { error })
      throw error
    }
  }

  /**
   * Initialize circuit breakers for different services
   */
  private initializeCircuitBreakers(): void {
    // Circuit breaker for database operations
    const dbCircuitBreaker = new CircuitBreakerService({
      failureThreshold: this.config.circuitBreaker.failureThreshold,
      resetTimeout: this.config.circuitBreaker.resetTimeoutMs,
      monitoringPeriod: 60000,
      maxRetries: 2,
      retryDelay: 1000,
      retryBackoffMultiplier: 2,
      requestTimeout: this.config.circuitBreaker.requestTimeoutMs,
      overallTimeout: 30000,
      healthcareCritical: this.config.circuitBreaker.healthcareCritical,
      failSecureMode: this.config.circuitBreaker.failSecureMode,
      auditLogging: true
    })
    
    this.circuitBreakers.set('database', dbCircuitBreaker)
    
    // Circuit breaker for external AI providers
    const aiProviderCircuitBreaker = new CircuitBreakerService({
      failureThreshold: 3,
      resetTimeout: 30000,
      monitoringPeriod: 60000,
      maxRetries: 3,
      retryDelay: 2000,
      retryBackoffMultiplier: 2,
      requestTimeout: 15000,
      overallTimeout: 45000,
      healthcareCritical: false,
      failSecureMode: true,
      auditLogging: true
    })
    
    this.circuitBreakers.set('ai_provider', aiProviderCircuitBreaker)
    
    logger.info('Initialized circuit breakers for AI services')
  }

  /**
   * Get connection from pool with circuit breaker protection
   */
  async getConnection(): Promise<SupabaseClient> {
    const startTime = Date.now()
    
    try {
      // Check circuit breaker state
      const dbCircuitBreaker = this.circuitBreakers.get('database')
      if (!dbCircuitBreaker) {
        throw new Error('Database circuit breaker not initialized')
      }
      
      // Execute with circuit breaker protection
      const client = await dbCircuitBreaker.execute(async () => {
        return await this.getConnectionFromPool()
      })
      
      // Update metrics
      this.metrics.averageWaitTime = this.updateAverage(
        this.metrics.averageWaitTime,
        Date.now() - startTime
      )
      
      return client
      
    } catch (error) {
      this.metrics.connectionErrors++
      logger.error('Failed to get connection from pool', { error })
      throw error
    }
  }

  /**
   * Get connection from pool with scaling logic
   */
  private async getConnectionFromPool(): Promise<SupabaseClient> {
    // Find available connection
    for (const [connectionId, client] of this.supabaseClients) {
      const state = this.connectionStates.get(connectionId)
      if (state && state.healthStatus === 'healthy') {
        // Update usage
        state.lastUsed = new Date()
        this.updateMetrics()
        return client
      }
    }
    
    // No available connections, try to scale up
    if (this.config.enableScaling && this.shouldScaleUp()) {
      await this.scaleUp()
      return this.getConnectionFromPool() // Retry after scaling
    }
    
    // Pool exhausted
    throw new Error('Connection pool exhausted. Please try again later.')
  }

  /**
   * Check if pool should scale up
   */
  private shouldScaleUp(): boolean {
    const now = Date.now()
    const cooldownPassed = now - this.lastScalingTime > this.config.scaleCooldownMs
    
    return (
      cooldownPassed &&
      this.metrics.connectionUtilization > this.config.scaleUpThreshold &&
      this.supabaseClients.size < this.config.maxConnections
    )
  }

  /**
   * Check if pool should scale down
   */
  private shouldScaleDown(): boolean {
    const now = Date.now()
    const cooldownPassed = now - this.lastScalingTime > this.config.scaleCooldownMs
    
    return (
      cooldownPassed &&
      this.metrics.connectionUtilization < this.config.scaleDownThreshold &&
      this.supabaseClients.size > this.config.minConnections
    )
  }

  /**
   * Scale up connection pool
   */
  private async scaleUp(): Promise<void> {
    const targetSize = Math.min(
      this.supabaseClients.size + 2, // Add 2 connections
      this.config.maxConnections
    )
    
    logger.info('Scaling up connection pool', {
      currentSize: this.supabaseClients.size,
      targetSize
    })
    
    const newConnections: SupabaseClient[] = []
    
    try {
      for (let i = this.supabaseClients.size; i < targetSize; i++) {
        const client = await this.createSupabaseConnection()
        newConnections.push(client)
      }
      
      this.lastScalingTime = Date.now()
      this.updateMetrics()
      
      this.emit('pool:scaled_up', {
        oldSize: this.supabaseClients.size - newConnections.length,
        newSize: this.supabaseClients.size
      })
      
      logger.info('Connection pool scaled up successfully')
      
    } catch (error) {
      // Clean up failed connections
      for (const client of newConnections) {
        this.removeConnection(client)
      }
      
      logger.error('Failed to scale up connection pool', { error })
      throw error
    }
  }

  /**
   * Scale down connection pool
   */
  private async scaleDown(): Promise<void> {
    const targetSize = Math.max(
      this.supabaseClients.size - 2, // Remove 2 connections
      this.config.minConnections
    )
    
    logger.info('Scaling down connection pool', {
      currentSize: this.supabaseClients.size,
      targetSize
    })
    
    const connectionsToRemove: string[] = []
    
    // Find idle connections to remove
    const now = Date.now()
    for (const [connectionId, state] of this.connectionStates) {
      if (
        connectionsToRemove.length < this.supabaseClients.size - targetSize &&
        state.healthStatus === 'healthy' &&
        now - state.lastUsed.getTime() > this.config.idleTimeoutMs
      ) {
        connectionsToRemove.push(connectionId)
      }
    }
    
    // Remove connections
    for (const connectionId of connectionsToRemove) {
      await this.removeConnectionById(connectionId)
    }
    
    this.lastScalingTime = Date.now()
    this.updateMetrics()
    
    this.emit('pool:scaled_down', {
      oldSize: this.supabaseClients.size + connectionsToRemove.length,
      newSize: this.supabaseClients.size
    })
    
    logger.info('Connection pool scaled down successfully')
  }

  /**
   * Remove connection by ID
   */
  private async removeConnectionById(connectionId: string): Promise<void> {
    try {
      const client = this.supabaseClients.get(connectionId)
      if (client) {
        // Clean up client resources
        // Note: Supabase client doesn't have explicit close method
        this.supabaseClients.delete(connectionId)
        this.connectionStates.delete(connectionId)
      }
    } catch (error) {
      logger.error('Failed to remove connection', { error, connectionId })
    }
  }

  /**
   * Remove connection
   */
  private async removeConnection(client: SupabaseClient): Promise<void> {
    for (const [connectionId, conn] of this.supabaseClients) {
      if (conn === client) {
        await this.removeConnectionById(connectionId)
        break
      }
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks()
      await this.checkScalingNeeds()
    }, this.config.healthCheckIntervalMs)
  }

  /**
   * Perform health checks on all connections
   */
  private async performHealthChecks(): Promise<void> {
    const now = Date.now()
    
    for (const [connectionId, client] of this.supabaseClients) {
      const state = this.connectionStates.get(connectionId)
      if (!state) continue
      
      try {
        // Simple health check
        const { error } = await client.from('users').select('count').limit(1)
        
        if (error) {
          state.healthStatus = 'unhealthy'
          state.errorCount++
        } else {
          state.healthStatus = 'healthy'
          state.errorCount = 0
        }
        
        // Check connection age
        if (now - state.createdAt.getTime() > this.config.maxConnectionAgeMs) {
          state.healthStatus = 'degraded'
        }
        
      } catch (error) {
        state.healthStatus = 'unhealthy'
        state.errorCount++
        
        logger.warn('Connection health check failed', {
          connectionId,
          error,
          errorCount: state.errorCount
        })
      }
    }
    
    // Remove unhealthy connections with too many errors
    for (const [connectionId, state] of this.connectionStates) {
      if (state.errorCount >= 3) {
        await this.removeConnectionById(connectionId)
      }
    }
    
    this.metrics.lastHealthCheck = new Date()
    this.updateMetrics()
  }

  /**
   * Check if scaling is needed
   */
  private async checkScalingNeeds(): Promise<void> {
    try {
      if (this.shouldScaleUp()) {
        await this.scaleUp()
      } else if (this.shouldScaleDown()) {
        await this.scaleDown()
      }
    } catch (error) {
      logger.error('Failed to check scaling needs', { error })
    }
  }

  /**
   * Update connection metrics
   */
  private updateMetrics(): void {
    const total = this.supabaseClients.size
    const active = Array.from(this.connectionStates.values()).filter(
      state => state.healthStatus === 'healthy'
    ).length
    
    this.metrics.totalConnections = total
    this.metrics.activeConnections = active
    this.metrics.idleConnections = total - active
    this.metrics.connectionUtilization = total > 0 ? active / total : 0
    
    // Update circuit breaker metrics
    const dbCircuitBreaker = this.circuitBreakers.get('database')
    if (dbCircuitBreaker) {
      const cbMetrics = dbCircuitBreaker.getMetrics()
      this.metrics.circuitState = cbMetrics.state
      this.metrics.failureRate = cbMetrics.totalRequests > 0 
        ? cbMetrics.failedRequests / cbMetrics.totalRequests 
        : 0
      this.metrics.lastFailureTime = cbMetrics.lastFailureTime
    }
  }

  /**
   * Update running average
   */
  private updateAverage(current: number, newValue: number): number {
    return current === 0 ? newValue : current * 0.9 + newValue * 0.1
  }

  /**
   * Get current metrics
   */
  getMetrics(): AIConnectionMetrics {
    return { ...this.metrics }
  }

  /**
   * Get Redis connection
   */
  getRedisConnection(): Redis | null {
    const connections = Array.from(this.redisClients.values())
    return connections[0] || null
  }

  /**
   * Get circuit breaker for service
   */
  getCircuitBreaker(service: 'database' | 'ai_provider'): CircuitBreakerService | null {
    return this.circuitBreakers.get(service) || null
  }

  /**
   * Execute database operation with connection pooling
   */
  async executeWithConnection<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    const client = await this.getConnection()
    
    try {
      const startTime = Date.now()
      const result = await operation(client)
      
      // Update performance metrics
      this.metrics.averageResponseTime = this.updateAverage(
        this.metrics.averageResponseTime,
        Date.now() - startTime
      )
      
      return result
      
    } catch (error) {
      this.metrics.connectionErrors++
      throw error
    }
  }

  /**
   * Force close all connections (emergency)
   */
  async emergencyShutdown(): Promise<void> {
    try {
      logger.warn('Emergency shutdown initiated for AI Connection Manager')
      
      // Clear health check timer
      if (this.healthCheckTimer) {
        clearInterval(this.healthCheckTimer)
      }
      
      // Close all connections
      for (const connectionId of this.supabaseClients.keys()) {
        await this.removeConnectionById(connectionId)
      }
      
      // Close Redis connections
      for (const redis of this.redisClients.values()) {
        await redis.quit()
      }
      
      // Clear all data structures
      this.supabaseClients.clear()
      this.redisClients.clear()
      this.circuitBreakers.clear()
      this.connectionStates.clear()
      
      logger.info('Emergency shutdown completed')
      
    } catch (error) {
      logger.error('Emergency shutdown failed', { error })
    }
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean
    metrics: AIConnectionMetrics
    issues: string[]
  }> {
    const issues: string[] = []
    
    // Check connection pool health
    if (this.metrics.connectionUtilization > 0.9) {
      issues.push('Connection pool utilization too high')
    }
    
    if (this.metrics.connectionErrors > 10) {
      issues.push('High connection error rate')
    }
    
    // Check circuit breaker health
    if (this.metrics.circuitState === 'OPEN') {
      issues.push('Database circuit breaker is open')
    }
    
    return {
      healthy: issues.length === 0,
      metrics: this.getMetrics(),
      issues
    }
  }

  /**
   * Destroy connection manager
   */
  destroy(): void {
    this.emergencyShutdown()
    this.removeAllListeners()
  }
}

// ============================================================================
// CONNECTION MANAGER FACTORY
// ============================================================================

export class AIConnectionManagerFactory {
  private static instance: AIConnectionManager | null = null
  
  static getInstance(config?: Partial<AIConnectionPoolConfig>): AIConnectionManager {
    if (!AIConnectionManagerFactory.instance) {
      AIConnectionManagerFactory.instance = new AIConnectionManager(config)
    }
    return AIConnectionManagerFactory.instance
  }
  
  static resetInstance(): void {
    if (AIConnectionManagerFactory.instance) {
      AIConnectionManagerFactory.instance.destroy()
      AIConnectionManagerFactory.instance = null
    }
  }
}

// Export singleton instance
export const aiConnectionManager = AIConnectionManagerFactory.getInstance()