"use client";

/**
 * AI-Powered Dashboards Index
 * FASE 4: Frontend Components
 * Compliance: LGPD/ANVISA/CFM
 */

export { AIAnalyticsDashboard } from "./AIAnalyticsDashboard";
export { HealthMonitoringDashboard } from "./HealthMonitoringDashboard";
export { ComplianceStatusDashboard } from "./ComplianceStatusDashboard";
export { PerformanceMetricsDashboard } from "./PerformanceMetricsDashboard";
export { RealTimeActivityDashboard } from "./RealTimeActivityDashboard";

// Re-export types if needed
export type {
	AnalyticsData,
	Metric,
	ChartDataPoint,
} from "./AIAnalyticsDashboard";

export type {
	HealthMetrics,
	SystemStatus,
	HealthAlert,
} from "./HealthMonitoringDashboard";

export type {
	ComplianceFramework,
	ComplianceStatus,
	AuditLog,
} from "./ComplianceStatusDashboard";

// Dashboard registry for dynamic loading
export const DASHBOARD_REGISTRY = {
	analytics: {
		component: "AIAnalyticsDashboard",
		title: "Análise de Dados com IA",
		description: "Dashboard inteligente com insights de IA e métricas avançadas",
		icon: "BarChart3",
		category: "analytics",
		compliance: ["LGPD", "ANVISA", "CFM"],
	},
	health: {
		component: "HealthMonitoringDashboard",
		title: "Monitoramento de Saúde",
		description: "Status do sistema, alertas e performance em tempo real",
		icon: "Activity",
		category: "monitoring",
		compliance: ["LGPD", "ANVISA"],
	},
	compliance: {
		component: "ComplianceStatusDashboard",
		title: "Status de Conformidade",
		description: "Monitoramento de compliance LGPD, ANVISA e CFM",
		icon: "Shield",
		category: "compliance",
		compliance: ["LGPD", "ANVISA", "CFM"],
	},
	performance: {
		component: "PerformanceMetricsDashboard",
		title: "Métricas de Performance",
		description: "Análise detalhada de performance e recursos do sistema",
		icon: "Gauge",
		category: "performance",
		compliance: ["ANVISA"],
	},
	activity: {
		component: "RealTimeActivityDashboard",
		title: "Atividade em Tempo Real",
		description: "Feed de eventos e atividades do sistema ao vivo",
		icon: "Activity",
		category: "monitoring",
		compliance: ["LGPD", "ANVISA", "CFM"],
	},
} as const;

export type DashboardType = keyof typeof DASHBOARD_REGISTRY;