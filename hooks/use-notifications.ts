'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export interface Notification {
  id: string;
  user_id: string;
  type:
    | 'appointment_confirmed'
    | 'appointment_cancelled'
    | 'appointment_reminder'
    | 'appointment_rescheduled'
    | 'system'
    | 'marketing';
  title: string;
  message: string;
  data?: Record<string, any>;
  read_at?: string;
  created_at: string;
  expires_at?: string;
  priority: 'low' | 'medium' | 'high';
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
  types?: Notification['type'][];
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
    preferences: Partial<NotificationPreferences>
  ) => Promise<void>;
  sendNotification: (
    notification: Omit<Notification, 'id' | 'created_at'>
  ) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Utilities
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getUnreadNotifications: () => Notification[];
  hasUnreadNotifications: boolean;
}

export function useNotifications({
  userId,
  autoMarkAsRead = false,
  limit = 50,
  types,
  realtime = true,
}: UseNotificationsOptions): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(
    null
  );

  const supabase = createClientComponentClient();

  // Load initial data
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by types if specified
      if (types && types.length > 0) {
        query = query.in('type', types);
      }

      // Filter out expired notifications
      query = query.or(
        `expires_at.is.null,expires_at.gt.${new Date().toISOString()}`
      );

      const { data: notificationsData, error: notificationsError } =
        await query;

      if (notificationsError) {
        throw new Error(
          `Failed to load notifications: ${notificationsError.message}`
        );
      }

      setNotifications(notificationsData || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load notifications';
      setError(errorMessage);
      console.error('Error loading notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit, types, supabase]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    try {
      const { data, error: preferencesError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (preferencesError && preferencesError.code !== 'PGRST116') {
        throw new Error(
          `Failed to load preferences: ${preferencesError.message}`
        );
      }

      // Set default preferences if none exist
      const defaultPreferences: NotificationPreferences = {
        user_id: userId,
        email_enabled: true,
        push_enabled: true,
        appointment_reminders: true,
        status_changes: true,
        marketing_emails: false,
        reminder_timing: 120, // 2 hours
      };

      setPreferences(data || defaultPreferences);
    } catch (err) {
      console.error('Error loading notification preferences:', err);
    }
  }, [userId, supabase]);

  // Setup real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!realtime || subscription) {
      return;
    }

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Notification change:', payload);

          if (payload.eventType === 'INSERT') {
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
            if (newNotification.priority === 'high') {
              // This would integrate with your toast system
              console.log('High priority notification:', newNotification.title);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((notif) =>
                notif.id === updatedNotification.id
                  ? updatedNotification
                  : notif
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) =>
              prev.filter((notif) => notif.id !== payload.old.id)
            );
          }
        }
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

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ read_at: new Date().toISOString() })
          .eq('id', notificationId)
          .eq('user_id', userId);

        if (error) {
          throw new Error(
            `Failed to mark notification as read: ${error.message}`
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
      } catch (err) {
        console.error('Error marking notification as read:', err);
        throw err;
      }
    },
    [userId, supabase]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const unreadIds = notifications
        .filter((notif) => !notif.read_at)
        .map((notif) => notif.id);

      if (unreadIds.length === 0) {
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .in('id', unreadIds)
        .eq('user_id', userId);

      if (error) {
        throw new Error(
          `Failed to mark notifications as read: ${error.message}`
        );
      }

      // Update local state
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((notif) =>
          unreadIds.includes(notif.id) ? { ...notif, read_at: now } : notif
        )
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [notifications, userId, supabase]);

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to delete notification: ${error.message}`);
        }

        // Update local state
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId)
        );
      } catch (err) {
        console.error('Error deleting notification:', err);
        throw err;
      }
    },
    [userId, supabase]
  );

  // Update preferences
  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      try {
        const updatedPreferences = { ...preferences, ...newPreferences };

        const { error } = await supabase
          .from('notification_preferences')
          .upsert(updatedPreferences)
          .eq('user_id', userId);

        if (error) {
          throw new Error(`Failed to update preferences: ${error.message}`);
        }

        setPreferences(updatedPreferences as NotificationPreferences);
      } catch (err) {
        console.error('Error updating notification preferences:', err);
        throw err;
      }
    },
    [preferences, userId, supabase]
  );

  // Send notification
  const sendNotification = useCallback(
    async (notification: Omit<Notification, 'id' | 'created_at'>) => {
      try {
        const { error } = await supabase.from('notifications').insert([
          {
            ...notification,
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          throw new Error(`Failed to send notification: ${error.message}`);
        }
      } catch (err) {
        console.error('Error sending notification:', err);
        throw err;
      }
    },
    [supabase]
  );

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Utility functions
  const getNotificationsByType = useCallback(
    (type: Notification['type']) => {
      return notifications.filter((notif) => notif.type === type);
    },
    [notifications]
  );

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((notif) => !notif.read_at);
  }, [notifications]);

  // Computed values
  const unreadCount = getUnreadNotifications().length;
  const hasUnreadNotifications = unreadCount > 0;

  // Effects
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

  return {
    // State
    notifications,
    unreadCount,
    preferences,
    isLoading,
    error,

    // Actions
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    sendNotification,
    refreshNotifications,

    // Utilities
    getNotificationsByType,
    getUnreadNotifications,
    hasUnreadNotifications,
  };
}
