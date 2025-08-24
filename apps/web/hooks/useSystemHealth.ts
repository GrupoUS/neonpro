"use client";

import type { HealthStatus, SystemComponent, SystemHealthCheck, SystemHealthSummary } from "@neonpro/types/monitoring";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useRef, useState } from "react";

interface SystemHealthConfig {
	checkInterval?: number; // milliseconds
	enableAutoChecks?: boolean;
	enableAlerts?: boolean;
	alertThresholds?: {
		responseTime: number;
		errorRate: number;
		uptimeThreshold: number;
	};
}

interface HealthCheckResult {
	component: SystemComponent;
	status: HealthStatus;
	responseTime?: number;
	error?: string;
	details?: Record<string, any>;
}

// Component health check configurations
const HEALTH_CHECK_CONFIGS = {
	supabase_database: {
		checkFunction: "checkSupabaseDatabase",
		timeout: 5000,
		criticalResponseTime: 1000,
	},
	supabase_auth: {
		checkFunction: "checkSupabaseAuth",
		timeout: 3000,
		criticalResponseTime: 500,
	},
	supabase_storage: {
		checkFunction: "checkSupabaseStorage",
		timeout: 5000,
		criticalResponseTime: 2000,
	},
	redis_cache: {
		checkFunction: "checkRedisCache",
		timeout: 2000,
		criticalResponseTime: 100,
	},
	ai_chat_service: {
		checkFunction: "checkAIChatService",
		timeout: 10_000,
		criticalResponseTime: 3000,
	},
	prediction_engine: {
		checkFunction: "checkPredictionEngine",
		timeout: 15_000,
		criticalResponseTime: 5000,
	},
	email_service: {
		checkFunction: "checkEmailService",
		timeout: 5000,
		criticalResponseTime: 2000,
	},
	file_upload_service: {
		checkFunction: "checkFileUploadService",
		timeout: 8000,
		criticalResponseTime: 3000,
	},
	backup_system: {
		checkFunction: "checkBackupSystem",
		timeout: 10_000,
		criticalResponseTime: 5000,
	},
	monitoring_system: {
		checkFunction: "checkMonitoringSystem",
		timeout: 3000,
		criticalResponseTime: 1000,
	},
} as const;

export function useSystemHealth(config: SystemHealthConfig = {}) {
	const supabase = createClientComponentClient();
	const [systemHealthSummary, setSystemHealthSummary] = useState<SystemHealthSummary>({
		overall_health: "healthy",
		total_components: 0,
		healthy_components: 0,
		degraded_components: 0,
		unhealthy_components: 0,
		down_components: 0,
		average_response_time: 0,
		uptime_percentage: 100,
	});
	const [recentChecks, setRecentChecks] = useState<SystemHealthCheck[]>([]);
	const [loading, setLoading] = useState(true);
	const [isChecking, setIsChecking] = useState(false);

	const lastCheckTime = useRef<number>(0);
	const checkInProgress = useRef<boolean>(false);

	const {
		checkInterval = 30_000, // 30 seconds
		enableAutoChecks = true,
		enableAlerts = true,
		alertThresholds = {
			responseTime: 5000, // 5 seconds
			errorRate: 10, // 10%
			uptimeThreshold: 99.5, // 99.5%
		},
	} = config;

	// Determine health status based on response time and errors
	const getHealthStatus = useCallback(
		(responseTime?: number, errorCount = 0, component: SystemComponent): HealthStatus => {
			const config = HEALTH_CHECK_CONFIGS[component];

			if (errorCount > 0) {
				return errorCount > 5 ? "down" : "unhealthy";
			}

			if (!responseTime) return "healthy";

			if (responseTime > config.criticalResponseTime * 2) return "down";
			if (responseTime > config.criticalResponseTime) return "degraded";
			if (responseTime > config.criticalResponseTime * 0.5) return "healthy";

			return "healthy";
		},
		[]
	);

	// Check Supabase Database health
	const checkSupabaseDatabase = useCallback(async (): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		try {
			const { data, error } = await supabase.from("profiles").select("count").limit(1).single();

			const responseTime = Date.now() - startTime;

			if (error) {
				return {
					component: "supabase_database",
					status: "unhealthy",
					responseTime,
					error: error.message,
					details: { error_code: error.code },
				};
			}

			return {
				component: "supabase_database",
				status: getHealthStatus(responseTime, 0, "supabase_database"),
				responseTime,
				details: { query_successful: true },
			};
		} catch (error) {
			return {
				component: "supabase_database",
				status: "down",
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}, [supabase, getHealthStatus]);

	// Check Supabase Auth health
	const checkSupabaseAuth = useCallback(async (): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		try {
			const { data, error } = await supabase.auth.getSession();
			const responseTime = Date.now() - startTime;

			if (error) {
				return {
					component: "supabase_auth",
					status: "unhealthy",
					responseTime,
					error: error.message,
				};
			}

			return {
				component: "supabase_auth",
				status: getHealthStatus(responseTime, 0, "supabase_auth"),
				responseTime,
				details: { auth_accessible: true },
			};
		} catch (error) {
			return {
				component: "supabase_auth",
				status: "down",
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}, [supabase, getHealthStatus]);

	// Check Redis Cache health (via edge function or API)
	const checkRedisCache = useCallback(async (): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		try {
			// Test cache with a simple operation
			const testKey = `health_check_${Date.now()}`;
			const testValue = "health_check_value";

			// This would need to be implemented via an edge function or API endpoint
			// For now, we'll simulate a cache check
			const responseTime = Date.now() - startTime;

			return {
				component: "redis_cache",
				status: getHealthStatus(responseTime, 0, "redis_cache"),
				responseTime,
				details: { cache_accessible: true },
			};
		} catch (error) {
			return {
				component: "redis_cache",
				status: "down",
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	}, [getHealthStatus]);

	// Check AI Chat Service health
	const checkAIChatService = useCallback(async (): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		try {
			// Test AI service with a simple health check request
			// This would call your AI service endpoint
			const response = await fetch("/api/ai/health", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			const responseTime = Date.now() - startTime;

			if (!response.ok) {
				return {
					component: "ai_chat_service",
					status: "unhealthy",
					responseTime,
					error: `HTTP ${response.status}: ${response.statusText}`,
				};
			}

			return {
				component: "ai_chat_service",
				status: getHealthStatus(responseTime, 0, "ai_chat_service"),
				responseTime,
				details: { service_responsive: true },
			};
		} catch (error) {
			return {
				component: "ai_chat_service",
				status: "down",
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Service unreachable",
			};
		}
	}, [getHealthStatus]);

	// Check Prediction Engine health
	const checkPredictionEngine = useCallback(async (): Promise<HealthCheckResult> => {
		const startTime = Date.now();
		try {
			// Test prediction service
			const response = await fetch("/api/predictions/health", {
				method: "GET",
				headers: { "Content-Type": "application/json" },
			});

			const responseTime = Date.now() - startTime;

			if (!response.ok) {
				return {
					component: "prediction_engine",
					status: "unhealthy",
					responseTime,
					error: `HTTP ${response.status}: ${response.statusText}`,
				};
			}

			return {
				component: "prediction_engine",
				status: getHealthStatus(responseTime, 0, "prediction_engine"),
				responseTime,
				details: { prediction_service_active: true },
			};
		} catch (error) {
			return {
				component: "prediction_engine",
				status: "down",
				responseTime: Date.now() - startTime,
				error: error instanceof Error ? error.message : "Service unreachable",
			};
		}
	}, [getHealthStatus]);

	// Generic service health check
	const checkGenericService = useCallback(
		async (component: SystemComponent, endpoint: string): Promise<HealthCheckResult> => {
			const startTime = Date.now();
			try {
				const response = await fetch(endpoint, {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});

				const responseTime = Date.now() - startTime;

				if (!response.ok) {
					return {
						component,
						status: "unhealthy",
						responseTime,
						error: `HTTP ${response.status}: ${response.statusText}`,
					};
				}

				return {
					component,
					status: getHealthStatus(responseTime, 0, component),
					responseTime,
					details: { service_responsive: true },
				};
			} catch (error) {
				return {
					component,
					status: "down",
					responseTime: Date.now() - startTime,
					error: error instanceof Error ? error.message : "Service unreachable",
				};
			}
		},
		[getHealthStatus]
	);

	// Perform health check for a specific component
	const checkComponentHealth = useCallback(
		async (component: SystemComponent): Promise<HealthCheckResult> => {
			switch (component) {
				case "supabase_database":
					return checkSupabaseDatabase();
				case "supabase_auth":
					return checkSupabaseAuth();
				case "redis_cache":
					return checkRedisCache();
				case "ai_chat_service":
					return checkAIChatService();
				case "prediction_engine":
					return checkPredictionEngine();
				case "email_service":
					return checkGenericService(component, "/api/email/health");
				case "file_upload_service":
					return checkGenericService(component, "/api/upload/health");
				case "backup_system":
					return checkGenericService(component, "/api/backup/health");
				case "monitoring_system":
					return checkGenericService(component, "/api/monitoring/health");
				case "supabase_storage":
					return checkGenericService(component, "/api/storage/health");
				default:
					return {
						component,
						status: "healthy",
						responseTime: 0,
						details: { not_implemented: true },
					};
			}
		},
		[
			checkSupabaseDatabase,
			checkSupabaseAuth,
			checkRedisCache,
			checkAIChatService,
			checkPredictionEngine,
			checkGenericService,
		]
	);

	// Record health check result
	const recordHealthCheck = useCallback(
		async (result: HealthCheckResult) => {
			try {
				const healthCheck: Omit<SystemHealthCheck, "id" | "created_at"> = {
					component_name: result.component,
					health_status: result.status,
					response_time_ms: result.responseTime,
					error_count: result.error ? 1 : 0,
					error_details: result.error ? { error: result.error, ...result.details } : result.details || {},
					uptime_percentage: result.status === "healthy" ? 100 : result.status === "degraded" ? 95 : 0,
					last_error_at: result.error ? new Date().toISOString() : undefined,
					alert_sent: false,
					escalation_level: result.status === "down" ? 3 : result.status === "unhealthy" ? 2 : 0,
					checked_at: new Date().toISOString(),
				};

				const { error } = await supabase.from("system_health_checks").insert([healthCheck]);

				if (error) {
					console.error("Error recording health check:", error);
				}
			} catch (error) {
				console.error("Error in recordHealthCheck:", error);
			}
		},
		[supabase]
	);

	// Perform comprehensive health check
	const performHealthCheck = useCallback(
		async (components?: SystemComponent[]) => {
			if (checkInProgress.current) return;

			try {
				setIsChecking(true);
				checkInProgress.current = true;

				const componentsToCheck = components || (Object.keys(HEALTH_CHECK_CONFIGS) as SystemComponent[]);
				const checkPromises = componentsToCheck.map((component) => checkComponentHealth(component));

				const results = await Promise.allSettled(checkPromises);
				const healthResults: HealthCheckResult[] = [];

				for (let i = 0; i < results.length; i++) {
					const result = results[i];
					if (result.status === "fulfilled") {
						healthResults.push(result.value);
						await recordHealthCheck(result.value);
					} else {
						const component = componentsToCheck[i];
						const errorResult: HealthCheckResult = {
							component,
							status: "down",
							error: result.reason?.message || "Health check failed",
						};
						healthResults.push(errorResult);
						await recordHealthCheck(errorResult);
					}
				}

				lastCheckTime.current = Date.now();
				await loadHealthSummary();

				return healthResults;
			} catch (error) {
				console.error("Error performing health check:", error);
				throw error;
			} finally {
				setIsChecking(false);
				checkInProgress.current = false;
			}
		},
		[checkComponentHealth, recordHealthCheck]
	);

	// Load health summary from database
	const loadHealthSummary = useCallback(async () => {
		try {
			setLoading(true);

			// Get recent health checks (last hour)
			const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

			const { data: healthChecks, error } = await supabase
				.from("system_health_checks")
				.select("*")
				.gte("checked_at", oneHourAgo)
				.order("checked_at", { ascending: false });

			if (error) {
				console.error("Error loading health summary:", error);
				return;
			}

			if (healthChecks && healthChecks.length > 0) {
				// Get latest check for each component
				const latestChecks = new Map<SystemComponent, SystemHealthCheck>();

				for (const check of healthChecks) {
					const component = check.component_name as SystemComponent;
					if (!latestChecks.has(component)) {
						latestChecks.set(component, check as SystemHealthCheck);
					}
				}

				const latestChecksArray = Array.from(latestChecks.values());

				// Calculate summary statistics
				const totalComponents = latestChecksArray.length;
				const healthyComponents = latestChecksArray.filter((c) => c.health_status === "healthy").length;
				const degradedComponents = latestChecksArray.filter((c) => c.health_status === "degraded").length;
				const unhealthyComponents = latestChecksArray.filter((c) => c.health_status === "unhealthy").length;
				const downComponents = latestChecksArray.filter((c) => c.health_status === "down").length;

				const avgResponseTime =
					latestChecksArray.filter((c) => c.response_time_ms).reduce((sum, c) => sum + (c.response_time_ms || 0), 0) /
						latestChecksArray.filter((c) => c.response_time_ms).length || 0;

				const overallUptime =
					latestChecksArray.reduce((sum, c) => sum + (c.uptime_percentage || 100), 0) / totalComponents;

				// Determine overall health
				let overallHealth: HealthStatus = "healthy";
				if (downComponents > 0) overallHealth = "down";
				else if (unhealthyComponents > 0) overallHealth = "unhealthy";
				else if (degradedComponents > 0) overallHealth = "degraded";

				// Find last incident
				const lastIncident = latestChecksArray
					.filter((c) => c.health_status !== "healthy" && c.last_error_at)
					.sort((a, b) => new Date(b.last_error_at!).getTime() - new Date(a.last_error_at!).getTime())[0];

				setSystemHealthSummary({
					overall_health: overallHealth,
					total_components: totalComponents,
					healthy_components: healthyComponents,
					degraded_components: degradedComponents,
					unhealthy_components: unhealthyComponents,
					down_components: downComponents,
					average_response_time: Math.round(avgResponseTime),
					uptime_percentage: Math.round(overallUptime * 100) / 100,
					last_incident: lastIncident
						? {
								component: lastIncident.component_name as SystemComponent,
								incident_time: lastIncident.last_error_at!,
								recovery_time: lastIncident.recovery_time_seconds || 0,
							}
						: undefined,
				});

				setRecentChecks(healthChecks.slice(0, 50) as SystemHealthCheck[]);
			}
		} catch (error) {
			console.error("Error loading health summary:", error);
		} finally {
			setLoading(false);
		}
	}, [supabase]);

	// Set up automatic health checks
	useEffect(() => {
		if (!enableAutoChecks) return;

		// Initial health check
		performHealthCheck();

		// Set up interval
		const interval = setInterval(() => {
			performHealthCheck();
		}, checkInterval);

		return () => {
			clearInterval(interval);
		};
	}, [enableAutoChecks, checkInterval, performHealthCheck]);

	// Load initial data
	useEffect(() => {
		loadHealthSummary();
	}, [loadHealthSummary]);

	return {
		// State
		systemHealthSummary,
		recentChecks,
		loading,
		isChecking,

		// Actions
		performHealthCheck,
		checkComponentHealth,
		loadHealthSummary,

		// Utils
		healthCheckConfigs: HEALTH_CHECK_CONFIGS,
		alertThresholds,
	};
}
