"use client";

import {
	Badge,
	CheckCircle,
	Clock,
	FileText,
	Filter,
	GraduationCap,
	Heart,
	MoreVertical,
	Plus,
	Search,
	Shield,
	Star,
	User,
	UserCheck,
	UserX,
	XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type {
	AvailabilityStatus,
	HealthcareProfessional,
	LicenseStatus,
	ProfessionalRole,
} from "@/types/team-coordination"; // Mock data for Brazilian healthcare professionals

const mockStaffData: HealthcareProfessional[] = [
	{
		id: "prof-001",
		cpf: "***.***.***-**", // Masked for privacy
		fullName: "Dr. Maria Silva Santos",
		displayName: "Dra. Maria Silva",
		email: "maria.silva@neonpro.com.br",
		phone: "+55 11 99999-0001",
		role: "medico",
		department: "Cardiologia",
		cfmLicense: {
			cfmNumber: "123456-SP",
			state: "SP",
			issueDate: new Date("2018-03-15"),
			expiryDate: new Date("2025-03-15"),
			status: "active",
			lastRenewalDate: new Date("2023-03-15"),
			disciplinaryActions: [],
			telemedicineAuthorized: true,
		},
		rqeRegistrations: [
			{
				rqeNumber: "RQE-98765",
				specialty: "Cardiologia",
				certifyingBody: "SBC - Sociedade Brasileira de Cardiologia",
				issueDate: new Date("2020-01-10"),
				expiryDate: new Date("2025-01-10"),
				status: "active",
			},
		],
		professionalLicenses: ["CFM-123456-SP"],
		specializations: ["Cardiologia Intervencionista", "Ecocardiografia"],
		competencies: ["Cateterismo Cardíaco", "Angioplastia", "Ecocardiograma"],
		languages: ["Português", "Inglês", "Espanhol"],
		cmeCredits: [],
		cmeRequiredHours: 100,
		cmeCompletedHours: 85,
		educationLevel: "Doutorado",
		availabilityStatus: "available",
		currentLocation: "Sala 301 - Cardiologia",
		shiftStartTime: new Date("2024-08-21T07:00:00"),
		shiftEndTime: new Date("2024-08-21T19:00:00"),
		performanceMetrics: [],
		patientSatisfactionScore: 9.2,
		safetyIncidents: 0,
		employmentStartDate: new Date("2020-05-01"),
		contractType: "clt",
		weeklyHoursLimit: 44,
		currentWeekHours: 32,
		overtimeHours: 0,
		emergencyContact: {
			name: "João Silva Santos",
			relationship: "Esposo",
			phone: "+55 11 99999-0002",
			email: "joao.santos@email.com",
		},
		medicalAlerts: [],
		consentGiven: true,
		consentDate: new Date("2024-01-15"),
		dataRetentionDate: new Date("2029-01-15"),
		createdAt: new Date("2020-05-01"),
		updatedAt: new Date("2024-08-21"),
		lastLoginAt: new Date("2024-08-21T06:45:00"),
		isActive: true,
	},
	{
		id: "prof-002",
		cpf: "***.***.***-**",
		fullName: "Dr. Roberto Oliveira Costa",
		displayName: "Dr. Roberto Oliveira",
		email: "roberto.oliveira@neonpro.com.br",
		phone: "+55 11 99999-0003",
		role: "medico",
		department: "Urgência e Emergência",
		cfmLicense: {
			cfmNumber: "234567-SP",
			state: "SP",
			issueDate: new Date("2015-06-20"),
			expiryDate: new Date("2024-12-20"), // Expiring soon!
			status: "pending_renewal",
			lastRenewalDate: new Date("2019-06-20"),
			disciplinaryActions: [],
			telemedicineAuthorized: false,
		},
		rqeRegistrations: [],
		professionalLicenses: ["CFM-234567-SP"],
		specializations: ["Medicina de Emergência", "Clínica Médica"],
		competencies: ["Trauma", "Reanimação Cardiopulmonar", "ACLS"],
		languages: ["Português", "Inglês"],
		cmeCredits: [],
		cmeRequiredHours: 100,
		cmeCompletedHours: 45, // Below requirement
		educationLevel: "Especialização",
		availabilityStatus: "emergency",
		currentLocation: "Pronto Socorro",
		shiftStartTime: new Date("2024-08-21T19:00:00"),
		shiftEndTime: new Date("2024-08-22T07:00:00"),
		performanceMetrics: [],
		patientSatisfactionScore: 8.7,
		safetyIncidents: 1,
		employmentStartDate: new Date("2018-03-01"),
		contractType: "clt",
		weeklyHoursLimit: 44,
		currentWeekHours: 46, // Over CLT limit!
		overtimeHours: 2,
		emergencyContact: {
			name: "Ana Costa Oliveira",
			relationship: "Esposa",
			phone: "+55 11 99999-0004",
		},
		medicalAlerts: [],
		consentGiven: true,
		consentDate: new Date("2024-01-15"),
		dataRetentionDate: new Date("2029-01-15"),
		createdAt: new Date("2018-03-01"),
		updatedAt: new Date("2024-08-21"),
		lastLoginAt: new Date("2024-08-21T18:30:00"),
		isActive: true,
	},
	{
		id: "prof-003",
		cpf: "***.***.***-**",
		fullName: "Ana Paula Ferreira Souza",
		displayName: "Enf. Ana Paula",
		email: "ana.ferreira@neonpro.com.br",
		phone: "+55 11 99999-0005",
		role: "enfermeiro",
		department: "UTI",
		cfmLicense: null, // Nurses don't have CFM licenses
		rqeRegistrations: [],
		professionalLicenses: ["COREN-SP-123456"],
		specializations: ["Enfermagem em UTI", "Cuidados Intensivos"],
		competencies: ["Ventilação Mecânica", "Monitorização Hemodinâmica", "Medicação EV"],
		languages: ["Português"],
		cmeCredits: [],
		cmeRequiredHours: 60, // Different requirement for nurses
		cmeCompletedHours: 72, // Exceeding requirement
		educationLevel: "Especialização",
		availabilityStatus: "busy",
		currentLocation: "UTI - Leito 05",
		shiftStartTime: new Date("2024-08-21T07:00:00"),
		shiftEndTime: new Date("2024-08-21T19:00:00"),
		performanceMetrics: [],
		patientSatisfactionScore: 9.5,
		safetyIncidents: 0,
		employmentStartDate: new Date("2019-08-15"),
		contractType: "clt",
		weeklyHoursLimit: 44,
		currentWeekHours: 40,
		overtimeHours: 0,
		emergencyContact: {
			name: "Carlos Souza",
			relationship: "Esposo",
			phone: "+55 11 99999-0006",
		},
		medicalAlerts: [],
		consentGiven: true,
		consentDate: new Date("2024-01-15"),
		dataRetentionDate: new Date("2029-01-15"),
		createdAt: new Date("2019-08-15"),
		updatedAt: new Date("2024-08-21"),
		lastLoginAt: new Date("2024-08-21T06:50:00"),
		isActive: true,
	},
]; // Helper function to get status colors and icons
const getStatusInfo = (status: LicenseStatus | AvailabilityStatus) => {
	switch (status) {
		case "active":
		case "available":
			return { color: "text-green-600", bg: "bg-green-100", icon: CheckCircle };
		case "expired":
		case "suspended":
		case "revoked":
			return { color: "text-red-600", bg: "bg-red-100", icon: XCircle };
		case "pending_renewal":
			return { color: "text-yellow-600", bg: "bg-yellow-100", icon: Clock };
		case "busy":
		case "emergency":
			return { color: "text-blue-600", bg: "bg-blue-100", icon: UserCheck };
		case "break":
		case "off_duty":
			return { color: "text-gray-600", bg: "bg-gray-100", icon: Clock };
		default:
			return { color: "text-gray-600", bg: "bg-gray-100", icon: User };
	}
};

// Role translations for Brazilian Portuguese
const roleTranslations: Record<ProfessionalRole, string> = {
	medico: "Médico",
	enfermeiro: "Enfermeiro",
	tecnico: "Técnico",
	administrativo: "Administrativo",
	especialista: "Especialista",
	residente: "Residente",
	estagiario: "Estagiário",
};

// Component interface
type StaffManagementProps = {
	emergencyMode?: boolean;
};

export function StaffManagement({ emergencyMode = false }: StaffManagementProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<ProfessionalRole | "all">("all");
	const [statusFilter, setStatusFilter] = useState<AvailabilityStatus | "all">("all");
	const [departmentFilter, setDepartmentFilter] = useState<string>("all");
	const [showComplianceOnly, setShowComplianceOnly] = useState(false); // Filter and search logic
	const filteredStaff = useMemo(() => {
		return mockStaffData.filter((staff) => {
			// Search filter
			if (searchQuery) {
				const searchLower = searchQuery.toLowerCase();
				const matchesSearch =
					staff.fullName.toLowerCase().includes(searchLower) ||
					staff.displayName.toLowerCase().includes(searchLower) ||
					staff.email.toLowerCase().includes(searchLower) ||
					staff.department.toLowerCase().includes(searchLower) ||
					staff.cfmLicense?.cfmNumber.toLowerCase().includes(searchLower);

				if (!matchesSearch) {
					return false;
				}
			}

			// Role filter
			if (roleFilter !== "all" && staff.role !== roleFilter) {
				return false;
			}

			// Status filter
			if (statusFilter !== "all" && staff.availabilityStatus !== statusFilter) {
				return false;
			}

			// Department filter
			if (departmentFilter !== "all" && staff.department !== departmentFilter) {
				return false;
			}

			// Compliance filter
			if (showComplianceOnly) {
				const hasComplianceIssues =
					(staff.cfmLicense && staff.cfmLicense.status !== "active") ||
					staff.currentWeekHours > staff.weeklyHoursLimit ||
					staff.cmeCompletedHours < staff.cmeRequiredHours;

				if (!hasComplianceIssues) {
					return false;
				}
			}

			return true;
		});
	}, [searchQuery, roleFilter, statusFilter, departmentFilter, showComplianceOnly]);

	// Get unique departments for filter
	const departments = useMemo(() => {
		return Array.from(new Set(mockStaffData.map((staff) => staff.department)));
	}, []);
	return (
		<div className="space-y-6">
			{/* Header with Actions */}
			<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
				<div>
					<h2 className="font-bold text-2xl">Gestão da Equipe</h2>
					<p className="text-muted-foreground">
						{filteredStaff.length} profissionais de {mockStaffData.length} total
					</p>
				</div>

				<div className="flex items-center space-x-2">
					<Button className="bg-blue-600 hover:bg-blue-700" size="sm">
						<Plus className="mr-2 h-4 w-4" />
						Adicionar Profissional
					</Button>
					<Button size="sm" variant="outline">
						<FileText className="mr-2 h-4 w-4" />
						Relatório CFM
					</Button>
					{emergencyMode && (
						<Button size="sm" variant="destructive">
							<Shield className="mr-2 h-4 w-4" />
							Protocolo Emergência
						</Button>
					)}
				</div>
			</div>
			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Busca e Filtros</CardTitle>
					<CardDescription>Encontre profissionais por nome, CFM, departamento ou especialidade</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
						{/* Search Input */}
						<div className="lg:col-span-2">
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
								<Input
									aria-label="Buscar profissionais"
									className="pl-10"
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Buscar por nome, CFM, email..."
									value={searchQuery}
								/>
							</div>
						</div>{" "}
						{/* Role Filter */}
						<Select onValueChange={(value) => setRoleFilter(value as ProfessionalRole | "all")} value={roleFilter}>
							<SelectTrigger aria-label="Filtrar por função">
								<SelectValue placeholder="Função" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todas as Funções</SelectItem>
								{Object.entries(roleTranslations).map(([key, label]) => (
									<SelectItem key={key} value={key}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{/* Status Filter */}
						<Select
							onValueChange={(value) => setStatusFilter(value as AvailabilityStatus | "all")}
							value={statusFilter}
						>
							<SelectTrigger aria-label="Filtrar por status">
								<SelectValue placeholder="Status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos os Status</SelectItem>
								<SelectItem value="available">Disponível</SelectItem>
								<SelectItem value="busy">Ocupado</SelectItem>
								<SelectItem value="emergency">Emergência</SelectItem>
								<SelectItem value="break">Em Pausa</SelectItem>
								<SelectItem value="off_duty">Fora de Serviço</SelectItem>
							</SelectContent>
						</Select>
						{/* Department Filter */}
						<Select onValueChange={setDepartmentFilter} value={departmentFilter}>
							<SelectTrigger aria-label="Filtrar por departamento">
								<SelectValue placeholder="Departamento" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Todos os Departamentos</SelectItem>
								{departments.map((dept) => (
									<SelectItem key={dept} value={dept}>
										{dept}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{/* Quick Filters */}
						<div className="flex items-center space-x-2">
							<Button
								className="text-xs"
								onClick={() => setShowComplianceOnly(!showComplianceOnly)}
								size="sm"
								variant={showComplianceOnly ? "default" : "outline"}
							>
								<Filter className="mr-1 h-3 w-3" />
								Pendências
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>{" "}
			{/* Staff Table */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Equipe Ativa</CardTitle>
					<CardDescription>Status em tempo real dos profissionais com compliance CFM e CLT</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[250px]">Profissional</TableHead>
									<TableHead>Função</TableHead>
									<TableHead>Departamento</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>CFM/Licença</TableHead>
									<TableHead>Performance</TableHead>
									<TableHead>CLT Hours</TableHead>
									<TableHead>CME</TableHead>
									<TableHead className="w-[50px]">Ações</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredStaff.map((staff) => {
									const statusInfo = getStatusInfo(staff.availabilityStatus);
									const StatusIcon = statusInfo.icon;

									// Check for compliance issues
									const cfmIssue = staff.cfmLicense && staff.cfmLicense.status !== "active";
									const cltIssue = staff.currentWeekHours > staff.weeklyHoursLimit;
									const cmeIssue = staff.cmeCompletedHours < staff.cmeRequiredHours;

									return (
										<TableRow className="hover:bg-muted/50" key={staff.id}>
											{/* Professional Info */}
											<TableCell>
												<div className="flex items-center space-x-3">
													<Avatar className="h-8 w-8">
														<AvatarImage alt={staff.displayName} src="" />
														<AvatarFallback className="bg-blue-100 font-medium text-blue-700 text-xs">
															{staff.displayName
																.split(" ")
																.map((n) => n[0])
																.join("")
																.substring(0, 2)}
														</AvatarFallback>
													</Avatar>
													<div className="min-w-0">
														<p className="truncate font-medium text-foreground text-sm">{staff.displayName}</p>
														<p className="truncate text-muted-foreground text-xs">{staff.email}</p>
														{staff.currentLocation && (
															<p className="text-blue-600 text-xs">📍 {staff.currentLocation}</p>
														)}
													</div>
												</div>
											</TableCell>{" "}
											{/* Role */}
											<TableCell>
												<Badge className="text-xs" variant="secondary">
													{roleTranslations[staff.role]}
												</Badge>
											</TableCell>
											{/* Department */}
											<TableCell>
												<span className="text-foreground text-sm">{staff.department}</span>
											</TableCell>
											{/* Availability Status */}
											<TableCell>
												<div className="flex items-center space-x-2">
													<div className={`rounded-full p-1 ${statusInfo.bg}`}>
														<StatusIcon className={`h-3 w-3 ${statusInfo.color}`} />
													</div>
													<span className="font-medium text-xs capitalize">
														{staff.availabilityStatus === "available" && "Disponível"}
														{staff.availabilityStatus === "busy" && "Ocupado"}
														{staff.availabilityStatus === "emergency" && "Emergência"}
														{staff.availabilityStatus === "break" && "Pausa"}
														{staff.availabilityStatus === "off_duty" && "Fora de Serviço"}
														{staff.availabilityStatus === "on_call" && "Sobreaviso"}
													</span>
												</div>
											</TableCell>
											{/* CFM/License Status */}
											<TableCell>
												{staff.cfmLicense ? (
													<div className="space-y-1">
														<div className="flex items-center space-x-1">
															<span className="font-mono text-xs">{staff.cfmLicense.cfmNumber}</span>
															{cfmIssue ? (
																<XCircle className="h-3 w-3 text-red-500" />
															) : (
																<CheckCircle className="h-3 w-3 text-green-500" />
															)}
														</div>
														{staff.cfmLicense.status === "pending_renewal" && (
															<Badge className="border-yellow-500 text-xs text-yellow-700" variant="outline">
																Renovar CFM
															</Badge>
														)}
													</div>
												) : (
													<div className="flex items-center space-x-1">
														<span className="text-muted-foreground text-xs">
															{staff.professionalLicenses[0] || "N/A"}
														</span>
														<CheckCircle className="h-3 w-3 text-green-500" />
													</div>
												)}
											</TableCell>{" "}
											{/* Performance Score */}
											<TableCell>
												<div className="flex items-center space-x-2">
													<Star className="h-3 w-3 text-yellow-500" />
													<span className="font-medium text-sm">{staff.patientSatisfactionScore.toFixed(1)}</span>
													{staff.safetyIncidents > 0 && (
														<Badge className="text-xs" variant="destructive">
															{staff.safetyIncidents} inc.
														</Badge>
													)}
												</div>
											</TableCell>
											{/* CLT Hours */}
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center space-x-1">
														<span className="text-xs">
															{staff.currentWeekHours}h / {staff.weeklyHoursLimit}h
														</span>
														{cltIssue ? (
															<XCircle className="h-3 w-3 text-red-500" />
														) : (
															<CheckCircle className="h-3 w-3 text-green-500" />
														)}
													</div>
													<Progress className="h-1" value={(staff.currentWeekHours / staff.weeklyHoursLimit) * 100} />
													{staff.overtimeHours > 0 && (
														<Badge className="border-orange-500 text-orange-700 text-xs" variant="outline">
															+{staff.overtimeHours}h extra
														</Badge>
													)}
												</div>
											</TableCell>
											{/* CME Progress */}
											<TableCell>
												<div className="space-y-1">
													<div className="flex items-center space-x-1">
														<GraduationCap className="h-3 w-3 text-blue-500" />
														<span className="text-xs">
															{staff.cmeCompletedHours}h / {staff.cmeRequiredHours}h
														</span>
														{cmeIssue ? (
															<XCircle className="h-3 w-3 text-red-500" />
														) : (
															<CheckCircle className="h-3 w-3 text-green-500" />
														)}
													</div>
													<Progress className="h-1" value={(staff.cmeCompletedHours / staff.cmeRequiredHours) * 100} />
												</div>
											</TableCell>{" "}
											{/* Actions */}
											<TableCell>
												<DropdownMenu>
													<DropdownMenuTrigger asChild>
														<Button
															aria-label={`Ações para ${staff.displayName}`}
															className="h-8 w-8 p-0"
															size="sm"
															variant="ghost"
														>
															<MoreVertical className="h-4 w-4" />
														</Button>
													</DropdownMenuTrigger>
													<DropdownMenuContent align="end">
														<DropdownMenuLabel>Ações</DropdownMenuLabel>
														<DropdownMenuItem>
															<User className="mr-2 h-4 w-4" />
															Ver Perfil
														</DropdownMenuItem>
														<DropdownMenuItem>
															<Calendar className="mr-2 h-4 w-4" />
															Ver Escala
														</DropdownMenuItem>
														<DropdownMenuItem>
															<Heart className="mr-2 h-4 w-4" />
															Performance
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														{emergencyMode && (
															<DropdownMenuItem className="text-red-600">
																<Shield className="mr-2 h-4 w-4" />
																Ação Emergência
															</DropdownMenuItem>
														)}
														<DropdownMenuItem>
															<FileText className="mr-2 h-4 w-4" />
															Relatórios
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

					{/* Empty State */}
					{filteredStaff.length === 0 && (
						<div className="py-12 text-center">
							<UserX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<p className="mb-2 font-medium text-foreground text-lg">Nenhum profissional encontrado</p>
							<p className="mb-4 text-muted-foreground">
								Tente ajustar os filtros ou adicionar novos profissionais à equipe
							</p>
							<Button size="sm">
								<Plus className="mr-2 h-4 w-4" />
								Adicionar Profissional
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
