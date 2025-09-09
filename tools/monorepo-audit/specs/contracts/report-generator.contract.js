/**
 * Contract: ReportGenerator Service
 * Purpose: Generate comprehensive audit reports and metrics
 * Generated: 2025-09-09
 */
// Default Configuration
export const DEFAULT_REPORT_OPTIONS = {
  format: 'html',
  includeSections: [
    'executive_summary',
    'file_analysis',
    'dependency_graph',
    'architecture_compliance',
    'cleanup_operations',
    'recommendations',
  ],
  detailLevel: 'standard',
  includeVisualizations: true,
  includeRawData: false,
}
// Performance Constraints
export const REPORT_PERFORMANCE_REQUIREMENTS = {
  /** Maximum report generation time (ms) */
  MAX_GENERATION_TIME: 30_000,
  /** Maximum memory usage during generation (bytes) */
  MAX_MEMORY_USAGE: 200_000_000, // 200MB
  /** Maximum report size (bytes) */
  MAX_REPORT_SIZE: 50_000_000, // 50MB
}
// # sourceMappingURL=report-generator.contract.js.map
