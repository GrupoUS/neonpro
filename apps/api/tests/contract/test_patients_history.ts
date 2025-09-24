/**
 * CONTRACT TEST: GET /api/v2/patients/{id}/history (T018)
 *
 * Tests patient history endpoint contract:
 * - Complete audit trail and change history
 * - LGPD compliance tracking
 * - Medical history evolution
 * - Performance requirements for history queries
 * - Data version control and rollback capabilities
 */

import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../../src/app'

// History entry schema validation
const HistoryEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: z.string().datetime(),
  action: z.enum([
    'created',
    'updated',
    'deleted',
    'accessed',
    'consents_updated',
    'medical_updated',
  ]),
  actorType: z.enum(['user', 'system', 'api', 'scheduled']),
  actorId: z.string(),
  actorName: z.string(),
  changes: z
    .object({
      field: z.string(),
      oldValue: z.any().optional(),
      newValue: z.any().optional(),
      changeType: z.enum(['create', 'update', 'delete', 'access']),
    })
    .array()
    .optional(),
  metadata: z
    .object({
      ipAddress: z.string().ip().optional(),
      userAgent: z.string().optional(),
      sessionId: z.string().optional(),
      source: z.enum(['web', 'mobile', 'api', 'system']).optional(),
      reason: z.string().optional(),
    })
    .optional(),
  lgpdInfo: z
    .object({
      consentStatus: z.boolean(),
      legalBasis: z.string(),
      dataCategories: z.array(z.string()),
      retentionPeriod: z.string().optional(),
    })
    .optional(),
})

// Patient history response schema validation
const PatientHistoryResponseSchema = z.object({
  patientId: z.string().uuid(),
  summary: z.object({
    totalEntries: z.number().min(0),
    firstActivity: z.string().datetime(),
    lastActivity: z.string().datetime(),
    majorChanges: z.number(),
    accessCount: z.number(),
  }),
  history: z.array(HistoryEntrySchema),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1).max(100),
    total: z.number().min(0),
    hasMore: z.boolean(),
  }),
  filters: z
    .object({
      actionTypes: z.array(z.string()).optional(),
      dateRange: z
        .object({
          startDate: z.string().datetime().optional(),
          endDate: z.string().datetime().optional(),
        })
        .optional(),
      actors: z.array(z.string()).optional(),
    })
    .optional(),
  performanceMetrics: z.object({
    duration: z.number().max(500), // Performance requirement: <500ms
    entriesProcessed: z.number(),
  }),
})

describe('GET /api/v2/patients/{id}/history - Contract Tests', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  }

  let testPatientId: string

  beforeAll(async () => {
    // Create a test patient
    const createResponse = await request(app)
      .post('/api/v2/patients')
      .set(testAuthHeaders)
      .send({
        name: 'History Test Patient',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        email: 'history.test@example.com',
        dateOfBirth: '1985-06-15T00:00:00.000Z',
        gender: 'female',
        address: {
          street: 'Rua History',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
        },
        emergencyContact: {
          name: 'History Emergency',
          relationship: 'Sister',
          phone: '(11) 88888-8888',
        },
        lgpdConsent: {
          dataProcessing: true,
          marketingCommunications: false,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      })

    testPatientId = createResponse.body.id

    // Generate some history by making updates
    await request(app)
      .put(`/api/v2/patients/${testPatientId}`)
      .set(testAuthHeaders)
      .send({
        name: 'Updated History Test Patient',
        phone: '(11) 77777-7777',
      })

    // Update medical history
    await request(app)
      .put(`/api/v2/patients/${testPatientId}`)
      .set(testAuthHeaders)
      .send({
        medicalHistory: {
          allergies: ['Penicillin'],
          medications: ['Aspirin'],
          conditions: ['Migraine'],
        },
      })

    // Update LGPD consent
    await request(app)
      .put(`/api/v2/patients/${testPatientId}`)
      .set(testAuthHeaders)
      .send({
        lgpdConsent: {
          marketingCommunications: true,
          consentDate: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
      })

    // Access patient data to generate access logs
    await request(app)
      .get(`/api/v2/patients/${testPatientId}`)
      .set(testAuthHeaders)
  })

  afterAll(async () => {
    // Cleanup test data
  })

  describe('Basic History Retrieval', () => {
    it('should retrieve patient history with correct schema', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      // Validate response schema
      const validatedData = PatientHistoryResponseSchema.parse(response.body)
      expect(validatedData).toBeDefined()

      // Basic validations
      expect(response.body.patientId).toBe(testPatientId)
      expect(response.body.history.length).toBeGreaterThan(0)
      expect(response.body.summary.totalEntries).toBeGreaterThan(0)
    })

    it('should include creation entry in history', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const creationEntry = response.body.history.find(
        (entry) => entry.action === 'created',
      )
      expect(creationEntry).toBeDefined()
      expect(creationEntry.actorType).toBeDefined()
      expect(creationEntry.timestamp).toBeDefined()
    })

    it('should track all update operations', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const updateEntries = response.body.history.filter(
        (entry) => entry.action === 'updated',
      )
      expect(updateEntries.length).toBeGreaterThan(0)

      // Should have entries for name update, medical history update, and consent update
      const nameUpdate = updateEntries.find((entry) =>
        entry.changes?.some((change) => change.field === 'name')
      )
      expect(nameUpdate).toBeDefined()
    })

    it('should track data access operations', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const accessEntries = response.body.history.filter(
        (entry) => entry.action === 'accessed',
      )
      expect(accessEntries.length).toBeGreaterThan(0)
      expect(response.body.summary.accessCount).toBeGreaterThan(0)
    })
  })

  describe('Change Tracking Details', () => {
    it('should provide detailed change information', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const updateEntry = response.body.history.find(
        (entry) => entry.action === 'updated' && entry.changes,
      )

      if (updateEntry) {
        expect(updateEntry.changes).toBeDefined()
        expect(updateEntry.changes.length).toBeGreaterThan(0)

        updateEntry.changes.forEach((change) => {
          expect(change.field).toBeDefined()
          expect(change.changeType).toBeDefined()
          // oldValue and newValue are optional but should be present for updates
          if (change.changeType === 'update') {
            expect(change.oldValue).toBeDefined()
            expect(change.newValue).toBeDefined()
          }
        })
      }
    })

    it('should track medical history changes separately', async () => {
      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?actionTypes=medical_updated`,
        )
        .set(testAuthHeaders)
        .expect(200)

      const medicalEntries = response.body.history.filter(
        (entry) => entry.action === 'medical_updated',
      )

      if (medicalEntries.length > 0) {
        const medicalEntry = medicalEntries[0]
        expect(medicalEntry.changes).toBeDefined()
        const allergyChange = medicalEntry.changes.find((change) =>
          change.field.includes('allergies')
        )
        expect(allergyChange).toBeDefined()
      }
    })

    it('should track LGPD consent changes', async () => {
      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?actionTypes=consents_updated`,
        )
        .set(testAuthHeaders)
        .expect(200)

      const consentEntries = response.body.history.filter(
        (entry) => entry.action === 'consents_updated',
      )

      if (consentEntries.length > 0) {
        const consentEntry = consentEntries[0]
        expect(consentEntry.lgpdInfo).toBeDefined()
        expect(consentEntry.lgpdInfo.consentStatus).toBeDefined()
        expect(consentEntry.lgpdInfo.legalBasis).toBeDefined()
      }
    })
  })

  describe('Filtering and Pagination', () => {
    it('should filter by action types', async () => {
      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?actionTypes=updated,accessed`,
        )
        .set(testAuthHeaders)
        .expect(200)

      response.body.history.forEach((entry) => {
        expect(['updated', 'accessed']).toContain(entry.action)
      })
    })

    it('should filter by date range', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)

      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?startDate=${yesterday.toISOString()}&endDate=${tomorrow.toISOString()}`,
        )
        .set(testAuthHeaders)
        .expect(200)

      response.body.history.forEach((entry) => {
        const entryDate = new Date(entry.timestamp)
        expect(entryDate.getTime()).toBeGreaterThanOrEqual(yesterday.getTime())
        expect(entryDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime())
      })
    })

    it('should paginate results correctly', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?page=1&limit=2`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.body.history.length).toBeLessThanOrEqual(2)
      expect(response.body.pagination.page).toBe(1)
      expect(response.body.pagination.limit).toBe(2)

      if (response.body.pagination.total > 2) {
        expect(response.body.pagination.hasMore).toBe(true)
      }
    })

    it('should sort by timestamp descending by default', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      // Verify chronological order (newest first)
      for (let i = 1; i < response.body.history.length; i++) {
        const currentTime = new Date(response.body.history[i].timestamp)
        const previousTime = new Date(response.body.history[i - 1].timestamp)
        expect(currentTime.getTime()).toBeLessThanOrEqual(
          previousTime.getTime(),
        )
      }
    })
  })

  describe('Actor and Metadata Tracking', () => {
    it('should track actor information for all changes', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      response.body.history.forEach((entry) => {
        expect(entry.actorType).toBeDefined()
        expect(entry.actorId).toBeDefined()
        expect(entry.actorName).toBeDefined()
      })
    })

    it('should include metadata for user actions', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const userEntries = response.body.history.filter(
        (entry) => entry.actorType === 'user' || entry.actorType === 'api',
      )

      userEntries.forEach((entry) => {
        if (entry.metadata) {
          expect(entry.metadata.ipAddress).toBeDefined()
          expect(entry.metadata.source).toBeDefined()
        }
      })
    })

    it('should filter by actor type', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?actorType=user`)
        .set(testAuthHeaders)
        .expect(200)

      response.body.history.forEach((entry) => {
        expect(entry.actorType).toBe('user')
      })
    })
  })

  describe('LGPD Compliance Tracking', () => {
    it('should include LGPD information for data processing activities', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const dataProcessingEntries = response.body.history.filter(
        (entry) => entry.lgpdInfo && entry.lgpdInfo.consentStatus !== undefined,
      )

      expect(dataProcessingEntries.length).toBeGreaterThan(0)

      dataProcessingEntries.forEach((entry) => {
        expect(entry.lgpdInfo.consentStatus).toBeDefined()
        expect(entry.lgpdInfo.legalBasis).toBeDefined()
        expect(entry.lgpdInfo.dataCategories).toBeDefined()
      })
    })

    it('should track consent withdrawals and updates', async () => {
      // Update consent to withdraw marketing communications
      await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send({
          lgpdConsent: {
            marketingCommunications: false,
            consentDate: new Date().toISOString(),
            ipAddress: '10.0.0.1',
          },
        })

      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?actionTypes=consents_updated`,
        )
        .set(testAuthHeaders)
        .expect(200)

      const consentWithdrawal = response.body.history.find((entry) =>
        entry.changes?.some(
          (change) =>
            change.field === 'marketingCommunications'
            && change.newValue === false,
        )
      )

      expect(consentWithdrawal).toBeDefined()
    })
  })

  describe('Performance Requirements', () => {
    it('should respond within 500ms', async () => {
      const startTime = Date.now()

      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(500)

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(500)
    })

    it('should handle large history queries efficiently', async () => {
      // Request large page size to test performance
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?limit=100`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.body.performanceMetrics.duration).toBeLessThan(500)
      expect(response.body.performanceMetrics.entriesProcessed).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent patient', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000'

      const response = await request(app)
        .get(`/api/v2/patients/${nonExistentId}/history`)
        .set(testAuthHeaders)
        .expect(404)

      expect(response.body.error).toContain('Patient not found')
    })

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .get('/api/v2/patients/invalid-uuid/history')
        .set(testAuthHeaders)
        .expect(400)
    })

    it('should return 401 for missing authentication', async () => {
      await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .expect(401)
    })

    it('should return 400 for invalid date range', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?startDate=invalid-date`)
        .set(testAuthHeaders)
        .expect(400)

      expect(response.body.error).toContain('Invalid date')
    })

    it('should return 400 for invalid pagination parameters', async () => {
      await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?page=0`)
        .set(testAuthHeaders)
        .expect(400)

      await request(app)
        .get(`/api/v2/patients/${testPatientId}/history?limit=101`)
        .set(testAuthHeaders)
        .expect(400)
    })
  })

  describe('History Summary', () => {
    it('should provide accurate summary statistics', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.body.summary.totalEntries).toBe(
        response.body.pagination.total,
      )
      expect(response.body.summary.firstActivity).toBeDefined()
      expect(response.body.summary.lastActivity).toBeDefined()
      expect(response.body.summary.majorChanges).toBeGreaterThanOrEqual(0)
      expect(response.body.summary.accessCount).toBeGreaterThanOrEqual(0)
    })

    it('should track major changes separately', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      // Major changes should include creation, updates, and consent changes
      expect(response.body.summary.majorChanges).toBeGreaterThan(0)
    })
  })

  describe('Export and Audit Features', () => {
    it('should support exporting history for compliance', async () => {
      const response = await request(app)
        .get(
          `/api/v2/patients/${testPatientId}/history?export=true&format=json`,
        )
        .set(testAuthHeaders)
        .expect(200)

      expect(response.headers['x-export-format']).toBe('json')
      expect(response.headers['x-audit-export']).toBe('true')
    })

    it('should include audit headers for history access', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}/history`)
        .set(testAuthHeaders)
        .expect(200)

      expect(response.headers['x-audit-id']).toBeDefined()
      expect(response.headers['x-lgpd-processed']).toBeDefined()
      expect(response.headers['x-history-accessed']).toBe('true')
    })
  })
})
