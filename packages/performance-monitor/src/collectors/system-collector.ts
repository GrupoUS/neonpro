import { type MetricCollector, MetricType, MetricUnit, type PerformanceMetric } from "../types";

export class SystemMetricsCollector implements MetricCollector {
	private enabled = true;
	private collectionInterval = 30_000; // 30 seconds

	constructor() {}

	async collect(): Promise<PerformanceMetric[]> {
		const metrics: PerformanceMetric[] = [];
		const timestamp = Date.now();

		try {
			// Collect system performance metrics
			await this.collectCPUMetrics(metrics, timestamp);
			await this.collectMemoryMetrics(metrics, timestamp);
			await this.collectDatabaseMetrics(metrics, timestamp);
		} catch (error) {
			console.error("[SystemMetricsCollector] Error collecting metrics:", error);

			// Error metric
			metrics.push({
				id: `system_error_${timestamp}`,
				timestamp,
				type: MetricType.ERROR_RATE,
				value: 1,
				unit: MetricUnit.COUNT,
				tags: { component: "system", error: "collection_failed" },
				source: "system-metrics-collector",
				context: { error: error instanceof Error ? error.message : String(error) },
			});
		}

		return metrics;
	}

	private async collectCPUMetrics(metrics: PerformanceMetric[], timestamp: number): Promise<void> {
		// Mock CPU usage - in real implementation, would use Node.js os module or system APIs
		const cpuUsage = this.getMockCPUUsage();

		metrics.push({
			id: `cpu_usage_${timestamp}`,
			timestamp,
			type: MetricType.CPU_USAGE,
			value: cpuUsage,
			unit: MetricUnit.PERCENTAGE,
			tags: { component: "system", resource: "cpu" },
			source: "system-metrics-collector",
		});
	}

	private async collectMemoryMetrics(metrics: PerformanceMetric[], timestamp: number): Promise<void> {
		// Mock memory usage - in real implementation, would use process.memoryUsage()
		const memoryInfo = this.getMockMemoryUsage();

		metrics.push({
			id: `memory_usage_${timestamp}`,
			timestamp,
			type: MetricType.MEMORY_USAGE,
			value: memoryInfo.percentage,
			unit: MetricUnit.PERCENTAGE,
			tags: { component: "system", resource: "memory" },
			source: "system-metrics-collector",
			context: {
				used: memoryInfo.used,
				total: memoryInfo.total,
				free: memoryInfo.free,
			},
		});
	}
	private async collectDatabaseMetrics(metrics: PerformanceMetric[], timestamp: number): Promise<void> {
		// Mock database connection and query metrics
		const dbConnectionCount = this.getMockDatabaseConnections();
		const avgQueryTime = this.getMockDatabaseQueryTime();
		const queriesPerSecond = this.getMockQueriesPerSecond();

		// Database queries per second
		metrics.push({
			id: `db_queries_per_second_${timestamp}`,
			timestamp,
			type: MetricType.DATABASE_QUERIES,
			value: queriesPerSecond,
			unit: MetricUnit.REQUESTS_PER_SECOND,
			tags: { component: "database", metric: "throughput" },
			source: "system-metrics-collector",
		});

		// Average query response time
		metrics.push({
			id: `db_query_time_${timestamp}`,
			timestamp,
			type: MetricType.RESPONSE_TIME,
			value: avgQueryTime,
			unit: MetricUnit.MILLISECONDS,
			tags: { component: "database", metric: "query_time" },
			source: "system-metrics-collector",
		});

		// Database connection count
		metrics.push({
			id: `db_connections_${timestamp}`,
			timestamp,
			type: MetricType.DATABASE_QUERIES,
			value: dbConnectionCount,
			unit: MetricUnit.COUNT,
			tags: { component: "database", metric: "connections" },
			source: "system-metrics-collector",
		});
	}

	// Mock methods - will be replaced with actual system monitoring
	private getMockCPUUsage(): number {
		// Mock: return random CPU usage between 10-80%
		return Math.floor(Math.random() * 70) + 10;
	}

	private getMockMemoryUsage(): { used: number; total: number; free: number; percentage: number } {
		const total = 8 * 1024 * 1024 * 1024; // 8GB in bytes
		const used = Math.floor(Math.random() * (total * 0.7)) + total * 0.2; // 20-90% used
		const free = total - used;
		const percentage = (used / total) * 100;

		return { used, total, free, percentage };
	}

	private getMockDatabaseConnections(): number {
		// Mock: return random connection count between 5-50
		return Math.floor(Math.random() * 45) + 5;
	}

	private getMockDatabaseQueryTime(): number {
		// Mock: return random query time between 10-200ms
		return Math.floor(Math.random() * 190) + 10;
	}

	private getMockQueriesPerSecond(): number {
		// Mock: return random QPS between 50-500
		return Math.floor(Math.random() * 450) + 50;
	}
	getMetricType(): MetricType {
		return MetricType.CPU_USAGE;
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
}
