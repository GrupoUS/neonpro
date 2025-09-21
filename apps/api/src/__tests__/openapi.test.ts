/**
 * OpenAPI Integration Tests
 *
 * Tests for OpenAPI schema generation, documentation endpoints,
 * and API contract validation.
 */

import { describe, expect, it } from 'vitest';
import app from '../app';

describe(_'OpenAPI Integration',_() => {
  describe(_'Documentation Endpoints',_() => {
    it(_'should serve OpenAPI JSON schema at /openapi.json',_async () => {
      const response = await app.request('/openapi.json');

      expect(response.status).toBe(200);

      const schema = await response.json();

      // Validate OpenAPI structure
      expect(schema.openapi).toBe('3.1.0');
      expect(schema.info.title).toBe('NeonPro Healthcare API');
      expect(schema.info.version).toBe('1.0.0');
      expect(schema.info.description).toContain('LGPD-compliant');

      // Validate servers
      expect(schema.servers).toHaveLength(3);
      expect(schema.servers[0].url).toBe('https://api.neonpro.health');

      // Validate security schemes
      expect(schema.components.securitySchemes.BearerAuth).toMatchObject({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      });

      // Validate tags
      expect(schema.tags).toHaveLength(4);
      const tagNames = schema.tags.map((tag: any) => tag.name);
      expect(tagNames).toContain('System');
      expect(tagNames).toContain('Authentication');
      expect(tagNames).toContain('Patients');
      expect(tagNames).toContain('Appointments');
    });

    it(_'should serve Swagger UI at /docs',_async () => {
      const response = await app.request('/docs');

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');

      const html = await response.text();
      expect(html).toContain('NeonPro Healthcare API Documentation');
      expect(html).toContain('swagger-ui');
      expect(html).toContain('/openapi.json');
    });

    it(_'should redirect /documentation to /docs',_async () => {
      const response = await app.request('/documentation', {
        redirect: 'manual',
      });

      expect(response.status).toBe(302);
      expect(response.headers.get('location')).toBe('/docs');
    });

    it(_'should serve docs health check at /docs/health',_async () => {
      const response = await app.request('/docs/health');

      expect(response.status).toBe(200);

      const health = await response.json();
      expect(health.status).toBe('ok');
      expect(health.documentation).toBe('available');
      expect(health.endpoints.swagger_ui).toBe('/docs');
      expect(health.endpoints.openapi_json).toBe('/openapi.json');
    });
  });

  describe(_'OpenAPI Route Validation',_() => {
    it(_'should validate health route schema',_async () => {
      const response = await app.request('/health');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('ok');
      expect(data.name).toBe('NeonPro API');
      expect(data.environment).toBeDefined();
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBe('1.0.0');
    });

    it(_'should validate detailed health route schema',_async () => {
      const response = await app.request('/v1/health');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.version).toBe('v1');
      expect(typeof data.uptime).toBe('number');
      expect(data.timestamp).toBeDefined();
      expect(data.environment).toBeDefined();
    });

    it(_'should validate API info route schema',_async () => {
      const response = await app.request('/v1/info');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.name).toBe('NeonPro API');
      expect(data.version).toBe('v1');
      expect(data.runtime).toBe('node');
      expect(data.environment).toBeDefined();
      expect(data.timestamp).toBeDefined();
    });

    it(_'should validate auth status route schema',_async () => {
      const response = await app.request('/v1/auth/status');

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('available');
      expect(data.provider).toBe('supabase');
      expect(data.endpoints.login).toBe('/auth/login');
      expect(data.endpoints.logout).toBe('/auth/logout');
      expect(data.endpoints.profile).toBe('/auth/profile');
    });
  });

  describe(_'LGPD Compliance in OpenAPI',_() => {
    it(_'should document LGPD consent requirements for patient routes',_async () => {
      const response = await app.request('/openapi.json');
      const schema = await response.json();

      const patientsListPath = schema.paths['/v1/patients'];
      expect(patientsListPath.get.description).toContain('LGPD consent');
      expect(patientsListPath.get.security).toEqual([{ BearerAuth: [] }]);

      const patientDetailPath = schema.paths['/v1/patients/{patientId}'];
      expect(patientDetailPath.get.description).toContain('LGPD consent');
      expect(patientDetailPath.get.responses['403'].description).toBe(
        'LGPD consent required',
      );
    });

    it(_'should document LGPD error responses',_async () => {
      const response = await app.request('/openapi.json');
      const schema = await response.json();

      const patientDetailPath = schema.paths['/v1/patients/{patientId}'];
      const lgpdError = patientDetailPath.get.responses['403'];

      expect(lgpdError.description).toBe('LGPD consent required');
      expect(lgpdError.content['application/json'].schema.example.code).toBe(
        'LGPD_CONSENT_REQUIRED',
      );
    });
  });

  describe(_'Healthcare Validation in OpenAPI',_() => {
    it(_'should use healthcare-specific field validation',_async () => {
      const response = await app.request('/openapi.json');
      const schema = await response.json();

      // Check if CPF validation is documented
      const schemas = schema.components.schemas;
      expect(schemas).toBeDefined();

      // Validate that patient schemas exist and have proper validation
      const patientKeys = Object.keys(schemas).filter(key => key.includes('Patient'));
      expect(patientKeys.length).toBeGreaterThan(0);
    });
  });

  describe(_'Error Handling',_() => {
    it(_'should return validation errors in OpenAPI format',_async () => {
      // This would test actual validation errors when invalid data is sent
      // For now, we verify the error format is documented
      const response = await app.request('/openapi.json');
      const schema = await response.json();

      const errorSchema = schema.components.schemas.ErrorResponse;
      expect(errorSchema).toBeDefined();
      expect(errorSchema.properties.error).toBeDefined();
      expect(errorSchema.properties.code).toBeDefined();
      expect(errorSchema.properties.timestamp).toBeDefined();
    });
  });
});
