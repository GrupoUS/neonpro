/**
 * 🔄 Real-time Integration Tests - NeonPro Healthcare
 * ==================================================
 *
 * Comprehensive tests for real-time functionality with LGPD compliance
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock Supabase
const mockChannel = {
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
};

const mockSupabaseClient = {
  channel: vi.fn().mockReturnValue(mockChannel),
  removeChannel: vi.fn(),
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
};

// Mock hooks
vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
      refetchQueries: vi.fn(),
      setQueryData: vi.fn(),
    }),
  };
});

// Import after mocking
import { useRealtime, useRealtimeQuery } from '../../src/hooks/use-realtime';
import { 
  usePatientRealtime, 
  useAppointmentRealtime, 
  useProfessionalRealtime 
} from '../../src/hooks/use-healthcare-realtime';
import { 
  useLGPDRealtime, 
  useLGPDPatientRealtime,
  useLGPDConsentStatus 
} from '../../src/hooks/use-lgpd-realtime';
import { 
  LGPDDataCategory, 
  LGPDProcessingPurpose,
  LGPDConsentStatus,
  LGPDDataProcessor,
  LGPDConsentValidator,
} from '../../src/compliance/lgpd-realtime';

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Real-time Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useRealtime Hook', () => {
    it('should establish connection and handle events', async () => {
      const mockOnUpdate = vi.fn();
      
      const { result } = renderHook(
        () => useRealtime(mockSupabaseClient as any, {
          table: 'patients',
          enabled: true,
          onUpdate: mockOnUpdate,
        }),
        { wrapper: createWrapper() }
      );

      // Should start disconnected
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeNull();

      // Verify channel setup
      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('realtime:patients');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: '*',
          schema: 'public',
          table: 'patients',
        }),
        expect.any(Function)
      );

      // Simulate subscription success
      const subscribeCallback = mockChannel.subscribe.mock.calls[0]?.[0];
      if (subscribeCallback) {
        subscribeCallback('SUBSCRIBED');
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      // Simulate realtime event
      const eventCallback = mockChannel.on.mock.calls[0]?.[2];
      if (eventCallback) {
        eventCallback({
          eventType: 'UPDATE',
          new: { id: '1', name: 'Test Patient' },
          old: { id: '1', name: 'Old Name' },
        });
      }

      expect(mockOnUpdate).toHaveBeenCalled();
    });

    it('should handle connection errors', async () => {
      const mockOnError = vi.fn();
      
      const { result } = renderHook(
        () => useRealtime(mockSupabaseClient as any, {
          table: 'patients',
          enabled: true,
          onError: mockOnError,
        })
      );

      // Simulate connection error
      const subscribeCallback = mockChannel.subscribe.mock.calls[0]?.[0];
      if (subscribeCallback) {
        subscribeCallback('CHANNEL_ERROR');
      }

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
      });

      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(
        () => useRealtime(mockSupabaseClient as any, {
          table: 'patients',
          enabled: true,
        })
      );

      unmount();

      expect(mockSupabaseClient.removeChannel).toHaveBeenCalledWith(mockChannel);
    });
  });

  describe('useRealtimeQuery Hook', () => {
    it('should invalidate queries on realtime events', async () => {
      const mockQueryClient = {
        invalidateQueries: vi.fn(),
        refetchQueries: vi.fn(),
      };

      vi.mocked(require('@tanstack/react-query').useQueryClient).mockReturnValue(mockQueryClient);

      const { result } = renderHook(
        () => useRealtimeQuery(mockSupabaseClient as any, {
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

      // Simulate update event
      const eventCallback = mockChannel.on.mock.calls[0]?.[2];
      if (eventCallback) {
        eventCallback({
          eventType: 'UPDATE',
          new: { id: '1', name: 'Updated Patient' },
        });
      }

      await waitFor(() => {
        expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
          queryKey: ['patients']
        });
        expect(mockQueryClient.refetchQueries).toHaveBeenCalledWith({
          queryKey: ['patients']
        });
      });
    });
  });
});

describe('Healthcare-Specific Real-time Hooks', () => {
  describe('usePatientRealtime', () => {
    it('should setup patient-specific realtime subscription', async () => {
      const mockOnPatientUpdate = vi.fn();
      
      const { result } = renderHook(
        () => usePatientRealtime(mockSupabaseClient as any, {
          patientId: 'patient-123',
          enabled: true,
          onPatientUpdate: mockOnPatientUpdate,
        }),
        { wrapper: createWrapper() }
      );

      expect(mockSupabaseClient.channel).toHaveBeenCalledWith('realtime:patients');
      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          table: 'patients',
          filter: 'id=eq.patient-123',
        }),
        expect.any(Function)
      );
    });

    it('should handle clinic-level patient updates', async () => {
      const { result } = renderHook(
        () => usePatientRealtime(mockSupabaseClient as any, {
          clinicId: 'clinic-456',
          enabled: true,
        }),
        { wrapper: createWrapper() }
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          table: 'patients',
          filter: 'clinic_id=eq.clinic-456',
        }),
        expect.any(Function)
      );
    });
  });

  describe('useAppointmentRealtime', () => {
    it('should setup appointment-specific subscription with date range', async () => {
      const dateRange = {
        start: '2024-01-01T00:00:00Z',
        end: '2024-12-31T23:59:59Z',
      };

      const { result } = renderHook(
        () => useAppointmentRealtime(mockSupabaseClient as any, {
          professionalId: 'prof-789',
          dateRange,
          enabled: true,
        }),
        { wrapper: createWrapper() }
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          table: 'appointments',
          filter: expect.stringContaining('professional_id=eq.prof-789'),
        }),
        expect.any(Function)
      );
    });
  });

  describe('useProfessionalRealtime', () => {
    it('should setup professional-specific subscription', async () => {
      const { result } = renderHook(
        () => useProfessionalRealtime(mockSupabaseClient as any, {
          professionalId: 'prof-123',
          specialty: 'dermatology',
          enabled: true,
        }),
        { wrapper: createWrapper() }
      );

      expect(mockChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          table: 'professionals',
          filter: expect.stringContaining('id=eq.prof-123'),
        }),
        expect.any(Function)
      );
    });
  });
});

describe('LGPD Compliance', () => {
  describe('LGPDDataProcessor', () => {
    it('should anonymize sensitive fields', () => {
      const testPayload = {
        eventType: 'UPDATE',
        new: {
          id: '123',
          name: 'João Silva',
          email: 'joao@email.com',
          cpf: '123.456.789-00',
          phone: '(11) 99999-9999',
          address: 'Rua das Flores, 123',
        },
        old: {},
      };

      const config = {
        enabled: true,
        anonymization: true,
        sensitiveFields: ['email', 'cpf', 'phone', 'address'],
      } as any;

      const anonymized = LGPDDataProcessor.anonymizePayload(testPayload as any, config);

      expect(anonymized.new.id).toBe('123');
      expect(anonymized.new.name).toBe('João Silva');
      expect(anonymized.new.email).toBe('***@***.***');
      expect(anonymized.new.cpf).toBe('***.***.**-**');
      expect(anonymized.new.phone).toBe('***-***-****');
      expect(anonymized.new.address).toBe('*** *** *** ***');
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
      const minimized = LGPDDataProcessor.minimizeData(testPayload as any, allowedFields);

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
      } as any;

      const pseudonymized = LGPDDataProcessor.pseudonymizePayload(testPayload as any, config);

      expect(pseudonymized.new.id).toBe('123');
      expect(pseudonymized.new.email).toMatch(/^user\d+@example\.com$/);
      expect(pseudonymized.new.cpf).toMatch(/^\d{11}$/);
      expect(pseudonymized.new.email).not.toBe('joao@email.com');
      expect(pseudonymized.new.cpf).not.toBe('123.456.789-00');
    });
  });

  describe('useLGPDConsentStatus', () => {
    beforeEach(() => {
      // Mock consent validator
      vi.spyOn(LGPDConsentValidator, 'validateConsent').mockResolvedValue({
        valid: true,
        status: LGPDConsentStatus.GRANTED,
      });
    });

    it('should validate consent for healthcare delivery', async () => {
      const { result } = renderHook(() => 
        useLGPDConsentStatus(
          'user-123',
          LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
          LGPDDataCategory.SENSITIVE
        )
      );

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasConsent).toBe(true);
        expect(result.current.consentStatus).toBe(LGPDConsentStatus.GRANTED);
      });

      expect(LGPDConsentValidator.validateConsent).toHaveBeenCalledWith(
        'user-123',
        LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
        LGPDDataCategory.SENSITIVE
      );
    });

    it('should handle consent denial', async () => {
      vi.spyOn(LGPDConsentValidator, 'validateConsent').mockResolvedValue({
        valid: false,
        status: LGPDConsentStatus.REVOKED,
        reason: 'User revoked consent',
      });

      const { result } = renderHook(() => 
        useLGPDConsentStatus(
          'user-123',
          LGPDProcessingPurpose.ANALYTICS,
          LGPDDataCategory.PERSONAL
        )
      );

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(false);
        expect(result.current.consentStatus).toBe(LGPDConsentStatus.REVOKED);
        expect(result.current.error).toBeInstanceOf(Error);
      });
    });
  });

  describe('useLGPDRealtime', () => {
    it('should process data with LGPD compliance', async () => {
      const mockOnDataProcessed = vi.fn();
      const mockOnConsentDenied = vi.fn();

      // Mock consent as granted
      vi.spyOn(LGPDConsentValidator, 'validateConsent').mockResolvedValue({
        valid: true,
        status: LGPDConsentStatus.GRANTED,
      });

      const { result } = renderHook(
        () => useLGPDRealtime(mockSupabaseClient as any, {
          table: 'patients',
          userId: 'user-123',
          dataCategory: LGPDDataCategory.SENSITIVE,
          processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
          enabled: true,
          lgpdConfig: {
            enabled: true,
            dataCategory: LGPDDataCategory.SENSITIVE,
            processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
            anonymization: true,
            sensitiveFields: ['email', 'cpf'],
            auditLogging: true,
            consentRequired: true,
            dataMinimization: false,
            pseudonymization: false,
          },
          onDataProcessed: mockOnDataProcessed,
          onConsentDenied: mockOnConsentDenied,
          validateConsent: true,
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
      });

      // Simulate realtime event
      const eventCallback = mockChannel.on.mock.calls[0]?.[2];
      if (eventCallback) {
        eventCallback({
          eventType: 'UPDATE',
          new: {
            id: '123',
            name: 'João Silva',
            email: 'joao@email.com',
            cpf: '123.456.789-00',
          },
        });
      }

      await waitFor(() => {
        expect(mockOnDataProcessed).toHaveBeenCalled();
        expect(mockOnConsentDenied).not.toHaveBeenCalled();
      });
    });

    it('should deny processing when consent is revoked', async () => {
      const mockOnConsentDenied = vi.fn();

      // Mock consent as revoked
      vi.spyOn(LGPDConsentValidator, 'validateConsent').mockResolvedValue({
        valid: false,
        status: LGPDConsentStatus.REVOKED,
        reason: 'User revoked consent',
      });

      const { result } = renderHook(
        () => useLGPDRealtime(mockSupabaseClient as any, {
          table: 'patients',
          userId: 'user-123',
          dataCategory: LGPDDataCategory.SENSITIVE,
          processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
          enabled: true,
          lgpdConfig: {
            enabled: true,
            dataCategory: LGPDDataCategory.SENSITIVE,
            processingPurpose: LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
            consentRequired: true,
            auditLogging: true,
            anonymization: false,
            dataMinimization: false,
            pseudonymization: false,
            sensitiveFields: [],
          },
          onConsentDenied: mockOnConsentDenied,
          validateConsent: true,
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(false);
        expect(result.current.isConnected).toBe(false); // Should not connect without consent
      });

      expect(mockSupabaseClient.channel).not.toHaveBeenCalled(); // Should not establish connection
    });
  });

  describe('useLGPDPatientRealtime', () => {
    it('should setup LGPD-compliant patient realtime with strict mode', async () => {
      vi.spyOn(LGPDConsentValidator, 'validateConsent').mockResolvedValue({
        valid: true,
        status: LGPDConsentStatus.GRANTED,
      });

      const { result } = renderHook(
        () => useLGPDPatientRealtime(mockSupabaseClient as any, {
          userId: 'user-123',
          patientId: 'patient-456',
          enabled: true,
          strictMode: true,
        }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.hasConsent).toBe(true);
      });

      expect(LGPDConsentValidator.validateConsent).toHaveBeenCalledWith(
        'user-123',
        LGPDProcessingPurpose.HEALTHCARE_DELIVERY,
        LGPDDataCategory.SENSITIVE
      );
    });
  });
});

describe('Error Handling and Edge Cases', () => {
  it('should handle malformed realtime payloads', async () => {
    const mockOnError = vi.fn();

    const { result } = renderHook(
      () => useRealtime(mockSupabaseClient as any, {
        table: 'patients',
        enabled: true,
        onError: mockOnError,
      })
    );

    // Simulate malformed event
    const eventCallback = mockChannel.on.mock.calls[0]?.[2];
    if (eventCallback) {
      eventCallback(null); // Invalid payload
    }

    // Should handle gracefully without crashing
    expect(mockOnError).not.toHaveBeenCalled(); // No error expected for null payload
  });

  it('should handle network disconnections', async () => {
    const { result } = renderHook(
      () => useRealtime(mockSupabaseClient as any, {
        table: 'patients',
        enabled: true,
      })
    );

    // Simulate network disconnection
    const subscribeCallback = mockChannel.subscribe.mock.calls[0]?.[0];
    if (subscribeCallback) {
      subscribeCallback('CHANNEL_ERROR');
    }

    await waitFor(() => {
      expect(result.current.isConnected).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  it('should handle disabled real-time gracefully', () => {
    const { result } = renderHook(
      () => useRealtime(mockSupabaseClient as any, {
        table: 'patients',
        enabled: false,
      })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockSupabaseClient.channel).not.toHaveBeenCalled();
  });
});