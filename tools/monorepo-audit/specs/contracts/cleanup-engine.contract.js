/**
 * Contract: CleanupEngine Service
 * Purpose: Safe file removal and cleanup operations with rollback capability
 * Generated: 2025-09-09
 */
// Default Configuration
export const DEFAULT_CLEANUP_OPTIONS = {
  dryRun: false,
  createBackups: true,
  requireConfirmation: false,
  batchSize: 100,
  preservePermissions: true,
  excludeActionTypes: [],
}
// Safety Constraints
export const CLEANUP_SAFETY_REQUIREMENTS = {
  /** Maximum files to delete in single batch */
  MAX_BATCH_SIZE: 500,
  /** Minimum backup retention days */
  MIN_BACKUP_RETENTION_DAYS: 7,
  /** Maximum execution time before timeout (ms) */
  MAX_EXECUTION_TIME: 300_000, // 5 minutes
  /** Required free space for backups (percentage) */
  REQUIRED_FREE_SPACE_PERCENTAGE: 10,
}
// # sourceMappingURL=cleanup-engine.contract.js.map
