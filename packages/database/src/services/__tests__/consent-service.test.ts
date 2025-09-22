import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentService } from '../consent-service';

// Set up environment variables
process.env.SUPABASE_URL = ''https://test.supabase.co')
process.env.SUPABASE_ANON_KEY = ''test-key')

// Create a comprehensive mock chain that supports all Supabase operations
const createMockChain = (data: any, error: any = null) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gt: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    like: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    contains: vi.fn().mockReturnThis(),
    containedBy: vi.fn().mockReturnThis(),
    rangeGt: vi.fn().mockReturnThis(),
    rangeGte: vi.fn().mockReturnThis(),
    rangeLt: vi.fn().mockReturnThis(),
    rangeLte: vi.fn().mockReturnThis(),
    rangeAdjacent: vi.fn().mockReturnThis(),
    overlaps: vi.fn().mockReturnThis(),
    textSearch: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    filter: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    abortSignal: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ data, error })),
    maybeSingle: vi.fn(() => Promise.resolve({ data, error })),
    then: vi.fn((callback) => {
      const result = { data, error };
      return Promise.resolve(callback(result)
    })
  };

  return chain;
};

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(() => Promise.resolve({ data: { success: true }, error: null }))
};

// Mock the Supabase client creation
vi.mock('@supabase/supabase-js_, () => ({
  createClient: vi.fn(() => mockSupabaseClient)
})

describe('ConsentService_, () => {
  let consentService: ConsentService;

  beforeEach(() => {
    vi.clearAllMocks(
    consentService = new ConsentService(mockSupabaseClient as any
  }

  describe('requestConsent_, () => {
    it('should request consent successfully_,_async () => {
      const mockData = { id: 'consent-123', status: 'pending' };
      const mockChain = createMockChain(mockData
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.requestConsent('patient-123', 'data_processing_

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records_
    }

    it('should handle request consent error_,_async () => {
      const mockChain = createMockChain(null, new Error('Database error')
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.requestConsent('patient-123', 'data_processing_

      expect(result).toBe(false);
    }
  }

  describe('grantConsent_, () => {
    it('should grant consent successfully_,_async () => {
      const mockChain = createMockChain({ id: 'consent-123', status: 'granted' }
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.grantConsent('patient-123', 'consent-123')

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records_
    }

    it('should handle grant consent error_,_async () => {
      const mockChain = createMockChain(null, new Error('Update failed')
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.grantConsent('patient-123', 'consent-123')

      expect(result).toBe(false);
    }
  }

  describe('revokeConsent_, () => {
    it('should revoke consent successfully_,_async () => {
      // Mock patient lookup first - return valid patient data
      const patientData = { id: 'patient-123', clinic_id: 'clinic-123_ };
      
      // Create separate mock chains for different calls
      const patientChain = createMockChain(patientData, null
      const updateChain = createMockChain(null, null); // No error for update
      
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients') {
          return patientChain;
        } else if (tableName === 'consent_records_) {
          return updateChain;
        }
        return createMockChain(null, null
      }

      // Mock the RPC call to return success
      mockSupabaseClient.rpc.mockResolvedValue({ data: { success: true }, error: null }

      // revokeConsent returns void, so we test that it doesn't throw
      await expect(consentService.revokeConsent('user-123', 'general-medical', 'session-123', 'User request')).resolves.toBeUndefined(
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients')
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records_
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('create_webrtc_audit_log_, expect.any(Object)
    }
  }

  describe('verifyConsent_, () => {
    it('should verify consent successfully_,_async () => {
      const mockData = { id: 'consent-123', status: 'granted' };
      const mockChain = createMockChain(mockData
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.verifyConsent('patient-123', 'data_processing_

      expect(result).toBe(true);
    }

    it('should return false when consent not found_,_async () => {
      const mockChain = createMockChain(null
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.verifyConsent('patient-123', 'data_processing_

      expect(result).toBe(false);
    }
  }

  describe('getPendingConsents_, () => {
    it('should get pending consents successfully_,_async () => {
      const mockData = [{ id: 'consent-123', status: 'pending' }];
      const mockChain = createMockChain(mockData
      mockSupabaseClient.from.mockReturnValue(mockChain

      const result = await consentService.getPendingConsents('patient-123')

      expect(result).toEqual(mockData
    }
  }

  describe('getConsentHistory_, () => {
    it('should get consent history successfully_,_async () => {
      // Mock patient lookup first
      const patientData = { id: 'patient-123', clinic_id: 'clinic-123_ };
      
      // Mock audit logs data that matches the actual service structure
      const auditLogsData = [{
        id: 'audit-123',
        action: 'consent-given',
        user_id: 'user-123_,
        resource_id: 'session-123_,
        created_at: '2023-01-01T00:00:00Z_,
        clinic_id: 'clinic-123_,
        new_values: {
          data_type: 'general-medical_
        }
      }];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients' && callCount === 1) {
          return createMockChain(patientData
        }
        // For audit_logs query
        return createMockChain(auditLogsData
      }

      const result = await consentService.getConsentHistory('user-123')

      // Expect the transformed RTCAuditLogEntry format
      expect(result).toEqual([{
        id: 'audit-123',
        sessionId: 'session-123',
        eventType: 'consent-given',
        _userId: 'user-123_,
        userRole: 'patient',
        dataClassification: 'general-medical',
        timestamp: '2023-01-01T00:00:00Z',
        clinicId: 'clinic-123',
        metadata: { data_type: 'general-medical_ }
      }]
    }
  }

  describe('deleteUserData_, () => {
    it('should delete user data successfully_,_async () => {
      // Mock patient lookup - success
      const patientData = { id: 'patient-123', user_id: 'user-123', name: 'John Doe', clinic_id: 'clinic-123_ };
      
      // Create separate mock chains for different operations
      const patientChain = createMockChain(patientData, null
      const deleteChain = createMockChain({ success: true }, null
      
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients' && callCount === 1) {
          return patientChain;
        }
        // For all other calls (deletions), return success
        return deleteChain;
      }

      // Mock RPC calls
      mockSupabaseClient.rpc.mockResolvedValue({ data: { success: true }, error: null }

      await expect(consentService.deleteUserData('user-123')).resolves.toBeUndefined(
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients')
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('create_webrtc_audit_log_, expect.any(Object)
    }

    it('should throw error when patient not found_,_async () => {
      const mockChain = createMockChain(null, new Error('Patient not found')
      mockSupabaseClient.from.mockReturnValue(mockChain

      await expect(consentService.deleteUserData('user-123')).rejects.toThrow('Patient not found for user')
    }
  }

  describe('exportUserData_, () => {
    it('should export user data successfully_,_async () => {
      const patientData = { id: 'patient-123', user_id: 'user-123', name: 'John Doe_ };
      const consentData = [{ id: 'consent-123', status: 'granted' }];
      const webrtcData = [{ id: 'webrtc-123', action: 'connect' }];
      const auditData = [{ id: 'audit-123', action: 'login' }];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        switch (tableName) {
          case 'patients':
            return createMockChain(patientData, null
          case 'consent_records_:
            return createMockChain(consentData, null
          case 'webrtc_audit_logs_:
            return createMockChain(webrtcData, null
          case 'audit_logs_:
            return createMockChain(auditData, null
          default:
            return createMockChain([], null
        }
      }

      const result = await consentService.exportUserData('user-123')

      expect(result).toMatchObject({
        patient: patientData,
        consentRecords: consentData,
        webrtcAuditLogs: webrtcData,
        generalAuditLogs: auditData,
        note: expect.stringContaining('LGPD')
      }
      expect(result.exportDate).toBeDefined(
    }

    it('should throw error when patient not found_,_async () => {
      const mockChain = createMockChain(null, new Error('Patient not found')
      mockSupabaseClient.from.mockReturnValue(mockChain

      await expect(consentService.exportUserData('user-123')).rejects.toThrow('Patient not found for user')
    }
  }
}