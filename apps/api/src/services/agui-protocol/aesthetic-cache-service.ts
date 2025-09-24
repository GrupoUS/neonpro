/**
 * Cache Service for Aesthetic Clinics
 *
 * Provides intelligent caching with compression, TTL management,
 * and invalidation strategies specifically for aesthetic clinic data.
 */

export interface AestheticCacheConfig {
  redisUrl: string
  defaultTtl: number
  compressionEnabled: boolean
  enablePrefetch: boolean
  maxCacheSize: number
  evictionPolicy: 'lru' | 'lfu' | 'fifo'
  enableAnalytics: boolean
}

export interface CacheEntry<T = any> {
  key: string
  value: T
  createdAt: string
  expiresAt: string
  accessCount: number
  lastAccessed: string
  compressionRatio?: number
  metadata?: Record<string, any>
}

export interface CacheStats {
  totalKeys: number
  totalSize: number
  hitRate: number
  missRate: number
  avgResponseTime: number
  compressionRatio: number
  evictionCount: number
  prefetchCount: number
  topAccessed: Array<{
    key: string
    accessCount: number
    lastAccessed: string
  }>
}

export interface CachePrefetchRule {
  pattern: string
  ttl: number
  priority: 'low' | 'medium' | 'high'
  condition: (data: any) => boolean
  prefetchFn: (key: string) => Promise<any>
}

export class AestheticCacheService {
  private config: AestheticCacheConfig
  private cache: Map<string, CacheEntry> = new Map()
  private stats: CacheStats
  private prefetchRules: Map<string, CachePrefetchRule> = new Map()
  private analytics: Map<string, any[]> = new Map()

  constructor(config: AestheticCacheConfig) {
    this.config = config
    this.stats = this.initializeStats()
    this.initializePrefetchRules()
    this.startCleanupTimer()
  }

  private initializeStats(): CacheStats {
    return {
      totalKeys: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      avgResponseTime: 0,
      compressionRatio: 0,
      evictionCount: 0,
      prefetchCount: 0,
      topAccessed: [],
    }
  }

  private initializePrefetchRules(): void {
    // Treatment catalog prefetch rule
    this.prefetchRules.set('treatment_catalog', {
      pattern: 'treatment_catalog_*',
      ttl: 300, // 5 minutes
      priority: 'high',
      condition: (data) => data.category && data.skinType,
      prefetchFn: async (_key) => {
        // Mock prefetch logic
        return { prefetched: true, timestamp: Date.now() }
      },
    })

    // Client profile prefetch rule
    this.prefetchRules.set('client_profile', {
      pattern: 'client_profile_*',
      ttl: 600, // 10 minutes
      priority: 'medium',
      condition: (data) => data.clientId && data.lastActivity,
      prefetchFn: async (_key) => {
        // Mock prefetch logic
        return { prefetched: true, timestamp: Date.now() }
      },
    })

    // Appointment availability prefetch rule
    this.prefetchRules.set('appointment_availability', {
      pattern: 'availability_*',
      ttl: 60, // 1 minute
      priority: 'high',
      condition: (data) => data.location && data.date,
      prefetchFn: async (_key) => {
        // Mock prefetch logic
        return { prefetched: true, timestamp: Date.now() }
      },
    })

    // Treatment pricing prefetch rule
    this.prefetchRules.set('treatment_pricing', {
      pattern: 'pricing_*',
      ttl: 1800, // 30 minutes
      priority: 'low',
      condition: (data) => data.treatmentId,
      prefetchFn: async (_key) => {
        // Mock prefetch logic
        return { prefetched: true, timestamp: Date.now() }
      },
    })
  }

  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now()

    // Check if entry exists and is not expired
    const entry = this.cache.get(key)
    if (!entry) {
      this.recordMiss(startTime)
      return null
    }

    // Check expiration
    if (new Date(entry.expiresAt) < new Date()) {
      this.cache.delete(key)
      this.stats.totalKeys--
      this.recordMiss(startTime)
      return null
    }

    // Update access stats
    entry.accessCount++
    entry.lastAccessed = new Date().toISOString()
    this.cache.set(key, entry)

    // Decompress if needed
    let value = entry.value
    if (entry.compressionRatio && this.config.compressionEnabled) {
      value = await this.decompress(value)
    }

    this.recordHit(startTime)

    // Trigger prefetch if applicable
    if (this.config.enablePrefetch) {
      this.triggerPrefetch(key, value)
    }

    return value
  }

  async set<T = any>(
    key: string,
    value: T,
    ttl: number = this.config.defaultTtl,
    metadata?: Record<string, any>,
  ): Promise<void> {
    // Check cache size limit
    if (this.cache.size >= this.config.maxCacheSize) {
      this.evictEntries()
    }

    // Compress if enabled
    let compressedValue = value
    let compressionRatio = 0

    if (this.config.compressionEnabled) {
      const compressionResult = await this.compress(value)
      compressedValue = compressionResult.value
      compressionRatio = compressionResult.ratio
    }

    const entry: CacheEntry<T> = {
      key,
      value: compressedValue,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttl * 1000).toISOString(),
      accessCount: 0,
      lastAccessed: new Date().toISOString(),
      compressionRatio,
      metadata,
    }

    this.cache.set(key, entry)
    this.stats.totalKeys = this.cache.size
    this.updateTotalSize()

    // Log analytics
    this.logAnalytics('set', { key, ttl, compressionRatio, metadata })
  }

  async delete(key: string): Promise<boolean> {
    const deleted = this.cache.delete(key)
    if (deleted) {
      this.stats.totalKeys = this.cache.size
      this.updateTotalSize()
      this.logAnalytics('delete', { key })
    }
    return deleted
  }

  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    // Check expiration
    if (new Date(entry.expiresAt) < new Date()) {
      this.cache.delete(key)
      this.stats.totalKeys--
      return false
    }

    return true
  }

  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key)
    if (!entry) {
      return -1
    }

    const expiresAt = new Date(entry.expiresAt)
    const now = new Date()

    if (expiresAt <= now) {
      return -2 // Expired
    }

    return Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
  }

  async expire(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }

    entry.expiresAt = new Date().toISOString()
    this.cache.set(key, entry)
    return true
  }

  async keys(pattern?: string): Promise<string[]> {
    let keys = Array.from(this.cache.keys())

    if (pattern) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'))
      keys = keys.filter((key) => regex.test(key))
    }

    return keys
  }

  async clear(): Promise<void> {
    this.cache.clear()
    this.stats.totalKeys = 0
    this.stats.totalSize = 0
    this.logAnalytics('clear', {})
  }

  // Batch operations
  async mget<T = any>(keys: string[]): Promise<Map<string, T | null>> {
    const results = new Map<string, T | null>()

    for (const key of keys) {
      results.set(key, await this.get<T>(key))
    }

    return results
  }

  async mset(
    entries: Array<{ key: string; value: any; ttl?: number; metadata?: Record<string, any> }>,
  ): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttl, entry.metadata)
    }
  }

  async mdelete(keys: string[]): Promise<number> {
    let deletedCount = 0

    for (const key of keys) {
      if (await this.delete(key)) {
        deletedCount++
      }
    }

    return deletedCount
  }

  // Intelligent caching methods
  async getOrSet<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.config.defaultTtl,
    metadata?: Record<string, any>,
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch and cache the value
    const value = await fetchFn()
    await this.set(key, value, ttl, metadata)

    return value
  }

  async remember<T = any>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = this.config.defaultTtl,
    metadata?: Record<string, any>,
  ): Promise<T> {
    return await this.getOrSet(key, fetchFn, ttl, metadata)
  }

  // Cache warming and prefetching
  async warmCache(keys: string[]): Promise<void> {
    for (const key of keys) {
      const rule = this.findPrefetchRule(key)
      if (rule) {
        try {
          const value = await rule.prefetchFn(key)
          await this.set(key, value, rule.ttl)
          this.stats.prefetchCount++
        } catch {
          console.error(`Failed to warm cache for key ${key}:`, error)
        }
      }
    }
  }

  async prefetchRelated(key: string): Promise<void> {
    const patterns = this.generateRelatedPatterns(key)

    for (const pattern of patterns) {
      const relatedKeys = await this.keys(pattern)
      await this.warmCache(relatedKeys)
    }
  }

  // Analytics and monitoring
  async getStats(): Promise<CacheStats> {
    this.updateTopAccessed()
    return { ...this.stats }
  }

  async getKeyStats(key: string): Promise<CacheEntry | null> {
    return this.cache.get(key) || null
  }

  async getAnalytics(type: string, timeframe?: { start: string; end: string }): Promise<any[]> {
    const analytics = this.analytics.get(type) || []

    if (!timeframe) {
      return analytics
    }

    const start = new Date(timeframe.start)
    const end = new Date(timeframe.end)

    return analytics.filter((entry) => {
      const timestamp = new Date(entry.timestamp)
      return timestamp >= start && timestamp <= end
    })
  }

  // Private helper methods
  private recordHit(startTime: number): void {
    const responseTime = Date.now() - startTime
    this.updateHitRate(true, responseTime)
  }

  private recordMiss(startTime: number): void {
    const responseTime = Date.now() - startTime
    this.updateHitRate(false, responseTime)
  }

  private updateHitRate(isHit: boolean, responseTime: number): void {
    const totalRequests = this.stats.hitRate + this.stats.missRate

    if (isHit) {
      this.stats.hitRate = ((this.stats.hitRate * totalRequests) + 1) / (totalRequests + 1)
      this.stats.missRate = (this.stats.missRate * totalRequests) / (totalRequests + 1)
    } else {
      this.stats.hitRate = (this.stats.hitRate * totalRequests) / (totalRequests + 1)
      this.stats.missRate = ((this.stats.missRate * totalRequests) + 1) / (totalRequests + 1)
    }

    // Update average response time
    this.stats.avgResponseTime = (
      (this.stats.avgResponseTime * totalRequests) + responseTime
    ) / (totalRequests + 1)
  }

  private updateTotalSize(): void {
    let totalSize = 0
    let totalCompressionRatio = 0
    let compressionCount = 0

    for (const entry of this.cache.values()) {
      totalSize += this.calculateEntrySize(entry)

      if (entry.compressionRatio) {
        totalCompressionRatio += entry.compressionRatio
        compressionCount++
      }
    }

    this.stats.totalSize = totalSize
    this.stats.compressionRatio = compressionCount > 0
      ? totalCompressionRatio / compressionCount
      : 0
  }

  private calculateEntrySize(entry: CacheEntry): number {
    // Simple size calculation
    const jsonString = JSON.stringify(entry.value)
    return jsonString.length
  }

  private evictEntries(): void {
    const entriesToEvict = Math.ceil(this.config.maxCacheSize * 0.1) // Evict 10%

    switch (this.config.evictionPolicy) {
      case 'lru':
        this.evictLRU(entriesToEvict)
        break
      case 'lfu':
        this.evictLFU(entriesToEvict)
        break
      case 'fifo':
        this.evictFIFO(entriesToEvict)
        break
    }

    this.stats.evictionCount += entriesToEvict
    this.stats.totalKeys = this.cache.size
    this.updateTotalSize()
  }

  private evictLRU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => new Date(a[1].lastAccessed).getTime() - new Date(b[1].lastAccessed).getTime())

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private evictLFU(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].accessCount - b[1].accessCount)

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private evictFIFO(count: number): void {
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime())

    for (let i = 0; i < Math.min(count, entries.length); i++) {
      this.cache.delete(entries[i][0])
    }
  }

  private updateTopAccessed(): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({
        key,
        accessCount: entry.accessCount,
        lastAccessed: entry.lastAccessed,
      }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 10)

    this.stats.topAccessed = entries
  }

  private findPrefetchRule(key: string): CachePrefetchRule | null {
    for (const rule of this.prefetchRules.values()) {
      const regex = new RegExp(rule.pattern.replace(/\*/g, '.*'))
      if (regex.test(key)) {
        return rule
      }
    }
    return null
  }

  private triggerPrefetch(key: string, value: any): void {
    const rule = this.findPrefetchRule(key)
    if (rule && rule.condition(value)) {
      // Prefetch asynchronously
      setTimeout(async () => {
        try {
          const relatedKeys = await this.generateRelatedKeys(key, value)
          await this.warmCache(relatedKeys)
        } catch {
          console.error(`Failed to trigger prefetch for key ${key}:`, error)
        }
      }, 0)
    }
  }

  private generateRelatedPatterns(key: string): string[] {
    const patterns: string[] = []

    if (key.includes('client_profile')) {
      patterns.push('treatment_history_*', 'appointment_history_*', 'payment_history_*')
    } else if (key.includes('treatment_catalog')) {
      patterns.push('pricing_*', 'availability_*', 'professionals_*')
    } else if (key.includes('appointment')) {
      patterns.push('client_profile_*', 'treatment_info_*', 'professional_schedule_*')
    }

    return patterns
  }

  private async generateRelatedKeys(key: string, value: any): Promise<string[]> {
    const keys: string[] = []

    if (key.includes('client_profile') && value.clientId) {
      keys.push(
        `treatment_history_${value.clientId}`,
        `appointment_history_${value.clientId}`,
        `payment_history_${value.clientId}`,
      )
    } else if (key.includes('treatment_catalog') && value.category) {
      keys.push(
        `pricing_${value.category}`,
        `availability_${value.category}`,
        `professionals_${value.category}`,
      )
    }

    return keys
  }

  private async compress(value: any): Promise<{ value: any; ratio: number }> {
    try {
      const jsonString = JSON.stringify(value)
      const compressed = jsonString // Mock compression

      const ratio = jsonString.length > 0
        ? (jsonString.length - compressed.length) / jsonString.length
        : 0

      return { value: compressed, ratio }
    } catch {
      return { value, ratio: 0 }
    }
  }

  private async decompress(value: any): Promise<any> {
    try {
      // Mock decompression
      return typeof value === 'string' ? JSON.parse(value) : value
    } catch {
      return value
    }
  }

  private logAnalytics(type: string, data: any): void {
    if (!this.config.enableAnalytics) {
      return
    }

    const analytics = this.analytics.get(type) || []
    analytics.push({
      timestamp: new Date().toISOString(),
      ...data,
    })

    this.analytics.set(type, analytics)
  }

  private startCleanupTimer(): void {
    // Clean up expired entries every minute
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 60000)
  }

  private cleanupExpiredEntries(): void {
    const now = new Date()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (new Date(entry.expiresAt) < now) {
        expiredKeys.push(key)
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key)
    }

    if (expiredKeys.length > 0) {
      this.stats.totalKeys = this.cache.size
      this.updateTotalSize()
      this.logAnalytics('cleanup', { expiredKeys: expiredKeys.length })
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      return this.cache.size >= 0 && this.stats !== null
    } catch {
      return false
    }
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.clear()
    this.prefetchRules.clear()
    this.analytics.clear()
    this.stats = this.initializeStats()
  }
}
