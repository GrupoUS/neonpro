import { Redis } from "ioredis";
import type { CacheService, LoggerService, MetricsService } from "../types";

interface CacheConfig {
  redis: {
    host: string;
    port: number;
    password?: string;
    database: number;
    keyPrefix: string;
    retryDelayOnFailover: number;
    maxRetriesPerRequest: number;
    lazyConnect: boolean;
  };
  defaultTTL: number;
  compressionThreshold: number;
  enableMetrics: boolean;
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  totalOperations: number;
  hitRate: number;
  avgResponseTime: number;
}

export class RedisCacheService implements CacheService {
  private readonly redis: Redis;
  private readonly logger: LoggerService;
  private readonly metrics: MetricsService;
  private readonly config: CacheConfig;
  private readonly operationMetrics: CacheMetrics = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    totalOperations: 0,
    hitRate: 0,
    avgResponseTime: 0,
  };
  private responseTimes: number[] = [];

  constructor(
    config: CacheConfig,
    logger: LoggerService,
    metrics: MetricsService,
  ) {
    this.config = config;
    this.logger = logger;
    this.metrics = metrics;

    this.redis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      db: config.redis.database,
      keyPrefix: config.redis.keyPrefix,
      retryDelayOnFailover: config.redis.retryDelayOnFailover,
      maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
      lazyConnect: config.redis.lazyConnect,
    });

    this.setupEventHandlers();
    this.startMetricsReporting();
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const cachedValue = await this.redis.get(key);
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(responseTime);
      this.operationMetrics.totalOperations++;

      if (cachedValue === null) {
        this.operationMetrics.misses++;
        this.updateHitRate();

        await this.logger.debug("Cache miss", { key, responseTime });

        if (this.config.enableMetrics) {
          await this.metrics.recordCounter("cache_misses", 1, { key });
          await this.metrics.recordHistogram(
            "cache_response_time",
            responseTime,
            {
              operation: "get",
              result: "miss",
            },
          );
        }

        return;
      }

      this.operationMetrics.hits++;
      this.updateHitRate();

      let parsedValue: T;
      try {
        // Try to parse as JSON first
        parsedValue = JSON.parse(cachedValue);
      } catch {
        // If parsing fails, return as string (for simple string caches)
        parsedValue = cachedValue as unknown as T;
      }

      await this.logger.debug("Cache hit", { key, responseTime });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_hits", 1, { key });
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "get",
            result: "hit",
          },
        );
      }

      return parsedValue;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache get error", {
        key,
        error: error.message,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_errors", 1, {
          operation: "get",
          key,
        });
      }

      return;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();

    try {
      const serializedValue = this.serializeValue(value);
      const effectiveTTL = ttl || this.config.defaultTTL;

      // Use compression for large values
      const finalValue =
        serializedValue.length > this.config.compressionThreshold
          ? await this.compressValue(serializedValue)
          : serializedValue;

      if (effectiveTTL > 0) {
        await this.redis.setex(key, effectiveTTL, finalValue);
      } else {
        await this.redis.set(key, finalValue);
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.sets++;
      this.operationMetrics.totalOperations++;

      await this.logger.debug("Cache set", {
        key,
        ttl: effectiveTTL,
        size: finalValue.length,
        compressed: finalValue !== serializedValue,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_sets", 1, { key });
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "set",
          },
        );
        await this.metrics.recordGauge("cache_value_size", finalValue.length, {
          key,
        });
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache set error", {
        key,
        error: error.message,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_errors", 1, {
          operation: "set",
          key,
        });
      }

      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();

    try {
      const deleted = await this.redis.del(key);
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(responseTime);
      this.operationMetrics.deletes++;
      this.operationMetrics.totalOperations++;

      await this.logger.debug("Cache delete", {
        key,
        deleted: deleted > 0,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_deletes", 1, { key });
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "delete",
          },
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache delete error", {
        key,
        error: error.message,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_errors", 1, {
          operation: "delete",
          key,
        });
      }

      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const exists = await this.redis.exists(key);
      const responseTime = Date.now() - startTime;

      this.recordResponseTime(responseTime);
      this.operationMetrics.totalOperations++;

      await this.logger.debug("Cache exists check", {
        key,
        exists: exists === 1,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "exists",
          },
        );
      }

      return exists === 1;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache exists error", {
        key,
        error: error.message,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_errors", 1, {
          operation: "exists",
          key,
        });
      }

      return false;
    }
  }

  async clear(pattern?: string): Promise<void> {
    const startTime = Date.now();

    try {
      let deletedKeys: string[] = [];

      if (pattern) {
        // Use SCAN to find keys matching pattern
        const stream = this.redis.scanStream({
          match: pattern,
          count: 100,
        });

        const keysToDelete: string[] = [];
        stream.on("data", (keys) => {
          keysToDelete.push(...keys);
        });

        await new Promise((resolve, reject) => {
          stream.on("end", resolve);
          stream.on("error", reject);
        });

        if (keysToDelete.length > 0) {
          const deleted = await this.redis.del(...keysToDelete);
          deletedKeys = keysToDelete;

          await this.logger.info("Cache pattern clear", {
            pattern,
            keysDeleted: deleted,
            totalKeys: keysToDelete.length,
          });
        }
      } else {
        // Clear entire database
        await this.redis.flushdb();

        await this.logger.info("Cache cleared entirely");
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.deletes += deletedKeys.length;
      this.operationMetrics.totalOperations++;

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_clears", 1, {
          pattern: pattern || "all",
        });
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "clear",
          },
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache clear error", {
        pattern,
        error: error.message,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_errors", 1, {
          operation: "clear",
          pattern,
        });
      }

      throw error;
    }
  }

  // Advanced cache operations

  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    const startTime = Date.now();

    try {
      const values = await this.redis.mget(...keys);
      const responseTime = Date.now() - startTime;

      const parsedValues = values.map((value) => {
        if (value === null) {
          return;
        }

        try {
          return JSON.parse(value) as T;
        } catch {
          return value as unknown as T;
        }
      });

      const hits = parsedValues.filter((v) => v !== null).length;
      const misses = keys.length - hits;

      this.operationMetrics.hits += hits;
      this.operationMetrics.misses += misses;
      this.operationMetrics.totalOperations++;
      this.recordResponseTime(responseTime);
      this.updateHitRate();

      await this.logger.debug("Cache mget", {
        keysRequested: keys.length,
        hits,
        misses,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_mget_operations", 1);
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "mget",
          },
        );
      }

      return parsedValues;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache mget error", {
        keys,
        error: error.message,
        responseTime,
      });

      return keys.map(() => {});
    }
  }

  async mset<T>(
    keyValuePairs: { key: string; value: T; ttl?: number }[],
  ): Promise<void> {
    const startTime = Date.now();

    try {
      const pipeline = this.redis.pipeline();

      for (const { key, value, ttl } of keyValuePairs) {
        const serializedValue = this.serializeValue(value);
        const effectiveTTL = ttl || this.config.defaultTTL;

        if (effectiveTTL > 0) {
          pipeline.setex(key, effectiveTTL, serializedValue);
        } else {
          pipeline.set(key, serializedValue);
        }
      }

      await pipeline.exec();

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.sets += keyValuePairs.length;
      this.operationMetrics.totalOperations++;

      await this.logger.debug("Cache mset", {
        keysSet: keyValuePairs.length,
        responseTime,
      });

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_mset_operations", 1);
        await this.metrics.recordHistogram(
          "cache_response_time",
          responseTime,
          {
            operation: "mset",
          },
        );
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);
      this.operationMetrics.errors++;
      this.operationMetrics.totalOperations++;

      await this.logger.error("Cache mset error", {
        keyCount: keyValuePairs.length,
        error: error.message,
        responseTime,
      });

      throw error;
    }
  }

  async increment(key: string, increment = 1): Promise<number> {
    try {
      const newValue = await this.redis.incrby(key, increment);

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_increments", 1, { key });
      }

      return newValue;
    } catch (error) {
      await this.logger.error("Cache increment error", {
        key,
        increment,
        error: error.message,
      });

      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.redis.expire(key, ttl);

      await this.logger.debug("Cache expiration set", { key, ttl });
    } catch (error) {
      await this.logger.error("Cache expire error", {
        key,
        ttl,
        error: error.message,
      });

      throw error;
    }
  }

  // Health and monitoring methods

  async ping(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return response === "PONG";
    } catch (error) {
      await this.logger.error("Cache ping error", { error: error.message });
      return false;
    }
  }

  async getInfo(): Promise<any> {
    try {
      const info = await this.redis.info();
      return info;
    } catch (error) {
      await this.logger.error("Cache info error", { error: error.message });
      return;
    }
  }

  getMetrics(): CacheMetrics {
    return { ...this.operationMetrics };
  }

  // Private helper methods

  private setupEventHandlers(): void {
    this.redis.on("connect", () => {
      this.logger.info("Redis cache connected");
    });

    this.redis.on("ready", () => {
      this.logger.info("Redis cache ready");
    });

    this.redis.on("error", (error) => {
      this.logger.error("Redis cache error", { error: error.message });
    });

    this.redis.on("close", () => {
      this.logger.warn("Redis cache connection closed");
    });

    this.redis.on("reconnecting", () => {
      this.logger.info("Redis cache reconnecting");
    });
  }

  private serializeValue<T>(value: T): string {
    if (typeof value === "string") {
      return value;
    }

    return JSON.stringify(value);
  }

  private async compressValue(value: string): Promise<string> {
    // Simple compression placeholder - in production, use zlib or similar
    return value; // For now, return as-is
  }

  private recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes = this.responseTimes.slice(-1000);
    }

    // Update average response time
    this.operationMetrics.avgResponseTime =
      this.responseTimes.reduce((sum, time) => sum + time, 0) /
      this.responseTimes.length;
  }

  private updateHitRate(): void {
    const totalHitsAndMisses =
      this.operationMetrics.hits + this.operationMetrics.misses;
    this.operationMetrics.hitRate =
      totalHitsAndMisses > 0
        ? (this.operationMetrics.hits / totalHitsAndMisses) * 100
        : 0;
  }

  private startMetricsReporting(): void {
    if (!this.config.enableMetrics) {
      return;
    }

    // Report metrics every 60 seconds
    setInterval(async () => {
      const metrics = this.getMetrics();

      await this.metrics.recordGauge("cache_hit_rate", metrics.hitRate);
      await this.metrics.recordGauge(
        "cache_avg_response_time",
        metrics.avgResponseTime,
      );
      await this.metrics.recordGauge(
        "cache_total_operations",
        metrics.totalOperations,
      );
      await this.metrics.recordGauge("cache_errors", metrics.errors);

      await this.logger.info("Cache metrics report", metrics);
    }, 60_000);
  }

  // Cleanup method
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      await this.logger.info("Redis cache disconnected cleanly");
    } catch (error) {
      await this.logger.error("Error disconnecting Redis cache", {
        error: error.message,
      });
    }
  }
}

// Cache service factory
export class CacheServiceFactory {
  private static instance: CacheService;

  public static createCacheService(
    config: CacheConfig,
    logger: LoggerService,
    metrics: MetricsService,
  ): CacheService {
    if (!CacheServiceFactory.instance) {
      CacheServiceFactory.instance = new RedisCacheService(
        config,
        logger,
        metrics,
      );
    }
    return CacheServiceFactory.instance;
  }

  public static getInstance(): CacheService {
    if (!CacheServiceFactory.instance) {
      throw new Error(
        "Cache service not initialized. Call createCacheService first.",
      );
    }
    return CacheServiceFactory.instance;
  }
}

// Cache configuration helper
export const createCacheConfig = (
  overrides: Partial<CacheConfig> = {},
): CacheConfig => {
  return {
    redis: {
      host: process.env.REDIS_HOST || "localhost",
      port: Number.parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
      database: Number.parseInt(process.env.REDIS_DATABASE || "0", 10),
      keyPrefix: process.env.REDIS_KEY_PREFIX || "neonpro:ai:",
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    },
    defaultTTL: Number.parseInt(process.env.CACHE_DEFAULT_TTL || "3600", 10), // 1 hour
    compressionThreshold: 1024, // 1KB
    enableMetrics: process.env.CACHE_ENABLE_METRICS === "true",
    ...overrides,
  };
};
