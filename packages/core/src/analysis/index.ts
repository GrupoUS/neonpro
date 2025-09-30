// Analysis domain services for monorepo architectural analysis
// Healthcare compliance focused for Brazilian aesthetic clinics

export * from './services/jscpd-service.js';
export * from './types/jscpd-config.js';

// Re-exports for backward compatibility
export {
  JscpdService,
} from './services/jscpd-service.js';

export type {
  JscpdConfiguration,
  JscpdAnalysisResult,
  DuplicationCluster,
  RefactoringSuggestion,
  TokenBasedMetrics,
  StructuralMetrics,
  HealthcareMetrics,
  PerformanceMetrics,
} from './types/jscpd-config.js';