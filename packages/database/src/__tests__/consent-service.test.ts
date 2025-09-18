import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsentService } from '../services/consent-service';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
} as any;

describe('ConsentService - Database Schema Compliance', () => {
  let consentService: ConsentService;

  beforeEach(() => {
    vi.clearAllMocks();
    consentService = new ConsentService(mockSupabase);
  });

  describe('requestConsent', () => {
    it('should create consent record using direct database operations', async () => {
      // Arrange
      const mockPatient = {
        id: 'patient-1',
        clinic_id: 'clinic-1',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        }),
      });

      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'consent-1' },
            error: null,
          }),
        }),
      });

      mockSupabase.from = vi.fn()
        .mockReturnValueOnce({ select: mockSelect }) // For patient lookup
        .mockReturnValueOnce({ insert: mockInsert }); // For consent insert

      // Act
      const result = await consentService.requestConsent(
        'user-1',
        ['internal', 'sensitive'],
        'telemedicine',
        'session-1',
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith('consent_records');
      expect(mockInsert).toHaveBeenCalledWith({
        patient_id: 'patient-1',
        clinic_id: 'clinic-1',
        consent_type: 'webrtc',
        purpose: 'telemedicine',
        legal_basis: 'consent',
        status: 'pending',
        data_categories: ['internal', 'sensitive'],
        processing_purposes: ['telemedicine'],
        collection_method: 'digital',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      });
    });

    it('should handle patient lookup failure', async () => {
      // Arrange
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Patient not found' },
          }),
        }),
      });

      mockSupabase.from = vi.fn().mockReturnValue({
        select: mockSelect,
      });

      // Act & Assert
      await expect(
        consentService.requestConsent('user-1', ['internal'], 'telemedicine', 'session-1'),
      ).rejects.toThrow('Patient not found for user');
    });
  });

  describe('verifyConsent', () => {
    it('should verify consent exists and is valid', async () => {
      // Arrange
      const mockPatient = {
        id: 'patient-1',
        clinic_id: 'clinic-1',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        }),
      });

      const mockConsentSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: {
                    id: 'consent-1',
                    status: 'granted',
                    expires_at: '2025-12-31T23:59:59Z',
                  },
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockSupabase.from = vi.fn()
        .mockReturnValueOnce({ select: mockSelect }) // For patient lookup
        .mockReturnValueOnce({ select: mockConsentSelect }); // For consent verification

      // Act
      const result = await consentService.verifyConsent(
        'user-1',
        'internal',
        'session-1',
      );

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when no consent exists', async () => {
      // Arrange
      const mockPatient = {
        id: 'patient-1',
        clinic_id: 'clinic-1',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        }),
      });

      const mockConsentSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      });

      mockSupabase.from = vi.fn()
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ select: mockConsentSelect });

      // Act
      const result = await consentService.verifyConsent(
        'user-1',
        'internal',
        'session-1',
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getConsentHistory', () => {
    it('should retrieve consent history from audit_logs table', async () => {
      // Arrange
      const mockPatient = {
        id: 'patient-1',
        clinic_id: 'clinic-1',
      };

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        }),
      });

      const mockAuditSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'audit-1',
                  action: 'consent-given',
                  user_id: 'user-1',
                  created_at: '2023-01-01T00:00:00Z',
                  resource_type: 'consent',
                  resource: 'Consent given for telemedicine',
                  clinic_id: 'clinic-1',
                },
              ],
              error: null,
            }),
          }),
        }),
      });

      mockSupabase.from = vi.fn()
        .mockReturnValueOnce({ select: mockSelect }) // For patient lookup
        .mockReturnValueOnce({ select: mockAuditSelect }); // For audit logs

      // Act
      const result = await consentService.getConsentHistory('user-1');

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'audit-1',
        sessionId: 'unknown',
        eventType: 'consent-given',
        timestamp: '2023-01-01T00:00:00Z',
        userId: 'user-1',
        userRole: 'patient',
        dataClassification: 'internal',
        description: 'Consent given for telemedicine',
        ipAddress: 'unknown',
        userAgent: 'unknown',
        clinicId: 'clinic-1',
        complianceCheck: {
          isCompliant: true,
          violations: [],
          riskLevel: 'low',
        },
      });
    });
  });
});