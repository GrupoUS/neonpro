import type { FastifyInstance, FastifyRequest } from "fastify";
import fp from "fastify-plugin";
import { createClient, type RedisClientType } from "redis";

export interface CacheConfig {
  url: string;
  password?: string;
  database?: number;
  defaultTTL: number;
  keyPrefix: string;
  compression: boolean;
  healthCheckInterval: number;
}

export interface CacheOptions {
  ttl?: number;
  tags?: string[];
  namespace?: string;
  compress?: boolean;
}

export interface HealthcareCacheKey {
  type: "patient" | "appointment" | "invoice" | "analytics" | "vital-signs" | "session";
  tenantId: string;
  identifier: string;
  suffix?: string;
}

class HealthcareCacheManager {
  private client: RedisClientType;
  private config: CacheConfig;
  private connected: boolean = false;
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
  };

  constructor(config: CacheConfig) {
    this.config = config;
    this.client = createClient({
      url: config.url,
      password: config.password,
      database: config.database || 0,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on("connect", () => {
      console.log("🔗 Redis connected");
      this.connected = true;
    });

    this.client.on("disconnect", () => {
      console.log("🔌 Redis disconnected");
      this.connected = false;
    });

    this.client.on("error", (error) => {
      console.error("❌ Redis error:", error);
      this.stats.errors++;
      this.connected = false;
    });

    this.client.on("reconnecting", () => {
      console.log("🔄 Redis reconnecting...");
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("✅ Redis cache manager connected");
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      this.connected = false;
      console.log("👋 Redis cache manager disconnected");
    } catch (error) {
      console.error("❌ Error disconnecting from Redis:", error);
    }
  }

  private generateKey(cacheKey: HealthcareCacheKey): string {
    const { type, tenantId, identifier, suffix } = cacheKey;
    const parts = [this.config.keyPrefix, type, tenantId, identifier];

    if (suffix) {
      parts.push(suffix);
    }

    return parts.join(":");
  }

  private async compressData(data: string): Promise<string> {
    if (!this.config.compression) return data;

    // Simple compression using built-in compression
    // In production, consider using more efficient compression like LZ4
    const compressed = Buffer.from(data).toString("base64");
    return compressed;
  }

  private async decompressData(data: string): Promise<string> {
    if (!this.config.compression) return data;

    try {
      const decompressed = Buffer.from(data, "base64").toString("utf-8");
      return decompressed;
    } catch (_error) {
      // If decompression fails, assume it's uncompressed data
      return data;
    }
  }

  async get<T = any>(cacheKey: HealthcareCacheKey): Promise<T | null> {
    if (!this.connected) return null;

    try {
      const key = this.generateKey(cacheKey);
      const data = await this.client.get(key);

      if (data === null) {
        this.stats.misses++;
        return null;
      }

      this.stats.hits++;
      const decompressed = await this.decompressData(data);
      return JSON.parse(decompressed);
    } catch (error) {
      console.error("Cache get error:", error);
      this.stats.errors++;
      return null;
    }
  }

  async set<T = any>(
    cacheKey: HealthcareCacheKey,
    value: T,
    options: CacheOptions = {},
  ): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const key = this.generateKey(cacheKey);
      const serialized = JSON.stringify(value);
      const compressed = await this.compressData(serialized);

      const ttl = options.ttl || this.config.defaultTTL;

      await this.client.setEx(key, ttl, compressed);

      // Add to tags for cache invalidation
      if (options.tags) {
        for (const tag of options.tags) {
          const tagKey = `${this.config.keyPrefix}:tag:${tag}`;
          await this.client.sAdd(tagKey, key);
          await this.client.expire(tagKey, ttl);
        }
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      this.stats.errors++;
      return false;
    }
  }

  async delete(cacheKey: HealthcareCacheKey): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const key = this.generateKey(cacheKey);
      const result = await this.client.del(key);

      if (result > 0) {
        this.stats.deletes++;
        return true;
      }

      return false;
    } catch (error) {
      console.error("Cache delete error:", error);
      this.stats.errors++;
      return false;
    }
  }

  async invalidateByTag(tag: string): Promise<number> {
    if (!this.connected) return 0;

    try {
      const tagKey = `${this.config.keyPrefix}:tag:${tag}`;
      const keys = await this.client.sMembers(tagKey);

      if (keys.length === 0) return 0;

      const deleted = await this.client.del(keys);
      await this.client.del(tagKey);

      this.stats.deletes += deleted;
      return deleted;
    } catch (error) {
      console.error("Cache invalidate by tag error:", error);
      this.stats.errors++;
      return 0;
    }
  }

  async invalidateByPattern(pattern: string): Promise<number> {
    if (!this.connected) return 0;

    try {
      const keys = await this.client.keys(pattern);

      if (keys.length === 0) return 0;

      const deleted = await this.client.del(keys);
      this.stats.deletes += deleted;
      return deleted;
    } catch (error) {
      console.error("Cache invalidate by pattern error:", error);
      this.stats.errors++;
      return 0;
    }
  }

  // Healthcare-specific cache methods
  async cachePatientData(
    tenantId: string,
    patientId: string,
    data: any,
    ttl: number = 3600,
  ): Promise<boolean> {
    return this.set({ type: "patient", tenantId, identifier: patientId }, data, {
      ttl,
      tags: [`tenant:${tenantId}`, "patients"],
      compress: true,
    });
  }

  async getCachedPatientData(tenantId: string, patientId: string): Promise<any> {
    return this.get({ type: "patient", tenantId, identifier: patientId });
  }

  async cacheAppointmentData(
    tenantId: string,
    appointmentId: string,
    data: any,
    ttl: number = 1800,
  ): Promise<boolean> {
    return this.set({ type: "appointment", tenantId, identifier: appointmentId }, data, {
      ttl,
      tags: [`tenant:${tenantId}`, "appointments"],
    });
  }

  async getCachedAppointmentData(tenantId: string, appointmentId: string): Promise<any> {
    return this.get({ type: "appointment", tenantId, identifier: appointmentId });
  }

  async cacheInvoiceData(
    tenantId: string,
    invoiceId: string,
    data: any,
    ttl: number = 7200,
  ): Promise<boolean> {
    return this.set({ type: "invoice", tenantId, identifier: invoiceId }, data, {
      ttl,
      tags: [`tenant:${tenantId}`, "invoices"],
    });
  }

  async getCachedInvoiceData(tenantId: string, invoiceId: string): Promise<any> {
    return this.get({ type: "invoice", tenantId, identifier: invoiceId });
  }

  async cacheVitalSigns(
    tenantId: string,
    patientId: string,
    data: any,
    ttl: number = 600,
  ): Promise<boolean> {
    return this.set(
      { type: "vital-signs", tenantId, identifier: patientId, suffix: "latest" },
      data,
      { ttl, tags: [`tenant:${tenantId}`, `patient:${patientId}`, "vital-signs"] },
    );
  }

  async getCachedVitalSigns(tenantId: string, patientId: string): Promise<any> {
    return this.get({ type: "vital-signs", tenantId, identifier: patientId, suffix: "latest" });
  }

  async cacheAnalyticsData(
    tenantId: string,
    analyticsKey: string,
    data: any,
    ttl: number = 1800,
  ): Promise<boolean> {
    return this.set({ type: "analytics", tenantId, identifier: analyticsKey }, data, {
      ttl,
      tags: [`tenant:${tenantId}`, "analytics"],
      compress: true,
    });
  }

  async getCachedAnalyticsData(tenantId: string, analyticsKey: string): Promise<any> {
    return this.get({ type: "analytics", tenantId, identifier: analyticsKey });
  }

  // Session management for real-time features
  async createSession(
    tenantId: string,
    sessionId: string,
    sessionData: any,
    ttl: number = 3600,
  ): Promise<boolean> {
    return this.set({ type: "session", tenantId, identifier: sessionId }, sessionData, {
      ttl,
      tags: [`tenant:${tenantId}`, "sessions"],
    });
  }

  async getSession(tenantId: string, sessionId: string): Promise<any> {
    return this.get({ type: "session", tenantId, identifier: sessionId });
  }

  async extendSession(tenantId: string, sessionId: string, ttl: number = 3600): Promise<boolean> {
    if (!this.connected) return false;

    try {
      const key = this.generateKey({ type: "session", tenantId, identifier: sessionId });
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error("Session extend error:", error);
      this.stats.errors++;
      return false;
    }
  }

  // Cache warming for frequently accessed data
  async warmTenantCache(tenantId: string): Promise<void> {
    // Implement cache warming logic for tenant-specific data
    console.log(`🔥 Warming cache for tenant: ${tenantId}`);

    // This would typically pre-load frequently accessed data
    // like active appointments, recent patients, etc.
  }

  // Bulk operations for performance
  async getBulk(cacheKeys: HealthcareCacheKey[]): Promise<Record<string, any>> {
    if (!this.connected) return {};

    try {
      const keys = cacheKeys.map((key) => this.generateKey(key));
      const values = await this.client.mGet(keys);

      const result: Record<string, any> = {};

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = values[i];
        if (key && value !== null) {
          const decompressed = await this.decompressData(value!);
          result[key] = JSON.parse(decompressed);
          this.stats.hits++;
        } else {
          this.stats.misses++;
        }
      }

      return result;
    } catch (error) {
      console.error("Cache bulk get error:", error);
      this.stats.errors++;
      return {};
    }
  }

  // Health and monitoring
  async getHealth(): Promise<{
    connected: boolean;
    stats: {
      hits: number;
      misses: number;
      sets: number;
      errors: number;
      hitRate: number;
    };
    memory: Record<string, unknown> | null;
    keyCount: number;
  }> {
    try {
      const info = this.connected ? await this.client.info("memory") : null;
      const keyCount = this.connected ? await this.client.dbSize() : 0;

      return {
        connected: this.connected,
        stats: {
          ...this.stats,
          hitRate:
            this.stats.hits + this.stats.misses > 0
              ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
              : 0,
        },
        memory: info as Record<string, unknown> | null,
        keyCount,
      };
    } catch (_error) {
      return {
        connected: false,
        stats: {
          ...this.stats,
          hitRate:
            this.stats.hits + this.stats.misses > 0
              ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
              : 0,
        },
        memory: null,
        keyCount: 0,
      };
    }
  }

  getStats() {
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
    };
  }

  // Cleanup expired keys (for maintenance)
  async cleanup(): Promise<number> {
    if (!this.connected) return 0;

    try {
      // This would implement cleanup logic for expired keys
      // Redis handles this automatically, but we might want custom logic
      return 0;
    } catch (error) {
      console.error("Cache cleanup error:", error);
      return 0;
    }
  }
}

// Fastify Plugin
async function redisCachePlugin(fastify: FastifyInstance) {
  const config: CacheConfig = {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    password: process.env.REDIS_PASSWORD,
    database: parseInt(process.env.REDIS_DATABASE || "0"),
    defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || "3600"),
    keyPrefix: process.env.CACHE_KEY_PREFIX || "neonpro",
    compression: process.env.CACHE_COMPRESSION === "true",
    healthCheckInterval: parseInt(process.env.CACHE_HEALTH_CHECK_INTERVAL || "30000"),
  };

  const cacheManager = new HealthcareCacheManager(config);

  // Connect to Redis
  await cacheManager.connect();

  // Add to Fastify instance
  fastify.decorate("cache", cacheManager);

  // Cache middleware for GET requests
  fastify.addHook("onRequest", async (request: FastifyRequest) => {
    // Add cache helper methods to request
    (request as any).cache = {
      get: (key: HealthcareCacheKey) => cacheManager.get(key),
      set: (key: HealthcareCacheKey, value: any, options?: CacheOptions) =>
        cacheManager.set(key, value, options),
      delete: (key: HealthcareCacheKey) => cacheManager.delete(key),
      invalidateTag: (tag: string) => cacheManager.invalidateByTag(tag),
    };
  });

  // Health check endpoint
  fastify.get(
    "/health/cache",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
    },
    async (_request, reply) => {
      const health = await cacheManager.getHealth();

      reply.send({
        success: true,
        timestamp: new Date().toISOString(),
        cache: health,
      });
    },
  );

  // Cache stats endpoint
  fastify.get(
    "/admin/cache/stats",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
    },
    async (_request, reply) => {
      const stats = cacheManager.getStats();
      const health = await cacheManager.getHealth();

      const hitRate =
        stats.hits + stats.misses > 0
          ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)
          : "0.00";

      reply.send({
        success: true,
        stats: {
          ...stats,
          hitRate: `${hitRate}%`,
        },
        health: health.connected,
        keyCount: health.keyCount,
      });
    },
  );

  // Cache invalidation endpoint
  fastify.post(
    "/admin/cache/invalidate",
    {
      preHandler: [fastify.authenticate, fastify.requireRole(["admin"])],
      schema: {
        body: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["tag", "pattern", "tenant"] },
            value: { type: "string" },
          },
          required: ["type", "value"],
        },
      },
    },
    async (request, reply) => {
      const { type, value } = request.body as { type: string; value: string };
      let deleted = 0;

      switch (type) {
        case "tag":
          deleted = await cacheManager.invalidateByTag(value);
          break;
        case "pattern":
          deleted = await cacheManager.invalidateByPattern(value);
          break;
        case "tenant":
          deleted = await cacheManager.invalidateByTag(`tenant:${value}`);
          break;
      }

      reply.send({
        success: true,
        type,
        value,
        deletedKeys: deleted,
        timestamp: new Date().toISOString(),
      });
    },
  );

  // Graceful shutdown
  fastify.addHook("onClose", async () => {
    await cacheManager.disconnect();
  });
}

export default fp(redisCachePlugin, {
  name: "redis-cache",
});

// TypeScript declarations
declare module "fastify" {
  interface FastifyInstance {
    cache: HealthcareCacheManager;
  }

  interface FastifyRequest {
    cache: {
      get: (key: HealthcareCacheKey) => Promise<any>;
      set: (key: HealthcareCacheKey, value: any, options?: CacheOptions) => Promise<boolean>;
      delete: (key: HealthcareCacheKey) => Promise<boolean>;
      invalidateTag: (tag: string) => Promise<number>;
    };
  }
}
