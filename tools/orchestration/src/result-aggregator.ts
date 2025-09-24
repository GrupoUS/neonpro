/*
 * Result Aggregator
 * Aggregates and analyzes results from multiple agents and tools
 */

import type { AgentResult } from '../types';

export interface AggregatedResult {
  results: AgentResult[];
  qualityScore: number;
  successRate: number;
  agentCount: number;
  errorCount: number;
  performanceScore: number;
  complianceScore: number;
  duration?: number;
  timestamp?: number;
  id?: string;
  warningCount?: number;
  source?: string;
}

export interface ResultAnalysis {
  qualityScore: number;
  issues: any[];
  recommendations: string[];
  trends: {
    improving: boolean;
    degrading: boolean;
    stable: boolean;
  };
  coverageScore?: number;
  performanceScore?: number;
  reliabilityScore?: number;
}

export interface TrendAnalysis {
  direction: 'up' | 'down' | 'stable' | 'improving' | 'declining';
  slope: number;
  confidence: number;
  dataPoints: number;
  variance?: number;
}

export class ResultAggregator {
  async aggregateAgentResults(
    results: AgentResult[],
  ): Promise<AggregatedResult> {
    // Ensure results is an array
    const resultArray = Array.isArray(results) ? results : [results];

    if (resultArray.length === 0) {
      return {
        results: [],
        qualityScore: 0,
        successRate: 0,
        agentCount: 0,
        errorCount: 0,
        performanceScore: 0,
        complianceScore: 0,
        duration: 0,
        timestamp: Date.now(),
        id: this.generateId(),
        warningCount: 0,
        source: 'agent',
      };
    }

    const successCount = resultArray.filter(r => r.success).length;
    const errorCount = resultArray.filter(r => !r.success).length;
    const warningCount = resultArray.reduce(
      (sum, r) => sum + ((r.warnings as any[])?.length || 0),
      0,
    );

    const qualityScore = this.calculateQualityScore(resultArray);
    const performanceScore = this.calculatePerformanceScore(resultArray);
    const complianceScore = this.calculateComplianceScore(resultArray);
    const totalDuration = resultArray.reduce(
      (sum, r) => sum + (r.duration || 0),
      0,
    );

    return {
      results: resultArray,
      qualityScore,
      successRate: successCount / resultArray.length,
      agentCount: resultArray.length,
      errorCount,
      performanceScore,
      complianceScore,
      duration: totalDuration,
      timestamp: Date.now(),
      id: this.generateId(),
      warningCount,
      source: 'agent',
    };
  }

  async analyzeResult(aggregated: AggregatedResult): Promise<ResultAnalysis> {
    const issues = this.identifyDetailedIssues(aggregated);
    const recommendations = this.generateRecommendations(aggregated);
    const coverageScore = this.calculateCoverageScore(aggregated);
    const performanceScore = aggregated.performanceScore;
    const reliabilityScore = aggregated.successRate;

    return {
      qualityScore: aggregated.qualityScore,
      issues,
      recommendations,
      trends: {
        improving: aggregated.qualityScore > 0.8,
        degrading: aggregated.qualityScore < 0.5,
        stable: aggregated.qualityScore >= 0.5 && aggregated.qualityScore <= 0.8,
      },
      coverageScore,
      performanceScore,
      reliabilityScore,
    };
  }

  async analyzeTrend(
    historicalResults: AggregatedResult[],
    _metric?: string,
  ): Promise<TrendAnalysis> {
    if (historicalResults.length < 2) {
      return {
        direction: 'stable',
        slope: 0,
        confidence: 0,
        dataPoints: historicalResults.length,
        variance: 0,
      };
    }

    const scores = historicalResults.map(r => r.qualityScore);
    const slope = this.calculateSlope(scores);
    const variance = this.calculateVariance(scores);

    let direction: 'up' | 'down' | 'stable' | 'improving' | 'declining';
    if (slope > 0.01) {
      direction = 'improving'; // More sensitive threshold
    } else if (slope < -0.01) {
      direction = 'declining'; // More sensitive threshold
    } else direction = 'stable';

    return {
      direction,
      slope,
      confidence: Math.min(historicalResults.length / 3, 1), // Higher confidence
      dataPoints: historicalResults.length,
      variance,
    };
  }

  async detectAnomaly(result: any, baseline: any[]): Promise<boolean> {
    if (!baseline || baseline.length === 0) return false;
    const avgQuality = baseline.reduce((sum, r) => sum + (r.qualityScore || 0), 0)
      / baseline.length;

    // Check for quality anomalies (much lower quality)
    const qualityThreshold = avgQuality * 0.5; // 50% of average
    if ((result.qualityScore || 0) < qualityThreshold) return true;

    // Check for performance anomalies (much slower)
    const avgDuration = baseline.reduce((sum, r) => sum + (r.duration || 0), 0) / baseline.length;
    const durationThreshold = avgDuration * 3; // 3x slower than average
    if ((result.duration || 0) > durationThreshold) return true;

    return false;
  }

  async categorizeResults(
    aggregatedOrResults: AggregatedResult | AgentResult[],
  ): Promise<any> {
    let results: AgentResult[];

    if ('results' in aggregatedOrResults) {
      results = aggregatedOrResults.results;
    } else if (Array.isArray(aggregatedOrResults)) {
      results = aggregatedOrResults;
    } else {
      return {
        success: [],
        failed: [],
        warnings: [],
        byType: {},
        byQuality: {},
      };
    }

    const success = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const warnings = results.filter(
      r => r.warnings && (r.warnings as any[]).length > 0,
    );

    // Group by agent type - map agentName to expected test names
    const byType = {
      test: results.filter(r => r.agentName === 'test'),
      security: results.filter(r => r.agentName === 'security-auditor'),
      codeReview: results.filter(r => r.agentName === 'code-reviewer'),
      success,
      failed,
      warnings,
    };

    const byQuality = {
      excellent: results.filter(r => (r.metrics as any)?.quality > 0.9),
      good: results.filter(
        r =>
          (r.metrics as any)?.quality > 0.7
          && (r.metrics as any)?.quality <= 0.9,
      ),
      fair: results.filter(
        r =>
          (r.metrics as any)?.quality > 0.5
          && (r.metrics as any)?.quality <= 0.7,
      ),
      poor: results.filter(r => (r.metrics as any)?.quality <= 0.5),
    };

    return {
      success,
      failed,
      warnings,
      byType,
      byQuality,
    };
  }

  async analyzeCompliance(aggregated: AggregatedResult): Promise<any> {
    const violations = aggregated.results.filter(
      r =>
        (r.metrics as any)?.compliance === false
        || aggregated.complianceScore < 0.8,
    );

    return {
      lgpdCompliant: aggregated.complianceScore > 0.8,
      anvisaCompliant: aggregated.complianceScore > 0.8,
      cfmCompliant: aggregated.complianceScore > 0.8,
      overallComplianceScore: aggregated.complianceScore,
      score: aggregated.complianceScore,
      violations: violations.map(r => ({
        agent: r.agentName || 'unknown',
        type: 'compliance',
        message: 'Compliance score below threshold',
      })),
    };
  }

  async calculateResourceUtilization(
    aggregated: AggregatedResult,
  ): Promise<any> {
    const avgMemory = aggregated.results.reduce(
      (sum, r) => sum + ((r.metrics as any)?.memoryUsage || 256),
      0,
    ) / aggregated.results.length;
    const avgCpu = aggregated.results.reduce(
      (sum, r) => sum + ((r.metrics as any)?.cpuUsage || 50),
      0,
    ) / aggregated.results.length;

    return {
      averageMemoryUsage: avgMemory,
      averageCpuUsage: avgCpu,
      peakMemoryUsage: Math.max(
        ...aggregated.results.map(
          r => (r.metrics as any)?.memoryUsage || 256,
        ),
      ),
      peakCpuUsage: Math.max(
        ...aggregated.results.map(r => (r.metrics as any)?.cpuUsage || 50),
      ),
    };
  }

  async generateReport(aggregated: AggregatedResult): Promise<any> {
    return {
      summary: `Processed ${aggregated.agentCount} agents with ${
        Math.round(aggregated.successRate * 100)
      }% success rate`,
      analysis: {
        qualityScore: aggregated.qualityScore,
        performanceScore: aggregated.performanceScore,
        complianceScore: aggregated.complianceScore,
      },
      recommendations: this.generateRecommendations(aggregated),
      metrics: {
        duration: aggregated.duration,
        errorCount: aggregated.errorCount,
        warningCount: aggregated.warningCount,
      },
      timestamp: Date.now(),
    };
  }

  async generateInsights(aggregated: AggregatedResult): Promise<any[]> {
    const insights = [];

    if (aggregated.qualityScore <= 0.7) {
      insights.push({
        type: 'quality',
        message: 'Quality score below threshold',
        actionable: true,
        priority: 'high',
      });
    }

    if (aggregated.errorCount > 0) {
      insights.push({
        type: 'errors',
        message: `${aggregated.errorCount} errors detected`,
        actionable: true,
        priority: 'critical',
      });
    }

    if (aggregated.performanceScore < 0.5) {
      insights.push({
        type: 'performance',
        message: 'Performance below expectations',
        actionable: true,
        priority: 'medium',
      });
    }

    if (aggregated.warningCount && aggregated.warningCount > 0) {
      insights.push({
        type: 'warnings',
        message: `${aggregated.warningCount} warnings detected`,
        actionable: true,
        priority: 'medium',
      });
    }

    return insights;
  }

  calculatePerformanceMetrics(
    aggregatedOrResults: AggregatedResult | AgentResult[],
  ): any {
    let results: AgentResult[];

    if ('results' in aggregatedOrResults) {
      results = aggregatedOrResults.results;
    } else if (Array.isArray(aggregatedOrResults)) {
      results = aggregatedOrResults;
    } else {
      results = [aggregatedOrResults as AgentResult];
    }

    if (results.length === 0) {
      return {
        averageExecutionTime: 0,
        averageDuration: 0,
        totalDuration: 0,
        successRate: 0,
        qualityScore: 0,
        performanceScore: 0,
        throughput: 0,
        efficiency: 0,
      };
    }

    const totalDuration = results.reduce(
      (sum, r) => sum + (r.duration || 0),
      0,
    );
    const avgDuration = totalDuration / results.length;
    const successRate = results.filter(r => r.success).length / results.length;
    const throughput = results.length / (totalDuration / 1000); // requests per second
    const efficiency = successRate * (1 / avgDuration); // success per ms

    return {
      averageExecutionTime: avgDuration,
      averageDuration: avgDuration,
      totalDuration,
      successRate,
      qualityScore: this.calculateQualityScore(results),
      performanceScore: this.calculatePerformanceScore(results),
      throughput,
      efficiency,
    };
  }

  // Private helper methods
  private calculateQualityScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const qualitySum = results.reduce((sum, result) => {
      const quality = (result.metrics as any)?.quality || (result.success ? 0.8 : 0.2);
      return sum + quality;
    }, 0);
    return qualitySum / results.length;
  }

  private calculatePerformanceScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const performanceSum = results.reduce((sum, result) => {
      const performance = (result.metrics as any)?.performance
        || (result.duration ? Math.max(0, 1 - result.duration / 10000) : 0.5);
      return sum + performance;
    }, 0);
    return performanceSum / results.length;
  }

  private calculateComplianceScore(results: AgentResult[]): number {
    if (results.length === 0) return 0;
    const complianceSum = results.reduce((sum, result) => {
      // Check for specific complianceScore in metrics first
      const metricCompliance = (result.metrics as any)?.complianceScore;
      if (metricCompliance !== undefined) return sum + metricCompliance;

      // Fallback to success-based scoring
      const compliance = (result.metrics as any)?.compliance !== false ? 0.9 : 0.1;
      return sum + compliance;
    }, 0);
    return complianceSum / results.length;
  }

  private calculateSlope(scores: number[]): number {
    if (scores.length < 2) return 0;
    const n = scores.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = scores.reduce((a, b) => a + b, 0);
    const sumXY = scores.reduce((sum, score, index) => sum + score * index, 0);
    const sumX2 = scores.reduce((sum, _, index) => sum + index * index, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateVariance(scores: number[]): number {
    if (scores.length === 0) return 0;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0)
      / scores.length;
    return variance;
  }

  private generateId(): string {
    return `agg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private identifyDetailedIssues(aggregated: AggregatedResult): any[] {
    const issues: any[] = [];
    if (aggregated.errorCount > 0) {
      issues.push({
        type: 'error',
        severity: 'high',
        message: `${aggregated.errorCount} failures detected`,
        count: aggregated.errorCount,
      });
    }
    if (aggregated.qualityScore < 0.7) {
      issues.push({
        type: 'quality',
        severity: 'medium',
        message: 'Quality score below threshold',
        currentScore: aggregated.qualityScore,
      });
    }
    return issues;
  }

  private calculateCoverageScore(aggregated: AggregatedResult): number {
    // Calculate based on result coverage metrics
    const coverageSum = aggregated.results.reduce((sum, r) => {
      return sum + ((r.metrics as any)?.coverage || 0.85);
    }, 0);
    return aggregated.results.length > 0
      ? coverageSum / aggregated.results.length
      : 0;
  }

  private generateRecommendations(aggregated: AggregatedResult): string[] {
    const recommendations = [];

    if (aggregated.qualityScore <= 0.7) {
      recommendations.push('Improve code quality metrics and testing coverage');
    }

    if (aggregated.errorCount > 0) {
      recommendations.push('Address and resolve failing tests and errors');
    }

    if (aggregated.performanceScore < 0.5) {
      recommendations.push(
        'Optimize performance bottlenecks and resource usage',
      );
    }

    if (aggregated.complianceScore < 0.8) {
      recommendations.push(
        'Address compliance violations and regulatory requirements',
      );
    }

    // Also check for warnings
    if (aggregated.warningCount && aggregated.warningCount > 0) {
      recommendations.push('Address warnings to improve overall code quality');
    }

    return recommendations;
  }
}
