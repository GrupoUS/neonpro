/**
 * Compliance Utilities
 * Additional compliance-related functions and types
 */

import { ComplianceCheck, ComplianceStatus, ComplianceFramework } from './models/compliance-status'

// Export missing types
export const ComplianceIssueSchema = require('./models/compliance-status').ComplianceCheckSchema
export type ComplianceIssue = ComplianceCheck

// Mock implementations for missing functions
export const runComplianceCheck = async (
  _framework: ComplianceFramework,
  _environment: string = 'development'
): Promise<{
  passed: boolean;
  issues: ComplianceIssue[];
  score: number;
}> => {
  // Mock implementation - would integrate with actual compliance checking
  return {
    passed: true,
    issues: [],
    score: 100,
  }
}

export const getComplianceScore = (status: ComplianceStatus): number => {
  return status.overallScore
}

export const isComplianceReviewNeeded = (status: ComplianceStatus): boolean => {
  return status.overallScore < 85 ||
    status.lgpd.issues.length > 0 ||
    status.anvisa.issues.length > 0 ||
    status.cfm.issues.length > 0
}

// Performance metric types and functions
export const MetricType = {
  TTFB: 'ttfb',
  COLD_START: 'cold_start',
  CACHE_HIT_RATE: 'cache_hit_rate',
  BUILD_TIME: 'build_time',
} as const

export type MetricType = typeof MetricType[keyof typeof MetricType]

export const validateTTFBTarget = (ttfb: number, target: number = 150): boolean => {
  return ttfb <= target
}

export const validateColdStartTarget = (coldStarts: number, target: number = 5): boolean => {
  return coldStarts <= target
}

export const recordMetric = async (
  type: MetricType,
  value: number,
  metadata?: Record<string, unknown>
): Promise<void> => {
  // Mock implementation - would record to database
  console.log(`Recording metric ${type}: ${value}`, metadata)
}

export const getMetricsHistory = async (
  _type: MetricType,
  _limit: number = 10
): Promise<Array<{
  timestamp: Date;
  value: number;
  metadata?: Record<string, unknown>;
}>> => {
  // Mock implementation - would fetch from database
  return []
}

// Package manager functions
export const getPackageManagerConfigByPackageManager = async (
  packageManager: string
): Promise<{
  primary: string;
  version: string;
  lockFile: string;
  registry: string;
} | null> => {
  // Mock implementation - would fetch from database
  const configs = {
    bun: {
      primary: 'bun',
      version: '1.2.23',
      lockFile: 'bun.lockb',
      registry: 'https://registry.npmjs.org',
    },
    pnpm: {
      primary: 'pnpm',
      version: '8.15.0',
      lockFile: 'pnpm-lock.yaml',
      registry: 'https://registry.npmjs.org',
    },
    npm: {
      primary: 'npm',
      version: '10.2.0',
      lockFile: 'package-lock.json',
      registry: 'https://registry.npmjs.org',
    },
    yarn: {
      primary: 'yarn',
      version: '4.1.0',
      lockFile: 'yarn.lock',
      registry: 'https://registry.npmjs.org',
    },
  }

  return configs[packageManager as keyof typeof configs] || null
}
