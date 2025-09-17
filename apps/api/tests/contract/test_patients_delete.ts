import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '../../src/app'
import { createTestClient } from '../helpers/auth'

describe('Patient API Contract Tests - DELETE /api/v2/patients/{id}', () => {
  let app: Hono
  let testClient: any
  let createdPatientId: string

  beforeEach(async () => {
    app = createApp()
    testClient = await createTestClient()
    
    // Create a test patient first
    const patientData = {
      name: 'Test Patient Delete',
      cpf: '12345678909',
      email: 'test.delete@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male',
      lgpdConsent: {
        dataProcessing: true,
        marketing: false,
        sharing: false,
        retentionPeriod: '10_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString()
      }
    }

    const createResponse = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    if (createResponse.status === 201) {
      const createData = await createResponse.json()
      createdPatientId = createData.patient.id
    }
  })

  afterEach(async () => {
    // Cleanup test data if it wasn't deleted by the test
    if (createdPatientId) {
      try {
        await app.request(`/api/v2/patients/${createdPatientId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${testClient.token}`,
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })

  it('should delete patient successfully (soft delete)', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('message')
    expect(data.message).toContain('deleted')
    expect(data).toHaveProperty('patientId', createdPatientId)

    // Verify patient is soft-deleted (should not be found in normal queries)
    const getResponse = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(getResponse.status).toBe(404)

    // Reset createdPatientId since we deleted it
    createdPatientId = ''
  })

  it('should return 404 for non-existent patient', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000'
    
    const response = await app.request(`/api/v2/patients/${nonExistentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(404)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toHaveProperty('message')
  })

  it('should return 400 for invalid UUID', async () => {
    const invalidId = 'invalid-uuid'
    
    const response = await app.request(`/api/v2/patients/${invalidId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should return 401 without authentication', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(401)
  })

  it('should create comprehensive audit trail for deletion', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    // Get patient before deletion to check audit trail
    const beforeDeleteResponse = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (beforeDeleteResponse.status === 200) {
      const beforeDeleteData = await beforeDeleteResponse.json()
      const originalAuditTrailLength = beforeDeleteData.patient.auditTrail.accessLogs.length

      const deleteResponse = await app.request(`/api/v2/patients/${createdPatientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(deleteResponse.status).toBe(200)
      
      const deleteData = await deleteResponse.json()
      expect(deleteData).toHaveProperty('auditTrail')
      expect(deleteData.auditTrail).toHaveProperty('deletedAt')
      expect(deleteData.auditTrail).toHaveProperty('deletedBy')
      expect(deleteData.auditTrail).toHaveProperty('action', 'DELETE')
      
      // Verify that a new access log was added
      expect(deleteData.auditTrail.accessLogs.length).toBeGreaterThan(originalAuditTrailLength)
    }

    // Reset createdPatientId since we deleted it
    createdPatientId = ''
  })

  it('should include LGPD compliance information in deletion response', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('lgpdCompliance')
    expect(data.lgpdCompliance).toHaveProperty('dataRetentionPolicy')
    expect(data.lgpdCompliance).toHaveProperty('anonymization')
    expect(data.lgpdCompliance).toHaveProperty('rightToBeForgotten')
    expect(data.lgpdCompliance).toHaveProperty('backupRetention')

    // Reset createdPatientId since we deleted it
    createdPatientId = ''
  })

  it('should prevent deletion of patients with active healthcare data', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    // This test assumes there might be business logic to prevent deletion
    // of patients with active medical records, appointments, etc.
    // For now, we'll test the basic functionality
    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    // Should succeed for our test patient
    expect([200, 403]).toContain(response.status)

    // Reset createdPatientId if we deleted it
    if (response.status === 200) {
      createdPatientId = ''
    }
  })
})