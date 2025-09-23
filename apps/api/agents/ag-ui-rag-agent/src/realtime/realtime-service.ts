import { RealtimeChannel, RealtimeClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { ConversationService } from "../conversation/conversation-service";
import { HealthcareLogger } from "../logging/healthcare-logger";
import { SessionManager } from "../session/session-manager";

export interface RealtimeSubscription {
  id: string;
  channel: RealtimeChannel;
  type: "conversations" | "messages" | "sessions" | "system";
  filters?: any;
  callback: (_payload: any) => void;
}

export interface RealtimeEvent {
  type: "insert" | "update" | "delete";
  table: string;
  schema: string;
  old_record?: any;
  new_record?: any;
  errors?: any[];
}

export interface RealtimeMessage {
  conversationId?: string;
  sessionId?: string;
  _userId?: string;
  clinicId?: string;
  patientId?: string;
  type:
    | "message"
    | "conversation_update"
    | "session_update"
    | "system_notification";
  event: RealtimeEvent;
  _payload: any;
  timestamp: Date;
}

export class RealtimeService {
  private supabase: SupabaseClient;
  private logger: HealthcareLogger;
  private sessionManager: SessionManager;
  private conversationService: ConversationService;
  private realtimeClient: RealtimeClient;
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private messageHandlers: Map<string, (message: RealtimeMessage) => void> =
    new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(
    supabase: SupabaseClient,
    logger: HealthcareLogger,
    sessionManager: SessionManager,
    conversationService: ConversationService,
  ) {
    this.supabase = supabase;
    this.logger = logger;
    this.sessionManager = sessionManager;
    this.conversationService = conversationService;
    this.realtimeClient = supabase.realtime;

    this.setupRealtimeClient();
  }

  private setupRealtimeClient(): void {
    this.realtimeClient.onOpen(() => {
      this.logger.logSystemEvent("realtime_connected", {
        timestamp: new Date().toISOString(),
        reconnectAttempts: this.reconnectAttempts,
      });
      this.reconnectAttempts = 0;
      this.resubscribeAll();
    });

    this.realtimeClient.onClose(() => {
      this.logger.logSystemEvent("realtime_disconnected", {
        timestamp: new Date().toISOString(),
      });
      this.handleReconnect();
    });

    this.realtimeClient.onError((error) => {
      this.logger.logError("realtime_error", {
        error: error?.message || "Unknown realtime error",
        timestamp: new Date().toISOString(),
      });
      this.handleReconnect();
    });
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.logError("realtime_reconnect_failed", {
        attempts: this.reconnectAttempts,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.logger.logSystemEvent("realtime_reconnect_attempt", {
      attempt: this.reconnectAttempts,
      delay,
      timestamp: new Date().toISOString(),
    });

    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await this.realtimeClient.connect();
    } catch (error) {
      this.logger.logError("realtime_reconnect_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        attempt: this.reconnectAttempts,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      this.subscribeToTable(
        subscription.type,
        subscription.filters,
        subscription.callback,
      );
    });
  }

  async subscribeToConversations(
    _userId: string,
    clinicId: string,
    callback: (message: RealtimeMessage) => void,
  ): Promise<string> {
    const subscriptionId = `conv_${userId}_${clinicId}_${Date.now()}`;

    const handler = (_payload: any) => {
      const message: RealtimeMessage = {
        conversationId: payload.new_record?.id || payload.old_record?.id,
        userId,
        clinicId,
        patientId:
          payload.new_record?.patient_id || payload.old_record?.patient_id,
        type: "conversation_update",
        event: payload,
        _payload: payload.new_record || payload.old_record,
        timestamp: new Date(),
      };
      callback(message);
    };

    this.messageHandlers.set(subscriptionId, handler);

    const channel = this.realtimeClient
      .channel(subscriptionId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_conversation_contexts",
          filter: `user_id=eq.${userId} AND clinic_id=eq.${clinicId}`,
        },
        handler,
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type: "conversations",
      filters: { userId, clinicId },
      callback: handler,
    };

    this.subscriptions.set(subscriptionId, subscription);

    await this.logger.logSystemEvent("conversation_subscription_created", {
      subscriptionId,
      userId,
      clinicId,
      timestamp: new Date().toISOString(),
    });

    return subscriptionId;
  }

  async subscribeToMessages(
    conversationId: string,
    callback: (message: RealtimeMessage) => void,
  ): Promise<string> {
    const subscriptionId = `msg_${conversationId}_${Date.now()}`;

    const handler = (_payload: any) => {
      const message: RealtimeMessage = {
        conversationId,
        type: "message",
        event: payload,
        _payload: payload.new_record || payload.old_record,
        timestamp: new Date(),
      };
      callback(message);
    };

    this.messageHandlers.set(subscriptionId, handler);

    const channel = this.realtimeClient
      .channel(subscriptionId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_conversation_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        handler,
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type: "messages",
      filters: { conversationId },
      callback: handler,
    };

    this.subscriptions.set(subscriptionId, subscription);

    await this.logger.logSystemEvent("message_subscription_created", {
      subscriptionId,
      conversationId,
      timestamp: new Date().toISOString(),
    });

    return subscriptionId;
  }

  async subscribeToSessions(
    _userId: string,
    callback: (message: RealtimeMessage) => void,
  ): Promise<string> {
    const subscriptionId = `session_${userId}_${Date.now()}`;

    const handler = (_payload: any) => {
      const message: RealtimeMessage = {
        sessionId: payload.new_record?.id || payload.old_record?.id,
        userId,
        type: "session_update",
        event: payload,
        _payload: payload.new_record || payload.old_record,
        timestamp: new Date(),
      };
      callback(message);
    };

    this.messageHandlers.set(subscriptionId, handler);

    const channel = this.realtimeClient
      .channel(subscriptionId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "ai_sessions",
          filter: `user_id=eq.${userId}`,
        },
        handler,
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type: "sessions",
      filters: { userId },
      callback: handler,
    };

    this.subscriptions.set(subscriptionId, subscription);

    await this.logger.logSystemEvent("session_subscription_created", {
      subscriptionId,
      userId,
      timestamp: new Date().toISOString(),
    });

    return subscriptionId;
  }

  async subscribeToSystemNotifications(
    callback: (message: RealtimeMessage) => void,
  ): Promise<string> {
    const subscriptionId = `system_${Date.now()}`;

    const handler = (_payload: any) => {
      const message: RealtimeMessage = {
        type: "system_notification",
        event: payload,
        _payload: payload.new_record || payload.old_record,
        timestamp: new Date(),
      };
      callback(message);
    };

    this.messageHandlers.set(subscriptionId, handler);

    // Subscribe to audit logs for system events
    const channel = this.realtimeClient
      .channel(subscriptionId)
      .on(
        "postgres_changes",
        {
          event: "insert",
          schema: "public",
          table: "ai_audit_logs",
          filter:
            "action=in.(cleanup_expired_conversations,system_error,realtime_event)",
        },
        handler,
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type: "system",
      callback: handler,
    };

    this.subscriptions.set(subscriptionId, subscription);

    await this.logger.logSystemEvent("system_subscription_created", {
      subscriptionId,
      timestamp: new Date().toISOString(),
    });

    return subscriptionId;
  }

  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    try {
      await this.realtimeClient.removeChannel(subscription.channel);
      this.subscriptions.delete(subscriptionId);
      this.messageHandlers.delete(subscriptionId);

      await this.logger.logSystemEvent("realtime_unsubscribed", {
        subscriptionId,
        type: subscription.type,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      await this.logger.logError("realtime_unsubscribe_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        subscriptionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.subscriptions.keys()).map(
      (id) => this.unsubscribe(id),
    );
    await Promise.all(unsubscribePromises);
  }

  private subscribeToTable(
    type: "conversations" | "messages" | "sessions" | "system",
    filters: any,
    callback: (_payload: any) => void,
  ): RealtimeChannel {
    const subscriptionId = `${type}_${Date.now()}`;

    let tableName: string;
    let filterString = "";

    switch (type) {
      case "conversations":
        tableName = "ai_conversation_contexts";
        if (filters.userId && filters.clinicId) {
          filterString = `user_id=eq.${filters.userId} AND clinic_id=eq.${filters.clinicId}`;
        }
        break;
      case "messages":
        tableName = "ai_conversation_messages";
        if (filters.conversationId) {
          filterString = `conversation_id=eq.${filters.conversationId}`;
        }
        break;
      case "sessions":
        tableName = "ai_sessions";
        if (filters._userId) {
          filterString = `user_id=eq.${filters.userId}`;
        }
        break;
      default:
        throw new Error(`Unknown subscription type: ${type}`);
    }

    const channel = this.realtimeClient
      .channel(subscriptionId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: filterString || undefined,
        },
        callback,
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel,
      type,
      filters,
      callback,
    };

    this.subscriptions.set(subscriptionId, subscription);

    return channel;
  }

  async broadcastMessage(message: RealtimeMessage): Promise<void> {
    try {
      // Broadcast to relevant subscribers based on message type
      this.subscriptions.forEach((subscription) => {
        const shouldReceive = this.shouldReceiveMessage(subscription, message);
        if (shouldReceive) {
          subscription.callback(message);
        }
      });

      await this.logger.logSystemEvent("realtime_message_broadcast", {
        messageType: message.type,
        recipientCount: this.countPotentialRecipients(message),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      await this.logger.logError("realtime_broadcast_error", {
        error: error instanceof Error ? error.message : "Unknown error",
        messageType: message.type,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private shouldReceiveMessage(
    subscription: RealtimeSubscription,
    message: RealtimeMessage,
  ): boolean {
    switch (subscription.type) {
      case "conversations":
        return (
          message.type === "conversation_update" &&
          subscription.filters.userId === message.userId &&
          subscription.filters.clinicId === message.clinicId
        );

      case "messages":
        return (
          message.type === "message" &&
          subscription.filters.conversationId === message.conversationId
        );

      case "sessions":
        return (
          message.type === "session_update" &&
          subscription.filters.userId === message.userId
        );

      case "system":
        return message.type === "system_notification";

      default:
        return false;
    }
  }

  private countPotentialRecipients(message: RealtimeMessage): number {
    let count = 0;
    this.subscriptions.forEach((subscription) => {
      if (this.shouldReceiveMessage(subscription, message)) {
        count++;
      }
    });
    return count;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getSubscriptionsByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    this.subscriptions.forEach((subscription) => {
      counts[subscription.type] = (counts[subscription.type] || 0) + 1;
    });
    return counts;
  }

  getConnectionStatus(): {
    connected: boolean;
    subscriptions: number;
    reconnectAttempts: number;
    lastEvent?: Date;
  } {
    return {
      connected: this.realtimeClient.isConnected(),
      subscriptions: this.subscriptions.size,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  async sendSystemNotification(
    type: string,
    message: string,
    severity: "info" | "warning" | "error" = "info",
    data?: any,
  ): Promise<void> {
    const notification: RealtimeMessage = {
      type: "system_notification",
      event: {
        type: "insert",
        table: "system_notifications",
        schema: "public",
        new_record: {
          type,
          message,
          severity,
          data,
          created_at: new Date().toISOString(),
        },
      },
      _payload: {
        type,
        message,
        severity,
        data,
      },
      timestamp: new Date(),
    };

    await this.broadcastMessage(notification);
  }

  async dispose(): Promise<void> {
    await this.unsubscribeAll();
    this.realtimeClient.disconnect();
  }
}
