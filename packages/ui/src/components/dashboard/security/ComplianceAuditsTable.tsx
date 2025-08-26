"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
	AlertTriangle,
	CheckCircle2,
	Clock,
	Download,
	Eye,
	FileText,
	RefreshCw,
	Search,
	Shield,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Progress } from "../../ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../../ui/table";

type ComplianceAudit = {
	id: string;
	audit_type: "lgpd" | "anvisa" | "cfm" | "iso27001" | "comprehensive";
	audit_name: string;
	description?: string;
	status: "pending" | "in_progress" | "completed" | "failed" | "cancelled";
	compliance_score?: number;
	total_checks: number;
	passed_checks: number;
	failed_checks: number;
	warning_checks: number;
	critical_issues: number;
	high_issues: number;
	medium_issues: number;
	low_issues: number;
	started_at?: string;
	completed_at?: string;
	started_by?: string;
	audit_data?: Record<string, any>;
	findings?: Array<{
		category: string;
		severity: "critical" | "high" | "medium" | "low";
		issue: string;
		recommendation: string;
		evidence?: string;
	}>;
	recommendations?: string[];
	next_audit_date?: string;
	report_url?: string;
	created_at: string;
	updated_at: string;
};

export function ComplianceAuditsTable() {
	const [audits, setAudits] = useState<ComplianceAudit[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [selectedAudit, setSelectedAudit] = useState<ComplianceAudit | null>(
		null,
	);

	const fetchAudits = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/security/compliance-audits", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to fetch compliance audits");
			}

			const data = await response.json();
			setAudits(data.audits || []);
		} catch (_error) {
			toast.error("Erro ao carregar auditorias de compliance");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAudits();
	}, [fetchAudits]);

	const handleStartAudit = async (auditType: string) => {
		try {
			const response = await fetch("/api/security/compliance-audits/start", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ audit_type: auditType }),
			});

			if (!response.ok) {
				throw new Error("Failed to start audit");
			}

			await fetchAudits();
			toast.success("Auditoria iniciada com sucesso");
		} catch (_error) {
			toast.error("Erro ao iniciar auditoria");
		}
	};

	const handleDownloadReport = async (auditId: string) => {
		try {
			const response = await fetch(
				`/api/security/compliance-audits/${auditId}/report`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!response.ok) {
				throw new Error("Failed to download report");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `compliance-audit-${auditId}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);

			toast.success("Relatório baixado com sucesso");
		} catch (_error) {
			toast.error("Erro ao baixar relatório");
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "default";
			case "in_progress":
				return "secondary";
			case "failed":
				return "destructive";
			case "pending":
				return "outline";
			case "cancelled":
				return "outline";
			default:
				return "outline";
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle2 className="h-4 w-4 text-green-500" />;
			case "in_progress":
				return <Clock className="h-4 w-4 text-blue-500" />;
			case "failed":
				return <XCircle className="h-4 w-4 text-red-500" />;
			case "pending":
				return <Clock className="h-4 w-4 text-gray-500" />;
			case "cancelled":
				return <XCircle className="h-4 w-4 text-gray-500" />;
			default:
				return <Clock className="h-4 w-4 text-gray-500" />;
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "lgpd":
				return <Shield className="h-4 w-4 text-blue-500" />;
			case "anvisa":
				return <Shield className="h-4 w-4 text-green-500" />;
			case "cfm":
				return <Shield className="h-4 w-4 text-purple-500" />;
			case "iso27001":
				return <Shield className="h-4 w-4 text-orange-500" />;
			case "comprehensive":
				return <Shield className="h-4 w-4 text-red-500" />;
			default:
				return <Shield className="h-4 w-4 text-gray-500" />;
		}
	};

	const getComplianceScoreColor = (score: number) => {
		if (score >= 90) {
			return "text-green-600";
		}
		if (score >= 80) {
			return "text-blue-600";
		}
		if (score >= 70) {
			return "text-yellow-600";
		}
		return "text-red-600";
	};

	const filteredAudits = audits.filter((audit) => {
		const matchesSearch =
			audit.audit_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			audit.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			audit.audit_type.toLowerCase().includes(searchTerm.toLowerCase());

		const matchesType = typeFilter === "all" || audit.audit_type === typeFilter;
		const matchesStatus =
			statusFilter === "all" || audit.status === statusFilter;

		return matchesSearch && matchesType && matchesStatus;
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center p-8">
				<RefreshCw className="h-6 w-6 animate-spin" />
				<span className="ml-2">Carregando auditorias de compliance...</span>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Summary Stats */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
				<div className="rounded-lg bg-blue-50 p-4">
					<div className="flex items-center space-x-2">
						<FileText className="h-5 w-5 text-blue-600" />
						<div>
							<div className="font-bold text-2xl text-blue-600">
								{audits.length}
							</div>
							<div className="text-blue-600 text-sm">Total de Auditorias</div>
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-green-50 p-4">
					<div className="flex items-center space-x-2">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						<div>
							<div className="font-bold text-2xl text-green-600">
								{audits.filter((a) => a.status === "completed").length}
							</div>
							<div className="text-green-600 text-sm">Concluídas</div>
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-yellow-50 p-4">
					<div className="flex items-center space-x-2">
						<Clock className="h-5 w-5 text-yellow-600" />
						<div>
							<div className="font-bold text-2xl text-yellow-600">
								{audits.filter((a) => a.status === "in_progress").length}
							</div>
							<div className="text-sm text-yellow-600">Em Progresso</div>
						</div>
					</div>
				</div>
				<div className="rounded-lg bg-red-50 p-4">
					<div className="flex items-center space-x-2">
						<AlertTriangle className="h-5 w-5 text-red-600" />
						<div>
							<div className="font-bold text-2xl text-red-600">
								{audits.reduce(
									(acc, audit) => acc + (audit.critical_issues || 0),
									0,
								)}
							</div>
							<div className="text-red-600 text-sm">Issues Críticos</div>
						</div>
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="flex flex-wrap gap-2">
				<Button
					onClick={() => handleStartAudit("lgpd")}
					size="sm"
					variant="outline"
				>
					<Shield className="mr-2 h-4 w-4" />
					Auditoria LGPD
				</Button>
				<Button
					onClick={() => handleStartAudit("anvisa")}
					size="sm"
					variant="outline"
				>
					<Shield className="mr-2 h-4 w-4" />
					Auditoria ANVISA
				</Button>
				<Button
					onClick={() => handleStartAudit("cfm")}
					size="sm"
					variant="outline"
				>
					<Shield className="mr-2 h-4 w-4" />
					Auditoria CFM
				</Button>
				<Button
					onClick={() => handleStartAudit("comprehensive")}
					size="sm"
					variant="outline"
				>
					<Shield className="mr-2 h-4 w-4" />
					Auditoria Completa
				</Button>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="flex-1">
					<Label htmlFor="search">Buscar auditorias</Label>
					<div className="relative">
						<Search className="-translate-y-1/2 absolute top-1/2 left-2 h-4 w-4 transform text-muted-foreground" />
						<Input
							className="pl-8"
							id="search"
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder="Buscar por nome, descrição ou tipo..."
							value={searchTerm}
						/>
					</div>
				</div>
				<div className="min-w-[140px]">
					<Label htmlFor="type-filter">Tipo</Label>
					<Select onValueChange={setTypeFilter} value={typeFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Todos" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="lgpd">LGPD</SelectItem>
							<SelectItem value="anvisa">ANVISA</SelectItem>
							<SelectItem value="cfm">CFM</SelectItem>
							<SelectItem value="iso27001">ISO 27001</SelectItem>
							<SelectItem value="comprehensive">Completa</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="min-w-[140px]">
					<Label htmlFor="status-filter">Status</Label>
					<Select onValueChange={setStatusFilter} value={statusFilter}>
						<SelectTrigger>
							<SelectValue placeholder="Todos" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos</SelectItem>
							<SelectItem value="pending">Pendente</SelectItem>
							<SelectItem value="in_progress">Em Progresso</SelectItem>
							<SelectItem value="completed">Concluída</SelectItem>
							<SelectItem value="failed">Falhada</SelectItem>
							<SelectItem value="cancelled">Cancelada</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-end">
					<Button onClick={fetchAudits} size="sm" variant="outline">
						<RefreshCw className="mr-2 h-4 w-4" />
						Atualizar
					</Button>
				</div>
			</div>

			{/* Audits Table */}
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Auditoria</TableHead>
							<TableHead>Tipo</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Pontuação</TableHead>
							<TableHead>Verificações</TableHead>
							<TableHead>Issues</TableHead>
							<TableHead>Data</TableHead>
							<TableHead className="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredAudits.length === 0 ? (
							<TableRow>
								<TableCell
									className="py-8 text-center text-muted-foreground"
									colSpan={8}
								>
									Nenhuma auditoria de compliance encontrada
								</TableCell>
							</TableRow>
						) : (
							filteredAudits.map((audit) => (
								<TableRow key={audit.id}>
									<TableCell>
										<div>
											<div className="font-medium">{audit.audit_name}</div>
											{audit.description && (
												<div className="text-muted-foreground text-sm">
													{audit.description.length > 50
														? `${audit.description.substring(0, 50)}...`
														: audit.description}
												</div>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getTypeIcon(audit.audit_type)}
											<Badge variant="outline">
												{audit.audit_type.toUpperCase()}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											{getStatusIcon(audit.status)}
											<Badge variant={getStatusColor(audit.status)}>
												{audit.status === "pending" && "Pendente"}
												{audit.status === "in_progress" && "Em Progresso"}
												{audit.status === "completed" && "Concluída"}
												{audit.status === "failed" && "Falhada"}
												{audit.status === "cancelled" && "Cancelada"}
											</Badge>
										</div>
									</TableCell>
									<TableCell>
										{audit.compliance_score !== undefined ? (
											<div className="flex items-center space-x-2">
												<div className="w-16">
													<Progress
														className="h-2"
														value={audit.compliance_score}
													/>
												</div>
												<span
													className={`font-medium text-sm ${getComplianceScoreColor(
														audit.compliance_score,
													)}`}
												>
													{audit.compliance_score}%
												</span>
											</div>
										) : (
											<span className="text-muted-foreground">N/A</span>
										)}
									</TableCell>
									<TableCell>
										<div className="text-sm">
											<div className="flex items-center space-x-1">
												<CheckCircle2 className="h-3 w-3 text-green-500" />
												<span>{audit.passed_checks}</span>
												<XCircle className="h-3 w-3 text-red-500" />
												<span>{audit.failed_checks}</span>
												<AlertTriangle className="h-3 w-3 text-yellow-500" />
												<span>{audit.warning_checks}</span>
											</div>
											<div className="text-muted-foreground text-xs">
												Total: {audit.total_checks}
											</div>
										</div>
									</TableCell>
									<TableCell>
										<div className="flex space-x-1">
											{audit.critical_issues > 0 && (
												<Badge className="text-xs" variant="destructive">
													{audit.critical_issues} críticos
												</Badge>
											)}
											{audit.high_issues > 0 && (
												<Badge className="text-xs" variant="secondary">
													{audit.high_issues} altos
												</Badge>
											)}
										</div>
									</TableCell>
									<TableCell>
										<div className="text-sm">
											{audit.completed_at
												? format(new Date(audit.completed_at), "dd/MM/yyyy", {
														locale: ptBR,
													})
												: audit.started_at
													? format(new Date(audit.started_at), "dd/MM/yyyy", {
															locale: ptBR,
														})
													: format(new Date(audit.created_at), "dd/MM/yyyy", {
															locale: ptBR,
														})}
										</div>
									</TableCell>
									<TableCell className="text-right">
										<div className="flex items-center justify-end space-x-2">
											<Dialog>
												<DialogTrigger asChild>
													<Button
														onClick={() => setSelectedAudit(audit)}
														size="sm"
														variant="ghost"
													>
														<Eye className="h-4 w-4" />
													</Button>
												</DialogTrigger>
												<DialogContent className="max-w-4xl">
													<DialogHeader>
														<DialogTitle className="flex items-center space-x-2">
															{getTypeIcon(audit.audit_type)}
															<span>{audit.audit_name}</span>
															<Badge variant={getStatusColor(audit.status)}>
																{audit.status === "pending" && "Pendente"}
																{audit.status === "in_progress" &&
																	"Em Progresso"}
																{audit.status === "completed" && "Concluída"}
																{audit.status === "failed" && "Falhada"}
																{audit.status === "cancelled" && "Cancelada"}
															</Badge>
														</DialogTitle>
														<DialogDescription>
															Detalhes da auditoria de compliance #{audit.id}
														</DialogDescription>
													</DialogHeader>
													{selectedAudit && (
														<div className="space-y-4">
															<div className="grid grid-cols-2 gap-4">
																<div>
																	<Label>Tipo de Auditoria</Label>
																	<div className="mt-1">
																		<Badge variant="outline">
																			{selectedAudit.audit_type.toUpperCase()}
																		</Badge>
																	</div>
																</div>
																<div>
																	<Label>Status</Label>
																	<div className="mt-1 flex items-center space-x-2">
																		{getStatusIcon(selectedAudit.status)}
																		<Badge
																			variant={getStatusColor(
																				selectedAudit.status,
																			)}
																		>
																			{selectedAudit.status === "pending" &&
																				"Pendente"}
																			{selectedAudit.status === "in_progress" &&
																				"Em Progresso"}
																			{selectedAudit.status === "completed" &&
																				"Concluída"}
																			{selectedAudit.status === "failed" &&
																				"Falhada"}
																			{selectedAudit.status === "cancelled" &&
																				"Cancelada"}
																		</Badge>
																	</div>
																</div>
																{selectedAudit.compliance_score !==
																	undefined && (
																	<div>
																		<Label>Pontuação de Compliance</Label>
																		<div className="mt-1 flex items-center space-x-2">
																			<div className="w-24">
																				<Progress
																					className="h-2"
																					value={selectedAudit.compliance_score}
																				/>
																			</div>
																			<span
																				className={`font-medium text-sm ${getComplianceScoreColor(
																					selectedAudit.compliance_score,
																				)}`}
																			>
																				{selectedAudit.compliance_score}%
																			</span>
																		</div>
																	</div>
																)}
																<div>
																	<Label>Total de Verificações</Label>
																	<div className="mt-1 text-sm">
																		{selectedAudit.total_checks}
																	</div>
																</div>
																<div>
																	<Label>Verificações Aprovadas</Label>
																	<div className="mt-1 flex items-center space-x-1">
																		<CheckCircle2 className="h-4 w-4 text-green-500" />
																		<span>{selectedAudit.passed_checks}</span>
																	</div>
																</div>
																<div>
																	<Label>Verificações Falhadas</Label>
																	<div className="mt-1 flex items-center space-x-1">
																		<XCircle className="h-4 w-4 text-red-500" />
																		<span>{selectedAudit.failed_checks}</span>
																	</div>
																</div>
																<div>
																	<Label>Avisos</Label>
																	<div className="mt-1 flex items-center space-x-1">
																		<AlertTriangle className="h-4 w-4 text-yellow-500" />
																		<span>{selectedAudit.warning_checks}</span>
																	</div>
																</div>
																{selectedAudit.started_at && (
																	<div>
																		<Label>Iniciada em</Label>
																		<div className="mt-1 text-sm">
																			{format(
																				new Date(selectedAudit.started_at),
																				"dd/MM/yyyy HH:mm:ss",
																				{
																					locale: ptBR,
																				},
																			)}
																		</div>
																	</div>
																)}
																{selectedAudit.completed_at && (
																	<div>
																		<Label>Concluída em</Label>
																		<div className="mt-1 text-sm">
																			{format(
																				new Date(selectedAudit.completed_at),
																				"dd/MM/yyyy HH:mm:ss",
																				{
																					locale: ptBR,
																				},
																			)}
																		</div>
																	</div>
																)}
															</div>

															{selectedAudit.description && (
																<div>
																	<Label>Descrição</Label>
																	<div className="mt-1 rounded bg-muted p-3 text-sm">
																		{selectedAudit.description}
																	</div>
																</div>
															)}

															{/* Issues Summary */}
															<div className="grid grid-cols-4 gap-4">
																<div className="rounded-lg bg-red-50 p-3">
																	<div className="font-semibold text-red-600">
																		{selectedAudit.critical_issues}
																	</div>
																	<div className="text-red-600 text-sm">
																		Issues Críticos
																	</div>
																</div>
																<div className="rounded-lg bg-orange-50 p-3">
																	<div className="font-semibold text-orange-600">
																		{selectedAudit.high_issues}
																	</div>
																	<div className="text-orange-600 text-sm">
																		Issues Altos
																	</div>
																</div>
																<div className="rounded-lg bg-yellow-50 p-3">
																	<div className="font-semibold text-yellow-600">
																		{selectedAudit.medium_issues}
																	</div>
																	<div className="text-sm text-yellow-600">
																		Issues Médios
																	</div>
																</div>
																<div className="rounded-lg bg-blue-50 p-3">
																	<div className="font-semibold text-blue-600">
																		{selectedAudit.low_issues}
																	</div>
																	<div className="text-blue-600 text-sm">
																		Issues Baixos
																	</div>
																</div>
															</div>

															{selectedAudit.findings &&
																selectedAudit.findings.length > 0 && (
																	<div>
																		<Label>Achados da Auditoria</Label>
																		<div className="mt-1 max-h-60 space-y-3 overflow-auto">
																			{selectedAudit.findings
																				.slice(0, 5)
																				.map((finding, index) => (
																					<div
																						className="rounded border p-3"
																						key={index}
																					>
																						<div className="mb-2 flex items-center justify-between">
																							<Badge variant="outline">
																								{finding.category}
																							</Badge>
																							<Badge
																								variant={
																									finding.severity ===
																									"critical"
																										? "destructive"
																										: finding.severity ===
																												"high"
																											? "destructive"
																											: finding.severity ===
																													"medium"
																												? "secondary"
																												: "outline"
																								}
																							>
																								{finding.severity.toUpperCase()}
																							</Badge>
																						</div>
																						<div className="text-sm">
																							<div className="mb-1 font-medium">
																								{finding.issue}
																							</div>
																							<div className="text-muted-foreground">
																								{finding.recommendation}
																							</div>
																						</div>
																					</div>
																				))}
																			{selectedAudit.findings.length > 5 && (
																				<div className="text-center text-muted-foreground text-sm">
																					E mais{" "}
																					{selectedAudit.findings.length - 5}{" "}
																					achados...
																				</div>
																			)}
																		</div>
																	</div>
																)}

															{selectedAudit.recommendations &&
																selectedAudit.recommendations.length > 0 && (
																	<div>
																		<Label>Recomendações</Label>
																		<div className="mt-1 space-y-2">
																			{selectedAudit.recommendations
																				.slice(0, 5)
																				.map((recommendation, index) => (
																					<div
																						className="rounded bg-muted p-2 text-sm"
																						key={index}
																					>
																						{recommendation}
																					</div>
																				))}
																		</div>
																	</div>
																)}

															{selectedAudit.next_audit_date && (
																<div>
																	<Label>Próxima Auditoria</Label>
																	<div className="mt-1 text-sm">
																		{format(
																			new Date(selectedAudit.next_audit_date),
																			"dd/MM/yyyy",
																			{
																				locale: ptBR,
																			},
																		)}
																	</div>
																</div>
															)}
														</div>
													)}
												</DialogContent>
											</Dialog>

											{audit.status === "completed" && (
												<Button
													onClick={() => handleDownloadReport(audit.id)}
													size="sm"
													variant="outline"
												>
													<Download className="h-4 w-4" />
												</Button>
											)}
										</div>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Summary */}
			<div className="text-muted-foreground text-sm">
				Mostrando {filteredAudits.length} de {audits.length} auditorias de
				compliance
			</div>
		</div>
	);
}
