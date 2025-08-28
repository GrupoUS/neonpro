import { createClient } from "@supabase/supabase-js";
import type { CacheService, LoggerService, MetricsService } from "../types";

interface CacheConfig {
  supabase: {
    url: string;
    serviceKey: string;
    tableName: string;
    keyPrefix: string;
    maxRetries: number;
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

export class SupabaseCacheService implements CacheService {
  private readonly supabase: unknown;
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

    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey,
      {
        auth: { persistSession: false },
        db: { schema: "public" },
      },
    );

    this.setupEventHandlers();
  }

  async get<T = any>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const fullKey = `${this.config.supabase.keyPrefix}${key}`;

      const { data, error } = await this.supabase
        .from(this.config.supabase.tableName)
        .select("value, expires_at")
        .eq("key", fullKey)
        .single();

      if (error || !data) {
        this.operationMetrics.misses++;
        this.operationMetrics.totalOperations++;
        this.updateHitRate();
        return;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Delete expired entry
        await this.delete(key);
        this.operationMetrics.misses++;
        this.operationMetrics.totalOperations++;
        this.updateHitRate();
        return;
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);

      this.operationMetrics.hits++;
      this.operationMetrics.totalOperations++;
      this.updateHitRate();

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_hits", 1, { key });
        await this.metrics.recordTimer("cache_get_duration", responseTime, {
          key,
        });
      }

      return this.deserializeValue(data.value);
    } catch (error) {
      this.operationMetrics.errors++;
      await this.logger.error("Cache get error", { key, error: error.message });
      return;
    }
  }

  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const startTime = Date.now();
    const effectiveTTL = ttl ?? this.config.defaultTTL;

    try {
      const fullKey = `${this.config.supabase.keyPrefix}${key}`;
      const serializedValue = this.serializeValue(value);
      const expiresAt = effectiveTTL > 0
        ? new Date(Date.now() + effectiveTTL * 1000)
        : undefined;

      const { error } = await this.supabase
        .from(this.config.supabase.tableName)
        .upsert({
          key: fullKey,
          value: serializedValue,
          expires_at: expiresAt,
          created_at: new Date(),
          updated_at: new Date(),
        });

      if (error) {
        throw error;
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);

      this.operationMetrics.sets++;
      this.operationMetrics.totalOperations++;

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_sets", 1, { key });
        await this.metrics.recordTimer("cache_set_duration", responseTime, {
          key,
        });
      }

      await this.logger.debug("Cache set", { key, ttl: effectiveTTL });
    } catch (error) {
      this.operationMetrics.errors++;
      await this.logger.error("Cache set error", { key, error: error.message });
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    const startTime = Date.now();

    try {
      const fullKey = `${this.config.supabase.keyPrefix}${key}`;

      const { error } = await this.supabase
        .from(this.config.supabase.tableName)
        .delete()
        .eq("key", fullKey);

      if (error) {
        throw error;
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);

      this.operationMetrics.deletes++;
      this.operationMetrics.totalOperations++;

      if (this.config.enableMetrics) {
        await this.metrics.recordCounter("cache_deletes", 1, { key });
        await this.metrics.recordTimer("cache_delete_duration", responseTime, {
          key,
        });
      }

      await this.logger.debug("Cache delete", { key });
    } catch (error) {
      this.operationMetrics.errors++;
      await this.logger.error("Cache delete error", {
        key,
        error: error.message,
      });
      throw error;
    }
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async clear(pattern?: string): Promise<{ deletedKeys: string[]; }> {
    const startTime = Date.now();
    let deletedKeys: string[] = [];

    try {
      if (pattern) {
        // Get keys matching pattern
        const { data, error } = await this.supabase
          .from(this.config.supabase.tableName)
          .select("key")
          .like("key", `${this.config.supabase.keyPrefix}${pattern}`);

        if (error) {
          throw error;
        }

        if (data && data.length > 0) {
          const keysToDelete = data.map((item) => item.key);

          const { error: deleteError } = await this.supabase
            .from(this.config.supabase.tableName)
            .delete()
            .in("key", keysToDelete);

          if (deleteError) {
            throw deleteError;
          }

          deletedKeys = keysToDelete;
        }
      } else {
        // Clear all entries with our prefix
        const { error } = await this.supabase
          .from(this.config.supabase.tableName)
          .delete()
          .like("key", `${this.config.supabase.keyPrefix}%`);

        if (error) {
          throw error;
        }

        deletedKeys = ["*"]; // Indicate all keys deleted
      }

      const responseTime = Date.now() - startTime;
      this.recordResponseTime(responseTime);

      await this.logger.info("Cache cleared", {
        pattern,
        deletedCount: deletedKeys.length,
      });

      return { deletedKeys };
    } catch (error) {
      this.operationMetrics.errors++;
      await this.logger.error("Cache clear error", {
        pattern,
        error: error.message,
      });
      throw error;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from(this.config.supabase.tableName)
        .select("count", { count: "exact", head: true });

      return !error;
    } catch (error) {
      await this.logger.error("Cache ping error", { error: error.message });
      return false;
    }
  }

  async getInfo(): Promise<unknown> {
    try {
      const { count } = await this.supabase
        .from(this.config.supabase.tableName)
        .select("*", { count: "exact", head: true });

      return {
        type: "supabase",
        table: this.config.supabase.tableName,
        total_keys: count,
        hit_rate: this.operationMetrics.hitRate,
        avg_response_time: this.operationMetrics.avgResponseTime,
      };
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
    // Supabase doesn't have events like Redis, but we can add health checks
    this.logger.info("Supabase cache service initialized");
  }

  private serializeValue<T>(value: T): string {
    if (typeof value === "string") {
      return value;
    }

    const serialized = JSON.stringify(value);

    if (serialized.length > this.config.compressionThreshold) {
      // Could add compression here if needed
      return serialized;
    }

    return serialized;
  }

  private deserializeValue<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  private recordResponseTime(responseTime: number): void {
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.operationMetrics.avgResponseTime = this.responseTimes.reduce((sum, time) => sum + time, 0)
      / this.responseTimes.length;
  }

  private updateHitRate(): void {
    const totalHitsAndMisses = this.operationMetrics.hits + this.operationMetrics.misses;
    this.operationMetrics.hitRate = totalHitsAndMisses > 0
      ? (this.operationMetrics.hits / totalHitsAndMisses) * 100
      : 0;
  }

  // Cleanup method
  async disconnect(): Promise<void> {
    try {
      // Supabase client doesn't need explicit disconnection
      await this.logger.info("Supabase cache service disconnected cleanly");
    } catch (error) {
      await this.logger.error("Error disconnecting Supabase cache service", {
        error: error.message,
      });
    }
  }
}

// Export as default for backward compatibility
export default SupabaseCacheService;
