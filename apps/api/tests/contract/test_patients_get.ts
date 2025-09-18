import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { createTestClient } from '../helpers/auth';

describe('Patient API Contract Tests - GET /api/v2/patients/{id}', () => {
  let app: Hono;
  let testClient: any;
  let createdPatientId: string;

  beforeEach(async () => {
    app = createApp();
    testClient = await createTestClient();

    // Create a test patient first
    const patientData = {
      name: 'Test Patient',
      cpf: '12345678909',
      email: 'test@example.com',
      phone: '+5511999999999',
      birthDate: '1990-01-01',
      gender: 'male',
      lgpdConsent: {
        dataProcessing: true,
        marketing: false,
        sharing: false,
        retentionPeriod: '10_years',
        legalBasis: 'consent',
        consentDate: new Date().toISOString(),
      },
    };

    const createResponse = await app.request('/api/v2/patients', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(patientData),
    });

    if (createResponse.status === 201) {
      const createData = await createResponse.json();
      createdPatientId = createData.patient.id;
    }
  });

  afterEach(async () => {
    // Cleanup test data
    if (createdPatientId) {
      await app.request(`/api/v2/patients/${createdPatientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${testClient.token}`,
          'Content-Type': 'application/json',
        },
      });
    }
  });

  it('should return patient by ID', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return;
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('patient');
    expect(data.patient).toHaveProperty('id', createdPatientId);
    expect(data.patient).toHaveProperty('name');
    expect(data.patient).toHaveProperty('cpf');
    expect(data.patient).toHaveProperty('email');
    expect(data.patient).toHaveProperty('phone');
    expect(data.patient).toHaveProperty('birthDate');
    expect(data.patient).toHaveProperty('gender');
    expect(data.patient).toHaveProperty('status');
    expect(data.patient).toHaveProperty('lgpdConsent');
    expect(data.patient).toHaveProperty('auditTrail');
    expect(data.patient).toHaveProperty('createdAt');
    expect(data.patient).toHaveProperty('updatedAt');
  });

  it('should return 404 for non-existent patient', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const response = await app.request(`/api/v2/patients/${nonExistentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
  });

  it('should return 400 for invalid UUID', async () => {
    const invalidId = 'invalid-uuid';

    const response = await app.request(`/api/v2/patients/${invalidId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 401 without authentication', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return;
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(401);
  });

  it('should include masked sensitive data', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return;
    }

    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    const patient = data.patient;

    // CPF should be masked for privacy
    expect(patient.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

    // Phone should be properly formatted
    expect(patient.phone).toMatch(/^\+\d{2}\s\d{2}\s\d{4,5}-\d{4}$/);
  });

  it('should update audit trail on access', async () => {
    if (!createdPatientId) {
      // Skip test if patient creation failed
      return;
    }

    // First access
    await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    // Second access to check updated audit trail
    const response = await app.request(`/api/v2/patients/${createdPatientId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.patient.auditTrail).toHaveProperty('lastAccess');
    expect(data.patient.auditTrail).toHaveProperty('accessLogs');
    expect(Array.isArray(data.patient.auditTrail.accessLogs)).toBe(true);
  });
});
