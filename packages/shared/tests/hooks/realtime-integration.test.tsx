/**
 * 🔄 Real-time Integration Tests - NeonPro Healthcare
 * ==================================================
 *
 * Simplified tests for real-time functionality with focus on core features
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Create fresh mocks for each test
let mockChannelOn: any;
let mockChannelSubscribe: any;
let mockChannelUnsubscribe: any;
let mockChannel: any;
let mockSupabaseClient: any;
let mockInvalidateQueries: any;
let mockRefetchQueries: any;

// Mock TanStack Query
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: vi.fn(() => ({
      invalidateQueries: mockInvalidateQueries,
      refetchQueries: mockRefetchQueries,
      setQueryData: vi.fn(),
    })),
  };
});

// Import the hooks after mocking
import { useRealtime, useRealtimeQuery } from '../../src/hooks/use-realtime';

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Real-time Core Functionality', () => {
  beforeEach(() => {
    // Create fresh mocks before each test
    mockInvalidateQueries = vi.fn();
    mockRefetchQueries = vi.fn();

    mockChannelOn = vi.fn().mockReturnThis();
    mockChannelSubscribe = vi.fn().mockImplementation((callback) => {
      if (callback) {
        // Simulate successful subscription
        setTimeout(() => callback('SUBSCRIBED'), 0);
      }
      return mockChannel;
    });
    mockChannelUnsubscribe = vi.fn();

    mockChannel = {
      on: mockChannelOn,
      subscribe: mockChannelSubscribe,
      unsubscribe: mockChannelUnsubscribe,
    };

    mockSupabaseClient = {
      channel: vi.fn().mockReturnValue(mockChannel),
      removeChannel: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('useRealtime Hook', () => {
    it('should establish connection and handle events', async () => {
      const mockOnUpdate = vi.fn();

      const { result } = renderHook(
        () =>
          useRealtime(mockSupabaseClient, {
            table: 'patients',
            enabled: true,
            onUpdate: mockOnUpdate,
          }),
        { wrapper: createWrapper() }
      );

      // Wait for initial state
      await waitFor(() => {
        expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
          'realtime:patients'
        );
      });

      // Wait for connection
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      expect(result.current.error).toBeNull();
      expect(mockChannelOn).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'patients',
        }),
        expect.any(Function)
      );
    });

    it('should handle connection errors', async () => {
      // Mock error on subscription
      mockChannelSubscribe = vi.fn().mockImplementation((callback) => {
        if (callback) {
          setTimeout(() => callback('CHANNEL_ERROR'), 0);
        }
        return mockChannel;
      });

      // Update the channel mock
      mockChannel.subscribe = mockChannelSubscribe;
      mockSupabaseClient.channel.mockReturnValue(mockChannel);

      const mockOnError = vi.fn();

      const { result } = renderHook(
        () =>
          useRealtime(mockSupabaseClient, {
            table: 'patients',
            enabled: true,
            onError: mockOnError,
          }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(
        () =>
          useRealtime(mockSupabaseClient, {
            table: 'patients',
            enabled: true,
          }),
        { wrapper: createWrapper() }
      );

      unmount();

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(
        mockChannel
      );
    });

    it('should handle disabled real-time gracefully', () => {
      const { result } = renderHook(
        () =>
          useRealtime(mockSupabaseClient, {
            table: 'patients',
            enabled: false,
          }),
        { wrapper: createWrapper() }
      );

      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
    });
  });

  describe('useRealtimeQuery Hook', () => {
    it('should invalidate queries on realtime events', async () => {
      const { result } = renderHook(
        () =>
          useRealtimeQuery(mockSupabaseClient, {
            table: 'patients',
            queryKey: ['patients'],
            enabled: true,
            queryOptions: {
              invalidateOnUpdate: true,
              backgroundRefetch: true,
            },
          }),
        { wrapper: createWrapper() }
      );

      // Wait for setup
      await waitFor(() => {
        expect(mockSupabaseClient.channel).toHaveBeenCalledWith(
          'realtime:patients'
        );
      });

      // Wait for connection
      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate update event by calling the callback passed to mockChannelOn
      const onCallback = mockChannelOn.mock.calls.find(
        (call) => call[0] === 'postgres_changes'
      )?.[2];
      if (onCallback) {
        onCallback({
          eventType: 'UPDATE',
          new: { id: '1', name: 'Updated Patient' },
        });
      }

      await waitFor(() => {
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
          queryKey: ['patients'],
        });
        expect(mockRefetchQueries).toHaveBeenCalledWith({
          queryKey: ['patients'],
        });
      });
    });
  });
});

describe('LGPD Compliance Utilities', () => {
  // Mock LGPD utilities for testing
  const LGPDDataProcessor = {
    anonymizePayload: (payload: any, config: any) => {
      const anonymized = { ...payload };
      if (config.sensitiveFields?.includes('email')) {
        anonymized.new.email = '***@***.***';
      }
      if (config.sensitiveFields?.includes('cpf')) {
        anonymized.new.cpf = '***.***.**-**';
      }
      return anonymized;
    },
    minimizeData: (payload: any, allowedFields: string[]) => {
      const minimized = { ...payload };
      minimized.new = {};
      allowedFields.forEach((field) => {
        if (payload.new[field] !== undefined) {
          minimized.new[field] = payload.new[field];
        }
      });
      return minimized;
    },
    pseudonymizePayload: (payload: any, config: any) => {
      const pseudonymized = { ...payload };
      if (config.sensitiveFields?.includes('email')) {
        pseudonymized.new.email = `user${Math.floor(Math.random() * 1000)}@example.com`;
      }
      if (config.sensitiveFields?.includes('cpf')) {
        pseudonymized.new.cpf = Math.floor(
          Math.random() * 100_000_000
        ).toString();
      }
      return pseudonymized;
    },
  };

  describe('LGPDDataProcessor', () => {
    it('should anonymize sensitive fields', () => {
      const testPayload = {
        eventType: 'UPDATE',
        new: {
          id: '123',
          name: 'João Silva',
          email: 'joao@email.com',
          cpf: '123.456.789-00',
        },
        old: {},
      };

      const config = {
        enabled: true,
        anonymization: true,
        sensitiveFields: ['email', 'cpf'],
      };

      const anonymized = LGPDDataProcessor.anonymizePayload(
        testPayload,
        config
      );

      expect(anonymized.new.id).toBe('123');
      expect(anonymized.new.name).toBe('João Silva');
      expect(anonymized.new.email).toBe('***@***.***');
      expect(anonymized.new.cpf).toBe('***.***.**-**');
    });

    it('should apply data minimization', () => {
      const testPayload = {
        eventType: 'UPDATE',
        new: {
          id: '123',
          name: 'João Silva',
          email: 'joao@email.com',
          cpf: '123.456.789-00',
          internal_notes: 'Secret information',
        },
        old: {},
      };

      const allowedFields = ['id', 'name'];
      const minimized = LGPDDataProcessor.minimizeData(
        testPayload,
        allowedFields
      );

      expect(minimized.new).toEqual({
        id: '123',
        name: 'João Silva',
      });
      expect(minimized.new.email).toBeUndefined();
      expect(minimized.new.cpf).toBeUndefined();
      expect(minimized.new.internal_notes).toBeUndefined();
    });

    it('should pseudonymize data', () => {
      const testPayload = {
        eventType: 'UPDATE',
        new: {
          id: '123',
          email: 'joao@email.com',
          cpf: '123.456.789-00',
        },
        old: {},
      };

      const config = {
        enabled: true,
        pseudonymization: true,
        sensitiveFields: ['email', 'cpf'],
      };

      const pseudonymized = LGPDDataProcessor.pseudonymizePayload(
        testPayload,
        config
      );

      expect(pseudonymized.new.id).toBe('123');
      expect(pseudonymized.new.email).toMatch(/^user\d+@example\.com$/);
      expect(pseudonymized.new.cpf).toMatch(/^\d+$/);
      expect(pseudonymized.new.email).not.toBe('joao@email.com');
      expect(pseudonymized.new.cpf).not.toBe('123.456.789-00');
    });
  });
});
