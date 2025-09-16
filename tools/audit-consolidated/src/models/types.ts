/**
 * Core Types and Enums for Monorepo Audit System
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

// =============================================================================
// Asset Types and Enums
// =============================================================================

export enum AssetType {
  COMPONENT = 'component',
  ROUTE = 'route',
  SERVICE = 'service',
  UTILITY = 'utility',
  TEST = 'test',
  CONFIG = 'config',
  DOCUMENTATION = 'documentation',
  TYPES = 'types',
  UNKNOWN = 'unknown',
}

export enum UsageStatus {
  ACTIVE = 'active', // Referenced by other code
  UNUSED = 'unused', // Not referenced anywhere
  ORPHANED = 'orphaned', // Dependencies missing
  REDUNDANT = 'redundant', // Duplicate functionality
  TEMPORARY = 'temporary', // Temp/backup files
  UNKNOWN = 'unknown', // Status not yet determined
}

export enum ComplianceStatus {
  COMPLIES = 'complies',
  VIOLATES = 'violates',
  UNKNOWN = 'unknown',
}

// =============================================================================
// Dependency Graph Types and Enums
// =============================================================================

export enum DependencyType {
  ES6_IMPORT = 'es6_import',
  COMMONJS_REQUIRE = 'commonjs_require',
  DYNAMIC_IMPORT = 'dynamic_import',
  ROUTE_REFERENCE = 'route_reference',
  TYPE_REFERENCE = 'type_reference',
  ASSET_REFERENCE = 'asset_reference',
}

export enum CircularSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// =============================================================================
// Architecture Document Types and Enums
// =============================================================================

export enum DocumentType {
  SOURCE_TREE = 'source_tree',
  TECH_STACK = 'tech_stack',
}

export enum RuleSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

// =============================================================================
// Audit Report Types and Enums
// =============================================================================

export enum FindingType {
  UNUSED_FILE = 'unused_file',
  ORPHANED_DEPENDENCY = 'orphaned_dependency',
  REDUNDANT_CODE = 'redundant_code',
  ARCHITECTURE_VIOLATION = 'architecture_violation',
  ROUTING_ISSUE = 'routing_issue',
  CIRCULAR_DEPENDENCY = 'circular_dependency',
}
export enum FindingSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

// =============================================================================
// Cleanup Action Types and Enums
// =============================================================================

export enum ActionType {
  DELETE_FILE = 'delete_file',
  DELETE_DIRECTORY = 'delete_directory',
  MOVE_FILE = 'move_file',
  MODIFY_FILE = 'modify_file',
  CREATE_BACKUP = 'create_backup',
}

export enum ActionStatus {
  PLANNED = 'planned',
  EXECUTING = 'executing',
  EXECUTED = 'executed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// =============================================================================
// Common Interface Types
// =============================================================================

export interface CodeLocation {
  file: string;
  line: number;
  column: number;
  context: string;
}

export interface AssetMetadata {
  [key: string]: unknown;
  /** Package name if asset belongs to workspace package */
  packageName?: string;
  /** Directory location classification */
  location: 'apps' | 'packages' | 'root' | 'other';
  /** Line count for code files */
  lineCount?: number;
  /** File content hash for change detection */
  contentHash?: string;
  /** Import statements found in file */
  imports?: string[];
  /** Export statements found in file */
  exports?: string[];
}

export interface ArchitectureViolation {
  ruleId: string;
  description: string;
  location: CodeLocation;
  severity: RuleSeverity;
  suggestedFix: string | null;
}

export interface GraphNode {
  assetPath: string;
  incomingEdges: string[];
  outgoingEdges: string[];
  layer: string;
  importance: number; // 0-100 calculated importance score
}

export interface GraphEdge {
  from: string;
  to: string;
  type: DependencyType;
  isStatic: boolean;
  line: number;
}

export interface GraphLayer {
  name: string;
  assets: string[];
  dependencies: string[];
}

export interface CircularDependency {
  cycle: string[];
  severity: CircularSeverity;
  resolution: ResolutionStrategy[];
}

export interface ResolutionStrategy {
  type: 'extract_common' | 'invert_dependency' | 'split_module' | 'remove_dependency';
  description: string;
  effort: 'low' | 'medium' | 'high';
  risk: RiskLevel;
} // =============================================================================
// Architecture Document Interface Types
// =============================================================================

export interface ArchitectureStandard {
  name: string;
  description: string;
  scope: string[];
  required: boolean;
  examples: string[];
}

export interface ValidationRule {
  id: string;
  pattern: string;
  requirement: string;
  severity: RuleSeverity;
  category: string;
}

export interface RuleException {
  ruleId: string;
  reason: string;
  appliesTo: string[];
  expiresAt?: Date;
}

// =============================================================================
// Audit Report Interface Types
// =============================================================================

export interface AuditSummary {
  totalFilesScanned: number;
  unusedFilesFound: number;
  orphanedFilesFound: number;
  redundantFilesFound: number;
  violationsFound: number;
  filesRemoved: number;
  spaceReclaimed: number;
}

export interface AuditFinding {
  type: FindingType;
  severity: FindingSeverity;
  description: string;
  affectedFiles: string[];
  recommendation: string;
  autoFixable: boolean;
}

export interface AuditWarning {
  type: string;
  message: string;
  file?: string;
  critical: boolean;
}

export interface OptimizationMetrics {
  beforeMetrics: RepositoryMetrics;
  afterMetrics: RepositoryMetrics;
  improvement: ImprovementMetrics;
}

export interface RepositoryMetrics {
  totalFiles: number;
  totalSize: number;
  dependencyCount: number;
  circularDependencies: number;
  complianceScore: number;
  testCoverage?: number;
}

export interface ImprovementMetrics {
  filesReduced: number;
  sizeReduced: number;
  dependenciesOptimized: number;
  violationsResolved: number;
  complianceImproved: number;
}

export interface RollbackInformation {
  backupPath: string;
  affectedFiles: string[];
  originalState: RepositoryMetrics;
  rollbackScript: string;
  timestamp: Date;
}

// =============================================================================
// Cleanup Action Interface Types
// =============================================================================

export interface ImpactAssessment {
  affectedFiles: string[];
  brokenReferences: string[];
  riskLevel: RiskLevel;
  requiresManualReview: boolean;
  maintainability: number;
  estimatedSavings?: {
    files: number;
    size: number;
    dependencies: number;
  };
}

// =============================================================================
// Missing Core Interfaces
// =============================================================================

export interface CodeAsset {
  path: string;
  type: AssetType;
  status: UsageStatus;
  metadata: AssetMetadata;
  dependencies: string[];
  dependents: string[];
  size: number;
  lastModified: Date;
}

export interface ArchitectureDocument {
  name: string;
  type: DocumentType;
  standards: ArchitectureStandard[];
  rules: ValidationRule[];
  exceptions: RuleException[];
  version: string;
  lastUpdated: Date;
}

export interface DependencyGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
  layers: GraphLayer[];
  circularDependencies: CircularDependency[];
}

export interface CleanupAction {
  id: string;
  type: ActionType;
  status: ActionStatus;
  targetPath: string;
  metadata: {
    risk: RiskLevel;
    impact: ImpactAssessment;
    backup?: string;
    reason: string;
  };
  createdAt: Date;
  executedAt?: Date;
}

export interface AuditReport {
  summary: AuditSummary;
  findings: AuditFinding[];
  warnings: AuditWarning[];
  optimizationMetrics: OptimizationMetrics;
  rollbackInfo: RollbackInformation;
  generatedAt: Date;
}

// =============================================================================
// Additional Missing Interfaces from Contract Files
// =============================================================================

export interface MetricsSummary {
  totalFiles: number;
  analysisTime: number;
  issuesFound: number;
  recommendations: number;
}

export interface VisualizationData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: Record<string, unknown>;
}

export interface ValidationOptions {
  documentPaths: string[];
  validateTurborepoStandards: boolean;
  validateHonoPatterns: boolean;
  validateTanStackRouterPatterns: boolean;
  includeSeverities: RuleSeverity[];
  suggestAutoFixes: boolean;
}

export interface ValidationMetrics {
  rulesApplied: number;
  violationsFound: number;
  compliancePercentage: number;
}

export interface ComplianceSummary {
  overallStatus: ComplianceStatus;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  score: number;
}

export interface AutoFixOptions {
  dryRun: boolean;
  backupFiles: boolean;
  confirmChanges: boolean;
}

export interface FixResult {
  success: boolean;
  message: string;
  filePath?: string;
  changes?: string[];
}

export interface AutoFix {
  description: string;
  changes: string[];
}

export interface Recommendation {
  priority: number;
  description: string;
  category: string;
}

export enum ViolationCategory {
  STRUCTURE = 'structure',
  DEPENDENCY = 'dependency',
  CONFIGURATION = 'configuration',
  SYNTAX = 'syntax',
  IMPORT = 'import',
  STYLE = 'style',
  NAMING = 'naming'
}

// Extended CodeLocation with optional endLine and endColumn
export interface ExtendedCodeLocation extends CodeLocation {
  endLine?: number;
  endColumn?: number;
}

// Performance and Memory interfaces
export interface MemoryUsageMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
}

export interface PerformanceMetrics {
  memoryUsage: MemoryUsageMetrics;
  phaseExecutionTimes: Record<string, number>;
  ioStatistics: Record<string, number>;
  throughputMetrics: Record<string, number>;
}

// Report Generation interfaces
export interface ReportFormat {
  type: 'html' | 'json' | 'markdown' | 'pdf';
  template?: string;
}

export interface ReportMetadata {
  title: string;
  version: string;
  generatedAt: Date;
  author: string;
}

export interface GeneratedReport {
  metadata: ReportMetadata;
  content: string;
  format: ReportFormat;
  size: number;
}

export interface ExecutiveSummary {
  totalAssetsScanned: number;
  unusedAssetsFound: number;
  criticalIssuesFound: number;
  spaceReclaimable: number;
  topRecommendations: Recommendation[];
  complianceScore: number;
  efficiencyScore: number;
  overallHealthScore: number;
}

export interface TechnicalReport {
  executiveSummary: ExecutiveSummary;
  detailedFindings: AuditFinding[];
  recommendations: Recommendation[];
  appendices: Record<string, unknown>;
}

export interface TechnicalReportOptions {
  includeDetailedFindings: boolean;
  includeRecommendations: boolean;
}

export interface ComparisonReport {
  before: ExecutiveSummary;
  after: ExecutiveSummary;
  improvements: ImprovementMetrics;
}

export interface StylingConfig {
  theme: string;
  colors: Record<string, string>;
}

export enum TemplateSection {
  HEADER = 'header',
  SUMMARY = 'summary',
  FINDINGS = 'findings',
  RECOMMENDATIONS = 'recommendations',
  APPENDIX = 'appendix'
}

// Cleanup Engine interfaces
export interface ProgressUpdate {
  phase: string;
  progress: number;
  currentFile?: string;
  message?: string;
}

export interface CleanupExecution {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  operations: CleanupAction[];
  results: {
    successful: number;
    failed: number;
    skipped: number;
  };
}

// Import/Export statements
export interface ImportStatement {
  source: string;
  imports: string[];
  isDefaultImport: boolean;
  isNamespaceImport: boolean;
  line: number;
}

export interface ExportStatement {
  exports: string[];
  isDefaultExport: boolean;
  line: number;
}

// Additional data interfaces
export interface AuditData {
  fileResults: unknown;
  dependencyResults: unknown;
  architectureResults: unknown;
  cleanupResults: unknown;
  performanceMetrics: PerformanceMetrics;
}
