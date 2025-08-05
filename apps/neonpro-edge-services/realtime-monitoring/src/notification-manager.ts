import { v4 as uuidv4 } from "uuid";
import type {
  Env,
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
  RealtimeEvent,
  SystemAlert,
} from "./types";

export class NotificationManager {
  private env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  async sendRealtimeAlert(alert: SystemAlert): Promise<void> {
    try {
      // Create notification event
      const notification = await this.createNotificationFromAlert(alert);

      // Determine notification channels based on severity
      const channels = this.getChannelsForSeverity(alert.severity);

      // Send notifications through each channel
      for (const channel of channels) {
        await this.sendNotificationToChannel(notification, channel);
      }

      // Broadcast to WebSocket connections
      await this.broadcastToWebSockets(alert);

      // Log notification activity
      await this.logNotificationActivity(notification, alert);
    } catch (error) {
      console.error("Error sending realtime alert:", error);
    }
  }

  private async createNotificationFromAlert(alert: SystemAlert): Promise<NotificationEvent> {
    // Get users to notify based on alert type and severity
    const targetUsers = await this.getTargetUsers(alert);
    const targetRoles = this.getTargetRoles(alert);

    const notification: NotificationEvent = {
      id: uuidv4(),
      tenantId: alert.tenantId,
      type: this.mapAlertTypeToNotificationType(alert.type),
      targetUsers,
      targetRoles,
      title: alert.title,
      message: alert.message,
      data: {
        alertId: alert.id,
        alertType: alert.type,
        alertSeverity: alert.severity,
        patientId: alert.patientId,
        sourceId: alert.sourceId,
        metadata: alert.metadata,
      },
      channels: this.getChannelsForSeverity(alert.severity),
      priority: this.mapSeverityToPriority(alert.severity),
      isRead: false,
      createdAt: new Date().toISOString(),
      expiresAt: alert.expiresAt,
    };

    // Store notification
    await this.storeNotification(notification);

    return notification;
  }

  private async getTargetUsers(alert: SystemAlert): Promise<string[]> {
    const targetUsers: string[] = [];

    try {
      // For patient-specific alerts, include the patient if they have access
      if (alert.patientId) {
        const patientUser = await this.env.NEONPRO_DB.prepare(`
          SELECT user_id FROM patients WHERE id = ? AND tenant_id = ?
        `)
          .bind(alert.patientId, alert.tenantId)
          .first();

        if (patientUser?.user_id) {
          targetUsers.push(patientUser.user_id);
        }
      }

      // Include assigned healthcare providers for critical alerts
      if (alert.severity === "critical" || alert.severity === "emergency") {
        if (alert.patientId) {
          const providers = await this.env.NEONPRO_DB.prepare(`
            SELECT DISTINCT u.id as user_id
            FROM users u
            JOIN patient_provider_assignments ppa ON u.id = ppa.provider_id
            WHERE ppa.patient_id = ? AND ppa.tenant_id = ? AND ppa.is_active = TRUE
          `)
            .bind(alert.patientId, alert.tenantId)
            .all();

          for (const provider of providers.results || []) {
            targetUsers.push((provider as any).user_id);
          }
        }
      }

      // Include on-call staff for emergency alerts
      if (alert.severity === "emergency") {
        const onCallStaff = await this.env.NEONPRO_DB.prepare(`
          SELECT user_id FROM on_call_schedules 
          WHERE tenant_id = ? AND is_active = TRUE 
          AND start_time <= datetime('now') AND end_time >= datetime('now')
        `)
          .bind(alert.tenantId)
          .all();

        for (const staff of onCallStaff.results || []) {
          targetUsers.push((staff as any).user_id);
        }
      }
    } catch (error) {
      console.error("Error getting target users:", error);
    }

    return [...new Set(targetUsers)]; // Remove duplicates
  }

  private getTargetRoles(alert: SystemAlert): string[] {
    const roles: string[] = [];

    switch (alert.severity) {
      case "emergency":
      case "critical":
        roles.push("admin", "doctor", "nurse");
        break;
      case "high":
        roles.push("doctor", "nurse");
        break;
      case "medium":
        roles.push("doctor");
        if (alert.type === "equipment_malfunction") {
          roles.push("admin"); // Equipment issues need admin attention
        }
        break;
      case "low":
        // Low priority alerts typically don't need role-based broadcasting
        break;
    }

    return roles;
  }

  private getChannelsForSeverity(severity: string): NotificationChannel[] {
    switch (severity) {
      case "emergency":
        return ["in_app", "push", "sms", "voice_call", "whatsapp"];
      case "critical":
        return ["in_app", "push", "sms", "whatsapp"];
      case "high":
        return ["in_app", "push", "sms"];
      case "medium":
        return ["in_app", "push"];
      default:
        return ["in_app"];
    }
  }

  private mapAlertTypeToNotificationType(alertType: string): any {
    const typeMap: Record<string, any> = {
      vital_signs_critical: "vital_signs_alert",
      vital_signs_abnormal: "vital_signs_alert",
      appointment_missed: "appointment_cancellation",
      appointment_overdue: "appointment_reminder",
      equipment_malfunction: "system_maintenance",
      system_error: "system_maintenance",
      security_breach: "security_alert",
      compliance_violation: "compliance_notice",
      emergency_situation: "emergency_broadcast",
    };

    return typeMap[alertType] || "system_notification";
  }

  private mapSeverityToPriority(severity: string): NotificationPriority {
    switch (severity) {
      case "emergency":
      case "critical":
        return "urgent";
      case "high":
        return "high";
      case "medium":
        return "normal";
      default:
        return "low";
    }
  }

  private async sendNotificationToChannel(
    notification: NotificationEvent,
    channel: NotificationChannel,
  ): Promise<void> {
    try {
      switch (channel) {
        case "in_app":
          await this.sendInAppNotification(notification);
          break;
        case "push":
          await this.sendPushNotification(notification);
          break;
        case "email":
          await this.sendEmailNotification(notification);
          break;
        case "sms":
          await this.sendSMSNotification(notification);
          break;
        case "whatsapp":
          await this.sendWhatsAppNotification(notification);
          break;
        case "voice_call":
          await this.sendVoiceCallNotification(notification);
          break;
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
    }
  }

  private async sendInAppNotification(notification: NotificationEvent): Promise<void> {
    // Store in KV for in-app retrieval
    await this.env.NOTIFICATION_QUEUE.put(
      `in_app:${notification.tenantId}:${notification.id}`,
      JSON.stringify(notification),
      { expirationTtl: 86400 * 7 }, // 7 days
    );

    // Add to user-specific notification lists
    for (const userId of notification.targetUsers) {
      const userNotificationsKey = `notifications:${notification.tenantId}:${userId}`;
      const existing = await this.env.NOTIFICATION_QUEUE.get(userNotificationsKey);
      let notifications: string[] = existing ? JSON.parse(existing) : [];

      notifications.unshift(notification.id);

      // Keep only last 100 notifications per user
      if (notifications.length > 100) {
        notifications = notifications.slice(0, 100);
      }

      await this.env.NOTIFICATION_QUEUE.put(
        userNotificationsKey,
        JSON.stringify(notifications),
        { expirationTtl: 86400 * 30 }, // 30 days
      );
    }
  }

  private async sendPushNotification(notification: NotificationEvent): Promise<void> {
    if (!this.env.FCM_SERVER_KEY) return;

    // Get device tokens for target users
    const deviceTokens = await this.getDeviceTokens(
      notification.targetUsers,
      notification.tenantId,
    );

    if (deviceTokens.length === 0) return;

    // Prepare FCM payload
    const payload = {
      notification: {
        title: notification.title,
        body: notification.message,
        icon: "/icons/neonpro-icon-192.png",
        badge: "/icons/neonpro-badge.png",
        tag: `alert-${notification.data?.alertId}`,
        requireInteraction: notification.priority === "urgent",
      },
      data: {
        alertId: notification.data?.alertId || "",
        alertType: notification.data?.alertType || "",
        patientId: notification.data?.patientId || "",
        url: this.generateAlertUrl(notification),
      },
      android: {
        priority: notification.priority === "urgent" ? "high" : "normal",
        notification: {
          channelId: this.getAndroidChannelId(notification.priority),
          sound: notification.priority === "urgent" ? "emergency_alert.wav" : "default",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: notification.priority === "urgent" ? "emergency_alert.caf" : "default",
            badge: 1,
            category: "HEALTHCARE_ALERT",
          },
        },
      },
    };

    // Send to FCM (simplified - in production use proper FCM client)
    for (const token of deviceTokens) {
      try {
        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            Authorization: `key=${this.env.FCM_SERVER_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: token,
            ...payload,
          }),
        });

        if (!response.ok) {
          console.error("FCM send failed:", await response.text());
        }
      } catch (error) {
        console.error("Error sending FCM notification:", error);
      }
    }
  }

  private async sendSMSNotification(notification: NotificationEvent): Promise<void> {
    if (!this.env.TWILIO_ACCOUNT_SID || !this.env.TWILIO_AUTH_TOKEN) return;

    // Get phone numbers for target users
    const phoneNumbers = await this.getPhoneNumbers(
      notification.targetUsers,
      notification.tenantId,
    );

    if (phoneNumbers.length === 0) return;

    // Format SMS message (Brazilian Portuguese)
    const smsMessage = this.formatSMSMessage(notification);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Messages.json`;
    const twilioAuth = btoa(`${this.env.TWILIO_ACCOUNT_SID}:${this.env.TWILIO_AUTH_TOKEN}`);

    for (const phoneNumber of phoneNumbers) {
      try {
        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            Authorization: `Basic ${twilioAuth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: this.env.TWILIO_PHONE_NUMBER || "",
            To: phoneNumber,
            Body: smsMessage,
          }),
        });

        if (!response.ok) {
          console.error("Twilio SMS send failed:", await response.text());
        }
      } catch (error) {
        console.error("Error sending SMS notification:", error);
      }
    }
  }

  private async sendWhatsAppNotification(notification: NotificationEvent): Promise<void> {
    if (!this.env.WHATSAPP_ACCESS_TOKEN || !this.env.WHATSAPP_PHONE_NUMBER_ID) return;

    // Get WhatsApp numbers for target users
    const whatsappNumbers = await this.getWhatsAppNumbers(
      notification.targetUsers,
      notification.tenantId,
    );

    if (whatsappNumbers.length === 0) return;

    // Format WhatsApp message
    const whatsappMessage = this.formatWhatsAppMessage(notification);

    // Send via WhatsApp Business API
    const whatsappUrl = `https://graph.facebook.com/v18.0/${this.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    for (const phoneNumber of whatsappNumbers) {
      try {
        const response = await fetch(whatsappUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.env.WHATSAPP_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: phoneNumber,
            type: "text",
            text: {
              body: whatsappMessage,
            },
          }),
        });

        if (!response.ok) {
          console.error("WhatsApp send failed:", await response.text());
        }
      } catch (error) {
        console.error("Error sending WhatsApp notification:", error);
      }
    }
  }

  private async sendEmailNotification(notification: NotificationEvent): Promise<void> {
    // Email implementation would go here using SendGrid or similar
    // For now, just log the action
    console.log("Email notification would be sent:", notification.title);
  }

  private async sendVoiceCallNotification(notification: NotificationEvent): Promise<void> {
    // Voice call implementation would go here
    // For now, just log the action
    console.log("Voice call notification would be initiated:", notification.title);
  }

  private async broadcastToWebSockets(alert: SystemAlert): Promise<void> {
    // Get monitoring session DO
    const sessionId = `tenant:${alert.tenantId}`;
    const durableObjectId = this.env.MONITORING_SESSION.idFromName(sessionId);
    const durableObject = this.env.MONITORING_SESSION.get(durableObjectId);

    // Broadcast alert to all relevant connections
    await durableObject.fetch("http://broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: alert.tenantId,
        targetConnections: "all",
        message: {
          type: "alert_notification",
          data: alert,
          timestamp: new Date().toISOString(),
          messageId: uuidv4(),
        },
      }),
    });
  }

  private async storeNotification(notification: NotificationEvent): Promise<void> {
    // Store in D1 database
    await this.env.NEONPRO_DB.prepare(`
      INSERT INTO notifications (
        id, tenant_id, type, target_users, target_roles, title, message, 
        data, channels, priority, is_read, created_at, expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        notification.id,
        notification.tenantId,
        notification.type,
        JSON.stringify(notification.targetUsers),
        JSON.stringify(notification.targetRoles),
        notification.title,
        notification.message,
        JSON.stringify(notification.data),
        JSON.stringify(notification.channels),
        notification.priority,
        notification.isRead,
        notification.createdAt,
        notification.expiresAt,
      )
      .run();
  }

  private async logNotificationActivity(
    notification: NotificationEvent,
    alert: SystemAlert,
  ): Promise<void> {
    await this.env.AUDIT_LOGS.put(
      `notification:${notification.id}:${Date.now()}`,
      JSON.stringify({
        action: "notification_sent",
        notificationId: notification.id,
        alertId: alert.id,
        tenantId: notification.tenantId,
        channels: notification.channels,
        targetUsers: notification.targetUsers.length,
        targetRoles: notification.targetRoles,
        timestamp: new Date().toISOString(),
      }),
      { expirationTtl: 86400 * 90 }, // 90 days retention
    );
  }

  async getRealtimeEvents(
    tenantId: string,
    monitorType: string,
    userId: string,
  ): Promise<RealtimeEvent[]> {
    const events: RealtimeEvent[] = [];

    try {
      switch (monitorType) {
        case "vital-signs": {
          const vitalSigns = await this.getRecentVitalSigns(tenantId, userId);
          events.push(...vitalSigns);
          break;
        }

        case "system-alerts": {
          const alerts = await this.getRecentAlerts(tenantId);
          events.push(...alerts);
          break;
        }

        case "appointments": {
          const appointments = await this.getUpcomingAppointments(tenantId, userId);
          events.push(...appointments);
          break;
        }
      }
    } catch (error) {
      console.error("Error getting realtime events:", error);
    }

    return events;
  }

  private async getRecentVitalSigns(_tenantId: string, _userId: string): Promise<RealtimeEvent[]> {
    // Implementation would get recent vital signs data
    return [];
  }

  private async getRecentAlerts(_tenantId: string): Promise<RealtimeEvent[]> {
    // Implementation would get recent alerts
    return [];
  }

  private async getUpcomingAppointments(
    _tenantId: string,
    _userId: string,
  ): Promise<RealtimeEvent[]> {
    // Implementation would get upcoming appointments
    return [];
  }

  private async getDeviceTokens(userIds: string[], tenantId: string): Promise<string[]> {
    const tokens: string[] = [];

    try {
      const result = await this.env.NEONPRO_DB.prepare(`
        SELECT device_token FROM user_devices 
        WHERE user_id IN (${userIds.map(() => "?").join(",")}) 
        AND tenant_id = ? AND is_active = TRUE
      `)
        .bind(...userIds, tenantId)
        .all();

      for (const row of result.results || []) {
        tokens.push((row as any).device_token);
      }
    } catch (error) {
      console.error("Error getting device tokens:", error);
    }

    return tokens;
  }

  private async getPhoneNumbers(userIds: string[], tenantId: string): Promise<string[]> {
    const phoneNumbers: string[] = [];

    try {
      const result = await this.env.NEONPRO_DB.prepare(`
        SELECT phone FROM users 
        WHERE id IN (${userIds.map(() => "?").join(",")}) 
        AND tenant_id = ? AND phone IS NOT NULL
      `)
        .bind(...userIds, tenantId)
        .all();

      for (const row of result.results || []) {
        phoneNumbers.push((row as any).phone);
      }
    } catch (error) {
      console.error("Error getting phone numbers:", error);
    }

    return phoneNumbers;
  }

  private async getWhatsAppNumbers(userIds: string[], tenantId: string): Promise<string[]> {
    const whatsappNumbers: string[] = [];

    try {
      const result = await this.env.NEONPRO_DB.prepare(`
        SELECT whatsapp_number FROM user_profiles 
        WHERE user_id IN (${userIds.map(() => "?").join(",")}) 
        AND tenant_id = ? AND whatsapp_number IS NOT NULL
      `)
        .bind(...userIds, tenantId)
        .all();

      for (const row of result.results || []) {
        whatsappNumbers.push((row as any).whatsapp_number);
      }
    } catch (error) {
      console.error("Error getting WhatsApp numbers:", error);
    }

    return whatsappNumbers;
  }

  private formatSMSMessage(notification: NotificationEvent): string {
    const maxLength = 160; // Standard SMS length
    let message = `🏥 NeonPro: ${notification.title}`;

    if (message.length < maxLength - 20) {
      const remainingLength = maxLength - message.length - 5;
      const truncatedMessage =
        notification.message.length > remainingLength
          ? `${notification.message.substring(0, remainingLength)}...`
          : notification.message;
      message += `\n${truncatedMessage}`;
    }

    return message;
  }

  private formatWhatsAppMessage(notification: NotificationEvent): string {
    return `🏥 *NeonPro - ${notification.title}*\n\n${notification.message}\n\n_Sistema de Monitoramento em Tempo Real_`;
  }

  private generateAlertUrl(notification: NotificationEvent): string {
    const baseUrl = "https://app.neonpro.com.br";
    const alertId = notification.data?.alertId;

    if (alertId) {
      return `${baseUrl}/alerts/${alertId}`;
    }

    return `${baseUrl}/dashboard`;
  }

  private getAndroidChannelId(priority: NotificationPriority): string {
    switch (priority) {
      case "urgent":
        return "emergency_alerts";
      case "high":
        return "critical_alerts";
      case "normal":
        return "general_alerts";
      default:
        return "info_alerts";
    }
  }
}
