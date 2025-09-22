/**
 * Predictive Analytics Service Tests
 *
 * Tests for LGPD-compliant predictive healthcare analytics
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PredictiveAnalyticsService } from "../predictive-analytics.service";
import { StubModelProvider } from "../../ml/stub-provider";

describe("PredictiveAnalyticsService", () => {
  let _service: PredictiveAnalyticsService;
  let mockMLProvider: StubModelProvider;

  beforeEach(() => {
    mockMLProvider = new StubModelProvider(
    service = new PredictiveAnalyticsService(mockMLProvider, true
  }

  describe("generateInsights", () => {
    it(_"should generate predictive insights with LGPD compliance",_async () => {
      const request = {
        patientData: {
          name: "João Silva",
          cpf: "123.456.789-10",
          phone: "(11) 99999-9999",
        },
        appointmentData: {
          patientName: "João Silva",
          patientCPF: "123.456.789-10",
          date: new Date(),
          _service: "Limpeza de Pele",
        },
        timeframe: "month" as const,
      };

      const insights = await service.generateInsights(request

      expect(insights).toBeDefined(
      expect(Array.isArray(insights)).toBe(true);
      expect(insights.length).toBeGreaterThan(0

      // Check that insights have required properties
      insights.forEach((insight) => {
        expect(insight).toHaveProperty("id"
        expect(insight).toHaveProperty("type"
        expect(insight).toHaveProperty("title"
        expect(insight).toHaveProperty("description"
        expect(insight).toHaveProperty("confidence"
        expect(insight).toHaveProperty("impact"
        expect(insight).toHaveProperty("recommendation"
        expect(insight).toHaveProperty("createdAt"
      }
    }

    it(_"should handle different insight types",_async () => {
      const request = {
        timeframe: "week" as const,
        appointmentData: { _service: "Hidratação Facial" },
        historicalData: { revenue: 50000 },
      };

      const insights = await service.generateInsights(request

      const insightTypes = insights.map((insight) => insight.type
      const expectedTypes = [
        "no_show_risk",
        "revenue_forecast",
        "capacity_optimization",
        "patient_outcome",
      ];

      // Should contain at least some of the expected types
      const hasExpectedTypes = expectedTypes.some((type) =>
        insightTypes.includes(type),
      
      expect(hasExpectedTypes).toBe(true);
    }

    it("should work without LGPD compliance (testing mode)", async () => {
      const serviceWithoutLGPD = new PredictiveAnalyticsService(
        mockMLProvider,
        false,
      

      const request = {
        patientData: { name: "Test Patient" },
        timeframe: "month" as const,
      };

      const insights = await serviceWithoutLGPD.generateInsights(request
      expect(insights).toBeDefined(
    }

    it(_"should handle errors gracefully",_async () => {
      const failingProvider = {
        predict: async () => {
          throw new Error("ML Provider failed"
        },
        isAvailable: () => true,
      };

      const serviceWithFailingProvider = new PredictiveAnalyticsService(
        failingProvider,
        true,
      

      await expect(
        serviceWithFailingProvider.generateInsights({ timeframe: "month" }),
      ).rejects.toThrow("Failed to generate predictive insights"
    }
  }

  describe("getAnalyticsMetrics", () => {
    it(_"should return valid analytics metrics",_async () => {
<<<<<<< HEAD
      const metrics = await service.getAnalyticsMetrics(
=======
      const metrics = await service.getAnalyticsMetrics();
>>>>>>> origin/main

      expect(metrics).toHaveProperty("attendanceRate"
      expect(metrics).toHaveProperty("revenuePerPatient"
      expect(metrics).toHaveProperty("operationalEfficiency"
      expect(metrics).toHaveProperty("patientSatisfaction"
      expect(metrics).toHaveProperty("capacityUtilization"
      expect(metrics).toHaveProperty("avgWaitTime"
      expect(metrics).toHaveProperty("npsScore"
      expect(metrics).toHaveProperty("returnRate"

      // Validate metric ranges
      expect(metrics.attendanceRate).toBeGreaterThanOrEqual(0
      expect(metrics.attendanceRate).toBeLessThanOrEqual(1
      expect(metrics.revenuePerPatient).toBeGreaterThan(0
      expect(metrics.npsScore).toBeGreaterThanOrEqual(0
      expect(metrics.npsScore).toBeLessThanOrEqual(10
    }
  }

  describe("generateComplianceReport", () => {
    it(_"should generate LGPD compliance report",_async () => {
<<<<<<< HEAD
      const report = await service.generateComplianceReport(
=======
      const report = await service.generateComplianceReport();
>>>>>>> origin/main

      expect(report).toHaveProperty("anonymizationEnabled"
      expect(report).toHaveProperty("dataProcessingCompliant"
      expect(report).toHaveProperty("auditTrail"
      expect(report).toHaveProperty("lastAudit"

      expect(report.anonymizationEnabled).toBe(true);
      expect(report.dataProcessingCompliant).toBe(true);
      expect(Array.isArray(report.auditTrail)).toBe(true);
      expect(report.auditTrail.length).toBeGreaterThan(0
      expect(report.lastAudit).toBeInstanceOf(Date
    }

    it(_"should include privacy protection measures in audit trail",_async () => {
<<<<<<< HEAD
      const report = await service.generateComplianceReport(
=======
      const report = await service.generateComplianceReport();
>>>>>>> origin/main

      const auditMessages = report.auditTrail.join(" ").toLowerCase(
      expect(auditMessages).toContain("anonymization"
      expect(auditMessages).toContain("sensitive"
      expect(auditMessages).toContain("compliance"
    }
  }

  describe("LGPD Compliance", () => {
    it(_"should anonymize sensitive data before processing",_async () => {
      const sensitiveRequest = {
        patientData: {
          name: "Maria Santos",
          cpf: "987.654.321-00",
          phone: "(11) 88888-8888",
          address: "Rua das Flores, 123",
        },
        timeframe: "month" as const,
      };

      // Service with LGPD enabled should work without exposing data
      const insights = await service.generateInsights(sensitiveRequest
      expect(insights).toBeDefined(

      // The insights should not contain original sensitive data
      const allInsightData = JSON.stringify(insights
      expect(allInsightData).not.toContain("Maria Santos"
      expect(allInsightData).not.toContain("987.654.321-00"
    }
  }

  describe("Predictive Insights Quality", () => {
    it(_"should generate high-confidence insights",_async () => {
      const request = {
        appointmentData: {
          _service: "Peeling Químico",
          dayOfWeek: "tuesday",
          timeSlot: "14:00",
        },
        timeframe: "month" as const,
      };

      const insights = await service.generateInsights(request

      // At least some insights should have high confidence
      const highConfidenceInsights = insights.filter((insight) => insight.confidence > 0.7,
<<<<<<< HEAD
      
      expect(highConfidenceInsights.length).toBeGreaterThan(0
    }
=======
      );
      expect(highConfidenceInsights.length).toBeGreaterThan(0);
    });
>>>>>>> origin/main

    it(_"should provide actionable recommendations",_async () => {
      const request = { timeframe: "quarter" as const };
      const insights = await service.generateInsights(request

      insights.forEach((insight) => {
        expect(insight.recommendation).toBeDefined(
        expect(insight.recommendation.length).toBeGreaterThan(10
        expect(typeof insight.recommendation).toBe("string"
      }
    }

    it(_"should categorize impact levels correctly",_async () => {
      const request = { timeframe: "week" as const };
      const insights = await service.generateInsights(request

      insights.forEach((insight) => {
        expect(["low", "medium", "high"]).toContain(insight.impact
      }
    }
  }
}
