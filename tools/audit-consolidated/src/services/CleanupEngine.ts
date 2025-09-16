import { promises as fs } from 'fs';
import path from 'path';
import {
  ActionType,
  CleanupExecution,
  CleanupOptions,
  CleanupPlan,
  ExecutionError,
  ExecutionStatus,
  ICleanupEngine,
  PlanRiskAssessment,
  PlanValidationResult,
  ProgressUpdate,
  RollbackExecution,
  RollbackOperation,
  RollbackStatus,
  TempCleanupResult,
  ValidationIssue,
} from '../../specs/contracts/cleanup-engine.contract.js';
import { CleanupAction } from '../models/types.js';

/**
 * Manages safe cleanup operations with backup and rollback capabilities
 * Implements comprehensive cleanup execution with progress tracking and risk assessment
 */
export class CleanupEngine implements ICleanupEngine {
  private executions: Map<string, CleanupExecution> = new Map();
  private rollbacks: Map<string, RollbackOperation> = new Map();
  private activeExecutions: Set<string> = new Set();

  constructor(private readonly backupBasePath: string = './.audit-backups') {}

  /**
   * Create cleanup plan from audit findings
   */
  public async createCleanupPlan(
    unusedAssets: string[],
    redundantAssets: string[],
    orphanedAssets: string[],
    options: CleanupOptions,
  ): Promise<CleanupPlan> {
    const planId = this.generatePlanId();
    const actions: CleanupAction[] = [];

    // Process unused assets
    for (const assetPath of unusedAssets) {
      if (!options.excludeActionTypes.includes('delete' as ActionType)) {
        const action = await this.createDeleteAction(assetPath, 'unused');
        actions.push(action);
      }
    }

    // Process redundant assets
    for (const assetPath of redundantAssets) {
      if (!options.excludeActionTypes.includes('delete' as ActionType)) {
        const action = await this.createDeleteAction(assetPath, 'redundant');
        actions.push(action);
      }
    }

    // Process orphaned assets
    for (const assetPath of orphanedAssets) {
      if (!options.excludeActionTypes.includes('delete' as ActionType)) {
        const action = await this.createDeleteAction(assetPath, 'orphaned');
        actions.push(action);
      }
    }

    // Calculate metrics
    const totalFilesAffected = actions.length;
    const spaceToReclaim = await this.calculateSpaceToReclaim(actions);
    const riskAssessment = this.assessPlanRisk(actions);
    const estimatedExecutionTime = this.estimateExecutionTime(actions, options);

    const plan: CleanupPlan = {
      planId,
      actions,
      createdAt: new Date(),
      totalFilesAffected,
      spaceToReclaim,
      riskAssessment,
      estimatedExecutionTime,
    };

    return plan;
  }

  /**
   * Validate cleanup plan for safety
   */
  public async validateCleanupPlan(plan: CleanupPlan): Promise<PlanValidationResult> {
    const issues: ValidationIssue[] = [];
    const warnings: string[] = [];

    // Check if files still exist
    for (const action of plan.actions) {
      try {
        await fs.access(action.targetPath);
      } catch {
        issues.push({
          actionId: action.actionId,
          severity: 'warning',
          message: `File no longer exists: ${action.targetPath}`,
          suggestion: 'Remove this action from the plan',
        });
      }
    }

    // Check for critical files
    const criticalPatterns = [
      /package\.json$/,
      /tsconfig\.json$/,
      /\.gitignore$/,
      /README\.md$/,
      /LICENSE$/,
    ];

    for (const action of plan.actions) {
      if (criticalPatterns.some(pattern => pattern.test(action.targetPath))) {
        issues.push({
          actionId: action.actionId,
          severity: 'error',
          message: `Critical file marked for deletion: ${action.targetPath}`,
          suggestion: 'Review carefully before proceeding',
        });
      }
    }

    // Check for large batch sizes
    if (plan.actions.length > 1000) {
      warnings.push('Large number of files to process. Consider running in smaller batches.');
    }

    // Check available disk space for backups
    if (plan.spaceToReclaim > 0) {
      try {
        const backupSpaceNeeded = plan.spaceToReclaim * 2; // Conservative estimate
        const stats = await fs.stat(this.backupBasePath);
        // Note: In a real implementation, you'd check available disk space
        warnings.push('Ensure sufficient disk space for backups');
      } catch {
        // Backup directory doesn't exist - will be created
      }
    }

    const hasErrors = issues.some(issue => issue.severity === 'error');
    const hasWarnings = issues.some(issue => issue.severity === 'warning') || warnings.length > 0;

    return {
      isValid: !hasErrors,
      issues,
      warnings,
      recommendations: this.generatePlanRecommendations(plan, issues),
    };
  }

  /**
   * Execute cleanup plan with progress tracking
   */
  public async executeCleanupPlan(
    plan: CleanupPlan,
    onProgress?: (update: ProgressUpdate) => void,
  ): Promise<CleanupExecution> {
    const executionId = this.generateExecutionId();

    const execution: CleanupExecution = {
      planId: plan.planId,
      startedAt: new Date(),
      status: 'running' as ExecutionStatus,
      actionsCompleted: 0,
      actionsFailed: 0,
      spaceReclaimed: 0,
      errors: [],
      progressUpdates: [],
    };

    this.executions.set(executionId, execution);
    this.activeExecutions.add(executionId);

    try {
      // Create backup directory
      await this.ensureBackupDirectory(executionId);

      // Process actions in batches
      const batchSize = 50; // Configurable batch size
      for (let i = 0; i < plan.actions.length; i += batchSize) {
        if (!this.activeExecutions.has(executionId)) {
          // Execution was cancelled
          execution.status = 'cancelled' as ExecutionStatus;
          break;
        }

        const batch = plan.actions.slice(i, i + batchSize);
        await this.processBatch(batch, execution, executionId, onProgress);

        // Update progress
        const progress: ProgressUpdate = {
          executionId,
          currentAction: i + batch.length,
          totalActions: plan.actions.length,
          spaceReclaimed: execution.spaceReclaimed,
          message: `Processed ${i + batch.length}/${plan.actions.length} actions`,
        };

        execution.progressUpdates.push(progress);
        onProgress?.(progress);
      }

      execution.completedAt = new Date();
      if (execution.status === 'running') {
        execution.status = execution.actionsFailed > 0
          ? ('completed_with_errors' as ExecutionStatus)
          : ('completed' as ExecutionStatus);
      }
    } catch (error) {
      execution.status = 'failed' as ExecutionStatus;
      execution.errors.push({
        actionId: 'execution',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      });
    } finally {
      this.activeExecutions.delete(executionId);
    }

    return execution;
  }

  /**
   * Create rollback operation for cleanup
   */
  public async createRollback(executionId: string): Promise<RollbackOperation> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    const rollbackId = this.generateRollbackId();
    const backupPath = path.join(this.backupBasePath, executionId);

    // Find all backup files
    const restoreActions: any[] = [];

    try {
      const backupFiles = await this.findBackupFiles(backupPath);

      for (const backupFile of backupFiles) {
        const originalPath = this.getOriginalPath(backupFile, backupPath);
        restoreActions.push({
          actionId: this.generateActionId(),
          type: 'restore',
          sourcePath: backupFile,
          targetPath: originalPath,
        });
      }
    } catch (error) {
      // No backups found or backup directory doesn't exist
    }

    const rollback: RollbackOperation = {
      rollbackId,
      executionId,
      createdAt: new Date(),
      restoreActions,
      totalFilesToRestore: restoreActions.length,
    };

    this.rollbacks.set(rollbackId, rollback);
    return rollback;
  } /**
   * Execute rollback operation
   */

  public async executeRollback(rollback: RollbackOperation): Promise<RollbackExecution> {
    const execution: RollbackExecution = {
      rollbackId: rollback.rollbackId,
      startedAt: new Date(),
      status: 'running' as RollbackStatus,
      filesRestored: 0,
      filesFailed: 0,
      errors: [],
    };

    try {
      for (const action of rollback.restoreActions) {
        try {
          // Ensure target directory exists
          await fs.mkdir(path.dirname(action.targetPath), { recursive: true });

          // Restore file from backup
          await fs.copyFile(action.sourcePath, action.targetPath);
          execution.filesRestored++;
        } catch (error) {
          execution.filesFailed++;
          execution.errors.push({
            actionId: action.actionId,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
          });
        }
      }

      execution.completedAt = new Date();
      execution.status = execution.filesFailed > 0
        ? ('completed_with_errors' as RollbackStatus)
        : ('completed' as RollbackStatus);
    } catch (error) {
      execution.status = 'failed' as RollbackStatus;
      execution.errors.push({
        actionId: 'rollback',
        error: error instanceof Error ? error.message : 'Rollback failed',
        timestamp: new Date(),
      });
    }

    return execution;
  }

  /**
   * Get cleanup execution status
   */
  public async getExecutionStatus(executionId: string): Promise<CleanupExecution> {
    const execution = this.executions.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }
    return execution;
  }

  /**
   * Cancel ongoing cleanup execution
   */
  public async cancelExecution(executionId: string): Promise<void> {
    if (!this.activeExecutions.has(executionId)) {
      throw new Error(`Execution ${executionId} is not active`);
    }

    this.activeExecutions.delete(executionId);

    const execution = this.executions.get(executionId);
    if (execution) {
      execution.status = 'cancelled' as ExecutionStatus;
      execution.completedAt = new Date();
    }
  }

  /**
   * Clean up temporary files and backups
   */
  public async cleanupTemporaryFiles(olderThanDays: number): Promise<TempCleanupResult> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result: TempCleanupResult = {
      filesRemoved: 0,
      spaceReclaimed: 0,
      errors: [],
      removedPaths: [],
    };

    try {
      // Clean backup directories
      const backupDirs = await this.findBackupDirectories();

      for (const backupDir of backupDirs) {
        try {
          const stats = await fs.stat(backupDir);
          if (stats.mtime < cutoffDate) {
            const size = await this.getDirectorySize(backupDir);
            await fs.rm(backupDir, { recursive: true });

            result.filesRemoved++;
            result.spaceReclaimed += size;
            result.removedPaths.push(backupDir);
          }
        } catch (error) {
          result.errors.push({
            path: backupDir,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      result.errors.push({
        path: this.backupBasePath,
        error: error instanceof Error ? error.message : 'Failed to access backup directory',
      });
    }

    return result;
  }

  // Private helper methods

  private generatePlanId(): string {
    return `plan-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private generateRollbackId(): string {
    return `rollback-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  private async createDeleteAction(assetPath: string, reason: string): Promise<CleanupAction> {
    const stats = await fs.stat(assetPath).catch(() => null);

    return {
      actionId: this.generateActionId(),
      type: 'delete',
      targetPath: assetPath,
      reason,
      estimatedSize: stats?.size || 0,
      riskLevel: this.assessActionRisk(assetPath),
      dependencies: [],
      backupRequired: true,
      canRollback: true,
    };
  }

  private async calculateSpaceToReclaim(actions: CleanupAction[]): Promise<number> {
    let totalSize = 0;

    for (const action of actions) {
      totalSize += action.estimatedSize;
    }

    return totalSize;
  }

  private assessPlanRisk(actions: CleanupAction[]): PlanRiskAssessment {
    const highRiskActions = actions.filter(a => a.riskLevel === 'high').length;
    const mediumRiskActions = actions.filter(a => a.riskLevel === 'medium').length;
    const lowRiskActions = actions.filter(a => a.riskLevel === 'low').length;

    let overallRisk: 'low' | 'medium' | 'high' = 'low';

    if (highRiskActions > 0) {
      overallRisk = 'high';
    } else if (mediumRiskActions > actions.length * 0.3) {
      overallRisk = 'medium';
    }

    return {
      overallRisk,
      highRiskActions,
      mediumRiskActions,
      lowRiskActions,
      riskFactors: this.identifyRiskFactors(actions),
    };
  }

  private estimateExecutionTime(actions: CleanupAction[], options: CleanupOptions): number {
    // Base time per action (in milliseconds)
    const baseTimePerAction = 100;
    const backupTimePerAction = options.createBackups ? 200 : 0;
    const confirmationTimePerAction = options.requireConfirmation ? 1000 : 0;

    return actions.length * (baseTimePerAction + backupTimePerAction + confirmationTimePerAction);
  }

  private assessActionRisk(filePath: string): 'low' | 'medium' | 'high' {
    // Critical system files
    const criticalPatterns = [
      /package\.json$/,
      /tsconfig\.json$/,
      /\.gitignore$/,
      /README\.md$/,
      /LICENSE$/,
      /Dockerfile$/,
      /docker-compose\.ya?ml$/,
    ];

    if (criticalPatterns.some(pattern => pattern.test(filePath))) {
      return 'high';
    }

    // Important configuration files
    const importantPatterns = [/\.env/, /\.config\./, /webpack\./, /vite\./, /rollup\./];

    if (importantPatterns.some(pattern => pattern.test(filePath))) {
      return 'medium';
    }

    return 'low';
  }
  private identifyRiskFactors(actions: CleanupAction[]): string[] {
    const factors: string[] = [];

    const criticalFileCount = actions.filter(a => a.riskLevel === 'high').length;
    if (criticalFileCount > 0) {
      factors.push(`${criticalFileCount} critical files marked for deletion`);
    }

    const largeFileCount = actions.filter(a => a.estimatedSize > 1024 * 1024).length; // > 1MB
    if (largeFileCount > 0) {
      factors.push(`${largeFileCount} large files (>1MB) to be deleted`);
    }

    const totalSize = actions.reduce((sum, a) => sum + a.estimatedSize, 0);
    if (totalSize > 100 * 1024 * 1024) {
      // > 100MB
      factors.push(`Large total cleanup size: ${this.formatBytes(totalSize)}`);
    }

    if (actions.length > 500) {
      factors.push(`High number of files to process: ${actions.length}`);
    }

    return factors;
  }

  private generatePlanRecommendations(plan: CleanupPlan, issues: ValidationIssue[]): string[] {
    const recommendations: string[] = [];

    if (issues.some(i => i.severity === 'error')) {
      recommendations.push('Review and resolve all critical issues before proceeding');
    }

    if (plan.riskAssessment.overallRisk === 'high') {
      recommendations.push('Consider running a dry-run first to validate the plan');
      recommendations.push('Ensure backups are enabled for this high-risk operation');
    }

    if (plan.totalFilesAffected > 1000) {
      recommendations.push('Consider processing in smaller batches to reduce risk');
    }

    if (plan.spaceToReclaim > 1024 * 1024 * 1024) {
      // > 1GB
      recommendations.push('Verify sufficient backup storage space is available');
    }

    return recommendations;
  }

  private async ensureBackupDirectory(executionId: string): Promise<void> {
    const backupDir = path.join(this.backupBasePath, executionId);
    await fs.mkdir(backupDir, { recursive: true });
  }

  private async processBatch(
    batch: CleanupAction[],
    execution: CleanupExecution,
    executionId: string,
    onProgress?: (update: ProgressUpdate) => void,
  ): Promise<void> {
    for (const action of batch) {
      try {
        await this.executeAction(action, executionId);
        execution.actionsCompleted++;
        execution.spaceReclaimed += action.estimatedSize;
      } catch (error) {
        execution.actionsFailed++;
        execution.errors.push({
          actionId: action.actionId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        });
      }
    }
  }

  private async executeAction(action: CleanupAction, executionId: string): Promise<void> {
    // Create backup if required
    if (action.backupRequired) {
      await this.createBackup(action.targetPath, executionId);
    }

    // Execute the action
    switch (action.type) {
      case 'delete':
        await fs.unlink(action.targetPath);
        break;

      case 'move':
        // Implementation for move operations
        break;

      default:
        throw new Error(`Unsupported action type: ${action.type}`);
    }
  }

  private async createBackup(filePath: string, executionId: string): Promise<void> {
    const backupDir = path.join(this.backupBasePath, executionId);
    const relativePath = path.relative(process.cwd(), filePath);
    const backupPath = path.join(backupDir, relativePath);

    // Ensure backup directory exists
    await fs.mkdir(path.dirname(backupPath), { recursive: true });

    // Copy file to backup location
    await fs.copyFile(filePath, backupPath);
  }

  private async findBackupFiles(backupPath: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(backupPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(backupPath, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.findBackupFiles(fullPath);
          files.push(...subFiles);
        } else {
          files.push(fullPath);
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return files;
  }

  private getOriginalPath(backupFile: string, backupBasePath: string): string {
    const relativePath = path.relative(backupBasePath, backupFile);
    return path.resolve(process.cwd(), relativePath);
  }

  private async findBackupDirectories(): Promise<string[]> {
    const directories: string[] = [];

    try {
      const entries = await fs.readdir(this.backupBasePath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          directories.push(path.join(this.backupBasePath, entry.name));
        }
      }
    } catch {
      // Backup base path doesn't exist
    }

    return directories;
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let size = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          size += await this.getDirectorySize(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          size += stats.size;
        }
      }
    } catch {
      // Directory can't be read
    }

    return size;
  }

  private formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return '0 Bytes';
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round((bytes / Math.pow(1024, i)) * 100) / 100} ${sizes[i]}`;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    // Cancel all active executions
    for (const executionId of this.activeExecutions) {
      this.cancelExecution(executionId).catch(console.error);
    }

    this.executions.clear();
    this.rollbacks.clear();
    this.activeExecutions.clear();
  }
}
