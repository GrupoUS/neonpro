/**
 * Mobile Cache Manager
 * Story 7.4: Mobile App API Support - Cache Management
 * 
 * Intelligent caching system for mobile APIs:
 * - Multi-level caching (memory + disk)
 * - Cache strategies (cache-first, network-first, etc.)
 * - Automatic cache invalidation
 * - Compression and encryption
 * - Performance optimization
 * - Storage management
 */

import type {
  CacheConfig,
  CacheEntry,
  CacheMetadata,
  CacheStats,
  CacheStrategy,
  CompressionLevel
} from './types'
import { CompressionUtils } from './compression-utils'
import { SecurityUtils } from './security-utils'

export class MobileCache {
  private config: CacheConfig
  private memoryCache: Map<string, CacheEntry> = new Map()
  private diskCache: Map<string, CacheEntry> = new Map()
  private compressionUtils: CompressionUtils
  private securityUtils: SecurityUtils
  private stats: CacheStats
  private isInitialized = false
  private cleanupInterval?: NodeJS.Timeout
  private eventHandlers: { [key: string]: Function[] } = {}

  constructor(config: CacheConfig) {
    this.config = {
      strategy: 'cache-first',
      ttl: 300, // 5 minutes
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 10000,
      compression: true,
      encryption: false,
      persistToDisk: true,
      syncOnReconnect: true,
      ...config
    }

    this.compressionUtils = new CompressionUtils({
      level: 'medium',
      algorithm: 'gzip',
      threshold: 1024,
      mimeTypes: ['application/json'],
      excludePatterns: []
    })

    this.securityUtils = new SecurityUtils({
      encryption: this.config.encryption,
      tokenRefreshThreshold: 300,
      biometricTimeout: 300,
      maxFailedAttempts: 5,
      lockoutDuration: 900,
      certificatePinning: false,
      allowInsecureConnections: false
    })

    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      averageSize: 0,
      compressionRatio: 0
    }
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    try {
      // Initialize compression and security utils
      await Promise.all([
        this.compressionUtils.initialize(),
        this.securityUtils.initialize()
      ])

      // Load disk cache if persistence is enabled
      if (this.config.persistToDisk) {
        await this.loadDiskCache()
      }

      // Start cleanup interval
      this.startCleanupInterval()

      this.isInitialized = true
      console.log('Mobile Cache Manager initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Mobile Cache Manager:', error)
      throw error
    }
  }

  // ============================================================================
  // CACHE OPERATIONS
  // ============================================================================

  async get<T>(key: string): Promise<CacheEntry | null> {
    try {
      if (!this.isInitialized) {
        throw new Error('Cache not initialized')
      }

      // Check memory cache first
      let entry = this.memoryCache.get(key)
      
      if (!entry && this.config.persistToDisk) {
        // Check disk cache
        entry = this.diskCache.get(key)
        
        if (entry) {
          // Move to memory cache for faster access
          this.memoryCache.set(key, entry)
        }
      }

      if (!entry) {
        this.updateStats('miss')
        return null
      }

      // Check if entry is expired
      if (this.isExpired(entry)) {
        await this.delete(key)
        this.updateStats('miss')
        return null
      }

      // Update access time
      entry.accessedAt = Date.now()
      
      // Decrypt data if needed
      if (entry.encrypted && this.config.encryption) {
        entry.data = await this.securityUtils.decrypt(entry.data)
      }

      // Decompress data if needed
      if (entry.compressed && this.config.compression) {
        const decompressed = await this.compressionUtils.decompress(entry.data, 'gzip')
        if (decompressed.success) {
          entry.data = JSON.parse(decompressed.data)
        }
      }

      this.updateStats('hit')
      this.emitEvent('cacheUpdate', key, entry)
      
      return entry
    } catch (error) {
      console.error('Cache get error:', error)
      this.updateStats('miss')
      return null
    }
  }

  async set(key: string, entry: Omit<CacheEntry, 'key'>): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Cache not initialized')
      }

      const cacheEntry: CacheEntry = {
        key,
        ...entry
      }

      // Compress data if enabled and size threshold is met
      if (this.config.compression && cacheEntry.size >= 1024) {
        const compressed = await this.compressionUtils.compress(JSON.stringify(cacheEntry.data))
        if (compressed.success) {
          cacheEntry.data = compressed.data
          cacheEntry.compressed = true
          cacheEntry.size = compressed.compressedSize
        }
      }

      // Encrypt data if enabled
      if (this.config.encryption) {
        cacheEntry.data = await this.securityUtils.encrypt(cacheEntry.data)
        cacheEntry.encrypted = true
      }

      // Check if we need to evict entries
      await this.ensureCapacity(cacheEntry.size)

      // Store in memory cache
      this.memoryCache.set(key, cacheEntry)

      // Store in disk cache if persistence is enabled
      if (this.config.persistToDisk) {
        this.diskCache.set(key, cacheEntry)
        await this.saveDiskCache()
      }

      this.updateStatsForSet(cacheEntry)
      this.emitEvent('cacheUpdate', key, cacheEntry)
    } catch (error) {
      console.error('Cache set error:', error)
      throw error
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        return false
      }

      const memoryDeleted = this.memoryCache.delete(key)
      const diskDeleted = this.diskCache.delete(key)

      if (diskDeleted && this.config.persistToDisk) {
        await this.saveDiskCache()
      }

      if (memoryDeleted || diskDeleted) {
        this.updateStatsForDelete()
        return true
      }

      return false
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  async clear(pattern?: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        return
      }

      if (pattern) {
        // Clear entries matching pattern
        const regex = new RegExp(pattern)
        const keysToDelete: string[] = []

        for (const key of this.memoryCache.keys()) {
          if (regex.test(key)) {
            keysToDelete.push(key)
          }
        }

        for (const key of keysToDelete) {
          await this.delete(key)
        }
      } else {
        // Clear all entries
        this.memoryCache.clear()
        this.diskCache.clear()

        if (this.config.persistToDisk) {
          await this.saveDiskCache()
        }

        this.resetStats()
      }
    } catch (error) {
      console.error('Cache clear error:', error)
      throw error
    }
  }

  // ============================================================================
  // CACHE STRATEGIES
  // ============================================================================

  async getWithStrategy<T>(
    key: string,
    strategy: CacheStrategy,
    networkFetcher: () => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'network' }> {
    switch (strategy) {
      case 'cache-first':
        return this.cacheFirstStrategy(key, networkFetcher)
      case 'network-first':
        return this.networkFirstStrategy(key, networkFetcher)
      case 'cache-only':
        return this.cacheOnlyStrategy(key)
      case 'network-only':
        return this.networkOnlyStrategy(networkFetcher)
      default:
        return this.cacheFirstStrategy(key, networkFetcher)
    }
  }

  private async cacheFirstStrategy<T>(
    key: string,
    networkFetcher: () => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'network' }> {
    // Try cache first
    const cached = await this.get<T>(key)
    if (cached) {
      return { data: cached.data, source: 'cache' }
    }

    // Fallback to network
    const networkData = await networkFetcher()
    
    // Cache the result
    await this.set(key, {
      data: networkData,
      metadata: {
        version: '1.0',
        source: 'network',
        priority: 'normal',
        tags: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      accessedAt: Date.now(),
      expiresAt: Date.now() + (this.config.ttl * 1000),
      size: JSON.stringify(networkData).length,
      compressed: false,
      encrypted: false
    })

    return { data: networkData, source: 'network' }
  }

  private async networkFirstStrategy<T>(
    key: string,
    networkFetcher: () => Promise<T>
  ): Promise<{ data: T; source: 'cache' | 'network' }> {
    try {
      // Try network first
      const networkData = await networkFetcher()
      
      // Cache the result
      await this.set(key, {
        data: networkData,
        metadata: {
          version: '1.0',
          source: 'network',
          priority: 'normal',
          tags: []
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        accessedAt: Date.now(),
        expiresAt: Date.now() + (this.config.ttl * 1000),
        size: JSON.stringify(networkData).length,
        compressed: false,
        encrypted: false
      })

      return { data: networkData, source: 'network' }
    } catch (error) {
      // Fallback to cache
      const cached = await this.get<T>(key)
      if (cached) {
        return { data: cached.data, source: 'cache' }
      }
      throw error
    }
  }

  private async cacheOnlyStrategy<T>(key: string): Promise<{ data: T; source: 'cache' | 'network' }> {
    const cached = await this.get<T>(key)
    if (!cached) {
      throw new Error('No cached data available')
    }
    return { data: cached.data, source: 'cache' }
  }

  private async networkOnlyStrategy<T>(networkFetcher: () => Promise<T>): Promise<{ data: T; source: 'cache' | 'network' }> {
    const networkData = await networkFetcher()
    return { data: networkData, source: 'network' }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  async cleanup(): Promise<void> {
    try {
      if (!this.isInitialized) {
        return
      }

      const now = Date.now()
      const expiredKeys: string[] = []

      // Find expired entries
      for (const [key, entry] of this.memoryCache.entries()) {
        if (this.isExpired(entry)) {
          expiredKeys.push(key)
        }
      }

      // Remove expired entries
      for (const key of expiredKeys) {
        await this.delete(key)
      }

      // Check if we need to evict more entries due to size limits
      await this.enforceCapacityLimits()

      console.log(`Cache cleanup completed. Removed ${expiredKeys.length} expired entries.`)
    } catch (error) {
      console.error('Cache cleanup error:', error)
    }
  }

  private async ensureCapacity(newEntrySize: number): Promise<void> {
    const currentSize = this.getCurrentSize()
    const currentEntries = this.memoryCache.size

    // Check size limit
    if (currentSize + newEntrySize > this.config.maxSize) {
      await this.evictBySize(currentSize + newEntrySize - this.config.maxSize)
    }

    // Check entry count limit
    if (currentEntries >= this.config.maxEntries) {
      await this.evictByCount(currentEntries - this.config.maxEntries + 1)
    }
  }

  private async enforceCapacityLimits(): Promise<void> {
    const currentSize = this.getCurrentSize()
    const currentEntries = this.memoryCache.size

    if (currentSize > this.config.maxSize) {
      await this.evictBySize(currentSize - this.config.maxSize)
    }

    if (currentEntries > this.config.maxEntries) {
      await this.evictByCount(currentEntries - this.config.maxEntries)
    }
  }

  private async evictBySize(bytesToEvict: number): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
    
    // Sort by access time (LRU)
    entries.sort(([, a], [, b]) => a.accessedAt - b.accessedAt)

    let evictedBytes = 0
    const keysToEvict: string[] = []

    for (const [key, entry] of entries) {
      keysToEvict.push(key)
      evictedBytes += entry.size
      
      if (evictedBytes >= bytesToEvict) {
        break
      }
    }

    for (const key of keysToEvict) {
      await this.delete(key)
      this.stats.evictionCount++
    }
  }

  private async evictByCount(entriesToEvict: number): Promise<void> {
    const entries = Array.from(this.memoryCache.entries())
    
    // Sort by access time (LRU)
    entries.sort(([, a], [, b]) => a.accessedAt - b.accessedAt)

    const keysToEvict = entries.slice(0, entriesToEvict).map(([key]) => key)

    for (const key of keysToEvict) {
      await this.delete(key)
      this.stats.evictionCount++
    }
  }

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  private async loadDiskCache(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheData = localStorage.getItem('mobile-api-cache')
        if (cacheData) {
          const parsed = JSON.parse(cacheData)
          this.diskCache = new Map(parsed.entries || [])
          
          // Load valid entries into memory cache
          for (const [key, entry] of this.diskCache.entries()) {
            if (!this.isExpired(entry)) {
              this.memoryCache.set(key, entry)
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load disk cache:', error)
    }
  }

  private async saveDiskCache(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const cacheData = {
          entries: Array.from(this.diskCache.entries()),
          timestamp: Date.now()
        }
        localStorage.setItem('mobile-api-cache', JSON.stringify(cacheData))
      }
    } catch (error) {
      console.error('Failed to save disk cache:', error)
    }
  }

  // ============================================================================
  // STATISTICS
  // ============================================================================

  async getStats(): Promise<CacheStats> {
    const currentSize = this.getCurrentSize()
    const totalEntries = this.memoryCache.size
    
    return {
      ...this.stats,
      totalEntries,
      totalSize: currentSize,
      averageSize: totalEntries > 0 ? currentSize / totalEntries : 0,
      oldestEntry: this.getOldestEntry(),
      newestEntry: this.getNewestEntry()
    }
  }

  private updateStats(type: 'hit' | 'miss'): void {
    const totalRequests = this.stats.hitRate + this.stats.missRate + 1
    
    if (type === 'hit') {
      this.stats.hitRate = ((this.stats.hitRate * (totalRequests - 1)) + 1) / totalRequests
      this.stats.missRate = 1 - this.stats.hitRate
    } else {
      this.stats.missRate = ((this.stats.missRate * (totalRequests - 1)) + 1) / totalRequests
      this.stats.hitRate = 1 - this.stats.missRate
    }
  }

  private updateStatsForSet(entry: CacheEntry): void {
    this.stats.totalEntries = this.memoryCache.size
    this.stats.totalSize = this.getCurrentSize()
    this.stats.averageSize = this.stats.totalEntries > 0 ? this.stats.totalSize / this.stats.totalEntries : 0
    
    if (entry.compressed) {
      // Update compression ratio
      const originalSize = JSON.stringify(entry.data).length
      const compressionRatio = entry.size / originalSize
      this.stats.compressionRatio = (this.stats.compressionRatio + compressionRatio) / 2
    }
  }

  private updateStatsForDelete(): void {
    this.stats.totalEntries = this.memoryCache.size
    this.stats.totalSize = this.getCurrentSize()
    this.stats.averageSize = this.stats.totalEntries > 0 ? this.stats.totalSize / this.stats.totalEntries : 0
  }

  private resetStats(): void {
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitRate: 0,
      missRate: 0,
      evictionCount: 0,
      averageSize: 0,
      compressionRatio: 0
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() > entry.expiresAt
  }

  private getCurrentSize(): number {
    let totalSize = 0
    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size
    }
    return totalSize
  }

  private getOldestEntry(): Date | undefined {
    let oldest: Date | undefined
    
    for (const entry of this.memoryCache.values()) {
      const entryDate = new Date(entry.createdAt)
      if (!oldest || entryDate < oldest) {
        oldest = entryDate
      }
    }
    
    return oldest
  }

  private getNewestEntry(): Date | undefined {
    let newest: Date | undefined
    
    for (const entry of this.memoryCache.values()) {
      const entryDate = new Date(entry.createdAt)
      if (!newest || entryDate > newest) {
        newest = entryDate
      }
    }
    
    return newest
  }

  private startCleanupInterval(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup().catch(console.error)
    }, 5 * 60 * 1000)
  }

  private stopCleanupInterval(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
  }

  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================

  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = []
    }
    this.eventHandlers[event].push(handler)
  }

  off(event: string, handler?: Function): void {
    if (!this.eventHandlers[event]) {
      return
    }

    if (handler) {
      const index = this.eventHandlers[event].indexOf(handler)
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1)
      }
    } else {
      this.eventHandlers[event] = []
    }
  }

  private emitEvent(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers[event]
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in cache event handler ${event}:`, error)
        }
      }
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async destroy(): Promise<void> {
    try {
      this.stopCleanupInterval()
      
      // Save final state to disk
      if (this.config.persistToDisk) {
        await this.saveDiskCache()
      }
      
      // Clear all caches
      this.memoryCache.clear()
      this.diskCache.clear()
      
      // Clear event handlers
      this.eventHandlers = {}
      
      // Cleanup subsystems
      await Promise.all([
        this.compressionUtils.destroy(),
        this.securityUtils.destroy()
      ])
      
      this.isInitialized = false
      
      console.log('Mobile Cache Manager destroyed successfully')
    } catch (error) {
      console.error('Error destroying Mobile Cache Manager:', error)
    }
  }

  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================

  get size(): number {
    return this.memoryCache.size
  }

  get totalSize(): number {
    return this.getCurrentSize()
  }

  get isReady(): boolean {
    return this.isInitialized
  }

  get configuration(): CacheConfig {
    return { ...this.config }
  }
}