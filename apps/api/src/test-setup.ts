/**
 * Test Setup Configuration
 * Configuração do ambiente de teste com mocks e utilitários
 */

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';

// Mock do banco de dados
export const mockDatabase = {
  setup: vi.fn(),
  cleanup: vi.fn(),
  reset: vi.fn(),
};

// Mock dos middlewares de autenticação
export const mockAuthMiddleware = vi.fn((req, res, next) => {
  req.user = { id: 'test-user-123', role: 'admin' };
  next();
});

// Mock do middleware LGPD
export const mockLgpdMiddleware = vi.fn((req, res, next) => {
  req.lgpdCompliant = true;
  next();
});

// Mock da OpenAPI
export const mockOpenApi = {
  validateRequest: vi.fn(() => ({ valid: true })),
  validateResponse: vi.fn(() => ({ valid: true })),
};

// Armazenar o fetch original
const originalFetch = global.fetch;

// Mock global do fetch
global.fetch = vi.fn(async (url: string | URL, init?: RequestInit) => {
  // Converter URLs relativas para absolutas
  if (url.toString().startsWith('/')) {
    url = `http://localhost:3000${url}`;
  }

  console.log('📍 Processing URL:', url);

  // Handler para tRPC endpoints
  if (url.toString().includes('/api/trpc/')) {
    console.log('🔌 tRPC endpoint called:', url.toString());
    const body = init?.body ? JSON.parse(init.body as string) : {};
    console.log('📝 tRPC Request body:', body);

    // Extrair o procedimento do URL
    const procedureMatch = url.toString().match(/\/api\/trpc\/([^.?]+)/);
    const procedure = procedureMatch ? procedureMatch[1] : '';

    // Mock responses para diferentes procedimentos
    switch (procedure) {
      case 'patients.create':
        console.log('👤 Creating patient');
        const patientData = body[0] || body;
        return new Response(
          JSON.stringify({
            result: {
              data: {
                id: 'patient-' + Math.random().toString(36).substr(2, 9),
                ...patientData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      case 'doctors.create':
        console.log('👨‍⚕️ Creating doctor');
        const doctorData = body[0] || body;
        return new Response(
          JSON.stringify({
            result: {
              data: {
                id: 'doctor-' + Math.random().toString(36).substr(2, 9),
                ...doctorData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      case 'appointments.create':
        console.log('📅 Creating appointment');
        const appointmentData = body[0] || body;
        return new Response(
          JSON.stringify({
            result: {
              data: {
                id: 'appointment-' + Math.random().toString(36).substr(2, 9),
                ...appointmentData,
                status: 'scheduled',
                no_show_prediction: {
                  probability: 0.23,
                  risk_level: 'medium',
                  confidence_score: 0.85,
                  contributing_factors: [
                    'previous_no_show_history',
                    'appointment_time_preference',
                  ],
                  recommended_interventions: ['send_whatsapp_reminder_24h'],
                  model_version: 'v1.0.0',
                  prediction_timestamp: new Date().toISOString(),
                },
                cfm_compliance: {
                  doctor_license_verified: true,
                  telemedicine_authorized: true,
                  specialty_confirmed: true,
                  anvisa_compliance_checked: true,
                },
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      case 'appointments.updateRealTime':
        console.log('🔄 Updating appointment real-time');
        return new Response(
          JSON.stringify({
            result: {
              data: {
                success: true,
                appointment: {
                  id: appointmentData.appointment_id,
                  status: appointmentData.status,
                  updated_at: new Date().toISOString(),
                },
                real_time_update: {
                  broadcast_sent: true,
                  subscription_channels: [
                    `appointment:${appointmentData.appointment_id}`,
                    'clinic:appointments',
                  ],
                  recipients_notified: 2,
                  notification_timestamp: new Date().toISOString(),
                },
                audit_trail: {
                  event_type: 'appointment_status_updated',
                  real_time_broadcast_logged: true,
                  lgpd_compliance_verified: true,
                },
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      case 'appointments.sendWhatsAppReminder':
        console.log('📱 Sending WhatsApp reminder');
        return new Response(
          JSON.stringify({
            result: {
              data: {
                success: true,
                message_sent: true,
                whatsapp_response: {
                  message_id: 'wamid.' + Math.random().toString(36).substr(2, 9),
                  delivery_status: 'sent',
                  recipient_confirmed: true,
                },
                personalization_applied: {
                  template_used: 'appointment_reminder_pt_BR',
                  doctor_name_included: true,
                  instructions_included: true,
                  language_localized: 'pt-BR',
                },
                lgpd_compliance: {
                  consent_timestamp: new Date().toISOString(),
                  data_processing_logged: true,
                  retention_policy_applied: true,
                  patient_rights_respected: true,
                },
                audit_trail: {
                  event_type: 'whatsapp_reminder_sent',
                  message_content_hash: 'hash_' + Math.random().toString(36).substr(2, 9),
                  delivery_attempted_at: new Date().toISOString(),
                },
              },
            },
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        );

      default:
        console.log('❌ Unknown tRPC procedure:', procedure);
        return new Response(
          JSON.stringify({
            error: {
              code: 'NOT_FOUND',
              message: `Procedure '${procedure}' not found`,
            },
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        );
    }
  }

  // Roteamento para endpoints AI
  if (url.toString().includes('/api/v1/ai/analyze')) {
    if (init?.method === 'POST') {
      console.log('🤖 AI Analyze endpoint called');
      const body = init.body ? JSON.parse(init.body as string) : {};
      console.log('📝 Request body:', body);

      // Validação dos dados de entrada
      if (
        body.patientId === 'invalid-patient'
        || body.analysisType === 'invalid_type'
      ) {
        console.log('❌ Invalid data detected, returning 400');
        return new Response(
          JSON.stringify({
            error: 'Paciente inválido - dados não conformes',
            message: 'Os dados fornecidos não atendem aos critérios em português',
            code: 'INVALID_PATIENT_DATA',
            locale: 'pt-BR',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        );
      }

      return new Response(
        JSON.stringify({
          analysisId: 'test-analysis-123',
          recommendations: [
            {
              procedure: 'Exame clínico',
              confidence: 0.95,
              reasoning: 'Baseado nos sintomas apresentados',
              contraindications: ['Alergia conhecida'],
              estimatedCost: {
                currency: 'BRL',
                amount: 150.0,
                paymentMethods: ['PIX', 'Cartão de Crédito'],
              },
            },
          ],
          compliance: {
            lgpdCompliant: true,
            cfmValidated: true,
            anvisaApproved: true,
            auditTrail: 'audit-trail-123',
          },
          dataProtection: {
            anonymized: true,
            pseudonymized: true,
            dataMinimized: true,
            consentVerified: true,
            retentionPeriod: '5 years',
          },
          cfmCompliance: {
            ethicallyApproved: true,
            professionalValidated: true,
            medicalSupervision: true,
            patientConsentDocumented: true,
          },
          costEstimate: {
            currency: 'BRL',
            totalAmount: 150.0,
            breakdown: [
              {
                item: 'Análise AI',
                amount: 100.0,
                description: 'Processamento de análise médica',
              },
              {
                item: 'Validação CFM',
                amount: 50.0,
                description: 'Validação profissional',
              },
            ],
            paymentOptions: [
              {
                method: 'PIX',
                processingTime: 'instantaneo',
                fees: 0.0,
              },
              {
                method: 'Cartão de Crédito',
                processingTime: '1-2 dias úteis',
                fees: 4.5,
              },
            ],
          },
          portugueseContent: true,
          modelUsed: 'gpt-4',
          modelFallbackUsed: false,
          analysisQuality: 0.95,
          processingTime: 1250,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      // Método não suportado
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  // Handler para o endpoint /api/v1/ai/crud
  if (url.toString().includes('/api/v1/ai/crud')) {
    if (init?.method === 'POST') {
      console.log('🔧 AI CRUD endpoint called');
      const body = init.body ? JSON.parse(init.body as string) : {};
      console.log('📝 CRUD Request body:', body);

      return new Response(
        JSON.stringify({
          success: true,
          operationId: 'crud-op-456',
          data: {
            id: 'generated-id-789',
            status: 'processed',
            timestamp: new Date().toISOString(),
          },
          performance: {
            executionTime: 850,
            memoryUsage: '45MB',
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    } else {
      // Método não suportado
      return new Response(
        JSON.stringify({
          error: 'Method not allowed',
        }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }
  }

  // Fallback para URLs não tratadas
  return new Response(
    JSON.stringify({
      error: 'Not found',
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    },
  );
});

// Configurações globais de setup
beforeAll(async () => {
  console.log('🚀 Setting up test environment');
  await mockDatabase.setup();
});

beforeEach(async () => {
  console.log('🔄 Resetting test state');
  await mockDatabase.reset();
});

afterEach(async () => {
  console.log('🧹 Cleaning up after test');
  vi.clearAllMocks();
});

afterAll(async () => {
  console.log('🏁 Tearing down test environment');
  await mockDatabase.cleanup();
  global.fetch = originalFetch;
});
