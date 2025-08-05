"use client";

import type { addMinutes, endOfDay, format, isAfter, isBefore, startOfDay } from "date-fns";
import type { pt } from "date-fns/locale";
import type { useCallback, useMemo, useState } from "react";
import type { TimeSlot, useRealtimeAvailability } from "@/hooks/use-realtime-availability";

export interface AvailabilityFilters {
  professionalId?: string;
  serviceId?: string;
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  onlyAvailable?: boolean;
}

export interface GroupedSlots {
  [date: string]: TimeSlot[];
}

export function useAvailabilityManager() {
  const [filters, setFilters] = useState<AvailabilityFilters>({
    onlyAvailable: true,
  });

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Hook realtime com filtros aplicados
  const { timeSlots, isConnected, isLoading, error, bookSlot, refetch } = useRealtimeAvailability({
    professionalId: filters.professionalId,
    serviceId: filters.serviceId,
    date: filters.date ? format(filters.date, "yyyy-MM-dd") : undefined,
  });

  // Slots filtrados e processados
  const filteredSlots = useMemo(() => {
    let filtered = timeSlots;

    // Filtrar por disponibilidade
    if (filters.onlyAvailable) {
      filtered = filtered.filter((slot) => slot.is_available);
    }

    // Filtrar por data de início
    if (filters.startDate) {
      const startDateStr = format(filters.startDate, "yyyy-MM-dd");
      filtered = filtered.filter((slot) => slot.date >= startDateStr);
    }

    // Filtrar por data de fim
    if (filters.endDate) {
      const endDateStr = format(filters.endDate, "yyyy-MM-dd");
      filtered = filtered.filter((slot) => slot.date <= endDateStr);
    }

    return filtered;
  }, [timeSlots, filters]);

  // Slots agrupados por data
  const groupedSlots = useMemo(() => {
    const grouped: GroupedSlots = {};

    filteredSlots.forEach((slot) => {
      const dateKey = slot.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    // Ordenar slots dentro de cada data
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => a.start_time.localeCompare(b.start_time));
    });

    return grouped;
  }, [filteredSlots]);

  // Estatísticas de disponibilidade
  const availability = useMemo(() => {
    const total = timeSlots.length;
    const available = timeSlots.filter((slot) => slot.is_available).length;
    const booked = total - available;
    const availabilityRate = total > 0 ? (available / total) * 100 : 0;

    return {
      total,
      available,
      booked,
      availabilityRate: Math.round(availabilityRate * 100) / 100,
    };
  }, [timeSlots]);

  // Função para atualizar filtros
  const updateFilters = useCallback((newFilters: Partial<AvailabilityFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Função para limpar filtros
  const clearFilters = useCallback(() => {
    setFilters({ onlyAvailable: true });
  }, []);

  // Função para selecionar slot
  const selectSlot = useCallback((slot: TimeSlot | null) => {
    setSelectedSlot(slot);
  }, []);

  // Função para reservar slot selecionado
  const bookSelectedSlot = useCallback(
    async (patientId: string) => {
      if (!selectedSlot) return { success: false, error: "Nenhum slot selecionado" };

      setIsBooking(true);
      try {
        const result = await bookSlot(selectedSlot.id, patientId);

        if (result.success) {
          setSelectedSlot(null); // Limpar seleção após sucesso
        }

        return result;
      } finally {
        setIsBooking(false);
      }
    },
    [selectedSlot, bookSlot],
  );

  // Função para verificar se um slot está disponível para reserva
  const isSlotBookable = useCallback((slot: TimeSlot) => {
    if (!slot.is_available) return false;

    const slotDateTime = new Date(`${slot.date}T${slot.start_time}`);
    const now = new Date();

    // Não permitir reserva de slots no passado
    return isAfter(slotDateTime, now);
  }, []);

  // Função para encontrar próximos slots disponíveis
  const getNextAvailableSlots = useCallback(
    (limit = 5) => {
      const now = new Date();

      return filteredSlots
        .filter((slot) => {
          const slotDateTime = new Date(`${slot.date}T${slot.start_time}`);
          return slot.is_available && isAfter(slotDateTime, now);
        })
        .slice(0, limit);
    },
    [filteredSlots],
  );

  // Função para verificar conflitos de horário
  const hasTimeConflict = useCallback(
    (newSlot: { date: string; start_time: string; end_time: string }, excludeSlotId?: string) => {
      return timeSlots.some((existingSlot) => {
        if (excludeSlotId && existingSlot.id === excludeSlotId) return false;
        if (existingSlot.date !== newSlot.date) return false;

        const newStart = new Date(`${newSlot.date}T${newSlot.start_time}`);
        const newEnd = new Date(`${newSlot.date}T${newSlot.end_time}`);
        const existingStart = new Date(`${existingSlot.date}T${existingSlot.start_time}`);
        const existingEnd = new Date(`${existingSlot.date}T${existingSlot.end_time}`);

        // Verificar sobreposição
        return (
          (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) ||
          (isBefore(existingStart, newEnd) && isAfter(existingEnd, newStart))
        );
      });
    },
    [timeSlots],
  );

  return {
    // Estado
    timeSlots: filteredSlots,
    groupedSlots,
    selectedSlot,
    isBooking,
    filters,

    // Conexão e dados
    isConnected,
    isLoading,
    error,
    availability,

    // Ações
    updateFilters,
    clearFilters,
    selectSlot,
    bookSelectedSlot,
    refetch,

    // Utilitários
    isSlotBookable,
    getNextAvailableSlots,
    hasTimeConflict,
  };
}
