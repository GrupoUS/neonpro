import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Hono } from 'hono'
import { createApp } from '../../src/app'
import { createTestClient } from '../helpers/auth'

describe('Patient API Contract Tests - POST /api/v2/patients', () => {
  let app: Hono
  let testClient: any

  beforeEach(async () => {
    app = createApp()
    testClient = await createTestClient()
  })

  afterEach(async () => {
    // Cleanup test data
  })

  it('should create patient with valid data', async () => {
    const patientData = {
      name: 'João Silva',
      cpf: '12345678909',
      email: 'joao.silva@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male',
      address: {
        street: 'Rua Teste',
        number: '123',
        neighborhood: 'Bairro Teste',
        city: 'São Paulo',
        state: 'SP',
        cep: '01234567'
      },
      emergencyContact: {
        name: 'Maria Silva',
        phone: '+5511988888888',
        relationship: 'spouse'
      },
      healthcareInfo: {
        healthPlan: 'Unimed',
        planNumber: '123456789',
        bloodType: 'O+',
        allergies: ['Penicilina'],
        medications: ['Losartana'],
        chronicConditions: ['Hipertensão']
      },
      lgpdConsent: {
        dataProcessing: true,
        marketing: false,
        sharing: false,
        retentionPeriod: '10_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString()
      }
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(201)
    
    const data = await response.json()
    expect(data).toHaveProperty('patient')
    expect(data.patient).toHaveProperty('id')
    expect(data.patient.name).toBe(patientData.name)
    expect(data.patient.cpf).toBe(patientData.cpf)
    expect(data.patient).toHaveProperty('lgpdConsent')
    expect(data.patient).toHaveProperty('auditTrail')
    expect(data.patient).toHaveProperty('createdAt')
    expect(data.patient).toHaveProperty('updatedAt')
  })

  it('should return 400 with invalid CPF', async () => {
    const patientData = {
      name: 'João Silva',
      cpf: 'invalid-cpf',
      email: 'joao.silva@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male'
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error).toHaveProperty('message')
  })

  it('should return 400 with missing required fields', async () => {
    const patientData = {
      name: 'João Silva'
      // Missing required fields: cpf, email, phone, birthDate, gender
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should return 401 without authentication', async () => {
    const patientData = {
      name: 'João Silva',
      cpf: '12345678909',
      email: 'joao.silva@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male'
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(401)
  })

  it('should validate LGPD consent requirements', async () => {
    const patientData = {
      name: 'João Silva',
      cpf: '12345678909',
      email: 'joao.silva@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male',
      lgpdConsent: {
        dataProcessing: false, // Should be true for healthcare
        marketing: false,
        sharing: false,
        retentionPeriod: '10_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString()
      }
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(400)
    
    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data.error.message).toContain('LGPD')
  })

  it('should create audit trail entry', async () => {
    const patientData = {
      name: 'Maria Santos',
      cpf: '98765432100',
      email: 'maria.santos@example.com',
      phone: '+5511977777777',
      birthDate: '1985-05-15',
      gender: 'female',
      lgpdConsent: {
        dataProcessing: true,
        marketing: false,
        sharing: false,
        retentionPeriod: '10_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString()
      }
    }

    const response = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testClient.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(patientData)
    })

    expect(response.status).toBe(201)
    
    const data = await response.json()
    expect(data.patient.auditTrail).toHaveProperty('createdAt')
    expect(data.patient.auditTrail).toHaveProperty('createdBy')
    expect(data.patient.auditTrail).toHaveProperty('action', 'CREATE')
  })
})