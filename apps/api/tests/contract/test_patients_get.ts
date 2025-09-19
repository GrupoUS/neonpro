/**
 * CONTRACT TEST: GET /api/v2/patients/{id} (T013)
 *
 * Tests individual patient retrieval endpoint contract:
 * - Request/response schema validation
 * - Patient existence validation
 * - LGPD data protection compliance
 * - Performance requirements (<500ms)
 * - Detailed patient data structure
 */

import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { app } from '../../src/app';

// Response schema validation for detailed patient view
const GetPatientResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  email: z.string().email(),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['male', 'female', 'other']),
  status: z.enum(['active', 'inactive', 'archived']),
  address: z.object({
    street: z.string(),
    number: z.string(),
    complement: z.string().optional(),
    neighborhood: z.string(),
    city: z.string(),
    state: z.string().length(2),
    zipCode: z.string().regex(/^\d{5}-\d{3}$/),
  }),
  emergencyContact: z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/),
  }),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    surgeries: z.array(z.object({
      procedure: z.string(),
      date: z.string().datetime(),
      hospital: z.string(),
    })).optional(),
  }).optional(),
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    marketingCommunications: z.boolean().optional(),
    thirdPartySharing: z.boolean().optional(),
    consentDate: z.string().datetime(),
    consentId: z.string().uuid(),
    lastUpdated: z.string().datetime().optional(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  performanceMetrics: z.object({
    duration: z.number().max(500), // Performance requirement: <500ms
    queryCount: z.number(),
  }),
});

describe('GET /api/v2/patients/{id} - Contract Tests', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  };

  let testPatientId: string;

  beforeAll(async () => {
    // Create a test patient for retrieval tests
    const createResponse = await request(app)
      .post('/api/v2/patients')
      .set(testAuthHeaders)
      .send({
        name: 'Test Patient for Retrieval',
        cpf: '123.456.789-01',
        phone: '(11) 99999-9999',
        email: 'test.retrieval@example.com',
        dateOfBirth: '1990-05-15T00:00:00.000Z',
        gender: 'male',
        address: {
          street: 'Rua Teste',
          number: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
        },
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '(11) 88888-8888',
        },
        lgpdConsent: {
          dataProcessing: true,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      });

    testPatientId = createResponse.body.id;
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Successful Retrieval', () => {
    it('should retrieve patient with correct schema and complete data', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      // Validate response schema
      const validatedData = GetPatientResponseSchema.parse(response.body);
      expect(validatedData).toBeDefined();

      // Validate specific fields
      expect(response.body.id).toBe(testPatientId);
      expect(response.body.name).toBe('Test Patient for Retrieval');
      expect(response.body.cpf).toBe('123.456.789-01');
      expect(response.body.email).toBe('test.retrieval@example.com');
    });

    it('should include complete address information', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      expect(response.body.address).toBeDefined();
      expect(response.body.address.street).toBe('Rua Teste');
      expect(response.body.address.number).toBe('123');
      expect(response.body.address.neighborhood).toBe('Centro');
      expect(response.body.address.city).toBe('São Paulo');
      expect(response.body.address.state).toBe('SP');
      expect(response.body.address.zipCode).toBe('01234-567');
    });

    it('should include emergency contact information', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      expect(response.body.emergencyContact).toBeDefined();
      expect(response.body.emergencyContact.name).toBe('Emergency Contact');
      expect(response.body.emergencyContact.relationship).toBe('Family');
      expect(response.body.emergencyContact.phone).toBe('(11) 88888-8888');
    });

    it('should include LGPD consent information', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      expect(response.body.lgpdConsent).toBeDefined();
      expect(response.body.lgpdConsent.dataProcessing).toBe(true);
      expect(response.body.lgpdConsent.consentId).toBeDefined();
      expect(response.body.lgpdConsent.consentDate).toBeDefined();
    });
  });

  describe('Medical History', () => {
    it('should include medical history when available', async () => {
      // Update patient with medical history
      await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send({
          medicalHistory: {
            allergies: ['Penicillin', 'Latex'],
            medications: ['Metformin', 'Losartan'],
            conditions: ['Diabetes Type 2', 'Hypertension'],
            surgeries: [{
              procedure: 'Appendectomy',
              date: '2020-03-15T10:00:00.000Z',
              hospital: 'Hospital São Paulo',
            }],
          },
        });

      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      expect(response.body.medicalHistory).toBeDefined();
      expect(response.body.medicalHistory.allergies).toContain('Penicillin');
      expect(response.body.medicalHistory.medications).toContain('Metformin');
      expect(response.body.medicalHistory.conditions).toContain('Diabetes Type 2');
      expect(response.body.medicalHistory.surgeries).toHaveLength(1);
      expect(response.body.medicalHistory.surgeries[0].procedure).toBe('Appendectomy');
    });

    it('should handle patients without medical history', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      // Medical history should be optional or empty object
      if (response.body.medicalHistory) {
        expect(typeof response.body.medicalHistory).toBe('object');
      }
    });
  });

  describe('Performance Requirements', () => {
    it('should respond within 500ms', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(500);
    });

    it('should minimize database queries', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      // Should use efficient joins, not N+1 queries
      expect(response.body.performanceMetrics.queryCount).toBeLessThan(5);
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent patient', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .get(`/api/v2/patients/${nonExistentId}`)
        .set(testAuthHeaders)
        .expect(404);

      expect(response.body.error).toContain('Patient not found');
      expect(response.body.patientId).toBe(nonExistentId);
    });

    it('should return 400 for invalid UUID format', async () => {
      const invalidId = 'invalid-uuid';

      const response = await request(app)
        .get(`/api/v2/patients/${invalidId}`)
        .set(testAuthHeaders)
        .expect(400);

      expect(response.body.error).toContain('Invalid patient ID format');
    });

    it('should return 401 for missing authentication', async () => {
      await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .expect(401);
    });

    it('should return 403 for insufficient permissions', async () => {
      const restrictedHeaders = {
        Authorization: 'Bearer restricted-token',
        'Content-Type': 'application/json',
      };

      await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(restrictedHeaders)
        .expect(403);
    });
  });

  describe('LGPD Data Protection', () => {
    it('should include LGPD audit headers', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      expect(response.headers['x-lgpd-processed']).toBeDefined();
      expect(response.headers['x-audit-id']).toBeDefined();
      expect(response.headers['x-data-access-logged']).toBe('true');
    });

    it('should respect data masking based on consent level', async () => {
      // Create patient with limited consent
      const limitedConsentResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Limited Consent Patient',
          cpf: '987.654.321-09',
          phone: '(11) 77777-7777',
          email: 'limited@example.com',
          dateOfBirth: '1985-10-20T00:00:00.000Z',
          gender: 'female',
          address: {
            street: 'Rua Limitada',
            number: '456',
            neighborhood: 'Vila Nova',
            city: 'Rio de Janeiro',
            state: 'RJ',
            zipCode: '20000-000',
          },
          emergencyContact: {
            name: 'Limited Emergency',
            relationship: 'Friend',
            phone: '(21) 66666-6666',
          },
          lgpdConsent: {
            dataProcessing: true,
            marketingCommunications: false,
            thirdPartySharing: false,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        });

      const limitedPatientId = limitedConsentResponse.body.id;

      const response = await request(app)
        .get(`/api/v2/patients/${limitedPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      // Should include basic data but respect consent preferences
      expect(response.body.id).toBe(limitedPatientId);
      expect(response.body.lgpdConsent.marketingCommunications).toBe(false);
      expect(response.body.lgpdConsent.thirdPartySharing).toBe(false);
    });
  });

  describe('Brazilian Data Compliance', () => {
    it('should return properly formatted Brazilian data', async () => {
      const response = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .expect(200);

      // Validate Brazilian data formats
      expect(response.body.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);
      expect(response.body.phone).toMatch(/^\(\d{2}\) \d{4,5}-\d{4}$/);
      expect(response.body.address.zipCode).toMatch(/^\d{5}-\d{3}$/);
      expect(response.body.address.state).toHaveLength(2);
      expect(response.body.emergencyContact.phone).toMatch(/^\(\d{2}\) \d{4,5}-\d{4}$/);
    });
  });
});
