"use client";

import { motion } from "framer-motion";
import {
	Activity,
	AlertCircle,
	AlertTriangle,
	BarChart3,
	Bell,
	Calendar,
	CheckCircle,
	ChevronRight,
	Clock,
	Download,
	FileText,
	Heart,
	Info,
	RefreshCw,
	Settings,
	Shield,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Healthcare compliance types
interface ComplianceMetric {
	id: string;
	title: string;
	score: number;
	status: "excellent" | "good" | "warning" | "critical";
	trend: "up" | "down" | "stable";
	lastUpdated: string;
}

interface ComplianceAlert {
	id: string;
	type: "critical" | "important" | "routine";
	title: string;
	description: string;
	dueDate: string;
	category: "LGPD" | "ANVISA" | "CFM";
	actionRequired: boolean;
}

interface ActionItem {
	id: string;
	title: string;
	description: string;
	priority: "critical" | "high" | "medium" | "low";
	category: "LGPD" | "ANVISA" | "CFM";
	estimatedTime: string;
	assignedTo: string;
	status: "pending" | "in_progress" | "completed";
	dueDate: string;
}

// NeonPro design components matching existing dashboard patterns
type NeonGradientCardProps = {
	children: React.ReactNode;
	className?: string;
};

const NeonGradientCard = ({ children, className = "" }: NeonGradientCardProps) => (
	<motion.div
		animate={{ opacity: 1, y: 0 }}
		className={`relative overflow-hidden rounded-xl border border-healthcare-border bg-gradient-to-br from-slate-900/90 to-blue-900/30 backdrop-blur-sm ${className}`}
		initial={{ opacity: 0, y: 20 }}
	>
		<div className="absolute inset-0 bg-gradient-to-r from-healthcare-primary/10 to-blue-500/10 opacity-50" />
		<div className="relative z-10 p-6">{children}</div>
	</motion.div>
);

type CosmicGlowButtonProps = {
	children: React.ReactNode;
	variant?: "primary" | "secondary" | "success" | "warning" | "danger";
	size?: "sm" | "md" | "lg";
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
};

const CosmicGlowButton = ({
	children,
	variant = "primary",
	size = "md",
	onClick,
	className = "",
	disabled = false,
}: CosmicGlowButtonProps) => {
	const variants = {
		primary: "bg-gradient-to-r from-healthcare-primary to-blue-600 hover:from-healthcare-primary/80 hover:to-blue-700",
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
			className={`inline-flex items-center gap-2 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
			disabled={disabled}
			onClick={onClick}
			whileHover={{ scale: disabled ? 1 : 1.02 }}
			whileTap={{ scale: disabled ? 1 : 0.98 }}
		>
			{children}
		</motion.button>
	);
};

// Mock data for Brazilian healthcare compliance
const complianceMetrics: ComplianceMetric[] = [
	{
		id: "lgpd-overall",
		title: "LGPD - Proteção de Dados",
		score: 92,
		status: "excellent",
		trend: "up",
		lastUpdated: "2024-01-15T14:30:00Z",
	},
	{
		id: "anvisa-overall",
		title: "ANVISA - Vigilância Sanitária",
		score: 88,
		status: "good",
		trend: "stable",
		lastUpdated: "2024-01-15T10:15:00Z",
	},
	{
		id: "cfm-overall",
		title: "CFM - Medicina Profissional",
		score: 95,
		status: "excellent",
		trend: "up",
		lastUpdated: "2024-01-15T16:45:00Z",
	},
	{
		id: "audit-readiness",
		title: "Prontidão para Auditoria",
		score: 85,
		status: "good",
		trend: "up",
		lastUpdated: "2024-01-15T12:00:00Z",
	},
];

const complianceAlerts: ComplianceAlert[] = [
	{
		id: "lgpd-consent-review",
		type: "important",
		title: "Revisão de Consentimentos LGPD",
		description: "Revisar e atualizar formulários de consentimento para pacientes",
		dueDate: "2024-01-25",
		category: "LGPD",
		actionRequired: true,
	},
	{
		id: "anvisa-license-renewal",
		type: "critical",
		title: "Renovação de Licença ANVISA",
		description: "Licença de funcionamento ANVISA expira em 10 dias",
		dueDate: "2024-01-25",
		category: "ANVISA",
		actionRequired: true,
	},
	{
		id: "cfm-education-credits",
		type: "routine",
		title: "Créditos de Educação Continuada",
		description: "Acompanhar progresso de educação médica continuada da equipe",
		dueDate: "2024-02-15",
		category: "CFM",
		actionRequired: false,
	},
];

const actionItems: ActionItem[] = [
	{
		id: "lgpd-data-mapping",
		title: "Mapeamento de Dados Pessoais",
		description: "Atualizar inventário de processamento de dados pessoais",
		priority: "high",
		category: "LGPD",
		estimatedTime: "4 horas",
		assignedTo: "Dr. Maria Silva",
		status: "in_progress",
		dueDate: "2024-01-20",
	},
	{
		id: "anvisa-equipment-validation",
		title: "Validação de Equipamentos Médicos",
		description: "Completar validação anual de equipamentos médicos",
		priority: "critical",
		category: "ANVISA",
		estimatedTime: "2 dias",
		assignedTo: "Eng. João Santos",
		status: "pending",
		dueDate: "2024-01-18",
	},
	{
		id: "cfm-license-check",
		title: "Verificação de Licenças Médicas",
		description: "Verificar status de renovação das licenças da equipe médica",
		priority: "medium",
		category: "CFM",
		estimatedTime: "1 hora",
		assignedTo: "RH - Ana Costa",
		status: "completed",
		dueDate: "2024-01-15",
	},
];

// Compliance Overview Section
function ComplianceOverview() {
	const overallScore = Math.round(
		complianceMetrics.reduce((acc, metric) => acc + metric.score, 0) / complianceMetrics.length
	);

	const getScoreColor = (score: number) => {
		if (score >= 90) return "text-green-400";
		if (score >= 80) return "text-yellow-400";
		return "text-red-400";
	};

	const getScoreStatus = (score: number) => {
		if (score >= 90) return "Excelente";
		if (score >= 80) return "Bom";
		if (score >= 60) return "Atenção";
		return "Crítico";
	};

	return (
		<NeonGradientCard>
			<div className="text-center">
				<h2 className="mb-4 font-bold text-2xl text-white">Score de Compliance Geral</h2>
				<div className={`mb-2 font-bold text-6xl ${getScoreColor(overallScore)}`}>{overallScore}%</div>
				<p className="mb-6 text-slate-300">Status: {getScoreStatus(overallScore)}</p>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{complianceMetrics.map((metric) => (
						<div className="rounded-lg bg-white/5 p-4" key={metric.id}>
							<h3 className="mb-2 font-medium text-slate-300 text-sm">{metric.title}</h3>
							<div className={`font-bold text-2xl ${getScoreColor(metric.score)}`}>{metric.score}%</div>
							<div className="mt-2 flex items-center justify-center">
								{metric.trend === "up" && <TrendingUp className="h-4 w-4 text-green-400" />}
								{metric.trend === "down" && <TrendingUp className="h-4 w-4 rotate-180 text-red-400" />}
								{metric.trend === "stable" && <Activity className="h-4 w-4 text-yellow-400" />}
								<span className="ml-1 text-slate-400 text-xs">
									{metric.trend === "up" ? "Melhorando" : metric.trend === "down" ? "Declinando" : "Estável"}
								</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</NeonGradientCard>
	);
} // Critical Alerts Section
function CriticalAlerts() {
	const criticalAlerts = complianceAlerts.filter((alert) => alert.type === "critical");
	const importantAlerts = complianceAlerts.filter((alert) => alert.type === "important");

	const getAlertIcon = (type: string) => {
		switch (type) {
			case "critical":
				return <AlertTriangle className="h-5 w-5 text-red-400" />;
			case "important":
				return <AlertCircle className="h-5 w-5 text-yellow-400" />;
			default:
				return <Info className="h-5 w-5 text-blue-400" />;
		}
	};

	const getAlertColor = (type: string) => {
		switch (type) {
			case "critical":
				return "border-red-500/50 bg-red-500/10";
			case "important":
				return "border-yellow-500/50 bg-yellow-500/10";
			default:
				return "border-blue-500/50 bg-blue-500/10";
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "LGPD":
				return "bg-blue-500";
			case "ANVISA":
				return "bg-green-500";
			case "CFM":
				return "bg-purple-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Bell className="mr-2 h-5 w-5" />
					Alertas Críticos e Importantes
				</h2>
				<CosmicGlowButton size="sm" variant="secondary">
					<RefreshCw className="mr-2 h-4 w-4" />
					Atualizar
				</CosmicGlowButton>
			</div>

			<div className="space-y-4">
				{complianceAlerts.slice(0, 5).map((alert) => (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className={`rounded-lg border p-4 ${getAlertColor(alert.type)}`}
						initial={{ opacity: 0, x: -20 }}
						key={alert.id}
					>
						<div className="flex items-start justify-between">
							<div className="flex items-start space-x-3">
								{getAlertIcon(alert.type)}
								<div className="flex-1">
									<div className="mb-1 flex items-center space-x-2">
										<h3 className="font-semibold text-white">{alert.title}</h3>
										<Badge className={`${getCategoryColor(alert.category)} text-white text-xs`}>{alert.category}</Badge>
									</div>
									<p className="mb-2 text-slate-300 text-sm">{alert.description}</p>
									<div className="flex items-center space-x-4 text-slate-400 text-xs">
										<span className="flex items-center">
											<Clock className="mr-1 h-3 w-3" />
											Prazo: {new Date(alert.dueDate).toLocaleDateString("pt-BR")}
										</span>
										{alert.actionRequired && <span className="font-medium text-red-400">Ação Requerida</span>}
									</div>
								</div>
							</div>
							<CosmicGlowButton size="sm" variant={alert.type === "critical" ? "danger" : "warning"}>
								<ChevronRight className="h-4 w-4" />
							</CosmicGlowButton>
						</div>
					</motion.div>
				))}
			</div>

			{complianceAlerts.length === 0 && (
				<div className="py-8 text-center text-slate-400">
					<CheckCircle className="mx-auto mb-4 h-12 w-12 opacity-50" />
					<p>Nenhum alerta crítico no momento</p>
					<p className="text-sm">Todos os sistemas estão em conformidade</p>
				</div>
			)}
		</NeonGradientCard>
	);
}

// LGPD Compliance Module
function LGPDComplianceModule() {
	const lgpdMetrics = [
		{ label: "Consentimentos Válidos", value: "94%", status: "good" },
		{ label: "Solicitações de Dados", value: "12", status: "good" },
		{ label: "Tempo de Resposta Médio", value: "3.2 dias", status: "good" },
		{ label: "Incidentes de Dados", value: "0", status: "excellent" },
	];

	const recentActivities = [
		{
			action: "Consentimento atualizado",
			patient: "Paciente #1234",
			time: "2h atrás",
		},
		{
			action: "Solicitação de dados processada",
			patient: "Paciente #5678",
			time: "4h atrás",
		},
		{
			action: "Revisão de política de privacidade",
			patient: "Sistema",
			time: "1 dia atrás",
		},
	];

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Shield className="mr-2 h-5 w-5 text-blue-400" />
					LGPD - Proteção de Dados
				</h2>
				<div className="flex space-x-2">
					<CosmicGlowButton size="sm" variant="primary">
						<FileText className="mr-2 h-4 w-4" />
						Relatório LGPD
					</CosmicGlowButton>
					<CosmicGlowButton size="sm" variant="secondary">
						<Settings className="h-4 w-4" />
					</CosmicGlowButton>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				{lgpdMetrics.map((metric, index) => (
					<div className="rounded-lg bg-white/5 p-3 text-center" key={index}>
						<div className="font-bold text-lg text-white">{metric.value}</div>
						<div className="text-slate-300 text-sm">{metric.label}</div>
					</div>
				))}
			</div>

			<div className="space-y-3">
				<h3 className="font-semibold text-sm text-white">Atividades Recentes</h3>
				{recentActivities.map((activity, index) => (
					<div className="flex items-center justify-between rounded-lg bg-white/5 p-3" key={index}>
						<div>
							<p className="font-medium text-sm text-white">{activity.action}</p>
							<p className="text-slate-400 text-xs">{activity.patient}</p>
						</div>
						<span className="text-slate-400 text-xs">{activity.time}</span>
					</div>
				))}
			</div>
		</NeonGradientCard>
	);
}

// ANVISA Compliance Module
function ANVISAComplianceModule() {
	const anvisaMetrics = [
		{ label: "Licenças Válidas", value: "8/8", status: "excellent" },
		{ label: "Equipamentos Validados", value: "97%", status: "good" },
		{ label: "Eventos Adversos", value: "2", status: "warning" },
		{ label: "Auditorias Pendentes", value: "1", status: "warning" },
	];

	const licenses = [
		{ name: "Licença de Funcionamento", expiry: "2024-06-15", status: "valid" },
		{ name: "Licença Sanitária", expiry: "2024-03-20", status: "renewing" },
		{ name: "Licença de Equipamentos", expiry: "2024-08-10", status: "valid" },
	];

	const getStatusColor = (status: string) => {
		switch (status) {
			case "valid":
				return "text-green-400";
			case "renewing":
				return "text-yellow-400";
			case "expired":
				return "text-red-400";
			default:
				return "text-slate-400";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "valid":
				return "Válida";
			case "renewing":
				return "Renovando";
			case "expired":
				return "Expirada";
			default:
				return "Desconhecido";
		}
	};

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Heart className="mr-2 h-5 w-5 text-green-400" />
					ANVISA - Vigilância Sanitária
				</h2>
				<div className="flex space-x-2">
					<CosmicGlowButton size="sm" variant="success">
						<Download className="mr-2 h-4 w-4" />
						Certificados
					</CosmicGlowButton>
					<CosmicGlowButton size="sm" variant="secondary">
						<Settings className="h-4 w-4" />
					</CosmicGlowButton>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				{anvisaMetrics.map((metric, index) => (
					<div className="rounded-lg bg-white/5 p-3 text-center" key={index}>
						<div className="font-bold text-lg text-white">{metric.value}</div>
						<div className="text-slate-300 text-sm">{metric.label}</div>
					</div>
				))}
			</div>

			<div className="space-y-3">
				<h3 className="font-semibold text-sm text-white">Status das Licenças</h3>
				{licenses.map((license, index) => (
					<div className="flex items-center justify-between rounded-lg bg-white/5 p-3" key={index}>
						<div>
							<p className="font-medium text-sm text-white">{license.name}</p>
							<p className="text-slate-400 text-xs">
								Expira em: {new Date(license.expiry).toLocaleDateString("pt-BR")}
							</p>
						</div>
						<span className={`font-medium text-sm ${getStatusColor(license.status)}`}>
							{getStatusText(license.status)}
						</span>
					</div>
				))}
			</div>
		</NeonGradientCard>
	);
} // CFM Professional Module
function CFMComplianceModule() {
	const cfmMetrics = [
		{ label: "Licenças Médicas Válidas", value: "12/12", status: "excellent" },
		{ label: "Créditos CME Completos", value: "89%", status: "good" },
		{ label: "Certificações Especiais", value: "6", status: "good" },
		{ label: "Renovações Pendentes", value: "2", status: "warning" },
	];

	const professionals = [
		{
			name: "Dr. João Silva",
			crm: "CRM-SP 123456",
			specialty: "Cardiologia",
			cmeCredits: "85%",
		},
		{
			name: "Dra. Maria Santos",
			crm: "CRM-SP 234567",
			specialty: "Pediatria",
			cmeCredits: "92%",
		},
		{
			name: "Dr. Carlos Oliveira",
			crm: "CRM-SP 345678",
			specialty: "Ortopedia",
			cmeCredits: "78%",
		},
	];

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Users className="mr-2 h-5 w-5 text-purple-400" />
					CFM - Medicina Profissional
				</h2>
				<div className="flex space-x-2">
					<CosmicGlowButton size="sm" variant="primary">
						<BarChart3 className="mr-2 h-4 w-4" />
						Relatório CME
					</CosmicGlowButton>
					<CosmicGlowButton size="sm" variant="secondary">
						<Settings className="h-4 w-4" />
					</CosmicGlowButton>
				</div>
			</div>

			<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
				{cfmMetrics.map((metric, index) => (
					<div className="rounded-lg bg-white/5 p-3 text-center" key={index}>
						<div className="font-bold text-lg text-white">{metric.value}</div>
						<div className="text-slate-300 text-sm">{metric.label}</div>
					</div>
				))}
			</div>

			<div className="space-y-3">
				<h3 className="font-semibold text-sm text-white">Equipe Médica</h3>
				{professionals.map((prof, index) => (
					<div className="flex items-center justify-between rounded-lg bg-white/5 p-3" key={index}>
						<div>
							<p className="font-medium text-sm text-white">{prof.name}</p>
							<p className="text-slate-400 text-xs">
								{prof.crm} - {prof.specialty}
							</p>
						</div>
						<div className="text-right">
							<span className="font-medium text-sm text-white">{prof.cmeCredits}</span>
							<p className="text-slate-400 text-xs">CME Completo</p>
						</div>
					</div>
				))}
			</div>
		</NeonGradientCard>
	);
}

// Action Items Section
function ActionItemsSection() {
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "critical":
				return "text-red-400 border-red-500/50 bg-red-500/10";
			case "high":
				return "text-orange-400 border-orange-500/50 bg-orange-500/10";
			case "medium":
				return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
			case "low":
				return "text-green-400 border-green-500/50 bg-green-500/10";
			default:
				return "text-slate-400 border-slate-500/50 bg-slate-500/10";
		}
	};

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "critical":
				return <AlertTriangle className="h-4 w-4" />;
			case "high":
				return <AlertCircle className="h-4 w-4" />;
			case "medium":
				return <Clock className="h-4 w-4" />;
			case "low":
				return <Info className="h-4 w-4" />;
			default:
				return <Activity className="h-4 w-4" />;
		}
	};

	const getPriorityText = (priority: string) => {
		switch (priority) {
			case "critical":
				return "Crítico";
			case "high":
				return "Alto";
			case "medium":
				return "Médio";
			case "low":
				return "Baixo";
			default:
				return "Indefinido";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "text-green-400";
			case "in_progress":
				return "text-blue-400";
			case "pending":
				return "text-yellow-400";
			default:
				return "text-slate-400";
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "completed":
				return "Concluído";
			case "in_progress":
				return "Em Andamento";
			case "pending":
				return "Pendente";
			default:
				return "Indefinido";
		}
	};

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Zap className="mr-2 h-5 w-5 text-yellow-400" />
					Itens de Ação Prioritários
				</h2>
				<div className="flex space-x-2">
					<CosmicGlowButton size="sm" variant="primary">
						<FileText className="mr-2 h-4 w-4" />
						Nova Ação
					</CosmicGlowButton>
					<CosmicGlowButton size="sm" variant="secondary">
						<Settings className="h-4 w-4" />
					</CosmicGlowButton>
				</div>
			</div>

			<div className="space-y-4">
				{actionItems.map((item) => (
					<motion.div
						animate={{ opacity: 1, y: 0 }}
						className={`rounded-lg border p-4 ${getPriorityColor(item.priority)}`}
						initial={{ opacity: 0, y: 10 }}
						key={item.id}
					>
						<div className="flex items-start justify-between">
							<div className="flex flex-1 items-start space-x-3">
								<div className="flex items-center space-x-2">
									{getPriorityIcon(item.priority)}
									<Badge
										className={`${item.category === "LGPD" ? "bg-blue-500" : item.category === "ANVISA" ? "bg-green-500" : "bg-purple-500"} text-white text-xs`}
									>
										{item.category}
									</Badge>
								</div>
								<div className="flex-1">
									<h3 className="mb-1 font-semibold text-sm text-white">{item.title}</h3>
									<p className="mb-2 text-slate-300 text-xs">{item.description}</p>
									<div className="flex items-center space-x-4 text-slate-400 text-xs">
										<span>Responsável: {item.assignedTo}</span>
										<span>Tempo estimado: {item.estimatedTime}</span>
										<span>Prazo: {new Date(item.dueDate).toLocaleDateString("pt-BR")}</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-end space-y-2">
								<span className={`font-medium text-xs ${getPriorityColor(item.priority).split(" ")[0]}`}>
									{getPriorityText(item.priority)}
								</span>
								<span className={`font-medium text-xs ${getStatusColor(item.status)}`}>
									{getStatusText(item.status)}
								</span>
								<CosmicGlowButton
									disabled={item.status === "completed"}
									size="sm"
									variant={item.status === "completed" ? "success" : "primary"}
								>
									{item.status === "completed" ? "Concluído" : "Ação"}
								</CosmicGlowButton>
							</div>
						</div>
					</motion.div>
				))}
			</div>
		</NeonGradientCard>
	);
}

// Regulatory Calendar
function RegulatoryCalendar() {
	const upcomingDeadlines = [
		{
			title: "Renovação ANVISA",
			date: "2024-01-25",
			category: "ANVISA",
			type: "critical",
		},
		{
			title: "Relatório LGPD Trimestral",
			date: "2024-01-31",
			category: "LGPD",
			type: "important",
		},
		{
			title: "Auditoria Interna",
			date: "2024-02-15",
			category: "Qualidade",
			type: "routine",
		},
		{
			title: "Renovação CRM Dr. Silva",
			date: "2024-02-28",
			category: "CFM",
			type: "important",
		},
		{
			title: "Treinamento LGPD Equipe",
			date: "2024-03-05",
			category: "LGPD",
			type: "routine",
		},
	];

	const getTypeColor = (type: string) => {
		switch (type) {
			case "critical":
				return "border-l-red-500 bg-red-500/10";
			case "important":
				return "border-l-yellow-500 bg-yellow-500/10";
			case "routine":
				return "border-l-blue-500 bg-blue-500/10";
			default:
				return "border-l-slate-500 bg-slate-500/10";
		}
	};

	const getCategoryColor = (category: string) => {
		switch (category) {
			case "LGPD":
				return "bg-blue-500";
			case "ANVISA":
				return "bg-green-500";
			case "CFM":
				return "bg-purple-500";
			default:
				return "bg-gray-500";
		}
	};

	const getDaysUntil = (dateString: string) => {
		const today = new Date();
		const targetDate = new Date(dateString);
		const diffTime = targetDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	return (
		<NeonGradientCard>
			<div className="mb-6 flex items-center justify-between">
				<h2 className="flex items-center font-bold text-white text-xl">
					<Calendar className="mr-2 h-5 w-5 text-blue-400" />
					Calendário Regulatório
				</h2>
				<div className="flex space-x-2">
					<CosmicGlowButton size="sm" variant="primary">
						<Calendar className="mr-2 h-4 w-4" />
						Ver Calendário
					</CosmicGlowButton>
					<CosmicGlowButton size="sm" variant="secondary">
						<Bell className="h-4 w-4" />
					</CosmicGlowButton>
				</div>
			</div>

			<div className="space-y-3">
				{upcomingDeadlines.map((deadline, index) => {
					const daysUntil = getDaysUntil(deadline.date);
					return (
						<div className={`rounded-r-lg border-l-4 p-4 ${getTypeColor(deadline.type)}`} key={index}>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div>
										<h3 className="font-semibold text-sm text-white">{deadline.title}</h3>
										<p className="text-slate-300 text-xs">{new Date(deadline.date).toLocaleDateString("pt-BR")}</p>
									</div>
									<Badge className={`${getCategoryColor(deadline.category)} text-white text-xs`}>
										{deadline.category}
									</Badge>
								</div>
								<div className="text-right">
									<div
										className={`font-medium text-sm ${daysUntil <= 7 ? "text-red-400" : daysUntil <= 30 ? "text-yellow-400" : "text-green-400"}`}
									>
										{daysUntil < 0 ? "Vencido" : daysUntil === 0 ? "Hoje" : `${daysUntil} dias`}
									</div>
									<p className="text-slate-400 text-xs">
										{daysUntil < 0 ? "Ação urgente" : daysUntil <= 7 ? "Urgente" : "No prazo"}
									</p>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</NeonGradientCard>
	);
} // Main Compliance Dashboard Page
export default function ComplianceAutomationPage() {
	const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
	const [isRefreshing, setIsRefreshing] = useState(false);

	// Simulate real-time updates
	useEffect(() => {
		const interval = setInterval(() => {
			setLastUpdated(new Date());
		}, 60_000); // Update every minute

		return () => clearInterval(interval);
	}, []);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 2000));
		setLastUpdated(new Date());
		setIsRefreshing(false);
	};

	const overallComplianceScore = Math.round(
		complianceMetrics.reduce((acc, metric) => acc + metric.score, 0) / complianceMetrics.length
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
			<div className="container mx-auto space-y-8 p-6">
				{/* Header with accessibility attributes */}
				<header className="flex items-center justify-between" role="banner">
					<div>
						<h1 className="mb-2 font-bold text-3xl text-white">Central de Compliance Regulatório</h1>
						<p className="text-slate-300">Monitoramento em tempo real - LGPD, ANVISA e CFM</p>
						<p className="mt-1 text-slate-400 text-sm">Última atualização: {lastUpdated.toLocaleString("pt-BR")}</p>
					</div>
					<div className="flex items-center space-x-4">
						<div
							className={`flex items-center space-x-2 rounded-lg px-3 py-2 ${
								overallComplianceScore >= 90
									? "bg-green-500/20 text-green-400"
									: overallComplianceScore >= 80
										? "bg-yellow-500/20 text-yellow-400"
										: "bg-red-500/20 text-red-400"
							}`}
						>
							<span className="font-medium text-sm">Compliance:</span>
							<span className="font-bold text-lg">{overallComplianceScore}%</span>
						</div>
						<CosmicGlowButton
							className="flex items-center"
							disabled={isRefreshing}
							onClick={handleRefresh}
							size="sm"
							variant="secondary"
						>
							<RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
							{isRefreshing ? "Atualizando..." : "Atualizar"}
						</CosmicGlowButton>
						<CosmicGlowButton size="sm" variant="primary">
							<Download className="mr-2 h-4 w-4" />
							Relatório Completo
						</CosmicGlowButton>
					</div>
				</header>

				{/* Main Content with semantic structure */}
				<main role="main">
					{/* Compliance Overview */}
					<section aria-labelledby="overview-heading" className="mb-8">
						<h2 className="sr-only" id="overview-heading">
							Visão Geral de Compliance
						</h2>
						<ComplianceOverview />
					</section>

					{/* Critical Alerts */}
					<section aria-labelledby="alerts-heading" className="mb-8">
						<h2 className="sr-only" id="alerts-heading">
							Alertas Críticos e Importantes
						</h2>
						<CriticalAlerts />
					</section>

					{/* Compliance Modules Grid */}
					<section aria-labelledby="modules-heading" className="mb-8">
						<h2 className="sr-only" id="modules-heading">
							Módulos de Compliance Regulatório
						</h2>
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
							<div aria-labelledby="lgpd-heading" role="region">
								<h3 className="sr-only" id="lgpd-heading">
									Módulo LGPD
								</h3>
								<LGPDComplianceModule />
							</div>
							<div aria-labelledby="anvisa-heading" role="region">
								<h3 className="sr-only" id="anvisa-heading">
									Módulo ANVISA
								</h3>
								<ANVISAComplianceModule />
							</div>
							<div aria-labelledby="cfm-heading" role="region">
								<h3 className="sr-only" id="cfm-heading">
									Módulo CFM
								</h3>
								<CFMComplianceModule />
							</div>
						</div>
					</section>

					{/* Action Items and Calendar */}
					<section aria-labelledby="actions-calendar-heading" className="mb-8">
						<h2 className="sr-only" id="actions-calendar-heading">
							Ações e Calendário Regulatório
						</h2>
						<div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
							<div aria-labelledby="actions-heading" role="region">
								<h3 className="sr-only" id="actions-heading">
									Itens de Ação Prioritários
								</h3>
								<ActionItemsSection />
							</div>
							<div aria-labelledby="calendar-heading" role="region">
								<h3 className="sr-only" id="calendar-heading">
									Calendário Regulatório
								</h3>
								<RegulatoryCalendar />
							</div>
						</div>
					</section>

					{/* Quick Actions */}
					<section aria-labelledby="quick-actions-heading" className="mb-8">
						<h2 className="sr-only" id="quick-actions-heading">
							Ações Rápidas
						</h2>
						<NeonGradientCard>
							<div className="mb-6 flex items-center justify-between">
								<h2 className="flex items-center font-bold text-white text-xl">
									<Zap className="mr-2 h-5 w-5 text-yellow-400" />
									Ações Rápidas de Compliance
								</h2>
							</div>
							<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
								<CosmicGlowButton
									aria-label="Gerar relatório LGPD"
									className="flex h-auto flex-col items-center justify-center p-6"
									variant="primary"
								>
									<Shield className="mb-2 h-8 w-8" />
									<span className="font-medium text-sm">Relatório LGPD</span>
								</CosmicGlowButton>
								<CosmicGlowButton
									aria-label="Verificar licenças ANVISA"
									className="flex h-auto flex-col items-center justify-center p-6"
									variant="success"
								>
									<Heart className="mb-2 h-8 w-8" />
									<span className="font-medium text-sm">Licenças ANVISA</span>
								</CosmicGlowButton>
								<CosmicGlowButton
									aria-label="Monitorar equipe médica CFM"
									className="flex h-auto flex-col items-center justify-center p-6"
									variant="secondary"
								>
									<Users className="mb-2 h-8 w-8" />
									<span className="font-medium text-sm">Equipe CFM</span>
								</CosmicGlowButton>
								<CosmicGlowButton
									aria-label="Agendar auditoria"
									className="flex h-auto flex-col items-center justify-center p-6"
									variant="warning"
								>
									<Calendar className="mb-2 h-8 w-8" />
									<span className="font-medium text-sm">Agendar Auditoria</span>
								</CosmicGlowButton>
							</div>
						</NeonGradientCard>
					</section>

					{/* System Status Footer */}
					<section aria-labelledby="system-status-heading">
						<h2 className="sr-only" id="system-status-heading">
							Status do Sistema de Compliance
						</h2>
						<NeonGradientCard>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-4">
									<div className="flex items-center space-x-2">
										<CheckCircle className="h-5 w-5 text-green-400" />
										<span className="font-medium text-white">Sistema Online</span>
									</div>
									<div className="flex items-center space-x-2">
										<Shield className="h-5 w-5 text-blue-400" />
										<span className="text-slate-300">Monitoramento Ativo</span>
									</div>
									<div className="flex items-center space-x-2">
										<Activity className="h-5 w-5 text-green-400" />
										<span className="text-slate-300">Backups Sincronizados</span>
									</div>
								</div>
								<div className="text-right">
									<p className="text-slate-300 text-sm">NeonPro Healthcare Compliance System v2.1</p>
									<p className="text-slate-400 text-xs">Certificado para regulamentações brasileiras de saúde</p>
								</div>
							</div>
						</NeonGradientCard>
					</section>
				</main>

				{/* Accessibility Live Region for Updates */}
				<div aria-label="Atualizações de compliance" aria-live="polite" className="sr-only" role="status">
					{isRefreshing && "Atualizando dados de compliance..."}
				</div>
			</div>
		</div>
	);
}
