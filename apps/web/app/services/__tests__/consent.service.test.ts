import { vi } from 'vitest';
import { createClient } from '@/app/utils/supabase/client';
import { ConsentService } from '../consent.service';

// Mock do createClient - usando definição simples
vi.mock('@/app/utils/supabase/client', () => ({
  createClient: vi.fn(),
}));

describe('ConsentService', () => {
  let consentService: ConsentService;
  let mockSupabase: any;

  beforeEach(() => {
    // Configurar mock do supabase com métodos chainable
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };

    // Mock do createClient para retornar nosso mock
    (createClient as vi.Mock).mockReturnValue(mockSupabase);

    consentService = new ConsentService();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createConsentForm', () => {
    it('should create a consent form successfully', async () => {
      // Mock do resultado da operação
      const mockResult = {
        data: [{ id: '1', name: 'Test Form', clinic_id: 'clinic-1' }],
        error: null,
      };

      // Configurar o mock para retornar uma Promise
      const chainMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const mockFormData = {
        name: 'Test Form',
        description: 'Test Description',
        clinic_id: 'clinic-1',
      };

      const result = await consentService.createConsentForm(mockFormData);

      expect(result).toEqual(mockResult.data[0]);
      expect(chainMock.from).toHaveBeenCalledWith('consent_forms');
    });

    it('should throw error when creation fails', async () => {
      const mockError = { message: 'Database error' };
      const chainMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const mockFormData = {
        name: 'Test Form',
        clinic_id: 'clinic-1',
      };

      await expect(
        consentService.createConsentForm(mockFormData),
      ).rejects.toThrow('Failed to create consent form');
    });
  });

  describe('getConsentForms', () => {
    it('should fetch consent forms for a clinic', async () => {
      const mockResult = {
        data: [
          { id: '1', name: 'Form 1' },
          { id: '2', name: 'Form 2' },
        ],
        error: null,
      };

      const chainMock = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue(mockResult),
              }),
            }),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const result = await consentService.getConsentForms('clinic-1');

      expect(result).toEqual(mockResult.data);
      expect(chainMock.from).toHaveBeenCalledWith('consent_forms');
    });
  });

  describe('recordPatientConsent', () => {
    it('should record patient consent successfully', async () => {
      const mockResult = {
        data: [{ id: '1', patient_id: 'patient-1', status: 'granted' }],
        error: null,
      };

      const chainMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const mockConsentData = {
        patient_id: 'patient-1',
        consent_form_id: 'form-1',
        status: 'granted',
      };

      const result = await consentService.recordPatientConsent(mockConsentData);

      expect(result).toEqual(mockResult.data[0]);
      expect(chainMock.from).toHaveBeenCalledWith('patient_consent');
    });
  });

  describe('grantPatientConsent', () => {
    it('should grant patient consent successfully', async () => {
      const mockResult = {
        data: [{ id: '1', patient_id: 'patient-1', status: 'granted' }],
        error: null,
      };

      const chainMock = {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue(mockResult),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const result = await consentService.grantPatientConsent(
        'patient-1',
        'form-1',
      );

      expect(result).toEqual(mockResult.data[0]);
      expect(chainMock.from).toHaveBeenCalledWith('patient_consent');
    });
  });

  describe('revokePatientConsent', () => {
    it('should revoke patient consent successfully', async () => {
      const mockResult = {
        data: [{ id: '1', patient_id: 'patient-1', status: 'revoked' }],
        error: null,
      };

      const chainMock = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockResolvedValue(mockResult),
            }),
          }),
        }),
      };

      (createClient as vi.Mock).mockReturnValue(chainMock);
      consentService = new ConsentService();

      const result = await consentService.revokePatientConsent(
        'consent-1',
        'Test reason',
      );

      expect(result).toEqual(mockResult.data[0]);
      expect(chainMock.from).toHaveBeenCalledWith('patient_consent');
    });
  });
});
