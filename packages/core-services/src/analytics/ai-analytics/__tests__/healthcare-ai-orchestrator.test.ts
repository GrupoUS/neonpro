/**
 * Healthcare AI Orchestrator Tests
 * 
 * Tests for comprehensive healthcare analytics orchestration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HealthcareAIOrchestrator } from '../healthcare-ai-orchestrator';
import { StubModelProvider } from '../../ml/stub-provider';

describe('HealthcareAIOrchestrator', () => {
  let orchestrator: HealthcareAIOrchestrator;

  beforeEach(() => {
    orchestrator = new HealthcareAIOrchestrator({
      enablePredictiveAnalytics: true,
      enableLGPDCompliance: true,
      modelProvider: new StubModelProvider()
    });
  });

  describe('generateHealthcareInsights', () => {
    it('should generate comprehensive healthcare insights', async () => {
      const insights = await orchestrator.generateHealthcareInsights('month');

      expect(insights).toHaveProperty('category');
      expect(insights).toHaveProperty('insights');
      expect(insights).toHaveProperty('metrics');
      expect(insights).toHaveProperty('complianceStatus');
      expect(insights).toHaveProperty('generatedAt');

      expect(insights.category).toBe('operational');
      expect(Array.isArray(insights.insights)).toBe(true);
      expect(['compliant', 'warning', 'violation']).toContain(insights.complianceStatus);
      expect(insights.generatedAt).toBeInstanceOf(Date);
    });

    it('should handle different timeframes', async () => {
      const weekInsights = await orchestrator.generateHealthcareInsights('week');
      const monthInsights = await orchestrator.generateHealthcareInsights('month');
      const quarterInsights = await orchestrator.generateHealthcareInsights('quarter');

      expect(weekInsights).toBeDefined();
      expect(monthInsights).toBeDefined();
      expect(quarterInsights).toBeDefined();
    });
  });

  describe('performComplianceAudit', () => {
    it('should perform comprehensive compliance audit', async () => {
      const audit = await orchestrator.performComplianceAudit();

      expect(audit).toHaveProperty('lgpdCompliant');
      expect(audit).toHaveProperty('anvisaCompliant');
      expect(audit).toHaveProperty('cfmCompliant');
      expect(audit).toHaveProperty('auditTrail');
      expect(audit).toHaveProperty('recommendations');
      expect(audit).toHaveProperty('lastAuditDate');

      expect(typeof audit.lgpdCompliant).toBe('boolean');
      expect(typeof audit.anvisaCompliant).toBe('boolean');
      expect(typeof audit.cfmCompliant).toBe('boolean');
      expect(Array.isArray(audit.auditTrail)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);
      expect(audit.lastAuditDate).toBeInstanceOf(Date);
    });

    it('should include Brazilian healthcare compliance checks', async () => {
      const audit = await orchestrator.performComplianceAudit();

      const auditText = audit.auditTrail.join(' ').toLowerCase();
      expect(auditText).toContain('anvisa');
      expect(auditText).toContain('cfm');
      expect(auditText).toContain('brazil');
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard data', async () => {
      const dashboard = await orchestrator.getDashboardData();

      expect(dashboard).toHaveProperty('metrics');
      expect(dashboard).toHaveProperty('insights');
      expect(dashboard).toHaveProperty('compliance');
      expect(dashboard).toHaveProperty('status');

      expect(['healthy', 'warning', 'critical']).toContain(dashboard.status);
      expect(Array.isArray(dashboard.insights)).toBe(true);
    });

    it('should determine status correctly', async () => {
      const dashboard = await orchestrator.getDashboardData();

      // For stub data, should typically be healthy
      expect(dashboard.status).toBe('healthy');
    });
  });

  describe('getBrazilianHealthcareKPIs', () => {
    it('should return Brazilian healthcare KPIs', async () => {
      const kpis = await orchestrator.getBrazilianHealthcareKPIs();

      expect(kpis).toHaveProperty('anvisa');
      expect(kpis).toHaveProperty('sus');
      expect(kpis).toHaveProperty('lgpd');

      // ANVISA KPIs
      expect(kpis.anvisa).toHaveProperty('deviceCompliance');
      expect(kpis.anvisa).toHaveProperty('auditScore');
      expect(kpis.anvisa).toHaveProperty('lastInspection');

      // SUS KPIs
      expect(kpis.sus).toHaveProperty('integrationPerformance');
      expect(kpis.sus).toHaveProperty('patientFlow');
      expect(kpis.sus).toHaveProperty('waitingTimeCompliance');

      // LGPD KPIs
      expect(kpis.lgpd).toHaveProperty('dataProtectionScore');
      expect(kpis.lgpd).toHaveProperty('consentRate');
      expect(kpis.lgpd).toHaveProperty('breachCount');
    });

    it('should have valid KPI ranges', async () => {
      const kpis = await orchestrator.getBrazilianHealthcareKPIs();

      // Compliance rates should be between 0 and 1
      expect(kpis.anvisa.deviceCompliance).toBeGreaterThanOrEqual(0);
      expect(kpis.anvisa.deviceCompliance).toBeLessThanOrEqual(1);
      
      expect(kpis.sus.integrationPerformance).toBeGreaterThanOrEqual(0);
      expect(kpis.sus.integrationPerformance).toBeLessThanOrEqual(1);
      
      expect(kpis.lgpd.dataProtectionScore).toBeGreaterThanOrEqual(0);
      expect(kpis.lgpd.dataProtectionScore).toBeLessThanOrEqual(1);

      // Breach count should be non-negative
      expect(kpis.lgpd.breachCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Configuration', () => {
    it('should accept custom configuration', () => {
      const customOrchestrator = new HealthcareAIOrchestrator({
        enablePredictiveAnalytics: false,
        enableLGPDCompliance: false,
        enableRealTimeProcessing: true
      });

      expect(customOrchestrator).toBeDefined();
    });

    it('should use default configuration when none provided', () => {
      const defaultOrchestrator = new HealthcareAIOrchestrator();
      expect(defaultOrchestrator).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', async () => {
      const failingOrchestrator = new HealthcareAIOrchestrator({
        modelProvider: {
          predict: async () => { throw new Error('Provider failed'); },
          isAvailable: () => false
        }
      });

      await expect(failingOrchestrator.generateHealthcareInsights())
        .rejects.toThrow('Failed to generate healthcare insights');
    });
  });
});