/**
 * @neonpro/tools-shared - Shared Utilities for NeonPro Development Tools
 *
 * This package consolidates common functionality used across different tools
 * in the NeonPro monorepo to eliminate duplication and ensure consistency.
 *
 * Features:
 * - Unified logging system with constitutional compliance tracking
 * - Common utility functions for file operations, validation, and formatting
 * - Shared type definitions and interfaces
 * - Healthcare compliance patterns (LGPD, ANVISA, CFM)
 * - Performance monitoring and metrics collection
 */

// Import types needed for configurations
import { LogLevel } from './types';

// Export logger system
export * from './logger';

// Export utilities
export * from './utils';

// Export types
export * from './types';

// Version information
export const VERSION = '1.0.0';
export const PACKAGE_NAME = '@neonpro/tools-shared';

// Default configurations
export const DEFAULT_LOGGER_CONFIG = {
  level: LogLevel.INFO,
  format: 'pretty' as const,
  enableConsole: true,
  enableFile: true,
  enablePerformance: true,
  enableConstitutional: true,
};

export const HEALTHCARE_COMPLIANCE_STANDARDS = {
  LGPD: 'Lei Geral de Proteção de Dados',
  ANVISA: 'Agência Nacional de Vigilância Sanitária',
  CFM: 'Conselho Federal de Medicina',
  HIPAA: 'Health Insurance Portability and Accountability Act',
  GDPR: 'General Data Protection Regulation',
  ISO27001: 'ISO/IEC 27001 Information Security',
} as const;

export const QUALITY_THRESHOLDS = {
  MINIMUM_SCORE: 9.5,
  PERFORMANCE_THRESHOLD_CRITICAL: 100, // ms
  PERFORMANCE_THRESHOLD_HIGH: 200, // ms
  PERFORMANCE_THRESHOLD_MEDIUM: 500, // ms
  COVERAGE_THRESHOLD_CRITICAL: 95, // %
  COVERAGE_THRESHOLD_HIGH: 85, // %
  COVERAGE_THRESHOLD_MEDIUM: 75, // %
} as const;
