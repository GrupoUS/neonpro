/**
 * Result Aggregator
 * Unified result handling and analysis for multi-agent orchestration systems
 */

import { createLogger, LogLevel } from './utils/logger';
import type {
  AgentName,
  AgentResult,
  ToolExecutionResult,
  QualityControlSessionResult,
  TestSuiteResult,
  QualityControlResult,
  OrchestrationResult,
  HealthcareCompliance,
} from './types';

const logger = createLogger('ResultAggregator', LogLevel.INFO);

export interface AggregatedResult {
  id: string;
  timestamp: Date;
  source: 'agent' | 'tool' | 'test' | 'quality-control' | 'orchestration';
  success: boolean;
  duration: number;
  primaryScore: number;
  complianceScore?: number;
  qualityScore: number;
  performanceScore: number;
  securityScore: number;
  overallScore: number;
  confidence: number;
  reliability: number;
  category: string;
  subcategories: string[];
  metadata: Record<string, any>;
  analysis: ResultAnalysis;
  recommendations: string[];
  warnings: string[];
  errors: string[];
  rawResults: any[];
}

export interface ResultAnalysis {
  completeness: number; // 0-100
  consistency: number; // 0-100
  accuracy: number; // 0-100
  reliability: number; // 0-100
  relevance: number; // 0-100
  timeliness: number; // 0-100
  compliance: number; // 0-100
  security: number; // 0-100
  performance: number; // 0-100
  quality: number; // 0-100
  trends: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  patterns: {
    successful: string[];
    problematic: string[];
    opportunities: string[];
  };
  anomalies: string[];
  correlations: {
    strong: Correlation[];
    moderate: Correlation[];
    weak: Correlation[];
  };
}

export interface Correlation {
  factor1: string;
  factor2: string;
  strength: number; // 0-1
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface ResultSummary {
  totalResults: number;
  successfulResults: number;
  failedResults: number;
  averageDuration: number;
  overallScore: number;
  confidence: number;
  reliability: number;
  topCategories: { category: string; count: number; avgScore: number }[];
  primaryIssues: { issue: string; frequency: number; severity: 'low' | 'medium' | 'high' }[];
  recommendations: string[];
  warnings: string[];
  actionItems: string[];
}

export interface AggregationConfig {
  scoring: {
    weights: {
      success: number;
      duration: number;
      quality: number;
      compliance: number;
      performance: number;
      security: number;
      reliability: number;
    };
    thresholds: {
      excellent: number;
      good: number;
      acceptable: number;
      poor: number;
    };
  };
  analysis: {
    enableTrendAnalysis: boolean;
    enablePatternRecognition: boolean;
    enableCorrelationAnalysis: boolean;
    enableAnomalyDetection: boolean;
    minConfidence: number;
    minReliability: number;
  };
  aggregation: {
    grouping: 'category' | 'source' | 'timestamp' | 'custom';
    timeWindow: number; // in milliseconds
    maxResults: number;
    enableHierarchical: boolean;
  };
}

export class ResultAggregator {
  private readonly config: AggregationConfig;
  private readonly resultHistory: AggregatedResult[] = [];
  private readonly analysisCache: Map<string, ResultAnalysis> = new Map();

  constructor(config: Partial<AggregationConfig> = {}) {
    this.config = {
      scoring: {
        weights: {
          success: 0.3,
          duration: 0.15,
          quality: 0.25,
          compliance: 0.15,
          performance: 0.1,
          security: 0.05,
          reliability: 0.1,
        },
        thresholds: {
          excellent: 90,
          good: 80,
          acceptable: 70,
          poor: 60,
        },
      },
      analysis: {
        enableTrendAnalysis: true,
        enablePatternRecognition: true,
        enableCorrelationAnalysis: true,
        enableAnomalyDetection: true,
        minConfidence: 0.7,
        minReliability: 0.8,
      },
      aggregation: {
        grouping: 'category',
        timeWindow: 3600000, // 1 hour
        maxResults: 1000,
        enableHierarchical: true,
      },
      ...config,
    };

    logger.constitutional(
      LogLevel.INFO,
      'Result Aggregator initialized',
      {
        compliance: true,
        requirement: 'Result Aggregation System',
        standard: 'Orchestration',
        details: {
          grouping: this.config.aggregation.grouping,
          timeWindow: this.config.aggregation.timeWindow,
          maxResults: this.config.aggregation.maxResults,
        },
      }
    );
  }

  /**
   * Aggregate agent results
   */
  async aggregateAgentResults(results: AgentResult[]): Promise<AggregatedResult> {
    logger.info(`Aggregating ${results.length} agent results`);

    if (results.length === 0) {
      throw new Error('No agent results to aggregate');
    }

    const aggregated = this.createAggregatedResult('agent', results);
    await this.analyzeResult(aggregated);

    this.resultHistory.push(aggregated);
    this.cleanupOldResults();

    return aggregated;
  }

  /**
   * Aggregate tool execution results
   */
  async aggregateToolResults(results: ToolExecutionResult[]): Promise<AggregatedResult> {
    logger.info(`Aggregating ${results.length} tool results`);

    if (results.length === 0) {
      throw new Error('No tool results to aggregate');
    }

    const aggregated = this.createAggregatedResult('tool', results);
    await this.analyzeResult(aggregated);

    this.resultHistory.push(aggregated);
    this.cleanupOldResults();

    return aggregated;
  }

  /**
   * Aggregate quality control session results
   */
  async aggregateQualityControlResults(results: QualityControlSessionResult[]): Promise<AggregatedResult> {
    logger.info(`Aggregating ${results.length} quality control results`);

    if (results.length === 0) {
      throw new Error('No quality control results to aggregate');
    }

    const aggregated = this.createAggregatedResult('quality-control', results);
    await this.analyzeResult(aggregated);

    this.resultHistory.push(aggregated);
    this.cleanupOldResults();

    return aggregated;
  }

  /**
   * Aggregate test suite results
   */
  async aggregateTestResults(results: TestSuiteResult[]): Promise<AggregatedResult> {
    logger.info(`Aggregating ${results.length} test results`);

    if (results.length === 0) {
      throw new Error('No test results to aggregate');
    }

    const aggregated = this.createAggregatedResult('test', results);
    await this.analyzeResult(aggregated);

    this.resultHistory.push(aggregated);
    this.cleanupOldResults();

    return aggregated;
  }

  /**
   * Aggregate mixed results from different sources
   */
  async aggregateMixedResults(results: {
    agent?: AgentResult[];
    tool?: ToolExecutionResult[];
    qualityControl?: QualityControlSessionResult[];
    test?: TestSuiteResult[];
    orchestration?: OrchestrationResult[];
  }): Promise<AggregatedResult[]> {
    logger.info('Aggregating mixed results from multiple sources');

    const aggregatedResults: AggregatedResult[] = [];

    // Aggregate each source type separately
    if (results.agent && results.agent.length > 0) {
      const agentResult = await this.aggregateAgentResults(results.agent);
      aggregatedResults.push(agentResult);
    }

    if (results.tool && results.tool.length > 0) {
      const toolResult = await this.aggregateToolResults(results.tool);
      aggregatedResults.push(toolResult);
    }

    if (results.qualityControl && results.qualityControl.length > 0) {
      const qcResult = await this.aggregateQualityControlResults(results.qualityControl);
      aggregatedResults.push(qcResult);
    }

    if (results.test && results.test.length > 0) {
      const testResult = await this.aggregateTestResults(results.test);
      aggregatedResults.push(testResult);
    }

    // Create cross-source aggregation if multiple sources
    if (aggregatedResults.length > 1) {
      const crossSourceResult = await this.createCrossSourceAggregation(aggregatedResults);
      aggregatedResults.push(crossSourceResult);
    }

    return aggregatedResults;
  }

  /**
   * Get result summary for a time period
   */
  getSummary(timeWindow?: number): ResultSummary {
    const window = timeWindow || this.config.aggregation.timeWindow;
    const cutoff = Date.now() - window;
    
    const recentResults = this.resultHistory.filter(result => result.timestamp.getTime() > cutoff);

    if (recentResults.length === 0) {
      return {
        totalResults: 0,
        successfulResults: 0,
        failedResults: 0,
        averageDuration: 0,
        overallScore: 0,
        confidence: 0,
        reliability: 0,
        topCategories: [],
        primaryIssues: [],
        recommendations: [],
        warnings: [],
        actionItems: [],
      };
    }

    const successfulResults = recentResults.filter(r => r.success);
    const failedResults = recentResults.filter(r => !r.success);
    const averageDuration = recentResults.reduce((sum, r) => sum + r.duration, 0) / recentResults.length;
    const overallScore = recentResults.reduce((sum, r) => sum + r.overallScore, 0) / recentResults.length;
    const confidence = recentResults.reduce((sum, r) => sum + r.confidence, 0) / recentResults.length;
    const reliability = recentResults.reduce((sum, r) => sum + r.reliability, 0) / recentResults.length;

    // Analyze categories
    const categoryStats = new Map<string, { count: number; totalScore: number }>();
    for (const result of recentResults) {
      if (!categoryStats.has(result.category)) {
        categoryStats.set(result.category, { count: 0, totalScore: 0 });
      }
      const stats = categoryStats.get(result.category)!;
      stats.count++;
      stats.totalScore += result.overallScore;
    }

    const topCategories = Array.from(categoryStats.entries())
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        avgScore: stats.totalScore / stats.count,
      }))
      .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore)
      .slice(0, 5);

    // Analyze issues
    const issueStats = new Map<string, { count: number; maxSeverity: number }>();
    for (const result of recentResults) {
      for (const error of result.errors) {
        if (!issueStats.has(error)) {
          issueStats.set(error, { count: 0, maxSeverity: 0 });
        }
        const stats = issueStats.get(error)!;
        stats.count++;
        stats.maxSeverity = Math.max(stats.maxSeverity, result.overallScore < 70 ? 3 : result.overallScore < 85 ? 2 : 1);
      }
    }

    const primaryIssues = Array.from(issueStats.entries())
      .map(([issue, stats]) => ({
        issue,
        frequency: stats.count,
        severity: stats.maxSeverity === 3 ? 'high' : stats.maxSeverity === 2 ? 'medium' : 'low',
      }))
      .sort((a, b) => b.frequency - a.frequency || (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0))
      .slice(0, 10);

    // Generate recommendations
    const recommendations = this.generateRecommendations(recentResults);
    const warnings = this.generateWarnings(recentResults);
    const actionItems = this.generateActionItems(recentResults);

    return {
      totalResults: recentResults.length,
      successfulResults: successfulResults.length,
      failedResults: failedResults.length,
      averageDuration,
      overallScore,
      confidence,
      reliability,
      topCategories,
      primaryIssues,
      recommendations,
      warnings,
      actionItems,
    };
  }

  /**
   * Get trends analysis
   */
  getTrends(timeWindow?: number): {
    trends: {
      score: { direction: 'improving' | 'declining' | 'stable'; change: number };
      reliability: { direction: 'improving' | 'declining' | 'stable'; change: number };
      confidence: { direction: 'improving' | 'declining' | 'stable'; change: number };
    };
    patterns: string[];
    anomalies: string[];
    correlations: Correlation[];
  } {
    const window = timeWindow || this.config.aggregation.timeWindow;
    const cutoff = Date.now() - window;
    
    const recentResults = this.resultHistory.filter(result => result.timestamp.getTime() > cutoff);
    
    if (recentResults.length < 2) {
      return {
        trends: {
          score: { direction: 'stable', change: 0 },
          reliability: { direction: 'stable', change: 0 },
          confidence: { direction: 'stable', change: 0 },
        },
        patterns: [],
        anomalies: [],
        correlations: [],
      };
    }

    // Calculate trends
    const firstHalf = recentResults.slice(0, Math.floor(recentResults.length / 2));
    const secondHalf = recentResults.slice(Math.floor(recentResults.length / 2));

    const firstAvgScore = firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length;
    const secondAvgScore = secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length;
    const scoreChange = secondAvgScore - firstAvgScore;

    const firstAvgReliability = firstHalf.reduce((sum, r) => sum + r.reliability, 0) / firstHalf.length;
    const secondAvgReliability = secondHalf.reduce((sum, r) => sum + r.reliability, 0) / secondHalf.length;
    const reliabilityChange = secondAvgReliability - firstAvgReliability;

    const firstAvgConfidence = firstHalf.reduce((sum, r) => sum + r.confidence, 0) / firstHalf.length;
    const secondAvgConfidence = secondHalf.reduce((sum, r) => sum + r.confidence, 0) / secondHalf.length;
    const confidenceChange = secondAvgConfidence - firstAvgConfidence;

    // Extract patterns and anomalies from recent analyses
    const patterns: string[] = [];
    const anomalies: string[] = [];
    const correlations: Correlation[] = [];

    for (const result of recentResults) {
      patterns.push(...result.analysis.trends.positive, ...result.analysis.trends.negative);
      anomalies.push(...result.analysis.anomalies);
      correlations.push(...result.analysis.correlations.strong, ...result.analysis.correlations.moderate);
    }

    return {
      trends: {
        score: {
          direction: scoreChange > 2 ? 'improving' : scoreChange < -2 ? 'declining' : 'stable',
          change: scoreChange,
        },
        reliability: {
          direction: reliabilityChange > 0.05 ? 'improving' : reliabilityChange < -0.05 ? 'declining' : 'stable',
          change: reliabilityChange,
        },
        confidence: {
          direction: confidenceChange > 0.05 ? 'improving' : confidenceChange < -0.05 ? 'declining' : 'stable',
          change: confidenceChange,
        },
      },
      patterns: [...new Set(patterns)],
      anomalies: [...new Set(anomalies)],
      correlations: [...new Set(correlations)],
    };
  }

  /**
   * Export results in various formats
   */
  exportResults(format: 'json' | 'csv' | 'summary'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(this.resultHistory, null, 2);
      
      case 'csv':
        return this.exportToCSV();
      
      case 'summary':
        return this.exportSummary();
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  // Private helper methods

  private createAggregatedResult(source: AggregatedResult['source'], rawResults: any[]): AggregatedResult {
    const id = this.generateResultId();
    const timestamp = new Date();

    // Calculate basic metrics
    const successfulResults = rawResults.filter(r => this.isSuccess(r)).length;
    const success = successfulResults === rawResults.length;
    const duration = this.calculateAverageDuration(rawResults);
    const primaryScore = this.calculatePrimaryScore(rawResults);
    const complianceScore = this.calculateComplianceScore(rawResults);
    const qualityScore = this.calculateQualityScore(rawResults);
    const performanceScore = this.calculatePerformanceScore(rawResults);
    const securityScore = this.calculateSecurityScore(rawResults);
    const overallScore = this.calculateOverallScore({
      success,
      duration,
      primaryScore,
      complianceScore,
      qualityScore,
      performanceScore,
      securityScore,
    });
    const confidence = this.calculateConfidence(rawResults);
    const reliability = this.calculateReliability(rawResults);
    const category = this.determineCategory(source, rawResults);
    const subcategories = this.determineSubcategories(rawResults);
    const metadata = this.extractMetadata(rawResults);
    const { recommendations, warnings, errors } = this.extractInsights(rawResults);

    return {
      id,
      timestamp,
      source,
      success,
      duration,
      primaryScore,
      complianceScore,
      qualityScore,
      performanceScore,
      securityScore,
      overallScore,
      confidence,
      reliability,
      category,
      subcategories,
      metadata,
      analysis: this.createEmptyAnalysis(),
      recommendations,
      warnings,
      errors,
      rawResults,
    };
  }

  private async analyzeResult(result: AggregatedResult): Promise<void> {
    const cacheKey = `${result.id}-${result.timestamp.getTime()}`;
    
    if (this.analysisCache.has(cacheKey)) {
      result.analysis = this.analysisCache.get(cacheKey)!;
      return;
    }

    const analysis: ResultAnalysis = {
      completeness: this.calculateCompleteness(result),
      consistency: this.calculateConsistency(result),
      accuracy: this.calculateAccuracy(result),
      reliability: result.reliability,
      relevance: this.calculateRelevance(result),
      timeliness: this.calculateTimeliness(result),
      compliance: result.complianceScore,
      security: result.securityScore,
      performance: result.performanceScore,
      quality: result.qualityScore,
      trends: {
        positive: [],
        negative: [],
        neutral: [],
      },
      patterns: {
        successful: [],
        problematic: [],
        opportunities: [],
      },
      anomalies: [],
      correlations: {
        strong: [],
        moderate: [],
        weak: [],
      },
    };

    // Perform advanced analysis if enabled
    if (this.config.analysis.enableTrendAnalysis) {
      analysis.trends = this.analyzeTrends(result);
    }

    if (this.config.analysis.enablePatternRecognition) {
      analysis.patterns = this.analyzePatterns(result);
    }

    if (this.config.analysis.enableCorrelationAnalysis) {
      analysis.correlations = this.analyzeCorrelations(result);
    }

    if (this.config.analysis.enableAnomalyDetection) {
      analysis.anomalies = this.detectAnomalies(result);
    }

    result.analysis = analysis;
    this.analysisCache.set(cacheKey, analysis);
  }

  private async createCrossSourceAggregation(results: AggregatedResult[]): Promise<AggregatedResult> {
    const id = this.generateResultId();
    const timestamp = new Date();

    const successfulResults = results.filter(r => r.success).length;
    const success = successfulResults === results.length;
    const duration = results.reduce((sum, r) => sum + r.duration, 0);
    const primaryScore = results.reduce((sum, r) => sum + r.primaryScore, 0) / results.length;
    const complianceScore = results.reduce((sum, r) => sum + (r.complianceScore || 0), 0) / results.length;
    const qualityScore = results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length;
    const performanceScore = results.reduce((sum, r) => sum + r.performanceScore, 0) / results.length;
    const securityScore = results.reduce((sum, r) => sum + r.securityScore, 0) / results.length;
    const overallScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    const confidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const reliability = results.reduce((sum, r) => sum + r.reliability, 0) / results.length;

    const allCategories = [...new Set(results.flatMap(r => r.subcategories))];
    const allMetadata = results.reduce((acc, r) => ({ ...acc, ...r.metadata }), {});
    const allRecommendations = [...new Set(results.flatMap(r => r.recommendations))];
    const allWarnings = [...new Set(results.flatMap(r => r.warnings))];
    const allErrors = [...new Set(results.flatMap(r => r.errors))];

    const aggregated: AggregatedResult = {
      id,
      timestamp,
      source: 'orchestration',
      success,
      duration,
      primaryScore,
      complianceScore,
      qualityScore,
      performanceScore,
      securityScore,
      overallScore,
      confidence,
      reliability,
      category: 'cross-source',
      subcategories: allCategories,
      metadata: allMetadata,
      analysis: this.createEmptyAnalysis(),
      recommendations: allRecommendations,
      warnings: allWarnings,
      errors: allErrors,
      rawResults: results,
    };

    await this.analyzeResult(aggregated);
    return aggregated;
  }

  private createEmptyAnalysis(): ResultAnalysis {
    return {
      completeness: 0,
      consistency: 0,
      accuracy: 0,
      reliability: 0,
      relevance: 0,
      timeliness: 0,
      compliance: 0,
      security: 0,
      performance: 0,
      quality: 0,
      trends: {
        positive: [],
        negative: [],
        neutral: [],
      },
      patterns: {
        successful: [],
        problematic: [],
        opportunities: [],
      },
      anomalies: [],
      correlations: {
        strong: [],
        moderate: [],
        weak: [],
      },
    };
  }

  // Scoring calculation methods

  private isSuccess(result: any): boolean {
    return result.success !== false;
  }

  private calculateAverageDuration(results: any[]): number {
    const durations = results.map(r => r.duration || 0).filter(d => d > 0);
    return durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
  }

  private calculatePrimaryScore(results: any[]): number {
    const scores = results.map(r => r.qualityScore || r.overallQualityScore || 0).filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  }

  private calculateComplianceScore(results: any[]): number {
    const scores = results
      .map(r => r.complianceScore || r.complianceStatus?.overall ? 100 : 0)
      .filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  }

  private calculateQualityScore(results: any[]): number {
    const scores = results.map(r => r.qualityScore || r.overallQualityScore || 0).filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 0;
  }

  private calculatePerformanceScore(results: any[]): number {
    // Simple performance scoring based on duration and success rate
    const successRate = results.filter(r => this.isSuccess(r)).length / results.length;
    const avgDuration = this.calculateAverageDuration(results);
    const durationScore = Math.max(0, 100 - (avgDuration / 1000)); // Penalize long durations
    return (successRate * 60) + (durationScore * 0.4);
  }

  private calculateSecurityScore(results: any[]): number {
    const scores = results
      .map(r => r.securityScore || r.complianceScore || 0)
      .filter(s => s > 0);
    return scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 100;
  }

  private calculateOverallScore(scores: {
    success: boolean;
    duration: number;
    primaryScore: number;
    complianceScore: number;
    qualityScore: number;
    performanceScore: number;
    securityScore: number;
  }): number {
    const weights = this.config.scoring.weights;
    
    let total = 0;
    let totalWeight = 0;

    if (scores.success) {
      total += weights.success * 100;
      totalWeight += weights.success;
    }

    total += weights.duration * Math.max(0, 100 - (scores.duration / 1000));
    totalWeight += weights.duration;

    total += weights.quality * scores.qualityScore;
    totalWeight += weights.quality;

    total += weights.compliance * scores.complianceScore;
    totalWeight += weights.compliance;

    total += weights.performance * scores.performanceScore;
    totalWeight += weights.performance;

    total += weights.security * scores.securityScore;
    totalWeight += weights.security;

    total += weights.reliability * scores.reliability;
    totalWeight += weights.reliability;

    return totalWeight > 0 ? total / totalWeight : 0;
  }

  private calculateConfidence(results: any[]): number {
    // Confidence based on result consistency and completeness
    const successRate = results.filter(r => this.isSuccess(r)).length / results.length;
    const completeness = this.calculateDataCompleteness(results);
    return (successRate * 0.6) + (completeness * 0.4);
  }

  private calculateReliability(results: any[]): number {
    // Reliability based on success rate and error consistency
    const successRate = results.filter(r => this.isSuccess(r)).length / results.length;
    const errorRate = results.filter(r => r.error || r.errors?.length).length / results.length;
    return Math.max(0, (successRate * 0.8) + ((1 - errorRate) * 0.2));
  }

  // Analysis methods

  private calculateCompleteness(result: AggregatedResult): number {
    return this.calculateDataCompleteness(result.rawResults);
  }

  private calculateDataCompleteness(results: any[]): number {
    if (results.length === 0) return 0;

    const requiredFields = ['id', 'success', 'duration'];
    let completeCount = 0;

    for (const result of results) {
      const hasAllFields = requiredFields.every(field => result[field] !== undefined);
      if (hasAllFields) completeCount++;
    }

    return (completeCount / results.length) * 100;
  }

  private calculateConsistency(result: AggregatedResult): number {
    // Consistency based on score variance
    const scores = result.rawResults.map(r => r.qualityScore || r.overallQualityScore || 0);
    if (scores.length < 2) return 100;

    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower standard deviation = higher consistency
    return Math.max(0, 100 - (standardDeviation * 2));
  }

  private calculateAccuracy(result: AggregatedResult): number {
    // Accuracy based on success rate and confidence
    return (result.success ? 80 : 0) + (result.confidence * 0.2);
  }

  private calculateRelevance(result: AggregatedResult): number {
    // Relevance based on category matching and metadata quality
    const categoryRelevance = result.category === 'cross-source' ? 90 : 80;
    const metadataQuality = Object.keys(result.metadata).length > 0 ? 90 : 70;
    return (categoryRelevance + metadataQuality) / 2;
  }

  private calculateTimeliness(result: AggregatedResult): number {
    // Timeliness based on execution duration
    const optimalDuration = 5000; // 5 seconds
    const durationRatio = Math.min(result.duration / optimalDuration, 2);
    return Math.max(0, 100 - (durationRatio * 25));
  }

  private analyzeTrends(result: AggregatedResult): { positive: string[]; negative: string[]; neutral: string[] } {
    const trends = { positive: [], negative: [], neutral: [] as string[] };

    if (result.overallScore > 85) {
      trends.positive.push('High overall quality score');
    } else if (result.overallScore < 70) {
      trends.negative.push('Low overall quality score');
    }

    if (result.confidence > 0.8) {
      trends.positive.push('High confidence in results');
    } else if (result.confidence < 0.6) {
      trends.negative.push('Low confidence in results');
    }

    return trends;
  }

  private analyzePatterns(result: AggregatedResult): { successful: string[]; problematic: string[]; opportunities: string[] } {
    const patterns = { successful: [], problematic: [], opportunities: [] as string[] };

    if (result.success) {
      patterns.successful.push('Consistent successful execution');
    }

    if (result.errors.length > 0) {
      patterns.problematic.push('Error patterns detected');
    }

    if (result.overallScore > 80 && result.reliability > 0.8) {
      patterns.opportunities.push('Optimization potential identified');
    }

    return patterns;
  }

  private analyzeCorrelations(result: AggregatedResult): { strong: Correlation[]; moderate: Correlation[]; weak: Correlation[] } {
    return {
      strong: [],
      moderate: [],
      weak: [],
    };
  }

  private detectAnomalies(result: AggregatedResult): string[] {
    const anomalies: string[] = [];

    if (result.duration > 60000) { // Over 1 minute
      anomalies.push('Execution time significantly longer than expected');
    }

    if (result.confidence < 0.5) {
      anomalies.push('Unusually low confidence in results');
    }

    if (result.reliability < 0.6) {
      anomalies.push('Unusually low reliability score');
    }

    return anomalies;
  }

  // Utility methods

  private determineCategory(source: AggregatedResult['source'], results: any[]): string {
    switch (source) {
      case 'agent':
        return 'agent-execution';
      case 'tool':
        return 'tool-execution';
      case 'test':
        return 'testing';
      case 'quality-control':
        return 'quality-control';
      case 'orchestration':
        return 'orchestration';
      default:
        return 'unknown';
    }
  }

  private determineSubcategories(results: any[]): string[] {
    const subcategories = new Set<string>();
    
    for (const result of results) {
      if (result.category) {
        subcategories.add(result.category);
      }
      if (result.type) {
        subcategories.add(result.type);
      }
      if (result.action) {
        subcategories.add(result.action);
      }
    }

    return Array.from(subcategories);
  }

  private extractMetadata(results: any[]): Record<string, any> {
    const metadata: Record<string, any> = {};
    
    for (const result of results) {
      if (result.metadata) {
        Object.assign(metadata, result.metadata);
      }
    }

    return metadata;
  }

  private extractInsights(results: any[]): { recommendations: string[]; warnings: string[]; errors: string[] } {
    const recommendations = new Set<string>();
    const warnings = new Set<string>();
    const errors = new Set<string>();

    for (const result of results) {
      if (result.recommendations) {
        result.recommendations.forEach((r: string) => recommendations.add(r));
      }
      if (result.warnings) {
        result.warnings.forEach((w: string) => warnings.add(w));
      }
      if (result.errors) {
        result.errors.forEach((e: string) => errors.add(e));
      }
      if (result.error) {
        errors.add(result.error);
      }
    }

    return {
      recommendations: Array.from(recommendations),
      warnings: Array.from(warnings),
      errors: Array.from(errors),
    };
  }

  private generateRecommendations(results: AggregatedResult[]): string[] {
    const recommendations: string[] = [];

    const avgScore = results.reduce((sum, r) => sum + r.overallScore, 0) / results.length;
    const avgReliability = results.reduce((sum, r) => sum + r.reliability, 0) / results.length;

    if (avgScore < 80) {
      recommendations.push('Focus on improving overall quality scores');
    }

    if (avgReliability < 0.8) {
      recommendations.push('Improve result reliability through better error handling');
    }

    const errorRate = results.filter(r => !r.success).length / results.length;
    if (errorRate > 0.2) {
      recommendations.push('Address high error rate in execution');
    }

    return recommendations;
  }

  private generateWarnings(results: AggregatedResult[]): string[] {
    const warnings: string[] = [];

    const longExecutions = results.filter(r => r.duration > 30000);
    if (longExecutions.length > 0) {
      warnings.push(`${longExecutions.length} executions took longer than 30 seconds`);
    }

    const lowConfidence = results.filter(r => r.confidence < 0.7);
    if (lowConfidence.length > 0) {
      warnings.push(`${lowConfidence.length} results have low confidence scores`);
    }

    return warnings;
  }

  private generateActionItems(results: AggregatedResult[]): string[] {
    const actionItems: string[] = [];

    const failedResults = results.filter(r => !r.success);
    if (failedResults.length > 0) {
      actionItems.push(`Investigate and fix ${failedResults.length} failed executions`);
    }

    const lowQuality = results.filter(r => r.overallScore < 70);
    if (lowQuality.length > 0) {
      actionItems.push(`Review and improve ${lowQuality.length} low-quality results`);
    }

    return actionItems;
  }

  private exportToCSV(): string {
    const headers = [
      'id', 'timestamp', 'source', 'success', 'duration', 'overallScore',
      'confidence', 'reliability', 'category', 'errors_count', 'warnings_count'
    ];

    const rows = this.resultHistory.map(result => [
      result.id,
      result.timestamp.toISOString(),
      result.source,
      result.success,
      result.duration,
      result.overallScore,
      result.confidence,
      result.reliability,
      result.category,
      result.errors.length,
      result.warnings.length,
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  private exportSummary(): string {
    const summary = this.getSummary();
    
    return `
Result Aggregation Summary
=========================

Total Results: ${summary.totalResults}
Successful: ${summary.successfulResults}
Failed: ${summary.failedResults}
Average Duration: ${summary.averageDuration.toFixed(2)}ms
Overall Score: ${summary.overallScore.toFixed(1)}
Confidence: ${(summary.confidence * 100).toFixed(1)}%
Reliability: ${(summary.reliability * 100).toFixed(1)}%

Top Categories:
${summary.topCategories.map(c => `  - ${c.category}: ${c.count} results (${c.avgScore.toFixed(1)} avg)`).join('\n')}

Primary Issues:
${summary.primaryIssues.map(i => `  - ${i.issue}: ${i.frequency} occurrences (${i.severity})`).join('\n')}

Recommendations:
${summary.recommendations.map(r => `  - ${r}`).join('\n')}

Warnings:
${summary.warnings.map(w => `  - ${w}`).join('\n')}

Action Items:
${summary.actionItems.map(a => `  - ${a}`).join('\n')}
    `.trim();
  }

  private cleanupOldResults(): void {
    const cutoff = Date.now() - this.config.aggregation.timeWindow;
    this.resultHistory = this.resultHistory.filter(result => result.timestamp.getTime() > cutoff);
    
    // Also cleanup analysis cache
    const cacheKeys = Array.from(this.analysisCache.keys());
    for (const key of cacheKeys) {
      const timestamp = parseInt(key.split('-')[1]);
      if (timestamp < cutoff) {
        this.analysisCache.delete(key);
      }
    }

    // Limit total results
    if (this.resultHistory.length > this.config.aggregation.maxResults) {
      this.resultHistory = this.resultHistory.slice(-this.config.aggregation.maxResults);
    }
  }

  private generateResultId(): string {
    return `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}