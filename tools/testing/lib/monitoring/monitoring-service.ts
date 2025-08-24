/**
 * Monitoring Service - Mock implementation for testing
 * Provides system monitoring, metrics collection, and alerting functionality
 */

export type MetricData = {
	timestamp: number;
	value: number;
	tags?: Record<string, string>;
	metadata?: Record<string, any>;
};

export type Alert = {
	id: string;
	type: "error" | "warning" | "info" | "critical";
	message: string;
	source: string;
	timestamp: number;
	resolved: boolean;
	metadata?: Record<string, any>;
};

export type SystemHealth = {
	status: "healthy" | "degraded" | "unhealthy";
	uptime: number;
	memory: {
		used: number;
		total: number;
		percentage: number;
	};
	cpu: {
		usage: number;
		cores: number;
	};
	database: {
		status: "connected" | "disconnected" | "error";
		latency: number;
		connections: number;
	};
	services: Record<
		string,
		{
			status: "running" | "stopped" | "error";
			lastCheck: number;
			responseTime: number;
		}
	>;
};
export type PerformanceMetrics = {
	responseTime: {
		p50: number;
		p95: number;
		p99: number;
		avg: number;
	};
	throughput: {
		requestsPerSecond: number;
		totalRequests: number;
	};
	errorRate: {
		percentage: number;
		count: number;
	};
	availability: {
		percentage: number;
		uptime: number;
		downtime: number;
	};
};

class MonitoringService {
	private readonly metrics: Map<string, MetricData[]> = new Map();
	private alerts: Alert[] = [];
	private healthData: SystemHealth;
	private performanceData: PerformanceMetrics;

	constructor() {
		this.initializeMockData();
	}

	/**
	 * Record a metric value
	 */
	recordMetric(name: string, value: number, tags?: Record<string, string>, metadata?: Record<string, any>): void {
		const metric: MetricData = {
			timestamp: Date.now(),
			value,
			tags,
			metadata,
		};

		if (!this.metrics.has(name)) {
			this.metrics.set(name, []);
		}

		const metrics = this.metrics.get(name)!;
		metrics.push(metric);

		// Keep only last 1000 metrics per name
		if (metrics.length > 1000) {
			metrics.splice(0, metrics.length - 1000);
		}
	} /**
	 * Get metrics for a specific name
	 */
	getMetrics(name: string, startTime?: number, endTime?: number): MetricData[] {
		const metrics = this.metrics.get(name) || [];

		if (!(startTime || endTime)) {
			return metrics;
		}

		return metrics.filter((metric) => {
			if (startTime && metric.timestamp < startTime) {
				return false;
			}
			if (endTime && metric.timestamp > endTime) {
				return false;
			}
			return true;
		});
	}

	/**
	 * Create an alert
	 */
	createAlert(type: Alert["type"], message: string, source: string, metadata?: Record<string, any>): Alert {
		const alert: Alert = {
			id: this.generateId(),
			type,
			message,
			source,
			timestamp: Date.now(),
			resolved: false,
			metadata,
		};

		this.alerts.push(alert);

		// Auto-resolve info alerts after 5 minutes
		if (type === "info") {
			setTimeout(
				() => {
					this.resolveAlert(alert.id);
				},
				5 * 60 * 1000
			);
		}

		return alert;
	} /**
	 * Resolve an alert
	 */
	resolveAlert(alertId: string): boolean {
		const alert = this.alerts.find((a) => a.id === alertId);
		if (alert) {
			alert.resolved = true;
			return true;
		}
		return false;
	}

	/**
	 * Get alerts
	 */
	getAlerts(includeResolved = false): Alert[] {
		return this.alerts.filter((alert) => includeResolved || !alert.resolved);
	}

	/**
	 * Get system health status
	 */
	getSystemHealth(): SystemHealth {
		// Simulate dynamic values
		this.healthData.uptime = Date.now() - (this.healthData.uptime || Date.now());
		this.healthData.memory.percentage = Math.floor(Math.random() * 20) + 60; // 60-80%
		this.healthData.cpu.usage = Math.floor(Math.random() * 30) + 20; // 20-50%
		this.healthData.database.latency = Math.floor(Math.random() * 10) + 5; // 5-15ms

		return { ...this.healthData };
	}

	/**
	 * Get performance metrics
	 */
	getPerformanceMetrics(): PerformanceMetrics {
		// Simulate dynamic values
		this.performanceData.responseTime.avg = Math.floor(Math.random() * 100) + 50;
		this.performanceData.throughput.requestsPerSecond = Math.floor(Math.random() * 100) + 200;
		this.performanceData.errorRate.percentage = Math.random() * 2; // 0-2%

		return { ...this.performanceData };
	} /**
	 * Log an error
	 */
	logError(error: Error, context?: Record<string, any>): void {
		this.recordMetric(
			"errors",
			1,
			{
				type: error.name,
				source: context?.source || "unknown",
			},
			{
				message: error.message,
				stack: error.stack,
				context,
			}
		);

		this.createAlert("error", `${error.name}: ${error.message}`, context?.source || "system", {
			error: error.message,
			context,
		});
	}

	/**
	 * Log a warning
	 */
	logWarning(message: string, source: string, metadata?: Record<string, any>): void {
		this.recordMetric("warnings", 1, { source }, metadata);
		this.createAlert("warning", message, source, metadata);
	}

	/**
	 * Log an info event
	 */
	logInfo(message: string, source: string, metadata?: Record<string, any>): void {
		this.recordMetric("info_events", 1, { source }, metadata);
		this.createAlert("info", message, source, metadata);
	}

	/**
	 * Track API response time
	 */
	trackApiResponse(endpoint: string, method: string, responseTime: number, statusCode: number): void {
		this.recordMetric("api_response_time", responseTime, {
			endpoint,
			method,
			status: statusCode.toString(),
		});

		this.recordMetric("api_requests", 1, {
			endpoint,
			method,
			status: statusCode.toString(),
		});

		if (statusCode >= 400) {
			this.recordMetric("api_errors", 1, {
				endpoint,
				method,
				status: statusCode.toString(),
			});
		}
	} /**
	 * Clear old data
	 */
	cleanup(olderThanMs: number = 24 * 60 * 60 * 1000): void {
		const cutoff = Date.now() - olderThanMs;

		// Clean metrics
		for (const [name, metrics] of this.metrics.entries()) {
			const filtered = metrics.filter((m) => m.timestamp > cutoff);
			this.metrics.set(name, filtered);
		}

		// Clean resolved alerts
		this.alerts = this.alerts.filter((alert) => !alert.resolved || alert.timestamp > cutoff);
	}

	private initializeMockData(): void {
		this.healthData = {
			status: "healthy",
			uptime: Date.now(),
			memory: {
				used: 1024 * 1024 * 512, // 512MB
				total: 1024 * 1024 * 1024 * 2, // 2GB
				percentage: 25,
			},
			cpu: {
				usage: 35,
				cores: 8,
			},
			database: {
				status: "connected",
				latency: 8,
				connections: 12,
			},
			services: {
				"auth-service": {
					status: "running",
					lastCheck: Date.now(),
					responseTime: 45,
				},
				"api-gateway": {
					status: "running",
					lastCheck: Date.now(),
					responseTime: 23,
				},
				"patient-service": {
					status: "running",
					lastCheck: Date.now(),
					responseTime: 67,
				},
				"appointment-service": {
					status: "running",
					lastCheck: Date.now(),
					responseTime: 34,
				},
			},
		};
		this.performanceData = {
			responseTime: {
				p50: 120,
				p95: 450,
				p99: 890,
				avg: 180,
			},
			throughput: {
				requestsPerSecond: 245,
				totalRequests: 1_234_567,
			},
			errorRate: {
				percentage: 0.8,
				count: 23,
			},
			availability: {
				percentage: 99.97,
				uptime: 24 * 60 * 60 * 1000 * 30, // 30 days
				downtime: 45 * 60 * 1000, // 45 minutes
			},
		};
	}

	private generateId(): string {
		return Math.random().toString(36).substring(2) + Date.now().toString(36);
	}
}

export const monitoringService = new MonitoringService();
export default monitoringService;
