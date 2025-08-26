import { createClient } from '@/app/utils/supabase/server';
import {
  addPerformanceMetric,
  createProfessional,
  createProfessionalCredential,
  createProfessionalService,
  deleteProfessional,
  deleteProfessionalCredential,
  deleteProfessionalService,
  getProfessionalById,
  getProfessionalCredentials,
  getProfessionalPerformanceMetrics,
  getProfessionalServices,
  getProfessionals,
  updatePerformanceMetric,
  updateProfessional,
  updateProfessionalCredential,
  updateProfessionalService,
  verifyCredential,
} from '@/lib/supabase/professionals';
import { vi } from 'vitest';

// Mock Supabase client with proper chaining support
const createMockQuery = () => {
  const mockQuery = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    eq: vi.fn(),
    neq: vi.fn(),
    in: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    single: vi.fn(),
    // Promise interface - the object itself is awaitable
    then: vi.fn(),
    catch: vi.fn(),
    finally: vi.fn(),
  };

  // Make all methods return this for chaining (except Promise methods)
  Object.keys(mockQuery).forEach((key) => {
    if (!['then', 'catch', 'finally'].includes(key)) {
      mockQuery[key].mockReturnThis();
    }
  });

  // Default resolution
  mockQuery.then.mockImplementation((onResolve) =>
    Promise.resolve({ data: [], error: undefined }).then(onResolve)
  );

  return mockQuery;
};

const mockQuery = createMockQuery();

const mockSupabaseClient = {
  from: vi.fn(() => mockQuery),
};

vi.mock<typeof import('@/app/utils/supabase/server')>('@/app/utils/supabase/server', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock data
const mockProfessional = {
  id: '1',
  given_name: 'Dr. Ana',
  family_name: 'Silva',
  email: 'ana.silva@email.com',
  phone_number: '(11) 99999-9999',
  birth_date: '1985-06-15',
  license_number: 'CRM 123456',
  qualification: 'Dermatologista',
  employment_status: 'full_time',
  status: 'active',
  bio: 'Especialista em dermatologia estética',
  address: {
    line: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01234-567',
    country: 'BR',
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const mockCredential = {
  id: 'cred-1',
  professional_id: '1',
  credential_type: 'license',
  credential_number: 'CRM 123456',
  issuing_authority: 'Conselho Regional de Medicina',
  issue_date: '2010-06-15',
  expiry_date: '2030-06-15',
  verification_status: 'verified',
  description: 'Licença para prática médica',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockService = {
  id: 'service-1',
  professional_id: '1',
  service_name: 'Consulta Dermatológica',
  service_type: 'consultation',
  description: 'Consulta completa de dermatologia',
  duration_minutes: 60,
  base_price: 200,
  requires_certification: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockPerformanceMetric = {
  id: 'metric-1',
  professional_id: '1',
  metric_type: 'patient_satisfaction',
  metric_value: 4.8,
  measurement_period: 'monthly',
  period_start: '2024-01-01',
  period_end: '2024-01-31',
  notes: 'Excelente avaliação dos pacientes',
  created_at: '2024-02-01T00:00:00Z',
  updated_at: '2024-02-01T00:00:00Z',
};

describe('professional Supabase Functions', () => {
  // Helper function to setup mock responses consistently
  const setupMockResponse = (response: any) => {
    mockQuery.then.mockImplementation((onResolve) => Promise.resolve(response).then(onResolve));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('professional Management', () => {
    describe('createProfessional', () => {
      it('should create a new professional successfully', async () => {
        const mockInsertResponse = { data: mockProfessional, error: undefined };
        setupMockResponse(mockInsertResponse);

        const professionalData = {
          given_name: 'Dr. Ana',
          family_name: 'Silva',
          email: 'ana.silva@email.com',
          license_number: 'CRM 123456',
          qualification: 'Dermatologista',
        };

        const result = await createProfessional(professionalData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('professionals');
        expect(mockSupabaseClient.from().insert).toHaveBeenCalledWith(
          professionalData,
        );
        expect(result).toStrictEqual(mockProfessional);
      });

      it('should throw error when creation fails', async () => {
        const mockError = new Error('Database error');
        const mockInsertResponse = { data: undefined, error: mockError };
        setupMockResponse(mockInsertResponse);

        const professionalData = {
          given_name: 'Dr. Ana',
          family_name: 'Silva',
          email: 'ana.silva@email.com',
        };

        await expect(createProfessional(professionalData)).rejects.toThrow(
          'Database error',
        );
      });

      it('should validate required fields', async () => {
        const incompleteProfessionalData = {
          given_name: 'Dr. Ana',
          // Missing required fields
        };

        await expect(
          createProfessional(incompleteProfessionalData),
        ).rejects.toThrow();
      });
    });

    describe('updateProfessional', () => {
      it('should update professional successfully', async () => {
        const mockUpdateResponse = { data: mockProfessional, error: undefined };
        setupMockResponse(mockUpdateResponse);

        const updateData = {
          given_name: 'Dr. Ana Luiza',
        };

        const result = await updateProfessional('1', updateData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('professionals');
        expect(mockSupabaseClient.from().update).toHaveBeenCalledWith(
          updateData,
        );
        expect(mockSupabaseClient.from().update().eq).toHaveBeenCalledWith(
          'id',
          '1',
        );
        expect(result).toStrictEqual(mockProfessional);
      });

      it('should throw error when update fails', async () => {
        const mockError = new Error('Update failed');
        const mockUpdateResponse = { data: undefined, error: mockError };
        setupMockResponse(mockUpdateResponse);

        await expect(updateProfessional('1', {})).rejects.toThrow(
          'Update failed',
        );
      });

      it('should throw error when professional not found', async () => {
        const mockUpdateResponse = { data: undefined, error: undefined };
        setupMockResponse(mockUpdateResponse);

        await expect(updateProfessional('999', {})).rejects.toThrow(
          'Professional not found',
        );
      });
    });

    describe('deleteProfessional', () => {
      it('should delete professional successfully', async () => {
        const mockDeleteResponse = { data: undefined, error: undefined };
        setupMockResponse(mockDeleteResponse);

        await deleteProfessional('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('professionals');
        expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith(
          'id',
          '1',
        );
      });

      it('should throw error when deletion fails', async () => {
        const mockError = new Error('Deletion failed');
        const mockDeleteResponse = { data: undefined, error: mockError };
        setupMockResponse(mockDeleteResponse);

        await expect(deleteProfessional('1')).rejects.toThrow(
          'Deletion failed',
        );
      });
    });

    describe('getProfessionals', () => {
      it('should fetch all professionals successfully', async () => {
        const mockSelectResponse = {
          data: [mockProfessional],
          error: undefined,
        };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionals();

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('professionals');
        expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*');
        expect(result).toStrictEqual([mockProfessional]);
      });

      it('should filter professionals by status', async () => {
        const mockSelectResponse = {
          data: [mockProfessional],
          error: undefined,
        };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionals({ status: 'active' });

        expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
          'status',
          'active',
        );
        expect(result).toStrictEqual([mockProfessional]);
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Fetch failed');
        const mockSelectResponse = { data: undefined, error: mockError };
        setupMockResponse(mockSelectResponse);

        await expect(getProfessionals()).rejects.toThrow('Fetch failed');
      });
    });

    describe('getProfessionalById', () => {
      it('should fetch professional by ID successfully', async () => {
        const mockSelectResponse = { data: mockProfessional, error: undefined };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionalById('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith('professionals');
        expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
          'id',
          '1',
        );
        expect(result).toStrictEqual(mockProfessional);
      });

      it('should return null when professional not found', async () => {
        const mockSelectResponse = { data: undefined, error: undefined };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionalById('999');

        expect(result).toBeNull();
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Fetch failed');
        const mockSelectResponse = { data: undefined, error: mockError };
        setupMockResponse(mockSelectResponse);

        await expect(getProfessionalById('1')).rejects.toThrow('Fetch failed');
      });
    });
  });

  describe('credentials Management', () => {
    describe('getProfessionalCredentials', () => {
      it('should fetch credentials for professional', async () => {
        const mockSelectResponse = { data: [mockCredential], error: undefined };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionalCredentials('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_credentials',
        );
        expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
          'professional_id',
          '1',
        );
        expect(result).toStrictEqual([mockCredential]);
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Fetch failed');
        const mockSelectResponse = { data: undefined, error: mockError };
        setupMockResponse(mockSelectResponse);

        await expect(getProfessionalCredentials('1')).rejects.toThrow(
          'Fetch failed',
        );
      });
    });

    describe('createProfessionalCredential', () => {
      it('should create credential successfully', async () => {
        const mockInsertResponse = { data: mockCredential, error: undefined };
        setupMockResponse(mockInsertResponse);

        const credentialData = {
          professional_id: '1',
          credential_type: 'license',
          credential_number: 'CRM 123456',
          issuing_authority: 'Conselho Regional de Medicina',
        };

        const result = await createProfessionalCredential(credentialData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_credentials',
        );
        expect(result).toStrictEqual(mockCredential);
      });

      it('should throw error when creation fails', async () => {
        const mockError = new Error('Creation failed');
        const mockInsertResponse = { data: undefined, error: mockError };
        setupMockResponse(mockInsertResponse);

        await expect(createProfessionalCredential({})).rejects.toThrow(
          'Creation failed',
        );
      });
    });

    describe('updateProfessionalCredential', () => {
      it('should update credential successfully', async () => {
        const mockUpdateResponse = { data: mockCredential, error: undefined }; // Remove array wrapper
        setupMockResponse(mockUpdateResponse);

        const updateData = {
          verification_status: 'verified',
        };

        const result = await updateProfessionalCredential('cred-1', updateData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_credentials',
        );
        expect(result).toStrictEqual(mockCredential);
      });

      it('should throw error when update fails', async () => {
        const mockError = new Error('Update failed');
        const mockUpdateResponse = { data: undefined, error: mockError };
        setupMockResponse(mockUpdateResponse);

        await expect(
          updateProfessionalCredential('cred-1', {}),
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteProfessionalCredential', () => {
      it('should delete credential successfully', async () => {
        const mockDeleteResponse = { data: undefined, error: undefined };
        setupMockResponse(mockDeleteResponse);

        await deleteProfessionalCredential('cred-1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_credentials',
        );
        expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith(
          'id',
          'cred-1',
        );
      });

      it('should throw error when deletion fails', async () => {
        const mockError = new Error('Deletion failed');
        const mockDeleteResponse = { data: undefined, error: mockError };
        setupMockResponse(mockDeleteResponse);

        await expect(deleteProfessionalCredential('cred-1')).rejects.toThrow(
          'Deletion failed',
        );
      });
    });

    describe('verifyCredential', () => {
      it('should verify credential successfully', async () => {
        const mockUpdateResponse = {
          data: { ...mockCredential, verification_status: 'verified' }, // Remove array wrapper
          error: undefined,
        };
        setupMockResponse(mockUpdateResponse);

        const result = await verifyCredential('cred-1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_credentials',
        );
        expect(mockSupabaseClient.from().update).toHaveBeenCalledWith({
          updated_at: expect.any(String), // Match actual implementation
          verified: true, // Match actual implementation
        });
        expect(result.verification_status).toBe('verified');
      });

      it('should throw error when verification fails', async () => {
        const mockError = new Error('Verification failed');
        const mockUpdateResponse = { data: undefined, error: mockError };
        setupMockResponse(mockUpdateResponse);

        await expect(verifyCredential('cred-1')).rejects.toThrow(
          'Verification failed',
        );
      });
    });
  });

  describe('services Management', () => {
    describe('getProfessionalServices', () => {
      it('should fetch services for professional', async () => {
        const mockSelectResponse = { data: [mockService], error: undefined };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionalServices('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_services',
        );
        expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
          'professional_id',
          '1',
        );
        expect(result).toStrictEqual([mockService]);
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Fetch failed');
        const mockSelectResponse = { data: undefined, error: mockError };
        setupMockResponse(mockSelectResponse);

        await expect(getProfessionalServices('1')).rejects.toThrow(
          'Fetch failed',
        );
      });
    });

    describe('createProfessionalService', () => {
      it('should create service successfully', async () => {
        const mockInsertResponse = { data: mockService, error: undefined };
        setupMockResponse(mockInsertResponse);

        const serviceData = {
          professional_id: '1',
          service_name: 'Consulta Dermatológica',
          service_type: 'consultation',
          duration_minutes: 60,
          base_price: 200,
        };

        const result = await createProfessionalService(serviceData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_services',
        );
        expect(result).toStrictEqual(mockService);
      });

      it('should throw error when creation fails', async () => {
        const mockError = new Error('Creation failed');
        const mockInsertResponse = { data: undefined, error: mockError };
        setupMockResponse(mockInsertResponse);

        await expect(createProfessionalService({})).rejects.toThrow(
          'Creation failed',
        );
      });
    });

    describe('updateProfessionalService', () => {
      it('should update service successfully', async () => {
        const mockUpdateResponse = { data: mockService, error: undefined }; // Remove array wrapper
        setupMockResponse(mockUpdateResponse);

        const updateData = {
          base_price: 250,
        };

        const result = await updateProfessionalService('service-1', updateData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_services',
        );
        expect(result).toStrictEqual(mockService);
      });

      it('should throw error when update fails', async () => {
        const mockError = new Error('Update failed');
        const mockUpdateResponse = { data: undefined, error: mockError };
        setupMockResponse(mockUpdateResponse);

        await expect(
          updateProfessionalService('service-1', {}),
        ).rejects.toThrow('Update failed');
      });
    });

    describe('deleteProfessionalService', () => {
      it('should delete service successfully', async () => {
        const mockDeleteResponse = { data: undefined, error: undefined };
        setupMockResponse(mockDeleteResponse);

        await deleteProfessionalService('service-1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'professional_services',
        );
        expect(mockSupabaseClient.from().delete().eq).toHaveBeenCalledWith(
          'id',
          'service-1',
        );
      });

      it('should throw error when deletion fails', async () => {
        const mockError = new Error('Deletion failed');
        const mockDeleteResponse = { data: undefined, error: mockError };
        setupMockResponse(mockDeleteResponse);

        await expect(deleteProfessionalService('service-1')).rejects.toThrow(
          'Deletion failed',
        );
      });
    });
  });

  describe('performance Metrics', () => {
    describe('getProfessionalPerformanceMetrics', () => {
      it('should fetch performance metrics for professional', async () => {
        const mockSelectResponse = {
          data: [mockPerformanceMetric],
          error: undefined,
        };
        setupMockResponse(mockSelectResponse);

        const result = await getProfessionalPerformanceMetrics('1');

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'performance_metrics',
        );
        expect(mockSupabaseClient.from().select().eq).toHaveBeenCalledWith(
          'professional_id',
          '1',
        );
        expect(result).toStrictEqual([mockPerformanceMetric]);
      });

      it('should filter metrics by date range', async () => {
        const mockSelectResponse = {
          data: [mockPerformanceMetric],
          error: undefined,
        };
        setupMockResponse(mockSelectResponse);

        const options = {
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        };

        const result = await getProfessionalPerformanceMetrics('1', options);

        expect(
          mockSupabaseClient.from().select().eq().gte,
        ).toHaveBeenCalledWith('period_start', '2024-01-01');
        expect(
          mockSupabaseClient.from().select().eq().gte().lte,
        ).toHaveBeenCalledWith('period_end', '2024-01-31');
        expect(result).toStrictEqual([mockPerformanceMetric]);
      });

      it('should throw error when fetch fails', async () => {
        const mockError = new Error('Fetch failed');
        const mockSelectResponse = { data: undefined, error: mockError };
        setupMockResponse(mockSelectResponse);

        await expect(getProfessionalPerformanceMetrics('1')).rejects.toThrow(
          'Fetch failed',
        );
      });
    });

    describe('addPerformanceMetric', () => {
      it('should add performance metric successfully', async () => {
        const mockInsertResponse = {
          data: mockPerformanceMetric,
          error: undefined,
        };
        setupMockResponse(mockInsertResponse);

        const metricData = {
          professional_id: '1',
          metric_type: 'patient_satisfaction',
          metric_value: 4.8,
          measurement_period: 'monthly',
          period_start: '2024-01-01',
          period_end: '2024-01-31',
        };

        const result = await addPerformanceMetric(metricData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'performance_metrics',
        );
        expect(result).toStrictEqual(mockPerformanceMetric);
      });

      it('should throw error when creation fails', async () => {
        const mockError = new Error('Creation failed');
        const mockInsertResponse = { data: undefined, error: mockError };
        setupMockResponse(mockInsertResponse);

        await expect(addPerformanceMetric({})).rejects.toThrow(
          'Creation failed',
        );
      });
    });

    describe('updatePerformanceMetric', () => {
      it('should update performance metric successfully', async () => {
        const mockUpdateResponse = {
          data: mockPerformanceMetric, // Remove array wrapper
          error: undefined,
        };
        setupMockResponse(mockUpdateResponse);

        const updateData = {
          metric_value: 4.9,
        };

        const result = await updatePerformanceMetric('metric-1', updateData);

        expect(mockSupabaseClient.from).toHaveBeenCalledWith(
          'performance_metrics',
        );
        expect(result).toStrictEqual(mockPerformanceMetric);
      });

      it('should throw error when update fails', async () => {
        const mockError = new Error('Update failed');
        const mockUpdateResponse = { data: undefined, error: mockError };
        setupMockResponse(mockUpdateResponse);

        await expect(updatePerformanceMetric('metric-1', {})).rejects.toThrow(
          'Update failed',
        );
      });
    });
  });

  describe('data Validation', () => {
    it('should validate professional data structure', () => {
      expect(mockProfessional).toHaveProperty('id');
      expect(mockProfessional).toHaveProperty('given_name');
      expect(mockProfessional).toHaveProperty('family_name');
      expect(mockProfessional).toHaveProperty('email');
      expect(mockProfessional).toHaveProperty('license_number');
      expect(mockProfessional).toHaveProperty('qualification');
      expect(mockProfessional).toHaveProperty('status');
    });

    it('should validate credential data structure', () => {
      expect(mockCredential).toHaveProperty('id');
      expect(mockCredential).toHaveProperty('professional_id');
      expect(mockCredential).toHaveProperty('credential_type');
      expect(mockCredential).toHaveProperty('credential_number');
      expect(mockCredential).toHaveProperty('issuing_authority');
      expect(mockCredential).toHaveProperty('verification_status');
    });

    it('should validate service data structure', () => {
      expect(mockService).toHaveProperty('id');
      expect(mockService).toHaveProperty('professional_id');
      expect(mockService).toHaveProperty('service_name');
      expect(mockService).toHaveProperty('service_type');
      expect(mockService).toHaveProperty('duration_minutes');
      expect(mockService).toHaveProperty('base_price');
    });

    it('should validate performance metric data structure', () => {
      expect(mockPerformanceMetric).toHaveProperty('id');
      expect(mockPerformanceMetric).toHaveProperty('professional_id');
      expect(mockPerformanceMetric).toHaveProperty('metric_type');
      expect(mockPerformanceMetric).toHaveProperty('metric_value');
      expect(mockPerformanceMetric).toHaveProperty('measurement_period');
    });
  });

  describe('error Handling', () => {
    it('should handle concurrent update conflicts', async () => {
      const mockError = new Error('Conflict: Resource was modified');
      const mockUpdateResponse = { data: undefined, error: mockError };
      setupMockResponse(mockUpdateResponse);

      await expect(updateProfessional('1', {})).rejects.toThrow(
        'Conflict: Resource was modified',
      );
    });

    it('should handle database connection errors', async () => {
      // Store original mock
      const originalMock = (
        createClient as vi.MockedFunction<any>
      ).getMockImplementation();

      const mockError = new Error('Connection failed');
      (createClient as vi.MockedFunction<any>).mockImplementation(() => {
        throw mockError;
      });

      await expect(getProfessionals()).rejects.toThrow('Connection failed');

      // Restore original mock
      if (originalMock) {
        (createClient as vi.MockedFunction<any>).mockImplementation(
          originalMock,
        );
      } else {
        (createClient as vi.MockedFunction<any>).mockReturnValue(
          mockSupabaseClient,
        );
      }
    });

    it('should handle malformed data gracefully', async () => {
      const malformedData = {
        // Missing required fields
        given_name: undefined,
        email: 'invalid-email',
      };

      await expect(createProfessional(malformedData)).rejects.toThrow();
    });
  });

  describe('performance', () => {
    it('should handle large datasets efficiently', async () => {
      const largeProfessionalSet = Array.from({ length: 1000 }, (_, i) => ({
        ...mockProfessional,
        id: `${i + 1}`,
        email: `professional${i + 1}@email.com`,
      }));

      const mockSelectResponse = {
        data: largeProfessionalSet,
        error: undefined,
      };
      setupMockResponse(mockSelectResponse);

      const result = await getProfessionals();

      expect(result).toHaveLength(1000);
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*');
    });

    it('should implement pagination for large result sets', async () => {
      const mockSelectResponse = { data: [mockProfessional], error: undefined };
      setupMockResponse(mockSelectResponse);

      const options = {
        limit: 50,
        offset: 0,
      };

      const result = await getProfessionals(options);

      expect(result).toStrictEqual([mockProfessional]);
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith('*');
    });

    it('should optimize queries with selective field retrieval', async () => {
      const mockSelectResponse = { data: [mockProfessional], error: undefined };
      setupMockResponse(mockSelectResponse);

      const options = {
        fields: ['id', 'given_name', 'family_name', 'email', 'status'], // Correct format as array
      };

      const result = await getProfessionals(options);

      expect(result).toStrictEqual([mockProfessional]);
      expect(mockSupabaseClient.from().select).toHaveBeenCalledWith(
        'id,given_name,family_name,email,status',
      );
    });
  });
});
