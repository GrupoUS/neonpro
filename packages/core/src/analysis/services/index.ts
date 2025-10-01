/**
 * Analysis Services Index
 * Centralized exports for all analysis services
 */

export { ReportGenerator, SimpleReportGenerator } from './report-generator'
export type { GeneratedReport, ReportOptions } from './report-generator'

export { VisualizationService } from './visualization-service'
export type { GeneratedVisualization, VisualizationOptions } from './visualization-service'

// Re-export existing services
export { JscpdService, JscpdService as JSCPDService } from './jscpd-service'

export { AnalysisOrchestrator } from './analysis-orchestrator'

// NOTE: removed invalid re-export of `PackageAnalyzer` because
// ./package-analyzer does not export a member named `PackageAnalyzer`.
// If ./package-analyzer exposes a different name (or a default export),
// re-export that correct symbol here, e.g.:
//   export { CorrectName } from './package-analyzer'
// or
//   export { default as PackageAnalyzer } from './package-analyzer'
