export * from './realtime/realtime-manager.js';
export * from './resilience/index.js';
export * from './services/AIService.js';
export * from './services/health-analysis/index.js';
export * from './services/ai-service-management.js';
export * from './services/governance/index.js';

// Phase 4 Compliance & Audit Module
export * from './audit/index.js';

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
  TransformationRule
} from './analytics/index.js';

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
  ANALYTICS_MODULE_INFO
} from './analytics/index.js';

// Phase 1 AI Chat models/services
export * from './models/chat-session.js';
export * from './models/chat-message.js';
export * from './models/audit-event.js';
export * from './services/rate-counter.js';
export * from './services/pii-redaction.js';
export * from './services/ai-provider.js';
export * from './services/openai-provider.js';
export * from './services/anthropic-provider.js';
export * from './services/google-provider.js';
export * from './services/ai-provider-factory.js';
export * from './services/consent-validation.js';
export * from './services/chat-service.js';

// Enhanced AI Usage Counter models/services (T017)
export * from './models/usage-counter.js';
export * from './models/plan.js';
export * from './models/recommendation.js';
export * from './models/user-plan.js';
export * from './usage/repository.js';

// Enhanced AI Abuse Window Tracker (T018)
export * from './usage/abuseWindow.js';