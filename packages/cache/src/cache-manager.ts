import { AIContextCacheLayer } from "./ai-context-cache";
import { BrowserCacheLayer } from "./browser-cache";
import { EdgeCacheLayer } from "./edge-cache";
import { SupabaseCacheLayer } from "./supabase-cache";
import { CacheLayer } from "./types";
import type {
  AIContextCacheConfig,
  BrowserCacheConfig,
  EdgeCacheConfig,
  HealthcareDataPolicy,
  SupabaseCacheConfig,
} from "./types";

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

  private readonly auditTrail: AuditTrailEntry[] = [];

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
  } as const;

  constructor(config: MultiLayerCacheConfig) {
    this.browser = new BrowserCacheLayer();
    this.edge = new EdgeCacheLayer();
    this.supabase = new SupabaseCacheLayer(config.supabase);
    this.aiContext = new AIContextCacheLayer();
  }

  /**
   * Generic cache operations
   */
  async get<T>(key: string, layers?: CacheLayer[]): Promise<T | null> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    for (const layer of targetLayers) {
      const startTime = performance.now();
      try {
        let result: T | null = null;
        switch (layer) {
          case CacheLayer.BROWSER:
            result = await this.browser.get<T>(key);
            break;
          case CacheLayer.EDGE:
            result = await this.edge.get<T>(key);
            break;
          case CacheLayer.SUPABASE:
            result = await this.supabase.get<T>(key);
            break;
          case CacheLayer.AI_CONTEXT:
            result = await this.aiContext.get<T>(key);
            break;
        }

        this.updateLayerStats(layer, performance.now() - startTime, !!result);

        if (result !== null) {
          return result;
        }
      } catch (error) {
        this.updateLayerStats(layer, performance.now() - startTime, false);
        console.error(`Cache get error on layer ${layer}:`, error);
      }
    }

    return null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    layers?: CacheLayer[],
    policy?: HealthcareDataPolicy,
  ): Promise<void> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    for (const layer of targetLayers) {
      const startTime = performance.now();
      try {
        switch (layer) {
          case CacheLayer.BROWSER:
            await this.browser.set(key, value, ttl, policy);
            break;
          case CacheLayer.EDGE:
            await this.edge.set(key, value, ttl);
            break;
          case CacheLayer.SUPABASE: {
            const options: {
              healthcareData?: boolean;
              patientId?: string;
              auditContext?: string;
              tags?: string[];
            } = {
              healthcareData: !!policy && policy.dataClassification !== "PUBLIC",
              tags: [],
            };
            if (policy?.auditRequired) {
              options.auditContext = "healthcare_audit";
            }
            await this.supabase.set(key, value, ttl, options);
            break;
          }
          case CacheLayer.AI_CONTEXT:
            await this.aiContext.set(key, value, ttl);
            break;
        }

        this.updateLayerStats(layer, performance.now() - startTime, true);
      } catch (error) {
        this.updateLayerStats(layer, performance.now() - startTime, false);
        console.error(`Cache set error on layer ${layer}:`, error);
      }
    }
  }

  async delete(key: string, layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    for (const layer of targetLayers) {
      const startTime = performance.now();
      try {
        switch (layer) {
          case CacheLayer.BROWSER:
            await this.browser.delete(key);
            break;
          case CacheLayer.EDGE:
            await this.edge.delete(key);
            break;
          case CacheLayer.SUPABASE:
            await this.supabase.delete(key);
            break;
          case CacheLayer.AI_CONTEXT:
            await this.aiContext.delete(key);
            break;
        }

        this.updateLayerStats(layer, performance.now() - startTime, true);
      } catch (error) {
        this.updateLayerStats(layer, performance.now() - startTime, false);
        console.error(`Cache delete error on layer ${layer}:`, error);
      }
    }
  }

  async clear(layers?: CacheLayer[]): Promise<void> {
    const targetLayers = layers || [
      CacheLayer.BROWSER,
      CacheLayer.EDGE,
      CacheLayer.SUPABASE,
      CacheLayer.AI_CONTEXT,
    ];

    for (const layer of targetLayers) {
      const startTime = performance.now();
      try {
        switch (layer) {
          case CacheLayer.BROWSER:
            await this.browser.clear();
            break;
          case CacheLayer.EDGE:
            await this.edge.clear();
            break;
          case CacheLayer.SUPABASE:
            await this.supabase.clear();
            break;
          case CacheLayer.AI_CONTEXT:
            await this.aiContext.clear();
            break;
        }

        this.updateLayerStats(layer, performance.now() - startTime, true);
      } catch (error) {
        this.updateLayerStats(layer, performance.now() - startTime, false);
        console.error(`Cache clear error on layer ${layer}:`, error);
      }
    }
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
        ...(this.auditTrail.length > 0
          ? { lastOperation: this.auditTrail[this.auditTrail.length - 1]!.timestamp }
          : {}),
      },
    };
  }

  /**
   * Internal stats aggregator
   */
  private updateLayerStats(layer: CacheLayer, responseTime: number, hit: boolean): void {
    const stats = this.stats[
      layer === CacheLayer.BROWSER
        ? "browser"
        : layer === CacheLayer.EDGE
        ? "edge"
        : layer === CacheLayer.SUPABASE
        ? "supabase"
        : "aiContext"
    ];

    // Using temporary object to mutate values since this.stats is a const object
    (stats as unknown as {
      totalRequests: number;
      hits: number;
      misses: number;
      hitRate: number;
      averageResponseTime: number;
    }).totalRequests++;
    if (hit) {
      (stats as unknown as { hits: number; }).hits++;
    } else {
      (stats as any).misses++;
    }
    (stats as any).hitRate = stats.totalRequests > 0 ? (stats.hits / stats.totalRequests) * 100 : 0;
    (stats as any).averageResponseTime = (stats.averageResponseTime + responseTime) / 2;
  }
}
