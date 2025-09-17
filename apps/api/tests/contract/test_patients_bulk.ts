import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { app } from '../../index'
import { createTestClient, generateTestCPF } from '../helpers/auth'
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database'

describe('Patients Bulk Operations API', () => {
  let testClient: any

  beforeEach(async () => {
    await setupTestDatabase()
    testClient = await createTestClient({ role: 'admin' })
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  describe('POST /api/v2/patients/bulk-import', () => {
    it('should return 201 for successful bulk import', async () => {
      const patientsData = [
        {
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '+5511999999991',
          cpf: generateTestCPF(),
          birth_date: '1980-01-15',
          gender: 'M',
          blood_type: 'O+',
          address: {
            street: 'Rua A',
            number: '100',
            complement: 'Apto 101',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zip_code: '01001000'
          },
          emergency_contact: {
            name: 'Maria Silva',
            phone: '+5511999999992',
            relationship: 'spouse'
          },
          health_insurance: {
            provider: 'Unimed',
            plan_type: 'comprehensive',
            policy_number: 'UNI123456789',
            valid_until: '2025-12-31'
          },
          lgpd_consent: {
            data_processing: true,
            communication: true,
            storage: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        },
        {
          name: 'Ana Santos',
          email: 'ana.santos@email.com',
          phone: '+5511999999993',
          cpf: generateTestCPF(),
          birth_date: '1985-05-20',
          gender: 'F',
          blood_type: 'A+',
          address: {
            street: 'Av. B',
            number: '200',
            neighborhood: 'Jardins',
            city: 'São Paulo',
            state: 'SP',
            zip_code: '01402000'
          },
          emergency_contact: {
            name: 'Carlos Santos',
            phone: '+5511999999994',
            relationship: 'parent'
          },
          lgpd_consent: {
            data_processing: true,
            communication: false,
            storage: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientsData })
      })

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('imported successfully'),
        imported_count: 2,
        errors: expect.any(Array)
      })
    })

    it('should return 400 for invalid bulk import data', async () => {
      const invalidData = [
        {
          name: '', // Invalid: empty name
          email: 'invalid-email', // Invalid: wrong format
          cpf: '123456', // Invalid: wrong CPF format
          lgpd_consent: {
            data_processing: false, // Invalid: required consent
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: invalidData })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('validation'),
        errors: expect.any(Array)
      })
    })

    it('should return 401 for unauthorized access', async () => {
      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: [] })
      })

      expect(response.status).toBe(401)
    })

    it('should return 403 for non-admin users', async () => {
      const regularClient = await createTestClient({ role: 'clinician' })
      
      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${regularClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: [] })
      })

      expect(response.status).toBe(403)
    })

    it('should return 413 for too many patients in single request', async () => {
      // Generate 1001 patients (over limit)
      const patientsData = Array.from({ length: 1001 }, (_, i) => ({
        name: `Patient ${i}`,
        email: `patient${i}@email.com`,
        cpf: generateTestCPF(),
        birth_date: '1990-01-01',
        gender: 'M',
        lgpd_consent: {
          data_processing: true,
          consent_date: new Date().toISOString(),
          ip_address: '127.0.0.1'
        }
      }))

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientsData })
      })

      expect(response.status).toBe(413)
    })

    it('should validate LGPD compliance for bulk import', async () => {
      const patientsWithoutConsent = [
        {
          name: 'Test Patient',
          email: 'test@email.com',
          cpf: generateTestCPF(),
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: false, // Missing required consent
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientsWithoutConsent })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'lgpd_consent.data_processing',
            message: expect.stringContaining('consent')
          })
        ])
      )
    })

    it('should handle duplicate CPF detection in bulk import', async () => {
      const sameCPF = generateTestCPF()
      const patientsWithDuplicateCPF = [
        {
          name: 'Patient 1',
          email: 'patient1@email.com',
          cpf: sameCPF,
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        },
        {
          name: 'Patient 2',
          email: 'patient2@email.com',
          cpf: sameCPF, // Duplicate CPF
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientsWithDuplicateCPF })
      })

      expect(response.status).toBe(409) // Conflict
      const data = await response.json()
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'cpf',
            message: expect.stringContaining('duplicate')
          })
        ])
      )
    })

    it('should create audit trail for bulk import operations', async () => {
      const patientsData = [
        {
          name: 'Audit Test Patient',
          email: 'audit@email.com',
          cpf: generateTestCPF(),
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': 'bulk-import-test-123'
        },
        body: JSON.stringify({ patients: patientsData })
      })

      expect(response.status).toBe(201)
      
      // Verify audit trail was created (this would require database query)
      // For now, we validate the response includes audit information
      const data = await response.json()
      expect(data).toHaveProperty('audit_id')
      expect(data).toHaveProperty('processed_at')
    })

    it('should return partial success for mixed valid/invalid data', async () => {
      const mixedData = [
        {
          name: 'Valid Patient',
          email: 'valid@email.com',
          cpf: generateTestCPF(),
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        },
        {
          name: '', // Invalid
          email: 'invalid-email', // Invalid
          cpf: '123', // Invalid
          lgpd_consent: {
            data_processing: false, // Invalid
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: mixedData })
      })

      expect(response.status).toBe(207) // Multi-Status
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('partially'),
        imported_count: 1,
        failed_count: 1,
        errors: expect.any(Array)
      })
    })

    it('should validate Brazilian healthcare-specific fields', async () => {
      const patientWithInvalidHealthData = [
        {
          name: 'Health Test Patient',
          email: 'health@email.com',
          cpf: generateTestCPF(),
          birth_date: '1990-01-01',
          gender: 'M',
          blood_type: 'INVALID', // Invalid blood type
          health_insurance: {
            provider: '',
            plan_type: 'invalid_plan_type',
            policy_number: '123',
            valid_until: '2020-01-01' // Past date
          },
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientWithInvalidHealthData })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'blood_type',
            message: expect.stringContaining('blood')
          })
        ])
      )
    })
  })

  describe('POST /api/v2/patients/bulk-update', () => {
    it('should return 200 for successful bulk update', async () => {
      const updateData = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          updates: {
            phone: '+5511999999999',
            health_insurance: {
              provider: 'Amil',
              plan_type: 'premium',
              policy_number: 'AMIL987654321',
              valid_until: '2026-12-31'
            }
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: updateData })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('updated'),
        updated_count: 1
      })
    })

    it('should prevent bulk update of LGPD consent fields', async () => {
      const updateData = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          updates: {
            lgpd_consent: {
              data_processing: false // Should not be updatable via bulk
            }
          }
        }
      ]

      const response = await app.request('/api/v2/patients/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: updateData })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'lgpd_consent',
            message: expect.stringContaining('cannot be updated')
          })
        ])
      )
    })

    it('should validate bulk update request size limits', async () => {
      // Create large update payload that exceeds limits
      const largeUpdateData = Array.from({ length: 1001 }, (_, i) => ({
        id: `550e8400-e29b-41d4-a716-4466554400${String(i).padStart(2, '0')}`,
        updates: {
          phone: `+551199999${String(i).padStart(4, '0')}`
        }
      }))

      const response = await app.request('/api/v2/patients/bulk-update', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ updates: largeUpdateData })
      })

      expect(response.status).toBe(413)
    })
  })

  describe('DELETE /api/v2/patients/bulk-delete', () => {
    it('should return 200 for successful bulk delete with confirmation', async () => {
      const patientIds = [
        '550e8400-e29b-41d4-a716-446655440000',
        '550e8400-e29b-41d4-a716-446655440001'
      ]

      const response = await app.request('/api/v2/patients/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          patient_ids: patientIds,
          confirmation: true,
          reason: 'Data cleanup request'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('deleted'),
        deleted_count: 2
      })
    })

    it('should require confirmation for bulk delete operations', async () => {
      const patientIds = ['550e8400-e29b-41d4-a716-446655440000']

      const response = await app.request('/api/v2/patients/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          patient_ids: patientIds
          // Missing confirmation
        })
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('confirmation')
      })
    })

    it('should create comprehensive audit trail for bulk delete', async () => {
      const patientIds = ['550e8400-e29b-41d4-a716-446655440000']

      const response = await app.request('/api/v2/patients/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
          'X-Request-ID': 'bulk-delete-test-123'
        },
        body: JSON.stringify({ 
          patient_ids: patientIds,
          confirmation: true,
          reason: 'Test bulk delete with audit'
        })
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('audit_id')
      expect(data).toHaveProperty('deleted_at')
    })
  })

  describe('Performance and Rate Limiting', () => {
    it('should enforce rate limiting on bulk operations', async () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 6 }, () => 
        app.request('/api/v2/patients/bulk-import', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${testClient.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ patients: [] })
        })
      )

      const responses = await Promise.all(requests)
      const rateLimitedResponse = responses.find(r => r.status === 429)
      
      expect(rateLimitedResponse).toBeDefined()
      if (rateLimitedResponse) {
        const data = await rateLimitedResponse.json()
        expect(data).toMatchObject({
          success: false,
          message: expect.stringContaining('rate limit')
        })
      }
    })

    it('should include performance metrics in bulk operation responses', async () => {
      const patientsData = [
        {
          name: 'Performance Test Patient',
          email: 'perf@email.com',
          cpf: generateTestCPF(),
          birth_date: '1990-01-01',
          gender: 'M',
          lgpd_consent: {
            data_processing: true,
            consent_date: new Date().toISOString(),
            ip_address: '127.0.0.1'
          }
        }
      ]

      const startTime = Date.now()
      const response = await app.request('/api/v2/patients/bulk-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ patients: patientsData })
      })

      const endTime = Date.now()

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('performance_metrics')
      expect(data.performance_metrics).toMatchObject({
        processing_time_ms: expect.any(Number),
        records_per_second: expect.any(Number),
        memory_usage_mb: expect.any(Number)
      })
    })
  })
})