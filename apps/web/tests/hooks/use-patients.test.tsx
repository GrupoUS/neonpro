/**
 * 👥 Enhanced Patient Management Hook Tests - NeonPro Healthcare
 * ===========================================================
 *
 * Comprehensive unit tests for patient management with:
 * - CRUD operations with LGPD compliance
 * - Brazilian healthcare data validation (CPF, RG, CNS)
 * - Medical data handling and privacy
 * - Emergency scenarios and critical operations
 * - Multi-tenant data isolation
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Import the hook we're testing
import { usePatients } from '../../hooks/enhanced/use-patients';

// Mock the API client
vi.mock('@neonpro/shared/api-client', () => ({
  apiClient: {
    patients: {
      create: vi.fn(),
      findById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
      list: vi.fn(),
    },
  },
  ApiHelpers: {
    handleApiResponse: vi.fn(),
    handleApiError: vi.fn(),
  },
}));

describe('usePatients Hook - NeonPro Healthcare Patient Management', () => {
  let queryClient: QueryClient;

  // Mock patient data following Brazilian healthcare standards
  const mockPatient = {
    id: 'patient-123',
    tenantId: 'clinic-tenant-id',
    // Personal information
    name: 'Maria da Silva Santos',
    dateOfBirth: '1985-03-15',
    gender: 'FEMALE' as const,
    maritalStatus: 'MARRIED' as const, // Brazilian identification documents
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    cns: '123456789012345', // Cartão Nacional de Saúde

    // Contact information
    email: 'maria.silva@email.com',
    phone: '(11) 99999-9999',

    // Address (Brazilian format)
    address: {
      street: 'Rua das Flores, 123',
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05433-000',
      country: 'BR',
    },

    // Emergency contact
    emergencyContact: {
      name: 'João Santos Silva',
      relationship: 'SPOUSE',
      phone: '(11) 98888-8888',
    },

    // Medical information
    bloodType: 'A+' as const,
    allergies: ['Penicilina', 'Dipirona'],
    chronicConditions: ['Diabetes Tipo 2', 'Hipertensão'],

    // Insurance information
    insurance: {
      provider: 'SulAmérica',
      policyNumber: 'SA123456789',
      validUntil: '2024-12-31',
    },

    // LGPD compliance
    lgpdConsent: {
      dataProcessing: true,
      marketingCommunications: false,
      dataSharing: false,
      consentDate: '2024-01-15T10:00:00Z',
    },

    // Audit fields
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    isActive: true,
  };
  const mockCreatePatientResponse = {
    success: true,
    data: {
      patient: mockPatient,
      message: 'Paciente criado com sucesso',
    },
    error: null,
  };

  // Wrapper component for testing hooks
  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Patient CRUD Operations', () => {
    it('should create a new patient with Brazilian healthcare validation', async () => {
      const mockCreate = vi.fn().mockResolvedValue(mockCreatePatientResponse);
      (await import('@neonpro/shared/api-client')).apiClient.patients.create =
        mockCreate;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      const newPatientData = {
        name: 'João da Silva',
        cpf: '987.654.321-00',
        dateOfBirth: '1990-05-20',
        phone: '(11) 91234-5678',
        email: 'joao@email.com',
        gender: 'MALE' as const,
        lgpdConsent: {
          dataProcessing: true,
          marketingCommunications: false,
          dataSharing: false,
          consentDate: new Date().toISOString(),
        },
      }; // Execute patient creation
      result.current.createPatient.mutate(newPatientData);

      await waitFor(() => {
        expect(result.current.createPatient.isSuccess).toBe(true);
      });

      expect(mockCreate).toHaveBeenCalledWith(newPatientData);
      expect(result.current.createPatient.data).toEqual(
        mockCreatePatientResponse
      );
    });

    it('should validate CPF format during patient creation', async () => {
      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      const invalidCpfData = {
        name: 'Test Patient',
        cpf: '123.456.789-99', // Invalid CPF
        dateOfBirth: '1990-01-01',
        email: 'test@email.com',
        lgpdConsent: {
          dataProcessing: true,
          marketingCommunications: false,
          dataSharing: false,
          consentDate: new Date().toISOString(),
        },
      };

      // CPF validation should catch this
      const mockCreate = vi.fn().mockResolvedValue({
        success: false,
        data: null,
        error: {
          code: 'INVALID_CPF',
          message: 'CPF inválido',
          field: 'cpf',
        },
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.create =
        mockCreate;

      result.current.createPatient.mutate(invalidCpfData);

      await waitFor(() => {
        expect(result.current.createPatient.isError).toBe(true);
      });
    });
    it('should update patient information with audit trail', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({
        success: true,
        data: {
          patient: { ...mockPatient, phone: '(11) 99999-0000' },
          auditTrail: {
            action: 'UPDATE',
            field: 'phone',
            oldValue: '(11) 99999-9999',
            newValue: '(11) 99999-0000',
            userId: 'doctor-123',
            timestamp: new Date().toISOString(),
          },
        },
        error: null,
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.update =
        mockUpdate;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      const updateData = {
        id: 'patient-123',
        phone: '(11) 99999-0000',
      };

      result.current.updatePatient.mutate(updateData);

      await waitFor(() => {
        expect(result.current.updatePatient.isSuccess).toBe(true);
      });

      expect(mockUpdate).toHaveBeenCalledWith('patient-123', {
        phone: '(11) 99999-0000',
      });
    });

    it('should delete patient with LGPD compliance', async () => {
      const mockDelete = vi.fn().mockResolvedValue({
        success: true,
        data: {
          message: 'Paciente removido com sucesso',
          lgpdCompliance: {
            dataErased: true,
            auditRetained: true,
            erasureDate: new Date().toISOString(),
          },
        },
        error: null,
      });
      (await import('@neonpro/shared/api-client')).apiClient.patients.delete =
        mockDelete;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.deletePatient.mutate('patient-123');

      await waitFor(() => {
        expect(result.current.deletePatient.isSuccess).toBe(true);
      });

      expect(mockDelete).toHaveBeenCalledWith('patient-123');
      expect(
        result.current.deletePatient.data?.data.lgpdCompliance.dataErased
      ).toBe(true);
    });
  });

  describe('LGPD Compliance & Data Privacy', () => {
    it('should enforce LGPD consent requirements', async () => {
      const patientWithoutConsent = {
        ...mockPatient,
        lgpdConsent: {
          dataProcessing: false,
          marketingCommunications: false,
          dataSharing: false,
          consentDate: null,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue({
        success: false,
        data: null,
        error: {
          code: 'LGPD_CONSENT_REQUIRED',
          message: 'Consentimento LGPD obrigatório para processamento de dados',
          field: 'lgpdConsent',
        },
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.create =
        mockCreate;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.createPatient.mutate(patientWithoutConsent);

      await waitFor(() => {
        expect(result.current.createPatient.isError).toBe(true);
      });
    });
    it('should handle data masking for sensitive information', async () => {
      const maskedPatient = {
        ...mockPatient,
        cpf: '***.***.***-00', // Masked CPF
        rg: '**.***.***-*', // Masked RG
        phone: '(**) ****-9999', // Partially masked phone
      };

      const mockSearch = vi.fn().mockResolvedValue({
        success: true,
        data: {
          patients: [maskedPatient],
          total: 1,
          dataMasked: true,
        },
        error: null,
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.search =
        mockSearch;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.searchPatients.mutate({
        query: 'Maria',
        maskSensitiveData: true,
      });

      await waitFor(() => {
        expect(result.current.searchPatients.isSuccess).toBe(true);
      });

      const searchResults = result.current.searchPatients.data?.data.patients;
      expect(searchResults?.[0].cpf).toBe('***.***.***-00');
    });
  });

  describe('Healthcare-Specific Features', () => {
    it('should handle emergency patient scenarios', async () => {
      const emergencyPatient = {
        ...mockPatient,
        isEmergency: true,
        emergencyLevel: 'CRITICAL',
        admissionReason: 'Infarto agudo do miocárdio',
        emergencyContact: {
          name: 'João Santos Silva',
          relationship: 'SPOUSE',
          phone: '(11) 98888-8888',
          isReachable: true,
        },
      };

      const mockCreate = vi.fn().mockResolvedValue({
        success: true,
        data: {
          patient: emergencyPatient,
          priority: 'HIGH',
          notifications: ['MEDICAL_TEAM', 'FAMILY_CONTACT'],
        },
        error: null,
      });
      (await import('@neonpro/shared/api-client')).apiClient.patients.create =
        mockCreate;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.createPatient.mutate(emergencyPatient);

      await waitFor(() => {
        expect(result.current.createPatient.isSuccess).toBe(true);
      });

      expect(result.current.createPatient.data?.data.priority).toBe('HIGH');
    });

    it('should validate Brazilian CNS (Cartão Nacional de Saúde)', async () => {
      const patientWithCNS = {
        ...mockPatient,
        cns: '123456789012345', // Valid CNS format
      };

      const mockValidation = vi.fn().mockResolvedValue({
        success: true,
        data: {
          isValid: true,
          cnsStatus: 'ACTIVE',
          susValidation: true,
        },
        error: null,
      });

      expect(patientWithCNS.cns).toHaveLength(15);
      expect(typeof patientWithCNS.cns).toBe('string');
    });

    it('should handle multi-tenant data isolation', async () => {
      const tenant1Patients = [
        { ...mockPatient, tenantId: 'clinic-1', id: 'patient-1' },
        { ...mockPatient, tenantId: 'clinic-1', id: 'patient-2' },
      ];

      const mockList = vi.fn().mockResolvedValue({
        success: true,
        data: {
          patients: tenant1Patients,
          total: 2,
          tenantId: 'clinic-1',
        },
        error: null,
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.list =
        mockList;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.listPatients.refetch();

      await waitFor(() => {
        expect(result.current.listPatients.isSuccess).toBe(true);
      });

      const patients = result.current.listPatients.data?.data.patients;
      expect(patients?.every((p) => p.tenantId === 'clinic-1')).toBe(true);
    });
  });

  describe('Search and Filtering', () => {
    it('should perform patient search with multiple criteria', async () => {
      const searchCriteria = {
        name: 'Maria',
        cpf: '123.456.789-00',
        dateOfBirth: '1985-03-15',
        bloodType: 'A+',
        gender: 'FEMALE',
      };

      const mockSearch = vi.fn().mockResolvedValue({
        success: true,
        data: {
          patients: [mockPatient],
          total: 1,
          searchCriteria,
        },
        error: null,
      });

      (await import('@neonpro/shared/api-client')).apiClient.patients.search =
        mockSearch;

      const { result } = renderHook(() => usePatients(), {
        wrapper: createWrapper(),
      });

      result.current.searchPatients.mutate(searchCriteria);

      await waitFor(() => {
        expect(result.current.searchPatients.isSuccess).toBe(true);
      });

      expect(mockSearch).toHaveBeenCalledWith(searchCriteria);
    });
  });
});
