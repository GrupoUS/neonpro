// =====================================================
// Data Cleanup Service
// Story 1.4: Session Management & Security
// =====================================================

import { SupabaseClient } from '@supabase/supabase-js'

// Types
export interface CleanupConfig {
  // Session cleanup settings
  expiredSessionRetentionDays: number
  inactiveSessionRetentionDays: number
  
  // Activity log cleanup settings
  activityLogRetentionDays: number
  
  // Security event cleanup settings
  securityEventRetentionDays: number
  resolvedEventRetentionDays: number
  
  // Audit log cleanup settings
  auditLogRetentionDays: number
  
  // Notification cleanup settings
  notificationRetentionDays: number
  readNotificationRetentionDays: number
  
  // Device cleanup settings
  inactiveDeviceRetentionDays: number
  
  // Batch processing settings
  batchSize: number
  maxExecutionTimeMs: number
}

export interface CleanupResult {
  operation: string
  recordsProcessed: number
  recordsDeleted: number
  executionTimeMs: number
  success: boolean
  error?: string
}

export interface CleanupSummary {
  totalOperations: number
  totalRecordsProcessed: number
  totalRecordsDeleted: number
  totalExecutionTimeMs: number
  successfulOperations: number
  failedOperations: number
  results: CleanupResult[]
  startTime: Date
  endTime: Date
}

export interface CleanupStats {
  lastCleanupRun: Date | null
  nextScheduledRun: Date | null
  totalCleanupRuns: number
  averageExecutionTimeMs: number
  totalRecordsDeleted: number
  cleanupHistory: CleanupSummary[]
}

// Data Cleanup Service
export class DataCleanupService {
  private supabase: SupabaseClient
  private config: CleanupConfig

  constructor(supabase: SupabaseClient, config?: Partial<CleanupConfig>) {
    this.supabase = supabase
    this.config = {
      // Default configuration
      expiredSessionRetentionDays: 7,
      inactiveSessionRetentionDays: 30,
      activityLogRetentionDays: 90,
      securityEventRetentionDays: 365,
      resolvedEventRetentionDays: 90,
      auditLogRetentionDays: 365,
      notificationRetentionDays: 30,
      readNotificationRetentionDays: 7,
      inactiveDeviceRetentionDays: 180,
      batchSize: 1000,
      maxExecutionTimeMs: 300000, // 5 minutes
      ...config
    }
  }

  // =====================================================
  // MAIN CLEANUP METHODS
  // =====================================================

  /**
   * Run complete data cleanup process
   */
  async runFullCleanup(): Promise<CleanupSummary> {
    const startTime = new Date()
    const results: CleanupResult[] = []

    console.log('Starting full data cleanup process...')

    try {
      // 1. Clean expired sessions
      results.push(await this.cleanExpiredSessions())
      
      // 2. Clean inactive sessions
      results.push(await this.cleanInactiveSessions())
      
      // 3. Clean old activity logs
      results.push(await this.cleanActivityLogs())
      
      // 4. Clean old security events
      results.push(await this.cleanSecurityEvents())
      
      // 5. Clean old audit logs
      results.push(await this.cleanAuditLogs())
      
      // 6. Clean old notifications
      results.push(await this.cleanNotifications())
      
      // 7. Clean inactive devices
      results.push(await this.cleanInactiveDevices())
      
      // 8. Optimize database
      results.push(await this.optimizeDatabase())

      const endTime = new Date()
      const summary: CleanupSummary = {
        totalOperations: results.length,
        totalRecordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
        totalRecordsDeleted: results.reduce((sum, r) => sum + r.recordsDeleted, 0),
        totalExecutionTimeMs: endTime.getTime() - startTime.getTime(),
        successfulOperations: results.filter(r => r.success).length,
        failedOperations: results.filter(r => !r.success).length,
        results,
        startTime,
        endTime
      }

      // Log cleanup summary
      await this.logCleanupSummary(summary)

      console.log('Full data cleanup completed:', summary)
      return summary
    } catch (error) {
      console.error('Full cleanup error:', error)
      throw error
    }
  }

  /**
   * Run targeted cleanup for specific data type
   */
  async runTargetedCleanup(operations: string[]): Promise<CleanupSummary> {
    const startTime = new Date()
    const results: CleanupResult[] = []

    console.log('Starting targeted cleanup for:', operations)

    try {
      for (const operation of operations) {
        switch (operation) {
          case 'expired_sessions':
            results.push(await this.cleanExpiredSessions())
            break
          case 'inactive_sessions':
            results.push(await this.cleanInactiveSessions())
            break
          case 'activity_logs':
            results.push(await this.cleanActivityLogs())
            break
          case 'security_events':
            results.push(await this.cleanSecurityEvents())
            break
          case 'audit_logs':
            results.push(await this.cleanAuditLogs())
            break
          case 'notifications':
            results.push(await this.cleanNotifications())
            break
          case 'inactive_devices':
            results.push(await this.cleanInactiveDevices())
            break
          case 'optimize_database':
            results.push(await this.optimizeDatabase())
            break
          default:
            console.warn(`Unknown cleanup operation: ${operation}`)
        }
      }

      const endTime = new Date()
      const summary: CleanupSummary = {
        totalOperations: results.length,
        totalRecordsProcessed: results.reduce((sum, r) => sum + r.recordsProcessed, 0),
        totalRecordsDeleted: results.reduce((sum, r) => sum + r.recordsDeleted, 0),
        totalExecutionTimeMs: endTime.getTime() - startTime.getTime(),
        successfulOperations: results.filter(r => r.success).length,
        failedOperations: results.filter(r => !r.success).length,
        results,
        startTime,
        endTime
      }

      console.log('Targeted cleanup completed:', summary)
      return summary
    } catch (error) {
      console.error('Targeted cleanup error:', error)
      throw error
    }
  }

  // =====================================================
  // SPECIFIC CLEANUP OPERATIONS
  // =====================================================

  /**
   * Clean expired sessions
   */
  async cleanExpiredSessions(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'expired_sessions'
    
    try {
      console.log('Cleaning expired sessions...')
      
      const cutoffDate = new Date(
        Date.now() - this.config.expiredSessionRetentionDays * 24 * 60 * 60 * 1000
      )

      // First, get count of records to be deleted
      const { count: recordsToDelete } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .lt('expires_at', cutoffDate.toISOString())

      let totalDeleted = 0
      let processed = 0

      if (recordsToDelete && recordsToDelete > 0) {
        // Delete in batches
        while (processed < recordsToDelete) {
          const { data: sessionsToDelete } = await this.supabase
            .from('user_sessions')
            .select('id')
            .lt('expires_at', cutoffDate.toISOString())
            .limit(this.config.batchSize)

          if (!sessionsToDelete || sessionsToDelete.length === 0) {
            break
          }

          const sessionIds = sessionsToDelete.map(s => s.id)
          
          // Delete related activity logs first
          await this.supabase
            .from('session_activities')
            .delete()
            .in('session_id', sessionIds)

          // Delete sessions
          const { error } = await this.supabase
            .from('user_sessions')
            .delete()
            .in('id', sessionIds)

          if (error) {
            throw new Error(`Failed to delete expired sessions: ${error.message}`)
          }

          totalDeleted += sessionsToDelete.length
          processed += sessionsToDelete.length

          console.log(`Deleted ${totalDeleted}/${recordsToDelete} expired sessions`)
        }
      }

      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: recordsToDelete || 0,
        recordsDeleted: totalDeleted,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean expired sessions error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean inactive sessions
   */
  async cleanInactiveSessions(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'inactive_sessions'
    
    try {
      console.log('Cleaning inactive sessions...')
      
      const cutoffDate = new Date(
        Date.now() - this.config.inactiveSessionRetentionDays * 24 * 60 * 60 * 1000
      )

      // Get sessions that haven't been active for the specified period
      const { count: recordsToDelete } = await this.supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .lt('last_activity_at', cutoffDate.toISOString())
        .eq('is_active', false)

      let totalDeleted = 0
      let processed = 0

      if (recordsToDelete && recordsToDelete > 0) {
        while (processed < recordsToDelete) {
          const { data: sessionsToDelete } = await this.supabase
            .from('user_sessions')
            .select('id')
            .lt('last_activity_at', cutoffDate.toISOString())
            .eq('is_active', false)
            .limit(this.config.batchSize)

          if (!sessionsToDelete || sessionsToDelete.length === 0) {
            break
          }

          const sessionIds = sessionsToDelete.map(s => s.id)
          
          // Delete related activity logs
          await this.supabase
            .from('session_activities')
            .delete()
            .in('session_id', sessionIds)

          // Delete sessions
          const { error } = await this.supabase
            .from('user_sessions')
            .delete()
            .in('id', sessionIds)

          if (error) {
            throw new Error(`Failed to delete inactive sessions: ${error.message}`)
          }

          totalDeleted += sessionsToDelete.length
          processed += sessionsToDelete.length

          console.log(`Deleted ${totalDeleted}/${recordsToDelete} inactive sessions`)
        }
      }

      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: recordsToDelete || 0,
        recordsDeleted: totalDeleted,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean inactive sessions error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean old activity logs
   */
  async cleanActivityLogs(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'activity_logs'
    
    try {
      console.log('Cleaning old activity logs...')
      
      const cutoffDate = new Date(
        Date.now() - this.config.activityLogRetentionDays * 24 * 60 * 60 * 1000
      )

      const { count: recordsToDelete } = await this.supabase
        .from('session_activities')
        .select('*', { count: 'exact', head: true })
        .lt('created_at', cutoffDate.toISOString())

      let totalDeleted = 0
      let processed = 0

      if (recordsToDelete && recordsToDelete > 0) {
        while (processed < recordsToDelete) {
          const { error, count } = await this.supabase
            .from('session_activities')
            .delete()
            .lt('created_at', cutoffDate.toISOString())
            .limit(this.config.batchSize)

          if (error) {
            throw new Error(`Failed to delete activity logs: ${error.message}`)
          }

          const deletedCount = count || 0
          totalDeleted += deletedCount
          processed += this.config.batchSize

          if (deletedCount === 0) {
            break
          }

          console.log(`Deleted ${totalDeleted}/${recordsToDelete} activity logs`)
        }
      }

      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: recordsToDelete || 0,
        recordsDeleted: totalDeleted,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean activity logs error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean old security events
   */
  async cleanSecurityEvents(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'security_events'
    
    try {
      console.log('Cleaning old security events...')
      
      const resolvedCutoffDate = new Date(
        Date.now() - this.config.resolvedEventRetentionDays * 24 * 60 * 60 * 1000
      )
      
      const unresolvedCutoffDate = new Date(
        Date.now() - this.config.securityEventRetentionDays * 24 * 60 * 60 * 1000
      )

      // Delete resolved events older than retention period
      const { count: resolvedCount } = await this.supabase
        .from('session_security_events')
        .delete()
        .eq('resolved', true)
        .lt('created_at', resolvedCutoffDate.toISOString())

      // Delete very old unresolved events (these might be false positives)
      const { count: unresolvedCount } = await this.supabase
        .from('session_security_events')
        .delete()
        .eq('resolved', false)
        .lt('created_at', unresolvedCutoffDate.toISOString())

      const totalDeleted = (resolvedCount || 0) + (unresolvedCount || 0)
      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: totalDeleted,
        recordsDeleted: totalDeleted,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean security events error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean old audit logs
   */
  async cleanAuditLogs(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'audit_logs'
    
    try {
      console.log('Cleaning old audit logs...')
      
      const cutoffDate = new Date(
        Date.now() - this.config.auditLogRetentionDays * 24 * 60 * 60 * 1000
      )

      const { count: recordsDeleted } = await this.supabase
        .from('session_audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())

      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: recordsDeleted || 0,
        recordsDeleted: recordsDeleted || 0,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean audit logs error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean old notifications
   */
  async cleanNotifications(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'notifications'
    
    try {
      console.log('Cleaning old notifications...')
      
      const readCutoffDate = new Date(
        Date.now() - this.config.readNotificationRetentionDays * 24 * 60 * 60 * 1000
      )
      
      const unreadCutoffDate = new Date(
        Date.now() - this.config.notificationRetentionDays * 24 * 60 * 60 * 1000
      )

      // Delete read notifications older than retention period
      const { count: readCount } = await this.supabase
        .from('session_notifications')
        .delete()
        .not('read_at', 'is', null)
        .lt('created_at', readCutoffDate.toISOString())

      // Delete old unread notifications
      const { count: unreadCount } = await this.supabase
        .from('session_notifications')
        .delete()
        .is('read_at', null)
        .lt('created_at', unreadCutoffDate.toISOString())

      const totalDeleted = (readCount || 0) + (unreadCount || 0)
      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: totalDeleted,
        recordsDeleted: totalDeleted,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean notifications error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Clean inactive devices
   */
  async cleanInactiveDevices(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'inactive_devices'
    
    try {
      console.log('Cleaning inactive devices...')
      
      const cutoffDate = new Date(
        Date.now() - this.config.inactiveDeviceRetentionDays * 24 * 60 * 60 * 1000
      )

      const { count: recordsDeleted } = await this.supabase
        .from('user_devices')
        .delete()
        .lt('last_used_at', cutoffDate.toISOString())
        .eq('is_trusted', false)

      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: recordsDeleted || 0,
        recordsDeleted: recordsDeleted || 0,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Clean inactive devices error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Optimize database (vacuum, reindex, etc.)
   */
  async optimizeDatabase(): Promise<CleanupResult> {
    const startTime = Date.now()
    const operation = 'optimize_database'
    
    try {
      console.log('Optimizing database...')
      
      // In a real implementation, this would run database optimization commands
      // For PostgreSQL: VACUUM, REINDEX, ANALYZE
      // This is a placeholder as Supabase handles most optimization automatically
      
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate optimization
      
      const executionTime = Date.now() - startTime
      
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: executionTime,
        success: true
      }
    } catch (error) {
      console.error('Optimize database error:', error)
      return {
        operation,
        recordsProcessed: 0,
        recordsDeleted: 0,
        executionTimeMs: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // =====================================================
  // CONFIGURATION AND MONITORING METHODS
  // =====================================================

  /**
   * Update cleanup configuration
   */
  updateConfig(newConfig: Partial<CleanupConfig>): void {
    this.config = { ...this.config, ...newConfig }
    console.log('Cleanup configuration updated:', this.config)
  }

  /**
   * Get current configuration
   */
  getConfig(): CleanupConfig {
    return { ...this.config }
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<CleanupStats> {
    try {
      // Get cleanup history from audit logs
      const { data: cleanupLogs } = await this.supabase
        .from('session_audit_logs')
        .select('*')
        .eq('action', 'data_cleanup')
        .order('created_at', { ascending: false })
        .limit(10)

      const cleanupHistory: CleanupSummary[] = cleanupLogs?.map(log => {
        const details = log.details as any
        return {
          totalOperations: details.totalOperations || 0,
          totalRecordsProcessed: details.totalRecordsProcessed || 0,
          totalRecordsDeleted: details.totalRecordsDeleted || 0,
          totalExecutionTimeMs: details.totalExecutionTimeMs || 0,
          successfulOperations: details.successfulOperations || 0,
          failedOperations: details.failedOperations || 0,
          results: details.results || [],
          startTime: new Date(log.created_at),
          endTime: new Date(log.created_at)
        }
      }) || []

      const lastCleanupRun = cleanupHistory.length > 0 ? cleanupHistory[0].startTime : null
      const totalCleanupRuns = cleanupHistory.length
      const averageExecutionTimeMs = totalCleanupRuns > 0 
        ? cleanupHistory.reduce((sum, h) => sum + h.totalExecutionTimeMs, 0) / totalCleanupRuns
        : 0
      const totalRecordsDeleted = cleanupHistory.reduce((sum, h) => sum + h.totalRecordsDeleted, 0)

      // Calculate next scheduled run (daily at 2 AM)
      const nextScheduledRun = new Date()
      nextScheduledRun.setDate(nextScheduledRun.getDate() + 1)
      nextScheduledRun.setHours(2, 0, 0, 0)

      return {
        lastCleanupRun,
        nextScheduledRun,
        totalCleanupRuns,
        averageExecutionTimeMs,
        totalRecordsDeleted,
        cleanupHistory
      }
    } catch (error) {
      console.error('Get cleanup stats error:', error)
      return {
        lastCleanupRun: null,
        nextScheduledRun: null,
        totalCleanupRuns: 0,
        averageExecutionTimeMs: 0,
        totalRecordsDeleted: 0,
        cleanupHistory: []
      }
    }
  }

  /**
   * Estimate cleanup impact
   */
  async estimateCleanupImpact(): Promise<{
    expiredSessions: number
    inactiveSessions: number
    oldActivityLogs: number
    oldSecurityEvents: number
    oldAuditLogs: number
    oldNotifications: number
    inactiveDevices: number
    totalRecordsToDelete: number
  }> {
    try {
      const expiredSessionsCutoff = new Date(
        Date.now() - this.config.expiredSessionRetentionDays * 24 * 60 * 60 * 1000
      )
      const inactiveSessionsCutoff = new Date(
        Date.now() - this.config.inactiveSessionRetentionDays * 24 * 60 * 60 * 1000
      )
      const activityLogsCutoff = new Date(
        Date.now() - this.config.activityLogRetentionDays * 24 * 60 * 60 * 1000
      )
      const securityEventsCutoff = new Date(
        Date.now() - this.config.securityEventRetentionDays * 24 * 60 * 60 * 1000
      )
      const auditLogsCutoff = new Date(
        Date.now() - this.config.auditLogRetentionDays * 24 * 60 * 60 * 1000
      )
      const notificationsCutoff = new Date(
        Date.now() - this.config.notificationRetentionDays * 24 * 60 * 60 * 1000
      )
      const devicesCutoff = new Date(
        Date.now() - this.config.inactiveDeviceRetentionDays * 24 * 60 * 60 * 1000
      )

      const [expiredSessions, inactiveSessions, oldActivityLogs, oldSecurityEvents, 
             oldAuditLogs, oldNotifications, inactiveDevices] = await Promise.all([
        this.supabase.from('user_sessions').select('*', { count: 'exact', head: true })
          .lt('expires_at', expiredSessionsCutoff.toISOString()),
        this.supabase.from('user_sessions').select('*', { count: 'exact', head: true })
          .lt('last_activity_at', inactiveSessionsCutoff.toISOString()).eq('is_active', false),
        this.supabase.from('session_activities').select('*', { count: 'exact', head: true })
          .lt('created_at', activityLogsCutoff.toISOString()),
        this.supabase.from('session_security_events').select('*', { count: 'exact', head: true })
          .lt('created_at', securityEventsCutoff.toISOString()),
        this.supabase.from('session_audit_logs').select('*', { count: 'exact', head: true })
          .lt('created_at', auditLogsCutoff.toISOString()),
        this.supabase.from('session_notifications').select('*', { count: 'exact', head: true })
          .lt('created_at', notificationsCutoff.toISOString()),
        this.supabase.from('user_devices').select('*', { count: 'exact', head: true })
          .lt('last_used_at', devicesCutoff.toISOString()).eq('is_trusted', false)
      ])

      const counts = {
        expiredSessions: expiredSessions.count || 0,
        inactiveSessions: inactiveSessions.count || 0,
        oldActivityLogs: oldActivityLogs.count || 0,
        oldSecurityEvents: oldSecurityEvents.count || 0,
        oldAuditLogs: oldAuditLogs.count || 0,
        oldNotifications: oldNotifications.count || 0,
        inactiveDevices: inactiveDevices.count || 0,
        totalRecordsToDelete: 0
      }

      counts.totalRecordsToDelete = Object.values(counts).reduce((sum, count) => sum + count, 0) - counts.totalRecordsToDelete

      return counts
    } catch (error) {
      console.error('Estimate cleanup impact error:', error)
      return {
        expiredSessions: 0,
        inactiveSessions: 0,
        oldActivityLogs: 0,
        oldSecurityEvents: 0,
        oldAuditLogs: 0,
        oldNotifications: 0,
        inactiveDevices: 0,
        totalRecordsToDelete: 0
      }
    }
  }

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Log cleanup summary to audit logs
   */
  private async logCleanupSummary(summary: CleanupSummary): Promise<void> {
    try {
      await this.supabase
        .from('session_audit_logs')
        .insert({
          user_id: null, // System operation
          action: 'data_cleanup',
          resource_type: 'system',
          resource_id: null,
          details: {
            totalOperations: summary.totalOperations,
            totalRecordsProcessed: summary.totalRecordsProcessed,
            totalRecordsDeleted: summary.totalRecordsDeleted,
            totalExecutionTimeMs: summary.totalExecutionTimeMs,
            successfulOperations: summary.successfulOperations,
            failedOperations: summary.failedOperations,
            results: summary.results
          },
          ip_address: null,
          user_agent: 'DataCleanupService'
        })
    } catch (error) {
      console.error('Log cleanup summary error:', error)
    }
  }
}

export default DataCleanupService