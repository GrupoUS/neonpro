/**
 * Agent Coordination Utilities
 * Helper functions for coordinating agents across test categories
 */

import { createLogger } from '../../logger';

const logger = createLogger('AgentCoordination', {
  level: 'info',
  format: 'pretty',
  enableConstitutional: true,
});

export type AgentName =
  | 'tdd-orchestrator'
  | 'code-reviewer'
  | 'architect-review'
  | 'security-auditor'
  | 'test';

export type TDDPhase = 'red' | 'green' | 'refactor';

export interface AgentCapability {
  name: string;
  description: string;
  categories: string[];
  phases: TDDPhase[];
}

export const AGENT_CAPABILITIES: Record<AgentName, AgentCapability> = {
  'tdd-orchestrator': {
    name: 'TDD Orchestrator',
    description: 'Central coordinator for TDD cycles and agent coordination',
    categories: ['frontend', 'backend', 'database', 'quality'],
    phases: ['red', 'green', 'refactor'],
  },
  'code-reviewer': {
    name: 'Code Reviewer',
    description: 'Quality analysis, maintainability, and performance validation',
    categories: ['frontend', 'backend', 'quality'],
    phases: ['green', 'refactor'],
  },
  'architect-review': {
    name: 'Architecture Review',
    description: 'Pattern compliance, design validation, and scalability',
    categories: ['backend', 'database', 'quality'],
    phases: ['red', 'green', 'refactor'],
  },
  'security-auditor': {
    name: 'Security Auditor',
    description: 'Security validation, compliance, and vulnerability scanning',
    categories: ['database', 'backend', 'quality'],
    phases: ['red', 'green', 'refactor'],
  },
  'test': {
    name: 'Test Agent',
    description: 'Test pattern enforcement and coverage validation',
    categories: ['frontend', 'backend', 'database', 'quality'],
    phases: ['red'],
  },
};

export interface AgentCoordinationPlan {
  category: string;
  phase: TDDPhase;
  primaryAgent: AgentName;
  supportAgents: AgentName[];
  workflow: string;
  qualityGates: string[];
}

export class AgentCoordinator {
  static getAgentsForCategory(category: string): AgentName[] {
    return Object.entries(AGENT_CAPABILITIES)
      .filter(([_, capability]) => capability.categories.includes(category))
      .map(([agentName]) => agentName as AgentName);
  }

  static getAgentsForPhase(phase: TDDPhase): AgentName[] {
    return Object.entries(AGENT_CAPABILITIES)
      .filter(([_, capability]) => capability.phases.includes(phase))
      .map(([agentName]) => agentName as AgentName);
  }

  static createCoordinationPlan(
    category: string,
    phase: TDDPhase,
    options: {
      healthcareCompliance?: boolean;
      parallel?: boolean;
    } = {}
  ): AgentCoordinationPlan {
    const availableAgents = this.getAgentsForCategory(category);
    const phaseAgents = this.getAgentsForPhase(phase);
    const eligibleAgents = availableAgents.filter(agent => phaseAgents.includes(agent));

    let primaryAgent: AgentName;
    let supportAgents: AgentName[];
    let workflow: string;
    let qualityGates: string[];

    switch (phase) {
      case 'red':
        primaryAgent = 'test';
        supportAgents = eligibleAgents.filter(agent =>
          agent !== 'test' && ['architect-review', 'security-auditor'].includes(agent)
        );
        workflow = 'sequential';
        qualityGates = [
          'Test patterns compliance ≥95%',
          'Architecture alignment ≥90%',
          options.healthcareCompliance ? 'Security coverage ≥100%' : 'Security coverage ≥85%'
        ];
        break;

      case 'green':
        primaryAgent = 'code-reviewer';
        supportAgents = eligibleAgents.filter(agent => agent !== 'code-reviewer');
        workflow = 'sequential';
        qualityGates = [
          'All tests passing ≥100%',
          'Code quality metrics ≥85%',
          options.healthcareCompliance ? 'Security validation ≥100%' : 'Security validation ≥90%',
          'Pattern compliance ≥90%'
        ];
        break;

      case 'refactor':
        primaryAgent = 'tdd-orchestrator';
        supportAgents = eligibleAgents.filter(agent => agent !== 'tdd-orchestrator');
        workflow = options.parallel ? 'parallel' : 'hierarchical';
        qualityGates = [
          'Quality metrics improved ≥10%',
          'Architecture score maintained ≥90%',
          options.healthcareCompliance ? 'Security posture improved ≥100%' : 'Security posture maintained ≥90%',
          'Test performance improved ≥5%'
        ];
        break;

      default:
        throw new Error(`Unsupported phase: ${phase}`);
    }

    const plan: AgentCoordinationPlan = {
      category,
      phase,
      primaryAgent,
      supportAgents,
      workflow,
      qualityGates,
    };

    logger.constitutional(
      'info',
      `Agent coordination plan created for ${category}:${phase}`,
      {
        compliance: options.healthcareCompliance || false,
        requirement: 'Agent Coordination Planning',
        standard: 'TDD',
      }
    );

    return plan;
  }

  static async executeCoordinationPlan(plan: AgentCoordinationPlan): Promise<{
    success: boolean;
    results: Record<string, any>;
    qualityGateResults: Record<string, boolean>;
  }> {
    logger.info(`Executing coordination plan: ${plan.category}:${plan.phase} with ${plan.workflow} workflow`);

    const results: Record<string, any> = {};
    const qualityGateResults: Record<string, boolean> = {};

    try {
      // Execute primary agent
      results[plan.primaryAgent] = await this.executeAgent(plan.primaryAgent, plan.category, plan.phase);

      // Execute support agents based on workflow
      if (plan.workflow === 'parallel') {
        const supportResults = await Promise.all(
          plan.supportAgents.map(agent => this.executeAgent(agent, plan.category, plan.phase))
        );

        plan.supportAgents.forEach((agent, index) => {
          results[agent] = supportResults[index];
        });
      } else {
        // Sequential execution
        for (const agent of plan.supportAgents) {
          results[agent] = await this.executeAgent(agent, plan.category, plan.phase);
        }
      }

      // Validate quality gates
      for (const gate of plan.qualityGates) {
        qualityGateResults[gate] = await this.validateQualityGate(gate, results);
      }

      const allGatesPassed = Object.values(qualityGateResults).every(passed => passed);

      logger.constitutional(
        allGatesPassed ? 'info' : 'warn',
        `Coordination plan execution completed. Quality gates: ${allGatesPassed ? 'PASSED' : 'FAILED'}`,
        {
          compliance: allGatesPassed,
          requirement: 'Quality Gate Validation',
          standard: 'TDD',
        }
      );

      return {
        success: allGatesPassed,
        results,
        qualityGateResults,
      };

    } catch (error) {
      logger.error('Agent coordination plan execution failed', error);

      return {
        success: false,
        results,
        qualityGateResults,
      };
    }
  }

  private static async executeAgent(
    agent: AgentName,
    category: string,
    phase: TDDPhase
  ): Promise<any> {
    // Simulated agent execution - in real implementation, this would
    // interface with actual agent implementations
    logger.info(`Executing ${agent} for ${category}:${phase}`);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      agent,
      category,
      phase,
      success: true,
      metrics: {
        quality: 9.2,
        coverage: 92,
        performance: 150, // ms
      },
    };
  }

  private static async validateQualityGate(gate: string, results: Record<string, any>): Promise<boolean> {
    // Simulated quality gate validation
    logger.debug(`Validating quality gate: ${gate}`);

    // In real implementation, this would analyze the actual results
    // and validate against specific thresholds
    return Math.random() > 0.1; // 90% success rate for simulation
  }
}