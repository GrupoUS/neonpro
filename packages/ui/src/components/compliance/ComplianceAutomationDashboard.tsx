// ================================================
// COMPLIANCE AUTOMATION DASHBOARD - ENHANCED
// Advanced compliance automation dashboard with React hooks
// ================================================

"use client";

import { Activity, AlertCircle, CheckCircle, Download, FileText, RefreshCw, Settings, Shield } from "lucide-react";
import type React from "react";
import { useComplianceAlerts, useComplianceScore } from "../../lib/utils";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

// ================================================
// TYPES AND INTERFACES
// ================================================

type ComplianceAutomationDashboardProps = {
	clinicId?: string;
};

type StatusCardProps = {
	title: string;
	value: number;
	status: string;
	icon: React.ReactNode;
	color: "success" | "warning" | "error" | "info";
};

// ================================================
// UTILITY FUNCTIONS
// ================================================

const _getStatusColor = (status: string): string => {
	switch (status.toLowerCase()) {
		case "compliant":
		case "active":
		case "completed":
			return "bg-green-500";
		case "warning":
		case "pending":
			return "bg-yellow-500";
		case "non_compliant":
		case "error":
		case "failed":
			return "bg-red-500";
		default:
			return "bg-gray-500";
	}
};

const getSeverityColor = (severity: string): string => {
	switch (severity.toLowerCase()) {
		case "critical":
			return "destructive";
		case "high":
			return "destructive";
		case "medium":
			return "secondary";
		case "low":
			return "outline";
		default:
			return "outline";
	}
};

const formatDate = (dateString: string): string => {
	try {
		return new Date(dateString).toLocaleString("pt-BR", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	} catch {
		return "Data inválida";
	}
};

// ================================================
// STATUS CARD COMPONENT
// ================================================

const StatusCard: React.FC<StatusCardProps> = ({ title, value, status, icon, color }) => {
	const colorClasses = {
		success: "border-green-200 bg-green-50",
		warning: "border-yellow-200 bg-yellow-50",
		error: "border-red-200 bg-red-50",
		info: "border-blue-200 bg-blue-50",
	};

	return (
		<Card className={`${colorClasses[color]} transition-all hover:shadow-md`}>
			<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle className="font-medium text-gray-600 text-sm">{title}</CardTitle>
				<div className="h-4 w-4 text-gray-500">{icon}</div>
			</CardHeader>
			<CardContent>
				<div className="font-bold text-2xl text-gray-900">{value}%</div>
				<p className="mt-1 text-gray-500 text-xs">
					Status: <span className="font-medium">{status}</span>
				</p>
			</CardContent>
		</Card>
	);
};

// ================================================
// MAIN COMPONENT
// ================================================

export const ComplianceAutomationDashboard: React.FC<ComplianceAutomationDashboardProps> = ({ clinicId }) => {
	// Mock hooks for compliance status and operations using imported stubs
	const useComplianceStatus = () => ({
		status: useComplianceScore(),
		alerts: useComplianceAlerts(),
		loading: false,
		error: null,
		lastRefresh: new Date().toISOString(),
		refresh: () => {},
	});
	const useDataClassification = () => ({
		classifyData: (_data: any) => Promise.resolve(),
		loading: false,
	});
	const useDataSubjectRequests = () => ({
		createRequest: (_request: any) => Promise.resolve(),
		loading: false,
	});
	const useSoftwareValidation = () => ({
		validateSoftware: (_software: any) => Promise.resolve(),
		loading: false,
	});
	const useProfessionalValidation = () => ({
		validateProfessional: (_professional: any) => Promise.resolve(),
		loading: false,
	});
	const useComplianceAlertsLocal = () => ({
		createAlert: (_alert: any) => Promise.resolve(),
		loading: false,
	});
	const useComplianceReportLocal = () => ({
		generateReport: (_type: string, _filters?: any) => Promise.resolve(),
		scheduleReport: (_type: string, _schedule: any) => Promise.resolve(),
		downloadReport: (_reportId: string, _format?: string) => Promise.resolve(),
		deleteReport: (_reportId: string) => Promise.resolve(),
		loading: false,
	});

	const { status, alerts, loading, error, lastRefresh, refresh } = useComplianceStatus();
	const { classifyData, loading: classifyLoading } = useDataClassification();
	const { createRequest, loading: requestLoading } = useDataSubjectRequests();
	const { validateSoftware, loading: softwareLoading } = useSoftwareValidation();
	const { validateProfessional, loading: professionalLoading } = useProfessionalValidation();
	const { createAlert, loading: alertLoading } = useComplianceAlertsLocal();
	const {
		generateReport,
		scheduleReport,
		downloadReport,
		deleteReport,
		loading: reportLoading,
	} = useComplianceReportLocal();

	// ================================================
	// EVENT HANDLERS
	// ================================================

	const handleQuickDataClassification = async () => {
		try {
			await classifyData({
				tableName: "patients",
				columnName: "cpf",
				overrideClassification: {
					category: "sensitive",
					sensitivity: 5,
					encryptionRequired: true,
					retentionDays: 2555, // 7 years
				},
			});

			await refresh(); // Refresh status after operation
		} catch (_err) {}
	};

	const handleQuickSoftwareValidation = async () => {
		try {
			await validateSoftware({
				softwareItemName: "NeonPro Core System",
				softwareVersion: "1.0.0",
				changeDescription: "Initial system deployment",
				safetyClassification: "B",
				riskAssessmentRequired: true,
			});

			await refresh(); // Refresh status after operation
		} catch (_err) {}
	};

	const handleCreateTestAlert = async () => {
		try {
			await createAlert({
				alertType: "system_test",
				severity: "low",
				clinicId,
				description: "Teste do sistema de alertas de compliance",
				affectedSystems: ["dashboard"],
				autoResolve: true,
			});

			await refresh(); // Refresh status after operation
		} catch (_err) {}
	};

	const handleGenerateComprehensiveReport = async () => {
		try {
			await generateReport("comprehensive", clinicId);
		} catch (_err) {}
	};

	// ================================================
	// LOADING AND ERROR STATES
	// ================================================

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
					<span className="ml-2 text-gray-600 text-lg">Carregando status de compliance...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert className="border-red-200 bg-red-50">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Erro no Sistema de Compliance</AlertTitle>
				<AlertDescription>
					{error}
					<Button className="mt-2" onClick={refresh} size="sm" variant="outline">
						<RefreshCw className="mr-2 h-4 w-4" />
						Tentar Novamente
					</Button>
				</AlertDescription>
			</Alert>
		);
	}

	if (!status) {
		return (
			<Alert className="border-yellow-200 bg-yellow-50">
				<AlertCircle className="h-4 w-4" />
				<AlertTitle>Nenhum Dado de Compliance</AlertTitle>
				<AlertDescription>
					Não foi possível carregar os dados de compliance. Verifique a configuração do sistema.
				</AlertDescription>
			</Alert>
		);
	}

	// ================================================
	// RENDER DASHBOARD
	// ================================================

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-bold text-3xl text-gray-900 tracking-tight">Compliance Automation Dashboard</h1>
					<p className="text-gray-500">Monitoramento automatizado de compliance LGPD, ANVISA e CFM</p>
				</div>
				<div className="flex items-center space-x-2">
					<Badge className="text-xs" variant="outline">
						Última atualização: {formatDate(lastRefresh)}
					</Badge>
					<Button disabled={loading} onClick={refresh} size="sm" variant="outline">
						<RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
						Atualizar
					</Button>
				</div>
			</div>

			{/* Status Overview Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<StatusCard
					color={status.overall_score >= 80 ? "success" : status.overall_score >= 60 ? "warning" : "error"}
					icon={<Shield />}
					status={status.overall_status}
					title="Compliance Geral"
					value={status.overall_score}
				/>
				<StatusCard
					color={status.lgpd_score >= 80 ? "success" : status.lgpd_score >= 60 ? "warning" : "error"}
					icon={<Shield />}
					status="Monitorado"
					title="LGPD"
					value={status.lgpd_score}
				/>
				<StatusCard
					color={status.anvisa_score >= 80 ? "success" : status.anvisa_score >= 60 ? "warning" : "error"}
					icon={<Activity />}
					status="Ativo"
					title="ANVISA"
					value={status.anvisa_score}
				/>
				<StatusCard
					color={status.cfm_score >= 80 ? "success" : status.cfm_score >= 60 ? "warning" : "error"}
					icon={<CheckCircle />}
					status="Validado"
					title="CFM"
					value={status.cfm_score}
				/>
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Settings className="mr-2 h-5 w-5" />
						Ações Rápidas
					</CardTitle>
					<CardDescription>Execute validações e operações de compliance rapidamente</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
						<Button
							className="w-full"
							disabled={classifyLoading}
							onClick={handleQuickDataClassification}
							variant="outline"
						>
							{classifyLoading ? (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Shield className="mr-2 h-4 w-4" />
							)}
							Classificar Dados
						</Button>
						<Button
							className="w-full"
							disabled={softwareLoading}
							onClick={handleQuickSoftwareValidation}
							variant="outline"
						>
							{softwareLoading ? (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Activity className="mr-2 h-4 w-4" />
							)}
							Validar Software
						</Button>
						<Button className="w-full" disabled={alertLoading} onClick={handleCreateTestAlert} variant="outline">
							{alertLoading ? (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<AlertCircle className="mr-2 h-4 w-4" />
							)}
							Teste de Alerta
						</Button>
						<Button
							className="w-full"
							disabled={reportLoading}
							onClick={handleGenerateComprehensiveReport}
							variant="outline"
						>
							{reportLoading ? (
								<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Download className="mr-2 h-4 w-4" />
							)}
							Relatório Completo
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Alerts and Status Details */}
			<Tabs className="w-full" defaultValue="alerts">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="alerts">Alertas Recentes</TabsTrigger>
					<TabsTrigger value="status">Detalhes do Status</TabsTrigger>
					<TabsTrigger value="reports">Relatórios</TabsTrigger>
				</TabsList>

				<TabsContent className="space-y-4" value="alerts">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<AlertCircle className="mr-2 h-5 w-5" />
								Alertas de Compliance ({alerts.length})
							</CardTitle>
							<CardDescription>Alertas críticos e avisos do sistema de compliance</CardDescription>
						</CardHeader>
						<CardContent>
							{alerts.length === 0 ? (
								<div className="py-6 text-center">
									<CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
									<p className="text-gray-500">Nenhum alerta ativo no momento</p>
								</div>
							) : (
								<div className="space-y-3">
									{alerts.map((alert) => (
										<div className="space-y-2 rounded-lg border p-4" key={alert.id}>
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-2">
													<Badge variant={getSeverityColor(alert.severity) as any}>
														{alert.severity.toUpperCase()}
													</Badge>
													<span className="font-medium">{alert.alert_type}</span>
												</div>
												<span className="text-gray-500 text-sm">{formatDate(alert.created_at)}</span>
											</div>
											<p className="text-gray-700">{alert.description}</p>
											{alert.affected_systems.length > 0 && (
												<div className="flex items-center space-x-2">
													<span className="text-gray-500 text-sm">Sistemas afetados:</span>
													{alert.affected_systems.map((system) => (
														<Badge className="text-xs" key={system} variant="outline">
															{system}
														</Badge>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent className="space-y-4" value="status">
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Métricas de Compliance</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div>
									<div className="mb-1 flex justify-between text-sm">
										<span>LGPD Compliance</span>
										<span>{status.lgpd_score}%</span>
									</div>
									<Progress className="h-2" value={status.lgpd_score} />
								</div>
								<div>
									<div className="mb-1 flex justify-between text-sm">
										<span>ANVISA Compliance</span>
										<span>{status.anvisa_score}%</span>
									</div>
									<Progress className="h-2" value={status.anvisa_score} />
								</div>
								<div>
									<div className="mb-1 flex justify-between text-sm">
										<span>CFM Compliance</span>
										<span>{status.cfm_score}%</span>
									</div>
									<Progress className="h-2" value={status.cfm_score} />
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Estatísticas do Sistema</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex justify-between">
									<span className="text-gray-600">Alertas Críticos:</span>
									<Badge variant={status.critical_alerts > 0 ? "destructive" : "outline"}>
										{status.critical_alerts}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Solicitações Pendentes:</span>
									<Badge variant={status.pending_requests > 0 ? "secondary" : "outline"}>
										{status.pending_requests}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Requer Atenção:</span>
									<Badge variant={status.requires_attention ? "destructive" : "outline"}>
										{status.requires_attention ? "Sim" : "Não"}
									</Badge>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-600">Última Avaliação:</span>
									<span className="text-gray-500 text-sm">{formatDate(status.assessed_at)}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent className="space-y-4" value="reports">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center">
								<FileText className="mr-2 h-5 w-5" />
								Relatórios de Compliance
							</CardTitle>
							<CardDescription>Gere relatórios detalhados de compliance para auditoria</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
								<Button
									className="w-full"
									disabled={reportLoading}
									onClick={() => generateReport("lgpd", clinicId)}
									variant="outline"
								>
									<FileText className="mr-2 h-4 w-4" />
									Relatório LGPD
								</Button>
								<Button
									className="w-full"
									disabled={reportLoading}
									onClick={() => generateReport("anvisa", clinicId)}
									variant="outline"
								>
									<FileText className="mr-2 h-4 w-4" />
									Relatório ANVISA
								</Button>
								<Button
									className="w-full"
									disabled={reportLoading}
									onClick={() => generateReport("cfm", clinicId)}
									variant="outline"
								>
									<FileText className="mr-2 h-4 w-4" />
									Relatório CFM
								</Button>
								<Button
									className="w-full"
									disabled={reportLoading}
									onClick={() => generateReport("comprehensive", clinicId)}
									variant="outline"
								>
									<Download className="mr-2 h-4 w-4" />
									Relatório Completo
								</Button>
							</div>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};
