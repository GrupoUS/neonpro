/**
 * 🎭 TDD Orchestrator Core
 * ========================
 *
 * Main orchestrator class that coordinates multi-agent TDD workflows
 */

import { EventEmitter } from "events";
import {
  OrchestrationState,
  FeatureContext,
  TDDPhase,
  AgentName,
  WorkflowType,
  AgentResult,
  OrchestratorEvent,
  OrchestrationMetrics,
  OrchestratorConfig,
  normalizeDomain,
  normalizeComplexity,
} from "./types";
import { AgentRegistry } from "./agent-registry";
import { WorkflowEngine } from "./workflow-engine";
import { QualityGatesSystem } from "./quality-gates";
import { CommunicationSystem } from "./communication";

export class TDDOrchestrator extends EventEmitter {
  private registry: AgentRegistry;
  private workflowEngine: WorkflowEngine;
  private qualityGates: QualityGatesSystem;
  private communication: CommunicationSystem;
  private activeOrchestrations: Map<string, OrchestrationState> = new Map();
  private config: OrchestratorConfig;

  constructor(config: OrchestratorConfig) {
    super();
    this.config = config;
    this.registry = new AgentRegistry();
    this.workflowEngine = new WorkflowEngine({
      workflows: config.workflows,
      defaultTimeout: 30000,
      retryAttempts: 3,
    });
    this.qualityGates = new QualityGatesSystem(config.qualityGates);
    this.communication = new CommunicationSystem(config.communication);

    this.setupEventHandlers();
  }

  /**
   * Start a new TDD orchestration for a feature
   */
  async orchestrateFeature(
    feature: FeatureContext,
    workflowType?: WorkflowType,
  ): Promise<string> {
    const orchestrationId = this.generateOrchestrationId();

    // Determine workflow type if not specified
    const workflow = workflowType || this.determineWorkflowType(feature);

    // Select appropriate agents
    const selectedAgents = this.registry.selectAgentsForFeature(feature);

    // Create orchestration state
    const state: OrchestrationState = {
      id: orchestrationId,
      feature,
      workflow,
      tddCycle: {
        phase: "red",
        iteration: 1,
        testStatus: "failing",
        startTime: new Date(),
        phaseStartTime: new Date(),
      },
      agents: {
        active: [],
        completed: [],
        pending: selectedAgents,
        failed: [],
      },
      qualityGates: {
        architecture: "pending",
        security: "pending",
        codeQuality: "pending",
        testCoverage: "pending",
        performance: "pending",
        compliance: "pending",
      },
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.activeOrchestrations.set(orchestrationId, state);

    // Emit workflow started event
    this.emitEvent("workflow-started", orchestrationId, {
      feature: feature.name,
      workflow,
      agents: selectedAgents,
    });

    // Start the TDD cycle
    await this.executeTDDCycle(orchestrationId);

    return orchestrationId;
  }

  /**
   * Execute the complete TDD cycle (Red-Green-Refactor)
   */
  private async executeTDDCycle(orchestrationId: string): Promise<void> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) {
      throw new Error(`Orchestration not found: ${orchestrationId}`);
    }

    const phases: TDDPhase[] = ["red", "green", "refactor"];

    for (const phase of phases) {
      await this.executePhase(orchestrationId, phase);

      // Check if we should continue to next phase
      if (!(await this.shouldContinueToNextPhase(orchestrationId, phase))) {
        break;
      }
    }

    // Complete the orchestration
    await this.completeOrchestration(orchestrationId);
  }

  /**
   * Execute a specific TDD phase
   */
  private async executePhase(
    orchestrationId: string,
    phase: TDDPhase,
  ): Promise<void> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) return;

    // Update phase
    state.tddCycle.phase = phase;
    state.tddCycle.phaseStartTime = new Date();
    state.updatedAt = new Date();

    this.emitEvent("phase-changed", orchestrationId, { phase });

    // Get workflow configuration for this phase
    const workflowConfig = this.workflowEngine.getWorkflowConfig(
      state.workflow,
    );
    const _phaseConfig = workflowConfig.phases[phase];

    // Execute agents for this phase
    const agentsForPhase = state.agents.pending.filter((agent) => {
      const agentCapabilities = this.registry.getAgent(agent);
      return agentCapabilities?.phases.includes(phase);
    });

    // Resolve dependencies
    const orderedAgents = this.registry.resolveDependencies(agentsForPhase);

    // Execute sequential agents first
    const sequentialAgents = this.registry.getSequentialAgents(
      phase,
      orderedAgents,
    );
    for (const agent of sequentialAgents) {
      await this.executeAgent(orchestrationId, agent, phase);
    }

    // Execute parallelizable agents
    const parallelAgents = this.registry.getParallelizableAgents(
      phase,
      orderedAgents,
    );
    if (parallelAgents.length > 0) {
      await Promise.all(
        parallelAgents.map((agent) =>
          this.executeAgent(orchestrationId, agent, phase),
        ),
      );
    }

    // Validate quality gates for this phase
    await this.validatePhaseQualityGates(orchestrationId, phase);
  }

  /**
   * Execute a specific agent
   */
  private async executeAgent(
    orchestrationId: string,
    agentName: AgentName,
    phase: TDDPhase,
  ): Promise<AgentResult> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) {
      throw new Error(`Orchestration not found: ${orchestrationId}`);
    }

    // Move agent to active
    state.agents.pending = state.agents.pending.filter((a) => a !== agentName);
    state.agents.active.push(agentName);
    state.updatedAt = new Date();

    const startTime = Date.now();

    try {
      // Get agent configuration
      const agentConfig = this.config.agents[agentName];
      if (!agentConfig.enabled) {
        throw new Error(`Agent ${agentName} is disabled`);
      }

      // Execute agent through workflow engine
      const transformedAgentConfig = {
        enabled: agentConfig.enabled,
        timeout: agentConfig.timeout,
        retryAttempts: agentConfig.retries,
        capabilities: [],
        triggers: [],
      };

      const result = await this.workflowEngine.executeAgent(
        agentName,
        phase,
        state,
        transformedAgentConfig,
      );

      // Move agent to completed
      state.agents.active = state.agents.active.filter((a) => a !== agentName);
      state.agents.completed.push(agentName);

      this.emitEvent("agent-completed", orchestrationId, {
        agent: agentName,
        phase,
        status: result.status,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      // Move agent to failed
      state.agents.active = state.agents.active.filter((a) => a !== agentName);
      state.agents.failed.push(agentName);

      const _result: AgentResult = {
        agent: agentName,
        phase,
        status: "failure",
        findings: [],
        recommendations: [],
        metrics: {},
        duration: Date.now() - startTime,
        timestamp: new Date(),
      };

      this.emitEvent("agent-completed", orchestrationId, {
        agent: agentName,
        phase,
        status: "failure",
        error: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  }

  /**
   * Validate quality gates for a phase
   */
  private async validatePhaseQualityGates(
    orchestrationId: string,
    phase: TDDPhase,
  ): Promise<void> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) return;

    const workflowConfig = this.workflowEngine.getWorkflowConfig(
      state.workflow,
    );
    const _phaseConfig = workflowConfig.phases[phase];

    const gates = await this.qualityGates.validatePhase(
      phase,
      this.getAgentResults(orchestrationId, phase),
      state.feature,
    );

    // Update state with all quality gate results
    state.qualityGates = gates;

    // Check if any critical gates failed
    const passedGates = this.qualityGates.areQualityGatesPassed(gates);
    if (!passedGates) {
      this.emitEvent("quality-gate-failed", orchestrationId, {
        gate: "multiple",
        phase,
      });

      // Check if any failed gates are critical for this phase
      const criticalFailures = Object.entries(gates).filter(
        ([gateName, status]) =>
          status === "failed" && this.isGateCritical(gateName, phase),
      );

      if (criticalFailures.length > 0) {
        throw new Error(
          `Critical quality gates failed in ${phase} phase: ${criticalFailures.map(([name]) => name).join(", ")}`,
        );
      }
    }

    state.updatedAt = new Date();
  }

  /**
   * Check if we should continue to the next phase
   */
  private async shouldContinueToNextPhase(
    orchestrationId: string,
    currentPhase: TDDPhase,
  ): Promise<boolean> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) return false;

    // Check if all agents completed successfully
    const hasFailedAgents = state.agents.failed.length > 0;
    if (hasFailedAgents) {
      return false;
    }

    // Check critical quality gates
    const criticalGatesFailed = Object.entries(state.qualityGates).some(
      ([gate, status]) =>
        this.isGateCritical(gate, currentPhase) && status === "failed",
    );

    return !criticalGatesFailed;
  }

  /**
   * Complete the orchestration
   */
  private async completeOrchestration(orchestrationId: string): Promise<void> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) return;

    // Generate metrics
    const metrics = this.generateMetrics(orchestrationId);

    // Store results
    state.metadata.metrics = metrics;
    state.metadata.completedAt = new Date();
    state.updatedAt = new Date();

    this.emitEvent("workflow-completed", orchestrationId, {
      success: state.agents.failed.length === 0,
      metrics,
    });

    // Clean up (optional - keep for debugging/analysis)
    // this.activeOrchestrations.delete(orchestrationId);
  }

  /**
   * Get orchestration state
   */
  getOrchestrationState(
    orchestrationId: string,
  ): OrchestrationState | undefined {
    return this.activeOrchestrations.get(orchestrationId);
  }

  /**
   * Get all active orchestrations
   */
  getActiveOrchestrations(): OrchestrationState[] {
    return Array.from(this.activeOrchestrations.values());
  }

  /**
   * Cancel an orchestration
   */
  async cancelOrchestration(orchestrationId: string): Promise<void> {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) return;

    // Cancel any active agents
    // Implementation depends on how agents are executed

    this.activeOrchestrations.delete(orchestrationId);
  }

  // Private helper methods

  private generateOrchestrationId(): string {
    return `tdd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineWorkflowType(feature: FeatureContext): WorkflowType {
    if (feature.securityCritical || feature.complianceRequirements.length > 0) {
      return "security-critical";
    }

    const domainArray = normalizeDomain(feature.domain);
    if (
      domainArray.some(
        (d: string) => d.includes("microservice") || d.includes("api"),
      )
    ) {
      return "microservices";
    }

    if (domainArray.some((d: string) => d.includes("legacy"))) {
      return "legacy";
    }

    return "standard";
  }

  private setupEventHandlers(): void {
    // Setup internal event handlers
    this.on("error", (error) => {
      console.error("TDD Orchestrator Error:", error);
    });
  }

  private emitEvent(
    type: OrchestratorEvent["type"],
    orchestrationId: string,
    data: Record<string, any>,
  ): void {
    const event: OrchestratorEvent = {
      type,
      orchestrationId,
      timestamp: new Date(),
      data,
    };

    this.emit(type, event);
    this.emit("event", event);
  }

  private getAgentResults(
    orchestrationId: string,
    phase: TDDPhase,
  ): AgentResult[] {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state || !state.metadata.agentResults) return [];

    return (state.metadata.agentResults as AgentResult[]).filter(
      (result) => result.phase === phase,
    );
  }

  private isGateCritical(gateType: string, phase: TDDPhase): boolean {
    // Define which gates are critical for each phase
    const criticalGates = {
      red: ["testCoverage"],
      green: ["testCoverage", "security"],
      refactor: ["codeQuality", "performance"],
    };

    return criticalGates[phase]?.includes(gateType) || false;
  }

  private generateMetrics(orchestrationId: string): OrchestrationMetrics {
    const state = this.activeOrchestrations.get(orchestrationId);
    if (!state) {
      throw new Error(`Orchestration not found: ${orchestrationId}`);
    }

    const now = new Date();
    const totalDuration = now.getTime() - state.createdAt.getTime();

    return {
      orchestrationId,
      workflow: state.workflow,
      feature: state.feature.name,
      totalDuration,
      phaseDurations: {
        red: 0, // Calculate from phase transitions
        green: 0,
        refactor: 0,
      },
      agentDurations: {
        "apex-dev": 0,
        test: 0,
        "compliance-validator": 0,
        "code-reviewer": 0,
        "architect-review": 0,
        "security-auditor": 0,
      },
      qualityGateResults: state.qualityGates,
      findingsCount: {},
      recommendationsCount: {},
      success: state.agents.failed.length === 0,
      timestamp: now,
    };
  }
}
