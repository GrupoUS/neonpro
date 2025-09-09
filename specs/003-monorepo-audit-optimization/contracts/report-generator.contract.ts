/**
 * Contract: ReportGenerator Service
 * Purpose: Generate comprehensive audit reports and metrics
 * Generated: 2025-09-09
 */

// Cross-contract imports
import type { FileInfo, ProblemFile, } from './file-scanner.contract'
import type { CircularDependency, } from './dependency-analyzer.contract'

// Core Types
export interface ReportOptions {
  /** Report format to generate */
  format: ReportFormat
  /** Sections to include in report */
  includeSections: ReportSection[]
  /** Level of detail */
  detailLevel: DetailLevel
  /** Whether to include visualizations */
  includeVisualizations: boolean
  /** Whether to include raw data */
  includeRawData: boolean
  /** Output file path */
  outputPath?: string
  /** Template to use for formatting */
  template?: string
}

export interface AuditReport {
  /** Unique report identifier */
  reportId: string
  /** Report generation timestamp */
  generatedAt: Date
  /** Audit execution summary */
  executionSummary: ExecutionSummary
  /** Monorepo analysis results */
  analysisResults: AnalysisResults
  /** Architecture compliance results */
  complianceResults: ComplianceResults
  /** Cleanup operations performed */
  cleanupResults: CleanupResults
  /** Performance metrics */
  performanceMetrics: PerformanceMetrics
  /** Recommendations for improvement */
  recommendations: RecommendationSection[]
  /** Before/after comparison */
  beforeAfterComparison: BeforeAfterComparison
}

export interface ExecutionSummary {
  /** Total execution time */
  totalExecutionTime: number
  /** Audit phases executed */
  phasesExecuted: AuditPhase[]
  /** Overall audit status */
  overallStatus: AuditStatus
  /** Configuration used */
  configurationUsed: Record<string, unknown>
  /** Errors encountered */
  errors: Array<{ message: string }>
  /** Warnings generated */
  warnings: Array<{ message: string }>
}

export interface AnalysisResults {
  /** File discovery results */
  fileDiscovery: FileDiscoveryResults
  /** Dependency analysis results */
  dependencyAnalysis: DependencyAnalysisResults
  /** Architecture validation results */
  architectureValidation: ArchitectureValidationResults
  /** Usage analysis results */
  usageAnalysis: UsageAnalysisResults
  /** Quality metrics */
  qualityMetrics: QualityMetrics
}

export interface ComplianceResults {
  /** Overall compliance score */
  overallScore: number
  /** Compliance by category */
  categoryScores: Record<string, CategoryScore>
  /** Top violations */
  topViolations: ViolationSummary[]
  /** Trend analysis */
  trends: ComplianceTrend[]
  /** Framework-specific compliance */
  frameworkCompliance: FrameworkCompliance
}

export interface CleanupResults {
  /** Actions planned */
  actionsPlanned: number
  /** Actions executed */
  actionsExecuted: number
  /** Actions failed */
  actionsFailed: number
  /** Space reclaimed */
  spaceReclaimed: number
  /** Files removed */
  filesRemoved: number
  /** Cleanup summary by type */
  cleanupByType: Record<string, CleanupTypeResults>
  /** Risk mitigation results */
  riskMitigation: RiskMitigationResults
}

// Enumerations
export type ReportFormat =
  | 'html'
  | 'markdown'
  | 'json'
  | 'pdf'
  | 'csv'
  | 'xml'
  | 'yaml'

export type ReportSection =
  | 'executive_summary'
  | 'file_analysis'
  | 'dependency_graph'
  | 'architecture_compliance'
  | 'cleanup_operations'
  | 'performance_metrics'
  | 'recommendations'
  | 'technical_details'
  | 'appendices'

export type DetailLevel = 'minimal' | 'standard' | 'detailed' | 'comprehensive'

export type AuditStatus = 'successful' | 'completed_with_warnings' | 'failed' | 'partial'

export type AuditPhase =
  | 'initialization'
  | 'file_scanning'
  | 'dependency_analysis'
  | 'architecture_validation'
  | 'usage_analysis'
  | 'cleanup_planning'
  | 'cleanup_execution'
  | 'report_generation'

// Supporting Types
export interface FileDiscoveryResults {
  /** Total files found */
  totalFilesFound: number
  /** Files by type */
  filesByType: Record<string, number>
  /** Files by location */
  filesByLocation: Record<string, number>
  /** Largest files */
  largestFiles: FileInfo[]
  /** Recently modified files */
  recentlyModified: FileInfo[]
  /** Files with issues */
  problemFiles: ProblemFile[]
}

export interface FileInfo {
  path: string
  size: number
  modifiedAt: Date
}

export interface ProblemFile {
  path: string
  reason: string
}

export interface DependencyAnalysisResults {
  /** Total dependencies found */
  totalDependencies: number
  /** Circular dependencies */
  circularDependencies: CircularDependencyInfo[]
  /** Unused dependencies */
  unusedDependencies: string[]
  /** Dependency depth statistics */
  depthStatistics: DepthStatistics
  /** Import/export analysis */
  importExportAnalysis: ImportExportAnalysis
  /** External dependencies */
  externalDependencies: ExternalDependencyInfo[]
}

export interface CircularDependencyInfo {
  nodes: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export interface DepthStatistics {
  maxDepth: number
  avgDepth: number
}

export interface ImportExportAnalysis {
  totalImports: number
  totalExports: number
}

export interface ExternalDependencyInfo {
  name: string
  version: string
  usageCount: number
}

export interface ArchitectureValidationResults {
  /** Rules evaluated */
  rulesEvaluated: number
  /** Rules passed */
  rulesPassed: number
  /** Rules failed */
  rulesFailed: number
  /** Violations by category */
  violationsByCategory: Record<string, number>
  /** Violations by severity */
  violationsBySeverity: Record<string, number>
  /** Auto-fixable violations */
  autoFixableViolations: number
}

export interface UsageAnalysisResults {
  /** Files marked as unused */
  unusedFiles: string[]
  /** Files marked as orphaned */
  orphanedFiles: string[]
  /** Files marked as redundant */
  redundantFiles: string[]
  /** Usage patterns identified */
  usagePatterns: UsagePattern[]
  /** Dead code analysis */
  deadCodeAnalysis: DeadCodeAnalysis
}

export interface QualityMetrics {
  /** Code complexity metrics */
  complexity: ComplexityMetrics
  /** Maintainability index */
  maintainability: MaintainabilityMetrics
  /** Test coverage metrics */
  testCoverage: TestCoverageMetrics
  /** Documentation coverage */
  documentationCoverage: DocumentationMetrics
}

export interface CategoryScore {
  /** Score (0-100) */
  score: number
  /** Total rules in category */
  totalRules: number
  /** Passing rules */
  passingRules: number
  /** Most common violations */
  commonViolations: string[]
}

export interface ViolationSummary {
  /** Rule identifier */
  ruleId: string
  /** Rule name */
  ruleName: string
  /** Violation count */
  violationCount: number
  /** Files affected */
  filesAffected: number
  /** Severity */
  severity: string
}

export interface ComplianceTrend {
  /** Category or rule */
  category: string
  /** Historical scores */
  historicalScores: TrendPoint[]
  /** Trend direction */
  direction: 'improving' | 'declining' | 'stable'
}

export interface TrendPoint {
  /** Timestamp */
  timestamp: Date
  /** Score at that time */
  score: number
}

export interface FrameworkCompliance {
  /** Turborepo compliance */
  turborepo: FrameworkScore
  /** Hono compliance */
  hono: FrameworkScore
  /** TanStack Router compliance */
  tanstackRouter: FrameworkScore
}

export interface FrameworkScore {
  /** Compliance score */
  score: number
  /** Patterns validated */
  patternsValidated: number
  /** Common issues */
  commonIssues: string[]
}

export interface CleanupTypeResults {
  /** Files affected */
  filesAffected: number
  /** Success rate */
  successRate: number
  /** Space saved */
  spaceSaved: number
  /** Time taken */
  timeTaken: number
}

export interface RiskMitigationResults {
  /** High-risk actions handled */
  highRiskActionsHandled: number
  /** Risk mitigations applied */
  mitigationsApplied: string[]
  /** Remaining risks */
  remainingRisks: RemainingRisk[]
}

export interface RemainingRisk {
  /** Risk description */
  description: string
  /** Risk level */
  level: 'low' | 'medium' | 'high' | 'critical'
  /** Recommended action */
  recommendedAction: string
}

export interface BeforeAfterComparison {
  /** Repository metrics before */
  before: RepositoryMetrics
  /** Repository metrics after */
  after: RepositoryMetrics
  /** Improvement metrics */
  improvements: ImprovementMetrics
}

export interface RepositoryMetrics {
  /** Total files */
  totalFiles: number
  /** Total size in bytes */
  totalSize: number
  /** Lines of code */
  linesOfCode: number
  /** Number of packages */
  packageCount: number
  /** Dependency count */
  dependencyCount: number
  /** Circular dependencies */
  circularDependencies: number
  /** Architecture violations */
  architectureViolations: number
}

export interface ImprovementMetrics {
  /** Files removed */
  filesRemoved: number
  /** Size reduction */
  sizeReduction: number
  /** Size reduction percentage */
  sizeReductionPercentage: number
  /** Complexity reduction */
  complexityReduction: number
  /** Violations fixed */
  violationsFixed: number
}

export interface PerformanceMetrics {
  /** Phase execution times */
  phaseExecutionTimes: Record<AuditPhase, number>
  /** Memory usage statistics */
  memoryUsage: MemoryUsageMetrics
  /** I/O statistics */
  ioStatistics: IOStatistics
  /** Throughput metrics */
  throughputMetrics: ThroughputMetrics
}

export interface MemoryUsageMetrics {
  /** Peak memory usage */
  peakUsage: number
  /** Average memory usage */
  averageUsage: number
  /** Memory usage by phase */
  usageByPhase: Record<AuditPhase, number>
}

export interface IOStatistics {
  /** Files read */
  filesRead: number
  /** Files written */
  filesWritten: number
  /** Bytes read */
  bytesRead: number
  /** Bytes written */
  bytesWritten: number
  /** I/O operations per second */
  iopsAverage: number
}

export interface ThroughputMetrics {
  /** Files processed per second */
  filesPerSecond: number
  /** Lines analyzed per second */
  linesPerSecond: number
  /** Dependencies analyzed per second */
  dependenciesPerSecond: number
}

export interface RecommendationSection {
  /** Recommendation category */
  category: string
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical'
  /** Recommendations list */
  recommendations: Recommendation[]
}

export interface Recommendation {
  /** Recommendation title */
  title: string
  /** Detailed description */
  description: string
  /** Expected benefit */
  expectedBenefit: string
  /** Implementation effort */
  implementationEffort: 'low' | 'medium' | 'high'
  /** Affected areas */
  affectedAreas: string[]
  /** Priority score */
  priorityScore: number
}

// Service Interface
export interface IReportGenerator {
  /**
   * Generate comprehensive audit report
   * @param auditData All audit results and metrics
   * @param options Report generation options
   * @returns Promise resolving to generated report
   */
  generateAuditReport(auditData: AuditData, options: ReportOptions,): Promise<GeneratedReport>

  /**
   * Generate executive summary
   * @param auditData Audit results
   * @returns Promise resolving to executive summary
   */
  generateExecutiveSummary(auditData: AuditData,): Promise<ExecutiveSummary>

  /**
   * Generate technical report
   * @param auditData Audit results
   * @param options Technical report options
   * @returns Promise resolving to technical report
   */
  generateTechnicalReport(
    auditData: AuditData,
    options: TechnicalReportOptions,
  ): Promise<TechnicalReport>

  /**
   * Generate comparison report
   * @param beforeData Previous audit data
   * @param afterData Current audit data
   * @returns Promise resolving to comparison report
   */
  generateComparisonReport(beforeData: AuditData, afterData: AuditData,): Promise<ComparisonReport>

  /**
   * Export report in specified format
   * @param report Generated report
   * @param format Target format
   * @param outputPath Output file path
   * @returns Promise resolving when export complete
   */
  exportReport(report: GeneratedReport, format: ReportFormat, outputPath: string,): Promise<void>

  /**
   * Generate metrics dashboard
   * @param auditData Audit results
   * @returns Promise resolving to dashboard HTML
   */
  generateDashboard(auditData: AuditData,): Promise<string>

  /**
   * Create report template
   * @param templateName Template identifier
   * @param templateConfig Template configuration
   * @returns Promise resolving to created template
   */
  createTemplate(templateName: string, templateConfig: ReportTemplate,): Promise<void>
}

export interface AuditData {
  /** File scan results */
  fileResults: any
  /** Dependency analysis results */
  dependencyResults: any
  /** Architecture validation results */
  architectureResults: any
  /** Cleanup execution results */
  cleanupResults: any
  /** Performance metrics */
  performanceMetrics: PerformanceMetrics
}

export interface GeneratedReport {
  /** Report metadata */
  metadata: ReportMetadata
  /** Report content */
  content: string
  /** Attachments/supplementary files */
  attachments: ReportAttachment[]
}

export interface ReportMetadata {
  /** Report ID */
  reportId: string
  /** Generation timestamp */
  generatedAt: Date
  /** Report format */
  format: ReportFormat
  /** Report size in bytes */
  size: number
  /** Generation time in ms */
  generationTime: number
}

export interface ReportAttachment {
  /** Attachment name */
  name: string
  /** Attachment type */
  type: 'data' | 'chart' | 'log' | 'raw_data'
  /** Content or file path */
  content: string
  /** Size in bytes */
  size: number
}

export interface ExecutiveSummary {
  /** Overall assessment */
  overallAssessment: string
  /** Key findings */
  keyFindings: string[]
  /** Recommendations */
  topRecommendations: string[]
  /** Metrics summary */
  metricsSummary: Record<string, number>
}

export interface TechnicalReport {
  /** Detailed findings */
  detailedFindings: any
  /** Technical metrics */
  technicalMetrics: any
  /** Implementation details */
  implementationDetails: any
}

export interface TechnicalReportOptions {
  /** Include code samples */
  includeCodeSamples: boolean
  /** Include dependency graphs */
  includeDependencyGraphs: boolean
  /** Include performance details */
  includePerformanceDetails: boolean
}

export interface ComparisonReport {
  /** Before snapshot */
  before: RepositorySnapshot
  /** After snapshot */
  after: RepositorySnapshot
  /** Changes summary */
  changesSummary: ChangesSummary
}

export interface RepositorySnapshot {
  /** Snapshot timestamp */
  timestamp: Date
  /** Repository metrics */
  metrics: RepositoryMetrics
  /** Issues found */
  issues: IssueSnapshot[]
}

export interface IssueSnapshot {
  /** Issue category */
  category: string
  /** Issue count */
  count: number
  /** Severity breakdown */
  severityBreakdown: Record<string, number>
}

export interface ChangesSummary {
  /** Issues resolved */
  issuesResolved: number
  /** Issues introduced */
  issuesIntroduced: number
  /** Net improvement */
  netImprovement: number
  /** Key changes */
  keyChanges: string[]
}

export interface ReportTemplate {
  /** Template sections */
  sections: TemplateSection[]
  /** Styling configuration */
  styling: StylingConfig
  /** Output format options */
  formatOptions: FormatOptions
}

export interface TemplateSection {
  /** Section name */
  name: string
  /** Section template */
  template: string
  /** Whether section is required */
  required: boolean
  /** Section order */
  order: number
}

export interface StylingConfig {
  /** CSS styles */
  css?: string
  /** Color scheme */
  colorScheme?: string
  /** Font configuration */
  fonts?: FontConfig
}

export interface FontConfig {
  /** Primary font family */
  primary: string
  /** Monospace font family */
  monospace: string
  /** Font sizes */
  sizes: Record<string, string>
}

export interface FormatOptions {
  /** Include table of contents */
  includeTableOfContents: boolean
  /** Include page numbers */
  includePageNumbers: boolean
  /** Include timestamps */
  includeTimestamps: boolean
}

// Contract Tests Requirements
export interface ReportGeneratorContractTests {
  /** Test basic report generation */
  testBasicReportGeneration(): Promise<void>

  /** Test multiple format exports */
  testMultipleFormatExports(): Promise<void>

  /** Test executive summary creation */
  testExecutiveSummaryCreation(): Promise<void>

  /** Test comparison report generation */
  testComparisonReportGeneration(): Promise<void>

  /** Test dashboard generation */
  testDashboardGeneration(): Promise<void>

  /** Test custom template creation */
  testCustomTemplateCreation(): Promise<void>

  /** Test large dataset handling */
  testLargeDatasetHandling(): Promise<void>

  /** Test report validation */
  testReportValidation(): Promise<void>
}

// Default Configuration
export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
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
} as const
