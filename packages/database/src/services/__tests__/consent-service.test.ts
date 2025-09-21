import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentService } from '../consent-service';

// Set up environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

// Create a comprehensive mock chain that supports all Supabase operations
const createMockChain = (data: any, error: any = null) => {
  const chain = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    gt: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lt: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    like: jest.fn().mockReturnThis(),
    ilike: jest.fn().mockReturnThis(),
    is: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    containedBy: jest.fn().mockReturnThis(),
    rangeGt: jest.fn().mockReturnThis(),
    rangeGte: jest.fn().mockReturnThis(),
    rangeLt: jest.fn().mockReturnThis(),
    rangeLte: jest.fn().mockReturnThis(),
    rangeAdjacent: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    textSearch: jest.fn().mockReturnThis(),
    match: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    or: jest.fn().mockReturnThis(),
    filter: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    abortSignal: jest.fn().mockReturnThis(),
    single: jest.fn(() => Promise.resolve({ data, error })),
    maybeSingle: jest.fn(() => Promise.resolve({ data, error })),
    then: jest.fn((callback) => {
      const result = { data, error };
      return Promise.resolve(callback(result));
    })
  };

  return chain;
};

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(),
  rpc: jest.fn(() => Promise.resolve({ data: { success: true }, error: null }))
};

// Mock the Supabase client creation
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('ConsentService', () => {
  let consentService: ConsentService;

  beforeEach(() => {
    jest.clearAllMocks();
    consentService = new ConsentService(mockSupabaseClient as any);
  });

  describe('requestConsent', () => {
    it('should request consent successfully', async () => {
      const mockData = { id: 'consent-123', status: 'pending' };
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.requestConsent('patient-123', 'data_processing');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records');
    });

    it('should handle request consent error', async () => {
      const mockChain = createMockChain(null, new Error('Database error'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.requestConsent('patient-123', 'data_processing');

      expect(result).toBe(false);
    });
  });

  describe('grantConsent', () => {
    it('should grant consent successfully', async () => {
      const mockChain = createMockChain({ id: 'consent-123', status: 'granted' });
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.grantConsent('patient-123', 'consent-123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records');
    });

    it('should handle grant consent error', async () => {
      const mockChain = createMockChain(null, new Error('Update failed'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.grantConsent('patient-123', 'consent-123');

      expect(result).toBe(false);
    });
  });

  describe('revokeConsent', () => {
    it('should revoke consent successfully', async () => {
      // Mock patient lookup first - return valid patient data
      const patientData = { id: 'patient-123', clinic_id: 'clinic-123' };
      
      // Create separate mock chains for different calls
      const patientChain = createMockChain(patientData, null);
      const updateChain = createMockChain(null, null); // No error for update
      
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients') {
          return patientChain;
        } else if (tableName === 'consent_records') {
          return updateChain;
        }
        return createMockChain(null, null);
      });

      // Mock the RPC call to return success
      mockSupabaseClient.rpc.mockResolvedValue({ data: { success: true }, error: null });

      // revokeConsent returns void, so we test that it doesn't throw
      await expect(consentService.revokeConsent('user-123', 'general-medical', 'session-123', 'User request')).resolves.toBeUndefined();
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records');
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('create_webrtc_audit_log', expect.any(Object));
    });
  });

  describe('verifyConsent', () => {
    it('should verify consent successfully', async () => {
      const mockData = { id: 'consent-123', status: 'granted' };
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.verifyConsent('patient-123', 'data_processing');

      expect(result).toBe(true);
    });

    it('should return false when consent not found', async () => {
      const mockChain = createMockChain(null);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.verifyConsent('patient-123', 'data_processing');

      expect(result).toBe(false);
    });
  });

  describe('getPendingConsents', () => {
    it('should get pending consents successfully', async () => {
      const mockData = [{ id: 'consent-123', status: 'pending' }];
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.getPendingConsents('patient-123');

      expect(result).toEqual(mockData);
    });
  });

  describe('getConsentHistory', () => {
    it('should get consent history successfully', async () => {
      // Mock patient lookup first
      const patientData = { id: 'patient-123', clinic_id: 'clinic-123' };
      
      // Mock audit logs data that matches the actual service structure
      const auditLogsData = [{
        id: 'audit-123',
        action: 'consent-given',
        user_id: 'user-123',
        resource_id: 'session-123',
        created_at: '2023-01-01T00:00:00Z',
        clinic_id: 'clinic-123',
        new_values: {
          data_type: 'general-medical'
        }
      }];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients' && callCount === 1) {
          return createMockChain(patientData);
        }
        // For audit_logs query
        return createMockChain(auditLogsData);
      });

      const result = await consentService.getConsentHistory('user-123');

      // Expect the transformed RTCAuditLogEntry format
      expect(result).toEqual([{
        id: 'audit-123',
        sessionId: 'session-123',
        eventType: 'consent-given',
        userId: 'user-123',
        userRole: 'patient',
        dataClassification: 'general-medical',
        timestamp: '2023-01-01T00:00:00Z',
        clinicId: 'clinic-123',
        metadata: { data_type: 'general-medical' }
      }]);
    });
  });

  describe('deleteUserData', () => {
    it('should delete user data successfully', async () => {
      // Mock patient lookup - success
      const patientData = { id: 'patient-123', user_id: 'user-123', name: 'John Doe', clinic_id: 'clinic-123' };
      
      // Create separate mock chains for different operations
      const patientChain = createMockChain(patientData, null);
      const deleteChain = createMockChain({ success: true }, null);
      
      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        if (tableName === 'patients' && callCount === 1) {
          return patientChain;
        }
        // For all other calls (deletions), return success
        return deleteChain;
      });

      // Mock RPC calls
      mockSupabaseClient.rpc.mockResolvedValue({ data: { success: true }, error: null });

      await expect(consentService.deleteUserData('user-123')).resolves.toBeUndefined();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('patients');
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('create_webrtc_audit_log', expect.any(Object));
    });

    it('should throw error when patient not found', async () => {
      const mockChain = createMockChain(null, new Error('Patient not found'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(consentService.deleteUserData('user-123')).rejects.toThrow('Patient not found for user');
    });
  });

  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const patientData = { id: 'patient-123', user_id: 'user-123', name: 'John Doe' };
      const consentData = [{ id: 'consent-123', status: 'granted' }];
      const webrtcData = [{ id: 'webrtc-123', action: 'connect' }];
      const auditData = [{ id: 'audit-123', action: 'login' }];

      let callCount = 0;
      mockSupabaseClient.from.mockImplementation((tableName: string) => {
        callCount++;
        switch (tableName) {
          case 'patients':
            return createMockChain(patientData, null);
          case 'consent_records':
            return createMockChain(consentData, null);
          case 'webrtc_audit_logs':
            return createMockChain(webrtcData, null);
          case 'audit_logs':
            return createMockChain(auditData, null);
          default:
            return createMockChain([], null);
        }
      });

      const result = await consentService.exportUserData('user-123');

      expect(result).toMatchObject({
        patient: patientData,
        consentRecords: consentData,
        webrtcAuditLogs: webrtcData,
        generalAuditLogs: auditData,
        note: expect.stringContaining('LGPD')
      });
      expect(result.exportDate).toBeDefined();
    });

    it('should throw error when patient not found', async () => {
      const mockChain = createMockChain(null, new Error('Patient not found'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(consentService.exportUserData('user-123')).rejects.toThrow('Patient not found for user');
    });
  });
});