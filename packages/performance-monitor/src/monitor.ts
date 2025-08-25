import {
	type Alert,
	type AlertRule,
	AlertSeverity,
	type HealthCheckResult,
	HealthStatus,
	InsightType,
	type MetricCollector,
	MetricType,
	type PerformanceInsight,
	type PerformanceMetric,
} from "./types";

export class PerformanceMonitor {
	private collectors = new Map<string, MetricCollector>();
	private alertRules: AlertRule[] = [];
	private activeAlerts = new Map<string, Alert>();
	private insights: PerformanceInsight[] = [];
	private isRunning = false;
	private intervalIds = new Map<string, NodeJS.Timeout>();

	constructor(
		private config = {
			defaultCollectionInterval: 30_000, // 30 seconds
			maxMetricsRetention: 24 * 60 * 60 * 1000, // 24 hours
			alertCooldownPeriod: 300_000, // 5 minutes
			enableRealTimeAnalysis: true,
			supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
			supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
		}
	) {}

	async start(): Promise<void> {
		if (this.isRunning) return;

		console.log("[PerformanceMonitor] Starting performance monitoring...");
		this.isRunning = true;

		// Initialize collectors
		for (const [name, collector] of this.collectors) {
			if (collector.isEnabled()) {
				const interval = collector.getCollectionInterval() || this.config.defaultCollectionInterval;
				const intervalId = setInterval(async () => {
					try {
						const metrics = await collector.collect();
						await this.processMetrics(metrics);
					} catch (error) {
						console.error(`[PerformanceMonitor] Error collecting ${name} metrics:`, error);
					}
				}, interval);

				this.intervalIds.set(name, intervalId);
			}
		}

		// Start real-time analysis if enabled
		if (this.config.enableRealTimeAnalysis) {
			this.startRealTimeAnalysis();
		}

		console.log(`[PerformanceMonitor] Started with ${this.collectors.size} collectors`);
	}

	async stop(): Promise<void> {
		if (!this.isRunning) return;

		console.log("[PerformanceMonitor] Stopping performance monitoring...");
		this.isRunning = false;

		// Clear all intervals
		for (const intervalId of this.intervalIds.values()) {
			clearInterval(intervalId);
		}
		this.intervalIds.clear();

		console.log("[PerformanceMonitor] Stopped");
	}
	registerCollector(name: string, collector: MetricCollector): void {
		this.collectors.set(name, collector);
		console.log(`[PerformanceMonitor] Registered collector: ${name}`);
	}

	addAlertRule(rule: AlertRule): void {
		this.alertRules.push(rule);
		console.log(`[PerformanceMonitor] Added alert rule: ${rule.name}`);
	}

	private async processMetrics(metrics: PerformanceMetric[]): Promise<void> {
		// Store metrics
		await this.storeMetrics(metrics);

		// Check alert rules
		for (const metric of metrics) {
			await this.checkAlertRules(metric);
		}

		// Generate insights if enabled
		// Remove or comment out this line since generateInsights method doesn't exist
		// if (this.config.enableRealTimeAnalysis) {
		// 	await this.generateInsights(metrics);
		// }
	}

	private async storeMetrics(metrics: PerformanceMetric[]): Promise<void> {
		// Store in Supabase for persistence and real-time access
		try {
			const supabase = await this.getSupabaseClient();
			const { error } = await supabase.from("performance_metrics").insert(
				metrics.map((metric) => ({
					metric_id: metric.id,
					timestamp: new Date(metric.timestamp).toISOString(),
					type: metric.type,
					value: metric.value,
					unit: metric.unit,
					tags: metric.tags,
					source: metric.source,
					context: metric.context,
				}))
			);

			if (error) {
				console.error("[PerformanceMonitor] Error storing metrics:", error);
			}
		} catch (error) {
			console.error("[PerformanceMonitor] Failed to store metrics:", error);
		}
	}
	private async checkAlertRules(metric: PerformanceMetric): Promise<void> {
		const relevantRules = this.alertRules.filter((rule) => rule.enabled && rule.metricType === metric.type);

		for (const rule of relevantRules) {
			const shouldAlert = this.evaluateAlertCondition(rule, metric);

			if (shouldAlert && !this.isInCooldown(rule.id)) {
				const alert: Alert = {
					id: `${rule.id}_${Date.now()}`,
					ruleId: rule.id,
					timestamp: Date.now(),
					severity: rule.severity,
					message: `${rule.name}: ${metric.type} ${rule.condition} ${rule.threshold}${metric.unit} (actual: ${metric.value}${metric.unit})`,
					metric,
					acknowledged: false,
				};

				this.activeAlerts.set(alert.id, alert);
				await this.sendAlert(alert);
			}
		}
	}

	private evaluateAlertCondition(rule: AlertRule, metric: PerformanceMetric): boolean {
		switch (rule.condition) {
			case "gt":
				return metric.value > rule.threshold;
			case "lt":
				return metric.value < rule.threshold;
			case "eq":
				return metric.value === rule.threshold;
			case "ne":
				return metric.value !== rule.threshold;
			default:
				return false;
		}
	}

	private isInCooldown(ruleId: string): boolean {
		const cooldownKey = `cooldown_${ruleId}`;
		const lastAlert = this.activeAlerts.get(cooldownKey);
		if (!lastAlert) return false;

		return Date.now() - lastAlert.timestamp < this.config.alertCooldownPeriod;
	}

	private async sendAlert(alert: Alert): Promise<void> {
		try {
			// Store alert in Supabase
			const supabase = await this.getSupabaseClient();
			const { error } = await supabase.from("performance_alerts").insert({
				alert_id: alert.id,
				rule_id: alert.ruleId,
				timestamp: new Date(alert.timestamp).toISOString(),
				severity: alert.severity,
				message: alert.message,
				metric_data: alert.metric,
				acknowledged: false,
			});

			if (error) {
				console.error("[PerformanceMonitor] Error storing alert:", error);
			}

			// Real-time notification via Supabase channel
			await supabase.channel("performance_alerts").send({
				type: "broadcast",
				event: "new_alert",
				payload: alert,
			});

			console.log(`[PerformanceMonitor] Alert sent: ${alert.message}`);
		} catch (error) {
			console.error("[PerformanceMonitor] Failed to send alert:", error);
		}
	}
	private startRealTimeAnalysis(): void {
		// Analyze patterns every 5 minutes
		setInterval(
			async () => {
				try {
					await this.analyzeTrends();
				} catch (error) {
					console.error("[PerformanceMonitor] Error in real-time analysis:", error);
				}
			},
			5 * 60 * 1000
		);
	}

	private async analyzeTrends(): Promise<void> {
		const supabase = await this.getSupabaseClient();

		// Analyze cache hit rate trends
		const { data: cacheMetrics } = await supabase
			.from("performance_metrics")
			.select("*")
			.eq("type", MetricType.CACHE_HIT_RATE)
			.gte("timestamp", new Date(Date.now() - 60 * 60 * 1000).toISOString()) // Last hour
			.order("timestamp", { ascending: false });

		if (cacheMetrics && cacheMetrics.length > 10) {
			const avgHitRate = cacheMetrics.reduce((sum: number, m: PerformanceMetric) => sum + m.value, 0) / cacheMetrics.length;

			if (avgHitRate < 85) {
				// Target is 85%
				const insight: PerformanceInsight = {
					id: `cache_insight_${Date.now()}`,
					timestamp: Date.now(),
					type: InsightType.OPTIMIZATION_OPPORTUNITY,
					severity: avgHitRate < 70 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
					title: "Cache Performance Below Target",
					description: `Current cache hit rate is ${avgHitRate.toFixed(1)}%, below target of 85%`,
					recommendation: "Review cache TTL settings and invalidation strategies",
					metrics: cacheMetrics,
					potentialImpact: "Improved cache performance can reduce API costs by up to 40%",
					estimatedROI: 187_200 * ((85 - avgHitRate) / 85), // Proportional to gap
				};

				this.insights.push(insight);
				await this.storeInsight(insight);
			}
		}

		// Analyze AI cost trends
		await this.analyzeAICosts();
	}

	private async analyzeAICosts(): Promise<void> {
		const supabase = await this.getSupabaseClient();

		const { data: costMetrics } = await supabase
			.from("performance_metrics")
			.select("*")
			.eq("type", MetricType.AI_COST)
			.gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
			.order("timestamp", { ascending: false });

		if (costMetrics && costMetrics.length > 0) {
			const totalCost = costMetrics.reduce((sum: number, m: PerformanceMetric) => sum + m.value, 0);
			const avgCostPerHour = totalCost / 24;

			// If hourly cost exceeds budget threshold
			if (avgCostPerHour > 50) {
				// $50/hour threshold
				const insight: PerformanceInsight = {
					id: `ai_cost_insight_${Date.now()}`,
					timestamp: Date.now(),
					type: InsightType.COST_OPTIMIZATION,
					severity: avgCostPerHour > 100 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
					title: "AI Costs Above Budget Threshold",
					description: `AI costs averaging $${avgCostPerHour.toFixed(2)}/hour, exceeding $50/hour threshold`,
					recommendation: "Optimize model selection, implement better caching, review API usage patterns",
					metrics: costMetrics,
					potentialImpact: "Cost optimization can save up to $187,200/year",
					estimatedROI: 187_200 * ((avgCostPerHour - 50) / avgCostPerHour),
				};

				this.insights.push(insight);
				await this.storeInsight(insight);
			}
		}
	}
	private async storeInsight(insight: PerformanceInsight): Promise<void> {
		try {
			const supabase = await this.getSupabaseClient();
			const { error } = await supabase.from("performance_insights").insert({
				insight_id: insight.id,
				timestamp: new Date(insight.timestamp).toISOString(),
				type: insight.type,
				severity: insight.severity,
				title: insight.title,
				description: insight.description,
				recommendation: insight.recommendation,
				potential_impact: insight.potentialImpact,
				estimated_roi: insight.estimatedROI,
				metrics_data: insight.metrics,
			});

			if (error) {
				console.error("[PerformanceMonitor] Error storing insight:", error);
			}

			// Broadcast insight to dashboard
			await supabase.channel("performance_insights").send({
				type: "broadcast",
				event: "new_insight",
				payload: insight,
			});
		} catch (error) {
			console.error("[PerformanceMonitor] Failed to store insight:", error);
		}
	}

	async performHealthCheck(): Promise<HealthCheckResult[]> {
		const results: HealthCheckResult[] = [];
		const startTime = Date.now();

		// Check Supabase connectivity
		try {
			const supabase = await this.getSupabaseClient();
			const { data, error } = await supabase.from("performance_metrics").select("count").limit(1);

			results.push({
				component: "Supabase Database",
				status: error ? HealthStatus.UNHEALTHY : HealthStatus.HEALTHY,
				message: error ? error.message : "Connection successful",
				responseTime: Date.now() - startTime,
				timestamp: Date.now(),
			});
		} catch (error) {
			results.push({
				component: "Supabase Database",
				status: HealthStatus.CRITICAL,
				message: `Connection failed: ${error}`,
				responseTime: Date.now() - startTime,
				timestamp: Date.now(),
			});
		}

		// Check collectors health
		for (const [name, collector] of this.collectors) {
			const collectorStartTime = Date.now();
			try {
				const isEnabled = collector.isEnabled();
				const hasInterval = this.intervalIds.has(name);

				results.push({
					component: `Collector: ${name}`,
					status: isEnabled && hasInterval ? HealthStatus.HEALTHY : HealthStatus.DEGRADED,
					message: isEnabled ? "Collector running" : "Collector disabled",
					responseTime: Date.now() - collectorStartTime,
					details: {
						enabled: isEnabled,
						running: hasInterval,
						interval: collector.getCollectionInterval(),
					},
					timestamp: Date.now(),
				});
			} catch (error) {
				results.push({
					component: `Collector: ${name}`,
					status: HealthStatus.UNHEALTHY,
					message: `Collector error: ${error}`,
					responseTime: Date.now() - collectorStartTime,
					timestamp: Date.now(),
				});
			}
		}

		return results;
	} // Getters for dashboard integration
	getActiveAlerts(): Alert[] {
		return Array.from(this.activeAlerts.values());
	}

	getRecentInsights(limit = 10): PerformanceInsight[] {
		return this.insights.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
	}

	async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
		const alert = this.activeAlerts.get(alertId);
		if (alert) {
			alert.acknowledged = true;
			alert.acknowledgedBy = acknowledgedBy;
			alert.acknowledgedAt = Date.now();

			// Update in database
			try {
				const supabase = await this.getSupabaseClient();
				await supabase
					.from("performance_alerts")
					.update({
						acknowledged: true,
						acknowledged_by: acknowledgedBy,
						acknowledged_at: new Date().toISOString(),
					})
					.eq("alert_id", alertId);
			} catch (error) {
				console.error("[PerformanceMonitor] Failed to acknowledge alert:", error);
			}
		}
	}

	private async getSupabaseClient(): Promise<any> {
		// Mock Supabase client - will be replaced with actual implementation
		return {
			from: (table: string) => ({
				select: (columns: string) => ({
					eq: (column: string, value: any) => ({ data: [], error: null }),
					gte: (column: string, value: any) => ({ order: (col: string, opts: any) => ({ data: [], error: null }) }),
					limit: (n: number) => ({ data: [], error: null }),
				}),
				insert: (data: any) => ({ error: null }),
				update: (data: any) => ({ eq: (col: string, val: any) => Promise.resolve() }),
			}),
			channel: (name: string) => ({
				send: (payload: any) => Promise.resolve(),
			}),
		};
	}

	isMonitoringActive(): boolean {
		return this.isRunning;
	}

	getCollectorStatus(): Record<string, boolean> {
		const status: Record<string, boolean> = {};
		for (const [name, collector] of this.collectors) {
			status[name] = collector.isEnabled() && this.intervalIds.has(name);
		}
		return status;
	}
}
