"use client";

import {
	Activity,
	AlertTriangle,
	Calendar,
	Clock,
	MessageSquare,
	Settings,
	Shield,
	TrendingUp,
	UserCheck,
	Users,
} from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import our comprehensive types
import type {
	AvailabilityStatus,
	HealthcareProfessional,
	MedicalEquipment,
	Schedule,
	TeamMessage,
	TeamPerformanceMetrics,
} from "@/types/team-coordination";
import { CommunicationHub } from "./components/communication-hub";
import { PerformanceAnalytics } from "./components/performance-analytics";
import { ResourceAllocation } from "./components/resource-allocation";
import { SchedulingSystem } from "./components/scheduling-system";
// Import team components
import { StaffManagement } from "./components/staff-management";

// Mock data for development - Will be replaced with real API calls
const mockTeamStats = {
	totalStaff: 24,
	activeStaff: 18,
	onBreak: 3,
	emergencyAvailable: 6,
	currentShifts: 12,
	overdueCompliance: 2,
};

const mockAlerts = [
	{
		id: "1",
		type: "compliance" as const,
		message: "Dr. Silva - CFM license expiring in 15 days",
		severity: "warning" as const,
		timestamp: new Date(),
	},
	{
		id: "2",
		type: "emergency" as const,
		message: "Emergency team activation requested - Trauma Bay 1",
		severity: "critical" as const,
		timestamp: new Date(),
	},
	{
		id: "3",
		type: "scheduling" as const,
		message: "CLT compliance alert: João exceeding weekly hour limit",
		severity: "warning" as const,
		timestamp: new Date(),
	},
];

export default function TeamCoordinationPage() {
	const [activeTab, setActiveTab] = useState("overview");
	const [emergencyMode, setEmergencyMode] = useState(false);
	return (
		<div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
			{/* Header Section with Emergency Controls */}
			<div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
				<div>
					<h1 className="font-bold text-3xl text-foreground tracking-tight">Coordenação da Equipe</h1>
					<p className="text-muted-foreground">Gestão completa da equipe de saúde com compliance CFM, CLT e LGPD</p>
				</div>

				{/* Emergency Controls */}
				<div className="flex items-center space-x-3">
					<Button
						aria-label={emergencyMode ? "Desativar modo de emergência" : "Ativar modo de emergência"}
						className="transition-all duration-200"
						onClick={() => setEmergencyMode(!emergencyMode)}
						size="sm"
						variant={emergencyMode ? "destructive" : "outline"}
					>
						<AlertTriangle className="mr-2 h-4 w-4" />
						{emergencyMode ? "Modo Emergência Ativo" : "Ativar Emergência"}
					</Button>

					<Button size="sm" variant="default">
						<Settings className="mr-2 h-4 w-4" />
						Configurações
					</Button>
				</div>
			</div>{" "}
			{/* Emergency Alert Banner */}
			{emergencyMode && (
				<Alert className="border-red-500 bg-red-50 dark:bg-red-900/20">
					<AlertTriangle className="h-4 w-4 text-red-600" />
					<AlertDescription className="text-red-700 dark:text-red-300">
						<strong>Modo de Emergência Ativo:</strong> Protocolos de emergência em vigor. Acesso prioritário a recursos
						e comunicação de alta prioridade habilitada.
					</AlertDescription>
				</Alert>
			)}
			{/* Quick Stats Overview */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
				<Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Equipe Total</CardTitle>
						<Users className="h-4 w-4 text-blue-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-blue-700 dark:text-blue-300">{mockTeamStats.totalStaff}</div>
						<p className="text-blue-600 text-xs dark:text-blue-400">profissionais cadastrados</p>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Ativos Agora</CardTitle>
						<UserCheck className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-green-700 dark:text-green-300">{mockTeamStats.activeStaff}</div>
						<p className="text-green-600 text-xs dark:text-green-400">em serviço ativo</p>
					</CardContent>
				</Card>{" "}
				<Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Em Pausa</CardTitle>
						<Clock className="h-4 w-4 text-accent" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-accent dark:text-accent-light">{mockTeamStats.onBreak}</div>
						<p className="text-accent text-xs dark:text-accent">pausa CLT</p>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Emergência</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-red-700 dark:text-red-300">{mockTeamStats.emergencyAvailable}</div>
						<p className="text-red-600 text-xs dark:text-red-400">disponíveis emergência</p>
					</CardContent>
				</Card>
				<Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Turnos Ativos</CardTitle>
						<Calendar className="h-4 w-4 text-purple-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-purple-700 dark:text-purple-300">{mockTeamStats.currentShifts}</div>
						<p className="text-purple-600 text-xs dark:text-purple-400">turnos em andamento</p>
					</CardContent>
				</Card>{" "}
				<Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="font-medium text-sm">Compliance</CardTitle>
						<Shield className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="font-bold text-2xl text-orange-700 dark:text-orange-300">
							{mockTeamStats.overdueCompliance}
						</div>
						<p className="text-orange-600 text-xs dark:text-orange-400">pendências CFM/CLT</p>
					</CardContent>
				</Card>
			</div>
			{/* Active Alerts */}
			{mockAlerts.length > 0 && (
				<div className="space-y-2">
					<h3 className="font-semibold text-lg">Alertas Ativos</h3>
					<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
						{mockAlerts.map((alert) => (
							<Alert
								className={`${
									alert.severity === "critical"
										? "border-red-500 bg-red-50 dark:bg-red-900/20"
										: "border-accent bg-accent/10 dark:bg-accent/20"
								}`}
								key={alert.id}
							>
								<AlertTriangle
									className={`h-4 w-4 ${alert.severity === "critical" ? "text-red-600" : "text-accent"}`}
								/>
								<AlertDescription
									className={
										alert.severity === "critical" ? "text-red-700 dark:text-red-300" : "text-accent dark:text-accent"
									}
								>
									<div className="flex items-center justify-between">
										<span className="text-sm">{alert.message}</span>
										<Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>{alert.type}</Badge>
									</div>
								</AlertDescription>
							</Alert>
						))}
					</div>
				</div>
			)}{" "}
			{/* Main Dashboard Tabs */}
			<Tabs className="space-y-6" onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
					<TabsTrigger className="text-sm" value="overview">
						<Activity className="mr-2 h-4 w-4" />
						Visão Geral
					</TabsTrigger>
					<TabsTrigger className="text-sm" value="staff">
						<Users className="mr-2 h-4 w-4" />
						Equipe
					</TabsTrigger>
					<TabsTrigger className="text-sm" value="scheduling">
						<Calendar className="mr-2 h-4 w-4" />
						Escalas
					</TabsTrigger>
					<TabsTrigger className="text-sm" value="resources">
						<Settings className="mr-2 h-4 w-4" />
						Recursos
					</TabsTrigger>
					<TabsTrigger className="text-sm" value="communication">
						<MessageSquare className="mr-2 h-4 w-4" />
						Comunicação
					</TabsTrigger>
					<TabsTrigger className="text-sm" value="analytics">
						<TrendingUp className="mr-2 h-4 w-4" />
						Analytics
					</TabsTrigger>
				</TabsList>
				{/* Overview Tab Content */}
				<TabsContent className="space-y-6" value="overview">
					<div className="grid gap-6 lg:grid-cols-2">
						{/* Team Status Overview */}
						<Card>
							<CardHeader>
								<CardTitle>Status da Equipe em Tempo Real</CardTitle>
								<CardDescription>Monitoramento contínuo da disponibilidade e localização da equipe</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="py-8 text-center text-muted-foreground">
										📊 Mapa de calor da equipe será implementado aqui
										<br />
										<span className="text-sm">Visualização em tempo real da disponibilidade por departamento</span>
									</div>
								</div>
							</CardContent>
						</Card>{" "}
						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Atividade Recente</CardTitle>
								<CardDescription>Últimas ações e atualizações da equipe</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div className="py-8 text-center text-muted-foreground">
										📝 Feed de atividades será implementado aqui
										<br />
										<span className="text-sm">Cronologia de mudanças de turno, comunicações e alertas</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
				{/* Staff Management Tab */}
				<TabsContent className="space-y-6" value="staff">
					<StaffManagement emergencyMode={emergencyMode} />
				</TabsContent>{" "}
				{/* Scheduling Tab */}
				<TabsContent className="space-y-6" value="scheduling">
					<SchedulingSystem emergencyMode={emergencyMode} />
				</TabsContent>
				{/* Resources Tab */}
				<TabsContent className="space-y-6" value="resources">
					<ResourceAllocation emergencyMode={emergencyMode} />
				</TabsContent>
				{/* Communication Tab */}
				<TabsContent className="space-y-6" value="communication">
					<CommunicationHub emergencyMode={emergencyMode} />
				</TabsContent>{" "}
				{/* Analytics Tab */}
				<TabsContent className="space-y-6" value="analytics">
					<PerformanceAnalytics emergencyMode={emergencyMode} />
				</TabsContent>
			</Tabs>
			{/* Footer - Quick Access Links */}
			<div className="border-t pt-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div className="flex items-center space-x-4 text-muted-foreground text-sm">
						<span>🔒 LGPD Compliant</span>
						<span>⚕️ CFM Validated</span>
						<span>⚖️ CLT Compliance</span>
						<span>🛡️ ANVISA Approved</span>
					</div>

					<div className="flex items-center space-x-2">
						<Button size="sm" variant="outline">
							Central de Ajuda
						</Button>
						<Button size="sm" variant="outline">
							Relatório de Compliance
						</Button>
						<Button size="sm" variant="outline">
							Auditoria LGPD
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
