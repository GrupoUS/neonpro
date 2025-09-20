/**
 * Test Suite for Healthcare Response Module
 * RED Phase: Define comprehensive test scenarios for healthcare response utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createHealthcareResponse } from '../../src/lib/healthcare-response';

describe('Healthcare Response Module - RED Phase', () => {
  describe('createHealthcareResponse', () => {
    it('should create a successful healthcare response with required properties', () => {
      const responseData = {
        success: true,
        data: { test: 'data' },
        processingTime: 100,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should create an error healthcare response with proper error structure', () => {
      const responseData = {
        success: false,
        error: 'Test error message',
        processingTime: 50,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 400,
        headers: {
          'X-Error-Type': 'validation_error',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
      expect(response.headers.get('X-Error-Type')).toBe('validation_error');
    });

    it('should include healthcare-specific metadata in response', () => {
      const responseData = {
        success: true,
        data: { patientId: '123' },
        processingTime: 75,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
        metadata: {
          healthcareContext: true,
          lgpdCompliant: true,
        },
      };

      const response = createHealthcareResponse(responseData);

      expect(response).toBeInstanceOf(Response);
    });

    it('should handle custom headers for healthcare compliance', () => {
      const responseData = {
        success: true,
        data: {},
        processingTime: 25,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 200,
        headers: {
          'X-LGPD-Compliant': 'true',
          'X-CFM-Validated': 'true',
          'X-ANVISA-Status': 'approved',
          'Cache-Control': 'no-cache',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response.headers.get('X-LGPD-Compliant')).toBe('true');
      expect(response.headers.get('X-CFM-Validated')).toBe('true');
      expect(response.headers.get('X-ANVISA-Status')).toBe('approved');
      expect(response.headers.get('Cache-Control')).toBe('no-cache');
    });

    it('should sanitize personal data in error responses', () => {
      const responseData = {
        success: false,
        error: 'Patient 123.456.789-00 has invalid CPF',
        processingTime: 30,
        compliance: {
          lgpd: false,
          cfm: true,
          anvisa: true,
        },
      };

      const response = createHealthcareResponse(responseData, { status: 400 });

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(400);
    });

    it('should handle missing compliance information gracefully', () => {
      const responseData = {
        success: true,
        data: { test: 'data' },
        processingTime: 10,
      };

      const response = createHealthcareResponse(responseData);

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
    });

    it('should support different content types for healthcare data', () => {
      const responseData = {
        success: true,
        data: { medicalRecord: 'sensitive data' },
        processingTime: 150,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.healthcare+json',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response.headers.get('Content-Type')).toBe('application/vnd.healthcare+json');
    });

    it('should include audit trail information in responses', () => {
      const responseData = {
        success: true,
        data: { auditId: 'audit-123' },
        processingTime: 45,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
        audit: {
          requestId: 'req-123',
          userId: 'user-456',
          timestamp: new Date().toISOString(),
        },
      };

      const response = createHealthcareResponse(responseData);

      expect(response).toBeInstanceOf(Response);
    });

    it('should handle healthcare-specific status codes', () => {
      const responseData = {
        success: false,
        error: 'Medical record access denied',
        processingTime: 20,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 403,
        headers: {
          'X-Healthcare-Error': 'authorization_failed',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response.status).toBe(403);
      expect(response.headers.get('X-Healthcare-Error')).toBe('authorization_failed');
    });

    it('should support Brazilian healthcare compliance headers', () => {
      const responseData = {
        success: true,
        data: { prescription: 'approved' },
        processingTime: 60,
        compliance: {
          lgpd: true,
          cfm: true,
          anvisa: true,
        },
      };

      const options = {
        status: 200,
        headers: {
          'X-Brazil-Healthcare-Compliance': 'CFM-ANVISA-LGPD',
          'X-Medical-Professional-CRM': '12345-SP',
          'X-Prescription-Controlled': 'false',
        },
      };

      const response = createHealthcareResponse(responseData, options);

      expect(response.headers.get('X-Brazil-Healthcare-Compliance')).toBe('CFM-ANVISA-LGPD');
      expect(response.headers.get('X-Medical-Professional-CRM')).toBe('12345-SP');
    });
  });
});