/**
 * CRUD Test Utilities
 * Helper functions for AI CRUD API testing
 * Supports contract testing with LGPD/CFM/ANVISA compliance
 */

import { rest } from 'msw';
import { TEST_BASE_URL } from './test-config';

// Types for CRUD testing
export interface CrudIntentRequest {
  entity: string;
  operation: string;
  data: Record<string, any>;
  context: {
    userId: string;
    sessionId: string;
    timestamp?: string;
  };
}

export interface CrudConfirmRequest {
  intentId: string;
  token: string;
  confirmation: {
    validated: boolean;
    transformations?: Record<string, any>;
    compliance?: Record<string, any>;
  };
  context: {
    userId: string;
    sessionId: string;
  };
}

export interface CrudExecuteRequest {
  confirmId: string;
  executionToken: string;
  operation: {
    entity: string;
    action: string;
    data: Record<string, any>;
    metadata?: Record<string, any>;
  };
  context: {
    userId: string;
    sessionId: string;
    correlationId?: string;
  };
}

// Validation functions
export function validateIntentRequest(request: any): request is CrudIntentRequest {
  return (
    request
    && typeof request.entity === 'string'
    && typeof request.operation === 'string'
    && typeof request.data === 'object'
    && request.context
    && typeof request.context.userId === 'string'
    && typeof request.context.sessionId === 'string'
  );
}

export function validateConfirmRequest(request: any): request is CrudConfirmRequest {
  return (
    request
    && typeof request.intentId === 'string'
    && typeof request.token === 'string'
    && request.confirmation
    && typeof request.confirmation.validated === 'boolean'
    && request.context
    && typeof request.context.userId === 'string'
    && typeof request.context.sessionId === 'string'
  );
}

export function validateExecuteRequest(request: any): request is CrudExecuteRequest {
  return (
    request
    && typeof request.confirmId === 'string'
    && typeof request.executionToken === 'string'
    && request.operation
    && typeof request.operation.entity === 'string'
    && typeof request.operation.action === 'string'
    && typeof request.operation.data === 'object'
    && request.context
    && typeof request.context.userId === 'string'
    && typeof request.context.sessionId === 'string'
  );
}

// API client functions
export async function createCrudIntent(
  request: CrudIntentRequest,
  timeout: number = 5000,
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${TEST_BASE_URL}/api/v1/ai/crud/intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || `HTTP ${response.status}`) as any;
      error.code = errorData.code;
      error.details = errorData.details || errorData;
      error.timestamp = errorData.timestamp;
      error.executionId = errorData.executionId || 'exec-error-' + Date.now();
      throw error;
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function confirmCrudIntent(
  request: CrudConfirmRequest,
  timeout: number = 5000,
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${TEST_BASE_URL}/api/v1/ai/crud/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || `HTTP ${response.status}`) as any;
      error.code = errorData.code;
      error.details = errorData.details || errorData;
      error.timestamp = errorData.timestamp;
      error.executionId = errorData.executionId || 'exec-error-' + Date.now();
      throw error;
    }

    const data = await response.json();
    
    // Flatten structure to match test expectations
    if (data.data) {
      return {
        success: data.success,
        confirmId: data.data.confirmId,
        executionToken: data.data.executionToken,
        readyForExecution: data.data.validated,
        validationResult: {
          dataValid: data.data.validated,
          transformations: data.data.transformations,
          compliance: data.data.compliance
        },
        auditTrail: data.auditTrail,
        meta: data.meta
      };
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function executeCrudOperation(
  request: CrudExecuteRequest,
  timeout: number = 5000,
): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${TEST_BASE_URL}/api/v1/ai/crud/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      const error = new Error(errorData.error || `HTTP ${response.status}`) as any;
      error.code = errorData.code;
      error.details = errorData.details || errorData;
      error.timestamp = errorData.timestamp;
      error.executionId = errorData.executionId || 'exec-error-' + Date.now();
      throw error;
    }

    const data = await response.json();
    
    // Flatten structure to match test expectations
    if (data.data) {
      return {
        success: data.success,
        executionId: data.data.executionId,
        result: data.data.result,
        auditTrail: data.auditTrail,
        performance: data.meta?.performance,
        meta: data.meta
      };
    }
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Mock data generators
export function generateMockPatientData(overrides = {}): Record<string, any> {
  return {
    name: 'Test Patient',
    email: `test-${Date.now()}@example.com`,
    phone: '+5511999999999',
    dateOfBirth: '1990-01-01',
    gender: 'M',
    ...overrides,
  };
}

export function generateMockAppointmentData(overrides = {}): Record<string, any> {
  return {
    patientId: 'patient-123',
    doctorId: 'doctor-456',
    scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    duration: 30,
    type: 'CONSULTATION',
    status: 'SCHEDULED',
    ...overrides,
  };
}

// Compliance validation helpers
export function validateLGPDCompliance(data: Record<string, any>): {
  valid: boolean;
  score: number;
  violations: string[];
} {
  const violations: string[] = [];
  let score = 100;

  // Check for sensitive data without consent
  if (data.healthHistory && !data.consentProvided) {
    violations.push('Sensitive health data without consent');
    score -= 30;
  }

  // Check for proper data anonymization
  if (data.fullName && data.fullName === 'Real Patient Name') {
    violations.push('Unanonymized patient name');
    score -= 20;
  }

  // Check for data retention policy
  if (data.retentionPeriod && data.retentionPeriod > 365 * 20) {
    violations.push('Excessive data retention period');
    score -= 15;
  }

  return {
    valid: violations.length === 0,
    score: Math.max(0, score),
    violations,
  };
}

export function validateCFMCompliance(data: Record<string, any>): {
  valid: boolean;
  score: number;
  violations: string[];
} {
  const violations: string[] = [];
  let score = 100;

  // Check for professional licensing
  if (data.doctorId && !data.licenseNumber) {
    violations.push('Missing professional license');
    score -= 25;
  }

  // Check for ethical boundaries
  if (data.patientContact && !data.consultationReason) {
    violations.push('Patient contact without consultation reason');
    score -= 20;
  }

  // Check for confidentiality
  if (data.patientNotes && !data.encryptionLevel) {
    violations.push('Unencrypted patient notes');
    score -= 15;
  }

  return {
    valid: violations.length === 0,
    score: Math.max(0, score),
    violations,
  };
}

export function validateANVISACompliance(data: Record<string, any>): {
  valid: boolean;
  score: number;
  violations: string[];
} {
  const violations: string[] = [];
  let score = 100;

  // Check for risk management
  if (data.medicalDevice && !data.riskAssessment) {
    violations.push('Missing risk assessment for medical device');
    score -= 30;
  }

  // Check for clinical validation
  if (data.treatmentProtocol && !data.clinicalEvidence) {
    violations.push('Treatment without clinical evidence');
    score -= 25;
  }

  // Check for safety monitoring
  if (data.softwareVersion && !data.safetyFeatures) {
    violations.push('Software version without safety features');
    score -= 20;
  }

  return {
    valid: violations.length === 0,
    score: Math.max(0, score),
    violations,
  };
}

// Performance measurement helpers
export async function measureExecutionTime<T>(fn: () => Promise<T>): Promise<{
  result: T;
  executionTime: number;
}> {
  const startTime = performance.now();
  try {
    const result = await fn();
    const endTime = performance.now();
    return {
      result,
      executionTime: endTime - startTime,
    };
  } catch (error) {
    const endTime = performance.now();
    throw {
      error,
      executionTime: endTime - startTime,
    };
  }
}

// Test data builders
export class TestDataBuilder {
  private data: Record<string, any> = {};

  constructor(private entityType: string) {}

  withField(field: string, value: any): this {
    this.data[field] = value;
    return this;
  }

  withRequiredFields(): this {
    switch (this.entityType) {
      case 'patients':
        this.data.name = this.data.name || 'Test Patient';
        this.data.email = this.data.email || 'test@example.com';
        break;
      case 'appointments':
        this.data.patientId = this.data.patientId || 'patient-123';
        this.data.scheduledAt = this.data.scheduledAt || new Date().toISOString();
        break;
    }
    return this;
  }

  withCompliance(complianceLevel: 'low' | 'medium' | 'high'): this {
    if (complianceLevel === 'high') {
      this.data.consentProvided = true;
      this.data.dataProcessingAgreement = true;
      this.data.privacyImpactAssessment = true;
    }
    return this;
  }

  build(): Record<string, any> {
    return { ...this.data };
  }
}

// Mock response builders
export class MockResponseBuilder {
  private response: Record<string, any> = {
    success: true,
  };

  static success(): MockResponseBuilder {
    return new MockResponseBuilder();
  }

  static error(code: string, message: string): MockResponseBuilder {
    return new MockResponseBuilder()
      .withSuccess(false)
      .withError(code, message);
  }

  withSuccess(success: boolean): this {
    this.response.success = success;
    return this;
  }

  withData(data: any): this {
    this.response.data = data;
    return this;
  }

  withError(code: string, message: string): this {
    this.response.error = message;
    this.response.code = code;
    return this;
  }

  withAuditTrail(auditTrail: any): this {
    this.response.auditTrail = auditTrail;
    return this;
  }

  withCompliance(compliance: any): this {
    this.response.compliance = compliance;
    return this;
  }

  build(): Record<string, any> {
    return { ...this.response };
  }
}

// Assertion helpers
export function expectComplianceValidation(response: any, framework: 'lgpd' | 'cfm' | 'anvisa') {
  expect(response.compliance).toBeDefined();
  expect(response.compliance[framework]).toBeDefined();
  expect(response.compliance[framework].valid).toBe(true);
  expect(response.compliance[framework].score).toBeGreaterThanOrEqual(90);
}

export function expectAuditTrail(response: any) {
  expect(response.auditTrail).toBeDefined();
  expect(response.auditTrail.timestamp).toBeDefined();
  expect(response.auditTrail.userId).toBeDefined();
  expect(response.auditTrail.operation).toBeDefined();
}

export function expectPerformanceMetrics(response: any) {
  expect(response.performance).toBeDefined();
  expect(response.performance.executionTime).toBeDefined();
  expect(typeof response.performance.executionTime).toBe('number');
}

// Test scenario generators
export function generateTestScenarios() {
  return {
    happyPath: {
      description: 'Successful CRUD operation',
      setup: () => generateMockPatientData(),
      expect: { success: true, compliance: { lgpd: { valid: true } } },
    },
    invalidInput: {
      description: 'Invalid input data',
      setup: () => ({ name: 123 }), // Invalid type
      expect: { success: false, error: 'Validation failed' },
    },
    missingRequired: {
      description: 'Missing required fields',
      setup: () => ({}),
      expect: { success: false, error: 'Missing required fields' },
    },
    complianceViolation: {
      description: 'LGPD compliance violation',
      setup: () => ({
        name: 'Real Patient Name',
        healthHistory: 'sensitive-data-without-consent',
      }),
      expect: { success: false, error: 'Compliance violation' },
    },
  };
}

// Export all utilities
export * from './mock-server-handlers';
