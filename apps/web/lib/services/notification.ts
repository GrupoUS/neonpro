// Migrated from src/services/notification.ts
import { supabase } from "@/lib/supabase";

export interface NotificationTemplate {
  id?: string;
  tenant_id: string;
  name: string;
  type: "email" | "sms" | "push" | "in_app";
  category: "appointment" | "treatment" | "payment" | "compliance" | "marketing" | "system";
  subject?: string;
  content: string;
  variables?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id?: string;
  tenant_id: string;
  recipient_id: string;
  recipient_type: "patient" | "professional" | "admin";
  type: "email" | "sms" | "push" | "in_app";
  category: "appointment" | "treatment" | "payment" | "compliance" | "marketing" | "system";
  title: string;
  content: string;
  status: "pending" | "sent" | "delivered" | "failed" | "read";
  scheduled_for?: string;
  sent_at?: string;
  read_at?: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface NotificationPreferences {
  id?: string;
  user_id: string;
  tenant_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  appointment_reminders: boolean;
  treatment_updates: boolean;
  payment_notifications: boolean;
  marketing_communications: boolean;
  system_notifications: boolean;
  updated_at?: string;
}

export class NotificationService {
  async sendNotification(
    notification: Omit<Notification, "id" | "created_at" | "sent_at">,
  ): Promise<{ notification?: Notification; error?: string }> {
    try {
      // Check user preferences first
      const preferences = await this.getUserPreferences(
        notification.tenant_id,
        notification.recipient_id,
      );

      if (!this.shouldSendNotification(notification, preferences.preferences)) {
        return { error: "Notification blocked by user preferences" };
      }

      // Create notification record
      const { data, error } = await supabase
        .from("notifications")
        .insert({
          ...notification,
          status: notification.scheduled_for ? "pending" : "sent",
          sent_at: notification.scheduled_for ? null : new Date().toISOString(),
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      // Send immediately if not scheduled
      if (!notification.scheduled_for) {
        await this.deliverNotification(data);
      }

      return { notification: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to send notification",
      };
    }
  }

  async sendAppointmentReminder(
    tenantId: string,
    appointmentId: string,
    patientId: string,
    appointmentDate: string,
    professionalName: string,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const template = await this.getTemplate(tenantId, "appointment", "appointment_reminder");

      if (!template.template) {
        return { error: "Appointment reminder template not found" };
      }

      const content = this.replaceVariables(template.template.content, {
        appointment_date: new Date(appointmentDate).toLocaleString("pt-BR"),
        professional_name: professionalName,
        appointment_id: appointmentId,
      });

      const notification: Omit<Notification, "id" | "created_at" | "sent_at"> = {
        tenant_id: tenantId,
        recipient_id: patientId,
        recipient_type: "patient",
        type: "email",
        category: "appointment",
        title: template.template.subject || "Lembrete de Consulta",
        content,
        status: "pending",
        metadata: {
          appointment_id: appointmentId,
          template_id: template.template.id,
        },
      };

      return this.sendNotification(notification);
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to send appointment reminder",
      };
    }
  }

  async sendTreatmentUpdate(
    tenantId: string,
    patientId: string,
    treatmentName: string,
    updateContent: string,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const notification: Omit<Notification, "id" | "created_at" | "sent_at"> = {
        tenant_id: tenantId,
        recipient_id: patientId,
        recipient_type: "patient",
        type: "in_app",
        category: "treatment",
        title: `Atualização do Tratamento: ${treatmentName}`,
        content: updateContent,
        status: "pending",
        metadata: {
          treatment_name: treatmentName,
        },
      };

      const result = await this.sendNotification(notification);
      return { success: !!result.notification };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to send treatment update",
      };
    }
  }

  async sendPaymentNotification(
    tenantId: string,
    patientId: string,
    amount: number,
    dueDate: string,
    description: string,
  ): Promise<{ success?: boolean; error?: string }> {
    try {
      const notification: Omit<Notification, "id" | "created_at" | "sent_at"> = {
        tenant_id: tenantId,
        recipient_id: patientId,
        recipient_type: "patient",
        type: "email",
        category: "payment",
        title: "Cobrança Pendente",
        content: `Você possui uma cobrança pendente de R$ ${amount.toFixed(2)} com vencimento em ${new Date(dueDate).toLocaleDateString("pt-BR")}. Descrição: ${description}`,
        status: "pending",
        metadata: {
          amount,
          due_date: dueDate,
          description,
        },
      };

      const result = await this.sendNotification(notification);
      return { success: !!result.notification };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to send payment notification",
      };
    }
  }

  async getNotifications(
    tenantId: string,
    recipientId?: string,
    filters?: {
      type?: Notification["type"];
      category?: Notification["category"];
      status?: Notification["status"];
      startDate?: string;
      endDate?: string;
      limit?: number;
    },
  ): Promise<{ notifications?: Notification[]; error?: string }> {
    try {
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

      if (recipientId) {
        query = query.eq("recipient_id", recipientId);
      }

      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        return { error: error.message };
      }

      return { notifications: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get notifications",
      };
    }
  }

  async markAsRead(id: string, tenantId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to mark notification as read",
      };
    }
  }

  async createTemplate(
    template: Omit<NotificationTemplate, "id" | "created_at" | "updated_at">,
  ): Promise<{ template?: NotificationTemplate; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .insert({
          ...template,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { template: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to create template",
      };
    }
  }

  async getTemplate(
    tenantId: string,
    category: NotificationTemplate["category"],
    name: string,
  ): Promise<{ template?: NotificationTemplate; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("category", category)
        .eq("name", name)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return { error: "Template not found" };
        }
        return { error: error.message };
      }

      return { template: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get template",
      };
    }
  }

  async getUserPreferences(
    tenantId: string,
    userId: string,
  ): Promise<{ preferences?: NotificationPreferences; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Create default preferences if not found
          const defaultPreferences: Omit<NotificationPreferences, "id" | "updated_at"> = {
            user_id: userId,
            tenant_id: tenantId,
            email_enabled: true,
            sms_enabled: true,
            push_enabled: true,
            appointment_reminders: true,
            treatment_updates: true,
            payment_notifications: true,
            marketing_communications: false,
            system_notifications: true,
          };

          const { data: newData, error: createError } = await supabase
            .from("notification_preferences")
            .insert({
              ...defaultPreferences,
              updated_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (createError) {
            return { error: createError.message };
          }

          return { preferences: newData };
        }
        return { error: error.message };
      }

      return { preferences: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to get user preferences",
      };
    }
  }

  async updateUserPreferences(
    tenantId: string,
    userId: string,
    updates: Partial<NotificationPreferences>,
  ): Promise<{ preferences?: NotificationPreferences; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("tenant_id", tenantId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { preferences: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to update user preferences",
      };
    }
  }

  private shouldSendNotification(
    notification: Omit<Notification, "id" | "created_at" | "sent_at">,
    preferences?: NotificationPreferences,
  ): boolean {
    if (!preferences) return true;

    // Check type preferences
    if (notification.type === "email" && !preferences.email_enabled) return false;
    if (notification.type === "sms" && !preferences.sms_enabled) return false;
    if (notification.type === "push" && !preferences.push_enabled) return false;

    // Check category preferences
    if (notification.category === "appointment" && !preferences.appointment_reminders) return false;
    if (notification.category === "treatment" && !preferences.treatment_updates) return false;
    if (notification.category === "payment" && !preferences.payment_notifications) return false;
    if (notification.category === "marketing" && !preferences.marketing_communications)
      return false;
    if (notification.category === "system" && !preferences.system_notifications) return false;

    return true;
  }

  private replaceVariables(content: string, variables: Record<string, string>): string {
    let result = content;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      result = result.replace(regex, value);
    });
    return result;
  }

  private async deliverNotification(notification: Notification): Promise<void> {
    // Implementation for actually delivering the notification
    // This would integrate with email, SMS, and push notification services
    console.log("Delivering notification:", notification);

    try {
      switch (notification.type) {
        case "email":
          await this.sendEmail(notification);
          break;
        case "sms":
          await this.sendSMS(notification);
          break;
        case "push":
          await this.sendPushNotification(notification);
          break;
        case "in_app":
          // In-app notifications are just stored in the database
          break;
      }

      // Update status to delivered
      await supabase
        .from("notifications")
        .update({ status: "delivered" })
        .eq("id", notification.id);
    } catch (error) {
      // Update status to failed
      await supabase.from("notifications").update({ status: "failed" }).eq("id", notification.id);

      console.error("Failed to deliver notification:", error);
    }
  }

  private async sendEmail(notification: Notification): Promise<void> {
    // Email implementation would go here
    console.log("Sending email notification:", notification.title);
  }

  private async sendSMS(notification: Notification): Promise<void> {
    // SMS implementation would go here
    console.log("Sending SMS notification:", notification.title);
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    // Push notification implementation would go here
    console.log("Sending push notification:", notification.title);
  }
}

export const notificationService = new NotificationService();
