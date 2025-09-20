/**
 * Agent Coordinator
 *
 * Coordinates testing activities across multiple specialized agents
 * following the patterns defined in the code review documentation.
 */

import { AGENT_REGISTRY, QUALITY_GATES } from './index';
import type { AgentType } from './types';

const QUALITY_GATE_KEY_MAP: Record<AgentType, keyof typeof QUALITY_GATES> = {
  'architect-review': 'ARCHITECTURE',
  'code-reviewer': 'CODE_QUALITY',
  'security-auditor': 'SECURITY',
  'tdd-orchestrator': 'TDD',
};

export interface CoordinationConfig {
  pattern: 'sequential' | 'parallel' | 'hierarchical';
  agents: AgentType[];
  qualityGates: string[];
  timeout?: number;
}

export interface AgentResult {
  agent: AgentType;
  success: boolean;
  metrics: Record<string, number>;
  issues: string[];
  recommendations: string[];
}

/**
 * Agent Coordinator Class
 *
 * Manages the coordination of multiple agents during testing phases
 */
export class AgentCoordinator {
  private config: CoordinationConfig;
  private results: Map<AgentType, AgentResult> = new Map();

  constructor(config: CoordinationConfig) {
    this.config = config;
  }

  /**
   * Execute agent coordination based on pattern
   */
  async execute(): Promise<AgentResult[]> {
    console.log(`🤖 Agent Coordination: ${this.config.pattern}`);
    console.log(`Agents: ${this.config.agents.join(', ')}`);

    switch (this.config.pattern) {
      case 'sequential':
        return await this.executeSequential();
      case 'parallel':
        return await this.executeParallel();
      case 'hierarchical':
        return await this.executeHierarchical();
      default:
        throw new Error(`Unknown coordination pattern: ${this.config.pattern}`);
    }
  }

  /**
   * Sequential execution - agents run one after another
   */
  private async executeSequential(): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    for (const agent of this.config.agents) {
      console.log(`🔄 Executing agent: ${agent}`);
      const result = await this.executeAgent(agent);
      results.push(result);
      this.results.set(agent, result);

      // Stop on failure if configured
      if (!result.success && this.config.qualityGates.includes('fail-fast')) {
        console.log(`❌ Agent ${agent} failed, stopping sequential execution`);
        break;
      }
    }

    return results;
  }

  /**
   * Parallel execution - agents run simultaneously
   */
  private async executeParallel(): Promise<AgentResult[]> {
    console.log('🚀 Executing agents in parallel');

    const promises = this.config.agents.map(agent => this.executeAgent(agent));
    const results = await Promise.all(promises);

    results.forEach((result, index) => {
      const agent = this.config.agents[index];
      if (agent) {
        this.results.set(agent, result);
      }
    });

    return results;
  }

  /**
   * Hierarchical execution - primary agent coordinates support agents
   */
  private async executeHierarchical(): Promise<AgentResult[]> {
    const [primaryAgent, ...supportAgents] = this.config.agents;

    if (!primaryAgent) {
      throw new Error('No primary agent specified for hierarchical execution');
    }

    console.log(`👑 Primary agent: ${primaryAgent}`);
    console.log(`🤝 Support agents: ${supportAgents.join(', ')}`);

    // Execute primary agent first
    const primaryResult = await this.executeAgent(primaryAgent);
    this.results.set(primaryAgent, primaryResult);

    // Execute support agents based on primary result
    const supportPromises = supportAgents.map(agent => this.executeAgent(agent));
    const supportResults = await Promise.all(supportPromises);

    supportResults.forEach((result, index) => {
      const agent = supportAgents[index];
      if (agent) {
        this.results.set(agent, result);
      }
    });

    return [primaryResult, ...supportResults];
  }

  /**
   * Execute individual agent
   */
  private async executeAgent(agent: AgentType): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      // Simulate agent execution with quality gate validation
      const metrics = await this.validateQualityGates(agent);
      const success = this.evaluateSuccess(agent, metrics);

      const result: AgentResult = {
        agent,
        success,
        metrics,
        issues: success ? [] : [`Quality gates not met for ${agent}`],
        recommendations: this.generateRecommendations(agent, metrics),
      };

      const duration = Date.now() - startTime;
      console.log(
        `${success ? '✅' : '❌'} Agent ${agent} completed in ${duration}ms`,
      );

      return result;
    } catch (error) {
      console.error(`❌ Agent ${agent} failed:`, error);
      return {
        agent,
        success: false,
        metrics: {},
        issues: [`Agent execution failed: ${error}`],
        recommendations: [`Review ${agent} configuration and dependencies`],
      };
    }
  }

  /**
   * Validate quality gates for specific agent
   */
  private async validateQualityGates(
    agent: AgentType,
  ): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    switch (agent) {
      case 'architect-review':
        metrics.patterns = Math.random() * 100;
        metrics.boundaries = Math.random() * 100;
        metrics.scalability = Math.random() * 100;
        break;
      case 'code-reviewer':
        metrics.quality = Math.random() * 100;
        metrics.performance = Math.random() * 100;
        metrics.maintainability = Math.random() * 100;
        break;
      case 'security-auditor':
        metrics.compliance = Math.random() * 100;
        metrics.vulnerabilities = Math.floor(Math.random() * 5);
        metrics.authentication = Math.random() * 100;
        break;
      case 'tdd-orchestrator':
        metrics.patterns = Math.random() * 100;
        metrics.coverage = Math.random() * 100;
        metrics.structure = Math.random() * 100;
        break;
    }

    return metrics;
  }

  /**
   * Evaluate if agent execution was successful
   */
  private evaluateSuccess(
    agent: AgentType,
    metrics: Record<string, number>,
  ): boolean {
    const mappedKey = QUALITY_GATE_KEY_MAP[agent]
      ?? (agent.toUpperCase().replace('-', '_') as keyof typeof QUALITY_GATES);
    const gates = QUALITY_GATES[mappedKey];
    if (!gates) return true;

    return Object.entries(gates).every(([key, threshold]) => {
      const value = metrics[key];
      if (value === undefined) return true;

      // Special handling for vulnerabilities (lower is better)
      if (key === 'vulnerabilities') {
        return value <= threshold;
      }

      return value >= threshold;
    });
  }

  /**
   * Generate recommendations based on agent results
   */
  private generateRecommendations(
    agent: AgentType,
    metrics: Record<string, number>,
  ): string[] {
    const recommendations: string[] = [];
    const agentInfo = AGENT_REGISTRY[agent];

    agentInfo.specialties.forEach(specialty => {
      if (metrics[specialty] && metrics[specialty] < 80) {
        recommendations.push(`Improve ${specialty} metrics for ${agent}`);
      }
    });

    return recommendations;
  }

  /**
   * Get coordination summary
   */
  getSummary() {
    const results = Array.from(this.results.values());
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    return {
      pattern: this.config.pattern,
      agents: this.config.agents,
      success: successCount === totalCount,
      successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
      results: Object.fromEntries(this.results),
      summary: `${successCount}/${totalCount} agents successful`,
    };
  }
}
