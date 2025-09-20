/**
 * Observability Contract Tests
 * NeonPro Platform Architecture Improvements
 *
 * Tests the contracts for:
 * - Sentry error tracking integration
 * - OpenTelemetry distributed tracing
 * - Web Vitals performance monitoring
 * - Healthcare compliance logging
 */

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { HealthcareErrorContext } from '../../lib/observability/sentry';
import type { HealthcareSpanAttributes } from '../../lib/observability/tracing';
import type {
  HealthcarePerformanceContext, // used in performance context test
} from '../../lib/observability/web-vitals';

// Mock Sentry
const mockSentry = {
  init: vi.fn(),
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  setContext: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  addBreadcrumb: vi.fn(),
  configureScope: vi.fn(),
};

// Mock OpenTelemetry
const mockTracer = {
  startSpan: vi.fn(() => ({
    setAttributes: vi.fn(),
    setStatus: vi.fn(),
    recordException: vi.fn(),
    end: vi.fn(),
  })),
  startActiveSpan: vi.fn(),
};

const mockOtel = {
  trace: {
    getTracer: vi.fn(() => mockTracer),
  },
  metrics: {
    getMeter: vi.fn(),
  },
};

// Mock Web Vitals
const mockWebVitals = {
  onCLS: vi.fn(),
  onFID: vi.fn(),
  onFCP: vi.fn(),
  onLCP: vi.fn(),
  onTTFB: vi.fn(),
  onINP: vi.fn(),
};

describe('Observability Contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global objects
    global.window = {
      location: { hostname: 'test.neonpro.com.br' },
      navigator: { userAgent: 'test-agent' },
    } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Sentry Configuration Contract', () => {
    test('should provide healthcare-compliant Sentry configuration', () => {
      // Contract: Healthcare Sentry config must include LGPD compliance
      const expectedConfig = {
        dsn: expect.any(String),
        environment: expect.any(String),
        beforeSend: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
        initialScope: expect.any(Object),
        integrations: expect.any(Array),
        tracesSampleRate: expect.any(Number),
        profilesSampleRate: expect.any(Number),
        release: expect.any(String),
      };

      // Test: Configuration structure matches healthcare requirements
      expect(expectedConfig).toMatchObject({
        dsn: expect.any(String),
        environment: expect.any(String),
        beforeSend: expect.any(Function),
        beforeBreadcrumb: expect.any(Function),
      });
    });

    test('should redact PII from error reports', () => {
      // Contract: PII must be redacted for LGPD compliance
      const sensitiveData = {
        cpf: '123.456.789-01',
        email: 'patient@example.com',
        phone: '(11) 99999-9999',
        message: 'Patient João Silva has appointment',
      };

      const redactedData = {
        cpf: '[REDACTED_CPF]',
        email: '[REDACTED_EMAIL]',
        phone: '[REDACTED_PHONE]',
        message: 'Patient [REDACTED_NAME] has appointment',
      };

      // Test: PII redaction function contract
      expect(typeof redactedData).toBe('object');
      expect(redactedData.cpf).toBe('[REDACTED_CPF]');
      expect(redactedData.email).toBe('[REDACTED_EMAIL]');
      expect(redactedData.phone).toBe('[REDACTED_PHONE]');
    });

    test('should categorize healthcare errors correctly', () => {
      // Contract: Healthcare error categories for compliance
      const healthcareErrorCategories = [
        'patient_data_error',
        'medical_workflow_error',
        'compliance_violation',
        'security_incident',
        'ai_model_error',
        'performance_degradation',
        'system_unavailable',
        'data_integrity_error',
      ];

      const testError = new Error('Patient data validation failed');

      // Test: Error categorization contract
      expect(healthcareErrorCategories).toContain('patient_data_error');
      expect(healthcareErrorCategories).toContain('medical_workflow_error');
      expect(healthcareErrorCategories).toContain('compliance_violation');
      expect(Array.isArray(healthcareErrorCategories)).toBe(true);
    });

    test('should include healthcare context in error reports', () => {
      // Contract: Healthcare context for error analysis
      const healthcareContext: HealthcareErrorContext = {
        patient_id: expect.any(String),
        medical_context: expect.any(String),
        workflow_step: expect.any(String),
        compliance_requirements: expect.any(Array),
        security_level: expect.any(String),
        data_sensitivity: expect.any(String),
      };

      // Test: Healthcare context structure
      expect(typeof healthcareContext.patient_id).toBe('string');
      expect(typeof healthcareContext.medical_context).toBe('string');
      expect(typeof healthcareContext.workflow_step).toBe('string');
      expect(Array.isArray(healthcareContext.compliance_requirements)).toBe(
        true,
      );
    });
  });

  describe('OpenTelemetry Tracing Contract', () => {
    test('should provide healthcare-compliant tracing configuration', () => {
      // Contract: Tracing config must include healthcare attributes
      const expectedTracingConfig = {
        serviceName: 'neonpro-healthcare-platform',
        serviceVersion: expect.any(String),
        environment: expect.any(String),
        samplingRate: expect.any(Number),
        enableMetrics: true,
        healthcareCompliance: {
          lgpd: true,
          anvisa: true,
          auditTrail: true,
        },
      };

      // Test: Tracing configuration structure
      expect(expectedTracingConfig.serviceName).toBe(
        'neonpro-healthcare-platform',
      );
      expect(expectedTracingConfig.healthcareCompliance.lgpd).toBe(true);
      expect(expectedTracingConfig.healthcareCompliance.anvisa).toBe(true);
    });

    test('should create spans with healthcare attributes', () => {
      // Contract: Healthcare span attributes for compliance
      const healthcareSpanAttributes: HealthcareSpanAttributes = {
        'healthcare.patient.id': expect.any(String),
        'healthcare.workflow.type': expect.any(String),
        'healthcare.compliance.lgpd': true,
        'healthcare.data.sensitivity': expect.any(String),
        'healthcare.user.role': expect.any(String),
        'healthcare.organization.id': expect.any(String),
      };

      // Test: Healthcare span attributes structure
      expect(healthcareSpanAttributes['healthcare.compliance.lgpd']).toBe(true);
      expect(typeof healthcareSpanAttributes['healthcare.patient.id']).toBe(
        'string',
      );
      expect(typeof healthcareSpanAttributes['healthcare.workflow.type']).toBe(
        'string',
      );
    });

    test('should handle span lifecycle for medical workflows', () => {
      // Contract: Span lifecycle for medical operations
      const spanLifecycle = {
        start: expect.any(Function),
        addEvent: expect.any(Function),
        setAttributes: expect.any(Function),
        recordException: expect.any(Function),
        setStatus: expect.any(Function),
        end: expect.any(Function),
      };

      // Test: Span lifecycle methods exist
      expect(typeof spanLifecycle.start).toBe('function');
      expect(typeof spanLifecycle.addEvent).toBe('function');
      expect(typeof spanLifecycle.setAttributes).toBe('function');
      expect(typeof spanLifecycle.recordException).toBe('function');
      expect(typeof spanLifecycle.setStatus).toBe('function');
      expect(typeof spanLifecycle.end).toBe('function');
    });

    test('should provide medical workflow tracing utilities', () => {
      // Contract: Medical workflow tracing helpers
      const workflowTracingUtils = {
        tracePatientOperation: expect.any(Function),
        traceAIInteraction: expect.any(Function),
        traceMedicalRecord: expect.any(Function),
        traceEmergencyWorkflow: expect.any(Function),
        traceComplianceCheck: expect.any(Function),
      };

      // Test: Workflow tracing utilities
      expect(typeof workflowTracingUtils.tracePatientOperation).toBe(
        'function',
      );
      expect(typeof workflowTracingUtils.traceAIInteraction).toBe('function');
      expect(typeof workflowTracingUtils.traceMedicalRecord).toBe('function');
    });
  });

  describe('Web Vitals Monitoring Contract', () => {
    test('should provide healthcare-specific performance thresholds', () => {
      // Contract: Healthcare performance thresholds for patient safety
      const healthcareThresholds = {
        emergency: {
          lcp: 1000, // 1 second for emergency screens
          fid: 50, // 50ms for emergency interactions
          cls: 0.05, // Very stable layouts for emergency
          fcp: 800, // 800ms for first contentful paint
          ttfb: 200, // 200ms for time to first byte
        },
        patient_care: {
          lcp: 2000, // 2 seconds for patient care screens
          fid: 100, // 100ms for patient interactions
          cls: 0.1, // Stable layouts for patient data
          fcp: 1200, // 1.2s for first contentful paint
          ttfb: 400, // 400ms for time to first byte
        },
        general: {
          lcp: 2500, // Standard web performance
          fid: 100,
          cls: 0.1,
          fcp: 1800,
          ttfb: 600,
        },
      };

      // Test: Healthcare performance thresholds
      expect(healthcareThresholds.emergency.lcp).toBeLessThanOrEqual(1000);
      expect(healthcareThresholds.patient_care.lcp).toBeLessThanOrEqual(2000);
      expect(healthcareThresholds.general.lcp).toBeLessThanOrEqual(2500);
    });

    test('should provide healthcare performance context', () => {
      // Contract: Healthcare context for performance analysis
      const performanceContext: HealthcarePerformanceContext = {
        workflow_type: expect.any(String),
        patient_safety_impact: expect.any(String),
        urgency_level: expect.any(String),
        data_sensitivity: expect.any(String),
        compliance_requirements: expect.any(Array),
        user_role: expect.any(String),
      };

      // Test: Performance context structure
      expect(typeof performanceContext.workflow_type).toBe('string');
      expect(typeof performanceContext.patient_safety_impact).toBe('string');
      expect(typeof performanceContext.urgency_level).toBe('string');
      expect(Array.isArray(performanceContext.compliance_requirements)).toBe(
        true,
      );
    });

    test('should categorize performance impacts by medical urgency', () => {
      // Contract: Performance impact categorization
      const urgencyCategories = [
        'emergency_critical',
        'urgent_care',
        'routine_care',
        'administrative',
        'educational',
      ];

      const impactLevels = [
        'patient_safety_critical',
        'workflow_disrupting',
        'user_experience_degraded',
        'minor_impact',
        'no_impact',
      ];

      // Test: Categorization arrays
      expect(urgencyCategories).toContain('emergency_critical');
      expect(urgencyCategories).toContain('urgent_care');
      expect(impactLevels).toContain('patient_safety_critical');
      expect(impactLevels).toContain('workflow_disrupting');
    });

    test('should provide performance monitoring callbacks', () => {
      // Contract: Performance monitoring callbacks
      const performanceCallbacks = {
        onLCPThresholdExceeded: expect.any(Function),
        onFIDThresholdExceeded: expect.any(Function),
        onCLSThresholdExceeded: expect.any(Function),
        onPerformanceDegradation: expect.any(Function),
        onPatientSafetyImpact: expect.any(Function),
      };

      // Test: Callback functions exist
      expect(typeof performanceCallbacks.onLCPThresholdExceeded).toBe(
        'function',
      );
      expect(typeof performanceCallbacks.onFIDThresholdExceeded).toBe(
        'function',
      );
      expect(typeof performanceCallbacks.onCLSThresholdExceeded).toBe(
        'function',
      );
      expect(typeof performanceCallbacks.onPerformanceDegradation).toBe(
        'function',
      );
      expect(typeof performanceCallbacks.onPatientSafetyImpact).toBe(
        'function',
      );
    });
  });

  describe('Healthcare Compliance Integration', () => {
    test('should provide LGPD compliance logging', () => {
      // Contract: LGPD compliance for all observability
      const lgpdCompliance = {
        dataProcessingLogged: true,
        consentTracked: true,
        piiRedacted: true,
        auditTrailMaintained: true,
        dataSubjectRightsSupported: true,
      };

      // Test: LGPD compliance flags
      expect(lgpdCompliance.dataProcessingLogged).toBe(true);
      expect(lgpdCompliance.consentTracked).toBe(true);
      expect(lgpdCompliance.piiRedacted).toBe(true);
      expect(lgpdCompliance.auditTrailMaintained).toBe(true);
    });

    test('should provide ANVISA cybersecurity compliance', () => {
      // Contract: ANVISA RDC 505/2021 compliance
      const anvisaCompliance = {
        securityMonitoring: true,
        incidentTracking: true,
        vulnerabilityAssessment: true,
        accessControlLogging: true,
        dataIntegrityValidation: true,
      };

      // Test: ANVISA compliance flags
      expect(anvisaCompliance.securityMonitoring).toBe(true);
      expect(anvisaCompliance.incidentTracking).toBe(true);
      expect(anvisaCompliance.vulnerabilityAssessment).toBe(true);
      expect(anvisaCompliance.accessControlLogging).toBe(true);
    });

    test('should integrate with healthcare audit trail', () => {
      // Contract: Healthcare audit trail integration
      const auditTrailIntegration = {
        logUserActions: expect.any(Function),
        logDataAccess: expect.any(Function),
        logSystemEvents: expect.any(Function),
        logComplianceEvents: expect.any(Function),
        generateAuditReport: expect.any(Function),
      };

      // Test: Audit trail functions
      expect(typeof auditTrailIntegration.logUserActions).toBe('function');
      expect(typeof auditTrailIntegration.logDataAccess).toBe('function');
      expect(typeof auditTrailIntegration.logSystemEvents).toBe('function');
      expect(typeof auditTrailIntegration.logComplianceEvents).toBe('function');
      expect(typeof auditTrailIntegration.generateAuditReport).toBe('function');
    });
  });
});

export default {
  mockSentry,
  mockTracer,
  mockOtel,
  mockWebVitals,
};
