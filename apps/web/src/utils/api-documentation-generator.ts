/**
 * API Documentation Generator
 * T084 - Comprehensive Documentation
 *
 * Generates comprehensive API documentation for healthcare endpoints:
 * - Patient management APIs with LGPD compliance
 * - Appointment scheduling APIs with accessibility features
 * - AI features APIs with mobile optimization
 * - Authentication and error handling patterns
 * - Brazilian Portuguese descriptions and examples
 */

import { z } from 'zod';

// API Documentation Types
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type APIMethod = (typeof API_METHODS)[keyof typeof API_METHODS];

// API Endpoint Categories
export const API_CATEGORIES = {
  PATIENT_MANAGEMENT: 'patient_management',
  APPOINTMENT_SCHEDULING: 'appointment_scheduling',
  MEDICAL_RECORDS: 'medical_records',
  AI_FEATURES: 'ai_features',
  AUTHENTICATION: 'authentication',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  COMPLIANCE: 'compliance',
  MOBILE_API: 'mobile_api',
} as const;

export type APICategory = (typeof API_CATEGORIES)[keyof typeof API_CATEGORIES];

// API Endpoint Schema
export const APIEndpointSchema = z.object({
  id: z.string(),
  path: z.string(),
  method: z.nativeEnum(API_METHODS),
  category: z.nativeEnum(API_CATEGORIES),
  title: z.string(),
  titlePtBr: z.string().optional(),
  description: z.string(),
  descriptionPtBr: z.string().optional(),
  authentication: z.object({
    required: z.boolean(),
    type: z.enum(['bearer', 'api_key', 'oauth2']).optional(),
    scopes: z.array(z.string()).optional(),
    lgpdConsent: z.boolean().optional(),
  }),
  parameters: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['path', 'query', 'header', 'body']),
        dataType: z.string(),
        required: z.boolean(),
        description: z.string(),
        descriptionPtBr: z.string().optional(),
        example: z.any().optional(),
        validation: z.string().optional(),
        healthcareContext: z.string().optional(),
      }),
    )
    .optional(),
  requestBody: z
    .object({
      contentType: z.string(),
      schema: z.any(),
      example: z.any(),
      healthcareFields: z.array(z.string()).optional(),
      lgpdFields: z.array(z.string()).optional(),
    })
    .optional(),
  responses: z.array(
    z.object({
      statusCode: z.number(),
      description: z.string(),
      descriptionPtBr: z.string().optional(),
      schema: z.any().optional(),
      example: z.any().optional(),
      headers: z.record(z.string()).optional(),
    }),
  ),
  errors: z
    .array(
      z.object({
        code: z.string(),
        statusCode: z.number(),
        message: z.string(),
        messagePtBr: z.string().optional(),
        description: z.string(),
        descriptionPtBr: z.string().optional(),
        resolution: z.string(),
        resolutionPtBr: z.string().optional(),
      }),
    )
    .optional(),
  examples: z
    .array(
      z.object({
        title: z.string(),
        titlePtBr: z.string().optional(),
        description: z.string(),
        descriptionPtBr: z.string().optional(),
        request: z.any(),
        response: z.any(),
        healthcareContext: z.string().optional(),
        accessibilityNotes: z.string().optional(),
        mobileNotes: z.string().optional(),
      }),
    )
    .optional(),
  metadata: z.object({
    version: z.string(),
    deprecated: z.boolean().optional(),
    rateLimit: z
      .object({
        requests: z.number(),
        window: z.string(),
      })
      .optional(),
    caching: z
      .object({
        cacheable: z.boolean(),
        ttl: z.number().optional(),
      })
      .optional(),
    compliance: z
      .object({
        lgpd: z.boolean().optional(),
        anvisa: z.boolean().optional(),
        cfm: z.boolean().optional(),
        wcag: z.boolean().optional(),
      })
      .optional(),
    mobileOptimized: z.boolean().optional(),
    lastUpdated: z.date(),
  }),
});

export type APIEndpoint = z.infer<typeof APIEndpointSchema>;

// API Documentation Report
export interface APIDocumentationReport {
  endpoints: APIEndpoint[];
  categories: APICategory[];
  totalEndpoints: number;
  authenticationMethods: string[];
  complianceFeatures: {
    lgpdCompliant: number;
    anvisaCompliant: number;
    cfmCompliant: number;
    wcagCompliant: number;
  };
  mobileOptimized: number;
  lastGenerated: Date;
  version: string;
}

// Brazilian Portuguese API Labels
export const API_LABELS_PT_BR = {
  // HTTP Methods
  [API_METHODS.GET]: 'BUSCAR',
  [API_METHODS.POST]: 'CRIAR',
  [API_METHODS.PUT]: 'ATUALIZAR',
  [API_METHODS.PATCH]: 'MODIFICAR',
  [API_METHODS.DELETE]: 'EXCLUIR',

  // Categories
  [API_CATEGORIES.PATIENT_MANAGEMENT]: 'Gestão de Pacientes',
  [API_CATEGORIES.APPOINTMENT_SCHEDULING]: 'Agendamento de Consultas',
  [API_CATEGORIES.MEDICAL_RECORDS]: 'Prontuários Médicos',
  [API_CATEGORIES.AI_FEATURES]: 'Recursos de IA',
  [API_CATEGORIES.AUTHENTICATION]: 'Autenticação',
  [API_CATEGORIES.NOTIFICATIONS]: 'Notificações',
  [API_CATEGORIES.ANALYTICS]: 'Análises',
  [API_CATEGORIES.COMPLIANCE]: 'Conformidade',
  [API_CATEGORIES.MOBILE_API]: 'API Móvel',

  // Common Terms
  // Note: keys like 'authentication' and 'compliance' are already represented via API_CATEGORIES mapping to avoid duplicate keys here.
  authorization: 'Autorização',
  parameters: 'Parâmetros',
  requestBody: 'Corpo da Requisição',
  response: 'Resposta',
  errors: 'Erros',
  examples: 'Exemplos',
  required: 'Obrigatório',
  optional: 'Opcional',
  deprecated: 'Descontinuado',
  rateLimit: 'Limite de Taxa',
  caching: 'Cache',
  mobileOptimized: 'Otimizado para Móvel',
  healthcareContext: 'Contexto de Saúde',
  lgpdConsent: 'Consentimento LGPD',
} as const;

/**
 * API Documentation Generator
 */
export class APIDocumentationGenerator {
  private endpoints: APIEndpoint[] = [];

  constructor() {
    this.initializeHealthcareEndpoints();
  }

  /**
   * Initialize healthcare API endpoints
   */
  private initializeHealthcareEndpoints(): void {
    // Patient Management Endpoints
    this.endpoints.push({
      id: 'get-patient',
      path: '/api/patients/{id}',
      method: API_METHODS.GET,
      category: API_CATEGORIES.PATIENT_MANAGEMENT,
      title: 'Get Patient Information',
      titlePtBr: 'Obter Informações do Paciente',
      description: 'Retrieve detailed patient information with LGPD compliance',
      descriptionPtBr: 'Recuperar informações detalhadas do paciente com conformidade LGPD',
      authentication: {
        required: true,
        type: 'bearer',
        scopes: ['patient:read'],
        lgpdConsent: true,
      },
      parameters: [
        {
          name: 'id',
          type: 'path',
          dataType: 'string',
          required: true,
          description: 'Patient unique identifier',
          descriptionPtBr: 'Identificador único do paciente',
          example: 'pat_123456789',
          validation: 'UUID format',
          healthcareContext: 'Patient identification for medical records access',
        },
      ],
      responses: [
        {
          statusCode: 200,
          description: 'Patient information retrieved successfully',
          descriptionPtBr: 'Informações do paciente recuperadas com sucesso',
          example: {
            id: 'pat_123456789',
            name: 'João Silva',
            cpf: '***.***.***-**', // Masked for LGPD compliance
            birthDate: '1985-03-15',
            phone: '(11) 99999-****', // Partially masked
            email: 'joao.silva@email.com',
            medicalHistory: {
              allergies: ['Penicilina'],
              chronicConditions: ['Hipertensão'],
              medications: ['Losartana 50mg'],
            },
            accessibility: {
              screenReaderOptimized: true,
              mobileOptimized: true,
              keyboardNavigable: true,
            },
            lgpdConsent: {
              dataProcessing: true,
              medicalTreatment: true,
              marketingCommunications: false,
              consentDate: '2024-01-15T10:30:00Z',
            },
          },
        },
        {
          statusCode: 404,
          description: 'Patient not found',
          descriptionPtBr: 'Paciente não encontrado',
        },
      ],
      errors: [
        {
          code: 'PATIENT_NOT_FOUND',
          statusCode: 404,
          message: 'Patient not found',
          messagePtBr: 'Paciente não encontrado',
          description: 'The specified patient ID does not exist in the system',
          descriptionPtBr: 'O ID do paciente especificado não existe no sistema',
          resolution: 'Verify the patient ID and try again',
          resolutionPtBr: 'Verifique o ID do paciente e tente novamente',
        },
        {
          code: 'LGPD_CONSENT_REQUIRED',
          statusCode: 403,
          message: 'LGPD consent required',
          messagePtBr: 'Consentimento LGPD obrigatório',
          description: 'Patient has not provided consent for data access',
          descriptionPtBr: 'Paciente não forneceu consentimento para acesso aos dados',
          resolution: 'Request patient consent before accessing data',
          resolutionPtBr: 'Solicite consentimento do paciente antes de acessar os dados',
        },
      ],
      examples: [
        {
          title: 'Basic Patient Information Request',
          titlePtBr: 'Requisição Básica de Informações do Paciente',
          description: 'Standard patient data retrieval with LGPD compliance',
          descriptionPtBr: 'Recuperação padrão de dados do paciente com conformidade LGPD',
          request: {
            method: 'GET',
            url: '/api/patients/pat_123456789',
            headers: {
              Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              'X-LGPD-Consent': 'true',
              Accept: 'application/json',
              'User-Agent': 'NeonPro-Mobile/1.0.0',
            },
          },
          response: {
            status: 200,
            data: {
              id: 'pat_123456789',
              name: 'João Silva',
              accessibility: {
                screenReaderOptimized: true,
                mobileOptimized: true,
              },
            },
          },
          healthcareContext: 'Accessing patient data for medical consultation',
          accessibilityNotes: 'Response includes accessibility metadata for screen readers',
          mobileNotes: 'Optimized payload size for mobile applications',
        },
      ],
      metadata: {
        version: '1.0.0',
        deprecated: false,
        rateLimit: {
          requests: 100,
          window: '1h',
        },
        caching: {
          cacheable: true,
          ttl: 300, // 5 minutes
        },
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          wcag: true,
        },
        mobileOptimized: true,
        lastUpdated: new Date(),
      },
    });

    // Appointment Scheduling Endpoint
    this.endpoints.push({
      id: 'create-appointment',
      path: '/api/appointments',
      method: API_METHODS.POST,
      category: API_CATEGORIES.APPOINTMENT_SCHEDULING,
      title: 'Create Appointment',
      titlePtBr: 'Criar Consulta',
      description: 'Schedule a new appointment with accessibility features',
      descriptionPtBr: 'Agendar nova consulta com recursos de acessibilidade',
      authentication: {
        required: true,
        type: 'bearer',
        scopes: ['appointment:create'],
        lgpdConsent: true,
      },
      requestBody: {
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            patientId: { type: 'string', description: 'Patient ID' },
            doctorId: { type: 'string', description: 'Doctor ID' },
            dateTime: { type: 'string', format: 'date-time' },
            type: {
              type: 'string',
              enum: ['consultation', 'followup', 'emergency'],
            },
            accessibility: {
              type: 'object',
              properties: {
                wheelchairAccess: { type: 'boolean' },
                signLanguageInterpreter: { type: 'boolean' },
                largeTextDisplay: { type: 'boolean' },
              },
            },
          },
          required: ['patientId', 'doctorId', 'dateTime', 'type'],
        },
        example: {
          patientId: 'pat_123456789',
          doctorId: 'doc_987654321',
          dateTime: '2024-02-15T14:30:00Z',
          type: 'consultation',
          accessibility: {
            wheelchairAccess: true,
            signLanguageInterpreter: false,
            largeTextDisplay: true,
          },
          notes: 'Paciente com necessidades especiais de acessibilidade',
        },
        healthcareFields: ['patientId', 'doctorId', 'type', 'accessibility'],
        lgpdFields: ['patientId', 'notes'],
      },
      responses: [
        {
          statusCode: 201,
          description: 'Appointment created successfully',
          descriptionPtBr: 'Consulta criada com sucesso',
          example: {
            id: 'apt_456789123',
            patientId: 'pat_123456789',
            doctorId: 'doc_987654321',
            dateTime: '2024-02-15T14:30:00Z',
            status: 'scheduled',
            accessibility: {
              wheelchairAccess: true,
              largeTextDisplay: true,
            },
            mobileOptimized: true,
          },
        },
      ],
      errors: [
        {
          code: 'APPOINTMENT_CONFLICT',
          statusCode: 409,
          message: 'Appointment time conflict',
          messagePtBr: 'Conflito de horário da consulta',
          description: 'The requested time slot is already booked',
          descriptionPtBr: 'O horário solicitado já está reservado',
          resolution: 'Choose a different time slot',
          resolutionPtBr: 'Escolha um horário diferente',
        },
      ],
      examples: [
        {
          title: 'Accessible Appointment Creation',
          titlePtBr: 'Criação de Consulta Acessível',
          description: 'Creating appointment with accessibility requirements',
          descriptionPtBr: 'Criando consulta com requisitos de acessibilidade',
          request: {
            method: 'POST',
            url: '/api/appointments',
            headers: {
              Authorization: 'Bearer token',
              'Content-Type': 'application/json',
              'X-LGPD-Consent': 'true',
            },
            body: {
              patientId: 'pat_123456789',
              doctorId: 'doc_987654321',
              dateTime: '2024-02-15T14:30:00Z',
              type: 'consultation',
              accessibility: {
                wheelchairAccess: true,
                largeTextDisplay: true,
              },
            },
          },
          response: {
            status: 201,
            data: {
              id: 'apt_456789123',
              status: 'scheduled',
              accessibility: {
                wheelchairAccess: true,
                largeTextDisplay: true,
              },
            },
          },
          healthcareContext: 'Scheduling consultation with accessibility accommodations',
          accessibilityNotes: 'Appointment includes accessibility requirements for patient needs',
          mobileNotes: 'Mobile-optimized appointment creation with touch-friendly interface',
        },
      ],
      metadata: {
        version: '1.0.0',
        deprecated: false,
        rateLimit: {
          requests: 50,
          window: '1h',
        },
        compliance: {
          lgpd: true,
          anvisa: true,
          cfm: true,
          wcag: true,
        },
        mobileOptimized: true,
        lastUpdated: new Date(),
      },
    });

    // AI Features Endpoint
    this.endpoints.push({
      id: 'ai-no-show-prediction',
      path: '/api/ai/no-show-prediction',
      method: API_METHODS.POST,
      category: API_CATEGORIES.AI_FEATURES,
      title: 'AI No-Show Prediction',
      titlePtBr: 'Predição de Falta com IA',
      description: 'Predict appointment no-show probability using AI',
      descriptionPtBr: 'Prever probabilidade de falta em consulta usando IA',
      authentication: {
        required: true,
        type: 'bearer',
        scopes: ['ai:predict'],
        lgpdConsent: true,
      },
      requestBody: {
        contentType: 'application/json',
        schema: {
          type: 'object',
          properties: {
            appointmentId: { type: 'string' },
            patientHistory: { type: 'object' },
            appointmentDetails: { type: 'object' },
          },
          required: ['appointmentId'],
        },
        example: {
          appointmentId: 'apt_456789123',
          patientHistory: {
            previousAppointments: 15,
            noShowCount: 2,
            lastVisit: '2024-01-10T10:00:00Z',
          },
          appointmentDetails: {
            type: 'consultation',
            dayOfWeek: 'monday',
            timeOfDay: 'morning',
          },
        },
        healthcareFields: [
          'appointmentId',
          'patientHistory',
          'appointmentDetails',
        ],
        lgpdFields: ['patientHistory'],
      },
      responses: [
        {
          statusCode: 200,
          description: 'No-show prediction generated successfully',
          descriptionPtBr: 'Predição de falta gerada com sucesso',
          example: {
            appointmentId: 'apt_456789123',
            noShowProbability: 0.23,
            riskLevel: 'low',
            factors: [
              'Patient has good attendance history',
              'Morning appointments have lower no-show rates',
              'Recent engagement with healthcare provider',
            ],
            recommendations: [
              'Send reminder 24 hours before appointment',
              'Confirm appointment via preferred communication method',
            ],
            accessibility: {
              screenReaderFriendly: true,
              mobileOptimized: true,
            },
          },
        },
      ],
      errors: [
        {
          code: 'INSUFFICIENT_DATA',
          statusCode: 400,
          message: 'Insufficient data for prediction',
          messagePtBr: 'Dados insuficientes para predição',
          description: 'Not enough historical data to generate accurate prediction',
          descriptionPtBr: 'Dados históricos insuficientes para gerar predição precisa',
          resolution: 'Collect more patient history data',
          resolutionPtBr: 'Colete mais dados do histórico do paciente',
        },
      ],
      examples: [
        {
          title: 'No-Show Risk Assessment',
          titlePtBr: 'Avaliação de Risco de Falta',
          description: 'AI-powered prediction for appointment attendance',
          descriptionPtBr: 'Predição com IA para comparecimento em consultas',
          request: {
            method: 'POST',
            url: '/api/ai/no-show-prediction',
            headers: {
              Authorization: 'Bearer token',
              'Content-Type': 'application/json',
              'X-LGPD-Consent': 'true',
            },
            body: {
              appointmentId: 'apt_456789123',
              patientHistory: {
                previousAppointments: 15,
                noShowCount: 2,
              },
            },
          },
          response: {
            status: 200,
            data: {
              noShowProbability: 0.23,
              riskLevel: 'low',
              recommendations: ['Send reminder 24 hours before appointment'],
            },
          },
          healthcareContext: 'Optimizing appointment scheduling and patient engagement',
          accessibilityNotes: 'AI predictions include accessibility-friendly explanations',
          mobileNotes: 'Optimized for mobile healthcare management applications',
        },
      ],
      metadata: {
        version: '1.0.0',
        deprecated: false,
        rateLimit: {
          requests: 200,
          window: '1h',
        },
        compliance: {
          lgpd: true,
          anvisa: false,
          cfm: true,
          wcag: true,
        },
        mobileOptimized: true,
        lastUpdated: new Date(),
      },
    });
  }

  /**
   * Generate API documentation report
   */
  generateReport(): APIDocumentationReport {
    const categories = [...new Set(this.endpoints.map(e => e.category))];
    const authMethods = [
      ...new Set(
        this.endpoints
          .filter(e => e.authentication.required)
          .map(e => e.authentication.type)
          .filter(Boolean),
      ),
    ];

    const complianceFeatures = {
      lgpdCompliant: this.endpoints.filter(e => e.metadata.compliance?.lgpd)
        .length,
      anvisaCompliant: this.endpoints.filter(
        e => e.metadata.compliance?.anvisa,
      ).length,
      cfmCompliant: this.endpoints.filter(e => e.metadata.compliance?.cfm)
        .length,
      wcagCompliant: this.endpoints.filter(e => e.metadata.compliance?.wcag)
        .length,
    };

    const mobileOptimized = this.endpoints.filter(
      e => e.metadata.mobileOptimized,
    ).length;

    return {
      endpoints: this.endpoints,
      categories,
      totalEndpoints: this.endpoints.length,
      authenticationMethods: authMethods as string[],
      complianceFeatures,
      mobileOptimized,
      lastGenerated: new Date(),
      version: '1.0.0',
    };
  }

  /**
   * Get endpoints by category
   */
  getEndpointsByCategory(category: APICategory): APIEndpoint[] {
    return this.endpoints.filter(endpoint => endpoint.category === category);
  }

  /**
   * Get healthcare-compliant endpoints
   */
  getHealthcareCompliantEndpoints(): APIEndpoint[] {
    return this.endpoints.filter(
      endpoint =>
        endpoint.metadata.compliance?.lgpd
        || endpoint.metadata.compliance?.anvisa
        || endpoint.metadata.compliance?.cfm,
    );
  }

  /**
   * Get mobile-optimized endpoints
   */
  getMobileOptimizedEndpoints(): APIEndpoint[] {
    return this.endpoints.filter(
      endpoint => endpoint.metadata.mobileOptimized,
    );
  }

  /**
   * Validate endpoint schema
   */
  validateEndpoint(endpoint: any): boolean {
    try {
      APIEndpointSchema.parse(endpoint);
      return true;
    } catch {
      return false;
    }
  }
}

export default APIDocumentationGenerator;
