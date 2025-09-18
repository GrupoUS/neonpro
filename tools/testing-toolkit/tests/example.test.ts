/**
 * Example Test Suite
 *
 * Demonstrates the unified testing toolkit capabilities including
 * TDD cycles, agent coordination, and healthcare compliance.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createMockLGPDData, createTDDSuite, LGPDValidator, TDDCycle } from '../src';
import { AgentCoordinator } from '../src/agents';

describe('NeonPro Testing Toolkit Examples', () => {
  describe('TDD Cycle Example', () => {
    let cycle: TDDCycle;

    beforeEach(() => {
      cycle = new TDDCycle({
        feature: 'patient-authentication',
        agents: ['architect-review', 'security-auditor', 'code-reviewer'],
        compliance: ['LGPD'],
        coverageThreshold: 90,
      });
    });

    it('should demonstrate RED phase', async () => {
      const result = await cycle.redPhase(() => {
        // This should fail initially (RED phase)
        throw new Error('Test not implemented yet');
      });

      expect(result).toBe(true); // RED phase expects failure
    });

    it('should demonstrate GREEN phase', async () => {
      await cycle.redPhase(() => {
        throw new Error('Test not implemented yet');
      });

      const result = await cycle.greenPhase(() => {
        // Minimal implementation to pass tests
        return { authenticated: true };
      });

      expect(result).toBe(true);
    });

    it('should demonstrate REFACTOR phase', async () => {
      await cycle.redPhase(() => {
        throw new Error('Test not implemented yet');
      });

      await cycle.greenPhase(() => {
        return { authenticated: true };
      });

      const result = await cycle.refactorPhase(() => {
        // Improved implementation
        return {
          authenticated: true,
          user: { id: '123', role: 'patient' },
          auditTrail: [{ action: 'login', timestamp: new Date() }],
        };
      });

      expect(result).toBe(true);
    });
  });

  describe('Agent Coordination Example', () => {
    it.skip('should coordinate agents in parallel', async () => {
      // TODO: Fix AgentCoordinator import issue in test environment
      const coordinator = new AgentCoordinator({
        pattern: 'parallel',
        agents: ['architect-review', 'code-reviewer', 'security-auditor'],
        qualityGates: ['architecture-compliance', 'code-quality', 'security-scan'],
      });

      const results = await coordinator.execute();

      expect(results).toHaveLength(3);
      expect(results.every(r => r.agent)).toBe(true);

      const summary = coordinator.getSummary();
      expect(summary.pattern).toBe('parallel');
      expect(summary.agents).toHaveLength(3);
    });

    it.skip('should coordinate agents sequentially', async () => {
      // TODO: Fix AgentCoordinator import issue in test environment
      const coordinator = new AgentCoordinator({
        pattern: 'sequential',
        agents: ['architect-review', 'code-reviewer'],
        qualityGates: ['architecture-compliance', 'code-quality'],
      });

      const results = await coordinator.execute();

      expect(results).toHaveLength(2);

      const summary = coordinator.getSummary();
      expect(summary.pattern).toBe('sequential');
    });
  });

  describe('LGPD Compliance Example', () => {
    it('should validate LGPD compliant data', () => {
      const testData = createMockLGPDData();

      expect(LGPDValidator.validateConsent(testData)).toBe(true);
      expect(LGPDValidator.validateAuditTrail(testData)).toBe(true);
      expect(LGPDValidator.validateDataSubjectRights(testData)).toBe(true);

      const result = LGPDValidator.validateCompliance(testData, ['name', 'email', 'cpf']);
      expect(result.isCompliant).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect LGPD violations', () => {
      const invalidData = createMockLGPDData({
        consentGiven: false,
        auditTrail: [],
      });

      const result = LGPDValidator.validateCompliance(invalidData, ['name', 'email', 'cpf']);
      expect(result.isCompliant).toBe(false);
      expect(result.violations.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('should use custom LGPD matchers', () => {
      const compliantData = createMockLGPDData();
      const nonCompliantData = createMockLGPDData({
        consentGiven: false,
        dataProcessingPurpose: '', // Empty string should fail
        auditTrail: undefined as any, // Missing audit trail
      });

      expect(compliantData).toBeCompliantWithLGPD();
      expect(compliantData).toHaveAuditTrail();

      // Test that non-compliant data fails the matcher
      expect(nonCompliantData).not.toBeCompliantWithLGPD();
    });
  });

  describe('Integration with MSW', () => {
    it('should mock API responses', async () => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password',
        }),
      });

      expect(response.ok).toBe(true);

      const data = await response.json();
      expect(data.user.email).toBe('test@example.com');
      expect(data.token).toBe('mock-jwt-token');
    });

    it('should validate LGPD compliance in API responses', async () => {
      const response = await fetch('/api/patients/test-patient-789');
      expect(response.ok).toBe(true);

      const patient = await response.json();
      expect(patient.consent_given).toBe(true);
      expect(patient.data_processing_purpose).toBeTruthy();
      expect(Array.isArray(patient.audit_trail)).toBe(true);
    });
  });
});

// Example of using the TDD suite creator
createTDDSuite(
  {
    feature: 'user-registration',
    agents: ['security-auditor', 'code-reviewer'],
    compliance: ['LGPD'],
  },
  {
    redPhase: () => {
      // Define failing tests
      expect(false).toBe(true); // This will fail
    },
    greenPhase: () => {
      // Minimal implementation
      const user = { id: '123', email: 'test@example.com' };
      expect(user.id).toBeTruthy();
    },
    refactorPhase: () => {
      // Improved implementation
      const user = {
        id: '123',
        email: 'test@example.com',
        createdAt: new Date(),
        lgpdCompliant: true,
      };
      expect(user.lgpdCompliant).toBe(true);
    },
  },
);
