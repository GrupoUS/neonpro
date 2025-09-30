import { describe, it, expect } from 'vitest'
import {
  AppointmentSchema,
  CreateAppointmentSchema,
  UserSchema
} from '../index.js'

describe('Types and Schemas', () => {
  describe('AppointmentSchema', () => {
    it('should validate valid appointment data', () => {
      const validAppointment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        clinic_id: '123e4567-e89b-12d3-a456-426614174001',
        patient_id: '123e4567-e89b-12d3-a456-426614174002',
        professional_id: '123e4567-e89b-12d3-a456-426614174003',
        status: 'scheduled',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        service_type: 'consultation',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T09:00:00Z',
        version: 1,
        lgpd_processing_consent: true
      };

      const result = AppointmentSchema.safeParse(validAppointment);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID format', () => {
      const invalidAppointment = {
        id: 'invalid-uuid',
        clinic_id: '123e4567-e89b-12d3-a456-426614174001',
        patient_id: '123e4567-e89b-12d3-a456-426614174002',
        professional_id: '123e4567-e89b-12d3-a456-426614174003',
        status: 'scheduled',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        service_type: 'consultation',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T09:00:00Z',
        version: 1,
        lgpd_processing_consent: true
      };

      const result = AppointmentSchema.safeParse(invalidAppointment);
      expect(result.success).toBe(false);
    });

    it('should reject invalid status', () => {
      const invalidAppointment = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        clinic_id: '123e4567-e89b-12d3-a456-426614174001',
        patient_id: '123e4567-e89b-12d3-a456-426614174002',
        professional_id: '123e4567-e89b-12d3-a456-426614174003',
        status: 'invalid-status',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        service_type: 'consultation',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T09:00:00Z',
        version: 1,
        lgpd_processing_consent: true
      };

      const result = AppointmentSchema.safeParse(invalidAppointment);
      expect(result.success).toBe(false);
    });
  });

  describe('CreateAppointmentSchema', () => {
    it('should validate appointment creation with future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      
      const validCreation = {
        clinic_id: '123e4567-e89b-12d3-a456-426614174001',
        patient_id: '123e4567-e89b-12d3-a456-426614174002',
        professional_id: '123e4567-e89b-12d3-a456-426614174003',
        status: 'scheduled',
        start_time: futureDate.toISOString(),
        end_time: new Date(futureDate.getTime() + 60 * 60 * 1000).toISOString(),
        service_type: 'consultation',
        lgpd_processing_consent: true
      };

      const result = CreateAppointmentSchema.safeParse(validCreation);
      expect(result.success).toBe(true);
    });
  });

  describe('UserSchema', () => {
    it('should validate valid user data', () => {
      const validUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'doctor@clinic.com',
        name: 'Dr. João Silva',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T09:00:00Z',
        professional_license: 'CRM-SP 123456',
        specialization: ['dermatologia', 'estética'],
        lgpd_consent_date: '2024-01-01T09:00:00Z'
      };

      const result = UserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'invalid-email',
        name: 'Dr. João Silva',
        created_at: '2024-01-01T09:00:00Z',
        updated_at: '2024-01-01T09:00:00Z'
      };

      const result = UserSchema.safeParse(invalidUser);
      expect(result.success).toBe(false);
    });
  });
});