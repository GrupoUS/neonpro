// Cache Management Service for AI Services
// High-performance caching with TTL, tagging, invalidation, and analytics using Supabase

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { EnhancedAIService } from "./enhanced-service-base";
import type { AIServiceInput, AIServiceOutput } from "./enhanced-service-base";

// Cache Types and Interfaces
export interface CacheEntry {
  id: string;
  key: string;
  value: string; // JSON stringified value
  namespace: string;
  ttl_seconds: number;
  tags: string[];
  metadata: CacheMetadata;
  created_at: string;
  expires_at: string;
  last_accessed?: string;
  access_count?: number;
}

export interface CacheMetadata {
  size_bytes: number;
  compression?: string;
  content_type?: string;
  source_service?: string;
  version?: string;
  access_pattern?: "read_heavy" | "write_heavy" | "balanced";
  priority?: "low" | "medium" | "high" | "critical";
  dependent_keys?: string[];
}

// Input/Output interfaces
export interface CacheInput extends AIServiceInput {
  action:
    | "get"
    | "set"
    | "delete"
    | "exists"
    | "clear"
    | "stats"
    | "cleanup"
    | "bulk_get"
    | "bulk_set";
  key?: string;
  keys?: string[];
  value?: unknown;
  ttl?: number;
  namespace?: string;
  tags?: string[];
  metadata?: Partial<CacheMetadata>;
  pattern?: string;
  bulk_data?: {
    key: string;
    value: unknown;
    ttl?: number;
    tags?: string[];
    metadata?: Partial<CacheMetadata>;
  }[];
}

export interface CacheOutput extends AIServiceOutput {
  value?: unknown;
  exists?: boolean;
  deleted_count?: number;
  stats?: CacheStats;
  bulk_results?: {
    key: string;
    value?: unknown;
    success: boolean;
    error?: string;
  }[];
}

// Cache Statistics Interface
export interface CacheStats {
  total_entries: number;
  total_size_bytes: number;
  hit_rate_percentage: number;
  miss_rate_percentage: number;
  average_ttl_seconds: number;
  performance: {
    hits_last_hour: number;
    misses_last_hour: number;
    sets_last_hour: number;
    deletes_last_hour: number;
  };
  memory_usage: {
    database_cache_size: number;
  };
}

// Cache Management Service Implementation
export class CacheManagementService extends EnhancedAIService<
  CacheInput,
  CacheOutput
> {
  private readonly supabase: SupabaseClient;
  private readonly cacheStats: Map<string, number> = new Map();
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly MAX_VALUE_SIZE = 1024 * 1024; // 1MB
  private readonly CACHE_TABLE = "cache_entries";

  constructor() {
    super("cache_management_service");

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Start cleanup interval
    this.startCleanupInterval();
  }

  private async initializeSupabaseConnection(): Promise<void> {
    try {
      // Test connection with a simple query
      const { error } = await this.supabase
        .from(this.CACHE_TABLE)
        .select("count", { count: "exact", head: true });

      if (error) {
        // console.warn("Supabase cache connection test failed:", error);
      }
    } catch {
      // console.warn("Supabase cache service initialization failed");
    }
  }

  protected async executeCore(input: CacheInput): Promise<CacheOutput> {
    const startTime = performance.now();

    try {
      switch (input.action) {
        case "get":
          return await this.getCacheEntry(input);
        case "set":
          return await this.setCacheEntry(input);
        case "delete":
          return await this.deleteCacheEntry(input);
        case "exists":
          return await this.checkCacheEntryExists(input);
        case "clear":
          return await this.clearCache(input);
        case "stats":
          return await this.getCacheStats();
        case "cleanup":
          return await this.cleanupExpiredEntries();
        case "bulk_get":
          return await this.bulkGetCacheEntries(input);
        case "bulk_set":
          return await this.bulkSetCacheEntries(input);
        default:
          return {
            success: false,
            error: `Unsupported cache action: ${input.action}`,
            execution_time_ms: performance.now() - startTime,
          };
      }
    } finally {
      const duration = performance.now() - startTime;
      await this.recordMetric("cache_operation", {
        action: input.action,
        duration_ms: duration,
      });
    }
  }

  private async getCacheEntry(input: CacheInput): Promise<CacheOutput> {
    if (!input.key) {
      return { success: false, error: "Key is required for get operation" };
    }

    const namespace = input.namespace || "default";
    const fullKey = `${namespace}:${input.key}`;
    const startTime = performance.now();

    try {
      // Check database
      const { data, error } = await this.supabase
        .from(this.CACHE_TABLE)
        .select("*")
        .eq("key", fullKey)
        .single();

      if (error || !data) {
        this.incrementStat("cache_misses");
        return {
          success: true,
          value: undefined,
          exists: false,
          execution_time_ms: performance.now() - startTime,
        };
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      if (expiresAt <= now) {
        // Delete expired entry
        await this.supabase
          .from(this.CACHE_TABLE)
          .delete()
          .eq("key", fullKey);

        this.incrementStat("cache_misses");
        return {
          success: true,
          value: undefined,
          exists: false,
          execution_time_ms: performance.now() - startTime,
        };
      }

      this.incrementStat("db_cache_hits");

      // Update access statistics
      this.updateAccessStats(fullKey).catch(console.error);

      return {
        success: true,
        value: JSON.parse(data.value),
        exists: true,
        execution_time_ms: performance.now() - startTime,
      };
    } catch (error) {
      this.incrementStat("cache_errors");
      return {
        success: false,
        error: `Cache get error: ${error.message}`,
        execution_time_ms: performance.now() - startTime,
      };
    }
  }

  private async setCacheEntry(input: CacheInput): Promise<CacheOutput> {
    if (!input.key || input.value === undefined) {
      return {
        success: false,
        error: "Key and value are required for set operation",
      };
    }

    const namespace = input.namespace || "default";
    const fullKey = `${namespace}:${input.key}`;
    const ttlSeconds = input.ttl || this.DEFAULT_TTL;
    const serializedValue = JSON.stringify(input.value);

    if (serializedValue.length > this.MAX_VALUE_SIZE) {
      return {
        success: false,
        error: `Value size exceeds maximum limit of ${this.MAX_VALUE_SIZE} bytes`,
      };
    }

    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

    // Store in database
    const cacheEntry: Partial<CacheEntry> = {
      key: fullKey,
      value: serializedValue,
      namespace,
      ttl_seconds: ttlSeconds,
      tags: input.tags || [],
      metadata: {
        size_bytes: serializedValue.length,
        content_type: "application/json",
        source_service: this.serviceName,
        version: "1.0",
        priority: input.metadata?.priority || "medium",
        ...input.metadata,
      },
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      access_count: 0,
    };

    try {
      const { error } = await this.supabase
        .from(this.CACHE_TABLE)
        .upsert(cacheEntry);

      if (error) {
        throw error;
      }

      this.incrementStat("cache_sets");

      return { success: true };
    } catch (error) {
      this.incrementStat("cache_errors");
      return {
        success: false,
        error: `Cache set error: ${error.message}`,
      };
    }
  }

  private async deleteCacheEntry(input: CacheInput): Promise<CacheOutput> {
    if (!input.key) {
      return { success: false, error: "Key is required for delete operation" };
    }

    const namespace = input.namespace || "default";
    const fullKey = `${namespace}:${input.key}`;

    // Delete from database
    const { error } = await this.supabase
      .from(this.CACHE_TABLE)
      .delete()
      .eq("key", fullKey);

    if (error) {
      this.incrementStat("cache_errors");
      return { success: false, error: `Cache delete error: ${error.message}` };
    }

    this.incrementStat("cache_deletes");
    return { success: true };
  }

  private async checkCacheEntryExists(input: CacheInput): Promise<CacheOutput> {
    if (!input.key) {
      return { success: false, error: "Key is required for exists operation" };
    }

    const namespace = input.namespace || "default";
    const fullKey = `${namespace}:${input.key}`;

    try {
      const { data, error } = await this.supabase
        .from(this.CACHE_TABLE)
        .select("expires_at")
        .eq("key", fullKey)
        .single();

      if (error || !data) {
        return { success: true, exists: false };
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(data.expires_at);
      const exists = expiresAt > now;

      return { success: true, exists };
    } catch (error) {
      return { success: false, error: `Cache exists error: ${error.message}` };
    }
  }

  private async clearCache(input: CacheInput): Promise<CacheOutput> {
    let deletedCount = 0;

    try {
      if (input.pattern) {
        // Pattern-based deletion
        const { data, error } = await this.supabase
          .from(this.CACHE_TABLE)
          .select("key")
          .like("key", `%${input.pattern}%`);

        if (!error && data) {
          deletedCount = data.length;

          await this.supabase
            .from(this.CACHE_TABLE)
            .delete()
            .like("key", `%${input.pattern}%`);
        }
      } else if (input.tags && input.tags.length > 0) {
        // Tag-based invalidation
        const { data, error } = await this.supabase
          .from(this.CACHE_TABLE)
          .select("key")
          .contains("tags", input.tags);

        if (!error && data) {
          const keys = data.map((item) => item.key);
          deletedCount = keys.length;

          const { error: deleteError } = await this.supabase
            .from(this.CACHE_TABLE)
            .delete()
            .in("key", keys);

          if (deleteError) {
            throw deleteError;
          }
        }
      } else if (input.namespace) {
        // Namespace-based deletion
        const namespacePattern = `${input.namespace}:%`;
        const { data, error } = await this.supabase
          .from(this.CACHE_TABLE)
          .select("key")
          .like("key", namespacePattern);

        if (!error && data) {
          deletedCount = data.length;

          await this.supabase
            .from(this.CACHE_TABLE)
            .delete()
            .like("key", namespacePattern);
        }
      }

      this.incrementStat("cache_clears");

      return {
        success: true,
        deleted_count: deletedCount,
      };
    } catch (error) {
      this.incrementStat("cache_errors");
      return {
        success: false,
        error: `Cache clear error: ${error.message}`,
      };
    }
  }

  private async getCacheStats(): Promise<CacheOutput> {
    try {
      // Get total entries and size from database
      const { data: entries, error: entriesError } = await this.supabase
        .from(this.CACHE_TABLE)
        .select("metadata");

      if (entriesError) {
        throw entriesError;
      }

      const totalEntries = entries?.length || 0;
      let totalSizeBytes = 0;

      entries?.forEach((entry) => {
        if (entry.metadata?.size_bytes) {
          totalSizeBytes += entry.metadata.size_bytes;
        }
      });

      // Get runtime statistics
      const hitCount = this.getStat("cache_hits") + this.getStat("db_cache_hits");
      const missCount = this.getStat("cache_misses");
      const totalRequests = hitCount + missCount;
      const hitRate = totalRequests > 0 ? (hitCount / totalRequests) * 100 : 0;
      const missRate = 100 - hitRate;

      const stats: CacheStats = {
        total_entries: totalEntries,
        total_size_bytes: totalSizeBytes,
        hit_rate_percentage: hitRate,
        miss_rate_percentage: missRate,
        average_ttl_seconds: this.DEFAULT_TTL, // Could be calculated from actual data
        performance: {
          hits_last_hour: this.getStat("cache_hits") + this.getStat("db_cache_hits"),
          misses_last_hour: this.getStat("cache_misses"),
          sets_last_hour: this.getStat("cache_sets"),
          deletes_last_hour: this.getStat("cache_deletes"),
        },
        memory_usage: {
          database_cache_size: totalSizeBytes,
        },
      };

      return {
        success: true,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error: `Cache stats error: ${error.message}`,
      };
    }
  }

  private async cleanupExpiredEntries(): Promise<CacheOutput> {
    try {
      // Delete expired entries
      const { data, error } = await this.supabase
        .from(this.CACHE_TABLE)
        .delete()
        .lt("expires_at", new Date().toISOString())
        .select("key");

      let cleanedCount = 0;
      if (data && data.length > 0) {
        cleanedCount = data.length;
      }

      return {
        success: true,
        deleted_count: cleanedCount,
      };
    } catch (error) {
      return {
        success: false,
        error: `Cache cleanup error: ${error.message}`,
      };
    }
  }

  private async bulkGetCacheEntries(input: CacheInput): Promise<CacheOutput> {
    if (!input.keys || input.keys.length === 0) {
      return { success: false, error: "Keys array is required for bulk get" };
    }

    const namespace = input.namespace || "default";
    const fullKeys = input.keys.map((key) => `${namespace}:${key}`);
    const values: Record<string, unknown> = {};

    try {
      const { data, error } = await this.supabase
        .from(this.CACHE_TABLE)
        .select("key, value, expires_at")
        .in("key", fullKeys);

      if (error) {
        throw error;
      }

      // Process results
      data?.forEach((item) => {
        // Check if expired
        const now = new Date();
        const expiresAt = new Date(item.expires_at);

        if (expiresAt > now) {
          // Find original key
          const originalKey = input.keys?.find(key => `${namespace}:${key}` === item.key);
          if (originalKey) {
            values[originalKey] = JSON.parse(item.value);
          }
        }
      });

      this.incrementStat("bulk_cache_gets");

      return {
        success: true,
        value: values,
      };
    } catch (error) {
      return {
        success: false,
        error: `Bulk cache get error: ${error.message}`,
      };
    }
  }

  private async bulkSetCacheEntries(input: CacheInput): Promise<CacheOutput> {
    if (!input.bulk_data || input.bulk_data.length === 0) {
      return { success: false, error: "bulk_data array is required" };
    }

    const namespace = input.namespace || "default";
    const results: { key: string; success: boolean; error?: string; }[] = [];

    const cacheEntries: Partial<CacheEntry>[] = [];

    for (const item of input.bulk_data) {
      try {
        const fullKey = `${namespace}:${item.key}`;
        const serializedValue = JSON.stringify(item.value);
        const ttlSeconds = item.ttl || this.DEFAULT_TTL;

        if (serializedValue.length > this.MAX_VALUE_SIZE) {
          results.push({
            key: item.key,
            success: false,
            error: `Value size exceeds maximum limit`,
          });
          continue;
        }

        const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();

        cacheEntries.push({
          key: fullKey,
          value: serializedValue,
          namespace,
          ttl_seconds: ttlSeconds,
          tags: item.tags || [],
          metadata: {
            size_bytes: serializedValue.length,
            content_type: "application/json",
            source_service: this.serviceName,
            version: "1.0",
            priority: item.metadata?.priority || "medium",
            ...item.metadata,
          },
          created_at: new Date().toISOString(),
          expires_at: expiresAt,
        });

        results.push({ key: item.key, success: true });
      } catch (error) {
        results.push({
          key: item.key,
          success: false,
          error: error.message,
        });
      }
    }

    // Bulk insert to database
    try {
      const { error } = await this.supabase
        .from(this.CACHE_TABLE)
        .upsert(cacheEntries);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Mark all as failed if bulk operation fails
      results.forEach(result => {
        result.success = false;
        result.error = `Bulk operation failed: ${error.message}`;
      });
    }

    this.incrementStat("bulk_cache_sets");

    return {
      success: true,
      bulk_results: results,
    };
  }

  // Utility Methods
  private incrementStat(statName: string): void {
    const current = this.cacheStats.get(statName) || 0;
    this.cacheStats.set(statName, current + 1);
  }

  private getStat(statName: string): number {
    return this.cacheStats.get(statName) || 0;
  }

  private async updateAccessStats(key: string): Promise<void> {
    try {
      await this.supabase
        .from(this.CACHE_TABLE)
        .update({
          last_accessed: new Date().toISOString(),
          access_count: this.supabase.sql`COALESCE(access_count, 0) + 1`,
        })
        .eq("key", key);
    } catch (error) {
      // Silently fail - access stats are not critical
      // console.debug(`Failed to update access stats for key ${key}:`, error);
    }
  }

  private startCleanupInterval(): void {
    // Run cleanup every hour
    setInterval(async () => {
      try {
        await this.cleanupExpiredEntries();
      } catch (error) {
        // console.error("Cache cleanup interval error:", error);
      }
    }, 3_600_000); // 1 hour
  }
}

// Export instance and class
export const cacheManagementService = new CacheManagementService();
export default CacheManagementService;
