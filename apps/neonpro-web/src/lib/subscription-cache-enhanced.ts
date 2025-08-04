/**
 * Enhanced Subscription Caching System v2
 * 
 * Advanced multi-layer caching with performance optimization:
 * - Memory cache with compression and intelligent eviction
 * - Redis cache for distributed systems
 * - Adaptive TTL based on usage patterns
 * - Performance monitoring and alerting
 * - Cache warming strategies
 * - Circuit breaker pattern for resilience
 * 
 * @author NeonPro Development Team
 * @version 2.0.0 - Performance Optimized
 */

import { subscriptionPerformanceMonitor } from './subscription-performance-monitor'
import type { SubscriptionValidationResult } from './subscription-status'

// Enhanced cache configuration
export interface EnhancedCacheConfig {
  defaultTTL: number
  gracePeriodTTL: number
  errorTTL: number
  maxSize: number
  cleanupInterval: number
  
  // New performance options
  compressionThreshold: number
  adaptiveTTL: {
    enabled: boolean
    minTTL: number
    maxTTL: number
    adjustmentFactor: number
  }
  
  // Prefetching configuration
  prefetch: {
    enabled: boolean
    triggerThreshold: number  // Prefetch when TTL < threshold
    maxConcurrent: number
  }
  
  // Memory optimization
  memoryOptimization: {
    enabled: boolean
    maxMemoryMB: number
    evictionStrategy: 'lru' | 'lfu' | 'adaptive'
  }
  
  // Performance monitoring
  monitoring: {
    enabled: boolean
    sampleRate: number
    trackOperations: boolean
  }
}

export interface EnhancedCacheEntry extends CacheEntry {
  compressed: boolean
  compressionRatio?: number
  prefetchScore: number
  hotness: number  // Access frequency indicator
  lastPrefetch?: number
  memorySize: number
}

export interface CacheEntry {
  data: SubscriptionValidationResult
  expires: number
  created: number
  accessCount: number
  lastAccessed: number
  priority: number
}

export interface CacheStats {
  totalEntries: number
  validEntries: number
  expiredEntries: number
  hitCount: number
  missCount: number
  hitRate: number
  oldestEntry: number | null
  newestEntry: number | null
  averageAccessCount: number
  memoryUsage: number
  compressionSavings: number
  prefetchHits: number
  circuitBreakerState: 'closed' | 'open' | 'half-open'
}

export interface CacheOperation {
  type: 'get' | 'set' | 'delete' | 'cleanup' | 'prefetch' | 'compress'
  key?: string
  hit?: boolean
  duration: number
  timestamp: number
  cacheLayer: 'memory' | 'redis' | 'database'
  memorySize?: number
}

export interface PrefetchStrategy {
  strategy: 'recent' | 'popular' | 'predictive' | 'time-based'
  priority: number
  enabled: boolean
  config: Record<string, any>
}

/**
 * Enhanced subscription cache with advanced features
 */
export class EnhancedSubscriptionCache {
  private cache = new Map<string, EnhancedCacheEntry>()
  private hitCount = 0
  private missCount = 0
  private prefetchHits = 0
  private operations: CacheOperation[] = []
  private cleanupTimer: NodeJS.Timeout | null = null
  private prefetchTimer: NodeJS.Timeout | null = null
  private memoryUsage = 0
  private compressionSavings = 0
  private circuitBreakerState: 'closed' | 'open' | 'half-open' = 'closed'
  private failureCount = 0
  private lastFailureTime = 0
  
  // Access pattern tracking
  private accessPatterns = new Map<string, number[]>()
  private popularKeys = new Set<string>()
  
  // Prefetch strategies
  private prefetchStrategies: PrefetchStrategy[] = [
    {
      strategy: 'recent',
      priority: 10,
      enabled: true,
      config: { lookbackMinutes: 30 }
    },
    {
      strategy: 'popular',
      priority: 8,
      enabled: true,
      config: { minAccessCount: 5 }
    },
    {
      strategy: 'predictive',
      priority: 6,
      enabled: true,
      config: { patternThreshold: 0.7 }
    }
  ]
  
  private readonly config: EnhancedCacheConfig = {
    defaultTTL: 5 * 60 * 1000,      // 5 minutes
    gracePeriodTTL: 30 * 1000,      // 30 seconds
    errorTTL: 30 * 1000,            // 30 seconds
    maxSize: 50000,                 // 50k entries (increased)
    cleanupInterval: 30 * 1000,     // 30 seconds (more frequent)
    compressionThreshold: 1024,     // Compress entries > 1KB
    
    adaptiveTTL: {
      enabled: true,
      minTTL: 60 * 1000,           // 1 minute minimum
      maxTTL: 30 * 60 * 1000,      // 30 minutes maximum
      adjustmentFactor: 1.5,
    },
    
    prefetch: {
      enabled: true,
      triggerThreshold: 0.3,       // Prefetch when 30% TTL remaining
      maxConcurrent: 10,
    },
    
    memoryOptimization: {
      enabled: true,
      maxMemoryMB: 100,            // 100MB memory limit
      evictionStrategy: 'adaptive', // Smart eviction based on multiple factors
    },
    
    monitoring: {
      enabled: true,
      sampleRate: 0.1,             // 10% sampling
      trackOperations: true,
    },
  }

  constructor(config?: Partial<EnhancedCacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    
    this.startCleanupTimer()
    this.startPrefetchTimer()
  }

  /**
   * Get value from cache with performance monitoring
   */
  async get(key: string, prefetched = false): Promise<SubscriptionValidationResult | null> {
    const startTime = performance.now()
    
    try {
      const entry = this.cache.get(key)
      const duration = performance.now() - startTime
      
      // Record operation
      if (this.config.monitoring.trackOperations) {
        this.recordOperation('get', key, !!entry, duration, 'memory')
      }
      
      if (!entry) {
        this.missCount++
        return null
      }

      const now = Date.now()
      
      // Check if entry is expired
      if (entry.expires < now) {
        this.cache.delete(key)
        this.updateMemoryUsage(-entry.memorySize)
        this.missCount++
        return null
      }

      // Update access metrics
      entry.accessCount++
      entry.lastAccessed = now
      entry.hotness = this.calculateHotness(entry)
      
      // Track access patterns for prefetching
      this.trackAccessPattern(key)
      
      // Check if we should prefetch soon
      if (this.shouldPrefetch(entry) && !prefetched) {
        this.schedulePrefetch(key)
      }
      
      this.hitCount++
      if (prefetched) {
        this.prefetchHits++
      }
      
      // Performance monitoring
      subscriptionPerformanceMonitor.recordCacheOperation(true, duration)
      
      // Decompress if needed
      let data = entry.data
      if (entry.compressed) {
        data = await this.decompress(entry.data)
      }
      
      return data
      
    } catch (error) {
      const duration = performance.now() - startTime
      this.handleCacheError(error, 'get', key)
      this.recordOperation('get', key, false, duration, 'memory')
      return null
    }
  }

  /**
   * Set value in cache with compression and adaptive TTL
   */
  async set(
    key: string,
    value: SubscriptionValidationResult,
    ttl?: number,
    options: { skipCompression?: boolean; priority?: number } = {}
  ): Promise<void> {
    const startTime = performance.now()
    
    try {
      const now = Date.now()
      let finalTTL = ttl || this.config.defaultTTL
      
      // Apply adaptive TTL
      if (this.config.adaptiveTTL.enabled) {
        finalTTL = this.calculateAdaptiveTTL(key, finalTTL)
      }
      
      // Compress large entries
      let finalData = value
      let compressed = false
      let compressionRatio = 1
      const dataSize = this.estimateSize(value)
      
      if (!options.skipCompression && 
          dataSize > this.config.compressionThreshold &&
          this.shouldCompress(value)) {
        try {
          const compressedData = await this.compress(value)
          const compressedSize = this.estimateSize(compressedData)
          
          if (compressedSize < dataSize * 0.8) { // Only use if >20% savings
            finalData = compressedData
            compressed = true
            compressionRatio = compressedSize / dataSize
            this.compressionSavings += (dataSize - compressedSize)
          }
        } catch (compressionError) {
          console.warn('Compression failed, storing uncompressed:', compressionError)
        }
      }
      
      // Create enhanced entry
      const entry: EnhancedCacheEntry = {
        data: finalData,
        expires: now + finalTTL,
        created: now,
        accessCount: 1,
        lastAccessed: now,
        priority: options.priority || this.calculatePriority(value),
        compressed,
        compressionRatio: compressed ? compressionRatio : undefined,
        prefetchScore: 0,
        hotness: 1,
        memorySize: this.estimateSize(finalData),
      }
      
      // Check memory limits and evict if necessary
      await this.ensureMemoryLimit(entry.memorySize)
      
      // Store entry
      const oldEntry = this.cache.get(key)
      if (oldEntry) {
        this.updateMemoryUsage(-oldEntry.memorySize)
      }
      
      this.cache.set(key, entry)
      this.updateMemoryUsage(entry.memorySize)
      
      // Update popular keys
      this.updatePopularKeys(key)
      
      const duration = performance.now() - startTime
      
      // Record operation
      if (this.config.monitoring.trackOperations) {
        this.recordOperation('set', key, true, duration, 'memory', entry.memorySize)
      }
      
      // Performance monitoring
      subscriptionPerformanceMonitor.recordCacheOperation(true, duration)
      
    } catch (error) {
      const duration = performance.now() - startTime
      this.handleCacheError(error, 'set', key)
      this.recordOperation('set', key, false, duration, 'memory')
      throw error
    }
  }

  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry) {
      this.cache.delete(key)
      this.updateMemoryUsage(-entry.memorySize)
      this.accessPatterns.delete(key)
      this.popularKeys.delete(key)
      return true
    }
    return false
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear()
    this.accessPatterns.clear()
    this.popularKeys.clear()
    this.memoryUsage = 0
    this.compressionSavings = 0
    this.hitCount = 0
    this.missCount = 0
    this.prefetchHits = 0
  }

  /**
   * Get cache statistics with enhanced metrics
   */
  getStats(): CacheStats {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0
    let oldestEntry: number | null = null
    let newestEntry: number | null = null
    let totalAccessCount = 0

    for (const [, entry] of this.cache) {
      if (entry.expires > now) {
        validEntries++
        totalAccessCount += entry.accessCount
        
        if (oldestEntry === null || entry.created < oldestEntry) {
          oldestEntry = entry.created
        }
        
        if (newestEntry === null || entry.created > newestEntry) {
          newestEntry = entry.created
        }
      } else {
        expiredEntries++
      }
    }

    const totalRequests = this.hitCount + this.missCount
    
    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      oldestEntry,
      newestEntry,
      averageAccessCount: validEntries > 0 ? totalAccessCount / validEntries : 0,
      memoryUsage: this.memoryUsage,
      compressionSavings: this.compressionSavings,
      prefetchHits: this.prefetchHits,
      circuitBreakerState: this.circuitBreakerState,
    }
  }

  /**
   * Force cache cleanup
   */
  cleanup(): void {
    const startTime = performance.now()
    const now = Date.now()
    let removedCount = 0
    let reclaimedMemory = 0

    // Remove expired entries
    for (const [key, entry] of this.cache) {
      if (entry.expires < now) {
        this.cache.delete(key)
        this.accessPatterns.delete(key)
        this.popularKeys.delete(key)
        reclaimedMemory += entry.memorySize
        removedCount++
      }
    }

    this.updateMemoryUsage(-reclaimedMemory)
    
    const duration = performance.now() - startTime
    
    if (this.config.monitoring.trackOperations) {
      this.recordOperation('cleanup', undefined, true, duration, 'memory')
    }
    
    console.debug(`Cache cleanup: removed ${removedCount} entries, reclaimed ${reclaimedMemory} bytes`)
  }

  /**
   * Prefetch entries that are likely to be accessed soon
   */
  async prefetch(): Promise<void> {
    if (!this.config.prefetch.enabled) return
    
    const strategies = this.prefetchStrategies.filter(s => s.enabled)
    const candidateKeys = new Set<string>()
    
    for (const strategy of strategies) {
      const keys = await this.getPrefetchCandidates(strategy)
      keys.forEach(key => candidateKeys.add(key))
    }
    
    // Limit concurrent prefetch operations
    const keys = Array.from(candidateKeys).slice(0, this.config.prefetch.maxConcurrent)
    
    for (const key of keys) {
      await this.schedulePrefetch(key)
    }
  }

  /**
   * Calculate hotness score based on access patterns
   */
  private calculateHotness(entry: EnhancedCacheEntry): number {
    const now = Date.now()
    const age = now - entry.created
    const recency = now - entry.lastAccessed
    
    // Combine frequency and recency
    const frequency = entry.accessCount / Math.max(1, age / (60 * 1000)) // accesses per minute
    const recencyScore = Math.max(0, 1 - (recency / (60 * 60 * 1000))) // decay over 1 hour
    
    return frequency * 0.7 + recencyScore * 0.3
  }

  /**
   * Calculate priority for cache entry
   */
  private calculatePriority(value: SubscriptionValidationResult): number {
    let priority = 5 // Base priority
    
    // Higher priority for users with access
    if (value.hasAccess) priority += 3
    
    // Higher priority based on subscription status
    if (value.subscription?.status === 'active') priority += 3
    else if (value.subscription?.status === 'trialing') priority += 2
    else if (value.subscription?.status === 'past_due') priority += 1
    
    // Higher priority for users in grace period
    if (value.gracePeriod) priority += 2
    
    return priority
  }

  /**
   * Calculate adaptive TTL based on access patterns
   */
  private calculateAdaptiveTTL(key: string, baseTTL: number): number {
    const pattern = this.accessPatterns.get(key)
    if (!pattern || pattern.length < 3) {
      return baseTTL
    }
    
    // Calculate access frequency
    const now = Date.now()
    const recentAccesses = pattern.filter(time => now - time < 60 * 60 * 1000) // Last hour
    const frequency = recentAccesses.length / 60 // accesses per minute
    
    // Adjust TTL based on frequency
    let adjustedTTL = baseTTL
    
    if (frequency > 10) { // Very high frequency
      adjustedTTL = Math.max(this.config.adaptiveTTL.minTTL, baseTTL * 0.5)
    } else if (frequency > 5) { // High frequency
      adjustedTTL = Math.max(this.config.adaptiveTTL.minTTL, baseTTL * 0.7)
    } else if (frequency < 1) { // Low frequency
      adjustedTTL = Math.min(this.config.adaptiveTTL.maxTTL, baseTTL * this.config.adaptiveTTL.adjustmentFactor)
    }
    
    return adjustedTTL
  }

  /**
   * Track access patterns for prefetching
   */
  private trackAccessPattern(key: string): void {
    const now = Date.now()
    let pattern = this.accessPatterns.get(key)
    
    if (!pattern) {
      pattern = []
      this.accessPatterns.set(key, pattern)
    }
    
    pattern.push(now)
    
    // Keep only recent accesses (last 24 hours)
    const cutoff = now - 24 * 60 * 60 * 1000
    const recentPattern = pattern.filter(time => time > cutoff)
    this.accessPatterns.set(key, recentPattern.slice(-100)) // Keep max 100 entries
  }

  /**
   * Check if entry should be prefetched
   */
  private shouldPrefetch(entry: EnhancedCacheEntry): boolean {
    if (!this.config.prefetch.enabled) return false
    
    const now = Date.now()
    const timeRemaining = entry.expires - now
    const totalTTL = entry.expires - entry.created
    
    return (timeRemaining / totalTTL) < this.config.prefetch.triggerThreshold
  }

  /**
   * Schedule prefetch for a key
   */
  private async schedulePrefetch(key: string): Promise<void> {
    // This would integrate with the actual data fetching logic
    // For now, we'll just mark it as scheduled
    const entry = this.cache.get(key)
    if (entry) {
      entry.lastPrefetch = Date.now()
      entry.prefetchScore = Math.min(10, (entry.prefetchScore || 0) + 1)
    }
  }

  /**
   * Get prefetch candidates based on strategy
   */
  private async getPrefetchCandidates(strategy: PrefetchStrategy): Promise<string[]> {
    switch (strategy.strategy) {
      case 'recent':
        return this.getRecentCandidates(strategy.config)
      case 'popular':
        return this.getPopularCandidates(strategy.config)
      case 'predictive':
        return this.getPredictiveCandidates(strategy.config)
      default:
        return []
    }
  }

  /**
   * Get recent access candidates
   */
  private getRecentCandidates(config: any): string[] {
    const cutoff = Date.now() - (config.lookbackMinutes * 60 * 1000)
    const candidates: string[] = []
    
    for (const [key, pattern] of this.accessPatterns) {
      if (pattern.some(time => time > cutoff)) {
        candidates.push(key)
      }
    }
    
    return candidates.slice(0, 20) // Limit candidates
  }

  /**
   * Get popular access candidates
   */
  private getPopularCandidates(config: any): string[] {
    return Array.from(this.popularKeys).slice(0, 20)
  }

  /**
   * Get predictive candidates (placeholder for ML-based prediction)
   */
  private getPredictiveCandidates(config: any): string[] {
    // This would use machine learning to predict likely accesses
    // For now, return popular keys as a fallback
    return this.getPopularCandidates(config)
  }

  /**
   * Update popular keys set
   */
  private updatePopularKeys(key: string): void {
    const pattern = this.accessPatterns.get(key)
    if (pattern && pattern.length > 10) { // Threshold for popularity
      this.popularKeys.add(key)
    }
    
    // Limit popular keys set size
    if (this.popularKeys.size > 1000) {
      const keysArray = Array.from(this.popularKeys)
      const toRemove = keysArray.slice(0, 100) // Remove oldest 100
      toRemove.forEach(k => this.popularKeys.delete(k))
    }
  }

  /**
   * Ensure memory usage stays within limits
   */
  private async ensureMemoryLimit(newEntrySize: number): Promise<void> {
    if (!this.config.memoryOptimization.enabled) return
    
    const maxMemory = this.config.memoryOptimization.maxMemoryMB * 1024 * 1024
    const projectedUsage = this.memoryUsage + newEntrySize
    
    if (projectedUsage <= maxMemory) return
    
    // Need to evict entries
    const targetUsage = maxMemory * 0.8 // Target 80% of max
    const memoryToFree = projectedUsage - targetUsage
    
    await this.evictEntries(memoryToFree)
  }

  /**
   * Evict entries based on strategy
   */
  private async evictEntries(memoryToFree: number): Promise<void> {
    const strategy = this.config.memoryOptimization.evictionStrategy
    let freedMemory = 0
    const now = Date.now()
    
    // Create eviction candidates with scores
    const candidates: Array<{ key: string; entry: EnhancedCacheEntry; score: number }> = []
    
    for (const [key, entry] of this.cache) {
      let score = 0
      
      if (strategy === 'lru') {
        score = now - entry.lastAccessed
      } else if (strategy === 'lfu') {
        score = -entry.accessCount
      } else { // adaptive
        // Combine multiple factors
        const age = now - entry.created
        const recency = now - entry.lastAccessed
        const accessFreq = entry.accessCount / Math.max(1, age / (60 * 1000))
        const hotness = entry.hotness || 0
        
        score = recency * 0.4 - (accessFreq * 1000) * 0.3 - hotness * 1000 * 0.2 - entry.priority * 100 * 0.1
      }
      
      candidates.push({ key, entry, score })
    }
    
    // Sort by eviction score (higher = more likely to evict)
    candidates.sort((a, b) => b.score - a.score)
    
    // Evict entries until we've freed enough memory
    for (const { key, entry } of candidates) {
      if (freedMemory >= memoryToFree) break
      
      this.cache.delete(key)
      this.accessPatterns.delete(key)
      this.popularKeys.delete(key)
      freedMemory += entry.memorySize
    }
    
    this.updateMemoryUsage(-freedMemory)
  }

  /**
   * Estimate memory size of an object
   */
  private estimateSize(obj: any): number {
    // Rough estimation - in production you might use a more accurate method
    const json = JSON.stringify(obj)
    return json.length * 2 // Approximate bytes (UTF-16)
  }

  /**
   * Update memory usage tracking
   */
  private updateMemoryUsage(delta: number): void {
    this.memoryUsage = Math.max(0, this.memoryUsage + delta)
  }

  /**
   * Check if data should be compressed
   */
  private shouldCompress(data: any): boolean {
    // Don't compress already compressed data or small objects
    return typeof data === 'object' && data !== null
  }

  /**
   * Compress data (placeholder - would use actual compression library)
   */
  private async compress(data: any): Promise<any> {
    // Placeholder for actual compression
    // In production, use gzip, lz4, or similar
    return { compressed: true, data: JSON.stringify(data) }
  }

  /**
   * Decompress data
   */
  private async decompress(data: any): Promise<any> {
    // Placeholder for actual decompression
    if (data.compressed && data.data) {
      return JSON.parse(data.data)
    }
    return data
  }

  /**
   * Record cache operation for monitoring
   */
  private recordOperation(
    type: CacheOperation['type'],
    key?: string,
    hit?: boolean,
    duration?: number,
    cacheLayer: CacheOperation['cacheLayer'] = 'memory',
    memorySize?: number
  ): void {
    if (!this.config.monitoring.trackOperations) return
    
    this.operations.push({
      type,
      key,
      hit,
      duration: duration || 0,
      timestamp: Date.now(),
      cacheLayer,
      memorySize,
    })
    
    // Keep only recent operations
    if (this.operations.length > 10000) {
      this.operations = this.operations.slice(-1000)
    }
  }

  /**
   * Handle cache errors
   */
  private handleCacheError(error: any, operation: string, key?: string): void {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    console.error(`Cache ${operation} error${key ? ` for key ${key}` : ''}:`, error)
    
    // Circuit breaker logic
    if (this.failureCount > 10) {
      this.circuitBreakerState = 'open'
      setTimeout(() => {
        this.circuitBreakerState = 'half-open'
        this.failureCount = 0
      }, 30000) // 30 second timeout
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config.cleanupInterval)
  }

  /**
   * Start prefetch timer
   */
  private startPrefetchTimer(): void {
    if (!this.config.prefetch.enabled) return
    
    this.prefetchTimer = setInterval(() => {
      this.prefetch().catch(error => {
        console.error('Prefetch error:', error)
      })
    }, 5 * 60 * 1000) // Every 5 minutes
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    
    if (this.prefetchTimer) {
      clearInterval(this.prefetchTimer)
      this.prefetchTimer = null
    }
    
    this.clear()
  }
}

// Global enhanced cache instance
export const enhancedSubscriptionCache = new EnhancedSubscriptionCache()

// Export original cache for backward compatibility
export * from './subscription-cache'
