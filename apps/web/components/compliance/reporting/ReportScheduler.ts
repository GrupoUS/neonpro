/**
 * ReportScheduler - Automated compliance report scheduling and distribution system
 * Handles recurring report generation, email distribution, and webhook notifications
 */

import { complianceService, } from '../ComplianceService'
import type { ComplianceFramework, } from '../types'
import type { GeneratedReport, ReportGenerationConfig, } from './ComplianceReportGenerator'
import { ComplianceReportGenerator, } from './ComplianceReportGenerator'

export interface ReportSchedule {
  id: string
  name: string
  description?: string
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  cronExpression?: string // For custom schedules
  reportConfig: ReportGenerationConfig
  distribution: {
    email?: {
      enabled: boolean
      recipients: string[]
      subject?: string
      includeAttachment: boolean
      embedCharts: boolean
    }
    webhook?: {
      enabled: boolean
      url: string
      secret?: string
      includeReportData: boolean
    }
    storage?: {
      enabled: boolean
      location: string // S3, Google Drive, etc.
      retention: number // days
    }
    dashboard?: {
      enabled: boolean
      notify: boolean
    }
  }
  filters?: {
    minimumScore?: number
    maximumViolations?: number
    criticalViolationsOnly?: boolean
    frameworks?: ComplianceFramework[]
  }
  createdAt: Date
  updatedAt: Date
  lastRun?: Date
  nextRun?: Date
  isRunning: boolean
}

export interface ScheduleExecutionResult {
  scheduleId: string
  executionId: string
  startTime: Date
  endTime: Date
  duration: number
  success: boolean
  report?: GeneratedReport
  distributionResults: DistributionResults // <-- changed to explicit type
  error?: string
}

// Add concrete distribution results type
export interface DistributionResults {
  email?: { success: boolean; recipients: string[]; error?: string }
  webhook?: { success: boolean; statusCode?: number; error?: string }
  storage?: { success: boolean; location?: string; error?: string }
  dashboard?: { success: boolean; error?: string }
}

// Add explicit types for compliance data items
export interface ScoreItem {
  score: number
  framework: ComplianceFramework
  [key: string]: unknown
}

export interface ViolationItem {
  id?: string
  severity?: 'critical' | 'major' | 'minor' | string
  status?: 'open' | 'resolved' | string
  framework?: ComplianceFramework
  [key: string]: unknown
}

export interface TestResultItem {
  name?: string
  passed?: boolean
  details?: unknown
}

export class ReportScheduler {
  private schedules: Map<string, ReportSchedule> = new Map()
  private runningExecutions: Map<string, boolean> = new Map()
  private reportGenerator: ComplianceReportGenerator
  private intervalId?: ReturnType<typeof setInterval>

  constructor() {
    this.reportGenerator = new ComplianceReportGenerator()
    this.initializeScheduler()
  }

  /**
   * Create a new report schedule
   */
  async createSchedule(
    schedule: Omit<ReportSchedule, 'id' | 'createdAt' | 'updatedAt' | 'isRunning'>,
  ): Promise<ReportSchedule> {
    const newSchedule: ReportSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      isRunning: false,
      nextRun: this.calculateNextRun(schedule.frequency, schedule.cronExpression,),
    }

    this.schedules.set(newSchedule.id, newSchedule,)

    console.log(`📅 Created report schedule: ${newSchedule.name} (${newSchedule.frequency})`,)

    // Save to database (would be implemented with actual DB)
    await this.saveSchedule(newSchedule,)

    return newSchedule
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(
    scheduleId: string,
    updates: Partial<ReportSchedule>,
  ): Promise<ReportSchedule> {
    const schedule = this.schedules.get(scheduleId,)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`,)
    }

    const updatedSchedule = {
      ...schedule,
      ...updates,
      updatedAt: new Date(),
      nextRun: updates.frequency
        ? this.calculateNextRun(updates.frequency, updates.cronExpression,)
        : schedule.nextRun,
    }

    this.schedules.set(scheduleId, updatedSchedule,)

    console.log(`📝 Updated report schedule: ${updatedSchedule.name}`,)

    await this.saveSchedule(updatedSchedule,)

    return updatedSchedule
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string,): Promise<void> {
    const schedule = this.schedules.get(scheduleId,)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`,)
    }

    this.schedules.delete(scheduleId,)

    console.log(`🗑️ Deleted report schedule: ${schedule.name}`,)

    await this.removeSchedule(scheduleId,)
  }

  /**
   * Enable or disable a schedule
   */
  async toggleSchedule(scheduleId: string, enabled: boolean,): Promise<ReportSchedule> {
    const schedule = this.schedules.get(scheduleId,)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`,)
    }

    schedule.enabled = enabled
    schedule.updatedAt = new Date()

    if (enabled) {
      schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.cronExpression,)
    } else {
      schedule.nextRun = undefined
    }

    console.log(
      `${enabled ? '✅' : '⏸️'} ${
        enabled ? 'Enabled' : 'Disabled'
      } report schedule: ${schedule.name}`,
    )

    await this.saveSchedule(schedule,)

    return schedule
  }

  /**
   * Execute a schedule immediately
   */
  async executeSchedule(
    scheduleId: string,
    force: boolean = false,
  ): Promise<ScheduleExecutionResult> {
    const schedule = this.schedules.get(scheduleId,)
    if (!schedule) {
      throw new Error(`Schedule not found: ${scheduleId}`,)
    }

    if (schedule.isRunning && !force) {
      throw new Error(`Schedule is already running: ${scheduleId}`,)
    }

    const executionId = `exec_${Date.now()}`
    const startTime = new Date()

    console.log(`🚀 Executing report schedule: ${schedule.name} (${executionId})`,)

    try {
      // Mark as running
      schedule.isRunning = true
      this.runningExecutions.set(executionId, true,)

      // Collect compliance data
      const complianceData = await this.collectComplianceData(schedule.reportConfig.frameworks,)

      // Check filters before generating report
      if (!this.passesFilters(complianceData, schedule.filters,)) {
        console.log(`⏭️ Skipping report generation - filters not met for ${schedule.name}`,)
        return this.createSkippedExecutionResult(
          scheduleId,
          executionId,
          startTime,
          'Filters not met',
        )
      }

      // Generate report
      const report = await this.reportGenerator.generateReport(
        complianceData as any,
        schedule.reportConfig,
      )

      // Distribute report
      const distributionResults = await this.distributeReport(report, schedule,)

      // Update schedule
      schedule.lastRun = new Date()
      schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.cronExpression,)
      await this.saveSchedule(schedule,)

      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      console.log(`✅ Report schedule completed: ${schedule.name} (${duration}ms)`,)

      return {
        scheduleId,
        executionId,
        startTime,
        endTime,
        duration,
        success: true,
        report,
        distributionResults, // typed now, no `as any`
      }
    } catch (error) {
      const endTime = new Date()
      const duration = endTime.getTime() - startTime.getTime()

      console.error(`❌ Report schedule failed: ${schedule.name}`, error,)

      return {
        scheduleId,
        executionId,
        startTime,
        endTime,
        duration,
        success: false,
        distributionResults: {} as DistributionResults, // empty for error case
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    } finally {
      schedule.isRunning = false
      this.runningExecutions.delete(executionId,)
    }
  }

  /**
   * Get all schedules
   */
  getSchedules(): ReportSchedule[] {
    return Array.from(this.schedules.values(),)
  }

  /**
   * Get schedule by ID
   */
  getSchedule(scheduleId: string,): ReportSchedule | undefined {
    return this.schedules.get(scheduleId,)
  }

  /**
   * Get schedules due for execution
   */
  getDueSchedules(): ReportSchedule[] {
    const now = new Date()
    return Array.from(this.schedules.values(),).filter(
      schedule =>
        schedule.enabled
        && schedule.nextRun
        && schedule.nextRun <= now
        && !schedule.isRunning,
    )
  }

  /**
   * Start the scheduler daemon
   */
  startScheduler(): void {
    console.log('🕒 Starting report scheduler daemon',)

    // Avoid duplicate intervals if called twice
    if (this.intervalId) {
      clearInterval(this.intervalId,)
    }

    // Check for due schedules every minute
    this.intervalId = setInterval(async () => {
      await this.processDueSchedules()
    }, 60_000,) // 60 seconds
  }

  /**
   * Stop the scheduler daemon
   */
  stopScheduler(): void {
    console.log('⏹️ Stopping report scheduler daemon',)
    if (this.intervalId) {
      clearInterval(this.intervalId,)
      this.intervalId = undefined
    }
  }

  /**
   * Process schedules that are due for execution
   */
  private async processDueSchedules(): Promise<void> {
    const dueSchedules = this.getDueSchedules()

    if (dueSchedules.length === 0) {
      return
    }

    console.log(`⏰ Found ${dueSchedules.length} due schedules`,)

    // Execute due schedules (with concurrency limit)
    const maxConcurrent = 3
    for (let i = 0; i < dueSchedules.length; i += maxConcurrent) {
      const batch = dueSchedules.slice(i, i + maxConcurrent,)
      const executions = batch.map(schedule => this.executeSchedule(schedule.id,))

      await Promise.allSettled(executions,)
    }
  }

  /**
   * Initialize scheduler with existing schedules from database
   */
  private async initializeScheduler(): Promise<void> {
    try {
      // Load schedules from database
      const savedSchedules = await this.loadSchedules()

      for (const schedule of savedSchedules) {
        this.schedules.set(schedule.id, schedule,)
      }

      console.log(`📋 Loaded ${savedSchedules.length} report schedules`,)
    } catch (error) {
      console.error('Error initializing scheduler:', error,)
    }
  }

  /**
   * Calculate next run time based on frequency
   */
  private calculateNextRun(frequency: ReportSchedule['frequency'], cronExpression?: string,): Date {
    const now = new Date()

    if (cronExpression) {
      // Would use a cron library like node-cron to calculate next run
      return new Date(now.getTime() + 24 * 60 * 60 * 1000,) // Mock: next day
    }

    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000,)
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000,)
      case 'monthly':
        return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate(),)
      case 'quarterly':
        return new Date(now.getFullYear(), now.getMonth() + 3, now.getDate(),)
      case 'yearly':
        return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate(),)
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000,)
    }
  }

  /**
   * Collect compliance data for report generation
   */
  private async collectComplianceData(frameworks: ComplianceFramework[],): Promise<unknown> {
    const scores: ScoreItem[] = []
    const violations: ViolationItem[] = []
    const testResults: TestResultItem[] = []

    for (const framework of frameworks) {
      // Safely normalize external service responses to our explicit item types.
      const rawScores = await complianceService.fetchComplianceScores(framework,)
      const frameworkScores = (rawScores as unknown[]).map((item,) => {
        const raw = item as unknown
        const record = typeof raw === 'object' && raw !== null
          ? (raw as Record<string, unknown>)
          : {}

        const score = typeof record['score'] === 'number' ? (record['score'] as number) : 0

        return {
          // keep other fields from the original item (index signature allows this)
          ...record,
          score,
          framework,
        } as ScoreItem
      },)

      const rawViolations = await complianceService.fetchViolations({ framework, },)
      const frameworkViolations = (rawViolations as unknown[]).map((item,) => {
        const raw = item as unknown
        const record = typeof raw === 'object' && raw !== null
          ? (raw as Record<string, unknown>)
          : {}

        const id = typeof record['id'] === 'string' ? (record['id'] as string) : undefined
        const severity = typeof record['severity'] === 'string'
          ? (record['severity'] as 'critical' | 'major' | 'minor' | string)
          : undefined
        const status = typeof record['status'] === 'string'
          ? (record['status'] as string)
          : undefined

        return {
          ...record,
          id,
          severity,
          status,
          framework,
        } as ViolationItem
      },)

      scores.push(...frameworkScores,)
      violations.push(...frameworkViolations,)
    }

    // Calculate summary
    const overallScore = scores.length
      ? Math.round(scores.reduce((sum, s,) => sum + s.score, 0,) / scores.length,)
      : 0

    const frameworkScores = frameworks.reduce((acc, framework,) => {
      const frameworkScoresForFramework = scores.filter(s => s.framework === framework)
      acc[framework] = frameworkScoresForFramework.length
        ? Math.round(
          frameworkScoresForFramework.reduce((sum, s,) => sum + s.score, 0,)
            / frameworkScoresForFramework.length,
        )
        : 0
      return acc
    }, {} as Record<ComplianceFramework, number>,)

    return {
      scores,
      violations,
      testResults,
      summary: {
        overallScore,
        frameworkScores,
        totalViolations: violations.length,
        criticalViolations: violations.filter(v => v.severity === 'critical').length,
        openViolations: violations.filter(v => v.status === 'open').length,
        resolvedViolations: violations.filter(v => v.status === 'resolved').length,
        improvementAreas: this.identifyImprovementAreas(scores, violations,),
        achievements: this.identifyAchievements(scores, violations,),
      },
    }
  }

  /**
   * Check if compliance data passes schedule filters
   */
  private passesFilters(data: unknown, filters?: ReportSchedule['filters'],): boolean {
    if (!filters) return true

    if (filters.minimumScore && (data as any).summary.overallScore < filters.minimumScore) {
      return false
    }

    if (
      filters.maximumViolations && (data as any).summary.totalViolations > filters.maximumViolations
    ) {
      return false
    }

    if (filters.criticalViolationsOnly && (data as any).summary.criticalViolations === 0) {
      return false
    }

    return true
  }

  /**
   * Distribute report according to schedule configuration
   */
  private async distributeReport(
    report: GeneratedReport,
    schedule: ReportSchedule,
  ): Promise<DistributionResults> {
    const results: Partial<DistributionResults> = {}

    // Email distribution
    if (schedule.distribution.email?.enabled) {
      try {
        await (this.sendEmailReport)(report, schedule.distribution.email,)
        results.email = {
          success: true,
          recipients: schedule.distribution.email.recipients,
        }
      } catch (error) {
        results.email = {
          success: false,
          recipients: schedule.distribution.email.recipients,
          error: error instanceof Error ? error.message : 'Email sending failed',
        }
      }
    }

    // Webhook notification
    if (schedule.distribution.webhook?.enabled) {
      try {
        const statusCode = await this.sendWebhookNotification(
          report,
          schedule.distribution.webhook,
        )
        results.webhook = { success: true, statusCode, }
      } catch (error) {
        results.webhook = {
          success: false,
          error: error instanceof Error ? error.message : 'Webhook failed',
        }
      }
    }

    // Storage upload
    if (schedule.distribution.storage?.enabled) {
      try {
        const location = await this.uploadToStorage(report, schedule.distribution.storage,)
        results.storage = { success: true, location, }
      } catch (error) {
        results.storage = {
          success: false,
          error: error instanceof Error ? error.message : 'Storage upload failed',
        }
      }
    }

    // Dashboard notification
    if (schedule.distribution.dashboard?.enabled) {
      try {
        await this.notifyDashboard(report, schedule.distribution.dashboard,)
        results.dashboard = { success: true, }
      } catch (error) {
        results.dashboard = {
          success: false,
          error: error instanceof Error ? error.message : 'Dashboard notification failed',
        }
      }
    }

    return results as DistributionResults
  }

  /**
   * Create execution result for skipped schedules
   */
  private createSkippedExecutionResult(
    scheduleId: string,
    executionId: string,
    startTime: Date,
    reason: string,
  ): ScheduleExecutionResult {
    const endTime = new Date()
    return {
      scheduleId,
      executionId,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      success: true,
      distributionResults: {} as DistributionResults, // empty for skipped case
      error: `Skipped: ${reason}`,
    }
  }

  // Helper methods for distribution (mock implementations)
  private async sendEmailReport(report: GeneratedReport, config: unknown,): Promise<void> {
    const cfg = typeof config === 'object' && config !== null
      ? (config as Record<string, unknown>)
      : {}
    const recipients = Array.isArray(cfg.recipients,) ? cfg.recipients.map(String,) : []
    console.log(`📧 Sending email report to ${recipients.join(', ',)}`,)
    // Would implement actual email sending
  }

  private async sendWebhookNotification(
    report: GeneratedReport,
    config: unknown,
  ): Promise<number> {
    const cfg = typeof config === 'object' && config !== null
      ? (config as Record<string, unknown>)
      : {}
    const url = typeof cfg.url === 'string' ? cfg.url : 'unknown'
    console.log(`🔗 Sending webhook notification to ${url}`,)
    // TODO: Implement webhook notification logic
    return 200 // Return success status code
  }

  private async removeSchedule(_scheduleId: string,): Promise<void> {
    // Would remove from actual database
  }

  private async loadSchedules(): Promise<ReportSchedule[]> {
    // Would load from actual database
    return []
  }

  private async saveSchedule(_schedule: ReportSchedule,): Promise<void> {
    // Would save to actual database
  }

  private async uploadToStorage(_report: GeneratedReport, _config: unknown,): Promise<string> {
    // Would upload to actual storage (S3, etc.)
    return 'https://storage.example.com/reports/report-123.pdf'
  }

  private async notifyDashboard(_report: GeneratedReport, _config: unknown,): Promise<void> {
    // Would notify dashboard about new report
    console.log('📊 Notifying dashboard about new report',)
  }

  // Analysis helper methods
  private identifyImprovementAreas(_scores: unknown[], _violations: unknown[],): string[] {
    // Would analyze data to identify improvement opportunities
    return ['WCAG Color Contrast', 'LGPD Consent Management',]
  }

  private identifyAchievements(_scores: unknown[], _violations: unknown[],): string[] {
    // Would analyze data to identify achievements
    return ['Zero Critical ANVISA Violations', 'CFM Ethics Score Above 90%',]
  }
}

// Export singleton instance
export const reportScheduler = new ReportScheduler()
