import { EventEmitter } from 'events';
import type {
  AgentName,
  TDDPhase,
  AgentResult,
  FeatureContext,
  Finding,
  Recommendation,
  QualityGateStatus
} from '../types';

// Extended agent state for individual agent tracking
interface ExtendedAgentState {
  status: 'idle' | 'running' | 'error';
  currentPhase: TDDPhase | null;
  lastExecution: string | null;
  metrics: Record<string, any>;
  errors: Array<{
    message: string;
    timestamp: string;
    phase?: TDDPhase;
    context?: string;
  }>;
}

/**
 * Base abstract class for all TDD agents
 * Provides common functionality and enforces interface contracts
 */
export abstract class BaseAgent extends EventEmitter {
  protected readonly agentType: AgentName;
  protected state: ExtendedAgentState;
  protected context: FeatureContext | null = null;
  protected startTime: number = 0;
  protected metrics: Record<string, any> = {};

  constructor(agentType: AgentName) {
    super();
    this.agentType = agentType;
    this.state = {
      status: 'idle',
      currentPhase: null,
      lastExecution: null,
      metrics: {},
      errors: []
    };
  }

  /**
   * Get agent type
   */
  getType(): AgentName {
    return this.agentType;
  }

  /**
   * Get current agent state
   */
  getState(): ExtendedAgentState {
    return { ...this.state };
  }

  /**
   * Check if agent can handle the given phase
   */
  abstract canHandle(phase: TDDPhase, context: FeatureContext): boolean;

  /**
   * Execute agent for the given phase and context
   */
  async execute(phase: TDDPhase, context: FeatureContext): Promise<AgentResult> {
    this.startTime = Date.now();
    this.context = context;
    
    try {
      this.updateState('running', phase);
      this.emit('execution:started', { agent: this.agentType, phase, context });

      // Validate prerequisites
      await this.validatePrerequisites(phase, context);

      // Execute main logic
      const result = await this.executePhase(phase, context);

      // Post-process results
      const processedResult = await this.postProcess(result, phase, context);

      this.updateState('idle', null);
      this.emit('execution:completed', { agent: this.agentType, phase, result: processedResult });

      return processedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.state.errors.push({
        message: errorMessage,
        timestamp: new Date().toISOString(),
        phase,
        context: context.name
      });

      this.updateState('error', phase);
      this.emit('execution:failed', { agent: this.agentType, phase, error: errorMessage });

      return {
        agent: this.agentType,
        phase,
        status: 'failure',
        findings: [],
        recommendations: [{
          type: 'error',
          description: `Agent execution failed: ${errorMessage}`,
          priority: 'high',
          action: 'Review and fix the underlying issue'
        }],
        metrics: this.collectMetrics(),
        duration: Date.now() - this.startTime,
        timestamp: new Date()
      };
    }
  }

  /**
   * Abstract method for phase-specific execution
   */
  protected abstract executePhase(phase: TDDPhase, context: FeatureContext): Promise<AgentResult>;

  /**
   * Validate prerequisites before execution
   */
  protected async validatePrerequisites(phase: TDDPhase, context: FeatureContext): Promise<void> {
    if (!context.name || !context.description) {
      throw new Error('Invalid context: name and description are required');
    }

    if (!this.canHandle(phase, context)) {
      throw new Error(`Agent ${this.agentType} cannot handle phase ${phase}`);
    }
  }

  /**
   * Post-process results after execution
   */
  protected async postProcess(result: AgentResult, phase: TDDPhase, context: FeatureContext): Promise<AgentResult> {
    // Add execution metrics
    result.metrics = {
      ...result.metrics,
      ...this.collectMetrics()
    };

    // Validate result structure
    this.validateResult(result);

    return result;
  }

  /**
   * Validate agent result
   */
  protected validateResult(result: AgentResult): boolean {
    try {
      // Validate basic structure
      if (!result || typeof result !== 'object') {
        return false;
      }

      // Validate required fields
      if (!result.agent || !result.status) {
        return false;
      }

      // Validate status values
      const validStatuses = ['success', 'failure', 'skipped'];
      if (!validStatuses.includes(result.status)) {
        return false;
      }

      // Validate findings structure
      if (result.findings && Array.isArray(result.findings)) {
        for (const finding of result.findings) {
          if (!finding.type || !finding.severity || !finding.description) {
            return false;
          }
        }
      }

      // Validate recommendations structure
      if (result.recommendations && Array.isArray(result.recommendations)) {
        for (const rec of result.recommendations) {
          if (!rec.type || !rec.priority || !rec.description || !rec.action) {
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      this.emit('error', new Error(`Result validation failed: ${error}`));
      return false;
    }
  }

  /**
   * Update agent state
   */
  protected updateState(status: ExtendedAgentState['status'], phase: TDDPhase | null): void {
    this.state = {
      ...this.state,
      status,
      currentPhase: phase,
      lastExecution: status === 'idle' ? new Date().toISOString() : this.state.lastExecution
    };
  }

  /**
   * Collect execution metrics
   */
  protected collectMetrics(): Record<string, any> {
    const executionTime = Date.now() - this.startTime;
    
    return {
      executionTime,
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
      ...this.metrics
    };
  }

  /**
   * Create a standardized finding
   */
  protected createFinding(
    type: Finding['type'],
    description: string,
    severity: Finding['severity'] = 'medium',
    location: string = '',
    suggestion: string = ''
  ): Finding {
    return {
      type,
      severity,
      description,
      location,
      suggestion
    };
  }

  /**
   * Create a standardized recommendation
   */
  protected createRecommendation(
    type: Recommendation['type'],
    description: string,
    priority: Recommendation['priority'] = 'medium',
    action: string = 'Review and implement suggested changes'
  ): Recommendation {
    return {
      type,
      priority,
      description,
      action
    };
  }

  /**
   * Reset agent state
   */
  reset(): void {
    this.state = {
      status: 'idle',
      currentPhase: null,
      lastExecution: null,
      metrics: {},
      errors: []
    };
    this.context = null;
    this.metrics = {};
  }

  /**
   * Get agent capabilities
   */
  abstract getCapabilities(): string[];

  /**
   * Get agent configuration
   */
  abstract getConfiguration(): Record<string, any>;
}