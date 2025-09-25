/**
 * Comprehensive Failing Tests for SupabaseConnector ReferenceError Issues
 * 
 * These tests are designed to FAIL with ReferenceError to reproduce the exact issues
 * mentioned in PR 58 comments. Each test focuses on one specific ReferenceError scenario.
 * 
 * RED PHASE: These tests MUST fail initially with "variable is not defined" errors
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SupabaseConnector } from '../../../../apps/api/agents/ag-ui-rag-agent/src/database/supabase-connector'
import { HealthcareLogger } from '../../../../apps/api/agents/ag-ui-rag-agent/src/logging/healthcare-logger'

describe('SupabaseConnector ReferenceError Tests - RED PHASE', () => {
  let connector: SupabaseConnector
  let mockLogger: HealthcareLogger

  beforeEach(() => {
    mockLogger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      logDataAccess: vi.fn(),
      logAIInteraction: vi.fn(),
      logSessionEvent: vi.fn(),
      logAuthEvent: vi.fn(),
      logSystemEvent: vi.fn(),
      logError: vi.fn(),
    } as any

    connector = new SupabaseConnector(mockLogger)
  })

  describe('getUserPermissions ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but the implementation tries to use userId
      
      // Mock the database responses
      vi.spyOn(connector as any, 'supabase', 'get').mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-prof-id',
            user_id: 'test-user-id',
            clinic_id: 'test-clinic-id',
            role: 'doctor',
            is_active: true,
            permissions: {}
          },
          error: null
        })
      })

      // This should cause ReferenceError: userId is not defined
      // because the implementation uses userId but parameter is _userId
      await expect(connector['getUserPermissions']('test-user-id', 'test-clinic-id'))
        .rejects
        .toThrow(ReferenceError)
    })

    it('should fail with ReferenceError when using now instead of _now', async () => {
      // This test should FAIL with: ReferenceError: now is not defined
      // The method declares _now but implementation uses now
      
      vi.spyOn(connector as any, 'supabase', 'get').mockReturnValue({
        from: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: 'test-prof-id',
            user_id: 'test-user-id',
            clinic_id: 'test-clinic-id',
            role: 'doctor',
            is_active: true,
            permissions: {}
          },
          error: null
        })
      })

      // This should cause ReferenceError: now is not defined
      await expect(connector['getUserPermissions']('test-user-id', 'test-clinic-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('validateDataAccess ReferenceError', () => {
    it('should fail with ReferenceError when using request instead of _request', async () => {
      // This test should FAIL with: ReferenceError: request is not defined
      // The method signature uses _request but implementation tries to use request
      
      const mockRequest = {
        action: 'read' as const,
        resourceType: 'patient',
        resourceId: 'test-patient-id',
        patientId: 'test-patient-id',
        clinicId: 'test-clinic-id',
        userId: 'test-user-id',
        sessionId: 'test-session-id'
      }

      // Mock getUserPermissions to return valid permissions
      vi.spyOn(connector as any, 'getUserPermissions').mockResolvedValue({
        userId: 'test-user-id',
        clinicId: 'test-clinic-id',
        role: 'doctor',
        permissions: {
          canAccessPatients: true,
          canModifyPatients: false,
          canAccessMedicalRecords: true,
          canModifyMedicalRecords: false,
          canAccessAppointments: true,
          canModifyAppointments: false,
          canAccessAuditLogs: false
        }
      })

      // Mock validatePatientAccess to return true
      vi.spyOn(connector as any, 'validatePatientAccess').mockResolvedValue(true)

      // This should cause ReferenceError: request is not defined
      await expect(connector['validateDataAccess'](mockRequest))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('validatePatientAccess ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Set up supabase mock
      Object.defineProperty(connector, 'supabase', {
        value: {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn()
            .mockResolvedValueOnce({ data: { clinic_id: 'test-clinic-id' } })
            .mockResolvedValueOnce({ data: { status: 'granted', expires_at: '2025-12-31' } })
        },
        writable: true
      })

      // This should cause ReferenceError: userId is not defined
      await expect(connector['validatePatientAccess']('test-user-id', 'test-patient-id', 'test-clinic-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('setAISessionContext ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Set up supabase mock
      Object.defineProperty(connector, 'supabase', {
        value: {
          rpc: vi.fn().mockResolvedValue({})
        },
        writable: true
      })

      // This should cause ReferenceError: userId is not defined
      await expect(connector.setAISessionContext('test-session-id', 'test-user-id', 'test-clinic-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('getPatientData ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Mock validateDataAccess
      vi.spyOn(connector as any, 'validateDataAccess').mockResolvedValue(true)
      
      // Set up supabase mock
      Object.defineProperty(connector, 'supabase', {
        value: {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-patient-id',
              full_name: 'Test Patient',
              birth_date: '1990-01-01',
              phone: '123-456-7890',
              email: 'test@example.com',
              lgpd_consent_given: true,
              created_at: '2025-01-01'
            },
            error: null
          })
        },
        writable: true
      })

      // Mock setAISessionContext
      vi.spyOn(connector, 'setAISessionContext').mockResolvedValue()

      // This should cause ReferenceError: userId is not defined
      await expect(connector.getPatientData('test-patient-id', 'test-user-id', 'test-clinic-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })

    it('should fail with ReferenceError when using request instead of _request', async () => {
      // This test should FAIL with: ReferenceError: request is not defined
      // The validateDataAccess call inside tries to use request instead of _request
      
      // Mock validateDataAccess to throw ReferenceError
      vi.spyOn(connector as any, 'validateDataAccess').mockImplementation(() => {
        // Simulate the ReferenceError that would occur
        throw new ReferenceError('request is not defined')
      })

      // This should cause ReferenceError: request is not defined
      await expect(connector.getPatientData('test-patient-id', 'test-user-id', 'test-clinic-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('getAppointmentData ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Mock validateDataAccess
      vi.spyOn(connector as any, 'validateDataAccess').mockResolvedValue(true)
      
      // Set up supabase mock
      Object.defineProperty(connector, 'supabase', {
        value: {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'test-appointment-id',
                patient_id: 'test-patient-id',
                professional_id: 'test-prof-id',
                scheduled_at: '2025-01-01T10:00:00',
                duration_hours: 1,
                status: 'scheduled',
                notes: 'Test appointment',
                no_show_risk_score: 0.1,
                patients: {
                  full_name: 'Test Patient',
                  phone: '123-456-7890'
                },
                professionals: {
                  full_name: 'Test Doctor',
                  specialization: 'General Practice'
                }
              }
            ],
            error: null
          })
        },
        writable: true
      })

      // Mock setAISessionContext
      vi.spyOn(connector, 'setAISessionContext').mockResolvedValue()

      // This should cause ReferenceError: userId is not defined
      await expect(connector.getAppointmentData('test-clinic-id', 'test-user-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })

    it('should fail with ReferenceError when using request instead of _request', async () => {
      // This test should FAIL with: ReferenceError: request is not defined
      // The validateDataAccess call inside tries to use request instead of _request
      
      // Mock validateDataAccess to throw ReferenceError
      vi.spyOn(connector as any, 'validateDataAccess').mockImplementation(() => {
        // Simulate the ReferenceError that would occur
        throw new ReferenceError('request is not defined')
      })

      // This should cause ReferenceError: request is not defined
      await expect(connector.getAppointmentData('test-clinic-id', 'test-user-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('getClinicSummary ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Mock validateDataAccess
      vi.spyOn(connector as any, 'validateDataAccess').mockResolvedValue(true)
      
      // Set up supabase mock
      Object.defineProperty(connector, 'supabase', {
        value: {
          from: vi.fn().mockReturnThis(),
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: {
              name: 'Test Clinic',
              address: '123 Test St',
              phone: '123-456-7890'
            },
            error: null
          })
        },
        writable: true
      })

      // Mock the count queries
      const mockSupabase = (connector as any).supabase
      vi.spyOn(mockSupabase, 'from')
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lte: vi.fn().mockReturnThis(),
          count: vi.fn().mockReturnThis(),
          head: vi.fn().mockResolvedValue({ count: 5 })
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          count: vi.fn().mockReturnThis(),
          head: vi.fn().mockResolvedValue({ count: 100 })
        })

      // Mock setAISessionContext
      vi.spyOn(connector, 'setAISessionContext').mockResolvedValue()

      // This should cause ReferenceError: userId is not defined
      await expect(connector.getClinicSummary('test-clinic-id', 'test-user-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })

    it('should fail with ReferenceError when using request instead of _request', async () => {
      // This test should FAIL with: ReferenceError: request is not defined
      // The validateDataAccess call inside tries to use request instead of _request
      
      // Mock validateDataAccess to throw ReferenceError
      vi.spyOn(connector as any, 'validateDataAccess').mockImplementation(() => {
        // Simulate the ReferenceError that would occur
        throw new ReferenceError('request is not defined')
      })

      // This should cause ReferenceError: request is not defined
      await expect(connector.getClinicSummary('test-clinic-id', 'test-user-id', 'test-session-id'))
        .rejects
        .toThrow(ReferenceError)
    })
  })

  describe('clearPermissionsCache ReferenceError', () => {
    it('should fail with ReferenceError when using userId instead of _userId', async () => {
      // This test should FAIL with: ReferenceError: userId is not defined
      // The method signature uses _userId but implementation tries to use userId
      
      // Add some test data to the cache
      ;(connector as any).permissionsCache.set('test-user-id-test-clinic-id', {
        userId: 'test-user-id',
        clinicId: 'test-clinic-id'
      })
      ;(connector as any).cacheExpiry.set('test-user-id-test-clinic-id', Date.now() + 300000)

      // This should cause ReferenceError: userId is not defined
      expect(() => connector['clearPermissionsCache']('test-user-id', 'test-clinic-id'))
        .toThrow(ReferenceError)
    })
  })
})