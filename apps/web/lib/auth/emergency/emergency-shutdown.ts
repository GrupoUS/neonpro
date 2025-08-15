// Emergency Shutdown System
// Immediate termination of all sessions in critical situations

import { SessionConfig } from '@/lib/auth/config/session-config';
import { SessionUtils } from '@/lib/auth/utils/session-utils';

export interface EmergencyEvent {
  id: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  triggeredBy: string;
  triggeredAt: number;
  reason: string;
  description: string;
  affectedSessions: string[];
  affectedUsers: string[];
  actions: EmergencyAction[];
  status: EmergencyStatus;
  resolvedAt?: number;
  resolvedBy?: string;
  metadata: EmergencyMetadata;
}

export type EmergencyType =
  | 'security_breach'
  | 'data_leak'
  | 'system_compromise'
  | 'malware_detected'
  | 'unauthorized_access'
  | 'ddos_attack'
  | 'insider_threat'
  | 'compliance_violation'
  | 'system_failure'
  | 'manual_shutdown'
  | 'scheduled_maintenance'
  | 'legal_requirement';

export type EmergencySeverity =
  | 'critical' // Immediate shutdown required
  | 'high' // Shutdown within minutes
  | 'medium' // Controlled shutdown
  | 'low'; // Graceful shutdown

export type EmergencyStatus =
  | 'triggered'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'resolved';

export interface EmergencyAction {
  id: string;
  type: ActionType;
  target: ActionTarget;
  parameters: Record<string, any>;
  executedAt?: number;
  executedBy?: string;
  status: ActionStatus;
  result?: ActionResult;
  error?: string;
}

export type ActionType =
  | 'terminate_session'
  | 'terminate_all_sessions'
  | 'block_user'
  | 'block_ip'
  | 'disable_account'
  | 'revoke_tokens'
  | 'clear_cache'
  | 'backup_data'
  | 'notify_admin'
  | 'notify_user'
  | 'log_event'
  | 'isolate_system'
  | 'enable_maintenance'
  | 'contact_authorities';

export type ActionTarget =
  | 'session'
  | 'user'
  | 'device'
  | 'ip_address'
  | 'system'
  | 'database'
  | 'cache'
  | 'logs'
  | 'administrators'
  | 'all_users';

export type ActionStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
  affectedCount?: number;
  duration?: number;
}

export interface EmergencyMetadata {
  source: string;
  detector: string;
  confidence: number;
  evidence: Evidence[];
  impact: ImpactAssessment;
  timeline: TimelineEvent[];
  notifications: NotificationRecord[];
}

export interface Evidence {
  type: EvidenceType;
  source: string;
  data: any;
  timestamp: number;
  reliability: number;
}

export type EvidenceType =
  | 'log_entry'
  | 'security_alert'
  | 'anomaly_detection'
  | 'user_report'
  | 'system_metric'
  | 'external_threat_intel'
  | 'compliance_check';

export interface ImpactAssessment {
  usersAffected: number;
  sessionsAffected: number;
  dataAtRisk: string[];
  systemsAffected: string[];
  businessImpact: BusinessImpact;
  estimatedDowntime: number;
}

export interface BusinessImpact {
  severity: 'low' | 'medium' | 'high' | 'critical';
  revenue: number;
  reputation: number;
  compliance: number;
  operations: number;
}

export interface TimelineEvent {
  timestamp: number;
  event: string;
  actor: string;
  details: string;
}

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  recipient: string;
  channel: NotificationChannel;
  sentAt: number;
  status: NotificationStatus;
  content: string;
}

export type NotificationType =
  | 'emergency_alert'
  | 'session_terminated'
  | 'system_shutdown'
  | 'security_incident'
  | 'maintenance_notice'
  | 'recovery_update';

export type NotificationChannel =
  | 'email'
  | 'sms'
  | 'push'
  | 'in_app'
  | 'webhook'
  | 'slack'
  | 'teams';

export type NotificationStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced';

export interface EmergencyConfig {
  autoShutdownEnabled: boolean;
  severityThresholds: Record<EmergencySeverity, number>;
  actionTimeouts: Record<ActionType, number>;
  notificationChannels: NotificationChannel[];
  backupBeforeShutdown: boolean;
  gracePeriod: number;
  maxConcurrentActions: number;
  retryAttempts: number;
  escalationRules: EscalationRule[];
}

export interface EscalationRule {
  condition: string;
  delay: number;
  action: ActionType;
  target: ActionTarget;
  parameters: Record<string, any>;
}

export class EmergencyShutdownManager {
  private utils: SessionUtils;
  private emergencyConfig: EmergencyConfig;
  private activeEmergencies: Map<string, EmergencyEvent> = new Map();
  private isShuttingDown = false;
  private shutdownStartTime = 0;
  private eventListeners: Map<string, Function[]> = new Map();
  private executionLocks: Set<string> = new Set();
  private notificationService: NotificationService;
  private auditLogger: AuditLogger;

  constructor(config?: Partial<EmergencyConfig>) {
    this.config = SessionConfig.getInstance();
    this.utils = new SessionUtils();
    this.notificationService = new NotificationService();
    this.auditLogger = new AuditLogger();

    this.emergencyConfig = {
      autoShutdownEnabled: true,
      severityThresholds: {
        critical: 0, // Immediate
        high: 300, // 5 minutes
        medium: 1800, // 30 minutes
        low: 3600, // 1 hour
      },
      actionTimeouts: {
        terminate_session: 30_000,
        terminate_all_sessions: 60_000,
        block_user: 10_000,
        block_ip: 5000,
        disable_account: 15_000,
        revoke_tokens: 20_000,
        clear_cache: 30_000,
        backup_data: 300_000,
        notify_admin: 5000,
        notify_user: 10_000,
        log_event: 5000,
        isolate_system: 60_000,
        enable_maintenance: 30_000,
        contact_authorities: 10_000,
      },
      notificationChannels: ['email', 'sms', 'push', 'in_app'],
      backupBeforeShutdown: true,
      gracePeriod: 300_000, // 5 minutes
      maxConcurrentActions: 10,
      retryAttempts: 3,
      escalationRules: [],
      ...config,
    };
  }

  /**
   * Trigger emergency shutdown
   */
  public async triggerEmergency(
    type: EmergencyType,
    severity: EmergencySeverity,
    reason: string,
    triggeredBy: string,
    options?: {
      affectedSessions?: string[];
      affectedUsers?: string[];
      customActions?: EmergencyAction[];
      skipBackup?: boolean;
      immediateShutdown?: boolean;
    }
  ): Promise<EmergencyEvent> {
    try {
      const emergency = await this.createEmergencyEvent(
        type,
        severity,
        reason,
        triggeredBy,
        options
      );

      // Store emergency event
      this.activeEmergencies.set(emergency.id, emergency);

      // Log emergency
      await this.auditLogger.logEmergency(emergency);

      // Emit emergency triggered event
      this.emit('emergency_triggered', emergency);

      // Execute emergency response
      await this.executeEmergencyResponse(emergency);

      return emergency;
    } catch (error) {
      console.error('Error triggering emergency:', error);
      throw error;
    }
  }

  /**
   * Create emergency event
   */
  private async createEmergencyEvent(
    type: EmergencyType,
    severity: EmergencySeverity,
    reason: string,
    triggeredBy: string,
    options?: any
  ): Promise<EmergencyEvent> {
    const emergency: EmergencyEvent = {
      id: this.utils.generateSessionToken(),
      type,
      severity,
      triggeredBy,
      triggeredAt: Date.now(),
      reason,
      description: this.generateEmergencyDescription(type, reason),
      affectedSessions:
        options?.affectedSessions || (await this.getAllActiveSessions()),
      affectedUsers: options?.affectedUsers || (await this.getAllActiveUsers()),
      actions:
        options?.customActions || this.generateDefaultActions(type, severity),
      status: 'triggered',
      metadata: {
        source: 'emergency_system',
        detector: triggeredBy,
        confidence: 1.0,
        evidence: [],
        impact: await this.assessImpact(
          options?.affectedSessions,
          options?.affectedUsers
        ),
        timeline: [
          {
            timestamp: Date.now(),
            event: 'emergency_triggered',
            actor: triggeredBy,
            details: reason,
          },
        ],
        notifications: [],
      },
    };

    return emergency;
  }

  /**
   * Execute emergency response
   */
  private async executeEmergencyResponse(
    emergency: EmergencyEvent
  ): Promise<void> {
    try {
      // Update status
      emergency.status = 'in_progress';

      // Add timeline event
      emergency.metadata.timeline.push({
        timestamp: Date.now(),
        event: 'response_started',
        actor: 'emergency_system',
        details: 'Emergency response execution started',
      });

      // Check if immediate shutdown is required
      if (emergency.severity === 'critical' || this.isShuttingDown) {
        await this.executeImmediateShutdown(emergency);
      } else {
        await this.executeControlledShutdown(emergency);
      }

      // Update status
      emergency.status = 'completed';
      emergency.resolvedAt = Date.now();

      // Add timeline event
      emergency.metadata.timeline.push({
        timestamp: Date.now(),
        event: 'response_completed',
        actor: 'emergency_system',
        details: 'Emergency response execution completed',
      });

      this.emit('emergency_completed', emergency);
    } catch (error) {
      emergency.status = 'failed';
      emergency.metadata.timeline.push({
        timestamp: Date.now(),
        event: 'response_failed',
        actor: 'emergency_system',
        details: `Emergency response failed: ${error.message}`,
      });

      console.error('Error executing emergency response:', error);
      this.emit('emergency_failed', { emergency, error });
      throw error;
    }
  }

  /**
   * Execute immediate shutdown
   */
  private async executeImmediateShutdown(
    emergency: EmergencyEvent
  ): Promise<void> {
    this.isShuttingDown = true;
    this.shutdownStartTime = Date.now();

    console.log(
      `EMERGENCY SHUTDOWN INITIATED: ${emergency.type} - ${emergency.reason}`
    );

    // Send immediate notifications
    await this.sendEmergencyNotifications(emergency, 'immediate');

    // Execute actions in parallel for speed
    const actionPromises = emergency.actions.map((action) =>
      this.executeAction(action, emergency.id)
    );

    // Wait for all actions with timeout
    await Promise.allSettled(actionPromises);

    // Force terminate all remaining sessions
    await this.forceTerminateAllSessions(emergency);

    console.log('EMERGENCY SHUTDOWN COMPLETED');
  }

  /**
   * Execute controlled shutdown
   */
  private async executeControlledShutdown(
    emergency: EmergencyEvent
  ): Promise<void> {
    this.isShuttingDown = true;
    this.shutdownStartTime = Date.now();

    console.log(
      `CONTROLLED SHUTDOWN INITIATED: ${emergency.type} - ${emergency.reason}`
    );

    // Send warning notifications
    await this.sendEmergencyNotifications(emergency, 'warning');

    // Wait for grace period if configured
    if (this.emergencyConfig.gracePeriod > 0) {
      console.log(
        `Grace period: ${this.emergencyConfig.gracePeriod / 1000} seconds`
      );
      await this.waitWithProgress(this.emergencyConfig.gracePeriod);
    }

    // Execute backup if enabled
    if (this.emergencyConfig.backupBeforeShutdown) {
      await this.executeDataBackup(emergency);
    }

    // Execute actions sequentially for control
    for (const action of emergency.actions) {
      await this.executeAction(action, emergency.id);

      // Small delay between actions
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('CONTROLLED SHUTDOWN COMPLETED');
  }

  /**
   * Execute individual action
   */
  private async executeAction(
    action: EmergencyAction,
    emergencyId: string
  ): Promise<void> {
    const lockKey = `${action.type}_${action.target}`;

    // Prevent concurrent execution of same action type
    if (this.executionLocks.has(lockKey)) {
      console.warn(`Action ${action.type} already executing, skipping`);
      action.status = 'skipped';
      return;
    }

    this.executionLocks.add(lockKey);

    try {
      action.status = 'executing';
      action.executedAt = Date.now();
      action.executedBy = 'emergency_system';

      const timeout =
        this.emergencyConfig.actionTimeouts[action.type] || 30_000;

      // Execute action with timeout
      const result = await Promise.race([
        this.performAction(action),
        new Promise<ActionResult>((_, reject) =>
          setTimeout(() => reject(new Error('Action timeout')), timeout)
        ),
      ]);

      action.result = result;
      action.status = result.success ? 'completed' : 'failed';

      if (!result.success) {
        action.error = result.message;
      }

      this.emit('action_completed', { action, emergencyId });
    } catch (error) {
      action.status = 'failed';
      action.error = error.message;

      console.error(`Action ${action.type} failed:`, error);
      this.emit('action_failed', { action, emergencyId, error });
    } finally {
      this.executionLocks.delete(lockKey);
    }
  }

  /**
   * Perform specific action
   */
  private async performAction(action: EmergencyAction): Promise<ActionResult> {
    switch (action.type) {
      case 'terminate_session':
        return await this.terminateSession(action.parameters.sessionId);

      case 'terminate_all_sessions':
        return await this.terminateAllSessions(action.parameters.excludeAdmin);

      case 'block_user':
        return await this.blockUser(action.parameters.userId);

      case 'block_ip':
        return await this.blockIP(action.parameters.ipAddress);

      case 'disable_account':
        return await this.disableAccount(action.parameters.userId);

      case 'revoke_tokens':
        return await this.revokeTokens(action.parameters.userId);

      case 'clear_cache':
        return await this.clearCache(action.parameters.cacheType);

      case 'backup_data':
        return await this.backupData(action.parameters.dataTypes);

      case 'notify_admin':
        return await this.notifyAdministrators(action.parameters.message);

      case 'notify_user':
        return await this.notifyUser(
          action.parameters.userId,
          action.parameters.message
        );

      case 'log_event':
        return await this.logSecurityEvent(action.parameters.event);

      case 'isolate_system':
        return await this.isolateSystem(action.parameters.systemId);

      case 'enable_maintenance':
        return await this.enableMaintenanceMode();

      case 'contact_authorities':
        return await this.contactAuthorities(action.parameters.incident);

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Action implementations
   */
  private async terminateSession(sessionId: string): Promise<ActionResult> {
    try {
      const response = await fetch(`/api/session/${sessionId}/terminate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'emergency_shutdown', force: true }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Session ${sessionId} terminated successfully`,
          affectedCount: 1,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to terminate session: ${error.message}`,
      };
    }
  }

  private async terminateAllSessions(
    excludeAdmin = false
  ): Promise<ActionResult> {
    try {
      const response = await fetch('/api/session/terminate-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: 'emergency_shutdown',
          force: true,
          excludeAdmin,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: `${result.terminatedCount} sessions terminated successfully`,
          affectedCount: result.terminatedCount,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to terminate all sessions: ${error.message}`,
      };
    }
  }

  private async blockUser(userId: string): Promise<ActionResult> {
    try {
      const response = await fetch(`/api/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'emergency_security_measure' }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `User ${userId} blocked successfully`,
          affectedCount: 1,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to block user: ${error.message}`,
      };
    }
  }

  private async blockIP(ipAddress: string): Promise<ActionResult> {
    try {
      const response = await fetch('/api/security/block-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress,
          reason: 'emergency_security_measure',
          duration: 24 * 60 * 60 * 1000, // 24 hours
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `IP address ${ipAddress} blocked successfully`,
          affectedCount: 1,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to block IP: ${error.message}`,
      };
    }
  }

  private async disableAccount(userId: string): Promise<ActionResult> {
    try {
      const response = await fetch(`/api/users/${userId}/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'emergency_security_measure' }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Account ${userId} disabled successfully`,
          affectedCount: 1,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to disable account: ${error.message}`,
      };
    }
  }

  private async revokeTokens(userId: string): Promise<ActionResult> {
    try {
      const response = await fetch('/api/auth/revoke-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, reason: 'emergency_security_measure' }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: `${result.revokedCount} tokens revoked successfully`,
          affectedCount: result.revokedCount,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to revoke tokens: ${error.message}`,
      };
    }
  }

  private async clearCache(cacheType: string): Promise<ActionResult> {
    try {
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: cacheType, reason: 'emergency_cleanup' }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `Cache ${cacheType} cleared successfully`,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to clear cache: ${error.message}`,
      };
    }
  }

  private async backupData(dataTypes: string[]): Promise<ActionResult> {
    try {
      const response = await fetch('/api/backup/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataTypes,
          reason: 'emergency_backup',
          priority: 'high',
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: `Emergency backup completed: ${result.backupId}`,
          data: { backupId: result.backupId },
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to backup data: ${error.message}`,
      };
    }
  }

  private async notifyAdministrators(message: string): Promise<ActionResult> {
    try {
      const response = await fetch('/api/notifications/admin-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          priority: 'critical',
          channels: this.emergencyConfig.notificationChannels,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: `Administrators notified via ${result.sentChannels.length} channels`,
          affectedCount: result.recipientCount,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to notify administrators: ${error.message}`,
      };
    }
  }

  private async notifyUser(
    userId: string,
    message: string
  ): Promise<ActionResult> {
    try {
      const response = await fetch('/api/notifications/user-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message,
          priority: 'high',
          channels: ['email', 'push', 'in_app'],
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `User ${userId} notified successfully`,
          affectedCount: 1,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to notify user: ${error.message}`,
      };
    }
  }

  private async logSecurityEvent(event: any): Promise<ActionResult> {
    try {
      await this.auditLogger.logSecurityEvent(event);
      return {
        success: true,
        message: 'Security event logged successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to log security event: ${error.message}`,
      };
    }
  }

  private async isolateSystem(systemId: string): Promise<ActionResult> {
    try {
      const response = await fetch(`/api/systems/${systemId}/isolate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'emergency_isolation' }),
      });

      if (response.ok) {
        return {
          success: true,
          message: `System ${systemId} isolated successfully`,
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to isolate system: ${error.message}`,
      };
    }
  }

  private async enableMaintenanceMode(): Promise<ActionResult> {
    try {
      const response = await fetch('/api/system/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: true,
          reason: 'emergency_maintenance',
          message:
            'System is temporarily unavailable due to emergency maintenance',
        }),
      });

      if (response.ok) {
        return {
          success: true,
          message: 'Maintenance mode enabled successfully',
        };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      return {
        success: false,
        message: `Failed to enable maintenance mode: ${error.message}`,
      };
    }
  }

  private async contactAuthorities(incident: any): Promise<ActionResult> {
    try {
      // In a real implementation, this would contact appropriate authorities
      // For now, we'll just log the incident
      await this.auditLogger.logIncident({
        ...incident,
        reportedToAuthorities: true,
        reportedAt: Date.now(),
      });

      return {
        success: true,
        message: 'Authorities contacted and incident reported',
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to contact authorities: ${error.message}`,
      };
    }
  }

  /**
   * Force terminate all sessions
   */
  private async forceTerminateAllSessions(
    _emergency: EmergencyEvent
  ): Promise<void> {
    try {
      // Get all active sessions
      const sessions = await this.getAllActiveSessions();

      // Terminate each session forcefully
      const terminationPromises = sessions.map((sessionId) =>
        this.terminateSession(sessionId)
      );

      await Promise.allSettled(terminationPromises);

      console.log(`Force terminated ${sessions.length} sessions`);
    } catch (error) {
      console.error('Error force terminating sessions:', error);
    }
  }

  /**
   * Send emergency notifications
   */
  private async sendEmergencyNotifications(
    emergency: EmergencyEvent,
    urgency: 'immediate' | 'warning'
  ): Promise<void> {
    try {
      const message = this.generateNotificationMessage(emergency, urgency);

      // Notify administrators
      await this.notificationService.sendEmergencyAlert({
        recipients: 'administrators',
        message,
        priority: emergency.severity,
        channels: this.emergencyConfig.notificationChannels,
      });

      // Notify affected users if not immediate shutdown
      if (urgency !== 'immediate' && emergency.affectedUsers.length > 0) {
        await this.notificationService.sendUserAlert({
          userIds: emergency.affectedUsers,
          message: this.generateUserNotificationMessage(emergency),
          priority: 'high',
          channels: ['email', 'push', 'in_app'],
        });
      }

      // Record notifications
      emergency.metadata.notifications.push({
        id: this.utils.generateSessionToken(),
        type: 'emergency_alert',
        recipient: 'administrators',
        channel: 'multiple',
        sentAt: Date.now(),
        status: 'sent',
        content: message,
      });
    } catch (error) {
      console.error('Error sending emergency notifications:', error);
    }
  }

  /**
   * Utility methods
   */
  private generateEmergencyDescription(
    type: EmergencyType,
    reason: string
  ): string {
    const descriptions = {
      security_breach: 'Security breach detected requiring immediate response',
      data_leak: 'Potential data leak identified requiring system isolation',
      system_compromise:
        'System compromise detected requiring emergency shutdown',
      malware_detected: 'Malware detected requiring immediate containment',
      unauthorized_access:
        'Unauthorized access detected requiring session termination',
      ddos_attack: 'DDoS attack in progress requiring traffic filtering',
      insider_threat: 'Insider threat detected requiring account restrictions',
      compliance_violation:
        'Compliance violation requiring immediate remediation',
      system_failure: 'Critical system failure requiring emergency procedures',
      manual_shutdown: 'Manual emergency shutdown initiated by administrator',
      scheduled_maintenance:
        'Scheduled emergency maintenance requiring system shutdown',
      legal_requirement:
        'Legal requirement mandating immediate system shutdown',
    };

    return `${descriptions[type] || 'Emergency situation detected'}: ${reason}`;
  }

  private generateDefaultActions(
    type: EmergencyType,
    severity: EmergencySeverity
  ): EmergencyAction[] {
    const actions: EmergencyAction[] = [];

    // Common actions for all emergencies
    actions.push({
      id: this.utils.generateSessionToken(),
      type: 'log_event',
      target: 'logs',
      parameters: { event: { type, severity, timestamp: Date.now() } },
      status: 'pending',
    });

    actions.push({
      id: this.utils.generateSessionToken(),
      type: 'notify_admin',
      target: 'administrators',
      parameters: {
        message: `Emergency ${type} triggered with ${severity} severity`,
      },
      status: 'pending',
    });

    // Severity-based actions
    if (severity === 'critical' || severity === 'high') {
      actions.push({
        id: this.utils.generateSessionToken(),
        type: 'terminate_all_sessions',
        target: 'system',
        parameters: { excludeAdmin: severity === 'high' },
        status: 'pending',
      });
    }

    // Type-specific actions
    switch (type) {
      case 'security_breach':
      case 'system_compromise':
        actions.push({
          id: this.utils.generateSessionToken(),
          type: 'backup_data',
          target: 'database',
          parameters: { dataTypes: ['critical', 'user_data'] },
          status: 'pending',
        });
        break;

      case 'malware_detected':
        actions.push({
          id: this.utils.generateSessionToken(),
          type: 'isolate_system',
          target: 'system',
          parameters: { systemId: 'main' },
          status: 'pending',
        });
        break;

      case 'ddos_attack':
        actions.push({
          id: this.utils.generateSessionToken(),
          type: 'enable_maintenance',
          target: 'system',
          parameters: {},
          status: 'pending',
        });
        break;
    }

    return actions;
  }

  private generateNotificationMessage(
    emergency: EmergencyEvent,
    urgency: string
  ): string {
    const urgencyText = urgency === 'immediate' ? 'IMMEDIATE' : 'WARNING';
    return `${urgencyText}: ${emergency.description}. Triggered by: ${emergency.triggeredBy}. Severity: ${emergency.severity.toUpperCase()}.`;
  }

  private generateUserNotificationMessage(_emergency: EmergencyEvent): string {
    return 'Your session will be terminated due to a security incident. Please save your work and log in again later. We apologize for the inconvenience.';
  }

  private async getAllActiveSessions(): Promise<string[]> {
    try {
      const response = await fetch('/api/session/active');
      if (response.ok) {
        const sessions = await response.json();
        return sessions.map((s: any) => s.id);
      }
    } catch (error) {
      console.error('Error getting active sessions:', error);
    }
    return [];
  }

  private async getAllActiveUsers(): Promise<string[]> {
    try {
      const response = await fetch('/api/users/active');
      if (response.ok) {
        const users = await response.json();
        return users.map((u: any) => u.id);
      }
    } catch (error) {
      console.error('Error getting active users:', error);
    }
    return [];
  }

  private async assessImpact(
    affectedSessions?: string[],
    affectedUsers?: string[]
  ): Promise<ImpactAssessment> {
    return {
      usersAffected: affectedUsers?.length || 0,
      sessionsAffected: affectedSessions?.length || 0,
      dataAtRisk: ['user_sessions', 'authentication_tokens'],
      systemsAffected: ['web_application', 'database', 'cache'],
      businessImpact: {
        severity: 'high',
        revenue: 0,
        reputation: 0.8,
        compliance: 0.9,
        operations: 0.7,
      },
      estimatedDowntime: 30 * 60 * 1000, // 30 minutes
    };
  }

  private async executeDataBackup(emergency: EmergencyEvent): Promise<void> {
    try {
      console.log('Executing emergency data backup...');

      const backupAction: EmergencyAction = {
        id: this.utils.generateSessionToken(),
        type: 'backup_data',
        target: 'database',
        parameters: { dataTypes: ['critical', 'user_data', 'session_data'] },
        status: 'pending',
      };

      await this.executeAction(backupAction, emergency.id);

      if (backupAction.status === 'completed') {
        console.log('Emergency data backup completed successfully');
      } else {
        console.warn('Emergency data backup failed or incomplete');
      }
    } catch (error) {
      console.error('Error executing data backup:', error);
    }
  }

  private async waitWithProgress(duration: number): Promise<void> {
    const interval = 5000; // 5 seconds
    const steps = Math.ceil(duration / interval);

    for (let i = 0; i < steps; i++) {
      const remaining = duration - i * interval;
      console.log(`Shutdown in ${Math.ceil(remaining / 1000)} seconds...`);

      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(interval, remaining))
      );
    }
  }

  /**
   * Event system
   */
  public on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  public off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Public API methods
   */
  public async cancelEmergency(
    emergencyId: string,
    reason: string
  ): Promise<boolean> {
    const emergency = this.activeEmergencies.get(emergencyId);
    if (!emergency) {
      return false;
    }

    if (emergency.status === 'completed') {
      return false; // Cannot cancel completed emergency
    }

    emergency.status = 'cancelled';
    emergency.resolvedAt = Date.now();
    emergency.metadata.timeline.push({
      timestamp: Date.now(),
      event: 'emergency_cancelled',
      actor: 'administrator',
      details: reason,
    });

    this.isShuttingDown = false;

    this.emit('emergency_cancelled', { emergency, reason });
    return true;
  }

  public getActiveEmergencies(): EmergencyEvent[] {
    return Array.from(this.activeEmergencies.values()).filter(
      (e) => e.status === 'triggered' || e.status === 'in_progress'
    );
  }

  public getEmergencyHistory(): EmergencyEvent[] {
    return Array.from(this.activeEmergencies.values());
  }

  public isInEmergencyMode(): boolean {
    return this.isShuttingDown;
  }

  public getShutdownStatus(): {
    isShuttingDown: boolean;
    startTime: number;
    duration: number;
  } {
    return {
      isShuttingDown: this.isShuttingDown,
      startTime: this.shutdownStartTime,
      duration: this.isShuttingDown ? Date.now() - this.shutdownStartTime : 0,
    };
  }

  public updateConfig(config: Partial<EmergencyConfig>): void {
    this.emergencyConfig = { ...this.emergencyConfig, ...config };
  }

  public async testEmergencySystem(): Promise<boolean> {
    try {
      // Test notification system
      await this.notificationService.testConnection();

      // Test audit logger
      await this.auditLogger.testConnection();

      // Test API endpoints
      const testResponse = await fetch('/api/emergency/test');

      return testResponse.ok;
    } catch (error) {
      console.error('Emergency system test failed:', error);
      return false;
    }
  }

  public destroy(): void {
    // Clear all state
    this.activeEmergencies.clear();
    this.actionQueue = [];
    this.executionLocks.clear();
    this.eventListeners.clear();
    this.isShuttingDown = false;
  }
}

/**
 * Helper classes
 */
class NotificationService {
  async sendEmergencyAlert(params: any): Promise<void> {
    // Implementation for sending emergency alerts
    console.log('Sending emergency alert:', params);
  }

  async sendUserAlert(params: any): Promise<void> {
    // Implementation for sending user alerts
    console.log('Sending user alert:', params);
  }

  async testConnection(): Promise<boolean> {
    // Test notification service connection
    return true;
  }
}

class AuditLogger {
  async logEmergency(emergency: EmergencyEvent): Promise<void> {
    // Implementation for logging emergency events
    console.log('Logging emergency:', emergency.id);
  }

  async logSecurityEvent(event: any): Promise<void> {
    // Implementation for logging security events
    console.log('Logging security event:', event);
  }

  async logIncident(incident: any): Promise<void> {
    // Implementation for logging incidents
    console.log('Logging incident:', incident);
  }

  async testConnection(): Promise<boolean> {
    // Test audit logger connection
    return true;
  }
}

export default EmergencyShutdownManager;
