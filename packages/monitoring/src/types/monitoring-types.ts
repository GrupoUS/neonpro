/**
 * Monitoring Types for Healthcare Platform
 * Enhanced monitoring for ≥9.9/10 quality standard
 */

interface MonitoringConfig {
  alertThresholds: AlertThresholds;
  integrations: IntegrationConfig;
  reportingConfig: ReportingConfig;
}

interface AlertThresholds {
  // System Health Thresholds
  maxDiskUsage: number;
  maxErrorRate: number;
  maxMemoryUsage: number;
  maxResponseTime: number;
  minUptime: number;

  // Performance Thresholds
  maxAPIResponseTime: number;
  maxCLS: number; // Cumulative Layout Shift
  maxFID: number; // First Input Delay
  maxLCP: number; // Largest Contentful Paint
  minTestCoverage: number;

  // Security Thresholds
  maxFailedLogins: number;
  maxSuspiciousActivities: number;
  maxVulnerabilities: number;
  minSecurityScore: number;

  // Compliance Thresholds
  minANVISAScore: number;
  minCFMScore: number;
  minISO27001Score: number;
  minLGPDScore: number;

  // AI Governance Thresholds
  maxModelDrift: number;
  minEthicsScore: number;
  minExplainabilityScore: number;
  minFairnessScore: number;
}

interface ReportingConfig {
  dashboardUrl?: string;
  exportFormats: ("json" | "csv" | "pdf")[];
  interval: number;
  recipients: string[];
  retentionDays: number;
}

interface IntegrationConfig {
  email?: {
    smtp: {
      auth: {
        pass: string;
        user: string;
      };
      host: string;
      port: number;
      secure: boolean;
    };
  };
  grafana?: {
    apiKey: string;
    url: string;
  };
  pagerDuty?: {
    integrationKey: string;
  };
  slack?: {
    channels: string[];
    webhookUrl: string;
  };
}

interface Alert {
  category: AlertCategory;
  message: string;
  metadata?: Record<string, string | number | boolean>;
  severity?: AlertSeverity;
  timestamp: string;
  type: AlertType;
}

type AlertType = "CRITICAL" | "WARNING" | "INFO";
type AlertCategory =
  | "AI_GOVERNANCE"
  | "COMPLIANCE"
  | "PERFORMANCE"
  | "QUALITY"
  | "SECURITY"
  | "SYSTEM_HEALTH";
type AlertSeverity = "CRITICAL" | "HIGH" | "LOW" | "MEDIUM";

interface MonitoringReport {
  aiGovernanceScore: number;
  complianceScore: number;
  metrics: Record<string, number | string | boolean>;
  overallHealthScore: number;
  performanceScore: number;
  qualityScore: number;
  recommendations: string[];
  securityScore: number;
  timestamp: string;
}

export type {
  Alert,
  AlertCategory,
  AlertSeverity,
  AlertThresholds,
  AlertType,
  IntegrationConfig,
  MonitoringConfig,
  MonitoringReport,
  ReportingConfig,
};