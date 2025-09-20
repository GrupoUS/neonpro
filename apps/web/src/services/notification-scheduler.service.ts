/**
 * Notification Scheduler Service
 * Handles automatic appointment reminders and scheduled notifications
 */

import { supabase } from "@/integrations/supabase/client";
import { addHours, format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  type NotificationData,
  notificationService,
} from "./notification.service";

export interface ScheduledNotification {
  id: string;
  appointmentId: string;
  patientId: string;
  notificationType:
    | "reminder_24h"
    | "reminder_1h"
    | "confirmation"
    | "followup";
  scheduledFor: Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  attempts: number;
  lastAttempt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  reminder24h: boolean;
  reminder1h: boolean;
  confirmationImmediate: boolean;
  followupAfter24h: boolean;
}

class NotificationSchedulerService {
  private readonly MAX_ATTEMPTS = 3;

  /**
   * Schedule notifications for a new appointment
   */
  async scheduleAppointmentNotifications(
    appointmentId: string,
    appointmentDate: Date,
    patientId: string,
    settings: ReminderSettings = {
      reminder24h: true,
      reminder1h: true,
      confirmationImmediate: true,
      followupAfter24h: false,
    },
  ): Promise<void> {
    try {
      const notifications: Omit<
        ScheduledNotification,
        "id" | "createdAt" | "updatedAt"
      >[] = [];

      // Immediate confirmation (sent right after booking)
      if (settings.confirmationImmediate) {
        notifications.push({
          appointmentId,
          patientId,
          notificationType: "confirmation",
          scheduledFor: new Date(), // Send immediately
          status: "pending",
          attempts: 0,
        });
      }

      // 24-hour reminder
      if (settings.reminder24h) {
        const reminder24h = addHours(appointmentDate, -24);
        if (isAfter(reminder24h, new Date())) {
          notifications.push({
            appointmentId,
            patientId,
            notificationType: "reminder_24h",
            scheduledFor: reminder24h,
            status: "pending",
            attempts: 0,
          });
        }
      }

      // 1-hour reminder
      if (settings.reminder1h) {
        const reminder1h = addHours(appointmentDate, -1);
        if (isAfter(reminder1h, new Date())) {
          notifications.push({
            appointmentId,
            patientId,
            notificationType: "reminder_1h",
            scheduledFor: reminder1h,
            status: "pending",
            attempts: 0,
          });
        }
      }

      // Follow-up notification (24 hours after appointment)
      if (settings.followupAfter24h) {
        const followup = addHours(appointmentDate, 24);
        notifications.push({
          appointmentId,
          patientId,
          notificationType: "followup",
          scheduledFor: followup,
          status: "pending",
          attempts: 0,
        });
      }

      // Save scheduled notifications to database
      if (notifications.length > 0) {
        const { error } = await supabase
          .from("scheduled_notifications" as any)
          .insert(notifications);

        if (error) {
          console.error("Error scheduling notifications:", error);
          throw error;
        }

        console.log(
          `Scheduled ${notifications.length} notifications for appointment ${appointmentId}`,
        );
      }
    } catch (error) {
      console.error("Error in scheduleAppointmentNotifications:", error);
      throw error;
    }
  }

  /**
   * Process pending notifications that are due to be sent
   */
  async processPendingNotifications(): Promise<void> {
    try {
      const now = new Date();

      // Get pending notifications that are due
      const { data: pendingNotifications, error } = await supabase
        .from("scheduled_notifications" as any)
        .select(
          `
          *,
          appointments!fk_scheduled_notifications_appointment (
            id,
            start_time,
            end_time,
            status,
            patients!fk_appointments_patient (
              id,
              full_name,
              email,
              phone_primary
            ),
            professionals!fk_appointments_professional (
              id,
              full_name
            ),
            service_types!fk_appointments_service_type (
              id,
              name
            ),
            clinics!fk_appointments_clinic (
              id,
              name,
              address,
              phone
            )
          )
        `,
        )
        .eq("status", "pending")
        .lte("scheduled_for", now.toISOString())
        .lt("attempts", this.MAX_ATTEMPTS);

      if (error) {
        console.error("Error fetching pending notifications:", error);
        return;
      }

      if (!pendingNotifications || pendingNotifications.length === 0) {
        console.log("No pending notifications to process");
        return;
      }

      console.log(
        `Processing ${pendingNotifications.length} pending notifications`,
      );

      // Process each notification
      for (const notification of pendingNotifications) {
        await this.processNotification(notification);
      }
    } catch (error) {
      console.error("Error in processPendingNotifications:", error);
    }
  }

  /**
   * Process a single notification
   */
  private async processNotification(notification: any): Promise<void> {
    try {
      const appointment = notification.appointments;
      if (!appointment) {
        console.error(
          "Appointment not found for notification:",
          notification.id,
        );
        await this.markNotificationFailed(notification.id);
        return;
      }

      // Skip if appointment is cancelled
      if (appointment.status === "cancelled") {
        await this.markNotificationCancelled(notification.id);
        return;
      }

      const patient = appointment.patients;
      const professional = appointment.professionals;
      const service = appointment.service_types;
      const clinic = appointment.clinics;

      // Prepare notification data
      const notificationData: NotificationData = {
        patientId: patient.id,
        patientName: patient.full_name,
        patientEmail: patient.email,
        patientPhone: patient.phone_primary,
        appointmentId: appointment.id,
        appointmentDate: new Date(appointment.start_time),
        appointmentTime: format(new Date(appointment.start_time), "HH:mm", {
          locale: ptBR,
        }),
        professionalName: professional?.full_name,
        serviceName: service?.name,
        clinicName: clinic?.name,
        clinicAddress: clinic?.address,
        clinicPhone: clinic?.phone,
      };

      // Send notification based on type
      let results;
      switch (notification.notificationType) {
        case "confirmation":
          results =
            await notificationService.sendAppointmentConfirmation(
              notificationData,
            );
          break;
        case "reminder_24h":
        case "reminder_1h":
          results =
            await notificationService.sendAppointmentReminder(notificationData);
          break;
        case "followup":
          // For follow-up, we could create a custom notification type
          results = await notificationService.sendAppointmentConfirmation({
            ...notificationData,
            customMessage:
              "Como foi sua experiência? Gostaríamos de saber sua opinião!",
          });
          break;
        default:
          console.error(
            "Unknown notification type:",
            notification.notificationType,
          );
          await this.markNotificationFailed(notification.id);
          return;
      }

      // Check if notification was sent successfully
      const successCount = results.filter((r) => r.success).length;
      if (successCount > 0) {
        await this.markNotificationSent(notification.id);
        console.log(`Notification ${notification.id} sent successfully`);
      } else {
        await this.markNotificationAttempted(notification.id);
        console.log(`Notification ${notification.id} failed, will retry later`);
      }
    } catch (error) {
      console.error("Error processing notification:", notification.id, error);
      await this.markNotificationAttempted(notification.id);
    }
  }

  /**
   * Mark notification as sent
   */
  private async markNotificationSent(notificationId: string): Promise<void> {
    await supabase
      .from("scheduled_notifications" as any)
      .update({
        status: "sent",
        last_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);
  }

  /**
   * Mark notification as attempted (for retry)
   */
  private async markNotificationAttempted(
    notificationId: string,
  ): Promise<void> {
    const { data } = await supabase
      .from("scheduled_notifications" as any)
      .select("attempts")
      .eq("id", notificationId)
      .single();

    const attempts =
      data && typeof (data as any).attempts === "number"
        ? (data as any).attempts
        : 0;
    const newAttempts = attempts + 1;
    const status = newAttempts >= this.MAX_ATTEMPTS ? "failed" : "pending";

    await supabase
      .from("scheduled_notifications" as any)
      .update({
        attempts: newAttempts,
        status,
        last_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);
  }

  /**
   * Mark notification as failed
   */
  private async markNotificationFailed(notificationId: string): Promise<void> {
    await supabase
      .from("scheduled_notifications" as any)
      .update({
        status: "failed",
        last_attempt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);
  }

  /**
   * Mark notification as cancelled
   */
  private async markNotificationCancelled(
    notificationId: string,
  ): Promise<void> {
    await supabase
      .from("scheduled_notifications" as any)
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", notificationId);
  }

  /**
   * Cancel all notifications for an appointment
   */
  async cancelAppointmentNotifications(appointmentId: string): Promise<void> {
    try {
      await supabase
        .from("scheduled_notifications" as any)
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("appointment_id", appointmentId)
        .in("status", ["pending"]);

      console.log(`Cancelled notifications for appointment ${appointmentId}`);
    } catch (error) {
      console.error("Error cancelling appointment notifications:", error);
      throw error;
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(clinicId?: string): Promise<{
    total: number;
    sent: number;
    pending: number;
    failed: number;
    cancelled: number;
  }> {
    try {
      let query = supabase
        .from("scheduled_notifications" as any)
        .select("status", { count: "exact" });

      if (clinicId) {
        query = query.eq("clinic_id", clinicId);
      }

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const stats = {
        total: count || 0,
        sent: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
      };

      if (data) {
        data.forEach((item: any) => {
          stats[item.status as keyof typeof stats]++;
        });
      }

      return stats;
    } catch (error) {
      console.error("Error getting notification stats:", error);
      return {
        total: 0,
        sent: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
      };
    }
  }
}

export const notificationSchedulerService = new NotificationSchedulerService();
