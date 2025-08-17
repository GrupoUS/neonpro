/**
 * Modern Supabase Real-time Hooks for NeonPro Healthcare
 * Implements real-time subscriptions with healthcare compliance
 * LGPD + ANVISA + CFM compliant real-time data handling
 */

'use client';

import type { Appointment } from '@neonpro/db';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from './client';

/**
 * Real-time appointments hook for healthcare scheduling
 * Provides live updates for appointment changes with clinic isolation
 */
export function useRealtimeAppointments(clinicId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchAppointments = useCallback(async () => {
    if (!clinicId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients!inner(id, name, phone),
          professionals!inner(id, name, specialty)
        `)
        .eq('clinic_id', clinicId)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch appointments',
      );
    } finally {
      setLoading(false);
    }
  }, [clinicId, supabase]);

  useEffect(() => {
    if (!clinicId) return;

    // Initial fetch
    fetchAppointments();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`appointments-${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAppointments((prev) => [...prev, payload.new as Appointment]);
          } else if (payload.eventType === 'UPDATE') {
            setAppointments((prev) =>
              prev.map((apt) =>
                apt.id === payload.new.id ? { ...apt, ...payload.new } : apt,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setAppointments((prev) =>
              prev.filter((apt) => apt.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Healthcare real-time connected for appointments');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Healthcare real-time error for appointments');
          setError('Real-time connection failed');
        }
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [clinicId, supabase, fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}

/**
 * Real-time notifications hook for healthcare communications
 * Provides live updates for patient and staff notifications
 */
export function useRealtimeNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('communication_notifications')
          .select('*')
          .eq('recipient_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setNotifications(data || []);
        setUnreadCount(data?.length || 0);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for notifications
    const subscription = supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'communication_notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as any, ...prev]);
          if (!payload.new.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'communication_notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((notif) =>
              notif.id === payload.new.id
                ? { ...notif, ...payload.new }
                : notif,
            ),
          );

          // Update unread count if notification was marked as read
          if (payload.old.is_read === false && payload.new.is_read === true) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, supabase]);

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error } = await supabase
          .from('communication_notifications')
          .update({ is_read: true, read_at: new Date().toISOString() })
          .eq('id', notificationId);

        if (error) throw error;
      } catch (err) {
        console.error('Failed to mark notification as read:', err);
      }
    },
    [supabase],
  );

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
  };
}

/**
 * Healthcare professional availability hook with real-time updates
 * Critical for appointment scheduling and conflict resolution
 */
export function useRealtimeProfessionalAvailability(professionalId?: string) {
  const [availability, setAvailability] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    if (!professionalId) return;

    const fetchAvailability = async () => {
      try {
        const { data, error } = await supabase
          .from('professional_availability')
          .select('*')
          .eq('professional_id', professionalId)
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) throw error;
        setAvailability(data || []);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();

    // Real-time subscription for availability changes
    const subscription = supabase
      .channel(`availability-${professionalId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'professional_availability',
          filter: `professional_id=eq.${professionalId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAvailability((prev) => [...prev, payload.new as any]);
          } else if (payload.eventType === 'UPDATE') {
            setAvailability((prev) =>
              prev.map((avail) =>
                avail.id === payload.new.id
                  ? { ...avail, ...payload.new }
                  : avail,
              ),
            );
          } else if (payload.eventType === 'DELETE') {
            setAvailability((prev) =>
              prev.filter((avail) => avail.id !== payload.old.id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [professionalId, supabase]);

  return { availability, loading };
}
