import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { app } from '../../index'
import { createTestClient, generateTestCPF } from '../helpers/auth'
import { cleanupTestDatabase, setupTestDatabase } from '../helpers/database'

describe('Patients History and Audit Trail API', () => {
  let testClient: any
  let patientId: string

  beforeEach(async () => {
    await setupTestDatabase()
    testClient = await createTestClient({ role: 'admin' })
    
    // Create a test patient first
    const patientData = {
      name: 'History Test Patient',
      email: 'history.test@email.com',
      phone: '+5511999999999',
      cpf: generateTestCPF(),
      birth_date: '1985-03-15',
      gender: 'M',
      blood_type: 'A+',
      address: {
        street: 'Rua das Histórias',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01001000'
      },
      emergency_contact: {
        name: 'Maria Teste',
        phone: '+5511888888888',
        relationship: 'spouse'
      },
      health_insurance: {
        provider: 'Unimed',
        plan_type: 'comprehensive',
        policy_number: 'UNIHIST123456',
        valid_until: '2025-12-31'
      },
      lgpd_consent: {
        data_processing: true,
        communication: true,
        storage: true,
        consent_date: new Date().toISOString(),
        ip_address: '127.0.0.1'
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

    const patientResponse = await response.json()
    patientId = patientResponse.data.id
  })

  afterEach(async () => {
    await cleanupTestDatabase()
  })

  describe('GET /api/v2/patients/{id}/history', () => {
    it('should return 200 with patient history', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        data: expect.objectContaining({
          patient_id: patientId,
          history: expect.any(Array),
          audit_trail: expect.any(Array)
        })
      })
    })

    it('should include creation history in patient history', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      expect(data.data.history).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'created',
            timestamp: expect.any(String),
            user_id: expect.any(String),
            details: expect.objectContaining({
              method: 'POST',
              endpoint: '/api/v2/patients'
            })
          })
        ])
      )
    })

    it('should paginate history results', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/history?page=1&limit=10`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        pagination: expect.objectContaining({
          page: 1,
          limit: 10,
          total: expect.any(Number),
          pages: expect.any(Number)
        })
      })
    })

    it('should filter history by action type', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/history?action=updated`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // All history entries should be updates (none initially since we just created)
      data.data.history.forEach((entry: any) => {
        expect(entry.action).toBe('updated')
      })
    })

    it('should filter history by date range', async () => {
      const startDate = new Date().toISOString()
      const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      const response = await app.request(
        `/api/v2/patients/${patientId}/history?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testClient.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // All history entries should be within the date range
      data.data.history.forEach((entry: any) => {
        const entryDate = new Date(entry.timestamp)
        const start = new Date(startDate)
        const end = new Date(endDate)
        expect(entryDate >= start && entryDate <= end).toBe(true)
      })
    })

    it('should return 404 for non-existent patient', async () => {
      const response = await app.request('/api/v2/patients/550e8400-e29b-41d4-a716-446655449999/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(404)
    })

    it('should return 401 for unauthorized access', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(401)
    })

    it('should return 403 for insufficient permissions', async () => {
      const limitedClient = await createTestClient({ role: 'staff' })
      
      const response = await app.request(`/api/v2/patients/${patientId}/history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${limitedClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/v2/patients/{id}/audit-trail', () => {
    it('should return 200 with audit trail', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        data: expect.objectContaining({
          patient_id: patientId,
          audit_trail: expect.any(Array)
        })
      })
    })

    it('should include comprehensive audit information', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      const auditEntry = data.data.audit_trail[0]
      expect(auditEntry).toMatchObject({
        id: expect.any(String),
        patient_id: patientId,
        action: expect.any(String),
        user_id: expect.any(String),
        user_role: expect.any(String),
        timestamp: expect.any(String),
        ip_address: expect.any(String),
        user_agent: expect.any(String),
        request_id: expect.any(String),
        endpoint: expect.any(String),
        method: expect.any(String),
        changes: expect.any(Object),
        metadata: expect.any(Object)
      })
    })

    it('should include LGPD compliance in audit trail', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      const auditEntry = data.data.audit_trail[0]
      expect(auditEntry.metadata).toMatchObject({
        lgpd_compliant: expect.any(Boolean),
        consent_verified: expect.any(Boolean),
        data_classification: expect.any(String),
        retention_policy: expect.any(String)
      })
    })

    it('should track data access patterns in audit trail', async () => {
      // Access the patient multiple times to track access patterns
      for (let i = 0; i < 3; i++) {
        await app.request(`/api/v2/patients/${patientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': `access-test-${i}`
          }
        })
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // Should have multiple access audit entries
      const accessEntries = data.data.audit_trail.filter((entry: any) => entry.action === 'accessed')
      expect(accessEntries.length).toBeGreaterThan(0)
    })

    it('should include data change tracking in audit trail', async () => {
      // Make an update to track changes
      const updateData = {
        phone: '+5511999999998',
        health_insurance: {
          provider: 'Amil',
          plan_type: 'premium',
          policy_number: 'AMIL987654321',
          valid_until: '2026-12-31'
        }
      }

      await app.request(`/api/v2/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      const updateEntry = data.data.audit_trail.find((entry: any) => entry.action === 'updated')
      expect(updateEntry).toBeDefined()
      expect(updateEntry.changes).toMatchObject({
        phone: expect.any(Object),
        health_insurance: expect.any(Object)
      })
    })

    it('should enforce retention policies on audit trail', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail?retention_days=365`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // All audit entries should be within retention period
      const cutoffDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      data.data.audit_trail.forEach((entry: any) => {
        const entryDate = new Date(entry.timestamp)
        expect(entryDate >= cutoffDate).toBe(true)
      })
    })

    it('should export audit trail for compliance reporting', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail?export=csv&format=lgpd`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toMatch(/csv/)
      expect(response.headers.get('content-disposition')).toMatch(/attachment/)
    })
  })

  describe('POST /api/v2/patients/{id}/audit-report', () => {
    it('should generate comprehensive audit report', async () => {
      const reportRequest = {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        include_access_logs: true,
        include_changes: true,
        include_compliance: true,
        format: 'pdf'
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportRequest)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        report_id: expect.any(String),
        generated_at: expect.any(String),
        download_url: expect.any(String),
        metadata: expect.objectContaining({
          patient_id: patientId,
          report_period: expect.objectContaining({
            start: expect.any(String),
            end: expect.any(String)
          }),
          total_entries: expect.any(Number),
          compliance_score: expect.any(Number)
        })
      })
    })

    it('should validate audit report request parameters', async () => {
      const invalidRequest = {
        start_date: 'invalid-date',
        end_date: new Date().toISOString(),
        format: 'invalid-format'
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invalidRequest)
      })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toMatchObject({
        success: false,
        message: expect.stringContaining('validation'),
        errors: expect.any(Array)
      })
    })

    it('should include LGPD compliance metrics in audit report', async () => {
      const reportRequest = {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        include_compliance: true,
        format: 'lgpd'
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportRequest)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.metadata).toMatchObject({
        compliance_metrics: expect.objectContaining({
          lgpd_consent_compliance: expect.any(Number),
          data_access_authorization: expect.any(Number),
          retention_policy_compliance: expect.any(Number),
          audit_trail_completeness: expect.any(Number)
        })
      })
    })

    it('should require admin privileges for audit report generation', async () => {
      const regularClient = await createTestClient({ role: 'clinician' })
      const reportRequest = {
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date().toISOString(),
        format: 'pdf'
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${regularClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportRequest)
      })

      expect(response.status).toBe(403)
    })
  })

  describe('Security and Compliance', () => {
    it('should include security event tracking in audit trail', async () => {
      // Simulate suspicious access patterns
      for (let i = 0; i < 10; i++) {
        await app.request(`/api/v2/patients/${patientId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
            'X-Request-ID': `security-test-${i}`,
            'X-Forwarded-For': `192.168.1.${i}`
          }
        })
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // Should detect and flag suspicious access patterns
      const securityEvents = data.data.audit_trail.filter((entry: any) => 
        entry.metadata && entry.metadata.security_flagged
      )
      expect(securityEvents.length).toBeGreaterThan(0)
    })

    it('should enforce data minimization in audit trail responses', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      
      // Should not include sensitive patient data in audit trail
      data.data.audit_trail.forEach((entry: any) => {
        expect(entry).not.toHaveProperty('patient_data')
        expect(entry).not.toHaveProperty('medical_records')
        expect(entry).not.toHaveProperty('sensitive_information')
      })
    })

    it('should provide audit trail integrity verification', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        integrity_verified: expect.any(Boolean),
        verification_timestamp: expect.any(String),
        hash_algorithm: expect.any(String),
        total_entries: expect.any(Number),
        anomalies: expect.any(Array)
      })
    })

    it('should support audit trail data export for compliance', async () => {
      const exportRequest = {
        format: 'lgpd',
        include_metadata: true,
        encryption: true,
        purpose: 'compliance_export',
        retention_period_days: 2555 // 7 years for LGPD
      }

      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail/export`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportRequest)
      })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toMatchObject({
        success: true,
        export_id: expect.any(String),
        download_url: expect.any(String),
        expires_at: expect.any(String),
        encryption_fingerprint: expect.any(String),
        metadata: expect.objectContaining({
          format: 'lgpd',
          total_records: expect.any(Number),
          compliance_certified: expect.any(Boolean)
        })
      })
    })
  })

  describe('Performance and Scalability', () => {
    it('should handle large audit trail datasets efficiently', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail?page=1&limit=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json'
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('x-response-time')).toBeDefined()
      
      const data = await response.json()
      expect(data.performance_metrics).toMatchObject({
        query_time_ms: expect.any(Number),
        result_count: expect.any(Number),
        cache_hit: expect.any(Boolean)
      })
    })

    it('should support real-time audit trail streaming', async () => {
      const response = await app.request(`/api/v2/patients/${patientId}/audit-trail/stream`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        }
      })

      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toMatch(/text\/event-stream/)
    })
  })
})