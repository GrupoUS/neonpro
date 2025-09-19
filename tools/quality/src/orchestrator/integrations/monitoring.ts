/**
 * 📊 Monitoring Integration for TDD Orchestrator
 * ==============================================
 * 
 * Integrates the TDD Orchestrator with the monitoring package to track
 * performance metrics, execution times, and orchestration health.
 */

import { globalPerformanceTracker } from '../../../../../packages/monitoring/src/performance/tracker';
import { 
  OrchestrationState, 
  TDDPhase, 
  AgentName, 
  OrchestrationMetrics
} from '../types';

export interface OrchestrationMonitoringConfig {
  enablePerformanceTracking: boolean;
  enableMetricsCollection: boolean;
  trackAgentExecution: boolean;
  trackPhaseTransitions: boolean;
}

export class OrchestrationMonitoring {
  private config: OrchestrationMonitoringConfig;
  private activeTimers: Map<string, string> = new Map();

  constructor(config: OrchestrationMonitoringConfig) {
    this.config = config;
  }

  /**
   * Start tracking an orchestration workflow
   */
  startOrchestrationTracking(orchestrationId: string, _workflowType: string): void {
    if (!this.config.enablePerformanceTracking) return;

    const timerKey = `orchestration-${orchestrationId}`;
    globalPerformanceTracker.startTimer(timerKey);
    this.activeTimers.set(orchestrationId, timerKey);
  }

  /**
   * End tracking an orchestration workflow
   */
  endOrchestrationTracking(
    orchestrationId: string, 
    state: OrchestrationState
  ): number {
    if (!this.config.enablePerformanceTracking) return 0;

    const timerKey = this.activeTimers.get(orchestrationId);
    if (!timerKey) return 0;

    const duration = globalPerformanceTracker.endTimer(timerKey, {
      workflow_type: state.workflow,
      feature_name: state.feature.name,
      feature_complexity: state.feature.complexity.toString(),
      total_agents: state.agents.completed.length.toString(),
      final_phase: state.tddCycle.phase
    });

    this.activeTimers.delete(orchestrationId);
    return duration;
  }

  /**
   * Track TDD phase execution
   */
  trackPhaseExecution(
    orchestrationId: string,
    phase: TDDPhase,
    callback: () => Promise<void>
  ): Promise<void> {
    if (!this.config.trackPhaseTransitions) {
      return callback();
    }

    const timerKey = `phase-${orchestrationId}-${phase}`;
    return globalPerformanceTracker.measureAsync(
      timerKey,
      callback,
      {
        orchestration_id: orchestrationId,
        phase: phase
      }
    );
  }

  /**
   * Track individual agent execution
   */
  trackAgentExecution<T>(
    orchestrationId: string,
    agentName: AgentName,
    phase: TDDPhase,
    callback: () => Promise<T>
  ): Promise<T> {
    if (!this.config.trackAgentExecution) {
      return callback();
    }

    const timerKey = `agent-${agentName}-${phase}`;
    return globalPerformanceTracker.measureAsync(
      timerKey,
      callback,
      {
        orchestration_id: orchestrationId,
        agent_name: agentName,
        phase: phase
      }
    );
  }

  /**
   * Generate orchestration metrics
   */
  generateOrchestrationMetrics(state: OrchestrationState): OrchestrationMetrics {
    const now = new Date();
    const totalDuration = now.getTime() - state.createdAt.getTime();

    return {
      orchestrationId: state.id,
      workflow: state.workflow,
      feature: state.feature.name,
      totalDuration,
      phaseDurations: this.calculatePhaseDurations(state),
      agentDurations: this.calculateAgentDurations(state),
      qualityGateResults: state.qualityGates,
      findingsCount: this.countFindings(state),
      recommendationsCount: this.countRecommendations(state),
      success: this.isOrchestrationSuccessful(state),
      timestamp: now
    };
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics() {
    return globalPerformanceTracker.getCurrentMetrics();
  }

  private getCompletedPhases(_state: OrchestrationState): string[] {
    // This would track which phases have been completed
    // For now, return empty array as phase tracking needs to be implemented
    return [];
  }

  private countPassedQualityGates(state: OrchestrationState): number {
    return Object.values(state.qualityGates).filter(status => status === 'passed').length;
  }

  private countFailedQualityGates(state: OrchestrationState): number {
    return Object.values(state.qualityGates).filter(status => status === 'failed').length;
  }

  private calculatePhaseDurations(_state: OrchestrationState): Record<TDDPhase, number> {
    // For now, return empty durations - this would need to be tracked during execution
    return {
      red: 0,
      green: 0,
      refactor: 0
    };
  }

  private calculateAgentDurations(_state: OrchestrationState): Record<AgentName, number> {
    // For now, return empty durations - this would need to be tracked during execution
    return {
      'apex-dev': 0,
      'test': 0,
      'compliance-validator': 0,
      'code-reviewer': 0,
      'architect-review': 0,
      'security-auditor': 0
    };
  }

  private countFindings(_state: OrchestrationState): Record<string, number> {
    // For now, return empty counts - this would need to be aggregated from agent results
    return {};
  }

  private countRecommendations(_state: OrchestrationState): Record<string, number> {
    // For now, return empty counts - this would need to be aggregated from agent results
    return {};
  }

  private isOrchestrationSuccessful(state: OrchestrationState): boolean {
    // Check if all quality gates passed and no agents failed
    const allQualityGatesPassed = Object.values(state.qualityGates).every(
      status => status === 'passed' || status === 'skipped'
    );
    const noFailedAgents = state.agents.failed.length === 0;
    
    return allQualityGatesPassed && noFailedAgents;
  }
}

// Default configuration
export const defaultMonitoringConfig: OrchestrationMonitoringConfig = {
  enablePerformanceTracking: true,
  enableMetricsCollection: true,
  trackAgentExecution: true,
  trackPhaseTransitions: true
};

// Singleton instance
export const orchestrationMonitoring = new OrchestrationMonitoring(defaultMonitoringConfig);