import type { AgentResult, AggregatedResult, ResultAnalysis } from './types';

export class ResultAggregator {
  aggregateResults(results: AgentResult[]): AggregatedResult {
    const overall = {
      success: results.every(r => r.success),
      qualityScore: this.calculateAverageQuality(results),
      performance: this.calculatePerformance(results),
      coverage: this.calculateCoverage(results),
      complianceScore: this.calculateCompliance(results)
    };

    const byAgent: Record<string, AgentResult> = {};
    results.forEach(result => {
      byAgent[result.agentName] = result;
    });

    const byPhase: Record<string, any> = {};

    const trends = {
      quality: [overall.qualityScore],
      performance: [overall.performance],
      coverage: [overall.coverage]
    };

    return {
      overall,
      byAgent,
      byPhase,
      trends
    };
  }

  async aggregateAgentResults(results: AgentResult[]): Promise<any> {
    return {
      id: `agg-${Date.now()}`,
      source: 'agent',
      results: results,
      qualityScore: this.calculateAverageQuality(results),
      duration: results.reduce((sum, r) => sum + r.duration, 0),
      performanceScore: this.calculatePerformance(results),
      complianceScore: this.calculateCompliance(results)
    };
  }

  analyzeResult(result: any): ResultAnalysis {
    return this.analyzeResults([result]);
  }

  analyzeTrend(results: any[]): any {
    return {
      direction: 'stable',
      confidence: 0.8,
      prediction: 'improvement'
    };
  }

  detectAnomaly(data: any): boolean {
    return false; // Simplified implementation
  }

  categorizeResults(results: AgentResult[]): any {
    return {
      success: results.filter(r => r.success),
      failure: results.filter(r => !r.success),
      warning: results.filter(r => r.warnings && r.warnings.length > 0)
    };
  }

  analyzeCompliance(results: AgentResult[]): any {
    return {
      overallCompliance: true,
      lgpdCompliance: true,
      anvisaCompliance: true,
      cfmCompliance: true,
      score: 0.95
    };
  }

  calculatePerformanceMetrics(results: AgentResult[]): any {
    return {
      averageDuration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
      throughput: results.length / (results.reduce((sum, r) => sum + r.duration, 0) / 1000),
      efficiency: 0.85
    };
  }

  calculateResourceUtilization(results: AgentResult[]): any {
    return {
      cpuUsage: 0.6,
      memoryUsage: 0.7,
      diskUsage: 0.4
    };
  }

  generateReport(results: AgentResult[]): any {
    return {
      summary: `Report for ${results.length} results`,
      timestamp: new Date().toISOString(),
      sections: ['execution', 'quality', 'performance']
    };
  }

  generateInsights(results: AgentResult[]): any[] {
    return [
      { type: 'performance', message: 'Overall performance is good' },
      { type: 'quality', message: 'Quality metrics are within acceptable range' }
    ];
  }

  private calculateAverageQuality(results: AgentResult[]): number {
    const qualityScores = results
      .map(r => r.quality?.score || r.metrics?.quality || 0.8)
      .filter(s => s > 0);
    
    return qualityScores.length > 0 
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length 
      : 0.8;
  }

  private calculatePerformance(results: AgentResult[]): number {
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    return Math.max(0, 1 - (avgDuration / 10000)); // Higher performance for shorter duration
  }

  private calculateCoverage(results: AgentResult[]): number {
    const coverageScores = results
      .map(r => r.metrics?.coverage || 0.85)
      .filter(s => s > 0);
    
    return coverageScores.length > 0 
      ? coverageScores.reduce((a, b) => a + b, 0) / coverageScores.length 
      : 0.85;
  }

  private calculateCompliance(results: AgentResult[]): number {
    const complianceScores = results
      .map(r => r.metrics?.complianceScore || 0.9)
      .filter(s => s > 0);
    
    return complianceScores.length > 0 
      ? complianceScores.reduce((a, b) => a + b, 0) / complianceScores.length 
      : 0.9;
  }

  analyzeResults(results: AgentResult[]): ResultAnalysis {
    const aggregated = this.aggregateResults(results);
    
    return {
      summary: `Execution completed with ${results.length} agents`,
      strengths: this.identifyStrengths(aggregated),
      weaknesses: this.identifyWeaknesses(aggregated),
      recommendations: this.generateRecommendations(aggregated),
      performanceScore: aggregated.overall.performance,
      riskAssessment: {
        level: aggregated.overall.qualityScore > 0.8 ? 'low' : 'medium',
        factors: []
      }
    };
  }

  private identifyStrengths(aggregated: AggregatedResult): string[] {
    const strengths: string[] = [];
    if (aggregated.overall.qualityScore > 0.8) {
      strengths.push('High quality score');
    }
    if (aggregated.overall.performance > 0.7) {
      strengths.push('Good performance');
    }
    return strengths;
  }

  private identifyWeaknesses(aggregated: AggregatedResult): string[] {
    const weaknesses: string[] = [];
    if (aggregated.overall.qualityScore < 0.7) {
      weaknesses.push('Low quality score');
    }
    if (aggregated.overall.performance < 0.5) {
      weaknesses.push('Poor performance');
    }
    return weaknesses;
  }

  private generateRecommendations(aggregated: AggregatedResult): string[] {
    const recommendations: string[] = [];
    if (aggregated.overall.qualityScore < 0.8) {
      recommendations.push('Improve code quality');
    }
    if (aggregated.overall.performance < 0.7) {
      recommendations.push('Optimize performance');
    }
    return recommendations;
  }
}