/**
 * Contract: DependencyAnalyzer Service
 * Purpose: Build dependency graphs and analyze import relationships
 * Generated: 2025-09-09
 */
// Default Configuration
export const DEFAULT_ANALYZER_OPTIONS = {
  followDynamicImports: true,
  includeTypeImports: true,
  maxTransitiveDepth: 10,
  detectCircularDependencies: true,
  supportedExtensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
};
// Performance Constraints
export const ANALYZER_PERFORMANCE_REQUIREMENTS = {
  /** Maximum analysis time for 10k files (ms) */
  MAX_ANALYSIS_TIME_10K_FILES: 45_000,
  /** Maximum memory usage during analysis (bytes) */
  MAX_MEMORY_USAGE: 750_000_000, // 750MB
  /** Maximum circular dependency detection time (ms) */
  MAX_CIRCULAR_DETECTION_TIME: 15_000,
};
// # sourceMappingURL=dependency-analyzer.contract.js.map
