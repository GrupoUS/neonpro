/**
 * Performance Metrics Dashboard
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { useState, useEffect } from "react";
import {
	Activity,
	BarChart3,
	Clock,
	Database,
	DollarSign,
	Gauge,
	MemoryStick,
	Monitor,
	Server,
	TrendingDown,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface PerformanceMetrics {
	systemPerformance: {
		cpuUsage: number;
		memoryUsage: number;
		diskUsage: number;
		networkLatency: number;
	};
	applicationMetrics: {
		responseTime: number;
		throughput: number;
		errorRate: number;
		activeConnections: number;
	};
	businessMetrics: {
		appointmentsPerHour: number;
		revenuePerHour: number;
		patientSatisfaction: number;
		systemAdoption: number;
	};
	cacheMetrics: {
		hitRate: number;
		missRate: number;
		evictionRate: number;
		memoryUsage: number;
	};
}

interface PerformanceDataPoint {
	timestamp: string;
	responseTime: number;
	throughput: number;
	cpuUsage: number;
	memoryUsage: number;
}

export function PerformanceMetricsDashboard() {
	const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
	const [historicalData, setHistoricalData] = useState<PerformanceDataPoint[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate loading performance data
		const loadPerformanceData = () => {
			setMetrics({
				systemPerformance: {
					cpuUsage: 23.5,
					memoryUsage: 67.2,
					diskUsage: 45.8,
					networkLatency: 12,
				},
				applicationMetrics: {
					responseTime: 187,
					throughput: 245,
					errorRate: 0.12,
					activeConnections: 47,
				},
				businessMetrics: {
					appointmentsPerHour: 8.5,
					revenuePerHour: 2450,
					patientSatisfaction: 9.2,
					systemAdoption: 89.7,
				},
				cacheMetrics: {
					hitRate: 87.5,
					missRate: 12.5,
					evictionRate: 2.1,
					memoryUsage: 234,
				},
			});

			// Generate historical data for the last 24 hours
			const now = new Date();
			const data: PerformanceDataPoint[] = [];
			
			for (let i = 23; i >= 0; i--) {
				const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
				data.push({
					timestamp: timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
					responseTime: Math.floor(150 + Math.random() * 100),
					throughput: Math.floor(200 + Math.random() * 100),
					cpuUsage: Math.floor(20 + Math.random() * 30),
					memoryUsage: Math.floor(60 + Math.random() * 20),
				});
			}
			
			setHistoricalData(data);
			setLoading(false);
		};

		loadPerformanceData();

		// Simulate real-time updates
		const interval = setInterval(() => {
			if (metrics) {
				setMetrics((prev) => ({
					...prev!,
					systemPerformance: {
						...prev!.systemPerformance,
						cpuUsage: Math.floor(20 + Math.random() * 30),
						networkLatency: Math.floor(10 + Math.random() * 20),
					},
					applicationMetrics: {
						...prev!.applicationMetrics,
						responseTime: Math.floor(150 + Math.random() * 100),
						throughput: Math.floor(200 + Math.random() * 100),
						activeConnections: Math.floor(40 + Math.random() * 20),
					},
				}));
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [metrics]);

	const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }, inverse = false) => {
		if (inverse) {
			if (value <= thresholds.good) return "success";
			if (value <= thresholds.warning) return "warning";
			return "error";
		} else {
			if (value >= thresholds.good) return "success";
			if (value >= thresholds.warning) return "warning";
			return "error";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "success":
				return "text-green-600";
			case "warning":
				return "text-yellow-600";
			case "error":
				return "text-red-600";
			default:
				return "text-muted-foreground";
		}
	};

	if (loading || !metrics) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i} className="animate-pulse">
							<CardHeader className="pb-2">
								<div className="h-4 bg-muted rounded w-20"></div>
								<div className="h-6 bg-muted rounded w-32"></div>
							</CardHeader>
							<CardContent>
								<div className="h-8 bg-muted rounded w-24"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div 
			className="space-y-6" 
			role="main" 
			aria-labelledby="performance-heading"
			aria-describedby="performance-description"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 
						id="performance-heading"
						className="text-2xl font-bold text-foreground"
					>
						Métricas de Performance
					</h2>
					<p 
						id="performance-description"
						className="text-muted-foreground"
					>
						Monitoramento em tempo real da performance do sistema
					</p>
				</div>
				<Badge 
					variant="outline" 
					className="flex items-center gap-2"
					role="status"
					aria-label="Performance do sistema em tempo real"
				>
					<Activity className="h-4 w-4 text-green-600" aria-hidden="true" />
					Sistema Otimizado
				</Badge>
			</div>

			{/* System Performance Overview */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* CPU Usage */}
				<Card className="neonpro-card group">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-sm font-medium">
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-all">
								<Monitor className="h-4 w-4 text-blue-600" />
							</div>
							Uso de CPU
						</CardTitle>
						<CardDescription>Processamento do servidor</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div
								className={`text-2xl font-bold ${getStatusColor(
									getPerformanceStatus(metrics.systemPerformance.cpuUsage, { good: 70, warning: 85 }, true)
								)}`}
							>
								{metrics.systemPerformance.cpuUsage}%
							</div>
							<Progress value={metrics.systemPerformance.cpuUsage} className="h-2" />
							<div className="text-xs text-muted-foreground">
								Target: &lt;80% | Status: 
								{metrics.systemPerformance.cpuUsage < 70 ? " Ótimo" : 
								 metrics.systemPerformance.cpuUsage < 85 ? " Bom" : " Atenção"}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Memory Usage */}
				<Card className="neonpro-card group">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-sm font-medium">
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 transition-all">
								<MemoryStick className="h-4 w-4 text-purple-600" />
							</div>
							Uso de Memória
						</CardTitle>
						<CardDescription>RAM disponível</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div
								className={`text-2xl font-bold ${getStatusColor(
									getPerformanceStatus(metrics.systemPerformance.memoryUsage, { good: 80, warning: 90 }, true)
								)}`}
							>
								{metrics.systemPerformance.memoryUsage}%
							</div>
							<Progress value={metrics.systemPerformance.memoryUsage} className="h-2" />
							<div className="text-xs text-muted-foreground">
								8GB Total | 2.6GB Livre
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Response Time */}
				<Card className="neonpro-card group">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-sm font-medium">
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 transition-all">
								<Zap className="h-4 w-4 text-green-600" />
							</div>
							Tempo de Resposta
						</CardTitle>
						<CardDescription>API média (5min)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div
								className={`text-2xl font-bold ${getStatusColor(
									getPerformanceStatus(300 - metrics.applicationMetrics.responseTime, { good: 150, warning: 100 })
								)}`}
							>
								{metrics.applicationMetrics.responseTime}ms
							</div>
							<div className="flex items-center space-x-1">
								{metrics.applicationMetrics.responseTime < 200 ? (
									<TrendingDown className="h-3 w-3 text-green-600" />
								) : (
									<TrendingUp className="h-3 w-3 text-yellow-600" />
								)}
								<span className="text-xs text-muted-foreground">
									vs. hora anterior
								</span>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Throughput */}
				<Card className="neonpro-card group">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center text-sm font-medium">
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 transition-all">
								<BarChart3 className="h-4 w-4 text-chart-2" />
							</div>
							Throughput
						</CardTitle>
						<CardDescription>Requisições/minuto</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-green-600">
								{metrics.applicationMetrics.throughput}
							</div>
							<div className="flex items-center space-x-1">
								<TrendingUp className="h-3 w-3 text-green-600" />
								<span className="text-xs text-green-600">+12% hoje</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Historical Performance Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Response Time Trend */}
				<Card className="neonpro-card">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Clock className="mr-2 h-5 w-5 text-blue-600" />
							Tendência de Tempo de Resposta
						</CardTitle>
						<CardDescription>Últimas 24 horas (em milissegundos)</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<LineChart data={historicalData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="timestamp" />
									<YAxis />
									<Tooltip 
										formatter={(value) => [`${value}ms`, "Tempo de Resposta"]}
										labelFormatter={(label) => `Horário: ${label}`}
									/>
									<Line 
										type="monotone" 
										dataKey="responseTime" 
										stroke="#2563eb" 
										strokeWidth={2}
										dot={false}
									/>
								</LineChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>

				{/* System Resources */}
				<Card className="neonpro-card">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Server className="mr-2 h-5 w-5 text-purple-600" />
							Uso de Recursos do Sistema
						</CardTitle>
						<CardDescription>CPU e Memória ao longo do tempo</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={historicalData}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="timestamp" />
									<YAxis />
									<Tooltip 
										formatter={(value, name) => [
											`${value}%`, 
											name === "cpuUsage" ? "CPU" : "Memória"
										]}
										labelFormatter={(label) => `Horário: ${label}`}
									/>
									<Area
										type="monotone"
										dataKey="cpuUsage"
										stackId="1"
										stroke="#8b5cf6"
										fill="#8b5cf6"
										fillOpacity={0.6}
									/>
									<Area
										type="monotone"
										dataKey="memoryUsage"
										stackId="1"
										stroke="#06b6d4"
										fill="#06b6d4"
										fillOpacity={0.6}
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Cache Performance & Business Metrics */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Cache Performance */}
				<Card className="neonpro-card">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Database className="mr-2 h-5 w-5 text-green-600" />
							Performance do Cache
						</CardTitle>
						<CardDescription>Eficiência do sistema de cache</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Hit Rate</span>
								<div className="flex items-center space-x-2">
									<Progress value={metrics.cacheMetrics.hitRate} className="w-32 h-2" />
									<span className="text-sm font-bold text-green-600">
										{metrics.cacheMetrics.hitRate}%
									</span>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Miss Rate</span>
								<div className="flex items-center space-x-2">
									<Progress value={metrics.cacheMetrics.missRate} className="w-32 h-2" />
									<span className="text-sm">{metrics.cacheMetrics.missRate}%</span>
								</div>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium">Eviction Rate</span>
								<div className="flex items-center space-x-2">
									<Progress value={metrics.cacheMetrics.evictionRate} className="w-32 h-2" />
									<span className="text-sm">{metrics.cacheMetrics.evictionRate}%</span>
								</div>
							</div>
							<div className="pt-2 border-t">
								<div className="flex justify-between text-sm">
									<span>Uso de Memória do Cache</span>
									<span className="font-medium">{metrics.cacheMetrics.memoryUsage}MB</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Business Performance */}
				<Card className="neonpro-card">
					<CardHeader>
						<CardTitle className="flex items-center">
							<Gauge className="mr-2 h-5 w-5 text-blue-600" />
							Métricas de Negócio
						</CardTitle>
						<CardDescription>Performance operacional da clínica</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Users className="h-4 w-4 text-blue-600" />
									<span className="text-sm">Consultas/Hora</span>
								</div>
								<span className="text-lg font-bold">{metrics.businessMetrics.appointmentsPerHour}</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<DollarSign className="h-4 w-4 text-green-600" />
									<span className="text-sm">Receita/Hora</span>
								</div>
								<span className="text-lg font-bold text-green-600">
									R$ {metrics.businessMetrics.revenuePerHour.toLocaleString("pt-BR")}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Activity className="h-4 w-4 text-purple-600" />
									<span className="text-sm">Satisfação</span>
								</div>
								<span className="text-lg font-bold">{metrics.businessMetrics.patientSatisfaction}/10</span>
							</div>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-2">
									<Monitor className="h-4 w-4 text-chart-2" />
									<span className="text-sm">Adoção do Sistema</span>
								</div>
								<span className="text-lg font-bold">{metrics.businessMetrics.systemAdoption}%</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="neonpro-card text-center">
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-green-600">{metrics.applicationMetrics.errorRate}%</div>
						<div className="text-sm text-muted-foreground">Taxa de Erro</div>
						<Badge variant="outline" className="text-green-600 border-green-600 mt-2">
							Excelente
						</Badge>
					</CardContent>
				</Card>

				<Card className="neonpro-card text-center">
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{metrics.applicationMetrics.activeConnections}</div>
						<div className="text-sm text-muted-foreground">Conexões Ativas</div>
						<Badge variant="outline" className="mt-2">
							Em tempo real
						</Badge>
					</CardContent>
				</Card>

				<Card className="neonpro-card text-center">
					<CardContent className="pt-6">
						<div className="text-2xl font-bold text-blue-600">{metrics.systemPerformance.networkLatency}ms</div>
						<div className="text-sm text-muted-foreground">Latência de Rede</div>
						<Badge variant="outline" className="text-blue-600 border-blue-600 mt-2">
							Rápido
						</Badge>
					</CardContent>
				</Card>

				<Card className="neonpro-card text-center">
					<CardContent className="pt-6">
						<div className="text-2xl font-bold">{metrics.systemPerformance.diskUsage}%</div>
						<div className="text-sm text-muted-foreground">Uso de Disco</div>
						<Badge variant="outline" className="mt-2">
							Normal
						</Badge>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}