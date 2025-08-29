"use client";

import type { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";

export interface Notification {
  id: string;
  user_id: string;
  type:
    | "appointment_confirmed"
    | "appointment_cancelled"
    | "appointment_reminder"
    | "appointment_rescheduled"
    | "system"
    | "marketing";
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  priority: "low" | "medium" | "high";
  action_url?: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  appointment_reminders: boolean;
  status_changes: boolean;
  marketing_emails: boolean;
  reminder_timing: number; // minutes before appointment
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface UseNotificationsOptions {
  userId: string;
  autoMarkAsRead?: boolean;
  limit?: number;
  types?: Notification["type"][];
  realtime?: boolean;
}

interface UseNotificationsReturn {
  // State
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreferences>,
  ) => Promise<void>;
  sendNotification: (
    notification: Omit<Notification, "id" | "created_at">,
  ) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications({
  userId,
  autoMarkAsRead = false,
  limit = 50,
  types,
  realtime = true,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);

  const supabase = createClient(
    "https://placeholder.supabase.co",
    "placeholder-key",
  );

  // Load initial data
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      // Filter by types if specified
      if (types && types.length > 0) {
        query = query.in("type", types);
      }

      // Filter out expired notifications
      query = query.or(
        `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`,
      );

      const { data: notificationsData, error: notificationsError } = await query;

      if (notificationsError) {
        throw notificationsError;
      }

      setNotifications(notificationsData || []);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, limit, types]);

  const loadPreferences = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const defaultPreferences: NotificationPreferences = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        appointment_reminders: true,
        status_changes: true,
        marketing_emails: false,
        reminder_timing: 60,
      };

      setPreferences(data || defaultPreferences);
    } catch {}
  }, [userId, supabase]);

  // Mark notification as read - MOVED BEFORE setupRealtimeSubscription
  const markAsRead = useCallback(
    async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(
          `Failed to mark notification as read: ${error.message}`,
        );
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
    },
    [userId, supabase],
  );

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!realtime || subscription) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newNotification = payload.new as Notification;
            setNotifications((prev) => [
              newNotification,
              ...prev.slice(0, limit - 1),
            ]);

            // Auto-mark as read if enabled
            if (autoMarkAsRead) {
              setTimeout(() => markAsRead(newNotification.id), 5000);
            }

            // Show toast notification for high priority
            if (newNotification.priority === "high") {
            }
          } else if (payload.eventType === "UPDATE") {
            const updatedNotification = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === updatedNotification.id
                  ? updatedNotification
                  : notif
              )
            );
          } else if (payload.eventType === "DELETE") {
            const deletedId = payload.old.id;
            setNotifications((prev) => prev.filter((notif) => notif.id !== deletedId));
          }
        },
      )
      .subscribe();

    setSubscription(channel);
  }, [
    userId,
    realtime,
    subscription,
    supabase,
    autoMarkAsRead,
    limit,
    markAsRead,
  ]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications
      .filter((notif) => !notif.read_at)
      .map((notif) => notif.id);

    if (unreadIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }

    // Update local state
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((notif) => unreadIds.includes(notif.id) ? { ...notif, read_at: now } : notif)
    );
  }, [notifications, userId, supabase]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to delete notification: ${error.message}`);
      }

      // Update local state
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    },
    [userId, supabase],
  );

  // Update notification preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      const { error } = await supabase.from("notification_preferences").upsert(
        {
          user_id: userId,
          ...preferences,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        throw new Error(`Failed to update preferences: ${error.message}`);
      }

      setPreferences(
        (prev) =>
          ({
            ...(prev || { user_id: userId }),
            ...newPreferences,
          }) as NotificationPreferences,
      );
    },
    [userId, supabase, preferences],
  );

  // Send notification
  const sendNotification = useCallback(
    async (notification: Omit<Notification, "id" | "created_at">) => {
      const { error } = await supabase.from("notifications").insert({
        ...notification,
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to send notification: ${error.message}`);
      }
    },
    [supabase],
  );

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter((notif) => !notif.read_at).length;

  // Setup effects
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  useEffect(() => {
    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [setupRealtimeSubscription, subscription]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (subscription) {
        subscription.unsubscribe();
        setSubscription(null);
      }
    };
  }, [subscription]);

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    sendNotification,
    refreshNotifications,
  };
}
