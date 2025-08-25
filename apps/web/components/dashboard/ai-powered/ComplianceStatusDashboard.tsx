/**
 * Compliance Status Dashboard
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { useState, useEffect } from "react";
import {
	AlertTriangle,
	CheckCircle,
	Clock,
	FileText,
	Shield,
	Stethoscope,
	Users,
	XCircle,
	Calendar,
	Download,
	Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComplianceFramework {
	name: "LGPD" | "ANVISA" | "CFM";
	score: number;
	status: "compliant" | "warning" | "non-compliant";
	lastAudit: string;
	nextAudit: string;
	criticalIssues: number;
	warningIssues: number;
	requirements: ComplianceRequirement[];
}

interface ComplianceRequirement {
	id: string;
	title: string;
	description: string;
	status: "compliant" | "warning" | "non-compliant" | "pending";
	lastChecked: string;
	autoRemediationAvailable: boolean;
	priority: "high" | "medium" | "low";
}

interface ComplianceReport {
	id: string;
	type: "audit" | "violation" | "remediation" | "certification";
	title: string;
	date: string;
	framework: "LGPD" | "ANVISA" | "CFM" | "ALL";
	status: "completed" | "pending" | "in-progress";
	downloadUrl?: string;
}

export function ComplianceStatusDashboard() {
	const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
	const [reports, setReports] = useState<ComplianceReport[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate loading compliance data
		const timer = setTimeout(() => {
			setFrameworks([
				{
					name: "LGPD",
					score: 98.5,
					status: "compliant",
					lastAudit: "2025-01-15T10:00:00Z",
					nextAudit: "2025-04-15T10:00:00Z",
					criticalIssues: 0,
					warningIssues: 1,
					requirements: [
						{
							id: "lgpd-1",
							title: "Consentimento Granular",
							description: "Consentimento específico para cada finalidade de tratamento",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "high",
						},
						{
							id: "lgpd-2",
							title: "Portabilidade de Dados",
							description: "Exportação de dados em formato estruturado",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "medium",
						},
						{
							id: "lgpd-3",
							title: "Anonimização",
							description: "Processo de anonimização para dados antigos",
							status: "warning",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: false,
							priority: "medium",
						},
					],
				},
				{
					name: "ANVISA",
					score: 96.2,
					status: "compliant",
					lastAudit: "2025-01-10T14:00:00Z",
					nextAudit: "2025-07-10T14:00:00Z",
					criticalIssues: 0,
					warningIssues: 2,
					requirements: [
						{
							id: "anvisa-1",
							title: "Registro de Equipamentos",
							description: "Todos equipamentos médicos registrados na ANVISA",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: false,
							priority: "high",
						},
						{
							id: "anvisa-2",
							title: "Rastreabilidade de Insumos",
							description: "Controle de lote e validade de insumos médicos",
							status: "warning",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "medium",
						},
						{
							id: "anvisa-3",
							title: "Controle de Qualidade",
							description: "Protocolos de controle de qualidade implementados",
							status: "warning",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: false,
							priority: "low",
						},
					],
				},
				{
					name: "CFM",
					score: 100,
					status: "compliant",
					lastAudit: "2025-01-20T16:00:00Z",
					nextAudit: "2025-12-20T16:00:00Z",
					criticalIssues: 0,
					warningIssues: 0,
					requirements: [
						{
							id: "cfm-1",
							title: "Registro Médico Válido",
							description: "CRM ativo e especialização validada",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "high",
						},
						{
							id: "cfm-2",
							title: "Consentimento Informado",
							description: "Processo de consentimento conforme resolução CFM",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "high",
						},
						{
							id: "cfm-3",
							title: "Prontuário Digital",
							description: "Prontuário médico digital conforme CFM 1.821/07",
							status: "compliant",
							lastChecked: "2025-01-25T08:00:00Z",
							autoRemediationAvailable: true,
							priority: "medium",
						},
					],
				},
			]);

			setReports([
				{
					id: "1",
					type: "audit",
					title: "Auditoria LGPD Completa - Janeiro 2025",
					date: "2025-01-15T10:00:00Z",
					framework: "LGPD",
					status: "completed",
					downloadUrl: "/reports/lgpd-audit-jan-2025.pdf",
				},
				{
					id: "2",
					type: "certification",
					title: "Certificação ANVISA - Renovação",
					date: "2025-01-20T14:00:00Z",
					framework: "ANVISA",
					status: "completed",
					downloadUrl: "/reports/anvisa-cert-2025.pdf",
				},
				{
					id: "3",
					type: "audit",
					title: "Auditoria CFM - Prontuários Digitais",
					date: "2025-01-22T16:00:00Z",
					framework: "CFM",
					status: "completed",
				},
				{
					id: "4",
					type: "audit",
					title: "Auditoria Trimestral - Multi-Framework",
					date: "2025-04-01T09:00:00Z",
					framework: "ALL",
					status: "pending",
				},
			]);

			setLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "compliant":
				return <CheckCircle className="h-4 w-4 text-green-600" />;
			case "warning":
				return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
			case "non-compliant":
				return <XCircle className="h-4 w-4 text-red-600" />;
			case "pending":
				return <Clock className="h-4 w-4 text-blue-600" />;
			default:
				return <Clock className="h-4 w-4 text-gray-400" />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "compliant":
				return "text-green-600 border-green-600";
			case "warning":
				return "text-yellow-600 border-yellow-600";
			case "non-compliant":
				return "text-red-600 border-red-600";
			case "pending":
				return "text-blue-600 border-blue-600";
			default:
				return "text-gray-400 border-gray-400";
		}
	};

	const getFrameworkIcon = (name: string) => {
		switch (name) {
			case "LGPD":
				return <Shield className="h-5 w-5 text-blue-600" />;
			case "ANVISA":
				return <Stethoscope className="h-5 w-5 text-green-600" />;
			case "CFM":
				return <FileText className="h-5 w-5 text-purple-600" />;
			default:
				return <Shield className="h-5 w-5" />;
		}
	};

	const overallScore = frameworks.length > 0 
		? Math.round(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length) 
		: 0;

	const totalCriticalIssues = frameworks.reduce((acc, f) => acc + f.criticalIssues, 0);
	const totalWarningIssues = frameworks.reduce((acc, f) => acc + f.warningIssues, 0);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
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
			aria-labelledby="compliance-heading"
			aria-describedby="compliance-description"
		>
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 
						id="compliance-heading"
						className="text-2xl font-bold text-foreground"
					>
						Status de Compliance
					</h2>
					<p 
						id="compliance-description"
						className="text-muted-foreground"
					>
						Monitoramento em tempo real LGPD, ANVISA e CFM
					</p>
				</div>
				<Badge 
					variant="outline" 
					className={getStatusColor("compliant")}
					role="status"
					aria-label={`Score geral de compliance: ${overallScore}%`}
				>
					Score Geral: {overallScore}%
				</Badge>
			</div>

			{/* Overall Status Alert */}
			{totalCriticalIssues > 0 && (
				<Alert 
					variant="destructive"
					role="alert"
					aria-live="polite"
				>
					<AlertTriangle className="h-4 w-4" aria-hidden="true" />
					<AlertTitle>Atenção: Problemas Críticos Detectados</AlertTitle>
					<AlertDescription>
						{totalCriticalIssues} issue(s) crítica(s) requer(em) atenção imediata para manter compliance.
					</AlertDescription>
				</Alert>
			)}

			{/* Framework Overview */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{frameworks.map((framework) => (
					<Card key={framework.name} className="neonpro-card group">
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center text-sm font-medium">
								<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all">
									{getFrameworkIcon(framework.name)}
								</div>
								{framework.name}
							</CardTitle>
							<CardDescription>
								Última auditoria: {new Date(framework.lastAudit).toLocaleDateString("pt-BR")}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<div className="text-2xl font-bold">{framework.score}%</div>
									{getStatusIcon(framework.status)}
								</div>
								<Progress value={framework.score} className="h-2" />
								<div className="flex justify-between text-sm">
									<span className="text-red-600">
										{framework.criticalIssues} críticos
									</span>
									<span className="text-yellow-600">
										{framework.warningIssues} avisos
									</span>
								</div>
								<div className="text-xs text-muted-foreground">
									Próxima auditoria: {new Date(framework.nextAudit).toLocaleDateString("pt-BR")}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Detailed Compliance Requirements */}
			<Card className="neonpro-card">
				<CardHeader>
					<CardTitle>Requisitos de Compliance</CardTitle>
					<CardDescription>
						Status detalhado de cada framework regulatório
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Tabs defaultValue="LGPD" className="w-full">
						<TabsList className="grid w-full grid-cols-3">
							{frameworks.map((framework) => (
								<TabsTrigger key={framework.name} value={framework.name}>
									{framework.name}
								</TabsTrigger>
							))}
						</TabsList>
						{frameworks.map((framework) => (
							<TabsContent key={framework.name} value={framework.name} className="space-y-4">
								{framework.requirements.map((req) => (
									<div
										key={req.id}
										className="flex items-start space-x-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
									>
										<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
											{getStatusIcon(req.status)}
										</div>
										<div className="flex-1 space-y-2">
											<div className="flex items-center space-x-2">
												<h4 className="font-semibold">{req.title}</h4>
												<Badge variant="outline" className={getStatusColor(req.status)}>
													{req.status === "compliant" && "Conforme"}
													{req.status === "warning" && "Atenção"}
													{req.status === "non-compliant" && "Não Conforme"}
													{req.status === "pending" && "Pendente"}
												</Badge>
												<Badge variant="outline">
													{req.priority === "high" && "Alta Prioridade"}
													{req.priority === "medium" && "Média Prioridade"}
													{req.priority === "low" && "Baixa Prioridade"}
												</Badge>
											</div>
											<p className="text-sm text-muted-foreground">{req.description}</p>
											<div className="flex items-center space-x-4 text-xs text-muted-foreground">
												<span>
													Última verificação: {new Date(req.lastChecked).toLocaleDateString("pt-BR")}
												</span>
												{req.autoRemediationAvailable && (
													<Badge variant="outline" className="text-blue-600 border-blue-600">
														Auto-correção disponível
													</Badge>
												)}
											</div>
										</div>
										<div className="flex space-x-2">
											{req.autoRemediationAvailable && req.status !== "compliant" && (
												<Button size="sm" variant="outline">
													Corrigir Automaticamente
												</Button>
											)}
											<Button size="sm" variant="ghost">
												<Eye className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}
							</TabsContent>
						))}
					</Tabs>
				</CardContent>
			</Card>

			{/* Reports Section */}
			<Card className="neonpro-card">
				<CardHeader>
					<CardTitle className="flex items-center">
						<FileText className="mr-2 h-5 w-5" />
						Relatórios de Compliance
					</CardTitle>
					<CardDescription>
						Auditorias, certificações e relatórios regulatórios
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{reports.map((report) => (
							<div
								key={report.id}
								className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
							>
								<div className="flex items-center space-x-4">
									<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
										{getStatusIcon(report.status)}
									</div>
									<div>
										<h4 className="font-semibold">{report.title}</h4>
										<div className="flex items-center space-x-2 text-sm text-muted-foreground">
											<span>{new Date(report.date).toLocaleDateString("pt-BR")}</span>
											<Badge variant="outline">{report.framework}</Badge>
											<Badge variant="outline" className={getStatusColor(report.status)}>
												{report.status === "completed" && "Concluído"}
												{report.status === "pending" && "Pendente"}
												{report.status === "in-progress" && "Em andamento"}
											</Badge>
										</div>
									</div>
								</div>
								<div className="flex space-x-2">
									{report.downloadUrl && (
										<Button size="sm" variant="outline">
											<Download className="h-4 w-4 mr-2" />
											Baixar
										</Button>
									)}
									<Button size="sm" variant="ghost">
										<Eye className="h-4 w-4" />
									</Button>
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}