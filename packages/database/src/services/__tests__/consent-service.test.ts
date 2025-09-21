import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConsentService } from '../consent-service';

// Set up environment variables
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-key';

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
    single: vi.fn(_() => Promise.resolve({ data, error })),
    maybeSingle: vi.fn(_() => Promise.resolve({ data, error })),
    then: vi.fn(_(callback) => {
      const result = { data, error };
      return Promise.resolve(callback(result));
    })
  };

  return chain;
};

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(_() => Promise.resolve({ data: { success: true }, error: null }))
};

// Mock the Supabase client creation
vi.mock(_'@supabase/supabase-js',_() => ({
  createClient: vi.fn(() => mockSupabaseClient)
}));

describe(_'ConsentService',_() => {
  let consentService: ConsentService;

  beforeEach(_() => {
    vi.clearAllMocks();
    consentService = new ConsentService(mockSupabaseClient as any);
  });

  describe(_'requestConsent',_() => {
    it(_'should request consent successfully',_async () => {
      const mockData = { id: 'consent-123', status: 'pending' };
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.requestConsent('patient-123', 'data_processing');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records');
    });

    it(_'should handle request consent error',_async () => {
      const mockChain = createMockChain(null, new Error('Database error'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.requestConsent('patient-123', 'data_processing');

      expect(result).toBe(false);
    });
  });

  describe(_'grantConsent',_() => {
    it(_'should grant consent successfully',_async () => {
      const mockChain = createMockChain({ id: 'consent-123', status: 'granted' });
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.grantConsent('patient-123', 'consent-123');

      expect(result).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('consent_records');
    });

    it(_'should handle grant consent error',_async () => {
      const mockChain = createMockChain(null, new Error('Update failed'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.grantConsent('patient-123', 'consent-123');

      expect(result).toBe(false);
    });
  });

  describe(_'revokeConsent',_() => {
    it(_'should revoke consent successfully',_async () => {
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

  describe(_'verifyConsent',_() => {
    it(_'should verify consent successfully',_async () => {
      const mockData = { id: 'consent-123', status: 'granted' };
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.verifyConsent('patient-123', 'data_processing');

      expect(result).toBe(true);
    });

    it(_'should return false when consent not found',_async () => {
      const mockChain = createMockChain(null);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.verifyConsent('patient-123', 'data_processing');

      expect(result).toBe(false);
    });
  });

  describe(_'getPendingConsents',_() => {
    it(_'should get pending consents successfully',_async () => {
      const mockData = [{ id: 'consent-123', status: 'pending' }];
      const mockChain = createMockChain(mockData);
      mockSupabaseClient.from.mockReturnValue(mockChain);

      const result = await consentService.getPendingConsents('patient-123');

      expect(result).toEqual(mockData);
    });
  });

  describe(_'getConsentHistory',_() => {
    it(_'should get consent history successfully',_async () => {
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
        _userId: 'user-123',
        userRole: 'patient',
        dataClassification: 'general-medical',
        timestamp: '2023-01-01T00:00:00Z',
        clinicId: 'clinic-123',
        metadata: { data_type: 'general-medical' }
      }]);
    });
  });

  describe(_'deleteUserData',_() => {
    it(_'should delete user data successfully',_async () => {
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

    it(_'should throw error when patient not found',_async () => {
      const mockChain = createMockChain(null, new Error('Patient not found'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(consentService.deleteUserData('user-123')).rejects.toThrow('Patient not found for user');
    });
  });

  describe(_'exportUserData',_() => {
    it(_'should export user data successfully',_async () => {
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

    it(_'should throw error when patient not found',_async () => {
      const mockChain = createMockChain(null, new Error('Patient not found'));
      mockSupabaseClient.from.mockReturnValue(mockChain);

      await expect(consentService.exportUserData('user-123')).rejects.toThrow('Patient not found for user');
    });
  });
});