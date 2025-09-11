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
  estimatedSavings?: {
    files: number;
    size: number;
    dependencies: number;
  };
}
