/**
 * NeonPro - SMS Service for Twilio Integration
 * HIPAA-compliant SMS notifications for healthcare appointments
 */

import type { Twilio } from "twilio";
import type { NOTIFICATION_CONFIG } from "./config";
import type { z } from "zod";

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

interface SMSPayload {
  recipientId: string;
  recipientPhone: string;
  type: string;
  content: string;
  templateData?: any;
  timezone?: string;
  priority?: "low" | "normal" | "high" | "urgent";
}

interface SMSResult {
  success: boolean;
  notificationId?: string;
  channel: "sms";
  error?: string;
  deliveredAt?: Date;
  messageId?: string;
}

export class SMSService {
  private config = NOTIFICATION_CONFIG.sms;

  /**
   * Send SMS using Twilio with HIPAA compliance
   */
  async send(payload: SMSPayload): Promise<SMSResult> {
    try {
      // Validate required environment variables
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error("Twilio credentials are required (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)");
      }

      if (!process.env.TWILIO_PHONE_NUMBER) {
        throw new Error("TWILIO_PHONE_NUMBER environment variable is required");
      }

      // Validate phone number format
      const cleanPhone = this.validatePhoneNumber(payload.recipientPhone);
      if (!cleanPhone) {
        throw new Error("Invalid phone number format");
      }

      // Generate SMS content based on type
      const messageContent = this.generateSMSContent(
        payload.type,
        payload.content,
        payload.templateData,
      );

      // Send SMS via Twilio
      const message = await client.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: cleanPhone,
        // HIPAA compliance settings
        forceDelivery: true, // Ensure message is delivered
        provideFeedback: true, // Enable delivery status callbacks
        statusCallback: `${process.env.NEXTAUTH_URL}/api/webhooks/sms-status`,
        // Optional: Set message validity period (max 4 days for SMS)
        validityPeriod: this.config.validityPeriod || 1440, // 24 hours in minutes
      });

      return {
        success: true,
        notificationId: message.sid,
        messageId: message.sid,
        channel: "sms",
        deliveredAt: new Date(),
      };
    } catch (error) {
      console.error("SMS sending error:", error);
      return {
        success: false,
        channel: "sms",
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  }

  /**
   * Validate and format phone number for Twilio
   */
  private validatePhoneNumber(phone: string): string | null {
    try {
      // Remove all non-digit characters
      const cleaned = phone.replace(/\D/g, "");

      // Handle Brazilian phone numbers
      if (cleaned.length === 11 && cleaned.startsWith("55")) {
        // Already has country code
        return `+${cleaned}`;
      } else if (cleaned.length === 10 || cleaned.length === 11) {
        // Add Brazilian country code
        return `+55${cleaned}`;
      } else if (cleaned.length === 13 && cleaned.startsWith("55")) {
        // Already formatted correctly
        return `+${cleaned}`;
      }

      // For international numbers, assume they're correctly formatted
      if (cleaned.length > 11) {
        return `+${cleaned}`;
      }

      return null;
    } catch (error) {
      console.error("Phone number validation error:", error);
      return null;
    }
  } /**
   * Generate SMS content based on notification type and template data
   */
  private generateSMSContent(type: string, baseContent: string, templateData?: any): string {
    try {
      // SMS templates optimized for healthcare (160-320 characters)
      const templates = {
        appointment_reminder: (data: any) =>
          `🏥 ${data?.clinicName || "NeonPro"}: Lembrete de consulta para ${data?.patientName} em ${data?.appointmentDate} às ${data?.appointmentTime}. Para cancelar/reagendar: ${data?.clinicPhone}. STOP para cancelar msgs.`,

        appointment_confirmation: (data: any) =>
          `✅ ${data?.clinicName || "NeonPro"}: Consulta confirmada para ${data?.patientName} em ${data?.appointmentDate} às ${data?.appointmentTime}. Local: ${data?.clinicAddress}. Chegue 15min antes.`,

        appointment_cancellation: (data: any) =>
          `❌ ${data?.clinicName || "NeonPro"}: Consulta cancelada para ${data?.patientName} em ${data?.appointmentDate} às ${data?.appointmentTime}. Para reagendar: ${data?.clinicPhone}.`,

        reschedule_request: (data: any) =>
          `📅 ${data?.clinicName || "NeonPro"}: Solicitação de reagendamento para ${data?.patientName}. Nova data disponível: ${data?.newDate}. Confirme: ${data?.confirmationLink}`,

        treatment_reminder: (data: any) =>
          `💊 ${data?.clinicName || "NeonPro"}: Lembrete de tratamento para ${data?.patientName}. ${data?.treatmentName} - Próxima sessão: ${data?.nextAppointment}.`,

        follow_up_reminder: (data: any) =>
          `👨‍⚕️ ${data?.clinicName || "NeonPro"}: Acompanhamento pós-tratamento para ${data?.patientName}. Agende consulta de retorno: ${data?.clinicPhone}.`,

        emergency_alert: (data: any) =>
          `🚨 ${data?.clinicName || "NeonPro"} - URGENTE: ${data?.message}. Contato: ${data?.contactInfo}. ${data?.patientName}`,

        billing_reminder: (data: any) =>
          `💳 ${data?.clinicName || "NeonPro"}: Cobrança de R$ ${data?.amountDue} vence em ${data?.dueDate}. Pague online: ${data?.paymentLink}`,
      };

      const template = templates[type as keyof typeof templates];
      if (template && templateData) {
        return template(templateData);
      }

      // Fallback to base content with character limit
      return baseContent.length > 320 ? `${baseContent.substring(0, 317)}...` : baseContent;
    } catch (error) {
      console.error("Error generating SMS content:", error);
      return baseContent.length > 160 ? `${baseContent.substring(0, 157)}...` : baseContent;
    }
  }

  /**
   * Get SMS delivery status from Twilio
   */
  async getDeliveryStatus(messageId: string): Promise<{
    status: "pending" | "sent" | "delivered" | "failed" | "cancelled";
    deliveredAt?: Date;
    error?: string;
  } | null> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        return null;
      }

      const message = await client.messages(messageId).fetch();

      // Map Twilio status to our status enum
      const statusMap: Record<string, "pending" | "sent" | "delivered" | "failed" | "cancelled"> = {
        queued: "pending",
        sending: "pending",
        sent: "sent",
        received: "delivered",
        delivered: "delivered",
        undelivered: "failed",
        failed: "failed",
        cancelled: "cancelled",
      };

      return {
        status: statusMap[message.status] || "failed",
        deliveredAt: message.dateUpdated ? new Date(message.dateUpdated) : undefined,
        error: message.errorCode ? `${message.errorCode}: ${message.errorMessage}` : undefined,
      };
    } catch (error) {
      console.error("Error getting SMS delivery status:", error);
      return null;
    }
  }

  /**
   * Validate SMS template data for specific notification type
   */
  private validateSMSTemplate(type: string, data: any): boolean {
    try {
      const requiredFields: Record<string, string[]> = {
        appointment_reminder: ["patientName", "appointmentDate", "appointmentTime", "clinicPhone"],
        appointment_confirmation: [
          "patientName",
          "appointmentDate",
          "appointmentTime",
          "clinicAddress",
        ],
        appointment_cancellation: [
          "patientName",
          "appointmentDate",
          "appointmentTime",
          "clinicPhone",
        ],
        reschedule_request: ["patientName", "newDate", "confirmationLink"],
        treatment_reminder: ["patientName", "treatmentName", "nextAppointment"],
        follow_up_reminder: ["patientName", "clinicPhone"],
        emergency_alert: ["message", "contactInfo", "patientName"],
        billing_reminder: ["patientName", "amountDue", "dueDate", "paymentLink"],
      };

      const required = requiredFields[type];
      if (!required) return true; // No validation for unknown types

      return required.every((field) => data && data[field]);
    } catch (error) {
      console.error("SMS template validation error:", error);
      return false;
    }
  }

  /**
   * Send bulk SMS messages (for batch notifications)
   */
  async sendBulk(payloads: SMSPayload[]): Promise<SMSResult[]> {
    const results: SMSResult[] = [];

    // Process in batches to avoid rate limiting
    const batchSize = 10; // Twilio's recommended batch size

    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      const batchPromises = batch.map((payload) => this.send(payload));

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches to respect rate limits
        if (i + batchSize < payloads.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
        }
      } catch (error) {
        console.error("Bulk SMS batch error:", error);
        // Add failed results for this batch
        batch.forEach(() => {
          results.push({
            success: false,
            channel: "sms",
            error: "Batch processing failed",
          });
        });
      }
    }

    return results;
  }
}
