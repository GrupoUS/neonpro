import { type MetricCollector, MetricType, MetricUnit, type PerformanceMetric } from "../types";

export class CacheMetricsCollector implements MetricCollector {
	private enabled = true;
	private collectionInterval = 30_000; // 30 seconds
	private cacheManager: any; // Will be injected

	constructor(cacheManager?: any) {
		this.cacheManager = cacheManager;
	}

	async collect(): Promise<PerformanceMetric[]> {
		const metrics: PerformanceMetric[] = [];
		const timestamp = Date.now();

		if (!this.cacheManager) {
			return metrics;
		}

		try {
			// Collect multi-layer cache statistics
			const allStats = await this.cacheManager.getAllStats();

			for (const [layer, stats] of Object.entries(allStats)) {
				const layerStats = stats as any;

				// Hit rate metric
				metrics.push({
					id: `cache_hit_rate_${layer}_${timestamp}`,
					timestamp,
					type: MetricType.CACHE_HIT_RATE,
					value: layerStats.hitRate,
					unit: MetricUnit.PERCENTAGE,
					tags: { layer, component: "cache" },
					source: "cache-collector",
					context: {
						hits: layerStats.hits,
						misses: layerStats.misses,
						totalRequests: layerStats.totalRequests,
					},
				});

				// Response time metric
				metrics.push({
					id: `cache_response_time_${layer}_${timestamp}`,
					timestamp,
					type: MetricType.RESPONSE_TIME,
					value: layerStats.averageResponseTime,
					unit: MetricUnit.MILLISECONDS,
					tags: { layer, component: "cache", operation: "read" },
					source: "cache-collector",
				});
			}

			// Overall cache efficiency score
			const overallHitRate = this.calculateOverallHitRate(allStats);
			metrics.push({
				id: `cache_efficiency_score_${timestamp}`,
				timestamp,
				type: MetricType.CACHE_HIT_RATE,
				value: overallHitRate,
				unit: MetricUnit.PERCENTAGE,
				tags: { layer: "all", component: "cache", metric: "efficiency" },
				source: "cache-collector",
				context: { allStats },
			});
		} catch (_error) {}

		return metrics;
	}
	private calculateOverallHitRate(allStats: Record<string, any>): number {
		let totalHits = 0;
		let totalRequests = 0;

		for (const stats of Object.values(allStats)) {
			const layerStats = stats as any;
			totalHits += layerStats.hits || 0;
			totalRequests += layerStats.totalRequests || 0;
		}

		return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
	}

	getMetricType(): MetricType {
		return MetricType.CACHE_HIT_RATE;
	}

	isEnabled(): boolean {
		return this.enabled;
	}

	getCollectionInterval(): number {
		return this.collectionInterval;
	}

	setEnabled(enabled: boolean): void {
		this.enabled = enabled;
	}

	setCollectionInterval(interval: number): void {
		this.collectionInterval = interval;
	}

	setCacheManager(cacheManager: any): void {
		this.cacheManager = cacheManager;
	}
}
