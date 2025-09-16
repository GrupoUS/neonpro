/**
 * @neonpro/audit-tool - Consolidated Audit System
 *
 * Advanced audit tool combining monorepo analysis with Constitutional TDD compliance
 * for healthcare applications. Provides comprehensive code quality, architecture,
 * security, and compliance validation with multi-agent orchestration.
 */

// CLI components
export * from './cli';

// Version information
export const VERSION = '2.0.0';
export const PACKAGE_NAME = '@neonpro/audit-tool';

// Default audit configurations
export const DEFAULT_AUDIT_CONFIG = {
  depth: 3,
  parallel: true,
  healthcare: false,
  constitutional: false,
  performance: true,
  includePatterns: ['src/**/*.{ts,tsx,js,jsx}'],
  excludePatterns: ['**/*.test.ts', '**/*.spec.ts', '**/node_modules/**'],
};

export const HEALTHCARE_AUDIT_CONFIG = {
  ...DEFAULT_AUDIT_CONFIG,
  healthcare: true,
  constitutional: true,
  depth: 5,
  includeCompliance: ['LGPD', 'ANVISA', 'CFM'],
  auditTrail: true,
  encryption: true,
};

export const QUALITY_STANDARDS = {
  MINIMUM_SCORE: 9.5,
  CRITICAL_THRESHOLD: 9.8,
  PERFORMANCE_BUDGET: {
    CRITICAL: 100, // ms
    HIGH: 200, // ms
    MEDIUM: 500, // ms
  },
  COVERAGE_TARGETS: {
    CRITICAL: 95, // %
    HIGH: 85, // %
    MEDIUM: 75, // %
  },
} as const;

// Convenience functions
export async function quickAudit(options: any = {}) {
  const { executeQualityControlCommand } = await import('./cli');
  return executeQualityControlCommand('quick', options);
}

export async function constitutionalAudit(options: any = {}) {
  const { executeQualityControlCommand } = await import('./cli');
  return executeQualityControlCommand('constitutional', { healthcare: true, ...options });
}

export async function benchmarkAudit(options: any = {}) {
  const { executeQualityControlCommand } = await import('./cli');
  return executeQualityControlCommand('benchmark', options);
}