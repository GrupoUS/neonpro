import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '../../src/app'
import { createTestClient } from '../helpers/auth'

describe('Patient API Contract Tests - GET /api/v2/patients', () => {
  let app: Hono
  let testClient: any

  beforeEach(async () => {
    app = createApp()
    testClient = await createTestClient()
  })

  afterEach(async () => {
    // Cleanup test data
  })

  it('should return 200 with empty patients list', async () => {
    const response = await app.request('/api/v2/patients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('patients')
    expect(data).toHaveProperty('pagination')
    expect(Array.isArray(data.patients)).toBe(true)
    expect(data.pagination).toHaveProperty('page')
    expect(data.pagination).toHaveProperty('limit')
    expect(data.pagination).toHaveProperty('total')
  })

  it('should return 401 without authentication', async () => {
    const response = await app.request('/api/v2/patients', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(401)
  })

  it('should return 400 with invalid pagination parameters', async () => {
    const response = await app.request('/api/v2/patients?page=invalid&limit=abc', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(400)
  })

  it('should support search filtering', async () => {
    const response = await app.request('/api/v2/patients?search=John&status=active', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    expect(data).toHaveProperty('patients')
    expect(data).toHaveProperty('filters')
    expect(data.filters).toHaveProperty('search', 'John')
    expect(data.filters).toHaveProperty('status', 'active')
  })

  it('should return LGPD-compliant patient data', async () => {
    const response = await app.request('/api/v2/patients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    if (data.patients.length > 0) {
      const patient = data.patients[0]
      expect(patient).toHaveProperty('id')
      expect(patient).toHaveProperty('name')
      expect(patient).toHaveProperty('cpf')
      expect(patient).toHaveProperty('lgpdConsent')
      expect(patient).toHaveProperty('auditTrail')
      expect(patient).toHaveProperty('createdAt')
      expect(patient).toHaveProperty('updatedAt')
    }
  })

  it('should include audit trail in response', async () => {
    const response = await app.request('/api/v2/patients', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      }
    })

    expect(response.status).toBe(200)
    
    const data = await response.json()
    if (data.patients.length > 0) {
      const patient = data.patients[0]
      expect(patient.auditTrail).toHaveProperty('accessLogs')
      expect(patient.auditTrail).toHaveProperty('lastAccess')
      expect(patient.auditTrail).toHaveProperty('dataAccessLog')
    }
  })
})