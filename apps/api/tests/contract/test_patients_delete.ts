/**
 * CONTRACT TEST: DELETE /api/v2/patients/{id} (T015)
 *
 * Tests patient deletion endpoint contract:
 * - LGPD compliance (soft delete vs hard delete)
 * - Data retention policies
 * - Cascade deletion rules
 * - Audit trail preservation
 * - Performance requirements (<500ms)
 * - Authorization checks
 */

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'

// Response schema for deletion confirmation
const DeletePatientResponseSchema = z.object({
  id: z.string().uuid(),
  deletedAt: z.string().datetime(),
  deletionType: z.enum(['soft', 'hard']),
  dataRetention: z.object({
    auditTrailRetained: z.boolean(),
    medicalHistoryRetained: z.boolean(),
    lgpdComplianceRetained: z.boolean(),
    retentionPeriod: z.string(), // e.g., "7 years"
  }),
  performanceMetrics: z.object({
    duration: z.number().max(500), // Performance requirement: <500ms
    operationsCount: z.number(),
  }),
})

describe('DELETE /api/v2/patients/{id} - Contract Tests', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  }

  let testPatientId: string
  let patientWithDataId: string

  beforeAll(async () => {
    // Create test patients for deletion tests
    const simplePatientResponse = await request(app)
      .post('/api/v2/patients')
      .set(testAuthHeaders)
      .send({
        name: 'Delete Test Patient',
        cpf: '555.666.777-88',
        phone: '(11) 99999-9999',
        email: 'delete.test@example.com',
        dateOfBirth: '1980-12-25T00:00:00.000Z',
        gender: 'male',
        address: {
          street: 'Rua Delete',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
        },
        emergencyContact: {
          name: 'Delete Contact',
          relationship: 'Brother',
          phone: '(11) 88888-8888',
        },
        lgpdConsent: {
          dataProcessing: true,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      })

    testPatientId = simplePatientResponse.body.id

    // Create patient with extensive data for complex deletion test
    const complexPatientResponse = await request(app)
      .post('/api/v2/patients')
      .set(testAuthHeaders)
      .send({
        name: 'Complex Data Patient',
        cpf: '444.333.222-11',
        phone: '(11) 77777-7777',
        email: 'complex.data@example.com',
        dateOfBirth: '1975-07-10T00:00:00.000Z',
        gender: 'female',
        address: {
          street: 'Rua Complexa',
          number: '456',
          neighborhood: 'Vila Rica',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000',
        },
        emergencyContact: {
          name: 'Complex Contact',
          relationship: 'Sister',
          phone: '(21) 66666-6666',
        },
        lgpdConsent: {
          dataProcessing: true,
          marketingCommunications: true,
          thirdPartySharing: false,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      })

    patientWithDataId = complexPatientResponse.body.id

    // Add medical history to complex patient
    await request(app)
      .put(`/api/v2/patients/${patientWithDataId}`)
      .set(testAuthHeaders)
      .send({
        medicalHistory: {
          allergies: ['Penicillin', 'Latex'],
          medications: ['Warfarin', 'Simvastatin'],
          conditions: ['Atrial Fibrillation', 'High Cholesterol'],
          surgeries: [
            {
              procedure: 'Cardiac Ablation',
              date: '2021-09-20T08:00:00.000Z',
              hospital: 'Hospital do Coração',
            },
          ],
        },
      })
  })

  afterAll(async () => {
    // Cleanup any remaining test data
  })

  describe('Successful Deletion', () => {
    it('should soft delete patient with correct schema', async () => {
      const response = await request(app)
        .delete(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200)

      // Validate response schema
      const validatedData = DeletePatientResponseSchema.parse(response.body)
      expect(validatedData).toBeDefined()

      // Validate soft deletion
      expect(response.body.id).toBe(testPatientId)
      expect(response.body.deletionType).toBe('soft')
      expect(response.body.deletedAt).toBeDefined()
    })

    it('should retain audit trail and compliance data', async () => {
      const response = await request(app)
        .delete(`/api/v2/patients/${patientWithDataId}`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.body.dataRetention.auditTrailRetained).toBe(true)
      expect(response.body.dataRetention.lgpdComplianceRetained).toBe(true)
      expect(response.body.dataRetention.retentionPeriod).toBeDefined()
    })

    it('should handle medical history retention based on LGPD requirements', async () => {
      // Create patient specifically for medical history deletion test
      const medicalPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Medical History Patient',
          cpf: '777.888.999-00',
          phone: '(11) 55555-5555',
          email: 'medical.history@example.com',
          dateOfBirth: '1985-03-15T00:00:00.000Z',
          gender: 'other',
          address: {
            street: 'Rua Médica',
            number: '789',
            neighborhood: 'Saúde',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '04000-000',
          },
          emergencyContact: {
            name: 'Medical Contact',
            relationship: 'Parent',
            phone: '(11) 44444-4444',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const medicalPatientId = medicalPatientResponse.body.id

      const response = await request(app)
        .delete(`/api/v2/patients/${medicalPatientId}`)
        .set(testAuthHeaders)
        .expect(200)

      // Medical history retention should follow Brazilian healthcare regulations
      expect(response.body.dataRetention.medicalHistoryRetained).toBe(true)
      expect(response.body.dataRetention.retentionPeriod).toMatch(/years?/)
    })
  })

  describe('Hard Deletion with Explicit Request', () => {
    it('should perform hard deletion when explicitly requested', async () => {
      // Create patient for hard deletion test
      const hardDeletePatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Hard Delete Patient',
          cpf: '111.000.999-88',
          phone: '(11) 33333-3333',
          email: 'hard.delete@example.com',
          dateOfBirth: '1992-11-30T00:00:00.000Z',
          gender: 'male',
          address: {
            street: 'Rua Hard Delete',
            number: '999',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01999-999',
          },
          emergencyContact: {
            name: 'Hard Delete Contact',
            relationship: 'Friend',
            phone: '(11) 22222-2222',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const hardDeletePatientId = hardDeletePatientResponse.body.id

      const response = await request(app)
        .delete(`/api/v2/patients/${hardDeletePatientId}?type=hard`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.body.deletionType).toBe('hard')
      expect(response.body.dataRetention.auditTrailRetained).toBe(true) // Audit trail always retained
      expect(response.body.dataRetention.medicalHistoryRetained).toBe(false)
    })

    it('should require special authorization for hard deletion', async () => {
      // Create patient for authorization test
      const authTestPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Auth Test Patient',
          cpf: '222.111.000-99',
          phone: '(11) 11111-1111',
          email: 'auth.test@example.com',
          dateOfBirth: '1988-06-18T00:00:00.000Z',
          gender: 'female',
          address: {
            street: 'Rua Auth',
            number: '111',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01111-111',
          },
          emergencyContact: {
            name: 'Auth Contact',
            relationship: 'Spouse',
            phone: '(11) 99999-9999',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const authTestPatientId = authTestPatientResponse.body.id

      // Try hard deletion with insufficient permissions
      const insufficientHeaders = {
        Authorization: 'Bearer limited-token',
        'Content-Type': 'application/json',
      }

      await request(app)
        .delete(`/api/v2/patients/${authTestPatientId}?type=hard`)
        .set(insufficientHeaders)
        .expect(403)
    })
  })

  describe('Verification After Deletion', () => {
    it('should return 404 when accessing soft-deleted patient', async () => {
      // Try to access the deleted patient
      await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(404)
    })

    it('should not include deleted patients in listing', async () => {
      const response = await request(app)
        .get('/api/v2/patients')
        .set(testAuthHeaders)
        .expect(200)

      const patientIds = response.body.data.map(p => p.id)
      expect(patientIds).not.toContain(testPatientId)
    })

    it('should prevent operations on deleted patients', async () => {
      // Try to update deleted patient
      await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send({ name: 'Should Not Work' })
        .expect(404)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent patient', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'

      const response = await request(app)
        .delete(`/api/v2/patients/${nonExistentId}`)
        .set(testAuthHeaders)
        .expect(404)

      expect(response.body.error).toContain('Patient not found')
    })

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .delete('/api/v2/patients/invalid-uuid')
        .set(testAuthHeaders)
        .expect(400)
    })

    it('should return 401 for missing authentication', async () => {
      await request(app)
        .delete(`/api/v2/patients/${testPatientId}`)
        .expect(401)
    })

    it('should return 409 for patients with active appointments', async () => {
      // Create patient with active appointment
      const appointmentPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Appointment Patient',
          cpf: '333.444.555-66',
          phone: '(11) 00000-0000',
          email: 'appointment@example.com',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          gender: 'male',
          address: {
            street: 'Rua Appointment',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01000-000',
          },
          emergencyContact: {
            name: 'Appointment Contact',
            relationship: 'Friend',
            phone: '(11) 99999-9999',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const appointmentPatientId = appointmentPatientResponse.body.id

      // TODO: Create active appointment for this patient
      // For now, simulate the conflict response

      const response = await request(app)
        .delete(`/api/v2/patients/${appointmentPatientId}`)
        .set(testAuthHeaders)
        .expect(409)

      expect(response.body.error).toContain('active appointments')
    })
  })

  describe('Performance Requirements', () => {
    it('should delete patient within 500ms', async () => {
      // Create patient for performance test
      const perfPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Performance Test Patient',
          cpf: '666.777.888-99',
          phone: '(11) 98765-4321',
          email: 'performance.delete@example.com',
          dateOfBirth: '1987-04-22T00:00:00.000Z',
          gender: 'female',
          address: {
            street: 'Rua Performance',
            number: '789',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01789-789',
          },
          emergencyContact: {
            name: 'Performance Contact',
            relationship: 'Colleague',
            phone: '(11) 12345-6789',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const perfPatientId = perfPatientResponse.body.id
      const startTime = Date.now()

      const response = await request(app)
        .delete(`/api/v2/patients/${perfPatientId}`)
        .set(testAuthHeaders)
        .expect(200)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(500)
    })
  })

  describe('LGPD Compliance and Audit', () => {
    it('should create comprehensive audit log for deletion', async () => {
      // Create patient for audit test
      const auditPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Audit Test Patient',
          cpf: '888.999.000-11',
          phone: '(11) 87654-3210',
          email: 'audit.delete@example.com',
          dateOfBirth: '1993-09-12T00:00:00.000Z',
          gender: 'other',
          address: {
            street: 'Rua Audit',
            number: '456',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01456-456',
          },
          emergencyContact: {
            name: 'Audit Contact',
            relationship: 'Guardian',
            phone: '(11) 98765-4321',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const auditPatientId = auditPatientResponse.body.id

      const response = await request(app)
        .delete(`/api/v2/patients/${auditPatientId}`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.headers['x-audit-id']).toBeDefined()
      expect(response.headers['x-lgpd-processed']).toBeDefined()
      expect(response.headers['x-patient-deleted']).toBe('true')
      expect(response.headers['x-deletion-type']).toBe('soft')
    })

    it('should handle LGPD right to erasure request', async () => {
      // Create patient for right to erasure test
      const erasurePatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Erasure Request Patient',
          cpf: '999.000.111-22',
          phone: '(11) 76543-2109',
          email: 'erasure@example.com',
          dateOfBirth: '1991-12-05T00:00:00.000Z',
          gender: 'male',
          address: {
            street: 'Rua Erasure',
            number: '789',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01789-789',
          },
          emergencyContact: {
            name: 'Erasure Contact',
            relationship: 'Partner',
            phone: '(11) 87654-3210',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        })

      const erasurePatientId = erasurePatientResponse.body.id

      const response = await request(app)
        .delete(`/api/v2/patients/${erasurePatientId}?lgpd_erasure=true`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.headers['x-lgpd-erasure-request']).toBe('true')
      expect(response.body.dataRetention.auditTrailRetained).toBe(true) // Always keep audit
      expect(response.body.dataRetention.medicalHistoryRetained).toBe(false) // Erasure request
    })
  })
})
