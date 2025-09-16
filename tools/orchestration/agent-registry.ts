/**
 * Agent Registry - Manages agent capabilities, selection, and lifecycle
 * Coordinates code review agents with TDD orchestration
 */

import {
  AgentCapability,
  AgentRegistry,
  TDDPhase,
  OrchestrationContext,
  AgentType,
  AgentPriority,
  AgentSpecialization,
} from './types';

export class TDDAgentRegistry implements AgentRegistry {
  private agents: Map<AgentType, AgentCapability> = new Map();
  private phaseAgentMapping: Map<TDDPhase, AgentType[]> = new Map();
  private capabilityAgentMapping: Map<string, AgentType[]> = new Map();

  constructor() {
    this.registerAgents();
    this.setupPhaseMapping();
    this.setupCapabilityMapping();
  }

  /**
   * Register all available code review agents
   */
  private registerAgents(): void {
    // TDD Orchestrator Agent
    this.agents.set('tdd-orchestrator', {
      type: 'tdd-orchestrator',
      name: 'TDD Orchestrator',
      description: 'Primary coordinator for red-green-refactor cycles with multi-agent coordination',
      capabilities: [
        'cycle-coordination',
        'agent-orchestration',
        'workflow-management',
        'quality-gate-enforcement',
        'metrics-collection',
      ],
      specializations: [
        'tdd-coordination',
        'agent-delegation',
        'workflow-execution',
        'compliance-validation',
      ],
      priority: 'primary',
      phases: ['red', 'green', 'refactor'],
      triggers: [
        'tdd-cycle',
        'test-driven-development',
        'multi-agent-coordination',
        'orchestration',
      ],
      configuration: {
        maxConcurrentAgents: 4,
        defaultCoordinationPattern: 'sequential',
        qualityGateThreshold: 9.5,
        complianceValidation: true,
      },
      healthcareCompliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
        auditTrail: true,
      },
    });

    // Architect Review Agent
    this.agents.set('architect-review', {
      type: 'architect-review',
      name: 'Architecture Review Agent',
      description: 'System architecture validation, pattern compliance, and scalability assessment',
      capabilities: [
        'architecture-validation',
        'pattern-compliance',
        'scalability-assessment',
        'system-design-review',
        'integration-analysis',
      ],
      specializations: [
        'microservices-architecture',
        'healthcare-systems',
        'supabase-integration',
        'security-architecture',
        'performance-architecture',
      ],
      priority: 'primary',
      phases: ['red', 'refactor'],
      triggers: [
        'architecture',
        'system-design',
        'scalability',
        'integration',
        'microservices',
        'complex-system',
      ],
      configuration: {
        architecturalPatterns: ['hexagonal', 'clean-architecture', 'microservices'],
        performanceThresholds: {
          responseTime: 100, // ms for healthcare
          throughput: 1000, // requests per second
          availability: 99.9, // percentage
        },
        scalabilityFactors: ['horizontal', 'vertical', 'database'],
      },
      healthcareCompliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
        auditTrail: true,
      },
    });

    // Code Reviewer Agent  
    this.agents.set('code-reviewer', {
      type: 'code-reviewer',
      name: 'Code Review Agent',
      description: 'Quality analysis, maintainability assessment, and best practices enforcement',
      capabilities: [
        'code-quality-analysis',
        'maintainability-assessment',
        'best-practices-enforcement',
        'refactoring-suggestions',
        'technical-debt-identification',
      ],
      specializations: [
        'typescript-review',
        'react-patterns',
        'healthcare-code-patterns',
        'performance-optimization',
        'accessibility-compliance',
      ],
      priority: 'secondary',
      phases: ['green', 'refactor'],
      triggers: [
        'code-review',
        'quality-analysis',
        'maintainability',
        'best-practices',
        'refactoring',
        'technical-debt',
      ],
      configuration: {
        qualityThresholds: {
          cyclomaticComplexity: 10,
          maintainabilityIndex: 70,
          codeSmellsAllowed: 0,
          duplicationPercentage: 5,
        },
        reviewPatterns: ['SOLID', 'DRY', 'KISS', 'YAGNI'],
        accessibilityLevel: 'WCAG 2.1 AA+',
      },
      healthcareCompliance: {
        lgpd: true,
        anvisa: false,
        cfm: false,
        auditTrail: true,
      },
    });

    // Security Auditor Agent
    this.agents.set('security-auditor', {
      type: 'security-auditor',
      name: 'Security Auditor Agent',
      description: 'Healthcare security compliance, vulnerability assessment, and data protection validation',
      capabilities: [
        'security-vulnerability-scanning',
        'healthcare-compliance-validation',
        'data-protection-assessment',
        'authentication-review',
        'authorization-validation',
      ],
      specializations: [
        'healthcare-security',
        'lgpd-compliance',
        'patient-data-protection',
        'supabase-rls',
        'authentication-patterns',
      ],
      priority: 'primary',
      phases: ['red', 'green', 'refactor'],
      triggers: [
        'security',
        'compliance',
        'vulnerability',
        'healthcare-security',
        'patient-data',
        'lgpd',
        'anvisa',
        'cfm',
        'authentication',
        'authorization',
      ],
      configuration: {
        securityStandards: ['OWASP', 'LGPD', 'ANVISA', 'CFM', 'HIPAA'],
        vulnerabilityScanDepth: 'comprehensive',
        complianceFrameworks: ['healthcare-br', 'international'],
        dataClassification: ['pii', 'phi', 'sensitive'],
      },
      healthcareCompliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
        auditTrail: true,
      },
    });

    // Test Agent
    this.agents.set('test', {
      type: 'test',
      name: 'Test Coordination Agent', 
      description: 'Testing pattern enforcement, coverage validation, and healthcare test scenarios',
      capabilities: [
        'test-pattern-enforcement',
        'coverage-validation',
        'healthcare-test-scenarios',
        'integration-testing',
        'performance-testing',
      ],
      specializations: [
        'vitest-patterns',
        'playwright-e2e',
        'healthcare-workflows',
        'supabase-testing',
        'compliance-testing',
      ],
      priority: 'primary',
      phases: ['red', 'green'],
      triggers: [
        'testing',
        'test-patterns',
        'coverage',
        'healthcare-testing',
        'integration-testing',
        'e2e-testing',
        'performance-testing',
      ],
      configuration: {
        testingFrameworks: ['vitest', 'playwright', 'testing-library'],
        coverageThresholds: {
          critical: 95,
          high: 85,
          medium: 75,
          low: 70,
        },
        testCategories: ['unit', 'integration', 'e2e', 'performance', 'compliance'],
      },
      healthcareCompliance: {
        lgpd: true,
        anvisa: true,
        cfm: true,
        auditTrail: true,
      },
    });
  }

  /**
   * Setup phase to agent mapping for TDD cycle coordination
   */
  private setupPhaseMapping(): void {
    this.phaseAgentMapping.set('red', [
      'test', // Primary - defines test structure and patterns
      'architect-review', // Secondary - validates architectural test approach
      'security-auditor', // Secondary - ensures security test coverage
    ]);

    this.phaseAgentMapping.set('green', [
      'code-reviewer', // Primary - ensures minimal quality implementation
      'security-auditor', // Secondary - validates security implementation
      'test', // Secondary - verifies test passing and implementation
    ]);

    this.phaseAgentMapping.set('refactor', [
      'architect-review', // Primary - validates architecture improvements
      'code-reviewer', // Primary - ensures code quality improvements
      'security-auditor', // Secondary - maintains security during refactor
      'test', // Secondary - ensures tests remain valid
    ]);
  }

  /**
   * Setup capability to agent mapping for specialized tasks
   */
  private setupCapabilityMapping(): void {
    // Architecture capabilities
    this.capabilityAgentMapping.set('architecture-validation', ['architect-review']);
    this.capabilityAgentMapping.set('system-design-review', ['architect-review']);
    this.capabilityAgentMapping.set('scalability-assessment', ['architect-review']);

    // Code quality capabilities  
    this.capabilityAgentMapping.set('code-quality-analysis', ['code-reviewer']);
    this.capabilityAgentMapping.set('maintainability-assessment', ['code-reviewer']);
    this.capabilityAgentMapping.set('refactoring-suggestions', ['code-reviewer']);

    // Security capabilities
    this.capabilityAgentMapping.set('security-vulnerability-scanning', ['security-auditor']);
    this.capabilityAgentMapping.set('healthcare-compliance-validation', ['security-auditor']);
    this.capabilityAgentMapping.set('data-protection-assessment', ['security-auditor']);

    // Testing capabilities
    this.capabilityAgentMapping.set('test-pattern-enforcement', ['test']);
    this.capabilityAgentMapping.set('coverage-validation', ['test']);
    this.capabilityAgentMapping.set('healthcare-test-scenarios', ['test']);

    // Compliance capabilities
    this.capabilityAgentMapping.set('compliance-validation', [
      'security-auditor',
      'architect-review',
      'test',
    ]);

    // Orchestration capabilities
    this.capabilityAgentMapping.set('cycle-coordination', ['tdd-orchestrator']);
    this.capabilityAgentMapping.set('agent-orchestration', ['tdd-orchestrator']);
    this.capabilityAgentMapping.set('workflow-management', ['tdd-orchestrator']);
  }

  /**
   * Get agents for specific TDD phase
   */
  getAgentsForPhase(
    phase: TDDPhase,
    context: OrchestrationContext
  ): AgentCapability[] {
    const agentTypes = this.phaseAgentMapping.get(phase) || [];
    const agents = agentTypes
      .map(type => this.agents.get(type))
      .filter((agent): agent is AgentCapability => agent !== undefined);

    // Filter agents based on context
    return this.filterAgentsByContext(agents, context);
  }

  /**
   * Get agents for specific capability
   */
  getAgentsForCapability(capability: string): AgentCapability[] {
    const agentTypes = this.capabilityAgentMapping.get(capability) || [];
    return agentTypes
      .map(type => this.agents.get(type))
      .filter((agent): agent is AgentCapability => agent !== undefined);
  }

  /**
   * Get agent by type
   */
  getAgent(agentType: AgentType): AgentCapability | undefined {
    return this.agents.get(agentType);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentCapability[] {
    return Array.from(this.agents.values());
  }

  /**
   * Select optimal agents based on context and triggers
   */
  selectOptimalAgents(
    context: OrchestrationContext,
    phase?: TDDPhase
  ): AgentCapability[] {
    let candidateAgents: AgentCapability[];

    if (phase) {
      candidateAgents = this.getAgentsForPhase(phase, context);
    } else {
      candidateAgents = this.getAllAgents();
    }

    // Score agents based on context match
    const scoredAgents = candidateAgents.map(agent => ({
      agent,
      score: this.calculateAgentScore(agent, context),
    }));

    // Sort by score descending and return agents
    return scoredAgents
      .sort((a, b) => b.score - a.score)
      .map(scored => scored.agent);
  }

  /**
   * Filter agents based on orchestration context
   */
  private filterAgentsByContext(
    agents: AgentCapability[],
    context: OrchestrationContext
  ): AgentCapability[] {
    return agents.filter(agent => {
      // Healthcare compliance filtering
      if (context.healthcareCompliance.required) {
        if (context.healthcareCompliance.lgpd && !agent.healthcareCompliance?.lgpd) {
          return false;
        }
        if (context.healthcareCompliance.anvisa && !agent.healthcareCompliance?.anvisa) {
          return false;
        }
        if (context.healthcareCompliance.cfm && !agent.healthcareCompliance?.cfm) {
          return false;
        }
      }

      // Feature type filtering
      if (context.featureType === 'microservice' && 
          !agent.specializations.includes('microservices-architecture')) {
        return false;
      }

      // Criticality level filtering
      if (context.criticalityLevel === 'critical' && agent.priority === 'tertiary') {
        return false;
      }

      return true;
    });
  }

  /**
   * Calculate agent selection score based on context
   */
  private calculateAgentScore(
    agent: AgentCapability,
    context: OrchestrationContext
  ): number {
    let score = 0;

    // Base score by priority
    switch (agent.priority) {
      case 'primary': score += 100; break;
      case 'secondary': score += 75; break;
      case 'tertiary': score += 50; break;
    }

    // Trigger word matching
    const contextWords = [
      context.featureName,
      context.featureType,
      context.criticalityLevel,
      ...context.requirements,
    ].join(' ').toLowerCase();

    agent.triggers.forEach(trigger => {
      if (contextWords.includes(trigger.toLowerCase())) {
        score += 25;
      }
    });

    // Specialization matching
    agent.specializations.forEach(specialization => {
      if (contextWords.includes(specialization.toLowerCase().replace('-', ' '))) {
        score += 15;
      }
    });

    // Healthcare compliance bonus
    if (context.healthcareCompliance.required) {
      if (agent.healthcareCompliance?.lgpd) score += 10;
      if (agent.healthcareCompliance?.anvisa) score += 10; 
      if (agent.healthcareCompliance?.cfm) score += 10;
      if (agent.healthcareCompliance?.auditTrail) score += 5;
    }

    // Complexity bonus
    if (context.complexity === 'high' && agent.priority === 'primary') {
      score += 20;
    }

    return score;
  }

  /**
   * Register new agent capability
   */
  registerAgent(agent: AgentCapability): void {
    this.agents.set(agent.type, agent);
    
    // Update capability mapping
    agent.capabilities.forEach(capability => {
      if (!this.capabilityAgentMapping.has(capability)) {
        this.capabilityAgentMapping.set(capability, []);
      }
      this.capabilityAgentMapping.get(capability)!.push(agent.type);
    });
  }

  /**
   * Unregister agent capability
   */
  unregisterAgent(agentType: AgentType): boolean {
    const agent = this.agents.get(agentType);
    if (!agent) return false;

    // Remove from agents map
    this.agents.delete(agentType);

    // Remove from capability mapping
    agent.capabilities.forEach(capability => {
      const agents = this.capabilityAgentMapping.get(capability);
      if (agents) {
        const index = agents.indexOf(agentType);
        if (index > -1) {
          agents.splice(index, 1);
        }
      }
    });

    // Remove from phase mapping
    this.phaseAgentMapping.forEach((agents, phase) => {
      const index = agents.indexOf(agentType);
      if (index > -1) {
        agents.splice(index, 1);
      }
    });

    return true;
  }

  /**
   * Update agent configuration
   */
  updateAgentConfiguration(
    agentType: AgentType, 
    configuration: Record<string, any>
  ): boolean {
    const agent = this.agents.get(agentType);
    if (!agent) return false;

    agent.configuration = { ...agent.configuration, ...configuration };
    return true;
  }

  /**
   * Get agent execution statistics
   */
  getAgentStats(agentType: AgentType): any {
    // This would integrate with metrics collection system
    return {
      executionCount: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastExecution: null,
    };
  }

  /**
   * Validate agent capability against context requirements
   */
  validateAgentCapability(
    agent: AgentCapability,
    context: OrchestrationContext
  ): boolean {
    // Check if agent can handle required capabilities
    const requiredCapabilities = this.extractRequiredCapabilities(context);
    return requiredCapabilities.every(capability => 
      agent.capabilities.includes(capability)
    );
  }

  /**
   * Extract required capabilities from context
   */
  private extractRequiredCapabilities(context: OrchestrationContext): string[] {
    const capabilities: string[] = [];

    // Add capabilities based on context
    if (context.healthcareCompliance.required) {
      capabilities.push('healthcare-compliance-validation');
    }

    if (context.criticalityLevel === 'critical') {
      capabilities.push('security-vulnerability-scanning');
    }

    if (context.featureType === 'microservice') {
      capabilities.push('architecture-validation');
    }

    // Add more context-based capability extraction logic
    return capabilities;
  }

  /**
   * Get recommended agent workflow for context
   */
  getRecommendedWorkflow(context: OrchestrationContext): AgentType[] {
    const workflow: AgentType[] = [];

    // Always start with orchestrator for coordination
    workflow.push('tdd-orchestrator');

    // Add phase-specific agents based on context
    if (context.complexity === 'high') {
      workflow.push('architect-review');
    }

    workflow.push('test');
    workflow.push('code-reviewer');

    if (context.healthcareCompliance.required) {
      workflow.push('security-auditor');
    }

    return workflow;
  }

  /**
   * Get agents optimized for parallel execution
   */
  getParallelOptimizedAgents(context: OrchestrationContext): AgentCapability[] {
    const allAgents = this.selectOptimalAgents(context);

    // Filter agents that can run independently in parallel
    const parallelCapableAgents = allAgents.filter(agent => {
      // Exclude orchestrator from parallel execution (it coordinates others)
      if (agent.type === 'tdd-orchestrator') return false;

      // Include agents that have independent analysis capabilities
      return agent.capabilities.some(capability =>
        capability.includes('analysis') ||
        capability.includes('validation') ||
        capability.includes('assessment') ||
        capability.includes('scanning')
      );
    });

    return parallelCapableAgents;
  }

  /**
   * Get agents grouped by coordination patterns for optimal parallel execution
   */
  getAgentCoordinationGroups(context: OrchestrationContext): {
    independent: AgentCapability[];
    dependent: AgentCapability[];
    sequential: AgentCapability[];
  } {
    const agents = this.selectOptimalAgents(context);

    const independent: AgentCapability[] = [];
    const dependent: AgentCapability[] = [];
    const sequential: AgentCapability[] = [];

    agents.forEach(agent => {
      // Independent agents - can run completely in parallel
      if (this.isIndependentAgent(agent)) {
        independent.push(agent);
      }
      // Dependent agents - need results from other agents
      else if (this.isDependentAgent(agent)) {
        dependent.push(agent);
      }
      // Sequential agents - must run in specific order
      else {
        sequential.push(agent);
      }
    });

    return { independent, dependent, sequential };
  }

  /**
   * Get execution plan for parallel agent coordination
   */
  getParallelExecutionPlan(
    context: OrchestrationContext,
    coordinationPattern: AgentCoordinationPattern = 'parallel'
  ): {
    phases: {
      phase: number;
      agents: AgentCapability[];
      mode: 'parallel' | 'sequential';
      dependencies?: string[];
    }[];
    estimatedDuration: number;
    coordination: AgentCoordinationPattern;
  } {
    const groups = this.getAgentCoordinationGroups(context);
    const phases: any[] = [];
    let estimatedDuration = 0;

    switch (coordinationPattern) {
      case 'parallel':
        // Phase 1: All independent agents in parallel
        if (groups.independent.length > 0) {
          phases.push({
            phase: 1,
            agents: groups.independent,
            mode: 'parallel' as const,
          });
          estimatedDuration += this.estimateAgentExecutionTime(groups.independent, 'parallel');
        }

        // Phase 2: Dependent agents (may need parallel groups)
        if (groups.dependent.length > 0) {
          phases.push({
            phase: 2,
            agents: groups.dependent,
            mode: 'parallel' as const,
            dependencies: groups.independent.map(a => a.name),
          });
          estimatedDuration += this.estimateAgentExecutionTime(groups.dependent, 'parallel');
        }

        // Phase 3: Sequential agents
        if (groups.sequential.length > 0) {
          phases.push({
            phase: 3,
            agents: groups.sequential,
            mode: 'sequential' as const,
            dependencies: [...groups.independent, ...groups.dependent].map(a => a.name),
          });
          estimatedDuration += this.estimateAgentExecutionTime(groups.sequential, 'sequential');
        }
        break;

      case 'hierarchical':
        // Primary agents first
        const primaryAgents = [...groups.independent, ...groups.dependent, ...groups.sequential]
          .filter(a => a.priority === 'primary');
        const secondaryAgents = [...groups.independent, ...groups.dependent, ...groups.sequential]
          .filter(a => a.priority === 'secondary');

        if (primaryAgents.length > 0) {
          phases.push({
            phase: 1,
            agents: primaryAgents,
            mode: 'parallel' as const,
          });
          estimatedDuration += this.estimateAgentExecutionTime(primaryAgents, 'parallel');
        }

        if (secondaryAgents.length > 0) {
          phases.push({
            phase: 2,
            agents: secondaryAgents,
            mode: 'parallel' as const,
            dependencies: primaryAgents.map(a => a.name),
          });
          estimatedDuration += this.estimateAgentExecutionTime(secondaryAgents, 'parallel');
        }
        break;

      case 'sequential':
      default:
        // All agents in sequence
        const allAgents = [...groups.independent, ...groups.dependent, ...groups.sequential];
        phases.push({
          phase: 1,
          agents: allAgents,
          mode: 'sequential' as const,
        });
        estimatedDuration += this.estimateAgentExecutionTime(allAgents, 'sequential');
    }

    return {
      phases,
      estimatedDuration,
      coordination: coordinationPattern,
    };
  }

  /**
   * Check if agent can run independently (no dependencies)
   */
  private isIndependentAgent(agent: AgentCapability): boolean {
    // Agents that can analyze code/architecture independently
    return agent.capabilities.some(cap =>
      cap.includes('analysis') ||
      cap.includes('scanning') ||
      cap.includes('assessment')
    ) && !agent.capabilities.some(cap =>
      cap.includes('coordination') ||
      cap.includes('orchestration')
    );
  }

  /**
   * Check if agent has dependencies on other agents
   */
  private isDependentAgent(agent: AgentCapability): boolean {
    // Agents that enhance or build upon other agent results
    return agent.capabilities.some(cap =>
      cap.includes('validation') ||
      cap.includes('enhancement') ||
      cap.includes('compliance-validation')
    );
  }

  /**
   * Estimate execution time for agents based on coordination mode
   */
  private estimateAgentExecutionTime(
    agents: AgentCapability[],
    mode: 'parallel' | 'sequential'
  ): number {
    const baseTime = 30000; // 30 seconds base time per agent
    const complexityMultiplier = 1.5; // Factor for complex agents

    if (mode === 'parallel') {
      // Parallel execution time is the maximum of all agents
      const maxTime = Math.max(...agents.map(agent => {
        const complexity = agent.specializations.length > 3 ? complexityMultiplier : 1;
        return baseTime * complexity;
      }));
      return maxTime;
    } else {
      // Sequential execution time is the sum of all agents
      return agents.reduce((total, agent) => {
        const complexity = agent.specializations.length > 3 ? complexityMultiplier : 1;
        return total + (baseTime * complexity);
      }, 0);
    }
  }

  /**
   * Get conflict resolution strategy for parallel execution
   */
  getConflictResolutionStrategy(
    agents: AgentCapability[],
    context: OrchestrationContext
  ): 'priority-based' | 'consensus' | 'coordinator-decides' {
    // Healthcare and security contexts require coordinator decision
    if (context.healthcareCompliance.required || context.criticalityLevel === 'critical') {
      return 'coordinator-decides';
    }

    // Multiple primary agents suggest consensus
    const primaryAgents = agents.filter(a => a.priority === 'primary');
    if (primaryAgents.length > 2) {
      return 'consensus';
    }

    // Default to priority-based resolution
    return 'priority-based';
  }

  /**
   * Get shared context requirements for parallel execution
   */
  getSharedContextRequirements(agents: AgentCapability[]): {
    featureSpec: boolean;
    codeChanges: boolean;
    testSuite: boolean;
    qualityMetrics: boolean;
    securityFindings: boolean;
    architectureDecisions: boolean;
  } {
    const requirements = {
      featureSpec: false,
      codeChanges: false,
      testSuite: false,
      qualityMetrics: false,
      securityFindings: false,
      architectureDecisions: false,
    };

    agents.forEach(agent => {
      // Determine what context each agent needs
      if (agent.capabilities.includes('architecture-validation')) {
        requirements.featureSpec = true;
        requirements.architectureDecisions = true;
      }

      if (agent.capabilities.includes('code-quality-analysis')) {
        requirements.codeChanges = true;
        requirements.qualityMetrics = true;
      }

      if (agent.capabilities.includes('test-pattern-enforcement')) {
        requirements.testSuite = true;
        requirements.codeChanges = true;
      }

      if (agent.capabilities.includes('security-vulnerability-scanning')) {
        requirements.securityFindings = true;
        requirements.codeChanges = true;
      }
    });

    return requirements;
  }

  /**
   * Create parallel execution context for agents
   */
  createParallelExecutionContext(
    agents: AgentCapability[],
    baseContext: OrchestrationContext
  ): OrchestrationContext & {
    parallelExecution: {
      totalAgents: number;
      agentGroups: string[];
      sharedContext: Record<string, any>;
      conflictResolution: string;
    };
  } {
    const groups = this.getAgentCoordinationGroups(baseContext);
    const sharedContext = this.getSharedContextRequirements(agents);
    const conflictResolution = this.getConflictResolutionStrategy(agents, baseContext);

    return {
      ...baseContext,
      parallelExecution: {
        totalAgents: agents.length,
        agentGroups: [
          `Independent: ${groups.independent.map(a => a.name).join(', ')}`,
          `Dependent: ${groups.dependent.map(a => a.name).join(', ')}`,
          `Sequential: ${groups.sequential.map(a => a.name).join(', ')}`,
        ],
        sharedContext,
        conflictResolution,
      },
    };
  }
}