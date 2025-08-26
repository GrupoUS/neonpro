import { AIContextCacheLayer } from "./ai-context-cache";
import { BrowserCacheLayer } from "./browser-cache";
import { DatabaseCacheLayer } from "./database-cache";
import { EdgeCacheLayer } from "./edge-cache";
import { CacheLayer, type CacheOperation, type CacheStats, type HealthcareDataPolicy } from "./types";

export class MultiLayerCacheManager {
	private readonly browser: BrowserCacheLayer;
	private readonly edge: EdgeCacheLayer;
	private readonly database: DatabaseCacheLayer;
	private readonly aiContext: AIContextCacheLayer;

	private readonly hitRateTargets = {
		[CacheLayer.BROWSER]: 90, // >90% hit rate
		[CacheLayer.EDGE]: 85, // >85% hit rate
		[CacheLayer.DATABASE]: 80, // >80% hit rate
		[CacheLayer.AI_CONTEXT]: 95, // >95% hit rate
	};

	constructor(config?: {
		browserConfig?: any;
		edgeConfig?: any;
		databaseConfig?: any;
		aiContextConfig?: any;
	}) {
		this.browser = new BrowserCacheLayer(config?.browserConfig);
		this.edge = new EdgeCacheLayer(config?.edgeConfig);
		this.database = new DatabaseCacheLayer(config?.databaseConfig);
		this.aiContext = new AIContextCacheLayer(config?.aiContextConfig);
	}

	async get<T>(
		key: string,
		layers: CacheLayer[] = [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.DATABASE],
		options?: {
			healthcareData?: boolean;
			lgpdCompliant?: boolean;
			fallbackToAll?: boolean;
		}
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
			} catch (_error) {}
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
					} catch (_error) {}
				}
			}
		}

		return null;
	}
	async set<T>(
		key: string,
		value: T,
		layers: CacheLayer[] = [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.DATABASE],
		options?: {
			ttl?: number;
			healthcareData?: boolean;
			policy?: HealthcareDataPolicy;
			aiContextMetadata?: {
				contextType: "conversation" | "knowledge" | "embedding" | "reasoning";
				importance: "low" | "medium" | "high" | "critical";
				userId?: string;
				sessionId?: string;
			};
		}
	): Promise<void> {
		const promises: Promise<void>[] = [];

		for (const layer of layers) {
			try {
				const cache = this.getCache(layer);

				// Layer-specific TTL optimization
				const layerTTL = this.getOptimalTTL(layer, options?.ttl);

				if (layer === CacheLayer.AI_CONTEXT && options?.aiContextMetadata) {
					promises.push((cache as AIContextCacheLayer).set(key, value, layerTTL, options.aiContextMetadata));
				} else if (layer === CacheLayer.DATABASE && options?.healthcareData) {
					promises.push(
						(cache as DatabaseCacheLayer).set(key, value, layerTTL, {
							healthcareData: options.healthcareData,
							auditContext: `cache_set_${Date.now()}`,
						})
					);
				} else if (layer === CacheLayer.BROWSER && options?.policy) {
					promises.push((cache as BrowserCacheLayer).set(key, value, layerTTL, options.policy));
				} else {
					promises.push(cache.set(key, value, layerTTL));
				}
			} catch (_error) {}
		}

		// Execute all cache operations in parallel
		await Promise.allSettled(promises);
	}

	async delete(key: string, layers?: CacheLayer[]): Promise<void> {
		const targetLayers = layers || Object.values(CacheLayer);
		const promises = targetLayers.map((layer) => {
			try {
				return this.getCache(layer).delete(key);
			} catch (_error) {
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
			} catch (_error) {
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
			stats: await this.getLayerStats(layer),
		}));

		const results = await Promise.allSettled(promises);
		const stats: Partial<Record<CacheLayer, CacheStats>> = {};

		results.forEach((result, index) => {
			if (result.status === "fulfilled") {
				stats[result.value.layer] = result.value.stats;
			} else {
				const layer = Object.values(CacheLayer)[index];
				stats[layer] = { hits: 0, misses: 0, hitRate: 0, totalRequests: 0, averageResponseTime: 0 };
			}
		});

		return stats as Record<CacheLayer, CacheStats>;
	}

	async performHealthCheck(): Promise<{
		healthy: boolean;
		layers: Record<CacheLayer, { healthy: boolean; hitRate: number; target: number }>;
		recommendations: string[];
	}> {
		const allStats = await this.getAllStats();
		const recommendations: string[] = [];
		let overallHealthy = true;

		const layerHealth: Record<CacheLayer, { healthy: boolean; hitRate: number; target: number }> = {} as any;

		for (const [layer, stats] of Object.entries(allStats) as [CacheLayer, CacheStats][]) {
			const target = this.hitRateTargets[layer];
			const healthy = stats.hitRate >= target;

			layerHealth[layer] = {
				healthy,
				hitRate: stats.hitRate,
				target,
			};

			if (!healthy) {
				overallHealthy = false;
				recommendations.push(`${layer} cache hit rate (${stats.hitRate.toFixed(1)}%) below target (${target}%)`);
			}
		}

		return {
			healthy: overallHealthy,
			layers: layerHealth,
			recommendations,
		};
	}
	private getCache(layer: CacheLayer): CacheOperation {
		switch (layer) {
			case CacheLayer.BROWSER:
				return this.browser;
			case CacheLayer.EDGE:
				return this.edge;
			case CacheLayer.DATABASE:
				return this.database;
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
			case CacheLayer.DATABASE:
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
		_options?: any
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
			} catch (_error) {
				return Promise.resolve();
			}
		});

		await Promise.allSettled(promises);
	}

	// Healthcare-specific methods
	async setPatientData<T>(patientId: string, dataKey: string, value: T, policy: HealthcareDataPolicy): Promise<void> {
		const key = `patient:${patientId}:${dataKey}`;
		const layers =
			policy.dataClassification === "RESTRICTED"
				? [CacheLayer.DATABASE]
				: [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.DATABASE];

		await this.set(key, value, layers, {
			healthcareData: true,
			policy,
		});
	}

	async getPatientData<T>(patientId: string, dataKey: string, policy: HealthcareDataPolicy): Promise<T | null> {
		const key = `patient:${patientId}:${dataKey}`;
		const layers =
			policy.dataClassification === "RESTRICTED"
				? [CacheLayer.DATABASE]
				: [CacheLayer.BROWSER, CacheLayer.EDGE, CacheLayer.DATABASE];

		return await this.get<T>(key, layers, {
			healthcareData: true,
			lgpdCompliant: true,
		});
	}
}
