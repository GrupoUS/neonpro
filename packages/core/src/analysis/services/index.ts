/**
 * Analysis Services Index
 * Centralized exports for all analysis services
 */

export { ReportGenerator } from './report-generator'
export type { ReportOptions, GeneratedReport } from './report-generator'

export { VisualizationService } from './visualization-service'
export type { VisualizationOptions, GeneratedVisualization } from './visualization-service'

// Re-export existing services
export { JSCPDService } from './jscpd-service'
export { PackageAnalyzer } from './package-analyzer'
export { AnalysisOrchestrator } from './analysis-orchestrator'