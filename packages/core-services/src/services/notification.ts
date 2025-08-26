// ================================================
// NOTIFICATION SERVICE
// Centralized notification management microservice
// ================================================

import { createClient } from "@supabase/supabase-js";
import { config } from "./configuration";
import { monitoring } from "./monitoring";

// ================================================
// TYPES AND INTERFACES
// ================================================

interface Notification {
  id: string;
  tenantId: string;
  recipientId: string;
  recipientType: RecipientType;
  type: NotificationType;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  content: string;
  data: Record<string, any>;
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  expiresAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

interface NotificationTemplate {
  id: string;
  tenantId: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationPreference {
  id: string;
  userId: string;
  tenantId: string;
  channel: NotificationChannel;
  type: NotificationType;
  enabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationRule {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  trigger: NotificationTrigger;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  isActive: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface NotificationTrigger {
  event: string;
  entity: string;
  conditions?: Record<string, any>;
}

interface NotificationCondition {
  field: string;
  operator: ConditionOperator;
  value: any;
  logicalOperator?: LogicalOperator;
}

interface NotificationAction {
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  recipients: NotificationRecipient[];
  delay?: number;
  priority: NotificationPriority;
}

interface NotificationRecipient {
  type: RecipientType;
  id?: string;
  contact?: string;
  role?: string;
}

interface NotificationBatch {
  id: string;
  tenantId: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  templateId?: string;
  recipients: string[];
  status: BatchStatus;
  totalCount: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  byChannel: Record<NotificationChannel, ChannelStats>;
  byType: Record<NotificationType, TypeStats>;
  byPriority: Record<NotificationPriority, PriorityStats>;
  trends: NotificationTrends;
}

interface ChannelStats {
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  deliveryRate: number;
  readRate: number;
}

interface TypeStats {
  sent: number;
  delivered: number;
  failed: number;
  read: number;
  deliveryRate: number;
  readRate: number;
}

interface PriorityStats {
  sent: number;
  delivered: number;
  failed: number;
  avgDeliveryTime: number;
}

interface NotificationTrends {
  daily: Record<string, number>;
  weekly: Record<string, number>;
  monthly: Record<string, number>;
}

// ================================================
// ENUMS
// ================================================

enum NotificationType {
  APPOINTMENT_REMINDER = "appointment_reminder",
  APPOINTMENT_CONFIRMATION = "appointment_confirmation",
  APPOINTMENT_CANCELLATION = "appointment_cancellation",
  APPOINTMENT_RESCHEDULED = "appointment_rescheduled",
  TREATMENT_COMPLETED = "treatment_completed",
  PAYMENT_DUE = "payment_due",
  PAYMENT_RECEIVED = "payment_received",
  PAYMENT_OVERDUE = "payment_overdue",
  INVOICE_SENT = "invoice_sent",
  MARKETING_CAMPAIGN = "marketing_campaign",
  HEALTH_TIP = "health_tip",
  BIRTHDAY_WISH = "birthday_wish",
  SYSTEM_ALERT = "system_alert",
  SECURITY_ALERT = "security_alert",
  COMPLIANCE_ALERT = "compliance_alert",
  CUSTOM = "custom",
}

enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  WHATSAPP = "whatsapp",
  PUSH = "push",
  IN_APP = "in_app",
  WEBHOOK = "webhook",
}

enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
}

enum NotificationStatus {
  PENDING = "pending",
  SCHEDULED = "scheduled",
  SENDING = "sending",
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

enum RecipientType {
  USER = "user",
  PATIENT = "patient",
  STAFF = "staff",
  ADMIN = "admin",
  ROLE = "role",
  EMAIL = "email",
  PHONE = "phone",
}

enum BatchStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

enum ConditionOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  IN = "in",
  NOT_IN = "not_in",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

enum LogicalOperator {
  AND = "and",
  OR = "or",
}

// ================================================
// REQUEST/RESPONSE TYPES
// ================================================

interface SendNotificationRequest {
  tenantId: string;
  recipientId: string;
  recipientType: RecipientType;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  content: string;
  data?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface SendBulkNotificationRequest {
  tenantId: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  content: string;
  recipients: NotificationRecipient[];
  data?: Record<string, any>;
  scheduledAt?: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

interface CreateTemplateRequest {
  tenantId: string;
  name: string;
  type: NotificationType;
  channel: NotificationChannel;
  subject: string;
  content: string;
  variables: string[];
  metadata?: Record<string, any>;
}

interface NotificationFilters {
  tenantId?: string;
  recipientId?: string;
  recipientType?: RecipientType;
  type?: NotificationType;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  status?: NotificationStatus;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ================================================
// NOTIFICATION SERVICE
// ================================================

export class NotificationService {
  private static instance: NotificationService;
  private readonly supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  private maxRetries = 3;
  private readonly retryDelays = [1000, 5000, 15_000]; // 1s, 5s, 15s

  private constructor() {
    this.initializeConfiguration();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ================================================
  // NOTIFICATION SENDING
  // ================================================

  async sendNotification(
    request: SendNotificationRequest,
    userId?: string,
  ): Promise<Notification> {
    try {
      monitoring.info("Sending notification", "notification-service", {
        tenantId: request.tenantId,
        type: request.type,
        channel: request.channel,
        recipientId: request.recipientId,
      });

      // Validate tenant access if user provided
      if (userId) {
        await this.validateTenantAccess(userId, request.tenantId);
      }

      // Check notification preferences
      const canSend = await this.checkNotificationPreferences(
        request.recipientId,
        request.type,
        request.channel,
      );

      if (!canSend) {
        monitoring.info(
          "Notification blocked by user preferences",
          "notification-service",
          {
            recipientId: request.recipientId,
            type: request.type,
            channel: request.channel,
          },
        );
        throw new Error("Notification blocked by user preferences");
      }

      // Create notification record
      const notificationData = {
        tenant_id: request.tenantId,
        recipient_id: request.recipientId,
        recipient_type: request.recipientType,
        type: request.type,
        channel: request.channel,
        priority: request.priority || NotificationPriority.NORMAL,
        title: request.title,
        content: request.content,
        data: request.data || {},
        status: request.scheduledAt
          ? NotificationStatus.SCHEDULED
          : NotificationStatus.PENDING,
        scheduled_at: request.scheduledAt?.toISOString(),
        expires_at: request.expiresAt?.toISOString(),
        retry_count: 0,
        max_retries: this.maxRetries,
        metadata: request.metadata || {},
        created_by: userId,
      };

      const { data, error } = await this.supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single();

      if (error) {
        monitoring.error(
          "Notification creation failed",
          "notification-service",
          new Error(error.message),
          {
            tenantId: request.tenantId,
          },
        );
        throw new Error(error.message);
      }

      const notification = this.mapNotificationFromDb(data);

      // Send immediately if not scheduled
      if (!request.scheduledAt) {
        await this.processNotification(notification.id);
      }

      monitoring.info(
        "Notification created successfully",
        "notification-service",
        {
          notificationId: notification.id,
          tenantId: notification.tenantId,
        },
      );

      return notification;
    } catch (error) {
      monitoring.error(
        "Send notification error",
        "notification-service",
        error as Error,
        {
          tenantId: request.tenantId,
          type: request.type,
        },
      );
      throw error;
    }
  }

  async sendBulkNotification(
    request: SendBulkNotificationRequest,
    userId: string,
  ): Promise<NotificationBatch> {
    try {
      monitoring.info("Sending bulk notification", "notification-service", {
        tenantId: request.tenantId,
        type: request.type,
        recipientCount: request.recipients.length,
      });

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      // Create batch record
      const batchData = {
        tenant_id: request.tenantId,
        name: `${request.type}_${Date.now()}`,
        type: request.type,
        channel: request.channel,
        recipients: request.recipients.map((r) => r.id || r.contact || ""),
        status: BatchStatus.PENDING,
        total_count: request.recipients.length,
        sent_count: 0,
        failed_count: 0,
        scheduled_at: request.scheduledAt?.toISOString(),
        metadata: request.metadata || {},
        created_by: userId,
      };

      const { data: batchRecord, error: batchError } = await this.supabase
        .from("notification_batches")
        .insert(batchData)
        .select()
        .single();

      if (batchError) {
        throw new Error(batchError.message);
      }

      // Create individual notifications
      const notifications = request.recipients.map((recipient) => ({
        tenant_id: request.tenantId,
        recipient_id: recipient.id || "",
        recipient_type: recipient.type,
        type: request.type,
        channel: request.channel,
        priority: request.priority || NotificationPriority.NORMAL,
        title: request.title,
        content: request.content,
        data: { ...request.data, batchId: batchRecord.id },
        status: request.scheduledAt
          ? NotificationStatus.SCHEDULED
          : NotificationStatus.PENDING,
        scheduled_at: request.scheduledAt?.toISOString(),
        expires_at: request.expiresAt?.toISOString(),
        retry_count: 0,
        max_retries: this.maxRetries,
        metadata: { ...request.metadata, batchId: batchRecord.id },
        created_by: userId,
      }));

      const { error: notificationsError } = await this.supabase
        .from("notifications")
        .insert(notifications);

      if (notificationsError) {
        throw new Error(notificationsError.message);
      }

      const batch = this.mapBatchFromDb(batchRecord);

      // Process batch if not scheduled
      if (!request.scheduledAt) {
        await this.processBatch(batch.id);
      }

      monitoring.info(
        "Bulk notification created successfully",
        "notification-service",
        {
          batchId: batch.id,
          tenantId: batch.tenantId,
          recipientCount: batch.totalCount,
        },
      );

      return batch;
    } catch (error) {
      monitoring.error(
        "Send bulk notification error",
        "notification-service",
        error as Error,
        {
          tenantId: request.tenantId,
          type: request.type,
        },
      );
      throw error;
    }
  }

  async sendTemplatedNotification(
    templateId: string,
    recipientId: string,
    recipientType: RecipientType,
    variables: Record<string, any>,
    userId: string,
    priority?: NotificationPriority,
    scheduledAt?: Date,
  ): Promise<Notification> {
    try {
      // Get template
      const template = await this.getTemplate(templateId, userId);
      if (!template?.isActive) {
        throw new Error("Template not found or inactive");
      }

      // Process template variables
      const processedContent = this.processTemplateVariables(
        template.content,
        variables,
      );
      const processedSubject = this.processTemplateVariables(
        template.subject,
        variables,
      );

      // Send notification
      return this.sendNotification(
        {
          tenantId: template.tenantId,
          recipientId,
          recipientType,
          type: template.type,
          channel: template.channel,
          priority,
          title: processedSubject,
          content: processedContent,
          data: { templateId, variables },
          scheduledAt,
          metadata: { templateId },
        },
        userId,
      );
    } catch (error) {
      monitoring.error(
        "Send templated notification error",
        "notification-service",
        error as Error,
        {
          templateId,
          recipientId,
        },
      );
      throw error;
    }
  }

  // ================================================
  // NOTIFICATION PROCESSING
  // ================================================

  async processNotification(notificationId: string): Promise<boolean> {
    try {
      monitoring.debug("Processing notification", "notification-service", {
        notificationId,
      });

      // Get notification
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error || !data) {
        throw new Error("Notification not found");
      }

      const notification = this.mapNotificationFromDb(data);

      // Check if notification is valid for sending
      if (
        notification.status !== NotificationStatus.PENDING &&
        notification.status !== NotificationStatus.SCHEDULED
      ) {
        return false;
      }

      if (notification.expiresAt && notification.expiresAt < new Date()) {
        await this.updateNotificationStatus(
          notificationId,
          NotificationStatus.EXPIRED,
        );
        return false;
      }

      // Update status to sending
      await this.updateNotificationStatus(
        notificationId,
        NotificationStatus.SENDING,
      );

      try {
        // Send notification based on channel
        const success = await this.sendByChannel(notification);

        if (success) {
          await this.updateNotificationStatus(
            notificationId,
            NotificationStatus.SENT,
            new Date(),
          );
          monitoring.info(
            "Notification sent successfully",
            "notification-service",
            {
              notificationId,
            },
          );
          return true;
        }
        await this.handleNotificationFailure(
          notificationId,
          "Channel delivery failed",
        );
        return false;
      } catch (error) {
        await this.handleNotificationFailure(
          notificationId,
          (error as Error).message,
        );
        return false;
      }
    } catch (error) {
      monitoring.error(
        "Process notification error",
        "notification-service",
        error as Error,
        {
          notificationId,
        },
      );
      return false;
    }
  }

  async processBatch(batchId: string): Promise<void> {
    try {
      monitoring.info("Processing notification batch", "notification-service", {
        batchId,
      });

      // Update batch status
      await this.supabase
        .from("notification_batches")
        .update({
          status: BatchStatus.PROCESSING,
          started_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      // Get batch notifications
      const { data: notifications, error } = await this.supabase
        .from("notifications")
        .select("id")
        .eq("data->>batchId", batchId)
        .eq("status", NotificationStatus.PENDING);

      if (error) {
        throw new Error(error.message);
      }

      let sentCount = 0;
      let failedCount = 0;

      // Process notifications in batches
      const batchSize = 10;
      for (let i = 0; i < notifications.length; i += batchSize) {
        const batch = notifications.slice(i, i + batchSize);

        const promises = batch.map(async (notification) => {
          const success = await this.processNotification(notification.id);
          return success ? "sent" : "failed";
        });

        const results = await Promise.all(promises);
        sentCount += results.filter((r) => r === "sent").length;
        failedCount += results.filter((r) => r === "failed").length;

        // Update batch progress
        await this.supabase
          .from("notification_batches")
          .update({
            sent_count: sentCount,
            failed_count: failedCount,
          })
          .eq("id", batchId);
      }

      // Complete batch
      await this.supabase
        .from("notification_batches")
        .update({
          status: BatchStatus.COMPLETED,
          completed_at: new Date().toISOString(),
        })
        .eq("id", batchId);

      monitoring.info("Notification batch completed", "notification-service", {
        batchId,
        sentCount,
        failedCount,
      });
    } catch (error) {
      monitoring.error(
        "Process batch error",
        "notification-service",
        error as Error,
        { batchId },
      );

      // Mark batch as failed
      await this.supabase
        .from("notification_batches")
        .update({
          status: BatchStatus.FAILED,
          completed_at: new Date().toISOString(),
        })
        .eq("id", batchId);
    }
  }

  // ================================================
  // NOTIFICATION RETRIEVAL
  // ================================================

  async getNotification(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null> {
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("id", notificationId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapNotificationFromDb(data);
    } catch (error) {
      monitoring.error(
        "Get notification error",
        "notification-service",
        error as Error,
        {
          notificationId,
        },
      );
      return;
    }
  }

  async searchNotifications(
    filters: NotificationFilters,
    userId: string,
  ): Promise<{ notifications: Notification[]; total: number }> {
    try {
      monitoring.debug("Searching notifications", "notification-service", {
        filters,
      });

      // Validate tenant access if specified
      if (filters.tenantId) {
        await this.validateTenantAccess(userId, filters.tenantId);
      }

      let query = this.supabase
        .from("notifications")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.tenantId) {
        query = query.eq("tenant_id", filters.tenantId);
      }

      if (filters.recipientId) {
        query = query.eq("recipient_id", filters.recipientId);
      }

      if (filters.recipientType) {
        query = query.eq("recipient_type", filters.recipientType);
      }

      if (filters.type) {
        query = query.eq("type", filters.type);
      }

      if (filters.channel) {
        query = query.eq("channel", filters.channel);
      }

      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom.toISOString());
      }

      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo.toISOString());
      }

      // Apply sorting
      const sortBy = filters.sortBy || "created_at";
      const sortOrder = filters.sortOrder || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const limit = Math.min(filters.limit || 50, 100);
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(error.message);
      }

      const notifications = data.map(this.mapNotificationFromDb);

      return { notifications, total: count || 0 };
    } catch (error) {
      monitoring.error(
        "Search notifications error",
        "notification-service",
        error as Error,
        {
          filters,
        },
      );
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("notifications")
        .update({
          status: NotificationStatus.READ,
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("recipient_id", userId);

      return !error;
    } catch (error) {
      monitoring.error(
        "Mark as read error",
        "notification-service",
        error as Error,
        {
          notificationId,
          userId,
        },
      );
      return false;
    }
  }

  // ================================================
  // TEMPLATE MANAGEMENT
  // ================================================

  async createTemplate(
    request: CreateTemplateRequest,
    userId: string,
  ): Promise<NotificationTemplate> {
    try {
      monitoring.info(
        "Creating notification template",
        "notification-service",
        {
          tenantId: request.tenantId,
          name: request.name,
          type: request.type,
        },
      );

      // Validate tenant access
      await this.validateTenantAccess(userId, request.tenantId);

      const templateData = {
        tenant_id: request.tenantId,
        name: request.name,
        type: request.type,
        channel: request.channel,
        subject: request.subject,
        content: request.content,
        variables: request.variables,
        is_active: true,
        metadata: request.metadata || {},
      };

      const { data, error } = await this.supabase
        .from("notification_templates")
        .insert(templateData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const template = this.mapTemplateFromDb(data);

      monitoring.info("Template created successfully", "notification-service", {
        templateId: template.id,
        name: template.name,
      });

      return template;
    } catch (error) {
      monitoring.error(
        "Create template error",
        "notification-service",
        error as Error,
        {
          tenantId: request.tenantId,
          name: request.name,
        },
      );
      throw error;
    }
  }

  async getTemplate(
    templateId: string,
    userId: string,
  ): Promise<NotificationTemplate | null> {
    try {
      const { data, error } = await this.supabase
        .from("notification_templates")
        .select("*")
        .eq("id", templateId)
        .single();

      if (error || !data) {
        return;
      }

      // Validate tenant access
      await this.validateTenantAccess(userId, data.tenant_id);

      return this.mapTemplateFromDb(data);
    } catch (error) {
      monitoring.error(
        "Get template error",
        "notification-service",
        error as Error,
        {
          templateId,
        },
      );
      return;
    }
  }

  // ================================================
  // ANALYTICS AND REPORTING
  // ================================================

  async getNotificationAnalytics(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    userId: string,
  ): Promise<NotificationAnalytics> {
    try {
      monitoring.debug(
        "Getting notification analytics",
        "notification-service",
        {
          tenantId,
          periodStart,
          periodEnd,
        },
      );

      // Validate tenant access
      await this.validateTenantAccess(userId, tenantId);

      // Get notification counts
      const { data: notifications, error } = await this.supabase
        .from("notifications")
        .select("channel, type, priority, status, created_at, sent_at, read_at")
        .eq("tenant_id", tenantId)
        .gte("created_at", periodStart.toISOString())
        .lte("created_at", periodEnd.toISOString());

      if (error) {
        throw new Error(error.message);
      }

      // Calculate analytics
      const totalSent = notifications.filter((n) => n.sent_at).length;
      const totalDelivered = notifications.filter(
        (n) =>
          n.status === NotificationStatus.DELIVERED ||
          n.status === NotificationStatus.READ,
      ).length;
      const totalFailed = notifications.filter(
        (n) => n.status === NotificationStatus.FAILED,
      ).length;
      const totalRead = notifications.filter((n) => n.read_at).length;

      const deliveryRate = totalSent > 0 ? totalDelivered / totalSent : 0;
      const readRate = totalDelivered > 0 ? totalRead / totalDelivered : 0;

      // Group by channel
      const byChannel: Record<NotificationChannel, ChannelStats> = {} as any;
      Object.values(NotificationChannel).forEach((channel) => {
        const channelNotifications = notifications.filter(
          (n) => n.channel === channel,
        );
        const channelSent = channelNotifications.filter(
          (n) => n.sent_at,
        ).length;
        const channelDelivered = channelNotifications.filter(
          (n) =>
            n.status === NotificationStatus.DELIVERED ||
            n.status === NotificationStatus.READ,
        ).length;
        const channelFailed = channelNotifications.filter(
          (n) => n.status === NotificationStatus.FAILED,
        ).length;
        const channelRead = channelNotifications.filter(
          (n) => n.read_at,
        ).length;

        byChannel[channel] = {
          sent: channelSent,
          delivered: channelDelivered,
          failed: channelFailed,
          read: channelRead,
          deliveryRate: channelSent > 0 ? channelDelivered / channelSent : 0,
          readRate: channelDelivered > 0 ? channelRead / channelDelivered : 0,
        };
      });

      // Group by type
      const byType: Record<NotificationType, TypeStats> = {} as any;
      Object.values(NotificationType).forEach((type) => {
        const typeNotifications = notifications.filter((n) => n.type === type);
        const typeSent = typeNotifications.filter((n) => n.sent_at).length;
        const typeDelivered = typeNotifications.filter(
          (n) =>
            n.status === NotificationStatus.DELIVERED ||
            n.status === NotificationStatus.READ,
        ).length;
        const typeFailed = typeNotifications.filter(
          (n) => n.status === NotificationStatus.FAILED,
        ).length;
        const typeRead = typeNotifications.filter((n) => n.read_at).length;

        byType[type] = {
          sent: typeSent,
          delivered: typeDelivered,
          failed: typeFailed,
          read: typeRead,
          deliveryRate: typeSent > 0 ? typeDelivered / typeSent : 0,
          readRate: typeDelivered > 0 ? typeRead / typeDelivered : 0,
        };
      });

      // Group by priority
      const byPriority: Record<NotificationPriority, PriorityStats> = {} as any;
      Object.values(NotificationPriority).forEach((priority) => {
        const priorityNotifications = notifications.filter(
          (n) => n.priority === priority,
        );
        const prioritySent = priorityNotifications.filter(
          (n) => n.sent_at,
        ).length;
        const priorityDelivered = priorityNotifications.filter(
          (n) =>
            n.status === NotificationStatus.DELIVERED ||
            n.status === NotificationStatus.READ,
        ).length;
        const priorityFailed = priorityNotifications.filter(
          (n) => n.status === NotificationStatus.FAILED,
        ).length;

        // Calculate average delivery time
        const deliveredNotifications = priorityNotifications.filter(
          (n) =>
            n.sent_at &&
            (n.status === NotificationStatus.DELIVERED ||
              n.status === NotificationStatus.READ),
        );
        const avgDeliveryTime =
          deliveredNotifications.length > 0
            ? deliveredNotifications.reduce((sum, n) => {
                const sentTime = new Date(n.sent_at!).getTime();
                const deliveredTime = new Date(
                  n.read_at || n.sent_at!,
                ).getTime();
                return sum + (deliveredTime - sentTime);
              }, 0) /
              deliveredNotifications.length /
              1000 // Convert to seconds
            : 0;

        byPriority[priority] = {
          sent: prioritySent,
          delivered: priorityDelivered,
          failed: priorityFailed,
          avgDeliveryTime,
        };
      });

      // Calculate trends (simplified)
      const trends: NotificationTrends = {
        daily: {},
        weekly: {},
        monthly: {},
      };

      return {
        totalSent: notifications.length,
        totalDelivered,
        totalFailed,
        totalRead,
        deliveryRate,
        readRate,
        byChannel,
        byType,
        byPriority,
        trends,
      };
    } catch (error) {
      monitoring.error(
        "Get notification analytics error",
        "notification-service",
        error as Error,
        {
          tenantId,
          periodStart,
          periodEnd,
        },
      );
      throw error;
    }
  }

  // ================================================
  // PRIVATE HELPER METHODS
  // ================================================

  private async initializeConfiguration(): Promise<void> {
    this.maxRetries = await config.getConfiguration(
      "notifications.max_retries",
      { environment: process.env.NODE_ENV || "development" },
      3,
    );
  }

  private async validateTenantAccess(
    _userId: string,
    _tenantId: string,
  ): Promise<void> {
    // Implementation would validate user has access to tenant
    // For now, we'll assume the auth service handles this
  }

  private async checkNotificationPreferences(
    recipientId: string,
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .select("enabled, quiet_hours_start, quiet_hours_end, timezone")
        .eq("user_id", recipientId)
        .eq("type", type)
        .eq("channel", channel)
        .single();

      if (error || !data) {
        return true; // Default to allow if no preferences found
      }

      if (!data.enabled) {
        return false;
      }

      // Check quiet hours
      if (data.quiet_hours_start && data.quiet_hours_end) {
        const now = new Date();
        const currentTime = now.toLocaleTimeString("en-US", {
          hour12: false,
          timeZone: data.timezone || "America/Sao_Paulo",
        });

        if (
          currentTime >= data.quiet_hours_start &&
          currentTime <= data.quiet_hours_end
        ) {
          return false;
        }
      }

      return true;
    } catch (error) {
      monitoring.error(
        "Check notification preferences error",
        "notification-service",
        error as Error,
        {
          recipientId,
          type,
          channel,
        },
      );
      return true; // Default to allow on error
    }
  }

  private async sendByChannel(notification: Notification): Promise<boolean> {
    try {
      switch (notification.channel) {
        case NotificationChannel.EMAIL: {
          return this.sendEmail(notification);
        }
        case NotificationChannel.SMS: {
          return this.sendSMS(notification);
        }
        case NotificationChannel.WHATSAPP: {
          return this.sendWhatsApp(notification);
        }
        case NotificationChannel.PUSH: {
          return this.sendPush(notification);
        }
        case NotificationChannel.IN_APP: {
          return this.sendInApp(notification);
        }
        case NotificationChannel.WEBHOOK: {
          return this.sendWebhook(notification);
        }
        default: {
          throw new Error(`Unsupported channel: ${notification.channel}`);
        }
      }
    } catch (error) {
      monitoring.error(
        "Send by channel error",
        "notification-service",
        error as Error,
        {
          notificationId: notification.id,
          channel: notification.channel,
        },
      );
      return false;
    }
  }

  private async sendEmail(notification: Notification): Promise<boolean> {
    // Implementation would integrate with email service (AWS SES, SendGrid, etc.)
    monitoring.info("Email sent (mock)", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async sendSMS(notification: Notification): Promise<boolean> {
    // Implementation would integrate with SMS service (Twilio, AWS SNS, etc.)
    monitoring.info("SMS sent (mock)", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async sendWhatsApp(notification: Notification): Promise<boolean> {
    // Implementation would integrate with WhatsApp Business API
    monitoring.info("WhatsApp sent (mock)", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async sendPush(notification: Notification): Promise<boolean> {
    // Implementation would integrate with push notification service (Firebase, etc.)
    monitoring.info("Push notification sent (mock)", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async sendInApp(notification: Notification): Promise<boolean> {
    // In-app notifications are typically just stored in database
    monitoring.info("In-app notification created", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async sendWebhook(notification: Notification): Promise<boolean> {
    // Implementation would send HTTP request to webhook URL
    monitoring.info("Webhook sent (mock)", "notification-service", {
      notificationId: notification.id,
      recipientId: notification.recipientId,
    });
    return true;
  }

  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    sentAt?: Date,
  ): Promise<void> {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (sentAt) {
      updateData.sent_at = sentAt.toISOString();
    }

    await this.supabase
      .from("notifications")
      .update(updateData)
      .eq("id", notificationId);
  }

  private async handleNotificationFailure(
    notificationId: string,
    errorMessage: string,
  ): Promise<void> {
    // Get current notification
    const { data } = await this.supabase
      .from("notifications")
      .select("retry_count, max_retries")
      .eq("id", notificationId)
      .single();

    if (data && data.retry_count < data.max_retries) {
      // Schedule retry
      const retryCount = data.retry_count + 1;
      const retryDelay =
        this.retryDelays[Math.min(retryCount - 1, this.retryDelays.length - 1)];
      const scheduledAt = new Date(Date.now() + retryDelay);

      await this.supabase
        .from("notifications")
        .update({
          status: NotificationStatus.SCHEDULED,
          retry_count: retryCount,
          scheduled_at: scheduledAt.toISOString(),
          error_message: errorMessage,
        })
        .eq("id", notificationId);

      monitoring.info(
        "Notification scheduled for retry",
        "notification-service",
        {
          notificationId,
          retryCount,
          scheduledAt,
        },
      );
    } else {
      // Mark as failed
      await this.supabase
        .from("notifications")
        .update({
          status: NotificationStatus.FAILED,
          error_message: errorMessage,
        })
        .eq("id", notificationId);

      monitoring.warn(
        "Notification failed after max retries",
        "notification-service",
        {
          notificationId,
          errorMessage,
        },
      );
    }
  }

  private processTemplateVariables(
    template: string,
    variables: Record<string, any>,
  ): string {
    let processed = template;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      processed = processed.replaceAll(
        new RegExp(placeholder, "g"),
        String(value),
      );
    });

    return processed;
  }

  private mapNotificationFromDb(data: any): Notification {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      recipientId: data.recipient_id,
      recipientType: data.recipient_type,
      type: data.type,
      channel: data.channel,
      priority: data.priority,
      title: data.title,
      content: data.content,
      data: data.data || {},
      status: data.status,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
      readAt: data.read_at ? new Date(data.read_at) : undefined,
      expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
      retryCount: data.retry_count,
      maxRetries: data.max_retries,
      errorMessage: data.error_message,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }

  private mapTemplateFromDb(data: any): NotificationTemplate {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      type: data.type,
      channel: data.channel,
      subject: data.subject,
      content: data.content,
      variables: data.variables || [],
      isActive: data.is_active,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private mapBatchFromDb(data: any): NotificationBatch {
    return {
      id: data.id,
      tenantId: data.tenant_id,
      name: data.name,
      type: data.type,
      channel: data.channel,
      templateId: data.template_id,
      recipients: data.recipients || [],
      status: data.status,
      totalCount: data.total_count,
      sentCount: data.sent_count,
      failedCount: data.failed_count,
      scheduledAt: data.scheduled_at ? new Date(data.scheduled_at) : undefined,
      startedAt: data.started_at ? new Date(data.started_at) : undefined,
      completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
      metadata: data.metadata || {},
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      createdBy: data.created_by,
    };
  }
}

// ================================================
// NOTIFICATION SERVICE INSTANCE
// ================================================

export const notificationService = NotificationService.getInstance();
