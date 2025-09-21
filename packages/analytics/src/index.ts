/**
 * Analytics Module
 *
 * Comprehensive healthcare analytics system for NeonPro.
 * Provides metrics collection, KPI tracking, and compliance monitoring
 * for Brazilian healthcare environments (LGPD, ANVISA, CFM compliance).
 */

// Core Types and Interfaces
export * from "./types/base-metrics";
export * from "./types/clinical-kpis";
export * from "./types/financial-kpis";
export * from "./types/ingestion";

// Ingestion System
export * from "./ingestion";
export * from "./adapters/ingestion-adapter";

// Aggregation System
export * from "./aggregation";

// Machine Learning Pipeline
export * from "./ml";

// Advanced AI Analytics (T103)
export * from "./ai-analytics";

// Re-export commonly used types for convenience
export type {
  BaseMetric,
  AnalyticsEvent,
  MetricType,
  RiskLevel,
  ComplianceFramework,
  Currency,
  Frequency,
  AggregationType,
} from "./types/base-metrics";

export type {
  ClinicalKPI,
  PatientSafetyKPI,
  PatientOutcomeKPI,
  InfectionControlKPI,
  ClinicalCategory,
} from "./types/clinical-kpis";

export type {
  FinancialKPI,
  RevenueCycleKPI,
  InsuranceClaimsKPI,
  CostManagementKPI,
  ProfitabilityKPI,
  FinancialCategory,
  PaymentSource,
} from "./types/financial-kpis";

export type { IngestionAdapter } from "./adapters/ingestion-adapter";

export type {
  IngestionConfig,
  IngestionResult,
  IngestionEvent,
  ValidationRule,
  TransformationRule,
} from "./types/ingestion";

export type { ComputedKPIs, KPIComputationOptions } from "./aggregation";

// Main factory functions for easy metric creation
export {
  createMockMetric,
  createMockAnalyticsEvent,
  anonymizeMetric,
  validateMetricCompliance,
  aggregateMetrics,
} from "./types/base-metrics";

export {
  createPatientSafetyKPI,
  createPatientOutcomeKPI,
  calculateClinicalRiskScore,
  validateClinicalCompliance,
} from "./types/clinical-kpis";

export {
  createRevenueCycleKPI,
  createInsuranceClaimsKPI,
  calculateFinancialHealthScore,
  validateBrazilianFinancialCompliance,
  calculatePayerMixDiversity,
} from "./types/financial-kpis";

// Adapter implementations
export {
  BaseIngestionAdapter,
  DatabaseIngestionAdapter,
  APIIngestionAdapter,
} from "./adapters/ingestion-adapter";

// KPI computation functions
export { computeKPIs, createMockEvents } from "./aggregation";

/**
 * Analytics Module Constants
 */
export const ANALYTICS_CONSTANTS = {
  // Brazilian compliance frameworks
  COMPLIANCE_FRAMEWORKS: {
    LGPD: "Lei Geral de Proteção de Dados",
    ANVISA: "Agência Nacional de Vigilância Sanitária",
    CFM: "Conselho Federal de Medicina",
    ANS: "Agência Nacional de Saúde Suplementar",
    MINISTRY_OF_HEALTH: "Ministério da Saúde",
  },

  // Default metric configurations
  DEFAULT_METRIC_CONFIG: {
    frequency: "monthly" as const,
    aggregation: "average" as const,
    currency: "BRL" as const,
    complianceFrameworks: ["LGPD"] as const,
    riskLevel: "LOW" as const,
    status: "active" as const,
  },

  // Data quality thresholds
  QUALITY_THRESHOLDS: {
    EXCELLENT: 95,
    GOOD: 85,
    FAIR: 70,
    POOR: 50,
  },

  // Financial health score weights
  FINANCIAL_WEIGHTS: {
    revenue_cycle: 0.25,
    profitability: 0.2,
    accounts_receivable: 0.15,
    cost_management: 0.15,
    insurance_claims: 0.1,
    billing_efficiency: 0.05,
    cash_flow: 0.05,
    reimbursement: 0.03,
    cost_per_case: 0.02,
  },

  // Clinical quality dimensions
  CLINICAL_DIMENSIONS: {
    patient_safety: 0.3,
    quality_of_care: 0.25,
    patient_outcomes: 0.2,
    infection_control: 0.15,
    patient_satisfaction: 0.1,
  },

  // Ingestion configuration defaults
  INGESTION_DEFAULTS: {
    batchSize: 1000,
    retryAttempts: 3,
    timeout: 30000,
    bufferTime: 5000,
  },
} as const;

/**
 * Utility function to create a complete analytics configuration
 */
export function createAnalyticsConfig(options: {
  clinicId: string;
  complianceFrameworks?: string[];
  enableEncryption?: boolean;
  enableAnonymization?: boolean;
  retentionDays?: number;
}) {
  return {
    clinicId: options.clinicId,
    compliance: {
      frameworks: options.complianceFrameworks || ["LGPD"],
      encryption: options.enableEncryption ?? true,
      anonymization: options.enableAnonymization ?? true,
      retentionDays: options.retentionDays ?? 2555, // 7 years default
    },
    ingestion: {
      batchSize: ANALYTICS_CONSTANTS.INGESTION_DEFAULTS.batchSize,
      retryAttempts: ANALYTICS_CONSTANTS.INGESTION_DEFAULTS.retryAttempts,
      timeout: ANALYTICS_CONSTANTS.INGESTION_DEFAULTS.timeout,
    },
    quality: {
      thresholds: ANALYTICS_CONSTANTS.QUALITY_THRESHOLDS,
      monitoring: true,
      alerting: true,
    },
  };
}

/**
 * Version information
 */
export const ANALYTICS_VERSION = "1.0.0";
export const _ANALYTICS_MODULE_INFO = {
  name: "@neonpro/analytics",
  version: ANALYTICS_VERSION,
  description:
    "Healthcare analytics and metrics system for Brazilian compliance",
  compliance: ["LGPD", "ANVISA", "CFM", "ANS"],
  features: [
    "Clinical KPI tracking",
    "Financial metrics analysis",
    "Real-time data ingestion",
    "Compliance validation",
    "Data quality assessment",
    "Brazilian healthcare standards",
  ],
} as const;
