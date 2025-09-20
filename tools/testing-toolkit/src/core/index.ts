/**
 * Core Testing Utilities
 *
 * Essential testing functions and configurations that form the foundation
 * of the NeonPro testing toolkit.
 */

export * from './quality-gates';
export * from './setup';
export * from './tdd-cycle';
export * from './tdd-orchestrator';
export * from './test-runner';
export * from './types';

// Core testing patterns
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  COMPLIANCE: 'compliance',
} as const;

export const COVERAGE_THRESHOLDS = {
  CRITICAL: 95,
  IMPORTANT: 85,
  USEFUL: 75,
} as const;

export const TEST_ENVIRONMENTS = {
  JSDOM: 'jsdom',
  NODE: 'node',
  HAPPY_DOM: 'happy-dom',
} as const;
