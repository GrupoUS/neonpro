/**
 * Analytics Dashboard with Real-time AI Insights
 * FASE 4: Frontend Components - AI-Powered Dashboards
 * Compliance: LGPD/ANVISA/CFM
 */

"use client";

import { useState, useEffect } from "react";
import {
	Activity,
	BarChart3,
	Brain,
	Calendar,
	DollarSign,
	TrendingUp,
	TrendingDown,
	Users,
	Heart,
	AlertTriangle,
	CheckCircle,
	Target,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface AnalyticsMetrics {
	totalRevenue: number;
	monthlyGrowth: number;
	patientRetention: number;
	treatmentEffectiveness: number;
	aiPredictionAccuracy: number;
	complianceScore: number;
	predictedRevenue: number;
	patientSatisfaction: number;
	noShowRate: number;
	averageTreatmentValue: number;
}

interface AIInsight {
	id: string;
	type: "prediction" | "recommendation" | "alert" | "opportunity";
	title: string;
	description: string;
	confidence: number;
	impact: "high" | "medium" | "low";
	action?: string;
	data?: any;
}

export function AIAnalyticsDashboard() {
	const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
	const [insights, setInsights] = useState<AIInsight[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Simulate loading real analytics data
		const timer = setTimeout(() => {
			setMetrics({
				totalRevenue: 485000,
				monthlyGrowth: 12.5,
				patientRetention: 87.3,
				treatmentEffectiveness: 91.2,
				aiPredictionAccuracy: 94.8,
				complianceScore: 98.5,
				predictedRevenue: 567000,
				patientSatisfaction: 9.2,
				noShowRate: 8.1,
				averageTreatmentValue: 1250,
			});

			setInsights([
				{
					id: "1",
					type: "opportunity",
					title: "Oportunidade de Botox",
					description: "25 pacientes com histórico de preenchimento podem ser convertidos para Botox",
					confidence: 89.2,
					impact: "high",
					action: "Criar campanha direcionada",
				},
				{
					id: "2",
					type: "prediction",
					title: "Previsão de No-Show",
					description: "3 consultas com alta probabilidade de no-show amanhã",
					confidence: 91.7,
					impact: "medium",
					action: "Enviar lembrete personalizado",
				},
				{
					id: "3",
					type: "recommendation",
					title: "Otimização de Agenda",
					description: "Quinta-feira às 14h tem 73% de disponibilidade - ideal para promoções",
					confidence: 85.4,
					impact: "medium",
					action: "Configurar oferta automática",
				},
				{
					id: "4",
					type: "alert",
					title: "Tendência de Sazonalidade",
					description: "Demanda por tratamentos de verão aumentará 40% nas próximas 4 semanas",
					confidence: 93.1,
					impact: "high",
					action: "Aumentar estoque e agenda",
				},
			]);
			
			setLoading(false);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	const getInsightIcon = (type: string) => {
		switch (type) {
			case "prediction":
				return <Brain className="h-4 w-4" />;
			case "recommendation":
				return <Target className="h-4 w-4" />;
			case "alert":
				return <AlertTriangle className="h-4 w-4" />;
			case "opportunity":
				return <TrendingUp className="h-4 w-4" />;
			default:
				return <Activity className="h-4 w-4" />;
		}
	};

	const getInsightBadgeVariant = (impact: string) => {
		switch (impact) {
			case "high":
				return "destructive";
			case "medium":
				return "default";
			case "low":
				return "secondary";
			default:
				return "default";
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{[1, 2, 3, 4].map((i) => (
						<Card key={i}>
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-20" />
								<Skeleton className="h-6 w-32" />
							</CardHeader>
							<CardContent>
								<Skeleton className="h-8 w-24" />
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
			aria-labelledby="analytics-heading"
			aria-describedby="analytics-description"
		>
			{/* AI Insights Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 
						id="analytics-heading"
						className="text-2xl font-bold text-foreground"
					>
						Analytics com IA
					</h2>
					<p 
						id="analytics-description"
						className="text-muted-foreground"
					>
						Insights em tempo real para otimizar sua clínica estética
					</p>
				</div>
				<Badge 
					variant="outline" 
					className="flex items-center gap-2"
					role="status"
					aria-label={`IA ativa com ${metrics?.aiPredictionAccuracy}% de precisão`}
				>
					<Brain className="h-4 w-4 text-primary" aria-hidden="true" />
					IA Ativa: {metrics?.aiPredictionAccuracy}% precisão
				</Badge>
			</div>

			{/* Key Metrics Grid */}
			<div 
				className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
				role="region"
				aria-labelledby="metrics-heading"
			>
				<h3 id="metrics-heading" className="sr-only">Métricas principais</h3>
				
				{/* Revenue */}
				<Card className="neonpro-card group" role="article" aria-labelledby="revenue-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="revenue-title"
							className="flex items-center text-sm font-medium"
						>
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all" aria-hidden="true">
								<DollarSign className="h-4 w-4 text-primary" aria-hidden="true" />
							</div>
							Receita Total
						</CardTitle>
						<CardDescription>
							{metrics?.monthlyGrowth && metrics.monthlyGrowth > 0 ? "+" : ""}
							{metrics?.monthlyGrowth}% este mês
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<div className="text-2xl font-bold">
								R$ {metrics?.totalRevenue.toLocaleString("pt-BR")}
							</div>
							{metrics?.monthlyGrowth && metrics.monthlyGrowth > 0 && (
								<TrendingUp className="h-4 w-4 text-green-600" />
							)}
						</div>
						<div className="text-xs text-muted-foreground">
							Previsão IA: R$ {metrics?.predictedRevenue.toLocaleString("pt-BR")}
						</div>
					</CardContent>
				</Card>

				{/* Patient Retention */}
				<Card className="neonpro-card group" role="article" aria-labelledby="retention-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="retention-title"
							className="flex items-center text-sm font-medium"
						>
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-2/10 transition-all" aria-hidden="true">
								<Users className="h-4 w-4 text-chart-2" aria-hidden="true" />
							</div>
							Retenção de Pacientes
						</CardTitle>
						<CardDescription>Taxa de retorno mensal</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold">{metrics?.patientRetention}%</div>
							<Progress value={metrics?.patientRetention} className="h-2" />
						</div>
					</CardContent>
				</Card>

				{/* Treatment Effectiveness */}
				<Card className="neonpro-card group" role="article" aria-labelledby="effectiveness-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="effectiveness-title"
							className="flex items-center text-sm font-medium"
						>
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-chart-3/10 transition-all" aria-hidden="true">
								<Heart className="h-4 w-4 text-chart-3" aria-hidden="true" />
							</div>
							Efetividade dos Tratamentos
						</CardTitle>
						<CardDescription>Satisfação média dos pacientes</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold">{metrics?.treatmentEffectiveness}%</div>
							<Progress value={metrics?.treatmentEffectiveness} className="h-2" />
						</div>
					</CardContent>
				</Card>

				{/* Compliance Score */}
				<Card className="neonpro-card group" role="article" aria-labelledby="compliance-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="compliance-title"
							className="flex items-center text-sm font-medium"
						>
							<div className="group-hover:neonpro-glow mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 transition-all" aria-hidden="true">
								<CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
							</div>
							Compliance Score
						</CardTitle>
						<CardDescription>LGPD + ANVISA + CFM</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<div className="text-2xl font-bold text-green-600">{metrics?.complianceScore}%</div>
							<Progress value={metrics?.complianceScore} className="h-2" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* AI Insights Section */}
			<Card 
				className="neonpro-card" 
				role="region" 
				aria-labelledby="insights-heading"
			>
				<CardHeader>
					<CardTitle 
						id="insights-heading"
						className="flex items-center"
					>
						<Brain className="mr-2 h-5 w-5 text-primary" aria-hidden="true" />
						Insights de IA em Tempo Real
					</CardTitle>
					<CardDescription>
						Recomendações personalizadas para otimizar sua clínica
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4" role="list" aria-label="Lista de insights de inteligência artificial">
						{insights.map((insight, index) => (
							<div
								key={insight.id}
								className="flex items-start space-x-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
								role="listitem"
								aria-labelledby={`insight-title-${insight.id}`}
								aria-describedby={`insight-desc-${insight.id}`}
								tabIndex={0}
							>
								<div 
									className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
									aria-hidden="true"
								>
									{getInsightIcon(insight.type)}
								</div>
								<div className="flex-1 space-y-2">
									<div className="flex items-center space-x-2">
										<h4 
											id={`insight-title-${insight.id}`}
											className="font-semibold"
										>
											{insight.title}
										</h4>
										<Badge 
											variant={getInsightBadgeVariant(insight.impact)}
											aria-label={`Impacto ${insight.impact === "high" ? "alto" : insight.impact === "medium" ? "médio" : "baixo"}`}
										>
											{insight.impact === "high" && "Alto Impacto"}
											{insight.impact === "medium" && "Médio Impacto"}
											{insight.impact === "low" && "Baixo Impacto"}
										</Badge>
										<Badge 
											variant="outline"
											aria-label={`${insight.confidence}% de confiança na previsão`}
										>
											{insight.confidence}% confiança
										</Badge>
									</div>
									<p 
										id={`insight-desc-${insight.id}`}
										className="text-sm text-muted-foreground"
									>
										{insight.description}
									</p>
									{insight.action && (
										<Button 
											size="sm" 
											variant="outline" 
											className="text-xs"
											aria-label={`Executar ação: ${insight.action}`}
										>
											{insight.action}
										</Button>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Performance Metrics */}
			<div 
				className="grid grid-cols-1 md:grid-cols-3 gap-4"
				role="region"
				aria-labelledby="performance-heading"
			>
				<h3 id="performance-heading" className="sr-only">Métricas de performance</h3>
				
				<Card className="neonpro-card" role="article" aria-labelledby="satisfaction-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="satisfaction-title"
							className="text-sm font-medium"
						>
							Satisfação do Paciente
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<div 
								className="text-2xl font-bold"
								aria-label={`${metrics?.patientSatisfaction} de 10 pontos na satisfação`}
							>
								{metrics?.patientSatisfaction}/10
							</div>
							<Badge 
								variant="outline" 
								className="text-green-600 border-green-600"
								role="status"
								aria-label="Classificação excelente"
							>
								Excelente
							</Badge>
						</div>
					</CardContent>
				</Card>

				<Card className="neonpro-card" role="article" aria-labelledby="noshow-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="noshow-title"
							className="text-sm font-medium"
						>
							Taxa de No-Show
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex items-center space-x-2">
							<div 
								className="text-2xl font-bold"
								aria-label={`${metrics?.noShowRate}% de taxa de não comparecimento`}
							>
								{metrics?.noShowRate}%
							</div>
							<TrendingDown 
								className="h-4 w-4 text-green-600" 
								aria-label="Tendência de queda"
								aria-hidden="true"
							/>
						</div>
					</CardContent>
				</Card>

				<Card className="neonpro-card" role="article" aria-labelledby="ticket-title">
					<CardHeader className="pb-2">
						<CardTitle 
							id="ticket-title"
							className="text-sm font-medium"
						>
							Ticket Médio
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div 
							className="text-2xl font-bold"
							aria-label={`Ticket médio de R$ ${metrics?.averageTreatmentValue.toLocaleString("pt-BR")}`}
						>
							R$ {metrics?.averageTreatmentValue.toLocaleString("pt-BR")}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}