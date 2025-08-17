'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type TimeSlot = {
  id: string;
  professional_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  price?: number;
};

export type UseRealtimeAvailabilityOptions = {
  professionalId?: string;
  serviceId?: string;
  dateRange?: { start: Date; end: Date };
  autoRefresh?: boolean;
};

export type UseRealtimeAvailabilityReturn = {
  slots: TimeSlot[];
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refreshSlots: () => Promise<void>;
  bookSlot: (slotId: string) => Promise<boolean>;
  releaseSlot: (slotId: string) => Promise<boolean>;
};

export function useRealtimeAvailability(
  options: UseRealtimeAvailabilityOptions = {}
): UseRealtimeAvailabilityReturn {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const _subscriptionRef = useRef<any>(null);

  const refreshSlots = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Placeholder implementation
      const mockSlots: TimeSlot[] = [
        {
          id: '1',
          professional_id: options.professionalId || 'prof-1',
          service_id: options.serviceId || 'service-1',
          date: new Date().toISOString().split('T')[0],
          start_time: '09:00',
          end_time: '10:00',
          is_available: true,
          price: 100,
        },
      ];

      setSlots(mockSlots);
      setIsConnected(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to refresh slots';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [options.professionalId, options.serviceId]);

  const bookSlot = useCallback(async (slotId: string): Promise<boolean> => {
    try {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, is_available: false } : slot
        )
      );

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to book slot';
      setError(errorMessage);
      return false;
    }
  }, []);

  const releaseSlot = useCallback(async (slotId: string): Promise<boolean> => {
    try {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, is_available: true } : slot
        )
      );

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to release slot';
      setError(errorMessage);
      return false;
    }
  }, []);

  // Initialize data
  useEffect(() => {
    refreshSlots();
  }, [refreshSlots]);

  // Auto-refresh
  useEffect(() => {
    if (!options.autoRefresh) {
      return;
    }

    const interval = setInterval(() => {
      refreshSlots();
    }, 30_000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [options.autoRefresh, refreshSlots]);

  return {
    slots,
    isLoading,
    error,
    isConnected,
    refreshSlots,
    bookSlot,
    releaseSlot,
  };
}
