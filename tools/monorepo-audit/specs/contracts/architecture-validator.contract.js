/**
 * Contract: ArchitectureValidator Service
 * Purpose: Validate code assets against architectural documentation and standards
 * Generated: 2025-09-09
 */
// Default Configuration
export const DEFAULT_VALIDATION_OPTIONS = {
  documentPaths: ['docs/architecture/source-tree.md', 'docs/architecture/tech-stack.md',],
  validateTurborepoStandards: true,
  validateHonoPatterns: true,
  validateTanStackRouterPatterns: true,
  includeSeverities: ['error', 'warning',],
  suggestAutoFixes: true,
}
// Performance Constraints
export const VALIDATION_PERFORMANCE_REQUIREMENTS = {
  /** Maximum validation time for 10k files (ms) */
  MAX_VALIDATION_TIME_10K_FILES: 60_000,
  /** Maximum memory usage during validation (bytes) */
  MAX_MEMORY_USAGE: 400_000_000, // 400MB
  /** Maximum document parsing time (ms) */
  MAX_DOCUMENT_PARSING_TIME: 5000,
}
// # sourceMappingURL=architecture-validator.contract.js.map
