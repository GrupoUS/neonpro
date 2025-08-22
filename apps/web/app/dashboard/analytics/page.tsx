"use client";

import { motion } from "framer-motion";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	BarChart3,
	Calendar,
	CheckCircle2,
	Clock,
	DollarSign,
	Download,
	Eye,
	FileText,
	Filter,
	Gauge,
	Globe,
	Heart,
	LineChart,
	Mail,
	MapPin,
	Phone,
	PieChart,
	Pill,
	RefreshCw,
	Settings,
	Shield,
	Stethoscope,
	Target,
	TrendingDown,
	TrendingUp,
	UserCheck,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppointments } from "@/hooks/useAppointments";
import { useDashboardMetrics } from "@/hooks/useDashboardMetrics";
import { usePatients } from "@/hooks/usePatients";

// Types for analytics data
type AnalyticsTimeRange = "7d" | "30d" | "90d" | "1y";
type ChartType = "line" | "bar" | "pie" | "area";

interface AnalyticsKPI {
	id: string;
	title: string;
	value: string | number;
	change: number;
	changeType: "increase" | "decrease" | "neutral";
	icon: React.ComponentType<{ className?: string }>;
	description: string;
	trend: number[];
}

interface ChartData {
	name: string;
	value: number;
	percentage?: number;
	color?: string;
}

interface TrendData {
	period: string;
	revenue: number;
	patients: number;
	appointments: number;
	satisfaction: number;
}

// Visual components maintaining NeonPro design
const NeonGradientCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
	<motion.div
		animate={{ opacity: 1, y: 0 }}
		className={`relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
		initial={{ opacity: 0, y: 20 }}
	>
		<div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-50" />
		<div className="relative z-10 p-6">{children}</div>
	</motion.div>
);

const CosmicGlowButton = ({
	children,
	variant = "primary",
	size = "md",
	onClick,
	className = "",
}: {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "success" | "warning" | "danger";
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
	className?: string;
}) => {
	const variants = {
		primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700",
		secondary: "bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800",
		success: "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700",
		warning: "bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700",
		danger: "bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-lg",
	};

	return (
		<motion.button
			className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl ${variants[variant]} ${sizes[size]} ${className}`}
			onClick={onClick}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
		>
			{children}
		</motion.button>
	);
};

// Mock data for healthcare analytics
const generateMockAnalyticsData = () => {
	const currentDate = new Date();
	const last12Months = Array.from({ length: 12 }, (_, i) => {
		const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
		return {
			period: date.toLocaleDateString("pt-BR", {
				month: "short",
				year: "numeric",
			}),
			revenue: Math.floor(Math.random() * 150_000) + 80_000,
			patients: Math.floor(Math.random() * 200) + 150,
			appointments: Math.floor(Math.random() * 300) + 200,
			satisfaction: Math.floor(Math.random() * 30) + 70,
		};
	}).reverse();

	const treatmentSuccessRates = [
		{ name: "Estética Facial", value: 94, total: 156, color: "#10b981" },
		{ name: "Cirurgia Plástica", value: 91, total: 89, color: "#3b82f6" },
		{ name: "Dermatologia", value: 96, total: 234, color: "#8b5cf6" },
		{ name: "Odontologia Estética", value: 88, total: 167, color: "#f59e0b" },
		{ name: "Harmonização Facial", value: 93, total: 198, color: "#ef4444" },
	];

	const patientDemographics = [
		{ name: "18-25 anos", value: 18, count: 89, color: "#06b6d4" },
		{ name: "26-35 anos", value: 34, count: 167, color: "#3b82f6" },
		{ name: "36-45 anos", value: 28, count: 134, color: "#8b5cf6" },
		{ name: "46-55 anos", value: 15, count: 72, color: "#f59e0b" },
		{ name: "56+ anos", value: 5, count: 24, color: "#ef4444" },
	];

	const revenueByService = [
		{
			name: "Cirurgia Plástica",
			value: 45,
			revenue: 245_000,
			color: "#10b981",
		},
		{ name: "Estética Facial", value: 25, revenue: 136_000, color: "#3b82f6" },
		{ name: "Harmonização", value: 18, revenue: 98_000, color: "#8b5cf6" },
		{ name: "Dermatologia", value: 8, revenue: 43_500, color: "#f59e0b" },
		{ name: "Outros", value: 4, revenue: 21_800, color: "#ef4444" },
	];

	const complianceMetrics = [
		{
			metric: "LGPD Conformidade",
			score: 96,
			status: "excellent",
			trend: "up",
		},
		{ metric: "ANVISA Qualidade", score: 94, status: "excellent", trend: "up" },
		{ metric: "CFM Protocolos", score: 91, status: "good", trend: "stable" },
		{ metric: "ANS Indicadores", score: 89, status: "good", trend: "up" },
		{
			metric: "Auditoria Interna",
			score: 97,
			status: "excellent",
			trend: "up",
		},
	];

	return {
		trendData: last12Months,
		treatmentSuccessRates,
		patientDemographics,
		revenueByService,
		complianceMetrics,
	};
};

// KPI Card Component
const KPICard = ({ kpi }: { kpi: AnalyticsKPI }) => {
	const Icon = kpi.icon;
	const isPositive = kpi.changeType === "increase";

	return (
		<NeonGradientCard>
			<div className="flex items-center justify-between">
				<div className="space-y-2">
					<p className="font-medium text-slate-300 text-sm">{kpi.title}</p>
					<div className="space-y-1">
						<p className="font-bold text-2xl text-white">{kpi.value}</p>
						<div className="flex items-center space-x-2">
							{isPositive ? (
								<TrendingUp className="h-4 w-4 text-green-400" />
							) : (
								<TrendingDown className="h-4 w-4 text-red-400" />
							)}
							<span className={`font-medium text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
								{kpi.change > 0 ? "+" : ""}
								{kpi.change}%
							</span>
							<span className="text-slate-400 text-xs">vs mês anterior</span>
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-white/10 p-3">
					<Icon className="h-6 w-6 text-blue-400" />
				</div>
			</div>
			<p className="mt-3 text-slate-400 text-xs">{kpi.description}</p>
		</NeonGradientCard>
	);
};

// Simple Chart Components (can be replaced with Recharts later)
const SimpleBarChart = ({ data, height = 200 }: { data: ChartData[]; height?: number }) => {
	const maxValue = Math.max(...data.map((d) => d.value));

	return (
		<div className="space-y-4">
			<div className="space-y-3" style={{ height }}>
				{data.map((item, index) => (
					<div className="space-y-1" key={index}>
						<div className="flex justify-between text-sm">
							<span className="text-slate-300">{item.name}</span>
							<span className="font-medium text-white">{item.value}%</span>
						</div>
						<div className="h-2 overflow-hidden rounded-full bg-slate-700">
							<motion.div
								animate={{ width: `${(item.value / maxValue) * 100}%` }}
								className="h-full rounded-full"
								initial={{ width: 0 }}
								style={{ backgroundColor: item.color || "#3b82f6" }}
								transition={{ duration: 1, delay: index * 0.1 }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

const SimplePieChart = ({ data }: { data: ChartData[] }) => {
	const total = data.reduce((sum, item) => sum + item.value, 0);

	return (
		<div className="flex items-center space-x-6">
			<div className="relative h-32 w-32">
				<svg className="-rotate-90 h-32 w-32 transform">
					<circle cx="64" cy="64" fill="none" r="56" stroke="rgb(51 65 85)" strokeWidth="8" />
					{data.map((item, index) => {
						const percentage = (item.value / total) * 100;
						const circumference = 2 * Math.PI * 56;
						const offset = circumference - (percentage / 100) * circumference;
						const prevPercentages = data.slice(0, index).reduce((sum, prev) => sum + prev.value, 0);
						const rotation = (prevPercentages / total) * 360;

						return (
							<motion.circle
								animate={{ strokeDashoffset: offset }}
								cx="64"
								cy="64"
								fill="none"
								initial={{ strokeDashoffset: circumference }}
								key={index}
								r="56"
								stroke={item.color || "#3b82f6"}
								strokeDasharray={circumference}
								strokeDashoffset={offset}
								strokeWidth="8"
								style={{
									transformOrigin: "64px 64px",
									transform: `rotate(${rotation}deg)`,
								}}
								transition={{ duration: 1, delay: index * 0.2 }}
							/>
						);
					})}
				</svg>
			</div>
			<div className="space-y-2">
				{data.map((item, index) => (
					<div className="flex items-center space-x-2" key={index}>
						<div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color || "#3b82f6" }} />
						<span className="text-slate-300 text-sm">{item.name}</span>
						<span className="font-medium text-sm text-white">{item.value}%</span>
					</div>
				))}
			</div>
		</div>
	);
};

const SimpleLineChart = ({ data, height = 200 }: { data: TrendData[]; height?: number }) => {
	const maxRevenue = Math.max(...data.map((d) => d.revenue));
	const minRevenue = Math.min(...data.map((d) => d.revenue));
	const range = maxRevenue - minRevenue;

	return (
		<div className="space-y-4">
			<div className="relative" style={{ height }}>
				<svg className="h-full w-full">
					<defs>
						<linearGradient id="revenueGradient" x1="0%" x2="0%" y1="0%" y2="100%">
							<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
							<stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
						</linearGradient>
					</defs>
					{/* Grid lines */}
					{[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
						<line
							key={i}
							opacity="0.3"
							stroke="rgb(51 65 85)"
							strokeWidth="1"
							x1="0"
							x2="100%"
							y1={height * ratio}
							y2={height * ratio}
						/>
					))}
					{/* Line path */}
					<motion.path
						animate={{ pathLength: 1 }}
						d={`M ${data
							.map((d, i) => {
								const x = (i / (data.length - 1)) * 100;
								const y = height - ((d.revenue - minRevenue) / range) * height;
								return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
							})
							.join(" ")}`}
						fill="none"
						initial={{ pathLength: 0 }}
						stroke="#3b82f6"
						strokeWidth="2"
						transition={{ duration: 2 }}
					/>
					{/* Area fill */}
					<motion.path
						animate={{ opacity: 1 }}
						d={`M ${data
							.map((d, i) => {
								const x = (i / (data.length - 1)) * 100;
								const y = height - ((d.revenue - minRevenue) / range) * height;
								return `${i === 0 ? "M" : "L"} ${x}% ${y}`;
							})
							.join(" ")} L 100% ${height} L 0% ${height} Z`}
						fill="url(#revenueGradient)"
						initial={{ opacity: 0 }}
						transition={{ duration: 1, delay: 1 }}
					/>
				</svg>
			</div>
			<div className="flex justify-between text-slate-400 text-xs">
				{data.map((d, i) => (
					<span key={i}>{d.period}</span>
				))}
			</div>
		</div>
	);
};

// Main Analytics Dashboard Component
export default function AnalyticsPage() {
	const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>("30d");
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");

	const { totalPatients, monthlyRevenue, upcomingAppointments, loading: metricsLoading } = useDashboardMetrics();
	const { patients, loading: patientsLoading } = usePatients();
	const { todaysAppointments, loading: appointmentsLoading } = useAppointments();

	const mockData = useMemo(() => generateMockAnalyticsData(), []);

	// Simulate loading
	useEffect(() => {
		const timer = setTimeout(() => setIsLoading(false), 1500);
		return () => clearTimeout(timer);
	}, []);

	// Healthcare KPIs
	const healthcareKPIs: AnalyticsKPI[] = useMemo(
		() => [
			{
				id: "total-patients",
				title: "Total de Pacientes",
				value: totalPatients || 486,
				change: 12.5,
				changeType: "increase",
				icon: Users,
				description: "Pacientes cadastrados no sistema",
				trend: [85, 91, 88, 94, 96, 89, 92],
			},
			{
				id: "monthly-revenue",
				title: "Receita Mensal",
				value: `R$ ${(monthlyRevenue || 125_000).toLocaleString("pt-BR")}`,
				change: 8.3,
				changeType: "increase",
				icon: DollarSign,
				description: "Receita total do mês atual",
				trend: [78, 82, 85, 88, 91, 87, 93],
			},
			{
				id: "appointments-scheduled",
				title: "Consultas Agendadas",
				value: upcomingAppointments || 156,
				change: -2.1,
				changeType: "decrease",
				icon: Calendar,
				description: "Consultas agendadas próximos 30 dias",
				trend: [92, 89, 91, 88, 85, 87, 84],
			},
			{
				id: "patient-satisfaction",
				title: "Satisfação do Paciente",
				value: "94%",
				change: 3.2,
				changeType: "increase",
				icon: Heart,
				description: "Média de satisfação nas avaliações",
				trend: [88, 89, 91, 92, 93, 94, 94],
			},
			{
				id: "treatment-success",
				title: "Taxa de Sucesso",
				value: "92%",
				change: 1.8,
				changeType: "increase",
				icon: Target,
				description: "Taxa de sucesso nos tratamentos",
				trend: [89, 90, 91, 91, 92, 92, 92],
			},
			{
				id: "compliance-score",
				title: "Conformidade LGPD",
				value: "96%",
				change: 2.0,
				changeType: "increase",
				icon: Shield,
				description: "Score de conformidade regulatória",
				trend: [92, 93, 94, 95, 95, 96, 96],
			},
		],
		[totalPatients, monthlyRevenue, upcomingAppointments]
	);

	if (isLoading || metricsLoading || patientsLoading || appointmentsLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
				<div className="mx-auto max-w-7xl space-y-8">
					{/* Header Skeleton */}
					<div className="space-y-4">
						<Skeleton className="h-10 w-96 bg-white/20" />
						<Skeleton className="h-6 w-64 bg-white/20" />
					</div>

					{/* KPI Cards Skeleton */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 6 }).map((_, i) => (
							<Skeleton className="h-32 bg-white/20" key={i} />
						))}
					</div>

					{/* Charts Skeleton */}
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton className="h-80 bg-white/20" key={i} />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
			<div className="mx-auto max-w-7xl space-y-8 p-6">
				{/* Header */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
					<div>
						<h1 className="font-bold text-3xl text-white">Analytics - NeonPro Healthcare</h1>
						<p className="text-slate-400">Análise completa da performance clínica e financeira</p>
					</div>

					<div className="flex items-center space-x-4">
						<Select onValueChange={(value: AnalyticsTimeRange) => setTimeRange(value)} value={timeRange}>
							<SelectTrigger className="w-40 border-slate-700 bg-slate-800/50 text-white">
								<SelectValue />
							</SelectTrigger>
							<SelectContent className="border-slate-700 bg-slate-800">
								<SelectItem value="7d">Últimos 7 dias</SelectItem>
								<SelectItem value="30d">Últimos 30 dias</SelectItem>
								<SelectItem value="90d">Últimos 90 dias</SelectItem>
								<SelectItem value="1y">Último ano</SelectItem>
							</SelectContent>
						</Select>

						<CosmicGlowButton onClick={() => window.location.reload()} size="sm" variant="secondary">
							<RefreshCw className="mr-2 h-4 w-4" />
							Atualizar
						</CosmicGlowButton>

						<CosmicGlowButton onClick={() => {}} size="sm" variant="success">
							<Download className="mr-2 h-4 w-4" />
							Exportar
						</CosmicGlowButton>
					</div>
				</div>

				{/* KPI Overview */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{healthcareKPIs.map((kpi) => (
						<KPICard key={kpi.id} kpi={kpi} />
					))}
				</div>

				{/* Main Analytics Tabs */}
				<Tabs className="w-full" onValueChange={setActiveTab} value={activeTab}>
					<TabsList className="grid w-full grid-cols-5 border-slate-700 bg-slate-800/50">
						<TabsTrigger className="data-[state=active]:bg-blue-600" value="overview">
							Visão Geral
						</TabsTrigger>
						<TabsTrigger className="data-[state=active]:bg-blue-600" value="practice">
							Análise Clínica
						</TabsTrigger>
						<TabsTrigger className="data-[state=active]:bg-blue-600" value="financial">
							Financeiro
						</TabsTrigger>
						<TabsTrigger className="data-[state=active]:bg-blue-600" value="predictive">
							Preditiva
						</TabsTrigger>
						<TabsTrigger className="data-[state=active]:bg-blue-600" value="compliance">
							Conformidade
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent className="space-y-8" value="overview">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* Revenue Trend */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Tendência de Receita</h3>
											<p className="text-slate-400 text-sm">Evolução mensal da receita</p>
										</div>
										<LineChart className="h-6 w-6 text-blue-400" />
									</div>
									<SimpleLineChart data={mockData.trendData} height={250} />
								</div>
							</NeonGradientCard>

							{/* Patient Demographics */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Demografia de Pacientes</h3>
											<p className="text-slate-400 text-sm">Distribuição por faixa etária</p>
										</div>
										<Users className="h-6 w-6 text-purple-400" />
									</div>
									<SimplePieChart data={mockData.patientDemographics} />
								</div>
							</NeonGradientCard>

							{/* Treatment Success Rates */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Taxa de Sucesso por Tratamento</h3>
											<p className="text-slate-400 text-sm">Percentual de sucesso por especialidade</p>
										</div>
										<Stethoscope className="h-6 w-6 text-green-400" />
									</div>
									<SimpleBarChart data={mockData.treatmentSuccessRates} height={250} />
								</div>
							</NeonGradientCard>

							{/* Revenue by Service */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Receita por Serviço</h3>
											<p className="text-slate-400 text-sm">Distribuição da receita por tipo de serviço</p>
										</div>
										<DollarSign className="h-6 w-6 text-accent" />
									</div>
									<SimplePieChart data={mockData.revenueByService} />
								</div>
							</NeonGradientCard>
						</div>
					</TabsContent>

					{/* Practice Analytics Tab */}
					<TabsContent className="space-y-8" value="practice">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* Patient Flow Analytics */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Fluxo de Pacientes</h3>
											<p className="text-slate-400 text-sm">Análise do fluxo de entrada e saída</p>
										</div>
										<Activity className="h-6 w-6 text-blue-400" />
									</div>

									<div className="space-y-4">
										<div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
											<div className="flex items-center space-x-3">
												<div className="h-2 w-2 rounded-full bg-green-400" />
												<span className="text-slate-300">Novos Pacientes</span>
											</div>
											<div className="text-right">
												<div className="font-semibold text-white">42</div>
												<div className="text-green-400 text-sm">+15%</div>
											</div>
										</div>

										<div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
											<div className="flex items-center space-x-3">
												<div className="h-2 w-2 rounded-full bg-blue-400" />
												<span className="text-slate-300">Retornos</span>
											</div>
											<div className="text-right">
												<div className="font-semibold text-white">134</div>
												<div className="text-blue-400 text-sm">+8%</div>
											</div>
										</div>

										<div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
											<div className="flex items-center space-x-3">
												<div className="h-2 w-2 rounded-full bg-accent" />
												<span className="text-slate-300">Faltas</span>
											</div>
											<div className="text-right">
												<div className="font-semibold text-white">12</div>
												<div className="text-red-400 text-sm">-23%</div>
											</div>
										</div>
									</div>
								</div>
							</NeonGradientCard>

							{/* Provider Performance */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Performance dos Profissionais</h3>
											<p className="text-slate-400 text-sm">Métricas de performance individual</p>
										</div>
										<UserCheck className="h-6 w-6 text-purple-400" />
									</div>

									<div className="space-y-3">
										{[
											{
												name: "Dr. Ana Silva",
												score: 96,
												consultations: 156,
												satisfaction: 4.8,
											},
											{
												name: "Dr. Carlos Santos",
												score: 94,
												consultations: 142,
												satisfaction: 4.7,
											},
											{
												name: "Dra. Maria Costa",
												score: 92,
												consultations: 138,
												satisfaction: 4.6,
											},
											{
												name: "Dr. João Oliveira",
												score: 89,
												consultations: 124,
												satisfaction: 4.5,
											},
										].map((provider, index) => (
											<div className="rounded-lg bg-white/5 p-3" key={index}>
												<div className="mb-2 flex items-center justify-between">
													<span className="font-medium text-white">{provider.name}</span>
													<Badge className="border-green-400 text-green-400" variant="outline">
														{provider.score}%
													</Badge>
												</div>
												<div className="flex justify-between text-slate-400 text-xs">
													<span>{provider.consultations} consultas</span>
													<span>★ {provider.satisfaction}</span>
												</div>
												<Progress className="mt-2 h-1" value={provider.score} />
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>

							{/* Capacity Utilization */}
							<NeonGradientCard className="lg:col-span-2">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Utilização da Capacidade</h3>
											<p className="text-slate-400 text-sm">Análise da ocupação por período e sala</p>
										</div>
										<Gauge className="h-6 w-6 text-orange-400" />
									</div>

									<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
										{[
											{ period: "Manhã", utilization: 89, rooms: 4 },
											{ period: "Tarde", utilization: 76, rooms: 4 },
											{ period: "Noite", utilization: 45, rooms: 2 },
											{ period: "Fim de Semana", utilization: 23, rooms: 1 },
										].map((slot, index) => (
											<div className="rounded-lg bg-white/5 p-4 text-center" key={index}>
												<div className="font-bold text-lg text-white">{slot.utilization}%</div>
												<div className="text-slate-300 text-sm">{slot.period}</div>
												<div className="text-slate-400 text-xs">{slot.rooms} salas</div>
												<Progress className="mt-2 h-1" value={slot.utilization} />
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>
						</div>
					</TabsContent>

					{/* Financial Intelligence Tab */}
					<TabsContent className="space-y-8" value="financial">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* Revenue Analytics */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Análise de Receita</h3>
											<p className="text-slate-400 text-sm">Breakdown detalhado da receita</p>
										</div>
										<DollarSign className="h-6 w-6 text-green-400" />
									</div>

									<div className="space-y-4">
										<div className="grid grid-cols-2 gap-4">
											<div className="rounded-lg bg-white/5 p-3 text-center">
												<div className="font-bold text-green-400 text-xl">R$ 125.430</div>
												<div className="text-slate-300 text-sm">Receita Bruta</div>
											</div>
											<div className="rounded-lg bg-white/5 p-3 text-center">
												<div className="font-bold text-blue-400 text-xl">R$ 98.670</div>
												<div className="text-slate-300 text-sm">Receita Líquida</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-slate-300">Margem Bruta</span>
												<span className="font-medium text-white">78.6%</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-300">Custos Operacionais</span>
												<span className="font-medium text-white">R$ 26.760</span>
											</div>
											<div className="flex justify-between">
												<span className="text-slate-300">EBITDA</span>
												<span className="font-medium text-green-400">R$ 71.910</span>
											</div>
										</div>
									</div>
								</div>
							</NeonGradientCard>

							{/* Payment Methods */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Métodos de Pagamento</h3>
											<p className="text-slate-400 text-sm">Distribuição por forma de pagamento</p>
										</div>
										<Target className="h-6 w-6 text-accent" />
									</div>

									<SimplePieChart
										data={[
											{
												name: "Cartão de Crédito",
												value: 45,
												color: "#10b981",
											},
											{ name: "PIX", value: 28, color: "#3b82f6" },
											{ name: "Dinheiro", value: 15, color: "#8b5cf6" },
											{ name: "Planos de Saúde", value: 8, color: "#f59e0b" },
											{ name: "Outros", value: 4, color: "#ef4444" },
										]}
									/>
								</div>
							</NeonGradientCard>

							{/* Cash Flow */}
							<NeonGradientCard className="lg:col-span-2">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Fluxo de Caixa</h3>
											<p className="text-slate-400 text-sm">Entradas e saídas mensais</p>
										</div>
										<BarChart3 className="h-6 w-6 text-blue-400" />
									</div>

									<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
										<div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
											<div className="font-bold text-2xl text-green-400">R$ 142.580</div>
											<div className="text-green-300 text-sm">Entradas</div>
											<div className="mt-1 text-green-400 text-xs">+12.5% vs mês anterior</div>
										</div>

										<div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
											<div className="font-bold text-2xl text-red-400">R$ 43.910</div>
											<div className="text-red-300 text-sm">Saídas</div>
											<div className="mt-1 text-red-400 text-xs">+8.2% vs mês anterior</div>
										</div>

										<div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4 text-center">
											<div className="font-bold text-2xl text-blue-400">R$ 98.670</div>
											<div className="text-blue-300 text-sm">Saldo Líquido</div>
											<div className="mt-1 text-blue-400 text-xs">+15.8% vs mês anterior</div>
										</div>
									</div>
								</div>
							</NeonGradientCard>
						</div>
					</TabsContent>

					{/* Predictive Analytics Tab */}
					<TabsContent className="space-y-8" value="predictive">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* No-Show Prediction */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Predição de Faltas</h3>
											<p className="text-slate-400 text-sm">Probabilidade de no-show por paciente</p>
										</div>
										<AlertTriangle className="h-6 w-6 text-accent" />
									</div>

									<div className="space-y-3">
										{[
											{
												patient: "Maria Santos",
												risk: "Alto",
												probability: 78,
												appointment: "Hoje 14:00",
											},
											{
												patient: "João Silva",
												risk: "Médio",
												probability: 45,
												appointment: "Amanhã 09:30",
											},
											{
												patient: "Ana Costa",
												risk: "Baixo",
												probability: 12,
												appointment: "Quinta 16:00",
											},
											{
												patient: "Carlos Oliveira",
												risk: "Médio",
												probability: 38,
												appointment: "Sexta 11:00",
											},
										].map((prediction, index) => (
											<div className="rounded-lg bg-white/5 p-3" key={index}>
												<div className="mb-2 flex items-center justify-between">
													<span className="font-medium text-white">{prediction.patient}</span>
													<Badge
														className={`
                              ${
																prediction.risk === "Alto"
																	? "border-red-400 text-red-400"
																	: prediction.risk === "Médio"
																		? "border-accent text-accent"
																		: "border-green-400 text-green-400"
															}
                            `}
														variant="outline"
													>
														{prediction.risk}: {prediction.probability}%
													</Badge>
												</div>
												<div className="text-slate-400 text-xs">{prediction.appointment}</div>
												<Progress className="mt-2 h-1" value={prediction.probability} />
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>

							{/* Revenue Projections */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Projeções de Receita</h3>
											<p className="text-slate-400 text-sm">Previsões para os próximos meses</p>
										</div>
										<TrendingUp className="h-6 w-6 text-green-400" />
									</div>

									<div className="space-y-4">
										<div className="grid grid-cols-3 gap-3 text-center">
											<div className="rounded-lg bg-white/5 p-3">
												<div className="font-bold text-blue-400 text-lg">R$ 132K</div>
												<div className="text-slate-300 text-xs">Próximo Mês</div>
												<div className="text-green-400 text-xs">+5.2%</div>
											</div>
											<div className="rounded-lg bg-white/5 p-3">
												<div className="font-bold text-lg text-purple-400">R$ 389K</div>
												<div className="text-slate-300 text-xs">Trimestre</div>
												<div className="text-green-400 text-xs">+8.7%</div>
											</div>
											<div className="rounded-lg bg-white/5 p-3">
												<div className="font-bold text-green-400 text-lg">R$ 1.6M</div>
												<div className="text-slate-300 text-xs">Anual</div>
												<div className="text-green-400 text-xs">+12.3%</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between">
												<span className="text-slate-300">Confiança da Previsão</span>
												<span className="font-medium text-green-400">87%</span>
											</div>
											<Progress className="h-2" value={87} />
										</div>

										<Alert className="border-blue-500/20 bg-blue-500/10">
											<AlertCircle className="h-4 w-4 text-blue-400" />
											<AlertDescription className="text-blue-200">
												Baseado em dados históricos e tendências sazonais
											</AlertDescription>
										</Alert>
									</div>
								</div>
							</NeonGradientCard>

							{/* Seasonal Demand */}
							<NeonGradientCard className="lg:col-span-2">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Padrões de Demanda Sazonal</h3>
											<p className="text-slate-400 text-sm">Análise de sazonalidade por tipo de procedimento</p>
										</div>
										<Calendar className="h-6 w-6 text-orange-400" />
									</div>

									<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
										{[
											{
												season: "Verão",
												procedures: "Estética Corporal",
												trend: "+45%",
												color: "bg-accent/10 border-accent/20 text-accent",
											},
											{
												season: "Outono",
												procedures: "Tratamentos Faciais",
												trend: "+28%",
												color: "bg-orange-500/10 border-orange-500/20 text-orange-400",
											},
											{
												season: "Inverno",
												procedures: "Cirurgias Plásticas",
												trend: "+35%",
												color: "bg-blue-500/10 border-blue-500/20 text-blue-400",
											},
											{
												season: "Primavera",
												procedures: "Harmonização Facial",
												trend: "+22%",
												color: "bg-green-500/10 border-green-500/20 text-green-400",
											},
										].map((pattern, index) => (
											<div className={`rounded-lg border p-4 ${pattern.color}`} key={index}>
												<div className="font-bold text-lg">{pattern.season}</div>
												<div className="mt-1 text-sm opacity-90">{pattern.procedures}</div>
												<div className="mt-2 font-bold text-lg">{pattern.trend}</div>
												<div className="text-xs opacity-75">vs média anual</div>
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>
						</div>
					</TabsContent>

					{/* Compliance Tab */}
					<TabsContent className="space-y-8" value="compliance">
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							{/* LGPD Compliance */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Conformidade LGPD</h3>
											<p className="text-slate-400 text-sm">Status de adequação à LGPD</p>
										</div>
										<Shield className="h-6 w-6 text-green-400" />
									</div>

									<div className="space-y-4">
										<div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-center">
											<div className="font-bold text-3xl text-green-400">96%</div>
											<div className="text-green-300 text-sm">Score de Conformidade</div>
										</div>

										<div className="space-y-2">
											{[
												{
													item: "Consentimento de Dados",
													status: "completed",
													score: 98,
												},
												{
													item: "Anonimização",
													status: "completed",
													score: 95,
												},
												{
													item: "Relatórios de Impacto",
													status: "warning",
													score: 89,
												},
												{
													item: "Treinamento de Equipe",
													status: "completed",
													score: 100,
												},
											].map((item, index) => (
												<div className="flex items-center justify-between rounded bg-white/5 p-2" key={index}>
													<div className="flex items-center space-x-2">
														{item.status === "completed" ? (
															<CheckCircle2 className="h-4 w-4 text-green-400" />
														) : (
															<AlertTriangle className="h-4 w-4 text-accent" />
														)}
														<span className="text-slate-300 text-sm">{item.item}</span>
													</div>
													<span className="font-medium text-sm text-white">{item.score}%</span>
												</div>
											))}
										</div>
									</div>
								</div>
							</NeonGradientCard>

							{/* Regulatory Metrics */}
							<NeonGradientCard>
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Métricas Regulatórias</h3>
											<p className="text-slate-400 text-sm">Indicadores de qualidade e conformidade</p>
										</div>
										<FileText className="h-6 w-6 text-blue-400" />
									</div>

									<div className="space-y-3">
										{mockData.complianceMetrics.map((metric, index) => (
											<div className="rounded-lg bg-white/5 p-3" key={index}>
												<div className="mb-2 flex items-center justify-between">
													<span className="font-medium text-white">{metric.metric}</span>
													<Badge
														className={`
                              ${
																metric.status === "excellent"
																	? "border-green-400 text-green-400"
																	: metric.status === "good"
																		? "border-blue-400 text-blue-400"
																		: "border-accent text-accent"
															}
                            `}
														variant="outline"
													>
														{metric.score}%
													</Badge>
												</div>
												<Progress className="mb-2 h-2" value={metric.score} />
												<div className="flex items-center space-x-1">
													{metric.trend === "up" ? (
														<TrendingUp className="h-3 w-3 text-green-400" />
													) : metric.trend === "down" ? (
														<TrendingDown className="h-3 w-3 text-red-400" />
													) : (
														<div className="h-3 w-3 rounded-full bg-slate-400" />
													)}
													<span
														className={`text-xs ${
															metric.trend === "up"
																? "text-green-400"
																: metric.trend === "down"
																	? "text-red-400"
																	: "text-slate-400"
														}`}
													>
														{metric.trend === "up" ? "Melhorando" : metric.trend === "down" ? "Degradando" : "Estável"}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>

							{/* Audit Trail */}
							<NeonGradientCard className="lg:col-span-2">
								<div className="space-y-4">
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-semibold text-lg text-white">Trilha de Auditoria</h3>
											<p className="text-slate-400 text-sm">Atividades recentes de conformidade</p>
										</div>
										<Eye className="h-6 w-6 text-purple-400" />
									</div>

									<div className="space-y-3">
										{[
											{
												time: "2 horas atrás",
												action: "Backup automático realizado",
												user: "Sistema",
												status: "success",
											},
											{
												time: "4 horas atrás",
												action: "Relatório LGPD gerado",
												user: "Admin",
												status: "success",
											},
											{
												time: "1 dia atrás",
												action: "Auditoria de segurança executada",
												user: "Sistema",
												status: "success",
											},
											{
												time: "2 dias atrás",
												action: "Treinamento LGPD concluído",
												user: "Equipe",
												status: "success",
											},
											{
												time: "3 dias atrás",
												action: "Política de privacidade atualizada",
												user: "Admin",
												status: "warning",
											},
										].map((audit, index) => (
											<div className="flex items-center space-x-4 rounded-lg bg-white/5 p-3" key={index}>
												<div
													className={`h-2 w-2 rounded-full ${
														audit.status === "success"
															? "bg-green-400"
															: audit.status === "warning"
																? "bg-accent"
																: "bg-red-400"
													}`}
												/>
												<div className="flex-1">
													<div className="font-medium text-white">{audit.action}</div>
													<div className="text-slate-400 text-sm">por {audit.user}</div>
												</div>
												<div className="text-slate-400 text-sm">{audit.time}</div>
											</div>
										))}
									</div>
								</div>
							</NeonGradientCard>
						</div>
					</TabsContent>
				</Tabs>

				{/* Report Builder Integration */}
				<NeonGradientCard>
					<div className="flex items-center justify-between">
						<div>
							<h3 className="font-semibold text-lg text-white">Custom Report Builder</h3>
							<p className="text-slate-400 text-sm">Crie relatórios personalizados com interface drag-and-drop</p>
						</div>
						<CosmicGlowButton
							onClick={() => window.open("/dashboard/analytics/report-builder", "_blank")}
							variant="success"
						>
							<FileText className="mr-2 h-4 w-4" />
							Abrir Report Builder
						</CosmicGlowButton>
					</div>
				</NeonGradientCard>

				{/* Footer */}
				<div className="text-center text-slate-500 text-sm">
					<p>NeonPro Healthcare Analytics - Dados atualizados em tempo real</p>
					<p>Conformidade LGPD/ANVISA • Accessibility WCAG 2.1 AA</p>
				</div>
			</div>
		</div>
	);
}
