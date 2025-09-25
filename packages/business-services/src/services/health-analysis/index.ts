/**
 * Health Analysis Service - Index
 *
 * Export all health analysis related services and functions
 */

export { HealthAnalysisService } from './health-analysis-service'
export type {
  AIResponse,
  AnalysisStorage,
  HealthAnalysisPrompt,
  PatientAnalysisData,
} from './health-analysis-service'

// Export instance functions through the service class
// Individual functions are methods on HealthAnalysisService instance
