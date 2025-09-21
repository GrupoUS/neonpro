import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  BaseMetric,
  AnalyticsEvent,
  MetricType,
  RiskLevel,
  ComplianceFramework,
  isBaseMetric,
  isAnalyticsEvent,
  anonymizeMetric,
  validateMetricCompliance,
  aggregateMetrics,
  createMockMetric,
  createMockAnalyticsEvent,
} from "../types/base-metrics";

describe("Base Metrics", () => {
  describe("BaseMetric interface and type guards", () => {
    let validMetric: BaseMetric;

    beforeEach(() => {
      validMetric = createMockMetric({
        name: "test_metric",
        value: 100,
        dataType: "number",
      });
    });

    it("should create a valid BaseMetric", () => {
      expect(isBaseMetric(validMetric)).toBe(true);
      expect(validMetric.id).toBeDefined();
      expect(validMetric.name).toBe("test_metric");
      expect(validMetric.value).toBe(100);
      expect(validMetric.dataType).toBe("number");
      expect(validMetric.complianceFrameworks).toContain("LGPD");
    });

    it("should validate required fields in isBaseMetric", () => {
      expect(isBaseMetric({})).toBe(false);
      expect(isBaseMetric({ id: "test" })).toBe(false);
      expect(isBaseMetric({ id: "test", name: "test" })).toBe(false);
      expect(isBaseMetric(null)).toBe(false);
      expect(isBaseMetric(undefined)).toBe(false);
    });

    it("should handle different data types", () => {
      const metrics = [
        createMockMetric({ dataType: "string", value: "test" }),
        createMockMetric({ dataType: "boolean", value: true }),
        createMockMetric({ dataType: "percentage", value: 85.5 }),
        createMockMetric({
          dataType: "currency",
          value: 1000.5,
          currency: "BRL",
        }),
      ];

      metrics.forEach((metric) => {
        expect(isBaseMetric(metric)).toBe(true);
      });
    });
  });

  describe("AnalyticsEvent interface and type guards", () => {
    let validEvent: AnalyticsEvent;

    beforeEach(() => {
      validEvent = createMockAnalyticsEvent({
        eventType: "metric_created",
        clinicId: "clinic_123",
        userId: "user_456",
      });
    });

    it("should create a valid AnalyticsEvent", () => {
      expect(isAnalyticsEvent(validEvent)).toBe(true);
      expect(validEvent.id).toBeDefined();
      expect(validEvent.eventType).toBe("metric_created");
      expect(validEvent.clinicId).toBe("clinic_123");
      expect(validEvent.userId).toBe("user_456");
      expect(validEvent.timestamp).toBeInstanceOf(Date);
    });

    it("should validate required fields in isAnalyticsEvent", () => {
      expect(isAnalyticsEvent({})).toBe(false);
      expect(isAnalyticsEvent({ id: "test", eventType: "test" })).toBe(false);
      expect(isAnalyticsEvent(null)).toBe(false);
      expect(isAnalyticsEvent(undefined)).toBe(false);
    });
  });

  describe("anonymizeMetric function", () => {
    it("should anonymize personal data in metrics", () => {
      const metric = createMockMetric({
        name: "patient_age",
        value: 45,
        metadata: {
          personalData: true,
          patientId: "P123456",
          doctorName: "Dr. Silva",
        },
      });

      const anonymized = anonymizeMetric(metric);

      expect(anonymized.id).not.toBe(metric.id);
      expect(anonymized.value).toBe(metric.value);
      expect(anonymized.metadata?.personalData).toBe(false);
      expect(anonymized.metadata?.patientId).toBeUndefined();
      expect(anonymized.metadata?.doctorName).toBeUndefined();
      expect(anonymized.metadata?.anonymized).toBe(true);
    });

    it("should preserve non-personal data", () => {
      const metric = createMockMetric({
        name: "total_patients",
        value: 150,
        metadata: {
          personalData: false,
          aggregationLevel: "clinic",
        },
      });

      const anonymized = anonymizeMetric(metric);

      expect(anonymized.value).toBe(metric.value);
      expect(anonymized.metadata?.aggregationLevel).toBe("clinic");
      expect(anonymized.metadata?.anonymized).toBe(true);
    });
  });

  describe("validateMetricCompliance function", () => {
    it("should validate LGPD compliance", () => {
      const metric = createMockMetric({
        name: "patient_satisfaction",
        complianceFrameworks: ["LGPD"],
        metadata: { personalData: true },
      });

      const validation = validateMetricCompliance(metric);

      expect(validation.compliant).toBe(false);
      expect(validation.violations).toContain(
        "Personal data requires explicit consent",
      );
      expect(validation.violations).toContain(
        "Data retention policy must be defined",
      );
    });

    it("should validate ANVISA compliance for clinical data", () => {
      const metric = createMockMetric({
        name: "medication_effectiveness",
        complianceFrameworks: ["ANVISA"],
        metadata: { clinicalData: true },
      });

      const validation = validateMetricCompliance(metric);

      expect(validation.violations).toContain(
        "Clinical data requires ANVISA reporting protocol",
      );
      expect(validation.violations).toContain(
        "Adverse events must be tracked for clinical metrics",
      );
    });

    it("should validate CFM compliance for medical practice data", () => {
      const metric = createMockMetric({
        name: "diagnosis_accuracy",
        complianceFrameworks: ["CFM"],
        metadata: { medicalPractice: true },
      });

      const validation = validateMetricCompliance(metric);

      expect(validation.violations).toContain(
        "Medical practice data requires CFM ethical guidelines compliance",
      );
      expect(validation.violations).toContain(
        "Professional responsibility must be clearly defined",
      );
    });

    it("should pass validation for compliant metrics", () => {
      const metric = createMockMetric({
        name: "clinic_capacity",
        complianceFrameworks: ["LGPD"],
        metadata: {
          personalData: false,
          dataRetentionDays: 2555, // 7 years
          consentObtained: true,
        },
      });

      const validation = validateMetricCompliance(metric);

      expect(validation.compliant).toBe(true);
      expect(validation.violations).toHaveLength(0);
    });
  });

  describe("aggregateMetrics function", () => {
    it("should aggregate metrics by sum", () => {
      const metrics = [
        createMockMetric({
          name: "revenue",
          value: 1000,
          dataType: "currency",
        }),
        createMockMetric({
          name: "revenue",
          value: 1500,
          dataType: "currency",
        }),
        createMockMetric({ name: "revenue", value: 800, dataType: "currency" }),
      ];

      const aggregated = aggregateMetrics(metrics, "sum");

      expect(aggregated.value).toBe(3300);
      expect(aggregated.name).toBe("revenue_aggregated");
      expect(aggregated.metadata?.aggregationType).toBe("sum");
      expect(aggregated.metadata?.sourceMetricCount).toBe(3);
    });

    it("should aggregate metrics by average", () => {
      const metrics = [
        createMockMetric({
          name: "satisfaction",
          value: 4.5,
          dataType: "number",
        }),
        createMockMetric({
          name: "satisfaction",
          value: 4.0,
          dataType: "number",
        }),
        createMockMetric({
          name: "satisfaction",
          value: 4.8,
          dataType: "number",
        }),
      ];

      const aggregated = aggregateMetrics(metrics, "average");

      expect(aggregated.value).toBeCloseTo(4.43, 1);
      expect(aggregated.metadata?.aggregationType).toBe("average");
    });

    it("should aggregate metrics by count", () => {
      const metrics = [
        createMockMetric({ name: "patient_visit", value: 1 }),
        createMockMetric({ name: "patient_visit", value: 1 }),
        createMockMetric({ name: "patient_visit", value: 1 }),
        createMockMetric({ name: "patient_visit", value: 1 }),
      ];

      const aggregated = aggregateMetrics(metrics, "count");

      expect(aggregated.value).toBe(4);
      expect(aggregated.metadata?.aggregationType).toBe("count");
    });

    it("should find minimum and maximum values", () => {
      const metrics = [
        createMockMetric({ name: "wait_time", value: 15 }),
        createMockMetric({ name: "wait_time", value: 25 }),
        createMockMetric({ name: "wait_time", value: 5 }),
        createMockMetric({ name: "wait_time", value: 30 }),
      ];

      const min = aggregateMetrics(metrics, "min");
      const max = aggregateMetrics(metrics, "max");

      expect(min.value).toBe(5);
      expect(max.value).toBe(30);
    });

    it("should handle empty metrics array", () => {
      const aggregated = aggregateMetrics([], "sum");

      expect(aggregated.value).toBe(0);
      expect(aggregated.metadata?.sourceMetricCount).toBe(0);
    });
  });

  describe("Risk level assessment", () => {
    it("should correctly identify risk levels", () => {
      const lowRisk = createMockMetric({ riskLevel: "LOW" });
      const mediumRisk = createMockMetric({ riskLevel: "MEDIUM" });
      const highRisk = createMockMetric({ riskLevel: "HIGH" });
      const criticalRisk = createMockMetric({ riskLevel: "CRITICAL" });

      expect(lowRisk.riskLevel).toBe("LOW");
      expect(mediumRisk.riskLevel).toBe("MEDIUM");
      expect(highRisk.riskLevel).toBe("HIGH");
      expect(criticalRisk.riskLevel).toBe("CRITICAL");
    });
  });

  describe("Compliance frameworks", () => {
    it("should support multiple compliance frameworks", () => {
      const metric = createMockMetric({
        complianceFrameworks: ["LGPD", "ANVISA", "CFM"],
      });

      expect(metric.complianceFrameworks).toContain("LGPD");
      expect(metric.complianceFrameworks).toContain("ANVISA");
      expect(metric.complianceFrameworks).toContain("CFM");
    });
  });

  describe("Currency and localization", () => {
    it("should handle Brazilian Real currency", () => {
      const metric = createMockMetric({
        dataType: "currency",
        value: 1500.75,
        currency: "BRL",
      });

      expect(metric.currency).toBe("BRL");
      expect(typeof metric.value).toBe("number");
    });

    it("should handle percentage values", () => {
      const metric = createMockMetric({
        dataType: "percentage",
        value: 85.5,
        unit: "%",
      });

      expect(metric.unit).toBe("%");
      expect(metric.value).toBe(85.5);
    });
  });

  describe("Timestamp handling", () => {
    it("should track creation and update timestamps", () => {
      const metric = createMockMetric({});

      expect(metric.timestamp).toBeInstanceOf(Date);
      expect(metric.lastUpdated).toBeInstanceOf(Date);
      expect(metric.createdAt).toBeInstanceOf(Date);
    });

    it("should handle timezone considerations", () => {
      const metric = createMockMetric({});
      const now = new Date();

      // Timestamps should be recent (within last few seconds)
      expect(metric.timestamp.getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });
});
