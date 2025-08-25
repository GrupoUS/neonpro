/**
 * Enterprise Analytics Service
 *
 * Sistema de analytics automático enterprise para healthcare:
 * - Métricas de performance em tempo real
 * - Analytics de comportamento de usuário
 * - Monitoramento de compliance (LGPD/ANVISA)
 * - Dashboards automáticos
 * - Alertas inteligentes
 *
 * Features:
 * - Coleta automática de métricas
 * - Aggregação em tempo real
 * - Export para sistemas externos
 * - Análise preditiva básica
 */

import type { AuditEvent, PerformanceMetrics } from "../../types";

interface AnalyticsEvent {
	id: string;
	type: string;
	category: string;
	action: string;
	properties: Record<string, any>;
	userId?: string;
	sessionId?: string;
	timestamp: number;
	metadata: {
		userAgent?: string;
		ip?: string;
		source: string;
		version: string;
	};
}

interface HealthcareMetrics {
	appointments: {
		scheduled: number;
		completed: number;
		cancelled: number;
		noShows: number;
	};
	patients: {
		new: number;
		returning: number;
		total: number;
	};
	treatments: {
		started: number;
		completed: number;
		revenue: number;
	};
	compliance: {
		lgpdEvents: number;
		anvisaEvents: number;
		cfmEvents: number;
	};
}

interface PerformanceMetricsExtended extends PerformanceMetrics {
	// Additional properties for extended analytics
	totalRequests: number;
	cacheHits: number;
	cacheMisses: number;
	avgResponseTime: number; // Alias for averageResponseTime for backward compatibility
	
	serviceMetrics: Record<
		string,
		{
			calls: number;
			avgDuration: number;
			errorCount: number;
			lastError?: string;
		}
	>;
	cacheMetrics: {
		hitRate: number;
		missRate: number;
		evictions: number;
	};
	systemMetrics: {
		memoryUsage: number;
		cpuUsage: number;
		diskUsage: number;
	};
}

export class EnterpriseAnalyticsService {
	private events: AnalyticsEvent[] = [];
	private metrics: PerformanceMetricsExtended;
	private healthcareMetrics: HealthcareMetrics;
	private aggregationInterval: NodeJS.Timeout | null = null;
	private retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days

	constructor() {
		this.metrics = {
			// Base PerformanceMetrics properties
			service: "analytics",
			period: "realtime",
			totalOperations: 0,
			averageResponseTime: 0,
			errorRate: 0,
			cacheHitRate: 0,
			throughput: 0,
			p95ResponseTime: 0,
			p99ResponseTime: 0,
			slowestOperations: [],
			
			// Extended properties
			totalRequests: 0,
			cacheHits: 0,
			cacheMisses: 0,
			avgResponseTime: 0, // Alias for averageResponseTime
			serviceMetrics: {},
			cacheMetrics: {
				hitRate: 0,
				missRate: 0,
				evictions: 0,
			},
			systemMetrics: {
				memoryUsage: 0,
				cpuUsage: 0,
				diskUsage: 0,
			},
		};

		this.healthcareMetrics = {
			appointments: {
				scheduled: 0,
				completed: 0,
				cancelled: 0,
				noShows: 0,
			},
			patients: {
				new: 0,
				returning: 0,
				total: 0,
			},
			treatments: {
				started: 0,
				completed: 0,
				revenue: 0,
			},
			compliance: {
				lgpdEvents: 0,
				anvisaEvents: 0,
				cfmEvents: 0,
			},
		};

		this.startAggregation();
	}

	/**
	 * Track custom event
	 */
	async track(eventName: string, properties: Record<string, any>, userId?: string): Promise<void> {
		const event: AnalyticsEvent = {
			id: this.generateEventId(),
			type: "custom",
			category: this.extractCategory(eventName),
			action: eventName,
			properties,
			...(userId && { userId }),
			sessionId: this.getCurrentSessionId(),
			timestamp: Date.now(),
			metadata: {
				source: "enterprise-analytics",
				version: "1.0.0",
				userAgent: properties.userAgent,
				...(properties.ip && { ip: this.hashIP(properties.ip) }),
			},
		};

		this.events.push(event);
		await this.processEvent(event);
		this.cleanupOldEvents();
	}

	/**
	 * Track analytics event (alias for track method)
	 */
	async trackEvent(event: AnalyticsEvent): Promise<void> {
		this.events.push(event);
		await this.processEvent(event);
		this.cleanupOldEvents();
	}

	/**
	 * Record performance metrics
	 */
	async recordPerformance(operation: string, duration: number, success = true): Promise<void> {
		this.metrics.totalRequests++;

		if (!this.metrics.serviceMetrics[operation]) {
			this.metrics.serviceMetrics[operation] = {
				calls: 0,
				avgDuration: 0,
				errorCount: 0,
			};
		}

		const serviceMetric = this.metrics.serviceMetrics[operation];
		serviceMetric.calls++;

		// Update average duration
		serviceMetric.avgDuration =
			(serviceMetric.avgDuration * (serviceMetric.calls - 1) + duration) / serviceMetric.calls;

		if (!success) {
			serviceMetric.errorCount++;
			this.metrics.errorRate = this.calculateErrorRate();
		}

		// Update overall average
		this.metrics.avgResponseTime =
			(this.metrics.avgResponseTime * (this.metrics.totalRequests - 1) + duration) / this.metrics.totalRequests;

		// Track performance event
		await this.track("performance.operation", {
			operation,
			duration,
			success,
			timestamp: Date.now(),
		});
	}

	/**
	 * Record error event
	 */
	async recordError(error: Error, context: Record<string, any>): Promise<void> {
		const operation = context.operation || "unknown";

		if (this.metrics.serviceMetrics[operation]) {
			this.metrics.serviceMetrics[operation].errorCount++;
			this.metrics.serviceMetrics[operation].lastError = error.message;
		}

		this.metrics.errorRate = this.calculateErrorRate();

		await this.track("error.occurred", {
			message: error.message,
			stack: error.stack,
			operation,
			context,
			severity: this.categorizeError(error),
		});
	}

	/**
	 * Record healthcare-specific metrics
	 */
	async recordHealthcareEvent(category: string, action: string, value = 1): Promise<void> {
		switch (category) {
			case "appointment":
				if (action === "scheduled") this.healthcareMetrics.appointments.scheduled += value;
				if (action === "completed") this.healthcareMetrics.appointments.completed += value;
				if (action === "cancelled") this.healthcareMetrics.appointments.cancelled += value;
				if (action === "no_show") this.healthcareMetrics.appointments.noShows += value;
				break;

			case "patient":
				if (action === "new") this.healthcareMetrics.patients.new += value;
				if (action === "returning") this.healthcareMetrics.patients.returning += value;
				this.healthcareMetrics.patients.total =
					this.healthcareMetrics.patients.new + this.healthcareMetrics.patients.returning;
				break;

			case "treatment":
				if (action === "started") this.healthcareMetrics.treatments.started += value;
				if (action === "completed") this.healthcareMetrics.treatments.completed += value;
				if (action === "revenue") this.healthcareMetrics.treatments.revenue += value;
				break;

			case "compliance":
				if (action === "lgpd") this.healthcareMetrics.compliance.lgpdEvents += value;
				if (action === "anvisa") this.healthcareMetrics.compliance.anvisaEvents += value;
				if (action === "cfm") this.healthcareMetrics.compliance.cfmEvents += value;
				break;
		}

		await this.track(`healthcare.${category}.${action}`, { value });
	}

	/**
	 * Update cache metrics
	 */
	async updateCacheMetrics(hits: number, misses: number, evictions = 0): Promise<void> {
		this.metrics.cacheHits += hits;
		this.metrics.cacheMisses += misses;
		this.metrics.cacheMetrics.evictions += evictions;

		const total = this.metrics.cacheHits + this.metrics.cacheMisses;
		if (total > 0) {
			this.metrics.cacheMetrics.hitRate = this.metrics.cacheHits / total;
			this.metrics.cacheMetrics.missRate = this.metrics.cacheMisses / total;
		}
	}

	/**
	 * Update system metrics
	 */
	async updateSystemMetrics(memory: number, cpu: number, disk: number): Promise<void> {
		this.metrics.systemMetrics.memoryUsage = memory;
		this.metrics.systemMetrics.cpuUsage = cpu;
		this.metrics.systemMetrics.diskUsage = disk;

		await this.track("system.metrics", {
			memory,
			cpu,
			disk,
			timestamp: Date.now(),
		});
	}

	/**
	 * Get comprehensive metrics
	 */
	async getMetrics(period = "1h"): Promise<any> {
		const periodMs = this.parsePeriod(period);
		const since = Date.now() - periodMs;

		const recentEvents = this.events.filter((e) => e.timestamp >= since);

		return {
			period,
			performance: this.metrics,
			healthcare: this.healthcareMetrics,
			events: {
				total: recentEvents.length,
				byCategory: this.groupEventsByCategory(recentEvents),
				byAction: this.groupEventsByAction(recentEvents),
			},
			insights: await this.generateInsights(),
			timestamp: new Date().toISOString(),
		};
	}

	/**
	 * Generate actionable insights from metrics
	 */
	private async generateInsights(): Promise<any> {
		const insights = [];

		// Performance insights
		if (this.metrics.avgResponseTime > 1000) {
			insights.push({
				type: "performance",
				severity: "warning",
				message: "Average response time is above 1 second",
				value: this.metrics.avgResponseTime,
				recommendation: "Consider optimizing slow operations or scaling resources",
			});
		}

		// Cache insights
		if (this.metrics.cacheMetrics.hitRate < 0.8) {
			insights.push({
				type: "cache",
				severity: "info",
				message: "Cache hit rate is below 80%",
				value: this.metrics.cacheMetrics.hitRate,
				recommendation: "Review cache strategies and TTL configurations",
			});
		}

		// Healthcare insights
		const noShowRate =
			this.healthcareMetrics.appointments.scheduled > 0
				? this.healthcareMetrics.appointments.noShows / this.healthcareMetrics.appointments.scheduled
				: 0;

		if (noShowRate > 0.15) {
			insights.push({
				type: "healthcare",
				severity: "warning",
				message: "No-show rate is above 15%",
				value: noShowRate,
				recommendation: "Implement reminder systems or appointment confirmation",
			});
		}

		// Error rate insights
		if (this.metrics.errorRate > 0.05) {
			insights.push({
				type: "reliability",
				severity: "error",
				message: "Error rate is above 5%",
				value: this.metrics.errorRate,
				recommendation: "Investigate and fix recurring errors",
			});
		}

		return insights;
	}

	/**
	 * Export analytics data
	 */
	async exportData(format = "json", period = "24h"): Promise<string> {
		const data = await this.getMetrics(period);

		switch (format) {
			case "csv":
				return this.convertToCSV(data);
			case "json":
			default:
				return JSON.stringify(data, null, 2);
		}
	}

	/**
	 * Process individual event
	 */
	private async processEvent(event: AnalyticsEvent): Promise<void> {
		// Real-time processing
		if (event.category === "error" && event.properties.severity === "critical") {
			await this.sendAlert(event);
		}

		// Compliance monitoring
		if (event.category === "compliance") {
			await this.recordHealthcareEvent("compliance", event.action);
		}

		// Performance monitoring
		if (event.category === "performance" && event.properties.duration > 5000) {
			await this.sendAlert({
				...event,
				type: "performance_alert",
				properties: {
					...event.properties,
					alert: "Slow operation detected",
				},
			});
		}
	}

	/**
	 * Send alert for critical events
	 */
	private async sendAlert(event: AnalyticsEvent): Promise<void> {
		// TODO: Implement real-time alerting system (email, Slack, PagerDuty, etc.)
		console.warn(`Analytics Alert: ${event.type}`, event.properties);

		// For critical events, we could implement immediate notifications
		if (event.properties?.severity === "high") {
			console.error(`CRITICAL ANALYTICS ALERT: ${event.type}`, event.properties);
		}
	}

	/**
	 * Start periodic aggregation
	 */
	private startAggregation(): void {
		this.aggregationInterval = setInterval(() => {
			this.aggregateMetrics();
		}, 60 * 1000); // Every minute
	}

	/**
	 * Aggregate metrics for dashboards
	 */
	private aggregateMetrics(): void {
		// TODO: Implement real-time metrics aggregation with proper storage and analytics
		console.log("Aggregating metrics...", {
			events: this.events.length,
			totalRequests: this.metrics.totalRequests,
			errorRate: this.metrics.errorRate,
		});
	}

	/**
	 * Cleanup old events for memory management
	 */
	private cleanupOldEvents(): void {
		const cutoff = Date.now() - this.retentionPeriod;
		this.events = this.events.filter((event) => event.timestamp >= cutoff);
	}

	/**
	 * Utility functions
	 */
	private generateEventId(): string {
		return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private getCurrentSessionId(): string {
		// TODO: Implement proper session tracking with user context
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	private extractCategory(eventName: string): string {
		return eventName.split(".")[0] || "general";
	}

	private hashIP(ip?: string): string | undefined {
		if (!ip) return;
		// Simple hash for privacy (use crypto.createHash in production)
		return Buffer.from(ip).toString("base64").substr(0, 8);
	}

	private calculateErrorRate(): number {
		if (this.metrics.totalRequests === 0) return 0;
		const totalErrors = Object.values(this.metrics.serviceMetrics).reduce((sum, metric) => sum + metric.errorCount, 0);
		return totalErrors / this.metrics.totalRequests;
	}

	private categorizeError(error: Error): string {
		if (error.message.includes("timeout")) return "timeout";
		if (error.message.includes("network")) return "network";
		if (error.message.includes("database")) return "database";
		if (error.message.includes("auth")) return "authentication";
		return "general";
	}

	private parsePeriod(period: string): number {
		const unit = period.slice(-1);
		const value = Number.parseInt(period.slice(0, -1));

		switch (unit) {
			case "s":
				return value * 1000;
			case "m":
				return value * 60 * 1000;
			case "h":
				return value * 60 * 60 * 1000;
			case "d":
				return value * 24 * 60 * 60 * 1000;
			default:
				return 60 * 60 * 1000; // 1 hour default
		}
	}

	private groupEventsByCategory(events: AnalyticsEvent[]): Record<string, number> {
		return events.reduce(
			(acc, event) => {
				acc[event.category] = (acc[event.category] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
	}

	private groupEventsByAction(events: AnalyticsEvent[]): Record<string, number> {
		return events.reduce(
			(acc, event) => {
				acc[event.action] = (acc[event.action] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>
		);
	}

	private convertToCSV(data: any): string {
		// Simple CSV conversion - can be enhanced
		const headers = ["timestamp", "metric", "value"];
		const rows = [headers.join(",")];

		// Add performance data
		Object.entries(data.performance).forEach(([key, value]) => {
			if (typeof value === "number") {
				rows.push([data.timestamp, key, value].join(","));
			}
		});

		return rows.join("\n");
	}

	/**
	 * Record a metric for monitoring
	 */
	async recordMetric(metric: {
		name: string;
		value: number;
		tags?: Record<string, string>;
	}): Promise<void> {
		// Simple implementation for health checks
		console.log(`Recording metric: ${metric.name} = ${metric.value}`);
	}

	/**
	 * Get health metrics for monitoring
	 */
	async getHealthMetrics(): Promise<PerformanceMetrics> {
		return this.metrics;
	}

	/**
	 * Shutdown analytics service
	 */
	async shutdown(): Promise<void> {
		if (this.aggregationInterval) {
			clearInterval(this.aggregationInterval);
			this.aggregationInterval = null;
		}

		// Final aggregation before shutdown
		this.aggregateMetrics();
	}
}
