/**
 * Execution Pattern Selector
 * Intelligently selects optimal execution patterns based on context and requirements
 */

import { createLogger, LogLevel } from '@neonpro/tools-shared/logger';
import type {
  WorkflowType,
  AgentCoordinationPattern,
  AgentCapability,
  OrchestrationContext,
  TDDPhase,
  FeatureContext,
  AgentName,
  AgentPriority
} from './types';

const logger = createLogger('ExecutionPatternSelector', LogLevel.INFO);

export interface ExecutionPatternSelection {
  workflowType: WorkflowType;
  coordinationPattern: AgentCoordinationPattern;
  executionStrategy: {
    parallel: boolean;
    batchSize: number;
    timeout: number;
    retries: number;
  };
  agentSelection: {
    primaryAgents: AgentName[];
    supportAgents: AgentName[];
    parallelAgents: AgentName[];
  };
  optimization: {
    performance: number;
    quality: number;
    compliance: number;
    efficiency: number;
  };
  justification: string[];
  risks: string[];
  mitigations: string[];
}

export interface PatternSelectionContext {
  feature: FeatureContext;
  complexity: 'low' | 'medium' | 'high';
  criticality: 'low' | 'medium' | 'high' | 'critical';
  healthcareCompliance: boolean;
  performanceRequired: boolean;
  securityRequired: boolean;
  teamSize: number;
  timeline: 'urgent' | 'normal' | 'relaxed';
  budget: 'limited' | 'normal' | 'generous';
}

export interface PatternEvaluation {
  pattern: WorkflowType;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export class ExecutionPatternSelector {
  private readonly patternRules: Map<WorkflowType, PatternRule>;
  private readonly coordinationRules: Map<AgentCoordinationPattern, CoordinationRule>;

  constructor() {
    this.patternRules = this.initializePatternRules();
    this.coordinationRules = this.initializeCoordinationRules();
  }

  /**
   * Select optimal execution pattern based on context
   */
  async selectOptimalPattern(context: PatternSelectionContext): Promise<ExecutionPatternSelection> {
    logger.constitutional(
      LogLevel.INFO,
      'Starting execution pattern selection',
      {
        compliance: true,
        requirement: 'Pattern Selection',
        standard: 'Orchestration',
      }
    );

    // Evaluate all available patterns
    const patternEvaluations = await this.evaluatePatterns(context);
    
    // Select best pattern
    const bestPattern = this.selectBestPattern(patternEvaluations, context);
    
    // Determine coordination strategy
    const coordinationPattern = this.selectCoordinationPattern(bestPattern, context);
    
    // Generate execution strategy
    const executionStrategy = this.generateExecutionStrategy(bestPattern, coordinationPattern, context);
    
    // Select agents
    const agentSelection = this.selectAgentsForPattern(bestPattern, context);
    
    // Calculate optimization scores
    const optimization = this.calculateOptimizationScores(bestPattern, context);
    
    // Generate justification and risk assessment
    const { justification, risks, mitigations } = this.generateJustificationAndRisks(bestPattern, context);

    logger.constitutional(
      LogLevel.INFO,
      'Execution pattern selection completed',
      {
        compliance: true,
        requirement: 'Pattern Selection Complete',
        standard: 'Orchestration',
        details: {
          selectedPattern: bestPattern.pattern,
          coordination: coordinationPattern,
          overallScore: bestPattern.score,
        },
      }
    );

    return {
      workflowType: bestPattern.pattern,
      coordinationPattern,
      executionStrategy,
      agentSelection,
      optimization,
      justification,
      risks,
      mitigations,
    };
  }

  /**
   * Initialize pattern selection rules
   */
  private initializePatternRules(): Map<WorkflowType, PatternRule> {
    const rules = new Map<WorkflowType, PatternRule>();

    rules.set('standard-tdd', {
      pattern: 'standard-tdd',
      description: 'Standard TDD workflow for general development',
      applicableConditions: {
        complexity: ['low', 'medium'],
        criticality: ['low', 'medium'],
        teamSize: [1, 2, 3, 4, 5],
        healthcareCompliance: [false],
      },
      weights: {
        quality: 0.8,
        speed: 0.6,
        compliance: 0.5,
        maintainability: 0.7,
      },
      defaultAgents: ['tdd-orchestrator', 'code-reviewer'],
      maxParallelism: 2,
    });

    rules.set('security-critical-tdd', {
      pattern: 'security-critical-tdd',
      description: 'TDD workflow with enhanced security focus',
      applicableConditions: {
        complexity: ['medium', 'high'],
        criticality: ['high', 'critical'],
        securityRequired: [true],
        healthcareCompliance: [true, false],
      },
      weights: {
        quality: 0.9,
        security: 0.95,
        compliance: 0.9,
        speed: 0.4,
      },
      defaultAgents: ['tdd-orchestrator', 'security-auditor', 'architect-review'],
      maxParallelism: 3,
    });

    rules.set('microservices-tdd', {
      pattern: 'microservices-tdd',
      description: 'TDD workflow optimized for microservices architecture',
      applicableConditions: {
        complexity: ['medium', 'high'],
        teamSize: [3, 4, 5, 6, 7, 8],
        performanceRequired: [true],
      },
      weights: {
        quality: 0.8,
        performance: 0.9,
        scalability: 0.85,
        speed: 0.7,
      },
      defaultAgents: ['tdd-orchestrator', 'architect-review', 'code-reviewer'],
      maxParallelism: 4,
    });

    rules.set('legacy-tdd', {
      pattern: 'legacy-tdd',
      description: 'TDD workflow for legacy system integration',
      applicableConditions: {
        complexity: ['high'],
        criticality: ['medium', 'high'],
        teamSize: [2, 3, 4, 5],
      },
      weights: {
        quality: 0.7,
        safety: 0.9,
        maintainability: 0.8,
        speed: 0.3,
      },
      defaultAgents: ['tdd-orchestrator', 'architect-review', 'code-reviewer'],
      maxParallelism: 2,
    });

    rules.set('healthcare-tdd', {
      pattern: 'healthcare-tdd',
      description: 'TDD workflow with healthcare compliance requirements',
      applicableConditions: {
        healthcareCompliance: [true],
        criticality: ['high', 'critical'],
        complexity: ['medium', 'high'],
      },
      weights: {
        quality: 0.9,
        compliance: 0.95,
        security: 0.9,
        patientSafety: 0.95,
        speed: 0.5,
      },
      defaultAgents: ['tdd-orchestrator', 'security-auditor', 'architect-review'],
      maxParallelism: 3,
    });

    return rules;
  }

  /**
   * Initialize coordination pattern rules
   */
  private initializeCoordinationRules(): Map<AgentCoordinationPattern, CoordinationRule> {
    const rules = new Map<AgentCoordinationPattern, CoordinationRule>();

    rules.set('sequential', {
      pattern: 'sequential',
      description: 'Execute agents in sequence',
      applicableConditions: {
        complexity: ['low'],
        teamSize: [1, 2],
        criticality: ['low'],
      },
      benefits: ['predictable', 'simple', 'low overhead'],
      drawbacks: ['slow', 'limited parallelism'],
    });

    rules.set('parallel', {
      pattern: 'parallel',
      description: 'Execute agents in parallel',
      applicableConditions: {
        complexity: ['low', 'medium'],
        teamSize: [3, 4, 5, 6, 7, 8],
        performanceRequired: [true],
      },
      benefits: ['fast', 'efficient resource usage'],
      drawbacks: ['complex coordination', 'potential conflicts'],
    });

    rules.set('hierarchical', {
      pattern: 'hierarchical',
      description: 'Execute agents in hierarchical order',
      applicableConditions: {
        complexity: ['medium', 'high'],
        criticality: ['high', 'critical'],
        teamSize: [4, 5, 6, 7, 8],
      },
      benefits: ['structured', 'clear responsibility', 'scalable'],
      drawbacks: ['bottlenecks', 'communication overhead'],
    });

    rules.set('event-driven', {
      pattern: 'event-driven',
      description: 'Execute agents based on events',
      applicableConditions: {
        complexity: ['medium', 'high'],
        teamSize: [3, 4, 5, 6, 7, 8],
        performanceRequired: [true],
      },
      benefits: ['responsive', 'efficient', 'scalable'],
      drawbacks: ['complex', 'hard to debug', 'unpredictable'],
    });

    return rules;
  }

  /**
   * Evaluate all patterns against context
   */
  private async evaluatePatterns(context: PatternSelectionContext): Promise<PatternEvaluation[]> {
    const evaluations: PatternEvaluation[] = [];

    for (const [patternType, rule] of this.patternRules) {
      const evaluation = await this.evaluatePattern(patternType, rule, context);
      evaluations.push(evaluation);
    }

    return evaluations.sort((a, b) => b.score - a.score);
  }

  /**
   * Evaluate individual pattern
   */
  private async evaluatePattern(
    patternType: WorkflowType,
    rule: PatternRule,
    context: PatternSelectionContext
  ): Promise<PatternEvaluation> {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Check applicability
    const applicable = this.isPatternApplicable(rule, context);
    if (!applicable) {
      return {
        pattern: patternType,
        score: 0,
        strengths: ['Not applicable for current context'],
        weaknesses: ['Does not meet context requirements'],
        recommendations: ['Consider alternative patterns'],
      };
    }

    // Calculate score based on weights and context
    score = this.calculatePatternScore(rule, context);

    // Generate analysis
    this.analyzePatternFit(rule, context, strengths, weaknesses, recommendations);

    return {
      pattern: patternType,
      score,
      strengths,
      weaknesses,
      recommendations,
    };
  }

  /**
   * Check if pattern is applicable to context
   */
  private isPatternApplicable(rule: PatternRule, context: PatternSelectionContext): boolean {
    const conditions = rule.适用条件;

    // Check complexity
    if (!conditions.complexity.includes(context.complexity)) {
      return false;
    }

    // Check criticality
    if (!conditions.criticality.includes(context.criticality)) {
      return false;
    }

    // Check team size
    if (!conditions.teamSize.includes(context.teamSize)) {
      return false;
    }

    // Check healthcare compliance
    if (conditions.healthcareCompliance !== undefined) {
      if (!conditions.healthcareCompliance.includes(context.healthcareCompliance)) {
        return false;
      }
    }

    // Check security requirement
    if (conditions.securityRequired !== undefined) {
      if (!conditions.securityRequired.includes(context.securityRequired)) {
        return false;
      }
    }

    // Check performance requirement
    if (conditions.performanceRequired !== undefined) {
      if (!conditions.performanceRequired.includes(context.performanceRequired)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate pattern score based on weights and context
   */
  private calculatePatternScore(rule: PatternRule, context: PatternSelectionContext): number {
    const weights = rule.weights;
    let score = 0;
    let totalWeight = 0;

    // Complexity factor
    const complexityFactor = {
      low: 1.0,
      medium: 0.8,
      high: 0.6,
    }[context.complexity];

    // Criticality factor
    const criticalityFactor = {
      low: 1.0,
      medium: 0.9,
      high: 0.8,
      critical: 0.7,
    }[context.criticality];

    // Timeline factor
    const timelineFactor = {
      urgent: 0.7,
      normal: 1.0,
      relaxed: 1.2,
    }[context.timeline];

    // Apply weighted scoring
    for (const [key, weight] of Object.entries(weights)) {
      totalWeight += weight;
      
      let factor = 1.0;
      switch (key) {
        case 'quality':
          factor = context.criticality === 'critical' ? 1.2 : 1.0;
          break;
        case 'speed':
          factor = timelineFactor;
          break;
        case 'compliance':
          factor = context.healthcareCompliance ? 1.3 : 1.0;
          break;
        case 'security':
          factor = context.securityRequired ? 1.3 : 1.0;
          break;
        case 'performance':
          factor = context.performanceRequired ? 1.2 : 1.0;
          break;
      }
      
      score += weight * factor;
    }

    // Apply context factors
    score *= complexityFactor * criticalityFactor;

    // Normalize score
    return Math.min(100, (score / totalWeight) * 100);
  }

  /**
   * Analyze pattern fit and generate insights
   */
  private analyzePatternFit(
    rule: PatternRule,
    context: PatternSelectionContext,
    strengths: string[],
    weaknesses: string[],
    recommendations: string[]
  ): void {
    // Complexity analysis
    if (context.complexity === 'high' && rule.maxParallelism >= 3) {
      strengths.push('Handles high complexity well with parallel execution');
    } else if (context.complexity === 'high' && rule.maxParallelism < 3) {
      weaknesses.push('May struggle with high complexity due to limited parallelism');
      recommendations.push('Consider additional agents or phases');
    }

    // Team size analysis
    if (context.teamSize > rule.maxParallelism) {
      strengths.push('Supports team collaboration effectively');
    } else if (context.teamSize < rule.maxParallelism) {
      weaknesses.push('Over-provisioned for current team size');
      recommendations.push('Consider reducing agent count for efficiency');
    }

    // Timeline analysis
    if (context.timeline === 'urgent' && rule.weights.speed >= 0.7) {
      strengths.push('Optimized for rapid development cycles');
    } else if (context.timeline === 'urgent' && rule.weights.speed < 0.7) {
      weaknesses.push('May not meet urgent timeline requirements');
      recommendations.push('Consider prioritizing speed-focused patterns');
    }

    // Healthcare compliance analysis
    if (context.healthcareCompliance && rule.weights.compliance >= 0.9) {
      strengths.push('Excellent healthcare compliance support');
    } else if (context.healthcareCompliance && rule.weights.compliance < 0.9) {
      weaknesses.push('Limited healthcare compliance features');
      recommendations.push('Add compliance validation agents');
    }
  }

  /**
   * Select best pattern from evaluations
   */
  private selectBestPattern(evaluations: PatternEvaluation[], context: PatternSelectionContext): PatternEvaluation {
    // Filter applicable patterns
    const applicablePatterns = evaluations.filter(e => e.score > 0);

    if (applicablePatterns.length === 0) {
      // If no patterns are applicable, use standard-tdd as fallback
      return evaluations.find(e => e.pattern === 'standard-tdd') || evaluations[0];
    }

    // Select pattern with highest score
    let bestPattern = applicablePatterns[0];

    // Apply additional heuristics for tie-breaking
    if (applicablePatterns.length > 1) {
      const topPatterns = applicablePatterns.filter(e => e.score >= bestPattern.score - 10);

      if (topPatterns.length > 1) {
        // Prefer patterns that match timeline requirements
        if (context.timeline === 'urgent') {
          bestPattern = topPatterns.reduce((best, current) => {
            const bestSpeed = this.patternRules.get(best.pattern)?.weights.speed || 0.5;
            const currentSpeed = this.patternRules.get(current.pattern)?.weights.speed || 0.5;
            return currentSpeed > bestSpeed ? current : best;
          });
        }

        // Prefer healthcare-compliant patterns for healthcare contexts
        if (context.healthcareCompliance) {
          bestPattern = topPatterns.reduce((best, current) => {
            const bestCompliance = this.patternRules.get(best.pattern)?.weights.compliance || 0.5;
            const currentCompliance = this.patternRules.get(current.pattern)?.weights.compliance || 0.5;
            return currentCompliance > bestCompliance ? current : best;
          });
        }
      }
    }

    return bestPattern;
  }

  /**
   * Select coordination pattern
   */
  private selectCoordinationPattern(
    patternEval: PatternEvaluation,
    context: PatternSelectionContext
  ): AgentCoordinationPattern {
    const coordinationPatterns = Array.from(this.coordinationRules.keys());
    
    // Simple heuristic-based selection
    if (context.teamSize <= 2) {
      return 'sequential';
    }

    if (context.performanceRequired && context.teamSize >= 3) {
      return 'parallel';
    }

    if (context.complexity === 'high' && context.teamSize >= 4) {
      return 'hierarchical';
    }

    if (context.complexity === 'medium' && context.performanceRequired) {
      return 'event-driven';
    }

    return 'sequential'; // Default fallback
  }

  /**
   * Generate execution strategy
   */
  private generateExecutionStrategy(
    patternEval: PatternEvaluation,
    coordinationPattern: AgentCoordinationPattern,
    context: PatternSelectionContext
  ) {
    const rule = this.patternRules.get(patternEval.pattern)!;
    
    return {
      parallel: coordinationPattern !== 'sequential',
      batchSize: Math.min(context.teamSize, rule.maxParallelism),
      timeout: context.timeline === 'urgent' ? 300000 : 600000, // 5min urgent, 10min normal
      retries: context.criticality === 'critical' ? 3 : 2,
    };
  }

  /**
   * Select agents for pattern
   */
  private selectAgentsForPattern(
    patternEval: PatternEvaluation,
    context: PatternSelectionContext
  ) {
    const rule = this.patternRules.get(patternEval.pattern)!;
    
    return {
      primaryAgents: rule.defaultAgents.slice(0, 2),
      supportAgents: rule.defaultAgents.slice(2),
      parallelAgents: rule.defaultAgents.slice(0, rule.maxParallelism),
    };
  }

  /**
   * Calculate optimization scores
   */
  private calculateOptimizationScores(
    patternEval: PatternEvaluation,
    context: PatternSelectionContext
  ) {
    const rule = this.patternRules.get(patternEval.pattern)!;
    
    return {
      performance: this.calculateScore(rule.weights, context, ['performance', 'speed']),
      quality: this.calculateScore(rule.weights, context, ['quality', 'maintainability']),
      compliance: this.calculateScore(rule.weights, context, ['compliance', 'security']),
      efficiency: patternEval.score / 100,
    };
  }

  /**
   * Calculate weighted score for specific categories
   */
  private calculateScore(weights: Record<string, number>, context: PatternSelectionContext, categories: string[]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    for (const category of categories) {
      const weight = weights[category] || 0;
      if (weight > 0) {
        totalWeight += weight;
        weightedScore += weight;
      }
    }

    return totalWeight > 0 ? weightedScore / totalWeight : 0;
  }

  /**
   * Generate justification and risk assessment
   */
  private generateJustificationAndRisks(
    patternEval: PatternEvaluation,
    context: PatternSelectionContext
  ) {
    const justification = [
      `Selected ${patternEval.pattern} with score of ${patternEval.score.toFixed(1)}`,
      `Best fit for ${context.complexity} complexity and ${context.criticality} criticality`,
      ...patternEval.strengths,
    ];

    const risks = [
      ...patternEval.weaknesses,
      context.timeline === 'urgent' ? 'Urgent timeline may impact quality' : '',
    ].filter(Boolean);

    const mitigations = [
      ...patternEval.recommendations,
      context.healthcareCompliance ? 'Implement healthcare compliance validation' : '',
      context.securityRequired ? 'Add security-focused agents' : '',
    ].filter(Boolean);

    return { justification, risks, mitigations };
  }

  /**
   * Get available patterns
   */
  getAvailablePatterns(): WorkflowType[] {
    return Array.from(this.patternRules.keys());
  }

  /**
   * Get pattern details
   */
  getPatternDetails(pattern: WorkflowType): PatternRule | undefined {
    return this.patternRules.get(pattern);
  }

  /**
   * Get coordination patterns
   */
  getCoordinationPatterns(): AgentCoordinationPattern[] {
    return Array.from(this.coordinationRules.keys());
  }

  /**
   * Get coordination pattern details
   */
  getCoordinationPatternDetails(pattern: AgentCoordinationPattern): CoordinationRule | undefined {
    return this.coordinationRules.get(pattern);
  }
}

interface PatternRule {
  pattern: WorkflowType;
  description: string;
  适用条件: {
    complexity: ('low' | 'medium' | 'high')[];
    criticality: ('low' | 'medium' | 'high' | 'critical')[];
    teamSize: number[];
    healthcareCompliance?: boolean[];
    securityRequired?: boolean[];
    performanceRequired?: boolean[];
  };
  weights: Record<string, number>;
  defaultAgents: AgentName[];
  maxParallelism: number;
}

interface CoordinationRule {
  pattern: AgentCoordinationPattern;
  description: string;
  适用条件: {
    complexity: ('low' | 'medium' | 'high')[];
    teamSize: number[];
    criticality: ('low' | 'medium' | 'high' | 'critical')[];
    performanceRequired?: boolean[];
  };
  benefits: string[];
  drawbacks: string[];
}