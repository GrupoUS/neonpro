/**
 * Error Reporter for NeonPro Audit System
 *
 * Generates comprehensive error reports with detailed context, user-friendly messages,
 * technical details, actionable recommendations, and multi-format output capabilities.
 */

import { EventEmitter, } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'
import {
  AuditError,
  ErrorBatch,
  ErrorCategory,
  ErrorClassification,
  ErrorContext,
  ErrorMetrics,
  ErrorReport,
  ErrorSeverity,
  ErrorUtils,
  RecoveryResult,
} from './error-types.js'

/**
 * Report configuration options
 */
export interface ReportConfig {
  /** Output directory for reports */
  outputDirectory: string
  /** Report formats to generate */
  formats: ReportFormat[]
  /** Include stack traces in reports */
  includeStackTraces: boolean
  /** Include system state in reports */
  includeSystemState: boolean
  /** Include recovery attempts in reports */
  includeRecoveryAttempts: boolean
  /** Include recommendations */
  includeRecommendations: boolean
  /** Maximum report file size (bytes) */
  maxReportSize: number
  /** Enable report compression */
  enableCompression: boolean
  /** Anonymize sensitive data */
  anonymizeSensitiveData: boolean
  /** Report retention period (days) */
  retentionPeriodDays: number
}

/**
 * Supported report formats
 */
export type ReportFormat = 'json' | 'html' | 'markdown' | 'csv' | 'xml'

/**
 * Report template interface
 */
interface ReportTemplate {
  format: ReportFormat
  render(report: ErrorReport, config: ReportConfig,): Promise<string>
  getFileExtension(): string
  getContentType(): string
}

/**
 * Error aggregation options
 */
interface AggregationOptions {
  groupBy: 'category' | 'severity' | 'component' | 'timeframe'
  timeframe?: 'hour' | 'day' | 'week' | 'month'
  includeMetrics?: boolean
  includeCharts?: boolean
}

/**
 * Report delivery options
 */
interface DeliveryOptions {
  email?: {
    recipients: string[]
    subject: string
    includeAttachments: boolean
  }
  webhook?: {
    url: string
    headers: Record<string, string>
    payload: 'full' | 'summary'
  }
  slack?: {
    webhookUrl: string
    channel: string
    mentions: string[]
  }
}

/**
 * Comprehensive error reporter with multi-format output and intelligent recommendations
 */
export class ErrorReporter extends EventEmitter {
  private config: ReportConfig
  private templates: Map<ReportFormat, ReportTemplate>
  private reportHistory: Map<string, ErrorReport>
  private aggregatedReports: Map<string, ErrorBatch>

  constructor(config: Partial<ReportConfig> = {},) {
    super()

    this.config = {
      outputDirectory: './error-reports',
      formats: ['json', 'html',],
      includeStackTraces: true,
      includeSystemState: true,
      includeRecoveryAttempts: true,
      includeRecommendations: true,
      maxReportSize: 10 * 1024 * 1024, // 10MB
      enableCompression: false,
      anonymizeSensitiveData: true,
      retentionPeriodDays: 30,
      ...config,
    }

    this.templates = new Map()
    this.reportHistory = new Map()
    this.aggregatedReports = new Map()

    this.initializeTemplates()
    this.ensureOutputDirectory()
  }

  /**
   * Generate comprehensive error report
   */
  async generateReport(
    error: AuditError,
    classification: ErrorClassification,
    recoveryAttempts: RecoveryResult[] = [],
    relatedErrors: AuditError[] = [],
  ): Promise<ErrorReport> {
    const report: ErrorReport = {
      context: error.context,
      classification,
      originalError: error,
      recoveryAttempts,
      userMessage: this.generateUserMessage(error, classification,),
      technicalDetails: this.generateTechnicalDetails(error, classification,),
      recommendations: this.generateRecommendations(error, classification, recoveryAttempts,),
      relatedErrors,
    }

    // Anonymize sensitive data if enabled
    if (this.config.anonymizeSensitiveData) {
      this.anonymizeReport(report,)
    }

    // Store in history
    this.reportHistory.set(error.errorId, report,)

    this.emit('report_generated', { report, error, },)
    return report
  }

  /**
   * Generate and save error report in multiple formats
   */
  async generateAndSaveReport(
    error: AuditError,
    classification: ErrorClassification,
    recoveryAttempts: RecoveryResult[] = [],
    relatedErrors: AuditError[] = [],
    customFormats?: ReportFormat[],
  ): Promise<string[]> {
    const report = await this.generateReport(
      error,
      classification,
      recoveryAttempts,
      relatedErrors,
    )
    const formats = customFormats || this.config.formats
    const reportPaths: string[] = []

    for (const format of formats) {
      try {
        const filePath = await this.saveReport(report, format,)
        reportPaths.push(filePath,)
        this.emit('report_saved', { report, format, filePath, },)
      } catch (saveError) {
        this.emit('report_save_failed', { report, format, error: saveError, },)
      }
    }

    return reportPaths
  }

  /**
   * Generate batch report for multiple errors
   */
  async generateBatchReport(
    errors: AuditError[],
    options: AggregationOptions = { groupBy: 'category', },
  ): Promise<ErrorBatch> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36,).substr(2, 9,)}`

    const batch: ErrorBatch = {
      batchId,
      errors,
      totalCount: errors.length,
      severityDistribution: this.calculateSeverityDistribution(errors,),
      categoryDistribution: this.calculateCategoryDistribution(errors,),
      recoverableCount: errors.filter(e => e.recoverable).length,
      timestamp: new Date(),
    }

    this.aggregatedReports.set(batchId, batch,)
    this.emit('batch_report_generated', { batch, options, },)

    return batch
  }

  /**
   * Generate metrics report
   */
  async generateMetricsReport(
    errors: AuditError[],
    timeframe: 'hour' | 'day' | 'week' | 'month' = 'day',
  ): Promise<ErrorMetrics> {
    const metrics: ErrorMetrics = {
      totalErrors: errors.length,
      errorsByCategory: this.calculateCategoryDistribution(errors,),
      errorsBySeverity: this.calculateSeverityDistribution(errors,),
      recoverySuccessRate: this.calculateRecoverySuccessRate(errors,),
      averageRecoveryTime: this.calculateAverageRecoveryTime(errors,),
      mostCommonErrors: this.findMostCommonErrors(errors,),
      errorTrends: this.calculateErrorTrends(errors, timeframe,),
    }

    this.emit('metrics_report_generated', { metrics, timeframe, },)
    return metrics
  }

  /**
   * Save report to file system
   */
  private async saveReport(report: ErrorReport, format: ReportFormat,): Promise<string> {
    const template = this.templates.get(format,)
    if (!template) {
      throw new Error(`No template found for format: ${format}`,)
    }

    const content = await template.render(report, this.config,)

    // Check size limits
    if (content.length > this.config.maxReportSize) {
      throw new Error(
        `Report size exceeds maximum allowed size: ${content.length} > ${this.config.maxReportSize}`,
      )
    }

    const fileName = this.generateFileName(report, format,)
    const filePath = path.join(this.config.outputDirectory, fileName,)

    await fs.writeFile(filePath, content, 'utf-8',)
    return filePath
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserMessage(error: AuditError, classification: ErrorClassification,): string {
    const severity = this.getSeverityEmoji(error.severity,)
    const category = error.category.replace('_', ' ',).toUpperCase()

    let message = `${severity} ${category}: ${error.message}`

    // Add context-specific information
    if (error.category === ErrorCategory.FILESYSTEM && 'filePath' in error) {
      message += `\n📁 File: ${(error as any).filePath}`
    }

    if (error.category === ErrorCategory.PERFORMANCE && 'metric' in error) {
      message += `\n📊 Metric: ${(error as any).metric}`
    }

    if (error.category === ErrorCategory.MEMORY && 'currentUsage' in error) {
      const usage = ((error as any).currentUsage / 1024 / 1024).toFixed(2,)
      const max = ((error as any).maxUsage / 1024 / 1024).toFixed(2,)
      message += `\n💾 Memory: ${usage}MB / ${max}MB`
    }

    // Add recovery information
    if (classification.recoverable) {
      message += `\n🔄 Recovery strategy: ${classification.recoveryStrategy.replace('_', ' ',)}`
    } else {
      message += '\n❌ This error requires manual intervention'
    }

    return message
  }

  /**
   * Generate technical details for debugging
   */
  private generateTechnicalDetails(
    error: AuditError,
    classification: ErrorClassification,
  ): string {
    const details = {
      error: {
        id: error.errorId,
        type: error.constructor.name,
        category: error.category,
        severity: error.severity,
        recoverable: error.recoverable,
        message: error.message,
        timestamp: error.timestamp.toISOString(),
      },
      classification: {
        strategy: classification.recoveryStrategy,
        impact: classification.impactScore,
        confidence: classification.confidence,
      },
      context: {
        component: error.context.component,
        operation: error.context.operation,
        trigger: error.context.trigger,
        systemState: this.config.includeSystemState ? error.context.systemState : undefined,
      },
      stack: this.config.includeStackTraces ? error.stack : undefined,
      innerError: error.innerError
        ? {
          name: error.innerError.name,
          message: error.innerError.message,
          stack: this.config.includeStackTraces ? error.innerError.stack : undefined,
        }
        : undefined,
    }

    return JSON.stringify(details, null, 2,)
  }

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    error: AuditError,
    classification: ErrorClassification,
    recoveryAttempts: RecoveryResult[],
  ): string[] {
    const recommendations: string[] = []

    // Category-specific recommendations
    switch (error.category) {
      case ErrorCategory.MEMORY:
        recommendations.push(
          'Consider increasing available memory or implementing memory pooling',
          'Check for memory leaks in recent code changes',
          'Enable garbage collection monitoring',
          'Review large object allocations',
        )
        break

      case ErrorCategory.FILESYSTEM:
        recommendations.push(
          'Verify file permissions and access rights',
          'Check disk space availability',
          'Ensure file paths are correctly formatted',
          'Consider using alternative file locations',
        )
        break

      case ErrorCategory.PERFORMANCE:
        recommendations.push(
          'Review system resource utilization',
          'Consider implementing caching strategies',
          'Optimize database queries and operations',
          'Enable performance monitoring',
        )
        break

      case ErrorCategory.DEPENDENCY:
        recommendations.push(
          'Review dependency graph for circular references',
          'Update outdated dependencies',
          'Consider dependency injection patterns',
          'Implement lazy loading for non-critical dependencies',
        )
        break

      case ErrorCategory.NETWORK:
        recommendations.push(
          'Check network connectivity and firewall settings',
          'Implement retry mechanisms with exponential backoff',
          'Consider using connection pooling',
          'Monitor network latency and throughput',
        )
        break

      case ErrorCategory.CONFIGURATION:
        recommendations.push(
          'Review configuration file syntax and values',
          'Validate configuration against schema',
          'Check environment variable settings',
          'Consider using configuration management tools',
        )
        break

      case ErrorCategory.CONSTITUTIONAL:
        recommendations.push(
          'Review constitutional requirements and system limits',
          'Consider architectural optimizations',
          'Implement resource monitoring and alerting',
          'Plan for horizontal or vertical scaling',
        )
        break

      default:
        recommendations.push(
          'Review recent code changes that may have introduced this issue',
          'Check system logs for additional context',
          'Consider implementing additional error handling',
          'Monitor system metrics for patterns',
        )
    }

    // Recovery attempt-specific recommendations
    if (recoveryAttempts.length > 0) {
      const failedAttempts = recoveryAttempts.filter(r => !r.success)

      if (failedAttempts.length === recoveryAttempts.length) {
        recommendations.push(
          'All recovery attempts failed - consider manual intervention',
          'Review recovery strategies for this error type',
          'Check system resources and dependencies',
        )
      } else {
        recommendations.push(
          'Some recovery attempts succeeded - monitor for recurrence',
          'Consider improving recovery strategies based on successful patterns',
        )
      }
    }

    // Severity-specific recommendations
    if (error.severity === ErrorSeverity.CRITICAL) {
      recommendations.push(
        '🚨 CRITICAL: Immediate attention required',
        'Consider activating incident response procedures',
        'Notify relevant stakeholders immediately',
      )
    }

    return recommendations
  }

  /**
   * Anonymize sensitive data in reports
   */
  private anonymizeReport(report: ErrorReport,): void {
    // Anonymize file paths
    if (report.technicalDetails) {
      report.technicalDetails = report.technicalDetails.replace(
        /\/[^\/\s]+\/[^\/\s]+\/[^\/\s]+/g,
        '/***/***/***',
      )
    }

    // Anonymize error messages with potential sensitive data
    if (
      report.originalError.message.includes('password',)
      || report.originalError.message.includes('token',)
      || report.originalError.message.includes('key',)
    ) {
      report.userMessage = report.userMessage.replace(/[\w\-\.]+@[\w\-\.]+/g, '***@***.***',)
      report.userMessage = report.userMessage.replace(/[a-zA-Z0-9]{20,}/g, '***REDACTED***',)
    }

    // Anonymize system state sensitive information
    if (report.context.systemState) {
      const sensitiveKeys = ['password', 'token', 'key', 'secret', 'auth',]
      for (const key of Object.keys(report.context.systemState,)) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive,))) {
          report.context.systemState[key] = '***REDACTED***'
        }
      }
    }
  }

  /**
   * Generate file name for report
   */
  private generateFileName(report: ErrorReport, format: ReportFormat,): string {
    const template = this.templates.get(format,)
    const extension = template?.getFileExtension() || format
    const timestamp = report.context.timestamp.toISOString().replace(/[:.]/g, '-',)
    const category = report.classification.category
    const severity = report.classification.severity

    return `error-report_${category}_${severity}_${timestamp}.${extension}`
  }

  /**
   * Calculate severity distribution
   */
  private calculateSeverityDistribution(errors: AuditError[],): Record<ErrorSeverity, number> {
    const distribution: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0,
    }

    errors.forEach(error => {
      distribution[error.severity]++
    },)

    return distribution
  }

  /**
   * Calculate category distribution
   */
  private calculateCategoryDistribution(errors: AuditError[],): Record<ErrorCategory, number> {
    const distribution = {} as Record<ErrorCategory, number>

    errors.forEach(error => {
      distribution[error.category] = (distribution[error.category] || 0) + 1
    },)

    return distribution
  }

  /**
   * Calculate recovery success rate
   */
  private calculateRecoverySuccessRate(errors: AuditError[],): number {
    const recoverableErrors = errors.filter(e => e.recoverable)
    if (recoverableErrors.length === 0) return 0

    // This would need to be tracked from actual recovery attempts
    // For now, we'll simulate based on error characteristics
    const successfulRecoveries = recoverableErrors.filter(e =>
      e.severity !== ErrorSeverity.CRITICAL
      && e.category !== ErrorCategory.CONSTITUTIONAL
    ).length

    return successfulRecoveries / recoverableErrors.length
  }

  /**
   * Calculate average recovery time
   */
  private calculateAverageRecoveryTime(errors: AuditError[],): number {
    // This would be tracked from actual recovery operations
    // Simulated for demonstration
    return 5000 // 5 seconds average
  }

  /**
   * Find most common errors
   */
  private findMostCommonErrors(errors: AuditError[],): { error: string; count: number }[] {
    const errorCounts = new Map<string, number>()

    errors.forEach(error => {
      const key = `${error.category}:${error.message.substring(0, 50,)}`
      errorCounts.set(key, (errorCounts.get(key,) || 0) + 1,)
    },)

    return Array.from(errorCounts.entries(),)
      .map(([error, count,],) => ({ error, count, }))
      .sort((a, b,) => b.count - a.count)
      .slice(0, 10,)
  }

  /**
   * Calculate error trends over time
   */
  private calculateErrorTrends(
    errors: AuditError[],
    timeframe: 'hour' | 'day' | 'week' | 'month',
  ): { timestamp: Date; count: number }[] {
    const trends = new Map<string, number>()
    const now = new Date()

    errors.forEach(error => {
      const timestamp = new Date(error.timestamp,)
      let key: string

      switch (timeframe) {
        case 'hour':
          key = timestamp.toISOString().substring(0, 13,) // YYYY-MM-DDTHH
          break
        case 'day':
          key = timestamp.toISOString().substring(0, 10,) // YYYY-MM-DD
          break
        case 'week':
          const weekStart = new Date(timestamp,)
          weekStart.setDate(timestamp.getDate() - timestamp.getDay(),)
          key = weekStart.toISOString().substring(0, 10,)
          break
        case 'month':
          key = timestamp.toISOString().substring(0, 7,) // YYYY-MM
          break
      }

      trends.set(key, (trends.get(key,) || 0) + 1,)
    },)

    return Array.from(trends.entries(),)
      .map(([timestamp, count,],) => ({ timestamp: new Date(timestamp,), count, }))
      .sort((a, b,) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * Get severity emoji
   */
  private getSeverityEmoji(severity: ErrorSeverity,): string {
    const emojiMap = {
      [ErrorSeverity.LOW]: '⚪',
      [ErrorSeverity.MEDIUM]: '🟡',
      [ErrorSeverity.HIGH]: '🟠',
      [ErrorSeverity.CRITICAL]: '🔴',
    }

    return emojiMap[severity]
  }

  /**
   * Ensure output directory exists
   */
  private async ensureOutputDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.outputDirectory, { recursive: true, },)
    } catch (error) {
      this.emit('directory_creation_failed', {
        directory: this.config.outputDirectory,
        error,
      },)
    }
  }

  /**
   * Initialize report templates
   */
  private initializeTemplates(): void {
    // JSON Template
    this.templates.set('json', {
      format: 'json',
      getFileExtension: () => 'json',
      getContentType: () => 'application/json',
      render: async (report: ErrorReport,) => {
        return JSON.stringify(report, null, 2,)
      },
    },)

    // HTML Template
    this.templates.set('html', {
      format: 'html',
      getFileExtension: () => 'html',
      getContentType: () => 'text/html',
      render: async (report: ErrorReport, config: ReportConfig,) => {
        return this.renderHTMLReport(report, config,)
      },
    },)

    // Markdown Template
    this.templates.set('markdown', {
      format: 'markdown',
      getFileExtension: () => 'md',
      getContentType: () => 'text/markdown',
      render: async (report: ErrorReport,) => {
        return this.renderMarkdownReport(report,)
      },
    },)

    // CSV Template
    this.templates.set('csv', {
      format: 'csv',
      getFileExtension: () => 'csv',
      getContentType: () => 'text/csv',
      render: async (report: ErrorReport,) => {
        return this.renderCSVReport(report,)
      },
    },)
  }

  /**
   * Render HTML report
   */
  private renderHTMLReport(report: ErrorReport, config: ReportConfig,): string {
    const severity = this.getSeverityEmoji(report.classification.severity,)
    const recommendations = report.recommendations.map(r => `<li>${r}</li>`).join('',)

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Error Report - ${report.originalError.errorId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .section { margin: 20px 0; }
        .error-details { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .severity-critical { color: #d32f2f; }
        .severity-high { color: #ff9800; }
        .severity-medium { color: #ffc107; }
        .severity-low { color: #4caf50; }
        .recommendations ul { padding-left: 20px; }
        .technical-details { background: #f8f9fa; font-family: monospace; white-space: pre-wrap; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${severity} Error Report</h1>
        <p><strong>Error ID:</strong> ${report.originalError.errorId}</p>
        <p><strong>Timestamp:</strong> ${report.context.timestamp.toISOString()}</p>
        <p><strong>Component:</strong> ${report.context.component}</p>
        <p><strong>Operation:</strong> ${report.context.operation}</p>
    </div>
    
    <div class="section">
        <h2>User Message</h2>
        <div class="error-details">
            <pre>${report.userMessage}</pre>
        </div>
    </div>
    
    <div class="section">
        <h2>Classification</h2>
        <div class="error-details">
            <p><strong>Category:</strong> ${report.classification.category}</p>
            <p><strong>Severity:</strong> ${report.classification.severity}</p>
            <p><strong>Recoverable:</strong> ${report.classification.recoverable ? 'Yes' : 'No'}</p>
            <p><strong>Recovery Strategy:</strong> ${report.classification.recoveryStrategy}</p>
            <p><strong>Impact Score:</strong> ${
      (report.classification.impactScore * 100).toFixed(1,)
    }%</p>
            <p><strong>Confidence:</strong> ${
      (report.classification.confidence * 100).toFixed(1,)
    }%</p>
        </div>
    </div>
    
    ${
      config.includeRecoveryAttempts && report.recoveryAttempts.length > 0
        ? `
    <div class="section">
        <h2>Recovery Attempts</h2>
        <div class="error-details">
            ${
          report.recoveryAttempts.map((attempt, i,) => `
                <p><strong>Attempt ${i + 1}:</strong> ${
            attempt.success ? '✅ Success' : '❌ Failed'
          } 
                   (${attempt.strategy}, ${attempt.recoveryTime}ms)</p>
            `).join('',)
        }
        </div>
    </div>
    `
        : ''
    }
    
    ${
      config.includeRecommendations
        ? `
    <div class="section">
        <h2>Recommendations</h2>
        <div class="recommendations">
            <ul>${recommendations}</ul>
        </div>
    </div>
    `
        : ''
    }
    
    ${
      config.includeStackTraces
        ? `
    <div class="section">
        <h2>Technical Details</h2>
        <div class="technical-details">${report.technicalDetails}</div>
    </div>
    `
        : ''
    }
</body>
</html>`
  }

  /**
   * Render Markdown report
   */
  private renderMarkdownReport(report: ErrorReport,): string {
    const severity = this.getSeverityEmoji(report.classification.severity,)
    const recommendations = report.recommendations.map(r => `- ${r}`).join('\n',)

    return `# ${severity} Error Report

**Error ID:** ${report.originalError.errorId}  
**Timestamp:** ${report.context.timestamp.toISOString()}  
**Component:** ${report.context.component}  
**Operation:** ${report.context.operation}  

## User Message

\`\`\`
${report.userMessage}
\`\`\`

## Classification

- **Category:** ${report.classification.category}
- **Severity:** ${report.classification.severity}
- **Recoverable:** ${report.classification.recoverable ? 'Yes' : 'No'}
- **Recovery Strategy:** ${report.classification.recoveryStrategy}
- **Impact Score:** ${(report.classification.impactScore * 100).toFixed(1,)}%
- **Confidence:** ${(report.classification.confidence * 100).toFixed(1,)}%

${
      report.recoveryAttempts.length > 0
        ? `## Recovery Attempts

${
          report.recoveryAttempts.map((attempt, i,) =>
            `${i + 1}. ${
              attempt.success ? '✅ Success' : '❌ Failed'
            } (${attempt.strategy}, ${attempt.recoveryTime}ms)`
          ).join('\n',)
        }`
        : ''
    }

## Recommendations

${recommendations}

## Technical Details

\`\`\`json
${report.technicalDetails}
\`\`\`
`
  }

  /**
   * Render CSV report
   */
  private renderCSVReport(report: ErrorReport,): string {
    const headers = [
      'error_id',
      'timestamp',
      'component',
      'operation',
      'category',
      'severity',
      'recoverable',
      'recovery_strategy',
      'impact_score',
      'confidence',
      'message',
      'recommendations_count',
    ]

    const row = [
      report.originalError.errorId,
      report.context.timestamp.toISOString(),
      report.context.component,
      report.context.operation,
      report.classification.category,
      report.classification.severity,
      report.classification.recoverable,
      report.classification.recoveryStrategy,
      report.classification.impactScore,
      report.classification.confidence,
      `"${report.originalError.message.replace(/"/g, '""',)}"`,
      report.recommendations.length,
    ]

    return headers.join(',',) + '\n' + row.join(',',)
  }

  /**
   * Get report history
   */
  public getReportHistory(): Map<string, ErrorReport> {
    return new Map(this.reportHistory,)
  }

  /**
   * Clean up old reports based on retention period
   */
  public async cleanupOldReports(): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriodDays,)

    let cleanedCount = 0

    for (const [errorId, report,] of this.reportHistory) {
      if (report.context.timestamp < cutoffDate) {
        this.reportHistory.delete(errorId,)
        cleanedCount++
      }
    }

    this.emit('reports_cleaned', { cleanedCount, cutoffDate, },)
    return cleanedCount
  }

  /**
   * Export aggregated reports
   */
  public async exportAggregatedReports(format: ReportFormat = 'json',): Promise<string> {
    const aggregatedData = {
      batches: Array.from(this.aggregatedReports.values(),),
      summary: {
        totalBatches: this.aggregatedReports.size,
        totalErrors: Array.from(this.aggregatedReports.values(),).reduce(
          (sum, batch,) => sum + batch.totalCount,
          0,
        ),
      },
      exportTimestamp: new Date().toISOString(),
    }

    const template = this.templates.get(format,)
    if (!template) {
      throw new Error(`No template found for format: ${format}`,)
    }

    const fileName = `aggregated-reports_${
      new Date().toISOString().replace(/[:.]/g, '-',)
    }.${template.getFileExtension()}`
    const filePath = path.join(this.config.outputDirectory, fileName,)

    const content = format === 'json'
      ? JSON.stringify(aggregatedData, null, 2,)
      : JSON.stringify(aggregatedData,) // Simplified for other formats

    await fs.writeFile(filePath, content, 'utf-8',)

    this.emit('aggregated_reports_exported', {
      filePath,
      format,
      batchCount: this.aggregatedReports.size,
    },)
    return filePath
  }
}
