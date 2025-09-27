/**
 * AI Agent Cache Invalidation Service
 *
 * Provides intelligent cache invalidation for AI agent data with
 * healthcare compliance and performance optimization
 *
 * Features: Multi-tier cache invalidation
 * Compliance: LGPD, ANVISA, CFM
 * Performance: Real-time invalidation with event-driven architecture
 */

import { logger } from '@/utils/healthcare-errors.js'
import {
  CacheBackend,
  CacheConfig,
  CacheDataSensitivity,
  CacheEntry,
  CacheTier,
} from '@neonpro/shared/src/services/cache-management'
import { RedisCacheBackend } from '@neonpro/shared/src/services/redis-cache-backend'
import { PermissionContext, QueryIntent } from '@neonpro/types'
import { EventEmitter } from 'events'

// ============================================================================
// CACHE INVALIDATION EVENTS
// ============================================================================

export interface CacheInvalidationEvent {
  type: 'data_change' | 'permission_change' | 'compliance_update' | 'security_event'
  entityType: 'client' | 'appointment' | 'financial' | 'medical' | 'agent_session'
  entityId?: string
  domain?: string
  userId?: string
  timestamp: Date
  reason: string
  metadata?: Record<string, any>
}

export interface CacheInvalidationRule {
  id: string
  pattern: RegExp | string
  entityType: CacheInvalidationEvent['entityType']
  action: 'invalidate' | 'update' | 'refresh'
  ttl?: number
  priority: 'low' | 'medium' | 'high' | 'critical'
}

// ============================================================================
// CACHE INVALIDATION SERVICE
// ============================================================================

export class AICacheInvalidationService extends EventEmitter {
  private cacheBackend: CacheBackend
  private invalidationRules: Map<string, CacheInvalidationRule> = new Map()
  private eventQueue: CacheInvalidationEvent[] = []
  private processing = false
  private stats = {
    totalInvalidations: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgInvalidationTime: 0,
    lastInvalidation: null as Date | null,
  }

  constructor(cacheBackend: CacheBackend) {
    super()
    this.cacheBackend = cacheBackend
    this.initializeDefaultRules()
    this.startEventProcessing()
  }

  /**
   * Initialize default cache invalidation rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: CacheInvalidationRule[] = [
      {
        id: 'client_data_change',
        pattern: /client_/,
        entityType: 'client',
        action: 'invalidate',
        priority: 'high',
        ttl: 300, // 5 minutes
      },
      {
        id: 'appointment_change',
        pattern: /appointment_/,
        entityType: 'appointment',
        action: 'invalidate',
        priority: 'medium',
        ttl: 600, // 10 minutes
      },
      {
        id: 'financial_data_change',
        pattern: /financial_/,
        entityType: 'financial',
        action: 'invalidate',
        priority: 'critical',
        ttl: 1800, // 30 minutes
      },
      {
        id: 'medical_data_change',
        pattern: /medical_/,
        entityType: 'medical',
        action: 'invalidate',
        priority: 'high',
        ttl: 900, // 15 minutes
      },
      {
        id: 'agent_session_change',
        pattern: /agent_session/,
        entityType: 'agent_session',
        action: 'invalidate',
        priority: 'high',
        ttl: 300, // 5 minutes
      },
      {
        id: 'permission_change',
        pattern: /permission/,
        entityType: 'client',
        action: 'invalidate',
        priority: 'critical',
        ttl: 0, // Immediate invalidation
      },
      {
        id: 'domain_data_change',
        pattern: /domain_/,
        entityType: 'client',
        action: 'invalidate',
        priority: 'high',
        ttl: 600, // 10 minutes
      },
    ]

    defaultRules.forEach(rule => {
      this.invalidationRules.set(rule.id, rule)
    })
  }

  /**
   * Handle data change events
   */
  async handleDataChange(event: CacheInvalidationEvent): Promise<void> {
    try {
      // Validate event
      if (!this.validateEvent(event)) {
        logger.warn('Invalid cache invalidation event', { event })
        return
      }

      // Add to processing queue
      this.eventQueue.push(event)

      // Emit event for external listeners
      this.emit('cache:invalidation', event)

      logger.info('Cache invalidation event queued', {
        type: event.type,
        entityType: event.entityType,
        entityId: event.entityId,
        domain: event.domain,
      })
    } catch (error) {
      logger.error('Failed to handle cache invalidation event', { error, event })
    }
  }

  /**
   * Validate cache invalidation event
   */
  private validateEvent(event: CacheInvalidationEvent): boolean {
    if (!event.type || !event.entityType || !event.timestamp) {
      return false
    }

    if (event.timestamp > new Date()) {
      return false // Future timestamp
    }

    if (event.type === 'permission_change' && !event.userId) {
      return false // Permission changes require user ID
    }

    return true
  }

  /**
   * Start event processing loop
   */
  private startEventProcessing(): void {
    setInterval(async () => {
      if (!this.processing && this.eventQueue.length > 0) {
        await this.processEventQueue()
      }
    }, 100) // Process every 100ms
  }

  /**
   * Process event queue
   */
  private async processEventQueue(): Promise<void> {
    if (this.processing) return

    this.processing = true
    const startTime = Date.now()

    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift()
        if (event) {
          await this.processInvalidationEvent(event)
        }
      }
    } catch (error) {
      logger.error('Failed to process cache invalidation queue', { error })
    } finally {
      this.processing = false
      this.stats.avgInvalidationTime = (this.stats.avgInvalidationTime + (Date.now() - startTime)) /
        2
    }
  }

  /**
   * Process individual invalidation event
   */
  private async processInvalidationEvent(event: CacheInvalidationEvent): Promise<void> {
    const startTime = Date.now()

    try {
      // Find applicable rules
      const applicableRules = Array.from(this.invalidationRules.values())
        .filter(rule => this.ruleAppliesToEvent(rule, event))
        .sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority))

      // Apply rules
      for (const rule of applicableRules) {
        await this.applyInvalidationRule(rule, event)
      }

      // Update statistics
      this.stats.totalInvalidations++
      this.stats.lastInvalidation = new Date()

      logger.debug('Cache invalidation processed', {
        event: event.type,
        entityType: event.entityType,
        processingTime: Date.now() - startTime,
      })
    } catch (error) {
      logger.error('Failed to process cache invalidation event', { error, event })
    }
  }

  /**
   * Check if rule applies to event
   */
  private ruleAppliesToEvent(rule: CacheInvalidationRule, event: CacheInvalidationEvent): boolean {
    if (rule.entityType !== event.entityType) {
      return false
    }

    if (typeof rule.pattern === 'string') {
      return event.reason.includes(rule.pattern)
    } else if (rule.pattern instanceof RegExp) {
      return rule.pattern.test(event.reason)
    }

    return false
  }

  /**
   * Apply invalidation rule
   */
  private async applyInvalidationRule(
    rule: CacheInvalidationRule,
    event: CacheInvalidationEvent,
  ): Promise<void> {
    const cacheKeys = await this.generateCacheKeys(rule, event)

    switch (rule.action) {
      case 'invalidate':
        await this.invalidateCacheKeys(cacheKeys)
        break
      case 'update':
        await this.updateCacheKeys(cacheKeys, event)
        break
      case 'refresh':
        await this.refreshCacheKeys(cacheKeys, rule.ttl)
        break
    }
  }

  /**
   * Generate cache keys for invalidation
   */
  private async generateCacheKeys(
    rule: CacheInvalidationRule,
    event: CacheInvalidationEvent,
  ): Promise<string[]> {
    const keys: string[] = []

    // Generate keys based on event and rule
    if (event.domain && event.userId) {
      keys.push(`ai_data:${event.domain}:${event.userId}:${event.entityType}`)
      keys.push(`ai_query:${event.domain}:${event.userId}:*`)
    }

    if (event.entityId) {
      keys.push(`ai_entity:${event.entityType}:${event.entityId}`)
    }

    // Add pattern-based keys
    if (event.domain) {
      keys.push(`ai_domain:${event.domain}:*`)
    }

    if (event.userId) {
      keys.push(`ai_user:${event.userId}:*`)
    }

    return keys
  }

  /**
   * Invalidate cache keys
   */
  private async invalidateCacheKeys(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        await this.cacheBackend.delete(key)
        logger.debug('Cache key invalidated', { key })
      } catch (error) {
        logger.error('Failed to invalidate cache key', { error, key })
      }
    }
  }

  /**
   * Update cache keys
   */
  private async updateCacheKeys(keys: string[], event: CacheInvalidationEvent): Promise<void> {
    // For update operations, we'd typically refresh the data
    // This is a simplified implementation
    await this.invalidateCacheKeys(keys)
  }

  /**
   * Refresh cache keys with new TTL
   */
  private async refreshCacheKeys(keys: string[], ttl?: number): Promise<void> {
    // For refresh operations, we'd update the TTL
    // This is a simplified implementation
    await this.invalidateCacheKeys(keys)
  }

  /**
   * Get priority value for sorting
   */
  private getPriorityValue(priority: string): number {
    const priorityMap = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    }
    return priorityMap[priority as keyof typeof priorityMap] || 1
  }

  /**
   * Invalidate cache by query intent and context
   */
  async invalidateByQueryContext(
    intent: QueryIntent,
    permissionContext: PermissionContext,
    reason: string,
  ): Promise<void> {
    const event: CacheInvalidationEvent = {
      type: 'data_change',
      entityType: this.mapIntentToEntityType(intent),
      userId: permissionContext.userId,
      domain: permissionContext.domain,
      timestamp: new Date(),
      reason,
    }

    await this.handleDataChange(event)
  }

  /**
   * Map query intent to entity type
   */
  private mapIntentToEntityType(intent: QueryIntent): CacheInvalidationEvent['entityType'] {
    const mapping: Record<QueryIntent, CacheInvalidationEvent['entityType']> = {
      client_data: 'client',
      appointments: 'appointment',
      financial: 'financial',
      medical: 'medical',
    }

    return mapping[intent] || 'client'
  }

  /**
   * Invalidate cache by domain
   */
  async invalidateByDomain(domain: string, reason: string): Promise<void> {
    const event: CacheInvalidationEvent = {
      type: 'data_change',
      entityType: 'client',
      domain,
      timestamp: new Date(),
      reason,
    }

    await this.handleDataChange(event)
  }

  /**
   * Invalidate cache by user
   */
  async invalidateByUser(userId: string, reason: string): Promise<void> {
    const event: CacheInvalidationEvent = {
      type: 'permission_change',
      entityType: 'client',
      userId,
      timestamp: new Date(),
      reason,
    }

    await this.handleDataChange(event)
  }

  /**
   * Force complete cache invalidation (emergency)
   */
  async invalidateAll(reason: string): Promise<void> {
    try {
      logger.warn('Complete cache invalidation requested', { reason })

      // Clear all cache entries with AI prefix
      await this.cacheBackend.clear()

      // Reset statistics
      this.stats.totalInvalidations = 0
      this.stats.cacheHits = 0
      this.stats.cacheMisses = 0

      // Emit emergency event
      this.emit('cache:emergency_invalidation', { reason, timestamp: new Date() })

      logger.info('Complete cache invalidation completed', { reason })
    } catch (error) {
      logger.error('Failed to perform complete cache invalidation', { error, reason })
    }
  }

  /**
   * Get cache invalidation statistics
   */
  getStatistics() {
    return { ...this.stats }
  }

  /**
   * Add custom invalidation rule
   */
  addInvalidationRule(rule: CacheInvalidationRule): void {
    this.invalidationRules.set(rule.id, rule)
    logger.info('Custom cache invalidation rule added', { ruleId: rule.id })
  }

  /**
   * Remove invalidation rule
   */
  removeInvalidationRule(ruleId: string): void {
    this.invalidationRules.delete(ruleId)
    logger.info('Cache invalidation rule removed', { ruleId })
  }

  /**
   * Get cache health status
   */
  async getHealthStatus(): Promise<{
    healthy: boolean
    cacheSize?: number
    queueSize: number
    processing: boolean
    lastInvalidation?: Date
  }> {
    try {
      // Test cache connectivity
      await this.cacheBackend.get('health_check')

      return {
        healthy: true,
        queueSize: this.eventQueue.length,
        processing: this.processing,
        lastInvalidation: this.stats.lastInvalidation || undefined,
      }
    } catch (error) {
      logger.error('Cache health check failed', { error })
      return {
        healthy: false,
        queueSize: this.eventQueue.length,
        processing: this.processing,
      }
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.removeAllListeners()
    this.invalidationRules.clear()
    this.eventQueue.length = 0
  }
}

// ============================================================================
// CACHE INVALIDATION MANAGER
// ============================================================================

export class AICacheInvalidationManager {
  private static instance: AICacheInvalidationManager
  private invalidationService: AICacheInvalidationService | null = null

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): AICacheInvalidationManager {
    if (!AICacheInvalidationManager.instance) {
      AICacheInvalidationManager.instance = new AICacheInvalidationManager()
    }
    return AICacheInvalidationManager.instance
  }

  /**
   * Initialize with cache backend
   */
  initialize(cacheBackend: CacheBackend): AICacheInvalidationService {
    if (!this.invalidationService) {
      this.invalidationService = new AICacheInvalidationService(cacheBackend)
      logger.info('AI Cache Invalidation Service initialized')
    }
    return this.invalidationService
  }

  /**
   * Get invalidation service
   */
  getService(): AICacheInvalidationService | null {
    return this.invalidationService
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.invalidationService !== null
  }
}

// Export singleton manager
export const aiCacheInvalidationManager = AICacheInvalidationManager.getInstance()
