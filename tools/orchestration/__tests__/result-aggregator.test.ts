/**
 * Result Aggregator Tests
 * Tests unified result handling with analysis and trend detection
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { ResultAggregator } from "../src/result-aggregator";
import type {
  AgentResult,
  AggregatedResult,
  ResultAnalysis,
  FeatureContext,
  AgentName,
} from "../types";

describe("ResultAggregator", () => {
  let aggregator: ResultAggregator;

  beforeEach(() => {
    aggregator = new ResultAggregator();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  describe("Agent Result Aggregation", () => {
    it("should aggregate single agent result", async () => {
      const agentResult: AgentResult = {
        agentName: "test" as AgentName,
        success: true,
        duration: 1000,
        result: { test: "passed" },
        metrics: { quality: 0.9 },
        errors: [],
        warnings: [],
      };

      const aggregated = await aggregator.aggregateAgentResults([agentResult]);

      expect(aggregated.id).toBeDefined();
      expect(aggregated.source).toBe("agent");
      expect(aggregated.results.length).toBe(1);
      expect(aggregated.qualityScore).toBe(0.9);
      expect(aggregated.duration).toBe(1000);
    });

    it("should aggregate multiple agent results", async () => {
      const agentResults: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "code-reviewer" as AgentName,
          success: true,
          duration: 1500,
          result: { review: "approved" },
          metrics: { quality: 0.8 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "security-auditor" as AgentName,
          success: true,
          duration: 2000,
          result: { security: "secure" },
          metrics: { quality: 0.95 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(agentResults);

      expect(aggregated.results.length).toBe(3);
      expect(aggregated.qualityScore).toBeCloseTo(0.883, 2); // Average of 0.9, 0.8, 0.95
      expect(aggregated.duration).toBe(4500); // Sum of all durations
      expect(aggregated.agentCount).toBe(3);
    });

    it("should handle failed agent results", async () => {
      const agentResults: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "failing-agent" as AgentName,
          success: false,
          duration: 500,
          result: { error: "failed" },
          metrics: { quality: 0.3 },
          errors: ["Critical error"],
          warnings: ["Warning"],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(agentResults);

      expect(aggregated.results.length).toBe(2);
      expect(aggregated.successRate).toBe(0.5); // 1 out of 2 succeeded
      expect(aggregated.errorCount).toBe(1);
      expect(aggregated.warningCount).toBe(1);
      expect(aggregated.qualityScore).toBeLessThan(0.9);
    });
  });

  describe("Result Analysis", () => {
    it("should analyze result quality", async () => {
      const agentResults: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9, coverage: 0.85 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(agentResults);
      const analysis = await aggregator.analyzeResult(aggregated);

      expect(analysis).toBeDefined();
      expect(analysis.qualityScore).toBe(0.9);
      expect(analysis.coverageScore).toBe(0.85);
      expect(analysis.performanceScore).toBeGreaterThan(0);
      expect(analysis.reliabilityScore).toBeGreaterThan(0);
    });

    it("should identify issues in results", async () => {
      const agentResults: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: false,
          duration: 5000,
          result: { test: "failed" },
          metrics: { quality: 0.3, coverage: 0.2 },
          errors: ["Test failure"],
          warnings: ["Performance issue"],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(agentResults);
      const analysis = await aggregator.analyzeResult(aggregated);

      expect(analysis.issues.length).toBeGreaterThan(0);
      expect(analysis.issues.some((i) => i.severity === "high")).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    it("should provide improvement suggestions", async () => {
      const agentResults: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.7, coverage: 0.6 },
          errors: [],
          warnings: ["Low coverage"],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(agentResults);
      const analysis = await aggregator.analyzeResult(aggregated);

      expect(analysis.recommendations.length).toBeGreaterThan(0);
      expect(analysis.recommendations.every((r) => typeof r === "string")).toBe(
        true,
      );
    });
  });

  describe("Trend Detection", () => {
    it("should detect quality trends over time", async () => {
      const results = [
        { qualityScore: 0.8, timestamp: Date.now() - 300000 },
        { qualityScore: 0.85, timestamp: Date.now() - 200000 },
        { qualityScore: 0.9, timestamp: Date.now() - 100000 },
        { qualityScore: 0.95, timestamp: Date.now() },
      ];

      const trend = await aggregator.analyzeTrend(results, "quality");

      expect(trend.direction).toBe("improving");
      expect(trend.confidence).toBeGreaterThan(0.7);
      expect(trend.slope).toBeGreaterThan(0);
    });

    it("should detect declining trends", async () => {
      const results = [
        { qualityScore: 0.95, timestamp: Date.now() - 300000 },
        { qualityScore: 0.9, timestamp: Date.now() - 200000 },
        { qualityScore: 0.85, timestamp: Date.now() - 100000 },
        { qualityScore: 0.8, timestamp: Date.now() },
      ];

      const trend = await aggregator.analyzeTrend(results, "quality");

      expect(trend.direction).toBe("declining");
      expect(trend.confidence).toBeGreaterThan(0.7);
      expect(trend.slope).toBeLessThan(0);
    });

    it("should detect stable trends", async () => {
      const results = [
        { qualityScore: 0.85, timestamp: Date.now() - 300000 },
        { qualityScore: 0.86, timestamp: Date.now() - 200000 },
        { qualityScore: 0.84, timestamp: Date.now() - 100000 },
        { qualityScore: 0.85, timestamp: Date.now() },
      ];

      const trend = await aggregator.analyzeTrend(results, "quality");

      expect(trend.direction).toBe("stable");
      expect(trend.variance).toBeLessThan(0.1);
    });
  });

  describe("Anomaly Detection", () => {
    it("should detect performance anomalies", async () => {
      const normalResults = [
        { duration: 1000, qualityScore: 0.9, timestamp: Date.now() - 200000 },
        { duration: 1100, qualityScore: 0.88, timestamp: Date.now() - 100000 },
      ];

      const anomalousResult = {
        duration: 5000, // Much slower
        qualityScore: 0.95,
        timestamp: Date.now(),
      };

      const isAnomaly = await aggregator.detectAnomaly(
        anomalousResult,
        normalResults,
      );

      expect(isAnomaly).toBe(true);
    });

    it("should detect quality anomalies", async () => {
      const normalResults = [
        { qualityScore: 0.9, duration: 1000, timestamp: Date.now() - 200000 },
        { qualityScore: 0.88, duration: 1100, timestamp: Date.now() - 100000 },
      ];

      const anomalousResult = {
        qualityScore: 0.4, // Much lower quality
        duration: 1000,
        timestamp: Date.now(),
      };

      const isAnomaly = await aggregator.detectAnomaly(
        anomalousResult,
        normalResults,
      );

      expect(isAnomaly).toBe(true);
    });

    it("should not flag normal results as anomalies", async () => {
      const normalResults = [
        { qualityScore: 0.9, duration: 1000, timestamp: Date.now() - 200000 },
        { qualityScore: 0.88, duration: 1100, timestamp: Date.now() - 100000 },
      ];

      const normalResult = {
        qualityScore: 0.89,
        duration: 1050,
        timestamp: Date.now(),
      };

      const isAnomaly = await aggregator.detectAnomaly(
        normalResult,
        normalResults,
      );

      expect(isAnomaly).toBe(false);
    });
  });

  describe("Result Categorization", () => {
    it("should categorize results by type", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9, coverage: 0.85 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "security-auditor" as AgentName,
          success: true,
          duration: 1500,
          result: { security: "secure" },
          metrics: { quality: 0.95, vulnerabilities: 0 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "code-reviewer" as AgentName,
          success: true,
          duration: 2000,
          result: { review: "approved" },
          metrics: { quality: 0.8, issues: 2 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const categorized = await aggregator.categorizeResults(aggregated);

      expect(categorized.byType).toBeDefined();
      expect(categorized.byType.test).toBeDefined();
      expect(categorized.byType.security).toBeDefined();
      expect(categorized.byType.codeReview).toBeDefined();
    });

    it("should categorize results by quality", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.95 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "code-reviewer" as AgentName,
          success: true,
          duration: 1500,
          result: { review: "needs improvement" },
          metrics: { quality: 0.6 },
          errors: [],
          warnings: ["Issues found"],
        },
        {
          agentName: "failing-agent" as AgentName,
          success: false,
          duration: 500,
          result: { error: "failed" },
          metrics: { quality: 0.3 },
          errors: ["Critical error"],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const categorized = await aggregator.categorizeResults(aggregated);

      expect(categorized.byQuality.excellent.length).toBe(1);
      expect(categorized.byQuality.good.length).toBe(0);
      expect(categorized.byQuality.fair.length).toBe(1);
      expect(categorized.byQuality.poor.length).toBe(1);
    });
  });

  describe("Healthcare Compliance Analysis", () => {
    it("should analyze healthcare compliance results", async () => {
      const results: AgentResult[] = [
        {
          agentName: "security-auditor" as AgentName,
          success: true,
          duration: 2000,
          result: { lgpd: "compliant", anvisa: "compliant", cfm: "compliant" },
          metrics: { quality: 0.95, complianceScore: 1.0 },
          errors: [],
          warnings: [],
          healthcareCompliance: {
            lgpd: true,
            anvisa: true,
            cfm: true,
            compliant: true,
          },
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const complianceAnalysis = await aggregator.analyzeCompliance(aggregated);

      expect(complianceAnalysis).toBeDefined();
      expect(complianceAnalysis.lgpdCompliant).toBe(true);
      expect(complianceAnalysis.anvisaCompliant).toBe(true);
      expect(complianceAnalysis.cfmCompliant).toBe(true);
      expect(complianceAnalysis.overallComplianceScore).toBe(1.0);
    });

    it("should detect compliance violations", async () => {
      const results: AgentResult[] = [
        {
          agentName: "security-auditor" as AgentName,
          success: false,
          duration: 1500,
          result: {
            lgpd: "non-compliant",
            anvisa: "compliant",
            cfm: "compliant",
          },
          metrics: { quality: 0.6, complianceScore: 0.67 },
          errors: ["LGPD violation"],
          warnings: [],
          healthcareCompliance: {
            lgpd: false,
            anvisa: true,
            cfm: true,
            compliant: false,
          },
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const complianceAnalysis = await aggregator.analyzeCompliance(aggregated);

      expect(complianceAnalysis.lgpdCompliant).toBe(false);
      expect(complianceAnalysis.violations.length).toBeGreaterThan(0);
      expect(complianceAnalysis.overallComplianceScore).toBeLessThan(1.0);
    });
  });

  describe("Performance Metrics", () => {
    it("should calculate performance metrics", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "code-reviewer" as AgentName,
          success: true,
          duration: 1500,
          result: { review: "approved" },
          metrics: { quality: 0.8 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const metrics = await aggregator.calculatePerformanceMetrics(aggregated);

      expect(metrics.averageDuration).toBe(1250);
      expect(metrics.totalDuration).toBe(2500);
      expect(metrics.throughput).toBeGreaterThan(0);
      expect(metrics.efficiency).toBeGreaterThan(0);
    });

    it("should track resource utilization", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9, memoryUsage: 256, cpuUsage: 0.5 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const resourceMetrics =
        await aggregator.calculateResourceUtilization(aggregated);

      expect(resourceMetrics.averageMemoryUsage).toBe(256);
      expect(resourceMetrics.averageCpuUsage).toBe(0.5);
      expect(resourceMetrics.peakMemoryUsage).toBe(256);
    });
  });

  describe("Reporting", () => {
    it("should generate comprehensive reports", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.9 },
          errors: [],
          warnings: [],
        },
        {
          agentName: "code-reviewer" as AgentName,
          success: true,
          duration: 1500,
          result: { review: "approved" },
          metrics: { quality: 0.8 },
          errors: [],
          warnings: [],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const report = await aggregator.generateReport(aggregated);

      expect(report.summary).toBeDefined();
      expect(report.analysis).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.timestamp).toBeDefined();
    });

    it("should provide actionable insights", async () => {
      const results: AgentResult[] = [
        {
          agentName: "test" as AgentName,
          success: true,
          duration: 1000,
          result: { test: "passed" },
          metrics: { quality: 0.7 },
          errors: [],
          warnings: ["Consider improving coverage"],
        },
      ];

      const aggregated = await aggregator.aggregateAgentResults(results);
      const insights = await aggregator.generateInsights(aggregated);

      expect(insights.length).toBeGreaterThan(0);
      expect(insights.every((i) => i.actionable)).toBe(true);
      expect(insights.every((i) => i.priority)).toBe(true);
    });
  });
});
