import { Hono } from 'hono';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app';
import { createTestClient } from '../helpers/auth';

describe('Patient API Contract Tests - POST /api/v2/patients/search', () => {
  let app: Hono;
  let testClient: any;
  let createdPatientIds: string[] = [];

  beforeEach(async () => {
    app = createApp();
    testClient = await createTestClient();

    // Create test patients for search
    const testPatients = [
      {
        name: 'João Silva',
        cpf: '12345678909',
        email: 'joao.silva@example.com',
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
      },
      {
        name: 'Maria Santos',
        cpf: '98765432100',
        email: 'maria.santos@example.com',
        phone: '+5511988888888',
        birthDate: '1985-05-15',
        gender: 'female',
        lgpdConsent: {
          dataProcessing: true,
          marketing: false,
          sharing: false,
          retentionPeriod: '10_years',
          legalBasis: 'consent',
          consentDate: new Date().toISOString(),
        },
      },
      {
        name: 'José Oliveira',
        cpf: '11122233344',
        email: 'jose.oliveira@example.com',
        phone: '+5511977777777',
        birthDate: '1978-12-20',
        gender: 'male',
        status: 'inactive',
        lgpdConsent: {
          dataProcessing: true,
          marketing: false,
          sharing: false,
          retentionPeriod: '10_years',
          legalBasis: 'consent',
          consentDate: new Date().toISOString(),
        },
      },
    ];

    for (const patientData of testPatients) {
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
        createdPatientIds.push(createData.patient.id);
      }
    }
  });

  afterEach(async () => {
    // Cleanup test data
    for (const patientId of createdPatientIds) {
      try {
        await app.request(`/api/v2/patients/${patientId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${testClient.token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
    createdPatientIds = [];
  });

  it('should search patients by name', async () => {
    const searchData = {
      query: 'João',
      searchFields: ['name'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('patients');
    expect(data).toHaveProperty('pagination');
    expect(data).toHaveProperty('searchInfo');
    expect(Array.isArray(data.patients)).toBe(true);

    // Should find at least João Silva
    const joaoPatients = data.patients.filter((p: any) => p.name.includes('João'));
    expect(joaoPatients.length).toBeGreaterThan(0);

    // Verify search info
    expect(data.searchInfo).toHaveProperty('query', 'João');
    expect(data.searchInfo).toHaveProperty('totalResults');
    expect(data.searchInfo.totalResults).toBeGreaterThan(0);
  });

  it('should search patients by CPF', async () => {
    const searchData = {
      query: '12345678909',
      searchFields: ['cpf'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.patients.length).toBe(1);
    expect(data.patients[0].cpf).toBe('12345678909');
    expect(data.patients[0].name).toBe('João Silva');
  });

  it('should search patients by email', async () => {
    const searchData = {
      query: 'maria.santos@example.com',
      searchFields: ['email'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.patients.length).toBe(1);
    expect(data.patients[0].email).toBe('maria.santos@example.com');
    expect(data.patients[0].name).toBe('Maria Santos');
  });

  it('should search patients with status filter', async () => {
    const searchData = {
      query: '',
      searchFields: ['name'],
      filters: {
        status: 'active',
      },
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('status', 'active');

    // Should find active patients (not José Oliveira who is inactive)
    const activePatients = data.patients.filter((p: any) => p.status === 'active');
    expect(activePatients.length).toBeGreaterThan(0);

    // José Oliveira should not be in results
    const josePatients = data.patients.filter((p: any) => p.name.includes('José'));
    expect(josePatients.length).toBe(0);
  });

  it('should search patients with date range filter', async () => {
    const searchData = {
      query: '',
      searchFields: ['name'],
      filters: {
        birthDateFrom: '1980-01-01',
        birthDateTo: '1990-12-31',
      },
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('filters');
    expect(data.filters).toHaveProperty('birthDateFrom', '1980-01-01');
    expect(data.filters).toHaveProperty('birthDateTo', '1990-12-31');

    // Should find patients born between 1980-1990 (João Silva 1990, Maria Santos 1985)
    expect(data.patients.length).toBeGreaterThan(0);
  });

  it('should return 400 for invalid search query', async () => {
    const searchData = {
      query: '', // Empty query without filters
      searchFields: ['name'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
  });

  it('should return 401 without authentication', async () => {
    const searchData = {
      query: 'João',
      searchFields: ['name'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(401);
  });

  it('should support pagination in search results', async () => {
    const searchData = {
      query: '',
      searchFields: ['name'],
      filters: {},
      pagination: {
        page: 1,
        limit: 10,
      },
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('pagination');
    expect(data.pagination).toHaveProperty('page', 1);
    expect(data.pagination).toHaveProperty('limit', 10);
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('totalPages');
  });

  it('should include search performance metrics', async () => {
    const searchData = {
      query: 'João',
      searchFields: ['name'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('performance');
    expect(data.performance).toHaveProperty('executionTime');
    expect(data.performance).toHaveProperty('cacheHit');
    expect(data.performance).toHaveProperty('resultsCount');
    expect(typeof data.performance.executionTime).toBe('number');
  });

  it('should mask sensitive data in search results', async () => {
    const searchData = {
      query: 'João',
      searchFields: ['name'],
      filters: {},
    };

    const response = await app.request('/api/v2/patients/search', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testClient.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData),
    });

    expect(response.status).toBe(200);

    const data = await response.json();
    if (data.patients.length > 0) {
      const patient = data.patients[0];

      // CPF should be masked
      expect(patient.cpf).toMatch(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/);

      // Should have LGPD compliance info
      expect(patient).toHaveProperty('lgpdConsent');
      expect(patient).toHaveProperty('auditTrail');
    }
  });
});
