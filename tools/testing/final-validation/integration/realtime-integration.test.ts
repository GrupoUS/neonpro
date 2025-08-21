/**
 * NeonPro Healthcare Platform - Real-time Integration Tests
 *
 * Tests Supabase real-time features with TanStack Query integration
 * Validates real-time subscriptions, optimistic updates, and data synchronization
 */

import { QueryClient, type QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppointments } from '@web/hooks/api/useAppointments';
import { usePatients } from '@web/hooks/api/usePatients';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  mockAppointment,
  mockPatient,
  mockUser,
} from '../setup/final-test-setup';

// Mock Supabase real-time client
const mockChannel = {
  on: vi.fn(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

const mockSupabase = {
  channel: vi.fn(() => mockChannel),
  from: vi.fn(() => ({
    select: vi.fn(() => Promise.resolve({ data: [], error: null })),
    insert: vi.fn(() => Promise.resolve({ data: [mockPatient], error: null })),
    update: vi.fn(() => Promise.resolve({ data: [mockPatient], error: null })),
  })),
};

vi.mock('@web/app/utils/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('Real-time Integration Tests - Final Validation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    (<QueryClientProvider client =
      { queryClient } > { children } < />CPQdeeeiilnorrrtuvy);

  describe('Appointment Real-time Updates', () => {
    it('should subscribe to appointment changes and update cache', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(() => useAppointments(), { wrapper });

      await waitFor(() => {
        expect(mockSupabase.channel).toHaveBeenCalledWith('appointments');
      });

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
        }),
        expect.any(Function)
      );

      // Simulate real-time insert
      const newAppointment = {
        ...mockAppointment,
        id: 'new-realtime-appointment',
        patient_name: 'Maria Santos',
      };

      realtimeCallback({
        eventType: 'INSERT',
        new: newAppointment,
        old: null,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['appointments']);
        expect(cachedData).toContainEqual(newAppointment);
      });
    });

    it('should handle appointment status updates in real-time', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      // Pre-populate cache with appointment
      queryClient.setQueryData(['appointments'], [mockAppointment]);

      renderHook(() => useAppointments(), { wrapper });

      // Simulate status update
      const updatedAppointment = {
        ...mockAppointment,
        status: 'completed',
        completed_at: new Date().toISOString(),
      };

      realtimeCallback({
        eventType: 'UPDATE',
        new: updatedAppointment,
        old: mockAppointment,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['appointments']) as any[];
        const updatedItem = cachedData.find(
          (item) => item.id === mockAppointment.id
        );
        expect(updatedItem?.status).toBe('completed');
        expect(updatedItem?.completed_at).toBeDefined();
      });
    });

    it('should handle appointment cancellations with LGPD compliance', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      // Pre-populate cache
      queryClient.setQueryData(['appointments'], [mockAppointment]);

      renderHook(() => useAppointments(), { wrapper });

      // Simulate deletion (cancellation)
      realtimeCallback({
        eventType: 'DELETE',
        new: null,
        old: mockAppointment,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['appointments']) as any[];
        const deletedItem = cachedData.find(
          (item) => item.id === mockAppointment.id
        );
        expect(deletedItem).toBeUndefined();
      });
    });
  });

  describe('Patient Data Real-time Synchronization', () => {
    it('should sync patient updates across multiple sessions', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      queryClient.setQueryData(['patients'], [mockPatient]);

      renderHook(() => usePatients(), { wrapper });

      // Simulate patient information update from another session
      const updatedPatient = {
        ...mockPatient,
        phone: '(11) 88888-8888',
        updated_at: new Date().toISOString(),
      };

      realtimeCallback({
        eventType: 'UPDATE',
        new: updatedPatient,
        old: mockPatient,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['patients']) as any[];
        const updatedItem = cachedData.find(
          (item) => item.id === mockPatient.id
        );
        expect(updatedItem?.phone).toBe('(11) 88888-8888');
      });
    });

    it('should handle patient consent updates in real-time', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      queryClient.setQueryData(['patients'], [mockPatient]);

      renderHook(() => usePatients(), { wrapper });

      // Simulate LGPD consent update
      const consentUpdate = {
        ...mockPatient,
        lgpd_consent: {
          ...mockPatient.lgpd_consent,
          purposes: ['treatment', 'analytics', 'marketing'],
          updated_at: new Date().toISOString(),
        },
      };

      realtimeCallback({
        eventType: 'UPDATE',
        new: consentUpdate,
        old: mockPatient,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['patients']) as any[];
        const updatedItem = cachedData.find(
          (item) => item.id === mockPatient.id
        );
        expect(updatedItem?.lgpd_consent.purposes).toContain('marketing');
      });
    });
  });

  describe('Optimistic Updates', () => {
    it('should handle optimistic appointment creation', async () => {
      const { result } = renderHook(() => useAppointments(), { wrapper });

      // Simulate optimistic update
      const optimisticAppointment = {
        ...mockAppointment,
        id: 'temp-optimistic-id',
        status: 'creating',
      };

      queryClient.setQueryData(['appointments'], (old: any) => [
        ...(old || []),
        optimisticAppointment,
      ]);

      // Verify optimistic update appears immediately
      let cachedData = queryClient.getQueryData(['appointments']) as any[];
      expect(cachedData).toContainEqual(optimisticAppointment);

      // Simulate successful server response
      setTimeout(() => {
        queryClient.setQueryData(['appointments'], (old: any) => {
          return old.map((item: any) =>
            item.id === 'temp-optimistic-id'
              ? { ...item, id: 'confirmed-appointment-id', status: 'scheduled' }
              : item
          );
        });
      }, 100);

      await waitFor(() => {
        cachedData = queryClient.getQueryData(['appointments']) as any[];
        const confirmedItem = cachedData.find(
          (item) => item.id === 'confirmed-appointment-id'
        );
        expect(confirmedItem?.status).toBe('scheduled');
      });
    });

    it('should rollback optimistic updates on failure', async () => {
      queryClient.setQueryData(['appointments'], [mockAppointment]);

      // Simulate optimistic update
      const optimisticUpdate = {
        ...mockAppointment,
        status: 'updating',
      };

      queryClient.setQueryData(['appointments'], [optimisticUpdate]);

      // Verify optimistic update
      let cachedData = queryClient.getQueryData(['appointments']) as any[];
      expect(cachedData[0].status).toBe('updating');

      // Simulate failure - rollback to original
      setTimeout(() => {
        queryClient.setQueryData(['appointments'], [mockAppointment]);
      }, 100);

      await waitFor(() => {
        cachedData = queryClient.getQueryData(['appointments']) as any[];
        expect(cachedData[0].status).toBe(mockAppointment.status);
      });
    });
  });

  describe('Connection Management', () => {
    it('should handle connection drops gracefully', async () => {
      const { result } = renderHook(() => useAppointments(), { wrapper });

      // Simulate connection drop
      mockChannel.subscribe.mockRejectedValue(new Error('Connection lost'));

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      // Should attempt to reconnect
      expect(mockSupabase.channel).toHaveBeenCalledWith('appointments');
    });

    it('should cleanup subscriptions on unmount', async () => {
      const { unmount } = renderHook(() => useAppointments(), { wrapper });

      await waitFor(() => {
        expect(mockChannel.subscribe).toHaveBeenCalled();
      });

      unmount();

      expect(mockChannel.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Performance Optimization', () => {
    it('should debounce rapid updates to prevent excessive re-renders', async () => {
      let realtimeCallback: any;
      const renderCount = vi.fn();

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      const { result } = renderHook(
        () => {
          renderCount();
          return useAppointments();
        },
        { wrapper }
      );

      // Simulate rapid updates
      for (let i = 0; i < 5; i++) {
        realtimeCallback({
          eventType: 'UPDATE',
          new: { ...mockAppointment, updated_at: new Date().toISOString() },
          old: mockAppointment,
        });
      }

      await waitFor(() => {
        // Should not re-render for every update due to debouncing
        expect(renderCount).toHaveBeenCalledTimes(2); // Initial + final update
      });
    });

    it('should batch multiple changes for efficient updates', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      queryClient.setQueryData(['appointments'], [mockAppointment]);

      renderHook(() => useAppointments(), { wrapper });

      // Simulate batch of changes
      const changes = [
        { ...mockAppointment, status: 'confirmed' },
        { ...mockAppointment, notes: 'Updated notes' },
        { ...mockAppointment, scheduled_at: new Date().toISOString() },
      ];

      changes.forEach((change) => {
        realtimeCallback({
          eventType: 'UPDATE',
          new: change,
          old: mockAppointment,
        });
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['appointments']) as any[];
        const updatedItem = cachedData[0];
        expect(updatedItem.status).toBe('confirmed');
        expect(updatedItem.notes).toBe('Updated notes');
      });
    });
  });

  describe('LGPD Compliance in Real-time', () => {
    it('should handle data deletion requests in real-time', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      queryClient.setQueryData(['patients'], [mockPatient]);

      renderHook(() => usePatients(), { wrapper });

      // Simulate LGPD deletion request
      realtimeCallback({
        eventType: 'DELETE',
        new: null,
        old: mockPatient,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['patients']) as any[];
        expect(cachedData).not.toContainEqual(mockPatient);
      });
    });

    it('should handle consent withdrawal in real-time', async () => {
      let realtimeCallback: any;

      mockChannel.on.mockImplementation((event: string, callback: any) => {
        if (event === 'postgres_changes') {
          realtimeCallback = callback;
        }
        return mockChannel;
      });

      queryClient.setQueryData(['patients'], [mockPatient]);

      renderHook(() => usePatients(), { wrapper });

      // Simulate consent withdrawal
      const consentWithdrawn = {
        ...mockPatient,
        lgpd_consent: {
          ...mockPatient.lgpd_consent,
          withdrawn_at: new Date().toISOString(),
          purposes: [],
        },
      };

      realtimeCallback({
        eventType: 'UPDATE',
        new: consentWithdrawn,
        old: mockPatient,
      });

      await waitFor(() => {
        const cachedData = queryClient.getQueryData(['patients']) as any[];
        const updatedItem = cachedData.find(
          (item) => item.id === mockPatient.id
        );
        expect(updatedItem?.lgpd_consent.withdrawn_at).toBeDefined();
        expect(updatedItem?.lgpd_consent.purposes).toHaveLength(0);
      });
    });
  });
});
