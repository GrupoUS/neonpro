/**
 * CleanupAction Model
 * Represents individual file or resource removal/modification with justification
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

import { randomBytes, } from 'crypto'
import type { ImpactAssessment, } from './types'
import { ActionStatus, ActionType, RiskLevel, } from './types'

export class CleanupAction {
  public readonly actionId: string
  public readonly type: ActionType
  public readonly targetPath: string
  public readonly justification: string
  public impactAssessment: ImpactAssessment
  public status: ActionStatus
  public executedAt: Date | null
  public backupPath: string | null
  public rollbackPossible: boolean

  constructor(
    type: ActionType,
    targetPath: string,
    justification: string,
    impactAssessment: ImpactAssessment,
    actionId: string = CleanupAction.generateActionId(),
  ) {
    this.actionId = actionId
    this.type = type
    this.targetPath = targetPath
    this.justification = justification
    this.impactAssessment = impactAssessment
    this.status = ActionStatus.PLANNED
    this.executedAt = null
    this.backupPath = null
    this.rollbackPossible = false
  }

  /**
   * Mark action as executing
   */
  public markExecuting(): void {
    this.status = ActionStatus.EXECUTING
  }

  /**
   * Mark action as executed successfully
   */
  public markExecuted(backupPath?: string,): void {
    this.status = ActionStatus.EXECUTED
    this.executedAt = new Date()
    this.backupPath = backupPath || null
    this.rollbackPossible = !!backupPath
  }

  /**
   * Mark action as failed
   */
  public markFailed(): void {
    this.status = ActionStatus.FAILED
    this.executedAt = new Date()
  }

  /**
   * Mark action as rolled back
   */
  public markRolledBack(): void {
    this.status = ActionStatus.ROLLED_BACK
    this.rollbackPossible = false
  }

  /**
   * Check if action is high risk
   */
  public isHighRisk(): boolean {
    return this.impactAssessment.riskLevel === RiskLevel.HIGH
  }

  /**
   * Check if action requires manual review
   */
  public requiresManualReview(): boolean {
    return this.impactAssessment.requiresManualReview || this.isHighRisk()
  }

  /**
   * Check if action is reversible
   */
  public isReversible(): boolean {
    return this.rollbackPossible && this.backupPath !== null
  }

  /**
   * Get estimated savings from this action
   */
  public getEstimatedSavings(): { files: number; size: number; dependencies: number } {
    return this.impactAssessment.estimatedSavings || { files: 0, size: 0, dependencies: 0, }
  } /**
   * Update impact assessment
   */

  public updateImpactAssessment(assessment: ImpactAssessment,): void {
    this.impactAssessment = assessment
  }

  /**
   * Add affected file to impact assessment
   */
  public addAffectedFile(filePath: string,): void {
    if (!this.impactAssessment.affectedFiles.includes(filePath,)) {
      this.impactAssessment.affectedFiles.push(filePath,)
    }
  }

  /**
   * Add broken reference to impact assessment
   */
  public addBrokenReference(reference: string,): void {
    if (!this.impactAssessment.brokenReferences.includes(reference,)) {
      this.impactAssessment.brokenReferences.push(reference,)
    }
  }

  /**
   * Calculate risk level based on impact assessment
   */
  public calculateRiskLevel(): RiskLevel {
    const affectedCount = this.impactAssessment.affectedFiles.length
    const brokenCount = this.impactAssessment.brokenReferences.length

    // High risk if many files affected or references broken
    if (affectedCount > 10 || brokenCount > 5) {
      return RiskLevel.HIGH
    }

    // Medium risk if moderate impact
    if (affectedCount > 3 || brokenCount > 1) {
      return RiskLevel.MEDIUM
    }

    // Low risk otherwise
    return RiskLevel.LOW
  }

  /**
   * Generate rollback script for this action
   */
  public generateRollbackScript(): string {
    if (!this.isReversible()) {
      return ''
    }

    switch (this.type) {
      case ActionType.DELETE_FILE:
        return `cp "${this.backupPath}" "${this.targetPath}"`

      case ActionType.DELETE_DIRECTORY:
        return `cp -r "${this.backupPath}" "${this.targetPath}"`

      case ActionType.MOVE_FILE:
        // For move operations, the backup path would be the original location
        return `mv "${this.targetPath}" "${this.backupPath}"`

      case ActionType.MODIFY_FILE:
        return `cp "${this.backupPath}" "${this.targetPath}"`

      default:
        return `# No rollback available for action type: ${this.type}`
    }
  }

  /**
   * Get action description for reporting
   */
  public getActionDescription(): string {
    switch (this.type) {
      case ActionType.DELETE_FILE:
        return `Delete file: ${this.targetPath}`

      case ActionType.DELETE_DIRECTORY:
        return `Delete directory: ${this.targetPath}`

      case ActionType.MOVE_FILE:
        return `Move file: ${this.targetPath}`

      case ActionType.MODIFY_FILE:
        return `Modify file: ${this.targetPath}`

      case ActionType.CREATE_BACKUP:
        return `Create backup: ${this.targetPath}`

      default:
        return `Unknown action: ${this.type}`
    }
  }

  /**
   * Generate unique action ID
   */
  private static generateActionId(): string {
    const timestamp = Date.now().toString(36,)
    const random = randomBytes(6,).toString('hex',)
    return `action_${timestamp}_${random}`
  }

  /**
   * Create a deletion action
   */
  public static createDeleteAction(
    filePath: string,
    justification: string,
    impactAssessment: ImpactAssessment,
  ): CleanupAction {
    return new CleanupAction(
      ActionType.DELETE_FILE,
      filePath,
      justification,
      impactAssessment,
    )
  }

  /**
   * Create a move action
   */
  public static createMoveAction(
    sourcePath: string,
    justification: string,
    impactAssessment: ImpactAssessment,
  ): CleanupAction {
    return new CleanupAction(
      ActionType.MOVE_FILE,
      sourcePath,
      justification,
      impactAssessment,
    )
  }

  /**
   * Create a backup action
   */
  public static createBackupAction(
    targetPath: string,
    justification: string = 'Create backup before modification',
  ): CleanupAction {
    const impactAssessment: ImpactAssessment = {
      affectedFiles: [targetPath,],
      brokenReferences: [],
      riskLevel: RiskLevel.LOW,
      requiresManualReview: false,
    }

    return new CleanupAction(
      ActionType.CREATE_BACKUP,
      targetPath,
      justification,
      impactAssessment,
    )
  }

  /**
   * Convert to JSON representation
   */
  public toJSON(): object {
    return {
      actionId: this.actionId,
      type: this.type,
      targetPath: this.targetPath,
      justification: this.justification,
      impactAssessment: this.impactAssessment,
      status: this.status,
      executedAt: this.executedAt,
      backupPath: this.backupPath,
      rollbackPossible: this.rollbackPossible,
    }
  }

  /**
   * Create CleanupAction from JSON representation
   */
  public static fromJSON(data: any,): CleanupAction {
    const action = new CleanupAction(
      data.type,
      data.targetPath,
      data.justification,
      data.impactAssessment,
      data.actionId,
    )

    action.status = data.status
    action.executedAt = data.executedAt ? new Date(data.executedAt,) : null
    action.backupPath = data.backupPath
    action.rollbackPossible = data.rollbackPossible

    return action
  }
}
