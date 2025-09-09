/**
 * Contract: CleanupEngine Service
 * Purpose: Safe file removal and cleanup operations with rollback capability
 * Generated: 2025-09-09
 */
export interface CleanupOptions {
  /** Whether to run in dry-run mode (no actual changes) */
  dryRun: boolean
  /** Whether to create backups before deletion */
  createBackups: boolean
  /** Backup directory path */
  backupDirectory?: string
  /** Whether to require confirmation for each action */
  requireConfirmation: boolean
  /** Maximum number of files to process in single batch */
  batchSize: number
  /** Whether to preserve file permissions in backups */
  preservePermissions: boolean
  /** Actions to exclude from cleanup */
  excludeActionTypes: ActionType[]
}
export interface CleanupPlan {
  /** Unique plan identifier */
  planId: string
  /** Planned cleanup actions */
  actions: CleanupAction[]
  /** Plan creation timestamp */
  createdAt: Date
  /** Total files to be affected */
  totalFilesAffected: number
  /** Total disk space to be reclaimed */
  spaceToReclaim: number
  /** Risk assessment for the plan */
  riskAssessment: PlanRiskAssessment
  /** Estimated execution time */
  estimatedExecutionTime: number
}
export interface CleanupAction {
  /** Unique action identifier */
  actionId: string
  /** Type of cleanup operation */
  type: ActionType
  /** Target file or directory path */
  targetPath: string
  /** Reason for this action */
  justification: string
  /** Impact assessment */
  impactAssessment: ImpactAssessment
  /** Current status */
  status: ActionStatus
  /** When action was executed */
  executedAt?: Date
  /** Backup location if created */
  backupPath?: string
  /** Whether action can be rolled back */
  rollbackPossible: boolean
  /** Dependencies that must be resolved first */
  dependencies: string[]
  /** Files that reference this target */
  referencedBy: string[]
}
export interface CleanupExecution {
  /** Plan being executed */
  planId: string
  /** Execution start time */
  startedAt: Date
  /** Execution end time */
  completedAt?: Date
  /** Current execution status */
  status: ExecutionStatus
  /** Actions completed */
  actionsCompleted: number
  /** Actions failed */
  actionsFailed: number
  /** Actual space reclaimed */
  spaceReclaimed: number
  /** Execution errors */
  errors: ExecutionError[]
  /** Progress callback updates */
  progressUpdates: ProgressUpdate[]
}
export interface RollbackOperation {
  /** Original cleanup plan ID */
  cleanupPlanId: string
  /** Rollback operation ID */
  rollbackId: string
  /** Actions to rollback */
  actionsToRollback: string[]
  /** Rollback execution status */
  status: RollbackStatus
  /** Files restored */
  filesRestored: string[]
  /** Rollback errors */
  errors: RollbackError[]
  /** Rollback start time */
  startedAt: Date
  /** Rollback completion time */
  completedAt?: Date
}
export type ActionType =
  | 'delete_file'
  | 'delete_directory'
  | 'move_file'
  | 'move_directory'
  | 'modify_file'
  | 'create_backup'
  | 'update_references'
export type ActionStatus =
  | 'planned'
  | 'queued'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'rolled_back'
export type ExecutionStatus =
  | 'preparing'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'partially_completed'
export type RollbackStatus =
  | 'planned'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'partially_completed'
export interface ImpactAssessment {
  /** Files that will be affected by this action */
  affectedFiles: string[]
  /** Import statements that will break */
  brokenImports: ImportReference[]
  /** Route references that will break */
  brokenRoutes: RouteReference[]
  /** Overall risk level */
  riskLevel: RiskLevel
  /** Whether manual review is recommended */
  requiresManualReview: boolean
  /** Estimated impact on build success */
  buildImpact: BuildImpact
  /** Estimated impact on tests */
  testImpact: TestImpact
}
export interface ImportReference {
  /** File containing the import */
  sourceFile: string
  /** Line number of import */
  line: number
  /** Import statement text */
  importStatement: string
  /** What is being imported */
  importedItems: string[]
}
export interface RouteReference {
  /** File containing route reference */
  sourceFile: string
  /** Line number of route */
  line: number
  /** Route pattern or path */
  routePath: string
  /** Type of route reference */
  referenceType: 'definition' | 'navigation' | 'link'
}
export interface PlanRiskAssessment {
  /** Overall risk level for entire plan */
  overallRisk: RiskLevel
  /** Actions categorized by risk */
  riskBreakdown: Record<RiskLevel, number>
  /** High-risk actions requiring attention */
  highRiskActions: string[]
  /** Potential issues and mitigations */
  riskMitigations: RiskMitigation[]
  /** Recommended execution strategy */
  recommendedStrategy: ExecutionStrategy
}
export interface RiskMitigation {
  /** Risk being addressed */
  risk: string
  /** Mitigation strategy */
  mitigation: string
  /** Priority of implementing mitigation */
  priority: 'low' | 'medium' | 'high' | 'critical'
}
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type BuildImpact = 'none' | 'warnings' | 'errors' | 'build_failure'
export type TestImpact = 'none' | 'test_warnings' | 'test_failures' | 'test_suite_broken'
export type ExecutionStrategy = 'sequential' | 'batch' | 'parallel_safe' | 'manual_review'
export interface ExecutionError {
  /** Action that failed */
  actionId: string
  /** Error type */
  errorType: ErrorType
  /** Error message */
  message: string
  /** Stack trace if available */
  stackTrace?: string
  /** Whether error is recoverable */
  recoverable: boolean
  /** Suggested recovery action */
  recoveryAction?: string
}
export interface RollbackError {
  /** Action rollback that failed */
  actionId: string
  /** Error message */
  message: string
  /** Files that couldn't be restored */
  failedFiles: string[]
  /** Manual steps required */
  manualStepsRequired: string[]
}
export type ErrorType =
  | 'file_not_found'
  | 'permission_denied'
  | 'disk_full'
  | 'file_in_use'
  | 'backup_failed'
  | 'corruption_detected'
  | 'dependency_violation'
  | 'unknown_error'
export interface ProgressUpdate {
  /** Update timestamp */
  timestamp: Date
  /** Current action being processed */
  currentAction: string
  /** Actions completed so far */
  actionsCompleted: number
  /** Total actions in plan */
  totalActions: number
  /** Progress percentage */
  progressPercentage: number
  /** Estimated time remaining */
  estimatedTimeRemaining: number
  /** Current phase */
  phase: ExecutionPhase
}
export type ExecutionPhase =
  | 'validating'
  | 'creating_backups'
  | 'executing_actions'
  | 'verifying_results'
  | 'cleanup_complete'
export interface ICleanupEngine {
  /**
   * Create cleanup plan from audit findings
   * @param unusedAssets Assets identified as unused
   * @param redundantAssets Assets identified as redundant
   * @param orphanedAssets Assets identified as orphaned
   * @param options Cleanup configuration
   * @returns Promise resolving to cleanup plan
   */
  createCleanupPlan(
    unusedAssets: string[],
    redundantAssets: string[],
    orphanedAssets: string[],
    options: CleanupOptions,
  ): Promise<CleanupPlan>
  /**
   * Validate cleanup plan for safety
   * @param plan Cleanup plan to validate
   * @returns Promise resolving to validation results
   */
  validateCleanupPlan(plan: CleanupPlan,): Promise<PlanValidationResult>
  /**
   * Execute cleanup plan with progress tracking
   * @param plan Cleanup plan to execute
   * @param onProgress Progress callback
   * @returns Promise resolving to execution results
   */
  executeCleanupPlan(
    plan: CleanupPlan,
    onProgress?: (update: ProgressUpdate,) => void,
  ): Promise<CleanupExecution>
  /**
   * Create rollback operation for cleanup
   * @param executionId Cleanup execution to rollback
   * @returns Promise resolving to rollback operation
   */
  createRollback(executionId: string,): Promise<RollbackOperation>
  /**
   * Execute rollback operation
   * @param rollback Rollback operation to execute
   * @returns Promise resolving to rollback results
   */
  executeRollback(rollback: RollbackOperation,): Promise<RollbackExecution>
  /**
   * Get cleanup execution status
   * @param executionId Execution ID to check
   * @returns Promise resolving to current status
   */
  getExecutionStatus(executionId: string,): Promise<CleanupExecution>
  /**
   * Cancel ongoing cleanup execution
   * @param executionId Execution to cancel
   * @returns Promise resolving when cancellation complete
   */
  cancelExecution(executionId: string,): Promise<void>
  /**
   * Clean up temporary files and backups
   * @param olderThanDays Clean files older than specified days
   * @returns Promise resolving to cleanup results
   */
  cleanupTemporaryFiles(olderThanDays: number,): Promise<TempCleanupResult>
}
export interface PlanValidationResult {
  /** Whether plan is safe to execute */
  isValid: boolean
  /** Validation warnings found */
  warnings: ValidationWarning[]
  /** Validation errors that prevent execution */
  errors: ValidationError[]
  /** Recommended modifications to plan */
  recommendations: PlanRecommendation[]
  /** Updated risk assessment */
  riskAssessment: PlanRiskAssessment
}
export interface ValidationWarning {
  /** Action this warning applies to */
  actionId: string
  /** Warning message */
  message: string
  /** Severity of warning */
  severity: 'info' | 'warning' | 'high'
  /** Whether execution can continue */
  canProceed: boolean
}
export interface ValidationError {
  /** Action this error applies to */
  actionId: string
  /** Error message */
  message: string
  /** What needs to be fixed */
  resolution: string
  /** Whether this blocks entire plan */
  blocksExecution: boolean
}
export interface PlanRecommendation {
  /** Recommendation type */
  type: 'modify_action' | 'add_action' | 'remove_action' | 'change_order'
  /** Action ID this applies to */
  actionId: string
  /** Recommendation description */
  description: string
  /** Expected benefit */
  benefit: string
}
export interface RollbackExecution {
  /** Rollback operation ID */
  rollbackId: string
  /** Execution status */
  status: RollbackStatus
  /** Files successfully restored */
  filesRestored: string[]
  /** Files that couldn't be restored */
  failedFiles: string[]
  /** Manual steps still required */
  manualStepsRequired: string[]
  /** Rollback errors */
  errors: RollbackError[]
}
export interface TempCleanupResult {
  /** Number of temporary files removed */
  tempFilesRemoved: number
  /** Number of backup files removed */
  backupFilesRemoved: number
  /** Total space reclaimed */
  spaceReclaimed: number
  /** Files that couldn't be removed */
  failedRemovals: string[]
}
export interface CleanupEngineContractTests {
  /** Test cleanup plan creation */
  testCleanupPlanCreation(): Promise<void>
  /** Test plan validation accuracy */
  testPlanValidation(): Promise<void>
  /** Test safe cleanup execution */
  testSafeCleanupExecution(): Promise<void>
  /** Test backup creation and integrity */
  testBackupCreation(): Promise<void>
  /** Test rollback functionality */
  testRollbackFunctionality(): Promise<void>
  /** Test error handling and recovery */
  testErrorHandling(): Promise<void>
  /** Test dry-run mode accuracy */
  testDryRunMode(): Promise<void>
  /** Test large-scale cleanup performance */
  testLargeScaleCleanup(): Promise<void>
}
export declare const DEFAULT_CLEANUP_OPTIONS: CleanupOptions
export declare const CLEANUP_SAFETY_REQUIREMENTS: {
  /** Maximum files to delete in single batch */
  readonly MAX_BATCH_SIZE: 500
  /** Minimum backup retention days */
  readonly MIN_BACKUP_RETENTION_DAYS: 7
  /** Maximum execution time before timeout (ms) */
  readonly MAX_EXECUTION_TIME: 300000
  /** Required free space for backups (percentage) */
  readonly REQUIRED_FREE_SPACE_PERCENTAGE: 10
}
// # sourceMappingURL=cleanup-engine.contract.d.ts.map
