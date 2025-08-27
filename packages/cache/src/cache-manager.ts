import { BrowserCacheLayer } from "./browser-cache";
import { SupabaseCacheLayer } from "./supabase-cache";
import { AIContextCacheLayer } from "./ai-context-cache";
import { EdgeCacheLayer } from "./edge-cache";
import { CacheLayer } from "./types";
import type { CacheOperation, CacheStats, HealthcareDataPolicy, SupabaseCacheConfig } from "./types";

export interface MultiLayerCacheConfig {
  supabase: SupabaseCacheConfig;
  browser?: {
    maxSize?: number;
    defaultTTL?: number;
    storageQuota?: number;
  };
  edge?: {
    endpoint?: string;
    region?: string;
    defaultTTL?: number;
  };
  aiContext?: {
    maxContextSize?: number;
    compressionEnabled?: boolean;
  };
}

export class MultiLayerCacheManager {
  private readonly browser: BrowserCacheLayer;
  private readonly edge: EdgeCacheLayer;
  private readonly supabase: SupabaseCacheLayer;
  private readonly aiContext: AIContextCacheLayer;

  private readonly hitRateTargets = {
    [CacheLayer.BROWSER]: 90, // >90% hit rate
    [CacheLayer.EDGE]: 85, // >85% hit rate
    [CacheLayer.SUPABASE]: 80, // >80% hit rate
    [CacheLayer.AI_CONTEXT]: 95, // >95% hit rate
  };

  constructor(config: MultiLayerCacheConfig) {
    this.browser = new BrowserCacheLayer(config.browser);
    this.edge = new EdgeCacheLayer(config.edge);
    this.supabase = new SupabaseCacheLayer(config.supabase);
    this.aiContext = new AIContextCacheLayer(config.aiContext);
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
      fallbackToAll?: boolean;
    },
  ): Promise<T | null> {
    // Try each layer in order (fastest to slowest)
    for (const layer of layers) {
      try {
        const cache = this.getCache(layer);
        const result = await cache.get<T>(key);

        if (result !== null) {
          // Populate faster layers with the found result
          await this.populateUpstream(key, result, layer, layers, options);
          return result;
        }
      } catch (error) {
        console.debug(`Cache layer ${layer} error:`, error);
      }
    }

    // If no result found and fallback is enabled, try all layers
    if (options?.fallbackToAll) {
      const allLayers = [CacheLayer.AI_CONTEXT];
      for (const layer of allLayers) {
        if (!layers.includes(layer)) {
          try {
            const cache = this.getCache(layer);
            const result = await cache.get<T>(key);
            if (result !== null) {
              return result;
            }
          } catch (error) {
            console.debug(`Fallback cache layer ${layer} error:`, error);
          }
        }
      }
    }

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
      };
    },
  ): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const layer of layers) {
      try {
        const cache = this.getCache(layer);
        const layerTTL = this.getOptimalTTL(layer, options?.ttl);

        if (layer === CacheLayer.AI_CONTEXT && options?.aiContextMetadata) {
          promises.push(
            (cache as AIContextCacheLayer).set(
              key,
              value,
              layerTTL,
              options.aiContextMetadata,
            ),
          );
        } else if (layer === CacheLayer.SUPABASE && options?.healthcareData) {
          promises.push(
            (cache as SupabaseCacheLayer).set(key, value, layerTTL, {
              healthcareData: options.healthcareData,
              tags: options.tags,
              auditContext: `cache_set_${Date.now()}`,
            }),
          );
        } else if (layer === CacheLayer.BROWSER && options?.policy) {
          promises.push(
            (cache as BrowserCacheLayer).set(
              key,
              value,
              layerTTL,
              options.policy,
            ),
          );
        } else {
          promises.push(cache.set(key, value, layerTTL));
        }
      } catch (error) {
        console.debug(`Cache layer ${layer} set error:`, error);
      }
    }

    // Execute all cache operations in parallel
    await Promise.allSettled(promises);
  }

  async delete(key: string, layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || Object.values(CacheLayer);
    const promises = targetLayers.map((layer) => {
      try {
        return this.getCache(layer).delete(key);
      } catch (error) {
        console.debug(`Cache layer ${layer} delete error:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  async invalidateByTags(tags: string[], layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || Object.values(CacheLayer);
    const promises = targetLayers.map((layer) => {
      try {
        return this.getCache(layer).invalidateByTags(tags);
      } catch (error) {
        console.debug(`Cache layer ${layer} invalidateByTags error:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }

  async getLayerStats(layer: CacheLayer): Promise<CacheStats> {
    return await this.getCache(layer).getStats();
  }

  async getAllStats(): Promise<Record<CacheLayer, CacheStats>> {
    const promises = Object.values(CacheLayer).map(async (layer) => ({
      layer,
      stats: await this.getLayerStats(layer).catch(() => ({
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        averageResponseTime: 0,
      })),
    }));

    const results = await Promise.allSettled(promises);
    const stats: Partial<Record<CacheLayer, CacheStats>> = {};

    results.forEach((result, index) => {
      const layer = Object.values(CacheLayer)[index];
      if (result.status === "fulfilled") {
        stats[result.value.layer] = result.value.stats;
      } else {
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

  async performHealthCheck(): Promise<{
    healthy: boolean;
    layers: Record<
      CacheLayer,
      { healthy: boolean; hitRate: number; target: number; }
    >;
    recommendations: string[];
  }> {
    const allStats = await this.getAllStats();
    const recommendations: string[] = [];
    let overallHealthy = true;

    const layerHealth: Record<
      CacheLayer,
      { healthy: boolean; hitRate: number; target: number; }
    > = {} as any;

    for (
      const [layer, stats] of Object.entries(allStats) as [
        CacheLayer,
        CacheStats,
      ][]
    ) {
      const target = this.hitRateTargets[layer];
      const healthy = stats.hitRate >= target;

      layerHealth[layer] = {
        healthy,
        hitRate: stats.hitRate,
        target,
      };

      if (!healthy) {
        overallHealthy = false;
        recommendations.push(
          `${layer} cache hit rate (${stats.hitRate.toFixed(1)}%) below target (${target}%)`,
        );
      }
    }

    return {
      healthy: overallHealthy,
      layers: layerHealth,
      recommendations,
    };
  }

  // Healthcare-specific methods
  async setPatientData<T>(
    patientId: string,
    dataKey: string,
    value: T,
    policy: HealthcareDataPolicy,
  ): Promise<void> {
    const key = `patient:${patientId}:${dataKey}`;
    const layers = policy.dataClassification === "RESTRICTED"
      ? [CacheLayer.SUPABASE] // Only Supabase for restricted data
      : [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.SUPABASE];

    await this.set(key, value, layers, {
      healthcareData: true,
      policy,
      tags: [`patient:${patientId}`, `classification:${policy.dataClassification}`],
    });
  }

  async getPatientData<T>(
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

  async clearPatientData(patientId: string): Promise<void> {
    // Clear from browser cache
    if (this.browser.clearPatientData) {
      await this.browser.clearPatientData(patientId);
    }

    // Clear from Supabase cache
    if (this.supabase.clearPatientData) {
      await this.supabase.clearPatientData(patientId);
    }

    // Invalidate by tags
    await this.invalidateByTags([`patient:${patientId}`]);
  }

  async getHealthcareMetrics(): Promise<{
    totalHealthcareEntries: number;
    patientDataEntries: number;
    restrictedDataEntries: number;
    averageResponseTime: number;
  }> {
    const supabaseHealth = await (this.supabase as any).getHealthMetrics?.() || {
      healthcareEntries: 0,
    };

    const stats = await this.getAllStats();
    const avgResponseTime = Object.values(stats).reduce(
      (sum, stat) => sum + stat.averageResponseTime,
      0
    ) / Object.keys(stats).length;

    return {
      totalHealthcareEntries: supabaseHealth.healthcareEntries || 0,
      patientDataEntries: 0, // Would need to query with patient tag
      restrictedDataEntries: 0, // Would need to query with classification tag
      averageResponseTime: avgResponseTime,
    };
  }

  private getCache(layer: CacheLayer): CacheOperation {
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

  private getOptimalTTL(layer: CacheLayer, baseTTL?: number): number {
    if (baseTTL) {
      return baseTTL;
    }

    // Default TTLs optimized for each layer
    switch (layer) {
      case CacheLayer.BROWSER:
        return 5 * 60 * 1000; // 5 minutes
      case CacheLayer.EDGE:
        return 10 * 60; // 10 minutes (seconds)
      case CacheLayer.SUPABASE:
        return 30 * 1000; // 30 seconds
      case CacheLayer.AI_CONTEXT:
        return 24 * 60 * 60; // 24 hours (seconds)
      default:
        return 60 * 1000; // 1 minute default
    }
  }

  private async populateUpstream<T>(
    key: string,
    value: T,
    foundLayer: CacheLayer,
    searchedLayers: CacheLayer[],
    _options?: any,
  ): Promise<void> {
    const layerIndex = searchedLayers.indexOf(foundLayer);
    if (layerIndex <= 0) {
      return; // Already at fastest layer or not found
    }

    // Populate all faster layers
    const upstreamLayers = searchedLayers.slice(0, layerIndex);
    const promises = upstreamLayers.map((layer) => {
      try {
        const cache = this.getCache(layer);
        const ttl = this.getOptimalTTL(layer);
        return cache.set(key, value, ttl);
      } catch (error) {
        console.debug(`Upstream population error for ${layer}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
  }
}