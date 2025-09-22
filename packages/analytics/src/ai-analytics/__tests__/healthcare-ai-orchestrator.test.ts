/**
 * Healthcare AI Orchestrator Tests
 *
 * Tests for comprehensive healthcare analytics orchestration
 */

import { describe, it, expect, beforeEach } from "vitest";
import { HealthcareAIOrchestrator } from "../healthcare-ai-orchestrator";
import { PredictiveAnalyticsService } from "../predictive-analytics.service";
import { StubModelProvider } from "../../ml/stub-provider";

describe("HealthcareAIOrchestrator", () => {
  let orchestrator: HealthcareAIOrchestrator;

  beforeEach(() => {
    const predictiveService = new PredictiveAnalyticsService(
      new StubModelProvider(),
      true, // Enable LGPD compliance
    

    orchestrator = new HealthcareAIOrchestrator(predictiveService, {
      enablePredictiveAnalytics: true,
      enableLGPDCompliance: true,
    }
  }

  describe("generateHealthcareInsights", () => {
    it(_"should generate comprehensive healthcare insights",_async () => {
<<<<<<< HEAD
      const insights = await orchestrator.generateHealthcareInsights("month"
=======
      const insights = await orchestrator.generateHealthcareInsights("month");
>>>>>>> origin/main

      expect(insights).toHaveProperty("category"
      expect(insights).toHaveProperty("insights"
      expect(insights).toHaveProperty("metrics"
      expect(insights).toHaveProperty("complianceStatus"
      expect(insights).toHaveProperty("generatedAt"

      expect(insights.category).toBe("operational"
      expect(Array.isArray(insights.insights)).toBe(true);
      expect(["compliant", "warning", "violation"]).toContain(
        insights.complianceStatus,
      
      expect(insights.generatedAt).toBeInstanceOf(Date
    }

    it(_"should handle different timeframes",_async () => {
      const weekInsights =
        await orchestrator.generateHealthcareInsights("week"
      const monthInsights =
        await orchestrator.generateHealthcareInsights("month"
      const quarterInsights =
        await orchestrator.generateHealthcareInsights("quarter"

      expect(weekInsights).toBeDefined(
      expect(monthInsights).toBeDefined(
      expect(quarterInsights).toBeDefined(
    }
  }

  describe("performComplianceAudit", () => {
    it(_"should perform comprehensive compliance audit",_async () => {
<<<<<<< HEAD
      const audit = await orchestrator.performComplianceAudit(
=======
      const audit = await orchestrator.performComplianceAudit();
>>>>>>> origin/main

      expect(audit).toHaveProperty("lgpdCompliant"
      expect(audit).toHaveProperty("anvisaCompliant"
      expect(audit).toHaveProperty("cfmCompliant"
      expect(audit).toHaveProperty("auditTrail"
      expect(audit).toHaveProperty("recommendations"
      expect(audit).toHaveProperty("lastAuditDate"

      expect(typeof audit.lgpdCompliant).toBe("boolean"
      expect(typeof audit.anvisaCompliant).toBe("boolean"
      expect(typeof audit.cfmCompliant).toBe("boolean"
      expect(Array.isArray(audit.auditTrail)).toBe(true);
      expect(Array.isArray(audit.recommendations)).toBe(true);
      expect(audit.lastAuditDate).toBeInstanceOf(Date
    }

    it(_"should include Brazilian healthcare compliance checks",_async () => {
<<<<<<< HEAD
      const audit = await orchestrator.performComplianceAudit(
=======
      const audit = await orchestrator.performComplianceAudit();
>>>>>>> origin/main

      const auditText = audit.auditTrail.join(" ").toLowerCase(
      expect(auditText).toContain("anvisa"
      expect(auditText).toContain("cfm"
      expect(auditText).toContain("brazil"
    }
  }

  describe("getDashboardData", () => {
    it(_"should return complete dashboard data",_async () => {
<<<<<<< HEAD
      const dashboard = await orchestrator.getDashboardData(
=======
      const dashboard = await orchestrator.getDashboardData();
>>>>>>> origin/main

      expect(dashboard).toHaveProperty("metrics"
      expect(dashboard).toHaveProperty("insights"
      expect(dashboard).toHaveProperty("compliance"
      expect(dashboard).toHaveProperty("status"

      expect(["healthy", "warning", "critical"]).toContain(dashboard.status
      expect(Array.isArray(dashboard.insights.insights)).toBe(true);
    }

    it(_"should determine status correctly",_async () => {
<<<<<<< HEAD
      const dashboard = await orchestrator.getDashboardData(
=======
      const dashboard = await orchestrator.getDashboardData();
>>>>>>> origin/main

      // For stub data, should typically be healthy
      expect(dashboard.status).toBe("healthy"
    }
  }

  describe("getBrazilianHealthcareKPIs", () => {
    it(_"should return Brazilian healthcare KPIs",_async () => {
<<<<<<< HEAD
      const kpis = await orchestrator.getBrazilianHealthcareKPIs(
=======
      const kpis = await orchestrator.getBrazilianHealthcareKPIs();
>>>>>>> origin/main

      expect(kpis).toHaveProperty("anvisa"
      expect(kpis).toHaveProperty("sus"
      expect(kpis).toHaveProperty("lgpd"

      // ANVISA KPIs
      expect(kpis.anvisa).toHaveProperty("deviceCompliance"
      expect(kpis.anvisa).toHaveProperty("auditScore"
      expect(kpis.anvisa).toHaveProperty("lastInspection"

      // SUS KPIs
      expect(kpis.sus).toHaveProperty("integrationPerformance"
      expect(kpis.sus).toHaveProperty("patientFlow"
      expect(kpis.sus).toHaveProperty("waitingTimeCompliance"

      // LGPD KPIs
      expect(kpis.lgpd).toHaveProperty("dataProtectionScore"
      expect(kpis.lgpd).toHaveProperty("consentRate"
      expect(kpis.lgpd).toHaveProperty("breachCount"
    }

    it(_"should have valid KPI ranges",_async () => {
<<<<<<< HEAD
      const kpis = await orchestrator.getBrazilianHealthcareKPIs(
=======
      const kpis = await orchestrator.getBrazilianHealthcareKPIs();
>>>>>>> origin/main

      // Compliance rates should be between 0 and 1
      expect(kpis.anvisa.deviceCompliance).toBeGreaterThanOrEqual(0
      expect(kpis.anvisa.deviceCompliance).toBeLessThanOrEqual(1

      expect(kpis.sus.integrationPerformance).toBeGreaterThanOrEqual(0
      expect(kpis.sus.integrationPerformance).toBeLessThanOrEqual(1

      expect(kpis.lgpd.dataProtectionScore).toBeGreaterThanOrEqual(0
      expect(kpis.lgpd.dataProtectionScore).toBeLessThanOrEqual(1

      // Breach count should be non-negative
      expect(kpis.lgpd.breachCount).toBeGreaterThanOrEqual(0
    }
  }

  describe("Configuration", () => {
    it("should accept custom configuration", () => {
      const customOrchestrator = new HealthcareAIOrchestrator({
        enablePredictiveAnalytics: false,
        enableLGPDCompliance: false,
        enableRealTimeProcessing: true,
      }

      expect(customOrchestrator).toBeDefined(
    }

    it("should use default configuration when none provided", () => {
      const defaultOrchestrator = new HealthcareAIOrchestrator(
      expect(defaultOrchestrator).toBeDefined(
    }
  }

  describe("Error Handling", () => {
    it(_"should handle errors gracefully",_async () => {
      const failingModelProvider = {
        predict: async () => {
          throw new Error("Provider failed"
        },
        isAvailable: () => false,
        initialize: async () => {
          throw new Error("Failed to initialize"
        },
      };

      const failingPredictiveService = new PredictiveAnalyticsService(
        failingModelProvider,
        true,
      
      const failingOrchestrator = new HealthcareAIOrchestrator(
        failingPredictiveService,
      

      await expect(
        failingOrchestrator.generateHealthcareInsights(),
      ).rejects.toThrow("Failed to generate healthcare insights"
    }
  }
}
