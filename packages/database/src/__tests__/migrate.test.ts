/**
 * Data Migration Scripts Tests
 * 
 * TDD RED Phase: Tests for production-ready data migration
 * Following NeonPro quality standards and TDD methodology
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DataMigration, executeFullMigration } from '../migrate'

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({ error: null })),
    delete: vi.fn(() => ({ error: null })),
    neq: vi.fn(() => ({ error: null })),
  })),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabase),
}))

describe('DataMigration', () => {
  let migration: DataMigration
  const testUrl = 'https://test.supabase.co'
  const testKey = 'test-service-role-key'

  beforeEach(() => {
    vi.clearAllMocks()
    migration = new DataMigration(testUrl, testKey, { dryRun: false })
  })

  describe('Constructor', () => {
    it('should create migration instance with default options', () => {
      expect(migration).toBeDefined()
    })

    it('should accept custom options', () => {
      const customMigration = new DataMigration(testUrl, testKey, {
        dryRun: true,
        batchSize: 50,
        logLevel: 'debug',
      })
      
      expect(customMigration).toBeDefined()
    })
  })

  describe('migrateClinics', () => {
    it('should migrate clinics successfully', async () => {
      const clinics = [
        {
          id: '1',
          name: 'Test Clinic',
          slug: 'test-clinic',
          timezone: 'America/Sao_Paulo',
          language: 'pt-BR',
          currency: 'BRL',
        },
      ]

      const result = await migration.migrateClinics(clinics)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(1)
      expect(result.failedCount).toBe(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle dry-run mode', async () => {
      const dryRunMigration = new DataMigration(testUrl, testKey, { dryRun: true })
      const clinics = [{ id: '1', name: 'Test' }]

      const result = await dryRunMigration.migrateClinics(clinics)

      expect(result.migratedCount).toBe(0)
      expect(mockSupabase.from).not.toHaveBeenCalled()
    })

    it('should handle migration errors', async () => {
      mockSupabase.from = vi.fn(() => ({
        insert: vi.fn(() => ({ error: new Error('Database error') })),
      }))

      const clinics = [{ id: '1', name: 'Test' }]
      const result = await migration.migrateClinics(clinics)

      expect(result.success).toBe(false)
      expect(result.failedCount).toBe(1)
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('migrateUsers', () => {
    it('should migrate users successfully', async () => {
      const users = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          lgpd_consent_date: new Date().toISOString(),
        },
      ]

      const result = await migration.migrateUsers(users)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(1)
      expect(result.failedCount).toBe(0)
    })

    it('should handle LGPD compliance fields', async () => {
      const users = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          lgpd_consent_date: new Date().toISOString(),
          phone_number: '+5511999999999',
        },
      ]

      const result = await migration.migrateUsers(users)

      expect(result.success).toBe(true)
    })
  })

  describe('migrateUserClinics', () => {
    it('should migrate user-clinic relationships', async () => {
      const userClinics = [
        {
          user_id: '1',
          clinic_id: '1',
          role: 'admin',
          permissions: ['read', 'write'],
        },
      ]

      const result = await migration.migrateUserClinics(userClinics)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(1)
    })
  })

  describe('migrateAppointments', () => {
    it('should migrate appointments successfully', async () => {
      const appointments = [
        {
          id: '1',
          clinic_id: '1',
          patient_id: '1',
          professional_id: '1',
          status: 'scheduled',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          service_type: 'consultation',
          lgpd_processing_consent: true,
        },
      ]

      const result = await migration.migrateAppointments(appointments)

      expect(result.success).toBe(true)
      expect(result.migratedCount).toBe(1)
    })

    it('should handle LGPD processing consent', async () => {
      const appointments = [
        {
          id: '1',
          clinic_id: '1',
          patient_id: '1',
          professional_id: '1',
          status: 'scheduled',
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          service_type: 'consultation',
          lgpd_processing_consent: false,
        },
      ]

      const result = await migration.migrateAppointments(appointments)

      expect(result.success).toBe(true)
    })
  })

  describe('rollback', () => {
    it('should rollback tables in reverse order', async () => {
      await migration.rollback(['clinics', 'users'])

      expect(mockSupabase.from).toHaveBeenCalledWith('users')
      expect(mockSupabase.from).toHaveBeenCalledWith('clinics')
    })

    it('should handle dry-run mode for rollback', async () => {
      const dryRunMigration = new DataMigration(testUrl, testKey, { dryRun: true })
      
      await dryRunMigration.rollback(['clinics'])

      expect(mockSupabase.from).not.toHaveBeenCalled()
    })
  })
})

describe('executeFullMigration', () => {
  const testData = {
    clinics: [{ id: '1', name: 'Test Clinic' }],
    users: [{ id: '1', email: 'test@example.com', name: 'Test' }],
    userClinics: [{ user_id: '1', clinic_id: '1', role: 'admin' }],
    appointments: [
      {
        id: '1',
        clinic_id: '1',
        patient_id: '1',
        professional_id: '1',
        status: 'scheduled',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        service_type: 'consultation',
      },
    ],
  }

  it('should execute full migration successfully', async () => {
    const result = await executeFullMigration(
      'https://test.supabase.co',
      'test-key',
      testData,
      { dryRun: true }
    )

    expect(result.success).toBe(true)
    expect(result.results.clinics).toBeDefined()
    expect(result.results.users).toBeDefined()
    expect(result.results.userClinics).toBeDefined()
    expect(result.results.appointments).toBeDefined()
  })

  it('should handle migration failures with rollback', async () => {
    mockSupabase.from = vi.fn(() => ({
      insert: vi.fn(() => ({ error: new Error('Migration failed') })),
      delete: vi.fn(() => ({ error: null })),
      neq: vi.fn(() => ({ error: null })),
    }))

    const result = await executeFullMigration(
      'https://test.supabase.co',
      'test-key',
      testData,
      { dryRun: false }
    )

    expect(result.success).toBe(false)
  })

  it('should respect dry-run mode', async () => {
    const result = await executeFullMigration(
      'https://test.supabase.co',
      'test-key',
      testData,
      { dryRun: true }
    )

    expect(result.success).toBe(true)
  })
})
