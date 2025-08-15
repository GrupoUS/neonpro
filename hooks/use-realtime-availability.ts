'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimeSlot {
  id: string;
  professional_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  updated_at: string;
}

export interface AvailabilityUpdate {
  slot_id: string;
  is_available: boolean;
  updated_by: string;
  timestamp: string;
}

interface UseRealtimeAvailabilityProps {
  professionalId?: string;
  serviceId?: string;
  date?: string;
}

export function useRealtimeAvailability({
  professionalId,
  serviceId,
  date,
}: UseRealtimeAvailabilityProps = {}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const { toast } = useToast();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Função para buscar slots iniciais
  const fetchInitialSlots = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('time_slots')
        .select(`
          *,
          professional:professionals(name, email),
          service:services(name, duration, price)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      // Aplicar filtros se fornecidos
      if (professionalId) {
        query = query.eq('professional_id', professionalId);
      }
      if (serviceId) {
        query = query.eq('service_id', serviceId);
      }
      if (date) {
        query = query.eq('date', date);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar slots: ${error.message}`);
      }

      setTimeSlots(data || []);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro ao buscar slots:', err);

      toast({
        title: 'Erro ao carregar disponibilidade',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Setup de subscription em tempo real
  useEffect(() => {
    // Buscar dados iniciais
    fetchInitialSlots();

    // Setup do canal realtime
    const channel = supabase
      .channel('availability_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_slots',
        },
        (payload) => {
          console.log('Realtime update:', payload);

          switch (payload.eventType) {
            case 'INSERT':
              handleSlotInsert(payload.new as TimeSlot);
              break;
            case 'UPDATE':
              handleSlotUpdate(
                payload.new as TimeSlot,
                payload.old as TimeSlot
              );
              break;
            case 'DELETE':
              handleSlotDelete(payload.old as TimeSlot);
              break;
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setIsConnected(status === 'SUBSCRIBED');

        if (status === 'SUBSCRIBED') {
          toast({
            title: 'Conectado',
            description: 'Atualizações em tempo real ativadas',
            duration: 2000,
          });
        } else if (status === 'CLOSED') {
          setIsConnected(false);
          toast({
            title: 'Desconectado',
            description: 'Atualizações em tempo real desativadas',
            variant: 'destructive',
            duration: 3000,
          });
        }
      });

    channelRef.current = channel;

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [professionalId, serviceId, date]);

  // Handlers para eventos realtime
  const handleSlotInsert = (newSlot: TimeSlot) => {
    setTimeSlots((prev) => {
      // Verificar se já existe
      const exists = prev.find((slot) => slot.id === newSlot.id);
      if (exists) return prev;

      // Adicionar e reordenar
      const updated = [...prev, newSlot].sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        return a.start_time.localeCompare(b.start_time);
      });

      toast({
        title: 'Novo horário disponível',
        description: `${newSlot.date} às ${newSlot.start_time}`,
        duration: 3000,
      });

      return updated;
    });
  };

  const handleSlotUpdate = (updatedSlot: TimeSlot, oldSlot: TimeSlot) => {
    setTimeSlots((prev) =>
      prev.map((slot) => (slot.id === updatedSlot.id ? updatedSlot : slot))
    );

    // Notificar sobre mudanças importantes
    if (oldSlot.is_available !== updatedSlot.is_available) {
      toast({
        title: updatedSlot.is_available
          ? 'Horário liberado'
          : 'Horário ocupado',
        description: `${updatedSlot.date} às ${updatedSlot.start_time}`,
        duration: 3000,
      });
    }
  };

  const handleSlotDelete = (deletedSlot: TimeSlot) => {
    setTimeSlots((prev) => prev.filter((slot) => slot.id !== deletedSlot.id));

    toast({
      title: 'Horário removido',
      description: `${deletedSlot.date} às ${deletedSlot.start_time}`,
      duration: 3000,
    });
  };

  // Função para tentar reservar slot (com otimistic update)
  const bookSlot = async (slotId: string, patientId: string) => {
    try {
      // Otimistic update
      setTimeSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, is_available: false } : slot
        )
      );

      const { error } = await supabase.from('appointments').insert([
        {
          time_slot_id: slotId,
          patient_id: patientId,
          status: 'confirmed',
        },
      ]);

      if (error) {
        // Reverter otimistic update em caso de erro
        setTimeSlots((prev) =>
          prev.map((slot) =>
            slot.id === slotId ? { ...slot, is_available: true } : slot
          )
        );

        throw new Error(`Erro ao reservar: ${error.message}`);
      }

      toast({
        title: 'Agendamento confirmado',
        description: 'O horário foi reservado com sucesso',
        duration: 3000,
      });

      return { success: true };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro desconhecido';

      toast({
        title: 'Erro no agendamento',
        description: errorMessage,
        variant: 'destructive',
      });

      return { success: false, error: errorMessage };
    }
  };

  return {
    timeSlots,
    isConnected,
    isLoading,
    error,
    bookSlot,
    refetch: fetchInitialSlots,
  };
}
