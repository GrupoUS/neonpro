"use client";

import {
	AlertTriangle,
	Archive,
	Bell,
	CheckCircle,
	Clock,
	Download,
	Edit,
	Eye,
	FileCheck,
	FileText,
	Plus,
	Search,
	Settings,
	Shield,
	Trash2,
	UserCheck,
	Users,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Types for consent management
type ConsentRecord = {
	id: string;
	patientId: string;
	patientName: string;
	consentType:
		| "medical_procedure"
		| "photography"
		| "data_processing"
		| "marketing"
		| "research"
		| "telemedicine"
		| "minor_guardian";
	status: "active" | "withdrawn" | "expired" | "pending" | "rejected";
	grantedDate: string;
	expiryDate: string;
	withdrawnDate?: string;
	legalBasis:
		| "consent"
		| "legal_obligation"
		| "vital_interests"
		| "public_interest"
		| "legitimate_interest";
	purpose: string;
	description: string;
	version: string;
	digitalSignature?: string;
	witnessSignature?: string;
	ipAddress?: string;
	userAgent?: string;
	isMinor: boolean;
	guardianInfo?: {
		name: string;
		relationship: string;
		signature: string;
	};
};

type PatientRightsRequest = {
	id: string;
	patientId: string;
	patientName: string;
	requestType:
		| "access"
		| "rectification"
		| "erasure"
		| "portability"
		| "restriction"
		| "objection";
	status: "pending" | "in_progress" | "completed" | "rejected";
	submittedDate: string;
	description: string;
	response?: string;
	completedDate?: string;
	legalDeadline: string;
};

type AuditTrailEntry = {
	id: string;
	timestamp: string;
	action:
		| "consent_granted"
		| "consent_withdrawn"
		| "consent_modified"
		| "rights_request"
		| "data_accessed"
		| "data_exported";
	userId: string;
	userName: string;
	patientId: string;
	patientName: string;
	details: string;
	ipAddress: string;
	userAgent: string;
	legalBasis: string;
	dataCategories: string[];
};

// Mock data for consent management
const mockConsentRecords: ConsentRecord[] = [
	{
		id: "consent-001",
		patientId: "patient-001",
		patientName: "Maria Silva Santos",
		consentType: "medical_procedure",
		status: "active",
		grantedDate: "2024-01-15T10:00:00Z",
		expiryDate: "2025-01-15T10:00:00Z",
		legalBasis: "consent",
		purpose: "Realização de procedimento estético de preenchimento facial",
		description:
			"Consentimento para procedimento de preenchimento facial com ácido hialurônico",
		version: "2.1",
		digitalSignature: "SHA256:a1b2c3d4...",
		ipAddress: "192.168.1.100",
		userAgent: "Mozilla/5.0...",
		isMinor: false,
	},
	{
		id: "consent-002",
		patientId: "patient-002",
		patientName: "Ana Beatriz Costa",
		consentType: "photography",
		status: "active",
		grantedDate: "2024-01-20T14:30:00Z",
		expiryDate: "2025-01-20T14:30:00Z",
		legalBasis: "consent",
		purpose: "Documentação fotográfica para fins clínicos e educacionais",
		description:
			"Autorização para captação e uso de imagens antes/depois do tratamento",
		version: "1.8",
		digitalSignature: "SHA256:e5f6g7h8...",
		isMinor: false,
	},
	{
		id: "consent-003",
		patientId: "patient-003",
		patientName: "João Pedro Oliveira",
		consentType: "minor_guardian",
		status: "active",
		grantedDate: "2024-02-01T09:15:00Z",
		expiryDate: "2026-02-01T09:15:00Z",
		legalBasis: "consent",
		purpose: "Tratamento dermatológico para menor de idade",
		description: "Consentimento do responsável legal para tratamento de acne",
		version: "3.0",
		isMinor: true,
		guardianInfo: {
			name: "Carlos Oliveira",
			relationship: "Pai",
			signature: "SHA256:i9j0k1l2...",
		},
	},
	{
		id: "consent-004",
		patientId: "patient-004",
		patientName: "Beatriz Ferreira Lima",
		consentType: "data_processing",
		status: "expired",
		grantedDate: "2023-01-10T11:00:00Z",
		expiryDate: "2024-01-10T11:00:00Z",
		legalBasis: "consent",
		purpose: "Processamento de dados pessoais para fins de tratamento",
		description: "Consentimento LGPD para processamento de dados de saúde",
		version: "1.5",
		isMinor: false,
	},
	{
		id: "consent-005",
		patientId: "patient-005",
		patientName: "Roberto Santos Silva",
		consentType: "marketing",
		status: "withdrawn",
		grantedDate: "2024-01-05T16:20:00Z",
		expiryDate: "2025-01-05T16:20:00Z",
		withdrawnDate: "2024-02-15T10:30:00Z",
		legalBasis: "consent",
		purpose: "Comunicações de marketing e promoções",
		description: "Autorização para envio de materiais promocionais",
		version: "1.2",
		isMinor: false,
	},
];

const mockRightsRequests: PatientRightsRequest[] = [
	{
		id: "request-001",
		patientId: "patient-006",
		patientName: "Carla Mendes Rodrigues",
		requestType: "access",
		status: "pending",
		submittedDate: "2024-02-20T14:00:00Z",
		legalDeadline: "2024-03-05T23:59:59Z",
		description:
			"Solicitação de acesso a todos os dados pessoais processados pela clínica",
	},
	{
		id: "request-002",
		patientId: "patient-007",
		patientName: "Felipe Souza Lima",
		requestType: "erasure",
		status: "in_progress",
		submittedDate: "2024-02-18T10:30:00Z",
		legalDeadline: "2024-03-03T23:59:59Z",
		description:
			"Solicitação de exclusão de todos os dados pessoais após encerramento do tratamento",
		response: "Análise em andamento. Verificando dependências legais.",
	},
	{
		id: "request-003",
		patientId: "patient-008",
		patientName: "Juliana Costa Alves",
		requestType: "portability",
		status: "completed",
		submittedDate: "2024-02-10T16:45:00Z",
		legalDeadline: "2024-02-25T23:59:59Z",
		completedDate: "2024-02-22T11:20:00Z",
		description: "Solicitação de portabilidade de dados para nova clínica",
		response:
			"Dados exportados e enviados conforme solicitado. Processo concluído.",
	},
];

const mockAuditTrail: AuditTrailEntry[] = [
	{
		id: "audit-001",
		timestamp: "2024-02-22T15:30:00Z",
		action: "consent_granted",
		userId: "user-001",
		userName: "Dr. Maria Santos",
		patientId: "patient-009",
		patientName: "Lucas Andrade Silva",
		details: "Consentimento para procedimento de botox concedido",
		ipAddress: "192.168.1.105",
		userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
		legalBasis: "consent",
		dataCategories: ["dados_saude", "dados_pessoais"],
	},
	{
		id: "audit-002",
		timestamp: "2024-02-22T14:15:00Z",
		action: "consent_withdrawn",
		userId: "patient-005",
		userName: "Roberto Santos Silva",
		patientId: "patient-005",
		patientName: "Roberto Santos Silva",
		details: "Consentimento de marketing retirado pelo próprio paciente",
		ipAddress: "201.45.67.89",
		userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X)",
		legalBasis: "consent",
		dataCategories: ["dados_marketing"],
	},
	{
		id: "audit-003",
		timestamp: "2024-02-22T13:00:00Z",
		action: "rights_request",
		userId: "patient-006",
		userName: "Carla Mendes Rodrigues",
		patientId: "patient-006",
		patientName: "Carla Mendes Rodrigues",
		details: "Solicitação de acesso aos dados pessoais submetida",
		ipAddress: "179.123.45.67",
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
		legalBasis: "legitimate_interest",
		dataCategories: ["dados_pessoais", "dados_saude"],
	},
];

export default function ConsentManagementPage() {
	const [activeTab, setActiveTab] = useState("dashboard");
	const [searchQuery, setSearchQuery] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [filterType, setFilterType] = useState("all");
	const [selectedConsent, setSelectedConsent] = useState<ConsentRecord | null>(
		null,
	);
	const [_isLoading, _setIsLoading] = useState(false);

	// Filter functions
	const filteredConsents = mockConsentRecords.filter((consent) => {
		const matchesSearch =
			consent.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			consent.purpose.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesStatus =
			filterStatus === "all" || consent.status === filterStatus;
		const matchesType =
			filterType === "all" || consent.consentType === filterType;
		return matchesSearch && matchesStatus && matchesType;
	});

	const filteredRightsRequests = mockRightsRequests.filter((request) => {
		const matchesSearch =
			request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			request.description.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	const filteredAuditTrail = mockAuditTrail.filter((entry) => {
		const matchesSearch =
			entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			entry.details.toLowerCase().includes(searchQuery.toLowerCase());
		return matchesSearch;
	});

	// Utility functions
	const getStatusBadgeVariant = (status: string) => {
		switch (status) {
			case "active":
				return "default";
			case "expired":
				return "secondary";
			case "withdrawn":
				return "destructive";
			case "pending":
				return "outline";
			case "rejected":
				return "destructive";
			case "in_progress":
				return "outline";
			case "completed":
				return "default";
			default:
				return "secondary";
		}
	};

	const getStatusLabel = (status: string) => {
		const labels = {
			active: "Ativo",
			expired: "Expirado",
			withdrawn: "Retirado",
			pending: "Pendente",
			rejected: "Rejeitado",
			in_progress: "Em Andamento",
			completed: "Concluído",
		};
		return labels[status as keyof typeof labels] || status;
	};

	const getConsentTypeLabel = (type: string) => {
		const labels = {
			medical_procedure: "Procedimento Médico",
			photography: "Documentação Fotográfica",
			data_processing: "Processamento de Dados",
			marketing: "Marketing",
			research: "Pesquisa",
			telemedicine: "Telemedicina",
			minor_guardian: "Responsável Legal",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const getRightsRequestTypeLabel = (type: string) => {
		const labels = {
			access: "Acesso aos Dados",
			rectification: "Retificação",
			erasure: "Exclusão",
			portability: "Portabilidade",
			restriction: "Restrição",
			objection: "Oposição",
		};
		return labels[type as keyof typeof labels] || type;
	};

	const calculateDaysToExpiry = (expiryDate: string) => {
		const expiry = new Date(expiryDate);
		const today = new Date();
		const diffTime = expiry.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays;
	};

	// Dashboard statistics
	const stats = {
		totalConsents: mockConsentRecords.length,
		activeConsents: mockConsentRecords.filter((c) => c.status === "active")
			.length,
		expiringSoon: mockConsentRecords.filter((c) => {
			const daysToExpiry = calculateDaysToExpiry(c.expiryDate);
			return c.status === "active" && daysToExpiry <= 30 && daysToExpiry > 0;
		}).length,
		pendingRequests: mockRightsRequests.filter((r) => r.status === "pending")
			.length,
		withdrawnConsents: mockConsentRecords.filter(
			(c) => c.status === "withdrawn",
		).length,
		expiredConsents: mockConsentRecords.filter((c) => c.status === "expired")
			.length,
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl">
				{/* Header */}
				<header className="mb-8">
					<div className="mb-4 flex items-center gap-3">
						<div
							aria-label="Ícone de gestão de consentimentos"
							className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white"
							role="img"
						>
							<FileCheck className="h-6 w-6" />
						</div>
						<div>
							<h1 className="font-bold text-3xl text-gray-900">
								Gestão de Consentimentos
							</h1>
							<p className="text-gray-600" id="page-description">
								Sistema completo de gestão de consentimentos LGPD e direitos dos
								pacientes
							</p>
						</div>
					</div>

					{/* Quick stats */}
					<section
						aria-labelledby="stats-heading"
						className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
					>
						<h2 className="sr-only" id="stats-heading">
							Estatísticas de Consentimentos
						</h2>
						<Card aria-labelledby="total-consents" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<FileCheck
										aria-hidden="true"
										className="h-4 w-4 text-blue-600"
									/>
									<span
										className="font-medium text-gray-600 text-sm"
										id="total-consents"
									>
										Total
									</span>
								</div>
								<p
									aria-describedby="total-consents"
									className="font-bold text-2xl text-gray-900"
								>
									{stats.totalConsents}
								</p>
							</CardContent>
						</Card>
						<Card aria-labelledby="active-consents" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<CheckCircle
										aria-hidden="true"
										className="h-4 w-4 text-green-600"
									/>
									<span
										className="font-medium text-gray-600 text-sm"
										id="active-consents"
									>
										Ativos
									</span>
								</div>
								<p
									aria-describedby="active-consents"
									className="font-bold text-2xl text-green-600"
								>
									{stats.activeConsents}
								</p>
							</CardContent>
						</Card>
						<Card aria-labelledby="expiring-consents" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<Clock
										aria-hidden="true"
										className="h-4 w-4 text-orange-600"
									/>
									<span
										className="font-medium text-gray-600 text-sm"
										id="expiring-consents"
									>
										Expirando
									</span>
								</div>
								<p
									aria-describedby="expiring-consents"
									className="font-bold text-2xl text-orange-600"
								>
									{stats.expiringSoon}
								</p>
							</CardContent>
						</Card>
						<Card aria-labelledby="pending-requests" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<Bell aria-hidden="true" className="h-4 w-4 text-blue-600" />
									<span
										className="font-medium text-gray-600 text-sm"
										id="pending-requests"
									>
										Pendentes
									</span>
								</div>
								<p
									aria-describedby="pending-requests"
									className="font-bold text-2xl text-blue-600"
								>
									{stats.pendingRequests}
								</p>
							</CardContent>
						</Card>
						<Card aria-labelledby="withdrawn-consents" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<XCircle
										aria-hidden="true"
										className="h-4 w-4 text-red-600"
									/>
									<span
										className="font-medium text-gray-600 text-sm"
										id="withdrawn-consents"
									>
										Retirados
									</span>
								</div>
								<p
									aria-describedby="withdrawn-consents"
									className="font-bold text-2xl text-red-600"
								>
									{stats.withdrawnConsents}
								</p>
							</CardContent>
						</Card>
						<Card aria-labelledby="expired-consents" role="article">
							<CardContent className="p-4">
								<div className="flex items-center gap-2">
									<AlertTriangle
										aria-hidden="true"
										className="h-4 w-4 text-gray-600"
									/>
									<span
										className="font-medium text-gray-600 text-sm"
										id="expired-consents"
									>
										Expirados
									</span>
								</div>
								<p
									aria-describedby="expired-consents"
									className="font-bold text-2xl text-gray-600"
								>
									{stats.expiredConsents}
								</p>
							</CardContent>
						</Card>
					</section>
				</header>

				{/* Main Content */}
				<main aria-describedby="page-description">
					<Tabs
						aria-label="Seções do sistema de consentimentos"
						className="space-y-6"
						onValueChange={setActiveTab}
						value={activeTab}
					>
						<TabsList
							aria-label="Navegação principal do sistema de consentimentos"
							className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-5"
							role="tablist"
						>
							<TabsTrigger
								aria-controls="dashboard-panel"
								aria-selected={activeTab === "dashboard"}
								className="flex items-center gap-2"
								role="tab"
								value="dashboard"
							>
								<Shield aria-hidden="true" className="h-4 w-4" />
								<span className="hidden sm:inline">Dashboard</span>
								<span className="sr-only sm:hidden">Painel de controle</span>
							</TabsTrigger>
							<TabsTrigger
								aria-controls="forms-panel"
								aria-selected={activeTab === "forms"}
								className="flex items-center gap-2"
								role="tab"
								value="forms"
							>
								<FileText aria-hidden="true" className="h-4 w-4" />
								<span className="hidden sm:inline">Formulários</span>
								<span className="sr-only sm:hidden">
									Formulários de consentimento
								</span>
							</TabsTrigger>
							<TabsTrigger
								aria-controls="rights-panel"
								aria-selected={activeTab === "rights"}
								className="flex items-center gap-2"
								role="tab"
								value="rights"
							>
								<Users aria-hidden="true" className="h-4 w-4" />
								<span className="hidden sm:inline">Direitos</span>
								<span className="sr-only sm:hidden">
									Direitos dos pacientes
								</span>
							</TabsTrigger>
							<TabsTrigger
								aria-controls="audit-panel"
								aria-selected={activeTab === "audit"}
								className="flex items-center gap-2"
								role="tab"
								value="audit"
							>
								<Eye aria-hidden="true" className="h-4 w-4" />
								<span className="hidden sm:inline">Auditoria</span>
								<span className="sr-only sm:hidden">Trilha de auditoria</span>
							</TabsTrigger>
							<TabsTrigger
								aria-controls="admin-panel"
								aria-selected={activeTab === "admin"}
								className="flex items-center gap-2"
								role="tab"
								value="admin"
							>
								<Settings aria-hidden="true" className="h-4 w-4" />
								<span className="hidden sm:inline">Admin</span>
								<span className="sr-only sm:hidden">Administração</span>
							</TabsTrigger>
						</TabsList>

						{/* Dashboard Tab */}
						<TabsContent
							aria-labelledby="dashboard-tab"
							className="space-y-6"
							id="dashboard-panel"
							role="tabpanel"
							value="dashboard"
						>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								{/* Active Consents */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<CheckCircle className="h-5 w-5 text-green-600" />
											Consentimentos Ativos
										</CardTitle>
										<CardDescription>
											Consentimentos atualmente válidos e em vigor
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{mockConsentRecords
												.filter((c) => c.status === "active")
												.slice(0, 5)
												.map((consent) => (
													<div
														className="flex items-center justify-between rounded-lg bg-green-50 p-3"
														key={consent.id}
													>
														<div className="flex-1">
															<p className="font-medium text-gray-900">
																{consent.patientName}
															</p>
															<p className="text-gray-600 text-sm">
																{getConsentTypeLabel(consent.consentType)}
															</p>
														</div>
														<div className="text-right">
															<Badge
																className="bg-green-100 text-green-800"
																variant="default"
															>
																{calculateDaysToExpiry(consent.expiryDate)} dias
															</Badge>
														</div>
													</div>
												))}
										</div>
									</CardContent>
								</Card>

								{/* Expiring Soon */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Clock className="h-5 w-5 text-orange-600" />
											Expirando em Breve
										</CardTitle>
										<CardDescription>
											Consentimentos que expiram nos próximos 30 dias
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											{mockConsentRecords
												.filter((c) => {
													const daysToExpiry = calculateDaysToExpiry(
														c.expiryDate,
													);
													return (
														c.status === "active" &&
														daysToExpiry <= 30 &&
														daysToExpiry > 0
													);
												})
												.slice(0, 5)
												.map((consent) => {
													const daysToExpiry = calculateDaysToExpiry(
														consent.expiryDate,
													);
													return (
														<div
															className="flex items-center justify-between rounded-lg bg-orange-50 p-3"
															key={consent.id}
														>
															<div className="flex-1">
																<p className="font-medium text-gray-900">
																	{consent.patientName}
																</p>
																<p className="text-gray-600 text-sm">
																	{getConsentTypeLabel(consent.consentType)}
																</p>
															</div>
															<div className="text-right">
																<Badge
																	className="border-orange-200 text-orange-800"
																	variant="outline"
																>
																	{daysToExpiry} dias
																</Badge>
															</div>
														</div>
													);
												})}
											{stats.expiringSoon === 0 && (
												<p className="py-4 text-center text-gray-500">
													Nenhum consentimento expirando em breve
												</p>
											)}
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Recent Activities */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Eye className="h-5 w-5 text-blue-600" />
										Atividades Recentes
									</CardTitle>
									<CardDescription>
										Últimas ações relacionadas a consentimentos e direitos
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{mockAuditTrail.slice(0, 5).map((entry) => (
											<div
												className="flex items-start gap-4 rounded-lg bg-gray-50 p-4"
												key={entry.id}
											>
												<div className="flex-shrink-0">
													{entry.action === "consent_granted" && (
														<CheckCircle className="h-5 w-5 text-green-600" />
													)}
													{entry.action === "consent_withdrawn" && (
														<XCircle className="h-5 w-5 text-red-600" />
													)}
													{entry.action === "rights_request" && (
														<Users className="h-5 w-5 text-blue-600" />
													)}
												</div>
												<div className="flex-1">
													<p className="font-medium text-gray-900">
														{entry.details}
													</p>
													<p className="text-gray-600 text-sm">
														{entry.patientName} •{" "}
														{new Date(entry.timestamp).toLocaleString("pt-BR")}
													</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Forms Tab */}
						<TabsContent
							aria-labelledby="forms-tab"
							className="space-y-6"
							id="forms-panel"
							role="tabpanel"
							value="forms"
						>
							{/* Search and Filters */}
							<Card>
								<CardContent className="p-4">
									<form aria-label="Filtros de consentimentos" role="search">
										<div className="flex flex-col gap-4 sm:flex-row">
											<div className="flex-1">
												<Label className="sr-only" htmlFor="consent-search">
													Buscar consentimentos
												</Label>
												<div className="relative">
													<Search
														aria-hidden="true"
														className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400"
													/>
													<Input
														aria-describedby="search-help"
														className="pl-10"
														id="consent-search"
														onChange={(e) => setSearchQuery(e.target.value)}
														placeholder="Buscar por paciente ou procedimento..."
														value={searchQuery}
													/>
													<div className="sr-only" id="search-help">
														Digite o nome do paciente ou descrição do
														procedimento para filtrar os consentimentos
													</div>
												</div>
											</div>
											<div>
												<Label className="sr-only" htmlFor="status-filter">
													Filtrar por status
												</Label>
												<Select
													onValueChange={setFilterStatus}
													value={filterStatus}
												>
													<SelectTrigger
														aria-label="Filtrar consentimentos por status"
														className="w-full sm:w-48"
														id="status-filter"
													>
														<SelectValue placeholder="Status" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">Todos os Status</SelectItem>
														<SelectItem value="active">Ativo</SelectItem>
														<SelectItem value="expired">Expirado</SelectItem>
														<SelectItem value="withdrawn">Retirado</SelectItem>
														<SelectItem value="pending">Pendente</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<div>
												<Label className="sr-only" htmlFor="type-filter">
													Filtrar por tipo
												</Label>
												<Select
													onValueChange={setFilterType}
													value={filterType}
												>
													<SelectTrigger
														aria-label="Filtrar consentimentos por tipo"
														className="w-full sm:w-48"
														id="type-filter"
													>
														<SelectValue placeholder="Tipo" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="all">Todos os Tipos</SelectItem>
														<SelectItem value="medical_procedure">
															Procedimento Médico
														</SelectItem>
														<SelectItem value="photography">
															Documentação Fotográfica
														</SelectItem>
														<SelectItem value="data_processing">
															Processamento de Dados
														</SelectItem>
														<SelectItem value="marketing">Marketing</SelectItem>
														<SelectItem value="research">Pesquisa</SelectItem>
														<SelectItem value="telemedicine">
															Telemedicina
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
											<Button
												aria-label="Criar novo formulário de consentimento"
												className="whitespace-nowrap"
											>
												<Plus aria-hidden="true" className="mr-2 h-4 w-4" />
												Novo Consentimento
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							{/* Consents Table */}
							<Card>
								<CardHeader>
									<CardTitle>Consentimentos Registrados</CardTitle>
									<CardDescription>
										Lista completa de consentimentos com status e detalhes
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="rounded-md border">
										<Table
											aria-label="Tabela de consentimentos registrados"
											role="table"
										>
											<TableHeader>
												<TableRow role="row">
													<TableHead scope="col">Paciente</TableHead>
													<TableHead scope="col">Tipo</TableHead>
													<TableHead scope="col">Status</TableHead>
													<TableHead scope="col">Data Concessão</TableHead>
													<TableHead scope="col">Validade</TableHead>
													<TableHead scope="col">Ações</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody role="rowgroup">
												{filteredConsents.map((consent) => (
													<TableRow
														aria-describedby={`consent-${consent.id}-description`}
														key={consent.id}
														role="row"
													>
														<TableCell role="cell">
															<div>
																<p className="font-medium">
																	{consent.patientName}
																</p>
																<p
																	className="text-gray-600 text-sm"
																	id={`consent-${consent.id}-description`}
																>
																	{consent.purpose}
																</p>
															</div>
														</TableCell>
														<TableCell>
															<Badge variant="outline">
																{getConsentTypeLabel(consent.consentType)}
															</Badge>
														</TableCell>
														<TableCell>
															<Badge
																variant={getStatusBadgeVariant(consent.status)}
															>
																{getStatusLabel(consent.status)}
															</Badge>
														</TableCell>
														<TableCell>
															{new Date(consent.grantedDate).toLocaleDateString(
																"pt-BR",
															)}
														</TableCell>
														<TableCell>
															<div>
																<p>
																	{new Date(
																		consent.expiryDate,
																	).toLocaleDateString("pt-BR")}
																</p>
																{consent.status === "active" && (
																	<p className="text-gray-600 text-sm">
																		{calculateDaysToExpiry(consent.expiryDate)}{" "}
																		dias restantes
																	</p>
																)}
															</div>
														</TableCell>
														<TableCell role="cell">
															<div
																aria-label="Ações do consentimento"
																className="flex items-center gap-2"
																role="group"
															>
																<Button
																	aria-label={`Visualizar detalhes do consentimento de ${consent.patientName}`}
																	onClick={() => setSelectedConsent(consent)}
																	size="sm"
																	variant="ghost"
																>
																	<Eye aria-hidden="true" className="h-4 w-4" />
																	<span className="sr-only">Visualizar</span>
																</Button>
																<Button
																	aria-label={`Baixar PDF do consentimento de ${consent.patientName}`}
																	size="sm"
																	variant="ghost"
																>
																	<Download
																		aria-hidden="true"
																		className="h-4 w-4"
																	/>
																	<span className="sr-only">Baixar PDF</span>
																</Button>
																{consent.status === "active" && (
																	<Button
																		aria-label={`Editar consentimento de ${consent.patientName}`}
																		size="sm"
																		variant="ghost"
																	>
																		<Edit
																			aria-hidden="true"
																			className="h-4 w-4"
																		/>
																		<span className="sr-only">Editar</span>
																	</Button>
																)}
															</div>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Rights Tab */}
						<TabsContent
							aria-labelledby="rights-tab"
							className="space-y-6"
							id="rights-panel"
							role="tabpanel"
							value="rights"
						>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
								{/* Quick Actions */}
								<div className="lg:col-span-1">
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center gap-2">
												<UserCheck className="h-5 w-5" />
												Direitos LGPD
											</CardTitle>
											<CardDescription>
												Ações rápidas para direitos dos titulares
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-3">
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<Eye className="mr-2 h-4 w-4" />
												Solicitar Acesso aos Dados
											</Button>
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<Edit className="mr-2 h-4 w-4" />
												Solicitar Retificação
											</Button>
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<Trash2 className="mr-2 h-4 w-4" />
												Solicitar Exclusão
											</Button>
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<Download className="mr-2 h-4 w-4" />
												Solicitar Portabilidade
											</Button>
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<Archive className="mr-2 h-4 w-4" />
												Solicitar Restrição
											</Button>
											<Button
												className="w-full justify-start"
												variant="outline"
											>
												<XCircle className="mr-2 h-4 w-4" />
												Solicitar Oposição
											</Button>
										</CardContent>
									</Card>
								</div>

								{/* Rights Requests */}
								<div className="lg:col-span-2">
									<Card>
										<CardHeader>
											<CardTitle>Solicitações de Direitos</CardTitle>
											<CardDescription>
												Histórico de solicitações dos titulares de dados
											</CardDescription>
										</CardHeader>
										<CardContent>
											<div className="space-y-4">
												{filteredRightsRequests.map((request) => (
													<div
														className="rounded-lg border p-4"
														key={request.id}
													>
														<div className="mb-3 flex items-start justify-between">
															<div className="flex-1">
																<h4 className="font-medium text-gray-900">
																	{request.patientName}
																</h4>
																<p className="text-gray-600 text-sm">
																	{getRightsRequestTypeLabel(
																		request.requestType,
																	)}
																</p>
															</div>
															<Badge
																variant={getStatusBadgeVariant(request.status)}
															>
																{getStatusLabel(request.status)}
															</Badge>
														</div>
														<p className="mb-3 text-gray-700 text-sm">
															{request.description}
														</p>
														<div className="flex items-center justify-between text-gray-600 text-sm">
															<span>
																Submetido:{" "}
																{new Date(
																	request.submittedDate,
																).toLocaleDateString("pt-BR")}
															</span>
															<span>
																Prazo:{" "}
																{new Date(
																	request.legalDeadline,
																).toLocaleDateString("pt-BR")}
															</span>
														</div>
														{request.response && (
															<div className="mt-3 rounded-lg bg-blue-50 p-3">
																<p className="text-blue-800 text-sm">
																	{request.response}
																</p>
															</div>
														)}
													</div>
												))}
											</div>
										</CardContent>
									</Card>
								</div>
							</div>
						</TabsContent>

						{/* Audit Tab */}
						<TabsContent
							aria-labelledby="audit-tab"
							className="space-y-6"
							id="audit-panel"
							role="tabpanel"
							value="audit"
						>
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Eye className="h-5 w-5" />
										Trilha de Auditoria
									</CardTitle>
									<CardDescription>
										Registro completo de todas as ações relacionadas a
										consentimentos
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{filteredAuditTrail.map((entry) => (
											<div className="rounded-lg border p-4" key={entry.id}>
												<div className="flex items-start gap-4">
													<div className="mt-1 flex-shrink-0">
														{entry.action === "consent_granted" && (
															<CheckCircle className="h-5 w-5 text-green-600" />
														)}
														{entry.action === "consent_withdrawn" && (
															<XCircle className="h-5 w-5 text-red-600" />
														)}
														{entry.action === "consent_modified" && (
															<Edit className="h-5 w-5 text-blue-600" />
														)}
														{entry.action === "rights_request" && (
															<Users className="h-5 w-5 text-purple-600" />
														)}
														{entry.action === "data_accessed" && (
															<Eye className="h-5 w-5 text-orange-600" />
														)}
														{entry.action === "data_exported" && (
															<Download className="h-5 w-5 text-gray-600" />
														)}
													</div>
													<div className="flex-1">
														<div className="mb-2 flex items-start justify-between">
															<h4 className="font-medium text-gray-900">
																{entry.details}
															</h4>
															<span className="text-gray-500 text-sm">
																{new Date(entry.timestamp).toLocaleString(
																	"pt-BR",
																)}
															</span>
														</div>
														<div className="grid grid-cols-1 gap-4 text-gray-600 text-sm md:grid-cols-2">
															<div>
																<p>
																	<strong>Usuário:</strong> {entry.userName}
																</p>
																<p>
																	<strong>Paciente:</strong> {entry.patientName}
																</p>
															</div>
															<div>
																<p>
																	<strong>IP:</strong> {entry.ipAddress}
																</p>
																<p>
																	<strong>Base Legal:</strong>{" "}
																	{entry.legalBasis}
																</p>
															</div>
														</div>
														{entry.dataCategories &&
															entry.dataCategories.length > 0 && (
																<div className="mt-2">
																	<p className="mb-1 text-gray-600 text-sm">
																		<strong>Categorias de Dados:</strong>
																	</p>
																	<div className="flex flex-wrap gap-1">
																		{entry.dataCategories.map((category) => (
																			<Badge
																				className="text-xs"
																				key={category}
																				variant="outline"
																			>
																				{category}
																			</Badge>
																		))}
																	</div>
																</div>
															)}
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						{/* Admin Tab */}
						<TabsContent
							aria-labelledby="admin-tab"
							className="space-y-6"
							id="admin-panel"
							role="tabpanel"
							value="admin"
						>
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								{/* Templates Management */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<FileText className="h-5 w-5" />
											Modelos de Consentimento
										</CardTitle>
										<CardDescription>
											Gerenciar templates de formulários de consentimento
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<p className="font-medium">
													Procedimento Estético v2.1
												</p>
												<p className="text-gray-600 text-sm">
													Última atualização: 15/01/2024
												</p>
											</div>
											<Button size="sm" variant="ghost">
												<Edit className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<p className="font-medium">
													Documentação Fotográfica v1.8
												</p>
												<p className="text-gray-600 text-sm">
													Última atualização: 10/01/2024
												</p>
											</div>
											<Button size="sm" variant="ghost">
												<Edit className="h-4 w-4" />
											</Button>
										</div>
										<div className="flex items-center justify-between rounded-lg border p-3">
											<div>
												<p className="font-medium">Processamento LGPD v1.5</p>
												<p className="text-gray-600 text-sm">
													Última atualização: 05/01/2024
												</p>
											</div>
											<Button size="sm" variant="ghost">
												<Edit className="h-4 w-4" />
											</Button>
										</div>
										<Button className="w-full" variant="outline">
											<Plus className="mr-2 h-4 w-4" />
											Novo Template
										</Button>
									</CardContent>
								</Card>

								{/* Compliance Monitoring */}
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Shield className="h-5 w-5" />
											Monitoramento de Compliance
										</CardTitle>
										<CardDescription>
											Status de conformidade LGPD e regulamentações
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">
													Consentimentos LGPD
												</span>
												<Badge
													className="bg-green-100 text-green-800"
													variant="default"
												>
													Conforme
												</Badge>
											</div>
											<Progress className="h-2" value={95} />
											<p className="text-gray-600 text-xs">
												95% dos consentimentos em conformidade
											</p>
										</div>

										<Separator />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">
													CFM 2.314/2022
												</span>
												<Badge
													className="bg-green-100 text-green-800"
													variant="default"
												>
													Conforme
												</Badge>
											</div>
											<Progress className="h-2" value={100} />
											<p className="text-gray-600 text-xs">
												Telemedicina em total conformidade
											</p>
										</div>

										<Separator />

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="font-medium text-sm">ANVISA</span>
												<Badge
													className="border-orange-200 text-orange-800"
													variant="outline"
												>
													Revisão
												</Badge>
											</div>
											<Progress className="h-2" value={85} />
											<p className="text-gray-600 text-xs">
												2 pontos requerem atenção
											</p>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* System Configuration */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Settings className="h-5 w-5" />
										Configurações do Sistema
									</CardTitle>
									<CardDescription>
										Configurações gerais do sistema de consentimentos
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
										<div className="space-y-4">
											<h4 className="font-medium">Notificações</h4>
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<Label htmlFor="expiry-notifications">
														Notificações de expiração
													</Label>
													<Checkbox defaultChecked id="expiry-notifications" />
												</div>
												<div className="flex items-center justify-between">
													<Label htmlFor="withdrawal-notifications">
														Notificações de retirada
													</Label>
													<Checkbox
														defaultChecked
														id="withdrawal-notifications"
													/>
												</div>
												<div className="flex items-center justify-between">
													<Label htmlFor="rights-notifications">
														Solicitações de direitos
													</Label>
													<Checkbox defaultChecked id="rights-notifications" />
												</div>
											</div>
										</div>

										<div className="space-y-4">
											<h4 className="font-medium">Retenção de Dados</h4>
											<div className="space-y-3">
												<div>
													<Label htmlFor="consent-retention">
														Período de retenção de consentimentos
													</Label>
													<Select defaultValue="5-years">
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="1-year">1 ano</SelectItem>
															<SelectItem value="3-years">3 anos</SelectItem>
															<SelectItem value="5-years">5 anos</SelectItem>
															<SelectItem value="permanent">
																Permanente
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div>
													<Label htmlFor="audit-retention">
														Período de retenção de auditoria
													</Label>
													<Select defaultValue="10-years">
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="5-years">5 anos</SelectItem>
															<SelectItem value="10-years">10 anos</SelectItem>
															<SelectItem value="permanent">
																Permanente
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>

					{/* Consent Details Modal */}
					<Dialog
						aria-describedby="consent-details-description"
						aria-labelledby="consent-details-title"
						onOpenChange={() => setSelectedConsent(null)}
						open={!!selectedConsent}
					>
						<DialogContent
							aria-modal="true"
							className="max-h-[90vh] max-w-4xl overflow-y-auto"
							role="dialog"
						>
							{selectedConsent && (
								<>
									<DialogHeader>
										<DialogTitle
											className="flex items-center gap-2"
											id="consent-details-title"
										>
											<FileCheck aria-hidden="true" className="h-5 w-5" />
											Detalhes do Consentimento
										</DialogTitle>
										<DialogDescription id="consent-details-description">
											Informações completas sobre o consentimento selecionado
										</DialogDescription>
									</DialogHeader>

									<div className="space-y-6">
										{/* Patient Info */}
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Paciente</Label>
												<p className="font-medium text-lg">
													{selectedConsent.patientName}
												</p>
											</div>
											<div>
												<Label>Status</Label>
												<div className="mt-1">
													<Badge
														variant={getStatusBadgeVariant(
															selectedConsent.status,
														)}
													>
														{getStatusLabel(selectedConsent.status)}
													</Badge>
												</div>
											</div>
										</div>

										<Separator />

										{/* Consent Details */}
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Tipo de Consentimento</Label>
												<p className="font-medium">
													{getConsentTypeLabel(selectedConsent.consentType)}
												</p>
											</div>
											<div>
												<Label>Base Legal</Label>
												<p className="font-medium">
													{selectedConsent.legalBasis}
												</p>
											</div>
										</div>

										<div>
											<Label>Finalidade</Label>
											<p className="font-medium">{selectedConsent.purpose}</p>
										</div>

										<div>
											<Label>Descrição</Label>
											<p className="text-gray-700">
												{selectedConsent.description}
											</p>
										</div>

										<Separator />

										{/* Dates */}
										<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
											<div>
												<Label>Data de Concessão</Label>
												<p className="font-medium">
													{new Date(selectedConsent.grantedDate).toLocaleString(
														"pt-BR",
													)}
												</p>
											</div>
											<div>
												<Label>Data de Expiração</Label>
												<p className="font-medium">
													{new Date(selectedConsent.expiryDate).toLocaleString(
														"pt-BR",
													)}
												</p>
											</div>
											{selectedConsent.withdrawnDate && (
												<div>
													<Label>Data de Retirada</Label>
													<p className="font-medium text-red-600">
														{new Date(
															selectedConsent.withdrawnDate,
														).toLocaleString("pt-BR")}
													</p>
												</div>
											)}
										</div>

										<Separator />

										{/* Technical Details */}
										<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
											<div>
												<Label>Versão do Formulário</Label>
												<p className="font-medium">{selectedConsent.version}</p>
											</div>
											<div>
												<Label>Assinatura Digital</Label>
												<p className="font-mono text-sm">
													{selectedConsent.digitalSignature}
												</p>
											</div>
										</div>

										{selectedConsent.isMinor &&
											selectedConsent.guardianInfo && (
												<>
													<Separator />
													<div>
														<Label>Informações do Responsável Legal</Label>
														<div className="mt-2 rounded-lg bg-blue-50 p-4">
															<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
																<div>
																	<Label>Nome do Responsável</Label>
																	<p className="font-medium">
																		{selectedConsent.guardianInfo.name}
																	</p>
																</div>
																<div>
																	<Label>Relacionamento</Label>
																	<p className="font-medium">
																		{selectedConsent.guardianInfo.relationship}
																	</p>
																</div>
															</div>
														</div>
													</div>
												</>
											)}

										<div className="flex justify-end gap-2">
											<Button variant="outline">
												<Download className="mr-2 h-4 w-4" />
												Baixar PDF
											</Button>
											{selectedConsent.status === "active" && (
												<Button variant="destructive">
													<XCircle className="mr-2 h-4 w-4" />
													Retirar Consentimento
												</Button>
											)}
										</div>
									</div>
								</>
							)}
						</DialogContent>
					</Dialog>
				</main>
			</div>
		</div>
	);
}
