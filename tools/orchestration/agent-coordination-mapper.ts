/**
 * Agent Coordination Mapper
 * Intelligent agent selection and coordination mapping for quality control actions
 */

import {
  AgentName,
  AgentCoordinationPattern,
  QualityControlContext,
  OrchestrationContext,
} from './types';
import { createLogger, LogLevel } from './utils/logger';

const logger = createLogger('AgentCoordinationMapper', LogLevel.INFO);

export interface AgentMappingRule {
  action: string;
  type?: string;
  primaryAgents: AgentName[];
  secondaryAgents?: AgentName[];
  pattern: AgentCoordinationPattern;
  healthcareRequired?: boolean;
  complexity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface AgentSelectionResult {
  selectedAgents: AgentName[];
  pattern: AgentCoordinationPattern;
  primaryAgents: AgentName[];
  secondaryAgents: AgentName[];
  complexity: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  reasoning: string;
}

export class AgentCoordinationMapper {
  private mappingRules: AgentMappingRule[] = [];

  constructor() {
    this.initializeMappingRules();
  }

  /**
   * Initialize default agent mapping rules
   */
  private initializeMappingRules(): void {
    this.mappingRules = [
      // Testing Actions
      {
        action: 'test',
        type: 'unit',
        primaryAgents: ['test'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'medium',
        description: 'Unit testing with code quality validation',
      },
      {
        action: 'test',
        type: 'integration',
        primaryAgents: ['test', 'architect-review'],
        secondaryAgents: ['security-auditor'],
        pattern: 'parallel',
        complexity: 'high',
        description: 'Integration testing with architecture and security validation',
      },
      {
        action: 'test',
        type: 'e2e',
        primaryAgents: ['test'],
        secondaryAgents: ['code-reviewer', 'security-auditor'],
        pattern: 'sequential',
        complexity: 'high',
        description: 'End-to-end testing with comprehensive validation',
      },
      {
        action: 'test',
        type: 'performance',
        primaryAgents: ['test', 'architect-review'],
        pattern: 'parallel',
        complexity: 'high',
        description: 'Performance testing with architectural insights',
      },

      // Analysis Actions
      {
        action: 'analyze',
        type: 'code',
        primaryAgents: ['code-reviewer'],
        secondaryAgents: ['architect-review'],
        pattern: 'sequential',
        complexity: 'medium',
        description: 'Code analysis with architectural review',
      },
      {
        action: 'analyze',
        type: 'security',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'high',
        healthcareRequired: true,
        description: 'Security analysis with healthcare compliance focus',
      },
      {
        action: 'analyze',
        type: 'architecture',
        primaryAgents: ['architect-review'],
        secondaryAgents: ['code-reviewer', 'security-auditor'],
        pattern: 'hierarchical',
        complexity: 'high',
        description: 'Architecture analysis with multi-dimensional review',
      },
      {
        action: 'analyze',
        type: 'comprehensive',
        primaryAgents: ['architect-review', 'code-reviewer', 'security-auditor'],
        secondaryAgents: ['test'],
        pattern: 'parallel',
        complexity: 'critical',
        description: 'Comprehensive multi-agent analysis',
      },

      // Debugging Actions
      {
        action: 'debug',
        type: 'performance',
        primaryAgents: ['architect-review'],
        secondaryAgents: ['test', 'code-reviewer'],
        pattern: 'sequential',
        complexity: 'high',
        description: 'Performance debugging with systematic analysis',
      },
      {
        action: 'debug',
        type: 'security',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'Security debugging with healthcare compliance',
      },
      {
        action: 'debug',
        type: 'integration',
        primaryAgents: ['architect-review', 'test'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'parallel',
        complexity: 'high',
        description: 'Integration debugging with architecture and testing insights',
      },

      // Compliance Actions
      {
        action: 'compliance',
        type: 'lgpd',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'LGPD compliance validation with security focus',
      },
      {
        action: 'compliance',
        type: 'anvisa',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['architect-review', 'test'],
        pattern: 'sequential',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'ANVISA compliance validation with comprehensive review',
      },
      {
        action: 'compliance',
        type: 'cfm',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'CFM compliance validation',
      },
      {
        action: 'validate',
        type: 'compliance',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['architect-review', 'code-reviewer', 'test'],
        pattern: 'hierarchical',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'Complete compliance validation with multi-agent review',
      },

      // Performance Actions
      {
        action: 'performance',
        type: 'load',
        primaryAgents: ['test'],
        secondaryAgents: ['architect-review'],
        pattern: 'parallel',
        complexity: 'high',
        description: 'Load testing with architectural performance review',
      },
      {
        action: 'performance',
        type: 'benchmark',
        primaryAgents: ['test', 'architect-review'],
        pattern: 'parallel',
        complexity: 'medium',
        description: 'Performance benchmarking with architectural insights',
      },
      {
        action: 'performance',
        type: 'optimization',
        primaryAgents: ['architect-review', 'code-reviewer'],
        secondaryAgents: ['test'],
        pattern: 'sequential',
        complexity: 'high',
        description: 'Performance optimization with systematic approach',
      },

      // Security Actions
      {
        action: 'security',
        type: 'scan',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'high',
        healthcareRequired: true,
        description: 'Security scanning with code review validation',
      },
      {
        action: 'security',
        type: 'audit',
        primaryAgents: ['security-auditor'],
        secondaryAgents: ['architect-review', 'code-reviewer', 'test'],
        pattern: 'hierarchical',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'Complete security audit with multi-agent validation',
      },
      {
        action: 'security',
        type: 'penetration',
        primaryAgents: ['security-auditor', 'test'],
        secondaryAgents: ['architect-review'],
        pattern: 'parallel',
        complexity: 'critical',
        description: 'Penetration testing with architectural review',
      },

      // Cleanup Actions
      {
        action: 'cleanup',
        type: 'code',
        primaryAgents: ['code-reviewer'],
        secondaryAgents: ['architect-review'],
        pattern: 'sequential',
        complexity: 'medium',
        description: 'Code cleanup with architectural validation',
      },
      {
        action: 'cleanup',
        type: 'dependencies',
        primaryAgents: ['security-auditor', 'architect-review'],
        pattern: 'parallel',
        complexity: 'medium',
        description: 'Dependency cleanup with security and architecture review',
      },
      {
        action: 'cleanup',
        type: 'performance',
        primaryAgents: ['architect-review', 'code-reviewer'],
        secondaryAgents: ['test'],
        pattern: 'sequential',
        complexity: 'high',
        description: 'Performance cleanup with systematic optimization',
      },

      // Format Actions
      {
        action: 'format',
        type: 'code',
        primaryAgents: ['code-reviewer'],
        pattern: 'sequential',
        complexity: 'low',
        description: 'Code formatting with quality standards',
      },
      {
        action: 'format',
        type: 'healthcare',
        primaryAgents: ['code-reviewer'],
        secondaryAgents: ['security-auditor'],
        pattern: 'sequential',
        complexity: 'medium',
        healthcareRequired: true,
        description: 'Healthcare-compliant code formatting',
      },

      // Auto/Comprehensive Actions
      {
        action: 'auto',
        primaryAgents: ['architect-review', 'code-reviewer', 'security-auditor', 'test'],
        pattern: 'hierarchical',
        complexity: 'critical',
        description: 'Comprehensive automated quality control',
      },
      {
        action: 'comprehensive',
        primaryAgents: ['architect-review', 'code-reviewer', 'security-auditor', 'test'],
        pattern: 'parallel',
        complexity: 'critical',
        healthcareRequired: true,
        description: 'Complete quality control with all agents',
      },
    ];

    logger.info(`Initialized ${this.mappingRules.length} agent mapping rules`);
  }

  /**
   * Select optimal agents based on quality control context
   */
  selectAgents(context: QualityControlContext): AgentSelectionResult {
    logger.info(`Selecting agents for action: ${context.action}, type: ${context.type || 'default'}`);

    // Find matching rules
    const matchingRules = this.findMatchingRules(context);

    if (matchingRules.length === 0) {
      logger.warn(`No matching rules found for action: ${context.action}, using default`);
      return this.getDefaultSelection(context);
    }

    // Select best rule based on context
    const selectedRule = this.selectBestRule(matchingRules, context);

    // Build result
    const result = this.buildSelectionResult(selectedRule, context);

    logger.info(`Selected agents: ${result.selectedAgents.join(', ')} with ${result.pattern} pattern`);

    return result;
  }

  /**
   * Find matching rules for the given context
   */
  private findMatchingRules(context: QualityControlContext): AgentMappingRule[] {
    return this.mappingRules.filter(rule => {
      // Match action
      if (rule.action !== context.action) return false;

      // Match type if specified
      if (rule.type && context.type && rule.type !== context.type) return false;

      // Match healthcare requirement if needed
      if (context.healthcare && rule.healthcareRequired === false) return false;

      return true;
    });
  }

  /**
   * Select the best rule from matching rules
   */
  private selectBestRule(rules: AgentMappingRule[], context: QualityControlContext): AgentMappingRule {
    // Prefer rules with exact type match
    const exactTypeMatch = rules.find(rule => rule.type === context.type);
    if (exactTypeMatch) return exactTypeMatch;

    // Prefer healthcare-specific rules if healthcare context
    if (context.healthcare) {
      const healthcareRule = rules.find(rule => rule.healthcareRequired);
      if (healthcareRule) return healthcareRule;
    }

    // Prefer higher complexity rules for comprehensive analysis
    if (context.depth && ['L8', 'L9', 'L10'].includes(context.depth)) {
      const complexRule = rules.find(rule => rule.complexity === 'critical');
      if (complexRule) return complexRule;
    }

    // Return first matching rule as default
    return rules[0];
  }

  /**
   * Build selection result from rule and context
   */
  private buildSelectionResult(rule: AgentMappingRule, context: QualityControlContext): AgentSelectionResult {
    let selectedAgents = [...rule.primaryAgents];
    let pattern = rule.pattern;

    // Add secondary agents if not parallel or if explicitly requested
    if (rule.secondaryAgents && (pattern !== 'parallel' || context.parallel === false)) {
      selectedAgents.push(...rule.secondaryAgents);
    }

    // Override pattern if specified in context
    if (context.coordination) {
      pattern = context.coordination;
    }

    // Override agents if specified in context
    if (context.agents && context.agents.length > 0) {
      selectedAgents = context.agents;
    }

    // Ensure unique agents
    selectedAgents = [...new Set(selectedAgents)];

    // Estimate duration based on complexity and agents
    const baseDuration = this.getBaseDuration(rule.complexity);
    const agentMultiplier = pattern === 'parallel' ? 1.2 : selectedAgents.length * 0.8;
    const estimatedDuration = Math.round(baseDuration * agentMultiplier);

    return {
      selectedAgents,
      pattern,
      primaryAgents: rule.primaryAgents,
      secondaryAgents: rule.secondaryAgents || [],
      complexity: rule.complexity,
      estimatedDuration,
      reasoning: `Selected based on ${rule.description}. Pattern: ${pattern}, Agents: ${selectedAgents.length}`,
    };
  }

  /**
   * Get default selection when no rules match
   */
  private getDefaultSelection(context: QualityControlContext): AgentSelectionResult {
    const defaultAgents: AgentName[] = ['code-reviewer'];

    // Add security auditor for healthcare contexts
    if (context.healthcare) {
      defaultAgents.push('security-auditor');
    }

    // Add architect review for complex actions
    if (context.depth && ['L7', 'L8', 'L9', 'L10'].includes(context.depth)) {
      defaultAgents.push('architect-review');
    }

    return {
      selectedAgents: defaultAgents,
      pattern: 'sequential',
      primaryAgents: defaultAgents,
      secondaryAgents: [],
      complexity: 'medium',
      estimatedDuration: 3000,
      reasoning: 'Default selection when no specific rules match',
    };
  }

  /**
   * Get base duration for complexity level
   */
  private getBaseDuration(complexity: 'low' | 'medium' | 'high' | 'critical'): number {
    const durations = {
      low: 1000,
      medium: 2000,
      high: 4000,
      critical: 6000,
    };
    return durations[complexity];
  }

  /**
   * Add custom mapping rule
   */
  addMappingRule(rule: AgentMappingRule): void {
    this.mappingRules.push(rule);
    logger.info(`Added custom mapping rule for action: ${rule.action}`);
  }

  /**
   * Get all available mapping rules
   */
  getMappingRules(): AgentMappingRule[] {
    return [...this.mappingRules];
  }

  /**
   * Get agent capabilities summary
   */
  getAgentCapabilities(): Record<AgentName, string[]> {
    const capabilities: Record<AgentName, string[]> = {
      'architect-review': [
        'architecture-analysis',
        'system-design-review',
        'performance-optimization',
        'scalability-assessment',
        'integration-validation',
      ],
      'code-reviewer': [
        'code-quality-analysis',
        'maintainability-assessment',
        'code-formatting',
        'best-practices-validation',
        'technical-debt-analysis',
      ],
      'security-auditor': [
        'security-vulnerability-scanning',
        'compliance-validation',
        'healthcare-compliance',
        'penetration-testing',
        'threat-assessment',
      ],
      'test': [
        'unit-testing',
        'integration-testing',
        'e2e-testing',
        'performance-testing',
        'test-coverage-analysis',
      ],
      'tdd-orchestrator': [
        'workflow-coordination',
        'agent-orchestration',
        'quality-gate-enforcement',
        'metrics-collection',
        'result-aggregation',
      ],
    };

    return capabilities;
  }
}