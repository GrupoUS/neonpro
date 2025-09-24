/**
 * MSW API Handlers
 *
 * Mock Service Worker handlers for API testing.
 * Provides realistic API responses for testing.
 */

import { http, HttpResponse } from 'msw';
import { TEST_IDS } from './index';

// Auth handlers
export const authHandlers = [
  http.post('http://localhost/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@example.com' && body.password === 'password') {
      return HttpResponse.json({
        user: {
          id: TEST_IDS.USER,
          email: body.email,
          role: 'professional',
        },
        token: 'mock-jwt-token',
      });
    }

    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('http://localhost/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  http.get('http://localhost/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (authHeader === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        id: TEST_IDS.USER,
        email: 'test@example.com',
        role: 'professional',
      });
    }

    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }),
];

// Patient data handlers
export const patientHandlers = [
  http.get('http://localhost/api/patients', ({ request }) => {
    const url = new URL(request.url);
    const clinicId = url.searchParams.get('clinic_id');

    if (!clinicId) {
      return HttpResponse.json(
        { error: 'clinic_id required' },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      patients: [
        {
          id: TEST_IDS.PATIENT,
          name: 'João Silva',
          email: 'joao@example.com',
          clinic_id: clinicId,
          created_at: new Date().toISOString(),
        },
      ],
    });
  }),

  http.get('http://localhost/api/patients/:id', ({ params }) => {
    if (params.id === TEST_IDS.PATIENT) {
      return HttpResponse.json({
        id: TEST_IDS.PATIENT,
        name: 'João Silva',
        email: 'joao@example.com',
        cpf: '123.456.789-00',
        clinic_id: TEST_IDS.CLINIC,
        created_at: new Date().toISOString(),
        // LGPD compliance fields
        consent_given: true,
        data_processing_purpose: 'Healthcare service provision',
        audit_trail: [
          {
            timestamp: new Date().toISOString(),
            action: 'data_access',
            user_id: TEST_IDS.USER,
            data_type: 'patient_data',
            purpose: 'Healthcare service provision',
          },
        ],
      });
    }

    return HttpResponse.json({ error: 'Patient not found' }, { status: 404 });
  }),

  http.post('http://localhost/api/patients', async ({ request }) => {
    const body = (await request.json()) as any;

    // Validate required fields
    if (!body.name || !body.email || !body.clinic_id) {
      return HttpResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate LGPD compliance
    if (!body.consent_given || !body.data_processing_purpose) {
      return HttpResponse.json(
        {
          error: 'LGPD compliance required: consent and purpose must be provided',
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        id: 'new-patient-id',
        ...body,
        created_at: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),
];

// Clinic handlers
export const clinicHandlers = [
  http.get('/api/clinics/:id', ({ params }) => {
    if (params.id === TEST_IDS.CLINIC) {
      return HttpResponse.json({
        id: TEST_IDS.CLINIC,
        name: 'Clínica Teste',
        cnpj: '12.345.678/0001-90',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        created_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json({ error: 'Clinic not found' }, { status: 404 });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  http.get('/api/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }),

  http.get('/api/error/timeout', () => {
    return new Promise(() => {
      // Never resolves - simulates timeout
    });
  }),

  http.get('/api/error/network', () => {
    return HttpResponse.error();
  }),
];

// Combine all handlers
export const handlers = [
  ...authHandlers,
  ...patientHandlers,
  ...clinicHandlers,
  ...errorHandlers,
];
