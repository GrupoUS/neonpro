import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { CacheOperation, CacheStats, SupabaseCacheConfig } from "./types";

export class SupabaseCacheLayer implements CacheOperation {
  private supabase: SupabaseClient;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    hitRate: 0,
    totalRequests: 0,
    averageResponseTime: 0,
  };
  private responseTimeBuffer: number[] = [];

  constructor(private config: SupabaseCacheConfig) {
    this.supabase = createClient(config.apiUrl, config.serviceKey, {
      auth: { persistSession: false },
      db: { schema: "public" },
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    try {
      const { data, error } = await this.supabase
        .from(this.config.tableName)
        .select("value, expires_at, tags, metadata")
        .eq("key", key)
        .single();

      if (error || !data) {
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      // Check if expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        // Delete expired entry
        await this.delete(key);
        this.stats.misses++;
        this.updateStats(startTime);
        return null;
      }

      this.stats.hits++;
      this.updateStats(startTime);

      // Healthcare audit trail
      if (data.metadata?.healthcareData) {
        await this.logHealthcareAccess(key, "CACHE_HIT");
      }

      return JSON.parse(data.value) as T;
    } catch (error) {
      this.stats.misses++;
      this.updateStats(startTime);
      console.error("Supabase cache get error:", error);
      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    options?: {
      healthcareData?: boolean;
      patientId?: string;
      auditContext?: string;
      tags?: string[];
    },
  ): Promise<void> {
    const effectiveTTL = Math.min(
      ttl || this.config.defaultTTL,
      this.config.maxSize || (24 * 60 * 60 * 1000), // 24 hours max
    );

    const expiresAt = new Date(Date.now() + effectiveTTL).toISOString();
    const serializedValue = JSON.stringify(value);

    const entry = {
      key,
      value: serializedValue,
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tags: options?.tags || [],
      metadata: {
        size_bytes: serializedValue.length,
        healthcareData: options?.healthcareData || false,
        patientId: options?.patientId,
        auditContext: options?.auditContext,
        compression: this.config.compressionEnabled ? "gzip" : null,
        encryption: this.config.encryptionEnabled ? "aes-256" : null,
        lastAccessed: new Date().toISOString(),
      },
    };

    try {
      const { error } = await this.supabase
        .from(this.config.tableName)
        .upsert(entry);

      if (error) {
        throw error;
      }

      // Healthcare audit trail
      if (options?.healthcareData) {
        await this.logHealthcareAccess(key, "CACHE_SET", options.auditContext);
      }
    } catch (error) {
      console.error("Supabase cache set error:", error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      // Get entry for audit trail before deletion
      const { data } = await this.supabase
        .from(this.config.tableName)
        .select("metadata")
        .eq("key", key)
        .single();

      const { error } = await this.supabase
        .from(this.config.tableName)
        .delete()
        .eq("key", key);

      if (error) {
        throw error;
      }

      // Healthcare audit trail
      if (data?.metadata?.healthcareData) {
        await this.logHealthcareAccess(key, "CACHE_DELETE");
      }
    } catch (error) {
      console.error("Supabase cache delete error:", error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.config.tableName)
        .delete()
        .neq("key", ""); // Delete all entries

      if (error) {
        throw error;
      }

      this.resetStats();
    } catch (error) {
      console.error("Supabase cache clear error:", error);
      throw error;
    }
  }

  async getStats(): Promise<CacheStats> {
    this.stats.hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests) * 100
      : 0;
    return { ...this.stats };
  }

  async invalidateByTags(tags: string[]): Promise<void> {
    try {
      for (const tag of tags) {
        const { error } = await this.supabase
          .from(this.config.tableName)
          .delete()
          .contains("tags", [tag]);

        if (error) {
          console.error(`Error invalidating cache for tag ${tag}:`, error);
        }
      }
    } catch (error) {
      console.error("Supabase cache invalidateByTags error:", error);
      throw error;
    }
  }

  // Healthcare-specific methods
  async clearPatientData(patientId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.config.tableName)
        .delete()
        .eq("metadata->>patientId", patientId);

      if (error) {
        throw error;
      }

      await this.logHealthcareAccess(`patient:${patientId}:*`, "PATIENT_DATA_CLEARED");
    } catch (error) {
      console.error("Supabase cache clearPatientData error:", error);
      throw error;
    }
  }

  async getHealthcareAuditTrail(patientId?: string): Promise<any[]> {
    try {
      let query = this.supabase
        .from("cache_audit_log")
        .select("*")
        .order("created_at", { ascending: false });

      if (patientId) {
        query = query.eq("patient_id", patientId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error getting healthcare audit trail:", error);
      return [];
    }
  }

  // Cleanup expired entries
  async cleanupExpiredEntries(): Promise<number> {
    try {
      const { data, error } = await this.supabase
        .from(this.config.tableName)
        .delete()
        .lt("expires_at", new Date().toISOString())
        .select("key");

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error) {
      console.error("Supabase cache cleanup error:", error);
      return 0;
    }
  }

  // Get cache health metrics
  async getHealthMetrics(): Promise<{
    totalEntries: number;
    totalSizeBytes: number;
    expiredEntries: number;
    healthcareEntries: number;
  }> {
    try {
      const { data: allEntries, error: allError } = await this.supabase
        .from(this.config.tableName)
        .select("metadata, expires_at");

      if (allError) {
        throw allError;
      }

      const now = new Date();
      let totalSizeBytes = 0;
      let expiredEntries = 0;
      let healthcareEntries = 0;

      allEntries?.forEach(entry => {
        if (entry.metadata?.size_bytes) {
          totalSizeBytes += entry.metadata.size_bytes;
        }
        if (entry.expires_at && new Date(entry.expires_at) < now) {
          expiredEntries++;
        }
        if (entry.metadata?.healthcareData) {
          healthcareEntries++;
        }
      });

      return {
        totalEntries: allEntries?.length || 0,
        totalSizeBytes,
        expiredEntries,
        healthcareEntries,
      };
    } catch (error) {
      console.error("Error getting cache health metrics:", error);
      return {
        totalEntries: 0,
        totalSizeBytes: 0,
        expiredEntries: 0,
        healthcareEntries: 0,
      };
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

  private async logHealthcareAccess(
    key: string,
    operation: string,
    context?: string,
  ): Promise<void> {
    try {
      // Log to audit table
      await this.supabase
        .from("cache_audit_log")
        .insert({
          key,
          operation,
          context,
          timestamp: new Date().toISOString(),
          project_id: this.config.projectId,
        });
    } catch (error) {
      // Silent fail - audit logging shouldn't break cache operations
      console.debug("Healthcare audit logging failed:", error);
    }
  }
}
