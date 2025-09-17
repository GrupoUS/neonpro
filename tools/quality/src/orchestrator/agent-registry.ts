/**
 * 🎭 Agent Registry - Multi-Agent Coordination
 * ============================================
 * 
 * Central registry for managing TDD agents and their capabilities
 */

import { 
  AgentName, 
  AgentCapabilities, 
  TDDPhase, 
  FeatureContext,
  normalizeComplexity
} from './types';

export class AgentRegistry {
  private agents: Map<AgentName, AgentCapabilities> = new Map();
  private activationRules: Map<string, AgentName[]> = new Map();

  constructor() {
    this.initializeAgents();
    this.setupActivationRules();
  }

  /**
   * Initialize all available agents with their capabilities
   */
  private initializeAgents(): void {
    // Test Agent - TDD orchestration and test patterns
    this.agents.set('test', {
      name: 'test',
      phases: ['red', 'green', 'refactor'],
      specializations: [
        'tdd-discipline',
        'test-patterns',
        'test-optimization',
        'coverage-analysis',
        'test-structure'
      ],
      triggers: [
        'tdd', 'testing', 'coverage', 'test patterns',
        'unit test', 'integration test', 'e2e test'
      ],
      dependencies: [],
      parallelizable: false // Primary TDD coordinator
    });

    // Architect Review Agent - System design and patterns
    this.agents.set('architect-review', {
      name: 'architect-review',
      phases: ['red', 'green', 'refactor'],
      specializations: [
        'system-architecture',
        'design-patterns',
        'scalability',
        'microservices',
        'api-design'
      ],
      triggers: [
        'microservice', 'architecture', 'system design', 'patterns',
        'scalability', 'api', 'integration', 'service boundary'
      ],
      dependencies: [],
      parallelizable: true
    });

    // Code Reviewer Agent - Code quality and maintainability
    this.agents.set('code-reviewer', {
      name: 'code-reviewer',
      phases: ['green', 'refactor'],
      specializations: [
        'code-quality',
        'maintainability',
        'performance',
        'technical-debt',
        'refactoring'
      ],
      triggers: [
        'performance', 'maintainability', 'technical debt',
        'code quality', 'refactor', 'optimization'
      ],
      dependencies: ['test'],
      parallelizable: true
    });

    // Security Auditor Agent - DevSecOps and compliance
    this.agents.set('security-auditor', {
      name: 'security-auditor',
      phases: ['red', 'green', 'refactor'],
      specializations: [
        'security-analysis',
        'vulnerability-scanning',
        'compliance',
        'devsecops',
        'threat-modeling'
      ],
      triggers: [
        'authentication', 'authorization', 'payment', 'personal data',
        'compliance', 'security', 'encrypt', 'auth', 'gdpr', 'lgpd'
      ],
      dependencies: [],
      parallelizable: true
    });
  }

  /**
   * Setup activation rules based on keywords and context
   */
  private setupActivationRules(): void {
    // Security-critical features
    this.activationRules.set('security-critical', [
      'security-auditor', 'test', 'code-reviewer'
    ]);

    // Architecture-heavy features
    this.activationRules.set('architecture-heavy', [
      'architect-review', 'test', 'code-reviewer'
    ]);

    // Performance-critical features
    this.activationRules.set('performance-critical', [
      'code-reviewer', 'architect-review', 'test'
    ]);

    // Standard features
    this.activationRules.set('standard', [
      'test', 'code-reviewer'
    ]);

    // Legacy code modernization
    this.activationRules.set('legacy', [
      'code-reviewer', 'architect-review', 'test', 'security-auditor'
    ]);
  }

  /**
   * Get agent capabilities by name
   */
  getAgent(name: AgentName): AgentCapabilities | undefined {
    return this.agents.get(name);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentCapabilities[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents for a specific TDD phase
   */
  getAgentsForPhase(phase: TDDPhase): AgentCapabilities[] {
    return this.getAllAgents().filter(agent => 
      agent.phases.includes(phase)
    );
  }

  /**
   * Determine which agents should be activated for a feature
   */
  selectAgentsForFeature(feature: FeatureContext): AgentName[] {
    const selectedAgents = new Set<AgentName>();
    
    // Always include test agent for TDD
    selectedAgents.add('test');

    // Check for security triggers
    if (this.hasSecurityTriggers(feature)) {
      selectedAgents.add('security-auditor');
    }

    // Check for architecture triggers
    if (this.hasArchitectureTriggers(feature)) {
      selectedAgents.add('architect-review');
    }

    // Check for performance/quality triggers
    if (this.hasQualityTriggers(feature)) {
      selectedAgents.add('code-reviewer');
    }

    // Complexity-based selection
    const complexityLevel = normalizeComplexity(feature.complexity);
    if (complexityLevel >= 7) {
      // High complexity features need all agents
      this.getAllAgents().forEach(agent => {
        selectedAgents.add(agent.name);
      });
    } else if (complexityLevel >= 4) {
      // Medium complexity adds code reviewer if not already included
      selectedAgents.add('code-reviewer');
    }

    return Array.from(selectedAgents);
  }

  /**
   * Check if feature has security-related triggers
   */
  private hasSecurityTriggers(feature: FeatureContext): boolean {
    const securityAgent = this.agents.get('security-auditor');
    if (!securityAgent) return false;

    const featureText = [
      feature.name,
      ...(Array.isArray(feature.domain) ? feature.domain : []),
      ...(Array.isArray(feature.requirements) ? feature.requirements : []),
      ...(Array.isArray(feature.complianceRequirements) ? feature.complianceRequirements : [])
    ].join(' ').toLowerCase();

    return securityAgent.triggers.some(trigger => 
      featureText.includes(trigger.toLowerCase())
    ) || feature.securityCritical;
  }

  /**
   * Check if feature has architecture-related triggers
   */
  private hasArchitectureTriggers(feature: FeatureContext): boolean {
    const architectAgent = this.agents.get('architect-review');
    if (!architectAgent) return false;

    const domains = Array.isArray(feature.domain) ? feature.domain : [];
    const requirements = feature.requirements ?? [];

    const featureText = [
      feature.name,
      ...domains,
      ...requirements
    ].join(' ').toLowerCase();

    return architectAgent.triggers.some(trigger => 
      featureText.includes(trigger.toLowerCase())
    );
  }

  /**
   * Check if feature has quality/performance triggers
   */
  private hasQualityTriggers(feature: FeatureContext): boolean {
    const codeReviewerAgent = this.agents.get('code-reviewer');
    if (!codeReviewerAgent) return false;

    const domains = Array.isArray(feature.domain) ? feature.domain : [];
    const requirements = feature.requirements ?? [];

    const featureText = [
      feature.name,
      ...domains,
      ...requirements
    ].join(' ').toLowerCase();

    return codeReviewerAgent.triggers.some(trigger => 
      featureText.includes(trigger.toLowerCase())
    );
  }

  /**
   * Get agents that can run in parallel for a given phase
   */
  getParallelizableAgents(phase: TDDPhase, selectedAgents: AgentName[]): AgentName[] {
    return selectedAgents.filter(agentName => {
      const agent = this.agents.get(agentName);
      return agent && 
             agent.phases.includes(phase) && 
             agent.parallelizable;
    });
  }

  /**
   * Get agents that must run sequentially for a given phase
   */
  getSequentialAgents(phase: TDDPhase, selectedAgents: AgentName[]): AgentName[] {
    return selectedAgents.filter(agentName => {
      const agent = this.agents.get(agentName);
      return agent && 
             agent.phases.includes(phase) && 
             !agent.parallelizable;
    });
  }

  /**
   * Resolve agent dependencies
   */
  resolveDependencies(agents: AgentName[]): AgentName[] {
    const resolved = new Set<AgentName>();
    const visiting = new Set<AgentName>();

    const visit = (agentName: AgentName) => {
      if (visiting.has(agentName)) {
        throw new Error(`Circular dependency detected involving agent: ${agentName}`);
      }
      
      if (resolved.has(agentName)) {
        return;
      }

      visiting.add(agentName);
      
      const agent = this.agents.get(agentName);
      if (agent) {
        // Visit dependencies first
        agent.dependencies.forEach(dep => {
          if (agents.includes(dep)) {
            visit(dep);
          }
        });
      }

      visiting.delete(agentName);
      resolved.add(agentName);
    };

    agents.forEach(visit);
    return Array.from(resolved);
  }

  /**
   * Validate agent configuration
   */
  validateAgentConfig(agentName: AgentName, _config: Record<string, any>): boolean {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    // Basic validation - can be extended with specific rules per agent
    return true;
  }

  /**
   * Register a new agent (for extensibility)
   */
  registerAgent(capabilities: AgentCapabilities): void {
    this.agents.set(capabilities.name, capabilities);
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(name: AgentName): boolean {
    return this.agents.delete(name);
  }
}