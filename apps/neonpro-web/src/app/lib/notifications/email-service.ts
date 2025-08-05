/**
 * NeonPro - Email Service for React Email Integration
 * HIPAA-compliant email notifications using React Email templates
 */

import type { render } from "@react-email/render";
import type { Resend } from "resend";
import type { z } from "zod";
import type { NOTIFICATION_CONFIG } from "./config";
import type { AppointmentCancellationEmail } from "./templates/appointment-cancellation";
import type { AppointmentConfirmationEmail } from "./templates/appointment-confirmation";
// Import email templates
import type { AppointmentReminderEmail } from "./templates/appointment-reminder";
import type { BillingReminderEmail } from "./templates/billing-reminder";
import type { EmergencyAlertEmail } from "./templates/emergency-alert";
import type { FollowUpReminderEmail } from "./templates/follow-up-reminder";
import type { RescheduleRequestEmail } from "./templates/reschedule-request";
import type { TreatmentReminderEmail } from "./templates/treatment-reminder";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  recipientId: string;
  recipientEmail: string;
  type: string;
  subject: string;
  content: string;
  templateData?: any;
  timezone?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

interface EmailResult {
  success: boolean;
  notificationId?: string;
  channel: "email";
  error?: string;
  deliveredAt?: Date;
  messageId?: string;
}

export class EmailService {
  private config = NOTIFICATION_CONFIG.email;

  /**
   * Send email using React Email templates
   */
  async send(payload: EmailPayload): Promise<EmailResult> {
    try {
      // Validate required environment variables
      if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY environment variable is required");
      }

      // Get appropriate template component
      const TemplateComponent = this.getTemplateComponent(payload.type);
      if (!TemplateComponent) {
        throw new Error(`No template found for notification type: ${payload.type}`);
      }

      // Render email template
      const emailHtml = render(
        TemplateComponent({
          ...payload.templateData,
          recipientEmail: payload.recipientEmail,
          timezone: payload.timezone || "UTC",
        }),
      );

      // Prepare email data
      const emailData = {
        from: this.config.from,
        to: payload.recipientEmail,
        subject: payload.subject,
        html: emailHtml,
        headers: {
          "X-Priority": this.getPriorityHeader(payload.priority),
          "X-Notification-Type": payload.type,
          "X-Recipient-ID": payload.recipientId,
        },
        tags: [
          { name: "notification_type", value: payload.type },
          { name: "priority", value: payload.priority || "normal" },
          { name: "clinic", value: "neonpro" },
        ],
      };

      // Send email via Resend
      const result = await resend.emails.send(emailData);

      if (result.error) {
        throw new Error(`Email sending failed: ${result.error.message}`);
      }

      return {
        success: true,
        notificationId: result.data?.id || `email_${Date.now()}`,
        messageId: result.data?.id,
        channel: "email",
        deliveredAt: new Date(),
      };
    } catch (error) {
      console.error("Email sending error:", error);
      return {
        success: false,
        channel: "email",
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  } /**
   * Get React Email template component for notification type
   */
  private getTemplateComponent(type: string) {
    const templates = {
      appointment_reminder: AppointmentReminderEmail,
      appointment_confirmation: AppointmentConfirmationEmail,
      appointment_cancellation: AppointmentCancellationEmail,
      reschedule_request: RescheduleRequestEmail,
      treatment_reminder: TreatmentReminderEmail,
      follow_up_reminder: FollowUpReminderEmail,
      emergency_alert: EmergencyAlertEmail,
      billing_reminder: BillingReminderEmail,
    };

    return templates[type as keyof typeof templates];
  }

  /**
   * Get email priority header value
   */
  private getPriorityHeader(priority?: string): string {
    switch (priority) {
      case "urgent":
        return "1";
      case "high":
        return "2";
      case "normal":
        return "3";
      case "low":
        return "4";
      default:
        return "3";
    }
  }

  /**
   * Get email delivery status from Resend
   */
  async getDeliveryStatus(messageId: string): Promise<{
    status: "pending" | "sent" | "delivered" | "failed" | "cancelled";
    deliveredAt?: Date;
    error?: string;
  } | null> {
    try {
      // Note: This is a placeholder for Resend's delivery status API
      // Resend doesn't currently provide detailed delivery status
      // You would implement webhook handling for delivery events

      // For now, assume sent means delivered after a short delay
      return {
        status: "delivered",
        deliveredAt: new Date(),
      };
    } catch (error) {
      console.error("Error getting email delivery status:", error);
      return null;
    }
  }

  /**
   * Validate email template data against schema
   */
  private validateTemplateData(type: string, data: any): boolean {
    try {
      // Define schemas for each template type
      const appointmentSchema = z.object({
        patientName: z.string(),
        appointmentDate: z.string(),
        appointmentTime: z.string(),
        clinicName: z.string(),
        clinicAddress: z.string(),
        cancellationLink: z.string().url().optional(),
        rescheduleLink: z.string().url().optional(),
      });

      const treatmentSchema = z.object({
        patientName: z.string(),
        treatmentName: z.string(),
        nextAppointment: z.string(),
        instructions: z.string().optional(),
      });

      const billingSchema = z.object({
        patientName: z.string(),
        amountDue: z.string(),
        dueDate: z.string(),
        paymentLink: z.string().url(),
        invoiceNumber: z.string(),
      });

      // Validate based on type
      switch (type) {
        case "appointment_reminder":
        case "appointment_confirmation":
        case "appointment_cancellation":
        case "reschedule_request":
          appointmentSchema.parse(data);
          break;
        case "treatment_reminder":
        case "follow_up_reminder":
          treatmentSchema.parse(data);
          break;
        case "billing_reminder":
          billingSchema.parse(data);
          break;
        case "emergency_alert":
          z.object({
            patientName: z.string(),
            message: z.string(),
            contactInfo: z.string(),
          }).parse(data);
          break;
      }

      return true;
    } catch (error) {
      console.error(`Template data validation failed for ${type}:`, error);
      return false;
    }
  }
}
