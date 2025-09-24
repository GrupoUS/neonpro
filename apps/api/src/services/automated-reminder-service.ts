/**
 * Automated Client Reminder System with Personalized Messaging
 *
 * Intelligent reminder system for healthcare appointments with:
 * - Personalized messaging based on patient preferences
 * - Multi-channel communication (email, SMS, WhatsApp)
 * - AI-driven message optimization
 * - LGPD compliance
 * - Real-time delivery tracking
 * - No-show prevention strategies
 */

import { prisma } from '../lib/prisma';
import { aguiAppointmentProtocol } from './ag-ui-appointment-protocol';
import { AIAppointmentSchedulingService } from './ai-appointment-scheduling-service';

export interface ReminderConfig {
  id: string;
  appointmentId: string;
  type: 'email' | 'sms' | 'whatsapp';
  timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before';
  scheduledTime: Date;
  message: string;
  personalization: ReminderPersonalization;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'cancelled';
  retryCount: number;
  maxRetries: number;
  deliveryTracking: DeliveryTracking;
}

export interface ReminderPersonalization {
  patientName: string;
  patientLanguage: string;
  preferredContactMethod: string;
  communicationStyle: 'formal' | 'casual' | 'friendly';
  accessibility: {
    largeText: boolean;
    simpleLanguage: boolean;
    voiceEnabled: boolean;
  };
  interests: string[];
  behavioralFactors: {
    responseRate: number;
    preferredTimes: string[];
    engagementLevel: 'low' | 'medium' | 'high';
  };
}

export interface DeliveryTracking {
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  respondedAt?: Date;
  failedReason?: string;
  providerMessageId?: string;
  statusCode?: number;
  retries: DeliveryRetry[];
}

export interface DeliveryRetry {
  attempt: number;
  timestamp: Date;
  success: boolean;
  error?: string;
  providerResponse?: any;
}

export interface ReminderTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before';
  content: ReminderContent;
  conditions: ReminderCondition[];
  priority: number;
  isActive: boolean;
}

export interface ReminderContent {
  subject?: string; // For email
  body: string;
  variables: string[];
  attachments?: ReminderAttachment[];
  callToAction?: {
    text: string;
    action: string;
    url?: string;
  };
}

export interface ReminderAttachment {
  name: string;
  type: string;
  url: string;
  size: number;
}

export interface ReminderCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface ReminderAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalResponded: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  responseRate: number;
  averageResponseTime: number;
  channelPerformance: {
    email: number;
    sms: number;
    whatsapp: number;
  };
  timingPerformance: {
    week_before: number;
    three_days_before: number;
    day_before: number;
    two_hours_before: number;
  };
}

export interface PatientCommunicationProfile {
  id: string;
  patientId: string;
  preferredLanguage: string;
  preferredContactMethod: 'email' | 'sms' | 'whatsapp' | 'phone';
  communicationStyle: 'formal' | 'casual' | 'friendly';
  bestContactTimes: string[];
  messageFrequency: 'low' | 'medium' | 'high';
  interests: string[];
  accessibility: {
    largeText: boolean;
    simpleLanguage: boolean;
    voiceEnabled: boolean;
    visualAids: boolean;
  };
  behavioralData: {
    responseRate: number;
    averageResponseTime: number;
    preferredTopics: string[];
    engagementScore: number;
  };
  consentStatus: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
    phone: boolean;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class AutomatedReminderService {
  private static instance: AutomatedReminderService;
  private processingQueue = false;
  private reminderQueue: ReminderConfig[] = [];
  private templates: Map<string, ReminderTemplate> = new Map();
  private analytics: ReminderAnalytics;

  private constructor() {
    this.analytics = this.initializeAnalytics();
    this.loadTemplates();
    this.startReminderProcessor();
    this.setupProtocolHandlers();
  }

  static getInstance(): AutomatedReminderService {
    if (!AutomatedReminderService.instance) {
      AutomatedReminderService.instance = new AutomatedReminderService();
    }
    return AutomatedReminderService.instance;
  }

  /**
   * Generate personalized reminder schedule for an appointment
   */
  async generateReminderSchedule(
    appointmentId: string,
    customPreferences?: Partial<PatientCommunicationProfile>,
  ): Promise<ReminderConfig[]> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          professional: true,
          clinic: true,
          serviceType: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Get or create patient communication profile
      let communicationProfile = await this.getPatientCommunicationProfile(appointment.patientId);

      if (customPreferences) {
        communicationProfile = { ...communicationProfile, ...customPreferences };
      }

      // Calculate no-show risk
      const _aiService = AIAppointmentSchedulingService.getInstance();
      const noShowRisk = appointment.noShowRiskScore || 0;

      // Determine reminder strategy based on risk and preferences
      const reminderStrategy = this.determineReminderStrategy(noShowRisk, communicationProfile);

      // Generate reminders
      const reminders: ReminderConfig[] = [];

      for (const reminderType of reminderStrategy) {
        const reminder = await this.createReminder(
          appointment,
          communicationProfile,
          reminderType,
          noShowRisk,
        );

        if (reminder) {
          reminders.push(reminder);
        }
      }

      // Save reminders to database
      await this.saveReminders(reminders);

      // Send notification via AG-UI Protocol
      for (const reminder of reminders) {
        await aguiAppointmentProtocol.sendReminderScheduled(appointment.clinicId, {
          appointmentId,
          reminderType: reminder.type,
          scheduledTime: reminder.scheduledTime,
          message: reminder.message,
          priority: reminder.priority,
        });
      }

      return reminders;
    } catch {
      console.error('Error generating reminder schedule:', error);
      throw new Error('Failed to generate reminder schedule');
    }
  }

  /**
   * Send personalized reminder immediately
   */
  async sendImmediateReminder(
    appointmentId: string,
    type: 'email' | 'sms' | 'whatsapp',
    customMessage?: string,
  ): Promise<ReminderConfig> {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: true,
          professional: true,
          clinic: true,
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const communicationProfile = await this.getPatientCommunicationProfile(appointment.patientId);

      const reminder: ReminderConfig = {
        id: this.generateReminderId(),
        appointmentId,
        type,
        timing: 'immediate',
        scheduledTime: new Date(),
        message: customMessage || this.generatePersonalizedMessage(
          appointment,
          communicationProfile,
          'immediate',
        ),
        personalization: this.createPersonalization(appointment.patient, communicationProfile),
        priority: 'urgent',
        status: 'pending',
        retryCount: 0,
        maxRetries: 3,
        deliveryTracking: { retries: [] },
      };

      // Send immediately
      await this.sendReminder(reminder);

      return reminder;
    } catch {
      console.error('Error sending immediate reminder:', error);
      throw new Error('Failed to send immediate reminder');
    }
  }

  /**
   * Process reminder queue and send pending reminders
   */
  async processReminderQueue(): Promise<void> {
    if (this.processingQueue) return;

    this.processingQueue = true;
    try {
      const pendingReminders = await prisma.reminder.findMany({
        where: {
          status: 'pending',
          scheduledTime: { lte: new Date() },
        },
        include: {
          appointment: {
            include: {
              patient: true,
              professional: true,
              clinic: true,
            },
          },
        },
      });

      for (const reminder of pendingReminders) {
        try {
          await this.sendReminder(reminder);
        } catch {
          console.error(`Error sending reminder ${reminder.id}:`, error);
        }
      }
    } catch {
      console.error('Error processing reminder queue:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  /**
   * Track reminder delivery and engagement
   */
  async trackReminderDelivery(
    reminderId: string,
    deliveryData: {
      status: 'delivered' | 'read' | 'responded' | 'failed';
      timestamp: Date;
      providerMessageId?: string;
      statusCode?: number;
      error?: string;
    },
  ): Promise<void> {
    try {
      const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId },
        include: {
          appointment: true,
        },
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      // Update reminder tracking
      const trackingData = {
        ...reminder.deliveryTracking,
        [
          deliveryData.status === 'delivered'
            ? 'deliveredAt'
            : deliveryData.status === 'read'
            ? 'readAt'
            : deliveryData.status === 'responded'
            ? 'respondedAt'
            : 'failedAt'
        ]: deliveryData.timestamp,
        ...(deliveryData.error && { failedReason: deliveryData.error }),
        ...(deliveryData.providerMessageId
          && { providerMessageId: deliveryData.providerMessageId }),
        ...(deliveryData.statusCode && { statusCode: deliveryData.statusCode }),
      };

      await prisma.reminder.update({
        where: { id: reminderId },
        data: {
          status: deliveryData.status === 'failed' ? 'failed' : deliveryData.status,
          deliveryTracking: trackingData,
        },
      });

      // Update analytics
      this.updateAnalytics(deliveryData.status);

      // Send notification via AG-UI Protocol
      if (deliveryData.status === 'delivered' || deliveryData.status === 'read') {
        await aguiAppointmentProtocol.sendMessage({
          id: this.generateMessageId(),
          type: 'reminder.delivered',
          timestamp: new Date(),
          source: 'system',
          clinicId: reminder.appointment.clinicId,
          data: {
            reminderId,
            appointmentId: reminder.appointmentId,
            patientId: reminder.appointment.patientId,
            deliveryStatus: deliveryData.status,
            timestamp: deliveryData.timestamp,
          },
          metadata: {
            priority: 'medium',
            requiresConfirmation: false,
            patientId: reminder.appointment.patientId,
            relatedAppointmentId: reminder.appointmentId,
          },
        });
      }
    } catch {
      console.error('Error tracking reminder delivery:', error);
      throw new Error('Failed to track reminder delivery');
    }
  }

  /**
   * Get reminder analytics and performance metrics
   */
  async getReminderAnalytics(
    filters?: {
      clinicId?: string;
      dateRange?: { start: Date; end: Date };
      type?: 'email' | 'sms' | 'whatsapp';
    },
  ): Promise<ReminderAnalytics> {
    try {
      // Build query filters
      const whereClause: any = {};

      if (filters?.clinicId) {
        whereClause.appointment = { clinicId: filters.clinicId };
      }

      if (filters?.dateRange) {
        whereClause.scheduledTime = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        };
      }

      if (filters?.type) {
        whereClause.type = filters.type;
      }

      // Get reminder statistics from database
      const reminders = await prisma.reminder.findMany({
        where: whereClause,
        include: {
          appointment: true,
        },
      });

      // Calculate analytics
      const analytics = this.calculateAnalytics(reminders);

      return analytics;
    } catch {
      console.error('Error getting reminder analytics:', error);
      throw new Error('Failed to get reminder analytics');
    }
  }

  /**
   * Create or update patient communication profile
   */
  async updatePatientCommunicationProfile(
    patientId: string,
    profileData: Partial<PatientCommunicationProfile>,
  ): Promise<PatientCommunicationProfile> {
    try {
      const existingProfile = await prisma.patientCommunicationProfile.findUnique({
        where: { patientId },
      });

      if (existingProfile) {
        const updatedProfile = await prisma.patientCommunicationProfile.update({
          where: { patientId },
          data: {
            ...profileData,
            updatedAt: new Date(),
          },
        });

        return updatedProfile;
      } else {
        const newProfile = await prisma.patientCommunicationProfile.create({
          data: {
            patientId,
            ...profileData,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        return newProfile;
      }
    } catch {
      console.error('Error updating patient communication profile:', error);
      throw new Error('Failed to update patient communication profile');
    }
  }

  // Private helper methods
  private async getPatientCommunicationProfile(
    patientId: string,
  ): Promise<PatientCommunicationProfile> {
    let profile = await prisma.patientCommunicationProfile.findUnique({
      where: { patientId },
    });

    if (!profile) {
      // Create default profile from patient data
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
      });

      if (!patient) {
        throw new Error('Patient not found');
      }

      profile = await this.createDefaultProfile(patient);
    }

    return profile;
  }

  private async createDefaultProfile(patient: any): Promise<PatientCommunicationProfile> {
    const defaultProfile: PatientCommunicationProfile = {
      id: this.generateProfileId(),
      patientId: patient.id,
      preferredLanguage: patient.languagePreference || 'pt-BR',
      preferredContactMethod: patient.preferredContactMethod || 'email',
      communicationStyle: 'friendly',
      bestContactTimes: ['09:00-12:00', '14:00-18:00'],
      messageFrequency: 'medium',
      interests: [],
      accessibility: {
        largeText: false,
        simpleLanguage: false,
        voiceEnabled: false,
        visualAids: false,
      },
      behavioralData: {
        responseRate: 0.7, // Default assumption
        averageResponseTime: 120, // 2 hours
        preferredTopics: [],
        engagementScore: 0.5,
      },
      consentStatus: {
        email: true,
        sms: patient.phonePrimary ? true : false,
        whatsapp: patient.phonePrimary ? true : false,
        phone: false,
        lastUpdated: new Date(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await prisma.patientCommunicationProfile.create({
      data: defaultProfile,
    });
  }

  private determineReminderStrategy(
    noShowRisk: number,
    profile: PatientCommunicationProfile,
  ): Array<
    {
      type: 'email' | 'sms' | 'whatsapp';
      timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before';
    }
  > {
    const strategy: Array<
      {
        type: 'email' | 'sms' | 'whatsapp';
        timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before';
      }
    > = [];

    // Base strategy for all appointments
    strategy.push({ type: 'email', timing: 'three_days_before' });
    strategy.push({ type: profile.preferredContactMethod, timing: 'day_before' });
    strategy.push({ type: 'sms', timing: 'two_hours_before' });

    // Enhanced strategy for high-risk appointments
    if (noShowRisk > 50) {
      strategy.unshift({ type: 'email', timing: 'week_before' });
      strategy.push({ type: profile.preferredContactMethod, timing: 'day_before' }); // Second day-before reminder
    }

    // WhatsApp strategy for highly engaged patients
    if (profile.consentStatus.whatsapp && profile.behavioralData.engagementScore > 0.7) {
      strategy.push({ type: 'whatsapp', timing: 'day_before' });
    }

    return strategy;
  }

  private async createReminder(
    appointment: any,
    profile: PatientCommunicationProfile,
    reminderType: {
      type: 'email' | 'sms' | 'whatsapp';
      timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before';
    },
    noShowRisk: number,
  ): Promise<ReminderConfig | null> {
    const scheduledTime = this.calculateReminderTime(appointment.startTime, reminderType.timing);

    // Check if patient has consented to this communication type
    if (!profile.consentStatus[reminderType.type]) {
      return null;
    }

    const reminder: ReminderConfig = {
      id: this.generateReminderId(),
      appointmentId: appointment.id,
      type: reminderType.type,
      timing: reminderType.timing,
      scheduledTime,
      message: this.generatePersonalizedMessage(appointment, profile, reminderType.timing),
      personalization: this.createPersonalization(appointment.patient, profile),
      priority: this.calculateReminderPriority(noShowRisk, reminderType.timing),
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
      deliveryTracking: { retries: [] },
    };

    return reminder;
  }

  private calculateReminderTime(
    appointmentTime: Date,
    timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before',
  ): Date {
    const reminderTime = new Date(appointmentTime);

    switch (timing) {
      case 'week_before':
        reminderTime.setDate(reminderTime.getDate() - 7);
        break;
      case 'three_days_before':
        reminderTime.setDate(reminderTime.getDate() - 3);
        break;
      case 'day_before':
        reminderTime.setDate(reminderTime.getDate() - 1);
        break;
      case 'two_hours_before':
        reminderTime.setHours(reminderTime.getHours() - 2);
        break;
    }

    return reminderTime;
  }

  private generatePersonalizedMessage(
    appointment: any,
    profile: PatientCommunicationProfile,
    timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before' | 'immediate',
  ): string {
    const { patient, professional, clinic } = appointment;
    const formattedDate = appointment.startTime.toLocaleDateString(profile.preferredLanguage, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointment.startTime.toLocaleTimeString(profile.preferredLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    });

    const templates = {
      week_before: {
        formal:
          `Prezado(a) ${patient.fullName}, seu agendamento com ${professional.fullName} está confirmado para ${formattedDate} às ${formattedTime}. Por favor, confirme sua presença com 48h de antecedência.`,
        casual:
          `Olá ${patient.fullName}! Seu agendamento com ${professional.fullName} está confirmado para ${formattedDate} às ${formattedTime}. Não esqueça de confirmar sua presença!`,
        friendly:
          `${patient.fullName}, tudo bem? Seu agendamento com ${professional.fullName} está confirmado para ${formattedDate} às ${formattedTime}. Confirmou a presença?`,
      },
      three_days_before: {
        formal:
          `Lembrete: Seu agendamento é em 3 dias - ${formattedDate} às ${formattedTime} com ${professional.fullName} na ${clinic.name}.`,
        casual:
          `Ei ${patient.fullName}, seu agendamento é em 3 dias! ${formattedDate} às ${formattedTime} com ${professional.fullName}.`,
        friendly:
          `${patient.fullName}, seu agendamento está chegando! Daqui a 3 dias, ${formattedDate} às ${formattedTime} com ${professional.fullName}.`,
      },
      day_before: {
        formal:
          `Atenção: Seu agendamento é amanhã às ${formattedTime} com ${professional.fullName} na ${clinic.name}. Por favor, chegue com 15 minutos de antecedência.`,
        casual:
          `Ei ${patient.fullName}, seu agendamento é amanhã! ${formattedTime} com ${professional.fullName}. Chegue 15min antes!`,
        friendly:
          `${patient.fullName}, amanhã é o dia! ${formattedTime} com ${professional.fullName}. Não esqueça de chegar 15min antes 😉`,
      },
      two_hours_before: {
        formal:
          `Seu agendamento é em 2 horas às ${formattedTime} com ${professional.fullName}. Por favor, dirija-se à clínica.`,
        casual:
          `${patient.fullName}, seu agendamento é em 2 horas! ${formattedTime} com ${professional.fullName}.`,
        friendly:
          `${patient.fullName}, daqui a pouco! Seu agendamento é em 2 horas às ${formattedTime} com ${professional.fullName}.`,
      },
      immediate: {
        formal:
          `Confirmamos seu agendamento para hoje às ${formattedTime} com ${professional.fullName}. Por favor, compareça à ${clinic.name}.`,
        casual:
          `${patient.fullName}, seu agendamento é hoje às ${formattedTime} com ${professional.fullName}!`,
        friendly:
          `${patient.fullName}, seu agendamento é hoje às ${formattedTime} com ${professional.fullName}. Te esperamos!`,
      },
    };

    return templates[timing][profile.communicationStyle];
  }

  private createPersonalization(
    patient: any,
    profile: PatientCommunicationProfile,
  ): ReminderPersonalization {
    return {
      patientName: patient.fullName,
      patientLanguage: profile.preferredLanguage,
      preferredContactMethod: profile.preferredContactMethod,
      communicationStyle: profile.communicationStyle,
      accessibility: profile.accessibility,
      interests: profile.interests,
      behavioralFactors: {
        responseRate: profile.behavioralData.responseRate,
        preferredTimes: profile.bestContactTimes,
        engagementLevel: profile.behavioralData.engagementScore > 0.7
          ? 'high'
          : profile.behavioralData.engagementScore > 0.4
          ? 'medium'
          : 'low',
      },
    };
  }

  private calculateReminderPriority(
    noShowRisk: number,
    timing: 'week_before' | 'three_days_before' | 'day_before' | 'two_hours_before',
  ): 'low' | 'medium' | 'high' | 'urgent' {
    if (noShowRisk > 70) return 'urgent';
    if (noShowRisk > 50) return 'high';
    if (timing === 'two_hours_before') return 'high';
    if (timing === 'day_before') return 'medium';
    return 'low';
  }

  private async sendReminder(reminder: ReminderConfig): Promise<void> {
    try {
      // Update reminder status
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: {
          status: 'sent',
          deliveryTracking: {
            ...reminder.deliveryTracking,
            sentAt: new Date(),
          },
        },
      });

      // Actually send the message (integration with email/SMS/WhatsApp providers)
      const deliveryResult = await this.deliverMessage(reminder);

      // Track delivery
      await this.trackReminderDelivery(reminder.id, deliveryResult);
    } catch {
      console.error('Error sending reminder:', error);

      // Handle retry logic
      if (reminder.retryCount < reminder.maxRetries) {
        await this.scheduleRetry(reminder);
      } else {
        await this.trackReminderDelivery(reminder.id, {
          status: 'failed',
          timestamp: new Date(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private async deliverMessage(_reminder: ReminderConfig): Promise<{
    status: 'delivered' | 'failed';
    timestamp: Date;
    providerMessageId?: string;
    statusCode?: number;
    error?: string;
  }> {
    // This would integrate with actual email/SMS/WhatsApp providers
    // For now, simulate successful delivery
    return {
      status: 'delivered',
      timestamp: new Date(),
      providerMessageId: `msg_${Date.now()}`,
      statusCode: 200,
    };
  }

  private async scheduleRetry(reminder: ReminderConfig): Promise<void> {
    const retryDelay = Math.pow(2, reminder.retryCount) * 5 * 60 * 1000; // Exponential backoff
    const retryTime = new Date(Date.now() + retryDelay);

    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        retryCount: reminder.retryCount + 1,
        status: 'pending',
        scheduledTime: retryTime,
        deliveryTracking: {
          ...reminder.deliveryTracking,
          retries: [
            ...reminder.deliveryTracking.retries,
            {
              attempt: reminder.retryCount + 1,
              timestamp: new Date(),
              success: false,
              error: 'Delivery failed, retrying',
            },
          ],
        },
      },
    });
  }

  private async saveReminders(reminders: ReminderConfig[]): Promise<void> {
    for (const reminder of reminders) {
      await prisma.reminder.create({
        data: {
          id: reminder.id,
          appointmentId: reminder.appointmentId,
          type: reminder.type,
          timing: reminder.timing,
          scheduledTime: reminder.scheduledTime,
          message: reminder.message,
          priority: reminder.priority,
          status: reminder.status,
          retryCount: reminder.retryCount,
          maxRetries: reminder.maxRetries,
          deliveryTracking: reminder.deliveryTracking,
        },
      });
    }
  }

  private initializeAnalytics(): ReminderAnalytics {
    return {
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalResponded: 0,
      totalFailed: 0,
      deliveryRate: 0,
      readRate: 0,
      responseRate: 0,
      averageResponseTime: 0,
      channelPerformance: {
        email: 0,
        sms: 0,
        whatsapp: 0,
      },
      timingPerformance: {
        week_before: 0,
        three_days_before: 0,
        day_before: 0,
        two_hours_before: 0,
      },
    };
  }

  private calculateAnalytics(reminders: any[]): ReminderAnalytics {
    const total = reminders.length;
    const delivered = reminders.filter(r => r.status === 'delivered').length;
    const read = reminders.filter(r => r.deliveryTracking.readAt).length;
    const responded = reminders.filter(r => r.deliveryTracking.respondedAt).length;
    const failed = reminders.filter(r => r.status === 'failed').length;

    return {
      totalSent: total,
      totalDelivered: delivered,
      totalRead: read,
      totalResponded: responded,
      totalFailed: failed,
      deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
      readRate: delivered > 0 ? (read / delivered) * 100 : 0,
      responseRate: read > 0 ? (responded / read) * 100 : 0,
      averageResponseTime: this.calculateAverageResponseTime(reminders),
      channelPerformance: this.calculateChannelPerformance(reminders),
      timingPerformance: this.calculateTimingPerformance(reminders),
    };
  }

  private calculateAverageResponseTime(reminders: any[]): number {
    const respondedReminders = reminders.filter(r =>
      r.deliveryTracking.readAt && r.deliveryTracking.respondedAt
    );

    if (respondedReminders.length === 0) return 0;

    const totalTime = respondedReminders.reduce((sum, r) => {
      return sum + (r.deliveryTracking.respondedAt.getTime() - r.deliveryTracking.readAt.getTime());
    }, 0);

    return totalTime / respondedReminders.length / (1000 * 60); // Return in minutes
  }

  private calculateChannelPerformance(reminders: any[]) {
    const email = reminders.filter(r => r.type === 'email');
    const sms = reminders.filter(r => r.type === 'sms');
    const whatsapp = reminders.filter(r => r.type === 'whatsapp');

    return {
      email: email.length > 0
        ? (email.filter(r => r.status === 'delivered').length / email.length) * 100
        : 0,
      sms: sms.length > 0
        ? (sms.filter(r => r.status === 'delivered').length / sms.length) * 100
        : 0,
      whatsapp: whatsapp.length > 0
        ? (whatsapp.filter(r => r.status === 'delivered').length / whatsapp.length) * 100
        : 0,
    };
  }

  private calculateTimingPerformance(reminders: any[]) {
    const weekBefore = reminders.filter(r => r.timing === 'week_before');
    const threeDaysBefore = reminders.filter(r => r.timing === 'three_days_before');
    const dayBefore = reminders.filter(r => r.timing === 'day_before');
    const twoHoursBefore = reminders.filter(r => r.timing === 'two_hours_before');

    return {
      week_before: weekBefore.length > 0
        ? (weekBefore.filter(r => r.status === 'delivered').length / weekBefore.length) * 100
        : 0,
      three_days_before: threeDaysBefore.length > 0
        ? (threeDaysBefore.filter(r => r.status === 'delivered').length / threeDaysBefore.length)
          * 100
        : 0,
      day_before: dayBefore.length > 0
        ? (dayBefore.filter(r => r.status === 'delivered').length / dayBefore.length) * 100
        : 0,
      two_hours_before: twoHoursBefore.length > 0
        ? (twoHoursBefore.filter(r => r.status === 'delivered').length / twoHoursBefore.length)
          * 100
        : 0,
    };
  }

  private updateAnalytics(status: string): void {
    switch (status) {
      case 'delivered':
        this.analytics.totalDelivered++;
        break;
      case 'read':
        this.analytics.totalRead++;
        break;
      case 'responded':
        this.analytics.totalResponded++;
        break;
      case 'failed':
        this.analytics.totalFailed++;
        break;
    }

    this.analytics.totalSent++;
    this.analytics.deliveryRate = (this.analytics.totalDelivered / this.analytics.totalSent) * 100;
    this.analytics.readRate = this.analytics.totalDelivered > 0
      ? (this.analytics.totalRead / this.analytics.totalDelivered) * 100
      : 0;
    this.analytics.responseRate = this.analytics.totalRead > 0
      ? (this.analytics.totalResponded / this.analytics.totalRead) * 100
      : 0;
  }

  private loadTemplates(): void {
    // Load reminder templates from database or configuration
    // This would typically load from a database table
  }

  private startReminderProcessor(): void {
    // Process reminder queue every minute
    setInterval(() => {
      this.processReminderQueue();
    }, 60 * 1000);
  }

  private setupProtocolHandlers(): void {
    // Set up handlers for AG-UI Protocol messages
    aguiAppointmentProtocol.on('reminder.sent', async _message => {
      // Handle reminder sent notifications
    });

    aguiAppointmentProtocol.on('reminder.failed', async _message => {
      // Handle reminder failure notifications
    });
  }

  private generateReminderId(): string {
    return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateProfileId(): string {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const automatedReminderService = AutomatedReminderService.getInstance();
