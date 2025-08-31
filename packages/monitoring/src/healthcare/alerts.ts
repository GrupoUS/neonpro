/**
 * Healthcare Alert Configuration
 * Defines alerting rules for critical healthcare workflows
 */

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum AlertChannel {
  SLACK_HEALTHCARE = "slack-healthcare",
  PAGERDUTY = "pagerduty",
  EMAIL_COMPLIANCE = "email-compliance",
  EMAIL_SECURITY = "email-security",
  SMS_ONCALL = "sms-oncall",
  WEBHOOK = "webhook",
}

export interface AlertRule {
  name: string;
  condition: string;
  severity: AlertSeverity;
  channels: AlertChannel[];
  escalation: string;
  cooldownPeriod?: string;
  autoResolve?: boolean;
  healthcareSpecific?: boolean;
}

/**
 * Healthcare-specific alerting rules
 */
export const healthcareAlerts: AlertRule[] = [
  {
    name: "Patient Data Access Failure",
    condition: "patient_data_errors > 0",
    severity: AlertSeverity.CRITICAL,
    channels: [
      AlertChannel.SLACK_HEALTHCARE,
      AlertChannel.PAGERDUTY,
      AlertChannel.EMAIL_COMPLIANCE,
    ],
    escalation: "5m",
    cooldownPeriod: "10m",
    healthcareSpecific: true,
  },

  {
    name: "LGPD Audit Log Failure",
    condition: "audit_log_failures > 0",
    severity: AlertSeverity.CRITICAL,
    channels: [
      AlertChannel.EMAIL_COMPLIANCE,
      AlertChannel.EMAIL_SECURITY,
      AlertChannel.PAGERDUTY,
    ],
    escalation: "immediate",
    cooldownPeriod: "5m",
    healthcareSpecific: true,
  },

  {
    name: "Appointment Booking Degraded",
    condition: "booking_success_rate < 95%",
    severity: AlertSeverity.HIGH,
    channels: [AlertChannel.SLACK_HEALTHCARE, AlertChannel.EMAIL_SECURITY],
    escalation: "15m",
    cooldownPeriod: "30m",
    healthcareSpecific: true,
  },

  {
    name: "Emergency Access Blocked",
    condition: "emergency_access_failures > 0",
    severity: AlertSeverity.CRITICAL,
    channels: [
      AlertChannel.PAGERDUTY,
      AlertChannel.SMS_ONCALL,
      AlertChannel.SLACK_HEALTHCARE,
    ],
    escalation: "immediate",
    cooldownPeriod: "1m",
    autoResolve: false,
    healthcareSpecific: true,
  },
  {
    name: "Database Performance Degraded",
    condition: "db_response_time_p95 > 1000",
    severity: AlertSeverity.HIGH,
    channels: [AlertChannel.SLACK_HEALTHCARE, AlertChannel.EMAIL_SECURITY],
    escalation: "10m",
    cooldownPeriod: "20m",
  },

  {
    name: "API Response Time High",
    condition: "api_response_time_p95 > 2000",
    severity: AlertSeverity.MEDIUM,
    channels: [AlertChannel.SLACK_HEALTHCARE],
    escalation: "20m",
    cooldownPeriod: "30m",
  },

  {
    name: "System Memory High",
    condition: "memory_usage > 85%",
    severity: AlertSeverity.MEDIUM,
    channels: [AlertChannel.SLACK_HEALTHCARE],
    escalation: "15m",
    cooldownPeriod: "1h",
  },

  {
    name: "Circuit Breaker Open",
    condition: "circuit_breaker_open_count > 0",
    severity: AlertSeverity.HIGH,
    channels: [AlertChannel.SLACK_HEALTHCARE, AlertChannel.EMAIL_SECURITY],
    escalation: "5m",
    cooldownPeriod: "10m",
  },
];

/**
 * Simple alert manager for healthcare monitoring
 */
export class HealthcareAlertManager {
  private activeAlerts = new Map<string, Date>();

  /**
   * Process an alert based on healthcare rules
   */
  async processAlert(
    alertName: string,
    condition: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const rule = healthcareAlerts.find((r) => r.name === alertName);

    if (!rule) {
      console.warn(`No alert rule found for: ${alertName}`);
      return;
    }

    // Check cooldown period
    const lastAlert = this.activeAlerts.get(alertName);
    if (lastAlert && rule.cooldownPeriod) {
      const cooldownMs = this.parseDuration(rule.cooldownPeriod);
      if (Date.now() - lastAlert.getTime() < cooldownMs) {
        return; // Skip alert due to cooldown
      }
    }

    // Record this alert
    this.activeAlerts.set(alertName, new Date());

    // Send alert
    await this.sendAlert(rule, condition, metadata);
  }

  /**
   * Send alert to configured channels
   */
  private async sendAlert(
    rule: AlertRule,
    condition: Record<string, unknown>,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    console.error(`[${rule.severity.toUpperCase()} ALERT] ${rule.name}`, {
      condition,
      metadata,
      channels: rule.channels,
      escalation: rule.escalation,
    });

    // TODO: Implement actual alert sending to various channels
    // For now, just log the alert
  }

  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smh])$/);
    if (!match) {
      return 0;
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case "s":
        return value * 1000;
      case "m":
        return value * 60 * 1000;
      case "h":
        return value * 60 * 60 * 1000;
      default:
        return 0;
    }
  }
}
