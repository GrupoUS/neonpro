/**
 * API Documentation Generator Tests
 * T084 - Comprehensive Documentation
 */

import { beforeEach, describe, expect, it } from 'vitest';
import APIDocumentationGenerator, {
  API_CATEGORIES,
  API_LABELS_PT_BR,
  API_METHODS,
  APIEndpointSchema,
} from '../api-documentation-generator';

describe('API Documentation Generator', () => {
  let generator: APIDocumentationGenerator;

  beforeEach(() => {
    generator = new APIDocumentationGenerator();
  });

  describe('API Endpoint Schema Validation', () => {
    it('should validate valid API endpoint', () => {
      const validEndpoint = {
        id: 'test-endpoint',
        path: '/api/test',
        method: API_METHODS.GET,
        category: API_CATEGORIES.PATIENT_MANAGEMENT,
        title: 'Test Endpoint',
        titlePtBr: 'Endpoint de Teste',
        description: 'Test endpoint description',
        descriptionPtBr: 'Descrição do endpoint de teste',
        authentication: {
          required: true,
          type: 'bearer' as const,
          scopes: ['test:read'],
          lgpdConsent: true,
        },
        responses: [
          {
            statusCode: 200,
            description: 'Success response',
            descriptionPtBr: 'Resposta de sucesso',
          },
        ],
        metadata: {
          version: '1.0.0',
          compliance: {
            lgpd: true,
            anvisa: true,
            cfm: true,
            wcag: true,
          },
          mobileOptimized: true,
          lastUpdated: new Date(),
        },
      };

      const result = APIEndpointSchema.safeParse(validEndpoint);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('test-endpoint');
        expect(result.data.method).toBe(API_METHODS.GET);
        expect(result.data.category).toBe(API_CATEGORIES.PATIENT_MANAGEMENT);
        expect(result.data.authentication.required).toBe(true);
        expect(result.data.authentication.lgpdConsent).toBe(true);
      }
    });

    it('should reject invalid API endpoint', () => {
      const invalidEndpoint = {
        id: 'test-endpoint',
        // Missing required fields
        method: 'INVALID_METHOD',
        category: 'INVALID_CATEGORY',
      };

      const result = APIEndpointSchema.safeParse(invalidEndpoint);
      expect(result.success).toBe(false);
    });

    it('should validate endpoint parameters', () => {
      const endpointWithParams = {
        id: 'test-endpoint',
        path: '/api/patients/{id}',
        method: API_METHODS.GET,
        category: API_CATEGORIES.PATIENT_MANAGEMENT,
        title: 'Get Patient',
        description: 'Get patient information',
        authentication: { required: true },
        parameters: [
          {
            name: 'id',
            type: 'path' as const,
            dataType: 'string',
            required: true,
            description: 'Patient ID',
            descriptionPtBr: 'ID do Paciente',
            example: 'pat_123456789',
            healthcareContext: 'Patient identification',
          },
        ],
        responses: [
          {
            statusCode: 200,
            description: 'Patient found',
          },
        ],
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date(),
        },
      };

      const result = APIEndpointSchema.safeParse(endpointWithParams);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.parameters).toHaveLength(1);
        expect(result.data.parameters![0].name).toBe('id');
        expect(result.data.parameters![0].type).toBe('path');
        expect(result.data.parameters![0].healthcareContext).toBe(
          'Patient identification',
        );
      }
    });

    it('should validate request body schema', () => {
      const endpointWithBody = {
        id: 'create-appointment',
        path: '/api/appointments',
        method: API_METHODS.POST,
        category: API_CATEGORIES.APPOINTMENT_SCHEDULING,
        title: 'Create Appointment',
        description: 'Create new appointment',
        authentication: { required: true },
        requestBody: {
          contentType: 'application/json',
          schema: {
            type: 'object',
            properties: {
              patientId: { type: 'string' },
              doctorId: { type: 'string' },
              dateTime: { type: 'string', format: 'date-time' },
            },
            required: ['patientId', 'doctorId', 'dateTime'],
          },
          example: {
            patientId: 'pat_123',
            doctorId: 'doc_456',
            dateTime: '2024-02-15T14:30:00Z',
          },
          healthcareFields: ['patientId', 'doctorId'],
          lgpdFields: ['patientId'],
        },
        responses: [
          {
            statusCode: 201,
            description: 'Appointment created',
          },
        ],
        metadata: {
          version: '1.0.0',
          lastUpdated: new Date(),
        },
      };

      const result = APIEndpointSchema.safeParse(endpointWithBody);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.requestBody).toBeDefined();
        expect(result.data.requestBody!.contentType).toBe('application/json');
        expect(result.data.requestBody!.healthcareFields).toContain(
          'patientId',
        );
        expect(result.data.requestBody!.lgpdFields).toContain('patientId');
      }
    });
  });

  describe('Healthcare API Endpoints', () => {
    it('should generate report with healthcare endpoints', () => {
      const report = generator.generateReport();

      expect(report.endpoints.length).toBeGreaterThan(0);
      expect(report.totalEndpoints).toBe(report.endpoints.length);
      expect(report.categories).toContain(API_CATEGORIES.PATIENT_MANAGEMENT);
      expect(report.categories).toContain(
        API_CATEGORIES.APPOINTMENT_SCHEDULING,
      );
      expect(report.categories).toContain(API_CATEGORIES.AI_FEATURES);
    });

    it('should include patient management endpoint', () => {
      const report = generator.generateReport();
      const patientEndpoint = report.endpoints.find(
        e => e.id === 'get-patient',
      );

      expect(patientEndpoint).toBeDefined();
      expect(patientEndpoint?.path).toBe('/api/patients/{id}');
      expect(patientEndpoint?.method).toBe(API_METHODS.GET);
      expect(patientEndpoint?.category).toBe(API_CATEGORIES.PATIENT_MANAGEMENT);
      expect(patientEndpoint?.title).toBe('Get Patient Information');
      expect(patientEndpoint?.titlePtBr).toBe('Obter Informações do Paciente');
      expect(patientEndpoint?.authentication.lgpdConsent).toBe(true);
    });

    it('should include appointment scheduling endpoint', () => {
      const report = generator.generateReport();
      const appointmentEndpoint = report.endpoints.find(
        e => e.id === 'create-appointment',
      );

      expect(appointmentEndpoint).toBeDefined();
      expect(appointmentEndpoint?.path).toBe('/api/appointments');
      expect(appointmentEndpoint?.method).toBe(API_METHODS.POST);
      expect(appointmentEndpoint?.category).toBe(
        API_CATEGORIES.APPOINTMENT_SCHEDULING,
      );
      expect(appointmentEndpoint?.title).toBe('Create Appointment');
      expect(appointmentEndpoint?.titlePtBr).toBe('Criar Consulta');
      expect(appointmentEndpoint?.requestBody?.healthcareFields).toContain(
        'accessibility',
      );
    });

    it('should include AI features endpoint', () => {
      const report = generator.generateReport();
      const aiEndpoint = report.endpoints.find(
        e => e.id === 'ai-no-show-prediction',
      );

      expect(aiEndpoint).toBeDefined();
      expect(aiEndpoint?.path).toBe('/api/ai/no-show-prediction');
      expect(aiEndpoint?.method).toBe(API_METHODS.POST);
      expect(aiEndpoint?.category).toBe(API_CATEGORIES.AI_FEATURES);
      expect(aiEndpoint?.title).toBe('AI No-Show Prediction');
      expect(aiEndpoint?.titlePtBr).toBe('Predição de Falta com IA');
      expect(aiEndpoint?.requestBody?.lgpdFields).toContain('patientHistory');
    });
  });

  describe('Healthcare Compliance Features', () => {
    it('should track LGPD compliance', () => {
      const report = generator.generateReport();

      expect(report.complianceFeatures.lgpdCompliant).toBeGreaterThan(0);

      const lgpdEndpoints = report.endpoints.filter(
        e => e.metadata.compliance?.lgpd,
      );
      expect(lgpdEndpoints.length).toBe(
        report.complianceFeatures.lgpdCompliant,
      );

      lgpdEndpoints.forEach((endpoint: any) => {
        expect(endpoint.authentication.lgpdConsent).toBe(true);
      });
    });

    it('should track ANVISA compliance', () => {
      const report = generator.generateReport();

      expect(report.complianceFeatures.anvisaCompliant).toBeGreaterThan(0);

      const anvisaEndpoints = report.endpoints.filter(
        e => e.metadata.compliance?.anvisa,
      );
      expect(anvisaEndpoints.length).toBe(
        report.complianceFeatures.anvisaCompliant,
      );
    });

    it('should track CFM compliance', () => {
      const report = generator.generateReport();

      expect(report.complianceFeatures.cfmCompliant).toBeGreaterThan(0);

      const cfmEndpoints = report.endpoints.filter(
        e => e.metadata.compliance?.cfm,
      );
      expect(cfmEndpoints.length).toBe(report.complianceFeatures.cfmCompliant);
    });

    it('should track WCAG compliance', () => {
      const report = generator.generateReport();

      expect(report.complianceFeatures.wcagCompliant).toBeGreaterThan(0);

      const wcagEndpoints = report.endpoints.filter(
        e => e.metadata.compliance?.wcag,
      );
      expect(wcagEndpoints.length).toBe(
        report.complianceFeatures.wcagCompliant,
      );
    });
  });

  describe('Mobile Optimization', () => {
    it('should track mobile-optimized endpoints', () => {
      const report = generator.generateReport();

      expect(report.mobileOptimized).toBeGreaterThan(0);

      const mobileEndpoints = report.endpoints.filter(
        e => e.metadata.mobileOptimized,
      );
      expect(mobileEndpoints.length).toBe(report.mobileOptimized);
    });

    it('should include mobile notes in examples', () => {
      const report = generator.generateReport();

      const endpointsWithExamples = report.endpoints.filter(
        e => e.examples && e.examples.length > 0,
      );
      expect(endpointsWithExamples.length).toBeGreaterThan(0);

      endpointsWithExamples.forEach(endpoint => {
        (endpoint as any).examples?.forEach(example => {
          // Variable 'example' is already declared as parameter
          expect(example.mobileNotes).toBeDefined();
          expect(typeof example.mobileNotes).toBe('string');
          expect(example.mobileNotes!.length).toBeGreaterThan(0);
        });
      });
    });

    it('should include mobile optimization in response examples', () => {
      const report = generator.generateReport();
      const patientEndpoint = report.endpoints.find(
        e => e.id === 'get-patient',
      );

      expect(patientEndpoint?.responses[0].example.accessibility).toBeDefined();
      expect(
        (patientEndpoint?.responses[0].example.accessibility as any)
          .mobileOptimized,
      ).toBe(true);
    });
  });

  describe('Authentication and Security', () => {
    it('should track authentication methods', () => {
      const report = generator.generateReport();

      expect(report.authenticationMethods).toContain('bearer');

      const authEndpoints = report.endpoints.filter(
        e => (e as any).authentication.required,
      );
      expect(authEndpoints.length).toBe(report.endpoints.length); // All endpoints require auth
    });

    it('should include LGPD consent requirements', () => {
      const report = generator.generateReport();

      const lgpdEndpoints = report.endpoints.filter(
        e => (e as any).authentication.lgpdConsent,
      );
      expect(lgpdEndpoints.length).toBeGreaterThan(0);

      lgpdEndpoints.forEach((endpoint: any) => {
        expect(endpoint.authentication.lgpdConsent).toBe(true);
      });
    });

    it('should include rate limiting information', () => {
      const report = generator.generateReport();

      const rateLimitedEndpoints = report.endpoints.filter(
        e => e.metadata.rateLimit,
      );
      expect(rateLimitedEndpoints.length).toBeGreaterThan(0);

      rateLimitedEndpoints.forEach(endpoint => {
        expect((endpoint as any).metadata.rateLimit?.requests).toBeGreaterThan(0);
        expect((endpoint as any).metadata.rateLimit?.window).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should include comprehensive error documentation', () => {
      const report = generator.generateReport();

      const endpointsWithErrors = report.endpoints.filter(
        e => e.errors && e.errors.length > 0,
      );
      expect(endpointsWithErrors.length).toBeGreaterThan(0);

      endpointsWithErrors.forEach(endpoint => {
        (endpoint as any).errors?.forEach(error => {
          // Variable 'error' is already declared as parameter
          expect(error.code).toBeDefined();
          expect(error.statusCode).toBeGreaterThan(0);
          expect(error.message).toBeDefined();
          expect(error.messagePtBr).toBeDefined();
          expect(error.description).toBeDefined();
          expect(error.descriptionPtBr).toBeDefined();
          expect(error.resolution).toBeDefined();
          expect(error.resolutionPtBr).toBeDefined();
        });
      });
    });

    it('should include healthcare-specific errors', () => {
      const report = generator.generateReport();
      const patientEndpoint = report.endpoints.find(
        e => e.id === 'get-patient',
      );

      expect(patientEndpoint?.errors).toBeDefined();
      expect((patientEndpoint as any).errors?.length).toBeGreaterThan(0);

      const lgpdError = (patientEndpoint as any)?.errors?.find(
        e => e.code === 'LGPD_CONSENT_REQUIRED',
      );
      expect(lgpdError).toBeDefined();
      expect(lgpdError?.message).toBe('LGPD consent required');
      expect(lgpdError?.messagePtBr).toBe('Consentimento LGPD obrigatório');
    });

    it('should include appointment-specific errors', () => {
      const report = generator.generateReport();
      const appointmentEndpoint = report.endpoints.find(
        e => e.id === 'create-appointment',
      );

      expect(appointmentEndpoint?.errors).toBeDefined();

      const conflictError = (appointmentEndpoint as any)?.errors?.find(
        e => e.code === 'APPOINTMENT_CONFLICT',
      );
      expect(conflictError).toBeDefined();
      expect(conflictError?.statusCode).toBe(409);
      expect(conflictError?.messagePtBr).toBe(
        'Conflito de horário da consulta',
      );
    });
  });

  describe('Brazilian Portuguese Localization', () => {
    it('should provide Portuguese API labels', () => {
      expect(API_LABELS_PT_BR[API_METHODS.GET]).toBe('BUSCAR');
      expect(API_LABELS_PT_BR[API_METHODS.POST]).toBe('CRIAR');
      expect(API_LABELS_PT_BR[API_METHODS.PUT]).toBe('ATUALIZAR');
      expect(API_LABELS_PT_BR[API_METHODS.DELETE]).toBe('EXCLUIR');

      expect(API_LABELS_PT_BR[API_CATEGORIES.PATIENT_MANAGEMENT]).toBe(
        'Gestão de Pacientes',
      );
      expect(API_LABELS_PT_BR[API_CATEGORIES.APPOINTMENT_SCHEDULING]).toBe(
        'Agendamento de Consultas',
      );
      expect(API_LABELS_PT_BR[API_CATEGORIES.AI_FEATURES]).toBe(
        'Recursos de IA',
      );

      expect(API_LABELS_PT_BR.authentication).toBe('Autenticação');
      expect(API_LABELS_PT_BR.lgpdConsent).toBe('Consentimento LGPD');
      expect(API_LABELS_PT_BR.mobileOptimized).toBe('Otimizado para Móvel');
    });

    it('should include Portuguese translations in endpoints', () => {
      const report = generator.generateReport();

      report.endpoints.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        expect(endpoint.titlePtBr).toBeDefined();
        expect(endpoint.descriptionPtBr).toBeDefined();

        endpoint.parameters?.forEach(param => {
          // Variable 'param' is already declared as parameter
          expect(param.descriptionPtBr).toBeDefined();
        });

        endpoint.responses.forEach(response => {
          // Variable 'response' is already declared as parameter
          expect(response.descriptionPtBr).toBeDefined();
        });
      });
    });

    it('should include Portuguese translations in examples', () => {
      const report = generator.generateReport();

      const endpointsWithExamples = report.endpoints.filter(
        e => e.examples && e.examples.length > 0,
      );

      endpointsWithExamples.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        endpoint.examples?.forEach(example => {
          // Variable 'example' is already declared as parameter
          expect(example.titlePtBr).toBeDefined();
          expect(example.descriptionPtBr).toBeDefined();
        });
      });
    });
  });

  describe('Healthcare Context and Accessibility', () => {
    it('should include healthcare context in parameters', () => {
      const report = generator.generateReport();
      const patientEndpoint = report.endpoints.find(
        e => e.id === 'get-patient',
      );

      expect((patientEndpoint as any).parameters).toBeDefined();
      expect((patientEndpoint as any).parameters![0].healthcareContext).toBeDefined();
      expect((patientEndpoint as any).parameters![0].healthcareContext).toContain(
        'Patient identification',
      );
    });

    it('should include accessibility notes in examples', () => {
      const report = generator.generateReport();

      const endpointsWithExamples = report.endpoints.filter(
        e => e.examples && e.examples.length > 0,
      );

      endpointsWithExamples.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        endpoint.examples?.forEach(example => {
          // Variable 'example' is already declared as parameter
          expect(example.accessibilityNotes).toBeDefined();
          expect(typeof example.accessibilityNotes).toBe('string');
          expect(example.accessibilityNotes!.length).toBeGreaterThan(0);
        });
      });
    });

    it('should include healthcare context in examples', () => {
      const report = generator.generateReport();

      const endpointsWithExamples = report.endpoints.filter(
        e => e.examples && e.examples.length > 0,
      );

      endpointsWithExamples.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        endpoint.examples?.forEach(example => {
          // Variable 'example' is already declared as parameter
          expect(example.healthcareContext).toBeDefined();
          expect(typeof example.healthcareContext).toBe('string');
          expect(example.healthcareContext!.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Utility Methods', () => {
    it('should get endpoints by category', () => {
      const patientEndpoints = generator.getEndpointsByCategory(
        API_CATEGORIES.PATIENT_MANAGEMENT,
      );
      expect(patientEndpoints.length).toBeGreaterThan(0);

      patientEndpoints.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        expect(endpoint.category).toBe(API_CATEGORIES.PATIENT_MANAGEMENT);
      });
    });

    it('should get healthcare-compliant endpoints', () => {
      const healthcareEndpoints = generator.getHealthcareCompliantEndpoints();
      expect(healthcareEndpoints.length).toBeGreaterThan(0);

      healthcareEndpoints.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        const hasCompliance = endpoint.metadata.compliance?.lgpd
          || endpoint.metadata.compliance?.anvisa
          || endpoint.metadata.compliance?.cfm;
        expect(hasCompliance).toBe(true);
      });
    });

    it('should get mobile-optimized endpoints', () => {
      const mobileEndpoints = generator.getMobileOptimizedEndpoints();
      expect(mobileEndpoints.length).toBeGreaterThan(0);

      mobileEndpoints.forEach(endpoint => {
        // Variable 'endpoint' is already declared as parameter
        expect(endpoint.metadata.mobileOptimized).toBe(true);
      });
    });

    it('should validate endpoint schema', () => {
      const validEndpoint = {
        id: 'test',
        path: '/test',
        method: API_METHODS.GET,
        category: API_CATEGORIES.PATIENT_MANAGEMENT,
        title: 'Test',
        description: 'Test endpoint',
        authentication: { required: false },
        responses: [{ statusCode: 200, description: 'OK' }],
        metadata: { version: '1.0.0', lastUpdated: new Date() },
      };

      expect(generator.validateEndpoint(validEndpoint)).toBe(true);
      expect(generator.validateEndpoint({})).toBe(false);
    });
  });
});
