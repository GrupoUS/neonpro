import { AIContextCacheLayer } from "./ai-context-cache";
import { BrowserCacheLayer } from "./browser-cache";
import { EdgeCacheLayer } from "./edge-cache";
import { SupabaseCacheLayer } from "./supabase-cache";
import { CacheLayer } from "./types";
import type {
  AIContextCacheConfig,
  BrowserCacheConfig,
  CacheOperation,
  CacheStats,
  EdgeCacheConfig,
  HealthcareDataPolicy,
  SupabaseCacheConfig,
} from "./types";

interface AIConversation {
  messages: Array<{
    role: string;
    content: string;
    timestamp: Date;
  }>;
  context?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

interface AIMetadata {
  contextType: "conversation" | "knowledge" | "embedding" | "reasoning";
  importance: "low" | "medium" | "high" | "critical";
  userId: string;
  sessionId: string;
  topic?: string;
  lastUsed?: Date;
  accessFrequency?: number;
}

interface AuditTrailEntry {
  timestamp: string;
  operation: string;
  key: string;
  layer?: string;
  success: boolean;
  executionTime: number;
  metadata?: Record<string, unknown>;
}

interface CacheManagerStats {
  layers: {
    browser: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
      averageResponseTime: number;
    };
    edge: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
      averageResponseTime: number;
    };
    supabase: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
      averageResponseTime: number;
    };
    aiContext: {
      hits: number;
      misses: number;
      hitRate: number;
      totalRequests: number;
      averageResponseTime: number;
    };
  };
  overall: {
    totalHits: number;
    totalMisses: number;
    averageHitRate: number;
    totalOperations: number;
  };
  audit: {
    totalEntries: number;
    lastOperation?: string;
  };
}

export interface MultiLayerCacheConfig {
  supabase: SupabaseCacheConfig;
  browser?: BrowserCacheConfig;
  edge?: EdgeCacheConfig;
  aiContext?: AIContextCacheConfig;
}

export class MultiLayerCacheManager {
  private readonly browser: BrowserCacheLayer;
  private readonly edge: EdgeCacheLayer;
  private readonly supabase: SupabaseCacheLayer;
  private readonly aiContext: AIContextCacheLayer;

  private readonly auditTrail: {
    timestamp: string;
    operation: string;
    key: string;
    layer?: CacheLayer;
    success: boolean;
    executionTime: number;
  }[] = [];

  private readonly stats = {
    browser: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    },
    edge: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    },
    supabase: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    },
    aiContext: {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalRequests: 0,
      averageResponseTime: 0,
    },
  };

  // Hit rate targets for each layer
  // private readonly hitRateTargets = {
  //   [CacheLayer.BROWSER]: 90, // >90% hit rate
  //   [CacheLayer.EDGE]: 85, // >85% hit rate
  //   [CacheLayer.SUPABASE]: 80, // >80% hit rate
  //   [CacheLayer.AI_CONTEXT]: 95, // >95% hit rate
  // };

  constructor(config: MultiLayerCacheConfig) {
    const defaultBrowserConfig: BrowserCacheConfig = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000,
      storageQuota: 50 * 1024 * 1024,
      lgpdCompliant: true,
      compressionEnabled: true,
    };

    const defaultEdgeConfig: EdgeCacheConfig = {
      endpoint: process.env.EDGE_CACHE_ENDPOINT || "https://edge.neonpro.app",
      region: process.env.EDGE_CACHE_REGION || "us-east-1",
      defaultTTL: 15 * 60 * 1000,
      maxTTL: 24 * 60 * 60 * 1000,
      compressionThreshold: 1024,
      maxSize: 1000,
      encryption: true,
    };

    const defaultAIContextConfig: AIContextCacheConfig = {
      maxContextSize: 10_000,
      defaultTTL: 24 * 60 * 60 * 1000,
      maxTTL: 7 * 24 * 60 * 60 * 1000,
      compressionEnabled: true,
      targetHitRate: 95,
      contextRetention: true,
      maxTokensPerContext: 32_000,
    };

    this.browser = new BrowserCacheLayer(
      config.browser
        ? { ...defaultBrowserConfig, ...config.browser }
        : defaultBrowserConfig,
    );
    this.edge = new EdgeCacheLayer(
      config.edge
        ? { ...defaultEdgeConfig, ...config.edge }
        : defaultEdgeConfig,
    );
    this.supabase = new SupabaseCacheLayer(config.supabase);
    this.aiContext = new AIContextCacheLayer(
      config.aiContext
        ? { ...defaultAIContextConfig, ...config.aiContext }
        : defaultAIContextConfig,
    );
  }

  async get<T>(
    key: string,
    layers: CacheLayer[] = [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
    ],
    options?: {
      healthcareData?: boolean;
      lgpdCompliant?: boolean;
      policy?: HealthcareDataPolicy;
      tags?: string[];
    },
  ): Promise<T | null> {
    // Log healthcare data access if needed
    if (options?.healthcareData) {
      console.debug("Healthcare data cache access for key:", key);
    }

    // Try each layer in order
    for (const layer of layers) {
      try {
        let value: T | null = null;

        switch (layer) {
          case CacheLayer.BROWSER:
            value = await this.browser.get<T>(key);
            break;
          case CacheLayer.EDGE:
            value = await this.edge.get<T>(key);
            break;
          case CacheLayer.SUPABASE:
            value = await this.supabase.get<T>(key);
            break;
          case CacheLayer.AI_CONTEXT:
            value = await this.aiContext.get<T>(key);
            break;
        }

        if (value !== null) {
          // Cache hit - populate upstream layers
          await this.populateUpstream(key, value, layer, layers);
          return value;
        }
      } catch (error) {
        console.warn(`Cache layer ${layer} failed for key ${key}:`, error);
        // Continue to next layer on error
      }
    }

    // Cache miss on all layers
    return null;
  }

  async set<T>(
    key: string,
    value: T,
    layers: CacheLayer[] = [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
    ],
    options?: {
      ttl?: number;
      healthcareData?: boolean;
      policy?: HealthcareDataPolicy;
      tags?: string[];
      aiContextMetadata?: {
        contextType: "conversation" | "knowledge" | "embedding" | "reasoning";
        importance: "low" | "medium" | "high" | "critical";
        userId?: string;
        sessionId?: string;
        topic?: string;
        lastUsed?: Date;
        accessFrequency?: number;
      };
    },
  ): Promise<void> {
    const promises = layers.map(async (layer) => {
      try {
        const cache = this.getCacheLayer(layer);
        const ttl = options?.ttl || this.getDefaultTTL(layer);

        // Healthcare data needs special handling
        if (options?.healthcareData && layer === CacheLayer.BROWSER) {
          // Browser cache for healthcare data requires LGPD compliance
          if (options?.policy) {
            await (cache as BrowserCacheLayer).set(
              key,
              value,
              ttl,
              options.policy,
            );
          } else {
            await cache.set(key, value, ttl);
          }
        } else if (
          layer === CacheLayer.AI_CONTEXT
          && options?.aiContextMetadata
        ) {
          // AI Context cache with metadata
          await (cache as AIContextCacheLayer).set(
            key,
            value,
            ttl,
            options.aiContextMetadata,
          );
        } else {
          // Standard cache set
          await cache.set(key, value, ttl);
        }
      } catch (error) {
        console.warn(
          `Failed to set cache in layer ${layer} for key ${key}:`,
          error,
        );
      }
    });

    await Promise.allSettled(promises);
  }

  async delete(key: string, layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    const promises = targetLayers.map(async (layer) => {
      try {
        const cache = this.getCacheLayer(layer);
        await cache.delete(key);
      } catch (error) {
        console.warn(`Failed to delete key ${key} from layer ${layer}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  async invalidateByTags(tags: string[], layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    const promises = targetLayers.map(async (layer) => {
      try {
        const cache = this.getCacheLayer(layer);
        await cache.invalidateByTags(tags);
      } catch (error) {
        console.warn(`Failed to invalidate tags in layer ${layer}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  async getAllStats(): Promise<Record<CacheLayer, CacheStats>> {
    const promises = Object.values(CacheLayer).map(async (layer) =>
      this.getCacheLayer(layer)
        .getStats()
        .catch(() => ({
          hits: 0,
          misses: 0,
          hitRate: 0,
          totalRequests: 0,
          averageResponseTime: 0,
        }))
    );

    const results = await Promise.allSettled(promises);
    const stats: Partial<Record<CacheLayer, CacheStats>> = {};

    results.forEach((result, index) => {
      const layer = Object.values(CacheLayer)[index];
      if (result.status === "fulfilled" && layer) {
        stats[layer] = result.value;
      } else if (layer) {
        stats[layer] = {
          hits: 0,
          misses: 0,
          hitRate: 0,
          totalRequests: 0,
          averageResponseTime: 0,
        };
      }
    });

    return stats as Record<CacheLayer, CacheStats>;
  }

  private getCacheLayer(layer: CacheLayer): CacheOperation {
    switch (layer) {
      case CacheLayer.BROWSER:
        return this.browser;
      case CacheLayer.EDGE:
        return this.edge;
      case CacheLayer.SUPABASE:
        return this.supabase;
      case CacheLayer.AI_CONTEXT:
        return this.aiContext;
      default:
        throw new Error(`Unknown cache layer: ${layer}`);
    }
  }

  private getDefaultTTL(layer: CacheLayer): number {
    switch (layer) {
      case CacheLayer.BROWSER:
        return 5 * 60 * 1000; // 5 minutes
      case CacheLayer.EDGE:
        return 15 * 60 * 1000; // 15 minutes
      case CacheLayer.SUPABASE:
        return 60 * 60 * 1000; // 1 hour
      case CacheLayer.AI_CONTEXT:
        return 24 * 60 * 60; // 24 hours (seconds)
      default:
        return 60 * 1000; // 1 minute default
    }
  }

  // Healthcare-specific methods
  async setHealthcareData<T>(
    patientId: string,
    dataKey: string,
    value: T,
    policy: HealthcareDataPolicy,
  ): Promise<void> {
    const key = `patient:${patientId}:${dataKey}`;
    const layers = policy.dataClassification === "RESTRICTED"
      ? [CacheLayer.SUPABASE]
      : [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.SUPABASE];

    await this.set(key, value, layers, {
      healthcareData: true,
      policy,
      tags: [
        `patient:${patientId}`,
        `classification:${policy.dataClassification}`,
      ],
    });
  }

  async getHealthcareData<T>(
    patientId: string,
    dataKey: string,
    policy: HealthcareDataPolicy,
  ): Promise<T | null> {
    const key = `patient:${patientId}:${dataKey}`;
    const layers = policy.dataClassification === "RESTRICTED"
      ? [CacheLayer.SUPABASE]
      : [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.SUPABASE];

    return await this.get<T>(key, layers, {
      healthcareData: true,
      lgpdCompliant: true,
    });
  }

  async getHealthcareMetrics(): Promise<{
    totalHealthcareEntries: number;
    patientDataEntries: number;
    restrictedDataEntries: number;
    averageResponseTime: number;
  }> {
    const supabaseHealth = (await (
      this.supabase as SupabaseCacheLayer & { getHealthMetrics?: () => Promise<{ healthcareEntries: number }> }
    ).getHealthMetrics?.()) || {
      healthcareEntries: 0,
    };

    const stats = await this.getAllStats();
    const avgResponseTime = Object.values(stats).reduce(
      (sum, stat) => sum + stat.averageResponseTime,
      0,
    ) / Object.keys(stats).length;

    return {
      totalHealthcareEntries: supabaseHealth.healthcareEntries || 0,
      patientDataEntries: 0, // Would need to query with patient tag
      restrictedDataEntries: 0, // Would need to query with classification tag
      averageResponseTime: avgResponseTime,
    };
  }

  // AI Context specific methods
  async storeAIConversation(
    userId: string,
    sessionId: string,
    conversation: AIConversation,
    metadata?: {
      importance?: "low" | "medium" | "high" | "critical";
      topic?: string;
      lastUsed?: Date;
    },
  ): Promise<void> {
    const key = `ai:conversation:${userId}:${sessionId}`;
    const aiMetadata: AIMetadata = {
      contextType: "conversation",
      importance: metadata?.importance || "medium",
      userId,
      sessionId,
      lastUsed: metadata?.lastUsed || new Date(),
      accessFrequency: 1,
    };

    if (metadata?.topic) {
      aiMetadata.topic = metadata.topic;
    }

    await this.set(key, conversation, [CacheLayer.AI_CONTEXT], {
      aiContextMetadata: aiMetadata,
    });
  }

  async getAIConversation(
    userId: string,
    sessionId: string,
  ): Promise<AIConversation | null> {
    const key = `ai:conversation:${userId}:${sessionId}`;
    return await this.get(key, [CacheLayer.AI_CONTEXT]);
  }

  // Batch operations
  async setBatch<T>(
    entries: { key: string; value: T; ttl?: number; }[],
    layers?: CacheLayer[],
  ): Promise<void> {
    const promises = entries.map(({ key, value, ttl }) => {
      const options = ttl !== undefined ? { ttl } : undefined;
      return this.set(key, value, layers, options);
    });
    await Promise.allSettled(promises);
  }

  async getBatch<T>(
    keys: string[],
    layers?: CacheLayer[],
  ): Promise<Record<string, T | null>> {
    const promises = keys.map(async (key) => ({
      key,
      value: await this.get<T>(key, layers),
    }));

    const results = await Promise.allSettled(promises);
    const batch: Record<string, T | null> = {};

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        batch[result.value.key] = result.value.value;
      }
    });

    return batch;
  }

  private async populateUpstream<T>(
    key: string,
    value: T,
    sourceLayer: CacheLayer,
    layers: CacheLayer[],
  ): Promise<void> {
    const sourceIndex = layers.indexOf(sourceLayer);
    if (sourceIndex <= 0) {
      return;
    } // Already at the top layer or not found

    const upstreamLayers = layers.slice(0, sourceIndex);
    const promises = upstreamLayers.map(async (layer) => {
      try {
        const cache = this.getCacheLayer(layer);
        const ttl = this.getDefaultTTL(layer);
        await cache.set(key, value, ttl);
      } catch (error) {
        console.warn(`Failed to populate upstream layer ${layer}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  /**
   * Clear all cache layers
   */
  async clear(): Promise<void> {
    await Promise.allSettled([
      this.browser.clear(),
      this.edge.clear(),
      this.supabase.clear(),
      this.aiContext.clear(),
    ]);
  }

  /**
   * Clear all patient-related data for LGPD compliance
   */
  async clearPatientData(patientId: string): Promise<void> {
    const patientKeys = [
      `patient_${patientId}`,
      `patient_history_${patientId}`,
      `patient_consent_${patientId}`,
      `lgpd_consent_${patientId}`,
    ];

    await Promise.allSettled(
      patientKeys.flatMap((key) =>
        [
          CacheLayer.BROWSER,
          CacheLayer.EDGE,
          CacheLayer.SUPABASE,
          CacheLayer.AI_CONTEXT,
        ].map((layer) => this.delete(key, [layer]))
      ),
    );
  }

  /**
   * Get healthcare audit trail
   */
  getHealthcareAuditTrail(): AuditTrailEntry[] {
    // Return audit trail from all layers
    return this.auditTrail.slice(-100);
  }

  /**
   * Get comprehensive cache statistics
   */
  getStats(): CacheManagerStats {
    return {
      layers: {
        browser: this.stats.browser,
        edge: this.stats.edge,
        supabase: this.stats.supabase,
        aiContext: this.stats.aiContext,
      },
      overall: {
        totalHits: Object.values(this.stats).reduce(
          (sum, stat) => sum + stat.hits,
          0,
        ),
        totalMisses: Object.values(this.stats).reduce(
          (sum, stat) => sum + stat.misses,
          0,
        ),
        averageHitRate: Object.values(this.stats).reduce(
          (sum, stat) => sum + stat.hitRate,
          0,
        ) / 4,
        totalOperations: this.auditTrail.length,
      },
      audit: {
        totalEntries: this.auditTrail.length,
        ...(this.auditTrail.length > 0 && {
          lastOperation: this.auditTrail[this.auditTrail.length - 1].timestamp,
        }),
      },
    };
  }
}
