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

describe(_"Base Metrics",_() => {
  describe(_"BaseMetric interface and type guards",_() => {
    let validMetric: BaseMetric;

    beforeEach(_() => {
      validMetric = createMockMetric({
        name: "test_metric",
        value: 100,
        dataType: "number",
      });
    });

    it(_"should create a valid BaseMetric",_() => {
      expect(isBaseMetric(validMetric)).toBe(true);
      expect(validMetric.id).toBeDefined();
      expect(validMetric.name).toBe("test_metric");
      expect(validMetric.value).toBe(100);
      expect(validMetric.dataType).toBe("number");
      expect(validMetric.complianceFrameworks).toContain("LGPD");
    });

    it(_"should validate required fields in isBaseMetric",_() => {
      expect(isBaseMetric({})).toBe(false);
      expect(isBaseMetric({ id: "test" })).toBe(false);
      expect(isBaseMetric({ id: "test", name: "test" })).toBe(false);
      expect(isBaseMetric(null)).toBe(false);
      expect(isBaseMetric(undefined)).toBe(false);
    });

    it(_"should handle different data types",_() => {
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

      metrics.forEach(_(metric) => {
        expect(isBaseMetric(metric)).toBe(true);
      });
    });
  });

  describe(_"AnalyticsEvent interface and type guards",_() => {
    let validEvent: AnalyticsEvent;

    beforeEach(_() => {
      validEvent = createMockAnalyticsEvent({
        eventType: "metric_created",
        clinicId: "clinic_123",
        _userId: "user_456",
      });
    });

    it(_"should create a valid AnalyticsEvent",_() => {
      expect(isAnalyticsEvent(validEvent)).toBe(true);
      expect(validEvent.id).toBeDefined();
      expect(validEvent.eventType).toBe("metric_created");
      expect(validEvent.clinicId).toBe("clinic_123");
      expect(validEvent._userId).toBe("user_456");
      expect(validEvent.timestamp).toBeInstanceOf(Date);
    });

    it(_"should validate required fields in isAnalyticsEvent",_() => {
      expect(isAnalyticsEvent({})).toBe(false);
      expect(isAnalyticsEvent({ id: "test", eventType: "test" })).toBe(false);
      expect(isAnalyticsEvent(null)).toBe(false);
      expect(isAnalyticsEvent(undefined)).toBe(false);
    });
  });

  describe(_"anonymizeMetric function",_() => {
    it(_"should anonymize personal data in metrics",_() => {
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

    it(_"should preserve non-personal data",_() => {
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

  describe(_"validateMetricCompliance function",_() => {
    it(_"should validate LGPD compliance",_() => {
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

    it(_"should validate ANVISA compliance for clinical data",_() => {
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

    it(_"should validate CFM compliance for medical practice data",_() => {
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

    it(_"should pass validation for compliant metrics",_() => {
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

  describe(_"aggregateMetrics function",_() => {
    it(_"should aggregate metrics by sum",_() => {
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

    it(_"should aggregate metrics by average",_() => {
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

    it(_"should aggregate metrics by count",_() => {
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

    it(_"should find minimum and maximum values",_() => {
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

    it(_"should handle empty metrics array",_() => {
      const aggregated = aggregateMetrics([], "sum");

      expect(aggregated.value).toBe(0);
      expect(aggregated.metadata?.sourceMetricCount).toBe(0);
    });
  });

  describe(_"Risk level assessment",_() => {
    it(_"should correctly identify risk levels",_() => {
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

  describe(_"Compliance frameworks",_() => {
    it(_"should support multiple compliance frameworks",_() => {
      const metric = createMockMetric({
        complianceFrameworks: ["LGPD", "ANVISA", "CFM"],
      });

      expect(metric.complianceFrameworks).toContain("LGPD");
      expect(metric.complianceFrameworks).toContain("ANVISA");
      expect(metric.complianceFrameworks).toContain("CFM");
    });
  });

  describe(_"Currency and localization",_() => {
    it(_"should handle Brazilian Real currency",_() => {
      const metric = createMockMetric({
        dataType: "currency",
        value: 1500.75,
        currency: "BRL",
      });

      expect(metric.currency).toBe("BRL");
      expect(typeof metric.value).toBe("number");
    });

    it(_"should handle percentage values",_() => {
      const metric = createMockMetric({
        dataType: "percentage",
        value: 85.5,
        unit: "%",
      });

      expect(metric.unit).toBe("%");
      expect(metric.value).toBe(85.5);
    });
  });

  describe(_"Timestamp handling",_() => {
    it(_"should track creation and update timestamps",_() => {
      const metric = createMockMetric({});

      expect(metric.timestamp).toBeInstanceOf(Date);
      expect(metric.lastUpdated).toBeInstanceOf(Date);
      expect(metric.createdAt).toBeInstanceOf(Date);
    });

    it(_"should handle timezone considerations",_() => {
      const metric = createMockMetric({});
      const _now = new Date();

      // Timestamps should be recent (within last few seconds)
      expect(metric.timestamp.getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });
});
