/**
 * Monitoring Components
 * React components and utilities for monitoring infrastructure
 */

import React from "react";

// Component types
export type MonitoringComponentProps = {
	className?: string;
	onMetricUpdate?: (metric: string, value: number) => void;
	refreshInterval?: number;
};

export interface SystemHealthComponentProps extends MonitoringComponentProps {
	showDetailed?: boolean;
	alertThreshold?: number;
}

export interface PerformanceChartProps extends MonitoringComponentProps {
	metricName: string;
	timeRange: "1h" | "6h" | "24h" | "7d";
	chartType: "line" | "bar" | "area";
}

// Mock components for testing
export const SystemHealthComponent: React.FC<SystemHealthComponentProps> = ({
	className = "",
	onMetricUpdate,
	refreshInterval = 30_000,
	showDetailed = false,
	alertThreshold = 80,
}) => {
	React.useEffect(() => {
		const interval = setInterval(() => {
			// Mock system health data
			const cpuUsage = Math.random() * 100;
			const memoryUsage = Math.random() * 100;
			const diskUsage = Math.random() * 100;

			onMetricUpdate?.("cpu_usage", cpuUsage);
			onMetricUpdate?.("memory_usage", memoryUsage);
			onMetricUpdate?.("disk_usage", diskUsage);

			// Trigger alerts if thresholds exceeded
			if (cpuUsage > alertThreshold || memoryUsage > alertThreshold) {
			}
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [onMetricUpdate, refreshInterval, alertThreshold]);

	return React.createElement(
		"div",
		{ className: `system-health ${className}` },
		[
			React.createElement("h3", { key: "title" }, "System Health"),
			React.createElement(
				"div",
				{ key: "status", className: "health-status" },
				"Healthy",
			),
			showDetailed &&
				React.createElement(
					"div",
					{ key: "details", className: "health-details" },
					"Detailed metrics available",
				),
		],
	);
};

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
	className = "",
	metricName,
	timeRange,
	chartType,
	onMetricUpdate,
	refreshInterval = 5000,
}) => {
	React.useEffect(() => {
		const interval = setInterval(() => {
			// Mock performance data
			const value = Math.random() * 1000 + 100;
			onMetricUpdate?.(metricName, value);
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [metricName, onMetricUpdate, refreshInterval]);

	return React.createElement(
		"div",
		{ className: `performance-chart ${className}` },
		[
			React.createElement(
				"h4",
				{ key: "title" },
				`${metricName} (${timeRange})`,
			),
			React.createElement(
				"div",
				{ key: "chart", className: `chart-${chartType}` },
				`${chartType} chart for ${metricName}`,
			),
		],
	);
};

export const AlertsList: React.FC<MonitoringComponentProps> = ({
	className = "",
	onMetricUpdate,
	refreshInterval = 10_000,
}) => {
	const [alerts, setAlerts] = React.useState<
		Array<{
			id: string;
			type: "error" | "warning" | "info";
			message: string;
			timestamp: number;
		}>
	>([]);

	React.useEffect(() => {
		const interval = setInterval(() => {
			// Mock alerts
			if (Math.random() > 0.8) {
				const newAlert = {
					id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					type: ["error", "warning", "info"][Math.floor(Math.random() * 3)] as
						| "error"
						| "warning"
						| "info",
					message: `System alert: ${["High CPU usage", "Memory threshold exceeded", "Database connection slow"][Math.floor(Math.random() * 3)]}`,
					timestamp: Date.now(),
				};
				setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]); // Keep last 10
				onMetricUpdate?.("alerts_count", alerts.length + 1);
			}
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [alerts.length, onMetricUpdate, refreshInterval]);

	return React.createElement("div", { className: `alerts-list ${className}` }, [
		React.createElement("h4", { key: "title" }, "Recent Alerts"),
		React.createElement(
			"div",
			{ key: "list" },
			alerts.map((alert) =>
				React.createElement(
					"div",
					{
						key: alert.id,
						className: `alert alert-${alert.type}`,
					},
					`[${alert.type.toUpperCase()}] ${alert.message}`,
				),
			),
		),
	]);
};

export const MetricsDashboard: React.FC<
	MonitoringComponentProps & {
		metrics: string[];
		layout: "grid" | "list";
	}
> = ({
	className = "",
	metrics = ["cpu_usage", "memory_usage", "response_time"],
	layout = "grid",
	onMetricUpdate,
	refreshInterval = 15_000,
}) => {
	const [metricValues, setMetricValues] = React.useState<
		Record<string, number>
	>({});

	React.useEffect(() => {
		const interval = setInterval(() => {
			const updates: Record<string, number> = {};
			metrics.forEach((metric) => {
				const value = Math.random() * 100;
				updates[metric] = value;
				onMetricUpdate?.(metric, value);
			});
			setMetricValues((prev) => ({ ...prev, ...updates }));
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [metrics, onMetricUpdate, refreshInterval]);

	return React.createElement(
		"div",
		{ className: `metrics-dashboard layout-${layout} ${className}` },
		[
			React.createElement("h3", { key: "title" }, "Metrics Dashboard"),
			React.createElement(
				"div",
				{ key: "metrics", className: "metrics-grid" },
				metrics.map((metric) =>
					React.createElement(
						"div",
						{
							key: metric,
							className: "metric-card",
						},
						[
							React.createElement(
								"div",
								{ key: "name", className: "metric-name" },
								metric.replace("_", " ").toUpperCase(),
							),
							React.createElement(
								"div",
								{ key: "value", className: "metric-value" },
								(metricValues[metric] || 0).toFixed(1),
							),
						],
					),
				),
			),
		],
	);
};

// Component registry for dynamic loading
export const MonitoringComponents = {
	SystemHealthComponent,
	PerformanceChart,
	AlertsList,
	MetricsDashboard,
};

// Helper functions for component integration
export const createMonitoringComponent = (
	type: keyof typeof MonitoringComponents,
	props: any,
) => {
	const Component = MonitoringComponents[type];
	return React.createElement(Component, props);
};

export const getAvailableComponents = () => {
	return Object.keys(MonitoringComponents);
};

// Monitoring hooks
export const useSystemHealth = (refreshInterval = 30_000) => {
	const [health, setHealth] = React.useState({
		status: "healthy" as "healthy" | "degraded" | "unhealthy",
		cpu: 0,
		memory: 0,
		disk: 0,
	});

	React.useEffect(() => {
		const interval = setInterval(() => {
			const cpu = Math.random() * 100;
			const memory = Math.random() * 100;
			const disk = Math.random() * 100;

			let status: "healthy" | "degraded" | "unhealthy" = "healthy";
			if (cpu > 90 || memory > 90) {
				status = "unhealthy";
			} else if (cpu > 70 || memory > 70) {
				status = "degraded";
			}

			setHealth({ status, cpu, memory, disk });
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [refreshInterval]);

	return health;
};

export const usePerformanceMetrics = (
	metricNames: string[],
	refreshInterval = 5000,
) => {
	const [metrics, setMetrics] = React.useState<
		Record<string, { value: number; timestamp: number }>
	>({});

	React.useEffect(() => {
		const interval = setInterval(() => {
			const updates: Record<string, { value: number; timestamp: number }> = {};
			metricNames.forEach((name) => {
				updates[name] = {
					value: Math.random() * 1000,
					timestamp: Date.now(),
				};
			});
			setMetrics((prev) => ({ ...prev, ...updates }));
		}, refreshInterval);

		return () => clearInterval(interval);
	}, [metricNames, refreshInterval]);

	return metrics;
};

// Export default monitoring infrastructure
export default {
	components: MonitoringComponents,
	hooks: {
		useSystemHealth,
		usePerformanceMetrics,
	},
	utils: {
		createMonitoringComponent,
		getAvailableComponents,
	},
};
