/**
 * Contract: ArchitectureValidator Service
 * Purpose: Validate code assets against architectural documentation and standards
 * Generated: 2025-09-09
 */

import type { CodeAsset, } from './file-scanner.contract'

// Core Types
export interface ValidationOptions {
  /** Architecture documents to validate against */
  documentPaths: string[]
  /** Whether to validate Turborepo standards */
  validateTurborepoStandards: boolean
  /** Whether to validate Hono routing patterns */
  validateHonoPatterns: boolean
  /** Whether to validate TanStack Router patterns */
  validateTanStackRouterPatterns: boolean
  /** Severity levels to include in results */
  includeSeverities: RuleSeverity[]
  /** Whether to suggest automatic fixes */
  suggestAutoFixes: boolean
}

export interface ValidationResult {
  /** Overall validation status */
  overallStatus: ValidationStatus
  /** All validation violations found */
  violations: ArchitectureViolation[]
  /** Architecture compliance summary */
  complianceSummary: ComplianceSummary
  /** Validation execution metrics */
  metrics: ValidationMetrics
  /** Suggestions for improvement */
  recommendations: Recommendation[]
}

export interface ArchitectureViolation {
  /** Unique violation identifier */
  violationId: string
  /** Rule that was violated */
  ruleId: string
  /** Rule name/description */
  ruleName: string
  /** Violation severity */
  severity: RuleSeverity
  /** Category of violation */
  category: ViolationCategory
  /** File path where violation occurs */
  filePath: string
  /** Specific location in file */
  location: CodeLocation
  /** Description of the violation */
  description: string
  /** What the rule expects */
  expected: string
  /** What was actually found */
  actual: string
  /** Suggested fix if available */
  suggestedFix?: AutoFix
  /** Impact of not fixing this violation */
  impact: ImpactAssessment
}

export interface ArchitectureDocument {
  /** Path to the document */
  filePath: string
  /** Type of document */
  type: DocumentType
  /** Parsed standards from document */
  standards: ArchitectureStandard[]
  /** Validation rules extracted */
  rules: ValidationRule[]
  /** Documented exceptions */
  exceptions: RuleException[]
  /** Document metadata */
  metadata: DocumentMetadata
}

export interface ArchitectureStandard {
  /** Standard identifier */
  name: string
  /** Human-readable description */
  description: string
  /** File patterns this applies to */
  applicablePatterns: string[]
  /** Whether compliance is required */
  required: boolean
  /** Code examples demonstrating standard */
  examples: CodeExample[]
  /** Related standards */
  relatedStandards: string[]
}

export interface ValidationRule {
  /** Unique rule identifier */
  id: string
  /** Rule name */
  name: string
  /** Pattern to match files/code */
  pattern: string
  /** What the pattern must satisfy */
  requirement: string
  /** Rule severity */
  severity: RuleSeverity
  /** Rule category */
  category: ViolationCategory
  /** Scope where rule applies */
  scope: RuleScope
  /** Whether rule can be auto-fixed */
  autoFixable: boolean
}

export interface ComplianceSummary {
  /** Total files validated */
  totalFilesValidated: number
  /** Files with violations */
  filesWithViolations: number
  /** Compliance percentage */
  compliancePercentage: number
  /** Breakdown by category */
  categoryBreakdown: Record<ViolationCategory, CategoryCompliance>
  /** Breakdown by severity */
  severityBreakdown: Record<RuleSeverity, number>
  /** Top violation types */
  topViolationTypes: ViolationSummary[]
}

export interface CategoryCompliance {
  /** Total rules in category */
  totalRules: number
  /** Passing rules */
  passingRules: number
  /** Failing rules */
  failingRules: number
  /** Compliance rate for category */
  complianceRate: number
}

export interface ViolationSummary {
  /** Rule ID */
  ruleId: string
  /** Rule name */
  ruleName: string
  /** Number of violations */
  violationCount: number
  /** Affected files */
  affectedFiles: number
}

export interface ValidationMetrics {
  /** Total validation time in ms */
  executionTimeMs: number
  /** Time spent parsing documents */
  documentParsingTimeMs: number
  /** Time spent validating files */
  fileValidationTimeMs: number
  /** Memory usage during validation */
  memoryUsedBytes: number
  /** Rules processed */
  rulesProcessed: number
  /** Files processed */
  filesProcessed: number
}

// Enumerations
export type ValidationStatus =
  | 'compliant'
  | 'violations_found'
  | 'validation_failed'
  | 'passed'
  | 'failed'
  | 'warning'

export type RuleSeverity = 'error' | 'warning' | 'info'

export type ViolationCategory =
  | 'file_structure'
  | 'naming_convention'
  | 'import_structure'
  | 'routing_pattern'
  | 'dependency_rule'
  | 'coding_standard'
  | 'architecture_layer'
  | 'performance'
  | 'security'
  | 'documentation'

export type DocumentType = 'source_tree' | 'tech_stack' | 'custom'

export type RuleScope = 'global' | 'apps' | 'packages' | 'specific_package'

// Supporting Types
export interface CodeLocation {
  /** Line number (1-based) */
  line: number
  /** Column number (1-based) */
  column: number
  /** Length of problematic code */
  length: number
  /** Surrounding code context */
  context: string
}

export interface AutoFix {
  /** Description of the fix */
  description: string
  /** Confidence level in auto-fix */
  confidence: FixConfidence
  /** Text replacement operations */
  operations: FixOperation[]
  /** Whether fix requires manual review */
  requiresReview: boolean
}

export interface FixOperation {
  /** Type of operation */
  type: 'replace' | 'insert' | 'delete' | 'move'
  /** Start position for operation */
  start: CodeLocation
  /** End position for operation (for replace/delete) */
  end?: CodeLocation
  /** New text (for replace/insert) */
  newText?: string
  /** Target location (for move) */
  targetLocation?: CodeLocation
}

export type FixConfidence = 'high' | 'medium' | 'low'

export interface ImpactAssessment {
  /** Business impact if not fixed */
  businessImpact: ImpactLevel
  /** Technical impact if not fixed */
  technicalImpact: ImpactLevel
  /** Effort required to fix */
  fixEffort: EffortLevel
  /** Risk of introducing bugs when fixing */
  fixRisk: RiskLevel
}

export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical'
export type EffortLevel = 'trivial' | 'low' | 'medium' | 'high' | 'very_high'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface RuleException {
  /** Rule this exception applies to */
  ruleId: string
  /** File or pattern this exception covers */
  scope: string
  /** Reason for the exception */
  justification: string
  /** Who approved the exception */
  approvedBy: string
  /** When exception was created */
  createdAt: Date
  /** When exception expires (if applicable) */
  expiresAt?: Date
}

export interface DocumentMetadata {
  /** Document version */
  version: string
  /** Last updated timestamp */
  lastUpdated: Date
  /** Document author/maintainer */
  maintainer: string
  /** Related documentation */
  relatedDocs: string[]
}

export interface CodeExample {
  /** Example title/description */
  title: string
  /** Code snippet */
  code: string
  /** Programming language */
  language: string
  /** Whether this is a good or bad example */
  type: 'good' | 'bad'
}

export interface Recommendation {
  /** Recommendation category */
  category: ViolationCategory
  /** Priority level */
  priority: 'low' | 'medium' | 'high' | 'critical'
  /** Recommendation description */
  description: string
  /** Expected benefit */
  expectedBenefit: string
  /** Estimated effort */
  estimatedEffort: EffortLevel
  /** Affected files/areas */
  affectedAreas: string[]
}

// Service Interface
export interface IArchitectureValidator {
  /**
   * Validate all assets against architecture standards
   * @param assets Code assets to validate
   * @param options Validation configuration
   * @returns Promise resolving to validation results
   */
  validateAssets(assets: CodeAsset[], options: ValidationOptions,): Promise<ValidationResult>

  /**
   * Validate specific asset against standards
   * @param assetPath Path to asset to validate
   * @param options Validation configuration
   * @returns Promise resolving to asset validation results
   */
  validateAsset(assetPath: string, options: ValidationOptions,): Promise<ArchitectureViolation[]>

  /**
   * Load and parse architecture documents
   * @param documentPaths Paths to architecture documents
   * @returns Promise resolving to parsed documents
   */
  loadArchitectureDocuments(documentPaths: string[],): Promise<ArchitectureDocument[]>

  /**
   * Check Turborepo workspace compliance
   * @param assets Code assets to check
   * @returns Promise resolving to Turborepo-specific violations
   */
  validateTurborepoCompliance(assets: CodeAsset[],): Promise<ArchitectureViolation[]>

  /**
   * Check Hono routing pattern compliance
   * @param assets Code assets to check
   * @returns Promise resolving to Hono-specific violations
   */
  validateHonoPatterns(assets: CodeAsset[],): Promise<ArchitectureViolation[]>

  /**
   * Check TanStack Router pattern compliance
   * @param assets Code assets to check
   * @returns Promise resolving to TanStack Router violations
   */
  validateTanStackRouterPatterns(assets: CodeAsset[],): Promise<ArchitectureViolation[]>

  /**
   * Generate compliance report
   * @param validationResult Results from validation
   * @returns Promise resolving to formatted compliance report
   */
  generateComplianceReport(validationResult: ValidationResult,): Promise<string>

  /**
   * Apply automatic fixes for violations
   * @param violations Violations to attempt fixing
   * @param options Auto-fix configuration
   * @returns Promise resolving to fix results
   */
  applyAutoFixes(
    violations: ArchitectureViolation[],
    options: AutoFixOptions,
  ): Promise<FixResult[]>
}

export interface AutoFixOptions {
  /** Minimum confidence level for auto-fixes */
  minConfidence?: FixConfidence
  /** Whether to require manual review */
  requireReview?: boolean
  /** Maximum number of files to fix in batch */
  maxFilesToFix?: number
  /** Whether to create backup before fixing */
  createBackup?: boolean
  /** Dry run without applying changes */
  dryRun?: boolean
}

export interface FixResult {
  /** Violation that was fixed */
  violationId: string
  /** Whether fix was successful */
  success: boolean
  /** Error message if fix failed */
  error?: string
  /** Files modified by the fix */
  modifiedFiles: string[]
  /** Backup paths if created */
  backupPaths?: string[]
}

// Contract Tests Requirements
export interface ArchitectureValidatorContractTests {
  /** Test basic architecture validation */
  testBasicArchitectureValidation(): Promise<void>

  /** Test document parsing accuracy */
  testDocumentParsing(): Promise<void>

  /** Test Turborepo compliance checking */
  testTurborepoCompliance(): Promise<void>

  /** Test framework-specific validations */
  testFrameworkValidations(): Promise<void>

  /** Test auto-fix functionality */
  testAutoFixFunctionality(): Promise<void>

  /** Test exception handling */
  testExceptionHandling(): Promise<void>

  /** Test performance with large codebase */
  testLargeCodebaseValidation(): Promise<void>

  /** Test compliance reporting */
  testComplianceReporting(): Promise<void>
}

// Default Configuration
export const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
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
} as const
