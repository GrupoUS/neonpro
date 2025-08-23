/**
 * 📱 NeonPro - Real-time Dashboard Client
 *
 * Cliente React para dashboard de monitoramento em tempo real
 * com WebSocket integration e visualizações interativas.
 */

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import {
	CartesianGrid,
	Line,
	LineChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { io, type Socket } from "socket.io-client";
import { logger } from "../../../apps/api/src/lib/logger.js";

type MetricValue = {
	timestamp: number;
	value: number;
	metadata?: Record<string, any>;
};

type Alert = {
	id: string;
	level: "info" | "warning" | "error" | "critical";
	message: string;
	timestamp: number;
	resolved: boolean;
};

type HealthStatus = {
	status: "healthy" | "degraded" | "down";
	score: number;
	lastCheck: number;
	issues: string[];
};

type DashboardData = {
	health: HealthStatus;
	alerts: Alert[];
	metrics: Record<string, MetricValue[]>;
};

const COLORS = {
	healthy: "#10B981",
	degraded: "#F59E0B",
	down: "#EF4444",
	info: "#3B82F6",
	warning: "#F59E0B",
	error: "#EF4444",
	critical: "#DC2626",
};

export const RealTimeDashboard: React.FC = () => {
	const [_socket, setSocket] = useState<Socket | null>(null);
	const [data, setData] = useState<DashboardData>({
		health: {
			status: "healthy",
			score: 100,
			lastCheck: Date.now(),
			issues: [],
		},
		alerts: [],
		metrics: {},
	});
	const [connected, setConnected] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"overview" | "metrics" | "alerts" | "health"
	>("overview");

	// 🔌 Configurar WebSocket connection
	useEffect(() => {
		const newSocket = io("http://localhost:3003");

		newSocket.on("connect", () => {
			setConnected(true);
			logger.info("📱 Conectado ao monitor");
		});

		newSocket.on("disconnect", () => {
			setConnected(false);
			logger.info("📱 Desconectado do monitor");
		});

		newSocket.on("initial-data", (initialData: DashboardData) => {
			setData(initialData);
		});

		newSocket.on("health-update", (health: HealthStatus) => {
			setData((prev) => ({ ...prev, health }));
		});

		newSocket.on(
			"metrics-update",
			(update: { timestamp: number; metrics: any }) => {
				setData((prev) => {
					const newMetrics = { ...prev.metrics };

					Object.entries(update.metrics).forEach(([key, value]) => {
						if (!newMetrics[key]) {
							newMetrics[key] = [];
						}
						newMetrics[key].push({
							timestamp: update.timestamp,
							value: value as number,
						});

						// Manter apenas últimas 50 entradas
						if (newMetrics[key].length > 50) {
							newMetrics[key] = newMetrics[key].slice(-50);
						}
					});

					return { ...prev, metrics: newMetrics };
				});
			},
		);

		newSocket.on("new-alert", (alert: Alert) => {
			setData((prev) => ({
				...prev,
				alerts: [alert, ...prev.alerts].slice(0, 20), // Manter últimos 20
			}));
		});

		setSocket(newSocket);

		return () => {
			newSocket.disconnect();
		};
	}, []);

	// 📊 Formatar dados para gráficos
	const formatMetricData = useCallback(
		(metricName: string) => {
			const metrics = data.metrics[metricName] || [];
			return metrics.map((m) => ({
				time: new Date(m.timestamp).toLocaleTimeString(),
				value: m.value,
				timestamp: m.timestamp,
			}));
		},
		[data.metrics],
	);

	// 🎨 Obter cor baseada no status
	const _getStatusColor = (status: string) => {
		return COLORS[status as keyof typeof COLORS] || "#6B7280";
	};

	// 📈 Componente de métricas overview
	const MetricsOverview: React.FC = () => (
		<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
			{Object.entries(data.metrics).map(([key, values]) => {
				const latestValue = values.at(-1)?.value || 0;
				const previousValue = values.at(-2)?.value || latestValue;
				const trend = latestValue - previousValue;

				return (
					<div className="rounded-lg border bg-white p-4 shadow" key={key}>
						<div className="flex items-center justify-between">
							<div>
								<p className="font-medium text-gray-600 text-sm capitalize">
									{key.replace(/([A-Z])/g, " $1").trim()}
								</p>
								<p className="font-bold text-2xl text-gray-900">
									{latestValue.toFixed(1)}%
								</p>
							</div>
							<div
								className={`text-sm ${trend >= 0 ? "text-green-600" : "text-red-600"}`}
							>
								{trend >= 0 ? "↗" : "↘"} {Math.abs(trend).toFixed(1)}
							</div>
						</div>
						<div className="mt-2">
							<div className="h-2 w-full rounded-full bg-gray-200">
								<div
									className={`h-2 rounded-full ${
										latestValue >= 90
											? "bg-green-500"
											: latestValue >= 70
												? "bg-yellow-500"
												: "bg-red-500"
									}`}
									style={{ width: `${Math.min(latestValue, 100)}%` }}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);

	// 🏥 Componente de status de saúde
	const HealthStatus: React.FC = () => (
		<div className="rounded-lg border bg-white p-6 shadow">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="font-semibold text-gray-900 text-lg">System Health</h3>
				<div
					className={`rounded-full px-3 py-1 font-medium text-sm ${
						data.health.status === "healthy"
							? "bg-green-100 text-green-800"
							: data.health.status === "degraded"
								? "bg-yellow-100 text-yellow-800"
								: "bg-red-100 text-red-800"
					}`}
				>
					{data.health.status.toUpperCase()}
				</div>
			</div>

			<div className="mb-4">
				<div className="mb-2 flex items-center justify-between">
					<span className="text-gray-600 text-sm">Health Score</span>
					<span className="font-bold text-2xl text-gray-900">
						{data.health.score}/100
					</span>
				</div>
				<div className="h-3 w-full rounded-full bg-gray-200">
					<div
						className={`h-3 rounded-full transition-all duration-300 ${
							data.health.score >= 90
								? "bg-green-500"
								: data.health.score >= 70
									? "bg-yellow-500"
									: "bg-red-500"
						}`}
						style={{ width: `${data.health.score}%` }}
					/>
				</div>
			</div>

			{data.health.issues.length > 0 && (
				<div>
					<h4 className="mb-2 font-medium text-gray-900 text-sm">
						Current Issues
					</h4>
					<ul className="space-y-1">
						{data.health.issues.map((issue, index) => (
							<li
								className="flex items-center text-red-600 text-sm"
								key={index}
							>
								<span className="mr-2 h-2 w-2 rounded-full bg-red-500" />
								{issue}
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);

	// 🚨 Componente de alertas
	const AlertsList: React.FC = () => (
		<div className="rounded-lg border bg-white p-6 shadow">
			<h3 className="mb-4 font-semibold text-gray-900 text-lg">
				Recent Alerts
			</h3>
			<div className="max-h-96 space-y-2 overflow-y-auto">
				{data.alerts.length === 0 ? (
					<p className="py-8 text-center text-gray-500">No alerts</p>
				) : (
					data.alerts.map((alert) => (
						<div
							className={`rounded border-l-4 p-3 ${
								alert.level === "critical"
									? "border-red-500 bg-red-50"
									: alert.level === "error"
										? "border-red-400 bg-red-50"
										: alert.level === "warning"
											? "border-yellow-400 bg-yellow-50"
											: "border-blue-400 bg-blue-50"
							}`}
							key={alert.id}
						>
							<div className="flex items-center justify-between">
								<span
									className={`font-medium text-xs uppercase ${
										alert.level === "critical"
											? "text-red-800"
											: alert.level === "error"
												? "text-red-700"
												: alert.level === "warning"
													? "text-yellow-700"
													: "text-blue-700"
									}`}
								>
									{alert.level}
								</span>
								<span className="text-gray-500 text-xs">
									{new Date(alert.timestamp).toLocaleTimeString()}
								</span>
							</div>
							<p className="mt-1 text-gray-800 text-sm">{alert.message}</p>
						</div>
					))
				)}
			</div>
		</div>
	);

	// 📊 Componente de gráficos de métricas
	const MetricsCharts: React.FC = () => (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
			{Object.keys(data.metrics).map((metricName) => {
				const chartData = formatMetricData(metricName);

				return (
					<div
						className="rounded-lg border bg-white p-6 shadow"
						key={metricName}
					>
						<h3 className="mb-4 font-semibold text-gray-900 text-lg capitalize">
							{metricName.replace(/([A-Z])/g, " $1").trim()}
						</h3>
						<ResponsiveContainer height={250} width="100%">
							<LineChart data={chartData}>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis
									dataKey="time"
									interval="preserveStartEnd"
									tick={{ fontSize: 12 }}
								/>
								<YAxis tick={{ fontSize: 12 }} />
								<Tooltip
									formatter={(value: number) => [
										`${value.toFixed(1)}%`,
										metricName,
									]}
									labelFormatter={(label) => `Time: ${label}`}
								/>
								<Line
									activeDot={{ r: 6 }}
									dataKey="value"
									dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
									stroke="#3B82F6"
									strokeWidth={2}
									type="monotone"
								/>
							</LineChart>
						</ResponsiveContainer>
					</div>
				);
			})}
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="border-b bg-white shadow">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<div className="flex items-center">
							<h1 className="font-semibold text-gray-900 text-xl">
								📈 NeonPro Quality Monitor
							</h1>
							<div
								className={`ml-4 flex items-center ${connected ? "text-green-600" : "text-red-600"}`}
							>
								<span
									className={`mr-2 h-2 w-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
								/>
								<span className="font-medium text-sm">
									{connected ? "Connected" : "Disconnected"}
								</span>
							</div>
						</div>

						<nav className="flex space-x-4">
							{["overview", "metrics", "alerts", "health"].map((tab) => (
								<button
									className={`rounded-md px-3 py-2 font-medium text-sm capitalize ${
										activeTab === tab
											? "bg-blue-100 text-blue-700"
											: "text-gray-500 hover:text-gray-700"
									}`}
									key={tab}
									onClick={() => setActiveTab(tab as any)}
								>
									{tab}
								</button>
							))}
						</nav>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{activeTab === "overview" && (
					<div>
						<MetricsOverview />
						<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
							<HealthStatus />
							<AlertsList />
						</div>
					</div>
				)}

				{activeTab === "metrics" && <MetricsCharts />}

				{activeTab === "alerts" && (
					<div className="max-w-4xl">
						<AlertsList />
					</div>
				)}

				{activeTab === "health" && (
					<div className="max-w-2xl">
						<HealthStatus />
					</div>
				)}
			</main>
		</div>
	);
};

export default RealTimeDashboard;
