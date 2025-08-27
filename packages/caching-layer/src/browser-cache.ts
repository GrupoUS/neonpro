import type { CacheOperation, CacheStats, HealthcareDataPolicy } from "./types";

export class BrowserCacheLayer implements CacheOperation {
  private readonly cache = new Map<string, any>();
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
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxTTL: 15 * 60 * 1000, // 15 minutes
      lgpdCompliant: true,
    },
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // Check TTL expiration
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats(startTime);
      return null;
    }

    // LGPD consent validation for sensitive data
    if (entry.sensitive && this.config.lgpdCompliant) {
      const consent = this.checkLGPDConsent(key);
      if (!consent) {
        this.cache.delete(key);
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }
    }

    this.stats.hits++;
    this.updateStats(startTime);
    return entry.value;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    policy?: HealthcareDataPolicy,
  ): Promise<void> {
    // Evict if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictLRU();
    }

    const effectiveTTL = Math.min(
      ttl || this.config.defaultTTL,
      this.config.maxTTL,
    );

    const entry = {
      value,
      timestamp: Date.now(),
      ttl: effectiveTTL,
      sensitive:
        policy?.dataClassification === "RESTRICTED" ||
        policy?.dataClassification === "CONFIDENTIAL",
      lgpdConsent: policy?.requiresConsent ? this.checkLGPDConsent(key) : true,
      lastAccessed: Date.now(),
    };

    this.cache.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.resetStats();
  }

  async getStats(): Promise<CacheStats> {
    this.stats.hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.hits / this.stats.totalRequests) * 100
        : 0;
    return { ...this.stats };
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags?.some((tag: string) => tags.includes(tag))) {
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = "";
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private checkLGPDConsent(key: string): boolean {
    // Integration with consent management system
    const consentKey = `lgpd_consent_${key.split(":")[0]}`;
    return localStorage.getItem(consentKey) === "granted";
  }

  private updateStats(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.responseTimeBuffer.push(responseTime);

    if (this.responseTimeBuffer.length > 100) {
      this.responseTimeBuffer.shift();
    }

    this.stats.averageResponseTime =
      this.responseTimeBuffer.reduce((a, b) => a + b, 0) /
      this.responseTimeBuffer.length;
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
