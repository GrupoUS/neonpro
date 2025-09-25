// Observability Package
// Unified monitoring, analytics, logging, and observability stack

// Monitoring & Metrics
export * from './monitoring'

// Analytics & Business Intelligence
export * from './analytics'

// Main observability initialization
export { initializeMonitoring } from './monitoring/init'

// Types
export type {
  HealthStatus,
  LogLevel,
  MetricLabels,
  MetricValue,
  PerformanceMetrics,
  TraceAttributes,
} from './monitoring/types'

// Analytics types and utilities
export {
  aggregateMetrics,
  anonymizeMetric,
  createMockAnalyticsEvent,
  createMockMetric,
  validateMetricCompliance,
} from './analytics/types/base-metrics'

export {
  calculateClinicalRiskScore,
  createPatientOutcomeKPI,
  createPatientSafetyKPI,
  validateClinicalCompliance,
} from './analytics/types/clinical-kpis'

export {
  calculateFinancialHealthScore,
  calculatePayerMixDiversity,
  createInsuranceClaimsKPI,
  createRevenueCycleKPI,
  validateBrazilianFinancialCompliance,
} from './analytics/types/financial-kpis'

export { computeKPIs, createMockEvents } from './analytics/aggregation'

// Analytics configuration
export { createAnalyticsConfig } from './analytics'

// Analytics constants
export const ANALYTICS_CONSTANTS = {
  COMPLIANCE_FRAMEWORKS: {
    LGPD: 'Lei Geral de Proteção de Dados',
    ANVISA: 'Agência Nacional de Vigilância Sanitária',
    CFM: 'Conselho Federal de Medicina',
    ANS: 'Agência Nacional de Saúde Suplementar',
    MINISTRY_OF_HEALTH: 'Ministério da Saúde',
  },
}