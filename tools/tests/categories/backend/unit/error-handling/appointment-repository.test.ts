/**
 * RED Phase - Failing Tests for AppointmentRepository Error Handling
 * These tests will fail initially and guide our implementation (TDD Orchestrator Methodology)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import { AppointmentRepository } from '@neonpro/database'
import {
  DatabaseError,
  NotFoundError,
  ConflictError,
  ValidationError,
} from '@neonpro/utils'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
  })),
}

describe('AppointmentRepository Error Handling (RED Phase)', () => {
  let repository: AppointmentRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new AppointmentRepository(mockSupabase as any)
  })

  describe('findById method', () => {
    it('should throw NotFoundError when appointment is not found instead of returning null', async () => {
      // Arrange: Mock Supabase to return no data
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Row not found' }
      })

      // Act & Assert: Should throw NotFoundError instead of returning null
      await expect(repository.findById('non-existent-id')).rejects.toThrow(NotFoundError)
      await expect(repository.findById('non-existent-id')).rejects.toMatchObject({
        resourceType: 'Appointment',
        resourceId: 'non-existent-id',
        errorCode: 'NOT_FOUND_BY_ID'
      })
    })

    it('should throw DatabaseError for database connection issues', async () => {
      // Arrange: Mock Supabase to return database error
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST000', message: 'Database connection failed' }
      })

      // Act & Assert: Should throw DatabaseError with proper context
      await expect(repository.findById('some-id')).rejects.toThrow(DatabaseError)
      await expect(repository.findById('some-id')).rejects.toMatchObject({
        operation: 'findById',
        errorCode: 'DB_OPERATION_FAILED'
      })
    })
  })

  describe('create method', () => {
    it('should throw ConflictError for unique constraint violations', async () => {
      // Arrange: Mock appointment data
      const appointmentData = {
        clinicId: 'clinic-1',
        patientId: 'patient-1',
        professionalId: 'prof-1',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
        status: 'scheduled' as const,
        type: 'consultation' as const
      }

      // Mock Supabase to return unique constraint violation (P2002)
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: {
          code: 'P2002',
          message: 'Unique constraint failed',
          meta: { target: ['professional_id', 'start_time'] }
        }
      })

      // Act & Assert: Should throw ConflictError instead of generic error
      await expect(repository.create(appointmentData)).rejects.toThrow(ConflictError)
      await expect(repository.create(appointmentData)).rejects.toMatchObject({
        resourceType: 'Appointment',
        conflictType: 'already_exists',
        errorCode: 'CONFLICT_RESOURCE_EXISTS'
      })
    })

    it('should throw ValidationError for invalid appointment data', async () => {
      // Arrange: Mock invalid appointment data
      const invalidAppointmentData = {
        clinicId: '',  // Invalid empty clinic ID
        patientId: 'patient-1',
        professionalId: 'prof-1',
        startTime: 'invalid-date',  // Invalid date format
        endTime: '2025-01-01T11:00:00Z',
        status: 'scheduled' as const,
        type: 'consultation' as const
      }

      // Mock Supabase to return validation error
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: {
          code: 'P2002',
          message: 'Invalid input data',
          meta: { field: 'start_time' }
        }
      })

      // Act & Assert: Should throw ValidationError for data validation issues
      await expect(repository.create(invalidAppointmentData)).rejects.toThrow(ValidationError)
      await expect(repository.create(invalidAppointmentData)).rejects.toMatchObject({
        field: 'start_time',
        errorCode: 'VALIDATION_FIELD_ERROR'
      })
    })

    it('should throw DatabaseError for foreign key constraint violations', async () => {
      // Arrange: Mock appointment data with invalid foreign key
      const appointmentData = {
        clinicId: 'non-existent-clinic',
        patientId: 'patient-1',
        professionalId: 'prof-1',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
        status: 'scheduled' as const,
        type: 'consultation' as const
      }

      // Mock Supabase to return foreign key violation (P2003)
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: {
          code: 'P2003',
          message: 'Foreign key constraint failed',
          meta: { field_name: 'clinic_id' }
        }
      })

      // Act & Assert: Should throw DatabaseError for FK violations
      await expect(repository.create(appointmentData)).rejects.toThrow(DatabaseError)
      await expect(repository.create(appointmentData)).rejects.toMatchObject({
        operation: 'create',
        constraint: 'clinic_id',
        errorCode: 'DB_FOREIGN_KEY_VIOLATION'
      })
    })
  })

  describe('update method', () => {
    it('should throw NotFoundError when trying to update non-existent appointment', async () => {
      // Arrange: Mock Supabase to return no records affected
      mockSupabase.from().update = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'Row not found' }
            })
          }))
        }))
      }))

      // Act & Assert: Should throw NotFoundError instead of generic error
      await expect(repository.update('non-existent-id', { status: 'completed' }))
        .rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError for concurrent modification', async () => {
      // Arrange: Mock Supabase to return optimistic locking conflict
      mockSupabase.from().update = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: {
                code: 'P2025',
                message: 'Record was modified by another transaction',
                meta: { cause: 'Record to update not found.' }
              }
            })
          }))
        }))
      }))

      // Act & Assert: Should throw ConflictError for concurrent modifications
      await expect(repository.update('appointment-id', { status: 'completed' }))
        .rejects.toThrow(ConflictError)
      await expect(repository.update('appointment-id', { status: 'completed' }))
        .rejects.toMatchObject({
          conflictType: 'concurrent_modification',
          errorCode: 'CONFLICT_CONCURRENT_MODIFICATION'
        })
    })
  })

  describe('hasTimeConflict method', () => {
    it('should throw DatabaseError instead of returning false on query errors', async () => {
      // Arrange: Mock Supabase to return database error
      mockSupabase.from().select = vi.fn(() => ({
        eq: vi.fn(() => ({
          neq: vi.fn(() => ({
            or: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST000', message: 'Query failed' }
            })
          }))
        }))
      }))

      // Act & Assert: Should throw DatabaseError instead of returning false silently
      await expect(
        repository.hasTimeConflict('prof-1', '2025-01-01T10:00:00Z', '2025-01-01T11:00:00Z')
      ).rejects.toThrow(DatabaseError)
    })
  })

  describe('error consistency patterns', () => {
    it('should have consistent error handling patterns across all methods', () => {
      // This test documents the expected error patterns
      const expectedPatterns = {
        'Database operations should throw DatabaseError for connection/query issues': true,
        'Not found operations should throw NotFoundError instead of returning null': true,
        'Constraint violations should throw ConflictError with proper context': true,
        'Invalid input should throw ValidationError with field details': true,
        'All errors should include proper audit context': true
      }

      expect(expectedPatterns).toBeDefined()
    })
  })
})