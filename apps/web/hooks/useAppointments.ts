'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import type { Database } from '@/types/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  patients: { name: string; email: string } | null;
  staff_members: { name: string; specialty: string } | null;
  services: { name: string; duration: number } | null;
};

type AppointmentsHook = {
  appointments: Appointment[];
  upcomingAppointments: Appointment[];
  todaysAppointments: Appointment[];
  appointmentsByDate: (date: Date) => Appointment[];
  loading: boolean;
  error: Error | null;
  refreshAppointments: () => Promise<void>;
};

export function useAppointments(): AppointmentsHook {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (name, email),
          staff_members (name, specialty),
          services (name, duration)
        `)
        .order('appointment_date', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setAppointments(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Consultas futuras (próximos 30 dias)
  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        return (
          appointmentDate >= now &&
          appointmentDate <= thirtyDaysFromNow &&
          appointment.status === 'scheduled'
        );
      })
      .slice(0, 10); // Limitar a 10 próximas consultas
  }, [appointments]);

  // Consultas de hoje
  const todaysAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(appointment.appointment_date);
        return (
          appointmentDate >= today &&
          appointmentDate < tomorrow &&
          ['scheduled', 'confirmed'].includes(appointment.status)
        );
      })
      .sort(
        (a, b) =>
          new Date(a.appointment_date).getTime() -
          new Date(b.appointment_date).getTime()
      );
  }, [appointments]);

  // Função para buscar consultas por data específica
  const appointmentsByDate = useCallback(
    (date: Date): Appointment[] => {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      return appointments
        .filter((appointment) => {
          const appointmentDate = new Date(appointment.appointment_date);
          return appointmentDate >= startOfDay && appointmentDate <= endOfDay;
        })
        .sort(
          (a, b) =>
            new Date(a.appointment_date).getTime() -
            new Date(b.appointment_date).getTime()
        );
    },
    [appointments]
  );

  // Função para atualizar a lista de consultas
  const refreshAppointments = useCallback(async () => {
    await fetchAppointments();
  }, [fetchAppointments]);

  // Effect para buscar consultas
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Setup real-time subscription para consultas
  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
        },
        async (_payload) => {
          // Refetch appointments para incluir dados relacionados
          await fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [supabase, fetchAppointments]);

  return {
    appointments,
    upcomingAppointments,
    todaysAppointments,
    appointmentsByDate,
    loading,
    error,
    refreshAppointments,
  };
}
