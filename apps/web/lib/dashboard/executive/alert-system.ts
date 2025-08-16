import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/client';
import {
  type KPICalculationResult,
  kpiCalculationService,
} from './kpi-calculation-service';

// Alert Types and Schemas
export const AlertSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);
export const AlertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'resolved',
  'dismissed',
]);
export const AlertTypeSchema = z.enum([
  'kpi_threshold',
  'trend_anomaly',
  'system_health',
  'business_rule',
]);

export const AlertRuleSchema = z.object({
  id: z.string().uuid(),
  clinicId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  type: AlertTypeSchema,
  severity: AlertSeveritySchema,
  isActive: z.boolean().default(true),
  conditions: z.object({
    kpiId: z.string().uuid().optional(),
    operator: z.enum(['>', '<', '>=', '<=', '==', '!=', 'between']),
    threshold: z.number(),
    secondaryThreshold: z.number().optional(), // for 'between' operator
    timeWindow: z.number().min(1).default(60), // minutes
    consecutiveViolations: z.number().min(1).default(1),
  }),
  actions: z.object({
    sendEmail: z.boolean().default(false),
    sendSMS: z.boolean().default(false),
    sendPushNotification: z.boolean().default(true),
    createTicket: z.boolean().default(false),
    emailRecipients: z.array(z.string().email()).optional(),
    smsRecipients: z.array(z.string()).optional(),
  }),
  schedule: z
    .object({
      enabled: z.boolean().default(true),
      timezone: z.string().default('America/Sao_Paulo'),
      workingHours: z
        .object({
          start: z.string().regex(/^\d{2}:\d{2}$/),
          end: z.string().regex(/^\d{2}:\d{2}$/),
        })
        .optional(),
      workingDays: z.array(z.number().min(0).max(6)).optional(), // 0 = Sunday
      excludeHolidays: z.boolean().default(false),
    })
    .optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AlertInstanceSchema = z.object({
  id: z.string().uuid(),
  ruleId: z.string().uuid(),
  clinicId: z.string().uuid(),
  title: z.string().min(1).max(255),
  message: z.string().max(2000),
  severity: AlertSeveritySchema,
  status: AlertStatusSchema,
  data: z.record(z.any()),
  triggeredAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().optional(),
  acknowledgedBy: z.string().uuid().optional(),
  resolvedAt: z.string().datetime().optional(),
  resolvedBy: z.string().uuid().optional(),
  dismissedAt: z.string().datetime().optional(),
  dismissedBy: z.string().uuid().optional(),
  metadata: z
    .object({
      kpiValue: z.number().optional(),
      threshold: z.number().optional(),
      previousValue: z.number().optional(),
      violationCount: z.number().default(1),
      autoResolved: z.boolean().default(false),
    })
    .optional(),
});

export const AlertNotificationSchema = z.object({
  id: z.string().uuid(),
  alertId: z.string().uuid(),
  clinicId: z.string().uuid(),
  type: z.enum(['email', 'sms', 'push', 'webhook']),
  recipient: z.string(),
  status: z.enum(['pending', 'sent', 'delivered', 'failed']),
  sentAt: z.string().datetime().optional(),
  deliveredAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().default(0),
  maxRetries: z.number().default(3),
});

export type AlertSeverity = z.infer<typeof AlertSeveritySchema>;
export type AlertStatus = z.infer<typeof AlertStatusSchema>;
export type AlertType = z.infer<typeof AlertTypeSchema>;
export type AlertRule = z.infer<typeof AlertRuleSchema>;
export type AlertInstance = z.infer<typeof AlertInstanceSchema>;
export type AlertNotification = z.infer<typeof AlertNotificationSchema>;

// Alert System Service
export class AlertSystem {
  private readonly supabase = createClient();
  private readonly evaluationTimers = new Map<string, NodeJS.Timeout>();
  private readonly EVALUATION_INTERVAL = 60_000; // 1 minute
  private isRunning = false;

  /**
   * Start the alert system
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    logger.info('Starting Alert System...');

    // Load and start monitoring all active alert rules
    await this.loadAndStartAlertRules();

    // Start periodic cleanup of old alerts
    this.startPeriodicCleanup();

    logger.info('Alert System started successfully');
  }

  /**
   * Stop the alert system
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    logger.info('Stopping Alert System...');

    // Clear all timers
    for (const timer of this.evaluationTimers.values()) {
      clearInterval(timer);
    }
    this.evaluationTimers.clear();

    logger.info('Alert System stopped');
  }

  /**
   * Create a new alert rule
   */
  async createAlertRule(
    rule: Omit<AlertRule, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<AlertRule | null> {
    try {
      const ruleId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data, error } = await this.supabase
        .from('alert_rules')
        .insert({
          id: ruleId,
          clinic_id: rule.clinicId,
          name: rule.name,
          description: rule.description,
          type: rule.type,
          severity: rule.severity,
          is_active: rule.isActive,
          conditions: rule.conditions,
          actions: rule.actions,
          schedule: rule.schedule,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating alert rule:', error);
        return null;
      }

      const newRule: AlertRule = {
        id: data.id,
        clinicId: data.clinic_id,
        name: data.name,
        description: data.description,
        type: data.type,
        severity: data.severity,
        isActive: data.is_active,
        conditions: data.conditions,
        actions: data.actions,
        schedule: data.schedule,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Start monitoring the new rule
      if (newRule.isActive) {
        this.startRuleEvaluation(newRule);
      }

      return newRule;
    } catch (error) {
      logger.error('Error creating alert rule:', error);
      return null;
    }
  }

  /**
   * Update an alert rule
   */
  async updateAlertRule(
    ruleId: string,
    updates: Partial<AlertRule>,
  ): Promise<AlertRule | null> {
    try {
      const { data, error } = await this.supabase
        .from('alert_rules')
        .update({
          name: updates.name,
          description: updates.description,
          type: updates.type,
          severity: updates.severity,
          is_active: updates.isActive,
          conditions: updates.conditions,
          actions: updates.actions,
          schedule: updates.schedule,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ruleId)
        .select()
        .single();

      if (error) {
        logger.error('Error updating alert rule:', error);
        return null;
      }

      const updatedRule: AlertRule = {
        id: data.id,
        clinicId: data.clinic_id,
        name: data.name,
        description: data.description,
        type: data.type,
        severity: data.severity,
        isActive: data.is_active,
        conditions: data.conditions,
        actions: data.actions,
        schedule: data.schedule,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      // Restart rule evaluation
      this.stopRuleEvaluation(ruleId);
      if (updatedRule.isActive) {
        this.startRuleEvaluation(updatedRule);
      }

      return updatedRule;
    } catch (error) {
      logger.error('Error updating alert rule:', error);
      return null;
    }
  }

  /**
   * Delete an alert rule
   */
  async deleteAlertRule(ruleId: string): Promise<boolean> {
    try {
      // Stop evaluation
      this.stopRuleEvaluation(ruleId);

      // Delete the rule
      const { error } = await this.supabase
        .from('alert_rules')
        .delete()
        .eq('id', ruleId);

      if (error) {
        logger.error('Error deleting alert rule:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error deleting alert rule:', error);
      return false;
    }
  }

  /**
   * Get active alerts for a clinic
   */
  async getActiveAlerts(
    clinicId: string,
    limit = 50,
  ): Promise<AlertInstance[]> {
    try {
      const { data, error } = await this.supabase
        .from('alert_instances')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('status', 'active')
        .order('triggered_at', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Error fetching active alerts:', error);
        return [];
      }

      return data.map((alert) => ({
        id: alert.id,
        ruleId: alert.rule_id,
        clinicId: alert.clinic_id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        status: alert.status,
        data: alert.data,
        triggeredAt: alert.triggered_at,
        acknowledgedAt: alert.acknowledged_at,
        acknowledgedBy: alert.acknowledged_by,
        resolvedAt: alert.resolved_at,
        resolvedBy: alert.resolved_by,
        dismissedAt: alert.dismissed_at,
        dismissedBy: alert.dismissed_by,
        metadata: alert.metadata,
      }));
    } catch (error) {
      logger.error('Error getting active alerts:', error);
      return [];
    }
  }

  /**
   * Acknowledge an alert
   */
  async acknowledgeAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('alert_instances')
        .update({
          status: 'acknowledged',
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: userId,
        })
        .eq('id', alertId);

      if (error) {
        logger.error('Error acknowledging alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      return false;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('alert_instances')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          resolved_by: userId,
        })
        .eq('id', alertId);

      if (error) {
        logger.error('Error resolving alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error resolving alert:', error);
      return false;
    }
  }

  /**
   * Dismiss an alert
   */
  async dismissAlert(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('alert_instances')
        .update({
          status: 'dismissed',
          dismissed_at: new Date().toISOString(),
          dismissed_by: userId,
        })
        .eq('id', alertId);

      if (error) {
        logger.error('Error dismissing alert:', error);
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      return false;
    }
  }

  /**
   * Load and start monitoring all active alert rules
   */
  private async loadAndStartAlertRules(): Promise<void> {
    try {
      const { data: rules, error } = await this.supabase
        .from('alert_rules')
        .select('*')
        .eq('is_active', true);

      if (error) {
        logger.error('Error loading alert rules:', error);
        return;
      }

      for (const ruleData of rules) {
        const rule: AlertRule = {
          id: ruleData.id,
          clinicId: ruleData.clinic_id,
          name: ruleData.name,
          description: ruleData.description,
          type: ruleData.type,
          severity: ruleData.severity,
          isActive: ruleData.is_active,
          conditions: ruleData.conditions,
          actions: ruleData.actions,
          schedule: ruleData.schedule,
          createdAt: ruleData.created_at,
          updatedAt: ruleData.updated_at,
        };

        this.startRuleEvaluation(rule);
      }

      logger.info(`Started monitoring ${rules.length} alert rules`);
    } catch (error) {
      logger.error('Error loading alert rules:', error);
    }
  }

  /**
   * Start evaluation for a specific rule
   */
  private startRuleEvaluation(rule: AlertRule): void {
    if (this.evaluationTimers.has(rule.id)) {
      return; // Already running
    }

    const timer = setInterval(async () => {
      try {
        await this.evaluateRule(rule);
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.id}:`, error);
      }
    }, this.EVALUATION_INTERVAL);

    this.evaluationTimers.set(rule.id, timer);
  }

  /**
   * Stop evaluation for a specific rule
   */
  private stopRuleEvaluation(ruleId: string): void {
    const timer = this.evaluationTimers.get(ruleId);
    if (timer) {
      clearInterval(timer);
      this.evaluationTimers.delete(ruleId);
    }
  }

  /**
   * Evaluate a single alert rule
   */
  private async evaluateRule(rule: AlertRule): Promise<void> {
    try {
      // Check if we should evaluate based on schedule
      if (!this.shouldEvaluateNow(rule)) {
        return;
      }

      // Get current KPI value
      const kpiResults = await kpiCalculationService.calculateClinicKPIs(
        rule.clinicId,
      );
      const targetKPI = kpiResults.find(
        (kpi) => kpi.kpi.id === rule.conditions.kpiId,
      );

      if (!targetKPI) {
        return; // KPI not found
      }

      // Check if condition is violated
      const isViolated = this.evaluateCondition(
        targetKPI.currentValue,
        rule.conditions,
      );

      if (isViolated) {
        // Check for existing active alert
        const existingAlert = await this.getExistingActiveAlert(rule.id);

        if (existingAlert) {
          // Update violation count
          await this.updateViolationCount(existingAlert.id);
        } else {
          // Create new alert
          await this.createAlert(rule, targetKPI);
        }
      } else {
        // Check if we should auto-resolve existing alerts
        await this.autoResolveAlerts(rule.id);
      }
    } catch (error) {
      logger.error(`Error evaluating rule ${rule.id}:`, error);
    }
  }

  /**
   * Check if rule should be evaluated now based on schedule
   */
  private shouldEvaluateNow(rule: AlertRule): boolean {
    if (!rule.schedule?.enabled) {
      return true;
    }

    const now = new Date();
    const schedule = rule.schedule;

    // Check working hours
    if (schedule.workingHours) {
      const currentTime = now.toTimeString().slice(0, 5);
      if (
        currentTime < schedule.workingHours.start ||
        currentTime > schedule.workingHours.end
      ) {
        return false;
      }
    }

    // Check working days
    if (schedule.workingDays && schedule.workingDays.length > 0) {
      const currentDay = now.getDay();
      if (!schedule.workingDays.includes(currentDay)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate if a condition is violated
   */
  private evaluateCondition(
    value: number,
    conditions: AlertRule['conditions'],
  ): boolean {
    const { operator, threshold, secondaryThreshold } = conditions;

    switch (operator) {
      case '>':
        return value > threshold;
      case '<':
        return value < threshold;
      case '>=':
        return value >= threshold;
      case '<=':
        return value <= threshold;
      case '==':
        return value === threshold;
      case '!=':
        return value !== threshold;
      case 'between':
        return (
          secondaryThreshold !== undefined &&
          value >= threshold &&
          value <= secondaryThreshold
        );
      default:
        return false;
    }
  }

  /**
   * Get existing active alert for a rule
   */
  private async getExistingActiveAlert(
    ruleId: string,
  ): Promise<AlertInstance | null> {
    try {
      const { data, error } = await this.supabase
        .from('alert_instances')
        .select('*')
        .eq('rule_id', ruleId)
        .eq('status', 'active')
        .single();

      if (error || !data) {
        return null;
      }

      return {
        id: data.id,
        ruleId: data.rule_id,
        clinicId: data.clinic_id,
        title: data.title,
        message: data.message,
        severity: data.severity,
        status: data.status,
        data: data.data,
        triggeredAt: data.triggered_at,
        acknowledgedAt: data.acknowledged_at,
        acknowledgedBy: data.acknowledged_by,
        resolvedAt: data.resolved_at,
        resolvedBy: data.resolved_by,
        dismissedAt: data.dismissed_at,
        dismissedBy: data.dismissed_by,
        metadata: data.metadata,
      };
    } catch (_error) {
      return null;
    }
  }

  /**
   * Create a new alert instance
   */
  private async createAlert(
    rule: AlertRule,
    kpiResult: KPICalculationResult,
  ): Promise<void> {
    try {
      const alertId = crypto.randomUUID();
      const now = new Date().toISOString();

      const alert: Omit<
        AlertInstance,
        | 'acknowledgedAt'
        | 'acknowledgedBy'
        | 'resolvedAt'
        | 'resolvedBy'
        | 'dismissedAt'
        | 'dismissedBy'
      > = {
        id: alertId,
        ruleId: rule.id,
        clinicId: rule.clinicId,
        title: `${rule.name} - Limite Excedido`,
        message: this.generateAlertMessage(rule, kpiResult),
        severity: rule.severity,
        status: 'active',
        data: {
          kpiId: kpiResult.kpi.id,
          kpiName: kpiResult.kpi.name,
          currentValue: kpiResult.currentValue,
          threshold: rule.conditions.threshold,
          operator: rule.conditions.operator,
        },
        triggeredAt: now,
        metadata: {
          kpiValue: kpiResult.currentValue,
          threshold: rule.conditions.threshold,
          previousValue: kpiResult.previousValue,
          violationCount: 1,
          autoResolved: false,
        },
      };

      const { error } = await this.supabase.from('alert_instances').insert({
        id: alert.id,
        rule_id: alert.ruleId,
        clinic_id: alert.clinicId,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        status: alert.status,
        data: alert.data,
        triggered_at: alert.triggeredAt,
        metadata: alert.metadata,
      });

      if (error) {
        logger.error('Error creating alert:', error);
        return;
      }

      // Send notifications
      await this.sendAlertNotifications(alert, rule);

      logger.info(`Alert created: ${alert.title}`);
    } catch (error) {
      logger.error('Error creating alert:', error);
    }
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    rule: AlertRule,
    kpiResult: KPICalculationResult,
  ): string {
    const kpiName = kpiResult.kpi.name;
    const currentValue = kpiResult.formattedValue;
    const threshold = rule.conditions.threshold;
    const operator = rule.conditions.operator;

    return (
      `O KPI "${kpiName}" está com valor ${currentValue}, que ${operator} ${threshold}. ` +
      'Verifique os dados e tome as ações necessárias.'
    );
  }

  /**
   * Update violation count for existing alert
   */
  private async updateViolationCount(alertId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('alert_instances')
        .select('metadata')
        .eq('id', alertId)
        .single();

      if (error || !data) {
        return;
      }

      const metadata = data.metadata || {};
      const newViolationCount = (metadata.violationCount || 1) + 1;

      await this.supabase
        .from('alert_instances')
        .update({
          metadata: {
            ...metadata,
            violationCount: newViolationCount,
          },
        })
        .eq('id', alertId);
    } catch (error) {
      logger.error('Error updating violation count:', error);
    }
  }

  /**
   * Auto-resolve alerts when condition is no longer violated
   */
  private async autoResolveAlerts(ruleId: string): Promise<void> {
    try {
      await this.supabase
        .from('alert_instances')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          metadata: {
            autoResolved: true,
          },
        })
        .eq('rule_id', ruleId)
        .eq('status', 'active');
    } catch (error) {
      logger.error('Error auto-resolving alerts:', error);
    }
  }

  /**
   * Send alert notifications
   */
  private async sendAlertNotifications(
    alert: AlertInstance,
    rule: AlertRule,
  ): Promise<void> {
    try {
      const actions = rule.actions;

      // Send email notifications
      if (actions.sendEmail && actions.emailRecipients) {
        for (const email of actions.emailRecipients) {
          await this.sendEmailNotification(alert, email);
        }
      }

      // Send SMS notifications
      if (actions.sendSMS && actions.smsRecipients) {
        for (const phone of actions.smsRecipients) {
          await this.sendSMSNotification(alert, phone);
        }
      }

      // Send push notifications
      if (actions.sendPushNotification) {
        await this.sendPushNotification(alert);
      }
    } catch (error) {
      logger.error('Error sending alert notifications:', error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(
    alert: AlertInstance,
    email: string,
  ): Promise<void> {
    // Implementation would depend on email service (SendGrid, AWS SES, etc.)
    logger.info(`Sending email notification to ${email} for alert ${alert.id}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSMSNotification(
    alert: AlertInstance,
    phone: string,
  ): Promise<void> {
    // Implementation would depend on SMS service (Twilio, AWS SNS, etc.)
    logger.info(`Sending SMS notification to ${phone} for alert ${alert.id}`);
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(alert: AlertInstance): Promise<void> {
    // Implementation would depend on push service (Firebase, OneSignal, etc.)
    logger.info(`Sending push notification for alert ${alert.id}`);
  }

  /**
   * Start periodic cleanup of old alerts
   */
  private startPeriodicCleanup(): void {
    setInterval(
      async () => {
        try {
          await this.cleanupOldAlerts();
        } catch (error) {
          logger.error('Error during periodic cleanup:', error);
        }
      },
      24 * 60 * 60 * 1000,
    ); // Daily cleanup
  }

  /**
   * Cleanup old resolved/dismissed alerts
   */
  private async cleanupOldAlerts(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      await this.supabase
        .from('alert_instances')
        .delete()
        .in('status', ['resolved', 'dismissed'])
        .lt('triggered_at', thirtyDaysAgo.toISOString());

      logger.info('Completed periodic cleanup of old alerts');
    } catch (error) {
      logger.error('Error cleaning up old alerts:', error);
    }
  }

  /**
   * Get alert statistics for dashboard
   */
  async getAlertStatistics(clinicId: string): Promise<{
    total: number;
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('alert_instances')
        .select('severity, status')
        .eq('clinic_id', clinicId)
        .gte(
          'triggered_at',
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ); // Last 7 days

      if (error) {
        logger.error('Error fetching alert statistics:', error);
        return { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }

      const stats = {
        total: data.length,
        active: data.filter((a) => a.status === 'active').length,
        critical: data.filter((a) => a.severity === 'critical').length,
        high: data.filter((a) => a.severity === 'high').length,
        medium: data.filter((a) => a.severity === 'medium').length,
        low: data.filter((a) => a.severity === 'low').length,
      };

      return stats;
    } catch (error) {
      logger.error('Error getting alert statistics:', error);
      return { total: 0, active: 0, critical: 0, high: 0, medium: 0, low: 0 };
    }
  }
}

// Export singleton instance
export const alertSystem = new AlertSystem();
