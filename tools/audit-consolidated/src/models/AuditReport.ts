/**
 * AuditReport Model
 * Represents comprehensive documentation of audit process and results
 * Based on: specs/003-monorepo-audit-optimization/data-model.md
 * Generated: 2025-09-09
 */

import { CleanupAction } from './CleanupAction';
import {
  AuditFinding,
  AuditSummary,
  AuditWarning,
  FindingSeverity,
  FindingType,
  OptimizationMetrics,
  RollbackInformation,
} from './types';

export class AuditReport {
  public readonly reportId: string;
  public readonly timestamp: Date;
  public summary: AuditSummary;
  public findings: AuditFinding[];
  public actions: CleanupAction[];
  public metrics: OptimizationMetrics;
  public warnings: AuditWarning[];
  public rollbackData: RollbackInformation | null;

  constructor(reportId: string = AuditReport.generateReportId()) {
    this.reportId = reportId;
    this.timestamp = new Date();
    this.summary = this.createEmptySummary();
    this.findings = [];
    this.actions = [];
    this.metrics = this.createEmptyMetrics();
    this.warnings = [];
    this.rollbackData = null;
  }

  /**
   * Add a finding to the audit report
   */
  public addFinding(finding: AuditFinding): void {
    this.findings.push(finding);
    this.updateSummaryFromFindings();
  }

  /**
   * Add a warning to the audit report
   */
  public addWarning(warning: AuditWarning): void {
    this.warnings.push(warning);
  }

  /**
   * Add a cleanup action to the audit report
   */
  public addAction(action: CleanupAction): void {
    this.actions.push(action);
    this.updateSummaryFromActions();
  }

  /**
   * Get findings by type
   */
  public getFindingsByType(type: FindingType): AuditFinding[] {
    return this.findings.filter(finding => finding.type === type);
  }

  /**
   * Get findings by severity
   */
  public getFindingsBySeverity(severity: FindingSeverity): AuditFinding[] {
    return this.findings.filter(finding => finding.severity === severity);
  }

  /**
   * Get critical findings (high and critical severity)
   */
  public getCriticalFindings(): AuditFinding[] {
    return this.findings.filter(
      finding =>
        finding.severity === FindingSeverity.CRITICAL || finding.severity === FindingSeverity.HIGH,
    );
  }

  /**
   * Get auto-fixable findings
   */
  public getAutoFixableFindings(): AuditFinding[] {
    return this.findings.filter(finding => finding.autoFixable);
  }

  /**
   * Calculate compliance score based on findings
   */
  public calculateComplianceScore(): number {
    if (this.findings.length === 0) {
      return 100;
    }

    const totalWeight = this.findings.length * 4; // Max weight per finding
    const penaltyWeight = this.findings.reduce((sum, finding) => {
      switch (finding.severity) {
        case FindingSeverity.CRITICAL:
          return sum + 4;
        case FindingSeverity.HIGH:
          return sum + 3;
        case FindingSeverity.MEDIUM:
          return sum + 2;
        case FindingSeverity.LOW:
          return sum + 1;
        default:
          return sum;
      }
    }, 0);

    return Math.max(0, Math.round(((totalWeight - penaltyWeight) / totalWeight) * 100));
  }

  /**
   * Set optimization metrics
   */
  public setMetrics(metrics: OptimizationMetrics): void {
    this.metrics = metrics;
  }

  /**
   * Set rollback information
   */
  public setRollbackData(rollbackData: RollbackInformation): void {
    this.rollbackData = rollbackData;
  } /**
   * Generate executive summary
   */

  public generateExecutiveSummary(): string {
    const complianceScore = this.calculateComplianceScore();
    const criticalCount = this.getCriticalFindings().length;
    const autoFixableCount = this.getAutoFixableFindings().length;

    return `
Audit completed on ${this.timestamp.toLocaleDateString()} at ${this.timestamp.toLocaleTimeString()}.

Key Results:
- Compliance Score: ${complianceScore}%
- Total Files Scanned: ${this.summary.totalFilesScanned}
- Critical Issues Found: ${criticalCount}
- Auto-fixable Issues: ${autoFixableCount}
- Space Reclaimed: ${Math.round(this.summary.spaceReclaimed / 1024 / 1024)} MB
- Files Removed: ${this.summary.filesRemoved}

${
      criticalCount > 0
        ? '⚠️ Critical issues require immediate attention.'
        : '✅ No critical issues found.'
    }
${autoFixableCount > 0 ? `🔧 ${autoFixableCount} issues can be automatically fixed.` : ''}
    `.trim();
  }

  /**
   * Update summary based on findings
   */
  private updateSummaryFromFindings(): void {
    this.summary.violationsFound = this.findings.length;
    this.summary.unusedFilesFound = this.getFindingsByType(FindingType.UNUSED_FILE).length;
    this.summary.orphanedFilesFound = this.getFindingsByType(
      FindingType.ORPHANED_DEPENDENCY,
    ).length;
    this.summary.redundantFilesFound = this.getFindingsByType(FindingType.REDUNDANT_CODE).length;
  }

  /**
   * Update summary based on actions
   */
  private updateSummaryFromActions(): void {
    this.summary.filesRemoved = this.actions.filter(
      action =>
        action.status === 'executed'
        && (action.type === 'delete_file' || action.type === 'delete_directory'),
    ).length;

    this.summary.spaceReclaimed = this.actions
      .filter(action => action.status === 'executed')
      .reduce((total, action) => {
        return total + (action.impactAssessment.estimatedSavings?.size || 0);
      }, 0);
  }

  /**
   * Create empty summary structure
   */
  private createEmptySummary(): AuditSummary {
    return {
      totalFilesScanned: 0,
      unusedFilesFound: 0,
      orphanedFilesFound: 0,
      redundantFilesFound: 0,
      violationsFound: 0,
      filesRemoved: 0,
      spaceReclaimed: 0,
    };
  }

  /**
   * Create empty metrics structure
   */
  private createEmptyMetrics(): OptimizationMetrics {
    const emptyRepoMetrics = {
      totalFiles: 0,
      totalSize: 0,
      dependencyCount: 0,
      circularDependencies: 0,
      complianceScore: 0,
      testCoverage: 0,
    };

    return {
      beforeMetrics: emptyRepoMetrics,
      afterMetrics: emptyRepoMetrics,
      improvement: {
        filesReduced: 0,
        sizeReduced: 0,
        dependenciesOptimized: 0,
        violationsResolved: 0,
        complianceImproved: 0,
      },
    };
  }

  /**
   * Generate unique report ID
   */
  private static generateReportId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `audit_${timestamp}_${random}`;
  }

  /**
   * Convert to JSON representation
   */
  public toJSON(): object {
    return {
      reportId: this.reportId,
      timestamp: this.timestamp,
      summary: this.summary,
      findings: this.findings,
      actions: this.actions.map(action => action.toJSON()),
      metrics: this.metrics,
      warnings: this.warnings,
      rollbackData: this.rollbackData,
    };
  }

  /**
   * Create AuditReport from JSON representation
   */
  public static fromJSON(data: any): AuditReport {
    const report = new AuditReport(data.reportId);

    report.summary = data.summary;
    report.findings = data.findings || [];
    report.actions = (data.actions || []).map((actionData: any) =>
      CleanupAction.fromJSON(actionData)
    );
    report.metrics = data.metrics;
    report.warnings = data.warnings || [];
    report.rollbackData = data.rollbackData;

    return report;
  }
}
