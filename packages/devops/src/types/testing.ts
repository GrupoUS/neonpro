/**
 * @fileoverview Testing Types for Healthcare DevOps
 * Story 05.01: Testing Infrastructure Consolidation
 */

export interface TestContext {
  testId: string;
  testName: string;
  startTime: Date;
  environment: "test" | "staging" | "production";
  healthcareCompliance: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}

export interface MockContext {
  mockServices: string[];
  mockData: Record<string, unknown>;
  cleanup: () => Promise<void>;
}

export interface HealthcareTestConfig {
  enableLGPDTests: boolean;
  enableANVISATests: boolean;
  enableCFMTests: boolean;
  enableE2ETests: boolean;
  enablePerformanceTests: boolean;
  enableSecurityTests: boolean;
  enableAccessibilityTests: boolean;
  qualityThreshold: number;
}

export interface TestMetrics {
  duration: number;
  coverage: number;
  score: number;
  compliance: ComplianceMetrics;
  performance: PerformanceMetrics;
}

export interface ComplianceMetrics {
  lgpd: {
    dataProtection: number;
    consent: number;
    minimization: number;
    overall: number;
  };
  anvisa: {
    medicalDevice: number;
    adverseEvents: number;
    procedures: number;
    overall: number;
  };
  cfm: {
    professionalLicense: number;
    ethics: number;
    telemedicine: number;
    overall: number;
  };
}

export interface PerformanceMetrics {
  loadTime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}
