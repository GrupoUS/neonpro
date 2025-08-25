/**
 * Monitoring Types for Healthcare Platform
 * Enhanced monitoring for ≥9.9/10 quality standard
 */

export type MonitoringConfig = {
	alertThresholds: AlertThresholds;
	reportingConfig: ReportingConfig;
	integrations: IntegrationConfig;
};

export type AlertThresholds = {
	// System Health Thresholds
	maxErrorRate: number;
	maxResponseTime: number;
	minUptime: number;
	maxMemoryUsage: number;
	maxDiskUsage: number;

	// Performance Thresholds
	maxLCP: number; // Largest Contentful Paint
	maxFID: number; // First Input Delay
	maxCLS: number; // Cumulative Layout Shift
	maxAPIResponseTime: number;
	minTestCoverage: number;

	// Security Thresholds
	maxFailedLogins: number;
	maxSuspiciousActivities: number;
	minSecurityScore: number;
	maxVulnerabilities: number;

	// Compliance Thresholds
	minLGPDScore: number;
	minANVISAScore: number;
	minCFMScore: number;
	minISO27001Score: number;

	// AI Governance Thresholds
	minEthicsScore: number;
	maxModelDrift: number;
	minExplainabilityScore: number;
	minFairnessScore: number;
};
export type ReportingConfig = {
	interval: number;
	retentionDays: number;
	exportFormats: ("json" | "csv" | "pdf")[];
	recipients: string[];
	dashboardUrl?: string;
};

export type IntegrationConfig = {
	slack?: {
		webhookUrl: string;
		channels: string[];
	};
	email?: {
		smtp: {
			host: string;
			port: number;
			secure: boolean;
			auth: {
				user: string;
				pass: string;
			};
		};
	};
	pagerDuty?: {
		integrationKey: string;
	};
	grafana?: {
		url: string;
		apiKey: string;
	};
};

export type Alert = {
	type: AlertType;
	category: AlertCategory;
	message: string;
	timestamp: string;
	severity?: AlertSeverity;
	metadata?: Record<string, string | number | boolean>;
};

export type AlertType = "CRITICAL" | "WARNING" | "INFO";
export type AlertCategory = "SYSTEM_HEALTH" | "PERFORMANCE" | "SECURITY" | "COMPLIANCE" | "AI_GOVERNANCE" | "QUALITY";
export type AlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type MonitoringReport = {
	timestamp: string;
	overallHealthScore: number;
	complianceScore: number;
	securityScore: number;
	performanceScore: number;
	aiGovernanceScore: number;
	qualityScore: number;
	recommendations: string[];
	metrics: Record<string, number | string | boolean>;
};
