/**
 * Data Cleanup Service - Automated Data Maintenance and Cleanup
 *
 * Comprehensive data cleanup and maintenance service for the NeonPro
 * session management system, ensuring optimal performance and compliance.
 *
 * @version 1.0.0
 * @author NeonPro Development Team
 * @created 2024
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthenticationResponse,
  CleanupConfig,
  CleanupResult,
  CleanupSchedule,
} from './types';

/**
 * Data Cleanup Service Class
 *
 * Core cleanup operations:
 * - Expired session cleanup
 * - Inactive device removal
 * - Old security event archival
 * - Notification history cleanup
 * - Automated scheduling and monitoring
 * - Performance optimization
 */
export class DataCleanupService {
  private supabase: SupabaseClient;
  private config: CleanupConfig;
  private scheduledTasks: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;
  private lastCleanupResults: Map<string, CleanupResult> = new Map();

  constructor(config: CleanupConfig) {
    this.config = config;

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.initializeScheduledTasks();
  }

  /**
   * Run comprehensive cleanup
   */
  async runCleanup(tasks?: string[]): Promise<AuthenticationResponse> {
    if (this.isRunning) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_IN_PROGRESS',
          message: 'Cleanup is already in progress',
        },
        timestamp: new Date().toISOString(),
      };
    }

    this.isRunning = true;
    const startTime = Date.now();
    const results: CleanupResult[] = [];

    try {
      const tasksToRun = tasks || [
        'expired_sessions',
        'inactive_devices',
        'old_security_events',
        'old_notifications',
        'expired_device_verifications',
        'old_audit_logs',
      ];

      for (const taskName of tasksToRun) {
        try {
          const result = await this.runCleanupTask(taskName);
          results.push(result);
          this.lastCleanupResults.set(taskName, result);
        } catch (error) {
          const errorResult: CleanupResult = {
            task: taskName,
            success: false,
            itemsProcessed: 0,
            itemsDeleted: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString(),
            duration: 0,
          };
          results.push(errorResult);
          this.lastCleanupResults.set(taskName, errorResult);
        }
      }

      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      const totalDeleted = results.reduce((sum, r) => sum + r.itemsDeleted, 0);
      const totalProcessed = results.reduce(
        (sum, r) => sum + r.itemsProcessed,
        0
      );
      const successfulTasks = results.filter((r) => r.success).length;

      // Log cleanup summary
      await this.logCleanupSummary({
        totalTasks: results.length,
        successfulTasks,
        totalProcessed,
        totalDeleted,
        duration: totalDuration,
        results,
      });

      return {
        success: true,
        data: {
          summary: {
            totalTasks: results.length,
            successfulTasks,
            totalProcessed,
            totalDeleted,
            duration: totalDuration,
          },
          results,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_ERROR',
          message: 'Error during cleanup process',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const now = new Date().toISOString();

      // Get expired sessions
      const { data: expiredSessions, error: selectError } = await this.supabase
        .from('sessions')
        .select('id')
        .lt('expires_at', now);

      if (selectError) {
        throw new Error(
          `Failed to query expired sessions: ${selectError.message}`
        );
      }

      const itemsProcessed = expiredSessions?.length || 0;

      if (itemsProcessed === 0) {
        return {
          task: 'expired_sessions',
          success: true,
          itemsProcessed: 0,
          itemsDeleted: 0,
          startTime: taskStartTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }

      // Delete expired sessions
      const { data: deletedSessions, error: deleteError } = await this.supabase
        .from('sessions')
        .delete()
        .lt('expires_at', now)
        .select('id');

      if (deleteError) {
        throw new Error(
          `Failed to delete expired sessions: ${deleteError.message}`
        );
      }

      const itemsDeleted = deletedSessions?.length || 0;

      return {
        task: 'expired_sessions',
        success: true,
        itemsProcessed,
        itemsDeleted,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'expired_sessions',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Clean up inactive devices
   */
  async cleanupInactiveDevices(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.config.deviceRetentionDays
      );
      const cutoffDateString = cutoffDate.toISOString();

      // Get inactive devices
      const { data: inactiveDevices, error: selectError } = await this.supabase
        .from('devices')
        .select('id')
        .lt('last_seen', cutoffDateString);

      if (selectError) {
        throw new Error(
          `Failed to query inactive devices: ${selectError.message}`
        );
      }

      const itemsProcessed = inactiveDevices?.length || 0;

      if (itemsProcessed === 0) {
        return {
          task: 'inactive_devices',
          success: true,
          itemsProcessed: 0,
          itemsDeleted: 0,
          startTime: taskStartTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }

      // Delete inactive devices
      const { data: deletedDevices, error: deleteError } = await this.supabase
        .from('devices')
        .delete()
        .lt('last_seen', cutoffDateString)
        .select('id');

      if (deleteError) {
        throw new Error(
          `Failed to delete inactive devices: ${deleteError.message}`
        );
      }

      const itemsDeleted = deletedDevices?.length || 0;

      return {
        task: 'inactive_devices',
        success: true,
        itemsProcessed,
        itemsDeleted,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'inactive_devices',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Clean up old security events
   */
  async cleanupOldSecurityEvents(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.config.securityEventRetentionDays
      );
      const cutoffDateString = cutoffDate.toISOString();

      // Get old security events (excluding critical ones)
      const { data: oldEvents, error: selectError } = await this.supabase
        .from('security_events')
        .select('id')
        .lt('created_at', cutoffDateString)
        .neq('severity', 'critical'); // Keep critical events longer

      if (selectError) {
        throw new Error(
          `Failed to query old security events: ${selectError.message}`
        );
      }

      const itemsProcessed = oldEvents?.length || 0;

      if (itemsProcessed === 0) {
        return {
          task: 'old_security_events',
          success: true,
          itemsProcessed: 0,
          itemsDeleted: 0,
          startTime: taskStartTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }

      // Archive critical events before deletion (if archival is enabled)
      if (this.config.archiveCriticalEvents) {
        await this.archiveCriticalEvents(cutoffDateString);
      }

      // Delete old security events
      const { data: deletedEvents, error: deleteError } = await this.supabase
        .from('security_events')
        .delete()
        .lt('created_at', cutoffDateString)
        .neq('severity', 'critical')
        .select('id');

      if (deleteError) {
        throw new Error(
          `Failed to delete old security events: ${deleteError.message}`
        );
      }

      const itemsDeleted = deletedEvents?.length || 0;

      return {
        task: 'old_security_events',
        success: true,
        itemsProcessed,
        itemsDeleted,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'old_security_events',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.config.notificationRetentionDays
      );
      const cutoffDateString = cutoffDate.toISOString();

      // Get old notifications
      const { data: oldNotifications, error: selectError } = await this.supabase
        .from('notifications')
        .select('id')
        .lt('created_at', cutoffDateString);

      if (selectError) {
        throw new Error(
          `Failed to query old notifications: ${selectError.message}`
        );
      }

      const itemsProcessed = oldNotifications?.length || 0;

      if (itemsProcessed === 0) {
        return {
          task: 'old_notifications',
          success: true,
          itemsProcessed: 0,
          itemsDeleted: 0,
          startTime: taskStartTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }

      // Delete old notifications
      const { data: deletedNotifications, error: deleteError } =
        await this.supabase
          .from('notifications')
          .delete()
          .lt('created_at', cutoffDateString)
          .select('id');

      if (deleteError) {
        throw new Error(
          `Failed to delete old notifications: ${deleteError.message}`
        );
      }

      const itemsDeleted = deletedNotifications?.length || 0;

      // Also cleanup related in-app notifications
      await this.supabase
        .from('in_app_notifications')
        .delete()
        .lt('created_at', cutoffDateString);

      return {
        task: 'old_notifications',
        success: true,
        itemsProcessed,
        itemsDeleted,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'old_notifications',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Clean up expired device verifications
   */
  async cleanupExpiredDeviceVerifications(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const now = new Date().toISOString();

      // Get expired verifications
      const { data: expiredVerifications, error: selectError } =
        await this.supabase
          .from('device_verifications')
          .select('id')
          .lt('expires_at', now);

      if (selectError) {
        throw new Error(
          `Failed to query expired verifications: ${selectError.message}`
        );
      }

      const itemsProcessed = expiredVerifications?.length || 0;

      if (itemsProcessed === 0) {
        return {
          task: 'expired_device_verifications',
          success: true,
          itemsProcessed: 0,
          itemsDeleted: 0,
          startTime: taskStartTime,
          endTime: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
      }

      // Delete expired verifications
      const { data: deletedVerifications, error: deleteError } =
        await this.supabase
          .from('device_verifications')
          .delete()
          .lt('expires_at', now)
          .select('id');

      if (deleteError) {
        throw new Error(
          `Failed to delete expired verifications: ${deleteError.message}`
        );
      }

      const itemsDeleted = deletedVerifications?.length || 0;

      return {
        task: 'expired_device_verifications',
        success: true,
        itemsProcessed,
        itemsDeleted,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'expired_device_verifications',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Get cleanup status and statistics
   */
  async getCleanupStatus(): Promise<AuthenticationResponse> {
    try {
      const status = {
        isRunning: this.isRunning,
        lastCleanupResults: Object.fromEntries(this.lastCleanupResults),
        scheduledTasks: Array.from(this.scheduledTasks.keys()),
        config: this.config,
        nextScheduledRun: this.getNextScheduledRun(),
      };

      return {
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CLEANUP_STATUS_ERROR',
          message: 'Error getting cleanup status',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Schedule cleanup task
   */
  scheduleCleanup(schedule: CleanupSchedule): void {
    // Clear existing schedule if any
    const existingTimeout = this.scheduledTasks.get(schedule.name);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Calculate next run time
    const now = Date.now();
    const nextRun = this.calculateNextRun(schedule.cron, now);
    const delay = nextRun - now;

    // Schedule the task
    const timeout = setTimeout(async () => {
      try {
        await this.runCleanup(schedule.tasks);

        // Reschedule for next run
        this.scheduleCleanup(schedule);
      } catch (error) {
        console.error(
          `Error running scheduled cleanup ${schedule.name}:`,
          error
        );

        // Reschedule even if there was an error
        this.scheduleCleanup(schedule);
      }
    }, delay);

    this.scheduledTasks.set(schedule.name, timeout);
  }

  /**
   * Stop all scheduled tasks
   */
  stopScheduledTasks(): void {
    this.scheduledTasks.forEach((timeout) => clearTimeout(timeout));
    this.scheduledTasks.clear();
  }

  /**
   * Private helper methods
   */
  private initializeScheduledTasks(): void {
    if (this.config.enableScheduledCleanup) {
      // Daily cleanup at 2 AM
      this.scheduleCleanup({
        name: 'daily_cleanup',
        cron: '0 2 * * *',
        tasks: ['expired_sessions', 'expired_device_verifications'],
      });

      // Weekly cleanup on Sunday at 3 AM
      this.scheduleCleanup({
        name: 'weekly_cleanup',
        cron: '0 3 * * 0',
        tasks: ['inactive_devices', 'old_notifications'],
      });

      // Monthly cleanup on 1st at 4 AM
      this.scheduleCleanup({
        name: 'monthly_cleanup',
        cron: '0 4 1 * *',
        tasks: ['old_security_events', 'old_audit_logs'],
      });
    }
  }

  private async runCleanupTask(taskName: string): Promise<CleanupResult> {
    switch (taskName) {
      case 'expired_sessions':
        return this.cleanupExpiredSessions();
      case 'inactive_devices':
        return this.cleanupInactiveDevices();
      case 'old_security_events':
        return this.cleanupOldSecurityEvents();
      case 'old_notifications':
        return this.cleanupOldNotifications();
      case 'expired_device_verifications':
        return this.cleanupExpiredDeviceVerifications();
      case 'old_audit_logs':
        return this.cleanupOldAuditLogs();
      default:
        throw new Error(`Unknown cleanup task: ${taskName}`);
    }
  }

  private async cleanupOldAuditLogs(): Promise<CleanupResult> {
    const startTime = Date.now();
    const taskStartTime = new Date().toISOString();

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(
        cutoffDate.getDate() - this.config.auditLogRetentionDays
      );
      const _cutoffDateString = cutoffDate.toISOString();

      // This would cleanup audit logs if they exist
      // For now, return a placeholder result
      return {
        task: 'old_audit_logs',
        success: true,
        itemsProcessed: 0,
        itemsDeleted: 0,
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    } catch (error) {
      return {
        task: 'old_audit_logs',
        success: false,
        itemsProcessed: 0,
        itemsDeleted: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        startTime: taskStartTime,
        endTime: new Date().toISOString(),
        duration: Date.now() - startTime,
      };
    }
  }

  private async archiveCriticalEvents(cutoffDate: string): Promise<void> {
    try {
      // Get critical events to archive
      const { data: criticalEvents, error } = await this.supabase
        .from('security_events')
        .select('*')
        .eq('severity', 'critical')
        .lt('created_at', cutoffDate);

      if (error || !criticalEvents || criticalEvents.length === 0) {
        return;
      }

      // Archive to separate table or external storage
      // For now, we'll just log that archival would happen
      console.log(
        `Would archive ${criticalEvents.length} critical security events`
      );

      // TODO: Implement actual archival logic
      // - Move to archive table
      // - Export to external storage
      // - Compress and store
    } catch (error) {
      console.error('Error archiving critical events:', error);
    }
  }

  private async logCleanupSummary(summary: any): Promise<void> {
    try {
      await this.supabase.from('cleanup_logs').insert({
        id: crypto.randomUUID(),
        summary: JSON.stringify(summary),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging cleanup summary:', error);
    }
  }

  private calculateNextRun(cron: string, fromTime: number): number {
    // Simple cron parser for basic schedules
    // Format: "minute hour day month dayOfWeek"
    const parts = cron.split(' ');
    if (parts.length !== 5) {
      throw new Error('Invalid cron format');
    }

    const [minute, hour, day, _month, dayOfWeek] = parts.map((p) =>
      Number.parseInt(p, 10)
    );
    const now = new Date(fromTime);
    const next = new Date(now);

    // Set to specified time
    next.setHours(hour, minute, 0, 0);

    // If time has passed today, move to next occurrence
    if (next.getTime() <= now.getTime()) {
      if (dayOfWeek !== undefined && !Number.isNaN(dayOfWeek)) {
        // Weekly schedule
        const daysUntilNext = (7 + dayOfWeek - next.getDay()) % 7;
        next.setDate(next.getDate() + (daysUntilNext || 7));
      } else if (day !== undefined && !Number.isNaN(day)) {
        // Monthly schedule
        next.setMonth(next.getMonth() + 1, day);
      } else {
        // Daily schedule
        next.setDate(next.getDate() + 1);
      }
    }

    return next.getTime();
  }

  private getNextScheduledRun(): string | null {
    let nextRun: number | null = null;

    this.scheduledTasks.forEach((_timeout) => {
      // This is a simplified approach - in a real implementation,
      // you'd track the actual scheduled times
      const scheduledTime = Date.now() + 24 * 60 * 60 * 1000; // Next day
      if (!nextRun || scheduledTime < nextRun) {
        nextRun = scheduledTime;
      }
    });

    return nextRun ? new Date(nextRun).toISOString() : null;
  }
}

export default DataCleanupService;
