/**
 * CONTRACT TEST: PUT /api/v2/patients/{id} (T014)
 *
 * Tests patient update endpoint contract:
 * - Request/response schema validation
 * - Partial and full updates
 * - Brazilian data validation (CPF, phone, CEP)
 * - LGPD consent updates and tracking
 * - Optimistic concurrency control
 * - Performance requirements (<500ms)
 */

import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '../../src/app';

// Request schema for updates (all fields optional except ID)
const UpdatePatientRequestSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z
    .string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/)
    .optional(),
  email: z.string().email().optional(),
  address: z
    .object({
      street: z.string().min(1).optional(),
      number: z.string().min(1).optional(),
      complement: z.string().optional(),
      neighborhood: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().length(2).optional(),
      zipCode: z
        .string()
        .regex(/^\d{5}-\d{3}$/)
        .optional(),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().min(2).optional(),
      relationship: z.string().min(1).optional(),
      phone: z
        .string()
        .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/)
        .optional(),
    })
    .optional(),
  medicalHistory: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      surgeries: z
        .array(
          z.object({
            procedure: z.string(),
            date: z.string().datetime(),
            hospital: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  lgpdConsent: z
    .object({
      marketingCommunications: z.boolean().optional(),
      thirdPartySharing: z.boolean().optional(),
      consentDate: z.string().datetime(),
      ipAddress: z.string().ip(),
    })
    .optional(),
  lastModified: z.string().datetime().optional(), // For optimistic concurrency
});

// Response schema validation
const UpdatePatientResponseSchema = z.object({
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
  medicalHistory: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      conditions: z.array(z.string()).optional(),
      surgeries: z
        .array(
          z.object({
            procedure: z.string(),
            date: z.string().datetime(),
            hospital: z.string(),
          }),
        )
        .optional(),
    })
    .optional(),
  lgpdConsent: z.object({
    dataProcessing: z.boolean(),
    marketingCommunications: z.boolean().optional(),
    thirdPartySharing: z.boolean().optional(),
    consentDate: z.string().datetime(),
    consentId: z.string().uuid(),
    lastUpdated: z.string().datetime(),
  }),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  performanceMetrics: z.object({
    duration: z.number().max(500), // Performance requirement: <500ms
    validationTime: z.number(),
  }),
});

describe('PUT /api/v2/patients/{id} - Contract Tests', () => {
  const testAuthHeaders = {
    Authorization: 'Bearer test-token',
    'Content-Type': 'application/json',
  };

  let testPatientId: string;
  let originalPatient: any;

  beforeAll(async () => {
    // Create a test patient for update tests
    const createResponse = await request(app)
      .post('/api/v2/patients')
      .set(testAuthHeaders)
      .send({
        name: 'Update Test Patient',
        cpf: '111.222.333-44',
        phone: '(11) 99999-9999',
        email: 'update.test@example.com',
        dateOfBirth: '1985-08-20T00:00:00.000Z',
        gender: 'female',
        address: {
          street: 'Rua Original',
          number: '100',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01000-000',
        },
        emergencyContact: {
          name: 'Original Contact',
          relationship: 'Mother',
          phone: '(11) 88888-8888',
        },
        lgpdConsent: {
          dataProcessing: true,
          marketingCommunications: true,
          thirdPartySharing: false,
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      });

    testPatientId = createResponse.body.id;
    originalPatient = createResponse.body;
  });

  afterAll(async () => {
    // Cleanup test data
  });

  describe('Successful Updates', () => {
    it('should update patient name with correct schema', async () => {
      const updateData = {
        name: 'Updated Patient Name',
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      // Validate response schema
      const validatedData = UpdatePatientResponseSchema.parse(response.body);
      expect(validatedData).toBeDefined();

      // Validate specific updates
      expect(response.body.name).toBe('Updated Patient Name');
      expect(response.body.id).toBe(testPatientId);
      expect(response.body.updatedAt).not.toBe(originalPatient.updatedAt);
    });

    it('should update contact information', async () => {
      const updateData = {
        phone: '(11) 77777-7777',
        email: 'new.email@example.com',
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.phone).toBe('(11) 77777-7777');
      expect(response.body.email).toBe('new.email@example.com');
    });

    it('should update address information', async () => {
      const updateData = {
        address: {
          street: 'Rua Nova',
          number: '999',
          complement: 'Apt 12',
          neighborhood: 'Vila Nova',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000',
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.address.street).toBe('Rua Nova');
      expect(response.body.address.number).toBe('999');
      expect(response.body.address.complement).toBe('Apt 12');
      expect(response.body.address.city).toBe('Rio de Janeiro');
      expect(response.body.address.state).toBe('RJ');
    });

    it('should update emergency contact', async () => {
      const updateData = {
        emergencyContact: {
          name: 'New Emergency Contact',
          relationship: 'Father',
          phone: '(11) 66666-6666',
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.emergencyContact.name).toBe('New Emergency Contact');
      expect(response.body.emergencyContact.relationship).toBe('Father');
      expect(response.body.emergencyContact.phone).toBe('(11) 66666-6666');
    });
  });

  describe('Medical History Updates', () => {
    it('should update medical history with new information', async () => {
      const updateData = {
        medicalHistory: {
          allergies: ['Peanuts', 'Shellfish'],
          medications: ['Insulin', 'Metformin'],
          conditions: ['Diabetes Type 1', 'High Cholesterol'],
          surgeries: [
            {
              procedure: 'Gallbladder Removal',
              date: '2022-06-15T14:30:00.000Z',
              hospital: 'Hospital Albert Einstein',
            },
          ],
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.medicalHistory.allergies).toContain('Peanuts');
      expect(response.body.medicalHistory.medications).toContain('Insulin');
      expect(response.body.medicalHistory.conditions).toContain(
        'Diabetes Type 1',
      );
      expect(response.body.medicalHistory.surgeries).toHaveLength(1);
      expect(response.body.medicalHistory.surgeries[0].procedure).toBe(
        'Gallbladder Removal',
      );
    });

    it('should append to existing medical history', async () => {
      const updateData = {
        medicalHistory: {
          allergies: ['Latex'], // Add to existing allergies
          medications: ['Aspirin'], // Add to existing medications
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      // Should merge with existing data
      expect(response.body.medicalHistory.allergies).toContain('Latex');
      expect(response.body.medicalHistory.medications).toContain('Aspirin');
    });
  });

  describe('LGPD Consent Updates', () => {
    it('should update LGPD consent preferences', async () => {
      const updateData = {
        lgpdConsent: {
          marketingCommunications: false,
          thirdPartySharing: true,
          consentDate: new Date().toISOString(),
          ipAddress: '192.168.1.1',
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.lgpdConsent.marketingCommunications).toBe(false);
      expect(response.body.lgpdConsent.thirdPartySharing).toBe(true);
      expect(response.body.lgpdConsent.lastUpdated).toBeDefined();

      // Data processing consent should remain unchanged
      expect(response.body.lgpdConsent.dataProcessing).toBe(true);
    });

    it('should track consent update history', async () => {
      const updateData = {
        lgpdConsent: {
          marketingCommunications: true,
          consentDate: new Date().toISOString(),
          ipAddress: '10.0.0.1',
        },
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.lgpdConsent.lastUpdated).toBeDefined();
      expect(response.headers['x-lgpd-consent-updated']).toBe('true');
    });

    it('should not allow updating core data processing consent', async () => {
      const updateData = {
        lgpdConsent: {
          dataProcessing: false, // Should be rejected
          consentDate: new Date().toISOString(),
          ipAddress: '127.0.0.1',
        },
      };

      await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(400);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should validate Brazilian data formats on update', async () => {
      const invalidData = {
        phone: '11999999999', // Missing formatting
        address: {
          zipCode: '01234567', // Missing dash
        },
      };

      await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(invalidData)
        .expect(400);
    });

    it('should prevent updating to duplicate email', async () => {
      // Create another patient first
      const otherPatientResponse = await request(app)
        .post('/api/v2/patients')
        .set(testAuthHeaders)
        .send({
          name: 'Other Patient',
          cpf: '999.888.777-66',
          phone: '(11) 55555-5555',
          email: 'other.patient@example.com',
          dateOfBirth: '1990-01-01T00:00:00.000Z',
          gender: 'male',
          address: {
            street: 'Rua Outro',
            number: '200',
            neighborhood: 'Outro Bairro',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '02000-000',
          },
          emergencyContact: {
            name: 'Other Contact',
            relationship: 'Friend',
            phone: '(11) 44444-4444',
          },
          lgpdConsent: {
            dataProcessing: true,
            consentDate: new Date().toISOString(),
            ipAddress: '127.0.0.1',
          },
        });

      // Try to update our test patient to use the other patient's email
      const updateData = {
        email: 'other.patient@example.com',
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toContain('email');
    });

    it('should return 404 for non-existent patient', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const response = await request(app)
        .put(`/api/v2/patients/${nonExistentId}`)
        .set(testAuthHeaders)
        .send({ name: 'New Name' })
        .expect(404);

      expect(response.body.error).toContain('Patient not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      await request(app)
        .put('/api/v2/patients/invalid-uuid')
        .set(testAuthHeaders)
        .send({ name: 'New Name' })
        .expect(400);
    });
  });

  describe('Optimistic Concurrency Control', () => {
    it('should handle concurrent updates with lastModified', async () => {
      // Get current patient data
      const currentResponse = await request(app)
        .get(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders);

      const updateData = {
        name: 'Concurrent Update Test',
        lastModified: currentResponse.body.updatedAt,
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Concurrent Update Test');
    });

    it('should reject updates with stale lastModified', async () => {
      const staleDate = '2023-01-01T00:00:00.000Z';

      const updateData = {
        name: 'Stale Update',
        lastModified: staleDate,
      };

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send(updateData)
        .expect(409);

      expect(response.body.error).toContain('conflict');
    });
  });

  describe('Performance Requirements', () => {
    it('should update patient within 500ms', async () => {
      const startTime = Date.now();

      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send({ name: 'Performance Test Update' })
        .expect(200);

      const duration = Date.now() - startTime;
      expect(duration).toBeLessThan(500);

      // Should also be included in response metrics
      expect(response.body.performanceMetrics.duration).toBeLessThan(500);
    });
  });

  describe('Audit Trail', () => {
    it('should create audit log entry for patient update', async () => {
      const response = await request(app)
        .put(`/api/v2/patients/${testPatientId}`)
        .set(testAuthHeaders)
        .send({ name: 'Audit Test Update' })
        .expect(200);

      expect(response.headers['x-audit-id']).toBeDefined();
      expect(response.headers['x-lgpd-processed']).toBeDefined();
      expect(response.headers['x-patient-updated']).toBe('true');
    });
  });
});
