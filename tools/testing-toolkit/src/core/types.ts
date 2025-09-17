/**
 * Core Testing Types
 *
 * Type definitions for the core testing functionality.
 */

export type TestCategory =
  | 'unit'
  | 'integration'
  | 'e2e'
  | 'security'
  | 'performance'
  | 'compliance';

export type TestEnvironment = 'jsdom' | 'node' | 'happy-dom';

export type CoverageThreshold = 'critical' | 'important' | 'useful';

export interface TestConfig {
  category: TestCategory;
  environment: TestEnvironment;
  timeout?: number;
  retries?: number;
  coverage?: {
    threshold: CoverageThreshold;
    minimum: number;
  };
}

export interface TestResult {
  name: string;
  category: TestCategory;
  passed: boolean;
  duration: number;
  coverage?: number;
  errors?: string[];
  warnings?: string[];
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  totalDuration: number;
  passRate: number;
  coverageRate: number;
}

export interface QualityGateResult {
  gate: string;
  passed: boolean;
  actual: number;
  expected: number;
  critical: boolean;
}
