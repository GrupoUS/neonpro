import { addHours, format, isBefore } from "date-fns";
import { NotificationType } from "../types";
import type {
  AudienceFilterData,
  CreateNotificationCampaignData,
  CreateNotificationData,
  CreateNotificationTemplateData,
  Notification,
  NotificationCampaign,
  NotificationLog,
  NotificationPreference,
  NotificationPreferenceData,
  NotificationTemplate,
} from "./types";
import {
  CampaignStatus,
  NotificationChannel,
  NotificationEvent,
  NotificationPriority,
  NotificationStatus,
  VariableType,
} from "./types";

export interface NotificationRepository {
  // Notification operations
  createNotification(data: CreateNotificationData): Promise<Notification>;
  updateNotification(
    id: string,
    data: Partial<Notification>,
  ): Promise<Notification>;
  getNotification(id: string): Promise<Notification | null>;
  getNotificationsByRecipient(recipientId: string): Promise<Notification[]>;
  getNotificationsByStatus(status: NotificationStatus): Promise<Notification[]>;
  getScheduledNotifications(beforeDate: Date): Promise<Notification[]>;

  // Template operations
  createTemplate(
    data: CreateNotificationTemplateData,
  ): Promise<NotificationTemplate>;
  updateTemplate(
    id: string,
    data: Partial<NotificationTemplate>,
  ): Promise<NotificationTemplate>;
  getTemplate(id: string): Promise<NotificationTemplate | null>;
  getTemplates(filters?: TemplateFilters): Promise<NotificationTemplate[]>;

  // Campaign operations
  createCampaign(
    data: CreateNotificationCampaignData,
  ): Promise<NotificationCampaign>;
  updateCampaign(
    id: string,
    data: Partial<NotificationCampaign>,
  ): Promise<NotificationCampaign>;
  getCampaign(id: string): Promise<NotificationCampaign | null>;
  getCampaigns(status?: CampaignStatus): Promise<NotificationCampaign[]>;

  // Preference operations
  createOrUpdatePreferences(
    data: NotificationPreferenceData,
  ): Promise<NotificationPreference>;
  getPreferences(patientId: string): Promise<NotificationPreference | null>;

  // Log operations
  createLog(
    data: Omit<NotificationLog, "id" | "createdAt" | "updatedAt">,
  ): Promise<NotificationLog>;
  getLogs(notificationId: string): Promise<NotificationLog[]>;

  // Patient operations (from other services)
  getPatients(filters: AudienceFilterData): Promise<PatientInfo[]>;
  getPatient(id: string): Promise<PatientInfo | null>;
  getAppointment(id: string): Promise<AppointmentInfo | null>;
  getTreatmentPlan(id: string): Promise<TreatmentPlanInfo | null>;
}
export interface TemplateFilters {
  type?: NotificationType;
  channel?: NotificationChannel;
  isActive?: boolean;
  language?: string;
}

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  tags: string[];
  preferences?: NotificationPreference;
}

export interface AppointmentInfo {
  id: string;
  patientId: string;
  treatmentType: string;
  providerId: string;
  scheduledDate: Date;
  duration: number;
  status: string;
}

export interface TreatmentPlanInfo {
  id: string;
  patientId: string;
  treatmentType: string;
  totalSessions: number;
  completedSessions: number;
}

export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalFailed: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  channelDistribution: { channel: NotificationChannel; count: number; }[];
}

export interface ExternalNotificationProvider {
  sendEmail(
    to: string,
    subject: string,
    content: string,
    metadata?: unknown,
  ): Promise<string>;
  sendSMS(to: string, message: string, metadata?: unknown): Promise<string>;
  sendWhatsApp(
    to: string,
    message: string,
    metadata?: unknown,
  ): Promise<string>;
  sendPush(
    deviceToken: string,
    title: string,
    message: string,
    metadata?: unknown,
  ): Promise<string>;
}

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly externalProvider: ExternalNotificationProvider,
  ) {}

  // Core notification management
  async sendNotification(data: CreateNotificationData): Promise<Notification> {
    // Get recipient preferences
    const preferences = await this.repository.getPreferences(data.recipientId);

    // Check if recipient has opted in for this type of notification
    if (!this.canSendNotification(data, preferences)) {
      throw new Error("Recipient has opted out of this notification type");
    }

    // Create notification record
    const notification = await this.repository.createNotification({
      ...data,
      status: data.scheduledAt
        ? NotificationStatus.SCHEDULED
        : NotificationStatus.QUEUED,
      retryCount: 0,
    });

    // If not scheduled, send immediately
    if (!data.scheduledAt) {
      await this.deliverNotification(notification);
    }

    return notification;
  }
  private async deliverNotification(notification: Notification): Promise<void> {
    try {
      await this.repository.updateNotification(notification.id, {
        status: NotificationStatus.SENDING,
      });

      let externalId: string;

      switch (notification.channel) {
        case NotificationChannel.EMAIL: {
          if (!notification.recipientEmail) {
            throw new Error("Email address required for email notifications");
          }
          externalId = await this.externalProvider.sendEmail(
            notification.recipientEmail,
            notification.title,
            notification.message,
            notification.metadata,
          );
          break;
        }

        case NotificationChannel.SMS: {
          if (!notification.recipientPhone) {
            throw new Error("Phone number required for SMS notifications");
          }
          externalId = await this.externalProvider.sendSMS(
            notification.recipientPhone,
            notification.message,
            notification.metadata,
          );
          break;
        }

        case NotificationChannel.WHATSAPP: {
          if (!notification.recipientPhone) {
            throw new Error("Phone number required for WhatsApp notifications");
          }
          externalId = await this.externalProvider.sendWhatsApp(
            notification.recipientPhone,
            notification.message,
            notification.metadata,
          );
          break;
        }

        default: {
          throw new Error(
            `Unsupported notification channel: ${notification.channel}`,
          );
        }
      }

      await this.repository.updateNotification(notification.id, {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        externalId,
      });

      await this.repository.createLog({
        notificationId: notification.id,
        event: NotificationEvent.SENT,
        timestamp: new Date(),
        details: { externalId, channel: notification.channel },
      });
    } catch (_error) {
      const retryCount = notification.retryCount + 1;
      const shouldRetry = retryCount <= notification.maxRetries;

      await this.repository.updateNotification(notification.id, {
        status: shouldRetry
          ? NotificationStatus.QUEUED
          : NotificationStatus.FAILED,
        retryCount,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      if (shouldRetry) {
        // Schedule retry (implement exponential backoff)
        const retryDelay = 2 ** retryCount * 60; // Minutes
        const retryAt = addHours(new Date(), retryDelay / 60);
        await this.repository.updateNotification(notification.id, {
          scheduledAt: retryAt,
        });
      }

      await this.repository.createLog({
        notificationId: notification.id,
        event: NotificationEvent.FAILED,
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : "Unknown error",
          retryCount,
        },
      });
    }
  } // Appointment-specific notifications
  async sendAppointmentReminder(
    appointmentId: string,
    hoursBeforeAppointment = 24,
  ): Promise<Notification> {
    const appointment = await this.repository.getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const patient = await this.repository.getPatient(appointment.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const scheduledAt = addHours(
      appointment.scheduledDate,
      -hoursBeforeAppointment,
    );

    // Don't schedule if it's in the past
    if (isBefore(scheduledAt, new Date())) {
      throw new Error("Cannot schedule reminder for past appointments");
    }

    const templateData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      appointmentDate: format(appointment.scheduledDate, "dd/MM/yyyy"),
      appointmentTime: format(appointment.scheduledDate, "HH:mm"),
      treatmentType: appointment.treatmentType,
      duration: appointment.duration,
    };

    return this.sendNotification({
      type: NotificationType.APPOINTMENT_REMINDER,
      recipientId: appointment.patientId,
      recipientEmail: patient.email,
      recipientPhone: patient.phone,
      channel: NotificationChannel.SMS, // Primary channel for reminders
      title: "Lembrete de Consulta",
      message: this.buildAppointmentReminderMessage(templateData),
      scheduledAt,
      priority: NotificationPriority.HIGH,
      templateData,
      isAutomated: true,
    });
  }

  async sendAppointmentConfirmation(
    appointmentId: string,
  ): Promise<Notification> {
    const appointment = await this.repository.getAppointment(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const patient = await this.repository.getPatient(appointment.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    const templateData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      appointmentDate: format(appointment.scheduledDate, "dd/MM/yyyy"),
      appointmentTime: format(appointment.scheduledDate, "HH:mm"),
      treatmentType: appointment.treatmentType,
    };

    return this.sendNotification({
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      recipientId: appointment.patientId,
      recipientEmail: patient.email,
      recipientPhone: patient.phone,
      channel: NotificationChannel.EMAIL,
      title: "Confirmação de Agendamento",
      message: this.buildAppointmentConfirmationMessage(templateData),
      priority: NotificationPriority.NORMAL,
      templateData,
      isAutomated: true,
    });
  }

  async sendTreatmentFollowUp(
    treatmentPlanId: string,
    sessionNumber: number,
  ): Promise<Notification> {
    const treatmentPlan = await this.repository.getTreatmentPlan(treatmentPlanId);
    if (!treatmentPlan) {
      throw new Error("Treatment plan not found");
    }

    const patient = await this.repository.getPatient(treatmentPlan.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    // Schedule follow-up 24 hours after treatment
    const scheduledAt = addHours(new Date(), 24);

    const templateData = {
      patientName: `${patient.firstName} ${patient.lastName}`,
      treatmentType: treatmentPlan.treatmentType,
      sessionNumber,
      totalSessions: treatmentPlan.totalSessions,
    };

    return this.sendNotification({
      type: NotificationType.TREATMENT_FOLLOWUP,
      recipientId: treatmentPlan.patientId,
      recipientEmail: patient.email,
      recipientPhone: patient.phone,
      channel: NotificationChannel.EMAIL,
      title: "Como você está se sentindo?",
      message: this.buildTreatmentFollowUpMessage(templateData),
      scheduledAt,
      priority: NotificationPriority.NORMAL,
      templateData,
      isAutomated: true,
    });
  } // Template management
  async createTemplate(
    data: CreateNotificationTemplateData,
  ): Promise<NotificationTemplate> {
    const templateData = {
      ...data,
      version: 1,
      usedCount: 0,
    };

    return this.repository.createTemplate(templateData);
  }

  async renderTemplate(
    templateId: string,
    variables: Record<string, unknown>,
  ): Promise<string> {
    const template = await this.repository.getTemplate(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    if (!template.isActive) {
      throw new Error("Template is not active");
    }

    let content = template.content;

    // Replace template variables
    for (const variable of template.variables) {
      const placeholder = `{{${variable.name}}}`;
      let value = variables[variable.name];

      if (value === undefined || value === null) {
        if (variable.required) {
          throw new Error(`Required variable '${variable.name}' is missing`);
        }
        value = variable.defaultValue || "";
      }

      // Type conversion and validation
      value = this.convertAndValidateVariable(value, variable);
      content = content.replaceAll(new RegExp(placeholder, "g"), value);
    }

    return content;
  }

  private convertAndValidateVariable(
    value: unknown,
    variable: unknown,
  ): string {
    switch (variable.type) {
      case VariableType.DATE: {
        if (value instanceof Date) {
          return format(value, "dd/MM/yyyy");
        }
        break;
      }
      case VariableType.NUMBER: {
        return Number(value).toString();
      }
      case VariableType.BOOLEAN: {
        return value ? "Sim" : "Não";
      }
      default: {
        return String(value);
      }
    }
    return String(value);
  }

  // Campaign management
  async createCampaign(
    data: CreateNotificationCampaignData,
  ): Promise<NotificationCampaign> {
    const template = await this.repository.getTemplate(data.templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Get target audience
    const recipients = await this.repository.getPatients(data.targetAudience);

    const campaign = await this.repository.createCampaign({
      ...data,
      totalRecipients: recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      openedCount: 0,
      clickedCount: 0,
      unsubscribedCount: 0,
      failedCount: 0,
      status: data.scheduledAt
        ? CampaignStatus.SCHEDULED
        : CampaignStatus.DRAFT,
    });

    return campaign;
  }

  async launchCampaign(campaignId: string): Promise<void> {
    const campaign = await this.repository.getCampaign(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    if (
      campaign.status !== CampaignStatus.SCHEDULED
      && campaign.status !== CampaignStatus.DRAFT
    ) {
      throw new Error("Can only launch scheduled or draft campaigns");
    }

    await this.repository.updateCampaign(campaignId, {
      status: CampaignStatus.RUNNING,
      startedAt: new Date(),
    });

    // Get recipients and template
    const recipients = await this.repository.getPatients(
      campaign.targetAudience,
    );
    const template = await this.repository.getTemplate(campaign.templateId);

    if (!template) {
      throw new Error("Campaign template not found");
    }

    // Send notifications to all recipients
    for (const recipient of recipients) {
      try {
        // Check recipient preferences
        const preferences = await this.repository.getPreferences(recipient.id);
        if (
          !this.canSendCampaignToRecipient(campaign, recipient, preferences)
        ) {
          continue;
        }

        const templateData = {
          patientName: `${recipient.firstName} ${recipient.lastName}`,
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
          phone: recipient.phone,
        };

        const renderedContent = await this.renderTemplate(
          template.id,
          templateData,
        );

        await this.sendNotification({
          type: campaign.type as NotificationType,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          recipientPhone: recipient.phone,
          channel: campaign.channel,
          title: template.subject || campaign.name,
          message: renderedContent,
          templateId: template.id,
          templateData,
          campaignId: campaign.id,
          priority: NotificationPriority.NORMAL,
          isAutomated: true,
        });

        // Update campaign stats
        await this.repository.updateCampaign(campaignId, {
          sentCount: campaign.sentCount + 1,
        });
      } catch {
        await this.repository.updateCampaign(campaignId, {
          failedCount: campaign.failedCount + 1,
        });
      }
    }

    // Mark campaign as completed
    await this.repository.updateCampaign(campaignId, {
      status: CampaignStatus.COMPLETED,
      completedAt: new Date(),
    });
  } // Preference checking and utility methods
  private canSendNotification(
    notification: CreateNotificationData,
    preferences?: NotificationPreference,
  ): boolean {
    if (!preferences) {
      return true; // Default to allowing notifications if no preferences set
    }

    // Check global channel preferences
    switch (notification.channel) {
      case NotificationChannel.EMAIL: {
        if (!preferences.emailNotifications) {
          return false;
        }
        break;
      }
      case NotificationChannel.SMS: {
        if (!preferences.smsNotifications) {
          return false;
        }
        break;
      }
      case NotificationChannel.WHATSAPP: {
        if (!preferences.whatsappNotifications) {
          return false;
        }
        break;
      }
      case NotificationChannel.PUSH: {
        if (!preferences.pushNotifications) {
          return false;
        }
        break;
      }
    }

    // Check specific notification type preferences
    switch (notification.type) {
      case NotificationType.APPOINTMENT_REMINDER:
      case NotificationType.APPOINTMENT_CONFIRMATION: {
        return preferences.appointmentReminders;
      }
      case NotificationType.TREATMENT_FOLLOWUP: {
        return preferences.treatmentFollowups;
      }
      case NotificationType.PROMOTION: {
        return preferences.promotionalOffers;
      }
      case NotificationType.BIRTHDAY: {
        return preferences.birthdayMessages;
      }
      case NotificationType.REVIEW_REQUEST: {
        return preferences.reviewRequests;
      }
      default: {
        return preferences.generalUpdates;
      }
    }
  }

  private canSendCampaignToRecipient(
    campaign: NotificationCampaign,
    recipient: PatientInfo,
    preferences?: NotificationPreference,
  ): boolean {
    // Check if recipient has marketing consent
    if (!campaign.targetAudience.marketingConsent) {
      return false;
    }

    // Check notification preferences
    const mockNotification: CreateNotificationData = {
      type: campaign.type as NotificationType,
      recipientId: recipient.id,
      channel: campaign.channel,
      title: "",
      message: "",
    };

    return this.canSendNotification(mockNotification, preferences);
  }

  // Message builders for default templates
  private buildAppointmentReminderMessage(data: unknown): string {
    return `Olá ${data.patientName}! Lembramos que você tem uma consulta de ${data.treatmentType} agendada para ${data.appointmentDate} às ${data.appointmentTime}. Duração: ${data.duration} minutos. Para reagendar, entre em contato conosco.`;
  }

  private buildAppointmentConfirmationMessage(data: unknown): string {
    return `Olá ${data.patientName}! Sua consulta de ${data.treatmentType} foi confirmada para ${data.appointmentDate} às ${data.appointmentTime}. Estamos ansiosos para atendê-lo(a)!`;
  }

  private buildTreatmentFollowUpMessage(data: unknown): string {
    return `Olá ${data.patientName}! Como você está se sentindo após a sessão ${data.sessionNumber} de ${data.treatmentType}? Sua opinião é muito importante para nós. Responda a esta mensagem ou entre em contato conosco.`;
  }

  // Scheduled notification processing
  async processScheduledNotifications(): Promise<void> {
    const scheduledNotifications = await this.repository.getScheduledNotifications(new Date());

    for (const notification of scheduledNotifications) {
      try {
        await this.deliverNotification(notification);
      } catch {}
    }
  }

  // Analytics and reporting
  async getNotificationStats(
    startDate?: Date,
    endDate?: Date,
  ): Promise<NotificationStats> {
    // This would need to be implemented based on the repository methods
    // For now, returning a placeholder implementation

    const allNotifications = await this.repository.getNotificationsByStatus(
      NotificationStatus.SENT,
    );

    // Filter by date range if provided
    const filteredNotifications = startDate && endDate
      ? allNotifications.filter(
        (n) => n.sentAt && n.sentAt >= startDate && n.sentAt <= endDate,
      )
      : allNotifications;

    const { length: totalSent } = filteredNotifications;
    const totalDelivered = filteredNotifications.filter(
      (n) => n.status === NotificationStatus.DELIVERED,
    ).length;
    const totalOpened = filteredNotifications.filter(
      (n) => n.status === NotificationStatus.OPENED,
    ).length;
    const totalClicked = filteredNotifications.filter(
      (n) => n.status === NotificationStatus.CLICKED,
    ).length;
    const totalFailed = filteredNotifications.filter(
      (n) => n.status === NotificationStatus.FAILED,
    ).length;

    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    // Channel distribution
    const channelMap = new Map<NotificationChannel, number>();
    filteredNotifications.forEach((n) => {
      channelMap.set(n.channel, (channelMap.get(n.channel) || 0) + 1);
    });

    const channelDistribution = [...channelMap.entries()].map(
      ([channel, count]) => ({
        channel,
        count,
      }),
    );

    return {
      totalSent,
      totalDelivered,
      totalOpened,
      totalClicked,
      totalFailed,
      deliveryRate,
      openRate,
      clickRate,
      channelDistribution,
    };
  }

  // Preference management
  async updateNotificationPreferences(
    data: NotificationPreferenceData,
  ): Promise<NotificationPreference> {
    return this.repository.createOrUpdatePreferences(data);
  }

  async getNotificationPreferences(
    patientId: string,
  ): Promise<NotificationPreference | null> {
    return this.repository.getPreferences(patientId);
  }

  // Unsubscribe handling
  async unsubscribePatient(patientId: string, _reason?: string): Promise<void> {
    const preferences = await this.repository.getPreferences(patientId);

    const updatedPreferences: NotificationPreferenceData = {
      patientId,
      emailNotifications: false,
      smsNotifications: false,
      whatsappNotifications: false,
      pushNotifications: false,
      appointmentReminders: true, // Keep essential notifications
      treatmentFollowups: false,
      promotionalOffers: false,
      birthdayMessages: false,
      reviewRequests: false,
      generalUpdates: false,
      preferredTime: preferences?.preferredTime || {
        morning: true,
        afternoon: true,
        evening: false,
        weekend: false,
      },
      timezone: preferences?.timezone || "America/Sao_Paulo",
      language: preferences?.language || "pt-BR",
    };

    await this.repository.createOrUpdatePreferences(updatedPreferences);
  }
}
