/**
 * Enhanced React Hook para Real-time System Notifications
 * Sistema crítico de notificações para ambiente healthcare
 * Integra com toast system e audio alerts para urgências médicas
 */

import type { Notification } from '@neonpro/db';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getRealtimeManager } from '../connection-manager';

// Using the actual notifications table
type NotificationRow = Notification;

// Extended notification interface with additional properties
export interface ExtendedNotification extends NotificationRow {
  priority?: keyof NotificationPriority;
}

export interface NotificationPriority {
  EMERGENCY: 'emergency'; // Emergências médicas
  HIGH: 'high'; // Alterações críticas
  MEDIUM: 'medium'; // Lembretes importantes
  LOW: 'low'; // Informações gerais
}

export interface RealtimeNotificationPayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: ExtendedNotification;
  old?: ExtendedNotification;
  errors?: string[];
}

export interface UseRealtimeNotificationsOptions {
  tenantId: string;
  userId?: string;
  priority?: keyof NotificationPriority;
  enabled?: boolean;
  enableAudio?: boolean;
  enableToast?: boolean;
  onNotification?: (payload: RealtimeNotificationPayload) => void;
  onEmergencyNotification?: (payload: RealtimeNotificationPayload) => void;
  onError?: (error: Error) => void;
}

export interface UseRealtimeNotificationsReturn {
  isConnected: boolean;
  connectionHealth: number;
  unreadCount: number;
  lastNotification: NotificationRow | null;
  emergencyCount: number;
  subscribe: () => void;
  unsubscribe: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  playNotificationSound: (priority: keyof NotificationPriority) => void;
} /**
 * MANDATORY Real-time Notification Hook
 * Sistema crítico para notificações healthcare com audio alerts
 */
export function useRealtimeNotifications(
  options: UseRealtimeNotificationsOptions
): UseRealtimeNotificationsReturn {
  const {
    tenantId,
    userId,
    priority,
    enabled = true,
    enableAudio = true,
    enableToast = true,
    onNotification,
    onEmergencyNotification,
    onError,
  } = options;

  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionHealth, setConnectionHealth] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] =
    useState<NotificationRow | null>(null);
  const [emergencyCount, setEmergencyCount] = useState(0);
  const [unsubscribeFn, setUnsubscribeFn] = useState<(() => void) | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Handle realtime notification changes
   */
  const handleNotificationChange = useCallback(
    (payload: any) => {
      try {
        const realtimePayload: RealtimeNotificationPayload = {
          eventType: payload.eventType,
          new: payload.new as ExtendedNotification,
          old: payload.old as ExtendedNotification,
        };

        // Update state metrics
        if (realtimePayload.eventType === 'INSERT' && realtimePayload.new) {
          setUnreadCount((prev) => prev + 1);
          setLastNotification(realtimePayload.new as NotificationRow);

          // Track emergency notifications
          if (realtimePayload.new.priority === 'EMERGENCY') {
            setEmergencyCount((prev) => prev + 1);

            // Trigger emergency callback
            if (onEmergencyNotification) {
              onEmergencyNotification(realtimePayload);
            }
          }

          // Play audio alert based on priority
          if (enableAudio) {
            playNotificationSound(realtimePayload.new.priority || 'LOW');
          }

          // Show toast notification
          if (enableToast) {
            showToastNotification(realtimePayload.new);
          }
        }

        // Update TanStack Query cache
        updateNotificationCache(realtimePayload);

        // Call user callback
        if (onNotification) {
          onNotification(realtimePayload);
        }

        // Healthcare audit trail
        console.log(`[RealtimeNotifications] ${payload.eventType} event:`, {
          notificationId: realtimePayload.new?.id || realtimePayload.old?.id,
          priority: realtimePayload.new?.priority || 'UNKNOWN',
          tenantId,
          userId,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(
          '[RealtimeNotifications] Payload processing error:',
          error
        );
        if (onError) {
          onError(error as Error);
        }
      }
    },
    [
      onNotification,
      onEmergencyNotification,
      onError,
      tenantId,
      userId,
      enableAudio,
      enableToast,
    ]
  ); /**
   * Play notification sound based on priority
   */
  const playNotificationSound = useCallback(
    (priority: keyof NotificationPriority) => {
      if (!enableAudio || typeof window === 'undefined') return;

      try {
        // Different sounds for different priorities
        const soundMap = {
          EMERGENCY: '/sounds/emergency-alert.mp3', // Critical medical alerts
          HIGH: '/sounds/urgent-notification.mp3', // Important changes
          MEDIUM: '/sounds/standard-notification.mp3', // Regular updates
          LOW: '/sounds/soft-notification.mp3', // Info notifications
        };

        const soundUrl = soundMap[priority] || soundMap.LOW;

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }

        audioRef.current.src = soundUrl;
        audioRef.current.volume = priority === 'EMERGENCY' ? 1.0 : 0.7;

        // Play sound with fallback
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('[RealtimeNotifications] Audio play failed:', error);
            // Fallback to system notification sound
            if (
              'Notification' in window &&
              Notification.permission === 'granted'
            ) {
              new Notification('NeonPro Healthcare', {
                body: 'Nova notificação recebida',
                icon: '/icons/healthcare-notification.png',
                silent: false,
              });
            }
          });
        }
      } catch (error) {
        console.error('[RealtimeNotifications] Audio alert error:', error);
      }
    },
    [enableAudio]
  );

  /**
   * Show toast notification
   */
  const showToastNotification = useCallback(
    (notification: ExtendedNotification) => {
      if (!enableToast || typeof window === 'undefined') return;

      // Use toast system (assuming react-hot-toast or similar)
      const toastConfig = {
        duration: notification.priority === 'EMERGENCY' ? 0 : 5000, // Emergency stays until dismissed
        position: 'top-right' as const,
        style: {
          background: getPriorityColor(notification.priority || 'LOW'),
          color: 'white',
          fontSize: '14px',
          maxWidth: '400px',
        },
      };

      // Dispatch custom event for toast system
      const toastEvent = new CustomEvent('neonpro-notification', {
        detail: {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          priority: notification.priority || 'LOW',
          config: toastConfig,
        },
      });

      window.dispatchEvent(toastEvent);
    },
    [enableToast]
  );

  /**
   * Get priority color for UI feedback
   */
  const getPriorityColor = useCallback(
    (priority: keyof NotificationPriority): string => {
      const colorMap = {
        EMERGENCY: '#dc2626', // Red for emergencies
        HIGH: '#ea580c', // Orange for high priority
        MEDIUM: '#2563eb', // Blue for medium
        LOW: '#059669', // Green for low priority
      };
      return colorMap[priority] || colorMap.LOW;
    },
    []
  ); /**
   * Update TanStack Query cache para notifications
   */
  const updateNotificationCache = useCallback(
    (payload: RealtimeNotificationPayload) => {
      const { eventType, new: newData, old: oldData } = payload;

      // Update notifications list cache
      queryClient.setQueryData(
        ['notifications', tenantId, userId],
        (oldCache: NotificationRow[] | undefined) => {
          if (!oldCache) return oldCache;

          switch (eventType) {
            case 'INSERT':
              if (newData && newData.clinic_id === tenantId) {
                // Insert newest first
                return [newData as NotificationRow, ...oldCache];
              }
              return oldCache;

            case 'UPDATE':
              if (newData) {
                return oldCache.map((notification) =>
                  notification.id === newData.id
                    ? (newData as NotificationRow)
                    : notification
                );
              }
              return oldCache;

            case 'DELETE':
              if (oldData) {
                return oldCache.filter(
                  (notification) => notification.id !== oldData.id
                );
              }
              return oldCache;

            default:
              return oldCache;
          }
        }
      );

      // Update individual notification cache
      if (newData) {
        queryClient.setQueryData(['notification', newData.id], newData);
      } else if (oldData && eventType === 'DELETE') {
        queryClient.removeQueries({ queryKey: ['notification', oldData.id] });
      }

      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: ['notification-stats', tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ['unread-notifications', tenantId, userId],
      });
    },
    [queryClient, tenantId, userId]
  );

  /**
   * Subscribe to realtime notification updates
   */
  const subscribe = useCallback(() => {
    if (!enabled || unsubscribeFn) return;

    const realtimeManager = getRealtimeManager();

    // Build filter for user and tenant specific notifications
    let filter = `tenant_id=eq.${tenantId}`;
    if (userId) {
      filter += `,recipient_id=eq.${userId}`;
    }
    if (priority) {
      filter += `,priority=eq.${priority}`;
    }

    const unsubscribe = realtimeManager.subscribe(
      `notifications:${filter}`,
      {
        table: 'notifications', // Now using the actual notifications table
        filter,
      },
      handleNotificationChange
    );

    setUnsubscribeFn(() => unsubscribe);
  }, [
    enabled,
    tenantId,
    userId,
    priority,
    handleNotificationChange,
    unsubscribeFn,
  ]); /**
   * Unsubscribe from realtime notification updates
   */
  const unsubscribe = useCallback(() => {
    if (unsubscribeFn) {
      unsubscribeFn();
      setUnsubscribeFn(null);
    }
  }, [unsubscribeFn]);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        // Optimistic update
        queryClient.setQueryData(
          ['notifications', tenantId, userId],
          (oldCache: NotificationRow[] | undefined) => {
            if (!oldCache) return oldCache;
            return oldCache.map((notification) =>
              notification.id === notificationId
                ? { ...notification, read_at: new Date().toISOString() }
                : notification
            );
          }
        );

        // Update unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));

        // Update individual notification cache
        queryClient.setQueryData(
          ['notification', notificationId],
          (oldData: NotificationRow | undefined) => {
            if (!oldData) return oldData;
            return { ...oldData, read_at: new Date().toISOString() };
          }
        );

        // Here you would typically make an API call to mark as read
        // await markNotificationAsRead(notificationId);
      } catch (error) {
        console.error('[RealtimeNotifications] Mark as read error:', error);
        // Rollback on error
        queryClient.invalidateQueries({
          queryKey: ['notifications', tenantId, userId],
        });
      }
    },
    [queryClient, tenantId, userId]
  );

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      // Optimistic update
      queryClient.setQueryData(
        ['notifications', tenantId, userId],
        (oldCache: NotificationRow[] | undefined) => {
          if (!oldCache) return oldCache;
          return oldCache.map((notification) => ({
            ...notification,
            read_at: notification.read_at || new Date().toISOString(),
          }));
        }
      );

      // Reset unread count
      setUnreadCount(0);

      // Here you would typically make an API call
      // await markAllNotificationsAsRead(tenantId, userId);
    } catch (error) {
      console.error('[RealtimeNotifications] Mark all as read error:', error);
      // Rollback on error
      queryClient.invalidateQueries({
        queryKey: ['notifications', tenantId, userId],
      });
    }
  }, [queryClient, tenantId, userId]); /**
   * Monitor connection status and auto-subscribe
   */
  useEffect(() => {
    if (!enabled) return;

    const realtimeManager = getRealtimeManager();

    const unsubscribeStatus = realtimeManager.onStatusChange((status) => {
      setIsConnected(status.isConnected);
      setConnectionHealth(status.healthScore);
    });

    // Auto-subscribe if enabled
    if (enabled) {
      subscribe();
    }

    // Cleanup on unmount
    return () => {
      unsubscribe();
      unsubscribeStatus();

      // Cleanup audio element
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [enabled, subscribe, unsubscribe]);

  // Initialize audio element for faster playback
  useEffect(() => {
    if (enableAudio && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
  }, [enableAudio]);

  return {
    isConnected,
    connectionHealth,
    unreadCount,
    lastNotification,
    emergencyCount,
    subscribe,
    unsubscribe,
    markAsRead,
    markAllAsRead,
    playNotificationSound,
  };
}
