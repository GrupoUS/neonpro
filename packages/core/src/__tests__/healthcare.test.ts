import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppointmentService } from '../healthcare/appointment-service.js';
import type { DatabaseConfig } from '@neonpro/database';

// Mock the Supabase client
const mockSupabaseClient = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
};

vi.mock('@neonpro/database', () => ({
  createSupabaseClient: vi.fn(() => mockSupabaseClient),
  createSupabaseAdminClient: vi.fn(() => mockSupabaseClient),
}));

describe('AppointmentService', () => {
  let appointmentService: AppointmentService;
  const mockConfig: DatabaseConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    appointmentService = new AppointmentService(mockConfig);
  });

  describe('list', () => {
    it('should fetch appointments for a clinic', async () => {      const mockAppointments = [
        {
          id: 'appt1',
          clinic_id: 'clinic123',
          patient_id: 'patient1',
          professional_id: 'prof1',
          start_time: '2024-01-01T10:00:00Z',
          end_time: '2024-01-01T11:00:00Z',
          status: 'scheduled' as const,
          service_type: 'consultation'
        }
      ];

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockAppointments,
              error: null
            })
          })
        })
      });

      const result = await appointmentService.list('clinic123');
      
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('appointments');
      expect(result).toEqual(mockAppointments);
    });

    it('should throw error when database query fails', async () => {
      const dbError = new Error('Database connection failed');
      
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: dbError
            })
          })
        })
      });

      await expect(appointmentService.list('clinic123')).rejects.toThrow('Database connection failed');
    });
  });
});