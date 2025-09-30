/**
 * Edge Caching Middleware
 *
 * Provides in-memory caching for GET requests in Edge runtime.
 * Designed to be upgraded to KV storage for production.
 */

interface CacheEntry {
  data: any
  timestamp: number
  ttl: number
}

class EdgeCache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTTL = 60 // 60 seconds default TTL

  /**
   * Generate cache key based on URL and clinic_id
   */
  private generateKey(url: string, clinicId?: string): string {
    const cleanUrl = url.split('?')[0] // Remove query parameters
    return `${cleanUrl}:${clinicId || 'anonymous'}`
  }

  /**
   * Get cached data
   */
  get(url: string, clinicId?: string): any | null {
    const key = this.generateKey(url, clinicId)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set cached data
   */
  set(url: string, data: any, clinicId?: string, ttl?: number): void {
    const key = this.generateKey(url, clinicId)
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }
    this.cache.set(key, entry)
  }

  /**
   * Delete cached data
   */
  delete(url: string, clinicId?: string): boolean {
    const key = this.generateKey(url, clinicId)
    return this.cache.delete(key)
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl * 1000) {
        this.cache.delete(key)
      }
    }
  }
}

// Singleton instance for Edge runtime
const edgeCache = new EdgeCache()

// Clean up expired entries every 5 minutes
setInterval(() => edgeCache.cleanup(), 5 * 60 * 1000)

/**
 * Caching middleware factory
 */
export const createCacheMiddleware = (options: {
  ttl?: number
  skipMethods?: string[]
  skipPaths?: string[]
} = {}) => {
  const {
    ttl = 60, // Default TTL in seconds
    skipMethods = ['POST', 'PUT', 'DELETE', 'PATCH'],
    skipPaths = ['/migration/start']
  } = options

  return async (c: any, next: any) => {
    const startTime = c.get('startTime')
    const method = c.req.method
    const url = c.req.url
    const clinicId = c.get('clinicId')

    // Skip caching for non-GET requests
    if (skipMethods.includes(method)) {
      await next()
      return
    }

    // Skip caching for specific paths
    if (skipPaths.some(path => url.includes(path))) {
      await next()
      return
    }

    // Try to get from cache
    const cachedData = edgeCache.get(url, clinicId)
    if (cachedData) {
      return c.json({
        ...cachedData,
        cached: true,
        responseTime: Date.now() - startTime
      })
    }

    // Set a flag to indicate this is the first request (not cached)
    c.set('isFirstRequest', true)

    // Continue to next middleware
    await next()

    // Get the response from the context
    const response = c.res
    if (!response) {
      return
    }

    // Cache successful responses only (status 200-299)
    if (response.status >= 200 && response.status < 300) {
      try {
        // Clone the response to avoid body already used error
        const responseClone = response.clone()
        const responseData = await responseClone.json()

        // Only cache if we have valid data and no error field
        if (responseData && !responseData.error) {
          edgeCache.set(url, responseData, clinicId, ttl)
        }
      } catch (error) {
        // Failed to parse response, don't cache
        console.error('Failed to cache response:', error)
      }
    }
  }
}

/**
 * Cache invalidation helper
 */
export const invalidateCache = (url: string, clinicId?: string): boolean => {
  return edgeCache.delete(url, clinicId)
}

/**
 * Cache invalidation by pattern
 */
export const invalidateCacheByPattern = (pattern: string, clinicId?: string): number => {
  let deleted = 0
  // This is a simple implementation - in production with KV, you'd use more sophisticated patterns
  for (const [key] of edgeCache['cache'].entries()) {
    if (key.includes(pattern) && (!clinicId || key.includes(clinicId))) {
      edgeCache['cache'].delete(key)
      deleted++
    }
  }
  return deleted
}

export { EdgeCache }
export default edgeCache

// Export a function to clear the cache for testing
export const clearCacheForTesting = () => {
  edgeCache.clear()
}
