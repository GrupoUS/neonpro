export * from "./realtime/realtime-manager";
export * from "./resilience/index";
export * from "./services/AIService";
export * from "./services/health-analysis/index";
export * from "./services/ai-service-management";
export * from "./services/ai-clinical-decision-support";
export * from "./services/governance/index";

// Phase 4 Compliance & Audit Module
export * from "./audit/index";

// Error handling utilities
export * from "./errors/map";

// Phase 4 Analytics Module - selective exports to avoid conflicts
export type {
  BaseMetric,
  AnalyticsEvent,
  MetricType,
  Currency,
  Frequency,
  AggregationType,
  ClinicalKPI,
  PatientSafetyKPI,
  PatientOutcomeKPI,
  InfectionControlKPI,
  ClinicalCategory,
  FinancialKPI,
  RevenueCycleKPI,
  InsuranceClaimsKPI,
  CostManagementKPI,
  ProfitabilityKPI,
  FinancialCategory,
  PaymentSource,
  IngestionAdapter,
  IngestionConfig,
  IngestionResult,
  IngestionEvent,
  ValidationRule,
  TransformationRule,
} from "./analytics/index";

export {
  createMockMetric,
  createMockAnalyticsEvent,
  anonymizeMetric,
  validateMetricCompliance,
  aggregateMetrics,
  createPatientSafetyKPI,
  createPatientOutcomeKPI,
  calculateClinicalRiskScore,
  validateClinicalCompliance,
  createRevenueCycleKPI,
  createInsuranceClaimsKPI,
  calculateFinancialHealthScore,
  validateBrazilianFinancialCompliance,
  calculatePayerMixDiversity,
  BaseIngestionAdapter,
  DatabaseIngestionAdapter,
  APIIngestionAdapter,
  ANALYTICS_CONSTANTS,
  createAnalyticsConfig,
  ANALYTICS_VERSION,
  ANALYTICS_MODULE_INFO,
} from "./analytics/index";

// Phase 1 AI Chat models/services
export * from "./models/chat-session";
export * from "./models/chat-message";
export * from "./models/audit-event";
export * from "./services/rate-counter";
export * from "./services/pii-redaction";
export * from "./services/ai-provider";
export * from "./services/openai-provider";
export * from "./services/anthropic-provider";
export * from "./services/google-provider";
export * from "./services/ai-provider-factory";
export * from "./services/consent-validation";
export * from "./services/chat-service";

// Enhanced AI Usage Counter models/services (T017)
export * from "./models/usage-counter";
export * from "./models/plan";
export * from "./models/recommendation";
export * from "./models/user-plan";
export * from "./usage/repository";

// Enhanced AI Abuse Window Tracker (T018)
export * from "./usage/abuseWindow";
