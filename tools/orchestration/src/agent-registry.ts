/**
 * Agent capability definition for TDD orchestration
 */
export interface AgentCapability {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
  specializations: string[];
  priority: "primary" | "secondary" | "tertiary";
  phases: TDDPhase[];
  triggers: string[];
  configuration: Record<string, any>;
  healthcareCompliance?: {
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}

/**
 * Orchestration context for agent selection
 */
export interface OrchestrationContext {
  featureName: string;
  featureType: string;
  complexity: "low" | "medium" | "high";
  criticalityLevel: "low" | "medium" | "high" | "critical";
  requirements: string[];
  healthcareCompliance: {
    required: boolean;
    lgpd: boolean;
    anvisa: boolean;
    cfm: boolean;
  };
}

/**
 * Agent type enumeration
 */
export type AgentType =
  | "tdd-orchestrator"
  | "architect-review"
  | "code-reviewer"
  | "security-auditor"
  | "test"
  | "custom-agent"
  | "tertiary-agent";

/**
 * TDD phase enumeration
 */
export type TDDPhase = "red" | "green" | "refactor";

/**
 * Agent statistics for performance tracking
 */
export interface AgentStats {
  executionCount: number;
  successRate: number;
  averageExecutionTime: number;
  lastExecution: Date | null;
}

/**
 * Default agent configurations
 */
const DEFAULT_AGENTS: AgentCapability[] = [
  {
    type: "tdd-orchestrator",
    name: "TDD Orchestrator",
    description: "Main orchestrator for TDD workflow coordination",
    capabilities: [
      "workflow-coordination",
      "phase-management",
      "quality-control",
    ],
    specializations: ["tdd-workflow", "multi-agent-coordination"],
    priority: "primary",
    phases: ["red", "green", "refactor"],
    triggers: ["tdd-cycle", "workflow-start"],
    configuration: {},
    healthcareCompliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
  },
  {
    type: "architect-review",
    name: "Architecture Review Agent",
    description: "Reviews system architecture and design patterns",
    capabilities: [
      "architecture-validation",
      "design-patterns",
      "scalability-analysis",
    ],
    specializations: [
      "microservices-architecture",
      "system-design",
      "scalability",
    ],
    priority: "secondary",
    phases: ["red", "refactor"],
    triggers: ["architecture-review", "design-validation"],
    configuration: {},
    healthcareCompliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
  },
  {
    type: "code-reviewer",
    name: "Code Review Agent",
    description: "Performs code quality analysis and review",
    capabilities: ["code-quality-analysis", "static-analysis", "linting"],
    specializations: [
      "code-quality",
      "best-practices",
      "performance-optimization",
    ],
    priority: "secondary",
    phases: ["green", "refactor"],
    triggers: ["code-review", "quality-check"],
    configuration: {},
    healthcareCompliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
  },
  {
    type: "security-auditor",
    name: "Security Audit Agent",
    description:
      "Performs security vulnerability scanning and compliance checks",
    capabilities: [
      "security-vulnerability-scanning",
      "compliance-validation",
      "penetration-testing",
    ],
    specializations: [
      "security-analysis",
      "vulnerability-assessment",
      "compliance",
    ],
    priority: "secondary",
    phases: ["red", "green"],
    triggers: ["security-scan", "compliance-check"],
    configuration: {},
    healthcareCompliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
  },
  {
    type: "test",
    name: "Test Coordination Agent",
    description: "Manages test execution and validation",
    capabilities: [
      "test-pattern-enforcement",
      "test-execution",
      "coverage-analysis",
    ],
    specializations: ["testing", "test-automation", "quality-assurance"],
    priority: "primary",
    phases: ["red", "green"],
    triggers: ["test-execution", "validation"],
    configuration: {},
    healthcareCompliance: {
      lgpd: true,
      anvisa: true,
      cfm: true,
    },
  },
];

/**
 * TDD Agent Registry for managing and selecting agents
 */
export class TDDAgentRegistry {
  private agents: Map<AgentType, AgentCapability> = new Map();
  private agentStats: Map<AgentType, AgentStats> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  /**
   * Initialize default agents
   */
  private initializeDefaultAgents(): void {
    DEFAULT_AGENTS.forEach((agent) => {
      this.agents.set(agent.type, agent);
      this.agentStats.set(agent.type, {
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        lastExecution: null,
      });
    });
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): AgentCapability[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent by type
   */
  getAgent(type: AgentType): AgentCapability | undefined {
    return this.agents.get(type);
  }

  /**
   * Register a new agent
   */
  registerAgent(agent: AgentCapability): void {
    this.agents.set(agent.type, agent);
    this.agentStats.set(agent.type, {
      executionCount: 0,
      successRate: 0,
      averageExecutionTime: 0,
      lastExecution: null,
    });
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(type: AgentType): boolean {
    const deleted = this.agents.delete(type);
    if (deleted) {
      this.agentStats.delete(type);
    }
    return deleted;
  }

  /**
   * Get agents for specific TDD phase
   */
  getAgentsForPhase(
    phase: TDDPhase,
    context: OrchestrationContext,
  ): AgentCapability[] {
    // Handle undefined or empty context gracefully
    if (!context || !context.healthcareCompliance) {
      // Return all agents that support the phase if context is invalid
      return Array.from(this.agents.values()).filter((agent) =>
        agent.phases.includes(phase),
      );
    }

    const agents = Array.from(this.agents.values()).filter((agent) => {
      // Check if agent supports the phase
      if (!agent.phases.includes(phase)) {
        return false;
      }

      // Filter based on healthcare compliance requirements
      if (context.healthcareCompliance.required) {
        if (!agent.healthcareCompliance) return false;
        if (
          context.healthcareCompliance.lgpd &&
          !agent.healthcareCompliance.lgpd
        )
          return false;
        if (
          context.healthcareCompliance.anvisa &&
          !agent.healthcareCompliance.anvisa
        )
          return false;
        if (context.healthcareCompliance.cfm && !agent.healthcareCompliance.cfm)
          return false;
      }

      // Filter based on criticality level (exclude tertiary agents for critical features)
      if (
        context.criticalityLevel === "critical" &&
        agent.priority === "tertiary"
      ) {
        return false;
      }

      return true;
    });

    return agents;
  }

  /**
   * Get agents for specific capability
   */
  getAgentsForCapability(capability: string): AgentCapability[] {
    return Array.from(this.agents.values()).filter((agent) =>
      agent.capabilities.includes(capability),
    );
  }

  /**
   * Select optimal agents based on context
   */
  selectOptimalAgents(context: OrchestrationContext): AgentCapability[] {
    // Handle undefined or incomplete context gracefully
    if (
      !context ||
      !context.requirements ||
      !Array.isArray(context.requirements)
    ) {
      // Return all agents in default order if context is invalid
      return this.getAllAgents();
    }

    const allAgents = this.getAllAgents();

    // Calculate scores for each agent
    const scoredAgents = allAgents.map((agent) => ({
      agent,
      score: this.calculateAgentScore(agent, context),
    }));

    // Sort by score (highest first)
    scoredAgents.sort((a, b) => b.score - a.score);

    return scoredAgents.map((item) => item.agent);
  }

  /**
   * Calculate agent relevance score
   */
  private calculateAgentScore(
    agent: AgentCapability,
    context: OrchestrationContext,
  ): number {
    let score = 0;

    // Base score by priority
    switch (agent.priority) {
      case "primary":
        score += 100;
        break;
      case "secondary":
        score += 75;
        break;
      case "tertiary":
        score += 50;
        break;
    }

    // Bonus for matching triggers
    const matchingTriggers = agent.triggers.filter(
      (trigger) =>
        context.featureName.toLowerCase().includes(trigger.toLowerCase()) ||
        context.requirements.some((req) =>
          req.toLowerCase().includes(trigger.toLowerCase()),
        ),
    );
    score += matchingTriggers.length * 10;

    // Bonus for matching specializations
    const matchingSpecializations = agent.specializations.filter(
      (spec) =>
        context.featureName.toLowerCase().includes(spec.toLowerCase()) ||
        context.featureType.toLowerCase().includes(spec.toLowerCase()),
    );
    score += matchingSpecializations.length * 15;

    // Bonus for healthcare compliance when required
    if (context.healthcareCompliance.required && agent.healthcareCompliance) {
      let complianceScore = 0;
      if (context.healthcareCompliance.lgpd && agent.healthcareCompliance.lgpd)
        complianceScore += 25;
      if (
        context.healthcareCompliance.anvisa &&
        agent.healthcareCompliance.anvisa
      )
        complianceScore += 25;
      if (context.healthcareCompliance.cfm && agent.healthcareCompliance.cfm)
        complianceScore += 25;
      score += complianceScore;
    }

    // Bonus for complexity matching
    if (context.complexity === "high" && agent.priority === "primary") {
      score += 20;
    }

    return score;
  }

  /**
   * Validate agent capability against context
   */
  validateAgentCapability(agent: AgentCapability): boolean {
    // Check if agent supports required phases
    // This is a simplified validation - in real implementation would be more comprehensive
    return agent.phases.length > 0 && agent.capabilities.length > 0;
  }

  /**
   * Get recommended workflow based on context
   */
  getRecommendedWorkflow(context: OrchestrationContext): AgentType[] {
    // Always start with orchestrator
    const workflow: AgentType[] = ["tdd-orchestrator"];

    // Add other agents based on context
    if (context.complexity === "high") {
      workflow.push("architect-review");
    }

    if (context.healthcareCompliance.required) {
      workflow.push("security-auditor");
    }

    workflow.push("test");
    workflow.push("code-reviewer");

    return workflow;
  }

  /**
   * Update agent configuration
   */
  updateAgentConfiguration(
    type: AgentType,
    config: Record<string, any>,
  ): boolean {
    const agent = this.agents.get(type);
    if (!agent) return false;

    agent.configuration = { ...agent.configuration, ...config };
    return true;
  }

  /**
   * Get agent statistics
   */
  getAgentStats(type: AgentType): AgentStats {
    return (
      this.agentStats.get(type) || {
        executionCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        lastExecution: null,
      }
    );
  }

  /**
   * Extract required capabilities from context
   */
  private extractRequiredCapabilities(context: OrchestrationContext): string[] {
    const capabilities: string[] = [];

    if (context.healthcareCompliance.required) {
      capabilities.push("healthcare-compliance-validation");
    }

    if (context.criticalityLevel === "critical") {
      capabilities.push("security-vulnerability-scanning");
    }

    if (context.featureType === "microservice") {
      capabilities.push("architecture-validation");
    }

    return capabilities;
  }
}
