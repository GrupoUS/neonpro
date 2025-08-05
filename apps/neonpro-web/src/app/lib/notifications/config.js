"use strict";
/**
 * NeonPro - Notification System Configuration
 * HIPAA-compliant notification management with React Email + Twilio SMS
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NOTIFICATION_CONFIG = void 0;
exports.validateNotificationConfig = validateNotificationConfig;
exports.NOTIFICATION_CONFIG = {
  // Email configuration
  email: {
    from: process.env.NOTIFICATION_FROM_EMAIL || "notifications@neonpro.app",
    replyTo: process.env.NOTIFICATION_REPLY_TO || "no-reply@neonpro.app",
    provider: "resend",
    templates: {
      appointmentReminder: "appointment-reminder",
      appointmentConfirmation: "appointment-confirmation",
      appointmentCancellation: "appointment-cancellation",
      rescheduleRequest: "reschedule-request",
      treatmentReminder: "treatment-reminder",
      followUpReminder: "follow-up-reminder",
    },
  },
  // SMS configuration (Twilio)
  sms: {
    enabled: Boolean(process.env.TWILIO_ACCOUNT_SID),
    provider: "twilio",
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    maxLength: 160,
    templates: {
      appointmentReminder: "appointment_reminder_sms",
      appointmentConfirmation: "appointment_confirmation_sms",
      emergencyReminder: "emergency_reminder_sms",
    },
  },
  // Scheduling configuration
  scheduling: {
    timezones: ["America/Sao_Paulo", "America/New_York", "America/Los_Angeles"],
    defaultTimezone: "America/Sao_Paulo",
    reminderIntervals: {
      // Appointment reminders
      firstReminder: { days: 7, hours: 0 }, // 1 week before
      secondReminder: { days: 1, hours: 0 }, // 1 day before
      finalReminder: { days: 0, hours: 2 }, // 2 hours before
      // Treatment follow-ups
      followUp: { days: 1, hours: 0 }, // Next day
      checkIn: { days: 7, hours: 0 }, // 1 week after
    },
  },
  // HIPAA compliance settings
  security: {
    encryptionEnabled: true,
    auditLogging: true,
    consentRequired: true,
    retentionPeriod: 2555, // 7 years in days
    allowedChannels: ["email", "sms", "in_app"],
  },
  // Message preferences
  preferences: {
    defaultChannel: "email",
    allowOptOut: true,
    requireConfirmation: false,
    businessHours: {
      start: "08:00",
      end: "18:00",
      timezone: "America/Sao_Paulo",
    },
    quietHours: {
      start: "20:00",
      end: "08:00",
      timezone: "America/Sao_Paulo",
    },
  },
};
// Environment validation
function validateNotificationConfig() {
  var errors = [];
  // Check email configuration
  if (!process.env.RESEND_API_KEY) {
    errors.push("RESEND_API_KEY is required for email notifications");
  }
  // Check SMS configuration
  if (exports.NOTIFICATION_CONFIG.sms.enabled) {
    if (!process.env.TWILIO_ACCOUNT_SID) {
      errors.push("TWILIO_ACCOUNT_SID is required for SMS notifications");
    }
    if (!process.env.TWILIO_AUTH_TOKEN) {
      errors.push("TWILIO_AUTH_TOKEN is required for SMS notifications");
    }
    if (!exports.NOTIFICATION_CONFIG.sms.fromNumber) {
      errors.push("TWILIO_FROM_NUMBER is required for SMS notifications");
    }
  }
  if (errors.length > 0) {
    throw new Error("Notification configuration errors:\n".concat(errors.join("\n")));
  }
  return true;
}
