import type { CacheEntry, CacheOperation, CacheStats } from "./types";

type EdgeCacheEntry = CacheEntry<string> & {
  encrypted?: boolean;
};

export class EdgeCacheLayer implements CacheOperation {
  private cache = new Map<string, EdgeCacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
  };
  private responseTimeBuffer: number[] = [];

  constructor(
    private readonly config = {
      endpoint: process.env.SUPABASE_EDGE_ENDPOINT || "https://edge-cache.supabase.co",
      region: "sa-east-1", // São Paulo region
      defaultTTL: 10 * 60, // 10 minutes in seconds
      maxTTL: 60 * 60, // 1 hour in seconds
      compressionThreshold: 1024, // 1KB
      maxSize: 10_000, // Max 10k entries
      encryption: true,
    },
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    try {
      const entry = this.cache.get(this.buildKey(key));
      if (!entry) {
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // Check TTL expiration
      if (Date.now() > entry.timestamp + entry.ttl * 1000) {
        this.cache.delete(this.buildKey(key));
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      this.stats.hits++;
      this.updateStats(startTime);

      // Decompress if needed
      const value = entry.compressed ? this.decompress(entry.value) : entry.value;
      return value as unknown as T;
    } catch (error) {
      this.stats.misses++;
      this.updateStats(startTime);
      console.error("Edge cache get error:", error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const effectiveTTL = Math.min(
      ttl || this.config.defaultTTL,
      this.config.maxTTL,
    );

    const serialized = JSON.stringify(value);
    const shouldCompress = serialized.length > this.config.compressionThreshold;

    const entry: EdgeCacheEntry = {
      value: shouldCompress ? this.compress(serialized) : serialized,
      timestamp: Date.now(),
      ttl: effectiveTTL,
      compressed: shouldCompress,
      encrypted: this.config.encryption,
      lastAccessed: Date.now(),
      tags: [],
    } as EdgeCacheEntry;

    this.cache.set(this.buildKey(key), entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(this.buildKey(key));
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.resetStats();
  }

  async getStats(): Promise<CacheStats> {
    this.stats.hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests) * 100
      : 0;
    return { ...this.stats };
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.some((tag) => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  // Edge-specific methods
  async warmup(keys: string[]): Promise<void> {
    // Pre-load commonly used keys (placeholder implementation)
    for (const key of keys) {
      const entry = this.cache.get(this.buildKey(key));
      if (entry) {
        entry.lastAccessed = Date.now();
        this.cache.set(this.buildKey(key), entry);
      }
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    let invalidated = 0;
    const regex = new RegExp(pattern);

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }

    return invalidated;
  }

  async getRegionStats(): Promise<{
    region: string;
    latency: number;
    hitRate: number;
    size: number;
  }> {
    const stats = await this.getStats();
    return {
      region: this.config.region,
      latency: stats.averageResponseTime,
      hitRate: stats.hitRate,
      size: this.cache.size,
    };
  }

  // Health check for edge nodes
  async healthCheck(): Promise<{
    status: "healthy" | "degraded" | "unhealthy";
    latency: number;
    errorRate: number;
    region: string;
  }> {
    const stats = await this.getStats();
    const errorRate = stats.totalRequests > 0
      ? ((stats.totalRequests - stats.hits) / stats.totalRequests) * 100
      : 0;

    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    if (stats.averageResponseTime > 100 || errorRate > 10) {
      status = "degraded";
    }
    if (stats.averageResponseTime > 500 || errorRate > 25) {
      status = "unhealthy";
    }

    return {
      status,
      latency: stats.averageResponseTime,
      errorRate,
      region: this.config.region,
    };
  }

  private buildKey(key: string): string {
    return `edge:${this.config.region}:${key}`;
  }

  private compress(data: string): string {
    // Simple compression placeholder - in real implementation, use compression library
    if (data.length < this.config.compressionThreshold) {
      return data;
    }
    // Would use actual compression like gzip here
    return data;
  }

  private decompress(data: string): string {
    return typeof data === "string" ? data : JSON.stringify(data);
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed && entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateStats(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.responseTimeBuffer.push(responseTime);

    if (this.responseTimeBuffer.length > 100) {
      this.responseTimeBuffer.shift();
    }

    this.stats.averageResponseTime = this.responseTimeBuffer.reduce((a, b) => a + b, 0)
      / this.responseTimeBuffer.length;
  }

  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    };
    this.responseTimeBuffer = [];
  }
}
