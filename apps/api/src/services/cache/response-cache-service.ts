/**
 * Response Cache Service for AI Agent Performance Optimization
 * Implements intelligent caching for frequently accessed healthcare data
 */

import { Redis } from 'ioredis';
import { createHash } from 'crypto';
import { 
  AguiQueryMessage, 
  AguiResponseMessage, 
  AguiSource,
  AguiUsageStats 
} from '../agui-protocol/types';

export interface CacheConfig {
  redisUrl: string;
  defaultTTL: number; // seconds
  maxSize: number; // number of items
  compressionEnabled: boolean;
  healthCheckInterval: number; // ms
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: string;
  ttl: number;
  hitCount: number;
  metadata: {
    queryHash: string;
    userId: string;
    patientId?: string;
    dataCategories: string[];
    confidenceScore?: number;
    sources?: AguiSource[];
  };
}

export interface CacheStats {
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageResponseTimeMs: number;
  memoryUsage: number;
  cacheSize: number;
  evictionCount: number;
  compressionRatio?: number;
}

export class ResponseCacheService {
  private redis: Redis;
  private config: CacheConfig;
  private stats: CacheStats;
  private localCache: Map<string, CacheEntry>;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: CacheConfig) {
    this.config = config;
    this.redis = new Redis(config.redisUrl);
    this.localCache = new Map();
    this.stats = {
      totalHits: 0,
      totalMisses: 0,
      hitRate: 0,
      averageResponseTimeMs: 0,
      memoryUsage: 0,
      cacheSize: 0,
      evictionCount: 0
    };

    this.initializeHealthCheck();
  }

  /**
   * Generate cache key for query
   */
  private generateCacheKey(query: AguiQueryMessage, userId: string): string {
    const queryData = {
      query: query.query,
      context: {
        patientId: query.context?.patientId,
        userId: query.context?.userId,
        previousTopics: query.context?.previousTopics
      },
      options: {
        maxResults: query.options?.maxResults,
        model: query.options?.model,
        temperature: query.options?.temperature
      }
    };

    const hash = createHash('sha256')
      .update(JSON.stringify(queryData))
      .digest('hex');

    return `agent_response:${userId}:${hash}`;
  }

  /**
   * Extract data categories from response for intelligent caching
   */
  private extractDataCategories(response: AguiResponseMessage): string[] {
    const categories: string[] = [];
    
    if (response.sources) {
      response.sources.forEach(source => {
        switch (source.type) {
          case 'patient_data':
            categories.push('patient_records');
            break;
          case 'appointment':
            categories.push('appointments');
            break;
          case 'financial':
            categories.push('financial_data');
            break;
          case 'document':
            categories.push('documents');
            break;
          case 'medical_knowledge':
            categories.push('medical_knowledge');
            break;
        }
      });
    }

    // Add content-based categories
    if (response.content.toLowerCase().includes('agendamento')) {
      categories.push('appointments');
    }
    if (response.content.toLowerCase().includes('paciente')) {
      categories.push('patient_data');
    }
    if (response.content.toLowerCase().includes('financeiro')) {
      categories.push('financial_data');
    }

    return [...new Set(categories)];
  }

  /**
   * Compress data for storage
   */
  private async compressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled) {
      return data;
    }

    // Simple JSON-based compression for now
    // In production, use proper compression algorithms
    return {
      _compressed: true,
      data: JSON.stringify(data)
    };
  }

  /**
   * Decompress cached data
   */
  private async decompressData(data: any): Promise<any> {
    if (!this.config.compressionEnabled || !data._compressed) {
      return data;
    }

    return JSON.parse(data.data);
  }

  /**
   * Get cached response
   */
  async getCachedResponse(
    query: AguiQueryMessage, 
    userId: string
  ): Promise<AguiResponseMessage | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(query, userId);

    try {
      // Check local cache first
      const localEntry = this.localCache.get(cacheKey);
      if (localEntry && !this.isExpired(localEntry)) {
        localEntry.hitCount++;
        this.stats.totalHits++;
        this.updateHitRate();
        this.stats.averageResponseTimeMs = Date.now() - startTime;
        
        return await this.decompressData(localEntry.data);
      }

      // Check Redis cache
      const redisData = await this.redis.get(cacheKey);
      if (redisData) {
        const entry: CacheEntry = JSON.parse(redisData);
        
        if (!this.isExpired(entry)) {
          // Move to local cache for faster access
          entry.hitCount++;
          this.localCache.set(cacheKey, entry);
          
          // Cleanup local cache if oversized
          this.enforceLocalCacheSize();
          
          this.stats.totalHits++;
          this.updateHitRate();
          this.stats.averageResponseTimeMs = Date.now() - startTime;
          
          return await this.decompressData(entry.data);
        } else {
          // Remove expired entry
          await this.redis.del(cacheKey);
        }
      }

      this.stats.totalMisses++;
      this.updateHitRate();
      return null;

    } catch (error) {
      console.error('[Cache] Error retrieving cached response:', error);
      this.stats.totalMisses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Cache response
   */
  async cacheResponse(
    query: AguiQueryMessage,
    response: AguiResponseMessage,
    userId: string,
    options: {
      customTTL?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<void> {
    if (options.skipCache) {
      return;
    }

    const cacheKey = this.generateCacheKey(query, userId);
    const ttl = options.customTTL || this.config.defaultTTL;

    try {
      const entry: CacheEntry = {
        data: await this.compressData(response),
        timestamp: new Date().toISOString(),
        ttl,
        hitCount: 1,
        metadata: {
          queryHash: cacheKey.split(':').pop()!,
          userId,
          patientId: query.context?.patientId,
          dataCategories: this.extractDataCategories(response),
          confidenceScore: response.confidence,
          sources: response.sources
        }
      };

      // Store in Redis
      await this.redis.setex(cacheKey, ttl, JSON.stringify(entry));

      // Store in local cache for frequently accessed items
      this.localCache.set(cacheKey, entry);
      this.enforceLocalCacheSize();

      this.stats.cacheSize++;

    } catch (error) {
      console.error('[Cache] Error caching response:', error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = new Date();
    const expiresAt = new Date(entry.timestamp);
    expiresAt.setSeconds(expiresAt.getSeconds() + entry.ttl);
    
    return now > expiresAt;
  }

  /**
   * Enforce local cache size limit
   */
  private enforceLocalCacheSize(): void {
    if (this.localCache.size > this.config.maxSize) {
      // Simple LRU eviction
      const entries = Array.from(this.localCache.entries());
      entries.sort((a, b) => a[1].hitCount - b[1].hitCount);
      
      const toRemove = entries.slice(0, Math.floor(this.config.maxSize * 0.2));
      toRemove.forEach(([key]) => {
        this.localCache.delete(key);
        this.stats.evictionCount++;
      });
    }
  }

  /**
   * Update cache hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.totalHits + this.stats.totalMisses;
    this.stats.hitRate = total > 0 ? (this.stats.totalHits / total) * 100 : 0;
  }

  /**
   * Invalidate cache entries
   */
  async invalidateCache(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }

      // Clear matching local cache entries
      for (const [key] of this.localCache) {
        if (key.includes(pattern)) {
          this.localCache.delete(key);
        }
      }

      return keys.length;
    } catch (error) {
      console.error('[Cache] Error invalidating cache:', error);
      return 0;
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    try {
      // Get Redis info
      const redisInfo = await this.redis.info('memory');
      const memoryMatch = redisInfo.match(/used_memory_human:([^\r\n]+)/);
      this.stats.memoryUsage = memoryMatch ? parseFloat(memoryMatch[1]) : 0;

      // Get cache size
      const cacheSize = await this.redis.dbsize();
      this.stats.cacheSize = cacheSize;

    } catch (error) {
      console.error('[Cache] Error getting cache stats:', error);
    }

    return { ...this.stats };
  }

  /**
   * Health check and cleanup
   */
  private async healthCheck(): Promise<void> {
    try {
      // Test Redis connection
      await this.redis.ping();

      // Clean expired entries from local cache
      for (const [key, entry] of this.localCache) {
        if (this.isExpired(entry)) {
          this.localCache.delete(key);
          this.stats.evictionCount++;
        }
      }

    } catch (error) {
      console.error('[Cache] Health check failed:', error);
    }
  }

  /**
   * Initialize health check timer
   */
  private initializeHealthCheck(): void {
    this.healthCheckTimer = setInterval(
      () => this.healthCheck(),
      this.config.healthCheckInterval
    );
  }

  /**
   * Cleanup resources
   */
  async destroy(): Promise<void> {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    
    await this.redis.quit();
    this.localCache.clear();
  }
}

/**
 * Healthcare-specific cache configuration
 */
export function createHealthcareCacheConfig(): CacheConfig {
  return {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    defaultTTL: 3600, // 1 hour for healthcare data
    maxSize: 1000, // Local cache size
    compressionEnabled: true,
    healthCheckInterval: 30000 // 30 seconds
  };
}

/**
 * Cache strategies for different data types
 */
export const CacheStrategies = {
  // Patient data - longer TTL, high priority
  patientData: {
    ttl: 7200, // 2 hours
    compress: true,
    priority: 'high'
  },

  // Appointments - shorter TTL, medium priority
  appointments: {
    ttl: 1800, // 30 minutes
    compress: true,
    priority: 'medium'
  },

  // Financial data - medium TTL, high priority
  financial: {
    ttl: 3600, // 1 hour
    compress: true,
    priority: 'high'
  },

  // Medical knowledge - long TTL, low priority
  medicalKnowledge: {
    ttl: 86400, // 24 hours
    compress: true,
    priority: 'low'
  },

  // Real-time queries - very short TTL, no cache
  realtime: {
    ttl: 60, // 1 minute
    compress: false,
    priority: 'low'
  }
};