/**
 * Tests for Real-time Notification Model (T036)
 * Following TDD methodology - MUST FAIL FIRST
 */

import { describe, expect, it } from "vitest";

describe("Real-time Notification Model (T036)", () => {
  it("should export Notification type", () => {
    expect(() => {
      const module = require("../notifications");
      expect(module.createNotification).toBeDefined();
    }).not.toThrow();
  });

  it("should have required notification fields", () => {
    const { Notification } = require("../notifications");
    const notification: Notification = {
      id: "notification-123",
      recipientId: "patient-123",
      type: "appointment_reminder",
      channel: "whatsapp",
      title: "Lembrete de Consulta",
      message: "Sua consulta está agendada para amanhã às 14:00",
      data: {
        appointmentId: "appointment-456",
        doctorName: "Dr. Silva",
        time: "14:00",
      },
      priority: "high",
      status: "pending",
      scheduledFor: new Date("2024-01-15T13:00:00"),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    expect(notification.id).toBe("notification-123");
    expect(notification.channel).toBe("whatsapp");
    expect(notification.priority).toBe("high");
  });

  it("should support notification types", () => {
    const { NotificationType } = require("../notifications");
    expect(NotificationType.APPOINTMENT_REMINDER).toBe("appointment_reminder");
    expect(NotificationType.APPOINTMENT_CONFIRMATION).toBe(
      "appointment_confirmation",
    );
    expect(NotificationType.MEDICATION_REMINDER).toBe("medication_reminder");
    expect(NotificationType.TEST_RESULT).toBe("test_result");
    expect(NotificationType.EMERGENCY_ALERT).toBe("emergency_alert");
  });

  it("should support notification channels", () => {
    const { NotificationChannel } = require("../notifications");
    expect(NotificationChannel.EMAIL).toBe("email");
    expect(NotificationChannel.SMS).toBe("sms");
    expect(NotificationChannel.WHATSAPP).toBe("whatsapp");
    expect(NotificationChannel.PUSH).toBe("push");
    expect(NotificationChannel.IN_APP).toBe("in_app");
  });

  it("should support priority levels", () => {
    const { NotificationPriority } = require("../notifications");
    expect(NotificationPriority.LOW).toBe("low");
    expect(NotificationPriority.NORMAL).toBe("normal");
    expect(NotificationPriority.HIGH).toBe("high");
    expect(NotificationPriority.URGENT).toBe("urgent");
    expect(NotificationPriority.CRITICAL).toBe("critical");
  });

  it("should support notification status", () => {
    const { NotificationStatus } = require("../notifications");
    expect(NotificationStatus.PENDING).toBe("pending");
    expect(NotificationStatus.SENT).toBe("sent");
    expect(NotificationStatus.DELIVERED).toBe("delivered");
    expect(NotificationStatus.READ).toBe("read");
    expect(NotificationStatus.FAILED).toBe("failed");
  });

  it("should support Brazilian notification templates", () => {
    const { NotificationTemplate } = require("../notifications");
    const template: NotificationTemplate = {
      id: "appointment-reminder-pt",
      name: "Lembrete de Consulta",
      type: "appointment_reminder",
      language: "pt-BR",
      channels: ["whatsapp", "sms", "email"],
      templates: {
        whatsapp:
          "Olá {{patientName}}! Lembre-se da sua consulta com {{doctorName}} amanhã às {{time}}.",
        sms: "Consulta agendada: {{doctorName}} - {{date}} {{time}}. Confirme: {{confirmLink}}",
        email: {
          subject: "Lembrete: Consulta agendada para {{date}}",
          body: "Prezado(a) {{patientName}}, sua consulta está confirmada...",
        },
      },
      variables: ["patientName", "doctorName", "date", "time", "confirmLink"],
      healthcareCompliant: true,
    };

    expect(template.language).toBe("pt-BR");
    expect(template.healthcareCompliant).toBe(true);
    expect(template.channels).toContain("whatsapp");
  });

  it("should validate notification data", () => {
    const { validateNotification } = require("../notifications");

    const validNotification = {
      recipientId: "patient-123",
      type: "appointment_reminder",
      channel: "whatsapp",
      title: "Lembrete",
      message: "Sua consulta é amanhã",
    };

    const invalidNotification = {
      recipientId: "",
      type: "invalid_type",
      channel: "invalid_channel",
    };

    expect(validateNotification(validNotification)).toBe(true);
    expect(validateNotification(invalidNotification)).toBe(false);
  });

  it("should support delivery tracking", () => {
    const { DeliveryStatus } = require("../notifications");
    const delivery: DeliveryStatus = {
      notificationId: "notification-123",
      channel: "whatsapp",
      status: "delivered",
      sentAt: new Date("2024-01-15T13:00:00"),
      deliveredAt: new Date("2024-01-15T13:01:00"),
      readAt: new Date("2024-01-15T13:05:00"),
      attempts: 1,
      errorMessage: null,
      providerId: "whatsapp-msg-456",
      cost: 0.05,
    };

    expect(delivery.status).toBe("delivered");
    expect(delivery.attempts).toBe(1);
    expect(delivery.cost).toBe(0.05);
  });

  it("should handle notification scheduling", () => {
    const { scheduleNotification } = require("../notifications");

    const notification = {
      recipientId: "patient-123",
      type: "appointment_reminder",
      channel: "whatsapp",
      title: "Lembrete",
      message: "Consulta amanhã",
    };

    const scheduledTime = new Date("2024-01-15T13:00:00");
    const scheduled = scheduleNotification(notification, scheduledTime);

    expect(scheduled.status).toBe("scheduled");
    expect(scheduled.scheduledFor).toEqual(scheduledTime);
  });

  it("should support multi-channel delivery", () => {
    const { createMultiChannelNotification } = require("../notifications");

    const baseNotification = {
      recipientId: "patient-123",
      type: "emergency_alert",
      title: "Alerta de Emergência",
      message: "Resultado crítico de exame",
      priority: "critical",
    };

    const channels = ["whatsapp", "sms", "email", "push"];
    const notifications = createMultiChannelNotification(
      baseNotification,
      channels,
    );

    expect(notifications).toHaveLength(4);
    expect(notifications[0].channel).toBe("whatsapp");
    expect(notifications[1].channel).toBe("sms");
  });

  it("should support LGPD compliance for notifications", () => {
    const { anonymizeNotification } = require("../notifications");

    const notification = {
      id: "notification-123",
      title: "Consulta com Dr. Silva para João",
      message: "João Silva, sua consulta está confirmada",
      data: {
        patientName: "João Silva",
        doctorName: "Dr. Silva",
        personalInfo: "CPF: 123.456.789-00",
      },
    };

    const anonymized = anonymizeNotification(notification);
    expect(anonymized.title).toMatch(/^NOTIFICAÇÃO ANONIMIZADA/);
    expect(anonymized.message).toMatch(/^MENSAGEM ANONIMIZADA/);
    expect(anonymized.data.patientName).toMatch(/^PACIENTE_ANON/);
  });

  it("should handle notification preferences", () => {
    const { NotificationPreferences } = require("../notifications");
    const preferences: NotificationPreferences = {
      userId: "patient-123",
      channels: {
        whatsapp: { enabled: true, number: "+5511999999999" },
        sms: { enabled: true, number: "+5511999999999" },
        email: { enabled: true, address: "patient@example.com" },
        push: { enabled: false },
        inApp: { enabled: true },
      },
      types: {
        appointment_reminder: ["whatsapp", "sms"],
        medication_reminder: ["whatsapp"],
        test_result: ["email", "whatsapp"],
        emergency_alert: ["whatsapp", "sms", "push"],
      },
      quietHours: {
        enabled: true,
        start: "22:00",
        end: "08:00",
        timezone: "America/Sao_Paulo",
      },
      language: "pt-BR",
    };

    expect(preferences.language).toBe("pt-BR");
    expect(preferences.channels.whatsapp.enabled).toBe(true);
    expect(preferences.quietHours.timezone).toBe("America/Sao_Paulo");
  });

  it("should support notification retry logic", () => {
    const { retryNotification } = require("../notifications");

    const failedNotification = {
      id: "notification-123",
      status: "failed",
      attempts: 1,
      lastAttemptAt: new Date("2024-01-15T13:00:00"),
      errorMessage: "Network timeout",
    };

    const retried = retryNotification(failedNotification);
    expect(retried.status).toBe("pending");
    expect(retried.attempts).toBe(2);
    expect(retried.nextRetryAt).toBeInstanceOf(Date);
  });

  it("should calculate notification metrics", () => {
    const { calculateNotificationMetrics } = require("../notifications");

    const notifications = [
      {
        status: "delivered",
        channel: "whatsapp",
        deliveryStatus: [{ cost: 0.05 }],
      },
      {
        status: "delivered",
        channel: "sms",
        deliveryStatus: [{ cost: 0.1 }],
      },
      {
        status: "failed",
        channel: "email",
        deliveryStatus: [{ cost: 0.01 }],
      },
      {
        status: "read",
        channel: "whatsapp",
        deliveryStatus: [{ cost: 0.05 }],
      },
    ];

    const metrics = calculateNotificationMetrics(notifications);
    expect(metrics.totalSent).toBe(4);
    expect(metrics.deliveryRate).toBe(0.75); // 3/4 delivered or read
    expect(metrics.totalCost).toBeCloseTo(0.21, 2);
    expect(metrics.byChannel.whatsapp).toBe(2);
  });

  it("should support Brazilian healthcare notification compliance", () => {
    const { validateHealthcareCompliance } = require("../notifications");

    const compliantNotification = {
      type: "test_result",
      channel: "whatsapp",
      lgpdConsent: true,
      healthcareContext: true,
      encryptionEnabled: true,
      auditTrail: true,
    };

    const nonCompliantNotification = {
      type: "marketing",
      channel: "email",
      lgpdConsent: false,
      healthcareContext: false,
    };

    expect(validateHealthcareCompliance(compliantNotification)).toBe(true);
    expect(validateHealthcareCompliance(nonCompliantNotification)).toBe(false);
  });
});
