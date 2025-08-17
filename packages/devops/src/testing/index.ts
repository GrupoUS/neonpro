/**
 * @fileoverview Healthcare Testing Framework
 * @description Constitutional Healthcare Testing Utilities with ≥95% Coverage Requirement
 * @compliance LGPD + ANVISA + CFM + Medical Accuracy Validation
 * @quality ≥9.9/10 Healthcare Excellence Standard
 */

// Healthcare-specific test utilities and frameworks
export * from './healthcare-test-utils';
export * from './compliance-testing';
export * from './medical-accuracy-testing';
export * from './patient-privacy-testing';
export * from './performance-testing';
export * from './accessibility-testing';
export * from './security-testing';
export * from './e2e-healthcare-testing';

// Re-export key testing utilities for easy access
export {
  generateTestPatient,
  generateTestUser,
  renderWithHealthcareContext,
  createMockSupabaseClient
} from './healthcare-test-utils';

export {
  LGPDComplianceValidator,
  ANVISAComplianceValidator,
  CFMComplianceValidator,
  HealthcareComplianceTestSuite
} from './compliance-testing';

export { MedicalAccuracyValidator } from './medical-accuracy-testing';
export { PatientPrivacyValidator } from './patient-privacy-testing';
export { HealthcarePerformanceValidator } from './performance-testing';
export { HealthcareAccessibilityValidator } from './accessibility-testing';
export { HealthcareSecurityValidator } from './security-testing';
export { HealthcareE2EValidator } from './e2e-healthcare-testing';

// Re-export types for TypeScript support
export type {
  HealthcareTestUser,
  MedicalAccuracyMetrics,
  MedicalAccuracyTestResult,
  PrivacyTestResult,
  HealthcarePerformanceMetrics,
  PerformanceTestResult,
  AccessibilityTestResult,
  AccessibilityViolation,
  SecurityTestResult,
  SecurityVulnerability,
  HealthcareE2EResult,
  HealthcareE2EConfig
} from './healthcare-test-utils';

/**
 * Healthcare Testing Configuration
 */
export const HEALTHCARE_TESTING_CONFIG = {
  // Coverage Requirements (Constitutional Healthcare Override)
  coverage: {
    required: 95, // ≥95% coverage requirement
    critical: 100, // 100% for critical healthcare paths
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95
  },
  
  // Medical Accuracy Requirements
  medicalAccuracy: {
    aiFeatures: 95, // ≥95% accuracy for AI features
    predictions: 95, // ≥95% for treatment predictions
    riskAssessment: 98, // ≥98% for patient risk assessment
    scheduling: 90, // ≥90% for intelligent scheduling
    recommendations: 95 // ≥95% for follow-up recommendations
  },
  
  // Performance SLA Requirements
  performance: {
    apiResponseTime: 200, // ≤200ms for healthcare APIs
    pageLoadTime: 2000, // ≤2s for patient interfaces
    databaseQueryTime: 50, // ≤50ms for patient data queries
    criticalOperations: 100, // ≤100ms for critical healthcare operations
    patientSafetyOperations: 50 // ≤50ms for patient safety features
  },
  
  // Compliance Validation
  compliance: {
    lgpd: true, // LGPD compliance validation required
    anvisa: true, // ANVISA compliance validation required
    cfm: true, // CFM compliance validation required
    accessibility: 'WCAG 2.1 AA+', // Accessibility compliance required
    security: 'Healthcare-grade', // Healthcare-grade security testing
    privacy: 'Constitutional' // Constitutional privacy protection
  }
} as const;

export type HealthcareTestingConfig = typeof HEALTHCARE_TESTING_CONFIG;