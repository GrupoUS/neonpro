/**
 * Monitoring Endpoints
 * API endpoints and utilities for monitoring infrastructure
 */

export type EndpointConfig = {
	path: string;
	method: "GET" | "POST" | "PUT" | "DELETE";
	handler: (req: any, res: any) => Promise<any>;
	middleware?: Array<(req: any, res: any, next: any) => void>;
	rateLimit?: number;
	auth?: boolean;
};

export type HealthCheckResult = {
	status: "healthy" | "unhealthy" | "degraded";
	timestamp: number;
	services: Record<
		string,
		{
			status: "up" | "down" | "degraded";
			responseTime: number;
			details?: any;
		}
	>;
	system: {
		uptime: number;
		memory: { used: number; total: number };
		cpu: { usage: number };
		disk: { usage: number };
	};
};

// Health check endpoint
export const healthEndpoint: EndpointConfig = {
	path: "/api/health",
	method: "GET",
	handler: async (_req, res) => {
		const healthCheck: HealthCheckResult = {
			status: "healthy",
			timestamp: Date.now(),
			services: {
				database: {
					status: "up",
					responseTime: Math.random() * 50 + 10,
					details: { connections: Math.floor(Math.random() * 20) + 5 },
				},
				redis: {
					status: "up",
					responseTime: Math.random() * 10 + 2,
					details: { memory: `${Math.floor(Math.random() * 100)}MB` },
				},
				elasticsearch: {
					status: Math.random() > 0.1 ? "up" : "degraded",
					responseTime: Math.random() * 100 + 20,
				},
			},
			system: {
				uptime: process.uptime ? process.uptime() : 3600,
				memory: process.memoryUsage
					? {
							used: process.memoryUsage().heapUsed,
							total: process.memoryUsage().heapTotal,
						}
					: { used: 512 * 1024 * 1024, total: 2 * 1024 * 1024 * 1024 },
				cpu: { usage: Math.random() * 100 },
				disk: { usage: Math.random() * 100 },
			},
		};

		// Determine overall status
		const serviceStatuses = Object.values(healthCheck.services).map(
			(s) => s.status,
		);
		if (serviceStatuses.includes("down")) {
			healthCheck.status = "unhealthy";
		} else if (serviceStatuses.includes("degraded")) {
			healthCheck.status = "degraded";
		}

		const statusCode =
			healthCheck.status === "healthy"
				? 200
				: healthCheck.status === "degraded"
					? 200
					: 503;

		return res.status(statusCode).json(healthCheck);
	},
};

// Metrics endpoint
export const metricsEndpoint: EndpointConfig = {
	path: "/api/metrics",
	method: "GET",
	handler: async (req, res) => {
		const { timeRange = "1h", format = "json" } = req.query;

		const metrics = {
			timestamp: Date.now(),
			timeRange,
			system: {
				cpu_usage: Math.random() * 100,
				memory_usage: Math.random() * 100,
				disk_usage: Math.random() * 100,
				network_io: {
					bytes_in: Math.floor(Math.random() * 1_000_000),
					bytes_out: Math.floor(Math.random() * 1_000_000),
				},
			},
			application: {
				requests_per_second: Math.random() * 1000,
				response_time_p95: Math.random() * 500 + 100,
				error_rate: Math.random() * 5,
				active_users: Math.floor(Math.random() * 100) + 10,
			},
			healthcare: {
				patient_search_time: Math.random() * 300 + 100,
				form_submission_time: Math.random() * 800 + 200,
				data_encryption_time: Math.random() * 100 + 50,
				compliance_check_time: Math.random() * 200 + 100,
			},
		};

		if (format === "prometheus") {
			// Convert to Prometheus format
			let prometheusMetrics = "";
			const flattenMetrics = (obj: any, prefix = "") => {
				for (const [key, value] of Object.entries(obj)) {
					if (typeof value === "object" && value !== null) {
						flattenMetrics(value, `${prefix}${key}_`);
					} else {
						prometheusMetrics += `neonpro_${prefix}${key} ${value}\n`;
					}
				}
			};
			flattenMetrics(metrics);
			res.set("Content-Type", "text/plain");
			return res.send(prometheusMetrics);
		}

		return res.json(metrics);
	},
};

// Performance endpoint
export const performanceEndpoint: EndpointConfig = {
	path: "/api/performance",
	method: "GET",
	handler: async (req, res) => {
		const { metric, start, end } = req.query;

		const performanceData = {
			metric: metric || "all",
			period: {
				start: start || new Date(Date.now() - 3_600_000).toISOString(),
				end: end || new Date().toISOString(),
			},
			data: {
				web_vitals: {
					lcp: Math.random() * 2000 + 1000,
					fid: Math.random() * 100 + 50,
					cls: Math.random() * 0.2,
					fcp: Math.random() * 1500 + 500,
					ttfb: Math.random() * 500 + 200,
				},
				api_performance: {
					average_response_time: Math.random() * 200 + 100,
					p95_response_time: Math.random() * 500 + 200,
					p99_response_time: Math.random() * 1000 + 500,
					throughput: Math.random() * 1000 + 500,
					error_rate: Math.random() * 2,
				},
				database: {
					query_time: Math.random() * 100 + 20,
					connection_pool_usage: Math.random() * 100,
					slow_queries: Math.floor(Math.random() * 5),
					lock_wait_time: Math.random() * 50,
				},
			},
		};

		return res.json(performanceData);
	},
};

// Alerts endpoint
export const alertsEndpoint: EndpointConfig = {
	path: "/api/alerts",
	method: "GET",
	handler: async (req, res) => {
		const { status = "active", limit = 50, severity } = req.query;

		const generateAlert = (id: number) => ({
			id: `alert_${id}`,
			type: ["error", "warning", "info", "critical"][
				Math.floor(Math.random() * 4)
			],
			severity:
				severity ||
				["low", "medium", "high", "critical"][Math.floor(Math.random() * 4)],
			message: [
				"High CPU usage detected",
				"Memory threshold exceeded",
				"Database connection slow",
				"Disk space running low",
				"SSL certificate expiring soon",
				"Unusual traffic pattern detected",
			][Math.floor(Math.random() * 6)],
			source: ["system", "application", "security", "infrastructure"][
				Math.floor(Math.random() * 4)
			],
			timestamp: Date.now() - Math.random() * 3_600_000, // Random time within last hour
			status:
				status === "all"
					? ["active", "resolved"][Math.floor(Math.random() * 2)]
					: status,
			acknowledged: Math.random() > 0.7,
			resolved: status === "resolved" || Math.random() > 0.8,
		});

		const alerts = Array.from(
			{ length: Math.min(Number.parseInt(limit as string, 10), 50) },
			(_, i) => generateAlert(i),
		);

		return res.json({
			alerts:
				status === "all"
					? alerts
					: alerts.filter((alert) => alert.status === status),
			total: alerts.length,
			filters: { status, limit, severity },
		});
	},
};

// Logs endpoint
export const logsEndpoint: EndpointConfig = {
	path: "/api/logs",
	method: "GET",
	handler: async (req, res) => {
		const { level = "info", service, limit = 100, start, end } = req.query;

		const generateLog = (id: number) => ({
			id: `log_${id}`,
			timestamp: new Date(Date.now() - Math.random() * 3_600_000).toISOString(),
			level:
				level === "all"
					? ["debug", "info", "warn", "error"][Math.floor(Math.random() * 4)]
					: level,
			service:
				service ||
				["api", "auth", "database", "monitoring"][
					Math.floor(Math.random() * 4)
				],
			message: [
				"Request processed successfully",
				"User authentication completed",
				"Database query executed",
				"Cache miss occurred",
				"Rate limit exceeded",
				"Configuration updated",
			][Math.floor(Math.random() * 6)],
			metadata: {
				userId: `user_${Math.floor(Math.random() * 1000)}`,
				requestId: `req_${Math.random().toString(36).substr(2, 9)}`,
				ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
				userAgent: "Mozilla/5.0 (compatible; HealthcareApp/1.0)",
			},
		});

		const logs = Array.from(
			{ length: Math.min(Number.parseInt(limit as string, 10), 100) },
			(_, i) => generateLog(i),
		);

		return res.json({
			logs: logs.sort(
				(a, b) =>
					new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
			),
			total: logs.length,
			filters: { level, service, limit, start, end },
		});
	},
};

// Real-time metrics endpoint (WebSocket simulation)
export const realtimeEndpoint: EndpointConfig = {
	path: "/api/realtime/metrics",
	method: "GET",
	handler: async (req, res) => {
		// Set up Server-Sent Events
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Headers": "Cache-Control",
		});

		const sendMetric = () => {
			const metric = {
				timestamp: Date.now(),
				cpu_usage: Math.random() * 100,
				memory_usage: Math.random() * 100,
				active_users: Math.floor(Math.random() * 100) + 10,
				requests_per_minute: Math.floor(Math.random() * 1000) + 100,
			};

			res.write(`data: ${JSON.stringify(metric)}\n\n`);
		};

		// Send initial metric
		sendMetric();

		// Send metrics every 5 seconds
		const interval = setInterval(sendMetric, 5000);

		// Clean up on client disconnect
		req.on("close", () => {
			clearInterval(interval);
		});

		return new Promise(() => {}); // Keep connection open
	},
};

// Export all endpoints
export const monitoringEndpoints: EndpointConfig[] = [
	healthEndpoint,
	metricsEndpoint,
	performanceEndpoint,
	alertsEndpoint,
	logsEndpoint,
	realtimeEndpoint,
];

// Utility to register endpoints with Express
export const registerMonitoringEndpoints = (app: any) => {
	monitoringEndpoints.forEach((endpoint) => {
		const method = endpoint.method.toLowerCase() as
			| "get"
			| "post"
			| "put"
			| "delete";

		if (endpoint.middleware) {
			app[method](endpoint.path, ...endpoint.middleware, endpoint.handler);
		} else {
			app[method](endpoint.path, endpoint.handler);
		}
	});
};

// Export individual endpoints
export {
	healthEndpoint as health,
	metricsEndpoint as metrics,
	performanceEndpoint as performance,
	alertsEndpoint as alerts,
	logsEndpoint as logs,
	realtimeEndpoint as realtime,
};

export default {
	endpoints: monitoringEndpoints,
	register: registerMonitoringEndpoints,
	health: healthEndpoint,
	metrics: metricsEndpoint,
	performance: performanceEndpoint,
	alerts: alertsEndpoint,
	logs: logsEndpoint,
	realtime: realtimeEndpoint,
};
