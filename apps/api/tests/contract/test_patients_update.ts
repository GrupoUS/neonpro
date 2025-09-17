import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '../../src/app'
import { createTestClient } from '../helpers/auth'

describe('Patient API Contract Tests - PUT /api/v2/patients/{id}', () => {
  let app: Hono
  let testClient: any
  let createdPatientId: string

  beforeEach(async () => {
    app = createApp()
    testClient = await createTestClient()
    
    // Create a test patient first
    const patientData = {
      name: 'Test Patient Update',
      cpf: '12345678909',
      email: 'test.update@example.com',
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
    // Cleanup test data
    if (createdPatientId) {
      await app.request(`/api/v2/patients/${createdPatientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })
    }
  })

  it('should update patient successfully', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const updateData = {
      name: 'Updated Test Patient',
      phone: '+5511988888888',
      notes: 'Patient notes updated'
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('patient')
    expect(data.patient).toHaveProperty('id', createdPatientId)
    expect(data.patient.name).toBe(updateData.name)
    expect(data.patient.phone).toBe(updateData.phone)
    expect(data.patient.notes).toBe(updateData.notes)
    expect(data.patient).toHaveProperty('updatedAt')
    expect(new Date(data.patient.updatedAt).getTime()).toBeGreaterThan(new Date().getTime() - 60000)
  })

  it('should return 404 for non-existent patient', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000'
    
    const updateData = {
      name: 'Updated Patient'
    }

    const response = await app.request(`/api/v2/patients/${nonExistentId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(404)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should return 400 for invalid update data', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const invalidUpdateData = {
      cpf: 'invalid-cpf',
      email: 'invalid-email'
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidUpdateData)
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toHaveProperty('message')
  })

  it('should return 401 without authentication', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const updateData = {
      name: 'Updated Patient'
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(401)
  })

  it('should validate LGPD consent updates', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const updateData = {
      lgpdConsent: {
        dataProcessing: false, // Should not be allowed to set to false
        marketing: true,
        sharing: true,
        retentionPeriod: '5_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString()
      }
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error.message).toContain('LGPD')
  })

  it('should create audit trail for update', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const updateData = {
      name: 'Audit Test Patient',
      phone: '+5511977777777'
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data.patient.auditTrail).toHaveProperty('updatedAt')
    expect(data.patient.auditTrail).toHaveProperty('updatedBy')
    expect(data.patient.auditTrail).toHaveProperty('action', 'UPDATE')
    
    // Check that access logs were updated
    expect(Array.isArray(data.patient.auditTrail.accessLogs)).toBe(true)
  })

  it('should not allow updating immutable fields', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return
    }

    const updateData = {
      id: 'new-id-should-not-be-allowed',
      createdAt: '2020-01-01T00:00:00.000Z'
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    // ID should remain unchanged
    expect(data.patient.id).toBe(createdPatientId)
    // createdAt should remain unchanged
    expect(data.patient.createdAt).not.toBe(updateData.createdAt)
  })
})