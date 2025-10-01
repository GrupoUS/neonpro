export interface MonorepoAnalysisContext {
  projectRoot: string
  analysisMode: string
  thresholds: Record<string, number>
}
