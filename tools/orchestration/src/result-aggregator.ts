/**
 * Result Aggregator
 * Aggregates and analyzes results from multiple agents and tools
 */

import type { AgentResult } from "../types";

export interface AggregatedResult {
  results: AgentResult[];
  qualityScore: number;
  successRate: number;
  agentCount: number;
  errorCount: number;
  performanceScore: number;
  complianceScore: number;
}

export interface ResultAnalysis {
  qualityScore: number;
  issues: string[];
  recommendations: string[];
  trends: {
    improving: boolean;
    degrading: boolean;
    stable: boolean;
  };
}

export interface TrendAnalysis {
  direction: "up" | "down" | "stable";
  slope: number;
  confidence: number;
  dataPoints: number;
}

export class ResultAggregator {
  async aggregateAgentResults(results: AgentResult[]): Promise<AggregatedResult> {
    if (results.length === 0) {
      return {
        results: [],
        qualityScore: 0,
        successRate: 0,
        agentCount: 0,
        errorCount: 0,
        performanceScore: 0,
        complianceScore: 0
      };
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;
    
    return {
      results,
      qualityScore: this.calculateQualityScore(results),
      successRate: successCount / results.length,
      agentCount: results.length,
      errorCount,
      performanceScore: this.calculatePerformanceScore(results),
      complianceScore: this.calculateComplianceScore(results)
    };
  }

  async analyzeResult(aggregated: AggregatedResult): Promise<ResultAnalysis> {
    return {
      qualityScore: aggregated.qualityScore,
      issues: this.identifyIssues(aggregated),
      recommendations: this.generateRecommendations(aggregated),
      trends: {
        improving: aggregated.qualityScore > 0.8,
        degrading: aggregated.qualityScore < 0.5,
        stable: aggregated.qualityScore >= 0.5 && aggregated.qualityScore <= 0.8
      }
    };
  }

  async analyzeTrend(dataPoints: Array<{ qualityScore: number; timestamp: number }>, metric: string): Promise<TrendAnalysis> {
    const scores = dataPoints.map(d => d.qualityScore);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return {
      direction: avg > 0.7 ? "up" : avg < 0.5 ? "down" : "stable",
      slope: 0.1,
      confidence: 0.8,
      dataPoints: dataPoints.length
    };
  }

  calculatePerformanceMetrics(results: AgentResult[]): Record<string, number> {
    if (results.length === 0) {
      return {
        averageExecutionTime: 0,
        successRate: 0,
        qualityScore: 0,
        performanceScore: 0
      };
    }

    return {
      averageExecutionTime: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      successRate: results.filter(r => r.success).length / results.length,
      qualityScore: this.calculateQualityScore(results),
      performanceScore: this.calculatePerformanceScore(results)
    };
  }

  private calculateQualityScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const scores = results.map(r => (r.metrics as any)?.quality || (r.success ? 0.8 : 0.2));
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculatePerformanceScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const scores = results.map(r => (r.metrics as any)?.performance || (r.success ? 0.8 : 0.3));
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private calculateComplianceScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const scores = results.map(r => (r.metrics as any)?.complianceScore || (r.success ? 0.9 : 0.0));
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  private identifyIssues(aggregated: AggregatedResult): string[] {
    const issues: string[] = [];
    if (aggregated.errorCount > 0) {
      issues.push(`${aggregated.errorCount} failures detected`);
    }
    if (aggregated.qualityScore < 0.7) {
      issues.push("Quality score below threshold");
    }
    return issues;
  }

  private generateRecommendations(aggregated: AggregatedResult): string[] {
    const recommendations: string[] = [];
    if (aggregated.errorCount > 0) {
      recommendations.push("Review and fix failing components");
    }
    if (aggregated.qualityScore < 0.8) {
      recommendations.push("Improve code quality and test coverage");
    }
    return recommendations;
  }
}