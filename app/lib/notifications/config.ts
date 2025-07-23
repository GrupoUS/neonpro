/**
 * NeonPro - Notification System Configuration
 * HIPAA-compliant notification management with React Email + Twilio SMS
 */

export const NOTIFICATION_CONFIG = {
  // Email configuration
  email: {
    from: process.env.NOTIFICATION_FROM_EMAIL || 'notifications@neonpro.app',
    replyTo: process.env.NOTIFICATION_REPLY_TO || 'no-reply@neonpro.app',
    provider: 'resend' as const,
    templates: {
      appointmentReminder: 'appointment-reminder',
      appointmentConfirmation: 'appointment-confirmation', 
      appointmentCancellation: 'appointment-cancellation',
      rescheduleRequest: 'reschedule-request',
      treatmentReminder: 'treatment-reminder',
      followUpReminder: 'follow-up-reminder'
    }
  },
  
  // SMS configuration (Twilio)
  sms: {
    enabled: Boolean(process.env.TWILIO_ACCOUNT_SID),
    provider: 'twilio' as const,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    maxLength: 160,
    templates: {
      appointmentReminder: 'appointment_reminder_sms',
      appointmentConfirmation: 'appointment_confirmation_sms',
      emergencyReminder: 'emergency_reminder_sms'
    }
  },

  // Scheduling configuration
  scheduling: {
    timezones: ['America/Sao_Paulo', 'America/New_York', 'America/Los_Angeles'],
    defaultTimezone: 'America/Sao_Paulo',
    reminderIntervals: {
      // Appointment reminders
      firstReminder: { days: 7, hours: 0 }, // 1 week before
      secondReminder: { days: 1, hours: 0 }, // 1 day before  
      finalReminder: { days: 0, hours: 2 }, // 2 hours before
      // Treatment follow-ups
      followUp: { days: 1, hours: 0 }, // Next day
      checkIn: { days: 7, hours: 0 } // 1 week after
    }
  },

  // HIPAA compliance settings
  security: {
    encryptionEnabled: true,
    auditLogging: true,
    consentRequired: true,
    retentionPeriod: 2555, // 7 years in days
    allowedChannels: ['email', 'sms', 'in_app'] as const
  },

  // Message preferences
  preferences: {
    defaultChannel: 'email' as const,
    allowOptOut: true,
    requireConfirmation: false,
    businessHours: {
      start: '08:00',
      end: '18:00',
      timezone: 'America/Sao_Paulo'
    },
    quietHours: {
      start: '20:00',
      end: '08:00',
      timezone: 'America/Sao_Paulo'
    }
  }
} as const;

// Notification types for the system
export type NotificationType = 
  | 'appointment_reminder'
  | 'appointment_confirmation'
  | 'appointment_cancellation'
  | 'reschedule_request'
  | 'treatment_reminder'
  | 'follow_up_reminder'
  | 'emergency_alert'
  | 'billing_reminder';

export type NotificationChannel = 'email' | 'sms' | 'in_app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

// User preference interface
export interface NotificationPreferences {
  userId: string;
  channels: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: Record<NotificationType, boolean>;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    timezone: string;
  };
  language: string;
  timezone: string;
}

// Environment validation
export function validateNotificationConfig() {
  const errors: string[] = [];

  // Check email configuration
  if (!process.env.RESEND_API_KEY) {
    errors.push('RESEND_API_KEY is required for email notifications');
  }

  // Check SMS configuration  
  if (NOTIFICATION_CONFIG.sms.enabled) {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      errors.push('TWILIO_ACCOUNT_SID is required for SMS notifications');
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      errors.push('TWILIO_AUTH_TOKEN is required for SMS notifications');
    }
    if (!NOTIFICATION_CONFIG.sms.fromNumber) {
      errors.push('TWILIO_FROM_NUMBER is required for SMS notifications');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Notification configuration errors:\n${errors.join('\n')}`);
  }

  return true;
}